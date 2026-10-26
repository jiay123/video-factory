/**
 * EP03《Agent 是怎么动手干活的》· 山海级重制（第三级：图随文走）
 * —— 10/22 老贾判定：「EP01/02/03 做得像动漫/小PPT，一张一张出图片；山海的视觉冲击强、节奏强，
 *    所有字和图都能动，图片跟着文案推进」。本版照山海《怛罗斯之战》的语法重做：
 *    ① 顶部两行大字逐字打字机（关键词红/金 + 下划线）  ② 满屏几何信息图，随每句文案推进一步
 *    ③ 贯穿全片的"尺子"（高度尺/计数器/环形轨道）      ④ 相机缓慢推进 + 粒子 + 冲击环
 *    ⑤ 无口播（老贾 10/22 规矩：不要 AI 配音），只有 BGM（复用《重复》那条线的 bgm_midnight）
 */
import React from 'react';
import {
  AbsoluteFill, Audio, useCurrentFrame, useVideoConfig, interpolate, staticFile, Easing,
} from 'remotion';

const GOLD = '#FFC24B';
const RED = '#FF4D4F';
const BLUE = '#4FA3FF';
const GREEN = '#5CD67A';
const CREAM = '#F4EFE3';
const INK = '#0B0F1A';

const FONT = '"Noto Serif SC","Source Han Serif SC","Songti SC","SimSun",serif';
const FONT_SANS = '"Noto Sans SC","Microsoft YaHei","PingFang SC",sans-serif';

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (t: number) => Easing.bezier(0.22, 1, 0.36, 1)(t);
const easeOut = (t: number) => Easing.out(Easing.cubic)(t);

/* ---------------- 顶部逐字打字机（山海式：关键词红/金 + 下划线 + 末字带模糊） ---------------- */
const TypedTop: React.FC<{ text: string; hi?: [number, number, string][]; from: number; cps?: number; size?: number }> = ({
  text, hi, from, cps = 9, size = 54,
}) => {
  const frame = useCurrentFrame();
  const t = (frame - from) / 30;
  const shown = Math.max(0, t * cps);
  const lines = text.split('\n');
  const marks = hi || [];
  const colorAt = (i: number) => {
    for (const [s, l, c] of marks) if (i >= s && i < s + l) return c;
    return CREAM;
  };
  let idx = 0;
  return (
    <div style={{ position: 'absolute', left: 64, right: 64, top: 96, zIndex: 40 }}>
      {lines.map((ln, li) => (
        <div
          key={li}
          style={{
            fontFamily: FONT, fontSize: size, lineHeight: 1.3, fontWeight: 800, color: CREAM,
            textShadow: '0 0 16px rgba(0,0,0,.75), 0 3px 0 rgba(0,0,0,.5)',
            WebkitTextStroke: '1.5px rgba(0,0,0,.45)', paintOrder: 'stroke fill',
            marginBottom: 6,
          }}
        >
          {ln.split('').map((c) => {
            const i = idx++;
            const isLast = Math.floor(shown) === i && shown < ln.length;
            return (
              <span
                key={i}
                style={{
                  color: colorAt(i),
                  opacity: i < shown ? 1 : 0,
                  filter: isLast ? 'blur(4px)' : 'none',
                  textDecoration: marks?.some(([s, l]) => i >= s && i < s + l) ? 'underline' : 'none',
                  textDecorationColor: colorAt(i),
                  textUnderlineOffset: 9,
                }}
              >
                {c}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/* ---------------- 背景：渐变 + 光晕 + 粒子 + 相机推进 ---------------- */
const Backdrop: React.FC<{ a: number; b: number; p: number }> = ({ a, b, p }) => {
  const frame = useCurrentFrame();
  const dust = [];
  for (let i = 0; i < 34; i++) {
    const x = (i * 131 + frame * (0.5 + (i % 4) * 0.22)) % 1080;
    const y = (i * 97 + frame * 0.35) % 1920;
    dust.push(
      <div key={i} style={{ position: 'absolute', left: x, top: y, width: 3, height: 3, borderRadius: 2, background: 'rgba(255,235,180,.4)' }} />
    );
  }
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: `linear-gradient(170deg, ${a} 0%, ${b} 55%, #070A12 100%)` }}>
      <div
        style={{
          position: 'absolute', left: '50%', top: '42%', width: 900, height: 900, marginLeft: -450, marginTop: -450,
          background: 'radial-gradient(circle, rgba(120,160,255,.20) 0%, rgba(0,0,0,0) 62%)',
          transform: `scale(${1 + p * 0.12})`,
        }}
      />
      {dust}
      <AbsoluteFill style={{ transform: `scale(${1.02 + p * 0.05}) translateY(${-p * 14}px)`, transformOrigin: 'center center' }} />
    </AbsoluteFill>
  );
};

/* ---------------- 通用小件 ---------------- */
const Shock: React.FC<{ x: number; y: number; start: number; color?: string; max?: number }> = ({
  x, y, start, color = GOLD, max = 520,
}) => {
  const frame = useCurrentFrame();
  const t = clamp((frame - start) / 22);
  if (t <= 0 || t >= 1) return null;
  return (
    <svg width="1080" height="1920" style={{ position: 'absolute', left: 0, top: 0, zIndex: 30 }}>
      <circle cx={x} cy={y} r={t * max} fill="none" stroke={color} strokeWidth={6 * (1 - t)} opacity={1 - t} />
    </svg>
  );
};

/* ---------------- 六幕：每幕 3-4 个"推进步" ---------------- */
type Step = {
  at: number; dur: number; text: string; hi?: [number, number, string][];
  draw: (p: number, t: number) => React.ReactNode;
};

const BOTTLE = (x: number, y: number, s: number, cap: number) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-46} y={0} width={92} height={210} rx={16} fill="#2E6BE6" opacity={0.92} />
    <rect x={-30} y={30} width={60} height={70} rx={8} fill="#8FB8FF" opacity={0.35} />
    <rect x={-20} y={-34} width={40} height={38} rx={8} fill={cap} />
  </g>
);

const MO = (x: number, y: number, s: number, arm: number) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={70} ry={64} fill="#4A7BE8" />
    <circle cx={-22} cy={-12} r={17} fill="#fff" />
    <circle cx={22} cy={-12} r={17} fill="#fff" />
    <circle cx={-20} cy={-10} r={8} fill="#0B0F1A" />
    <circle cx={20} cy={-10} r={8} fill="#0B0F1A" />
    <rect x={-6} y={-84} width={5} height={26} rx={2} fill="#4A7BE8" />
    <circle cx={-4} cy={-88} r={8} fill={RED} />
    <rect x={-96} y={-6} width={arm} height={20} rx={10} fill="#4A7BE8" />
    <rect x={96 - arm} y={-6} width={arm} height={20} rx={10} fill="#4A7BE8" />
    <ellipse cx={0} cy={58} rx={52} ry={14} fill="#3A63C0" opacity={0.5} />
  </g>
);

const ACTS: { sky: [string, string]; steps: Step[] }[] = [
  {
    sky: ['#12203C', '#1B2E52'],
    steps: [
      {
        at: 0, dur: 3.1, text: '它有脑子，\n却没有手', hi: [[0, 3, GOLD]],
        draw: (p, t) => {
          const s = easeOut(clamp(t / 12));
          return (
            <g>
              <g transform={`translate(540 1120) scale(${0.6 + s * 0.4})`} opacity={clamp(t / 10)}>
                {MO(0, 0, 1.1, 78)}
              </g>
              {BOTTLE(900, 900, 0.7 + s * 0.3, GOLD)}
            </g>
          );
        },
      },
      {
        at: 3.1, dur: 3.0, text: '手太短，够不着', hi: [[3, 2, RED]],
        draw: (p, t) => {
          const g = easeOut(clamp(t / 14));
          const gap = 300 - g * 150;
          return (
            <g>
              <g transform="translate(540 1120) scale(1.1)" opacity={1}>
                {MO(0, 0, 1, 78)}
              </g>
              {BOTTLE(900, 900, 1, GOLD)}
              {/* 够不着的虚线 + 标尺（山海"尺子"） */}
              <line x1={700} y1={1090} x2={860} y2={1090} stroke={RED} strokeWidth={4} strokeDasharray="14 12" opacity={clamp(t / 8)} />
              <text x={780} y={1060} fill={RED} fontSize={40} fontFamily={FONT_SANS} textAnchor="middle" opacity={clamp((t - 6) / 8)}>够不着</text>
              <text x={780} y={1160} fill={GOLD} fontSize={52} fontFamily={FONT_SANS} textAnchor="middle" opacity={clamp((t - 10) / 8)}>{Math.round(gap)}cm</text>
            </g>
          );
        },
      },
      {
        at: 6.1, dur: 3.0, text: 'AI 有脑子，\n却没有手', hi: [[3, 5, GOLD], [9, 3, RED]],
        draw: (p, t) => {
          const s = easeOut(clamp(t / 12));
          return (
            <g>
              <g transform={`translate(360 1150) scale(${1.2 + s * 0.15})`}>
                {MO(0, 0, 1, 78)}
              </g>
              {BOTTLE(880, 940, 1.1, GOLD)}
              <text x={540} y={1420} fill={GOLD} fontSize={70} fontFamily={FONT} textAnchor="middle" opacity={clamp((t - 6) / 8)}>0 手</text>
              <text x={540} y={1520} fill={RED} fontSize={56} fontFamily={FONT} textAnchor="middle" opacity={clamp((t - 12) / 8)}>0 工具</text>
            </g>
          );
        },
      },
    ],
  },
  {
    sky: ['#1B1430', '#3A2450'],
    steps: [
      {
        at: 9.04, dur: 3.4, text: '别急，\n给它一套工具', hi: [[4, 5, GOLD]],
        draw: (p, t) => {
          const drop = easeOut(clamp(t / 16));
          const y = -260 + drop * 640;
          return (
            <g>
              <g transform={`translate(540 ${y})`} opacity={clamp(t / 6)}>
                <rect x={-190} y={-120} width={380} height={240} rx={18} fill="#B98A4B" />
                <rect x={-190} y={-120} width={380} height={60} rx={18} fill="#D9AE66" />
                <rect x={-26} y={-40} width={52} height={80} rx={8} fill="#6B4A22" />
              </g>
            </g>
          );
        },
      },
      {
        at: 12.44, dur: 3.4, text: '扳手、放大镜、\n计算器', hi: [[0, 2, GOLD], [4, 3, BLUE]],
        draw: (p, t) => {
          const items: [string, string, number, number][] = [
            ['🔧', '修', -330, 1240], ['🔍', '查', -330, 1400], ['🧮', '算', 330, 1240], ['📝', '记', 330, 1400],
          ];
          return (
            <g>
              {items.map(([ic, lb, x, y], i) => {
                const on = clamp((t - i * 3) / 8);
                return (
                  <g key={i} opacity={on} transform={`translate(${x} ${y - (1 - easeOut(on)) * 220})`}>
                    <circle r={56} fill={['#FF4D4F', '#4FA3FF', '#FFC24B', '#5CD67A'][i]} opacity={0.92} />
                    <text y={16} fontSize={54} textAnchor="middle" fill="#0B0F1A" fontFamily={FONT_SANS} fontWeight={800}>{lb}</text>
                  </g>
                );
              })}
            </g>
          );
        },
      },
      {
        at: 15.84, dur: 4.0, text: '哐当一声，\n全落到脚边', hi: [[5, 5, RED]],
        draw: (p, t) => {
          const shake = t > 4 ? Math.sin((t - 4) * 3) * 6 * clamp(1 - (t - 4) / 10) : 0;
          const items: [string, number, number, string][] = [
            ['修', -330, 1400, '#FF4D4F'], ['查', -330, 1240, '#4FA3FF'], ['算', 330, 1240, '#FFC24B'], ['记', 330, 1400, '#5CD67A'],
          ];
          return (
            <g transform={`translate(${shake} 0)`}>
              {items.map(([lb, x, y, c], i) => {
                const on = clamp((t - i * 2) / 6);
                return (
                  <g key={i} opacity={on} transform={`translate(${x} ${y})`}>
                    <circle r={52} fill={c} opacity={0.92} />
                    <text y={16} fontSize={50} textAnchor="middle" fill="#0B0F1A" fontFamily={FONT_SANS} fontWeight={800}>{lb}</text>
                  </g>
                );
              })}
              <Shock x={540} y={1300} start={8} color={GOLD} max={620} />
            </g>
          );
        },
      },
    ],
  },
  {
    sky: ['#0E2A2A', '#123A45'],
    steps: [
      {
        at: 19.86, dur: 5.0, text: '它自己去查：\n天气、大事、算数', hi: [[5, 3, GOLD], [8, 2, BLUE]],
        draw: (p, t) => {
          const cards: [string, string, string][] = [
            ['查天气', '明天 晴 26°', '#4FA3FF'],
            ['查大事', 'AI 又进化了', '#FF4D4F'],
            ['做计算', '128 × 7 = 896', '#FFC24B'],
          ];
          return (
            <g>
              {cards.map(([q, a, c], i) => {
                const on = clamp((t - i * 5) / 10);
                const y = 760 + i * 230;
                return (
                  <g key={i} opacity={on} transform={`translate(${540} ${y + (1 - easeOut(on)) * 120})`}>
                    <rect x={-420} y={-92} width={840} height={184} rx={22} fill="rgba(255,255,255,.07)" stroke={c} strokeWidth={4} />
                    <rect x={-420} y={-92} width={10} height={184} rx={5} fill={c} />
                    <text x={-380} y={-16} fill={c} fontSize={44} fontFamily={FONT} fontWeight={700}>{q}</text>
                    <text x={-380} y={56} fill={CREAM} fontSize={40} fontFamily={FONT_SANS}>{a}</text>
                  </g>
                );
              })}
            </g>
          );
        },
      },
      {
        at: 24.9, dur: 4.0, text: '查完一个，\n再查一个', hi: [[4, 5, GOLD]],
        draw: (p, t) => {
          const n = Math.floor(clamp(t / 5) * 3) + 1;
          return (
            <g>
              {[0, 1, 2].map((i) => (
                <g key={i} opacity={i < n ? 1 : 0.2} transform={`translate(${300 + i * 240} 900)`}>
                  <rect x={-100} y={-140} width={200} height={280} rx={20} fill="rgba(255,255,255,.08)" stroke={GOLD} strokeWidth={3} />
                  <rect x={-70} y={-100} width={140} height={10} rx={5} fill={GOLD} opacity={0.7} />
                  <rect x={-70} y={-70} width={110} height={10} rx={5} fill={CREAM} opacity={0.4} />
                </g>
              ))}
              <text x={540} y={1180} fill={GOLD} fontSize={80} fontFamily={FONT} textAnchor="middle" opacity={clamp((t - 6) / 6)}>×{n}</text>
            </g>
          );
        },
      },
      {
        at: 28.9, dur: 4.0, text: '它变成了 Agent', hi: [[5, 5, GOLD]],
        draw: (p, t) => {
          const s = easeOut(clamp(t / 10));
          return (
            <g>
              <g transform={`translate(540 980) scale(${0.7 + s * 0.5})`} opacity={clamp(t / 8)}>
                {MO(0, 0, 1.2, 120)}
              </g>
              <text x={540} y={1420} fill={GOLD} fontSize={112} fontFamily={FONT_SANS} fontWeight={900} textAnchor="middle"
                opacity={clamp((t - 4) / 8)} style={{ transform: `scale(${1 + (1 - clamp((t - 4) / 8)) * 0.4})` }}>Agent</text>
              <Shock x={540} y={1000} start={4} color={GOLD} max={700} />
            </g>
          );
        },
      },
      {
        at: 32.9, dur: 4.8, text: '它不只是会聊天了', hi: [[7, 5, RED]],
        draw: (p, t) => (
          <g>
            <g transform="translate(540 1080) scale(1.25)" opacity={0.95}>
              {MO(0, 0, 1, 120)}
            </g>
            <text x={540} y={1400} fill={CREAM} fontSize={60} fontFamily={FONT} textAnchor="middle" opacity={clamp((t - 4) / 8)}>会聊天 → 会干活</text>
          </g>
        ),
      },
    ],
  },
  {
    sky: ['#2A1E2E', '#40283C'],
    steps: [
      {
        at: 37.66, dur: 3.6, text: '它还会记', hi: [[3, 2, GOLD]],
        draw: (p, t) => {
          const cells = 12;
          const on = Math.floor(clamp(t / 4) * cells);
          const items = [];
          for (let i = 0; i < cells; i++) {
            items.push(
              <rect key={i} x={-330 + (i % 6) * 120} y={-140 + Math.floor(i / 6) * 130} width={96} height={96} rx={14}
                fill={i < on ? GOLD : 'rgba(255,255,255,.10)'} opacity={i < on ? 0.95 : 1} />
            );
          }
          return <g transform="translate(540 980)">{items}</g>;
        },
      },
      {
        at: 41.26, dur: 3.6, text: '你说的话，\n它记在小本本上', hi: [[6, 3, BLUE]],
        draw: (p, t) => {
          const memos = ['你喜欢猫', '你在上海', '上次聊爬山'];
          return (
            <g>
              {memos.map((m, i) => {
                const on = clamp((t - i * 4) / 8);
                return (
                  <g key={i} opacity={on} transform={`translate(${200 + i * 340} 900) rotate(${(i - 1) * 6})`}>
                    <rect x={-140} y={-190} width={280} height={380} rx={16} fill="rgba(255,194,75,.13)" stroke={GOLD} strokeWidth={3} />
                    <rect x={-100} y={-150} width={200} height={10} rx={5} fill={GOLD} opacity={0.8} />
                    <rect x={-100} y={-118} width={160} height={10} rx={5} fill={CREAM} opacity={0.45} />
                    <text y={20} fill={GOLD} fontSize={40} fontFamily={FONT} textAnchor="middle">{m}</text>
                  </g>
                );
              })}
            </g>
          );
        },
      },
      {
        at: 44.86, dur: 3.2, text: '下次不用重新交代', hi: [[6, 6, GOLD]],
        draw: (p, t) => (
          <g>
            <text x={540} y={900} fill={CREAM} fontSize={64} fontFamily={FONT} textAnchor="middle" opacity={clamp(t / 8)}>不用重新交代</text>
            <text x={540} y={1060} fill={GOLD} fontSize={84} fontFamily={FONT} textAnchor="middle" opacity={clamp((t - 6) / 8)}>0 重复</text>
            <Shock x={540} y={1000} start={6} color={GOLD} max={600} />
          </g>
        ),
      },
    ],
  },
  {
    sky: ['#101A33', '#1A2A4A'],
    steps: [
      {
        at: 48.09, dur: 3.4, text: '最关键的是循环', hi: [[5, 3, GOLD]],
        draw: (p, t) => {
          const rot = (t / 60) * 360;
          return (
            <g transform="translate(540 1000)">
              <circle r={250} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth={10} />
              <circle r={250} fill="none" stroke={GOLD} strokeWidth={10} strokeDasharray="60 40" strokeDashoffset={-rot} opacity={0.9} />
              {[['想', 0, BLUE], ['做', 90, GOLD], ['看', 180, GREEN], ['再想', 270, RED]].map(([lb, ang, c], i) => {
                const on = clamp((t - i * 3) / 6);
                const rad = (ang * Math.PI) / 180;
                return (
                  <g key={i} opacity={on} transform={`translate(${Math.cos(rad) * 250} ${Math.sin(rad) * 250})`}>
                    <circle r={62} fill={c as string} />
                    <text y={18} fontSize={44} textAnchor="middle" fill="#0B0F1A" fontFamily={FONT} fontWeight={800}>{lb as string}</text>
                  </g>
                );
              })}
            </g>
          );
        },
      },
      {
        at: 51.49, dur: 3.2, text: '不对就调整，\n再动一下', hi: [[4, 4, RED]],
        draw: (p, t) => {
          const rot = (t / 30) * 360;
          return (
            <g transform="translate(540 1000)">
              <circle r={250} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth={10} />
              <circle r={250} fill="none" stroke={GOLD} strokeWidth={10} strokeDasharray="60 40" strokeDashoffset={-rot} opacity={0.95} />
              <circle r={62} cy={-250} fill={RED} />
              <text x={540} y={1420} fill={RED} fontSize={64} fontFamily={FONT} textAnchor="middle" opacity={clamp(t / 8)}>转圈</text>
            </g>
          );
        },
      },
      {
        at: 54.69, dur: 3.2, text: '直到把事办成', hi: [[4, 5, GREEN]],
        draw: (p, t) => {
          const s = easeOut(clamp(t / 10));
          return (
            <g>
              <g transform={`translate(540 1000) scale(${1 - s * 0.35})`} opacity={1 - s * 0.35}>
                <circle r={250} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth={10} />
              </g>
              <circle cx={540} cy={1000} r={110} fill={GREEN} opacity={clamp((t - 4) / 6)} />
              <text x={540} y={1040} fill="#0B0F1A" fontSize={96} textAnchor="middle" fontFamily={FONT_SANS} fontWeight={900} opacity={clamp((t - 4) / 6)}>✓</text>
              <text x={540} y={1360} fill={GREEN} fontSize={72} fontFamily={FONT} textAnchor="middle" opacity={clamp((t - 6) / 6)}>办成了</text>
              <Shock x={540} y={1000} start={4} color={GREEN} max={700} />
            </g>
          );
        },
      },
    ],
  },
  {
    sky: ['#2E1A18', '#4A2A1E'],
    steps: [
      {
        at: 57.94, dur: 3.0, text: '现在，它有脑子、\n有手、有记忆', hi: [[8, 2, GOLD], [12, 2, BLUE]],
        draw: (p, t) => {
          const items: [string, string][] = [['🧠', '脑子'], ['🤚', '手'], ['📓', '记忆']];
          return (
            <g>
              {items.map(([ic, lb], i) => {
                const on = clamp((t - i * 3) / 6);
                return (
                  <g key={i} opacity={on} transform={`translate(${210 + i * 330} 960)`}>
                    <circle r={86} fill={['#FFC24B', '#4FA3FF', '#5CD67A'][i]} opacity={0.9} />
                    <text y={18} fontSize={70} textAnchor="middle" fill="#0B0F1A" fontFamily={FONT_SANS} fontWeight={800}>{lb}</text>
                  </g>
                );
              })}
            </g>
          );
        },
      },
      {
        at: 60.94, dur: 3.0, text: '可还有一个谜：\n它到底怎么转起来的？', hi: [[6, 3, RED], [12, 8, GOLD]],
        draw: (p, t) => {
          const s = easeOut(clamp(t / 8));
          return (
            <g>
              <text x={540} y={1020} fill={GOLD} fontSize={340} fontFamily={FONT} textAnchor="middle"
                style={{ transform: `scale(${1.4 - s * 0.4})`, opacity: clamp(t / 5) }}>?</text>
              <Shock x={540} y={960} start={2} color={GOLD} max={760} />
            </g>
          );
        },
      },
      {
        at: 63.94, dur: 3.2, text: '下一集，\n我们拆开看', hi: [[4, 4, GOLD]],
        draw: (p, t) => (
          <g>
            <rect x={210} y={860} width={660} height={220} rx={110} fill="none" stroke={GOLD} strokeWidth={6} opacity={clamp(t / 8)} />
            <text x={540} y={990} fill={GOLD} fontSize={76} fontFamily={FONT} textAnchor="middle" opacity={clamp((t - 4) / 8)}>下一集 · 拆开看</text>
          </g>
        ),
      },
    ],
  },
];

/* ---------------- 主组件 ---------------- */
export const AIKp3V2: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  // 当前幕 / 当前步
  let actIdx = 0;
  for (let i = 0; i < ACTS.length; i++) if (t >= ACTS[i].steps[0].at) actIdx = i;
  const act = ACTS[actIdx];
  let stepIdx = 0;
  for (let i = 0; i < act.steps.length; i++) if (t >= act.steps[i].at) stepIdx = i;
  const step = act.steps[stepIdx];
  const local = t - step.at;

  // 幕进度（相机推进用）
  const actStart = act.steps[0].at;
  const actEnd = act.steps[act.steps.length - 1].at + act.steps[act.steps.length - 1].dur;
  const actP = clamp((t - actStart) / Math.max(0.1, actEnd - actStart));

  return (
    <AbsoluteFill style={{ background: INK }}>
      <Backdrop a={act.sky[0]} b={act.sky[1]} p={actP} />
      <AbsoluteFill>
        {/* 🚨 裸 <g> 必须包 <svg>（10/21 踩过一次：整片空白），这次不踩第二次 */}
        <svg width="1080" height="1920" style={{ position: 'absolute', left: 0, top: 0 }}>
          {step.draw(clamp(local / step.dur), local)}
        </svg>
      </AbsoluteFill>
      <TypedTop text={step.text} hi={step.hi} from={step.at * 30} />
      {/* 顶部角标 */}
      <div style={{ position: 'absolute', left: 64, top: 48, fontFamily: FONT_SANS, fontSize: 24, color: 'rgba(244,239,227,.6)' }}>
        AI 科普 · EP03
      </div>
      {/* 只有BGM，没有人声（老贾10/22规矩） */}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={0.9} />
    </AbsoluteFill>
  );
};
