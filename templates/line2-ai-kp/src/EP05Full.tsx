/* =============================================================================
 * EP04《Agent 是怎么转圈的》· 竖屏 9:16 · 60秒正式版
 * 对标：Arthur Katcher《40秒讲清 coding agent 怎么工作》(2026-09-27)
 * 合流：他的骨架（一幕一个点/拍点卡刀/贯穿线索）+ 我们的血肉（竖屏/老贾IP/逐字字幕/男声）
 * 老贾 10/21 拍板：小模 → 换成「模型」本体；配音改男声+响度加大
 * ============================================================================= */
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, staticFile, Audio } from 'remotion';
import { CUES, CHARS, charAt } from './ep5fCues';

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
        <text x={126} y={37} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#FFFFFF">AI 科普 · EP05</text>
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
const Scene1: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const cp = clamp01((l - 6) / 106);
  const ce = 1 - Math.pow(1 - cp, 3);
  const base = 175000000000 * ce;
  const landed = l >= 112;
  const val = base * (landed ? 1 + 0.0006 * Math.sin((f - 112) / 3) : 1);
  const p = pop(l, 6, 20);
  const landPulse = landed ? 1 + 0.12 * Math.sin(Math.min(1, (l - 112) / 14) * Math.PI) : 1;
  const ring = landed ? clamp01((l - 112) / 22) : 0;
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={290} y={300} width={500} height={92} rx={46} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={364} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>GPT-3</text>
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2 + f * 0.02;
          const on = ez(l - (12 + i * 0.9), 8);
          return (
            <g key={i} opacity={on}>
              <circle cx={540 + Math.cos(a) * 300} cy={1085 + Math.sin(a) * 300} r={11} fill={i % 4 === 0 ? BLUE : GOLD} />
              <circle cx={540 + Math.cos(a + 0.13) * 366} cy={1085 + Math.sin(a + 0.13) * 366} r={7} fill={i % 3 === 0 ? BLUE : GOLD} opacity={0.7} />
            </g>
          );
        })}
        <g transform={`translate(540 1085)`}>
          <XiaoMo x={0} y={0} s={0.9 + 0.012 * Math.sin(f / 22)} mood={l < 112 ? 'shock' : 'proud'} f={f} />
        </g>
        {landed ? (
          <g opacity={1 - ring}>
            <circle cx={540} cy={1085} r={220 + 420 * ring} fill="none" stroke={GOLD} strokeWidth={8 - 5 * ring} />
            <circle cx={540} cy={1085} r={150 + 300 * ring} fill="none" stroke={BLUE} strokeWidth={5 - 3 * ring} opacity={0.7} />
          </g>
        ) : null}
      </svg>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center',
        fontFamily: FONT, fontSize: landed ? 150 : 76, fontWeight: 900, color: NAVY,
        transform: `scale(${(0.9 + 0.1 * p) * landPulse})`, letterSpacing: -2, whiteSpace: 'nowrap',
      }}>
        {landed ? '1750 亿' : fmt(val)}
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center',
        fontFamily: FONT, fontSize: 54, fontWeight: 800, color: GREY, opacity: ez(l - 30, 14),
      }}>
        个参数
      </div>
    </>
  );
};

/* ============================ 幕2 · 参数就是旋钮 ============================ */
/* ============================ 幕2 · 一个参数 = 一条小经验 ============================ */
const CARDS = ['猫有胡子', '天会下雨', '1+1=2', '苹果是甜的', '狗会叫', '水是湿的', '火是烫的', '鸟会飞'];
const CARD_SRC: [number, number][] = [[90, 430], [990, 430], [90, 780], [990, 780], [110, 1200], [970, 1200], [330, 320], [750, 320]];

const Scene2: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const HX = 540;
  const HY = 1000;
  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 255, textAlign: 'center',
        fontFamily: FONT, fontSize: 72, fontWeight: 900, color: NAVY, opacity: ez(l - 2, 12),
      }}>
        一个参数 = 一条小经验
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <circle cx={HX} cy={HY} r={200 + 14 * Math.sin(f / 9)} fill="none" stroke={GOLD} strokeWidth={6}
          opacity={0.35 + 0.25 * Math.sin(f / 9)} />
        {CARDS.map((txt, i) => {
          const p = cyc(f + i * 11, 96);
          const e = eio(p);
          const [sx, sy] = CARD_SRC[i];
          const x = lerp(sx, HX, e) + Math.sin(p * Math.PI * 2 + i) * 26;
          const y = lerp(sy, HY, e);
          const sc = (1 - 0.42 * e) * (p > 0.93 ? Math.max(0, 1 - (p - 0.93) / 0.07) : 1);
          const op = ez(l - 4, 10) * (p > 0.93 ? Math.max(0, 1 - (p - 0.93) / 0.07) : 1);
          return (
            <g key={i} opacity={op} transform={`translate(${x} ${y}) scale(${sc}) rotate(${(i % 2 ? 1 : -1) * 6 * Math.sin(f / 14 + i)})`}>
              <rect x={-100} y={-42} width={200} height={84} rx={16} fill="#FFFFFF" stroke={i % 2 ? BLUE : NAVY} strokeWidth={5} />
              <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={NAVY}>{txt}</text>
            </g>
          );
        })}
        <g transform="translate(540 1000)">
          <XiaoMo x={0} y={0} s={0.84} mood={cyc(f, 80) > 0.85 ? 'shock' : 'happy'} f={f} armL={-118} armR={118} />
        </g>
        <text x={540} y={1290} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={800} fill={GREY}
          opacity={ez(l - 30, 14)}>
          这样的小经验，它有一千多亿条
        </text>
      </svg>
    </>
  );
};
/* ============================ 幕3 · 拧一点就变 ============================ */
const Scene3: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const move = ping(f, 130);
  const ang = -58 + 116 * move;
  const toCat = move < 0.5;
  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center',
        fontFamily: FONT, fontSize: 56, fontWeight: 900, color: NAVY, opacity: ez(l - 2, 12),
      }}>
        往左一点是猫，往右一点是狗
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* 猫卡：指针往左时滑进来 */}
        <g transform={`translate(${220 - 340 * move * ez(l - 22, 20)} 790) scale(${1 - 0.05 * move})`} opacity={ez(l - 6, 14)}>
          <rect x={-165} y={-150} width={330} height={300} rx={28} fill="#FFFFFF" stroke={GOLD} strokeWidth={7} />
          <text x={0} y={72} textAnchor="middle" fontFamily={FONT} fontSize={118} fontWeight={900} fill={GOLD}>猫</text>
          <text x={0} y={-178} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={GREY}>往左</text>
        </g>
        {/* 狗卡：指针往右时滑进来 */}
        <g transform={`translate(${860 + 340 * (1 - move) * ez(l - 22, 20)} 790) scale(${0.95 + 0.05 * move})`} opacity={ez(l - 6, 14)}>
          <rect x={-165} y={-150} width={330} height={300} rx={28} fill="#FFFFFF" stroke={BLUE} strokeWidth={7} />
          <text x={0} y={72} textAnchor="middle" fontFamily={FONT} fontSize={118} fontWeight={900} fill={BLUE}>狗</text>
          <text x={0} y={-178} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={GREY}>往右</text>
        </g>
        {/* 中间刻度盘 + 左右摇摆的指针（往左=猫 / 往右=狗） */}
        <g transform={`translate(540 790) scale(${1 - 0.03 * Math.abs(0.5 - move) * 2})`} opacity={ez(l - 6, 14)}>
          <circle cx={0} cy={0} r={145 + 3 * Math.sin(f / 8)} fill="#FFFFFF" stroke={NAVY} strokeWidth={9} />
          {Array.from({ length: 36 }, (_, i) => (
            <line key={i} x1={0} y1={-118} x2={0} y2={-138} stroke={LINE} strokeWidth={5} transform={`rotate(${i * 10})`} />
          ))}
          <circle cx={0} cy={0} r={44} fill={NAVY} />
          <line x1={0} y1={0} x2={0} y2={-152} stroke={RED} strokeWidth={12} strokeLinecap="round" transform={`rotate(${ang})`} />
          <text x={0} y={66} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={900} fill="#FFFFFF">{move.toFixed(3)}</text>
        </g>
        <g transform={`translate(540 ${1150 + 6 * Math.sin(f / 12)})`}>
          <XiaoMo x={0} y={0} s={0.8} mood={toCat ? 'happy' : 'shock'} f={f} />
        </g>
        <text x={540} y={1340} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={GREY}>
          权重只挪了 0.0371
        </text>
      </svg>
    </>
  );
};

/* ============================ 幕4 · 排起来绕地球 ============================ */
const Scene4: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const wave = ping(f, 150);
  const head = 100 + 880 * wave;
  const earth = ez(l - 6, 16);
  const rot = f * 0.05;
  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center',
        fontFamily: FONT, fontSize: 64, fontWeight: 900, color: NAVY, opacity: ez(l - 4, 12),
      }}>
        排成一排
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={90} y={430} width={900} height={120} rx={18} fill="#FFFFFF" stroke={LINE} strokeWidth={5} />
        <rect x={100} y={446} width={Math.max(0, head - 100)} height={88} rx={8} fill={GOLD} opacity={0.22} />
        {Array.from({ length: 90 }, (_, i) => {
          const x = 100 + ((i * 9.9 + f * 2.2) % 880);
          return <rect key={i} x={x} y={446} width={6} height={88} rx={3} fill={x < head ? (i % 7 === 0 ? BLUE : GOLD) : '#E7EDF5'} />;
        })}
        <g transform={`translate(${head} 490)`}>
          <rect x={-10} y={-64} width={20} height={128} rx={10} fill={RED} />
          <circle cx={0} cy={-78} r={13} fill={RED} />
        </g>
        <text x={540} y={640} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY}>
          1750 亿个，一个个排过去
        </text>
        <g opacity={earth} transform="translate(540 1010)">
          <circle cx={0} cy={0} r={215} fill="#E8F0FF" stroke={BLUE} strokeWidth={8} />
          {Array.from({ length: 5 }, (_, k) => (
            <ellipse key={k} cx={0} cy={0} rx={Math.max(8, 215 * Math.abs(Math.cos(rot + k * 0.628)))} ry={215}
              fill="none" stroke={BLUE} strokeWidth={4} opacity={0.55} />
          ))}
          {[-0.62, 0, 0.62].map((lat, k) => (
            <ellipse key={k} cx={0} cy={lat * 215} rx={Math.max(20, 215 * Math.cos(lat * 0.9))} ry={26}
              fill="none" stroke={BLUE} strokeWidth={4} opacity={0.45} />
          ))}
          <circle cx={215 * Math.cos(rot * 1.6)} cy={70 * Math.sin(rot * 1.6)} r={14} fill={RED} />
        </g>
      </svg>
    </>
  );
};

/* ============================ 幕5 · 小莫跳进框里 ============================ */
/* ============================ 幕5 · 抱着卡片往箱里塞 ============================ */
const K5 = (() => {
  let s = 20261023;
  const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  return Array.from({ length: 190 }, () => ({ x: 30 + rnd() * 640, y: 30 + rnd() * 500, d: 2 + Math.floor(rnd() * 44), sz: 8 + rnd() * 8, ph: rnd() * 6.28 }));
})();

const Scene5: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const breathe = 1 + 0.014 * Math.sin(f / 16);
  const g = ez(l - 30, 18);
  const lvl = ez(l - 4, 50);
  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 235, textAlign: 'center',
        fontFamily: FONT, fontSize: 56, fontWeight: 900, color: NAVY, opacity: ez(l - 2, 12),
      }}>
        1750 亿个，全塞进一个箱子
      </div>
      <div style={{
        position: 'absolute', left: 330, top: 350, width: 660, height: 540,
        border: `6px solid ${NAVY}`, borderRadius: 32, background: '#FFFFFF',
        boxShadow: '0 18px 44px rgba(10,37,64,0.14)', opacity: ez(l, 12),
        transform: `scale(${(0.94 + 0.06 * ez(l, 12)) * breathe})`, overflow: 'hidden',
      }}>
        {K5.map((k, i) => {
          const tt = ez(l - (4 + k.d * 0.7), 8);
          const ox = Math.cos(f / 26 + k.ph) * 9;
          const oy = Math.sin(f / 22 + k.ph) * 10;
          return <div key={i} style={{
            position: 'absolute', left: k.x * 0.94 + ox, top: k.y * 0.94 + oy, width: k.sz, height: k.sz,
            borderRadius: '50%', background: i % 6 === 0 ? BLUE : GOLD,
            opacity: tt, transform: `scale(${0.2 + 0.8 * tt})`,
          }} />;
        })}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: `${18 + 26 * lvl}%`,
          background: `linear-gradient(180deg, rgba(255,184,0,0) 0%, rgba(255,184,0,0.22) 100%)`,
        }} />
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* 从手里飞进箱子的一串卡片 */}
        {Array.from({ length: 16 }, (_, i) => {
          const p = cyc(f * 1.7 + i * 5.5, 52);
          const x0 = 250;
          const y0 = 1010;
          const x1 = 400 + ((i * 137) % 520);
          const y1 = 430 + ((i * 89) % 380);
          const x = lerp(x0, x1, p) + Math.sin(p * Math.PI) * 40;
          const y = lerp(y0, y1, p) - Math.sin(p * Math.PI) * 150;
          const op = ez(l - 8, 12) * Math.min(1, (1 - p) * 4) * Math.min(1, p * 6);
          return (
            <g key={i} opacity={op} transform={`translate(${x} ${y}) rotate(${p * 220 + i * 20}) scale(${0.85 - 0.3 * p})`}>
              <rect x={-26} y={-18} width={52} height={36} rx={6} fill={i % 3 === 0 ? BLUE : GOLD} stroke={NAVY} strokeWidth={3} />
            </g>
          );
        })}
        {/* 小莫抱着卡片 */}
        <g transform={`translate(250 ${1010 + 5 * Math.sin(f / 13)})`}>
          <XiaoMo x={0} y={0} s={0.8} mood={f % 80 < 40 ? 'serious' : 'proud'} f={f} armL={-42} armR={42} />
        </g>
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={-58 + 250 + (i % 2) * 4} y={1010 - 150 - i * 17} width={112} height={14} rx={4}
            fill={i % 2 ? '#FFFFFF' : GOLD} stroke={NAVY} strokeWidth={3}
            transform={`rotate(${Math.sin(f / 11 + i) * 3} 250 ${1010 - 150 - i * 17})`} />
        ))}
      </svg>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1075, textAlign: 'center',
        fontFamily: FONT, fontSize: 112, fontWeight: 900, color: RED,
        opacity: g, transform: `scale(${0.9 + 0.1 * g + 0.012 * Math.sin(f / 9)})`,
      }}>
        350 G
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1215, textAlign: 'center',
        fontFamily: FONT, fontSize: 40, fontWeight: 800, color: GREY, opacity: g,
      }}>
        1750 亿个参数，装完就这么大
      </div>
    </>
  );
};
/* ============================ 幕6 · 一块移动硬盘 ============================ */

const Scene6: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const ledOn = Math.sin(f / 5) > 0;
  const glow = ez(l - 44, 18);
  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 235, textAlign: 'center',
        fontFamily: FONT, fontSize: 46, fontWeight: 800, color: GREY, opacity: ez(l - 2, 12),
      }}>
        1750 亿个参数，塞满也就
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center',
        fontFamily: FONT, fontSize: 118, fontWeight: 900, color: RED,
        opacity: ez(l - 8, 14), transform: `scale(${1 + 0.014 * Math.sin(f / 9)})`,
      }}>
        350 个 G
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* 卡片往硬盘里倒 */}
        {Array.from({ length: 14 }, (_, i) => {
          const p = cyc(f * 1.6 + i * 6.2, 46);
          const e = eio(p);
          const x0 = 330 + ((i * 97) % 420);
          const y0 = 620;
          const x = lerp(x0, 540 + ((i % 5) - 2) * 10, e);
          const y = lerp(y0, 812, e);
          const op = ez(l - 6, 12) * Math.min(1, (1 - p) * 5) * Math.min(1, p * 6);
          return (
            <g key={i} opacity={op} transform={`translate(${x} ${y}) rotate(${p * 180 + i * 24}) scale(${1 - 0.45 * e})`}>
              <rect x={-22} y={-15} width={44} height={30} rx={6} fill={i % 3 === 0 ? BLUE : GOLD} stroke={NAVY} strokeWidth={3} />
            </g>
          );
        })}
        {/* 移动硬盘 */}
        <g transform={`translate(540 ${950 + 4 * Math.sin(f / 14)})`}>
          <ellipse cx={0} cy={152} rx={238} ry={26} fill={NAVY} opacity={0.13} />
          <rect x={-220} y={-125} width={440} height={250} rx={30} fill="#16283A" stroke={NAVY} strokeWidth={7} />
          <rect x={-200} y={-105} width={400} height={210} rx={18} fill="#22384E" />
          <rect x={-62} y={-134} width={124} height={20} rx={10} fill="#0A1018" stroke="#4A6178" strokeWidth={3} />
          <text x={0} y={-34} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#9FB3C8" letterSpacing={6}>POCKET DRIVE</text>
          <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontSize={76} fontWeight={900} fill={GOLD}>350 G</text>
          <text x={-6} y={100} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={700} fill="#9FB3C8">一块移动硬盘</text>
          <circle cx={168} cy={-84} r={10} fill={ledOn ? GREEN : '#1E6B3A'} />
          {ledOn ? <circle cx={168} cy={-84} r={20} fill={GREEN} opacity={0.25} /> : null}
          <rect x={220} y={-24} width={34} height={52} rx={8} fill="#9FB3C8" stroke={NAVY} strokeWidth={4} />
        </g>
        {Array.from({ length: 2 }, (_, i) => {
          const p = cyc(f + i * 26, 52);
          return <circle key={i} cx={540} cy={1100 - p * 180} r={12 + p * 26} fill={GOLD}
            opacity={ez(l - 44, 12) * (1 - p) * 0.35} />;
        })}
      </svg>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center',
        fontFamily: FONT, fontSize: 50, fontWeight: 900, color: NAVY,
        opacity: glow, transform: `scale(${0.94 + 0.06 * glow})`,
      }}>
        一块移动硬盘就装得下
      </div>
    </>
  );
};

/* ============================ 幕7 · 一根接一根长高 ============================ */
const BARS = [
  { x: 250, h: 250, label: 'GPT-1', sub: '1.2 亿' },
  { x: 540, h: 470, label: 'GPT-2', sub: '15 亿' },
  { x: 830, h: 720, label: 'GPT-3', sub: '1750 亿' },
];
const Scene7: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center',
        fontFamily: FONT, fontSize: 56, fontWeight: 900, color: NAVY,
        opacity: ez(l - 2, 12), transform: `scale(${1 + 0.015 * Math.sin(f / 10)})`,
      }}>
        参数越多，记得越细
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <line x1={110} y1={1215} x2={970} y2={1215} stroke={NAVY} strokeWidth={5} />
        {BARS.map((b, i) => {
          const g = ez(l - (10 + i * 26), 24);
          const h = Math.max(6, b.h * g * (1 + 0.012 * Math.sin(f / 11 + i)));
          const flowing = f * 4;
          return (
            <g key={i}>
              <rect x={b.x - 90} y={1215 - h} width={180} height={h} rx={12}
                fill={i === 2 ? GOLD : i === 1 ? BLUE : '#A9C4E4'} />
              {Array.from({ length: Math.max(1, Math.floor(h / 40)) }, (_, k) => {
                const yy = 1215 - 24 - ((k * 40 + flowing) % Math.max(40, h - 30));
                return <circle key={k} cx={b.x - 55 + (k % 4) * 36} cy={yy} r={7} fill="#FFFFFF" opacity={0.8} />;
              })}
              <text x={b.x} y={1185} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={NAVY}>{b.label}</text>
              <text x={b.x} y={1262} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={GREY}>{b.sub}</text>
              {i < 2 ? <path d={`M ${BARS[i + 1].x - 120} ${1215 - b.h - 40} q 40 -20 70 0`} fill="none" stroke={GREY} strokeWidth={4}
                strokeDasharray="8 8" strokeDashoffset={-f * 2} opacity={ez(l - (40 + i * 26), 12)} /> : null}
            </g>
          );
        })}
      </svg>
    </>
  );
};

/* ============================ 幕7b · 参数是练出来的 ============================ */
const LOSS: [number, number][] = [[240, 410], [310, 428], [375, 462], [440, 448], [505, 492], [570, 515], [635, 540], [700, 556], [765, 572], [845, 588]];

const Scene7b: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const lift = ping(f, 64);
  const barY = 880 - 34 * lift + Math.sin(f / 3) * 2 * lift;
  const spot = ez(l - 6, 14);
  const dot = Math.min(LOSS.length - 1, Math.floor((f / 7) % LOSS.length));
  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 222, textAlign: 'center',
        fontFamily: FONT, fontSize: 54, fontWeight: 900, color: NAVY,
        opacity: ez(l - 2, 12), transform: `scale(${1 + 0.012 * Math.sin(f / 10)})`,
      }}>
        参数是练出来的，不是写出来的
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* 训练损失曲线 */}
        <g opacity={ez(l - 6, 14)}>
          <rect x={190} y={340} width={700} height={300} rx={26} fill="#FFFFFF" stroke={LINE} strokeWidth={5} />
          <text x={222} y={386} fontFamily={FONT} fontSize={24} fontWeight={800} fill={GREY}>训练损失 · loss</text>
          <circle cx={836} cy={378} r={7} fill={GREEN} opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 8))} />
          <text x={820} y={386} textAnchor="end" fontFamily={FONT} fontSize={22} fontWeight={800} fill={GREY}>训练中</text>
          <line x1={222} y1={606} x2={858} y2={606} stroke={LINE} strokeWidth={4} />
          <line x1={222} y1={412} x2={222} y2={606} stroke={LINE} strokeWidth={4} />
          <polyline points={LOSS.map((p) => p.join(',')).join(' ')} fill="none" stroke={BLUE} strokeWidth={7}
            strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1200} strokeDashoffset={1200 * (1 - ez(l - 10, 40))} />
          {LOSS.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={i === dot ? 13 : 6} fill={i === dot ? RED : BLUE}
              opacity={i === dot ? 1 : 0.55} />
          ))}
        </g>
        {/* 哑铃 */}
        <g transform={`translate(540 ${barY})`} opacity={spot}>
          <line x1={-232} y1={0} x2={232} y2={0} stroke={NAVY} strokeWidth={16} strokeLinecap="round" />
          <rect x={-262} y={-72} width={44} height={144} rx={12} fill={GOLD} stroke={NAVY} strokeWidth={5} />
          <rect x={-226} y={-52} width={28} height={104} rx={9} fill={BLUE} stroke={NAVY} strokeWidth={4} />
          <rect x={218} y={-72} width={44} height={144} rx={12} fill={GOLD} stroke={NAVY} strokeWidth={5} />
          <rect x={198} y={-52} width={28} height={104} rx={9} fill={BLUE} stroke={NAVY} strokeWidth={4} />
          {Array.from({ length: 5 }, (_, i) => (
            <circle key={i} cx={-236 + i * 118} cy={0} r={6} fill="#FFFFFF" opacity={0.6} />
          ))}
        </g>
        <g transform={`translate(540 ${985 + 4 * Math.sin(f / 13)})`}>
          <XiaoMo x={0} y={0} s={0.78} mood={lift > 0.55 ? 'shock' : 'serious'} f={f}
            armL={-10 - 10 * lift} armR={10 + 10 * lift} />
        </g>
        {/* 汗水 */}
        {Array.from({ length: 3 }, (_, i) => {
          const p = cyc(f + i * 17, 54);
          return (
            <path key={i} d="M 0 -12 Q 9 4 0 10 Q -9 4 0 -12 Z" fill="#8BE9FD" stroke={NAVY} strokeWidth={2}
              opacity={spot * (1 - p) * 0.9}
              transform={`translate(${470 + i * 70} ${960 + p * 110})`} />
          );
        })}
        <text x={540} y={1195} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={GREY}
          opacity={ez(l - 40, 16)}>
          上亿次调整，才练出一个数
        </text>
      </svg>
    </>
  );
};

/* ============================ 幕8 · 饭量：烧电 ============================ */
/* ============================ 幕8 · 老式电表飞转 ============================ */
const Scene8: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const kwh = 1187000 * ez(l - 10, 40) + f * 320;
  const spin = f * 14;
  const needle = -110 + 220 * (0.5 + 0.5 * Math.sin(f / 5));
  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 225, textAlign: 'center',
        fontFamily: FONT, fontSize: 56, fontWeight: 900, color: NAVY, opacity: ez(l - 2, 12),
      }}>
        训练一次，电表转成这样
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* 五个灯泡，依次点亮 */}
        {Array.from({ length: 5 }, (_, i) => {
          const on = (Math.floor(f / 5) + i) % 5 < 3;
          return (
            <g key={i} opacity={ez(l - (4 + i * 4), 10)}>
              <line x1={250 + i * 145} y1={400} x2={250 + i * 145} y2={450} stroke={NAVY} strokeWidth={5} />
              <circle cx={250 + i * 145} cy={470} r={34} fill={on ? GOLD : '#E7EDF5'} stroke={NAVY} strokeWidth={5} />
              {on ? <circle cx={250 + i * 145} cy={470} r={54} fill={GOLD} opacity={0.22} /> : null}
            </g>
          );
        })}
        {/* 电表外壳 */}
        <rect x={150} y={560} width={780} height={520} rx={40} fill="#FFFFFF" stroke={NAVY} strokeWidth={9} />
        {/* 飞转的圆盘 */}
        <g transform="translate(370 760)">
          <circle cx={0} cy={0} r={132} fill="#F2F6FC" stroke={NAVY} strokeWidth={7} />
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={0} y1={-18} x2={0} y2={-124} stroke={RED} strokeWidth={13} strokeLinecap="round"
              transform={`rotate(${spin + i * 45})`} opacity={0.85} />
          ))}
          <circle cx={0} cy={0} r={20} fill={NAVY} />
        </g>
        {/* 指针表 */}
        <g transform="translate(730 760)">
          <circle cx={0} cy={0} r={120} fill="#FFFFFF" stroke={NAVY} strokeWidth={7} />
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={0} y1={-96} x2={0} y2={-108} stroke={GREY} strokeWidth={5} transform={`rotate(${-110 + i * 22})`} />
          ))}
          <line x1={0} y1={0} x2={0} y2={-92} stroke={RED} strokeWidth={9} strokeLinecap="round" transform={`rotate(${needle})`} />
          <circle cx={0} cy={0} r={12} fill={NAVY} />
        </g>
        {/* 滚轮数字 */}
        <rect x={220} y={900} width={640} height={104} rx={14} fill={NAVY} />
        <text x={540} y={975} textAnchor="middle" fontFamily="Consolas, monospace" fontSize={62} fontWeight={900} fill={GOLD}>
          {fmt(kwh)} kWh
        </text>
        {/* 冒烟 */}
        {Array.from({ length: 4 }, (_, i) => {
          const p = cyc(f + i * 14, 56);
          return (
            <circle key={i} cx={250 + i * 34 + Math.sin(p * 6 + i) * 18} cy={1110 - p * 120} r={14 + p * 22}
              fill={GREY} opacity={(1 - p) * 0.32} />
          );
        })}
      </svg>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center',
        fontFamily: FONT, fontSize: 42, fontWeight: 800, color: GREY, opacity: ez(l - 20, 14),
      }}>
        几千张显卡一起转，电表就是这么转的
      </div>
    </>
  );
};
/* ============================ 幕8b · 为什么不无限加 ============================ */
const Scene8b: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const u = ez(l - 12, 46);
  const ang = lerp(0, -17, u);
  const rad = (ang * Math.PI) / 180;
  const PX = 540;
  const PY = 790;
  const L = 300;
  const lx = PX - L * Math.cos(rad);
  const ly = PY - L * Math.sin(rad);
  const rx = PX + L * Math.cos(rad);
  const ry = PY + L * Math.sin(rad);
  const hang = 84;
  const pan = (x: number, y: number, color: string) => (
    <g>
      <line x1={x} y1={y} x2={x - 78} y2={y + hang} stroke={NAVY} strokeWidth={4} />
      <line x1={x} y1={y} x2={x + 78} y2={y + hang} stroke={NAVY} strokeWidth={4} />
      <path d={`M ${x - 96} ${y + hang} Q ${x} ${y + hang + 64} ${x + 96} ${y + hang} Z`} fill="#FFFFFF" stroke={color} strokeWidth={7} />
    </g>
  );
  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 235, textAlign: 'center',
        fontFamily: FONT, fontSize: 58, fontWeight: 900, color: NAVY, opacity: ez(l - 2, 12),
      }}>
        那为什么不无限加？
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* 支架 */}
        <line x1={540} y1={PY} x2={540} y2={1180} stroke={NAVY} strokeWidth={14} strokeLinecap="round" />
        <line x1={440} y1={1180} x2={640} y2={1180} stroke={NAVY} strokeWidth={14} strokeLinecap="round" />
        <circle cx={PX} cy={PY} r={18} fill={GOLD} stroke={NAVY} strokeWidth={5} />
        {/* 横梁 */}
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={NAVY} strokeWidth={14} strokeLinecap="round" />
        {/* 左盘：参数 */}
        {pan(lx, ly, GOLD)}
        {Array.from({ length: 15 }, (_, i) => {
          const on = ez(l - (26 + i * 2.4), 8);
          const col = i % 3;
          const row = Math.floor(i / 3);
          return <circle key={i} cx={lx - 62 + col * 54 + (row % 2) * 16} cy={ly + hang - 18 - row * 26} r={17}
            fill={i % 4 === 0 ? BLUE : GOLD} stroke={NAVY} strokeWidth={3} opacity={on} />;
        })}
        <text x={lx} y={ly + hang + 108} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={NAVY}>参数</text>
        {/* 右盘：成本 */}
        {pan(rx, ry, RED)}
        {Array.from({ length: 9 }, (_, i) => {
          const on = ez(l - (34 + i * 2.2), 8);
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <g key={i} opacity={on}>
              <ellipse cx={rx - 52 + col * 50} cy={ry + hang - 14 - row * 18} rx={22} ry={9} fill={GOLD} stroke={NAVY} strokeWidth={3} />
              <ellipse cx={rx - 52 + col * 50} cy={ry + hang - 22 - row * 18} rx={22} ry={9} fill="#FFD666" stroke={NAVY} strokeWidth={3} />
            </g>
          );
        })}
        <text x={rx} y={ry + hang + 108} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={NAVY}>成本</text>
        {/* 抖动的高价标签 */}
        <g opacity={ez(l - 60, 14)} transform={`translate(${rx} ${ry + hang + 178 + Math.sin(f / 9) * 5})`}>
          <rect x={-86} y={-34} width={172} height={68} rx={34} fill={RED} />
          <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill="#FFFFFF">越贵越慢</text>
        </g>
      </svg>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1245, textAlign: 'center',
        fontFamily: FONT, fontSize: 42, fontWeight: 800, color: GREY, opacity: ez(l - 50, 14),
      }}>
        参数每翻一倍，训练费和电费都跟着翻
      </div>
    </>
  );
};

/* ============================ 幕9 · 不是智商，是饭量 ============================ */
const Scene9: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const p1 = pop(l, 4, 18);
  const p2 = pop(l, 26, 18);
  const cut = ez(l - 18, 12);
  const shake = l > 30 ? Math.sin(f * 3.4) * 5 * (1 - ez(l - 30, 20)) : 0;
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`translate(${540 + shake} 520) scale(${p1})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={104} fontWeight={900} fill={LINE}>不是智商</text>
          <line x1={-330} y1={-36} x2={-330 + 660 * cut} y2={-36} stroke={RED} strokeWidth={10} strokeLinecap="round" />
        </g>
        <g transform={`translate(540 700) scale(${p2 * (1 + 0.02 * Math.sin(f / 9))})`} opacity={p2}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={130} fontWeight={900} fill={RED}>是饭量</text>
        </g>
        <g transform={`translate(540 ${1120 + 5 * Math.sin(f / 13)})`}>
          <XiaoMo x={0} y={0} s={0.86} mood={l > 40 ? 'happy' : 'serious'} f={f} />
          <ellipse cx={0} cy={132} rx={104} ry={34} fill="#FFFFFF" stroke={NAVY} strokeWidth={7} opacity={ez(l - 40, 12)} />
          {Array.from({ length: 7 }, (_, i) => {
            const a = f * 0.06 + i * 0.9;
            return <circle key={i} cx={Math.cos(a) * 62} cy={124 + Math.sin(a) * 12} r={9} fill={GOLD} opacity={ez(l - 46, 8)} />;
          })}
        </g>
      </svg>
    </>
  );
};

/* ============================ 幕10 · 下集钩子 ============================ */
/* ============================ 幕10 · 下集钩子 + 三标签 ============================ */
const TAGS = [
  { t: '点赞', c: RED },
  { t: '关注', c: BLUE },
  { t: '转发', c: GREEN },
];

const Scene10: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const slam = clamp01((l - 4) / 12);
  const sc = 2.6 - 1.6 * ez(l - 4, 12);
  const shake = l > 4 && l < 22 ? Math.sin(l * 3) * 9 * (1 - (l - 4) / 18) : 0;
  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center',
        fontFamily: FONT, fontSize: 40, fontWeight: 900, color: GREY, letterSpacing: 10,
        opacity: ez(l - 2, 10),
      }}>
        下 集
      </div>
      <div style={{
        position: 'absolute', left: 50, right: 50, top: 470, textAlign: 'center',
        fontFamily: FONT, fontSize: 92, fontWeight: 900, color: NAVY, lineHeight: 1.32,
        opacity: slam, transform: `translateX(${shake}px) scale(${sc})`,
        textShadow: '0 6px 0 rgba(10,37,64,0.10)',
      }}>
        它为什么<br />一本正经地胡说
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`translate(540 ${1010 + 5 * Math.sin(f / 14)})`}>
          <XiaoMo x={0} y={0} s={0.7} mood="worried" f={f}
            armL={-150 + 25 * Math.sin(f / 6)} armR={150 - 25 * Math.sin(f / 6)} />
        </g>
        {TAGS.map((tag, i) => {
          const p = pop(l, 38 + i * 10, 14);
          const floatY = Math.sin(f / 12 + i) * 6;
          const x = 175 + i * 250;
          return (
            <g key={i} transform={`translate(${x} ${1350 + floatY}) scale(${p})`}>
              <rect x={-112} y={-44} width={224} height={88} rx={44} fill={tag.c} />
              <text x={0} y={15} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill="#FFFFFF">{tag.t}</text>
            </g>
          );
        })}
        <g opacity={ez(l - 52, 12)}>
          <text x={540} y={1620} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={GREY}>
            AI 科普 · EP06 · 明天见
          </text>
        </g>
      </svg>
    </>
  );
};
/* ============================ 转场（抹布擦除 / 推镜） ============================ */
const ShotLayer: React.FC<{ start: number; dur: number; fromDir: [number, number]; lead?: number; children: React.ReactNode }> =
  ({ start, dur, fromDir, lead = 4, children }) => {
    const f = useCurrentFrame();
    const local = f - start;
    if (local < -20 || local > dur + 12) return null;
    const inP = clamp01((local + lead) / 6);
    const outP = clamp01((local - (dur - 6)) / 12);
    const eIn = 1 - Math.pow(1 - inP, 3);
    const eOut = eio(outP);
    const dx = fromDir[0] * (1 - eIn) * 90 - fromDir[0] * eOut * 90;
    const dy = fromDir[1] * (1 - eIn) * 110 - fromDir[1] * eOut * 90;
    const drift = 1 + 0.016 * Math.sin(local / 15);
    const sc = (0.94 + 0.06 * eIn) * (1 + 0.14 * eOut) * drift;
    return (
      <div style={{
        position: 'absolute', inset: 0,
        transform: `translate(${dx}px, ${dy}px) scale(${sc})`,
        opacity: local < dur ? clamp01((local + lead) / lead) : 0,
      }}>
        {children}
      </div>
    );
  };

const DIRS: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0], [0, 1], [1, 0], [0, -1], [-1, 0], [0, 1], [1, 0], [0, -1], [0, 1]];
const TINTS = ['#E8F0FF', '#E9F7EF', '#FFF6E0', '#FDECEC', '#E8F0FF', '#E9F7EF', '#FFF6E0', '#FDECEC', '#E8F0FF', '#E9F7EF', '#FDECEC', '#FFF6E0'];

export const EP05F: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < CUES.length; i++) {
    seg = i;
    if (t < CUES[i].end) break;
  }
  const spot = LAOJIA_SPOTS[seg] ?? LAOJIA_SPOTS[0];
  const tint = TINTS[seg] ?? '#E8F0FF';
  const S = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene7b, Scene8, Scene8b, Scene9, Scene10];
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Backdrop tint={tint} f={frame} />
      {CUES.map((c, i) => {
        const Scene = S[i];
        if (!Scene) return null;
        return (
          <ShotLayer key={i} start={Math.round(c.start * 30)} dur={Math.round(c.dur * 30)} fromDir={DIRS[i] ?? [0, 1]}>
            <Scene f={frame} t={t} l={frame - Math.round(c.start * 30)} />
          </ShotLayer>
        );
      })}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <LaoJia x={spot.x} y={spot.y} s={spot.s} mode={spot.mode} f={frame} wag={seg === 0 || seg === 6 || seg === 9} />
      </svg>
      <Badge f={frame} />
      <Subtitle seg={seg} t={t} />
      {/* BGM 从 5.62s 起播：让 BGM 第 9.35s 的段落高点正好落在第 1 幕「1750 亿」落定（3.733s） */}
      <Audio src={staticFile('bgm_midnight.m4a')} startFrom={169} volume={1} />
    </AbsoluteFill>
  );
};
