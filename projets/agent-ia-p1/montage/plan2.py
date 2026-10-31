"""Plan de montage des vidéos 1A et 1B, VERSION 2 (style de l'extrait d'essai validé par Joseph) : l'ordre des voix et ce qu'on voit pendant chacune.

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

# Mot dit autrement que dans le script (les sous-titres suivent ce qui est dit).
DIT = {"P1.1": ("Bonjour", "Salut")}

# Début forcé d'une phrase (mot de trop juste avant) : « Et 4. » avant « Une erreur arrive ».
DEBUT_FORCE = {"E4.101": 519.80}

H = "rushes/20261022-081406.mp4"   # démo GitHub (inscription, dépôt privé)
I = "rushes/20261021-173350.mp4"   # site Lomé IA School, Ama, Laravel Cloud
TK = "voix/talkami-catalogue.mp4"  # catalogue des écrans de Talkami
TV = "voix/talkami-video.mp4"      # leçon de Teacher Joe


def illus(titre, emoji, points, image, definition=None, style="notion", legende=None):
    v = carte(titre, emoji, points, style, definition)
    v["image"] = image
    v["legende"] = legende
    return v


def et(m, v=None, b="", **kw):
    """Une étape de démonstration : m = (début, fin[, vitesse]) ou liste de morceaux ; v = voix ; b = bandeau.
    Options : c = cercles [(t, x, y)], z = zooms [(t, x, y, f)], f/y = zoom par défaut, auto = touchers repérés,
    note = encadré d'aide, flou = [(t0, t1, x, y, l, h)] (mots de passe, clés, codes SMS seulement)."""
    return dict(m=m, v=v, b=b, **kw)


def vo(a, b):
    return ("vo", a, b)


def ph(a, b):
    return ("phrases", a, b)


LIVE = ("live",)
SON = ("son",)

# Démo GitHub de l'extrait d'essai validé (rush H, voix off des démos).
GITHUB = [
    et((64.5, 67.6), vo(24.84, 28.95), "Étape 1 : dans Google, tapez « github »", c=[(66.4, 300, 615)], z=[(64.5, 540, 470, 1.55)], auto=False),
    et((70.0, 72.6), vo(29.48, 30.95), "Étape 2 : touchez « Inscrivez-vous sur GitHub »", c=[(70.3, 486, 586)], z=[(70.0, 540, 470, 1.9)], auto=False,
       note="Vous avez déjà un compte ? Touchez « Se connecter »"),
    et((121.0, 122.9), vo(31.58, 33.15), "Étape 3 : touchez « Continuer avec Google »", c=[(121.3, 637, 923)], z=[(121.0, 620, 760, 1.9)], auto=False),
    et((125.7, 126.85), vo(33.18, 34.75), "Étape 4 : choisissez votre adresse Gmail", c=[(126.0, 450, 612)], z=[(125.7, 520, 560, 1.6)], auto=False),
    et((140.6, 144.0), vo(35.08, 36.95), "Votre compte GitHub est prêt ✅", z=[(140.6, 640, 300, 2.3)], auto=False),
    et([(144.0, 147.6, 0.75), (147.6, 150.6, 1)], vo(37.52, 43.0), "Étape 5 : touchez « + » en haut, puis « Nouveau dépôt »",
       c=[(144.1, 812, 164), (145.9, 722, 245)], z=[(144.0, 720, 260, 2.6)], auto=False),
    et([(153.0, 159.0, 1), (164.5, 167.5, 1)], vo(43.74, 46.25), "Étape 6 : donnez un nom au dépôt, sans espace", c=[(153.2, 551, 833)],
       z=[(153.0, 380, 760, 1.5)], auto=False),
    et((170.0, 177.5), vo(46.72, 48.75), "Étape 7 : ajoutez une courte description", c=[(170.2, 541, 1072)], z=[(170.0, 380, 1000, 1.5)], auto=False),
    et([(182.9, 186.6, 0.6)], vo(49.30, 57.15), "Étape 8 : choisissez « Privé » 🔒", c=[(183.0, 597, 891), (184.2, 250, 1601), (185.9, 642, 1367)],
       z=[(182.9, 560, 900, 1.6), (183.9, 430, 1460, 1.5), (185.8, 600, 1360, 1.8)], auto=False),
    et((191.5, 197.5), vo(57.54, 59.45), "Étape 9 : touchez « Créer un dépôt »", c=[(192.2, 864, 1147)], z=[(191.5, 760, 1090, 2.2)], auto=False),
    et((200.0, 204.5), vo(59.68, 62.10), "C'est fait : votre coffre-fort est prêt 🎉", z=[(200.0, 330, 640, 2.0)], auto=False),
]

VIDEO_1A = [
    ("phrases", "E1.1", "E1.3", {"mode": "intro", "partie": "1A", "sous_titre": "Comprendre"}),
    chapitre(1, "Bienvenue dans la formation", "👋"),
    ("phrases", "P1.1", "P1.3", carte("Coach Joseph", "👋", [("Fondateur de Lomé IA School", "fondateur"), ("Formateur en IA depuis 2023", "depuis"), ("Plus de 1 000 personnes accompagnées", "accompagne")])),
    ("phrases", "P2.1", "P2.3", illus("Pourquoi cette formation ?", "🎯", [("Peu savent créer un outil qui travaille pour eux", "outil"), ("Votre agent IA travaille même quand vous dormez", "dormez")],
                                      "ai-agent.svg", style="liste")),
    ("demo", TK, [
        et((0.0, 10.0), ph("P3.1", "P3.3"), "Ma preuve : Talkami, sur talkami.net", f=1.2, y=700, auto=False),
        et((2.0, 13.0), SON, "Teacher Joe donne une vraie leçon d'anglais", z=[(2.0, 264, 300, 2.4), (8.0, 264, 640, 2.4)], auto=False, rush=TV),
        et([(140.0, 147.5), (148.0, 151.5)], vo(197.1, 201.05), "Étape 1 : passez l'évaluation gratuite (5 minutes)", c=[(142.2, 540, 1240)], f=1.2, y=760, auto=False),
        et([(152.0, 156.5), (186.3, 189.5)], vo(201.5, 204.65), "Étape 2 : parlez avec Teacher Joe : il trouve votre niveau", f=1.2, y=700, auto=False),
        et([(220.0, 224.5), (238.0, 242.0)], vo(209.3, 212.95), "Étape 3 : votre espace et votre programme", f=1.2, y=760, auto=False,
           note="À vous : allez sur talkami.net et essayez !"),
    ], {"titre": "Talkami, construit avec la méthode de cette formation"}),
    ("phrases", "P4.1", "P4.5", illus("Pas besoin de savoir programmer", "💡", [("Une formation pour les débutants", "debutants"), ("Chaque mot technique expliqué simplement", "explique"), ("Ce qu'il vous faut : une méthode", "methode")],
                                      "lecture.svg", style="liste")),
    ("phrases", "P5.1", "P5.5", flux("Le chemin de la formation", "🗺️", [("Comprendre l'IA et l'agent IA", "comprendre"), ("Les mots importants", "mots"), ("Créer les comptes", "comptes"), ("La méthode complète", "methode"), ("Les erreurs à éviter", "erreurs")])),
    ("phrases", "P6.1", "P6.8", carte("Un vrai cas pratique", "🛠️", [("Un agent de programmation, comme Claude Code", "programmation"), ("En français, sur téléphone, payé par Mobile Money", "mobile"), ("Un projet avancé, choisi exprès", "avance"), ("Pour vous : commencez plus simple", "simple")])),
    ("phrases", "P7.1", "P7.4", illus("Votre guide", "📘", [("« Préparer son agent IA »", "guide"), ("Toutes les fiches et tous les messages", "fiches"), ("Gardez-le à côté de vous", "cote")], "road-to-knowledge.svg", style="liste")),
    chapitre(2, "C'est quoi, une IA ? Et un agent IA ?", "🤖"),
    ("phrases", "P8.1", "P8.4", illus("L'intelligence artificielle", "🧠", [("Elle a appris en lisant énormément de textes", "lisant"), ("Elle écrit, explique, traduit, résume", "traduire")],
                                      "ai-answers.svg", definition="Un programme qui comprend et vous répond")),
    ("phrases", "P9.1", "P9.5", illus("Une image pour comprendre", "📚", [("Elle a lu presque toutes les bibliothèques", "bibliotheques"), ("Mais elle ne vous connaît pas", "connait"), ("Ni votre entreprise, ni vos clients, ni vos prix", "prix")],
                                      "books.svg", style="liste")),
    ("demo", A, [
        et((286.5, 296.8), ph("P10.1", "P10.3"), "Exemple : on pose une question à ChatGPT", z=[(286.5, 540, 1250, 1.5), (296.0, 540, 360, 1.3)], auto=False),
        et((297.0, 306.0), ph("P10.4", "P10.4"), "L'IA répond…", f=1.2, y=700),
        et((306.0, 313.5), ph("P10.5", "P10.5"), "… puis elle attend votre prochaine demande ⏳", f=1.2, y=900),
    ], {"titre": "Une IA simple"}),
    ("phrases", "P11.1", "P11.4", carte("La limite d'une IA simple", "⏳", [("Elle attend toujours que vous lui parliez", "attend"), ("Elle ne fait rien toute seule", "seule"), ("Elle ne répond pas à vos clients la nuit", "dormez")])),
    ("phrases", "P12.1", "P12.2", illus("Un agent IA = une IA + 3 choses", "🤖", [("Un rôle : son métier", "role"), ("Des informations : ce qu'il doit savoir", "informations"), ("Des outils : WhatsApp, agenda, e-mail", "outils")],
                                        "agentic-network.svg", style="liste")),
    ("phrases", "P13.1", "P13.3", illus("L'image de l'employé", "👔", [("L'IA : un cerveau très intelligent", "cerveau"), ("L'agent IA : un employé formé pour vous", "employe"), ("Il agit tout seul", "seul")],
                                        "starting-work.svg", style="liste")),
    ("demo", TV, [
        et((14.0, 30.0), ph("P14.1", "P14.5"), "Exemple : Teacher Joe, sur Talkami", z=[(14.0, 264, 300, 2.4), (22.0, 264, 640, 2.4)], auto=False),
        et((30.0, 40.0), SON, "Rôle : professeur · Informations : votre niveau · Outils : voix et tableau", z=[(30.0, 264, 300, 2.4)], auto=False),
    ], {"titre": "Un vrai agent IA : Teacher Joe"}),
    ("phrases", "P15.1", "P15.2", flux("Le cycle d'un agent", "🔄", [("Il reçoit un message", "recoit"), ("Il réfléchit", "reflechit"), ("Il utilise un outil", "utilise"), ("Il répond ou il agit", "agit")])),
    ("phrases", "P16.1", "P17.3", carte("Les 6 types d'agents", "🧩", [("1. Professeur", "professeur"), ("2. Service client et vente", "vente"), ("3. Contenu", "contenu"), ("4. Rendez-vous", "rendez"), ("5. Automatisation", "automatisation"), ("6. Vocal", "vocal")])),
    ("demo", I, [
        et((22.5, 30.0), SON, "Exemple d'agent vocal : Ama, sur le site de Lomé IA School", f=1.2, y=900, auto=False),
    ], {"titre": "Un agent vocal : Ama"}),
    ("phrases", "P17.4", "P18.3", carte("Votre première décision", "❓", [("Un agent peut combiner plusieurs types", "combiner"), ("Quel type d'agent créer ?", "type"), ("« Quel agent pourrait m'aider dans mon activité ? »", "activite")])),
    chapitre(3, "Les 10 mots à connaître", "🔑"),
    ("phrases", "P19.1", "P19.3", carte("Pour chaque mot", "🔑", [("Ce que c'est", "dire"), ("Une image de la vie courante", "image"), ("Un exemple", "exemple"), ("Pourquoi c'est important", "important")])),
    ("phrases", "P20.1", "P20.6", illus("1. Le prompt", "💬", [("Comme une consigne donnée à un employé", "consigne"), ("Toute la méthode repose sur de bons prompts", "repose")], "chat-with-ai.svg", definition="Le message que vous écrivez à une IA")),
    ("phrases", "P21.1", "P21.7", illus("2. Le cahier des charges", "📐", [("Comme le plan d'une maison", "plan"), ("Prix, horaires, rendez-vous, interdits", "prix")], "idea-to-plan.svg", definition="Tout ce que votre agent doit savoir et faire")),
    ("phrases", "P22.1", "P22.6", illus("3. Le chef de projet", "👷", [("Comme le chef de chantier", "chantier"), ("Dans notre méthode : Claude", "claude")], "project-flow.svg", definition="Il organise, vérifie et vous guide")),
    ("phrases", "P23.1", "P23.5", illus("4. Le développeur", "🧱", [("L'ouvrier qui construit la maison", "ouvrier"), ("Dans notre méthode : Claude Code", "code")], "ai-code-generation.svg", definition="Il écrit le code")),
    ("phrases", "P24.1", "P24.7", {"mode": "github", "titre": "5. GitHub et le dépôt"}),
    ("phrases", "P25.1", "P25.7", illus("6. L'hébergement", "🏪", [("Comme louer une boutique", "boutique"), ("Talkami est sur Laravel Cloud", "heberge")], "laravel-cloud.jpg",
                                       definition="Un ordinateur allumé jour et nuit", legende="Talkami en ligne sur Laravel Cloud")),
    ("phrases", "P26.1", "P26.6", illus("7. La base de données", "🗂️", [("Comme le grand cahier d'une boutique", "cahier"), ("Talkami y note le niveau de chaque élève", "niveau")], "database-tables.svg", definition="La mémoire de votre agent")),
    ("phrases", "P27.1", "P27.6", illus("8. Le modèle d'IA", "🧠", [("Gemini, Claude, OpenAI…", "gemini"), ("Il change la qualité et le prix", "qualite")], "ai-agent.svg", definition="Le cerveau de votre agent")),
    ("phrases", "P28.1", "P28.6", illus("9. L'API", "🔌", [("Comme une prise électrique", "prise"), ("Teacher Joe se branche sur un service de voix", "voix")], "plug-in.svg", definition="Brancher votre agent sur un autre service")),
    ("phrases", "P29.1", "P29.7", illus("10. La clé API", "🗝️", [("Comme la clé de votre maison", "maison"), ("Ne montrez jamais votre clé !", "montrez")], "authentication.svg", definition="Un long code secret")),
    ("phrases", "P30.1", "P30.3", carte("Les 10 mots", "📖", [("Prompt · Cahier des charges · Chef de projet", "mots"), ("Développeur · GitHub · Hébergement", "guide"), ("Base de données · Modèle · API · Clé API", "oubliez"), ("« Explique-moi ce mot simplement. »", "explique")])),
    chapitre(4, "Les trois comptes", "🧾"),
    ("phrases", "P31.1", "P32.4", carte("Compte 1 : Claude", "💬", [("Votre chef de projet", "chef"), ("Il vous guide à chaque étape", "guidera"), ("La version gratuite suffit pour commencer", "gratuite")])),
    ("demo", A, [
        et((943.5, 949.6), LIVE, "Étape 1 : installez l'application Claude (Play Store)", f=1.6, y=330),
        et((975.8, 981.0), LIVE, "Étape 2 : touchez « Continuer avec Google »", f=1.6, y=1650),
        et((981.0, 986.5), LIVE, "Étape 3 : choisissez votre adresse e-mail", f=1.4, y=700),
        et((20.0, 24.0), vo(16.9, 20.75), "Votre compte Claude est créé ✅ (gratuit)", f=1.2, y=600, auto=False, rush=G),
    ], {"titre": "Créer son compte Claude"}),
    ("phrases", "P33.1", "P33.3", carte("Compte 2 : GitHub", "🔐", [("Le coffre-fort de votre code", "coffre"), ("La création est gratuite", "gratuite"), ("Dépôt toujours « Privé »", "prive")])),
    ("demo", H, GITHUB, {"titre": "Créer son compte GitHub et un dépôt privé"}),
    ("phrases", "P34.1", "P34.4", carte("Outil 3 : Claude Code", "🛠️", [("Votre développeur", "developpeur"), ("Avec votre compte Claude", "compte"), ("Un abonnement payant", "payant")])),
    ("demo", G, [
        et((36.5, 44.0), vo(65.5, 79.9), "Étape 1 : ouvrez Claude Code, puis touchez « Connecter GitHub »", f=1.4, y=1100),
        et((151.0, 155.5), vo(81.4, 83.7), "Étape 2 : « Continuer avec GitHub », puis autorisez l'accès", f=1.3, y=1000),
        et((164.0, 177.0), vo(84.6, 85.7), "Étape 3 : créez un environnement", f=1.3, y=900),
        et((179.0, 188.5), vo(87.0, 87.6), "Étape 4 : donnez-lui un nom", f=1.4, y=700),
        et((188.5, 191.0), vo(88.3, 90.6), "Étape 5 : choisissez l'accès à Internet, puis validez", f=1.3, y=1000),
        et((175.5, 177.0), vo(91.4, 93.4), "Votre développeur est prêt ✅", f=1.3, y=900, auto=False),
    ], {"titre": "Relier Claude Code à GitHub"}),
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
    ("phrases", "E4.5", "E4.7", illus("Comme un nouvel employé", "👔", [("Qui vous êtes, ce que vous vendez", "vendez"), ("Ce qu'il ne doit jamais faire", "jamais"), ("Par écrit, dans le bloc-notes", "ecrit")],
                                      "starting-work.svg", style="liste")),
    ("phrases", "E4.8", "E4.19", carte("Chemin 1 : la description libre", "✍️", [("Tout ce que vous avez en tête, sans ordre", "tete"), ("Les fautes n'ont aucune importance", "fautes"), ("Quel problème ? Pour qui ? Que faire chaque jour ?", "probleme"), ("Où ? Avec quel budget ?", "budget")])),
    ("phrases", "E4.20", "E4.23", carte("Chemin 2 : la fiche guidée", "📋", [("Les questions du guide, une par une", "questions"), ("9 parties : identité, entreprise, clients…", "neuf"), ("Le plus rapide si l'idée est claire", "rapide")])),
    ("phrases", "E4.24", "E4.28", carte("La partie la plus importante", "❗", [("Ce que l'agent doit savoir", "savoir"), ("Vos vrais prix", "prix"), ("Au moins 10 vraies questions et réponses", "dix"), ("Ce qu'il ne doit jamais dire", "jamais")])),
    ("phrases", "E4.29", "E4.31", carte("Vous ne pouvez pas vous tromper", "👍", [("Les 2 chemins mènent au chef de projet", "chemins"), ("Il vérifie et complète", "completera"), ("Je vous montre !", "montre")])),
    ("demo", C, [
        et((7.0, 33.5), LIVE, "Mon cas pratique : un agent de programmation", f=1.2, y=900, auto=False),
    ], {"titre": "Mon cas pratique"}),
    ("demo", C, [
        et((199.0, 215.0), ph("E5.1", "E5.2"), "J'ai demandé à Claude : quels sont les meilleurs agents ?", f=1.3, y=700, auto=False),
        et((263.0, 283.0), ph("E5.3", "E5.4"), "Sa réponse : louer des modèles qui existent déjà", f=1.3, y=700, auto=False),
    ], {"titre": "Avant d'écrire : se renseigner"}),
    ("demo", C, [
        et((550.0, 556.0), vo(97.7, 103.85), "Étape 1 : ouvrez votre bloc-notes (Google Keep), nouvelle note", f=1.3, y=900),
        et((405.0, 420.0), vo(104.5, 110.55), "Étape 2 : touchez le micro et dictez votre projet", f=1.3, y=760),
        et((495.0, 515.0), vo(111.6, 116.65), "Étape 3 : relisez, ajoutez votre nom, vos contacts, votre objectif", f=1.3, y=880),
        et((561.0, 594.7), LIVE, "Mon projet, écrit sans ordre : ce n'est pas grave", f=1.2, y=800, auto=False),
        et((608.5, 617.0), LIVE, "Étape 4 : copiez tout le texte de la note", f=1.2, y=900),
    ], {"titre": "J'écris mon projet dans le bloc-notes"}),
    chapitre(7, "Étape 2 : Claude, votre chef de projet", "💬"),
    ("phrases", "E4.32", "E4.36", illus("Donner son rôle à Claude", "🎭", [("« Tu es mon chef de projet. »", "chef"), ("« Je suis débutant. »", "debutant"), ("Une IA travaille mieux avec un rôle", "role")], "project-flow.svg", style="liste")),
    ("phrases", "E4.37", "E4.42", carte("Lui expliquer son travail", "📋", [("Réorganiser l'idée en cahier des charges", "reorganiser"), ("Repérer ce qui manque", "manque"), ("Questions une par une, avec des choix", "choix"), ("La solution la plus simple et la moins chère", "simple"), ("Dire franchement ce qui est trop cher", "franchement")])),
    ("phrases", "E4.43", "E4.46", carte("La règle de sécurité", "🔒", [("Jamais de clé secrète ni de mot de passe", "cle"), ("Le message complet est dans le guide", "guide")])),
    ("demo", D, [
        et((0.5, 16.0), vo(120.5, 127.55), "Étape 1 : nouvelle conversation, collez le message « Tu es mon chef de projet »", f=1.3, y=560),
        et((16.0, 31.0), vo(128.1, 132.45), "Étape 2 : collez votre description en dessous, puis Envoyer", f=1.3, y=1250),
        et((44.0, 56.0), vo(133.6, 136.65), "Claude répond et commence le cahier des charges", f=1.2, y=700),
        et((56.0, 72.0), ph("E5.5", "E5.8"), "Il me parle franchement, puis il me pose ses questions", f=1.2, y=700),
    ], {"titre": "Donner le message au chef de projet"}),
    ("demo", R1, [
        et((82.0, 118.0), ph("E4.47", "E4.50"), "La discussion : une question, une réponse", f=1.2, y=900, auto=False),
    ], {"titre": "La discussion avec le chef de projet"}),
    ("phrases", "E4.51", "E4.54", carte("Le cahier des charges final", "📐", [("« Donne-moi le cahier des charges complet et final »", "donne"), ("Copiez-le dans le bloc-notes", "copiez"), ("On ne construit jamais avant", "jamais")])),
    ("demo", D, [
        et((76.0, 96.0), ph("E5.9", "E5.14"), "Ce que nous avons décidé ensemble", f=1.2, y=800, auto=False),
    ], {"titre": "Les décisions du projet"}),
    chapitre(8, "Le nom, le domaine et le coffre-fort", "🏷️"),
    ("demo", R1, [
        et((62.0, 82.0), ph("E5.15", "E5.19"), "Le nom : Kekeli, « la lumière » en éwé", f=1.2, y=900, auto=False),
    ], {"titre": "Trouver un nom"}),
    ("demo", D, [
        et((164.0, 171.5), ph("E5.20", "E5.21"), "Étape 1 : sur Cloudflare, ouvrez « Enregistrer un domaine »", f=1.8, y=420),
        et((171.5, 176.5), vo(142.0, 144.95), "Étape 2 : tapez le nom voulu, ici « kekeli »", f=1.8, y=420),
        et((176.0, 181.0), vo(145.9, 149.75), "Cloudflare dit s'il est libre, et son prix par an", f=1.8, y=600),
        et((204.0, 224.0), [ph("E5.22", "E5.25"), vo(150.2, 152.45)], "L'avis du chef de projet : kekeli.dev", f=1.3, y=700, auto=False),
    ], {"titre": "Le nom de domaine, vérifié sur Cloudflare"}),
    ("demo", D, [
        et((560.0, 592.0), ph("E5.26", "E5.27"), "La base de données : PostgreSQL", f=1.3, y=700, auto=False),
        et((600.0, 616.0), ph("E5.28", "E5.28"), "Le coffre-fort : un dépôt GitHub privé, « kekeli »", f=1.3, y=900, auto=False),
    ], {"titre": "La base de données et le coffre-fort"}),
    ("demo", E, [
        et((0.9, 31.5), vo(155.8, 164.35), "Je crée le dépôt « kekeli », en privé 🔒", f=1.3, y=900),
    ], {"titre": "Créer le dépôt du projet"}),
    ("demo", R1, [
        et((118.0, 140.0), ph("E5.29", "E5.30"), "Le cahier des charges final", f=1.2, y=900, auto=False),
    ], {"titre": "Le cahier des charges final"}),
    chapitre(9, "Les modules A à F", "🧩"),
    ("phrases", "E4.55", "E4.63", carte("Les 6 modules du guide", "🧩", [("A · Professeur", "professeur"), ("B · Vente", "vente"), ("C · Contenu", "contenu"), ("D · Rendez-vous", "rendez"), ("E · Automatisation", "automatisation"), ("F · Vocal", "vocal")])),
    ("phrases", "E4.64", "E4.66", {"mode": "demo", "etapes": [["copiez", 2], ["donnez", 3]]}),
    ("pause", 4.5, {"mode": "demo", "etapes": [], "fixe": 4}),
    chapitre(10, "Sécurité : vos clés", "🔒"),
    ("phrases", "E4.67", "E4.71", illus("Rappel : la clé API", "🗝️", [("Le service sait que c'est vous", "sait"), ("Vous payez ce que l'agent consomme", "payez")], "authentication.svg", definition="Le code secret d'un service")),
    ("phrases", "E4.72", "E4.74", carte("La règle absolue", "⛔", [("Ne montrez jamais votre clé", "jamais"), ("Ni capture, ni vidéo, ni WhatsApp", "capture"), ("Même pas à Claude", "claude")])),
    ("phrases", "E4.75", "E4.77", carte("Pourquoi c'est grave", "💸", [("Il l'utilise comme si c'était vous", "utiliser"), ("C'est votre argent qu'il dépense", "argent"), ("Comme donner votre code Mobile Money", "mobile")])),
    ("phrases", "E4.78", "E4.80", illus("Où mettre ses clés ?", "🗄️", [("Dans les réglages secrets de l'hébergement", "reglages"), ("Jamais dans un message, jamais dans le code", "message")], "deploy-globally.svg", style="liste")),
    ("phrases", "E4.81", "E4.82", carte("Clé montrée par erreur ?", "🚨", [("Supprimez-la tout de suite", "supprimez"), ("Créez-en une nouvelle", "nouvelle"), ("Vérifiez chaque capture d'écran", "capture")])),
    chapitre(11, "La boucle de travail", "🔁"),
    ("phrases", "E4.83", "E4.96", flux("La boucle de travail", "🔁", [("Le chef de projet prépare la consigne", "prepare"), ("Temps 1 : Claude Code présente son plan", "plan"), ("Le chef de projet vérifie le plan", "verifie"), ("« Validé, lance. »", "valide"), ("Temps 2 : il construit et fait un compte rendu", "construit"), ("Étape suivante… jusqu'à la fin", "suivante")])),
    ("phrases", "E4.97", "E4.100", carte("Les 3 règles d'or", "⭐", [("1. Une seule étape à la fois", "seule"), ("2. Jamais deux chantiers en même temps", "chantiers"), ("3. Testez sur votre téléphone", "testez")])),
    ("phrases", "E4.101", "E4.104", carte("Les erreurs sont normales", "🙂", [("Pas de panique", "panique"), ("Montrez-la au chef de projet", "montrez"), ("La discipline fait la différence", "discipline")])),
    ("demo", E, [
        et((125.0, 150.0), ph("E5.31", "E5.32"), "Le chef de projet donne la première consigne (Temps 1)", f=1.2, y=900, auto=False),
        et([(200.0, 212.0), (235.0, 242.0)], vo(169.1, 172.65), "Étape 1 : dans Claude Code, choisissez l'environnement et le dépôt « kekeli »", f=1.3, y=900),
        et((245.0, 256.0), vo(173.4, 178.35), "Étape 2 : collez la consigne, puis Envoyer", f=1.3, y=1100),
        et((256.0, 268.0), vo(179.4, 183.15), "Claude Code ne construit rien : il présente d'abord son plan", f=1.2, y=800, auto=False),
        et((268.0, 292.0), ph("E5.36", "E5.38"), "Une erreur : le cahier des charges oublié. Je le colle et je relance", f=1.2, y=1000),
    ], {"titre": "Temps 1 : la consigne envoyée à Claude Code", "n": 4}),
    ("demo", F, [
        et((8.0, 18.0), ph("E5.39", "E5.39"), "Claude Code a présenté son plan", f=1.2, y=800, auto=False),
        et((20.0, 31.0), vo(183.6, 189.25), "Étape 3 : copiez le plan et donnez-le au chef de projet", f=1.3, y=900),
        et((44.0, 66.0), ph("E5.40", "E5.47"), "Le plan est bon, avec 3 corrections", f=1.3, y=800, auto=False),
        et([(66.0, 82.0), (86.0, 90.0)], [vo(189.9, 194.15), ph("E5.48", "E5.49")], "Étape 4 : répondez à Claude Code « Validé, lance. »", f=1.3, y=1100),
    ], {"titre": "Le plan validé, avec 3 corrections"}),
    chapitre(12, "Récapitulatif et devoir", "🎯"),
    ("phrases", "E6.1", "E6.9", carte("Ce que nous avons appris", "✅", [("Une IA = un cerveau", "cerveau"), ("Un agent IA = un employé formé", "employe"), ("Tout commence dans le bloc-notes", "bloc"), ("Claude : le cahier des charges", "claude"), ("GitHub : le coffre-fort, en privé", "github"), ("Claude Code : d'abord le plan", "plan"), ("On ne montre jamais ses clés", "cles")])),
    ("phrases", "E6.10", "E6.27", carte("Votre devoir avant la partie 2", "📝", [("1. Choisir son projet", "choisissez"), ("2. L'écrire dans le bloc-notes", "ecrivez"), ("3. Ajouter le module A à F", "ajoutez"), ("4. Créer ses comptes et un dépôt privé", "creez"), ("5. Obtenir le cahier des charges final", "donnez"), ("6. L'envoyer dans le groupe WhatsApp", "envoyez")])),
    ("phrases", "E6.28", "E6.29", {"mode": "finpartie", "titre": "La suite arrive très bientôt !", "suite": "Partie 2 · Construire l'agent avec Claude Code"}),
]
