# -*- coding: utf-8 -*-
"""单一真源生成器：从 src/ep1Script.ts 读文案 -> 生成配音 -> 量真实时长 -> 写 src/ep1Timeline.ts
配音、字幕、时间轴三者必然一致。"""
import re, os, io, sys, json, asyncio, subprocess
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

PROJ = r"D:\视频探索\remotion-ai-kp2"
SCRIPT_TS = os.path.join(PROJ, "src", "ep1Script.ts")
OUT = os.path.join(PROJ, "public", "audio")
os.makedirs(OUT, exist_ok=True)

# ---- 1) 解析 ep1Script.ts 里的 SCRIPT ----
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

# ---- 2) edge-tts 生成配音 ----
VOICE = "zh-CN-YunxiNeural"   # 男声，科普更有说服力

def probe(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=noprint_wrappers=1:nokey=1", p],
                       capture_output=True, text=True)
    return float(r.stdout.strip() or 0)

async def main():
    import edge_tts
    durs = []
    for i, text in enumerate(CN):
        flat = text.replace("\n", "")
        mp3 = os.path.join(OUT, f"e{i:02d}.mp3")
        if os.path.exists(mp3) and probe(mp3) > 0.1:
            d = probe(mp3)
            durs.append(round(d, 3))
            print("  seg%02d  %6.2fs  (cache) %s" % (i, d, flat[:20]))
            continue
        for att in range(4):
            try:
                await edge_tts.Communicate(flat, VOICE, rate="+6%").save(mp3)
                break
            except Exception as e:
                print(f"  seg{i} retry{att}: {str(e)[:80]}")
                await asyncio.sleep(4)
        d = probe(mp3)
        durs.append(round(d, 3))
        print(f"  seg{i:02d}  {d:6.2f}s  {flat[:26]}")
    return durs

durs = asyncio.run(main())

# ---- 3) 算时间轴 ----
T = [0.0]
for i, d in enumerate(durs):
    T.append(round(T[i] + d + (GAP if i < len(durs) - 1 else 0), 3))
total = T[-1]
print(f"\n总时长 {total:.2f}s  ({round(total*30)} 帧)")

# ---- 4) 写 src/ep1Timeline.ts ----
F = [round(t * 30) for t in T]
lines = [
    "// 自动生成，勿手改。由 gen_ep1_timeline.py 从 ep1Script.ts + 配音真实时长生成。",
    "export const DUR = [" + ", ".join(str(d) for d in durs) + "];",
    "export const T = [" + ", ".join(str(t) for t in T) + "];",
    "export const F = [" + ", ".join(str(f) for f in F) + "];",
    f"export const TOTAL_SEC = {total};",
    f"export const TOTAL_FRAMES = {round(total * 30)};",
    f"export const GAP = {GAP};",
]
io.open(os.path.join(PROJ, "src", "ep1Timeline.ts"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("已写 src/ep1Timeline.ts")
print("段落数", len(durs), "帧数", round(total * 30))