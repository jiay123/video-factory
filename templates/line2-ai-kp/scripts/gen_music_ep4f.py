# -*- coding: utf-8 -*-
"""EP04 正式版 60秒 · 音乐与音效（numpy 全合成，零成本）
时间轴从 src/ep4fChars.json 读（画面和声音同一份数据）
用法：python gen_music_ep4f.py  ->  public/audio4/ep04f_music.wav
"""
import json
import os

import numpy as np

BASE = r"D:\视频探索\remotion-ai-kp2"
OUT = os.path.join(BASE, "public", "audio4", "ep04f_music.wav")
CHARS = os.path.join(BASE, "src", "ep4fChars.json")

cues = json.load(open(CHARS, encoding="utf-8"))
S = [(c["start"], c["end"]) for c in cues]
DUR = S[-1][1] + 0.6
SR = 48000
BPM = 120
BEAT = 60.0 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(23)

bus = np.zeros((2, N))


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0:
        return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414])
    n = min(sig.shape[1], N - i)
    bus[:, i:i + n] += sig * gain


def tt(n):
    return np.arange(n) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def kick(dur=0.32, f0=130, f1=48):
    t = tt(int(dur * SR))
    ph = 2 * np.pi * (f1 * t + (f0 - f1) * (1 - np.exp(-t * 22)) / 22)
    return np.sin(ph) * np.exp(-t * 9) * 0.9


def hat(dur=0.05):
    t = tt(int(dur * SR))
    n = rng.normal(0, 1, len(t))
    return (n - n.mean()) * np.exp(-t * 60) * 0.22


def snare(dur=0.18):
    t = tt(int(dur * SR))
    n = rng.normal(0, 1, len(t))
    return (n * np.exp(-t * 26) * 0.4 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.25)


def thud(dur=0.45, f=78):
    t = tt(int(dur * SR))
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 7) * 0.8


def ping(dur=0.55, f=880, gain=0.5):
    t = tt(int(dur * SR))
    return (np.sin(2 * np.pi * f * t) * 0.7 + np.sin(2 * np.pi * f * 2 * t) * 0.25) * np.exp(-t * 5) * gain


def click(dur=0.035, f=2400):
    t = tt(int(dur * SR))
    return (rng.normal(0, 1, len(t)) * 0.5 + np.sin(2 * np.pi * f * t) * 0.5) * np.exp(-t * 70) * 0.35


def whoosh(dur=0.6, up=True):
    t = tt(int(dur * SR))
    n = rng.normal(0, 1, len(t))
    k = int(0.02 * SR)
    sm = np.convolve(n, np.ones(k) / k, mode="same")
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    s = (n - sm) * env * 0.5
    if not up:
        s = s[::-1]
    return s


def chime(dur=1.6, notes=(880, 1108, 1320)):
    out = np.zeros(int(dur * SR))
    for k, f in enumerate(notes):
        t = tt(len(out))
        out += np.sin(2 * np.pi * f * t) * np.exp(-t * (5 - k)) * 0.26
    return out


def impact(dur=1.0):
    t = tt(int(dur * SR))
    n = rng.normal(0, 1, len(t))
    return (np.sin(2 * np.pi * 52 * t) * np.exp(-t * 5) * 0.9 + n * np.exp(-t * 22) * 0.35)


def buzz(dur=0.9, f=160):
    t = tt(int(dur * SR))
    return (np.sign(np.sin(2 * np.pi * f * t)) * 0.18 + np.sin(2 * np.pi * f * 1.01 * t) * 0.3) * np.exp(-t * 2.2)


def riser(dur=2.0, f0=200, f1=1800):
    t = tt(int(dur * SR))
    k = np.cumsum(rng.normal(0, 1, len(t))) * 0.02
    return (np.sin(2 * np.pi * (f0 * t + (f1 - f0) * t * t / (2 * dur))) + k * 0.3) * (t / dur) ** 1.6 * 0.35


def pad(dur, midi, gain=0.16):
    t = tt(int(dur * SR))
    out = np.zeros(len(t))
    for m in midi:
        f = mtof(m)
        out += np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * 0.23 * t) * 0.4) * 0.34
        out += np.sin(2 * np.pi * f * 2 * t) * 0.08
    k = int(0.006 * SR)
    out = np.convolve(out, np.ones(k) / k, mode="same")
    env = np.minimum(1, t / 0.6) * np.minimum(1, np.maximum(0, (dur - t) / 0.5))
    return out * env * gain


CH = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62), (50, 53, 57), (55, 58, 62)]

# 段落和声 + 节拍
for i, (a, b) in enumerate(S):
    ch = CH[i % len(CH)]
    add(pad(b - a + 0.4, ch, 0.12), a - 0.1)
    b0 = a
    while b0 < b:
        add(kick(), b0, 0.85)
        add(hat(), b0 + 0.25, 0.5)
        if int((b0 - a) / BEAT) % 4 == 2:
            add(snare(), b0, 0.5)
        b0 += BEAT

# 幕5：4 圈上升 ping
s5a, s5b = S[4]
lap = s5a + (s5b - s5a) * 0.12
for i in range(4):
    at = lap + i * (s5b - s5a - 0.6) / 4
    add(ping(0.6, 784 * (2 ** (i * 3 / 12)), 0.5), at, 1.0, pan=-0.3 + 0.2 * i)
    add(ping(0.4, 1568 * (2 ** (i * 3 / 12)), 0.16), at, 1.0, pan=0.3 - 0.2 * i)
for i in range(int((s5b - s5a) / (BEAT / 2))):
    at = s5a + i * (BEAT / 2)
    t = tt(int(0.3 * SR))
    f = mtof([72, 76, 79, 84][i % 4])
    add(np.sin(2 * np.pi * f * t) * np.exp(-t * 9) * 0.1, at, 1.0, pan=0.4 * np.sin(i))

# 幕6：警告
s6a = S[5][0]
add(riser(2.2), s6a + 0.2, 0.8)
add(buzz(1.0), s6a + 2.0, 0.9)
add(thud(0.5, 62), s6a + 2.2, 0.8)

# 幕7：压缩
s7a = S[6][0]
add(whoosh(1.2, up=False), s7a + 0.4, 0.9)
add(chime(1.0, (660, 880)), s7a + 1.5, 0.7)

# 幕8：问号 + OK
s8a = S[7][0]
add(ping(0.35, 1320, 0.4), s8a + 0.5, 1.0)
add(ping(0.4, 1760, 0.35), s8a + 2.0, 1.0)

# 幕9：4 步 + 完成
s9a = S[8][0]
for i in range(4):
    add(click(0.06, 1200), s9a + 0.9 + i * 0.5, 0.8)
    add(thud(0.25, 150), s9a + 0.9 + i * 0.5, 0.35)
add(chime(1.2, (880, 1320)), s9a + 3.0, 0.8)

# 幕10：结论
s10a = S[9][0]
add(chime(1.6, (660, 880, 1108)), s10a + 0.2, 0.9)
add(impact(1.2), s10a + 4.4, 1.0)

# 幕1 细节
add(thud(0.4, 92), 1.05, 0.85)
add(whoosh(0.55), 1.75, 0.8)
for i in range(12):
    add(click(), 0.95 + i * 0.055, 0.9)
# 幕2 文件落入
for i in range(6):
    add(click(0.05, 1600), S[1][0] + 0.65 + i * 0.19, 0.7)
add(whoosh(0.45), S[1][0] + 0.5, 0.6)
# 幕3 模型出现
add(riser(1.2, 120, 700), S[2][0] + 0.1, 0.5)
add(impact(0.9), S[2][0] + 0.3, 0.7)
# 幕4 工具落地
add(whoosh(0.4), S[3][0] + 1.4, 0.7)
add(thud(0.45, 74), S[3][0] + 1.9, 0.9)

peak = float(np.max(np.abs(bus)))
if peak > 0:
    bus *= 0.89 / peak

import wave
with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((bus.T * 32767).astype("<i2").tobytes())
print("music written:", OUT, "dur=%.2fs" % (N / SR))
print("幕界:", ["%.2f-%.2f" % (a, b) for a, b in S])
