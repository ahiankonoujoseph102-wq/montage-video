"""Voix off de la publicité Talkami, version 3 : deux propositions (« naturelle » et « radio »), à partir de la voix
d'origine avec les réglages de la v2 poussés plus loin.

Usage : python3 scripts/voix_pub3.py
  - coupe le début et la fin, ramène chaque pause à ~0,22–0,25 s (fondus de 15 ms) ;
  - chaîne commune : passe-haut, débruitage, expandeur doux (raccourcit la queue de réverbération de la pièce entre
    les mots) ;
  - « naturelle » : égaliseur modéré, compression 2 étages, désesseur ; « radio » : graves plus pleins (effet de
    proximité), présence et brillance plus marquées, compression plus forte (voix « devant »), désesseur plus ferme ;
  - tempo × 1,07 sans changer la hauteur (rubberband, formants préservés) ;
  - −14 LUFS, crête vraie < −1 dBTP → projets/talkami-pub/voix-v3/voix-naturelle.wav et voix-radio.wav ;
  - comparaison : voix d'origine, puis naturelle, puis radio (séparées par 1, 2 et 3 « ding ») → comparaison-voix.m4a ;
  - temps des mots dans la nouvelle voix → projets/talkami-pub/voix-v3/mots.json (texte exact de Joseph).
"""
import json
import subprocess
from pathlib import Path

import numpy as np
import pyloudnorm as pyln

ROOT = Path(__file__).resolve().parent.parent
P = ROOT / "projets" / "talkami-pub"
OUT = P / "voix-v3"
SR = 48000
DEBUT, FIN = 1.65, 28.60
TEMPO = 1.07
# Pauses mesurées (silencedetect −33 dB) → durée gardée.
PAUSES = [(2.98, 3.73, 0.28), (5.88, 6.63, 0.25), (10.20, 10.47, 0.18), (14.23, 14.55, 0.22),
          (19.58, 20.12, 0.25), (22.40, 22.90, 0.25), (26.44, 26.82, 0.22)]
FONDU = 0.015

COMMUN = [
    "highpass=f=75:poles=2",
    "afftdn=nr=14:nf=-45:tn=1",
    "agate=threshold=0.018:ratio=3:range=0.18:attack=3:release=120:knee=3",
]
NATURELLE = COMMUN + [
    "equalizer=f=140:t=q:w=0.9:g=2.5",     # corps, chaleur
    "equalizer=f=320:t=q:w=1.3:g=-2.5",    # moins de « carton »
    "equalizer=f=2500:t=q:w=1.0:g=1.5",    # clarté
    "equalizer=f=4500:t=q:w=1.2:g=2.5",    # présence
    "highshelf=f=10000:g=2",               # air
    "acompressor=threshold=-24dB:ratio=3.5:attack=6:release=100:makeup=4dB:knee=4",
    "acompressor=threshold=-12dB:ratio=2:attack=12:release=180:makeup=1dB:knee=6",
    "deesser=i=0.5:f=0.5",
]
RADIO = COMMUN + [
    "lowshelf=f=120:g=4",                  # graves pleins, voix « proche »
    "equalizer=f=400:t=q:w=1.2:g=-3",      # moins de son boîte
    "equalizer=f=2200:t=q:w=1.0:g=2",      # articulation
    "equalizer=f=4000:t=q:w=1.1:g=4",      # présence radio
    "highshelf=f=9000:g=3.5",              # brillance
    "acompressor=threshold=-30dB:ratio=5:attack=3:release=80:makeup=8dB:knee=6",
    "acompressor=threshold=-14dB:ratio=3:attack=8:release=150:makeup=1dB:knee=4",
    "deesser=i=0.5:f=0.55",
]
FIN_CHAINE = [f"rubberband=tempo={TEMPO}:pitchq=quality:formant=preserved:transients=mixed:detector=soft"]


def lire(f):
    r = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(f), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, 2).copy()


def ecrire(f, x, aac=False):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    *(["-c:a", "aac", "-b:a", "192k"] if aac else ["-c:a", "pcm_s24le"]), str(f)],
                   input=x.astype(np.float32).tobytes(), check=True)


def lufs(x):
    return pyln.Meter(SR).integrated_loudness(x)


def retraits():
    r = []
    for a, b, garde in PAUSES:
        m = (a + b) / 2
        r.append((m - (b - a - garde) / 2, m + (b - a - garde) / 2))
    return r


def couper(x):
    morceaux, t = [], DEBUT
    for a, b in retraits():
        morceaux.append((t, a))
        t = b
    morceaux.append((t, FIN))
    f = int(FONDU * SR)
    rampe = np.linspace(0, 1, f)[:, None]
    sortie = None
    for a, b in morceaux:
        m = x[int(a * SR):int(b * SR)].copy()
        sortie = m if sortie is None else np.concatenate([sortie[:-f], sortie[-f:] * (1 - rampe) + m[:f] * rampe, m[f:]])
    return sortie


def nouveau_temps(s):
    """Temps dans la voix d'origine → temps dans la nouvelle voix."""
    r = s - DEBUT
    for a, b in retraits():
        if s >= b:
            r -= (b - a) + FONDU
        elif s > a:
            r -= s - a
    return round(r / TEMPO, 3)


def traiter(entree, chaine, sortie):
    tmp = OUT / "_t.wav"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(entree), "-af", ",".join(chaine + FIN_CHAINE),
                    "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s24le", str(tmp)], check=True)
    v = lire(tmp)
    v *= 10 ** ((-14 - lufs(v)) / 20)
    ecrire(tmp, v)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(tmp), "-af",
                    "aresample=192000,alimiter=limit=0.79:attack=1:release=40:level=disabled,aresample=48000",
                    "-c:a", "pcm_s24le", str(sortie)], check=True)
    tmp.unlink()
    return lire(sortie)


def ding(n):
    """n petits « ding » (Sol, accordés sur les effets) pour séparer les versions."""
    t = np.arange(int(0.35 * SR)) / SR
    d = 0.25 * np.sin(2 * np.pi * 784 * t) * np.exp(-t / 0.08)
    seq = np.concatenate([np.concatenate([d, np.zeros(int(0.1 * SR))]) for _ in range(n)])
    return np.stack([seq, seq], 1)


def mesures(x, f):
    r = subprocess.run(["ffmpeg", "-nostdin", "-i", str(f), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr.splitlines()
    lra = float([l for l in r if "LRA:" in l][-1].split()[1])
    tp = float([l for l in r if "Peak:" in l][-1].split()[1])
    mono = x.mean(1)
    n = int(0.04 * SR)
    tr = mono[:len(mono) // n * n].reshape(-1, n)
    rms = np.sqrt((tr ** 2).mean(1)) + 1e-9
    parole = tr[20 * np.log10(rms / rms.max()) > -25]
    spec = (np.abs(np.fft.rfft(parole * np.hanning(n), axis=1)) ** 2).mean(0)
    fr = np.fft.rfftfreq(n, 1 / SR)
    b = lambda a, c: 10 * np.log10(spec[(fr >= a) & (fr < c)].mean() / spec[(fr >= 500) & (fr < 2000)].mean())
    # Écart entre les passages forts et faibles de la parole (régularité) : 95e − 10e centile des trames parlées.
    db = 20 * np.log10(rms[20 * np.log10(rms / rms.max()) > -40])
    return {"duree": len(x) / SR, "lufs": lufs(x), "lra": lra, "tp": tp, "corps": b(100, 250),
            "presence": b(2500, 6000), "brillance": b(6000, 12000), "ecart": np.percentile(db, 95) - np.percentile(db, 10)}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    brut = lire(P / "source.mp4")
    coupe = OUT / "_coupe.wav"
    ecrire(coupe, couper(brut))
    nat = traiter(coupe, NATURELLE, OUT / "voix-naturelle.wav")
    rad = traiter(coupe, RADIO, OUT / "voix-radio.wav")
    coupe.unlink()
    avant = brut[int(DEBUT * SR):int(FIN * SR)]
    avant = avant * 10 ** ((-14 - lufs(avant)) / 20)
    ecrire(OUT / "_avant.wav", avant)
    v2 = lire(P / "voix-v2" / "voix-v2.wav")
    m = {"Origine": mesures(avant, OUT / "_avant.wav"), "v2 (précédente)": mesures(v2, P / "voix-v2" / "voix-v2.wav"),
         "Naturelle": mesures(nat, OUT / "voix-naturelle.wav"), "Radio": mesures(rad, OUT / "voix-radio.wav")}
    silence = np.zeros((int(0.6 * SR), 2))
    ecrire(OUT / "comparaison-voix.m4a", np.concatenate(
        [ding(1), silence, avant, silence, ding(2), silence, nat, silence, ding(3), silence, rad]), aac=True)
    (OUT / "_avant.wav").unlink()
    cols = list(m)
    ligne = lambda nom, cle, fmt: f"| {nom} | " + " | ".join(fmt.format(m[c][cle]) for c in cols) + " |"
    txt = ["# Voix off v3 : comparaison", "",
           "Fichier `comparaison-voix.m4a` : 1 ding = voix d'origine, 2 dings = naturelle, 3 dings = radio.", "",
           "| Mesure | " + " | ".join(cols) + " |", "|---|" + "---|" * len(cols),
           ligne("Durée", "duree", "{:.2f} s"), ligne("Volume", "lufs", "{:.1f} LUFS"),
           ligne("Plage de volume LRA (bas = régulier)", "lra", "{:.1f} LU"),
           ligne("Écart fort/faible de la parole", "ecart", "{:.1f} dB"), ligne("Crête vraie", "tp", "{:.1f} dBTP"),
           ligne("Corps 100–250 Hz (vs médiums)", "corps", "{:+.1f} dB"),
           ligne("Présence 2,5–6 kHz (vs médiums)", "presence", "{:+.1f} dB"),
           ligne("Brillance 6–12 kHz (vs médiums)", "brillance", "{:+.1f} dB"), "",
           f"Pauses ramenées à 0,18–0,28 s, tempo × {TEMPO} sans changer la hauteur."]
    (OUT / "comparaison.md").write_text("\n".join(txt) + "\n")
    print("\n".join(txt))
    # Mots au texte exact, recalés sur la nouvelle voix.
    mots = json.loads((P / "mots_texte_exact.json").read_text())
    for x in mots:
        x["a3"], x["b3"] = nouveau_temps(x["a"]), nouveau_temps(x["b"])
    (OUT / "mots.json").write_text(json.dumps([{"t": x["t"], "ph": x["ph"], "a": x["a3"], "b": x["b3"]} for x in mots],
                                              ensure_ascii=False, indent=0))


if __name__ == "__main__":
    main()
