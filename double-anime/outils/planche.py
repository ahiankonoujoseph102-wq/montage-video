"""Planche de contrôle : images réduites côte à côte, avec leur instant.

Usage : python outils/planche.py sortie.png colonnes largeur image1.png [image2.png …]
"""
import sys

from PIL import Image, ImageDraw, ImageFont

sortie, colonnes, largeur = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
images = sys.argv[4:]
police = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
hauteur = largeur * 16 // 9
lignes = (len(images) + colonnes - 1) // colonnes
planche = Image.new("RGB", (colonnes * (largeur + 8), lignes * (hauteur + 44)), (0, 0, 0))
d = ImageDraw.Draw(planche)
for i, chemin in enumerate(images):
    x, y = (i % colonnes) * (largeur + 8), (i // colonnes) * (hauteur + 44)
    planche.paste(Image.open(chemin).convert("RGB").resize((largeur, hauteur)), (x, y + 40))
    etiquette = chemin.rsplit("/", 1)[-1].rsplit(".", 1)[0]
    d.text((x + 6, y + 4), etiquette, font=police, fill=(255, 220, 80))
planche.save(sortie)
