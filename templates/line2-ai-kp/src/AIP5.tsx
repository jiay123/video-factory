import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Audio, staticFile } from 'remotion';
import { LaoJia } from './laojia';

const GOLD = '#F5C518';
const RED = '#E5484D';
const GREEN = '#3DDC84';
const WHITE = '#FFFFFF';
const GREY = '#8A8A8A';
const BG = '#050505';
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** 逐字时间轴 —— 全部来自 kp1_v2_timeline.json（edge-tts 实测），文案一字未改 */
const SEG: { s: number; e: number; t: string }[] = [
  { s: 0.00, e: 10.06, t: '这是一只猫的图片。AI看一眼，它就能认出这是猫。可是，AI压根没有眼睛，它凭什么知道这只猫呢？' },
  { s: 10.18, e: 16.18, t: '中间的大模型才是主角。可它压根看不懂图——它只认数字。' },
  { s: 16.30, e: 23.47, t: '最直观的笨办法：把每个像素当成一个数，全喂进去。行不通，原因有三个。' },
  { s: 23.59, e: 33.72, t: '第一，数字太多。224乘224的图，五万多像素，彩色的一个像素三个数，加起来十五万个。算不起。' },
  { s: 33.84, e: 41.14, t: '第二更要命：数字本身没含义。三个零摆在这儿，可能是猫鼻子，也可能是黑背景。' },
  { s: 41.26, e: 49.82, t: '含义藏在组合里。鼻子、耳朵、胡须、绒毛，单拎哪个都不说明问题，拼一块才叫猫。' },
  { s: 49.94, e: 58.58, t: '所以答案就一个字：切。你不是大吗，我给你切碎了——横着14块，竖着14块，一共196块。' },
  { s: 58.70, e: 66.86, t: '每块16乘16。现在只盯一块，正好是眼睛。三个颜色通道，一共768个数字。' },
  { s: 66.98, e: 75.17, t: '关键就一步：看邻居。边上是黄色的绒毛，再过去是尖耳朵。行，那是猫眼。' },
  { s: 75.29, e: 81.72, t: '于是196块一起过一遍，每块都升了级：不再是像素，是特征。' },
  { s: 81.84, e: 85.73, t: '它才答得出：毛茸茸的，真可爱。' },
  { s: 85.85, e: 93.96, t: '回到开头。AI凭什么认得出猫？切成块，各自升级，再拼起来。就这么土。' },
  { s: 94.08, e: 102.26, t: '人也一样：你觉得一件事难，多半只是它还连成一整块。切开，就没那么吓人了。' },
];

const CN: React.CSSProperties = {
  fontFamily: '"Microsoft YaHei","Source Han Sans SC","Noto Sans SC",sans-serif',
  fontWeight: 900, letterSpacing: 3,
};
const EN: React.CSSProperties = { fontFamily: 'Impact,"Arial Black",Arial,sans-serif', fontWeight: 700, letterSpacing: 5 };

const glow = (c: string) => `0 0 ${24}px ${c}, 0 0 ${64}px ${c}55`;
const breathe = (t: number) => 1 + Math.sin(t * 2.1) * 0.016;
/** 幕内进度 0~1 */
const prog = (t: number, s: number, e: number) => Math.min(1, Math.max(0, (t - s) / (e - s)));

/* ===== 底部逐字点亮字幕（老贾铁律：有配音必须有字，bottom 486） ===== */
const Subtitle: React.FC<{ t: number }> = ({ t }) => {
  const seg = SEG.find(g => t >= g.s && t < g.e + 0.35);
  if (!seg) return null;
  const k = prog(t, seg.s, seg.e);
  const chars = [...seg.t];
  const litCount = Math.ceil(k * chars.length);
  return (
    <div style={{
      position: 'absolute', left: 50, right: 50, bottom: 486, textAlign: 'center',
    }}>
      <div style={{ ...CN, fontSize: 46, lineHeight: 1.36 }}>
        {chars.map((c, i) => (
          <span key={i} style={{
            color: i < litCount ? GOLD : '#3a3a3a',
            textShadow: i < litCount ? '0 0 18px rgba(245,197,24,.55)' : 'none',
          }}>{c}</span>
        ))}
      </div>
    </div>
  );
};

/* ===== 屏幕大字（每幕一个核心词，跟原文案同步） ===== */
const BigWord: React.FC<{ t: number; s: number; e: number; txt: string; en: string; color?: string; y?: number; size?: number }> = ({
  t, s, e, txt, en, color = GOLD, y = 1180, size = 96,
}) => {
  if (t < s || t > e + 0.5) return null;
  const k = interpolate(t, [s, s + 0.35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const sc = interpolate(t, [s, s + 0.45], [1.35, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const out = interpolate(t, [e - 0.35, e], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top: y, textAlign: 'center', opacity: k * out, transform: `scale(${sc})` }}>
      <div style={{ ...CN, fontSize: size, color, textShadow: glow(color), lineHeight: 1.2 }}>{txt}</div>
      <div style={{ ...EN, fontSize: Math.round(size * 0.36), color: WHITE, opacity: 0.6, marginTop: 16 }}>{en}</div>
    </div>
  );
};

/* ===== 星空 ===== */
const Stars: React.FC<{ t: number }> = ({ t }) => (
  <>
    {Array.from({ length: 190 }).map((_, i) => {
      const s = (i * 2654435761 % 100000) / 100000;
      const depth = s < 0.55 ? 0 : s < 0.86 ? 1 : 2;
      const y = ((s * 2300 + t * 22 * [0.1, 0.3, 0.64][depth]) % 1960) - 40;
      const x = ((s * 1080 + Math.sin(t * (0.22 + s * 0.5) + s * 11) * (16 + depth * 22)) % 1080 + 1080) % 1080;
      const r = [1.1, 2, 3.2][depth] + s * 1.4;
      const gold = i % 9 === 0;
      return (
        <div key={i} style={{
          position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%',
          background: gold ? GOLD : '#cfe3f2',
          opacity: [0.13, 0.28, 0.5][depth] * (0.6 + 0.4 * Math.sin(t * 1.7 + s * 20)),
          boxShadow: gold ? `0 0 12px ${GOLD}` : '0 0 5px rgba(180,210,235,.5)',
        }} />
      );
    })}
  </>
);

/* ===== 猫轮廓（只画线） ===== */
const CatLine: React.FC<{ t: number; color?: string; w?: number; op?: number; dy?: number }> = ({
  t, color = GOLD, w = 11, op = 1, dy = 0,
}) => (
  <svg width="1080" height="820" viewBox="0 0 1080 820" style={{
    position: 'absolute', left: 0, top: 250 + dy, transform: `scale(${breathe(t)})`, transformOrigin: '540px 400px', opacity: op,
  }}>
    <path d="M228 300 L286 96 L430 250 Z" fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" />
    <path d="M852 300 L794 96 L650 250 Z" fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" />
    <path d="M540 180 C300 180 178 350 178 530 C178 700 340 800 540 800 C740 800 902 700 902 530 C902 350 780 180 540 180 Z"
      fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" />
  </svg>
);

/* ===== 幕1 · 钩子：猫亮起 + "它凭什么"（0-10s） ===== */
const S1: React.FC<{ t: number }> = ({ t }) => {
  if (t > 10.6) return null;
  const draw = prog(t, 0.4, 3.2);
  const q = prog(t, 5.0, 6.2);
  return (
    <>
      <CatLine t={t} op={0.35 + draw * 0.65} />
      {q > 0 && (
        <div style={{
          position: 'absolute', left: '50%', top: 400, marginLeft: -70,
          fontSize: 210, color: RED, fontWeight: 900, fontFamily: '"Microsoft YaHei",sans-serif',
          textShadow: glow(RED), opacity: q, transform: `scale(${interpolate(q, [0, 1], [2, 1], { easing: EASE })})`,
        }}>?</div>
      )}
      <BigWord t={t} s={0.5} e={10.06} txt="AI 压根没有眼睛" en="IT HAS NO EYES." color={GOLD} y={1130} size={104} />
    </>
  );
};

/* ===== 幕2 · 猫碎成数字格（10.2-16.3s） ===== */
const S2: React.FC<{ t: number }> = ({ t }) => {
  if (t < 10.0 || t > 16.6) return null;
  const N = 8;
  const k = prog(t, 11.4, 12.6);
  return (
    <>
      <div style={{
        position: 'absolute', left: '50%', top: 330, marginLeft: -(N * 122) / 2,
        display: 'grid', gridTemplateColumns: `repeat(${N}, 118px)`, gap: 4, opacity: k,
        transform: `scale(${0.4 + k * 0.6})`,
      }}>
        {Array.from({ length: N * N }).map((_, i) => {
          const v = (i * 53 + 17) % 256;
          const on = t >= 12.2 + (i % N) * 0.04 + Math.floor(i / N) * 0.06;
          return (
            <div key={i} style={{
              width: 118, height: 118, background: `rgb(${v},${v},${v})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'monospace', fontSize: 28, color: v > 140 ? '#000' : '#eee', opacity: on ? 1 : 0.05,
            }}>{v}</div>
          );
        })}
      </div>
      <BigWord t={t} s={10.3} e={16.18} txt="它只认数字" en="IT ONLY READS NUMBERS." color={WHITE} y={1310} size={98} />
    </>
  );
};

/* ===== 幕3 · 原因有三个（16.3-23.5s） ===== */
const S3: React.FC<{ t: number }> = ({ t }) => {
  if (t < 16.2 || t > 23.9) return null;
  return (
    <>
      {['一', '二', '三'].map((n, i) => {
        const k = interpolate(t, [18.6 + i * 1.0, 19.2 + i * 1.0], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
        return (
          <div key={n} style={{ position: 'absolute', left: 210 + i * 250, top: 620, opacity: k, transform: `scale(${0.5 + k * 0.5})` }}>
            <div style={{
              width: 170, height: 170, borderRadius: '50%', border: `7px solid ${RED}`, color: RED,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Microsoft YaHei",sans-serif', fontWeight: 900, fontSize: 84, textShadow: glow(RED),
            }}>{n}</div>
          </div>
        );
      })}
      <BigWord t={t} s={16.5} e={23.47} txt="行不通，原因有三个" en="THREE REASONS IT FAILS." color={RED} y={1150} size={96} />
    </>
  );
};

/* ===== 幕4 · 数字太多，十五万个（23.6-33.8s） ===== */
const S4: React.FC<{ t: number }> = ({ t }) => {
  if (t < 23.4 || t > 34.2) return null;
  const n = interpolate(t, [26.5, 31.5], [0, 150000], { easing: EASE });
  const over = t > 31.5;
  return (
    <>
      {Array.from({ length: 120 }).map((_, i) => {
        const on = i < (n / 150000) * 120;
        const s = (i * 37 % 100) / 100;
        return (
          <div key={i} style={{
            position: 'absolute', left: 60 + (i % 20) * 49, top: 340 + Math.floor(i / 20) * 62,
            width: 42, height: 54, borderRadius: 3,
            background: on ? (over ? RED : GOLD) : '#1a1a1a', opacity: on ? 1 : 0.25,
            boxShadow: on ? (over ? `0 0 16px ${RED}` : `0 0 10px ${GOLD}88`) : 'none',
            transform: `scale(${1 + (on && i % 7 === 0 ? Math.sin(t * 6 + s * 10) * 0.08 : 0)})`,
          }} />
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1080, textAlign: 'center' }}>
        <div style={{ ...EN, fontSize: 170, color: over ? RED : GOLD, textShadow: glow(over ? RED : GOLD), lineHeight: 1 }}>
          {Math.round(n).toLocaleString()}
        </div>
      </div>
      <BigWord t={t} s={23.6} e={33.72} txt="加起来十五万个 · 算不起" en="150,000 NUMBERS. TOO MANY." color={over ? RED : GOLD} y={1250} size={88} />
    </>
  );
};

/* ===== 幕5 · 三个零，没有含义（33.8-41.3s） ===== */
const S5: React.FC<{ t: number }> = ({ t }) => {
  if (t < 33.7 || t > 41.5) return null;
  const k = prog(t, 34.6, 35.4);
  return (
    <>
      {['0', '0', '0'].map((z, i) => {
        const kk = interpolate(t, [35.0 + i * 0.5, 35.6 + i * 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
        return (
          <div key={i} style={{
            position: 'absolute', left: 300 + i * 220, top: 480, opacity: kk, transform: `scale(${0.4 + kk * 0.6})`,
          }}>
            <div style={{
              width: 170, height: 210, border: `6px solid ${WHITE}`, color: WHITE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'monospace', fontSize: 96, textShadow: glow(WHITE),
            }}>{z}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 590, top: 560, fontSize: 130, color: RED, fontWeight: 900, fontFamily: '"Microsoft YaHei",sans-serif', textShadow: glow(RED), opacity: k }}>?</div>
      <div style={{ position: 'absolute', left: 130, right: 130, top: 780, textAlign: 'center' }}>
        <div style={{ ...CN, fontSize: 66, color: GREY }}>猫鼻子？　黑背景？</div>
      </div>
      <BigWord t={t} s={33.9} e={41.14} txt="数字本身没含义" en="A NUMBER ALONE MEANS NOTHING." color={WHITE} y={1230} size={94} />
    </>
  );
};

/* ===== 幕6 · 含义藏在组合里（41.3-49.9s） ===== */
const S6: React.FC<{ t: number }> = ({ t }) => {
  if (t < 41.1 || t > 50.2) return null;
  const scatter = prog(t, 42.0, 44.6);
  const back = prog(t, 45.4, 47.6);
  const parts: [string, number, number, string][] = [
    ['鼻子', 240, 400, RED], ['耳朵', 660, 380, GOLD], ['胡须', 200, 760, WHITE], ['绒毛', 700, 780, GOLD],
  ];
  return (
    <>
      {parts.map(([n, x0, y0, c], i) => {
        const k = interpolate(t, [42.0 + i * 0.35, 42.6 + i * 0.35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
        const sX = 540 + Math.cos(i * 1.9) * 300;
        const sY = 660 + Math.sin(i * 2.4) * 200;
        const bx = 540 + (x0 + 90 - 540) * 0.25;
        const by = 660 + (y0 - 660) * 0.25;
        const x = sX + (bx - sX) * back;
        const y = sY + (by - sY) * back;
        return (
          <div key={n} style={{ position: 'absolute', left: x, top: y, opacity: k, transform: `scale(${0.7 + k * 0.3})` }}>
            <div style={{ ...CN, fontSize: 58, color: c, textShadow: glow(c), whiteSpace: 'nowrap' }}>{n}</div>
          </div>
        );
      })}
      <div style={{ opacity: back * 0.9 }}>
        <CatLine t={t} color={GOLD} w={12} dy={-40} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1160, textAlign: 'center', opacity: prog(t, 45.6, 46.6) }}>
        <div style={{ ...CN, fontSize: 80, color: GOLD, textShadow: glow(GOLD) }}>拼一块才叫猫</div>
      </div>
      <BigWord t={t} s={41.3} e={49.82} txt="含义藏在组合里" en="MEANING LIVES IN COMBINATION." y={1300} size={94} />
    </>
  );
};

/* ===== 幕7 · 切（49.9-58.7s） ===== */
const S7: React.FC<{ t: number }> = ({ t }) => {
  if (t < 49.8 || t > 58.9) return null;
  const wipe = prog(t, 51.4, 53.4);
  const N = 14;
  return (
    <>
      <div style={{ opacity: 1 - prog(t, 51.0, 52.0) }}><CatLine t={t} w={12} /></div>
      <div style={{
        position: 'absolute', left: '50%', top: 300, marginLeft: -(N * 74 + 13 * 8) / 2,
        display: 'grid', gridTemplateColumns: `repeat(${N}, 74px)`, gap: 8,
        opacity: prog(t, 51.2, 52.0), transform: `scale(${0.55 + wipe * 0.45})`,
      }}>
        {Array.from({ length: N * N }).map((_, i) => (
          <div key={i} style={{ width: 74, height: 74, border: '3px solid #333' }} />
        ))}
      </div>
      <div style={{
        position: 'absolute', left: 40, top: 300 + wipe * 1080, width: 1000, height: 5,
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, boxShadow: glow(GOLD),
        opacity: interpolate(t, [53.2, 53.9], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }} />
      <BigWord t={t} s={50.2} e={58.58} txt="答案就一个字：切" en="THE ANSWER: CUT." y={1420} size={104} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1560, textAlign: 'center', opacity: prog(t, 54.5, 55.5) }}>
        <div style={{ ...EN, fontSize: 46, color: GOLD, textShadow: glow(GOLD) }}>14 × 14 = 196 BLOCKS</div>
      </div>
    </>
  );
};

/* ===== 幕8 · 每块768个数字（58.7-67s） ===== */
const S8: React.FC<{ t: number }> = ({ t }) => {
  if (t < 58.6 || t > 67.3) return null;
  const big = prog(t, 59.8, 60.8);
  const nums = prog(t, 62.5, 64.5);
  return (
    <>
      <div style={{
        position: 'absolute', left: 200, top: 430, width: 420, height: 420,
        border: `7px solid ${GOLD}`, boxShadow: glow(GOLD), opacity: 0.95,
        transform: `scale(${0.35 + big * 0.65})`,
      }}>
        <div style={{ position: 'absolute', inset: 60, border: `3px dashed ${WHITE}66`, borderRadius: '50%', opacity: 0.5 + Math.sin(t * 2.4) * 0.25 }} />
      </div>
      {Array.from({ length: 24 }).map((_, i) => {
        const on = t >= 62.5 + i * 0.05;
        const a = (i / 24) * Math.PI * 2;
        return (
          <div key={i} style={{
            position: 'absolute', left: 410 + Math.cos(a) * 230, top: 640 + Math.sin(a) * 230,
            width: 40, height: 40, borderRadius: 4, background: on ? GOLD : '#202020',
            fontFamily: 'monospace', fontSize: 15, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: on ? `0 0 12px ${GOLD}` : 'none',
          }}>{on ? ((i * 31) % 100) : ''}</div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', opacity: prog(t, 64.5, 65.3) }}>
        <div style={{ ...CN, fontSize: 74, color: WHITE }}>正好是眼睛</div>
      </div>
      <BigWord t={t} s={58.9} e={66.86} txt="每块 768 个数字" en="768 NUMBERS PER BLOCK." y={1330} size={92} />
    </>
  );
};

/* ===== 幕9 · 看邻居（67-75.3s） ===== */
const S9: React.FC<{ t: number }> = ({ t }) => {
  if (t < 66.8 || t > 75.5) return null;
  const link = prog(t, 68.6, 70.2);
  return (
    <>
      {/* 中间大块（眼睛） */}
      <div style={{
        position: 'absolute', left: 380, top: 520, width: 300, height: 300,
        border: `7px solid ${GOLD}`, boxShadow: glow(GOLD),
        opacity: 1 - prog(t, 71.0, 71.6),
      }} />
      <div style={{ position: 'absolute', left: 400, top: 540, width: 260, height: 260, borderRadius: '50%', border: `6px solid ${WHITE}`, opacity: 1 - prog(t, 71.0, 71.6) }} />
      {/* 左边绒毛 */}
      <div style={{ position: 'absolute', left: 60, top: 560, width: 260, height: 220, border: `7px solid ${GOLD}`, opacity: link, boxShadow: glow(GOLD) }}>
        <div style={{ ...CN, fontSize: 44, color: GOLD, textAlign: 'center', marginTop: 70 }}>黄绒毛</div>
      </div>
      {/* 连线 */}
      <div style={{
        position: 'absolute', left: 320, top: 665, width: link * 70, height: 5,
        background: `repeating-linear-gradient(90deg, ${GOLD} 0 14px, transparent 14px 26px)`, boxShadow: glow(GOLD),
      }} />
      {/* 右边尖耳朵 */}
      <div style={{ position: 'absolute', left: 740, top: 400, opacity: prog(t, 70.6, 71.4) }}>
        <svg width="240" height="220" viewBox="0 0 240 220">
          <path d="M120 20 L212 196 L28 196 Z" fill="none" stroke={GOLD} strokeWidth={10} strokeLinejoin="round" />
        </svg>
        <div style={{ ...CN, fontSize: 44, color: GREEN, textAlign: 'center', marginTop: 6, textShadow: glow(GREEN) }}>尖耳朵</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1140, textAlign: 'center', opacity: prog(t, 71.8, 72.6) }}>
        <div style={{ ...CN, fontSize: 82, color: GREEN, textShadow: glow(GREEN) }}>行，那是猫眼</div>
      </div>
      <BigWord t={t} s={67.1} e={75.17} txt="关键就一步：看邻居" en="IT LOOKS AT ITS NEIGHBORS." y={1330} size={92} />
    </>
  );
};

/* ===== 幕10 · 每块都升级（75.3-81.8s） ===== */
const S10: React.FC<{ t: number }> = ({ t }) => {
  if (t < 75.2 || t > 82.1) return null;
  const N = 14, total = N * N;
  const lit = prog(t, 75.8, 79.2) * total;
  return (
    <>
      <div style={{
        position: 'absolute', left: '50%', top: 300, marginLeft: -(N * 70 + 13 * 7) / 2,
        display: 'grid', gridTemplateColumns: `repeat(${N}, 70px)`, gap: 7,
      }}>
        {Array.from({ length: total }).map((_, i) => {
          const on = i < lit;
          return (
            <div key={i} style={{
              width: 70, height: 70, border: `3px solid ${on ? GOLD : '#202020'}`,
              background: on ? GOLD : 'transparent', boxShadow: on ? '0 0 14px rgba(245,197,24,.6)' : 'none',
            }} />
          );
        })}
      </div>
      <BigWord t={t} s={75.4} e={81.72} txt="不再是像素，是特征" en="FROM PIXELS TO FEATURES." y={1330} size={96} />
    </>
  );
};

/* ===== 幕11 · 说人话（81.8-85.9s） ===== */
const S11: React.FC<{ t: number }> = ({ t }) => {
  if (t < 81.7 || t > 86.1) return null;
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: prog(t, 82.2, 83.0) }}>
        <div style={{ ...CN, fontSize: 110, color: WHITE, lineHeight: 1.3 }}>
          猫眼睛 · 黄绒毛 · 尖耳朵
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', opacity: prog(t, 83.6, 84.4) }}>
        <div style={{ ...CN, fontSize: 104, color: GREEN, textShadow: glow(GREEN) }}>「毛茸茸的，真可爱」</div>
      </div>
      <BigWord t={t} s={81.9} e={85.73} txt="它才答得出" en="ONLY THEN IT CAN ANSWER." color={WHITE} y={1310} size={92} />
    </>
  );
};

/* ===== 幕12 · 就这么土（85.9-94.1s） ===== */
const S12: React.FC<{ t: number }> = ({ t }) => {
  if (t < 85.7 || t > 94.2) return null;
  return (
    <>
      <CatLine t={t} w={12} op={prog(t, 86.2, 87.0)} />
      {[['切成块', GOLD], ['各自升级', GREEN], ['再拼起来', GOLD]].map(([n, c], i) => {
        const k = interpolate(t, [88.0 + i * 0.9, 88.6 + i * 0.9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
        return (
          <div key={n} style={{ position: 'absolute', left: 170 + i * 270, top: 1090, opacity: k }}>
            <div style={{ ...CN, fontSize: 62, color: c, textShadow: glow(c), whiteSpace: 'nowrap' }}>{n}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1290, textAlign: 'center', opacity: prog(t, 91.2, 92.0) }}>
        <div style={{ ...CN, fontSize: 128, color: GOLD, textShadow: glow(GOLD) }}>就这么土</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1440, textAlign: 'center', opacity: prog(t, 91.6, 92.4) }}>
        <div style={{ ...EN, fontSize: 40, color: WHITE, opacity: 0.6 }}>THAT'S ALL IT IS.</div>
      </div>
    </>
  );
};

/* ===== 幕13 · 升华：切开就没那么吓人（94.1-102.3s） ===== */
const S13: React.FC<{ t: number }> = ({ t }) => {
  if (t < 94.0) return null;
  const whole = 1 - prog(t, 95.4, 96.4);
  const cut = prog(t, 95.4, 96.4);
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1010, textAlign: 'center', opacity: prog(t, 97.4, 98.2) }}>
        <div style={{ ...CN, fontSize: 100, color: GOLD, textShadow: glow(GOLD) }}>切开，就没那么吓人了</div>
      </div>
      {/* 一整块 → 被切成 4 块 */}
      <div style={{ position: 'absolute', left: 390, top: 400, opacity: 1 - cut }}>
        <div style={{ width: 300, height: 300, border: `8px solid ${WHITE}`, borderRadius: 24 }} />
      </div>
      <div style={{ position: 'absolute', left: 340, top: 350, opacity: cut }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,160px)', gap: 8 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 160, height: 160, border: `6px solid ${GOLD}`, background: i % 3 === 0 ? GOLD : 'transparent',
              transform: `scale(${0.7 + prog(t, 96.2 + i * 0.15, 96.9 + i * 0.15) * 0.3})`,
            }} />
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center', opacity: prog(t, 99.2, 100.0) }}>
        <div style={{ ...CN, fontSize: 76, color: WHITE, opacity: 0.9 }}>图片、声音、视频，全是这一套</div>
      </div>
    </>
  );
};

/* ===== 重拍白闪（音乐 0.79s 节拍，每4拍强） ===== */
const Flash: React.FC<{ t: number }> = ({ t }) => {
  const b = t / 0.79;
  const frac = b - Math.floor(b);
  const op = frac < 0.04 ? (Math.floor(b) % 4 === 0 ? 0.34 : 0.18) * (1 - frac / 0.04) : 0;
  if (op <= 0) return null;
  return <AbsoluteFill style={{ background: WHITE, opacity: op }} />;
};

export const AIP5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* BGM: Midnight Rush (V NICO) —— 无人声，音乐当主角 */}
      <Audio src={staticFile('bgm.m4a')} volume={0.5} />
      <Stars t={t} />
      <div style={{
        position: 'absolute', left: 80, top: 250, width: 920, height: 920, borderRadius: '50%',
        background: `radial-gradient(circle, ${GOLD}16 0%, transparent 62%)`,
        opacity: 0.42 + Math.sin(t * 1.5) * 0.12,
      }} />
      <S1 t={t} /><S2 t={t} /><S3 t={t} /><S4 t={t} /><S5 t={t} /><S6 t={t} />
      <S7 t={t} /><S8 t={t} /><S9 t={t} /><S10 t={t} /><S11 t={t} /><S12 t={t} /><S13 t={t} />
      <Subtitle t={t} />
      <div style={{ position: 'absolute', right: 20, bottom: 300, opacity: 0.92 }}>
        <LaoJia side="r" delay={0} forceTalk />
      </div>
      <Flash t={t} />
    </AbsoluteFill>
  );
};