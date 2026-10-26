# -*- coding: utf-8 -*-
# EP07G《AI 说的用药量，你敢信吗》15秒 3幕 —— 接地气 + IP 显眼 + 多层视觉
import io, os
ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP07G.tsx")
HEAD = r"""
/* EP07G 15秒 3幕 · 米白底 · 老贾举药盒 + 小模秒答 · 说明书打脸 */
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

/* 药盒 */
const PillBox: React.FC<{ l: number; x: number; y: number; s: number }> = ({ l, x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={ez(l - 8, 12)}>
    <rect x={-110} y={-70} width={220} height={140} rx={18} fill={CARD} stroke={INK} strokeWidth={4} />
    <rect x={-110} y={-70} width={220} height={38} rx={18} fill={GREEN} opacity={0.85} />
    <text x={0} y={-42} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={900} fill="#FFFFFF">OTC</text>
    <text x={0} y={14} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={INK}>感冒药</text>
    <text x={0} y={52} textAnchor="middle" fontFamily={FONT} fontSize={20} fontWeight={700} fill={GREY}>请按说明书服用</text>
  </g>
);

/* 说明书 */
const Leaflet: React.FC<{ l: number; at: number }> = ({ l, at }) => {
  const p = eio(clamp01((l - at) / 20));
  const w = 560 * p;
  return (
    <g opacity={p}>
      <rect x={260} y={1080} width={w} height={300} rx={8} fill={CARD} stroke={LINE2} strokeWidth={3} />
      {p > 0.85 ? (
        <>
          <text x={540} y={1140} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={900} fill={GREY}>用法用量</text>
          <text x={540} y={1210} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GREEN}>一天一次</text>
          <text x={540} y={1280} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GREEN}>每次一片</text>
        </>
      ) : null}
    </g>
  );
};

/* ============ 幕1 · 主题（0-5s） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill={BG} />
      <radialGradient id="vg1" cx="50%" cy="42%" r="74%">
        <stop offset="55%" stopColor="#F6F1E6" stopOpacity={0} />
        <stop offset="100%" stopColor="#BDB097" stopOpacity={0.4} />
      </radialGradient>
      <rect width={1080} height={1920} fill={'url(#vg1)'} />
      <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontSize={78} fontWeight={900} fill={INK}
        opacity={ez(l - 6, 10)} transform={`translate(540 420) scale(${slamS(l, 6)}) translate(-540 -420)`}>
        AI 说的<tspan fill={RED}>用药量</tspan>
      </text>
      <text x={540} y={540} textAnchor="middle" fontFamily={FONT} fontSize={86} fontWeight={900} fill={INK}
        opacity={ez(l - 22, 10)} transform={`translate(540 540) scale(${slamS(l, 22)}) translate(-540 -540)`}>
        你敢<tspan fill={RED}>信</tspan>吗？
      </text>
      <PillBox l={l} x={330} y={900} s={1.15} />
      <g transform={'translate(830 880)'} opacity={ez(l - 26, 12)}>
        <LaoJia x={0} y={0} s={1.0} mode={'gasp'} f={f} wag={l > 60} />
      </g>
      <Mascot x={560} y={1210} s={1.15} mood={'cool'} f={f} op={ez(l - 40, 12)} />
      {l >= 90 ? (
        <g opacity={ez(l - 90, 8)} transform={`translate(780 1180) rotate(-9) scale(${slamS(l, 90)})`}>
          <rect x={-150} y={-54} width={300} height={108} rx={14} fill={'none'} stroke={RED} strokeWidth={12} />
          <text x={0} y={20} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={RED}>编的</text>
        </g>
      ) : null}
      <text x={540} y={1600} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={800} fill={GREY}
        opacity={ez(l - 110, 12)}>它答得比医生还快</text>
    </svg>
  </div>
);

/* ============ 幕2 · 一问一答 + 说明书打脸（5-11s） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const [sx, sy] = shake(l, 120, 14);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG} />
        <text x={540} y={220} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY}
          opacity={ez(l - 4, 10)}>你问它</text>
        <g opacity={ez(l - 10, 10)}>
          <rect x={150} y={280} width={780} height={130} rx={22} fill={CARD} stroke={LINE2} strokeWidth={3} />
          <text x={540} y={364} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={INK}>这药一天吃几次？</text>
        </g>
        {/* 小模秒答 */}
        <Mascot x={250} y={800} s={1.0} mood={'happy'} f={f} op={ez(l - 20, 10)} />
        <g opacity={ez(l - 34, 10)} transform={`translate(0 ${(1 - ez(l - 34, 10)) * 30})`}>
          <rect x={410} y={640} width={560} height={220} rx={26} fill={GOLD} />
          <text x={690} y={712} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill="#FFFFFF">一天三次</text>
          <text x={690} y={790} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill="#FFFFFF">每次两片</text>
        </g>
        {/* 红章砸在它答案上 */}
        {l >= 120 ? (
          <g opacity={ez(l - 120, 8)} transform={`translate(690 660) rotate(-9) scale(${slamS(l, 120)})`}>
            <rect x={-180} y={-60} width={360} height={120} rx={14} fill={'none'} stroke={RED} strokeWidth={12} />
            <text x={0} y={24} textAnchor="middle" fontFamily={FONT} fontSize={70} fontWeight={900} fill={RED}>编的</text>
          </g>
        ) : null}
        {/* 说明书展开 + 正确用量 */}
        <Leaflet l={l} at={150} />
        {l >= 186 ? (
          <g opacity={ez(l - 186, 10)}>
            <text x={540} y={1460} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={GREEN}>说明书：一天一次，每次一片</text>
          </g>
        ) : null}
      </svg>
      {/* 仪表盘 */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 240, textAlign: 'center', opacity: ez(l - 60, 12) }}>
        <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color: GREY, marginBottom: 14 }}>它看过说明书吗？</div>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, margin: '0 14px',
            border: '2px solid #D9D0BE', borderRadius: 36, padding: '12px 28px',
            fontFamily: FONT, fontSize: 32, fontWeight: 800, color: GREY }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, border: '2px solid #B5AC9B' }} />看过
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, margin: '0 14px',
            border: '2px solid ' + (l >= 130 ? '#D93327' : '#D9D0BE'), borderRadius: 36, padding: '12px 28px',
            fontFamily: FONT, fontSize: 32, fontWeight: 800, color: l >= 130 ? INK : GREY }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: l >= 130 ? '#D93327' : 'transparent',
              border: '2px solid ' + (l >= 130 ? '#D93327' : '#B5AC9B') }} />没看
          </span>
        </div>
      </div>
    </div>
  );
};

/* ============ 幕3 · 收尾（11-15s） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
      <rect width={1080} height={1920} fill={BG} />
      <text x={540} y={560} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={INK}
        opacity={ez(l - 6, 10)} transform={`translate(540 560) scale(${slamS(l, 6)}) translate(-540 -560)`}>
        它答得比医生快
      </text>
      <text x={540} y={680} textAnchor="middle" fontFamily={FONT} fontSize={78} fontWeight={900} fill={RED}
        opacity={ez(l - 30, 10)} transform={`translate(540 680) scale(${slamS(l, 30)}) translate(-540 -680)`}>
        错得比谁都离谱
      </text>
      <text x={540} y={900} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={INK}
        opacity={ez(l - 70, 12)}>药量这种事，<tspan fill={GREEN}>只能信说明书</tspan></text>
      <Mascot x={330} y={1350} s={1.1} mood={'shock'} f={f} op={ez(l - 40, 12)} />
      <g transform={'translate(800 1330)'} opacity={ez(l - 46, 12)}>
        <LaoJia x={0} y={0} s={0.95} mode={'gasp'} f={f} wag={false} />
      </g>
      <text x={540} y={1700} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY}
        opacity={ez(l - 100, 12)}>关注我，少踩一个坑</text>
    </svg>
  </div>
);
"""
MAIN = r"""
const SUBS: [number, number, string][] = [
  [0, 5.0, 'AI 说的用药量，你敢信吗？'],
  [5.0, 11.0, '问它一天吃几次，它答得比医生还快'],
  [11.0, 15.0, '药量这种事，只能信说明书'],
];
const SubG: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBS.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const step = Math.min(0.1, ((seg[1] - seg[0]) / Math.max(1, chars.length)) * 0.82);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / step) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1740, textAlign: 'center', padding: '0 50px' }}>
      {chars.map((ch, i) => (
        <span key={i} style={{ fontFamily: FONT, fontSize: 44, fontWeight: 900, display: 'inline-block',
          color: i === n - 1 ? RED : (i < n ? INK : '#B5AC9B'),
          transform: i === n - 1 ? 'scale(1.1)' : 'scale(1)' }}>{ch}</span>
      ))}
    </div>
  );
};
const SE: [number, string, number][] = [
  [8, 'sfx/da.mp3', 0.6],
  [90, 'sfx/boom.wav', 0.9],
  [160, 'sfx/ding.mp3', 0.85],
  [270, 'sfx/da.mp3', 0.7],
  [334, 'sfx/ding.mp3', 0.8],
  [420, 'sfx/ding.mp3', 0.7],
];
const BOUNDS: [number, number][] = [[0, 150], [150, 330], [330, 450]];
export const EP07G: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < BOUNDS.length; i++) { if (frame < BOUNDS[i][1]) { seg = i; break; } seg = i; }
  const [b0] = BOUNDS[seg];
  const l = frame - b0;
  const SC = [Scene1, Scene2, Scene3];
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
      <Audio src={staticFile('bgm_midnight.m4a')} volume={1} />
      <SubG t={t} />
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
                 ("fill={GREEN}", "fill={GREEN_D}"), ("color: GREY", "color: GREY_D")]:
        sc = sc.replace(a, b)
    sc = sc.replace("<tspan fill={RED}>", "<tspan fill={RED_D}>").replace("<tspan fill={GREEN}>", "<tspan fill={GREEN_D}>")
    mn = MAIN.replace("color: i === n - 1 ? RED :", "color: i === n - 1 ? RED_D :")
    out = HEAD + head.split("*/", 1)[-1] + "\n" + sc + mn
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    print("EP07G.tsx:", len(out))
if __name__ == "__main__":
    main()
