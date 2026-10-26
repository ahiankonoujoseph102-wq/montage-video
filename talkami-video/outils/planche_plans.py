"""Planche de contrôle des plans découpés : première et dernière image de chaque plan.

Usage : python outils/planche_plans.py plans.json dossier_plans sortie.png [premier dernier]
"""
import json
import subprocess
import sys
from io import BytesIO

from PIL import Image, ImageDraw, ImageFont

config, dossier, sortie = sys.argv[1:4]
plans = [p for p in json.load(open(config, encoding="utf-8"))["plans"] if "source" in p]
if len(sys.argv) > 5:
    plans = plans[int(sys.argv[4]): int(sys.argv[5])]
police = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
L, H = 200, 300
vignettes = []
for p in plans:
    for quand in ("debut", "fin"):
        args = ["-sseof", "-0.05"] if quand == "fin" else []
        brut = subprocess.run(["ffmpeg", "-v", "error", *args, "-i", f"{dossier}/{p['nom']}.mp4", "-frames:v", "1",
                               "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True).stdout
        im = Image.open(BytesIO(brut)).convert("RGB")
        im.thumbnail((L, H))
        case = Image.new("RGB", (L, H + 20), (30, 30, 30))
        case.paste(im, (0, 20))
        ImageDraw.Draw(case).text((3, 2), f"{p['nom']} {p['mode'][:5]} {quand[0]}", font=police, fill=(255, 220, 80))
        vignettes.append(case)
colonnes = 12
planche = Image.new("RGB", (colonnes * (L + 3), ((len(vignettes) + colonnes - 1) // colonnes) * (H + 23)))
for i, v in enumerate(vignettes):
    planche.paste(v, ((i % colonnes) * (L + 3), (i // colonnes) * (H + 23)))
planche.save(sortie)
