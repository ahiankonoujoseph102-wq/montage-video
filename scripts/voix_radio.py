"""Traitement « voix radio » de la voix off envoyée par Joseph : énergique, tonique, pleine, claire, bien forte.

Usage : python3 scripts/voix_radio.py <audio de Joseph> <sortie .wav>
Appliqué à CHAQUE voix off reçue (toutes les vidéos), avant le découpage en phrases (scripts/decouper_voix.py) :
- nettoyage : graves inutiles coupés, bruit de fond retiré en douceur, souffles entre les phrases baissés ;
- timbre radio : graves pleins (voix « proche »), moins de son de boîte, articulation et présence, brillance ;
- énergie : niveau des mots égalisé (speechnorm), double compression (voix dense, toujours devant), désesseur ;
- volume : voix ramenée à −14 LUFS, crêtes limitées à −1,5 dBTP (ensuite la musique reste 16 LU dessous).
Sortie : WAV 48 kHz mono 24 bits. Le rythme et la hauteur de la voix ne sont pas modifiés (calage des mots intact).
"""
import json
import subprocess
import sys

CHAINE = ",".join([
    "highpass=f=80:poles=2",
    "afftdn=nr=12:nf=-44:tn=1",                    # bruit de fond (suit le bruit de la pièce)
    "agate=threshold=0.015:ratio=2.5:range=0.25:attack=3:release=150:knee=3",  # respirations, bruit entre phrases
    "speechnorm=e=6:r=0.0005:l=1:p=0.9",           # mots faibles remontés : énergie régulière
    "lowshelf=f=120:g=3.5",                        # graves pleins, voix proche
    "equalizer=f=380:t=q:w=1.2:g=-3",              # moins de son « boîte »
    "equalizer=f=2200:t=q:w=1.0:g=2",              # articulation
    "equalizer=f=4000:t=q:w=1.1:g=3.5",            # présence radio
    "highshelf=f=9000:g=3",                        # brillance
    "acompressor=threshold=-28dB:ratio=4.5:attack=3:release=80:makeup=6dB:knee=6",
    "acompressor=threshold=-14dB:ratio=3:attack=8:release=150:makeup=1dB:knee=4",
    "deesser=i=0.5:f=0.55",
])


def mesurer(f):
    r = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-i", f, "-af", "loudnorm=print_format=json", "-f", "null",
                        "-"], capture_output=True, text=True)
    t = r.stderr
    return json.loads(t[t.rindex("{"):t.rindex("}") + 1])


entree, sortie = sys.argv[1], sys.argv[2]
tmp = sortie + ".tmp.wav"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", entree, "-vn", "-ac", "1", "-ar", "48000", "-af", CHAINE,
                "-c:a", "pcm_s24le", tmp], check=True)
m = mesurer(tmp)
# Normalisation en deux passes (mesures réelles) : −14 LUFS, crêtes ≤ −1,5 dBTP, sans pompage.
norm = (f"loudnorm=I=-14:TP=-1.5:LRA=7:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
        f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af", norm + ",alimiter=limit=0.84:level=false",
                "-ar", "48000", "-c:a", "pcm_s24le", sortie], check=True)
subprocess.run(["rm", "-f", tmp])
f = mesurer(sortie)
print(f"Voix radio : {f['input_i']} LUFS, crête {f['input_tp']} dBTP, LRA {f['input_lra']} LU")
