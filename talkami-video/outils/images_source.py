"""Extrait des images d'une vidéo à des instants donnés et les assemble (repérage des plans).

Usage : python outils/images_source.py video.mp4 sortie.png largeur t1 t2 …   (t en secondes ou m:ss.s)
"""
import subprocess
import sys
from io import BytesIO

from PIL import Image, ImageDraw, ImageFont

video, sortie, largeur, *temps = sys.argv[1:]
largeur = int(largeur)
police = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)


def secondes(t: str) -> float:
    if ":" in t:
        m, s = t.split(":")
        return int(m) * 60 + float(s)
    return float(t)


images = []
for t in temps:
    brut = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(secondes(t)), "-i", video, "-frames:v", "1", "-vf", f"scale={largeur}:-1",
                           "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True, check=True).stdout
    im = Image.open(BytesIO(brut)).convert("RGB")
    ImageDraw.Draw(im).text((6, 30), t, font=police, fill=(255, 60, 60))
    images.append(im)
w, h = images[0].size
planche = Image.new("RGB", (len(images) * (w + 4), h))
for i, im in enumerate(images):
    planche.paste(im, (i * (w + 4), 0))
planche.save(sortie)
