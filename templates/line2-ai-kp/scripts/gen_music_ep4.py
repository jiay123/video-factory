# -*- coding: utf-8 -*-
"""EP04《Agent 是怎么转圈的》· 20秒音乐与音效（numpy 全合成，零成本）
用法：python gen_music_ep4.py  ->  public/audio4/ep04_music.wav
骨架来自 arthurkatcher/explainer-video（timeline 驱动画面与声音同源）
"""
import json
import os

import numpy as np

BASE = r"D:\视频探索\remotion-ai-kp2"
OUT = os.path.join(BASE, "public", "audio4", "ep04_music.wav")
SR = 48000
DUR = 20.67
BPM = 120
BEAT = 60.0 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(11)

os.makedirs(os.path.dirname(OUT), exist_ok=True)

bus = np.zeros((2, N))


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
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


def kick(dur=0.32, f0=120, f1=45):
    t = tt(int(dur * SR))
    ph = 2 * np.pi * (f1 * t + (f0 - f1) * (1 - np.exp(-t * 22)) / 22)
    return np.sin(ph) * np.exp(-t * 9) * 0.9


def hat(dur=0.05):
    t = tt(int(dur * SR))
    n = rng.normal(0, 1, len(t))
    return (n - n.mean()) * np.exp(-t * 60) * 0.22


def thud(dur=0.45, f=78):
    t = tt(int(dur * SR))
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 7) * 0.8


def ping(dur=0.5, f=880, gain=0.5):
    t = tt(int(dur * SR))
    e = np.exp(-t * 5)
    return (np.sin(2 * np.pi * f * t) * 0.7 + np.sin(2 * np.pi * f * 2 * t) * 0.25) * e * gain


def click(dur=0.035, f=2400):
    t = tt(int(dur * SR))
    return (rng.normal(0, 1, len(t)) * 0.5 + np.sin(2 * np.pi * f * t) * 0.5) * np.exp(-t * 70) * 0.35


def whoosh(dur=0.6):
    t = tt(int(dur * SR))
    n = rng.normal(0, 1, len(t))
    # 简易带通：移动平均差
    k = int(0.02 * SR)
    sm = np.convolve(n, np.ones(k) / k, mode="same")
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return (n - sm) * env * 0.5


def chime(dur=1.6, notes=(880, 1108, 1320)):
    out = np.zeros(int(dur * SR))
    for k, f in enumerate(notes):
        t = tt(len(out))
        d = dur * (1 - 0.18 * k)
        out += np.sin(2 * np.pi * f * t) * np.exp(-t * (5 - k)) * 0.28
    return out


def impact(dur=1.0):
    t = tt(int(dur * SR))
    n = rng.normal(0, 1, len(t))
    return (np.sin(2 * np.pi * 52 * t) * np.exp(-t * 5) * 0.9 + n * np.exp(-t * 22) * 0.35)


def pad(dur, midi, gain=0.16):
    t = tt(int(dur * SR))
    out = np.zeros(len(t))
    for m in midi:
        f = mtof(m)
        out += np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * 0.23 * t) * 0.4) * 0.34
        out += np.sin(2 * np.pi * f * 2 * t) * 0.08
    # 低通（3 阶移动平均近似）
    k = int(0.006 * SR)
    out = np.convolve(out, np.ones(k) / k, mode="same")
    env = np.minimum(1, t / 0.6) * np.minimum(1, np.maximum(0, (dur - t) / 0.5))
    return out * env * gain


# ---------------- 段落节拍 ----------------
def kick_at(at, gain=1.0):
    add(kick(), at, gain)


def hat_at(at, gain=1.0):
    add(hat(), at, gain)


# 幕1 (0-3.87)：稀疏，重音在 0 / 1.05 / 3.5
kick_at(0.0, 1.0)
kick_at(1.0, 0.9)
kick_at(2.0, 0.5)
kick_at(3.0, 0.6)
kick_at(3.5, 0.8)
for i in range(int(3.87 / 0.25)):
    hat_at(i * 0.25, 0.5 if i % 2 == 0 else 0.32)

# 幕2 (3.87-8.47)：铺底渐强
chords = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]
for ci, ch in enumerate(chords):
    add(pad(2.2, ch, 0.13 + 0.02 * ci), 3.87 + ci * 1.15)
for b in np.arange(3.87, 8.47, BEAT):
    kick_at(b, 0.75)
    hat_at(b + 0.25, 0.45)
    ci_b = min(3, int((b - 3.87) / 1.15))
    f_b = mtof(chords[ci_b][0] - 12)
    add(np.sin(2 * np.pi * f_b * tt(int(0.5 * SR))) * np.exp(-tt(int(0.5 * SR)) * 6) * 0.22, b, 1.0)

# 幕3 (8.47-13.81)：转圈 tick + 每圈上升 ping
for i in range(int((13.81 - 8.47) / BEAT)):
    b = 8.47 + i * BEAT
    kick_at(b, 0.9)
    hat_at(b + 0.25, 0.55)
    hat_at(b + 0.125, 0.22)
lap_ping = [9.42, 10.69, 11.96, 13.23]
for i, at in enumerate(lap_ping):
    add(ping(0.6, 784 * (2 ** (i * 3 / 12)), 0.55), at, 1.0, pan=-0.3 + 0.2 * i)
    add(ping(0.45, 1568 * (2 ** (i * 3 / 12)), 0.18), at, 1.0, pan=0.3 - 0.2 * i)
# 幕3 arp
arp_notes = [72, 76, 79, 84]
for i in range(int((13.81 - 8.47) / (BEAT / 2))):
    at = 8.47 + i * (BEAT / 2)
    f = mtof(arp_notes[i % 4])
    d = int(0.3 * SR)
    t = tt(d)
    add(np.sin(2 * np.pi * f * t) * np.exp(-t * 9) * 0.12, at, 1.0, pan=0.4 * np.sin(i))

# 幕4 (13.81-20.67)
for b in np.arange(13.81, 20.4, BEAT):
    kick_at(b, 0.85)
    hat_at(b + 0.25, 0.5)
for ci, ch in enumerate(chords):
    add(pad(2.2, ch, 0.12), 13.81 + ci * 1.4)
add(chime(1.6), 13.85, 1.0)
add(thud(0.5, 70), 16.9, 0.9)
add(impact(1.2), 19.45, 1.0)

# 事件音（跟画面同源）
for i in range(12):                       # 打字机
    add(click(), 0.95 + i * 0.052, 0.9)
add(thud(0.4, 92), 1.05, 0.85)           # "一句话"落位
add(whoosh(0.55), 1.62, 0.8)             # 卡片上飞
add(whoosh(0.45), 8.5, 0.7)              # 轨道出现
for i in range(6):                       # 文件飞进记忆条
    add(click(0.05, 1600), 4.35 + i * 0.19, 0.7)
add(ping(0.7, 1046, 0.35), 8.47, 0.9)    # 轨道起
add(whoosh(0.5), 14.0, 0.6)              # 记忆条压缩

peak = float(np.max(np.abs(bus)))
if peak > 0:
    bus *= 0.89 / peak
stereo = bus.T
import wave
with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype("<i2").tobytes())
print("music written:", OUT, "dur=%.2fs" % (N / SR))
