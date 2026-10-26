# -*- coding: utf-8 -*-
r"""画音乐能量波形图，把老贾口述的 6 个点标上去 —— 一眼看出哪些点真能'炸'"""
import json
import sys

sys.stdout.reconfigure(encoding="utf-8")
from PIL import Image, ImageDraw, ImageFont

J = json.load(open(r"D:\视频探索\remotion-ai-kp2\out\_midnight_energy.json"))
RMS, HOP = J["rms"], J["hop"]
DUR = J["dur"]
POINTS = [(7, "7s"), (25, "25s"), (36, "36s"), (55, "55s"), (75, "75s"), (80, "80s")]
PEAK = max(RMS)

W, H = 1920, 1080
BG = (8, 8, 12)
GOLD = (212, 175, 55)
RED = (220, 60, 50)
WHITE = (235, 235, 240)
GREEN = (90, 200, 120)
DIM = (110, 110, 130)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)


def font(sz, bold=False):
    for p in (r"C:\Windows\Fonts\msyhbd.ttc" if bold else r"C:\Windows\Fonts\msyh.ttc",
              r"C:\Windows\Fonts\simhei.ttf"):
        try:
            return ImageFont.truetype(p, sz)
        except Exception:
            pass
    return ImageFont.load_default()


F_TITLE = font(58, True)
F_LAB = font(30)
F_SM = font(24)
F_BIG = font(38, True)

top, bot = 210, 800
d.text((70, 66), "《重复》卡点诊断 · 音乐能量波形", font=F_TITLE, fill=WHITE)
d.text((72, 140), "柱子越高＝那一刻音乐越响。老贾口述的 6 个点已用红线标出",
       font=F_LAB, fill=DIM)

n = len(RMS)
for i in range(n):
    x = 70 + int(i / DUR * (W - 140))
    h = int(RMS[i] / PEAK * (bot - top))
    t = i * HOP
    hot = any(abs(t - p) < 0.35 for p, _ in POINTS)
    col = RED if hot else (GOLD if RMS[i] / PEAK > 0.75 else (150, 140, 110))
    d.rectangle([x, bot - h, x + 3, bot], fill=col)

for p, lab in POINTS:
    x = 70 + int(p / DUR * (W - 140))
    d.line([(x, top - 30), (x, bot + 20)], fill=RED, width=3)
    v = RMS[int(p / HOP)] / PEAK * 100
    weak = v < 55
    d.text((x - 46, top - 74), lab, font=F_BIG, fill=RED if not weak else (200, 130, 60))
    d.text((x - 58, top - 34), "%.0f%%" % v, font=F_SM, fill=WHITE if not weak else (200, 130, 60))

d.line([(70, bot), (W - 70, bot)], fill=DIM, width=2)
for s in range(0, int(DUR) + 1, 10):
    x = 70 + int(s / DUR * (W - 140))
    d.line([(x, bot), (x, bot + 8)], fill=DIM, width=2)
    d.text((x - 12, bot + 16), "%ds" % s, font=F_SM, fill=DIM)

y = 880
d.text((70, y), "✅ 7 / 25 / 36 / 55 秒：音乐真有高峰 —— 画面高潮砸上去就能同炸",
       font=F_LAB, fill=GREEN)
d.text((70, y + 46), "⚠️ 75 / 80 秒：这段曲子本来就只有 44%/48%，是 84 秒截断版的尾声",
       font=F_LAB, fill=(230, 170, 70))
d.text((70, y + 92), "❌ 我 v10 把全曲最高峰 7.20s 硬提前到 6.40s —— 提早 0.8 秒，所以老贾听着不对",
       font=F_LAB, fill=RED)

out = r"D:\视频探索\remotion-ai-kp2\out\卡点诊断_音乐能量波形.jpg"
img.save(out, quality=92)
print("已出图:", out)