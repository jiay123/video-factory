# -*- coding: utf-8 -*-
"""第34集 universal-modder —— 数字来自 GitHub API 实测（2026-10-21 实测存档）：
  rehan-remade/universal-modder  ★8548  fork943  MIT
  建仓 2026-09-30（今天第21天） 最后push 2026-10-21
  desc: "Point Claude at any game. Skills, tools and the fal MCP that let
  Claude Code mod almost any PC game you own: recon, reverse engineering,
  fal-generated art/3D/audio, in-game testing, showcase videos."

  10/21 老贾定调（第一幕重做，照第24集Pipecat样板）：
    ① 前3~4秒必须把钩子说完，"不能开头的慢慢介绍，观众都划走了"
    ② 铺垫小字依次从嘴里飞出 → 项目名压在最后砸下来
    ③ 数字要跟GitHub实测一致（旧稿念的8268星已过期，10/21实测8548）
  → seg1 改成"钩子先行"：把游戏丢给Claude→改出新玩法→星数→他叫universal modder
    旧稿"八千二百六十八颗星，九月三十号建仓，十八天"开头 = 前4.9秒才讲到钩子，划走率高
"""
import asyncio
import io
import json
import os
import subprocess

import edge_tts

BASE = r"D:\视频探索\remotion-ep34"
OUT = os.path.join(BASE, "src", "audio")
AUDIO = os.path.join(OUT, "ep34.mp3")

segments = [
    "游戏丢给Claude，它自己给你改出新玩法。他叫universal modder。八千五百四十八颗星。",
    "它这套东西全部免费白嫖，口号就一句：让Claude直接改游戏。不是让它写份攻略，是让它真的进游戏里动手。",
    "它先摸清游戏里有什么，再反向看代码，然后自己生成美术和音效，装进游戏里试一遍。Python写的，Claude和fal都能接。",
    "坑说清楚：它得是你自己买过的游戏，改的也是你自己那份文件。工具再好也得自己会看。",
    "不想折腾也有笨办法：它带了一百多个现成的技能包，不想自己折腾就直接抄过来用。",
    "协议是 MIT，能商用。你最想让AI改哪个游戏？评论区报个数。关注我，火柴人老贾。",
]
GAP = 0.12
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
        prev_t = out[-1]["t"] if out else 0.0
        for gch in tail:
            if gch in PUNCT:
                out.append({"c": gch, "t": round(prev_t, 3)})
            else:
                prev_t = round(prev_t + 0.10, 3)
                out.append({"c": gch, "t": prev_t})
    return out


def probe(path):
    cmd = 'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "%s"' % path
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding="utf-8")
    return float(r.stdout.strip())


async def main():
    os.makedirs(OUT, exist_ok=True)
    raws, allm = [], []
    for i, text in enumerate(segments, 1):
        p = os.path.join(OUT, "r%02d.mp3" % i)
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
        await asyncio.sleep(0.8)

    pads = []
    for i, raw in enumerate(raws, 1):
        p = os.path.join(OUT, "p%02d.mp3" % i)
        af = "volume=1.5" if i == 1 else "adelay=%d:all=1,volume=1.5" % int(GAP * 1000)
        subprocess.run(["ffmpeg", "-y", "-i", raw, "-af", af, "-ar", "44100", p],
                       check=True, capture_output=True)
        pads.append(p)

    cp = os.path.join(OUT, "concat2.txt")
    with io.open(cp, "w", encoding="utf-8", newline="\n") as f:
        for p in pads:
            f.write("file '%s'\n" % p.replace("\\", "/"))
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", cp,
                    "-c", "copy", AUDIO], check=True, capture_output=True)

    cues, total = [], 0.0
    for i in range(1, len(segments) + 1):
        d = probe(os.path.join(OUT, "r%02d.mp3" % i))
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

    with io.open(os.path.join(BASE, "src", "chars.json"), "w", encoding="utf-8") as f:
        json.dump(cues, f, ensure_ascii=False, indent=1)

    for i in range(1, len(segments) + 1):
        for pat in ("r", "p"):
            q = os.path.join(OUT, "%s%02d.mp3" % (pat, i))
            if os.path.exists(q):
                os.remove(q)
    os.remove(cp)
    print("chars.json 已写, 总时长=%.2f" % total)


asyncio.run(main())