# Reprise — Formation partie 1 « Monter n'importe quelle vidéo avec l'IA » (branche `formation-partie1`)

À lire avec `CLAUDE.md` (racine) et `double-anime/CLAUDE.md`. Joseph travaille depuis son téléphone : réponses
courtes en français, fichiers envoyés directement.

## Décisions validées par Joseph (ne pas changer)

- **Voix radio** (`scripts/voix_radio.py`) : coupe-bas 80 Hz, débruitage léger, chaleur 200 Hz, présence 4 kHz,
  air 11 kHz, dé-esseur, compression douce, sans réverbération ; débit × 1,05 (rubberband, hauteur inchangée) ;
  pauses 0,4 s entre phrases, 0,7 s avant une étape ; musique 17 LU sous la voix (16 sur les pubs) ; mix −14 LUFS,
  crête vraie < −1 dBTP.
- **Double animé dans le studio de la série** (décor, bureau, fenêtre, plante, étagère : `double-anime/`, inchangé) ;
  le plan en cours se range dans l'écran du décor (`src/formation/DoubleFormation.tsx`). Mains posées sur le bureau au
  repos ; gestes calés sur leur mot puis retour au repos ; bouche Rhubarb sur la voix radio.
- Il apparaît : intro (cartes de texte 5–10, 21–22), carton « ÉTAPE n » (1,5 s, dit « Première étape »…),
  **première phrase des 3 pubs puis il sort (infos en taille normale)**, conclusion tant que le contenu tient dans
  l'écran. Jamais sur les cartes de choix ni sur les écrans filmés.
- **« À RETENIR »** : carton de 3 s, 3 points, à la fin de chaque étape (`retenir` dans `montage_formation.json`).
- Écrans filmés : repères jaunes (cercle/flèche) avec étiquette sur chaque bouton, actions à vitesse réelle, seules
  les attentes accélérées ; zoom jamais au-delà de la largeur de l'écran ; passages sans voix ≤ 8 s.
- Illustrations Pexels (5 photos, `CREDITS.md`).
- Confidentialité : jamais de temps source hors des morceaux vérifiés de `extraits.json` ; flous gardés.

## Fait (dernier commit)

- Répétitions : 3 transcriptions + zones retranscrites ; 5 coupes (`radio.reprises`, liste : `coupes_repetitions.md`).
- Dernières corrections demandées (message de Joseph après l'extrait de 60 s) :
  1. zoom limité à la largeur de l'écran + fondu haut/bas ; panneau « Obtenir Plus » coupé (X01 part de 76,4) ;
  2. passages sans voix ≤ 8 s (max mesuré 7,2 s) : X04, X05, X06, X07, X08 raccourcis ;
  3. étiquettes d'écart voix/écran (`notes` des plans : étapes 1, 2, phrase 121) et animation « Joindre vos 4 clips »
     (`ScenePiecesJointes`, phrases 104–105) ;
  4. décor du studio prolongé en miroir sur les côtés (mur, fenêtre, plante, plateau ; sans tasse ni ordinateur ; bords assombris).
- Vérifié en images : zoom pleine largeur, étiquettes d'écart, animation étape 6, côtés du studio.
- Durée actuelle : 748 s (12 min 28).

## Rendu complet livré (19 octobre)

- `out/formation-partie1/Formation_Partie1_HQ.mp4` : 748,1 s (12 min 28), 282,2 Mo, −14,0 LUFS, LRA 5,8, crête vraie −2,0 dBTP.
- `out/formation-partie1/Formation_Partie1_WhatsApp.mp4` : 720 × 1280, 92,5 Mo, −14,0 LUFS, crête vraie −1,9 dBTP.
- Planches `out/formation-partie1/planche_1.jpg`, `planche_2.jpg` (une image toutes les 12 s). `out/` n'est pas versionné.

## Reste à faire

1. Dernière passe sur la voix seulement, avec les temps de répétitions que Joseph enverra : ajouter des coupes dans
   `radio.reprises` (silence ≤ −38 dB aux deux bouts, `recaler` si des mots du script tombent dans la coupe),
   relancer voix_radio → formation_montage radio → double_formation radio → rendu.

## Fichiers de reprise (`projets/formation-montage-partie1/reprise/`, à recopier dans `public/formation-montage-partie1/`)

- `voix_propre.m4a` (voix nettoyée, entrée de `voix_radio.py`), `voix_radio.m4a` (voix radio prête) :
  `ffmpeg -i reprise/voix_propre.m4a -ar 48000 -ac 1 public/formation-montage-partie1/voix_propre.wav` (idem radio).
- `phrases.json`, `phrases_radio.json`, `voix_carte.json`, `formation_phrases_radio.json`,
  `formation_props_radio.json` (contient la bouche du double : clé `double`, `bouche` et `visemes`).
- `extraits.json` + `extraits/*.mp4` (extraits recadrés et floutés actuels) → `public/formation-montage-partie1/`.
- `avant.mp4`, `apres.mp4`, `filmee_*.mp4`, `image_*.jpg` ; `pexels/*.jpg` (liens dans `CREDITS.md`).
- `transcriptions/` : t1 (turbo), t2 (medium), t3 (fenêtres 30 s), zones retranscrites.

## Sources Google Drive

- Enregistrements d'écran : n° 1 `1JspJ7p0UrNTc-jNePwXj-naN8zrHpRXP` (→ `ecran1.mp4`), n° 2
  `1zpKdGeiEbnR0_LU2331bsb2ge5ktEd0k` (→ `ecran2.mp4`) ; vidéo d'origine `1gz3tVblvF8Rkhl2Z_8wtiMrHowi8eW4Y` ;
  vidéo montée `1_b330AI5ronq5a0tpZFpFwJa9paB3lCZ` ; logo Talkami `1iISW1PtRImbaW9skP1OtR-4Oe4DOqqc_` ;
  logo Lomé IA School `1z-qJRL9aHvRZi3qd4cx3xcwJr3bwAUj5`.
- Voix off (prises v1–v3) et réenregistrement `1jQgdWTrwiqUFokgF7LCEgJvANz_VimEr` (v4) ; autres liens Drive envoyés
  dans la conversation : `1Kal4eA_huHBMA_sK-sP-iCDDc_KDtmeh`, `15IyivoSQ2YF08a8-Is8LvvdBqUjVpXf6`,
  `10ORBaTAtcb2YViTz6ybDZRvvRZrQy62w`, `1-QIAtXfOqavqo_JU2J_l8WZ4StSqbvUg`. Inutile de les retélécharger :
  `reprise/voix_propre.m4a` suffit.
- Téléchargement : `scripts/telecharger.sh <lien> <dossier>` (ou `curl` sur drive.usercontent.google.com).

## Reconstruire et rendre (dans l'ordre)

```bash
P=public/formation-montage-partie1; R=projets/formation-montage-partie1/reprise
mkdir -p $P/extraits $P/pexels; cp $R/*.json $R/*.mp4 $R/*.jpg $P/; cp $R/extraits/*.mp4 $P/extraits/; cp $R/pexels/* $P/pexels/
ffmpeg -i $R/voix_propre.m4a -ar 48000 -ac 1 $P/voix_propre.wav
# Rhubarb 1.13 : https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.zip
python3 scripts/voix_radio.py formation-montage-partie1                 # voix radio + phrases_radio.json
python3 scripts/extraits.py formation-montage-partie1 <dossier ecran1/ecran2>   # seulement si extraits.json change
python3 scripts/formation_montage.py formation-montage-partie1 radio    # props, mix, voix seule calée
RHUBARB=<rhubarb> python3 scripts/double_formation.py formation-montage-partie1 radio   # double (bouche, gestes)
npx remotion bundle src/index.ts --out-dir <bundle>
npx remotion render <bundle> Formation <image.mp4> --props=$P/formation_props_radio.json --muted \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell --concurrency=4 --crf=16
# son : ajouter $P/formation_mix_radio.wav tel quel (0 échantillon de décalage), limiteur alimiter=limit=0.79,
# AAC 192 k ; version légère : 720 × 1280, x264 deux passes, < 100 Mo. Mesurer : ffmpeg -af ebur128=peak=true.
```

Pièges : Remotion garde en cache les vidéos déjà lues → les extraits ont un nom qui change avec leur contenu
(empreinte) ; supprimer le dossier de bundle avant d'en refaire un. `tsconfig.json` exclut `double-anime/`
(projet Remotion indépendant, importé directement).

## Série TikTok tirée de la formation (en cours)

- Config : `projets/serie-formation-partie1/serie.json` (voix des accroches, 9 parties, titres, gestes) ;
  plan : `projets/serie-formation-partie1/plan_decoupage.md`. Voix : Drive `1et5sv57yPd-U16Or6Fz51jkuhFF-gqqW`
  (copie : `public/serie-formation-partie1/accroches.m4a`, à recopier depuis `projets/serie-formation-partie1/` si
  besoin) ; mots horodatés : `accroches_mots.json`.
- Commandes : `RHUBARB=<rhubarb> python3 scripts/serie_voix.py` (voix radio + bouche) ; bundle Remotion ;
  `python3 scripts/serie.py <bundle> 1 2 …` → `out/serie-formation-partie1/Partie_<n>.mp4` (besoin de
  `out/formation-partie1/Formation_Partie1_HQ.mp4` et de `public/formation-montage-partie1/formation_mix_radio.wav`).
- Composition `SeriePiece` (`src/serie/Serie.tsx`) : accroche (studio, titre 3 lignes dans l'écran, badge PARTIE n/N,
  image 0 complète = couverture), carton « Commentez SUITE » (cœur et abonnement dessinés), carton final WhatsApp.
- Fait : partie 1 (106 s, 34,8 Mo, −14,1 LUFS, −1,9 dBTP). En attente de l'accord de Joseph sur le plan et la
  partie 1 avant de rendre les parties 2 à 9.
- Formation re-rendue avec les sous-titres remontés : Formation_Partie1_HQ.mp4 748.100000 s 335287738 octets
- Partie 1 : 106.4 s (accroche 6.2 s, passage 93.9 s, fin 6.4 s), 37.5 Mo, -14.1 LUFS, crête vraie -1.9 dBTP
- Partie 2 : 92.6 s (accroche 4.8 s, passage 81.4 s, fin 6.4 s), 25.4 Mo, -14.0 LUFS, crête vraie -2.0 dBTP
