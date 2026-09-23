#!/usr/bin/env python3
"""ledger · 数据回灌：发布数据 + 对账结论 → 写进账本

actual.json 格式：
  {"视频号": {"播放": 426, "转发": 4, "点赞": 1, "新增关注": 3}, "抖音": {...}}
"""
import argparse
import json
import os
import sys
from datetime import date

LEDGER_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "ledger", "episodes",
)


def main():
    ap = argparse.ArgumentParser(description="发布数据回灌")
    ap.add_argument("--episode", required=True, help="集号，如 ep10")
    ap.add_argument("--date", default="", help="发布日期 YYYY-MM-DD（默认今天）")
    ap.add_argument("--data", required=True, help="实际数据 JSON 文件")
    ap.add_argument("--note", default="", help="对账结论（Laya 哪问对/打脸、下集怎么改）")
    args = ap.parse_args()

    path = os.path.join(LEDGER_DIR, f"{args.episode}.json")
    if not os.path.exists(path):
        sys.exit(f"账本不存在：{path}（先跑 record.py）")

    with open(path, encoding="utf-8") as f:
        doc = json.load(f)
    with open(args.data, encoding="utf-8") as f:
        actual = json.load(f)

    doc.setdefault("publish", {})
    doc["publish"]["date"] = args.date or date.today().isoformat()
    doc["feedback"] = {
        "date": date.today().isoformat(),
        "actual": actual,
        "note": args.note,
        "closed": True,
    }

    with open(path, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)

    print(f"回灌完成 {path}")
    print(f"三件套齐：Laya判断 + 你的决策 + 实际数据（feedback.closed=true）")


if __name__ == "__main__":
    main()
