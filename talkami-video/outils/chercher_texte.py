"""Cherche des textes dans une vidéo par reconnaissance de caractères (RapidOCR).

Usage : python outils/chercher_texte.py video.mp4 pas_s sortie.json [debut fin]
Écrit, pour chaque image analysée, les lignes lues et leur position (y en
pixels d'une image ramenée à 864 px de large).
"""
import json
import subprocess
import sys

import numpy as np
from rapidocr_onnxruntime import RapidOCR

video, pas, sortie = sys.argv[1], float(sys.argv[2]), sys.argv[3]
debut = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
fin = float(sys.argv[5]) if len(sys.argv) > 5 else float(subprocess.run(
    ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], capture_output=True, text=True).stdout)
l, h = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", video],
                               capture_output=True, text=True).stdout.split()[0].split(",")[:2])
H = round(h * 864 / l)
ocr = RapidOCR()
p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", str(debut), "-to", str(fin), "-i", video, "-vf", f"fps={1 / pas},scale=864:{H}",
                      "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
res = []
k = 0
while True:
    brut = p.stdout.read(864 * H * 3)
    if len(brut) < 864 * H * 3:
        break
    img = np.frombuffer(brut, np.uint8).reshape(H, 864, 3)
    out, _ = ocr(img)
    res.append({"t": round(debut + k * pas, 2), "lignes": [[int(b[0][1]), int(b[2][1]), t] for b, t, _ in (out or [])]})
    k += 1
    if k % 50 == 0:
        print(k, flush=True)
json.dump(res, open(sortie, "w", encoding="utf-8"), ensure_ascii=False)
print("fini", k)
