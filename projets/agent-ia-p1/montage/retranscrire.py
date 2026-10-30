"""Transcription complète des sources de voix, sans filtre de silence (VAD) : les phrases recommencées apparaissent
toutes, pour que l'alignement garde la dernière bonne prise. Sortie : sorties/trans_complet/<nom>.json"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

sys.path.insert(0, str(Path(__file__).resolve().parent))
from textes import PROJET  # noqa: E402

OUT = Path(__file__).resolve().parent / "sorties" / "trans_complet"
OUT.mkdir(parents=True, exist_ok=True)
SOURCES = ["rushes/20261027-153738.mp4", "rushes/20261027-154022.mp4", "voix/fin-1a.m4a", "voix/audio-1346.m4a", "voix/audio-2.m4a", "voix/recapitulatif.mp4"]
model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
for s in SOURCES:
    cible = OUT / (Path(s).stem + ".json")
    if cible.exists():
        continue
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(PROJET / s), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    segs, _ = model.transcribe(audio, language="fr", word_timestamps=True, vad_filter=False, beam_size=5, condition_on_previous_text=False)
    res = [{"debut": round(x.start, 2), "fin": round(x.end, 2), "texte": x.text.strip(),
            "mots": [{"mot": w.word.strip(), "debut": round(w.start, 3), "fin": round(w.end, 3), "proba": round(w.probability, 2)} for w in x.words]} for x in segs]
    cible.write_text(json.dumps(res, ensure_ascii=False))
    print(s, len(res), flush=True)
