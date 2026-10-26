# -*- coding: utf-8 -*-
# EP07H 完整版 · 33秒 6幕 · 字幕在上方、逐字快速弹入、底部无字幕、结尾预告
import io, os

ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP07H.tsx")

HEAD = r"""
/* EP07H 完整版 33秒 6幕
 * 字幕在上方（逐字快速弹入），底部不放字幕；角标下移避开平台标题
 * 6 幕：主题 → 问答打脸 → 抽签机制 → 没有“不知道” → 结论 → 下集预告
 */
"""

SCENES = r"""
const BG = '#F6F1E6';
const INK = '#201C17';
const GOLD = '#B8801F';
const RED = '#D93327';
const GREY = '#8A8175';
const CARD = '#FFFDF7';
const LINE2 = '#D9D0BE';
const GREEN = '#2E7D4F';

const Mascot: React.FC<{ x: number; y: number; s: number; mood: string; f: number; op?: number }> =
  ({ x, y, s, mood, f, op = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <circle cx={0} cy={-4} r={130} fill={'#FFFFFF'} opacity={0.95} />
      <circle cx={0} cy={-4} r={130} fill={'none'} stroke={LINE2} strokeWidth={4} />
      <XiaoMo x={0} y={0} s={1} mood={mood} f={f} />
    </g>
  );

const PillBox: React.FC<{ l: number; x: number; y: number; s: number }> = ({ l, x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={ez(l - 8, 12)}>
    <rect x={-110} y={-70} width={220} height={140} rx={18} fill={CARD} stroke={INK} strokeWidth={4} />
    <rect x={-110} y={-70} width={220} height={38} rx={18} fill={GREEN} opacity={0.85} />
    <text x={0} y={-42} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={900} fill="#FFFFFF">OTC</text>
    <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={INK}>感冒药</text>
    <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontSize={20} fontWeight={700} fill={GREY}>请按说明书服用</text>
  </g>
);

const Leaflet: React.FC<{ l: number; at: number }> = ({ l, at }) => {
  const p = eio(clamp01((l - at) / 18));
  const w = 620 * p;
  return (
    <g opacity={p}>
      <rect x={540 - w / 2} y={1180} width={w} height={300} rx={10} fill={CARD} stroke={LINE2} strokeWidth={3} />
      {p > 0.8 ? (
        <>
          <text x={540} y={1246} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={900} fill={GREY}>说明书 · 用法用量</text>
          <text x={540} y={1320} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={GREEN}>一天一次</text>
          <text x={540} y={1392} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={GREEN}>每次一片</text>
        </>
      ) : null}
    </g>
  );
};

/* 抽签柱状图 */
const Bars: React.FC<{ l: number; data: [string, number][]; hi: number }> = ({ l, data, hi }) => {
  const baseY = 1620;
  const maxH = 620;
  return (
    <g>
      <line x1={100} y1={baseY} x2={980} y2={baseY} stroke={INK} strokeWidth={4} opacity={0.3} />
      {data.map(([label, v], i) => {
        const grow = clamp01((l - 20 - i * 9) / 34);
        const e = 1 - Math.pow(1 - grow, 3);
        const h = maxH * (v / 100) * e;
        const x = 120 + i * 215;
        const y = baseY - h;
        const on = i === hi && l > 76;
        return (
          <g key={i}>
            <rect x={x} y={y} width={170} height={Math.max(h, 2)} rx={6}
              fill={on ? GOLD : LINE2} stroke={on ? GOLD : '#B5AC9B'} strokeWidth={3} />
            <text x={x + 85} y={y - 16} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900}
              fill={on ? GOLD : GREY} opacity={grow}>{v}%</text>
            <text x={x + 85} y={baseY + 44} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={800}
              fill={on ? INK : GREY}>{label}</text>
            {on ? (
              <g opacity={ez(l - 76, 10)}>
                <rect x={x + 8} y={y - 126} width={154} height={60} rx={12} fill={GOLD} />
                <text x={x + 85} y={y - 84} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={900} fill="#FFFFFF">抽中它</text>
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

/* ============ 幕1 · 主题（0-5.5s） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill={BG} />
      <radialGradient id="vgh1" cx="50%" cy="44%" r="74%">
        <stop offset="55%" stopColor="#F6F1E6" stopOpacity={0} />
        <stop offset="100%" stopColor="#BDB097" stopOpacity={0.4} />
      </radialGradient>
      <rect width={1080} height={1920} fill={'url(#vgh1)'} />
      <PillBox l={l} x={280} y={760} s={1.1} />
      <g transform={'translate(830 720)'} opacity={ez(l - 22, 12)}>
        <LaoJia x={0} y={0} s={1.05} mode={'gasp'} f={f} wag={l > 60} />
      </g>
      <Mascot x={600} y={1060} s={1.25} mood={'cool'} f={f} op={ez(l - 34, 12)} />
      {l >= 84 ? (
        <g opacity={ez(l - 84, 8)} transform={`translate(820 1010) rotate(-9) scale(${slamS(l, 84)})`}>
          <rect x={-160} y={-58} width={320} height={116} rx={14} fill={'none'} stroke={RED} strokeWidth={12} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontSize={68} fontWeight={900} fill={RED}>编的</text>
        </g>
      ) : null}
      <text x={540} y={1420} textAnchor="middle" fontFamily={FONT} fontSize={58} fontWeight={900} fill={INK}
        opacity={ez(l - 60, 12)}>它答得比医生还<tspan fill={RED}>快</tspan></text>
    </svg>
  </div>
);

/* ============ 幕2 · 问答 + 说明书打脸（5.5-12s） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const [sx, sy] = shake(l, 150, 14);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG} />
        <g opacity={ez(l - 6, 10)}>
          <rect x={130} y={470} width={820} height={126} rx={22} fill={CARD} stroke={LINE2} strokeWidth={3} />
          <text x={540} y={552} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={INK}>这药一天吃几次？</text>
        </g>
        <Mascot x={230} y={880} s={1.05} mood={'happy'} f={f} op={ez(l - 16, 10)} />
        <g opacity={ez(l - 28, 10)} transform={`translate(0 ${(1 - ez(l - 28, 10)) * 30})`}>
          <rect x={400} y={730} width={600} height={230} rx={26} fill={GOLD} />
          <text x={700} y={808} textAnchor="middle" fontFamily={FONT} fontSize={50} fontWeight={900} fill="#FFFFFF">一天三次</text>
          <text x={700} y={890} textAnchor="middle" fontFamily={FONT} fontSize={50} fontWeight={900} fill="#FFFFFF">每次两片</text>
        </g>
        {l >= 118 ? (
          <g opacity={ez(l - 118, 8)} transform={`translate(700 756) rotate(-9) scale(${slamS(l, 118)})`}>
            <rect x={-190} y={-62} width={380} height={124} rx={14} fill={'none'} stroke={RED} strokeWidth={12} />
            <text x={0} y={24} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={RED}>编的</text>
          </g>
        ) : null}
        <Leaflet l={l} at={150} />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 190, textAlign: 'center', opacity: ez(l - 60, 12) }}>
        <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color: GREY, marginBottom: 14 }}>它看过说明书吗？</div>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, margin: '0 14px',
            border: '2px solid #D9D0BE', borderRadius: 36, padding: '12px 28px',
            fontFamily: FONT, fontSize: 32, fontWeight: 800, color: GREY }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, border: '2px solid #B5AC9B' }} />看过
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, margin: '0 14px',
            border: '2px solid ' + (l >= 128 ? '#D93327' : '#D9D0BE'), borderRadius: 36, padding: '12px 28px',
            fontFamily: FONT, fontSize: 32, fontWeight: 800, color: l >= 128 ? INK : GREY }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: l >= 128 ? '#D93327' : 'transparent',
              border: '2px solid ' + (l >= 128 ? '#D93327' : '#B5AC9B') }} />没看
          </span>
        </div>
      </div>
    </div>
  );
};

/* ============ 幕3 · 抽签机制（12-18.5s） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill={BG} />
      <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY}
        opacity={ez(l - 4, 10)}>它心里给每个答案都打了分</text>
      <Bars l={l} data={[['一天三次', 92], ['一天两次', 5], ['一天一次', 2], ['不知道', 0.3]]} hi={0} />
      <Mascot x={150} y={800} s={0.75} mood={'cool'} f={f} op={ez(l - 60, 12)} />
      <text x={540} y={1770} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GOLD}
        opacity={ez(l - 110, 12)}>最高那根，它抽中了</text>
    </svg>
  </div>
);

/* ============ 幕4 · 它没有“不知道”（18.5-25s） ============ */
const Scene4: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill={BG} />
      <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY}
        opacity={ez(l - 4, 10)}>哪怕它根本不知道，也照样打分</text>
      <Bars l={l} data={[['一天三次', 92], ['一天两次', 5], ['一天一次', 2], ['不知道', 0.3]]} hi={3} />
      <Mascot x={150} y={800} s={0.75} mood={'shock'} f={f} op={ez(l - 60, 12)} />
      <text x={540} y={1770} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={RED}
        opacity={ez(l - 110, 12)}>「不知道」只有 0.3%，它从来不选</text>
    </svg>
  </div>
);

/* ============ 幕5 · 结论（25-29.5s） ============ */
const Scene5: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill={BG} />
      <text x={540} y={620} textAnchor="middle" fontFamily={FONT} fontSize={66} fontWeight={900} fill={INK}
        opacity={ez(l - 6, 10)} transform={`translate(540 620) scale(${slamS(l, 6)}) translate(-540 -620)`}>它不是在查资料</text>
      <text x={540} y={740} textAnchor="middle" fontFamily={FONT} fontSize={82} fontWeight={900} fill={GOLD}
        opacity={ez(l - 30, 10)} transform={`translate(540 740) scale(${slamS(l, 30)}) translate(-540 -740)`}>它是在抽签</text>
      <text x={540} y={900} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900} fill={INK}
        opacity={ez(l - 70, 12)}>药量这种事，<tspan fill={GREEN}>只能信说明书</tspan></text>
      <Mascot x={330} y={1330} s={1.05} mood={'shock'} f={f} op={ez(l - 40, 12)} />
      <g transform={'translate(790 1310)'} opacity={ez(l - 46, 12)}>
        <LaoJia x={0} y={0} s={0.9} mode={'gasp'} f={f} wag={false} />
      </g>
      <text x={540} y={1620} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={RED}
        opacity={ez(l - 100, 12)}>它不是撒谎，它不知道自己在编</text>
    </svg>
  </div>
);

/* ============ 幕6 · 下集预告（29.5-33s） ============ */
const Scene6: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill={'#1A1208'} />
      <radialGradient id="vgh6" cx="50%" cy="44%" r="60%">
        <stop offset="0%" stopColor="#4A2A08" />
        <stop offset="100%" stopColor="#1A1208" />
      </radialGradient>
      <rect width={1080} height={1920} fill={'url(#vgh6)'} />
      <text x={540} y={780} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={GOLD}
        opacity={ez(l - 10, 10)}>下一集</text>
      <text x={540} y={900} textAnchor="middle" fontFamily={FONT} fontSize={74} fontWeight={900} fill={'#F5EFE2'}
        opacity={ez(l - 30, 12)}>AI 会不会<tspan fill={RED}>抢走你的工作</tspan>？</text>
      <text x={540} y={1040} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={'#8A7F70'}
        opacity={ez(l - 56, 12)}>先说结论：会，但不是你想的那些活</text>
      <Mascot x={540} y={1380} s={1.2} mood={'cool'} f={f} op={ez(l - 40, 12)} />
      <text x={540} y={1700} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={GOLD}
        opacity={ez(l - 80, 12)}>点赞关注，下集见</text>
    </svg>
  </div>
);
"""

MAIN = r"""
const SUBS: [number, number, string, string][] = [
  [0, 5.5, 'AI 说的用药量，你敢信吗？', '用药量'],
  [5.5, 12.0, '它答得比医生还快，可连说明书都没看', '没看'],
  [12.0, 18.5, '它不是查，它是在抽签', '抽签'],
  [18.5, 25.0, '「不知道」只有 0.3%，它从来不选', '0.3%'],
  [25.0, 29.5, '药量这种事，只能信说明书', '说明书'],
  [29.5, 33.0, '下集：AI 会不会抢走你的工作？', '抢走'],
];

const SubH: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBS.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const kw = seg[3];
  let kwStart = seg[2].indexOf(kw);
  let kwEnd = kwStart + kw.length;
  const isLast = t >= s_len(seg[0], seg[1]);
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top: 190, textAlign: 'center' }}>
      {chars.map((ch, i) => {
        const ap = t - seg[0] - i * 0.042;
        const p = clamp01(ap / 0.09);
        const inKw = kwStart >= 0 && i >= kwStart && i < kwEnd;
        return (
          <span key={i} style={{
            display: 'inline-block',
            opacity: p,
            transform: `translateY(${(1 - p) * 18}px) scale(${0.55 + 0.45 * p})`,
            fontFamily: FONT,
            fontSize: i === chars.length - 1 && isLast ? 58 : 54,
            fontWeight: 900,
            color: inKw ? RED_D : INK,
            lineHeight: 1.4,
          }}>{ch}</span>
        );
      })}
    </div>
  );
};

function s_len(a: number, b: number) {
  return b;
}

const SE: [number, string, number][] = [
  [6, 'sfx/da.mp3', 0.55],
  [22, 'sfx/da.mp3', 0.55],
  [84, 'sfx/boom.wav', 0.85],
  [120, 'sfx/da.mp3', 0.7],
  [150, 'sfx/whoosh.wav', 0.55],
  [196, 'sfx/ding.mp3', 0.85],
  [380, 'sfx/ding.mp3', 0.75],
  [470, 'sfx/ding.mp3', 0.7],
  [560, 'sfx/ding.mp3', 0.7],
  [620, 'sfx/ding.mp3', 0.8],
  [660, 'sfx/ding.mp3', 0.7],
  [760, 'sfx/ding.mp3', 0.8],
  [890, 'sfx/ding.mp3', 0.8],
  [960, 'sfx/whoosh.wav', 0.6],
];

const BOUNDS: [number, number][] = [[0, 165], [165, 360], [360, 555], [555, 750], [750, 885], [885, 990]];

export const EP07H: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < BOUNDS.length; i++) {
    if (frame < BOUNDS[i][1]) { seg = i; break; }
    seg = i;
  }
  const [b0] = BOUNDS[seg];
  const l = frame - b0;
  const SC = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];
  const Scene = SC[seg];
  const cutFlash = frame - b0 < 3 ? (1 - (frame - b0) / 3) * 0.12 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Scene f={frame} l={l} />
      {SE.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.85} />
      <SubH t={t} />
      {/* 角标下移，避开平台顶部标题 */}
      <div style={{ position: 'absolute', left: 54, top: 400, padding: '12px 26px', border: '2px solid #D9D0BE',
        borderRadius: 28, background: 'rgba(246,241,230,0.9)', fontFamily: FONT, fontSize: 24, fontWeight: 800,
        color: GREY, opacity: 0.9 }}>AI 科普 · EP07</div>
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
    sc = sc.replace("const GOLD = '#B8801F';\nconst RED = '#D93327';\nconst GREY = '#8A8175';\nconst CARD = '#FFFDF7';\nconst LINE2 = '#D9D0BE';\nconst GREEN = '#2E7D4F';",
                    "const GOLD_D = '#B8801F';\nconst RED_D = '#D93327';\nconst GREY_D = '#8A8175';\nconst CARD_D = '#FFFDF7';\nconst LINE2_D = '#D9D0BE';\nconst GREEN_D = '#2E7D4F';")
    for a, b in [("fill={GOLD}", "fill={GOLD_D}"), ("fill={RED}", "fill={RED_D}"), ("fill={GREY}", "fill={GREY_D}"),
                 ("stroke={GOLD}", "stroke={GOLD_D}"), ("stroke={RED}", "stroke={RED_D}"),
                 ("fill={CARD}", "fill={CARD_D}"), ("stroke={LINE2}", "stroke={LINE2_D}"),
                 ("fill={GREEN}", "fill={GREEN_D}"), ("color: GREY", "color: GREY_D"),
                 ("<tspan fill={RED}>", "<tspan fill={RED_D}>"), ("<tspan fill={GREEN}>", "<tspan fill={GREEN_D}>")]:
        sc = sc.replace(a, b)
    mn = MAIN
    out = HEAD + head.split("*/", 1)[-1] + "\n" + sc + mn
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    print("EP07H.tsx:", len(out))

if __name__ == "__main__":
    main()
