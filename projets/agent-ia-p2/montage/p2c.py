"""Vidéo 2C — Créer vos clés API et les ranger en sécurité. Voix off vo3 (reprises coupées). Démos v4 (Google AI Studio,
E2B), v5 (clé E2B, variables d'environnement), v6 (nouvelle session, clés vues). TOUTES LES CLÉS, LE CODE DE VÉRIFICATION
ET LE PRESSE-PAPIERS SONT FLOUTÉS (flous = rectangles 1080 × 2160 sur tout l'extrait).
Sortie : serie-animee/public/formation/p2c/ ; puis bouche.py p2c."""
from p2lib import Montage, texte_prevu

M = Montage("p2c", "voix/vo3.m4a", 5.3, 253.5,
            coupes=[(134.0, 140.2), (149.05, 156.55), (161.6, 162.8), (180.6, 200.6)],
            texte_prevu=texte_prevu("voix_off_p2_complete.md", "C"))
# Démos de la 2C : chaque morceau ramené à 0,3 s autour de l'image vérifiée (l'écran change souvent juste après).
_demo = M.demo
def _demo_court(de, a, rush, morceaux, *args, **kw):
    return _demo(de, a, rush, [(x, round(x + 0.3, 2)) for x, _ in morceaux], *args, **kw)
M.demo = _demo_court

M.voix()
M.mots("transcriptions/vo3.json")

FLOU_VARIABLES = [(30, 300, 1060, 540), (0, 1270, 1080, 2160)]  # v5 290 s : valeurs des clés + presse-papiers

M.anim(5.3, 8.7, "titre", {"partie": ("Partie", 5.3), "p2a": ("2C", 5.3), "boucle": ("clés", 5.3)},
       sur="Comment créer un agent IA, de A à Z", partie="Deuxième partie", code="Partie 2C", titre="Créer vos clés API", icone="🔑")
M.video(8.7, 12.0, "mk21812.mp4", 2.0, "Une clé API = un code secret 🔑", mot="clé", titre="Rappelez-vous")
M.anim(12.0, 18.85, "cleapi", {"vous": ("vous", 12.0), "payez": ("payez", 12.0), "jamais": ("jamais", 12.0)})
M.demo(18.85, 23.4, "v4", [(112.0, 113.0)], "Le chef de projet me donne les étapes, une par une", zooms=[(112.0, 540, 330, 1.3)],
       surlignes=[(112.2, 20, 165, 1060, 440)])
M.carte(23.4, 40.9, "Imaginez que je ne vous aie rien montré", "🤔",
        [("Suivez exactement votre chef de projet", "suivez"), ("Bloqué ? Une capture, il vous guide", "capture"), ("Chaque projet a ses propres étapes", "Chaque")],
        icones=["🧭", "📸", "🧩"])

# 1. La clé Gemini (Google AI Studio)
M.demo(40.9, 46.3, "v4", [(119.0, 121.0)], "Première clé : Gemini. Tapez aistudio.google.com", zooms=[(119.0, 540, 300, 1.35)],
       surlignes=[(119.2, 330, 10, 1000, 100)])
M.demo(46.3, 53.9, "v4", [(146.0, 148.5), (154.0, 156.0)], "La première fois : lisez, cochez, puis « Continuer »",
       zooms=[(146.0, 540, 1150, 1.2), (154.0, 540, 1100, 1.2)],
       surlignes=[(146.2, 30, 1030, 1060, 1190), (154.2, 30, 900, 1060, 1440)])
M.demo(53.9, 55.5, "v4", [(127.0, 128.0)], "Ouvrez « Clés API »", zooms=[(127.0, 540, 300, 1.4)], surlignes=[(127.1, 0, 100, 330, 190)])
M.demo(55.5, 56.9, "v4", [(169.0, 170.0)], "Touchez « Créer une clé »", zooms=[(169.0, 700, 300, 1.4)], surlignes=[(169.1, 640, 110, 1060, 200)])
M.demo(56.9, 60.9, "v4", [(226.0, 227.5)], "Donnez-lui un nom (facultatif)", zooms=[(226.0, 540, 500, 1.35)], surlignes=[(226.1, 100, 390, 1000, 500)])
M.demo(60.9, 63.0, "v4", [(239.0, 240.5)], "« Créer un projet », puis validez", zooms=[(239.0, 540, 1000, 1.3)], surlignes=[(239.1, 600, 1120, 1000, 1210)])
M.demo(63.0, 68.7, "v4", [(260.0, 261.0)], "Votre clé s'affiche : touchez Copier (ici floutée 🔒)", zooms=[(260.0, 540, 900, 1.3)],
       surlignes=[(260.2, 900, 820, 1010, 910)], flous=[(60, 820, 890, 910)], legendes=[("v66.0", "Ne montrez jamais votre clé 🔒")])

# 2. La clé E2B
M.demo(68.7, 79.8, "v4", [(310.0, 311.5), (337.0, 338.5)], "Deuxième clé : E2B. Ouvrez e2b.dev → « Commencer à construire »",
       zooms=[(310.0, 540, 300, 1.4), (337.0, 540, 1100, 1.25)], surlignes=[(310.1, 30, 10, 1050, 100), (337.2, 75, 1170, 1000, 1280)],
       legendes=[("v70.5", "Ma première fois sur ce site : je découvre avec vous 👀")])
M.demo(79.8, 83.5, "v4", [(341.0, 342.0), (358.5, 359.5)], "Inscrivez-vous avec GitHub, puis autorisez",
       zooms=[(341.0, 540, 560, 1.3), (358.5, 540, 1000, 1.3)], surlignes=[(341.1, 100, 515, 980, 600), (358.6, 520, 1020, 1010, 1110)])
M.demo(83.5, 90.5, "v4", [(379.0, 380.5), (382.0, 383.5)], "Le code reçu par e-mail : copiez-le, collez-le (secret, flouté 🔒)",
       zooms=[(379.0, 540, 1250, 1.2), (382.0, 540, 500, 1.3)], flous=[(250, 1300, 950, 1480), (100, 590, 1000, 690)])
M.demo(90.5, 94.0, "v5", [(24.0, 25.5)], "Le tableau de bord d'E2B → « API Keys »", zooms=[(24.0, 540, 500, 1.2)])
M.demo(94.0, 98.4, "v5", [(97.0, 98.5)], "« Créer une clé », un nom, puis validez", zooms=[(97.0, 540, 450, 1.35)], surlignes=[(97.1, 60, 360, 1000, 510)])
M.demo(98.4, 102.2, "v5", [(121.0, 122.0)], "Copiez la clé (ici floutée 🔒)", zooms=[(121.0, 540, 1000, 1.3)],
       surlignes=[(121.1, 760, 920, 1000, 1020)], flous=[(90, 915, 760, 1025)])

# 3. Où ranger ses clés
M.anim(102.2, 119.6, "rangement", {"bloc": ("bloc", 102.2), "coffre": ("coffre", 102.2), "claude": ("directement", 102.2),
                                   "gestion": ("gestionnaire", 102.2), "whatsapp": ("WhatsApp", 102.2), "capture": ("capture", 102.2)})
M.demo(119.6, 125.3, "v5", [(264.0, 265.0)], "Le chef m'explique où placer les clés : l'environnement de Claude Code",
       zooms=[(264.0, 540, 500, 1.25)], surlignes=[("v120.0", 20, 340, 1060, 450), ("v122.7", 20, 500, 1060, 690)])
M.demo(125.3, 131.0, "v5", [(252.0, 253.5), (272.0, 273.5)], "Claude Code : menu → votre environnement → Modifier",
       zooms=[(252.0, 540, 1700, 1.25), (272.0, 540, 600, 1.3)], surlignes=[(252.1, 20, 1780, 1060, 1870), (272.1, 60, 440, 1000, 560)])
M.demo(131.0, 134.0, "v5", [(278.0, 279.0)], "Descendez jusqu'à « Variables d'environnement »", zooms=[(278.0, 540, 1300, 1.3)],
       surlignes=[(278.1, 60, 1260, 1000, 1390)])
M.demo(140.2, 145.4, "v5", [(290.0, 291.0)], "Une ligne par clé : NOM=clé, sans espace", zooms=[(290.0, 540, 500, 1.3)],
       flous=FLOU_VARIABLES, legendes=[("v141.0", "GEMINI_API_KEY=votre clé   ·   E2B_API_KEY=votre clé")])
M.demo(145.4, 163.3, "v5", [(168.0, 169.0)], "Le chef de projet vous donne les noms exacts", zooms=[(168.0, 540, 1560, 1.4)],
       surlignes=[(168.1, 20, 1540, 1060, 1660)])
M.demo(163.3, 165.0, "v5", [(290.0, 291.0)], "Touchez « Enregistrer les modifications »", zooms=[(290.0, 540, 800, 1.3)],
       surlignes=[(290.1, 80, 850, 1000, 935)], flous=FLOU_VARIABLES)

# 4. Les clés ne sont pas vues : la maison et la pièce
M.demo(165.0, 169.5, "v5", [(378.0, 379.0)], "Je demande de vérifier… « Les clés ne sont pas visibles » ❌", zooms=[(378.0, 540, 1150, 1.3)],
       surlignes=[("v167.0", 20, 1290, 1060, 1400)])
M.anim(169.5, 180.6, "maison", {"maison": ("maison", 169.5), "piece": ("pièce", 169.5), "avant": ("avant", 169.5)})
M.demo(200.6, 211.7, "v6", [(138.0, 139.0)], "Deuxième erreur : mes clés étaient dans « Default »",
       zooms=[(138.0, 540, 600, 1.3), ("v205.0", 540, 1150, 1.3)], surlignes=[(138.1, 40, 380, 1060, 500), ("v205.0", 30, 1330, 1060, 1470)],
       legendes=[("v208.5", "Pas grave : avec des captures, le chef m'a guidé pas à pas 📸")])
M.demo(211.7, 218.1, "v6", [(365.0, 366.0)], "Nouvelle session : votre dépôt et l'environnement « Kekeli »", zooms=[(365.0, 540, 900, 1.15)],
       surlignes=[("v211.7", 20, 10, 520, 90), ("v214.5", 100, 800, 1000, 900), ("v216.5", 20, 1880, 1060, 1950)])
M.demo(218.1, 223.9, "v6", [(412.0, 413.0)], "Demandez-lui de vérifier les clés, sans les afficher", zooms=[(412.0, 540, 1100, 1.3)],
       surlignes=[(412.1, 20, 1110, 1060, 1210)])
M.demo(223.9, 232.6, "v6", [(515.0, 516.0)], "« Les deux clés obligatoires sont présentes » ✅",
       zooms=[(515.0, 540, 600, 1.25), ("v228.0", 540, 1000, 1.25)],
       surlignes=[("v224.0", 20, 380, 1060, 530), ("v228.0", 20, 760, 1060, 900), ("v231.0", 20, 1090, 1060, 1270)])
M.carte(232.6, 249.7, "Si Claude Code ne voit pas vos clés", "🔍",
        [("Vous avez touché « Enregistrer »", "Enregistrer"), ("Vous avez ouvert une nouvelle session", "nouvelle"),
         ("Vous avez choisi le bon environnement", "bon")], icones=["💾", "🆕", "🏠"])
M.anim(249.7, 253.5, "fin", {"moteur": ("construction", 249.7), "moins": ("bout", 249.7)},
       code="Partie 2D", titre="Suivre la construction jusqu'au bout", sous="🏁 étape par étape", icones=["🏗️", "🏁"])
M.ecrire()
