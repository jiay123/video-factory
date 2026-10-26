# -*- coding: utf-8 -*-
# EP07F《填满》12秒 —— 一个画面 8 层，逐层填入 + 镜头慢推
import io, os
ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP07F.tsx")
HEAD = r"""
/* EP07F 一个画面 8 层逐层填满 · 12秒 · 镜头慢推 */
"""
SCENES = r"""
const BG = '#F6F1E6';
const INK = '#201C17';
const GOLD = '#B8801F';
const RED = '#D93327';
const GREY = '#8A8175';
const CARD = '#FFFDF7';
const LINE2 = '#D9D0BE';

const Mascot: React.FC<{ x: number; y: number; s: number; mood: string; f: number; op?: number }> =
  ({ x, y, s, mood, f, op = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <circle cx={0} cy={-4} r={130} fill={'#FFFFFF'} opacity={0.9} />
      <circle cx={0} cy={-4} r={130} fill={'none'} stroke={LINE2} strokeWidth={4} />
      <XiaoMo x={0} y={0} s={1} mood={mood} f={f} />
    </g>
  );

const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const push = 1 + 0.12 * (1 - Math.pow(1 - clamp01(l / 300), 2));
  const [sx, sy] = shake(l, 196, 12);
  const q1 = ez(l - 60, 12);
  const a1 = ez(l - 100, 12);
  const linkP = clamp01((l - 132) / 22);
  const dashP = ez(l - 168, 12);
  const noChecked = l >= 186;
  const stampP = ez(l - 206, 10);
  const badgeP = ez(l - 240, 12);
  const cap2 = ez(l - 268, 14);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px) scale(${push})` }}>
      {/* 第1层：底 + 暗角 + 网格 */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG} />
        <radialGradient id="vg" cx="50%" cy="42%" r="72%">
          <stop offset="55%" stopColor="#F6F1E6" stopOpacity={0} />
          <stop offset="100%" stopColor="#BDB097" stopOpacity={0.42} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#vg)'} />
        {Array.from({ length: 13 }, (_, i) => (
          <line key={'v' + i} x1={i * 84} y1={0} x2={i * 84} y2={1920} stroke={'#C9BFA8'} strokeWidth={1} opacity={0.22} />
        ))}
        {Array.from({ length: 22 }, (_, i) => (
          <line key={'h' + i} x1={0} y1={i * 88} x2={1080} y2={i * 88} stroke={'#C9BFA8'} strokeWidth={1} opacity={0.16} />
        ))}
      </svg>

      {/* 第2层：顶部字幕条 */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center',
        fontFamily: FONT, fontSize: 54, fontWeight: 900, color: INK, opacity: ez(l - 10, 12) }}>
        问它一句话，它答得<span style={{ color: RED }}>比谁都快</span>
      </div>

      {/* 第3层：手机（线稿） */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g opacity={ez(l - 24, 12)}>
          <rect x={230} y={430} width={620} height={1020} rx={54} fill={CARD} stroke={INK} strokeWidth={5} />
          <rect x={470} y={470} width={140} height={16} rx={8} fill={LINE2} />
          <rect x={266} y={512} width={548} height={860} rx={22} fill="#FBF8F1" stroke={LINE2} strokeWidth={3} />
          <circle cx={540} cy={1412} r={10} fill="none" stroke={LINE2} strokeWidth={3} />
        </g>
      </svg>

      {/* 第4层：问气泡 */}
      <div style={{ position: 'absolute', left: 300, top: 600, width: 470, padding: '26px 30px',
        background: '#EDE6D8', borderRadius: 26, fontFamily: FONT, fontSize: 42, fontWeight: 800,
        color: INK, opacity: q1, transform: `translateY(${(1 - q1) * 30}px)` }}>孙悟空住哪儿？</div>

      {/* 第5层：答气泡 */}
      <div style={{ position: 'absolute', left: 290, top: 760, width: 380, padding: '30px 30px',
        background: GOLD, borderRadius: 26, fontFamily: FONT, fontSize: 70, fontWeight: 900,
        color: '#FFFFFF', textAlign: 'center', opacity: a1, transform: `translateY(${(1 - a1) * 34}px)` }}>花果山</div>

      {/* 第6层：红色连线 + 高亮框 */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <path d={'M 620 700 Q 760 740 700 800'} fill="none" stroke={RED} strokeWidth={5} strokeDasharray="500"
          strokeDashoffset={500 * (1 - linkP)} opacity={linkP > 0 ? 0.9 : 0} />
        {l >= 140 ? (
          <rect x={282} y={752} width={396} height={156} rx={18} fill="none" stroke={RED} strokeWidth={6}
            opacity={ez(l - 140, 10)} strokeDasharray="16 10" />
        ) : null}
        {l >= 150 ? (
          <text x={806} y={742} fontFamily={FONT} fontSize={36} fontWeight={900} fill={RED} opacity={ez(l - 150, 10)}>秒答</text>
        ) : null}
      </svg>

      {/* 第7层：底部仪表盘 */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 300, textAlign: 'center', opacity: dashP }}>
        <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 700, color: GREY, marginBottom: 18 }}>它查过资料吗？</div>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, margin: '0 16px',
            border: '2px solid ' + (noChecked ? '#D9D0BE' : '#D9D0BE'), borderRadius: 36, padding: '14px 30px',
            fontFamily: FONT, fontSize: 34, fontWeight: 800, color: GREY }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, border: '2px solid #B5AC9B' }} />查过
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, margin: '0 16px',
            border: '2px solid ' + (noChecked ? RED : '#D9D0BE'), borderRadius: 36, padding: '14px 30px',
            fontFamily: FONT, fontSize: 34, fontWeight: 800, color: noChecked ? INK : GREY }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: noChecked ? RED : 'transparent', border: '2px solid ' + (noChecked ? RED : '#B5AC9B') }} />没查
          </span>
        </div>
      </div>

      {/* 第8层：红章 + 角标 + 小模 */}
      {l >= 206 ? (
        <div style={{ position: 'absolute', left: 540, top: 900, transform: `translate(-50%,-50%) rotate(-9deg) scale(${slamS(l, 206)})`,
          border: '12px solid ' + RED, borderRadius: 16, padding: '6px 38px', color: RED,
          fontFamily: FONT, fontSize: 88, fontWeight: 900, letterSpacing: '.1em', opacity: stampP }}>编的</div>
      ) : null}
      <div style={{ position: 'absolute', left: 54, top: 62, padding: '12px 26px', border: '2px solid #D9D0BE',
        borderRadius: 28, fontFamily: FONT, fontSize: 24, fontWeight: 800, color: GREY, opacity: ez(l - 6, 10) }}>AI 科普 · EP07</div>
      <div style={{ position: 'absolute', right: 54, top: 62, fontFamily: FONT, fontSize: 24, fontWeight: 800,
        color: GREY, opacity: badgeP }}>烧脑预警</div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <Mascot x={900} y={1290} s={0.62} mood={'happy'} f={f} op={ez(l - 226, 12)} />
      </svg>
    </div>
  );
};
"""
MAIN = r"""
const SUBS: [number, number, string][] = [
  [0, 4.0, '问它一句话，它答得比谁都快'],
  [4.0, 8.0, '可它查过资料吗？没有'],
  [8.0, 12.0, '答得比谁都快，查得比谁都少'],
];
const SubF: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBS.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const step = Math.min(0.1, ((seg[1] - seg[0]) / Math.max(1, chars.length)) * 0.82);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / step) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1745, textAlign: 'center', padding: '0 50px' }}>
      {chars.map((ch, i) => (
        <span key={i} style={{ fontFamily: FONT, fontSize: 42, fontWeight: 900, display: 'inline-block',
          color: i === n - 1 ? RED : (i < n ? INK : '#B5AC9B'),
          transform: i === n - 1 ? 'scale(1.1)' : 'scale(1)' }}>{ch}</span>
      ))}
    </div>
  );
};
const SE: [number, string, number][] = [
  [24, 'sfx/whoosh.wav', 0.5],
  [60, 'sfx/da.mp3', 0.55],
  [100, 'sfx/ding.mp3', 0.8],
  [140, 'sfx/whoosh.wav', 0.5],
  [168, 'sfx/da.mp3', 0.5],
  [186, 'sfx/ding.mp3', 0.6],
  [206, 'sfx/boom.wav', 0.9],
  [268, 'sfx/ding.mp3', 0.7],
];
export const EP07F: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const l = frame;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Scene1 f={frame} l={l} />
      {SE.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={1} />
      <SubF t={t} />
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
                 ("stroke={GOLD}", "stroke={GOLD_D}"), ("stroke={RED}", "stroke={RED_D}"), ("stroke={GREY}", "stroke={GREY_D}"),
                 ("color: GREY", "color: GREY_D"), ("background: GOLD", "background: GOLD_D"),
                 ("color: RED", "color: RED_D"), ("border: '2px solid ' + RED", "border: '2px solid ' + RED_D"),
                 ("background: noChecked ? RED", "background: noChecked ? RED_D"),
                 ("(noChecked ? RED : '#D9D0BE')", "(noChecked ? RED_D : '#D9D0BE')")]:
        sc = sc.replace(a, b)
    sc = sc.replace("{{ color: RED }}", "{{ color: RED_D }}")
    sc = sc.replace("{ color: RED }", "{ color: RED_D }")
    sc = sc.replace("{ color: RED_D_D }", "{ color: RED_D }")
    mn = MAIN.replace("color: i === n - 1 ? RED :", "color: i === n - 1 ? RED_D :")
    out = HEAD + head.split("*/", 1)[-1] + "\n" + sc + mn
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    print("EP07F.tsx:", len(out), "字 | Scene:", out.count("const Scene1"))
if __name__ == "__main__":
    main()
