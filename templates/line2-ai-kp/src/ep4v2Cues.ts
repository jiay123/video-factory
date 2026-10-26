export type CharItem = { c: string; t: number };
export type Cue = { i: number; start: number; dur: number; end: number; text: string; chars: CharItem[] };

const RAW: [number, string][] = [
  [5.0, '你跟 AI 说一句话，它就自己把活干完了'],
  [4.2, '它不是一次答完，它是在转圈'],
  [5.2, '它先把你的话，和整个项目，读进一条记忆条'],
  [4.6, '真正拍板的，是里头的那个模型'],
  [5.0, '模型不会动手，它只会说一句话：调这个工具'],
  [5.2, '外面那层真的去调，调完把结果喂回来'],
  [5.8, '看一眼，再想，再调 —— 这就是一个圈'],
  [4.4, '圈越转越多，记忆条就越满'],
  [5.4, '满了怎么办？把老资料压成一段摘要，接着转'],
  [4.8, '碰上拿不准的，它还会停下来问你'],
  [5.6, 'ChatGPT 答一句就停，Agent 是自己把活干完'],
  [5.4, '所以 Agent，就是一个会自己转圈的模型'],
  [5.0, '下集：1750 亿个参数，到底是个啥'],
  [4.0, '点赞、关注、转发，我们下集见'],
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

/** 幕内每 60 帧（2 秒）切一个子镜头，保证「每一秒都有新画面」 */
export const SUB = 60;
export const subOf = (l: number) => Math.max(0, Math.floor(l / SUB));
export const subLocal = (l: number) => l - subOf(l) * SUB;

export const charAt = (seg: number, word: string): number => {
  const ch = CHARS[seg] ?? [];
  const idx = ch.findIndex((x) => x.c === word);
  return idx < 0 ? -1 : ch[idx].t;
};
