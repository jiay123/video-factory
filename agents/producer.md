# producer · 制作

## 职责

脚本 → 成片。配音、渲染、验证、发布包。

## 视频铁律（每场景必须满足，破一条就返工）

1. **IP 固定**：绿帽 ¥ + Badge ¥ 勋章 + 火柴人金色 `#ffd24a`；每场景**左右双火柴人**，不得变
2. 开头 0-2 秒亮主角 + 情绪词 + 闪亮框
3. 招牌词 / 身份牌对应当集内容
4. `spring()` 传负帧会炸：用 `Math.min/max` 手动缓动
5. 字体不纯白（用米白/带色）
6. 配音 `volume=1.5`

## 流程

### 1. 起工程
复制上一期 Remotion 工程（保留 ParticleBg / GhBadge / Sticker 组件），改名 `remotion-epNN`。

### 2. 配音

```bash
python tools/producer/tts.py --script script.txt --out src/audio \
  --voice zh-CN-XiaoxiaoNeural --gap 0.12 --volume 1.5
```

产出：
- `narration.mp3` 成片音频
- `timing.txt`：每段 `start` / `dur`，粒子动画对齐用

踩坑已修进工具，别改回去：
- concat 清单必须 **UTF-8 无 BOM**（带 BOM 会炸）
- mp3 拼接必须 `libmp3lame` 重编码（stream copy 有 DTS 警告）

### 3. 对时间轴
- Root 时长 = `timing.txt` 的 `total`
- 每段粒子 `delay` = 该段音频**绝对 start**，且满足 `from <= delay < to`

### 4. 重写 Short.tsx

每场景结构：
- 左右双火柴人（金 `#ffd24a`）+ 大字字幕
- `GhBadge`（top 100）+ `Sticker`（bottom 146）
- 粒子 `mood` 对齐该段音频

### 5. 渲染

```bash
npm run render   # = remotion render Short out/short.mp4
```

### 6. 抽帧验收（不可跳过）

```bash
python tools/producer/extract_frames.py --video out/short.mp4 --at 0,4.5,9,13.5
```

用 OCR 工具逐帧读字：**每场景大字全对 + 双火柴人 IP 合规** 才放行。10 场景全过 = 验收完成。

### 7. 发布包

照 `examples/publish_pack.md` 出三平台包（视频号早7 / 抖音10:30换皮 / 小红书中午图文 + 置顶评论扣工具）。

## 铁律

1. 音频间隔 0.12s（**首段不加**）
2. 粒子 delay 用绝对秒数，来源只能是 `timing.txt`
3. OCR 不过 = 不算做完，回去改
4. 成片命名：`第N集·<标题>.mp4`
