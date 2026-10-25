"""Nettoie une voix off : garde les bonnes prises, enlève le reste, puis traite le son.

Usage : python3 scripts/voix.py <projet>
Entrée : projets/<projet>/voix_brute.m4a et projets/<projet>/prises.json
  [{"de": 1.23, "a": 4.56, "note": "..."}, ...]
  "de"/"a" = bornes d'une bonne prise dans la voix brute (secondes) ; tout le reste est retiré.
  Dans chaque prise, un silence de plus de PAUSE_MAX est ramené à PAUSE (on garde FIN_MOT après la fin
  du son et DEBUT_MOT avant la reprise, pour ne jamais couper une fin de mot).
Sortie : projets/<projet>/voix_nettoyee.wav (48 kHz mono, −14 LUFS, crête vraie ≤ −1 dBTP),
         voix_nettoyee.m4a (pour l'écoute) et voix_correspondance.json
         ([début brut, fin brute, début nettoyé] de chaque morceau gardé).

Chaîne : réduction de bruit (sur la prise entière, profil du bruit de fond), passe-haut 80 Hz,
bruit abaissé de 10 dB au plus entre les mots (expandeur doux), creux de 3 dB à 250 Hz (voix moins sourde), présence +3 dB à 3,5 kHz, air +2 dB au-dessus de 10 kHz,
adoucissement des « s », compression légère 2,5:1, puis gain fixe vers −14 LUFS et limiteur de crête
suréchantillonné. Aucune modification du timbre ni de la hauteur.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
FONDU = 0.012          # fondu enchaîné à chaque raccord (s)
CIBLE_LUFS = -14.0
PLAFOND_DBTP = -1.0
SEUIL_SILENCE_DB = -32  # bruit de fond ≈ −43 dB après réduction, parole −8 à −15 dB
PAUSE_MAX = 0.40
FIN_MOT = 0.18
DEBUT_MOT = 0.12
BRUIT_JUSQUA = 2.0      # le premier silence de la prise brute sert de profil de bruit (s)


def ffmpeg(entree, sortie, filtres):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(entree), "-af", filtres,
                    "-ac", "1", "-ar", str(SR), "-c:a", "pcm_f32le", str(sortie)], check=True)


def crete_vraie(x):
    """Crête vraie (dBTP) par suréchantillonnage ×4."""
    from scipy.signal import resample_poly
    return 20 * np.log10(np.max(np.abs(resample_poly(x, 4, 1))) + 1e-12)


def raccourcir_silences(x, de, a):
    """Morceaux [début, fin] de la prise, sans les silences de plus de PAUSE_MAX."""
    f = int(0.02 * SR)
    seg = x[int(de * SR):int(a * SR)]
    n = len(seg) // f
    db = 20 * np.log10(np.sqrt(np.mean(seg[:n * f].reshape(n, f) ** 2, 1)) + 1e-9)
    silence = db < SEUIL_SILENCE_DB
    morceaux, debut, i = [], de, 0
    while i < n:
        if not silence[i]:
            i += 1
            continue
        j = i
        while j < n and silence[j]:
            j += 1
        t0, t1 = de + i * 0.02, de + j * 0.02
        if t1 - t0 > PAUSE_MAX and i > 0 and j < n:
            morceaux.append([debut, t0 + FIN_MOT])
            debut = t1 - DEBUT_MOT
        i = j
    morceaux.append([debut, a])
    return morceaux


def main():
    projet = ROOT / "projets" / sys.argv[1]
    tmp = projet / "_voix"
    tmp.mkdir(exist_ok=True)
    prises = json.loads((projet / "prises.json").read_text())

    # 1. Réduction de bruit sur toute la prise brute, profil appris sur le silence du début
    #    (spectral gating modéré : 80 % du bruit retiré, pas plus, pour éviter le son « métallique »).
    import noisereduce as nr
    filtre = tmp / "passe_haut.wav"
    ffmpeg(projet / "voix_brute.m4a", filtre, "highpass=f=80")
    x, _ = sf.read(filtre)
    x = nr.reduce_noise(y=x, sr=SR, y_noise=x[:int(BRUIT_JUSQUA * SR)], stationary=True,
                        prop_decrease=0.8, n_fft=2048)

    # 2. Découpage : bonnes prises, silences longs raccourcis.
    morceaux = []
    for p in prises:
        morceaux += raccourcir_silences(x, p["de"], p["a"])

    # 3. Montage avec un fondu court à chaque raccord.
    sortie, corresp, t = np.zeros(0), [], 0.0
    nf = int(FONDU * SR)
    rampe = np.linspace(0, 1, nf)
    for de, a in morceaux:
        m = x[int(de * SR):int(a * SR)].copy()
        m[:nf] *= rampe
        m[-nf:] *= rampe[::-1]
        if len(sortie) >= nf:
            sortie[-nf:] += m[:nf]
            m = m[nf:]
            t -= FONDU
        corresp.append([round(de, 3), round(a, 3), round(t, 3)])
        sortie = np.concatenate([sortie, m])
        t += a - de
    monte = tmp / "monte.wav"
    sf.write(monte, sortie, SR, subtype="FLOAT")

    # 4. Égalisation, « s » adoucis, compression légère.
    traite = tmp / "traite.wav"
    ffmpeg(monte, traite,
           "equalizer=f=250:t=q:w=1.2:g=-3,equalizer=f=3500:t=q:w=1:g=3,highshelf=f=10000:g=2,"
           "deesser=i=0.4:m=0.5:f=0.5,"
           "agate=threshold=0.01:range=0.3:ratio=2:attack=5:release=200:knee=4,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2")
    y, _ = sf.read(traite)

    # 5. Gain fixe vers −14 LUFS, puis limiteur suréchantillonné (marge pour l'encodage AAC).
    y *= 10 ** ((CIBLE_LUFS - pyln.Meter(SR).integrated_loudness(y)) / 20)
    sf.write(tmp / "gain.wav", y, SR, subtype="FLOAT")
    ffmpeg(tmp / "gain.wav", tmp / "limite.wav",
           "aresample=192000,alimiter=limit=0.72:attack=1:release=60:level=disabled,aresample=48000")
    y, _ = sf.read(tmp / "limite.wav")
    y *= 10 ** ((CIBLE_LUFS - pyln.Meter(SR).integrated_loudness(y)) / 20)
    sf.write(projet / "voix_nettoyee.wav", y, SR, subtype="PCM_24")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(projet / "voix_nettoyee.wav"),
                    "-c:a", "aac", "-b:a", "192k", str(projet / "voix_nettoyee.m4a")], check=True)
    (projet / "voix_correspondance.json").write_text(json.dumps(corresp))

    final, _ = sf.read(projet / "voix_nettoyee.wav")
    print(f"durée {len(final) / SR:.1f} s, {pyln.Meter(SR).integrated_loudness(final):.1f} LUFS, "
          f"crête vraie {crete_vraie(final):.1f} dBTP")


if __name__ == "__main__":
    main()
