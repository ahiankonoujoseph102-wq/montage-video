# Formation partie 1 — éléments préparés (phase 1)

Tout est en 1080 × 1920, 30 i/s, sans son, contenu dans la zone sûre TikTok. Rendu : `scripts/rendre_formation.sh`
(sortie `out/formation-partie1/`). Sources Drive à retélécharger dans un dossier, puis
`python3 scripts/extraits.py formation-montage-partie1 <dossier>` (fichiers `ecran1.mp4`, `ecran2.mp4`) ; vidéos
avant / après dans `public/formation-montage-partie1/avant.mp4` et `apres.mp4`.

## Calage sur la voix off (phase 2)

- Génériques avec voix (`GeneriqueServices`, `GeneriqueAdhesion`, `GeneriqueTalkami`) : `--props='{"duree": 17.2}'`,
  les éléments apparaissent à des fractions fixes de la durée.
- Cartes de prompts (`CartePrompt1` … `CartePrompt8`, `CarteComplement`) : `{"duree": s, "temps": [s, s, …]}`, une
  seconde par ligne non vide (début du surlignage). Sans `temps`, les lignes se suivent régulièrement.
- `CartePromptFlowReel` : `{"duree": s, "temps": [5 secondes]}` (vertical 9:16, exactly 8 seconds, exact dialogue,
  lip synchronization, no subtitles).
- Scènes (`Scene…`) : `{"duree": s, "etapes": [s, …]}` (moments clés, dans l'ordre de `src/formation/Scenes.tsx`).
- Extraits d'écran : `projets/formation-montage-partie1/extraits.json` (morceaux, vitesses, flous, zooms).

## Confidentialité (extraits d'écran)

Barre d'état (heure, compteur, réseau) masquée en noir sur tous les extraits. Coupés : photo personnelle et
Google Photos (5:06–5:16, 8:38–8:42, 12:30–12:44, 15:45–16:00), captures MoMo (dans Google Photos), menu de partage
(3:12), WhatsApp (4:48–5:04), sélecteurs de comptes (0:53–1:06), volets de notifications (12:36, 14:23–14:53,
18:24, 11:15–11:17, 18:22–18:25, enregistrement n° 2 à 2:38). Floutés : photo de profil Google (avatar), panneau de
compte et liste « Sélectionner un compte » (11:42–11:49, 12:08–12:13), adresses Drive dans le sélecteur de fichiers
(26:02–26:12), adresse claude.ai/chat de la discussion (enregistrement n° 2, 2:20–2:38).
