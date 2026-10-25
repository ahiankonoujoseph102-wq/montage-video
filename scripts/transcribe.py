"""Transcrit projets/<projet>/source.mp4 en français, avec l'horodatage de chaque mot.

Usage : python3 scripts/transcribe.py <projet> [fichier]   (par défaut source.mp4 du projet)
Sortie : projets/<projet>/transcription_brute.json
"""
import json
import subprocess
import sys
import time
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parent.parent

projet = ROOT / "projets" / sys.argv[1]
# Pas d'amorce (initial_prompt) avec le glossaire : à l'essai, elle a fait sauter
# un passage entier. Le glossaire est appliqué après coup par corriger.py.

t0 = time.time()
model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
# Décodage par ffmpeg (16 kHz mono) : le décodeur d'av change d'API selon les versions.
pcm = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", str(projet / (sys.argv[2] if len(sys.argv) > 2 else "source.mp4")),
     "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
    check=True, capture_output=True).stdout
segments, _ = model.transcribe(
    np.frombuffer(pcm, np.float32),
    language="fr",
    word_timestamps=True,
    vad_filter=True,
    beam_size=5,
)
mots = []
for s in segments:
    for w in s.words:
        mots.append({"mot": w.word.strip(), "debut": round(w.start, 3), "fin": round(w.end, 3), "proba": round(w.probability, 2)})
(projet / "transcription_brute.json").write_text(json.dumps(mots, ensure_ascii=False, indent=1))
print(f"{len(mots)} mots transcrits en {time.time() - t0:.0f} s")
