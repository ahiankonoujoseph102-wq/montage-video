#!/usr/bin/env bash
# Encode la vidéo finale pour l'e-mail : moins de 23 Mo (pièce jointe Gmail < 25 Mo), sans perte visible.
# Usage : scripts/encoder_email.sh <image.mp4 (sans son)> <mix.wav> <sortie.mp4>
# Deux passes à débit visé (débit = 23 Mo / durée, plafonné à 1,4 Mbit/s), réglage « animation » de x264.
# Essai sur la vidéo de test du 6 novembre à 0,89 Mbit/s (débit d'une vidéo de 3 min) : SSIM 0,997, aucune
# différence visible sur les textes.
set -euo pipefail
IMG="$1"; SON="$2"; OUT="$3"
DUREE=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SON")
VIDEO_K=$(python3 -c "print(min(1400, int((23.0e6 * 8 / $DUREE / 1000 - 128) * 0.96)))")
echo "Durée ${DUREE} s, débit image ${VIDEO_K} kbit/s"
DIR=$(mktemp -d)
ffmpeg -loglevel error -y -i "$IMG" -c:v libx264 -preset medium -tune animation -b:v ${VIDEO_K}k \
  -pass 1 -passlogfile "$DIR/x264" -an -f null /dev/null
ffmpeg -loglevel error -y -i "$IMG" -i "$SON" -map 0:v -map 1:a -c:v libx264 -preset medium -tune animation \
  -b:v ${VIDEO_K}k -maxrate $((VIDEO_K * 2))k -bufsize $((VIDEO_K * 4))k -pass 2 -passlogfile "$DIR/x264" \
  -pix_fmt yuv420p -c:a aac -b:a 128k -shortest -movflags +faststart "$OUT"
rm -rf "$DIR"
TAILLE=$(stat -c %s "$OUT")
echo "Fichier : $((TAILLE / 1000000)) Mo"
[ "$TAILLE" -lt 24000000 ] || { echo "Trop lourd pour l'e-mail (24 Mo au plus)"; exit 1; }
