"""Repère les touchers dans un enregistrement d'écran (option Android « Afficher les appuis » : rond gris ≈ 50 px).

Usage : python3 touchers.py <rush> [debut fin]  → sorties/touchers/<rush>.json  [[t, x, y], …] (coordonnées source)
Un toucher = rond gris uni (≈ 120, 124, 130), presque rond et plein. On garde le premier instant de chaque appui.
"""
import json
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

ICI = Path(__file__).resolve().parent
PROJET = ICI.parent
ECH = 0.4  # analyse en basse résolution, sur toutes les images (un appui ne dure souvent qu'une image)


def images(rush: Path, a, b) -> list[float]:
    """Instant de chaque image (enregistrement à cadence variable)."""
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "frame=pts_time", "-of", "csv=p=0", str(rush)],
                         capture_output=True, text=True).stdout.split()
    ts = [float(x.strip(",")) for x in out if x.strip(",")]
    return [x for x in ts if a is None or a - 0.001 <= x < b]


def touchers(rush: Path, a: float | None = None, b: float | None = None) -> list[list[float]]:
    w, h = map(int, subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height", "-of", "csv=p=0",
                                    str(rush)], capture_output=True, text=True).stdout.split(",")[:2])
    lw, lh = int(w * ECH), int(h * ECH)
    choix = f"select='between(t,{a - 0.001},{b})'," if a is not None else ""
    cmd = ["ffmpeg", "-v", "fatal", "-i", str(rush), "-vf", f"{choix}scale={lw}:{lh}", "-fps_mode", "passthrough",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    temps = images(rush, a, b)
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    taille = lw * lh * 3
    out, k, prec = [], 0, None
    r = 19 * ECH
    aire_min, aire_max = 0.55 * np.pi * r * r, 1.6 * np.pi * r * r
    while True:
        buf = p.stdout.read(taille)
        if len(buf) < taille:
            break
        im = np.frombuffer(buf, np.uint8).reshape(lh, lw, 3).astype(np.int16)
        ref = np.array([120, 124, 130])
        masque = (np.abs(im - ref).max(axis=2) <= 9).astype(np.uint8)
        n, lab, stats, cent = cv2.connectedComponentsWithStats(masque, 8)
        trouve = None
        for i in range(1, n):
            x, y, bw, bh, aire = stats[i]
            if aire_min <= aire <= aire_max and 0.75 <= bw / max(bh, 1) <= 1.33 and aire / (bw * bh) > 0.62 and bw >= 1.3 * r and bw <= 3.0 * r:
                trouve = (cent[i][0] / ECH, cent[i][1] / ECH)
                break
        t = temps[k] if k < len(temps) else (temps[-1] if temps else 0)
        if trouve and (prec is None or t - prec[0] > 0.35 or np.hypot(trouve[0] - prec[1], trouve[1] - prec[2]) > 60):
            out.append([round(t, 2), round(trouve[0]), round(trouve[1])])
        if trouve:
            prec = (t, *trouve)
        k += 1
    p.wait()
    return out


if __name__ == "__main__":
    rush = Path(sys.argv[1])
    a, b = (float(sys.argv[2]), float(sys.argv[3])) if len(sys.argv) > 3 else (None, None)
    res = touchers(rush, a, b)
    dossier = ICI / "sorties" / "touchers"
    dossier.mkdir(parents=True, exist_ok=True)
    (dossier / f"{rush.stem}.json").write_text(json.dumps(res))
    for t, x, y in res:
        print(f"{t:7.2f}  x {x:4d}  y {y:4d}")
