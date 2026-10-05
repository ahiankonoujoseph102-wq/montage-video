# Test de faisabilité — 5 octobre 2026

| Étape | Résultat |
|---|---|
| Vidéo jointe | ❌ Pas reçue (dossiers de pièces jointes vides) |
| ffmpeg | ✅ 6.1.1 |
| Chromium | ✅ 141 (il faut utiliser `chromium_headless_shell`, le binaire complet refuse l'ancien mode headless) |
| Remotion | ✅ installé |
| faster-whisper | ✅ 1.2.1 installé ; ❌ modèle bloqué : huggingface.co est refusé par la politique réseau de l'environnement (403) |
| Extrait 10 s 1080 × 1920 | ✅ rendu en ~35 s (4 cœurs), sur une vidéo de test à voix de synthèse, avec un horodatage connu |

Commande de rendu :

```
npx remotion render src/index.ts Clip out/extrait_10s.mp4 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```
