
/* =============================================================
 * EP06V2《先取经，再念经》· 63秒完整版 · 2026-10-25
 * 11 幕：编造书(孙悟空大战奥特曼) → 查无此书 → 老贾：去取真经 → RAG
 *        → 检索/拼接/生成 → SimpleQA 实测 38/92 → 假经坑 → 金句 → 预告
 * 色板：navy（#0D1B2A 底 / 金 #F2A93B / 白 / 红）
 * 小模一律带米色聚光灯底（深底上完整显示）
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

/* ---- 色板 ---- */
const NAVYB = '#0D1B2A';
const GOLD2 = '#F2A93B';
const CYAN = '#5CC8E0';
const CREAM = '#EEF3F6';
const RED2 = '#FF3B30';
const DIM = '#3A4A5E';

/* ---- 小模（带聚光灯底，深底上完整可见） ---- */
const Mascot: React.FC<{ x: number; y: number; s: number; mood: string; f: number; op?: number }> =
  ({ x, y, s, mood, f, op = 1 }) => (
    <g transform={`translate(${x} ${y})`} opacity={op}>
      <circle cx={0} cy={-4 * s} r={132 * s} fill={CREAM} opacity={0.95} />
      <circle cx={0} cy={-4 * s} r={132 * s} fill={'none'} stroke={DIM} strokeWidth={3} opacity={0.45} />
      <XiaoMo x={0} y={0} s={s} mood={mood} f={f} />
    </g>
  );

/* ---- 藏经阁 ---- */
const Shelf: React.FC<{ x: number; y: number; s: number; l: number; glow?: number }> = ({ x, y, s, l, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={ez(l - 4, 12)}>
    <rect x={-170} y={-340} width={340} height={680} rx={14} fill={'#16293D'} stroke={glow > 0 ? GOLD2 : DIM} strokeWidth={glow > 0 ? 6 : 4} />
    {[0, 1, 2, 3, 4].map((i) => {
      const cols = [CYAN, GOLD2, CREAM, RED2, '#8FA3B3'];
      return (
        <g key={i}>
          <rect x={-140 + i * 58} y={-300} width={44} height={330} rx={7} fill={cols[i]} />
          <circle cx={-118 + i * 58} cy={-272} r={6} fill={NAVYB} />
        </g>
      );
    })}
    <rect x={-170} y={40} width={340} height={20} rx={7} fill={DIM} />
    <text x={0} y={120} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={CREAM}>藏经阁</text>
  </g>
);

/* ---- 摊开的书 ---- */
const OpenBook: React.FC<{ x: number; y: number; s: number; l: number; flips?: number[] }> = ({ x, y, s, l, flips = [] }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={ez(l - 8, 12)}>
    <path d="M -190 14 L -190 128 L 0 152 L 0 38 Z" fill={'#16293D'} />
    <path d="M 190 14 L 190 128 L 0 152 L 0 38 Z" fill={'#1E3448'} />
    <path d="M -178 2 L -178 106 L -8 126 L -8 22 Z" fill={CREAM} />
    <path d="M 178 2 L 178 106 L 8 126 L 8 22 Z" fill={'#F7FBFF'} />
    {[0, 1, 2, 3].map((i) => (
      <line key={'l' + i} x1={-158} y1={26 + i * 22} x2={-32} y2={34 + i * 22} stroke={DIM} strokeWidth={5} opacity={0.45} />
    ))}
    {[0, 1, 2, 3].map((i) => (
      <line key={'r' + i} x1={32} y1={34 + i * 22} x2={158} y2={26 + i * 22} stroke={DIM} strokeWidth={5} opacity={0.45} />
    ))}
    <line x1={0} y1={38} x2={0} y2={150} stroke={DIM} strokeWidth={6} />
    {flips.map((d, i) => {
      const p = clamp01((l - d) / 12);
      if (p <= 0 || p >= 1) return null;
      const w = 168 * (1 - p);
      return <path key={i} d={`M 8 22 L ${8 + w} 16 L ${8 + w} 118 L 8 126 Z`} fill={'#FFFFFF'} stroke={DIM} strokeWidth={3} opacity={0.96} />;
    })}
  </g>
);

/* ============ 幕1 · 一本书砸下来（0-4.5s） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const at = 6;
  const landed = l >= at;
  const dropY = landed ? 0 : -(1 - Math.pow(Math.max(0, l) / at, 2.4)) * 1500;
  const sS = slamS(l, at);
  const [sx, sy] = shake(l, at, 10);
  const flash = whiteFlash(l, at, 0.55);
  const push = 1 + 0.12 * (1 - Math.pow(1 - clamp01((l - 20) / 28), 3));
  const camS = push * (landed ? 1 + 0.05 * Math.max(0, 1 - (l - at) / 6) : 1);
  const TAGS: [string, number][] = [['作者 · 吴承恩他徒弟', 34], ['ISBN 74-8888-666-6', 50], ['大明嘉靖年 一版一印', 66]];
  const bigOn = ez(l - 94, 12);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px) scale(${camS})` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`translate(540 ${740 + dropY}) rotate(${landed ? -3 : -14}) scale(${sS})`}>
          <rect x={-216} y={-290} width={460} height={620} rx={16} fill={'#000000'} opacity={0.35} transform={'translate(14 20)'} />
          <rect x={-230} y={-310} width={460} height={620} rx={16} fill={GOLD2} />
          <rect x={-230} y={-310} width={34} height={620} rx={8} fill={'#B87E22'} />
          <text x={0} y={-216} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={700} fill={'#6B4A12'}>花果山出版社 出品</text>
          <text x={0} y={-96} textAnchor="middle" fontFamily={FONT} fontSize={78} fontWeight={900} fill={NAVYB}>孙悟空</text>
          <text x={0} y={6} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={NAVYB}>大战奥特曼</text>
          <rect x={-150} y={54} width={300} height={56} rx={10} fill={NAVYB} />
          <text x={0} y={94} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={GOLD2}>爽文 · 全一册</text>
          <text x={0} y={240} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={800} fill={'#6B4A12'}>定价 9 块 9</text>
        </g>
        {TAGS.map(([s, d], i) => {
          const on = ez(l - d, 10);
          return (
            <g key={i} opacity={on} transform={`translate(${540 + (1 - on) * 340} ${1130 + i * 84})`}>
              <rect x={-230} y={-32} width={460} height={64} rx={32} fill={CREAM} />
              <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={NAVYB}>{s}</text>
            </g>
          );
        })}
        <text x={540} y={1560} textAnchor="middle" fontFamily={FONT} fontSize={92} fontWeight={900} fill={CREAM}
          opacity={bigOn} transform={`translate(540 1560) scale(${0.8 + 0.2 * bigOn}) translate(-540 -1560)`}>这本书，不存在</text>
        {flash > 0 ? <rect x={0} y={0} width={1080} height={1920} fill={'#FFFFFF'} opacity={flash} /> : null}
      </svg>
    </div>
  );
};

/* ============ 幕2 · 查无此书（4.5-7.2s） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const at = 14;
  const [sx, sy] = shake(l, at, 12);
  const gl = glitchOn(l, at);
  const flash = whiteFlash(l, at, 0.5);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px) scale(1.05)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`translate(540 760) rotate(-3)`} opacity={0.28}>
          <rect x={-230} y={-310} width={460} height={620} rx={16} fill={GOLD2} />
          <text x={0} y={-96} textAnchor="middle" fontFamily={FONT} fontSize={78} fontWeight={900} fill={NAVYB}>孙悟空</text>
          <text x={0} y={6} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={NAVYB}>大战奥特曼</text>
        </g>
        <g transform={`translate(540 780) rotate(-11) scale(${slamS(l, at)})`} opacity={Math.min(1, clamp01((l - at) / 3) * 2)}>
          <rect x={-330} y={-92} width={660} height={184} rx={22} fill={'none'} stroke={RED2} strokeWidth={18} />
          {gl ? (
            <>
              <text x={-7} y={30} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={CYAN} opacity={0.9}>查无此书</text>
              <text x={7} y={30} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={RED2} opacity={0.9}>查无此书</text>
            </>
          ) : (
            <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={RED2}>查无此书</text>
          )}
        </g>
        <text x={540} y={1240} textAnchor="middle" fontFamily={FONT} fontSize={86} fontWeight={900} fill={CREAM}
          opacity={ez(l - 32, 10)} transform={`translate(540 1240) scale(${slamS(l, 32)}) translate(-540 -1240)`}>AI 编的。</text>
        <text x={540} y={1370} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={CREAM}
          opacity={ez(l - 48, 12)} transform={`translate(540 1370) scale(${slamS(l, 48)}) translate(-540 -1370)`}>
          它撒谎，<tspan fill={RED2}>从来不脸红</tspan>
        </text>
        {flash > 0 ? <rect x={0} y={0} width={1080} height={1920} fill={'#FFFFFF'} opacity={flash} /> : null}
      </svg>
    </div>
  );
};

/* ============ 幕3 · 老贾：去取真经（7.2-10.5s） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const inX = 870 + (1 - ez(l - 6, 14)) * 520;
  const [sx, sy] = shake(l, 26, 7);
  const fly = eio(clamp01((l - 30) / 16));
  const capX = 860 + (520 - 860) * fly;
  const capY = 1330 + (1080 - 1330) * fly - Math.sin(fly * Math.PI) * 130;
  const bigOn = ez(l - 24, 12);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <text x={540} y={470} textAnchor="middle" fontFamily={FONT} fontSize={104} fontWeight={900} fill={GOLD2}
          opacity={bigOn} transform={`translate(540 470) scale(${slamS(l, 24)}) translate(-540 -470)`}>先取经，再念经</text>
        <text x={540} y={600} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={DIM}
          opacity={ez(l - 44, 12)}>病根：它闭卷考试，背不出就现编</text>
        <Mascot x={240} y={1480} s={0.95} mood={l >= 18 ? 'shock' : 'cool'} f={f} op={ez(l - 12, 12)} />
        <g transform={`translate(${inX} 1420)`}>
          <LaoJia x={0} y={0} s={0.85} mode={l >= 22 ? 'point' : 'present'} f={f} wag={l >= 22} />
        </g>
        {l >= 30 ? (
          <g opacity={Math.min(1, fly * 3)} transform={`translate(${capX} ${capY}) scale(${0.5 + 0.5 * fly}) rotate(${(1 - fly) * 16})`}>
            <rect x={-185} y={-52} width={370} height={104} rx={52} fill={GOLD2} />
            <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900} fill={NAVYB}>去取真经！</text>
          </g>
        ) : null}
      </svg>
    </div>
  );
};

/* ============ 幕4 · RAG=取经 + 38/92（10.5-15s） ============ */
const Scene4: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const shelfX = 860 + (1 - ez(l - 6, 16)) * 420;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.05 * (1 - Math.pow(1 - clamp01((l - 2) / 24), 3))})` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <text x={540} y={400} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={GOLD2}
          opacity={ez(l - 62, 12)} transform={`translate(540 400) scale(${slamS(l, 62)}) translate(-540 -400)`}>这就是 RAG</text>
        <text x={540} y={510} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={800} fill={DIM}
          opacity={ez(l - 74, 12)}>检索增强生成 · 先查，再答</text>
        <g transform={`translate(${shelfX} 860)`}>
          <Shelf x={0} y={0} s={1} l={l} />
        </g>
        <OpenBook x={280} y={920} s={1} l={l - 10} flips={[12, 24, 36]} />
        <Mascot x={280} y={1300} s={0.9} mood={'happy'} f={f} op={ez(l - 4, 12)} />
        <g transform={`translate(540 1560) scale(${slamS(l, 48)})`} opacity={ez(l - 48, 8)}>
          <rect x={-280} y={-125} width={560} height={250} rx={20} fill={CREAM} stroke={DIM} strokeWidth={5} />
          <text x={-215} y={-48} fontFamily={FONT} fontSize={44} fontWeight={800} fill={DIM} opacity={ez(l - 54, 10)}>闭卷乱编</text>
          <text x={215} y={-40} textAnchor="end" fontFamily={FONT} fontSize={62} fontWeight={900} fill={DIM} opacity={ez(l - 54, 10)}>38 分</text>
          {l >= 66 ? <line x1={-225} y1={-34} x2={215} y2={-58} stroke={RED2} strokeWidth={9} strokeLinecap="round" /> : null}
          <text x={-215} y={72} fontFamily={FONT} fontSize={44} fontWeight={800} fill={NAVYB} opacity={ez(l - 74, 10)}>捧着真经答</text>
          <text x={215} y={82} textAnchor="end" fontFamily={FONT} fontSize={76} fontWeight={900} fill={NAVYB} opacity={ez(l - 74, 10)}>92 分</text>
          {l >= 84 ? (
            <path d={`M 150 40 L 200 88 L 250 -20`} fill={'none'} stroke={RED2} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </g>
      </svg>
    </div>
  );
};

/* ============ 幕5 · 第一步 检索（15-22.5s） ============ */
const Scene5: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const drawP = clamp01((l - 26) / 34);
  const flyP = clamp01((l - 70) / 30);
  const fe = eio(flyP);
  const dotX = 430 + (760 - 430) * fe;
  const dotY = 700 + (760 - 700) * fe - Math.sin(fe * Math.PI) * 160;
  const bookP = clamp01((l - 104) / 26);
  const be = eio(bookP);
  const bx = 860 + (540 - 860) * be;
  const by = 700 + (1020 - 700) * be - Math.sin(be * Math.PI) * 120;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <text x={540} y={340} textAnchor="middle" fontFamily={FONT} fontSize={92} fontWeight={900} fill={GOLD2}
          opacity={ez(l - 8, 12)} transform={`translate(540 340) scale(${slamS(l, 8)}) translate(-540 -340)`}>第一步 · 检索</text>
        <text x={540} y={450} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={800} fill={DIM}
          opacity={ez(l - 24, 12)}>拿着问题，去藏经阁找那一卷</text>
        <g transform={`translate(240 780)`} opacity={ez(l - 14, 12)}>
          <rect x={-190} y={-110} width={380} height={220} rx={22} fill={CREAM} stroke={DIM} strokeWidth={4} />
          <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={GREY}>问题</text>
          <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={NAVYB}>《孙悟空大战奥特曼》</text>
          <text x={0} y={84} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={NAVYB}>这本书有吗？</text>
        </g>
        <path d="M 440 780 Q 620 660 750 760" fill="none" stroke={GOLD2} strokeWidth={6} strokeLinecap="round"
          strokeDasharray="900" strokeDashoffset={900 * (1 - drawP)} opacity={drawP > 0 ? 0.95 : 0} />
        {l >= 70 ? (
          <circle cx={dotX} cy={dotY} r={16} fill={GOLD2} />
        ) : null}
        {l >= 70 ? (
          <circle cx={dotX} cy={dotY} r={30} fill={'none'} stroke={GOLD2} strokeWidth={4} opacity={0.5} />
        ) : null}
        <Shelf x={860} y={820} s={0.82} l={l} glow={l >= 100 ? 1 : 0} />
        {l >= 104 ? (
          <g transform={`translate(${bx} ${by}) rotate(${(1 - be) * -30}) scale(${0.6 + 0.4 * be})`}>
            <rect x={-60} y={-190} width={120} height={380} rx={10} fill={GOLD2} stroke={CREAM} strokeWidth={4} />
            <text x={0} y={-40} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900} fill={NAVYB}>西</text>
            <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900} fill={NAVYB}>游</text>
            <text x={0} y={68} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900} fill={NAVYB}>记</text>
            <circle cx={0} cy={130} r={14} fill={NAVYB} />
          </g>
        ) : null}
        <Mascot x={880} y={1470} s={0.85} mood={'happy'} f={f} op={ez(l - 60, 12)} />
      </svg>
    </div>
  );
};

/* ============ 幕6 · 第二步 拼接（22.5-30s） ============ */
const Scene6: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const pages: [number, number, number][] = [[540, 860, 30], [540, 860, 46], [540, 860, 62]];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <text x={540} y={330} textAnchor="middle" fontFamily={FONT} fontSize={92} fontWeight={900} fill={GOLD2}
          opacity={ez(l - 8, 12)} transform={`translate(540 330) scale(${slamS(l, 8)}) translate(-540 -330)`}>第二步 · 拼接</text>
        <text x={540} y={440} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={800} fill={DIM}
          opacity={ez(l - 24, 12)}>翻到的那几页，原样摊在它面前</text>
        <OpenBook x={540} y={700} s={0.95} l={l - 6} flips={[14, 26]} />
        <g transform={`translate(540 1290)`} opacity={ez(l - 22, 12)}>
          <rect x={-350} y={-150} width={700} height={300} rx={24} fill="none" stroke={CYAN} strokeWidth={5} strokeDasharray="16 10" />
          <text x={-320} y={-104} fontFamily={FONT} fontSize={34} fontWeight={900} fill={CYAN}>它现在看到的</text>
        </g>
        {pages.map(([x0, y0, d], i) => {
          const p = clamp01((l - d) / 24);
          const e = 1 - Math.pow(1 - p, 3);
          const x = x0 + (540 + (i - 1) * 230 - x0) * e;
          const y = y0 + (1290 - y0) * e;
          return (
            <g key={i} opacity={Math.min(1, p * 2.2)} transform={`translate(${x} ${y}) rotate(${(1 - e) * 20})`}>
              <rect x={-100} y={-110} width={200} height={220} rx={8} fill={'#F7FBFF'} stroke={DIM} strokeWidth={3} />
              {[0, 1, 2, 3, 4].map((k) => (
                <line key={k} x1={-80} y1={-76 + k * 32} x2={80} y2={-70 + k * 32} stroke={DIM} strokeWidth={4} opacity={0.5} />
              ))}
              <text x={80} y={98} textAnchor="end" fontFamily={FONT} fontSize={24} fontWeight={900} fill={GOLD2}>[{i + 1}]</text>
            </g>
          );
        })}
        <Mascot x={880} y={1520} s={0.8} mood={'cool'} f={f} op={ez(l - 70, 12)} />
      </svg>
    </div>
  );
};

/* ============ 幕7 · 第三步 生成（30-37s） ============ */
const Scene7: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const lines = ['没有这本书。', '孙悟空出自《西游记》。', '和奥特曼不是一个故事。'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <text x={540} y={330} textAnchor="middle" fontFamily={FONT} fontSize={92} fontWeight={900} fill={GOLD2}
          opacity={ez(l - 8, 12)} transform={`translate(540 330) scale(${slamS(l, 8)}) translate(-540 -330)`}>第三步 · 生成</text>
        <text x={540} y={440} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={800} fill={DIM}
          opacity={ez(l - 24, 12)}>照着念，句句有出处</text>
        <Mascot x={250} y={1000} s={0.9} mood={'happy'} f={f} op={ez(l - 10, 12)} />
        <g transform={`translate(680 940)`}>
          <rect x={-290} y={-170} width={580} height={340} rx={24} fill={CREAM} stroke={DIM} strokeWidth={4} opacity={ez(l - 16, 10)} />
          {lines.map((s, i) => (
            <text key={i} x={-250} y={-80 + i * 74} fontFamily={FONT} fontSize={38} fontWeight={800} fill={NAVYB}
              opacity={ez(l - (26 + i * 16), 10)}>{s}</text>
          ))}
          {['[1]', '[2]', '[3]'].map((c, i) => (
            <g key={i} opacity={ez(l - (84 + i * 8), 8)} transform={`translate(230 ${-60 + i * 62})`}>
              <circle cx={0} cy={0} r={24} fill={GOLD2} />
              <text x={0} y={9} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={900} fill={NAVYB}>{c}</text>
            </g>
          ))}
        </g>
        <g opacity={ez(l - 80, 12)}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${390 + i * 230} 1360)`}>
              <rect x={-92} y={-104} width={184} height={208} rx={8} fill={'#F7FBFF'} stroke={GOLD2} strokeWidth={4} />
              {[0, 1, 2, 3].map((k) => (
                <line key={k} x1={-74} y1={-70 + k * 32} x2={74} y2={-64 + k * 32} stroke={DIM} strokeWidth={4} opacity={0.45} />
              ))}
              <text x={0} y={92} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={900} fill={GOLD2}>[{i + 1}]</text>
            </g>
          ))}
          <path d="M 680 1120 L 620 1250" stroke={GOLD2} strokeWidth={4} strokeDasharray="8 6" opacity={0.8} />
          <path d="M 690 1120 L 690 1250" stroke={GOLD2} strokeWidth={4} strokeDasharray="8 6" opacity={0.8} />
          <path d="M 690 1120 L 760 1250" stroke={GOLD2} strokeWidth={4} strokeDasharray="8 6" opacity={0.8} />
        </g>
      </svg>
    </div>
  );
};

/* ============ 幕8 · 实测数据（37-44s） ============ */
const Scene8: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <text x={540} y={330} textAnchor="middle" fontFamily={FONT} fontSize={86} fontWeight={900} fill={CREAM}
        opacity={ez(l - 6, 12)} transform={`translate(540 330) scale(${slamS(l, 6)}) translate(-540 -330)`}>同一套题，考两次</text>
      <g transform={`translate(540 820)`} opacity={ez(l - 14, 10)}>
        <rect x={-360} y={-220} width={720} height={440} rx={26} fill={CREAM} stroke={DIM} strokeWidth={5} />
        <text x={-310} y={-130} fontFamily={FONT} fontSize={50} fontWeight={800} fill={DIM} opacity={ez(l - 24, 10)}>闭卷乱编</text>
        <text x={310} y={-110} textAnchor="end" fontFamily={FONT} fontSize={92} fontWeight={900} fill={DIM} opacity={ez(l - 24, 10)}>38 分</text>
        {l >= 48 ? <line x1={-320} y1={-96} x2={310} y2={-140} stroke={RED2} strokeWidth={11} strokeLinecap="round" /> : null}
        <line x1={-320} y1={-10} x2={320} y2={-10} stroke={LINE} strokeWidth={4} opacity={0.6} />
        <text x={-310} y={96} fontFamily={FONT} fontSize={50} fontWeight={800} fill={NAVYB} opacity={ez(l - 62, 10)}>捧着真经答</text>
        <text x={310} y={124} textAnchor="end" fontFamily={FONT} fontSize={110} fontWeight={900} fill={NAVYB} opacity={ez(l - 62, 10)}>92.46%</text>
        {l >= 76 ? <path d="M 208 74 L 268 134 L 330 10" fill={'none'} stroke={RED2} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" /> : null}
      </g>
      <text x={540} y={1180} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={800} fill={DIM}
        opacity={ez(l - 96, 12)}>SimpleQA 基准 · You.com 官方实测 · 2026-10</text>
      <Mascot x={200} y={1440} s={0.85} mood={'happy'} f={f} op={ez(l - 30, 12)} />
      <text x={620} y={1440} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={GOLD2}
        opacity={ez(l - 104, 12)}>答对率翻了一倍多</text>
    </svg>
  </div>
);

/* ============ 幕9 · 坑：假经（44-51.5s） ============ */
const Scene9: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const flyP = clamp01((l - 24) / 28);
  const fe = eio(flyP);
  const bx = 860 + (300 - 860) * fe;
  const by = 700 + (1020 - 700) * fe - Math.sin(fe * Math.PI) * 130;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={300} width={800} height={92} rx={46} fill={RED2} opacity={ez(l - 4, 10)} />
        <text x={540} y={362} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={CREAM} opacity={ez(l - 4, 10)}>坑说清楚</text>
        <text x={540} y={460} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={DIM}
          opacity={ez(l - 20, 12)}>藏经阁里有假经，它照样念得一本正经</text>
        <Shelf x={860} y={820} s={0.82} l={l} />
        {l >= 24 ? (
          <g transform={`translate(${bx} ${by}) rotate(${(1 - fe) * 28}) scale(${0.6 + 0.4 * fe})`}>
            <rect x={-62} y={-190} width={124} height={380} rx={10} fill={'#7A5E3A'} stroke={RED2} strokeWidth={5} />
            <text x={0} y={-60} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={CREAM}>地心</text>
            <text x={0} y={-14} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={CREAM}>是平的</text>
            <g transform={'translate(0 120)'} opacity={ez(l - 52, 8)}>
              <circle cx={0} cy={0} r={44} fill="none" stroke={RED2} strokeWidth={6} />
              <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900} fill={RED2}>假</text>
            </g>
          </g>
        ) : null}
        <Mascot x={300} y={1210} s={0.85} mood={'happy'} f={f} op={ez(l - 50, 12)} />
        <g transform={`translate(300 1450)`} opacity={ez(l - 60, 12)}>
          <rect x={-290} y={-62} width={580} height={124} rx={24} fill={CREAM} stroke={RED2} strokeWidth={6} />
          <text x={0} y={-6} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={800} fill={NAVYB}>地心是平的。</text>
          <text x={0} y={42} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={RED2}>来源：第 3 卷 ✓</text>
        </g>
        <g transform={'translate(880 1450)'} opacity={ez(l - 40, 12)}>
          <LaoJia x={0} y={0} s={0.8} mode={'gasp'} f={f} wag={false} />
        </g>
        <text x={540} y={1680} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={900} fill={RED2}
          opacity={ez(l - 96, 12)} transform={`translate(540 1680) scale(${slamS(l, 96)}) translate(-540 -1680)`}>照样一本正经地错</text>
      </svg>
    </div>
  );
};

/* ============ 幕10 · 金句（51.5-58.5s） ============ */
const Scene10: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const ring = l >= 20 ? clamp01((l - 20) / 24) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <text x={540} y={760} textAnchor="middle" fontFamily={FONT} fontSize={150} fontWeight={900} fill={GOLD2}
          transform={`translate(540 760) scale(${slamS(l, 14)}) translate(-540 -760)`} opacity={ez(l - 14, 10)}>先查，再答</text>
        {l >= 20 ? (
          <g opacity={1 - ring}>
            <circle cx={540} cy={730} r={300 + 430 * ring} fill="none" stroke={GOLD2} strokeWidth={10 - 6 * ring} />
          </g>
        ) : null}
        <text x={540} y={920} textAnchor="middle" fontFamily={FONT} fontSize={60} fontWeight={900} fill={CREAM}
          opacity={ez(l - 52, 12)}>这就叫 <tspan fill={GOLD2}>RAG</tspan> · 检索增强生成</text>
        <Mascot x={300} y={1400} s={0.9} mood={'happy'} f={f} op={ez(l - 40, 12)} />
        <g transform={'translate(780 1380)'} opacity={ez(l - 44, 12)}>
          <LaoJia x={0} y={0} s={0.85} mode={'win'} f={f} wag={true} />
        </g>
        <text x={540} y={1690} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={DIM}
          opacity={ez(l - 96, 12)}>记住：先取经，再念经</text>
      </svg>
    </div>
  );
};

/* ============ 幕11 · 下集预告（58.5-63s） ============ */
const Scene11: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const txt = '下集：它为什么敢瞎编？';
  const n = Math.min(txt.length, Math.floor(Math.max(0, l - 8) / 0.9) + 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <text x={540} y={620} textAnchor="middle" fontFamily={FONT} fontSize={260} fontWeight={900} fill={RED2} opacity={0.1}>？</text>
        <text x={540} y={800} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={CREAM}>{txt.slice(0, n)}</text>
        <Mascot x={540} y={1250} s={1.0} mood={l >= 24 ? 'shock' : 'cool'} f={f} op={ez(l - 12, 12)} />
      </svg>
    </div>
  );
};

const SUBS: [number, number, string][] = [
  [0, 4.5, '你问 AI 推荐本书，它啪就给你编一本'],
  [4.5, 7.2, '这书不存在。AI 撒谎，从来不脸红'],
  [7.2, 9.2, '它闭卷考试，背不出就现编'],
  [9.2, 10.5, '老贾拍桌：去取真经！'],
  [10.5, 15, '闭卷 38 分，捧着真经 92 分'],
  [15, 22.5, '第一步，检索：拿着问题去藏经阁找那一卷'],
  [22.5, 30, '第二步，拼接：把翻到的几页摊在它面前'],
  [30, 37, '第三步，生成：照着念，句句有出处'],
  [37, 44, '同一套题：闭卷 38%，捧着真经 92.46%'],
  [44, 51.5, '坑：藏经阁里要有假经，它照样一本正经念错'],
  [51.5, 58.5, '先查，再答。这就叫 RAG'],
  [58.5, 63, '下集：它为什么敢瞎编？'],
];

const Sub: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBS.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / 0.11) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1736, textAlign: 'center', padding: '0 52px' }}>
      {chars.map((ch, i) => (
        <span key={i} style={{
          fontFamily: FONT, fontSize: 44, fontWeight: 800, display: 'inline-block',
          color: i === n - 1 ? GOLD2 : (i < n ? CREAM : DIM),
          transform: i === n - 1 ? 'scale(1.1)' : 'scale(1)',
        }}>{ch}</span>
      ))}
    </div>
  );
};

const SE: [number, string, number][] = [
  [6, 'sfx/boom.wav', 0.95],
  [149, 'sfx/da.mp3', 0.9],
  [242, 'sfx/hit_1750.wav', 0.95],
  [371, 'sfx/dong.mp3', 0.9],
  [393, 'sfx/ding.mp3', 0.7],
  [522, 'sfx/whoosh.wav', 0.8],
  [610, 'sfx/da.mp3', 0.7],
  [720, 'sfx/whoosh.wav', 0.7],
  [930, 'sfx/ding.mp3', 0.7],
  [1470, 'sfx/da.mp3', 0.9],
  [1620, 'sfx/ding.mp3', 0.8],
];

const BOUNDS: [number, number][] = [[0, 135], [135, 216], [216, 315], [315, 450], [450, 675], [675, 900], [900, 1110], [1110, 1320], [1320, 1545], [1545, 1755], [1755, 1890]];

export const EP06V2: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < BOUNDS.length; i++) {
    if (frame < BOUNDS[i][1]) { seg = i; break; }
    seg = i;
  }
  const [b0, b1] = BOUNDS[seg];
  const dur = b1 - b0;
  const l = frame - b0;
  const SC = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10, Scene11];
  const DIRS2: [number, number][] = [[0, -1], [-1, 0], [1, 0], [0, -1], [-1, 0], [1, 0], [0, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
  const fromDir = DIRS2[seg];
  const inP = clamp01((l + 4) / 6);
  const outP = clamp01((l - (dur - 6)) / 10);
  const eIn = 1 - Math.pow(1 - inP, 3);
  const eOut = eio(outP);
  const dx = fromDir[0] * (1 - eIn) * 110 - fromDir[0] * eOut * 110;
  const dy = fromDir[1] * (1 - eIn) * 130 - fromDir[1] * eOut * 110;
  const Scene = SC[seg];
  return (
    <AbsoluteFill style={{ backgroundColor: NAVYB }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="32%" r="78%">
            <stop offset="0%" stopColor="#1B3048" />
            <stop offset="60%" stopColor="#122238" />
            <stop offset="100%" stopColor="#0D1B2A" />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill={'url(#bgGlow)'} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={'v' + i} x1={i * 90 + 45} y1={0} x2={i * 90 + 45} y2={1920} stroke={CYAN} strokeWidth={1} opacity={0.055} />
        ))}
        {Array.from({ length: 22 }, (_, i) => (
          <line key={'h' + i} x1={0} y1={i * 90 + 30} x2={1080} y2={i * 90 + 30} stroke={CYAN} strokeWidth={1} opacity={0.055} />
        ))}
        <circle cx={118} cy={268} r={6} fill={GOLD2} opacity={0.4} />
        <circle cx={962} cy={1668} r={5} fill={CYAN} opacity={0.35} />
        <circle cx={80} cy={1180} r={4} fill={CYAN} opacity={0.25} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${dx}px, ${dy}px)`, opacity: l < dur ? clamp01((l + 4) / 4) : 0 }}>
        <Scene f={frame} l={l} />
      </div>
      {SE.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={1} />
      <Sub t={t} />
      <div style={{ position: 'absolute', left: 54, top: 62 }}>
        <div style={{
          fontFamily: FONT, fontSize: 26, fontWeight: 800, color: CREAM,
          background: 'rgba(13,27,42,0.72)', border: '2px solid ' + DIM, borderRadius: 27, padding: '12px 26px',
        }}>AI 科普 · EP06</div>
      </div>
    </AbsoluteFill>
  );
};
