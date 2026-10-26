# -*- coding: utf-8 -*-
"""EP02v3 一键生成：文案 -> edge-tts 配音 -> 响度归一 -> 时间轴 -> 逐字字幕
用法：python scripts/gen_ep2v3_all.py
产物：public/audio3/e*.mp3（归一后，渲染直接用）
      src/ep2v3Timeline.ts（F/DUR/T/TOTAL_FRAMES）
      src/ep2v3Chars.ts（每字点亮时刻）
"""
import re, os, io, sys, json, asyncio, subprocess
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

PROJ = r"D:\视频探索\remotion-ai-kp2"
SCRIPT_TS = os.path.join(PROJ, "src", "ep2v3Script.ts")
RAW = os.path.join(PROJ, "public", "audio3_raw")
OUT = os.path.join(PROJ, "public", "audio3")
NORM = os.path.join(PROJ, "public", "audio3_norm")
for d in (RAW, OUT, NORM):
    os.makedirs(d, exist_ok=True)

VOICE = "zh-CN-YunxiNeural"
RATE = "+20%"
KEEP = "--keep" in sys.argv

src = io.open(SCRIPT_TS, encoding="utf-8").read()
block = src[src.index("SCRIPT: { cn: string }[] = ["):]
block = block[: block.index("\n];")]
CN = re.findall(r"\{\s*cn:\s*'((?:[^'\\]|\\.)*)'\s*\}", block, re.S)
CN = [c.replace("\\n", "").replace("\\'", "'").replace('\\"', '"') for c in CN]
print("文案段数:", len(CN))
if len(CN) != 7:
    print("!! 解析段数不是 7，检查 ep2v3Script.ts"); sys.exit(1)
GAP = float(re.search(r"GAP\s*=\s*([\d.]+)", src).group(1))
print("段间停顿:", GAP, "秒")


def probe(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=noprint_wrappers=1:nokey=1", p],
                       capture_output=True, text=True)
    try:
        return float(r.stdout.strip() or 0)
    except Exception:
        return 0.0


async def tts(text, path):
    import edge_tts
    await edge_tts.Communicate(text, VOICE, rate=RATE).save(path)


async def words(text):
    import edge_tts
    c = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
    out = []
    async for ch in c.stream():
        if ch["type"] == "WordBoundary":
            out.append((ch["offset"] / 1e7, ch["duration"] / 1e7, ch["text"]))
    return out


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
                         "-af", af, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", dst],
                        capture_output=True)
    return p2.returncode == 0 and os.path.exists(dst)


async def main():
    durs, chars = [], []
    for i, text in enumerate(CN):
        flat = text.replace("\n", "")
        raw = os.path.join(RAW, f"e{i}.mp3")
        ok = False
        if KEEP and os.path.exists(raw):
            print(f"  e{i} 复用已有配音")
            ok = True
        for att in range(5 if not ok else 0):
            try:
                if os.path.exists(raw):
                    os.remove(raw)
                await tts(flat, raw)
                ok = True
                break
            except Exception as e:
                print(f"  e{i} TTS retry{att}: {str(e)[:70]}")
                await asyncio.sleep(3)
        if not ok:
            print(f"  e{i} TTS 失败"); continue
        d = probe(raw)
        durs.append(round(d, 3))
        ws = []
        for att in range(5):
            try:
                ws = await words(flat)
                break
            except Exception as e:
                print(f"  e{i} word retry{att}: {str(e)[:60]}")
                await asyncio.sleep(2)
        times = [None] * len(flat)
        pos = 0
        matched = 0
        for (t, dd, wt) in ws:
            if not wt:
                continue
            k = flat.find(wt, pos)
            if k < 0:
                k = flat.find(wt)
            if k < 0:
                continue
            end = min(len(flat), k + len(wt))
            n = max(1, end - k)
            for j in range(k, end):
                times[j] = t + dd * ((j - k) / n)
            pos = end
            matched += end - k
        if matched < len(flat) * 0.95 or not all(
            times[j] is None or times[j + 1] is None or times[j] <= times[j + 1] + 0.001
            for j in range(len(flat) - 1)
        ):
            # edge-tts 词边界经常 429 拿不全 / 顺序乱 -> 按字数线性均分兜底，保证字幕跟得上嘴
            step = d / max(1, len(flat))
            times = [round(i * step, 3) for i in range(len(flat))]
            print(f"  e{i} 词边界不可用({matched}/{len(flat)}) -> 线性均分兜底")
        else:
            last = 0.0
            for j in range(len(flat)):
                if times[j] is None:
                    times[j] = last
                else:
                    last = times[j]
            for j in range(len(flat)):
                if times[j] > d:
                    times[j] = max(0.0, d - 0.2)
        chars.append([round(x, 3) for x in times])
        print(f"  e{i}  {d:5.2f}s  chars={len(flat):3d}  words={len(ws):3d}  {flat[:26]}")
        await asyncio.sleep(0.3)
    return durs, chars


durs, chars = asyncio.run(main())
if not durs:
    print("!! 没有生成任何配音"); sys.exit(1)

T = [0.0]
for i, d in enumerate(durs):
    T.append(round(T[i] + d + (GAP if i < len(durs) - 1 else 0), 3))
total = T[-1]
F = [round(t * 30) for t in T]
print(f"\n总时长 {total:.2f}s  ({round(total*30)} 帧 @30fps)")

lines = [
    "// 自动生成，勿手改。由 scripts/gen_ep2v3_all.py 生成。",
    "export const DUR = [" + ", ".join(str(d) for d in durs) + "];",
    "export const T = [" + ", ".join(str(t) for t in T) + "];",
    "export const F = [" + ", ".join(str(f) for f in F) + "];",
    f"export const TOTAL_SEC = {total};",
    f"export const TOTAL_FRAMES = {round(total * 30)};",
    f"export const GAP = {GAP};",
]
io.open(os.path.join(PROJ, "src", "ep2v3Timeline.ts"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("已写 src/ep2v3Timeline.ts")

out = ["// 自动生成，勿手改。由 scripts/gen_ep2v3_all.py 生成：每个字符的点亮时刻（秒）。",
       "export const CHARS: number[][] = ["]
for arr in chars:
    out.append("  [" + ", ".join(str(x) for x in arr) + "],")
out.append("];")
io.open(os.path.join(PROJ, "src", "ep2v3Chars.ts"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print("已写 src/ep2v3Chars.ts")

print("\n响度归一：")
for i in range(len(durs)):
    raw = os.path.join(RAW, f"e{i}.mp3")
    wav = os.path.join(NORM, f"e{i}.wav")
    mp3 = os.path.join(OUT, f"e{i}.mp3")
    if norm(raw, wav):
        subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", wav,
                        "-c:a", "libmp3lame", "-b:a", "128k", mp3], capture_output=True)
        print(f"  e{i} -> OK  {os.path.getsize(mp3)//1024}KB")
    else:
        print(f"  e{i} -> FAIL")
print("完成。")

