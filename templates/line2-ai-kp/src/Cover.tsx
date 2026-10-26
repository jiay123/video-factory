import React from 'react';
import { AbsoluteFill } from 'remotion';

const GOLD = '#FFD24A';
const WHITE = '#F2F5FA';
const GREY = 'rgba(200,210,225,0.62)';
const FONT = '"Source Han Sans SC","Noto Sans SC","Microsoft YaHei",sans-serif';

const stars = Array.from({ length: 190 }).map((_, i) => ({
  x: (i * 137.508) % 1080,
  y: (i * 91.73) % 1080,
  r: 0.9 + ((i * 7) % 10) / 5.5,
  o: 0.14 + ((i * 13) % 10) / 13,
}));

export const Cover: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#04060C', fontFamily: FONT }}>
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 34%, rgba(46,92,200,0.30), transparent 60%)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 76%, rgba(255,210,74,0.13), transparent 55%)' }} />
      {stars.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: s.x, top: s.y, width: s.r * 2, height: s.r * 2, borderRadius: '50%', background: i % 7 ? '#fff' : GOLD, opacity: s.o }} />
      ))}

      <div style={{ position: 'absolute', top: 52, left: 56, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 34, fontWeight: 900, color: GOLD, letterSpacing: 4 }}>重复</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: GREY, letterSpacing: 6 }}>REPETITION</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,210,74,0.55)', letterSpacing: 3 }}>· EP.01</span>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 296, textAlign: 'center', fontSize: 62, fontWeight: 800, color: WHITE, letterSpacing: 2 }}>
        每天进步 <span style={{ color: GOLD }}>1%</span>，坚持一年
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 400, textAlign: 'center', fontSize: 236, fontWeight: 900, color: GOLD, letterSpacing: -4, textShadow: '0 0 90px rgba(255,210,74,0.75)', lineHeight: 1.1 }}>
        37.78<span style={{ fontSize: 116, marginLeft: 12 }}>倍</span>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', fontSize: 40, fontWeight: 700, color: 'rgba(255,255,255,0.80)', letterSpacing: 4 }}>
        1.01 的 365 次方
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 96, textAlign: 'center', fontSize: 30, fontWeight: 700, color: GREY, letterSpacing: 6 }}>
        不是天赋 · 是复利
      </div>

      <div style={{ position: 'absolute', left: 56, right: 56, bottom: 54, height: 3, background: 'linear-gradient(90deg, transparent, rgba(255,210,74,0.75), transparent)' }} />
    </AbsoluteFill>
  );
};
