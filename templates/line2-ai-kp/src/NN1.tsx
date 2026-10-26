import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, staticFile, Audio, Sequence } from 'remotion';
import { SCRIPT } from './ep1Script';      // 文案唯一真源
import { F, DUR, TOTAL_FRAMES } from './ep1Timeline';  // 时间轴由配音真实时长生成
import { CHARS } from './ep1Chars';        // 每个字符的点亮时刻（词边界生成）
import { LaoJia } from './laojia';

// ============ 3Blue1Brown 实测色值 ============
const BLACK = '#000000';
const WHITE = '#F8F8F8';
const YELLOW = '#F0E000';   // 老贾10/18指定：金黄色文案
const CYAN = '#1890C0';
const BROWN = '#685850';    // 火柴人专用
const CORAL = '#F06048';
const OLIVE = '#D8C024';
const GREY1 = '#303030';
const GREY2 = '#606060';

const FONT = '"Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", sans-serif';

// ============ 文案：唯一真源，字幕与画面同源，不许两处各写一份 ============
// ============ 动效（3B1B 规矩：只生长/淡入/硬切，零回弹）============
const grow = (f: number, d: number, dur = 18) => interpolate(f, [d, d + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const fadeIn = (f: number, d: number, dur = 12) => interpolate(f, [d, d + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const fadeOut = (f: number, end: number, dur = 12) => interpolate(f, [end - dur, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const GrowLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; f: number; d: number; color?: string; w?: number }> =
  ({ x1, y1, x2, y2, f, d, color = CYAN, w = 4 }) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const p = grow(f, d, 16);
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round"
      strokeDasharray={len} strokeDashoffset={len * (1 - p)} />;
  };


// ===== 「活」动画工具：老贾10/18骂"死图/PPT"，每个元素都必须动 =====
const breathe = (f: number, period = 60, amt = 0.06) => 1 + amt * Math.sin((f / period) * Math.PI * 2);
const spin = (f: number, period = 90) => (f / period) * 360;

// 沿直线循环跑的流光点（把静态连线变成流动的线）
const FlowDot: React.FC<{ x1: number; y1: number; x2: number; y2: number; f: number; d: number; color?: string; n?: number; sp?: number; r?: number }> =
  ({ x1, y1, x2, y2, f, d, color = YELLOW, n = 3, sp = 46, r = 6 }) => {
    const on = grow(f, d, 16);
    const len = Math.hypot(x2 - x1, y2 - y1);
    return <g opacity={on * 0.95}>
      {Array.from({ length: n }).map((_, k) => {
        const t = (((f - d) / sp) + k / n) % 1;
        return <circle key={k} cx={x1 + (x2 - x1) * t} cy={y1 + (y2 - y1) * t} r={r}
          fill={color} opacity={0.35 + 0.65 * Math.sin(t * Math.PI)} />;
      })}
    </g>;
  };

// 沿直线上循环移动的方块（输入 token 往神经元里流）
const FlowBox: React.FC<{ x1: number; y1: number; x2: number; y2: number; f: number; d: number; color?: string; sp?: number; sz?: number }> =
  ({ x1, y1, x2, y2, f, d, color = WHITE, sp = 34, sz = 22 }) => {
    const on = grow(f, d, 14);
    return <g opacity={on}>
      {Array.from({ length: 3 }).map((_, k) => {
        const t = (((f - d) / sp) + k / 3) % 1;
        const e = t < 0.12 ? t / 0.12 : 1;
        const szs = sz * (0.55 + 0.45 * e);
        return <rect key={k} x={x1 + (x2 - x1) * t - szs / 2} y={y1 + (y2 - y1) * t - szs / 2}
          width={szs} height={szs} fill="none" stroke={color} strokeWidth={3.5} rx={2}
          opacity={0.4 + 0.6 * Math.sin(t * Math.PI)} />;
      })}
    </g>;
  };

// 持续旋转的圆环（旋钮/仪表）
const SpinRing: React.FC<{ cx: number; cy: number; r: number; f: number; d: number; color?: string; w?: number; dash?: number; dots?: number; dotR?: number; period?: number }> =
  ({ cx, cy, r, f, d, color = CORAL, w = 5, dash = 0.35, dots = 0, dotR = 5, period = 76 }) => {
    const on = grow(f, d, 18);
    const C = 2 * Math.PI * r;
    const rot = spin(f, period);
    return <g opacity={on}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={w}
        strokeDasharray={`${C * dash} ${C}`} strokeDashoffset={-rot}
        style={{ transformOrigin: `${cx}px ${cy}px` }} />
      {dots > 0 ? Array.from({ length: dots }).map((_, k) => {
        // 每个点在圆周上，角度随整体旋转 + 自身相位差，形成"一个一个点依次跑"
        const a2 = ((rot + (k * 360) / dots) * Math.PI) / 180;
        return <circle key={k} cx={cx + Math.cos(a2) * r} cy={cy + Math.sin(a2) * r}
          r={dotR * (0.7 + 0.5 * Math.sin((f * 0.16) + k * 1.2))} fill={color} opacity={0.95} />;
      }) : null}
    </g>;
  };


// 跑动的火柴人老贾（老贾10/18明确要"人跑动"的效果）
const RunMan: React.FC<{ f: number; y: number; w?: number }> = ({ f, y, w = 900 }) => {
  const loop = 260;                       // 一个跑动循环帧数
  const t = f % loop;
  const x = 300 + (t / loop) * w;        // 从左跑到右，循环
  const face = x > 300 + w - 60 ? -1 : 1;
  const ph = (f * 0.42) % (Math.PI * 2); // 四肢摆动
  const bob = Math.abs(Math.sin(ph * 2)) * 6;
  const swing = Math.sin(ph) * 22;
  const swing2 = Math.sin(ph + Math.PI) * 22;
  return <g opacity={grow(f, 30, 20)} transform={`translate(${x.toFixed(0)} ${(y - bob).toFixed(1)}) scale(${face} 1)`}>
    <circle cx={0} cy={-46} r={13} fill={BROWN} />
    <line x1={0} y1={-33} x2={0} y2={6} stroke={BROWN} strokeWidth={6} strokeLinecap="round" />
    <line x1={0} y1={-24} x2={-22} y2={-4 + swing * 0.4} stroke={BROWN} strokeWidth={5} strokeLinecap="round" />
    <line x1={0} y1={-24} x2={22} y2={-4 + swing2 * 0.4} stroke={BROWN} strokeWidth={5} strokeLinecap="round" />
    <line x1={0} y1={6} x2={swing} y2={44} stroke={BROWN} strokeWidth={5} strokeLinecap="round" />
    <line x1={0} y1={6} x2={swing2} y2={44} stroke={BROWN} strokeWidth={5} strokeLinecap="round" />
    {/* 手里拧着的旋钮 */}
    <circle cx={32} cy={-12 + swing2 * 0.4} r={11} fill="none" stroke={CORAL} strokeWidth={4}
      strokeDasharray={`${(2 * Math.PI * 11 * 0.3).toFixed(1)} 69.1`} strokeDashoffset={-spin(f, 34)} />
  </g>;
};

// ============ 贯穿全片的错误率条 ============
const ErrBar: React.FC = () => {
  const f = useCurrentFrame();
  let val = 28.19, accent = CORAL, yr = '2010';
  const p1 = interpolate(f, [F[11] - 10, F[11] + 34], [28.19, 15.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const p2 = interpolate(f, [F[12] - 10, F[12] + 38], [15.3, 3.57], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (f >= F[12]) { val = p2; accent = YELLOW; yr = '2015'; }
  else if (f >= F[11]) { val = p1; accent = YELLOW; yr = '2012'; }
  const ratio = Math.max(0.02, val / 28.19);
  const BW = 900;
  return (
    <div style={{ position: 'absolute', top: 26, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div style={{ fontFamily: FONT, fontSize: 21, color: GREY2, letterSpacing: 5 }}>IMAGE NET · 识别一万张图的错误率</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <div style={{ fontFamily: FONT, fontSize: 70, fontWeight: 800, color: accent, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {val.toFixed(2)}%
        </div>
        <div style={{ fontFamily: FONT, fontSize: 26, color: GREY2 }}>{yr}</div>
      </div>
      <svg width={BW} height={6}><rect x={0} y={0} width={BW} height={6} fill={GREY1} rx={3} />
        <rect x={0} y={0} width={BW * ratio} height={6} fill={accent} rx={3} /></svg>
    </div>
  );
};

// ============ 背景动效：每段一个，绝不重复 ============
const BG: React.FC<{ i: number; hard?: boolean }> = ({ i, hard }) => {
  // ★ 必须用「本幕帧」：用全局帧的话，所有进场动画在第 0 帧就播完了，画面只剩原地转 → 看着像 PPT
  const f = useCurrentFrame() - F[i];
  const sceneDur = Math.max(1, F[i + 1] - F[i]);
  // 整幕缓慢推近：哪怕元素短暂停住，画面也一直在动
  const cam = 1 + 0.055 * Math.min(1, Math.max(0, f) / sceneDur);
  const seed = (k: number) => ((i * 97 + k * 61) % 100) / 100;
  const box = (children: React.ReactNode) => (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${cam.toFixed(4)})` }}>{children}</AbsoluteFill>
  );

  if (hard && i === 0) {
    /* 硬核版第一幕｜一张脸＝1024 个数字：像素矩阵 → 每个格子露出灰度值 → 展平成向量 x ∈ ℝ¹⁰²⁴ */
    const N = 32, CELL = 17;
    const ox0 = 960 - (N * CELL) / 2, oy0 = 468 - (N * CELL) / 2;
    const flat = 1 - Math.pow(1 - grow(f, 208, 70), 3);
    const showNum = grow(f, 52, 26);
    const px = (i2: number, j2: number) => {
      const x = (i2 - 15.5) / 16, y = (j2 - 15.5) / 16;
      const face = Math.hypot(x / 0.60, (y + 0.06) / 0.80) < 1;                       // 脸盘
      const hair = y < -0.52 || (Math.hypot(x / 0.80, (y + 0.10) / 0.94) < 1 && !face); // 头发包住脸
      const shoulder = y > 0.82;                                                      // 肩膀
      const eye = Math.hypot((Math.abs(x) - 0.27) / 0.085, (y + 0.16) / 0.062) < 1;     // 眼睛
      const brow = Math.abs(y + 0.34) < 0.05 && Math.abs(Math.abs(x) - 0.27) < 0.15;   // 眉毛
      const mouth = Math.abs(y - (0.34 - x * x * 0.7)) < 0.032 && Math.abs(x) < 0.24;   // 上扬的嘴角
      const nose = Math.abs(x) < 0.045 && y > -0.10 && y < 0.14;                       // 鼻梁阴影
      let v = 0.03;
      if (hair) v = 0.17;
      if (shoulder) v = 0.11;
      if (face) v = 0.85;
      if (face && nose) v = 0.63;
      if (face && brow) v = 0.22;
      if (face && eye) v = 0.08;
      if (face && mouth) v = 0.12;
      return Math.min(1, Math.max(0, v + ((i2 * 7 + j2 * 13) % 5) * 0.012));
    };
    const pixelate = grow(f, 58, 34);   // 0-2s 是真人像，2s 后像素化成数字矩阵
    const blink = f > 26 && f < 32;     // 眨一次眼 = 这照片是"活"的
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      

      {/* ① 0-2s：一张真正的人像（彩色），先让人认出来"这是张照片" */}
      <g opacity={1 - pixelate}>
        <rect x={700} y={288} width={520} height={560} rx={18} fill="#101826" stroke="rgba(255,255,255,0.16)" strokeWidth={2.5} />
        <g>
          {/* 肩膀 */}
          <path d="M 742 848 Q 772 726 960 712 Q 1148 726 1178 848 Z" fill="#22304a" />
          {/* 脖子 */}
          <rect x={930} y={690} width={60} height={58} rx={24} fill="#c98e63" />
          {/* 头 */}
          <ellipse cx={960} cy={536} rx={124} ry={150} fill="#e0a878" />
          {/* 耳朵 */}
          <ellipse cx={838} cy={566} rx={15} ry={26} fill="#d59a6d" />
          <ellipse cx={1082} cy={566} rx={15} ry={26} fill="#d59a6d" />
          {/* 头发 */}
          <path d="M 836 540 Q 826 376 960 372 Q 1094 376 1084 540 Q 1062 422 960 414 Q 858 422 836 540 Z" fill="#241a14" />
          <path d="M 836 540 Q 830 610 848 636 Q 838 560 846 512 Z" fill="#241a14" />
          <path d="M 1084 540 Q 1090 610 1072 636 Q 1082 560 1074 512 Z" fill="#241a14" />
          {/* 眉毛 */}
          <path d="M 884 494 Q 916 478 948 492" stroke="#3a2a1e" strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d="M 972 492 Q 1004 478 1036 494" stroke="#3a2a1e" strokeWidth={9} fill="none" strokeLinecap="round" />
          {/* 眼睛 */}
          {blink ? <>
            <path d="M 886 530 Q 912 544 938 530" stroke="#2b1a10" strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d="M 982 530 Q 1008 544 1034 530" stroke="#2b1a10" strokeWidth={6} fill="none" strokeLinecap="round" />
          </> : <>
            <ellipse cx={912} cy={528} rx={26} ry={17} fill="#fdfbf7" />
            <circle cx={912} cy={528} r={11} fill="#2b1a10" />
            <circle cx={916} cy={524} r={3.6} fill="#fff" />
            <ellipse cx={1008} cy={528} rx={26} ry={17} fill="#fdfbf7" />
            <circle cx={1008} cy={528} r={11} fill="#2b1a10" />
            <circle cx={1012} cy={524} r={3.6} fill="#fff" />
          </>}
          {/* 鼻子 */}
          <path d="M 960 534 L 952 596 Q 960 606 972 598" stroke="#c08356" strokeWidth={7} fill="none" strokeLinecap="round" />
          {/* 嘴（上扬） */}
          <path d="M 908 640 Q 960 678 1012 640" stroke="#a4523f" strokeWidth={9} fill="none" strokeLinecap="round" />
          {/* 腮红 */}
          <ellipse cx={884} cy={590} rx={22} ry={13} fill="rgba(220,110,90,0.28)" />
          <ellipse cx={1036} cy={590} rx={22} ry={13} fill="rgba(220,110,90,0.28)" />
        </g>
        {/* 相册 UI 的一点点暗示 */}
        <text x={724} y={330} fontFamily={FONT} fontSize={20} fill="rgba(255,255,255,0.5)">相册 · 今天</text>
      </g>
      <g opacity={pixelate}>
      {Array.from({ length: N * N }).map((_, k) => {
        const i2 = k % N, j2 = Math.floor(k / N);
        const gx = ox0 + i2 * CELL, gy = oy0 + j2 * CELL;
        const fx = 160 + (k / (N * N - 1)) * 1600, fy = 470;
        const sw = CELL - (CELL - 1.55) * flat;
        const sh = CELL + (56 - CELL) * flat;
        const x = gx + (fx - gx) * flat;
        const y = fy - sh / 2 + (gy + CELL / 2 - fy) * (1 - flat);
        const v = px(i2, j2);
        const g = Math.round(255 * Math.min(1, Math.max(0, v + 0.04 * Math.sin(f * 0.26 + k * 1.7))));
        return <g key={k}>
          <rect x={x} y={y} width={sw} height={sh} fill={`rgb(${g},${g},${g})`} opacity={0.9} />
          {showNum > 0 && flat < 0.35 && k % 11 === 0
            ? <text x={x + sw / 2} y={y + sh / 2 + 4} textAnchor="middle" fontFamily={FONT} fontSize={7.5}
              fill={v > 0.5 ? '#111' : '#bbb'} opacity={showNum * (1 - flat / 0.35)}>{g}</text>
            : null}
        </g>;
      })}
      </g>
      {/* 展平后的向量标注 */}
      <g opacity={grow(f, 170, 24)}>
        <text x={160} y={516} fontFamily={FONT} fontSize={26} fill={YELLOW}>x ∈ ℝ¹⁰²⁴</text>
        <text x={1760} y={516} textAnchor="end" fontFamily={FONT} fontSize={22} fill={GREY2}>展平 flatten</text>
        {/* 向量两端的括号 */}
        <path d="M 150 430 L 138 430 L 138 512 L 150 512" fill="none" stroke={YELLOW} strokeWidth={3} />
        <path d="M 1770 430 L 1782 430 L 1782 512 L 1770 512" fill="none" stroke={YELLOW} strokeWidth={3} />
      </g>
      {/* 像素被读取的扫描线 */}
      <line x1={ox0} y1={oy0 + 560 * (((f - 8) / 40) % 1)} x2={ox0 + N * CELL} y2={oy0 + 560 * (((f - 8) / 40) % 1)}
        stroke={CYAN} strokeWidth={2} opacity={pixelate * (f < 210 ? 0.5 : 0)} />
    </svg>);
  }

  if (hard && i === 1) {
    /* 硬核版第二幕｜一个神经元在做加权求和：z = Σ wᵢxᵢ + b → ReLU */
    const M = 14;
    const ix = 470, iy0 = 292, iyGap = 41;
    const nx = 1180, ny = 512;
    const w = (k: number) => Math.sin(k * 2.31 + 0.7) * 0.92;
    const xs = (k: number) => 0.15 + Math.abs(Math.sin(k * 1.77 + 0.4)) * 0.85;
    const zFinal = Array.from({ length: M }).reduce((s: number, _, k) => s + w(k) * xs(k), 0) + 0.08;
    const zNow = zFinal * (1 - Math.pow(1 - grow(f, 56, 116), 3));
    const fired = zNow > 0.35;
    const ax = 1600, ay = 512;
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <text x={960} y={206} textAnchor="middle" fontFamily={FONT} fontSize={30} fill={WHITE} opacity={grow(f, 0, 16)}>
        z = <tspan fill={YELLOW}>Σ</tspan> wᵢ xᵢ + b
      </text>
      <text x={960} y={244} textAnchor="middle" fontFamily={FONT} fontSize={21} fill={GREY2} opacity={grow(f, 16, 16)}>
        一个神经元 = 把 1024 个输入，按各自的权重加起来
      </text>

      {/* 输入节点 + 数值条 */}
      {Array.from({ length: M }).map((_, k) => {
        const y = iy0 + k * iyGap;
        const on = grow(f, 12 + k * 3, 14);
        const xv = xs(k);
        const wv = w(k);
        return <g key={k} opacity={on}>
          <line x1={ix} y1={y} x2={nx - 104} y2={ny + (y - ny) * 0.12}
            stroke={wv > 0 ? CYAN : CORAL} strokeWidth={1 + Math.abs(wv) * 7} opacity={0.28} />
          <rect x={ix - 96} y={y - 7} width={70} height={14} fill="rgba(255,255,255,0.10)" rx={2} />
          <rect x={ix - 96} y={y - 7} width={70 * xv} height={14} fill={WHITE} opacity={0.55} rx={2} />
          <circle cx={ix} cy={y} r={7} fill={BLACK} stroke={WHITE} strokeWidth={2.4} />
          <text x={ix - 104} y={y + 6} textAnchor="end" fontFamily={FONT} fontSize={17} fill={GREY2}>x{k + 1}={xv.toFixed(2)}</text>
          <text x={ix + 22} y={y + 5} fontFamily={FONT} fontSize={14} fill={wv > 0 ? CYAN : CORAL} opacity={0.9}>{wv.toFixed(2)}</text>
        </g>;
      })}

      {/* 神经元本体 */}
      <circle cx={nx} cy={ny} r={112} fill="rgba(8,8,8,0.95)" stroke={YELLOW} strokeWidth={5} />
      <text x={nx} y={ny - 8} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={800} fill={YELLOW}>Σ</text>
      <text x={nx} y={ny + 42} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={WHITE} opacity={0.8}>加权求和</text>
      {/* b 偏置 */}
      <line x1={nx} y1={ny + 150} x2={nx} y2={ny + 112} stroke={GREY2} strokeWidth={2.4} />
      <text x={nx} y={ny + 178} textAnchor="middle" fontFamily={FONT} fontSize={19} fill={GREY2}>b = 0.08</text>

      {/* 输出：激活 */}
      <line x1={nx + 112} y1={ny} x2={ax - 54} y2={ay} stroke={fired ? YELLOW : GREY2} strokeWidth={fired ? 4 : 2} opacity={fired ? 0.95 : 0.35} />
      <circle cx={ax} cy={ay} r={54} fill="rgba(8,8,8,0.95)" stroke={fired ? YELLOW : GREY2} strokeWidth={4} />
      <text x={ax} y={ay + 9} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill={fired ? YELLOW : GREY2}>a</text>
      <text x={ax} y={ay + 92} textAnchor="middle" fontFamily={FONT} fontSize={18} fill={GREY2}>ReLU(z)</text>

      {/* 实时数字 */}
      <text x={nx} y={ny + 244} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={fired ? YELLOW : WHITE}>
        z = {zNow.toFixed(2)}
      </text>
      <text x={nx} y={ny + 280} textAnchor="middle" fontFamily={FONT} fontSize={18} fill={GREY2} opacity={grow(f, 150, 18)}>
        {fired ? '超过阈值 → 这一层被激活' : '还在累加……'}
      </text>
    </svg>);
  }

  if (i === 0) {
    /* 第一幕｜视觉语言＝「手机屏幕 UI」：相册面板 → 胶卷缩略图 → 一张放大
       → 人脸检测框 → 扫描线 → 关键点依次亮 → 连成三角网格 */
    const cx = 960, cy = 508;
    const ring = Array.from({ length: 24 }).map((_, k) => {
      const a = (k / 24) * Math.PI * 2 - Math.PI / 2;
      return [cx + Math.cos(a) * 164, cy + Math.sin(a) * 198] as const;
    });
    const eyeRing = (ex: number) => Array.from({ length: 8 }).map((_, k) => {
      const a = (k / 8) * Math.PI * 2;
      return [ex + Math.cos(a) * 43, cy - 60 + Math.sin(a) * 22] as const;
    });
    const eyeL = eyeRing(cx - 82), eyeR = eyeRing(cx + 82);
    const nose: Array<readonly [number, number]> = [[cx - 15, cy + 4], [cx + 15, cy + 4], [cx + 10, cy + 56], [cx - 10, cy + 56]];
    const mouth = Array.from({ length: 10 }).map((_, k) => {
      const a = Math.PI * 0.12 + (k / 9) * Math.PI * 0.76;
      return [cx + Math.cos(a) * 74, cy + 112 + Math.sin(a) * 27] as const;
    });
    const browL = Array.from({ length: 5 }).map((_, k) => [cx - 126 + k * 22, cy - 120 - Math.sin((k / 4) * Math.PI) * 10] as const);
    const browR = Array.from({ length: 5 }).map((_, k) => [cx + 126 - k * 22, cy - 120 - Math.sin((k / 4) * Math.PI) * 10] as const);
    const groups: Array<{ pts: Array<readonly [number, number]>; d: number; st: number }> = [
      { pts: ring, d: 96, st: 2.2 },
      { pts: [...browL, ...browR], d: 130, st: 2.0 },
      { pts: [...eyeL, ...eyeR], d: 142, st: 2.4 },
      { pts: nose, d: 158, st: 3.0 },
      { pts: mouth, d: 168, st: 2.0 },
    ];
    const meshOn = grow(f, 196, 26);
    const expand = grow(f, 36, 22);
    const scanY = 292 + 452 * (((f - 64) / 40) % 1);
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {/* 相册面板 */}
      <rect x={330} y={150} width={1260} height={790} rx={16} fill="rgba(255,255,255,0.015)"
        stroke={GREY2} strokeWidth={3} opacity={0.55 * (1 - expand * 0.75)}
        strokeDasharray={4200} strokeDashoffset={4200 * (1 - grow(f, 0, 10))} />
      <text x={372} y={208} fontFamily={FONT} fontSize={30} fill={GREY2} opacity={grow(f, 12, 20) * (1 - expand)}>相册 · 今天</text>
      <text x={1516} y={208} textAnchor="end" fontFamily={FONT} fontSize={24} fill={GREY2} opacity={grow(f, 18, 20) * (1 - expand)}>128 张</text>

      {/* 胶卷缩略图 4×3，中间那张是脸 */}
      {Array.from({ length: 12 }).map((_, k) => {
        const col = k % 4, row = Math.floor(k / 4);
        const x = 372 + col * 300, y = 242 + row * 206;
        const op = grow(f, k * 1.6, 12) * (1 - expand);
        return <g key={k} opacity={op}>
          <rect x={x} y={y} width={280} height={186} rx={8} fill={`hsla(${196 + (k * 41) % 120}, 42%, 20%, 0.62)`} stroke="rgba(255,255,255,0.16)" strokeWidth={2} />
          {k === 5 ? <>
            <circle cx={x + 140} cy={y + 78} r={32} fill="none" stroke={WHITE} strokeWidth={3} opacity={0.8} />
            <path d={`M ${x + 86} ${y + 160} Q ${x + 140} ${y + 104} ${x + 194} ${y + 160}`} fill="none" stroke={WHITE} strokeWidth={3} opacity={0.8} />
          </> : k % 3 === 0 ? <>
            <path d={`M ${x + 46} ${y + 150} L ${x + 112} ${y + 62} L ${x + 178} ${y + 150} Z`} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={3} />
            <circle cx={x + 206} cy={y + 66} r={16} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={3} />
          </> : k % 3 === 1 ? <>
            <path d={`M ${x + 62} ${y + 132} L ${x + 84} ${y + 92} L ${x + 190} ${y + 92} L ${x + 214} ${y + 132} Z`} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
            <circle cx={x + 96} cy={y + 144} r={14} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={3} />
            <circle cx={x + 184} cy={y + 144} r={14} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={3} />
          </> : <>
            <circle cx={x + 140} cy={y + 96} r={34} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
            <circle cx={x + 140} cy={y + 96} r={12} fill="rgba(255,255,255,0.25)" />
          </>}
        </g>;
      })}

      {/* 放大后的那张照片 + 人脸轮廓 */}
      <g opacity={expand}>
        <rect x={700} y={250} width={520} height={560} rx={10} fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.16)" strokeWidth={2.5} />
        <ellipse cx={cx} cy={cy + 6} rx={158} ry={196} fill="none" stroke={WHITE} strokeWidth={2.5} opacity={0.22} />
        <ellipse cx={cx - 82} cy={cy - 60} rx={36} ry={18} fill="none" stroke={WHITE} strokeWidth={2.5} opacity={0.22} />
        <ellipse cx={cx + 82} cy={cy - 60} rx={36} ry={18} fill="none" stroke={WHITE} strokeWidth={2.5} opacity={0.22} />
        <path d={`M ${cx - 70} ${cy + 116} Q ${cx} ${cy + 156} ${cx + 70} ${cy + 116}`} fill="none" stroke={WHITE} strokeWidth={2.5} opacity={0.22} />
      </g>

      {/* 检测框四角 + 扫描线 */}
      <g opacity={grow(f, 64, 16)}>
        {[[700, 250, 1, 1], [1220, 250, -1, 1], [700, 810, 1, -1], [1220, 810, -1, -1]].map(([x, y, sx, sy], k) => (
          <path key={k} d={`M ${x + sx * 52} ${y} L ${x} ${y} L ${x} ${y + sy * 52}`} fill="none" stroke={YELLOW} strokeWidth={5} strokeLinecap="round" />
        ))}
        <line x1={706} y1={scanY} x2={1214} y2={scanY} stroke={YELLOW} strokeWidth={3} opacity={f > 64 && f < 240 ? 0.85 : 0} />
        <text x={724} y={286} fontFamily={FONT} fontSize={22} fill={YELLOW} opacity={0.9}>检测到人脸</text>
      </g>

      {/* 关键点：一组一组亮起来 */}
      {groups.map((g, gi) => g.pts.map(([px, py], k) => (
        <g key={`${gi}-${k}`} opacity={grow(f, g.d + k * g.st, 12)}>
          <circle cx={px} cy={py} r={5.5 * (1 + 0.35 * Math.sin(f * 0.16 + k))} fill={YELLOW} />
          <circle cx={px} cy={py} r={11} fill="none" stroke={YELLOW} strokeWidth={1.4} opacity={0.35} />
        </g>
      )))}

      {/* 连成网格：轮廓环 + 眼环 + 鼻嘴链 + 几条跨接 */}
      <g opacity={meshOn}>
        {ring.map(([x1, y1], k) => {
          const [x2, y2] = ring[(k + 1) % ring.length];
          return <line key={'r' + k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={YELLOW} strokeWidth={2} opacity={0.5} />;
        })}
        {[eyeL, eyeR].map((e, q) => e.map(([x1, y1], k) => {
          const [x2, y2] = e[(k + 1) % e.length];
          return <line key={`e${q}-${k}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={YELLOW} strokeWidth={2} opacity={0.55} />;
        }))}
        {nose.map(([x1, y1], k) => k === 0 ? null : <line key={'n' + k} x1={nose[k - 1][0]} y1={nose[k - 1][1]} x2={x1} y2={y1} stroke={YELLOW} strokeWidth={2} opacity={0.55} />)}
        {mouth.map(([x1, y1], k) => k === 0 ? null : <line key={'m' + k} x1={mouth[k - 1][0]} y1={mouth[k - 1][1]} x2={x1} y2={y1} stroke={YELLOW} strokeWidth={2} opacity={0.55} />)}
        <line x1={eyeL[0][0]} y1={eyeL[0][1]} x2={eyeR[7][0]} y2={eyeR[7][1]} stroke={YELLOW} strokeWidth={1.6} opacity={0.3} />
        <line x1={nose[3][0]} y1={nose[3][1]} x2={mouth[5][0]} y2={mouth[5][1]} stroke={YELLOW} strokeWidth={1.6} opacity={0.3} />
      </g>
    </svg>);
  }

  if (i === 1) {
    /* 第二幕｜视觉语言＝「机械旋钮阵列」：49 个金属旋钮 → 电缆连成网
       → 按脸型依次点亮（一个旋钮不够，上千个串起来才是一张脸） */
    const FACE = [
      [0, 1, 1, 1, 1, 1, 0],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [0, 1, 1, 1, 1, 1, 0],
    ];
    const G = 7, SP = 90, ox = 960 - ((G - 1) * SP) / 2, oy = 492 - ((G - 1) * SP) / 2;
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {/* 电缆：横竖两向，一条条长出来 */}
      {Array.from({ length: G }).map((_, r) => Array.from({ length: G - 1 }).map((_, c) => {
        const [x1, y1] = [ox + c * SP, oy + r * SP];
        const len = SP;
        const p = grow(f, 46 + (r * 6 + c) * 2.2, 14);
        return <line key={`h${r}-${c}`} x1={x1} y1={y1} x2={x1 + len} y2={y1}
          stroke={WHITE} strokeWidth={2} opacity={0.22} strokeDasharray={len} strokeDashoffset={len * (1 - p)} />;
      }))}
      {Array.from({ length: G - 1 }).map((_, r) => Array.from({ length: G }).map((_, c) => {
        const [x1, y1] = [ox + c * SP, oy + r * SP];
        const len = SP;
        const p = grow(f, 52 + (r * 6 + c) * 2.2, 14);
        return <line key={`v${r}-${c}`} x1={x1} y1={y1} x2={x1} y2={y1 + len}
          stroke={WHITE} strokeWidth={2} opacity={0.22} strokeDasharray={len} strokeDashoffset={len * (1 - p)} />;
      }))}

      {/* 49 个旋钮 */}
      {Array.from({ length: G }).map((_, r) => Array.from({ length: G }).map((_, c) => {
        const x = ox + c * SP, y = oy + r * SP;
        const isFace = FACE[r][c] === 1;
        // 眼睛 + 嘴单独标成金色：蓝圈是脸的轮廓，金点才是五官 → 一眼就看出是张脸
        const isFeature = (r === 2 && (c === 2 || c === 4)) || (r === 4 && c >= 2 && c <= 4);
        const appear = grow(f, 4 + (r * G + c) * 0.7, 12);
        const litAt = 92 + (r * G + c) * 1.2;
        const lit = isFace ? grow(f, litAt, 16) : grow(f, litAt + 60, 16) * 0.18;
        const rot = spin(f, 96 + ((r * 7 + c * 5) % 9) * 16) + (r * 13 + c * 29) * 9;
        const col = isFeature ? YELLOW : CYAN;
        const R = 25 * (1 + 0.14 * lit) * breathe(f, 54 + c * 4, 0.05);
        return <g key={`k${r}-${c}`} opacity={appear} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
          <circle r={R} fill="rgba(10,10,10,0.9)" stroke={col} strokeWidth={isFace ? 3.2 : 2.2}
            opacity={0.35 + 0.65 * lit} />
          {/* 刻度 */}
          {Array.from({ length: 12 }).map((_, t) => {
            const a = ((t * 30 + rot * 0.15) * Math.PI) / 180;
            return <line key={t} x1={Math.cos(a) * R} y1={Math.sin(a) * R} x2={Math.cos(a) * (R - 6)} y2={Math.sin(a) * (R - 6)}
              stroke={col} strokeWidth={1.6} opacity={0.35 + 0.5 * lit} />;
          })}
          {/* 指针 */}
          <line x1={0} y1={0} x2={Math.cos((rot * Math.PI) / 180) * (R - 8)} y2={Math.sin((rot * Math.PI) / 180) * (R - 8)}
            stroke={col} strokeWidth={3.4} strokeLinecap="round" opacity={0.5 + 0.5 * lit} />
          <circle r={4.5} fill={col} opacity={0.6 + 0.4 * lit} />
          {isFace && lit > 0.5 ? <circle r={R + 10 + 5 * Math.sin(f * 0.14 + r + c)} fill="none" stroke={YELLOW} strokeWidth={1.4} opacity={0.28 * lit} /> : null}
        </g>;
      }))}

      {/* 电缆上的光脉冲，往右/往下一直流 */}
      {Array.from({ length: G }).map((_, r) => Array.from({ length: G - 1 }).map((_, c) => {
        const t = ((f * 0.016 + (r * 0.13 + c * 0.21)) % 1);
        const x = ox + c * SP + SP * t, y = oy + r * SP;
        return <circle key={`ph${r}-${c}`} cx={x} cy={y} r={3.2} fill={YELLOW}
          opacity={0.1 + 0.75 * Math.sin(t * Math.PI) * grow(f, 200, 20)} />;
      }))}
    </svg>);
  }
  if (hard && i === 2) {
    /* 硬核版第三幕｜生物神经元 ≙ 数学单元：一条扫描线把左边"翻译"成右边 */
    const tr = grow(f, 26, 56);
    const bx = 460, by = 470;
    const mx = 1230, my = 470;
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <text x={bx} y={190} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={GREY2} letterSpacing={6} opacity={grow(f, 0, 16)}>生物 · 一个细胞</text>
      <text x={mx} y={190} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={GREY2} letterSpacing={6} opacity={grow(f, 40, 20)}>数学 · 一个单元</text>

      {/* 左：生物神经元（树突 + 胞体 + 轴突） */}
      <g opacity={1 - 0.55 * tr}>
        {Array.from({ length: 11 }).map((_, k) => {
          const a = (k / 11) * Math.PI * 2 + 0.2;
          const r1 = 44, r2 = 116 + (k % 3) * 26, r3 = r2 + 54;
          return <g key={k} opacity={grow(f, 4 + k * 2, 14)}>
            <line x1={bx + Math.cos(a) * r1} y1={by + Math.sin(a) * r1} x2={bx + Math.cos(a) * r2} y2={by + Math.sin(a) * r2}
              stroke={OLIVE} strokeWidth={3.4} strokeLinecap="round" />
            <line x1={bx + Math.cos(a) * r2} y1={by + Math.sin(a) * r2}
              x2={bx + Math.cos(a + 0.22) * r3} y2={by + Math.sin(a + 0.22) * r3}
              stroke={OLIVE} strokeWidth={2.6} strokeLinecap="round" opacity={0.8} />
            <line x1={bx + Math.cos(a) * r2} y1={by + Math.sin(a) * r2}
              x2={bx + Math.cos(a - 0.2) * (r2 + 40)} y2={by + Math.sin(a - 0.2) * (r2 + 40)}
              stroke={OLIVE} strokeWidth={2.6} strokeLinecap="round" opacity={0.8} />
          </g>;
        })}
        <circle cx={bx} cy={by} r={46 * breathe(f, 50, 0.06)} fill="none" stroke={OLIVE} strokeWidth={5} />
        <circle cx={bx} cy={by} r={18} fill={OLIVE} opacity={0.75} />
        {/* 轴突朝右 */}
        <path d={`M ${bx + 46} ${by} L 700 ${by} Q 740 ${by} 760 ${by - 30}`} fill="none" stroke={OLIVE} strokeWidth={4.5} strokeLinecap="round" />
        <path d={`M 760 ${by - 30} L 786 ${by - 62} M 760 ${by - 30} L 796 ${by - 20}`} stroke={OLIVE} strokeWidth={3} strokeLinecap="round" />
      </g>

      {/* 中间：等价号 */}
      <text x={960} y={512} textAnchor="middle" fontFamily={FONT} fontSize={64} fill={WHITE} opacity={grow(f, 34, 20)}>≙</text>

      {/* 右：数学单元（紧凑符号，不抢第 4/5 幕主图的戏） */}
      <g opacity={tr}>
        <rect x={mx - 150} y={my - 96} width={300} height={192} rx={10} fill="rgba(10,10,10,0.9)" stroke={YELLOW} strokeWidth={4} />
        <text x={mx} y={my - 30} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={800} fill={YELLOW}>Σ</text>
        <text x={mx} y={my + 12} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={WHITE} opacity={0.85}>加权求和</text>
        {/* 激活折线 */}
        <path d={`M ${mx - 92} ${my + 64} L ${mx - 18} ${my + 64} L ${mx + 62} ${my + 26}`} fill="none" stroke={CYAN} strokeWidth={4} strokeLinecap="round" />
        <text x={mx + 96} y={my + 30} fontFamily={FONT} fontSize={17} fill={CYAN}>f(·)</text>
        {/* 输入/输出箭头 */}
        <line x1={mx - 250} y1={my} x2={mx - 152} y2={my} stroke={WHITE} strokeWidth={4} markerEnd="" />
        <line x1={mx + 152} y1={my} x2={mx + 250} y2={my} stroke={YELLOW} strokeWidth={4} />
        <text x={mx - 168} y={my - 112} textAnchor="start" fontFamily={FONT} fontSize={19} fill={GREY2}>输入</text>
        <text x={mx + 262} y={my + 8} fontFamily={FONT} fontSize={20} fill={YELLOW}>输出</text>
      </g>

      {/* 翻译扫描线 */}
      <line x1={860 + 620 * (((f - 26) / 56) % 1)} y1={240} x2={860 + 620 * (((f - 26) / 56) % 1)} y2={760}
        stroke={CYAN} strokeWidth={2.5} opacity={f > 20 && f < 100 ? 0.5 : 0} />
    </svg>);
  }

  if (hard && i === 3) {
    /* 硬核版第四幕｜钻进大脑：满屏细胞 → 推近 → 只剩一个 → 露出三根输入线（交给下一幕） */
    const zoom = 1 - Math.pow(1 - grow(f, 0, 130), 3);
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {/* 远处的一群细胞，推近时散开淡出 */}
      {Array.from({ length: 46 }).map((_, k) => {
        const a = (k / 46) * Math.PI * 2;
        const r = 220 + ((k * 53) % 300);
        const x = 960 + Math.cos(a) * r, y = 500 + Math.sin(a) * r * 0.66;
        return <circle key={k} cx={x} cy={y} r={(12 + (k % 5) * 4) * (1 + zoom)}
          fill="none" stroke={OLIVE} strokeWidth={2.4} opacity={(1 - zoom * 0.9) * 0.45} />;
      })}
      {/* 中心那个细胞：推近到画面中央（树突淡下去，留出干净的胞体） */}
      <g transform={`translate(960 520) scale(${0.62 + zoom * 0.95}) translate(-960 -520)`}>
        {Array.from({ length: 11 }).map((_, k) => {
          const a = (k / 11) * Math.PI * 2 + 0.2;
          const r1 = 44, r2 = 116 + (k % 3) * 26;
          const fall = 1 - 0.68 * zoom;
          return <g key={k}>
            <line x1={960 + Math.cos(a) * r1} y1={520 + Math.sin(a) * r1} x2={960 + Math.cos(a) * r2} y2={520 + Math.sin(a) * r2}
              stroke={OLIVE} strokeWidth={3.6} strokeLinecap="round" opacity={0.6 * fall} />
            <line x1={960 + Math.cos(a) * r2} y1={520 + Math.sin(a) * r2}
              x2={960 + Math.cos(a + 0.22) * (r2 + 54)} y2={520 + Math.sin(a + 0.22) * (r2 + 54)}
              stroke={OLIVE} strokeWidth={2.6} strokeLinecap="round" opacity={0.4 * fall} />
          </g>;
        })}
        <circle cx={960} cy={520} r={52 * breathe(f, 46, 0.07)} fill="none" stroke={OLIVE} strokeWidth={6} />
        <circle cx={960} cy={520} r={20 + 7 * Math.abs(Math.sin(f * 0.11))} fill={OLIVE} opacity={0.8} />
      </g>
      {/* 三根线上一直有信号往胞体里跑（不然这一拍会站着不动） */}
      {[0, 1, 2].map((k) => {
        const t0 = (f - 176) / 54 + k / 3;
        const tt = ((t0 % 1) + 1) % 1;
        const y1 = 390 + k * 130;
        const px = 560 + (960 - 560) * tt;
        const py = y1 + (520 - y1) * tt;
        return <circle key={'sig' + k} cx={px} cy={py} r={6.5} fill={YELLOW}
          opacity={f > 176 ? 0.15 + 0.75 * Math.sin(tt * Math.PI) : 0} />;
      })}
      {/* 三根输入线：从左边一根根插进来，交给下一幕 */}
      {[0, 1, 2].map((k) => {
        const yy = 390 + k * 130;
        const p = grow(f, 138 + k * 14, 26);
        return <g key={k} opacity={p}>
          <line x1={560} y1={yy} x2={960} y2={520} stroke={CYAN} strokeWidth={4.5} strokeLinecap="round"
            strokeDasharray={470} strokeDashoffset={470 * (1 - p)} />
          <circle cx={560} cy={yy} r={11} fill={BLACK} stroke={WHITE} strokeWidth={3} />
          <text x={534} y={yy + 9} textAnchor="end" fontFamily={FONT} fontSize={28} fill={WHITE}>x{k + 1}</text>
          <text x={742} y={yy + (520 - yy) * 0.42 - 10} fontFamily={FONT} fontSize={17} fill={CYAN} opacity={0.9}>× w{k + 1}</text>
        </g>;
      })}
    </svg>);
  }

  if (i <= 3) {           // 大脑 + 上千亿亮点
    return box(<svg width={1500} height={620} viewBox="0 0 1500 620">
      <path d="M 480 470 Q 380 330 480 210 Q 550 110 690 150 Q 790 70 910 150 Q 1075 110 1100 280 Q 1190 400 1060 490 Q 920 570 740 540 Q 590 570 480 470 Z"
        fill="none" stroke={BROWN} strokeWidth={7} strokeDasharray={2600} strokeDashoffset={2600 * (1 - grow(f, 4, 40))} />
      {Array.from({ length: 110 }).map((_, k) => {
        const x = 540 + ((k * 97) % 540), y = 200 + ((k * 131) % 330);
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(f * 0.09 + k * 0.7));
        return <circle key={k} cx={x} cy={y} r={(seed(k) * 11 + 8) * (1 + 0.22 * Math.sin(f * 0.13 + k))}
          fill={k % 8 === 0 ? YELLOW : OLIVE} opacity={tw * grow(f, 30 + k * 0.5, 10)} />;
      })}
      {f > 140 && i === 3 ? <g opacity={grow(f, 140, 20)} transform={`translate(750 395) scale(${breathe(f, 46, 0.07).toFixed(3)}) translate(-750 -395)`}>
        <SpinRing cx={880} cy={395} r={96} f={f} d={150} color={YELLOW} w={3} dash={0.22} dots={8} dotR={6} period={64} />
        <rect x={620} y={330} width={260} height={130} fill={GREY1} stroke={YELLOW} strokeWidth={4} rx={4} />
        <text x={750} y={388} textAnchor="middle" fontFamily={FONT} fontSize={44} fill={YELLOW}>一个细胞</text>
        <text x={750} y={432} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={WHITE} opacity={0.75}>连着上万个邻居</text>
      </g> : null}
    </svg>);
  }
  if (hard && i === 5) {
    /* 硬核版第六幕｜一个不够 → 分裂成一整排 → 输出汇成一条向量（"摆成一层"） */
    const spread = grow(f, 40, 70);
    const N = 11;
    const rowY = 560;
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <text x={960} y={200} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={GREY2} letterSpacing={6} opacity={grow(f, 0, 16)}>一个不够 · 摆成一层</text>
      {/* 源头单元 */}
      <circle cx={960} cy={300} r={54 * breathe(f, 50, 0.05)} fill="rgba(8,8,8,0.95)" stroke={YELLOW} strokeWidth={4} />
      <text x={960} y={312} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={YELLOW}>Σ</text>
      {/* 一整排单元 */}
      {Array.from({ length: N }).map((_, k) => {
        const x = 960 + (k - (N - 1) / 2) * 108 * spread;
        const on = grow(f, 44 + k * 3, 16);
        return <g key={k} opacity={on}>
          <line x1={960} y1={356} x2={x} y2={rowY - 38} stroke={CYAN} strokeWidth={1.6} opacity={0.25 * spread} />
          <circle cx={x} cy={rowY} r={32 * breathe(f, 44 + k * 2, 0.06)} fill="rgba(8,8,8,0.95)" stroke={CYAN} strokeWidth={3.2} />
          <text x={x} y={rowY + 8} textAnchor="middle" fontFamily={FONT} fontSize={18} fill={CYAN}>Σ</text>
          {/* 输出往下汇 */}
          <line x1={x} y1={rowY + 34} x2={x} y2={770} stroke={YELLOW} strokeWidth={1.6} opacity={0.3} />
        </g>;
      })}
      {/* 底下一整条：这一层的输出向量 */}
      <rect x={330} y={770} width={1260} height={54} rx={6} fill="rgba(255,210,74,0.08)" stroke={YELLOW} strokeWidth={3} opacity={grow(f, 120, 24)} />
      <text x={960} y={806} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={YELLOW} opacity={grow(f, 130, 20)}>
        这一层的输出 = {N} 个数，再喂给下一层
      </text>
      {/* 数量感：后面还有无数层 */}
      <text x={960} y={900} textAnchor="middle" fontFamily={FONT} fontSize={20} fill={GREY2} opacity={grow(f, 150, 20)}>
        一层 11 个 → 下一层再乘 11 → 深度就是这么来的
      </text>
    </svg>);
  }

  if (hard && i === 6) {
    /* 硬核版第七幕｜三层流水线：第一层看短线 → 第二层拼弧 → 第三层拼五官 */
    // 三层各画各的：边 → 弧/折角 → 五官，不许三层长一个样
    const glyph = (x: number, y: number, col: string, L: number, k: number) => {
      const cx = x + 60, cy = y + 45;
      if (L === 0) {
        const a = ((k % 4) * 45) * Math.PI / 180;
        return <line x1={cx - Math.cos(a) * 34} y1={cy - Math.sin(a) * 34} x2={cx + Math.cos(a) * 34} y2={cy + Math.sin(a) * 34}
          stroke={col} strokeWidth={4} strokeLinecap="round" />;
      }
      if (L === 1) {
        return k % 2 === 0
          ? <path d={`M ${cx - 36} ${cy + 22} Q ${cx} ${cy - 34} ${cx + 36} ${cy + 22}`} fill="none" stroke={col} strokeWidth={4} strokeLinecap="round" />
          : <path d={`M ${cx - 32} ${cy + 26} L ${cx - 32} ${cy - 24} L ${cx + 30} ${cy - 24}`} fill="none" stroke={col} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />;
      }
      return k % 3 === 0
        ? <ellipse cx={cx} cy={cy} rx={30} ry={17} fill="none" stroke={col} strokeWidth={4} />
        : k % 3 === 1
          ? <path d={`M ${cx} ${cy - 28} L ${cx - 15} ${cy + 20} L ${cx + 15} ${cy + 20} Z`} fill="none" stroke={col} strokeWidth={4} strokeLinejoin="round" />
          : <path d={`M ${cx - 30} ${cy + 12} Q ${cx} ${cy - 20} ${cx + 30} ${cy + 12}`} fill="none" stroke={col} strokeWidth={4} strokeLinecap="round" />;
    };
    const lane = (y: number, col: string, L: number) => Array.from({ length: 9 }).map((_, k) => {
      const x = 300 + k * 150;
      const on = grow(f, 10 + L * 18 + k * 4, 16);
      return <g key={k} opacity={on}>
        <rect x={x} y={y} width={120} height={90} rx={6} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
        {glyph(x, y, col, L, k)}
      </g>;
    });
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <text x={210} y={286} textAnchor="end" fontFamily={FONT} fontSize={22} fill={CYAN}>第一层 · 短线</text>
      <text x={210} y={506} textAnchor="end" fontFamily={FONT} fontSize={22} fill={YELLOW}>第二层 · 弧</text>
      <text x={210} y={726} textAnchor="end" fontFamily={FONT} fontSize={22} fill={CORAL}>第三层 · 五官</text>
      {lane(240, CYAN, 0)}
      {lane(460, YELLOW, 1)}
      {lane(680, CORAL, 2)}
      {/* 层间箭头，全部往右流 */}
      {[378, 598].map((y, q) => (
        <g key={q} opacity={grow(f, 80 + q * 20, 20)}>
          <line x1={1660} y1={y} x2={1760} y2={y} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
          <path d={`M 1760 ${y} l -14 -9 l 0 18 Z`} fill="rgba(255,255,255,0.5)" />
          {[0, 1, 2].map((k) => {
            const t = ((f * 0.02 + k / 3) % 1);
            return <circle key={k} cx={1660 + 100 * t} cy={y} r={5} fill={YELLOW} opacity={0.2 + 0.7 * Math.sin(t * Math.PI)} />;
          })}
        </g>
      ))}
      <text x={960} y={930} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={GREY2} opacity={grow(f, 150, 20)}>
        每一层只干一件小事，往下传的是"上一层的结论"
      </text>
    </svg>);
  }

  if (hard && i === 7) {
    /* 硬核版第八幕｜从下往上堆：三层石板叠起来，顶上一张脸浮出来 */
    const up = [0, 1, 2].map((k) => grow(f, 20 + k * 40, 26));
    const faceOn = grow(f, 104, 30);
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {[0, 1, 2].map((k) => {
        const w = 900 - k * 210, y = 790 - k * 132;
        return <g key={k} opacity={up[k]}
          transform={`translate(0 ${(1 - up[k]) * 60})`}>
          <rect x={960 - w / 2} y={y} width={w} height={96} rx={8} fill="rgba(255,255,255,0.05)"
            stroke={k === 2 ? YELLOW : OLIVE} strokeWidth={4} />
          {Array.from({ length: 14 }).map((_, j) => (
            <circle key={j} cx={960 - w / 2 + 34 + j * ((w - 68) / 13)} cy={y + 48} r={7}
              fill="none" stroke={k === 2 ? YELLOW : CYAN} strokeWidth={2.4} opacity={0.8} />
          ))}
        </g>;
      })}
      {/* 顶上浮出的脸 */}
      <g opacity={faceOn} transform={`translate(960 300) scale(${0.9 + 0.1 * faceOn}) translate(-960 -300)`}>
        <ellipse cx={960} cy={344} rx={126} ry={146} fill="none" stroke={WHITE} strokeWidth={3} opacity={0.8} />
        <ellipse cx={906} cy={306} rx={25} ry={13} fill="none" stroke={WHITE} strokeWidth={3} opacity={0.8} />
        <ellipse cx={1014} cy={306} rx={25} ry={13} fill="none" stroke={WHITE} strokeWidth={3} opacity={0.8} />
        <path d="M 914 404 Q 960 432 1006 404" fill="none" stroke={WHITE} strokeWidth={3} opacity={0.8} />
      </g>
    </svg>);
  }

  if (i <= 5) {           // 神经元 + 公式
    return box(<svg width={1500} height={620} viewBox="0 0 1500 620">
      {[[300, 190], [300, 320], [300, 450]].map(([x, y], k) => (
        <g key={k} opacity={grow(f, 6 + k * 10, 12)}>
          <circle cx={x} cy={y} r={24 * breathe(f, 48 + k * 5, 0.12)} fill="none" stroke={WHITE} strokeWidth={4} />
          <text x={x - 40} y={y + 10} textAnchor="end" fontFamily={FONT} fontSize={34} fill={WHITE}>x{k + 1}</text>
          <GrowLine x1={x + 28} y1={y} x2={640} y2={320} f={f} d={14 + k * 10} color={CYAN} />
          <FlowBox x1={x + 34} y1={y} x2={628} y2={316} f={f} d={40 + k * 12} color={WHITE} sp={40 + k * 6} />
          <FlowDot x1={x + 28} y1={y} x2={640} y2={320} f={f} d={30 + k * 12} color={CYAN} n={3} sp={44} r={5} />
        </g>))}
      <SpinRing cx={690} cy={320} r={118} f={f} d={60} color={CORAL} w={4} dash={0.18} dots={10} dotR={7} period={58} />
      <SpinRing cx={690} cy={320} r={138} f={f} d={70} color={OLIVE} w={3} dash={0.14} dots={14} dotR={5} period={92} />
      <circle cx={690} cy={320} r={96 * breathe(f, 40, 0.05)} fill={GREY1} stroke={YELLOW} strokeWidth={5} opacity={grow(f, 50, 18)} />
      {/* 圆圈内部：一圈小点绕着中心转（老贾10/18点名要的）*/}
      {Array.from({ length: 12 }).map((_, k) => {
        const a2 = ((spin(f, 46) + (k * 360) / 12) * Math.PI) / 180;
        const rr = 66;
        return <circle key={k} cx={690 + Math.cos(a2) * rr} cy={320 + Math.sin(a2) * rr}
          r={4.5 * (0.6 + 0.6 * Math.sin(f * 0.2 + k))} fill={YELLOW} opacity={grow(f, 60, 16) * 0.95} />;
      })}
      <text x={690} y={308} textAnchor="middle" fontFamily={FONT} fontSize={38} fill={YELLOW} opacity={grow(f, 56, 14)}>神经元</text>
      <text x={690} y={356} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={WHITE} opacity={grow(f, 62, 14)}>w · x + b</text>
      <GrowLine x1={792} y1={320} x2={1080} y2={320} f={f} d={90} color={YELLOW} />
      <FlowDot x1={792} y1={320} x2={1080} y2={320} f={f} d={110} color={YELLOW} n={4} sp={30} r={7} />
      <circle cx={1140} cy={320} r={44 + 26 * Math.abs(Math.sin(f * 0.09))} fill={YELLOW} opacity={grow(f, 110, 16) * 0.9} />
      <text x={1140} y={420} textAnchor="middle" fontFamily={FONT} fontSize={32} fill={WHITE} opacity={grow(f, 120, 14)}>y</text>
    </svg>);
  }
  if (hard && i === 8) {
    /* 硬核版第九幕｜满屏 w 在闪，代码编辑器里一行都没有 —— "没人写代码" */
    const cursor = f % 30 < 15;
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {Array.from({ length: 264 }).map((_, k) => {
        const c = k % 22, r = Math.floor(k / 22);
        const x = 80 + c * 78, y = 150 + r * 62;
        const v = Math.sin(k * 2.7 + f * 0.05) * 0.9;
        return <text key={k} x={x} y={y} fontFamily={FONT} fontSize={15}
          fill={v > 0 ? CYAN : CORAL} opacity={0.14 + 0.16 * Math.abs(Math.sin(f * 0.06 + k))}>
          {v.toFixed(2)}
        </text>;
      })}
      {/* 编辑器 */}
      <rect x={580} y={238} width={760} height={520} rx={10} fill="rgba(6,8,12,0.94)" stroke="rgba(255,255,255,0.22)" strokeWidth={2.5} opacity={grow(f, 24, 24)} />
      <rect x={580} y={238} width={760} height={42} rx={10} fill="rgba(255,255,255,0.06)" opacity={grow(f, 24, 24)} />
      <text x={606} y={268} fontFamily={FONT} fontSize={20} fill={GREY2} opacity={grow(f, 30, 20)}>train.py</text>
      {Array.from({ length: 9 }).map((_, k) => (
        <text key={k} x={612} y={330 + k * 46} fontFamily={FONT} fontSize={18} fill="rgba(255,255,255,0.10)">{k + 1}</text>
      ))}
      {/* 光标：一直闪，但什么都没敲 */}
      <rect x={648} y={310} width={3} height={26} fill={YELLOW} opacity={cursor && grow(f, 40, 20) ? 0.95 : 0.05} />
      <text x={960} y={560} textAnchor="middle" fontFamily={FONT} fontSize={30} fill={WHITE} opacity={grow(f, 90, 26)}>
        代码行数：
        <tspan fill={YELLOW} fontWeight={800}> 0</tspan>
      </text>
      <text x={960} y={616} textAnchor="middle" fontFamily={FONT} fontSize={21} fill={GREY2} opacity={grow(f, 110, 22)}>
        没有人写"猫有两只耳朵"这条规则
      </text>
    </svg>);
  }

  if (hard && i === 9) {
    /* 硬核版第十幕｜全是随机的：一格一格瞎猜，错一大半（红） */
    const t = grow(f, 10, 70);
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {Array.from({ length: 16 * 9 }).map((_, k) => {
        const c = k % 16, r = Math.floor(k / 16);
        const x = 300 + c * 82, y = 206 + r * 82;
        const seed = ((k * 137) % 100) / 100;
        const appear = grow(f, 6 + (k % 12) * 2, 14);
        const wrong = seed < 0.72;
        const flick = 0.55 + 0.45 * Math.sin(f * 0.3 + k * 1.7);
        return <g key={k} opacity={appear}>
          <rect x={x} y={y} width={72} height={72} rx={5}
            fill={wrong ? `rgba(240,96,72,${0.16 + 0.22 * flick})` : `rgba(255,255,255,${0.06 + 0.1 * flick})`}
            stroke={wrong ? CORAL : 'rgba(255,255,255,0.28)'} strokeWidth={2} />
          <text x={x + 36} y={y + 44} textAnchor="middle" fontFamily={FONT} fontSize={22}
            fill={wrong ? CORAL : WHITE} opacity={0.55 + 0.45 * flick}>
            {wrong ? '✗' : '✓'}
          </text>
        </g>;
      })}
      <text x={1600} y={190} textAnchor="end" fontFamily={FONT} fontSize={24} fill={WHITE} opacity={grow(f, 40, 20)}>
        错的占 <tspan fill={CORAL} fontWeight={800}>72%</tspan> —— 一开始就是瞎蒙
      </text>
      
    </svg>);
  }

  if (hard && i === 10) {
    /* 硬核版第十一幕｜2010：一万张图的点阵，28.19% 是红的 */
    const G = 60;
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <text x={960} y={186} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={GREY2} letterSpacing={6} opacity={grow(f, 0, 16)}>一万张图 · 每一张都是一个点</text>
      {Array.from({ length: G * G }).map((_, k) => {
        const c = k % G, r = Math.floor(k / G);
        const x = 960 - (G * 12) / 2 + c * 12, y = 226 + r * 12;
        const wrong = ((k * 7919) % 10000) / 10000 < 0.2819;
        const on = grow(f, 10 + ((k * 13) % 90), 18);
        return <circle key={k} cx={x} cy={y} r={2.6} fill={wrong ? CORAL : 'rgba(255,255,255,0.30)'} opacity={on * (wrong ? 0.95 : 0.55)} />;
      })}
      <text x={960} y={930} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={GREY2} opacity={grow(f, 96, 22)}>
        红色的 = 认错的，一万张里 <tspan fill={CORAL} fontWeight={800}>2819</tspan> 张
      </text>
    </svg>);
  }

  if (i <= 7) {           // 权重塔
    return box(<svg width={1500} height={620} viewBox="0 0 1500 620">
      {[0, 1, 2, 3, 4].map((L) => {
        const w = 900 - L * 132, y = 90 + L * 92;
        const bob = Math.sin(f * 0.055 + L * 0.9) * 7;
        return <g key={L} opacity={grow(f, 8 + L * 26, 20)}
          transform={`translate(0 ${bob.toFixed(1)})`}>
          <rect x={750 - w / 2} y={y} width={w} height={62} fill={L % 2 ? 'transparent' : GREY2} opacity={0.75}
            stroke={L === 4 ? YELLOW : OLIVE} strokeWidth={5} rx={3} />
          {Array.from({ length: 16 }).map((_, k) => {
            const rot = spin(f, 60 + k * 4) + k * 22;
            const C = 2 * Math.PI * 9;
            return <g key={k}>
              <circle cx={750 - w / 2 + 28 + k * ((w - 56) / 15)} cy={y + 31} r={9} fill="none" stroke={YELLOW} strokeWidth={3} opacity={0.95} />
              <circle cx={750 - w / 2 + 28 + k * ((w - 56) / 15)} cy={y + 31} r={9} fill="none" stroke={YELLOW} strokeWidth={3}
                strokeDasharray={`${C * 0.3} ${C}`} strokeDashoffset={-rot}
                style={{ transformOrigin: `${750 - w / 2 + 28 + k * ((w - 56) / 15)}px ${y + 31}px` }} />
            </g>;
          })}
          {L < 4 ? <FlowDot x1={750 - w / 2 + 60} y1={y + 62} x2={750 - w / 2 + 120} y2={y + 74}
            f={f} d={40 + L * 26} color={YELLOW} n={2} sp={38} r={5} /> : null}
        </g>;
      })}
    </svg>);
  }
  if (i <= 9) {           // 找边 → 弧 → 脸
    const stage = i === 8 ? 0 : i === 9 ? 1 : 2;
    return box(<svg width={1500} height={620} viewBox="0 0 1500 620">
      {[[380, 220, 380, 520], [620, 150, 620, 400], [860, 280, 860, 560], [1100, 180, 1100, 430]]
        .map(([x1, y1, x2, y2], k) => <g key={k}>
          <GrowLine x1={x1} y1={y1} x2={x2} y2={y2} f={f} d={6 + k * 10} color={CYAN} w={6} />
          <FlowDot x1={x1} y1={y1} x2={x2} y2={y2} f={f} d={26 + k * 10} color={YELLOW} n={2} sp={32} r={6} />
        </g>)}
      {stage >= 1 && i === 9 ? <>
        <path d="M 480 540 Q 680 340 880 520" fill="none" stroke={YELLOW} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={520} strokeDashoffset={520 * (1 - grow(f, 40, 24))} />
        <path d="M 920 510 Q 1100 350 1260 520" fill="none" stroke={YELLOW} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={460} strokeDashoffset={460 * (1 - grow(f, 60, 24))} />
      </> : null}
      {stage === 2 ? <g opacity={grow(f, 30, 26)} transform={`translate(870 520) scale(${breathe(f, 42, 0.05).toFixed(3)}) translate(-870 -520)`}>
        <ellipse cx={870} cy={520} rx={250} ry={330} fill="none" stroke={CORAL} strokeWidth={7} />
        {Array.from({ length: 30 }).map((_, k) => {
          const a = (k / 30) * Math.PI * 2;
          return <circle key={k} cx={870 + Math.cos(a) * 250} cy={520 + Math.sin(a) * 330} r={5} fill={CORAL} opacity={0.85} />;
        })}
      </g> : null}
    </svg>);
  }
  if (i <= 10) {          // 谁拧的 · 火柴人
    const tug = f > 40 && f < 100 ? Math.sin((f - 40) * 0.24) * 18 : 0;
    return box(<svg width={1500} height={620} viewBox="0 0 1500 620">
      <text x={620} y={430} textAnchor="middle" fontFamily={FONT} fontSize={300 * breathe(f, 64, 0.04)} fill="none"
        stroke={GREY2} strokeWidth={4} opacity={grow(f, 0, 28)}>?</text>
      <g opacity={grow(f, 50, 18)} transform={`translate(1120 470) scale(2.1)`}>
        <circle cx={0} cy={0} r={22} fill={BROWN} />
        <line x1={0} y1={22} x2={0} y2={78} stroke={BROWN} strokeWidth={6} strokeLinecap="round" />
        <line x1={0} y1={40} x2={-40} y2={62} stroke={BROWN} strokeWidth={5} strokeLinecap="round" />
        <line x1={0} y1={40} x2={40 + tug} y2={26} stroke={BROWN} strokeWidth={5} strokeLinecap="round" />
        <line x1={0} y1={78} x2={-30} y2={126} stroke={BROWN} strokeWidth={5} strokeLinecap="round" />
        <line x1={0} y1={78} x2={30} y2={126} stroke={BROWN} strokeWidth={5} strokeLinecap="round" />
        <circle cx={52 + tug} cy={22} r={16} fill="none" stroke={CORAL} strokeWidth={4} />
        <SpinRing cx={52 + tug} cy={22} r={30} f={f} d={90} color={CORAL} w={3} dash={0.25} dots={6} dotR={4} period={40} />
      </g>
    </svg>);
  }
  if (i <= 14) {          // 照片 → 网络 → 识别结果（每个图标都在流动，不许黑灰方块）
    const ICONS = [
      { k: '猫', d: 'M0 -26 L-20 -6 L-26 20 L26 20 L20 -6 Z M-22 -22 L-30 -36 L-14 -30 M22 -22 L30 -36 L14 -30' },
      { k: '狗', d: 'M-24 18 L-24 -12 Q0 -32 24 -12 L24 18 Z M-24 -12 L-36 -24 L-32 -4 M24 -12 L36 -24 L32 -4' },
      { k: '车', d: 'M-40 12 L-30 -12 L22 -12 L36 12 Z M-26 12 L-26 26 M26 12 L26 26 M-46 26 A10 10 0 1 0 -26 26 A10 10 0 1 0 -46 26 M14 26 A10 10 0 1 0 34 26 A10 10 0 1 0 14 26' },
      { k: '树', d: 'M0 -34 L-24 4 L24 4 Z M-4 4 L-4 26 M4 4 L4 26 M-16 26 L16 26' },
      { k: '房', d: 'M-26 4 L0 -24 L26 4 Z M-18 6 L-18 28 L18 28 L18 6' },
      { k: '船', d: 'M-32 6 L32 6 L22 24 L-22 24 Z M0 6 L0 -20 L22 -12 L0 -4' },
    ];
    const laneY = [190, 280, 370];
    // 46 秒不许一个镜头硬撑：11 看图标 / 12 推到网络 / 13 看结果 / 14 全暗
    const cam = i === 11 ? 1.14 : i === 12 ? 1.30 : i === 13 ? 1.20 : 1.06;
    const cx = i === 11 ? 545 : i === 12 ? 1085 : i === 13 ? 1490 : 950;
    const camT = `translate(850 380) scale(${cam}) translate(${-cx} -380)`;
    return box(<svg width={1700} height={760} viewBox="0 0 1700 760">
      <g transform={camT}>
      {/* 左侧：图标流水，每个图标带类别标签，边走边转 */}
      {Array.from({ length: 9 }).map((_, k) => {
        const ic = ICONS[k % ICONS.length];
        const lane = k % 3;
        const t = (((f * 3.6 + k * 190) % 1180) - 130) / 1180;
        const x = 90 + t * 700;
        const y = laneY[lane] + Math.sin(f * 0.07 + k) * 8;
        const sc = 0.72 + 0.1 * Math.sin(f * 0.05 + k * 1.3);
        const op = (t < 0.02 || t > 0.98 ? 0 : 1) * (i >= 12 ? 0.22 : 1);
        return <g key={k} opacity={op} transform={`translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${sc.toFixed(3)})`}>
          <path d={ic.d} fill="none" stroke={WHITE} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          <text x={0} y={44} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={WHITE} opacity={0.8}>{ic.k}</text>
        </g>;
      })}
      {/* 图标 → 网络的流线 */}
      {laneY.map((y, k) => <FlowDot key={k} x1={790} y1={y} x2={905} y2={330} f={f} d={20 + k * 12}
        color={CYAN} n={2} sp={30} r={6} />)}
      {/* 中间：真正的神经网络（4 层，脉冲从左一直流到右，永不停） */}
      <g opacity={grow(f, 20, 22)}>
        {(() => {
          const counts = [6, 5, 4, 3];
          const xs = [930, 1035, 1140, 1245];
          const layers = counts.map((n) => Array.from({ length: n }).map((_, k) => 340 + (k - (n - 1) / 2) * 44));
          return <>
            {layers.slice(0, 3).map((cur, L) => cur.map((y1, i2) => layers[L + 1].map((y2, j) => (
              <line key={`e${L}-${i2}-${j}`} x1={xs[L]} y1={y1} x2={xs[L + 1]} y2={y2}
                stroke="rgba(255,255,255,0.14)" strokeWidth={1.2} />
            ))))}
            {layers.slice(0, 3).map((cur, L) => cur.map((y1, i2) => layers[L + 1].map((y2, j) => {
              const raw = ((f - 40) * 0.020 + (i2 * 0.17 + j * 0.29 + L * 0.11)) % 1;
              const tt = raw < 0 ? raw + 1 : raw;
              return <circle key={`p${L}-${i2}-${j}`} cx={xs[L] + (xs[L + 1] - xs[L]) * tt}
                cy={y1 + (y2 - y1) * tt} r={2.6} fill={YELLOW} opacity={0.12 + 0.75 * Math.sin(tt * Math.PI)} />;
            })))}
            {layers.map((cur, L) => cur.map((y, i2) => (
              <g key={`n${L}-${i2}`}>
                {L === 3 ? <circle cx={xs[L]} cy={y} r={26 + 7 * Math.sin(f * 0.14 + i2)} fill="none" stroke="rgba(240,224,0,.35)" strokeWidth={1.6} /> : null}
                <circle cx={xs[L]} cy={y} r={(L === 3 ? 15 : 12) * breathe(f, 46 + i2 * 3, 0.10)}
                  fill="rgba(10,10,10,0.96)" stroke={L === 3 ? YELLOW : CYAN} strokeWidth={L === 3 ? 3.6 : 2.6} />
              </g>
            )))}
          </>;
        })()}
      </g>
      {/* 网络 → 识别结果 */}
      <FlowDot x1={1268} y1={340} x2={1420} y2={340} f={f} d={40} color={YELLOW} n={3} sp={26} r={7} />
      <g opacity={grow(f, 60, 22)}>
        <text x={1600} y={186} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={GREY2}>识别结果</text>
        {[['猫', '94%', 0.94, YELLOW], ['狗', '3%', 0.03, CYAN], ['车', '2%', 0.02, CYAN]].map(([kk, vv, rr, cc], q) => {
          const w = Math.max(4, (rr as number) * 210);
          return <g key={q}>
            <text x={1420} y={248 + q * 62} fontFamily={FONT} fontSize={28} fill={WHITE}>{kk}</text>
            <rect x={1470} y={226 + q * 62} width={210} height={22} fill={GREY1} rx={3} />
            <rect x={1470} y={226 + q * 62} width={w} height={22} fill={cc as string} rx={3}
              opacity={0.6 + 0.4 * Math.sin(f * 0.09 + q)} />
            <text x={1700} y={248 + q * 62} textAnchor="end" fontFamily={FONT} fontSize={26} fill={cc as string}>{vv as string}</text>
          </g>;
        })}
      </g>
      {/* i=14：所有东西都认得对，但没人说得清为什么 */}
      {i === 14 ? <g opacity={grow(f, 6, 26)}>
        <rect x={0} y={0} width={1700} height={760} fill="rgba(0,0,0,0.62)" />
        <circle cx={1085} cy={330} r={92} fill="none" stroke={YELLOW} strokeWidth={3} strokeDasharray="10 10" />
        <text x={1085} y={372} textAnchor="middle" fontFamily={FONT} fontSize={120} fontWeight={800} fill={YELLOW}>?</text>
        <text x={850} y={560} textAnchor="middle" fontFamily={FONT} fontSize={30} fill={WHITE}>它认对了，但没人写得出这条规则</text>
      </g> : null}
      </g>
    </svg>);
  }

  if (hard && i === 15) {
    /* 硬核版第十二幕｜误差曲面：一个球在坡上被一次次往下推（试错，不是设计） */
    const drop = 1 - Math.pow(1 - grow(f, 20, 150), 2);
    const bx = 620 + drop * 560;
    const by = 300 + drop * drop * 330;
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {/* 等高线 */}
      {Array.from({ length: 7 }).map((_, k) => (
        <ellipse key={k} cx={1180 - k * 22} cy={640 - k * 12} rx={520 - k * 62} ry={300 - k * 36}
          fill="none" stroke={k === 0 ? 'rgba(255,210,74,0.35)' : 'rgba(255,255,255,0.10)'} strokeWidth={k === 0 ? 2.4 : 1.6} />
      ))}
      <text x={1180} y={736} textAnchor="middle" fontFamily={FONT} fontSize={18} fill="rgba(255,210,74,0.7)">最低点 · 错得最少</text>
      {/* 走过的轨迹 */}
      <path d={`M 620 300 Q 900 330 ${bx} ${by}`} fill="none" stroke={YELLOW} strokeWidth={3} strokeDasharray="7 7" opacity={0.5} />
      {/* 球 */}
      <circle cx={bx} cy={by} r={20 + 3 * Math.sin(f * 0.2)} fill={YELLOW} opacity={0.95} />
      <circle cx={bx} cy={by} r={36} fill="none" stroke={YELLOW} strokeWidth={2} opacity={0.3} />
      <text x={bx + 46} y={by + 8} fontFamily={FONT} fontSize={20} fill={YELLOW}>w</text>
      {/* 损失读数 */}
      <text x={176} y={262} fontFamily={FONT} fontSize={22} fill={GREY2}>错误率</text>
      <text x={176} y={318} fontFamily={FONT} fontSize={54} fontWeight={800} fill={WHITE} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {(28.19 - 24.6 * drop).toFixed(2)}%
      </text>
      <text x={176} y={368} fontFamily={FONT} fontSize={18} fill={GREY2} opacity={grow(f, 120, 20)}>没人告诉它方向，它只是往低处走</text>
    </svg>);
  }

  if (hard && i === 16) {
    /* 硬核版第十三幕｜高维空间里的一堆点：它不认识"猫"，只是一个坐标 */
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <text x={960} y={190} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={GREY2} letterSpacing={6} opacity={grow(f, 0, 16)}>它眼里的世界 · 每个东西都是一个坐标</text>
      {Array.from({ length: 220 }).map((_, k) => {
        const a = (k * 2.399963) % (Math.PI * 2);
        const rr = 60 + ((k * 71) % 330);
        const x = 900 + Math.cos(a) * rr * 1.25, y = 560 + Math.sin(a) * rr * 0.68;
        const on = grow(f, 6 + (k % 50) * 2, 16);
        return <circle key={k} cx={x} cy={y} r={3.6} fill={k % 17 === 0 ? YELLOW : 'rgba(255,255,255,0.35)'} opacity={on} />;
      })}
      {/* 指向"猫"的那个点 */}
      <g opacity={grow(f, 90, 26)}>
        <line x1={400} y1={560} x2={1180} y2={420} stroke={YELLOW} strokeWidth={4} />
        <path d="M 1180 420 l -18 -4 l 6 16 Z" fill={YELLOW} />
        <circle cx={1180} cy={420} r={13} fill={YELLOW} />
        <text x={1210} y={414} fontFamily={FONT} fontSize={26} fill={YELLOW}>"猫"</text>
        <text x={1210} y={450} fontFamily={FONT} fontSize={18} fill={GREY2}>只是一个坐标，不是"猫"</text>
        <text x={380} y={596} textAnchor="end" fontFamily={FONT} fontSize={20} fill={GREY2}>几百万个权重 = 几百万个维度</text>
      </g>
    </svg>);
  }

  if (hard && i === 18) {
    /* 硬核版第十四幕｜3.57%：一万个点里，错 357 个 */
    const on = grow(f, 6, 30);
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {Array.from({ length: 357 }).map((_, k) => {
        const a = (k / 357) * Math.PI * 2 * 3;
        const rr = 210 + Math.sqrt(k) * 22;
        const x = 960 + Math.cos(a) * rr * 1.5, y = 520 + Math.sin(a) * rr * 0.82;
        return <circle key={k} cx={x} cy={y} r={3.2} fill={CORAL}
          opacity={on * (0.25 + 0.65 * Math.abs(Math.sin(f * 0.05 + k * 0.3)))} />;
      })}
      <text x={960} y={520} textAnchor="middle" fontFamily={FONT} fontSize={200} fontWeight={900} fill={YELLOW}
        style={{ fontVariantNumeric: 'tabular-nums' }} opacity={grow(f, 10, 24)}>3.57%</text>
      <text x={960} y={600} textAnchor="middle" fontFamily={FONT} fontSize={24} fill={GREY2} opacity={grow(f, 40, 20)}>
        一万张图里，错 357 张
      </text>
    </svg>);
  }

  if (hard && i === 19) {
    /* 硬核版第十五幕｜反向传播预告：红色误差从右往左倒流，收在 1986 */
    const rev = grow(f, 10, 40);
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {[0, 1, 2].map((L) => {
        const w = 760 - L * 150, y = 250 + L * 150;
        return <g key={L} opacity={grow(f, L * 14, 20)}>
          <rect x={960 - w / 2} y={y} width={w} height={100} rx={8} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.18)" strokeWidth={2.5} />
          {Array.from({ length: 10 }).map((_, k) => (
            <circle key={k} cx={960 - w / 2 + 40 + k * ((w - 80) / 9)} cy={y + 50} r={8} fill="none" stroke={CYAN} strokeWidth={2.4} opacity={0.7} />
          ))}
        </g>;
      })}
      {/* 红色误差倒着流：从下往上、从右往左 */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => {
        const t = ((f * 0.020 + k / 8) % 1);
        const y = 700 - t * 420;
        return <circle key={k} cx={1340 - t * 420} cy={y} r={7} fill={CORAL}
          opacity={rev * (0.2 + 0.7 * Math.sin(t * Math.PI))} />;
      })}
      <text x={960} y={800} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={CORAL} opacity={grow(f, 60, 20)}>
        误差往回走：谁的责任大，谁的旋钮改得多
      </text>
      {/* 画面字与字幕重复，且会被底部字幕框压住，删掉（老贾 10/20 字幕改版） */}
    </svg>);
  }

  if (hard && i === 17) {
    /* 硬核版第十六幕｜它不认识"世界"：满屏坐标轴，没有一样东西带名字 */
    const on = grow(f, 8, 40);
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {Array.from({ length: 9 }).map((_, k) => (
        <g key={k} opacity={on * 0.5}>
          <line x1={0} y1={300 + k * 70} x2={1920} y2={300 + k * 70} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
        </g>
      ))}
      {/* 坐标轴 */}
      {[0, 1, 2].map((k) => {
        const a = (k * 2 * Math.PI) / 3 - Math.PI / 2;
        return <line key={k} x1={960} y1={560} x2={960 + Math.cos(a) * 420} y2={560 + Math.sin(a) * 420}
          stroke="rgba(255,255,255,0.28)" strokeWidth={2.4} opacity={on} />;
      })}
      {/* 一堆点，全部无名 */}
      {Array.from({ length: 160 }).map((_, k) => {
        const a = (k * 2.399963);
        const rr = 40 + ((k * 53) % 340);
        const x = 960 + Math.cos(a) * rr, y = 560 + Math.sin(a) * rr * 0.62;
        return <circle key={k} cx={x} cy={y} r={3.4} fill={WHITE} opacity={on * 0.42} />;
      })}
      <text x={960} y={560} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={800} fill={YELLOW} opacity={grow(f, 60, 26)}>
        全是数字
      </text>
      <text x={960} y={960} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={GREY2} opacity={grow(f, 80, 24)}>
        它不知道什么是"世界"，它只知道"这个坐标像刚才那个坐标"
      </text>
    </svg>);
  }

  if (i <= 17) {          // 塔里看不清
    return box(<svg width={1500} height={620} viewBox="0 0 1500 620">
      {[0, 1, 2, 3].map((L) => {
        const w = 1000 - L * 180, y = 90 + L * 120;
        const bob = Math.sin(f * 0.05 + L * 1.3) * 8;
        return <g key={L} opacity={grow(f, L * 14, 20)} transform={`translate(0 ${bob.toFixed(1)})`}>
          <rect x={750 - w / 2} y={y} width={w} height={82} fill={L % 2 ? 'transparent' : GREY1}
            stroke={OLIVE} strokeWidth={4} rx={3} />
          {Array.from({ length: 26 }).map((_, k) => (
            <circle key={k} cx={750 - w / 2 + 26 + k * ((w - 52) / 25)} cy={y + 41} r={8}
              fill="none" stroke={k % 5 === 0 ? YELLOW : CYAN} strokeWidth={2.5} />))}
        </g>;
      })}
      {f > 60 ? <g opacity={grow(f, 60, 46)}>
        {Array.from({ length: 170 }).map((_, k) => {
          const x = 180 + ((k * 173) % 1140), y = 90 + ((k * 271) % 440);
          return <circle key={k} cx={x} cy={y} r={3 + (k % 5)} fill={k % 6 === 0 ? CORAL : WHITE}
            opacity={0.4 + 0.45 * Math.abs(Math.sin(f * 0.06 + k))} />;
        })}
      </g> : null}
    </svg>);
  }
  // 收尾：几百万个旋钮在慢慢转，靠画面收，不再堆字
  if (i >= 18) {
    return box(<svg width={1920} height={1080} viewBox="0 0 1920 1080">
      {Array.from({ length: 260 }).map((_, k) => {
        const x = 60 + ((k * 137.5) % 1800);
        const y = 90 + ((k * 271.3) % 880);
        const r = 5 + (k % 4) * 2.2;
        const rot = spin(f, 120 + (k % 9) * 14) + k * 31;
        const C = 2 * Math.PI * r;
        const op = (0.22 + 0.5 * Math.abs(Math.sin(f * 0.03 + k * 0.7))) * grow(f, (k % 40) * 2, 30);
        return <g key={k} opacity={op} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
          <circle r={r} fill="none" stroke={k % 6 === 0 ? YELLOW : GREY2} strokeWidth={2.2} />
          <circle r={r} fill="none" stroke={k % 6 === 0 ? YELLOW : CYAN} strokeWidth={2.2}
            strokeDasharray={`${(C * 0.3).toFixed(1)} ${C.toFixed(1)}`} strokeDashoffset={-rot} />
        </g>;
      })}
      <circle cx={960} cy={500} r={230 + 40 * Math.sin(f * 0.05)} fill="none" stroke="rgba(240,224,0,0.10)" strokeWidth={2} />
      <circle cx={960} cy={500} r={330 + 50 * Math.sin(f * 0.05 + 1)} fill="none" stroke="rgba(24,144,192,0.10)" strokeWidth={2} />
    </svg>);
  }
  return <AbsoluteFill />;
};

// ============ 金黄色文案框（老贾10/18指定：金黄色文案 + 框框）============
const CaptionBox: React.FC = () => {
  const f = useCurrentFrame();
  let idx = SCRIPT.length - 1;
  for (let i = 0; i < SCRIPT.length; i++) { if (f < F[i + 1]) { idx = i; break; } }
  const local = f - F[idx];
  const op = fadeIn(f, F[idx], 10) * fadeOut(f, F[idx + 1], 10);
  const t = local / 30;
  const lines = SCRIPT[idx].cn.split('\n');
  const fontSize = lines.some((l) => l.length > 22) ? 33 : 37;
  const times = CHARS[idx] ?? [];
  const totalChars = Math.max(1, times.length);
  // 已读字符进度：英文副标题跟中文同一进度点亮
  let shown = 0;
  for (let k = 0; k < times.length; k++) if (t >= times[k]) shown++;
  const p = shown / totalChars;
  let gi = 0;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center',
      opacity: op,
    }}>
      <div style={{
        maxWidth: 1180, padding: '16px 34px 12px',
        background: 'rgba(12,12,12,0.78)', border: '1px solid rgba(240,224,0,0.30)',
        borderRadius: 6, boxShadow: '0 0 30px rgba(0,0,0,0.8)',
      }}>
        <div style={{ fontFamily: FONT, fontSize, fontWeight: 700, color: YELLOW, lineHeight: 1.5, textAlign: 'center' }}>
          {lines.map((ln, li) => (
            <div key={li}>
              {ln.split('').map((ch, ci) => {
                const on = t >= (times[gi] ?? 0);
                gi++;
                return <span key={ci} style={{ opacity: on ? 1 : 0 }}>{ch}</span>;
              })}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 17, color: GREY2, textAlign: 'center', marginTop: 7 }}>
          {SCRIPT[idx].en.split('').map((ch, ci, arr) => (
            <span key={ci} style={{ opacity: ci / arr.length < p ? 1 : 0 }}>{ch}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ 主组件 ============
export const NN1: React.FC<{ hard?: boolean }> = ({ hard }) => {
  const f = useCurrentFrame();
  let idx = SCRIPT.length - 1;
  for (let i = 0; i < SCRIPT.length; i++) { if (f < F[i + 1]) { idx = i; break; } }

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <svg width={1920} height={1080} style={{ position: 'absolute' }} opacity={0.45}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line key={'h' + i} x1={0} y1={i * 154} x2={1920} y2={i * 154} stroke={GREY1} strokeWidth={1} />))}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={'v' + i} x1={i * 320} y1={0} x2={i * 320} y2={1080} stroke={GREY1} strokeWidth={1} />))}
      </svg>

      <ErrBar />
      <BG i={idx} hard={hard} />
      <CaptionBox />

      {/* 老贾 IP：前 17 幕单只站左下；第 18 幕起一左一右，给结尾"关注我"垫场 */}
      <LaoJia
        mode={idx % 4 === 0 ? 'mic' : idx % 4 === 1 ? 'point' : idx % 4 === 2 ? 'gasp' : 'cheer'}
        side="left"
        delay={0}
        forceTalk
        scale={idx >= 18 ? 1.18 : 1.28}
        left={30}
        bottom={0}
      />
      {idx >= 18 && (
        <LaoJia
          mode={idx === 19 ? 'cheer' : 'gasp'}
          side="right"
          delay={9}
          forceTalk
          scale={1.18}
          left={30}
          bottom={0}
        />
      )}

      {/* 结尾关注卡：最后 2.6 秒从顶部浮出 */}
      {idx === 19 && f >= TOTAL_FRAMES - 78 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 168,
          textAlign: 'center', opacity: fadeIn(f, TOTAL_FRAMES - 78, 14),
          transform: `translateY(${(1 - fadeIn(f, TOTAL_FRAMES - 78, 14)) * 24}px)`,
          fontFamily: FONT, fontSize: 52, fontWeight: 900, color: YELLOW,
          textShadow: '0 0 28px rgba(240,224,0,0.55), 0 4px 18px rgba(0,0,0,0.9)',
          letterSpacing: 2,
        }}>
          关注我 · 火柴人老贾
        </div>
      )}

      {/* 配音：响度已归一（-16 LUFS / 峰值 -1.5dB），时长与原音频一致 */}
      {DUR.map((_, i) => (
        <Sequence key={i} from={F[i]} premountFor={20}>
          <Audio src={staticFile(`audio_norm/e${String(i).padStart(2, '0')}.wav`)} />
        </Sequence>
      ))}

      {/* BGM：Midnight Rush 无缝循环版（首尾交叉淡化，29 个采样点内无爆音） */}
      <Audio src={staticFile('bgm_midnight_loop.m4a')} volume={0.10} loop />
    </AbsoluteFill>
  );
};