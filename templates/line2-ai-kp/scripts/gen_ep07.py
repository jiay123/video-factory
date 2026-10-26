# -*- coding: utf-8 -*-
# EP07《它不知道自己在瞎编》完整版 —— 2026-10-25
# 新版小模：白脸 + 深蓝描边 + 两根触角改「多节机械臂」+ 胸口金核心
# 字全部在周边、8 种花式出场；14 镜约 48 秒；底色统一墨黑
import io, os

ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP07.tsx")

HEAD = r"""
/* =============================================================
 * EP07《它不知道自己在瞎编》· 48秒 14镜
 * 新版小模：机械臂版（触角→多节机械臂）；字在周边；墨黑底
 * 每镜 3-4 秒，每镜一个大视觉事件
 * ============================================================= */
"""

SCENES = r"""
const BG7 = '#0E0C0A';
const INK7 = '#F5EFE2';
const GOLD7 = '#E8B44A';
const RED7 = '#D93327';
const GREY7 = '#8A7F70';
const BLUE7 = '#0A2540';
const CYAN7 = '#5BC0DE';

/* ============ 新版小模：机械臂 ============ */
const XiaoMo2: React.FC<{ x: number; y: number; s: number; mood: string; f: number; arm?: string; op?: number }> =
  ({ x, y, s, mood, f, arm = 'idle', op = 1 }) => {
    const eye = mood === 'cool' ? 'bar' : mood === 'shock' ? 'wide' : mood === 'choke' ? 'x' : 'happy';
    const faceCol = mood === 'choke' ? '#F2A9A0' : '#FFFFFF';
    const up = arm === 'up' ? 1 : 0;
    const cover = arm === 'cover' ? 1 : 0;
    const point = arm === 'point' ? 1 : 0;
    const sway = Math.sin(f / 24) * 4;
    const armRot = -34 + up * 46 - cover * 58 + point * 30 + sway;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
        {/* 左机械臂 */}
        <g transform={`translate(-82 -86) rotate(${armRot})`}>
          <rect x={-9} y={-74} width={18} height={74} rx={9} fill={BLUE7} stroke="#071726" strokeWidth={4} />
          <circle cx={0} cy={-80} r={14} fill={GOLD7} stroke={BLUE7} strokeWidth={4} />
          <g transform={`translate(0 -88) rotate(${cover * 46})`}>
            <rect x={-7} y={-64} width={14} height={64} rx={7} fill={CYAN7} stroke={BLUE7} strokeWidth={4} />
            <path d="M -18 -64 L 0 -96 L 18 -64 Z" fill={GOLD7} stroke={BLUE7} strokeWidth={4} strokeLinejoin="round" />
          </g>
        </g>
        {/* 右机械臂（镜像） */}
        <g transform={`translate(82 -86) rotate(${-armRot}) scale(-1 1)`}>
          <rect x={-9} y={-74} width={18} height={74} rx={9} fill={BLUE7} stroke="#071726" strokeWidth={4} />
          <circle cx={0} cy={-80} r={14} fill={GOLD7} stroke={BLUE7} strokeWidth={4} />
          <g transform={`translate(0 -88) rotate(${cover * 46})`}>
            <rect x={-7} y={-64} width={14} height={64} rx={7} fill={CYAN7} stroke={BLUE7} strokeWidth={4} />
            <path d="M -18 -64 L 0 -96 L 18 -64 Z" fill={GOLD7} stroke={BLUE7} strokeWidth={4} strokeLinejoin="round" />
          </g>
        </g>
        {/* 脸 */}
        <circle cx={0} cy={-4} r={112} fill={faceCol} stroke={BLUE7} strokeWidth={9} />
        <path d={'M -62 -34 q 18 -16 36 0'} fill="none" stroke={BLUE7} strokeWidth={7} strokeLinecap="round" opacity={0.35} />
        {/* 眼睛 */}
        {eye === 'bar' ? (
          <g fill={BLUE7}>
            <rect x={-64} y={-16} width={48} height={20} rx={9} />
            <rect x={16} y={-16} width={48} height={20} rx={9} />
          </g>
        ) : eye === 'wide' ? (
          <g>
            <circle cx={-38} cy={-6} r={24} fill="#FFF" stroke={BLUE7} strokeWidth={6} />
            <circle cx={38} cy={-6} r={24} fill="#FFF" stroke={BLUE7} strokeWidth={6} />
            <circle cx={-38} cy={-4} r={10} fill={BLUE7} />
            <circle cx={38} cy={-4} r={10} fill={BLUE7} />
          </g>
        ) : eye === 'x' ? (
          <g stroke={BLUE7} strokeWidth={10} strokeLinecap="round">
            <line x1={-60} y1={-24} x2={-20} y2={12} /><line x1={-20} y1={-24} x2={-60} y2={12} />
            <line x1={20} y1={-24} x2={60} y2={12} /><line x1={60} y1={-24} x2={20} y2={12} />
          </g>
        ) : (
          <g fill="none" stroke={BLUE7} strokeWidth={9} strokeLinecap="round">
            <path d={'M -62 -4 q 22 -26 44 0'} /><path d={'M 18 -4 q 22 -26 44 0'} />
          </g>
        )}
        {/* 嘴 */}
        {mood === 'shock' ? <ellipse cx={0} cy={52} rx={18} ry={24} fill={BLUE7} /> :
         mood === 'choke' ? <path d={'M -22 56 q 22 -18 44 0'} fill="none" stroke={BLUE7} strokeWidth={8} strokeLinecap="round" /> :
         <path d={'M -26 46 q 26 26 52 0'} fill="none" stroke={BLUE7} strokeWidth={9} strokeLinecap="round" />}
        {/* 胸口核心 */}
        <circle cx={0} cy={96} r={15} fill={GOLD7} opacity={0.55 + 0.45 * Math.abs(Math.sin(f / 16))} />
        {/* 汗滴（choke 时） */}
        {mood === 'choke' ? [0, 1, 2].map((i) => {
          const p = ((f / 14 + i * 0.33) % 1);
          return <ellipse key={i} cx={-96 + i * 14} cy={-70 - p * 70} rx={7} ry={11} fill={CYAN7} opacity={1 - p} />;
        }) : null}
      </g>
    );
  };

/* ============ 字花式工具 ============ */
const ringWords = (words: string[], f: number, cx: number, cy: number, start: number, R = 300) =>
  words.map((w, i) => {
    const a = (i / words.length) * Math.PI * 2 + (start + f * 0.02);
    return { w, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R * 0.72, a };
  });

/* ============ 镜1 · 黑场劈开+机械臂展开（0-3.5s） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const split = eio(clamp01(l / 12));
  const beamW = 34 * (1 - clamp01((l - 12) / 14));
  const armP = ez(l - 16, 12);
  const ring = ringWords(['我', '什', '么', '都', '知', '道'], f, 540, 960, 0, 330);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 540, height: 1920, background: '#000', transform: `translateX(${-split * 560}px)` }} />
      <div style={{ position: 'absolute', left: 540, top: 0, width: 540, height: 1920, background: '#000', transform: `translateX(${split * 560}px)` }} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <radialGradient id="g1" cx="50%" cy="46%" r="58%">
          <stop offset="0%" stopColor="#3A1A0A" />
          <stop offset="100%" stopColor={BG7} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#g1)'} opacity={split} />
        {beamW > 0 ? <rect x={540 - beamW / 2} y={0} width={beamW} height={1920} fill={GOLD7} opacity={0.92} /> : null}
        <XiaoMo2 x={540} y={1000} s={1.7} mood={'cool'} f={f} arm={armP > 0.5 ? 'up' : 'idle'} op={ez(l - 10, 8)} />
        {l >= 20 ? ring.map((it, i) => {
          const p = ez(l - (20 + i * 4), 10);
          return (
            <text key={i} x={it.x} y={it.y} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900}
              fill={i % 2 ? GOLD7 : INK7} opacity={p} transform={`translate(${it.x} ${it.y}) scale(${0.5 + 0.5 * p}) translate(${-it.x} ${-it.y})`}>{it.w}</text>
          );
        }) : null}
      </svg>
    </div>
  );
};

/* ============ 镜2 · 老贾大脸（3.5-7s） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const push = 1 + 0.18 * eio(clamp01(l / 50));
  const [shx, shy] = shake(l, 22, 10);
  const q = ez(l - 24, 8);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={'#1A1208'} />
        <radialGradient id="g2" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#4A2A08" /><stop offset="100%" stopColor="#1A1208" />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#g2)'} />
        <g transform={`translate(540 1200) scale(${5.2 * push}) translate(0 -70)`} opacity={ez(l - 4, 8)}>
          <LaoJia x={0} y={0} s={1} mode={'point'} f={f} wag={true} />
        </g>
        <text x={540} y={230} textAnchor="middle" fontFamily={FONT} fontSize={92} fontWeight={900} fill={INK7} opacity={ez(l - 10, 8)}>那我问你</text>
        <g opacity={q} transform={`translate(540 1420) scale(${0.7 + 0.3 * q}) translate(-540 -1420)`}>
          <text x={540} y={1420} textAnchor="middle" fontFamily={FONT} fontSize={86} fontWeight={900} fill={GOLD7}>孙悟空住哪儿？！</text>
        </g>
      </svg>
    </div>
  );
};

/* ============ 镜3 · 整屏火星（7-10.5s） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const enter = eio(clamp01(l / 8));
  const [shx, shy] = shake(l, 4, 6);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={'#B23A1E'} opacity={enter} />
        <radialGradient id="g3" cx="50%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#E0772A" /><stop offset="68%" stopColor="#B23A1E" /><stop offset="100%" stopColor="#5E1A0C" />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#g3)'} opacity={enter} />
        {[[300, 360, 96], [840, 280, 62], [720, 1280, 130], [200, 1520, 74], [930, 1680, 54]].map(([x, y, r], i) => (
          <g key={i} opacity={enter * 0.9}>
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.42} fill="#7E2A12" />
            <ellipse cx={x} cy={y - r * 0.1} rx={r * 0.82} ry={r * 0.32} fill="#9A3216" />
          </g>
        ))}
        <g transform={`translate(690 900) rotate(-12) scale(${1.15 * enter})`}>
          <path d={'M 0 -190 L 52 -46 L 52 66 L -52 66 L -52 -46 Z'} fill="#E8E2D2" />
          <path d={'M 0 -190 L 52 -46 L 0 -78 L -52 -46 Z'} fill={RED7} />
          <path d={'M -52 22 L -108 100 L -52 66 Z'} fill="#C9A85E" />
          <path d={'M 52 22 L 108 100 L 52 66 Z'} fill="#C9A85E" />
          <circle cx={0} cy={-34} r={22} fill="#3A6EA5" stroke="#E8E2D2" strokeWidth={5} />
          <path d={'M -30 68 L -16 148 L 0 104 L 16 148 L 30 68 Z'} fill="#FFB84D" />
          <path d={'M -14 68 L 0 124 L 14 68 Z'} fill="#FFF3C4" />
        </g>
        <XiaoMo2 x={230} y={1350} s={1.05} mood={'cool'} f={f} arm={'point'} op={ez(l - 14, 10)} />
        <text x={540} y={260} textAnchor="middle" fontFamily={FONT} fontSize={74} fontWeight={900} fill={INK7} opacity={ez(l - 12, 8)}>它说：住火星</text>
      </svg>
    </div>
  );
};

/* ============ 镜4 · 书页金光 花果山（10.5-14.5s） ============ */
const Scene4: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const open = eio(clamp01(l / 16));
  const glow = ez(l - 14, 14);
  const cross = clamp01((l - 26) / 12);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={'#0A0908'} />
        <radialGradient id="g4" cx="50%" cy="44%" r="48%">
          <stop offset="0%" stopColor="#FFE9A8" stopOpacity={0.92} />
          <stop offset="55%" stopColor="#8A6A2A" stopOpacity={0.34} />
          <stop offset="100%" stopColor="#0A0908" stopOpacity={0} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#g4)'} opacity={glow} />
        <g transform={`translate(540 920) scale(${1.55 - 0.55 * open})`} opacity={ez(l - 2, 8)}>
          <path d={'M -380 10 L -380 300 L 0 340 L 0 40 Z'} fill="#F2E7CE" />
          <path d={'M 380 10 L 380 300 L 0 340 L 0 40 Z'} fill="#F7F0DC" />
          <path d={'M -398 18 L -398 316 L -380 300 L -380 10 Z'} fill="#8A6A2A" />
          <path d={'M 398 18 L 398 316 L 380 300 L 380 10 Z'} fill="#8A6A2A" />
          <text x={-190} y={236} textAnchor="middle" fontFamily={FONT} fontSize={98} fontWeight={900} fill="#2A1F12" opacity={glow}>花果山</text>
          <text x={200} y={236} textAnchor="middle" fontFamily={FONT} fontSize={66} fontWeight={900} fill="#6B4A12" opacity={glow}>水帘洞</text>
        </g>
        {cross > 0 ? (
          <g opacity={cross}>
            <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontSize={90} fontWeight={900} fill={GREY7}
              textDecoration="line-through">火星</text>
            <line x1={400} y1={215} x2={680} y2={215} stroke={RED7} strokeWidth={14} strokeLinecap="round" />
            <text x={540} y={1560} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={900} fill={GOLD7} opacity={ez(l - 40, 10)}>书上是这么写的</text>
          </g>
        ) : null}
      </svg>
    </div>
  );
};

/* ============ 镜5 · 捂脸冒汗（14.5-18s） ============ */
const Scene5: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const p = ez(l - 6, 12);
  const [shx, shy] = shake(l, 30, 8);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={'#1A1208'} />
        <XiaoMo2 x={540} y={1000} s={1.6} mood={'choke'} f={f} arm={'cover'} op={p} />
        <g opacity={ez(l - 24, 10)}>
          {['这…', '这个…', '我再查查'].map((s, i) => {
            const q = ez(l - (24 + i * 14), 8);
            return (
              <text key={i} x={540 + (i - 1) * 320} y={430 + i * 90} textAnchor="middle" fontFamily={FONT}
                fontSize={62} fontWeight={900} fill={i === 2 ? GOLD7 : INK7} opacity={q}>{s}</text>
            );
          })}
        </g>
        <text x={540} y={1590} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={RED7}
          opacity={ez(l - 62, 12)}>它心虚了</text>
      </svg>
    </div>
  );
};

/* ============ 镜6 · 金句印章（18-21.5s） ============ */
const Scene6: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const a = ez(l - 4, 10);
  const b = ez(l - 26, 10);
  const [shx, shy] = shake(l, 4, 8);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG7} />
        <g opacity={a} transform={`translate(540 820) scale(${slamS(l, 4)})`}>
          <rect x={-470} y={-110} width={940} height={220} rx={18} fill={'none'} stroke={RED7} strokeWidth={14} />
          <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontSize={104} fontWeight={900} fill={INK7}>答得比谁都自信</text>
        </g>
        <g opacity={b} transform={`translate(540 1080) scale(${slamS(l, 26)})`}>
          <rect x={-470} y={-110} width={940} height={220} rx={18} fill={'none'} stroke={GOLD7} strokeWidth={14} />
          <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontSize={104} fontWeight={900} fill={GOLD7}>错得比谁都离谱</text>
        </g>
      </svg>
    </div>
  );
};

/* ============ 镜7 · 像≠对（21.5-25s） ============ */
const Scene7: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const p1 = ez(l - 6, 10);
  const p2 = ez(l - 20, 10);
  const p3 = ez(l - 40, 10);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG7} />
        <text x={540} y={230} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={GREY7} opacity={ez(l - 2, 8)}>它学了一辈子</text>
        <g opacity={p1}>
          <rect x={110} y={380} width={400} height={520} rx={16} fill="#1E1A15" stroke={GOLD7} strokeWidth={5} />
          <text x={310} y={640} textAnchor="middle" fontFamily={FONT} fontSize={150} fontWeight={900} fill={GOLD7}>像</text>
          <text x={310} y={830} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={INK7}>像人说的话</text>
        </g>
        <g opacity={p2}>
          <rect x={570} y={380} width={400} height={520} rx={16} fill="#121110" stroke={GREY7} strokeWidth={5} strokeDasharray="14 12" />
          <text x={770} y={640} textAnchor="middle" fontFamily={FONT} fontSize={150} fontWeight={900} fill="#3A342C">对</text>
          <text x={770} y={830} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY7}>对不对，没人教过</text>
        </g>
        <text x={540} y={1030} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={RED7} opacity={p3}>像，不等于对</text>
        <XiaoMo2 x={540} y={1330} s={0.85} mood={'happy'} f={f} arm={'up'} op={p3} />
      </svg>
    </div>
  );
};

/* ============ 镜8 · 「我不知道」被撕掉（25-28.5s） ============ */
const Scene8: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const p = ez(l - 6, 10);
  const tear = clamp01((l - 26) / 18);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG7} />
        <text x={540} y={210} textAnchor="middle" fontFamily={FONT} fontSize={58} fontWeight={900} fill={GREY7} opacity={p}>它脑子里的词典</text>
        <g opacity={p}>
          <rect x={140} y={300} width={800} height={900} rx={20} fill="#F2E7CE" />
          {['天', '地', '人', '山', '水', '火'].map((s, i) => (
            <text key={i} x={260 + (i % 3) * 280} y={460 + Math.floor(i / 3) * 200} textAnchor="middle"
              fontFamily={FONT} fontSize={96} fontWeight={900} fill="#2A1F12" opacity={0.85}>{s}</text>
          ))}
          {/* 那个空缺 */}
          <rect x={260} y={840} width={560} height={200} rx={12} fill="#C9BFA8" opacity={0.6} />
          <text x={540} y={960} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill="#8A7F70">“我不知道”</text>
          {tear > 0 ? (
            <g opacity={tear}>
              <line x1={260} y1={840} x2={820} y2={1040} stroke={BG7} strokeWidth={14} />
              <line x1={820} y1={840} x2={260} y2={1040} stroke={BG7} strokeWidth={14} />
              <text x={540} y={960} textAnchor="middle" fontFamily={FONT} fontSize={76} fontWeight={900} fill={RED7}>没有这四个字</text>
            </g>
          ) : null}
        </g>
        <text x={540} y={1360} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={GOLD7}
          opacity={ez(l - 52, 12)}>所以它只能硬答</text>
      </svg>
    </div>
  );
};

/* ============ 镜9 · 治法1 给出处（28.5-32s） ============ */
const Scene9: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const p = ez(l - 4, 10);
  const tags = ['出处：第 3 页', '出处：第 12 页', '出处：第 27 页'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG7} />
        <text x={540} y={200} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={GOLD7} opacity={p}>治法一：让它给出处</text>
        {['孙悟空住在花果山。', '金箍棒重一万三千五百斤。', '唐僧有两个徒弟。'].map((s, i) => {
          const q = ez(l - (14 + i * 16), 10);
          return (
            <g key={i} opacity={q}>
              <rect x={90} y={330 + i * 220} width={700} height={110} rx={16} fill="#F2E7CE" />
              <text x={118} y={400 + i * 220} fontFamily={FONT} fontSize={40} fontWeight={800} fill="#2A1F12">{s}</text>
              <g transform={`translate(860 ${385 + i * 220}) scale(${0.6 + 0.4 * q})`}>
                <rect x={-110} y={-34} width={220} height={68} rx={34} fill={GOLD7} />
                <text x={0} y={12} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={900} fill="#1A1208">{tags[i]}</text>
              </g>
            </g>
          );
        })}
        <text x={540} y={1320} textAnchor="middle" fontFamily={FONT} fontSize={58} fontWeight={900} fill={INK7}
          opacity={ez(l - 60, 12)}>每句话都能查，它就不敢瞎编</text>
        <XiaoMo2 x={540} y={1560} s={0.7} mood={'happy'} f={f} arm={'up'} op={ez(l - 40, 10)} />
      </svg>
    </div>
  );
};

/* ============ 镜10 · 治法2 敢说不知道（32-35.5s） ============ */
const Scene10: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const p = ez(l - 4, 10);
  const drop = eio(clamp01((l - 24) / 30));
  const barW = 640;
  const fillW = barW * (1 - 0.82 * drop);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG7} />
        <text x={540} y={220} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={GOLD7} opacity={p}>治法二：让它敢说不知道</text>
        <g opacity={p}>
          <rect x={220} y={520} width={barW} height={90} rx={45} fill="#1E1A15" stroke={GREY7} strokeWidth={4} />
          <rect x={220} y={520} width={fillW} height={90} rx={45} fill={drop > 0.6 ? RED7 : GOLD7} />
          <text x={540} y={578} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill="#1A1208">
            {drop > 0.6 ? '不确定' : '很确定'}
          </text>
        </g>
        <text x={540} y={760} textAnchor="middle" fontFamily={FONT} fontSize={58} fontWeight={900} fill={INK7}
          opacity={ez(l - 44, 12)}>“这个我不确定，你去查一下”</text>
        <XiaoMo2 x={540} y={1120} s={1.25} mood={'happy'} f={f} arm={'point'} op={p} />
        <text x={540} y={1500} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={GOLD7}
          opacity={ez(l - 70, 12)}>会认怂的 AI，才靠得住</text>
      </svg>
    </div>
  );
};

/* ============ 镜11 · 坑：出处也能编（35.5-39s） ============ */
const Scene11: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const p = ez(l - 4, 10);
  const fake = ez(l - 20, 10);
  const brk = clamp01((l - 48) / 16);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG7} />
        <rect x={140} y={170} width={800} height={92} rx={46} fill={RED7} opacity={p} />
        <text x={540} y={232} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={INK7} opacity={p}>坑说清楚</text>
        <g opacity={fake} transform={`translate(540 800) scale(${slamS(l, 20)})`}>
          <rect x={-420} y={-230} width={840} height={460} rx={16} fill="#F2E7CE" />
          <text x={0} y={-110} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill="#2A1F12">《红楼梦》</text>
          <text x={0} y={-40} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill="#6B4A12">曹雪芹 原稿 · 第八十一回</text>
          <text x={0} y={80} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={800} fill="#2A1F12">“我看过这本书”</text>
          {brk > 0 ? (
            <g opacity={brk}>
              <line x1={-420} y1={-230} x2={420} y2={230} stroke={RED7} strokeWidth={16} strokeLinecap="round" />
              <line x1={420} y1={-230} x2={-420} y2={230} stroke={RED7} strokeWidth={16} strokeLinecap="round" />
            </g>
          ) : null}
        </g>
        <text x={540} y={1180} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={900} fill={RED7}
          opacity={ez(l - 46, 12)}>这本书根本不存在</text>
        <text x={540} y={1300} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={GOLD7}
          opacity={ez(l - 64, 12)}>连“出处”都能现编</text>
      </svg>
    </div>
  );
};

/* ============ 镜12 · 金句（39-42.5s） ============ */
const Scene12: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const p = ez(l - 4, 10);
  const flip = clamp01((l - 26) / 16);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG7} />
        <text x={540} y={560} textAnchor="middle" fontFamily={FONT} fontSize={88} fontWeight={900} fill={INK7} opacity={p}
          transform={`translate(540 560) scale(${slamS(l, 4)}) translate(-540 -560)`}>它不是撒谎</text>
        <g opacity={ez(l - 26, 10)} transform={`translate(540 780) rotateX(${(1 - flip) * 90}deg)`}>
          <text x={540} y={780} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={GOLD7}>它不知道</text>
          <text x={540} y={900} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={RED7}>自己在撒谎</text>
        </g>
        <XiaoMo2 x={540} y={1300} s={1.0} mood={'happy'} f={f} arm={'idle'} op={ez(l - 50, 12)} />
      </svg>
    </div>
  );
};

/* ============ 镜13 · 收尾立正（42.5-46s） ============ */
const Scene13: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const p = ez(l - 4, 10);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG7} />
        <radialGradient id="g13" cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor="#3A2A0A" /><stop offset="100%" stopColor={BG7} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#g13)'} opacity={p} />
        <XiaoMo2 x={540} y={1000} s={1.6} mood={'happy'} f={f} arm={'up'} op={p} />
        <text x={540} y={420} textAnchor="middle" fontFamily={FONT} fontSize={76} fontWeight={900} fill={INK7} opacity={ez(l - 20, 10)}>会查、会怂、会说出处</text>
        <text x={540} y={1540} textAnchor="middle" fontFamily={FONT} fontSize={60} fontWeight={900} fill={GOLD7} opacity={ez(l - 44, 12)}>这才叫会用 AI</text>
      </svg>
    </div>
  );
};

/* ============ 镜14 · 点赞关注（46-49s） ============ */
const Scene14: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const cta: [number, string, string][] = [[12, '点赞', 'heart'], [28, '关注', 'plus'], [44, '转发', 'share'], [60, '收藏', 'star']];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BG7} />
        <text x={540} y={520} textAnchor="middle" fontFamily={FONT} fontSize={104} fontWeight={900} fill={GOLD7}>先查，再答</text>
        <text x={540} y={640} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={800} fill={INK7}>这就是对付瞎编的办法</text>
        {cta.map(([d, label, icon], i) => {
          const p = clamp01((l - d) / 12);
          if (p <= 0) return null;
          const s = 0.4 + 0.6 * (1 - Math.pow(1 - p, 3));
          const cx = 155 + i * 250;
          return (
            <g key={i} transform={`translate(${cx} 1150) scale(${s})`} opacity={Math.min(1, p * 3)}>
              <circle cx={0} cy={0} r={78} fill={i === 1 ? RED7 : (i === 3 ? GOLD7 : '#F2E7CE')} />
              {icon === 'heart' ? <path d={'M 0 -12 C -16 -32, -40 -12, 0 20 C 40 -12, 16 -32, 0 -12 Z'} fill={RED7} /> :
               icon === 'plus' ? <g><rect x={-7} y={-30} width={14} height={60} rx={7} fill={INK7} /><rect x={-30} y={-7} width={60} height={14} rx={7} fill={INK7} /></g> :
               icon === 'share' ? <path d={'M -26 6 L 10 -24 L 6 0 L 28 4 L -8 34 L -4 8 Z'} fill={BLUE7} /> :
               <path d={'M 0 -32 L 9 -10 L 32 -10 L 14 5 L 21 29 L 0 15 L -21 29 L -14 5 L -32 -10 L -9 -10 Z'} fill={BLUE7} />}
              <text x={0} y={126} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill={INK7}>{label}</text>
            </g>
          );
        })}
        <text x={540} y={1560} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={GREY7} opacity={ez(l - 80, 12)}>下集：AI 到底会不会“思考”</text>
      </svg>
    </div>
  );
};
"""

MAIN = r"""
const SUBS7: [number, number, string][] = [
  [0, 3.5, '它张嘴就说：我什么都知道'],
  [3.5, 7.0, '那我问你：孙悟空住哪儿'],
  [7.0, 10.5, '它秒答：火星'],
  [10.5, 14.5, '书上是这么写的：花果山'],
  [14.5, 18.0, '心虚了'],
  [18.0, 21.5, '答得比谁都自信，错得比谁都离谱'],
  [21.5, 25.0, '它只学过像不像，没学过对不对'],
  [25.0, 28.5, '它的词典里，没有“我不知道”'],
  [28.5, 32.0, '治法一：让它每句话都给出处'],
  [32.0, 35.5, '治法二：让它敢说我不确定'],
  [35.5, 39.0, '坑：它连出处都能现编'],
  [39.0, 42.5, '它不是撒谎，它不知道自己在撒谎'],
  [42.5, 46.0, '会查、会怂、会说出处'],
  [46.0, 49.0, '点赞关注转发收藏，下集见'],
];

const Sub7: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBS7.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const step = Math.min(0.1, ((seg[1] - seg[0]) / Math.max(1, chars.length)) * 0.82);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / step) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center', padding: '0 50px' }}>
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
  [12, 'sfx/whoosh.wav', 0.6],
  [24, 'sfx/da.mp3', 0.5],
  [32, 'sfx/da.mp3', 0.5],
  [40, 'sfx/da.mp3', 0.5],
  [48, 'sfx/da.mp3', 0.5],
  [56, 'sfx/da.mp3', 0.5],
  [112, 'sfx/hit_1750.wav', 0.85],
  [212, 'sfx/whoosh.wav', 0.8],
  [222, 'sfx/ding.mp3', 0.7],
  [318, 'sfx/ding.mp3', 0.75],
  [440, 'sfx/whoosh.wav', 0.6],
  [462, 'sfx/da.mp3', 0.6],
  [540, 'sfx/boom.wav', 0.8],
  [548, 'sfx/boom.wav', 0.8],
  [628, 'sfx/dong.mp3', 0.7],
  [750, 'sfx/ding.mp3', 0.7],
  [860, 'sfx/da.mp3', 0.7],
  [1062, 'sfx/ding.mp3', 0.8],
  [1172, 'sfx/ding.mp3', 0.6],
  [1382, 'sfx/ding.mp3', 0.5],
  [1398, 'sfx/ding.mp3', 0.5],
  [1414, 'sfx/ding.mp3', 0.5],
  [1430, 'sfx/ding.mp3', 0.5],
];

const BOUNDS7: [number, number][] = [[0, 105], [105, 210], [210, 315], [315, 435], [435, 540], [540, 645], [645, 750], [750, 855], [855, 960], [960, 1065], [1065, 1170], [1170, 1275], [1275, 1380], [1380, 1470]];

export const EP07: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < BOUNDS7.length; i++) {
    if (frame < BOUNDS7[i][1]) { seg = i; break; }
    seg = i;
  }
  const [b0] = BOUNDS7[seg];
  const l = frame - b0;
  const SC = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10, Scene11, Scene12, Scene13, Scene14];
  const Scene = SC[seg];
  const cutFlash = frame - b0 < 3 ? (1 - (frame - b0) / 3) * 0.18 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG7 }}>
      <Scene f={frame} l={l} />
      {SE7.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.42} />
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
                        "import { AbsoluteFill, useCurrentFrame, staticFile, Audio, Sequence } from 'remotion';")
    out = HEAD + head.split("*/", 1)[-1] + "\n" + SCENES + MAIN
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    print("EP07.tsx:", len(out), "字 | 镜:", out.count("const Scene"), "| XiaoMo2:", out.count("XiaoMo2"))

if __name__ == "__main__":
    main()
