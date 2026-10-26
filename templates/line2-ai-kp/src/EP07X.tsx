
/* =============================================================
 * EP07X 三打白骨精 · 第一循环 · 28秒 6幕 · 竖版 1080x1920
 * 风格：EP06（深蓝/金/白/红）；每幕一个强形式概念
 * ============================================================= */

import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, staticFile, Audio, Sequence } from 'remotion';

const BG = '#F5F7FA';
const NAVY = '#0A2540';
const BLUE = '#0A84FF';
const GOLD = '#FFB800';
const RED = '#FF3B30';
const GREEN = '#1E9E4A';
const GREY = '#8E9AAB';
const LINE = '#C9D8EA';
const PUPIL = '#0a0a12';
const FONT = '"Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", sans-serif';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ez = (t: number, d = 12) => 1 - Math.pow(1 - clamp01(t / d), 3);
const eio = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const pop = (f: number, d: number, dur = 18) => {
  const t = clamp01((f - d) / dur);
  return t >= 1 ? 1 : 1 + 2.4 * Math.pow(t - 1, 3) + 1.3 * Math.pow(t - 1, 2);
};
const bez = (p0: number[], p1: number[], p2: number[], u: number): number[] => {
  const v = 1 - u;
  return [v * v * p0[0] + 2 * v * u * p1[0] + u * u * p2[0], v * v * p0[1] + 2 * v * u * p1[1] + u * u * p2[1]];
};
type Pt = { x: number; y: number };
const mouthOf = (x: number, y: number, s: number): Pt => ({ x, y: y - 50 * s });

const flyP = (t: number, arriveAt: number, from: Pt, to: Pt, hold = 14, dur = 12) => {
  const start = arriveAt - hold - dur;
  if (t < start) return null;
  const uh = clamp01((t - start) / hold);
  const u = clamp01((t - start - hold) / dur);
  const e = eio(u);
  const mid = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 150 };
  const p = bez([from.x, from.y], [mid.x, mid.y], [to.x, to.y], e);
  const wob = u >= 1 ? Math.sin((t - arriveAt) * 0.5) * 2.5 : 0;
  return { x: p[0], y: p[1] + wob, s: lerp(0.26, 1, e), o: Math.min(1, uh * 3) };
};

/* ---------------- 背景 ---------------- */
const Backdrop: React.FC<{ tint: string; f: number }> = ({ tint, f }) => {
  const dots = useMemo(() => {
    const out: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 46; i++) out.push({ x: rand(i * 3.1) * 1080, y: rand(i * 7.7) * 1920, r: 2 + rand(i * 11.3) * 3 });
    return out;
  }, []);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect x={0} y={0} width={1080} height={1920} fill={BG} />
      <ellipse cx={240 + Math.sin(f / 70) * 90} cy={420} rx={520} ry={400} fill={tint} opacity={0.85} />
      <ellipse cx={880 + Math.cos(f / 90) * 80} cy={1420} rx={480} ry={380} fill="#DCE9FB" opacity={0.7} />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={LINE} opacity={0.5} />
      ))}
    </svg>
  );
};

/* ================= 原版资产 =================
/* 小模 = EP02 原件（NN2V3.tsx XiaoMo，逐行照搬，不加鼻子不改笑眼 · 老贾 10/21：我要 EP02 一模一样的） */
type Mood = 'choke' | 'shock' | 'proud' | 'serious' | 'happy' | 'dizzy' | 'cool' | 'worried' | 'neutral';

const XiaoMo: React.FC<{
  x: number; y: number; s: number; mood: Mood; f: number; rot?: number; hat?: 'chef' | 'none'; flip?: boolean; blueFace?: boolean;
  armL?: number; armR?: number;
}> = ({ x, y, s, mood, f, rot = 0, hat = 'none', flip = false, blueFace = false, armL, armR }) => {
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
          <ellipse cx={-44} cy={-14} rx={21} ry={9} fill={blueFace ? '#D8E8FF' : '#FFFFFF'} stroke={NAVY} strokeWidth={3} />
          <ellipse cx={44} cy={-14} rx={21} ry={9} fill={blueFace ? '#D8E8FF' : '#FFFFFF'} stroke={NAVY} strokeWidth={3} />
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
        <ellipse cx={-44} cy={-18} rx={rx} ry={ry} fill={blueFace ? '#D8E8FF' : '#FFFFFF'} stroke={NAVY} strokeWidth={3} />
        <ellipse cx={44} cy={-18} rx={rx} ry={ry} fill={blueFace ? '#D8E8FF' : '#FFFFFF'} stroke={NAVY} strokeWidth={3} />
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
          {armL !== undefined ? (
            <g transform={`rotate(${armL} -84 24)`}>
              <line x1={-84} y1={24} x2={-84} y2={-92} stroke={NAVY} strokeWidth={12} strokeLinecap="round" />
              <circle cx={-84} cy={-104} r={14} fill="#B9D4FF" stroke={NAVY} strokeWidth={4} />
            </g>
          ) : null}
          {armR !== undefined ? (
            <g transform={`rotate(${armR} 84 24)`}>
              <line x1={84} y1={24} x2={84} y2={-92} stroke={NAVY} strokeWidth={12} strokeLinecap="round" />
              <circle cx={84} cy={-104} r={14} fill="#B9D4FF" stroke={NAVY} strokeWidth={4} />
            </g>
          ) : null}
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
  present: { armL: -92, armR: -18, jump: 8, lean: 0, headTilt: -8 },
  win: { armL: -85, armR: -85, jump: 34, lean: 0, headTilt: 0 },
  cheer: { armL: -80, armR: -80, jump: 42, lean: 0, headTilt: 0 },
  talk: { armL: -30, armR: 25, jump: 0, lean: 0, headTilt: 0 },
  throw: { armL: -95, armR: 60, jump: 6, lean: -12, headTilt: -8 },
  pace: { armL: -40, armR: 40, jump: 4, lean: 3, headTilt: -4 },
};

const LaoJia: React.FC<{ x: number; y: number; s: number; mode: string; f: number; wag?: boolean }> = ({ x, y, s, mode, f, wag }) => {
  const pose = STPOSES[mode] ?? STPOSES.gasp;
  const t = f / 30;
  const bob = Math.sin(t * (pose.jump ? 10 : 6)) * (pose.jump ? 12 : 5);
  const sway = Math.sin(t * 5) * 8;
  const openNow = wag || Math.sin(t * 17) > 0.55;
  const gesture = Math.sin(t * 7) * 30;
  const gesture2 = Math.sin(t * 7 + 1.6) * 34;
  const K = 1.42;
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

/* ---------------- 工具图标 ---------------- */

/* 包装：小模 + 可选标签（调用处不变） */
const ModelCore: React.FC<{ x: number; y: number; s: number; f: number; label?: string; hot?: boolean; mood?: Mood }> = ({ x, y, s, f, label, hot, mood }) => (
  <g>
    <XiaoMo x={x} y={y} s={s} mood={hot ? 'choke' : (mood ?? 'happy')} f={f} blueFace />
    {label ? (
      <g>
        <rect x={x - 84} y={y + 168} width={168} height={50} rx={25} fill={NAVY} opacity={0.92} />
        <text x={x} y={y + 202} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={800} fill="#FFFFFF">{label}</text>
      </g>
    ) : null}
  </g>
);

/* 老贾常驻位（每幕都在 · 老贾 10/21：时时刻刻都在画面上） */
const LAOJIA_SPOTS = [
  { x: 175, y: 1400, s: 0.80, mode: 'present' },
  { x: 140, y: 1440, s: 0.72, mode: 'point' },
  { x: 870, y: 1425, s: 0.76, mode: 'point' },
  { x: 870, y: 1425, s: 0.76, mode: 'throw' },
  { x: 150, y: 1440, s: 0.72, mode: 'talk' },
  { x: 150, y: 1440, s: 0.72, mode: 'gasp' },
  { x: 870, y: 1425, s: 0.76, mode: 'present' },
  { x: 168, y: 1432, s: 0.78, mode: 'win' },
  { x: 870, y: 1425, s: 0.76, mode: 'point' },
  { x: 890, y: 1435, s: 0.78, mode: 'gasp' },
  { x: 150, y: 1440, s: 0.72, mode: 'point' },
  { x: 930, y: 1380, s: 0.78, mode: 'cheer' },
];

/* ---------------- 顶部固定徽章 ---------------- */
const Badge: React.FC<{ f: number }> = ({ f }) => {
  const p = pop(f, 4, 14);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <g opacity={ez(f - 4, 8)} transform={`translate(54 62) scale(${p})`}>
        <rect x={0} y={0} width={252} height={54} rx={27} fill={NAVY} opacity={0.88} />
        <text x={126} y={37} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#FFFFFF">AI 科普 · EP06</text>
      </g>
    </svg>
  );
};

/* ---------------- 逐字字幕 ---------------- */
const Subtitle: React.FC<{ seg: number; t: number }> = ({ seg, t }) => {
  const chars = CHARS[seg] ?? [];
  const spoken = chars.filter((c) => c.t <= t + 0.001).length;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1712, textAlign: 'center', padding: '0 70px' }}>
      {chars.map((c, i) => {
        const on = i < spoken;
        const cur = i === spoken - 1;
        return (
          <span key={i} style={{
            fontFamily: FONT, fontSize: 46, fontWeight: 800,
            color: cur ? '#FF3B30' : (on ? '#0A5FD0' : '#C3CEDD'),
            display: 'inline-block',
            transform: cur ? 'scale(1.08)' : 'scale(1)',
          }}>{c.c}</span>
        );
      })}
    </div>
  );
};

/* ---------------- 记忆条（贯穿线索） ---------------- */
const MemoryBar: React.FC<{ x: number; y: number; w: number; h: number; fill: number; hot?: boolean; label?: string; f: number; tint?: string }> = ({ x, y, w, h, fill, hot, label = '记忆条', f, tint }) => (
  <g>
    {label ? <text x={x} y={y - 24} fontFamily={FONT} fontSize={32} fontWeight={800} fill={NAVY}>{label}</text> : null}
    <rect x={x} y={y} width={w} height={h} rx={16} fill="#FFFFFF" stroke={hot ? RED : NAVY} strokeWidth={5} />
    <rect x={x + 5} y={y + 5} width={Math.max(0, (w - 10) * clamp01(fill))} height={h - 10} rx={12}
      fill={hot ? RED : (tint ?? BLUE)} opacity={0.3} />
    {hot ? (
      <text x={x + w - 8} y={y - 24} textAnchor="end" fontFamily={FONT} fontSize={30} fontWeight={900} fill={RED}>！满了</text>
    ) : null}
  </g>
);

/* ============================ 动态工具 ============================ */
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const cyc = (f: number, p: number) => (f % p) / p;
const ping = (f: number, p: number) => 0.5 - 0.5 * Math.cos((f / p) * Math.PI * 2);

/* ============================ 幕1 · 1750 亿个参数 ============================ */

/* ---- 冲击工具（huashu 语法移植：砸入/镜头抖/错位帧/白闪） ---- */
const slamS = (l: number, at: number): number => {
  if (l < at) return 1;
  const u = (l - at) / 5;
  if (u >= 1) return 1;
  return u < 0.5 ? 1.55 - 0.61 * (u / 0.5) : 0.94 + 0.06 * ((u - 0.5) / 0.5);
};
const shake = (l: number, at: number, amp = 7): [number, number] => {
  if (l < at || l > at + 4) return [0, 0];
  const k = l - at;
  return [Math.sin(k * 91.7 + at * 13.1) * amp * (1 - k / 5), Math.cos(k * 77.3 + at * 7.7) * amp * (1 - k / 5)];
};
const glitchOn = (l: number, at: number): boolean => l >= at && l < at + 2;
const whiteFlash = (l: number, at: number, op = 0.5): number =>
  l >= at && l < at + 4 ? op * (1 - (l - at) / 4) : 0;

/* ============================ 幕1 · 它能编得特别自信（V2 冲击版） ============================ */
const LIES: [number, number, string, number, number][] = [
  [205, 570, '《独角兽饲养指南》', 10, -1],
  [875, 620, '作者：李四海', 26, 1],
  [540, 452, 'ISBN 7-8888-6666-4', 42, 0],
];

const BGX = '#0D1B2A';
const INKX = '#EEF3F6';
const GOLDX = '#F2A93B';
const REDX = '#FF3B30';
const GREYX = '#8FA3B3';
const DEEPX = '#16293D';

/* 山 + 月 + 坟（第1、2幕共用） */
const Wild: React.FC<{ l: number }> = ({ l }) => (
  <g>
    <circle cx={820} cy={300} r={86} fill="#DCE6F2" opacity={0.9} />
    <circle cx={820} cy={300} r={110} fill="#DCE6F2" opacity={0.08} />
    <path d={'M -40 1420 L 220 1050 L 470 1420 Z'} fill="#122238" />
    <path d={'M 380 1420 L 660 980 L 960 1420 Z'} fill="#0F1D30" />
    <path d={'M 760 1420 L 1010 1120 L 1160 1420 Z'} fill="#122238" />
    {/* 坟 */}
    <ellipse cx={540} cy={1500} rx={190} ry={60} fill="#1B3048" />
    <path d={'M 400 1500 q 140 -170 280 0 Z'} fill="#20364E" stroke="#2C4866" strokeWidth={4} />
    <rect x={500} y={1360} width={80} height={110} rx={8} fill="#2C4866" />
    <text x={540} y={1432} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={GREYX}>之墓</text>
  </g>
);

/* 村姑剪影 */
const VillageGirl: React.FC<{ l: number; op: number; x?: number; y?: number; s?: number }> = ({ l, op, x = 540, y = 1180, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <circle cx={0} cy={-210} r={62} fill="#E8DCC8" />
    <path d={'M -46 -252 q 46 -34 92 0 q -16 -30 -46 -30 q -30 0 -46 30 Z'} fill="#3A2A1A" />
    <path d={'M -86 -140 L 86 -140 L 122 140 L -122 140 Z'} fill="#C9A85E" />
    <path d={'M -86 -140 L -20 -140 L -46 140 L -122 140 Z'} fill="#B8974E" />
    <circle cx={0} cy={-206} r={4} fill="#3A2A1A" />
    <circle cx={16} cy={-206} r={4} fill="#3A2A1A" />
    <path d={'M -14 -186 q 14 10 28 0'} fill="none" stroke="#3A2A1A" strokeWidth={4} strokeLinecap="round" />
    {/* 饭篮 */}
    <g transform={'translate(138 40)'}>
      <path d={'M -58 40 q 58 60 116 0 Z'} fill="#B8974E" stroke="#8A6A2A" strokeWidth={4} />
      <path d={'M -58 40 q 58 -70 116 0'} fill="none" stroke="#8A6A2A" strokeWidth={6} />
      <path d={'M -30 34 q 30 -26 60 0'} fill="none" stroke="#E8DCC8" strokeWidth={4} opacity={0.85} />
    </g>
  </g>
);

/* 白骨 */
const Bones: React.FC<{ l: number; op: number; x?: number; y?: number; s?: number }> = ({ l, op, x = 540, y = 1290, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <ellipse cx={0} cy={0} rx={210} ry={54} fill="#0A1420" opacity={0.7} />
    <circle cx={0} cy={-96} r={62} fill="#F2F5FA" stroke="#C9D8EA" strokeWidth={4} />
    <circle cx={-24} cy={-108} r={14} fill="#16293D" />
    <circle cx={24} cy={-108} r={14} fill="#16293D" />
    <rect x={-24} y={-74} width={48} height={16} rx={4} fill="#16293D" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-22 + i * 12} y={-74} width={7} height={16} fill="#F2F5FA" />)}
    <rect x={-10} y={-34} width={20} height={120} rx={8} fill="#F2F5FA" />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M -70 ${i * 30} q 70 ${-24} 140 0`} fill="none" stroke="#F2F5FA" strokeWidth={9} strokeLinecap="round" />
    ))}
    <path d={'M -34 86 L -64 150'} stroke="#F2F5FA" strokeWidth={10} strokeLinecap="round" />
    <path d={'M 34 86 L 64 150'} stroke="#F2F5FA" strokeWidth={10} strokeLinecap="round" />
  </g>
);

/* 悟空（金猴：金头+金箍+红披风） */
const Wukong: React.FC<{ f: number; l: number; x: number; y: number; s: number; op: number; hold?: number }> = ({ f, l, x, y, s, op, hold = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <circle cx={0} cy={-120} r={56} fill="#E8B44A" stroke="#8A6416" strokeWidth={5} />
    <path d={'M -58 -128 q 58 -34 116 0'} fill="none" stroke={GOLDX} strokeWidth={10} strokeLinecap="round" />
    <circle cx={-22} cy={-130} r={5} fill="#16293D" />
    <circle cx={22} cy={-130} r={5} fill="#16293D" />
    <path d={'M -18 -100 q 18 14 36 0'} fill="none" stroke="#8A6416" strokeWidth={5} strokeLinecap="round" />
    <path d={'M -52 -64 L 52 -64 L 76 96 L -76 96 Z'} fill="#B23A2E" />
    <path d={'M -52 -64 L 0 -64 L -34 96 L -76 96 Z'} fill="#8F2A20" />
    {hold > 0 ? (
      <g transform={`translate(${90 + hold * 70} ${-40 - hold * 120}) rotate(${-20 + hold * 40})`}>
        <rect x={-150} y={-10} width={300} height={20} rx={10} fill={GOLDX} stroke="#8A6416" strokeWidth={4} />
        <rect x={-170} y={-16} width={30} height={32} rx={8} fill="#8A6416" />
        <rect x={140} y={-16} width={30} height={32} rx={8} fill="#8A6416" />
      </g>
    ) : null}
  </g>
);

/* ============ 镜1 · 起：一根烟柱（0-4.5s） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const rise = eio(clamp01(l / 50));
  const puffs = [0, 1, 2, 3, 4];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGX} />
        <radialGradient id="nightx" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#1B3048" /><stop offset="100%" stopColor={BGX} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#nightx)'} />
        <Wild l={l} />
        {/* 烟柱：底部粗、往上细、越升越散 */}
        {puffs.map((i) => {
          const p = clamp01((l - 8 - i * 8) / 60);
          const yy = 1430 - p * (500 + i * 60);
          const rr = 26 + p * (60 + i * 22);
          return <circle key={i} cx={540 + Math.sin((f + i * 40) / 26) * (10 + i * 8)} cy={yy} r={rr}
            fill="#C9D8EA" opacity={0.16 + 0.1 * Math.sin(f / 18 + i)} />;
        })}
        <circle cx={540} cy={1420} r={40 + rise * 24} fill="#C9D8EA" opacity={0.22} />
        <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={INKX}
          opacity={ez(l - 12, 12)}>荒山野岭，一座孤坟</text>
      </svg>
    </div>
  );
};

/* ============ 镜2 · 凝：烟塌成人形（4.5-9s） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const suck = eio(clamp01((l - 8) / 44));
  const form = ez(l - 46, 14);
  const smokeR = 300 * (1 - suck * 0.82);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGX} />
        <Wild l={l} />
        <VillageGirl l={l} op={form} />
        {/* 烟往中心塌 */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2 + f * 0.04;
          return <circle key={i} cx={540 + Math.cos(a) * smokeR} cy={1130 + Math.sin(a) * smokeR * 0.8}
            r={60 * (1 - suck * 0.4)} fill="#C9D8EA" opacity={0.26 * (1 - suck * 0.6)} />;
        })}
        <circle cx={540} cy={1130} r={220 * (1 - suck) + 40} fill="#C9D8EA" opacity={0.14 * (1 - suck)} />
        {/* 凝成时金光一闪 */}
        {l >= 46 && l < 60 ? (
          <circle cx={540} cy={1100} r={70 + (l - 46) * 26} fill="none" stroke={GOLDX} strokeWidth={9 - (l - 46) * 0.3} opacity={1 - (l - 46) / 14} />
        ) : null}
        <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={INKX}
          opacity={ez(l - 8, 12)}>一缕白烟，凝成人形</text>
      </svg>
    </div>
  );
};

/* ============ 镜3 · 信：金星飞过去（9-13.5s） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const walk = clamp01(l / 40);
  const tx = -160 + walk * 420;
  const starP = clamp01((l - 26) / 22);
  const se = eio(starP);
  const sx = 300 + se * 260;
  const sy = 1130 - Math.sin(se * Math.PI) * 120;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGX} />
        <Wild l={l} />
        <VillageGirl l={l} op={1} />
        {/* 饭篮热气 */}
        {[0, 1, 2].map((i) => {
          const p = ((f / 30 + i * 0.33) % 1);
          return <circle key={i} cx={678 + i * 8} cy={1180 - p * 90} r={18 + p * 16} fill="#E8DCC8" opacity={(1 - p) * 0.35} />;
        })}
        <g transform={`translate(${tx} 1340)`}>
          <LaoJia x={0} y={0} s={1.05} mode={'present'} f={f} wag={l > 30} />
        </g>
        {/* 眼里的金星 → 飞到村姑身上 */}
        {l >= 26 ? (
          <g>
            <circle cx={sx} cy={sy} r={16} fill={GOLDX} />
            <path d={`M ${sx} ${sy - 30} L ${sx + 8} ${sy - 8} L ${sx + 30} ${sy - 8} L ${sx + 12} ${sy + 6} L ${sx + 20} ${sy + 28} L ${sx} ${sy + 14} L ${sx - 20} ${sy + 28} L ${sx - 12} ${sy + 6} L ${sx - 30} ${sy - 8} L ${sx - 8} ${sy - 8} Z`} fill={GOLDX} opacity={0.9} />
          </g>
        ) : null}
        <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={INKX}
          opacity={ez(l - 6, 10)}>唐僧：善哉，正饿着呢</text>
        <text x={540} y={1700} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={GOLDX}
          opacity={ez(l - 56, 12)}>他信了</text>
      </svg>
    </div>
  );
};

/* ============ 镜4 · 睁：一只眼睛占满屏（13.5-18s） ============ */
const Scene4: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const zoom = 1 + 0.5 * eio(clamp01(l / 40));
  const open = ez(l - 14, 12);
  const flash = l >= 30 && l < 40 ? (1 - (l - 30) / 10) * 0.85 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill="#1A0E06" />
        <radialGradient id="eyeg" cx="50%" cy="44%" r="52%">
          <stop offset="0%" stopColor="#6A3A08" /><stop offset="100%" stopColor="#1A0E06" />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#eyeg)'} />
        <g transform={`translate(540 980) scale(${zoom})`}>
          {/* 眼皮张开 */}
          <path d={`M -420 ${-40 * (1 - open)} Q 0 ${-300 * (1 - open) - 40} 420 ${-40 * (1 - open)} Q 0 ${300 * (1 - open) + 40} -420 ${-40 * (1 - open)} Z`}
            fill="none" stroke={GOLDX} strokeWidth={12} />
          <path d={`M -420 ${-40 * open} Q 0 ${-280 * open} 420 ${-40 * open} Q 0 ${280 * open} -420 ${-40 * open} Z`}
            fill="#F2F5FA" opacity={open * 0.14} />
          {/* 眼珠 */}
          <circle cx={0} cy={0} r={190 * open} fill={GOLDX} />
          <circle cx={0} cy={0} r={110 * open} fill="#1A0E06" />
          <circle cx={-70 * open} cy={-60 * open} r={34 * open} fill="#FFF3C4" opacity={0.9} />
          {/* 火焰纹 */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2 + f * 0.06;
            return <path key={i} d={`M ${Math.cos(a) * 210 * open} ${Math.sin(a) * 210 * open} l ${Math.cos(a) * 40 * open} ${Math.sin(a) * 40 * open}`}
              stroke={GOLDX} strokeWidth={9} strokeLinecap="round" opacity={0.7 * open} />;
          })}
        </g>
        <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={INKX}
          opacity={ez(l - 6, 10)}>悟空睁开火眼金睛</text>
        {flash > 0 ? <rect width={1080} height={1920} fill={GOLDX} opacity={flash} /> : null}
      </svg>
    </div>
  );
};

/* ============ 镜5 · 打：一棒落下，世界重构（18-23s） ============ */
const Scene5: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const fall = clamp01(l / 14);
  const hit = l >= 14;
  const [shx, shy] = shake(l, 14, 18);
  const smoke = clamp01((l - 14) / 26);
  const boneP = ez(l - 34, 14);
  const leafP = ez(l - 40, 14);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGX} />
        <Wild l={l} />
        {/* 村姑：被打前 → 散成烟 */}
        <VillageGirl l={l} op={hit ? Math.max(0, 1 - smoke * 2.4) : 1} />
        {hit ? (
          <g>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const a = (i / 7) * Math.PI * 2;
              return <circle key={i} cx={540 + Math.cos(a) * smoke * 340} cy={1030 + Math.sin(a) * smoke * 300}
                r={50 + smoke * 40} fill="#C9D8EA" opacity={0.5 * (1 - smoke)} />;
            })}
          </g>
        ) : null}
        {/* 白骨：烟散后露出来 */}
        {boneP > 0 ? <Bones l={l} op={boneP} /> : null}
        {/* 饭篮 → 树叶 */}
        {leafP > 0 ? (
          <g opacity={leafP} transform={'translate(690 1400)'}>
            {[[-30, 0, -20], [10, 10, 15], [40, -6, -8]].map(([x, y, r], i) => (
              <path key={i} d={'M -34 0 q 34 -26 68 0 q -34 26 -68 0 Z'} fill="#8A9A4A" transform={`translate(${x} ${y}) rotate(${r})`} />
            ))}
          </g>
        ) : null}
        {/* 金箍棒 */}
        <g transform={`translate(880 ${-700 + fall * 1500}) rotate(28)`}>
          <rect x={-24} y={-260} width={48} height={520} rx={24} fill={GOLDX} stroke="#8A6416" strokeWidth={5} />
          <rect x={-32} y={-280} width={64} height={44} rx={12} fill="#8A6416" />
          <rect x={-32} y={236} width={64} height={44} rx={12} fill="#8A6416" />
        </g>
        <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={INKX}
          opacity={ez(l - 2, 8)}>一棒下去</text>
        <text x={540} y={1730} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={900} fill={REDX}
          opacity={ez(l - 44, 14)}>全是假的</text>
        {l >= 14 && l < 22 ? <rect width={1080} height={1920} fill="#FFFFFF" opacity={(1 - (l - 14) / 8) * 0.55} /> : null}
      </svg>
    </div>
  );
};

/* ============ 镜6 · 念：金箍勒紧（23-28s） ============ */
const Scene6: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const tight = 1 - 0.22 * eio(clamp01(l / 40));
  const [shx, shy] = shake(l, 20, 6);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGX} />
        <Wild l={l} />
        {/* 悟空抱头 */}
        <g transform={`translate(700 ${1290 + Math.sin(l * 0.5) * 6})`}>
          <Wukong f={f} l={l} x={0} y={0} s={1} op={1} hold={0} />
          <path d={'M -70 -150 q 20 -40 50 -10'} fill="none" stroke={GOLDX} strokeWidth={10} strokeLinecap="round" />
        </g>
        {/* 金箍收紧 */}
        <g transform={`translate(700 1180) scale(${tight})`}>
          <circle cx={0} cy={0} r={62} fill="none" stroke={GOLDX} strokeWidth={12} />
          <circle cx={0} cy={0} r={62} fill="none" stroke="#FFF3C4" strokeWidth={4} opacity={0.6 + 0.4 * Math.sin(f / 4)} />
        </g>
        {/* 唐僧盘腿念咒 */}
        <g transform={'translate(300 1330)'}>
          <LaoJia x={0} y={0} s={0.95} mode={'talk'} f={f} wag={true} />
        </g>
        {/* 咒字往上飘 */}
        {['唵', '嘛', '呢', '叭', '咪'].map((s, i) => {
          const p = clamp01((l - 6 - i * 6) / 44);
          return <text key={i} x={300 + Math.sin(i * 2 + f / 20) * 60} y={1200 - p * 380} textAnchor="middle"
            fontFamily={FONT} fontSize={40} fontWeight={900} fill={GOLDX} opacity={(1 - p) * 0.85}>{s}</text>;
        })}
        <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={60} fontWeight={900} fill={INKX}
          opacity={ez(l - 6, 10)}>唐僧反倒念起紧箍咒</text>
        <text x={540} y={1710} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GREYX}
          opacity={ez(l - 52, 14)}>错怪了说真话的</text>
      </svg>
    </div>
  );
};

const SUBSX: [number, number, string][] = [
  [0, 4.5, '荒山野岭，一座孤坟'],
  [4.5, 9.0, '一缕白烟，凝成人形'],
  [9.0, 13.5, '唐僧信了：善哉，有人送饭'],
  [13.5, 18.0, '悟空睁开火眼金睛'],
  [18.0, 23.0, '一棒下去，全是假的'],
  [23.0, 28.0, '唐僧反倒念起紧箍咒'],
];

const SubX: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBSX.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const step = Math.min(0.1, ((seg[1] - seg[0]) / Math.max(1, chars.length)) * 0.82);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / step) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1590, textAlign: 'center', padding: '0 50px' }}>
      {chars.map((ch, i) => (
        <span key={i} style={{
          fontFamily: FONT, fontSize: 44, fontWeight: 900, display: 'inline-block',
          color: i === n - 1 ? GOLDX : (i < n ? INKX : '#3A4A5E'),
          transform: i === n - 1 ? 'scale(1.12)' : 'scale(1)',
        }}>{ch}</span>
      ))}
    </div>
  );
};

const SEX: [number, string, number][] = [
  [2, 'sfx/whoosh.wav', 0.55],
  [140, 'sfx/ding.mp3', 0.8],
  [396, 'sfx/ding.mp3', 0.6],
  [420, 'sfx/boom.wav', 0.9],
  [546, 'sfx/boom.wav', 0.85],
  [560, 'sfx/hit_1750.wav', 0.95],
  [700, 'sfx/da.mp3', 0.8],
  [742, 'sfx/ding.mp3', 0.7],
];

const BOUNDSX: [number, number][] = [[0, 135], [135, 270], [270, 405], [405, 540], [540, 690], [690, 840]];

export const EP07X: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < BOUNDSX.length; i++) {
    if (frame < BOUNDSX[i][1]) { seg = i; break; }
    seg = i;
  }
  const [b0] = BOUNDSX[seg];
  const l = frame - b0;
  const SC = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];
  const Scene = SC[seg];
  const cutFlash = frame - b0 < 3 ? (1 - (frame - b0) / 3) * 0.16 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BGX }}>
      <Scene f={frame} l={l} />
      {SEX.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={1} />
      <SubX t={t} />
      {cutFlash > 0 ? <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', opacity: cutFlash, pointerEvents: 'none' }} /> : null}
    </AbsoluteFill>
  );
};
