/* =============================================================================
 * EP04 v2《Agent 是怎么转圈的》· 竖屏 9:16 · 无配音 · 快节奏强视觉
 * 老贾 10/24 要求：取消配音；每一秒都有动态镜头；学 T.O.M / 山海 的视觉冲击
 * 手法：俯视图 / 推近 / 拉远 / 抹布 wipe / 快切 / 数字滚动 / 环形回路
 * 内容：通俗讲「Agent = 会自己转圈的模型」（记忆条 → 模型决策 → 调工具 → 结果喂回）
 * ============================================================================= */
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, staticFile, Audio } from 'remotion';
import { CUES, CHARS, TOTAL_SEC, subOf, subLocal } from './ep4v2Cues';

const BG = '#F5F7FA';
const NAVY = '#0A2540';
const BLUE = '#0A84FF';
const GOLD = '#FFB800';
const RED = '#FF3B30';
const GREEN = '#1E9E4A';
const GREY = '#8E9AAB';
const LINE = '#C9D8EA';
const PUPIL = '#0a0a12';
const DARK = '#0B1220';
const FONT = '"Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", sans-serif';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ez = (t: number, d = 12) => 1 - Math.pow(1 - clamp01(t / d), 3);
const eio = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ping = (f: number, p: number) => 0.5 - 0.5 * Math.cos((f / p) * Math.PI * 2);
const cyc = (f: number, p: number) => ((f % p) + p) % p / p;
const pop = (f: number, d: number, dur = 18) => {
  const t = clamp01((f - d) / dur);
  return t >= 1 ? 1 : 1 + 2.4 * Math.pow(t - 1, 3) + 1.3 * Math.pow(t - 1, 2);
};
const rand = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** 镜头推拉：以 (cx,cy) 为中心缩放 */
const zoomT = (sc: number, cx = 540, cy = 960) => `translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})`;

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/* ============================ 背景 ============================ */
const Backdrop: React.FC<{ tint: string; f: number }> = ({ tint, f }) => {
  const dots = useMemo(() => {
    const out: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 52; i++) out.push({ x: rand(i * 3.1) * 1080, y: rand(i * 7.7) * 1920, r: 2 + rand(i * 11.3) * 3 });
    return out;
  }, []);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect x={0} y={0} width={1080} height={1920} fill={BG} />
      <ellipse cx={230 + Math.sin(f / 70) * 100} cy={400} rx={560} ry={430} fill={tint} opacity={0.9} />
      <ellipse cx={890 + Math.cos(f / 90) * 90} cy={1460} rx={520} ry={400} fill="#DCE9FB" opacity={0.7} />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={LINE} opacity={0.45} />
      ))}
    </svg>
  );
};

/* ============================ 透视地面（俯视/远景感） ============================ */
const Grid2: React.FC<{ f: number; sc?: number; op?: number; y?: number }> = ({ f, sc = 1, op = 1, y = 1560 }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <g transform={`translate(540 ${y}) scale(${sc})`} opacity={op}>
      {Array.from({ length: 15 }, (_, i) => {
        const yy = -i * 48;
        const w = 200 + i * 78;
        return <line key={'h' + i} x1={-w} y1={yy} x2={w} y2={yy} stroke={LINE} strokeWidth={2} opacity={0.55 - i * 0.02} />;
      })}
      {Array.from({ length: 11 }, (_, i) => {
        const x = -700 + i * 140;
        return <line key={'v' + i} x1={x} y1={0} x2={x * 0.16} y2={-720} stroke={LINE} strokeWidth={2} opacity={0.4} />;
      })}
      {Array.from({ length: 3 }, (_, i) => {
        const p = cyc(f + i * 30, 90);
        return <line key={'s' + i} x1={-620 + p * 1240} y1={0} x2={-620 + p * 1240} y2={-720} stroke={BLUE} strokeWidth={3} opacity={0.18 * (1 - p)} />;
      })}
    </g>
  </svg>
);

/* ============================ 火柴人 IP ============================ */
type Mood = 'choke' | 'shock' | 'proud' | 'serious' | 'happy' | 'dizzy' | 'cool' | 'worried' | 'neutral';

const XiaoMo: React.FC<{
  x: number; y: number; s: number; mood: Mood; f: number; rot?: number; flip?: boolean; blueFace?: boolean;
  armL?: number; armR?: number;
}> = ({ x, y, s, mood, f, rot = 0, flip = false, blueFace = false, armL, armR }) => {
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
    if (mood === 'shock')
      return (
        <>
          <ellipse cx={-44} cy={-18} rx={36} ry={40} fill={blueFace ? '#D8E8FF' : '#FFFFFF'} stroke={NAVY} strokeWidth={3} />
          <ellipse cx={44} cy={-18} rx={36} ry={40} fill={blueFace ? '#D8E8FF' : '#FFFFFF'} stroke={NAVY} strokeWidth={3} />
          <circle cx={-44} cy={-15} r={13} fill={NAVY} />
          <circle cx={44} cy={-15} r={13} fill={NAVY} />
        </>
      );
    const rx = 30;
    const ry = 32 * blink;
    const px = mood === 'serious' ? -6 : mood === 'proud' ? 6 : 0;
    return (
      <>
        <ellipse cx={-44} cy={-18} rx={rx} ry={ry} fill={blueFace ? '#D8E8FF' : '#FFFFFF'} stroke={NAVY} strokeWidth={3} />
        <ellipse cx={44} cy={-18} rx={rx} ry={ry} fill={blueFace ? '#D8E8FF' : '#FFFFFF'} stroke={NAVY} strokeWidth={3} />
        <circle cx={-44 + px} cy={-15} r={12} fill={NAVY} />
        <circle cx={44 + px} cy={-15} r={12} fill={NAVY} />
        <circle cx={-48 + px} cy={-20} r={4.5} fill="#FFFFFF" />
        <circle cx={40 + px} cy={-20} r={4.5} fill="#FFFFFF" />
      </>
    );
  };
  const mouth = () => {
    if (mood === 'shock') return <ellipse cx={0} cy={40} rx={22} ry={28} fill={NAVY} />;
    if (mood === 'happy' || mood === 'proud')
      return <path d="M -26 30 Q 0 62 26 30" stroke={NAVY} strokeWidth={9} fill="none" strokeLinecap="round" />;
    if (mood === 'serious') return <path d="M -22 38 L 22 38" stroke={NAVY} strokeWidth={9} strokeLinecap="round" />;
    if (mood === 'worried') return <path d="M -24 48 Q 0 26 24 48" stroke={NAVY} strokeWidth={9} fill="none" strokeLinecap="round" />;
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
      <path d="M -74 -30 q 30 -34 62 -12 q -34 18 -62 12 Z" fill="#FFFFFF" opacity={0.4} />
      {eyes()}
      {mouth()}
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

type StPose = { armL: number; armR: number; jump: number; lean: number; headTilt: number };
const STPOSES: Record<string, StPose> = {
  gasp: { armL: -75, armR: -75, jump: 26, lean: -6, headTilt: 10 },
  point: { armL: 20, armR: -80, jump: 10, lean: -6, headTilt: -6 },
  present: { armL: -92, armR: -18, jump: 8, lean: 0, headTilt: -8 },
  win: { armL: -85, armR: -85, jump: 34, lean: 0, headTilt: 0 },
  cheer: { armL: -80, armR: -80, jump: 42, lean: 0, headTilt: 0 },
  talk: { armL: -30, armR: 25, jump: 0, lean: 0, headTilt: 0 },
  throw: { armL: -95, armR: 60, jump: 6, lean: -12, headTilt: -8 },
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

/** SVG 渐变定义（小模身体），每个 Scene 的 <svg> 里都要带一份 */
const Defs: React.FC = () => (
  <defs>
    <radialGradient id="xmBody" cx="32%" cy="26%" r="86%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="60%" stopColor="#EAF2FE" />
      <stop offset="100%" stopColor="#BCD3F2" />
    </radialGradient>
  </defs>
);

/* ============================ 徽章 / 字幕 ============================ */
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

/* ============================ 转场（位移 / 抹布 wipe） ============================ */
const ShotLayer: React.FC<{ start: number; dur: number; fromDir: [number, number]; lead?: number; wipe?: boolean; children: React.ReactNode }> =
  ({ start, dur, fromDir, lead = 5, wipe = false, children }) => {
    const f = useCurrentFrame();
    const local = f - start;
    if (local < -20 || local > dur + 12) return null;
    const inP = clamp01((local + lead) / 8);
    const eIn = 1 - Math.pow(1 - inP, 3);
    const outP = clamp01((local - (dur - 4)) / 8);
    const eOut = eio(outP);
    const dx = fromDir[0] * (1 - eIn) * 70 - fromDir[0] * eOut * 80;
    const dy = fromDir[1] * (1 - eIn) * 90 - fromDir[1] * eOut * 80;
    const sc = (0.9 + 0.1 * eIn) * (1 + 0.16 * eOut) * (1 + 0.014 * Math.sin(local / 13));
    const w = clamp01((local + 4) / 14);
    return (
      <>
        <div style={{
          position: 'absolute', inset: 0,
          transform: wipe ? undefined : `translate(${dx}px, ${dy}px) scale(${sc})`,
          clipPath: wipe ? `inset(0 ${(1 - w) * 100}% 0 0)` : undefined,
          opacity: local < dur ? clamp01((local + lead) / lead) : 0,
        }}>
          {children}
        </div>
        {wipe && w < 1 ? (
          <div style={{
            position: 'absolute', top: -140, bottom: -140, left: `${-14 + w * 114}%`, width: '12%',
            transform: 'skewX(-10deg)',
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 40%, rgba(255,255,255,0.45) 68%, rgba(255,255,255,0) 100%)',
            boxShadow: '0 0 100px rgba(10,37,64,0.10)',
            opacity: Math.min(1, Math.sin(Math.PI * w) * 2),
          }} />
        ) : null}
      </>
    );
  };

/* ============================ 幕1 · 一句话 → 全自动 ============================ */
const S1: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  const k = subOf(l);
  const u = subLocal(l);
  const cam = k === 0 ? lerp(0.72, 1.06, eio(clamp01(u / 60))) : lerp(1.22, 0.94, eio(clamp01(u / 60)));
  const typed = k === 0 ? Math.floor(clamp01((u - 8) / 34) * 12) : 12;
  return (
    <>
      <Grid2 f={f} sc={k === 0 ? 0.9 : 1.15} op={0.9} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Defs />
        <g transform={zoomT(cam, 540, 900)}>
          {k === 0 ? (
            <>
              <g opacity={ez(l - 4, 12)}>
                <rect x={140} y={620} width={800} height={190} rx={40} fill="#FFFFFF" stroke={NAVY} strokeWidth={8} />
                <rect x={182} y={690} width={4} height={52} rx={2} fill={BLUE} opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 6))} />
                <text x={210} y={730} fontFamily={FONT} fontSize={54} fontWeight={900} fill={NAVY}>
                  {'帮我做个网站'.slice(0, typed)}
                </text>
                <text x={540} y={880} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={GREY}>
                  你就说了这一句
                </text>
              </g>
              {Array.from({ length: 3 }, (_, i) => {
                const p = cyc(f + i * 22, 66);
                return <circle key={i} cx={540 + Math.cos(i * 2.1) * 240} cy={1000 + p * 120} r={9 + p * 8} fill={BLUE} opacity={(1 - p) * 0.5} />;
              })}
            </>
          ) : (
            <>
              {Array.from({ length: 9 }, (_, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const x = 200 + col * 260;
                const y = 560 + row * 220;
                const on = ez(l - (60 + i * 3), 10);
                const bobY = Math.sin(f / 12 + i) * 8;
                return (
                  <g key={i} opacity={on} transform={`translate(${x} ${y + bobY}) scale(${0.85 + 0.15 * on})`}>
                    <rect x={-110} y={-80} width={220} height={160} rx={18} fill="#FFFFFF" stroke={i % 2 ? GOLD : BLUE} strokeWidth={6} />
                    <rect x={-86} y={-54} width={140} height={12} rx={6} fill={LINE} />
                    <rect x={-86} y={-28} width={172} height={12} rx={6} fill={LINE} />
                    <rect x={-86} y={-2} width={96} height={12} rx={6} fill={LINE} />
                    <circle cx={72} cy={52} r={14} fill={i % 2 ? GOLD : BLUE} opacity={0.9} />
                  </g>
                );
              })}
              <text x={540} y={1320} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={NAVY}>
                它自己全动起来了
              </text>
            </>
          )}
        </g>
      </svg>
    </>
  );
};

/* ============================ 幕2 · 不是一次答完 ============================ */
const S2: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  const k = subOf(l);
  const u = subLocal(l);
  const cam = k === 0 ? lerp(1.2, 0.95, eio(clamp01(u / 60))) : lerp(0.8, 1.05, eio(clamp01(u / 60)));
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Defs />
      <g transform={zoomT(cam, 540, 900)}>
        {k === 0 ? (
          <>
            <g opacity={ez(l - 4, 12)}>
              <rect x={230} y={520} width={620} height={150} rx={34} fill="#FFFFFF" stroke={GREY} strokeWidth={7} />
              <text x={540} y={615} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={GREY}>一次就答完？</text>
              <line x1={250} y1={545} x2={830} y2={645} stroke={RED} strokeWidth={12} strokeLinecap="round" opacity={ez(l - 34, 10)} />
            </g>
            <text x={540} y={900} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY} opacity={ez(l - 50, 12)}>
              不对
            </text>
          </>
        ) : (
          <>
            <g opacity={ez(l - 62, 14)}>
              <circle cx={540} cy={900} r={300} fill="none" stroke={LINE} strokeWidth={14} />
              <circle cx={540} cy={900} r={300} fill="none" stroke={BLUE} strokeWidth={14} strokeLinecap="round"
                strokeDasharray={1885} strokeDashoffset={1885 * (1 - clamp01((l - 66) / 70))} transform="rotate(-90 540 900)" />
              {Array.from({ length: 3 }, (_, i) => {
                const a = (l - 66) / 70 * Math.PI * 2 + i * 2.1;
                const on = (l - 66) / 70 > i * 0.12;
                return (
                  <g key={i} opacity={on ? 1 : 0}>
                    <circle cx={540 + Math.cos(a) * 300} cy={900 + Math.sin(a) * 300} r={26} fill={i === 0 ? GOLD : i === 1 ? BLUE : GREEN} stroke={NAVY} strokeWidth={5} />
                    <circle cx={540 + Math.cos(a + 0.2) * 300} cy={900 + Math.sin(a + 0.2) * 300} r={12} fill={NAVY} opacity={0.2} />
                  </g>
                );
              })}
              <circle cx={540} cy={900} r={150} fill="#FFFFFF" stroke={NAVY} strokeWidth={8} />
              <text x={540} y={890} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900} fill={NAVY}>Agent</text>
              <text x={540} y={945} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill={GREY}>在转圈</text>
            </g>
          </>
        )}
      </g>
    </svg>
  );
};

/* ============================ 幕3 · 读进记忆条 ============================ */
const FILES = ['main.py', 'app.tsx', 'README', 'config', 'api.js', 'test'];
const S3: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  const k = subOf(l);
  const u = subLocal(l);
  const cam = k === 0 ? lerp(0.95, 1.12, eio(clamp01(u / 60))) : lerp(1.3, 1.0, eio(clamp01(u / 60)));
  const fill0 = clamp01((l - 40) / 60);
  const fill = k === 0 ? 0 : fill0;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Defs />
      <g transform={zoomT(cam, 540, 950)}>
        {k <= 1 &&
          FILES.map((nm, i) => {
            const p = cyc(f * 1.3 + i * 9, 58);
            const e = eio(p);
            const sx = 150 + (i % 3) * 380;
            const sy = 560 + Math.floor(i / 3) * 200;
            const x = lerp(sx, 540, e);
            const y = lerp(sy, 1080, e);
            const op = ez(l - 4, 10) * Math.min(1, (1 - p) * 5) * Math.min(1, p * 6);
            return (
              <g key={i} opacity={op} transform={`translate(${x} ${y}) rotate(${p * 160 - 60}) scale(${1 - 0.4 * e})`}>
                <rect x={-90} y={-52} width={180} height={104} rx={14} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} />
                <text x={0} y={10} textAnchor="middle" fontFamily="Consolas, monospace" fontSize={26} fontWeight={800} fill={NAVY}>{nm}</text>
              </g>
            );
          })}
        <g transform={`translate(540 ${k === 0 ? 1080 : 950})`}>
          <rect x={-380} y={-70} width={760} height={140} rx={26} fill="#FFFFFF" stroke={NAVY} strokeWidth={9} />
          <rect x={-368} y={-58} width={Math.max(0, 736 * fill)} height={116} rx={18} fill={BLUE} opacity={0.35} />
          <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={NAVY}>记忆条</text>
          {k >= 1 && (
            <>
              <rect x={-380} y={110} width={760} height={26} rx={13} fill="#E7EDF5" />
              <rect x={-380} y={110} width={760 * fill0} height={26} rx={13} fill={GOLD} />
              <text x={0} y={200} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={GOLD}>
                {Math.round(fill0 * 100)}% 装进去了
              </text>
            </>
          )}
        </g>
      </g>
    </svg>
  );
};

/* ============================ 幕4 · 拍板的是模型 ============================ */
const S4: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  const k = subOf(l);
  const u = subLocal(l);
  const cam = k === 0 ? lerp(0.6, 1.7, eio(clamp01(u / 55))) : lerp(1.5, 1.0, eio(clamp01(u / 60)));
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Defs />
      <g transform={zoomT(cam, 540, 950)}>
        <rect x={-500} y={-400} width={2080} height={2700} fill="none" />
        {Array.from({ length: 40 }, (_, i) => (
          <rect key={i} x={rand(i) * 1080} y={rand(i + 99) * 1920} width={34} height={22} rx={4}
            fill={i % 4 === 0 ? BLUE : LINE} opacity={0.35 + 0.3 * Math.sin(f / 20 + i)} />
        ))}
        <g transform={`translate(540 950)`}>
          <circle cx={0} cy={0} r={210 + 8 * Math.sin(f / 12)} fill="#FFFFFF" stroke={NAVY} strokeWidth={10} />
          <circle cx={0} cy={0} r={150 + 16 * Math.sin(f / 9)} fill={GOLD} opacity={0.18} />
          {Array.from({ length: 3 }, (_, i) => {
            const p = cyc(f + i * 24, 72);
            return <circle key={i} cx={0} cy={0} r={120 + p * 150} fill="none" stroke={GOLD} strokeWidth={6} opacity={(1 - p) * 0.7} />;
          })}
          <XiaoMo x={0} y={0} s={0.9} mood={k === 1 ? 'proud' : 'serious'} f={f} blueFace />
          {k === 0 && (
            <text x={0} y={250} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={GREY}>
              拍板的，就是它
            </text>
          )}
        </g>
      </g>
    </svg>
  );
};

/* ============================ 幕5 · 它只会说：调这个工具 ============================ */
const TOOLS = ['搜索', '写文件', '跑命令', '读网页'];
const S5: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  const k = subOf(l);
  const u = subLocal(l);
  const cam = k === 0 ? lerp(0.9, 1.15, eio(clamp01(u / 60))) : lerp(1.25, 0.98, eio(clamp01(u / 60)));
  const fly = k === 0 ? 0 : eio(clamp01((u - 6) / 34));
  const hit = k === 1 && u > 40 ? Math.sin((u - 40) * 1.4) * 10 * Math.max(0, 1 - (u - 40) / 20) : 0;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Defs />
      <g transform={zoomT(cam, 540, 950)}>
        <g transform={`translate(540 520)`}>
          <XiaoMo x={0} y={0} s={0.72} mood="serious" f={f} blueFace armL={-40} armR={40} />
          <g transform={`translate(210 ${-40 + hit})`} opacity={ez(l - 8, 10)}>
            <rect x={-150} y={-48} width={300} height={96} rx={26} fill={GOLD} stroke={NAVY} strokeWidth={6} />
            <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900} fill={NAVY}>调这个工具</text>
            <path d="M -150 0 L -186 24 L -150 34 Z" fill={GOLD} stroke={NAVY} strokeWidth={5} />
          </g>
        </g>
        {TOOLS.map((nm, i) => {
          const x = 190 + i * 234;
          const y = 1090;
          const sel = k === 1 && i === 1;
          return (
            <g key={i} transform={`translate(${x} ${y + (sel ? hit : 0)}) scale(${sel ? 1.08 : 1})`} opacity={ez(l - (6 + i * 6), 10)}>
              <rect x={-96} y={-96} width={192} height={192} rx={28} fill="#FFFFFF" stroke={sel ? GOLD : LINE} strokeWidth={sel ? 9 : 6} />
              <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={sel ? GOLD : NAVY}>{nm}</text>
              {sel ? <circle cx={0} cy={0} r={110} fill="none" stroke={GOLD} strokeWidth={4} opacity={0.5 + 0.5 * Math.sin(f / 6)} /> : null}
            </g>
          );
        })}
        {k === 1 && (
          <>
            <path d={`M 540 620 L ${540 + fly * (424 - 540)} ${620 + fly * (1090 - 620)}`} stroke={GOLD} strokeWidth={10} strokeLinecap="round" strokeDasharray="18 14" opacity={0.8} />
            <circle cx={lerp(540, 424, fly)} cy={lerp(620, 1090, fly)} r={20} fill={GOLD} stroke={NAVY} strokeWidth={5} />
          </>
        )}
      </g>
    </svg>
  );
};

/* ============================ 幕6 · 外面那层真的去调 ============================ */
const S6: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  const k = subOf(l);
  const u = subLocal(l);
  const cam = k === 0 ? lerp(1.05, 1.25, eio(clamp01(u / 60))) : lerp(1.3, 0.98, eio(clamp01(u / 60)));
  const back = k === 0 ? 0 : k === 1 ? eio(clamp01((u - 8) / 40)) : 1;
  const hitFlash = k === 1 && u > 48 ? Math.max(0, 1 - (u - 48) / 10) : 0;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Defs />
      <g transform={zoomT(cam, 540, 950)}>
        <g transform={`translate(540 640)`} opacity={ez(l - 4, 12)}>
          <circle cx={0} cy={0} r={130} fill="#FFFFFF" stroke={NAVY} strokeWidth={9} />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={-14} y={-108} width={28} height={46} rx={8} fill={BLUE}
              transform={`rotate(${i * 45 + f * 6})`} />
          ))}
          <circle cx={0} cy={0} r={38} fill={NAVY} />
          <text x={0} y={210} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill={GREY}>外面那层，真的在调</text>
        </g>
        {Array.from({ length: 5 }, (_, i) => {
          const p = cyc(f * 1.2 + i * 13, 60);
          return <circle key={i} cx={540 + Math.sin(p * Math.PI * 2 + i) * 120} cy={830 + p * 260} r={10 + p * 10} fill={GOLD} opacity={(1 - p) * 0.7} />;
        })}
        {k === 0 ? (
          <g transform={`translate(540 ${1180 + Math.sin(f / 8) * 6})`}>
            <ellipse cx={0} cy={0} rx={120} ry={80} fill="#FFFFFF" stroke={GOLD} strokeWidth={7} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={GOLD}>结果</text>
          </g>
        ) : (
          <g transform={`translate(${540 + Math.sin(back * Math.PI) * 30} ${lerp(1180, 700, back)})`}>
            <ellipse cx={0} cy={0} rx={110} ry={74} fill="#FFFFFF" stroke={GOLD} strokeWidth={7} />
            <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill={GOLD}>结果</text>
          </g>
        )}
      </g>
      {hitFlash > 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={hitFlash * 0.55} /> : null}
    </svg>
  );
};

/* ============================ 幕7 · 这就是一个圈 ============================ */
const S7: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  const k = subOf(l);
  const u = subLocal(l);
  const cam = k === 0 ? lerp(1.12, 0.98, eio(clamp01(u / 60))) : lerp(0.72, 1.0, eio(clamp01(u / 60)));
  const laps = 1 + (k === 1 ? 1 : 0);
  const prog = clamp01((l - 14) / (56 * laps));
  const ang = prog * Math.PI * 2 * laps - Math.PI / 2;
  const CX = 540, CY = 950, R = 330;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Defs />
      <Grid2 f={f} sc={k === 1 ? 0.85 : 1} op={k === 1 ? 0.8 : 0.25} y={1600} />
      <g transform={zoomT(cam, 540, 950)}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={LINE} strokeWidth={18} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={BLUE} strokeWidth={18} strokeLinecap="round"
          strokeDasharray={2 * Math.PI * R} strokeDashoffset={2 * Math.PI * R * (1 - clamp01(prog * laps))} transform={`rotate(-90 ${CX} ${CY})`} />
        {/* 四个站点 */}
        {[
          { a: -Math.PI / 2, label: '读进去', c: BLUE },
          { a: 0, label: '做决定', c: GOLD },
          { a: Math.PI / 2, label: '调工具', c: GREEN },
          { a: Math.PI, label: '喂回来', c: RED },
        ].map((s, i) => {
          const x = CX + Math.cos(s.a) * R;
          const y = CY + Math.sin(s.a) * R;
          const lx = CX + Math.cos(s.a) * (R + 104);
          const ly = CY + Math.sin(s.a) * (R + 104) + 12;
          const on = prog * laps > i * 0.25;
          return (
            <g key={i} opacity={on ? 1 : 0.38}>
              <circle cx={x} cy={y} r={54} fill="#FFFFFF" stroke={s.c} strokeWidth={8} />
              <circle cx={x} cy={y} r={22} fill={s.c} opacity={0.85} />
              <text x={lx} y={ly} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill={s.c}
                stroke="#FFFFFF" strokeWidth={7} paintOrder="stroke">{s.label}</text>
            </g>
          );
        })}
        <XiaoMo x={CX} y={CY} s={0.62} mood="proud" f={f} blueFace />
        <circle cx={CX + Math.cos(ang) * R} cy={CY + Math.sin(ang) * R} r={26} fill={GOLD} stroke={NAVY} strokeWidth={5} />
        <circle cx={CX + Math.cos(ang - 0.28) * R} cy={CY + Math.sin(ang - 0.28) * R} r={14} fill={GOLD} opacity={0.45} />
      </g>
    </svg>
  );
};

/* ============================ 幕8 · 越转越满 ============================ */
const S8: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  const k = subOf(l);
  const u = subLocal(l);
  const cam = k === 0 ? lerp(1.0, 1.18, eio(clamp01(u / 60))) : lerp(1.1, 1.28, eio(clamp01(u / 60)));
  const cells = 5 * 4;
  const cellIn = (i: number) => clamp01((l - (i * 3)) / 8);
  const over = clamp01((l - 70) / 20);
  const shake = over > 0 ? Math.sin(f * 3.2) * 9 * over : 0;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Defs />
      <g transform={zoomT(cam, 540, 950)}>
        <g transform={`translate(${540 + shake} 950)`}>
          <rect x={-380} y={-300} width={760} height={600} rx={30} fill="#FFFFFF" stroke={over > 0.3 ? RED : NAVY} strokeWidth={9 + 3 * over} />
          {Array.from({ length: cells }, (_, i) => {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = -330 + col * 140;
            const y = -250 + row * 130;
            const inn = cellIn(i);
            const isOver = k === 1 && i >= cells - 3;
            return (
              <g key={i} opacity={inn} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * inn})`}>
                <rect x={-58} y={-50} width={116} height={100} rx={14} fill={isOver ? RED : (i % 3 === 0 ? BLUE : GOLD)} opacity={0.28 + 0.5 * over} stroke={isOver ? RED : LINE} strokeWidth={3} />
              </g>
            );
          })}
          <text x={0} y={340} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={over > 0.3 ? RED : NAVY}>
            {over > 0.3 ? '满了 · 装不下了' : '记忆条'}
          </text>
        </g>
        <circle cx={540} cy={950} r={430} fill="none" stroke={over > 0.3 ? RED : LINE} strokeWidth={6}
          opacity={0.4 * over + 0.2} strokeDasharray="16 14" strokeDashoffset={-f * 3} />
      </g>
    </svg>
  );
};

/* ============================ 幕9 · 压成一段摘要 ============================ */
const S9: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  const k = subOf(l);
  const u = subLocal(l);
  const cam = k === 0 ? lerp(1.06, 0.98, eio(clamp01(u / 60))) : lerp(1.35, 1.0, eio(clamp01(u / 60)));
  const wipe = k === 0 ? clamp01((u - 10) / 40) : 1;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Defs />
      <g transform={zoomT(cam, 540, 950)}>
        <g opacity={1 - wipe * 0.9}>
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={140 + (i % 4) * 210} y={560 + Math.floor(i / 4) * 240} width={180} height={200} rx={16}
              fill="#FFFFFF" stroke={LINE} strokeWidth={5} opacity={0.9} />
          ))}
        </g>
        <clipPath id="s9clip"><rect x={-420} y={-260} width={840 * wipe} height={520} /></clipPath>
        <g transform="translate(540 950)" clipPath="url(#s9clip)">
          <rect x={-420} y={-120} width={840} height={240} rx={30} fill="#FFFFFF" stroke={GOLD} strokeWidth={9} />
          <text x={0} y={-20} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={GOLD}>一段摘要</text>
          <rect x={-340} y={20} width={680} height={14} rx={7} fill={LINE} />
          <rect x={-340} y={56} width={420} height={14} rx={7} fill={LINE} />
        </g>
        {k >= 1 && (
          <g opacity={ez(l - 66, 12)}>
            {Array.from({ length: 14 }, (_, i) => {
              const p = cyc(f * 1.5 + i * 6, 50);
              return <rect key={i} x={lerp(540, 150 + (i % 4) * 240, 1 - p)} y={lerp(950, 1500, p)} width={24} height={16} rx={4} fill={BLUE} opacity={(1 - p) * 0.7} />;
            })}
            <text x={540} y={1330} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={NAVY}>腾出地方，接着转</text>
          </g>
        )}
      </g>
    </svg>
  );
};

/* ============================ 幕10 · 拿不准就问你 ============================ */
const S10: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  const k = subOf(l);
  const u = subLocal(l);
  const cam = k === 0 ? lerp(1.2, 1.0, eio(clamp01(u / 60))) : lerp(1.0, 1.18, eio(clamp01(u / 60)));
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Defs />
      <g transform={zoomT(cam, 540, 950)}>
        <g opacity={ez(l - 4, 12)}>
          <circle cx={540} cy={700} r={200} fill="none" stroke={GOLD} strokeWidth={16} strokeDasharray="18 16" strokeDashoffset={f * 4} />
          <text x={540} y={790} textAnchor="middle" fontFamily={FONT} fontSize={260} fontWeight={900} fill={GOLD}>?</text>
        </g>
        {k >= 1 && (
          <g opacity={ez(l - 62, 14)} transform={`translate(540 ${1180 + Math.sin(f / 10) * 6})`}>
            <rect x={-360} y={-90} width={720} height={180} rx={40} fill="#FFFFFF" stroke={NAVY} strokeWidth={8} />
            <text x={0} y={-14} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill={NAVY}>这一步要删哪个文件？</text>
            <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={GREY}>停下来问你</text>
            <path d="M -220 -90 L -260 -140 L -180 -90 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={8} />
          </g>
        )}
        {k === 0 && (
          <g transform={`translate(540 1260)`}>
            <XiaoMo x={0} y={0} s={0.78} mood="worried" f={f} blueFace />
          </g>
        )}
      </g>
    </svg>
  );
};

/* ============================ 幕11 · 对比 ============================ */
const S11: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  const k = subOf(l);
  const u = subLocal(l);
  const cam = k === 0 ? lerp(1.0, 1.08, eio(clamp01(u / 60))) : lerp(0.82, 1.0, eio(clamp01(u / 60)));
  const line = clamp01((l - 20) / 40);
  const loop = clamp01((l - 26) / 70);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Defs />
      <g transform={zoomT(cam, 540, 950)}>
        <line x1={540} y1={420} x2={540} y2={1400} stroke={LINE} strokeWidth={4} strokeDasharray="12 12" />
        {/* 左：ChatGPT */}
        <g transform="translate(290 950)">
          <text x={0} y={-420} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={GREY}>ChatGPT</text>
          <line x1={-40} y1={-40} x2={40} y2={-40} stroke={GREY} strokeWidth={12} strokeLinecap="round" />
          <line x1={0} y1={-40} x2={0} y2={-40 + 260 * line} stroke={GREY} strokeWidth={12} strokeLinecap="round" opacity={0.25} />
          <circle cx={0} cy={-40 + 260 * line} r={26} fill={GREY} stroke={NAVY} strokeWidth={5} />
          <text x={0} y={300} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill={GREY} opacity={ez(l - 56, 10)}>答一句，就停</text>
        </g>
        {/* 右：Agent */}
        <g transform="translate(790 950)">
          <text x={0} y={-420} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={BLUE}>Agent</text>
          <circle cx={0} cy={-40} r={130} fill="none" stroke={GOLD} strokeWidth={14} />
          <circle cx={0} cy={-40} r={130} fill="none" stroke={BLUE} strokeWidth={14} strokeLinecap="round"
            strokeDasharray={817} strokeDashoffset={817 * (1 - loop)} transform={`rotate(-90 0 -40)`} />
          <circle cx={0 + Math.cos(loop * Math.PI * 2 - Math.PI / 2) * 130} cy={-40 + Math.sin(loop * Math.PI * 2 - Math.PI / 2) * 130} r={24} fill={GOLD} stroke={NAVY} strokeWidth={5} />
          <text x={0} y={-28} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={NAVY}>转</text>
          <text x={0} y={300} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill={BLUE} opacity={ez(l - 70, 10)}>自己把活干完</text>
        </g>
        {k >= 1 && (
          <g opacity={ez(l - 96, 10)} transform={`translate(940 700) scale(${pop(l, 96, 14)})`}>
            <circle cx={0} cy={0} r={52} fill={GREEN} />
            <path d="M -24 0 L -8 18 L 26 -18" stroke="#FFFFFF" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </g>
    </svg>
  );
};

/* ============================ 幕12 · Agent = 会转圈的模型 ============================ */
const S12: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  const k = subOf(l);
  const u = subLocal(l);
  const cam = k === 0 ? lerp(0.78, 1.06, eio(clamp01(u / 60))) : lerp(1.25, 0.95, eio(clamp01(u / 60)));
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Defs />
      <Grid2 f={f} sc={k === 1 ? 0.9 : 1.1} op={k === 1 ? 0.7 : 0.3} y={1560} />
      <g transform={zoomT(cam, 540, 950)}>
        <circle cx={540} cy={930} r={340} fill="none" stroke={GOLD} strokeWidth={10} strokeDasharray="22 18" strokeDashoffset={-f * 3} />
        <circle cx={540} cy={930} r={400} fill="none" stroke={BLUE} strokeWidth={4} opacity={0.35} strokeDasharray="10 16" strokeDashoffset={f * 2} />
        <text x={540} y={1010} textAnchor="middle" fontFamily={FONT} fontSize={190} fontWeight={900} fill={NAVY} opacity={ez(l - 6, 12)}
          letterSpacing={-4}>Agent</text>
        <text x={540} y={1160} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={GOLD} opacity={ez(l - 40, 12)}>
          会自己转圈的模型
        </text>
        <XiaoMo x={540} y={1400} s={0.8} mood="proud" f={f} blueFace />
      </g>
    </svg>
  );
};

/* ============================ 幕13 · 下集钩子（硬盘） ============================ */
const S13: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  const k = subOf(l);
  const u = subLocal(l);
  const cam = k === 0 ? lerp(0.8, 1.05, eio(clamp01(u / 60))) : lerp(1.4, 1.05, eio(clamp01(u / 60)));
  const n = 175000000000 * ez(l - 10, 46);
  const landed = l >= 56;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Defs />
      <g transform={zoomT(cam, 540, 950)}>
        <text x={540} y={470} textAnchor="middle" fontFamily={FONT} fontSize={landed ? 150 : 78} fontWeight={900} fill={NAVY} letterSpacing={-2}>
          {landed ? '1750 亿' : fmt(n)}
        </text>
        <text x={540} y={570} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={GREY} opacity={ez(l - 40, 12)}>个参数</text>
        {Array.from({ length: 12 }, (_, i) => {
          const p = cyc(f * 1.5 + i * 7, 56);
          return <rect key={i} x={lerp(200 + (i % 6) * 130, 540, p)} y={lerp(700, 1150, p)} width={30} height={20} rx={5} fill={i % 3 === 0 ? BLUE : GOLD} opacity={(1 - p) * 0.8} />;
        })}
        <g transform={`translate(540 ${1300 + (landed ? (l - 56) * -0.2 : 0)}) scale(${0.9 + 0.1 * ez(l - 50, 14)})`}>
          <ellipse cx={0} cy={150} rx={250} ry={26} fill={NAVY} opacity={0.13} />
          <rect x={-230} y={-130} width={460} height={260} rx={32} fill={DARK} stroke={NAVY} strokeWidth={7} />
          <rect x={-208} y={-108} width={416} height={216} rx={20} fill="#22384E" />
          <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#9FB3C8" letterSpacing={6}>POCKET DRIVE</text>
          <text x={0} y={54} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={GOLD}>350 G</text>
          <circle cx={176} cy={-88} r={10} fill={Math.sin(f / 5) > 0 ? GREEN : '#1E6B3A'} />
        </g>
      </g>
    </svg>
  );
};

/* ============================ 幕14 · 点赞关注转发 ============================ */
const TAGS = [
  { t: '点赞', c: RED },
  { t: '关注', c: BLUE },
  { t: '转发', c: GREEN },
];
const S14: React.FC<{ f: number; l: number; t: number }> = ({ f, l }) => {
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Defs />
      <text x={540} y={640} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={NAVY}
        opacity={ez(l - 2, 10)} transform={`scale(${1 + 0.012 * Math.sin(f / 9)})`} style={{ transformOrigin: '540px 640px' }}>
        下集：1750 亿个参数
      </text>
      {TAGS.map((tag, i) => {
        const p = pop(l, 26 + i * 9, 14);
        const fy = Math.sin(f / 12 + i) * 7;
        return (
          <g key={i} transform={`translate(${180 + i * 360} ${980 + fy}) scale(${p})`}>
            <rect x={-150} y={-58} width={300} height={116} rx={58} fill={tag.c} />
            <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900} fill="#FFFFFF">{tag.t}</text>
          </g>
        );
      })}
      <g transform={`translate(540 ${1380 + 5 * Math.sin(f / 13)})`}>
        <XiaoMo x={0} y={0} s={0.8} mood="happy" f={f} armL={-150 + 25 * Math.sin(f / 6)} armR={150 - 25 * Math.sin(f / 6)} />
      </g>
      <text x={540} y={1660} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={800} fill={GREY} opacity={ez(l - 62, 12)}>
        AI 科普 · 火柴人老贾
      </text>
    </svg>
  );
};

/* ============================ 主组件 ============================ */
const LJ = [
  { x: 172, y: 1420, s: 0.78, mode: 'present' },
  { x: 880, y: 1420, s: 0.74, mode: 'point' },
  { x: 158, y: 1430, s: 0.74, mode: 'talk' },
  { x: 890, y: 1425, s: 0.74, mode: 'point' },
  { x: 160, y: 1435, s: 0.74, mode: 'throw' },
  { x: 880, y: 1425, s: 0.74, mode: 'present' },
  { x: 160, y: 1435, s: 0.74, mode: 'present' },
  { x: 890, y: 1430, s: 0.74, mode: 'gasp' },
  { x: 158, y: 1435, s: 0.74, mode: 'talk' },
  { x: 890, y: 1425, s: 0.74, mode: 'gasp' },
  { x: 160, y: 1435, s: 0.74, mode: 'point' },
  { x: 890, y: 1425, s: 0.74, mode: 'present' },
  { x: 160, y: 1435, s: 0.74, mode: 'point' },
  { x: 890, y: 1400, s: 0.78, mode: 'cheer' },
];
const TINTS = ['#E8F0FF', '#E9F7EF', '#FFF6E0', '#FDECEC', '#E8F0FF', '#E9F7EF', '#FFF6E0', '#FDECEC', '#E8F0FF', '#E9F7EF', '#FFF6E0', '#FDECEC', '#E8F0FF', '#E9F7EF'];
const DIRS: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0], [0, 1], [1, 0], [0, -1], [-1, 0], [0, 1], [1, 0], [0, -1], [-1, 0], [0, 1], [0, -1]];

export const EP04V2: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < CUES.length; i++) {
    seg = i;
    if (t < CUES[i].end) break;
  }
  const spot = LJ[seg] ?? LJ[0];
  const tint = TINTS[seg] ?? '#E8F0FF';
  const S = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14];
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Backdrop tint={tint} f={frame} />
      {CUES.map((c, i) => {
        const Scene = S[i];
        if (!Scene) return null;
        return (
          <ShotLayer key={i} start={Math.round(c.start * 30)} dur={Math.round(c.dur * 30)} fromDir={DIRS[i] ?? [0, 1]} wipe={i % 3 === 1}>
            <Scene f={frame} l={frame - Math.round(c.start * 30)} t={t} />
          </ShotLayer>
        );
      })}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Defs />
        <LaoJia x={spot.x} y={spot.y} s={spot.s} mode={spot.mode} f={frame} wag={true} />
      </svg>
      <Badge f={frame} />
      <Subtitle seg={seg} t={t} />
      <Audio src={staticFile('bgm_midnight.m4a')} startFrom={225} volume={1} />
    </AbsoluteFill>
  );
};

export const EP04V2_FRAMES = Math.ceil(TOTAL_SEC * 30) + 24;
