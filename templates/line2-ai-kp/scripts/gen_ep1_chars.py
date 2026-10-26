# -*- coding: utf-8 -*-
"""为横屏《什么是神经网络》生成两样东西，都不动原音频、不动时间轴：
1) 词级时间戳 -> src/ep1Chars.ts（每个显示字符的点亮时刻，秒）
2) 响度归一音频 -> public/audio_norm/eXX.wav（-16 LUFS / TP -1.5dB，时长不变）
"""
import re, os, io, sys, json, asyncio, subprocess

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

PROJ = r"D:\视频探索\remotion-ai-kp2"
SCRIPT_TS = os.path.join(PROJ, "src", "ep1Script.ts")
SRC_AUDIO = os.path.join(PROJ, "public", "audio")
OUT_AUDIO = os.path.join(PROJ, "public", "audio_norm")
os.makedirs(OUT_AUDIO, exist_ok=True)

VOICE = "zh-CN-YunxiNeural"
RATE = "+6%"

# ---- 1) 解析 SCRIPT ----
src = io.open(SCRIPT_TS, encoding="utf-8").read()
block = src[src.index("SCRIPT: { cn: string; en: string }[] = ["):]
block = block[: block.index("\n];")]
items = re.findall(r"\{\s*cn:\s*'((?:[^'\\]|\\.)*)'\s*,\s*\n\s*en:\s*(['\"])(?:.*?)\2\s*\}", block, re.S)
CN = []
for raw, _ in items:
    CN.append(raw.replace("\\n", "\n").replace("\\'", "'").replace('\\"', '"'))
print("解析到文案段数:", len(CN))
assert len(CN) == 20, "段数不对"

# ---- 2) 请求词边界（不保存音频） ----
async def get_words(text):
    import edge_tts
    c = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
    out = []
    async for ch in c.stream():
        if ch["type"] == "WordBoundary":
            out.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "text": ch["text"]})
    return out

def build_char_times(flat, words, dur):
    n = len(flat)
    times = [None] * n
    pos = 0
    matched = 0
    for w in words:
        t = w["text"]
        if not t:
            continue
        k = flat.find(t, pos)
        if k < 0:
            k = flat.find(t)
        if k < 0:
            continue
        end = min(n, k + len(t))
        seg_n = max(1, end - k)
        for i in range(k, end):
            times[i] = w["t"] + w["d"] * ((i - k) / seg_n)
        pos = end
        matched += seg_n
    # 没覆盖到的字符：用它前/后最近的已分配时间
    last = 0.0
    for i in range(n):
        if times[i] is None:
            times[i] = last
        else:
            last = times[i]
    # 结尾若全空/越界，兜底成 dur-0.2
    for i in range(n):
        if times[i] is None or times[i] > dur:
            times[i] = max(0.0, dur - 0.2)
    return times, matched

async def main():
    all_chars = []
    ok = 0
    for i, cn in enumerate(CN):
        flat = cn.replace("\n", "")
        # 真实音频时长
        mp3 = os.path.join(SRC_AUDIO, f"e{i:02d}.mp3")
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                            "-of", "default=noprint_wrappers=1:nokey=1", mp3],
                           capture_output=True, text=True)
        dur = float(r.stdout.strip())
        words = []
        for att in range(4):
            try:
                words = await get_words(flat)
                break
            except Exception as e:
                print(f"  e{i:02d} retry{att}: {str(e)[:70]}")
                await asyncio.sleep(3)
        times, matched = build_char_times(flat, words, dur)
        cov = matched / max(1, len(flat))
        print("  e%02d dur=%5.2fs chars=%3d words=%3d cov=%3.0f%%" % (i, dur, len(flat), len(words), cov * 100))
        if cov < 0.5:
            print("    !! 覆盖率过低，检查文本是否与音频一致")
        all_chars.append([round(x, 3) for x in times])
        ok += 1
        await asyncio.sleep(0.3)
    return all_chars

AUDIO_ONLY = "--audio-only" in sys.argv
if not AUDIO_ONLY:
    chars = asyncio.run(main())

    # ---- 3) 写 src/ep1Chars.ts ----
    lines = ["// 自动生成，勿手改。由 gen_ep1_chars.py 生成：每个显示字符在本段音频里的点亮时刻（秒）。",
             "export const CHARS: number[][] = ["]
    for arr in chars:
        lines.append("  [" + ", ".join(str(x) for x in arr) + "],")
    lines.append("];")
    io.open(os.path.join(PROJ, "src", "ep1Chars.ts"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
    print("已写 src/ep1Chars.ts")

# ---- 4) 响度归一：两遍 loudnorm，输出 wav ----
def norm(src, dst):
    p1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af",
                         "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
                         "-f", "null", "NUL"], capture_output=True)
    err1 = p1.stderr.decode("utf-8", errors="replace")
    m = re.findall(r'\{[^{}]*"input_i"[^{}]*\}', err1, re.S)
    af = "loudnorm=I=-16:TP=-1.5:LRA=11"
    if m:
        d = json.loads(m[-1])
        af += (":measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true"
               % (d["input_i"], d["input_tp"], d["input_lra"], d["input_thresh"], d["target_offset"]))
    p2 = subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", src,
                         "-af", af, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", dst],
                        capture_output=True)
    return p2.returncode == 0 and os.path.exists(dst), af

print("\n响度归一：")
for i in range(len(CN)):
    s = os.path.join(SRC_AUDIO, f"e{i:02d}.mp3")
    d = os.path.join(OUT_AUDIO, f"e{i:02d}.wav")
    okk, af = norm(s, d)
    print("  e%02d -> %s %s" % (i, "OK" if okk else "FAIL", os.path.basename(d)))

print("\n完成。")
