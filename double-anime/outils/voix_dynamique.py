"""Voix off resserrée : respirations supprimées, pauses ≤ 0,25 s, tempo × 1,08.

À partir de la voix brute et des mots alignés (temps en secondes depuis
`decalage` dans le fichier source) :
  - tout passage sous le seuil de parole (silence, respiration) plus long que
    `pause` est ramené à `pause` (masque d'énergie par 10 ms, dilaté de 30 ms
    pour ne jamais rogner une syllabe), fondus de 8 ms aux coupes ;
  - le résultat est accéléré par ffmpeg atempo (hauteur de voix inchangée) ;
  - les temps des mots sont recalculés dans la nouvelle voix.

Usage : python outils/voix_dynamique.py voix.m4a decalage mots.json voix_sortie.wav mots_sortie.json [tempo=1.08] [pause=0.25]
"""
import json
import subprocess
import sys
import wave

import numpy as np

SR = 48000
source, decalage, f_mots, sortie, f_sortie = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4], sys.argv[5]
tempo = float(sys.argv[6]) if len(sys.argv) > 6 else 1.08
pause = float(sys.argv[7]) if len(sys.argv) > 7 else 0.25

pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", source, "-ac", "2", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.int16).reshape(-1, 2).astype(np.float32) / 32768
mono = x.mean(axis=1)
pas = SR // 100  # 10 ms
rms = np.array([np.sqrt(np.mean(mono[i * pas:(i + 1) * pas] ** 2)) for i in range(len(mono) // pas)])
db = 20 * np.log10(rms + 1e-9)
seuil = np.percentile(db, 45)  # niveau de parole faible ; respiration et silence en dessous
print(f"seuil de parole : {seuil:.1f} dBFS")

mots = json.load(open(f_mots, encoding="utf-8"))
debuts = [m["debut"] + decalage for m in mots]
fins = [m["fin"] + decalage for m in mots]


# Masque de parole (10 ms) : au-dessus du seuil, dilaté de 30 ms pour garder
# les attaques et les fins de syllabes. Tout passage sous le seuil plus long
# que `pause` (silence ou respiration) est ramené à `pause` : on en garde
# pause/2 au début et pause/2 à la fin.
parole = db > seuil
dil = parole.copy()
for d in range(1, 4):
    dil[d:] |= parole[:-d]
    dil[:-d] |= parole[d:]
debut_voix = max(0, int((debuts[0] - 0.05) * 100))
fin_voix = min(len(db), int((fins[-1] + 0.3) * 100))
garde = []  # intervalles source gardés (s)
i = debut_voix
courant = debut_voix
while i < fin_voix:
    if not dil[i]:
        j = i
        while j < fin_voix and not dil[j]:
            j += 1
        if (j - i) / 100 > pause:
            garde.append([courant / 100, i / 100 + pause / 2])
            courant = j - int(pause / 2 * 100)
        i = j
    else:
        i += 1
garde.append([courant / 100, fin_voix / 100])

fondu = int(0.008 * SR)
morceaux, carte = [], []  # carte : (t_source_debut, t_source_fin, t_sortie_debut)
t_out = 0.0
for a, b in garde:
    seg = x[int(a * SR): int(b * SR)].copy()
    rampe = np.linspace(0, 1, fondu)[:, None]
    seg[:fondu] *= rampe
    seg[-fondu:] *= rampe[::-1]
    carte.append((a, b, t_out))
    morceaux.append(seg)
    t_out += b - a
blocs = garde
voix = np.concatenate(morceaux)
temp = sortie + ".tmp.wav"
with wave.open(temp, "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes((np.clip(voix, -1, 1) * 32767).astype("<i2").tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", temp, "-af", f"atempo={tempo}", "-ar", str(SR), sortie], check=True)
subprocess.run(["rm", "-f", temp])


def convertir(t):
    for a, b, o in carte:
        if t <= b:
            return (o + min(b - a, max(0.0, t - a))) / tempo
    a, b, o = carte[-1]
    return (o + b - a) / tempo


nouveaux = []
for m, a, b in zip(mots, debuts, fins):
    n = dict(m)
    n["debut"], n["fin"] = round(convertir(a), 3), round(convertir(b), 3)
    nouveaux.append(n)
json.dump(nouveaux, open(f_sortie, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
avant = fins[-1] - debuts[0]
print(f"{len(blocs)} blocs ; parole {avant:.1f} s → {t_out:.1f} s → {t_out / tempo:.1f} s après tempo")
