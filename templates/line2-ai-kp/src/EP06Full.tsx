/* ==========================================================================
 * EP06《RAG：先查资料再开口》· 竖屏 9:16 · 74.6秒
 * 底子 = EP05Full（白底 v8 规格）；骨架照抄，画面全换 RAG 主题
 * 铁律：不要 AI 配音，只留 BGM（bgm_midnight）；字幕逐字点亮（ep6fCues）
 * 数字：SimpleQA 38% -> 92.46%（You.com 官方，10/25 核实）
 * ========================================================================== */
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, staticFile, Audio } from 'remotion';
import { CUES, CHARS, charAt, TOTAL_FRAMES } from './ep6fCues';

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
const Scene1: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const push = 1 + 0.15 * (1 - Math.pow(1 - clamp01((l - 6) / 30), 3));
  const camS = push * (l >= 108 ? 1 + 0.05 * Math.max(0, 1 - (l - 108) / 6) : 1);
  const [shx, shy] = shake(l, 108, 8);
  const stamp = clamp01((l - 108) / 5);
  const gl = glitchOn(l, 108);
  const flash = whiteFlash(l, 108, 0.5);
  const wob = l >= 126 ? 1 + 0.012 * Math.sin((l - 126) / 5) : 1;
  const recoil = l >= 108 ? 1 - 0.09 * Math.max(0, 1 - (l - 108) / 9) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${shx}px, ${shy}px) scale(${camS})` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>你问：推荐一本讲独角兽的书？</text>
        {LIES.map(([x, y, s, d, side], i) => {
          const fly = eio(clamp01((l - d) / 9));
          const cx = x + (1 - fly) * side * 720;
          const cy = y + (1 - fly) * -60;
          const st = 1 + (1 - fly) * 0.4;
          return (
            <g key={i} opacity={clamp01(fly * 2.5)} transform={`translate(${cx} ${cy})`}>
              {(1 - fly) > 0.2 ? (
                <line x1={-side * 360} y1={-66} x2={-side * 150} y2={-66} stroke={BLUE} strokeWidth={5} strokeLinecap="round" opacity={1 - fly} />
              ) : null}
              <g transform={`scale(${st} 1)`}>
                <rect x={-195} y={-44} width={390} height={88} rx={20} fill="#FFFFFF" stroke={LINE} strokeWidth={3} />
                <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={NAVY}>{s}</text>
              </g>
            </g>
          );
        })}
        <g transform={`translate(540 1010) scale(${recoil})`}>
          <XiaoMo x={0} y={0} s={1.02 + 0.01 * Math.sin(f / 20)} mood={l < 108 ? 'cool' : 'shock'} f={f} />
        </g>
        {l >= 108 ? (
          <g transform={`translate(540 640) rotate(-13) scale(${slamS(l, 108) * wob})`} opacity={Math.min(1, stamp * 2)}>
            <rect x={-272} y={-72} width={544} height={144} rx={20} fill="none" stroke={RED} strokeWidth={14} />
            {gl ? (
              <>
                <text x={-5} y={24} textAnchor="middle" fontFamily={FONT} fontSize={74} fontWeight={900} fill={BLUE} opacity={0.85}>查无此书</text>
                <text x={5} y={24} textAnchor="middle" fontFamily={FONT} fontSize={74} fontWeight={900} fill={RED} opacity={0.9}>查无此书</text>
              </>
            ) : (
              <text x={0} y={24} textAnchor="middle" fontFamily={FONT} fontSize={74} fontWeight={900} fill={RED}>查无此书</text>
            )}
          </g>
        ) : null}
        {l >= 126 ? <circle cx={540} cy={640} r={310} fill="none" stroke={RED} strokeWidth={5} opacity={0.22 + 0.14 * Math.sin(f / 8)} /> : null}
        {flash > 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={flash} /> : null}
      </svg>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1130, textAlign: 'center',
        fontFamily: FONT, fontSize: 46, fontWeight: 900, color: RED,
        opacity: ez(l - 120, 12), transform: `scale(${(0.9 + 0.1 * pop(l, 120, 16)) * wob})`,
      }}>
        语气一点不虚
      </div>
    </div>
  );
};

/* ============================ 幕2 · 只会接龙，不会查资料 ============================ */
const CHAIN = ['从前…', '有一只…', '它住在…', '每天…', '吃…'];
const Scene2: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const spots: [number, number][] = [[190, 560], [520, 480], [850, 560], [520, 700], [190, 780]];
  const q = l >= 118 ? 1 + 0.06 * Math.sin((l - 118) / 5) : 0;
  const crossP = clamp01((l - 140) / 16);
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>它脑子里的真实流程</text>
        {CHAIN.map((s, i) => {
          const on = pop(l, 8 + i * 14, 14);
          const [x, y] = spots[i];
          const nx = spots[Math.min(i + 1, spots.length - 1)];
          const mx = (x + nx[0]) / 2 + (i % 2 === 0 ? 60 : -60);
          const my = Math.min(y, nx[1]) - 70;
          return (
            <g key={i}>
              {i < CHAIN.length - 1 ? (
                <path d={`M ${x} ${y} Q ${mx} ${my} ${nx[0]} ${nx[1]}`} fill="none" stroke={BLUE} strokeWidth={4}
                  strokeDasharray="10 8" opacity={ez(l - (16 + i * 14), 10) * 0.8} />
              ) : null}
              <g opacity={Math.min(1, on)} transform={`translate(${x} ${y}) scale(${0.4 + 0.6 * on})`}>
                <rect x={-110} y={-40} width={220} height={80} rx={16} fill={i % 2 === 0 ? '#FFFFFF' : BLUE} stroke={i % 2 === 0 ? LINE : BLUE} strokeWidth={3} />
                <text x={0} y={11} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={i % 2 === 0 ? NAVY : '#FFFFFF'}>{s}</text>
              </g>
            </g>
          );
        })}
        <g transform={`translate(870 900)`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={150} fontWeight={900} fill={RED} opacity={l >= 118 ? 1 : 0} transform={`scale(${q})`}>?</text>
        </g>
        <g transform={`translate(210 900)`} opacity={ez(l - 100, 12)}>
          <rect x={-90} y={-110} width={180} height={220} rx={14} fill={NAVY} />
          <rect x={-74} y={-94} width={148} height={188} rx={8} fill="#FFFFFF" />
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={-56} y={-70 + i * 34} width={112} height={10} rx={5} fill={LINE} />
          ))}
          {l >= 140 ? (
            <g opacity={crossP}>
              <line x1={-120} y1={-140} x2={120} y2={140} stroke={RED} strokeWidth={16} strokeLinecap="round" />
              <line x1={120} y1={-140} x2={-120} y2={140} stroke={RED} strokeWidth={16} strokeLinecap="round" />
            </g>
          ) : null}
        </g>
        <g transform={`translate(540 1120)`} opacity={ez(l - 155, 12)}>
          <rect x={-330} y={-52} width={660} height={104} rx={24} fill="#FFFFFF" stroke={RED} strokeWidth={5} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={NAVY}>
            只会接龙 <tspan fill={RED}>不会查资料</tspan>
          </text>
        </g>
      </svg>
    </>
  );
};

/* ============================ 幕3 · 先查，再答 ============================ */
const Scene3: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const slam = clamp01((l - 30) / 14);
  const slamS = 1.8 - 0.8 * (1 - Math.pow(1 - slam, 3));
  const ring = l >= 44 ? clamp01((l - 44) / 22) : 0;
  const sweep = clamp01(((l - 52) % 70) / 70);
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>办法特别简单</text>
        <g transform={`translate(540 620)`} opacity={ez(l - 8, 12)}>
          <circle cx={0} cy={0} r={86} fill="none" stroke={NAVY} strokeWidth={14} />
          <line x1={60} y1={60} x2={130} y2={130} stroke={NAVY} strokeWidth={18} strokeLinecap="round" />
          <line x1={-38} y1={-10} x2={38} y2={-10} stroke={BLUE} strokeWidth={8} strokeLinecap="round" opacity={0.8} />
          <line x1={-38} y1={16} x2={20} y2={16} stroke={BLUE} strokeWidth={8} strokeLinecap="round" opacity={0.5} />
        </g>
        <g transform={`translate(540 620)`} opacity={ez(l - 8, 12)}>
          <rect x={-330} y={-6} width={170} height={12} rx={6} fill={GOLD} transform={`translate(${-330 + 660 * sweep} 0)`} opacity={0.5} />
        </g>
        {l >= 30 ? (
          <g transform={`translate(540 1020) scale(${slamS})`}>
            <rect x={-360} y={-110} width={330} height={220} rx={28} fill={NAVY} />
            <text x={-195} y={22} textAnchor="middle" fontFamily={FONT} fontSize={110} fontWeight={900} fill="#FFFFFF">先查</text>
            <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontSize={90} fontWeight={900} fill={GREY} opacity={ez(l - 44, 10)}>→</text>
            <rect x={30} y={-110} width={330} height={220} rx={28} fill={GOLD} opacity={ez(l - 46, 12)} />
            <text x={195} y={22} textAnchor="middle" fontFamily={FONT} fontSize={110} fontWeight={900} fill={NAVY} opacity={ez(l - 46, 12)}>再答</text>
          </g>
        ) : null}
        {l >= 44 ? (
          <g opacity={1 - ring}>
            <circle cx={540} cy={1020} r={260 + 380 * ring} fill="none" stroke={GOLD} strokeWidth={10 - 6 * ring} />
          </g>
        ) : null}
        <text x={540} y={1300} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={GREY} opacity={ez(l - 80, 14)}>一个动作，治好瞎编</text>
      </svg>
    </>
  );
};

/* ============================ 传送带（幕4/5/6 共用画法） ============================ */
const Belt: React.FC<{ l: number; active: number }> = ({ l, active }) => (
  <g opacity={ez(l - 6, 12)}>
    {['检索', '拼接', '生成'].map((s, i) => (
      <g key={i} transform={`translate(${180 + i * 260} 1290)`}>
        <rect x={-100} y={-46} width={200} height={92} rx={20}
          fill={i === active ? GOLD : '#FFFFFF'} stroke={i === active ? GOLD : LINE} strokeWidth={4} />
        <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900}
          fill={i === active ? NAVY : GREY}>{s}</text>
        {i < 2 ? <text x={140} y={14} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={GREY}>→</text> : null}
      </g>
    ))}
  </g>
);

/* ============================ 幕4 · 检索 ============================ */
const Scene4: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const kws = ['独角兽', '书', '真假'];
  const flip = clamp01((l - 96) / 40);
  const hitP = clamp01((l - 136) / 16);
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>第一步 · 把问题变成关键词</text>
        <Belt l={l} active={0} />
        <g transform={`translate(230 700)`} opacity={ez(l - 10, 12)}>
          <rect x={-160} y={-64} width={320} height={128} rx={22} fill="#FFFFFF" stroke={LINE} strokeWidth={4} />
          <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={NAVY}>独角兽 存在吗</text>
        </g>
        {kws.map((k, i) => {
          const on = pop(l, 40 + i * 12, 14);
          return (
            <g key={i} opacity={Math.min(1, on)} transform={`translate(${430 + i * 10} ${480 + i * 120}) scale(${0.4 + 0.6 * on})`}>
              <rect x={-105} y={-42} width={210} height={84} rx={42} fill={BLUE} />
              <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill="#FFFFFF">{k}</text>
            </g>
          );
        })}
        <g transform={`translate(830 700)`}>
          <rect x={-120} y={-150} width={240} height={300} rx={16} fill={NAVY} opacity={ez(l - 70, 12)} />
          <rect x={-104} y={-134} width={208} height={268} rx={10} fill="#FFFFFF" opacity={ez(l - 70, 12)} />
          {Array.from({ length: 3 }, (_, i) => {
            const p = clamp01((flip - i * 0.3) / 0.3);
            const rx = -180 * Math.sin(p * Math.PI);
            return (
              <g key={i} opacity={ez(l - 70, 12)}>
                <rect x={-104} y={-120 + i * 86} width={208 * (0.4 + 0.6 * (1 - p))} height={66} rx={6} fill="#EAF1FA" transform={`translate(${rx} 0)`} />
              </g>
            );
          })}
          {l >= 136 ? (
            <g opacity={hitP}>
              <rect x={-104} y={-120} width={208} height={66} rx={6} fill={GOLD} opacity={0.85} />
              <rect x={-104} y={-34} width={208} height={66} rx={6} fill={GOLD} opacity={0.55} />
            </g>
          ) : null}
          <text x={0} y={210} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill={GREY} opacity={ez(l - 70, 12)}>知识库</text>
        </g>
        <path d="M 400 700 Q 600 560 700 680" fill="none" stroke={BLUE} strokeWidth={5} strokeDasharray="12 9"
          opacity={ez(l - 96, 12) * 0.9} />
        <text x={540} y={1140} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={NAVY} opacity={ez(l - 136, 12)}>
          命中那几页 <tspan fill={GOLD}>高亮</tspan>
        </text>
      </svg>
    </>
  );
};

/* ============================ 幕5 · 拼接 ============================ */
const Scene5: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const pages: [number, number, number][] = [[830, 620, 60], [830, 760, 78], [830, 900, 96]];
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>第二步 · 原样塞进上下文</text>
        <Belt l={l} active={1} />
        <g transform={`translate(540 860)`} opacity={ez(l - 8, 12)}>
          <rect x={-290} y={-230} width={580} height={460} rx={26} fill="#FFFFFF" stroke={BLUE} strokeWidth={5} strokeDasharray="16 10" />
          <text x={-250} y={-170} fontFamily={FONT} fontSize={36} fontWeight={900} fill={BLUE}>它的上下文</text>
        </g>
        {pages.map(([x0, y0, d], i) => {
          const p = clamp01((l - d) / 26);
          const e = 1 - Math.pow(1 - p, 3);
          const x = x0 + (520 - x0) * e;
          const y = y0 + (760 + i * 120 - y0) * e;
          const rot = (1 - e) * 24;
          return (
            <g key={i} opacity={Math.min(1, p * 2)} transform={`translate(${x} ${y}) rotate(${rot})`}>
              <rect x={-230} y={-52} width={460} height={104} rx={12} fill="#F4F8FD" stroke={LINE} strokeWidth={3} />
              <text x={-200} y={-16} fontFamily={FONT} fontSize={26} fontWeight={800} fill={GREY}>第 {i + 1} 页</text>
              <rect x={-200} y={0} width={360} height={10} rx={5} fill={LINE} />
              <rect x={-200} y={26} width={280} height={10} rx={5} fill={LINE} opacity={0.7} />
            </g>
          );
        })}
        <g transform={`translate(540 1360)`} opacity={ez(l - 130, 12)}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={NAVY}>
            摊在它眼前，<tspan fill={BLUE}>不许自己编</tspan>
          </text>
        </g>
      </svg>
    </>
  );
};

/* ============================ 幕6 · 生成 · 句句有出处 ============================ */
const Scene6: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const ans = '独角兽是传说生物，没有实物证据。';
  const cite = l >= 96;
  const citeP = clamp01((l - 96) / 14);
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>第三步 · 现在它开口了</text>
        <Belt l={l} active={2} />
        <g transform={`translate(540 760)`} opacity={ez(l - 24, 14)}>
          <rect x={-400} y={-110} width={800} height={220} rx={26} fill="#FFFFFF" stroke={NAVY} strokeWidth={6} />
          {ans.split('，').map((part, i, arr) => {
            const on = ez(l - (34 + i * 26), 10);
            return (
              <text key={i} x={-370} y={-20 + i * 66} fontFamily={FONT} fontSize={44} fontWeight={800} fill={NAVY} opacity={on}>
                {part}{i < arr.length - 1 ? '，' : ''}
              </text>
            );
          })}
          {['[1]', '[2]', '[3]'].map((c, i) => (
            <g key={i} opacity={cite ? citeP : 0} transform={`translate(${330 + (i % 2) * 40} ${-40 + i * 66}) scale(${0.5 + 0.5 * citeP})`}>
              <circle cx={0} cy={0} r={26} fill={GOLD} />
              <text x={0} y={9} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={900} fill={NAVY}>{c}</text>
            </g>
          ))}
        </g>
        {cite ? (
          <g opacity={citeP} transform={`translate(850 860)`}>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(0 ${(i - 1) * 120})`}>
                <rect x={-60} y={-70} width={120} height={140} rx={10} fill="#F4F8FD" stroke={GOLD} strokeWidth={4} />
                <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill={GOLD}>[{i + 1}]</text>
              </g>
            ))}
          </g>
        ) : null}
        <text x={540} y={1100} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={NAVY} opacity={ez(l - 120, 12)}>
          句句 <tspan fill={GOLD}>有出处</tspan>
        </text>
      </svg>
    </>
  );
};

/* ============================ 幕7 · 这叫 RAG（V2 冲击版） ============================ */
const Scene7: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const landed = l >= 40;
  const fall = clamp01(l / 40);
  const fallY = (1 - Math.pow(fall, 2.4)) * -1200;
  const landS = landed ? slamS(l, 40) : 1;
  const push = 1 + 0.14 * (1 - Math.pow(1 - clamp01((l - 2) / 24), 3));
  const camS = push * (landed ? 1 + 0.06 * Math.max(0, 1 - (l - 40) / 6) : 1);
  const [shx, shy] = shake(l, 40, 9);
  const gl = glitchOn(l, 40);
  const flash = whiteFlash(l, 40, 0.55);
  const ring = landed ? clamp01((l - 40) / 22) : 0;
  const burst = landed ? 1 - Math.pow(1 - clamp01((l - 40) / 10), 3) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${shx}px, ${shy}px) scale(${camS})` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2 + f * 0.02;
          return (
            <g key={i} opacity={burst}>
              <circle cx={540 + Math.cos(a) * 300 * burst} cy={860 + Math.sin(a) * 300 * burst} r={11} fill={i % 4 === 0 ? BLUE : GOLD} />
              <circle cx={540 + Math.cos(a + 0.13) * 366 * burst} cy={860 + Math.sin(a + 0.13) * 366 * burst} r={7} fill={i % 3 === 0 ? BLUE : GOLD} opacity={0.7} />
            </g>
          );
        })}
        {!landed ? (
          <>
            <text x={540} y={905} transform={`translate(0 ${fallY + 180})`} textAnchor="middle" fontFamily={FONT} fontSize={230} fontWeight={900} fill={NAVY} opacity={0.22}>RAG</text>
            <text x={540} y={905} transform={`translate(0 ${fallY + 380})`} textAnchor="middle" fontFamily={FONT} fontSize={230} fontWeight={900} fill={NAVY} opacity={0.1}>RAG</text>
          </>
        ) : null}
        <g transform={`translate(540 830) scale(${landS}) translate(-540 -830) translate(0 ${fallY})`}>
          {gl ? (
            <>
              <text x={532} y={905} textAnchor="middle" fontFamily={FONT} fontSize={230} fontWeight={900} fill={BLUE} opacity={0.85}>RAG</text>
              <text x={548} y={905} textAnchor="middle" fontFamily={FONT} fontSize={230} fontWeight={900} fill={RED} opacity={0.9}>RAG</text>
            </>
          ) : (
            <text x={540} y={905} textAnchor="middle" fontFamily={FONT} fontSize={230} fontWeight={900} fill={NAVY} letterSpacing={-6}>RAG</text>
          )}
        </g>
        {landed ? (
          <g opacity={1 - ring}>
            <circle cx={540} cy={860} r={220 + 420 * ring} fill="none" stroke={GOLD} strokeWidth={8 - 5 * ring} />
            <circle cx={540} cy={860} r={150 + 300 * ring} fill="none" stroke={BLUE} strokeWidth={5 - 3 * ring} opacity={0.7} />
          </g>
        ) : null}
        <text x={540} y={1120} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GREY} opacity={ez(l - 60, 14)}>
          Retrieval-Augmented Generation
        </text>
        <text x={540} y={1210} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={900} fill={NAVY} opacity={ez(l - 76, 14)}>
          检索增强生成
        </text>
        <g transform={`translate(540 1370)`} opacity={ez(l - 96, 14)}>
          <rect x={-330} y={-52} width={660} height={104} rx={24} fill="#FFFFFF" stroke={GOLD} strokeWidth={5} />
          <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={NAVY}>
            给 AI 配个 <tspan fill={GOLD}>外置大脑</tspan>
          </text>
        </g>
        {flash > 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={flash} /> : null}
      </svg>
    </div>
  );
};

/* ============================ 幕8 · 不查 38% vs 查了 92% ============================ */
const Scene8: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const c1 = clamp01((l - 14) / 60);
  const v1 = Math.round(38 * (1 - Math.pow(1 - c1, 3)));
  const c2 = clamp01((l - 92) / 46);
  const v2 = Math.round(92 * (1 - Math.pow(1 - c2, 3)));
  const landed = l >= 138;
  const ring = landed ? clamp01((l - 138) / 22) : 0;
  const pulse = landed ? 1 + 0.1 * Math.sin(Math.min(1, (l - 138) / 14) * Math.PI) : 1;
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>同一套题 · 答对率</text>
        <line x1={140} y1={1160} x2={940} y2={1160} stroke={LINE} strokeWidth={6} opacity={ez(l - 8, 12)} />
        <rect x={230} y={1160 - 520 * c1} width={180} height={520 * c1} rx={14} fill={GREY} opacity={0.75} />
        <rect x={600} y={1160 - 560 * c2} width={220} height={560 * c2} rx={14} fill={GOLD} />
        <text x={320} y={1080 - 520 * c1} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={GREY}>{v1}%</text>
        <text x={710} y={1090 - 560 * c2} textAnchor="middle" fontFamily={FONT} fontSize={landed ? 130 : 76} fontWeight={900} fill={NAVY} transform={`translate(710 0) scale(${pulse}) translate(-710 0)`}>{v2}%</text>
        {landed ? (
          <g opacity={1 - ring}>
            <circle cx={710} cy={600} r={200 + 380 * ring} fill="none" stroke={GOLD} strokeWidth={8 - 5 * ring} />
          </g>
        ) : null}
        <text x={320} y={1240} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={GREY} opacity={ez(l - 10, 12)}>不查资料</text>
        <text x={710} y={1240} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={NAVY} opacity={ez(l - 88, 12)}>先查再答</text>
        <text x={540} y={1360} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={RED} opacity={ez(l - 150, 14)}>差出两倍半</text>
      </svg>
    </>
  );
};

/* ============================ 幕9 · 实测来源 ============================ */
const Scene9: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const rise = ez(l - 10, 16);
  const stamp = clamp01((l - 110) / 14);
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`translate(540 ${900 + (1 - rise) * 140})`} opacity={rise}>
          <rect x={-400} y={-300} width={800} height={600} rx={30} fill="#FFFFFF" stroke={NAVY} strokeWidth={6} />
          <rect x={-400} y={-300} width={800} height={92} rx={30} fill={NAVY} opacity={0.92} />
          <text x={0} y={-240} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill="#FFFFFF">SimpleQA 基准实测</text>
          <text x={-350} y={-130} fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY}>不查资料的模型</text>
          <text x={-350} y={-60} fontFamily={FONT} fontSize={72} fontWeight={900} fill={GREY}>38%</text>
          <text x={0} y={-70} textAnchor="middle" fontFamily={FONT} fontSize={60} fontWeight={900} fill={BLUE}>→</text>
          <text x={350} y={-130} textAnchor="end" fontFamily={FONT} fontSize={40} fontWeight={800} fill={NAVY}>带上检索再答</text>
          <text x={350} y={-56} textAnchor="end" fontFamily={FONT} fontSize={72} fontWeight={900} fill={NAVY}>92.46%</text>
          <line x1={-350} y1={-10} x2={350} y2={-10} stroke={LINE} strokeWidth={4} />
          <text x={-350} y={70} fontFamily={FONT} fontSize={34} fontWeight={800} fill={GREY}>来源：You.com 官方 · SimpleQA</text>
          <text x={-350} y={130} fontFamily={FONT} fontSize={34} fontWeight={800} fill={GREY}>OpenAI 公开基准 · 2026-10 核实</text>
          <text x={-350} y={210} fontFamily={FONT} fontSize={34} fontWeight={800} fill={GREY}>独立答对率翻了一倍多</text>
        </g>
        <g transform={`translate(760 1240) rotate(-10)`} opacity={stamp}>
          <rect x={-210} y={-52} width={420} height={104} rx={16} fill="none" stroke={GREEN} strokeWidth={10} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GREEN}>数字当天核实 ✓</text>
        </g>
      </svg>
    </>
  );
};

/* ============================ 幕10 · 坑：垃圾进垃圾出 ============================ */
const Scene10: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const p = clamp01((l - 96) / 16);
  const bigP = clamp01((l - 128) / 16);
  const bigS = 2.2 - 1.2 * (1 - Math.pow(1 - bigP, 3));
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={RED} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>坑说清楚</text>
        <g transform={`translate(230 640)`} opacity={ez(l - 10, 12)}>
          <rect x={-110} y={-140} width={220} height={280} rx={16} fill={NAVY} />
          <rect x={-94} y={-124} width={188} height={248} rx={10} fill="#FFFFFF" />
          <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900} fill={RED}>错✗</text>
          <text x={0} y={190} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={GREY}>印错的知识库</text>
        </g>
        <path d="M 360 640 Q 540 560 660 620" fill="none" stroke={RED} strokeWidth={5} strokeDasharray="12 9" opacity={ez(l - 50, 12)} />
        <g transform={`translate(540 660)`} opacity={ez(l - 60, 12)}>
          <rect x={-190} y={-70} width={380} height={140} rx={22} fill="#FFFFFF" stroke={RED} strokeWidth={6} />
          <text x={0} y={-10} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={NAVY}>地心是平的</text>
          <text x={0} y={44} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={RED}>来源 [1] ✓</text>
        </g>
        <g transform={`translate(540 1000)`} opacity={p}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={NAVY}>它照样 <tspan fill={RED}>一本正经地错</tspan></text>
        </g>
        <g transform={`translate(540 1330) rotate(-6)`} opacity={bigP}>
          <g transform={`scale(${bigS})`}>
            <rect x={-360} y={-84} width={720} height={168} rx={22} fill="none" stroke={RED} strokeWidth={14} />
            <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontSize={78} fontWeight={900} fill={RED}>垃圾进 垃圾出</text>
          </g>
        </g>
      </svg>
    </>
  );
};

/* ============================ 幕11 · 金句收尾 ============================ */
const Scene11: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const slam = clamp01((l - 16) / 14);
  const slamS = 1.7 - 0.7 * (1 - Math.pow(1 - slam, 3));
  const ring = l >= 30 ? clamp01((l - 30) / 24) : 0;
  const pulse = l >= 30 ? 1 + 0.06 * Math.sin((l - 30) / 7) : 1;
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`translate(540 830) scale(${slamS * pulse})`}>
          <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontSize={170} fontWeight={900} fill={NAVY} letterSpacing={-2}>先查再答</text>
        </g>
        {l >= 30 ? (
          <g opacity={1 - ring}>
            <circle cx={540} cy={800} r={280 + 420 * ring} fill="none" stroke={GOLD} strokeWidth={9 - 5 * ring} />
          </g>
        ) : null}
        <text x={540} y={1060} textAnchor="middle" fontFamily={FONT} fontSize={60} fontWeight={900} fill={GREY} opacity={ez(l - 60, 14)}>
          AI 就 <tspan fill={GREEN}>不瞎编了</tspan>
        </text>
        <g transform={`translate(540 1290)`} opacity={ez(l - 100, 14)}>
          <rect x={-300} y={-48} width={600} height={96} rx={24} fill="#FFFFFF" stroke={LINE} strokeWidth={4} />
          <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={NAVY}>
            治瞎编第一味药 · <tspan fill={GOLD}>检索增强生成</tspan>
          </text>
        </g>
      </svg>
    </>
  );
};

/* ============================ 幕12 · 下集预告 ============================ */
const Scene12: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const on = ez(l - 10, 14);
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <text x={540} y={700} textAnchor="middle" fontFamily={FONT} fontSize={220} fontWeight={900} fill={RED} opacity={0.12}>？</text>
        <g transform={`translate(540 830)`} opacity={on}>
          <rect x={-440} y={-90} width={880} height={180} rx={30} fill={NAVY} />
          <text x={0} y={-6} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={GOLD}>下集</text>
          <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={800} fill="#FFFFFF">它为什么会一本正经地胡说</text>
        </g>
        <g transform={`translate(540 1160)`}>
          <XiaoMo x={0} y={0} s={1.0 + 0.012 * Math.sin(f / 18)} mood={l >= 20 ? 'shock' : 'none'} f={f} />
        </g>
      </svg>
    </>
  );
};
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
const TINTS = ['#E8F0FF', '#E9F7EF', '#FFF6E0', '#FDECEC', '#E8F0FF', '#E9F7EF', '#FFF6E0', '#FDECEC', '#E8F0FF', '#E9F7EF', '#E9F7EF', '#FFF6E0'];

export const EP6F_FRAMES = TOTAL_FRAMES;

export const EP06F: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < CUES.length; i++) {
    seg = i;
    if (t < CUES[i].end) break;
  }
  const spot = LAOJIA_SPOTS[seg] ?? LAOJIA_SPOTS[0];
  const tint = TINTS[seg] ?? '#E8F0FF';
  const S = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10, Scene11, Scene12];
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
      {/* BGM 从 5.63s 起播，落点对齐幕7「RAG」巨字（69.9s+1.2s≈71s）与幕8「92%」落定（69.9+4.6s≈74.5s 不溢出即可） */}
      <Audio src={staticFile('bgm_midnight.m4a')} startFrom={169} volume={1} />
    </AbsoluteFill>
  );
};
