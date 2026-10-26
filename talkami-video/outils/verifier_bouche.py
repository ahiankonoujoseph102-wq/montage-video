"""Contrôle de la synchronisation labiale sur la vidéo rendue.

Deux mesures :
 1. Rendu : l'ouverture réelle de la bouche dans la vidéo (pixels de
    l'intérieur, des dents et de la langue, au-dessus du fond constant que
    font la barbiche et les narines) suit-elle les formes prévues (visemes.json) ?
    Le meilleur décalage doit être 0.
 2. Synchronisation : les formes prévues suivent-elles l'énergie de la voix
    dans la piste son du même fichier ? Le meilleur décalage doit être de +1
    ou +2 images (la bouche prend la forme juste avant le son).
Les images de grimace (bouche asymétrique, hors formes de Rhubarb) sont exclues.

Usage : python outils/verifier_bouche.py video.mp4 visemes.json debut_voix_s fin_voix_s [exclu_debut exclu_fin …]
"""
import json
import subprocess
import sys

import numpy as np

video, fichier_visemes, debut, fin, *exclus = sys.argv[1:]
debut, fin = float(debut), float(fin)
FPS, X, Y, L, H = 30, 490, 1150, 100, 86
OUVERTURE = {"X": 0, "A": 0, "B": 1, "C": 2, "D": 3, "E": 2.5, "F": 1.2, "G": 1, "H": 2}

brut = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"crop={L}:{H}:{X}:{Y}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                      check=True, capture_output=True).stdout
im = np.frombuffer(brut, np.uint8).reshape(-1, H, L, 3).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
pixels = (((r >= 32) & (r <= 70) & (g < 28) & (b < 28)) | ((r > 225) & (g > 220) & (b > 210))
          | ((abs(r - 180) < 20) & (abs(g - 82) < 20) & (abs(b - 76) < 20))).sum(axis=(1, 2)).astype(float)

v = json.load(open(fichier_visemes))
prevu = np.array([OUVERTURE[c] for c in v], float)

pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-ac", "1", "-ar", "48000", "-f", "s16le", "-"], check=True, capture_output=True).stdout
son = np.frombuffer(pcm, np.int16).astype(float) / 32768
pas = 48000 // FPS
energie = np.array([np.sqrt(np.mean(son[i * pas:(i + 1) * pas] ** 2)) for i in range(len(son) // pas)])
energie = 20 * np.log10(energie + 1e-6)

a, z = int(debut * FPS), min(int(fin * FPS), len(prevu), len(pixels), len(energie))
garde = np.ones(z - a, bool)
for k in range(0, len(exclus), 2):
    garde[max(0, int(float(exclus[k]) * FPS) - a): max(0, int(float(exclus[k + 1]) * FPS) - a)] = False


def meilleur(x, y, titre):
    print(titre)
    res = []
    for d in range(-4, 5):
        # d > 0 : x (la bouche) est en avance de d images sur y
        i0, i1 = max(0, -d), len(x) - max(0, d)
        xs, ys, gs = x[i0:i1], y[i0 + d:i1 + d], garde[i0:i1] & garde[i0 + d:i1 + d]
        c = np.corrcoef(xs[gs], ys[gs])[0, 1]
        res.append((c, d))
        print(f"  décalage {d:+d} : {c:.3f}")
    c, d = max(res)
    print(f"  → meilleur : {d:+d} image(s), corrélation {c:.2f}\n")
    return d, c


meilleur(pixels[a:z], prevu[a:z], "1. rendu (bouche dessinée / formes prévues)")
meilleur(prevu[a:z], energie[a:z], "2. synchronisation (formes prévues / énergie de la voix)")
fermee = np.isin(np.array(list(v[a:z])), ["X", "A"])
fort = energie[a:z] > np.percentile(energie[a:z][garde], 60)
silence = energie[a:z] < np.percentile(energie[a:z][garde], 12)
print(f"bouche fermée (X, A) quand la voix est forte : {np.mean(fermee[fort & garde]):.0%} ; dans les silences : {np.mean(fermee[silence & garde]):.0%}")
