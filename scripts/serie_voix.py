"""Voix de la série TikTok (accroches, phrase de fin) : même traitement que la voix de la formation.

Usage : python3 scripts/serie_voix.py
Lit public/serie-formation-partie1/accroches.m4a (ou le fichier donné en 3e élément) et projets/serie-formation-partie1/
serie.json (« voix » : [début, fin(, fichier)] de chaque phrase, sans les mots « Partie n »). Nettoyage de scripts/voix_formation.py (coupe-bas, débruitage), puis
chaîne « radio » de scripts/voix_radio.py (débit × 1,05, présence, air, dé-esseur, compression), voix à −17 LUFS
(niveau de la voix avant mixage dans scripts/formation_montage.py). Écrit public/serie-formation-partie1/voix/<nom>.wav
(48 kHz mono) et, pour la bouche du double, <nom>_bouche.json (énergie par image) et <nom>_visemes.json (Rhubarb,
variable RHUBARB), avec la même conversion que scripts/double_formation.py.
"""
import json
import os
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public" / "serie-formation-partie1"
cfg = json.loads((ROOT / "projets" / "serie-formation-partie1" / "serie.json").read_text())
radio = json.loads((ROOT / "projets" / "formation-montage-partie1" / "montage_formation.json").read_text())["radio"]
SR, FPS, TEMPO = 48000, 30, radio["tempo"]
FILTRES = ",".join([
    "highpass=f=70", "afftdn=nr=10:nf=-45:tn=1", "lowpass=f=14000",  # voix_formation.py
    f"rubberband=tempo={TEMPO}:formant=preserved:pitchq=quality:transients=mixed",  # voix_radio.py
    "highpass=f=80:poles=2", "afftdn=nr=3:nf=-50:tn=1", "equalizer=f=200:t=q:w=0.9:g=1.5",
    "equalizer=f=4000:t=q:w=1.0:g=2.5", "highshelf=f=11000:g=1.5", "deesser=i=0.35:m=0.5:f=0.5",
    "acompressor=threshold=-21dB:ratio=2.5:attack=12:release=160:knee=4:makeup=1.5",
])

(PUB / "voix").mkdir(parents=True, exist_ok=True)
mesure = pyln.Meter(SR)
F = int(0.012 * SR)
infos = {}
traitees = {}


def traitee(fichier):
    """Fichier source traité (nettoyage + radio), voix à −17 LUFS ; un niveau commun par fichier."""
    if fichier not in traitees:
        brut = subprocess.run(["ffmpeg", "-v", "error", "-i", str(PUB / f"{fichier}.m4a"), "-af", FILTRES, "-ac", "1",
                               "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
        v = np.frombuffer(brut, dtype=np.float32).astype(np.float64)
        traitees[fichier] = v * 10 ** ((-17.0 - mesure.integrated_loudness(v)) / 20)
    return traitees[fichier]


for nom, (a, b, *fichier) in cfg["voix"].items():  # [début, fin] dans accroches.m4a, ou [début, fin, fichier]
    voix = traitee(fichier[0] if fichier else "accroches")
    x = voix[int(a / TEMPO * SR):int(b / TEMPO * SR)].copy()
    x[:F] *= np.linspace(0, 1, F)
    x[-F:] *= np.linspace(1, 0, F)
    sf.write(PUB / "voix" / f"{nom}.wav", x.astype(np.float32), SR, subtype="FLOAT")
    # bouche : énergie par image (une image d'avance) et formes de Rhubarb
    pas = SR // FPS
    n = len(x) // pas + 1
    db = np.array([20 * np.log10(np.sqrt(np.mean(x[max(0, i * pas - pas // 2): i * pas + pas] ** 2)) + 1e-9)
                   for i in range(n)])
    bas, haut = np.percentile(db, 30), np.percentile(db, 97)
    br = np.clip((db - bas) / (haut - bas), 0, 1) ** 0.85
    li = np.zeros(n)
    for i in range(1, n):
        li[i] = li[i - 1] + (br[i] - li[i - 1]) * (0.75 if br[i] > li[i - 1] else 0.5)
    li[li < 0.07] = 0
    bouche = np.concatenate([li[1:], [0.0]])
    with tempfile.TemporaryDirectory() as tmp:
        w16 = Path(tmp) / "v.wav"
        sf.write(w16, x.astype(np.float32), SR, subtype="PCM_16")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(w16), "-ar", "16000", str(Path(tmp) / "v16.wav")], check=True)
        subprocess.run([os.environ.get("RHUBARB", "rhubarb"), "-q", "-r", "phonetic", "-f", "json", "-o",
                        str(Path(tmp) / "r.json"), str(Path(tmp) / "v16.wav")], check=True)
        reperes = json.loads((Path(tmp) / "r.json").read_text())["mouthCues"]
    lettres = ["X"] * n
    for r in reperes:
        d = round(r["start"] * FPS) + 1
        for i in range(d, min(n, max(d + 1, round(r["end"] * FPS) + 1))):
            lettres[i] = r["value"]
    for i in range(n):
        if max(bouche[max(0, i - 1): i + 2]) < 0.03 and lettres[i] not in "XA":
            lettres[i] = "X"
    (PUB / "voix" / f"{nom}_bouche.json").write_text(json.dumps([round(float(v), 2) for v in bouche]))
    (PUB / "voix" / f"{nom}_visemes.json").write_text(json.dumps("".join(lettres)))
    infos[nom] = round(len(x) / SR, 3)
(PUB / "voix" / "durees.json").write_text(json.dumps(infos, indent=1))
print(infos)
