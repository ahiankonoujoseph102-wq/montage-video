#!/usr/bin/env bash
# Rend la vidéo d'un projet.
# Usage : scripts/rendre.sh <projet> [secondes]   (sans durée : la vidéo entière)
# Si public/<projet>/mix.wav existe (scripts/mixer.py), l'image est rendue sans son puis la bande son
# mixée (voix + musique + effets) est ajoutée telle quelle.
set -euo pipefail
cd "$(dirname "$0")/.."
projet=$1
mkdir -p out
navigateur=$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1 || true)
options=(--props="public/$projet/props.json" --concurrency=4 --crf=16)
[ -n "$navigateur" ] && options+=(--browser-executable="$navigateur")
duree=()
if [ $# -ge 2 ]; then
  options+=(--frames="0-$(( $2 * 30 - 1 ))")
  duree=(-t "$2")
  sortie="out/$projet-${2}s.mp4"
else
  sortie="out/$projet.mp4"
fi
mix="public/$projet/mix.wav"
debut=$(date +%s)
if [ -f "$mix" ]; then
  image="out/.$projet-image.mp4"
  npx remotion render src/index.ts Montage "$image" "${options[@]}" --muted
  ffmpeg -y -loglevel error -i "$image" -i "$mix" "${duree[@]}" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k \
    -movflags +faststart "$sortie"
  rm -f "$image"
else
  npx remotion render src/index.ts Montage "$sortie" "${options[@]}"
fi
echo "Rendu : $sortie en $(( $(date +%s) - debut )) s"
