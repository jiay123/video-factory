
/* =============================================================
 * EP07P《它背后什么都没有》· 15秒样片 · 2026-10-25
 * 用 AI 生图（Qwen-Image 画的真假猴王海报）演 AI 幻觉
 * 4 镜：推进光扫 → 拉远露破墙 → 真假对比 → 撕开露空
 * ============================================================= */

import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, staticFile, Audio, Sequence, Img } from 'remotion';

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

/* 小模（聚光灯底，深底上完整可见） */
const Mascot: React.FC<{ x: number; y: number; s: number; mood: string; f: number; op?: number }> =
  ({ x, y, s, mood, f, op = 1 }) => (
    <g transform={`translate(${x} ${y})`} opacity={op}>
      <circle cx={0} cy={-4 * s} r={132 * s} fill={'#F5EFE2'} opacity={0.95} />
      <circle cx={0} cy={-4 * s} r={132 * s} fill={'none'} stroke={'#6B6257'} strokeWidth={3} opacity={0.5} />
      <XiaoMo x={0} y={0} s={s} mood={mood} f={f} />
    </g>
  );

/* ============ 镜1 · 国潮图推进 + 光扫（0-4.5s） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const inP = eio(clamp01((l - 2) / 18));
  const ty = (1 - inP) * 260;
  const sc = 0.92 + 0.08 * inP;
  const sweep = clamp01((l - 34) / 34);
  const pressP = ez(l - 8, 12);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG7} />
        <radialGradient id="redGlow" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#3A0E0A" />
          <stop offset="100%" stopColor={BG7} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#redGlow)'} />
      </svg>
      <div style={{
        position: 'absolute', left: (1080 - 1024 * sc) / 2, top: 300 + ty,
        width: 1024 * sc, height: 1024 * sc, overflow: 'hidden',
        boxShadow: '0 30px 90px rgba(0,0,0,0.75)',
      }}>
        <Img src={staticFile('ep7_wukong.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', top: 0, left: -420 + sweep * 1900, width: 300, height: '100%',
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,242,205,0.6) 50%, rgba(255,255,255,0) 100%)',
          transform: 'skewX(-16deg)', opacity: sweep > 0 ? 0.9 : 0,
        }} />
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1400, textAlign: 'center',
        fontFamily: FONT, fontSize: 76, fontWeight: 900, color: INK7,
        opacity: pressP, transform: `translateY(${(1 - pressP) * 80}px) scale(${0.9 + 0.1 * pressP})`,
        textShadow: '0 6px 30px rgba(0,0,0,0.9)',
      }}>这就是它给你的答案</div>
    </div>
  );
};

/* ============ 镜2 · 拉远：原来是张钉在破墙上的海报（4.5-8.5s） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const back = eio(clamp01((l - 6) / 34));
  const s = 1 - 0.44 * back;
  const py = 380 + 180 * back;
  const pinP = ez(l - 40, 14);
  const LAUGH = '它连自己是谁都说错了';
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill="#171412" />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M ${120 + i * 130} ${140 + i * 90} q ${30 + i * 6} ${70} ${-10 + i * 4} ${150}`}
            fill="none" stroke="#2A2521" strokeWidth={3} opacity={0.8} />
        ))}
        <rect x={0} y={1560} width={1080} height={360} fill="#100E0C" />
      </svg>
      <div style={{
        position: 'absolute', left: (1080 - 1024 * s) / 2, top: py,
        width: 1024 * s, height: 1024 * s, overflow: 'hidden',
        boxShadow: '0 24px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(232,180,74,0.25)',
        transform: `rotate(${back * -1.5}deg)`,
      }}>
        <Img src={staticFile('ep7_wukong.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${1 - back * 0.22})` }} />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{
          position: 'absolute',
          left: (1080 - 1024 * s) / 2 + (i % 2 === 0 ? 34 : 1024 * s - 44),
          top: py + (i < 2 ? 30 : 1024 * s - 34),
          width: 20, height: 20, borderRadius: 10, background: GOLD7, opacity: pinP,
          boxShadow: '0 2px 6px rgba(0,0,0,0.8)',
        }} />
      ))}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1460, textAlign: 'center',
        fontFamily: FONT, fontSize: 64, fontWeight: 900, color: INK7, opacity: ez(l - 34, 14),
      }}>拉远一看：<tspan fill={RED7}>一张海报</tspan></div>
    </div>
  );
};

/* ============ 镜3 · 真假对比：海报吹牛 vs 小模说真话（8.5-12s） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const inP = eio(clamp01(l / 14));
  const posterS = 0.46 * inP;
  const shake2 = l > 40 ? Math.sin(l * 0.9) * 3 : 0;
  const joke = ez(l - 44, 10);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill="#171412" />
        <line x1={540} y1={420} x2={540} y2={1560} stroke={GOLD7} strokeWidth={3} opacity={0.35} />
      </svg>
      {/* 左：海报（AI 编的） */}
      <div style={{
        position: 'absolute', left: 40, top: 560 + shake2, width: 480, height: 480,
        overflow: 'hidden', opacity: inP, transform: `scale(${0.9 + 0.1 * inP})`,
        boxShadow: '0 18px 50px rgba(0,0,0,0.85), 0 0 0 1px rgba(232,180,74,0.3)',
      }}>
        <Img src={staticFile('ep7_wukong.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {l > 44 ? <div style={{ position: 'absolute', inset: 0, background: RED7, opacity: 0.14 * joke }} /> : null}
      </div>
      <div style={{
        position: 'absolute', left: 40, top: 1060, width: 480, textAlign: 'center',
        fontFamily: FONT, fontSize: 34, fontWeight: 900, color: GOLD7, opacity: inP,
      }}>它编的</div>
      <div style={{
        position: 'absolute', left: 40, top: 1120, width: 480,
        fontFamily: FONT, fontSize: 30, fontWeight: 800, color: INK7, opacity: joke,
        lineHeight: 1.5,
      }}>“我是齐天大圣！<br/>我会七十二变！”</div>
      {/* 右：小模（真的） */}
      <div style={{ position: 'absolute', left: 620, top: 640, opacity: inP }}>
        <svg width={400} height={480} viewBox="0 0 400 480" style={{ overflow: 'visible' }}>
          <Mascot x={200} y={260} s={1.1} mood={'happy'} f={f} />
        </svg>
      </div>
      <div style={{
        position: 'absolute', left: 620, top: 1060, width: 400, textAlign: 'center',
        fontFamily: FONT, fontSize: 34, fontWeight: 900, color: INK7, opacity: inP,
      }}>真的</div>
      <div style={{
        position: 'absolute', left: 620, top: 1120, width: 400,
        fontFamily: FONT, fontSize: 30, fontWeight: 800, color: GREY7, opacity: joke,
      }}>“我是小模。<br/>我没吃过饭。”</div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center',
        fontFamily: FONT, fontSize: 78, fontWeight: 900, color: INK7, opacity: ez(l - 20, 12),
        transform: `scale(${0.92 + 0.08 * ez(l - 20, 12)})`,
      }}>一个真的<tspan fill={RED7}>，一个编的</tspan></div>
    </div>
  );
};

/* ============ 镜4 · 撕开海报：背后一片黑（12-15s） ============ */
const Scene4: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const tear = eio(clamp01((l - 10) / 22));
  const gap = 150 * tear;
  const dark = clamp01((l - 12) / 26);
  const [shx, shy] = shake(l, 34, 9);
  const slam7 = ez(l - 34, 10);
  const papers: [number, number, number, number][] = [[-1, 0.3, 12, 26], [1, 0.42, 18, 30], [-1, 0.55, 8, 22], [1, 0.66, 22, 18]];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill="#0A0908" />
        <radialGradient id="void" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="70%" stopColor="#070606" />
          <stop offset="100%" stopColor="#0A0908" />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#void)'} opacity={dark} />
      </svg>
      {/* 海报左半 */}
      <div style={{
        position: 'absolute', left: (1080 - 1024 * 0.82) / 2 - gap, top: 420,
        width: 1024 * 0.82, height: 1024 * 0.82, overflow: 'hidden',
        clipPath: 'polygon(0 0, 52% 0, 47% 100%, 0 100%)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
      }}>
        <Img src={staticFile('ep7_wukong.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {/* 海报右半 */}
      <div style={{
        position: 'absolute', left: (1080 - 1024 * 0.82) / 2 + gap, top: 420,
        width: 1024 * 0.82, height: 1024 * 0.82, overflow: 'hidden',
        clipPath: 'polygon(52% 0, 100% 0, 100% 100%, 47% 100%)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
      }}>
        <Img src={staticFile('ep7_wukong.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {/* 纸片飞散 */}
      {papers.map(([dir, tt, w, sz], i) => {
        const p = clamp01((tear - tt) / (1 - tt));
        if (p <= 0) return null;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: 540 + dir * (120 + p * 320),
            top: 700 - p * 220 + p * p * 420,
            width: sz * 2, height: sz * 1.4,
            background: '#C9A85E', opacity: 1 - p * 0.7,
            transform: `rotate(${dir * p * 240}deg)`, clipPath: 'polygon(0 0, 100% 12%, 88% 100%, 6% 84%)',
          }} />
        );
      })}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1250, textAlign: 'center',
        fontFamily: FONT, fontSize: 92, fontWeight: 900, color: RED7,
        opacity: slam7, transform: `translate(540 1290) scale(${1.55 - 0.55 * slam7}) translate(-540 -1290)`,
        textShadow: '0 0 40px rgba(217,51,39,0.55)',
      }}>它背后，什么都没有</div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1400, textAlign: 'center',
        fontFamily: FONT, fontSize: 56, fontWeight: 900, color: GOLD7, opacity: ez(l - 54, 12),
      }}>像 ≠ 对</div>
    </div>
  );
};

const SUBS7: [number, number, string][] = [
  [0, 2.6, '这就是它给你的答案'],
  [2.6, 4.5, '看着比真的还真'],
  [4.5, 6.6, '拉远一看'],
  [6.6, 8.5, '一张钉在墙上的海报'],
  [8.5, 10.4, '一个真的，一个编的'],
  [10.4, 12.0, '一问就露馅'],
  [12.0, 13.4, '它背后'],
  [13.4, 15.0, '什么都没有'],
];

const Sub7: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBS7.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const step = Math.min(0.1, ((seg[1] - seg[0]) / Math.max(1, chars.length)) * 0.8);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / step) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1620, textAlign: 'center', padding: '0 60px' }}>
      {chars.map((ch, i) => (
        <span key={i} style={{
          fontFamily: FONT, fontSize: 46, fontWeight: 900, display: 'inline-block',
          color: i === n - 1 ? GOLD7 : (i < n ? INK7 : '#4A433C'),
          transform: i === n - 1 ? 'scale(1.12)' : 'scale(1)',
        }}>{ch}</span>
      ))}
    </div>
  );
};

const SE7: [number, string, number][] = [
  [4, 'sfx/boom.wav', 0.8],
  [40, 'sfx/whoosh.wav', 0.7],
  [140, 'sfx/whoosh.wav', 0.6],
  [160, 'sfx/da.mp3', 0.7],
  [262, 'sfx/da.mp3', 0.9],
  [300, 'sfx/dong.mp3', 0.8],
  [368, 'sfx/da.mp3', 0.85],
  [376, 'sfx/boom.wav', 0.75],
  [410, 'sfx/ding.mp3', 0.7],
];

const BOUNDS7: [number, number][] = [[0, 135], [135, 255], [255, 360], [360, 450]];

export const EP07P: React.FC = () => {
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
  const cutFlash = frame - b0 < 3 ? (1 - (frame - b0) / 3) * 0.16 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG7 }}>
      <Scene f={frame} l={l} />
      {SE7.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.45} />
      <Sub7 t={t} />
      {cutFlash > 0 ? <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', opacity: cutFlash, pointerEvents: 'none' }} /> : null}
    </AbsoluteFill>
  );
};
