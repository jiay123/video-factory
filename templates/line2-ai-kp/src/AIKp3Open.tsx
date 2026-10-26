import React, { useMemo } from 'react';
import {
  AbsoluteFill, useCurrentFrame, interpolate, staticFile, Audio, Sequence,
} from 'remotion';
import { SCRIPT, TOOLS, STATIONS, type ToolKind } from './ep3Script';
import { F, TOTAL_FRAMES } from './ep3Timeline';
import { CHARS } from './ep3Chars';

/* =====================================================================
   EP03《Agent 是怎么动手干活的》· 开头 20 秒 · 竖屏 9:16
   主角：小模（会演的 AI）。老贾 IP 在场（本集不做"嘴里吐字"）。
   铁律：每个镜头都要真动作 —— 不是 PPT。
   镜头1 扑空 / 镜头2 天降工具箱 / 镜头3 长出机械手 / 镜头4 循环流水线
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
  x: number; y: number; s: number; mood: Mood; f: number; rot?: number; flip?: boolean;
  armL?: number; armR?: number;
}> = ({ x, y, s, mood, f, rot = 0, flip = false, armL = 0, armR = 0 }) => {
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
      {/* 眉毛：情绪 */}
      {(mood === 'choke' || mood === 'worried' || mood === 'dizzy') ? (
        <g stroke={NAVY} strokeWidth={6} strokeLinecap="round" fill="none">
          <path d="M -64 -48 q 20 -13 40 -3" />
          <path d="M 24 -50 q 20 -11 40 3" />
        </g>
      ) : null}
      {/* 短手短脚（可动）：armL/armR 绕肩旋转 */}
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

/* ---------------- 火柴人老贾 IP（照搬 NNV.tsx，形象一模一样） ---------------- */
type StPose = { armL: number; armR: number; jump: number; lean: number; headTilt: number };
const STPOSES: Record<string, StPose> = {
  gasp: { armL: -75, armR: -75, jump: 26, lean: -6, headTilt: 10 },
  point: { armL: 20, armR: -80, jump: 10, lean: -6, headTilt: -6 },
  present: { armL: -88, armR: -20, jump: 8, lean: 0, headTilt: -8 },
  win: { armL: -85, armR: -85, jump: 34, lean: 0, headTilt: 0 },
  cheer: { armL: -80, armR: -80, jump: 42, lean: 0, headTilt: 0 },
  talk: { armL: -30, armR: 25, jump: 0, lean: 0, headTilt: 0 },
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

/* ---------------- 工具图标（真矢量，不靠 emoji） ---------------- */
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

/* ---------------- 字幕：横向滚动（与 EP02 一致） ---------------- */
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

/* ---------------- 角标 ---------------- */
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

/* ---------------- 大字：白底贴字块 + 超粗 ---------------- */
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
   镜头1「扑」：小模飞扑想拧开"人类问题"汽水，没手 → 打滑滑落
   ===================================================================== */
const Bottle: React.FC<{ x: number; y: number; wobble: number }> = ({ x, y, wobble }) => (
  <g transform={`translate(${x} ${y}) rotate(${wobble})`}>
    <ellipse cx={0} cy={6} rx={120} ry={20} fill={NAVY} opacity={0.14} />
    {/* 瓶身 */}
    <rect x={-92} y={-330} width={184} height={336} rx={26} fill="#CFE3FF" stroke={NAVY} strokeWidth={5} />
    <rect x={-92} y={-330} width={184} height={336} rx={26} fill="url(#sodaGrad)" opacity={0.7} />
    {/* 汽水液面 */}
    <path d="M -92 -120 L 92 -120 L 92 6 L -92 6 Z" fill="#6FA8FF" opacity={0.45} />
    {/* 瓶颈 */}
    <rect x={-34} y={-420} width={68} height={100} rx={12} fill="#CFE3FF" stroke={NAVY} strokeWidth={5} />
    {/* 瓶盖（纹丝不动的那颗） */}
    <rect x={-42} y={-452} width={84} height={40} rx={10} fill={GOLD} stroke={NAVY} strokeWidth={5} />
    {[-28, -14, 0, 14, 28].map((dx) => (
      <line key={dx} x1={dx} y1={-450} x2={dx} y2={-414} stroke={GOLD_D} strokeWidth={4} />
    ))}
    {/* 标签：人类问题 */}
    <g transform="translate(0 -230)">
      <rect x={-104} y={-44} width={208} height={88} rx={14} fill="#FFFFFF" stroke={RED} strokeWidth={5} />
      <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={RED}>人类问题</text>
    </g>
  </g>
);

const Scene1: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const kReach = Math.max(kf(si, '没有手'), 30);
  const kSlip = kReach + 4;
  const flyU = clamp01((t - 6) / Math.max(1, kReach - 6));
  const fly = bez([120, 1180], [260, 780], [430, 1030], ez(flyU, 1));
  const slipped = t >= kSlip;
  const slipP = slipped ? clamp01((t - kSlip) / 16) : 0;
  const xiaoX = slipped ? lerp(430, 300, ez(slipP, 1)) : fly[0];
  const xiaoY = slipped ? lerp(1030, 1230, ez(slipP, 1)) : fly[1];
  const xiaoRot = slipped ? lerp(0, -28, ez(slipP, 1)) : Math.sin(t / 5) * 4 * flyU;
  const wobble = slipped ? Math.sin((t - kSlip) * 1.6) * 4 * Math.exp(-(t - kSlip) / 26) : 0;
  const arm = slipped ? 105 + Math.sin(t / 4) * 12 : lerp(0, 96, ez(flyU, 1));
  const dust = slipped && t - kSlip < 26
    ? Array.from({ length: 10 }).map((_, i) => {
      const a = (i / 10) * Math.PI * 2;
      const r = ((t - kSlip) / 26) * (90 + rand(i) * 70);
      return <circle key={i} cx={690 + Math.cos(a) * r} cy={1290 + Math.sin(a) * r * 0.5} r={10 - (t - kSlip) / 4} fill="#D6E1EF" opacity={0.85 * (1 - (t - kSlip) / 26)} />;
    })
    : null;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#FFE9E4" f={t} seed={1} />
      <Bottle x={690} y={1300} wobble={wobble} />
      {/* 飞扑速度线 */}
      {!slipped && flyU < 1 ? (
        <g opacity={0.4}>
          {[-40, 30, 90, 150].map((dy, k) => (
            <line key={k} x1={xiaoX - 120 - k * 18} y1={xiaoY + dy} x2={xiaoX - 300 - k * 22} y2={xiaoY + dy}
              stroke={BLUE} strokeWidth={7} strokeLinecap="round" />
          ))}
        </g>
      ) : null}
      <XiaoMo x={xiaoX} y={xiaoY} s={1.05} mood={slipped ? 'dizzy' : 'shock'} f={t} rot={xiaoRot} armL={arm} armR={-arm} />
      {dust}
      {/* 打滑：⚡❓ 冒出 */}
      {slipped ? (
        <g opacity={at(t, kSlip + 2, 8)}>
          <g transform={`translate(${xiaoX - 96} ${xiaoY - 176}) scale(${pop(t, kSlip + 2, 12)})`}>
            <path d="M -14 -26 L 10 -4 L -2 -4 L 14 24 L -12 0 L 2 0 Z" fill={GOLD} stroke={GOLD_D} strokeWidth={3} />
          </g>
          <g transform={`translate(${xiaoX + 92} ${xiaoY - 172}) scale(${pop(t, kSlip + 6, 12)})`}>
            <text textAnchor="middle" fontFamily={FONT} fontSize={70} fontWeight={900} fill={RED}>？</text>
          </g>
        </g>
      ) : null}
      <Slam text="AI 有脑子" d={kf(si, '脑子')} y={250} size={70} color={NAVY} />
      <Slam text="却没有手" d={kSlip} y={362} size={84} color={RED} rot={-4} />
      <LaoJia x={210} y={1490} s={0.86} mode={slipped ? 'gasp' : 'talk'} f={t} />
    </svg>
  );
};

/* =====================================================================
   镜头2「降」：💡 → 工具箱从天砸下 → 弹开 → 四件工具飞出环绕小模
   ===================================================================== */
const Scene2: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const kLight = Math.max(kf(si, '工具'), 16);
  const kDrop = kLight + 10;
  const landed = t >= kDrop + 18;
  const dropU = clamp01((t - kDrop) / 18);
  const boxY = lerp(-320, 980, ezIn(dropU, 1));
  const hit = t - (kDrop + 18);
  const shake = hit > 0 && hit < 20 ? Math.sin(hit * 3.2) * 14 * Math.exp(-hit / 8) : 0;
  const open = clamp01((t - (kDrop + 20)) / 10);
  const dustPuff = landed && hit < 24
    ? Array.from({ length: 14 }).map((_, i) => {
      const a = (i / 14) * Math.PI * 2;
      const r = (hit / 24) * (120 + rand(i) * 90);
      return <circle key={i} cx={540 + Math.cos(a) * r} cy={1010 + Math.sin(a) * r * 0.4} r={12 - hit / 3} fill="#D6E1EF" opacity={0.8 * (1 - hit / 24)} />;
    })
    : null;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#E7F0FF" f={t} seed={3} />
      <g transform={`translate(${shake} 0)`}>
        {/* 小模先蹲角落 */}
        <XiaoMo x={330} y={1000} s={1.0} mood={t < kLight ? 'worried' : 'shock'} f={t}
          armL={t > kLight ? 20 + Math.sin(t / 5) * 14 : 0} armR={t > kLight ? -20 - Math.sin(t / 5) * 14 : 0} />
        {/* 💡 灵感 */}
        {t >= kLight && t < kDrop ? (
          <g transform={`translate(330 ${820}) scale(${pop(t, kLight, 12)})`}>
            <circle cx={0} cy={0} r={40} fill={GOLD} opacity={0.3} />
            <circle cx={0} cy={-4} r={26} fill={GOLD} stroke={GOLD_D} strokeWidth={4} />
            <rect x={-10} y={20} width={20} height={12} rx={3} fill={GREY} />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={Math.cos(a) * 40} y1={-4 + Math.sin(a) * 40} x2={Math.cos(a) * 56} y2={-4 + Math.sin(a) * 56}
                stroke={GOLD} strokeWidth={5} strokeLinecap="round" opacity={0.85} />;
            })}
          </g>
        ) : null}
        {/* 工具箱砸下 */}
        {t >= kDrop ? (
          <g transform={`translate(540 ${boxY})`}>
            <ellipse cx={0} cy={62} rx={150} ry={22} fill={NAVY} opacity={0.16} />
            {/* 箱子下半 */}
            <rect x={-150} y={-60} width={300} height={130} rx={16} fill="#FF8A4C" stroke={NAVY} strokeWidth={6} />
            <rect x={-150} y={-6} width={300} height={22} fill="#E06A2E" />
            {/* 箱盖（弹开） */}
            <g transform={`translate(0 ${-60}) rotate(${-open * 62} -150 0)`}>
              <rect x={-150} y={-70} width={300} height={74} rx={14} fill="#FFA36B" stroke={NAVY} strokeWidth={6} />
              <rect x={-30} y={-24} width={60} height={30} rx={6} fill={GOLD} stroke={GOLD_D} strokeWidth={3} />
            </g>
            {/* 箱子速度线 */}
            {!landed ? (
              <g opacity={0.4}>
                {[-90, 0, 90].map((dx) => (
                  <line key={dx} x1={dx} y1={-140} x2={dx} y2={-90} stroke={GOLD_D} strokeWidth={8} strokeLinecap="round" />
                ))}
              </g>
            ) : null}
          </g>
        ) : null}
        {dustPuff}
        {/* 四件工具飞出，绕小模排成弧形 */}
        {landed
          ? TOOLS.map((tool, i) => {
            const a = -160 + i * 42; // 弧线角（度）
            const rad = (a * Math.PI) / 180;
            const tgt = [330 + Math.cos(rad) * 300, 1000 + Math.sin(rad) * 300];
            const d = kDrop + 20 + i * 6;
            const u = ez(clamp01((t - d) / 16), 1);
            const float = Math.sin(t / 14 + i) * 8;
            const px = lerp(540, tgt[0], u);
            const py = lerp(boxY, tgt[1] + float, u);
            return (
              <g key={tool.kind} transform={`translate(${px} ${py}) rotate(${(1 - u) * 220})`} opacity={u}>
                <ToolIcon kind={tool.kind} size={112} c={tool.c} />
                <text x={0} y={7} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={tool.c}>{tool.label}</text>
              </g>
            );
          })
          : null}
      </g>
      <Slam text="给它一套工具" d={kDrop + 6} y={250} size={72} color={NAVY} />
      <Slam text="它就长本事了" d={kDrop + 30} y={372} size={64} color={GREEN} rot={-3} />
      <LaoJia x={860} y={1500} s={0.82} mode="point" f={t} />
    </svg>
  );
};

/* =====================================================================
   镜头3「伸」：小模右手长出机械臂 → 张嘴咔嚓 → 抓放大镜"查" → ✅
   ===================================================================== */
const Scene3: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const kGrow = Math.max(kf(si, '伸手'), 14);
  const kAgent = kf(si, 'Agent');
  const kUse = kGrow + 34;
  const grow = clamp01((t - kGrow) / 18);
  const ext = ez(grow, 1);
  const using = t >= kUse;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#EAF3EE" f={t} seed={5} />
      {/* 机械臂：从右肩伸出的金属臂（由短变长 → 抓到工具） */}
      <g>
        <XiaoMo x={430} y={1000} s={1.06} mood={using ? 'proud' : 'cool'} f={t} armL={18} armR={0} />
        {/* 金属臂 */}
        {t >= kGrow ? (
          <g transform="translate(430 1000)">
            <g transform={`rotate(${lerp(30, 6, ext)} 84 24)`}>
              <line x1={84} y1={24} x2={84 + 150 * ext} y2={24 + 70 * ext} stroke={STEEL} strokeWidth={20} strokeLinecap="round" />
              <line x1={84} y1={24} x2={84 + 150 * ext} y2={24 + 70 * ext} stroke="#B7C4D4" strokeWidth={9} strokeLinecap="round" />
              {/* 关节 */}
              <circle cx={84 + 80 * ext} cy={24 + 38 * ext} r={11} fill="#5B6A7C" />
              {/* 爪子 */}
              <g transform={`translate(${84 + 150 * ext} ${24 + 70 * ext})`}>
                <path d="M -4 -18 q 24 -8 34 6" stroke={STEEL} strokeWidth={12} fill="none" strokeLinecap="round" />
                <path d="M -4 18 q 24 8 34 -6" stroke={STEEL} strokeWidth={12} fill="none" strokeLinecap="round" />
              </g>
            </g>
            {/* 长臂瞬间的"咔嚓"白闪 */}
            {t >= kGrow && t < kGrow + 8 ? <circle cx={84} cy={24} r={30} fill="#FFFFFF" opacity={1 - (t - kGrow) / 8} /> : null}
          </g>
        ) : null}
      </g>
      {/* 抓到的工具：放大镜"查" */}
      {using ? (
        <g transform={`translate(${lerp(700, 700, 1)} ${lerp(1090, 1000, ez(clamp01((t - kUse) / 16), 1))})`}>
          <ToolIcon kind="glass" size={130} c={BLUE} />
          <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={BLUE}>查</text>
          {/* 扫描光束 */}
          <path d="M 0 66 L 46 240 L -46 240 Z" fill={BLUE} opacity={0.14} />
        </g>
      ) : null}
      {/* 查到的结果卡 ✅ */}
      {t >= kUse + 18 ? (
        <g transform={`translate(800 ${760}) scale(${pop(t, kUse + 18, 14)})`}>
          <rect x={-150} y={-70} width={300} height={140} rx={18} fill="#FFFFFF" stroke={GREEN} strokeWidth={6} />
          <text x={0} y={-8} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={NAVY}>明天 晴 26°</text>
          <text x={0} y={48} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={GREEN}>✓ 查到了</text>
        </g>
      ) : null}
      <Slam text="这就是 Agent" d={kAgent} y={250} size={86} color={GOLD_D} />
      <Slam text="会自己干活的 AI" d={kAgent + 26} y={378} size={58} color={NAVY} rot={-2} />
      <LaoJia x={860} y={1500} s={0.82} mode="win" f={t} />
    </svg>
  );
};

/* =====================================================================
   镜头4「转」：四工位环形流水线依次点亮 → 进度条推进 → 小旗 + 彩纸
   ===================================================================== */
const Scene4: React.FC<{ f: number; si: number }> = ({ f, si }) => {
  const t = f;
  const kLoop = Math.max(kf(si, '转圈'), 16);
  const kDone = kf(si, '办成');
  const cx = 540, cy = 990, R = 292;
  const spin = (t / 30) * 0.9;
  const prog = clamp01((t - kLoop) / Math.max(1, kDone - kLoop));
  const stationsLit = STATIONS.map((_, i) => t >= kLoop + i * 14);
  const done = t >= kDone;
  const stations = STATIONS;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <Backdrop tint="#F0ECFF" f={t} seed={8} />
      <g transform={`translate(${cx} ${cy})`}>
        {/* 传送带轨道 */}
        <circle cx={0} cy={0} r={R} fill="none" stroke={LINE} strokeWidth={26} />
        <g transform={`rotate(${spin * 57.3})`} opacity={0.9}>
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return <circle key={i} cx={Math.cos(a) * R} cy={Math.sin(a) * R} r={7} fill={GREY} />;
          })}
        </g>
        {/* 四个工位 */}
        {stations.map((st, i) => {
          const a = -Math.PI / 2 + (i / 4) * Math.PI * 2;
          const sx = Math.cos(a) * R, sy = Math.sin(a) * R;
          const on = stationsLit[i];
          return (
            <g key={st.key} transform={`translate(${sx} ${sy})`}>
              <circle cx={0} cy={0} r={on ? 62 : 54} fill={on ? st.c : '#FFFFFF'} stroke={NAVY} strokeWidth={5} />
              {on ? <circle cx={0} cy={0} r={62} fill="none" stroke={st.c} strokeWidth={6} opacity={0.4} /> : null}
              <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={on ? 44 : 40} fontWeight={900} fill={on ? '#FFFFFF' : NAVY}>{st.label}</text>
              {on && i < 3 ? (
                <g opacity={0.7}>
                  <path d={`M ${Math.cos(a + 0.5) * 80} ${Math.sin(a + 0.5) * 80} l ${Math.cos(a + 0.5) * 34} ${Math.sin(a + 0.5) * 34}`} stroke={st.c} strokeWidth={6} strokeLinecap="round" />
                </g>
              ) : null}
            </g>
          );
        })}
        {/* 中央：小模 + 齿轮托底转 */}
        <g transform={`rotate(${-spin * 57.3 * 0.6})`} opacity={0.25}>
          <circle cx={0} cy={0} r={120} fill="none" stroke={GOLD_D} strokeWidth={10} strokeDasharray="26 20" />
        </g>
        <XiaoMo x={0} y={0} s={0.86} mood={done ? 'happy' : 'serious'} f={t}
          rot={Math.sin(t / 12) * 4} armL={done ? 96 : 30 + Math.sin(t / 6) * 16} armR={done ? -96 : -30 - Math.sin(t / 6) * 16} />
      </g>
      {/* 进度条：30 → 60 → 100 */}
      <g transform="translate(240 1500)">
        <rect x={0} y={0} width={600} height={40} rx={20} fill="#FFFFFF" stroke={NAVY} strokeWidth={4} />
        <rect x={0} y={0} width={600 * prog} height={40} rx={20} fill={GOLD} />
        <text x={300} y={-16} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={NAVY}>
          任务进度 {Math.round(prog * 100)}%
        </text>
      </g>
      {/* 完工：小旗 + 彩纸 */}
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
      <Slam text="想 · 做 · 看 · 再想" d={kLoop + 6} y={250} size={66} color={NAVY} />
      <Slam text="转圈，直到办成" d={kDone} y={360} size={70} color={GREEN} rot={-3} />
      <LaoJia x={330} y={700} s={0.7} mode="cheer" f={t} />
    </svg>
  );
};

/* =====================================================================
   主组件
   ===================================================================== */
export const AIKp3Open: React.FC = () => {
  const f = useCurrentFrame();
  const si = F.reduce((acc, v, i) => (f >= v ? i : acc), 0);
  const lf = f - F[si];
  const zoom = si === 0 ? 1 : 1 + 0.045 * (1 - ez(lf, 9));
  const flash = si === 0 ? 0 : 0.34 * (1 - ez(lf, 7));
  const Scene = [Scene1, Scene2, Scene3, Scene4][si] || Scene1;
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
      <Sequence from={40} durationInFrames={40}><Audio src={staticFile('sfx/boom.wav')} /></Sequence>
      <Audio src={staticFile('bgm_new/175_DigitalClouds.mp3')} loop volume={(fr) =>
        interpolate(fr, [0, 40, TOTAL_FRAMES - 80, TOTAL_FRAMES], [0, 0.07, 0.07, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
      {endFade < 1 ? <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity: 1 - endFade }} /> : null}
    </AbsoluteFill>
  );
};
