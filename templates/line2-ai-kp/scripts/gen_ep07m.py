# -*- coding: utf-8 -*-
# EP07M「AI 为什么会瞎编」机制段 20秒 5镜 竖版 —— 2026-10-25
# 小白话机制：接龙 → 见过的接得准 → 没见过的照样硬接 → 它自己不知道 → 只有「像不像」没有「对不对」
# 风格：EP06（深蓝 #0D1B2A / 金 / 白 / 红）
import io, os

ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP07M.tsx")

HEAD = r"""
/* =============================================================
 * EP07M「AI 为什么会瞎编」机制段 · 20秒 5镜
 * ①接龙倒下去 ②见过的接得准 ③没见过的卡一下照样硬接（变红歪掉）
 * ④它自己不知道（问号飘过它眼前，它不眨）⑤两根弦：像绷紧、对断了
 * ============================================================= */
"""

SCENES = r"""
const BGM7 = '#0D1B2A';
const INK7 = '#EEF3F6';
const GOLD7 = '#F2A93B';
const RED7 = '#FF3B30';
const GREEN7 = '#3FBF6A';
const GREY7 = '#8FA3B3';
const PANEL = '#16293D';

const Mascot7: React.FC<{ x: number; y: number; s: number; mood: string; f: number; op?: number }> =
  ({ x, y, s, mood, f, op = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
      <circle cx={0} cy={-4} r={132} fill={'#EEF3F6'} opacity={0.95} />
      <circle cx={0} cy={-4} r={132} fill={'none'} stroke={'#3A4A5E'} strokeWidth={3} opacity={0.5} />
      <XiaoMo x={0} y={0} s={1} mood={mood} f={f} />
    </g>
  );

/* ============ 镜1 · 接龙：字块一块推一块倒（0-4s） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const blocks = ['从前', '有一只', '住在', '每天', '都在'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGM7} />
        <radialGradient id="m1g" cx="50%" cy="40%" r="64%">
          <stop offset="0%" stopColor="#1B3048" /><stop offset="100%" stopColor={BGM7} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#m1g)'} />
        <text x={540} y={230} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900} fill={GREY7}
          opacity={ez(l - 2, 8)}>它不是在查资料</text>
        <text x={540} y={320} textAnchor="middle" fontFamily={FONT} fontSize={76} fontWeight={900} fill={GOLD7}
          opacity={ez(l - 10, 10)}>它是在「接龙」</text>
        {blocks.map((s, i) => {
          const p = clamp01((l - (18 + i * 16)) / 12);
          const e = 1 - Math.pow(1 - p, 3);
          if (p <= 0) return null;
          const x = 150 + i * 190;
          const y = 760 + i * 90;
          const tilt = (1 - e) * 26;
          return (
            <g key={i} transform={`translate(${x} ${y - (1 - e) * 120}) rotate(${tilt})`} opacity={Math.min(1, p * 2.4)}>
              <rect x={-88} y={-52} width={176} height={104} rx={16} fill={PANEL} stroke={i % 2 ? GOLD7 : GREY7} strokeWidth={4} />
              <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={INK7}>{s}</text>
            </g>
          );
        })}
        {l >= 100 ? (
          <g opacity={ez(l - 100, 10)}>
            <text x={540} y={1400} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={INK7}>
              一个字一个字，往下猜
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
};

/* ============ 镜2 · 见过的：接得准（4-8s） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const q = ez(l - 4, 10);
  const ans = clamp01((l - 34) / 14);
  const ae = eio(ans);
  const ok = ez(l - 62, 10);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGM7} />
        <text x={540} y={480} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={GREY7} opacity={q}>你问它</text>
        <g opacity={q}>
          <rect x={140} y={540} width={800} height={130} rx={22} fill={PANEL} stroke={GREY7} strokeWidth={4} />
          <text x={540} y={622} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900} fill={INK7}>孙悟空住哪儿？</text>
        </g>
        <text x={540} y={790} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY7} opacity={ez(l - 26, 10)}>它接 ↓</text>
        {l >= 34 ? (
          <g transform={`translate(540 ${1000 + (1 - ae) * 180})`} opacity={Math.min(1, ans * 2.5)}>
            <rect x={-300} y={-80} width={600} height={160} rx={24} fill={PANEL} stroke={ok > 0 ? GREEN7 : GOLD7} strokeWidth={6} />
            <text x={0} y={26} textAnchor="middle" fontFamily={FONT} fontSize={76} fontWeight={900} fill={ok > 0 ? GREEN7 : INK7}>花果山</text>
            {ok > 0 ? (
              <g opacity={ok} transform={'translate(330 -66) scale(1)'}>
                <circle cx={0} cy={0} r={42} fill={GREEN7} />
                <path d={'M -18 2 L -4 18 L 20 -14'} fill="none" stroke="#0A1420" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            ) : null}
          </g>
        ) : null}
        <text x={540} y={1300} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GREEN7} opacity={ez(l - 76, 12)}>
          它见过一万遍，接得准
        </text>
        <Mascot7 x={880} y={1560} s={0.72} mood={'happy'} f={f} op={ez(l - 60, 12)} />
      </svg>
    </div>
  );
};

/* ============ 镜3 · 没见过的：卡一下，照样硬接（8-13s） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const q = ez(l - 2, 10);
  const stuck = l >= 44 && l < 58;
  const [shx, shy] = shake(l, 44, 7);
  const hard = clamp01((l - 58) / 12);
  const words = ['我', '看', '过', '原', '稿'];
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGM7} />
        <text x={540} y={430} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={GREY7} opacity={q}>你问它</text>
        <g opacity={q}>
          <rect x={110} y={490} width={860} height={140} rx={22} fill={PANEL} stroke={GREY7} strokeWidth={4} />
          <text x={540} y={578} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={INK7}>《红楼梦》第八十一回写了啥？</text>
        </g>
        {/* 卡住 */}
        {stuck ? (
          <g opacity={1}>
            <text x={540} y={780} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={RED7}>…</text>
            <rect x={200} y={820} width={680} height={20} rx={10} fill={RED7} opacity={0.25} />
          </g>
        ) : null}
        {/* 硬接：字一个一个蹦出来，越来越歪、越来越红 */}
        {l >= 58 ? words.map((w, i) => {
          const p = clamp01((l - (58 + i * 9)) / 8);
          if (p <= 0) return null;
          const rot = (i - 2) * 7 * p;
          const dy = (i % 2 ? 1 : -1) * 26 * p;
          return (
            <text key={i} x={240 + i * 150} y={900 + dy} textAnchor="middle" fontFamily={FONT}
              fontSize={92 + p * 10} fontWeight={900} fill={i < 2 ? RED7 : (i < 4 ? '#FF7A3D' : '#FFB03D')}
              opacity={Math.min(1, p * 2.6)} transform={`rotate(${rot} ${240 + i * 150} ${900 + dy})`}>{w}</text>
          );
        }) : null}
        {l >= 106 ? (
          <g opacity={ez(l - 106, 10)}>
            <text x={540} y={1150} textAnchor="middle" fontFamily={FONT} fontSize={50} fontWeight={900} fill={RED7}>没有这本书</text>
            <line x1={330} y1={1120} x2={750} y2={1120} stroke={RED7} strokeWidth={8} strokeLinecap="round" />
          </g>
        ) : null}
        <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={GOLD7} opacity={ez(l - 4, 10)}>没见过的，它照样接</text>
        <text x={540} y={1330} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={INK7} opacity={ez(l - 104, 12)}>
          卡一下，但它不会停
        </text>
      </svg>
    </div>
  );
};

/* ============ 镜4 · 它自己不知道（13-16.5s） ============ */
const Scene4: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const qp = clamp01((l - 20) / 44);
  const qx = 980 - qp * 700;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGM7} />
        <radialGradient id="m4g" cx="50%" cy="42%" r="52%">
          <stop offset="0%" stopColor="#1F3A54" /><stop offset="100%" stopColor={BGM7} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#m4g)'} />
        <Mascot7 x={540} y={1020} s={1.75} mood={'happy'} f={f} />
        {/* 红色问号从它眼前飘过，它不眨眼 */}
        <text x={qx} y={880} textAnchor="middle" fontFamily={FONT} fontSize={150} fontWeight={900} fill={RED7}
          opacity={0.9}>？</text>
        <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={GOLD7} opacity={ez(l - 4, 10)}>它自己不知道</text>
        <text x={540} y={1350} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={INK7} opacity={ez(l - 40, 12)}>
          问号从眼前飘过，它眼睛都不眨
        </text>
      </svg>
    </div>
  );
};

/* ============ 镜5 · 两根弦：像绷紧、对断了（16.5-20s） ============ */
const Scene5: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const vib = Math.sin(f * 0.9) * 6;
  const snap = clamp01((l - 34) / 12);
  const se = eio(snap);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGM7} />
        {/* 琴框 */}
        <g transform={'translate(540 820)'}>
          <rect x={-430} y={-190} width={860} height={380} rx={26} fill={PANEL} stroke={GREY7} strokeWidth={5} />
          {/* 上面那根弦：像不像（绷紧发光，震动） */}
          <path d={`M -380 -66 Q 0 ${-66 + vib} 380 -66`} fill="none" stroke={GOLD7} strokeWidth={9} strokeLinecap="round" />
          <text x={0} y={-120} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GOLD7}>「像不像」</text>
          {/* 下面那根弦：对不对（断） */}
          {snap <= 0 ? (
            <path d={'M -380 70 Q 0 70 380 70'} fill="none" stroke={GREY7} strokeWidth={9} strokeLinecap="round" />
          ) : (
            <g>
              <path d={`M -380 70 Q ${-190 - se * 60} ${70 + se * 40} ${-40 - se * 40} ${70 + se * 90}`} fill="none" stroke={GREY7} strokeWidth={9} strokeLinecap="round" />
              <path d={`M ${40 + se * 40} ${70 + se * 90} Q ${190 + se * 60} ${70 + se * 40} 380 70`} fill="none" stroke={GREY7} strokeWidth={9} strokeLinecap="round" opacity={1 - se * 0.5} />
            </g>
          )}
          <text x={0} y={158} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={snap > 0.5 ? RED7 : GREY7}>「对不对」{snap > 0.5 ? ' · 断了' : ''}</text>
        </g>
        <text x={540} y={260} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={INK7} opacity={ez(l - 2, 8)}>它脑子里只有两根弦</text>
        <g opacity={ez(l - 56, 12)}>
          <text x={540} y={1300} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={900} fill={RED7}>「像」那根绷得紧紧</text>
          <text x={540} y={1390} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={900} fill={INK7}>「对」那根，压根没有</text>
        </g>
      </svg>
    </div>
  );
};
"""

MAIN = r"""
const SUBSM: [number, number, string][] = [
  [0, 4.0, '它不是查资料，是在接龙'],
  [4.0, 8.0, '见过的，它接得准：花果山'],
  [8.0, 13.0, '没见过的，它照样硬接'],
  [13.0, 16.5, '而且它自己不知道接错了'],
  [16.5, 20.0, '它只有像不像，没有对不对'],
];

const SubM: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBSM.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const step = Math.min(0.1, ((seg[1] - seg[0]) / Math.max(1, chars.length)) * 0.82);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / step) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1600, textAlign: 'center', padding: '0 50px' }}>
      {chars.map((ch, i) => (
        <span key={i} style={{
          fontFamily: FONT, fontSize: 46, fontWeight: 900, display: 'inline-block',
          color: i === n - 1 ? GOLD7 : (i < n ? INK7 : '#3A4A5E'),
          transform: i === n - 1 ? 'scale(1.12)' : 'scale(1)',
        }}>{ch}</span>
      ))}
    </div>
  );
};

const SEM: [number, string, number][] = [
  [18, 'sfx/da.mp3', 0.55],
  [34, 'sfx/da.mp3', 0.55],
  [50, 'sfx/da.mp3', 0.55],
  [66, 'sfx/da.mp3', 0.55],
  [82, 'sfx/da.mp3', 0.55],
  [150, 'sfx/ding.mp3', 0.75],
  [196, 'sfx/whoosh.wav', 0.5],
  [254, 'sfx/da.mp3', 0.7],
  [290, 'sfx/boom.wav', 0.85],
  [532, 'sfx/boom.wav', 0.9],
];

const BOUNDSM: [number, number][] = [[0, 120], [120, 240], [240, 390], [390, 495], [495, 600]];

export const EP07M: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < BOUNDSM.length; i++) {
    if (frame < BOUNDSM[i][1]) { seg = i; break; }
    seg = i;
  }
  const [b0] = BOUNDSM[seg];
  const l = frame - b0;
  const SC = [Scene1, Scene2, Scene3, Scene4, Scene5];
  const Scene = SC[seg];
  const cutFlash = frame - b0 < 3 ? (1 - (frame - b0) / 3) * 0.15 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BGM7 }}>
      <Scene f={frame} l={l} />
      {SEM.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.9} />
      <SubM t={t} />
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
    out = HEAD + head.split("*/", 1)[-1] + "\n" + SCENES + MAIN
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    print("EP07M.tsx:", len(out), "字 | 镜:", out.count("const Scene"))

if __name__ == "__main__":
    main()
