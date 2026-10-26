# -*- coding: utf-8 -*-
# EP07C《它连自己都骗》15秒 3幕 · 镜头全程运动 —— 2026-10-25
# 幕1：远景猛推到手机屏 → 问答题 → 再推到气泡
# 幕2：3D 翻转手机 → 背面是空的
# 幕3：猛拉远露出全貌 → 老贾抢手机 → 金句
import io, os

ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP07C.tsx")

HEAD = r"""
/* =============================================================
 * EP07C《它连自己都骗》· 15秒 3幕
 * 镜头全程运动：推近 → 3D 翻转 → 猛拉远
 * ============================================================= */
"""

SCENES = r"""
const BG = '#F6F1E6';
const INK = '#201C17';
const GOLD = '#B8801F';
const RED = '#D93327';
const GREY = '#8A8175';
const CARD = '#FFFDF7';
const LINE2 = '#D9D0BE';

const camAt = (l: number, keys: number[][]): number[] => {
  if (l <= keys[0][0]) return keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (l <= b[0]) {
      const u = eio((l - a[0]) / Math.max(1, b[0] - a[0]));
      return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u, a[4] + (b[4] - a[4]) * u, a[5] + (b[5] - a[5]) * u];
    }
  }
  return keys[keys.length - 1].slice(1);
};

const Cam: React.FC<{ l: number; keys: number[][]; children: React.ReactNode }> = ({ l, keys, children }) => {
  const [s, tx, ty, rot, sq] = camAt(l, keys);
  return (
    <div style={{
      position: 'absolute', inset: 0,
      transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${s}) scaleY(${sq})`,
      transformOrigin: '50% 50%',
    }}>{children}</div>
  );
};

const Mascot: React.FC<{ x: number; y: number; s: number; mood: string; f: number; op?: number }> =
  ({ x, y, s, mood, f, op = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <circle cx={0} cy={-4} r={130} fill={'#FFFFFF'} opacity={0.9} />
      <circle cx={0} cy={-4} r={130} fill={'none'} stroke={LINE2} strokeWidth={4} />
      <XiaoMo x={0} y={0} s={1} mood={mood} f={f} />
    </g>
  );

/* 手机 */
const Phone: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
    <rect x={250} y={520} width={580} height={1000} rx={54} fill={CARD} stroke={INK} strokeWidth={5} />
    <rect x={470} y={556} width={140} height={16} rx={8} fill={LINE2} />
    <rect x={286} y={600} width={508} height={840} rx={22} fill="#FBF8F1" stroke={LINE2} strokeWidth={3} />
    <circle cx={540} cy={1480} r={10} fill="none" stroke={LINE2} strokeWidth={3} />
  </svg>
);

/* ============ 幕0 · 主题句花式登场（0-4s） ============ */
const Scene0: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const chars = ['A', 'I', '为', '什', '么', '会', '瞎', '编'];
  const DX = [-1, 1, -1, 0, 1, -1, 0, 1];
  const DY = [-1, -1, 1, -1, -1, 1, 1, 1];
  const [sx, sy] = shake(l, 92, 16);
  const boxP = ez(l - 104, 12);
  const hiP = ez(l - 104, 10);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG} />
      </svg>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 700, textAlign: 'center', whiteSpace: 'nowrap' }}>
        {chars.map((c, i) => {
          const d = 8 + i * 7;
          const p = eio(clamp01((l - d) / 16));
          const tx = (1 - p) * DX[i] * 620;
          const ty = (1 - p) * DY[i] * 620;
          const sc = 2.3 - 1.3 * p;
          const isBad = c === '瞎' || c === '编';
          return (
            <span key={i} style={{
              display: 'inline-block', fontFamily: FONT, fontSize: 104, fontWeight: 900,
              color: isBad && hiP > 0 ? RED_D : (c === 'A' || c === 'I' ? GOLD_D : INK),
              opacity: p,
              transform: `translate(${tx}px, ${ty}px) scale(${sc * (isBad && hiP > 0 ? 1 + 0.22 * hiP : 1)})`,
              transformOrigin: '50% 50%',
              textShadow: '0 10px 34px rgba(0,0,0,0.10)',
            }}>{c}</span>
          );
        })}
      </div>
      {/* 红框从中间画开 */}
      {l >= 104 ? (
        <div style={{
          position: 'absolute', left: 84, right: 84, top: 660, height: 210,
          border: '8px solid #D93327', borderRadius: 18,
          transform: `scaleX(${boxP}) rotate(-1.2deg)`, transformOrigin: '50% 50%', opacity: boxP,
        }} />
      ) : null}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 1030, textAlign: 'center',
        fontFamily: FONT, fontSize: 46, fontWeight: 800, color: GREY_D, opacity: ez(l - 110, 12),
      }}>它不是在查，它是在蒙</div>
    </div>
  );
};

/* ============ 幕1 · 推近 + 问答（0-6s） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const q = ez(l - 34, 10);
  const a = ez(l - 84, 12);
  const push2 = clamp01((l - 110) / 40);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Cam l={l} keys={[[0, 1.9, 0, -180, 0, 1], [46, 1.12, 0, -20, 0, 1], [60, 1.0, 0, 0, 0, 1], [110, 1.02, 0, 0, 0, 1], [150, 1.5, 0, -160, 0, 1], [176, 1.62, 0, -200, 0, 1]]}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <rect width={1080} height={1920} fill={BG} />
        </svg>
        <Phone f={f} l={l} />
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <g opacity={q}>
            <rect x={300} y={700} width={470} height={130} rx={26} fill="#EDE6D8" />
            <text x={535} y={786} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={INK}>孙悟空住哪儿？</text>
          </g>
          {l >= 84 ? (
            <g opacity={ez(l - 84, 10)} transform={`translate(0 ${(1 - ez(l - 84, 10)) * 40})`}>
              <rect x={290} y={880} width={370} height={150} rx={26} fill={GOLD} />
              <text x={475} y={978} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill="#FFFFFF">花果山</text>
            </g>
          ) : null}
          {l >= 84 ? (
            <circle cx={475} cy={955} r={200 + 240 * clamp01((l - 120) / 40)} fill="none" stroke={GOLD} strokeWidth={6} opacity={(1 - clamp01((l - 120) / 40)) * 0.5} />
          ) : null}
        </svg>
      </Cam>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center',
        fontFamily: FONT, fontSize: 56, fontWeight: 900, color: INK, opacity: ez(l - 4, 10),
      }}>问它啥，它都敢答</div>
    </div>
  );
};

/* ============ 幕2 · 3D 翻转：背面是空的（6-11s） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const flip = eio(clamp01((l - 8) / 42));
  const ang = 180 * flip;
  const back = ang > 90;
  return (
    <div style={{ position: 'absolute', inset: 0, perspective: 1600 }}>
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${ang}deg)` }}>
        {!back ? (
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
            <rect width={1080} height={1920} fill={BG} />
            <Phone f={f} l={l} />
            <rect x={290} y={880} width={370} height={150} rx={26} fill={GOLD} />
            <text x={475} y={978} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill="#FFFFFF">花果山</text>
          </svg>
        ) : (
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
            <rect width={1080} height={1920} fill={BG} />
            <rect x={250} y={520} width={580} height={1000} rx={54} fill="#EDE6D8" stroke={INK} strokeWidth={5} />
            <rect x={300} y={600} width={480} height={840} rx={22} fill="#F6F1E6" stroke={LINE2} strokeWidth={3} strokeDasharray="14 12" />
            <text x={540} y={940} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={GREY} opacity={0.85}>空</text>
            <text x={540} y={1030} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={GREY}>一个字都没查</text>
            <path d={'M 330 700 L 750 1300'} stroke={RED} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
            <path d={'M 750 700 L 330 1300'} stroke={RED} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
          </svg>
        )}
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center',
        fontFamily: FONT, fontSize: 56, fontWeight: 900, color: RED, opacity: ez(l - 40, 12),
      }}>翻到背面一看</div>
    </div>
  );
};

/* ============ 幕3 · 猛拉远露全貌 + 老贾（11-15s） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const ljIn = eio(clamp01((l - 24) / 26));
  const ljX = 1100 - ljIn * 520;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Cam l={l} keys={[[0, 1.55, 0, -120, 0, 1], [34, 0.72, 0, 60, 0, 1], [60, 0.68, 0, 70, 0, 1]]}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <rect width={1080} height={1920} fill={BG} />
          <Phone f={f} l={l} />
          <Mascot x={760} y={980} s={1.0} mood={'happy'} f={f} op={ez(l - 4, 10)} />
          <g transform={`translate(${ljX} 1000)`} opacity={Math.min(1, ljIn * 2)}>
            <LaoJia x={0} y={0} s={0.95} mode={'point'} f={f} wag={l > 40} />
          </g>
          <text x={380} y={760} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900} fill={RED}
            opacity={ez(l - 50, 10)}>它在蒙</text>
        </svg>
      </Cam>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center',
        fontFamily: FONT, fontSize: 54, fontWeight: 900, color: INK, opacity: ez(l - 52, 12),
      }}>它连自己都骗</div>
    </div>
  );
};
"""

MAIN = r"""
const SUBS: [number, number, string][] = [
  [0, 4.4, 'AI 为什么会瞎编？'],
  [4.4, 10.4, '问它啥它都敢答，答得比你对象还快'],
  [10.4, 15.4, '可翻到背面一看，一个字都没查'],
  [15.4, 19.4, '它不是撒谎，它是真不知道自己蒙了'],
];

const SubC: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBS.find((s) => t >= s[0] && t < s[1]);
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

const SE: [number, string, number][] = [
  [12, 'sfx/da.mp3', 0.4],
  [26, 'sfx/da.mp3', 0.4],
  [40, 'sfx/da.mp3', 0.4],
  [54, 'sfx/da.mp3', 0.4],
  [66, 'sfx/da.mp3', 0.4],
  [80, 'sfx/da.mp3', 0.4],
  [92, 'sfx/boom.wav', 0.8],
  [104, 'sfx/whoosh.wav', 0.6],
  [200, 'sfx/whoosh.wav', 0.7],
  [235, 'sfx/ding.mp3', 0.75],
  [326, 'sfx/whoosh.wav', 0.8],
  [458, 'sfx/da.mp3', 0.8],
  [492, 'sfx/ding.mp3', 0.7],
];

const BOUNDS: [number, number][] = [[0, 132], [132, 312], [312, 462], [462, 582]];

export const EP07C: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < BOUNDS.length; i++) {
    if (frame < BOUNDS[i][1]) { seg = i; break; }
    seg = i;
  }
  const [b0] = BOUNDS[seg];
  const l = frame - b0;
  const SC = [Scene0, Scene1, Scene2, Scene3];
  const Scene = SC[seg];
  const cutFlash = frame - b0 < 3 ? (1 - (frame - b0) / 3) * 0.14 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <Scene f={frame} l={l} />
      {SE.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={1} />
      <SubC t={t} />
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
                 ("stroke={GOLD}", "stroke={GOLD_D}"), ("stroke={RED}", "stroke={RED_D}"), ("stroke={GREY}", "stroke={GREY_D}"),
                 ("color: RED", "color: RED_D"), ("color: INK", "color: INK")]:
        sc = sc.replace(a, b)
    mn = MAIN.replace("color: i === n - 1 ? RED :", "color: i === n - 1 ? RED_D :").replace("? INK : '#B5AC9B'", "? INK : '#B5AC9B'")
    out = HEAD + head.split("*/", 1)[-1] + "\n" + sc + mn
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    print("EP07C.tsx:", len(out), "字 | 镜:", out.count("const Scene"))

if __name__ == "__main__":
    main()
