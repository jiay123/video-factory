# -*- coding: utf-8 -*-
# EP07I 快切版 · 20镜 × 1.33秒 = 26.7秒 · 图从右侧滑入、图和字同时出现
import io, os, re

ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP07I.tsx")

HEAD = r"""
/* EP07I 快切版：20 镜 × 1.33s，图整张滑入滑出，图和字同时切 */
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

type Shot = {
  kind: 'big' | 'ask' | 'ans' | 'book' | 'bars' | 'mascot' | 'laojia' | 'quote' | 'next';
  text: string;
  sub?: string;
  color?: string;
  hi?: number;
  vals?: [string, number][];
};

const SHOTS: Shot[] = [
  { kind: 'big', text: 'AI 说的用药量', color: 'INK' },
  { kind: 'big', text: '你敢信吗？', color: 'RED' },
  { kind: 'mascot', text: '问我，我啥都知道', sub: '小模' },
  { kind: 'ask', text: '这药一天吃几次？' },
  { kind: 'ans', text: '一天三次', sub: '每次两片' },
  { kind: 'laojia', text: '说得跟真的一样', sub: '老贾信了' },
  { kind: 'book', text: '说明书上写的是', sub: '一天一次 · 每次一片' },
  { kind: 'big', text: '差了六倍', color: 'RED' },
  { kind: 'big', text: '它为什么敢这么答？', color: 'INK' },
  { kind: 'quote', text: '它不是在查', sub: '它是在抽签' },
  { kind: 'bars', text: '它给每个答案打分', vals: [['一天三次', 92], ['一天两次', 5], ['一天一次', 2], ['不知道', 0.3]], hi: 0 },
  { kind: 'bars', text: '最高的那根，它抽中了', vals: [['一天三次', 92], ['一天两次', 5], ['一天一次', 2], ['不知道', 0.3]], hi: 0 },
  { kind: 'bars', text: '「不知道」只有 0.3%', vals: [['一天三次', 92], ['一天两次', 5], ['一天一次', 2], ['不知道', 0.3]], hi: 3 },
  { kind: 'big', text: '它从来不选', color: 'RED' },
  { kind: 'quote', text: '它不是撒谎', sub: '它不知道自己在编' },
  { kind: 'big', text: '药量这种事', color: 'INK' },
  { kind: 'big', text: '只能信说明书', color: 'GREEN' },
  { kind: 'next', text: '下一集', sub: 'AI 会不会抢走你的工作？' },
];

const SHOT_FRAMES = 40;
const TRANS = 4;

/* 单个镜头内容 */
const ShotView: React.FC<{ s: Shot; l: number; f: number }> = ({ s, l, f }) => {
  const c = (k?: string) => (k === 'RED' ? RED : k === 'GREEN' ? GREEN : k === 'GOLD' ? GOLD : INK);
  const appear = clamp01((l + 6) / 6);
  const ae = 1 - Math.pow(1 - appear, 2);
  if (s.kind === 'big') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          fontFamily: FONT, fontSize: s.text.length > 8 ? 88 : 120, fontWeight: 900, color: c(s.color),
          textAlign: 'center', transform: `scale(${0.82 + 0.18 * ae})`, opacity: appear, letterSpacing: '-.02em',
        }}>{s.text}</div>
      </div>
    );
  }
  if (s.kind === 'ask') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', left: 120, top: 780, width: 840, padding: '46px 40px',
          background: CARD, border: '3px solid ' + LINE2, borderRadius: 28, fontFamily: FONT, fontSize: 62,
          fontWeight: 900, color: INK, textAlign: 'center', opacity: appear, transform: `translateY(${(1 - ae) * 40}px)` }}>
          {s.text}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center',
          fontFamily: FONT, fontSize: 40, fontWeight: 800, color: GREY, opacity: appear }}>你问它</div>
      </div>
    );
  }
  if (s.kind === 'ans') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', left: 130, right: 130, top: 720, padding: '54px 40px',
          background: GOLD, borderRadius: 34, textAlign: 'center', opacity: appear,
          transform: `scale(${0.86 + 0.14 * ae})` }}>
          <div style={{ fontFamily: FONT, fontSize: 86, fontWeight: 900, color: '#FFFFFF' }}>{s.text}</div>
          <div style={{ fontFamily: FONT, fontSize: 86, fontWeight: 900, color: '#FFFFFF', marginTop: 10 }}>{s.sub}</div>
        </div>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <Mascot x={200} y={1360} s={1.0} mood={'happy'} f={f} op={appear} />
        </svg>
      </div>
    );
  }
  if (s.kind === 'book') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center',
          fontFamily: FONT, fontSize: 48, fontWeight: 900, color: GREY, opacity: appear }}>{s.text}</div>
        <div style={{ position: 'absolute', left: 110, right: 110, top: 700, padding: '60px 40px',
          background: CARD, border: '4px solid ' + LINE2, borderRadius: 16, textAlign: 'center', opacity: appear,
          transform: `translateY(${(1 - ae) * 50}px)`, boxShadow: '0 24px 60px rgba(0,0,0,0.10)' }}>
          <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 800, color: GREY, marginBottom: 18 }}>用法用量</div>
          <div style={{ fontFamily: FONT, fontSize: 92, fontWeight: 900, color: GREEN }}>{s.sub}</div>
        </div>
      </div>
    );
  }
  if (s.kind === 'bars') {
    const vals = s.vals || [];
    const baseY = 1500;
    const maxH = 560;
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center',
          fontFamily: FONT, fontSize: 46, fontWeight: 900, color: INK, opacity: appear }}>{s.text}</div>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <line x1={80} y1={baseY} x2={1000} y2={baseY} stroke={INK} strokeWidth={4} opacity={0.3} />
          {vals.map(([label, v], i) => {
            const grow = clamp01((l - 4 - i * 5) / 16);
            const e = 1 - Math.pow(1 - grow, 3);
            const h = maxH * (v / 100) * e;
            const x = 100 + i * 230;
            const y = baseY - h;
            const on = i === (s.hi ?? 0);
            return (
              <g key={i}>
                <rect x={x} y={y} width={180} height={Math.max(h, 2)} rx={6}
                  fill={on ? GOLD : LINE2} stroke={on ? GOLD : '#B5AC9B'} strokeWidth={3} />
                <text x={x + 90} y={y - 16} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={900}
                  fill={on ? GOLD : GREY} opacity={grow}>{v}%</text>
                <text x={x + 90} y={baseY + 44} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800}
                  fill={on ? INK : GREY}>{label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }
  if (s.kind === 'mascot') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <Mascot x={540} y={1080} s={1.45} mood={'cool'} f={f} op={appear} />
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1380, textAlign: 'center',
          fontFamily: FONT, fontSize: 74, fontWeight: 900, color: INK, opacity: appear }}>{s.text}</div>
      </div>
    );
  }
  if (s.kind === 'laojia') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
          <g transform={'translate(540 1120) scale(1.35)'}>
            <LaoJia x={0} y={0} s={1} mode={'gasp'} f={f} wag={false} />
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center',
          fontFamily: FONT, fontSize: 66, fontWeight: 900, color: INK, opacity: appear }}>{s.text}</div>
      </div>
    );
  }
  if (s.kind === 'quote') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: FONT, fontSize: 76, fontWeight: 900, color: INK, opacity: appear }}>{s.text}</div>
        <div style={{ fontFamily: FONT, fontSize: 104, fontWeight: 900, color: GOLD, marginTop: 24, opacity: appear,
          transform: `scale(${0.9 + 0.1 * ae})` }}>{s.sub}</div>
      </div>
    );
  }
  // next
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <radialGradient id="nxg" cx="50%" cy="44%" r="60%">
          <stop offset="0%" stopColor="#3E2606" />
          <stop offset="100%" stopColor="#1A1208" />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#nxg)'} />
        <text x={540} y={760} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={GOLD}>{s.text}</text>
        <text x={540} y={900} textAnchor="middle" fontFamily={FONT} fontSize={78} fontWeight={900} fill="#F5EFE2">{s.sub}</text>
        <Mascot x={540} y={1350} s={1.25} mood={'cool'} f={f} />
        <text x={540} y={1680} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={GOLD}>点赞关注，下集见</text>
      </svg>
    </div>
  );
};

/* 主场景：当前镜 + 滑入滑出 */
const SceneMain: React.FC<{ f: number }> = ({ f }) => {
  const idx = Math.min(SHOTS.length - 1, Math.floor(f / SHOT_FRAMES));
  const local = f - idx * SHOT_FRAMES;
  const inP = clamp01(local / TRANS);
  const outP = idx < SHOTS.length - 1 ? clamp01((local - (SHOT_FRAMES - TRANS)) / TRANS) : 0;
  const eIn = 1 - Math.pow(1 - inP, 3);
  const eOut = eio(outP);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* 背景（贯穿） */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG} />
        {SHOTS[idx].kind === 'next' ? null : (
          <>
            <radialGradient id="vgm" cx="50%" cy="44%" r="74%">
              <stop offset="55%" stopColor="#F6F1E6" stopOpacity={0} />
              <stop offset="100%" stopColor="#BDB097" stopOpacity={0.38} />
            </radialGradient>
            <rect width={1080} height={1920} fill={'url(#vgm)'} />
            {Array.from({ length: 13 }, (_, i) => (
              <line key={i} x1={i * 84} y1={0} x2={i * 84} y2={1920} stroke="#C9BFA8" strokeWidth={1} opacity={0.16} />
            ))}
          </>
        )}
      </svg>
      {/* 当前镜：从右侧滑入；退出时向左滑出 */}
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(1 - eIn) * 340 - eOut * 340}px)`, opacity: 1 - eOut * 0.25 }}>
        <ShotView s={SHOTS[idx]} l={local} f={f} />
      </div>
    </div>
  );
};

export const EP07I: React.FC = () => {
  const frame = useCurrentFrame();
  const total = SHOTS.length * SHOT_FRAMES;
  const t = frame / 30;
  const idx = Math.min(SHOTS.length - 1, Math.floor(frame / SHOT_FRAMES));
  const local = frame - idx * SHOT_FRAMES;
  const isNext = SHOTS[idx].kind === 'next';
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <SceneMain f={frame} />
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.85} />
      {/* 顶部集号角标（下移避开平台标题；深色镜不显示白色角标） */}
      {!isNext ? (
        <div style={{ position: 'absolute', left: 54, top: 380, padding: '10px 24px', border: '2px solid #D9D0BE',
          borderRadius: 26, background: 'rgba(246,241,230,0.85)', fontFamily: FONT, fontSize: 22, fontWeight: 800,
          color: GREY, opacity: 0.9 }}>AI 科普 · EP07</div>
      ) : null}
      {/* 淡入淡出 */}
      {frame < 6 ? <div style={{ position: 'absolute', inset: 0, background: BG, opacity: 1 - frame / 6 }} /> : null}
      {frame > total - 8 ? <div style={{ position: 'absolute', inset: 0, background: '#1A1208', opacity: (frame - (total - 8)) / 8 }} /> : null}
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
                 ("fill={CARD}", "fill={CARD_D}"), ("border: '3px solid ' + LINE2", "border: '3px solid ' + LINE2_D"),
                 ("fill={GREEN}", "fill={GREEN_D}"), ("color: GREY", "color: GREY_D"),
                 ("c(s.color)", "c(s.color)"), ("= RED :", "= RED_D :"), ("= GREEN :", "= GREEN_D :"), ("= GOLD :", "= GOLD_D :")]:
        sc = sc.replace(a, b)
    names = ["CARD", "GREEN", "GOLD", "RED", "GREY", "LINE2"]
    for n in names:
        sc = sc.replace(n + "_D", "_Z_" + n + "_Z_")
    for n in names:
        sc = re.sub(r"\b" + n + r"\b", n + "_D", sc)
    for n in names:
        sc = sc.replace("_Z_" + n + "_Z_", n + "_D")
    out = HEAD + head.split("*/", 1)[-1] + "\n" + sc
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    print("EP07I.tsx:", len(out), "| 镜数:", 18)

if __name__ == "__main__":
    main()
