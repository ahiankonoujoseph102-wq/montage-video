"""Fabrique les extraits d'enregistrements d'écran d'un projet (coupes, accélérations, floutages, sans son).

Usage : python3 scripts/extraits.py <projet> <dossier des sources> [nom d'extrait…]
Lit projets/<projet>/extraits.json ; écrit public/<projet>/extraits/<nom>.mp4 (1080 × 2400, 30 i/s, muet)
et public/<projet>/extraits.json (durées, passages accélérés et zooms en images, pour Remotion).
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
BARRE_ETAT = 120  # hauteur masquée en noir en haut (heure, compteur de l'enregistreur, réseau)

projet, sources = sys.argv[1], Path(sys.argv[2])
choix = set(sys.argv[3:])
cfg = json.loads((ROOT / "projets" / projet / "extraits.json").read_text())
sortie = ROOT / "public" / projet / "extraits"
sortie.mkdir(parents=True, exist_ok=True)
meta_chemin = ROOT / "public" / projet / "extraits.json"
meta = json.loads(meta_chemin.read_text()) if meta_chemin.exists() else {}


def vers_sortie(t, morceaux):
    """Seconde de la source → seconde de l'extrait (None si le moment est coupé)."""
    acc = 0.0
    for a, b, v in morceaux:
        if a <= t <= b:
            return acc + (t - a) / v
        acc += (b - a) / v
    return None


for nom, e in cfg.items():
    if nom.startswith("_") or (choix and nom not in choix):
        continue
    morceaux = e["morceaux"]
    debut = max(0, morceaux[0][0] - 2)
    flous = e["flous"]
    # Floutages sur la source (temps de la source), puis un morceau par vitesse, puis assemblage.
    f = [f"[0:v]setpts=PTS-STARTPTS+{debut}/TB,drawbox=0:0:1080:{BARRE_ETAT}:black:fill,split={len(flous) + 1}[base]" + "".join(f"[c{i}]" for i in range(len(flous)))]
    courant = "base"
    for i, (a, b, x, y, l, h) in enumerate(flous):
        f.append(f"[c{i}]crop={l}:{h}:{x}:{y},boxblur=28:4[f{i}]")
        f.append(f"[{courant}][f{i}]overlay={x}:{y}:enable='between(t,{a},{b})'[o{i}]")
        courant = f"o{i}"
    f.append(f"[{courant}]split={len(morceaux)}" + "".join(f"[s{i}]" for i in range(len(morceaux))))
    for i, (a, b, v) in enumerate(morceaux):
        f.append(f"[s{i}]trim={a}:{b},setpts=(PTS-STARTPTS)/{v},fps={FPS}[m{i}]")
    f.append("".join(f"[m{i}]" for i in range(len(morceaux))) + f"concat=n={len(morceaux)}:v=1:a=0,format=yuv420p[v]")
    # nom propre au contenu : un extrait modifié change de nom (Remotion garde en cache les vidéos déjà lues)
    empreinte = hashlib.sha1(json.dumps([e["source"], morceaux, flous]).encode()).hexdigest()[:8]
    fichier = sortie / f"{nom}_{empreinte}.mp4"
    if not fichier.exists():
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(debut), "-i", str(sources / f"{e['source']}.mp4"),
                        "-filter_complex", ";".join(f), "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "veryfast",
                        "-crf", "18", "-movflags", "+faststart", str(fichier)], check=True)
    duree = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                  str(fichier)], capture_output=True, text=True).stdout)
    acc, acceleres = 0.0, []
    for a, b, v in morceaux:
        d = (b - a) / v
        if v > 1:
            acceleres.append({"debut": round(acc * FPS), "fin": round((acc + d) * FPS), "facteur": v})
        acc += d
    zooms = []
    for t, z, x, y in e["zooms"]:
        s = vers_sortie(t, morceaux)
        if s is not None:
            zooms.append({"image": round(s * FPS), "zoom": z, "x": x, "y": y})
    reperes = []
    for t, x, y, forme, d, *reste in e.get("reperes", []):  # reste : angle de la flèche (ou null), étiquette
        s = vers_sortie(t, morceaux)
        if s is None:
            raise SystemExit(f"{nom} : repère à {t} s hors des morceaux")
        angle = reste[0] if reste else None
        texte = reste[1] if len(reste) > 1 else None
        reperes.append({"image": round(s * FPS), "fin": round((s + d) * FPS), "x": x, "y": y, "forme": forme,
                        **({"angle": angle} if angle is not None else {}), **({"texte": texte} if texte else {})})
    meta[nom] = {"video": f"{projet}/extraits/{fichier.name}", "reperes": reperes, "dureeImages": int(duree * FPS), "acceleres": acceleres,
                 "zooms": zooms, "section": e["section"], "source": e["source"], "morceaux": morceaux}
    print(f"{nom} : {duree:.1f} s")
meta_chemin.write_text(json.dumps(meta, ensure_ascii=False, indent=1))
