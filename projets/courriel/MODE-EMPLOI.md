# Vidéo par e-mail — mode d'emploi

Tu n'as plus besoin d'ouvrir Claude : tout passe par **academyjoseph71@gmail.com**.

## Demander une vidéo

Écris un e-mail **à academyjoseph71@gmail.com**, depuis cette adresse (ou depuis une adresse ajoutée au secret
`EXPEDITEURS`) :

- **le texte** de la vidéo dans le message (ou en pièce jointe `.txt` / `.docx`) ;
- **ta voix off** en pièce jointe si tu l'as enregistrée (note vocale `.m4a`, `.mp3`, `.ogg`, `.opus`, `.wav`…) ;
  elle est **toujours retravaillée en voix radio** : bruit retiré, voix pleine, claire, énergique et plus forte ;
  sans voix off jointe, une **voix d'IA** lit le texte (voix d'homme par défaut ; écris « voix de femme » si tu
  préfères) — **jamais ta voix clonée** ;
- si tu veux, une **petite consigne** avant le texte, par exemple « Crée-moi la vidéo comme d'habitude » ou
  « mets beaucoup d'emojis ».

Dans les 10 minutes environ, tu reçois **« ✅ Reçu : je commence ta vidéo »**. Puis, 30 à 60 minutes plus tard,
**« 🎬 Ta vidéo est prête »** avec le lien de téléchargement en pleine qualité, une version légère en pièce jointe,
le titre, la description et les hashtags à copier.

## Demander une correction

**Réponds simplement à l'e-mail « 🎬 Ta vidéo est prête »** en disant ce qui ne va pas ou ce que tu veux changer
(« voix de femme », « titre plus court », « change la scène sur le numéro », « mets une photo de boutique »…).
Tu reçois « ✅ Reçu : je commence la version 2 », puis la vidéo corrigée. Tu peux recommencer autant de fois que tu veux.

Avec ta vraie voix, le texte dit ne peut pas changer (il doit correspondre à l'audio) : pour changer le texte, renvoie
un nouvel e-mail avec le nouvel audio.

## Si quelque chose ne va pas

Tu reçois « ⚠️ Problème pendant le montage » avec la raison ; une nouvelle tentative est faite automatiquement une fois.

## Réglages (GitHub → Settings → Secrets and variables → Actions)

| Secret | Rôle |
|---|---|
| `GMAIL_APP_PASSWORD` | mot de passe d'application Gmail (déjà enregistré) |
| `GEMINI_API_KEY` | clé Gemini gratuite (déjà enregistrée) |
| `PEXELS_API_KEY` | facultatif : photos libres de droits |
| `EXPEDITEURS` | facultatif : autres adresses autorisées à demander des vidéos, séparées par des virgules |
| `DESTINATAIRE` | facultatif : adresse qui reçoit les vidéos (par défaut academyjoseph71@gmail.com) |

Fonctionnement technique : `.github/workflows/courriel.yml` (branche `main`), scripts `scripts/courriel_*.py`
(branche `claude/great-heisenberg-8p7tj4`), une demande par fichier dans `projets/courriel/demandes/`, les fichiers de
chaque vidéo livrée dans `projets/courriel/<id>/`, les vidéos dans les Releases (`courriel-<id>`).
