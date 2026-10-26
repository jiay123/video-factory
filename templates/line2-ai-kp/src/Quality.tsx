import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

const GOLD = '#F5C518';
const RED = '#E5484D';
const WHITE = '#FFFFFF';
const BG = '#050505';
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * 质感版 demo —— 全部手法来自 T.O.M《复利》(D:\视频探索\对标拆解\T.O.M_第4集复利)
 * 1) 黑底不是纯黑：几百颗发光粒子在飘，带景深
 * 2) 主体有体积光/呼吸/自转
 * 3) 爆点用粒子炸开，不硬切
 * 4) 一切数字与主体带外发光
 */
export const Quality: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const W = 1080, H = 1920;

  // ---------- 1. 星空粒子（景深三层） ----------
  const star = (i: number) => {
    const s = (i * 2654435761 % 100000) / 100000;
    const depth = s < 0.55 ? 0 : s < 0.85 ? 1 : 2;
    const sp = [0.12, 0.34, 0.72][depth];
    const y = ((s * 2400 + t * 30 * sp) % (H + 80)) - 40;
    const x = (s * W + Math.sin(t * (0.25 + s * 0.5) + s * 11) * (18 + depth * 26) + W) % W;
    const r = [1.2, 2.1, 3.4][depth] + s * 1.6;
    const op = [0.16, 0.34, 0.62][depth];
    const gold = i % 9 === 0;
    return (
      <div key={i} style={{
        position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%',
        background: gold ? GOLD : WHITE, opacity: op * (0.6 + 0.4 * Math.sin(t * 1.6 + s * 20)),
        boxShadow: `0 0 ${gold ? 16 : 7}px ${gold ? GOLD : '#9fb6c8'}`,
      }} />
    );
  };

  // ---------- 2. 主体：点阵球（呼吸 + 自转） ----------
  const COLS = 30, ROWS = 22;
  const breathe = 1 + Math.sin(t * 2.0) * 0.035;
  const spin = t * 0.35;

  // 切割进度
  const cut = interpolate(t, [4.2, 5.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  // 收拢成数字
  const gather = interpolate(t, [8.0, 9.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });

  const cx = W / 2, cy = 880;

  const cells = Array.from({ length: COLS * ROWS }).map((_, i) => {
    const col = i % COLS, row = Math.floor(i / COLS);
    // 球面：按网格位置算一个伪球面高度
    const u = (col / (COLS - 1)) * 2 - 1;
    const v = (row / (ROWS - 1)) * 2 - 1;
    const z = Math.sqrt(Math.max(0, 1 - u * u * 0.92 - v * v * 0.92));
    const base = 430 * (0.42 + z * 0.58);
    const wobble = Math.sin(t * 2.6 + col * 0.5 + row * 0.35) * 9 * z;
    const gx = (col - (COLS - 1) / 2) * (34 * (0.45 + z * 0.55));
    const gy = (row - (ROWS - 1) / 2) * (34 * (0.45 + z * 0.55));

    // 旋转：水平方向按 sin 偏移模拟自转
    const rot = Math.sin(spin + v * 1.1) * 46;
    const x0 = cx + gx + rot;
    const y0 = cy + gy + wobble;

    // 被切开后飞散
    const scatterK = cut * (0.35 + ((i * 37) % 100) / 100 * 1.25);
    const sx = x0 + Math.cos(i * 1.7) * scatterK * 190;
    const sy = y0 + Math.sin(i * 2.3) * scatterK * 190;

    // 收拢：向中心数字位置聚
    const gx2 = cx + Math.cos(i * 0.9) * gather * 260;
    const gy2 = cy + Math.sin(i * 1.4) * gather * 260;

    const x = sx + (gx2 - sx) * gather;
    const y = sy + (gy2 - sy) * gather;
    const sz = 8 + z * 12;

    return (
      <div key={i} style={{
        position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: 2,
        background: z > 0.72 ? GOLD : (z > 0.42 ? '#8a6a10' : '#2a2a2a'),
        opacity: z > 0.3 ? 0.95 : 0.4,
        boxShadow: z > 0.72 ? `0 0 16px ${GOLD}` : 'none',
      }} />
    );
  });

  // ---------- 3. 爆点：金色粒子炸开 ----------
  const burst = Array.from({ length: 60 }).map((_, i) => {
    const a = (i / 60) * Math.PI * 2;
    const k = interpolate(t, [4.0, 4.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
    const d = k * (180 + (i % 7) * 60);
    const fade = interpolate(t, [4.6, 6.0], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
      <div key={i} style={{
        position: 'absolute', left: cx + Math.cos(a) * d, top: cy + Math.sin(a) * d * 0.85,
        width: 5, height: 5, borderRadius: '50%', background: GOLD,
        boxShadow: `0 0 14px ${GOLD}`, opacity: fade * 0.9,
      }} />
    );
  });

  // ---------- 4. 切割金线扫过 ----------
  const lineX = interpolate(t, [3.8, 5.2], [-100, W + 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });

  const numIn = interpolate(t, [9.6, 10.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* 星空 */}
      {Array.from({ length: 210 }).map((_, i) => star(i))}
      {/* 中心体积光 */}
      <div style={{
        position: 'absolute', left: cx - 460, top: cy - 460, width: 920, height: 920, borderRadius: '50%',
        background: `radial-gradient(circle, ${GOLD}22 0%, transparent 62%)`,
        opacity: 0.55 + Math.sin(t * 1.7) * 0.14,
      }} />

      {/* 切割线 */}
      {t >= 3.6 && t < 5.4 && (
        <div style={{
          position: 'absolute', left: lineX, top: 260, width: 4, height: 1240,
          background: `linear-gradient(180deg, transparent, ${GOLD}, transparent)`,
          boxShadow: `0 0 60px ${GOLD}`,
          opacity: interpolate(t, [5.2, 5.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }} />
      )}

      {cells}
      {burst}

      {/* 收拢后的数字 */}
      {t >= 9.4 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: cy - 150, textAlign: 'center',
          transform: `scale(${interpolate(numIn, [0, 1], [0.6, 1], { easing: EASE })})`,
          opacity: numIn,
        }}>
          <div style={{
            fontFamily: 'Impact,"Arial Black",sans-serif', fontSize: 190, fontWeight: 700,
            color: GOLD, lineHeight: 1, letterSpacing: 6,
            textShadow: `0 0 60px ${GOLD}, 0 0 130px ${GOLD}88`,
          }}>150,528</div>
          <div style={{
            fontFamily: '"Microsoft YaHei",sans-serif', fontWeight: 900, fontSize: 76,
            color: WHITE, marginTop: 26, letterSpacing: 6,
          }}>一张图，AI 收到的是这么多数</div>
        </div>
      )}

      {/* 底部字幕（呼吸浮动） */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1560, textAlign: 'center',
        transform: `translateY(${Math.sin(t * 2.4) * 9}px)`,
      }}>
        <div style={{
          fontFamily: '"Microsoft YaHei",sans-serif', fontWeight: 900, fontSize: 96,
          color: WHITE, letterSpacing: 5, opacity: 0.96,
          textShadow: '0 0 40px rgba(0,0,0,0.9)',
        }}>你以为它在看图</div>
        <div style={{
          fontFamily: 'Impact,"Arial Black",sans-serif', fontSize: 38, color: GOLD,
          opacity: 0.8, marginTop: 22, letterSpacing: 5,
        }}>IT IS NOT LOOKING. IT IS COUNTING.</div>
      </div>
    </AbsoluteFill>
  );
};