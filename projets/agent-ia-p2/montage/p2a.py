"""Vidéo 2A — La boucle de travail. Voix off vo1 (reprises coupées), chaque phrase montrée : enregistrement d'écran,
sinon vidéo libre (Mixkit), sinon animation. Sortie : serie-animee/public/formation/p2a/ ; puis bouche.py p2a.
Coordonnées : image du téléphone recadrée 1080 × 2160. Repère 'v123.4' = temps de la voix off d'origine."""
import sys
from p2lib import Montage, texte_prevu

M = Montage("p2a", "voix/vo1.m4a", 2.6, 327.0, coupes=[(198.95, 207.15), (281.7, 288.75)],
            texte_prevu=texte_prevu("voix_off_p2_complete.md", "A"))
M.voix()
M.mots("transcriptions/vo1.json")

# 1. Titre et accueil
M.anim(2.6, 11.7, "titre", {"partie": ("Deuxième", 2.6), "p2a": ("2A", 2.6), "boucle": ("boucle", 2.6)},
       sur="Comment créer un agent IA, de A à Z", partie="Deuxième partie", code="Partie 2A", titre="La boucle de travail")
M.carte(11.7, 21.1, "Bienvenue dans la deuxième partie", "👋", [("Vous savez quel agent créer", "agent"), ("Votre cahier des charges est prêt", "cahier")])
M.image("rappel_bloc", "C", 555.0)
M.image("rappel_chef", "v2", 15.0)
M.image("rappel_cahier", "D", 552.0)
M.anim(21.1, 30.3, "rappel", {"bloc": ("bloc", 21.1), "claude": ("donné", 21.1), "cahier": ("obtenu", 26.0)},
       images=["formation/p2a/rappel_bloc.png", "formation/p2a/rappel_chef.png", "formation/p2a/rappel_cahier.png"],
       etiquettes=["1. Le bloc-notes", "2. Claude, chef de projet", "3. Le cahier des charges"])
M.video(30.3, 32.2, "mk9686.mp4", 2.0, "Maintenant, on construit ! 🏗️", mot="construit")

# 2. Le conseil : bien décrire son projet
M.anim(32.2, 35.1, "conseil", {"conseil": ("conseil", 32.2)}, texte="Un conseil très important")
M.video(35.1, 38.3, "mk99890.mp4", 0.5, "Prenez le temps de bien décrire votre projet ✍️", mot="décrire")
M.anim(38.3, 44.0, "flou", {"floue": ("idée", 38.3), "mediocre": ("médiocre", 40.0)})
M.anim(44.0, 51.5, "aide", {"ameliorer": ("améliorer", 44.0), "laisser": ("laisser", 48.0)})
M.video(51.5, 59.2, "mk4401.mp4", 1.0, "Claude décide tout = un agent ordinaire, comme tout le monde", mot="ordinaire",
        titre="Si vous laissez Claude tout décider…")
M.video(59.2, 64.8, "mk22756.mp4", 3.0, "Un objectif clair, une vision précise : décrivez-la 🎯", mot="objectif")
M.anim(64.8, 70.3, "ajuste", {"vous": ("Claude", 64.8), "technique": ("technique", 64.8)})

# 3. Dicter au lieu d'écrire
M.demo(70.3, 73.9, "C", [(546.0, 546.6)], "Écrire vous fatigue ? Parlez ! Ouvrez votre bloc-notes",
       zooms=[(546.0, 540, 560, 1.3)], surlignes=[("v72.86", 560, 300, 780, 470)])
M.demo(73.9, 75.6, "C", [(547.9, 548.6)], "Touchez le micro 🎤 du clavier", zooms=[(547.9, 760, 1300, 1.5)],
       surlignes=[(548.0, 960, 1300, 1075, 1420)])
M.demo(75.6, 79.4, "C", [(554.6, 556.0)], "… et dictez votre idée, comme à un ami", zooms=[(554.6, 540, 640, 1.2)],
       surlignes=[("v76.4", 30, 380, 1060, 560)])
M.demo(79.4, 82.4, "v1", [(75.5, 76.5), (97.0, 99.0)], "Ou le mode vocal de ChatGPT : vous parlez",
       zooms=[(75.5, 700, 1220, 1.5), (97.0, 540, 1900, 1.3)], surlignes=[(75.6, 920, 1150, 1050, 1270)])
M.demo(82.4, 85.8, "C", [(407.0, 409.0)], "… puis vous copiez le texte 📋", zooms=[(407.0, 540, 760, 1.2)],
       surlignes=[("v83.2", 20, 440, 1060, 1110)])
M.anim(85.8, 91.0, "questions", {"questions": ("questions", 85.8), "repondez": ("répondrez", 85.8)})
M.carte(91.0, 98.3, "Le cahier des charges est clair", "✅", [("Le chef de projet a bien compris", "compris"), ("On commence le travail 🚀", "commence")])

# 4. Rappel : le dépôt, la règle d'or
M.demo(98.3, 108.4, "E", [(6.0, 11.8)], "Rappel : créer le dépôt sur GitHub",
       zooms=[(6.0, 540, 700, 1.15), ("v104.5", 700, 400, 1.6), ("v107.0", 760, 680, 1.8)],
       surlignes=[("v104.5", 430, 300, 1040, 365), ("v105.4", 100, 480, 1040, 545), ("v107.0", 760, 655, 975, 715)])
M.anim(108.4, 113.4, "noms", {"noms": ("nom", 108.4), "propose": ("propose", 108.4)})
M.anim(113.4, 127.3, "regledor", {"jamais": ("jamais", 113.4), "infos": ("informations", 113.4), "probleme": ("problème", 113.4),
                                  "debloque": ("débloquera", 113.4)})

# 5. Lancer l'étape 1
M.demo(127.3, 137.4, "v2", [(14.8, 15.4)], "Le message du chef de projet : « Validé, lance l'étape 1 »",
       zooms=[(14.8, 540, 640, 1.25), ("v132.9", 540, 700, 1.45)],
       surlignes=[("v128.0", 20, 300, 1060, 460), ("v134.4", 20, 630, 1060, 690)], legendes=[("v132.9", "Je copie son message 📋")])
M.anim(137.4, 150.9, "corrections", {"c1": ("paiements", 137.4), "c2": ("deuxième", 141.0), "c3": ("prix", 145.0)},
       videos=["formation/p2/libre/mk46977.mp4", None, "formation/p2/libre/mk34125.mp4"])
M.demo(150.9, 156.3, "v1", [(235.6, 238.0), (244.4, 247.4)], "Dans Claude Code : je colle le message et je touche Envoyer",
       zooms=[(235.6, 540, 850, 1.3), ("v153.4", 540, 1150, 1.25)], surlignes=[(235.8, 30, 600, 1000, 1100), ("v153.0", 940, 1010, 1040, 1110)])
M.demo(156.3, 158.5, "v1", [(296.0, 298.2)], "Claude Code commence à construire", zooms=[(296.0, 540, 1300, 1.3)],
       surlignes=[(296.2, 30, 1080, 1060, 1580)])
M.demo(158.5, 160.1, "v1", [(330.0, 331.6)], "Claude Code travaille tout seul ⏱️", zooms=[(330.0, 650, 1545, 1.8)],
       surlignes=[(330.1, 420, 1510, 1060, 1585)])
M.video(160.1, 164.0, "mk28901.mp4", 0.5, "Plusieurs minutes… parfois beaucoup plus ⏳", mot="minutes", vertical=True)
M.video(164.0, 169.0, "mk236.mp4", 1.0, "Laissez-le travailler. Faites autre chose ☕", mot="Laissez")

# 6. Le compte rendu et le chef de projet
M.demo(169.0, 172.8, "v2", [(10.6, 13.4)], "Claude Code a fini : il écrit son compte rendu", zooms=[(10.6, 540, 600, 1.15)],
       surlignes=[("v170.3", 20, 120, 1060, 720)])
M.demo(172.8, 174.9, "v2", [(13.0, 13.4)], "Je copie son compte rendu, en entier 📋", zooms=[(13.0, 380, 1350, 1.5)],
       surlignes=[(13.1, 40, 1510, 160, 1600)])
M.demo(174.9, 179.3, "v2", [(16.8, 17.3)], "Je le colle chez le chef de projet, tel quel", zooms=[(16.8, 400, 900, 1.6)],
       surlignes=[(17.0, 45, 740, 310, 995)], legendes=[("v177.1", "Pas besoin d'expliquer : il comprend tout seul")])
M.demo(179.3, 186.6, "v2", [(59.8, 60.4)], "Le chef de projet me résume, en mots simples", zooms=[(59.8, 540, 420, 1.35)],
       surlignes=[("v184.7", 20, 265, 1060, 330)])
M.demo(186.6, 198.95, "v2", [(59.8, 60.4)], "L'étape 1 est solide ✅", zooms=[(59.8, 540, 450, 1.3), ("v193.8", 540, 760, 1.3)],
       surlignes=[("v186.6", 40, 355, 1060, 410), ("v188.7", 40, 440, 1060, 545), ("v191.1", 40, 440, 1060, 545),
                  ("v193.8", 40, 590, 1060, 690), ("v196.3", 40, 810, 1060, 910)])
M.demo(207.15, 218.55, "v2", [(59.8, 60.4)], "Ses remarques", zooms=[(59.8, 540, 1350, 1.35)],
       surlignes=[("v207.6", 40, 1190, 1060, 1235), ("v208.9", 40, 1280, 1060, 1450)],
       legendes=[("v213.6", "C'est normal : ce sera fait plus tard"), ("v215.0", "Pas d'accord ? Dites-le-lui 💬")])

# 7. La pull request (extrait d'essai validé)
M.demo(218.55, 221.95, "v2", [(115.0, 119.0)], "Le chef de projet : « Étape suivante : fusionner la pull request »",
       zooms=[(115.0, 540, 690, 1.2)], surlignes=[(115.3, 15, 650, 1065, 705)])
M.anim(221.95, 234.80, "pullrequest", {"copie": ("copie", 222.0), "verifie": ("vérifié", 226.0), "fusionne": ("fusionne", 227.0),
                                       "depot": ("dépôt", 228.5), "coffre": ("coffre", 229.0), "ranger": ("ranger", 231.0)})
M.demo(234.80, 244.30, "v2", [(119.0, 128.0)], "Fusionner vous-même sur GitHub : 3 gestes",
       zooms=[(119.0, 540, 860, 1.2), ("v239.6", 540, 1160, 1.2)],
       surlignes=[("v237.8", 15, 740, 1065, 1010), ("v239.6", 15, 1090, 1065, 1145), ("v241.2", 15, 1170, 1065, 1275)])
M.demo(244.30, 248.30, "v3", [(112.0, 118.0)], "Ma règle, envoyée à Claude Code", zooms=[(112.0, 600, 510, 1.55)],
       surlignes=[(112.6, 230, 310, 1000, 620)])
M.anim(248.30, 257.05, "regle", {"vertes": ("vertes", 249.0), "fusionne": ("fusionne", 251.0), "rouges": ("rouges", 253.0), "vert": ("vert.", 255.0)})
M.demo(257.05, 263.10, "v2", [(380.0, 386.5)], "Claude Code applique la règle… et m'envoie des captures",
       zooms=[(380.0, 540, 360, 1.35), (384.2, 540, 860, 1.25)])
M.anim(263.10, 269.40, "appli", {"resultat": ("Voici", 263.0), "projets": ("projets", 265.0)})
M.carte(269.40, 281.7, "Bloqué ? Demandez au chef de projet", "🧭",
        [("Dites-le simplement", "dites"), ("Envoyez une capture d'écran", "capture"), ("« Guide-moi étape par étape »", "guider")])

# 8. Discuter, la boucle, la suite
M.carte(288.75, 301.8, "Une réponse bizarre ? Discutez avec lui", "💬",
        [("Posez vos questions", "posez"), ("Toujours bloqué ? Je suis là", "bloqué"), ("Un formateur qui a déjà fait plusieurs projets", "formateur")],
        icones=["❓", "🙋🏾‍♂️", "🏆"])
M.anim(301.8, 320.5, "boucle", {"b1": ("chef", 303.0), "b2": ("construit", 305.5), "b3": ("copiez", 307.5), "b4": ("vérifie", 310.5),
                                "b5": ("valide", 314.0), "fin": ("jusqu", 316.0)})
M.anim(320.5, 327.0, "fin", {"moteur": ("moteur", 320.5), "moins": ("moins", 320.5)},
       code="Partie 2B", titre="Le moteur et le cerveau de votre agent", sous="en dépensant le moins possible")
M.ecrire()
