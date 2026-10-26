import React from 'react';
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, staticFile, Audio, Sequence,
} from 'remotion';
import { SCRIPT } from './ep2Script';
import { F, DUR, TOTAL_FRAMES } from './ep2Timeline';
import { CHARS } from './ep2Chars';

const BLACK = '#000000';
const WHITE = '#F8F8F8';
const YELLOW = '#F0E000';
const CYAN = '#1890C0';
const CORAL = '#F06048';
const BROWN = '#685850';
const GREY1 = '#2A2A2A';
const GREY2 = '#6A6A6A';
const FONT = '"Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", sans-serif';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const easeOut = (u: number) => 1 - Math.pow(1 - clamp01(u), 3);
const easeInOut = (u: number) => {
  const x = clamp01(u);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const grow = (f: number, d: number, dur = 18) => interpolate(f, [d, d + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const fadeIn = (f: number, d: number, dur = 12) => interpolate(f, [d, d + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const fadeOut = (f: number, end: number, dur = 12) => interpolate(f, [end - dur, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const shake = (f: number, amp = 10, decay = 0.9) => Math.sin(f * 2.4) * amp * Math.pow(decay, f / 6);
const pulse = (f: number, period = 46, amt = 0.35) => 0.5 + 0.5 * Math.sin((f / period) * Math.PI * 2) * amt + amt * 0.5;

/* ============ 弹簧入场：所有元素都从"动"里长出来，不用静态 fade ============ */
const Pop: React.FC<{
  d?: number; dur?: number; from?: number; dist?: number; cx?: number; cy?: number; rot?: number;
  children: React.ReactNode;
}> = ({ d = 0, dur = 26, from = 0.82, dist = 30, cx = 960, cy = 460, rot = 0, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < d - 4) return null;
  const u = spring({ frame: Math.max(0, f - d), fps, config: { damping: 14, stiffness: 150 }, durationInFrames: dur });
  const o = clamp01((f - d) / 7);
  const s = from + (1 - from) * u;
  return (
    <g opacity={o} transform={`translate(${cx} ${cy + (1 - u) * dist}) rotate(${(1 - u) * rot}) scale(${s}) translate(${-cx} ${-cy})`}>
      {children}
    </g>
  );
};

/* ============ 背景：网格在走、尘埃在飘、光晕在呼吸 ============ */
const Grid: React.FC = () => {
  const f = useCurrentFrame();
  const ox = (f * 0.5) % 160;
  const oy = (f * 0.28) % 135;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute' }}>
      {Array.from({ length: 14 }).map((_, k) => (
        <line key={'v' + k} x1={k * 160 + ox} y1={0} x2={k * 160 + ox} y2={1080} stroke="#151515" strokeWidth={1} />
      ))}
      {Array.from({ length: 10 }).map((_, k) => (
        <line key={'h' + k} x1={0} y1={k * 135 + oy} x2={1920} y2={k * 135 + oy} stroke="#131313" strokeWidth={1} />
      ))}
    </svg>
  );
};

const Dust: React.FC<{ color: string; seed: number; n?: number }> = ({ color, seed, n = 26 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute' }}>
      {Array.from({ length: n }).map((_, k) => {
        const r1 = rand(seed * 100 + k * 3.1);
        const r2 = rand(seed * 57 + k * 7.7);
        const r3 = rand(seed * 13 + k * 11.3);
        const y = (((r1 * 1120 - f * (0.35 + r3 * 0.7)) % 1120) + 1120) % 1120 - 20;
        const x = r2 * 1920 + Math.sin(f / 70 + k) * 22;
        return <circle key={k} cx={x} cy={y} r={1 + r3 * 2.4} fill={color} opacity={0.08 + 0.22 * r3} />;
      })}
    </svg>
  );
};

const Halo: React.FC<{ cx: number; cy: number; r: number; color: string; powered?: number }> = ({ cx, cy, r, color, powered = 1 }) => {
  const f = useCurrentFrame();
  const k = 1 + 0.05 * Math.sin(f / 40);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute' }}>
      <defs>
        <radialGradient id={`hg-${cx}-${cy}`}>
          <stop offset="0%" stopColor={color} stopOpacity={0.20 * powered} />
          <stop offset="55%" stopColor={color} stopOpacity={0.05 * powered} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * k} fill={`url(#hg-${cx}-${cy})`} />
    </svg>
  );
};

/* ============ 贯穿全片的概率条 ============ */
const STEPS = [0.01, 0.01, 0.02, 0.03, 0.05, 0.07, 0.10, 0.14, 0.20, 0.28, 0.40, 0.52, 0.62, 0.70, 0.78, 0.84, 0.89, 0.93, 0.96, 0.98];
const ProbBar: React.FC = () => {
  const f = useCurrentFrame();
  let idx = 0;
  for (let i = 0; i < F.length - 1; i++) if (f >= F[i]) idx = i;
  const prev = STEPS[Math.max(0, idx - 1)];
  const u = easeInOut(clamp01((f - F[idx]) / 32));
  const val = lerp(prev, STEPS[idx], u);
  const BW = 900;
  const hot = idx >= 10;
  return (
    <div style={{ position: 'absolute', top: 24, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 0.95 }}>
      <div style={{ fontFamily: FONT, fontSize: 20, color: GREY2, letterSpacing: 6 }}>LARGE LANGUAGE MODEL · 下一个 TOKEN 的概率</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <div style={{
          fontFamily: FONT, fontSize: 68, fontWeight: 800, color: hot ? YELLOW : CORAL,
          fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          textShadow: hot ? '0 0 26px rgba(240,224,0,0.45)' : '0 0 20px rgba(240,96,72,0.35)',
        }}>{val.toFixed(2)}</div>
        <div style={{ fontFamily: FONT, fontSize: 24, color: GREY2 }}>{idx < 8 ? 'RANDOM' : idx < 12 ? 'LEARNING' : 'PREDICTING'}</div>
      </div>
      <svg width={BW} height={6}>
        <rect x={0} y={0} width={BW} height={6} fill={GREY1} rx={3} />
        <rect x={0} y={0} width={BW * val} height={6} fill={hot ? YELLOW : CORAL} rx={3} />
        <circle cx={BW * val} cy={3} r={5} fill={hot ? YELLOW : CORAL} opacity={0.6 + 0.4 * Math.sin(f / 6)} />
      </svg>
    </div>
  );
};

/* ============================================================
 *  第 0 幕 · 开头 5 秒钩子
 *  打字 → 2 秒环 → "它在想吗"被划掉 → 气泡炸成 token → 巨字砸下 → 概率条
 * ============================================================ */
const S0: React.FC<{ f: number }> = ({ f }) => {
  const typeN = Math.min(9, Math.floor(Math.max(0, f - 16) / 3.2));
  const ring = clamp01((f - 78) / 46);
  const boom = clamp01((f - 172) / 16);
  const slam = spring({ frame: Math.max(0, f - 188), fps: 30, config: { damping: 9, stiffness: 190 }, durationInFrames: 24 });
  const bars = clamp01((f - 228) / 20);
  const words: [string, number][] = [['的', 0.41], ['是', 0.22], ['一', 0.14], ['这', 0.09], ['它', 0.06]];
  return (
    <>
      <g opacity={1 - boom}>
        <rect x={430} y={250} width={1060} height={330} rx={28} fill="rgba(255,255,255,0.03)" stroke="#2E2E2E" strokeWidth={2}
          strokeDasharray={3000} strokeDashoffset={3000 * (1 - grow(f, 0, 18))} />
        <path d="M 470 580 L 470 626 L 516 580" fill="none" stroke="#2E2E2E" strokeWidth={2} opacity={grow(f, 14, 10)} />
        <text x={500} y={372} fontFamily={FONT} fontSize={44} fill={WHITE} letterSpacing={1}>
          {'你问 AI 一个问题'.slice(0, typeN)}
          <tspan fill={YELLOW} opacity={(f < 46 || Math.floor(f / 9) % 2 === 0) ? 1 : 0}>▍</tspan>
        </text>
      </g>

      {/* 2 秒计时环 */}
      <g opacity={grow(f, 76, 10) * (1 - boom)} transform={`translate(1610 420)`}>
        <circle r={72} fill="none" stroke={GREY1} strokeWidth={10} />
        <circle r={72} fill="none" stroke={YELLOW} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 72} strokeDashoffset={2 * Math.PI * 72 * (1 - ring)} transform="rotate(-90)" />
        <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={YELLOW}
          style={{ fontVariantNumeric: 'tabular-nums' }}>{(ring * 2).toFixed(1)}</text>
        <text x={0} y={112} textAnchor="middle" fontFamily={FONT} fontSize={20} fill={GREY2} letterSpacing={3}>SECONDS</text>
      </g>

      {/* 它在想吗 → 划掉 */}
      {f >= 118 && f < 176 && (
        <g opacity={grow(f, 118, 8) * (1 - clamp01((f - 166) / 8))}>
          <text x={960} y={668} textAnchor="middle" fontFamily={FONT} fontSize={40} fill={GREY2}>它在想吗？</text>
          <line x1={960 - 150 * grow(f, 138, 12)} y1={650} x2={960 + 150 * grow(f, 138, 12)} y2={686} stroke={CORAL} strokeWidth={6} strokeLinecap="round" />
        </g>
      )}

      {/* 气泡炸成 token */}
      {Array.from({ length: 16 }).map((_, k) => {
        const u = clamp01((f - 172) / 24);
        if (u <= 0) return null;
        const a = rand(k * 3.7) * Math.PI * 2;
        const r = u * (170 + rand(k * 7.1) * 420);
        const w = 14 + rand(k * 2.3) * 22;
        return <rect key={k} x={960 + Math.cos(a) * r - w / 2} y={410 + Math.sin(a) * r * 0.62 - 8}
          width={w} height={14} rx={3} fill={k % 3 === 0 ? YELLOW : k % 3 === 1 ? CYAN : '#8A8A8A'}
          opacity={(1 - u) * 0.85} transform={`rotate(${a * 57 + f * 3} ${960 + Math.cos(a) * r} ${410 + Math.sin(a) * r * 0.62})`} />;
      })}

      {/* 巨字砸下 */}
      {f >= 188 && (
        <g opacity={clamp01((f - 188) / 6)} transform={`translate(960 452) scale(${1.55 - 0.55 * slam}) translate(-960 -452)`}>
          <text x={960} y={452} textAnchor="middle" fontFamily={FONT} fontSize={132} fontWeight={900} fill={YELLOW}
            letterSpacing={6} style={{ filter: 'drop-shadow(0 0 34px rgba(240,224,0,0.5))' }}>下一个字</text>
        </g>
      )}

      {/* 概率条赛跑 */}
      {words.map(([w, p], k) => {
        const u = easeOut(clamp01((bars - k * 0.12) / 0.7));
        const y = 566 + k * 52;
        return (
          <g key={k} opacity={clamp01(bars * 3 - k * 0.3)}>
            <text x={600} y={y + 22} fontFamily={FONT} fontSize={30} fontWeight={700} fill={k === 0 ? YELLOW : WHITE}>{w}</text>
            <rect x={660} y={y} width={620} height={22} rx={11} fill="rgba(255,255,255,0.05)" />
            <rect x={660} y={y} width={620 * p * 2.1 * u} height={22} rx={11} fill={k === 0 ? YELLOW : '#3A3A3A'}
              opacity={k === 0 ? 0.85 + 0.15 * Math.sin(f / 5) : 1} />
            <text x={1320} y={y + 22} fontFamily={FONT} fontSize={26} fill={k === 0 ? YELLOW : GREY2}
              style={{ fontVariantNumeric: 'tabular-nums' }}>{(p * u).toFixed(2)}</text>
          </g>
        );
      })}
    </>
  );
};

/* ============================================================
 *  第 1 幕 · 输入法候选条：同一件事
 * ============================================================ */
const S1: React.FC<{ f: number }> = ({ f }) => {
  const typeN = Math.min(4, Math.floor(Math.max(0, f - 12) / 6));
  const pick = easeOut(clamp01((f - 96) / 24));
  const cands = [['真', '0.62'], ['很', '0.18'], ['不', '0.09']];
  return (
    <>
      <Pop d={4} cy={600} dist={90}>
        <rect x={330} y={596} width={1260} height={104} rx={18} fill="rgba(255,255,255,0.05)" stroke="#3A3A3A" strokeWidth={2} />
        <text x={382} y={662} fontFamily={FONT} fontSize={44} fill={WHITE}>{'今天天气'.slice(0, typeN)}</text>
        <rect x={386 + typeN * 46} y={618} width={4} height={56} fill={YELLOW} opacity={Math.floor(f / 8) % 2 ? 1 : 0} />
        <rect x={1480} y={622} width={72} height={52} rx={8} fill={YELLOW} opacity={0.15 + 0.15 * Math.sin(f / 8)} />
        <text x={1516} y={660} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={YELLOW}>⏎</text>
      </Pop>

      {cands.map(([w, p], k) => {
        const sel = k === 0;
        const u = clamp01((f - (30 + k * 9)) / 14);
        if (u <= 0) return null;
        const lift = sel ? pick * 30 : 0;
        const sc = sel ? 1 + 0.06 * Math.sin(f / 6) : 1;
        return (
          <g key={k} opacity={u} transform={`translate(${560 + k * 230} ${470 - lift}) scale(${sc}) translate(${-(560 + k * 230)} ${-(470 - lift)})`}>
            <rect x={480 + k * 230} y={430} width={160} height={100} rx={12}
              fill={sel ? 'rgba(240,224,0,0.12)' : 'rgba(255,255,255,0.04)'}
              stroke={sel ? YELLOW : '#3A3A3A'} strokeWidth={sel ? 3 : 2} />
            <text x={560 + k * 230} y={498} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={700} fill={sel ? YELLOW : WHITE}>{w}</text>
            <text x={560 + k * 230} y={566} textAnchor="middle" fontFamily={FONT} fontSize={18} fill={GREY2}>{p}</text>
          </g>
        );
      })}

      {pick > 0 && (
        <g opacity={pick}>
          <path d={`M 560 600 L 560 ${640 + 20 * pick}`} stroke={YELLOW} strokeWidth={4} strokeDasharray="10 8" strokeDashoffset={-f * 2} />
          <rect x={470} y={690} width={980} height={4} fill={YELLOW} opacity={0.25 * pick} />
          <text x={960} y={742} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={GREY2}>同一个动作：算下一个</text>
        </g>
      )}
    </>
  );
};

/* ============================================================
 *  第 2 幕 · 几千亿词灌进来
 * ============================================================ */
const S2: React.FC<{ f: number }> = ({ f }) => {
  const lanes = [
    { y: 320, label: 'WEB', color: CYAN },
    { y: 470, label: 'BOOKS', color: YELLOW },
    { y: 620, label: 'CODE', color: WHITE },
  ];
  const glyphs = '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严';
  return (
    <>
      {lanes.map((ln, L) => (
        <g key={L}>
          <text x={110} y={ln.y - 42} fontFamily={FONT} fontSize={18} fill={GREY2} letterSpacing={5}>{ln.label}</text>
          <line x1={110} y1={ln.y - 26} x2={1180} y2={ln.y - 26} stroke="#1E1E1E" strokeWidth={1} />
          {Array.from({ length: 22 }).map((_, k) => {
            const t = ((f * (0.010 + L * 0.002) + k / 22) % 1);
            const x = 120 + t * 1060;
            const y = ln.y + Math.sin(t * Math.PI * 2 + L * 1.6) * 26;
            const ch = glyphs[(k * 17 + L * 31) % glyphs.length];
            return (
              <text key={k} x={x} y={y} fontFamily={FONT} fontSize={17 + (k % 4) * 4} fill={ln.color}
                opacity={0.15 + 0.7 * Math.sin(t * Math.PI)}>{ch}</text>
            );
          })}
          <path d={`M 1160 ${ln.y} Q 1300 ${ln.y} 1380 470`} fill="none" stroke={ln.color} strokeWidth={2.5}
            strokeDasharray="8 10" opacity={0.35} strokeDashoffset={-f * 3} />
        </g>
      ))}
      <Pop d={10} cx={1550} cy={470} from={0.7}>
        <rect x={1390} y={330} width={320} height={280} rx={20} fill="rgba(240,224,0,0.04)" stroke={YELLOW} strokeWidth={3}
          opacity={0.8 + 0.2 * Math.sin(f / 8)} />
        <rect x={1406} y={346} width={288} height={248} rx={14} fill="none" stroke="rgba(240,224,0,0.25)" strokeWidth={1} />
        <text x={1550} y={452} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={YELLOW}>模型</text>
        <text x={1550} y={500} textAnchor="middle" fontFamily={FONT} fontSize={18} fill={GREY2}>读过的全部文字</text>
        <text x={1550} y={560} textAnchor="middle" fontFamily={FONT} fontSize={34} fill={WHITE}
          style={{ fontVariantNumeric: 'tabular-nums' }}>3 × 10¹¹</text>
        <text x={1550} y={590} textAnchor="middle" fontFamily={FONT} fontSize={16} fill={GREY2} letterSpacing={3}>TOKENS</text>
      </Pop>
      {Array.from({ length: 3 }).map((_, L) => (
        <circle key={L} cx={1390 + Math.sin(f / 9 + L) * 6} cy={390 + L * 70} r={5} fill={lanes[L].color} opacity={0.6 + 0.4 * Math.sin(f / 5 + L)} />
      ))}
    </>
  );
};

/* ============================================================
 *  第 3 幕 · 一刀切成 token
 * ============================================================ */
const S3: React.FC<{ f: number }> = ({ f }) => {
  const cut = clamp01((f - 26) / 40);
  const split = easeOut(clamp01((f - 58) / 26));
  const sparks = clamp01((f - 58) / 18);
  const words = ['神经', '网络', '很', '厉害'];
  const centers = [500, 800, 1100, 1330];
  return (
    <>
      <text x={960} y={262} textAnchor="middle" fontFamily={FONT} fontSize={20} fill={GREY2} letterSpacing={6}>TOKENIZER</text>
      <g opacity={grow(f, 0, 12)}>
        <rect x={360} y={380} width={1200} height={180} rx={14} fill="rgba(255,255,255,0.03)" stroke="#2E2E2E" strokeWidth={2} />
        <text x={420} y={486} fontFamily={FONT} fontSize={64} fontWeight={700} fill={WHITE}>神经网络很厉害</text>
      </g>
      <line x1={430 + cut * 1030} y1={340} x2={430 + cut * 1030} y2={606} stroke={CORAL} strokeWidth={4}
        opacity={f > 20 && f < 78 ? 1 : 0} style={{ filter: 'drop-shadow(0 0 12px rgba(240,96,72,0.8))' }} />
      {[0, 1, 2].map((k) => {
        const x = 620 + k * 300;
        return (
          <g key={k} opacity={sparks}>
            {Array.from({ length: 5 }).map((_, s) => (
              <circle key={s} cx={x + (rand(k * 5 + s) - 0.5) * 70 * sparks} cy={470 + (rand(k * 9 + s) - 0.5) * 110 * sparks}
                r={2 + rand(s) * 3} fill={CORAL} opacity={(1 - sparks) * 0.9} />
            ))}
          </g>
        );
      })}
      {words.map((w, k) => {
        const dx = (centers[k] - 960) * 0.16 * split;
        const dy = (k % 2 ? -1 : 1) * 14 * split;
        return (
          <g key={k} opacity={grow(f, 6 + k * 3, 12)} transform={`translate(${dx} ${dy})`}>
            <rect x={centers[k] - 100} y={398} width={200} height={144} rx={10}
              fill={split > 0.2 ? 'rgba(24,144,192,0.10)' : 'transparent'}
              stroke={split > 0.2 ? CYAN : 'transparent'} strokeWidth={3} />
            <text x={centers[k]} y={492} textAnchor='middle' fontFamily={FONT} fontSize={52} fontWeight={700} fill={WHITE}>{w}</text>
            {split > 0.2 && <text x={centers[k]} y={592} textAnchor='middle' fontFamily={FONT} fontSize={18} fill={CYAN}
              opacity={clamp01((split - 0.2) * 2)}>token {k + 1}</text>}
          </g>
        );
      })}
      <text x={960} y={690} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={GREY2} opacity={grow(f, 84, 16)}>
        按出现频率切 · 不按语法切
      </text>
    </>
  );
};

/* ============================================================
 *  第 4 幕 · token → 编号（翻牌 + 扫描）
 * ============================================================ */
const S4: React.FC<{ f: number }> = ({ f }) => {
  const flip = clamp01((f - 34) / 18) - clamp01((f - 62) / 18);
  const items = [{ t: '神经', id: 45231 }, { t: '网络', id: 8832 }, { t: '很', id: 1207 }];
  const scanX = 300 + ((f * 8) % 1300);
  return (
    <>
      <text x={960} y={262} textAnchor="middle" fontFamily={FONT} fontSize={20} fill={GREY2} letterSpacing={6}>TOKEN → ID</text>
      <line x1={scanX} y1={320} x2={scanX} y2={660} stroke={YELLOW} strokeWidth={2} opacity={0.18} />
      <rect x={scanX - 40} y={320} width={80} height={340} fill={`url(#scanG)`} opacity={0.12} />
      <defs>
        <linearGradient id="scanG" x1="0" x2="1">
          <stop offset="0%" stopColor={YELLOW} stopOpacity="0" />
          <stop offset="50%" stopColor={YELLOW} stopOpacity="1" />
          <stop offset="100%" stopColor={YELLOW} stopOpacity="0" />
        </linearGradient>
      </defs>
      {items.map((it, k) => {
        const cx = 560 + k * 400;
        const sx = Math.abs(Math.cos(flip * Math.PI * 0.5));
        const num = Math.round(it.id * easeOut(clamp01((f - 46) / 26)));
        return (
          <Pop key={k} d={6 + k * 5} cx={cx} cy={470}>
            <g transform={`translate(${cx} 470) scale(${Math.max(0.06, sx)} 1) translate(${-cx} -470)`}>
              <rect x={cx - 140} y={390} width={280} height={160} rx={12} fill="rgba(255,255,255,0.04)" stroke={YELLOW} strokeWidth={3} />
              <text x={cx} y={488} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={800}
                fill={flip > 0 ? YELLOW : WHITE} style={{ fontVariantNumeric: 'tabular-nums' }}>{flip > 0 ? num.toLocaleString('en-US') : it.t}</text>
            </g>
            <text x={cx} y={596} textAnchor="middle" fontFamily={FONT} fontSize={16} fill={GREY2} letterSpacing={3} opacity={flip}>TOKEN ID</text>
          </Pop>
        );
      })}
      <text x={960} y={704} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={GREY2} opacity={grow(f, 76, 16)}>
        模型从头到尾，没见过真正的字
      </text>
    </>
  );
};

/* ============================================================
 *  第 5 幕 · ID → 向量（数组生长 + 波动）
 * ============================================================ */
const S5: React.FC<{ f: number }> = ({ f }) => {
  const vals = [0.21, -0.44, 0.08, 0.63, -0.12, 0.37, -0.28, 0.55, 0.02, -0.19, 0.41, -0.05];
  return (
    <>
      <text x={960} y={262} textAnchor="middle" fontFamily={FONT} fontSize={20} fill={GREY2} letterSpacing={6}>EMBEDDING</text>
      <Pop d={4} cx={300} cy={470}>
        <rect x={160} y={420} width={280} height={100} rx={10} fill="rgba(240,224,0,0.07)" stroke={YELLOW} strokeWidth={3} />
        <text x={300} y={486} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={800} fill={YELLOW}
          style={{ fontVariantNumeric: 'tabular-nums' }}>45231</text>
      </Pop>
      <path d="M 450 470 L 620 470" stroke={GREY2} strokeWidth={3} strokeDasharray="10 8" strokeDashoffset={-f * 3} opacity={grow(f, 12, 12)} />
      <line x1={640} y1={470} x2={1790} y2={470} stroke="#222" strokeWidth={2} />
      {vals.map((v, k) => {
        const u = spring({ frame: Math.max(0, f - 16 - k * 3), fps: 30, config: { damping: 12, stiffness: 130 } });
        const wob = Math.sin(f / 9 + k * 0.9) * 10;
        const h = (Math.abs(v) * 300 + wob) * u;
        return (
          <g key={k} opacity={clamp01(u)}>
            <rect x={650 + k * 92} y={v >= 0 ? 470 - h : 470} width={56} height={h} rx={4}
              fill={v >= 0 ? CYAN : CORAL} opacity={0.8} />
            <text x={678 + k * 92} y={v >= 0 ? 470 - h - 12 : 470 + h + 24} textAnchor="middle"
              fontFamily={FONT} fontSize={15} fill={GREY2} style={{ fontVariantNumeric: 'tabular-nums' }}>{v.toFixed(2)}</text>
          </g>
        );
      })}
      <text x={960} y={700} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={GREY2} opacity={grow(f, 62, 16)}>
        这一串小数，就是这个词在模型里的位置
      </text>
    </>
  );
};

/* ============================================================
 *  第 6 幕 · 向量空间：近与远
 * ============================================================ */
const S6: React.FC<{ f: number }> = ({ f }) => {
  const pts = [
    { x: 640, y: 400, t: '猫', c: YELLOW, d: 0 },
    { x: 760, y: 452, t: '狗', c: WHITE, d: 10 },
    { x: 1040, y: 330, t: '苹果', c: WHITE, d: 18 },
    { x: 1440, y: 620, t: '火箭', c: WHITE, d: 26 },
    { x: 930, y: 600, t: '汽车', c: WHITE, d: 34 },
  ];
  return (
    <>
      <line x1={280} y1={720} x2={1700} y2={720} stroke="#242424" strokeWidth={2} />
      <line x1={280} y1={720} x2={280} y2={250} stroke="#242424" strokeWidth={2} />
      {Array.from({ length: 6 }).map((_, k) => (
        <line key={k} x1={280} y1={720 - k * 80} x2={1700} y2={720 - k * 80} stroke="#141414" strokeWidth={1} />
      ))}
      <g opacity={grow(f, 44, 20)}>
        <line x1={640} y1={400} x2={760} y2={452} stroke={YELLOW} strokeWidth={3} strokeDasharray="6 6" strokeDashoffset={-f * 2} />
        <text x={700} y={404} textAnchor="middle" fontFamily={FONT} fontSize={18} fill={YELLOW}>近</text>
        <line x1={640} y1={400} x2={1440} y2={620} stroke={CORAL} strokeWidth={2.5} strokeDasharray="8 10" opacity={0.7} />
        <text x={1040} y={486} textAnchor="middle" fontFamily={FONT} fontSize={18} fill={CORAL}>远</text>
      </g>
      {pts.map((p, k) => {
        const u = clamp01((f - 6 - p.d) / 14);
        if (u <= 0) return null;
        const dy = Math.sin(f / 24 + k) * 6;
        return (
          <g key={k} opacity={u} transform={`translate(0 ${dy})`}>
            {p.c === YELLOW && Array.from({ length: 3 }).map((_, r) => (
              <circle key={r} cx={p.x} cy={p.y} r={(14 + ((f / 3 + r * 26) % 52))} fill="none" stroke={YELLOW}
                strokeWidth={1.5} opacity={0.35 * (1 - ((f / 3 + r * 26) % 52) / 52)} />
            ))}
            <circle cx={p.x} cy={p.y} r={11} fill={p.c} />
            <text x={p.x + 20} y={p.y + 9} fontFamily={FONT} fontSize={30} fill={p.c}>{p.t}</text>
          </g>
        );
      })}
      <text x={960} y={800} textAnchor="middle" fontFamily={FONT} fontSize={25} fill={GREY2} opacity={grow(f, 60, 18)}>
        意思越近，位置越近
      </text>
    </>
  );
};

/* ============================================================
 *  第 7 幕 · 前文 → 模型 → 概率
 * ============================================================ */
const S7: React.FC<{ f: number }> = ({ f }) => {
  const bars = [0.09, 0.24, 0.41, 0.62, 0.18, 0.11, 0.05, 0.03];
  return (
    <>
      {['今天', '天气', '真'].map((t, k) => (
        <Pop key={k} d={4 + k * 5} cx={170 + k * 170} cy={470} from={0.7} rot={-6}>
          <rect x={100 + k * 170} y={432} width={150} height={88} rx={9} fill="rgba(255,255,255,0.04)" stroke={CYAN} strokeWidth={2.5} />
          <text x={175 + k * 170} y={490} textAnchor="middle" fontFamily={FONT} fontSize={38} fill={WHITE}>{t}</text>
        </Pop>
      ))}
      <path d={`M 620 476 L 700 476`} stroke={GREY2} strokeWidth={3} strokeDasharray="9 7" strokeDashoffset={-f * 3} opacity={grow(f, 18, 12)} />
      <Pop d={18} cx={790} cy={476} from={0.6}>
        <rect x={700} y={400} width={230} height={160} rx={14} fill="rgba(240,224,0,0.05)" stroke={YELLOW} strokeWidth={3}
          opacity={0.85 + 0.15 * Math.sin(f / 7)} />
        <text x={815} y={466} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={YELLOW}>模型</text>
        <text x={815} y={506} textAnchor="middle" fontFamily={FONT} fontSize={16} fill={GREY2}>P(next | 前文)</text>
      </Pop>
      <path d={`M 940 476 L 1020 476`} stroke={GREY2} strokeWidth={3} strokeDasharray="9 7" strokeDashoffset={-f * 3} opacity={grow(f, 30, 12)} />
      {bars.map((v, k) => {
        const u = spring({ frame: Math.max(0, f - 34 - k * 3), fps: 30, config: { damping: 11, stiffness: 120 } });
        const h = v * 330 * u;
        return (
          <g key={k}>
            <rect x={1050 + k * 78} y={660 - h} width={52} height={h} rx={4} fill={k === 3 ? YELLOW : '#3C3C3C'}
              opacity={k === 3 ? 0.9 + 0.1 * Math.sin(f / 5) : 0.9} />
            <text x={1076 + k * 78} y={692} textAnchor="middle" fontFamily={FONT} fontSize={15} fill={k === 3 ? YELLOW : GREY2}>{(v * 100).toFixed(0)}%</text>
          </g>
        );
      })}
      <text x={1350} y={330} fontFamily={FONT} fontSize={18} fill={GREY2} letterSpacing={3} opacity={grow(f, 50, 14)}>下一个 TOKEN</text>
    </>
  );
};

/* ============================================================
 *  第 8 幕 · 十万个分数同时算
 * ============================================================ */
const S8: React.FC<{ f: number }> = ({ f }) => {
  const N = 200;
  const spike = easeOut(clamp01((f - 54) / 26));
  const sh = shake(f - 54, 9, 0.86);
  return (
    <>
      <text x={960} y={266} textAnchor="middle" fontFamily={FONT} fontSize={20} fill={GREY2} letterSpacing={5}>词表里的每一个 TOKEN</text>
      <g transform={`translate(${sh} 0)`}>
        {Array.from({ length: N }).map((_, k) => {
          const base = 20 + Math.abs(Math.sin(k * 1.7 + 0.4)) * 84;
          const hot = k === 87;
          const h = hot ? base + 340 * spike : base;
          const on = grow(f, 4 + (k % 30) * 1.4, 10);
          return <rect key={k} x={196 + k * 7.6} y={640 - h} width={4.8} height={h} rx={1.5}
            fill={hot ? YELLOW : '#333'} opacity={on * (hot ? 1 : 0.9)} />;
        })}
        <line x1={190} y1={640} x2={1720} y2={640} stroke="#2A2A2A" strokeWidth={2} />
      </g>
      <text x={960} y={716} textAnchor="middle" fontFamily={FONT} fontSize={50} fontWeight={900} fill={YELLOW}
        opacity={grow(f, 44, 16)} style={{ filter: 'drop-shadow(0 0 22px rgba(240,224,0,0.4))' }}>100,000</text>
      <text x={960} y={758} textAnchor="middle" fontFamily={FONT} fontSize={20} fill={GREY2} opacity={grow(f, 48, 14)}>个 token · 每个一个分数</text>
      <text x={960} y={806} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={WHITE} opacity={grow(f, 76, 16)}>最后只挑 1 个</text>
    </>
  );
};

/* ============================================================
 *  第 9 幕 · softmax：分数变概率，和 = 1
 * ============================================================ */
const S9: React.FC<{ f: number }> = ({ f }) => {
  const scores = [-2.1, 1.4, 3.2, 0.6, -0.8, 2.0, -1.5, 0.1, 1.1, -0.4];
  const probs = [0.02, 0.11, 0.48, 0.06, 0.03, 0.18, 0.02, 0.04, 0.05, 0.01];
  const morph = easeInOut(clamp01((f - 34) / 34));
  const sum = easeOut(clamp01((f - 70) / 26));
  return (
    <>
      <text x={330} y={276} textAnchor="middle" fontFamily={FONT} fontSize={20} fill={GREY2} letterSpacing={5}>SCORES</text>
      {scores.map((v, k) => {
        const h = Math.abs(v) * 46;
        const x = 170 + k * 34;
        return <rect key={k} x={x} y={v >= 0 ? 500 - h : 500} width={22} height={h} rx={2}
          fill={v >= 0 ? CYAN : CORAL} opacity={0.8 * (1 - morph * 0.7)} />;
      })}
      <line x1={150} y1={500} x2={520} y2={500} stroke="#2A2A2A" strokeWidth={2} />
      <g opacity={grow(f, 20, 12)}>
        <text x={620} y={452} textAnchor="middle" fontFamily={FONT} fontSize={20} fill={YELLOW}>softmax</text>
        <path d="M 560 480 L 700 480" stroke={YELLOW} strokeWidth={3} strokeDasharray="10 8" strokeDashoffset={-f * 4} />
        <path d="M 680 470 L 700 480 L 680 490" fill="none" stroke={YELLOW} strokeWidth={3} />
      </g>
      <text x={1060} y={276} textAnchor="middle" fontFamily={FONT} fontSize={20} fill={GREY2} letterSpacing={5}>PROBABILITIES</text>
      {probs.map((v, k) => {
        const u = spring({ frame: Math.max(0, f - 24 - k * 2.5), fps: 30, config: { damping: 12, stiffness: 130 } });
        const h = v * 480 * morph * u;
        return <rect key={k} x={910 + k * 34} y={500 - h} width={22} height={h} rx={2}
          fill={v > 0.3 ? YELLOW : CYAN} opacity={0.9} />;
      })}
      <line x1={890} y1={500} x2={1280} y2={500} stroke="#2A2A2A" strokeWidth={2} />
      <g opacity={grow(f, 66, 14)}>
        <rect x={1430} y={280} width={48} height={330} rx={5} fill="#242424" />
        <rect x={1430} y={280 + 330 * (1 - sum)} width={48} height={330 * sum} rx={5} fill={YELLOW}
          opacity={0.85 + 0.15 * Math.sin(f / 5)} />
        <text x={1508} y={410} fontFamily={FONT} fontSize={26} fill={YELLOW}>Σp = 1</text>
        <text x={1508} y={452} fontFamily={FONT} fontSize={16} fill={GREY2}>所有概率加起来</text>
      </g>
    </>
  );
};

/* ============================================================
 *  第 10 幕 · 今天天气真 → 好 0.62
 * ============================================================ */
const S10: React.FC<{ f: number }> = ({ f }) => {
  const rows = [
    { w: '好', p: 0.62, c: YELLOW },
    { w: '热', p: 0.18, c: WHITE },
    { w: '冷', p: 0.09, c: WHITE },
  ];
  const win = clamp01((f - 58) / 18);
  return (
    <>
      <text x={960} y={286} textAnchor="middle" fontFamily={FONT} fontSize={44} fill={WHITE}>
        今天天气真 <tspan fill={YELLOW}>_</tspan>
      </text>
      <rect x={868} y={296} width={44} height={4} fill={YELLOW} opacity={0.4 + 0.6 * Math.sin(f / 6)} />
      {rows.map((r, k) => {
        const u = spring({ frame: Math.max(0, f - 10 - k * 9), fps: 30, config: { damping: 13, stiffness: 120 } });
        const w = 720 * r.p * u;
        const lift = k === 0 ? win * 14 : 0;
        const y = 392 + k * 120 - lift;
        return (
          <g key={k}>
            <text x={470} y={y + 40} fontFamily={FONT} fontSize={46} fontWeight={800} fill={r.c}>{r.w}</text>
            <rect x={560} y={y} width={740} height={38} rx={19} fill="rgba(255,255,255,0.04)" />
            <rect x={560} y={y} width={w} height={38} rx={19} fill={r.c} opacity={k === 0 ? 0.85 + 0.15 * win : 0.55} />
            <text x={1330} y={y + 30} fontFamily={FONT} fontSize={36} fill={r.c}
              style={{ fontVariantNumeric: 'tabular-nums' }}>{(r.p * u).toFixed(2)}</text>
          </g>
        );
      })}
      {win > 0 && <rect x={540} y={382 + 0} width={800} height={58} rx={12} fill="none" stroke={YELLOW} strokeWidth={2}
        opacity={win * (0.4 + 0.4 * Math.sin(f / 6))} />}
      <text x={960} y={806} textAnchor="middle" fontFamily={FONT} fontSize={20} fill={GREY2} opacity={grow(f, 66, 16)}>
        剩下 100,000 个，分 0.11
      </text>
    </>
  );
};

/* ============================================================
 *  第 11 幕 · 自回归：自己喂自己
 * ============================================================ */
const S11: React.FC<{ f: number }> = ({ f }) => {
  const add = clamp01((f - 30) / 22);
  const loop = clamp01((f - 58) / 22);
  const shift = Math.floor(clamp01((f - 92) / 30) * 2);
  const seq = ['今天', '天气', '真', '好', '不'];
  return (
    <>
      {seq.slice(0, 3 + shift).map((t, k) => {
        const isNew = k >= 3;
        const u = isNew ? add : 1;
        return (
          <g key={k} opacity={u} transform={`translate(${isNew ? (1 - u) * 120 : 0} 0)`}>
            <rect x={380 + k * 170} y={430} width={150} height={88} rx={9}
              fill={isNew ? 'rgba(240,224,0,0.12)' : 'rgba(255,255,255,0.04)'}
              stroke={isNew ? YELLOW : CYAN} strokeWidth={isNew ? 3 : 2.5} />
            <text x={455 + k * 170} y={488} textAnchor="middle" fontFamily={FONT} fontSize={38}
              fontWeight={isNew ? 800 : 400} fill={isNew ? YELLOW : WHITE}>{t}</text>
          </g>
        );
      })}
      {loop > 0 && (
        <g opacity={loop}>
          <path d="M 1150 600 C 1380 780, 380 800, 330 600" fill="none" stroke={YELLOW} strokeWidth={3}
            strokeDasharray="12 10" strokeDashoffset={-f * 4} />
          <circle cx={1150} cy={600} r={6} fill={YELLOW} />
          <text x={960} y={790} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={GREY2}>接回去，再算下一个</text>
          <text x={960} y={836} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={800} fill={YELLOW} letterSpacing={4}>自回归</text>
        </g>
      )}
    </>
  );
};

/* ============================================================
 *  第 12 幕 · 100 个字 = 100 次预测
 * ============================================================ */
const S12: React.FC<{ f: number }> = ({ f }) => {
  const n = Math.min(100, Math.floor(f * 0.9));
  return (
    <>
      <text x={560} y={540} textAnchor="middle" fontFamily={FONT} fontSize={230} fontWeight={900} fill={YELLOW}
        style={{ fontVariantNumeric: 'tabular-nums', filter: 'drop-shadow(0 0 28px rgba(240,224,0,0.35))' }}>{n}</text>
      <text x={560} y={620} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={GREY2}>次预测</text>
      {Array.from({ length: 100 }).map((_, k) => {
        const on = k < n;
        const wave = on ? 1 : 0;
        return <rect key={k} x={940 + (k % 20) * 44} y={240 + Math.floor(k / 20) * 58} width={30} height={30} rx={4}
          fill={on ? YELLOW : 'rgba(255,255,255,0.05)'} opacity={wave ? 0.85 : 0.35}
          transform={`scale(${wave ? 1 : 0.9})`} />;
      })}
      <text x={1380} y={600} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={GREY2}>100 个字</text>
      <text x={1380} y={644} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={GREY2}>不是想一次</text>
    </>
  );
};

/* ============================================================
 *  第 13 幕 · 语法/事实/上下文 → 压进向量
 * ============================================================ */
const S13: React.FC<{ f: number }> = ({ f }) => {
  const lanes = [
    { y: 310, t: '语法', c: CYAN },
    { y: 450, t: '事实', c: WHITE },
    { y: 590, t: '上下文', c: YELLOW },
  ];
  return (
    <>
      {lanes.map((ln, L) => (
        <g key={L} opacity={grow(f, 4 + L * 7, 14)}>
          <text x={250} y={ln.y + 10} fontFamily={FONT} fontSize={34} fill={ln.c}>{ln.t}</text>
          {Array.from({ length: 7 }).map((_, k) => {
            const t = ((f * 0.014 + k / 7 + L * 0.1) % 1);
            const x = lerp(430, 900, t);
            const y = ln.y + Math.sin(t * Math.PI * 2 + L) * 26;
            return <circle key={k} cx={x} cy={y} r={4 + 2 * Math.sin(t * Math.PI)} fill={ln.c} opacity={0.2 + 0.6 * Math.sin(t * Math.PI)} />;
          })}
          <path d={`M 420 ${ln.y} Q 760 ${ln.y} 950 460`} fill="none" stroke={ln.c} strokeWidth={2} opacity={0.4} />
        </g>
      ))}
      <Pop d={38} cx={1250} cy={460} from={0.75}>
        <rect x={950} y={350} width={600} height={210} rx={14} fill="rgba(255,255,255,0.03)" stroke={YELLOW} strokeWidth={3} />
        {Array.from({ length: 8 }).map((_, k) => {
          const wob = Math.sin(f / 8 + k) * 0.5 + 0.5;
          const bh = 40 + wob * 80;
          return (
            <g key={k}>
              <rect x={990 + k * 70} y={455 - bh / 2} width={48} height={bh} rx={4} fill="rgba(240,224,0,0.14)" stroke={YELLOW} strokeWidth={1.5} />
            </g>
          );
        })}
        <text x={1250} y={536} textAnchor="middle" fontFamily={FONT} fontSize={18} fill={GREY2}>全部压进同一串向量</text>
      </Pop>
    </>
  );
};

/* ============================================================
 *  第 14 幕 · 参数：1700 B
 * ============================================================ */
const S14: React.FC<{ f: number }> = ({ f }) => {
  const u = easeOut(clamp01((f - 8) / 54));
  const val = lerp(7, 1700, u);
  const label = val >= 1000 ? (val / 1000).toFixed(2) + 'T' : val.toFixed(0) + 'B';
  return (
    <>
      {Array.from({ length: 18 * 9 }).map((_, k) => {
        const y = 190 + Math.floor(k / 18) * 66 - ((f * (0.6 + rand(k) * 0.8)) % 700);
        const yy = ((y - 190) % 700 + 700) % 700 + 190;
        return <text key={k} x={120 + (k % 18) * 98} y={yy} fontFamily={FONT} fontSize={13} fill="#2C2C2C"
          opacity={0.5 + 0.5 * Math.sin(f * 0.05 + k)}>{((k * 37) % 97) / 100}</text>;
      })}
      <g transform={`translate(0 ${(1 - u) * 18})`}>
        <text x={960} y={540} textAnchor="middle" fontFamily={FONT} fontSize={172} fontWeight={900} fill={YELLOW}
          style={{ fontVariantNumeric: 'tabular-nums', filter: 'drop-shadow(0 0 30px rgba(240,224,0,0.25))' }}>{label}</text>
      </g>
      <text x={960} y={614} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={GREY2}>个参数</text>
      <text x={960} y={672} textAnchor="middle" fontFamily={FONT} fontSize={18} fill={GREY2} opacity={grow(f, 52, 18)}>
        没有一条是人写进去的规则
      </text>
    </>
  );
};

/* ============================================================
 *  第 15 幕 · 概率高 ≠ 事实对
 * ============================================================ */
const S15: React.FC<{ f: number }> = ({ f }) => {
  const tilt = -11 * easeInOut(clamp01((f - 30) / 34));
  const slam = spring({ frame: Math.max(0, f - 58), fps: 30, config: { damping: 8, stiffness: 200 } });
  const sh = shake(f - 58, 8, 0.85);
  return (
    <g transform={`translate(${sh} 0)`}>
      <g transform={`rotate(${tilt.toFixed(2)} 960 430)`}>
        <line x1={520} y1={430} x2={1400} y2={430} stroke={WHITE} strokeWidth={7} strokeLinecap="round" />
        <line x1={600} y1={430} x2={600} y2={560} stroke={GREY2} strokeWidth={3} />
        <line x1={1320} y1={430} x2={1320} y2={560} stroke={GREY2} strokeWidth={3} />
        <rect x={470} y={560} width={260} height={104} rx={10} fill="rgba(24,144,192,0.10)" stroke={CYAN} strokeWidth={2.5} />
        <text x={600} y={624} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={CYAN}>概率高</text>
        <rect x={1190} y={560} width={260} height={104} rx={10} fill="rgba(240,96,72,0.10)" stroke={CORAL} strokeWidth={2.5} />
        <text x={1320} y={624} textAnchor="middle" fontFamily={FONT} fontSize={28} fill={CORAL}>事实对</text>
      </g>
      <line x1={960} y1={430} x2={960} y2={716} stroke={WHITE} strokeWidth={7} />
      <line x1={850} y1={768} x2={1070} y2={768} stroke={WHITE} strokeWidth={9} strokeLinecap="round" />
      {f >= 58 && (
        <g opacity={clamp01((f - 58) / 6)} transform={`translate(960 680) scale(${0.5 + 0.5 * slam}) translate(-960 -680)`}>
          <text x={960} y={716} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={CORAL}
            style={{ filter: 'drop-shadow(0 0 26px rgba(240,96,72,0.5))' }}>≠</text>
        </g>
      )}
    </g>
  );
};

/* ============================================================
 *  第 16 幕 · 幻觉：流畅的错句 + 95% 置信度
 * ============================================================ */
const S16: React.FC<{ f: number }> = ({ f }) => {
  const needle = easeOut(clamp01((f - 12) / 36));
  const crack = clamp01((f - 54) / 16);
  const glitch = f > 54 && f < 78 ? Math.sin(f * 3.1) * 6 : 0;
  return (
    <g transform={`translate(${glitch} 0)`}>
      <text x={960} y={286} textAnchor="middle" fontFamily={FONT} fontSize={42} fill={WHITE}>
        爱因斯坦在 1876 年发明了电话。
      </text>
      <g transform="translate(960 566)">
        <path d="M -210 0 A 210 210 0 0 1 210 0" fill="none" stroke="#262626" strokeWidth={16} strokeLinecap="round" />
        <path d="M -210 0 A 210 210 0 0 1 210 0" fill="none" stroke={CORAL} strokeWidth={16} strokeLinecap="round"
          strokeDasharray={`${needle * Math.PI * 210} 9999`} />
        {Array.from({ length: 11 }).map((_, k) => {
          const a = Math.PI + (k / 10) * Math.PI;
          return <line key={k} x1={Math.cos(a) * 188} y1={Math.sin(a) * 188} x2={Math.cos(a) * 216} y2={Math.sin(a) * 216} stroke={GREY2} strokeWidth={3} />;
        })}
        <line x1={0} y1={0} x2={Math.cos(Math.PI + needle * Math.PI) * 172} y2={Math.sin(Math.PI + needle * Math.PI) * 172}
          stroke={YELLOW} strokeWidth={5} strokeLinecap="round" />
        <circle r={14} fill={YELLOW} />
        <text x={0} y={78} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={YELLOW}
          style={{ fontVariantNumeric: 'tabular-nums' }}>{(needle * 95).toFixed(0)}%</text>
        <text x={0} y={116} textAnchor="middle" fontFamily={FONT} fontSize={18} fill={GREY2}>置信度</text>
      </g>
      {crack > 0 && (
        <g opacity={crack}>
          <line x1={760} y1={430} x2={1160} y2={700} stroke={CORAL} strokeWidth={8} strokeLinecap="round" />
          <line x1={1160} y1={430} x2={760} y2={700} stroke={CORAL} strokeWidth={8} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

/* ============================================================
 *  第 17 幕 · 上下文窗口
 * ============================================================ */
const S17: React.FC<{ f: number }> = ({ f }) => {
  const shift = (f * 2.4) % 132;
  return (
    <>
      <text x={960} y={252} textAnchor="middle" fontFamily={FONT} fontSize={20} fill={GREY2} letterSpacing={5}>CONTEXT WINDOW</text>
      {Array.from({ length: 18 }).map((_, k) => {
        const x = 790 + k * 72 - shift;
        const out = x < 500;
        const fall = out ? (500 - x) * 0.9 : 0;
        return (
          <g key={k} opacity={out ? 0.16 : 1} transform={`translate(0 ${fall}) rotate(${out ? (500 - x) * 0.06 : 0} ${x + 27} ${470})`}>
            <rect x={x} y={460} width={56} height={64} rx={6}
              fill={out ? 'rgba(255,255,255,0.04)' : 'rgba(24,144,192,0.14)'}
              stroke={out ? GREY2 : CYAN} strokeWidth={2} />
            <text x={x + 28} y={502} textAnchor="middle" fontFamily={FONT} fontSize={15} fill={out ? GREY2 : WHITE}>tok</text>
          </g>
        );
      })}
      <rect x={500} y={420} width={860} height={150} rx={12} fill="none" stroke={YELLOW} strokeWidth={3} strokeDasharray="14 9"
        strokeDashoffset={-f * 2} />
      <text x={930} y={400} textAnchor="middle" fontFamily={FONT} fontSize={18} fill={YELLOW}>能记住的范围</text>
      <text x={960} y={790} textAnchor="middle" fontFamily={FONT} fontSize={25} fill={GREY2} opacity={grow(f, 36, 16)}>
        超出去的，就掉了
      </text>
    </>
  );
};

/* ============================================================
 *  第 18 幕 · 温度
 * ============================================================ */
const S18: React.FC<{ f: number }> = ({ f }) => {
  const sweep = (f / 78) % 1;
  const t = 0.5 + 0.5 * Math.sin(sweep * Math.PI * 2 - Math.PI / 2);
  const ang = -120 + t * 240;
  const spiky = [0.02, 0.05, 0.82, 0.05, 0.02];
  const flat = [0.16, 0.2, 0.24, 0.2, 0.16];
  return (
    <>
      <g transform="translate(470 540)">
        <circle r={168} fill="rgba(255,255,255,0.02)" stroke="#2C2C2C" strokeWidth={3} />
        {Array.from({ length: 13 }).map((_, k) => {
          const a = (-120 + (k / 12) * 240) * Math.PI / 180;
          return <line key={k} x1={Math.cos(a) * 192} y1={Math.sin(a) * 192} x2={Math.cos(a) * 218} y2={Math.sin(a) * 218}
            stroke={(k / 12) <= t ? YELLOW : '#333'} strokeWidth={4} />;
        })}
        <line x1={0} y1={0} x2={Math.cos(ang * Math.PI / 180) * 146} y2={Math.sin(ang * Math.PI / 180) * 146}
          stroke={YELLOW} strokeWidth={7} strokeLinecap="round" />
        <circle r={18} fill={YELLOW} />
        <text x={0} y={258} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={GREY2}>温度</text>
        <text x={0} y={300} textAnchor="middle" fontFamily={FONT} fontSize={34} fill={YELLOW}
          style={{ fontVariantNumeric: 'tabular-nums' }}>{t.toFixed(2)}</text>
      </g>
      {[0, 1].map((side) => {
        const cx = 1180 + side * 340;
        const hs = side === 0 ? spiky : flat;
        return (
          <g key={side} opacity={0.9}>
            {hs.map((h0, k) => {
              const h = lerp(h0, side === 0 ? flat[k] : spiky[k], 0) * 0 + h0;
              const morph = clamp01((f - 22) / 30);
              const hh = lerp(h, side === 0 ? flat[k] : spiky[k], morph);
              return <rect key={k} x={cx - 70 + k * 32} y={620 - hh * 380} width={22} height={hh * 380} rx={3}
                fill={side === 0 ? CYAN : CORAL} opacity={0.85} />;
            })}
            <line x1={cx - 80} y1={620} x2={cx + 100} y2={620} stroke="#2A2A2A" strokeWidth={2} />
            <text x={cx + 10} y={674} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={side === 0 ? CYAN : CORAL}>
              {side === 0 ? '低 · 稳' : '高 · 险'}
            </text>
          </g>
        );
      })}
      <text x={960} y={780} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={GREY2} opacity={grow(f, 30, 16)}>
        低：总挑最稳的字 · 高：敢冒险，也容易跑偏
      </text>
    </>
  );
};

/* ============================================================
 *  第 19 幕 · 收尾
 * ============================================================ */
const S19: React.FC<{ f: number }> = ({ f }) => {
  const draw = easeInOut(clamp01((f - 4) / 40));
  const neu = clamp01((f - 40) / 18);
  const lit = Math.floor(clamp01((f - 52) / 60) * 12);
  const brain = 'M -80 -60 Q -140 -20 -90 40 Q -60 90 0 70 Q 60 90 90 40 Q 140 -20 80 -60 Q 40 -110 0 -80 Q -40 -110 -80 -60 Z';
  return (
    <>
      <g transform="translate(520 420)">
        <path d={brain} fill="none" stroke={BROWN} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={700} strokeDashoffset={700 * (1 - draw)} />
        <path d="M -40 -40 Q 0 -20 0 40 M 40 -40 Q 0 -20 0 40" fill="none" stroke={BROWN} strokeWidth={4}
          opacity={0.7 * draw} />
      </g>
      <g opacity={neu}>
        <text x={760} y={460} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={CORAL}
          style={{ filter: 'drop-shadow(0 0 26px rgba(240,96,72,0.45))' }}>≠</text>
      </g>
      <Pop d={34} cx={1250} cy={420} from={0.7}>
        <rect x={1130} y={330} width={240} height={180} rx={14} fill="rgba(240,224,0,0.06)" stroke={YELLOW} strokeWidth={4} />
        <text x={1250} y={438} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={YELLOW}>P(next)</text>
        <rect x={1130} y={330} width={240} height={180} rx={14} fill="none" stroke={YELLOW} strokeWidth={2}
          opacity={0.3 + 0.3 * Math.sin(f / 7)} />
      </Pop>
      {Array.from({ length: 12 }).map((_, k) => {
        const on = k < lit;
        return (
          <g key={k}>
            <rect x={480 + k * 72} y={650} width={50} height={56} rx={5}
              fill={on ? 'rgba(240,224,0,0.18)' : 'rgba(255,255,255,0.04)'}
              stroke={on ? YELLOW : '#2A2A2A'} strokeWidth={2} transform={`translate(0 ${on ? -3 : 0})`} />
            <text x={505 + k * 72} y={686} textAnchor="middle" fontFamily={FONT} fontSize={13} fill={on ? YELLOW : GREY2}>tok</text>
          </g>
        );
      })}
      <text x={960} y={790} textAnchor="middle" fontFamily={FONT} fontSize={22} fill={GREY2} opacity={grow(f, 70, 20)}>
        Attention · 它只是知道该看哪几个字
      </text>
    </>
  );
};

/* ============ 场景调度 ============ */
const Scene: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  switch (i) {
    case 0: return <S0 f={f} />;
    case 1: return <S1 f={f} />;
    case 2: return <S2 f={f} />;
    case 3: return <S3 f={f} />;
    case 4: return <S4 f={f} />;
    case 5: return <S5 f={f} />;
    case 6: return <S6 f={f} />;
    case 7: return <S7 f={f} />;
    case 8: return <S8 f={f} />;
    case 9: return <S9 f={f} />;
    case 10: return <S10 f={f} />;
    case 11: return <S11 f={f} />;
    case 12: return <S12 f={f} />;
    case 13: return <S13 f={f} />;
    case 14: return <S14 f={f} />;
    case 15: return <S15 f={f} />;
    case 16: return <S16 f={f} />;
    case 17: return <S17 f={f} />;
    case 18: return <S18 f={f} />;
    case 19: return <S19 f={f} />;
    default: return null;
  }
};

const ACCENTS = [YELLOW, CYAN, CYAN, CORAL, YELLOW, CYAN, YELLOW, YELLOW, CYAN, YELLOW, YELLOW, CYAN, YELLOW, CYAN, YELLOW, CORAL, CORAL, CYAN, YELLOW, YELLOW];

/* ============ 字幕：逐字点亮 ============ */
const CaptionBox: React.FC = () => {
  const f = useCurrentFrame();
  let idx = SCRIPT.length - 1;
  for (let i = 0; i < SCRIPT.length; i++) { if (f < F[i + 1]) { idx = i; break; } }
  const local = f - F[idx];
  const t = local / 30;
  const op = fadeIn(f, F[idx], 10) * fadeOut(f, F[idx + 1], 10);
  const slide = (1 - easeOut(clamp01((f - F[idx]) / 12))) * 14;
  const lines = SCRIPT[idx].cn.split('\n');
  const fontSize = lines.some((l) => l.length > 22) ? 33 : 37;
  const times = CHARS[idx] ?? [];
  const totalChars = Math.max(1, times.length);
  let shown = 0;
  for (let k = 0; k < times.length; k++) if (t >= times[k]) shown++;
  const p = shown / totalChars;
  let gi = 0;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center', opacity: op, transform: `translateY(${slide}px)` }}>
      <div style={{ maxWidth: 1180, padding: '14px 34px 10px', background: 'rgba(10,10,10,0.80)', border: '1px solid rgba(240,224,0,0.28)', borderRadius: 6, boxShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
        <div style={{ fontFamily: FONT, fontSize, fontWeight: 700, color: YELLOW, lineHeight: 1.5, textAlign: 'center' }}>
          {lines.map((ln, li) => (
            <div key={li}>
              {ln.split('').map((ch, ci) => {
                const on = t >= (times[gi] ?? 0);
                gi++;
                return <span key={ci} style={{ opacity: on ? 1 : 0 }}>{ch}</span>;
              })}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 16, color: GREY2, textAlign: 'center', marginTop: 6 }}>
          {(() => {
            const ws = SCRIPT[idx].en.split(' ');
            const shownW = Math.ceil(p * ws.length);
            return ws.map((w, wi) => (
              <span key={wi} style={{ opacity: wi < shownW ? 1 : 0 }}>{wi < ws.length - 1 ? w + ' ' : w}</span>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

export const NN2: React.FC = () => {
  const f = useCurrentFrame();
  let idx = SCRIPT.length - 1;
  for (let i = 0; i < SCRIPT.length; i++) { if (f < F[i + 1]) { idx = i; break; } }
  const local = f - F[idx];
  const sceneDur = Math.max(1, F[idx + 1] - F[idx]);
  const camU = clamp01(local / sceneDur);
  const camS = 1.02 + 0.055 * easeOut(camU);
  const camX = Math.sin(idx * 1.7 + camU * 2) * 12;
  const camY = Math.cos(idx * 1.1 + camU * 1.6) * 10;
  const enter = 1 - easeOut(clamp01(local / 9));
  const flash = local < 7 ? (1 - local / 7) * 0.22 : 0;
  const accent = ACCENTS[idx] ?? YELLOW;

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, #0A0C0F 0%, #000 62%)' }} />
      <Grid />
      <Dust color={accent} seed={idx + 1} />
      <Halo cx={960} cy={430} r={620} color={accent} powered={0.9} />
      <Halo cx={idx % 2 ? 1500 : 420} cy={620} r={420} color={accent} powered={0.35} />

      <AbsoluteFill style={{
        transform: `scale(${(camS + enter * 0.05).toFixed(4)}) translate(${(camX * 0.15).toFixed(2)}px, ${(camY * 0.15).toFixed(2)}px)`,
        filter: enter > 0.01 ? `blur(${(enter * 16).toFixed(1)}px)` : undefined,
      }}>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080">
          <g transform={`translate(${960 + camX} ${470 + camY}) scale(${1}) translate(${-960} ${-470})`}>
            <Scene i={idx} f={local} />
          </g>
        </svg>
      </AbsoluteFill>

      <AbsoluteFill style={{ background: WHITE, opacity: flash, mixBlendMode: 'overlay' }} />

      <ProbBar />
      <CaptionBox />

      {idx === 19 && f >= TOTAL_FRAMES - 72 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 166, textAlign: 'center',
          opacity: fadeIn(f, TOTAL_FRAMES - 72, 14),
          transform: `translateY(${(1 - fadeIn(f, TOTAL_FRAMES - 72, 14)) * 22}px)`,
          fontFamily: FONT, fontSize: 48, fontWeight: 900, color: YELLOW,
          textShadow: '0 0 28px rgba(240,224,0,0.55), 0 4px 18px rgba(0,0,0,0.9)', letterSpacing: 3,
        }}>
          关注我 · 火柴人老贾
        </div>
      )}

      {DUR.map((_, i) => (
        <Sequence key={i} from={F[i]} premountFor={20}>
          <Audio src={staticFile(`audio2_norm/e${String(i).padStart(2, '0')}.wav`)} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight_loop.m4a')} volume={0.10} loop />
    </AbsoluteFill>
  );
};
