import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, staticFile, Audio, Sequence } from 'remotion';

// 竖屏科普EP02《大模型是如何思考的》1080x1920 · 6幕 · 50.41s · 动效v2
// 动效要点：全片easeOutBack弹入 / 幕间白闪+zoom冲击 / 屏幕震动 /
//           幕3老虎机跳动开奖+抛物线飞出 / 注意力连线描画+光点跑 / 关键词卡配音重音
const BG_LIGHT = '#F5F7FA';
const BG_DARK = '#050B18';
const NAVY = '#0A2540';
const BLUE = '#0A84FF';
const GOLD = '#FFB800';
const RED = '#FF3B30';
const GREEN = '#34C759';
const GREY = '#8E9AAB';
const LINE_SOFT = '#C9D8EA';
const PUPIL = '#0a0a12';

const FONT = '"Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", sans-serif';

const F = [0, 262, 521, 736, 993, 1270];
const TOTAL = 1512;

const VSCRIPT = [
  '你问它一个问题，它一个字一个字往外蹦。你以为它在思考？不，它只是在猜——猜下一个字。',
  '你打的每个字，都会被切成一小块一小块，这叫token。在它眼里，你的话不是句子，是一堆积木。',
  '每切完一块，它就开一次抽奖：几万个候选字排队，概率最高的那个中奖，被蹦出来。',
  '抽奖不是瞎抽。每个字出来前，它会回头看整句话——谁跟谁挨着，谁指谁，这叫注意力。',
  '但抽奖会出错。猜错一个字，后面全歪，它还一本正经继续编。你看到的胡说八道，就是这么来的。',
  '所以大模型从不思考——它是全世界最快的猜字机，每秒猜几百次，猜出了以假乱真的聪明。',
];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ez = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
const at = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
// easeOutBack：带 8% 过冲的弹入（告别PPT淡入）
const back = (t: number) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c1 = 1.70158, c3 = c1 + 1, x = t - 1;
  return 1 + c3 * x * x * x + c1 * x * x;
};
const pop = (f: number, a: number, d = 14) => back(clamp01((f - a) / d));
// 屏幕/局部震动
const sh = (f: number, a: number, d = 16, mag = 9) =>
  f < a || f > a + d ? 0 : mag * (1 - (f - a) / d) * Math.sin((f - a) * 1.8);
// 元素弹入组合（SVG用）：opacity + 位移 + 以(cx,cy)为中心缩放
const popT = (f: number, a: number, cx: number, cy: number, d = 14, dist = 30) => {
  const p = pop(f, a, d);
  return {
    o: clamp01((f - a) / 6),
    tr: `translate(0 ${(1 - p) * dist}) translate(${cx} ${cy}) scale(${0.72 + 0.28 * p}) translate(${-cx} ${-cy})`,
  };
};

// 三次贝塞尔取点（注意力光点沿弧跑）
const bez = (t: number, p0: number[], p1: number[], p2: number[], p3: number[]): [number, number] => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};

// 白幕漂浮粒子（让画面永远在动）
const PaperDots: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {Array.from({ length: 16 }, (_, i) => {
      const bx = ((i * 173) % 1000) + 40;
      const by = ((i * 331) % 1700) + 80;
      const r = 7 + (i % 4) * 5;
      const dy = Math.sin(f * 0.02 + i * 1.7) * 26;
      const dx = Math.cos(f * 0.015 + i * 2.3) * 18;
      return <circle key={i} cx={bx + dx} cy={by + dy} r={r} fill={LINE_SOFT} opacity={0.22} />;
    })}
    <circle cx={540} cy={900} r={430 + Math.sin(f * 0.03) * 10} fill="none" stroke={LINE_SOFT} strokeWidth={2} opacity={0.3} />
    <circle cx={540} cy={900} r={330 + Math.cos(f * 0.025) * 10} fill="none" stroke={LINE_SOFT} strokeWidth={2} opacity={0.22} />
  </g>
);

/* ---------------- 幕1：打字机悬念（砸落+碎屑+震动） ---------------- */
const Scene1: React.FC<{ f: number }> = ({ f }) => {
  const q = popT(f, 6, 460, 435, 16, -50);
  const answer = '我是人工智能。';
  const nCh = Math.min(answer.length, Math.floor(at(f, 40, 148) * answer.length + 0.001));
  const cursorOn = f < 156 ? Math.sin(f * 0.35) > -0.2 : false;
  const bubble = popT(f, 36, 620, 615, 14, 40);
  const SLAM = 168, LAND = 186;
  const slam = at(f, SLAM, LAND);
  const slamE = ez(slam);
  const dropY = (1 - slamE) * -1150;
  const squash = slam > 0.55 && slam < 0.82 ? 1 - 0.24 * Math.sin(((slam - 0.55) / 0.27) * Math.PI) : 1;
  const ringP = at(f, LAND, LAND + 30);
  const sx = sh(f, LAND, 16, 13), sy = sh(f, LAND + 3, 14, 9);
  const note = popT(f, 206, 540, 1200, 16, 50);
  const glow = 0.16 + 0.06 * Math.sin(f * 0.08);
  return (
    <AbsoluteFill style={{ backgroundColor: BG_DARK }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB800" stopOpacity={glow} />
            <stop offset="100%" stopColor="#FFB800" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={540} cy={780} rx={520} ry={420} fill="url(#g1)" />
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={i} cx={((i * 211) % 1000) + 40} cy={((i * 419) % 1750) + 60}
            r={2 + (i % 3)} fill={GOLD} opacity={0.18 + 0.14 * Math.sin(f * 0.06 + i * 2.1)} />
        ))}
        <g transform={`translate(${sx} ${sy})`}>
          <g opacity={q.o} transform={q.tr}>
            <rect x={150} y={380} width={620} height={110} rx={55} fill="#FFFFFF" opacity={0.1} />
            <text x={460} y={450} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={700} fill="#FFFFFF" opacity={0.85}>
              大模型到底是怎么思考的？
            </text>
            <path d="M330 485 l 0 46 l 42 -46 z" fill="#FFFFFF" opacity={0.1} />
          </g>
          {nCh > 0 ? (
            <g opacity={bubble.o} transform={bubble.tr}>
              <rect x={310} y={560} width={620} height={110} rx={55} fill={GOLD} opacity={0.16} />
              <text x={620} y={632} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={700} fill={GOLD}>
                {answer.slice(0, nCh)}
                {cursorOn ? '▌' : ''}
              </text>
            </g>
          ) : null}
          {/* 巨字"猜"砸落 */}
          {slam > 0 ? (
            <g transform={`translate(540 ${980 + dropY}) scale(${(0.4 + 0.6 * slamE) * 1.02} ${squash * (0.4 + 0.6 * slamE)})`}>
              <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={420} fontWeight={900} fill={GOLD}
                style={{ textShadow: '0 0 60px rgba(255,184,0,0.5)' }}>猜</text>
            </g>
          ) : null}
          {/* 落地碎屑 */}
          {f >= LAND && f < LAND + 34 ? (
            <>
              {Array.from({ length: 10 }, (_, i) => {
                const p = clamp01((f - LAND) / 34);
                const ang = (Math.PI * 2 * i) / 10 + 0.35;
                const d = 200 + (i % 3) * 130;
                const px = 540 + Math.cos(ang) * d * ez(p);
                const py = 1010 + Math.sin(ang) * d * 0.55 * ez(p) + 90 * p * p;
                return <rect key={i} x={px} y={py} width={26 * (1 - p * 0.6)} height={26 * (1 - p * 0.6)}
                  fill={GOLD} opacity={(1 - p) * 0.9} transform={`rotate(${i * 36 + p * 220} ${px} ${py})`} />;
              })}
              <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={0.3 * (1 - clamp01((f - LAND) / 8))} />
            </>
          ) : null}
          {ringP > 0 && ringP < 1 ? (
            <>
              <circle cx={540} cy={980} r={120 + 430 * ez(ringP)} fill="none" stroke={GOLD} strokeWidth={10 * (1 - ringP)} opacity={0.7 * (1 - ringP)} />
              <circle cx={540} cy={980} r={80 + 310 * ez(ringP)} fill="none" stroke="#FFFFFF" strokeWidth={5 * (1 - ringP)} opacity={0.4 * (1 - ringP)} />
            </>
          ) : null}
          <g opacity={note.o} transform={note.tr}>
            <text x={540} y={1210} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={800} fill="#FFFFFF">
              不是思考，是<tspan fill={GOLD}>猜字</tspan>
            </text>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- 幕2：token切块（整句飞入→切刀白闪→积木弹出+浮动） ---------------- */
const TOKENS2 = ['今天', '天气', '真', '好', '，', '适合', '出门'];
const Scene2: React.FC<{ f: number }> = ({ f }) => {
  const whole = popT(f, 4, 540, 700, 16, -60);
  const splitA = 60;
  const splitOut = 1 - clamp01((f - splitA) / 12);
  const cut = at(f, splitA - 6, splitA + 8);
  const ring = popT(f, 112, 540, 950, 18, 40);
  const note = popT(f, 200, 540, 1180, 16, 50);
  return (
    <AbsoluteFill style={{ backgroundColor: BG_LIGHT }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <PaperDots f={f} />
        <g opacity={whole.o * splitOut} transform={whole.tr}>
          <text x={540} y={700} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={800} fill={NAVY}>
            今天天气真好，适合出门
          </text>
        </g>
        {/* 切割白光 */}
        {cut > 0 && cut < 1 ? (
          <rect x={60} y={598} width={960 * ez(cut)} height={6} fill="#FFFFFF" opacity={0.9 * (1 - Math.abs(cut - 0.5) * 2)} />
        ) : null}
        {TOKENS2.map((tk, i) => {
          const a = splitA + i * 5;
          const p = pop(f, a, 16);
          if (p <= 0.001) return null;
          const bx = 540 - (TOKENS2.length * 130 + (TOKENS2.length - 1) * 22) / 2 + i * 152;
          const baseY = 640 + (i % 2 === 0 ? 0 : 36);
          const bobY = Math.sin(f * 0.08 + i * 1.4) * 7;
          const rot = (i % 2 === 0 ? -1 : 1) * 4;
          const col = i % 3 === 0 ? GOLD : i % 3 === 1 ? BLUE : GREEN;
          const cx = bx + 65, cy = baseY + 50 + bobY;
          return (
            <g key={i} opacity={clamp01((f - a) / 5)}
              transform={`translate(0 ${(1 - p) * -46}) translate(${cx} ${cy}) rotate(${rot * p}) scale(${0.55 + 0.45 * p}) translate(${-cx} ${-cy})`}>
              <rect x={bx} y={baseY + bobY} width={130} height={100} rx={18} fill="#FFFFFF" stroke={col} strokeWidth={4} />
              <text x={bx + 65} y={baseY + 64 + bobY} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={col}>{tk}</text>
            </g>
          );
        })}
        <g opacity={ring.o} transform={ring.tr}>
          <circle cx={540} cy={950} r={88} fill="none" stroke={GOLD} strokeWidth={5}
            strokeDasharray={`${2 * Math.PI * 88 * 0.32} ${2 * Math.PI * 88}`} strokeDashoffset={-(f / 60) * 2 * Math.PI * 88} />
          <text x={540} y={940} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={GOLD}>token</text>
          <text x={540} y={988} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={GREY}>词元 · 积木块</text>
        </g>
        <g opacity={note.o} transform={note.tr}>
          <text x={540} y={1180} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={800} fill={NAVY}>
            它眼里没有句子，只有<tspan fill={GOLD}>一堆积木</tspan>
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- 幕3：老虎机开奖（跳动高亮→停→爆环→抛物线飞出+滚数） ---------------- */
const CANDS = [
  { ch: '的', p: 38 }, { ch: '了', p: 22 }, { ch: '好', p: 15 }, { ch: '是', p: 9 }, { ch: '在', p: 6 },
];
const Scene3: React.FC<{ f: number }> = ({ f }) => {
  const cue = popT(f, 6, 540, 420, 16, -50);
  const JUMP_A = 55, STOP = 125, FLY_A = 140;
  const jumping = f < STOP && f >= JUMP_A;
  const active = f < JUMP_A ? -1 : jumping ? Math.floor((f - JUMP_A) / 7) % CANDS.length : 0;
  const burst = at(f, STOP, STOP + 30);
  const fly = pop(f, FLY_A, 32);
  const flyP = clamp01((f - FLY_A) / 32);
  const note = popT(f, 168, 540, 1220, 16, 50);
  const shakeOn = f >= STOP && f < STOP + 12;
  const sx = shakeOn ? sh(f, STOP, 12, 7) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG_LIGHT }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <PaperDots f={f} />
        <g transform={`translate(${sx} 0)`}>
          <g opacity={cue.o} transform={cue.tr}>
            <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={800} fill={NAVY}>
              今天天气真 ___
            </text>
          </g>
          {/* 抽奖机外框 */}
          <g opacity={clamp01((f - 14) / 10)}>
            <rect x={110} y={470} width={680} height={640} rx={32} fill="#FFFFFF" stroke={LINE_SOFT} strokeWidth={4} opacity={0.9} />
            <text x={450} y={515} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={700} fill={GREY} opacity={clamp01((f - 30) / 12)}>下一字概率 · NEXT TOKEN</text>
          </g>
          {CANDS.map((c, i) => {
            const a = 18 + i * 7;
            const rowP = pop(f, a, 15);
            if (rowP <= 0.001) return null;
            const y = 570 + i * 108;
            const isWinner = i === 0;
            const hl = active === i;
            const barP = back(clamp01((f - (30 + i * 7)) / 34));
            const shown = Math.round(c.p * clamp01((f - (30 + i * 7)) / 34));
            const bump = hl ? 1.12 : 1;
            const cx = 200, cy = y;
            return (
              <g key={i} opacity={clamp01((f - a) / 5)}
                transform={`translate(${-40 * (1 - rowP)}) translate(${cx} ${cy}) scale(${bump}) translate(${-cx} ${-cy})`}>
                <circle cx={cx} cy={cy} r={46} fill="#FFFFFF" stroke={hl || (isWinner && !jumping) ? GOLD : LINE_SOFT}
                  strokeWidth={hl || (isWinner && !jumping) ? 6 : 3} />
                <text x={cx} y={cy + 16} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={800}
                  fill={hl || (isWinner && !jumping) ? GOLD : NAVY}>{c.ch}</text>
                <rect x={300} y={y - 22} width={340} height={44} rx={22} fill="#E9EFF6" />
                <rect x={300} y={y - 22} width={340 * (c.p / 38) * barP} height={44} rx={22} fill={isWinner ? GOLD : LINE_SOFT} />
                <text x={680} y={y + 12} fontFamily={FONT} fontSize={34} fontWeight={700} fill={isWinner ? GOLD : GREY}>{shown}%</text>
              </g>
            );
          })}
          {/* 开奖爆环 */}
          {burst > 0 && burst < 1 ? (
            <>
              <circle cx={200} cy={570} r={60 + 300 * ez(burst)} fill="none" stroke={GOLD} strokeWidth={14 * (1 - burst)} opacity={0.85 * (1 - burst)} />
              <rect x={0} y={0} width={1080} height={1920} fill={GOLD} opacity={0.14 * (1 - Math.abs(burst - 0.25) * 3)} />
            </>
          ) : null}
          {/* 胜者抛物线飞到中央 */}
          {flyP > 0 ? (
            <g transform={`translate(${200 + (540 - 200) * fly} ${570 + (940 - 570) * fly - 150 * Math.sin(Math.PI * fly)})
                rotate(${fly * 400}) scale(${1 + 1.5 * fly})`}>
              <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={92} fontWeight={900} fill={GOLD}
                style={{ textShadow: '0 0 36px rgba(255,184,0,0.4)' }}>好</text>
            </g>
          ) : null}
          {/* 中央落地脉冲 */}
          {flyP >= 1 ? (
            <g opacity={clamp01((f - (FLY_A + 32)) / 8) * (0.75 + 0.25 * Math.sin((f - FLY_A) * 0.25))}>
              <circle cx={540} cy={940} r={110} fill="none" stroke={GOLD} strokeWidth={5} opacity={0.6} />
            </g>
          ) : null}
          <g opacity={note.o} transform={note.tr}>
            <text x={540} y={1220} textAnchor="middle" fontFamily={FONT} fontSize={50} fontWeight={800} fill={NAVY}>
              几万个候选，<tspan fill={GOLD}>概率最高</tspan>的中奖
            </text>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- 幕4：注意力（词弹入→连线画出+光点跑→盖章） ---------------- */
const SENT4 = ['小猫', '追', '老鼠', '，', '它', '跑得', '真快'];
const Scene4: React.FC<{ f: number }> = ({ f }) => {
  const wordW = 128, wg = 18;
  const totW = SENT4.length * wordW + (SENT4.length - 1) * wg;
  const x0 = 540 - totW / 2;
  const cxi = (i: number) => x0 + i * (wordW + wg) + wordW / 2;
  const LOOK_A = 85, DRAW = 26, LOOK2_A = 112;
  const p1 = clamp01((f - LOOK_A) / DRAW);
  const p2 = ez(at(f, LOOK2_A, LOOK2_A + 26));
  // 主弧：它(idx4)→小猫(idx0)
  const A0: [number, number] = [cxi(4), 690], A1: [number, number] = [cxi(4), 515];
  const A2: [number, number] = [cxi(0), 515], A3: [number, number] = [cxi(0), 690];
  const dot = bez(clamp01(p1 * 1.05), A0, A1, A2, A3);
  const ask = popT(f, 96, cxi(4), 560, 14, 26);
  const stamp = pop(f, 145, 18);
  const note = popT(f, 200, 540, 1220, 16, 50);
  const stShake = f >= 145 && f < 158 ? sh(f, 145, 13, 8) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG_LIGHT }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <PaperDots f={f} />
        {SENT4.map((w, i) => {
          const a = 4 + i * 6;
          const p = pop(f, a, 15);
          if (p <= 0.001) return null;
          const isIt = i === 4;
          const dim = p1 > 0.3 && i === 2 ? 0.45 : 1;
          const cx = x0 + i * (wordW + wg) + wordW / 2, cy = 748;
          return (
            <g key={i} opacity={clamp01((f - a) / 5) * dim}
              transform={`translate(0 ${(1 - p) * -40}) translate(${cx} ${cy}) scale(${0.6 + 0.4 * p}) translate(${-cx} ${-cy})`}>
              <rect x={x0 + i * (wordW + wg)} y={700} width={wordW} height={96} rx={16}
                fill={isIt ? NAVY : '#FFFFFF'} stroke={isIt ? NAVY : LINE_SOFT} strokeWidth={3} />
              <text x={cx} y={762} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800}
                fill={isIt ? GOLD : NAVY}>{w}</text>
            </g>
          );
        })}
        {/* 主弧描画 + 光点 */}
        {p1 > 0.01 ? (
          <g>
            <path d={`M ${A0} C ${A1} ${A2} ${A3}`} fill="none" stroke={GOLD} strokeWidth={6}
              pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ez(p1)} />
            {p1 < 1 ? <circle cx={dot[0]} cy={dot[1]} r={13} fill={GOLD} stroke="#FFFFFF" strokeWidth={4} /> : null}
          </g>
        ) : null}
        {/* 次弧虚线 */}
        {p2 > 0.01 ? (
          <g opacity={p2 * 0.55}>
            <path d={`M ${cxi(4)} 700 C ${cxi(4)} 585, ${cxi(2)} 585, ${cxi(2)} 700`} fill="none" stroke={GREY} strokeWidth={4} strokeDasharray="12 10" />
          </g>
        ) : null}
        <g opacity={ask.o} transform={ask.tr}>
          <text x={cxi(4)} y={545} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={700} fill={GOLD}>“它”是谁？</text>
        </g>
        {/* 盖章 */}
        {stamp > 0.001 ? (
          <g transform={`translate(${stShake} 0) translate(${cxi(0)} 470) rotate(${(1 - stamp) * -12}) scale(${0.4 + 0.6 * stamp}) translate(${-cxi(0)} -470)`}>
            <text x={cxi(0)} y={470} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GREEN}>是小猫！</text>
            <rect x={cxi(0) - 90} y={430} width={180} height={54} rx={12} fill="none" stroke={GREEN} strokeWidth={4} opacity={0.7} />
          </g>
        ) : null}
        <g opacity={note.o} transform={note.tr}>
          <text x={540} y={1220} textAnchor="middle" fontFamily={FONT} fontSize={50} fontWeight={800} fill={NAVY}>
            谁挨着谁、谁指谁 —— <tspan fill={GOLD}>注意力</tspan>
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- 幕5：幻觉翻车（链条弹入→错字红闪震动→歪链→标题砸落） ---------------- */
const CHAIN5 = [
  { w: '珠峰', ok: true }, { w: '高度', ok: true }, { w: '是', ok: true },
  { w: '8848', ok: true }, { w: '米', ok: true }, { w: '，', ok: true },
  { w: '位于', ok: true }, { w: '月球', ok: false },
];
const Scene5: React.FC<{ f: number }> = ({ f }) => {
  const errAt = 50;
  const wrong = f >= errAt;
  const redF = interpolate(f, [errAt, errAt + 8, errAt + 20, errAt + 30], [0, 0.13, 0.04, 0.1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const errShake = f >= errAt && f < errAt + 18 ? sh(f, errAt, 18, 11) : 0;
  const derail = popT(f, 70, 540, 855, 16, 50);
  const title = pop(f, 100, 18);
  const titleShake = f >= 100 && f < 114 ? sh(f, 100, 14, 9) : 0;
  const wordW = 118, wg = 14;
  const totW = CHAIN5.length * wordW + (CHAIN5.length - 1) * wg;
  const x0 = 540 - totW / 2;
  return (
    <AbsoluteFill style={{ backgroundColor: BG_LIGHT }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <PaperDots f={f} />
        <g transform={`translate(${errShake} ${errShake * 0.5})`}>
          {CHAIN5.map((t, i) => {
            const a = 4 + i * 7;
            const p = pop(f, a, 15);
            if (p <= 0.001) return null;
            const isBad = !t.ok && wrong;
            const cx = x0 + i * (wordW + wg) + wordW / 2;
            const jitter = isBad ? Math.sin(f * 1.2) * 4 : 0;
            const stampBad = isBad ? Math.min(1, (f - errAt) / 10) : 1;
            return (
              <g key={i} opacity={clamp01((f - a) / 5)}
                transform={`translate(0 ${(1 - p) * -40}) translate(${cx} 686) scale(${(0.6 + 0.4 * p) * (isBad ? 1 + (1 - stampBad) * 0.35 : 1)}) translate(${-cx} -686)`}>
                <g transform={`translate(${jitter} 0)`}>
                  <rect x={x0 + i * (wordW + wg)} y={640} width={wordW} height={92} rx={14}
                    fill={isBad ? '#FFE5E3' : '#FFFFFF'} stroke={isBad ? RED : LINE_SOFT} strokeWidth={isBad ? 5 : 3} />
                  <text x={cx} y={700} textAnchor="middle" fontFamily={FONT} fontSize={isBad ? 34 : 36} fontWeight={800}
                    fill={isBad ? RED : NAVY}>{t.w}</text>
                  {isBad ? (
                    <text x={cx} y={616} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={RED}
                      opacity={stampBad}>✗</text>
                  ) : null}
                </g>
              </g>
            );
          })}
        </g>
        {wrong ? (
          <g opacity={derail.o} transform={derail.tr}>
            <g transform={`rotate(${3 * Math.sin(f * 0.22)} 540 850)`}>
              <text x={540} y={870} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={700} fill={RED} opacity={0.85}>
                → 嫦娥住在背面 → 兔子捣药 → 广寒宫房价……
              </text>
            </g>
          </g>
        ) : null}
        {/* 标题砸落 */}
        {title > 0.001 ? (
          <g transform={`translate(${titleShake} 0) translate(540 1060) scale(${0.5 + 0.5 * title}) translate(-540 -1060)`}>
            <text x={540} y={1060} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={RED}
              style={{ textShadow: '0 0 30px rgba(255,59,48,0.35)' }}>一本正经地胡说八道</text>
            <text x={540} y={1130} textAnchor="middle" fontFamily={FONT} fontSize={34} fill={GREY}>这就是 AI 幻觉 Hallucination</text>
          </g>
        ) : null}
        <rect x={0} y={0} width={1080} height={1920} fill={RED} opacity={redF} />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- 幕6：猜字机（字流→×300滚数→结尾卡弹入） ---------------- */
const FLOW6 = '的了好吗是你在有这那我他她它不没就要 can想'.split('');
const Scene6: React.FC<{ f: number }> = ({ f }) => {
  const rush = ez(at(f, 0, 16));
  const count = back(clamp01((f - 132) / 34));
  const countOut = 1 - clamp01((f - 172) / 10);
  const card = popT(f, 176, 540, 900, 20, 60);
  const ringIn = clamp01((f - 200) / 14);
  const sub = popT(f, 214, 540, 1190, 14, 30);
  const shown = Math.round(300 * clamp01((f - 132) / 34));
  return (
    <AbsoluteFill style={{ backgroundColor: BG_DARK }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="g6" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB800" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#FFB800" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={540} cy={820} rx={480} ry={420} fill="url(#g6)" />
        {FLOW6.map((ch, i) => {
          const speed = 26 + (i % 5) * 8;
          const life = (((f * speed + i * 97) % 900) / 900);
          const x = 180 + ((i * 137) % 720);
          const y = 1150 - life * 900;
          const op = (1 - life) * (0.5 + 0.5 * Math.sin(f * 0.3 + i)) * rush * (1 - clamp01((f - 176) / 20) * 0.85);
          return <text key={i} x={x} y={y} fontFamily={FONT} fontSize={30 + (i % 3) * 10} fontWeight={700} fill={GOLD} opacity={op}>{ch}</text>;
        })}
        {/* ×300 滚数 */}
        <g opacity={clamp01((f - 132) / 8) * countOut}>
          <text x={540} y={770} textAnchor="middle" fontFamily={FONT} fontSize={120} fontWeight={900} fill="#FFFFFF">
            ×<tspan fill={GOLD}>{shown}</tspan>/秒
          </text>
          <text x={540} y={840} textAnchor="middle" fontFamily={FONT} fontSize={36} fill="#FFFFFF" opacity={0.7}>每秒猜几百次下一个字</text>
        </g>
        {/* 结尾卡 */}
        <g opacity={card.o} transform={card.tr}>
          <text x={540} y={760} textAnchor="middle" fontFamily={FONT} fontSize={120} fontWeight={900} fill={GOLD}
            style={{ textShadow: '0 0 40px rgba(255,184,0,0.45)' }}>AI 科普</text>
          <text x={540} y={840} textAnchor="middle" fontFamily={FONT} fontSize={40} fill="#FFFFFF" opacity={0.75}>EP.02 · 大模型是如何“思考”的</text>
        </g>
        {ringIn > 0.01 ? (
          <g opacity={ringIn} transform={`translate(540 1080) scale(${0.5 + 0.5 * back(ringIn)})`}>
            <circle cx={0} cy={0} r={54} fill="none" stroke={GOLD} strokeWidth={4}
              strokeDasharray={`${2 * Math.PI * 54 * 0.3} ${2 * Math.PI * 54}`} strokeDashoffset={-(f / 70) * 2 * Math.PI * 54} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={900} fill="#FFFFFF">+</text>
          </g>
        ) : null}
        <g opacity={sub.o} transform={sub.tr}>
          <text x={540} y={1190} textAnchor="middle" fontFamily={FONT} fontSize={34} fill="#FFFFFF" opacity={0.65}>关注 · 下集解剖：AI为什么会长篇大论</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- 字幕：固定两排滚动框 ---------------- */
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
        <clipPath id="capclip2">
          <rect x={60} y={y0 - 46} width={960} height={2 * lineH + 34} rx={20} />
        </clipPath>
      </defs>
      <rect x={60} y={y0 - 46} width={960} height={2 * lineH + 34} rx={20} fill="#0A2540" opacity={0.72} />
      <g clipPath="url(#capclip2)">
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

const Badge: React.FC<{ f: number }> = ({ f }) => {
  const dark = f < 262 || f >= 1270;
  const p = pop(f, 8, 16);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <g opacity={clamp01((f - 8) / 6)} transform={`translate(169 82) scale(${0.6 + 0.4 * p}) translate(-169 -82)`}>
        <rect x={44} y={54} width={250} height={56} rx={28} fill={dark ? '#FFFFFF' : NAVY} opacity={0.14} />
        <text x={169} y={92} textAnchor="middle" fontFamily={FONT} fontSize={27} fontWeight={700}
          fill={dark ? '#FFFFFF' : NAVY} opacity={0.85}>AI 科普 · EP02</text>
      </g>
    </svg>
  );
};

/* ---------------- 火柴人老贾（学士帽现役版） ---------------- */
type StPose = { armL: number; armR: number; jump: number; lean: number; headTilt: number };
const STPOSES: Record<string, StPose> = {
  gasp: { armL: -75, armR: -75, jump: 26, lean: -6, headTilt: 10 },
  point: { armL: 20, armR: -80, jump: 10, lean: -6, headTilt: -6 },
  present: { armL: -88, armR: -20, jump: 8, lean: 0, headTilt: -8 },
  win: { armL: -85, armR: -85, jump: 34, lean: 0, headTilt: 0 },
};
const Sticker: React.FC<{ mode?: string; delay?: number; scale?: number; left?: number; bottom?: number }> =
  ({ mode = 'point', delay = 0, scale = 1, left = 720, bottom = 430 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const t = frame / fps - delay;
    const pose = STPOSES[mode] ?? STPOSES.gasp;
    const bob = interpolate(Math.sin(t * (pose.jump ? 10 : 6)), [-1, 1], [0, -(pose.jump || 22)]);
    const sway = interpolate(Math.sin(t * 5), [-1, 1], [-8, 8]);
    const absT = frame / fps;
    const openNow = Math.sin(absT * 17) > 0.55;
    const gesture = Math.sin(absT * 7) * 30;
    const gesture2 = Math.sin(absT * 7 + 1.6) * 34;
    return (
      <svg
        width={360} height={360} viewBox="0 0 210 210"
        style={{
          position: 'absolute', left, bottom,
          transformOrigin: 'bottom center',
          transform: `translateY(${bob}px) rotate(${pose.lean + sway * 0.25}deg) scale(${scale})`,
          filter: 'drop-shadow(0 12px 34px rgba(0,0,0,.55))',
        }}
      >
        <g transform={`rotate(${pose.headTilt} 105 60)`}>
          <g transform={`rotate(${Math.sin(absT * 8) * 26} 120 14)`}>
            <path d="M118 8 Q166 2 180 28 Q186 40 178 48" stroke="#12b582" strokeWidth={11} fill="none" strokeLinecap="round" />
            <circle cx={176} cy={52} r={11} fill={GOLD} stroke="#e6bc3c" strokeWidth={2} />
            <text x={176} y={57} fontSize={14} fill={PUPIL} textAnchor="middle" fontWeight={900}>¥</text>
          </g>
          <g transform="rotate(-11 105 10)">
            <ellipse cx={105} cy={6} rx={45} ry={14} fill="#0e5a44" />
            <path d="M60 8 Q60 -10 105 -12 Q150 -10 150 8 Z" fill="#12b582" />
            <rect x={46} y={2} width={118} height={14} rx={7} fill="#0a3d2e" />
          </g>
          <circle cx={105} cy={52} r={37} fill={GOLD} stroke="#e6bc3c" strokeWidth={3} />
          <path d="M76 32 Q90 8 108 26" stroke="#0a3d2e" strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M110 20 Q126 8 138 32" stroke="#0a3d2e" strokeWidth={7} fill="none" strokeLinecap="round" />
          <circle cx={92} cy={50} r={14} fill="#fff" stroke="#e6bc3c" strokeWidth={2} />
          <circle cx={118} cy={50} r={14} fill="#fff" stroke="#e6bc3c" strokeWidth={2} />
          <circle cx={99} cy={54} r={6.5} fill={PUPIL} />
          <circle cx={111} cy={54} r={6.5} fill={PUPIL} />
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

/* ---------------- 主组件（幕间白闪+zoom冲击转场） ---------------- */
export const NNV2: React.FC = () => {
  const f = useCurrentFrame();
  const si = f < F[1] ? 0 : f < F[2] ? 1 : f < F[3] ? 2 : f < F[4] ? 3 : f < F[5] ? 4 : 5;
  const lf = f - F[si];
  // 幕间转场：进幕 9 帧内 1.06→1 缩放回落 + 白闪
  const zoom = si === 0 ? 1 : 1 + 0.06 * (1 - ez(at(lf, 0, 9)));
  const flash = si === 0 ? 0 : 0.55 * (1 - at(lf, 0, 7));
  return (
    <AbsoluteFill style={{ backgroundColor: BG_LIGHT, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {si === 0 ? <Scene1 f={f} /> : null}
        {si === 1 ? <Scene2 f={lf} /> : null}
        {si === 2 ? <Scene3 f={lf} /> : null}
        {si === 3 ? <Scene4 f={lf} /> : null}
        {si === 4 ? <Scene5 f={lf} /> : null}
        {si === 5 ? <Scene6 f={lf} /> : null}
      </AbsoluteFill>
      {flash > 0.01 ? <AbsoluteFill style={{ backgroundColor: '#FFFFFF', opacity: flash }} /> : null}
      <Caption f={f} />
      <Badge f={f} />
      <Sticker mode="point" scale={0.72} left={720} bottom={430} />
      {VSCRIPT.map((_, i) => (
        <Sequence key={i} from={Math.round(F[i])}>
          <Audio src={staticFile(`vov2/e${i + 1}.mp3`)} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_new/175_DigitalClouds.mp3')} loop volume={(fr) =>
        interpolate(fr, [0, 40, TOTAL - 70, TOTAL], [0, 0.11, 0.11, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
    </AbsoluteFill>
  );
};

export const CoverNNV2: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: BG_DARK }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="cvglow2" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#FFB800" stopOpacity={0.36} />
            <stop offset="100%" stopColor="#FFB800" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={540} cy={800} rx={540} ry={520} fill="url(#cvglow2)" />
        <text x={540} y={900} textAnchor="middle" fontFamily={FONT} fontSize={420} fontWeight={900} fill={GOLD}
          style={{ textShadow: '0 0 60px rgba(255,184,0,0.5)' }}>猜</text>
        <text x={540} y={1310} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill="#FFFFFF">大模型如何“思考”？</text>
        <text x={540} y={1410} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={700} fill={GOLD}>它从不思考，它只是全世界最快的猜字机</text>
        <rect x={330} y={1490} width={420} height={78} rx={39} fill="none" stroke={GOLD} strokeWidth={4} />
        <text x={540} y={1543} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={700} fill={GOLD}>AI 科普 · EP02 竖屏版</text>
      </svg>
    </AbsoluteFill>
  );
};
