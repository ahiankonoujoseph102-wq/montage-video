"""Vidéo 2D — Suivre la construction jusqu'au bout. Voix off vo4 (reprise « Récapitulons » et « 2. » coupés) + passage
en direct de Joseph tiré de la vidéo 7 (345,75–439,0 s : sa conclusion, l'abonnement, son offre d'aide et sa phrase sur
les projets, gardés à sa demande). Sortie : serie-animee/public/formation/p2d/ ; puis bouche.py p2d."""
import re
from p2lib import INSERT, Montage, P2

DIRECT = ("Donc voilà, chers amis, c'est simple. Pour créer un agent, peu importe le type d'agent que vous voulez créer : "
          "premièrement, c'est le bloc-notes, vous décrivez correctement. Et ensuite, vous venez dans votre chef de projet : "
          "le prompt que j'ai donné dans le guide, pour donner un rôle à votre chef de projet, pour qu'il sache qu'il est le chef "
          "de projet. Et puis ensuite, il vous aide à refaire le cahier des charges, et vous l'envoyez à Claude Code, vous voyez. "
          "Voilà. Maintenant, pour le bloc-notes : premièrement, si vous ne voulez pas décrire correctement et écrire comme j'ai "
          "demandé, écrire à la main… mais votre objectif, vous l'avez dans la tête : pas de souci, vous pouvez également le "
          "faire. Et j'ai donné des prompts modèles dans le guide, que vous devez prendre et remplir manuellement, vous voyez. "
          "Donc si vous voulez qu'un agent soit bien, vous devez donner tous les détails, vous devez suivre le projet de près, et "
          "faire en sorte que la chose puisse correspondre à vos attentes. Sinon, si vous laissez l'IA deviner les choses pour "
          "vous, vous n'aurez pas de bonnes choses, en fait, vous voyez. Et Claude Code permet mieux de faire des choses, en "
          "fait. Du coup, je vous recommande toujours Claude Code. Bon, les autres modèles sont bien, mais bon, si vous voulez, "
          "vous pouvez les utiliser, mais Claude Code, je le trouve beaucoup meilleur, voyez-vous. Maintenant, Claude Code est "
          "payant : l'abonnement Claude Code est payant, c'est à 13 500 francs par mois, 13 500 francs par mois. Donc prenez "
          "cet abonnement, OK. Voilà. Maintenant, au cas où vous n'avez pas d'argent, peut-être, bon, là, vous pouvez m'écrire, "
          "je vous trouverai une solution : vous allez payer un montant, je vous donnerai accès, OK. Claude Code, quand vous "
          "prenez l'abonnement Claude Code, vous créez vraiment de vrais projets. Vous verrez que l'argent ne va pas manquer, "
          "parce que d'ici à ce que le mois finisse, vous aurez créé des projets qui vont vous rapporter de l'argent, et vous "
          "prendrez l'argent pour souscrire l'abonnement de nouveau. OK.")
morceaux = []
for ligne in (P2 / "voix_off_p2_complete.md").read_text().splitlines():
    m = re.match(r"^D-(\d+)\s*(\[[^\]]*\])?\s*(.*)$", ligne)
    if m:
        morceaux.append(DIRECT if m.group(1) == "12" else m.group(3))
TEXTE = " ".join(morceaux)

M = Montage("p2d", "voix/vo4.m4a", 4.9, 134.0, coupes=[(61.15, 66.0), (74.9, 93.9), (111.05, 112.05)], texte_prevu=TEXTE,
            inserts=[(61.15, "rushes/v7.mp4", 345.75, 439.0, "transcriptions/v7_340.json", 340.0)])
_demo = M.demo
def _demo_court(de, a, rush, morceaux, *args, **kw):
    return _demo(de, a, rush, [(x, round(x + 0.3, 2)) for x, _ in morceaux], *args, **kw)
M.demo = _demo_court
M.voix()
M.mots("transcriptions/vo4.json")
D = INSERT
M.image("rappel_bloc", "C", 555.0)
M.image("rappel_chef", "v2", 15.0)
M.image("rappel_cahier", "D", 552.0)
M.image("rappel_cc", "v7", 2.0)

M.anim(4.9, 8.6, "titre", {"partie": ("Partie", 4.9), "p2a": ("2D", 4.9), "boucle": ("construction", 4.9)},
       sur="Comment créer un agent IA, de A à Z", partie="Deuxième partie", code="Partie 2D", titre="Suivre la construction", icone="🏗️")
M.demo(8.6, 16.5, "v7", [(2.0, 2.3)], "Claude Code travaille toujours… regardez cette barre", zooms=[(2.0, 540, 1450, 1.4)],
       surlignes=[("v10.2", 30, 1460, 1060, 1560)], legendes=[("v13.1", "Toute rouge = Claude Code s'arrête 🛑")])
M.anim(16.5, 24.3, "attente", {"attendre": ("attendre", 16.5), "panique": ("panique", 16.5), "verifier": ("vérifier", 16.5), "reprenez": ("reprenez", 16.5)})
M.demo(24.3, 29.0, "v7", [(100.0, 100.3)], "Claude Code a fini l'étape 2 : « Vous validez ? »", zooms=[(100.0, 540, 1420, 1.4)],
       surlignes=[("v26.1", 30, 1370, 1060, 1460)])
M.demo(29.0, 31.6, "v7", [(100.0, 100.3)], "Je ne réponds pas tout de suite : je copie son compte rendu 📋", zooms=[(100.0, 540, 900, 1.2)],
       surlignes=[("v30.4", 20, 160, 1060, 1500)])
M.demo(31.6, 33.0, "v7", [(120.0, 120.3)], "Je l'envoie au chef de projet", zooms=[(120.0, 760, 250, 1.5)], surlignes=[(120.1, 700, 30, 1000, 170)])
M.demo(33.0, 40.4, "v7", [(150.0, 150.3)], "Il vérifie : l'agent fonctionne pour de vrai ✅", zooms=[(150.0, 540, 700, 1.25)],
       surlignes=[("v33.98", 20, 460, 1060, 580), ("v35.6", 20, 580, 1060, 720)], legendes=[("v38.9", "Claude Code a fusionné lui-même 🔀")])
M.demo(40.4, 45.0, "v7", [(175.0, 175.3)], "Il me demande de regarder les 13 captures", zooms=[(175.0, 540, 900, 1.3)],
       surlignes=[("v40.4", 20, 640, 1060, 780), ("v43.0", 20, 1090, 1060, 1150)])
M.demo(45.0, 52.6, "v7", [(310.0, 310.3), (322.0, 322.3)], "Je les ouvre et je les regarde toutes 👀",
       zooms=[(310.0, 540, 500, 1.2), (322.0, 540, 700, 1.2)], legendes=[("v48.1", "Une capture vous gêne ? Envoyez-la au chef de projet 📸")])
M.demo(52.6, 55.8, "v7", [(296.0, 296.3)], "Tout est bon : je valide, Claude Code lance l'étape 3", zooms=[(296.0, 540, 1690, 1.25)],
       surlignes=[(296.1, 100, 1500, 1060, 1880)])
M.carte(55.8, 61.15, "C'est comme ça qu'on avance", "👣", [("Étape par étape", "étape"), ("En vérifiant chaque fois", "vérifiant"), ("Jusqu'à la fin du projet", "fin")],
        icones=["👣", "✅", "🏁"])

# En direct (vidéo 7)
M.anim(D + 345.75, D + 364.5, "rappel", {"bloc": ("bloc", D + 345.75), "claude": ("chef", D + 345.75), "cahier": ("cahier", D + 345.75)},
       images=["formation/p2d/rappel_bloc.png", "formation/p2d/rappel_chef.png", "formation/p2d/rappel_cahier.png"],
       etiquettes=["1. Le bloc-notes", "2. Le chef de projet (prompt du guide)", "3. Le cahier des charges"], titreAnim="La méthode, c'est simple")
M.carte(D + 364.5, D + 384.0, "Le bloc-notes", "📝", [("Écrivez, ou dictez votre objectif", "objectif"), ("Les prompts modèles du guide", "prompts"),
                                                     ("Remplissez-les vous-même", "remplir")], icones=["✍️", "📘", "📝"])
M.video(D + 384.0, D + 397.5, "mk99890.mp4", 0.5, "Donnez tous les détails, suivez le projet de près 🔍", mot="détails")
M.carte(D + 397.5, D + 407.0, "Mon conseil : Claude Code", "🏆", [("Les autres modèles sont bien", "autres"), ("Claude Code : le meilleur, pour moi", "meilleur")],
        icones=["👍", "🏆", "✅"])
M.carte(D + 407.0, D + 439.0, "L'abonnement Claude Code", "💳", [("13 500 F par mois", "13"), ("Pas d'argent ? Écrivez-moi", "d'argent"),
                                                                ("Créez de vrais projets", "vrais")], icones=["💳", "✉️", "🚀"])

M.demo(66.0, 74.9, "v7", [(140.0, 140.3)], "Ma limite est atteinte : il faudra attendre quelques heures ⏳", zooms=[(140.0, 540, 1560, 1.5)],
       surlignes=[(140.1, 30, 1500, 1060, 1580)], legendes=[("v71.38", "C'est normal : cela vous arrivera aussi")])
M.image("rappel_cc", "v7", 2.0)
M.anim(93.9, 112.05, "rappel", {"bloc": ("bloc", 93.9), "claude": ("Claude", 93.9), "cahier": ("développeur", 93.9), "patron": ("patron", 93.9)},
       images=["formation/p2d/rappel_bloc.png", "formation/p2d/rappel_chef.png", "formation/p2d/rappel_cc.png"],
       etiquettes=["1. Le bloc-notes", "2. Claude, chef de projet", "3. Claude Code, développeur"], titreAnim="Récapitulons",
       legendeFin="👑 Vous, le patron : le lien entre les deux")
M.carte(112.05, 130.1, "Votre devoir avant la partie 3", "📝",
        [("Lancez la 1re étape de votre agent", "Lancez"), ("Faites un tour complet de la boucle", "tour"), ("Une capture dans le groupe WhatsApp, sans clé", "envoyez")],
        icones=["🚀", "🔁", "📸"])
M.anim(130.1, 134.0, "fin", {"moteur": ("suite", 130.1), "moins": ("bientôt", 130.1)}, entete="BRAVO POUR VOTRE TRAVAIL 👏",
       code="Partie 3", titre="La suite arrive très bientôt !", sous="🚀 À très vite", icones=["🎉", "🚀"])
M.ecrire()
