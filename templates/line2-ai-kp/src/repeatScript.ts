// 《重复》Beats —— 唯一真源。无配音（T.O.M 风格：纯音乐+动效+字幕）
// 每一幕都是一个「会动的数据可视化」，不许出现静态文字 PPT
// 知识口径已核实（2026-10-18）：伯努利/维纳归因取一手来源，坑点全规避
export type Beat = { cn: string; en: string; dur: number };

export const BEATS: Beat[] = [
  { cn: '想做成一件事，\n成功率只有 1%', en: '', dur: 136 / 30 },
  { cn: '只试一次，\n99% 会失败', en: '', dur: 80 / 30 },
  { cn: '那就，再来一次。', en: 'Try again.', dur: 105 / 30 },
  { cn: '重复伯努利实验', en: 'REPEATED BERNOULLI TRIALS', dur: 78 / 30 },
  { cn: '伯努利原理：\n流速越快，压强越低', en: "Bernoulli's principle", dur: 115 / 30 },
  { cn: '喷雾瓶一按就出雾，\n靠的就是这股压强差', en: 'pressure difference', dur: 78 / 30 },
  { cn: '同一个实验，\n重复 1000 次', en: 'repeat × 1000', dur: 174 / 30 },
  { cn: '连"机翼为什么能飞"的错误答案，\n也被重复了几十年', en: 'the wrong answer, repeated', dur: 82 / 30 },
  { cn: '重复，会把你的信念\n越刻越深', en: 'engraved deeper', dur: 174 / 30 },
  { cn: '1985 年，心理学家维纳\n提出归因理论', en: 'Weiner, attribution theory', dur: 81 / 30 },
  { cn: '人给成败找原因，\n只看三件事', en: 'locus · stability · control', dur: 162 / 30 },
  { cn: '同样考砸了：\n有人说"我没努力"，有人说"我笨"', en: 'same failure, two thoughts', dur: 139 / 30 },
  { cn: '一个能改，一个像天生', en: 'fixable / born', dur: 76 / 30 },
  { cn: '这个念头，\n每天重复', en: 'every single day', dur: 132 / 30 },
  { cn: '行为重复改变结果，\n念头重复改变人', en: 'both change you', dur: 255 / 30 },
  { cn: '但重复不是画圈，\n是螺旋', en: 'not a circle — a spiral', dur: 174 / 30 },
  { cn: '只做不改进，是磨损；\n每次好一点，才叫复利', en: 'wear out vs compound', dur: 81 / 30 },
  { cn: '每天进步 1%，\n一年后是 37.78 倍', en: '1% better every day = 37.78x in a year', dur: 123 / 30 },
  { cn: '绳锯木断，水滴石穿', en: 'drip by drip, the stone is worn', dur: 75 / 30 },
  { cn: '成功，源于正确的重复', en: 'Success comes from the right repetition', dur: 106 / 30 },
];

export const FPS = 30;
export const F: number[] = (() => {
  const out = [0];
  let acc = 0;
  for (const b of BEATS) { acc += b.dur * FPS; out.push(Math.round(acc)); }
  return out;
})();
export const TOTAL_SEC = BEATS.reduce((s, b) => s + b.dur, 0);
export const TOTAL_FRAMES = F[F.length - 1];
