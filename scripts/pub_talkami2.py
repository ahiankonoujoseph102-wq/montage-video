"""Publicité Talkami v2 (style de la vidéo « histoire de Talkami ») : props et bande son.

Usage : python3 scripts/pub_talkami2.py
  - props : public/talkami-pub/props-v2.json (mots au texte exact calés sur la voix v2, durée) ;
  - musique originale v2 (synthèse, Si♭ majeur I–V–vi–IV, 100 BPM, mêmes notes que Sol mineur : les effets restent
    accordés) → sons/musique_pub_talkami_v2.wav ;
  - mix : voix v2 (scripts/voix_pub.py) + musique 16 LU sous la voix (+6 dB dans les respirations et sur la fin)
    + effets à chaque apparition → public/talkami-pub/mix-v2.wav, −14 LUFS, crête < −1 dBTP après encodage ;
  - relevé : projets/talkami-pub/sons-v2.md.
Les plans sont calculés comme dans src/pub/PubTalkami2.tsx (même calage sur les mots).
"""
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pub_talkami as pt  # noqa: E402  (fonctions de synthèse, lecture, mesure)

ROOT = pt.ROOT
PROJET, PUBLIC = pt.PROJET, pt.PUBLIC
SR = pt.SR
MOTS = json.loads((PROJET / "mots_texte_exact.json").read_text())
DUREE = 27.0


def A(t, ph=None):
    return next(m["a2"] for m in MOTS if m["t"] == t and (ph is None or m["ph"] == ph))


PLANS = {
    "accroche": 0, "comprend": A("Vous", 1) - 0.05, "ose": A("mais") - 0.05, "logo": A("Avec") - 0.12,
    "parlez": A("vous", 2) - 0.08, "joe": A("avec", 2) - 0.05, "rose": A("ou") - 0.05, "tel": A("directement") - 0.05,
    "zero": A("Même") - 0.08, "ecoute": A("Ils") - 0.08, "corrige": A("corrigent") - 0.05, "francais": A("et", 3) - 0.05,
    "bloquez": A("quand") - 0.05, "eval": A("Commencez") - 0.1, "duo": A("Talkami :") - 0.1, "oser": A("vous", 5) - 0.06,
    "fin": A("Rendez-vous") - 0.1,
}


def evenements():
    p = PLANS
    ev = [(0.0, "ouverture", -2, "Impact d'ouverture"),
          (A("bloque ?") + 0.03, "croix", -4, "Tampon BLOQUÉ ?"),
          (A("comprenez…") + 0.03, "coche", -6, "Je comprends ✓"),
          (A("parler ?", 1) + 0.03, "croix", -5, "Je n'ose pas ✗"),
          (p["logo"] + 0.03, "ouverture", -5, "Logo Talkami"),
          (p["parlez"] - 0.1, "transition", -9, "Téléphone : accueil"),
          (p["joe"] + 0.1, "autocollant", -9, "Carte Teacher Joe"),
          (p["rose"] + 0.13, "autocollant", -9, "Carte Teacher Rose"),
          (p["tel"] - 0.1, "transition", -9, "Téléphone : choix du professeur"),
          (A("téléphone.") + 0.03, "autocollant", -8, "Pastille téléphone"),
          (A("zéro.") + 0.03, "autocollant", -6, "Disque 0"),
          (p["ecoute"] + 0.03, "panneau", -8, "Étape 1"),
          (A("écoutent,") + 0.03, "autocollant", -8, "Pastille oreille"),
          (p["corrige"] + 0.03, "panneau", -8, "Étape 2 : séance"),
          (A("douceur,") + 0.03, "coche", -5, "I go → I went ✓"),
          (p["francais"] + 0.03, "panneau", -8, "Étape 3"),
          (A("français") + 0.03, "autocollant", -8, "Pastille FR"),
          (p["eval"] - 0.1, "transition", -9, "Téléphone : évaluation"),
          (A("gratuite.") + 0.03, "info", -5, "Badge ÉVALUATION ORALE GRATUITE"),
          (p["duo"] + 0.03, "plein_ecran", -7, "Joe et Rose + logo"),
          (A("oser") + 0.03, "coche", -6, "Confettis sur « oser »"),
          (p["fin"] + 0.03, "info", -3, "Fin talkami.net")]
    return sorted(ev)


def main():
    (PUBLIC / "props-v2.json").write_text(json.dumps(
        {"duree": DUREE, "mots": [{k: m[k] for k in ("t", "ph", "a2", "b2")} for m in MOTS]}, ensure_ascii=False))
    n = int(DUREE * SR)
    # Musique v2 : on règle le synthétiseur de pub_talkami.py puis on l'appelle.
    pt.DUREE, pt.N = DUREE, n
    pt.BPM = 100
    pt.TEMPS = 60 / pt.BPM
    pt.DROP = PLANS["logo"]
    pt.ACCORDS = [[10, 14, 17], [5, 9, 12], [7, 10, 14], [3, 7, 10]]  # Si♭ – Fa – Sol m – Mi♭
    pt.BASSES = [10 - 24, 5 - 24, 7 - 24, 3 - 24]
    mus = pt.musique()
    pt.ecrire(ROOT / "sons" / "musique_pub_talkami_v2.wav", mus)
    voix = pt.lire(PROJET / "voix-v2" / "voix-v2.wav")[:n]
    voix = np.pad(voix, ((0, n - len(voix)), (0, 0)))
    voix *= 10 ** ((-15 - pt.lufs(voix)) / 20)
    env = np.convolve(np.abs(voix[:, 0]), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same")
    actif = np.convolve((env > 10 ** (-38 / 20)).astype(float), np.ones(int(0.3 * SR)) / int(0.3 * SR), "same")
    mus = mus * 10 ** ((pt.lufs(voix) - 16 - pt.lufs(mus)) / 20)
    t = np.arange(n) / SR
    gain_db = np.where(t > PLANS["fin"] + 1.6, 7, 6 * (1 - actif))
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
    import subprocess
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(brut), "-af",
                    f"alimiter=limit={lim(-2.5):.4f}:attack=3:release=60:level=disabled,"
                    f"aresample=192000,alimiter=limit={lim(-2.3):.4f}:attack=1:release=30:level=disabled,"
                    f"aresample={SR}", "-c:a", "pcm_s24le", str(PUBLIC / "mix-v2.wav")], check=True)
    brut.unlink()
    fin = pt.lire(PUBLIC / "mix-v2.wav")
    txt = ["# Son — publicité Talkami v2", "",
           f"- Mix : **{pt.lufs(fin):.1f} LUFS** ; voix v2 (voir voix-v2/comparaison.md) ; musique originale v2 "
           f"(Si♭ majeur, 100 BPM) 16 LU sous la voix, +6 dB dans les respirations.", "",
           "| Temps | Effet | Quoi |", "|---|---|---|", *lignes]
    (PROJET / "sons-v2.md").write_text("\n".join(txt) + "\n")
    print("\n".join(txt[:3]))


if __name__ == "__main__":
    main()
