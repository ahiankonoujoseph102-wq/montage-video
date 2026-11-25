# Vidéo de test automatique (étape 1) — mesures et licences

Vidéo : `livrable/test-auto-2min.mp4` (2 min 17,7 s, 1080 × 1920, 23,4 Mo, −14,1 LUFS, crête −2,2 dB).
Sujet : « 4 réflexes pour vérifier une réponse de l'IA » (Lomé IA School). Script écrit par Claude :
la clé Gemini n'a pas pu être fournie (formulaire refusé depuis le téléphone).

## Temps mesurés (machine de montage : 4 cœurs, sans carte graphique)

| Étape | Temps |
|---|---|
| Installation de Chatterbox et PyTorch (une fois, ~9 Go) | 6 min 50 s |
| Voix clonée : chargement du modèle | 22 s |
| Voix clonée : 30 phrases, 130,8 s d'audio | 11 min 11 s (5,1 × le temps réel) |
| Assemblage, transcription (temps des mots), bouche, mixage | 1 min 25 à 2 min 30 s |
| Rendu Remotion (4 130 images) | 3 min 45 s |
| Encodage final | ~1 min |

## Estimation sur GitHub Actions (dépôt privé : machine à 2 cœurs, 2 000 min gratuites par mois)

Environ 2 fois plus lent qu'ici : voix ~23 min, rendu ~8 min, transcription ~3 min, installation ~5–8 min
(avec cache), encodage et envoi ~2 min → **≈ 40 min par vidéo** (estimation, non mesurée sur GitHub).
2 vidéos par jour ≈ 2 400 min par mois : **ne tient pas** dans les 2 000 min. 1 vidéo par jour ≈ 1 200 min : tient.

## Licences (usage commercial autorisé)

| Élément | Licence |
|---|---|
| Chatterbox (code `chatterbox-tts` et poids `ResembleAI/chatterbox`) | MIT ; ajoute un filigrane audio inaudible (Perth, MIT) |
| PyTorch | BSD |
| faster-whisper (code) et modèle Whisper large-v3-turbo | MIT |
| Remotion | gratuit pour un particulier ou une entreprise de 3 personnes au plus |
| Emojis animés Noto (Google) | CC BY 4.0 (citer « Noto Animated Emoji, Google ») |
| Police Montserrat | SIL OFL 1.1 |
| Musique (`sons/musique_defaut.m4a`) | musique de Joseph |
| Effets sonores, double animé, scènes | créations du projet |
| Voix de référence | voix off de Joseph (pub Talkami), clonage autorisé par lui pour ses vidéos |

Rhubarb Lip Sync (MIT) n'a pas pu être utilisé : l'exécution d'un programme téléchargé a été refusée par la
protection de l'environnement. La bouche est calculée à partir des lettres de chaque mot à son instant exact et de
l'énergie de la voix (`scripts/test_auto.py`).
