#!/usr/bin/env python3
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def parse_timing(path):
    if not path:
        return []
    checkpoints = []
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        match = re.search(r"start=([0-9.]+)\s+dur=([0-9.]+)", line)
        if match:
            start, duration = map(float, match.groups())
            checkpoints.append(round(start + duration / 2, 3))
    return checkpoints


def main():
    parser = argparse.ArgumentParser(description="调用 claude-real-video 生成成片复盘素材")
    parser.add_argument("--video", required=True, help="成片文件")
    parser.add_argument("--out", default="crv-review", help="复盘输出目录")
    parser.add_argument("--timing", help="timing.txt，用于计算场景中点")
    parser.add_argument("--why", default="检查排版、元素越界、空画面、闪切、跳帧、场景节奏和IP一致性")
    parser.add_argument("--scene", type=float, default=0.18)
    parser.add_argument("--fps-floor", type=float, default=0.8)
    parser.add_argument("--max-frames", type=int, default=60)
    parser.add_argument("--dedup-threshold", type=float, default=3)
    parser.add_argument("--dedup-window", type=int, default=1)
    parser.add_argument("--no-transcribe", action="store_true")
    parser.add_argument("--grid", action="store_true", default=True)
    parser.add_argument("--report", action="store_true", default=True)
    parser.add_argument("--viewer", action="store_true", default=True)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    output = Path(args.out)
    if output.exists() and any(output.iterdir()) and not args.overwrite:
        parser.error(f"输出目录非空：{output}，需要重跑时加 --overwrite")

    command = [
        sys.executable, "-m", "claude_real_video", args.video,
        "-o", str(output), "--overwrite", "--scene", str(args.scene),
        "--fps-floor", str(args.fps_floor), "--max-frames", str(args.max_frames),
        "--dedup-threshold", str(args.dedup_threshold),
        "--dedup-window", str(args.dedup_window), "--why", args.why,
    ]
    if args.no_transcribe:
        command.append("--no-transcribe")
    if args.grid:
        command.append("--grid")
    if args.report:
        command.append("--report")
    if args.viewer:
        command.append("--viewer")

    result = subprocess.run(command)
    if result.returncode:
        return result.returncode

    frames_file = output / "frames.json"
    manifest_file = output / "MANIFEST.txt"
    frames = json.loads(frames_file.read_text(encoding="utf-8")).get("frames", [])
    manifest = manifest_file.read_text(encoding="utf-8")
    extracted_match = re.search(r"deduped from (\d+) extracted", manifest)
    duration_match = re.search(r"duration: ([0-9.]+)s", manifest)
    review = {
        "tool": "claude-real-video",
        "source": str(Path(args.video).resolve()),
        "duration_sec": float(duration_match.group(1)) if duration_match else None,
        "frames_kept": len(frames),
        "frames_extracted": int(extracted_match.group(1)) if extracted_match else None,
        "grids": len(list((output / "grids").glob("*.jpg"))) if (output / "grids").exists() else 0,
        "ocr_checkpoints_sec": parse_timing(args.timing),
        "checklist": {
            "scene_text_ocr": "pending",
            "layout_overflow": "pending",
            "blank_or_broken_frames": "pending",
            "ip_consistency": "pending",
            "pacing": "pending",
        },
        "findings": [],
        "next_actions": [],
    }
    review_file = output / "review.json"
    review_file.write_text(json.dumps(review, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"复盘清单：{review_file}")
    print("下一步：逐个 OCR 检查场景中点，再看 grids/report.html，填写 review.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
