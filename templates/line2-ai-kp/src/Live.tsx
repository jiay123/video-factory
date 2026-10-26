import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

const GOLD = '#F5C518';
const RED = '#E5484D';
const WHITE = '#FFFFFF';
const BG = '#000000';

/** 活体演示：同一张猫脸，但每一秒都在动 */
export const Live: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const EASE_IN_OUT = Easing.inOut(Easing.cubic);

  // ---- 呼吸：身体 1.15 秒一个起伏 ----
  const breathe = 1 + Math.sin(t * 5.4) * 0.018;

  // ---- 眨眼：每 2.4 秒眨一次，闭合 0.12 秒 ----
  const cyc = (t % 2.4) / 2.4;
  const eyeH = cyc < 0.05
    ? interpolate(cyc, [0, 0.025, 0.05], [46, 3, 46], { easing: Easing.inOut(Easing.quad) })
    : 46;

  // ---- 瞳孔跟随一个来回扫视的光点 ----
  const lookX = Math.sin(t * 1.1) * 320;
  const lookY = Math.sin(t * 0.73 + 1) * 90;
  const px = lookX * 0.075;
  const py = lookY * 0.055;

  // ---- 耳朵随呼吸微摆 ----
  const earL = -3 + Math.sin(t * 2.2) * 3.5;
  const earR = 3 + Math.sin(t * 2.2 + 0.6) * 3.5;

  // ---- 胡须抖动 ----
  const whis = Math.sin(t * 6.1) * 2.2;

  // ---- 背景粒子：一直在飘 ----
  const particles = Array.from({ length: 90 }).map((_, i) => {
    const seed = (i * 2654435761) % 1000 / 1000;
    const sp = 0.25 + seed * 0.9;
    const y = ((seed * 1920 + t * 40 * sp) % 1980) - 30;
    const x = ((seed * 1080 + Math.sin(t * 0.6 + seed * 9) * 60) % 1080);
    const r = 1.5 + seed * 3.4;
    const op = 0.15 + seed * 0.4;
    return (
      <div key={i} style={{
        position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: '50%',
        background: i % 7 === 0 ? GOLD : WHITE, opacity: op,
        boxShadow: i % 7 === 0 ? `0 0 12px ${GOLD}` : 'none',
      }} />
    );
  });

  // ---- 扫描线：上下循环扫 ----
  const scanY = ((t * 420) % 2100) - 90;

  // ---- 网格从右往左压过来（后 4 秒） ----
  const cut = interpolate(t, [8, 11], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT });
  const cells = Array.from({ length: 196 }).map((_, i) => {
    const col = i % 14, row = Math.floor(i / 14);
    const cx = 140 + col * 62, cy = 500 + row * 62;
    const dc = col / 13;
    const on = cut > dc * 0.85;
    if (on) {
      const k = Math.min(1, (cut - dc * 0.85) * 6);
      return (
        <div key={i} style={{
          position: 'absolute', left: cx, top: cy, width: 58, height: 58,
          border: `2px solid ${GOLD}`, background: (i * 7) % 11 === 0 ? GOLD : 'transparent',
          opacity: k, transform: `scale(${0.55 + k * 0.45})`,
        }} />
      );
    }
    // 未被切到的部分画成网格外框
    return (
      <div key={i} style={{
        position: 'absolute', left: cx, top: cy, width: 58, height: 58,
        border: '1px solid #1e1e1e', opacity: 0.85,
      }} />
    );
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>
      {particles}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: scanY, height: 3,
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        opacity: 0.35, boxShadow: `0 0 50px ${GOLD}`,
      }} />

      <svg
        width="1080" height="980"
        style={{
          position: 'absolute', left: 0, top: 300,
          transform: `scale(${breathe})`, transformOrigin: '540px 500px',
          opacity: 1 - cut * 0.25,
        }}
        viewBox="0 0 1080 980"
      >
        {/* 耳朵 */}
        <g style={{ transform: `rotate(${earL}deg)`, transformOrigin: '250px 250px' }}>
          <path d="M170 320 L240 90 L420 260 Z" fill="none" stroke={WHITE} strokeWidth="14" strokeLinejoin="round" />
        </g>
        <g style={{ transform: `rotate(${earR}deg)`, transformOrigin: '830px 250px' }}>
          <path d="M910 320 L840 90 L660 260 Z" fill="none" stroke={WHITE} strokeWidth="14" strokeLinejoin="round" />
        </g>
        {/* 脸 */}
        <ellipse cx="540" cy="480" rx="345" ry="275" fill="none" stroke={WHITE} strokeWidth="14" />
        {/* 鼻子 */}
        <path d="M508 592 L572 592 L540 624 Z" fill={RED} />
        {/* 嘴 */}
        <path d="M540 624 L540 646" stroke={WHITE} strokeWidth="11" fill="none" />
        <path d={`M540 646 Q${540 + whis} 690 ${540 - 70 + whis} 652`} stroke={WHITE} strokeWidth="11" fill="none" />
        <path d={`M540 646 Q${540 + 70 + whis} 690 ${540 + 140 + whis} 648`} stroke={WHITE} strokeWidth="11" fill="none" />
        {/* 胡须 */}
        <line x1="230" y1="600" x2="90" y2="576" stroke={WHITE} strokeWidth="6" opacity="0.8" />
        <line x1="230" y1="640" x2="86" y2="656" stroke={WHITE} strokeWidth="6" opacity="0.8" />
        <line x1="850" y1="600" x2="990" y2="576" stroke={WHITE} strokeWidth="6" opacity="0.8" />
        <line x1="850" y1="640" x2="994" y2="656" stroke={WHITE} strokeWidth="6" opacity="0.8" />
        {/* 金色眼睛（会眨） */}
        <g>
          <ellipse cx={430 + px} cy={440 + py} rx="58" ry={eyeH / 2} fill={GOLD} opacity="0.95" />
          <ellipse cx={650 + px} cy={440 + py} rx="58" ry={eyeH / 2} fill={GOLD} opacity="0.95" />
          {eyeH > 20 && (
            <>
              <ellipse cx={430 + px} cy={442 + py} rx="18" ry="30" fill={BG} />
              <ellipse cx={650 + px} cy={442 + py} rx="18" ry="30" fill={BG} />
            </>
          )}
        </g>
      </svg>

      {cells}

      {/* 字幕跟着呼吸微微浮动，不呆着 */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1560, textAlign: 'center',
        transform: `translateY(${Math.sin(t * 2.6) * 7}px)`,
      }}>
        <div style={{
          fontFamily: '"Microsoft YaHei",sans-serif', fontWeight: 900, fontSize: 104,
          color: WHITE, letterSpacing: 5,
        }}>
          你说AI能看懂猫
        </div>
        <div style={{
          fontFamily: 'Impact,"Arial Black",sans-serif', fontWeight: 700, fontSize: 40,
          color: GOLD, opacity: 0.75, marginTop: 22, letterSpacing: 5,
        }}>
          BUT WHAT IS IT ACTUALLY SEEING?
        </div>
      </div>
    </AbsoluteFill>
  );
};