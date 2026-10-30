"""Voix off de la publicité Talkami, version 2 : plus vivante, plus présente, un peu plus rapide.

Usage : python3 scripts/voix_pub.py
  1. coupe le silence du début et de la fin, raccourcit les silences entre phrases à 0,30 s (fondus de 15 ms) ;
  2. débruitage doux, égaliseur (chaleur, moins de « carton », présence, brillance), désesseur,
     compression en deux étages (voix pleine et proche), accélération de 5 % sans changer la hauteur (rubberband) ;
  3. −14 LUFS, crête vraie < −1 dBTP → projets/talkami-pub/voix-v2/voix-v2.wav ;
  4. comparaison avant / après (mêmes mesures) → projets/talkami-pub/voix-v2/comparaison.md, et un fichier à écouter
     avant puis après → projets/talkami-pub/voix-v2/avant-apres.m4a.
"""
import json
import subprocess
from pathlib import Path

import numpy as np
import pyloudnorm as pyln

ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "projets" / "talkami-pub"
OUT = P / "voix-v2"
SR = 48000
DEBUT, FIN = 1.65, 28.60          # s dans la voix d'origine
TEMPO = 1.05
SILENCE = 0.30                    # s entre deux phrases
# Silences entre phrases mesurés (ffmpeg silencedetect, −35 dB), en s dans la voix d'origine.
PAUSES = [(5.90, 6.63), (19.63, 20.12), (22.40, 22.77)]


def lire(f):
    r = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(f), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, 2).copy()


def ecrire(f, x, codec="pcm_s24le"):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-c:a", codec, *(["-b:a", "192k"] if codec == "aac" else []), str(f)],
                   input=x.astype(np.float32).tobytes(), check=True)


def couper(x):
    """Garde DEBUT → FIN et raccourcit chaque pause à SILENCE (on retire le milieu, fondu de 15 ms)."""
    retraits = []
    for a, b in PAUSES:
        if b - a > SILENCE:
            m = (a + b) / 2
            retraits.append((m - (b - a - SILENCE) / 2, m + (b - a - SILENCE) / 2))
    morceaux, t = [], DEBUT
    for a, b in retraits:
        morceaux.append((t, a))
        t = b
    morceaux.append((t, FIN))
    f = int(0.015 * SR)
    rampe = np.linspace(0, 1, f)[:, None]
    sortie = None
    for a, b in morceaux:
        m = x[int(a * SR):int(b * SR)].copy()
        if sortie is None:
            sortie = m
        else:
            fondu = sortie[-f:] * (1 - rampe) + m[:f] * rampe
            sortie = np.concatenate([sortie[:-f], fondu, m[f:]])
    return sortie, retraits


FILTRES = ",".join([
    "highpass=f=80:poles=2",
    "afftdn=nr=12:nf=-42:tn=1",
    "equalizer=f=170:t=q:w=0.9:g=2",          # chaleur, timbre gardé
    "equalizer=f=350:t=q:w=1.3:g=-3",         # moins de son « carton »
    "equalizer=f=2800:t=q:w=1.0:g=1.5",       # intelligibilité
    "equalizer=f=4800:t=q:w=1.2:g=2",         # présence
    "highshelf=f=10000:g=1.5",                # brillance, air
    "agate=threshold=0.012:ratio=2:range=0.3:attack=4:release=180:knee=3",   # souffle entre les mots, sans couper
    "acompressor=threshold=-26dB:ratio=4:attack=5:release=90:makeup=5dB:knee=4",   # voix pleine et proche
    "acompressor=threshold=-14dB:ratio=2:attack=15:release=200:makeup=1dB:knee=6",  # régularité
    "deesser=i=0.5:f=0.5",                    # après la compression, qui fait ressortir les « s »
    f"rubberband=tempo={TEMPO}:pitchq=quality:formant=preserved:transients=mixed:detector=soft",
])


def mesures(x):
    """Timbre mesuré sur la parole seulement (trames de 40 ms à moins de 25 dB du maximum), par rapport aux médiums."""
    m = pyln.Meter(SR)
    mono = x.mean(1)
    n = int(0.04 * SR)
    trames = mono[:len(mono) // n * n].reshape(-1, n)
    rms = np.sqrt((trames ** 2).mean(1)) + 1e-9
    parole = trames[20 * np.log10(rms / rms.max()) > -25]
    spec = (np.abs(np.fft.rfft(parole * np.hanning(n), axis=1)) ** 2).mean(0)
    f = np.fft.rfftfreq(n, 1 / SR)
    bande = lambda a, b: 10 * np.log10(spec[(f >= a) & (f < b)].mean() / spec[(f >= 500) & (f < 2000)].mean())
    return {"duree": len(x) / SR, "lufs": m.integrated_loudness(x),
            "chaleur": bande(120, 300), "presence": bande(2500, 6000), "brillance": bande(6000, 12000)}


def lra_tp(f):
    r = subprocess.run(["ffmpeg", "-nostdin", "-i", str(f), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr.splitlines()
    lra = [l for l in r if "LRA:" in l][-1].split()[1]
    tp = [l for l in r if "Peak:" in l][-1].split()[1]
    return float(lra), float(tp)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    brut = lire(P / "source.mp4")
    coupe, retraits = couper(brut)
    tmp = OUT / "_coupe.wav"
    ecrire(tmp, coupe)
    traite = OUT / "_traite.wav"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(tmp), "-af", FILTRES, "-ar", str(SR), "-ac", "2",
                    "-c:a", "pcm_s24le", str(traite)], check=True)
    v = lire(traite)
    v *= 10 ** ((-14 - pyln.Meter(SR).integrated_loudness(v)) / 20)
    ecrire(tmp, v)
    final = OUT / "voix-v2.wav"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(tmp), "-af",
                    "aresample=192000,alimiter=limit=0.79:attack=1:release=40:level=disabled,aresample=48000",
                    "-c:a", "pcm_s24le", str(final)], check=True)
    # Référence « avant » : même extrait, sans traitement, ramené à −14 LUFS pour comparer à volume égal.
    avant = brut[int(DEBUT * SR):int(FIN * SR)]
    avant = avant * 10 ** ((-14 - pyln.Meter(SR).integrated_loudness(avant)) / 20)
    ecrire(OUT / "_avant.wav", avant)
    a, b = mesures(avant), mesures(lire(final))
    (la, ta), (lb, tb) = lra_tp(OUT / "_avant.wav"), lra_tp(final)
    lignes = ["# Voix off : avant / après", "",
              "| Mesure | Avant (brute, ramenée à −14 LUFS) | Après |", "|---|---|---|",
              f"| Durée | {a['duree']:.2f} s | {b['duree']:.2f} s |",
              f"| Volume intégré | {a['lufs']:.1f} LUFS | {b['lufs']:.1f} LUFS |",
              f"| Écart de volume (LRA, plus bas = plus régulier) | {la:.1f} LU | {lb:.1f} LU |",
              f"| Crête vraie | {ta:.1f} dBTP | {tb:.1f} dBTP |",
              f"| Chaleur 120–300 Hz (par rapport aux médiums 500–2 000 Hz) | {a['chaleur']:.1f} dB | {b['chaleur']:.1f} dB |",
              f"| Présence 2,5–6 kHz | {a['presence']:.1f} dB | {b['presence']:.1f} dB |",
              f"| Brillance 6–12 kHz | {a['brillance']:.1f} dB | {b['brillance']:.1f} dB |", "",
              f"Silences raccourcis à {SILENCE:.2f} s (dans la voix d'origine) : "
              + ", ".join(f"{x:.2f}–{y:.2f} s" for x, y in retraits) + f" ; tempo × {TEMPO} sans changer la hauteur."]
    (OUT / "comparaison.md").write_text("\n".join(lignes) + "\n")
    # Fichier à écouter : avant, 1 s de silence, après.
    av = lire(OUT / "_avant.wav")
    ecrire(OUT / "avant-apres.m4a", np.concatenate([av, np.zeros((SR, 2)), lire(final)]), codec="aac")
    for f in (tmp, traite, OUT / "_avant.wav"):
        f.unlink()
    print("\n".join(lignes))


if __name__ == "__main__":
    main()
