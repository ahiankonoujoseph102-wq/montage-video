"""Monte les extraits de l'enregistrement d'écran selon src/episodes/epNN/ecran.json.

Chaque segment est retaillé et accéléré (ou figé) pour durer exactement sa
durée en temps de voix ; l'image est recadrée en largeur (le cadrage vertical,
animé, est fait dans Remotion). Sortie : un MP4 muet à 30 i/s par extrait.

Usage : python outils/monter_ecran.py enregistrement.mp4 ecran.json dossier_sortie
"""
import json
import subprocess
import sys

source, config, dossier = sys.argv[1], sys.argv[2], sys.argv[3]
c = json.load(open(config, encoding="utf-8"))
for clip in c["clips"]:
    filtres, noms = [], []
    for i, (v0, v1, r0, r1) in enumerate(clip["segments"]):
        duree = v1 - v0
        if r1 - r0 < 1e-3:  # image figée
            f = f"[0:v]trim=start={r0}:duration=0.05,setpts=PTS-STARTPTS,fps=30,tpad=stop_mode=clone:stop_duration={duree}"
        else:
            f = f"[0:v]trim=start={r0}:end={r1},setpts=(PTS-STARTPTS)*{duree / (r1 - r0):.6f},fps=30,tpad=stop_mode=clone:stop_duration=0.2"
        filtres.append(f + f",trim=duration={duree},setpts=PTS-STARTPTS,crop={c['largeur']}:2400:{c['x']}:0,format=yuv420p[s{i}]")
        noms.append(f"[s{i}]")
    graphe = ";".join(filtres) + ";" + "".join(noms) + f"concat=n={len(noms)}:v=1:a=0[v]"
    sortie = f"{dossier}/ecran-{clip['nom']}.mp4"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", source, "-filter_complex", graphe, "-map", "[v]", "-an",
         "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-r", "30", sortie],
        check=True,
    )
    duree_voulue = clip["segments"][-1][1] - clip["segments"][0][0]
    reel = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", sortie],
                                capture_output=True, text=True).stdout)
    print(f"{sortie} : {reel:.2f} s (attendu {duree_voulue:.2f} s)")
