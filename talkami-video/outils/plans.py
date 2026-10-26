"""Découpe les plans d'un épisode dans les captures d'écran, d'après plans.json.

Chaque plan avec capture devient un petit MP4 muet (30 i/s) :
  - instants source `de` → `a` étirés sur la durée du plan (de = a : image figée) ;
  - recadrage `cadre` [x, y, l, h] dans l'image source ramenée à 864 px de large
    (la barre d'état, le clavier et la barre du navigateur restent hors champ) ;
  - flous fixes `flous` [[x, y, l, h], …] (adresse e-mail, nom de compte…) ;
  - masques opaques `masques` [[x, y, l, h, [r, g, b]], …] (contenu à cacher entièrement) ;
  - flou qui suit le défilement `flou_sous` {t_ref, y_ref} : tout ce qui est
    sous une ligne repérée à l'instant t_ref (liste des formations et prix du
    bloc-notes), la ligne suivant le texte quand il défile.
Le son des captures n'est jamais repris.

Usage : python outils/plans.py plans.json dossier_sortie [nom_du_plan …]
"""
import json
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter

LARGEUR = 864
FPS = 30


def lire(source: str, debut: float, duree: float, hauteur: int):
    """Images successives (864 px de large) à 30 i/s à partir de `debut`."""
    p = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-ss", f"{debut:.3f}", "-t", f"{duree + 0.2:.3f}", "-i", source, "-an",
         "-vf", f"fps={FPS},scale={LARGEUR}:{hauteur}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE,
    )
    taille = LARGEUR * hauteur * 3
    while True:
        brut = p.stdout.read(taille)
        if len(brut) < taille:
            break
        yield np.frombuffer(brut, np.uint8).reshape(hauteur, LARGEUR, 3)
    p.wait()


def hauteur_source(source: str) -> int:
    l, h = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                           "-of", "csv=p=0", source], capture_output=True, text=True, check=True).stdout.strip().split(",")
    return round(int(h) * LARGEUR / int(l) / 2) * 2


def suivre_defilement(source: str, hauteur: int, debut: float, fin: float) -> tuple[np.ndarray, np.ndarray]:
    """Décalage vertical cumulé du contenu (px, positif = le texte monte) par image."""
    temps, cumul, precedent, total = [], [], None, 0.0
    for i, image in enumerate(lire(source, debut, fin - debut, hauteur)):
        profil = image[200:hauteur - 250].mean(axis=(1, 2))
        if precedent is not None:
            meilleur, ecart = 0, None
            for d in range(-5, 160):  # le texte monte de 0 à 160 px par image
                a = precedent[d:] if d >= 0 else precedent[:d]
                b = profil[: len(profil) - d] if d >= 0 else profil[-d:]
                e = np.mean(np.abs(a - b))
                if ecart is None or e < ecart:
                    meilleur, ecart = d, e
            total += meilleur
        precedent = profil
        temps.append(debut + i / FPS)
        cumul.append(total)
    return np.array(temps), np.array(cumul)


def flouter(image: np.ndarray, x: int, y: int, l: int, h: int) -> np.ndarray:
    x, y = max(0, x), max(0, y)
    l, h = min(l, image.shape[1] - x), min(h, image.shape[0] - y)
    if l <= 0 or h <= 0:
        return image
    zone = Image.fromarray(image[y:y + h, x:x + l]).filter(ImageFilter.GaussianBlur(14))
    image = image.copy()
    image[y:y + h, x:x + l] = np.asarray(zone)
    return image


def decouper(plan: dict, sources: dict, dossier: str, suivis: dict) -> None:
    source = sources[plan["source"]]
    hauteur = hauteur_source(source)
    x, y, l, h = plan["cadre"]
    n = max(1, round((plan["fin"] - plan["debut"]) * FPS))
    de, a = plan["de"], plan["a"]
    sortie = f"{dossier}/{plan['nom']}.mp4"
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{l}x{h}", "-r", str(FPS), "-i", "-",
         "-c:v", "libx264", "-crf", "15", "-preset", "medium", "-pix_fmt", "yuv420p", "-an", sortie],
        stdin=subprocess.PIPE,
    )
    images = lire(source, de, max(a - de, 0.05), hauteur)
    courante, indice = next(images), 0
    for k in range(n):
        t = de + (a - de) * (k / max(1, n - 1))
        voulu = round((t - de) * FPS)
        while indice < voulu:
            try:
                courante, indice = next(images), indice + 1
            except StopIteration:
                break
        image = courante
        for fx, fy, fl, fh in plan.get("flous", []):
            image = flouter(image, fx, fy, fl, fh)
        for mx, my, ml, mh, couleur in plan.get("masques", []):  # masque opaque (contenu à cacher entièrement)
            image = image.copy()
            image[max(0, my):my + mh, max(0, mx):mx + ml] = couleur
        if "flou_sous" in plan:
            temps, cumul = suivis[plan["source"]]
            ref = plan["flou_sous"]
            decalage = np.interp(t, temps, cumul) - np.interp(ref["t_ref"], temps, cumul)
            ligne = int(ref["y_ref"] - decalage)
            if ligne < hauteur:
                image = flouter(image, 0, ligne, LARGEUR, hauteur - ligne)
        enc.stdin.write(np.ascontiguousarray(image[y:y + h, x:x + l]).tobytes())
    enc.stdin.close()
    enc.wait()
    print(f"{plan['nom']:<14} {n:4d} images  {plan['source']} {de:.2f}→{a:.2f}  cadre {plan['cadre']}")


def main() -> None:
    config = json.load(open(sys.argv[1], encoding="utf-8"))
    dossier = sys.argv[2]
    choix = set(sys.argv[3:])
    sources = config["sources"]
    plans = [p for p in config["plans"] if "source" in p and (not choix or p["nom"] in choix)]
    suivis = {}
    for nom, plage in config.get("suivi_defilement", {}).items():
        if any(p["source"] == nom and "flou_sous" in p for p in plans):
            suivis[nom] = suivre_defilement(sources[nom], hauteur_source(sources[nom]), *plage)
            print(f"défilement suivi sur {nom} : {suivis[nom][1][-1]:.0f} px")
    for plan in plans:
        decouper(plan, sources, dossier, suivis)


main()
