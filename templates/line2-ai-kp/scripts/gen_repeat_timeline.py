# -*- coding: utf-8 -*-
"""《重复》单一真源生成器：
从 src/repeatScript.ts 读文案
  -> edge-tts 生成男声配音（沉稳亲和 = zh-CN-YunyangNeural）
  -> 量每段真实时长
  -> 采集 WordBoundary 逐字/词时间戳
  -> 写 src/repeatTimeline.ts（DUR/T/F + 每段逐字 time）
配音、字幕、时间轴、逐字点亮四者必然一致。
"""
import re, os, io, sys, json, asyncio, subprocess
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

PROJ = r"D:\视频探索\remotion-ai-kp2"
SCRIPT_TS = os.path.join(PROJ, "src", "repeatScript.ts")
OUT = os.path.join(PROJ, "public", "audio_repeat")
os.makedirs(OUT, exist_ok=True)

# ---- 1) 解析 repeatScript.ts ----
src = io.open(SCRIPT_TS, encoding="utf-8").read()
block = src[src.index("SCRIPT: { cn: string; en: string }[] = ["):]
block = block[: block.index("\n];")]
items = re.findall(r"\{\s*cn:\s*'((?:[^'\\]|\\.)*)'\s*,\s*\n\s*en:\s*(['\"])(?:.*?)\2\s*\}", block, re.S)
CN = []
for raw, _ in items:
    t = raw.replace("\\n", "\n").replace("\\'", "'").replace('\\"', '"')
    CN.append(t)
print("解析到文案段数:", len(CN))
if len(CN) < 10:
    print("解析失败，退出"); sys.exit(1)

GAP = float(re.search(r"GAP\s*=\s*([\d.]+)", src).group(1))
print("段间停顿:", GAP, "秒")

VOICE = "zh-CN-YunyangNeural"   # 男声 · News/Professional/Reliable = 沉稳亲和

def probe(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=noprint_wrappers=1:nokey=1", p],
                       capture_output=True, text=True)
    return float(r.stdout.strip() or 0)

async def main():
    import edge_tts
    from edge_tts import SubMaker
    durs, all_chars = [], []
    for i, text in enumerate(CN):
        flat = text.replace("\n", "")
        mp3 = os.path.join(OUT, f"r{i:02d}.mp3")
        sub = SubMaker()
        ok = os.path.exists(mp3) and probe(mp3) > 0.1
        if not ok:
            for att in range(4):
                try:
                    sub = SubMaker()
                    com = edge_tts.Communicate(flat, VOICE, rate="+12%")
                    with open(mp3, "wb") as fh:
                        async for chunk in com.stream():
                            if chunk["type"] == "audio":
                                fh.write(chunk["data"])
                            elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
                                sub.feed(chunk)
                    break
                except Exception as e:
                    print(f"  seg{i} retry{att}: {str(e)[:80]}")
                    if os.path.exists(mp3):
                        os.remove(mp3)
                    await asyncio.sleep(4)
        d = probe(mp3)
        # 逐字时间戳（WordBoundary 是词级，中文基本= 字/词组）
        chars = []
        for cue in sub.cues:
            t = cue.start.total_seconds()
            chars.append({"c": cue.content, "t": round(t, 3)})
        durs.append(round(d, 3))
        all_chars.append(chars)
        print(f"  seg{i:02d}  {d:6.2f}s  chars={len(chars):2d}  {flat[:26]}")
    return durs, all_chars

durs, all_chars = asyncio.run(main())

# ---- 2) 时间轴：每段起始 T，段内含 GAP ----
T = [0.0]
for i, d in enumerate(durs):
    T.append(round(T[i] + d + (GAP if i < len(durs) - 1 else 0), 3))
total = T[-1]
print(f"\n总时长 {total:.2f}s  ({round(total*30)} 帧)")

# ---- 3) 写 src/repeatTimeline.ts ----
F = [round(t * 30) for t in T]
chars_ts = "export const CHARS: number[][][] = " + json.dumps(
    [[[round(c["t"], 3)] for c in seg] for seg in all_chars], ensure_ascii=False)
words_ts = "export const WORDS: { c: string; t: number }[][] = " + json.dumps(
    all_chars, ensure_ascii=False)
lines = [
    "// 自动生成，勿手改。由 gen_repeat_timeline.py 从 repeatScript.ts + 配音真实时长生成。",
    "export const DUR = [" + ", ".join(str(d) for d in durs) + "];",
    "export const T = [" + ", ".join(str(t) for t in T) + "];",
    "export const F = [" + ", ".join(str(f) for f in F) + "];",
    f"export const TOTAL_SEC = {total};",
    f"export const TOTAL_FRAMES = {round(total * 30)};",
    f"export const GAP = {GAP};",
    words_ts + ";",
]
io.open(os.path.join(PROJ, "src", "repeatTimeline.ts"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("已写 src/repeatTimeline.ts")
print("段落数", len(durs), "帧数", round(total * 30))
