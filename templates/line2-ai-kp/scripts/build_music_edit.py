# -*- coding: utf-8 -*-
"""把 Midnight Rush 剪成 6 段：在 5 个数字节点 + 螺旋到顶处做「停半拍 + 叮」。
输出 public/bgm_midnight_edit.m4a，长度严格等于视频 2525 帧 / 30fps。
"""
import subprocess, sys
import numpy as np

SR = 44100
FPS = 30
TOTAL_FRAMES = 2525
DUR = TOTAL_FRAMES / FPS

# 数字落定的帧（与 repeatScript.ts 的 F[] 对齐）
NODE_N = [209, 736, 1659, 2233, 2393]      # 1%金点 / 1000 / 365 / 37.78 / 水滴石穿
SPIRAL_N = 1962                             # 螺旋钻到顶
NODE_T = [n / FPS for n in NODE_N]
SPIRAL_T = SPIRAL_N / FPS

GAP = 0.30          # 主节点：音乐停多久
FADE_OUT = 0.045
FADE_IN = 0.035
F0 = 698.46         # F5，跟曲子调性一致


def load_src():
    wav = 'out/midnight_44k.wav'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'public/bgm_midnight.m4a',
                    '-ac', '1', '-ar', str(SR), '-c:a', 'pcm_s16le', wav], check=True)
    from scipy.io import wavfile
    sr, x = wavfile.read(wav)
    x = x.astype(np.float32) / 32768.0
    assert sr == SR
    return x


def env_fade(x, fin, fout):
    n = len(x)
    e = np.ones(n, dtype=np.float32)
    a = min(n, int(fin * SR))
    b = min(n, int(fout * SR))
    if a > 0:
        e[:a] = np.linspace(0, 1, a) ** 0.6
    if b > 0:
        e[-b:] *= np.linspace(1, 0, b) ** 1.4
    return x * e


def ding(sr=SR, dur=0.95, f0=F0, gain=1.0):
    n = int(sr * dur)
    t = np.arange(n) / sr
    # 轻微下滑，像「滴」落下来
    pitch = f0 * (1 + 0.035 * np.exp(-t * 55))
    phase = 2 * np.pi * np.cumsum(pitch) / sr
    ratios = [1.0, 2.0, 3.01, 4.17, 5.43]
    amps = [1.0, 0.42, 0.20, 0.11, 0.06]
    decays = [4.2, 6.5, 9.0, 12.0, 16.0]
    y = np.zeros(n, dtype=np.float64)
    for r, a, d in zip(ratios, amps, decays):
        y += a * np.sin(phase * r) * np.exp(-t * d)
    # 起音的一点亮片
    click = np.random.randn(n) * np.exp(-t * 160) * 0.05
    y += click
    a = int(0.002 * sr)
    y[:a] *= np.linspace(0, 1, a)
    # 短混响，融进音乐
    ir_n = int(0.30 * sr)
    ir_t = np.arange(ir_n) / sr
    ir = np.random.randn(ir_n) * np.exp(-ir_t * 11)
    ir[:int(0.004 * sr)] = 0
    ir /= np.max(np.abs(ir)) + 1e-9
    wet = np.convolve(y, ir, mode='full')[:n]
    y = y * 0.80 + wet * 0.22
    y = y / (np.max(np.abs(y)) + 1e-9) * 0.55 * gain
    return y.astype(np.float32)


def main():
    src = load_src()
    out = np.zeros(int(np.ceil(DUR * SR)) + SR, dtype=np.float32)
    d = ding()
    spiral_d = ding(gain=0.62)

    events = [(t, 'stop') for t in NODE_T] + [(SPIRAL_T, 'duck')]
    events.sort()

    vid = 0.0      # 视频时间游标
    sidx = 0       # 源音乐样本游标

    def copy_seg(v0, v1, fin=0.0, fout=0.0):
        nonlocal sidx
        n = int((v1 - v0) * SR)
        seg = src[sidx:sidx + n].copy()
        sidx += n
        seg = env_fade(seg, fin, fout)
        a = int(round(v0 * SR))
        out[a:a + len(seg)] += seg

    for t, kind in events:
        if kind == 'stop':
            copy_seg(vid, t, 0, FADE_OUT)
            # 停半拍：留白 + 叮
            a = int(round(t * SR))
            L = int(min(len(d), (GAP + 0.55) * SR))
            out[a:a + L] += d[:L]
            vid = t + GAP
        else:
            # 螺旋到顶：音乐压到 40% 0.16 秒，叮一声再回
            copy_seg(vid, t, 0, 0)
            duck_len = 0.16
            n = int(duck_len * SR)
            seg = src[sidx:sidx + n].copy()
            sidx += n
            ramp = int(0.05 * SR)
            env = np.ones(n, dtype=np.float32)
            env[:ramp] = np.linspace(1, 0.40, ramp)
            env[-ramp:] = np.linspace(0.40, 1, ramp)
            a = int(round(t * SR))
            out[a:a + n] += seg * env
            L = min(len(spiral_d), int(0.7 * SR))
            out[a:a + L] += spiral_d[:L]
            vid = t + duck_len

    # 剩余音乐：接到片尾
    remain = DUR - vid
    copy_seg(vid, vid + remain, FADE_IN, 0.8)

    out = out[:int(round(DUR * SR))]
    peak = float(np.max(np.abs(out)))
    if peak > 0.89:
        out *= 0.89 / peak
    print('len %.3fs  peak %.3f (%.1f dBFS)' % (len(out) / SR, float(np.max(np.abs(out))),
                                                20 * np.log10(float(np.max(np.abs(out))) + 1e-9)))
    from scipy.io import wavfile
    wavfile.write('out/bgm_midnight_edit.wav', SR, (out * 32767).astype(np.int16))
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', 'out/bgm_midnight_edit.wav',
                    '-af', 'pan=stereo|c0=c0|c1=c0',
                    '-c:a', 'aac', '-b:a', '192k', 'public/bgm_midnight_edit.m4a'], check=True)
    print('wrote public/bgm_midnight_edit.m4a')


if __name__ == '__main__':
    main()
