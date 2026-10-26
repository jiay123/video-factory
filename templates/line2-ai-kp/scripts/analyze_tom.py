# -*- coding: utf-8 -*-
import os, subprocess, sys
import numpy as np

root = r'D:\视频探索'
target = None
for dp, dn, fn in os.walk(root):
    if 'node_modules' in dp:
        continue
    for f in fn:
        if f.lower().endswith('.mp4') and ('tom' in f.lower() or 'T.O.M' in f):
            target = os.path.join(dp, f)
            print('FOUND', target)
if not target:
    sys.exit('no tom file')

wav = r'D:\视频探索\remotion-ai-kp2\out\tom_ref.wav'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', target, '-ac', '1', '-ar', '22050', wav], check=True)

import librosa
y, sr = librosa.load(wav, sr=22050, mono=True)
print('dur %.2f' % (len(y) / sr))
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
print('tempo %.2f beats %d' % (float(np.atleast_1d(tempo)[0]), len(beats)))

# high-note energy (C5-C7) peaks
yh, _ = librosa.effects.hpss(y)
C = np.abs(librosa.cqt(yh, sr=sr, fmin=librosa.note_to_hz('C2'), n_bins=72, bins_per_octave=12, hop_length=128))
freqs = librosa.cqt_frequencies(n_bins=72, fmin=librosa.note_to_hz('C2'), bins_per_octave=12)
m = (freqs >= librosa.note_to_hz('C4')) & (freqs <= librosa.note_to_hz('C7'))
E = np.abs(C[m]).mean(axis=0)
E = np.convolve(E, np.ones(5) / 5, 'same')
tt = librosa.times_like(E, sr=sr, hop_length=128)
pk = librosa.util.peak_pick(E, pre_max=15, post_max=15, pre_avg=50, post_avg=50, delta=0.02, wait=20)
vals = E[pk]
order = np.argsort(vals)[::-1][:30]
print('high-note peaks:')
for i in sorted(order, key=lambda i: tt[pk[i]]):
    print('  %.2f  %.3f' % (tt[pk[i]], vals[i]))
