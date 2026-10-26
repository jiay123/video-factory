export type CharItem = { c: string; t: number };
export type Cue = { i: number; start: number; dur: number; end: number; text: string; chars: CharItem[] };

const RAW: [number, string][] = [
  [7.2, '你问它一个冷知识，它能编得特别自信'],
  [6.6, '因为它只会接龙，不会查资料'],
  [5.8, '办法特别简单：先查，再答'],
  [6.8, '第一步，检索：把问题变成关键词，去知识库里翻'],
  [6.4, '第二步，拼接：把翻到的那几页，原样塞进它的上下文'],
  [6.4, '第三步，生成：这时候它说的话，句句有出处'],
  [5.6, '这套流程叫 RAG，检索增强生成'],
  [7.0, '有多管用？同一套题，不查答对三成八，查了答对九成二'],
  [6.6, '实测来源：SimpleQA 基准，带检索翻了一倍多'],
  [7.0, '坑说清楚：知识库要是有错，它照样一本正经地错'],
  [5.8, '所以先查再答，AI 就不瞎编了'],
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
