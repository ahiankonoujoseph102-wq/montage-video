"""Planche de contrôle : une image toutes les `pas` secondes d'un rush, avec le temps écrit dessus.

Usage : python3 planche.py <video> <debut> <fin> <pas> <sortie.jpg> [largeur_vignette]"""
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

video, a, b, pas, sortie = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
lv = int(sys.argv[6]) if len(sys.argv) > 6 else 150
with tempfile.TemporaryDirectory() as d:
    ts = []
    t = a
    while t <= b:
        f = Path(d) / f"{len(ts):04d}.png"
        subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", video, "-frames:v", "1", "-vf", f"scale={lv}:-2", str(f)], check=True)
        ts.append((t, f))
        t += pas
    ims = [(t, Image.open(f).convert("RGB")) for t, f in ts if f.exists()]
    w, h = ims[0][1].size
    cols = min(16, len(ims))
    c = Image.new("RGB", (w * cols, (h + 14) * ((len(ims) + cols - 1) // cols)), "white")
    dr = ImageDraw.Draw(c)
    for i, (t, im) in enumerate(ims):
        x, y = (i % cols) * w, (i // cols) * (h + 14)
        c.paste(im, (x, y + 14))
        dr.text((x + 3, y + 1), f"{t:.1f}", fill="red")
    c.save(sortie, quality=82)
