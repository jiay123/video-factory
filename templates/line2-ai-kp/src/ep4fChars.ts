// EP04 正式版 逐字时间戳（由 scripts/gen_chars_ep4f.py 生成，勿手改）
import raw from './ep4fChars.json';

export type CharItem = { c: string; t: number };
export type Cue = { i: number; start: number; dur: number; end: number; text: string; chars: CharItem[] };

export const CUES: Cue[] = raw as unknown as Cue[];
export const CHARS: CharItem[][] = CUES.map((c) => c.chars);
export const TOTAL_SEC = CUES.length ? CUES[CUES.length - 1].end : 0;
export const TOTAL_FRAMES = Math.ceil(TOTAL_SEC * 30) + 24;

export const charAt = (seg: number, word: string): number => {
  const ch = CHARS[seg] ?? [];
  const idx = ch.findIndex((x) => x.c === word);
  return idx < 0 ? -1 : ch[idx].t;
};
