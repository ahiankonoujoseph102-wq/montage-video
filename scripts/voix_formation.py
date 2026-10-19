"""Nettoie la voix off d'une formation : coupes (reprises, faux départs), greffes, débruitage, pauses régulières.

Usage : python3 scripts/voix_formation.py <projet> <dossier des fichiers audio> <transcriptions>
Lit projets/<projet>/voix.json. Écrit public/<projet>/voix_propre.wav (48 kHz mono) et
public/<projet>/voix_carte.json : morceaux gardés [fichier, début source, fin source, début sortie] et mots
(transcription Whisper ramenée au temps de sortie). Les coupes tombent toujours dans un silence ; chaque
pause de plus de 0,6 s est ramenée à 0,5 s (les pauses longues entre étapes sont ajoutées au montage).
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
projet, dossier, trans = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
cfg = json.loads((ROOT / "projets" / projet / "voix.json").read_text())
SR = 48000
PAUSE_MAX, PAUSE = 0.6, 0.5
FONDU = int(0.012 * SR)


def debruiter(chemin):
    sortie = subprocess.run(["ffmpeg", "-v", "error", "-i", str(chemin), "-af",
                             "highpass=f=70,afftdn=nr=10:nf=-45:tn=1,lowpass=f=14000", "-ac", "1", "-ar", str(SR),
                             "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(sortie, dtype=np.float32).astype(np.float64)


def energie(x):
    h = int(0.02 * SR)
    n = len(x) // h
    return 20 * np.log10(np.sqrt((x[:n * h].reshape(n, h) ** 2).mean(1)) + 1e-9)


sons = {i + 1: debruiter(dossier / f) for i, f in enumerate(cfg["fichiers"] + cfg.get("sources", []))}
assembles = range(1, len(cfg["fichiers"]) + 1)  # les sources servent seulement aux greffes
morceaux, rapport = [], []
for f in assembles:
    x = sons[f]
    # Greffes : remplacer un passage par un passage d'une autre prise (fondu de 12 ms de chaque côté).
    for g in sorted(cfg.get("greffes", []), key=lambda g: -g["de"][0]):
        if g["fichier"] != f:
            continue
        a, b = (int(t * SR) for t in g["de"])
        src = sons[g["par"]["fichier"]] if g["par"]["fichier"] != f else x.copy()
        c, d = (int(t * SR) for t in g["par"]["de"])
        piece = src[c:d].copy()
        piece[:FONDU] *= np.linspace(0, 1, FONDU)
        piece[-FONDU:] *= np.linspace(1, 0, FONDU)
        avant, apres = x[:a].copy(), x[b:].copy()
        avant[-FONDU:] *= np.linspace(1, 0, FONDU)
        apres[:FONDU] *= np.linspace(0, 1, FONDU)
        x = np.concatenate([avant, piece, apres])
        sons[f] = x
        decal = (d - c - (b - a)) / SR
        # Décaler les mots et coupes qui suivent la greffe.
        for c_ in cfg["coupes"].get(str(f), []):
            if c_[0] >= g["de"][1]:
                c_[0] += decal
                c_[1] = c_[1] + decal if c_[1] < 9000 else c_[1]
        g["decalage"] = decal
    e = energie(x)
    plancher = np.percentile(e, 10)
    silence = e < plancher + 9
    garde = np.ones(len(e), bool)
    for a, b, _ in cfg["coupes"].get(str(f), []):
        ia, ib = int(a / 0.02), min(len(e), int(b / 0.02))
        # Vérification : une coupe ne tombe jamais dans un mot.
        for bord in (ia, ib):
            if 0 < bord < len(e) - 1 and e[bord] > plancher + 14:
                raise SystemExit(f"Coupe F{f} {a}-{b} : le bord {bord * 0.02:.2f} s n'est pas dans un silence ({e[bord]:.0f} dB)")
        garde[ia:ib] = False
    # Pauses : silences de plus de PAUSE_MAX ramenés à PAUSE (on garde le début et la fin du silence).
    i = 0
    while i < len(e):
        if garde[i] and silence[i]:
            j = i
            while j < len(e) and garde[j] and silence[j]:
                j += 1
            duree = (j - i) * 0.02
            if duree > PAUSE_MAX and 0 < i and j < len(e):
                k1 = i + int(PAUSE * 0.45 / 0.02)
                k2 = j - int(PAUSE * 0.55 / 0.02)
                garde[k1:k2] = False
            i = j
        i += 1
    # Morceaux gardés.
    i = 0
    while i < len(e):
        if garde[i]:
            j = i
            while j < len(e) and garde[j]:
                j += 1
            morceaux.append([f, round(i * 0.02, 3), round(j * 0.02, 3)])
            i = j
        i += 1

# Assemblage avec fondus de 12 ms à chaque raccord.
sortie, t = [], 0.0
for m in morceaux:
    f, a, b = m
    p = sons[f][int(a * SR):int(b * SR)].copy()
    n = min(FONDU, len(p) // 2)
    p[:n] *= np.linspace(0, 1, n)
    p[-n:] *= np.linspace(1, 0, n)
    m.append(round(t, 3))
    sortie.append(p)
    t += len(p) / SR
voix = np.concatenate(sortie)


def vers_sortie(f, s):
    for mf, a, b, d in morceaux:
        if mf == f and a <= s <= b:
            return d + s - a
    return None


mots = []
trans_mots = {f: json.loads((trans / f"v{f}.json").read_text()) for f in sons}
for f in assembles:
    gref = sorted([g for g in cfg.get("greffes", []) if g["fichier"] == f], key=lambda g: g["de"][0])

    def vers_greffe(t):
        """Temps d'un mot du fichier f → temps dans le fichier après greffes (None si remplacé)."""
        d = 0.0
        for g in gref:
            if g["de"][0] - 0.02 <= t < g["de"][1]:
                return None
            if t >= g["de"][1]:
                d += g["decalage"]
        return t + d

    for w, a, b, p in trans_mots[f]:
        a2, b2 = vers_greffe(a), vers_greffe(b)
        if a2 is None or b2 is None:
            continue
        ta, tb = vers_sortie(f, a2 + 0.03), vers_sortie(f, max(a2 + 0.03, b2 - 0.03))
        if ta is not None and tb is not None:
            mots.append([w, round(ta - 0.03, 3), round(tb + 0.03, 3), p])
    # Mots des passages greffés, pris dans la transcription de leur source.
    for g in gref:
        debut_g = g["de"][0] + sum(o["decalage"] for o in gref if o["de"][1] <= g["de"][0])
        c0, c1 = g["par"]["de"]
        for w, a, b, p in trans_mots[g["par"]["fichier"]]:
            if c0 <= a < c1:
                ta = vers_sortie(f, debut_g + (a - c0) + 0.03)
                tb = vers_sortie(f, debut_g + (min(b, c1) - c0) - 0.03)
                if ta is not None and tb is not None:
                    mots.append([w, round(ta - 0.03, 3), round(tb + 0.03, 3), p])
mots.sort(key=lambda m: m[1])
dest = ROOT / "public" / projet
dest.mkdir(parents=True, exist_ok=True)
sf.write(dest / "voix_propre.wav", voix.astype(np.float32), SR, subtype="PCM_24")
(dest / "voix_carte.json").write_text(json.dumps({"morceaux": morceaux, "mots": mots}, ensure_ascii=False))
print(f"Voix nettoyée : {len(voix) / SR:.1f} s ({len(morceaux)} morceaux, {len(mots)} mots)")
