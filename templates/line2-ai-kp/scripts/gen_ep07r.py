# -*- coding: utf-8 -*-
# EP07R《AI 为什么会瞎编》30秒 · 米白底 + 老贾小模 + 抽签柱图 —— 2026-10-25
# 5 幕：主题页 → 抽签A(孙悟空) → 抽签B(红楼梦) → 抽签C(你确定吗) → 结论
import io, os

ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP07R.tsx")

HEAD = r"""
/* =============================================================
 * EP07R《AI 为什么会瞎编》· 30秒 5幕 · 米白底
 * 老贾 + 小模出镜；抽签柱状图从零长出来（数据在跑）
 * ============================================================= */
"""

SCENES = r"""
const BG = '#F6F1E6';
const INK = '#201C17';
const GOLD = '#B8801F';
const RED = '#D93327';
const GREY = '#8A8175';
const LINE2 = '#D9D0BE';
const CARD = '#FFFDF7';

const Mascot: React.FC<{ x: number; y: number; s: number; mood: string; f: number; op?: number }> =
  ({ x, y, s, mood, f, op = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <circle cx={0} cy={-4} r={130} fill={'#FFFFFF'} opacity={0.92} />
      <circle cx={0} cy={-4} r={130} fill={'none'} stroke={LINE2} strokeWidth={4} />
      <XiaoMo x={0} y={0} s={1} mood={mood} f={f} />
    </g>
  );

/* 抽签柱状图：柱子从零长出来 */
const Bars: React.FC<{ l: number; data: [string, number][]; hi: number }> = ({ l, data, hi }) => {
  const maxH = 520;
  const baseY = 1420;
  return (
    <g>
      <line x1={110} y1={baseY} x2={970} y2={baseY} stroke={INK} strokeWidth={4} opacity={0.35} />
      {data.map(([label, v], i) => {
        const grow = clamp01((l - 18 - i * 9) / 36);
        const e = 1 - Math.pow(1 - grow, 3);
        const h = maxH * (v / 100) * e;
        const x = 130 + i * 205;
        const y = baseY - h;
        const on = i === hi && l > 74;
        return (
          <g key={i}>
            <rect x={x} y={y} width={160} height={Math.max(h, 2)} rx={6}
              fill={on ? GOLD : LINE2} stroke={on ? GOLD : '#B5AC9B'} strokeWidth={3} />
            <text x={x + 80} y={y - 18} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900}
              fill={on ? GOLD : GREY} opacity={grow}>{v}%</text>
            <text x={x + 80} y={baseY + 46} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={800}
              fill={on ? INK : GREY}>{label}</text>
            {on ? (
              <g opacity={ez(l - 74, 10)}>
                <rect x={x + 10} y={y - 130} width={140} height={64} rx={14} fill={GOLD} />
                <text x={x + 80} y={y - 86} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill="#FFFFFF">抽中它</text>
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

/* ============ 幕1 · 主题页（0-6s） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const [sx, sy] = shake(l, 100, 10);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG} />
        <text x={540} y={470} textAnchor="middle" fontFamily={FONT} fontSize={104} fontWeight={900} fill={INK}
          opacity={ez(l - 6, 10)} transform={`translate(540 470) scale(${slamS(l, 6)}) translate(-540 -470)`}>
          AI 为什么会<tspan fill={RED}>瞎编</tspan>？
        </text>
        <text x={540} y={610} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={800} fill={GOLD}
          opacity={ez(l - 30, 12)}>一个字一个字，往下抽</text>
        <Mascot x={260} y={1130} s={1.5} mood={'shock'} f={f} op={ez(l - 14, 12)} />
        <g transform={'translate(830 1100)'} opacity={ez(l - 22, 12)}>
          <LaoJia x={0} y={0} s={0.95} mode={'point'} f={f} wag={l < 150} />
        </g>
        {l >= 100 ? (
          <g opacity={ez(l - 100, 8)} transform={`translate(540 900) rotate(-8) scale(${slamS(l, 100)})`}>
            <rect x={-200} y={-72} width={400} height={144} rx={18} fill={'none'} stroke={RED} strokeWidth={14} />
            <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontSize={86} fontWeight={900} fill={RED}>编的</text>
          </g>
        ) : null}
        <text x={540} y={1560} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY}
          opacity={ez(l - 130, 12)}>它不是查，它是抽</text>
      </svg>
    </div>
  );
};

/* ============ 幕2 · 抽签A：孙悟空（6-12s） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill={BG} />
      <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={GREY}
        opacity={ez(l - 4, 10)}>它心里给每个字都打了分</text>
      <text x={540} y={340} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={INK}
        opacity={ez(l - 12, 10)}>问：孙悟空住哪儿？</text>
      <Bars l={l} data={[['花果山', 92], ['水帘洞', 5], ['傲来国', 2], ['火星', 0.8]]} hi={0} />
      <Mascot x={180} y={760} s={0.95} mood={'happy'} f={f} op={ez(l - 8, 10)} />
      <text x={540} y={1680} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={GOLD}
        opacity={ez(l - 110, 12)}>见过的，分高，抽得准</text>
    </svg>
  </div>
);

/* ============ 幕3 · 抽签B：红楼梦（12-18s） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill={BG} />
      <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={GREY}
        opacity={ez(l - 4, 10)}>没见过的，它也照样打分</text>
      <text x={540} y={340} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={INK}
        opacity={ez(l - 12, 10)}>问：《红楼梦》第八十一回写了啥？</text>
      <Bars l={l} data={[['原稿', 8], ['残本', 4], ['续书', 2], ['不知道', 0.3]]} hi={0} />
      <Mascot x={180} y={760} s={0.95} mood={'cool'} f={f} op={ez(l - 8, 10)} />
      {l >= 120 ? (
        <g opacity={ez(l - 120, 8)} transform={`translate(700 900) rotate(-9) scale(${slamS(l, 120)})`}>
          <rect x={-180} y={-62} width={360} height={124} rx={16} fill={'none'} stroke={RED} strokeWidth={12} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={RED}>编的</text>
        </g>
      ) : null}
      <text x={540} y={1680} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={RED}
        opacity={ez(l - 140, 12)}>最低那根，它也敢抽</text>
    </svg>
  </div>
);

/* ============ 幕4 · 抽签C：你确定吗（18-24s） ============ */
const Scene4: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill={BG} />
      <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={GREY}
        opacity={ez(l - 4, 10)}>它还是给每个字打分</text>
      <text x={540} y={340} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={INK}
        opacity={ez(l - 12, 10)}>问：你确定吗？</text>
      <Bars l={l} data={[['真的', 95], ['大概吧', 4], ['可能', 0.8], ['不知道', 0.2]]} hi={3} />
      <Mascot x={180} y={760} s={0.95} mood={'happy'} f={f} op={ez(l - 8, 10)} />
      <text x={540} y={1680} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={RED}
        opacity={ez(l - 140, 12)}>「不知道」只有 0.2%——它从来不选</text>
    </svg>
  </div>
);

/* ============ 幕5 · 结论（24-30s） ============ */
const Scene5: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill={BG} />
      <text x={540} y={620} textAnchor="middle" fontFamily={FONT} fontSize={86} fontWeight={900} fill={INK}
        opacity={ez(l - 6, 10)} transform={`translate(540 620) scale(${slamS(l, 6)}) translate(-540 -620)`}>它不是在查</text>
      <text x={540} y={760} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={GOLD}
        opacity={ez(l - 34, 10)} transform={`translate(540 760) scale(${slamS(l, 34)}) translate(-540 -760)`}>它是在抽签</text>
      <text x={540} y={900} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={RED}
        opacity={ez(l - 74, 12)}>抽得越顺，你越以为它懂</text>
      <text x={540} y={1240} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={900} fill={INK}
        opacity={ez(l - 120, 12)}>它不是撒谎</text>
      <text x={540} y={1330} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={900} fill={INK}
        opacity={ez(l - 136, 12)}>它<tspan fill={RED}>不知道</tspan>自己在编</text>
      <Mascot x={300} y={1600} s={0.8} mood={'happy'} f={f} op={ez(l - 40, 12)} />
      <g transform={'translate(760 1590)'} opacity={ez(l - 46, 12)}>
        <LaoJia x={0} y={0} s={0.75} mode={'win'} f={f} wag={true} />
      </g>
    </svg>
  </div>
);
"""

MAIN = r"""
const SUBSR: [number, number, string][] = [
  [0, 6.0, 'AI 为什么会瞎编？'],
  [6.0, 12.0, '问：孙悟空住哪儿？它抽中花果山'],
  [12.0, 18.0, '没见过的，它也敢抽'],
  [18.0, 24.0, '「不知道」它从来不选'],
  [24.0, 30.0, '它不是撒谎，它不知道自己在编'],
];

const SubR: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBSR.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const step = Math.min(0.1, ((seg[1] - seg[0]) / Math.max(1, chars.length)) * 0.82);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / step) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1740, textAlign: 'center', padding: '0 50px' }}>
      {chars.map((ch, i) => (
        <span key={i} style={{
          fontFamily: FONT, fontSize: 44, fontWeight: 900, display: 'inline-block',
          color: i === n - 1 ? RED : (i < n ? INK : '#B5AC9B'),
          transform: i === n - 1 ? 'scale(1.1)' : 'scale(1)',
        }}>{ch}</span>
      ))}
    </div>
  );
};

const SER: [number, string, number][] = [
  [100, 'sfx/hit_1750.wav', 0.9],
  [188, 'sfx/ding.mp3', 0.7],
  [380, 'sfx/ding.mp3', 0.7],
  [482, 'sfx/da.mp3', 0.85],
  [565, 'sfx/ding.mp3', 0.7],
  [730, 'sfx/ding.mp3', 0.85],
];

const BOUNDSR: [number, number][] = [[0, 180], [180, 360], [360, 540], [540, 720], [720, 900]];

export const EP07R: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < BOUNDSR.length; i++) {
    if (frame < BOUNDSR[i][1]) { seg = i; break; }
    seg = i;
  }
  const [b0] = BOUNDSR[seg];
  const l = frame - b0;
  const SC = [Scene1, Scene2, Scene3, Scene4, Scene5];
  const Scene = SC[seg];
  const cutFlash = frame - b0 < 3 ? (1 - (frame - b0) / 3) * 0.12 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Scene f={frame} l={l} />
      {SER.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={1} />
      <SubR t={t} />
      {cutFlash > 0 ? <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', opacity: cutFlash, pointerEvents: 'none' }} /> : null}
    </AbsoluteFill>
  );
};
"""

def main():
    src = io.open(SRC, encoding="utf-8").read()
    lines = src.splitlines()
    i_s1 = next(i for i, l in enumerate(lines) if l.startswith("const Scene1"))
    head = "\n".join(lines[:i_s1])
    head = head.replace("import { CUES, CHARS, charAt, TOTAL_FRAMES } from './ep6fCues';\n", "")
    head = head.replace("import { CUES, CHARS, charAt } from './ep6fCues';\n", "")
    head = head.replace("import { AbsoluteFill, useCurrentFrame, staticFile, Audio } from 'remotion';",
                        "import { AbsoluteFill, useCurrentFrame, staticFile, Audio, Sequence } from 'remotion';")
    head = head.replace("const BG = '#F5F7FA';", "const BGX = '#F6F1E6';")
    sc = SCENES
    sc = sc.replace("const GOLD = '#B8801F';\nconst RED = '#D93327';\nconst GREY = '#8A8175';",
                    "const GOLD_D = '#B8801F';\nconst RED_D = '#D93327';\nconst GREY_D = '#8A8175';")
    for a, b in [("fill={GOLD}", "fill={GOLD_D}"), ("fill={RED}", "fill={RED_D}"), ("fill={GREY}", "fill={GREY_D}"),
                 ("stroke={GOLD}", "stroke={GOLD_D}"), ("stroke={RED}", "stroke={RED_D}"), ("stroke={GREY}", "stroke={GREY_D}")]:
        sc = sc.replace(a, b)
    mn = MAIN.replace("? RED :", "? RED_D :")
    out = HEAD + head.split("*/", 1)[-1] + "\n" + sc + mn
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    print("EP07R.tsx:", len(out), "字 | 镜:", out.count("const Scene"))

if __name__ == "__main__":
    main()
