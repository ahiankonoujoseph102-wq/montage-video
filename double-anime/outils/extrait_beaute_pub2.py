"""Publicité du centre de beauté (ancien enregistrement, Drive 1uXmanH6SpiTrfFAC0OMcZCEnignRABln).

Usage : python outils/extrait_beaute_pub2.py source.mp4 sortie.mp4

Passage 191,2–198 s (vidéo 1080 × 2400, image utile 1080 × 1776 à partir de y 222),
recadré en 9:16 (1000 × 1776), sorti en 720 × 1280 pour un cadre de téléphone.
Son coupé. L'enseigne du client (« Centre de Beauté Reda Paco », inscription de
la vitrine) est repérée image par image par reconnaissance de texte et floutée
avec une marge, l'emblème peint à gauche de l'enseigne avec elle ; la plaque
de la moto aussi. Quand la reconnaissance manque une image (flou de bougé), la
dernière zone connue est reprise, élargie. Chaque image floutée est relue : tant
qu'un morceau reste lisible, il est flouté à nouveau.
"""
import re
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter
from rapidocr_onnxruntime import RapidOCR

source, sortie = sys.argv[1], sys.argv[2]
DEBUT, FIN = 191.2, 198.0
X, Y, L, H = 40, 222, 1000, 1776
MOTIF = re.compile(r"centre|cent|beaut|reda|keda|paco|eaut|aco|eda|ntre", re.I)
PLAQUE = re.compile(r"\d{2,}")

brut = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{DEBUT}", "-to", f"{FIN}", "-i", source, "-an",
                       "-vf", f"fps=30,crop={L}:{H}:{X}:{Y}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                      capture_output=True, check=True).stdout
images = np.frombuffer(brut, np.uint8).reshape(-1, H, L, 3)
ocr = RapidOCR()


def flouter(img, boites, rayon=30):
    pil = Image.fromarray(img)
    for (x0, y0, x1, y1) in boites:
        x0, y0 = max(0, int(x0)), max(0, int(y0))
        x1, y1 = min(pil.width, int(x1)), min(pil.height, int(y1))
        if x1 - x0 < 4 or y1 - y0 < 4:
            continue
        zone = pil.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(rayon)).filter(ImageFilter.GaussianBlur(rayon))
        pil.paste(zone, (x0, y0))
    return np.asarray(pil)


def a_flouter(resultat, img_h):
    boites = []
    for box, txt, _ in (resultat or []):
        xs = [p[0] for p in box]
        ys = [p[1] for p in box]
        b = [min(xs) - 45, min(ys) - 45, max(xs) + 45, max(ys) + 45]
        if MOTIF.search(txt):
            boites.append(b)
        elif PLAQUE.search(txt) and min(ys) > img_h * 0.55:  # plaque d'immatriculation
            boites.append(b)
    return boites


p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{L}x{H}", "-r", "30", "-i", "-",
                      "-vf", "scale=720:1280:flags=lanczos", "-c:v", "libx264", "-crf", "15", "-preset", "slow",
                      "-pix_fmt", "yuv420p", "-an", sortie], stdin=subprocess.PIPE)
derniere, journal = None, []
for k, img in enumerate(images):
    out, _ = ocr(img)
    boites = a_flouter(out, H)
    # enseigne lumineuse : on réunit ses morceaux ; l'emblème peint est juste à gauche, à la même hauteur
    haut = [b for b in boites if b[1] < H * 0.4]
    if haut:
        x0 = min(b[0] for b in haut); y0 = min(b[1] for b in haut)
        x1 = max(b[2] for b in haut); y1 = max(b[3] for b in haut)
        boites.append([x0 - 1.15 * (y1 - y0) - 40, y0 - 30, x0 + 10, y1 + 30])
        boites.append([x0, y0, x1, y1])
    if boites:
        derniere = (k, [list(b) for b in boites])  # seulement les zones vraiment détectées
    elif derniere and k - derniere[0] <= 6:
        boites = [[b[0] - 30, b[1] - 30, b[2] + 30, b[3] + 30] for b in derniere[1]]
    floue = flouter(img, boites)
    for _ in range(3):
        reste, _ = ocr(floue)
        encore = a_flouter(reste, H)
        if not encore:
            break
        boites += encore
        floue = flouter(floue, encore)
    journal.append(len(boites))
    p.stdin.write(np.ascontiguousarray(floue).tobytes())
p.stdin.close()
p.wait()
print("zones floutées par image :", journal)
