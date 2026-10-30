# PASSATION — Formation « Comment créer un agent IA, de A à Z », partie 1 (vidéos 1A et 1B)

À lire en premier par toute nouvelle conversation. Mis à jour à chaque étape. Branche : `ccr-ac0b494d-7l5eng`.

## Où on en est

- **Version 1** rendue le 30 octobre 2026 (1A 12 min 40, 1B 14 min 15) : **refusée par Joseph** (fade, démos trop
  rapides et floues, pas de Talkami, pas d'illustrations, trop de coupes, trop de flous).
- **Version 2 — étape 2 en cours** : plan envoyé ; Joseph a envoyé la voix off des démos et Talkami (accord implicite) ;
  je prépare l'extrait d'essai (démo GitHub zoomée + illustration coffre-fort). Plan : `projets/agent-ia-p1/plan_v2.md`.
  Texte des voix off des démos à faire enregistrer : `projets/agent-ia-p1/a_enregistrer_v2.md`.
- Étape 2 (après accord) : extrait d'essai d'environ 1 min (une vraie démo zoomée + une illustration).
- Étape 3 (après accord sur l'extrait) : rendu complet de 1A puis 1B.

## Demandes de Joseph (message du 30 octobre, version 2) — à respecter

0. Ne rien perdre : commit + push après chaque étape ; tenir ce fichier à jour ; gros fichiers vidéo (> 100 Mo)
   dans une Release GitHub ou emplacement indiqué ici.
1. Défauts de la v1 : pas de démonstrations (Talkami, Teacher Joe jamais vus), pas d'illustrations, démos trop
   rapides et floues, passages utiles coupés (dont des enregistrements envoyés), trop de flou.
2. Public : **débutants complets**. Chaque geste visible, lent, expliqué.
3. a) Démo à chaque étape : écran en grand, zoom sur la zone touchée, vitesse normale ou ralentie (**jamais accélérée
   pendant un geste**), cercle / flèche / surlignage, petit texte « Étape 3 : touchez Deploy ».
   b) Montrer Talkami pour de vrai (talkami.net, accueil, évaluation, séance Teacher Joe ou Rose, « Mon espace ») et
   pousser à tester : « Allez sur talkami.net et essayez ».
   c) Illustrations libres de droits (Pexels, Pixabay, Unsplash, Wikimedia Commons, icônes libres) pour les idées
   abstraites ; **source et licence notées ici**.
   d) Ne plus couper ce qui est utile : remplacer par une démo ou une illustration, ou demander précisément
   l'enregistrement manquant (quoi, quelle page, combien de secondes).
   e) Avatar Coach Joseph : retiré pendant les démos ; présent pour intro, transitions, explications, conclusion.
   f) Flouter **seulement** mots de passe, clés secrètes (API) et codes SMS. E-mail, nom GitHub, dépôts : visibles.
   g) Garder : voix radio, introduction « première partie », devoir, « la suite arrive bientôt ».
4. Méthode : plan → accord → extrait d'1 min → accord → rendu complet. Avant chaque envoi, regarder comme un
   débutant : « Est-ce que je comprends chaque geste ? »
- Toujours répondre en français, simplement. Ne jamais afficher de clé ni de secret.

## Ce qui est fait (réutilisable)

- Voix : transcriptions, alignement script ↔ prises, retrait des reprises, voix radio — `projets/agent-ia-p1/montage/`
  (`aligner.py`, `unites.py`, `voix.py`, `construire.py`, `plan.py`, `clips.py`, `bouche.py`, `controle_voix.py`).
- Avatar Coach Joseph (personnage 2D existant de `montage-videos/serie-animee`, `src/v2d/Double2D.tsx`) avec bouche
  synchronisée (visèmes maison) : validé.
- Code Remotion des vidéos : dans le dépôt **montage-videos** (branche locale `travail`, **non poussée** : dépôt hors
  de la portée de cette session). Copies à jour ici : `projets/agent-ia-p1/formation-src/` (`Formation.tsx`,
  `DemoModuleE.tsx`, `TestAvatar.tsx`, `Root.tsx.diff` à appliquer à `serie-animee/src/Root.tsx`).

## Sources utilisées

- Rushes de Joseph (Google Drive, identifiants dans `projets/agent-ia-p1/rushes/README.md`, non versionnés).
- Voix de Joseph : `projets/agent-ia-p1/voix/` (audio-1346.m4a, audio-2.m4a, fin-1a.m4a ; recapitulatif.mp4 et
  chef-de-projet.mp4 non versionnés, identifiants Drive dans le README des rushes).
- Musique : `sons/musique_defaut.m4a`, musique personnelle de Joseph (droits OK).
- Police Poppins (SIL Open Font License). Emojis : police système (Noto Color Emoji, SIL OFL).
- Talkami (site de Joseph) : `voix/talkami-catalogue.mp4` (catalogue d'écrans), `voix/talkami-video.mp4` (leçon de
  Teacher Joe), voix off des démos `voix/voix-off-demos.m4a` — identifiants Drive dans `rushes/README.md`.
- Illustrations libres : *aucune encore* — à noter ici au fur et à mesure (fichier, URL, auteur, licence).

## Enregistrements demandés à Joseph (version 2)

Voir la fin de `projets/agent-ia-p1/plan_v2.md` : séance Talkami (60–90 s, avec son), évaluation (45–60 s),
« Mon espace » (20–30 s), voix off des démos (`a_enregistrer_v2.md`), démo réelle du module E (facultative).

## Relancer le rendu (version 1, à adapter en v2)

```bash
# rushes : voir projets/agent-ia-p1/rushes/README.md (curl drive.usercontent.google.com …)
cd projets/agent-ia-p1/montage
python3 -I aligner.py && python3 -I construire.py 1A && python3 -I construire.py 1B   # voix + montage.json
python3 -I clips.py && python3 -I bouche.py 1A && python3 -I bouche.py 1B                                        # extraits d'écran, bouche
cd /home/user/montage-videos/serie-animee        # code Remotion (copies dans formation-src/)
npx remotion bundle src/index.ts --out-dir $SP/bundle
npx remotion render $SP/bundle Formation1A $SP/brut-1A.mp4 --concurrency=4 --crf=20 --audio-codec=aac --audio-bitrate=192k
python3 -I outils/finaliser.py $SP/brut-1A.mp4 /home/user/montage-video/out/formation-1A.mp4   # -14 LUFS
```
Le rendu complet d'une vidéo prend environ 40 min (4 cœurs). Vidéos v1 : `out/formation-1A.mp4` (70 Mo) et
`out/formation-1B.mp4` (138 Mo), non versionnées (v1 refusée, inutile de les garder).
