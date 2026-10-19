"""Double animé de Joseph dans la formation : apparitions, place réservée, gestes, expressions, bouche.

Usage : python3 scripts/double_formation.py <projet> [radio]
Après scripts/formation_montage.py (même variante). Lit formation_props.json, formation_phrases.json et
formation_voix.wav (voix seule calée sur la vidéo), la section « double » de montage_formation.json, et ajoute
la clé « double » à formation_props.json (composition « Formation », src/formation/DoubleFormation.tsx).

- Bouche : Rhubarb Lip Sync 1.13 en mode phonétique (variable RHUBARB = chemin de l'exécutable), une forme par
  image, une image d'avance, repos dans les silences (même conversion que double-anime/outils/audio.py) ;
  énergie de la voix par image pour les mouvements de tête.
- Apparitions : plans des fenêtres (entrée 4 images après le début du plan, sortie à la fin du plan, fondu de
  8 images ; deux fenêtres qui se suivent n'en font qu'une) et annonces d'étape (sur le carton, du début de la
  première phrase de l'étape jusqu'à sa fin ; le carton reste affiché jusque-là).
- Place : « bas » du contenu du plan → le plan est réduit (et remonté) juste assez pour laisser « hmin » px au
  double au-dessus des sous-titres.
- Gestes automatiques : mains ouvertes et mains posées en alternance aux virgules (≥ 1,2 s d'écart), mains posées
  dans les silences ; index vers le contenu quand une ligne apparaît au-dessus de lui ; gestes et expressions
  imposés dans la configuration.
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

# --- Apparitions et place réservée. ---
plans = props["plans"]
plan_de = {}
for i, p in enumerate(cfg["plans"]):
    for k in range(p["de"], p["a"] + 1):
        plan_de[k] = i
presences, bas, cartons = [], [], []
for f in D["fenetres"]:
    p0, p1 = plans[plan_de[f["de"]]], plans[plan_de[f["a"]]]
    debut, fin = p0["debut"] + 4, p1["fin"]
    presences.append([debut, fin])
    for ancre, b in f["bas"]:
        t = debut if ancre is None else round(mot(*ancre) * FPS)
        bas.append([t, 200, b, f["hmin"], f["teinte"]])
for k, (n, _) in sorted((int(k), v) for k, v in cfg["etapes"].items()):
    c = next(c for c in props["cartons"] if c["numero"] == n)
    debut = round(phrases[k]["debut"] * FPS) - FONDU
    fin = round(phrases[k]["fin"] * FPS) + 8 + FONDU
    presences.append([debut, fin])
    cartons.append({"numero": n, "fin": fin + 2})
    # contenu du carton : de 520 (« ÉTAPE ») à 1290 (pastilles)
    bas.append([c["debut"], 520, 1290, D["hminCarton"], "violet"])
presences.sort()
fusion = []
for a, b in presences:
    if fusion and a - fusion[-1][1] <= 2 * FONDU:
        fusion[-1][1] = max(fusion[-1][1], b)
    else:
        fusion.append([a, b])
bas.sort()

# --- Gestes et expressions (temps en secondes de la vidéo). ---
dedans = lambda t: any(a <= t * FPS < b for a, b in fusion)  # noqa: E731
gestes, expressions = [{"t": 0, "geste": "repos"}], [{"t": 0, "expression": "neutre"}]
imposes = {(k, norm(m)): rest for k, m, *rest in D["gestes"]}
imposes = {(k, norm(next((x[0] for x in phrases[k]["mots"] if norm(x[0]) == m), None) or
                    next(x[0] for x in phrases[k]["mots"] if m in norm(x[0])))): r for (k, m), r in imposes.items()}
for k, p in enumerate(phrases):
    if not dedans(p["debut"]) and not dedans(p["fin"]):
        continue
    expressions.append({"t": p["debut"] - 0.08, "expression": "parle"})
    suivante = phrases[k + 1]["debut"] if k + 1 < len(phrases) else p["fin"] + 9
    if suivante - p["fin"] > 0.7:
        expressions.append({"t": p["fin"] + 0.15, "expression": "neutre"})
    ouvert = k % 2 == 0 or p["fin"] - p["debut"] > 4
    dernier = -9
    for j, m in enumerate(p["mots"]):
        cle = (k, norm(m[0]))
        if cle in imposes:
            g, *doigts = imposes[cle]
            gestes.append({"t": m[1] - 0.25, "geste": g, **({"doigts": doigts[0]} if doigts else {})})
            dernier = m[1]
            ouvert = g == "explique"
        elif j == 0 and m[1] - dernier > 1.2:
            gestes.append({"t": m[1] - 0.25, "geste": "explique" if ouvert else "repos"})
            dernier = m[1]
        elif j and p["mots"][j - 1][0][-1] in ",:" and m[1] - dernier > 1.2 and p["fin"] - m[1] > 1.0:
            ouvert = not ouvert
            gestes.append({"t": m[1] - 0.25, "geste": "explique" if ouvert else "repos"})
            dernier = m[1]
    if suivante - p["fin"] > 0.6:
        gestes.append({"t": p["fin"] + 0.1, "geste": "repos"})
# Une ligne apparaît au-dessus de lui : il la montre (index levé) pendant 1,4 s, sauf geste imposé tout proche.
for f in D["fenetres"]:
    for ancre, _ in f["bas"][1:]:
        t = mot(*ancre)
        if not any(abs(g["t"] - (t - 0.25)) < 1.0 and g["geste"] in ("compte", "designe", "pouce") for g in gestes):
            gestes.append({"t": t - 0.2, "geste": "designe"})
            gestes.append({"t": t + 1.4, "geste": "explique"})
for k, m, e in D["expressions"]:
    expressions.append({"t": mot(k, m) - 0.1, "expression": e})
gestes.sort(key=lambda g: g["t"])
expressions.sort(key=lambda e: e["t"])
# Au plus un changement de geste toutes les 0,5 s (le dernier l'emporte).
propres = []
for g in gestes:
    if propres and g["t"] - propres[-1]["t"] < 0.5 and propres[-1]["t"] > 0:
        propres[-1] = g
    else:
        propres.append(g)
gestes = [g for i, g in enumerate(propres) if i == 0 or g != {**propres[i - 1], "t": g["t"]}]

masque = np.zeros(N, bool)
for a, b in fusion:
    masque[max(0, a - 30):min(N, b + 30)] = True
props["double"] = {
    "presences": fusion, "bas": bas, "cartons": cartons, "gestes": gestes, "expressions": expressions,
    "bouche": [round(float(v), 2) if masque[i] else 0 for i, v in enumerate(bouche)],
    "visemes": "".join(l if masque[i] else "X" for i, l in enumerate(lettres)),
}
(PUB / f"formation_props{SUF}.json").write_text(json.dumps(props, ensure_ascii=False))
total = sum(b - a for a, b in fusion) / FPS
print(f"{len(fusion)} apparitions ({total:.0f} s), {len(gestes)} gestes, {len(expressions)} expressions ; "
      f"formes de bouche : {dict(Counter(lettres[i] for i in range(N) if masque[i]))}")
for a, b in fusion:
    print(f"  {a / FPS:7.1f} → {b / FPS:7.1f} s")
