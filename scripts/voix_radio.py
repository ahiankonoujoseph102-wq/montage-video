"""Traitement « voix radio » de la voix off envoyée par Joseph : énergique, tonique, pleine, claire, bien forte.

Usage : python3 scripts/voix_radio.py <audio de Joseph> <sortie .wav>
Appliqué à CHAQUE voix off reçue (toutes les vidéos), avant le découpage en phrases (scripts/decouper_voix.py) :
- nettoyage : graves inutiles coupés, bruit de fond retiré en douceur, sans porte de bruit (elle coupait les fins de mots) ;
- timbre radio : graves pleins (voix « proche »), moins de son de boîte, articulation et présence, brillance ;
- énergie : niveau des mots égalisé (speechnorm), compression lente (voix dense, toujours devant, sans pompage), désesseur léger ;
- volume : voix ramenée à −14 LUFS, crêtes limitées à −1,5 dBTP (ensuite la musique reste 16 LU dessous).
Sortie : WAV 48 kHz mono 24 bits. Le rythme et la hauteur de la voix ne sont pas modifiés (calage des mots intact).
"""
import json
import subprocess
import sys

CHAINE = ",".join([
    # Réglages mesurés sur la voix de Joseph : aucune chute de niveau dans les mots (pas de porte de bruit, compresseur
    # lent qui ne « pompe » pas, désesseur léger) — les anciens réglages donnaient l'impression de coupures.
    "highpass=f=80:poles=2",
    "afftdn=nr=8:nf=-46:tn=1",                     # bruit de fond retiré en douceur
    "speechnorm=e=3:r=0.0001:l=1:p=0.9",           # mots faibles remontés en douceur (sans pompage)
    "lowshelf=f=120:g=3.5",                        # graves pleins, voix proche
    "equalizer=f=380:t=q:w=1.2:g=-3",              # moins de son « boîte »
    "equalizer=f=2200:t=q:w=1.0:g=2",              # articulation
    "equalizer=f=4000:t=q:w=1.1:g=3.5",            # présence radio
    "highshelf=f=9000:g=3",                        # brillance
    "acompressor=threshold=-26dB:ratio=3:attack=12:release=220:makeup=5dB:knee=8",  # voix dense, sans pomper
    "deesser=i=0.15:f=0.55",                       # « s » adoucis, jamais avalés
])


def mesurer(f):
    r = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-i", f, "-af", "loudnorm=print_format=json", "-f", "null",
                        "-"], capture_output=True, text=True)
    t = r.stderr
    return json.loads(t[t.rindex("{"):t.rindex("}") + 1])


entree, sortie = sys.argv[1], sys.argv[2]
tmp = sortie + ".tmp.wav"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", entree, "-vn", "-ac", "1", "-ar", "48000", "-af", CHAINE,
                "-c:a", "pcm_f32le", tmp], check=True)
m = mesurer(tmp)
# Volume : gain CONSTANT vers −14 LUFS (loudnorm repasse en mode dynamique quand il ne peut pas rester linéaire, et
# ce mode creusait le son par moments), puis limiteur de crête à −1,5 dBTP.
gain = -14.0 - float(m["input_i"])
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af",
                f"volume={gain:.2f}dB,alimiter=limit=0.8:attack=2:release=200:level=false",
                "-ar", "48000", "-c:a", "pcm_s24le", sortie], check=True)
subprocess.run(["rm", "-f", tmp])
f = mesurer(sortie)
print(f"Voix radio : {f['input_i']} LUFS, crête {f['input_tp']} dBTP, LRA {f['input_lra']} LU")
