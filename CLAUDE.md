# Montage vidéo — mode d'emploi pour Claude

Le propriétaire travaille **uniquement depuis son téléphone**. Réponses courtes, en français,
fichiers envoyés directement (vidéo finale, extraits). Ne construis rien qu'il n'a pas demandé.

## Deux modèles au choix (demander lequel à chaque nouvelle vidéo)

- **Modèle classique** (par défaut) : tout ce qui suit dans « Style (fixé) ».
- **Style dynamique** (`"_style": "dynamique"` et section `dynamique` dans `montage.json`, exemple :
  `projets/ia-competence/`), inspiré d'une vidéo CapCut de Joseph, **sans aucun élément CapCut** (ni logo,
  ni filigrane, ni autocollant) :
  - **cadrage serré** : zoom de base de 35 % (`cadrage` : `echelle` 1,35, `decalage` 0, `x`/`y` = coin du recadrage),
    yeux vers 35 % de la hauteur (~670–730 px), tête jamais coupée, mains visibles quand il fait des gestes ;
    l'alternance de zoom de 11 % reste par-dessus (`visage` = centre du zoom, sur les yeux). Vérifier sur une image
    de `public/<projet>/video.mp4` avec une ligne tracée à 672 px ;
  - sous-titres **un mot à la fois, deux au plus**, **taille unique 120 px** ; réduite seulement pour un mot de plus
    de 12 lettres trop large, jamais sous 75 % (90 px) ; **jamais resserrés en largeur** : deux mots trop larges
    passent sur deux lignes (bas toujours dans la zone sûre) ; **jamais un mot de 3 lettres ou moins seul** (DE, ET,
    UNE, LA, À…) : il s'affiche avec le mot suivant (« DE FAÇON »), ou avec le précédent s'il finit la phrase ou
    précède un passage caché (« CONTACTER AU ») ; un nombre en morceaux (« 15 » « 000 ») est réuni ; **bleu vif
    #1E5BFF à contour blanc épais**, sur le bas du buste (1 330 px) ; **rebond : le mot arrive à 110 % et se pose
    en 3 images, jamais plus petit que sa taille** (`src/dynamique/SousTitresMot.tsx`) ; masqués pendant le titre
    géant, les plein écran, les cartons noirs, les mots dorés et le numéro ;
  - **coupes** : fondu enchaîné de la voix de 35 ms centré sur chaque coupe (`"fonduCoupe": 0.035`, sans changer la
    durée) ; chaque coupe tombe soit sur une transition, soit sur un **changement de cadrage instantané** pile sur
    l'image de la coupe (`raccords` dans les props ; aucun autre changement de plan à moins de 1,2 s) ;
  - **transitions** aux raccords de coupe (sinon aux débuts de phrase), toutes les 7 à 11 s, en rotation pour ne
    jamais répéter deux fois la même : flou rapide, bascule 3D, coup de zoom, image dans l'image à cadre blanc
    incliné (`src/dynamique/Transitions.tsx`) ; jamais à moins de 0,4 s d'un autre événement ;
  - **autocollants dessinés** (interrogation, flamme, éclair, ampoule, billets, billets barrés, coche, croix) à côté
    de la tête (280 px), 1,6 s, rebond + balancement (`src/dynamique/Autocollants.tsx`), ancrés sur un mot (`a`) ;
    le point d'interrogation = trois « ? » épais noirs à contour blanc, de tailles et d'inclinaisons différentes ;
  - **cartons noirs** d'annonce de partie (1,5 s, texte blanc mot par mot dans un cadre à crochets, la voix
    continue dessous) ;
  - **mots et chiffres dorés** lumineux, **à la place du sous-titre** (même hauteur, sous-titre masqué), en grand
    (160 px max sur une ligne, 115 px sur deux ; `\n` pour couper), **1,5 s au plus** ; jamais un chiffre non
    vérifié ; marques en texte seulement, sans logo ;
    un doré ou un autocollant qui tomberait sous un carton noir apparaît 2 images après sa fin, et un doré
    s'arrête 2 images avant le suivant (jamais deux à la fois) ;
  - **numéro de téléphone** seul (sans « AU »), en grand, à la place du sous-titre, bleu à contour blanc, chiffre
    par chiffre ;
  - **scènes illustrées animées** en écran partagé (voir « Bibliothèque des scènes illustrées ») ; un doré ou un
    autocollant qui tombe pendant une scène est retiré, aucune transition à moins de 1 s d'une scène ;
  - insertions d'images/vidéos de Joseph en plein écran avec léger zoom, et couverture de livre en 3D : à prévoir
    quand il en fournit (pas encore construit) ;
  - gardés du modèle classique : ouverture percutante, zone sûre, musique, niveaux, carton de fin, 1080 × 1920,
    plein écran `focus` (ex. « 100 % GRATUIT ») ;
  - son : `transition` (souffle + petit impact, calé pour culminer sur la coupe) et `autocollant` (« pop ») ;
    croix/coche gardent leurs sons ; doré et numéro = `info` ; carton noir = `plein_ecran`.

## Bibliothèque des scènes illustrées (style dynamique)

Scènes de 3 à 6 s, **jamais plus de 6 s** (`DUREE_SCENE_MAX` dans `scripts/preparer.py`), en **écran partagé** :
illustration animée en haut (1080 × 900) sur un dégradé coloré qui bouge (taches de lumière, particules), puis un
**bandeau sombre semi-transparent** (900–1 035 px) qui porte les sous-titres (une ligne, 100 px, réduite jusqu'à
75 px, deux lignes de 62 px en dernier recours), puis le visage (l'image glisse de 560 px vers le bas : haut des
cheveux vers 1 063 px avec le zoom de 11 %, jamais coupé par le bandeau). Liseré lumineux entre l'illustration et
le bandeau. Entrée/sortie : le panneau descend du haut en 8 images. Deux scènes à moins de 0,8 s d'écart
s'enchaînent (la seconde descend par-dessus la première, le visage reste en bas). Dessins SVG détaillés, colorés,
toujours en mouvement (pas d'icônes plates), **grands** (ils remplissent la zone), contenu entre x 50–950 et
y 200–880, chaque élément apparaît sur son mot ; **textes gros** (≥ 42 px dans un écran de téléphone, 66–90 px pour
les titres, `Gros` à contour épais). Son d'entrée `plein_ecran` (souffle + impact, le même pour toutes), puis un son
par étape (`croix`, `coche`, `autocollant` = pop, `panneau`, `info` = compteur).

Dans `montage.json` → `dynamique.illustrations` : `{"type", "a": mot de départ, "decalage": s, "duree": s,
"fond": bleu|violet|orange|nuit|vert|rose, "etapes": [mots clés], "sons": [un son ou null par étape]}`.
Les étapes sont les mots où l'animation change (calées sur la voix). Une scène qui tomberait sous un carton noir
démarre juste après lui. Code : `src/dynamique/Illustrations.tsx` (cadre, bandeau), `src/dynamique/scenes/` (dessins,
registre dans `index.ts`, outils communs dans `outils.tsx` : `pop`, `prog`, `Marque` croix/coche, `Personne`,
`Gros`, `Telephone`, `Confettis`, `Pastille`).

| Type | Idée | Étapes |
|---|---|---|
| `etudes` | grande pile de livres + grand calendrier dont les pages s'envolent doucement en arc, puis horloge qui s'emballe et une personne à son ordinateur, « EN UN BREF TEMPS » | calendrier, horloge |
| `equipe` | cinq spécialistes (CODE, DATA, DESIGN, PUB, VIDÉO) avec leurs outils, qui fusionnent en une seule grande personne à éclair, outils en orbite, « 1 SEULE PERSONNE » | outils, fusion |
| `telephone` | grand téléphone (écran d'accueil, appli IA qui pulse) + trois grands « ? » ; un doigt touche l'appli, la discussion s'ouvre, « APPLI IA » | toucher |
| `reponses` | grand téléphone : « Aide-moi » → réponse grise floue, croix ; écran vidé ; « Écris 3 idées de posts pour ma boutique » → réponse nette en 3 lignes, coche ; étiquettes 76 px à droite | croix, écran vidé, coche |
| `creations` | 4 écrans qui se construisent : page web qui s'assemble, application, robot qui salue, engrenages reliés | un par écran |
| `licenciements` | compteur 0 → 15 000 (marque en texte), silhouettes qui rougissent et tombent | chiffre atteint |
| `remplace` | « VOUS » à son bureau ; il grisonne et sort, tampon « REMPLACÉ », chaise qui tourne ; un jeune à éclair « IA » s'assoit, l'écran s'allume, « IL MAÎTRISE L'IA » | remplacé, arrivée |
| `gratuit` | « PAS D'ARGENT ? », billets barrés d'un trait rouge ; les billets s'envolent, « 100 % GRATUIT » éclate en confettis devant des rayons | éclatement |
| `rendezvous` | calendrier « SAMEDI 10 OCTOBRE », carte avec repère « ADIDOGOMÉ / LYCÉE MODERNE 2 », puis cartes « SOIRÉE 18H – 20H » et « JOURNÉE 9H – 17H » | 18h, 9h |
| `enligne` | badge « EN DIRECT », globe qui tourne ; ordinateur avec grille de visioconférence, « GOOGLE MEET » en texte (sans logo) ; arcs entre pays, « PARTOUT » | visio, arcs |
| `inscription` | grand téléphone (formulaire, compte confirmé, groupe de discussion) + trois cartes d'étapes qui se cochent | créer, confirmer, rejoindre |
| `unTelephone` | « UN SEUL TÉLÉPHONE » d'où sortent site web, appli, robot IA, automate ; « N'IMPORTE QUOI ! » | trois sorties |

Contrôle des scènes : `npx remotion bundle src/index.ts --out-dir <dossier>`, puis
`node scripts/images.mjs <dossier> public/<projet>/props.json <sortie> <images>` (une image au début, une après
chaque étape, une à la fin). Aperçu animé : rendre chaque passage avec `npx remotion render … --frames=a-b --muted`,
y poser le morceau correspondant de `public/<projet>/mix.wav`, puis les enchaîner.
- **Rythme** : jamais plus de 12 s sans événement visuel (scène, transition, doré, autocollant, carton) ; à vérifier
  sur `props.json` après `preparer.py`.

## Publicités (composition `PubTalkami3` = la v1 `PubTalkami` optimisée ; la v2 violette `PubTalkami2` est abandonnée)

Version finale (v3) : style bleu de la v1, **bande fixe de sous-titres en bas** (1 300 → 1 600 px, deux lignes vers
1 430 px, jamais sur un écran ni un visage), **téléphones géants** (écran à 80 %, qui glissent et zooment derrière la
bande), professeurs **cadrés serré** sur le visage (`VISAGES` dans `src/pub/PubTalkami3.tsx`), aucun plan immobile,
emojis animés Noto (lottie, CC BY 4.0), fin animée de 2,5 s au plus. Voix : `scripts/voix_pub3.py` (naturelle / radio).

Ancienne description (v1) :

Publicité courte (~29 s) montée à partir d'un kit d'images et d'une voix off, sans visage filmé : projet
`projets/talkami-pub/` (kit copié dans `pub-kit/`, plan de montage dans `plan.json`, sources et licences dans
`SOURCES_ET_LICENCES.md`). `python3 scripts/pub_talkami.py` copie le kit dans `public/talkami-pub/`, écrit les props,
traite la voix (débruitage doux, chaleur 180 Hz, clarté 3,3 kHz, désesseur, compression 3:1), compose la musique
(synthèse, Sol mineur, 116 BPM, entrée du groupe sur le logo), place les effets et mixe à −14 LUFS (musique 16 LU sous
la voix, +6 dB dans les respirations). Rendu : `npx remotion render src/index.ts PubTalkami … --muted`, puis ajouter
`public/talkami-pub/mix.wav`. Zone sûre commune Facebook / Instagram / TikTok : rien au-dessus de 270 px, sous
1 270 px ni à droite de 950 px ; sous-titres au **texte exact** de Joseph (pas la transcription), centrés sur x 500
vers 1 165 px, mots clés en orange. Jamais « intelligence artificielle », ni fausse promesse, ni faux témoignage.

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
   - Si le script est un résumé (pas mot pour mot), seuls les passages courts (≤ 3 mots) sont corrigés
     automatiquement ; le reste est gardé tel qu'il est dit et signalé.
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
- **Prise filmée de loin (visage haut dans l'image)** : mesurer le visage (détecteur OpenCV, `haarcascade_frontalface`)
  sur toute la prise. Si le haut de la tête passe au-dessus de ~540 px, les panneaux le couvriraient : **recadrer**
  avec `cadrage` dans `montage.json` (`echelle` 1,2–1,25, `decalage` vers le bas, `x` pour centrer le visage,
  `visage` = nouveau centre du zoom) à partir d'un instant (`apres`). L'image ne peut pas descendre sans zoom plus
  fort : la bande libérée en haut (≈ 230 px) est remplie par l'image floutée, presque entièrement sous les 10 %
  du haut que TikTok recouvre. Vérifier ensuite sur le rendu : haut des cheveux sous le bas des panneaux (520 px,
  zoom de panneau compris), menton au-dessus des sous-titres (1 296 px). Garder le cadre large tant qu'il faut voir
  un objet montré (ex. une tablette) ; `visage` (racine) = centre du zoom en cadre large.
- **Preuve / extrait inséré** (`preuve` dans `montage.json`) : extrait d'une autre vidéo en plein écran à la place
  d'un passage coupé (`coupes`), étiquette jaune qui claque, souffle + impact à l'entrée, son de l'extrait baissé
  (`gainDb`), notre musique coupée pendant l'extrait (il a déjà la sienne) ; pas de zoom ni de dégradé dessus.
  Le titre d'accroche peut alors disparaître avant l'extrait (`banniere: false`, `geant` = `duree`).
- **Coupes de mots** (`couperMots`) : « ok ? » en fin de phrase, « donc » répétés en début de phrase, seulement
  quand la coupe est propre (vraie pause, ≤ −38 dB, des deux côtés). Les horodatages de Whisper sont souvent en
  avance de 0,1–0,3 s : vérifier sur le niveau sonore et retranscrire la zone avec 8 s de contexte, puis donner les
  points de coupe vérifiés (`"coupe": [début, fin]`). Sinon, garder le mot et le signaler.
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

## Version longue (avec carton de transition)

`python3 scripts/version_longue.py <projet> <fichier>` : la vidéo montée sans son carton de fin, puis le
**carton de transition** de 3 s, puis l'autre vidéo telle quelle, **coupée avant son écran noir final** (logo
CapCut… détecté automatiquement) pour finir sur son carton Lomé IA School, avec un fondu de sortie de 0,8 s.
Chaque partie ramenée à −14 LUFS par un gain fixe, limiteur de crête, 720 × 1280, moins de 30 Mo.

**Carton de transition** (composition Remotion `Transition`, `src/Transition.tsx`, 90 images, textes dans
`TEXTES` du script, réutilisable) :
- entrée par un balayage en biais (7 images) par-dessus la dernière image de la vidéo précédente ;
- fond bleu nuit animé ; « ET MAINTENANT… » en jaune qui claque (image 9) ; « REGARDEZ / LA VIDÉO » en très grand,
  blanc à contour noir (image 36, avec l'impact) ; « MONTÉE À 100 % PAR L'IA » en noir sur bloc jaune (image 42) ;
  bouton de lecture jaune qui pulse avec un halo (image 48) ; hauteurs fixes 380 / 520 / 880 / 1 200 px ;
- sortie : coup de zoom avant dans le bouton (images 78–89), qui ouvre en cercle sur la première image de la vidéo
  suivante ;
- son : la musique continue (−10 LU sous la voix), effet « carton » (montée 1,2 s, **impact pile à l'image 36**,
  ~−2 LU sous la voix), musique qui remonte à −6 LU après l'impact, souffle discret au zoom de sortie.

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
- OpenCV : installer `opencv-python-headless<5` (la version 5 n'a plus `CascadeClassifier`).
- Mesurer les saturations sur les canaux stéréo bruts, pas après conversion en mono (faux dépassements).
- Réseau : huggingface.co, drive.google.com et drive.usercontent.google.com doivent être autorisés
  dans l'environnement.
- Vidéos WhatsApp en basse résolution (464 × 832) : agrandies, donc un peu floues. Demander l'original.

## Organisation

- `scripts/` : téléchargement, transcription, correction, préparation, rendu.
- `projets/<projet>/` : script, `montage.json`, transcriptions, rapport (la vidéo source n'est pas versionnée).
- `src/` : composition Remotion `Montage` (props lues dans `public/<projet>/props.json`).
- `public/<projet>/`, `out/` : fichiers générés, non versionnés.

## Vidéo par e-mail (automatisation principale)

Joseph écrit à l'adresse de l'automatisation : texte (+ voix off en pièce jointe, + consignes éventuelles). Workflow
`.github/workflows/courriel.yml` (toutes les 10 min, GitHub Actions + Gemini, indépendant de Claude) :
`scripts/courriel_boite.py` relève la boîte, répond « ✅ Reçu, je commence », met la demande en file
(`projets/courriel/demandes/`) ; `scripts/courriel_preparer.py` prépare script et plan (Gemini) ; voix de Joseph si
fournie, **toujours retravaillée en voix radio** (`scripts/voix_radio.py` : nettoyage, timbre radio, énergie,
−14 LUFS, crêtes ≤ −1,5 dBTP, rythme intact) et **jamais coupée** : découpe contiguë aux instants calmes
(`VOIX_TRAITEE=1` dans `decouper_voix.py`), rien de rogné ni ajouté (`VOIX_CONTINUE=1` dans `test_auto.py`) ; vérifié
en retranscrivant le rendu (aucun mot perdu), sinon voix IA Gemini (Puck homme / Kore femme), **jamais sa voix clonée** ; rendu `VideoAuto` ; Release
`courriel-<id>` ; `scripts/courriel_livrer.py` renvoie la vidéo avec titre, description et hashtags. Une réponse à cet
e-mail = demande de correction, refaite et renvoyée.
- **Déclenchement** : la programmation de GitHub part ici avec des heures de retard ; le **veilleur**
  (`.github/workflows/veilleur.yml`) regarde la boîte toutes les 3 min (`courriel_boite.py regarder`, en-têtes seulement)
  et lance `courriel.yml` dès qu'un e-mail arrive ou qu'une demande est à reprendre ; il dure ~5 h 40 puis se relance
  lui-même (secours : programmation horaire). Gemini saturé (503) : nouveaux essais pendant 7 min, modèle Pro en
  préversion en secours, modèles retirés (404) écartés.
- **Montage (moteur `VideoAuto`)** : trois mises en page qui alternent à chaque phrase (`mise` dans le plan, sinon
  choisie d'après le type) — `plein` (illustration ou photo sur tout l'écran, poussée de caméra), `double` (le double en
  grand dans son studio, l'idée affichée sur le grand écran derrière lui), `partage` (illustration en haut, double en
  bas) ; jamais 3 fois de suite la même, le double en grand au moins toutes les 20 s, écran partagé pendant l'ouverture ;
  phrase de plus de 7 s coupée en plans de 3,5 s au moins qui changent de mise (`plans`) ;
  illustration entière sur l'écran du studio (jamais coupée) ; coup de zoom + éclair blanc à chaque changement, cadrage du double alterné à chaque phrase ; texte trop long coupé en
  deux lignes équilibrées (`Gros`).
- **Marque et fin** : logo Lomé IA School (`projets/marque/logo.jpg`, copié de la série animée) en haut à gauche
  pendant toute la vidéo ; carton de fin habituel de 4 s après la voix (logo qui flotte, « ABONNE-TOI / LIKE •
  PARTAGE », « Consultation gratuite », « Lien dans la bio », WhatsApp), effet `carton`.
- **Début et voix** : parole dès la première image (0,05 s avant le premier mot), silences de plus de 0,6 s ramenés
  à 0,35 s ; chaîne radio sans porte de bruit, compression lente, gain constant (mesuré : plus de « coupures »).
- **Images créées par l'IA** (`image_ia` dans `scripts/medias.py`) : pour chaque scène photo, image verticale
  créée d'après la phrase (clé `image` du plan, description en anglais écrite par Gemini) avec Cloudflare Workers AI
  (`flux-1-schnell` en premier : ~60 neurones par image, quota gratuit de 10 000 par jour ; `lucid-origin` en secours, trop cher : 4 images épuisaient le quota ; quota épuisé, code 4006 → banques d'images) ; secrets `CLOUDFLARE_ACCOUNT_ID`,
  `CLOUDFLARE_API_TOKEN` ; sans eux ou en cas d'échec, banques d'images. Relais texte quand Gemini est saturé :
  Groq (`GROQ_API_KEY`, `openai/gpt-oss-120b`, en-tête User-Agent obligatoire sinon 403).
  Ces 4 clés (Pixabay, Cloudflare ×2, Groq) sont **chiffrées dans `projets/courriel/cles.enc`** (AES-256, openssl
  `-pbkdf2 -iter 200000`) et ouvertes au lancement par le seul secret `CLES_MONTAGE` ; jamais de clé en clair dans
  le dépôt (public). Pour changer une clé : déchiffrer, modifier, rechiffrer avec la même phrase.
- **Photos** : tout texte incrusté (crédit, site, filigrane) flouté automatiquement (`flouter_textes`, Tesseract) ;
  ordre : Pexels (`PEXELS_API_KEY` ; nouvelles clés suspendues par Pexels en 11/2026), Pixabay (`PIXABAY_API_KEY`,
  gratuit, sans filigrane), Openverse/Flickr en dernier recours ; crédit jamais affiché sur l'image (crédits CC BY
  donnés dans l'e-mail de livraison).
- **Qualité du plan** (`QUALITE`, `verifier_plan`, `reparer` dans `scripts/courriel_preparer.py`, tirées des remarques
  de Joseph) : plan fait par paquets de 10 phrases (jamais de scène manquante) ; vérifications automatiques puis
  relecture Gemini (orthographe, textes trop longs, liste au bon nombre d'éléments, tous les outils cités affichés,
  numéro affiché quand il est dit, pas deux scènes identiques de suite, mises variées, pédagogie : chaque idée
  expliquée par un exemple montré, animation plutôt qu'une photo approximative) ; jamais de carte de secours
  au texte d'une autre phrase. Mode d'emploi : `projets/courriel/MODE-EMPLOI.md`. L'ancienne
automatisation quotidienne (`video-test.yml`) est gardée en lancement manuel.
