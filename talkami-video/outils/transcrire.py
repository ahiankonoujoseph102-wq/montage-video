"""Transcription horodatée mot par mot d'une narration (faster-whisper).

Usage : python outils/transcrire.py voix.m4a transcription.json [texte_prevu.txt | glossaire.json] [modele]
Le texte prévu sert d'indice (initial_prompt) : noms propres, début de phrase.
"""
import json
import subprocess
import sys

import numpy as np

from faster_whisper import WhisperModel

source, destination = sys.argv[1], sys.argv[2]
indice = None
if len(sys.argv) > 3 and sys.argv[3]:
    if sys.argv[3].endswith(".json"):  # glossaire : les termes servent d'indice
        indice = ", ".join(json.load(open(sys.argv[3], encoding="utf-8"))["termes"]) + "."
    else:
        indice = open(sys.argv[3], encoding="utf-8").read()
modele = WhisperModel(sys.argv[4] if len(sys.argv) > 4 else "small", device="cpu", compute_type="int8")
# Décodage par ffmpeg (16 kHz mono) : évite les incompatibilités de PyAV.
pcm = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", source, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
    check=True, capture_output=True,
).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
segments, _ = modele.transcribe(audio, language="fr", word_timestamps=True, vad_filter=False, beam_size=5,
                                  initial_prompt=indice, condition_on_previous_text=False)
mots = [
    {"mot": m.word.strip(), "debut": round(m.start, 3), "fin": round(m.end, 3), "proba": round(m.probability, 3)}
    for s in segments
    for m in s.words
]
with open(destination, "w", encoding="utf-8") as f:
    json.dump(mots, f, ensure_ascii=False, indent=1)
print(len(mots), "mots")
print(" ".join(m["mot"] for m in mots))
