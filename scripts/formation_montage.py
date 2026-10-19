"""Construit le montage final de la formation : voix (pauses, cartons d'étape), plans, sous-titres, musique.

Usage : python3 scripts/formation_montage.py <projet> [radio]
Lit public/<projet>/voix_propre.wav, phrases.json, extraits.json et projets/<projet>/montage_formation.json.
Écrit public/<projet>/formation_props.json (composition Remotion « Formation »), formation_mix.wav, formation_voix.wav
(voix seule calée sur la vidéo, pour la bouche du double) et formation_phrases.json (phrases en temps de la vidéo).
Variante « radio » : voix_radio.wav et phrases_radio.json (scripts/voix_radio.py), réglages de la section « radio »
(pauses, niveaux de musique) ; fichiers écrits avec le suffixe « _radio ».
Les silences ajoutés (cartons, tenue des cartes de prompts, changements de partie, pause minimale entre phrases)
tombent toujours dans un silence de la voix, vérifié au niveau sonore.
"""
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
projet = sys.argv[1]
PUB = ROOT / "public" / projet
cfg = json.loads((ROOT / "projets" / projet / "montage_formation.json").read_text())
RADIO = len(sys.argv) > 2 and sys.argv[2] == "radio"
SUF = "_radio" if RADIO else ""
if RADIO:
    cfg.update(cfg["radio"]["montage"])
phrases = json.loads((PUB / f"phrases{SUF}.json").read_text())
extraits = json.loads((PUB / "extraits.json").read_text())
SR, FPS = 48000, 30
OUV = cfg["ouverture"]
HAUTEUR_VUE = 1530  # zone d'image des extraits d'écran ; les sous-titres sont dessous


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)


# --- Voix : compression douce, puis points de coupe entre phrases (dans un silence). ---
# (la voix radio est déjà compressée par scripts/voix_radio.py)
brut = subprocess.run(["ffmpeg", "-v", "error", "-i", str(PUB / ("voix_radio.wav" if RADIO else "voix_propre.wav")), "-af",
                       "anull" if RADIO else "acompressor=threshold=-24dB:ratio=2.2:attack=8:release=140:makeup=1",
                       "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
voix = np.frombuffer(brut, dtype=np.float32).astype(np.float64)
mesure = pyln.Meter(SR)
voix *= 10 ** ((-17.0 - mesure.integrated_loudness(voix)) / 20)
H = int(0.01 * SR)
env = 20 * np.log10(np.sqrt((voix[:len(voix) // H * H].reshape(-1, H) ** 2).mean(1)) + 1e-9)
plancher = np.percentile(env, 8)


def point_silence(a, b):
    """Milieu du plus long silence entre a et b (s) ; élargit la recherche si besoin."""
    for marge in (0.05, 0.2, 0.4):
        i0, i1 = max(0, int((a - marge) / 0.01)), min(len(env), int((b + marge) / 0.01))
        calme = env[i0:i1] < plancher + 10
        meilleur, debut = None, None
        for i, c in enumerate(list(calme) + [False]):
            if c and debut is None:
                debut = i
            if not c and debut is not None:
                if meilleur is None or i - debut > meilleur[1] - meilleur[0]:
                    meilleur = (debut, i)
                debut = None
        if meilleur and meilleur[1] - meilleur[0] >= 3:
            return (i0 + (meilleur[0] + meilleur[1]) / 2) * 0.01, (meilleur[1] - meilleur[0]) * 0.01
    return None, 0.0


etapes = {int(k): v for k, v in cfg["etapes"].items()}
plan_de = {}
for i, p in enumerate(cfg["plans"]):
    for k in range(p["de"], p["a"] + 1):
        plan_de[k] = i
coupures = {}  # phrase k → {point, tenue, carton, apres}
for k in range(1, len(phrases)):
    pt, silence = point_silence(phrases[k - 1]["fin"], phrases[k]["debut"])
    if pt is None:
        # Phrases enchaînées sans silence : on n'ajoute rien ici (sauf si un carton ou une tenue l'exige).
        tient = cfg["plans"][plan_de[k - 1]]["type"] in ("Carte", "CarteFlow") and plan_de[k - 1] != plan_de[k]
        if k in etapes or k in cfg["sections"] or tient:
            raise SystemExit(f"Pas de silence avant la phrase {k} ({phrases[k]['texte'][:40]}…)")
        continue
    prec, suiv = cfg["plans"][plan_de[k - 1]], cfg["plans"][plan_de[k]]
    tenue = cfg["tenueCarte"] if prec["type"] in ("Carte", "CarteFlow") and plan_de[k - 1] != plan_de[k] else 0
    carton = cfg["carton"] if k in etapes else 0
    apres = cfg["pauseSection"] if k in cfg["sections"] or k in etapes else 0
    apres += max(0, cfg["pauseMin"] - silence) if not (tenue or carton or apres) else 0
    if suiv.get("generique") and plan_de[k - 1] != plan_de[k]:
        apres = max(apres, cfg.get("pauseGenerique", 0.8))
    if tenue or carton or apres:
        coupures[k] = {"point": pt, "tenue": tenue, "carton": carton, "apres": round(apres, 3)}


def T(t):
    """Temps de la voix nettoyée → temps de la vidéo finale."""
    return OUV + t + sum(c["tenue"] + c["carton"] + c["apres"] for c in coupures.values() if c["point"] <= t)


def debut_gap(k):
    c = coupures[k]
    return OUV + c["point"] + sum(o["tenue"] + o["carton"] + o["apres"] for o in coupures.values() if o["point"] < c["point"])


def debut_plan(k):
    if k == 0:
        return OUV
    if k in coupures:
        c = coupures[k]
        return debut_gap(k) + c["tenue"] + c["carton"]
    pt, _ = point_silence(phrases[k - 1]["fin"], phrases[k]["debut"])
    return T(pt if pt is not None else phrases[k]["debut"])


duree_voix = len(voix) / SR
plans_props = []
cartons, badges = [], []


def ancre(a, origine):
    k, mot = a[0], norm(a[1])
    decal = a[2] if len(a) > 2 else 0
    cands = phrases[k]["mots"]
    w = next((m for m in cands if norm(m[0]) == mot), None) or next((m for m in cands if norm(m[0]).startswith(mot)), None) \
        or next((m for m in cands if mot in norm(m[0])), None)
    if w is None:
        raise SystemExit(f"Ancre introuvable : {a}")
    return round(T(w[1]) + decal - origine, 3)


for i, p in enumerate(cfg["plans"]):
    debut = debut_plan(p["de"])
    fin = debut_plan(cfg["plans"][i + 1]["de"]) if i + 1 < len(cfg["plans"]) else T(duree_voix) + p.get("fin", 0)
    if i + 1 < len(cfg["plans"]) and cfg["plans"][i + 1]["de"] in coupures:
        c = coupures[cfg["plans"][i + 1]["de"]]
        fin = debut_gap(cfg["plans"][i + 1]["de"]) + c["tenue"]  # le carton suivant n'appartient pas au plan
    rel = lambda a: ancre(a, debut)  # noqa: E731
    t, props = p["type"], dict(p.get("props", {}))
    if t == "Extrait":
        e = extraits[p["id"]]
        props = {"video": e["video"], "dureeImages": e["dureeImages"], "zooms": e["zooms"], "acceleres": e["acceleres"],
                 "depart": int(p.get("depart", 0) * FPS), "hauteurVue": HAUTEUR_VUE}
    elif t == "Carte":
        props = {"id": p["id"], "temps": [rel(a) for a in p["lignes"]]}
    elif "etapes" in p:
        props["etapes"] = [rel(a) for a in p["etapes"]]
        if "etapeActif" in p:
            props["etapeActif"] = rel(p["etapeActif"])
    plans_props.append({"debut": round(debut * FPS), "fin": round(fin * FPS), "type": t, "props": props,
                        "generique": bool(p.get("generique"))})

# Cartons d'étape et badge « ÉTAPE n / 7 » jusqu'à l'étape suivante (ou la fin des étapes).
fins = sorted(cfg["finEtapes"])
for k, (n, titre) in sorted(etapes.items()):
    c = coupures[k]
    a = debut_gap(k) + c["tenue"]
    cartons.append({"debut": round(a * FPS), "fin": round((a + c["carton"]) * FPS), "numero": n, "titre": titre})
for k, (n, titre) in sorted(etapes.items()):
    bornes = [f for f in list(etapes) + fins if f > k and f in coupures]
    f = min(bornes) if bornes else None
    e = debut_gap(f) + coupures[f]["tenue"] if f is not None else T(duree_voix)
    badges.append({"debut": round(debut_plan(k) * FPS), "fin": round(e * FPS), "numero": n, "titre": titre})

# --- Sous-titres : texte du script, temps alignés ; groupes courts, mots clés en jaune. ---
cles = {norm(m) for m in cfg["motsCles"]}
sous_titres = []
retirer = {(k, m) for k, m in cfg.get("sousTitresRetirer", [])}
for k, p in enumerate(phrases):
    mots = [list(m) for m in p["mots"] if (k, m[0]) not in retirer]
    # Adresses dites « lomeiaschool point laravel point cloud » → lomeiaschool.laravel.cloud
    fusion = []
    for m in mots:
        if fusion and norm(m[0]) in ("point", "laravel", "cloud", "cloud,") and (".laravel" in fusion[-1][0] or
                                                                                  norm(fusion[-1][0]) in ("lomeiaschool", "talkami")):
            fusion[-1][0] = fusion[-1][0].rstrip(",") + {"point": ".", "laravel": "laravel", "cloud": "cloud"}.get(norm(m[0]), "")
            fusion[-1][0] = fusion[-1][0].replace("..", ".") + ("," if m[0].endswith(",") else "")
            fusion[-1][2] = m[2]
        else:
            fusion.append(m)
    groupe = []
    for j, m in enumerate(fusion):
        groupe.append(m)
        longueur = sum(len(x[0]) + 1 for x in groupe)
        nxt = fusion[j + 1] if j + 1 < len(fusion) else None
        coupe = m[0][-1] in ".,:;?!»" and longueur > 12
        if nxt is None or len(groupe) >= 7 or longueur + len(nxt[0]) > 38 or coupe:
            sous_titres.append({"debut": round(T(groupe[0][1]) * FPS), "fin": round(T(groupe[-1][2] + 0.25) * FPS),
                                "mots": [{"t": x[0], "cle": norm(x[0]) in cles or norm(x[0]).rstrip("s") in cles}
                                         for x in groupe]})
            groupe = []
for a, b in zip(sous_titres, sous_titres[1:]):
    if b["debut"] - a["fin"] < 12:
        a["fin"] = b["debut"]
    a["fin"] = max(a["fin"], a["debut"] + 12)

duree_totale = T(duree_voix) + cfg["plans"][-1].get("fin", 0)
props = {"duree": round(duree_totale * FPS), "ouverture": round(OUV * FPS), "plans": plans_props, "cartons": cartons,
         "badges": badges, "sousTitres": sous_titres, "hauteurVue": HAUTEUR_VUE}
(PUB / f"formation_props{SUF}.json").write_text(json.dumps(props, ensure_ascii=False))

# --- Bande son : voix avec silences ajoutés, musique en boucle, effets. ---
N = int(duree_totale * SR) + SR
piste = np.zeros(N)
morceaux, t_src = [], 0.0
for k in sorted(coupures, key=lambda k: coupures[k]["point"]):
    morceaux.append((t_src, coupures[k]["point"]))
    t_src = coupures[k]["point"]
morceaux.append((t_src, duree_voix))
parle = np.zeros(N, bool)
for a, b in morceaux:
    d = int(T(a + 1e-6) * SR) if a > 0 else int(OUV * SR)
    seg = voix[int(a * SR):int(b * SR)]
    piste[d:d + len(seg)] += seg
for k, p in enumerate(phrases):
    parle[int(T(p["debut"]) * SR):int(T(p["fin"]) * SR)] = True


def charger(chemin, stereo=True):
    s = subprocess.run(["ffmpeg", "-v", "error", "-i", str(chemin), "-ac", "2" if stereo else "1", "-ar", str(SR),
                        "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(s, dtype=np.float32).astype(np.float64)
    return x.reshape(-1, 2) if stereo else x


musique = charger(ROOT / "sons" / "musique_defaut.m4a")
L_mus = mesure.integrated_loudness(musique)
fondu = int(1.5 * SR)
boucle = musique.copy()
while len(boucle) < N:
    r = np.linspace(0, 1, fondu)[:, None]
    boucle = np.concatenate([boucle[:-fondu], boucle[-fondu:] * (1 - r) + musique[:fondu] * r, musique[fondu:]])
boucle = boucle[:N]
# Niveau de la musique sous la voix (−17 LUFS) : explications −19 LU, génériques −12 LU, ouverture et cartons −6 LU.
NIV = cfg.get("musique", {"explications": -19.0, "generiques": -12.0})
rel = np.full(N, NIV["explications"])
for p in plans_props:
    if p["generique"]:
        rel[int(p["debut"] / FPS * SR):int(p["fin"] / FPS * SR)] = NIV["generiques"]
rel[:int(OUV * SR)] = -5.0
for c in cartons:
    rel[int(c["debut"] / FPS * SR):int(c["fin"] / FPS * SR)] = -7.0
# Lissage (0,5 s) puis fondu de sortie sur les 2,5 dernières secondes.
lis = int(0.5 * SR)
noyau = np.ones(lis) / lis
rel = np.convolve(np.pad(rel, (lis, lis), mode="edge"), noyau, mode="same")[lis:-lis]
gain = 10 ** ((-17.0 + rel - L_mus) / 20)
fin_f = int(2.5 * SR)
gain[-fin_f - SR:-SR] *= np.linspace(1, 0, fin_f)
gain[-SR:] = 0
mix = boucle * gain[:, None] + piste[:, None]


def effet(nom, t, niveau):
    x = charger(ROOT / "sons" / "effets" / f"{nom}.wav")
    x = x * 10 ** ((niveau - mesure.integrated_loudness(x)) / 20)
    d = int(t * SR)
    n = min(len(x), N - d)
    mix[d:d + n] += x[:n]


effet("ouverture", 0, -19)
for c in cartons:
    effet("carton", c["debut"] / FPS + 1 / FPS, -22)
for p in plans_props:
    if p["generique"]:
        effet("plein_ecran", p["debut"] / FPS + 1 / FPS, -26)
mix *= 10 ** ((-14.0 - mesure.integrated_loudness(mix)) / 20)
sf.write(PUB / f"formation_mix{SUF}.wav", mix.astype(np.float32), SR, subtype="FLOAT")
sf.write(PUB / f"formation_voix{SUF}.wav", piste.astype(np.float32), SR, subtype="FLOAT")
(PUB / f"formation_phrases{SUF}.json").write_text(json.dumps(
    [{"debut": round(T(p["debut"]), 3), "fin": round(T(p["fin"]), 3), "texte": p["texte"],
      "mots": [[m[0], round(T(m[1]), 3), round(T(m[2]), 3)] for m in p["mots"]]} for p in phrases], ensure_ascii=False))
print(f"Durée : {duree_totale:.1f} s ({duree_totale / 60:.1f} min), {len(plans_props)} plans, {len(cartons)} cartons, "
      f"{len(sous_titres)} sous-titres, {len(coupures)} silences ajoutés")
