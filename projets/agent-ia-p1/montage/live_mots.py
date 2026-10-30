"""Retranscrit chaque passage de parole en direct du plan (avec un vocabulaire d'amorce) : sorties/live/*.json."""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

sys.path.insert(0, str(Path(__file__).resolve().parent))
import plan  # noqa: E402
from textes import PROJET  # noqa: E402

OUT = Path(__file__).resolve().parent / "sorties" / "live"
OUT.mkdir(parents=True, exist_ok=True)
AMORCE = ("Claude, Claude Code, GitHub, dépôt, cahier des charges, chef de projet, bloc-notes, Kekeli, Lovable, Cursor, "
          "Manus, Lomé IA School, agent de programmation, vibe coding, Cloudflare.")
model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
for el in plan.VIDEO_1A + plan.VIDEO_1B:
    if el[0] != "live":
        continue
    _, rush, t0, t1, _, _ = el
    cible = OUT / f"{Path(rush).stem}_{t0:.1f}.json"
    if cible.exists():
        continue
    a = max(0, t0 - 0.5)
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(a), "-to", str(t1 + 0.5), "-i", str(PROJET / rush),
                          "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    segs, _ = model.transcribe(audio, language="fr", word_timestamps=True, vad_filter=True, beam_size=5, initial_prompt=AMORCE)
    mots = [{"mot": w.word.strip(), "debut": round(a + w.start, 3), "fin": round(a + w.end, 3)} for s in segs for w in s.words]
    mots = [m for m in mots if t0 - 0.2 <= m["debut"] <= t1 + 0.2]
    cible.write_text(json.dumps(mots, ensure_ascii=False))
    print(cible.name, " ".join(m["mot"] for m in mots))
