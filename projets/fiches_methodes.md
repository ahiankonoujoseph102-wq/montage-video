# Fiches de méthodes vérifiées (une par rubrique)

Données à Gemini avec la rubrique du jour : il ne doit utiliser que ces méthodes, outils et faits (rien d'inventé sur
les menus, les prix ou les offres). À tenir à jour quand un outil change. Aucun prix, aucune promesse de durée exacte.

## sites
- Claude (claude.ai, version gratuite) : décrire la page voulue (nom de la boutique, produits, couleurs, contact) ; Claude
  écrit la page web (HTML et CSS) et l'affiche à droite de la discussion (aperçu) ; on demande des corrections en
  français (« mets le bouton plus grand », « ajoute une section horaires ») ; le bouton « Publier » de l'aperçu donne un
  lien public à partager.
- ChatGPT (chatgpt.com) peut aussi écrire la page ; Gemini (gemini.google.com) aussi.
- Bouton WhatsApp : lien https://wa.me/ suivi du numéro avec l'indicatif du pays, sans « + », sans 00 et sans espaces
  (Togo : 228). Erreur fréquente : oublier l'indicatif ou laisser des espaces.
- Mise en ligne d'un fichier index.html : Netlify Drop (app.netlify.com/drop, on glisse le dossier du site ; créer un
  compte gratuit pour garder le site) ou GitHub Pages (gratuit). Sans code : Google Sites (gratuit).
- Nom de domaine personnalisé : facultatif et payant (ne pas donner de prix).
- Toujours tester sur téléphone : affichage, bouton WhatsApp, numéro, textes sans faute.
- Prompt type : « Tu es développeur web. Crée une page web d'une seule page pour ma boutique [nom] à Lomé qui vend
  [produits]. Sections : accueil avec slogan, produits avec photos, horaires, bouton vert "Commander sur WhatsApp" vers
  https://wa.me/228XXXXXXXX. Style moderne, couleurs [couleurs], adapté au téléphone. Donne le code complet dans un seul
  fichier. »

## astuce
- Prompt en 5 parties : rôle (« Tu es… »), contexte (qui je suis, mon activité), tâche précise, format de réponse
  (tableau, liste, 5 lignes…), contraintes (ton, longueur, langue).
- Demander à l'IA de poser ses questions d'abord : « Avant de répondre, pose-moi les questions dont tu as besoin ».
- Donner un exemple de ce qu'on veut ; demander plusieurs versions ; améliorer par petites corrections.
- ChatGPT, Claude et Gemini lisent les photos : photo d'une liste écrite à la main → « transforme en tableau » ; photo
  d'une facture → « résume les montants par ligne ».
- Vérifier les informations importantes : Perplexity (perplexity.ai) donne ses sources ; l'IA peut se tromper.
- Ne jamais coller de mot de passe ni de données sensibles de clients.

## agents
- Un agent IA = une IA + des instructions fixes + des outils qu'elle peut utiliser + des actions qu'elle fait à ta place
  (répondre, ranger, envoyer, prévenir).
- Assistant personnalisé simple : les « Gems » de Gemini (gemini.google.com) : on écrit une fois les instructions (ex.
  « tu réponds aux questions des clients de ma boutique avec ces informations… ») et on le réutilise.
- WhatsApp Business (appli gratuite) : message d'accueil automatique, message d'absence, réponses rapides et catalogue
  (ce n'est pas de l'IA, mais c'est la base pour répondre vite).
- Agent qui agit vraiment (lire un message, chercher dans un tableau, répondre, prévenir le vendeur) : outils
  d'automatisation comme n8n ou Make reliés à une IA (ChatGPT, Claude ou Gemini) ; c'est plus technique et demande des
  comptes et des clés de connexion.
- Précautions : garder un humain pour valider, ne pas promettre ce que l'agent ne peut pas faire, protéger les données
  des clients, tester avant de lancer.

## automatisation
- Principe : un déclencheur (« quand… ») puis des actions (« alors… »). Ex. : quand un client remplit un formulaire,
  alors la commande s'ajoute dans un tableau et le vendeur reçoit un e-mail.
- Sans outil spécial : Google Forms enregistre automatiquement les réponses dans Google Sheets ; Gmail propose des
  modèles de réponse et des filtres.
- Outils : Make (formule gratuite limitée), Zapier (formule gratuite limitée), n8n (logiciel libre, on peut l'installer
  soi-même ; version en ligne payante après l'essai).
- Exemples utiles : enregistrer les commandes dans Google Sheets, relancer un client, recevoir chaque matin un résumé,
  publier un message programmé.
- L'IA aide à écrire l'automatisation : « Explique-moi étape par étape comment faire dans Make : quand… alors… ».
- Erreur fréquente : tout automatiser d'un coup ; commencer par une seule tâche répétitive et la tester.

## applications
- Petite application web sans coder : décrire l'idée à Claude (application interactive dans l'aperçu, partageable avec
  « Publier ») ou à Google AI Studio (aistudio.google.com, mode de création d'applications à partir d'une description).
- Exemples : calculatrice de prix de vente, quiz de révision pour élèves, suivi de stock simple, prise de commandes.
- Méthode : 1) décrire précisément qui l'utilise et ce qu'elle doit faire ; 2) générer ; 3) tester chaque bouton ;
  4) demander les corrections une par une ; 5) partager le lien.
- Limites : les données sensibles et les paiements demandent un vrai développeur ; vérifier ce que l'application garde.

## pourquoi
- Compétences concrètes à apprendre : bien écrire ses demandes (prompts), vérifier les réponses, créer du contenu, créer
  des pages et petites applications, automatiser des tâches, utiliser l'IA dans son métier.
- L'IA aide déjà au quotidien : rédiger, résumer, traduire (français, anglais…), créer des visuels, analyser un tableau.
- Pour les jeunes et les entreprises africaines : gagner en autonomie, proposer des services (pages web, contenus,
  automatisations) à d'autres commerçants, mieux servir ses clients.
- Par où commencer : un outil gratuit (ChatGPT, Claude ou Gemini), un vrai problème de son activité, 15 minutes de
  pratique par jour, se former auprès de Lomé IA School. Pas de chiffres, pas de peur.

## business
- Fiches produits et légendes Facebook / TikTok / Instagram : donner à l'IA le produit, le public, le ton ; demander
  plusieurs versions et des idées de vidéos.
- Visuels : Canva (version gratuite, outils de création assistés) ; photos de produits nettes à la lumière du jour.
- Service client : préparer avec l'IA des réponses types, puis les enregistrer en réponses rapides WhatsApp Business.
- Devis et factures : modèle dans Google Sheets ; l'IA explique les formules (« écris la formule qui calcule le total
  avec la quantité et le prix »).
- Calendrier de publications : « Fais-moi un planning de 7 publications pour ma boutique, avec le texte de chacune ».

## panorama
- Commerce : fiches produits, réponses aux clients, petites pages de vente, suivi des commandes dans un tableau.
- Éducation : préparer des cours, des quiz, des exercices corrigés ; l'élève peut se faire expliquer et interroger.
- Restauration : menus, descriptions de plats, publications, prise de commandes par formulaire.
- Couture et mode : idées de modèles, descriptions, catalogue photo, messages aux clients.
- Bureau et administration : courriers, comptes rendus, résumés de documents, tableaux.
- Création de contenu : scripts de vidéos, sous-titres, visuels, idées de séries.
- Outils cités : ChatGPT, Claude, Gemini, Perplexity, Canva, Google Sheets, WhatsApp Business.
