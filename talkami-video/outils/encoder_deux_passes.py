"""Encodage final H.264 en deux passes sous une taille maximale.

Le son (déjà normalisé par finaliser.py) est copié tel quel ; le débit vidéo
est calculé pour viser `cible` octets (marge de 5 % sous la limite).

Usage : python outils/encoder_deux_passes.py entree.mp4 sortie.mp4 [limite_Mo=30]
"""
import os
import subprocess
import sys
import tempfile

entree, sortie = sys.argv[1], sys.argv[2]
limite = float(sys.argv[3]) if len(sys.argv) > 3 else 30.0
cible = limite * 1e6 * 0.95

sonde = lambda *a: subprocess.run(["ffprobe", "-v", "error", *a, "-of", "csv=p=0", entree], capture_output=True, text=True, check=True).stdout.strip()
duree = float(sonde("-show_entries", "format=duration"))
debit_son = int(sonde("-select_streams", "a:0", "-show_entries", "stream=bit_rate") or 192000)
debit_video = int((cible * 8 / duree - debit_son) / 1000)
print(f"durée {duree:.1f} s ; son {debit_son // 1000} kb/s ; vidéo {debit_video} kb/s")

journal = os.path.join(tempfile.mkdtemp(), "passe")
commun = ["-c:v", "libx264", "-preset", "slow", "-b:v", f"{debit_video}k", "-maxrate", f"{int(debit_video * 2)}k",
          "-bufsize", f"{int(debit_video * 4)}k", "-pix_fmt", "yuv420p", "-r", "30", "-profile:v", "high",
          "-tune", "stillimage", "-passlogfile", journal]
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", entree, *commun, "-pass", "1", "-an", "-f", "mp4", os.devnull], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", entree, *commun, "-pass", "2", "-c:a", "copy", "-movflags", "+faststart", sortie], check=True)
taille = os.path.getsize(sortie)
print(f"{sortie} : {taille / 1e6:.1f} Mo")
if taille >= limite * 1e6:
    sys.exit("taille au-dessus de la limite")
