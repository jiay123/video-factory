/**
 * EP03《Agent 是怎么动手干活的》· 第三级重制（照 awesome-opus5-5-videos 里的模板做）
 *
 * 模板出处（D:\视频探索\对标库\awesome-opus5-5-videos\videos.json，703条原版prompt）：
 *  ① nakazakifam-831964（讲解类·纯代码）：「画像生成AIや動画生成AIは使わず、全てコードで表現。
 *     数秒ごとに連続で異なる描写スタイルに切り替わりながら進む構成」→ 满屏代码图形，每1.5-2.5秒换一种构图
 *  ② techhalla-498547（motion·canvas）：严格配色 bg #0A0A0A / magenta #FF2BD6 / acid green #B8FF00 / white #F5F5F5，
 *     三套字体（超粗display / grotesque / mono），冲击帧印刷错位2-4px
 *  ③ prasenx-693512（motion·shader）：「every cut and transition must land on the beat」→ 每切一次配一个卡点
 *
 * 铁律（老贾 10/22）：不要AI配音，只要《重复》那条线的BGM；画面必须有内容，字图都动，图随文走。
 */
import React from 'react';
import {
  AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, interpolate, staticFile, Easing,
} from 'remotion';

const BG = '#0A0A0A';
const GOLD = '#FFC24B';
const MAGENTA = '#FF2BD6';
const GREEN = '#B8FF00';
const WHITE = '#F5F5F5';

const FONT_D = '"Noto Serif SC","Source Han Serif SC","Songti SC","SimSun",serif';
const FONT_G = '"Microsoft YaHei","PingFang SC","Noto Sans SC",sans-serif';
const FONT_M = 'Consolas,"IBM Plex Mono",monospace';

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const easeOut = (t: number) => Easing.out(Easing.cubic)(t);
const easeIO = (t: number) => Easing.inOut(Easing.cubic)(t);

type Style = 'rings' | 'bars' | 'grid' | 'cards' | 'spiral' | 'wave' | 'slash' | 'stack' | 'spiralIn';

type Shot = {
  at: number; dur: number; text: string; hi?: [number, number, string][];
  style: Style; accent?: string; label?: string;
};

/* ---------------- 26 个镜头（每 1.5-2.8 秒换一个满屏构图） ---------------- */
const SHOTS: Shot[] = [
  // 段1 它有脑子，却没有手（0-10.8）
  { at: 0.0, dur: 2.0, text: '它有脑子', hi: [[0, 3, GOLD]], style: 'rings', accent: GOLD, label: 'BRAIN' },
  { at: 2.0, dur: 2.0, text: '却没有手', hi: [[3, 3, MAGENTA]], style: 'slash', accent: MAGENTA, label: 'NO HANDS' },
  { at: 4.0, dur: 2.1, text: '手太短', hi: [[2, 2, MAGENTA]], style: 'grid', accent: MAGENTA, label: 'ARM GRID' },
  { at: 6.1, dur: 2.1, text: '够不着', hi: [[0, 3, MAGENTA]], style: 'wave', accent: MAGENTA, label: 'REACH' },
  { at: 8.2, dur: 2.6, text: '0 cm  0 工具', hi: [[0, 4, MAGENTA], [7, 3, MAGENTA]], style: 'stack', accent: MAGENTA, label: 'MISS' },
  // 段2 工具从天而降（10.8-20.6）
  { at: 10.8, dur: 2.1, text: '别急', hi: [[0, 2, GOLD]], style: 'bars', accent: GOLD, label: 'WAIT' },
  { at: 12.9, dur: 2.1, text: '给它一套工具', hi: [[2, 5, GOLD]], style: 'stack', accent: GOLD, label: 'TOOLKIT' },
  { at: 15.0, dur: 2.2, text: '扳手 放大镜 计算器', hi: [[0, 2, GOLD], [4, 3, GREEN]], style: 'grid', accent: GREEN, label: '4 TOOLS' },
  { at: 17.2, dur: 1.8, text: '哐当一声', hi: [[0, 4, MAGENTA]], style: 'spiralIn', accent: MAGENTA, label: 'CLANG' },
  { at: 19.0, dur: 1.6, text: '全落到脚边', hi: [[4, 4, GOLD]], style: 'cards', accent: GOLD, label: 'ON THE FLOOR' },
  // 段3 它自己去查（20.6-38.4）
  { at: 20.6, dur: 2.2, text: '它自己去查', hi: [[4, 3, GOLD]], style: 'rings', accent: GOLD, label: 'QUERY' },
  { at: 22.8, dur: 2.2, text: '查天气  查大事', hi: [[0, 3, GREEN], [5, 3, MAGENTA]], style: 'cards', accent: GREEN, label: 'WEATHER / NEWS' },
  { at: 25.0, dur: 2.4, text: '128 × 7 = 896', hi: [[0, 11, GOLD]], style: 'stack', accent: GOLD, label: 'MATH' },
  { at: 27.4, dur: 2.2, text: '查完一个 再查一个', hi: [[0, 4, GOLD], [5, 4, GOLD]], style: 'cards', accent: GOLD, label: 'LOOP 1' },
  { at: 29.6, dur: 2.4, text: '它变成了 Agent', hi: [[5, 5, GOLD]], style: 'spiral', accent: GOLD, label: 'AGENT' },
  { at: 32.0, dur: 2.8, text: '不只是会聊天了', hi: [[4, 5, MAGENTA]], style: 'slash', accent: MAGENTA, label: 'DOES THINGS' },
  // 段4 它还会记（38.4-48.6）
  { at: 34.8, dur: 2.0, text: '它还会记', hi: [[3, 2, GOLD]], style: 'grid', accent: GOLD, label: 'MEMORY' },
  { at: 36.8, dur: 2.2, text: '你说的话 它记在小本本上', hi: [[0, 4, GOLD], [5, 7, GREEN]], style: 'cards', accent: GREEN, label: 'NOTEBOOK' },
  { at: 39.0, dur: 2.2, text: '下次不用重新交代', hi: [[4, 6, GOLD]], style: 'bars', accent: GOLD, label: 'NO REPEAT' },
  { at: 41.2, dur: 2.4, text: '这是它和 金鱼记忆机器人 的区别', hi: [[0, 4, GOLD], [5, 7, MAGENTA]], style: 'rings', accent: MAGENTA, label: 'GOLDFISH?' },
  // 段5 最关键的是循环（48.6-58.2）
  { at: 43.6, dur: 2.2, text: '最关键的是循环', hi: [[5, 3, GOLD]], style: 'rings', accent: GOLD, label: 'THE LOOP' },
  { at: 45.8, dur: 2.2, text: '想  做  看  再想', hi: [[0, 1, GOLD], [3, 1, GREEN], [6, 1, MAGENTA], [9, 2, GOLD]], style: 'spiral', accent: GREEN, label: 'THINK-ACT-CHECK' },
  { at: 48.0, dur: 2.2, text: '不对就调整 再动一下', hi: [[0, 5, MAGENTA], [6, 4, GOLD]], style: 'wave', accent: MAGENTA, label: 'ADJUST' },
  { at: 50.2, dur: 2.2, text: '直到把事办成', hi: [[4, 5, GREEN]], style: 'spiralIn', accent: GREEN, label: 'DONE' },
  // 段6 谜（58.2-67.2）
  { at: 52.4, dur: 2.2, text: '现在 它有脑子 有手 有记忆', hi: [[5, 3, GOLD], [9, 2, GREEN], [12, 3, MAGENTA]], style: 'grid', accent: GOLD, label: 'BRAIN+HAND+MEM' },
  { at: 54.6, dur: 2.4, text: '它到底是怎么转起来的？', hi: [[0, 11, GOLD]], style: 'slash', accent: GOLD, label: 'HOW?' },
  { at: 57.0, dur: 2.6, text: '下一集 我们拆开看', hi: [[0, 3, GOLD], [5, 4, MAGENTA]], style: 'bars', accent: MAGENTA, label: 'NEXT EP' },
];

/* ---------------- 满屏构图（全部在 <svg> 里，禁止裸 <g>） ---------------- */
const Compose: React.FC<{ style: Style; accent: string; p: number; t: number; label?: string }> = ({
  style, accent, p, t, label,
}) => {
  const W = 1080, H = 1920, CX = 540, CY = 1060;
  const g: React.ReactNode[] = [];

  if (style === 'rings') {
    for (let i = 0; i < 7; i++) {
      const r = 90 + i * 105 * easeOut(clamp(p * 1.2 - i * 0.05));
      const dash = i % 2 === 0 ? '18 14' : '';
      g.push(
        <circle key={i} cx={CX} cy={CY} r={r} fill="none" stroke={i === 2 ? accent : 'rgba(245,245,245,.16)'} strokeWidth={i === 2 ? 10 : 3}
          strokeDasharray={dash} opacity={clamp(p * 2 - i * 0.15)}
          transform={`rotate(${t * (i % 2 ? -18 : 22)} ${CX} ${CY})`} />
      );
    }
    g.push(<circle key="core" cx={CX} cy={CY} r={70 * easeOut(clamp(p * 1.4))} fill={accent} opacity={0.92} />);
  }

  if (style === 'slash') {
    const off = (1 - easeIO(clamp(p))) * 700;
    g.push(<rect key="a" x={-200 + off} y={0} width={760} height={H} fill={accent} opacity={0.92} />);
    g.push(<rect key="b" x={560 - off * 0.6} y={0} width={760} height={H} fill="#111" opacity={0.96} />);
    g.push(<rect key="c" x={-200 + off} y={0} width={760} height={H} fill="none" stroke={WHITE} strokeWidth={4} opacity={0.5} />);
  }

  if (style === 'grid') {
    const cols = 12, rows = 18, cell = 74, gap = 8;
    const total = cols * rows;
    const lit = Math.floor(clamp(p * 1.3) * total);
    for (let i = 0; i < total; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      const on = i < lit;
      const dist = Math.abs(i - lit) / total;
      g.push(
        <rect key={i} x={CX - (cols * (cell + gap)) / 2 + c * (cell + gap)} y={420 + r * (cell + gap)}
          width={cell} height={cell} rx={10}
          fill={on ? accent : 'rgba(245,245,245,.07)'}
          opacity={on ? 0.92 : 1}
          transform={`scale(${on ? 1 : 0.72})`} />
      );
    }
  }

  if (style === 'bars') {
    for (let i = 0; i < 16; i++) {
      const on = i < Math.floor(clamp(p * 1.6) * 16);
      g.push(
        <rect key={i} x={0} y={300 + i * 100} width={W} height={56}
          fill={i % 4 === 0 ? accent : 'rgba(245,245,245,.10)'}
          opacity={on ? 1 : 0.25}
          transform={`translate(${(1 - easeOut(clamp(p * 1.5 - i * 0.05))) * 600} 0)`} />
      );
    }
  }

  if (style === 'cards') {
    const items = 4;
    for (let i = 0; i < items; i++) {
      const on = clamp(p * 2.2 - i * 0.42);
      const x = CX - 320 + i * 220;
      const rot = (i - 1.5) * 9;
      g.push(
        <g key={i} transform={`translate(${x} ${CY}) rotate(${rot})`} opacity={on}>
          <rect x={-96} y={-150} width={192} height={300} rx={18}
            fill={i % 2 === 0 ? accent : '#15181F'} stroke={i % 2 === 0 ? 'none' : accent} strokeWidth={4} />
          <rect x={-64} y={-110} width={128} height={12} rx={6} fill={i % 2 === 0 ? '#0A0A0A' : accent} opacity={0.85} />
          <rect x={-64} y={-76} width={96} height={12} rx={6} fill={i % 2 === 0 ? '#0A0A0A' : WHITE} opacity={0.5} />
        </g>
      );
    }
  }

  if (style === 'spiral') {
    for (let i = 0; i < 160; i++) {
      const a = i * 0.32 + t * 0.5;
      const r = 26 + i * 6.2 * easeOut(clamp(p * 1.25));
      const on = i < Math.floor(clamp(p * 1.4) * 160);
      g.push(
        <rect key={i} x={CX + Math.cos(a) * r - 9} y={CY + Math.sin(a) * r - 9} width={18} height={18} rx={4}
          fill={on ? (i % 7 === 0 ? accent : WHITE) : 'rgba(245,245,245,.10)'} opacity={on ? 0.9 : 0.5} />
      );
    }
  }

  if (style === 'spiralIn') {
    for (let i = 0; i < 130; i++) {
      const a = -i * 0.34 + t * 1.1;
      const r = 620 - i * 4.4 * easeOut(clamp(p * 1.3));
      const on = i < Math.floor(clamp(p * 1.5) * 130);
      g.push(
        <circle key={i} cx={CX + Math.cos(a) * r} cy={CY + Math.sin(a) * r} r={on ? 13 : 6}
          fill={i % 9 === 0 ? accent : WHITE} opacity={on ? 0.92 : 0.3} />
      );
    }
  }

  if (style === 'wave') {
    for (let i = 0; i < 26; i++) {
      const amp = 90 + i * 10;
      const ph = t * 2.4 + i * 0.5;
      const on = i < Math.floor(clamp(p * 1.4) * 26);
      const pts: string[] = [];
      for (let x = 0; x <= W; x += 30) {
        const y = CY + Math.sin(x / 90 + ph) * amp;
        pts.push(`${x},${y}`);
      }
      g.push(
        <polyline key={i} points={pts.join(' ')} fill="none"
          stroke={i % 6 === 0 ? accent : 'rgba(245,245,245,.18)'} strokeWidth={i % 6 === 0 ? 8 : 2}
          opacity={on ? 0.95 : 0.25} />
      );
    }
  }

  if (style === 'stack') {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const on = i < Math.floor(clamp(p * 1.5) * n);
      const w = 760 - i * 44;
      g.push(
        <rect key={i} x={CX - w / 2} y={520 + i * 108} width={w} height={78} rx={14}
          fill={i === 0 ? accent : 'rgba(245,245,245,.10)'}
          stroke={i === 0 ? 'none' : 'rgba(245,245,245,.22)'} strokeWidth={2}
          opacity={on ? 1 : 0.22}
          transform={`translate(${(1 - easeOut(clamp(p * 1.4 - i * 0.06))) * 500} 0)`} />
      );
    }
  }

  return (
    <g>
      {g}
      {label && (
        <text x={64} y={1800} fill={accent} fontSize={30} fontFamily={FONT_M} letterSpacing={6} opacity={0.85}>
          {label}
        </text>
      )}
    </g>
  );
};

/* ---------------- 顶部大字（逐字打字机 + 关键词色 + 冲击帧错位） ---------------- */
const TopText: React.FC<{ shot: Shot; from: number }> = ({ shot, from }) => {
  const frame = useCurrentFrame();
  const t = (frame - from) / 30;
  const shown = Math.max(0, t * 10);
  const chars = shot.text.split('');
  const marks = shot.hi || [];
  const colorAt = (i: number) => {
    for (const [s, l, c] of marks) if (i >= s && i < s + l) return c;
    return WHITE;
  };
  // 冲击帧：每 6 帧错位 3px（techhalla 模板的印刷错位）
  const jolt = Math.floor(t * 10) % 6 === 0 ? 3 : 0;
  return (
    <div
      style={{
        position: 'absolute', left: 64, right: 64, top: 220, zIndex: 40,
        transform: `translate(${jolt}px, ${-jolt}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_D, fontSize: 76, lineHeight: 1.22, fontWeight: 900,
          textShadow: '0 0 24px rgba(0,0,0,.9), 0 4px 0 rgba(0,0,0,.6)',
          WebkitTextStroke: '2px rgba(0,0,0,.55)', paintOrder: 'stroke fill',
        }}
      >
        {chars.map((c, i) => {
          const isLast = Math.floor(shown) === i && shown < chars.length;
          return (
            <span
              key={i}
              style={{
                color: colorAt(i),
                opacity: i < shown ? 1 : 0,
                filter: isLast ? 'blur(5px)' : 'none',
                textDecoration: marks?.some(([s, l]) => i >= s && i < s + l) ? 'underline' : 'none',
                textDecorationColor: colorAt(i),
                textUnderlineOffset: 12,
              }}
            >
              {c}
            </span>
          );
        })}
      </div>
      <div style={{ height: 2, background: 'rgba(245,245,245,.25)', marginTop: 26, width: `${Math.min(100, (shown / chars.length) * 100)}%` }} />
    </div>
  );
};

/* ---------------- 主组件 ---------------- */
export const AIKp3V3: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  let idx = 0;
  for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i].at) idx = i;
  const shot = SHOTS[idx];
  const local = t - shot.at;
  const p = clamp(local / shot.dur);
  const accent = shot.accent || GOLD;

  // 切镜白闪 + 错位（冲击帧）
  const cut = local < 0.18 ? (1 - local / 0.18) * 0.5 : 0;
  const jolt = local < 0.18 ? (1 - local / 0.18) * 10 : 0;

  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ transform: `translate(${jolt}px, ${-jolt * 0.6}px) scale(${1.04 - p * 0.04})`, transformOrigin: 'center' }}>
        <svg width="1080" height="1920" style={{ position: 'absolute', left: 0, top: 0 }}>
          <Compose style={shot.style} accent={accent} p={p} t={t} label={shot.label} />
        </svg>
      </AbsoluteFill>

      {/* 顶部大字 */}
      <TopText shot={shot} from={shot.at * 30} />

      {/* 角标 */}
      <div style={{ position: 'absolute', left: 64, top: 120, fontFamily: FONT_M, fontSize: 26, color: 'rgba(245,245,245,.55)', letterSpacing: 4 }}>
        AI 科普 · EP03 · 03
      </div>
      <div style={{ position: 'absolute', right: 64, top: 120, fontFamily: FONT_M, fontSize: 26, color: accent, letterSpacing: 3, opacity: 0.9 }}>
        {String(idx + 1).padStart(2, '0')} / {String(SHOTS.length).padStart(2, '0')}
      </div>

      {/* 冲击帧白闪 */}
      {cut > 0 && <AbsoluteFill style={{ background: `rgba(255,255,255,${cut})` }} />}

      {/* 只有BGM，没有人声 */}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.9} />
    </AbsoluteFill>
  );
};

export const KP3V3_FRAMES = 2016;
