"""Voix « radio » de la formation : pauses resserrées, débit légèrement accéléré, traitement de diffusion.

Usage : python3 scripts/voix_radio.py <projet>
Lit public/<projet>/voix_propre.wav et phrases.json, et la section « radio » de projets/<projet>/montage_formation.json.
Écrit public/<projet>/voix_radio.wav (48 kHz, mono) et phrases_radio.json (mêmes phrases, temps recalés).

0. Reprises (mot ou passage dit deux fois) : chaque coupe [début, fin] de « reprises » retire la première version,
   d'un silence à l'autre (vérifié au niveau sonore) ; les mots du script alignés sur la version coupée sont recalés
   sur la version gardée (« recaler » : {phrase: [[n° du mot, seconde], …]}).
1. Pauses entre phrases : le silence mesuré entre deux phrases (niveau sonore) est ramené à `pause` s
   (`pauseEtape` avant une nouvelle étape) une fois le débit accéléré ; on retire le milieu du silence,
   fondu de 15 ms. Un silence déjà plus court est gardé.
2. Débit × `tempo` sans changer la hauteur (rubberband, formants conservés).
3. Traitement : coupe-bas 80 Hz, débruitage très léger, chaleur (200 Hz), présence (4 kHz), air (11 kHz),
   dé-esseur, compression douce. Aucune réverbération.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
projet = sys.argv[1]
PUB = ROOT / "public" / projet
cfg = json.loads((ROOT / "projets" / projet / "montage_formation.json").read_text())
R = cfg["radio"]
phrases = json.loads((PUB / "phrases.json").read_text())
etapes = {int(k) for k in cfg["etapes"]}
SR = 48000
TEMPO = R["tempo"]

voix, sr = sf.read(PUB / "voix_propre.wav", dtype="float64")
if voix.ndim > 1:
    voix = voix.mean(1)
assert sr == SR, sr
H = int(0.01 * SR)
env = 20 * np.log10(np.sqrt((voix[:len(voix) // H * H].reshape(-1, H) ** 2).mean(1)) + 1e-9)
plancher = np.percentile(env, 8)


def silence(a, b):
    """Plus long passage calme (début, fin en s) entre la fin d'une phrase et le début de la suivante."""
    for marge in (0.05, 0.2, 0.4):
        i0, i1 = max(0, int((a - marge) / 0.01)), min(len(env), int((b + marge) / 0.01))
        calme = list(env[i0:i1] < plancher + 10) + [False]
        meilleur, debut = None, None
        for i, c in enumerate(calme):
            if c and debut is None:
                debut = i
            if not c and debut is not None:
                if meilleur is None or i - debut > meilleur[1] - meilleur[0]:
                    meilleur = (debut, i)
                debut = None
        if meilleur and meilleur[1] - meilleur[0] >= 3:
            return (i0 + meilleur[0]) * 0.01, (i0 + meilleur[1]) * 0.01
    return None


# --- 0. Reprises coupées, mots recalés sur la version gardée. ---
reprises = R.get("reprises", [])
recale = {}
for r in reprises:
    a, b = r["coupe"]
    for x in (-2, -1, 0, 1, 2):  # la coupe doit tomber dans un silence (≤ −38 dB) aux deux bouts
        for t in (a, b):
            if env[int(t / 0.01) + x] > -38:
                raise SystemExit(f"Coupe {r['coupe']} hors d'un silence ({r['texte']})")
    for k, liste in r.get("recaler", {}).items():
        for i, t in liste:
            recale[(int(k), i)] = t
for k, p in enumerate(phrases):
    mots = []
    for i, m in enumerate(p["mots"]):
        m = list(m)
        if (k, i) in recale:
            m[1] = recale[(k, i)]
            m[2] = recale.get((k, i + 1), m[2]) - (0.02 if (k, i + 1) in recale else 0)
        mots.append(m)
    p["mots"] = mots
    p["debut"] = min(p["debut"], mots[0][1]) if (k, 0) not in recale else mots[0][1]
    p["fin"] = max(p["fin"], mots[-1][2])
coupes = [tuple(r["coupe"]) for r in reprises]

# --- 1. Pauses : liste des passages retirés (début, durée) en temps de la voix d'origine. ---
retraits = [(a, b - a) for a, b in coupes]
for k in range(1, len(phrases)):
    s = silence(phrases[k - 1]["fin"], phrases[k]["debut"])
    if s is None or any(a < s[1] and s[0] < b for a, b in coupes):
        continue
    cible = (R["pauseEtape"] if k in etapes else R["pause"]) * TEMPO
    trop = (s[1] - s[0]) - cible
    if trop > 0.02:
        retraits.append(((s[0] + s[1]) / 2 - trop / 2, trop))
retraits.sort()

F = int(0.015 * SR)
morceaux, t = [], 0
for a, d in retraits:
    morceaux.append(voix[int(t * SR):int(a * SR)])
    t = a + d
morceaux.append(voix[int(t * SR):])
serre = morceaux[0]
for m in morceaux[1:]:
    r = np.linspace(0, 1, F)
    serre = np.concatenate([serre[:-F], serre[-F:] * (1 - r) + m[:F] * r, m[F:]])


def nouveau(t):
    """Temps de la voix d'origine → temps de la voix radio."""
    t2 = t - sum(min(d, max(0.0, t - a)) for a, d in retraits) - (F / SR) * sum(1 for a, d in retraits if a + d <= t)
    return round(t2 / TEMPO, 3)


# --- 2 et 3. Débit et traitement (ffmpeg). ---
tmp = PUB / "voix_serree.wav"
sf.write(tmp, serre.astype(np.float32), SR, subtype="FLOAT")
filtres = ",".join([
    f"rubberband=tempo={TEMPO}:formant=preserved:pitchq=quality:transients=mixed",
    "highpass=f=80:poles=2",
    "afftdn=nr=3:nf=-50:tn=1",
    "equalizer=f=200:t=q:w=0.9:g=1.5",
    "equalizer=f=4000:t=q:w=1.0:g=2.5",
    "highshelf=f=11000:g=1.5",
    "deesser=i=0.35:m=0.5:f=0.5",
    "acompressor=threshold=-21dB:ratio=2.5:attack=12:release=160:knee=4:makeup=1.5",
])
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", filtres, "-ac", "1", "-ar", str(SR),
                "-c:a", "pcm_f32le", str(PUB / "voix_radio.wav")], check=True)
tmp.unlink()

sortie = []
for p in phrases:
    q = dict(p)
    q["debut"], q["fin"] = nouveau(p["debut"]), nouveau(p["fin"])
    q["mots"] = [[m[0], nouveau(m[1]), nouveau(m[2])] + list(m[3:]) for m in p["mots"]]
    sortie.append(q)
(PUB / "phrases_radio.json").write_text(json.dumps(sortie, ensure_ascii=False))
duree = sf.info(PUB / "voix_radio.wav").duration
print(f"{len(coupes)} reprises coupées ({sum(b - a for a, b in coupes):.1f} s), {len(retraits) - len(coupes)} pauses resserrées ({sum(d for _, d in retraits):.1f} s retirées), tempo × {TEMPO} : "
      f"{len(voix) / SR:.1f} s → {duree:.1f} s")
