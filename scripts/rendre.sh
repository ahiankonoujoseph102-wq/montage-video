#!/usr/bin/env bash
# Rend la vidéo d'un projet.
# Usage : scripts/rendre.sh <projet> [secondes]   (sans durée : la vidéo entière)
set -euo pipefail
cd "$(dirname "$0")/.."
projet=$1
mkdir -p out
navigateur=$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1 || true)
options=(--props="public/$projet/props.json" --concurrency=4 --crf=16)
[ -n "$navigateur" ] && options+=(--browser-executable="$navigateur")
if [ $# -ge 2 ]; then
  options+=(--frames="0-$(( $2 * 30 - 1 ))")
  sortie="out/$projet-${2}s.mp4"
else
  sortie="out/$projet.mp4"
fi
debut=$(date +%s)
npx remotion render src/index.ts Montage "$sortie" "${options[@]}"
echo "Rendu : $sortie en $(( $(date +%s) - debut )) s"
