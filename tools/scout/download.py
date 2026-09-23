#!/usr/bin/env python3
"""scout · 视频下载（yt-dlp 封装）"""
import argparse
import shutil
import subprocess
import sys


def main():
    ap = argparse.ArgumentParser(description="下载视频（yt-dlp）")
    ap.add_argument("url", help="视频地址")
    ap.add_argument("--out", default="downloads", help="输出目录（默认 downloads）")
    ap.add_argument("--cookies", help="cookies.txt 路径（微信视频号等需要）")
    ap.add_argument("-f", "--format", default="bv*+ba/b", help="格式选择器")
    args = ap.parse_args()

    if not shutil.which("yt-dlp") and not shutil.which("yt-dlp.exe"):
        sys.exit("没找到 yt-dlp，先装：pip install yt-dlp")

    cmd = [
        "yt-dlp",
        "-f", args.format,
        "-o", "%(title).80s.%(ext)s",
        "--no-playlist",
        args.url,
    ]
    if args.cookies:
        cmd += ["--cookies", args.cookies]

    print("RUN:", " ".join(cmd))
    raise SystemExit(subprocess.call(cmd, cwd=args.out))


if __name__ == "__main__":
    main()
