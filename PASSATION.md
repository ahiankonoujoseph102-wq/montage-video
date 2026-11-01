# PASSATION — Formation « Comment créer un agent IA, de A à Z »

À lire en premier par toute nouvelle conversation. Branche : `ccr-ac0b494d-7l5eng`.

## ▶ EN COURS : la SUITE de la formation (projet `projets/agent-ia-p2/`, demande de Joseph du 1er novembre 2026)

- La partie 1 (vidéos 1A et 1B) est **validée et envoyée aux élèves**, avec le guide et les tests (détails plus bas).
- Joseph a enregistré la suite : **7 vidéos** (identifiants Google Drive dans `projets/agent-ia-p2/rushes/README.md`),
  à monter **dans le même style que la partie 1 validée** (voir « Version 2 complète : comment c'est construit »).
- Ses demandes, dans l'ordre :
  0. Ne rien perdre : push après chaque étape, ce fichier à jour (où on en est, fichiers, licences, commandes, demandes).
  1. Analyse : télécharger et regarder les 7 vidéos en entier (transcription + images) ; comprendre comment il continue
     la formation ; signaler erreurs, étapes oubliées, explications confuses, et proposer mieux.
  2. Même style que la partie 1 : démos en grand, zoom, cercle doré, bandeau « Étape X / Y » ; vitesse normale ou
     ralentie, jamais accélérée, chargements coupés ; avatar absent des démos, présent pour intro, explications,
     transitions, fin ; illustrations libres de droits (sources et licences ici) ; voix radio −14 LUFS ; flou seulement
     mots de passe, clés secrètes, codes SMS ; ne rien couper d'utile (sinon démo claire ou enregistrement demandé) ;
     intro « Deuxième partie » (ou le bon numéro) et « La suite arrive très bientôt » si la formation continue ;
     public de débutants complets.
  3. **D'abord, sans rien monter** : a) découpage (nombre de vidéos finales, titres, durées) ; b) plan scène par scène ;
     c) ce qui manque : voix off à réenregistrer (texte complet collé dans la réponse, petits morceaux numérotés avec la
     démo associée) et enregistrements d'écran manquants (quoi, quelle page, combien de secondes) ; d) conseils qualité.
  4. Après son accord : extrait d'essai d'environ 1 min ; puis montage complet vidéo par vidéo (chacune envoyée dès
     qu'elle est prête et contrôlée comme un débutant) ; une version légère WhatsApp de chaque vidéo.
  5. Documents élèves : un test par vidéo (réponses à part pour Joseph) ; le guide de la partie (étapes numérotées dans
     l'ordre des démos, mots simples, liens utiles, devoir) ; mise à jour du document « Guide de formation pour la
     préparation d'agents » (= le guide « Préparer son agent IA », `projets/agent-ia-p1/guide.docx`) ; en .docx ET en PDF ;
     le message WhatsApp pour les élèves.
- **Plan de la deuxième partie ACCEPTÉ par Joseph** (4 vidéos 2A, 2B, 2C, 2D). Ses décisions (1er novembre) :
  - les clés : « ne t'en occupe pas, c'est ma décision, je ne les change pas » → ne plus lui en parler ; on floute
    quand même les clés et codes à l'image (règle générale : mots de passe, clés secrètes, codes SMS) ;
  - **NE COUPER AUCUN PASSAGE** : v3, garder sa demande sur plusieurs comptes Google ET la réponse du chef de projet
    (montre comment on discute avec le chef) ; v7, garder son passage sur les abonnements qu'il peut offrir et sa phrase
    sur les projets qui rapportent de l'argent (c'est sa décision) → VO-55 n'est plus nécessaire ;
  - conseils acceptés : Kekeli = ses choix (VO-21), pull request illustrée, boucle racontée une seule fois, micro du clavier.
- **Étape actuelle : attente des enregistrements** : R1 (variables d'environnement, fausses clés), puis voix off vidéo par
  vidéo, en commençant par la 2A, envoyées par Drive. **Texte à lire : `projets/agent-ia-p2/voix_off_p2_complete.md`** (version
  complète demandée par Joseph le 1er novembre, 109 morceaux A-01…D-16, remplace `voix_off_p2.md` trop court). Dès réception des voix de la 2A : extrait d'essai
  d'environ 1 minute, puis montage vidéo par vidéo.
- **Voix off reçues le 1er novembre** : 4 fichiers (`projets/agent-ia-p2/voix/vo1…vo4.m4a`, 5 min 32, 4 min 35, 4 min 16,
  2 min 19 ; ids Drive 17NFwrafHW8xoUEnBOVpogHu1oNmKgBPF, 1YzgzLCi3cTWvb-IgCZjy57TG4t9rY_3z, 1QcX1QTxHuvnC01SxSikbalr9MT5sZ0tp,
  1Y-78jbMRGc5SxpA38AFsT6gS73XBENxu). Joseph signale des erreurs et des répétitions : **retirer toutes les reprises**.
- **Exigences de qualité de Joseph (1er novembre, pour toute la partie 2)** : public de débutants → tout très expliqué,
  **beaucoup d'illustrations, d'animations, d'images libres de droits explicatives** ; montage **très animé, mouvementé,
  excellent** ; **voix radio forte, énergique, bon ton, à haute voix** ; puiser sur Internet toutes les ressources utiles ;
  pédagogie excellente ; **ne pas se presser, avancer étape par étape**, n'assembler qu'à la fin ; **prendre tout l'écran
  pour expliquer** ; l'avatar seulement à certains endroits.
- **Extrait d'essai (1er novembre) : `out/essai-p2.mp4`** (1 min 04, A-22 → A-28, la pull request ; −14 LUFS), envoyé à
  Joseph, **attente de son accord** avant le montage complet de la 2A. Données : `projets/agent-ia-p2/montage/essai2.py`
  (voix vo1 218,55–281,40 s, traitement `VOIX_FORTE`, corrections des sous-titres, scènes). Composition Remotion
  `EssaiP2` : copie dans `projets/agent-ia-p2/formation-src/EssaiP2.tsx` (à remettre dans
  `serie-animee/src/formation/p2/`, déclaration dans `Root.tsx`), captures de l'appli dans `formation-src/illus/`
  (issues de v2 à 384, 402, 437 s). Rendu : bundle puis `npx remotion render … EssaiP2` puis `outils/finaliser.py`.
  Reprises de vo1 à retirer au montage complet : « Il ajoute ses remarques… » (1re prise ≈ 3:17–3:24),
  « Et quand une personne du chef de projet vous… » (≈ 4:41–4:48).
- Illustrations : uniquement des dessins faits dans le code (aucune image extérieure pour l'instant) ; unDraw
  (licence unDraw : libre, usage commercial, sans attribution) pour la partie 1.
- Fichiers : transcriptions `projets/agent-ia-p2/transcriptions/v1…v7` et `vo1…vo4` ; plan `projets/agent-ia-p2/plan_p2.md` ; voix off
  `projets/agent-ia-p2/voix_off_p2.md`.

---

# Partie 1 (vidéos 1A et 1B) — terminée et validée
## Où on en est

- **Version 1** rendue le 30 octobre 2026 : refusée par Joseph (fade, démos trop rapides, pas de Talkami, trop de coupes).
- **Version 2** : plan `projets/agent-ia-p1/plan_v2.md` ; extrait d'essai `out/essai-v2.mp4` (composition `EssaiV2`)
  **validé par Joseph : « c'est ce style que je veux »**.
- **Vidéos finales v2 validées par Joseph et envoyées aux élèves (1er novembre)** (1A ≈ 14 min 40, 1B ≈ 18 min 10) après contrôle image par image et
  corrections. Vidéos : `out/formation-1A-v2.mp4` et `out/formation-1B-v2.mp4` (non versionnées, > 80 Mo ; envoyées à
  Joseph dans la conversation ; le conteneur est effacé à la fin de la session : pour les retrouver, relancer la
  construction et le rendu, commandes ci-dessous). Aucune Release GitHub possible depuis cette session (outil absent).
- Montage complet de 1A puis de 1B dans le style de l'extrait (durées acceptées : 1A ≈ 22 min,
  1B ≈ 26 min). Décisions de Joseph pour l'étape 3 :
  - inscription GitHub : ne pas lui demander de refilmer ; adapter la voix off ou ajouter un texte à l'écran
    (« Touchez S'inscrire, ou Se connecter si vous avez déjà un compte ») ;
  - même méthode : avant chaque envoi, regarder comme un débutant et corriger ;
  - tout pousser sur GitHub et tenir ce fichier à jour.

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
- Illustrations libres (notées au fur et à mesure) :
  - `projets/agent-ia-p1/illustrations/code-contribution_8k0x.svg` — unDraw (Katerina Limpitsouni),
    https://cdn.undraw.co/illustration/code-contribution_8k0x.svg, licence unDraw (usage commercial libre, sans
    attribution, modification permise : https://undraw.co/license) ; recolorée (peau brune, accent or) :
    `code-contribution-recolore.svg` → `serie-animee/public/formation/illus/code-contribution.svg`.
  - `private-files_m2bw.svg`, `secure-usb-drive_7pj5.svg` : unDraw, même licence (téléchargées, pas encore utilisées).
  - unDraw, même licence : chat-with-ai, idea-to-plan, project-flow, ai-code-generation, deploy-globally, database-tables,
    ai-agent, plug-in, authentication, ai-answers, books, agentic-network, starting-work, road-to-knowledge, lecture
    (`https://cdn.undraw.co/illustration/<nom>.svg`).
  - Coffre-fort, frise des versions, carte du dépôt : dessinés dans le code (`Essai.tsx`).
  - Wikimedia Commons : API bloquée (429) depuis l'environnement ; Pexels/Pixabay : pages bloquées (403).

## Enregistrements demandés à Joseph (version 2)

Voir la fin de `projets/agent-ia-p1/plan_v2.md` : séance Talkami (60–90 s, avec son), évaluation (45–60 s),
« Mon espace » (20–30 s), voix off des démos (`a_enregistrer_v2.md`), démo réelle du module E (facultative).

## Extrait d'essai v2 (étape 2)

- Données : `python3 projets/agent-ia-p1/montage/essai.py` (lancer depuis `montage/`, sans `-I`) → `serie-animee/public/formation/essai/`
  (voix, extraits du rush H par étape, sous-titres). Étapes, cibles (cercles) et zooms : liste `ETAPES` de `essai.py`.
- Composition `EssaiV2` (`src/formation/Essai.tsx`, copie dans `formation-src/`), déclarée dans `Root.tsx` (voir `Root.tsx.diff`).
- Rendu : `npx remotion bundle src/index.ts --out-dir $SP/bundle && npx remotion render $SP/bundle EssaiV2 $SP/brut-essai.mp4
  --concurrency=4 --crf=18 --audio-codec=aac --audio-bitrate=192k && python3 -I outils/finaliser.py $SP/brut-essai.mp4 out/essai-v2.mp4`
- Démo GitHub (rush H) : vers 187 s Joseph ouvre le menu de Chrome par erreur → l'étape « Privé » s'arrête à 186,6 s.


## Version 2 complète : comment c'est construit (étape 3)

- Plan : `projets/agent-ia-p1/montage/plan2.py` (`VIDEO_1A`, `VIDEO_1B`). Éléments : `("phrases", id0, id1, visuel)` (voix du
  script, cartes avec Coach Joseph ; `illus(...)` = carte avec illustration), `chapitre(...)`, `("demo", rush, [et(...)], {"titre"})` :
  démonstration pas à pas sans avatar. `et(m, v, b, …)` : morceaux du rush (vitesse 1 ou ralentis, jamais accélérés), voix
  (`vo(a, b)` = voix off des démos, `ph(id0, id1)` = phrases du script, `LIVE` = parole en direct, `SON` = son de la vidéo),
  bandeau `b`, cercles `c`, zooms `z`, `note`, `flou` (mots de passe, clés, codes SMS seulement), `rush=` pour changer de vidéo.
- Touchers repérés automatiquement (rond gris « Afficher les appuis ») : `montage/touchers.py <rush>` → `sorties/touchers/` ;
  les appuis sur le clavier (y > 1650) sont ignorés.
- Construction : `cd projets/agent-ia-p1/montage && PLAN=plan2 python3 construire.py 2A` (puis `2B`) → `serie-animee/public/formation/2A/` ;
  extraits des étapes : `python3 clips2.py 2A` → `public/formation/etapes/` ; bouche : `python3 bouche.py 2A`.
- Composition Remotion `Formation2A` / `Formation2B` (`src/formation/Formation2.tsx`, copie dans `formation-src/`).
- Contrôle : `node outils/stills_formation.mjs <bundle> Formation2A <dossier> <t1,t2,…>` (images à mi-résolution) ;
  planche d'un rush : `python3 montage/planche.py <video> <debut> <fin> <pas> <sortie.jpg>`.
- Illustrations des 10 mots : unDraw (licence libre, voir plus haut), recolorées (`illustrations/`, copie dans
  `serie-animee/public/formation/illus/`) ; `laravel-cloud.jpg` = image du rush I (188 s).

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
