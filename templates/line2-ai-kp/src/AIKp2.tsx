import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

const GOLD = '#F5C518';
const RED = '#E5484D';
const WHITE = '#FFFFFF';
const GREY = '#6B6B6B';
const BG = '#000000';
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** 时间轴（秒）—— 红队要求：单块 ≤5 秒，无讲解空窗，金句独占结尾 */
const T = {
  cat: 0.0, grid: 3.2, fail: 9.7, cut: 14.2, patch: 22.7,
  feat: 30.7, sent: 38.2, ratio: 46.7, ask: 56.7, quote: 64.7, end: 76.0,
};
const OV = 0.3;

const CN: React.CSSProperties = {
  fontFamily: '"Microsoft YaHei","Source Han Sans SC","Noto Sans SC",sans-serif',
  fontWeight: 900, letterSpacing: 4,
};
const EN: React.CSSProperties = {
  fontFamily: 'Impact,"Arial Black",Arial,sans-serif', fontWeight: 700, letterSpacing: 4,
};

const appear = (f: number, s: number, d = 0.3) =>
  interpolate(f, [s, s + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
const pop = (f: number, s: number, amt = 1.2) =>
  interpolate(f, [s, s + 0.4], [amt, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
const wrap = (f: number, s: number, e: number) => f >= s && f < e + OV;

/** 贯穿全片的百分比计数器（单一量纲：AI 认得出来的部分） */
const Pct: React.FC<{ v: string | number; y?: number; size?: number; color?: string }> = ({
  v, y = 1180, size = 210, color = GOLD,
}) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center' }}>
    <div style={{ ...EN, fontSize: size, color, lineHeight: 1, letterSpacing: 2 }}>{v}</div>
  </div>
);

const Sub: React.FC<{ cn: string; en: string; size: number; y: number; op: number; color?: string }> = ({
  cn, en, size, y, op, color = WHITE,
}) => (
  <div style={{ position: 'absolute', left: 40, right: 40, top: y, textAlign: 'center', opacity: op }}>
    <div style={{ ...CN, fontSize: size, color, lineHeight: 1.18 }}>{cn}</div>
    <div style={{ ...EN, fontSize: Math.round(size * 0.38), color: WHITE, opacity: 0.68, marginTop: 18 }}>
      {en}
    </div>
  </div>
);

/** 幕1 · 猫脸 + 金眼睛（0-3.5s） */
const Cat: React.FC<{ f: number }> = ({ f }) => {
  if (!wrap(f, T.cat, T.grid)) return null;
  const sc = appear(f, T.cat, 0.5);
  const eye = f >= T.cat + 0.4;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: sc }}>
      <svg width="1080" height="760" style={{ position: 'absolute', left: 0, top: 380 }} viewBox="0 0 1080 760">
        {/* 三角耳 */}
        <path d="M180 300 L250 90 L400 250 Z" fill="none" stroke={WHITE} strokeWidth="14" />
        <path d="M900 300 L830 90 L680 250 Z" fill="none" stroke={WHITE} strokeWidth="14" />
        {/* 脸 */}
        <ellipse cx="540" cy="470" rx="340" ry="270" fill="none" stroke={WHITE} strokeWidth="14" />
        {/* 嘴 */}
        <path d="M430 590 Q540 660 650 590" fill="none" stroke={WHITE} strokeWidth="12" />
        <path d="M540 520 L540 590" fill="none" stroke={WHITE} strokeWidth="12" />
      </svg>
      {/* 唯一眼窝点：金眼睛 */}
      <div style={{
        position: 'absolute', left: 390, top: 640, width: 84, height: 44,
        background: GOLD, boxShadow: `0 0 90px ${GOLD}`,
        borderRadius: 42, transform: `scale(${eye ? pop(f, T.cat + 0.4, 2.2) : 0.1})`,
      }} />
      <div style={{
        position: 'absolute', left: 606, top: 640, width: 84, height: 44,
        background: GOLD, boxShadow: `0 0 90px ${GOLD}`,
        borderRadius: 42, transform: `scale(${eye ? pop(f, T.cat + 0.55, 2.2) : 0.1})`,
      }} />
      <Pct v="100%" y={1240} />
      <Sub cn="你天天说「让AI看图」" en="YOU ASK AI TO SEE" size={100} y={1420} op={appear(f, T.cat + 0.2, 0.3)} />
    </div>
  );
};

/** 幕2 · 裂成网格，计数器爬到 150,000（3.2-10s） */
const Grid: React.FC<{ f: number }> = ({ f }) => {
  if (!wrap(f, T.grid, T.fail)) return null;
  const N = 26;
  const count = interpolate(f, [T.grid + 0.4, T.fail - 0.4], [0, 150000], { easing: EASE });
  const spread = appear(f, T.grid, 0.6);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{
        position: 'absolute', left: '50%', top: 420, marginLeft: -(N * 40) / 2,
        display: 'grid', gridTemplateColumns: `repeat(${N}, 34px)`, gap: 6, opacity: spread,
      }}>
        {Array.from({ length: N * N }).map((_, i) => (
          <div key={i} style={{
            width: 34, height: 34,
            background: i % 7 === 0 ? GOLD : (i % 5 === 0 ? '#2a2a2a' : '#1a1a1a'),
          }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1230, textAlign: 'center' }}>
        <div style={{ ...EN, fontSize: 150, color: GOLD, lineHeight: 1 }}>
          {Math.round(count).toLocaleString()}
        </div>
      </div>
      <Sub cn="一张猫图，AI 收到的是十五万个数" en="ONE CAT PHOTO = 150,000 NUMBERS" size={94} y={1430} op={appear(f, T.grid + 0.6, 0.3)} />
    </div>
  );
};

/** 幕3 · 红色✗ 砸下，比例归零（9.7-14.5s）—— 红队：压到3秒，一帧爆点 */
const Fail: React.FC<{ f: number }> = ({ f }) => {
  if (!wrap(f, T.fail, T.cut)) return null;
  const drop = appear(f, T.fail, 0.28);
  const num = interpolate(f, [T.fail + 0.3, T.fail + 0.7], [100, 0], { easing: EASE });
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{
        position: 'absolute', left: '50%', top: 560, marginLeft: -170,
        fontSize: 340, color: RED, fontWeight: 900, fontFamily: '"Microsoft YaHei",sans-serif',
        opacity: drop, transform: `scale(${pop(f, T.fail, 2.4)}) rotate(${interpolate(f, [T.fail, T.fail + 0.3], [18, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE })}deg)`,
        textShadow: `0 0 120px ${RED}`,
      }}>✗</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1200, textAlign: 'center' }}>
        <div style={{ ...EN, fontSize: 210, color: RED, lineHeight: 1 }}>{Math.round(num)}%</div>
      </div>
      <Sub cn="一个数，它认不出" en="A SINGLE NUMBER MEANS NOTHING" size={100} y={1450} op={appear(f, T.fail + 0.5, 0.3)} />
    </div>
  );
};

/** 幕4 · 切成 14×14=196 块（14.2-23s）+ 硬公式 */
const Cut: React.FC<{ f: number }> = ({ f }) => {
  if (!wrap(f, T.cut, T.patch)) return null;
  const line = interpolate(f, [T.cut + 0.2, T.cut + 1.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const N = 14;
  const on = appear(f, T.cut + 0.2, 0.4);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{
        position: 'absolute', left: '50%', top: 420, marginLeft: -((N * 74) + 13 * 8) / 2,
        display: 'grid', gridTemplateColumns: `repeat(${N}, 74px)`, gap: 8,
        opacity: on * line, transform: `scale(${pop(f, T.cut + 0.2, 1.3)})`,
      }}>
        {Array.from({ length: N * N }).map((_, i) => (
          <div key={i} style={{
            width: 74, height: 74, border: '3px solid #2e2e2e',
            background: i % 11 === 0 ? GOLD : 'transparent',
          }} />
        ))}
      </div>
      {/* 切割金线 */}
      <div style={{
        position: 'absolute', left: 40, top: 420 + line * 1030, width: 1000, height: 5,
        background: GOLD, boxShadow: `0 0 60px ${GOLD}`, opacity: interpolate(f, [T.cut + 0.2, T.cut + 1.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * (1 - line * 0.85),
      }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1660, textAlign: 'center', opacity: appear(f, T.cut + 1.6, 0.3) }}>
        <div style={{ ...EN, fontSize: 68, color: GOLD, letterSpacing: 4 }}>196 × 768 = 150,528</div>
        <div style={{ ...EN, fontSize: 28, color: WHITE, opacity: 0.5, marginTop: 14, letterSpacing: 3 }}>
          196 PATCHES × 768 NUMBERS
        </div>
      </div>
      <Sub cn="那就切碎。横十四竖十四，196块，每块768个数" en="196 PATCHES. 768 NUMBERS EACH." size={82} y={1230} op={appear(f, T.cut + 0.8, 0.3)} />
    </div>
  );
};

/** 幕5 · 这块不够，它去抠旁边那块（22.7-31s） */
const Patch: React.FC<{ f: number }> = ({ f }) => {
  if (!wrap(f, T.patch, T.feat)) return null;
  const reach = interpolate(f, [T.patch + 0.8, T.patch + 2.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const sc = pop(f, T.patch, 1.5);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{
        position: 'absolute', left: 200, top: 620, width: 300, height: 300,
        background: '#141414', border: `6px solid ${GOLD}`, transform: `scale(${sc})`,
      }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 120, height: 120, marginLeft: -60, marginTop: -60, borderRadius: '50%', border: `6px solid ${GREY}` }} />
      </div>
      <div style={{
        position: 'absolute', left: 620, top: 900, fontSize: 150, color: RED,
        fontWeight: 900, fontFamily: '"Microsoft YaHei",sans-serif', opacity: appear(f, T.patch + 0.5, 0.3),
      }}>?</div>
      {/* 金虚线连向邻居 */}
      <div style={{
        position: 'absolute', left: 500, top: 770, width: reach * 330, height: 4,
        background: `repeating-linear-gradient(90deg, ${GOLD} 0 14px, transparent 14px 26px)`,
        boxShadow: `0 0 40px ${GOLD}`,
      }} />
      <div style={{
        position: 'absolute', left: 500 + reach * 330, top: 690, width: 180, height: 180,
        border: `6px solid ${GOLD}`, opacity: reach,
      }} />
      <div style={{ position: 'absolute', left: 830, top: 1300, opacity: reach }}>
        <div style={{ ...CN, fontSize: 52, color: GOLD }}>黄绒毛</div>
        <div style={{ ...CN, fontSize: 52, color: GOLD, marginTop: 14 }}>尖耳朵</div>
      </div>
      <Sub cn="这块不够，它去抠旁边那块" en="NOT ENOUGH. IT LOOKS AT THE NEIGHBOR." size={96} y={1080} op={appear(f, T.patch + 1.2, 0.3)} />
    </div>
  );
};

/** 幕6 · 196格逐格亮起（30.7-38.5s）—— 红队：压到4秒，每4格一爆点，共7爆点 */
const Feat: React.FC<{ f: number }> = ({ f }) => {
  if (!wrap(f, T.feat, T.sent)) return null;
  const N = 14, total = N * N;
  const lit = interpolate(f, [T.feat + 0.1, T.feat + 4.0], [0, total], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const blast = [0.28, 0.85, 1.42, 2.0, 2.57, 3.14, 3.71];
  const step = Math.floor(lit / (total / 7));
  let blastOn = 0;
  for (let i = 0; i < blast.length; i++) {
    const d = f - (T.feat + blast[i]);
    if (d >= 0 && d < 0.1) blastOn = 0.45 * (1 - d / 0.1);
  }
  const pct = [8, 23, 41, 56, 68, 84, 96][Math.min(step, 6)];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{
        position: 'absolute', left: '50%', top: 360, marginLeft: -(N * 60 + 13 * 6) / 2,
        display: 'grid', gridTemplateColumns: `repeat(${N}, 60px)`, gap: 6,
      }}>
        {Array.from({ length: total }).map((_, i) => {
          const on = i < lit;
          const isNew = Math.floor(i) === Math.floor(lit) - 1;
          return (
            <div key={i} style={{
              width: 60, height: 60, border: `3px solid ${on ? GOLD : '#242424'}`,
              background: on ? GOLD : 'transparent',
              boxShadow: on ? `0 0 26px ${GOLD}88` : 'none',
              transform: isNew ? `scale(${1 + blastOn * 1.6})` : 'none',
            }} />
          );
        })}
      </div>
      <Sub cn="每一块都升了级：不再是像素，是特征" en="PIXELS → FEATURES" size={86} y={1260} op={appear(f, T.feat + 0.2, 0.3)} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1600, textAlign: 'center' }}>
        <div style={{ ...EN, fontSize: 120, color: GOLD, lineHeight: 1 }}>{pct}%</div>
      </div>
    </div>
  );
};

/** 幕7 · 196块收成一句话（38.2-47s） */
const Sent: React.FC<{ f: number }> = ({ f }) => {
  if (!wrap(f, T.sent, T.ratio)) return null;
  const gather = appear(f, T.sent, 0.8);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: gather }}>
      <div style={{
        position: 'absolute', left: 120, right: 120, top: 620, textAlign: 'center',
        transform: `scale(${pop(f, T.sent, 1.2)})`,
      }}>
        <div style={{ ...CN, fontSize: 124, color: GOLD, lineHeight: 1.3 }}>
          这只猫：
          <br />猫眼 · 黄绒毛 · 尖耳朵
        </div>
      </div>
      <Sub cn="196块，最后变成一句话" en="196 PATCHES BECOME ONE SENTENCE" size={90} y={1290} op={appear(f, T.sent + 1.0, 0.4)} />
    </div>
  );
};

/** 幕8 · 100% 暴跌到 0.1%（46.7-57s） */
const Ratio: React.FC<{ f: number }> = ({ f }) => {
  if (!wrap(f, T.ratio, T.ask)) return null;
  const v = interpolate(f, [T.ratio + 0.4, T.ratio + 2.4], [100, 0.1], { extrapolateRight: 'clamp', easing: EASE });
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 780, textAlign: 'center' }}>
        <div style={{ ...EN, fontSize: 260, color: v < 10 ? RED : GOLD, lineHeight: 1 }}>
          {v >= 10 ? Math.round(v) : v.toFixed(1)}%
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1130, textAlign: 'center' }}>
        <div style={{ ...CN, fontSize: 84, color: WHITE }}>你看到 100%　AI 用到 {v >= 10 ? Math.round(v) : v.toFixed(1)}%</div>
      </div>
      <Sub cn="它一个像素都没瞧见" en="NOT ONE PIXEL" size={86} y={1330} color={RED} op={appear(f, T.ratio + 2.4, 0.4)} />
    </div>
  );
};

/** 幕9 · 提问（56.7-65s）—— 红队：提问提前，别抢金句的落点 */
const Ask: React.FC<{ f: number }> = ({ f }) => {
  if (!wrap(f, T.ask, T.quote)) return null;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 90, right: 90, top: 760, textAlign: 'center', transform: `scale(${pop(f, T.ask, 1.15)})` }}>
        <div style={{ ...CN, fontSize: 104, color: WHITE, lineHeight: 1.4 }}>
          你手上那件
          <br />最不敢开始的事
        </div>
      </div>
      <div style={{ position: 'absolute', left: 90, right: 90, top: 1180, textAlign: 'center', opacity: appear(f, T.ask + 0.8, 0.4) }}>
        <div style={{ ...CN, fontSize: 96, color: GOLD, lineHeight: 1.4 }}>
          切成196块
          <br />第一块是什么？
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1520, textAlign: 'center', opacity: appear(f, T.ask + 1.4, 0.4) }}>
        <div style={{ ...EN, fontSize: 38, color: WHITE, opacity: 0.6, letterSpacing: 4 }}>
          WHAT&apos;S YOUR FIRST PATCH?
        </div>
      </div>
    </div>
  );
};

/** 幕10 · 金句独占 11 秒（64.7-76s）—— 红队：转发理由是金句，不是评论诱饵 */
const Quote: React.FC<{ f: number }> = ({ f }) => {
  if (!wrap(f, T.quote, T.end)) return null;
  const sc = interpolate(f, [T.quote, T.quote + 0.6], [1.5, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  return (
    <div style={{ position: 'absolute', inset: 0, textAlign: 'center', transform: `scale(${sc})` }}>
      <div style={{ position: 'absolute', left: 70, right: 70, top: 820 }}>
        <div style={{ ...CN, fontSize: 150, color: GOLD, lineHeight: 1.3 }}>
          难的不是它
          <br />是你还没下刀
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1300, opacity: appear(f, T.quote + 0.6, 0.5) }}>
        <div style={{ ...EN, fontSize: 42, color: WHITE, opacity: 0.62, letterSpacing: 4 }}>
          THE HARD PART ISN&apos;T AI. YOU HAVEN&apos;T CUT YET.
        </div>
      </div>
      {/* 收尾视觉：金线 + 系列卡，避免下半屏空黑 */}
      <div style={{ position: 'absolute', left: 200, right: 200, top: 1460, height: 3, background: GOLD, boxShadow: `0 0 40px ${GOLD}`, opacity: appear(f, T.quote + 1.2, 0.5) }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1560, textAlign: 'center', opacity: appear(f, T.quote + 1.6, 0.5) }}>
        <div style={{ ...CN, fontSize: 54, color: GREY }}>AI 科普 · 第1集</div>
        <div style={{ ...EN, fontSize: 32, color: WHITE, opacity: 0.4, marginTop: 20, letterSpacing: 3 }}>
          NEXT: WHY 768 NUMBERS IS ENOUGH
        </div>
      </div>
    </div>
  );
};

const Flash: React.FC<{ beats: number[]; f: number }> = ({ beats, f }) => {
  for (const b of beats) {
    const d = f - b;
    if (d >= 0 && d < 0.07) return <AbsoluteFill style={{ background: WHITE, opacity: 0.45 * (1 - d / 0.07) }} />;
  }
  return null;
};

export const AIKp2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame / fps;
  const BEATS = [0.4, 3.2, 9.7, 14.2, 22.7, 30.7, 38.2, 46.7, 56.7, 64.7];

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Cat f={f} />
      <Grid f={f} />
      <Fail f={f} />
      <Cut f={f} />
      <Patch f={f} />
      <Feat f={f} />
      <Sent f={f} />
      <Ratio f={f} />
      <Ask f={f} />
      <Quote f={f} />
      <Flash beats={BEATS} f={f} />
    </AbsoluteFill>
  );
};