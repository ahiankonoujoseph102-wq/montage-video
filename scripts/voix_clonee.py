# Voix clonée de Joseph, phrase par phrase (Chatterbox multilingue, licence MIT, gratuit), avec mesure des temps.
# Usage : python scripts/voix_clonee.py <script.json> <reference.wav> <dossier sortie>
import json, sys, time, torch, torchaudio
from pathlib import Path
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
torch.set_num_threads(4)
script, ref, out = sys.argv[1], sys.argv[2], Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
t0 = time.time()
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
mesures = {"chargement_s": round(time.time() - t0, 1), "phrases": []}
for i, p in enumerate(json.load(open(script))["phrases"]):
    texte = p.get("dit", p["texte"])
    t1 = time.time()
    torch.manual_seed(1234 + i)
    w = m.generate(texte, language_id="fr", audio_prompt_path=ref, exaggeration=0.55, cfg_weight=0.35, temperature=0.8)
    torchaudio.save(str(out / f"{i:02d}.wav"), w, m.sr)
    d = time.time() - t1
    mesures["phrases"].append({"i": i, "duree_audio": round(w.shape[-1] / m.sr, 2), "temps_calcul": round(d, 1)})
    print(i, mesures["phrases"][-1], flush=True)
mesures["total_s"] = round(time.time() - t0, 1)
json.dump(mesures, open(out / "mesures.json", "w"), indent=1)
print("FIN", mesures["total_s"])
