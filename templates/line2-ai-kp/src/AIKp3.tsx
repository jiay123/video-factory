import React, { useMemo } from 'react';
import {
  AbsoluteFill, useCurrentFrame, interpolate, staticFile, Audio, Sequence,
} from 'remotion';
import { SCRIPT, TOOLS, STATIONS, MEMOS, QUERIES, type ToolKind } from './ep3Script';
import { F, DUR, TOTAL_FRAMES } from './ep3Timeline';
import { CHARS } from './ep3Chars';

/* =====================================================================
   EP03《Agent 是怎么动手干活的》· 竖屏 9:16 · 全片
   双 IP：火柴人老贾"嘴里吐"字/工具 + 小模（会演的 AI）
   铁律：每幕都要"活" · 大字带动效 · 节奏放慢
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
const STEEL = '#7C8CA1';
const PUPIL = '#0a0a12';
const FONT = '"Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", sans-serif';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ez = (t: number, d = 12) => 1 - Math.pow(1 - clamp01(t / d), 3);
const ezIn = (t: number, d = 12) => Math.pow(clamp01(t / d), 3);
const eio = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
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
const bez = (p0: number[], p1: number[], p2: number[], u: number): number[] => {
  const v = 1 - u;
  return [
    v * v * p0[0] + 2 * v * u * p1[0] + u * u * p2[0],
    v * v * p0[1] + 2 * v * u * p1[1] + u * u * p2[1],
  ];
};
const durF = (si: number) => Math.round((DUR[si] ?? 6) * 30);
const kf = (si: number, word: string) => {
  const cn = SCRIPT[si].cn;
  const i = cn.indexOf(word);
  if (i < 0) return 16;
  const t = CHARS[si]?.[i];
  return Math.round((t === undefined ? (i / Math.max(1, cn.length)) * 6 : t) * 30);
};

/* ---------------- 老贾"嘴里吐" ---------------- */
const mouthOf = (x: number, y: number, s: number) => ({ x, y: y - 46 * s });
type Pt = { x: number; y: number };
const flyP = (t: number, arriveAt: number, from: Pt, to: Pt, hold = 14, dur = 14) => {
  const start = arriveAt - hold - dur;
  if (t < start) return null;
  const uh = clamp01((t - start) / hold);
  const u = clamp01((t - start - hold) / dur);
  const e = eio(u);
  const mid = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 160 };
  const p = bez([from.x, from.y], [mid.x, mid.y], [to.x, to.y], e);
  const wob = u >= 1 ? Math.sin((t - arriveAt) * 0.5) * 2.5 : 0;
  return { x: p[0], y: p[1] + wob, s: lerp(0.26, 1, e), o: Math.min(1, uh * 3) };
};

/* ---------------- 背景 / 桌面 ---------------- */
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

const Desk: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <rect x={0} y={y} width={1080} height={6} fill={LINE} />
    <rect x={0} y={y + 6} width={1080} height={200} fill="#E9EEF6" opacity={0.6} />
  </g>
);

/* ---------------- 小模 ---------------- */
type Mood = 'choke' | 'shock' | 'proud' | 'serious' | 'happy' | 'dizzy' | 'cool' | 'worried' | 'neutral';

const XiaoMo: React.FC<{
  x: number; y: number; s: number; mood: Mood; f: number; rot?: number; flip?: boolean;
  armL?: number; armR?: number; cells?: number;
}> = ({ x, y, s, mood, f, rot = 0, flip = false, armL = 0, armR = 0, cells = 0 }) => {
  const bob = Math.sin(f / 26) * 5;
  const blinkPhase = (f % 70) / 70;
  const blink = blinkPhase > 0.925 ? 0.1 : 1;
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
    if (mood === 'dizzy')
      return (
        <>
          <path d="M -62 -30 L -26 4 M -26 -30 L -62 4" stroke={NAVY} strokeWidth={8} strokeLinecap="round" />
          <path d="M 26 -30 L 62 4 M 62 -30 L 26 4" stroke={NAVY} strokeWidth={8} strokeLinecap="round" />
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
    if (mood === 'dizzy') return <ellipse cx={0} cy={40} rx={18} ry={16} fill="none" stroke={NAVY} strokeWidth={6} />;
    return <path d="M -18 36 Q 0 46 18 36" stroke={NAVY} strokeWidth={8} fill="none" strokeLinecap="round" />;
  };
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={126} rx={86} ry={16} fill={NAVY} opacity={0.16} />
      <path d={`M -34 -92 Q ${-52 + ant1} -128 ${-44 + ant1 * 1.4} -152`} stroke={NAVY} strokeWidth={9} fill="none" strokeLinecap="round" />
      <circle cx={-44 + ant1 * 1.4} cy={-154} r={11} fill={RED} stroke={NAVY} strokeWidth={3} />
      <path d={`M 34 -92 Q ${52 + ant2} -128 ${44 + ant2 * 1.4} -152`} stroke={NAVY} strokeWidth={9} fill="none" strokeLinecap="round" />
      <circle cx={44 + ant2 * 1.4} cy={-154} r={11} fill={GREEN} stroke={NAVY} strokeWidth={3} />
      <circle cx={0} cy={0} r={104} fill="url(#xmBody)" stroke={NAVY} strokeWidth={5} />
      {mood === 'choke' ? <ellipse cx={0} cy={8} rx={92} ry={80} fill={RED} opacity={0.2} /> : null}
      {mood === 'choke' ? (
        <path d={`M ${-74 + Math.sin(f / 5) * 5} -66 q -8 16 0 20 q 8 -4 0 -20 Z`} fill="#8BE9FD" stroke={NAVY} strokeWidth={2.5} />
      ) : null}
      <path d="M -74 -30 q 30 -34 62 -12 q -34 18 -62 12 Z" fill="#FFFFFF" opacity={0.4} />
      {eyes()}
      {mouth()}
      {(mood === 'choke' || mood === 'worried' || mood === 'dizzy') ? (
        <g stroke={NAVY} strokeWidth={6} strokeLinecap="round" fill="none">
          <path d="M -64 -48 q 20 -13 40 -3" />
          <path d="M 24 -50 q 20 -11 40 3" />
        </g>
      ) : null}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-52 + i * 38} y={54} width={30} height={30} rx={6}
          fill={cells > i ? GOLD : '#DCE6F5'} stroke={NAVY} strokeWidth={3} />
      ))}
      <g>
        <g transform={`rotate(${armL} -84 24)`}>
          <line x1={-84} y1={24} x2={-104} y2={44} stroke={NAVY} strokeWidth={13} strokeLinecap="round" />
          <circle cx={-112} cy={50} r={13} fill="#B9D4FF" stroke={NAVY} strokeWidth={4} />
        </g>
        <g transform={`rotate(${armR} 84 24)`}>
          <line x1={84} y1={24} x2={104} y2={44} stroke={NAVY} strokeWidth={13} strokeLinecap="round" />
          <circle cx={112} cy={50} r={13} fill="#B9D4FF" stroke={NAVY} strokeWidth={4} />
        </g>
        <line x1={-38} y1={100} x2={-46} y2={134} stroke={NAVY} strokeWidth={13} strokeLinecap="round" />
        <line x1={38} y1={100} x2={46} y2={134} stroke={NAVY} strokeWidth={13} strokeLinecap="round" />
        <ellipse cx={-52} cy={140} rx={19} ry={11} fill="#B9D4FF" stroke={NAVY} strokeWidth={4} />
        <ellipse cx={52} cy={140} rx={19} ry={11} fill="#B9D4FF" stroke={NAVY} strokeWidth={4} />
      </g>
    </g>
  );
};

/* ---------------- 火柴人老贾 ---------------- */
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
const ToolIcon: React.FC<{ kind: ToolKind; size: number; c: string }> = ({ kind, size, c }) => {
  const k = size / 100;
  return (
    <g transform={`scale(${k})`}>
      <circle cx={0} cy={0} r={54} fill="#FFFFFF" stroke={c} strokeWidth={7} />
      {kind === 'glass' ? (
        <g>
          <circle cx={-8} cy={-8} r={24} fill="none" stroke={c} strokeWidth={11} />
          <line x1={8} y1={8} x2={30} y2={30} stroke={c} strokeWidth={13} strokeLinecap="round" />
        </g>
      ) : null}
      {kind === 'calc' ? (
        <g>
          <rect x={-26} y={-32} width={52} height={64} rx={8} fill="none" stroke={c} strokeWidth={8} />
          <rect x={-16} y={-24} width={32} height={14} rx={3} fill={c} opacity={0.85} />
          {[-6, 6, 18].map((yy) => (
            <g key={yy}>
              <circle cx={-12} cy={yy} r={4} fill={c} />
              <circle cx={0} cy={yy} r={4} fill={c} />
              <circle cx={12} cy={yy} r={4} fill={c} />
            </g>
          ))}
        </g>
      ) : null}
      {kind === 'note' ? (
        <g>
          <rect x={-24} y={-30} width={48} height={60} rx={7} fill="none" stroke={c} strokeWidth={8} />
          {[-14, -2, 10, 22].map((yy) => (
            <line key={yy} x1={-14} y1={yy} x2={14} y2={yy} stroke={c} strokeWidth={6} strokeLinecap="round" />
          ))}
        </g>
      ) : null}
      {kind === 'wrench' ? (
        <g>
          <path d="M -22 -26 a 17 17 0 1 0 0 34 l 40 22 a 9 9 0 1 0 8 -14 l -40 -22 z"
            fill="none" stroke={c} strokeWidth={9} strokeLinejoin="round" transform="rotate(20)" />
          <circle cx={-20} cy={-6} r={9} fill="#FFFFFF" stroke={c} strokeWidth={7} transform="rotate(20)" />
        </g>
      ) : null}
    </g>
  );
};

const MiniIcon: React.FC<{ kind: 'cat' | 'city' | 'mtn'; size: number }> = ({ kind, size }) => {
  const k = size / 100;
  return (
    <g transform={`scale(${k})`}>
      {kind === 'cat' ? (
        <g fill="none" stroke={NAVY} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M-26 -14 l-6 -24 l20 10 q12 -6 24 0 l20 -10 l-6 24 q8 12 8 24 a26 30 0 0 1 -60 0 q0 -12 8 -24 Z" fill="#FFD8A3" />
          <circle cx={-8} cy={6} r={3.5} fill={NAVY} stroke="none" />
          <circle cx={8} cy={6} r={3.5} fill={NAVY} stroke="none" />
          <path d="M-6 20 q6 6 12 0" />
        </g>
      ) : null}
      {kind === 'city' ? (
        <g stroke={NAVY} strokeWidth={5} fill="#BFE0FF">
          <rect x={-26} y={-20} width={16} height={52} />
          <rect x={-6} y={-36} width={16} height={68} fill="#8CC0FF" />
          <rect x={14} y={-6} width={16} height={38} />
          <line x1={-30} y1={32} x2={34} y2={32} strokeWidth={6} />
        </g>
      ) : null}
      {kind === 'mtn' ? (
        <g>
          <path d="M-32 30 L-8 -8 L8 12 L22 -18 L36 30 Z" fill="#B9D4FF" stroke={NAVY} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={16} cy={-26} r={8} fill={GOLD} stroke={GOLD_D} strokeWidth={3} />
        </g>
      ) : null}
    </g>
  );
};

/* ---------------- 大字：砸落（局部帧） ---------------- */
const Boom: React.FC<{
  f: number; text: string; d: number; y?: number; size?: number; color?: string; edge?: string;
  per?: number; drop?: number; rot?: number;
}> = ({ f, text, d, y = 300, size = 84, color = NAVY, edge, per = 2.5, drop = 170, rot = 0 }) => {
  const chars = Array.from(text);
  const w = size * 1.03;
  return (
    <g>
      {chars.map((c, i) => {
        const dd = d + i * per;
        const t = f - dd;
        if (t < 0) return null;
        const e = ez(t, 13);
        const dy = -drop * (1 - e);
        const land = t - 13;
        const sq = land > 0 ? 1 - 0.2 * Math.sin(land * 0.55) * Math.exp(-land * 0.22) : 1 - 0.24 * (1 - e);
        const x = (i - (chars.length - 1) / 2) * w + 540;
        const tilt = (1 - e) * (rand(i) - 0.5) * 18;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot + tilt}) scale(1 ${sq})`}>
            {land >= 0 && land < 12 ? (
              <ellipse cx={0} cy={size * 0.62} rx={size * 0.5 * (1 - land / 12)} ry={9} fill={color} opacity={0.26 * (1 - land / 12)} />
            ) : null}
            <text x={0} y={dy} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={900}
              fill={color} stroke={edge} strokeWidth={edge ? size * 0.09 : 0} paintOrder="stroke">{c}</text>
          </g>
        );
      })}
    </g>
  );
};

/* ---------------- 大字：打字机 ---------------- */
const TypeLine: React.FC<{ f: number; text: string; d: number; y: number; size: number; color: string; per?: number }> = ({ f, text, d, y, size, color, per = 2.2 }) => {
  const chars = Array.from(text);
  const w = size * 1.02;
  return (
    <g>
      {chars.map((c, i) => {
        const dd = d + i * per;
        const t = f - dd;
        if (t < 0) return null;
        const o = clamp01(t / 8);
        const dy = (1 - ez(t, 10)) * 16;
        const x = (i - (chars.length - 1) / 2) * w + 540;
        return (
          <text key={i} x={x} y={y + dy} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={900}
            fill={color} stroke="#FFFFFF" strokeWidth={size * 0.06} paintOrder="stroke" opacity={o}>{c}</text>
        );
      })}
      {(() => {
        const n = Math.min(chars.length, Math.max(0, Math.floor((f - d) / per)));
        if (f < d || n >= chars.length) return null;
        const x = (n - (chars.length - 1) / 2) * w + 540 + w * 0.4;
        return <rect x={x} y={y - size * 0.86} width={size * 0.09} height={size * 0.9} fill={color} opacity={0.6 + 0.4 * Math.sin(f / 3)} />;
      })()}
    </g>
  );
};

/* ---------------- 字幕 / 角标 ---------------- */
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
        <clipPath id="cap3clip">
          <rect x={48} y={y0 - 62} width={984} height={110} rx={24} />
        </clipPath>
      </defs>
      <rect x={48} y={y0 - 62} width={984} height={110} rx={24} fill={NAVY} opacity={0.92} />
      <g clipPath="url(#cap3clip)">
        <text x={72 - scrollX} y={y0} textAnchor="start" fontFamily={FONT} fontSize={44} fontWeight={800} opacity={0.95}>
          {chars.map((ch, i) => (
            <tspan key={i} fill={shown[i] === 1 ? '#FFD60A' : '#FFFFFF'} opacity={shown[i] === 1 ? 1 : 0.38}>{ch}</tspan>
          ))}
        </text>
      </g>
    </svg>
  );
};

const Badge: React.FC<{ f: number }> = ({ f }) => {
  const p = pop(f, 4, 14);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <g opacity={at(f, 4, 8)} transform={`translate(54 62) scale(${p})`}>
        <rect x={0} y={0} width={252} height={54} rx={27} fill={NAVY} opacity={0.88} />
        <text x={126} y={37} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#FFFFFF">AI 科普 · EP03</text>
      </g>
    </svg>
  );
};

/* ---------------- 可乐瓶 ---------------- */
const Bottle: React.FC<{ x: number; y: number; rot?: number; open?: number; s?: number }> = ({ x, y, rot = 0, open = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-92} y={-330} width={184} height={336} rx={26} fill="#CFE3FF" stroke={NAVY} strokeWidth={5} />
    <rect x={-92} y={-330} width={184} height={336} rx={26} fill="url(#sodaGrad)" opacity={0.7} />
    <path d="M -92 -120 L 92 -120 L 92 6 L -92 6 Z" fill="#6FA8FF" opacity={0.45} />
    <rect x={-34} y={-420} width={68} height={100} rx={12} fill="#CFE3FF" stroke={NAVY} strokeWidth={5} />
    <g transform={`translate(0 ${-452 - open * 130}) rotate(${open * 45})`}>
      <rect x={-42} y={-20} width={84} height={40} rx={10} fill={GOLD} stroke={NAVY} strokeWidth={5} />
      {[-28, -14, 0, 14, 28].map((dx) => (
        <line key={dx} x1={dx} y1={-18} x2={dx} y2={18} stroke={GOLD_D} strokeWidth={4} />
      ))}
    </g>
    <g transform="translate(0 -230)">
      <rect x={-104} y={-44} width={208} height={88} rx={14} fill="#FFFFFF" stroke={RED} strokeWidth={5} />
      <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={RED}>人类问题</text>
    </g>
  </g>
);

/* =====================================================================
   幕1「够」：老贾递瓶 → 小模手太短、蹦着也够不着盖子 → 用力一扑摔倒
            → 老贾嘴里吐出「有脑子 / 却没有手」
   ===================================================================== */
const Scene1: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const dur = durF(si);
  const kIn = 34;                                     // 小模弹跳入场
  const kHand = Math.max(kf(si, '递给'), kIn + 12);    // 老贾递瓶
  const kHop = Math.max(kf(si, '太短'), kHand + 30);
  const HN = dur < 320 ? 1 : 2, CYC = 40;   // 开头短了就只蹦一下，更利落
  const hopEnd = kHop + HN * CYC;
  const kFall = Math.min(Math.max(kf(si, '够不着'), hopEnd + 4), dur - 84);
  const inU = clamp01(t / kIn);
  const inBounce = t < kIn ? lerp(300, 0, ez(inU, 1)) + Math.abs(Math.sin(inU * Math.PI * 2)) * 60 * (1 - inU) : 0;
  const handU = ez(clamp01((t - 12) / Math.max(1, kHand - 12)), 1);
  const bp = bez([300, 1210], [540, 1000], [780, 1330], handU);
  const hopIdx = Math.min(HN - 1, Math.floor(Math.max(0, t - kHop) / CYC));
  const hopU = t >= kHop && t < hopEnd ? Math.sin(clamp01((t - kHop - hopIdx * CYC) / CYC) * Math.PI) : 0;
  const fall = t >= kFall ? clamp01((t - kFall) / 16) : 0;
  const idle = Math.sin(t / 9) * 4;                   // 待机小抖（不许定格）
  const xmX = (t < kIn ? 400 : 470 + hopIdx * 26 + idle) - fall * 120;
  const xmY = 1160 - inBounce - hopU * 150 + fall * 118;
  const xmRot = fall > 0 ? lerp(0, 96, ez(fall, 1)) : hopU * -6;
  const reachArm = t < kHand ? 20 : -104 - hopU * 10;
  const shake = fall > 0 && fall < 1 ? Math.sin(t * 3) * 12 * (1 - fall) : 0;
  const handPt = { x: xmX + 128, y: xmY + 34 - hopU * 10 };
  const capPt = { x: 780, y: 946 };
  const gapU = t >= kHop && t < hopEnd;
  const sweat = t >= kHand && t < kFall ? Array.from({ length: 3 }).map((_, i) => {
    const k = (t * 0.7 + i * 30) % 38;
    return <path key={i} d={`M ${xmX - 60 + i * 46} ${xmY - 120 - k} q -6 11 0 15 q 6 -4 0 -15 Z`} fill="#8BE9FD" stroke={NAVY} strokeWidth={2} opacity={1 - k / 38} />;
  }) : null;
  const mo = mouthOf(210, 1470, 0.96);
  const land1 = Math.min(kFall + 4, dur - 40);
  const fp1 = flyP(t, land1, mo, { x: 540, y: 200 });
  const fp2 = flyP(t, Math.min(land1 + 24, dur - 22), mo, { x: 540, y: 372 });
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#FFE9E4" f={t} seed={1} />
      <Desk y={1330} />
      <g transform={`translate(${shake} 0)`}>
        <Bottle x={t < kHand ? bp[0] : 780} y={t < kHand ? bp[1] : 1330} rot={t < kHand ? (1 - handU) * -24 : hopU * 3} s={0.85} />
        <XiaoMo x={xmX} y={xmY} s={1.0} mood={t < kHand ? 'neutral' : t < kFall ? 'choke' : 'dizzy'} f={t} rot={xmRot} armL={20} armR={reachArm} />
        {sweat}
      </g>
      {/* 够不到：虚线 + 差一点 */}
      {gapU ? (
        <g opacity={0.9}>
          <line x1={handPt.x} y1={handPt.y} x2={capPt.x} y2={capPt.y} stroke={RED} strokeWidth={5} strokeDasharray="10 9" opacity={0.7} />
          <g transform={`translate(${(handPt.x + capPt.x) / 2 + 60} ${(handPt.y + capPt.y) / 2}) scale(${pop(t, kHop, 10)})`}>
            <text textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={RED} stroke="#FFFFFF" strokeWidth={5} paintOrder="stroke">差一点！</text>
          </g>
        </g>
      ) : null}
      {fall > 0 && fall < 1 ? (
        <g opacity={0.85}>
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const r = fall * (80 + rand(i) * 80);
            return <circle key={i} cx={370 + Math.cos(a) * r} cy={1300 + Math.sin(a) * r * 0.4} r={(10 - fall * 8) * (1 - fall * 0.4)} fill="#D6E1EF" opacity={1 - fall} />;
          })}
        </g>
      ) : null}
      {t >= kFall + 6 ? (
        <g opacity={at(t, kFall + 6, 8)}>
          <g transform={`translate(${xmX - 96} ${xmY + 20}) scale(${pop(t, kFall + 6, 12)})`}>
            <path d="M -14 -26 L 10 -4 L -2 -4 L 14 24 L -12 0 L 2 0 Z" fill={GOLD} stroke={GOLD_D} strokeWidth={3} />
          </g>
          <g transform={`translate(${xmX + 92} ${xmY + 24}) scale(${pop(t, kFall + 10, 12)})`}>
            <text textAnchor="middle" fontFamily={FONT} fontSize={70} fontWeight={900} fill={RED}>？</text>
          </g>
        </g>
      ) : null}
      <LaoJia x={210} y={1470} s={0.96} mode={t < kHand ? 'present' : t < kFall ? 'pace' : 'gasp'} f={t} wag={t < kHand || t >= kFall} />
      {fp1 ? (
        <g transform={`translate(${fp1.x} ${fp1.y})`} opacity={fp1.o}>
          <text textAnchor="middle" fontFamily={FONT} fontSize={76 * fp1.s} fontWeight={900} fill={NAVY} stroke="#FFFFFF" strokeWidth={6 * fp1.s} paintOrder="stroke">AI 有脑子</text>
        </g>
      ) : null}
      {fp2 ? (
        <g transform={`translate(${fp2.x} ${fp2.y})`} opacity={fp2.o}>
          <text textAnchor="middle" fontFamily={FONT} fontSize={94 * fp2.s} fontWeight={900} fill={RED} stroke="#FFD60A" strokeWidth={7 * fp2.s} paintOrder="stroke">却没有手</text>
        </g>
      ) : null}
    </svg>
  );
};

/* =====================================================================
   幕2「闪」：箱子从天而降 → 小模嗖地闪开 → 砸在它脚前（不砸头）→ 裂开
            → 四件工具喷出（拖尾+粒子）左右各两个
   ===================================================================== */
const Scene2: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const kLight = Math.max(kf(si, '工具'), 16);
  const kDrop = kLight + 10;
  const kHit = kDrop + 18;
  const dropU = ezIn(clamp01((t - kDrop) / 18), 1);
  const boxY = lerp(-360, 1290, dropU);
  const landed = t >= kHit;
  const open = clamp01((t - (kHit + 6)) / 10);
  /* 小模：抬头看 → 快闪到左边躲开 */
  const dodge = ez(clamp01((t - (kHit - 20)) / 12), 1);
  const xmX = lerp(540, 230, dodge);
  const xmY = 1020 - Math.sin(clamp01((t - (kHit - 20)) / 30) * Math.PI) * 120;
  const shake = landed && t - kHit < 22 ? Math.sin((t - kHit) * 3.4) * 14 * Math.exp(-(t - kHit) / 8) : 0;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#E7F0FF" f={t} seed={3} />
      <Desk y={1330} />
      <g transform={`translate(${shake} 0)`}>
        <XiaoMo x={xmX} y={xmY} s={1.05} mood={landed ? 'shock' : 'worried'} f={t}
          armL={t < kHit ? 80 : -30} armR={t < kHit ? -80 : 30} />
        {/* 箱子砸到地面 */}
        {t >= kDrop ? (
          <g transform={`translate(560 ${boxY})`}>
            <ellipse cx={0} cy={62} rx={160} ry={22} fill={NAVY} opacity={0.18} />
            <rect x={-160} y={-58} width={320} height={124} rx={16} fill="#FF8A4C" stroke={NAVY} strokeWidth={6} />
            <rect x={-160} y={-6} width={320} height={22} fill="#E06A2E" />
            <g transform={`translate(0 ${-58}) rotate(${-open * 66} -160 0)`}>
              <rect x={-160} y={-68} width={320} height={74} rx={14} fill="#FFA36B" stroke={NAVY} strokeWidth={6} />
              <rect x={-32} y={-24} width={64} height={30} rx={6} fill={GOLD} stroke={GOLD_D} strokeWidth={3} />
            </g>
            {/* 落地裂纹 */}
            {landed && t - kHit < 26 ? (
              <g stroke={NAVY} strokeWidth={4} opacity={1 - (t - kHit) / 26}>
                {[-1, 0, 1].map((k) => (
                  <path key={k} d={`M ${k * 90} 62 l ${k * 40 - 10} 40`} fill="none" />
                ))}
              </g>
            ) : null}
            {!landed ? (
              <g opacity={0.45}>
                {[-110, 0, 110].map((dx) => (
                  <line key={dx} x1={dx} y1={-160} x2={dx} y2={-100} stroke={GOLD_D} strokeWidth={8} strokeLinecap="round" />
                ))}
              </g>
            ) : null}
          </g>
        ) : null}
        {landed && t - kHit < 24 ? (
          <g>
            {Array.from({ length: 14 }).map((_, i) => {
              const a = (i / 14) * Math.PI * 2;
              const r = ((t - kHit) / 24) * (140 + rand(i) * 90);
              return <circle key={i} cx={560 + Math.cos(a) * r} cy={1330 + Math.sin(a) * r * 0.4} r={12 - (t - kHit) / 3} fill="#D6E1EF" opacity={0.8 * (1 - (t - kHit) / 24)} />;
            })}
          </g>
        ) : null}
        {/* 工具从箱里喷出 */}
        {t >= kHit + 8
          ? TOOLS.map((tool, i) => {
            const tx = tool.side < 0 ? (i % 2 === 0 ? 210 : 350) : (i % 2 === 0 ? 880 : 740);
            const ty = i % 2 === 0 ? 1200 : 1330;
            const d = kHit + 10 + i * 6;
            const u = clamp01((t - d) / 18);
            const e = u >= 1 ? 1 : 1 - Math.pow(1 - u, 3);
            const p = bez([560, 1290], [(560 + tx) / 2, 1010], [tx, ty], e);
            const bounce = u >= 1 ? -Math.abs(Math.sin((t - d - 18) * 0.3)) * 22 * Math.exp(-(t - d - 18) / 16) : 0;
            return (
              <g key={tool.kind}>
                {u > 0.05 && u < 1 ? (
                  <g opacity={0.5 * (1 - u)}>
                    {[1, 2, 3].map((k) => {
                      const uu = Math.max(0, e - k * 0.08);
                      const pp = bez([560, 1290], [(560 + tx) / 2, 1010], [tx, ty], uu);
                      return <circle key={k} cx={pp[0]} cy={pp[1]} r={16 - k * 3} fill={tool.c} opacity={0.5 - k * 0.12} />;
                    })}
                  </g>
                ) : null}
                <g transform={`translate(${p[0]} ${p[1] + bounce}) rotate(${(1 - e) * 250})`} opacity={u}>
                  <ToolIcon kind={tool.kind} size={116} c={tool.c} />
                  <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill={tool.c}>{tool.label}</text>
                </g>
              </g>
            );
          })
          : null}
      </g>
      <Boom f={f} text="给它一套工具" d={Math.min(kHit + 10, durF(si) - 96)} y={236} size={72} color={NAVY} per={2} />
      <Boom f={f} text="全落到它脚边" d={Math.min(kHit + 40, durF(si) - 60)} y={368} size={62} color={GREEN} per={2} rot={-2} />
    </svg>
  );
};

/* =====================================================================
   幕3「查」：老贾嘴里吐工具 → 小模机械手接住 → 自己查三件事（天气/大事/计算）
            三张答案卡依次飞出 → 大字「它变成了 Agent」砸下 + 冲击环
   ===================================================================== */
const Scene3: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const dur = durF(si);
  const kTool = Math.max(kf(si, '工具'), 30);
  const kCatch = kTool + 24;
  const qT = [kf(si, '天气'), kf(si, '大事'), kf(si, '算一下')];
  const kAgent = Math.min(Math.max(kf(si, 'Agent'), qT[2] + 60), dur - 80);
  const mo = mouthOf(220, 1440, 0.98);
  const fp = flyP(t, kCatch, mo, { x: 690, y: 1010 }, 14, 14);
  const ext = ez(clamp01((t - kCatch + 8) / 16), 1);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#EAF3EE" f={t} seed={5} />
      <LaoJia x={220} y={1440} s={0.98} mode="present" f={t} wag={t >= kTool - 8 && t < kTool + 6} />
      <XiaoMo x={560} y={1080} s={1.06} mood={t >= kAgent ? 'proud' : t >= kCatch ? 'cool' : 'shock'} f={t} armL={20} armR={0} />
      {/* 金属臂 */}
      {t >= kCatch ? (
        <g transform="translate(560 1080)">
          <g transform={`rotate(${lerp(30, 6, ext)} 84 24)`}>
            <line x1={84} y1={24} x2={84 + 118 * ext} y2={24 + 70 * ext} stroke={STEEL} strokeWidth={20} strokeLinecap="round" />
            <line x1={84} y1={24} x2={84 + 118 * ext} y2={24 + 70 * ext} stroke="#B7C4D4" strokeWidth={9} strokeLinecap="round" />
            <circle cx={84 + 58 * ext} cy={24 + 35 * ext} r={11} fill="#5B6A7C" />
            <g transform={`translate(${84 + 118 * ext} ${24 + 70 * ext})`}>
              <path d="M -4 -18 q 24 -8 34 6" stroke={STEEL} strokeWidth={12} fill="none" strokeLinecap="round" />
              <path d="M -4 18 q 24 8 34 -6" stroke={STEEL} strokeWidth={12} fill="none" strokeLinecap="round" />
            </g>
          </g>
        </g>
      ) : null}
      {fp ? (
        <g transform={`translate(${fp.x} ${fp.y}) rotate(${(1 - fp.s) * -260}) scale(${fp.s})`} opacity={fp.o}>
          <ToolIcon kind="glass" size={104} c={BLUE} />
        </g>
      ) : null}
      {/* 手上举着放大镜 */}
      {t >= kCatch + 12 ? (
        <g transform={`translate(660 1000)`}>
          <ToolIcon kind="glass" size={116} c={BLUE} />
          <path d="M 0 60 L 40 220 L -40 220 Z" fill={BLUE} opacity={0.13} />
        </g>
      ) : null}
      {/* 三个答案卡：依次飞出，堆在右侧 */}
      {QUERIES.map((q, i) => {
        const d = Math.max(qT[i], kCatch + 20 + i * 30);
        if (t < d - 10) return null;
        const u = ez(clamp01((t - d) / 16), 1);
        const from = { x: 700, y: 1000 };
        const to = { x: 800, y: 520 + i * 170 };
        const p = bez([from.x, from.y], [(from.x + to.x) / 2 + 200, 820], [to.x, to.y], u);
        const ring = u < 1 ? 1 - u : 0;
        return (
          <g key={i}>
            {ring > 0 ? <circle cx={to.x} cy={to.y} r={60 + (1 - u) * 120} fill="none" stroke={q.c} strokeWidth={8 * ring} opacity={0.6 * ring} /> : null}
            <g transform={`translate(${p[0]} ${p[1]}) scale(${lerp(0.5, 1, u)})`}>
              <rect x={-190} y={-58} width={380} height={116} rx={18} fill="#FFFFFF" stroke={q.c} strokeWidth={6} />
              <g transform="translate(-150 0)">
                <circle cx={0} cy={0} r={34} fill={q.c} opacity={0.15} />
                <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={q.c}>{'✓'}</text>
              </g>
              <text x={40} y={-10} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={GREY}>{q.label}</text>
              <text x={40} y={34} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={NAVY}>{q.ans}</text>
            </g>
          </g>
        );
      })}
      {/* 突出 Agent：冲击环 + 大字 */}
      {t >= kAgent && t < kAgent + 26 ? (
        <g opacity={1 - (t - kAgent) / 26}>
          <ellipse cx={540} cy={300} rx={80 + (t - kAgent) * 22} ry={26 + (t - kAgent) * 8} fill="none" stroke={GOLD_D} strokeWidth={10 - (t - kAgent) / 3} />
          <ellipse cx={540} cy={300} rx={40 + (t - kAgent) * 16} ry={14 + (t - kAgent) * 6} fill="none" stroke={RED} strokeWidth={8 - (t - kAgent) / 4} />
        </g>
      ) : null}
      <Boom f={f} text="它 变成了" d={kAgent} y={210} size={66} color={NAVY} per={1.6} drop={150} />
      <Boom f={f} text="Agent" d={kAgent + 20} y={330} size={120} color={GOLD_D} edge="#0A2540" per={3} drop={200} />
    </svg>
  );
};

/* =====================================================================
   幕4「记」：资料飘四周 → 机械手一个个抓进脑袋（脑内点亮记忆格）→ 金鱼对比
   ===================================================================== */
const Scene4: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const dur = durF(si);
  const kStart = Math.max(kf(si, '记'), 20);
  const kGold = Math.min(Math.max(kf(si, '金鱼'), kStart + 150), dur - 130);
  const xm = { x: 400, y: 1020 };
  const items: { label: string; icon: 'cat' | 'city' | 'mtn'; x: number; y: number }[] = [
    { label: '你喜欢猫', icon: 'cat', x: 840, y: 610 },
    { label: '你在上海', icon: 'city', x: 900, y: 940 },
    { label: '上次聊爬山', icon: 'mtn', x: 800, y: 1260 },
  ];
  const cells = items.filter((_, i) => t >= kStart + i * 34 + 16).length;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#EAF3FF" f={t} seed={6} />
      <XiaoMo x={xm.x} y={xm.y} s={1.05} mood={cells >= 3 ? 'happy' : 'serious'} f={t}
        armL={30} armR={-30} cells={cells} />
      {items.map((it, i) => {
        const d = kStart + i * 34;
        const float = Math.sin(t / 15 + i) * 10;
        const e = ez(clamp01((t - d) / 16), 1);
        const head = { x: xm.x, y: xm.y - 104 };
        const px = t < d ? it.x + float * 0.2 : lerp(it.x, head.x, e);
        const py = t < d ? it.y + float : lerp(it.y, head.y, e);
        const sc = t < d ? 1 : lerp(1, 0.15, e);
        const o = t < d ? 1 : 1 - clamp01((t - d - 14) / 24);
        if (t > d + 38) return null;
        return (
          <g key={i} opacity={o}>
            <g transform={`translate(${px} ${py}) scale(${sc}) rotate(${t < d ? float * 0.4 : 0})`}>
              <rect x={-116} y={-46} width={232} height={92} rx={14} fill="#FFFFFF" stroke={GOLD_D} strokeWidth={5} />
              <g transform="translate(-76 0)"><MiniIcon kind={it.icon} size={68} /></g>
              <text x={16} y={10} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={NAVY}>{it.label}</text>
            </g>
            {t >= d - 16 && t < d + 2 ? (
              <g opacity={0.95}>
                <line x1={xm.x + 60} y1={xm.y - 20} x2={px - 40} y2={py} stroke={STEEL} strokeWidth={16} strokeLinecap="round" />
                <circle cx={px - 46} cy={py} r={13} fill="#5B6A7C" />
              </g>
            ) : null}
            {t >= d && t < d + 14 ? (
              <ellipse cx={head.x} cy={head.y} rx={54} ry={16} fill="#FFD60A" opacity={0.7 * (1 - (t - d) / 14)} />
            ) : null}
          </g>
        );
      })}
      {t >= kGold ? (
        <g opacity={at(t, kGold, 10)}>
          <g transform={`translate(850 ${1500})`}>
            <circle cx={0} cy={0} r={72} fill="#D9DEE6" stroke={GREY} strokeWidth={5} />
            <ellipse cx={-26} cy={-12} rx={17} ry={20} fill="#FFFFFF" stroke={GREY} strokeWidth={3} />
            <ellipse cx={26} cy={-12} rx={17} ry={20} fill="#FFFFFF" stroke={GREY} strokeWidth={3} />
            <circle cx={-26} cy={-10} r={6} fill={GREY} />
            <circle cx={26} cy={-10} r={6} fill={GREY} />
            <path d="M -16 34 Q 0 22 16 34" stroke={GREY} strokeWidth={6} fill="none" strokeLinecap="round" />
            <text x={0} y={-98} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill={GREY}>金鱼记忆</text>
          </g>
          {(() => {
            const p = bez([900, 1380], [700, 1300], [520, 1420], ez(clamp01((t - kGold) / 40), 1));
            return (
              <g opacity={at(t, kGold + 4, 8) * (1 - clamp01((t - kGold - 30) / 20))}>
                <g transform={`translate(${p[0]} ${p[1]}) rotate(${Math.sin(t / 8) * 12})`}>
                  <rect x={-96} y={-38} width={192} height={76} rx={12} fill="#FFFFFF" stroke={GREY} strokeWidth={4} />
                  <text x={0} y={9} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={GREY}>又忘了…</text>
                </g>
              </g>
            );
          })()}
          {t >= kGold + 6 ? (
            <g opacity={at(t, kGold + 6, 8)}>
              <line x1={850} y1={1420} x2={770} y2={1370} stroke={STEEL} strokeWidth={14} strokeLinecap="round" />
              <text x={750} y={1462} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900} fill={RED} opacity={0.5 + 0.5 * Math.sin(t / 3)}>✕</text>
            </g>
          ) : null}
        </g>
      ) : null}
      <Boom f={f} text="它还会记" d={kStart + 6} y={236} size={76} color={NAVY} per={2} />
      {cells >= 1 ? <Boom f={f} text="都装进脑子里" d={kStart + 44} y={368} size={58} color={BLUE} per={1.6} rot={-2} /> : null}
      <LaoJia x={180} y={1450} s={0.9} mode="point" f={t} />
    </svg>
  );
};

/* =====================================================================
   幕5「转」：四工位环形流水线 → 依次点亮 → 进度 → 小旗彩纸（大字落完再切）
   ===================================================================== */
const Scene5: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const dur = durF(si);
  const kLoop = Math.max(kf(si, '转圈'), 16);
  const kDone = Math.min(Math.max(kf(si, '办成'), kLoop + 60), dur - 110);
  const cx = 540, cy = 980, R = 292;
  const spin = (t / 30) * 0.9;
  const prog = clamp01((t - kLoop) / Math.max(1, kDone - kLoop));
  const lit = STATIONS.map((_, i) => t >= kLoop + i * 16);
  const done = t >= kDone;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#F0ECFF" f={t} seed={8} />
      <g transform={`translate(${cx} ${cy})`}>
        <circle cx={0} cy={0} r={R} fill="none" stroke={LINE} strokeWidth={26} />
        <g transform={`rotate(${spin * 57.3})`} opacity={0.9}>
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(a) * R} cy={Math.sin(a) * R} r={7} fill={GREY} />;
          })}
        </g>
        {STATIONS.map((st, i) => {
          const a = -Math.PI / 2 + (i / 4) * Math.PI * 2;
          const sx = Math.cos(a) * R, sy = Math.sin(a) * R;
          const on = lit[i];
          return (
            <g key={st.key} transform={`translate(${sx} ${sy})`}>
              <circle cx={0} cy={0} r={on ? 62 : 54} fill={on ? st.c : '#FFFFFF'} stroke={NAVY} strokeWidth={5} />
              {on ? <circle cx={0} cy={0} r={62} fill="none" stroke={st.c} strokeWidth={6} opacity={0.4} /> : null}
              <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={on ? 42 : 38} fontWeight={900} fill={on ? '#FFFFFF' : NAVY}>{st.label}</text>
            </g>
          );
        })}
        <g transform={`rotate(${-spin * 57.3 * 0.6})`} opacity={0.25}>
          <circle cx={0} cy={0} r={120} fill="none" stroke={GOLD_D} strokeWidth={10} strokeDasharray="26 20" />
        </g>
        <XiaoMo x={0} y={0} s={0.86} mood={done ? 'happy' : 'serious'} f={t}
          rot={Math.sin(t / 12) * 4} armL={done ? 96 : 30 + Math.sin(t / 6) * 16} armR={done ? -96 : -30 - Math.sin(t / 6) * 16} />
      </g>
      <g transform="translate(240 1500)">
        <rect x={0} y={0} width={600} height={40} rx={20} fill="#FFFFFF" stroke={NAVY} strokeWidth={4} />
        <rect x={0} y={0} width={600 * prog} height={40} rx={20} fill={GOLD} />
        <text x={300} y={-16} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={NAVY}>
          任务进度 {Math.round(prog * 100)}%
        </text>
      </g>
      {done ? (
        <g>
          <g transform={`translate(540 ${cy - R - 60}) scale(${pop(t, kDone, 16)})`}>
            <line x1={0} y1={0} x2={0} y2={-120} stroke={NAVY} strokeWidth={8} />
            <path d="M 0 -120 L 120 -92 L 0 -64 Z" fill={RED} stroke={NAVY} strokeWidth={5} />
            <text x={54} y={-84} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill="#FFFFFF">✓</text>
          </g>
          {Array.from({ length: 26 }).map((_, i) => {
            const d = kDone + rand(i) * 20;
            const u = clamp01((t - d) / 40);
            const x = 540 + (rand(i * 3) - 0.5) * 900;
            const y = cy - R - 60 + u * (200 + rand(i * 7) * 400);
            const cols = [RED, GOLD, BLUE, GREEN];
            return u > 0 && u < 1 ? <rect key={i} x={x} y={y} width={12} height={12} fill={cols[i % 4]} transform={`rotate(${u * 360} ${x} ${y})`} opacity={1 - u} /> : null;
          })}
        </g>
      ) : null}
      <Boom f={f} text="想 · 做 · 看 · 再想" d={Math.min(kLoop + 6, dur - 140)} y={236} size={64} color={NAVY} per={1.6} />
      <Boom f={f} text="转圈，直到办成" d={kDone} y={360} size={70} color={GREEN} per={2.2} rot={-3} />
      <LaoJia x={250} y={700} s={0.68} mode="cheer" f={t} />
    </svg>
  );
};

/* =====================================================================
   幕6「成」：机械手拧开汽水 → 彩虹气泡 → 双 IP → 转圈预告板（老贾 10/21 改：原MCP钩子改为指向EP04）
            → 金黄大字「点赞·关注·收藏」一个个蹦出来
   ===================================================================== */
const Scene6: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const dur = durF(si);
  const kOpen = 20;
  const kDrink = kOpen + 56;
  const kClap = kOpen + 100;
  const kHook = Math.min(Math.max(kf(si, '谜'), dur - 170), dur - 90);
  const open = clamp01((t - kOpen) / 14);
  const mcpU = ez(clamp01((t - kHook) / 16), 1);
  const bubbles = t >= kOpen + 6
    ? Array.from({ length: 40 }).map((_, i) => {
      const d = kOpen + 4 + rand(i) * 26;
      const u = clamp01((t - d) / 70);
      const a = -Math.PI / 2 + (rand(i * 3) - 0.5) * 1.9;
      const r = u * (260 + rand(i * 5) * 520);
      const cols = ['#FF5EA8', '#FFD60A', '#4FC3F7', '#8CE99A', '#B197FC', '#FF8A4C'];
      return <circle key={i} cx={470 + Math.cos(a) * r} cy={1060 + Math.sin(a) * r} r={(14 + rand(i) * 20) * (1 - u * 0.4)} fill={cols[i % 6]} opacity={0.95 * (1 - u)} />;
    })
    : null;
  const showBottle = t < kHook - 20;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#EAF3FF" f={t} seed={9} />
      {showBottle ? (
        <g>
          <Bottle x={470} y={1300} rot={0} open={open} s={0.95} />
          <XiaoMo x={780} y={1140} s={1.06} mood={t >= kDrink ? 'happy' : 'proud'} f={t} armL={26} armR={-6} />
          {t >= kOpen - 46 ? (
            <g transform="translate(780 1140)">
              <g transform={`rotate(${Math.sin((t - kOpen + 46) * 0.5) * 4} 0 0)`}>
                <line x1={0} y1={0} x2={-230} y2={-240} stroke={STEEL} strokeWidth={22} strokeLinecap="round" />
                <line x1={0} y1={0} x2={-230} y2={-240} stroke="#B7C4D4" strokeWidth={9} strokeLinecap="round" />
                <circle cx={-115} cy={-120} r={12} fill="#5B6A7C" />
                <g transform="translate(-230 -240)">
                  <path d="M -6 -18 q -26 -8 -36 6" stroke={STEEL} strokeWidth={12} fill="none" strokeLinecap="round" />
                  <path d="M -6 18 q -26 8 -36 -6" stroke={STEEL} strokeWidth={12} fill="none" strokeLinecap="round" />
                </g>
              </g>
            </g>
          ) : null}
          {bubbles}
          <LaoJia x={220} y={1440} s={0.95} mode={t >= kClap ? 'win' : t >= kOpen ? 'cheer' : 'point'} f={t} />
        </g>
      ) : null}
      {t >= kHook - 20 ? (
        <g opacity={mcpU}>
          <rect x={0} y={0} width={1080} height={1920} fill="#0A1630" opacity={0.94 * mcpU} />
          <g transform={`translate(540 ${lerp(1080, 920, mcpU)})`}>
            <rect x={-330} y={-110} width={660} height={220} rx={28} fill="#16233F" stroke={GOLD_D} strokeWidth={6} />
            {[-2, -1, 0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${i * 120} 0)`}>
                <rect x={-40} y={-52} width={80} height={104} rx={14} fill="#0A1630" stroke="#2C3E63" strokeWidth={4} />
                <circle cx={0} cy={0} r={16} fill={i === 0 ? GREEN : '#33466E'} />
              </g>
            ))}
            <text x={0} y={-158} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill="#FFD60A">它到底是怎么转起来的？</text>
            <text x={0} y={-112} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={700} fill="#FFD60A" opacity={0.85}>想 → 调工具 → 看结果 → 再想</text>
          </g>
          {Array.from({ length: 5 }).map((_, i) => {
            const d = kHook + i * 8;
            const u = clamp01((t - d) / 20);
            const x = lerp(-520, -120 - i * 120, ez(u, 1));
            return (
              <g key={i} transform={`translate(${x} ${920})`} opacity={u}>
                <rect x={-70} y={-30} width={110} height={60} rx={12} fill={GOLD} stroke={GOLD_D} strokeWidth={4} />
                <rect x={40} y={-12} width={34} height={24} rx={4} fill="#B7C4D4" />
                <line x1={-70} y1={0} x2={-150} y2={0} stroke={GOLD_D} strokeWidth={10} strokeLinecap="round" />
              </g>
            );
          })}
          <XiaoMo x={320} y={1150} s={0.78} mood="happy" f={t} armL={40} armR={-40} />
          <LaoJia x={760} y={1170} s={0.76} mode="cheer" f={t} />
          <g transform="translate(540 1310)" opacity={at(t, kHook + 20, 12)}>
            <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill="#FFFFFF">下一集 · 拆开看</text>
          </g>
          {/* 金黄大字：点赞 / 关注 / 收藏 */}
          {['点赞', '关注', '收藏'].map((b, i) => {
            const d = Math.min(kHook + 30 + i * 10, dur - 40);
            if (t < d) return null;
            const s = pop(t, d, 14);
            return (
              <g key={b} transform={`translate(${300 + i * 240} ${1440}) scale(${s})`}>
                <rect x={-96} y={-48} width={192} height={96} rx={48} fill="#FFD60A" opacity={0.18} stroke="#FFD60A" strokeWidth={5} />
                <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900}
                  fill="#FFD60A" stroke="#7a5a00" strokeWidth={5} paintOrder="stroke">{b}</text>
              </g>
            );
          })}
        </g>
      ) : null}
      {t < kHook - 26 ? <Boom f={f} text="拧开了！" d={kOpen} y={236} size={86} color={GREEN} edge="#FFD60A" per={2.5} /> : null}
    </svg>
  );
};

/* =====================================================================
   主组件
   ===================================================================== */
export const AIKp3: React.FC = () => {
  const f = useCurrentFrame();
  const si = F.reduce((acc, v, i) => (f >= v ? i : acc), 0);
  const lf = f - F[si];
  const zoom = si === 0 ? 1 : 1 + 0.045 * (1 - ez(lf, 9));
  const flash = si === 0 ? 0 : 0.3 * (1 - ez(lf, 7));
  const Scene = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6][si] || Scene1;
  const endFade = TOTAL_FRAMES - f < 24 ? clamp01((TOTAL_FRAMES - f) / 24) : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <radialGradient id="xmBody" cx="36%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#EAF3FF" />
            <stop offset="45%" stopColor="#8CBBFF" />
            <stop offset="100%" stopColor="#2A50C0" />
          </radialGradient>
          <linearGradient id="sodaGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#9CC4FF" />
            <stop offset="100%" stopColor="#5B93F0" />
          </linearGradient>
        </defs>
      </svg>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Scene f={lf} si={si} />
      </AbsoluteFill>
      {flash > 0.01 ? <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity: flash }} /> : null}
      <Caption f={f} />
      <Badge f={f} />
      {SCRIPT.map((_, i) => (
        <Sequence key={i} from={Math.round(F[i])}>
          <Audio src={staticFile(`audio3e/e${i}.mp3`)} />
        </Sequence>
      ))}
      <Sequence from={0} durationInFrames={40}><Audio src={staticFile('sfx/whoosh.wav')} /></Sequence>
      <Audio src={staticFile('bgm_new/175_DigitalClouds.mp3')} loop volume={(fr) =>
        interpolate(fr, [0, 40, TOTAL_FRAMES - 80, TOTAL_FRAMES], [0, 0.07, 0.07, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
      {endFade < 1 ? <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity: 1 - endFade }} /> : null}
    </AbsoluteFill>
  );
};
