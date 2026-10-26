
/* =============================================================
 * EP07T 整体效果测试 · 9秒4镜
 * ①黑场金光劈开+字从嘴里喷 ②老贾大脸特写 ③整屏变火星→碎屏 ④书页金光
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

const BG7 = '#0E0C0A';
const INK7 = '#F5EFE2';
const GOLD7 = '#E8B44A';
const RED7 = '#D93327';
const GREY7 = '#6B6257';
const MARS = '#B23A1E';

const Mascot2: React.FC<{ x: number; y: number; s: number; mood: string; f: number; op?: number }> =
  ({ x, y, s, mood, f, op = 1 }) => (
    <g transform={`translate(${x} ${y})`} opacity={op}>
      <circle cx={0} cy={-4 * s} r={132 * s} fill={'#F5EFE2'} opacity={0.95} />
      <circle cx={0} cy={-4 * s} r={132 * s} fill={'none'} stroke={'#6B6257'} strokeWidth={3} opacity={0.5} />
      <XiaoMo x={0} y={0} s={s} mood={mood} f={f} />
    </g>
  );

/* ============ 镜1 · 黑场金光劈开 + 字从嘴里喷（0-2.4s） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const split = eio(clamp01(l / 14));
  const beamW = 30 * (1 - clamp01((l - 14) / 16));
  const words: [string, number, number, number][] = [['我', 26, -180, -120], ['什', 34, 170, -140], ['么', 42, -200, 60], ['都', 50, 190, 90], ['知', 58, -120, 210], ['道', 66, 150, 230]];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* 两半黑幕向两侧滑开 */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 540, height: 1920, background: '#000', transform: `translateX(${-split * 560}px)` }} />
      <div style={{ position: 'absolute', left: 540, top: 0, width: 540, height: 1920, background: '#000', transform: `translateX(${split * 560}px)` }} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <radialGradient id="s1glow" cx="50%" cy="46%" r="55%">
          <stop offset="0%" stopColor="#3A1A0A" />
          <stop offset="100%" stopColor={BG7} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#s1glow)'} opacity={split} />
        {beamW > 0 ? (
          <rect x={540 - beamW / 2} y={0} width={beamW} height={1920} fill={GOLD7} opacity={0.9} />
        ) : null}
        <g transform={`translate(540 960) scale(${0.9 + 0.2 * ez(l - 10, 10)})`} opacity={ez(l - 10, 8)}>
          <Mascot2 x={0} y={0} s={1.5} mood={'cool'} f={f} />
        </g>
        {words.map(([w, d, dx, dy], i) => {
          const p = clamp01((l - d) / 10);
          const e = 1 - Math.pow(1 - p, 3);
          if (p <= 0) return null;
          return (
            <text key={i} x={540 + dx * e} y={960 + dy * e} textAnchor="middle" fontFamily={FONT}
              fontSize={104} fontWeight={900} fill={i % 2 ? GOLD7 : INK7}
              opacity={Math.min(1, p * 2.2)} transform={`translate(0 ${(1 - e) * 40})`}>{w}</text>
          );
        })}
        {l >= 78 ? (
          <rect x={0} y={1290} width={1080} height={140} fill={RED7} opacity={ez(l - 78, 8)} />
        ) : null}
        <text x={540} y={1380} textAnchor="middle" fontFamily={FONT} fontSize={86} fontWeight={900} fill={INK7}
          opacity={ez(l - 78, 8)}>我什么都知道</text>
      </svg>
    </div>
  );
};

/* ============ 镜2 · 老贾大脸特写（2.4-4.6s） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const push = 1 + 0.22 * eio(clamp01(l / 44));
  const [shx, shy] = shake(l, 26, 10);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={'#1A1208'} />
        <radialGradient id="s2glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#4A2A08" />
          <stop offset="100%" stopColor="#1A1208" />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#s2glow)'} />
      </svg>
      {/* 老贾大脸：整体放大 5 倍，只露头和肩 */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920 }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <g transform={`translate(540 1150) scale(${5 * push}) translate(0 -60)`} opacity={ez(l - 4, 8)}>
            <LaoJia x={0} y={0} s={1} mode={'point'} f={f} wag={true} />
          </g>
        </svg>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center',
        fontFamily: FONT, fontSize: 96, fontWeight: 900, color: INK7, opacity: ez(l - 12, 8),
        textShadow: '0 8px 40px rgba(0,0,0,0.9)',
      }}>那我问你</div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1380, textAlign: 'center',
        fontFamily: FONT, fontSize: 84, fontWeight: 900, color: GOLD7,
        opacity: ez(l - 30, 8), transform: `scale(${0.85 + 0.15 * ez(l - 30, 8)})`,
      }}>孙悟空住哪儿？！</div>
    </div>
  );
};

/* ============ 镜3 · 整屏变火星 + 碎屏转场（4.6-7.2s） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const red = eio(clamp01(l / 8));
  const crack = clamp01((l - 30) / 20);
  const [shx, shy] = shake(l, 30, 16);
  const shards: [number, number, number, number][] = [[-1, -1, 0.2, 0.0], [1, -1, 0.35, 0.1], [-1, 1, 0.5, 0.15], [1, 1, 0.65, 0.05], [0, -1, 0.8, 0.2]];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={MARS} opacity={red} />
        <radialGradient id="marsg" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#D9691F" />
          <stop offset="70%" stopColor={MARS} />
          <stop offset="100%" stopColor="#5E1A0C" />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#marsg)'} opacity={red} />
        {/* 环形山 */}
        {[[280, 420, 90], [820, 300, 60], [700, 1250, 120], [220, 1500, 70], [900, 1650, 50]].map(([x, y, r], i) => (
          <g key={i} opacity={red * 0.85}>
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.45} fill="#7E2A12" />
            <ellipse cx={x} cy={y - r * 0.12} rx={r * 0.82} ry={r * 0.34} fill="#952F14" />
          </g>
        ))}
        {/* 火箭插在火星上 */}
        <g transform={`translate(700 980) rotate(-14)`} opacity={red}>
          <path d={'M 0 -170 L 46 -40 L 46 60 L -46 60 L -46 -40 Z'} fill="#E8E2D2" />
          <path d={'M 0 -170 L 46 -40 L 0 -70 L -46 -40 Z'} fill={RED7} />
          <path d={'M -46 20 L -96 90 L -46 60 Z'} fill="#C9A85E" />
          <path d={'M 46 20 L 96 90 L 46 60 Z'} fill="#C9A85E" />
          <circle cx={0} cy={-30} r={20} fill="#3A6EA5" stroke="#E8E2D2" strokeWidth={5} />
          <path d={'M -26 62 L -14 130 L 0 92 L 14 130 L 26 62 Z'} fill="#FFB84D" opacity={0.95} />
          <path d={'M -12 62 L 0 112 L 12 62 Z'} fill="#FFF3C4" />
        </g>
        <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={INK7}
          opacity={ez(l - 10, 8)}>它说：孙悟空住火星</text>
        {/* 碎屏裂纹 */}
        {crack > 0 ? (
          <g opacity={crack}>
            {[
              'M 540 900 L 380 700 L 300 720', 'M 540 900 L 720 690 L 800 730',
              'M 540 900 L 360 1120 L 280 1160', 'M 540 900 L 740 1140 L 820 1100',
              'M 540 900 L 540 640', 'M 540 900 L 500 1220',
            ].map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#0A0908" strokeWidth={7} opacity={0.85}
                strokeDasharray="900" strokeDashoffset={900 * (1 - clamp01((crack - i * 0.08) / 0.6))} />
            ))}
            <circle cx={540} cy={900} r={140 * crack} fill="none" stroke="#0A0908" strokeWidth={8} opacity={0.7} />
          </g>
        ) : null}
        {crack > 0 ? shards.map(([dx, dy, d, rot], i) => {
          const p = clamp01((crack - d) / (1 - d));
          if (p <= 0) return null;
          return (
            <g key={i} transform={`translate(${540 + dx * p * 700} ${900 + dy * p * 700}) rotate(${rot * 360 * p})`}
              opacity={1 - p * 0.5}>
              <path d={'M -90 -70 L 80 -90 L 100 60 L -70 90 Z'} fill={MARS} stroke="#0A0908" strokeWidth={5} />
            </g>
          );
        }) : null}
      </svg>
    </div>
  );
};

/* ============ 镜4 · 碎屏后面：书页金光（7.2-9s） ============ */
const Scene4: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const open = eio(clamp01(l / 18));
  const glow = ez(l - 18, 14);
  const slam = ez(l - 34, 10);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={'#0A0908'} />
        <radialGradient id="bookglow" cx="50%" cy="46%" r="46%">
          <stop offset="0%" stopColor="#FFE9A8" stopOpacity={0.9} />
          <stop offset="55%" stopColor="#8A6A2A" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#0A0908" stopOpacity={0} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#bookglow)'} opacity={glow} />
        {/* 打开的书 */}
        <g transform={`translate(540 940) scale(${1.5 - 0.5 * open})`} opacity={ez(l - 4, 10)}>
          <path d="M -380 10 L -380 300 L 0 340 L 0 40 Z" fill="#F2E7CE" />
          <path d="M 380 10 L 380 300 L 0 340 L 0 40 Z" fill="#F7F0DC" />
          <path d="M -398 18 L -398 316 L -380 300 L -380 10 Z" fill="#8A6A2A" />
          <path d="M 398 18 L 398 316 L 380 300 L 380 10 Z" fill="#8A6A2A" />
          <text x={-200} y={230} textAnchor="middle" fontFamily={FONT} fontSize={92} fontWeight={900} fill="#2A1F12" opacity={glow}>花果山</text>
          <text x={200} y={230} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill="#6B4A12" opacity={glow}>水帘洞</text>
        </g>
        {l >= 34 ? (
          <g opacity={slam}>
            <text x={540} y={1450} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={INK7}
              transform={`translate(540 1450) scale(${1.5 - 0.5 * slam}) translate(-540 -1450)`}>书上是这么写的</text>
            <rect x={150} y={1520} width={780} height={10} fill={GOLD7} opacity={0.8} />
          </g>
        ) : null}
      </svg>
    </div>
  );
};

const SUBS7: [number, number, string][] = [
  [0, 2.4, '我什么都知道'],
  [2.4, 4.6, '那我问你：孙悟空住哪儿'],
  [4.6, 7.2, '它秒答：火星'],
  [7.2, 9.0, '书上是这么写的'],
];

const Sub7: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBS7.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const step = Math.min(0.1, ((seg[1] - seg[0]) / Math.max(1, chars.length)) * 0.8);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / step) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center', padding: '0 60px' }}>
      {chars.map((ch, i) => (
        <span key={i} style={{
          fontFamily: FONT, fontSize: 44, fontWeight: 900, display: 'inline-block',
          color: i === n - 1 ? GOLD7 : (i < n ? INK7 : '#4A433C'),
          transform: i === n - 1 ? 'scale(1.12)' : 'scale(1)',
        }}>{ch}</span>
      ))}
    </div>
  );
};

const SE7: [number, string, number][] = [
  [2, 'sfx/boom.wav', 0.9],
  [26, 'sfx/da.mp3', 0.6],
  [34, 'sfx/da.mp3', 0.6],
  [42, 'sfx/da.mp3', 0.6],
  [50, 'sfx/da.mp3', 0.6],
  [58, 'sfx/da.mp3', 0.6],
  [66, 'sfx/da.mp3', 0.6],
  [72, 'sfx/hit_1750.wav', 0.9],
  [136, 'sfx/whoosh.wav', 0.8],
  [168, 'sfx/ding.mp3', 0.7],
  [216, 'sfx/boom.wav', 0.95],
  [244, 'sfx/whoosh.wav', 0.7],
];

const BOUNDS7: [number, number][] = [[0, 72], [72, 138], [138, 216], [216, 270]];

export const EP07T: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < BOUNDS7.length; i++) {
    if (frame < BOUNDS7[i][1]) { seg = i; break; }
    seg = i;
  }
  const [b0] = BOUNDS7[seg];
  const l = frame - b0;
  const SC = [Scene1, Scene2, Scene3, Scene4];
  const Scene = SC[seg];
  return (
    <AbsoluteFill style={{ backgroundColor: BG7 }}>
      <Scene f={frame} l={l} />
      {SE7.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.4} />
      <Sub7 t={t} />
    </AbsoluteFill>
  );
};
