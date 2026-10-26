/* =============================================================================
 * 老贾 IP 视觉核心 —— 老贾嘴里吐字（LAOJIA_SPEAKS）
 * =============================================================================
 *
 * 【老贾 2026-09-30 亲手定调，原话】
 *   "要立我老贾的火柴人、老贾这个 IP 的风格。
 *    你所有的文案，包括框框，都是从火柴人老贾他嘴里吐出来的。
 *    这就是很心仪、好玩、有趣。你把这个方法保存掉，
 *    下次做视频都按照这种模式。"
 *
 * 后来老贾又补了两条（原话）：
 *   "左边，右边，左边，右边。第一次是左边第二次右边，
 *    或者说那个框框多的时候，两边同时，这样让我觉得还更好玩。"
 *   "你朗读什么，他把那个框框从嘴里吐出来。"
 *
 * 所以这不是某一集的特效，是【老贾 IP 的固定表演方式】：
 *   1. 画面上每一个字、每一个框、每一个标签，都必须是"老贾说出来的"
 *   2. 两只嘴轮流吐；并排的框，两只嘴同一拍齐飞
 *   3. **配音念到哪个字，对应的框就正好落位**（最重要，见下面「音画咬合」）
 *   少了 3，观众眼睛没被声音引导，就只看到"一闪"，读不出因果。
 *
 * ---------------------------------------------------------------------------
 * 【🚨 最容易做错的一件事：光调慢没用，必须做音画咬合】
 *
 * 老贾两次指出"还是太快、看不出来"，第二次我才发现真病根不是速度：
 *   - 元素按手写固定偏移冒出来 → 观众眼睛没被引导 → 一闪而过
 *   - 元素绑到配音的词上        → 耳朵听着"隐瞒"、眼睛看到卡飞出来 → 因果清楚
 *
 * 所以每一集开工第一步：**先生成 src/chars.json 逐字时间戳**（脚本见
 * gen_chars.py），然后每个元素的 delay 写成【绝对秒数 = 触发字时间 − 0.85】。
 *
 * 实测有效（第18集第5幕三张卡）：
 *   念"隐瞒"@20.57 → 卡一 19.72 起飞、20.57 落位
 *   念"乱调"@23.75 → 卡二 22.90 起飞、23.75 落位
 *   念"骗人"@25.02 → 卡三 24.17 起飞、25.02 落位
 *   抽帧实测：20.45s 只有卡一 / 23.60s 两张 / 25.10s 三张全齐 —— 严丝合缝
 *
 * ---------------------------------------------------------------------------
 * 【老贾 10/1 又补的三条 · 一并落进本文件】
 *
 *   1) "它的背面呢、它的画布，它有好多那种字体，我想把那个字体取消。"
 *      → 背景**不许飘大字**。ParticleBg 里那段 Floating glyphs（收费/开源/GitHub…）
 *        全部删掉，背景只留粒子+连线。
 *        理由不是不好看，是**抢戏** —— 背景飘字和正文都是字，观众分不清哪个是老贾说的。
 *        画面上的每一个字都必须有出处：要么是老贾嘴里吐出来的，要么根本不该出现。
 *
 *   2) "那个 GitHub 开源神器，这个不用吐，直接放到上面，把它固定起来就可以了。"
 *      → 顶部标签（如 NewsBadge）**全程固定贴在顶部**，不参与飞字。
 *        飞字是给正文用的，固定标签是给观众定位用的，两个角色不能混。
 *        固定标签只保留呼吸发光（pulse），不加 transform。
 *
 *   3) 玩法多样化，见下面 `planMouths` 的注释。
 *      一句话：**上下叠的左右轮流，并排的同时齐飞，元素多就两只老贾互相抛接。**
 *
 * ---------------------------------------------------------------------------
 * 【怎么用 · 三步】
 *
 * 1) 贴上老贾（必做，两只都要）
 *      import { LaoJiaDuo } from "./laojia";
 *      <LaoJiaDuo left="gasp" right="point" delay={0} />
 *    forceTalk 已经写死，两只嘴全程一张一合，说话时还往前喷金粉。
 *    没有嘴动 = 特效失效，等于白做。
 *
 * 2) 让文案从嘴里飞出来（核心）
 *      import { useFlyY } from "./laojia";
 *      const fly = useFlyY(13.78, 760, "l");  // 13.78秒起飞、落点中心y=760、从左嘴吐
 *      <div style={{ ...fly }}>文案</div>
 *    落位后 transform 严格归零 —— 你的配色/字体/字号/布局一格都不用改，
 *    变的只是"怎么出场"。这是老贾明确要的：风格不动，只换出场。
 *    飞行中的元素要压在老贾前面（zIndex:20），才像"吐"出来的。
 *
 *    ⚠️ 为什么要用 useFlyY 而不是 useFly：
 *    useFly 里 dy 写死常数 1000，只对"元素中心正好在 y=585"这一种布局成立。
 *    实际每个框落点高度不同，必须按实际 centerY 算飞行距离，
 *    否则字会从屏幕底冒出来，而不是从嘴里飞出来。
 *
 * 3) 字号字重必须有人继承
 *    老贾原话："框框可以留，但里面的字要动。"
 *    useFlyY 只给 transform/opacity，**不给字号字重** —— 全部靠继承父元素。
 *    所以父容器一定要有 fontSize/fontWeight，否则文字回落到 16px 发灰发糊。
 *    （第14集踩过：Chip 原本是 <span style={{fontSize:37}}>，换掉后没人继承，
 *      整排药丸字发灰，4 倍放大才读得出，像"没点亮"。）
 *
 * ---------------------------------------------------------------------------
 * 【五条铁律 · 都是实踩出来的】
 *
 * ① 飞行动画必须用【时间】驱动，不能用 spring。
 *    spring 一挂上就直接到位，观众只看到一次缩放，读不出"从嘴里飞出来"。
 *    正解：先在嘴里含 FLY_HOLD 秒（看得见老贾在憋），再用 easeInOutCubic 冲出来，
 *    落位后 sin 衰减回弹保证 transform 归零。
 *
 * ② 飞行速度：0.85 秒（嘴里含 0.15 + 飞 0.7）。
 *    老贾两次嫌快 —— 0.62 秒他明确说"看不出来"，0.85 秒他才说"可以"。
 *    但也别超过 1 秒，观众会等得不耐烦。
 *
 * ③ 左右嘴要轮流，而且**必须显式写 from**。
 *    曾偷懒靠 delay 奇偶自动判，结果各元素 delay 全是偶数 → 全落左嘴，
 *    右边的老贾全程站着不动，被老贾当场抓出来。**不要相信自动分配。**
 *    并排的框用同一个 delay + 一 l 一 r，两只嘴同一拍齐飞。
 *
 * ④ 嘴坐标 MOUTH_L.x=157 / MOUTH_R.x=923，y=1585。
 *    飞行时 reach = 1585 - centerY，**按元素实际落点高度算**，别写死。
 *    实测：左嘴 x=157，飞出起点 x=157 —— 严丝合缝。
 *
 * ⑤ 调试完必须确认源码没有残留。
 *    上色/显隐调试很容易留下魔改值被一起渲进成片。
 *    还原要用【字符串反替换】，不要依赖 .bak 备份文件（会被清掉，源码卡在调试态）。
 *    交付前跑一遍： npx tsc --noEmit
 *
 * ---------------------------------------------------------------------------
 * 【老贾的验收标准】
 *   "立我老贾的火柴人、老贾这个 IP 的风格" —— 要的是辨识度，不是花活。
 *   判断有没有做到，只看一件事：
 *   把音轨关掉，观众还能不能看出"这东西是老贾吐出来的"？
 *   看不出来，就是特效盖过了人，回去重做。
 *
 *   像素级自检（不能看图时用，比 OCR 可靠）：
 *     验飞字轨迹 = 取文字像素质心 Y，应从 ~1530（嘴高）单调升到落位
 *     验左右嘴   = 取质心 X，起点应贴近 157（左嘴）或 923（右嘴）
 *     验嘴在动   = 裁 x115-205 / y1575-1655 数深色像素，应随时间起伏
 * ========================================================================== */

import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const GOLD = "#ffd24a";
const RED = "#ff7b7b";
const PUPIL = "#0a0a12";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* ------------------------------------------------------------------ *
 *  1. 嘴的坐标 —— 改老贾站位时必须同步改这里
 * ------------------------------------------------------------------ */
export const MOUTH_L = { x: 157, y: 1585 };
export const MOUTH_R = { x: 923, y: 1585 };

/* ------------------------------------------------------------------ *
 *  2. 飞出来
 * ------------------------------------------------------------------ */
const FLY_HOLD = 0.15; // 在嘴里含多久（憋一下，才看得出是吐出来的）
const FLY_DUR = 0.7; // 飞多久 —— 0.62 秒老贾说"太快看不出来"，0.85 秒才过关

export type FlyStyle = React.CSSProperties & Record<string, unknown>;

/**
 * 让元素从老贾嘴里飞到它自己的位置。
 * @param delay     相对本幕开始的延迟（秒）
 * @param from      从哪只嘴吐；不写就按 delay 奇偶左右交替
 * @param minScale  起手缩放。小字用默认 0.18；大框/大面板用 0.3 左右，
 *                  否则大框会从小米粒长起来，显得突兀。
 */
export const useFly = (delay: number, from?: "l" | "r", minScale = 0.18): FlyStyle => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const side: "l" | "r" = from ?? (Math.round(delay * 100) % 2 === 0 ? "l" : "r");
  const t = frame / fps - delay;
  const src = side === "l" ? MOUTH_L : MOUTH_R;

  const u = clamp01((t - FLY_HOLD) / FLY_DUR);
  const travel = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;

  const dx = (src.x - 540) * (1 - travel);
  // 1000 = 嘴(y1585) 到元素中心的距离，不要换成 MOUTH.y
  const dy = 1000 * (1 - travel) - Math.sin(travel * Math.PI) * 200;

  // 落位后阻尼回弹，最终严格回到 1 —— 落位后和原样式一模一样
  const after = t - FLY_HOLD - FLY_DUR;
  const settle = after > 0 ? Math.sin(after * 23) * Math.exp(-after * 9) : 0;

  const scale = (minScale + (1 - minScale) * travel) * (1 + settle * 0.1);
  const rot = (side === "l" ? 15 : -15) * (1 - travel);

  return {
    transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${scale})`,
    // 一出口就看得见，别等飞到半空才显形
    opacity: clamp01((t + 0.03) * 14),
    position: "relative",
    // 飞行时要压在老贾前面，看着才像"吐"出来的
    zIndex: 20,
  };
};

/** 按 delay 奇偶决定从哪只嘴吐 —— 两只都用上才自然 */
export const sideOf = (delay: number): "l" | "r" =>
  Math.round(delay * 100) % 2 === 0 ? "l" : "r";

/**
 * 【新集一律用这个】和 useFly 数学一致，但按元素【实际落点高度】算飞行距离。
 *
 * @param delay    起飞时刻（**绝对秒数**。要做音画咬合就用 触发字时间 − 0.85）
 * @param centerY  元素落位后的中心 y 坐标（**必传**，否则字会从屏幕底冒出来而不是从嘴里）
 * @param from     从哪只嘴吐。**必须显式写** —— 靠奇偶自动判会全落一边
 * @param toss     0~1，"互相抛接"的幅度（老贾："图案多了，就设计成两个老贾互互相泡泡"）。
 *                 给 0.5~1 时元素飞出去会横向甩一道弧，像被对面那只老贾抛过来的。
 *                 只给**并排对打**的元素用；叠框连着飞的传 0，不然画面太闹。
 */
export const useFlyY = (delay: number, centerY: number, from?: "l" | "r", toss = 0): FlyStyle => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const side: "l" | "r" = from ?? (Math.round(delay * 100) % 2 === 0 ? "l" : "r");
  const t = frame / fps - delay;
  const src = side === "l" ? MOUTH_L : MOUTH_R;

  const u = clamp01((t - FLY_HOLD) / FLY_DUR);
  const travel = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;

  // 嘴到元素中心的真实距离（向上飞为正）。这就是 useFly 写死 1000 的正确做法。
  const reach = MOUTH_L.y - centerY;
  // 抛接：往【对面那只嘴】的方向甩出去，飞到一半再被"接住"落到原位
  const tossDir = side === "l" ? 1 : -1;
  const tossX = toss * tossDir * Math.sin(travel * Math.PI) * 120;
  const dx = (src.x - 540) * (1 - travel) + tossX;
  const arc = Math.min(1, Math.abs(reach) / 1000);
  const dy = reach * (1 - travel) - Math.sin(travel * Math.PI) * 210 * arc;

  // 落位后阻尼回弹：冲过头一点再弹回来，"啪"地一下站定
  const after = t - FLY_HOLD - FLY_DUR;
  const settle = after > 0 ? Math.sin(after * 21) * Math.exp(-after * 8) : 0;

  const scale = (0.16 + 0.84 * travel) * (1 + settle * 0.13);
  // 抛接时多转一点，像被甩过来的
  const rot = (side === "l" ? 16 + 26 * toss : -16 - 26 * toss) * (1 - travel);

  return {
    transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${scale})`,
    opacity: clamp01((t + 0.03) * 14),
    position: "relative",
    zIndex: 20,
  };
};

/**
 * 从 src/chars.json 里查某个字念到的绝对秒数。用它来做音画咬合。
 *   const t = charAt("隐瞒");           // → 20.57
 *   const fly = useFlyY(t - 0.85, 500, "l");
 */
export const makeCharAt = (charsJson: Array<{ chars: Array<{ c: string; t: number }> }>) => {
  return (needle: string, fallback = 0): number => {
    for (const seg of charsJson) {
      const s = seg.chars.map((x) => x.c).join("");
      const idx = s.indexOf(needle);
      if (idx < 0) continue;
      // 取 needle 最后一个字的时间（词念完的那一刻）
      const lastCh = seg.chars[idx + needle.length - 1];
      if (lastCh) return lastCh.t;
    }
    return fallback;
  };
};

/* ------------------------------------------------------------------ *
 *  2.5 飞嘴规划器 —— 决定每个元素从哪只嘴吐
 * ------------------------------------------------------------------ */

/**
 * 【老贾 10/1 原话】
 *   "你现在目前是做两个火柴人，不左边吐一个、右边吐一个。
 *    我们也可以左边吐了以后，第二个镜头再用右边吐。
 *    有时候也可以两边一起吐。
 *    就是说这种玩法多样化，不限一个，
 *    就是两个火柴人一起吐。
 *    根据这个框框的多少 —— 你看一下是两个或者三个，
 *    就由左边来吐，才能来把这个框框完成；
 *    下一个画布、下一个场景就有右边的来。
 *    如果这个图案多了，就可以设计成两个火柴人互互相泡泡。"
 *
 * 翻译成四条规则：
 *   stack 上下叠的框     → 左右嘴**轮流**，第一下左、第二下右、第三下又左（老贾原话"第一次是左边第二次右边"）
 *   row   并排的框       → 两只嘴**同一拍齐飞**，观众看见左右老贾同时出手（老贾原话"两边同时"）
 *   duet  成对的元素     → 一对一次，两只嘴轮着上，中间不歇
 *   wave  元素特别多     → 左右嘴**交替 + 错开半拍**，像两个老贾互相抛接球
 *
 * 🚨 重要：这只决定"谁吐"，不决定"什么时候吐"。
 *    什么时候吐必须绑配音词（见 useFlyY 的 delay = 触发字时间 − 0.85），
 *    否则又回到"一闪而过、读不出因果"的老毛病。
 *
 * @param count     这一幕要吐几个元素
 * @param layout    框框的排布方式
 * @param startSide 第一个元素从哪只嘴起（默认左）。想让下一幕换边就传 "r"
 */
export type FlyLayout = "stack" | "row" | "duet" | "wave";

export const planMouths = (
  count: number,
  layout: FlyLayout = "stack",
  startSide: "l" | "r" = "l",
): ("l" | "r")[] => {
  const out: ("l" | "r")[] = [];
  for (let i = 0; i < count; i++) {
    if (layout === "row" || layout === "duet") {
      // 并排 / 成对：奇数下标左嘴、偶数下标右嘴 —— 两只嘴轮流同一排出手
      const leftFirst = i % 2 === 0;
      out.push(leftFirst === (startSide === "l") ? "l" : "r");
    } else {
      // stack / wave 也是严格左右交替，但下一幕默认换边，节奏才不呆
      const flip = i % 2 === 0 ? startSide : startSide === "l" ? "r" : "l";
      out.push(flip);
    }
  }
  return out;
};

/**
 * wave（互相抛接）专用：相邻元素的起飞错开这么久，看起来像 A 抛给 B、B 再抛回来。
 * 只用在**没有配音词可绑**的装饰元素上（叠在配音词上的元素千万别加 offset，会破坏咬合）。
 */
export const WAVE_STEP = 0.16;
export const waveOffset = (index: number): number => index * WAVE_STEP;

/**
 * 一次性拿到嘴分配，例：
 *   const mouths = planMouths(3, "stack", "r");   // ["r","l","r"] —— 这一幕从右边起
 *   const fly1 = useFlyY(t1 - 0.85, 500, mouths[0]);
 *   const fly2 = useFlyY(t2 - 0.85, 790, mouths[1]);
 *   const fly3 = useFlyY(t3 - 0.85, 1080, mouths[2]);
 *
 * 并排同一拍双嘴齐飞：
 *   const [m1, m2] = planMouths(2, "row");
 *   const fL = useFlyY(38.4, 700, m1);
 *   const fR = useFlyY(38.4, 700, m2);   // 同一个 delay，两只嘴同一拍飞
 */

/* ------------------------------------------------------------------ *
 *  3. 老贾本人
 * ------------------------------------------------------------------ */
export type EyeStyle = "normal" | "scared" | "star" | "slant";
export type MouthStyle = "grin" | "open" | "shocked" | "frown" | "cat";

export const EYES: EyeStyle[] = ["normal", "scared", "star", "slant"];
export const MOUTHS: MouthStyle[] = ["grin", "open", "shocked", "frown", "cat"];

type Pose = {
  eyes: EyeStyle;
  mouth: MouthStyle;
  armL: number;
  armR: number;
  jump: number;
  lean: number;
  headTilt: number;
};

export const POSES: Record<string, Pose> = {
  gasp:  { eyes: "scared", mouth: "shocked", armL: -75, armR: -75, jump: 26, lean: -6, headTilt: 10 },
  shock: { eyes: "scared", mouth: "shocked", armL: -75, armR: -75, jump: 24, lean: -8, headTilt: 12 },
  think: { eyes: "slant",  mouth: "frown",  armL: -75, armR: 15,  jump: 0,  lean: 4,  headTilt: -10 },
  win:   { eyes: "star",   mouth: "cat",    armL: -85, armR: -85, jump: 34, lean: 0,  headTilt: 0 },
  cheer: { eyes: "star",   mouth: "open",   armL: -80, armR: -80, jump: 42, lean: 0,  headTilt: 0 },
  point: { eyes: "normal", mouth: "open",   armL: 20,  armR: -80, jump: 10, lean: -6, headTilt: -6 },
  mic:   { eyes: "normal", mouth: "open",   armL: -60, armR: 45,  jump: 12, lean: 0,  headTilt: -6 },
  cut:   { eyes: "star",   mouth: "grin",   armL: -70, armR: -70, jump: 14, lean: 0,  headTilt: 0 },
  sad:   { eyes: "slant",  mouth: "frown",  armL: -20, armR: -40, jump: 0,  lean: 8,  headTilt: 10 },
  dance: { eyes: "star",   mouth: "grin",   armL: 75,  armR: -55, jump: 16, lean: 0,  headTilt: -4 },
};

const Eyes: React.FC<{ style: EyeStyle; blink?: boolean }> = ({ style, blink }) => {
  if (blink)
    return (
      <g>
        <path d="M79 44 Q90 50 101 44" stroke={PUPIL} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M109 44 Q120 50 131 44" stroke={PUPIL} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
    );
  if (style === "scared")
    return (
      <g>
        <circle cx="90" cy="42" r="12" fill="#fffaf0" stroke={PUPIL} strokeWidth="2.5" />
        <circle cx="120" cy="42" r="12" fill="#fffaf0" stroke={PUPIL} strokeWidth="2.5" />
        <circle cx="92" cy="44" r="3" fill={PUPIL} />
        <circle cx="118" cy="44" r="3" fill={PUPIL} />
        <path d="M80 34 L86 40 M132 34 L126 40" stroke={PUPIL} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    );
  if (style === "star")
    return (
      <g>
        <circle cx="90" cy="42" r="11" fill="#fffaf0" stroke={PUPIL} strokeWidth="2.5" />
        <circle cx="120" cy="42" r="11" fill="#fffaf0" stroke={PUPIL} strokeWidth="2.5" />
        <text x="90" y="48" fontSize="13" fill={PUPIL} textAnchor="middle" fontWeight="900">✦</text>
        <text x="120" y="48" fontSize="13" fill={PUPIL} textAnchor="middle" fontWeight="900">✦</text>
      </g>
    );
  if (style === "slant")
    return (
      <g>
        <path d="M79 42 Q90 36 101 42" stroke={PUPIL} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M109 42 Q120 36 131 42" stroke={PUPIL} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </g>
    );
  return (
    <g>
      <circle cx="90" cy="42" r="11" fill="#fffaf0" stroke={PUPIL} strokeWidth="2.5" />
      <circle cx="120" cy="42" r="11" fill="#fffaf0" stroke={PUPIL} strokeWidth="2.5" />
      <circle cx="92" cy="44" r="4" fill={PUPIL} />
      <circle cx="118" cy="44" r="4" fill={PUPIL} />
    </g>
  );
};

const Mouth: React.FC<{ style: MouthStyle }> = ({ style }) => {
  if (style === "open") return <ellipse cx="105" cy="62" rx="12" ry="15" fill="#fffaf0" stroke={PUPIL} strokeWidth="3" />;
  if (style === "shocked") return <ellipse cx="105" cy="62" rx="9" ry="18" fill={RED} stroke={PUPIL} strokeWidth="3" />;
  if (style === "frown") return <path d="M94 70 Q105 58 116 70" stroke={PUPIL} strokeWidth="4.5" fill="none" strokeLinecap="round" />;
  if (style === "cat") return <path d="M88 67 Q105 56 122 67 Q121 76 113 73 Q111 80 105 73 Q99 80 97 73 Q89 76 88 67 Z" fill="#fffaf0" stroke={PUPIL} strokeWidth="3" strokeLinejoin="round" />;
  return <path d="M92 58 Q105 70 118 58" stroke={PUPIL} strokeWidth="5" fill="none" strokeLinecap="round" />;
};

export type LaoJiaProps = {
  /** 姿势名，见 POSES。默认 gasp */
  mode?: string;
  side: "left" | "right";
  delay: number;
  /** 传 true 强制一直说话（嘴全程动）。做"嘴里吐字"的集必须给 */
  forceTalk?: boolean;
  /** 放大倍数，默认 1（横屏 1920×1080 的片子要放大用） */
  scale?: number;
  /** 距左侧像素，默认 42 */
  left?: number;
  /** 距底部像素，默认 122 */
  bottom?: number;
};

/** 一只老贾。嘴会一直在一张一合，说话时往前喷金粉。 */
export const LaoJia: React.FC<LaoJiaProps> = ({ mode = "gasp", side, delay, forceTalk, scale = 1, left, bottom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - delay;
  const pose = POSES[mode] ?? POSES.gasp;

  const bob = interpolate(Math.sin(t * (pose.jump ? 10 : 6)), [-1, 1], [0, -(pose.jump || 22)]);
  const sway = interpolate(Math.sin(t * 5), [-1, 1], [-8, 8]);

  // 嘴一直在一张一合。用 frame/fps（绝对时间）而不是 t，否则两只嘴会错开半拍。
  const talking = forceTalk ?? (mode === "talk" || mode === "sing" || mode === "mic" || mode === "pointUp");
  const idleChatter = mode !== "shocked" && mode !== "squashed";
  const chatter = talking || idleChatter;
  const absT = frame / fps;
  const openNow = chatter && Math.sin(absT * 17) > 0.55;
  const gesture = chatter ? Math.sin(absT * 7) * 30 : 0;
  const gesture2 = chatter ? Math.sin(absT * 7 + 1.6) * 34 : 0;

  // 嘴张开时往前喷三个小圆点
  const puffK = openNow ? ((absT * 14) % (Math.PI * 2)) / (Math.PI * 2) : 0;
  const puff = chatter && puffK > 0 ? puffK : 0;
  const dir = side === "left" ? -1 : 1;

  return (
    <svg
      width={230}
      height={290}
      viewBox="0 0 210 210"
      style={{
        position: "absolute",
        left: side === "left" ? (left ?? 42) : undefined,
        right: side === "right" ? (left ?? 42) : undefined,
        bottom: bottom ?? 122,
        transformOrigin: scale !== 1 ? "50% 100%" : undefined,
        transform: `translateY(${bob}px) rotate(${pose.lean + sway * 0.25}deg) scale(${scale})`,
        filter: "drop-shadow(0 10px 30px rgba(0,0,0,.5))",
      }}
    >
      {/* 嘴往侧下方喷金粉。svg 是 230×290 装 210×210 的 viewBox（上下各留 30px），
          可见 viewBox 范围约 x0-210 / y27-183，所以喷点必须待在这个范围内，否则会被裁掉。 */}
      {puff > 0 &&
        [0, 1, 2].map((i) => {
          const k = Math.max(0, Math.min(1, puff * 1.7 - i * 0.28));
          return (
            <circle
              key={i}
              cx={105 + dir * (30 + k * 55 + i * 7)}
              cy={70 + k * (20 + i * 8)}
              r={4.5 + k * (13 - i * 2)}
              fill={GOLD}
              opacity={(1 - k) * 0.85}
            />
          );
        })}
      <g transform={`rotate(${pose.headTilt} 105 60)`}>
        {/* 蓝帽子 + 帽尾：左只帽尾朝右、右只帽尾朝左（镜像对称），帽子随呼吸轻晃 */}
        <g transform={`translate(0 ${(Math.sin(absT * 2.2) * 1.6).toFixed(2)})`}>
          <g transform={`translate(105 0) scale(${side === "left" ? 1 : -1} 1) translate(-105 0)`}>
            <path d="M 66 24 Q 68 -10 105 -14 Q 142 -10 144 24 Z" fill="#2F6BFF" stroke="#1B4FD8" strokeWidth="2.5" />
            <path d="M 80 -6 Q 96 -16 112 -13" stroke="rgba(255,255,255,.45)" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M 96 22 Q 120 16 152 27 Q 156 36 142 37 Q 118 32 96 32 Z" fill="#1E4FD0" />
            <path d="M 148 25 Q 174 18 184 31 Q 174 37 150 33 Z" fill="#163FB0" />
            <circle cx="105" cy="6" r="13" fill={GOLD} stroke="#e6bc3c" strokeWidth="2" />
            <text x="105" y="11" fontSize="14" fill={PUPIL} textAnchor="middle" fontWeight="900">¥</text>
          </g>
        </g>
        {/* 脑袋 */}
        <circle cx="105" cy="46" r="31" fill={GOLD} stroke="#e6bc3c" strokeWidth="3" />
        {/* 眉毛 + 腮红 = 更喜感 */}
        <path d="M 78 33 Q 88 28 98 33" stroke={PUPIL} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <path d="M 112 33 Q 122 28 132 33" stroke={PUPIL} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <ellipse cx="75" cy="62" rx="8" ry="5" fill="rgba(255,107,107,.35)" />
        <ellipse cx="135" cy="62" rx="8" ry="5" fill="rgba(255,107,107,.35)" />
        <Eyes style={pose.eyes} blink={blink} />
        <g transform="translate(0 8)">
          <Mouth style={talkingPose} />
        </g>
      </g>
      <line x1="105" y1="77" x2="105" y2="152" stroke={GOLD} strokeWidth="15" strokeLinecap="round" />
      <line x1="105" y1="94" x2="58" y2="132" stroke={GOLD} strokeWidth="13" strokeLinecap="round" transform={`rotate(${pose.armL} 105 94)`} />
      <line x1="105" y1="94" x2="152" y2="132" stroke={GOLD} strokeWidth="13" strokeLinecap="round" transform={`rotate(${pose.armR} 105 94)`} />
      <line x1="105" y1="152" x2="78" y2={186 + pose.jump} stroke={GOLD} strokeWidth="13" strokeLinecap="round" transform={`rotate(${legX * 0.7} 105 152)`} />
      <line x1="105" y1="152" x2="132" y2={186 + pose.jump} stroke={GOLD} strokeWidth="13" strokeLinecap="round" transform={`rotate(${-legX * 0.5} 105 152)`} />
      <circle cx="105" cy="146" r="16" fill={GOLD} stroke="#e6bc3c" strokeWidth="2" />
      <text x="105" y="152" fontSize="19" fill={PUPIL} textAnchor="middle" fontWeight="900">¥</text>
    </svg>
  );
};

/** 一对老贾。吐字的集直接用这个，两只嘴都会动。 */
export const LaoJiaDuo: React.FC<{ left?: string; right?: string; delay: number }> = ({
  left = "gasp",
  right = "point",
  delay,
}) => (
  <>
    <LaoJia mode={left} side="left" delay={delay} forceTalk />
    <LaoJia mode={right} side="right" delay={delay} forceTalk />
  </>
);
