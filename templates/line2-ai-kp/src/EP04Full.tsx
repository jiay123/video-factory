/* =============================================================================
 * EP04《Agent 是怎么转圈的》· 竖屏 9:16 · 60秒正式版
 * 对标：Arthur Katcher《40秒讲清 coding agent 怎么工作》(2026-09-27)
 * 合流：他的骨架（一幕一个点/拍点卡刀/贯穿线索）+ 我们的血肉（竖屏/老贾IP/逐字字幕/男声）
 * 老贾 10/21 拍板：小模 → 换成「模型」本体；配音改男声+响度加大
 * ============================================================================= */
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, staticFile, Audio } from 'remotion';
import { CUES, CHARS, charAt } from './ep4fChars';

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
}> = ({ x, y, s, mood, f, rot = 0, hat = 'none', flip = false, blueFace = false }) => {
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
  { x: 870, y: 1425, s: 0.76, mode: 'catch' },
  { x: 185, y: 1425, s: 0.80, mode: 'present' },
  { x: 150, y: 1440, s: 0.72, mode: 'point' },
  { x: 880, y: 1400, s: 0.80, mode: 'cheer' },
];

/* ---------------- 顶部固定徽章 ---------------- */
const Badge: React.FC<{ f: number }> = ({ f }) => {
  const p = pop(f, 4, 14);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <g opacity={ez(f - 4, 8)} transform={`translate(54 62) scale(${p})`}>
        <rect x={0} y={0} width={252} height={54} rx={27} fill={NAVY} opacity={0.88} />
        <text x={126} y={37} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#FFFFFF">AI 科普 · EP04</text>
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

/* ============================ 幕1 · 一句话 ============================ */
const Scene1: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const spot0 = LAOJIA_SPOTS[0];
  const mouth = mouthOf(spot0.x, spot0.y, spot0.s);
  const fly = flyP(f, 34, mouth, { x: 540, y: 940 });
  const CMD = '帮我改这个 bug';
  const typed = clamp01((t - 0.9) / 0.7);
  const nTyped = Math.floor(typed * CMD.length + 0.0001);
  const up = clamp01((t - 1.75) / 0.6);
  const upE = eio(up);
  const cardY = lerp(1180, 330, upE);
  const cardS = lerp(1, 0.72, upE);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      {fly ? (
        <g transform={`translate(${fly.x} ${fly.y}) scale(${fly.s})`} opacity={fly.o}>
          <rect x={-150} y={-46} width={300} height={92} rx={46} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} />
          <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={BLUE}>一句话</text>
        </g>
      ) : null}
      <g transform={`translate(540 ${cardY}) scale(${cardS})`} opacity={ez(f - 26, 10)}>
        <rect x={-300} y={-70} width={600} height={140} rx={22} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} />
        <rect x={-300} y={-70} width={10} height={140} rx={5} fill={BLUE} />
        <text x={-260} y={16} fontFamily={FONT} fontSize={46} fontWeight={800} fill={NAVY}>
          {CMD.slice(0, nTyped)}<tspan fill={BLUE}>▌</tspan>
        </text>
      </g>
      <g opacity={ez(f - 68, 10)}>
        <rect x={190} y={250} width={700} height={160} rx={20} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} opacity={0.95} />
        <rect x={190} y={250} width={700} height={46} rx={20} fill={NAVY} opacity={0.12} />
        <circle cx={228} cy={273} r={9} fill={RED} />
        <circle cx={258} cy={273} r={9} fill={GOLD} />
        <circle cx={288} cy={273} r={9} fill={GREEN} />
        <text x={540} y={368} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY}>你的任务</text>
      </g>
      <g opacity={ez(f - 96, 12)}>
        <ModelCore x={880} y={860} s={0.58} f={f} label="收到" mood="cool" />
      </g>
    </svg>
  );
};

/* ============================ 幕2 · 记忆条 ============================ */
const FILES = ['main.py', 'README', 'test_api', 'config.yaml', 'a/b/c.py', 'package.json'];
const Scene2: React.FC<{ f: number; t: number; tRel: number }> = ({ f, t, tRel }) => {
  const fill = clamp01((tRel - 0.5) / 4.4);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <g opacity={ez(f - 4, 10)}>
        <MemoryBar x={140} y={280} w={800} h={78} fill={fill} f={f} tint={BLUE} label="记忆条 · CONTEXT" />
        <MemoryBar x={140} y={390} w={800} h={78} fill={fill * 0.78} f={f} tint={GOLD} label="" />
        <MemoryBar x={140} y={500} w={800} h={78} fill={fill * 0.55} f={f} tint={GREEN} label="" />
        {FILES.map((fn, i) => {
          const at = 0.65 + i * 0.19;
          const p = clamp01((t - at) / 0.5);
          const e = eio(p);
          const fromX = 120 + rand(i * 7.7) * 840;
          const fromY = 520 + rand(i * 3.3) * 560;
          const x = lerp(fromX, 180 + i * 118, e);
          const y = lerp(fromY, 319, e);
          const rot = lerp((rand(i * 5.1) - 0.5) * 60, 0, e);
          return (
            <g key={fn} transform={`translate(${x} ${y}) rotate(${rot}) scale(${lerp(0.6, 1, e)})`} opacity={p > 0 ? 1 : 0}>
              <rect x={-52} y={-32} width={104} height={64} rx={10} fill="#FFFFFF" stroke={NAVY} strokeWidth={4} />
              <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontSize={20} fontWeight={800} fill={NAVY}>{fn.slice(0, 9)}</text>
            </g>
          );
        })}
      </g>
      <g opacity={ez(f - 12, 12)}>
        <ModelCore x={880} y={780} s={0.62} f={f} mood="serious" />
        <text x={880} y={960} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={800} fill={NAVY}>等着开工</text>
      </g>
    </svg>
  );
};

/* ============================ 幕3 · 模型拍板 ============================ */
const Scene3: React.FC<{ f: number; t: number; tRel: number }> = ({ f, t, tRel }) => {
  const grow = ez(tRel * 30 - 6, 16);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <g opacity={ez(f - 2, 12)}>
        <MemoryBar x={140} y={280} w={800} h={78} fill={1} f={f} tint={BLUE} label="记忆条 · 满了" />
        <MemoryBar x={140} y={390} w={800} h={78} fill={1} f={f} tint={GOLD} label="" />
        <MemoryBar x={140} y={500} w={800} h={78} fill={1} f={f} tint={GREEN} label="" />
      </g>
      <g transform={`translate(540 900) scale(${lerp(0.5, 1, grow)})`} opacity={grow}>
        <ModelCore x={0} y={0} s={1.15} f={f} mood="proud" />
      </g>
      <g opacity={ez(f - 46, 12)}>
        <rect x={290} y={1240} width={500} height={90} rx={45} fill={NAVY} />
        <text x={540} y={1298} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill="#FFFFFF">真正拍板的是它</text>
      </g>
    </svg>
  );
};

/* ============================ 幕4 · 模型不动手 ============================ */
const Scene4: React.FC<{ f: number; t: number; tRel: number }> = ({ f, t, tRel }) => {
  const tDong = charAt(3, '调');
  const tYong = charAt(3, '要');
  const drop = tDong > 0 ? clamp01((t - (tDong - 0.6)) / 0.5) : 0;
  const e = eio(drop);
  const toolY = lerp(420, 1120, e);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <ModelCore x={330} y={880} s={0.9} f={f} mood="neutral" />
      <g opacity={ez(tRel * 30 - 4, 10)}>
        <rect x={620} y={760} width={330} height={230} rx={26} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} />
        <text x={785} y={880} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={NAVY}>外面那层</text>
        <text x={785} y={935} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={700} fill={GREY}>真正干活的</text>
      </g>
      {/* 模型吐出的工具 */}
      <g transform={`translate(540 ${toolY}) scale(${lerp(0.6, 1, e)}) rotate(${lerp(-20, 0, e)})`} opacity={e}>
        <rect x={-120} y={-80} width={240} height={160} rx={24} fill={GOLD} stroke={NAVY} strokeWidth={5} />
        <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={NAVY}>工具</text>
      </g>
      {tYong > 0 ? (
        <g opacity={ez(f - (tYong - 0.5) * 30, 10)}>
          <rect x={180} y={1180} width={300} height={70} rx={35} fill="#FFFFFF" stroke={BLUE} strokeWidth={4} />
          <text x={330} y={1228} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={BLUE}>我要调工具</text>
        </g>
      ) : null}
    </svg>
  );
};

/* ============================ 幕5 · 转圈（核心） ============================ */
const NODES = [
  { label: '想', x: 540, y: 610, c: BLUE },
  { label: '调工具', x: 810, y: 880, c: GOLD },
  { label: '看结果', x: 540, y: 1150, c: GREEN },
  { label: '再想', x: 270, y: 880, c: RED },
];
const LAPS = 4;
const Scene5: React.FC<{ f: number; t: number; tRel: number; dur: number }> = ({ f, t, tRel, dur }) => {
  const cx = 540, cy = 880, r = 270;
  const p = clamp01((tRel - 0.2) / (dur - 0.2));
  const ang = -Math.PI / 2 + p * LAPS * Math.PI * 2;
  const mx = cx + Math.cos(ang) * r;
  const my = cy + Math.sin(ang) * r;
  const cur = Math.floor(p * LAPS) % LAPS;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <g opacity={ez(f - 4, 12)}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={LINE} strokeWidth={10} strokeDasharray="18 16" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={BLUE} strokeWidth={4} opacity={0.35} />
      </g>
      {NODES.map((n, i) => {
        const on = i === cur && p > 0.001;
        const sc = on ? pop(f, 0, 12) : 1;
        return (
          <g key={n.label} transform={`translate(${n.x} ${n.y}) scale(${sc})`}>
            <rect x={-78} y={-42} width={156} height={84} rx={20} fill={on ? n.c : '#FFFFFF'} stroke={n.c} strokeWidth={5} />
            <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={on ? '#FFFFFF' : n.c}>{n.label}</text>
          </g>
        );
      })}
      {/* 轨道上跑的「模型」本体（不是小模） */}
      <ModelCore x={mx} y={my} s={0.5} f={f} label="" mood="happy" />
      <g opacity={ez(f - 14, 10)}>
        <rect x={330} y={1320} width={420} height={80} rx={40} fill={NAVY} />
        <text x={540} y={1372} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill="#FFFFFF">转 4 圈</text>
      </g>
    </svg>
  );
};

/* ============================ 幕6 · 越转越满 ============================ */
const Scene6: React.FC<{ f: number; t: number; tRel: number }> = ({ f, t, tRel }) => {
  const over = clamp01((tRel - 0.6) / 1.6);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <g opacity={ez(f - 4, 10)}>
        <MemoryBar x={90} y={280} w={900} h={88} fill={1 + over * 0.12} hot={over > 0.4} f={f} tint={BLUE} label="记忆条" />
        <MemoryBar x={90} y={400} w={900} h={88} fill={1 + over * 0.1} hot={over > 0.4} f={f} tint={GOLD} label="" />
        <MemoryBar x={90} y={520} w={900} h={88} fill={1 + over * 0.08} hot={over > 0.4} f={f} tint={GREEN} label="" />
      </g>
      <g opacity={ez(f - 24, 12)}>
        <rect x={210} y={620} width={660} height={120} rx={30} fill={over > 0.4 ? '#FFE3E1' : '#FFFFFF'} stroke={over > 0.4 ? RED : NAVY} strokeWidth={5} />
        <text x={540} y={697} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={over > 0.4 ? RED : NAVY}>
          {over > 0.4 ? '塞不下了！' : '你给的上下文不够用'}
        </text>
      </g>
      <g opacity={ez(f - 64, 12)}>
        <ModelCore x={540} y={1050} s={0.7} f={f} hot={over > 0.4} label="转得越多" mood="choke" />
      </g>
    </svg>
  );
};

/* ============================ 幕7 · 自动压缩 ============================ */
const Scene7: React.FC<{ f: number; t: number; tRel: number }> = ({ f, t, tRel }) => {
  const p = clamp01((tRel - 0.4) / 1.2);
  const e = eio(p);
  const barW = lerp(900, 240, e);
  const barH = lerp(110, 66, e);
  const barY = lerp(300, 320, e);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <g opacity={ez(f - 4, 10)}>
        <text x={90} y={barY - 24} fontFamily={FONT} fontSize={32} fontWeight={800} fill={NAVY}>记忆条</text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={90} y={barY + i * 40} width={barW} height={32} rx={11} fill="#FFFFFF" stroke={NAVY} strokeWidth={4} />
            <rect x={95} y={barY + i * 40 + 5} width={Math.max(0, barW - 10)} height={22} rx={9} fill={[BLUE, GOLD, GREEN][i]} opacity={0.32} />
          </g>
        ))}
        {e > 0.7 ? (
          <g opacity={(e - 0.7) / 0.3}>
            <rect x={90 + barW + 20} y={barY + 6} width={200} height={54} rx={27} fill={GREEN} />
            <text x={90 + barW + 120} y={barY + 44} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={900} fill="#FFFFFF">摘要</text>
          </g>
        ) : null}
      </g>
      <g opacity={ez(f - 34, 12)}>
        <rect x={230} y={620} width={620} height={120} rx={30} fill="#FFFFFF" stroke={GREEN} strokeWidth={5} />
        <text x={540} y={697} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={GREEN}>老资料压成摘要</text>
      </g>
      <g opacity={ez(f - 64, 12)}>
        <ModelCore x={540} y={1010} s={0.68} f={f} label="接着转" mood="worried" />
      </g>
    </svg>
  );
};

/* ============================ 幕8 · 拿不准问你 ============================ */
const Scene8: React.FC<{ f: number; t: number; tRel: number }> = ({ f, t, tRel }) => {
  const ask = charAt(7, '拿');
  const p = ask > 0 ? clamp01((t - (ask - 0.5)) / 0.5) : 0;
  const e = eio(p);
  const ok = clamp01((t - (ask + 1.6)) / 0.5);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <g opacity={ez(tRel * 30 - 4, 10)}>
        <circle cx={540} cy={880} r={230} fill="none" stroke={LINE} strokeWidth={9} strokeDasharray="16 14" />
        <g transform="translate(540 880) scale(-1 1) translate(-540 -880)">
          <ModelCore x={540} y={880} s={0.62} f={f} label="" mood="worried" />
        </g>
      </g>
      {/* 问号卡：从小模冒出来，飞向左下老贾（观众要看出"小模在问老贾"） */}
      <g transform={`translate(${lerp(540, 300, e)} ${lerp(880, 1230, e)}) scale(${lerp(0.4, 1, e)})`} opacity={e}>
        <rect x={-120} y={-90} width={240} height={180} rx={28} fill={GOLD} stroke={NAVY} strokeWidth={5} />
        <text x={0} y={44} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={NAVY}>?</text>
      </g>
      {/* 问号飞过去的轨迹箭头（点明方向） */}
      <g opacity={e * 0.55}>
        <path d={`M 470 1010 Q 400 1130 320 1210`} stroke={GOLD} strokeWidth={7} fill="none" strokeDasharray="16 14" strokeLinecap="round" />
      </g>
      {/* 老贾小人回应 */}
      <g opacity={ez(tRel * 30 - 14, 12)}>
        <g transform={`translate(${lerp(225, 470, eio(ok))} ${lerp(1400, 1210, eio(ok))}) scale(${lerp(0.6, 1, eio(ok))})`} opacity={eio(ok)}>
          <rect x={-140} y={-44} width={280} height={88} rx={44} fill="#FFFFFF" stroke={GREEN} strokeWidth={5} />
          <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={GREEN}>OK 继续</text>
        </g>
      </g>
    </svg>
  );
};

/* ============================ 幕9 · 对比 ============================ */
const Scene9: React.FC<{ f: number; t: number; tRel: number }> = ({ f, t, tRel }) => {
  const p = clamp01((tRel - 1.0) / 1.2);
  const e = eio(p);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      {/* 左：ChatGPT */}
      <g opacity={ez(f - 4, 12)}>
        <rect x={90} y={560} width={420} height={560} rx={28} fill="#FFFFFF" stroke={GREY} strokeWidth={5} />
        <rect x={90} y={560} width={420} height={86} rx={28} fill={GREY} opacity={0.25} />
        <text x={300} y={618} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill={NAVY}>ChatGPT</text>
        <rect x={140} y={700} width={320} height={80} rx={20} fill="#E9EEF6" />
        <text x={300} y={752} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={700} fill={NAVY}>答一句</text>
        <rect x={140} y={820} width={320} height={80} rx={20} fill="#E9EEF6" />
        <text x={300} y={872} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={700} fill={NAVY}>停</text>
        <g transform={`translate(300 1010) scale(${lerp(0.5, 1, e)})`} opacity={e}>
          <circle cx={0} cy={0} r={54} fill="#E9EEF6" stroke={GREY} strokeWidth={4} />
          <line x1={-22} y1={0} x2={22} y2={0} stroke={GREY} strokeWidth={8} strokeLinecap="round" />
        </g>
        <text x={300} y={1090} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={GREY}>等你再问一句</text>
      </g>
      {/* 右：Agent */}
      <g opacity={ez(f - 14, 12)}>
        <rect x={570} y={560} width={420} height={560} rx={28} fill="#FFFFFF" stroke={BLUE} strokeWidth={5} />
        <rect x={570} y={560} width={420} height={86} rx={28} fill={BLUE} opacity={0.22} />
        <text x={780} y={618} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill={BLUE}>Agent</text>
        {[0, 1, 2, 3].map((i) => {
          const on = e > i * 0.22;
          return (
            <g key={i} opacity={on ? 1 : 0.2}>
              <rect x={620} y={700 + i * 92} width={320} height={70} rx={18} fill={on ? '#E6F0FF' : '#EEF2F7'} stroke={on ? BLUE : LINE} strokeWidth={3} />
              <text x={780} y={748 + i * 92} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={700} fill={NAVY}>
                {['自己读文件', '自己改代码', '自己跑测试', '跑完再报'][i]}
              </text>
            </g>
          );
        })}
        <g transform={`translate(780 1080) scale(${lerp(0.5, 1, e)})`} opacity={e}>
          <circle cx={0} cy={0} r={54} fill={GREEN} />
          <path d="M -24 2 L -6 22 L 26 -18" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text x={780} y={1100 - 116} textAnchor="middle" fontFamily={FONT} fontSize={0} fill={BLUE}> </text>
      </g>
      <g opacity={ez(f - 24, 12)}>
        <text x={540} y={1250} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={NAVY}>一个等你问，一个自己干</text>
      </g>
    </svg>
  );
};

/* ============================ 幕10 · 结论 ============================ */
const Scene10: React.FC<{ f: number; t: number; tRel: number }> = ({ f, t, tRel }) => {
  const spot9 = LAOJIA_SPOTS[9];
  const mouth = mouthOf(spot9.x, spot9.y, spot9.s);
  const tHui = charAt(9, '会');
  const tGuan = charAt(9, '关');
  const flyThesis = tHui > 0 ? flyP(f, (tHui + 0.85) * 30, mouth, { x: 420, y: 880 }) : null;
  const flyChip = tGuan > 0 ? flyP(f, (tGuan + 0.85) * 30, mouth, { x: 420, y: 1160 }, 12, 12) : null;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <g opacity={ez(tRel * 30 - 4, 12)}>
        <circle cx={540} cy={880} r={200} fill="none" stroke={BLUE} strokeWidth={8} opacity={0.5} />
        <g transform={`translate(540 880) rotate(${t * 40})`}>
          <circle cx={0} cy={0} r={150} fill="none" stroke={BLUE} strokeWidth={4} strokeDasharray="24 16" opacity={0.5} />
        </g>
        <ModelCore x={540} y={880} s={0.7} f={f} mood="proud" />
      </g>
      <g opacity={ez(tRel * 30 - 4, 10)}>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={790} y={290 + i * 36} width={230} height={30} rx={11} fill="#FFFFFF" stroke={NAVY} strokeWidth={4} />
            <rect x={795} y={295 + i * 36} width={220} height={20} rx={8} fill={[BLUE, GOLD, GREEN][i]} opacity={0.32} />
          </g>
        ))}
        <text x={790} y={275} fontFamily={FONT} fontSize={26} fontWeight={800} fill={GREY}>记忆条</text>
      </g>
      {flyThesis ? (
        <g transform={`translate(${flyThesis.x} ${flyThesis.y}) scale(${flyThesis.s})`} opacity={flyThesis.o}>
          <rect x={-290} y={-54} width={580} height={108} rx={26} fill={BLUE} />
          <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontSize={50} fontWeight={900} fill="#FFFFFF">会自己转圈的模型</text>
        </g>
      ) : null}
      {flyChip ? (
        <g transform={`translate(${flyChip.x} ${flyChip.y}) scale(${flyChip.s})`} opacity={flyChip.o}>
          <rect x={-250} y={-46} width={500} height={92} rx={46} fill="#FFFFFF" stroke={GREEN} strokeWidth={6} />
          <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GREEN}>关注我 火柴人老贾</text>
        </g>
      ) : null}
      {/* 下一集预告（EP05 参数量 · 老贾 10/21 要钩子） */}
      {tGuan > 0 ? (
        <g opacity={ez(f - (tGuan + 1.5) * 30, 12)}>
          <rect x={140} y={1300} width={580} height={78} rx={39} fill="#0A2540" opacity={0.92} />
          <text x={430} y={1350} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill="#FFD60A">下一集 · 它到底有多少个旋钮？</text>
        </g>
      ) : null}
    </svg>
  );
};

/* ============================ 主组件 ============================ */
export const EP04F: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < CUES.length; i++) {
    seg = i;
    if (t < CUES[i].end) break;
  }
  const tRel = t - (CUES[seg]?.start ?? 0);
  const spot = LAOJIA_SPOTS[seg] ?? LAOJIA_SPOTS[0];
  const tint = ['#E8F0FF', '#E9F7EF', '#FFF6E0', '#FDECEC', '#E8F0FF', '#FDECEC', '#E9F7EF', '#FFF6E0', '#E8F0FF', '#E9F7EF'][seg] ?? '#E8F0FF';
  const s0 = (i: number) => (CUES[i]?.start ?? 0);
  const s1 = (i: number) => (CUES[i]?.end ?? 0);
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Backdrop tint={tint} f={frame} />
      {seg === 0 ? <Scene1 f={frame} t={t} /> : null}
      {seg === 1 ? <Scene2 f={frame} t={t} tRel={tRel} /> : null}
      {seg === 2 ? <Scene3 f={frame} t={t} tRel={tRel} /> : null}
      {seg === 3 ? <Scene4 f={frame} t={t} tRel={tRel} /> : null}
      {seg === 4 ? <Scene5 f={frame} t={t} tRel={tRel} dur={s1(4) - s0(4)} /> : null}
      {seg === 5 ? <Scene6 f={frame} t={t} tRel={tRel} /> : null}
      {seg === 6 ? <Scene7 f={frame} t={t} tRel={tRel} /> : null}
      {seg === 7 ? <Scene8 f={frame} t={t} tRel={tRel} /> : null}
      {seg === 8 ? <Scene9 f={frame} t={t} tRel={tRel} /> : null}
      {seg === 9 ? <Scene10 f={frame} t={t} tRel={tRel} /> : null}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <LaoJia x={spot.x} y={spot.y} s={spot.s} mode={spot.mode} f={frame} wag={seg === 0 || seg === 7 || seg === 9 ? t < (CUES[seg]?.start ?? 0) + 1.6 : false} />
      </svg>
      <Badge f={frame} />
      <Subtitle seg={seg} t={t} />
      <Audio src={staticFile('audio4/ep04f_mix_loud.mp3')} />
    </AbsoluteFill>
  );
};
