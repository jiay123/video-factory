# -*- coding: utf-8 -*-
"""EP04《Agent 是怎么转圈的》20秒试片 · 配音 + 逐字时间戳
用法：python gen_chars_ep4.py
"""
import asyncio
import io
import json
import os
import subprocess

import edge_tts

BASE = r"D:\视频探索\remotion-ai-kp2"
TMP = os.path.join(BASE, "src", "audio_tmp_ep4")
OUTDIR = os.path.join(BASE, "public", "audio4")
AUDIO = os.path.join(OUTDIR, "ep04.mp3")
CHARS = os.path.join(BASE, "src", "ep4Chars.json")

segments = [
    "你只说一句话，AI 就能自己干活。",
    "它先把你的话，和整个项目，读进一条记忆条。",
    "然后就开始转圈：想、调工具、看结果、再想。",
    "这就是 AI Agent，一个会自己转圈的模型。关注我，火柴人老贾。",
]
GAP = 0.25
VOICE = "zh-CN-XiaoxiaoNeural"
PUNCT = "，。、：；！？（）《》“”‘’：， 　"


def chars_from_marks(text, marks):
    out = []
    pos = 0
    for m in marks:
        w = m["text"]
        idx = text.find(w, pos)
        if idx < 0:
            idx = pos
        if idx > pos and out:
            for gch in text[pos:idx]:
                if gch in PUNCT:
                    out.append({"c": gch, "t": round(out[-1]["t"], 3)})
        step = m["duration"] / max(1, len(w))
        for k, chx in enumerate(w):
            out.append({"c": chx, "t": round(m["offset"] + step * k, 3)})
        pos = idx + len(w)
    if pos < len(text):
        tail = text[pos:]
        last = out[-1]["t"] if out else 0.0
        prev_t = last
        for gch in tail:
            if gch in PUNCT:
                out.append({"c": gch, "t": round(prev_t, 3)})
            else:
                prev_t = round(prev_t + 0.10, 3)
                out.append({"c": gch, "t": prev_t})
    return out


def probe(path):
    cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{path}"'
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding="utf-8")
    return float(r.stdout.strip())


async def main():
    os.makedirs(TMP, exist_ok=True)
    os.makedirs(OUTDIR, exist_ok=True)
    raws, allm = [], []
    for i, text in enumerate(segments, 1):
        p = os.path.join(TMP, "r%02d.mp3" % i)
        done = False
        for attempt in range(8):
            try:
                c = edge_tts.Communicate(text, VOICE, boundary="WordBoundary")
                audio, ms = bytearray(), []
                async for ch in c.stream():
                    if ch["type"] == "audio":
                        audio += ch["data"]
                    elif ch["type"] == "WordBoundary":
                        ms.append({"text": ch["text"], "offset": ch["offset"] / 1e7,
                                   "duration": ch["duration"] / 1e7})
                if len(audio) > 500 and ms:
                    with open(p, "wb") as f:
                        f.write(audio)
                    raws.append(p)
                    allm.append(ms)
                    print("seg%d ok marks=%d" % (i, len(ms)))
                    done = True
                    break
            except Exception as e:
                print("seg%d retry %d %s" % (i, attempt + 1, type(e).__name__))
            await asyncio.sleep(2)
        if not done:
            raise SystemExit("FAIL seg%d" % i)
        await asyncio.sleep(0.6)

    pads = []
    for i, raw in enumerate(raws, 1):
        p = os.path.join(TMP, "p%02d.mp3" % i)
        af = "volume=1.5" if i == 1 else "adelay=%d:all=1,volume=1.5" % int(GAP * 1000)
        subprocess.run(["ffmpeg", "-y", "-i", raw, "-af", af, "-ar", "44100", p],
                       check=True, capture_output=True)
        pads.append(p)

    cp = os.path.join(TMP, "concat2.txt")
    with io.open(cp, "w", encoding="utf-8", newline="\n") as f:
        for p in pads:
            f.write("file '%s'\n" % p.replace("\\", "/"))
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", cp,
                    "-c", "copy", AUDIO], check=True, capture_output=True)

    cues, total = [], 0.0
    for i in range(1, len(segments) + 1):
        d = probe(os.path.join(TMP, "r%02d.mp3" % i))
        start = total
        ch = chars_from_marks(segments[i - 1], allm[i - 1])
        for c in ch:
            c["t"] = round(c["t"] + start, 3)
        cues.append({"i": i, "start": round(start, 3), "dur": round(d, 3),
                     "end": round(start + d, 3), "text": segments[i - 1], "chars": ch})
        total = start + d + (0 if i == len(segments) else GAP)

    bad = 0
    for c in cues:
        if "".join(x["c"] for x in c["chars"]) != c["text"]:
            bad += 1
            print("MISMATCH seg%d" % c["i"])
            print("  want:", ascii(c["text"]))
            print("  got :", ascii("".join(x["c"] for x in c["chars"])))
    for c in cues:
        prev = None
        for x in c["chars"]:
            if x["c"] in PUNCT:
                x["t"] = round(prev, 3) if prev is not None else x["t"]
                continue
            if prev is not None and x["t"] <= prev:
                x["t"] = round(prev + 0.03, 3)
            prev = x["t"]

    print("字符还原错误段数:", bad, "/", len(cues))
    if bad:
        raise SystemExit("仍有缺字，不写文件")

    with io.open(CHARS, "w", encoding="utf-8") as f:
        json.dump(cues, f, ensure_ascii=False, indent=1)

    for i in range(1, len(segments) + 1):
        for pat in ("r", "p"):
            q = os.path.join(TMP, "%s%02d.mp3" % (pat, i))
            if os.path.exists(q):
                os.remove(q)
    os.remove(cp)
    print("ep4Chars.json 已写, 总时长=%.2f" % total)
    for c in cues:
        print("  seg%d  %.2f -> %.2f  (%.2fs)  %s" % (c["i"], c["start"], c["end"], c["dur"], c["text"]))


asyncio.run(main())
