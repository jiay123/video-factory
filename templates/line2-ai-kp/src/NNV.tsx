import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, staticFile, Audio, Sequence } from 'remotion';

// 竖屏科普《什么是神经网络》1080x1920 · 6幕 · 52.33s
const BG_LIGHT = '#F5F7FA';
const BG_DARK = '#050B18';
const NAVY = '#0A2540';
const BLUE = '#0A84FF';
const CYAN = '#1890C0';
const GOLD = '#FFB800';
const RED = '#FF3B30';
const GREEN = '#34C759';
const GREY = '#8E9AAB';
const LINE_SOFT = '#C9D8EA';

const FONT = '"Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", sans-serif';

// 时间轴（mp3 实测：nnv_timeline.json，52.33s）
const F = [0, 176, 468, 694, 970, 1315];
const TOTAL = 1570;

const VSCRIPT = [
  '它能认出猫，能听懂你说话，甚至能写文章——但它不是大脑。',
  '这是神经网络。左边是输入层，负责接收信息；中间是隐藏层，负责加工；右边是输出层，给出答案。',
  '放大看一个神经元：它接收很多信号，加在一起——超过门槛，就激活，传给下一个。',
  '当一张猫的照片进来，它被拆成像素，信号层层传递：先识别边缘，再识别形状，最后判断——这是一只猫。',
  '而它变聪明的方式，是训练：答错了，所有连接的“权重”就被微调一点点，重复千万次，错误率不断下降。它不靠规则，靠例子。',
  '这就是神经网络——人工智能最核心的引擎。下一集，我们解剖：大模型是如何“思考”的。',
];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ez = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
const at = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));

const mulberry = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const Callout: React.FC<{ x: number; y: number; tx: number; ty: number; label: string; en: string; f: number; d: number; accent?: string }> =
  ({ x, y, tx, ty, label, en, f, d, accent = BLUE }) => {
    const p = ez(at(f, d, d + 14));
    if (p <= 0) return null;
    const len = Math.hypot(tx - x, ty - y);
    const cnW = label.length * 33;
    const w = cnW + en.length * 11 + 48;
    return (
      <g opacity={p}>
        <line x1={x} y1={y} x2={tx} y2={ty} stroke={accent} strokeWidth={3}
          strokeDasharray={len} strokeDashoffset={len * (1 - p)} opacity={0.75} />
        <circle cx={tx} cy={ty} r={7} fill={accent} />
        <rect x={x - 8} y={y - 30} width={w} height={62} rx={12}
          fill="#FFFFFF" stroke={accent} strokeWidth={2.5} opacity={0.97} />
        <text x={x + 8} y={y - 2} fontFamily={FONT} fontSize={30} fontWeight={700} fill={NAVY}>{label}</text>
        <text x={x + 16 + cnW} y={y - 4} fontFamily={FONT} fontSize={19} fill={GREY}>{en}</text>
      </g>
    );
  };

const Pill: React.FC<{ x: number; y: number; text: string; f: number; d: number; color?: string; strike?: boolean }> =
  ({ x, y, text, f, d, color = BLUE, strike = false }) => {
    const p = ez(at(f, d, d + 12));
    if (p <= 0) return null;
    const w = text.length * 30 + 44;
    return (
      <g opacity={p} transform={`translate(${x} ${y + (1 - p) * 18})`}>
        <rect x={-w / 2} y={-30} width={w} height={60} rx={30} fill="#FFFFFF" stroke={color} strokeWidth={3} />
        <text x={0} y={11} textAnchor="middle" fontFamily={FONT} fontSize={31} fontWeight={700} fill={color}>{text}</text>
        {strike ? <line x1={-w / 2 + 14} y1={6} x2={w / 2 - 14} y2={6} stroke={RED} strokeWidth={4} /> : null}
      </g>
    );
  };

const Flow: React.FC<{ x1: number; y1: number; x2: number; y2: number; f: number; d: number; color?: string; n?: number; sp?: number; r?: number }> =
  ({ x1, y1, x2, y2, f, d, color = GOLD, n = 2, sp = 30, r = 7 }) => {
    const p = ez(at(f, d, d + 10));
    if (p <= 0) return null;
    return (
      <g opacity={p * 0.95}>
        {Array.from({ length: n }).map((_, k) => {
          const t = ((((f - d) / sp) + k / n) % 1 + 1) % 1;
          return <circle key={k} cx={x1 + (x2 - x1) * t} cy={y1 + (y2 - y1) * t} r={r}
            fill={color} opacity={0.3 + 0.7 * Math.sin(t * Math.PI)} />;
        })}
      </g>
    );
  };

const useBrain = () => useMemo(() => {
  const rnd = mulberry(7);
  const nodes: { x: number; y: number; ph: number }[] = [];
  for (let i = 0; i < 96; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = Math.sqrt(rnd());
    let x = Math.cos(a) * rr * 250;
    let y = Math.sin(a) * rr * 190;
    if (y > 60) x *= 0.82 - (y - 60) / 900;
    if (y > 120) y *= 0.88;
    nodes.push({ x, y, ph: rnd() * Math.PI * 2 });
  }
  for (let i = 0; i < 10; i++) nodes.push({ x: (rnd() - 0.5) * 70, y: 175 + rnd() * 55, ph: rnd() * Math.PI * 2 });
  const edges: [number, number][] = [];
  const seen = new Set<string>();
  nodes.forEach((n, i) => {
    const ds = nodes.map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) })).filter(o => o.j !== i).sort((a, b) => a.d - b.d);
    for (const { j } of ds.slice(0, 2)) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key) && Math.hypot(nodes[j].x - n.x, nodes[j].y - n.y) < 130) { seen.add(key); edges.push([i, j]); }
    }
  });
  return { nodes, edges };
}, []);

const BrainCloud: React.FC<{ f: number; cx: number; cy: number; scale: number; alpha?: number }> = ({ f, cx, cy, scale, alpha = 1 }) => {
  const { nodes, edges } = useBrain();
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`} opacity={alpha}>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="#C98A1E" strokeWidth={1.6} opacity={0.3 + 0.14 * Math.sin(f * 0.09 + i)} />
      ))}
      {edges.filter((_, i) => i % 5 === (f % 5)).map(([a, b], i) => {
        const t = ((f * 0.022 + i * 0.37) % 1);
        return <circle key={`p${i}`} cx={nodes[a].x + (nodes[b].x - nodes[a].x) * t}
          cy={nodes[a].y + (nodes[b].y - nodes[a].y) * t} r={4.5} fill="#FFE08A" opacity={0.95} />;
      })}
      {nodes.map((n, i) => {
        const flick = ((f * 7 + i * 29) % 101) < 5 ? 1 : 0.45 + 0.3 * Math.sin(f * 0.14 + n.ph);
        return <circle key={i} cx={n.x} cy={n.y} r={3.4 + flick * 2.2} fill="#FFC940" opacity={flick} />;
      })}
    </g>
  );
};

const Scene1: React.FC<{ f: number }> = ({ f }) => {
  const zoom = 1 + 0.16 * ez(at(f, 0, 176));
  const born = ez(at(f, 0, 26));
  return (
    <AbsoluteFill style={{ backgroundColor: BG_DARK }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB800" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#FFB800" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={540} cy={860} rx={520 * zoom} ry={460 * zoom} fill="url(#glow1)" />
        <g opacity={born}>
          <BrainCloud f={f} cx={540} cy={860} scale={zoom} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const COLS2 = [
  { x: 170, n: 4, label: '输入层', en: 'Input', accent: BLUE, lx: 130, ly: 450 },
  { x: 415, n: 6, label: '隐藏层', en: 'Hidden 1', accent: CYAN, lx: 380, ly: 530 },
  { x: 640, n: 5, label: '隐藏层', en: 'Hidden 2', accent: CYAN, lx: 590, ly: 450 },
  { x: 830, n: 2, label: '输出层', en: 'Output', accent: GOLD, lx: 655, ly: 530 },
];
const colNodes2 = COLS2.map(c => Array.from({ length: c.n }, (_, i) => ({
  x: c.x, y: 960 - (c.n - 1) * 78 / 2 + i * 78,
})));

const Scene2: React.FC<{ f: number }> = ({ f }) => {
  const peel = 1 - ez(at(f, 0, 26));
  const flash = interpolate(f, [0, 5, 16], [0.9, 0.55, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: BG_LIGHT }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {peel > 0.01 ? <g opacity={peel * 0.5}><BrainCloud f={f} cx={540} cy={520} scale={0.55 * (1 - (1 - peel) * 0.4)} /></g> : null}
        {COLS2.slice(0, -1).map((c, li) => {
          const d0 = 14 + li * 26;
          const p = ez(at(f, d0, d0 + 24));
          if (p <= 0) return null;
          return (
            <g key={li}>
              {colNodes2[li].map((a, ai) => colNodes2[li + 1].map((b, bi) => {
                const len = Math.hypot(b.x - a.x, b.y - a.y);
                return <line key={`${ai}-${bi}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={LINE_SOFT} strokeWidth={2.2}
                  strokeDasharray={len} strokeDashoffset={len * (1 - p)} />;
              }))}
            </g>
          );
        })}
        {COLS2.slice(0, -1).map((c, li) => colNodes2[li].map((a, ai) => colNodes2[li + 1].map((b, bi) =>
          (ai + bi) % 3 === 0 ? <Flow key={`fl${li}${ai}${bi}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} f={f} d={70 + li * 12} sp={34} r={5} /> : null
        )))}
        {COLS2.map((c, li) => {
          const d0 = 10 + li * 26;
          const p = ez(at(f, d0, d0 + 18));
          const pulse = li === 0 ? 1 : 0.72 + 0.28 * Math.sin((f - 70) * 0.16 - li * 1.1);
          return (
            <g key={li} opacity={p}>
              {colNodes2[li].map((n, i) => {
                const s = ez(at(f, d0 + i * 3, d0 + i * 3 + 14));
                const r = 26 * s * (li >= 1 && f > 70 ? pulse : 1);
                return (
                  <g key={i}>
                    <circle cx={n.x} cy={n.y} r={r + 10} fill={c.accent} opacity={0.14 * s} />
                    <circle cx={n.x} cy={n.y} r={r} fill="#FFFFFF" stroke={c.accent} strokeWidth={4} />
                    <circle cx={n.x} cy={n.y} r={r * 0.38} fill={c.accent} opacity={0.85} />
                  </g>
                );
              })}
              <Callout x={c.lx} y={c.ly} tx={c.x} ty={960 - (c.n - 1) * 78 / 2 - 46}
                label={c.label} en={c.en} f={f} d={d0 + 16} accent={c.accent} />
            </g>
          );
        })}
        <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={flash} />
      </svg>
    </AbsoluteFill>
  );
};

const Scene3: React.FC<{ f: number }> = ({ f }) => {
  const cx = 470, cy = 900;
  const zoom = 1.22 - 0.22 * ez(at(f, 0, 20));
  const dend = [640, 760, 880, 1000, 1120];
  const weakT = [at(f, 30, 82), at(f, 55, 107), at(f, 80, 132)];
  const strongT = [at(f, 132, 186), at(f, 170, 224)];
  const gateGold = strongT.some(t => t > 0.5 && t < 1);
  const sum = clamp01(at(f, 30, 130)) * 0.45 + strongT.filter(t => t > 0.5).length * 0.28;
  const gateR = 92;
  return (
    <AbsoluteFill style={{ backgroundColor: BG_LIGHT }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(${cx} ${cy}) scale(${zoom}) translate(${-cx} ${-cy})`}>
          {dend.map((y, i) => {
            const p = ez(at(f, 4 + i * 4, 20 + i * 4));
            const x0 = 56;
            const len = cx - 130 - x0;
            return (
              <g key={i} opacity={p}>
                <path d={`M${x0} ${y} C ${x0 + 120} ${y}, ${cx - 210} ${cy + (y - cy) * 0.35}, ${cx - 118} ${cy + (y - cy) * 0.22}`}
                  stroke={BLUE} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.85} />
                <path d={`M${x0} ${y} l -26 -16 M${x0} ${y} l -26 16`} stroke={BLUE} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
              </g>
            );
          })}
          {weakT.map((t, i) => {
            if (t <= 0 || t >= 1) return null;
            const y = dend[i];
            const xEnd = cx - 158;
            const x0 = 40;
            const prog = ez(t) * 0.92;
            const x = x0 + (xEnd - x0) * prog;
            const yy = y + (cy + (y - cy) * 0.22 - y) * prog;
            return <circle key={`w${i}`} cx={x} cy={yy} r={13} fill={GREY} opacity={0.9 * (1 - ez(at(t, 0.8, 1)))} />;
          })}
          {strongT.map((t, i) => {
            if (t <= 0 || t >= 1) return null;
            const y = dend[(i * 2 + 1) % 5];
            const xEnd = cx - 158;
            const x0 = 40;
            const prog = ez(t);
            const x = x0 + (xEnd + 260 + 380 - x0) * prog;
            const yy = prog < 0.45
              ? y + (cy + (y - cy) * 0.22 - y) * (prog / 0.45)
              : cy + (y - cy) * 0.22 * (1 - (prog - 0.45) / 0.55);
            return (
              <g key={`s${i}`}>
                <circle cx={x} cy={yy} r={16} fill={GOLD} opacity={0.95} />
                <circle cx={x} cy={yy} r={28} fill={GOLD} opacity={0.25 * Math.sin(prog * Math.PI)} />
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={150} fill="#FFFFFF" stroke={BLUE} strokeWidth={6} />
          <circle cx={cx} cy={cy} r={150} fill="none" stroke={BLUE} strokeWidth={26} opacity={0.08} />
          <circle cx={cx} cy={cy} r={gateR} fill="none" stroke={gateGold ? GOLD : GREY} strokeWidth={12}
            strokeDasharray={`${2 * Math.PI * gateR * (gateGold ? 1 : 0.72)} ${2 * Math.PI * gateR}`}
            transform={`rotate(${-90 + (gateGold ? 0 : -40)} ${cx} ${cy})`}
            opacity={gateGold ? 1 : 0.8} />
          <text x={cx} y={cy + 14} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={800}
            fill={gateGold ? GOLD : NAVY}>{gateGold ? 'PASS' : 'Σ'}</text>
          <text x={cx} y={cy + 62} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={GREY}>
            {gateGold ? '激活 · Activate' : `信号和 ${(sum * 100).toFixed(0)}%`}
          </text>
          <rect x={cx + 152} y={cy - 6} width={214} height={12} rx={6} fill={BLUE} opacity={0.9} />
          <path d={`M${cx + 366} ${cy - 34} l 70 34 -70 34 z`} fill={BLUE} opacity={0.9} />
        </g>
        <Callout x={90} y={470} tx={170} ty={700} label="树突" en="Dendrites" f={f} d={26} accent={BLUE} />
        <Callout x={660} y={560} tx={cx + 66} ty={cy - 84} label="激活" en="Activation" f={f} d={96} accent={gateGold ? GOLD : NAVY} />
        <Callout x={660} y={1210} tx={cx + 300} ty={cy + 30} label="轴突" en="Axon" f={f} d={150} accent={BLUE} />
      </svg>
    </AbsoluteFill>
  );
};

const CAT = [
  '............',
  '.K........K.',
  '.KK......KK.',
  '.KOK....KOK.',
  '.KOOK..KOOK.',
  '..KOOOOOOK..',
  '..KOOOOOOK..',
  '..KEOOOEOOK.',
  '..KOOOWOOOK.',
  '..KOOOOOOK..',
  '...KOOOOOK..',
  '....KKKKK...',
];
const catColor: Record<string, string> = { K: '#5A4632', O: '#F5A623', E: '#1B1B1B', W: '#FFFFFF', '.': 'transparent' };
const cells: { cx: number; cy: number; color: string; i: number }[] = [];
CAT.forEach((row, r) => row.split('').forEach((ch, c) => {
  if (ch !== '.') cells.push({ cx: c, cy: r, color: catColor[ch], i: r * 12 + c });
}));

const COLS4 = [
  { x: 180, n: 5 },
  { x: 450, n: 6 },
  { x: 720, n: 2 },
];
const colNodes4 = COLS4.map(c => Array.from({ length: c.n }, (_, i) => ({
  x: c.x, y: 1090 - (c.n - 1) * 70 / 2 + i * 70,
})));

const Scene4: React.FC<{ f: number }> = ({ f }) => {
  const cardIn = ez(at(f, 6, 28));
  const melt = at(f, 62, 100);
  const cardFade = 1 - ez(at(f, 66, 92));
  const netOn = ez(at(f, 86, 102));
  const done = ez(at(f, 150, 170));
  const gridX = 470 - 156;
  const gridY = 380;
  return (
    <AbsoluteFill style={{ backgroundColor: BG_LIGHT }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g opacity={cardIn * cardFade} transform={`rotate(${-2 + 4 * Math.sin(f * 0.05)} 470 530)`}>
          <rect x={305} y={365} width={330} height={330} rx={18} fill="#FFFFFF" stroke={LINE_SOFT} strokeWidth={3} />
        </g>
        {cells.map(cc => {
          const pop = ez(at(f, 6 + cc.i * 0.55, 18 + cc.i * 0.55));
          const fly = ez(clamp01((melt - (cc.i % 12) * 0.018 - cc.cy * 0.028) * 2.0));
          const fromX = gridX + cc.cx * 26 + 12;
          const fromY = gridY + cc.cy * 26 + 12;
          const node = colNodes4[0][cc.cy % 5];
          const toX = node.x + ((cc.i * 53) % 44) - 22;
          const toY = node.y + ((cc.cx * 41) % 40) - 20;
          const x = fromX + (toX - fromX) * fly;
          const y = fromY + (toY - fromY) * fly - Math.sin(fly * Math.PI) * 60;
          const s = 1 - fly * 0.62;
          return <rect key={cc.i} x={x - 12 * s} y={y - 12 * s} width={24 * s * pop} height={24 * s * pop} rx={3}
            fill={cc.color} opacity={pop * (1 - fly * 0.85)} />;
        })}
        {netOn > 0.01 ? (
          <g opacity={netOn}>
            {COLS4.slice(0, -1).map((c, li) => colNodes4[li].map((a, ai) => colNodes4[li + 1].map((b, bi) => {
              const len = Math.hypot(b.x - a.x, b.y - a.y);
              const d0 = 92 + li * 18;
              const p = ez(at(f, d0, d0 + 16));
              return <line key={`${li}${ai}${bi}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={LINE_SOFT} strokeWidth={2.4}
                strokeDasharray={len} strokeDashoffset={len * (1 - p)} />;
            })))}
            {COLS4.slice(0, -1).map((c, li) => colNodes4[li].map((a, ai) => colNodes4[li + 1].map((b, bi) =>
              (ai + bi) % 2 === 0 ? <Flow key={`f4${li}${ai}${bi}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} f={f} d={104 + li * 22} sp={26} r={6} /> : null
            )))}
            {COLS4.map((c, li) => colNodes4[li].map((n, i) => {
              const s = ez(at(f, 88 + li * 10 + i * 1.5, 102 + li * 10 + i * 1.5));
              const isCat = li === 2 && i === 0;
              const isDog = li === 2 && i === 1;
              const rBase = isCat ? 34 + 14 * done : 26;
              const r = rBase * s * (isDog ? 1 - 0.35 * done : 1);
              const col = isCat && done > 0.5 ? GREEN : li === 2 ? GOLD : BLUE;
              return (
                <g key={`${li}${i}`} opacity={s * (isDog ? 1 - 0.45 * done : 1)}>
                  <circle cx={n.x} cy={n.y} r={r + 10} fill={col} opacity={0.14} />
                  <circle cx={n.x} cy={n.y} r={r} fill="#FFFFFF" stroke={col} strokeWidth={4.5} />
                  <circle cx={n.x} cy={n.y} r={r * 0.4} fill={col} opacity={0.9} />
                  {li === 2 ? (
                    <text x={n.x + r + 16} y={n.y + 10} fontFamily={FONT} fontSize={34} fontWeight={700}
                      fill={isCat && done > 0.5 ? GREEN : GREY}>{isCat ? '猫' : '狗'}</text>
                  ) : null}
                  {isCat && done > 0.5 ? (
                    <text x={n.x} y={n.y + r + 44} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREEN}>
                      {(done * 96).toFixed(0)}%
                    </text>
                  ) : null}
                </g>
              );
            }))}
          </g>
        ) : null}
        <Pill x={770} y={390} text="像素" f={f} d={40} color={BLUE} />
        <Pill x={770} y={490} text="边缘" f={f} d={104} color={CYAN} />
        <Pill x={770} y={590} text="形状" f={f} d={126} color={GOLD} />
      </svg>
    </AbsoluteFill>
  );
};

const COLS5 = [
  { x: 150, n: 4 },
  { x: 370, n: 6 },
  { x: 590, n: 5 },
  { x: 800, n: 2 },
];
const colNodes5 = COLS5.map(c => Array.from({ length: c.n }, (_, i) => ({
  x: c.x, y: 940 - (c.n - 1) * 76 / 2 + i * 76,
})));
const LINES5: { a: { x: number; y: number }; b: { x: number; y: number }; li: number; base: number; ph: number }[] = [];
COLS5.slice(0, -1).forEach((c, li) => colNodes5[li].forEach(a => colNodes5[li + 1].forEach(b => {
  const rnd = mulberry(li * 100 + Math.round(a.y + b.y));
  LINES5.push({ a, b, li, base: 1.6 + rnd() * 3.4, ph: rnd() * Math.PI * 2 });
})));

const Scene5: React.FC<{ f: number }> = ({ f }) => {
  const CYC = [18, 118, 218];
  const inWin = (a: number, b: number) => CYC.some(c0 => f >= c0 + a && f < c0 + b) || (a === 72 && f >= 296 && f < 330);
  const errStage = f >= 280 ? 4 : f >= 190 ? 35 : f >= 100 ? 60 : 87;
  const errDisp = interpolate(f, [18, 30, 100, 112, 190, 202, 280, 292], [87, 87, 87, 60, 60, 35, 35, 4],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const needle = interpolate(errDisp, [4, 87], [12, 170]);
  const gaugeIn = ez(at(f, 14, 34));
  const redF = interpolate(f, [48, 54, 66, 148, 154, 166, 248, 254, 266], [0, 0.14, 0, 0, 0.14, 0, 0, 0.14, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const greenF = interpolate(f, [90, 96, 108, 190, 196, 208, 290, 296, 308], [0, 0.12, 0, 0, 0.12, 0, 0, 0.12, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const adjusting = inWin(36, 74);
  return (
    <AbsoluteFill style={{ backgroundColor: BG_LIGHT }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {LINES5.map((L, i) => {
          const grow = ez(at(f, 6 + L.li * 14, 26 + L.li * 14));
          const len = Math.hypot(L.b.x - L.a.x, L.b.y - L.a.y);
          const wob = adjusting ? 1 + 0.55 * Math.sin(f * 0.33 + L.ph) : 1;
          return <line key={i} x1={L.a.x} y1={L.a.y} x2={L.b.x} y2={L.b.y}
            stroke={adjusting && i % 4 === (f % 4) ? GOLD : LINE_SOFT}
            strokeWidth={L.base * wob * (0.4 + 0.6 * grow)}
            strokeDasharray={len} strokeDashoffset={len * (1 - grow)}
            opacity={0.55 + 0.35 * grow} />;
        })}
        {COLS5.map((c, li) => colNodes5[li].map((n, i) => {
          const s = ez(at(f, 4 + li * 14 + i * 2, 16 + li * 14 + i * 2));
          const wrong = li === 3 && inWin(30, 66);
          const right = li === 3 && (inWin(72, 110) || f >= 296);
          const col = wrong ? RED : right ? GREEN : li === 3 ? GOLD : BLUE;
          return (
            <g key={`${li}${i}`} opacity={s}>
              <circle cx={n.x} cy={n.y} r={24} fill="#FFFFFF" stroke={col} strokeWidth={4} />
              <circle cx={n.x} cy={n.y} r={9} fill={col} opacity={0.9} />
            </g>
          );
        }))}
        {CYC.map((c0, k) => {
          const pIn = at(f, c0, c0 + 26);
          const pOut = at(f, c0 + 30, c0 + 44);
          if (pOut <= 0 || pIn >= 1) return null;
          const x0 = 150, x1 = 800, y = 940;
          const xa = x0 + (x1 - x0) * ez(pIn);
          return <circle key={k} cx={xa} cy={y} r={12} fill={GOLD} opacity={0.9 * (1 - pOut)} />;
        })}
        {inWin(30, 60) ? (
          <text x={800} y={790} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={RED}>✗</text>
        ) : null}
        {inWin(72, 108) ? (
          <text x={800} y={790} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={GREEN}>✓</text>
        ) : null}
        {[0, 100, 200].map(k => (f >= 96 + k && f < 130 + k) || (f >= 196 && f < 230) || f >= 296 ? (
          <text key={`c${k}`} x={800} y={790} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={GREEN}>✓</text>
        ) : null)}
        {gaugeIn > 0.01 ? (
          <g opacity={gaugeIn}>
            <path d="M 560 470 A 150 150 0 0 1 860 470" fill="none" stroke="#E3EAF3" strokeWidth={26} strokeLinecap="round" />
            <path d="M 560 470 A 150 150 0 0 1 860 470" fill="none" stroke={errDisp < 20 ? GREEN : errDisp < 50 ? GOLD : RED}
              strokeWidth={26} strokeLinecap="round"
              strokeDasharray={`${Math.PI * 150 * (errDisp / 100)} ${Math.PI * 150}`} />
            <line x1={710} y1={470} x2={710 + 118 * Math.cos((needle * Math.PI) / 180)} y2={470 - 118 * Math.sin((needle * Math.PI) / 180)}
              stroke={NAVY} strokeWidth={7} strokeLinecap="round" />
            <circle cx={710} cy={470} r={13} fill={NAVY} />
            <text x={710} y={560} textAnchor="middle" fontFamily={FONT} fontSize={78} fontWeight={900}
              fill={errDisp < 20 ? GREEN : NAVY}>{errDisp.toFixed(0)}%</text>
            <text x={710} y={606} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={GREY}>错误率 Error</text>
          </g>
        ) : null}
        <Pill x={270} y={330} text="规则 ✗" f={f} d={252} color={GREY} strike />
        <Pill x={560} y={330} text="例子 ✓" f={f} d={266} color={GOLD} />
        <rect x={0} y={0} width={1080} height={1920} fill={RED} opacity={redF} />
        <rect x={0} y={0} width={1080} height={1920} fill={GREEN} opacity={greenF} />
      </svg>
    </AbsoluteFill>
  );
};

const Scene6: React.FC<{ f: number }> = ({ f }) => {
  const dark = ez(at(f, 0, 22));
  const brainA = interpolate(f, [0, 30, 90, 130], [0, 0.9, 0.9, 0.18], { extrapolateRight: 'clamp' });
  const brainS = interpolate(f, [0, 90], [0.62, 0.55], { extrapolateRight: 'clamp' });
  const ghost = ez(at(f, 40, 70)) * (1 - ez(at(f, 110, 140)) * 0.6);
  const card = ez(at(f, 96, 118));
  return (
    <AbsoluteFill style={{ backgroundColor: BG_LIGHT }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect x={0} y={0} width={1080} height={1920} fill={BG_DARK} opacity={dark} />
        <defs>
          <radialGradient id="glow6" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB800" stopOpacity={0.26} />
            <stop offset="100%" stopColor="#FFB800" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={540} cy={820} rx={460} ry={400} fill="url(#glow6)" opacity={brainA} />
        <g opacity={brainA}><BrainCloud f={f} cx={540} cy={820} scale={brainS} /></g>
        <g opacity={ghost * 0.5} stroke="#FFC940" strokeWidth={8} fill="none" strokeLinecap="round">
          <path d={`M 190 ${1120 + 8 * Math.sin(f * 0.08)} l 70 -90 l 70 40`} />
          <path d={`M 330 ${1070 + 8 * Math.sin(f * 0.08)} l 40 30 M 350 ${1120 + 8 * Math.sin(f * 0.08)} l 40 -20`} />
          <rect x={700} y={1010 + 8 * Math.sin(f * 0.08 + 1)} width={150} height={100} rx={16} />
          {[0, 1, 2].map(i => <circle key={i} cx={735 + i * 40} cy={1060 + 8 * Math.sin(f * 0.08 + 1)} r={11} fill="#FFC940" stroke="none" />)}
        </g>
        {card > 0.01 ? (
          <g opacity={card}>
            <text x={540} y={880} textAnchor="middle" fontFamily={FONT} fontSize={120} fontWeight={900} fill={GOLD}
              style={{ textShadow: '0 0 40px rgba(255,184,0,0.45)' }}>AI 科普</text>
            <text x={540} y={960} textAnchor="middle" fontFamily={FONT} fontSize={40} fill="#FFFFFF" opacity={0.75}>EP.01 · 什么是神经网络</text>
            <g transform={`translate(540 1180)`}>
              <SpinRing6 f={f} />
              <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900} fill="#FFFFFF">+</text>
            </g>
            <text x={540} y={1290} textAnchor="middle" fontFamily={FONT} fontSize={34} fill="#FFFFFF" opacity={0.65}>关注 · 下集解剖大模型</text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

const SpinRing6: React.FC<{ f: number }> = ({ f }) => {
  const r = 54;
  const C = 2 * Math.PI * r;
  return (
    <circle cx={0} cy={0} r={r} fill="none" stroke={GOLD} strokeWidth={4}
      strokeDasharray={`${C * 0.3} ${C}`} strokeDashoffset={-(f / 70) * C} opacity={0.9} />
  );
};

const Caption: React.FC<{ f: number }> = ({ f }) => {
  let si = 0;
  for (let i = 0; i < 6; i++) if (f >= F[i]) si = i;
  const seg = VSCRIPT[si];
  const t0 = F[si];
  const t1 = si < 5 ? F[si + 1] : TOTAL;
  const p = clamp01((f - t0) / (t1 - t0 - 6));
  const nShow = Math.floor(p * seg.length + 0.001);
  const perLine = 13;
  const lines: string[] = [];
  for (let i = 0; i < seg.length; i += perLine) lines.push(seg.slice(i, i + perLine));
  const lineH = 58;
  const y0 = 1560;
  // 两排固定框：上排=当前行，下排=下一行；本行快念完（>80%）时整组上滚一行，露出再下一行
  const rowF = nShow / perLine;
  const row0 = Math.min(Math.floor(rowF), Math.max(0, lines.length - 1));
  const frac = rowF - Math.floor(rowF);
  const scroll = row0 + 2 < lines.length && frac > 0.8 ? (frac - 0.8) / 0.2 : 0;
  const vis: number[] = [row0];
  if (row0 + 1 < lines.length) vis.push(row0 + 1);
  if (scroll > 0 && row0 + 2 < lines.length) vis.push(row0 + 2);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <clipPath id="capclip">
          <rect x={60} y={y0 - 46} width={960} height={2 * lineH + 34} rx={20} />
        </clipPath>
      </defs>
      <rect x={60} y={y0 - 46} width={960} height={2 * lineH + 34} rx={20} fill="#0A2540" opacity={0.72} />
      <g clipPath="url(#capclip)">
        <g transform={`translate(0 ${-scroll * lineH})`}>
        {vis.map(li => (
          <text key={li} x={540} y={y0 + (li - row0) * lineH} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={700}>
            {lines[li].split('').map((ch, chi) => {
              const gi = li * perLine + chi;
              return <tspan key={chi} fill={gi < nShow ? '#FFD60A' : '#FFFFFF'} opacity={gi < nShow ? 1 : 0.35}>{ch}</tspan>;
            })}
          </text>
        ))}
        </g>
      </g>
    </svg>
  );
};

const PUPIL = '#0a0a12';

// 火柴人老贾 —— 视频号 A 线现役形象（照搬 ep34 Short.tsx 的 Sticker：学士帽歪戴+呆毛金币+斗鸡眼+红嘴）
const Sticker: React.FC<{ mode?: string; delay?: number; forceTalk?: boolean; scale?: number; left?: number; bottom?: number }> =
  ({ mode = 'point', delay = 0, forceTalk = true, scale = 1, left = 60, bottom = 80 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const t = frame / fps - delay;
    const pose = STPOSES[mode] ?? STPOSES.gasp;
    const bob = interpolate(Math.sin(t * (pose.jump ? 10 : 6)), [-1, 1], [0, -(pose.jump || 22)]);
    const sway = interpolate(Math.sin(t * 5), [-1, 1], [-8, 8]);
    const absT = frame / fps;
    const chatter = forceTalk || mode !== 'shocked';
    const openNow = chatter && Math.sin(absT * 17) > 0.55;
    const gesture = chatter ? Math.sin(absT * 7) * 30 : 0;
    const gesture2 = chatter ? Math.sin(absT * 7 + 1.6) * 34 : 0;
    return (
      <svg
        width={360}
        height={360}
        viewBox="0 0 210 210"
        style={{
          position: 'absolute',
          left,
          bottom,
          transformOrigin: 'bottom center',
          transform: `translateY(${bob}px) rotate(${pose.lean + sway * 0.25}deg) scale(${scale})`,
          filter: 'drop-shadow(0 12px 34px rgba(0,0,0,.55))',
        }}
      >
        <g transform={`rotate(${pose.headTilt} 105 60)`}>
          {/* 呆毛：从帽子右侧翘出去再弯下来，末梢一颗金币，会甩 */}
          <g transform={`rotate(${Math.sin(absT * 8) * 26} 120 14)`}>
            <path d="M118 8 Q166 2 180 28 Q186 40 178 48" stroke="#12b582" strokeWidth={11} fill="none" strokeLinecap="round" />
            <circle cx={176} cy={52} r={11} fill={GOLD} stroke="#e6bc3c" strokeWidth={2} />
            <text x={176} y={57} fontSize={14} fill={PUPIL} textAnchor="middle" fontWeight={900}>¥</text>
          </g>
          {/* 歪帽 */}
          <g transform="rotate(-11 105 10)">
            <ellipse cx={105} cy={6} rx={45} ry={14} fill="#0e5a44" />
            <path d="M60 8 Q60 -10 105 -12 Q150 -10 150 8 Z" fill="#12b582" />
            <rect x={46} y={2} width={118} height={14} rx={7} fill="#0a3d2e" />
          </g>
          {/* 大脸 */}
          <circle cx={105} cy={52} r={37} fill={GOLD} stroke="#e6bc3c" strokeWidth={3} />
          {/* 长歪眉 */}
          <path d="M76 32 Q90 8 108 26" stroke="#0a3d2e" strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M110 20 Q126 8 138 32" stroke="#0a3d2e" strokeWidth={7} fill="none" strokeLinecap="round" />
          {/* 斗鸡眼 */}
          <circle cx={92} cy={50} r={14} fill="#fff" stroke="#e6bc3c" strokeWidth={2} />
          <circle cx={118} cy={50} r={14} fill="#fff" stroke="#e6bc3c" strokeWidth={2} />
          <circle cx={99} cy={54} r={6.5} fill={PUPIL} />
          <circle cx={111} cy={54} r={6.5} fill={PUPIL} />
          {/* 大嘴：说话张合 */}
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
      </svg>
    );
  };

type StPose = { eyes: string; mouth: string; armL: number; armR: number; jump: number; lean: number; headTilt: number };
const STPOSES: Record<string, StPose> = {
  gasp: { eyes: 'scared', mouth: 'shocked', armL: -75, armR: -75, jump: 26, lean: -6, headTilt: 10 },
  point: { eyes: 'normal', mouth: 'open', armL: 20, armR: -80, jump: 10, lean: -6, headTilt: -6 },
  present: { eyes: 'normal', mouth: 'open', armL: -88, armR: -20, jump: 8, lean: 0, headTilt: -8 },
  win: { eyes: 'star', mouth: 'cat', armL: -85, armR: -85, jump: 34, lean: 0, headTilt: 0 },
  cheer: { eyes: 'star', mouth: 'open', armL: -80, armR: -80, jump: 42, lean: 0, headTilt: 0 },
  talk: { eyes: 'normal', mouth: 'wave', armL: -30, armR: 25, jump: 0, lean: 0, headTilt: 0 },
};

const Badge: React.FC<{ f: number }> = ({ f }) => {
  const dark = f < 176 || f >= 1315;
  const p = ez(at(f, 8, 22));
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <g opacity={p}>
        <rect x={44} y={54} width={250} height={56} rx={28} fill={dark ? '#FFFFFF' : NAVY} opacity={0.14} />
        <text x={169} y={92} textAnchor="middle" fontFamily={FONT} fontSize={27} fontWeight={700}
          fill={dark ? '#FFFFFF' : NAVY} opacity={0.85}>AI 科普 · EP01</text>
      </g>
    </svg>
  );
};

export const NNV: React.FC = () => {
  const f = useCurrentFrame();
  const scene = f < F[1] ? 0 : f < F[2] ? 1 : f < F[3] ? 2 : f < F[4] ? 3 : f < F[5] ? 4 : 5;
  return (
    <AbsoluteFill style={{ backgroundColor: BG_LIGHT }}>
      {scene === 0 ? <Scene1 f={f} /> : null}
      {scene === 1 ? <Scene2 f={f - F[1]} /> : null}
      {scene === 2 ? <Scene3 f={f - F[2]} /> : null}
      {scene === 3 ? <Scene4 f={f - F[3]} /> : null}
      {scene === 4 ? <Scene5 f={f - F[4]} /> : null}
      {scene === 5 ? <Scene6 f={f - F[5]} /> : null}
      <Caption f={f} />
      <Badge f={f} />
      <Sticker mode="point" scale={0.72} left={720} bottom={430} />
      {VSCRIPT.map((_, i) => (
        <Sequence key={i} from={Math.round(F[i])}>
          <Audio src={staticFile(`vov/v${i + 1}.mp3`)} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_new/175_DigitalClouds.mp3')} loop volume={(fr) =>
        interpolate(fr, [0, 40, TOTAL - 70, TOTAL], [0, 0.11, 0.11, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
    </AbsoluteFill>
  );
};

export const CoverNNV: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG_DARK }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="cvglow" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#FFB800" stopOpacity={0.36} />
            <stop offset="100%" stopColor="#FFB800" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={540} cy={800} rx={540} ry={520} fill="url(#cvglow)" />
        <g opacity={0.85}><BrainCloud f={40} cx={540} cy={800} scale={1.05} /></g>
        <text x={540} y={1310} textAnchor="middle" fontFamily={FONT} fontSize={104} fontWeight={900} fill="#FFFFFF">什么是神经网络？</text>
        <text x={540} y={1410} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={700} fill={GOLD}>它不是大脑，是一台会学习的数学机器</text>
        <rect x={330} y={1490} width={420} height={78} rx={39} fill="none" stroke={GOLD} strokeWidth={4} />
        <text x={540} y={1543} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={700} fill={GOLD}>AI 科普 · EP01 竖屏版</text>
      </svg>
    </AbsoluteFill>
  );
};
