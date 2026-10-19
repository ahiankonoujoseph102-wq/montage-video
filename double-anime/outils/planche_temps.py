"""Planche de repérage : vignettes d'une vidéo avec leur instant (mm:ss).

Usage : python outils/planche_temps.py dossier_vignettes pas_s debut_s colonnes sortie.png [premier dernier]
Les vignettes s%03d.png sont supposées extraites tous les `pas_s` à partir de `debut_s`.
"""
import glob
import sys

from PIL import Image, ImageDraw, ImageFont

dossier, pas, debut, colonnes, sortie = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
fichiers = sorted(glob.glob(f"{dossier}/s*.png"))
if len(sys.argv) > 7:
    fichiers = fichiers[int(sys.argv[6]): int(sys.argv[7])]
police = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
w, h = Image.open(fichiers[0]).size
lignes = (len(fichiers) + colonnes - 1) // colonnes
planche = Image.new("RGB", (colonnes * (w + 2), lignes * (h + 22)), (0, 0, 0))
d = ImageDraw.Draw(planche)
for i, f in enumerate(fichiers):
    n = int(f.rsplit("s", 1)[-1].split(".")[0])
    t = debut + n * pas
    x, y = (i % colonnes) * (w + 2), (i // colonnes) * (h + 22)
    planche.paste(Image.open(f), (x, y + 22))
    d.text((x + 3, y + 1), f"{int(t // 60)}:{t % 60:04.1f}", font=police, fill=(255, 220, 80))
planche.save(sortie)
