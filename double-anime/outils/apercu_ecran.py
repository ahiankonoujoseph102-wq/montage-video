"""Aperçus du cadrage de l'enregistrement d'écran, à la taille réelle de l'écran (860 x 600).

Usage : python outils/apercu_ecran.py ecran.json dossier_extraits sortie.png t1 t2 …  (temps de voix)
"""
import json
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

config, dossier, sortie, *temps = sys.argv[1:]
c = json.load(open(config, encoding="utf-8"))
L, H = 860, 600
echelle = L / c["largeur"]
police = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 26)
vignettes = []
for t in map(float, temps):
    clip = next(k for k in c["clips"] if k["segments"][0][0] <= t < k["segments"][-1][1])
    cad = np.array(clip["cadrage"])
    y = float(np.interp(t, cad[:, 0], cad[:, 1]))
    zoom = float(np.interp(t, cad[:, 0], cad[:, 2])) if cad.shape[1] > 2 else 1.0
    local = t - clip["segments"][0][0]
    brut = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{local:.3f}", "-i", f"{dossier}/ecran-{clip['nom']}.mp4",
                           "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True, check=True).stdout
    from io import BytesIO
    im = Image.open(BytesIO(brut)).convert("RGB")
    im = im.crop((0, int(y), int(c["largeur"] / zoom), int(y + H / echelle / zoom))).resize((L, H))
    d = ImageDraw.Draw(im)
    d.text((8, 8), f"{t:.2f}", font=police, fill=(255, 220, 80))
    vignettes.append(im)
cols = 4
planche = Image.new("RGB", (cols * (L + 6), ((len(vignettes) + cols - 1) // cols) * (H + 6)))
for i, v in enumerate(vignettes):
    planche.paste(v, ((i % cols) * (L + 6), (i // cols) * (H + 6)))
planche.save(sortie)
