#!/usr/bin/env bash
# Rend tous les éléments de la formation partie 1 (sans son) dans out/formation-partie1/.
# Usage : scripts/rendre_formation.sh [composition…]   (sans argument : tout)
# Extraits d'écran : d'abord python3 scripts/extraits.py formation-montage-partie1 <dossier des sources>.
set -euo pipefail
cd "$(dirname "$0")/.."
projet=formation-montage-partie1
sortie=out/formation-partie1
mkdir -p "$sortie"
navigateur=$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1 || true)
options=(--concurrency=4 --crf=18 --muted)
[ -n "$navigateur" ] && options+=(--browser-executable="$navigateur")
paquet=$(mktemp -d)
npx remotion bundle src/index.ts --out-dir "$paquet" >/dev/null
elements=(GeneriqueOuverture GeneriqueServices GeneriqueAdhesion GeneriqueTalkami GeneriqueFin
  CartePrompt1 CartePrompt2 CartePrompt3 CartePrompt4 CartePrompt5 CarteComplement CartePrompt6 CartePrompt7
  CartePrompt8 CartePromptFlowReel SceneEmploye ScenePromptVague SceneBesoins SceneBarre32 SceneReglages
  SceneBarriere30 SceneWhatsAppFlou SceneLimites SceneRecap AvantApres)
extraits=$(python3 -c "import json; print(' '.join(json.load(open('public/$projet/extraits.json'))))")
[ $# -gt 0 ] && { elements=("$@"); }
[ $# -eq 0 ] && elements+=($extraits)
for e in "${elements[@]}"; do
  if [[ $e == X* ]]; then
    python3 -c "import json,sys; json.dump(json.load(open('public/$projet/extraits.json'))['$e'], open('$paquet/$e.json','w'))"
    npx remotion render "$paquet" ExtraitEcran "$sortie/$e.mp4" --props="$paquet/$e.json" "${options[@]}" >/dev/null
  else
    npx remotion render "$paquet" "$e" "$sortie/$e.mp4" "${options[@]}" >/dev/null
  fi
  echo "$e : $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$sortie/$e.mp4") s"
done
rm -rf "$paquet"
