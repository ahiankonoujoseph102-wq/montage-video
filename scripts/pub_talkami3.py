"""Publicité Talkami v3 (style de la première version, optimisé) : props et bande son.

Usage : python3 scripts/pub_talkami3.py [naturelle|radio]   (voix choisie, « radio » par défaut)
  - props : public/talkami-pub/props-v3.json (mots au texte exact calés sur la voix v3, blocs de sous-titres,
    emojis animés utilisés) ; copie les emojis (projets/talkami-pub/elements/emojis/) et l'avatar dans public/ ;
  - musique originale de la v1 (synthèse, Sol mineur, 116 BPM, groupe complet sur le logo), qui baisse sous la voix
    et remonte dans les pauses ; effets à chaque apparition → public/talkami-pub/mix-v3.wav, −14 LUFS ;
  - relevé : projets/talkami-pub/sons-v3.md.
Les plans sont calés comme dans src/pub/PubTalkami3.tsx.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pub_talkami as pt  # noqa: E402

ROOT, PROJET, PUBLIC, SR = pt.ROOT, pt.PROJET, pt.PUBLIC, pt.SR
VOIX = sys.argv[1] if len(sys.argv) > 1 else "radio"
MOTS = json.loads((PROJET / "voix-v3" / "mots.json").read_text())
EMOJIS = ["1f914", "1f630", "1f44b", "1f60a", "1f442", "2705", "1f4ac", "1f381", "1f4aa", "1f389"]
# Blocs de sous-titres : nombre de mots, mots clés en orange (sans ponctuation), accroche géante.
BLOCS = [
    (3, [], True), (3, ["COMPRENEZ"]), (4, []), (2, ["PARLER"]),
    (2, ["TALKAMI"]), (3, []), (3, ["TEACHER", "JOE"]), (3, ["TEACHER", "ROSE"]), (2, []), (2, ["TÉLÉPHONE"]),
    (4, []), (2, ["ZÉRO"]),
    (3, ["ÉCOUTENT"]), (3, []), (2, ["DOUCEUR"]), (3, []), (2, ["FRANÇAIS"]), (3, []),
    (2, []), (3, []), (1, ["GRATUITE"]),
    (1, ["TALKAMI"]), (2, []), (3, ["OSER"]), (2, []),
    (3, []),  # « Rendez-vous sur talkami.net » : caché, la fin l'affiche en grand
]


def A(t, ph=None, n=0):
    return [m for m in MOTS if m["t"] == t and (ph is None or m["ph"] == ph)][n]["a"]


FIN = A("Rendez-vous") - 0.1
DUREE = round(FIN + 2.5, 2)
PLANS = {"logo": A("Avec") - 0.15, "parlez": A("vous", 2) - 0.08, "joe": A("avec", 2) - 0.05, "rose": A("ou") - 0.05,
         "tel1": A("directement") - 0.05, "tel2": A("votre", 2) - 0.05, "zero1": A("Même") - 0.08,
         "zero2": A("de", 2) - 0.05, "ecoute1": A("Ils") - 0.08, "ecoute2": A("écoutent,") - 0.05,
         "corrige": A("corrigent") - 0.05, "francais": A("et", 3) - 0.05, "bloquez": A("quand") - 0.05,
         "eval": A("Commencez") - 0.1, "duo": A("Talkami :") - 0.1, "oser1": A("vous", 5) - 0.06,
         "oser2": A("le", 5) - 0.04, "fin": FIN}


def evenements():
    p = PLANS
    return sorted([
        (0.0, "ouverture", -2, "Impact d'ouverture"), (0.27, "croix", -6, "Cadenas qui se ferme"),
        (A("Vous", 1) - 0.02, "coche", -6, "COMPRENDRE ✓"), (A("comprenez…") + 0.05, "autocollant", -9, "Emoji 🤔"),
        (A("mais") - 0.02, "croix", -5, "PARLER ✗"),
        (p["logo"] + 0.1, "ouverture", -4, "Logo Talkami"),
        (p["parlez"] - 0.12, "transition", -9, "Téléphone : accueil"),
        (p["joe"] + 0.05, "autocollant", -8, "TEACHER JOE + 👋"), (p["rose"] + 0.05, "autocollant", -8, "TEACHER ROSE + 👋"),
        (p["tel1"] - 0.12, "transition", -9, "Téléphone : choix du professeur"),
        (A("téléphone.") + 0.03, "zoom", -6, "Zoom sur le doigt"),
        (p["zero2"] + 0.07, "autocollant", -9, "Emoji 😊"), (p["ecoute2"] + 0.05, "autocollant", -9, "Emoji 👂"),
        (p["corrige"] + 0.03, "plein_ecran", -8, "Séance agrandie"), (A("douceur,") + 0.03, "coche", -5, "I go → I went ✓"),
        (p["francais"] + 0.03, "transition", -10, "Explication"), (A("français") + 0.03, "autocollant", -7, "EN FRANÇAIS"),
        (p["eval"] - 0.12, "transition", -9, "Téléphone : évaluation"),
        (A("gratuite.") + 0.03, "info", -5, "Badge ÉVALUATION ORALE GRATUITE"),
        (p["duo"] + 0.03, "plein_ecran", -7, "Joe et Rose + logo"), (A("oser") + 0.03, "coche", -6, "Emoji 💪"),
        (p["oser2"] + 0.07, "autocollant", -9, "Emoji 🎉"), (FIN + 0.03, "carton", -4, "Fin talkami.net"),
    ])


def main():
    assert sum(b[0] for b in BLOCS) == len(MOTS), (sum(b[0] for b in BLOCS), len(MOTS))
    (PUBLIC / "emojis").mkdir(parents=True, exist_ok=True)
    for c in EMOJIS:
        shutil.copy2(PROJET / "elements" / "emojis" / f"{c}.json", PUBLIC / "emojis" / f"{c}.json")
    blocs = [{"n": b[0], "cle": b[1], **({"geant": True} if len(b) > 2 else {})} for b in BLOCS]
    (PUBLIC / "props-v3.json").write_text(json.dumps({"duree": DUREE, "mots": MOTS, "blocs": blocs, "emojis": EMOJIS},
                                                     ensure_ascii=False))
    n = int(DUREE * SR)
    pt.DUREE, pt.N, pt.DROP = DUREE, n, PLANS["logo"]
    mus = pt.musique()
    voix = pt.lire(PROJET / "voix-v3" / f"voix-{VOIX}.wav")[:n]
    voix = np.pad(voix, ((0, n - len(voix)), (0, 0)))
    voix *= 10 ** ((-15 - pt.lufs(voix)) / 20)
    # La musique baisse quand il parle (16 LU sous la voix) et remonte de 6 dB dans les pauses (transitions 0,3 s).
    env = np.convolve(np.abs(voix[:, 0]), np.ones(int(0.2 * SR)) / int(0.2 * SR), "same")
    actif = np.convolve((env > 10 ** (-38 / 20)).astype(float), np.ones(int(0.3 * SR)) / int(0.3 * SR), "same")
    mus = mus * 10 ** ((pt.lufs(voix) - 16 - pt.lufs(mus)) / 20)
    t = np.arange(n) / SR
    gain_db = np.where(t > A("talkami.net.") + 0.9, 8, 6 * (1 - actif))
    mus = mus * (10 ** (gain_db / 20))[:, None]
    fx = np.zeros((n, 2))
    lignes = []
    for tps, nom, g, quoi in evenements():
        e = pt.effet(nom) * 10 ** (g / 20) * 0.5
        i = int(round(tps * SR))
        k = min(len(e), n - i)
        fx[i:i + k] += e[:k]
        lignes.append(f"| {tps:.2f} s | {nom} | {quoi} |")
    mix = voix + mus + fx
    mix *= 10 ** ((-14 - pt.lufs(mix)) / 20)
    brut = PUBLIC / "mix_brut.wav"
    pt.ecrire(brut, mix)
    lim = lambda d: 10 ** (d / 20)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(brut), "-af",
                    f"alimiter=limit={lim(-2.5):.4f}:attack=3:release=60:level=disabled,"
                    f"aresample=192000,alimiter=limit={lim(-2.3):.4f}:attack=1:release=30:level=disabled,"
                    f"aresample={SR}", "-c:a", "pcm_s24le", str(PUBLIC / "mix-v3.wav")], check=True)
    brut.unlink()
    fin = pt.lire(PUBLIC / "mix-v3.wav")
    txt = ["# Son — publicité Talkami v3", "",
           f"- Voix « {VOIX} » (voix-v3/), mix **{pt.lufs(fin):.1f} LUFS**, durée {DUREE:.2f} s ; musique originale de la v1 "
           "(Sol mineur, 116 BPM) 16 LU sous la voix quand il parle, +6 dB dans les pauses.", "",
           "| Temps | Effet | Quoi |", "|---|---|---|", *lignes]
    (PROJET / "sons-v3.md").write_text("\n".join(txt) + "\n")
    print("\n".join(txt[:3]))


if __name__ == "__main__":
    main()
