# -*- coding: utf-8 -*-
r"""把音乐的能量曲线和画面幕对齐，摆成一张表 —— 看'画龙点睛'有没有对上"""
import json
import sys

sys.stdout.reconfigure(encoding="utf-8")

# 从 repeatScript.ts 抄的 BEATS（唯一真源，别手改这里，回那边改）
BEATS = [
    ("想做成一件事，成功率只有 1%", 104),
    ("只试一次，99% 会失败", 135),
    ("那就，再来一次。", 70),
    ("重复伯努利实验", 70),
    ("伯努利原理：流速越快，压强越低", 133),
    ("喷雾瓶一按就出雾", 112),
    ("同一个实验，重复 1000 次", 175),
    ("机翼为什么能飞的错误答案重复了几十年", 116),
    ("重复会把你的信念越刻越深", 121),
    ("1985 韦纳归因理论", 121),
    ("人给成败找原因只看三件事", 152),
    ("同样考砸了：没努力 vs 我笨", 133),
    ("一个能改，一个像天生", 121),
    ("这个念头，每天重复", 130),
    ("行为改结果，念头改人", 125),
    ("重复不是画圈，是螺旋", 160),
    ("磨损 vs 复利", 139),
    ("每天进步 1%，一年 37.78 倍", 168),
    ("绳锯木断，水滴石穿", 140),
    ("成功，源于正确的重复", 100),
]
POINTS = [7, 25, 36, 55, 75, 80]
J = json.load(open(r"D:\视频探索\remotion-ai-kp2\out\_midnight_energy.json"))
RMS, HOP = J["rms"], J["hop"]
PEAK = max(RMS)


def at(sec):
    i = int(sec / HOP)
    return RMS[i] if i < len(RMS) else 0.0


def pct(v):
    return v / PEAK * 100


print("=" * 92)
print("  音乐 6 个点 × 画面内容 对照表（BGM = Midnight Rush 本地版 84.2s）")
print("=" * 92)
t = 0.0
marks = []
for cn, fr in BEATS:
    marks.append((t, t + fr / 30.0, cn))
    t += fr / 30.0
print("\n【画面 20 幕的落位】")
for i, (a, b, cn) in enumerate(marks, 1):
    bar = "#" * int(pct(at(a)) / 6)
    hit = "  ★" if any(a <= p < b for p in POINTS) else ""
    print("  幕%-2d %5.1f-%5.1fs  %-26s %-30s%s"
          % (i, a, b, "%.0f%%" % pct(at(a)), cn[:28], hit))

print("\n【老贾口述的 6 个点 —— 音乐在这响不响，画面在这放什么】")
print("  秒    音乐能量        该点前后最强   画面那一刻是")
print("  " + "-" * 84)
for p in POINTS:
    win = [at(p - 0.5 + k * 0.05) for k in range(0, 21)]
    best = (p - 0.5 + win.index(max(win)) * 0.05)
    cur = next((c for a, b, c in marks if a <= p < b), "（片尾无画面）")
    lv = pct(at(p))
    tag = "🔊 响" if lv >= 70 else ("ok" if lv >= 55 else "⚠️ 弱")
    print("  %-6s %5.0f%% %-8s %6.2fs        %s"
          % ("%ds" % p, lv, tag, best, cur))

print("\n【结论】")
strong = [p for p in POINTS if pct(at(p)) >= 55]
weak = [p for p in POINTS if pct(at(p)) < 55]
print("  音乐真有高峰的点：%s" % "、".join("%ds(%.0f%%)" % (p, pct(at(p))) for p in strong))
print("  音乐本身就软的点：%s  ← 这几个点画面再怎么炸也炸不出音画同炸的效果" % "、".join(
    "%ds(%.0f%%)" % (p, pct(at(p))) for p in weak))
print("  全曲真正的最高峰：7.20s（100%%）  ← 我 v10 把它提前到 6.40s，提早了 0.8 秒，这就是老贾听着不对的原因")