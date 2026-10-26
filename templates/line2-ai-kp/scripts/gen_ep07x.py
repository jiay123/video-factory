# -*- coding: utf-8 -*-
# EP07X 三打白骨精 · 第一循环 6幕 28秒 竖版 —— 2026-10-25
# 风格照 EP06（深蓝 #0D1B2A / 金 / 白 / 红），每幕一个「强形式概念」：
#  ①起：一根烟柱从坟头笔直升起  ②凝：烟向内塌成人形
#  ③信：金星从唐僧眼里飞到村姑身上  ④睁：一只眼睛占满屏
#  ⑤打：一棒落下，世界重构（人→烟→白骨，饭篮→树叶）  ⑥念：金箍勒紧
import io, os

ROOT = r"D:\视频探索\remotion-ai-kp2"
SRC  = os.path.join(ROOT, "src", "EP06Full.tsx")
DST  = os.path.join(ROOT, "src", "EP07X.tsx")

HEAD = r"""
/* =============================================================
 * EP07X 三打白骨精 · 第一循环 · 28秒 6幕 · 竖版 1080x1920
 * 风格：EP06（深蓝/金/白/红）；每幕一个强形式概念
 * ============================================================= */
"""

SCENES = r"""
const BGX = '#0D1B2A';
const INKX = '#EEF3F6';
const GOLDX = '#F2A93B';
const REDX = '#FF3B30';
const GREYX = '#8FA3B3';
const DEEPX = '#16293D';

/* 山 + 月 + 坟（第1、2幕共用） */
const Wild: React.FC<{ l: number }> = ({ l }) => (
  <g>
    <circle cx={820} cy={300} r={86} fill="#DCE6F2" opacity={0.9} />
    <circle cx={820} cy={300} r={110} fill="#DCE6F2" opacity={0.08} />
    <path d={'M -40 1420 L 220 1050 L 470 1420 Z'} fill="#122238" />
    <path d={'M 380 1420 L 660 980 L 960 1420 Z'} fill="#0F1D30" />
    <path d={'M 760 1420 L 1010 1120 L 1160 1420 Z'} fill="#122238" />
    {/* 坟 */}
    <ellipse cx={540} cy={1500} rx={190} ry={60} fill="#1B3048" />
    <path d={'M 400 1500 q 140 -170 280 0 Z'} fill="#20364E" stroke="#2C4866" strokeWidth={4} />
    <rect x={500} y={1360} width={80} height={110} rx={8} fill="#2C4866" />
    <text x={540} y={1432} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={GREYX}>之墓</text>
  </g>
);

/* 村姑剪影 */
const VillageGirl: React.FC<{ l: number; op: number; x?: number; y?: number; s?: number }> = ({ l, op, x = 540, y = 1180, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <circle cx={0} cy={-210} r={62} fill="#E8DCC8" />
    <path d={'M -46 -252 q 46 -34 92 0 q -16 -30 -46 -30 q -30 0 -46 30 Z'} fill="#3A2A1A" />
    <path d={'M -86 -140 L 86 -140 L 122 140 L -122 140 Z'} fill="#C9A85E" />
    <path d={'M -86 -140 L -20 -140 L -46 140 L -122 140 Z'} fill="#B8974E" />
    <circle cx={0} cy={-206} r={4} fill="#3A2A1A" />
    <circle cx={16} cy={-206} r={4} fill="#3A2A1A" />
    <path d={'M -14 -186 q 14 10 28 0'} fill="none" stroke="#3A2A1A" strokeWidth={4} strokeLinecap="round" />
    {/* 饭篮 */}
    <g transform={'translate(138 40)'}>
      <path d={'M -58 40 q 58 60 116 0 Z'} fill="#B8974E" stroke="#8A6A2A" strokeWidth={4} />
      <path d={'M -58 40 q 58 -70 116 0'} fill="none" stroke="#8A6A2A" strokeWidth={6} />
      <path d={'M -30 34 q 30 -26 60 0'} fill="none" stroke="#E8DCC8" strokeWidth={4} opacity={0.85} />
    </g>
  </g>
);

/* 白骨 */
const Bones: React.FC<{ l: number; op: number; x?: number; y?: number; s?: number }> = ({ l, op, x = 540, y = 1290, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <ellipse cx={0} cy={0} rx={210} ry={54} fill="#0A1420" opacity={0.7} />
    <circle cx={0} cy={-96} r={62} fill="#F2F5FA" stroke="#C9D8EA" strokeWidth={4} />
    <circle cx={-24} cy={-108} r={14} fill="#16293D" />
    <circle cx={24} cy={-108} r={14} fill="#16293D" />
    <rect x={-24} y={-74} width={48} height={16} rx={4} fill="#16293D" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-22 + i * 12} y={-74} width={7} height={16} fill="#F2F5FA" />)}
    <rect x={-10} y={-34} width={20} height={120} rx={8} fill="#F2F5FA" />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M -70 ${i * 30} q 70 ${-24} 140 0`} fill="none" stroke="#F2F5FA" strokeWidth={9} strokeLinecap="round" />
    ))}
    <path d={'M -34 86 L -64 150'} stroke="#F2F5FA" strokeWidth={10} strokeLinecap="round" />
    <path d={'M 34 86 L 64 150'} stroke="#F2F5FA" strokeWidth={10} strokeLinecap="round" />
  </g>
);

/* 悟空（金猴：金头+金箍+红披风） */
const Wukong: React.FC<{ f: number; l: number; x: number; y: number; s: number; op: number; hold?: number }> = ({ f, l, x, y, s, op, hold = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <circle cx={0} cy={-120} r={56} fill="#E8B44A" stroke="#8A6416" strokeWidth={5} />
    <path d={'M -58 -128 q 58 -34 116 0'} fill="none" stroke={GOLDX} strokeWidth={10} strokeLinecap="round" />
    <circle cx={-22} cy={-130} r={5} fill="#16293D" />
    <circle cx={22} cy={-130} r={5} fill="#16293D" />
    <path d={'M -18 -100 q 18 14 36 0'} fill="none" stroke="#8A6416" strokeWidth={5} strokeLinecap="round" />
    <path d={'M -52 -64 L 52 -64 L 76 96 L -76 96 Z'} fill="#B23A2E" />
    <path d={'M -52 -64 L 0 -64 L -34 96 L -76 96 Z'} fill="#8F2A20" />
    {hold > 0 ? (
      <g transform={`translate(${90 + hold * 70} ${-40 - hold * 120}) rotate(${-20 + hold * 40})`}>
        <rect x={-150} y={-10} width={300} height={20} rx={10} fill={GOLDX} stroke="#8A6416" strokeWidth={4} />
        <rect x={-170} y={-16} width={30} height={32} rx={8} fill="#8A6416" />
        <rect x={140} y={-16} width={30} height={32} rx={8} fill="#8A6416" />
      </g>
    ) : null}
  </g>
);

/* ============ 镜1 · 起：一根烟柱（0-4.5s） ============ */
const Scene1: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const rise = eio(clamp01(l / 50));
  const puffs = [0, 1, 2, 3, 4];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGX} />
        <radialGradient id="nightx" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#1B3048" /><stop offset="100%" stopColor={BGX} />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#nightx)'} />
        <Wild l={l} />
        {/* 烟柱：底部粗、往上细、越升越散 */}
        {puffs.map((i) => {
          const p = clamp01((l - 8 - i * 8) / 60);
          const yy = 1430 - p * (500 + i * 60);
          const rr = 26 + p * (60 + i * 22);
          return <circle key={i} cx={540 + Math.sin((f + i * 40) / 26) * (10 + i * 8)} cy={yy} r={rr}
            fill="#C9D8EA" opacity={0.16 + 0.1 * Math.sin(f / 18 + i)} />;
        })}
        <circle cx={540} cy={1420} r={40 + rise * 24} fill="#C9D8EA" opacity={0.22} />
        <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={INKX}
          opacity={ez(l - 12, 12)}>荒山野岭，一座孤坟</text>
      </svg>
    </div>
  );
};

/* ============ 镜2 · 凝：烟塌成人形（4.5-9s） ============ */
const Scene2: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const suck = eio(clamp01((l - 8) / 44));
  const form = ez(l - 46, 14);
  const smokeR = 300 * (1 - suck * 0.82);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGX} />
        <Wild l={l} />
        <VillageGirl l={l} op={form} />
        {/* 烟往中心塌 */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2 + f * 0.04;
          return <circle key={i} cx={540 + Math.cos(a) * smokeR} cy={1130 + Math.sin(a) * smokeR * 0.8}
            r={60 * (1 - suck * 0.4)} fill="#C9D8EA" opacity={0.26 * (1 - suck * 0.6)} />;
        })}
        <circle cx={540} cy={1130} r={220 * (1 - suck) + 40} fill="#C9D8EA" opacity={0.14 * (1 - suck)} />
        {/* 凝成时金光一闪 */}
        {l >= 46 && l < 60 ? (
          <circle cx={540} cy={1100} r={70 + (l - 46) * 26} fill="none" stroke={GOLDX} strokeWidth={9 - (l - 46) * 0.3} opacity={1 - (l - 46) / 14} />
        ) : null}
        <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={INKX}
          opacity={ez(l - 8, 12)}>一缕白烟，凝成人形</text>
      </svg>
    </div>
  );
};

/* ============ 镜3 · 信：金星飞过去（9-13.5s） ============ */
const Scene3: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const walk = clamp01(l / 40);
  const tx = -160 + walk * 420;
  const starP = clamp01((l - 26) / 22);
  const se = eio(starP);
  const sx = 300 + se * 260;
  const sy = 1130 - Math.sin(se * Math.PI) * 120;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGX} />
        <Wild l={l} />
        <VillageGirl l={l} op={1} />
        {/* 饭篮热气 */}
        {[0, 1, 2].map((i) => {
          const p = ((f / 30 + i * 0.33) % 1);
          return <circle key={i} cx={678 + i * 8} cy={1180 - p * 90} r={18 + p * 16} fill="#E8DCC8" opacity={(1 - p) * 0.35} />;
        })}
        <g transform={`translate(${tx} 1340)`}>
          <LaoJia x={0} y={0} s={1.05} mode={'present'} f={f} wag={l > 30} />
        </g>
        {/* 眼里的金星 → 飞到村姑身上 */}
        {l >= 26 ? (
          <g>
            <circle cx={sx} cy={sy} r={16} fill={GOLDX} />
            <path d={`M ${sx} ${sy - 30} L ${sx + 8} ${sy - 8} L ${sx + 30} ${sy - 8} L ${sx + 12} ${sy + 6} L ${sx + 20} ${sy + 28} L ${sx} ${sy + 14} L ${sx - 20} ${sy + 28} L ${sx - 12} ${sy + 6} L ${sx - 30} ${sy - 8} L ${sx - 8} ${sy - 8} Z`} fill={GOLDX} opacity={0.9} />
          </g>
        ) : null}
        <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={INKX}
          opacity={ez(l - 6, 10)}>唐僧：善哉，正饿着呢</text>
        <text x={540} y={1700} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill={GOLDX}
          opacity={ez(l - 56, 12)}>他信了</text>
      </svg>
    </div>
  );
};

/* ============ 镜4 · 睁：一只眼睛占满屏（13.5-18s） ============ */
const Scene4: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const zoom = 1 + 0.5 * eio(clamp01(l / 40));
  const open = ez(l - 14, 12);
  const flash = l >= 30 && l < 40 ? (1 - (l - 30) / 10) * 0.85 : 0;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill="#1A0E06" />
        <radialGradient id="eyeg" cx="50%" cy="44%" r="52%">
          <stop offset="0%" stopColor="#6A3A08" /><stop offset="100%" stopColor="#1A0E06" />
        </radialGradient>
        <rect width={1080} height={1920} fill={'url(#eyeg)'} />
        <g transform={`translate(540 980) scale(${zoom})`}>
          {/* 眼皮张开 */}
          <path d={`M -420 ${-40 * (1 - open)} Q 0 ${-300 * (1 - open) - 40} 420 ${-40 * (1 - open)} Q 0 ${300 * (1 - open) + 40} -420 ${-40 * (1 - open)} Z`}
            fill="none" stroke={GOLDX} strokeWidth={12} />
          <path d={`M -420 ${-40 * open} Q 0 ${-280 * open} 420 ${-40 * open} Q 0 ${280 * open} -420 ${-40 * open} Z`}
            fill="#F2F5FA" opacity={open * 0.14} />
          {/* 眼珠 */}
          <circle cx={0} cy={0} r={190 * open} fill={GOLDX} />
          <circle cx={0} cy={0} r={110 * open} fill="#1A0E06" />
          <circle cx={-70 * open} cy={-60 * open} r={34 * open} fill="#FFF3C4" opacity={0.9} />
          {/* 火焰纹 */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2 + f * 0.06;
            return <path key={i} d={`M ${Math.cos(a) * 210 * open} ${Math.sin(a) * 210 * open} l ${Math.cos(a) * 40 * open} ${Math.sin(a) * 40 * open}`}
              stroke={GOLDX} strokeWidth={9} strokeLinecap="round" opacity={0.7 * open} />;
          })}
        </g>
        <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={62} fontWeight={900} fill={INKX}
          opacity={ez(l - 6, 10)}>悟空睁开火眼金睛</text>
        {flash > 0 ? <rect width={1080} height={1920} fill={GOLDX} opacity={flash} /> : null}
      </svg>
    </div>
  );
};

/* ============ 镜5 · 打：一棒落下，世界重构（18-23s） ============ */
const Scene5: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const fall = clamp01(l / 14);
  const hit = l >= 14;
  const [shx, shy] = shake(l, 14, 18);
  const smoke = clamp01((l - 14) / 26);
  const boneP = ez(l - 34, 14);
  const leafP = ez(l - 40, 14);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGX} />
        <Wild l={l} />
        {/* 村姑：被打前 → 散成烟 */}
        <VillageGirl l={l} op={hit ? Math.max(0, 1 - smoke * 2.4) : 1} />
        {hit ? (
          <g>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const a = (i / 7) * Math.PI * 2;
              return <circle key={i} cx={540 + Math.cos(a) * smoke * 340} cy={1030 + Math.sin(a) * smoke * 300}
                r={50 + smoke * 40} fill="#C9D8EA" opacity={0.5 * (1 - smoke)} />;
            })}
          </g>
        ) : null}
        {/* 白骨：烟散后露出来 */}
        {boneP > 0 ? <Bones l={l} op={boneP} /> : null}
        {/* 饭篮 → 树叶 */}
        {leafP > 0 ? (
          <g opacity={leafP} transform={'translate(690 1400)'}>
            {[[-30, 0, -20], [10, 10, 15], [40, -6, -8]].map(([x, y, r], i) => (
              <path key={i} d={'M -34 0 q 34 -26 68 0 q -34 26 -68 0 Z'} fill="#8A9A4A" transform={`translate(${x} ${y}) rotate(${r})`} />
            ))}
          </g>
        ) : null}
        {/* 金箍棒 */}
        <g transform={`translate(880 ${-700 + fall * 1500}) rotate(28)`}>
          <rect x={-24} y={-260} width={48} height={520} rx={24} fill={GOLDX} stroke="#8A6416" strokeWidth={5} />
          <rect x={-32} y={-280} width={64} height={44} rx={12} fill="#8A6416" />
          <rect x={-32} y={236} width={64} height={44} rx={12} fill="#8A6416" />
        </g>
        <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={64} fontWeight={900} fill={INKX}
          opacity={ez(l - 2, 8)}>一棒下去</text>
        <text x={540} y={1730} textAnchor="middle" fontFamily={FONT} fontSize={56} fontWeight={900} fill={REDX}
          opacity={ez(l - 44, 14)}>全是假的</text>
        {l >= 14 && l < 22 ? <rect width={1080} height={1920} fill="#FFFFFF" opacity={(1 - (l - 14) / 8) * 0.55} /> : null}
      </svg>
    </div>
  );
};

/* ============ 镜6 · 念：金箍勒紧（23-28s） ============ */
const Scene6: React.FC<{ f: number; l: number }> = ({ f, l }) => {
  const tight = 1 - 0.22 * eio(clamp01(l / 40));
  const [shx, shy] = shake(l, 20, 6);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${shx}px, ${shy}px)` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <rect width={1080} height={1920} fill={BGX} />
        <Wild l={l} />
        {/* 悟空抱头 */}
        <g transform={`translate(700 ${1290 + Math.sin(l * 0.5) * 6})`}>
          <Wukong f={f} l={l} x={0} y={0} s={1} op={1} hold={0} />
          <path d={'M -70 -150 q 20 -40 50 -10'} fill="none" stroke={GOLDX} strokeWidth={10} strokeLinecap="round" />
        </g>
        {/* 金箍收紧 */}
        <g transform={`translate(700 1180) scale(${tight})`}>
          <circle cx={0} cy={0} r={62} fill="none" stroke={GOLDX} strokeWidth={12} />
          <circle cx={0} cy={0} r={62} fill="none" stroke="#FFF3C4" strokeWidth={4} opacity={0.6 + 0.4 * Math.sin(f / 4)} />
        </g>
        {/* 唐僧盘腿念咒 */}
        <g transform={'translate(300 1330)'}>
          <LaoJia x={0} y={0} s={0.95} mode={'talk'} f={f} wag={true} />
        </g>
        {/* 咒字往上飘 */}
        {['唵', '嘛', '呢', '叭', '咪'].map((s, i) => {
          const p = clamp01((l - 6 - i * 6) / 44);
          return <text key={i} x={300 + Math.sin(i * 2 + f / 20) * 60} y={1200 - p * 380} textAnchor="middle"
            fontFamily={FONT} fontSize={40} fontWeight={900} fill={GOLDX} opacity={(1 - p) * 0.85}>{s}</text>;
        })}
        <text x={540} y={300} textAnchor="middle" fontFamily={FONT} fontSize={60} fontWeight={900} fill={INKX}
          opacity={ez(l - 6, 10)}>唐僧反倒念起紧箍咒</text>
        <text x={540} y={1710} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill={GREYX}
          opacity={ez(l - 52, 14)}>错怪了说真话的</text>
      </svg>
    </div>
  );
};
"""

MAIN = r"""
const SUBSX: [number, number, string][] = [
  [0, 4.5, '荒山野岭，一座孤坟'],
  [4.5, 9.0, '一缕白烟，凝成人形'],
  [9.0, 13.5, '唐僧信了：善哉，有人送饭'],
  [13.5, 18.0, '悟空睁开火眼金睛'],
  [18.0, 23.0, '一棒下去，全是假的'],
  [23.0, 28.0, '唐僧反倒念起紧箍咒'],
];

const SubX: React.FC<{ t: number }> = ({ t }) => {
  const seg = SUBSX.find((s) => t >= s[0] && t < s[1]);
  if (!seg) return null;
  const chars = Array.from(seg[2]);
  const step = Math.min(0.1, ((seg[1] - seg[0]) / Math.max(1, chars.length)) * 0.82);
  const n = Math.min(chars.length, Math.floor((t - seg[0]) / step) + 1);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1590, textAlign: 'center', padding: '0 50px' }}>
      {chars.map((ch, i) => (
        <span key={i} style={{
          fontFamily: FONT, fontSize: 44, fontWeight: 900, display: 'inline-block',
          color: i === n - 1 ? GOLDX : (i < n ? INKX : '#3A4A5E'),
          transform: i === n - 1 ? 'scale(1.12)' : 'scale(1)',
        }}>{ch}</span>
      ))}
    </div>
  );
};

const SEX: [number, string, number][] = [
  [2, 'sfx/whoosh.wav', 0.55],
  [140, 'sfx/ding.mp3', 0.8],
  [396, 'sfx/ding.mp3', 0.6],
  [420, 'sfx/boom.wav', 0.9],
  [546, 'sfx/boom.wav', 0.85],
  [560, 'sfx/hit_1750.wav', 0.95],
  [700, 'sfx/da.mp3', 0.8],
  [742, 'sfx/ding.mp3', 0.7],
];

const BOUNDSX: [number, number][] = [[0, 135], [135, 270], [270, 405], [405, 540], [540, 690], [690, 840]];

export const EP07X: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let seg = 0;
  for (let i = 0; i < BOUNDSX.length; i++) {
    if (frame < BOUNDSX[i][1]) { seg = i; break; }
    seg = i;
  }
  const [b0] = BOUNDSX[seg];
  const l = frame - b0;
  const SC = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];
  const Scene = SC[seg];
  const cutFlash = frame - b0 < 3 ? (1 - (frame - b0) / 3) * 0.16 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BGX }}>
      <Scene f={frame} l={l} />
      {SEX.map(([f, src, v], i) => (
        <Sequence key={i} from={f} durationInFrames={45} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Audio src={staticFile('bgm_midnight.m4a')} volume={1} />
      <SubX t={t} />
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
    print("EP07X.tsx:", len(out), "字 | 镜:", out.count("const Scene"))

if __name__ == "__main__":
    main()
