/**
 * 《最强AI正面对决，谁更强？》 —— 山海《怛罗斯之战》1:1 复刻版（AI圈）
 * 规格照抄对标：16:9 1920x1080 / 无口播 / 只有BGM / 顶部两行大字逐字打字机
 * 关键词金黄+红色+下划线 / 几何剪纸信息图动画 / 每幕一个渐变底色 / 5个大分镜
 * 数字全部实测（2026-10-22 GitHub API + 官方定价页），来源见 aiWarFacts.ts
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
  Easing,
} from 'remotion';

/* ---------------- 配色 ---------------- */
const GOLD = '#FFC24B';
const RED = '#E5484D';
const BLUE = '#4FA3FF';
const GREEN = '#59C36A';
const INK = '#1b1a17';

const FONT = '"Noto Serif SC","Source Han Serif SC","Songti SC","SimSun",serif';
const FONT_SANS = '"Noto Sans SC","Microsoft YaHei","PingFang SC",sans-serif';

/* ---------------- 工具 ---------------- */
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (t: number) => Easing.bezier(0.22, 1, 0.36, 1)(t);
const easeOut = (t: number) => Easing.out(Easing.cubic)(t);
const easeIn = (t: number) => Easing.in(Easing.cubic)(t);

/** 打字机文字：一行一行，字符逐个显现，最后一个字带轻微模糊（照抄山海效果） */
const TypedLine: React.FC<{
  text: string;
  hi?: [number, number, string][]; // [起始下标, 长度, 颜色]
  start: number;   // 起始帧
  cps: number;     // 每秒字数
  size?: number;
  align?: 'left' | 'center';
  x?: number;
  y?: number;
  width?: number;
  fade?: number;
}> = ({ text, hi, start, cps,   size = 62, align = 'left', x = 90, y = 60, width = 1300, fade = 8 }) => {
  const frame = useCurrentFrame();
  const elapsed = (frame - start) / 30;
  const shown = Math.max(0, elapsed * cps);
  const marks = hi || [];
  const inColor = (i: number) => {
    for (const [s, l, c] of marks) if (i >= s && i < s + l) return c;
    return '#FFFFFF';
  };
  const chars = text.split('');
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width,
        fontFamily: FONT, fontSize: size, lineHeight: 1.32, fontWeight: 700,
        textAlign: align, color: '#fff',
        textShadow: '0 0 14px rgba(0,0,0,.55), 0 4px 0 rgba(0,0,0,.40), 0 0 2px rgba(0,0,0,.9)',
        WebkitTextStroke: '2.5px rgba(0,0,0,.55)',
        paintOrder: 'stroke fill',
        opacity: clamp((frame - start) / fade),
      }}
    >
      {chars.map((c, i) => {
        const isLast = Math.floor(shown) === i && shown < chars.length;
        const vis = i < shown;
        return (
          <span
            key={i}
            style={{
              color: inColor(i),
              opacity: vis ? 1 : 0,
              filter: isLast ? 'blur(3px)' : 'none',
              textDecoration: marks?.some(([s, l]) => i >= s && i < s + l) ? 'underline' : 'none',
              textDecorationColor: inColor(i),
              textUnderlineOffset: 8,
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
};

/** 右上角滚动计数器（山海那套年份滚动） */
const Counter: React.FC<{ items: { at: number; to: number; label: string }[]; x?: number; y?: number }> = ({
  items, x = 1560, y = 56,
}) => {
  const frame = useCurrentFrame();
  let cur = items[items.length - 1];
  for (const it of items) {
    if (frame >= it.at) {
      cur = it;
      break;
    }
  }
  const prev = items.indexOf(cur) > 0 ? items[items.indexOf(cur) - 1] : { at: 0, to: 0, label: '' };
  const local = clamp((frame - cur.at) / 30);
  const val = Math.round(prev.to + (cur.to - prev.to) * easeOut(local));
  return (
    <div style={{ position: 'absolute', left: x, top: y, textAlign: 'right', fontFamily: FONT_SANS }}>
      <div style={{ fontSize: 46, fontWeight: 800, color: GOLD, textShadow: '0 0 12px rgba(0,0,0,.6)' }}>
        {val.toLocaleString('en-US')}
      </div>
      <div style={{ fontSize: 22, color: '#fff', opacity: 0.85, textShadow: '0 0 8px rgba(0,0,0,.7)' }}>
        {cur.label}
      </div>
    </div>
  );
};

/** 势力版图色块：生长动画 */
const Blob: React.FC<{ x: number; y: number; w: number; h: number; color: string; start: number; label: string }> = ({
  x, y, w, h, color, start, label,
}) => {
  const frame = useCurrentFrame();
  const t = clamp((frame - start) / 68);
  const s = easeOut(t);
  const pts = '0,120 60,40 150,10 240,60 250,150 180,220 60,210';
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: t > 0 ? 1 : 0 }}>
      <svg width={w} height={h} viewBox="0 0 250 230" style={{ transform: `scale(${0.2 + s * 0.8})`, transformOrigin: 'center' }}>
        <polygon points={pts} fill={color} opacity={0.9} stroke="rgba(0,0,0,.25)" strokeWidth={3} />
      </svg>
      <div
        style={{
          position: 'absolute', left: 0, top: h / 2 - 26, width: w, textAlign: 'center',
          fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#fff',
          textShadow: '0 0 10px rgba(0,0,0,.8)', opacity: clamp((frame - start - 8) / 10),
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** 路径推进箭头 */
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color: string; start: number; label?: string; dur?: number }> = ({
  x1, y1, x2, y2, color, start, label, dur = 22,
}) => {
  const frame = useCurrentFrame();
  const t = clamp((frame - start) / dur);
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <div
      style={{
        position: 'absolute', left: x1, top: y1, width: len, height: 6,
        transformOrigin: 'left center', transform: `rotate(${ang}deg)`,
        opacity: t > 0 ? 1 : 0,
      }}
    >
      <div style={{ width: `${t * 100}%`, height: 6, background: color, borderRadius: 3, position: 'relative' }}>
        <div
          style={{
            position: 'absolute', right: -2, top: -8, width: 0, height: 0,
            borderTop: '11px solid transparent', borderBottom: '11px solid transparent',
            borderLeft: `18px solid ${color}`,
          }}
        />
      </div>
      {label && (
        <div
          style={{
            position: 'absolute', left: len / 2, top: -40, transform: 'translateX(-50%)',
            fontFamily: FONT, fontSize: 30, fontWeight: 700, color, whiteSpace: 'nowrap',
            textShadow: '0 0 10px rgba(0,0,0,.8)', opacity: clamp((frame - start - dur * 0.6) / 8),
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

/** 军队方块阵：逐格出现 + 轻微呼吸 */
const Army: React.FC<{ x: number; y: number; cols: number; rows: number; cell: number; color: string; start: number; label?: string }> = ({
  x, y, cols, rows, cell, color, start, label,
}) => {
  const frame = useCurrentFrame();
  const t = clamp((frame - start) / 52);
  const total = cols * rows;
  const appear = Math.floor(t * total);
  const items: React.ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    const on = i < appear;
    const breathe = on ? 1 + Math.sin((frame - start) / 6 + i * 0.6) * 0.06 : 1;
    items.push(
      <div
        key={i}
        style={{
          position: 'absolute', left: c * (cell + 6), top: r * (cell + 6),
          width: cell, height: cell, background: color, borderRadius: 3,
          opacity: on ? 0.95 : 0, transform: `scale(${on ? breathe : 0.2})`,
          boxShadow: '0 2px 6px rgba(0,0,0,.35)',
        }}
      />
    );
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: t > 0 ? 1 : 0 }}>
      {items}
      {label && (
        <div style={{ fontFamily: FONT, fontSize: 26, color: '#fff', marginTop: rows * (cell + 6) + 12, textShadow: '0 0 8px rgba(0,0,0,.9)', width: cols * (cell + 6) }}>
          {label}
        </div>
      )}
    </div>
  );
};

/** 大数字砸屏（山海那个"几千"大红字） */
const BigNumber: React.FC<{ x: number; y: number; text: string; color: string; size?: number; start: number; label?: string }> = ({
  x, y, text, color, size = 150, start, label,
}) => {
  const frame = useCurrentFrame();
  const t = clamp((frame - start) / 42);
  const s = interpolate(easeOut(t), [0, 1], [2.1, 1]);
  const o = clamp(t * 2);
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: o, textAlign: 'center' }}>
      <div
        style={{
          fontFamily: FONT_SANS, fontSize: size, fontWeight: 900, color,
          transform: `scale(${s})`, textShadow: '0 0 26px rgba(0,0,0,.75), 0 6px 0 rgba(0,0,0,.4)',
          letterSpacing: -2,
        }}
      >
        {text}
      </div>
      {label && (
        <div style={{ fontFamily: FONT, fontSize: 34, color: '#fff', textShadow: '0 0 10px rgba(0,0,0,.8)' }}>{label}</div>
      )}
    </div>
  );
};

/** 旗帜（结尾幕：唐旗与黑旗） */
const Flag: React.FC<{ x: number; y: number; color: string; label: string; start: number }> = ({ x, y, color, label, start }) => {
  const frame = useCurrentFrame();
  const t = clamp((frame - start) / 52);
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: t }}>
      <div style={{ width: 6, height: 130, background: '#3a2f26' }} />
      <div
        style={{
          position: 'absolute', left: 6, top: 4, width: 92, height: 64, background: color,
          clipPath: 'polygon(0 0, 100% 12%, 88% 50%, 100% 88%, 0 100%)',
          animation: `none`,
          transform: `skewY(${Math.sin(frame / 9) * 1.6}deg)`,
        }}
      />
      <div style={{ fontFamily: FONT, fontSize: 26, color: '#fff', marginTop: 6, width: 140, textShadow: '0 0 8px rgba(0,0,0,.8)' }}>
        {label}
      </div>
    </div>
  );
};

/** 剪纸山 + 太阳 + 尘埃 */
const Scenery: React.FC<{ sky: string[]; sunY?: number; sunX?: number; dim?: number }> = ({ sky, sunY = 300, sunX = 960, dim = 0 }) => {
  const frame = useCurrentFrame();
  const dust = [];
  for (let i = 0; i < 26; i++) {
    const x = (i * 137 + frame * (0.4 + (i % 3) * 0.25)) % 1960;
    const y = (i * 91 + frame * 0.22) % 900;
    dust.push(
      <div key={i} style={{ position: 'absolute', left: x, top: y, width: 3, height: 3, borderRadius: 2, background: 'rgba(255,240,200,.55)' }} />
    );
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 58%, ${sky[2]} 100%)` }} />
      {/* 太阳 */}
      <div
        style={{
          position: 'absolute', left: sunX - 110, top: sunY - 110, width: 220, height: 220, borderRadius: 999,
          background: 'radial-gradient(circle, #FFF3C4 0%, #F7D07A 45%, rgba(247,208,122,0) 72%)',
          transform: `scale(${1 + Math.sin(frame / 26) * 0.03})`,
        }}
      />
      {/* 远山 */}
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 420, opacity: 0.55 }}>
        <path d="M0 260 L150 120 L300 220 L430 90 L600 240 L760 150 L900 250 L1080 110 L1260 230 L1450 130 L1620 240 L1800 160 L1920 230 L1920 400 L0 400 Z" fill={sky[3]} />
      </svg>
      {/* 中山 */}
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 520, opacity: 0.8 }}>
        <path d="M0 300 L220 160 L400 270 L560 120 L760 280 L960 170 L1160 290 L1360 150 L1560 270 L1760 180 L1920 260 L1920 400 L0 400 Z" fill={sky[4]} />
      </svg>
      {/* 近山 */}
      <svg width="1920" height="1080" style={{ position: 'absolute', left: 0, top: 640, opacity: 0.95 }}>
        <path d="M0 280 L260 190 L520 270 L820 170 L1120 280 L1400 200 L1700 290 L1920 220 L1920 440 L0 440 Z" fill={sky[5]} />
      </svg>
      {dust}
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(8,6,10,${dim})` }} />}
    </AbsoluteFill>
  );
};

/** 超大标题砸下（"谁更强？"） */
const BigTitle: React.FC<{ text: string; start: number; y?: number; size?: number }> = ({ text, start, y = 300, size = 210 }) => {
  const frame = useCurrentFrame();
  const t = clamp((frame - start) / 47);
  const s = interpolate(easeOut(t), [0, 1], [2.6, 1]);
  const o = clamp(t * 3);
  const ring = clamp((frame - start - 10) / 68);
  return (
    <div style={{ position: 'absolute', left: 0, top: y, width: 1920, textAlign: 'center', opacity: o }}>
      {ring > 0 && ring < 1 && (
        <div
          style={{
            position: 'absolute', left: 960 - ring * 700, top: 100 - ring * 100,
            width: ring * 1400, height: ring * 200, borderRadius: 999,
            border: `6px solid rgba(255,194,75,${(1 - ring) * 0.9})`,
          }}
        />
      )}
      <div
        style={{
          fontFamily: FONT, fontSize: size, fontWeight: 900, transform: `scale(${s})`,
          color: GOLD, letterSpacing: 6,
          textShadow: '0 0 40px rgba(0,0,0,.8), 0 8px 0 rgba(0,0,0,.45), 0 0 4px #000',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** 骆驼剪影队列（结尾幕） */
const Camels: React.FC<{ y: number; start: number }> = ({ y, start }) => {
  const frame = useCurrentFrame();
  const t = clamp((frame - start) / 78);
  const x = -260 + t * 1500;
  const camel = (i: number) => (
    <svg key={i} width="90" height="70" style={{ position: 'absolute', left: i * 150, top: 0 }}>
      <path d="M20 60 L24 34 Q34 22 44 30 L52 16 Q60 6 68 18 L74 30 L86 34 L86 60 L74 60 L72 48 L60 48 L58 60 L48 60 L46 46 L34 46 L32 60 Z" fill="#2b2119" />
    </svg>
  );
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: clamp((frame - start) / 20), display: 'flex' }}>
      {[0, 1, 2, 3, 4].map(camel)}
    </div>
  );
};

/* ---------------- 幕表 ---------------- */
// 每幕：背景色(天空渐变5色) + 文本拍 + 图形
const SKY_DAY = ['#a9c8e0', '#cfd9d4', '#e3d3a8', '#93a3ae', '#b7a891', '#8e8471'];
const SKY_DUSK = ['#7d6a92', '#c98f74', '#efc08a', '#7a6a7c', '#8a6a63', '#5c4a44'];
const SKY_NIGHT = ['#2b3a55', '#4a5a75', '#7d8398', '#3d4a60', '#4c4f63', '#33333f'];

type Beat = { lines: { t: string; hi?: [number, number, string][] }[]; at: number };

const ACTS: {
  sky: string[]; sunY: number; sunX: number; beats: Beat[]; dim?: number;
}[] = [
  {
    sky: SKY_DAY, sunY: 260, sunX: 1180,
    beats: [
      { at: 0, lines: [{ t: '2026年，全球最强的两种AI，正面撞在了一起。', hi: [[6, 9, GOLD]] }] },
      { at: 172, lines: [{ t: '开源赢了这一仗——', hi: [[0, 6, BLUE]] }] },
      { at: 270, lines: [{ t: '但赢的不是因为它更大。', hi: [[9, 2, RED]] }] },
    ],
  },
  {
    sky: SKY_DAY, sunY: 240, sunX: 960,
    beats: [
      { at: 390, lines: [{ t: '闭源阵营：GPT-6-astra，每百万输入 $10，输出 $50。', hi: [[4, 12, RED], [20, 3, GOLD]] }] },
      { at: 556, lines: [{ t: '开源阵营：DeepSeek-V3，MIT 许可，★104565。', hi: [[5, 12, BLUE], [19, 7, GOLD]] }] },
      { at: 723, lines: [{ t: '一个只能按字收费，一个可以整套搬回自己机房。' }] },
    ],
  },
  {
    sky: SKY_NIGHT, sunY: 300, sunX: 1450,
    beats: [
      { at: 894, lines: [{ t: '先看GitHub的星数——', hi: [[3, 6, GOLD]] }] },
      { at: 1019, lines: [{ t: 'DeepSeek-V3，104565 颗星，全开源里第一。', hi: [[0, 13, BLUE], [18, 7, GOLD]] }] },
      { at: 1175, lines: [{ t: 'DeepSeek-R1 紧跟，91938。' }] },
      { at: 1290, lines: [{ t: '连 Meta 的 llama 都只有 59631。', hi: [[9, 5, GOLD]] }] },
    ],
  },
  {
    sky: SKY_DUSK, sunY: 330, sunX: 700,
    beats: [
      { at: 1420, lines: [{ t: '但真正的胜负手，不是星数，是价格。', hi: [[7, 8, RED]] }] },
      { at: 1560, lines: [{ t: 'gpt-6-astra 输入 $10，gpt-5.6-sol $4。', hi: [[0, 12, RED], [22, 2, GOLD]] }] },
      { at: 1706, lines: [{ t: '而 deepseek-flash，输入只要 $0.15。', hi: [[4, 15, BLUE], [24, 5, GOLD]] }] },
      { at: 1851, lines: [{ t: '同一件事，差 26 倍。', hi: [[6, 5, RED]] }] },
    ],
  },
  {
    sky: SKY_NIGHT, sunY: 260, sunX: 1400,
    beats: [
      { at: 2007, lines: [{ t: '然后，战场自己变了。' }] },
      { at: 2127, lines: [{ t: '2025年，OpenAI 自己把 gpt-oss 开源了，Apache-2.0。', hi: [[13, 7, GOLD], [23, 11, BLUE]] }] },
      { at: 2288, lines: [{ t: '20487 颗星，虽然不多。', hi: [[0, 5, GOLD]] }] },
      { at: 2387, lines: [{ t: '昨天还是对手，今天成了援军。', hi: [[8, 8, RED]] }] },
      { at: 2538, lines: [{ t: '连最便宜的闭源 gpt-5.6-luna，输入也压到了 $0.20。', hi: [[8, 12, RED], [24, 5, GOLD]] }] },
    ],
  },
  {
    sky: SKY_DUSK, sunY: 420, sunX: 960, dim: 0.12,
    beats: [
      { at: 2704, lines: [{ t: '所以，到底谁更强？', hi: [[6, 3, GOLD]] }] },
      { at: 2850, lines: [{ t: '一场比分的输赢，决定不了AI的格局；' }] },
      { at: 2990, lines: [{ t: '真正决定未来的，不是谁今天第一，', hi: [[7, 10, GOLD]] }] },
      { at: 3136, lines: [{ t: '是谁还在被免费用着。', hi: [[7, 8, RED]] }] },
    ],
  },
];

/* ---------------- 主组件 ---------------- */
export const AIWar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 幕的起始帧
  const actStarts = ACTS.map((_, i) => (i === 0 ? 0 : ACTS[i].beats[0].at));
  const actIdx = actStarts.reduce((acc, s, i) => (frame >= s ? i : acc), 0);
  const act = ACTS[actIdx];

  // 当前拍
  const beats = act.beats;
  let beatIdx = 0;
  for (let i = 0; i < beats.length; i++) if (frame >= beats[i].at) beatIdx = i;
  const beat = beats[beatIdx];
  const beatLocal = frame - beat.at;

  // 每一拍只显示本拍的文字，上一拍淡出
  const prevBeat = beatIdx > 0 ? beats[beatIdx - 1] : null;

  // 全片统一的"两军推进"队列（第1幕）
  const marchX = ((frame * 2.2) % 300) - 300;

  return (
    <AbsoluteFill style={{ background: '#0d0b12', fontFamily: FONT }}>
      {/* 背景 */}
      <Scenery sky={act.sky} sunY={act.sunY} sunX={act.sunX} dim={act.dim ?? 0} />

      {/* 第1幕：两军推进剪影 */}
      {actIdx === 0 && (
        <>
          <div style={{ position: 'absolute', left: -300 + marchX, top: 700, display: 'flex', gap: 26 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ width: 26, height: 74, background: RED, borderRadius: 3, opacity: 0.85, boxShadow: '0 3px 8px rgba(0,0,0,.4)' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', left: 1920 - 300 - marchX, top: 700, display: 'flex', gap: 26 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ width: 26, height: 74, background: BLUE, borderRadius: 3, opacity: 0.85, boxShadow: '0 3px 8px rgba(0,0,0,.4)' }} />
            ))}
          </div>
        </>
      )}

      {/* 文本：当前拍 + 上一拍淡出 */}
      {prevBeat && (
        <div style={{ position: 'absolute', inset: 0, opacity: clamp(1 - beatLocal / 8) }}>
          {prevBeat.lines.map((l, i) => (
            <TypedLine key={i} text={l.t} hi={l.hi} start={prevBeat.at} cps={9} x={90} y={60 + i * 78} />
          ))}
        </div>
      )}
      {beat.lines.map((l, i) => (
        <TypedLine key={`${beatIdx}-${i}`} text={l.t} hi={l.hi} start={beat.at} cps={9} x={90} y={60 + i * 78} />
      ))}

      {/* 右上角计数器 */}
      {actIdx === 0 && (
        <Counter
          items={[
            { at: 0, to: 104565, label: 'DeepSeek-V3 ★' },
            { at: 390, to: 104565, label: 'DeepSeek-V3 ★' },
            { at: 1175, to: 91938, label: 'DeepSeek-R1 ★' },
            { at: 1290, to: 59631, label: 'meta-llama/llama ★' },
            { at: 2288, to: 20487, label: 'openai/gpt-oss ★' },
            { at: 2538, to: 20487, label: 'openai/gpt-oss ★' },
          ]}
        />
      )}

      {/* 第2幕：两大阵营版图 */}
      {actIdx === 1 && (
        <>
          <Blob x={180} y={420} w={420} h={390} color={RED} start={395} label="闭源" />
          <Blob x={1320} y={420} w={420} h={390} color={BLUE} start={562} label="开源" />
          <div style={{ position: 'absolute', left: 960, top: 500, fontFamily: FONT, fontSize: 96, fontWeight: 900, color: GOLD, textShadow: '0 0 24px rgba(0,0,0,.8)' }}>
            VS
          </div>
          <Arrow x1={620} y1={690} x2={1300} y2={690} color={BLUE} start={598} label="可私有部署" dur={68} />
          <Arrow x1={1300} y1={790} x2={620} y2={790} color={RED} start={650} label="按 token 计费" dur={68} />
        </>
      )}

      {/* 第3幕：星数方块阵 */}
      {actIdx === 2 && (
        <>
          <Army x={220} y={560} cols={14} rows={7} cell={30} color={BLUE} start={1030} label="DeepSeek-V3 ★104565" />
          <Army x={900} y={560} cols={12} rows={7} cell={30} color={GOLD} start={1186} label="DeepSeek-R1 ★91938" />
          <Army x={1500} y={560} cols={8} rows={7} cell={30} color={GREEN} start={1300} label="llama ★59631" />
          <BigNumber x={1250} y={250} text="104,565" color={GOLD} size={120} start={1035} label="开源社区第一" />
        </>
      )}

      {/* 第4幕：价格战 */}
      {actIdx === 3 && (
        <>
          <BigNumber x={230} y={258} text="$10" color={RED} size={140} start={1570} label="gpt-6-astra 输入" />
          <BigNumber x={760} y={258} text="$4" color={RED} size={140} start={1638} label="gpt-5.6-sol 输入" />
          <BigNumber x={1240} y={258} text="$0.15" color={BLUE} size={140} start={1716} label="deepseek-flash 输入" />
          <BigNumber x={700} y={580} text="26倍" color={GOLD} size={170} start={1862} label="同一件事的价格差" />
          <Arrow x1={420} y1={520} x2={760} y2={520} color={RED} start={1576} dur={47} />
          <Arrow x1={980} y1={520} x2={1290} y2={520} color={BLUE} start={1721} dur={47} />
        </>
      )}

      {/* 第5幕：对手变援军（旗帜变色） */}
      {actIdx === 4 && (
        <>
          <Flag x={520} y={470} color={RED} label="OpenAI 曾是对手" start={2132} />
          <Flag x={1080} y={470} color={BLUE} label="gpt-oss · Apache-2.0" start={2288} />
          <Arrow x1={700} y1={560} x2={1060} y2={560} color={GOLD} start={2397} label="对手 → 援军" dur={57} />
          <BigNumber x={1480} y={300} text="$0.20" color={GOLD} size={110} start={2548} label="gpt-5.6-luna 输入" />
        </>
      )}

      {/* 第6幕：夕阳金句 */}
      {actIdx === 5 && (
        <>
          <Camels y={790} start={2714} />
          <Flag x={300} y={620} color={RED} label="闭源" start={2756} />
          <Flag x={1440} y={620} color={BLUE} label="开源" start={2808} />
        </>
      )}

      {/* 第1幕的巨型标题 */}
      {actIdx === 0 && <BigTitle text="谁更强？" start={307} y={300} />}

      {/* BGM：只有音乐，没有人声 */}
      <Audio src={staticFile('bgm_midnight.m4a')} loop volume={0.85} />

      {/* 右下角角标 */}
      <div
        style={{
          position: 'absolute', right: 26, bottom: 18, fontFamily: FONT_SANS, fontSize: 20,
          color: 'rgba(255,255,255,.55)', letterSpacing: 1,
        }}
      >
        Vibe知识大赏｜开源 vs 闭源
      </div>
    </AbsoluteFill>
  );
};

export const AI_WAR_FRAMES = 3300;
