# montage-video
Montage automatique de mes vidéos face caméra avec Claude Code : sous-titres mot par mot, animations et rendu vertical 1080 × 1920.

Mode d'emploi complet : [CLAUDE.md](CLAUDE.md).

```
scripts/telecharger.sh <lien-drive> <projet>
python3 scripts/transcribe.py <projet>
python3 scripts/corriger.py <projet>      # → projets/<projet>/rapport_transcription.md
python3 scripts/preparer.py <projet>      # coupe des silences, recalage, onde sonore
scripts/rendre.sh <projet> [secondes]
```

Dossier complet du dépôt (informations Lomé IA School et Talkami incluses) : [DOSSIER_COMPLET.md](DOSSIER_COMPLET.md).
