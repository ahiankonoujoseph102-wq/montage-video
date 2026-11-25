"""Musique émotionnelle calme pour « Ton diplôme suffira-t-il… » (synthèse, aucun droit tiers).

Usage : python3 projets/diplome-togo/musique.py <props.json> <sortie.wav>
Sol mineur (comme les effets sonores), 70 BPM : piano en arpèges, nappe de cordes, basse, pulsation grave douce.
L'intensité suit le texte (repères = débuts de parties dans les props) : intro intime, montée sur le constat, retombée
sur « Je te parle sincèrement », élan majeur sur « réfléchis autrement », chaleur sur « Mon frère, ma sœur »,
suspense sur la partie 2, élan final sur l'appel à l'abonnement.
"""
import json
import subprocess
import sys

import numpy as np
from scipy.signal import fftconvolve

SR = 48000
props = json.load(open(sys.argv[1]))
duree = props["duree"]
N = int(duree * SR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(7)

# Repères (s) : débuts de parties, d'après l'alignement de la voix.
ph = props["phrases"]
rep = {k: ph[i]["a"] for k, i in {"p2": 10, "p4": 20, "p5": 25, "p6": 33, "p7": 38, "p10": 50, "p11": 58,
                                   "p12": 60, "p13": 68}.items()}
fin = props["carton"]["debut"] / 30

# Intensité (0–1) : courbe par paliers, lissée.
pal = [(0, .40), (rep["p2"], .52), (rep["p4"], .45), (rep["p5"], .58), (rep["p6"], .34), (rep["p7"], .58),
       (rep["p10"] - 3, .70), (rep["p10"], .92), (rep["p11"], .72), (rep["p12"], .66), (rep["p13"] - 8, .78),
       (rep["p13"], .90), (fin, .90), (duree, .0)]
I = np.interp(t_all, [p[0] for p in pal], [p[1] for p in pal])
k = int(1.5 * SR)
I = np.convolve(np.pad(I, (k, k), mode="edge"), np.ones(k) / k, "same")[k:-k]

F = lambda m: 440 * 2 ** ((m - 69) / 12)
# Grilles d'accords (notes MIDI) : mineur pour le constat, élan (III-VII-i) à partir de « réfléchis autrement ».
SOMBRE = [[55, 58, 62], [51, 55, 58], [58, 62, 65], [53, 57, 60], [55, 58, 62], [48, 51, 55], [51, 55, 58], [50, 54, 57]]
ELAN = [[51, 55, 58], [58, 62, 65], [53, 57, 60], [55, 58, 62], [48, 51, 55], [51, 55, 58], [53, 57, 60], [53, 57, 62]]
BPM = 70
temps = 60 / BPM
mesure = 4 * temps
duree_accord = 2 * mesure


def accord(t):
    grille = ELAN if rep["p10"] <= t < rep["p11"] or t >= rep["p13"] else SOMBRE
    return grille[int(t // duree_accord) % len(grille)]


piano = np.zeros(N)
nappe = np.zeros(N)
basse = np.zeros(N)
pulse = np.zeros(N)


def ajoute(buf, t0, x):
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    k = min(len(x), N - i0)
    buf[i0:i0 + k] += x[:k]


def note_piano(f, d=3.2, v=1.0):
    t = np.arange(int(d * SR)) / SR
    x = sum(a * np.sin(2 * np.pi * f * h * t * (1 + 0.0004 * h * h)) * np.exp(-t * (1.6 + 0.9 * h))
            for h, a in [(1, 1), (2, .45), (3, .22), (4, .1), (5, .05)])
    x *= np.minimum(1, t / 0.004)
    return v * x


cache = {}
# Piano : arpège en croches (1-5-8-10-8-5…), plus dense quand l'intensité monte.
pas = temps / 2
motif = [0, 1, 2, 1, 0, 2, 1, 2]
n_pas = int(duree / pas)
for j in range(n_pas):
    t0 = j * pas
    a = accord(t0)
    iv = I[min(N - 1, int(t0 * SR))]
    if iv < 0.5 and j % 2:  # intro : noires seulement
        continue
    m = a[motif[j % 8]] + (12 if j % 8 in (2, 5) else 0)
    if (m, ) not in cache:
        cache[(m, )] = note_piano(F(m))
    ajoute(piano, t0 + rng.normal(0, 0.004), cache[(m, )] * (0.55 + 0.25 * (j % 4 == 0)) * (0.7 + 0.5 * iv))
    if j % 8 == 0:  # basse de main gauche
        ajoute(piano, t0, note_piano(F(a[0] - 12), 5, 0.9))

# Nappe de cordes : trois voix légèrement désaccordées, attaque lente, à chaque accord.
for j in range(int(duree / duree_accord) + 1):
    t0 = j * duree_accord
    a = accord(t0)
    d = duree_accord + 1.5
    t = np.arange(int(d * SR)) / SR
    env = np.minimum(1, t / 1.6) * np.minimum(1, (d - t) / 1.4)
    x = np.zeros_like(t)
    for m in a + [a[0] + 12]:
        for dt in (-0.18, 0, 0.21):
            f = F(m) * 2 ** (dt / 12 / 4)
            x += np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) + 0.3 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    vib = 1 + 0.15 * np.sin(2 * np.pi * 0.25 * t)
    ajoute(nappe, t0, x * env * vib / 12)
    tb = np.arange(int(duree_accord * SR)) / SR
    ajoute(basse, t0, np.sin(2 * np.pi * F(a[0] - 24) * tb) * np.minimum(1, tb / 0.05) * np.exp(-tb * 0.25))

# Pulsation grave (battement de cœur doux) sur les temps 1 et 3, seulement quand ça monte.
tk = np.arange(int(0.5 * SR)) / SR
coup = np.sin(2 * np.pi * (48 + 40 * np.exp(-tk * 25)) * tk) * np.exp(-tk * 9)
for j in range(int(duree / temps)):
    t0 = j * temps
    if j % 2 == 0:
        ajoute(pulse, t0, coup * (1.0 if j % 4 == 0 else 0.6))

# Mélange selon l'intensité (chaque couche entre à son seuil).
lisse = lambda x, a, b: np.clip((x - a) / (b - a), 0, 1)
mono_piano = piano * (0.55 + 0.45 * I)
mono_nappe = nappe * lisse(I, 0.42, 0.8) * 1.1
mono_basse = basse * lisse(I, 0.45, 0.75) * 0.6
mono_pulse = pulse * lisse(I, 0.55, 0.9) * 0.9
# Réverbération (salle) : réponse impulsionnelle de bruit décroissant, 2,8 s.
ti = np.arange(int(2.8 * SR)) / SR
ir_g = rng.normal(0, 1, len(ti)) * np.exp(-ti * 2.4)
ir_d = rng.normal(0, 1, len(ti)) * np.exp(-ti * 2.4)
ir_g[0] = ir_d[0] = 0
sec = mono_piano + mono_nappe
sortie = np.zeros((N, 2))
for c, ir in enumerate((ir_g, ir_d)):
    wet = fftconvolve(sec, ir / np.sqrt((ir ** 2).sum()))[:N]
    sortie[:, c] = sec * 0.75 + wet * 0.55 + mono_basse + mono_pulse
# Largeur : piano un peu à gauche, nappe un peu à droite.
sortie[:, 0] += 0.12 * mono_piano
sortie[:, 1] += 0.12 * mono_nappe
# Fondu de sortie sur le carton de fin (dernière seconde).
sortie *= np.clip((duree - t_all) / 1.2, 0, 1)[:, None]
sortie /= np.abs(sortie).max() / 0.8
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-c:a", "pcm_s24le", sys.argv[2]], input=sortie.astype(np.float32).tobytes(), check=True)
print("Musique :", round(duree, 1), "s")
