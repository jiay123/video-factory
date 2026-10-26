import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ParticleBg } from "./ParticleBg";
import rawChars from "./chars.json";
import narration from "./audio/ep34.mp3";

const GOLD = "#ffd24a";
const CREAM = "#f4ead0";
const GREEN = "#00ffb0";
const BLUE = "#8be9fd";
const RED = "#ff7b7b";
const PURPLE = "#c9a0ff";
const ORANGE = "#ffa04d";
const PINK = "#ff9ec7";
const PINK_DK = "#e07aa8";
const PUPIL = "#0a0a12";

const springAt = (frame: number, fps: number, delay: number, damping = 14, stiffness = 130) =>
  spring({
    frame: Math.max(0, frame - delay * fps),
    fps,
    config: { damping, stiffness },
  });

/* ========================================================================== *
 *  时间驱动的飞行动画（第16集治"不像从嘴里吐出来"的核心改动）
 *
 *  老贾 10/1 晚原话（决定了下面的时间分配）：
 *    "火柴人吐字的时候，吐的时候，那可以慢一点。吐出来以后它就可以快一点。
 *      你吐的时候太快了，别人都看不看。"
 *    "就像那个鱼吐了泡泡，从嘴里吐出来，很明显，就从嘴里吐出来，飘飘出来的。"
 *
 *  所以节奏是"吐慢飞快"，而不是平均分配：
 *    FLY_HOLD 0.85 吐出阶段——字含在嘴里，泡泡慢慢胀大（观众看清起点是嘴）
 *    FLY_DUR  0.8   飞行阶段——泡泡一破，字唰地飘到位，干脆利落
 *    合计 0.85 = LEAD，音画咬合的时间点不受影响
 * ========================================================================== */
const FLY_HOLD = 0.85;
const FLY_DUR = 0.8;
export const LEAD = 1.65; // FLY_HOLD + FLY_DUR，念到词时刚好落位
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOutCubic = (u: number) =>
  u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;

/** 吐字进度 0~1。t<0 → 0；t<FLY_HOLD → 0（嘴里含着）；之后 easeInOutCubic 冲出来 */
const flyU = (frame: number, fps: number, delay: number) =>
  easeInOutCubic(clamp01((frame / fps - delay - FLY_HOLD) / FLY_DUR));

/** 落位后的衰减回弹，0 表示刚站定 */
const flySettle = (frame: number, fps: number, delay: number) => {
  const after = frame / fps - delay - FLY_HOLD - FLY_DUR;
  return after > 0 ? Math.sin(after * 21) * Math.exp(-after * 8) : 0;
};

/**
 * 吐出进度 0~1 —— 老贾要的"鱼吐泡泡"：嘴里含住、泡泡慢慢胀大，然后破掉飞走。
 * t<0 → 0（还没开始）；0~FLY_HOLD → 慢慢涨（泡泡胀大）；之后 → 1（泡泡破，消失）
 */
const flyHold = (frame: number, fps: number, delay: number) => {
  const t = frame / fps - delay;
  if (t <= 0) return 0;
  return clamp01(t / FLY_HOLD);
};

/**
 * 🚨 飞行时长按距离自适应。
 * 老贾说"吐出来以后可以快一点"，但那是针对**近处**元素。
 * 远的元素（比如顶部角标要从嘴 y=1585 飞到 y=126，差 1459px）用固定 0.35 秒
 * 等于瞬移，看不见轨迹。超过 1200px 的给 1.5 倍飞行时间。
 * 代价：落位比 0.85 晚 0.175 秒，观众看不出（配音咬合误差在容差内）。
 */
const flyDurFor = (reach: number) => (Math.abs(reach) > 1200 ? FLY_DUR * 1.5 : FLY_DUR);

/** 带距离自适应的吐字进度 */
const flyUDur = (frame: number, fps: number, delay: number, reach: number) =>
  easeInOutCubic(clamp01((frame / fps - delay - FLY_HOLD) / flyDurFor(reach)));

/** 带距离自适应的落位回弹 */
const flySettleDur = (frame: number, fps: number, delay: number, reach: number) => {
  const after = frame / fps - delay - FLY_HOLD - flyDurFor(reach);
  return after > 0 ? Math.sin(after * 21) * Math.exp(-after * 8) : 0;
};

/* ========================================================================== *
 *  音画咬合：查 chars.json 里"念到某个词的绝对时刻"
 *
 *  ⚠️ 为什么不用 ip-kit/laojia.tsx 的 makeCharAt：
 *  它是全表找第一个匹配，段号不参与。像"源"这种字 seg1 有"开源"、seg8 又有"开源"，
 *  全表找会永远命中 seg1，第 8 幕全部绑错。所以这里按段号定位。
 * ========================================================================== */
type Cue = { i: number; start: number; text: string; chars: Array<{ c: string; t: number }> };
const cues = rawChars as Cue[];

const charAt = (segNo: number, needle: string, fallback: number): number => {
  const seg = cues.find((c) => c.i === segNo);
  if (!seg) return fallback;
  const s = seg.chars.map((x) => x.c).join("");
  const idx = s.indexOf(needle);
  if (idx < 0) return fallback;
  const last = seg.chars[idx + needle.length - 1];
  return last ? last.t : fallback;
};

/** 元素出场时刻 = 念到该词的瞬间 - LEAD（ LEAD = 嘴里含0.15 + 飞0.7 ） */
const at = (segNo: number, needle: string): number => charAt(segNo, needle, 0) - LEAD;

// 火柴人嘴的屏幕坐标（由 Sticker 的 svg 几何推出）
const MOUTH_L = { x: 270, y: 1596 };
const MOUTH_R = { x: 900, y: 1662 };

/* 🔥 老贾 10/6 打回后的核心修复：框框、标题、药丸、终端窗必须全部从火柴人嘴里飞出来。
   病根：以前只有 PopWord 有飞行轨迹，ShapeCard 是原地 scale(0.6→1)、Title/Chip 走 spring 淡入，
   所以画面上"字是吐出来的、框是淡出来的"，看着不像一个动作。v6 铁律"每个字都得有出处"。
   这里把 PopWord 那套飞行数学抽出来给所有组件共用，出处统一；离嘴近的自动加甩弧（否则像原地放大）。 */
const flyFromMouth = (
  frame: number,
  fps: number,
  delay: number,
  toX: number,
  toY: number,
  from: "l" | "r",
  arc = 200
) => {
  const src = from === "l" ? MOUTH_L : MOUTH_R;
  const t = frame / fps - delay;
  const reach = MOUTH_L.y - toY;
  const flight = flyUDur(frame, fps, delay, reach);
  const settle = flySettleDur(frame, fps, delay, reach);
  const arcK = Math.min(1, Math.abs(reach) / 1000);
  const autoToss = Math.abs(reach) < 600 ? 0.55 : 0;
  const tossX = autoToss * (from === "l" ? 1 : -1) * Math.sin(flight * Math.PI) * 150;
  const x = src.x + (toX - src.x) * flight + tossX;
  const y = src.y + (toY - src.y) * flight - Math.sin(flight * Math.PI) * arc * arcK;
  const spin = (from === "l" ? 1 : -1) * (16 + 8 * Math.sin(t * 1.3)) * (1 - flight);
  const hold = flyHold(frame, fps, delay);
  return { x, y, flight, settle, spin, hold, t, land: 1 + settle * 0.12 };
};

/* 嘴里吐出的泡泡：吐出阶段胀大、环在转，破泡瞬间炸成扇形裂纹 + 双冲击环 */
const SHAPE_SPARK: Record<string, number> = { star: 5, diamond: 4, hex: 6, circle: 9 };

const BubbleMorph: React.FC<{
  x: number;
  y: number;
  r: number;
  color: string;
  hold: number;
  kind?: string;
}> = ({ x, y, r, color, hold, kind = "circle" }) => {
  if (hold <= 0 || hold >= 1) return null;
  const grow = clamp01(hold / 0.74);
  const pop = clamp01((hold - 0.74) / 0.26);
  const n = SHAPE_SPARK[kind] ?? 9;
  const core = 0.3 + 0.24 * Math.sin(hold * Math.PI);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + 44 * (1 - grow),
        width: 0,
        height: 0,
        zIndex: 19,
        pointerEvents: "none",
        transform: `scale(${0.16 + 0.84 * grow})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -r * 1.55,
          top: -r * 1.55,
          width: r * 3.1,
          height: r * 3.1,
          borderRadius: "50%",
          border: `3px solid ${color}`,
          opacity: pop > 0 ? (1 - pop) * 0.85 : 0,
          transform: `scale(${0.45 + pop * 2.6})`,
          boxShadow: `0 0 ${28 * (1 - pop)}px ${color}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -r * 1.25,
          top: -r * 1.25,
          width: r * 2.5,
          height: r * 2.5,
          borderRadius: "50%",
          border: `2px dashed ${color}`,
          opacity: pop > 0 ? (1 - pop) * 0.6 : 0.9,
          transform: `scale(${0.4 + pop * 1.9}) rotate(${hold * 220}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -r,
          top: -r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, ${color}${pop > 0.5 ? "00" : "55"}, ${color}22 58%, ${color}00 80%)`,
          boxShadow: `inset 0 0 ${22 * grow}px ${color}88, 0 0 ${30 * grow}px ${color}55`,
          opacity: 1 - pop,
        }}
      />
      <svg
        width={r * 2}
        height={r * 2}
        viewBox="-50 -50 100 100"
        style={{ position: "absolute", left: -r, top: -r, overflow: "visible" }}
      >
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2;
          const a2 = ((i + 0.88) / n) * Math.PI * 2;
          const mid = (a + a2) / 2;
          const dist = pop * (30 + (i % 3) * 13);
          const rot = pop * (i % 2 ? 1 : -1) * (26 + i * 10);
          return (
            <path
              key={i}
              d={`M0,0 L${(Math.cos(a) * 50).toFixed(1)},${(Math.sin(a) * 50).toFixed(1)} A50,50 0 0,1 ${(
                Math.cos(a2) * 50
              ).toFixed(1)},${(Math.sin(a2) * 50).toFixed(1)} Z`}
              fill="none"
              stroke={color}
              strokeWidth={2.4}
              opacity={(1 - pop) * core * 1.5}
              transform={`translate(${(Math.cos(mid) * dist).toFixed(1)} ${(Math.sin(mid) * dist).toFixed(1)}) rotate(${rot.toFixed(
                1
              )})`}
            />
          );
        })}
        <circle
          r={8 + 20 * (1 - pop)}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={(1 - pop) * 0.7}
        />
      </svg>
    </div>
  );
};

const MouthBubble = BubbleMorph;

/* ===================== 眼睛 / 嘴 ===================== */

const Eyes: React.FC<{ style: "normal" | "scared" | "star" | "slant" | "dizzy" }> = ({ style }) => {
  if (style === "scared") {
    return (
      <g>
        <circle cx="90" cy="42" r="12" fill="#fffaf0" stroke={PUPIL} strokeWidth="2.5" />
        <circle cx="120" cy="42" r="12" fill="#fffaf0" stroke={PUPIL} strokeWidth="2.5" />
        <circle cx="92" cy="44" r="3" fill={PUPIL} />
        <circle cx="118" cy="44" r="3" fill={PUPIL} />
        <path d="M80 34 L86 40 M132 34 L126 40" stroke={PUPIL} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    );
  }
  if (style === "star") {
    return (
      <g>
        <circle cx="90" cy="42" r="11" fill="#fffaf0" stroke={PUPIL} strokeWidth="2.5" />
        <circle cx="120" cy="42" r="11" fill="#fffaf0" stroke={PUPIL} strokeWidth="2.5" />
        <text x="90" y="48" fontSize="13" fill={PUPIL} textAnchor="middle" fontWeight="900">✦</text>
        <text x="120" y="48" fontSize="13" fill={PUPIL} textAnchor="middle" fontWeight="900">✦</text>
      </g>
    );
  }
  if (style === "slant") {
    return (
      <g>
        <path d="M79 42 Q90 36 101 42" stroke={PUPIL} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M109 42 Q120 36 131 42" stroke={PUPIL} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (style === "dizzy") {
    return (
      <g>
        <path d="M80 34 L100 50 M100 34 L80 50" stroke={PUPIL} strokeWidth="4" strokeLinecap="round" />
        <path d="M110 34 L130 50 M130 34 L110 50" stroke={PUPIL} strokeWidth="4" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <circle cx="90" cy="42" r="11" fill="#fffaf0" stroke={PUPIL} strokeWidth="2.5" />
      <circle cx="120" cy="42" r="11" fill="#fffaf0" stroke={PUPIL} strokeWidth="2.5" />
      <circle cx="92" cy="44" r="4" fill={PUPIL} />
      <circle cx="118" cy="44" r="4" fill={PUPIL} />
    </g>
  );
};

const Mouth: React.FC<{ style: "grin" | "open" | "shocked" | "frown" | "cat" | "wave" }> = ({ style }) => {
  if (style === "open") return <ellipse cx="105" cy="62" rx="12" ry="15" fill="#fffaf0" stroke={PUPIL} strokeWidth="3" />;
  if (style === "shocked") return <ellipse cx="105" cy="62" rx="9" ry="18" fill={RED} stroke={PUPIL} strokeWidth="3" />;
  if (style === "frown") return <path d="M94 70 Q105 58 116 70" stroke={PUPIL} strokeWidth="4.5" fill="none" strokeLinecap="round" />;
  if (style === "wave") return <path d="M90 70 Q97 58 105 64 Q113 58 120 70" stroke={PUPIL} strokeWidth="4" fill="none" strokeLinecap="round" />;
  if (style === "cat") return <path d="M88 67 Q105 56 122 67 Q121 76 113 73 Q111 80 105 73 Q99 80 97 73 Q89 76 88 67 Z" fill="#fffaf0" stroke={PUPIL} strokeWidth="3" strokeLinejoin="round" />;
  return <path d="M92 58 Q105 70 118 58" stroke={PUPIL} strokeWidth="5" fill="none" strokeLinecap="round" />;
};

type Pose = {
  eyes: "normal" | "scared" | "star" | "slant" | "dizzy";
  mouth: "grin" | "open" | "shocked" | "frown" | "cat" | "wave";
  armL: number;
  armR: number;
  jump: number;
  lean: number;
  headTilt: number;
  squash?: number;
};

const POSES: Record<string, Pose> = {
  gasp: { eyes: "scared", mouth: "shocked", armL: -75, armR: -75, jump: 26, lean: -6, headTilt: 10 },
  shock: { eyes: "scared", mouth: "shocked", armL: -75, armR: -75, jump: 24, lean: -8, headTilt: 12 },
  think: { eyes: "slant", mouth: "frown", armL: -75, armR: 15, jump: 0, lean: 4, headTilt: -10 },
  win: { eyes: "star", mouth: "cat", armL: -85, armR: -85, jump: 34, lean: 0, headTilt: 0 },
  cheer: { eyes: "star", mouth: "open", armL: -80, armR: -80, jump: 42, lean: 0, headTilt: 0 },
  point: { eyes: "normal", mouth: "open", armL: 20, armR: -80, jump: 10, lean: -6, headTilt: -6 },
  mic: { eyes: "normal", mouth: "open", armL: -60, armR: 45, jump: 12, lean: 0, headTilt: -6 },
  cut: { eyes: "star", mouth: "grin", armL: -70, armR: -70, jump: 14, lean: 0, headTilt: 0 },
  sad: { eyes: "slant", mouth: "frown", armL: -20, armR: -40, jump: 0, lean: 8, headTilt: 10 },
  dance: { eyes: "star", mouth: "grin", armL: 75, armR: -55, jump: 16, lean: 0, headTilt: -4 },
  talk: { eyes: "normal", mouth: "wave", armL: -30, armR: 25, jump: 0, lean: 0, headTilt: 0 },
  present: { eyes: "normal", mouth: "open", armL: -88, armR: -20, jump: 8, lean: 0, headTilt: -8 },
  sing: { eyes: "star", mouth: "cat", armL: -70, armR: 60, jump: 18, lean: 4, headTilt: 8 },
  dodge: { eyes: "scared", mouth: "shocked", armL: -95, armR: -50, jump: 30, lean: -18, headTilt: 22 },
  squashed: { eyes: "dizzy", mouth: "frown", armL: -100, armR: -100, jump: 0, lean: 0, headTilt: 0, squash: 0.62 },
  pointUp: { eyes: "normal", mouth: "open", armL: 15, armR: -95, jump: 6, lean: 4, headTilt: -14 },
  shrug: { eyes: "slant", mouth: "frown", armL: -40, armR: 40, jump: 0, lean: 0, headTilt: 0 },
};

const Sticker: React.FC<{ mode: string; side: "left" | "right"; delay: number; forceTalk?: boolean }> = ({ mode, side, delay, forceTalk }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - delay;
  const pose = POSES[mode] ?? POSES.gasp;
  const bob = interpolate(Math.sin(t * (pose.jump ? 10 : 6)), [-1, 1], [0, -(pose.jump || 22)]);
  const sway = interpolate(Math.sin(t * 5), [-1, 1], [-8, 8]);
  const talking = forceTalk ?? (mode === "talk" || mode === "sing" || mode === "mic" || mode === "pointUp");
  const absT = frame / fps;
  const idleChatter = mode !== "shocked";
  const chatter = talking || idleChatter;
  const openNow = chatter && Math.sin(absT * 17) > 0.55;
  const sq = pose.squash ?? 1;
  // 说话时手臂加动作：一上一下比划，像说相声
  const gesture = chatter ? Math.sin(absT * 7) * 30 : 0;
  const gesture2 = chatter ? Math.sin(absT * 7 + 1.6) * 34 : 0;

  return (
    <svg
      width={360}
      height={360}
      viewBox="0 0 210 210"
      style={{
        position: "absolute",
        left: 60,
        bottom: 80,
        transform: `translateY(${bob}px) rotate(${pose.lean + sway * 0.25}deg) scaleY(${sq}) scaleX(${2 - sq})`,
        filter: "drop-shadow(0 12px 34px rgba(0,0,0,.55))",
        transformOrigin: "bottom center",
      }}
    >
      <g transform={`rotate(${pose.headTilt} 105 60)`}>
        {/* 呆毛：从帽子右侧翘出去再弯下来，末梢一颗金币，会甩 */}
        <g transform={`rotate(${Math.sin(absT * 8) * 26} 120 14)`}>
          <path d="M118 8 Q166 2 180 28 Q186 40 178 48" stroke="#12b582" strokeWidth="11" fill="none" strokeLinecap="round" />
          <circle cx="176" cy="52" r="11" fill={GOLD} stroke="#e6bc3c" strokeWidth="2" />
          <text x="176" y="57" fontSize="14" fill={PUPIL} textAnchor="middle" fontWeight="900">¥</text>
        </g>
        {/* 歪帽 */}
        <g transform="rotate(-11 105 10)">
          <ellipse cx="105" cy="6" rx="45" ry="14" fill="#0e5a44" />
          <path d="M60 8 Q60 -10 105 -12 Q150 -10 150 8 Z" fill="#12b582" />
          <rect x="46" y="2" width="118" height="14" rx="7" fill="#0a3d2e" />
        </g>
        {/* 大脸 */}
        <circle cx="105" cy="52" r="37" fill={GOLD} stroke="#e6bc3c" strokeWidth="3" />
        {/* 长歪眉：一高一低，越夸张越好笑 */}
        <path d="M76 32 Q90 8 108 26" stroke="#0a3d2e" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M110 20 Q126 8 138 32" stroke="#0a3d2e" strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* 斗鸡眼：眼珠往中间挤 */}
        <circle cx="92" cy="50" r="14" fill="#fff" stroke="#e6bc3c" strokeWidth="2" />
        <circle cx="118" cy="50" r="14" fill="#fff" stroke="#e6bc3c" strokeWidth="2" />
        <circle cx="99" cy="54" r="6.5" fill={PUPIL} />
        <circle cx="111" cy="54" r="6.5" fill={PUPIL} />
        {/* 大嘴：说话张合 */}
        {openNow ? (
          <ellipse cx="105" cy="70" rx="13" ry="11" fill="#7a1f2b" stroke="#5c1219" strokeWidth="2" />
        ) : (
          <path d="M86 60 Q105 88 124 60 Q105 71 86 60 Z" fill="#7a1f2b" stroke="#5c1219" strokeWidth="3" />
        )}
      </g>
      <line x1="105" y1="89" x2="105" y2="158" stroke={GOLD} strokeWidth="16" strokeLinecap="round" />
      <line x1="105" y1="106" x2="56" y2="146" stroke={GOLD} strokeWidth="14" strokeLinecap="round" transform={`rotate(${pose.armL + gesture} 105 106)`} />
      <line x1="105" y1="106" x2="154" y2="146" stroke={GOLD} strokeWidth="14" strokeLinecap="round" transform={`rotate(${pose.armR - gesture2} 105 106)`} />
      <circle cx="56" cy="146" r="9" fill={GOLD} />
      <circle cx="154" cy="146" r="9" fill={GOLD} />
      <line x1="105" y1="158" x2="76" y2={192 + pose.jump} stroke={GOLD} strokeWidth="14" strokeLinecap="round" transform={`rotate(-14 105 158)`} />
      <line x1="105" y1="158" x2="134" y2={192 + pose.jump} stroke={GOLD} strokeWidth="14" strokeLinecap="round" transform={`rotate(14 105 158)`} />
      <ellipse cx="105" cy="152" rx="19" ry="17" fill={GOLD} stroke="#e6bc3c" strokeWidth="2" />
      <text x="105" y="159" fontSize="22" fill={PUPIL} textAnchor="middle" fontWeight="900">¥</text>
    </svg>
  );
};

/** 小贾 —— 右边的小个子女孩，粉双马尾 + 小裙子 + 蝴蝶结鞋（10/5 定：先用女娃不戴帽，满十集再加帽子和服饰） */
const StickerKid: React.FC<{ mode: string; delay: number; forceTalk?: boolean }> = ({ mode, delay, forceTalk }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - delay;
  const pose = POSES[mode] ?? POSES.gasp;
  const bob = interpolate(Math.sin(t * (pose.jump ? 15 : 9)), [-1, 1], [0, -(pose.jump || 30)]);
  const sway = interpolate(Math.sin(t * 7), [-1, 1], [-9, 9]);
  const talking = forceTalk ?? (mode === "talk" || mode === "sing" || mode === "mic" || mode === "pointUp");
  const absT = frame / fps;
  const chatter = talking || mode !== "shocked";
  const openNow = chatter && Math.sin(absT * 20) > 0.55;
  const swing = Math.sin(absT * 11) * 15;
  const legSwing = chatter ? Math.sin(absT * 11) * 13 : 0;
  const armWave = chatter ? Math.sin(absT * 7 + 1.2) * 28 : 0;
  return (
    <svg
      width={250}
      height={250}
      viewBox="0 0 210 210"
      style={{
        position: "absolute",
        right: 60,
        bottom: 80,
        transform: `translateY(${bob}px) rotate(${pose.lean + sway * 0.3}deg)`,
        filter: "drop-shadow(0 10px 28px rgba(0,0,0,.5))",
        transformOrigin: "bottom center",
      }}
    >
      <g transform={`rotate(${swing} 66 44)`}>
        <path d="M70 40 Q42 50 40 86" stroke={PINK_DK} strokeWidth="16" fill="none" strokeLinecap="round" />
        <circle cx="66" cy="32" r="23" fill={PINK} />
      </g>
      <g transform={`rotate(${-swing} 144 44)`}>
        <path d="M140 40 Q168 50 170 86" stroke={PINK_DK} strokeWidth="16" fill="none" strokeLinecap="round" />
        <circle cx="144" cy="32" r="23" fill={PINK} />
      </g>
      {/* 波波头刘海 + 歪刘海一撮 */}
      <path d="M69 50 Q69 8 105 8 Q141 8 141 50 Q122 30 105 36 Q88 30 69 50 Z" fill={PINK} />
      <path d="M132 22 Q158 12 164 32" stroke={PINK_DK} strokeWidth="9" fill="none" strokeLinecap="round" />
      {/* 脸 */}
      <circle cx="105" cy="52" r="32" fill={GOLD} stroke="#e6bc3c" strokeWidth="3" />
      <path d="M88 36 Q96 26 104 32" stroke={PINK_DK} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M110 30 Q118 26 124 36" stroke={PINK_DK} strokeWidth="5" fill="none" strokeLinecap="round" />
      {pose.eyes === "star" || pose.eyes === "normal" ? (
        <>
          <path d="M84 54 Q92 42 100 54" stroke="#3a2a10" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M110 54 Q118 42 126 54" stroke="#3a2a10" strokeWidth="6" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="92" cy="50" r="12" fill="#fff" stroke="#e6bc3c" strokeWidth="2" />
          <circle cx="118" cy="50" r="12" fill="#fff" stroke="#e6bc3c" strokeWidth="2" />
          <circle cx="92" cy="53" r="6" fill={PUPIL} />
          <circle cx="118" cy="53" r="6" fill={PUPIL} />
        </>
      )}
      <circle cx="78" cy="62" r="8" fill="#ff7b7b55" />
      <circle cx="132" cy="62" r="8" fill="#ff7b7b55" />
      {openNow ? (
        <ellipse cx="105" cy="70" rx="11" ry="9" fill="#7a1f2b" stroke="#5c1219" strokeWidth="2" />
      ) : (
        <path d="M89 62 Q105 84 121 62 Q105 71 89 62 Z" fill="#7a1f2b" stroke="#5c1219" strokeWidth="3" />
      )}
      {/* 火柴人身体：细线条 */}
      <line x1="105" y1="84" x2="105" y2="136" stroke={GOLD} strokeWidth="10" strokeLinecap="round" />
      <line x1="105" y1="100" x2="68" y2="118" stroke={GOLD} strokeWidth="9" strokeLinecap="round" transform={`rotate(${pose.armL + armWave} 105 100)`} />
      <line x1="105" y1="100" x2="142" y2="118" stroke={GOLD} strokeWidth="9" strokeLinecap="round" transform={`rotate(${pose.armR - armWave} 105 100)`} />
      <circle cx="68" cy="118" r="6.5" fill={GOLD} />
      <circle cx="142" cy="118" r="6.5" fill={GOLD} />
      {/* 小裙子：只到腰下，露腿 */}
      <path d="M85 128 L125 128 L132 156 L78 156 Z" fill={PINK} opacity="0.95" />
      <path d="M85 128 L125 128 L128 140 L82 140 Z" fill={PINK_DK} />
      {/* 细腿 + 蝴蝶结鞋 */}
      <line x1="105" y1="134" x2={94 - legSwing / 2} y2={180} stroke={GOLD} strokeWidth="10" strokeLinecap="round" />
      <line x1="105" y1="134" x2={116 + legSwing / 2} y2={180} stroke={GOLD} strokeWidth="10" strokeLinecap="round" />
      <path d="M84 182 q11 12 22 0" stroke={PINK_DK} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M106 182 q11 12 22 0" stroke={PINK_DK} strokeWidth="9" fill="none" strokeLinecap="round" />
    </svg>
  );
};

const Duo: React.FC<{ left: string; right: string; delay: number }> = ({ left, right, delay }) => {
  const TALKING = ["talk", "sing", "mic", "pointUp"];
  const sync = TALKING.includes(left) || TALKING.includes(right);
  return (
    <>
      <Sticker mode={left} side="left" delay={delay} forceTalk={sync} />
      <StickerKid mode={right} delay={delay + 0.12} forceTalk={sync} />
    </>
  );
};

/* ===================== 核心创新：无框浮动字 ===================== */

/** 从火柴人嘴里蹦出来，划抛物线飞到目标位置，落位后持续呼吸浮动 */
const PopWord: React.FC<{
  text: string;
  toX: number;
  toY: number;
  size: number;
  color: string;
  delay: number;
  from?: "l" | "r";
  arc?: number;
  float?: number;
  rotate?: number;
  dur?: number;
  weight?: number;
  toss?: number;
}> = ({ text, toX, toY, size, color, delay, from = "l", arc = 260, float = 9, rotate = 0, dur = 0.9, weight = 900, toss = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const src = from === "l" ? MOUTH_L : MOUTH_R;
  const t = frame / fps - delay;
  const reach = MOUTH_L.y - toY;
  const flight = flyUDur(frame, fps, delay, reach);
  const settle = flySettleDur(frame, fps, delay, reach);
  const arcK = Math.min(1, Math.abs(reach) / 1000);
  // 🚨 治"不像从嘴里吐出来"的第二招：离嘴近的元素飞行距离太短（老贾原话"好些都是从旁边出来的"，
  //    病根① reach 小 → 看着像原地放大）。这类元素自动加横向甩弧 toss，
  //    让它是"被甩出来"而不是"原地放大"。离得远的保持直线飞行，轨迹更清楚。
  //    幅度 150px（试过 190 会把 900px 宽的元素甩出屏外）。
  const autoToss = toss || (Math.abs(reach) < 600 ? 0.55 : 0);
  const tossDir = from === "l" ? 1 : -1;
  const tossX = autoToss * tossDir * Math.sin(flight * Math.PI) * 150;
  const x = src.x + (toX - src.x) * flight + tossX;
  const y = src.y + (toY - src.y) * flight - Math.sin(flight * Math.PI) * arc * arcK;
  // 落位回弹 + 站定后持续呼吸浮动
  const land = 1 + settle * 0.13;
  const bob = Math.sin(t * 2.4 + toX * 0.01) * float;
  const glow = 0.55 + 0.45 * Math.sin(t * 3.1);
  // 旋转：起飞时歪着飞出来，落位转正（左右嘴反向，像被甩出来）
  const spin = (from === "l" ? 1 : -1) * (18 + 10 * Math.sin(t * 1.3)) * (1 - flight);
  // 🫧 嘴里吐出的泡泡：吐出阶段可见，随进度胀大，飞走时破掉消失（老贾要的"鱼吐泡泡"）
  const hold = flyHold(frame, fps, delay);
  const bubbleR = size * (0.9 + 0.75 * hold);
  return (
    <>
      {hold > 0 && hold < 1 && (
        <div
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: bubbleR * 2,
            height: bubbleR * 2,
            marginLeft: -bubbleR,
            marginTop: -bubbleR,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%, ${color}44, ${color}18 55%, ${color}00 78%)`,
            border: `2.5px solid ${color}88`,
            boxShadow: `0 0 ${24 * hold}px ${color}66, inset 0 0 ${18 * hold}px ${color}55`,
            transform: `scale(${0.35 + 0.65 * hold})`,
            opacity: Math.sin(hold * Math.PI) * 0.95,
            zIndex: 19,
            pointerEvents: "none",
          }}
        />
      )}
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y + bob}px) translate(-50%,-50%) scale(${(0.14 + 0.86 * flight) * land}) rotate(${rotate + spin}deg)`,
        opacity: clamp01((t + 0.03) * 14),
        fontSize: size,
        fontWeight: weight,
        color,
        fontFamily: "Microsoft YaHei",
        whiteSpace: "nowrap",
        letterSpacing: 1,
        textShadow: `0 0 ${18 + 16 * glow}px ${color}, 0 0 ${44 + 26 * glow}px ${color}66, 0 5px 0 rgba(0,0,0,.55)`,
        zIndex: 20,
      }}
    >
      {text}
    </div>
    </>
  );
};

/** 数字从天而降，砸出冲击波纹 */
const SlamNumber: React.FC<{
  text: string;
  toX: number;
  toY: number;
  size: number;
  color: string;
  delay: number;
  sub?: string;
  subColor?: string;
}> = ({ text, toX, toY, size, color, delay, sub, subColor = CREAM }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - delay;
  // 自由落体
  const p = flyU(frame, fps, delay);
  const dropY = (1 - p) * -900;
  const squash = p > 0.9 ? 1 + Math.sin((p - 0.9) * 70) * 0.16 * (1 - p) / 0.1 : 1;
  // 冲击波
  const waveT = Math.max(0, t - 0.75);
  const waveR = waveT * 900;
  const waveA = Math.max(0, 1 - waveT * 1.5);
  const bob = Math.sin(t * 2.2) * 4;
  return (
    <>
      {waveA > 0 && (
        <div
          style={{
            position: "absolute",
            left: toX,
            top: toY,
            width: waveR * 2,
            height: waveR * 1.1,
            marginLeft: -waveR,
            marginTop: -waveR * 0.55,
            border: `${Math.max(1, 6 * waveA)}px solid ${color}`,
            borderRadius: "50%",
            opacity: waveA * 0.8,
            zIndex: 5,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: toX,
          top: toY + dropY + bob,
          transform: `translate(-50%,-50%) scaleY(${squash}) scaleX(${2 - squash})`,
          opacity: Math.min(1, p * 1.6),
          textAlign: "center",
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontSize: size,
            fontWeight: 900,
            color,
            fontFamily: "Microsoft YaHei",
            lineHeight: 1,
            whiteSpace: "nowrap",
            textShadow: `0 0 30px ${color}, 0 0 70px ${color}77, 0 6px 0 rgba(0,0,0,.6)`,
          }}
        >
          {text}
        </div>
        {sub && (
          <div
            style={{
              fontSize: Math.round(size * 0.34),
              fontWeight: 900,
              color: subColor,
              marginTop: 14,
              fontFamily: "Microsoft YaHei",
              whiteSpace: "nowrap",
              textShadow: `0 0 20px ${subColor}88, 0 4px 0 rgba(0,0,0,.5)`,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </>
  );
};

/** 自由漂浮的小标签（替代原来的框框） */
const FloatTag: React.FC<{
  text: string;
  toX: number;
  toY: number;
  size: number;
  color: string;
  delay: number;
  from?: "l" | "r";
  arc?: number;
  float?: number;
  dur?: number;
}> = ({ text, toX, toY, size, color, delay, from = "l", arc = 200, float = 12 }) => (
  <PopWord text={text} toX={toX} toY={toY} size={size} color={color} delay={delay} from={from} arc={arc} float={float} />
);

/** 彩色小气泡（语言那幕，气泡往上飘） */
const Bubble: React.FC<{ text: string; x: number; y: number; color: string; delay: number; drift: number; size: number }> = ({
  text, x, y, color, delay, drift, size,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - delay;
  const s = flyU(frame, fps, delay);
  const rise = t * drift;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y - rise,
        transform: `translate(-50%,-50%) scale(${0.3 + s * 0.7}) translateX(${Math.sin(t * 1.6) * 22}px)`,
        opacity: Math.max(0, 1 - rise / 700) * s,
        padding: "12px 24px",
        borderRadius: 999,
        background: "#0b1017cc",
        border: `3px solid ${color}`,
        boxShadow: `0 0 26px ${color}66`,
        fontSize: size,
        fontWeight: 900,
        color,
        fontFamily: "Microsoft YaHei",
        whiteSpace: "nowrap",
        zIndex: 18,
      }}
    >
      {text}
    </div>
  );
};

/** 声波条（代替原来的进度条框） */
const WaveBar: React.FC<{ pct: number; color: string; delay: number; x: number; y: number; w: number; label: string }> = ({
  pct, color, delay, x, y, w, label,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = flyU(frame, fps, delay);
  const t = frame / fps - delay;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, zIndex: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 900, color: CREAM, marginBottom: 8 }}>
        <span>{label}</span>
        <span style={{ color }}>●</span>
      </div>
      <div style={{ height: 22, borderRadius: 99, background: "#ffffff14", overflow: "hidden" }}>
        <div
          style={{
            width: `${pct * s * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg,${color},#ffffff66)`,
            boxShadow: `0 0 18px ${color}`,
            borderRadius: 99,
          }}
        />
      </div>
      <div style={{ height: 10 }} />
      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 34 }}>
        {Array.from({ length: 26 }).map((_, i) => {
          const h = 6 + 28 * Math.abs(Math.sin(t * 6 + i * 0.6)) * s;
          return <div key={i} style={{ width: 8, height: h, borderRadius: 3, background: color, opacity: 0.85 }} />;
        })}
      </div>
    </div>
  );
};

/* ===================== 场景外壳 ===================== */

const GhBadge: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = flyU(frame, fps, delay);
  return (
    <div
      style={{
        position: "absolute",
        top: 215,
        // 🚫 10/6 老贾问"角标放正中间还是最左边"——我判断放**左边**：老贾 IP 铁律是"每一个字都必须
        // 从老贾嘴里吐出来"，中间是整条视觉轴，画面重心和头 3 秒的两个巨字（前沿模型/白嫖了）都在
        // 正中间，角标再占正中间会跟主内容抢轴、把开场砸场的气势压掉；挪到左上角后，它退成"证件章"
        // 一样的背景存在，主内容独占中央，出字更干净。
        left: 64,
        transform: `translateX(${(1 - s) * -60}px) translateY(${(1 - s) * -50}px) scale(${0.5 + s * 0.5})`,
        opacity: s,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 30px",
        borderRadius: 999,
        background: "#0d1117cc",
        border: "3px solid #ffd24a",
        boxShadow: "0 0 36px #ffd24a66, inset 0 0 20px #ffd24a33",
        fontFamily: "Consolas,monospace",
        zIndex: 30,
      }}
    >
      <span style={{ fontSize: 50, color: GOLD, fontWeight: 900, textShadow: "0 0 18px #ffd24aaa" }}>⬡</span>
      <span style={{ fontSize: 46, color: GOLD, fontWeight: 900, textShadow: "0 0 20px #ffd24aaa" }}>0元做</span>
      <span style={{ fontSize: 46, color: GOLD, fontWeight: 900, textShadow: "0 0 20px #ffd24aaa" }}>AI</span>
      <span style={{ fontSize: 46, color: GOLD, fontWeight: 900, textShadow: "0 0 20px #ffd24aaa" }}>视频教程</span>
    </div>
  );
};

/* ══ 底部字幕（老贾 10/14：「有配音就必须有文字写在上面去」）═══════════════
 * 12 字一组随配音滚动，正在念的字点成金色；SceneShell 里统一挂 → 每幕都有
 */
const Subtitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = frame / fps;
  const seg: any = (rawChars as any[]).find((s: any) => now >= s.start - 0.25 && now <= s.end + 0.25);
  if (!seg) return null;
  const cs: Array<{ c: string; t: number }> = seg.chars || [];
  if (!cs.length) return null;
  const N = 10;
  const span = Math.max(0.6, seg.end - seg.start);
  const prog = clamp01((now - (seg.start - 0.25)) / (span + 0.5));
  const head = Math.floor((prog * cs.length) / N) * N;
  const chunk = cs.slice(head, head + N);
  return (
    <div
      style={{
        position: "absolute", left: 0, bottom: 486, width: 1080, zIndex: 40,
        display: "flex", justifyContent: "center", pointerEvents: "none",
      }}
    >
      <div
        style={{
          padding: "10px 24px", borderRadius: 16,
          background: "rgba(3,9,11,0.78)", border: "2px solid rgba(255,210,74,0.38)",
          boxShadow: "0 0 26px rgba(0,0,0,0.6)",
          fontSize: 40, fontWeight: 900, fontFamily: "Microsoft YaHei",
          whiteSpace: "nowrap", letterSpacing: 1,
        }}
      >
        {chunk.map((ch, i) => (
          <span key={i} style={{ color: now >= ch.t ? GOLD : "rgba(244,234,208,0.40)" }}>
            {ch.c}
          </span>
        ))}
      </div>
    </div>
  );
};

const PopButton: React.FC<{
  text: string;
  delay: number;
  x: number;
  y: number;
  color?: string;
  size?: number;
  from?: "l" | "r";
}> = ({ text, delay, x, y, color = GOLD, size = 58, from = "l" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = flyFromMouth(frame, fps, delay, x, y, from, 260);
  const t = frame / fps - delay;
  const pulse = 0.7 + 0.3 * Math.sin(t * 6);
  return (
    <>
      <MouthBubble x={f.x} y={f.y} r={100 * (0.8 + 0.6 * f.hold)} color={color} hold={f.hold} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translate(${f.x}px, ${f.y}px) translate(-50%,-50%) scale(${(0.18 + 0.82 * f.flight) * f.land * (0.94 + pulse * 0.06)}) rotate(${f.spin * 0.3}deg)`,
          opacity: clamp01((f.t + 0.03) * 14),
          padding: "18px 50px",
          borderRadius: 999,
          background: "#ffd24a1f",
          border: `4px solid ${color}`,
          boxShadow: `0 0 ${55 + 25 * pulse}px rgba(255,210,74,${pulse})`,
          whiteSpace: "nowrap",
          fontFamily: "Microsoft YaHei",
          zIndex: 20,
        }}
      >
        <span style={{ fontSize: size, fontWeight: 900, color, textShadow: "0 0 30px #ffd24a66" }}>{text}</span>
      </div>
    </>
  );
};

const SceneShell: React.FC<{ delay: number; left: string; right: string; children: React.ReactNode }> = ({ delay, left, right, children }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <GhBadge delay={delay} />
    {children}
    <Duo left={left} right={right} delay={delay + 0.25} />
    {/* 🚨 10/21 老贾原话："我是说把所有的字幕都去掉 不需要字幕了"
        → 全片取消底部字幕条（原来只有幕1 取消，现在 6 幕全不要） */}
  </div>
);

/* ============ 第14集骨架零件：Title / Panel / Chip / ProbBar ============ */
/* 层次铁律：每幕三层 = Title(顶部) + Panel(中部) + Chip(底部)，台阶慢出      */
/* 面板内的字一律用 PopWord 从火柴人嘴里吐出来，不许 opacity 淡入          */

const Title: React.FC<{ text: string; color?: string; size?: number; delay: number; top?: number }> = ({
  text,
  color = CREAM,
  size = 76,
  delay,
  top = 300,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 中文按字切、英文数字按词切（不能把 Claude 拆成 C-l-a-u-d-e 逐字飞）
  const tokens = (text.match(/[A-Za-z0-9.]+|[\u4e00-\u9fff]|\s+/g) || []).filter((x) => x.length > 0);
  const widthOf = (tk: string) => (/^[A-Za-z0-9.]+$/.test(tk) ? tk.length * size * 0.6 : size * 1.04);
  let acc = 540 - tokens.reduce((a, tk) => a + widthOf(tk), 0) / 2;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, zIndex: 14, pointerEvents: "none" }}>
      {tokens.map((tk, i) => {
        const w = widthOf(tk);
        const cx = acc + w / 2;
        acc += w;
        if (/^\s+$/.test(tk)) return null;
        const d = delay + i * 0.07;
        // 左右嘴交替吐（v6 铁律：框里吐字必须左右交替，不能靠 delay 奇偶自动判）
        const f = flyFromMouth(frame, fps, d, cx, top, i % 2 === 0 ? "l" : "r", 230);
        return (
          <React.Fragment key={i}>
            <MouthBubble x={f.x} y={f.y} r={50 * (0.8 + 0.6 * f.hold)} color={color} hold={f.hold} />
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translate(${f.x}px, ${f.y}px) translate(-50%,-50%) scale(${(0.16 + 0.84 * f.flight) * f.land}) rotate(${f.spin * 0.5}deg)`,
                opacity: clamp01((f.t + 0.03) * 14),
                fontSize: size,
                fontWeight: 900,
                color,
                fontFamily: "Microsoft YaHei",
                textShadow: `0 0 36px ${color}55`,
                whiteSpace: "pre",
              }}
            >
              {tk}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Panel: React.FC<{
  children: React.ReactNode;
  color?: string;
  delay: number;
  width?: number;
  top: number;
}> = ({ children, color = GREEN, delay, width = 920, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = springAt(frame, fps, delay, 15, 120);
  const t = frame / fps - delay;
  const pulse = 0.7 + 0.3 * Math.sin(t * 4);
  return (
    <div style={{ position: "absolute", left: 540 - width / 2, top, zIndex: 10 }}>
      <div
        style={{
          width,
          borderRadius: 34,
          padding: "34px 38px",
          background: "linear-gradient(160deg,#1c130dee,#0d1b16ee)",
          border: `3px solid ${color}`,
          boxShadow: `0 0 ${50 + 24 * Math.sin(t * 4)}px ${color}44`,
          transform: `translateY(${(1 - s) * 90}px) scale(${0.72 + s * 0.28}) rotate(${(1 - s) * -5}deg)`,
          opacity: s,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Chip: React.FC<{ text: string; color: string; delay: number; y?: number; from?: "l" | "r" }> = ({
  text,
  color,
  delay,
  y = 1300,
  from = "r",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = flyFromMouth(frame, fps, delay, 540, y, from, 200);
  return (
    <>
      <MouthBubble x={f.x} y={f.y} r={74 * (0.85 + 0.6 * f.hold)} color={color} hold={f.hold} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translate(${f.x}px, ${f.y}px) translate(-50%,-50%) scale(${(0.18 + 0.82 * f.flight) * f.land}) rotate(${f.spin * 0.6}deg)`,
          opacity: clamp01((f.t + 0.03) * 14),
          padding: "11px 30px",
          borderRadius: 999,
          background: "#111118dd",
          border: `3px solid ${color}88`,
          boxShadow: `0 0 30px ${color}44`,
          zIndex: 12,
          whiteSpace: "nowrap",
          fontFamily: "Microsoft YaHei",
        }}
      >
        <span style={{ fontSize: 36, fontWeight: 900, color }}>{text}</span>
      </div>
    </>
  );
};

const ProbBar: React.FC<{ pct: number; color: string; delay: number }> = ({ pct, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = springAt(frame, fps, delay, 18, 90);
  return (
    <div style={{ height: 22, borderRadius: 99, background: "#ffffff12", marginTop: 10, overflow: "hidden", border: `2px solid ${color}66` }}>
      <div style={{ width: `${pct * s * 100}%`, height: "100%", background: `linear-gradient(90deg,${color},#ffffff55)`, boxShadow: `0 0 22px ${color}` }} />
    </div>
  );
};

/* ===================== 6 幕 · 16集节奏 + 14集三层骨架 =====================
 * 字号 5 档：44(注释/Chip) / 76(标题/副主角) / 80(面板数据) / 82(胶囊) / 120(巨字)
 * 场景无缝衔接，片尾覆盖 50.5s
 * 面板内文字全部 PopWord 从嘴吐出
 */

/* ===================== 6 幕 · 16集节奏 + 14集三层骨架 =====================
 * 字号 5 档：44 / 76 / 80 / 82 / 120
 * 场景无缝衔接，片尾覆盖 50.5s
 * ⚠️ PopWord 是 position:absolute —— 写在 Panel 内部时 toX/toY 是"相对面板左上角"的偏移，
 *    面板 outer 在 left=80, top=<Panel top>。面板外用绝对坐标，面板内必须减掉 80 和 top。
 * 三层：Title(顶部) + Panel(中部) + Chip(底部)
 */

/* ===================== 6 幕 · 16集节奏 + 14集三层骨架 =====================
 * 字号 5 档：44 / 76 / 80 / 82 / 120
 * 场景无缝衔接，片尾覆盖 50.5s
 * ⚠️ PopWord 是 position:absolute —— 写在 Panel 内部时 toX/toY 是"相对面板左上角"的偏移，
 *    面板 outer 在 left=80, top=<Panel top>。面板外用绝对坐标，面板内必须减掉 80 和 top。
 * 三层：Title(顶部) + Panel(中部) + Chip(底部)
 */

/* ===================== 6 幕 · 16集节奏 + 14集三层骨架 =====================
 * 字号 5 档：44 / 76 / 80 / 82 / 120
 * 场景无缝衔接，片尾覆盖 50.5s
 * ⚠️ PopWord 是 position:absolute —— 写在 Panel 内部时 toX/toY 是"相对面板左上角"的偏移，
 *    面板 outer 在 left=80, top=<Panel top>。面板外用绝对坐标，面板内必须减掉 80 和 top。
 * 三层：Title(顶部) + Panel(中部) + Chip(底部)
 */

/* ===================== 6 幕 · 16集节奏 + 14集三层骨架 =====================
 * 字号 5 档：44 / 76 / 80 / 82 / 120
 * 场景无缝衔接，片尾覆盖 50.5s
 * ⚠️ PopWord 是 position:absolute —— 写在 Panel 内部时 toX/toY 是"相对面板左上角"的偏移，
 *    面板 outer 在 left=80, top=<Panel top>。面板外用绝对坐标，面板内必须减掉 80 和 top。
 * 三层：Title(顶部) + Panel(中部) + Chip(底部)
 */

/* 斜切警示条（老贾：长框框不好看，换形状） */
const WarnBar: React.FC<{ toY: number; w: number; h: number; delay: number }> = ({ toY, w, h, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = flyU(frame, fps, delay);
  const t = frame / fps - delay;
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - w / 2,
        top: toY - h / 2,
        width: w,
        height: h,
        zIndex: 8,
        clipPath: "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)",
        background: "linear-gradient(100deg,#2a0f12f0,#160a0ce0)",
        boxShadow: `0 0 ${44 + 20 * Math.sin(t * 4)}px #ff7b7b55`,
        transform: `translateX(${(1 - s) * -70}px) scale(${0.86 + s * 0.14})`,
        opacity: s,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%)",
          background: "none",
          border: "none",
        }}
      />
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
        <polygon
          points={`${w * 0.05},1 ${w - 1},1 ${w * 0.95},${h - 1} 1,${h - 1}`}
          fill="none"
          stroke="#ff7b7b"
          strokeWidth="4"
        />
      </svg>
    </div>
  );
};

const slam = (frame: number, fps: number, landFrame: number) => {
  const age = (frame - landFrame) / fps;
  const impact = age < 0 ? 0 : Math.max(0, 1 - age * 3.4);
  return {
    impact,
    squash: impact * 0.3,
    shx: Math.sin(frame * 2.7) * impact * 15,
    shy: Math.cos(frame * 3.3) * impact * 15,
  };
};

/* 从天上砸下来的项目名：深红实底框 + 金色字，框和字一起砸一起压扁回弹（老贾 10/10 定） */
const SlamText: React.FC<{
  text: string;
  frame: number;
  fps: number;
  landFrame: number;
  y: number;
  size: number;
  color: string;
  from?: "l" | "r";
  box?: boolean;
}> = ({ text, frame, fps, landFrame, y, size, color, from = "l", box = false }) => {
  const t0 = (landFrame - 22) / fps;
  const t = Math.max(0, frame / fps - t0);
  const g = 11000;
  const target = y;
  const drop = -1100 + 0.5 * g * t * t;
  const cur = Math.min(target, drop);
  const { impact, squash, shx, shy } = slam(frame, fps, landFrame);
  const sc = clamp01((frame - (landFrame - 22)) / 6);
  const inner = (
    <span
      style={{
        fontSize: size,
        fontWeight: 900,
        color,
        fontFamily: "Microsoft YaHei",
        whiteSpace: "nowrap",
        textShadow: box
          ? `0 6px 18px rgba(0,0,0,0.75), 0 0 ${30 + impact * 70}px ${color}aa`
          : `0 0 ${40 + impact * 60}px ${color}`,
      }}
    >
      {text}
    </span>
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 540 + shx,
        top: 0,
        transform: `translateY(${cur + shy}px) translate(-50%,-50%) scale(${(0.6 + sc * 0.4) * (1 + squash)},${(
          0.6 + sc * 0.4
        ) * (1 - squash)})`,
        zIndex: 20,
        opacity: sc,
      }}
    >
      {box ? (
        <div
          style={{
            padding: "20px 62px 26px",
            borderRadius: 20,
            background: "linear-gradient(175deg,#9c1018 0%,#6d070d 55%,#4a0409 100%)",
            border: `5px solid ${color}`,
            boxShadow: `0 0 ${44 + impact * 90}px rgba(255,80,70,${0.3 + impact * 0.45}), inset 0 0 44px rgba(0,0,0,0.62)`,
          }}
        >
          {inner}
        </div>
      ) : (
        inner
      )}
    </div>
  );
};

/* 数字滚动：从嘴里吐出泡泡飞到位的同时，数字从 0 滚到目标值，带千分位（照第24集 v22 做法） */
const CountUp: React.FC<{
  to: number;
  toX: number;
  toY: number;
  delay: number;
  size?: number;
  color?: string;
  suffix?: string;
  arc?: number;
}> = ({ to, toX, toY, delay, size = 96, color = GOLD, suffix = "", arc = 260 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const src = MOUTH_R;
  const reach = MOUTH_L.y - toY;
  const flight = flyUDur(frame, fps, delay, reach);
  const settle = flySettleDur(frame, fps, delay, reach);
  const hold = flyHold(frame, fps, delay);
  const t = Math.max(0, frame / fps - delay - 0.75);
  const n = Math.min(to, Math.round(to * Math.min(1, t / 1.15)));
  const land = 1 + settle * 0.13;
  const arcK = Math.min(1, Math.abs(reach) / 1000);
  const autoToss = Math.abs(reach) < 600 ? 0.55 : 0;
  const tossX = autoToss * -1 * Math.sin(flight * Math.PI) * 150;
  const x = src.x + (toX - src.x) * flight + tossX;
  const y = src.y + (toY - src.y) * flight - Math.sin(flight * Math.PI) * arc * arcK;
  const comma = (v: number) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (
    <>
      <MouthBubble x={x} y={y} r={86 * (0.85 + 0.6 * hold)} color={color} hold={hold} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 16,
          transform: `translate(${x}px, ${y}px) translate(-50%,-50%) scale(${0.2 + flight * 0.8}) scale(${land})`,
          opacity: clamp01((flight + 0.03) * 14),
        }}
      >
        <span
          style={{
            fontSize: size,
            fontWeight: 900,
            color,
            fontFamily: "Microsoft YaHei",
            textShadow: `0 0 36px ${color}66`,
            whiteSpace: "nowrap",
          }}
        >
          {comma(n)}
          {suffix}
        </span>
      </div>
    </>
  );
};

/* 异形卡片（老贾 10/5 下午："你可以搞圆形的，各种各样形状，把字体装进去"）
   kind：circle 圆 / squircle 圆方 / pill 药丸 / hex 六边 / diamond 菱形 / star 五角星
   drop=true 时整个图形从天上垂下来（老贾："关键句从天上砸下来…突出的是垂下的那种震撼的感觉"） */
const ShapeCard: React.FC<{
  kind: "circle" | "squircle" | "hex" | "pill" | "diamond" | "star";
  toX: number;
  toY: number;
  size: number;
  color: string;
  delay: number;
  drop?: boolean;
  from?: "l" | "r";
}> = ({ kind, toX, toY, size, color, delay, drop = false, from = "l" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = flyFromMouth(frame, fps, delay, toX, toY, from, 220);
  const s = f.flight;
  const t = f.t;
  // 🚫 垂降：先从嘴里飞出来到位正上方，最后 28% 行程自由落体砸下 + 落地压扁
  const dropY = drop ? clamp01(1 - s / 0.72) * -820 : 0;
  const squash = drop && s > 0.88 ? 1 + Math.sin((s - 0.88) * 62) * 0.11 * (1 - s) / 0.12 : 1;
  const radius = kind === "circle" || kind === "pill" ? "50%" : kind === "hex" ? 18 : kind === "diamond" ? 8 : kind === "star" ? 10 : 30;
  const clip =
    kind === "hex"
      ? "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
      : kind === "diamond"
        ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
        : kind === "star"
          ? "polygon(50% 0%, 61% 34%, 98% 35%, 68% 57%, 80% 92%, 50% 70%, 20% 92%, 32% 57%, 2% 35%, 39% 34%)"
          : undefined;
  return (
    <>
      <MouthBubble x={f.x} y={f.y} r={size * (0.36 + 0.26 * f.hold)} color={color} hold={f.hold} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: size,
          height: size,
          borderRadius: radius,
          clipPath: clip,
          zIndex: 8,
          background: `linear-gradient(160deg, ${color}33, #0a1412e6)`,
          border: `4px solid ${color}`,
          boxShadow: `0 0 ${46 + 22 * Math.sin(t * 4)}px ${color}66, inset 0 0 40px ${color}22`,
          transform: `translate(${f.x}px, ${f.y + dropY}px) translate(-50%,-50%) scaleY(${squash}) scaleX(${2 - squash}) scale(${(0.34 + s * 0.66) * f.land}) rotate(${f.spin}deg)`,
          opacity: clamp01((t + 0.03) * 14),
        }}
      />
    </>
  );
};

/* 纯进度条（WaveBar 自带标签行，会跟别的字撞） */
const Bar: React.FC<{ x: number; y: number; w: number; pct: number; color: string; delay: number }> = ({
  x,
  y,
  w,
  pct,
  color,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = flyU(frame, fps, delay);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: 20,
        borderRadius: 99,
        background: "#ffffff14",
        overflow: "hidden",
        border: `2px solid ${color}55`,
        zIndex: 18,
        opacity: s,
      }}
    >
      <div
        style={{
          width: `${pct * s * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg,${color},#ffffff66)`,
          boxShadow: `0 0 20px ${color}`,
        }}
      />
    </div>
  );
};

/* 立体卡（老贾：开头要像第16集那样有立体卡、层次感） */
const Card: React.FC<{ toY: number; w: number; h: number; color: string; delay: number }> = ({
  toY,
  w,
  h,
  color,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = flyU(frame, fps, delay);
  const t = frame / fps - delay;
  return (
    <div
      style={{
        position: "absolute",
        left: 540 - w / 2,
        top: toY - h / 2,
        width: w,
        height: h,
        borderRadius: 30,
        zIndex: 8,
        background: `linear-gradient(160deg, ${color}26, #0a1412e0)`,
        border: `3px solid ${color}99`,
        boxShadow: `0 0 ${46 + 22 * Math.sin(t * 4)}px ${color}55, inset 0 0 40px ${color}18`,
        transform: `scale(${0.82 + s * 0.18})`,
        opacity: s,
      }}
    />
  );
};

/* 终端窗（第22集新图形：老贾"不能千篇一律"，这是第5种——终端窗代替长框框）
   窗内一个字都不写死：所有字都靠 PopWord 从火柴人嘴里吐进来 */
const TermWin: React.FC<{ delay: number; top?: number; h?: number; w?: number; from?: "l" | "r" }> = ({
  delay,
  top = 560,
  h = 380,
  w = 860,
  from = "l",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = flyFromMouth(frame, fps, delay, 540, top + h / 2, from, 220);
  const t = f.t;
  return (
    <>
      <MouthBubble x={f.x} y={f.y} r={120 * (0.8 + 0.6 * f.hold)} color={GREEN} hold={f.hold} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: w,
          height: h,
          transform: `translate(${f.x}px, ${f.y}px) translate(-50%,-50%) scale(${(0.3 + 0.7 * f.flight) * f.land}) rotate(${f.spin * 0.35}deg)`,
          opacity: clamp01((t + 0.03) * 14),
          borderRadius: 20,
          zIndex: 8,
          overflow: "hidden",
          background: "linear-gradient(160deg,#0d1117f4,#05070af4)",
          border: `3px solid ${GREEN}`,
          boxShadow: `0 0 ${44 + 22 * Math.sin(t * 4)}px ${GREEN}55, inset 0 0 50px ${GREEN}11`,
        }}
      >
        <div
          style={{
            height: 46,
            background: "#161b22",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 10,
            borderBottom: `2px solid ${GREEN}44`,
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff5f57" }} />
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#febc2e" }} />
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#28c840" }} />
        </div>
      </div>
    </>
  );
};

/* ============ 真实 GitHub 页面证据卡（第26集先上，本集照做）============
 * 老贾 10/11 原话："你做口播有什么用，看不到真东西"
 * 做法：老贾嘴里飞出一个 mac 浏览器窗口（红黄绿三点 + 地址栏），窗里是当天用 playwright
 *      真截的 GitHub 仓库页，再用 outline 脉冲框圈住页面上的真数字。
 *      ⚠️ 框只能用 outline，绝不能加金色背景或强 inset 发光 —— 那样会把 GitHub 的灰字
 *         糊成一片，OCR 都读不出来（症状：只剩个"☆Sta"），这是第26集踩过的坑。
 * 退场：out 传一个绝对秒数，到点整张网页"吸回嘴里"缩小消失 —— 数字讲完就收，
 *      后面的话让给原来那些字，不然两样东西挤在同一屏。
 * ⚠️ 标注坐标是 playwright 实测的（视口 1280×900 · scrollY=0）：
 *      Issues 112 标签 x120 y130 w95 h36 · Pull requests 282 x240 y130 w190 h36
 *      Fork 8.5k x1038 y190 w100 h32 · Star 66.5k x1148 y190 w110 h32
 * ⚠️ 一改截图或视口就必须重测这几个数，不然框就框歪了。
 */
const EVID_MARK = [
  { x: 120, y: 130, w: 95, h: 36 },
  { x: 240, y: 130, w: 190, h: 36 },
  { x: 1038, y: 190, w: 100, h: 32 },
  { x: 1148, y: 190, w: 110, h: 32 },
];

const EvidenceCard: React.FC<{
  delay: number;
  from?: "l" | "r";
  w?: number;
  top?: number;
  out?: number;
  url?: string;
  caption?: string;
}> = ({ delay, from = "l", w = 1000, top = 800, out = 0, url = "github.com/calesthio/OpenMontage", caption = "" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const barH = 46;
  const addrH = 40;
  const innerW = w - 20;
  const innerH = 614;
  const f = flyFromMouth(frame, fps, delay, 540, top, from, 240);
  const S = innerW / 1280;
  const bob = Math.sin(f.t * 2.2) * 5;
  const pulse = 0.5 + 0.5 * Math.sin(f.t * 5);
  const retreat = out > 0 ? clamp01((f.t - out) / 0.55) : 0;
  const src = from === "l" ? MOUTH_L : MOUTH_R;
  const rx = f.x + (src.x - f.x) * easeInOutCubic(retreat);
  const ry = f.y + (src.y - f.y) * easeInOutCubic(retreat);
  const rs = (0.3 + 0.7 * f.flight) * f.land * (1 - retreat * 0.9);
  const rop = clamp01((f.t + 0.03) * 14) * (1 - retreat);
  if (rop <= 0) return null;
  return (
    <>
      <MouthBubble x={rx} y={ry} r={150 * (0.8 + 0.6 * f.hold) * (1 - retreat)} color={GOLD} hold={f.hold} kind="hex" />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: w,
          height: barH + addrH + innerH,
          transform: `translate(${rx}px, ${ry + bob * (1 - retreat)}px) translate(-50%,-50%) scale(${rs}) rotate(${f.spin * 0.3 - retreat * 26}deg)`,
          opacity: rop,
          borderRadius: 20,
          zIndex: 9,
          overflow: "hidden",
          background: "linear-gradient(160deg,#0d1117f6,#05070af6)",
          border: `3px solid ${GOLD}`,
          boxShadow: `0 0 ${44 + 22 * Math.sin(f.t * 4)}px ${GOLD}55, inset 0 0 50px ${GOLD}11`,
        }}
      >
        <div
          style={{
            height: barH,
            background: "#161b22",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 10,
            borderBottom: `2px solid ${GOLD}44`,
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#ff5f57" }} />
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#febc2e" }} />
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#28c840" }} />
        </div>
        <div
          style={{
            height: addrH,
            background: "#0d1117",
            display: "flex",
            alignItems: "center",
            padding: "0 22px",
            gap: 12,
            borderBottom: `2px solid ${GOLD}33`,
          }}
        >
          <span style={{ fontSize: 22, color: GREEN }}>🔒</span>
          <span style={{ fontSize: 25, color: CREAM, fontWeight: 700 }}>{url}</span>
        </div>
        <div style={{ position: "relative", width: innerW, height: innerH, margin: "0 10px", overflow: "hidden" }}>
<Img
            src={staticFile("gh_modder.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
          />
          {EVID_MARK.map((m, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: m.x * S,
                top: m.y * S,
                width: m.w * S,
                height: m.h * S,
                outline: `3px solid ${GOLD}`,
                outlineOffset: 2,
                borderRadius: 10,
                boxShadow: `0 0 ${6 + 12 * pulse}px ${GOLD}66`,
                opacity: 0.82 + 0.18 * pulse,
              }}
            />
          ))}
          {caption ? (
            <div
              style={{
                position: "absolute", left: 0, right: 0, bottom: 0,
                padding: "14px 26px 16px",
                background: "linear-gradient(transparent, #05070aee 38%)",
                fontSize: 30, color: CREAM, fontWeight: 700, lineHeight: 1.34,
                letterSpacing: 0.5, opacity: clamp01((f.t - 0.35) * 3),
                transform: `translateY(${(1 - clamp01((f.t - 0.35) * 3)) * 14}px)`,
              }}
            >
              {caption}
            </div>
          ) : null}

        </div>
      </div>
    </>
  );
};

/* ============ 第28集·OpenMontage（calesthio/OpenMontage，10/11 GitHub API 实测
 *    66,536★ / 8,477 forks / 112 个未解决 issue / AGPL-3.0 / Python / 创建 2026-03-29） ============
 * 🔥 v13 标准（老贾 10/6 定案）：
 *   ①框框/标题/药丸/终端窗全部从火柴人嘴里飞出、带泡泡、框先落位字再吐进去
 *   ②开头三秒钩子前置：第一句直接甩数字，不铺垫
 *   ③开头结构避开前几集：25集=巨字对撞+大圆 / 26集=垂直三连巨字 / 27集=左右对峙+六边垂降
 *      本集 =【左右对峙 + 下方三块并排】（数字对比：六万四千星 vs 今天第一）
 * 图形不重样：巨字对撞 → 圆 → 三圆方 → 菱形垂降 → 终端窗 → 六边
 * ⚠️ 诚实点：要钱的那条线 60 秒片约 1.5 美元；仓库 355 个未解决 issue，新项目看
 */
const LEAD_LOCAL = 0.5; // 提字提前量：嘴里含 TYPE_HOLD + 飞 TYPE_FLY 差不多这么久，正好念到时落位
const TypeIn: React.FC<{
  text: string;
  delay: number;
  x: number;
  y: number;
  size: number;
  color: string;
  from?: "l" | "r";
  step?: number;
  colors?: string[];
  jitter?: boolean;
  glow?: number;
  segNo?: number;
  match?: string;
}> = ({ text, delay, x, y, size, color, from = "l", step = 0.16, colors, jitter = false, glow, segNo, match }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = [...text];
  const wOf = (ch: string) => (/[A-Za-z0-9.$]/.test(ch) ? size * 0.58 : ch === " " ? size * 0.34 : size * 1.02);
  const total = chars.reduce((a, c) => a + wOf(c), 0);
  let acc = x - total / 2;

  /* 逐字时刻：优先用口播真实时间戳；拿不到就按固定 step */
  /* 🚨 10/10 老贾：「26集幕5第三句没有文案出来」
   * 病根：charAt(needle) 取的是这段话**最后一个字**的时刻再减 LEAD 当起点，
   * 画面字一多(18字)按比例往后摊，最后几个字被推到 42.4s，
   * 而这一幕 42.07s 就切走了 —— 字还在飞，幕没了。
   * 改：锚点取口播里**第一个字**的时刻整行铺开，绝不会再被推到幕外。 */
  let abs: number[] = [];
  if (segNo) {
    const seg = cues.find((c) => c.i === segNo);
    const needle = match || text;
    if (seg) {
      const s = seg.chars.map((v) => v.c).join("");
      const idx = s.indexOf(needle);
      if (idx >= 0) {
        const ts = seg.chars.slice(idx, idx + needle.length).map((v) => v.t);
        if (ts.length > 1) {
          const per = (ts[ts.length - 1] - ts[0]) / (needle.length - 1);
          abs = chars.map((_, i) => ts[0] - LEAD_LOCAL + (chars.length > 1 ? per * i : 0));
          /* 🚨 10/12 老贾：「你设计的太快了…你既然拍了文案拍了语音，你就要把它朗读出来」
             病根：TypeIn 默认按口播时间戳摊字，口播念得快时（如"把AI助手变成视频制作室"
             一句 2 秒念完 11 个字），字就 0.18 秒一个地一窝蜂全飞出来，观众根本读不到——
             逐字吐字的"乐趣"就被损坏了。
             改法：给每字加【最小间隔】MIN_STEP=0.2 秒。字不够慢就顺延整行（shift 累加），
             不改任何文案、不改配音，只是让吐字的速度慢下来、跟得上朗读。 */
          const MIN_STEP = 0.2;
          let shift = 0;
          const slowed: number[] = [];
          for (let i = 0; i < abs.length; i++) {
            const want = abs[i] + shift;
            const put = i === 0 ? want : Math.max(want, slowed[i - 1] + MIN_STEP);
            shift += put - want;
            slowed.push(put);
          }
          abs = slowed;
        }
      }
    }
  }
  const dOf = (i: number) => (abs.length ? abs[i] : delay + i * step);

  const reach = MOUTH_L.y - y;
  const arcK = Math.min(1, Math.abs(reach) / 1000);
  const toss = Math.abs(reach) < 600 ? 1 : 0;

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, zIndex: 15, pointerEvents: "none" }}>
      {chars.map((ch, i) => {
        const w = wOf(ch);
        const cx = acc + w / 2;
        acc += w;
        if (ch === " ") return <span key={i} style={{ position: "absolute", left: cx - w / 2, top: y, width: w, height: size * 1.2 }} />;
        /* 每颗字都从嘴里飞出来：左右嘴交替，from 在这里显式写死，不靠 delay 奇偶自动判（IP 铁律第4条） */
        const side: "l" | "r" = i % 2 === 0 ? from : from === "l" ? "r" : "l";
        const src = side === "l" ? MOUTH_L : MOUTH_R;
        const d = dOf(i);
        const t = frame / fps - d;
        const hold = t >= 0 && t < TYPE_HOLD ? t / TYPE_HOLD : 0;
        const flight = clamp01((t - TYPE_HOLD) / TYPE_FLY);
        const settle = clamp01((t - TYPE_HOLD - TYPE_FLY) / 0.14);
        const arcK2 = arcK;
        const tx = src.x + (cx - src.x) * flight + toss * (side === "l" ? 1 : -1) * Math.sin(flight * Math.PI) * 120;
        const ty = src.y + (y - src.y) * flight - Math.sin(flight * Math.PI) * 210 * arcK2;
        const spin = (side === "l" ? 1 : -1) * (10 + 6 * Math.sin(t * 1.3)) * (1 - flight);
        const land = 1 + settle * 0.1;
        const since = Math.max(0, t - TYPE_HOLD - TYPE_FLY);
        const k = jitter ? Math.max(0, 1 - since / 0.6) : 0;
        const rot = Math.sin(since * 7 + i * 1.7) * 1.4 * k + spin * 0.3;
        const dy = Math.sin(since * 5.5 + i * 2.3) * 2.5 * k;
        const col = colors ? colors[i % colors.length] : color;
        return (
          <React.Fragment key={i}>
            <MouthBubble x={tx} y={ty} r={size * 1.05 * (0.85 + 0.6 * hold)} color={col} hold={hold} />
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform:
                  `translate(${tx}px, ${ty}px) translate(-50%,-50%) scale(${(0.22 + 0.78 * flight) * land}) rotate(${rot}deg) translateY(${dy}px)`,
                opacity: clamp01((t + 0.02) * 16) * clamp01(flight * 6 + 0.35),
                fontSize: size,
                fontWeight: 900,
                color: col,
                fontFamily: "Microsoft YaHei",
                whiteSpace: "pre",
                textShadow: `0 0 ${glow ?? 30}px ${col}${colors ? "aa" : "bb"}`,
              }}
            >
              {ch}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Boom: React.FC<{ frame: number; x: number; y: number; max: number; color: string; start: number; life?: number }> = ({
  frame,
  x,
  y,
  max,
  color,
  start,
  life = 16,
}) => {
  const p = (frame - start) / life;
  if (p < 0 || p > 1) return null;
  const e = 1 - Math.pow(1 - p, 3);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, zIndex: 6, pointerEvents: "none" }}>
      <circle cx={x} cy={y} r={30 + e * max} fill="none" stroke={color} strokeWidth={Math.max(2, 16 * (1 - p))} opacity={(1 - p) * 0.9} />
      <circle cx={x} cy={y} r={10 + e * max * 0.55} fill="none" stroke={color} strokeWidth={Math.max(1, 4 * (1 - p))} opacity={(1 - p) * 0.4} />
    </svg>
  );
};


const TYPE_HOLD = 0.16; // 嘴里含着的时间（看得见泡泡胀大）
const TYPE_FLY = 0.42;  // 飞到位的时间
/* 小长方形格子：老贾 10/12 点名要的东西——「把 AI 助手变成视频制作室」
   拆成两个小长方形，字逐字吐进框里。老贾原话「简单些」，所以不做售货机那套大机器，
   就两个框：框先落位，字再一个一个飞进去。 */
const Slot: React.FC<{ x: number; y: number; w: number; h: number; delay: number; color?: string }> = ({
  x, y, w, h, delay, color = GOLD,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = clamp01((frame / fps - delay) / 0.32);
  if (p <= 0) return null;
  const e = 1 - Math.pow(1 - p, 3);
  return (
    <div
      style={{
        position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h,
        borderRadius: 14, boxSizing: "border-box",
        background: "linear-gradient(180deg,#00000070,#00000028)",
        border: `2px solid ${color}55`,
        boxShadow: `0 0 ${20 * (1 - p)}px ${color}44, inset 0 0 30px ${color}11`,
        opacity: e, transform: `scale(${0.88 + 0.12 * e})`,
        zIndex: 9, pointerEvents: "none",
      }}
    />
  );
};


/* ↓ 从第24集搬来：BurstFree（绿字+绿泡泡，绿=免费）★定型第一幕要用 */
const BurstFree: React.FC<{
  text: string;
  delay: number;
  x: number;
  y: number;
  size: number;
  color?: string;
  from?: "l" | "r";
}> = ({ text, delay, x, y, size, color = GREEN, from = "l" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = flyFromMouth(frame, fps, delay, x, y, from, 220);
  const t = f.t;
  const LAND = 1.55; // 泡泡到位那一刻（FLY_HOLD 0.85 + FLY_DUR 0.7）
  const out = clamp01((t - LAND) / 0.22); // 字从破泡里蹦出来
  const pop = clamp01((t - LAND) / 0.16); // 泡泡炸开
  const ring = clamp01((t - LAND) / 0.55); // 绿色脉冲环
  const pulse = out < 1 ? Math.sin(out * Math.PI) * 0.26 : 0;
  const chars = [...text];
  const wOf = (ch: string) => (/[A-Za-z0-9.$]/.test(ch) ? size * 0.58 : ch === " " ? size * 0.34 : size * 1.02);
  const total = chars.reduce((a, c) => a + wOf(c), 0);
  let acc = x - total / 2;
  return (
    <>
      {t < LAND && (
        <div
          style={{
            position: "absolute",
            left: f.x,
            top: f.y,
            width: 118,
            height: 118,
            marginLeft: -59,
            marginTop: -59,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%, ${color}66, ${color}22 55%, ${color}00 78%)`,
            border: `3px solid ${color}aa`,
            boxShadow: `0 0 34px ${color}88, inset 0 0 24px ${color}66`,
            transform: `scale(${(0.3 + f.flight * 0.7) * (1 + pop * 0.9)})`,
            opacity: (1 - pop) * Math.max(0, f.flight),
            zIndex: 19,
          }}
        />
      )}
      {ring > 0 && ring < 1 && (
        <div
          style={{
            position: "absolute",
            left: x - 96 * ring,
            top: y - 96 * ring,
            width: 192 * ring,
            height: 192 * ring,
            borderRadius: "50%",
            border: `4px solid ${color}`,
            opacity: (1 - ring) * 0.8,
            zIndex: 18,
          }}
        />
      )}
      {chars.map((ch, i) => {
        const w = wOf(ch);
        const cx = acc + w / 2;
        acc += w;
        if (ch === " ") return null;
        const io = clamp01((out - i * 0.12) / 0.5);
        if (io <= 0) return null;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: cx - w / 2,
              top: y - size * 0.62,
              fontSize: size,
              fontWeight: 900,
              color,
              fontFamily: "Microsoft YaHei",
              whiteSpace: "pre",
              opacity: io,
              transform: `scale(${(0.25 + io * 0.75) * (1 + Math.sin(io * Math.PI) * pulse)})`,
              textShadow: `0 0 ${26 + (1 - io) * 40}px ${color}`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </>
  );
};

/* 🚨 10/10 老贾铁律复查（"所有造型框里的文案，必须火柴人才能嘴里吐出来"）：
 * 幕6 那个金色大圆角按钮原来写的是 flyU（原地缩放淡入）= 违规，
 * 改成从嘴里飞出 + 带泡泡，框和框里的字一起吐出来。 */
/* 幕1 · 重做版（老贾10/18：节奏感强 + 聚焦眼睛 + 有配音就有文案）
 * 病根：旧版从上往下一个个出现，元素铺满要7秒，后面10秒画面空着 → 眼睛没处停。
 * 改法：照第1段口播逐句给画面，每句一个变化点，1.5-2秒一变，9个变化点填满整幕。
 */
/* 🚨 10/21 老贾："0.5秒的钩子要逐字逐字飞出来"
   PopWord 是整块飞出、而且第一块在这幕算不出飞行（字没飞出去，屏幕上方一直空）。
   这里自己写飞行数学：每个字按自己念到的时刻，从老贾嘴里一个一个飞到位，排成一行。
   出处统一用 MOUTH_L/MOUTH_R，跟全片"每个字都有出处"一条铁律一致。 */
const FlyChars: React.FC<{
  segNo: number;
  needle: string;
  toX: number;
  toY: number;
  size: number;
  color: string;
  from?: "l" | "r";
}> = ({ segNo, needle, toX, toY, size, color, from = "l" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seg = cues.find((c) => c.i === segNo);
  if (!seg) return null;
  const s = seg.chars.map((x) => x.c).join("");
  const idx = s.indexOf(needle);
  if (idx < 0) return null;
  const cs = seg.chars.slice(idx, idx + needle.length);
  const step = size * 1.04;
  const src = from === "l" ? MOUTH_L : MOUTH_R;
  const HOLD = 0.35;   // 嘴里含着、泡泡胀大
  const FLY = 0.45;    // 破泡飞走
  const reach = MOUTH_L.y - toY;
  const arcK = Math.min(1, Math.abs(reach) / 1000);
  return (
    <>
      {cs.map((c, i) => {
        const delay = Math.max(c.t - (HOLD + FLY), 0.35 + i * 0.035);
        const t = frame / fps - delay;
        const flight = easeInOutCubic(clamp01((t - HOLD) / FLY));
        const after = t - HOLD - FLY;
        const settle = after > 0 ? Math.sin(after * 21) * Math.exp(-after * 8) : 0;
        const x = src.x + (toX + (i - (cs.length - 1) / 2) * step - src.x) * flight;
        const y = src.y + (toY - src.y) * flight - Math.sin(flight * Math.PI) * 200 * arcK;
        const spin = (from === "l" ? 1 : -1) * (16 + 8 * Math.sin(t * 1.3)) * (1 - flight);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translate(${x}px, ${y}px) translate(-50%,-50%) scale(${(0.14 + 0.86 * flight) * (1 + settle * 0.12)}) rotate(${spin}deg)`,
              opacity: clamp01((t + 0.03) * 14),
              fontSize: size,
              fontWeight: 900,
              color,
              fontFamily: "Microsoft YaHei",
              whiteSpace: "nowrap",
              textShadow: `0 0 20px ${color}, 0 0 44px ${color}66, 0 5px 0 rgba(0,0,0,.55)`,
              zIndex: 20,
            }}
          >
            {c.c}
          </div>
        );
      })}
    </>
  );
};

const Scene1: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  /* 逐字口播时间 → 出场时刻，且不许早于本幕开始（老贾：不许抢跑、先空城计） */
  const T = (w: string, off = 0) => Math.max(at(1, w) + off, delay + 0.45);
  const nameDelay = at(1, "modder");
  const { impact, shx, shy } = slam(frame, fps, nameDelay * fps + 26);
  return (
    <SceneShell delay={delay} left="pointUp" right="sing">
      <div style={{ position: "absolute", inset: 0, transform: `translate(${shx}px,${shy}px)` }}>
        {/* 🚨 10/21 老贾看片打回（第二次）后定的：
            ①"5秒钟以内那个大标题一定要先出来" → 巨字落位 = 念到 − 0.78 秒，
               所以口播必须把名字提前到 4.5 秒念到，巨字才 3.7 秒落地
            ②"0.5秒的钩子要逐字吐出来" → 钩子拆两块，从嘴里依次飞出（第一块 0.45 秒）
            ③去掉"老贾一分钱没花""我试过一遍"这类没用的自我标榜
            ④数字用 GitHub 10/21 实测 8548（旧稿 8268 已过期） */}
        <FlyChars segNo={1} needle="游戏丢给Claude" toX={540} toY={430} size={76} color={GOLD} from="l" />
        <FlyChars segNo={1} needle="它自己给你改出新玩法" toX={540} toY={620} size={56} color={CREAM} from="l" />
        <SlamText text="universal modder" frame={frame} fps={fps} landFrame={at(1, "universal") * fps + 26} y={1120} size={82} color={GOLD} box />
        <CountUp to={8548} toX={540} toY={850} size={140} color={GOLD} suffix=" ★" delay={T("八千五百四十八颗星")} />
        <Boom frame={frame} x={540} y={850} max={760} color={GOLD} start={T("八千五百四十八颗星") * fps + 4} life={12} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(255,255,255,${impact * 0.14})`, zIndex: 31 }} />
    </SceneShell>
  );
};

/* 幕2 · 先出图片（证据卡先落位），再出底下文案，最后才朗读 */
const Scene2: React.FC<{ delay: number }> = ({ delay }) => {
  const T = (w: string, off = 0) => Math.max(at(2, w) + off, delay + 0.2);
  return (
    <SceneShell delay={delay} left="talk" right="win">
      <EvidenceCard delay={delay + 0.22} from="l" w={1000} top={700} url="github.com/rehan-remade/universal-modder" caption="把 Claude 指向任意游戏：侦察 · 逆向 · 生成 · 试玩" />
      <Title text="让Claude直接改游戏" color={GREEN} size={52} delay={T("直接改游戏")} top={380} />
      <PopWord text="免费白嫖" toX={540} toY={570} size={62} color={GOLD}
        delay={T("免费白嫖", 0.15)} from="r" arc={220} />
      <TypeIn match={"动手"} text="不是写份攻略 是真的进游戏动手" x={540} y={1195} size={34} color={CREAM} delay={T("动手", 0.7)} from="l" segNo={2} />
    </SceneShell>
  );
};

const Scene3: React.FC<{ delay: number }> = ({ delay }) => (
  <SceneShell delay={delay} left="pointUp" right="cheer">
    <Title text="四步改一个游戏" color={BLUE} size={52} delay={at(3, "它先摸清游戏里有什么")} top={380} />
    <ShapeCard kind="circle" toX={210} toY={790} size={350} color={BLUE} delay={Math.max(at(3, "摸清游戏里有什么") - 0.4, delay)} from="l" />
    <TypeIn match={"摸清游戏里有什么"} text="摸清游戏" x={200} y={745} size={40} color={BLUE} delay={at(3, "摸清游戏里有什么")} from="r" segNo={3} />
    <TypeIn match={"摸清游戏里有什么"} text="先侦察" x={200} y={838} size={28} color={CREAM} delay={at(3, "摸清游戏里有什么") + 0.5} from="r" segNo={3} />
    <ShapeCard kind="circle" toX={540} toY={790} size={350} color={GOLD} delay={Math.max(at(3, "自己生成美术和音效") - 0.4, delay)} from="r" />
    <TypeIn match={"自己生成美术和音效"} text="自己生成" x={540} y={745} size={36} color={GOLD} delay={at(3, "自己生成美术和音效")} from="l" segNo={3} />
    <TypeIn match={"自己生成美术和音效"} text="美术和音效" x={540} y={838} size={26} color={CREAM} delay={at(3, "自己生成美术和音效") + 0.5} from="l" segNo={3} />
    <ShapeCard kind="circle" toX={870} toY={790} size={350} color={GREEN} delay={Math.max(at(3, "装进游戏里试") - 0.4, delay)} from="l" />
    <TypeIn match={"装进游戏里试"} text="装进去试" x={880} y={745} size={36} color={GREEN} delay={at(3, "装进游戏里试")} from="r" segNo={3} />
    <TypeIn match={"装进游戏里试"} text="当场试一遍" x={880} y={838} size={26} color={CREAM} delay={at(3, "装进游戏里试") + 0.5} from="r" segNo={3} />
  </SceneShell>
);

/* 幕4 菱形（seg4） */
const Scene4: React.FC<{ delay: number }> = ({ delay }) => (
  <SceneShell delay={delay} left="sing" right="mic">
    <Title text="坑说清楚" color={CREAM} size={52} delay={at(4, "坑说清楚")} top={380} />
      <TypeIn match={"自己会看"} text="工具再好也得自己看"
        x={540} y={560} size={40} color={GOLD} delay={at(4, "自己会看")} from="l" segNo={4} />
    <ShapeCard kind="diamond" toX={540} toY={790} size={520} color={GREEN} delay={Math.max(at(4, "买过的游戏") - 0.4, delay)} from="l" drop />
    <TypeIn match={"买过的游戏"} text="得是你买过的" x={540} y={745} size={40} color={GREEN} delay={at(4, "买过的游戏")} from="r" segNo={4} />
    <TypeIn match={"自己那份文件"} text="只改你自己那份" x={540} y={890} size={36} color={CREAM} delay={at(4, "自己那份文件")} from="l" segNo={4} />
    <TypeIn match={"自己那份文件"} text="不碰别人" x={540} y={1010} size={34} color={RED} delay={at(4, "自己那份文件") + 0.55} from="r" segNo={4} />
  </SceneShell>
);

/* 幕5 终端窗：坑说清楚（seg5） */
const Scene5: React.FC<{ delay: number }> = ({ delay }) => (
  <SceneShell delay={delay} left="talk" right="think">
    <Title text="不想折腾也有笨办法" color={RED} size={52} delay={at(5, "不想折腾也有笨办法")} top={380} />
    <TermWin delay={Math.max(at(5, "不想折腾也有笨办法") - 0.4, delay)} top={500} h={470} w={900} from="l" />
    <TypeIn match={"不想折腾也有笨办法"} text="不想折腾也有笨办法" x={540} y={660} size={38} color={GOLD} delay={at(5, "不想折腾也有笨办法")} from="r" segNo={5} />
    <TypeIn match={"不想折腾也有笨办法"} text="一百多个现成技能包" x={540} y={770} size={38} color={CREAM} delay={at(5, "一百多个现成的技能包")} from="l" segNo={5} />
    <TypeIn match={"不想折腾也有笨办法"} text="不想自己折腾就直接抄" x={540} y={880} size={32} color={RED} delay={at(5, "直接抄过来用")} from="r" segNo={5} />
  </SceneShell>
);

/* 幕6 CTA（seg6） */
/* 幕6 · 结尾（照第24集原样，一样都不减） */
/* 幕6 · 结尾（照第24集原样，一样都不减） */
/* 幕6 · 结尾（照第24集原样，一样都不减） */
/* 幕6 · 结尾（照第24集原样，一样都不减） */
/* 幕6 · 结尾（照第24集原样，一样都不减） */
/* 幕6 · 结尾（照第24集原样，一样都不减） */
/* 幕6 · 结尾（照第24集原样，一样都不减） */
/* 幕6 · 结尾（照第24集原样，一样都不减） */
const Scene6: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - delay;
  const T = (w: string, off = 0) => Math.max(at(6, w) + off, delay + 0.2);
  return (
    <SceneShell delay={delay} left="cheer" right="dance">
      <Title text="MIT 协议" color={GOLD} size={52} delay={T("MIT")} top={380} />
      <ShapeCard kind="hex" toX={540} toY={700} size={340} color={GOLD} delay={Math.max(T("MIT", -0.35), delay)} from="l" />
      <PopWord text="能商用" toX={540} toY={700} size={52} color={GOLD} delay={T("Apache", 0.3)} from="l" arc={240} />
      <PopWord text="地址在评论区" toX={540} toY={950} size={44} color={CREAM} delay={T("评论区")} from="r" arc={240} />
      <PopWord text="最想让AI改哪个" toX={540} toY={825} size={46} color={CREAM}
        delay={T("最想让AI改哪个游戏", 0.1)} from="l" arc={200} />
      <PopButton text="评论区报个数" delay={T("评论区", 0.35)} x={540} y={1093} color={GOLD} size={58} from="r" />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, zIndex: 19, pointerEvents: "none" }}>
        <circle cx={540} cy={1093} r={175} fill="none" stroke={GOLD} strokeWidth={4} strokeDasharray="24 20" strokeDashoffset={-t * 46} opacity={0.65} transform="rotate(-90 540 1093)" />
        <circle cx={540} cy={1093} r={148} fill="none" stroke={GREEN} strokeWidth={3} strokeDasharray="9 24" strokeDashoffset={t * 64} opacity={0.55} transform="rotate(-90 540 1093)" />
      </svg>
      <Chip text="关注我 火柴人老贾" color={GREEN} delay={T("关注我")} y={1270} />
    </SceneShell>
  );
};

export const Short: React.FC = () => {
  const frame = useCurrentFrame();
  const active = frame / 30;
  /* 🚨 10/11 老贾让做证据卡时质检器抓出来的第二处：这六条边界原来整体比配音早 5.16 秒
     （Root 少写了 1449 帧时留下的），后果是幕3/幕5 的字"出场即被切走"、片尾 5 秒无画面。
     现在全部按 chars.json 的真实 seg 边界重排，逐幕对上。 */
  /* 幕边界跟着 chars.json 的真实分段走（10/21 改：以前这串数字硬编码，改口播后必须手改代码
     才会对上。现在自动算，以后改口播只要重跑 tts\gen_tts_ep34.py，画面时间轴自动跟上） */
  const SEG_END = rawChars.map((c) => c.end);
  const scenes = [
    { from: 0, to: SEG_END[0], mood: "free" as const, node: <Scene1 delay={0} /> },
    { from: SEG_END[0], to: SEG_END[1], mood: "free" as const, node: <Scene2 delay={SEG_END[0]} /> },
    { from: SEG_END[1], to: SEG_END[2], mood: "free" as const, node: <Scene3 delay={SEG_END[1]} /> },
    { from: SEG_END[2], to: SEG_END[3], mood: "free" as const, node: <Scene4 delay={SEG_END[2]} /> },
    { from: SEG_END[3], to: SEG_END[4], mood: "free" as const, node: <Scene5 delay={SEG_END[3]} /> },
    { from: SEG_END[4], to: SEG_END[5], mood: "free" as const, node: <Scene6 delay={SEG_END[4]} /> },
  ];
  const current = scenes.find((scene) => active >= scene.from && active < scene.to) ?? scenes[scenes.length - 1];
  return (
    <AbsoluteFill style={{ background: "#04060a" }}>
      <ParticleBg mood={current.mood} seedBase={20261028} />
      <Audio src={narration} />
      {current.node}
    </AbsoluteFill>
  );
};
