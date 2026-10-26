import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Audio, staticFile } from 'remotion';
import { LaoJia } from './laojia';

const GOLD = '#F5C518';
const RED = '#E5484D';
const GREEN = '#3DDC84';
const WHITE = '#FFFFFF';
const GREY = '#6B6B6B';
const BG = '#050505';
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** 幕边界（秒），对齐 0.79s 节拍 */
const T = {
  cat: 0.0, label: 6.3, nums: 12.6, edge: 20.2,
  part: 36.1, wall: 45.6, cat2: 57.0, final: 65.6, end: 75.8,
};
const OV = 0.4;

const CN: React.CSSProperties = {
  fontFamily: '"Microsoft YaHei","Source Han Sans SC","Noto Sans SC",sans-serif',
  fontWeight: 900, letterSpacing: 4,
};
const EN: React.CSSProperties = {
  fontFamily: 'Impact,"Arial Black",Arial,sans-serif', fontWeight: 700, letterSpacing: 5,
};
const FORMULA: React.CSSProperties = {
  fontFamily: '"Segoe Script","Bradley Hand","Comic Sans MS",cursive',
  fontWeight: 700, fontStyle: 'italic',
};

const wrap = (f: number, s: number, e: number) => f >= s && f < e + OV;
const appear = (f: number, s: number, d = 0.3) =>
  interpolate(f, [s, s + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
const glow = (c: string) => `0 0 ${26}px ${c}, 0 0 ${70}px ${c}55`;
const breathe = (t: number) => 1 + Math.sin(t * 2.1) * 0.016;

/* ============ 星空 ============ */
const Stars: React.FC<{ t: number }> = ({ t }) => (
  <>
    {Array.from({ length: 200 }).map((_, i) => {
      const s = (i * 2654435761 % 100000) / 100000;
      const depth = s < 0.55 ? 0 : s < 0.86 ? 1 : 2;
      const y = ((s * 2300 + t * 24 * [0.1, 0.3, 0.66][depth]) % 1980) - 40;
      const x = ((s * 1080 + Math.sin(t * (0.22 + s * 0.5) + s * 11) * (16 + depth * 24)) % 1080 + 1080) % 1080;
      const r = [1.1, 2, 3.2][depth] + s * 1.5;
      const gold = i % 9 === 0;
      return (
        <div key={i} style={{
          position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%',
          background: gold ? GOLD : '#cfe3f2',
          opacity: [0.14, 0.3, 0.55][depth] * (0.6 + 0.4 * Math.sin(t * 1.7 + s * 20)),
          boxShadow: gold ? `0 0 14px ${GOLD}` : '0 0 5px rgba(180,210,235,.55)',
        }} />
      );
    })}
  </>
);

/* ============ 猫的轮廓（只画线，不画脸） ============ */
const CatOutline: React.FC<{ t: number; stroke: string; w: number; op: number }> = ({ t, stroke, w, op }) => {
  const sw = breathe(t);
  return (
    <svg width="1080" height="820" viewBox="0 0 1080 820" style={{
      position: 'absolute', left: 0, top: 330, transform: `scale(${sw})`, transformOrigin: '540px 380px', opacity: op,
    }}>
      {/* 耳朵 */}
      <path d="M228 300 L286 96 L430 250 Z" fill="none" stroke={stroke} strokeWidth={w} strokeLinejoin="round" />
      <path d="M852 300 L794 96 L650 250 Z" fill="none" stroke={stroke} strokeWidth={w} strokeLinejoin="round" />
      {/* 头轮廓 */}
      <path d="M540 180 C300 180 178 350 178 530 C178 700 340 800 540 800 C740 800 902 700 902 530 C902 350 780 180 540 180 Z"
        fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" />
    </svg>
  );
};

/* ============ 幕1 · 一只猫（0-6.3s） ============ */
const Cat: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.cat, T.label)) return null;
  return (
    <>
      <CatOutline t={t} stroke={GOLD} w={11} op={appear(t, T.cat, 0.5)} />
      {/* 眼睛：会眨 */}
      <svg width="1080" height="820" viewBox="0 0 1080 820" style={{ position: 'absolute', left: 0, top: 330, opacity: appear(t, T.cat + 0.4) }}>
        {(() => {
          const cyc = (t % 2.6) / 2.6;
          const h = cyc < 0.05 ? interpolate(cyc, [0, 0.025, 0.05], [46, 3, 46], { easing: Easing.inOut(Easing.quad) }) : 46;
          const px = Math.sin(t * 1.05) * 13;
          return (
            <>
              <ellipse cx={412 + px} cy={470} rx="34" ry={h / 2} fill={GOLD} />
              <ellipse cx={668 + px} cy={470} rx="34" ry={h / 2} fill={GOLD} />
            </>
          );
        })()}
      </svg>
    </>
  );
};

/* ============ 幕2 · 箭头标部位（6.3-12.6s） ============ */
const Label: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.label, T.nums)) return null;
  const items: [string, number, number][] = [['黄毛', 250, 700], ['圆脸', 830, 700], ['尖耳朵', 300, 470]];
  return (
    <>
      <CatOutline t={t} stroke={GOLD} w={11} op={0.85} />
      {items.map(([txt, x, y], i) => {
        const k = appear(t, T.label + 0.3 + i * 0.55, 0.35);
        return (
          <div key={txt} style={{ position: 'absolute', left: x, top: y, opacity: k, transform: `scale(${0.7 + k * 0.3})` }}>
            <div style={{
              ...CN, fontSize: 62, color: i === 2 ? GREEN : GOLD, textShadow: glow(i === 2 ? GREEN : GOLD),
              border: `4px solid ${i === 2 ? GREEN : GOLD}`, padding: '10px 24px', borderRadius: 14,
              background: 'rgba(0,0,0,.55)', whiteSpace: 'nowrap',
            }}>{txt}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1290, textAlign: 'center', opacity: appear(t, T.label + 0.6) }}>
        <div style={{ ...CN, fontSize: 96, color: WHITE }}>你看到的是毛色和脸型</div>
      </div>
    </>
  );
};

/* ============ 幕3 · 碎成小方格 + 数字（12.6-20.2s） ============ */
const Nums: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.nums, T.edge)) return null;
  const k = appear(t, T.nums + 0.1, 0.5);
  const N = 9;
  const seedVal = (i: number) => (i * 37 + 11) % 256;
  return (
    <>
      <div style={{
        position: 'absolute', left: '50%', top: 380, marginLeft: -(N * 108) / 2,
        display: 'grid', gridTemplateColumns: `repeat(${N}, 104px)`, gap: 4,
        opacity: k, transform: `scale(${0.5 + k * 0.5})`,
      }}>
        {Array.from({ length: N * N }).map((_, i) => {
          const v = seedVal(i);
          const show = t >= T.nums + 0.6 + (i % N) * 0.05 + Math.floor(i / N) * 0.07;
          return (
            <div key={i} style={{
              width: 104, height: 104, background: `rgb(${v},${v},${v})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'monospace', fontSize: 26,
              color: v > 140 ? '#000' : '#eee', opacity: show ? 1 : 0.06,
            }}>{v}</div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1400, textAlign: 'center', opacity: appear(t, T.nums + 1.4) }}>
        <div style={{ ...CN, fontSize: 100, color: GOLD, textShadow: glow(GOLD) }}>AI 看到的，是一堆数字</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1530, textAlign: 'center', opacity: appear(t, T.nums + 1.9) }}>
        <div style={{ ...EN, fontSize: 38, color: WHITE, opacity: 0.62 }}>IT SEES A GRID OF NUMBERS. NOT A CAT.</div>
      </div>
    </>
  );
};

/* ============ 幕4 · 找边（全片最亮的 16 秒）（20.2-36.1s） ============ */
const Edge: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.edge, T.part)) return null;
  const seg = (i: number, n: number) => t >= T.edge + 1.4 + i * (7.6 / n);
  const fade = appear(t, T.edge, 0.5);
  return (
    <>
      {/* 全屏闪一下，制造"全片最亮" */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${GOLD}14 0%, transparent 60%)`, opacity: fade * (0.7 + Math.sin(t * 1.5) * 0.2) }} />
      <svg width="1080" height="820" viewBox="0 0 1080 820" style={{ position: 'absolute', left: 0, top: 330, transform: `scale(${breathe(t)})`, transformOrigin: '540px 380px' }}>
        {/* 数字格先暗掉 */}
        {/* 轮廓线：一条条唰亮起 */}
        <g opacity={seg(0, 6) ? 1 : 0}>
          <path d="M228 300 L286 96 L430 250 Z" fill="none" stroke={GOLD} strokeWidth={12} strokeLinejoin="round" strokeDasharray={1600} strokeDashoffset={0} />
          <path d="M852 300 L794 96 L650 250 Z" fill="none" stroke={GOLD} strokeWidth={12} strokeLinejoin="round" />
          <path d="M540 180 C300 180 178 350 178 530 C178 700 340 800 540 800 C740 800 902 700 902 530 C902 350 780 180 540 180 Z"
            fill="none" stroke={GOLD} strokeWidth={12} strokeLinecap="round" />
        </g>
        {/* 眼睛边 */}
        <g opacity={seg(1, 6) ? 1 : 0}>
          <ellipse cx="412" cy="470" rx="46" ry="34" fill="none" stroke={WHITE} strokeWidth={9} />
          <ellipse cx="668" cy="470" rx="46" ry="34" fill="none" stroke={WHITE} strokeWidth={9} />
        </g>
        {/* 胡须 */}
        <g opacity={seg(2, 6) ? 1 : 0} stroke={WHITE} strokeWidth={7} strokeLinecap="round">
          <line x1="250" y1="600" x2="70" y2="566" /><line x1="250" y1="644" x2="66" y2="664" />
          <line x1="830" y1="600" x2="1010" y2="566" /><line x1="830" y1="644" x2="1014" y2="664" />
        </g>
        {/* 鼻嘴边 */}
        <g opacity={seg(3, 6) ? 1 : 0}>
          <path d="M508 596 L572 596 L540 630 Z" fill="none" stroke={RED} strokeWidth={9} strokeLinejoin="round" />
          <path d="M540 630 L540 652" stroke={RED} strokeWidth={8} />
          <path d="M540 652 Q495 700 450 660" fill="none" stroke={RED} strokeWidth={8} strokeLinecap="round" />
          <path d="M540 652 Q585 700 630 660" fill="none" stroke={RED} strokeWidth={8} strokeLinecap="round" />
        </g>
      </svg>
      {/* 一闪一闪的高亮粒子沿边跑 */}
      {seg(0, 6) && Array.from({ length: 22 }).map((_, i) => {
        const a = t * 1.5 + i * (Math.PI * 2 / 22);
        const rr = 330 + Math.sin(a * 3) * 26;
        return (
          <div key={i} style={{
            position: 'absolute', left: 540 + Math.cos(a) * rr, top: 730 + Math.sin(a) * rr * 0.62,
            width: 5, height: 5, borderRadius: '50%', background: GOLD, boxShadow: glow(GOLD), opacity: 0.8,
          }} />
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1290, textAlign: 'center', opacity: fade }}>
        <div style={{ ...CN, fontSize: 118, color: GOLD, textShadow: glow(GOLD) }}>它第一件事：找边</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1430, textAlign: 'center', opacity: appear(t, T.edge + 2.2) }}>
        <div style={{ ...CN, fontSize: 62, color: WHITE, opacity: 0.9 }}>像悬崖边、草地边那种边</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1560, textAlign: 'center', opacity: appear(t, T.edge + 8.5) }}>
        <div style={{ ...EN, fontSize: 38, color: GOLD, opacity: 0.7 }}>WHERE DARK MEETS LIGHT. THAT IS AN EDGE.</div>
      </div>
    </>
  );
};

/* ============ 幕5 · 边拼成零件（36.1-45.6s） ============ */
const Part: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.part, T.wall)) return null;
  const items: [string, string, number][] = [
    ['耳朵', 'triangle', GOLD], ['眼睛', 'circle', WHITE], ['胡须', 'line', RED],
  ];
  return (
    <>
      {items.map(([name, kind, col], i) => {
        const k = appear(t, T.part + 0.2 + i * 1.1, 0.4);
        const x = 190 + i * 270;
        return (
          <div key={name} style={{ position: 'absolute', left: x, top: 560, opacity: k, transform: `scale(${0.6 + k * 0.4})` }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              {kind === 'triangle' && <path d="M100 30 L170 160 L30 160 Z" fill="none" stroke={col} strokeWidth={11} strokeLinejoin="round" />}
              {kind === 'circle' && <circle cx="100" cy="100" r="62" fill="none" stroke={col} strokeWidth={11} />}
              {kind === 'line' && <g stroke={col} strokeWidth={9} strokeLinecap="round"><line x1="20" y1="60" x2="180" y2="42" /><line x1="20" y1="100" x2="180" y2="100" /><line x1="20" y1="140" x2="180" y2="158" /></g>}
            </svg>
            <div style={{ ...CN, fontSize: 68, color: col, textShadow: glow(col), textAlign: 'center', marginTop: 14 }}>{name}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1050, textAlign: 'center', opacity: appear(t, T.part + 0.3) }}>
        <div style={{ ...CN, fontSize: 96, color: WHITE }}>边之间夹出零件</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1370, textAlign: 'center', opacity: appear(t, T.part + 4.0) }}>
        <div style={{ ...EN, fontSize: 36, color: WHITE, opacity: 0.55 }}>EDGES BECOME PARTS</div>
      </div>
    </>
  );
};

/* ============ 幕6 · 零件飞进照片墙（45.6-57s） ============ */
const Wall: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.wall, T.cat2)) return null;
  const N = 26;
  const build = appear(t, T.wall + 0.2, 2.6);
  return (
    <>
      <div style={{
        position: 'absolute', left: 30, right: 30, top: 420, bottom: 560, overflow: 'hidden',
        border: `3px solid #2a2a2a`, opacity: appear(t, T.wall, 0.4),
      }}>
        {Array.from({ length: N * 14 }).map((_, i) => {
          const s = (i * 2654435761 % 100000) / 100000;
          const on = t >= T.wall + 0.3 + s * 2.2;
          return (
            <div key={i} style={{
              position: 'absolute', left: (i % N) * 40, top: Math.floor(i / N) * 44,
              width: 36, height: 40, borderRadius: 2,
              background: `rgba(${180 - s * 60},${160 - s * 50},${130 - s * 40},${0.35 + s * 0.4})`,
              opacity: on ? 1 : 0.06,
              filter: `blur(${on ? 0 : 3}px)`,
            }} />
          );
        })}
      </div>
      {/* 零件飞进去 */}
      {[['耳朵', 260, GOLD], ['眼睛', 520, WHITE], ['胡须', 780, RED]].map(([n, x, c], i) => {
        const k = interpolate(t, [T.wall + 3.2 + i * 0.3, T.wall + 4.4 + i * 0.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
        return (
          <div key={String(n)} style={{ position: 'absolute', left: Number(x) - 60, top: 760, opacity: k, transform: `scale(${1 - k * 0.4})` }}>
            <div style={{ ...CN, fontSize: 58, color: String(c), textShadow: glow(String(c)) }}>{String(n)}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1290, textAlign: 'center', opacity: appear(t, T.wall + 1.4) }}>
        <div style={{ ...CN, fontSize: 96, color: WHITE }}>它对过几十万张老照片</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', opacity: appear(t, T.wall + 5.0) }}>
        <div style={{ ...CN, fontSize: 64, color: GOLD, textShadow: glow(GOLD) }}>所以它"认识"猫</div>
      </div>
    </>
  );
};

/* ============ 幕7 · 弹出结论（57-65.6s） ============ */
const Cat2: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.cat2, T.final)) return null;
  const pop = interpolate(t, [T.cat2 + 0.1, T.cat2 + 0.6], [0.3, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  return (
    <>
      <CatOutline t={t} stroke={GOLD} w={12} op={appear(t, T.cat2, 0.3)} />
      <div style={{ position: 'absolute', left: '50%', top: 430, marginLeft: -300, transform: `scale(${pop})`, opacity: pop }}>
        <div style={{ ...CN, fontSize: 150, color: GOLD, textShadow: glow(GOLD), textAlign: 'center', lineHeight: 1.2 }}>
          是猫
          <div style={{ ...EN, fontSize: 92, marginTop: 18 }}>99.7%</div>
        </div>
      </div>
      {[['尖耳朵', GOLD], ['黄毛', GOLD], ['圆眼', GREEN]].map(([n, c], i) => {
        const k = appear(t, T.cat2 + 1.4 + i * 0.5, 0.3);
        return (
          <div key={n} style={{ position: 'absolute', left: 250, top: 1180 + i * 92, opacity: k }}>
            <div style={{ ...CN, fontSize: 60, color: c, textShadow: glow(c) }}>✓ {n}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', opacity: appear(t, T.cat2 + 2.8) }}>
        <div style={{ ...CN, fontSize: 62, color: WHITE, opacity: 0.85 }}>三个零件都对上了</div>
      </div>
    </>
  );
};

/* ============ 幕8 · 收尾金句 + 提问（65.6-75.8s） ============ */
const Final: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.final) return null;
  const k = appear(t, T.final, 0.4);
  const sc = interpolate(t, [T.final, T.final + 0.7], [1.35, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  return (
    <>
      <div style={{ position: 'absolute', left: 60, right: 60, top: 640, textAlign: 'center', transform: `scale(${sc})`, opacity: k }}>
        <div style={{ ...CN, fontSize: 128, color: GOLD, textShadow: glow(GOLD), lineHeight: 1.34 }}>
          AI看到的
          <br />不是猫，是一堆边
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1080, textAlign: 'center', opacity: appear(t, T.final + 1.4, 0.5) }}>
        <div style={{ ...EN, fontSize: 40, color: WHITE, opacity: 0.6, letterSpacing: 5 }}>IT SEES EDGES, NOT CATS.</div>
      </div>
      <div style={{ position: 'absolute', left: 110, right: 110, top: 1330, textAlign: 'center', opacity: appear(t, T.final + 2.6, 0.5) }}>
        <div style={{ ...CN, fontSize: 74, color: WHITE, lineHeight: 1.45 }}>
          你有没有盯着窗户上的水汽看过？
          <br /><span style={{ color: GOLD, textShadow: glow(GOLD) }}>那道先出现的水痕</span>
          <br />就是 AI 最先看见的东西
        </div>
      </div>
    </>
  );
};

/* ============ 卡点白闪（每 0.79 秒，每 4 拍强） ============ */
const Flash: React.FC<{ t: number }> = ({ t }) => {
  const b = t / 0.79;
  const frac = b - Math.floor(b);
  const bar = Math.floor(b) % 4 === 0;
  const op = frac < 0.042 ? (bar ? 0.38 : 0.2) * (1 - frac / 0.042) : 0;
  if (op <= 0) return null;
  return <AbsoluteFill style={{ background: WHITE, opacity: op }} />;
};

export const AIP4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Audio src={staticFile('bgm.m4a')} />
      <Stars t={t} />
      <div style={{
        position: 'absolute', left: 80, top: 330, width: 920, height: 920, borderRadius: '50%',
        background: `radial-gradient(circle, ${GOLD}18 0%, transparent 62%)`,
        opacity: 0.45 + Math.sin(t * 1.5) * 0.13,
      }} />
      <Cat t={t} />
      <Label t={t} />
      <Nums t={t} />
      <Edge t={t} />
      <Part t={t} />
      <Wall t={t} />
      <Cat2 t={t} />
      <Final t={t} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: -50, opacity: 0.96 }}>
        <LaoJia side="l" delay={0} forceTalk />
      </div>
      <Flash t={t} />
    </AbsoluteFill>
  );
};