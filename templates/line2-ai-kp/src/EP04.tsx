/* =============================================================================
 * EP04《Agent 是怎么转圈的》· 竖屏 9:16 · 20秒试片
 * 对标：Arthur Katcher《40秒讲清 coding agent 怎么工作》(2026-09-27)
 * 合流：他的骨架（一幕一个点/拍点卡刀/贯穿线索/意外数字）
 *       + 我们的血肉（竖屏/火柴人老贾IP/逐字字幕/edge-tts）
 * 铁律：每幕必须"演出来"不是"摆出来"；老贾出现的地方字从嘴里吐出来
 * ============================================================================= */
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, staticFile, Audio } from 'remotion';
import { CUES, CHARS, charAt } from './ep4Chars';
import { T, TOTAL_FRAMES, LAPS, LOOP_START, LOOP_END } from './ep4Timeline';

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

/* 老贾嘴的屏幕坐标：LaoJia 内部 scale(s*1.42) translate(-105,-105)，嘴在 (105,70) */
const mouthOf = (x: number, y: number, s: number): Pt => ({ x, y: y - 50 * s });

/* 从老贾嘴里吐出：抛物线飞到位 */
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

/* ---------------- 背景（科普线浅色系 + 粒子 + 双色晕） ---------------- */
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

/* ---------------- 火柴人老贾 IP（照搬 AIKp3.tsx 形象，9 姿态） ---------------- */
type StPose = { armL: number; armR: number; jump: number; lean: number; headTilt: number };
const STPOSES: Record<string, StPose> = {
  gasp: { armL: -75, armR: -75, jump: 26, lean: -6, headTilt: 10 },
  point: { armL: 20, armR: -80, jump: 10, lean: -6, headTilt: -6 },
  present: { armL: -92, armR: -18, jump: 8, lean: 0, headTilt: -8 },
  win: { armL: -85, armR: -85, jump: 34, lean: 0, headTilt: 0 },
  cheer: { armL: -80, armR: -80, jump: 42, lean: 0, headTilt: 0 },
  talk: { armL: -30, armR: 25, jump: 0, lean: 0, headTilt: 0 },
  throw: { armL: -95, armR: 60, jump: 6, lean: -12, headTilt: -8 },
  catch: { armL: -95, armR: -28, jump: 16, lean: -4, headTilt: 6 },
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

/* ---------------- 小模（AI 主角，简化版） ---------------- */
const XiaoMo: React.FC<{ x: number; y: number; s: number; f: number; mood: 'happy' | 'serious' | 'proud'; cells?: number; rot?: number }> = ({ x, y, s, f, mood, cells = 0, rot = 0 }) => {
  const bob = Math.sin(f / 26) * 5;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={0} cy={126} rx={86} ry={16} fill={NAVY} opacity={0.16} />
      <ellipse cx={0} cy={0} rx={104} ry={96} fill="#CFE3FF" stroke={NAVY} strokeWidth={5} />
      <path d="M -74 -30 q 30 -34 62 -12 q -34 18 -62 12 Z" fill="#FFFFFF" opacity={0.45} />
      {mood === 'happy' ? (
        <>
          <path d="M -62 -8 Q -44 -34 -26 -8" stroke={NAVY} strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d="M 26 -8 Q 44 -34 62 -8" stroke={NAVY} strokeWidth={9} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx={-44} cy={-18} rx={30} ry={32} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
          <ellipse cx={44} cy={-18} rx={30} ry={32} fill="#FFFFFF" stroke={NAVY} strokeWidth={3} />
          <circle cx={-44} cy={-15} r={12} fill={NAVY} />
          <circle cx={44} cy={-15} r={12} fill={NAVY} />
          <circle cx={-48} cy={-20} r={4.5} fill="#FFFFFF" />
          <circle cx={40} cy={-20} r={4.5} fill="#FFFFFF" />
        </>
      )}
      {mood === 'proud' ? (
        <path d="M -26 30 Q 0 62 26 30" stroke={NAVY} strokeWidth={9} fill="none" strokeLinecap="round" />
      ) : (
        <path d="M -18 36 Q 0 46 18 36" stroke={NAVY} strokeWidth={8} fill="none" strokeLinecap="round" />
      )}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-52 + i * 38} y={54} width={30} height={30} rx={6} fill={cells > i ? GOLD : '#DCE6F5'} stroke={NAVY} strokeWidth={3} />
      ))}
    </g>
  );
};

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

/* ---------------- 逐字字幕（跟着配音点亮） ---------------- */
const Subtitle: React.FC<{ seg: number; t: number }> = ({ seg, t }) => {
  const chars = CHARS[seg] ?? [];
  const spoken = chars.filter((c) => c.t <= t + 0.001).length;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1712, textAlign: 'center', padding: '0 80px' }}>
      {chars.map((c, i) => {
        const on = i < spoken;
        const cur = i === spoken - 1;
        return (
          <span key={i} style={{
            fontFamily: FONT, fontSize: 50, fontWeight: 800,
            color: on ? NAVY : '#C3CEDD',
            display: 'inline-block',
            transform: cur ? 'scale(1.08)' : 'scale(1)',
            textShadow: on ? '0 2px 0 rgba(10,37,64,0.08)' : 'none',
          }}>{c.c}</span>
        );
      })}
    </div>
  );
};

/* ============================ 幕1 · 一句话 ============================ */
const Scene1: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const lx = 250, ly = 1400, ls = 1.0;
  const mouth = mouthOf(lx, ly, ls);
  // 老贾吐"一句话"
  const fly = flyP(f, 34, mouth, { x: 540, y: 940 });
  // 指令卡打字机
  const CMD = '帮我改这个 bug';
  const typed = clamp01((t - 0.9) / 0.62);
  const nTyped = Math.floor(typed * CMD.length + 0.0001);
  // 卡片上飞进顶部窗口
  const up = clamp01((t - 1.62) / 0.55);
  const upE = eio(up);
  const cardY = lerp(1180, 330, upE);
  const cardS = lerp(1, 0.72, upE);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <LaoJia x={lx} y={ly} s={ls} mode="present" f={f} wag={t < 1.3} />
      {/* 老贾吐出的"一句话" */}
      {fly ? (
        <g transform={`translate(${fly.x} ${fly.y}) scale(${fly.s})`} opacity={fly.o}>
          <rect x={-150} y={-46} width={300} height={92} rx={46} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} />
          <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={BLUE}>一句话</text>
        </g>
      ) : null}
      {/* 指令卡 */}
      <g transform={`translate(540 ${cardY}) scale(${cardS})`} opacity={ez(f - 26, 10)}>
        <rect x={-300} y={-70} width={600} height={140} rx={22} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} />
        <rect x={-300} y={-70} width={10} height={140} rx={5} fill={BLUE} />
        <text x={-260} y={16} fontFamily={FONT} fontSize={46} fontWeight={800} fill={NAVY}>
          {CMD.slice(0, nTyped)}
          <tspan fill={BLUE}>▌</tspan>
        </text>
      </g>
      {/* 顶部窗口 */}
      <g opacity={ez(f - 62, 10)}>
        <rect x={190} y={250} width={700} height={160} rx={20} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} opacity={0.95} />
        <rect x={190} y={250} width={700} height={46} rx={20} fill={NAVY} opacity={0.12} />
        <circle cx={228} cy={273} r={9} fill={RED} />
        <circle cx={258} cy={273} r={9} fill={GOLD} />
        <circle cx={288} cy={273} r={9} fill={GREEN} />
        <text x={540} y={368} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY}>你的任务</text>
      </g>
    </svg>
  );
};

/* ============================ 幕2 · 记忆条 ============================ */
const Scene2: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const fill = clamp01((t - 4.2) / (8.22 - 4.2));
  const barX = 140, barY = 300, barW = 800, barH = 96;
  const files = ['main.py', 'README', 'test_api', 'config.yaml', 'a/b/c.py', 'package.json'];
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      {/* 记忆条 */}
      <g opacity={ez(f - 116, 10)}>
        <text x={barX} y={barY - 26} fontFamily={FONT} fontSize={34} fontWeight={800} fill={NAVY}>记忆条 · CONTEXT</text>
        <rect x={barX} y={barY} width={barW} height={barH} rx={18} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} />
        <rect x={barX + 5} y={barY + 5} width={(barW - 10) * fill} height={barH - 10} rx={14} fill={BLUE} opacity={0.28} />
        {files.map((fn, i) => {
          const at = 4.35 + i * 0.19;
          const p = clamp01((t - at) / 0.5);
          const e = eio(p);
          const fromX = 120 + rand(i * 7.7) * 840;
          const fromY = 520 + rand(i * 3.3) * 620;
          const x = lerp(fromX, barX + 40 + i * 118, e);
          const y = lerp(fromY, barY + 48, e);
          const rot = lerp((rand(i * 5.1) - 0.5) * 60, 0, e);
          return (
            <g key={fn} transform={`translate(${x} ${y}) rotate(${rot}) scale(${lerp(0.6, 1, e)})`} opacity={p > 0 ? 1 : 0}>
              <rect x={-52} y={-32} width={104} height={64} rx={10} fill="#FFFFFF" stroke={NAVY} strokeWidth={4} />
              <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontSize={20} fontWeight={800} fill={NAVY}>{fn.slice(0, 9)}</text>
            </g>
          );
        })}
      </g>
      {/* 小模在条子边上，记忆格随填充点亮 */}
      <XiaoMo x={880} y={760} s={0.72} f={f} mood="serious" cells={Math.floor(fill * 3)} />
      <g opacity={ez(f - 130, 12)}>
        <text x={880} y={930} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={800} fill={NAVY}>模型</text>
      </g>
    </svg>
  );
};

/* ============================ 幕3 · 转圈 ============================ */
const NODES = [
  { label: '想', x: 540, y: 610, c: BLUE },
  { label: '调工具', x: 810, y: 880, c: GOLD },
  { label: '看结果', x: 540, y: 1150, c: GREEN },
  { label: '再想', x: 270, y: 880, c: RED },
];
const Scene3: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const cx = 540, cy = 880, r = 270;
  const p = clamp01((t - LOOP_START - 0.15) / (LOOP_END - LOOP_START - 0.15));
  const ang = -Math.PI / 2 + p * LAPS * Math.PI * 2;
  const mx = cx + Math.cos(ang) * r;
  const my = cy + Math.sin(ang) * r;
  const curNode = Math.floor(p * LAPS) % LAPS;
  const spin = t * 120;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      {/* 轨道 */}
      <g opacity={ez(f - 254, 12)}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={LINE} strokeWidth={10} strokeDasharray="18 16" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={BLUE} strokeWidth={4} opacity={0.35} />
      </g>
      {/* 中心：模型 */}
      <g opacity={ez(f - 262, 12)}>
        <circle cx={cx} cy={cy} r={92} fill="#FFFFFF" stroke={NAVY} strokeWidth={6} />
        <g transform={`translate(${cx} ${cy}) rotate(${spin})`}>
          <circle cx={0} cy={0} r={62} fill="none" stroke={BLUE} strokeWidth={5} strokeDasharray="26 18" opacity={0.75} />
        </g>
        <text x={cx} y={cy + 14} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={NAVY}>模型</text>
      </g>
      {/* 4 个节点 */}
      {NODES.map((n, i) => {
        const on = i === curNode && p > 0.001;
        const sc = on ? pop(f, 0, 12) : 1;
        return (
          <g key={n.label} transform={`translate(${n.x} ${n.y}) scale(${sc})`}>
            <rect x={-78} y={-42} width={156} height={84} rx={20} fill={on ? n.c : '#FFFFFF'} stroke={n.c} strokeWidth={5} />
            <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={on ? '#FFFFFF' : n.c}>{n.label}</text>
          </g>
        );
      })}
      {/* 小模沿轨道跑 */}
      <XiaoMo x={mx} y={my} s={0.52} f={f} mood="happy" cells={3} />
    </svg>
  );
};

/* ============================ 幕4 · 结论 ============================ */
const Scene4: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  const lx = 860, ly = 1400, ls = 1.0;
  const mouth = mouthOf(lx, ly, ls);
  const tHui = charAt(3, '会');
  const tGuan = charAt(3, '关');
  const flyThesis = tHui > 0 ? flyP(f, (tHui + 0.85) * 30, mouth, { x: 420, y: 900 }) : null;
  const flyChip = tGuan > 0 ? flyP(f, (tGuan + 0.85) * 30, mouth, { x: 420, y: 1180 }, 12, 12) : null;
  const shrink = clamp01((t - 14.0) / 0.8);
  const barW = lerp(800, 230, shrink);
  const barX = lerp(140, 790, shrink);
  const spin = t * 40;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      {/* 收拢的圈 */}
      <g opacity={ez(f - 420, 12)}>
        <circle cx={540} cy={880} r={lerp(270, 200, shrink)} fill="none" stroke={BLUE} strokeWidth={8} opacity={0.5} />
        <g transform={`translate(540 880) rotate(${spin})`}>
          <circle cx={0} cy={0} r={150} fill="none" stroke={BLUE} strokeWidth={4} strokeDasharray="24 16" opacity={0.5} />
        </g>
        <text x={540} y={900} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={NAVY}>Agent</text>
      </g>
      {/* 记忆条压缩 */}
      <g opacity={ez(f - 416, 10)}>
        <rect x={barX} y={300} width={barW} height={70} rx={16} fill="#FFFFFF" stroke={NAVY} strokeWidth={4} />
        <text x={barX + 18} y={345} fontFamily={FONT} fontSize={26} fontWeight={800} fill={GREY}>记忆条</text>
      </g>
      <LaoJia x={lx} y={ly} s={ls} mode="cheer" f={f} wag={t < 16.0} />
      {/* 结论从老贾嘴里飞出 */}
      {flyThesis ? (
        <g transform={`translate(${flyThesis.x} ${flyThesis.y}) scale(${flyThesis.s})`} opacity={flyThesis.o}>
          <rect x={-290} y={-54} width={580} height={108} rx={26} fill={BLUE} />
          <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontSize={50} fontWeight={900} fill="#FFFFFF">会自己转圈的模型</text>
        </g>
      ) : null}
      {/* 结尾关注标 */}
      {flyChip ? (
        <g transform={`translate(${flyChip.x} ${flyChip.y}) scale(${flyChip.s})`} opacity={flyChip.o}>
          <rect x={-250} y={-46} width={500} height={92} rx={46} fill="#FFFFFF" stroke={GREEN} strokeWidth={6} />
          <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GREEN}>关注我 火柴人老贾</text>
        </g>
      ) : null}
    </svg>
  );
};

/* ============================ 主组件 ============================ */
export const EP04: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const seg = t < T[1] ? 0 : t < T[2] ? 1 : t < T[3] ? 2 : 3;
  const tint = seg === 0 ? '#E8F0FF' : seg === 1 ? '#E9F7EF' : seg === 2 ? '#FFF6E0' : '#FDECEC';
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Backdrop tint={tint} f={frame} />
      {seg === 0 ? <Scene1 f={frame} t={t} /> : null}
      {seg === 1 ? <Scene2 f={frame} t={t} /> : null}
      {seg === 2 ? <Scene3 f={frame} t={t} /> : null}
      {seg === 3 ? <Scene4 f={frame} t={t} /> : null}
      <Badge f={frame} />
      <Subtitle seg={seg} t={t} />
      <Audio src={staticFile('audio4/ep04.mp3')} />
      <Audio src={staticFile('audio4/ep04_music_ln.wav')} />
    </AbsoluteFill>
  );
};
