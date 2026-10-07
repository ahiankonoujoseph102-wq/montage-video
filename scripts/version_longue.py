"""Version longue : la vidéo montée sans son carton de fin, puis une autre vidéo reprise telle quelle,
avec une transition courte. Les deux parties sont ramenées au même volume (−14 LUFS).

Usage : python3 scripts/version_longue.py <projet> <fichier à la suite> [largeur] [hauteur]
Entrées : out/<projet>.mp4 (rendu complet), public/<projet>/props.json, projets/<projet>/<fichier à la suite>
Sortie : out/<projet>-longue.mp4 (≤ 30 Mo)
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
TRANSITION = 0.4  # s : fondu enchaîné image et son entre les deux parties
LUFS = -14.0
TAILLE_MAX = 27.5e6  # octets : marge sous la limite de 30 Mo (le débit réel dépasse un peu la cible)


def duree(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)],
                                capture_output=True, text=True, check=True).stdout)


def main():
    nom, suite = sys.argv[1], ROOT / "projets" / sys.argv[1] / sys.argv[2]
    largeur, hauteur = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (720, 1280)
    props = json.loads((ROOT / "public" / nom / "props.json").read_text())
    courte = ROOT / "out" / f"{nom}.mp4"
    sortie = ROOT / "out" / f"{nom}-longue.mp4"
    # Fin de la première partie : juste avant l'ouverture du carton de fin.
    fin1 = (props["carton"]["debut"] if props.get("carton") else props["dureeImages"]) / FPS
    d2 = duree(suite)
    total = fin1 + d2 - TRANSITION
    norme = f"scale={largeur}:{hauteur}:flags=lanczos,fps={FPS},setsar=1,format=yuv420p"
    filtres = (
        f"[0:v]trim=0:{fin1},setpts=PTS-STARTPTS,{norme}[v0];"
        f"[1:v]setpts=PTS-STARTPTS,{norme}[v1];"
        f"[v0][v1]xfade=transition=fade:duration={TRANSITION}:offset={fin1 - TRANSITION}[v];"
        f"[0:a]atrim=0:{fin1},asetpts=PTS-STARTPTS,aresample=48000,loudnorm=I={LUFS}:TP=-2:LRA=11[a0];"
        f"[1:a]asetpts=PTS-STARTPTS,aresample=48000,loudnorm=I={LUFS}:TP=-2:LRA=11[a1];"
        f"[a0][a1]acrossfade=d={TRANSITION}:c1=tri:c2=tri,alimiter=limit=0.79:level=disabled,aresample=48000[a]"
    )
    debit_audio = 128_000
    debit_video = int((TAILLE_MAX * 8 / total - debit_audio) / 1000)
    commun = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(courte), "-i", str(suite), "-filter_complex", filtres,
              "-map", "[v]", "-c:v", "libx264", "-preset", "slow", "-b:v", f"{debit_video}k"]
    subprocess.run(commun + ["-map", "[a]", "-c:a", "aac", "-pass", "1", "-passlogfile", str(ROOT / "out" / "p_longue"),
                             "-f", "mp4", "/dev/null"], check=True)
    subprocess.run(commun + ["-map", "[a]", "-pass", "2", "-passlogfile", str(ROOT / "out" / "p_longue"),
                             "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(sortie)], check=True)
    print(f"{sortie} : {duree(sortie):.1f} s, {sortie.stat().st_size / 1e6:.1f} Mo "
          f"(raccord à {fin1 - TRANSITION:.2f} s, vidéo {debit_video} kbit/s)")


if __name__ == "__main__":
    main()
