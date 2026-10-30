"""Contrôle de la voix montée : on la retranscrit et on la compare au texte attendu (sorties/controle_<v>.txt).
Signale les mots en trop (répétitions, hésitations) et les blancs de plus de 0,7 s."""
import difflib
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

sys.path.insert(0, str(Path(__file__).resolve().parent))
from textes import normaliser  # noqa: E402

SERIE = Path("/home/user/montage-videos/serie-animee/public/formation")
v = sys.argv[1]
data = json.loads((SERIE / v / "montage.json").read_text())
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(SERIE / v / "voix.wav"), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
segs, _ = model.transcribe(audio, language="fr", word_timestamps=True, beam_size=5)
dits = [(j, w.start, w.end) for s in segs for w in s.words for j in normaliser(w.word)]
(Path(__file__).resolve().parent / "sorties" / f"controle_{v}.json").write_text(json.dumps(dits))
att = [j for m in data["mots"] for j in normaliser(m["texte"])]
a = [d[0] for d in dits]
sm = difflib.SequenceMatcher(None, att, a, autojunk=False)
lignes = []
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op in ("insert", "replace") and (j2 - j1) - (i2 - i1) >= 2:
        lignes.append(f"EN TROP {dits[j1][1]:7.1f}-{dits[j2 - 1][2]:7.1f} : {' '.join(a[j1:j2])}   (attendu : {' '.join(att[i1:i2])})")
for k in range(1, len(dits)):
    if dits[k][1] - dits[k - 1][2] > 0.9:
        lignes.append(f"BLANC   {dits[k - 1][2]:7.1f}-{dits[k][1]:7.1f} ({dits[k][1] - dits[k - 1][2]:.1f} s)")
(Path(__file__).resolve().parent / "sorties" / f"controle_{v}.txt").write_text("\n".join(lignes))
print(v, len(lignes), "remarques")
