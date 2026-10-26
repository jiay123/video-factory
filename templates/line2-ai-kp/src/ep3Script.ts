// EP03《Agent 是怎么动手干活的》· 竖屏 9:16 · 唯一真源
// 双 IP：火柴人老贾（嘴里吐字/吐工具）+ 小模（会演的 AI）
// 每幕都要"活" · 大字带动效 · 节奏放慢、不挤
export const SCRIPT: { cn: string }[] = [
  { cn: '老贾递给小模一瓶汽水。它想拧开盖子，可手太短，够不着——AI 有脑子，却没有手。' },
  { cn: '别急，给它一套工具呢？一个大箱子从天而降，扳手、放大镜、计算器，哐当一声，全落到它脚边。' },
  { cn: '有了工具，小模就厉害了。它自己去查：明天天气怎么样？今天世界发生了什么大事？再算一下这个数。查完一个，再查一个，它还能自己拿主意。这时候它不只是会聊天了，它变成了 Agent。' },
  { cn: '它还会记。你说过的话，它记在小本本上，下次不用重新交代。这是它和金鱼记忆机器人最大的区别。' },
  { cn: '最关键的是循环：想一下，动一下，看看结果对不对，不对就调整，再动一下，转圈，直到把事办成。' },
  { cn: '现在，它有脑子、有手、有记忆。可还有一个谜——它到底是怎么转起来的？下一集，我们拆开看。' },
];

// 幕间停顿（秒）—— 老贾 10/21：时间加长一点，别那么紧凑
export const GAP = 1.0;

// 工具箱里飞出的四件工具（幕2）
export type ToolKind = 'wrench' | 'glass' | 'calc' | 'note';
export const TOOLS: { kind: ToolKind; label: string; c: string; side: -1 | 1 }[] = [
  { kind: 'glass', label: '查', c: '#0A84FF', side: -1 },
  { kind: 'calc', label: '算', c: '#FFB800', side: -1 },
  { kind: 'note', label: '记', c: '#1E9E4A', side: 1 },
  { kind: 'wrench', label: '修', c: '#FF3B30', side: 1 },
];

// 幕3：小模自己查出来的三个答案（重点展示）
export const QUERIES: { label: string; ans: string; c: string }[] = [
  { label: '查天气', ans: '明天 晴 26°', c: '#0A84FF' },
  { label: '查大事', ans: 'AI 又进化了', c: '#FF3B30' },
  { label: '做计算', ans: '128 × 7 = 896', c: '#FFB800' },
];

// 幕4：小模记住的卡片
export const MEMOS: string[] = ['你喜欢猫', '你在上海', '上次聊爬山'];

// 幕5：Agent 四步闭环
export const STATIONS: { key: string; label: string; c: string }[] = [
  { key: 'think', label: '想', c: '#0A84FF' },
  { key: 'act', label: '做', c: '#FFB800' },
  { key: 'look', label: '看', c: '#1E9E4A' },
  { key: 'loop', label: '再想', c: '#FF3B30' },
];
