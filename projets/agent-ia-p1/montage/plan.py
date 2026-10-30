"""Plan de montage des vidéos 1A et 1B : l'ordre des voix et ce qu'on voit pendant chacune.

Éléments :
  ("phrases", "P8.1", "P8.4", visuel)    phrases enregistrées (voir sorties/phrases.json), de la première à la dernière
  ("live", rush, debut, fin, coupes, visuel)  parole de Joseph pendant son enregistrement d'écran (image et son ensemble)
  ("pause", duree, visuel)                  sans voix (titre de chapitre, démonstration muette)
Visuels :
  carte(titre, emoji, points, style)  Coach Joseph en grand à droite, points qui apparaissent sur leur mot
  ecran(rush, debut, fin, titre)      enregistrement d'écran ralenti ou accéléré sur la voix, zone agrandie, médaillon
"""

A = "rushes/20261027-153738.mp4"
B = "rushes/20261027-154022.mp4"
C = "rushes/20261027-155554.mp4"
D = "rushes/20261027-165105.mp4"
E = "rushes/20261027-165809.mp4"
F = "rushes/20261027-172414.mp4"
G = "rushes/20261029-091019.mp4"
R1 = "voix/chef-de-projet.mp4"


def carte(titre, emoji, points, style="liste", definition=None):
    return {"mode": "carte", "titre": titre, "emoji": emoji, "points": [{"texte": t, "mot": m} for t, m in points],
            "style": style, "definition": definition}


def notion(titre, emoji, definition, points):
    return carte(titre, emoji, points, "notion", definition)


def flux(titre, emoji, points):
    return carte(titre, emoji, points, "flux")


def ecran(rush, debut, fin, titre):
    return {"mode": "ecran", "rush": rush, "vs": debut, "ve": fin, "titre": titre}


def live(titre):
    return {"mode": "live", "titre": titre}


def chapitre(n, titre, emoji):
    return ("pause", 2.6, {"mode": "chapitre", "n": n, "titre": titre, "emoji": emoji})


# Paroles à retirer à la main (source, début, fin) : « Et c'est ça. » avant « Et c'est là sa limite ».
COUPES = [("rushes/20261027-153738.mp4", 238.0, 239.4),
          ("rushes/20261027-153738.mp4", 642.5, 644.5),   # « I. Tout est rangé. » (début recommencé)
          ("rushes/20261027-153738.mp4", 692.5, 698.4),   # 2e prise de « Talkami est hébergé sur Laravel Cloud » (la 1re est plus nette)
          ("voix/audio-2.m4a", 35.7, 38.6),               # « Ma vraie force, le français » commencé puis redit
          ("voix/audio-2.m4a", 234.6, 240.0),
          ("rushes/20261027-153738.mp4", 890.7, 894.8),
          ("voix/recapitulatif.mp4", 152.2, 159.3)]        # « Six : envoyez-moi… de l'information » (redit ensuite correctement)   # 1re prise de « Je vous le dis franchement… »             # 1re prise de « Je copie sa réponse, je l'envoie… »

# Début forcé d'une phrase (mot de trop juste avant) : « Et 4. » avant « Une erreur arrive ».
DEBUT_FORCE = {"E4.101": 519.80}

VIDEO_1A = [
    ("phrases", "E1.1", "E1.3", {"mode": "intro", "partie": "1A", "sous_titre": "Comprendre"}),
    chapitre(1, "Bienvenue dans la formation", "👋"),
    ("phrases", "P1.1", "P1.3", carte("Coach Joseph", "👋", [("Fondateur de Lomé IA School", "fondateur"), ("Formateur en IA depuis 2023", "depuis"), ("Plus de 1 000 personnes accompagnées", "accompagne")])),
    ("phrases", "P2.1", "P2.3", carte("Pourquoi cette formation ?", "🎯", [("Tout le monde parle d'IA", "parle"), ("Peu savent créer un outil qui travaille pour eux", "outil"), ("Votre agent IA travaille même quand vous dormez", "dormez")])),
    ("phrases", "P3.1", "P3.3", carte("Ma preuve : Talkami", "🎓", [("Teacher Joe enseigne l'anglais à l'oral", "teacher"), ("Construit uniquement depuis mon téléphone", "telephone"), ("Avec la méthode de cette formation", "methode")])),
    ("phrases", "P4.1", "P4.5", carte("Pas besoin de savoir programmer", "💡", [("Une formation pour les débutants", "debutants"), ("Chaque mot technique expliqué simplement", "explique"), ("Ce qu'il vous faut : une méthode", "methode")])),
    ("phrases", "P5.1", "P5.5", flux("Le chemin de la formation", "🗺️", [("Comprendre l'IA et l'agent IA", "comprendre"), ("Les mots importants", "mots"), ("Créer les comptes", "comptes"), ("La méthode complète", "methode"), ("Les erreurs à éviter", "erreurs")])),
    ("phrases", "P6.1", "P6.8", carte("Un vrai cas pratique", "🛠️", [("Un agent de programmation, comme Claude Code", "programmation"), ("En français, sur téléphone, payé par Mobile Money", "mobile"), ("Un projet avancé, choisi exprès", "avance"), ("Pour vous : commencez plus simple", "simple")])),
    ("phrases", "P7.1", "P7.4", carte("Votre guide", "📘", [("« Préparer son agent IA »", "guide"), ("Toutes les fiches et tous les messages", "fiches"), ("Gardez-le à côté de vous", "cote")])),
    chapitre(2, "C'est quoi, une IA ? Et un agent IA ?", "🤖"),
    ("phrases", "P8.1", "P8.4", notion("L'intelligence artificielle", "🧠", "Un programme qui comprend et vous répond intelligemment", [("Elle a appris en lisant énormément de textes", "lisant"), ("Elle écrit, explique, traduit, résume", "traduire")])),
    ("phrases", "P9.1", "P9.5", carte("Une image pour comprendre", "📚", [("Elle a lu presque toutes les bibliothèques", "bibliotheques"), ("Mais elle ne vous connaît pas", "connait"), ("Ni votre entreprise, ni vos clients, ni vos prix", "prix")])),
    ("phrases", "P10.1", "P11.4", ecran(A, 286, 313, "Une IA simple répond… puis elle attend")),
    ("phrases", "P12.1", "P12.2", carte("Un agent IA = une IA + 3 choses", "🤖", [("Un rôle : son métier", "role"), ("Des informations : ce qu'il doit savoir", "informations"), ("Des outils : WhatsApp, agenda, e-mail", "outils")])),
    ("phrases", "P13.1", "P13.3", carte("L'image de l'employé", "👔", [("L'IA : un cerveau très intelligent", "cerveau"), ("L'agent IA : un employé formé pour vous", "employe"), ("Il agit tout seul", "seul")])),
    ("phrases", "P14.1", "P14.2", carte("Exemple : Teacher Joe", "🎓", [("Rôle : enseigner l'anglais à l'oral", "role"), ("Informations : niveau, programme, erreurs", "informations"), ("Outils : la voix, le tableau, les documents", "outils"), ("Il fait la séance tout seul", "seul")])),
    ("phrases", "P15.1", "P15.2", flux("Le cycle d'un agent", "🔄", [("Il reçoit un message", "recoit"), ("Il réfléchit", "reflechit"), ("Il utilise un outil", "utilise"), ("Il répond ou il agit", "agit")])),
    ("phrases", "P16.1", "P17.3", carte("Les 6 types d'agents", "🧩", [("1. Professeur", "professeur"), ("2. Service client et vente", "vente"), ("3. Contenu", "contenu"), ("4. Rendez-vous", "rendez"), ("5. Automatisation", "automatisation"), ("6. Vocal", "vocal")])),
    ("phrases", "P18.1", "P18.3", carte("Votre première décision", "❓", [("Quel type d'agent créer ?", "type"), ("« Quel agent pourrait m'aider dans mon activité ? »", "activite")])),
    chapitre(3, "Les 10 mots à connaître", "🔑"),
    ("phrases", "P19.1", "P19.3", carte("Pour chaque mot", "🔑", [("Ce que c'est", "dire"), ("Une image de la vie courante", "image"), ("Un exemple", "exemple"), ("Pourquoi c'est important", "important")])),
    ("phrases", "P20.1", "P20.6", notion("1. Le prompt", "💬", "Le message que vous écrivez à une IA", [("Comme une consigne donnée à un employé", "consigne"), ("« Écris-moi un message poli… »", "exemple"), ("Toute la méthode repose sur de bons prompts", "repose")])),
    ("phrases", "P21.1", "P21.7", notion("2. Le cahier des charges", "📐", "Tout ce que votre agent doit savoir et faire", [("Comme le plan d'une maison", "plan"), ("Prix, horaires, rendez-vous, interdits", "prix"), ("Le document le plus important", "important")])),
    ("phrases", "P22.1", "P22.6", notion("3. Le chef de projet", "👷", "Il organise, vérifie et vous guide", [("Comme le chef de chantier", "chantier"), ("Dans notre méthode : Claude", "claude"), ("Il connaît la technique pour vous", "technique")])),
    ("phrases", "P23.1", "P23.5", notion("4. Le développeur", "🧱", "Il écrit le code", [("L'ouvrier qui construit la maison", "ouvrier"), ("Dans notre méthode : Claude Code", "code"), ("Votre idée devient un vrai agent", "transforme")])),
    ("phrases", "P24.1", "P24.7", notion("5. GitHub et le dépôt", "🔐", "L'endroit où l'on range le code", [("Comme un coffre-fort", "coffre"), ("On peut revenir en arrière", "arriere"), ("Toujours en privé", "prive")])),
    ("phrases", "P25.1", "P25.7", notion("6. L'hébergement", "🏪", "Un ordinateur allumé jour et nuit", [("Comme louer une boutique", "boutique"), ("Talkami est sur Laravel Cloud", "heberge"), ("Sans lui, personne d'autre ne l'utilise", "personne")])),
    ("phrases", "P26.1", "P26.6", notion("7. La base de données", "🗂️", "La mémoire de votre agent", [("Comme le grand cahier d'une boutique", "cahier"), ("Talkami y note le niveau de chaque élève", "niveau"), ("Sans elle, il oublie tout", "oublierait")])),
    ("phrases", "P27.1", "P27.6", notion("8. Le modèle d'IA", "🧠", "Le cerveau de votre agent", [("Votre agent est l'employé, le modèle son cerveau", "employe"), ("Gemini, Claude, OpenAI…", "gemini"), ("Il change la qualité et le prix", "qualite")])),
    ("phrases", "P28.1", "P28.6", notion("9. L'API", "🔌", "Brancher votre agent sur un autre service", [("Comme une prise électrique", "prise"), ("Teacher Joe se branche sur un service de voix", "voix"), ("Presque tout passe par des API", "presque")])),
    ("phrases", "P29.1", "P29.7", notion("10. La clé API", "🗝️", "Un long code secret", [("Comme la clé de votre maison", "maison"), ("C'est vous qui payez", "payez"), ("Ne montrez jamais votre clé !", "montrez")])),
    ("phrases", "P30.1", "P30.3", carte("Les 10 mots", "📖", [("Prompt · Cahier des charges · Chef de projet", "mots"), ("Développeur · GitHub · Hébergement", "guide"), ("Base de données · Modèle · API · Clé API", "oubliez"), ("« Explique-moi ce mot simplement. »", "explique")])),
    chapitre(4, "Les trois comptes", "🧾"),
    ("phrases", "P31.1", "P32.4", carte("Compte 1 : Claude", "💬", [("Votre chef de projet", "chef"), ("Il vous guide à chaque étape", "guidera"), ("La version gratuite suffit pour commencer", "gratuite")])),
    ("live", A, 943.7, 989.8, [], live("Créer son compte Claude")),
    ("phrases", "P33.1", "P33.3", carte("Compte 2 : GitHub", "🔐", [("Le coffre-fort de votre code", "coffre"), ("La création est gratuite", "gratuite"), ("Dépôt toujours « Privé »", "prive")])),
    ("live", A, 1052.2, 1161.9, [(1113.4, 1131.4)], live("Créer un compte GitHub et un dépôt privé")),
    ("phrases", "P34.1", "P34.4", carte("Outil 3 : Claude Code", "🛠️", [("Votre développeur", "developpeur"), ("Avec votre compte Claude", "compte"), ("Un abonnement payant", "payant")])),
    ("pause", 13.5, {"mode": "muet", "rush": G, "morceaux": [[34, 44, "1. Ouvrez Claude Code"], [137, 148, "2. Reliez votre compte GitHub"], [163, 185, "3. Créez un environnement"]],
                     "titre": "Relier Claude Code à GitHub"}),
    ("phrases", "P35.1", "P35.5", carte("Récapitulatif", "✅", [("Claude, le chef de projet : gratuit", "chef"), ("GitHub, le coffre-fort : gratuit", "coffre"), ("Claude Code, le développeur : payant", "payant"), ("Plus tard : hébergement et modèle d'IA", "hebergement")])),
    chapitre(5, "La méthode en 4 étapes", "🧭"),
    ("phrases", "P36.1", "P37.5", flux("La méthode en 4 étapes", "🧭", [("Le bloc-notes : vous écrivez votre projet", "bloc"), ("Claude en fait un cahier des charges", "donnez"), ("Claude Code construit, étape par étape", "trois"), ("Tester, mettre en ligne, améliorer", "quatre")])),
    ("phrases", "P38.1", "P38.5", carte("Le rôle de chacun", "👥", [("Vous : le patron, vous décidez", "patron"), ("Claude : le chef de projet", "organise"), ("Claude Code : le développeur", "construit"), ("Vous faites le lien : copier, coller, tester", "copiez")])),
    ("phrases", "P39.1", "P39.4", carte("Pourquoi cette méthode marche", "✨", [("Chacun fait ce qu'il sait faire", "chacun"), ("Suivez les étapes, dans l'ordre", "ordre"), ("Prochaine étape : le bloc-notes", "attaquons")])),
    ("phrases", "E2.1", "E2.3", {"mode": "finpartie", "titre": "Fin de la partie 1A", "suite": "Partie 1B · Préparer son projet"}),
]

VIDEO_1B = [
    ("phrases", "E3.1", "E3.3", {"mode": "intro", "partie": "1B", "sous_titre": "Préparer son projet"}),
    ("phrases", "E3.4", "E3.6", carte("Dans la partie 1A", "↩️", [("Ce qu'est un agent IA", "agent"), ("Les 10 mots importants", "mots"), ("Vos comptes", "comptes"), ("La méthode en 4 étapes", "methode")])),
    chapitre(6, "Étape 1 : le bloc-notes", "📝"),
    ("phrases", "E4.1", "E4.4", carte("La règle d'or", "⭐", [("Bien décrit = travaille bien", "bien"), ("Mal décrit = travaille mal", "mal"), ("Infos floues = agent flou", "floues")])),
    ("phrases", "E4.5", "E4.7", carte("Comme un nouvel employé", "👔", [("Qui vous êtes, ce que vous vendez", "vendez"), ("Comment parler aux clients", "parler"), ("Ce qu'il ne doit jamais faire", "jamais"), ("Par écrit, dans le bloc-notes", "ecrit")])),
    ("phrases", "E4.8", "E4.19", carte("Chemin 1 : la description libre", "✍️", [("Tout ce que vous avez en tête, sans ordre", "tete"), ("Les fautes n'ont aucune importance", "fautes"), ("Quel problème ? Pour qui ? Que faire chaque jour ?", "probleme"), ("Où ? Avec quel budget ?", "budget")])),
    ("phrases", "E4.20", "E4.23", carte("Chemin 2 : la fiche guidée", "📋", [("Les questions du guide, une par une", "questions"), ("9 parties : identité, entreprise, clients…", "neuf"), ("Le plus rapide si l'idée est claire", "rapide")])),
    ("phrases", "E4.24", "E4.28", carte("La partie la plus importante", "❗", [("Ce que l'agent doit savoir", "savoir"), ("Vos vrais prix", "prix"), ("Au moins 10 vraies questions et réponses", "dix"), ("Ce qu'il ne doit jamais dire", "jamais")])),
    ("phrases", "E4.29", "E4.31", carte("Vous ne pouvez pas vous tromper", "👍", [("Les 2 chemins mènent au chef de projet", "chemins"), ("Il vérifie et complète", "completera"), ("Je vous montre !", "montre")])),
    ("live", C, 7.0, 33.5, [], live("Mon cas pratique : un agent de programmation")),
    ("phrases", "E5.1", "E5.4", ecran(C, 200, 330, "J'ai d'abord regardé les meilleurs agents")),
    ("live", C, 407.1, 423.4, [], live("J'écris mon projet dans le bloc-notes")),
    ("live", C, 545.8, 627.6, [], live("J'écris mon projet dans le bloc-notes")),
    chapitre(7, "Étape 2 : Claude, votre chef de projet", "💬"),
    ("phrases", "E4.32", "E4.36", carte("Donner son rôle à Claude", "🎭", [("« Tu es mon chef de projet. »", "chef"), ("« Je suis débutant. »", "debutant"), ("Une IA travaille mieux avec un rôle", "role")])),
    ("phrases", "E4.37", "E4.42", carte("Lui expliquer son travail", "📋", [("Réorganiser l'idée en cahier des charges", "reorganiser"), ("Repérer ce qui manque", "manque"), ("Questions une par une, avec des choix", "choix"), ("La solution la plus simple et la moins chère", "simple"), ("Dire franchement ce qui est trop cher", "franchement")])),
    ("phrases", "E4.43", "E4.46", carte("La règle de sécurité", "🔒", [("Jamais de clé secrète ni de mot de passe", "cle"), ("Le message complet est dans le guide", "guide")])),
    ("live", D, 31.2, 50.6, [], live("Je colle le message et ma description")),
    ("phrases", "E5.5", "E5.8", ecran(R1, 18, 62, "La réponse franche du chef de projet")),
    ("phrases", "E4.47", "E4.50", carte("La discussion", "🗨️", [("Il pose une question, vous répondez", "question"), ("« Je ne sais pas, propose-moi la meilleure option. »", "propose"), ("C'est votre projet : vous êtes le patron", "patron")])),
    ("phrases", "E4.51", "E4.54", carte("Le cahier des charges final", "📐", [("« Donne-moi le cahier des charges complet et final »", "donne"), ("Copiez-le dans le bloc-notes", "copiez"), ("On ne construit jamais avant", "jamais")])),
    ("phrases", "E5.9", "E5.14", ecran(D, 76, 96, "Ce que nous avons décidé ensemble")),
    chapitre(8, "Le nom, le domaine et le coffre-fort", "🏷️"),
    ("phrases", "E5.15", "E5.19", ecran(R1, 62, 82, "Le nom : Kekeli, « la lumière » en éwé")),
    ("phrases", "E5.20", "E5.25", ecran(D, 165, 232, "Le nom de domaine, vérifié sur Cloudflare")),
    ("phrases", "E5.26", "E5.27", ecran(D, 560, 592, "La base de données : PostgreSQL")),
    ("phrases", "E5.28", "E5.28", ecran(D, 598, 616, "Le coffre-fort : un dépôt GitHub privé")),
    ("live", E, 0.9, 31.5, [], live("Je crée le dépôt « kekeli », en privé")),
    ("phrases", "E5.29", "E5.30", ecran(R1, 118, 140, "Le cahier des charges final")),
    chapitre(9, "Les modules A à F", "🧩"),
    ("phrases", "E4.55", "E4.63", carte("Les 6 modules du guide", "🧩", [("A · Professeur", "professeur"), ("B · Vente", "vente"), ("C · Contenu", "contenu"), ("D · Rendez-vous", "rendez"), ("E · Automatisation", "automatisation"), ("F · Vocal", "vocal")])),
    ("phrases", "E4.64", "E4.66", {"mode": "demo", "etapes": [["copiez", 2], ["donnez", 3]]}),
    ("pause", 4.5, {"mode": "demo", "etapes": [], "fixe": 4}),
    chapitre(10, "Sécurité : vos clés", "🔒"),
    ("phrases", "E4.67", "E4.71", carte("Rappel : la clé API", "🗝️", [("Le code secret d'un service", "secret"), ("Le service sait que c'est vous", "sait"), ("Vous payez ce que l'agent consomme", "payez")])),
    ("phrases", "E4.72", "E4.74", carte("La règle absolue", "⛔", [("Ne montrez jamais votre clé", "jamais"), ("Ni capture, ni vidéo, ni WhatsApp", "capture"), ("Même pas à Claude", "claude")])),
    ("phrases", "E4.75", "E4.77", carte("Pourquoi c'est grave", "💸", [("Il l'utilise comme si c'était vous", "utiliser"), ("C'est votre argent qu'il dépense", "argent"), ("Comme donner votre code Mobile Money", "mobile")])),
    ("phrases", "E4.78", "E4.80", carte("Où mettre ses clés ?", "🗄️", [("Dans les réglages secrets de l'hébergement", "reglages"), ("Jamais dans un message", "message"), ("Jamais dans le code", "code")])),
    ("phrases", "E4.81", "E4.82", carte("Clé montrée par erreur ?", "🚨", [("Supprimez-la tout de suite", "supprimez"), ("Créez-en une nouvelle", "nouvelle"), ("Vérifiez chaque capture d'écran", "capture")])),
    chapitre(11, "La boucle de travail", "🔁"),
    ("phrases", "E4.83", "E4.96", flux("La boucle de travail", "🔁", [("Le chef de projet prépare la consigne", "prepare"), ("Temps 1 : Claude Code présente son plan", "plan"), ("Le chef de projet vérifie le plan", "verifie"), ("« Validé, lance. »", "valide"), ("Temps 2 : il construit et fait un compte rendu", "construit"), ("Étape suivante… jusqu'à la fin", "suivante")])),
    ("phrases", "E4.97", "E4.100", carte("Les 3 règles d'or", "⭐", [("1. Une seule étape à la fois", "seule"), ("2. Jamais deux chantiers en même temps", "chantiers"), ("3. Testez sur votre téléphone", "testez")])),
    ("phrases", "E4.101", "E4.104", carte("Les erreurs sont normales", "🙂", [("Pas de panique", "panique"), ("Montrez-la au chef de projet", "montrez"), ("La discipline fait la différence", "discipline")])),
    ("phrases", "E5.31", "E5.35", ecran(E, 125, 250, "Temps 1 : la consigne envoyée à Claude Code")),
    ("phrases", "E5.36", "E5.38", ecran(E, 250, 293, "Une erreur : le cahier des charges oublié")),
    ("phrases", "E5.39", "E5.49", ecran(F, 9, 95, "Le plan validé, avec 3 corrections")),
    chapitre(12, "Récapitulatif et devoir", "🎯"),
    ("phrases", "E6.1", "E6.9", carte("Ce que nous avons appris", "✅", [("Une IA = un cerveau", "cerveau"), ("Un agent IA = un employé formé", "employe"), ("Tout commence dans le bloc-notes", "bloc"), ("Claude : le cahier des charges", "claude"), ("GitHub : le coffre-fort, en privé", "github"), ("Claude Code : d'abord le plan", "plan"), ("On ne montre jamais ses clés", "cles")])),
    ("phrases", "E6.10", "E6.27", carte("Votre devoir avant la partie 2", "📝", [("1. Choisir son projet", "choisissez"), ("2. L'écrire dans le bloc-notes", "ecrivez"), ("3. Ajouter le module A à F", "ajoutez"), ("4. Créer ses comptes et un dépôt privé", "creez"), ("5. Obtenir le cahier des charges final", "donnez"), ("6. L'envoyer dans le groupe WhatsApp", "envoyez")])),
    ("phrases", "E6.28", "E6.29", {"mode": "finpartie", "titre": "La suite arrive très bientôt !", "suite": "Partie 2 · Construire l'agent avec Claude Code"}),
]
