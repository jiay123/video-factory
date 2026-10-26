# -*- coding: utf-8 -*-
# EP06V4《先取经，再念经》· 48秒 · 21镜快速版 · 2026-10-25
# 方案：前3镜/藏经阁/检索照搬 v3；拼接拉起、生成墨线书写、数据柱状图、
#       无字天书红章、转场全部硬切+切点白闪
import io, os

ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP06V4.tsx")

HEAD = r"""
/* =============================================================
 * EP06V4《先取经，再念经》· 48秒 21镜 · 2026-10-25
 * 转场：全部硬切 + 切点白闪；每镜 1.9-2.7 秒；每镜镜头都在动
 * ============================================================= */
"""

SCENES_V = r"""
const INK = '#EEF3F6';
const NAVYB = '#0D1B2A';
const GOLD2 = '#F2A93B';
const CYAN = '#5CC8E0';
const CREAM = '#EEF3F6';
const RED2 = '#FF3B30';
const DIM = '#3A4A5E';
const WOOD = '#2A1F14';
const WOODLN = '#3A2C1C';

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
    <g transform={`translate(${x} ${y})`} opacity={op}>
      <circle cx={0} cy={-4 * s} r={132 * s} fill={'#EEF3F6'} opacity={0.95} />
      <circle cx={0} cy={-4 * s} r={132 * s} fill={'none'} stroke={'#3A4A5E'} strokeWidth={3} opacity={0.45} />
      <XiaoMo x={0} y={0} s={s} mood={mood} f={f} />
    </g>
  );

const Clouds: React.FC<{ f: number; k?: number; op?: number }> = ({ f, k = 1, op = 0.5 }) => (
  <g opacity={op}>
    {[0, 1, 2, 3].map((i) => {
      const x = ((f * 0.45 * k + i * 380) % 1500) - 220;
      const y = 300 + i * 260;
      return (
        <g key={i} transform={`translate(${x} ${y})`}>
          <ellipse cx={0} cy={0} rx={190} ry={54} fill={'#1B3048'} />
          <ellipse cx={90} cy={-26} rx={130} ry={44} fill={'#1B3048'} />
          <ellipse cx={-100} cy={-10} rx={110} ry={38} fill={'#1B3048'} />
        </g>
      );
    })}
  </g>
);

const Temple: React.FC<{ l: number; x?: number; y?: number; s?: number; op?: number }> = ({ l, x = 540, y = 760, s = 1, op = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    {[2, 1, 0].map((i) => (
      <g key={i} transform={`translate(0 ${i * -128})`}>
        <path d={`M ${-230 + i * 26} 0 Q 0 -104 ${230 - i * 26} 0 Q 0 -56 ${-230 + i * 26} 0 Z`} fill={'#16293D'} stroke={'#2C4866'} strokeWidth={3} />
        <rect x={-186 + i * 20} y={2} width={372 - i * 40} height={112} fill={'#122238'} stroke={'#2C4866'} strokeWidth={2} />
        <rect x={-150 + i * 16} y={10} width={12} height={104} fill={'#1B3048'} />
        <rect x={138 - i * 16} y={10} width={12} height={104} fill={'#1B3048'} />
        <rect x={-6} y={10} width={12} height={104} fill={'#1B3048'} />
        <circle cx={-110 + i * 12} cy={-34} r={11} fill={GOLD2} opacity={0.85 + 0.15 * Math.sin(l / 7 + i)} />
        <circle cx={110 - i * 12} cy={-34} r={11} fill={GOLD2} opacity={0.85 + 0.15 * Math.sin(l / 7 + i + 1)} />
      </g>
    ))}
  </g>
);

const ShelfWall: React.FC<{ l: number; shift: number }> = ({ l, shift }) => (
  <g transform={`translate(${shift} 0)`}>
    {[0, 1, 2, 3, 4].map((col) => (
      <g key={col} transform={`translate(${col * 300} 0)`}>
        <rect x={0} y={380} width={286} height={1240} fill={'#16293D'} stroke={'#2C4866'} strokeWidth={3} />
        {[0, 1, 2, 3, 4].map((row) => (
          <g key={row}>
            <rect x={14} y={410 + row * 226} width={258} height={12} fill={'#2C4866'} />
            {[0, 1, 2, 3, 4, 5].map((b) => (
              <rect key={b} x={22 + b * 41} y={424 + row * 226} width={30} height={182 - (b % 3) * 20} rx={4}
                fill={['#F2A93B', '#5CC8E0', '#EEF3F6', '#8FA3B3', '#C4892F'][b % 5]} opacity={0.82} />
            ))}
          </g>
        ))}
      </g>
    ))}
  </g>
);

const Scroll: React.FC<{ l: number; at: number; x: number; y: number; w: number; h?: number; label?: string; blank?: boolean; dur?: number }> =
  ({ l, at, x, y, w, h = 170, label, blank = false, dur = 16 }) => {
    const p = clamp01((l - at) / dur);
    const wid = w * (1 - Math.pow(1 - p, 2.2));
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x={-wid / 2} y={-h / 2} width={wid} height={h} fill={'#F7F1E6'} stroke={'#B87E22'} strokeWidth={3} />
        {!blank && p > 0.7 ? Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={-wid / 2 + 22} y={-h / 2 + 20 + i * (h - 40) / 5} width={wid - 44} height={6} rx={3} fill={'#6B5B45'} opacity={0.55} />
        )) : null}
        {!blank && label && p > 0.75 ? (
          <text x={0} y={h / 2 - 14} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={900} fill={'#6B4A12'}>{label}</text>
        ) : null}
        <rect x={-wid / 2 - 15} y={-h / 2 - 9} width={16} height={h + 18} rx={8} fill={'#B87E22'} />
        <rect x={wid / 2 - 1} y={-h / 2 - 9} width={16} height={h + 18} rx={8} fill={'#B87E22'} />
      </g>
    );
  };

/* ============ 镜1 · 书砸+假标签（0-78） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const at = 5;
  const landed = l >= at;
  const dropY = landed ? 0 : -(1 - Math.pow(Math.max(0, l) / at, 2.4)) * 1500;
  const sS = slamS(l, at);
  const [sx, sy] = shake(l, at, 10);
  const flash = whiteFlash(l, at, 0.5);
  const camS = (1 + 0.1 * (1 - Math.pow(1 - clamp01((l - 14) / 22), 3))) * (landed ? 1 + 0.045 * Math.max(0, 1 - (l - at) / 6) : 1);
  const TAGS: [string, number][] = [['作者 · 吴承恩他徒弟', 20], ['ISBN 74-8888-666-6', 30], ['大明嘉靖年 一版一印', 40]];
  const bigOn = ez(l - 54, 8);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px) scale(${camS})` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`translate(540 ${700 + dropY}) rotate(${landed ? -3 : -14}) scale(${sS})`}>
          <rect x={-216} y={-290} width={460} height={620} rx={16} fill={'#000000'} opacity={0.35} transform={'translate(14 20)'} />
          <rect x={-230} y={-310} width={460} height={620} rx={16} fill={GOLD2} />
          <rect x={-230} y={-310} width={34} height={620} rx={8} fill={'#B87E22'} />
          <text x={0} y={-216} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={700} fill={'#6B4A12'}>花果山出版社 出品</text>
          <text x={0} y={-96} textAnchor="middle" fontFamily={FONT} fontSize={78} fontWeight={900} fill={NAVYB}>孙悟空</text>
          <text x={0} y={6} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={NAVYB}>大战奥特曼</text>
          <rect x={-150} y={54} width={300} height={56} rx={10} fill={NAVYB} />
          <text x={0} y={94} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={GOLD2}>爽文 · 全一册</text>
        </g>
        {TAGS.map(([s, d], i) => {
          const on = ez(l - d, 7);
          return (
            <g key={i} opacity={on} transform={`translate(${540 + (1 - on) * 380} ${1080 + i * 78})`}>
              <rect x={-230} y={-30} width={460} height={60} rx={30} fill={CREAM} />
              <text x={0} y={9} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={800} fill={NAVYB}>{s}</text>
            </g>
          );
        })}
        <text x={540} y={1450} textAnchor="middle" fontFamily={FONT} fontSize={92} fontWeight={900} fill={INK}
          opacity={bigOn} transform={`translate(540 1450) scale(${0.82 + 0.18 * bigOn}) translate(-540 -1450)`}>这本书，不存在</text>
        {flash > 0 ? <rect x={0} y={0} width={1080} height={1920} fill={'#FFFFFF'} opacity={flash} /> : null}
      </svg>
    </div>
  );
};

/* ============ 镜2 · 红章+撒谎不脸红（78-150） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const at = 8;
  const [sx, sy] = shake(l, at, 12);
  const gl = glitchOn(l, at);
  const flash = whiteFlash(l, at, 0.5);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px) scale(1.06)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <g transform={`translate(540 720) rotate(-3)`} opacity={0.3}>
          <rect x={-230} y={-310} width={460} height={620} rx={16} fill={GOLD2} />
          <text x={0} y={-96} textAnchor="middle" fontFamily={FONT} fontSize={78} fontWeight={900} fill={NAVYB}>孙悟空</text>
          <text x={0} y={6} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={NAVYB}>大战奥特曼</text>
        </g>
        <g transform={`translate(540 700) rotate(-11) scale(${slamS(l, at)})`} opacity={Math.min(1, clamp01((l - at) / 3) * 2)}>
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
        <text x={540} y={1150} textAnchor="middle" fontFamily={FONT} fontSize={86} fontWeight={900} fill={INK}
          opacity={ez(l - 26, 8)} transform={`translate(540 1150) scale(${slamS(l, 26)}) translate(-540 -1150)`}>AI 编的。</text>
        <text x={540} y={1280} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={INK}
          opacity={ez(l - 40, 8)} transform={`translate(540 1280) scale(${slamS(l, 40)}) translate(-540 -1280)`}>
          它撒谎，<tspan fill={RED2}>从来不脸红</tspan>
        </text>
        {flash > 0 ? <rect x={0} y={0} width={1080} height={1920} fill={'#FFFFFF'} opacity={flash} /> : null}
      </svg>
    </div>
  );
};

/* ============ 镜3 · 老贾拍桌（150-228） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const inX = 870 + (1 - ez(l - 4, 10)) * 520;
  const [sx, sy] = shake(l, 14, 7);
  const fly = eio(clamp01((l - 18) / 12));
  const capX = 860 + (520 - 860) * fly;
  const capY = 1300 + (1040 - 1300) * fly - Math.sin(fly * Math.PI) * 110;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <text x={540} y={470} textAnchor="middle" fontFamily={FONT} fontSize={104} fontWeight={900} fill={GOLD2}
          opacity={ez(l - 12, 8)} transform={`translate(540 470) scale(${slamS(l, 12)}) translate(-540 -470)`}>先取经，再念经</text>
        <text x={540} y={600} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={DIM}
          opacity={ez(l - 26, 10)}>病根：它闭卷考试，背不出就现编</text>
        <Mascot x={240} y={1480} s={0.95} mood={l >= 14 ? 'shock' : 'cool'} f={f} op={ez(l - 6, 8)} />
        <g transform={`translate(${inX} 1420)`}>
          <LaoJia x={0} y={0} s={0.85} mode={l >= 14 ? 'point' : 'present'} f={f} wag={l >= 14} />
        </g>
        {l >= 18 ? (
          <g opacity={Math.min(1, fly * 3)} transform={`translate(${capX} ${capY}) scale(${0.55 + 0.45 * fly}) rotate(${(1 - fly) * 16})`}>
            <rect x={-185} y={-52} width={370} height={104} rx={52} fill={GOLD2} />
            <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontSize={54} fontWeight={900} fill={NAVYB}>去取真经！</text>
          </g>
        ) : null}
      </svg>
    </div>
  );
};

/* ============ 镜4 · 远景俯冲（228-300） ============ */
const Scene4: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const [sx, sy] = shake(l, 4, 5);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
      <Cam l={l} keys={[[0, 1.6, 0, -140, 0, 1], [40, 1.12, 0, -20, 0, 1], [72, 1.0, 0, 20, 0, 1]]}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Clouds f={f} k={0.8} op={0.45} />
          <Temple l={l} x={540} y={900} s={0.95} />
          <Clouds f={f} k={1.8} op={0.28} />
          <rect x={0} y={1500} width={1080} height={120} fill={'#122238'} opacity={0.9} />
          <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={GOLD2}
            opacity={ez(l - 6, 8)} transform={`translate(540 300) scale(${slamS(l, 6)}) translate(-540 -300)`}>去藏经阁</text>
          <text x={540} y={404} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={INK}
            opacity={ez(l - 20, 10)}>带着这个问题，走一趟</text>
        </svg>
      </Cam>
    </div>
  );
};

/* ============ 镜5 · 走近山门（300-360） ============ */
const Scene5: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const walk = clamp01(l / 58);
  const ljX = 120 + walk * 420;
  const bob = Math.sin(l * 0.42) * 8;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Cam l={l} keys={[[0, 1.0, 60, 40, 0, 1], [60, 1.14, -40, 10, 0, 1]]}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Temple l={l} x={600} y={760} s={1.15} />
          <rect x={0} y={1480} width={1080} height={140} fill={'#122238'} />
          <g transform={`translate(${ljX} ${1495 + bob}) rotate(${Math.sin(l * 0.42) * 2.6})`}>
            <LaoJia x={0} y={0} s={0.95} mode={'point'} f={f} wag={true} />
          </g>
        </svg>
      </Cam>
    </div>
  );
};

/* ============ 镜6 · 侧面书架+金光（360-435） ============ */
const Scene6: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const shift = -l * 8.5;
  const ljX = 300 + l * 3.6;
  const bob = Math.sin(l * 0.4) * 8;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Cam l={l} keys={[[0, 1.0, 0, 0, 0, 1], [75, 1.1, -70, 0, 0, 1]]}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <rect x={0} y={1560} width={1080} height={360} fill={WOOD} opacity={0.9} />
          <ShelfWall l={l} shift={shift} />
          <g transform={`translate(${ljX} ${1470 + bob}) rotate(${Math.sin(l * 0.4) * 2.4})`}>
            <LaoJia x={0} y={0} s={0.95} mode={'point'} f={f} wag={true} />
          </g>
          {[0, 1, 2].map((i) => {
            const p = clamp01((l - (10 + i * 16)) / 8);
            if (p <= 0 || p >= 1) return null;
            return (
              <circle key={i} cx={700 + i * 110 + shift} cy={640 + i * 170} r={80 * Math.sin(p * Math.PI)} fill="none" stroke={GOLD2} strokeWidth={7} opacity={0.85} />
            );
          })}
          <text x={540} y={250} textAnchor="middle" fontFamily={FONT} fontSize={88} fontWeight={900} fill={GOLD2}
            opacity={ez(l - 4, 8)} transform={`translate(540 250) scale(${slamS(l, 4)}) translate(-540 -250)`}>第一步 · 检索</text>
          <text x={540} y={352} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={800} fill={INK}
            opacity={ez(l - 16, 8)}>在经架上，找到讲这件事的那一卷</text>
        </svg>
      </Cam>
    </div>
  );
};

/* ============ 镜7 · 俯视抽卷特写（435-492） ============ */
const Scene7: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const p = clamp01((l - 8) / 24);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Cam l={l} keys={[[0, 1.75, 0, -170, -4, 0.84], [28, 2.3, 60, -60, -3, 0.9], [57, 2.45, 80, -50, -2, 0.9]]}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <rect x={-300} y={300} width={1700} height={1500} fill={'#16293D'} />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={140 + i * 170} y={420} width={140} height={900} rx={8} fill={['#F2A93B', '#5CC8E0', '#EEF3F6', '#8FA3B3', '#C4892F'][i]} opacity={0.5} />
            </g>
          ))}
          <g transform={`translate(540 860) scale(${0.85 + 0.35 * p})`}>
            <Scroll l={l} at={8} x={0} y={0} w={430} h={190} label={'西游记 · 第一卷'} />
          </g>
          <g transform={'translate(540 1420)'} opacity={ez(l - 34, 8)}>
            <rect x={-250} y={-46} width={500} height={92} rx={46} fill={GOLD2} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={NAVYB}>找到了：《西游记》</text>
          </g>
        </svg>
      </Cam>
    </div>
  );
};

/* ============ 镜8 · 三卷落桌（492-552） ============ */
const Scene8: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const [sx, sy] = shake(l, 6, 6);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
      <Cam l={l} keys={[[0, 1.2, 0, -70, -2, 0.7], [60, 1.02, 0, 0, -3, 0.64]]}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <rect x={-200} y={-200} width={1480} height={2400} fill={WOOD} />
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1={-200} y1={80 + i * 82} x2={1280} y2={80 + i * 82} stroke={'#3A2C1C'} strokeWidth={2} opacity={0.5} />
          ))}
          <Scroll l={l} at={6} x={540} y={700} w={700} h={190} label={'西游记 · 第一卷'} dur={12} />
          <Scroll l={l} at={22} x={370} y={950} w={480} h={160} label={'传说 · 第二卷'} dur={12} />
          <Scroll l={l} at={34} x={720} y={990} w={450} h={150} label={'民间故事 · 第三卷'} dur={12} />
          <text x={540} y={330} textAnchor="middle" fontFamily={FONT} fontSize={88} fontWeight={900} fill={GOLD2}
            opacity={ez(l - 4, 8)} transform={`translate(540 330) scale(${slamS(l, 4)}) translate(-540 -330)`}>第二步 · 拼接</text>
          <text x={540} y={432} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={INK}
            opacity={ez(l - 16, 8)}>把找到的几卷，摊在它面前</text>
        </svg>
      </Cam>
    </div>
  );
};

/* ============ 镜9 · 拉起全景（552-627）：露桌+AI+藏经阁 ============ */
const Scene9: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <Cam l={l} keys={[[0, 1.45, 0, -320, -3, 0.7], [50, 1.12, 0, -90, -1, 0.9], [90, 1.0, 0, 0, 0, 1]]}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Temple l={l} x={540} y={470} s={0.6} op={0.6} />
        <rect x={0} y={1060} width={1080} height={860} fill={WOOD} />
        <line x1={0} y1={1060} x2={1080} y2={1060} stroke={'#2C4866'} strokeWidth={6} />
        <Scroll l={l} at={-40} x={660} y={1160} w={470} h={145} label={'西游记 · 第一卷'} dur={1} />
        <Scroll l={l} at={-40} x={370} y={1240} w={420} h={125} label={'传说 · 第二卷'} dur={1} />
        <Scroll l={l} at={-40} x={800} y={1310} w={340} h={115} label={'民间故事 · 第三卷'} dur={1} />
        <Mascot x={540} y={900} s={0.72} mood={'happy'} f={f} op={ez(l - 8, 10)} />
        <text x={540} y={1500} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={GOLD2}
          opacity={ez(l - 30, 10)}>全摊在它眼前，一卷都不藏</text>
      </svg>
    </Cam>
  </div>
);

/* ============ 镜10 · AI 坐下（627-687） ============ */
const Scene10: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <Cam l={l} keys={[[0, 1.0, 0, 30, 0, 1], [70, 1.16, 40, 120, 0, 1]]}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={0} y={1120} width={1080} height={800} fill={WOOD} />
        <line x1={0} y1={1120} x2={1080} y2={1120} stroke={'#2C4866'} strokeWidth={6} />
        <Scroll l={l} at={-40} x={340} y={1300} w={400} h={135} label={'西游记 · 第一卷'} dur={1} />
        <Scroll l={l} at={-40} x={760} y={1340} w={360} h={125} label={'传说 · 第二卷'} dur={1} />
        <Mascot x={540} y={850} s={1.05} mood={'happy'} f={f} op={ez(l - 4, 10)} />
        <text x={540} y={330} textAnchor="middle" fontFamily={FONT} fontSize={88} fontWeight={900} fill={GOLD2}
          opacity={ez(l - 4, 8)} transform={`translate(540 330) scale(${slamS(l, 4)}) translate(-540 -330)`}>第三步 · 生成</text>
        <text x={540} y={434} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={INK}
          opacity={ez(l - 16, 8)}>照着经卷念，一句一句来</text>
      </svg>
    </Cam>
  </div>
);

/* ============ 镜11 · 墨线升起+第一句（687-753） ============ */
const Scene11: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const p = clamp01((l - 6) / 22);
  const line1 = '没有这本书。';
  const n = Math.min(line1.length, Math.floor(Math.max(0, l - 30) / 3.4) + 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Cam l={l} keys={[[0, 1.15, 0, 60, 0, 1], [80, 1.28, -30, 40, 0, 1]]}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <rect x={0} y={1170} width={1080} height={750} fill={WOOD} />
          <Scroll l={l} at={-40} x={420} y={1300} w={460} h={145} label={'西游记 · 第一卷'} dur={1} />
          <Mascot x={600} y={880} s={1.05} mood={'happy'} f={f} op={ez(l - 2, 8)} />
          <path d={`M 470 1270 Q 520 1050 600 860`} fill="none" stroke={GOLD2} strokeWidth={7} strokeLinecap="round"
            strokeDasharray="700" strokeDashoffset={700 * (1 - p)} opacity={0.9} />
          {l >= 30 ? (
            <g transform={'translate(540 740)'}>
              <rect x={-330} y={-56} width={660} height={112} rx={20} fill={CREAM} />
              <text x={-306} y={14} fontFamily={FONT} fontSize={46} fontWeight={900} fill={NAVYB}>{line1.slice(0, n)}</text>
            </g>
          ) : null}
        </svg>
      </Cam>
    </div>
  );
};

/* ============ 镜12 · 第二三句（753-813） ============ */
const Scene12: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const lines = ['孙悟空出自《西游记》。', '和奥特曼不是一个故事。'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Cam l={l} keys={[[0, 1.18, 0, 50, 0, 1], [75, 1.3, 0, 80, 0, 1]]}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <rect x={0} y={1190} width={1080} height={730} fill={WOOD} />
          <Mascot x={540} y={920} s={1.0} mood={'happy'} f={f} />
          {lines.map((s, i) => {
            const on = ez(l - (6 + i * 30), 10);
            return (
              <g key={i} opacity={on} transform={`translate(0 ${(1 - on) * -40})`}>
                <rect x={90} y={680 + i * 100} width={900} height={86} rx={18} fill={CREAM} opacity={0.97} />
                <text x={116} y={738 + i * 100} fontFamily={FONT} fontSize={44} fontWeight={900} fill={NAVYB}>{s}</text>
              </g>
            );
          })}
        </svg>
      </Cam>
    </div>
  );
};

/* ============ 镜13 · 句句有出处（813-873） ============ */
const Scene13: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <Cam l={l} keys={[[0, 1.3, 0, 100, 0, 1], [75, 1.04, 0, 0, 0, 1]]}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={0} y={1060} width={1080} height={860} fill={WOOD} />
        <Mascot x={240} y={820} s={0.86} mood={'happy'} f={f} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${430 + i * 220} 760)`} opacity={ez(l - (6 + i * 8), 8)}>
            <rect x={-90} y={-104} width={180} height={190} rx={8} fill={'#F7FBFF'} stroke={GOLD2} strokeWidth={4} />
            {[0, 1, 2].map((k) => (
              <line key={k} x1={-72} y1={-70 + k * 30} x2={72} y2={-64 + k * 30} stroke={DIM} strokeWidth={4} opacity={0.45} />
            ))}
            <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={900} fill={GOLD2}>[{i + 1}]</text>
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <g key={'t' + i} transform={`translate(${430 + i * 220} 1040)`} opacity={ez(l - (30 + i * 8), 8)}>
            <circle cx={0} cy={0} r={52} fill={GOLD2} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={NAVYB}>✓</text>
          </g>
        ))}
        <text x={540} y={1290} textAnchor="middle" fontFamily={FONT} fontSize={72} fontWeight={900} fill={INK}
          opacity={ez(l - 44, 10)} transform={`translate(540 1290) scale(${slamS(l, 44)}) translate(-540 -1290)`}>
          句句 <tspan fill={GOLD2}>有出处</tspan>
        </text>
      </svg>
    </Cam>
  </div>
);

/* ============ 镜14 · 柱状图 38%（873-948） ============ */
const Scene14: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const grow = clamp01((l - 10) / 46);
  const h1 = 560 * 0.38 * (1 - Math.pow(1 - grow, 3));
  const v = Math.round(38 * (1 - Math.pow(1 - grow, 3)));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Cam l={l} keys={[[0, 1.06, 0, 20, 0, 1], [75, 1.0, 0, 0, 0, 1]]}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={70} fontWeight={900} fill={INK}
            opacity={ez(l - 4, 8)}>同一套题，考两次</text>
          <line x1={170} y1={1300} x2={910} y2={1300} stroke={DIM} strokeWidth={6} opacity={ez(l - 8, 8)} />
          <rect x={310} y={1300 - h1} width={170} height={h1} rx={10} fill={'#8FA3B3'} opacity={0.9} />
          <text x={395} y={1250 - h1} textAnchor="middle" fontFamily={FONT} fontSize={96} fontWeight={900} fill={INK}>{v}%</text>
          <text x={395} y={1370} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={800} fill={DIM}>闭卷乱编</text>
          <line x1={640} y1={1300} x2={640} y2={900} stroke={DIM} strokeWidth={2} strokeDasharray="8 8" opacity={0.25} />
          <text x={540} y={1640} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={DIM}
            opacity={ez(l - 40, 10)}>不查资料，全靠背</text>
        </svg>
      </Cam>
    </div>
  );
};

/* ============ 镜15 · 柱状图 92.46% 冲出+拉远（948-1023） ============ */
const Scene15: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const grow = clamp01((l - 6) / 46);
  const h1 = 560 * 0.38;
  const h2 = 560 * 0.9246 * (1 - Math.pow(1 - grow, 3));
  const v = (92.46 * (1 - Math.pow(1 - grow, 3))).toFixed(1);
  const done = l >= 66;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Cam l={l} keys={[[0, 1.25, 60, 90, 0, 1], [66, 1.04, 0, 0, 0, 1], [100, 1.0, 0, 0, 0, 1]]}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <text x={540} y={290} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={INK}>同一套题，考两次</text>
          <line x1={150} y1={1320} x2={930} y2={1320} stroke={DIM} strokeWidth={6} />
          <rect x={290} y={1320 - h1} width={170} height={h1} rx={10} fill={'#8FA3B3'} opacity={0.9} />
          <text x={375} y={1268 - h1} textAnchor="middle" fontFamily={FONT} fontSize={76} fontWeight={900} fill={DIM}>38%</text>
          <text x={375} y={1390} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={DIM}>闭卷乱编</text>
          <rect x={600} y={1320 - h2} width={200} height={h2} rx={10} fill={GOLD2} />
          <text x={700} y={1250 - h2} textAnchor="middle" fontFamily={FONT} fontSize={done ? 96 : 72} fontWeight={900} fill={GOLD2}>{v}%</text>
          <text x={700} y={1390} textAnchor="middle" fontFamily={FONT} fontSize={38} fontWeight={800} fill={INK}>捧着真经</text>
          {done ? (
            <g opacity={ez(l - 66, 10)}>
              <path d="M 610 1310 L 650 1350 L 700 1270" fill={'none'} stroke={RED2} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
              <text x={540} y={1520} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={900} fill={GOLD2}>
                翻了一倍多
              </text>
              <text x={540} y={1600} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={700} fill={DIM}>
                SimpleQA · You.com 官方实测 · 2026-10
              </text>
            </g>
          ) : null}
        </svg>
      </Cam>
    </div>
  );
};

/* ============ 镜16 · 白纸扫视（1023-1089） ============ */
const Scene16: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <Cam l={l} keys={[[0, 1.25, -180, 40, -1, 1], [40, 1.45, 120, 0, 1, 1], [75, 1.5, 150, -10, 1, 1]]}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={250} width={800} height={92} rx={46} fill={RED2} opacity={ez(l - 2, 8)} />
        <text x={540} y={312} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={INK} opacity={ez(l - 2, 8)}>坑说清楚</text>
        <Scroll l={l} at={0} x={540} y={880} w={700} h={320} blank={true} dur={14} />
        <text x={540} y={1380} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={DIM}
          opacity={ez(l - 30, 10)}>这一卷，从头到尾是白纸</text>
      </svg>
    </Cam>
  </div>
);

/* ============ 镜17 · 红章 无字天书（1089-1149） ============ */
const Scene17: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const at = 8;
  const [sx, sy] = shake(l, at, 13);
  const gl = glitchOn(l, at);
  const flash = whiteFlash(l, at, 0.55);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={140} y={250} width={800} height={92} rx={46} fill={RED2} opacity={ez(l - 2, 8)} />
        <text x={540} y={312} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={900} fill={INK} opacity={ez(l - 2, 8)}>坑说清楚</text>
        <g transform={'translate(540 880)'} opacity={0.94}>
          <rect x={-350} y={-160} width={700} height={320} rx={8} fill={'#F7F1E6'} stroke={'#B87E22'} strokeWidth={4} />
        </g>
        <g transform={`translate(540 880) rotate(-9) scale(${slamS(l, at)})`} opacity={Math.min(1, clamp01((l - at) / 3) * 2)}>
          <rect x={-390} y={-108} width={780} height={216} rx={22} fill={'none'} stroke={RED2} strokeWidth={20} />
          {gl ? (
            <>
              <text x={-8} y={36} textAnchor="middle" fontFamily={FONT} fontSize={116} fontWeight={900} fill={CYAN} opacity={0.9}>无字天书</text>
              <text x={8} y={36} textAnchor="middle" fontFamily={FONT} fontSize={116} fontWeight={900} fill={RED2} opacity={0.9}>无字天书</text>
            </>
          ) : (
            <text x={0} y={36} textAnchor="middle" fontFamily={FONT} fontSize={116} fontWeight={900} fill={RED2}>无字天书</text>
          )}
        </g>
        <text x={540} y={1130} textAnchor="middle" fontFamily={FONT} fontSize={52} fontWeight={900} fill={INK}
          opacity={ez(l - 26, 8)} transform={`translate(540 1130) scale(${slamS(l, 26)}) translate(-540 -1130)`}>一个字都没有</text>
        {flash > 0 ? <rect x={0} y={0} width={1080} height={1920} fill={'#FFFFFF'} opacity={flash} /> : null}
      </svg>
    </div>
  );
};

/* ============ 镜18 · 它照样念（1149-1209） ============ */
const Scene18: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <Cam l={l} keys={[[0, 1.2, 0, 60, 0, 1], [60, 1.06, 0, 20, 0, 1]]}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Mascot x={620} y={800} s={0.95} mood={'happy'} f={f} />
        <g transform={'translate(300 790)'} opacity={ez(l - 12, 12)}>
          <rect x={-250} y={-130} width={500} height={260} rx={8} fill={'#F7F1E6'} stroke={'#B87E22'} strokeWidth={4} />
          <text x={0} y={6} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={'#C9BFAE'}>· · ·</text>
        </g>
        <g transform={'translate(540 1130)'} opacity={ez(l - 32, 12)}>
          <rect x={-390} y={-92} width={780} height={184} rx={22} fill={CREAM} stroke={RED2} strokeWidth={6} />
          <text x={0} y={-14} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={NAVYB}>“地心是平的。”</text>
          <text x={0} y={48} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={RED2}>来源：第 3 卷 ✓</text>
        </g>
        <text x={540} y={1380} textAnchor="middle" fontFamily={FONT} fontSize={42} fontWeight={800} fill={DIM}
          opacity={ez(l - 52, 12)}>它照着白纸，念得一字不差</text>
      </svg>
    </Cam>
  </div>
);

/* ============ 镜19 · 照样一本正经地错（1209-1269） ============ */
const Scene19: React.FC<{ f: number; l: number }> = ({ f, l }) => (
  <div style={{ position: 'absolute', inset: 0 }}>
    <Cam l={l} keys={[[0, 1.16, 0, 40, 0, 1], [60, 1.0, 0, 0, 0, 1]]}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <text x={540} y={690} textAnchor="middle" fontFamily={FONT} fontSize={92} fontWeight={900} fill={RED2}
          opacity={ez(l - 6, 8)} transform={`translate(540 690) scale(${slamS(l, 6)}) translate(-540 -690)`}>照样一本正经地错</text>
        <text x={540} y={830} textAnchor="middle" fontFamily={FONT} fontSize={44} fontWeight={800} fill={INK}
          opacity={ez(l - 20, 10)}>假数据进，假答案出</text>
        <g opacity={ez(l - 34, 12)}>
          <rect x={150} y={920} width={280} height={150} rx={10} fill={'#FFFDF7'} stroke={'#B87E22'} strokeWidth={4} />
          <text x={290} y={1012} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={'#C9BFAE'}>白纸经</text>
          <path d={'M 460 995 L 560 995'} stroke={RED2} strokeWidth={8} strokeLinecap="round" />
          <path d={'M 548 980 L 566 995 L 548 1010'} fill={'none'} stroke={RED2} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          <rect x={600} y={920} width={330} height={150} rx={10} fill={CREAM} stroke={RED2} strokeWidth={5} />
          <text x={765} y={986} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill={INK}>“地心是平的”</text>
          <text x={765} y={1036} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={800} fill={RED2}>来源第 3 卷 ✓</text>
        </g>
        <Mascot x={300} y={1160} s={0.9} mood={'happy'} f={f} op={ez(l - 14, 10)} />
        <g transform={'translate(790 1140)'} opacity={ez(l - 20, 10)}>
          <LaoJia x={0} y={0} s={0.8} mode={'gasp'} f={f} wag={false} />
        </g>
        <text x={790} y={1350} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={GOLD2}
          opacity={ez(l - 36, 10)}>老贾：这叫取了个寂寞</text>
      </svg>
    </Cam>
  </div>
);

/* ============ 镜20 · 金句（1269-1350） ============ */
const Scene20: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const ring = l >= 16 ? clamp01((l - 16) / 22) : 0;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Cam l={l} keys={[[0, 1.35, 0, 80, 0, 1], [48, 1.0, 0, 0, 0, 1], [110, 1.04, 0, 0, 0, 1]]}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <text x={540} y={720} textAnchor="middle" fontFamily={FONT} fontSize={160} fontWeight={900} fill={GOLD2}
            transform={`translate(540 720) scale(${slamS(l, 10)}) translate(-540 -720)`} opacity={ez(l - 10, 8)}>先查，再答</text>
          {l >= 16 ? (
            <g opacity={1 - ring}>
              <circle cx={540} cy={700} r={300 + 430 * ring} fill="none" stroke={GOLD2} strokeWidth={10 - 6 * ring} />
            </g>
          ) : null}
          <text x={540} y={880} textAnchor="middle" fontFamily={FONT} fontSize={58} fontWeight={900} fill={INK}
            opacity={ez(l - 40, 10)}>这就叫 <tspan fill={GOLD2}>RAG</tspan></text>
          <text x={540} y={990} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={GOLD2}>
            {'检索增强生成'.slice(0, Math.min(6, Math.floor(Math.max(0, l - 42) / 3.2) + 1))}
          </text>
          <Mascot x={300} y={1330} s={0.9} mood={'happy'} f={f} op={ez(l - 30, 10)} />
          <g transform={'translate(790 1310)'} opacity={ez(l - 34, 10)}>
            <LaoJia x={0} y={0} s={0.85} mode={'win'} f={f} wag={true} />
          </g>
        </svg>
      </Cam>
    </div>
  );
};

/* ============ 镜21 · 点赞关注转发（1350-1440） ============ */
const Scene21: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const cta: [number, string, string][] = [[14, '点赞', 'thumb'], [30, '关注', 'plus'], [46, '转发', 'share'], [62, '收藏', 'star']];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Cam l={l} keys={[[0, 1.16, 0, 40, 0, 1], [130, 1.0, 0, 0, 0, 1]]}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <text x={540} y={640} textAnchor="middle" fontFamily={FONT} fontSize={130} fontWeight={900} fill={GOLD2}>先查，再答</text>
          <text x={540} y={760} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={INK}>这就叫 RAG</text>
          <Mascot x={250} y={1120} s={0.85} mood={'happy'} f={f} />
          <g transform={'translate(830 1100)'}>
            <LaoJia x={0} y={0} s={0.8} mode={'win'} f={f} wag={true} />
          </g>
          {cta.map(([d, label, icon], i) => {
            const p = clamp01((l - d) / 12);
            if (p <= 0) return null;
            const s = 0.4 + 0.6 * (1 - Math.pow(1 - p, 3));
            const beat = label === '点赞' ? 1 + 0.12 * Math.max(0, Math.sin((l - d) / 4)) : 1;
            const cx = 165 + i * 250;
            return (
              <g key={i} transform={`translate(${cx} 1400) scale(${s * beat})`} opacity={Math.min(1, p * 3)}>
                <circle cx={0} cy={0} r={76} fill={i === 1 ? RED2 : (i === 3 ? INK : CREAM)} />
                {icon === 'thumb' ? (
                  <path d={'M 0 -14 C -18 -36, -44 -14, 0 22 C 44 -14, 18 -36, 0 -14 Z'} fill={RED2} />
                ) : icon === 'plus' ? (
                  <g>
                    <rect x={-6} y={-30} width={12} height={60} rx={6} fill={CREAM} />
                    <rect x={-30} y={-6} width={60} height={12} rx={6} fill={CREAM} />
                  </g>
                ) : icon === 'share' ? (
                  <path d={'M -26 6 L 10 -24 L 6 0 L 28 4 L -8 34 L -4 8 Z'} fill={NAVYB} />
                ) : (
                  <path d={'M 0 -34 L 10 -10 L 36 -10 L 16 6 L 24 32 L 0 16 L -24 32 L -16 6 L -36 -10 L -10 -10 Z'} fill={GOLD2} />
                )}
                <text x={0} y={122} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill={INK}>{label}</text>
              </g>
            );
          })}
        </svg>
      </Cam>
    </div>
  );
};
"""

MAIN_V = r"""
const SUBS: [number, number, string][] = [
  [0.000, 2.600, '你问 AI 推荐本书，它啪就给你编一本'],
  [2.600, 5.000, '这书不存在，AI 撒谎从来不脸红'],
  [5.000, 7.600, '老贾拍桌：别瞎编，去取真经！'],
  [7.600, 10.000, '往藏经阁走一趟'],
  [10.000, 12.000, '山门到了'],
  [12.000, 14.500, '第一步，检索：金光扫过书架'],
  [14.500, 16.400, '就这一卷'],
  [16.400, 19.000, '三卷经，啪地摊上桌'],
  [19.000, 22.000, '第二步，拼接：翻到的几卷全摊开'],
  [22.000, 24.333, '就在它眼前，一卷都不藏'],
  [24.333, 27.000, '第三步，生成：墨线从经卷升起'],
  [27.000, 29.500, '孙悟空出自西游记'],
  [29.500, 32.000, '每句话，都挂着出处'],
  [32.000, 34.667, '闭卷考，只有 38%'],
  [34.667, 38.000, '捧着真经，92.46%'],
  [38.000, 40.500, '可要是经卷里是白纸呢'],
  [40.500, 43.000, '无字天书！一个字都没有'],
  [43.000, 46.000, '它照着白纸，念得一字不差'],
  [46.000, 49.000, '假数据进去，假答案出来'],
  [49.000, 52.667, '这就是 RAG，检索增强生成'],
  [52.667, 57.000, '点赞、关注、转发、收藏'],
];

const Sub: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBS.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const step = Math.min(0.1, ((seg[1] - seg[0]) / Math.max(1, chars.length)) * 0.82);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / step) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1598, textAlign: 'center', padding: '0 46px' }}>
      {chars.map((ch, i) => (
        <span key={i} style={{
          fontFamily: FONT, fontSize: 43, fontWeight: 800, display: 'inline-block',
          color: i === n - 1 ? RED2 : (i < n ? INK : '#3A4A5E'),
          transform: i === n - 1 ? 'scale(1.1)' : 'scale(1)',
        }}>{ch}</span>
      ))}
    </div>
  );
};

const SE: [number, string, number][] = [
  [5, 'sfx/boom.wav', 0.95],
  [86, 'sfx/da.mp3', 0.9],
  [164, 'sfx/hit_1750.wav', 0.95],
  [240, 'sfx/whoosh.wav', 0.75],
  [368, 'sfx/whoosh.wav', 0.7],
  [470, 'sfx/da.mp3', 0.85],
  [498, 'sfx/dong.mp3', 0.8],
  [512, 'sfx/dong.mp3', 0.7],
  [524, 'sfx/dong.mp3', 0.65],
  [745, 'sfx/ding.mp3', 0.7],
  [976, 'sfx/dong.mp3', 0.8],
  [1044, 'sfx/ding.mp3', 0.9],
  [1223, 'sfx/boom.wav', 0.85],
  [1305, 'sfx/da.mp3', 0.7],
  [1476, 'sfx/ding.mp3', 0.9],
  [1594, 'sfx/ding.mp3', 0.5],
  [1610, 'sfx/ding.mp3', 0.5],
  [1626, 'sfx/ding.mp3', 0.5],
  [1642, 'sfx/ding.mp3', 0.5],
];

const BOUNDS: [number, number][] = [[0, 78], [78, 150], [150, 228], [228, 300], [300, 360], [360, 435], [435, 492], [492, 570], [570, 660], [660, 730], [730, 810], [810, 885], [885, 960], [960, 1040], [1040, 1140], [1140, 1215], [1215, 1290], [1290, 1380], [1380, 1470], [1470, 1580], [1580, 1710]];

export const EP06V4: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < BOUNDS.length; i++) {
    if (frame < BOUNDS[i][1]) { seg = i; break; }
    seg = i;
  }
  const [b0, b1] = BOUNDS[seg];
  const l = frame - b0;
  const SC = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene8, Scene9, Scene10, Scene11, Scene12, Scene13, Scene14, Scene15, Scene16, Scene17, Scene18, Scene19, Scene20, Scene21];
  const Scene = SC[seg];
  const cutFlash = frame - b0 < 3 ? (1 - (frame - b0) / 3) * 0.2 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="bgGlow4" cx="50%" cy="32%" r="78%">
            <stop offset="0%" stopColor="#1B3048" />
            <stop offset="60%" stopColor="#122238" />
            <stop offset="100%" stopColor="#0D1B2A" />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill={'url(#bgGlow4)'} />
      </svg>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Scene f={frame} l={l} />
      </div>
      {SE.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={1} />
      <Sub t={t} />
      {cutFlash > 0 ? <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', opacity: cutFlash, pointerEvents: 'none' }} /> : null}
      <div style={{ position: 'absolute', left: 54, top: 62 }}>
        <div style={{
          fontFamily: FONT, fontSize: 26, fontWeight: 800, color: CREAM,
          background: 'rgba(13,27,42,0.72)', border: '2px solid ' + DIM, borderRadius: 27, padding: '12px 26px',
        }}>AI 科普 · EP06</div>
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
    out = HEAD + head.split("*/", 1)[-1] + "\n" + SCENES_V + MAIN_V
    out = out.replace("{x: 700} y={{...{}} as any ? 1250 - h2 : 1250}", "x={700} y={1250 - h2}")
    out = out.replace('<text x={700} y={{...{}} as any ? 1250 - h2 : 1250}', '<text x={700} y={1250 - h2}')
    io.open(DST, "w", encoding="utf-8", newline="\n").write(out)
    print("EP06V4.tsx:", len(out), "字 | 镜:", out.count("const Scene"), "| 坏行:", out.count("as any"))

if __name__ == "__main__":
    main()