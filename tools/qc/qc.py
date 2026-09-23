#!/usr/bin/env python3
"""qc · Laya 五问质检

依赖：pip install laya
权重：https://huggingface.co/convaiinnovations/laya-multilingual
      路径用 --model 传，或设环境变量 LAYA_MODEL_DIR
"""
import argparse
import io
import json
import os
import sys
from datetime import date

# laya 的 transformers 导入会探测 TF，装了 TF 可能死锁（官方说明），先关掉
os.environ.setdefault("USE_TF", "0")

DEFAULT_QUESTIONS = {
    "钩子够不够抓人": {
        "type": "noul",
        "instructions": "开头前3秒能不能抓住观众不划走？",
    },
    "有没有漏洞/硬伤": {
        "type": "noul",
        "instructions": "这个视频文案有没有明显的漏洞或会让观众质疑的硬伤？",
    },
    "爆款潜力": {
        "type": "score",
        "instructions": "这条视频的吸引力和爆款潜力打几分？",
        "criteria": ["扑街", "一般", "有机会", "不错", "爆款潜力"],
    },
    "最像哪种类型": {
        "type": "choice",
        "instructions": "这条视频最像哪种类型的爆款？",
        "criteria": {"省钱干货": "", "涨见识新闻": "", "炫酷技术秀": ""},
    },
    "观众是哪类": {
        "type": "choice",
        "instructions": "这条视频最吸引哪类观众？",
        "criteria": {"新手小白": "", "上班族": "", "学生党": ""},
    },
}


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

    ap = argparse.ArgumentParser(description="Laya 五问质检")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--content", help="脚本文案直接传入")
    src.add_argument("--file", help="从文本文件读文案")
    ap.add_argument("--model", default=os.environ.get("LAYA_MODEL_DIR", ""),
                    help="Laya 权重路径（或环境变量 LAYA_MODEL_DIR）")
    ap.add_argument("--questions", help="自定义问题 JSON（覆盖默认五问）")
    ap.add_argument("--out", default="qc_result.json", help="输出 JSON")
    ap.add_argument("--title", default="", help="集标题，写进输出")
    args = ap.parse_args()

    if not args.model:
        sys.exit(
            "缺 Laya 权重路径：--model /path/to/laya-multilingual "
            "或 export LAYA_MODEL_DIR=...（装法见 agents/qc.md）"
        )

    if args.content:
        content = args.content
    else:
        with open(args.file, encoding="utf-8") as f:
            content = f.read().strip()

    if args.questions:
        with open(args.questions, encoding="utf-8") as f:
            questions = json.load(f)
    else:
        questions = DEFAULT_QUESTIONS

    import laya

    print("loading...", flush=True)
    agent = laya.load(args.model)
    result = agent.predict(content, questions)

    payload = {
        "title": args.title,
        "date": date.today().isoformat(),
        "content": content,
        "questions": questions,
        "result": result,
    }
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    print("saved", args.out)


if __name__ == "__main__":
    main()
