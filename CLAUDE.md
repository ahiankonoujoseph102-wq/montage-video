# Montage vidéo — mode d'emploi pour Claude

Le propriétaire travaille **uniquement depuis son téléphone**. Réponses courtes, en français,
fichiers envoyés directement (vidéo finale, extraits). Ne construis rien qu'il n'a pas demandé.

## Méthode pour chaque vidéo (à suivre dans l'ordre)

1. **Il envoie un lien Google Drive** et, s'il l'a, son script.
   - `scripts/telecharger.sh <lien> <projet>` (nom de projet court, ex. `formation-ia`).
   - Enregistre le script dans `projets/<projet>/script.txt`.
   - Donne durée, taille et résolution.
2. **Transcrire et corriger**, puis lui montrer le texte avec les passages douteux signalés.
   - `python3 scripts/transcribe.py <projet>` (faster-whisper large-v3-turbo, ~1× la durée de la vidéo).
   - `python3 scripts/corriger.py <projet>` → `projets/<projet>/rapport_transcription.md`.
   - Règles : glossaire appliqué partout ; un mot douteux est corrigé d'après le script ;
     ce qui est dit à l'oral et absent du script est **gardé et signalé**.
   - Corrections à la main : `projets/<projet>/corrections.json`
     (`[{"vers": 90.0, "oral": "étudier", "affiche": "utiliser"}]`), puis relancer `corriger.py`.
     `"affiche": ""` supprime le mot ; plusieurs mots (`"de pouvoir"`) se partagent sa durée.
3. **Proposer la liste des passages en animation plein écran** : moment, idée, icône prévue.
   Les écrire dans `projets/<projet>/montage.json` (voir l'exemple `projets/formation-ia/`).
4. **Attendre son accord avant le rendu complet.** Un extrait court (`scripts/rendre.sh <projet> 45`)
   est possible pour juger le style.
5. `python3 scripts/preparer.py <projet>` puis `scripts/rendre.sh <projet>` ;
   **vérifier des images du rendu** (rien ne déborde, textes lisibles, animations qui ne cachent
   pas les sous-titres), puis lui envoyer la vidéo finale.

## Style (fixé)

- 1080 × 1920, 30 i/s. Son visage reste à l'écran, sauf pendant les passages plein écran.
- **Zone sûre TikTok** (`ZONE_SURE` dans `src/charte.ts`) : rien dans les 10 % du haut, les 20 % du bas
  ni dans la bande de 12 % à droite (boutons). Titre, panneaux, plein écran et sous-titres y restent.
- Cadrage dynamique sur le visage : on alterne cadre normal / léger zoom avant de 11 % centré sur le
  visage, aux débuts de phrase et aux virgules, toutes les 3 à 4 s, jamais plus de 5 s sans changement
  (`plans_zoom` dans `scripts/preparer.py`), transition de 4 images. **Pendant un panneau, le zoom est
  limité à 6 %** (`ZOOM_SERRE_PANNEAU`) pour que le panneau ne touche jamais le haut de la tête.
- Sous-titres mot par mot dans le tiers inférieur, 3 ou 4 mots à la fois, 94 px au plus, deux lignes
  au plus, **jamais plus larges que 80 % de l'image** (860 px, sinon retour à la ligne ou texte réduit), texte blanc, mot-clé en jaune souligné (`motsCles` dans `montage.json`), sur un léger dégradé
  sombre en bas d'image. Jamais un mot seul à l'écran : le 2e mot d'un groupe apparaît avec le 1er, et
  un groupe d'un mot est rattaché au voisin (sauf phrase d'un seul mot). Un numéro de téléphone
  s'affiche seul sur sa ligne.
- Titre d'accroche animé pendant les 3 premières secondes, sur deux lignes ajustées à la largeur
  (`titre.lignes` dans `montage.json`), mot-clé en jaune.
- **Pas de barre de progression.**
- Silences de plus de 0,6 s coupés (détection au volume sonore, −30 dB, marge de 0,15 s).
- **Listes et énumérations** (erreurs, « Apprendre à », publics, question finale) : disposition
  `panneau` — le visage reste à l'écran, panneau sombre semi-transparent dans le tiers supérieur
  (au-dessus de la tête), titre, compteur facultatif, puis un élément à la fois au rythme de la voix,
  avec croix rouge / coche verte / icône. **Tous les panneaux ont la même taille de texte (76 px, celle des
  8 erreurs), 2 lignes au plus** : écrire des textes courts (≈ 12 caractères par ligne, ex. « Passer à la
  pratique », « Votre objectif avec l'IA ? »). Un texte trop long ferait rétrécir tout le panneau : le raccourcir.
- **Plein écran réservé aux passages courts** (date et lieu, outils, numéro de téléphone) :
  dispositions `focus` (une grande icône + grand texte ajusté à la largeur ; `\n` pour couper la ligne)
  ou `liste` (grandes étiquettes de texte). Fond en dégradé animé (`nuit`, `orange`, `bleu`,
  `violet`, on change selon la partie). Contenu centré, sans grand vide. Pas de logos de marque.
- Onde sonore animée au-dessus des sous-titres **uniquement pendant les passages plein écran**.
- **Pas de doublon** : en plein écran, un sous-titre qui répète ce qui est affiché en grand (numéro,
  date, lieu, noms d'outils) est masqué automatiquement (`groupes_masques` dans `scripts/preparer.py`).
- **Carton de fin** de 3 s en plein écran après le dernier mot (`carton` dans `montage.json`, `\n` pour couper
  le titre) : par défaut fond `nuit`, « LOMÉ IA / SCHOOL » en grand, puis « Formation gratuite », la date,
  le lieu, le numéro et « Lien en description ». Le son baisse en fondu sur la dernière demi-seconde.

## Glossaire

`glossaire.json` : noms propres appliqués automatiquement à chaque transcription.
Pour ajouter un mot : une entrée `{"terme": ..., "variantes": [...]}` (variantes en minuscules,
telles que Whisper les entend). Le lieu s'écrit **« Adidogomé, Lycée Moderne 2 »**, sans « Lomé »,
partout ; « Lomé IA School » ne change pas.

## Pièges connus

- Ne pas donner le glossaire à Whisper en amorce (`initial_prompt`) : à l'essai, il a sauté un passage entier.
- Remotion exige `chromium_headless_shell` (géré par `scripts/rendre.sh`) et `import React` dans chaque `.tsx`.
- Animations avec `spring` : `overshootClamping: true` se met **dans `config`**
  (`config: {damping: 12, overshootClamping: true}`), sinon il est ignoré sans erreur.
- Espace entre mots de sous-titre proportionnel à la taille (0,42 em) : un écart fixe paraît collé.
- Tailles de texte mesurées (`fitText`, `measureText`) : `Montage` attend le chargement de Montserrat
  avant d'afficher quoi que ce soit, sinon la taille varie d'une image à l'autre.
- Vérifier les sous-titres sur des images prises **pendant** l'apparition des mots, pas seulement après.
- Réseau : huggingface.co, drive.google.com et drive.usercontent.google.com doivent être autorisés
  dans l'environnement.
- Vidéos WhatsApp en basse résolution (464 × 832) : agrandies, donc un peu floues. Demander l'original.

## Organisation

- `scripts/` : téléchargement, transcription, correction, préparation, rendu.
- `projets/<projet>/` : script, `montage.json`, transcriptions, rapport (la vidéo source n'est pas versionnée).
- `src/` : composition Remotion `Montage` (props lues dans `public/<projet>/props.json`).
- `public/<projet>/`, `out/` : fichiers générés, non versionnés.
