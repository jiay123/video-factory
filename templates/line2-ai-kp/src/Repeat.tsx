/* =============================================================================
 * 《重复》v3 —— 按 T.O.M《重复》原片的动作语法重做（无配音）
 * 铁律（自己立的，不再等老贾指出）：
 *   每一幕必须说得出一个动词：滚 / 翻 / 堆 / 凿 / 爬 / 滴 / 长 / 流 / 喷 / 聚
 *   不许任何一帧静止超过 0.4 秒；每 2 秒必须换一次画面状态
 * 音乐：Midnight Rush（老贾指定）
 * ========================================================================== */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { BEATS, F } from './repeatScript';
import { LaoJia } from './laojia';

const FONT = '"Microsoft YaHei","Source Han Sans SC","Noto Sans CJK SC",sans-serif';
const BLACK = '#04060C';
const WHITE = '#F2F5FA';
const BLUE = '#4EA8FF';
const BLUE2 = '#1890C0';
const GOLD = '#FFD24A';
const GREEN = '#3DDC84';
const RED = '#FF4D4D';
const GREY = '#8A94A6';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const grow = (f: number, d: number, dur = 18) => clamp01((f - d) / dur);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const breathe = (f: number, p = 60, a = 0.06) => 1 + a * Math.sin((f / p) * Math.PI * 2);
const spin = (f: number, p = 90) => (f / p) * 360;

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>{children}</AbsoluteFill>
);

/* ---------------- 滚动数字（带运动模糊，T.O.M 的杀手锏） ----------------
 * 🚨 10/19 老贾打回后的病根修复：原来只有 dur + easeOut，数字会「早早摸到目标」
 *    然后滑着走很久 → 落定时刻对不上曲子的拍，老贾听着就是「差一点，不对味」。
 * 现在加 endF：明确告诉它「你必须在第 endF 帧正好砸到目标数」。
 * 曲线改成：线性滚 → 最后 10 帧加速砸（带抖动+缩放+金光），砸完死死停住。
 * endF 一律传 F[i+1]-F[i]-1 = 本幕最后一帧，而幕末由算幕落点.py 钉在曲子的真峰上。
 * ------------------------------------------------------------------- */
const RollNum: React.FC<{
  f: number; d: number; dur?: number; endF?: number; from: number; to: number;
  size: number; color?: string; suffix?: string; tabular?: boolean; settleAt?: number;
}> = ({ f, d, dur = 60, endF, from, to, size, color = GOLD, suffix = '', settleAt = 0.62 }) => {
  const last = endF !== undefined ? endF : d + dur;
  const span = Math.max(1, last - d);
  const t = clamp01((f - d) / span);
  const hitFrom = Math.max(d, last - 9);
  const hk = clamp01((f - hitFrom) / 9);
  const base = from + (to - from) * t;
  const jitter = (1 - hk) * (to - from) * 0.09 * Math.sin(f * 2.4 + d);
  const v = Math.round(base + jitter);
  const blur = (1 - hk) * 9;
  const pop = 1 + Math.sin(hk * Math.PI) * 0.14;   // 砸下去那一下放大再收回
  return (
    <div style={{
      fontFamily: FONT, fontSize: size, fontWeight: 900, color, lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
      transform: `scale(${pop.toFixed(3)})`,
      filter: blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : 'none',
      textShadow: hk > 0.02 ? `0 0 ${size * 0.3 * hk}px ${color}, 0 0 ${size * 0.6 * hk}px ${color}88` : `0 0 ${size * 0.22}px ${color}aa`,
    }}>{v}{suffix}</div>
  );
};

/* ---------------- 3D 翻转滚筒（机场翻牌 / 老虎机）---------------- */
const Drum: React.FC<{ value: number; digits: number; size: number; color: string }> = ({ value, digits, size, color }) => {
  const H = Math.round(size * 1.16);
  return (
    <div style={{ display: 'flex', fontFamily: FONT, fontWeight: 900, color, textShadow: `0 0 ${Math.round(size * 0.28)}px ${color}aa` }}>
      {Array.from({ length: digits }).map((_, ci) => {
        const place = Math.pow(10, digits - 1 - ci);
        const off = Math.floor(value / place) % 10;
        return (
          <div key={ci} style={{ width: Math.round(size * 0.74), height: H, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${(-off * H).toFixed(2)}px)` }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, k) => (
                <div key={k} style={{ height: H, lineHeight: `${H}px`, fontSize: size, textAlign: 'center' }}>{d}</div>
              ))}
            </div>
            {/* 上下渐隐 + 中间翻牌分割线 = 机械翻牌质感 */}
            <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(4,6,12,.95) 0%, rgba(4,6,12,0) 9%, rgba(4,6,12,0) 91%, rgba(4,6,12,.95) 100%)' }} />
            <div style={{ position: 'absolute', left: '4%', right: '4%', top: '50%', height: 1, background: 'rgba(0,0,0,.75)', boxShadow: '0 1px 0 rgba(255,255,255,.10)', pointerEvents: 'none' }} />
          </div>
        );
      })}
    </div>
  );
};

/* ---------------- 生长线 / 流动光点 ---------------- */
const GrowLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; f: number; d: number; color?: string; w?: number; dur?: number }> = ({ x1, y1, x2, y2, f, d, color = WHITE, w = 3, dur = 20 }) => {
  const k = easeOut(clamp01((f - d) / dur));
  return <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * k} y2={y1 + (y2 - y1) * k} stroke={color} strokeWidth={w} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})` }} />;
};

const FlowDot: React.FC<{ x1: number; y1: number; x2: number; y2: number; f: number; d: number; color?: string; n?: number; sp?: number; r?: number }> = ({ x1, y1, x2, y2, f, d, color = BLUE, n = 3, sp = 40, r = 6 }) => {
  const dx = x2 - x1, dy = y2 - y1;
  return (
    <g opacity={clamp01((f - d) / 10)}>
      {Array.from({ length: n }).map((_, k) => {
        const t = ((f - d + k * sp) % (sp * n)) / (sp * n);
        return <circle key={k} cx={x1 + dx * t} cy={y1 + dy * t} r={r} fill={color} opacity={t < 0.03 || t > 0.97 ? 0 : 0.95} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />;
      })}
    </g>
  );
};

/* ---------------- 背景：星空 + 星云 ---------------- */
const Starfield: React.FC<{ hot?: number }> = ({ hot = 0 }) => {
  const f = useCurrentFrame();
  const rnd = (k: number) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  return (
    <>
      <AbsoluteFill style={{ background: 'radial-gradient(120% 90% at 50% 42%, #0a1424 0%, #04060C 58%, #010204 100%)' }} />
      <AbsoluteFill style={{ background: `radial-gradient(${38 + hot * 18}% 48% at 50% 48%, rgba(255,210,74,${0.08 + hot * 0.16}), transparent 70%)`, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(40% 46% at 20% 24%, rgba(78,168,255,0.18), transparent 70%)', mixBlendMode: 'screen' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        {Array.from({ length: 230 }).map((_, k) => {
          const layer = k % 3;
          const x = rnd(k) * 1920, y = rnd(k + 100) * 1080;
          const r = (layer === 0 ? 1.1 : layer === 1 ? 1.9 : 3.0) * (0.7 + rnd(k + 50) * 0.9);
          const gold = k % 7 === 0;
          const tw = 0.25 + 0.75 * Math.abs(Math.sin(f * (0.02 + layer * 0.012) + k));
          const yy = (y + (layer === 2 ? (f * 0.06) % 1080 : 0)) % 1080;
          return <circle key={k} cx={x} cy={yy} r={r} fill={gold ? GOLD : '#cfe6ff'} opacity={tw * (0.45 + layer * 0.2)} />;
        })}
      </svg>
    </>
  );
};

/* 小水滴角色（T.O.M 那个） */
const Drop: React.FC<{ x: number; y: number; s?: number; f: number }> = ({ x, y, s = 1, f }) => {
  const sq = 1 + 0.08 * Math.sin(f * 0.35);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (2 - sq)} ${s * sq})`}>
      <path d="M0 -34 C 14 -14 26 2 26 14 A 26 26 0 1 1 -26 14 C -26 2 -14 -14 0 -34 Z" fill="#EAF6FF" stroke="#9FD4FF" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 0 12px rgba(160,220,255,.65))' }} />
      <circle cx={-8} cy={12} r={3.2} fill="#1a2430" /><circle cx={8} cy={12} r={3.2} fill="#1a2430" />
      <path d="M-7 22 Q0 27 7 22" stroke="#1a2430" strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </g>
  );
};

/* ============================ 各幕 ============================ */
const Scene: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame() - F[i];

  /* 0 · 滚 · 成功率 100%→1% */
  if (i === 0) {
    const t = clamp01(f / 90);
    const ring = grow(f, 46, 40);
    return (
      <Center>
        <div style={{ position: 'absolute', top: 250, fontFamily: FONT, fontSize: 28, color: GREY, letterSpacing: 8, opacity: grow(f, 0, 10) }}>成功率 <span style={{ fontSize: 18, opacity: 0.6 }}>SUCCESS RATE</span></div>
        <RollNum f={f} d={0} endF={F[1] - F[0] - 1} from={100} to={1} size={330} suffix="%" />
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          <circle cx={960} cy={520} r={300} fill="none" stroke="rgba(255,210,74,0.18)" strokeWidth={1.5} />
          {/* 细进度弧，最后一秒扫满 */}
          <circle cx={960} cy={520} r={300} fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 300 * 0.78} 9999`} strokeDashoffset={(1 - ring) * 2 * Math.PI * 300 * 0.78}
            transform="rotate(-90 960 520)" opacity={0.9} style={{ filter: 'drop-shadow(0 0 10px rgba(255,210,74,.8))' }} />
          {Array.from({ length: 60 }).map((_, k) => {
            const a = ((k / 60) * 360 - 90) * Math.PI / 180;
            const on = k / 60 < t;
            return <line key={k} x1={960 + Math.cos(a) * 272} y1={520 + Math.sin(a) * 272} x2={960 + Math.cos(a) * 288} y2={520 + Math.sin(a) * 288}
              stroke={on ? GOLD : 'rgba(255,255,255,0.16)'} strokeWidth={2.5} />;
          })}
        </svg>
      </Center>
    );
  }

  /* 1 · 翻 · 100 个点被红叉吃掉，失败率 0→99% */
  if (i === 1) {
    const cell = 66, gx = 545, gy = 236;
    // 99% 必须砸在曲子的真峰上（幕2 落点 7.20s，幕2 从 4.53s 起 → 局部帧 ≈ 80）
    const flipStart = 8, flipEnd = F[2] - F[1] - 1;
    const done = clamp01((f - flipStart) / (flipEnd - flipStart));
    const pct = Math.round(done * 99);
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          {Array.from({ length: 100 }).map((_, k) => {
            const r = Math.floor(k / 10), c = k % 10;
            const order = k / 100;
            const kk = clamp01((f - flipStart - order * (flipEnd - flipStart) * 0.75) / 12);
            const x = gx + c * cell, y = gy + r * cell;
            const last = k === 55;
            const appear = grow(f, 2 + k * 0.5, 8);
            if (last) {
              const pulse = 1 + 0.35 * Math.sin(f * 0.4);
              return <circle key={k} cx={x} cy={y} r={13 * appear * pulse} fill={GOLD} style={{ filter: 'drop-shadow(0 0 18px rgba(255,210,74,1))' }} />;
            }
            return (
              <g key={k} opacity={appear}>
                <circle cx={x} cy={y} r={12 * (1 - kk)} fill="#e8eef8" opacity={1 - kk} />
                <g opacity={kk} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * kk})`} style={{ filter: 'drop-shadow(0 0 6px rgba(255,77,77,.9))' }}>
                  <line x1={-11} y1={-11} x2={11} y2={11} stroke={RED} strokeWidth={5} strokeLinecap="round" />
                  <line x1={11} y1={-11} x2={-11} y2={11} stroke={RED} strokeWidth={5} strokeLinecap="round" />
                </g>
              </g>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', right: 350, top: 300, textAlign: 'center' }}>
          <div style={{ fontFamily: FONT, fontSize: 26, color: GREY, letterSpacing: 6 }}>失败率</div>
          <RollNum f={f} d={flipStart} dur={flipEnd - flipStart} from={0} to={99} size={180} color={RED} suffix="%" settleAt={0.9} />
        </div>
        <div style={{ position: 'absolute', right: 350, top: 520, textAlign: 'center', opacity: grow(f, 100, 6) }}>
          <div style={{ fontFamily: FONT, fontSize: 26, color: GREY }}>只剩</div>
          <div style={{ fontFamily: FONT, fontSize: 92, fontWeight: 900, color: GOLD, textShadow: '0 0 30px rgba(255,210,74,.8)' }}>1</div>
          <div style={{ fontFamily: FONT, fontSize: 22, color: GREY }}>颗成功</div>
        </div>
      </Center>
    );
  }

  /* 2 · 滴 · 再来一次（连击计数） */
  if (i === 2) {
    const n = Math.min(7, 1 + Math.floor(f / 14));
    const hit = (f % 14) / 14;
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          <Drop x={960} y={360 - (1 - hit) * 180} s={1.15} f={f} />
          <line x1={860} y1={760} x2={1060} y2={760} stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
          {/* 撞击波纹 */}
          {hit < 0.5 && <circle cx={960} cy={760} r={20 + hit * 160} fill="none" stroke={GOLD} strokeWidth={3} opacity={(1 - hit * 2) * 0.8} />}
          {hit < 0.5 && Array.from({ length: 8 }).map((_, k) => {
            const a = (k / 8) * Math.PI * 2;
            return <circle key={k} cx={960 + Math.cos(a) * hit * 130} cy={760 + Math.sin(a) * hit * 60} r={4} fill={GOLD} opacity={(1 - hit * 2)} />;
          })}
        </svg>
        <div style={{ position: 'absolute', top: 230, fontFamily: FONT, fontSize: 130, fontWeight: 900, color: GOLD, textShadow: '0 0 45px rgba(255,210,74,.7)' }}>
          第 <span style={{ fontVariantNumeric: 'tabular-nums' }}>{n}</span> 次
        </div>
        <div style={{ position: 'absolute', bottom: 300, fontFamily: FONT, fontSize: 44, color: WHITE, opacity: 0.9 }}>那就，再来一次。</div>
      </Center>
    );
  }

  /* 3 · 聚 · 标题 */
  if (i === 3) {
    const k = grow(f, 0, 26);
    const trail = Array.from({ length: 24 }).map((_, q) => {
      const t = 1 - k;
      return <circle key={q} cx={960 + Math.cos(q * 1.7 + f * 0.1) * 620 * t} cy={540 + Math.sin(q * 2.3 + f * 0.1) * 300 * t} r={2.5} fill={q % 3 ? BLUE : GOLD} opacity={t * 0.9} />;
    });
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>{trail}</svg>
        <div style={{ fontFamily: FONT, fontSize: 100, fontWeight: 900, color: WHITE, letterSpacing: 10 * (1 - easeOut(k)), opacity: easeOut(k), textShadow: '0 0 40px rgba(255,255,255,.25)' }}>
          重复<span style={{ color: GOLD }}>伯努利</span>实验
        </div>
        <div style={{ width: 920 * easeOut(grow(f, 18, 26)), height: 3, marginTop: 22, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
        <div style={{ fontFamily: FONT, fontSize: 24, color: GREY, letterSpacing: 12, marginTop: 16, opacity: grow(f, 34, 14) }}>REPEATED BERNOULLI TRIALS</div>
      </Center>
    );
  }

  /* 4 · 流 · 管道 + 压强柱长出来 */
  if (i === 4) {
    const pb = easeOut(grow(f, 26, 34));
    const pb2 = easeOut(grow(f, 34, 34));
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          <path d="M300 400 L1500 400 L1500 500 L300 500 Z" fill="none" stroke={BLUE2} strokeWidth={3} opacity={grow(f, 0, 16) * 0.9} />
          <path d="M300 280 L300 620 M1500 360 L1500 540" stroke={BLUE2} strokeWidth={3} opacity={grow(f, 0, 16) * 0.5} />
          {Array.from({ length: 18 }).map((_, k) => {
            const total = 1300;
            const speed = 3.0 + (k % 2) * 3.0;
            const x = 300 + ((f * speed + k * 86) % total);
            const fast = x > 900;
            const y = 450 + Math.sin((x / total) * Math.PI * 3 + k) * (fast ? 18 : 38);
            return <circle key={k} cx={x} cy={y} r={fast ? 6 : 8} fill={fast ? GOLD : BLUE} opacity={0.95} />;
          })}
          <rect x={520} y={940 - 200 * pb} width={86} height={200 * pb} fill={BLUE} opacity={0.9} style={{ filter: 'drop-shadow(0 0 14px rgba(78,168,255,.6))' }} />
          <rect x={1280} y={940 - 64 * pb2} width={86} height={64 * pb2} fill={RED} opacity={0.9} style={{ filter: 'drop-shadow(0 0 14px rgba(255,77,77,.6))' }} />
          <text x={563} y={690} textAnchor="middle" fontFamily={FONT} fontSize={30} fill={WHITE} opacity={grow(f, 10, 12)}>压强 高</text>
          <text x={1323} y={846} textAnchor="middle" fontFamily={FONT} fontSize={30} fill={WHITE} opacity={grow(f, 20, 12)}>压强 低</text>
          <text x={320} y={690} fontFamily={FONT} fontSize={28} fill={GREY}>流速 慢</text>
          <text x={1450} y={690} textAnchor="end" fontFamily={FONT} fontSize={28} fill={BLUE}>流速 快</text>
        </svg>
      </Center>
    );
  }

  /* 5 · 喷 · 喷雾瓶 */
  if (i === 5) {
    const press = Math.max(0, Math.sin(f * 0.2));
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          <g transform="translate(680 560)">
            <rect x={-70} y={-120} width={140} height={260} rx={16} fill="rgba(78,168,255,0.10)" stroke={BLUE} strokeWidth={4} />
            <rect x={-24} y={-180} width={48} height={64} fill={GREY} />
            <path d={`M0 ${-180 + press * 24} L96 ${-192 + press * 24} L96 ${-158 + press * 24} L0 ${-146 + press * 24} Z`} fill={GOLD} style={{ filter: 'drop-shadow(0 0 10px rgba(255,210,74,.9))' }} />
            {Array.from({ length: 34 }).map((_, k) => {
              const t = ((f * 5.2 + k * 34) % 240) / 240;
              const x = 96 + t * 700;
              const y = -175 + Math.sin(k * 2.1) * t * 96 + t * t * 44;
              return <circle key={k} cx={x} cy={y} r={7.5 - t * 3.5} fill={GOLD} opacity={(1 - t) * 0.95} />;
            })}
          </g>
        </svg>
      </Center>
    );
  }

  /* 6 · 堆 · 1000 次试，堆成一座山 */
  if (i === 6) {
    // 前段快滚到 950，最后一段放慢，让"咔"停在 1000 看得见
    const LASTF = F[7] - F[6] - 1, SLOWF = Math.round(LASTF * 0.82);
    const vt = f < SLOWF ? (f / SLOWF) * 950
      : Math.min(1000, 950 + ((f - SLOWF) / Math.max(1, LASTF - SLOWF)) * 50);
    const pile = vt / 1000;
    // 停在 1000 的那一帧：数字一顿 + 金光一闪，和第 742 帧的"当"同帧
    const hit = f >= 156 ? Math.exp(-(f - 156) * 0.30) : 0;
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          {/* 转动：100 格刻度环随次数一格格点亮 */}
          {Array.from({ length: 100 }).map((_, k) => {
            const a = ((k / 100) * 360 - 90) * Math.PI / 180;
            const on = k / 100 < pile;
            return <line key={'tk' + k} x1={960 + Math.cos(a) * 212} y1={470 + Math.sin(a) * 212} x2={960 + Math.cos(a) * 232} y2={470 + Math.sin(a) * 232} stroke={on ? GOLD : 'rgba(255,255,255,0.13)'} strokeWidth={2.2} opacity={on ? 0.95 : 0.7} />;
          })}
          <circle cx={960} cy={470} r={206} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />
          <circle cx={960} cy={470} r={240} fill="none" stroke="rgba(255,210,74,0.10)" strokeWidth={1.5} />
          {/* 堆体轮廓：随次数长高 */}
          <path d={`M ${740 - 300 * pile} 830 Q 740 ${830 - 420 * pile} ${740 + 300 * pile} 830 Z`} fill="rgba(255,210,74,0.10)" stroke={GOLD} strokeWidth={3} strokeDasharray="6 8" opacity={0.7 * pile + 0.15} />
          {/* 飞入的光点：从左侧飞向堆顶 */}
          {Array.from({ length: 34 }).map((_, k) => {
            const t = ((f * 4.4 + k * 30) % 150) / 150;
            const tx = 740 + Math.sin(k * 2.4) * 210 * pile;
            const ty = 830 - 400 * pile * (0.5 + 0.5 * Math.abs(Math.sin(k * 1.7)));
            const x = 220 + (tx - 220) * easeInOut(t);
            const y = 560 + (ty - 560) * easeInOut(t) - Math.sin(t * Math.PI) * 80;
            return <circle key={k} cx={x} cy={y} r={5} fill={k % 4 ? BLUE : GOLD} opacity={0.35 + 0.65 * (1 - t)} />;
          })}
          {/* 堆里的光点 */}
          {Array.from({ length: 300 }).map((_, k) => {
            const r = (k * 37) % 100;
            if (r > pile * 100) return null;
            const a = (k * 2.399963) % (Math.PI * 2);
            const rr = Math.sqrt(r / 100) * 260 * pile;
            return <circle key={'p' + k} cx={740 + Math.cos(a) * rr} cy={828 - Math.abs(Math.sin(a)) * 158 * pile} r={2.3} fill={k % 5 ? GOLD : WHITE} opacity={0.8} />;
          })}
          <line x1={300} y1={830} x2={1180} y2={830} stroke="rgba(255,255,255,0.22)" strokeWidth={2} />
        </svg>
        <div style={{ position: 'absolute', top: 150, fontFamily: FONT, fontSize: 34, color: GREY, letterSpacing: 8 }}>同一个实验 · 重复</div>
        {/* 3D 翻转滚筒：个位转→进位→十位→百位→千位，一路转到 1000 */}
        <div style={{ position: 'absolute', top: 348, display: 'flex', alignItems: 'center', transform: `scale(${1 + 0.07 * hit})`, filter: `drop-shadow(0 0 ${40 * hit}px rgba(255,210,74,${0.85 * hit}))` }}>
          <Drum value={vt} digits={4} size={148} color={GOLD} />
          <div style={{ fontSize: 84, fontFamily: FONT, fontWeight: 900, color: GOLD, marginLeft: 14, textShadow: '0 0 35px rgba(255,210,74,.7)' }}>次</div>
        </div>
      </Center>
    );
  }

  /* 7 · 飞 · 错答案两条传送带反向穿插（一直在动，永不停） */
  if (i === 7) {
    const phrase = '机翼上表面路程长，所以升得快';
    const lanes = [
      { y: 210, dir: 1, speed: 3.4, scale: 1.0, op: 0.55 },
      { y: 390, dir: -1, speed: 4.8, scale: 1.16, op: 0.95 },
      { y: 560, dir: 1, speed: 2.6, scale: 0.82, op: 0.38 },
      { y: 730, dir: -1, speed: 4.0, scale: 0.96, op: 0.72 },
    ];
    const span = 3200;
    return (
      <Center>
        {lanes.map((ln, li) => (
          <div key={li} style={{ position: 'absolute', top: ln.y, left: 0, right: 0, height: 70 }}>
            {Array.from({ length: 5 }).map((_, k) => {
              const raw = f * ln.speed * ln.dir + k * 640 + li * 210;
              const x = ((raw % span) + span) % span - 320;
              return (
                <div key={k} style={{
                  position: 'absolute', left: x, top: 0, whiteSpace: 'nowrap',
                  fontFamily: FONT, fontSize: 26 * ln.scale, color: RED,
                  opacity: ln.op, transform: `scale(${ln.scale}) rotate(${ln.dir * 2.4}deg)`,
                  border: '1px solid rgba(255,77,77,.35)', borderRadius: 8, padding: '8px 14px',
                  zIndex: Math.round(ln.scale * 10),
                }}>{phrase}</div>
              );
            })}
          </div>
        ))}
      </Center>
    );
  }

  /* 8 · 凿 · 一下一下凿，槽口越来越深 */
  if (i === 8) {
    const period = 13;
    const strikes = Math.floor(f / period);
    const ph = (f % period) / period;
    const chiselY = -46 + 44 * (ph < 0.45 ? easeInOut(ph / 0.45) : 1 - easeInOut((ph - 0.45) / 0.55));
    const depth = clamp01(strikes / 11);
    const spark = ph < 0.4 ? 1 - ph / 0.4 : 0;
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          {/* 石台 */}
          <path d="M 700 850 L 706 560 Q 960 528 1214 560 L 1220 850 Z" fill="#151b26" stroke="#4a5568" strokeWidth={3} />
          {/* 凿出的槽：从顶边往下切，越来越深 */}
          <path d={`M 916 552 L 960 ${556 + 14 + depth * 168} L 1004 552 Z`} fill="#01030a" stroke={GOLD} strokeWidth={2.5} opacity={0.9} style={{ filter: 'drop-shadow(0 0 12px rgba(255,210,74,.6))' }} />
          {/* 碎屑往下掉 */}
          {Array.from({ length: 16 }).map((_, k) => {
            const t2 = ((f * 1.6 + k * 9) % 40) / 40;
            const side = k % 2 ? 1 : -1;
            return <circle key={'c' + k} cx={960 + side * (18 + t2 * (60 + k * 5))} cy={556 + depth * 110 + t2 * 140} r={2.2} fill="#6b7688" opacity={(1 - t2) * 0.8} />;
          })}
          {/* 槽底金光：越深越亮 */}
          <ellipse cx={960} cy={556 + 14 + depth * 168} rx={9 + depth * 14} ry={4 + depth * 6} fill={GOLD} opacity={0.2 + depth * 0.65} style={{ filter: 'drop-shadow(0 0 18px rgba(255,210,74,.95))' }} />
          {/* 刻在石面上的字，随敲击点亮 */}
          <text x={960} y={806} textAnchor="middle" fontFamily={FONT} fontSize={42} fill={GOLD} opacity={0.2 + depth * 0.8} style={{ letterSpacing: 12 }}>信念</text>
          {/* 凿子 */}
          <g transform={`translate(960 ${528 + chiselY * 0.8})`}>
            <rect x={-8} y={-80} width={16} height={80} rx={3} fill="#c9d3e3" />
            <path d="M-8 0 L8 0 L2.5 24 L-2.5 24 Z" fill={GOLD} style={{ filter: 'drop-shadow(0 0 10px rgba(255,210,74,1))' }} />
          </g>
          {/* 火花（打在槽口） */}
          {spark > 0 && Array.from({ length: 12 }).map((_, k) => {
            const a = (k / 12) * Math.PI * 2 + strikes * 0.7;
            const r = (1 - spark) * 110;
            return <circle key={k} cx={960 + Math.cos(a) * r} cy={556 + Math.sin(a) * r * 0.55} r={3.6 * spark + 1} fill={k % 2 ? GOLD : '#fff'} opacity={spark} />;
          })}
        </svg>
        <div style={{ position: 'absolute', right: 330, top: 420, textAlign: 'center', opacity: grow(f, 4, 14) }}>
          <div style={{ fontFamily: FONT, fontSize: 24, color: GREY }}>凿了</div>
          <div style={{ fontFamily: FONT, fontSize: 84, fontWeight: 900, color: GOLD, fontVariantNumeric: 'tabular-nums' }}>{strikes + 1}</div>
          <div style={{ fontFamily: FONT, fontSize: 24, color: GREY }}>次</div>
        </div>
      </Center>
    );
  }

  /* 9 · 滚 · 1985 */
  if (i === 9) {
    return (
      <Center>
        <div style={{ fontFamily: FONT, fontSize: 30, color: GREY, letterSpacing: 8, marginTop: -220, opacity: grow(f, 0, 12) }}>归因理论 <span style={{ fontSize: 18 }}>ATTRIBUTION THEORY</span></div>
        <RollNum f={f} d={0} dur={62} from={1900} to={1985} size={210} />
        <div style={{ fontFamily: FONT, fontSize: 42, color: WHITE, marginTop: 14, opacity: grow(f, 62, 16) }}>心理学家 · 伯纳德·维纳</div>
        <div style={{ display: 'flex', gap: 90, marginTop: 26, opacity: grow(f, 74, 16) }}>
          {['是内还是外', '稳不稳定', '能不能控'].map((t, k) => <span key={k} style={{ fontFamily: FONT, fontSize: 28, color: [BLUE, GOLD, GREEN][k] }}>{t}</span>)}
        </div>
      </Center>
    );
  }

  /* 10 · 滑 · 三条维度轴 */
  if (i === 10) {
    const axes = [
      { y: 320, l: '内部', r: '外部', c: BLUE, ph: 0 },
      { y: 500, l: '稳定', r: '不稳定', c: GOLD, ph: 1.5 },
      { y: 680, l: '可控', r: '不可控', c: GREEN, ph: 3.0 },
    ];
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          {axes.map((a, k) => {
            const k2 = grow(f, 4 + k * 12, 16);
            const dot = 0.5 + 0.42 * Math.sin(f * 0.06 + a.ph);
            const x = 560 + dot * 800;
            return (
              <g key={k} opacity={k2}>
                <line x1={560} y1={a.y} x2={1360} y2={a.y} stroke={a.c} strokeWidth={3} opacity={0.4} />
                <circle cx={560} cy={a.y} r={5} fill={a.c} opacity={0.5} /><circle cx={1360} cy={a.y} r={5} fill={a.c} opacity={0.5} />
                <text x={560} y={a.y - 24} fontFamily={FONT} fontSize={32} fill={a.c}>{a.l}</text>
                <text x={1360} y={a.y - 24} textAnchor="end" fontFamily={FONT} fontSize={32} fill={a.c}>{a.r}</text>
                {/* 运动拖尾 */}
                {[1, 2, 3, 4, 5].map((q) => {
                  const dd = 0.5 + 0.42 * Math.sin(f * 0.06 + a.ph - q * 0.06);
                  return <circle key={q} cx={560 + dd * 800} cy={a.y} r={12 - q * 1.6} fill={a.c} opacity={0.30 - q * 0.05} />;
                })}
                <circle cx={x} cy={a.y} r={15 * breathe(f, 36 + k * 5, 0.16)} fill={a.c} style={{ filter: `drop-shadow(0 0 14px ${a.c})` }} />
              </g>
            );
          })}
        </svg>
      </Center>
    );
  }

  /* 11 · 胀 · 两种念头 */
  if (i === 11) {
    const items = [['"我没努力"', GREEN, 300], ['"我就是笨"', RED, 1120]];
    return (
      <Center>
        {items.map(([t, c, x], k) => {
          const g = easeOut(grow(f, 8 + k * 14, 18));
          const pop = 1 + 0.06 * Math.sin(f * 0.35 + k);
          return (
            <div key={k} style={{
              position: 'absolute', left: (x as number), top: 430, width: 500, textAlign: 'center',
              fontFamily: FONT, fontSize: 54, fontWeight: 900, color: c as string,
              opacity: g, transform: `scale(${(0.55 + 0.45 * g) * pop})`, textShadow: `0 0 40px ${c}`,
            }}>{t as string}</div>
          );
        })}
        <div style={{ position: 'absolute', top: 580, width: 1200, height: 2, background: 'rgba(255,255,255,.14)' }} />
      </Center>
    );
  }

  /* 12 · 能改（绿线上升）/ 天生（红线平）—— 严格照 v2 原图 */
  if (i === 12) {
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          <GrowLine x1={520} y1={820} x2={1060} y2={330} f={f} d={6} color={GREEN} w={7} dur={46} />
          <FlowDot x1={520} y1={820} x2={1060} y2={330} f={f} d={26} color={GREEN} n={3} sp={26} r={9} />
          <GrowLine x1={1060} y1={330} x2={1420} y2={300} f={f} d={6} color={GREEN} w={7} dur={46} />
          <text x={1080} y={288} fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREEN}>能改 → 会再来</text>
          <line x1={520} y1={790} x2={1420} y2={790} stroke={RED} strokeWidth={7} opacity={grow(f, 40, 30)} style={{ filter: 'drop-shadow(0 0 10px rgba(255,77,77,.6))' }} />
          <text x={1440} y={806} textAnchor="end" fontFamily={FONT} fontSize={40} fontWeight={800} fill={RED} opacity={grow(f, 60, 20)}>天生 → 停手</text>
        </svg>
      </Center>
    );
  }

  /* 13 · 第 365 天 —— 严格照 v2 原图（蓝金双弧 + 散点） */
  if (i === 13) {
    const a1 = f * 0.9, a2 = -f * 1.2;
    const day = Math.round(interpolate(clamp01(f / (F[14] - F[13] - 1)), [0, 1], [0, 365]));
    const landed = f >= 87;
    const popd = landed ? 1 + 0.10 * Math.exp(-(f - 87) * 0.3) : 1;
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          <circle cx={960} cy={480} r={250} fill="none" stroke={BLUE} strokeWidth={5} strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 250 * 0.30} 9999`} transform={`rotate(${a1 - 60} 960 480)`}
            opacity={0.95} style={{ filter: 'drop-shadow(0 0 12px rgba(78,168,255,.85))' }} />
          <circle cx={960} cy={480} r={228} fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 228 * 0.22} 9999`} transform={`rotate(${a2 + 40} 960 480)`}
            opacity={0.95} style={{ filter: 'drop-shadow(0 0 10px rgba(255,210,74,.85))' }} />
          {Array.from({ length: 13 }).map((_, k) => {
            const a = ((k / 13) * 360 + a1 * 0.7) * Math.PI / 180;
            const rr = 205 + (k % 3) * 28;
            return <circle key={k} cx={960 + Math.cos(a) * rr} cy={480 + Math.sin(a) * rr} r={k % 4 === 0 ? 7 : 5} fill={k % 3 === 0 ? GOLD : BLUE} opacity={0.9} />;
          })}
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, transform: `scale(${popd})` }}>
          <span style={{ fontFamily: FONT, fontSize: 96, fontWeight: 900, color: WHITE, textShadow: landed ? '0 0 40px rgba(255,255,255,.45)' : '0 0 24px rgba(255,255,255,.16)' }}>第</span>
          <Drum value={Math.max(1, day)} digits={3} size={124} color={WHITE} />
          <span style={{ fontFamily: FONT, fontSize: 96, fontWeight: 900, color: WHITE, textShadow: landed ? '0 0 40px rgba(255,255,255,.45)' : '0 0 24px rgba(255,255,255,.16)' }}>天</span>
        </div>
      </Center>
    );
  }

  /* 14 · 长 · 两条规律两条曲线同时长出来 */
  if (i === 14) {
    const mk = (c: string, ph: number) => {
      const prog = easeOut(grow(f, 8 + ph, 56));
      const pts = Array.from({ length: 64 }).map((_, k) => {
        const t = Math.min(1, (k / 63) / Math.max(0.001, prog)) * (k / 63 <= prog ? 1 : 0);
        const tt = (k / 63);
        return [470 + tt * 980, 830 - Math.pow(tt, 1.6) * 470 * (k / 63 <= prog ? 1 : 0)];
      });
      const d = pts.map((p, k) => (k ? 'L' : 'M') + p[0].toFixed(0) + ' ' + p[1].toFixed(0)).join(' ');
      const head = pts[Math.min(63, Math.floor(prog * 63))];
      return (
        <g>
          <path d={d} fill="none" stroke={c} strokeWidth={5} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 12px ${c})` }} />
          <circle cx={head[0]} cy={head[1]} r={9} fill={c} style={{ filter: `drop-shadow(0 0 16px ${c})` }} />
        </g>
      );
    };
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          {mk(BLUE, 0)}{mk(GOLD, 12)}
          <text x={1450} y={340} textAnchor="end" fontFamily={FONT} fontSize={32} fontWeight={800} fill={BLUE}>行为重复 → 改变结果</text>
          <text x={1450} y={288} textAnchor="end" fontFamily={FONT} fontSize={32} fontWeight={800} fill={GOLD}>念头重复 → 改变人</text>
          <line x1={420} y1={850} x2={1500} y2={850} stroke="rgba(255,255,255,.2)" strokeWidth={2} />
        </svg>
      </Center>
    );
  }

  /* 15 · 钻 · 螺旋从底部一路钻到顶部 */
  if (i === 15) {
    const N = 160;
    const dur = F[16] - F[15];
    const p = clamp01((f - 4) / (dur - 8));
    const n = Math.max(2, Math.round(p * N));
    const pts = Array.from({ length: n }).map((_, k) => {
      const a = k * 0.30 + f * 0.02;
      const r = 40 + k * 2.9;
      return [960 + Math.cos(a) * r, 862 - k * 3.3];
    });
    const dAttr = pts.map((q, k) => (k ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
    const head = pts[n - 1];
    const beatPulse = 1 + 0.22 * Math.max(0, Math.sin(((f % 16) / 16) * Math.PI));
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          <path d={dAttr} fill="none" stroke={GOLD} strokeWidth={6} strokeLinecap="round" opacity={0.92} style={{ filter: 'drop-shadow(0 0 14px rgba(255,210,74,.6))' }} />
          {/* 起点：底部的洞口 */}
          <ellipse cx={960} cy={862} rx={44} ry={13} fill="none" stroke="rgba(255,210,74,.5)" strokeWidth={2.5} />
          <ellipse cx={960} cy={862} rx={44 * (1 - p)} ry={13 * (1 - p)} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.8 * (1 - p)} />
          {/* 钻头：光点 + 双环 + 碎屑 */}
          <circle cx={head[0]} cy={head[1]} r={30 * beatPulse} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.35} />
          <circle cx={head[0]} cy={head[1]} r={16} fill={GOLD} style={{ filter: 'drop-shadow(0 0 22px rgba(255,210,74,1))' }} />
          {Array.from({ length: 7 }).map((_, k) => {
            const a = k * 1.7 + f * 0.25;
            const rr = 22 + ((f * 3 + k * 19) % 60);
            return <circle key={k} cx={head[0] + Math.cos(a) * rr} cy={head[1] + Math.sin(a) * rr * 0.7} r={3.2} fill={k % 2 ? WHITE : GOLD} opacity={0.75 - rr / 110} />;
          })}
          {/* 高度尺：随钻头一起长 */}
          <line x1={1620} y1={320} x2={1620} y2={862} stroke="rgba(255,255,255,.16)" strokeWidth={2} />
          <line x1={1620} y1={862} x2={1620} y2={head[1]} stroke={GOLD} strokeWidth={5} strokeLinecap="round" opacity={0.9} style={{ filter: 'drop-shadow(0 0 10px rgba(255,210,74,.7))' }} />
          <text x={1650} y={head[1] + 8} fontFamily={FONT} fontSize={26} fill={GOLD}>第 {(n / 20).toFixed(1)} 圈</text>
          <text x={330} y={872} fontFamily={FONT} fontSize={28} fill={GREY}>起点</text>
        </svg>
      </Center>
    );
  }

  /* 16 · 爬 · 原地踏步 vs 复利（两个人在动） */
  if (i === 16) {
    const t = clamp01((f - 6) / 118);
    const redAng = f * 0.14;
    const redX = 560 + Math.cos(redAng) * 86;
    const redY = 800 + Math.sin(redAng) * 22;
    // 复利：加速上升（曲线）
    const cp = Math.pow(t, 1.9);
    const goldX = 1160 + t * 430;
    const goldY = 800 - cp * 520;
    const trail = Array.from({ length: 16 }).map((_, q) => {
      const tt = Math.pow(clamp01(t - q * 0.012), 1.9);
      return { x: 1160 + clamp01(t - q * 0.012) * 430, y: 800 - tt * 520, o: 0.5 - q * 0.03 };
    });
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          <line x1={300} y1={800} x2={1780} y2={800} stroke="rgba(255,255,255,.22)" strokeWidth={2} />
          {/* 左：原地绕圈 */}
          <ellipse cx={560} cy={800} rx={86} ry={22} fill="none" stroke={RED} strokeWidth={2} strokeDasharray="6 8" opacity={0.45} />
          <circle cx={redX} cy={redY} r={15} fill={RED} style={{ filter: 'drop-shadow(0 0 14px rgba(255,77,77,.9))' }} />
          <text x={560} y={880} textAnchor="middle" fontFamily={FONT} fontSize={32} fill={WHITE}>原地踏步</text>
          <text x={560} y={918} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={900} fill={RED}>0.026 倍</text>

          {/* 右：复利曲线爬升 */}
          <path d={`M 1160 800 Q ${1160 + 240} ${800 - cp * 120} ${goldX} ${goldY}`} fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 14px rgba(255,210,74,.8))' }} />
          {trail.map((p, q) => <circle key={q} cx={p.x} cy={p.y} r={8 - q * 0.4} fill={GOLD} opacity={Math.max(0, p.o)} />)}
          <circle cx={goldX} cy={goldY} r={17} fill={GOLD} style={{ filter: 'drop-shadow(0 0 22px rgba(255,210,74,1))' }} />
          <text x={goldX + 26} y={goldY - 14} fontFamily={FONT} fontSize={30} fill={GOLD}>每次好一点</text>
          <text x={1400} y={918} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900} fill={GOLD}>{(1 + cp * 36.78).toFixed(2)} 倍</text>

        </svg>
      </Center>
    );
  }

  /* 17 · 算 · 复利公式：1.01^365 = 37.78 倍 */
  if (i === 17) {
    const n = Math.round(interpolate(clamp01(f / (F[18] - F[17] - 1)), [0, 1], [1, 365]));
    const res = Math.pow(1.01, n);
    const done = f >= 133;
    const pop = done ? 1 + 0.14 * Math.exp(-(f - 133) * 0.28) : 1;
    return (
      <Center>
        <div style={{ position: 'absolute', top: 176, fontFamily: FONT, fontSize: 28, color: GREY, letterSpacing: 8 }}>每天进步 1% · 一年 365 天</div>
        <div style={{ position: 'absolute', top: 240, fontFamily: FONT, fontSize: 82, fontWeight: 900, color: WHITE, letterSpacing: 2 }}>
          <span style={{ color: BLUE }}>1.01</span>
          <span style={{ color: GOLD }}>ⁿ</span>
        </div>
        <div style={{ position: 'absolute', top: 364, fontFamily: FONT, fontSize: 34, color: GREY }}>
          n = <span style={{ color: WHITE, fontWeight: 900, fontSize: 46 }}>{n}</span> 天
        </div>
        <div style={{
          position: 'absolute', top: 430, display: 'flex', alignItems: 'baseline', gap: 16,
          transform: `scale(${pop})`, color: done ? GOLD : WHITE,
          textShadow: done ? '0 0 70px rgba(255,210,74,.9)' : '0 0 36px rgba(255,255,255,.22)',
        }}>
          <span style={{ fontFamily: FONT, fontSize: 168, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{res.toFixed(2)}</span>
          <span style={{ fontFamily: FONT, fontSize: 64, fontWeight: 900 }}>倍</span>
        </div>
        {done && (
          <svg width={1920} height={1080} style={{ position: 'absolute' }}>
            {Array.from({ length: 28 }).map((_, k) => {
              const a = (k / 28) * Math.PI * 2;
              const r = 60 + Math.max(0, f - 133) * 9;
              return <circle key={k} cx={960 + Math.cos(a) * r} cy={540 + Math.sin(a) * r} r={4} fill={k % 2 ? GOLD : WHITE} opacity={Math.max(0, 1 - (f - 133) / 46)} />;
            })}
          </svg>
        )}
      </Center>
    );
  }

  /* 18 · 滴 · 绳锯木断，水滴石穿（第1日→第1000日） */
  if (i === 18) {
    const day = Math.max(1, Math.round(interpolate(clamp01(f / (F[19] - F[18] - 1)), [0, 1], [1, 1000])));
    const period = 9;
    const ph = (f % period) / period;
    const crack = clamp01((day - 960) / 40);
    return (
      <Center>
        <svg width={1920} height={1080} style={{ position: 'absolute' }}>
          <Drop x={900} y={630 - (1 - Math.min(1, ph / 0.7)) * 180} s={0.8} f={f} />
          {ph > 0.7 && ph < 0.95 && <circle cx={900} cy={644} r={8 + (ph - 0.7) * 120} fill="none" stroke={BLUE} strokeWidth={2} opacity={(0.95 - ph) * 4} />}
          {/* 石头 */}
          <path d="M 620 890 Q 720 672 900 646 Q 1120 626 1260 890 Z" fill="#151b26" stroke="#4a5568" strokeWidth={3} />
          {/* 落点的小坑 */}
          <ellipse cx={900} cy={650} rx={26} ry={7} fill="#03050a" />
          {/* 裂纹随天数加深 */}
          {crack > 0 && (
            <g opacity={crack} stroke={GOLD} strokeWidth={3.5} fill="none" style={{ filter: 'drop-shadow(0 0 12px rgba(255,210,74,.95))' }}>
              <path d={`M 900 ${656 - 16 * crack} L 868 706 L 902 748 L 876 798 L 900 846`} />
              <path d="M 902 748 L 948 736 L 972 774" />
              <path d="M 868 706 L 826 700" />
            </g>
          )}
          {crack > 0.5 && <ellipse cx={900} cy={748} rx={50 + 80 * crack} ry={40 + 60 * crack} fill={GOLD} opacity={0.09 * crack} />}
        </svg>
        <div style={{ position: 'absolute', right: 330, top: 610, textAlign: 'center' }}>
          <div style={{ fontFamily: FONT, fontSize: 22, color: GREY }}>滴到</div>
          <div style={{ fontFamily: FONT, fontSize: 44, color: GREY }}>第 <span style={{ color: WHITE, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{day}</span> 日</div>
        </div>
      </Center>
    );
  }

  /* 18 · 收 · 金句 */
  const kk = easeOut(grow(f, 0, 24));
  return (
    <Center>
      <div style={{ position: 'absolute', width: 900 * kk, height: 900 * kk, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,210,74,.20), transparent 65%)' }} />
      <div style={{ fontFamily: FONT, fontSize: 126, fontWeight: 900, color: GOLD, opacity: kk, transform: `scale(${0.9 + 0.1 * kk})`, textShadow: '0 0 70px rgba(255,210,74,.8)', letterSpacing: 6 }}>成功，源于正确的重复</div>
      <div style={{ fontFamily: FONT, fontSize: 26, color: GREY, letterSpacing: 8, marginTop: 26, opacity: grow(f, 20, 16) }}>SUCCESS COMES FROM THE RIGHT REPETITION</div>
    </Center>
  );
};

/* ---------------- 字幕：无边框纯文字（T.O.M 同款） ---------------- */
const Caption: React.FC = () => {
  const f = useCurrentFrame();
  let idx = BEATS.length - 1;
  for (let i = 0; i < BEATS.length; i++) { if (f < F[i + 1]) { idx = i; break; } }
  if (idx === BEATS.length - 1) return null;
  const segStart = F[idx];
  const local = f - segStart;
  const durF = F[idx + 1] - segStart;
  const op = interpolate(f, [segStart, segStart + 7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    * interpolate(f, [F[idx + 1] - 7, F[idx + 1]], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const plain = BEATS[idx].cn;
  const chars = plain.split('');
  const per = durF / Math.max(1, chars.length);
  const lines = plain.split('\n');
  const maxLen = Math.max(...lines.map((l) => l.length));
  const fontSize = maxLen > 20 ? 34 : maxLen > 15 ? 40 : 46;
  let counter = 0;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center', opacity: op }}>
      <div style={{ maxWidth: 1400, padding: '18px 44px', background: 'rgba(6,10,18,0.74)', border: '1px solid rgba(255,210,74,0.28)', borderRadius: 10, boxShadow: '0 0 40px rgba(0,0,0,.8)' }}>
        <div style={{ fontFamily: FONT, fontSize, fontWeight: 800, lineHeight: 1.5, textAlign: 'center', whiteSpace: 'pre-wrap' }}>
          {chars.map((c, k) => {
            if (c === '\n') return <br key={k} />;
            const ci = counter++;
            const lit = local >= ci * per;
            return <span key={k} style={{ color: lit ? GOLD : 'rgba(255,255,255,0.24)', textShadow: lit ? '0 0 16px rgba(255,210,74,.6)' : 'none' }}>{c}</span>;
          })}
        </div>
      </div>
    </div>
  );
};

/* =============================================================================
 * 命中冲击层（10/19 老贾"画龙点睛"要求 · v12）
 * 原理：卡点的炸不是平均音量大，是低频 kick 砸下来那一下。
 *       所以用「低频 30-120Hz 的局部极大值」当节拍器，让音乐驱动画面，
 *       而不是拿刀去剪音乐硬凑（v10 那样做过，全错）。
 * music_beats.json 由 ip-kit\提峰.py 从 wenever.m4a 现场量出来，一个音都不剪。
 * ========================================================================== */
const HITS: { t: number; s: number }[] = (() => {
  const arr: { t: number; s: number }[] = [];
  try {
    const raw = require('./music_beats.json');
    for (const b of raw.beats) arr.push({ t: b.t, s: b.s });
  } catch (e) { /* 没生成就退化成没有冲击层 */ }
  return arr;
})();

const HitLayer: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  let flash = 0, punch = 0, ring = 0, strong = 0;
  for (const h of HITS) {
    const d = t - h.t;
    if (d < -0.12 || d > 0.42) continue;
    // 命中前 0.12s 蓄力（微微收缩），命中瞬间最亮，之后 0.42s 衰减
    if (d < 0) { punch = Math.max(punch, 0.35 * (1 + d / 0.12)); }
    else {
      const k = 1 - d / 0.42;
      flash = Math.max(flash, k * k * (h.s > 0.95 ? 0.5 : 0.3));
      punch = Math.max(punch, k * (h.s > 0.95 ? 1 : 0.55));
      ring = Math.max(ring, k * h.s);
      strong = Math.max(strong, k * (h.s > 0.95 ? 1 : 0));
    }
  }
  if (flash <= 0 && punch <= 0) return null;
  return (
    <>
      {/* 冲击缩放：命中瞬间画面轻轻往前顶一下，耳朵和眼睛同时被点着 */}
      <AbsoluteFill style={{
        transform: `scale(${1 + punch * 0.012})`,
        transformOrigin: '50% 50%',
      }} />
      {/* 命中白闪（只 2-3 帧，长了会廉价）*/}
      {flash > 0.012 ? (
        <AbsoluteFill style={{
          background: `rgba(255,255,255,${(flash * 0.55).toFixed(3)})`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }} />
      ) : null}
      {/* 环形冲击波：从画面中心荡出去，代替"随便加个音效" */}
      {ring > 0.05 ? (
        <AbsoluteFill style={{ pointerEvents: 'none', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 240 + (1 - ring) * 1500, height: 240 + (1 - ring) * 1500,
            border: `${Math.max(1, 5 * ring).toFixed(1)}px solid rgba(255,210,74,${(ring * 0.5).toFixed(3)})`,
            borderRadius: '50%',
            boxShadow: `0 0 ${60 * ring}px rgba(255,210,74,${(ring * 0.5).toFixed(3)}), inset 0 0 ${40 * ring}px rgba(255,210,74,${(ring * 0.3).toFixed(3)})`,
          }} />
        </AbsoluteFill>
      ) : null}
      {/* 强拍压暗边角，让中心更炸 */}
      {strong > 0.02 ? (
        <AbsoluteFill style={{
          pointerEvents: 'none',
          boxShadow: `inset 0 0 ${220 * strong}px rgba(0,0,0,${(0.55 * strong).toFixed(3)})`,
        }} />
      ) : null}
    </>
  );
};

export const Repeat: React.FC = () => {
  const f = useCurrentFrame();
  let idx = BEATS.length - 1;
  for (let i = 0; i < BEATS.length; i++) { if (f < F[i + 1]) { idx = i; break; } }
  const hot = idx === 18 ? clamp01((f - F[18]) / 115) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <Starfield hot={hot} />
      <div style={{ position: 'absolute', top: 40, left: 56, fontFamily: FONT, fontSize: 26, fontWeight: 800, color: WHITE, letterSpacing: 4 }}>
        <span style={{ color: GOLD }}>重复</span>
        <span style={{ marginLeft: 14, fontSize: 18, color: GREY, letterSpacing: 3 }}>REPETITION</span>
      </div>
      <Scene i={idx} />
      <LaoJia mode={idx === BEATS.length - 1 ? 'cheer' : idx % 3 === 0 ? 'point' : 'mic'} side="left" delay={0} forceTalk />
      <LaoJia mode={idx === BEATS.length - 1 ? 'cheer' : idx % 3 === 1 ? 'point' : 'gasp'} side="right" delay={9} forceTalk />
      <Caption />
      {/* 音乐保持 v11 的 Midnight Rush（老贾 10/19 定："原来那个视频是对的，v11"），
          原曲一个音都不剪。卡点靠 HitLayer 跟着曲子真峰做画面冲击，不靠剪音乐。*/}
      <HitLayer />
      <Audio
        src={staticFile('bgm_midnight.m4a')}
        volume={(fr) => 0.88 * interpolate(fr, [F[BEATS.length] - 26, F[BEATS.length] - 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    </AbsoluteFill>
  );
};
