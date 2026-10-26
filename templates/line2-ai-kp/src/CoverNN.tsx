import React from 'react';
import { AbsoluteFill } from 'remotion';

const GOLD = '#FFD24A';
const WHITE = '#F2F5FA';
const CYAN = '#4FD8E8';
const CORAL = '#F06048';
const GREY = 'rgba(200,210,225,0.62)';
const FONT = '"Source Han Sans SC","Noto Sans SC","Microsoft YaHei",sans-serif';

const stars = Array.from({ length: 150 }).map((_, i) => ({
  x: (i * 137.508) % 1080,
  y: (i * 91.73) % 1080,
  r: 0.8 + ((i * 7) % 10) / 6,
  o: 0.10 + ((i * 13) % 10) / 16,
}));

const LAYERS = [4, 5, 5, 3];
const XS = [352, 486, 620, 754];
const NET_Y = 452;

const nodes = LAYERS.map((n, L) =>
  Array.from({ length: n }).map((_, k) => ({
    x: XS[L],
    y: NET_Y + (k - (n - 1) / 2) * 46,
    out: L === LAYERS.length - 1,
  }))
);

export const CoverNN: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#04060C', fontFamily: FONT }}>
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 40%, rgba(46,92,200,0.34), transparent 62%)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 74%, rgba(255,210,74,0.14), transparent 56%)' }} />

      {stars.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: s.x, top: s.y, width: s.r * 2, height: s.r * 2, borderRadius: '50%', background: i % 6 ? '#fff' : GOLD, opacity: s.o }} />
      ))}

      <svg width={1080} height={1080} viewBox="0 0 1080 1080" style={{ position: 'absolute', left: 0, top: 0 }}>
        {/* 连线 */}
        {nodes.slice(0, -1).map((cur, L) => cur.map((a, i) => nodes[L + 1].map((b, j) => (
          <line key={`e${L}-${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={L === 2 ? 'rgba(255,210,74,0.34)' : 'rgba(255,255,255,0.16)'} strokeWidth={1.2} />
        ))))}
        {/* 节点 */}
        {nodes.map((cur, L) => cur.map((n, k) => (
          <g key={`n${L}-${k}`}>
            {n.out ? <circle cx={n.x} cy={n.y} r={25} fill="none" stroke="rgba(255,210,74,0.35)" strokeWidth={2} /> : null}
            <circle cx={n.x} cy={n.y} r={n.out ? 15 : 12.5}
              fill="rgba(8,10,16,0.98)" stroke={n.out ? GOLD : CYAN} strokeWidth={n.out ? 4 : 2.8} />
          </g>
        )))}
        {[0, 1, 2].map((k) => (
          <circle key={`p${k}`} cx={XNODE(k)} cy={NET_Y + (k - 1) * 46} r={4} fill={GOLD} opacity={0.9} />
        ))}
      </svg>

      <div style={{ position: 'absolute', top: 54, left: 58, display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <span style={{ fontSize: 34, fontWeight: 900, color: GOLD, letterSpacing: 3 }}>AI 科普</span>
        <span style={{ fontSize: 19, fontWeight: 700, color: 'rgba(255,210,74,0.62)', letterSpacing: 4 }}>· EP.01</span>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 128, textAlign: 'center', fontSize: 80, fontWeight: 900, color: WHITE, letterSpacing: 1 }}>
        机器怎么认出<span style={{ color: GOLD }}>猫</span>？
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 248, textAlign: 'center', fontSize: 27, fontWeight: 700, color: GREY, letterSpacing: 5 }}>
        上千亿个开关 · 没人写过一条规则
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 636, textAlign: 'center', fontSize: 196, fontWeight: 900, color: GOLD, letterSpacing: -6, lineHeight: 1, textShadow: '0 0 90px rgba(255,210,74,0.55)' }}>
        3.57<span style={{ fontSize: 104, marginLeft: 4 }}>%</span>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 852, textAlign: 'center', fontSize: 32, fontWeight: 700, color: 'rgba(255,255,255,0.82)', letterSpacing: 2 }}>
        一万张图里，错 <span style={{ color: CORAL }}>357</span> 张
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 952, textAlign: 'center', fontSize: 30, fontWeight: 700, color: GREY, letterSpacing: 5 }}>
        不是设计出来的 · 是试错试出来的
      </div>

      <div style={{ position: 'absolute', left: 58, right: 58, bottom: 58, height: 3, background: 'linear-gradient(90deg, transparent, rgba(255,210,74,0.75), transparent)' }} />
    </AbsoluteFill>
  );
};

function XNODE(k: number) {
  return 892 + k * 0;
}
