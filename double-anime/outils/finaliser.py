"""Normalise le son d'un rendu Remotion et vérifie le résultat.

Règles de la chaîne de montage (branche claude/video-editing-script-jyjkt0) :
-14 LUFS intégré, pic vrai ≤ -1,5 dBTP, LRA 11 ; mesure du fichier produit et
correction par un gain constant si l'écart dépasse 0,3 LU. L'image est copiée
sans réencodage.

Usage : python outils/finaliser.py brut.mp4 final.mp4
"""
import json
import re
import shutil
import subprocess
import sys

LUFS, TP, LRA, TOLERANCE = -14.0, -1.5, 11.0, 0.3
AAC = ["-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2"]


def ffmpeg(*args: str) -> str:
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-y", *args], check=True, capture_output=True, text=True).stderr


def mesurer(fichier: str) -> tuple[float, float]:
    sortie = ffmpeg("-nostats", "-i", fichier, "-af", "ebur128=peak=true", "-f", "null", "-")
    resume = sortie[sortie.rfind("Summary:"):]
    integre = float(re.search(r"I:\s*(-?\d+\.?\d*)\s*LUFS", resume).group(1))
    pic = float(re.search(r"Peak:\s*(-?\d+\.?\d*)\s*dBFS", resume).group(1))
    return integre, pic


def main() -> None:
    brut, final = sys.argv[1], sys.argv[2]
    # passe 1 : mesure loudnorm
    sortie = ffmpeg("-i", brut, "-af", f"loudnorm=I={LUFS}:TP={TP}:LRA={LRA}:print_format=json", "-f", "null", "-")
    m = json.loads(sortie[sortie.rfind("{"): sortie.rfind("}") + 1])
    print(f"avant : {float(m['input_i']):.1f} LUFS, pic vrai {float(m['input_tp']):.1f} dBTP")
    # passe 2 : normalisation (linéaire si possible)
    filtre = (
        f"loudnorm=I={LUFS}:TP={TP}:LRA={LRA}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
        f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    )
    ffmpeg("-i", brut, "-c:v", "copy", "-af", filtre, *AAC, "-movflags", "+faststart", final)
    integre, pic = mesurer(final)
    for essai in range(3):
        ecart = LUFS - integre
        if abs(ecart) <= TOLERANCE and pic <= TP:
            break
        filtre = f"volume={ecart:.2f}dB"
        if pic + ecart > TP:
            # limiteur suréchantillonné ×4 (pics entre échantillons), marge croissante
            # pour absorber le dépassement de l'encodage AAC
            marge = 0.5 * (essai + 1)
            filtre += f",aresample=192000,alimiter=limit={10 ** ((TP - marge) / 20):.4f}:level=false,aresample=48000"
        print(f"correction : {filtre}")
        temp = final + ".tmp.mp4"
        ffmpeg("-i", final, "-c:v", "copy", "-af", filtre, *AAC, "-movflags", "+faststart", temp)
        shutil.move(temp, final)
        integre, pic = mesurer(final)
    print(f"après : {integre:.1f} LUFS, pic vrai {pic:.1f} dBTP")
    if abs(integre - LUFS) > TOLERANCE or pic > TP:
        sys.exit("niveau hors tolérance")


main()
