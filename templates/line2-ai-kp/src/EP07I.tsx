
/* EP07I 快切版：20 镜 × 1.33s，图整张滑入滑出，图和字同时切 */

import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, staticFile, Audio, Sequence } from 'remotion';

const BGX = '#F6F1E6';
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

const BG = '#F6F1E6';
const INK = '#201C17';
const GOLD_D = '#B8801F';
const RED_D = '#D93327';
const GREY_D = '#8A8175';
const CARD_D = '#FFFDF7';
const LINE2_D = '#D9D0BE';
const GREEN_D = '#2E7D4F';

const Mascot: React.FC<{ x: number; y: number; s: number; mood: string; f: number; op?: number }> =
  ({ x, y, s, mood, f, op = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <circle cx={0} cy={-4} r={130} fill={'#FFFFFF'} opacity={0.95} />
      <circle cx={0} cy={-4} r={130} fill={'none'} stroke={LINE2_D} strokeWidth={4} />
      <XiaoMo x={0} y={0} s={1} mood={mood} f={f} />
    </g>
  );

type Shot = {
  kind: 'big' | 'ask' | 'ans' | 'book' | 'bars' | 'mascot' | 'laojia' | 'quote' | 'next';
  text: string;
  sub?: string;
  color?: string;
  hi?: number;
  vals?: [string, number][];
};

const SHOTS: Shot[] = [
  { kind: 'big', text: 'AI 说的用药量', color: 'INK' },
  { kind: 'big', text: '你敢信吗？', color: 'RED_D' },
  { kind: 'mascot', text: '问我，我啥都知道', sub: '小模' },
  { kind: 'ask', text: '这药一天吃几次？' },
  { kind: 'ans', text: '一天三次', sub: '每次两片' },
  { kind: 'laojia', text: '说得跟真的一样', sub: '老贾信了' },
  { kind: 'book', text: '说明书上写的是', sub: '一天一次 · 每次一片' },
  { kind: 'big', text: '差了六倍', color: 'RED_D' },
  { kind: 'big', text: '它为什么敢这么答？', color: 'INK' },
  { kind: 'quote', text: '它不是在查', sub: '它是在抽签' },
  { kind: 'bars', text: '它给每个答案打分', vals: [['一天三次', 92], ['一天两次', 5], ['一天一次', 2], ['不知道', 0.3]], hi: 0 },
  { kind: 'bars', text: '最高的那根，它抽中了', vals: [['一天三次', 92], ['一天两次', 5], ['一天一次', 2], ['不知道', 0.3]], hi: 0 },
  { kind: 'bars', text: '「不知道」只有 0.3%', vals: [['一天三次', 92], ['一天两次', 5], ['一天一次', 2], ['不知道', 0.3]], hi: 3 },
  { kind: 'big', text: '它从来不选', color: 'RED_D' },
  { kind: 'quote', text: '它不是撒谎', sub: '它不知道自己在编' },
  { kind: 'big', text: '药量这种事', color: 'INK' },
  { kind: 'big', text: '只能信说明书', color: 'GREEN_D' },
  { kind: 'next', text: '下一集', sub: 'AI 会不会抢走你的工作？' },
];

const SHOT_FRAMES = 40;
const TRANS = 4;

/* 单个镜头内容 */
const ShotView: React.FC<{ s: Shot; l: number; f: number }> = ({ s, l, f }) => {
  const c = (k?: string) => (k === 'RED_D' ? RED_D : k === 'GREEN_D' ? GREEN_D : k === 'GOLD_D' ? GOLD_D : INK);
  const appear = clamp01((l + 6) / 6);
  const ae = 1 - Math.pow(1 - appear, 2);
  if (s.kind === 'big') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontFamily: FONT, fontSize: s.text.length > 8 ? 88 : 120, fontWeight: 900, color: c(s.color),
          textAlign: 'center', transform: `scale(${0.82 + 0.18 * ae})`, opacity: appear, letterSpacing: '-.02em',
        }}>{s.text}</div>
      </div>
    );
  }
  if (s.kind === 'ask') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', left: 120, top: 780, width: 840, padding: '46px 40px',
          background: CARD_D, border: '3px solid ' + LINE2_D, borderRadius: 28, fontFamily: FONT, fontSize: 62,
          fontWeight: 900, color: INK, textAlign: 'center', opacity: appear, transform: `translateY(${(1 - ae) * 40}px)` }}>
          {s.text}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center',
          fontFamily: FONT, fontSize: 40, fontWeight: 800, color: GREY_D, opacity: appear }}>你问它</div>
      </div>
    );
  }
  if (s.kind === 'ans') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', left: 130, right: 130, top: 720, padding: '54px 40px',
          background: GOLD_D, borderRadius: 34, textAlign: 'center', opacity: appear,
          transform: `scale(${0.86 + 0.14 * ae})` }}>
          <div style={{ fontFamily: FONT, fontSize: 86, fontWeight: 900, color: '#FFFFFF' }}>{s.text}</div>
          <div style={{ fontFamily: FONT, fontSize: 86, fontWeight: 900, color: '#FFFFFF', marginTop: 10 }}>{s.sub}</div>
        </div>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <Mascot x={200} y={1360} s={1.0} mood={'happy'} f={f} op={appear} />
        </svg>
      </div>
    );
  }
  if (s.kind === 'book') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center',
          fontFamily: FONT, fontSize: 48, fontWeight: 900, color: GREY_D, opacity: appear }}>{s.text}</div>
        <div style={{ position: 'absolute', left: 110, right: 110, top: 700, padding: '60px 40px',
          background: CARD_D, border: '4px solid ' + LINE2_D, borderRadius: 16, textAlign: 'center', opacity: appear,
          transform: `translateY(${(1 - ae) * 50}px)`, boxShadow: '0 24px 60px rgba(0,0,0,0.10)' }}>
          <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 800, color: GREY_D, marginBottom: 18 }}>用法用量</div>
          <div style={{ fontFamily: FONT, fontSize: 92, fontWeight: 900, color: GREEN_D }}>{s.sub}</div>
        </div>
      </div>
    );
  }
  if (s.kind === 'bars') {
    const vals = s.vals || [];
    const baseY = 1500;
    const maxH = 560;
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center',
          fontFamily: FONT, fontSize: 46, fontWeight: 900, color: INK, opacity: appear }}>{s.text}</div>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <line x1={80} y1={baseY} x2={1000} y2={baseY} stroke={INK} strokeWidth={4} opacity={0.3} />
          {vals.map(([label, v], i) => {
            const grow = clamp01((l - 4 - i * 5) / 16);
            const e = 1 - Math.pow(1 - grow, 3);
            const h = maxH * (v / 100) * e;
            const x = 100 + i * 230;
            const y = baseY - h;
            const on = i === (s.hi ?? 0);
            return (
              <g key={i}>
                <rect x={x} y={y} width={180} height={Math.max(h, 2)} rx={6}
                  fill={on ? GOLD_D : LINE2_D} stroke={on ? GOLD_D : '#B5AC9B'} strokeWidth={3} />
                <text x={x + 90} y={y - 16} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900}
                  fill={on ? GOLD_D : GREY_D} opacity={grow}>{v}%</text>
                <text x={x + 90} y={baseY + 44} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800}
                  fill={on ? INK : GREY_D}>{label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }
  if (s.kind === 'mascot') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <Mascot x={540} y={1080} s={1.45} mood={'cool'} f={f} op={appear} />
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1380, textAlign: 'center',
          fontFamily: FONT, fontSize: 74, fontWeight: 900, color: INK, opacity: appear }}>{s.text}</div>
      </div>
    );
  }
  if (s.kind === 'laojia') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <g transform={'translate(540 1120) scale(1.35)'}>
            <LaoJia x={0} y={0} s={1} mode={'gasp'} f={f} wag={false} />
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center',
          fontFamily: FONT, fontSize: 66, fontWeight: 900, color: INK, opacity: appear }}>{s.text}</div>
      </div>
    );
  }
  if (s.kind === 'quote') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: FONT, fontSize: 76, fontWeight: 900, color: INK, opacity: appear }}>{s.text}</div>
        <div style={{ fontFamily: FONT, fontSize: 104, fontWeight: 900, color: GOLD_D, marginTop: 24, opacity: appear,
          transform: `scale(${0.9 + 0.1 * ae})` }}>{s.sub}</div>
      </div>
    );
  }
  // next
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <radialGradient id="nxg" cx="50%" cy="44%" r="60%">
          <stop offset="0%" stopColor="#3E2606" />
          <stop offset="100%" stopColor="#1A1208" />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#nxg)'} />
        <text x={540} y={760} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={GOLD_D}>{s.text}</text>
        <text x={540} y={900} textAnchor="middle" fontFamily={FONT} fontSize={78} fontWeight={900} fill="#F5EFE2">{s.sub}</text>
        <Mascot x={540} y={1350} s={1.25} mood={'cool'} f={f} />
        <text x={540} y={1680} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={GOLD_D}>点赞关注，下集见</text>
      </svg>
    </div>
  );
};

/* 主场景：当前镜 + 滑入滑出 */
const SceneMain: React.FC<{ f: number }> = ({ f }) => {
  const idx = Math.min(SHOTS.length - 1, Math.floor(f / SHOT_FRAMES));
  const local = f - idx * SHOT_FRAMES;
  const inP = clamp01(local / TRANS);
  const outP = idx < SHOTS.length - 1 ? clamp01((local - (SHOT_FRAMES - TRANS)) / TRANS) : 0;
  const eIn = 1 - Math.pow(1 - inP, 3);
  const eOut = eio(outP);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* 背景（贯穿） */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG} />
        {SHOTS[idx].kind === 'next' ? null : (
          <>
            <radialGradient id="vgm" cx="50%" cy="44%" r="74%">
              <stop offset="55%" stopColor="#F6F1E6" stopOpacity={0} />
              <stop offset="100%" stopColor="#BDB097" stopOpacity={0.38} />
            </radialGradient>
            <rect width={1080} height={1920} fill={'url(#vgm)'} />
            {Array.from({ length: 13 }, (_, i) => (
              <line key={i} x1={i * 84} y1={0} x2={i * 84} y2={1920} stroke="#C9BFA8" strokeWidth={1} opacity={0.16} />
            ))}
          </>
        )}
      </svg>
      {/* 当前镜：从右侧滑入；退出时向左滑出 */}
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(1 - eIn) * 340 - eOut * 340}px)`, opacity: 1 - eOut * 0.25 }}>
        <ShotView s={SHOTS[idx]} l={local} f={f} />
      </div>
    </div>
  );
};

export const EP07I: React.FC = () => {
  const frame = useCurrentFrame();
  const total = SHOTS.length * SHOT_FRAMES;
  const t = frame / 30;
  const idx = Math.min(SHOTS.length - 1, Math.floor(frame / SHOT_FRAMES));
  const local = frame - idx * SHOT_FRAMES;
  const isNext = SHOTS[idx].kind === 'next';
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <SceneMain f={frame} />
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.85} />
      {/* 顶部集号角标（下移避开平台标题；深色镜不显示白色角标） */}
      {!isNext ? (
        <div style={{ position: 'absolute', left: 54, top: 380, padding: '10px 24px', border: '2px solid #D9D0BE',
          borderRadius: 26, background: 'rgba(246,241,230,0.85)', fontFamily: FONT, fontSize: 22, fontWeight: 800,
          color: GREY_D, opacity: 0.9 }}>AI 科普 · EP07</div>
      ) : null}
      {/* 淡入淡出 */}
      {frame < 6 ? <div style={{ position: 'absolute', inset: 0, background: BG, opacity: 1 - frame / 6 }} /> : null}
      {frame > total - 8 ? <div style={{ position: 'absolute', inset: 0, background: '#1A1208', opacity: (frame - (total - 8)) / 8 }} /> : null}
    </AbsoluteFill>
  );
};
