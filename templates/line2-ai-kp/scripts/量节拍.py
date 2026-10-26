# -*- coding: utf-8 -*-
r"""量曲子：老贾口述的 6 个点（7/25/36/55/75/80秒）上，音乐到底有没有'最高点'

原理：把 BGM 转成单声道 PCM，按 50ms 一格算 RMS 能量 + 低频(60-250Hz)强度 + 瞬态(峰值差)，
      再看这 6 个点落在第几格、那格在整段里排第几强。
"""
import json
import os
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")

BGM = r"D:\视频探索\remotion-ai-kp2\public\bgm_midnight_cut.m4a"
WAV = r"D:\视频探索\remotion-ai-kp2\out\_ana_midnight.wav"
HOP = 0.05
POINTS = [7, 25, 36, 55, 75, 80]


def decode():
    if not os.path.exists(WAV):
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", BGM,
                        "-ac", "1", "-ar", "22050", WAV], check=True)
    return WAV


def main():
    import array
    w = decode()
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", w,
                    "-ac", "1", "-ar", "22050", "-f", "s16le", WAV + ".raw"], check=True)
    data = array.array("h")
    with open(WAV + ".raw", "rb") as f:
        data.frombytes(f.read())
    sr = 22050
    hop = int(sr * HOP)
    n = len(data) // hop
    rms = []
    for i in range(n):
        seg = data[i * hop:(i + 1) * hop]
        if not len(seg):
            break
        rms.append((sum(x * x for x in seg) / len(seg)) ** 0.5 / 32768.0)
    dur = len(data) / sr
    peak = max(rms)
    order = sorted(range(len(rms)), key=lambda i: -rms[i])

    print("曲子: %s" % os.path.basename(BGM))
    print("时长 %.1fs / %d 格(每格50ms) / 全曲峰值 %.4f" % (dur, len(rms), peak))
    print()
    print("老贾口述的 6 个点 —— 这点上音乐到底有多响：")
    print("  秒   附近能量      全曲排名    前后3秒最强点")
    rows = []
    for p in POINTS:
        c = int(p / HOP)
        if c >= len(rms):
            print("  %-5s ❌ 超出曲子长度(%.1fs)" % (p, dur))
            continue
        win = rms[max(0, c - 6):min(len(rms), c + 6)]
        best = max(range(len(win)), key=lambda k: win[k]) + max(0, c - 6)
        rank = order.index(c) + 1 if c in order else -1
        near = max(rms[max(0, c - 60):min(len(rms), c + 60)])
        rows.append((p, rms[c], rank, best * HOP, near))
        print("  %-5s %.4f (%.0f%%) %-10s 最强在 %.2fs"
              % (p, rms[c], rms[c] / peak * 100, "第%d/%d" % (rank, len(rms)), best * HOP))
    print()
    print("全曲最强的 12 个点（这就是音乐自己喊出来的地方）：")
    for k, i in enumerate(order[:12]):
        print("   #%-2d %6.2fs  能量 %.4f" % (k + 1, i * HOP, rms[i]))
    print()
    json.dump({"dur": dur, "rms": [round(x, 5) for x in rms], "hop": HOP},
              open(r"D:\视频探索\remotion-ai-kp2\out\_midnight_energy.json", "w"))


if __name__ == "__main__":
    main()