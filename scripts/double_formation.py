"""Double animé de Joseph dans la formation : apparitions, place réservée, gestes, expressions, bouche.

Usage : python3 scripts/double_formation.py <projet> [radio]
Après scripts/formation_montage.py (même variante). Lit formation_props.json, formation_phrases.json et
formation_voix.wav (voix seule calée sur la vidéo), la section « double » de montage_formation.json, et ajoute
la clé « double » à formation_props.json (composition « Formation », src/formation/DoubleFormation.tsx).

- Bouche : Rhubarb Lip Sync 1.13 en mode phonétique (variable RHUBARB = chemin de l'exécutable), une forme par
  image, une image d'avance, repos dans les silences (même conversion que double-anime/outils/audio.py) ;
  énergie de la voix par image pour les mouvements de tête.
- Apparitions (fondu de 8 images ; deux apparitions qui se suivent n'en font qu'une) : plans des fenêtres, du début
  du plan à sa fin (ou à la fin de la phrase « a » si « phraseSeule ») ; il sort avant qu'une ligne ne rende le
  contenu trop haut pour l'écran du décor (« hauteurMax ») ; cartons d'étape entiers.
- Le plan se range dans l'écran du décor (src/formation/DoubleFormation.tsx) : « cadre » = haut et bas du contenu
  du plan (px) à partir d'une ancre [phrase, mot] (null = début du plan).
- Gestes (logique de l'épisode 4) : mains posées sur le bureau au repos ; chaque geste de la configuration part sur
  son mot et dure le mot, la phrase ou n secondes, puis retour au repos. Expressions : « parle » sur chaque phrase,
  léger sourire (neutre) dans les silences, et celles de la configuration.
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata
from collections import Counter
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
projet = sys.argv[1]
SUF = "_radio" if len(sys.argv) > 2 and sys.argv[2] == "radio" else ""
PUB = ROOT / "public" / projet
cfg = json.loads((ROOT / "projets" / projet / "montage_formation.json").read_text())
D = cfg["double"]
props = json.loads((PUB / f"formation_props{SUF}.json").read_text())
phrases = json.loads((PUB / f"formation_phrases{SUF}.json").read_text())
FPS = 30
N = props["duree"]
FONDU = 8


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)


def mot(k, m):
    cands = phrases[k]["mots"]
    w = next((x for x in cands if norm(x[0]) == norm(m)), None) or \
        next((x for x in cands if norm(x[0]).startswith(norm(m))), None) or \
        next((x for x in cands if norm(m) in norm(x[0])), None)
    if w is None:
        raise SystemExit(f"Mot introuvable : {k} {m}")
    return w[1]


# --- Bouche : énergie par image et formes de Rhubarb. ---
voix, sr = sf.read(PUB / f"formation_voix{SUF}.wav", dtype="float64")
pas = sr // FPS
db = np.full(N, -90.0)
for i in range(N):
    bloc = voix[max(0, i * pas - pas // 2): i * pas + pas]
    if len(bloc):
        db[i] = 20 * np.log10(np.sqrt(np.mean(bloc ** 2)) + 1e-9)
parle = np.zeros(N, bool)
for p in phrases:
    parle[int(p["debut"] * FPS):int(p["fin"] * FPS) + 1] = True
bas_, haut_ = np.percentile(db[parle], 30), np.percentile(db[parle], 97)
brut = np.clip((db - bas_) / (haut_ - bas_), 0, 1) ** 0.85
lisse = np.zeros(N)
for i in range(1, N):
    lisse[i] = lisse[i - 1] + (brut[i] - lisse[i - 1]) * (0.75 if brut[i] > lisse[i - 1] else 0.5)
lisse[lisse < 0.07] = 0
bouche = np.concatenate([lisse[1:], [0.0]])

with tempfile.TemporaryDirectory() as tmp:
    w16 = Path(tmp) / "voix.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(PUB / f"formation_voix{SUF}.wav"), "-ac", "1", "-ar", "16000",
                    "-c:a", "pcm_s16le", str(w16)], check=True)
    sortie = Path(tmp) / "rhubarb.json"
    subprocess.run([os.environ.get("RHUBARB", "rhubarb"), "-q", "-r", "phonetic", "-f", "json", "-o", str(sortie),
                    str(w16)], check=True)
    reperes = json.loads(sortie.read_text())["mouthCues"]
lettres = ["X"] * N
for r in reperes:
    a = round(r["start"] * FPS) + 1
    b = max(a + 1, round(r["end"] * FPS) + 1)
    for i in range(a, min(N, b)):
        lettres[i] = r["value"]
for i in range(N):
    if max(bouche[max(0, i - 1): i + 2]) < 0.03 and lettres[i] not in "XA":
        lettres[i] = "X"

# --- Apparitions : plans des fenêtres et cartons d'étape ; le plan se range dans l'écran du décor. ---
plans = props["plans"]
plan_de = {}
for i, p in enumerate(cfg["plans"]):
    for k in range(p["de"], p["a"] + 1):
        plan_de[k] = i
HMAX = D["hauteurMax"]  # au-delà, le contenu serait trop petit dans l'écran : le double sort avant
presences, cadres = [], []
for f in D["fenetres"]:
    p0, p1 = plans[plan_de[f["de"]]], plans[plan_de[f["a"]]]
    debut = p0["debut"] + 4
    fin = round(phrases[f["a"]]["fin"] * FPS) + 6 + FONDU if f.get("phraseSeule") else p1["fin"]
    for ancre, A, B in f["cadre"]:
        t = debut if ancre is None else round(mot(*ancre) * FPS)
        if B - A > HMAX:
            fin = min(fin, t - 2)
            break
        cadres.append([t, A, B])
    presences.append([debut, fin])
for c in props["cartons"]:
    presences.append([c["debut"] + 2, c["fin"]])
    cadres.append([c["debut"], 520, 1290])  # contenu du carton : de « ÉTAPE » aux pastilles
presences.sort()
fusion = []
for a, b in presences:
    if fusion and a - fusion[-1][1] <= 2 * FONDU:
        fusion[-1][1] = max(fusion[-1][1], b)
    else:
        fusion.append([a, b])
cadres.sort()

# --- Gestes (logique de l'épisode 4) : mains posées sur le bureau au repos ; chaque geste part sur le mot qu'il
# illustre, dure le mot (« mot »), la phrase (« phrase ») ou n secondes, puis les mains reviennent au repos. ---
dedans = lambda t: any(a <= t * FPS < b for a, b in fusion)  # noqa: E731


def mot_entier(k, m):
    cands = phrases[k]["mots"]
    w = next((x for x in cands if norm(x[0]) == norm(m)), None) or \
        next((x for x in cands if norm(x[0]).startswith(norm(m))), None) or \
        next((x for x in cands if norm(m) in norm(x[0])), None)
    if w is None:
        raise SystemExit(f"Mot introuvable : {k} {m}")
    return w


gestes, expressions = [{"t": -10, "geste": "repos"}], [{"t": -10, "expression": "neutre"}]
for k, m, g, *reste in D["gestes"]:
    w = mot_entier(k, m)
    doigts = next((x for x in reste if isinstance(x, int)), None)
    duree = next((x for x in reste if not isinstance(x, int)), "mot")
    fin = w[2] + 0.3 if duree == "mot" else phrases[k]["fin"] + 0.1 if duree == "phrase" else w[1] + float(duree)
    if not dedans(w[1]):
        print(f"geste hors apparition : {k} {m}")
        continue
    gestes.append({"t": round(w[1] - 0.15, 3), "geste": g, **({"doigts": doigts} if doigts else {}), "fin": round(fin, 3)})
gestes.sort(key=lambda g: g["t"])
suite = [gestes[0]]
for i, g in enumerate(gestes[1:], 1):
    suivant = gestes[i + 1]["t"] if i + 1 < len(gestes) else 1e9
    suite.append({c: v for c, v in g.items() if c != "fin"})
    if g["fin"] < suivant - 0.2:
        suite.append({"t": g["fin"], "geste": "repos"})
gestes = suite
for k, p in enumerate(phrases):
    if not dedans(p["debut"]) and not dedans(p["fin"]):
        continue
    expressions.append({"t": round(p["debut"] - 0.08, 3), "expression": "parle"})
    suivante = phrases[k + 1]["debut"] if k + 1 < len(phrases) else p["fin"] + 9
    if suivante - p["fin"] > 0.7:
        expressions.append({"t": round(p["fin"] + 0.15, 3), "expression": "neutre"})
for k, m, e in D["expressions"]:
    expressions.append({"t": round(mot_entier(k, m)[1] - 0.1, 3), "expression": e})
expressions.sort(key=lambda e: e["t"])

masque = np.zeros(N, bool)
for a, b in fusion:
    masque[max(0, a - 30):min(N, b + 30)] = True
props["double"] = {
    "presences": fusion, "cadres": cadres, "gestes": gestes, "expressions": expressions,
    "bouche": [round(float(v), 2) if masque[i] else 0 for i, v in enumerate(bouche)],
    "visemes": "".join(l if masque[i] else "X" for i, l in enumerate(lettres)),
}
(PUB / f"formation_props{SUF}.json").write_text(json.dumps(props, ensure_ascii=False))
total = sum(b - a for a, b in fusion) / FPS
print(f"{len(fusion)} apparitions ({total:.0f} s), {len(gestes)} gestes, {len(expressions)} expressions ; "
      f"formes de bouche : {dict(Counter(lettres[i] for i in range(N) if masque[i]))}")
for a, b in fusion:
    print(f"  {a / FPS:7.1f} → {b / FPS:7.1f} s")
