import React, { useMemo } from 'react';
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, staticFile, Audio, Sequence,
} from 'remotion';
import { SCRIPT, TOKENS, RUNNERS, PICKED, NOTES, VECTORS, BALLS, CHAIN } from './ep2v3Script';
import { F, DUR, TOTAL_FRAMES } from './ep2v3Timeline';
import { CHARS } from './ep2v3Chars';

/* =====================================================================
   EP02v3《大模型是如何思考的》· 竖屏 9:16
   双主角：小模（被讲的 AI）+ 火柴人老贾（IP，照搬 NNV.tsx 的 Sticker 形象）
   老贾形象：学士帽歪戴 + 呆毛金币 + 斗鸡眼 + 红嘴 + 金身（一模一样，不许改）
   ===================================================================== */

const BG = '#F5F7FA';
const NAVY = '#0A2540';
const BLUE = '#0A84FF';
const GOLD = '#FFB800';
const GOLD_D = '#D99400';
const RED = '#FF3B30';
const GREEN = '#1E9E4A';
const GREY = '#8E9AAB';
const LINE = '#C9D8EA';
const PUPIL = '#0a0a12';
const FONT = '"Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", sans-serif';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ez = (t: number, d = 12) => 1 - Math.pow(1 - clamp01(t / d), 3);
const at = (f: number, d: number, dur = 12) => ez(f - d, dur);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const pop = (f: number, d: number, dur = 18) => {
  const t = clamp01((f - d) / dur);
  return t >= 1 ? 1 : 1 + 2.4 * Math.pow(t - 1, 3) + 1.3 * Math.pow(t - 1, 2);
};
const squash = (f: number, d: number, amt = 0.26) => {
  const t = f - d;
  if (t < 0) return { sx: 1, sy: 1 };
  const k = Math.abs(Math.sin(t * 0.36)) * Math.exp(-t / 26);
  return { sx: 1 + amt * k, sy: 1 - amt * k };
};
const bez = (p0: number[], p1: number[], p2: number[], u: number): number[] => {
  const v = 1 - u;
  return [
    v * v * p0[0] + 2 * v * u * p1[0] + u * u * p2[0],
    v * v * p0[1] + 2 * v * u * p1[1] + u * u * p2[1],
  ];
};

/** 音画咬合：关键词在本幕内的触发帧 */
const kf = (si: number, word: string) => {
  const cn = SCRIPT[si].cn;
  const i = cn.indexOf(word);
  if (i < 0) return 16;
  const t = CHARS[si]?.[i];
  return Math.round((t === undefined ? (i / Math.max(1, cn.length)) * 6 : t) * 30);
};

/* ---------------- 背景 ---------------- */
const Backdrop: React.FC<{ tint: string; f: number; seed?: number }> = ({ tint, f, seed = 1 }) => {
  const dots = useMemo(() => {
    const out: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 44; i++) {
      out.push({ x: rand(i * 3.1 + seed * 17) * 1080, y: rand(i * 7.7 + seed * 31) * 1920, r: 2 + rand(i * 11.3) * 3 });
    }
    return out;
  }, [seed]);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect x={0} y={0} width={1080} height={1920} fill={BG} />
      <ellipse cx={240 + Math.sin(f / 70) * 90} cy={420} rx={520} ry={400} fill={tint} opacity={0.9} />
      <ellipse cx={880 + Math.cos(f / 90) * 80} cy={1380} rx={480} ry={380} fill={tint} opacity={0.65} />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={LINE} opacity={0.5} />
      ))}
    </svg>
  );
};

/* ---------------- 「小模」发光大脑机器人 ---------------- */
type Mood = 'choke' | 'shock' | 'proud' | 'serious' | 'happy' | 'dizzy' | 'cool' | 'worried' | 'neutral';

const XiaoMo: React.FC<{
  x: number; y: number; s: number; mood: Mood; f: number; rot?: number; hat?: 'chef' | 'none'; flip?: boolean;
}> = ({ x, y, s, mood, f, rot = 0, hat = 'none', flip = false }) => {
  const bob = Math.sin(f / 26) * 5;
  /* 眨眼：每 70 帧闭一次，明显看得见 */
  const blinkPhase = (f % 70) / 70;
  const blink = blinkPhase > 0.925 ? 0.1 : 1;
  /* 天线摆动 */
  const ant1 = Math.sin(f / 9) * 10;
  const ant2 = Math.sin(f / 9 + 1.4) * 10;
  const eyes = () => {
    if (mood === 'happy')
      return (
        <>
          <path d="M -62 -8 Q -44 -34 -26 -8" stroke={NAVY} strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d="M 26 -8 Q 44 -34 62 -8" stroke={NAVY} strokeWidth={9} fill="none" strokeLinecap="round" />
        </>
      );
    if (mood === 'cool')
      return (
        <>
          <rect x={-70} y={-30} width={56} height={30} rx={8} fill={NAVY} />
          <rect x={14} y={-30} width={56} height={30} rx={8} fill={NAVY} />
          <rect x={-22} y={-30} width={12} height={30} fill={NAVY} />
        </>
      );
    if (mood === 'choke')
      return (
        <>
          <ellipse cx={-44} cy={-14} rx={21} ry={9} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
          <ellipse cx={44} cy={-14} rx={21} ry={9} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
          <circle cx={-44} cy={-13} r={7} fill={NAVY} />
          <circle cx={44} cy={-13} r={7} fill={NAVY} />
          <ellipse cx={-44} cy={18} rx={21} ry={11} fill={RED} opacity={0.55} />
          <ellipse cx={44} cy={18} rx={21} ry={11} fill={RED} opacity={0.55} />
        </>
      );
    const rx = mood === 'shock' ? 36 : 30;
    const ry = (mood === 'shock' ? 40 : 32) * blink;
    const px = mood === 'serious' ? -6 : mood === 'proud' ? 6 : 0;
    return (
      <>
        <ellipse cx={-44} cy={-18} rx={rx} ry={ry} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
        <ellipse cx={44} cy={-18} rx={rx} ry={ry} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
        <circle cx={-44 + px} cy={-15} r={mood === 'shock' ? 13 : 12} fill={NAVY} />
        <circle cx={44 + px} cy={-15} r={mood === 'shock' ? 13 : 12} fill={NAVY} />
        <circle cx={-48 + px} cy={-20} r={4.5} fill="#FFFFFF" />
        <circle cx={40 + px} cy={-20} r={4.5} fill="#FFFFFF" />
      </>
    );
  };
  const mouth = () => {
    if (mood === 'shock') return <ellipse cx={0} cy={40} rx={22} ry={28} fill={NAVY} />;
    if (mood === 'happy' || mood === 'proud')
      return <path d="M -26 30 Q 0 62 26 30" stroke={NAVY} strokeWidth={9} fill="none" strokeLinecap="round" />;
    if (mood === 'choke') return <ellipse cx={0} cy={40} rx={21} ry={14} fill={RED} stroke={NAVY} strokeWidth={4} />;
    if (mood === 'serious') return <path d="M -22 38 L 22 38" stroke={NAVY} strokeWidth={9} strokeLinecap="round" />;
    if (mood === 'worried') return <path d="M -24 48 Q 0 26 24 48" stroke={NAVY} strokeWidth={9} fill="none" strokeLinecap="round" />;
    return <path d="M -18 36 Q 0 46 18 36" stroke={NAVY} strokeWidth={8} fill="none" strokeLinecap="round" />;
  };
  const chef = hat === 'chef' ? (
    <g transform={`translate(0 -104) rotate(${Math.sin(f / 18) * 4})`}>
      <rect x={-46} y={-6} width={92} height={26} rx={8} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
      <circle cx={-28} cy={-16} r={26} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
      <circle cx={0} cy={-24} r={30} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
      <circle cx={28} cy={-16} r={26} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
    </g>
  ) : null;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={126} rx={86} ry={16} fill={NAVY} opacity={0.16} />
      {chef}
      <path d={`M -34 -92 Q ${-52 + ant1} -128 ${-44 + ant1 * 1.4} -152`} stroke={NAVY} strokeWidth={9} fill="none" strokeLinecap="round" />
      <circle cx={-44 + ant1 * 1.4} cy={-154} r={11} fill={RED} stroke={NAVY} strokeWidth={3} />
      <path d={`M 34 -92 Q ${52 + ant2} -128 ${44 + ant2 * 1.4} -152`} stroke={NAVY} strokeWidth={9} fill="none" strokeLinecap="round" />
      <circle cx={44 + ant2 * 1.4} cy={-154} r={11} fill={GREEN} stroke={NAVY} strokeWidth={3} />
      <circle cx={0} cy={0} r={104} fill="url(#xmBody)" stroke={NAVY} strokeWidth={5} />
        {/* 噎住：脸涨红 + 冒汗（老贾 10/21：神态要露出来） */}
        {mood === 'choke' ? <ellipse cx={0} cy={8} rx={92} ry={80} fill={RED} opacity={0.2} /> : null}
        {mood === 'choke' ? (
          <path d={`M ${-74 + Math.sin(f / 5) * 5} -66 q -8 16 0 20 q 8 -4 0 -20 Z`} fill="#8BE9FD" stroke={NAVY} strokeWidth={2.5} />
        ) : null}
      <path d="M -74 -30 q 30 -34 62 -12 q -34 18 -62 12 Z" fill="#FFFFFF" opacity={0.4} />
      {eyes()}
      {mouth()}
        {/* 眉毛（噎住时皱起来）+ 短手短脚（小动作，老贾 10/21 采纳） */}
        {mood === 'choke' ? (
          <g stroke={NAVY} strokeWidth={6} strokeLinecap="round" fill="none">
            <path d="M -64 -48 q 20 -13 40 -3" />
            <path d="M 24 -50 q 20 -11 40 3" />
          </g>
        ) : null}
        <g>
          <line x1={-84} y1={24} x2={-104} y2={44} stroke={NAVY} strokeWidth={13} strokeLinecap="round" />
          <circle cx={-112} cy={50} r={13} fill="#B9D4FF" stroke={NAVY} strokeWidth={4} />
          <line x1={84} y1={24} x2={104} y2={44} stroke={NAVY} strokeWidth={13} strokeLinecap="round" />
          <circle cx={112} cy={50} r={13} fill="#B9D4FF" stroke={NAVY} strokeWidth={4} />
          <line x1={-38} y1={100} x2={-46} y2={134} stroke={NAVY} strokeWidth={13} strokeLinecap="round" />
          <line x1={38} y1={100} x2={46} y2={134} stroke={NAVY} strokeWidth={13} strokeLinecap="round" />
          <ellipse cx={-52} cy={140} rx={19} ry={11} fill="#B9D4FF" stroke={NAVY} strokeWidth={4} />
          <ellipse cx={52} cy={140} rx={19} ry={11} fill="#B9D4FF" stroke={NAVY} strokeWidth={4} />
        </g>
    </g>
  );
};

/* =====================================================================
   火柴人老贾 —— 照搬 NNV.tsx 的 Sticker，形象一模一样
   学士帽歪戴 + 呆毛金币 + 斗鸡眼 + 红嘴 + 金身
   ===================================================================== */
type StPose = { armL: number; armR: number; jump: number; lean: number; headTilt: number };
const STPOSES: Record<string, StPose> = {
  gasp: { armL: -75, armR: -75, jump: 26, lean: -6, headTilt: 10 },
  point: { armL: 20, armR: -80, jump: 10, lean: -6, headTilt: -6 },
  present: { armL: -88, armR: -20, jump: 8, lean: 0, headTilt: -8 },
  win: { armL: -85, armR: -85, jump: 34, lean: 0, headTilt: 0 },
  cheer: { armL: -80, armR: -80, jump: 42, lean: 0, headTilt: 0 },
  talk: { armL: -30, armR: 25, jump: 0, lean: 0, headTilt: 0 },
  /* 10/21 第一幕：左手高举托住噎住的小模，右手扶着 */
  catch: { armL: -95, armR: -28, jump: 16, lean: -4, headTilt: 6 },
};

const LaoJia: React.FC<{ x: number; y: number; s: number; mode: string; f: number }> = ({ x, y, s, mode, f }) => {
  const pose = STPOSES[mode] ?? STPOSES.gasp;
  const t = f / 30;
  const bob = Math.sin(t * (pose.jump ? 10 : 6)) * (pose.jump ? 12 : 5);
  const sway = Math.sin(t * 5) * 8;
  const openNow = Math.sin(t * 17) > 0.55;
  const gesture = Math.sin(t * 7) * 30;
  const gesture2 = Math.sin(t * 7 + 1.6) * 34;
  const K = 1.42; // 210 单位 → 约 300px
  return (
    <g transform={`translate(${x} ${y}) scale(${s * K}) translate(-105 -105)`}>
      <g transform={`translate(0 ${bob}) rotate(${pose.lean + sway * 0.25} 105 210)`}>
        <g transform={`rotate(${pose.headTilt} 105 60)`}>
          <g transform={`rotate(${Math.sin(t * 8) * 26} 120 14)`}>
            <path d="M118 8 Q166 2 180 28 Q186 40 178 48" stroke="#12b582" strokeWidth={11} fill="none" strokeLinecap="round" />
            <circle cx={176} cy={52} r={11} fill={GOLD} stroke="#e6bc3c" strokeWidth={2} />
            <text x={176} y={57} fontSize={14} fill={PUPIL} textAnchor="middle" fontWeight={900}>¥</text>
          </g>
          <g transform="rotate(-11 105 10)">
            <ellipse cx={105} cy={6} rx={45} ry={14} fill="#0e5a44" />
            <path d="M60 8 Q60 -10 105 -12 Q150 -10 150 8 Z" fill="#12b582" />
            <rect x={46} y={2} width={118} height={14} rx={7} fill="#0a3d2e" />
          </g>
          <circle cx={105} cy={52} r={37} fill={GOLD} stroke="#e6bc3c" strokeWidth={3} />
          <path d="M76 32 Q90 8 108 26" stroke="#0a3d2e" strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M110 20 Q126 8 138 32" stroke="#0a3d2e" strokeWidth={7} fill="none" strokeLinecap="round" />
          <circle cx={92} cy={50} r={14} fill="#fff" stroke="#e6bc3c" strokeWidth={2} />
          <circle cx={118} cy={50} r={14} fill="#fff" stroke="#e6bc3c" strokeWidth={2} />
          <circle cx={99} cy={54} r={6.5} fill={PUPIL} />
          <circle cx={111} cy={54} r={6.5} fill={PUPIL} />
          {openNow ? (
            <ellipse cx={105} cy={70} rx={13} ry={11} fill="#7a1f2b" stroke="#5c1219" strokeWidth={2} />
          ) : (
            <path d="M86 60 Q105 88 124 60 Q105 71 86 60 Z" fill="#7a1f2b" stroke="#5c1219" strokeWidth={3} />
          )}
        </g>
        <line x1={105} y1={89} x2={105} y2={158} stroke={GOLD} strokeWidth={16} strokeLinecap="round" />
        <line x1={105} y1={106} x2={56} y2={146} stroke={GOLD} strokeWidth={14} strokeLinecap="round" transform={`rotate(${pose.armL + gesture} 105 106)`} />
        <line x1={105} y1={106} x2={154} y2={146} stroke={GOLD} strokeWidth={14} strokeLinecap="round" transform={`rotate(${pose.armR - gesture2} 105 106)`} />
        <circle cx={56} cy={146} r={9} fill={GOLD} />
        <circle cx={154} cy={146} r={9} fill={GOLD} />
        <line x1={105} y1={158} x2={76} y2={192 + pose.jump} stroke={GOLD} strokeWidth={14} strokeLinecap="round" transform="rotate(-14 105 158)" />
        <line x1={105} y1={158} x2={134} y2={192 + pose.jump} stroke={GOLD} strokeWidth={14} strokeLinecap="round" transform="rotate(14 105 158)" />
        <ellipse cx={105} cy={152} rx={19} ry={17} fill={GOLD} stroke="#e6bc3c" strokeWidth={2} />
        <text x={105} y={159} fontSize={22} fill={PUPIL} textAnchor="middle" fontWeight={900}>¥</text>
      </g>
    </g>
  );
};

/* ---------------- 字幕：横向滚动 ---------------- */
const Caption: React.FC<{ f: number }> = ({ f }) => {
  let si = 0;
  for (let i = 0; i < SCRIPT.length; i++) if (f >= F[i]) si = i;
  const seg = SCRIPT[si].cn;
  const times = CHARS[si] || [];
  const local = f / 30 - F[si] / 30;
  const chars = seg.split('');
  const shown: number[] = chars.map((_, i) => (times[i] !== undefined && local >= times[i] ? 1 : 0));
  const nShow = shown.reduce((a: number, b: number) => a + b, 0);
  const perLine = 11;
  const charW = 46;
  const scrollX = Math.max(0, (nShow - perLine) * charW);
  const y0 = 1592;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <clipPath id="capclip4">
          <rect x={48} y={y0 - 62} width={984} height={110} rx={24} />
        </clipPath>
      </defs>
      <rect x={48} y={y0 - 62} width={984} height={110} rx={24} fill={NAVY} opacity={0.92} />
      <g clipPath="url(#capclip4)">
        <text x={72 - scrollX} y={y0} textAnchor="start" fontFamily={FONT} fontSize={44} fontWeight={800} opacity={0.95}>
          {chars.map((ch, i) => (
            <tspan key={i} fill={shown[i] === 1 ? '#FFD60A' : '#FFFFFF'} opacity={shown[i] === 1 ? 1 : 0.38}>{ch}</tspan>
          ))}
        </text>
      </g>
    </svg>
  );
};

/* ---------------- 角标 ---------------- */
const Badge: React.FC<{ f: number }> = ({ f }) => {
  const p = pop(f, 4, 14);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <g opacity={at(f, 4, 8)} transform={`translate(54 62) scale(${p})`}>
        <rect x={0} y={0} width={252} height={54} rx={27} fill={NAVY} opacity={0.88} />
        <text x={126} y={37} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#FFFFFF">AI 科普 · EP02</text>
      </g>
    </svg>
  );
};

/* ---------------- 大字：白底贴字块 + 超粗（老贾 10/20 指定） ---------------- */
const Slam: React.FC<{ text: string; d: number; y?: number; size?: number; color?: string; rot?: number }> = ({
  text, d, y = 280, size = 74, color = NAVY, rot = 0,
}) => {
  const p = pop(d, 0, 18);
  const shake = d > 5 && d < 14 ? Math.sin(d * 2.7) * 5 : 0;
  const w = text.length * size * 0.99 + 34;
  const h = size * 1.32;
  return (
    <g transform={`translate(540 ${y + shake}) rotate(${rot}) scale(${p})`} opacity={at(d, 0, 5)}>
      <rect x={-w / 2} y={-h * 0.78} width={w} height={h} rx={size * 0.3} fill="#FFFFFF" />
      <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={900} fill={color}>{text}</text>
    </g>
  );
};

/* =====================================================================
   幕0「砸」：书砸下来 + 第一幕字体（白底贴字 / 第二行红色倾斜）
   ===================================================================== */
/* =====================================================================
   知识卡（老贾 10/21 采纳：核心概念定格一卡，能截图收藏）
   时序：卡底弹入(0.3s) → 主词逐字砸落(每字0.1s) → 副题 → 小字/进度块 → 收进📁(计数器+1)
   音效：咚(弹入) / 嗒(逐字) / 叮✓(收进) —— ffmpeg 合成，不花钱
   ===================================================================== */
const easeOutBack = (u: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
};
const fadeIn = (f: number, d: number) => clamp01((f - d) / 8);

const KnowledgeCard: React.FC<{
  word: string;
  sub?: string;
  foot?: string;
  progress?: boolean;
  wordSize?: number;
  cardW?: number;
}> = ({ word, sub, foot, progress, wordSize = 190, cardW = 900 }) => {
  const frame = useCurrentFrame();
  const chars = word.split("");
  const IN = 8;    // 弹入
  const STEP = 3;  // 每字间隔
  const inU = clamp01(frame / IN);
  const cardScale = frame < IN ? easeOutBack(inU) : 1;
  const subAt = IN + chars.length * STEP + 6;
  const footAt = subAt + 8;
  const outAt = footAt + (progress ? 18 : 12);
  const outU = clamp01((frame - outAt) / 12);
  const cardX = lerp(540, 880, outU);
  const cardY = lerp(760, 1700, outU);
  const sc = cardScale * (1 - 0.62 * outU);
  const shake = frame >= IN && frame < IN + chars.length * STEP
    ? Math.sin(frame * 1.9) * 5 * (1 - (frame - IN) / (chars.length * STEP)) : 0;
  return (
    <>
      <Sequence from={0} durationInFrames={300}><Audio src={staticFile("sfx/dong.mp3")} /></Sequence>
      {chars.map((c, i) => (
        <Sequence key={i} from={IN + i * STEP} durationInFrames={300}><Audio src={staticFile("sfx/da.mp3")} /></Sequence>
      ))}
      <Sequence from={outAt} durationInFrames={300}><Audio src={staticFile("sfx/ding.mp3")} /></Sequence>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 30 }}>
        <g transform={`translate(${cardX + shake} ${cardY}) scale(${sc})`} opacity={1 - outU}>
        <rect x={-cardW / 2} y={-250} width={cardW} height={500} rx={34} fill="#FFFFFF" opacity={0.92} stroke={GOLD_D} strokeWidth={5} />
        <rect x={-cardW / 2} y={-250} width={cardW} height={500} rx={34} fill="none" stroke="#8BE9FD" strokeWidth={12} opacity={0.22} />
        {chars.map((c, i) => {
          const t = frame - (IN + i * STEP);
          let dy = -130, o = 0, sy = 1;
          if (t >= 0) {
            const u = clamp01(t / 11);
            dy = -130 * (1 - (1 - Math.pow(1 - u, 3)));
            o = clamp01(t / 2);
            if (u >= 1) { const k = t - 11; sy = 1 + 0.18 * Math.sin(k * 0.5) * Math.exp(-k * 0.3); }
          }
          const w = wordSize * 1.06;
          const x = (i - (chars.length - 1) / 2) * w;
          return (
            <text key={i} x={x} y={-40} textAnchor="middle" fontFamily={FONT} fontSize={wordSize} fontWeight={900}
              fill={GOLD} stroke={NAVY} strokeWidth={5} paintOrder="stroke" opacity={o}
              transform={`translate(0 ${dy}) scale(1 ${sy})`}>{c}</text>
          );
        })}
        {sub ? (
          <text x={0} y={110} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={800} fill={NAVY} opacity={fadeIn(frame, subAt)}>{sub}</text>
        ) : null}
        {foot ? (
          <text x={0} y={196} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={700} fill={GREY} opacity={fadeIn(frame, footAt)}>{foot}</text>
        ) : null}
        {progress ? (
          <g opacity={fadeIn(frame, footAt)}>
            {Array.from({ length: 8 }).map((_, i) => {
              const on = frame >= footAt + i * 4.5;
              return (
                <rect key={i} x={-7 * 46 + i * 46} y={200} width={36} height={36} rx={6}
                  fill={on ? GOLD : "#E3E9F2"} stroke={NAVY} strokeWidth={2.5} />
              );
            })}
          </g>
        ) : null}
        </g>
      </svg>
    </>
  );
};

/* 收藏夹计数器：右下角全程挂着，每收一张知识卡 ×N +1 */
const FolderCounter: React.FC<{ n: number }> = ({ n }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const pop = n > 0 ? 1 + 0.22 * Math.exp(-(t % 0.7) * 5) : 1;
  return (
    <div style={{ position: "absolute", right: 46, bottom: 108, display: "flex", alignItems: "center", gap: 12, zIndex: 46 }}>
      <div style={{ fontSize: 62, lineHeight: 1, transform: `scale(${pop})`, transformOrigin: "center" }}>📁</div>
      {n > 0 ? (
        <div style={{ fontSize: 44, fontWeight: 900, color: GOLD_D, fontFamily: FONT, textShadow: "0 0 16px #ffb80088" }}>×{n}</div>
      ) : null}
    </div>
  );
};

const Scene1: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const kDrop = Math.max(kf(si, '吞'), 0.18);
  const kChoke = kf(si, '噎');
  const kpBook = clamp01((t - kDrop) / Math.max(0.001, kChoke - kDrop));
  const bookY = lerp(-220, 875, kpBook * kpBook);   // 重力加速：越掉越快（老贾 10/21）
  const stuck = t >= kChoke;
  /* 噎住 → 先往下沉（被书砸的冲击）→ 老贾冲上来顶回去（老贾 10/21：要把小模托住） */
  const sinkP = stuck ? clamp01((t - kChoke) / 12) : 0;
  const liftP = stuck ? clamp01((t - kChoke - 12) / 20) : 0;
  const xiaoY = 900 + sinkP * 40 - liftP * 36;
  const bookHold = stuck ? liftP * 36 + Math.sin((t - kChoke) * 1.7) * 4 : 0;
  const shake = stuck ? Math.sin(t * 2.2) * 12 * Math.exp(-(t - kChoke) / 24) : 0;
  const ring = stuck ? Math.min(1, (t - kChoke) / 26) : -1;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#FFE9E4" f={t} seed={1} />
      <g transform={`translate(${shake} 0)`}>
        <XiaoMo x={540} y={xiaoY} s={1.22} mood={stuck ? 'choke' : 'shock'} f={t} rot={stuck ? Math.sin(t * 1.2) * 5 : 0} />
        <g transform={`translate(540 ${bookY + bookHold}) rotate(${stuck ? Math.sin(t * 1.4) * 7 : -5})`}>
          <rect x={-196} y={-42} width={392} height={84} rx={10} fill={RED} stroke={NAVY} strokeWidth={5} />
          <rect x={-196} y={-42} width={392} height={22} rx={8} fill="#FF7A70" />
          <rect x={-176} y={50} width={352} height={12} rx={6} fill="#FFFFFF" opacity={0.9} />
          <rect x={-176} y={72} width={276} height={12} rx={6} fill="#FFFFFF" opacity={0.62} />
          <rect x={-176} y={94} width={314} height={12} rx={6} fill="#FFFFFF" opacity={0.45} />
        </g>
        {/* 书砸下来的速度线 */}
        {t > kDrop - 4 && t < kChoke ? (
          <g opacity={0.42}>
            {[-160, -70, 70, 160].map((dx, k) => (
              <line key={k} x1={540 + dx} y1={bookY - 320} x2={540 + dx} y2={bookY - 160 + ((t * 10) % 70)}
                stroke={GOLD_D} strokeWidth={8} strokeLinecap="round" />
            ))}
          </g>
        ) : null}
        {ring >= 0 ? (
          <g opacity={0.55 * (1 - ring)}>
            <ellipse cx={540} cy={1010} rx={120 + ring * 470} ry={30 + ring * 120} fill="none" stroke={RED} strokeWidth={9 - ring * 6} />
            <ellipse cx={540} cy={1010} rx={80 + ring * 330} ry={20 + ring * 80} fill="none" stroke={GOLD_D} strokeWidth={6 - ring * 4} />
          </g>
        ) : null}
      </g>
      <Slam text="AI 吞下一整本书" d={kDrop - 8} y={252} size={70} color={NAVY} />
      <Slam text="会噎住吗？" d={kChoke - 6} y={372} size={84} color={RED} rot={-4} />
      {/* 老贾冲上来：左手高举托住噎红脸的小模，右手扶着（老贾 10/21） */}
      <LaoJia x={lerp(170, 430, at(t, kChoke, 22))} y={lerp(1330, 1128, at(t, kChoke, 22))}
        s={0.95} mode={stuck ? 'catch' : 'gasp'} f={t} />
    </svg>
  );
};

/* =====================================================================
   幕1「切」：整本书 → 刀劈 → 碎成小纸片 → 小词块排两排
   ===================================================================== */
const Scene2: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const kCut = kf(si, '剪');
  const kToken = kf(si, 'Token');
  const bx = 540, by = 620;
  const cutT = t >= kCut - 8 && t <= kCut + 14;
  /* 镜头冲击：刀落下的瞬间（camera punch + 震屏 + 白闪） */
  const hit = t - kCut;
  const punch = hit > -6 && hit < 20 ? 1 + 0.085 * Math.sin(((hit + 6) / 26) * Math.PI) : 1;
  const quake = hit > 0 && hit < 22 ? Math.sin(hit * 3.4) * 16 * Math.exp(-hit / 9) : 0;
  const white = hit > 0 && hit < 12 ? 0.72 * (1 - hit / 12) : 0;
  /* 刀加速落（ease-in） */
  const kp = clamp01((t - (kCut - 8)) / 14);
  const knifeY = lerp(by - 430, by + 230, kp * kp);
  const broken = t > kCut + 2;
  /* 裂纹：从中心向外的锯齿 */
  const cracks = hit > 0 && hit < 26
    ? Array.from({ length: 7 }).map((_, i) => {
      const len = 40 + (hit / 26) * 260;
      const a = (i / 7) * Math.PI * 2 + 0.3;
      const x2 = bx + Math.cos(a) * len, y2 = by + Math.sin(a) * len;
      const mx = bx + Math.cos(a + 0.18) * len * 0.5, my = by + Math.sin(a + 0.18) * len * 0.5;
      return <path key={i} d={`M ${bx} ${by} L ${mx} ${my} L ${x2} ${y2}`} stroke="#FFFFFF" strokeWidth={5 - (hit / 26) * 3} fill="none" opacity={1 - hit / 26} />;
    })
    : null;
  /* 速度线（manga 冲击线） */
  const speedLines = hit > -2 && hit < 16
    ? Array.from({ length: 16 }).map((_, i) => {
      const a = (i / 16) * Math.PI * 2;
      const r1 = 210 + rand(i) * 40, r2 = 520 + rand(i * 3) * 180;
      return <line key={i} x1={bx + Math.cos(a) * r1} y1={by + Math.sin(a) * r1} x2={bx + Math.cos(a) * r2} y2={by + Math.sin(a) * r2}
        stroke={i % 3 === 0 ? RED : '#9DB4D0'} strokeWidth={2 + rand(i) * 3} opacity={0.5 * (1 - hit / 16)} />;
    })
    : null;
  const shards = broken
    ? Array.from({ length: 18 }).map((_, i) => {
      const ang = (i / 18) * Math.PI * 2 + rand(i) * 0.6;
      const spd = 7 + rand(i * 2.3) * 10;
      const dt = Math.max(0, t - (kCut + 2 + i * 1.1));
      return {
        i,
        x: bx + Math.cos(ang) * spd * dt,
        y: by + Math.sin(ang) * spd * dt + 0.34 * dt * dt,
        rot: dt * (10 + rand(i) * 18) * (i % 2 ? 1 : -1),
        sz: 18 + rand(i * 4.1) * 26,
        o: Math.max(0, 1 - dt / 40),
      };
    })
    : [];
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#E4F0FF" f={t} seed={2} />
      <g transform={`translate(${540 + quake} ${960}) scale(${punch}) translate(-540 -960)`}>
        {!broken ? (
          <g transform={`translate(${bx} ${by}) rotate(${Math.sin(t / 30) * 2})`}>
            <rect x={-200} y={-270} width={400} height={540} rx={14} fill="#FFFFFF" stroke={NAVY} strokeWidth={6} />
            <rect x={-200} y={-270} width={42} height={540} rx={12} fill={BLUE} opacity={0.85} />
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x={-144} y={-238 + i * 41} width={310 - (i % 3) * 48} height={13} rx={6} fill={NAVY} opacity={0.28} />
            ))}
          </g>
        ) : null}
        {/* 碎片：带拖尾残影（冲击感） */}
        {shards.map((s) => (
          <g key={s.i}>
            <rect x={s.x - s.sz / 2 - 14} y={s.y - s.sz / 2 - 8} width={s.sz} height={s.sz * 1.1} rx={3} fill="#9DB4D0" opacity={s.o * 0.28} />
            <g transform={`translate(${s.x} ${s.y}) rotate(${s.rot})`} opacity={s.o}>
              <rect x={-s.sz / 2} y={-s.sz / 2} width={s.sz} height={s.sz * 1.1} rx={3} fill="#FFFFFF" stroke={NAVY} strokeWidth={2.5} />
            </g>
          </g>
        ))}
        {cracks}
        {speedLines}
        {cutT ? (
          <g transform={`translate(${bx} ${knifeY})`}>
            <rect x={-15} y={-175} width={30} height={175} rx={8} fill="#B9C4D4" stroke={NAVY} strokeWidth={5} />
            <path d="M -15 0 L 15 0 L 7 24 L -7 24 Z" fill="#E8EEF7" stroke={NAVY} strokeWidth={5} />
            <rect x={-42} y={-252} width={84} height={86} rx={14} fill={NAVY} />
            <circle cx={0} cy={-209} r={7} fill={GOLD} />
            {hit > -8 && hit < 10 ? <rect x={-26} y={-200} width={52} height={400} fill={BLUE} opacity={0.25} /> : null}
          </g>
        ) : null}
        {cutT ? <rect x={bx - 5} y={0} width={10} height={1920} fill="#FFFFFF" opacity={0.8} /> : null}
        {TOKENS.map((w, i) => {
          const d = kCut + 16 + i * 5;
          const p = clamp01((t - d) / 24);
          const col = i % 3, row = Math.floor(i / 3);
          const landX = 540 + (col - 1) * 132;
          const landY = 1200 + row * 96;
          const x = lerp(bx + (col - 1) * 96, landX, p);
          const y = lerp(by + (row === 0 ? -70 : 70), landY, p) - Math.sin(p * Math.PI) * 150;
          const rot = (1 - p) * (i % 2 === 0 ? 28 : -28);
          const sq = p >= 1 ? squash(t, d + 24, 0.32) : { sx: 1, sy: 1 };
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sq.sx} ${sq.sy})`} opacity={at(t, d, 8)}>
              <rect x={-48} y={-34} width={96} height={68} rx={12} fill="#FFFFFF" stroke={BLUE} strokeWidth={4} />
              <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={800} fill={NAVY}>{w}</text>
            </g>
          );
        })}
      </g>
      {white > 0.01 ? <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={white} /> : null}
      {/* 「Token」大字砸屏（配音念到 Token 时，红字金边 + 冲击环） */}
      {t > kToken - 8 ? (
        <g>
          {[0, 1, 2].map((k) => {
            const age = t - (kToken - 8) - k * 5;
            if (age < 0) return null;
            return <circle key={k} cx={540} cy={700} r={60 + age * 11} fill="none" stroke={k % 2 ? GOLD_D : RED}
              strokeWidth={9 - k * 2} opacity={Math.max(0, 1 - age / 34)} />;
          })}
          <g transform={`translate(540 700) scale(${pop(t, kToken - 8, 14)}) rotate(${(1 - clamp01((t - kToken + 8) / 14)) * -10})`}>
            <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={150} fontWeight={900}
              fill={RED} stroke={GOLD} strokeWidth={10} paintOrder="stroke" style={{ letterSpacing: 2 }}>Token</text>
          </g>
        </g>
      ) : null}
      <XiaoMo x={920} y={560} s={0.74} mood="proud" f={t} hat="chef" rot={Math.sin(t / 16) * 4} />
      <LaoJia x={150} y={1310} s={0.92} mode="point" f={t} />
    </svg>
  );
};

/* =====================================================================
   幕2「滚」：小球进进出出循环滚 + 关键时刻抓住"真"球
   ===================================================================== */
const Scene3: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const ground = 1220;
  const holdX = 700;
  const R = 42;
  const LOOP = 1180;

  /* ===== 抓球（老贾 10/21：球要一直弹，最后那一下才真抓住）=====
     kCatch 绑口播"推"字｜kArrive 球滚到脚下｜kReach 手开始往上够 */
  const kCatch = 138;         // 196 帧 ≈ 6.53s
  const kReach = kCatch - 36;         // 160 手开始往上够
  const kArrive = 78;                 // 球滚到机器人脚下
  const CATCH_Y = ground - R - 150;   // 1028：抓住时球在弹跳最高点
  const MITT_Y = CATCH_Y + 42;        // 1070：手心托在球下面
  const held = t >= kCatch;
  const impact = held ? Math.exp(-(t - kCatch) / 8) : 0;

  /* 手：垂下 → 往上够 → 在球下面接住 */
  const reachE = ez(t - kReach, 30);
  const hx = lerp(862, holdX, reachE);
  const hy = lerp(1180, MITT_Y, reachE);
  const shX = 848;
  const shY = 1062;
  const adx = hx - shX;
  const ady = hy - shY;
  const alen = Math.hypot(adx, ady) || 1;
  const cX = (shX + hx) / 2 + (ady / alen) * 72;
  const cY = (shY + hy) / 2 - (adx / alen) * 72;

  /* 被抓的那颗"真"球：滚动 → 减速停在脚下 → 原地越弹越高 → 最后一下被抓住 */
  const ltP = Math.max(0, t - 13);
  const rawP = 210 + ltP * 7.6;
  const over = Math.max(0, rawP - holdX);
  const xP = rawP - over * ez(over, 90);
  const hopP = t < kArrive
    ? 92 * Math.abs(Math.sin(ltP * 0.19))
    : 150 * Math.abs(Math.sin(Math.PI * (t - kArrive) / 27.3333));
  const yP = held ? CATCH_Y + Math.sin((t - kCatch) * 0.14) * 2.5 : ground - R - hopP;
  const sqP = held
    ? { sx: 1 + 0.16 * impact, sy: 1 - 0.14 * impact }
    : squash(ltP, 0, 0.2);
  const shP = 1 - hopP / 190;

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#FFF4DC" f={t} seed={3} />
      <path d="M 40 1480 L 1040 1480 L 870 1090 L 210 1090 Z" fill="#FFFFFF" opacity={0.9} />
      <line x1={210} y1={1090} x2={870} y2={1090} stroke={NAVY} strokeWidth={5} opacity={0.5} />
      {Array.from({ length: 5 }).map((_, i) => {
        const y = 1122 + i * i * 16;
        const w = 620 + i * 68;
        return <line key={i} x1={540 - w / 2} y1={y} x2={540 + w / 2} y2={y} stroke={LINE} strokeWidth={3} />;
      })}
      {/* 手臂（先画：球压在手心上 = 球被手托住） */}
      {t > 40 ? (
        <g>
          <path d={`M ${shX} ${shY} Q ${cX} ${cY} ${hx} ${hy}`} stroke={NAVY} strokeWidth={14} fill="none" strokeLinecap="round" />
          <circle cx={hx} cy={hy} r={22} fill={GOLD} stroke={NAVY} strokeWidth={4} />
        </g>
      ) : null}
      {RUNNERS.map((w, i) => {
        if (i === PICKED) {
          return (
            <g key={i} transform={`translate(${xP} ${yP}) scale(${sqP.sx} ${sqP.sy})`}>
              <ellipse cx={0} cy={ground - yP - 4} rx={R * 0.78 * shP} ry={8 * shP} fill={NAVY} opacity={0.12 * shP + 0.05} />
              <circle cx={0} cy={0} r={R} fill={held ? 'url(#ballGold2)' : 'url(#ballBlue)'} stroke={NAVY} strokeWidth={4} />
              <circle cx={-R * 0.34} cy={-R * 0.36} r={R * 0.2} fill="#FFFFFF" opacity={0.85} />
              <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900} fill={held ? NAVY : '#FFFFFF'}>{w}</text>
              {held ? <circle cx={0} cy={0} r={R + 16} fill="none" stroke={GOLD_D} strokeWidth={7} /> : null}
            </g>
          );
        }
        const lt = Math.max(0, t - 6 - i * 7);
        const raw = 60 + ((lt * 7.6 + i * 150) % LOOP);
        const hop = Math.abs(Math.sin(lt * 0.19));
        const y = ground - R - hop * 92;
        const sq = squash(lt, 0, 0.2);
        return (
          <g key={i} transform={`translate(${raw} ${y}) scale(${sq.sx} ${sq.sy})`}>
            <ellipse cx={0} cy={ground - y - 4} rx={R * 0.78} ry={8} fill={NAVY} opacity={0.12} />
            <circle cx={0} cy={0} r={R} fill="url(#ballBlue)" stroke={NAVY} strokeWidth={4} />
            <circle cx={-R * 0.34} cy={-R * 0.36} r={R * 0.2} fill="#FFFFFF" opacity={0.85} />
            <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900} fill="#FFFFFF">{w}</text>
          </g>
        );
      })}
      {/* 抓住那一瞬间：冲击环 + 火花 + 手指扣住球 */}
      {held ? (
        <g>
          {t < kCatch + 22 ? (
            <circle cx={holdX} cy={CATCH_Y} r={R + 18 + (t - kCatch) * 13} fill="none" stroke={GOLD_D}
              strokeWidth={Math.max(1, 6 - (t - kCatch) * 0.22)} opacity={Math.max(0, 1 - (t - kCatch) / 22)} />
          ) : null}
          {Array.from({ length: 10 }).map((_, k) => {
            const a = (k / 10) * Math.PI * 2 - 0.5;
            const age = Math.min(26, Math.max(0, t - kCatch));
            const rr = age * 7.4;
            return (
              <circle key={k} cx={holdX + Math.cos(a) * rr} cy={CATCH_Y + Math.sin(a) * rr}
                r={Math.max(0, 8 - age * 0.26)} fill={k % 2 ? GOLD : '#FFFFFF'}
                opacity={Math.max(0, 1 - age / 26)} />
            );
          })}
          <path d={`M ${holdX - 34} ${CATCH_Y - 20} q 15 -24 34 -24`} stroke={GOLD} strokeWidth={11} fill="none" strokeLinecap="round" />
          <path d={`M ${holdX + 34} ${CATCH_Y - 20} q -15 -24 -34 -24`} stroke={GOLD} strokeWidth={11} fill="none" strokeLinecap="round" />
        </g>
      ) : null}
      {/* 知识结构①：一次一个字（老贾 10/21：球往天上一抛，在空中弹，弹到哪里哪里出字）
          字只写知识结构名，位置放上方空位；知识结构用"动"来表达，不是 PPT */}
      {held ? (() => {
        const p = t - kCatch;
        const PTS = [
          { x: 700, y: 1028 },
          { x: 420, y: 790 },
          { x: 660, y: 700 },
          { x: 500, y: 620 },
          { x: 690, y: 520 },
        ];
        const WORDS = ['今', '明', '天', '真'];
        const seg = Math.min(PTS.length - 2, Math.floor(p / 24));
        const fu = clamp01((p - seg * 24) / 24);
        const pa = PTS[seg], pb = PTS[seg + 1];
        const bx = lerp(pa.x, pb.x, fu);
        const by = lerp(pa.y, pb.y, fu) - Math.sin(fu * Math.PI) * 70;
        const spin = p * 0.22;
        return (
          <g>
            <text x={540} y={330} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={NAVY}
              opacity={at(t, kCatch + 4, 12)}>一次一个字</text>
            {WORDS.map((w, i) => {
              const d = (i + 1) * 24 - 8;
              const on = p >= d;
              const picked = w === '真' && p > 4 * 24 + 8;
              const px = PTS[i + 1].x, py = PTS[i + 1].y;
              return (
                <g key={w} opacity={on ? (picked ? 1 : 0.45) : 0.08}>
                  <text x={px} y={py + 16} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900}
                    fill={on ? NAVY : '#C9D4E4'}>{w}</text>
                  {on ? <circle cx={px} cy={py - 26} r={11} fill={GOLD} /> : null}
                </g>
              );
            })}
            <g transform={`translate(${bx} ${by}) rotate(${spin})`}>
              <circle cx={0} cy={0} r={30} fill={GOLD} opacity={0.22} />
              <circle cx={0} cy={0} r={21} fill="url(#ballGold2)" stroke={NAVY} strokeWidth={3.5} />
            </g>
          </g>
        );
      })() : null}
      {t > 40 ? <XiaoMo x={930} y={1050} s={0.96 * (1 + 0.07 * impact)} mood={held ? 'proud' : 'serious'} f={t} rot={-6} flip /> : null}
      <LaoJia x={140} y={1330} s={0.95} mode={held ? 'point' : 'win'} f={t} />
      <g transform={`translate(${holdX} 950)`} opacity={at(t, 42, 10)}>
        <rect x={-54} y={-30} width={108} height={58} rx={16} fill="#FFFFFF" stroke={GOLD_D} strokeWidth={5} />
        <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill={GOLD_D}>×1</text>
      </g>
    </svg>
  );
};

/* =====================================================================
   幕3「传」：甩纸条 + 分数条 + 最后"选了谁"（老贾 10/20 要求）
   ===================================================================== */
const Scene4: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  /* 音画咬合（老贾 10/21：纸条必须等口播说到"发一张纸条"才动，别提前演完） */
  const kThrow = kf(si, '发一张纸条');        // 123 帧 ≈ 4.12s
  const kScore = kf(si, '谁跟下一个字最相关');  // 161 帧 ≈ 5.37s
  const kTop = kf(si, '谁分最高');             // 209 帧 ≈ 6.98s
  const throwD = (i: number) => kThrow + i * 8;
  /* 每甩一张纸条，小模跟着抖一下 */
  const throwFlick = NOTES.reduce((acc, n, i) => {
    const d = throwD(i);
    const k = t >= d && t < d + 14 ? Math.sin(((t - d) / 14) * Math.PI) : 0;
    return Math.max(acc, k);
  }, 0);
  const top = NOTES.reduce((a, b) => (b.s > a.s ? b : a), NOTES[0]);
  const chosen = t > kTop + 26;
  const focusP = clamp01((t - kTop) / 26);   // 209→235：聚焦"银行"
  /* 一颗金珠子在字框之间来回跳（"回头看前面所有的字"），纸条发完就停在"银行"上 */
  const SPAN = NOTES.length - 1;
  const PERIOD = 116;
  const topIdx = NOTES.indexOf(top);
  const beadAt = (tt: number) => {
    const uu = (tt % PERIOD) / PERIOD;
    const tr = uu < 0.5 ? uu * 2 : 2 - uu * 2;
    const p0 = lerp(tr * SPAN, Math.round(tr * SPAN), 0.55);
    return lerp(p0, topIdx, focusP);
  };
  const beadPos = beadAt(t);
  const beadPrev = beadAt(t - 3);
  const beadDir = beadPos >= beadPrev ? 1 : -1;
  const beadX = 150 + beadPos * 195;
  const beadY = 1186 - Math.abs(Math.sin(t * 0.16)) * 20;
  const beadSc = 1 + 0.35 * focusP;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#E6F7EE" f={t} seed={4} />
      {/* 5个字框：原地保留（字不动不转），被金珠子带着一起上下动 */}
      {NOTES.map((n, i) => {
        const tx = 150 + i * 195, ty = 1290;
        const isTop = n.w === top.w;
        const lit = t > kScore + i * 15 && t < kScore + (i + 1) * 15 + 10;
        const inP = at(t, i * 6, 14);
        const dist = Math.abs(beadPos - i);
        const pull = clamp01(1 - dist);
        const lift = pull * 19;
        const hot = pull > 0.6;
        const landT = t - (throwD(i) + 26);
        const land = landT >= 0 && landT < 16 ? Math.sin((landT / 16) * Math.PI) * 0.13 : 0;
        const foc = isTop ? 1 + 0.3 * focusP : 1 - 0.14 * focusP;
        const dim = isTop ? 1 : 1 - 0.5 * focusP;
        const sc = (0.75 + 0.25 * inP) * (1 + land + pull * 0.05) * foc * (1 + Math.sin(t * 0.15 + i * 0.8) * 0.015);
        const dy = Math.sin(t * 0.13 + i * 0.6) * 4;
        const barStart = Math.max(kScore, throwD(i) + 30);
        const barP = clamp01((t - barStart) / 22);
        const barW = 118 * (n.s / 100) * barP;
        return (
          <g key={i} transform={`translate(${tx} ${ty - lift + dy}) scale(${sc})`} opacity={dim}>
            {isTop && focusP > 0 ? (
              <ellipse cx={0} cy={0} rx={170} ry={140} fill={GOLD} opacity={0.3 * focusP} />
            ) : null}
            {barP > 0 ? (
              <g transform="translate(0 -186)">
                <rect x={-59} y={0} width={118} height={16} rx={8} fill="#FFFFFF" stroke={NAVY} strokeWidth={2.5} opacity={0.9} />
                <rect x={-59} y={0} width={barW} height={16} rx={8} fill={isTop ? RED : GREY} />
                <text x={0} y={-10} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={900} fill={isTop ? RED : GREY} opacity={barP}>{n.s}</text>
              </g>
            ) : null}
            <rect x={-56} y={-48} width={112} height={96} rx={14}
              fill={isTop && t > kTop ? GOLD : lit ? '#FFF3CF' : '#FFFFFF'}
              stroke={hot || (isTop && t > kTop) ? GOLD_D : NAVY} strokeWidth={hot ? 6 : 4} />
            <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={800} fill={NAVY}>{n.w}</text>
            {isTop && t > kTop ? <circle cx={0} cy={0} r={76} fill="none" stroke={RED} strokeWidth={5} /> : null}
            {isTop && chosen ? (
              <g transform="translate(0 -250)">
                <path d="M -14 -6 L -4 6 L 16 -16" stroke={GREEN} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            ) : null}
          </g>
        );
      })}
      {/* 珠子轨道 + 金珠子（来回跳，最后停在"银行"上） */}
      <line x1={140} y1={1196} x2={940} y2={1196} stroke="#9FB8D4" strokeWidth={5} strokeDasharray="18 14" />
      {[3, 2, 1].map((k) => (
        <circle key={k} cx={150 + (beadPos - beadDir * 0.22 * k) * 195} cy={beadY}
          r={26 - k * 6} fill={GOLD} opacity={0.3 - k * 0.08} />
      ))}
      <g transform={`translate(${beadX} ${beadY}) scale(${beadSc})`}>
        <circle cx={0} cy={0} r={48} fill={GOLD} opacity={0.2} />
        <circle cx={0} cy={0} r={30} fill={GOLD} opacity={0.35} />
        <circle cx={0} cy={0} r={24} fill="url(#ballGold2)" stroke={GOLD_D} strokeWidth={3.5} />
        <circle cx={-8} cy={-9} r={7} fill="#FFFFFF" opacity={0.95} />
        <path d="M 0 -34 A 34 34 0 0 1 29 17" fill="none" stroke={GOLD_D} strokeWidth={4} strokeLinecap="round" opacity={0.85} />
      </g>
      {NOTES.map((n, i) => {
        const d = throwD(i);
        const p = clamp01((t - d) / 26);
        if (p <= 0) return null;
        const tx = 150 + i * 195, ty = 1230;
        const [x, y] = bez([400, 808], [400, 596], [tx, ty], p);
        const arrived = p >= 1;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${arrived ? 0 : p * 430}) scale(${arrived ? 0.6 : 1})`}>
            <rect x={-38} y={-24} width={76} height={48} rx={6} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
            <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={800} fill={NAVY}>{n.w}</text>
          </g>
        );
      })}
      {/* 小模手里的纸条堆（放在身体左上角，别被身体挡住）：口播说到"发一张纸条"之前先备好，一张一张甩出去 */}
      {t >= kThrow - 26 ? (
        <g
          opacity={at(t, kThrow - 26, 12)}
          transform={`translate(400 806) scale(${0.55 + 0.45 * at(t, kThrow - 26, 12)}) translate(-400 -806)`}
        >
          {NOTES.map((n, i) => (t > throwD(i) ? null : (
            <rect key={i} x={366 + i * 4} y={792 + i * 3} width={68} height={42} rx={5} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
          )))}
        </g>
      ) : null}
      {/* 光点汇聚到"银行"：每个字的注意力变成一颗光点飞过去 */}
      {t > kScore ? (() => {
        /* 探针珠：每 15 帧跳一个字，跳到哪哪个字被"照"亮；跑完才亮出"注意力机制" */
        const JUMP = 15;
        const p = t - kScore;
        const idx = Math.min(4, Math.floor(p / JUMP));
        const frac = (p % JUMP) / JUMP;
        const bx = lerp(150 + idx * 195, 150 + Math.min(4, idx + 1) * 195, frac);
        const by = 1218 - Math.sin(frac * Math.PI) * 48;
        const showWord = p > 5 * JUMP + 12;
        return (
          <g>
            <circle cx={bx} cy={by} r={30} fill={GOLD} opacity={0.2} />
            <circle cx={bx} cy={by} r={17} fill={GOLD} stroke={NAVY} strokeWidth={3} />
          </g>
        );
      })() : null}
      {/* 知识结构：注意力机制 —— 小模抓起珠子往上一抛，珠子弹到哪哪个字就冒出来
          （老贾 10/21：不要 PPT 砸字，要用动画演出来） */}
      {t > kTop - 10 ? (() => {
        const W = '注意力机制';
        const n = W.length;
        const p = t - (kTop - 10);
        const seg = Math.min(n - 1, Math.floor(p / 16));
        const fu = clamp01((p - seg * 16) / 16);
        const xs = W.split('').map((_, i) => 540 + (i - (n - 1) / 2) * 122);
        const by = 470 - Math.sin(fu * Math.PI) * 80;
        const sx = lerp(650, xs[seg], Math.min(1, p / 14));
        const sy = lerp(950, by, Math.min(1, p / 14)) - Math.sin(Math.min(1, p / 14) * Math.PI) * 150;
        return (
          <g>
            {W.split('').map((c, i) => {
              const on = p >= i * 16 + 5;
              const k = Math.max(0, p - i * 16 - 5);
              const sc = on ? 1 + 0.14 * Math.sin(k * 0.5) * Math.exp(-k * 0.2) : 0;
              return (
                <text key={i} x={xs[i]} y={470} textAnchor="middle" fontFamily={FONT} fontSize={104} fontWeight={900}
                  fill={GOLD} stroke={NAVY} strokeWidth={6} paintOrder="stroke" opacity={on ? 1 : 0}
                  transform={`translate(${xs[i]} 470) scale(${sc}) translate(${-xs[i]} -470)`}>{c}</text>
              );
            })}
            <circle cx={sx} cy={sy} r={40} fill={GOLD} opacity={0.2} />
            <circle cx={sx} cy={sy} r={24} fill="url(#ballGold2)" stroke={NAVY} strokeWidth={3.5} />
          </g>
        );
      })() : null}
      {t > kTop ? NOTES.map((n, i) => {
        if (n.w === top.w) return null;
        const p = clamp01((t - (kTop + i * 5)) / 28);
        if (p <= 0) return null;
        const fromX = 150 + i * 195, fromY = 1290;
        const toX = 150 + NOTES.indexOf(top) * 195, toY = 1290;
        const [x, y] = bez([fromX, fromY], [fromX, fromY - 300], [toX, toY], p);
        return <circle key={i} cx={x} cy={y} r={11 - p * 7} fill={GOLD} opacity={0.95 * (1 - p)}
          style={{ filter: 'drop-shadow(0 0 10px rgba(255,184,0,0.95))' }} />;
      }) : null}
      {/* 光点全部汇入银行：一下金光炸开（画龙点睛） */}
      {t > kTop + 22 && t < kTop + 62 ? (
        <circle cx={540} cy={1290} r={70 + (t - kTop - 22) * 15} fill="none" stroke={GOLD}
          strokeWidth={Math.max(1, 8 - (t - kTop - 22) * 0.22)} opacity={Math.max(0, 1 - (t - kTop - 22) / 40)} />
      ) : null}
      {/* 银行头顶：光点转圈 */}
      {t > kTop ? (
        <g transform={`translate(${150 + NOTES.indexOf(top) * 195} 1170)`}>
          {Array.from({ length: 8 }).map((_, k) => {
            const ang = (k / 8) * Math.PI * 2 + t * 0.12;
            return <circle key={k} cx={Math.cos(ang) * 46} cy={Math.sin(ang) * 46 * 0.55} r={6} fill={GOLD_D} opacity={0.9} />;
          })}
        </g>
      ) : null}
      <XiaoMo x={540} y={900} s={1.0} mood="proud" f={t} rot={-9 * throwFlick} />
      <LaoJia x={956} y={1300} s={0.9} mode="present" f={t} />
    </svg>
  );
};

/* =====================================================================
   幕4「漂」：三卡 + 动态距离数字 + 猫字碎成方块
   ===================================================================== */
const Scene5: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const kCat = kf(si, '猫');
  const kDog = kf(si, '狗');
  const kRocket = kf(si, '火箭');
  const kNotWord = kf(si, '不是字');
  const kNear = kf(si, '挨得越近');
  const cx = 540, cy = 880;
  const p = clamp01((t - kCat) / 110);
  const cards = VECTORS.map((v, i) => {
    const x = cx + lerp(v.x0, v.x1, p);
    const y = cy + v.y + Math.sin(t / 17 + i * 2) * 14;
    return { ...v, x, y, i };
  });
  const cat = cards[0], dog = cards[1], rocket = cards[2];
  const d1 = lerp(0.36, 0.18, clamp01((t - kNear) / 50));
  const d2 = lerp(0.90, 0.95, clamp01((t - kNear) / 50));
  const shatter = t > kNotWord;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#F0E9FF" f={t} seed={5} />
      {/* 同心轨道：只留 4 圈淡淡的，当"位置空间"底纹 */}
      <g opacity={0.32}>
        {Array.from({ length: 4 }).map((_, i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={90 + i * 96} ry={(90 + i * 96) * 0.36} fill="none" stroke={LINE} strokeWidth={2} />
        ))}
      </g>
      {/* 以"猫"为起点的两条向量箭头：粗细按真实相似度 0.95 / 0.18（视觉总监 10/21：给个视觉锚点，别像蛛网） */}
      {(() => {
        const mk = (to: { x: number; y: number }, label: string, sim: number, color: string) => {
          const ox = cat.x, oy = cat.y;
          const ang = Math.atan2(to.y - oy, to.x - ox);
          const len = Math.hypot(to.x - ox, to.y - oy);
          const ex = ox + Math.cos(ang) * (len - 92);
          const ey = oy + Math.sin(ang) * (len - 92);
          const w = 5 + sim * 22;
          const hx = Math.cos(ang), hy = Math.sin(ang);
          const px = -hy, py = hx;
          const tipX = ox + Math.cos(ang) * (len - 78);
          const tipY = oy + Math.sin(ang) * (len - 78);
          const lab = at(t, kCat + 8, 8);
          return (
            <g key={color}>
              <line x1={ox} y1={oy} x2={ex} y2={ey} stroke={color} strokeWidth={w} opacity={0.5} strokeLinecap="round" />
              <path d={`M ${tipX} ${tipY} L ${ex + px * (w + 12)} ${ey + py * (w + 12)} L ${ex - px * (w + 12)} ${ey - py * (w + 12)} Z`} fill={color} opacity={0.85} />
              {Array.from({ length: 3 }).map((_, k) => {
                const u = ((t / 26) + k / 3) % 1;
                return <circle key={k} cx={lerp(ox, ex, u)} cy={lerp(oy, ey, u)} r={7 + w * 0.12} fill={color} opacity={0.9} />;
              })}
              <g opacity={lab}>
                <rect x={(ox + ex) / 2 + px * -52 - 52} y={(oy + ey) / 2 + py * -52 - 23} width={104} height={46} rx={12} fill="#FFFFFF" stroke={color} strokeWidth={4} />
                <text x={(ox + ex) / 2 + px * -52} y={(oy + ey) / 2 + py * -52 + 3} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={900} fill={color}>{label}</text>
              </g>
            </g>
          );
        };
        return (
          <g>
            {mk(dog, d2.toFixed(2), d2, GOLD_D)}
            {mk(rocket, d1.toFixed(2), d1, GREY)}
          </g>
        );
      })()}
      {t > kNear && t < kNear + 34 ? (
        <circle cx={(cat.x + dog.x) / 2} cy={(cat.y + dog.y) / 2} r={Math.min(240, (t - kNear) * 8)}
          fill="none" stroke={GOLD} strokeWidth={7} opacity={Math.max(0, 1 - (t - kNear) / 34)} />
      ) : null}
      {/* 知识结构：相似度 —— 一颗珠子沿箭头滑过去，滑过哪两个词就亮（老贾 10/21） */}
      {t > kCat ? (() => {
        const u = clamp01((t - kCat - 30) / 110);
        const slide = u < 0.5 ? u / 0.5 : 1 - (u - 0.5) / 0.5;
        const sx = lerp(cat.x, dog.x, slide);
        const sy = lerp(cat.y, dog.y, slide) - Math.sin(slide * Math.PI) * 80;
        return (
          <g>
            <circle cx={sx} cy={sy} r={30} fill={GOLD} opacity={0.22} />
            <circle cx={sx} cy={sy} r={17} fill={GOLD} stroke={NAVY} strokeWidth={3} />
          </g>
        );
      })() : null}
      {/* 知识结构：相似度 —— 同样是抛珠出字（老贾 10/21：统一动作语言） */}
      {t > kNear - 8 ? (() => {
        const W = '相似度';
        const n = W.length;
        const p = t - (kNear - 8);
        const seg = Math.min(n - 1, Math.floor(p / 16));
        const fu = clamp01((p - seg * 16) / 16);
        const xs = W.split('').map((_, i) => 540 + (i - (n - 1) / 2) * 150);
        const by = 470 - Math.sin(fu * Math.PI) * 80;
        const sx = lerp(650, xs[seg], Math.min(1, p / 14));
        const sy = lerp(1400, by, Math.min(1, p / 14)) - Math.sin(Math.min(1, p / 14) * Math.PI) * 150;
        return (
          <g>
            {W.split('').map((c, i) => {
              const on = p >= i * 16 + 5;
              const k = Math.max(0, p - i * 16 - 5);
              const sc = on ? 1 + 0.14 * Math.sin(k * 0.5) * Math.exp(-k * 0.2) : 0;
              return (
                <text key={i} x={xs[i]} y={470} textAnchor="middle" fontFamily={FONT} fontSize={124} fontWeight={900}
                  fill={NAVY} stroke={GOLD} strokeWidth={7} paintOrder="stroke" opacity={on ? 1 : 0}
                  transform={`translate(${xs[i]} 470) scale(${sc}) translate(${-xs[i]} -470)`}>{c}</text>
              );
            })}
            <circle cx={sx} cy={sy} r={40} fill={GOLD} opacity={0.2} />
            <circle cx={sx} cy={sy} r={24} fill="url(#ballGold2)" stroke={NAVY} strokeWidth={3.5} />
          </g>
        );
      })() : null}
      {cards.map((v) => {
        const born = v.i === 0 ? kCat : v.i === 1 ? kDog : kRocket;
        return (
          <g key={v.i} transform={`translate(${v.x} ${v.y}) rotate(${Math.sin(t / 26 + v.i) * 5})`} opacity={at(t, born, 8)}>
            <rect x={-80} y={-62} width={160} height={124} rx={18} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} />
            <g transform="translate(-38 -18) scale(0.86)">
              {v.i === 0 ? (
                <>
                  <path d="M -16 10 L -20 -24 L 4 -6 Z" fill={GOLD} stroke={NAVY} strokeWidth={4} />
                  <path d="M 24 10 L 28 -24 L 8 -6 Z" fill={GOLD} stroke={NAVY} strokeWidth={4} />
                  <circle cx={4} cy={8} r={28} fill={GOLD} stroke={NAVY} strokeWidth={4} />
                  <circle cx={-5} cy={3} r={4.5} fill={NAVY} />
                  <circle cx={13} cy={3} r={4.5} fill={NAVY} />
                  <path d="M -3 18 q 7 7 14 0" stroke={NAVY} strokeWidth={3.5} fill="none" />
                </>
              ) : v.i === 1 ? (
                <>
                  <ellipse cx={0} cy={4} rx={28} ry={25} fill={BLUE} stroke={NAVY} strokeWidth={4} />
                  <ellipse cx={-22} cy={-16} rx={13} ry={22} fill={BLUE} stroke={NAVY} strokeWidth={4} transform="rotate(-20 -22 -16)" />
                  <circle cx={-10} cy={0} r={4.5} fill={NAVY} />
                  <circle cx={10} cy={0} r={4.5} fill={NAVY} />
                  <ellipse cx={0} cy={13} rx={8} ry={6} fill={NAVY} />
                </>
              ) : (
                <>
                  <path d="M 0 -30 C 15 -30 22 -13 20 9 L 18 24 L -18 24 L -20 9 C -22 -13 -15 -30 0 -30 Z" fill={RED} stroke={NAVY} strokeWidth={4} />
                  <circle cx={0} cy={-8} r={8} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
                  <path d="M -18 24 L -25 44 L -9 24 Z M 18 24 L 25 44 L 9 24 Z" fill="#FF8A80" stroke={NAVY} strokeWidth={3} />
                </>
              )}
            </g>
            {v.i === 0 ? (
              shatter ? (
                <g>
                  {Array.from({ length: 14 }).map((_, k) => {
                    const ang = (k / 14) * Math.PI * 2 + (t - kNotWord) * 0.12;
                    const rad = 34 + (((t - kNotWord) * 2.6 + k * 11) % 150);
                    return <circle key={k} cx={Math.cos(ang) * rad} cy={50 + Math.sin(ang) * rad * 0.62}
                      r={5 + 3 * (1 - rad / 190)} fill={k % 4 === 0 ? GOLD_D : NAVY} opacity={Math.max(0.15, 1 - rad / 190)} />;
                  })}
                </g>
              ) : (
                <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={NAVY}>猫</text>
              )
            ) : (
              <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={NAVY}>{v.w}</text>
            )}
          </g>
        );
      })}
      <XiaoMo x={540} y={1350} s={0.74} mood="happy" f={t} rot={Math.sin(t / 20) * 3} />
      <LaoJia x={150} y={1330} s={0.9} mode="talk" f={t} />
    </svg>
  );
};

/* =====================================================================
   幕5「摇」：弹珠机 + 温度刻度盘
   ===================================================================== */
const Scene6: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const kShake = kf(si, '抓阄');
  const kTemp = kf(si, '温度');
  const shake = t > kShake - 20 && t < kShake + 50 ? Math.sin(t * 2.4) * 12 : 0;
  const out = clamp01((t - kShake - 26) / 24);
  const spin = t > kShake ? (t - kShake) * 0.09 : 0;
  const dialP = clamp01((t - kTemp) / 40);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#FFEAF3" f={t} seed={6} />
      <g transform={`translate(${540 + shake} 900) rotate(${shake * 0.3})`}>
        <rect x={-290} y={-290} width={580} height={580} rx={44} fill="#FFFFFF" stroke={NAVY} strokeWidth={7} />
        <circle cx={0} cy={-40} r={190} fill="#FFF6FA" stroke={RED} strokeWidth={7} />
        {BALLS.map((w, i) => {
          const a = t * (0.07 + i * 0.015) + i * 1.7 + spin;
          const rr = 62 + rand(i) * 98;
          const x = Math.cos(a) * rr;
          const y = -40 + Math.sin(a * 1.35 + i) * rr * 0.7;
          const isOut = i === 0 ? out : 0;
          const ox = x + isOut * (320 - rr);
          const oy = y + isOut * (-240);
          return (
            <g key={i} transform={`translate(${ox} ${oy}) scale(1 ${1 + 0.18 * Math.sin(a * 2)})`}>
              <circle cx={0} cy={0} r={29} fill={i % 2 ? 'url(#ballGold2)' : 'url(#ballBlue)'} stroke={NAVY} strokeWidth={4} />
              <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={900} fill={i % 2 ? NAVY : '#FFFFFF'}>{w}</text>
            </g>
          );
        })}
        <rect x={-66} y={182} width={132} height={26} rx={13} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} />
      </g>
      {t > kTemp - 20 ? (
        <g opacity={at(t, kTemp - 20, 12)}>
          <path d="M 750 380 A 110 110 0 0 1 970 380" fill="none" stroke={LINE} strokeWidth={10} />
          <g transform={`translate(860 380) rotate(${lerp(-120, -20, dialP)})`}>
            <line x1={0} y1={0} x2={0} y2={-92} stroke={RED} strokeWidth={8} strokeLinecap="round" />
            <circle cx={0} cy={0} r={13} fill={NAVY} />
          </g>
          <text x={748} y={424} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill={GREY}>0</text>
          <text x={972} y={424} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill={RED}>1</text>
          <rect x={806} y={446} width={108} height={50} rx={14} fill="#FFFFFF" stroke={RED} strokeWidth={4} />
          <text x={860} y={483} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={900} fill={RED}>{lerp(0, 0.8, dialP).toFixed(1)}</text>
          {/* 知识点③：温度 = 随机程度。9 根小柱子=概率分布：低温挤成尖、高温摊平（老贾 10/21） */}
          <g opacity={at(t, kTemp - 10, 12)}>
            {Array.from({ length: 9 }).map((_, i) => {
              const spread = lerp(7, 54, dialP);
              const off = (i - 4) * spread;
              const h = 30 - Math.abs(i - 4) * lerp(5.2, 1.8, dialP);
              return <rect key={i} x={860 + off - 7} y={556 - h} width={14} height={h} rx={4}
                fill={i === 4 ? RED : GREY} opacity={0.85} />;
            })}
            <text x={860} y={598} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={GREY}>温度</text>
          </g>
        </g>
      ) : null}
      <XiaoMo x={230} y={1470} s={0.86} mood="cool" f={t} rot={-5} />
      <LaoJia x={920} y={1420} s={0.86} mode="gasp" f={t} />
      {out > 0.2 ? (
        <g transform={`translate(${230 + out * 150} ${1470 - out * 210}) rotate(${out * 40})`}>
          <circle cx={0} cy={0} r={36} fill="url(#ballGold2)" stroke={NAVY} strokeWidth={5} />
          <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={900} fill={NAVY}>真</text>
        </g>
      ) : null}
    </svg>
  );
};

/* =====================================================================
   幕6「接」：漫画气泡 + 接龙链 + 查资料变乱码 + 双 IP 同框 + 预告
   ===================================================================== */
const Scene7: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const kLie = kf(si, '胡说');
  const kChain = kf(si, '接龙');
  const kNoData = kf(si, '不在查资料');
  const kNotThink = kf(si, '不是在想');
  const kNext = kf(si, '下一集');
  const gearA = t < kNotThink ? t * 0.4 : (kNotThink * 0.4) + Math.min(1, (t - kNotThink) / 24) * 0.7;
  const gearStop = t > kNotThink + 24;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#EDF1F6" f={t} seed={7} />
      {t > kLie && t < kChain ? (
        <g opacity={at(t, kLie, 10) * (1 - clamp01((t - kChain) / 8))}>
          <rect x={140} y={286} width={700} height={230} rx={28} fill="#FFFFFF" stroke={NAVY} strokeWidth={6} />
          <path d="M 240 516 L 210 608 L 330 516 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={6} />
          <text x={490} y={386} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={800} fill={NAVY}>“长城是用来防</text>
          <text x={490} y={452} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={800} fill={NAVY}>Wifi 信号的”</text>
          <line x1={180} y1={408} x2={800} y2={458} stroke={RED} strokeWidth={9} />
        </g>
      ) : null}
      {t > kChain ? (
        <g opacity={at(t, kChain, 10)}>
          {/* 字与字之间的"接龙"连线 */}
          {CHAIN.map((w, i) => (i < CHAIN.length - 1 ? (
            <line key={`l${i}`} x1={175 + i * 145 + 58} y1={672} x2={175 + (i + 1) * 145 - 58} y2={672}
              stroke={GOLD_D} strokeWidth={5} strokeDasharray="10 8" opacity={at(t, kChain + (i + 1) * 8, 6) * 0.85} />
          ) : null))}
          {CHAIN.map((w, i) => {
            const d = kChain + i * 8;
            return (
              <g key={i} transform={`translate(${175 + i * 145} ${672 + Math.sin(t / 13 + i * 0.8) * 5}) scale(${pop(t, d, 14)})`}>
                <rect x={-58} y={-58} width={116} height={116} rx={16} fill="#FFFFFF" stroke={i === CHAIN.length - 1 ? RED : GOLD_D} strokeWidth={5} />
                <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900} fill={NAVY}>{w}</text>
              </g>
            );
          })}
        </g>
      ) : null}
      {t > kNoData ? (
        <g transform={`translate(540 ${932})`}>
          {['查', '资', '料'].map((w, i) => {
            const d = kNoData + i * 10;
            const on = t > d;
            return (
              <g key={w} transform={`translate(${(i - 1) * 120} 0) rotate(${on ? Math.sin(t / 3 + i) * 6 : 0})`}>
                <rect x={-52} y={-52} width={104} height={104} rx={14} fill="#FFFFFF" stroke={NAVY} strokeWidth={4} />
                {on ? (
                  <g>
                    {[0, 1, 2, 3, 4].map((k) => {
                      const w = 11 + ((Math.floor(t / 3) + k * 7) % 3) * 9;
                      const h = 28 + ((Math.floor(t / 4) + k * 5) % 4) * 11;
                      return <rect key={k} x={-46 + k * 21} y={-h / 2} width={w} height={h} rx={3} fill={NAVY} opacity={0.88} />;
                    })}
                  </g>
                ) : (
                  <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={NAVY}>{w}</text>
                )}
              </g>
            );
          })}
        </g>
      ) : null}
      <LaoJia x={270} y={1290} s={1.02} mode="point" f={t} />
      <XiaoMo x={800} y={1300} s={0.82} mood={gearStop ? 'worried' : 'neutral'} f={t} />
      <g transform={`translate(800 ${1300 - 140}) rotate(${(gearA * 180) / Math.PI})`} opacity={gearStop ? 0.45 : 1}>
        <circle cx={0} cy={0} r={26} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={-6} y={-38} width={12} height={16} rx={3} fill={NAVY} transform={`rotate(${i * 45})`} />
        ))}
        <circle cx={0} cy={0} r={8} fill={NAVY} />
      </g>
      {t > kNext ? (
        <g opacity={at(t, kNext, 12)}>
          <rect x={90} y={1046} width={900} height={128} rx={24} fill="#FFFFFF" stroke={GOLD_D} strokeWidth={5} />
          <text x={540} y={1106} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={NAVY}>下一集：Agent 怎么动手干活</text>
          <text x={540} y={1154} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={700} fill={GREY}>我们把它的手脚拆开看</text>
          {['点赞', '关注', '收藏'].map((b, i) => {
            const d = kNext + 12 + i * 8;
            return (
              <g key={b} transform={`translate(${300 + i * 240} ${1216}) scale(${pop(t, d, 14)})`}>
                <rect x={-88} y={-40} width={176} height={80} rx={40} fill={GOLD_D} opacity={0.16} stroke={GOLD_D} strokeWidth={4} />
                <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={GOLD_D}>{b}</text>
              </g>
            );
          })}
        </g>
      ) : null}
    </svg>
  );
};

/* =====================================================================
   主组件
   ===================================================================== */
export const NN2V3: React.FC = () => {
  const f = useCurrentFrame();
  /* 知识卡收进完成的全局秒（右下角收藏夹计数器 ×N 用） */
  const si = F.reduce((acc, v, i) => (f >= v ? i : acc), 0);
  const lf = f - F[si];
  const zoom = si === 0 ? 1 : 1 + 0.04 * (1 - ez(lf, 9));
  const flash = si === 0 ? 0 : 0.34 * (1 - ez(lf, 7));
  const Scene = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7][si] || Scene1;
  const endFade = TOTAL_FRAMES - f < 26 ? clamp01((TOTAL_FRAMES - f) / 26) : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <radialGradient id="xmBody" cx="36%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#EAF3FF" />
            <stop offset="45%" stopColor="#8CBBFF" />
            <stop offset="100%" stopColor="#2A50C0" />
          </radialGradient>
          <radialGradient id="ballBlue" cx="34%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#C9E0FF" />
            <stop offset="100%" stopColor="#3D7BFF" />
          </radialGradient>
          <radialGradient id="ballGold2" cx="34%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#FFF6D0" />
            <stop offset="55%" stopColor="#FFD24A" />
            <stop offset="100%" stopColor="#D99400" />
          </radialGradient>
        </defs>
      </svg>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Scene f={lf} si={si} />
      </AbsoluteFill>
      {flash > 0.01 ? <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity: flash }} /> : null}
      <Caption f={f} />
      <Badge f={f} />
      {/* 知识卡（老贾 10/21 采纳：核心概念定格一卡，能截图收藏）
          卡片①Token：口播念到 "Token"（全局 7.98s）时主词逐字砸落
          卡片②一次一字：幕3 保龄球，"它一次只吐一个字" 那一下 */}
      {SCRIPT.map((_, i) => (
        <Sequence key={i} from={Math.round(F[i])}>
          <Audio src={staticFile(`audio3/e${i}.mp3`)} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_new/175_DigitalClouds.mp3')} loop volume={(fr) =>
        interpolate(fr, [0, 40, TOTAL_FRAMES - 90, TOTAL_FRAMES], [0, 0.085, 0.085, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
      {endFade < 1 ? <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity: 1 - endFade }} /> : null}
    </AbsoluteFill>
  );
};

/* ---------------- 封面 ---------------- */
export const CoverNN2V3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: BG }}>
    <svg width={1080} height={1080} viewBox="0 0 1080 1080">
      <ellipse cx={540} cy={470} rx={540} ry={430} fill="#E4F0FF" />
      <ellipse cx={200} cy={900} rx={360} ry={280} fill="#FFF4DC" />
      <text x={70} y={78} textAnchor="start" fontFamily={FONT} fontSize={30} fontWeight={800} fill={NAVY} opacity={0.65}>AI 科普 · EP02</text>
      <XiaoMo x={820} y={400} s={0.86} mood="shock" f={26} />
      <rect x={70} y={124} width={690} height={104} rx={24} fill="#FFFFFF" opacity={0.95} />
      <text x={415} y={196} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={NAVY}>AI 怎么思考的？</text>
      <text x={400} y={580} textAnchor="middle" fontFamily={FONT} fontSize={210} fontWeight={900} fill={GOLD_D}>×1</text>
      <text x={400} y={652} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={NAVY}>一次只吐一个字</text>
      <LaoJia x={170} y={870} s={0.72} mode="point" f={26} />
      <rect x={300} y={920} width={480} height={80} rx={40} fill="#FFFFFF" stroke={GOLD_D} strokeWidth={5} />
      <text x={540} y={975} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={GOLD_D}>AI 科普 · EP02 竖屏</text>
    </svg>
  </AbsoluteFill>
);
