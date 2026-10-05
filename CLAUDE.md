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
5. `python3 scripts/preparer.py <projet>`, `python3 scripts/mixer.py <projet>` (bande son), puis
   `scripts/rendre.sh <projet>` ; donner les niveaux et la liste des effets (`projets/<projet>/sons.md`) ;
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
- **Ouverture par défaut (5 premières secondes, à garder pour toutes les vidéos)** :
  - aucun démarrage en douceur : la première parole arrive dans les 0,2 premières secondes (`MARGE_DEBUT`
    = 0,03 s de silence gardé au début, au lieu de 0,15 s) ; la musique démarre franchement à la première image
    (pas de fondu d'entrée), avec l'impact d'ouverture ;
  - coup de zoom : visage serré à **35 %** sur la première image, **recul linéaire** jusqu'au cadre normal en
    **0,4 s** (12 images : le visage rétrécit nettement à chaque image, vérifié 1,30 → 1,24 → 1,15 → 1,06 → 1,00
    aux images 0, 3, 6, 9, 12), léger tremblement amorti ; flash blanc de 2 images assez léger (opacité 0,6 puis
    0,3) pour que le visage se voie dès l'image 0 (`OUVERTURE` dans `src/charte.ts`) ;
  - **titre d'accroche géant à adapter à chaque vidéo** (`titre.lignes` dans `montage.json` : 3 lignes courtes ;
    `motsCles` → mot en **noir sur un bloc jaune plein**) : chaque ligne a sa propre taille pour remplir
    **toute la largeur de la zone sûre** (la ligne la plus courte est donc la plus haute), centrée, blanc à
    contour noir épais ; posé en bas de la zone sûre sur le buste, jamais au-dessus de 1 088 px (menton à
    ~1 084 px avec le zoom de 35 %) ; les **lignes arrivent une à une toutes les 5 images** (titre complet en
    0,33 s), chacune avec un claquement visuel (étirement vertical qui se pose en 4 images ; pas de grossissement
    en largeur, la ligne remplit déjà la zone) et sonore ; à `geant` = 2,5 s il rétrécit et monte dans un bandeau
    en haut, où il reste jusqu'à `duree` = 5 s ; sous-titres masqués tant qu'il est géant ;
  - cadrage qui change toutes les ~1,5 s pendant les 5 premières secondes, puis rythme normal.
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

## Son (fixé)

- **Musique par défaut** : `sons/musique_defaut.m4a` (musique personnelle de Joseph, droits OK), décrite dans
  `sons/musique.json` (tonalité **Sol mineur**, ~65 BPM, mesurées avec librosa). En boucle si plus courte que la
  vidéo (fondu enchaîné de 1,5 s au raccord), démarrage franc à la première image (pas de fondu d'entrée),
  fondu de sortie sur le carton de fin.
- **Niveaux par défaut** (`MUSIQUE` dans `scripts/mixer.py`, validés par Joseph) : voix normalisée, musique
  **16 LU sous la voix quand il parle**, **10 LU sous la voix en plein écran et sur le carton de fin**
  (1 s à ce niveau puis fondu jusqu'au silence), sans fondu d'entrée, 12 LU sous la voix dans les silences. La voix reste toujours
  parfaitement compréhensible. **Mix final à −14 LUFS**, limiteur de crête à −2 dBTP (l'encodage AAC remonte les
  crêtes d'environ 0,8 dB) : **crête vraie du fichier final sous −1 dBTP**, à mesurer sur le fichier envoyé,
  aucune saturation. Effets sonores : calage et niveaux inchangés (ci-dessous).
- **Effets sonores** fabriqués par `scripts/sons.py` (une seule famille : impacts graves accordés sur la tonique,
  cloches sur l'accord de tonique, souffles filtrés, même réverbération), **accordés sur la tonalité de la
  musique** — relancer `python3 scripts/sons.py` si la musique change. Un son par type, toujours le même :
  ouverture (impact grave et puissant sur la première image, le plus fort de tous : ~−2 LU sous la voix),
  ligne du titre (claquement court et sec, un par ligne, autorisé à 5 images d'écart), croix rouge (« non » court et sec, quinte → tonique), coche verte (« ding »
  montant, quinte → tonique), apparition d'un élément de panneau sans croix ni coche (glissement léger),
  entrée d'un plein écran (souffle + petit impact), date / lieu / numéro (impact marqué + cloches),
  changement de cadrage (souffle à peine perceptible), carton de fin (montée douce + impact final).
- **Calage** : chaque effet démarre sur l'échantillon exact de la **première image où l'élément est visible**
  (image de départ + 1, car les animations partent de 0 ; les lignes du titre, visibles dès leur image, sonnent
  sur cette image : impact d'ouverture à l'image 0, claquements aux images 5 et 10).
- **Dosage** : effets toujours sous la voix (de −2 à −25 LU selon le type), **un seul effet à la fois** :
  deux effets à moins de 8 images d'écart → seul le plus important est gardé (ouverture > carton > info > plein écran
  > croix/coche/ligne du titre > glissement > cadrage). Le premier élément d'un panneau sonne avec sa croix/coche
  (pas de glissement en plus) ; une info qui ouvre un plein écran remplace le son d'entrée.
- `scripts/rendre.sh` rend l'image sans son puis ajoute `public/<projet>/mix.wav` tel quel (calage vérifié :
  0 échantillon de décalage).

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
- `scripts/sons.py` tire du bruit aléatoire dans l'ordre des sons : ajouter un son change le grain des
  suivants. Les effets versionnés dans `sons/effets/` font foi ; ne régénérer que le son ajouté
  (restaurer les autres avec `git checkout -- sons/effets/<nom>.wav`).
- Réseau : huggingface.co, drive.google.com et drive.usercontent.google.com doivent être autorisés
  dans l'environnement.
- Vidéos WhatsApp en basse résolution (464 × 832) : agrandies, donc un peu floues. Demander l'original.

## Organisation

- `scripts/` : téléchargement, transcription, correction, préparation, rendu.
- `projets/<projet>/` : script, `montage.json`, transcriptions, rapport (la vidéo source n'est pas versionnée).
- `src/` : composition Remotion `Montage` (props lues dans `public/<projet>/props.json`).
- `public/<projet>/`, `out/` : fichiers générés, non versionnés.
