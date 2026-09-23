# video-factory · 多智能体视频工厂

一个 LLM agent 当总调度（conductor），五个角色各司其职，把「拆片 → 文案 → 制作 → 质检 → 回灌」串成一条短视频流水线。

这不是概念图。同一条流水线已实打实做出 **10 集火柴人短视频**（单集 40-46 秒），发布 6 集，单账号自然流量（未投流）单集最高 **427 播放**。下文数字全部来自 2026-09-23 的真实台账，没刷量，没吹牛。

## 它是什么，不是什么

**是**：角色卡（`agents/`）+ 命令行工具（`tools/`）+ 账本闭环（`ledger/`）。总调度就是任意一个读得懂 `AGENTS.md` 的 LLM agent——本仓库来自我日更短视频的实际生产系统。

**不是**：没有自研 agent 框架，没有云服务，没有数据库。工具都是薄薄一层 Python，依赖全部开源。

## 架构

```
              ┌────────────────────────────────┐
              │     conductor（总调度）          │
              │  任意读得懂 AGENTS.md 的 LLM     │
              │  agent：定方向、拍板、记账        │
              └───────────────┬────────────────┘
      ┌───────────┬───────────┼───────────┬───────────┐
      ▼           ▼           ▼           ▼           ▼
 ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
 │  scout  │  │ writer  │  │producer │  │   qc    │  │ ledger  │
 │  拆片    │  │  文案    │  │  制作    │  │  质检    │  │  回灌    │
 └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
      │            │           │           │           │
  yt-dlp       选题池+钩子    edge-tts      Laya      账本 JSON
  whisper      10段脚本      ffmpeg        五问       三件套
  (Hypit)                   Remotion    逐条裁决    下集翻账本
                            抽帧 OCR     记账
```

## 五个角色

| 角色 | 干什么 | 工具 | 产出 |
|------|--------|------|------|
| **scout** 拆片 | 拆爆款：下载 → 转文字 → 结构分析 | `tools/scout/`（yt-dlp + faster-whisper），画面拆解可选 Hypit | 拆解报告（钩子/节奏/结构表） |
| **writer** 文案 | 从选题池选题，写钩子和分段脚本 | 选题池规则 + `examples/script.md` 格式 | 10 段脚本 |
| **producer** 制作 | 配音 → 渲染 → 验证 → 发布包 | `tools/producer/`（edge-tts + ffmpeg + Remotion + 抽帧） | 成片 mp4 + 三平台发布包 |
| **qc** 质检 | 五问质检 + 逐条裁决 | `tools/qc/`（[Laya](https://github.com/NandhaKishorM/laya) 五问） | 质检 JSON + 采纳/驳回记录 |
| **ledger** 回灌 | 发布数据回灌，下集开工先翻账本 | `tools/ledger/` | 账本 JSON（三件套） |

## 流水线怎么转（每集固定 5 步）

1. **scout 拆片**（有爆款参考时）：下载 → whisper 带时间戳转写 → 拆出钩子和结构表
2. **writer 文案**：选题池挑题 → 写钩子 → 出 10 段脚本（每段 4-5 秒，全集 40-50 秒）
3. **producer 制作**：edge-tts 配音 → ffmpeg 拼音频 → Remotion 渲染 → 抽帧 OCR 逐场景验收 → 出发布包
4. **qc 质检**：Laya 五问打分 → conductor 逐条裁决（采纳/驳回+理由）→ 落账 → 拍板发或改
5. **ledger 回灌**：拿到发布数据 → 三件套回灌 → 下集开工先翻账本

## 账本闭环（这个项目的灵魂）

每集固定攒一组三件套：

```
[ 实际发布数据 ]  +  [ Laya 当时的判断 ]  +  [ conductor 当时的决策 ]
```

- 下集开工前必读上集账本：采纳的继续、驳回的看实际数据验证谁对
- 长期目标：攒标注数据微调 Laya，它越准，返工越少

### Laya 现在准不准？说实话：一般

- 我们自备 **10 道答案已知的题**考它：**5 / 10 正确**（50% 基线）
- 第 10 集五问实测：

| 问题 | Laya 判断 | 我的裁决 |
|------|-----------|----------|
| 钩子够不够抓人 | 是 99.99% | ✅ 采纳（满分） |
| 有没有漏洞/硬伤 | 是 97.86%（报警） | ⛔ 驳回（人工复核，事实全有出处） |
| 爆款潜力 | 1.64 / 4 | 📝 记录（偏低） |
| 最像哪种类型 | 炫酷技术秀 75.2% | ⛔ 驳回（判偏，实际是资讯省钱向） |
| 观众是哪类 | 新手小白 39.9%（置信 0.86%） | 📝 记录（近似无效，忽略） |

- Laya 官方模型卡自己也写明：zero-shot 接近随机、概率偏过度自信，「a fast base to specialise, not a zero-shot decision engine」。所以它的输出当草稿纸，**conductor 拍板**
- 顺带一提：它回答时 `output_tokens = 0`——不生成文字，只出概率，所以没有幻觉和解析问题

## 实测记录（截至 2026-09-23，单账号自然流量，未投流）

已制作 10 集，已发布 6 集（第 1/2/3/4/8/9 集），第 5/6/7/10 集排队中。

| 集 | 标题 | 发布 | 播放 | 互动 |
|---|------|------|------|------|
| 第2集 | Colibri 白嫖顶级大模型 | 9/18 | **427** | 5转 1赞 2粉 |
| 第8集 | TypeSafe AI互联网时刻 | 9/22 | **426** | 4转 1赞 3粉 |
| 第3集 | 剪映省钱 | 9/16 | 222 | 1转 |
| 第9集 | 一块钱屠龙 | 9/23 早7 | 137 | 抖音1 / 小红书7 |
| 第4集 | Whisper语音转文字 | 9/21 | 171 | — |
| 第10集 | Jev被挤爆了 | 待发 | — | — |

第 10 集制作实测：45.1 秒 / 10 场景 / 1353 帧 / edge-tts 10 段 / 抽帧 OCR **10 场景全过** / 成品 88.5 MB。

**诚实说明**：我们自己的播放量会诊结论是——病根在渠道冷启动，不在内容。本项目不承诺爆款，只提供一条可复用、可对账的流水线。

## 快速开始

### 依赖

- Python 3.10+、Node 18+、ffmpeg
- `pip install -r tools/requirements.txt`
- 渲染需要一个 Remotion 模板工程（复制你自己的上一期工程即可，见 `agents/producer.md`）
- qc 角色需要 Laya：`pip install laya` + 下载 [laya-multilingual](https://huggingface.co/convaiinnovations/laya-multilingual) 权重，路径传给 `--model` 或设环境变量 `LAYA_MODEL_DIR`

### 1. 拆片

```bash
python tools/scout/download.py "https://example.com/video"
python tools/scout/transcribe.py downloads/xxx.mp4 --words
```

### 2. 文案

LLM 干活：读 `agents/writer.md`，按选题池规则出 10 段脚本，格式照 `examples/script.md`。

### 3. 制作

```bash
python tools/producer/tts.py --script script.txt --out src/audio
# → narration.mp3 + timing.txt（每段 start/dur，粒子动画对齐用）
npm run render
python tools/producer/extract_frames.py --video out/short.mp4 --at 0,4.5,9,13.5
# 逐帧 OCR 验收 → 照 examples/publish_pack.md 出发布包
```

### 4. 质检

```bash
python tools/qc/qc.py --content "脚本全文" --model "$LAYA_MODEL_DIR"
# conductor 按 agents/qc.md 逐条裁决，然后落账：
python tools/ledger/record.py --episode ep10 --title "Jev被挤爆了" \
  --laya raw.json --decisions decisions.json --final "直接发不改"
```

### 5. 回灌

```bash
python tools/ledger/feedback.py --episode ep10 --date 2026-09-24 \
  --data actual.json --note "回灌结论"
```

## 目录结构

```
video-factory/
├── AGENTS.md              # conductor 总调度手册（agent 打开仓库先读这个）
├── agents/                # 5 个角色卡
│   ├── scout.md           # 拆片
│   ├── writer.md          # 文案
│   ├── producer.md        # 制作（含视频铁律）
│   ├── qc.md              # 质检（含裁决规则）
│   └── ledger.md          # 回灌
├── tools/
│   ├── scout/             # download.py + transcribe.py
│   ├── producer/          # tts.py + extract_frames.py
│   ├── qc/                # qc.py（Laya 五问）
│   └── ledger/            # record.py + feedback.py
├── ledger/
│   ├── schema.md          # 账本格式
│   └── episodes/          # 每集一本账（含第10集真实样例）
└── examples/
    ├── script.md          # 脚本格式（第10集真实脚本）
    └── publish_pack.md    # 三平台发布包格式
```

## 用任何 agent 都能开

仓库根目录的 `AGENTS.md` 就是总调度手册。用 OpenCode、Claude Code 或任何读得懂它打开仓库，按 5 步流水线跑即可；角色细节在 `agents/*.md`，工具都是 CLI，不绑定任何 agent 框架。

## 隐私

仓库不含成片、音频、账号密钥、服务器信息；账本只放质检判断与决策记录（均为文字与概率）。

## 依赖致谢

[Laya](https://github.com/NandhaKishorM/laya)（Apache-2.0）、faster-whisper、edge-tts、yt-dlp、Remotion、ffmpeg——全是开源，一条流水线吃百家饭。

## License

MIT
