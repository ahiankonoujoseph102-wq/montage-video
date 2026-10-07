"""Version longue : la vidéo montée (sans son carton de fin), un carton de transition de 3 s, puis une autre
vidéo reprise telle quelle (coupée avant un éventuel écran noir de fin, ex. logo CapCut).

Usage : python3 scripts/version_longue.py <projet> <fichier à la suite> [largeur] [hauteur]
Entrées : out/<projet>.mp4 (rendu complet), public/<projet>/props.json, projets/<projet>/<fichier à la suite>
Sortie : out/<projet>-longue.mp4 (≤ 30 Mo)

Carton de transition (composition Remotion « Transition », 90 images) : balayage d'entrée, « ET MAINTENANT… »,
« REGARDEZ LA VIDÉO » + « MONTÉE À 100 % PAR L'IA » (bloc jaune), bouton de lecture qui pulse, coup de zoom
dans le bouton qui ouvre sur la première image de la vidéo suivante. Son : musique qui continue puis remonte à
l'impact, effet « carton » (montée 1,2 s + impact pile sur le texte principal), souffle discret au zoom de sortie.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import mixer  # noqa: E402  (réutilise la lecture audio, la sonie et les niveaux d'effets)

FPS = 30
SR = mixer.SR
LUFS = -14.0
TAILLE_MAX = 27.5e6  # octets : marge sous la limite de 30 Mo (le débit réel dépasse un peu la cible)
TRANSITION = {"images": 90, "impact": 36, "zoom": 78}  # doit suivre IMAGES dans src/Transition.tsx
MUSIQUE_TRANSITION = (-10.0, -6.0)  # LU sous la voix : avant l'impact, puis musique qui remonte
FONDU_FIN = 0.8  # s : fondu de sortie à la fin de la vidéo
TEXTES = {"surtitre": "ET MAINTENANT…", "titre": "REGARDEZ\nLA VIDÉO", "bloc": "MONTÉE À 100 % PAR L'IA"}


def duree(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)],
                                capture_output=True, text=True, check=True).stdout)


def debut_ecran_noir(fichier, apres):
    """Début d'un écran noir final (logo d'application) après `apres` secondes, sinon la durée totale."""
    sortie = subprocess.run(["ffmpeg", "-hide_banner", "-ss", str(apres), "-i", str(fichier), "-vf",
                             "blackdetect=d=0.5:pix_th=0.12", "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
    fins = [(float(a), float(b)) for a, b in re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", sortie)]
    total = duree(fichier)
    for a, b in fins:
        if apres + b >= total - 0.1:  # le noir va jusqu'à la fin : c'est l'écran de fin à couper
            return apres + a
    return total


def image(fichier, t, sortie):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.4f}", "-i", str(fichier), "-frames:v", "1",
                    str(sortie)], check=True)


def main():
    nom, suite = sys.argv[1], ROOT / "projets" / sys.argv[1] / sys.argv[2]
    largeur, hauteur = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (720, 1280)
    props = json.loads((ROOT / "public" / nom / "props.json").read_text())
    courte = ROOT / "out" / f"{nom}.mp4"
    sortie = ROOT / "out" / f"{nom}-longue.mp4"
    dossier = ROOT / "public" / nom / "transition"
    dossier.mkdir(parents=True, exist_ok=True)

    # 1. Bornes : la vidéo montée jusqu'à l'ouverture de son carton de fin ; la suite jusqu'à son écran noir.
    n1 = props["carton"]["debut"] if props.get("carton") else props["dureeImages"]
    fin1 = n1 / FPS
    fin3 = debut_ecran_noir(suite, duree(suite) * 0.8)
    print(f"Partie 1 : 0–{fin1:.2f} s ; suite : 0–{fin3:.2f} s (écran de fin coupé : {duree(suite) - fin3:.2f} s)")

    # 2. Carton de transition (images de raccord : dernière image avant, première image après).
    image(courte, (n1 - 1) / FPS, dossier / "avant.png")
    image(suite, 0, dossier / "apres.png")
    props_t = {**TEXTES, "avant": f"{nom}/transition/avant.png", "apres": f"{nom}/transition/apres.png"}
    (dossier / "props.json").write_text(json.dumps(props_t, ensure_ascii=False))
    carton_mp4 = ROOT / "out" / f".{nom}-transition.mp4"
    navigateur = sorted(Path("/opt/pw-browsers").glob("chromium_headless_shell-*/chrome-linux/headless_shell"))
    cmd = ["npx", "remotion", "render", "src/index.ts", "Transition", str(carton_mp4), f"--props={dossier / 'props.json'}",
           "--muted", "--crf=14"]
    if navigateur:
        cmd.append(f"--browser-executable={navigateur[0]}")
    subprocess.run(cmd, cwd=ROOT, check=True, stdout=subprocess.DEVNULL)

    # 3. Son, construit à l'échantillon près (1 image = 1 600 échantillons).
    mesure = pyln.Meter(SR)
    e = mixer.ECH_PAR_IMAGE
    a1 = mixer.lire_audio(courte)[:n1 * e]
    a1 *= mixer.db(LUFS - mixer.sonie(a1, mesure))
    nt = TRANSITION["images"] * e
    config = json.loads((ROOT / "sons" / "musique.json").read_text())
    musique = mixer.lire_audio(ROOT / "sons" / config["fichier"])
    musique = mixer.boucler(musique, int((fin1 + 10) * SR))[n1 * e:n1 * e + nt]  # la musique continue
    musique *= mixer.db(LUFS - mixer.sonie(musique, mesure))
    i_imp = TRANSITION["impact"] * e
    gain = np.full(nt, MUSIQUE_TRANSITION[0])
    gain[i_imp:] = MUSIQUE_TRANSITION[1]
    gain = np.convolve(gain, np.ones(2400) / 2400, mode="same")  # transitions de 50 ms
    gain[:2400] = MUSIQUE_TRANSITION[0]
    a2 = musique * mixer.db(gain)[:, None]
    a2[-6 * e:] *= np.linspace(1, 0, 6 * e)[:, None]  # s'efface sous l'impact d'ouverture de la suite
    for quoi, debut in (("carton", 0), ("zoom", TRANSITION["zoom"])):
        sr, x = wavfile.read(ROOT / "sons" / "effets" / f"{quoi}.wav")
        x = x.astype(np.float64) / 32767
        x *= mixer.db(LUFS + mixer.EFFETS[quoi] - mixer.sonie_attaque(x, mesure))
        i = debut * e
        a2[i:i + len(x)] += x[:nt - i]
    a3 = mixer.lire_audio(suite)[:int(fin3 * SR)]
    a3 *= mixer.db(LUFS - mixer.sonie(a3, mesure))
    f = int(FONDU_FIN * SR)
    a3[-f:] *= np.linspace(1, 0, f)[:, None]
    son = ROOT / "out" / f".{nom}-longue.wav"
    wavfile.write(son, SR, np.concatenate([a1, a2, a3]).astype(np.float32))
    son_lim = ROOT / "out" / f".{nom}-longue-lim.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(son), "-af",
                    "aresample=192000,alimiter=limit=0.79:attack=1:release=30:level=disabled,aresample=48000",
                    str(son_lim)], check=True)

    # 4. Image : les trois parties au même format, puis encodage en deux passes pour rester sous 30 Mo.
    norme = f"fps={FPS},scale={largeur}:{hauteur}:flags=lanczos,setsar=1,format=yuv420p"
    filtres = (f"[0:v]trim=0:{fin1},setpts=PTS-STARTPTS,{norme}[v0];[1:v]setpts=PTS-STARTPTS,{norme}[v1];"
               f"[2:v]trim=0:{fin3},setpts=PTS-STARTPTS,{norme}[v2];[v0][v1][v2]concat=n=3:v=1:a=0[v]")
    total = fin1 + TRANSITION["images"] / FPS + fin3
    debit_video = int((TAILLE_MAX * 8 / total - 128_000) / 1000)
    commun = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(courte), "-i", str(carton_mp4), "-i", str(suite),
              "-i", str(son_lim), "-filter_complex", filtres, "-map", "[v]", "-map", "3:a", "-c:v", "libx264",
              "-preset", "slow", "-b:v", f"{debit_video}k", "-c:a", "aac", "-b:a", "128k", "-shortest"]
    log = str(ROOT / "out" / "p_longue")
    subprocess.run(commun + ["-pass", "1", "-passlogfile", log, "-f", "mp4", "/dev/null"], check=True)
    subprocess.run(commun + ["-pass", "2", "-passlogfile", log, "-movflags", "+faststart", str(sortie)], check=True)
    for tmp in (son, son_lim):
        tmp.unlink()
    print(f"{sortie} : {duree(sortie):.1f} s, {sortie.stat().st_size / 1e6:.1f} Mo ; transition de "
          f"{fin1:.2f} à {fin1 + TRANSITION['images'] / FPS:.2f} s (impact à {fin1 + TRANSITION['impact'] / FPS:.2f} s), "
          f"vidéo {debit_video} kbit/s")


if __name__ == "__main__":
    main()
