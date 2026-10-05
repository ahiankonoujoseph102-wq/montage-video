#!/usr/bin/env bash
# Télécharge une vidéo Google Drive (partagée « Tous les utilisateurs disposant du lien »).
# Usage : scripts/telecharger.sh <lien-drive> <projet>
set -euo pipefail
cd "$(dirname "$0")/.."
id=$(echo "$1" | sed -E 's#.*/d/([^/?]+).*#\1#; s#.*[?&]id=([^&]+).*#\1#')
mkdir -p "projets/$2"
curl -sSL --fail -o "projets/$2/source.mp4" \
  "https://drive.usercontent.google.com/download?id=$id&export=download&confirm=t"
ffprobe -v error -show_entries format=duration,size:stream=width,height -of compact "projets/$2/source.mp4"
