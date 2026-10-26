# -*- coding: utf-8 -*-
"""Midnight Rush 微剪：只做两处小节级编辑，让曲子自己的重拍落在 5 个数字节点上。
1) 删掉 8.54s 高潮前的 4 拍（让第一次高潮提前到 6.40s，对上 1% 黄点）
2) 在 19.73s 处补回 4 拍（整段净位移归零，后面 25.05/55.61/74.98/79.11 的重拍原位不动）
不加减速、不加音效、不改音色。
"""
import subprocess
import numpy as np
from scipy.io import wavfile

SR = 44100
FPS = 30
TOTAL_FRAMES = 2525
DUR = TOTAL_FRAMES / FPS

BEAT = 60 / 112.34714673913044          # 0.53425s
BAR = 4 * BEAT                           # 2.13699s
A1 = 8.54                                # 第一次大高潮
CUT2 = 19.734                            # 补拍位置（视频时间）
S2 = CUT2 + (A1 - 6.404)                 # 对应的源时间 = 21.87


def load():
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'public/bgm_midnight.m4a',
                    '-ac', '2', '-ar', str(SR), '-c:a', 'pcm_s16le', 'out/src_stereo.wav'], check=True)
    sr, x = wavfile.read('out/src_stereo.wav')
    x = x.astype(np.float32) / 32768.0
    assert sr == SR
    return x


def fade(x, fin=0.0, fout=0.0):
    n = len(x)
    y = x.copy()
    a = min(n, int(fin * SR))
    b = min(n, int(fout * SR))
    if a:
        y[:a] *= np.linspace(0, 1, a)[:, None] ** 0.5
    if b:
        y[-b:] *= np.linspace(1, 0, b)[:, None] ** 0.5
    return y


def main():
    src = load()
    out = np.zeros((int(round(DUR * SR)), 2), dtype=np.float32)

    def put(dst_t, seg):
        a = int(round(dst_t * SR))
        out[a:a + len(seg)] += seg

    # 1) 0 -> 6.404（源 0 -> 6.404），删掉 6.404-8.54 四拍
    put(0.0, fade(src[:int(round(6.404 * SR))], 0, 0.006))
    # 2) 接第一次高潮，源 8.54 -> 21.87，放到视频 6.404 -> 19.734
    put(6.404, fade(src[int(round(A1 * SR)):int(round(S2 * SR))], 0.004, 0.004))
    # 3) 补回 4 拍：重复源 19.734 -> 21.87
    put(CUT2, fade(src[int(round(CUT2 * SR)):int(round(S2 * SR))], 0.003, 0.003))
    # 4) 之后整段原样，源 21.87 -> 片尾
    tail = src[int(round(S2 * SR)):]
    need = int(round(DUR * SR)) - int(round(S2 * SR))
    if len(tail) < need:
        tail = np.pad(tail, ((0, need - len(tail)), (0, 0)))
    put(S2, fade(tail[:need], 0, 0.8))

    peak = float(np.max(np.abs(out)))
    if peak > 0.89:
        out *= 0.89 / peak
    print('len %.3fs peak %.3f' % (len(out) / SR, float(np.max(np.abs(out)))))
    wavfile.write('out/bgm_cut.wav', SR, (np.clip(out, -1, 1) * 32767).astype(np.int16))
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'out/bgm_cut.wav',
                    '-c:a', 'aac', '-b:a', '192k', 'public/bgm_midnight_cut.m4a'], check=True)
    print('wrote public/bgm_midnight_cut.m4a')


if __name__ == '__main__':
    main()
