"""Vidéo 2B — Le moteur et le cerveau de votre agent. Voix off vo2 (reprises et longs silences coupés) + passage en
direct de Joseph tiré de la vidéo 3 (521,6–566,2 s : sa demande sur plusieurs comptes Google et la réponse du chef de
projet, gardés à sa demande). Sortie : serie-animee/public/formation/p2b/ ; puis bouche.py p2b.
Repère 'v123.4' = temps de la voix off ; 10000 + t = temps t du passage en direct (vidéo 3)."""
import re
from p2lib import INSERT, Montage, P2

# Texte prévu (B-01 à B-30) ; B-21 = ce que Joseph dit en direct (orthographe corrigée).
DIRECT = ("C'est là que bon, j'ai commencé à lui dire : mais pourquoi ne pas prendre plusieurs clés API sur différents comptes "
          "Google ? Vu que bon, j'ai dit vraiment que Google… Là, il a dit qu'il ne peut pas m'aider à ce niveau. Alors là, on a "
          "commencé à faire des débats là-dessus. Là : « Je comprends que ce soit courant, et c'est votre décision, mais ma "
          "position ne change pas. » Voilà, il m'a donné le prompt. Je n'ai pas envie de le prendre, d'accord ? J'ai continué. "
          "Vous voyez, c'est comme ça qu'il a été programmé : il fait ce qu'on lui a dit de faire. Donc là, j'ai continué, mais il "
          "a dit non. Même, j'ai demandé la source : voici la source qu'il m'a envoyée. Je suis allé dans ChatGPT, j'ai pu traduire "
          "ça. Voilà, voilà. Et donc il a toujours refusé, et donc j'ai dit : OK, envoie-moi le prompt.")
morceaux = []
for ligne in (P2 / "voix_off_p2_complete.md").read_text().splitlines():
    m = re.match(r"^B-(\d+)\s*(\[[^\]]*\])?\s*(.*)$", ligne)
    if m:
        morceaux.append(DIRECT if m.group(1) == "21" else m.group(3))
TEXTE = " ".join(morceaux)

M = Montage("p2b", "voix/vo2.m4a", 9.55, 272.2, coupes=[(122.75, 141.75), (149.9, 154.1), (194.3, 204.75)], texte_prevu=TEXTE,
            inserts=[(194.3, "rushes/v3.mp4", 521.6, 566.2, "transcriptions/v3_505.json", 505.0)])
M.voix()
M.mots("transcriptions/vo2.json")
D = INSERT

M.anim(9.55, 14.1, "titre", {"partie": ("Partie", 9.55), "p2a": ("2B", 9.55), "boucle": ("moteur", 9.55)},
       sur="Comment créer un agent IA, de A à Z", partie="Deuxième partie", code="Partie 2B", titre="Le moteur et le cerveau", icone="⚙️")

# 1. L'étape 2 : deux comptes
M.demo(14.1, 22.6, "v3", [(211.6, 212.4)], "L'étape 1 est validée ✅ Le chef de projet explique l'étape 2",
       zooms=[(211.6, 540, 790, 1.3)], surlignes=[("v17.36", 20, 715, 1060, 885)])
M.anim(22.6, 34.8, "comptes", {"anthropic": ("Anthropic", 22.6), "e2b": ("E2B", 22.6)})
M.video(34.8, 37.3, "mk21812.mp4", 2.0, "Les clés : c'est moi qui les placerai dans les réglages 🔑", mot="clés")

# 2. Je ne suis pas d'accord : Gemini
M.video(37.3, 42.2, "mk18296.mp4", 0.5, "Anthropic coûte cher 💸", mot="cher", titre="Je ne suis pas d'accord sur un point")
M.demo(42.2, 47.3, "v3", [(234.6, 235.4)], "Mon message : « Et si j'utilisais Gemini, gratuit ? »",
       zooms=[(234.6, 590, 1180, 1.35)], surlignes=[("v44.7", 110, 930, 1060, 1430)])
M.carte(47.3, 56.2, "C'est vous le patron", "👑", [("Une proposition ne vous convient pas ?", "proposition"),
                                                    ("Dites-le, et discutez avec votre chef de projet", "dites")], icones=["🤔", "💬", "✅"])
M.demo(56.2, 69.98, "v3", [(254.6, 255.4)], "Sa réponse : bonne idée… avec deux limites",
       zooms=[(254.6, 540, 420, 1.3), ("v61.8", 540, 970, 1.3)],
       surlignes=[("v56.5", 20, 240, 1060, 560), ("v59.5", 20, 620, 1060, 690), ("v61.8", 20, 720, 1060, 1210)])
M.anim(69.98, 76.9, "jauge", {"vide": ("gratuite", 69.98), "suffit": ("suffira", 69.98)})
M.demo(76.9, 83.2, "v3", [(319.8, 320.2)], "Je n'ai pas compris : je lui demande d'expliquer plus simplement",
       zooms=[(319.8, 560, 330, 1.3)], surlignes=[("v78.0", 100, 185, 1010, 290)], legendes=[("v80.1", "N'ayez jamais honte de demander 🙋🏾")])

# 3. Le moteur et le cerveau : la voiture et le carburant
M.anim(83.2, 96.2, "deuxparties", {"moteur": ("moteur", 83.2), "cerveau": ("cerveau", 89.0)})
M.anim(96.2, 105.8, "voiture", {"seul": ("seul", 96.2), "voiture": ("voiture", 96.2), "chere": ("carburant", 96.2)}, mode="un")
M.video(105.8, 113.28, "mk31961.mp4", 0.3, "Un moteur multi-modèle = une voiture qui accepte plusieurs carburants ⛽", mot="plusieurs",
        titre="Sa recommandation : changer de moteur")
M.anim(113.28, 117.0, "voiture", {"seul": ("changer", 113.28), "voiture": ("changer", 113.28), "chere": ("reconstruire", 113.28)}, mode="plusieurs")
M.demo(117.0, 146.58, "v3", [(359.6, 360.4)], "Concrètement, en deux temps",
       zooms=[(359.6, 540, 840, 1.3), ("v141.8", 540, 1250, 1.3)],
       surlignes=[("v117.5", 20, 760, 1060, 925), ("v141.8", 20, 975, 1060, 1670)])

# 4. OpenCode
M.demo(146.58, 149.3, "v3", [(371.6, 372.4)], "C'est clair : je valide ✅", zooms=[(371.6, 800, 1650, 1.6)], surlignes=[(371.8, 770, 1700, 1060, 1790)])
M.demo(149.3, 157.44, "v3", [(377.6, 378.4)], "Il me donne le prompt : je le copie 📋", zooms=[(377.6, 540, 700, 1.2)],
       surlignes=[(377.8, 20, 370, 1060, 1210), ("v156.8", 780, 375, 880, 455)])
M.demo(157.44, 160.12, "v3", [(399.6, 400.4)], "… et je l'envoie à Claude Code", zooms=[(399.6, 540, 700, 1.2)])
M.demo(160.12, 166.64, "v3", [(409.6, 410.4)], "Claude Code fait des recherches 🔍", zooms=[(409.6, 540, 700, 1.2)],
       surlignes=[(409.8, 20, 280, 1060, 350), ("v164.3", 20, 995, 1060, 1180)])
M.demo(166.64, 176.88, "v3", [(444.6, 445.4)], "Je l'envoie au chef… il me conseille OpenCode",
       zooms=[(444.6, 540, 800, 1.25), ("v169.64", 540, 1350, 1.25)],
       surlignes=[(444.8, 720, 590, 1050, 850), ("v169.64", 20, 1090, 1060, 1185), ("v172.0", 20, 1250, 1060, 1340), ("v173.5", 20, 1430, 1060, 1500)])
M.demo(176.88, 194.3, "v3", [(499.6, 500.4)], "OpenCode ou Gemini : quelle différence ?",
       zooms=[(499.6, 540, 450, 1.25), ("v180.36", 540, 1250, 1.2), ("v190.76", 540, 1700, 1.3)],
       surlignes=[("v177.0", 20, 560, 1060, 760), ("v180.36", 20, 990, 1060, 1080), ("v182.16", 20, 1150, 1060, 1300),
                  ("v185.32", 20, 1360, 1060, 1450), ("v187.7", 20, 1510, 1060, 1740), ("v190.76", 20, 1805, 1060, 1895)])

# 5. En direct : plusieurs comptes Google
M.demo(D + 521.6, D + 566.2, "v3", [(521.6, 566.2)], "En direct : ma demande… et la réponse du chef de projet",
       zooms=[(521.6, 540, 360, 1.2), (524.5, 540, 1010, 1.3), (530.0, 540, 1700, 1.2), (535.5, 540, 1050, 1.3), (548.5, 540, 1450, 1.3),
              (554.5, 540, 900, 1.25), (559.5, 560, 650, 1.3), (564.0, 540, 1300, 1.3)],
       surlignes=[(524.6, 20, 730, 1060, 1290), (530.5, 20, 1540, 1060, 1980), (536.0, 20, 820, 1060, 1270), (549.0, 20, 1120, 1060, 1790),
                  (555.0, 20, 590, 1060, 1190), (564.5, 20, 1320, 1060, 1550)])
M.carte(204.75, 212.78, "Le chef de projet est franc", "🤝", [("Il donne son avis franchement", "franchement"), ("Même quand ça ne plaît pas", "même"),
                                                              ("À la fin, c'est vous qui décidez", "fin")], icones=["🗣️", "😬", "👑"])

# 6. Lire le prompt, les limites, le message aux utilisateurs
M.demo(212.78, 217.18, "v3", [(565.6, 566.4)], "Je valide : il me donne le prompt, je l'envoie à Claude Code", zooms=[(565.6, 540, 1450, 1.3)],
       surlignes=[(565.8, 20, 1320, 1060, 1550)])
M.video(217.18, 224.9, "mk13807.mp4", 0.3, "Lisez toujours le prompt avant de l'envoyer 👀", mot="lis", titre="Pendant que Claude Code travaille…")
M.demo(224.9, 229.6, "v3", [(593.8, 594.2)], "En lisant, je vois une phrase… et je pose ma question", zooms=[(593.8, 580, 650, 1.25)], surlignes=[("v226.56", 100, 470, 1050, 830)])
M.demo(229.6, 239.4, "v3", [(627.6, 628.4)], "Ma question… et sa réponse : deux limites différentes",
       zooms=[(627.6, 540, 580, 1.3), ("v232.32", 540, 1180, 1.3)],
       surlignes=[("v229.6", 20, 410, 1060, 760), ("v232.32", 20, 1000, 1060, 1160), ("v236.18", 20, 1225, 1060, 1310)])
M.demo(239.4, 247.3, "v3", [(667.6, 668.4)], "Le message choisi ensemble", zooms=[(667.6, 540, 440, 1.4)],
       surlignes=[("v242.74", 20, 300, 1060, 560)], legendes=[("v242.74", "☀️ Votre énergie du jour est épuisée. Elle sera de nouveau prête demain.")])
M.demo(247.3, 251.52, "v3", [(704.6, 705.4)], "Claude Code a fini : j'envoie son compte rendu au chef", zooms=[(704.6, 540, 900, 1.2)])
M.demo(251.52, 255.58, "v3", [(717.6, 718.4)], "« Très bon travail » … prochaine étape : les clés API",
       zooms=[(717.6, 540, 450, 1.3), ("v253.26", 540, 1700, 1.3)], surlignes=[("v251.52", 20, 280, 1060, 380), ("v253.26", 20, 1560, 1060, 1830)])
M.carte(255.58, 266.32, "Attention : ce sont les choix de Kekeli", "⚠️",
        [("Gemini, E2B, OpenCode : les outils de Kekeli", "Gemini"), ("Votre chef en choisira peut-être d'autres", "votre"), ("La méthode reste la même", "méthode")],
        icones=["🧩", "🧭", "✅"])
M.anim(266.32, 272.2, "fin", {"moteur": ("clés", 266.32), "moins": ("sécurité", 266.32)},
       code="Partie 2C", titre="Créer vos clés API", sous="… et les ranger en sécurité", icones=["🔑", "🔐"])
M.ecrire()
