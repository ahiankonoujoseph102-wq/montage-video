"""Médias de la pub Zéro Perte, créés sur GitHub (clés du dépôt) : voix off Gemini, images IA (Cloudflare), vidéos
libres de droits (Pixabay).

Usage : python3 projets/zero-perte/generer_medias.py <dossier de sortie>
Entrée : projets/zero-perte/medias.json, projets/zero-perte/script_voix.json. Sortie : voix_<nom>.wav, images/<nom>.jpg,
videos/<nom>.mp4, sources.json (source et licence de chaque fichier).
"""
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
import medias  # noqa: E402

P = ROOT / "projets" / "zero-perte"
out = Path(sys.argv[1])
(out / "images").mkdir(parents=True, exist_ok=True)
(out / "videos").mkdir(parents=True, exist_ok=True)
m = json.loads((P / "medias.json").read_text())
sources = {}

CONSIGNE = "Lis sur un ton de publicité radio, enthousiaste, chaleureux et souriant :\n\n"
for voix in m["voix"]:
    dest = out / f"voix_{voix}.wav"
    env = {**os.environ, "VOIX_GEMINI": voix, "CONSIGNE_VOIX": CONSIGNE}
    r = subprocess.run([sys.executable, str(ROOT / "scripts" / "voix_gemini.py"), str(P / "script_voix.json"), str(dest)],
                       env=env)
    sources[dest.name] = {"source": f"Voix Gemini ({voix})", "ok": r.returncode == 0}

SEUL = m.get("seulement")
for im in (m["images"] if SEUL != "voix" else []):
    dest = out / "images" / f"{im['nom']}.jpg"
    try:
        s = medias.image_ia(im["prompt"], dest)
    except Exception as e:  # noqa: BLE001
        s = None
        print("image", im["nom"], e)
    print("image", im["nom"], "ok" if s else "ÉCHEC", flush=True)
    sources[f"images/{dest.name}"] = s

cle = os.environ.get("PIXABAY_API_KEY", "").strip()
for v in (m["videos"] if SEUL != "voix" else []):
    dest = out / "videos" / f"{v['nom']}.mp4"
    s = None
    if cle:
        try:
            s = medias.pixabay_video(v["recherche"], cle, dest)
        except Exception as e:  # noqa: BLE001
            print("vidéo", v["nom"], e)
    print("vidéo", v["nom"], "ok" if s else "ÉCHEC", flush=True)
    sources[f"videos/{dest.name}"] = s

(out / "sources.json").write_text(json.dumps(sources, ensure_ascii=False, indent=1))
