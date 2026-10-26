export type CharItem = { c: string; t: number };
export type Cue = { i: number; start: number; dur: number; end: number; text: string; chars: CharItem[] };

const RAW: [number, string][] = [
  [6.4, 'GPT-3 有 1750 亿个参数'],
  [6.2, '参数，就是它记住的一条条小经验'],
  [7.4, '往左拧一点，它说是猫；往右拧一点，它说是狗'],
  [6.4, '1750 亿个旋钮，排起来能绕地球好几圈'],
  [5.6, '这么大的东西，全塞进一个箱子'],
  [7.4, '1750 亿个参数，塞满也就 350 个 G，一块移动硬盘就装得下'],
  [6.4, '那为什么还要越堆越多？参数越多，记得越细'],
  [6.6, '参数是练出来的，不是写出来的'],
  [6.4, '但饭量也跟着涨：训练一次，烧掉上百万度电'],
  [6.6, '那为什么不无限加？参数越多，越贵、越慢'],
  [6.4, '所以参数量不是智商，是饭量'],
  [3.4, '下集：它为什么会一本正经地胡说'],
];

let acc = 0;
export const CUES: Cue[] = RAW.map(([dur, text], i) => {
  const start = acc;
  acc += dur;
  const end = acc;
  const chars = Array.from(text);
  const span = Math.min(chars.length * 0.135, dur - 0.8);
  const step = chars.length > 1 ? span / (chars.length - 1) : 0;
  return {
    i,
    start,
    dur,
    end,
    text,
    chars: chars.map((c, k) => ({ c, t: start + 0.32 + k * step })),
  };
});

export const CHARS: CharItem[][] = CUES.map((c) => c.chars);
export const TOTAL_SEC = CUES.length ? CUES[CUES.length - 1].end : 0;
export const TOTAL_FRAMES = Math.ceil(TOTAL_SEC * 30) + 24;

export const charAt = (seg: number, word: string): number => {
  const ch = CHARS[seg] ?? [];
  const idx = ch.findIndex((x) => x.c === word);
  return idx < 0 ? -1 : ch[idx].t;
};
