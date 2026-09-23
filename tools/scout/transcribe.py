#!/usr/bin/env python3
"""scout · 转文字（faster-whisper），带时间戳"""
import argparse
import json
import sys


def main():
    ap = argparse.ArgumentParser(description="音视频转文字（faster-whisper）")
    ap.add_argument("media", help="音频/视频文件")
    ap.add_argument("--model", default="Systran/faster-whisper-base",
                    help="模型ID或本地路径（默认 base，首次自动下载）")
    ap.add_argument("--language", default="zh", help="语言（默认 zh）")
    ap.add_argument("--words", action="store_true", help="输出词级时间戳")
    ap.add_argument("--out", help="结果另存为 txt")
    ap.add_argument("--json", dest="json_out", help="结果另存为 json")
    args = ap.parse_args()

    from faster_whisper import WhisperModel

    print(f"loading {args.model} ...", flush=True)
    model = WhisperModel(args.model, device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        args.media, language=args.language, word_timestamps=args.words
    )

    lines = [
        f"===== {args.media} | {info.language} "
        f"prob={info.language_probability:.2f} ====="
    ]
    data = []
    for seg in segments:
        lines.append(f"({seg.start:.1f}-{seg.end:.1f}s) {seg.text}")
        item = {"start": seg.start, "end": seg.end, "text": seg.text}
        if args.words and seg.words:
            item["words"] = [
                {"start": w.start, "end": w.end, "word": w.word}
                for w in seg.words
            ]
        data.append(item)

    text = "\n".join(lines)
    print(text)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(text + "\n")
        print(f"saved {args.out}", file=sys.stderr)
    if args.json_out:
        with open(args.json_out, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"saved {args.json_out}", file=sys.stderr)


if __name__ == "__main__":
    main()
