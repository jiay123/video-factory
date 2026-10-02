#!/usr/bin/env python3
"""ledger · 质检落账：Laya 判断 + conductor 裁决 → ledger/episodes/epNN.json

decisions.json 格式：
  [{"q": "钩子够不够抓人", "verdict": "采纳", "note": "..."}, ...]
  （laya 原话自动从 --laya 原始结果填；找不到同名问题才需要自带 "laya" 字段）
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


def render_laya(ans: dict) -> str:
    t = ans.get("type")
    if t == "noul":
        p = ans["noul"]
        if p >= 0.5:
            return f"是 {p * 100:.2f}%"
        return f"否 {ans.get('confidence', 1 - p) * 100:.2f}%"
    if t == "score":
        legend = ans.get("legend", {})
        idx = str(max(0, min(len(legend) - 1, int(round(ans["score"])))))
        return f"{ans['score']:.2f}/{len(legend) - 1} {legend.get(idx, '')}"
    if t == "choice":
        top = ans["choice"]
        p = ans.get("probabilities", {}).get(top, 0)
        return f"{top} {p * 100:.1f}%"
    return json.dumps(ans, ensure_ascii=False)


def main():
    ap = argparse.ArgumentParser(description="质检落账")
    ap.add_argument("--episode", required=True, help="集号，如 ep10")
    ap.add_argument("--title", default="", help="集标题")
    ap.add_argument("--laya", required=True, help="qc.py 的原始输出 JSON")
    ap.add_argument("--decisions", required=True, help="裁决 JSON 文件")
    ap.add_argument("--final", default="", help="最终决策，如：直接发不改")
    ap.add_argument("--pack", default="", help="发布包说明，如：视频号早7/抖音10:30换皮")
    ap.add_argument("--visual-review", help="crv review.json 路径")
    args = ap.parse_args()

    with open(args.laya, encoding="utf-8") as f:
        raw = json.load(f)
    with open(args.decisions, encoding="utf-8") as f:
        decisions = json.load(f)
    visual_review = None
    if args.visual_review:
        with open(args.visual_review, encoding="utf-8") as f:
            visual_review = json.load(f)

    answers = raw.get("result", {}).get("answers", {})
    filled = []
    for d in decisions:
        item = dict(d)
        ans = answers.get(item.get("q", ""))
        if ans is not None:
            item["laya"] = render_laya(ans)
        filled.append(item)

    path = os.path.join(LEDGER_DIR, f"{args.episode}.json")
    doc = {}
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            doc = json.load(f)

    doc.update({
        "episode": args.episode,
        "title": args.title or doc.get("title", ""),
        "created": doc.get("created", date.today().isoformat()),
        "qc": {
            "model": raw.get("result", {}).get("model", ""),
            "date": raw.get("date", date.today().isoformat()),
            "raw": raw.get("result", raw),
            "decisions": filled,
            "final": args.final,
        },
    })
    doc.setdefault("publish", {"pack": args.pack or doc.get("publish", {}).get("pack", ""),
                               "date": None})
    if args.pack:
        doc["publish"]["pack"] = args.pack
    if visual_review is not None:
        doc["visual_review"] = {
            "path": os.path.abspath(args.visual_review),
            "tool": visual_review.get("tool", ""),
            "checklist": visual_review.get("checklist", {}),
            "findings": visual_review.get("findings", []),
            "next_actions": visual_review.get("next_actions", []),
        }
    doc.setdefault("feedback", None)

    os.makedirs(LEDGER_DIR, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)

    print(f"saved {path}")
    print(f"裁决 {len(filled)} 条，final={args.final or '(空)'}")


if __name__ == "__main__":
    main()
