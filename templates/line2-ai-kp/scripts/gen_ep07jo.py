# -*- coding: utf-8 -*-
# EP07JO：片头（5s）+ 片尾（9s，照 EP06）· 米白底 · 老贾 + 小模
import io, os
ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP07JO.tsx")
HEAD = r"""
/* EP07JO 片头/片尾 · 米白 · 老贾小模都在 */
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

/* 片头 5s */
const Intro: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const chars = ['A', 'I', '为', '什', '么', '会', '瞎', '编'];
  const DX = [-1, 1, -1, 0, 1, -1, 0, 1];
  const DY = [-1, -1, 1, -1, -1, 1, 1, 1];
  const [sx, sy] = shake(l, 92, 14);
  const boxP = ez(l - 100, 12);
  const hiP = ez(l - 100, 10);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG} />
        <radialGradient id="vgi" cx="50%" cy="44%" r="74%">
          <stop offset="55%" stopColor="#F6F1E6" stopOpacity={0} />
          <stop offset="100%" stopColor="#BDB097" stopOpacity={0.4} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#vgi)'} />
        {Array.from({ length: 13 }, (_, i) => (
          <line key={i} x1={i * 84} y1={0} x2={i * 84} y2={1920} stroke="#C9BFA8" strokeWidth={1} opacity={0.16} />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 30, right: 30, top: 700, textAlign: 'center', whiteSpace: 'nowrap' }}>
        {chars.map((c, i) => {
          const d = 6 + i * 6;
          const p = eio(clamp01((l - d) / 14));
          const tx = (1 - p) * DX[i] * 620;
          const ty = (1 - p) * DY[i] * 620;
          const sc = 2.3 - 1.3 * p;
          const isBad = c === '瞎' || c === '编';
          return (
            <span key={i} style={{
              display: 'inline-block', fontFamily: FONT, fontSize: 104, fontWeight: 900,
              color: isBad && hiP > 0 ? RED : (c === 'A' || c === 'I' ? GOLD : INK),
              opacity: p,
              transform: `translate(${tx}px, ${ty}px) scale(${sc * (isBad && hiP > 0 ? 1 + 0.2 * hiP : 1)})`,
              transformOrigin: '50% 50%',
            }}>{c}</span>
          );
        })}
      </div>
      {l >= 100 ? (
        <div style={{ position: 'absolute', left: 60, right: 60, top: 665, height: 205,
          border: '8px solid #D93327', borderRadius: 18, opacity: boxP,
          transform: `scaleX(${boxP}) rotate(-1.2deg)` }} />
      ) : null}
      <Mascot x={300} y={1180} s={1.15} mood={'cool'} f={f} op={ez(l - 92, 12)} />
      <g transform={'translate(790 1150)'} opacity={ez(l - 100, 12)}>
        <LaoJia x={0} y={0} s={1.0} mode={'point'} f={f} wag={l > 130} />
      </g>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1460, textAlign: 'center',
        fontFamily: FONT, fontSize: 46, fontWeight: 800, color: GREY, opacity: ez(l - 140, 12) }}>老贾 · AI 科普</div>
    </div>
  );
};

/* 片尾 9s（照 EP06：先查再答 + 四按钮 + 下集预告） */
const Outro: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const cta: [number, string, string][] = [[70, '点赞', 'heart'], [90, '关注', 'plus'], [110, '转发', 'share'], [130, '收藏', 'star']];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG} />
        <radialGradient id="vgo" cx="50%" cy="40%" r="66%">
          <stop offset="55%" stopColor="#F6F1E6" stopOpacity={0} />
          <stop offset="100%" stopColor="#BDB097" stopOpacity={0.36} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#vgo)'} />
        <text x={540} y={480} textAnchor="middle" fontFamily={FONT} fontSize={120} fontWeight={900} fill={GOLD}
          opacity={ez(l - 6, 10)} transform={`translate(540 480) scale(${slamS(l, 6)}) translate(-540 -480)`}>先查，再答</text>
        <text x={540} y={600} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={INK}
          opacity={ez(l - 30, 12)}>这就是对付瞎编的办法</text>
        <Mascot x={300} y={900} s={0.95} mood={'happy'} f={f} op={ez(l - 40, 12)} />
        <g transform={'translate(790 880)'} opacity={ez(l - 46, 12)}>
          <LaoJia x={0} y={0} s={0.9} mode={'win'} f={f} wag={true} />
        </g>
        {cta.map(([d, label, icon], i) => {
          const p = clamp01((l - d) / 12);
          if (p <= 0) return null;
          const s = 0.4 + 0.6 * (1 - Math.pow(1 - p, 3));
          const beat = label === '点赞' ? 1 + 0.1 * Math.max(0, Math.sin((l - d) / 4)) : 1;
          const cx = 165 + i * 250;
          return (
            <g key={i} transform={`translate(${cx} 1180) scale(${s * beat})`} opacity={Math.min(1, p * 3)}>
              <circle cx={0} cy={0} r={74} fill={i === 1 ? RED : (i === 3 ? GOLD : CARD)} stroke={LINE2} strokeWidth={2} />
              {icon === 'heart' ? <path d={'M 0 -12 C -16 -32, -40 -12, 0 20 C 40 -12, 16 -32, 0 -12 Z'} fill={RED} /> :
               icon === 'plus' ? <g><rect x={-7} y={-30} width={14} height={60} rx={7} fill={'#FFFFFF'} /><rect x={-30} y={-7} width={60} height={14} rx={7} fill={'#FFFFFF'} /></g> :
               icon === 'share' ? <path d={'M -26 6 L 10 -24 L 6 0 L 28 4 L -8 34 L -4 8 Z'} fill={INK} /> :
               <path d={'M 0 -32 L 9 -10 L 32 -10 L 14 5 L 21 29 L 0 15 L -21 29 L -14 5 L -32 -10 L -9 -10 Z'} fill={INK} />}
              <text x={0} y={122} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={INK}>{label}</text>
            </g>
          );
        })}
        <text x={540} y={1500} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={GREY}
          opacity={ez(l - 150, 12)}>下一集</text>
        <text x={540} y={1580} textAnchor="middle" fontFamily={FONT} fontSize={58} fontWeight={900} fill={INK}
          opacity={ez(l - 165, 12)}>AI 会不会<tspan fill={RED}>抢走你的工作</tspan>？</text>
      </svg>
    </div>
  );
};



/* IP 镜头 3s：老贾 + 小模 */
export const EP07IP: React.FC = () => {
  const f = useCurrentFrame();
  const l = f;
  const ljX = 150 + (1 - eio(clamp01((l - 6) / 16))) * -400;
  const mcP = ez(l - 14, 12);
  const tP = ez(l - 34, 12);
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG} />
      </svg>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${ljX} 1180)`}>
          <LaoJia x={0} y={0} s={1.15} mode={'point'} f={f} wag={l > 30} />
        </g>
        <Mascot x={790} y={1140} s={1.15} mood={'shock'} f={f} op={mcP} />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center',
        fontFamily: FONT, fontSize: 62, fontWeight: 900, color: INK, opacity: tP,
        transform: `scale(${0.9 + 0.1 * tP})` }}>今天就讲这个</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center',
        fontFamily: FONT, fontSize: 78, fontWeight: 900, color: RED, opacity: ez(l - 44, 12) }}>AI 为什么瞎编</div>
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.85} />
    </AbsoluteFill>
  );
};

export const EP07Intro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Intro f={f} l={f} />
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.85} />
    </AbsoluteFill>
  );
};

export const EP07Outro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Outro f={f} l={f} />
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.85} />
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
    names = ["CARD", "GREEN", "GOLD", "RED", "GREY", "LINE2"]
    for n in names:
        sc = sc.replace(n + "_D", "_Z_" + n + "_Z_")
    import re as _re
    for n in names:
        sc = _re.sub(r"\b" + n + r"\b", n + "_D", sc)
    for n in names:
        sc = sc.replace("_Z_" + n + "_Z_", n + "_D")
    out = HEAD + head.split("*/", 1)[-1] + "\n" + sc
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    print("EP07JO.tsx:", len(out))
if __name__ == "__main__":
    main()
