# Voix clonée de Joseph, phrase par phrase (Chatterbox multilingue, licence MIT, gratuit), avec mesure des temps.
# Qualité d'abord (demande de Joseph) : décodeur complet d'origine et réglages par défaut du modèle (expressivité 0,5,
# guidage 0,5) ; VOIX_DECODEUR=rapide pour le décodeur « meanflow » (2× plus rapide, voix un peu moins fidèle).
# Usage : python scripts/voix_clonee.py <script.json> <reference.wav> <dossier sortie>
# Accélérations (mesurées sur 2 cœurs, comme les machines GitHub) :
# - autant de fils de calcul que de cœurs (4 fils sur 2 cœurs se gênaient : 17,9 × le temps réel sur GitHub) ;
# - voix de référence analysée une seule fois, pas à chaque phrase ;
# - décodeur rapide « meanflow » (2 étapes au lieu de 10) de Chatterbox Turbo (MIT) : 4,2 × le temps réel au lieu de 7,5,
#   même ressemblance (0,907 contre 0,918). VOIX_DECODEUR=normal pour revenir au décodeur d'origine.
import json, os, sys, time, torch, torchaudio
from pathlib import Path
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

torch.set_num_threads(os.cpu_count() or 2)
script, ref, out = sys.argv[1], sys.argv[2], Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
t0 = time.time()
m = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
if os.environ.get("VOIX_DECODEUR", "normal") == "rapide":
    from huggingface_hub import hf_hub_download
    from safetensors.torch import load_file
    from chatterbox.models.s3gen import S3Gen
    s3 = S3Gen(meanflow=True)
    s3.load_state_dict(load_file(hf_hub_download("ResembleAI/chatterbox-turbo", "s3gen_meanflow.safetensors")))
    m.s3gen = s3.eval()
m.prepare_conditionals(ref, exaggeration=0.5)
mesures = {"chargement_s": round(time.time() - t0, 1), "fils": torch.get_num_threads(),
           "decodeur": os.environ.get("VOIX_DECODEUR", "normal"), "phrases": []}
for i, p in enumerate(json.load(open(script))["phrases"]):
    texte = p.get("dit", p["texte"])
    t1 = time.time()
    torch.manual_seed(1234 + i)
    w = m.generate(texte, language_id="fr", exaggeration=0.5, cfg_weight=0.5, temperature=0.8)
    torchaudio.save(str(out / f"{i:02d}.wav"), w, m.sr)
    mesures["phrases"].append({"i": i, "duree_audio": round(w.shape[-1] / m.sr, 2), "temps_calcul": round(time.time() - t1, 1)})
    print(i, mesures["phrases"][-1], flush=True)
mesures["total_s"] = round(time.time() - t0, 1)
json.dump(mesures, open(out / "mesures.json", "w"), indent=1)
print("FIN", mesures["total_s"])
