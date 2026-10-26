import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Audio, staticFile } from 'remotion';
import { LaoJia, MOUTH_L } from './laojia';

const GOLD = '#F5C518';
const RED = '#E5484D';
const GREEN = '#3DDC84';
const WHITE = '#FFFFFF';
const GREY = '#6B6B6B';
const BG = '#050505';
const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const MOUTH = MOUTH_L;

/** 幕边界（秒），全部对齐 0.79s 的音乐节拍 */
const T = {
  hero: 0.0, grid: 5.9, fail: 12.0, cut: 13.6, patch: 21.0,
  feat: 26.5, sent: 32.0, ratio: 38.0, ask: 44.2, quote: 50.6, title: 69.5, end: 75.8,
};
const OV = 0.35;

const CN: React.CSSProperties = {
  fontFamily: '"Microsoft YaHei","Source Han Sans SC","Noto Sans SC",sans-serif',
  fontWeight: 900, letterSpacing: 4,
};
const EN: React.CSSProperties = {
  fontFamily: 'Impact,"Arial Black",Arial,sans-serif', fontWeight: 700, letterSpacing: 4,
};
/** 金色手写体公式（学《复利》第2集的 f*=(bp−q)/b） */
const FORMULA: React.CSSProperties = {
  fontFamily: '"Segoe Script","Bradley Hand","Comic Sans MS",cursive',
  fontWeight: 700, fontStyle: 'italic', letterSpacing: 2,
};

const wrap = (f: number, s: number, e: number) => f >= s && f < e + OV;
const appear = (f: number, s: number, d = 0.3) =>
  interpolate(f, [s, s + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });

/** 从老贾嘴里飞出来：抛物线 + 由小放大 */
const fly = (t: number, s: number, dur = 0.55) => {
  const k = Math.min(1, Math.max(0, (t - s) / dur));
  const e = 1 - Math.pow(1 - k, 3);
  return { k, e, x: MOUTH.x + (-MOUTH.x) * e, y: MOUTH.y + (-MOUTH.y) * e - Math.sin(e * Math.PI) * 130, scale: 0.18 + e * 0.82, op: Math.min(1, k * 3) };
};

const glow = (c: string) => `0 0 ${30}px ${c}, 0 0 ${80}px ${c}66`;

/* ============ 星空（学《复利》：黑底不是纯黑） ============ */
const Stars: React.FC<{ t: number }> = ({ t }) => (
  <>
    {Array.from({ length: 200 }).map((_, i) => {
      const s = (i * 2654435761 % 100000) / 100000;
      const depth = s < 0.55 ? 0 : s < 0.86 ? 1 : 2;
      const sp = [0.1, 0.3, 0.68][depth];
      const y = ((s * 2300 + t * 26 * sp) % 1980) - 40;
      const x = ((s * 1080 + Math.sin(t * (0.22 + s * 0.5) + s * 11) * (16 + depth * 24)) % 1080 + 1080) % 1080;
      const r = [1.1, 2, 3.2][depth] + s * 1.5;
      const gold = i % 9 === 0;
      return (
        <div key={i} style={{
          position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%',
          background: gold ? GOLD : '#cfe3f2', opacity: [0.14, 0.3, 0.55][depth] * (0.6 + 0.4 * Math.sin(t * 1.7 + s * 20)),
          boxShadow: gold ? `0 0 14px ${GOLD}` : '0 0 5px rgba(180,210,235,.6)',
        }} />
      );
    })}
  </>
);

/* ============ 幕1 · 钩子（0-6s） ============ */
const Hero: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.hero, T.grid)) return null;
  const f = fly(t, T.hero + 0.35);
  const s = 1 + Math.sin(t * 5.2) * 0.02;
  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center',
        transform: `translate(${f.x}px, ${f.y + 1180 - 1180}px) scale(${f.scale})`, opacity: f.op,
      }}>
        <div style={{ ...CN, fontSize: 250, color: GOLD, textShadow: glow(GOLD), lineHeight: 1 }}>？</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1010, textAlign: 'center', transform: `scale(${s})` }}>
        <div style={{ ...CN, fontSize: 104, color: WHITE, textShadow: '0 0 30px rgba(0,0,0,.9)' }}>你天天说「让AI看图」</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center' }}>
        <div style={{ ...EN, fontSize: 40, color: GOLD, opacity: 0.8, letterSpacing: 5 }}>IT HAS NO EYES.</div>
      </div>
    </>
  );
};

/* ============ 幕2 · 网格 + 计数器（5.9-12s） ============ */
const Grid: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.grid, T.fail)) return null;
  const f = fly(t, T.grid + 0.1, 0.7);
  const N = 20;
  const count = interpolate(t, [T.grid + 0.7, T.fail - 0.3], [0, 150000], { easing: EASE });
  return (
    <>
      <div style={{
        position: 'absolute', left: '50%', top: 470, marginLeft: -((N * 50) + 19 * 7) / 2,
        display: 'grid', gridTemplateColumns: `repeat(${N}, 50px)`, gap: 7,
        opacity: f.op, transform: `translateY(${-f.y * 0.06}px) scale(${f.scale})`,
      }}>
        {Array.from({ length: N * N }).map((_, i) => (
          <div key={i} style={{
            width: 50, height: 50, borderRadius: 3,
            background: i % 8 === 0 ? GOLD : (i % 4 === 0 ? '#3a3a3a' : '#141414'),
            boxShadow: i % 8 === 0 ? '0 0 12px rgba(245,197,24,.6)' : 'none',
          }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', opacity: appear(t, T.grid + 0.8) }}>
        <div style={{ ...EN, fontSize: 150, color: GOLD, textShadow: glow(GOLD), lineHeight: 1 }}>
          {Math.round(count).toLocaleString()}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', opacity: appear(t, T.grid + 1.2) }}>
        <div style={{ ...CN, fontSize: 86, color: WHITE }}>一张猫图，AI 收到的是十五万个数</div>
      </div>
    </>
  );
};

/* ============ 幕3 · 红✗ 爆点（12-13.6s，只有2拍，必须狠） ============ */
const Fail: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.fail, T.cut)) return null;
  const k = appear(t, T.fail, 0.22);
  const shake = Math.max(0, 1 - (t - T.fail) / 0.5) * 14 * Math.sin((t - T.fail) * 60);
  const num = interpolate(t, [T.fail + 0.25, T.fail + 0.6], [100, 0], { easing: EASE });
  return (
    <>
      {/* 粒子炸开 */}
      {Array.from({ length: 44 }).map((_, i) => {
        const a = (i / 44) * Math.PI * 2;
        const d = appear(t, T.fail, 0.55) * (150 + (i % 6) * 55);
        const op = interpolate(t, [T.fail + 0.5, T.fail + 1.1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <div key={i} style={{
            position: 'absolute', left: 540 + Math.cos(a) * d, top: 900 + Math.sin(a) * d * 0.8,
            width: 6, height: 6, borderRadius: '50%', background: RED, boxShadow: `0 0 16px ${RED}`, opacity: op,
          }} />
        );
      })}
      <div style={{
        position: 'absolute', left: '50%', top: 700, marginLeft: -180,
        fontFamily: '"Microsoft YaHei",sans-serif', fontSize: 360, fontWeight: 900, color: RED,
        textShadow: glow(RED), opacity: k, transform: `translateX(${shake}px) scale(${interpolate(t, [T.fail, T.fail + 0.25], [2.2, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE })})`,
      }}>✗</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1240, textAlign: 'center', opacity: k }}>
        <div style={{ ...EN, fontSize: 190, color: RED, textShadow: glow(RED), lineHeight: 1 }}>{Math.round(num)}%</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1450, textAlign: 'center', opacity: appear(t, T.fail + 0.5) }}>
        <div style={{ ...CN, fontSize: 94, color: WHITE }}>一个数，它认不出</div>
      </div>
    </>
  );
};

/* ============ 幕4 · 切成196块 + 手写公式（13.6-21s） ============ */
const Cut: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.cut, T.patch)) return null;
  const f = fly(t, T.cut + 0.1, 0.7);
  const N = 14;
  const wipe = interpolate(t, [T.cut + 0.7, T.cut + 1.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  return (
    <>
      <div style={{
        position: 'absolute', left: '50%', top: 400, marginLeft: -(N * 76 + 13 * 8) / 2,
        display: 'grid', gridTemplateColumns: `repeat(${N}, 76px)`, gap: 8,
        opacity: f.op, transform: `scale(${f.scale * (0.7 + wipe * 0.3)})`,
      }}>
        {Array.from({ length: N * N }).map((_, i) => (
          <div key={i} style={{
            width: 76, height: 76, border: '3px solid #2a2a2a',
            background: i % 13 === 0 ? GOLD : 'transparent',
          }} />
        ))}
      </div>
      <div style={{
        position: 'absolute', left: 40, top: 400 + wipe * 1090, width: 1000, height: 5,
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        boxShadow: glow(GOLD), opacity: interpolate(t, [T.cut + 1.7, T.cut + 2.2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1530, textAlign: 'center', opacity: appear(t, T.cut + 2.3) }}>
        <div style={{ ...FORMULA, fontSize: 92, color: GOLD, textShadow: glow(GOLD) }}>196 × 768 = 150,528</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1650, textAlign: 'center', opacity: appear(t, T.cut + 2.6) }}>
        <div style={{ ...CN, fontSize: 60, color: WHITE, opacity: 0.85 }}>横十四竖十四，196块，每块768个数</div>
      </div>
    </>
  );
};

/* ============ 幕5 · 这块不够，它去抠旁边那块（21-26.5s） ============ */
const Patch: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.patch, T.feat)) return null;
  const f = fly(t, T.patch, 0.6);
  const reach = interpolate(t, [T.patch + 0.9, T.patch + 2.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  return (
    <>
      <div style={{
        position: 'absolute', left: 220, top: 600, width: 320, height: 320,
        background: '#121212', border: `7px solid ${GOLD}`, boxShadow: glow(GOLD),
        opacity: f.op, transform: `scale(${f.scale})`,
      }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 130, height: 130, marginLeft: -65, marginTop: -65, borderRadius: '50%', border: `7px solid ${GREY}` }} />
      </div>
      <div style={{ position: 'absolute', left: 640, top: 920, fontSize: 170, color: RED, fontWeight: 900, fontFamily: '"Microsoft YaHei",sans-serif', textShadow: glow(RED), opacity: appear(t, T.patch + 0.5) }}>?</div>
      <div style={{
        position: 'absolute', left: 540, top: 760, width: reach * 340, height: 5,
        background: `repeating-linear-gradient(90deg, ${GOLD} 0 16px, transparent 16px 30px)`, boxShadow: glow(GOLD),
      }} />
      <div style={{ position: 'absolute', left: 850, top: 660, width: 200, height: 200, border: `7px solid ${GOLD}`, boxShadow: glow(GOLD), opacity: reach }} />
      <div style={{ position: 'absolute', left: 840, top: 1330, opacity: reach }}>
        <div style={{ ...CN, fontSize: 58, color: GOLD, textShadow: glow(GOLD) }}>黄绒毛</div>
        <div style={{ ...CN, fontSize: 58, color: GREEN, textShadow: `0 0 30px ${GREEN}, 0 0 80px ${GREEN}66`, marginTop: 18 }}>尖耳朵</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1030, textAlign: 'center', opacity: appear(t, T.patch + 1.2) }}>
        <div style={{ ...CN, fontSize: 92, color: WHITE }}>这块不够，它去抠旁边那块</div>
      </div>
    </>
  );
};

/* ============ 幕6 · 196格点亮（26.5-32s） ============ */
const Feat: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.feat, T.sent)) return null;
  const N = 14, total = N * N;
  const lit = interpolate(t, [T.feat + 0.15, T.feat + 4.4], [0, total], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  // 波纹式点亮：从中心往外
  const idx = (i: number) => {
    const col = i % N, row = Math.floor(i / N);
    const d = Math.hypot(col - (N - 1) / 2, row - (N - 1) / 2);
    return [d, i];
  };
  const order = Array.from({ length: total }).map((_, i) => idx(i)).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const blast = [0.3, 0.95, 1.6, 2.25, 2.9, 3.55, 4.2];
  let blastOn = 0;
  blast.forEach(b => { const d = t - (T.feat + b); if (d >= 0 && d < 0.12) blastOn = 0.6 * (1 - d / 0.12); });
  const pct = [8, 23, 41, 56, 68, 84, 96][Math.min(6, Math.floor(lit / (total / 7)))];
  return (
    <>
      <div style={{
        position: 'absolute', left: '50%', top: 360, marginLeft: -(N * 62 + 13 * 7) / 2,
        display: 'grid', gridTemplateColumns: `repeat(${N}, 62px)`, gap: 7,
      }}>
        {Array.from({ length: total }).map((_, i) => {
          const rank = order.indexOf(i);
          const on = rank < lit;
          const isNew = rank === Math.floor(lit) - 1;
          return (
            <div key={i} style={{
              width: 62, height: 62, border: `3px solid ${on ? GOLD : '#202020'}`,
              background: on ? GOLD : 'transparent', boxShadow: on ? '0 0 16px rgba(245,197,24,.75)' : 'none',
              transform: isNew ? `scale(${1 + blastOn * 1.7})` : 'none',
            }} />
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1300, textAlign: 'center', opacity: appear(t, T.feat + 0.3) }}>
        <div style={{ ...CN, fontSize: 84, color: WHITE }}>每一块都升了级：不再是像素，是特征</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1620, textAlign: 'center' }}>
        <div style={{ ...EN, fontSize: 130, color: GOLD, textShadow: glow(GOLD), lineHeight: 1 }}>{pct}%</div>
      </div>
    </>
  );
};

/* ============ 幕7 · 收成一句话（32-38s） ============ */
const Sent: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.sent, T.ratio)) return null;
  const k = appear(t, T.sent, 0.5);
  const rise = interpolate(t, [T.sent, T.sent + 0.6], [90, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  return (
    <>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 700 + rise, textAlign: 'center', opacity: k }}>
        <div style={{ ...CN, fontSize: 128, color: GOLD, textShadow: glow(GOLD), lineHeight: 1.32 }}>
          这只猫：
          <br />猫眼 · 黄绒毛 · 尖耳朵
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1330, textAlign: 'center', opacity: appear(t, T.sent + 0.9) }}>
        <div style={{ ...CN, fontSize: 88, color: WHITE }}>196块，最后变成一句话</div>
      </div>
    </>
  );
};

/* ============ 幕8 · 100% → 0.1%（38-44.2s） ============ */
const Ratio: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.ratio, T.ask)) return null;
  const v = interpolate(t, [T.ratio + 0.3, T.ratio + 2.6], [100, 0.1], { extrapolateRight: 'clamp', easing: EASE });
  const col = v < 10 ? RED : GOLD;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: appear(t, T.ratio) }}>
        <div style={{ ...EN, fontSize: 270, color: col, textShadow: glow(col), lineHeight: 1 }}>
          {v >= 10 ? Math.round(v) : v.toFixed(1)}%
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1030, textAlign: 'center', opacity: appear(t, T.ratio + 1.4) }}>
        <div style={{ ...CN, fontSize: 78, color: WHITE }}>你看到 100%　AI 用到 {v >= 10 ? Math.round(v) : v.toFixed(1)}%</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1330, textAlign: 'center', opacity: appear(t, T.ratio + 2.6) }}>
        <div style={{ ...CN, fontSize: 94, color: RED, textShadow: glow(RED) }}>它一个像素都没瞧见</div>
      </div>
    </>
  );
};

/* ============ 幕9 · 提问（44.2-50.6s） ============ */
const Ask: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.ask, T.quote)) return null;
  return (
    <>
      <div style={{ position: 'absolute', left: 90, right: 90, top: 620, textAlign: 'center', opacity: appear(t, T.ask, 0.4) }}>
        <div style={{ ...CN, fontSize: 100, color: WHITE, lineHeight: 1.4 }}>你手上那件<br />最不敢开始的事</div>
      </div>
      <div style={{ position: 'absolute', left: 90, right: 90, top: 1040, textAlign: 'center', opacity: appear(t, T.ask + 1.2, 0.4) }}>
        <div style={{ ...CN, fontSize: 96, color: GOLD, textShadow: glow(GOLD), lineHeight: 1.4 }}>切成196块<br />第一块是什么？</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1400, textAlign: 'center', opacity: appear(t, T.ask + 2.0, 0.4) }}>
        <div style={{ ...EN, fontSize: 38, color: WHITE, opacity: 0.6, letterSpacing: 5 }}>WHAT'S YOUR FIRST PATCH?</div>
      </div>
    </>
  );
};

/* ============ 幕10 · 金句独占 19 秒（50.6-69.5s） ============ */
const Quote: React.FC<{ t: number }> = ({ t }) => {
  if (!wrap(t, T.quote, T.end)) return null;
  const sc = interpolate(t, [T.quote, T.quote + 0.7], [1.55, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', transform: `scale(${sc})`, opacity: appear(t, T.quote, 0.3) }}>
        <div style={{ ...CN, fontSize: 158, color: GOLD, textShadow: glow(GOLD), lineHeight: 1.32 }}>
          难的不是它
          <br />是你还没下刀
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1290, textAlign: 'center', opacity: appear(t, T.quote + 0.9, 0.5) }}>
        <div style={{ ...EN, fontSize: 44, color: WHITE, opacity: 0.62, letterSpacing: 5 }}>THE HARD PART ISN'T AI. YOU HAVEN'T CUT YET.</div>
      </div>
      <div style={{ position: 'absolute', left: 210, right: 210, top: 1450, height: 4, background: GOLD, boxShadow: glow(GOLD), opacity: appear(t, T.quote + 1.6, 0.6) }} />
    </>
  );
};

/* ============ 幕11 · 标题卡（69.5-75.8s） ============ */
const Title: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.title) return null;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', opacity: appear(t, T.title, 0.25) }}>
        <div style={{ ...CN, fontSize: 100, color: GOLD, textShadow: glow(GOLD) }}>AI 科普 · 第1集</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1200, textAlign: 'center', opacity: appear(t, T.title + 0.3, 0.3) }}>
        <div style={{ ...EN, fontSize: 40, color: WHITE, opacity: 0.6, letterSpacing: 5 }}>HOW AI ACTUALLY SEES</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', opacity: appear(t, T.title + 0.7, 0.3) }}>
        <div style={{ ...CN, fontSize: 56, color: GREY }}>下一集：为什么768个数就够了</div>
      </div>
    </>
  );
};

/* ============ 重拍白闪（每 0.79 秒一下，跟着音乐） ============ */
const Flash: React.FC<{ t: number }> = ({ t }) => {
  const b = t / 0.79;
  const frac = b - Math.floor(b);
  const bar = Math.floor(b) % 4 === 0;
  const op = frac < 0.045 ? (bar ? 0.4 : 0.22) * (1 - frac / 0.045) : 0;
  if (op <= 0) return null;
  return <AbsoluteFill style={{ background: WHITE, opacity: op }} />;
};

export const AIP3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Midnight Rush (V NICO) —— 全片唯一音源，零配音 */}
      <Audio src={staticFile('bgm.m4a')} />
      <Stars t={t} />
      {/* 中心体积光 */}
      <div style={{
        position: 'absolute', left: 80, top: 340, width: 920, height: 920, borderRadius: '50%',
        background: `radial-gradient(circle, ${GOLD}1c 0%, transparent 62%)`,
        opacity: 0.5 + Math.sin(t * 1.6) * 0.14,
      }} />
      <Hero t={t} />
      <Grid t={t} />
      <Fail t={t} />
      <Cut t={t} />
      <Patch t={t} />
      <Feat t={t} />
      <Sent t={t} />
      <Ratio t={t} />
      <Ask t={t} />
      <Quote t={t} />
      <Title t={t} />
      {/* 火柴人老贾 IP：站在下方，所有内容从他嘴里吐出来 */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: -40, opacity: 0.98 }}>
        <LaoJia side="l" delay={0} forceTalk />
      </div>
      <Flash t={t} />
    </AbsoluteFill>
  );
};