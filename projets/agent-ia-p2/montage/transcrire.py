"""Transcription horodatée (mot par mot) d'une vidéo : faster-whisper large-v3-turbo, sans filtre de voix (les
reprises restent visibles). Usage : python3 -I transcrire.py <video> <sortie.json>  → aussi <sortie>.txt lisible."""
import json
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

src, out = sys.argv[1], sys.argv[2]
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
a = np.frombuffer(pcm, np.float32)
m = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
segs, _ = m.transcribe(a, language="fr", word_timestamps=True, vad_filter=False, beam_size=5)
res = []
with open(out.replace(".json", ".txt"), "w") as f:
    for s in segs:
        res.append({"debut": s.start, "fin": s.end, "texte": s.text, "mots": [{"m": w.word, "d": w.start, "f": w.end} for w in s.words]})
        f.write(f"[{int(s.start // 60):02d}:{s.start % 60:05.2f}] {s.text.strip()}\n")
        f.flush()
json.dump(res, open(out, "w"), ensure_ascii=False)
