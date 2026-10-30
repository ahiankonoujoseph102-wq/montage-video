"""Bouche de Coach Joseph : énergie de la voix par image (mouvements de tête) et formes de bouche (X, A…H) tirées des
mots horodatés (méthode validée par Joseph pour le test, sans Rhubarb). Usage : python3 bouche.py 1A|1B"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

SERIE = Path("/home/user/montage-videos/serie-animee")
FPS, SR = 30, 48000
UNITES = [("eau", "E"), ("ou", "F"), ("oi", "F"), ("au", "E"), ("on", "E"), ("om", "E"), ("an", "C"), ("am", "C"), ("en", "C"), ("em", "C"),
          ("ain", "B"), ("in", "B"), ("ai", "C"), ("ei", "C"), ("ch", "B"), ("ph", "G"), ("qu", "B"), ("gn", "B"),
          ("a", "D"), ("à", "D"), ("â", "D"), ("e", "C"), ("é", "C"), ("è", "C"), ("ê", "C"), ("i", "B"), ("î", "B"), ("y", "B"),
          ("o", "E"), ("ô", "E"), ("u", "F"), ("û", "F"), ("m", "A"), ("b", "A"), ("p", "A"), ("f", "G"), ("v", "G"), ("l", "H")]
VOY = set("DCEF")


def phonemes(mot: str) -> list[str]:
    m = re.sub(r"[^a-zàâçéèêëîïôûùüÿœ]", "", mot.lower()).replace("œ", "e")
    if len(m) > 2:
        m = re.sub(r"(es|e|s|t|x|z|d)$", "", m)
    out, i = [], 0
    while i < len(m):
        for u, v in UNITES:
            if m.startswith(u, i):
                out.append(v)
                i += len(u)
                break
        else:
            out.append("B")
            i += 1
    return out or ["B"]


def main(nom: str):
    dossier = SERIE / "public" / "formation" / nom
    data = json.loads((dossier / "montage.json").read_text())
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(dossier / "voix.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, np.float32)
    pas = SR // FPS
    n = len(x) // pas + 1
    db = np.array([20 * np.log10(np.sqrt(np.mean(x[max(0, i * pas - pas // 2): i * pas + pas] ** 2)) + 1e-9) for i in range(n)])
    bas, haut = np.percentile(db, 30), np.percentile(db, 97)
    brut = np.clip((db - bas) / (haut - bas), 0, 1) ** 0.85
    lisse = np.zeros(n)
    for i in range(1, n):
        lisse[i] = lisse[i - 1] + (brut[i] - lisse[i - 1]) * (0.75 if brut[i] > lisse[i - 1] else 0.5)
    lisse[lisse < 0.07] = 0
    energie = np.concatenate([lisse[1:], [0.0]])
    lettres = ["X"] * n
    for w in data["mots"]:
        ph = phonemes(w["texte"])
        poids = [1.0 if p in VOY else 0.6 for p in ph]
        tot, t = sum(poids), w["debut"]
        for p, q in zip(ph, poids):
            d = (w["fin"] - w["debut"]) * q / tot
            i0 = round(t * FPS)
            for i in range(max(0, i0), min(n, max(i0 + 1, round((t + d) * FPS)))):
                lettres[i] = p
            t += d
    lettres = lettres[1:] + ["X"]
    for i in range(n):
        if max(energie[max(0, i - 1): i + 2]) < 0.03 and lettres[i] not in "XA":
            lettres[i] = "X"
        elif energie[i] > 0.6 and lettres[i] == "B":
            lettres[i] = "C"
    (dossier / "bouche.json").write_text(json.dumps([round(float(v), 3) for v in energie]))
    (dossier / "visemes.json").write_text(json.dumps("".join(lettres)))
    print(nom, n, "images")


if __name__ == "__main__":
    main(sys.argv[1])
