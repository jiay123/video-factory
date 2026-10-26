# -*- coding: utf-8 -*-
# EP06P《先取经，再念经》15秒样片生成器 v2 —— 2026-10-25
# 剧本：孙悟空大战奥特曼（编造书）→ 查无此书 → 老贾考官：去取真经 → 翻书 + 38/92 打分
# 底子 = EP06Full.tsx 通用段（XiaoMo/LaoJia/工具函数/冲击工具），画面全新（navy 深蓝底）
import io, os

ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP06P.tsx")

HEAD = r"""
/* =============================================================
 * EP06P《先取经，再念经》· 15秒样片 v2 · 2026-10-25
 * 剧本：编造书《孙悟空大战奥特曼》→ 查无此书 → 老贾：去取真经 → 38/92 打分
 * 色板：navy（深蓝 #0D1B2A 底 / 金 #F2A93B / 白 / 红）
 * 无配音，BGM + 音效（砸书/盖章/拍桌/落定）+ 逐字字幕
 * ============================================================= */
"""

SCENES_P = r"""
/* ---- 样片色板（navy） ---- */
const NAVYB = '#0D1B2A';
const GOLD2 = '#F2A93B';
const CYAN = '#5CC8E0';
const CREAM = '#EEF3F6';
const RED2 = '#FF3B30';
const DIM = '#3A4A5E';

/* ============ 幕1 · 一本书砸下来（0-4.5s） ============ */
const SceneP1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const at = 6;
  const landed = l >= at;
  const dropY = landed ? 0 : -(1 - Math.pow(Math.max(0, l) / at, 2.4)) * 1500;
  const sS = slamS(l, at);
  const [sx, sy] = shake(l, at, 10);
  const flash = whiteFlash(l, at, 0.55);
  const push = 1 + 0.12 * (1 - Math.pow(1 - clamp01((l - 20) / 28), 3));
  const camS = push * (landed ? 1 + 0.05 * Math.max(0, 1 - (l - at) / 6) : 1);
  const TAGS: [string, number][] = [['作者 · 吴承恩他徒弟', 34], ['ISBN 74-8888-666-6', 50], ['大明嘉靖年 一版一印', 66]];
  const bigOn = ez(l - 94, 12);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px) scale(${camS})` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`translate(540 ${740 + dropY}) rotate(${landed ? -3 : -14}) scale(${sS})`}>
          <rect x={-216} y={-290} width={460} height={620} rx={16} fill={'#000000'} opacity={0.35} transform={'translate(14 20)'} />
          <rect x={-230} y={-310} width={460} height={620} rx={16} fill={GOLD2} />
          <rect x={-230} y={-310} width={34} height={620} rx={8} fill={'#B87E22'} />
          <text x={0} y={-216} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={700} fill={'#6B4A12'}>花果山出版社 出品</text>
          <text x={0} y={-96} textAnchor="middle" fontFamily={FONT} fontSize={78} fontWeight={900} fill={NAVYB}>孙悟空</text>
          <text x={0} y={6} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={NAVYB}>大战奥特曼</text>
          <rect x={-150} y={54} width={300} height={56} rx={10} fill={NAVYB} />
          <text x={0} y={94} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={GOLD2}>爽文 · 全一册</text>
          <text x={0} y={240} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={800} fill={'#6B4A12'}>定价 9 块 9</text>
        </g>
        {TAGS.map(([s, d], i) => {
          const on = ez(l - d, 10);
          return (
            <g key={i} opacity={on} transform={`translate(${540 + (1 - on) * 340} ${1130 + i * 84})`}>
              <rect x={-230} y={-32} width={460} height={64} rx={32} fill={CREAM} />
              <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={NAVYB}>{s}</text>
            </g>
          );
        })}
        <text x={540} y={1560} textAnchor="middle" fontFamily={FONT} fontSize={92} fontWeight={900} fill={CREAM}
          opacity={bigOn} transform={`translate(540 1560) scale(${0.8 + 0.2 * bigOn}) translate(-540 -1560)`}>这本书，不存在</text>
        {flash > 0 ? <rect x={0} y={0} width={1080} height={1920} fill={'#FFFFFF'} opacity={flash} /> : null}
      </svg>
    </div>
  );
};

/* ============ 幕2 · 查无此书 + 撒谎不脸红（4.5-7.2s） ============ */
const SceneP2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const at = 14;
  const [sx, sy] = shake(l, at, 12);
  const gl = glitchOn(l, at);
  const flash = whiteFlash(l, at, 0.5);
  const dark = ez(l - 4, 10);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px) scale(1.05)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`translate(540 760) rotate(-3)`} opacity={0.28 + 0.14 * (1 - dark)}>
          <rect x={-230} y={-310} width={460} height={620} rx={16} fill={GOLD2} />
          <text x={0} y={-96} textAnchor="middle" fontFamily={FONT} fontSize={78} fontWeight={900} fill={NAVYB}>孙悟空</text>
          <text x={0} y={6} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={NAVYB}>大战奥特曼</text>
        </g>
        <g transform={`translate(540 780) rotate(-11) scale(${slamS(l, at)})`} opacity={Math.min(1, clamp01((l - at) / 3) * 2)}>
          <rect x={-330} y={-92} width={660} height={184} rx={22} fill={'none'} stroke={RED2} strokeWidth={18} />
          {gl ? (
            <>
              <text x={-7} y={30} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={CYAN} opacity={0.9}>查无此书</text>
              <text x={7} y={30} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={RED2} opacity={0.9}>查无此书</text>
            </>
          ) : (
            <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={RED2}>查无此书</text>
          )}
        </g>
        <text x={540} y={1240} textAnchor="middle" fontFamily={FONT} fontSize={86} fontWeight={900} fill={CREAM}
          opacity={ez(l - 32, 10)} transform={`translate(540 1240) scale(${slamS(l, 32)}) translate(-540 -1240)`}>AI 编的。</text>
        <text x={540} y={1370} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={CREAM}
          opacity={ez(l - 48, 12)} transform={`translate(540 1370) scale(${slamS(l, 48)}) translate(-540 -1370)`}>
          它撒谎，<tspan fill={RED2}>从来不脸红</tspan>
        </text>
        {flash > 0 ? <rect x={0} y={0} width={1080} height={1920} fill={'#FFFFFF'} opacity={flash} /> : null}
      </svg>
    </div>
  );
};

/* ============ 幕3 · 老贾考官：去取真经（7.2-10.5s） ============ */
const SceneP3: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const inX = 870 + (1 - ez(l - 6, 14)) * 520;
  const [sx, sy] = shake(l, 26, 7);
  const fly = eio(clamp01((l - 30) / 16));
  const capX = 860 + (520 - 860) * fly;
  const capY = 1330 + (1080 - 1330) * fly - Math.sin(fly * Math.PI) * 130;
  const bigOn = ez(l - 24, 12);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <text x={540} y={470} textAnchor="middle" fontFamily={FONT} fontSize={104} fontWeight={900} fill={GOLD2}
          opacity={bigOn} transform={`translate(540 470) scale(${slamS(l, 24)}) translate(-540 -470)`}>先取经，再念经</text>
        <text x={540} y={600} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={DIM}
          opacity={ez(l - 44, 12)}>病根：它闭卷考试，背不出就现编</text>
        <g transform={`translate(240 1480)`} opacity={ez(l - 12, 12)}>
          <XiaoMo x={0} y={0} s={0.95} mood={l >= 18 ? 'choke' : 'cool'} f={f} />
        </g>
        <g transform={`translate(${inX} 1420)`}>
          <LaoJia x={0} y={0} s={0.85} mode={l >= 22 ? 'point' : 'present'} f={f} wag={l >= 22} />
        </g>
        {l >= 30 ? (
          <g opacity={Math.min(1, fly * 3)} transform={`translate(${capX} ${capY}) scale(${0.5 + 0.5 * fly}) rotate(${(1 - fly) * 16})`}>
            <rect x={-185} y={-52} width={370} height={104} rx={52} fill={GOLD2} />
            <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900} fill={NAVYB}>去取真经！</text>
          </g>
        ) : null}
      </svg>
    </div>
  );
};

/* ============ 幕4 · 藏经阁翻书 + 38/92 打分（10.5-15s） ============ */
const SceneP4: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const shelfX = 860 + (1 - ez(l - 6, 16)) * 420;
  const flip = (d: number) => clamp01((l - d) / 12);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `scale(${1 + 0.05 * (1 - Math.pow(1 - clamp01((l - 2) / 24), 3))})` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <text x={540} y={400} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={GOLD2}
          opacity={ez(l - 62, 12)} transform={`translate(540 400) scale(${slamS(l, 62)}) translate(-540 -400)`}>这就是 RAG</text>
        <text x={540} y={510} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={800} fill={DIM}
          opacity={ez(l - 74, 12)}>检索增强生成 · 先查，再答</text>
        <g transform={`translate(${shelfX} 860)`} opacity={ez(l - 6, 12)}>
          <rect x={-170} y={-340} width={340} height={680} rx={14} fill={'#16293D'} stroke={DIM} strokeWidth={4} />
          {[0, 1, 2, 3, 4].map((i) => {
            const cols = [CYAN, GOLD2, CREAM, RED2, '#8FA3B3'];
            return (
              <g key={i}>
                <rect x={-140 + i * 58} y={-300} width={44} height={330} rx={7} fill={cols[i]} />
                <circle cx={-118 + i * 58} cy={-272} r={6} fill={NAVYB} />
              </g>
            );
          })}
          <rect x={-170} y={40} width={340} height={20} rx={7} fill={DIM} />
          <text x={0} y={120} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={CREAM}>藏经阁</text>
        </g>
        <g transform={`translate(280 920)`} opacity={ez(l - 18, 12)}>
          <path d="M -190 14 L -190 128 L 0 152 L 0 38 Z" fill={'#16293D'} />
          <path d="M 190 14 L 190 128 L 0 152 L 0 38 Z" fill={'#1E3448'} />
          <path d="M -178 2 L -178 106 L -8 126 L -8 22 Z" fill={CREAM} />
          <path d="M 178 2 L 178 106 L 8 126 L 8 22 Z" fill={'#F7FBFF'} />
          {[0, 1, 2, 3].map((i) => (
            <line key={'l' + i} x1={-158} y1={26 + i * 22} x2={-32} y2={34 + i * 22} stroke={DIM} strokeWidth={5} opacity={0.45} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <line key={'r' + i} x1={32} y1={34 + i * 22} x2={158} y2={26 + i * 22} stroke={DIM} strokeWidth={5} opacity={0.45} />
          ))}
          <line x1={0} y1={38} x2={0} y2={150} stroke={DIM} strokeWidth={6} />
          {[0, 1, 2].map((i) => {
            const p = flip(22 + i * 12);
            if (p <= 0 || p >= 1) return null;
            const w = 168 * (1 - p);
            return (
              <path key={i} d={`M 8 22 L ${8 + w} 16 L ${8 + w} 118 L 8 126 Z`} fill={'#FFFFFF'} stroke={DIM} strokeWidth={3} opacity={0.96} />
            );
          })}
          {flip(24) > 0 && flip(24) < 1 ? (
            <rect x={60 + flip(24) * 190} y={-80 - Math.sin(flip(24) * Math.PI) * 180} width={48} height={34} rx={5} fill={CREAM}
              transform={`rotate(${flip(24) * 240})`} />
          ) : null}
          {flip(38) > 0 && flip(38) < 1 ? (
            <rect x={-20 - flip(38) * 170} y={-100 - Math.sin(flip(38) * Math.PI) * 190} width={42} height={30} rx={4} fill={GOLD2}
              transform={`rotate(${-flip(38) * 200})`} />
          ) : null}
        </g>
        <g transform={`translate(280 1300)`} opacity={ez(l - 14, 12)}>
          <XiaoMo x={0} y={0} s={0.92} mood={'happy'} f={f} />
        </g>
        <g transform={`translate(540 1560) scale(${slamS(l, 56)})`} opacity={ez(l - 56, 8)}>
          <rect x={-280} y={-125} width={560} height={250} rx={20} fill={CREAM} stroke={DIM} strokeWidth={5} />
          <text x={-215} y={-48} fontFamily={FONT} fontSize={44} fontWeight={800} fill={DIM} opacity={ez(l - 62, 10)}>闭卷乱编</text>
          <text x={215} y={-40} textAnchor="end" fontFamily={FONT} fontSize={62} fontWeight={900} fill={DIM} opacity={ez(l - 62, 10)}>38 分</text>
          {l >= 72 ? <line x1={-225} y1={-34} x2={215} y2={-58} stroke={RED2} strokeWidth={9} strokeLinecap="round" /> : null}
          <text x={-215} y={72} fontFamily={FONT} fontSize={44} fontWeight={800} fill={NAVYB} opacity={ez(l - 78, 10)}>捧着真经答</text>
          <text x={215} y={82} textAnchor="end" fontFamily={FONT} fontSize={76} fontWeight={900} fill={NAVYB} opacity={ez(l - 78, 10)}>92 分</text>
          {l >= 88 ? (
            <path d={`M 150 40 L 200 88 L 250 -20`} fill={'none'} stroke={RED2} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </g>
      </svg>
    </div>
  );
};
"""

MAIN_P = r"""
const PSUBS: [number, number, string][] = [
  [0, 4.5, '你问 AI 推荐本书，它啪就给你编一本'],
  [4.5, 7.2, '这书不存在。AI 撒谎，从来不脸红'],
  [7.2, 9.2, '它闭卷考试，背不出就现编'],
  [9.2, 10.5, '老贾说：别瞎编，去取真经'],
  [10.5, 13.4, '先翻书，再开口'],
  [13.4, 15, '闭卷 38 分，开卷 92 分'],
];

const PSub: React.FC<{ t: number }> = ({ t }) => {
  const seg = PSUBS.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / 0.085) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1736, textAlign: 'center', padding: '0 52px' }}>
      {chars.map((ch, i) => (
        <span key={i} style={{
          fontFamily: FONT, fontSize: 46, fontWeight: 800, display: 'inline-block',
          color: i === n - 1 ? GOLD2 : (i < n ? CREAM : DIM),
          transform: i === n - 1 ? 'scale(1.12)' : 'scale(1)',
        }}>{ch}</span>
      ))}
    </div>
  );
};

const SE: [number, string, number][] = [
  [6, 'sfx/boom.wav', 0.95],
  [149, 'sfx/da.mp3', 0.9],
  [242, 'sfx/hit_1750.wav', 0.95],
  [371, 'sfx/dong.mp3', 0.9],
  [393, 'sfx/ding.mp3', 0.7],
];

export const EP06P: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const bounds: [number, number][] = [[0, 135], [135, 216], [216, 315], [315, 450]];
  const seg = frame < 135 ? 0 : frame < 216 ? 1 : frame < 315 ? 2 : 3;
  const [b0, b1] = bounds[seg];
  const dur = b1 - b0;
  const l = frame - b0;
  const S = [SceneP1, SceneP2, SceneP3, SceneP4];
  const DIRSP: [number, number][] = [[0, -1], [-1, 0], [1, 0], [0, -1]];
  const fromDir = DIRSP[seg];
  const inP = clamp01((l + 4) / 6);
  const outP = clamp01((l - (dur - 6)) / 10);
  const eIn = 1 - Math.pow(1 - inP, 3);
  const eOut = eio(outP);
  const dx = fromDir[0] * (1 - eIn) * 110 - fromDir[0] * eOut * 110;
  const dy = fromDir[1] * (1 - eIn) * 130 - fromDir[1] * eOut * 110;
  const Scene = S[seg];
  return (
    <AbsoluteFill style={{ backgroundColor: NAVYB }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${dx}px, ${dy}px)`, opacity: l < dur ? clamp01((l + 4) / 4) : 0 }}>
        <Scene f={frame} l={l} />
      </div>
      {SE.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.85} />
      <PSub t={t} />
      <div style={{ position: 'absolute', left: 54, top: 62 }}>
        <div style={{
          fontFamily: FONT, fontSize: 26, fontWeight: 800, color: CREAM,
          background: 'rgba(13,27,42,0.72)', border: '2px solid ' + DIM, borderRadius: 27, padding: '12px 26px',
        }}>AI 科普 · 样片</div>
      </div>
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
    out = HEAD + head.split("*/", 1)[-1] + "\n" + SCENES_P + MAIN_P
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    print("EP06P.tsx:", len(out), "字 | Sequence:", "Sequence" in out, "| PSUBS:", out.count("PSUBS"))

if __name__ == "__main__":
    main()
