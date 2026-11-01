"""Contenu des documents de la partie 2 : guide de la partie, chapitres ajoutés au guide général, tests, réponses.
Tout vient des vidéos 2A à 2D (aucun chiffre inventé)."""

COUV = dict(ecole="LOMÉ IA SCHOOL", public="Pour les débutants : aucune connaissance technique n'est nécessaire.",
            contact="Joseph Ahiankonou · lomeiaschool.laravel.cloud · +228 72 24 02 31")

REGLE_FUSION = ["Surveille toi-même la pull request. Quand la vérification automatique",
                "de GitHub est verte, fusionne-la toi-même dans main. Si elle échoue,",
                "corrige, renvoie, et attends qu'elle passe au vert avant de fusionner.",
                "À partir de maintenant, c'est la règle pour toutes les étapes."]
VERIF_CLES = ["Vérifie d'abord si tu vois les clés (par exemple GEMINI_API_KEY et",
              "E2B_API_KEY), sans jamais afficher leur valeur. Si tout est bon,",
              "lance l'étape suivante du plan."]


def guide_partie2(D):
    """Chapitres du guide de la partie 2 (aussi ajoutés au guide général)."""
    D.h2("La boucle de travail, en 5 temps")
    D.numeros(["Le **chef de projet** (Claude) vous donne la consigne de l'étape.",
               "**Claude Code** construit. Il travaille tout seul : cela peut prendre plusieurs minutes, parfois beaucoup plus.",
               "Vous **copiez son compte rendu en entier** et vous l'envoyez au chef de projet, tel quel. Pas besoin d'expliquer.",
               "Le chef **vérifie** et vous dit quoi faire, en mots simples.",
               "On **valide**, et on passe à l'étape suivante. Étape par étape, jusqu'à la fin du projet."])
    D.encadre("conseil", "Règle d'or", "ne faites jamais rien dans Claude Code sans passer par votre chef de projet. C'est lui qui doit avoir "
              "toutes les informations : s'il y a un problème, il comprendra tout de suite et vous débloquera.")
    D.p("Si une remarque du chef de projet ne vous convient pas, dites-le-lui. Si une réponse vous semble bizarre, posez vos "
        "questions. Si on vous demande de créer un compte et que vous ne savez pas faire : envoyez une capture d'écran et "
        "demandez « Guide-moi étape par étape ».")

    D.h2("La pull request et la règle de fusion")
    D.p("Claude Code travaille sur une **copie** de votre projet. Quand le travail est vérifié, on **fusionne** cette copie dans "
        "le dépôt, votre coffre-fort. Fusionner, c'est ranger le travail terminé à sa place.")
    D.p("Vous pouvez fusionner vous-même sur GitHub : ouvrez la pull request, descendez en bas, touchez « Merge pull request », "
        "puis « Confirm merge ». Ou donnez une fois pour toutes cette règle à Claude Code :")
    D.message(REGLE_FUSION, "Message à copier dans Claude Code")

    D.h2("Le moteur et le cerveau de votre agent")
    D.puces(["**Le moteur** : le programme qui fait agir l'agent (lire, écrire, travailler sur les fichiers).",
             "**Le cerveau** : le modèle d'IA qui le fait réfléchir (Gemini, Claude ou un autre).",
             "Un moteur **multi-modèle**, c'est une voiture qui accepte plusieurs carburants : on change de cerveau à tout "
             "moment, sans reconstruire la voiture."])
    D.p("Pour Kekeli : pendant la construction, Gemini (offre gratuite) ; au lancement, avec de vrais clients, on choisira le "
        "cerveau qui donne la meilleure qualité, car l'offre gratuite ne suffira pas. Le moteur choisi : OpenCode. Les "
        "ordinateurs virtuels : E2B.")
    D.encadre("attention", "Attention", "Gemini, E2B et OpenCode sont les choix de mon projet. Pour votre agent, votre chef de projet "
              "choisira peut-être d'autres outils. La méthode, elle, reste la même. Et lisez toujours le prompt avant de l'envoyer.")

    D.h2("Créer vos clés API")
    D.p("Une clé API est un code secret : avec elle, un service sait que c'est vous, et c'est vous qui payez. Vous ne la montrez "
        "jamais à personne. Suivez exactement les étapes que vous donne votre chef de projet. Pour Kekeli :")
    D.p("**Clé Gemini (Google AI Studio)**")
    D.numeros(["Dans Google, tapez **aistudio.google.com** et connectez-vous avec votre compte Google.",
               "La première fois, lisez les questions, cochez, puis touchez « Continuer ».",
               "Ouvrez « Clés API », puis touchez « Créer une clé ».",
               "Donnez-lui un nom (facultatif), choisissez « Créer un projet », puis validez.",
               "Touchez « Copier ». Ne montrez jamais cette clé."])
    D.p("**Clé E2B (les ordinateurs virtuels)**")
    D.numeros(["Ouvrez **e2b.dev** et touchez « Commencer à construire ».",
               "Inscrivez-vous avec votre compte GitHub, puis autorisez l'accès.",
               "Copiez le code reçu par e-mail et collez-le. Ce code aussi est secret.",
               "Dans le tableau de bord, ouvrez « API Keys », touchez « Créer une clé », donnez-lui un nom, validez.",
               "Copiez la clé : elle ne sera plus affichée ensuite."])
    D.encadre("attention", "Où ne pas ranger vos clés", "ni dans le bloc-notes (ce n'est pas un coffre-fort), ni dans WhatsApp, "
              "ni sur une capture d'écran. Collez-les directement dans Claude Code, ou gardez-les dans un gestionnaire de mots de passe.")

    D.h2("Placer les clés dans Claude Code")
    D.numeros(["Dans Claude Code, ouvrez le menu des environnements, choisissez l'environnement de votre projet, puis touchez « Modifier ».",
               "Descendez jusqu'à « Variables d'environnement ».",
               "Écrivez une ligne par clé : le NOM, le signe =, puis la clé, sans espace. Le chef de projet vous donne les noms "
               "exacts (pour moi : GEMINI_API_KEY et E2B_API_KEY).",
               "Touchez « Enregistrer les modifications ».",
               "Ouvrez une **nouvelle session** sur votre dépôt et cet environnement, puis demandez la vérification :"])
    D.message(VERIF_CLES, "Message à copier dans Claude Code")
    D.p("L'environnement, c'est comme une maison : on y range les clés. La session, c'est une pièce : une session ouverte "
        "avant d'avoir rangé les clés ne les verra jamais.")
    D.encadre("conseil", "Si Claude Code ne voit pas vos clés", "vérifiez trois choses : vous avez touché « Enregistrer » ; vous avez "
              "ouvert une nouvelle session ; vous avez choisi le bon environnement (pas « Default » si vos clés sont ailleurs). "
              "Toujours bloqué ? Envoyez une capture au chef de projet, sans clé visible.")

    D.h2("Suivre la construction jusqu'au bout")
    D.puces(["**La barre de limite d'utilisation** : quand elle devient toute rouge, Claude Code s'arrête. Attendez quelques "
             "heures, puis reprenez. Profitez-en pour vérifier le travail.",
             "**Ne validez pas tout de suite** : copiez d'abord le compte rendu au chef de projet.",
             "**Regardez toutes les captures** envoyées par Claude Code. Une capture vous gêne ? Envoyez-la au chef de projet.",
             "**Validez** seulement quand tout est bon : Claude Code passe à l'étape suivante."])


def devoir_partie3(D):
    D.p("Avant la partie 3 :")
    D.numeros(["Lancez la **première étape** de votre propre agent avec Claude Code.",
               "Faites au moins **un tour complet de la boucle** : consigne, construction, compte rendu, vérification.",
               "Envoyez dans le groupe WhatsApp **une capture de votre premier résultat**, sans aucune clé visible."])
    D.encadre("vert", "Rappel", "bloqué à une étape ? Dites-le simplement à votre chef de projet, envoyez une capture, et demandez-lui de "
              "vous guider étape par étape. Et si vous restez bloqué, écrivez-moi dans le groupe.")


# ------------------------------------------------------------------------- tests
# (question, [choix] ou None pour une réponse libre, réponse, explication)
TESTS = {
    "2A": ("La boucle de travail", [
        ("Que faites-vous du compte rendu de Claude Code ?", ["Je le résume avec mes mots", "Je le copie en entier et je l'envoie au chef de projet, tel quel", "Je l'ignore"],
         "B", "On copie le compte rendu en entier et on l'envoie tel quel : le chef de projet comprend tout seul."),
        ("Quelle est la règle d'or ?", ["Ne rien faire dans Claude Code sans passer par le chef de projet", "Toujours fusionner soi-même", "Laisser Claude tout décider"],
         "A", "Le chef de projet doit avoir toutes les informations pour vous débloquer en cas de problème."),
        ("Pourquoi faut-il bien décrire son projet soi-même ?", ["Pour aller plus vite", "Si Claude décide de tout, on obtient un agent ordinaire, comme tout le monde", "Ce n'est pas nécessaire"],
         "B", "Claude aide seulement à ajuster ce qui manque sur le plan technique ; la vision, c'est vous."),
        ("Une pull request, c'est…", ["un paiement", "le travail de Claude Code sur une copie du projet, à vérifier puis à fusionner", "un compte GitHub"],
         "B", "Fusionner, c'est ranger le travail terminé à sa place, dans le dépôt (le coffre-fort)."),
        ("Pour fusionner vous-même sur GitHub, quels sont les deux boutons à toucher ?", None,
         "« Merge pull request », puis « Confirm merge »", "On ouvre la pull request, on descend en bas, puis ces deux boutons."),
        ("Si les vérifications automatiques de GitHub sont rouges, que fait Claude Code avec la règle de fusion ?", ["Il fusionne quand même", "Il corrige, renvoie, et attend qu'elles passent au vert", "Il s'arrête définitivement"],
         "B", "Vert : il fusionne tout seul. Rouge : il corrige, renvoie et attend le vert."),
        ("Votre chef de projet vous demande de créer un compte et vous ne savez pas faire. Que faites-vous ?", None,
         "Je le lui dis simplement, j'envoie une capture d'écran et je lui demande de me guider étape par étape.", "Il le fera."),
        ("Remettez la boucle dans l'ordre : (a) le chef vérifie, (b) Claude Code construit, (c) le chef donne la consigne, (d) on valide, (e) vous copiez le compte rendu.", None,
         "c, b, e, a, d", "Consigne, construction, compte rendu, vérification, validation."),
    ]),
    "2B": ("Le moteur et le cerveau", [
        ("Dans un agent de programmation, le « moteur » c'est…", ["le modèle d'IA qui réfléchit", "le programme qui fait agir l'agent (lire, écrire, travailler sur les fichiers)", "le téléphone"],
         "B", "Le cerveau, lui, c'est le modèle d'IA qui le fait réfléchir."),
        ("Qu'est-ce qu'un moteur multi-modèle ?", ["Une voiture qui accepte plusieurs carburants", "Un moteur qui ne marche qu'avec Claude", "Un moteur payant"],
         "A", "On peut changer de cerveau à tout moment, sans reconstruire l'agent."),
        ("Pour Kekeli, quel cerveau pendant la construction ?", ["Gemini, avec son offre gratuite", "Aucun", "Uniquement Claude, payant"],
         "A", "Au lancement, avec de vrais clients, on choisira le cerveau qui donne la meilleure qualité."),
        ("Pourquoi l'offre gratuite ne suffira pas avec de vrais clients ?", None,
         "Ses limites sont trop basses : avec plusieurs clients, elle sera vite épuisée.", "Le chef de projet l'a dit franchement."),
        ("Vous ne comprenez pas une recommandation du chef de projet. Que faites-vous ?", ["Je valide quand même", "Je lui demande de l'expliquer plus simplement", "J'abandonne"],
         "B", "N'ayez jamais honte de demander."),
        ("Une proposition ne vous convient pas (par exemple le prix). Que faites-vous ?", None,
         "Je le dis et je discute avec mon chef de projet : c'est moi le patron.", "À la fin, c'est vous qui décidez."),
        ("Que faut-il toujours faire avant d'envoyer un prompt à Claude Code ?", ["Le lire", "Le traduire", "Le raccourcir"],
         "A", "En lisant, on repère une phrase à préciser (ex. : ce que voient les utilisateurs quand la limite est atteinte)."),
        ("Gemini, E2B et OpenCode sont-ils obligatoires pour votre agent ?", ["Oui, toujours", "Non : ce sont les choix de Kekeli, votre chef de projet choisira peut-être d'autres outils"],
         "B", "La méthode reste la même."),
    ]),
    "2C": ("Les clés API", [
        ("Une clé API, c'est…", ["un mot de passe à partager", "un code secret : le service sait que c'est vous, et c'est vous qui payez", "un nom de projet"],
         "B", "On ne la montre jamais à personne."),
        ("Sur quel site crée-t-on la clé Gemini ?", None, "aistudio.google.com (Google AI Studio)", "Puis « Clés API », « Créer une clé »."),
        ("Avec quel compte s'inscrit-on sur E2B dans la vidéo ?", ["Facebook", "GitHub", "WhatsApp"], "B", "Puis on autorise l'accès."),
        ("Le code reçu par e-mail pour E2B est-il secret ?", ["Oui", "Non"], "A", "Comme la clé et les mots de passe."),
        ("Où ne faut-il PAS ranger ses clés ? (plusieurs réponses)", ["Le bloc-notes", "WhatsApp", "Une capture d'écran", "Les variables d'environnement de Claude Code"],
         "A, B et C", "Les variables d'environnement de Claude Code (ou un gestionnaire de mots de passe) sont les bons endroits."),
        ("Comment écrit-on une clé dans les variables d'environnement ?", None,
         "Une ligne par clé : NOM=clé, sans espace (ex. GEMINI_API_KEY=…)", "Le chef de projet donne les noms exacts."),
        ("Claude Code ne voit pas les clés. Quelles sont les trois vérifications ?", None,
         "J'ai touché « Enregistrer » ; j'ai ouvert une nouvelle session ; j'ai choisi le bon environnement.", "Une session ouverte avant d'avoir rangé les clés ne les verra jamais."),
        ("L'environnement est une maison, la session est…", ["le toit", "une pièce de la maison", "la clé"], "B", "Il faut une nouvelle pièce (nouvelle session) après avoir rangé les clés."),
    ]),
    "2D": ("Suivre la construction", [
        ("La barre de limite d'utilisation devient toute rouge. Que se passe-t-il ?", ["Claude Code s'arrête : il faut attendre quelques heures", "Le projet est effacé", "Il faut payer tout de suite"],
         "A", "Pas de panique : profitez-en pour vérifier le travail, puis reprenez."),
        ("Claude Code a fini une étape et vous demande de valider. Que faites-vous d'abord ?", ["Je valide tout de suite", "Je copie son compte rendu et je l'envoie au chef de projet"],
         "B", "Le chef vérifie avant qu'on valide."),
        ("Que faites-vous des captures envoyées par Claude Code ?", None,
         "Je les ouvre et je les regarde toutes ; si une capture ne me plaît pas, je l'envoie au chef de projet.", "Dans la vidéo, il y en avait 13."),
        ("Remettez la méthode dans l'ordre : (a) Claude Code construit, (b) le bloc-notes, (c) Claude en fait un cahier des charges.", None,
         "b, c, a", "Et vous, le patron, faites le lien entre les deux."),
        ("Pour qu'un agent soit bien, que faut-il donner ?", ["Le moins d'informations possible", "Tous les détails, et suivre le projet de près"],
         "B", "Sinon, si on laisse l'IA deviner, on n'a pas de bonnes choses."),
        ("Quel est votre devoir avant la partie 3 ?", None,
         "Lancer la première étape de mon agent, faire un tour complet de la boucle, envoyer une capture de mon premier résultat dans le groupe, sans clé visible.",
         "Consigne, construction, compte rendu, vérification."),
    ]),
}

TITRES_VIDEOS = {"2A": "Vidéo 2A — La boucle de travail", "2B": "Vidéo 2B — Le moteur et le cerveau de votre agent",
                 "2C": "Vidéo 2C — Créer vos clés API et les ranger en sécurité", "2D": "Vidéo 2D — Suivre la construction jusqu'au bout"}
