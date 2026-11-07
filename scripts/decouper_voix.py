"""Découpe l'enregistrement de Joseph (sa vraie voix) en une piste par phrase du script, comme la voix clonée.

Usage : python3 scripts/decouper_voix.py <audio> <script.json> <dossier sortie>
- léger nettoyage (graves inutiles, bruit de fond doux), 24 kHz mono ;
- transcription avec l'heure de chaque mot (faster-whisper), alignée sur le texte du script (difflib) ;
- chaque phrase est coupée entre son premier et son dernier mot reconnus (petites marges), les phrases non
  reconnues reçoivent la part de temps qui leur revient entre leurs voisines ;
- écrit 00.wav, 01.wav… et mesures.json (mots reconnus, durée).
"""
import difflib
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

audio, script, out = Path(sys.argv[1]), json.loads(Path(sys.argv[2]).read_text()), Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
SR = 24000
propre = out / "voix_propre.wav"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(audio), "-af", "highpass=f=70,afftdn=nr=6:nf=-45",
                "-ac", "1", "-ar", str(SR), str(propre)], check=True)
with wave.open(str(propre)) as w:
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
duree = len(x) / SR

norm = lambda t: re.sub(r"[^\w]", "", t.lower())
modele = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = modele.transcribe(str(propre), language="fr", word_timestamps=True, vad_filter=False, beam_size=5)
mots = [(norm(w.word), w.start, w.end) for s in segs for w in s.words if norm(w.word)]

phrases = script["phrases"]
cibles = [(i, norm(m)) for i, p in enumerate(phrases) for m in p["texte"].split() if norm(m)]
sm = difflib.SequenceMatcher(None, [c[1] for c in cibles], [m[0] for m in mots], autojunk=False)
debut, fin = {}, {}
for a, b, n in sm.get_matching_blocks():
    for k in range(n):
        i = cibles[a + k][0]
        _, t0, t1 = mots[b + k]
        debut[i] = min(debut.get(i, t0), t0)
        fin[i] = max(fin.get(i, t1), t1)
# Phrases sans mot reconnu : temps réparti entre les voisines reconnues.
bornes, n = [], len(phrases)
for i in range(n):
    if i in debut:
        bornes.append([debut[i], fin[i]])
        continue
    av = max([fin[j] for j in range(i) if j in fin], default=0.0)
    ap = min([debut[j] for j in range(i + 1, n) if j in debut], default=duree)
    bornes.append([av, ap])
for i in range(n):  # pas de chevauchement, marges douces
    a = bornes[i][0] - 0.08
    b = bornes[i][1] + 0.18
    if i:
        a = max(a, (bornes[i - 1][1] + bornes[i][0]) / 2)
    if i + 1 < n:
        b = min(b, (bornes[i][1] + bornes[i + 1][0]) / 2)
    seg = x[max(0, int(a * SR)):min(len(x), int(b * SR))]
    with wave.open(str(out / f"{i:02d}.wav"), "wb") as w:
        w.setnchannels(1), w.setsampwidth(2), w.setframerate(SR)
        w.writeframes((np.clip(seg, -1, 1) * 32767).astype(np.int16).tobytes())
reconnus = sum(n for *_, n in sm.get_matching_blocks())
mesures = {"source": "voix enregistrée par Joseph", "duree_s": round(duree, 1), "mots_script": len(cibles),
           "mots_reconnus": reconnus, "phrases_reperees": len(debut), "phrases": n}
(out / "mesures.json").write_text(json.dumps(mesures, ensure_ascii=False))
print(json.dumps(mesures, ensure_ascii=False))
if len(debut) < 0.7 * n:
    sys.exit("Moins de 70 % des phrases retrouvées dans l'enregistrement : vérifier que c'est le bon texte.")
