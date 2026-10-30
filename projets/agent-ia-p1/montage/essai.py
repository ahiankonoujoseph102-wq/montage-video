"""Extrait d'essai de la version 2 (≈ 1 min) : « 5. GitHub et le dépôt » illustré, puis la démo GitHub pas à pas.

Sortie : serie-animee/public/formation/essai/ (voix.wav, essai.json, bouche.json, visemes.json, e01.mp4 …).
Chaque étape de démo = un extrait du rush H joué à vitesse normale (ou ralentie), figé sur sa dernière image tant
que la voix parle ; jamais accéléré. La voix off des démos (voix/voix-off-demos.m4a) reçoit le traitement radio.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

from voix import SR, VOIX_RADIO

PROJET = Path(__file__).resolve().parent.parent
SERIE = Path("/home/user/montage-videos/serie-animee")
OUT = SERIE / "public" / "formation" / "essai"
H = PROJET / "rushes" / "20261022-081406.mp4"
VO = PROJET / "voix" / "voix-off-demos.m4a"
FPS = 30
HAUT, HCLIP = 140, 2160  # recadrage du téléphone : sans la barre d'état

# Illustration : la partie « 5. GitHub et le dépôt » de la voix 1A (déjà traitée).
ILLU = (379.6, 401.0)

# Étapes : (morceaux du rush [début, fin, vitesse], voix off [début, fin], bandeau, cibles [t source, x, y], zoom)
# zoom = (centre x, centre y, facteur) dans l'image source ; une cible = cercle sur l'endroit touché.
ETAPES = [
    ([(64.5, 67.6, 1)], (24.84, 28.95), "Étape 1 : dans Google, tapez « github »",
     [(66.4, 300, 615)], [(64.5, 540, 470, 1.55)]),
    ([(70.0, 72.6, 1)], (29.48, 30.95), "Étape 2 : touchez « Inscrivez-vous sur GitHub »",
     [(70.3, 486, 586)], [(70.0, 540, 470, 1.9)]),
    ([(121.0, 122.9, 1)], (31.58, 33.15), "Étape 3 : touchez « Continuer avec Google »",
     [(121.3, 637, 923)], [(121.0, 620, 760, 1.9)]),
    ([(125.7, 126.85, 1)], (33.18, 34.75), "Étape 4 : choisissez votre adresse Gmail",
     [(126.0, 450, 612)], [(125.7, 520, 560, 1.6)]),
    ([(140.6, 144.0, 1)], (35.08, 36.95), "Votre compte GitHub est prêt ✅",
     [], [(140.6, 640, 300, 2.3)]),
    ([(144.0, 147.6, 0.75), (147.6, 150.6, 1)], (37.52, 43.0), "Étape 5 : touchez « + » en haut, puis « Nouveau dépôt »",
     [(144.1, 812, 164), (145.9, 722, 245)], [(144.0, 720, 260, 2.6)]),
    ([(153.0, 159.0, 1), (164.5, 167.5, 1)], (43.74, 46.25), "Étape 6 : donnez un nom au dépôt, sans espace",
     [(153.2, 551, 833)], [(153.0, 380, 760, 1.5)]),
    ([(170.0, 177.5, 1)], (46.72, 48.75), "Étape 7 : ajoutez une courte description",
     [(170.2, 541, 1072)], [(170.0, 380, 1000, 1.5)]),
    ([(182.9, 186.6, 0.6)], (49.30, 57.15), "Étape 8 : choisissez « Privé » 🔒",
     [(183.0, 597, 891), (184.2, 250, 1601), (185.9, 642, 1367)],
     [(182.9, 560, 900, 1.6), (183.9, 430, 1460, 1.5), (185.8, 600, 1360, 1.8)]),
    ([(191.5, 197.5, 1)], (57.54, 59.45), "Étape 9 : touchez « Créer un dépôt »",
     [(192.2, 864, 1147)], [(191.5, 760, 1090, 2.2)]),
    ([(200.0, 204.5, 1)], (59.68, 62.10), "C'est fait : votre coffre-fort est prêt 🎉",
     [], [(200.0, 330, 640, 2.0)]),
]
# Mots mal reconnus par Whisper (corrigés d'après le texte lu).
CORRIGE = {"confort": "coffre-fort", "compte.": "code.", "continue": "Continuer"}
PAUSE_AVANT, PAUSE_APRES, BLANC = 0.35, 0.65, 0.6


def lire(src, a=None, b=None, filtre="anull"):
    cmd = ["ffmpeg", "-v", "error"]
    if a is not None:
        cmd += ["-ss", str(a), "-to", str(b)]
    cmd += ["-i", str(src), "-af", filtre, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32)


def extrait(i, morceaux, duree, zooms):
    """Morceaux du rush recollés, à vitesse 1 ou ralentis, puis dernière image figée jusqu'à `duree`."""
    sortie = OUT / f"e{i:02d}.mp4"
    parts, filtres = [], []
    for k, (a, b, v) in enumerate(morceaux):
        filtres.append(f"[0:v]trim={a}:{b},setpts=(PTS-STARTPTS)/{v},fps={FPS},crop=1080:{HCLIP}:0:{HAUT}[p{k}]")
        parts.append(f"[p{k}]")
    filtres.append(f"{''.join(parts)}concat=n={len(parts)}:v=1:a=0,tpad=stop_mode=clone:stop_duration={duree},"
                   f"trim=0:{duree},setpts=PTS-STARTPTS[v]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(H), "-filter_complex", ";".join(filtres), "-map", "[v]",
                    "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", str(sortie)], check=True)


def temps_sortie(morceaux, ts):
    """Instant d'un temps source dans l'extrait recollé (ralentis compris)."""
    o = 0.0
    for a, b, v in morceaux:
        if a <= ts <= b:
            return o + (ts - a) / v
        o += (b - a) / v
    return o


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    mots_vo = [w for s in json.loads((PROJET / "voix" / "transcriptions" / "voix-off-demos.json").read_text()) for w in s["mots"]]
    d1a = json.loads((SERIE / "public" / "formation" / "1A" / "montage.json").read_text())
    voix_1a = SERIE / "public" / "formation" / "1A" / "voix.wav"
    vo = lire(VO, filtre="highpass=f=80,afftdn=nr=12:nf=-42," + VOIX_RADIO)

    pistes, mots, plans, t = [], [], [], 0.0
    # 1. illustration
    a, b = ILLU
    pistes.append((0.0, lire(voix_1a, a, b)))
    for w in d1a["mots"]:
        if a <= w["debut"] < b:
            mots.append({"texte": w["texte"], "debut": round(w["debut"] - a, 3), "fin": round(w["fin"] - a, 3), "phrase": w["phrase"]})
    plans.append({"type": "illustration", "debut": 0.0, "fin": b - a,
                  "reperes": {k: round(next(w["debut"] for w in d1a["mots"] if a <= w["debut"] < b and w["texte"].lower().startswith(k)) - a, 3)
                              for k in ("site", "dépôt", "coffre-fort", "revenir", "talkami", "modification")}})
    t = b - a + BLANC
    # 2. démo
    for i, (morceaux, (v0, v1), bandeau, cibles, zooms) in enumerate(ETAPES, 1):
        long_clip = sum((y - x) / v for x, y, v in morceaux)
        duree = round(max(long_clip, PAUSE_AVANT + (v1 - v0) + PAUSE_APRES), 2)
        extrait(i, morceaux, duree, zooms)
        dv = t + PAUSE_AVANT
        pistes.append((dv, vo[int((v0 - 0.08) * SR):int((v1 + 0.12) * SR)]))
        for w in mots_vo:
            if v0 - 0.05 <= w["d"] < v1:
                txt = w["m"].strip()
                txt = CORRIGE.get(txt, txt)
                prec = mots[-1] if mots and mots[-1]["phrase"] == f"D{i}" else None
                if prec and txt[:1] in "'.":  # « s » + « 'inscrire. », « GitHub » + « .com. » : un seul mot
                    prec["texte"] += txt
                    prec["fin"] = round(dv + w["f"] - v0 + 0.08, 3)
                    continue
                mots.append({"texte": txt, "debut": round(dv + w["d"] - v0 + 0.08, 3), "fin": round(dv + w["f"] - v0 + 0.08, 3), "phrase": f"D{i}"})
        plans.append({"type": "demo", "debut": round(t, 3), "fin": round(t + duree, 3), "fichier": f"e{i:02d}.mp4", "bandeau": bandeau,
                      "etape": i, "cibles": [{"t": round(t + temps_sortie(morceaux, ts), 3), "x": x, "y": y - HAUT} for ts, x, y in cibles],
                      "zooms": [{"t": round(t + temps_sortie(morceaux, ts), 3), "x": x, "y": y - HAUT, "f": f} for ts, x, y, f in zooms]})
        t += duree
    duree_totale = round(t + 1.0, 3)
    y = np.zeros(int(duree_totale * SR) + SR, np.float32)
    for debut, s in pistes:
        k = int(debut * SR)
        y[k:k + len(s)] += s
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-ac", "2", "-c:a", "pcm_s16le",
                    str(OUT / "voix.wav")], input=y.tobytes(), check=True)
    # bouche et visèmes de Coach Joseph pendant l'illustration (repris de 1A), repos ensuite
    b1a = json.loads((SERIE / "public" / "formation" / "1A" / "bouche.json").read_text())
    v1a = json.loads((SERIE / "public" / "formation" / "1A" / "visemes.json").read_text())
    k0, k1 = round(a * FPS), round(b * FPS)
    n = int(duree_totale * FPS) + 2
    (OUT / "bouche.json").write_text(json.dumps((b1a[k0:k1] + [0] * n)[:n]))
    (OUT / "visemes.json").write_text(json.dumps((v1a[k0:k1] + "X" * n)[:n]))
    (OUT / "essai.json").write_text(json.dumps({"duree": duree_totale, "plans": plans, "mots": mots}, ensure_ascii=False, indent=1))
    print("durée", duree_totale)
    for p in plans:
        print(p["type"], p["debut"], p["fin"], p.get("bandeau", ""))


if __name__ == "__main__":
    main()
