# -*- coding: utf-8 -*-
# EP07P《它背后什么都没有》15秒样片 —— 2026-10-25
# 设计的核心：用「AI 生图」演「AI 幻觉」——
#   AI 画的孙悟空海报 = 看着像真的、其实是编的；代码画的小模 = 简陋但真
# 4 镜：① 国潮图推进+光扫 → ② 拉远：原来是张钉在破墙上的海报
#      → ③ 真假对比（海报嘴动吹牛 vs 小模说真话）→ ④ 撕开海报：背后一片黑
import io, os

ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP07P.tsx")

HEAD = r"""
/* =============================================================
 * EP07P《它背后什么都没有》· 15秒样片 · 2026-10-25
 * 用 AI 生图（Qwen-Image 画的真假猴王海报）演 AI 幻觉
 * 4 镜：推进光扫 → 拉远露破墙 → 真假对比 → 撕开露空
 * ============================================================= */
"""

SCENES = r"""
const BG7 = '#0E0C0A';
const INK7 = '#F5EFE2';
const GOLD7 = '#E8B44A';
const RED7 = '#D93327';
const GREY7 = '#6B6257';

/* 小模（聚光灯底，深底上完整可见） */
const Mascot: React.FC<{ x: number; y: number; s: number; mood: string; f: number; op?: number }> =
  ({ x, y, s, mood, f, op = 1 }) => (
    <g transform={`translate(${x} ${y})`} opacity={op}>
      <circle cx={0} cy={-4 * s} r={132 * s} fill={'#F5EFE2'} opacity={0.95} />
      <circle cx={0} cy={-4 * s} r={132 * s} fill={'none'} stroke={'#6B6257'} strokeWidth={3} opacity={0.5} />
      <XiaoMo x={0} y={0} s={s} mood={mood} f={f} />
    </g>
  );

/* ============ 镜1 · 国潮图推进 + 光扫（0-4.5s） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const inP = eio(clamp01((l - 2) / 18));
  const ty = (1 - inP) * 260;
  const sc = 0.92 + 0.08 * inP;
  const sweep = clamp01((l - 34) / 34);
  const pressP = ez(l - 8, 12);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG7} />
        <radialGradient id="redGlow" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#3A0E0A" />
          <stop offset="100%" stopColor={BG7} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#redGlow)'} />
      </svg>
      <div style={{
        position: 'absolute', left: (1080 - 1024 * sc) / 2, top: 300 + ty,
        width: 1024 * sc, height: 1024 * sc, overflow: 'hidden',
        boxShadow: '0 30px 90px rgba(0,0,0,0.75)',
      }}>
        <Img src={staticFile('ep7_wukong.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', top: 0, left: -420 + sweep * 1900, width: 300, height: '100%',
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,242,205,0.6) 50%, rgba(255,255,255,0) 100%)',
          transform: 'skewX(-16deg)', opacity: sweep > 0 ? 0.9 : 0,
        }} />
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1400, textAlign: 'center',
        fontFamily: FONT, fontSize: 76, fontWeight: 900, color: INK7,
        opacity: pressP, transform: `translateY(${(1 - pressP) * 80}px) scale(${0.9 + 0.1 * pressP})`,
        textShadow: '0 6px 30px rgba(0,0,0,0.9)',
      }}>这就是它给你的答案</div>
    </div>
  );
};

/* ============ 镜2 · 拉远：原来是张钉在破墙上的海报（4.5-8.5s） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const back = eio(clamp01((l - 6) / 34));
  const s = 1 - 0.44 * back;
  const py = 380 + 180 * back;
  const pinP = ez(l - 40, 14);
  const LAUGH = '它连自己是谁都说错了';
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill="#171412" />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M ${120 + i * 130} ${140 + i * 90} q ${30 + i * 6} ${70} ${-10 + i * 4} ${150}`}
            fill="none" stroke="#2A2521" strokeWidth={3} opacity={0.8} />
        ))}
        <rect x={0} y={1560} width={1080} height={360} fill="#100E0C" />
      </svg>
      <div style={{
        position: 'absolute', left: (1080 - 1024 * s) / 2, top: py,
        width: 1024 * s, height: 1024 * s, overflow: 'hidden',
        boxShadow: '0 24px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(232,180,74,0.25)',
        transform: `rotate(${back * -1.5}deg)`,
      }}>
        <Img src={staticFile('ep7_wukong.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${1 - back * 0.22})` }} />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{
          position: 'absolute',
          left: (1080 - 1024 * s) / 2 + (i % 2 === 0 ? 34 : 1024 * s - 44),
          top: py + (i < 2 ? 30 : 1024 * s - 34),
          width: 20, height: 20, borderRadius: 10, background: GOLD7, opacity: pinP,
          boxShadow: '0 2px 6px rgba(0,0,0,0.8)',
        }} />
      ))}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1460, textAlign: 'center',
        fontFamily: FONT, fontSize: 64, fontWeight: 900, color: INK7, opacity: ez(l - 34, 14),
      }}>拉远一看：<tspan fill={RED7}>一张海报</tspan></div>
    </div>
  );
};

/* ============ 镜3 · 真假对比：海报吹牛 vs 小模说真话（8.5-12s） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const inP = eio(clamp01(l / 14));
  const posterS = 0.46 * inP;
  const shake2 = l > 40 ? Math.sin(l * 0.9) * 3 : 0;
  const joke = ez(l - 44, 10);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill="#171412" />
        <line x1={540} y1={420} x2={540} y2={1560} stroke={GOLD7} strokeWidth={3} opacity={0.35} />
      </svg>
      {/* 左：海报（AI 编的） */}
      <div style={{
        position: 'absolute', left: 40, top: 560 + shake2, width: 480, height: 480,
        overflow: 'hidden', opacity: inP, transform: `scale(${0.9 + 0.1 * inP})`,
        boxShadow: '0 18px 50px rgba(0,0,0,0.85), 0 0 0 1px rgba(232,180,74,0.3)',
      }}>
        <Img src={staticFile('ep7_wukong.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {l > 44 ? <div style={{ position: 'absolute', inset: 0, background: RED7, opacity: 0.14 * joke }} /> : null}
      </div>
      <div style={{
        position: 'absolute', left: 40, top: 1060, width: 480, textAlign: 'center',
        fontFamily: FONT, fontSize: 34, fontWeight: 900, color: GOLD7, opacity: inP,
      }}>它编的</div>
      <div style={{
        position: 'absolute', left: 40, top: 1120, width: 480,
        fontFamily: FONT, fontSize: 30, fontWeight: 800, color: INK7, opacity: joke,
        lineHeight: 1.5,
      }}>“我是齐天大圣！<br/>我会七十二变！”</div>
      {/* 右：小模（真的） */}
      <div style={{ position: 'absolute', left: 620, top: 640, opacity: inP }}>
        <svg width={400} height={480} viewBox="0 0 400 480" style={{ overflow: 'visible' }}>
          <Mascot x={200} y={260} s={1.1} mood={'happy'} f={f} />
        </svg>
      </div>
      <div style={{
        position: 'absolute', left: 620, top: 1060, width: 400, textAlign: 'center',
        fontFamily: FONT, fontSize: 34, fontWeight: 900, color: INK7, opacity: inP,
      }}>真的</div>
      <div style={{
        position: 'absolute', left: 620, top: 1120, width: 400,
        fontFamily: FONT, fontSize: 30, fontWeight: 800, color: GREY7, opacity: joke,
      }}>“我是小模。<br/>我没吃过饭。”</div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center',
        fontFamily: FONT, fontSize: 78, fontWeight: 900, color: INK7, opacity: ez(l - 20, 12),
        transform: `scale(${0.92 + 0.08 * ez(l - 20, 12)})`,
      }}>一个真的<tspan fill={RED7}>，一个编的</tspan></div>
    </div>
  );
};

/* ============ 镜4 · 撕开海报：背后一片黑（12-15s） ============ */
const Scene4: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const tear = eio(clamp01((l - 10) / 22));
  const gap = 150 * tear;
  const dark = clamp01((l - 12) / 26);
  const [shx, shy] = shake(l, 34, 9);
  const slam7 = ez(l - 34, 10);
  const papers: [number, number, number, number][] = [[-1, 0.3, 12, 26], [1, 0.42, 18, 30], [-1, 0.55, 8, 22], [1, 0.66, 22, 18]];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill="#0A0908" />
        <radialGradient id="void" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="70%" stopColor="#070606" />
          <stop offset="100%" stopColor="#0A0908" />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#void)'} opacity={dark} />
      </svg>
      {/* 海报左半 */}
      <div style={{
        position: 'absolute', left: (1080 - 1024 * 0.82) / 2 - gap, top: 420,
        width: 1024 * 0.82, height: 1024 * 0.82, overflow: 'hidden',
        clipPath: 'polygon(0 0, 52% 0, 47% 100%, 0 100%)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
      }}>
        <Img src={staticFile('ep7_wukong.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {/* 海报右半 */}
      <div style={{
        position: 'absolute', left: (1080 - 1024 * 0.82) / 2 + gap, top: 420,
        width: 1024 * 0.82, height: 1024 * 0.82, overflow: 'hidden',
        clipPath: 'polygon(52% 0, 100% 0, 100% 100%, 47% 100%)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
      }}>
        <Img src={staticFile('ep7_wukong.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {/* 纸片飞散 */}
      {papers.map(([dir, tt, w, sz], i) => {
        const p = clamp01((tear - tt) / (1 - tt));
        if (p <= 0) return null;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: 540 + dir * (120 + p * 320),
            top: 700 - p * 220 + p * p * 420,
            width: sz * 2, height: sz * 1.4,
            background: '#C9A85E', opacity: 1 - p * 0.7,
            transform: `rotate(${dir * p * 240}deg)`, clipPath: 'polygon(0 0, 100% 12%, 88% 100%, 6% 84%)',
          }} />
        );
      })}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1250, textAlign: 'center',
        fontFamily: FONT, fontSize: 92, fontWeight: 900, color: RED7,
        opacity: slam7, transform: `translate(540 1290) scale(${1.55 - 0.55 * slam7}) translate(-540 -1290)`,
        textShadow: '0 0 40px rgba(217,51,39,0.55)',
      }}>它背后，什么都没有</div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1400, textAlign: 'center',
        fontFamily: FONT, fontSize: 56, fontWeight: 900, color: GOLD7, opacity: ez(l - 54, 12),
      }}>像 ≠ 对</div>
    </div>
  );
};
"""

MAIN = r"""
const SUBS7: [number, number, string][] = [
  [0, 2.6, '这就是它给你的答案'],
  [2.6, 4.5, '看着比真的还真'],
  [4.5, 6.6, '拉远一看'],
  [6.6, 8.5, '一张钉在墙上的海报'],
  [8.5, 10.4, '一个真的，一个编的'],
  [10.4, 12.0, '一问就露馅'],
  [12.0, 13.4, '它背后'],
  [13.4, 15.0, '什么都没有'],
];

const Sub7: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBS7.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const step = Math.min(0.1, ((seg[1] - seg[0]) / Math.max(1, chars.length)) * 0.8);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / step) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1620, textAlign: 'center', padding: '0 60px' }}>
      {chars.map((ch, i) => (
        <span key={i} style={{
          fontFamily: FONT, fontSize: 46, fontWeight: 900, display: 'inline-block',
          color: i === n - 1 ? GOLD7 : (i < n ? INK7 : '#4A433C'),
          transform: i === n - 1 ? 'scale(1.12)' : 'scale(1)',
        }}>{ch}</span>
      ))}
    </div>
  );
};

const SE7: [number, string, number][] = [
  [4, 'sfx/boom.wav', 0.8],
  [40, 'sfx/whoosh.wav', 0.7],
  [140, 'sfx/whoosh.wav', 0.6],
  [160, 'sfx/da.mp3', 0.7],
  [262, 'sfx/da.mp3', 0.9],
  [300, 'sfx/dong.mp3', 0.8],
  [368, 'sfx/da.mp3', 0.85],
  [376, 'sfx/boom.wav', 0.75],
  [410, 'sfx/ding.mp3', 0.7],
];

const BOUNDS7: [number, number][] = [[0, 135], [135, 255], [255, 360], [360, 450]];

export const EP07P: React.FC = () => {
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
  const cutFlash = frame - b0 < 3 ? (1 - (frame - b0) / 3) * 0.16 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG7 }}>
      <Scene f={frame} l={l} />
      {SE7.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.45} />
      <Sub7 t={t} />
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
                        "import { AbsoluteFill, useCurrentFrame, staticFile, Audio, Sequence, Img } from 'remotion';")
    out = HEAD + head.split("*/", 1)[-1] + "\n" + SCENES + MAIN
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    print("EP07P.tsx:", len(out), "字 | 镜:", out.count("const Scene"), "| Img:", out.count("<Img"))

if __name__ == "__main__":
    main()
