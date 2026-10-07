# Reprise du projet — état au 7 octobre 2026

À lire avec `CLAUDE.md` (méthode, style, son, bibliothèque des scènes illustrées), qui fait foi.

## État exact

- **Vidéo en cours : `ia-competence`** (style dynamique), 3 min 44 s une fois montée (220,8 s + carton de fin 3 s).
- Dernière vidéo complète livrée à Joseph : la version d'avant les scènes illustrées (cadrage serré 35 %,
  coupes avec fondus, 720 × 1280, 27,8 Mo). Elle n'est pas dans le dépôt (`out/` n'est pas versionné).
- Depuis : **partie 1 (lisibilité) faite** et **4 scènes illustrées sur 12 dessinées** (a, d, e, f), montrées dans
  un aperçu de 30 s (`out/apercu-scenes.mp4`, non versionné). **Joseph n'a pas encore donné son avis sur
  l'aperçu.** Aucun rendu complet avec les scènes n'a été fait.

## Fait

- Modèle classique (projet `formation-ia`), son (musique + effets accordés), ouverture percutante,
  version longue avec carton de transition (projet `ia-montage`).
- Style dynamique validé : sous-titres bleus mot à mot, transitions, autocollants, cartons noirs, mots dorés,
  cadrage serré 35 %, coupes avec fondu de 35 ms + changement de plan sur la coupe.
- Partie 1 (lisibilité), dernière demande :
  - mot doré : 1,5 s au plus, en grand, à la hauteur du sous-titre, sous-titre masqué pendant ce temps ;
  - sous-titres : deux mots au plus, jamais resserrés (deux lignes si besoin), nombres réunis (« 15 000 ») ;
  - rebond : 110 % → 100 % en 3 images, jamais plus petit ;
  - numéro de téléphone seul, sans « AU », en grand, à la hauteur du sous-titre (pas encore vu dans un rendu).
- Scènes illustrées en écran partagé : le cadre (`src/dynamique/Illustrations.tsx`), le placement dans
  `scripts/preparer.py`, les sons dans `scripts/mixer.py`, et 4 dessins dans `src/dynamique/scenes/` :
  `etudes` (a), `reponses` (d), `creations` (e), `licenciements` (f). Configurées dans
  `projets/ia-competence/montage.json` → `dynamique.illustrations`.

## Reste à faire (dans l'ordre)

1. **Attendre l'avis de Joseph sur l'aperçu** (scènes a, d, e, f), puis faire les ajustements :
   - **scène a** (`etudes`) : livres et calendrier plus grands ; envol des pages du calendrier moins brouillon ;
   - **scène d** (`reponses`) : textes du téléphone trop petits (les grossir, agrandir le téléphone) ; la scène
     dure 9,4 s, à raccourcir vers 5 s (commencer plus tard ou finir avant « instructions »).
2. **Dessiner les 8 autres scènes** (types déjà déclarés dans `src/types.ts`, idées et ancrages ci-dessous ;
   ajouter chaque dessin dans `src/dynamique/scenes/` et dans le registre `index.ts`, puis l'entrée dans
   `montage.json`). Instants en secondes dans la vidéo montée :
   - b `equipe` : « toute une équipe… une seule personne » (~20,3–25,5 s) ; remplace le doré « TOUTE UNE ÉQUIPE » ;
   - c `telephone` : « Est-ce que tu sais l'utiliser ? … dans ton téléphone » (~32–37 s) ; remplace l'autocollant « ? » ;
   - g `remplace` : « vous serez remplacé par des petits qui savent utiliser l'IA » (~96–100 s) ;
   - h `gratuit` : après le carton « LA SOLUTION » (~133,8–137,8 s) ; remplace le doré « GRATUIT » ;
   - i `rendezvous` : « La soirée, c'est de 18h à 20h. Et la journée, c'est de 9h à 17h » (~156,8–162,3 s),
     cartes calées sur « 18h » et « 9h » ; remplace les dorés des horaires ;
   - j `enligne` : « nous suivre en direct sur Google Meet… peu importe votre pays » (~167,5–172 s), sans logo ;
   - k `inscription` : après le carton « COMMENT S'INSCRIRE » (~181,6–186,5 s), étapes « créer », « confirmez »,
     « rejoignez » ;
   - l `unTelephone` : « Juste un seul téléphone suffit… créer n'importe quoi » (~203,5–207,5 s).
3. **Bandeau des sous-titres** : demandé par Joseph, détail à préciser avec lui au début de la session.
4. **Rendu complet d'`ia-competence`** puis vérifications (CLAUDE.md, étape 5) : une image toutes les 2 s, chaque
   transition et chaque scène image par image, niveaux (−14 LUFS, crête vraie < −1 dBTP sur le fichier envoyé),
   retranscription autour des coupes ; envoi en 720 × 1280, moins de 30 Mo, avec la liste de ce qui reste imparfait.
5. Points connus à surveiller : entre 5 s et 28 s il n'y a plus de transition (les scènes occupent cette zone) ;
   un sous-titre sur deux lignes empiète un peu sur le bas d'une illustration ; tous les effets d'entrée de
   scène utilisent le même son (`plein_ecran`), à confirmer avec Joseph.

## Fichiers absents du dépôt (à retélécharger)

Non versionnés (`.gitignore`) : `projets/*/source.mp4`, `projets/ia-montage/source_complet.mp4` et
`ancienne.mp4`, tout `public/<projet>/` (vidéo coupée, props, mix) et tout `out/` (rendus). Les `public/` et
`out/` se régénèrent avec les commandes ci-dessous. Sources sur Google Drive (partagées par lien) :

| Fichier | Lien Google Drive |
|---|---|
| `projets/ia-competence/source.mp4` (vidéo en cours) | https://drive.google.com/file/d/1Kal4eA_huHBMA_sK-sP-iCDDc_KDtmeh/view |
| `projets/style-dynamique-modele/source.mp4` (vidéo modèle CapCut, pour référence) | https://drive.google.com/file/d/1-QIAtXfOqavqo_JU2J_l8WZ4StSqbvUg/view |
| `projets/formation-ia/source.mp4` | https://drive.google.com/file/d/15IyivoSQ2YF08a8-Is8LvvdBqUjVpXf6/view |
| `projets/ia-montage/source_complet.mp4` (4 min 11 s) | https://drive.google.com/file/d/10ORBaTAtcb2YViTz6ybDZRvvRZrQy62w/view |

Pour `ia-montage`, `source.mp4` et `ancienne.mp4` sont tirés de `source_complet.mp4` :

```bash
cd projets/ia-montage
ffmpeg -i source_complet.mp4 -t 92.5 -c:v libx264 -crf 14 -preset fast -c:a aac -b:a 256k source.mp4
ffmpeg -ss 92.5 -i source_complet.mp4 -c:v libx264 -crf 14 -preset fast -c:a aac -b:a 256k ancienne.mp4
```

La musique (`sons/musique_defaut.m4a`), les effets (`sons/effets/`), les polices (`public/polices/`), les
transcriptions et corrections (`projets/*/mots.json`, `corrections.json`) **sont** dans le dépôt : pas besoin de
retranscrire.

## Commandes pour tout relancer

```bash
# Dépendances
npm install
pip install faster-whisper pyloudnorm scipy numpy librosa "opencv-python-headless<5"
# (Chromium : /opt/pw-browsers, chromium_headless_shell trouvé automatiquement par scripts/rendre.sh)

# Source de la vidéo en cours
scripts/telecharger.sh https://drive.google.com/file/d/1Kal4eA_huHBMA_sK-sP-iCDDc_KDtmeh/view ia-competence

# Préparation (coupe et recadrage ~7 min la première fois, puis en cache), bande son
python3 scripts/preparer.py ia-competence
python3 scripts/mixer.py ia-competence

# Vérifier le code
npx tsc --noEmit -p .

# Une image (contrôle rapide), ex. image 2700
npx remotion still src/index.ts Montage out/test.png --frame=2700 --props=public/ia-competence/props.json \
  --browser-executable=$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)

# Rendu complet (~15 min) → out/ia-competence.mp4, puis version à envoyer (720 × 1280, < 30 Mo, deux passes)
scripts/rendre.sh ia-competence
```

Encodage d'envoi (débit calculé pour 27,5 Mo ; remplacer 223.6 par la durée réelle) :

```bash
br=$(python3 -c "print(int((27.5e6*8/223.6-128000)/1000))")
C="-i out/ia-competence.mp4 -vf scale=720:1280:flags=lanczos -c:v libx264 -preset slow -b:v ${br}k -pix_fmt yuv420p"
ffmpeg -y $C -pass 1 -passlogfile out/p2 -an -f mp4 /dev/null
ffmpeg -y $C -pass 2 -passlogfile out/p2 -c:a aac -b:a 128k -movflags +faststart out/ia-competence-finale.mp4
```

Aperçu de quelques scènes : voir la fin de « Bibliothèque des scènes illustrées » dans CLAUDE.md.

## Domaines réseau à autoriser dans l'environnement

- `drive.google.com`, `drive.usercontent.google.com` : téléchargement des vidéos ;
- `huggingface.co`, `*.huggingface.co`, `*.hf.co` : modèle Whisper (seulement pour transcrire une nouvelle vidéo) ;
- `registry.npmjs.org` : `npm install` ;
- `pypi.org`, `files.pythonhosted.org` : `pip install` ;
- `github.com` : pousser le travail.
