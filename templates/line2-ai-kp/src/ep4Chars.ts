// EP04 逐字时间戳（由 scripts/gen_chars_ep4.py 自动生成，勿手改）
import raw from './ep4Chars.json';

export type CharItem = { c: string; t: number };
export type Cue = { i: number; start: number; dur: number; end: number; text: string; chars: CharItem[] };

export const CUES: Cue[] = raw as unknown as Cue[];
export const CHARS: CharItem[][] = CUES.map((c) => c.chars);
export const TOTAL_SEC = CUES.length ? CUES[CUES.length - 1].end : 0;

/** 查某个词第一次出现的时间（秒）；找不到返回 -1 */
export const charAt = (seg: number, word: string): number => {
  const ch = CHARS[seg] ?? [];
  const idx = ch.findIndex((x) => x.c === word);
  return idx < 0 ? -1 : ch[idx].t;
};
