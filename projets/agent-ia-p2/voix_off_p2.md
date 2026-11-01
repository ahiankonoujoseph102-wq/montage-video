# Deuxième partie — voix off à enregistrer (58 morceaux, environ 9 minutes)

Lisez calmement, une petite pause entre deux morceaux. Ne lisez pas les numéros ni les titres.
Entre crochets : la démonstration ou l'image qui passe pendant ce morceau.

## Vidéo 2A — La boucle de travail : Claude Code construit l'étape 1

VO-1 [titre animé] Formation : Comment créer un agent IA, de A à Z. Deuxième partie. Partie 2A : la boucle de travail.

VO-2 [carte « Dans la partie 1 »] Dans la première partie, vous avez écrit votre projet dans le bloc-notes, vous l'avez donné à Claude, votre chef de projet, et vous avez obtenu votre cahier des charges. Maintenant, on construit.

VO-3 [illustration] Avant de continuer, un conseil important. Prenez le temps de bien décrire votre projet. C'est vous qui avez l'idée. Claude peut vous aider à l'améliorer, mais si vous le laissez tout décider, vous obtiendrez un agent ordinaire, comme tout le monde.

VO-4 [démo : micro du clavier] Si écrire vous fatigue, parlez. Touchez le micro de votre clavier et dictez votre idée, comme à un ami. Vous pouvez aussi utiliser le mode vocal de ChatGPT, puis copier le texte.

VO-5 [démo : copier le message du chef de projet] Dans la partie 1, le chef de projet a validé le plan de Claude Code avec trois corrections. Je copie son message : « Validé, lance l'étape 1 ».

VO-6 [démo : coller dans Claude Code, Envoyer] J'ouvre Claude Code, je colle le message et je touche Envoyer. Claude Code commence à construire.

VO-7 [carton « Claude Code travaille »] Claude Code travaille tout seul. Cela peut prendre plusieurs minutes, parfois plus. Vous pouvez faire autre chose pendant ce temps.

VO-8 [démo : copier le compte rendu, le coller chez le chef] Claude Code a fini. Il écrit un compte rendu. Je le copie en entier, je l'envoie à mon chef de projet, et je lui demande de le vérifier.

VO-9 [démo : le résumé du chef] Le chef de projet lit le compte rendu et me résume, en mots simples, ce qui a été fait : le site est en français, la page « Mes projets » fonctionne, et les trois corrections sont appliquées.

VO-10 [illustration : la pull request] Il me parle aussi d'une pull request. C'est simple : Claude Code travaille sur une copie de votre projet. Quand le travail est vérifié, on fusionne cette copie dans le dépôt, votre coffre-fort. Fusionner, c'est ranger le travail terminé à sa place.

VO-11 [démo : la règle de fusion] Vous pouvez fusionner vous-même sur GitHub, ou demander à Claude Code de le faire. Moi, je lui ai donné cette règle : si les vérifications automatiques de GitHub sont vertes, fusionne toi-même ; sinon, corrige et recommence.

VO-12 [démo : captures de l'application] Et voici le résultat de l'étape 1 : la première version de l'application, avec la page « Mes projets ».

VO-13 [schéma de la boucle] Retenez la boucle. Un : le chef de projet donne la consigne. Deux : Claude Code construit. Trois : vous copiez son compte rendu au chef de projet. Quatre : le chef vérifie et vous dit quoi faire. Cinq : on valide, et on passe à l'étape suivante.

VO-14 [fin] Dans la prochaine vidéo, on choisit le moteur et le cerveau de votre agent, en dépensant le moins possible.

## Vidéo 2B — Le moteur et le cerveau de votre agent

VO-15 [titre animé] Partie 2B : le moteur et le cerveau de votre agent.

VO-16 [démo : le chef annonce l'étape 2] Pour l'étape 2, mon chef de projet me demande deux comptes : Anthropic, qui est payant à l'utilisation, et E2B, pour les ordinateurs virtuels de mon agent.

VO-17 [démo : mon message sur Gemini] Je ne suis pas d'accord : Anthropic coûte cher. Alors je lui pose la question : et si j'utilisais Gemini, qui a une offre gratuite ? C'est vous le patron : discutez avec votre chef de projet.

VO-18 [illustration : la voiture et le carburant] Il m'explique une chose importante. Un agent a deux parties. Le moteur, c'est le programme qui fait agir l'agent. Le cerveau, c'est le modèle d'IA qui le fait réfléchir. Le moteur prévu au départ n'acceptait qu'un seul cerveau, payant : comme une voiture qui ne roule qu'avec le carburant le plus cher.

VO-19 [démo : la recommandation] Sa recommandation : prendre un moteur multi-modèle, une voiture qui accepte plusieurs carburants. Pendant la construction, on branche Gemini, gratuit. Au lancement, on choisira le meilleur cerveau, sans tout reconstruire.

VO-20 [démo : les recherches de Claude Code] Claude Code fait des recherches et propose OpenCode : un moteur libre, utilisable pour un projet commercial, qui accepte plusieurs modèles d'IA.

VO-21 [carte] Attention : Gemini, E2B et OpenCode sont les choix de mon projet, Kekeli. Pour votre agent, votre chef de projet choisira peut-être d'autres outils. La méthode, elle, reste la même.

VO-22 [illustration : la jauge] L'offre gratuite a des limites. Elle suffit pour construire et tester. Avec de vrais clients, il faudra un modèle payant. Le chef de projet me l'a dit franchement, et il a raison.

VO-23 [démo : le message aux utilisateurs] Je lui ai aussi demandé ce que verront mes utilisateurs quand la limite sera atteinte. Ensemble, on a choisi un message clair : « Votre énergie du jour est épuisée. Elle sera de nouveau prête demain. »

VO-24 [carte] Un conseil : lisez toujours le prompt que le chef de projet vous donne, avant de l'envoyer à Claude Code. Si quelque chose ne vous plaît pas, dites-le. C'est votre projet.

VO-25 [fin] Dans la prochaine vidéo, on crée les clés API, et on les range en sécurité.

## Vidéo 2C — Créer vos clés API et les ranger en sécurité

VO-26 [titre animé] Partie 2C : créer vos clés API et les ranger en sécurité.

VO-27 [rappel : la clé API] Rappelez-vous : une clé API est un code secret. Avec elle, un service sait que c'est vous, et c'est vous qui payez. Vous ne la montrez jamais à personne.

VO-28 [démo AI Studio : ouvrir le site] Première clé : Gemini. Dans Google, tapez aistudio.google.com et connectez-vous avec votre compte Google.

VO-29 [démo : accepter les conditions] La première fois, Google pose quelques questions. Lisez, cochez, puis touchez Continuer.

VO-30 [démo : Créer une clé] Ouvrez « Clés API », puis touchez « Créer une clé ».

VO-31 [démo : nommer la clé, créer un projet] Donnez un nom à la clé, par exemple le nom de votre projet. Choisissez « Créer un projet », puis validez.

VO-32 [démo : copier la clé, floutée] Votre clé s'affiche. Touchez Copier. Sur l'écran, je l'ai floutée : vous, vous ne la montrez jamais.

VO-33 [démo E2B : ouvrir le site] Deuxième clé : E2B. Ouvrez e2b.dev et touchez « Commencer à construire ».

VO-34 [démo : s'inscrire avec GitHub] Inscrivez-vous avec votre compte GitHub, puis autorisez l'accès.

VO-35 [démo : code reçu par e-mail, flouté] E2B vous envoie un code par e-mail. Ouvrez votre messagerie, copiez le code, puis collez-le. Ce code aussi est secret.

VO-36 [démo : tableau de bord, API Keys] Dans le tableau de bord, ouvrez « API Keys ».

VO-37 [démo : créer la clé] Touchez « Créer une clé », donnez-lui un nom, puis validez.

VO-38 [démo : copier la clé, floutée] Copiez la clé. Là encore, je l'ai floutée.

VO-39 [carte « Où ne pas ranger vos clés »] Dans la vidéo, j'ai collé mes clés dans mon bloc-notes. Ne faites pas comme moi : un bloc-notes n'est pas un coffre-fort. Collez vos clés directement dans Claude Code, ou gardez-les dans un gestionnaire de mots de passe. Jamais dans WhatsApp, jamais sur une capture d'écran.

VO-40 [démo R1 : menu des environnements] Maintenant, on donne les clés à Claude Code. Ouvrez Claude Code, touchez le menu des environnements, choisissez l'environnement de votre projet, puis touchez Modifier.

VO-41 [démo R1 : variables d'environnement] Descendez jusqu'à « Variables d'environnement ».

VO-42 [démo R1 : taper les deux lignes] Écrivez une ligne par clé : le nom de la clé, le signe égal, puis la clé, sans espace. Le chef de projet vous donne les noms exacts. Pour moi : GEMINI_API_KEY et E2B_API_KEY.

VO-43 [démo R1 : Enregistrer] Touchez « Enregistrer les modifications ».

VO-44 [démo R1 : nouvelle session] Attention, c'est le piège : une session déjà ouverte ne voit pas les nouvelles clés. Touchez « Nouvelle session ».

VO-45 [démo R1 : choisir le dépôt et l'environnement, puis vérifier] Choisissez votre dépôt et le même environnement. Puis demandez à Claude Code de vérifier qu'il voit les clés, sans jamais les afficher.

VO-46 [démo : « les deux clés sont présentes »] Claude Code répond : les deux clés obligatoires sont présentes. Il peut lancer l'étape 2.

VO-47 [carte « Si Claude Code ne voit pas vos clés »] Si Claude Code ne voit pas vos clés, vérifiez trois choses : vous avez touché Enregistrer ; vous avez ouvert une nouvelle session ; et vous avez choisi le bon environnement. Si vous êtes bloqué, envoyez une capture à votre chef de projet, sans clé visible : il vous guidera pas à pas.

VO-48 [fin] Dans la prochaine vidéo, on suit la construction jusqu'au bout.

## Vidéo 2D — Suivre la construction jusqu'au bout

VO-49 [titre animé] Partie 2D : suivre la construction jusqu'au bout.

VO-50 [démo : la barre de limite] Regardez cette barre dans Claude Code : c'est votre limite d'utilisation. Quand elle est pleine, Claude Code s'arrête.

VO-51 [illustration : la jauge de 5 heures] Pas de panique : la limite revient après quelques heures. Profitez-en pour vérifier le travail, puis reprenez là où vous vous êtes arrêté.

VO-52 [démo : copier le compte rendu] À chaque étape, c'est la même boucle. Claude Code a fini : je copie son compte rendu.

VO-53 [démo : l'envoyer au chef de projet] Je l'envoie à mon chef de projet. Il vérifie et me dit si on peut continuer.

VO-54 [démo : les 13 captures] Claude Code m'envoie aussi des captures de l'application. Je les regarde toutes. Si quelque chose ne me plaît pas, je le dis. Sinon, je valide, et on passe à l'étape suivante.

VO-55 [carte « L'abonnement Claude Code »] Claude Code demande un abonnement payant. Pour un projet sérieux, je vous le recommande : c'est l'outil qui écrit votre code. Vérifiez le prix à jour sur le site de Claude avant de vous abonner.

VO-56 [schéma : toute la méthode] Récapitulons. Un : le bloc-notes, où vous décrivez votre projet en détail. Deux : Claude, votre chef de projet, qui en fait un cahier des charges. Trois : Claude Code, votre développeur, qui construit étape par étape. Et vous, le patron, faites le lien entre les deux.

VO-57 [carte « Votre devoir »] Votre devoir avant la partie 3. Lancez la première étape de votre propre agent. Faites au moins un tour complet de la boucle : consigne, construction, compte rendu, vérification. Puis envoyez dans le groupe WhatsApp une capture de votre premier résultat, sans aucune clé visible.

VO-58 [fin] Bravo pour votre travail. La suite arrive très bientôt !
