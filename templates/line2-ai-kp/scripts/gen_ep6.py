# -*- coding: utf-8 -*-
# EP06《RAG：先查资料再开口》生成器 —— 10/25
# 底子 = EP05Full.tsx 通用组件段（工具函数/Backdrop/XiaoMo/LaoJia/Badge/Subtitle 原样保留）
# 替换：头注释 / import / Badge字样 / 12个Scene / 主组件改名 EP06F
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # remotion-ai-kp2
SRC  = os.path.join(ROOT, "src", "EP05Full.tsx")
DST  = os.path.join(ROOT, "src", "EP06Full.tsx")
CUES = os.path.join(ROOT, "src", "ep6fCues.ts")

# ---------------------------------------------------------------- cues
CUES_TS = """export type CharItem = { c: string; t: number };
export type Cue = { i: number; start: number; dur: number; end: number; text: string; chars: CharItem[] };

const RAW: [number, string][] = [
  [7.2, '你问它一个冷知识，它能编得特别自信'],
  [6.6, '因为它只会接龙，不会查资料'],
  [5.8, '办法特别简单：先查，再答'],
  [6.8, '第一步，检索：把问题变成关键词，去知识库里翻'],
  [6.4, '第二步，拼接：把翻到的那几页，原样塞进它的上下文'],
  [6.4, '第三步，生成：这时候它说的话，句句有出处'],
  [5.6, '这套流程叫 RAG，检索增强生成'],
  [7.0, '有多管用？同一套题，不查答对三成八，查了答对九成二'],
  [6.6, '实测来源：SimpleQA 基准，带检索翻了一倍多'],
  [7.0, '坑说清楚：知识库要是有错，它照样一本正经地错'],
  [5.8, '所以先查再答，AI 就不瞎编了'],
  [3.4, '下集：它为什么会一本正经地胡说'],
];

let acc = 0;
export const CUES: Cue[] = RAW.map(([dur, text], i) => {
  const start = acc;
  acc += dur;
  const end = acc;
  const chars = Array.from(text);
  const span = Math.min(chars.length * 0.135, dur - 0.8);
  const step = chars.length > 1 ? span / (chars.length - 1) : 0;
  return {
    i,
    start,
    dur,
    end,
    text,
    chars: chars.map((c, k) => ({ c, t: start + 0.32 + k * step })),
  };
});

export const CHARS: CharItem[][] = CUES.map((c) => c.chars);
export const TOTAL_SEC = CUES.length ? CUES[CUES.length - 1].end : 0;
export const TOTAL_FRAMES = Math.ceil(TOTAL_SEC * 30) + 24;

export const charAt = (seg: number, word: string): number => {
  const ch = CHARS[seg] ?? [];
  const idx = ch.findIndex((x) => x.c === word);
  return idx < 0 ? -1 : ch[idx].t;
};
"""

# ---------------------------------------------------------------- scenes
SCENES = r"""
/* ---- 冲击工具（huashu 语法移植：砸入/镜头抖/错位帧/白闪） ---- */
const slamS = (l: number, at: number): number => {
  if (l < at) return 1;
  const u = (l - at) / 5;
  if (u >= 1) return 1;
  return u < 0.5 ? 1.55 - 0.61 * (u / 0.5) : 0.94 + 0.06 * ((u - 0.5) / 0.5);
};
const shake = (l: number, at: number, amp = 7): [number, number] => {
  if (l < at || l > at + 4) return [0, 0];
  const k = l - at;
  return [Math.sin(k * 91.7 + at * 13.1) * amp * (1 - k / 5), Math.cos(k * 77.3 + at * 7.7) * amp * (1 - k / 5)];
};
const glitchOn = (l: number, at: number): boolean => l >= at && l < at + 2;
const whiteFlash = (l: number, at: number, op = 0.5): number =>
  l >= at && l < at + 4 ? op * (1 - (l - at) / 4) : 0;

/* ============================ 幕1 · 它能编得特别自信（V2 冲击版） ============================ */
const LIES: [number, number, string, number, number][] = [
  [205, 570, '《独角兽饲养指南》', 10, -1],
  [875, 620, '作者：李四海', 26, 1],
  [540, 452, 'ISBN 7-8888-6666-4', 42, 0],
];
const Scene1: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const push = 1 + 0.15 * (1 - Math.pow(1 - clamp01((l - 6) / 30), 3));
  const camS = push * (l >= 108 ? 1 + 0.05 * Math.max(0, 1 - (l - 108) / 6) : 1);
  const [shx, shy] = shake(l, 108, 8);
  const stamp = clamp01((l - 108) / 5);
  const gl = glitchOn(l, 108);
  const flash = whiteFlash(l, 108, 0.5);
  const wob = l >= 126 ? 1 + 0.012 * Math.sin((l - 126) / 5) : 1;
  const recoil = l >= 108 ? 1 - 0.09 * Math.max(0, 1 - (l - 108) / 9) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${shx}px, ${shy}px) scale(${camS})` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>你问：推荐一本讲独角兽的书？</text>
        {LIES.map(([x, y, s, d, side], i) => {
          const fly = eio(clamp01((l - d) / 9));
          const cx = x + (1 - fly) * side * 720;
          const cy = y + (1 - fly) * -60;
          const st = 1 + (1 - fly) * 0.4;
          return (
            <g key={i} opacity={clamp01(fly * 2.5)} transform={`translate(${cx} ${cy})`}>
              {(1 - fly) > 0.2 ? (
                <line x1={-side * 360} y1={-66} x2={-side * 150} y2={-66} stroke={BLUE} strokeWidth={5} strokeLinecap="round" opacity={1 - fly} />
              ) : null}
              <g transform={`scale(${st} 1)`}>
                <rect x={-195} y={-44} width={390} height={88} rx={20} fill="#FFFFFF" stroke={LINE} strokeWidth={3} />
                <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={NAVY}>{s}</text>
              </g>
            </g>
          );
        })}
        <g transform={`translate(540 1010) scale(${recoil})`}>
          <XiaoMo x={0} y={0} s={1.02 + 0.01 * Math.sin(f / 20)} mood={l < 108 ? 'cool' : 'shock'} f={f} />
        </g>
        {l >= 108 ? (
          <g transform={`translate(540 640) rotate(-13) scale(${slamS(l, 108) * wob})`} opacity={Math.min(1, stamp * 2)}>
            <rect x={-272} y={-72} width={544} height={144} rx={20} fill="none" stroke={RED} strokeWidth={14} />
            {gl ? (
              <>
                <text x={-5} y={24} textAnchor="middle" fontFamily={FONT} fontSize={74} fontWeight={900} fill={BLUE} opacity={0.85}>查无此书</text>
                <text x={5} y={24} textAnchor="middle" fontFamily={FONT} fontSize={74} fontWeight={900} fill={RED} opacity={0.9}>查无此书</text>
              </>
            ) : (
              <text x={0} y={24} textAnchor="middle" fontFamily={FONT} fontSize={74} fontWeight={900} fill={RED}>查无此书</text>
            )}
          </g>
        ) : null}
        {l >= 126 ? <circle cx={540} cy={640} r={310} fill="none" stroke={RED} strokeWidth={5} opacity={0.22 + 0.14 * Math.sin(f / 8)} /> : null}
        {flash > 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={flash} /> : null}
      </svg>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1130, textAlign: 'center',
        fontFamily: FONT, fontSize: 46, fontWeight: 900, color: RED,
        opacity: ez(l - 120, 12), transform: `scale(${(0.9 + 0.1 * pop(l, 120, 16)) * wob})`,
      }}>
        语气一点不虚
      </div>
    </div>
  );
};

/* ============================ 幕2 · 只会接龙，不会查资料 ============================ */
const CHAIN = ['从前…', '有一只…', '它住在…', '每天…', '吃…'];
const Scene2: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const spots: [number, number][] = [[190, 560], [520, 480], [850, 560], [520, 700], [190, 780]];
  const q = l >= 118 ? 1 + 0.06 * Math.sin((l - 118) / 5) : 0;
  const crossP = clamp01((l - 140) / 16);
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>它脑子里的真实流程</text>
        {CHAIN.map((s, i) => {
          const on = pop(l, 8 + i * 14, 14);
          const [x, y] = spots[i];
          const nx = spots[Math.min(i + 1, spots.length - 1)];
          const mx = (x + nx[0]) / 2 + (i % 2 === 0 ? 60 : -60);
          const my = Math.min(y, nx[1]) - 70;
          return (
            <g key={i}>
              {i < CHAIN.length - 1 ? (
                <path d={`M ${x} ${y} Q ${mx} ${my} ${nx[0]} ${nx[1]}`} fill="none" stroke={BLUE} strokeWidth={4}
                  strokeDasharray="10 8" opacity={ez(l - (16 + i * 14), 10) * 0.8} />
              ) : null}
              <g opacity={Math.min(1, on)} transform={`translate(${x} ${y}) scale(${0.4 + 0.6 * on})`}>
                <rect x={-110} y={-40} width={220} height={80} rx={16} fill={i % 2 === 0 ? '#FFFFFF' : BLUE} stroke={i % 2 === 0 ? LINE : BLUE} strokeWidth={3} />
                <text x={0} y={11} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={i % 2 === 0 ? NAVY : '#FFFFFF'}>{s}</text>
              </g>
            </g>
          );
        })}
        <g transform={`translate(870 900)`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={150} fontWeight={900} fill={RED} opacity={l >= 118 ? 1 : 0} transform={`scale(${q})`}>?</text>
        </g>
        <g transform={`translate(210 900)`} opacity={ez(l - 100, 12)}>
          <rect x={-90} y={-110} width={180} height={220} rx={14} fill={NAVY} />
          <rect x={-74} y={-94} width={148} height={188} rx={8} fill="#FFFFFF" />
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={-56} y={-70 + i * 34} width={112} height={10} rx={5} fill={LINE} />
          ))}
          {l >= 140 ? (
            <g opacity={crossP}>
              <line x1={-120} y1={-140} x2={120} y2={140} stroke={RED} strokeWidth={16} strokeLinecap="round" />
              <line x1={120} y1={-140} x2={-120} y2={140} stroke={RED} strokeWidth={16} strokeLinecap="round" />
            </g>
          ) : null}
        </g>
        <g transform={`translate(540 1120)`} opacity={ez(l - 155, 12)}>
          <rect x={-330} y={-52} width={660} height={104} rx={24} fill="#FFFFFF" stroke={RED} strokeWidth={5} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={NAVY}>
            只会接龙 <tspan fill={RED}>不会查资料</tspan>
          </text>
        </g>
      </svg>
    </>
  );
};

/* ============================ 幕3 · 先查，再答 ============================ */
const Scene3: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const slam = clamp01((l - 30) / 14);
  const slamS = 1.8 - 0.8 * (1 - Math.pow(1 - slam, 3));
  const ring = l >= 44 ? clamp01((l - 44) / 22) : 0;
  const sweep = clamp01(((l - 52) % 70) / 70);
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>办法特别简单</text>
        <g transform={`translate(540 620)`} opacity={ez(l - 8, 12)}>
          <circle cx={0} cy={0} r={86} fill="none" stroke={NAVY} strokeWidth={14} />
          <line x1={60} y1={60} x2={130} y2={130} stroke={NAVY} strokeWidth={18} strokeLinecap="round" />
          <line x1={-38} y1={-10} x2={38} y2={-10} stroke={BLUE} strokeWidth={8} strokeLinecap="round" opacity={0.8} />
          <line x1={-38} y1={16} x2={20} y2={16} stroke={BLUE} strokeWidth={8} strokeLinecap="round" opacity={0.5} />
        </g>
        <g transform={`translate(540 620)`} opacity={ez(l - 8, 12)}>
          <rect x={-330} y={-6} width={170} height={12} rx={6} fill={GOLD} transform={`translate(${-330 + 660 * sweep} 0)`} opacity={0.5} />
        </g>
        {l >= 30 ? (
          <g transform={`translate(540 1020) scale(${slamS})`}>
            <rect x={-360} y={-110} width={330} height={220} rx={28} fill={NAVY} />
            <text x={-195} y={22} textAnchor="middle" fontFamily={FONT} fontSize={110} fontWeight={900} fill="#FFFFFF">先查</text>
            <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontSize={90} fontWeight={900} fill={GREY} opacity={ez(l - 44, 10)}>→</text>
            <rect x={30} y={-110} width={330} height={220} rx={28} fill={GOLD} opacity={ez(l - 46, 12)} />
            <text x={195} y={22} textAnchor="middle" fontFamily={FONT} fontSize={110} fontWeight={900} fill={NAVY} opacity={ez(l - 46, 12)}>再答</text>
          </g>
        ) : null}
        {l >= 44 ? (
          <g opacity={1 - ring}>
            <circle cx={540} cy={1020} r={260 + 380 * ring} fill="none" stroke={GOLD} strokeWidth={10 - 6 * ring} />
          </g>
        ) : null}
        <text x={540} y={1300} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={GREY} opacity={ez(l - 80, 14)}>一个动作，治好瞎编</text>
      </svg>
    </>
  );
};

/* ============================ 传送带（幕4/5/6 共用画法） ============================ */
const Belt: React.FC<{ l: number; active: number }> = ({ l, active }) => (
  <g opacity={ez(l - 6, 12)}>
    {['检索', '拼接', '生成'].map((s, i) => (
      <g key={i} transform={`translate(${180 + i * 260} 1290)`}>
        <rect x={-100} y={-46} width={200} height={92} rx={20}
          fill={i === active ? GOLD : '#FFFFFF'} stroke={i === active ? GOLD : LINE} strokeWidth={4} />
        <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900}
          fill={i === active ? NAVY : GREY}>{s}</text>
        {i < 2 ? <text x={140} y={14} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={GREY}>→</text> : null}
      </g>
    ))}
  </g>
);

/* ============================ 幕4 · 检索 ============================ */
const Scene4: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const kws = ['独角兽', '书', '真假'];
  const flip = clamp01((l - 96) / 40);
  const hitP = clamp01((l - 136) / 16);
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>第一步 · 把问题变成关键词</text>
        <Belt l={l} active={0} />
        <g transform={`translate(230 700)`} opacity={ez(l - 10, 12)}>
          <rect x={-160} y={-64} width={320} height={128} rx={22} fill="#FFFFFF" stroke={LINE} strokeWidth={4} />
          <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={NAVY}>独角兽 存在吗</text>
        </g>
        {kws.map((k, i) => {
          const on = pop(l, 40 + i * 12, 14);
          return (
            <g key={i} opacity={Math.min(1, on)} transform={`translate(${430 + i * 10} ${480 + i * 120}) scale(${0.4 + 0.6 * on})`}>
              <rect x={-105} y={-42} width={210} height={84} rx={42} fill={BLUE} />
              <text x={0} y={13} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill="#FFFFFF">{k}</text>
            </g>
          );
        })}
        <g transform={`translate(830 700)`}>
          <rect x={-120} y={-150} width={240} height={300} rx={16} fill={NAVY} opacity={ez(l - 70, 12)} />
          <rect x={-104} y={-134} width={208} height={268} rx={10} fill="#FFFFFF" opacity={ez(l - 70, 12)} />
          {Array.from({ length: 3 }, (_, i) => {
            const p = clamp01((flip - i * 0.3) / 0.3);
            const rx = -180 * Math.sin(p * Math.PI);
            return (
              <g key={i} opacity={ez(l - 70, 12)}>
                <rect x={-104} y={-120 + i * 86} width={208 * (0.4 + 0.6 * (1 - p))} height={66} rx={6} fill="#EAF1FA" transform={`translate(${rx} 0)`} />
              </g>
            );
          })}
          {l >= 136 ? (
            <g opacity={hitP}>
              <rect x={-104} y={-120} width={208} height={66} rx={6} fill={GOLD} opacity={0.85} />
              <rect x={-104} y={-34} width={208} height={66} rx={6} fill={GOLD} opacity={0.55} />
            </g>
          ) : null}
          <text x={0} y={210} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill={GREY} opacity={ez(l - 70, 12)}>知识库</text>
        </g>
        <path d="M 400 700 Q 600 560 700 680" fill="none" stroke={BLUE} strokeWidth={5} strokeDasharray="12 9"
          opacity={ez(l - 96, 12) * 0.9} />
        <text x={540} y={1140} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={NAVY} opacity={ez(l - 136, 12)}>
          命中那几页 <tspan fill={GOLD}>高亮</tspan>
        </text>
      </svg>
    </>
  );
};

/* ============================ 幕5 · 拼接 ============================ */
const Scene5: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const pages: [number, number, number][] = [[830, 620, 60], [830, 760, 78], [830, 900, 96]];
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>第二步 · 原样塞进上下文</text>
        <Belt l={l} active={1} />
        <g transform={`translate(540 860)`} opacity={ez(l - 8, 12)}>
          <rect x={-290} y={-230} width={580} height={460} rx={26} fill="#FFFFFF" stroke={BLUE} strokeWidth={5} strokeDasharray="16 10" />
          <text x={-250} y={-170} fontFamily={FONT} fontSize={36} fontWeight={900} fill={BLUE}>它的上下文</text>
        </g>
        {pages.map(([x0, y0, d], i) => {
          const p = clamp01((l - d) / 26);
          const e = 1 - Math.pow(1 - p, 3);
          const x = x0 + (520 - x0) * e;
          const y = y0 + (760 + i * 120 - y0) * e;
          const rot = (1 - e) * 24;
          return (
            <g key={i} opacity={Math.min(1, p * 2)} transform={`translate(${x} ${y}) rotate(${rot})`}>
              <rect x={-230} y={-52} width={460} height={104} rx={12} fill="#F4F8FD" stroke={LINE} strokeWidth={3} />
              <text x={-200} y={-16} fontFamily={FONT} fontSize={26} fontWeight={800} fill={GREY}>第 {i + 1} 页</text>
              <rect x={-200} y={0} width={360} height={10} rx={5} fill={LINE} />
              <rect x={-200} y={26} width={280} height={10} rx={5} fill={LINE} opacity={0.7} />
            </g>
          );
        })}
        <g transform={`translate(540 1360)`} opacity={ez(l - 130, 12)}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={NAVY}>
            摊在它眼前，<tspan fill={BLUE}>不许自己编</tspan>
          </text>
        </g>
      </svg>
    </>
  );
};

/* ============================ 幕6 · 生成 · 句句有出处 ============================ */
const Scene6: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const ans = '独角兽是传说生物，没有实物证据。';
  const cite = l >= 96;
  const citeP = clamp01((l - 96) / 14);
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>第三步 · 现在它开口了</text>
        <Belt l={l} active={2} />
        <g transform={`translate(540 760)`} opacity={ez(l - 24, 14)}>
          <rect x={-400} y={-110} width={800} height={220} rx={26} fill="#FFFFFF" stroke={NAVY} strokeWidth={6} />
          {ans.split('，').map((part, i, arr) => {
            const on = ez(l - (34 + i * 26), 10);
            return (
              <text key={i} x={-370} y={-20 + i * 66} fontFamily={FONT} fontSize={44} fontWeight={800} fill={NAVY} opacity={on}>
                {part}{i < arr.length - 1 ? '，' : ''}
              </text>
            );
          })}
          {['[1]', '[2]', '[3]'].map((c, i) => (
            <g key={i} opacity={cite ? citeP : 0} transform={`translate(${330 + (i % 2) * 40} ${-40 + i * 66}) scale(${0.5 + 0.5 * citeP})`}>
              <circle cx={0} cy={0} r={26} fill={GOLD} />
              <text x={0} y={9} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={900} fill={NAVY}>{c}</text>
            </g>
          ))}
        </g>
        {cite ? (
          <g opacity={citeP} transform={`translate(850 860)`}>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(0 ${(i - 1) * 120})`}>
                <rect x={-60} y={-70} width={120} height={140} rx={10} fill="#F4F8FD" stroke={GOLD} strokeWidth={4} />
                <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill={GOLD}>[{i + 1}]</text>
              </g>
            ))}
          </g>
        ) : null}
        <text x={540} y={1100} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={NAVY} opacity={ez(l - 120, 12)}>
          句句 <tspan fill={GOLD}>有出处</tspan>
        </text>
      </svg>
    </>
  );
};

/* ============================ 幕7 · 这叫 RAG（V2 冲击版） ============================ */
const Scene7: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const landed = l >= 40;
  const fall = clamp01(l / 40);
  const fallY = (1 - Math.pow(fall, 2.4)) * -1200;
  const landS = landed ? slamS(l, 40) : 1;
  const push = 1 + 0.14 * (1 - Math.pow(1 - clamp01((l - 2) / 24), 3));
  const camS = push * (landed ? 1 + 0.06 * Math.max(0, 1 - (l - 40) / 6) : 1);
  const [shx, shy] = shake(l, 40, 9);
  const gl = glitchOn(l, 40);
  const flash = whiteFlash(l, 40, 0.55);
  const ring = landed ? clamp01((l - 40) / 22) : 0;
  const burst = landed ? 1 - Math.pow(1 - clamp01((l - 40) / 10), 3) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${shx}px, ${shy}px) scale(${camS})` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2 + f * 0.02;
          return (
            <g key={i} opacity={burst}>
              <circle cx={540 + Math.cos(a) * 300 * burst} cy={860 + Math.sin(a) * 300 * burst} r={11} fill={i % 4 === 0 ? BLUE : GOLD} />
              <circle cx={540 + Math.cos(a + 0.13) * 366 * burst} cy={860 + Math.sin(a + 0.13) * 366 * burst} r={7} fill={i % 3 === 0 ? BLUE : GOLD} opacity={0.7} />
            </g>
          );
        })}
        {!landed ? (
          <>
            <text x={540} y={905} transform={`translate(0 ${fallY + 180})`} textAnchor="middle" fontFamily={FONT} fontSize={230} fontWeight={900} fill={NAVY} opacity={0.22}>RAG</text>
            <text x={540} y={905} transform={`translate(0 ${fallY + 380})`} textAnchor="middle" fontFamily={FONT} fontSize={230} fontWeight={900} fill={NAVY} opacity={0.1}>RAG</text>
          </>
        ) : null}
        <g transform={`translate(540 830) scale(${landS}) translate(-540 -830) translate(0 ${fallY})`}>
          {gl ? (
            <>
              <text x={532} y={905} textAnchor="middle" fontFamily={FONT} fontSize={230} fontWeight={900} fill={BLUE} opacity={0.85}>RAG</text>
              <text x={548} y={905} textAnchor="middle" fontFamily={FONT} fontSize={230} fontWeight={900} fill={RED} opacity={0.9}>RAG</text>
            </>
          ) : (
            <text x={540} y={905} textAnchor="middle" fontFamily={FONT} fontSize={230} fontWeight={900} fill={NAVY} letterSpacing={-6}>RAG</text>
          )}
        </g>
        {landed ? (
          <g opacity={1 - ring}>
            <circle cx={540} cy={860} r={220 + 420 * ring} fill="none" stroke={GOLD} strokeWidth={8 - 5 * ring} />
            <circle cx={540} cy={860} r={150 + 300 * ring} fill="none" stroke={BLUE} strokeWidth={5 - 3 * ring} opacity={0.7} />
          </g>
        ) : null}
        <text x={540} y={1120} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GREY} opacity={ez(l - 60, 14)}>
          Retrieval-Augmented Generation
        </text>
        <text x={540} y={1210} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={900} fill={NAVY} opacity={ez(l - 76, 14)}>
          检索增强生成
        </text>
        <g transform={`translate(540 1370)`} opacity={ez(l - 96, 14)}>
          <rect x={-330} y={-52} width={660} height={104} rx={24} fill="#FFFFFF" stroke={GOLD} strokeWidth={5} />
          <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={NAVY}>
            给 AI 配个 <tspan fill={GOLD}>外置大脑</tspan>
          </text>
        </g>
        {flash > 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={flash} /> : null}
      </svg>
    </div>
  );
};

/* ============================ 幕8 · 不查 38% vs 查了 92% ============================ */
const Scene8: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const c1 = clamp01((l - 14) / 60);
  const v1 = Math.round(38 * (1 - Math.pow(1 - c1, 3)));
  const c2 = clamp01((l - 92) / 46);
  const v2 = Math.round(92 * (1 - Math.pow(1 - c2, 3)));
  const landed = l >= 138;
  const ring = landed ? clamp01((l - 138) / 22) : 0;
  const pulse = landed ? 1 + 0.1 * Math.sin(Math.min(1, (l - 138) / 14) * Math.PI) : 1;
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={NAVY} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>同一套题 · 答对率</text>
        <line x1={140} y1={1160} x2={940} y2={1160} stroke={LINE} strokeWidth={6} opacity={ez(l - 8, 12)} />
        <rect x={230} y={1160 - 520 * c1} width={180} height={520 * c1} rx={14} fill={GREY} opacity={0.75} />
        <rect x={600} y={1160 - 560 * c2} width={220} height={560 * c2} rx={14} fill={GOLD} />
        <text x={320} y={1080 - 520 * c1} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={GREY}>{v1}%</text>
        <text x={710} y={1090 - 560 * c2} textAnchor="middle" fontFamily={FONT} fontSize={landed ? 130 : 76} fontWeight={900} fill={NAVY} transform={`translate(710 0) scale(${pulse}) translate(-710 0)`}>{v2}%</text>
        {landed ? (
          <g opacity={1 - ring}>
            <circle cx={710} cy={600} r={200 + 380 * ring} fill="none" stroke={GOLD} strokeWidth={8 - 5 * ring} />
          </g>
        ) : null}
        <text x={320} y={1240} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={GREY} opacity={ez(l - 10, 12)}>不查资料</text>
        <text x={710} y={1240} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={NAVY} opacity={ez(l - 88, 12)}>先查再答</text>
        <text x={540} y={1360} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={RED} opacity={ez(l - 150, 14)}>差出两倍半</text>
      </svg>
    </>
  );
};

/* ============================ 幕9 · 实测来源 ============================ */
const Scene9: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const rise = ez(l - 10, 16);
  const stamp = clamp01((l - 110) / 14);
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`translate(540 ${900 + (1 - rise) * 140})`} opacity={rise}>
          <rect x={-400} y={-300} width={800} height={600} rx={30} fill="#FFFFFF" stroke={NAVY} strokeWidth={6} />
          <rect x={-400} y={-300} width={800} height={92} rx={30} fill={NAVY} opacity={0.92} />
          <text x={0} y={-240} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill="#FFFFFF">SimpleQA 基准实测</text>
          <text x={-350} y={-130} fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY}>不查资料的模型</text>
          <text x={-350} y={-60} fontFamily={FONT} fontSize={72} fontWeight={900} fill={GREY}>38%</text>
          <text x={0} y={-70} textAnchor="middle" fontFamily={FONT} fontSize={60} fontWeight={900} fill={BLUE}>→</text>
          <text x={350} y={-130} textAnchor="end" fontFamily={FONT} fontSize={40} fontWeight={800} fill={NAVY}>带上检索再答</text>
          <text x={350} y={-56} textAnchor="end" fontFamily={FONT} fontSize={72} fontWeight={900} fill={NAVY}>92.46%</text>
          <line x1={-350} y1={-10} x2={350} y2={-10} stroke={LINE} strokeWidth={4} />
          <text x={-350} y={70} fontFamily={FONT} fontSize={34} fontWeight={800} fill={GREY}>来源：You.com 官方 · SimpleQA</text>
          <text x={-350} y={130} fontFamily={FONT} fontSize={34} fontWeight={800} fill={GREY}>OpenAI 公开基准 · 2026-10 核实</text>
          <text x={-350} y={210} fontFamily={FONT} fontSize={34} fontWeight={800} fill={GREY}>独立答对率翻了一倍多</text>
        </g>
        <g transform={`translate(760 1240) rotate(-10)`} opacity={stamp}>
          <rect x={-210} y={-52} width={420} height={104} rx={16} fill="none" stroke={GREEN} strokeWidth={10} />
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GREEN}>数字当天核实 ✓</text>
        </g>
      </svg>
    </>
  );
};

/* ============================ 幕10 · 坑：垃圾进垃圾出 ============================ */
const Scene10: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const p = clamp01((l - 96) / 16);
  const bigP = clamp01((l - 128) / 16);
  const bigS = 2.2 - 1.2 * (1 - Math.pow(1 - bigP, 3));
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={296} width={800} height={96} rx={48} fill={RED} opacity={ez(l - 4, 10)} />
        <text x={540} y={360} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={900} fill="#FFFFFF" opacity={ez(l - 4, 10)}>坑说清楚</text>
        <g transform={`translate(230 640)`} opacity={ez(l - 10, 12)}>
          <rect x={-110} y={-140} width={220} height={280} rx={16} fill={NAVY} />
          <rect x={-94} y={-124} width={188} height={248} rx={10} fill="#FFFFFF" />
          <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900} fill={RED}>错✗</text>
          <text x={0} y={190} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={GREY}>印错的知识库</text>
        </g>
        <path d="M 360 640 Q 540 560 660 620" fill="none" stroke={RED} strokeWidth={5} strokeDasharray="12 9" opacity={ez(l - 50, 12)} />
        <g transform={`translate(540 660)`} opacity={ez(l - 60, 12)}>
          <rect x={-190} y={-70} width={380} height={140} rx={22} fill="#FFFFFF" stroke={RED} strokeWidth={6} />
          <text x={0} y={-10} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={NAVY}>地心是平的</text>
          <text x={0} y={44} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={RED}>来源 [1] ✓</text>
        </g>
        <g transform={`translate(540 1000)`} opacity={p}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={NAVY}>它照样 <tspan fill={RED}>一本正经地错</tspan></text>
        </g>
        <g transform={`translate(540 1330) rotate(-6)`} opacity={bigP}>
          <g transform={`scale(${bigS})`}>
            <rect x={-360} y={-84} width={720} height={168} rx={22} fill="none" stroke={RED} strokeWidth={14} />
            <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontSize={78} fontWeight={900} fill={RED}>垃圾进 垃圾出</text>
          </g>
        </g>
      </svg>
    </>
  );
};

/* ============================ 幕11 · 金句收尾 ============================ */
const Scene11: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const slam = clamp01((l - 16) / 14);
  const slamS = 1.7 - 0.7 * (1 - Math.pow(1 - slam, 3));
  const ring = l >= 30 ? clamp01((l - 30) / 24) : 0;
  const pulse = l >= 30 ? 1 + 0.06 * Math.sin((l - 30) / 7) : 1;
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`translate(540 830) scale(${slamS * pulse})`}>
          <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontSize={170} fontWeight={900} fill={NAVY} letterSpacing={-2}>先查再答</text>
        </g>
        {l >= 30 ? (
          <g opacity={1 - ring}>
            <circle cx={540} cy={800} r={280 + 420 * ring} fill="none" stroke={GOLD} strokeWidth={9 - 5 * ring} />
          </g>
        ) : null}
        <text x={540} y={1060} textAnchor="middle" fontFamily={FONT} fontSize={60} fontWeight={900} fill={GREY} opacity={ez(l - 60, 14)}>
          AI 就 <tspan fill={GREEN}>不瞎编了</tspan>
        </text>
        <g transform={`translate(540 1290)`} opacity={ez(l - 100, 14)}>
          <rect x={-300} y={-48} width={600} height={96} rx={24} fill="#FFFFFF" stroke={LINE} strokeWidth={4} />
          <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={NAVY}>
            治瞎编第一味药 · <tspan fill={GOLD}>检索增强生成</tspan>
          </text>
        </g>
      </svg>
    </>
  );
};

/* ============================ 幕12 · 下集预告 ============================ */
const Scene12: React.FC<{ f: number; t: number; l: number }> = ({ f, l }) => {
  const on = ez(l - 10, 14);
  return (
    <>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <text x={540} y={700} textAnchor="middle" fontFamily={FONT} fontSize={220} fontWeight={900} fill={RED} opacity={0.12}>？</text>
        <g transform={`translate(540 830)`} opacity={on}>
          <rect x={-440} y={-90} width={880} height={180} rx={30} fill={NAVY} />
          <text x={0} y={-6} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={GOLD}>下集</text>
          <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={800} fill="#FFFFFF">它为什么会一本正经地胡说</text>
        </g>
        <g transform={`translate(540 1160)`}>
          <XiaoMo x={0} y={0} s={1.0 + 0.012 * Math.sin(f / 18)} mood={l >= 20 ? 'shock' : 'none'} f={f} />
        </g>
      </svg>
    </>
  );
};
"""

MAIN = r"""
const DIRS: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0], [0, 1], [1, 0], [0, -1], [-1, 0], [0, 1], [1, 0], [0, -1], [0, 1]];
const TINTS = ['#E8F0FF', '#E9F7EF', '#FFF6E0', '#FDECEC', '#E8F0FF', '#E9F7EF', '#FFF6E0', '#FDECEC', '#E8F0FF', '#E9F7EF', '#E9F7EF', '#FFF6E0'];

export const EP6F_FRAMES = TOTAL_FRAMES;

export const EP06F: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < CUES.length; i++) {
    seg = i;
    if (t < CUES[i].end) break;
  }
  const spot = LAOJIA_SPOTS[seg] ?? LAOJIA_SPOTS[0];
  const tint = TINTS[seg] ?? '#E8F0FF';
  const S = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10, Scene11, Scene12];
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Backdrop tint={tint} f={frame} />
      {CUES.map((c, i) => {
        const Scene = S[i];
        if (!Scene) return null;
        return (
          <ShotLayer key={i} start={Math.round(c.start * 30)} dur={Math.round(c.dur * 30)} fromDir={DIRS[i] ?? [0, 1]}>
            <Scene f={frame} t={t} l={frame - Math.round(c.start * 30)} />
          </ShotLayer>
        );
      })}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <LaoJia x={spot.x} y={spot.y} s={spot.s} mode={spot.mode} f={frame} wag={seg === 0 || seg === 6 || seg === 9} />
      </svg>
      <Badge f={frame} />
      <Subtitle seg={seg} t={t} />
      {/* BGM 从 5.63s 起播，落点对齐幕7「RAG」巨字（69.9s+1.2s≈71s）与幕8「92%」落定（69.9+4.6s≈74.5s 不溢出即可） */}
      <Audio src={staticFile('bgm_midnight.m4a')} startFrom={169} volume={1} />
    </AbsoluteFill>
  );
};
"""

def main():
    src = io.open(SRC, encoding="utf-8").read()
    lines = src.splitlines()
    i_s1 = next(i for i, l in enumerate(lines) if l.startswith("const Scene1"))
    common = "\n".join(lines[:i_s1])
    # 头注释替换
    head_end = next(i for i, l in enumerate(common.splitlines()) if "*/" in l)
    cl = common.splitlines()
    head = "\n".join([
        "/* ==========================================================================",
        " * EP06《RAG：先查资料再开口》· 竖屏 9:16 · 74.6秒",
        " * 底子 = EP05Full（白底 v8 规格）；骨架照抄，画面全换 RAG 主题",
        " * 铁律：不要 AI 配音，只留 BGM（bgm_midnight）；字幕逐字点亮（ep6fCues）",
        " * 数字：SimpleQA 38% -> 92.46%（You.com 官方，10/25 核实）",
        " * ========================================================================== */",
    ])
    body = "\n".join(cl[head_end + 1:])
    body = body.replace("from './ep5fCues'", "from './ep6fCues'")
    body = body.replace("import { CUES, CHARS, charAt } from", "import { CUES, CHARS, charAt, TOTAL_FRAMES } from")
    body = body.replace("AI 科普 · EP05", "AI 科普 · EP06")
    shot_start = next(i for i, l in enumerate(src.splitlines()) if l.startswith("const ShotLayer"))
    src_lines = src.splitlines()
    shot_end = next(i for i, l in enumerate(src_lines) if l.startswith("const DIRS"))
    shotlayer = "\n".join(src_lines[shot_start:shot_end])
    out = head + "\n" + body.strip("\n") + "\n" + SCENES + shotlayer + "\n" + MAIN
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    io.open(CUES, "w", encoding="utf-8", newline="\n").write(CUES_TS)
    # 校验
    n_sc = len(re.findall(r"const Scene\d+", out))
    has = [k for k in ["Backdrop", "XiaoMo", "LaoJia", "Badge", "Subtitle", "ShotLayer", "EP06F", "fmt("] if k in out]
    print("EP06Full.tsx:", len(out), "字 | Scene数:", n_sc, "| 复用件:", has)
    print("ep6fCues.ts 写入 OK | RAW 段数:", CUES_TS.count("[7.") + CUES_TS.count("[6.") + CUES_TS.count("[5.") + CUES_TS.count("[3."))

if __name__ == "__main__":
    main()
