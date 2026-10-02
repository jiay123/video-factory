# 账本格式 · ledger/schema.md

一集一本账：`ledger/episodes/epNN.json`。

## 完整结构

```json
{
  "episode": "ep10",
  "title": "Jev被挤爆了",
  "created": "2026-09-23",

  "qc": {
    "model": "laya-rl-agent",
    "date": "2026-09-23",
    "raw": { "…": "qc.py 原始五问结果，冻结，不许改" },
    "decisions": [
      {
        "q": "钩子够不够抓人",
        "laya": "是 99.99%",
        "verdict": "采纳 | 驳回 | 记录",
        "note": "理由（驳回必须写事实依据）"
      }
    ],
    "final": "直接发不改"
  },

  "publish": {
    "pack": "视频号早7 / 抖音10:30换皮 / 置顶评论扣工具",
    "date": null
  },

  "visual_review": {
    "path": "项目目录/crv-review-auto/review.json",
    "tool": "claude-real-video",
    "checklist": { "scene_text_ocr": "pass" },
    "findings": [],
    "next_actions": []
  },

  "feedback": null
}
```

## 三件套在哪

| 三件套 | 字段 | 何时写入 |
|--------|------|----------|
| Laya 当时的判断 | `qc.raw` + `qc.decisions[].laya` | `record.py`，之后冻结 |
| 你的当时决策 | `qc.decisions[].verdict/note` + `qc.final` | `record.py`，之后冻结 |
| 实际发布数据 | `publish.date` + `feedback.actual/note` | `feedback.py` |
| 画面复盘 | `visual_review.checklist/findings/next_actions` | `record.py --visual-review` |

## 状态机

```
做片 → record.py → feedback: null（等数据）
                     ↓ 老贾给数据
                  feedback.py → feedback.closed: true（闭环）
                     ↓
                  下集开工第 0 步翻这本账
```

## 现状（2026-10-02 核对）

**三本账的闭环全部没合上：**

| 账本 | `qc` | `publish.date` | `feedback` | `visual_review.tool` |
|------|------|----------------|-----------|---------------------|
| `ep10.json` | ✅ 有（Laya 五问原始输出+人工裁决） | 空 | `null` | 无 |
| `ep11.json` | ✅ 有 | 空 | `null` | `claude-real-video` |
| `ep12.json` | ✅ 有 | 空 | `null` | umi-ocr + 像素检测 |

**即：三件套里只有前两件（Laya 判断 + 人工裁决）落在文件里，第三件（实际发布数据）一本都没回灌。**

`feedback.py` 能跑，`record.py` 能写，**但没人调**——缺的是「发完拿到数据后回灌」这一步。真实发布数据目前记在我自己机器的视频台账里，不在这个仓库。

**铁律：没数据不许编；历史不许改，只追加。** 所以上面这些空就空着，不填假数字。
