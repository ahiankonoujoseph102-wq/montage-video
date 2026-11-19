#!/usr/bin/env bash
# Découpe la partie 1 en 3 épisodes TikTok de moins de 3 minutes (compte limité à 3 min), aux débuts de phrase
# (aucun mot coupé). Épisodes 1 et 2 : carton « La suite dans l'épisode N » de 3 s ; épisodes 2 et 3 : bandeau
# « PARTIE 1 · ÉPISODE N/3 » pendant les 3 premières secondes.
# Usage : projets/diplome-togo/episodes_tiktok.sh <vidéo complète> <dossier de sortie>
set -euo pipefail
V=$1; OUT=$2; mkdir -p "$OUT"
F=/usr/share/fonts/opentype/inter/InterDisplay-Black.otf
C1=117.86; C2=222.72   # débuts des phrases 25 (« Ou alors… ») et 44 (« Nous sommes en 2026… »)
FX=sons/effets/carton.wav
bandeau() {  # $1 = numéro d'épisode
  echo "drawbox=x=0:y=230:w=iw:h=150:color=0x0B0F2E@0.82:t=fill:enable='lt(t,3)',drawtext=fontfile=$F:text='PARTIE 1 · ÉPISODE $1/3':fontcolor=0xFFC928:fontsize=72:x=(w-tw)/2:y=275:enable='lt(t,3)'"
}
carton() {  # $1 = segment, $2 = numéro de l'épisode suivant, $3 = sortie
  local D; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
  ffmpeg -loglevel error -y -sseof -0.1 -i "$1" -frames:v 1 "$OUT/dernier.png"
  ffmpeg -loglevel error -y -loop 1 -t 3 -i "$OUT/dernier.png" -i "$FX" -filter_complex \
    "[0:v]scale=1080:1920,boxblur=30:3,eq=brightness=-0.35,format=yuv420p,
     drawtext=fontfile=$F:text='LA SUITE DANS':fontcolor=white:fontsize=96:borderw=10:bordercolor=0x0B0F2E:x=(w-tw)/2:y=700,
     drawtext=fontfile=$F:text='L’ÉPISODE $2':fontcolor=0xFFC928:fontsize=150:borderw=12:bordercolor=0x0B0F2E:x=(w-tw)/2:y=830,
     drawbox=x=240:y=1060:w=600:h=130:color=0xFE2C55:t=fill,
     drawtext=fontfile=$F:text='ABONNE-TOI':fontcolor=white:fontsize=76:x=(w-tw)/2:y=1088,fps=30[v];
     [1:a]aresample=48000,volume=-6dB,apad,atrim=0:3,afade=t=out:st=2.4:d=0.6[a]" \
    -map "[v]" -map "[a]" -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -ac 2 "$OUT/carton.mp4"
  printf "file '%s'\nfile '%s'\n" "$(realpath "$1")" "$(realpath "$OUT/carton.mp4")" > "$OUT/liste.txt"
  ffmpeg -loglevel error -y -f concat -safe 0 -i "$OUT/liste.txt" -c copy -movflags +faststart "$3"
}
enc="-c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -r 30 -c:a aac -b:a 256k -ar 48000 -ac 2"
ffmpeg -loglevel error -y -i "$V" -t $C1 -af "afade=t=out:st=$(echo "$C1-0.35" | bc):d=0.35" $enc "$OUT/seg1.mp4"
ffmpeg -loglevel error -y -ss $C1 -to $C2 -i "$V" -vf "$(bandeau 2)" -af "afade=t=in:d=0.15,afade=t=out:st=$(echo "$C2-$C1-0.35" | bc):d=0.35" $enc "$OUT/seg2.mp4"
ffmpeg -loglevel error -y -ss $C2 -i "$V" -vf "$(bandeau 3)" -af "afade=t=in:d=0.15" $enc "$OUT/episode3.mp4"
carton "$OUT/seg1.mp4" 2 "$OUT/episode1.mp4"
carton "$OUT/seg2.mp4" 3 "$OUT/episode2.mp4"
rm -f "$OUT"/seg*.mp4 "$OUT/carton.mp4" "$OUT/dernier.png" "$OUT/liste.txt"
for e in 1 2 3; do printf "épisode %s : " $e; ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/episode$e.mp4"; done
