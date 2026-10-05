import json, sys, time
from faster_whisper import WhisperModel
t0 = time.time()
m = WhisperModel('large-v3-turbo', device='cpu', compute_type='int8', cpu_threads=4)
segs, info = m.transcribe(sys.argv[1], language='fr', word_timestamps=True, vad_filter=True, beam_size=5)
words, lines = [], []
for s in segs:
    lines.append(f"[{s.start:6.1f}] {s.text.strip()}")
    for w in s.words:
        words.append({"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3), "prob": round(w.probability, 2)})
json.dump(words, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
open(sys.argv[3], 'w').write("\n".join(lines))
print(f"{len(words)} mots, {time.time()-t0:.0f} s de transcription")
