# Série animée Lomé IA School — modèle de la série

Vidéos éducatives animées pour le compte TikTok de Lomé IA School. Projet
Remotion indépendant : ne jamais toucher aux scripts de montage du dépôt
(`scripts/`, branche `claude/video-editing-script-jyjkt0`).

## Décisions validées (ne pas changer sans accord)

- **Style : 2D en aplats de couleur** (SVG dans Remotion). La 3D a été essayée
  puis écartée : visage moins lisible sur téléphone.
- **Le double** de la personne (photo : `references/photo.jpg`) : peau brun
  foncé, cheveux très courts avec du volume plat sur le dessus, barbiche et
  moustache légères, veste bleu nuit sur chemise blanche au col ouvert.
  Formateur accueillant : **léger sourire bienveillant au repos**, sourcils
  fins à l'intérieur relevé. Grimace et grand sourire réservés à leurs moments.
- **Bras** : manches de veste avec coude marqué, boutons et manchette ;
  **vraies mains à doigts** (posées, ouvertes, index, poing, compte 1 à 4).
- **Mains posées** : à plat sur le bureau, **paume vers le bas, doigts vers
  l'avant** (vers le spectateur, raccourcis par la perspective), pouce du côté
  du corps. Jamais tournées de travers (effet « poignet cassé »).
- **Décor** : bureau le soir, fenêtre sur la ville au crépuscule, plante,
  étagère, grand écran au-dessus du personnage où passent les démonstrations.
- **Couleurs du logo** (`src/theme.ts`) : nuit `#020629`, or `#feca26`,
  violet `#a177fd`, blanc. Police Poppins.
- **Aucune autre marque ajoutée** : pas de logo, personnage ou mascotte d'une
  autre marque. Les démonstrations réelles sont des **enregistrements d'écran
  de ChatGPT** : on garde le nom « ChatGPT » tel qu'il apparaît dans
  l'application, **sans ajouter de logo**. Les parties dessinées de l'écran
  (formule, rappel, appel) ne prennent pas l'apparence d'une application
  existante. Si un bouton WhatsApp est dessiné : bouton vert « Écris-nous sur
  WhatsApp » avec une simple bulle, jamais le logo officiel.
- **Format** : 1080 × 1920, 30 i/s, H.264 + AAC, < 30 Mo (encodage final en
  deux passes, `outils/encoder_deux_passes.py`). Durée : celle de la voix
  (épisode 1 ≈ 1 min, épisode 2 ≈ 2 min 46).

## Structure d'un épisode

1. **Pas de carton d'ouverture** : la vidéo commence directement sur le
   personnage qui parle. Le **titre de l'épisode est en surimpression** sur
   l'écran pendant les 2 premières secondes (`commun/TitreSurimpression.tsx` :
   « <format> · Épisode n » + titre). L'image 0 sert de miniature TikTok : elle
   doit être lisible seule (titre complet, personnage visible).
2. **Scène** : le double parle, l'écran montre la démonstration, logo discret
   en haut à gauche, sous-titres. Le temps de la vidéo est celui de la voix.
3. **Carton de fin 3,6 s** (`commun/CartonFin.tsx`) : logo, « Consultation
   gratuite », « Lien dans la bio ».

## Organisation

```
serie-animee/
  CLAUDE.md                ce fichier
  src/theme.ts             palette, mise en page, zone sûre, règles de son
  src/commun/              tout ce qui est réutilisable d'un épisode à l'autre
    animationDouble.ts     gestes, expressions, clignements, respiration, tête
    Ecran.tsx              cadre de l'écran, cases R/T/C/F, lignes de formule
    SousTitresVoix.tsx     sous-titres synchronisés, mots-clés en couleur
    TitreSurimpression.tsx, CartonFin.tsx, LogoCoin.tsx, sons.tsx, mots.ts, temps.ts
  src/v2d/                 personnage (Double2D.tsx), décor, scène
  src/episodes/epNN/       scenario.ts, EcranEpNN.tsx, EpisodeNN.tsx, ecran.json
                           (montage de l'enregistrement d'écran), mots.json,
                           bouche.json, visemes.json (générés)
  episodes/epNN/           texte.txt (texte prévu), corrections.json, sources.json
  public/marque/logo.jpg   logo
  public/episodes/epNN/    voix.m4a (source) ; voix.wav, ecran.mp4 et
                           ecran-*.mp4 (hors dépôt : sources lourdes ou générés)
  public/serie/            musique et effets (générés, hors dépôt)
  outils/                  transcrire, aligner, audio (voix, rhubarb, série), monter_ecran,
                           apercu_ecran, finaliser, verifier_bouche, planche
  apercus/                 planches validées du personnage
  rendus/                  vidéos finales
```

## Le personnage : comment l'animer

Tout est fonction du temps (une image se calcule seule) :

- `etatDouble(t, GESTES, EXPRESSIONS, bouche, fps)` donne l'état complet.
- **Gestes** (`EtapeGeste`) : `repos` (mains posées), `explique` (mains
  ouvertes), `designe` (bras plié vers le haut, index vers l'écran), `compte`
  avec `doigts` 1 à 4, `bras-croises`. Transitions de 0,38 s, toujours douces,
  même si une transition commence avant la fin de la précédente.
- **Expressions** (`EtapeExpression`) : `neutre` (léger sourire), `parle`,
  `grimace`, `sourire`, `surpris` ; fondu de 0,25 s, bouches en fondu enchaîné.
- **Vie permanente** : clignement toutes les 3 à 5 s, respiration (période
  4,2 s), petits mouvements de tête plus marqués quand il parle.
- **Bouche synchronisée sur les sons prononcés** avec **Rhubarb Lip Sync**
  (gratuit, GitHub DanielSWolf/rhubarb-lip-sync, v1.13.0) en **mode
  phonétique** (`-r phonetic`, indépendant de la langue). Neuf formes dessinées
  (`BoucheViseme` dans `v2d/Double2D.tsx`) : X repos (léger sourire), A lèvres
  fermées (m, b, p), B entrouverte dents serrées, C ouverte, D grande ouverte,
  E arrondie, F lèvres en avant (ou, o), G dents sur la lèvre (f, v), H langue
  relevée (l). Conversion par `outils/audio.py rhubarb` : les repères de
  Rhubarb arrivent déjà ≈ 2 images avant le son, on les retarde d'une image
  pour garder **exactement une image d'avance** ; bouche forcée au repos dans
  les silences (Rhubarb y laisse souvent B). Pendant le grand sourire, les
  formes gardent les coins relevés ; la grimace garde sa bouche asymétrique.
- L'énergie de la voix (`bouche.json`) ne sert plus qu'aux mouvements de tête.

Conventions de mise en scène reprises de l'épisode 1 :
- il **compte sur ses doigts** quand il énumère ;
- il **désigne l'écran** pendant qu'une ligne s'y écrit ;
- **grimace** sur ce qui est raté, **grand sourire** sur le bon résultat ;
- **mains ouvertes** sur la phrase finale (appel à réserver).

## L'écran

- Zone fixe `MISE_EN_PAGE.ecran` (x 110, y 240, 860 × 600).
- **Démonstrations réelles = enregistrement d'écran du téléphone** (ChatGPT),
  monté par `outils/monter_ecran.py` d'après `src/episodes/epNN/ecran.json` :
  - segments en temps de voix : chaque passage est **accéléré** (attente,
    saisie, envoi) ou figé pour **suivre le rythme de la voix** ; la demande
    s'écrit pendant que la phrase est dite, la réponse s'écrit ensuite ;
  - **recadrage** : jamais la barre d'état du haut (heure, chronomètre rouge
    de l'enregistreur), jamais le clavier, jamais le presse-papiers ni les
    notifications (ces passages ne sont pas utilisés) ;
  - **zoom** : fenêtre de 940 px de large dans l'image 1080 → texte de
    ChatGPT ≈ 40 px dans la vidéo ; gros plan ×1,35 sur la zone de saisie
    pendant la frappe ; panoramique vertical doux pendant que la réponse s'écrit ;
  - par-dessus : croix rouge « Banal » sur le texte raté, coche verte et
    étoiles sur la bonne réponse.
  - `outils/apercu_ecran.py` montre le cadrage à la taille réelle avant le rendu.
- Parties dessinées (formule, rappel, appel) : barre de titre avec l'étoile du
  logo et un titre propre à la série (« La formule », « À retenir »,
  « Lomé IA School ») ; les grandes lettres R, T, C, F animées restent dessinées.
- Texte ≥ 36 px (lisible sur téléphone). Hauteur calée sur l'état le plus
  chargé : pas de vide, pas de débordement.
- Le texte cité **s'écrit lettre par lettre au rythme de la voix**
  (`texteTape`) ; le reste de la ligne est réservé (transparent) pour que la
  mise en page ne saute pas.
- Changement de phase : fondu + glissement de 0,3 s, avec un souffle.

## Épisodes à captures (modèle de l'épisode 2)

- **Plan de montage** écrit en Python (`episodes/epNN/plans.py` → `src/episodes/epNN/plans.json`) :
  un plan par phrase, **changement de plan au plus toutes les 4 s**. Modes :
  `personnage` (capture ou panneau sur l'écran du décor), `proche` (scène
  recadrée sur lui), `grand` (personnage en grand, sans capture, pour la
  morale), `plein` (capture en plein écran), `carte` (carte de fin pendant
  l'appel à l'action, qui pulse sur « consultation gratuite » et « lien »).
- **Découpe** par `outils/plans.py` : instants source étirés ou figés, cadre,
  flous fixes (adresse e-mail, nom du compte, photo de profil) et flou qui
  suit le défilement (`flou_sous`, ex. liste des formations et prix).
  Contrôle avec `outils/planche_plans.py` (première et dernière image de
  chaque plan) **avant** le rendu.
- **Plein écran dans la zone sûre TikTok** : rien d'important dans les 10 %
  du haut, les 20 % du bas ni les 12 % de droite ; la capture occupe
  x 100–944, y 200–1340, les sous-titres passent dessous ; le logo descend à
  y 198 (`LogoCoin position`). Zoom doux (`zoom` [début, fin], `foyer`) et
  cadre doré (`surligne`) sur ce dont parle la voix.
- **Confidentialité, à vérifier sur chaque image** : jamais de barre d'état,
  de compteur d'enregistrement, de clavier, de presse-papiers, de
  notifications, d'adresse e-mail, de lien « Administration », de liste de
  dépôts GitHub, de nom de compte ; en cas de doute, couper le plan. Plages
  interdites notées dans `episodes/epNN/sources.json`.
- Le son des captures n'est **jamais** repris (`-an`).
- **Musique** : 16 LU sous la voix quand le personnage est à l'image, 10 LU
  sous la voix en plein écran et sur la carte de fin (gains calculés depuis
  les niveaux mesurés de la voix et de la musique, transition de 0,25 s).
- **Transcription** : `large-v3-turbo` avec glossaire (`episodes/epNN/glossaire.json`),
  puis texte corrigé (`texte.txt`) aligné ; la narration des captures est
  transcrite seulement pour repérer les plans. Sous-titres exportés en SRT.

## Montage dynamique (épisode 2, version validée)

- **Voix resserrée** (`outils/voix_dynamique.py`) : respirations et silences de
  plus de 0,25 s ramenés à 0,25 s (masque d'énergie), tempo × 1,08 sans changer
  la hauteur (atempo) ; temps des mots recalculés ; Rhubarb refait ensuite.
  Vérification : retranscrire la nouvelle voix et la comparer à l'ancienne
  (≥ 98 % de mots identiques).
- **Séquence** écrite en Python (`episodes/ep02/montage.py` → `sequence.json`) :
  temps forts calés sur les mots, partagés en plans de 0,9 à 2,5 s (le script
  refuse un plan plus long). Types : `P` personnage (large, moyen, gros ;
  zooms brusques sur les mots forts ; gros texte animé), `T` capture dans un
  **téléphone animé** (72 % de la largeur, glisse, s'incline, zoome sur la zone
  dont parle la voix, icône de fonction qui surgit puis se range), `I`
  illustration animée plein écran (`ep02/illustrations.tsx`, icônes génériques
  de `ep02/icones.tsx`), `CARTE`.
- **Personnage en médaillon** (bas gauche, au-dessus des sous-titres) pendant
  les captures et les illustrations ; **barre des 5 étapes** sous la zone
  interdite du haut pendant toute la méthode.
- **Sous-titres mot par mot** (`SousTitresMot`) : mot prononcé surligné,
  mots-clés en jaune, plus gros, avec un « pop ».
- **Bruitages discrets** : whoosh aux changements de type de plan, pop sur
  les icônes, ding sur les coches, clavier sur la recherche, pièces sur la
  commission, décollage sur la fusée, tampon sur « EN LIGNE ».
- **Musique énergique** générée (`musique-energie.wav`, 118 battements par
  minute) : 16 LU sous la voix sur le personnage, 10 LU sous la voix en plein
  écran (captures, illustrations, carte).
- **Carte de fin avec contacts** (`commun/CarteContacts.tsx`) : logo animé,
  slogan « Maîtrisez l'IA et transformez vos compétences en opportunités »,
  bouton « Consultation gratuite » qui pulse, icône téléphone et les numéros
  +228 72 24 02 31 et +228 79 16 23 90 (un par un, pop et ding), « Lien dans
  la bio » avec flèche. Prolongée de 4 s après la voix (musique seule). Vérifier
  chaque chiffre des numéros sur l'image finale (reconnaissance de texte).
- **Confidentialité vérifiée par reconnaissance de texte** : analyse de toute
  la capture (`outils/chercher_texte.py`, une image toutes les 0,5 s), puis
  `outils/verifier_confidentialite.py` sur chaque extrait utilisé, et une
  image par seconde sur la vidéo finale. Les prix du site en ligne sont
  publics et restent visibles ; la liste des anciens prix du prompt
  (capture ≈ 151 s, suivie des coordonnées) n'est jamais utilisée.
- **Validation** : rendre d'abord les 25 premières secondes et attendre
  l'accord avant le rendu complet.

## Sous-titres

Repris du **texte prévu** (orthographe juste), horodatés par la voix. Blocs de
4 mots / 35 caractères / 2,4 s au plus, coupure aux fins de phrase et aux
pauses > 0,45 s. **Ne jamais couper un groupe au milieu d'une expression**
(« une publicité prête à » / « publier » est interdit) : aucun bloc ne finit
sur un petit mot (à, de, la, une, pour, mais…), et chaque épisode déclare ses
expressions à garder entières (`LIAISONS` dans scenario.ts, indices de mots) ;
le bloc s'allonge plutôt que de couper. Police 78 px, contour épais, bas des sous-titres à 1500 px
(zone sûre : rien d'important sous 78 % de la hauteur). Mots-clés : or
(notions clés), violet (marque, « quatre lettres »), rouge (le raté).

## Son (règles de la chaîne de montage)

- **-14 LUFS** intégré, **pic vrai ≤ -1,5 dBTP**, LRA 11, tolérance 0,3 LU ;
  mesure du fichier rendu et correction par gain constant (+ limiteur si
  besoin). AAC 192 kb/s, 48 kHz, stéréo. → `outils/finaliser.py`
- Musique douce **générée** (aucun droit), présente à l'ouverture et au carton
  de fin (0,32), baissée sous la voix (≈ 0,11, soit environ -18 dB), un peu
  remontée dans les pauses, fondu final.
- Effets générés : souffle, pop, clic de clavier, erreur, succès, lettre,
  rassemblement, fin. Pas d'effet sous les premiers mots (la voix commence
  à 0,2 s). Voix à 0,8 dans Remotion pour garder de la
  marge : **aucun échantillon écrêté** dans le rendu brut.

## Nouvel épisode : la marche à suivre

Prérequis : Node 22, ffmpeg, Chromium headless
(`/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`),
un environnement Python avec `faster-whisper>=1.1`, `numpy` et `pillow` (ici :
`$SP/venv`, où `SP` est le dossier de travail de la session), et Rhubarb Lip
Sync (`https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.zip`,
à décompresser dans `$SP/rhubarb`). Sources : `episodes/epNN/sources.json`
(identifiants Google Drive).

```bash
cd serie-animee && npm install
H=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
# 0. sons de la série (une fois)
$SP/venv/bin/python -I outils/audio.py serie public/serie
# 1. déposer la voix et le texte prévu
#    public/episodes/epNN/voix.m4a  et  episodes/epNN/texte.txt
# 2. transcription horodatée (modèle medium, texte prévu en indice)
$SP/venv/bin/python -I outils/transcrire.py public/episodes/epNN/voix.m4a sorties/epNN/transcription.json episodes/epNN/texte.txt medium
# 3. découper la voix (début/fin de parole), énergie par image, formes de bouche
$SP/venv/bin/python -I outils/audio.py voix public/episodes/epNN/voix.m4a DEBUT FIN public/episodes/epNN/voix.wav src/episodes/epNN/bouche.json
$SP/rhubarb/Rhubarb-Lip-Sync-1.13.0-Linux/rhubarb -r phonetic -f json -o sorties/epNN/rhubarb.json public/episodes/epNN/voix.wav
python3 -I outils/audio.py rhubarb sorties/epNN/rhubarb.json src/episodes/epNN/bouche.json src/episodes/epNN/visemes.json
# 4. aligner le texte prévu (vérifier les mots à durée nulle ; corriger
#    à la main dans episodes/epNN/corrections.json d'après l'énergie du son)
python3 -I outils/aligner.py episodes/epNN/texte.txt sorties/epNN/transcription.json DEBUT src/episodes/epNN/mots.json "Merci." episodes/epNN/corrections.json
# 5. enregistrement d'écran : repérer les instants (images à 4 i/s), écrire
#    src/episodes/epNN/ecran.json (segments + cadrage), monter, vérifier le cadrage
python3 -I outils/monter_ecran.py public/episodes/epNN/ecran.mp4 src/episodes/epNN/ecran.json public/episodes/epNN
$SP/venv/bin/python -I outils/apercu_ecran.py src/episodes/epNN/ecran.json public/episodes/epNN sorties/epNN/apercu-ecran.png T1 T2 …
# 6. écrire scenario.ts (gestes, expressions, moments, LIAISONS, mots-clés), l'écran et la composition
# 7. images fixes aux moments clés, puis rendu
npx remotion bundle src/index.ts --out-dir sorties/bundle
npx remotion still sorties/bundle EpisodeNN sorties/epNN/k.png --frame=N --browser-executable=$H
npx remotion render sorties/bundle EpisodeNN sorties/epNN/brut.mp4 --browser-executable=$H --concurrency=4 --crf=20 --audio-codec=aac --audio-bitrate=192k
# 8. son final et contrôles (exclure les plages de grimace du contrôle de bouche)
python3 -I outils/finaliser.py sorties/epNN/brut.mp4 rendus/episodeNN.mp4
$SP/venv/bin/python -I outils/verifier_bouche.py rendus/episodeNN.mp4 src/episodes/epNN/visemes.json DEBUT_VOIX FIN_VOIX [GRIMACE_DEBUT GRIMACE_FIN]
```

Le rendu complet prend environ 1 min 30 à 2 min (4 cœurs, rendu logiciel).

## Vérifications obligatoires avant d'envoyer une vidéo

1. **Une image toutes les 2 s** (`ffmpeg … select='not(mod(n\,60))'` puis
   `outils/planche.py`) : rien de vide, rien qui se chevauche, gestes et
   expressions au bon moment, image 0 lisible (miniature).
2. **Bouche** (`outils/verifier_bouche.py`) : (1) rendu fidèle aux formes
   prévues, meilleur décalage 0 ; (2) formes prévues / énergie de la voix,
   meilleur décalage +1 (ou +2) image ; bouche fermée dans la plupart des
   silences et rarement quand la voix est forte (épisode 1 : 0 ; +1 image,
   corrélation 0,46 ; fermée 78 % des silences, 10 % voix forte). Regarder
   aussi une bande de 30 images de la bouche (`tile=10x3`).
3. **Texte de l'enregistrement d'écran** lisible à pleine résolution (≈ 40 px),
   ni barre d'état, ni clavier, ni presse-papiers à l'image.
4. **Son** : -14 LUFS ± 0,3, pic vrai ≤ -1,5 dBTP (affiché par
   `finaliser.py`), aucun échantillon écrêté dans le brut.
5. **Taille** < 30 Mo (deux passes) ; signaler si le texte des captures devient flou.
6. Envoyer la vidéo avec la **liste honnête de ce qui reste imparfait**.

## Méthode de travail

Toujours montrer des images fixes (personnage, décor, nouvelles poses) et
attendre l'accord avant d'animer. Dire franchement ce qui pose problème.

## Vidéo Talkami (composition `Talkami`, `src/talkami/`)

Copie du projet de la série (branche `claude/episode-02` du dépôt `montage-videos`) pour la vidéo de
démonstration de Talkami (voix off seule, 183,5 s + carte de 4 s). Même identité que l'épisode 2 :
fond violet, double en médaillon, logo, barre des 5 étapes (ici la séance : Évaluation, Leçon,
Pratique, Conversation, Bilan), sous-titres mot par mot, carte « Consultation gratuite ».

- Voix : `projets/talkami/voix_nettoyee.wav` (scripts/voix.py du dépôt principal) → `public/talkami/voix.wav`,
  `outils/audio.py voix` (stéréo + énergie), Rhubarb → `src/talkami/visemes.json`.
- Texte prévu : `episodes/talkami/texte.txt` (ce qui est dit, orthographe juste), aligné par `outils/aligner.py`
  sur `projets/talkami/transcription_brute.json` → `src/talkami/mots.json`.
- Montage : `episodes/talkami/montage.py` → `src/talkami/sequence.json` et `plans.json` (temps forts repérés par
  des suites de mots, plus d'indices) ; extraits découpés par `outils/plans.py` dans `public/talkami/plans/`
  depuis `projets/talkami/ecrans.mp4` (lien symbolique `public/talkami/ecrans.mp4` le temps de la découpe, à
  retirer avant le bundle : sinon 138 Mo copiés).
- Illustrations : `src/talkami/illustrations.tsx` (reprennent `Fond`, `Svg`, `Croix`, `Etape` de l'épisode 2) ;
  instants des mots dans `TEMPS` (`src/talkami/scenario.ts`) ; vérifier chaque phrase repère avant le bundle
  (une phrase introuvable fait échouer tout le rendu).
- Bruitages : Mixkit (licence libre, crédits dans `projets/talkami/credits.md`), découpés et normalisés en crête
  dans `public/talkami/sfx/x_*.wav` ; `PIC` = délai entre le début du fichier et son impact, pour que l'impact
  tombe sur l'image. Un seul effet par fenêtre de 0,25 s (priorités dans `Talkami.tsx`).
- Musique : `sons/musique_defaut.m4a` de Joseph (−8 LUFS) en boucle (fondu enchaîné 1,5 s) : 16 LU sous la voix
  sur le personnage, 13 LU sur captures et illustrations, 10 LU sur la carte.
- Paiements : seulement `projets/talkami/paiements_floutes.png` (capture floutée) ; montants et dates relevés sur
  la capture (`ALERTES`), jamais modifiés.
- Emojis interdits dans les dessins : le navigateur de rendu n'a pas de police emoji.
- Rendu : `npx remotion render sorties/bundle Talkami …`, puis `outils/finaliser.py` et
  `outils/encoder_deux_passes.py … 60`.

## Vidéo Talkami, version 3 (composition `Talkami3`, `src/talkami3/`)

La version 2 validée (composition `Talkami`, `src/talkami/`, commit 0d4d190) reste intacte : version de secours.
La v3 en est une copie avec :
- voix resserrée par `outils/voix_dynamique.py` (pauses ≤ 0,2 s ; tempo × 1,06, sauf le passage « Ici, les formules
  … capture d'écran », déjà rapide, laissé à × 1,0), puis présence et chaleur (+1,5 dB à 170 Hz, −1,5 dB à 380 Hz,
  +2,5 dB à 3 kHz, aigus +1,5 dB, dé-esseur, compression 3:1) et −14 LUFS → `public/talkami3/voix.wav` ; temps des
  mots recalculés (`src/talkami3/mots.json`), vérifiés par retranscription (écart médian ≤ 0,015 s) ;
- transition d'entrée sur chaque plan (zoom flouté, glissé entre deux plans du même type, éclair blanc sur les
  révélations), pulsation des illustrations sur les mots clés, réactions en émojis 3D Fluent (MIT, `REACTIONS` dans
  `scenario.ts`, `public/talkami3/emoji/`), gros textes en plus sur les plans du personnage, boucle ouverte dans
  l'accroche (« Reste : je montre mes vrais paiements »), musique coupée 0,5 s avant les deux révélations puis montée
  et impact pile sur le mot.
