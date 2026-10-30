"""Extraits vidéo des étapes de démonstration (version 2) : morceaux du rush à vitesse 1 ou ralentis, recadrés
(sans la barre d'état du téléphone), puis dernière image figée jusqu'à la durée de l'étape. Jamais accélérés.

Usage : python3 clips2.py 2A|2B  → serie-animee/public/formation/etapes/<fichier>.mp4"""
import json
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

PROJET = Path(__file__).resolve().parent.parent
SERIE = Path("/home/user/montage-videos/serie-animee")
OUT = SERIE / "public" / "formation" / "etapes"
OUT.mkdir(parents=True, exist_ok=True)


def extrait(v: dict):
    sortie = OUT / f"{v['fichier']}.mp4"
    if sortie.exists():
        return
    haut, h, w = v["haut"], v["hclip"], v["wclip"]
    parts, filtres = [], []
    for k, (a, b, vit) in enumerate(v["morceaux"]):
        filtres.append(f"[0:v]trim={a}:{b},setpts=(PTS-STARTPTS)/{vit},fps=30,crop={w}:{h}:0:{haut}[p{k}]")
        parts.append(f"[p{k}]")
    filtres.append(f"{''.join(parts)}concat=n={len(parts)}:v=1:a=0,tpad=stop_mode=clone:stop_duration={v['duree'] + 1},"
                   f"trim=0:{v['duree'] + 0.2},setpts=PTS-STARTPTS[v]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(PROJET / v["rush"]), "-filter_complex", ";".join(filtres), "-map", "[v]",
                    "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-pix_fmt", "yuv420p", str(sortie)], check=True)


if __name__ == "__main__":
    d = json.loads((SERIE / "public" / "formation" / sys.argv[1] / "montage.json").read_text())
    vs = [p["visuel"] for p in d["plans"] if p["visuel"]["mode"] == "etape"]
    with ThreadPoolExecutor(3) as ex:
        list(ex.map(extrait, vs))
    print(len(vs), "extraits")
