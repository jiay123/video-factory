#!/usr/bin/env python3
"""producer · 按时间点抽帧，给 OCR 验收用"""
import argparse
import os
import subprocess
import sys


def main():
    ap = argparse.ArgumentParser(description="视频抽帧（OCR 验收前置）")
    ap.add_argument("--video", required=True, help="视频文件")
    ap.add_argument("--at", help="逗号分隔的秒数，如 0,4.5,9")
    ap.add_argument("--every", type=float, help="每隔 N 秒抽一张（和 --at 二选一）")
    ap.add_argument("--out", default="frames", help="输出目录（默认 frames）")
    ap.add_argument("--ext", default="png", choices=["png", "jpg"], help="图片格式")
    args = ap.parse_args()

    if not args.at and not args.every:
        sys.exit("给 --at 或 --every 其中一个")

    os.makedirs(args.out, exist_ok=True)

    if args.at:
        times = [float(x) for x in args.at.split(",") if x.strip()]
    else:
        r = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", args.video],
            capture_output=True, text=True, encoding="utf-8",
        )
        dur = float(r.stdout.strip())
        times, t = [], 0.0
        while t < dur:
            times.append(round(t, 2))
            t += args.every

    saved = []
    for t in times:
        name = f"f{t:g}.{args.ext}"
        path = os.path.join(args.out, name)
        subprocess.run(
            ["ffmpeg", "-y", "-ss", str(t), "-i", args.video,
             "-frames:v", "1", "-q:v", "2", path],
            check=True, capture_output=True,
        )
        print(f"{t:g}s -> {path}")
        saved.append(path)

    print(f"DONE {len(saved)} frames -> {args.out}")
    print("下一步：用 OCR 工具逐张读字，核对每场景大字 + 火柴人 IP")


if __name__ == "__main__":
    main()
