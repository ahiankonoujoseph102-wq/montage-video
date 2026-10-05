"""Transcrit projets/<projet>/source.mp4 en français, avec l'horodatage de chaque mot.

Usage : python3 scripts/transcribe.py <projet>
Sortie : projets/<projet>/transcription_brute.json
"""
import json
import sys
import time
from pathlib import Path

from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parent.parent

projet = ROOT / "projets" / sys.argv[1]
# Pas d'amorce (initial_prompt) avec le glossaire : à l'essai, elle a fait sauter
# un passage entier. Le glossaire est appliqué après coup par corriger.py.

t0 = time.time()
model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
segments, _ = model.transcribe(
    str(projet / "source.mp4"),
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
