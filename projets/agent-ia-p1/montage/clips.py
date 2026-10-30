"""Extraits d'écran utilisés par les deux vidéos : recadrés (sans barre d'état), floutés là où il y a des informations
personnelles (lues par reconnaissance de texte), et zone à agrandir choisie là où il y a le plus de texte.

Usage : python3 clips.py → serie-animee/public/formation/clips/*.mp4 et clips.json"""
import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from textes import PROJET  # noqa: E402

SERIE = Path("/home/user/montage-videos/serie-animee")
OUT = SERIE / "public" / "formation" / "clips"
OUT.mkdir(parents=True, exist_ok=True)
TMP = Path(__file__).resolve().parent / "sorties" / "ocr"
TMP.mkdir(parents=True, exist_ok=True)
HAUT, H = 140, 2180  # recadrage : on retire la barre d'état (heure, chronomètre de l'enregistreur)
ZONE = 760
# Informations personnelles : adresses e-mail, numéros de téléphone, clés, noms de compte (le « @ » seul est souvent une
# icône mal lue : il n'est pas retenu sans adresse autour).
SENSIBLE = re.compile(r"[\w.+-]+@[\w-]+\.[a-z]{2,}|@gmail|gmail|xsmtp|smtp|sk-\w|api[_ ]?key|mot de passe|password|\+ ?2\d{2}\b|\b\d{2}[ .]?\d{2}[ .]?\d{2}[ .]?\d{2}\b|"
                      r"\d{8,}|ahiankonou ?joseph|ahiankonouj|amitalk|sandu|academyjoseph|token|jeton", re.I)


def besoins() -> dict:
    out = {}
    for v in ("1A", "1B"):
        m = json.loads((SERIE / "public" / "formation" / v / "montage.json").read_text())
        for p in m["plans"]:
            vis = p["visuel"]
            if vis["mode"] == "ecran":
                out[(vis["rush"], vis["vs"], vis["ve"])] = 1
            elif vis["mode"] == "live":
                out[(p["rush"], p["plage"][0], p["plage"][1])] = 1
            elif vis["mode"] == "muet":
                for a, b, _ in vis["morceaux"]:
                    out[(vis["rush"], a, b)] = 1
    return out


def nom(rush, a, b) -> str:
    return f"{Path(rush).stem}_{a:.1f}_{b:.1f}"


def ocr(png: Path) -> list[dict]:
    cache = png.with_suffix(".json")
    if cache.exists():
        return json.loads(cache.read_text())
    res = _ocr(png)
    cache.write_text(json.dumps(res, ensure_ascii=False))
    return res


def _ocr(png: Path) -> list[dict]:
    tsv = subprocess.run(["tesseract", str(png), "-", "-l", "fra", "--psm", "11", "tsv"], capture_output=True, text=True,
                         env={"OMP_THREAD_LIMIT": "1", "PATH": "/usr/bin:/bin"}).stdout
    lignes = {}
    for l in tsv.splitlines()[1:]:
        c = l.split("\t")
        if len(c) < 12 or not c[11].strip() or float(c[10]) < 30:
            continue
        cle = (c[2], c[3], c[4])
        x, y, w, h = map(int, c[6:10])
        g = lignes.setdefault(cle, {"texte": [], "x0": x, "y0": y, "x1": x + w, "y1": y + h})
        g["texte"].append(c[11])
        g["x0"], g["y0"], g["x1"], g["y1"] = min(g["x0"], x), min(g["y0"], y), max(g["x1"], x + w), max(g["y1"], y + h)
    return [{"texte": " ".join(g["texte"]), **{k: g[k] for k in ("x0", "y0", "x1", "y1")}} for g in lignes.values()]


def traiter(cle):
    rush, a, b = cle
    n = nom(rush, a, b)
    debut = max(0, a - 0.3)
    mp4 = OUT / f"{n}.mp4"
    if not mp4.exists():
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(debut), "-to", str(b + 0.3), "-i", str(PROJET / rush),
                        "-vf", f"crop=1080:{H}:0:{HAUT},fps=30", "-an", "-c:v", "libx264", "-crf", "21", "-preset", "veryfast",
                        "-pix_fmt", "yuv420p", str(mp4)], check=True)
    dossier = TMP / n
    if not dossier.exists():
        dossier.mkdir()
        subprocess.run(["ffmpeg", "-v", "error", "-i", str(mp4), "-vf", "fps=2", str(dossier / "%04d.png")], check=True)
    flous, centres = [], []
    for png in sorted(dossier.glob("*.png")):
        t = (int(png.stem) - 1) / 2
        for l in ocr(png):
            centres.append((l["y0"] + l["y1"]) / 2)
            if SENSIBLE.search(l["texte"]):
                flous.append({"t0": max(0, t - 0.6), "t1": t + 0.6, "x": max(0, l["x0"] - 14), "y": max(0, l["y0"] - 10),
                              "l": min(1080, l["x1"] + 14) - max(0, l["x0"] - 14), "h": l["y1"] - l["y0"] + 20, "texte": l["texte"]})
    # zone à agrandir : bande de ZONE px qui contient le plus de lignes de texte
    meilleur, zone = -1, (H - ZONE) // 2
    for y in range(0, H - ZONE + 1, 20):
        c = sum(1 for k in centres if y <= k < y + ZONE)
        if c > meilleur:
            meilleur, zone = c, y
    return n, {"debut": round(debut, 3), "rush": rush, "zone": zone, "flous": flous}


if __name__ == "__main__":
    cles = list(besoins())
    with ThreadPoolExecutor(4) as ex:
        res = dict(ex.map(traiter, cles))
    (OUT / "clips.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
    for n, r in res.items():
        print(n, "zone", r["zone"], "flous", len(r["flous"]), sorted({f["texte"][:40] for f in r["flous"]})[:6])
