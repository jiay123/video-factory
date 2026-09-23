# qc · 质检

## 职责

成片文案过 Laya 五问 → conductor 逐条裁决 → 落账。质检与发布决策由 conductor 拍板（已获授权）。

## 五问（默认，来自 [Laya](https://github.com/NandhaKishorM/laya) 三类题型）

| # | 问题 | 题型 | 含义 |
|---|------|------|------|
| 1 | 钩子够不够抓人 | noul | 开头前 3 秒能不能抓住不划走 |
| 2 | 有没有漏洞/硬伤 | noul | 有没有会让观众质疑的硬伤 |
| 3 | 爆款潜力 | score | 扑街 / 一般 / 有机会 / 不错 / 爆款潜力 |
| 4 | 最像哪种类型 | choice | 省钱干货 / 涨见识新闻 / 炫酷技术秀 |
| 5 | 观众是哪类 | choice | 新手小白 / 上班族 / 学生党 |

## 准备

```bash
pip install laya
# 下载权重：https://huggingface.co/convaiinnovations/laya-multilingual
export LAYA_MODEL_DIR=/path/to/laya-multilingual
```

## 跑法

```bash
python tools/qc/qc.py --content "脚本全文" --out raw.json
# 或从文件读：
python tools/qc/qc.py --file script.txt --out raw.json
# 自定义问题：
python tools/qc/qc.py --file script.txt --questions my_questions.json
```

## 裁决规则（conductor 拍板）

每问必须给三样：`verdict` + `note`，laya 原话由工具自动填。

- **采纳**：同意 Laya，按它改片或保留
- **驳回**：不同意。**驳回「硬伤警报」前必须人工复核每条事实有出处**，依据写进 note
- **记录**：分数/选项参考用，不据此改片

裁决时记住实测基线：
- Laya 在 10 道已知题上只有 **5/10 正确**
- 高概率 ≠ 正确；它连续判偏（如类型判反）要写进 note，指导下集开头调整
- 官方模型卡原话：它是「a fast base to specialise, not a zero-shot decision engine」

## 落账

decisions.json 格式：

```json
[
  {"q": "钩子够不够抓人", "verdict": "采纳", "note": "满分钩子，保留"},
  {"q": "有没有漏洞/硬伤", "verdict": "驳回", "note": "人工复核：数字均有出处，警报误报"}
]
```

```bash
python tools/ledger/record.py --episode epNN --title "标题" \
  --laya raw.json --decisions decisions.json --final "直接发不改"
```

## 铁律

1. 每集必质检，结果必落账，不许跳步
2. 驳回必须有事实依据，不许拍脑袋
3. 你的裁决对错，将来由 ledger 回灌的实际数据对账——这是给 Laya 攒标注的唯一途径
