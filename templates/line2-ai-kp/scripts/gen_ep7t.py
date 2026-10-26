# -*- coding: utf-8 -*-
# EP07T 整体效果测试（9秒 / 4镜）—— 2026-10-25
# 只测「大效果」：①黑场金光劈开 ②老贾大脸特写 ③整屏变火星+碎屏 ④书页金光打亮
# 不做细节表演，每镜一个视觉事件，字从嘴里/画面里砸出来
import io, os

ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP07T.tsx")

HEAD = r"""
/* =============================================================
 * EP07T 整体效果测试 · 9秒4镜
 * ①黑场金光劈开+字从嘴里喷 ②老贾大脸特写 ③整屏变火星→碎屏 ④书页金光
 * ============================================================= */
"""

SCENES = r"""
const BG7 = '#0E0C0A';
const INK7 = '#F5EFE2';
const GOLD7 = '#E8B44A';
const RED7 = '#D93327';
const GREY7 = '#6B6257';
const MARS = '#B23A1E';

const Mascot2: React.FC<{ x: number; y: number; s: number; mood: string; f: number; op?: number }> =
  ({ x, y, s, mood, f, op = 1 }) => (
    <g transform={`translate(${x} ${y})`} opacity={op}>
      <circle cx={0} cy={-4 * s} r={132 * s} fill={'#F5EFE2'} opacity={0.95} />
      <circle cx={0} cy={-4 * s} r={132 * s} fill={'none'} stroke={'#6B6257'} strokeWidth={3} opacity={0.5} />
      <XiaoMo x={0} y={0} s={s} mood={mood} f={f} />
    </g>
  );

/* ============ 镜1 · 黑场金光劈开 + 字从嘴里喷（0-2.4s） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const split = eio(clamp01(l / 14));
  const beamW = 30 * (1 - clamp01((l - 14) / 16));
  const words: [string, number, number, number][] = [['我', 26, -180, -120], ['什', 34, 170, -140], ['么', 42, -200, 60], ['都', 50, 190, 90], ['知', 58, -120, 210], ['道', 66, 150, 230]];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* 两半黑幕向两侧滑开 */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 540, height: 1920, background: '#000', transform: `translateX(${-split * 560}px)` }} />
      <div style={{ position: 'absolute', left: 540, top: 0, width: 540, height: 1920, background: '#000', transform: `translateX(${split * 560}px)` }} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <radialGradient id="s1glow" cx="50%" cy="46%" r="55%">
          <stop offset="0%" stopColor="#3A1A0A" />
          <stop offset="100%" stopColor={BG7} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#s1glow)'} opacity={split} />
        {beamW > 0 ? (
          <rect x={540 - beamW / 2} y={0} width={beamW} height={1920} fill={GOLD7} opacity={0.9} />
        ) : null}
        <g transform={`translate(540 960) scale(${0.9 + 0.2 * ez(l - 10, 10)})`} opacity={ez(l - 10, 8)}>
          <Mascot2 x={0} y={0} s={1.5} mood={'cool'} f={f} />
        </g>
        {words.map(([w, d, dx, dy], i) => {
          const p = clamp01((l - d) / 10);
          const e = 1 - Math.pow(1 - p, 3);
          if (p <= 0) return null;
          return (
            <text key={i} x={540 + dx * e} y={960 + dy * e} textAnchor="middle" fontFamily={FONT}
              fontSize={104} fontWeight={900} fill={i % 2 ? GOLD7 : INK7}
              opacity={Math.min(1, p * 2.2)} transform={`translate(0 ${(1 - e) * 40})`}>{w}</text>
          );
        })}
        {l >= 78 ? (
          <rect x={0} y={1290} width={1080} height={140} fill={RED7} opacity={ez(l - 78, 8)} />
        ) : null}
        <text x={540} y={1380} textAnchor="middle" fontFamily={FONT} fontSize={86} fontWeight={900} fill={INK7}
          opacity={ez(l - 78, 8)}>我什么都知道</text>
      </svg>
    </div>
  );
};

/* ============ 镜2 · 老贾大脸特写（2.4-4.6s） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const push = 1 + 0.22 * eio(clamp01(l / 44));
  const [shx, shy] = shake(l, 26, 10);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={'#1A1208'} />
        <radialGradient id="s2glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#4A2A08" />
          <stop offset="100%" stopColor="#1A1208" />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#s2glow)'} />
      </svg>
      {/* 老贾大脸：整体放大 5 倍，只露头和肩 */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920 }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <g transform={`translate(540 1150) scale(${5 * push}) translate(0 -60)`} opacity={ez(l - 4, 8)}>
            <LaoJia x={0} y={0} s={1} mode={'point'} f={f} wag={true} />
          </g>
        </svg>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center',
        fontFamily: FONT, fontSize: 96, fontWeight: 900, color: INK7, opacity: ez(l - 12, 8),
        textShadow: '0 8px 40px rgba(0,0,0,0.9)',
      }}>那我问你</div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1380, textAlign: 'center',
        fontFamily: FONT, fontSize: 84, fontWeight: 900, color: GOLD7,
        opacity: ez(l - 30, 8), transform: `scale(${0.85 + 0.15 * ez(l - 30, 8)})`,
      }}>孙悟空住哪儿？！</div>
    </div>
  );
};

/* ============ 镜3 · 整屏变火星 + 碎屏转场（4.6-7.2s） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const red = eio(clamp01(l / 8));
  const crack = clamp01((l - 30) / 20);
  const [shx, shy] = shake(l, 30, 16);
  const shards: [number, number, number, number][] = [[-1, -1, 0.2, 0.0], [1, -1, 0.35, 0.1], [-1, 1, 0.5, 0.15], [1, 1, 0.65, 0.05], [0, -1, 0.8, 0.2]];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={MARS} opacity={red} />
        <radialGradient id="marsg" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#D9691F" />
          <stop offset="70%" stopColor={MARS} />
          <stop offset="100%" stopColor="#5E1A0C" />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#marsg)'} opacity={red} />
        {/* 环形山 */}
        {[[280, 420, 90], [820, 300, 60], [700, 1250, 120], [220, 1500, 70], [900, 1650, 50]].map(([x, y, r], i) => (
          <g key={i} opacity={red * 0.85}>
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.45} fill="#7E2A12" />
            <ellipse cx={x} cy={y - r * 0.12} rx={r * 0.82} ry={r * 0.34} fill="#952F14" />
          </g>
        ))}
        {/* 火箭插在火星上 */}
        <g transform={`translate(700 980) rotate(-14)`} opacity={red}>
          <path d={'M 0 -170 L 46 -40 L 46 60 L -46 60 L -46 -40 Z'} fill="#E8E2D2" />
          <path d={'M 0 -170 L 46 -40 L 0 -70 L -46 -40 Z'} fill={RED7} />
          <path d={'M -46 20 L -96 90 L -46 60 Z'} fill="#C9A85E" />
          <path d={'M 46 20 L 96 90 L 46 60 Z'} fill="#C9A85E" />
          <circle cx={0} cy={-30} r={20} fill="#3A6EA5" stroke="#E8E2D2" strokeWidth={5} />
          <path d={'M -26 62 L -14 130 L 0 92 L 14 130 L 26 62 Z'} fill="#FFB84D" opacity={0.95} />
          <path d={'M -12 62 L 0 112 L 12 62 Z'} fill="#FFF3C4" />
        </g>
        <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={INK7}
          opacity={ez(l - 10, 8)}>它说：孙悟空住火星</text>
        {/* 碎屏裂纹 */}
        {crack > 0 ? (
          <g opacity={crack}>
            {[
              'M 540 900 L 380 700 L 300 720', 'M 540 900 L 720 690 L 800 730',
              'M 540 900 L 360 1120 L 280 1160', 'M 540 900 L 740 1140 L 820 1100',
              'M 540 900 L 540 640', 'M 540 900 L 500 1220',
            ].map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#0A0908" strokeWidth={7} opacity={0.85}
                strokeDasharray="900" strokeDashoffset={900 * (1 - clamp01((crack - i * 0.08) / 0.6))} />
            ))}
            <circle cx={540} cy={900} r={140 * crack} fill="none" stroke="#0A0908" strokeWidth={8} opacity={0.7} />
          </g>
        ) : null}
        {crack > 0 ? shards.map(([dx, dy, d, rot], i) => {
          const p = clamp01((crack - d) / (1 - d));
          if (p <= 0) return null;
          return (
            <g key={i} transform={`translate(${540 + dx * p * 700} ${900 + dy * p * 700}) rotate(${rot * 360 * p})`}
              opacity={1 - p * 0.5}>
              <path d={'M -90 -70 L 80 -90 L 100 60 L -70 90 Z'} fill={MARS} stroke="#0A0908" strokeWidth={5} />
            </g>
          );
        }) : null}
      </svg>
    </div>
  );
};

/* ============ 镜4 · 碎屏后面：书页金光（7.2-9s） ============ */
const Scene4: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const open = eio(clamp01(l / 18));
  const glow = ez(l - 18, 14);
  const slam = ez(l - 34, 10);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={'#0A0908'} />
        <radialGradient id="bookglow" cx="50%" cy="46%" r="46%">
          <stop offset="0%" stopColor="#FFE9A8" stopOpacity={0.9} />
          <stop offset="55%" stopColor="#8A6A2A" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#0A0908" stopOpacity={0} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#bookglow)'} opacity={glow} />
        {/* 打开的书 */}
        <g transform={`translate(540 940) scale(${1.5 - 0.5 * open})`} opacity={ez(l - 4, 10)}>
          <path d="M -380 10 L -380 300 L 0 340 L 0 40 Z" fill="#F2E7CE" />
          <path d="M 380 10 L 380 300 L 0 340 L 0 40 Z" fill="#F7F0DC" />
          <path d="M -398 18 L -398 316 L -380 300 L -380 10 Z" fill="#8A6A2A" />
          <path d="M 398 18 L 398 316 L 380 300 L 380 10 Z" fill="#8A6A2A" />
          <text x={-200} y={230} textAnchor="middle" fontFamily={FONT} fontSize={92} fontWeight={900} fill="#2A1F12" opacity={glow}>花果山</text>
          <text x={200} y={230} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill="#6B4A12" opacity={glow}>水帘洞</text>
        </g>
        {l >= 34 ? (
          <g opacity={slam}>
            <text x={540} y={1450} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={INK7}
              transform={`translate(540 1450) scale(${1.5 - 0.5 * slam}) translate(-540 -1450)`}>书上是这么写的</text>
            <rect x={150} y={1520} width={780} height={10} fill={GOLD7} opacity={0.8} />
          </g>
        ) : null}
      </svg>
    </div>
  );
};
"""

MAIN = r"""
const SUBS7: [number, number, string][] = [
  [0, 2.4, '我什么都知道'],
  [2.4, 4.6, '那我问你：孙悟空住哪儿'],
  [4.6, 7.2, '它秒答：火星'],
  [7.2, 9.0, '书上是这么写的'],
];

const Sub7: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBS7.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const step = Math.min(0.1, ((seg[1] - seg[0]) / Math.max(1, chars.length)) * 0.8);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / step) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center', padding: '0 60px' }}>
      {chars.map((ch, i) => (
        <span key={i} style={{
          fontFamily: FONT, fontSize: 44, fontWeight: 900, display: 'inline-block',
          color: i === n - 1 ? GOLD7 : (i < n ? INK7 : '#4A433C'),
          transform: i === n - 1 ? 'scale(1.12)' : 'scale(1)',
        }}>{ch}</span>
      ))}
    </div>
  );
};

const SE7: [number, string, number][] = [
  [2, 'sfx/boom.wav', 0.9],
  [26, 'sfx/da.mp3', 0.6],
  [34, 'sfx/da.mp3', 0.6],
  [42, 'sfx/da.mp3', 0.6],
  [50, 'sfx/da.mp3', 0.6],
  [58, 'sfx/da.mp3', 0.6],
  [66, 'sfx/da.mp3', 0.6],
  [72, 'sfx/hit_1750.wav', 0.9],
  [136, 'sfx/whoosh.wav', 0.8],
  [168, 'sfx/ding.mp3', 0.7],
  [216, 'sfx/boom.wav', 0.95],
  [244, 'sfx/whoosh.wav', 0.7],
];

const BOUNDS7: [number, number][] = [[0, 72], [72, 138], [138, 216], [216, 270]];

export const EP07T: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < BOUNDS7.length; i++) {
    if (frame < BOUNDS7[i][1]) { seg = i; break; }
    seg = i;
  }
  const [b0] = BOUNDS7[seg];
  const l = frame - b0;
  const SC = [Scene1, Scene2, Scene3, Scene4];
  const Scene = SC[seg];
  return (
    <AbsoluteFill style={{ backgroundColor: BG7 }}>
      <Scene f={frame} l={l} />
      {SE7.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.4} />
      <Sub7 t={t} />
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
    out = HEAD + head.split("*/", 1)[-1] + "\n" + SCENES + MAIN
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    print("EP07T.tsx:", len(out), "字 | 镜:", out.count("const Scene"))

if __name__ == "__main__":
    main()
