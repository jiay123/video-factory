# -*- coding: utf-8 -*-
"""EP02：词级时间戳 -> src/ep2Chars.ts；响度归一 -> public/audio2_norm/eXX.wav"""
import re, os, io, sys, json, asyncio, subprocess
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

PROJ = r"D:\视频探索\remotion-ai-kp2"
SCRIPT_TS = os.path.join(PROJ, "src", "ep2Script.ts")
SRC_AUDIO = os.path.join(PROJ, "public", "audio2")
OUT_AUDIO = os.path.join(PROJ, "public", "audio2_norm")
os.makedirs(OUT_AUDIO, exist_ok=True)
VOICE, RATE = "zh-CN-YunxiNeural", "+6%"
AUDIO_ONLY = "--audio-only" in sys.argv

src = io.open(SCRIPT_TS, encoding="utf-8").read()
block = src[src.index("SCRIPT: { cn: string; en: string }[] = ["):]
block = block[: block.index("\n];")]
items = re.findall(r"\{\s*cn:\s*'((?:[^'\\]|\\.)*)'\s*,\s*\n\s*en:\s*(['\"])(?:.*?)\2\s*\}", block, re.S)
CN = [raw.replace("\\n", "\n").replace("\\'", "'").replace('\\"', '"') for raw, _ in items]
print("解析到文案段数:", len(CN))

async def get_words(text):
    import edge_tts
    c = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
    out = []
    async for ch in c.stream():
        if ch["type"] == "WordBoundary":
            out.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "text": ch["text"]})
    return out

def build_char_times(flat, words, dur):
    n = len(flat); times = [None] * n; pos = 0; matched = 0
    for w in words:
        t = w["text"]
        if not t: continue
        k = flat.find(t, pos)
        if k < 0: k = flat.find(t)
        if k < 0: continue
        end = min(n, k + len(t)); seg_n = max(1, end - k)
        for i in range(k, end):
            times[i] = w["t"] + w["d"] * ((i - k) / seg_n)
        pos = end; matched += seg_n
    last = 0.0
    for i in range(n):
        if times[i] is None: times[i] = last
        else: last = times[i]
    for i in range(n):
        if times[i] is None or times[i] > dur: times[i] = max(0.0, dur - 0.2)
    return times, matched

async def main():
    all_chars = []
    for i, cn in enumerate(CN):
        flat = cn.replace("\n", "")
        mp3 = os.path.join(SRC_AUDIO, f"e{i:02d}.mp3")
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                            "-of", "default=noprint_wrappers=1:nokey=1", mp3],
                           capture_output=True, text=True)
        dur = float(r.stdout.strip())
        words = []
        for att in range(5):
            try:
                words = await get_words(flat); break
            except Exception as e:
                print(f"  e{i:02d} retry{att}: {str(e)[:70]}"); await asyncio.sleep(3)
        times, matched = build_char_times(flat, words, dur)
        print("  e%02d dur=%5.2fs chars=%3d words=%3d cov=%3.0f%%" % (i, dur, len(flat), len(words), matched / max(1, len(flat)) * 100))
        all_chars.append([round(x, 3) for x in times])
        await asyncio.sleep(0.3)
    return all_chars

if not AUDIO_ONLY:
    chars = asyncio.run(main())
    out = ["// 自动生成，勿手改。由 gen_ep2_chars.py 生成：每个字符的点亮时刻（秒）。",
           "export const CHARS: number[][] = ["]
    for arr in chars:
        out.append("  [" + ", ".join(str(x) for x in arr) + "],")
    out.append("];")
    io.open(os.path.join(PROJ, "src", "ep2Chars.ts"), "w", encoding="utf-8").write("\n".join(out) + "\n")
    print("已写 src/ep2Chars.ts")

def norm(srcp, dst):
    p1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", srcp, "-af",
                         "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
                         "-f", "null", "NUL"], capture_output=True)
    m = re.findall(r'\{[^{}]*"input_i"[^{}]*\}', p1.stderr.decode("utf-8", errors="replace"), re.S)
    af = "loudnorm=I=-16:TP=-1.5:LRA=11"
    if m:
        d = json.loads(m[-1])
        af += (":measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true"
               % (d["input_i"], d["input_tp"], d["input_lra"], d["input_thresh"], d["target_offset"]))
    p2 = subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", srcp,
                         "-af", af, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", dst], capture_output=True)
    return p2.returncode == 0 and os.path.exists(dst)

print("\n响度归一：")
for i in range(len(CN)):
    ok = norm(os.path.join(SRC_AUDIO, f"e{i:02d}.mp3"), os.path.join(OUT_AUDIO, f"e{i:02d}.wav"))
    print("  e%02d -> %s" % (i, "OK" if ok else "FAIL"))
print("完成。")
