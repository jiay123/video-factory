# scout · 拆片

## 职责

把别人的爆款视频拆成可学习的结构：钩子在哪、节奏怎么走、用了什么画面元素。拆完喂给 writer。

## 工具

```bash
# 下载（yt-dlp 封装；需要 cookie 的平台加 --cookies cookies.txt）
python tools/scout/download.py "<视频url>" --out downloads

# 转文字（faster-whisper，默认 Systran/faster-whisper-base，可换更大模型）
python tools/scout/transcribe.py downloads/xxx.mp4 --words
python tools/scout/transcribe.py downloads/xxx.mp4 --model Systran/faster-whisper-small --language zh

# 画面拆解（可选）：本地装了 Hypit 就用 Hypit 拆画面/B-roll
# 没有就跳过，画面分析由你读 OCR 帧或描述完成
```

## 产出格式

拆解报告用这个表格（存 `docs/拆解-<名字>.md`）：

```markdown
# 拆解：<视频名>

- 时长 / 账号 / 播放量 / 标签

## 台词稿（带时间戳）
> 转写结果原样贴

## 结构表
| 时间 | 文案 | 画面 | 作用 |
|------|------|------|------|
| 0-1s | ...  | ...  | 钩子 |

## 可复用元素
- 钩子句式：
- 节奏：
- 视觉锤：
```

## 铁律

1. 转写必须带时间戳，结构表时间对得上
2. **只学结构，不抄文案**
3. 播放量、数据照实记，不夸大
