# Reprise du projet — état au 7 octobre 2026

À lire avec `CLAUDE.md` (méthode, style, son, bibliothèque des scènes illustrées), qui fait foi.

## Nouveau projet en cours (30 octobre 2026) : `agent-ia-p1`

Partie 1 de la formation « Comment créer un agent IA, de A à Z » (16:9, 1920 × 1080, + version WhatsApp).
Rushes téléchargés et transcrits (`projets/agent-ia-p1/rushes/README.md` pour les liens, `transcriptions/`),
script et guide en `.docx` + `.txt`. **Analyse et plan envoyés à Joseph, en attente de sa validation** :
`projets/agent-ia-p1/analyse.md` (manques, coupes, flous, plan des chapitres), `voix_off.md` (blocs V1–V55, W1–W30).
**Mise à jour (30 octobre, fin de journée)** : présentation par **Coach Joseph** (double 2D de la série animée,
dépôt `montage-videos`, `serie-animee/`, branche `claude/pub-formation-v2`) ; test de 11 s validé
(`livrable/test-coach-joseph.mp4`, code dans `projets/agent-ia-p1/test-avatar/`), bouche par `visemes_fr.py` (validée,
Rhubarb non utilisé). Devoir validé (`devoir.md`). **En attente : les voix off de Joseph** (`a_enregistrer.md`, étapes 1 à 6),
puis montage 1A et 1B.
Transcription : PyAV récent refuse `metadata_errors` → passer à Whisper l'audio décodé par ffmpeg (tableau numpy).

## État exact

- **Vidéo en cours : `ia-competence`** (style dynamique), 3 min 44 s une fois montée (220,8 s + carton de fin 3 s).
- **Dernier rendu complet livré à Joseph** (7 octobre) : version avec les **12 scènes illustrées** et le bandeau des
  sous-titres, 720 × 1280, 27,8 Mo, −14,2 LUFS, crête vraie −2,2 dBTP. Pas dans le dépôt (`out/` non versionné).
- **Joseph n'a pas encore donné son avis sur ce rendu.**

## Fait

- Modèle classique (projet `formation-ia`), son (musique + effets accordés), ouverture percutante,
  version longue avec carton de transition (projet `ia-montage`).
- Style dynamique validé : sous-titres bleus mot à mot, transitions, autocollants, cartons noirs, mots dorés,
  cadrage serré 35 %, coupes avec fondu de 35 ms + changement de plan sur la coupe ; lisibilité (dorés 1,5 s,
  deux mots au plus, rebond 110 % → 100 %, numéro seul).
- Aperçu des scènes a, d, e, f validé par Joseph (« c'est le niveau que je veux »), puis ses ajustements :
  - scène d : grand téléphone, bulles à très peu de mots (« Aide-moi » / « Écris 3 idées de posts pour ma
    boutique »), réponse nette en 3 lignes, étiquettes à 76 px, 6 s ;
  - scène a : livres et calendrier agrandis, pages qui s'envolent plus lentement (une toutes les 5 images, vol
    de 20 images en arc) ;
  - **bandeau des sous-titres** pendant les scènes (illustration 900 px, bandeau sombre 900–1 035 px, visage
    descendu de 560 px : front jamais coupé) ;
  - **8 autres scènes dessinées** (b, c, g, h, i, j, k, l), toutes ≤ 6 s, sans logo ; même son d'entrée pour toutes
    (`plein_ecran`) + sons d'étape ;
  - rythme vérifié : plus grand écart sans événement visuel = 9,7 s (règle : 12 s au plus).
- Contrôle rapide des scènes : `scripts/images.mjs` (voir CLAUDE.md).

## Reste à faire

1. **Avis de Joseph sur le rendu complet**, puis ajustements.
2. Points faibles connus (soumis à Joseph) :
   - scène d : la version précise n'a que ~2 s avant la fin des 6 s (question, réponse et coche s'enchaînent vite) ;
   - scène g (`remplace`) : dessin un peu petit et sage par rapport aux autres ;
   - scène l : « N'IMPORTE QUOI ! » se pose par-dessus les cartes ;
   - scènes a → b enchaînées (b descend par-dessus a) ;
   - la scène h montre « 100 % GRATUIT », qui revient en plein écran à 2:55.
3. Insertions d'images/vidéos de Joseph et couverture de livre en 3D : quand il les fournit.

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
