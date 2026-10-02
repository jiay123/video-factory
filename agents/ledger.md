# ledger · 回灌账本

## 职责

把三件套攒成标注数据：`[实际数据 + Laya当时判断 + conductor当时决策]`。账本是整条流水线的记忆。

## 流程

### 1. 等数据
老贾发布后给数据（按平台：播放 / 转发 / 点赞 / 新增关注）。数据没来，账本里 `feedback` 保持 `null`——**不许编数**。

### 2. 回灌

```bash
# actual.json 格式：
# {"视频号": {"播放": 426, "转发": 4, "点赞": 1, "新增关注": 3}, "抖音": {...}}

python tools/ledger/feedback.py --episode epNN --date YYYY-MM-DD \
  --data actual.json --note "回灌结论"
```

`note` 写这次对账的结论：Laya 哪问对了、哪问打脸了、下集怎么改。

### 3. 三件套齐 = 本集闭环

```
qc.raw        → Laya 当时的判断（record 时冻结）
qc.decisions  → 你的当时决策（record 时冻结）
feedback      → 实际发布数据 + 对账结论（feedback 写入）
```

### 4. 下集开工先翻账本（第 0 步）

- `decisions` 里 **采纳** 的 → 继续执行
- `decisions` 里 **驳回** 的 → 看 `feedback.actual` 验证谁对了（这就是给 Laya 的标注）
- `feedback.note` → 本集要规避的坑
- `visual_review.next_actions` → 下一集画面复盘要执行的动作

### 5. 画面复盘也入账

`record.py --visual-review` 会把 `crv-review-auto/review.json` 的五项检查、发现和下一集动作写入 `visual_review`。它是制作复盘，不替代发布数据；下一集开工先看 `visual_review.next_actions`。


攒 N 集后，得到三元组：

```
(内容特征, Laya 判断, 人工裁决, 实际表现)
```

用它微调 Laya：基线 5/10（50%）→ 目标 76%+。它越准，conductor 返工越少。

## 铁律

1. 三件套缺一不可；没数据就等，`feedback: null` 是合法状态
2. **不改历史记录**（qc.raw / qc.decisions 冻结），只追加 feedback
3. 每本账一个文件 `ledger/episodes/epNN.json`，一集不漏
