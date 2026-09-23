#!/usr/bin/env python3
"""producer · edge-tts 配音 + ffmpeg 拼接

产出：
  <out>/narration.mp3  成片音频
  <out>/timing.txt     每段 start/dur（粒子动画对齐用）

踩坑已修（别改回去）：
  - concat 清单必须 UTF-8 无 BOM（utf-8-sig 会炸）
  - mp3 拼接必须 libmp3lame 重编码（stream copy 有 DTS 警告）
"""
import argparse
import asyncio
import os
import subprocess
import sys

DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"


def probe_duration(path: str) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        capture_output=True, text=True, encoding="utf-8",
    )
    return float(r.stdout.strip())


async def synth(text: str, path: str, voice: str, retries: int = 8) -> bool:
    import edge_tts
    for i in range(retries):
        try:
            c = edge_tts.Communicate(text, voice)
            await c.save(path)
            if os.path.getsize(path) > 500:
                return True
        except Exception as e:
            print(f"retry {os.path.basename(path)} ({i + 1}): {type(e).__name__}", flush=True)
        await asyncio.sleep(2)
    return False


async def run(args) -> None:
    with open(args.script, encoding="utf-8") as f:
        segments = [ln.strip() for ln in f if ln.strip()]
    if not segments:
        sys.exit("脚本是空的")

    out_dir = args.out
    os.makedirs(out_dir, exist_ok=True)

    raws = []
    for i, text in enumerate(segments, 1):
        raw = os.path.join(out_dir, f"raw{i}.mp3")
        print(f"TTS {i}/{len(segments)}: {text[:24]}...", flush=True)
        if not await synth(text, raw, args.voice):
            sys.exit(f"FAIL seg{i}")
        raws.append(raw)
        await asyncio.sleep(1.0)

    padded = []
    gap_ms = int(args.gap * 1000)
    for i, raw in enumerate(raws, 1):
        p = os.path.join(out_dir, f"pad{i}.mp3")
        # 首段不加间隔，其余段前垫 gap；统一提音量
        af = f"volume={args.volume}" if i == 1 else \
            f"adelay={gap_ms}:all=1,volume={args.volume}"
        subprocess.run(
            ["ffmpeg", "-y", "-i", raw, "-af", af, "-ar", "44100", p],
            check=True, capture_output=True,
        )
        padded.append(p)

    # UTF-8 无 BOM（utf-8-sig 会炸）
    concat_path = os.path.join(out_dir, "concat.txt")
    with open(concat_path, "w", encoding="utf-8") as f:
        for p in padded:
            f.write(f"file '{p}'\n")

    final = os.path.join(out_dir, f"{args.name}.mp3")
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0",
         "-i", concat_path, "-c:a", "libmp3lame", "-q:a", "2", final],
        check=True, capture_output=True,
    )

    total = 0.0
    lines = []
    for i, raw in enumerate(raws, 1):
        d = probe_duration(raw)
        lines.append(f"seg{i} start={total:.2f} dur={d:.2f}")
        print(f"seg{i} start={total:.2f} dur={d:.2f}")
        total += d + (0 if i == len(raws) else args.gap)
    lines.append(f"total={total:.2f}")
    print(f"total={total:.2f}")

    with open(os.path.join(out_dir, "timing.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("DONE", final)


def main():
    ap = argparse.ArgumentParser(description="edge-tts 配音 + ffmpeg 拼接")
    ap.add_argument("--script", required=True, help="每行一段的文案 txt")
    ap.add_argument("--out", default="audio", help="输出目录（默认 audio）")
    ap.add_argument("--voice", default=DEFAULT_VOICE, help=f"声音（默认 {DEFAULT_VOICE}）")
    ap.add_argument("--gap", type=float, default=0.12, help="段间隔秒（默认 0.12）")
    ap.add_argument("--volume", type=float, default=1.5, help="音量（默认 1.5）")
    ap.add_argument("--name", default="narration", help="成品音频名（默认 narration）")
    args = ap.parse_args()
    asyncio.run(run(args))


if __name__ == "__main__":
    main()
