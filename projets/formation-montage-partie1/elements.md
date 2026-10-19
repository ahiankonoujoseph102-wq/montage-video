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

## Durées par défaut

Génériques : ouverture 8 s, services 15 s, adhésion 15 s, Talkami 12 s, fin 10 s.
Cartes : prompt 1 32 s, 2 20 s, 3 24 s, 4 32 s, 5 56 s, complément 16 s, 6 48 s, 7 12 s, 8 8 s, prompt Flow réel 15 s.
Scènes : employé 10 s, prompt vague/précis 12 s, besoins 12 s, barre 32 s 9 s, réglages 12 s, barrière 30 Mo 10 s,
WhatsApp flou 9 s, limites 12 s, récapitulatif 14 s ; avant/après 32 s.
Extraits : X01 99,1 s, X02 35,7 s, X03 20,8 s, X04 31,8 s, X05 47,6 s, X06 28,4 s, X07 30,3 s, X08 40,8 s,
X09 25,5 s, X10 23,2 s, X11 22,4 s, X12 99,0 s, X13 55,3 s (9 min 20 s en tout).
