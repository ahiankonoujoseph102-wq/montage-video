"""Document unique de la partie 2 (demande de Joseph : un seul document, comme pour la partie 1) :
explications vidéo par vidéo, différences entre les outils, tests, devoir, réponses en annexe, coordonnées de Joseph.
Usage : python3 unique.py  → livrable/Partie 2 - Construire son agent IA avec Claude Code.docx et .pdf"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from docgen import Doc  # noqa: E402
from contenu import REGLE_FUSION, TESTS, VERIF_CLES  # noqa: E402
from generer import LETTRES, OUT, pdf  # noqa: E402

NOM = "Joseph Ahiankonou (Coach Joseph)"
CONTACT = "Joseph Ahiankonou · lomeiaschool.laravel.cloud · +228 72 24 02 31 · +228 79 16 23 90"


def tests_video(D, k):
    theme, qs = TESTS[k]
    D.h2(f"Testez-vous : vidéo {k}")
    D.p("Répondez sans revoir la vidéo. Les réponses sont à la fin du document (annexe).")
    for i, (q, choix, _, _) in enumerate(qs, 1):
        D.p(f"**Question {i}.** {q}")
        if choix:
            D.puces([f"{LETTRES[j]}. {c}" for j, c in enumerate(choix)])
        else:
            D.ligne_reponse(2)


def main():
    D = Doc()
    D.couverture("LOMÉ IA SCHOOL", "Construire son agent IA avec Claude Code",
                 "Formation « Comment créer un agent IA, de A à Z » · Deuxième partie : le guide complet",
                 "Pour les débutants : aucune connaissance technique n'est nécessaire.", CONTACT)
    D.h2("Ce que contient ce guide")
    D.numeros(["Avant de commencer : votre formateur et les rôles de chacun.",
               "Vidéo 2A : la boucle de travail et la pull request.",
               "Vidéo 2B : le moteur et le cerveau de votre agent.",
               "Vidéo 2C : créer vos clés API et les ranger en sécurité.",
               "Vidéo 2D : suivre la construction jusqu'au bout.",
               "Les différences à bien comprendre.",
               "Les erreurs à éviter.",
               "Votre devoir avant la partie 3.",
               "Annexe : les réponses des tests."])

    # 1
    D.h1("1. Avant de commencer")
    D.h2("Votre formateur")
    D.p(f"Ce guide accompagne les 4 vidéos de la deuxième partie. Votre formateur : **{NOM}**, fondateur de Lomé IA School.")
    D.puces(["**WhatsApp et téléphone** : +228 72 24 02 31 et +228 79 16 23 90.",
             "**Site** : lomeiaschool.laravel.cloud.",
             "**Le groupe WhatsApp de la formation** : posez-y toutes vos questions et envoyez-y votre devoir."])
    D.h2("Où nous en sommes")
    D.p("Dans la première partie, vous avez écrit votre projet dans le bloc-notes, vous l'avez donné à Claude, votre chef de "
        "projet, et vous avez obtenu votre cahier des charges. Vous avez aussi créé votre dépôt GitHub, toujours en « Privé ». "
        "**Maintenant, on construit.** Dans les vidéos, je construis Kekeli, mon propre projet : suivez la méthode avec le vôtre.")
    D.h2("Les rôles de chacun")
    D.puces(["**Vous : le patron.** C'est vous qui décidez, et c'est vous qui faites le lien entre les deux autres.",
             "**Claude : le chef de projet.** Il organise, vérifie, explique et vous donne chaque consigne.",
             "**Claude Code : le développeur.** Il écrit le code, teste, et vous fait un compte rendu."])
    D.encadre("conseil", "Un conseil très important", "prenez le temps de bien décrire votre projet. Si vous n'avez pas une idée "
              "claire, vous créerez quelque chose de médiocre. Claude vous aide à ajuster ce qui manque sur le plan technique, mais "
              "si vous le laissez tout décider, vous obtiendrez un agent ordinaire, comme tout le monde. Écrire vous fatigue ? "
              "Touchez le micro de votre clavier et dictez votre idée, ou utilisez le mode vocal de ChatGPT, puis copiez le texte.")

    # 2
    D.h1("2. Vidéo 2A : la boucle de travail")
    D.h2("Lancer la première étape")
    D.numeros(["Dans la conversation de votre chef de projet, copiez son message de validation (par exemple : « Validé, lance l'étape 1 », avec ses corrections).",
               "Ouvrez Claude Code, dans la même session de votre projet. Collez le message et touchez Envoyer.",
               "Claude Code travaille tout seul. Cela peut prendre plusieurs minutes, parfois beaucoup plus. Laissez-le travailler : faites autre chose pendant ce temps.",
               "Quand il a fini, il écrit un compte rendu. **Copiez-le en entier** et envoyez-le au chef de projet, tel quel. Pas besoin d'expliquer : il comprend tout seul.",
               "Le chef de projet vous résume en mots simples ce qui marche et ce qui reste à faire. Pas d'accord avec une remarque ? Dites-le-lui."])
    D.encadre("attention", "Règle d'or", "ne faites jamais rien dans Claude Code sans passer par votre chef de projet. C'est lui qui doit "
              "avoir toutes les informations : ainsi, s'il y a un problème, il comprendra tout de suite et vous débloquera.")
    D.h2("La pull request, expliquée simplement")
    D.p("Claude Code travaille sur une **copie** de votre projet. Quand le travail est vérifié, on **fusionne** cette copie dans le "
        "dépôt, votre coffre-fort. Fusionner, c'est ranger le travail terminé à sa place.")
    D.p("**Pour fusionner vous-même sur GitHub** : ouvrez la pull request, descendez en bas, touchez « Merge pull request », puis « Confirm merge ».")
    D.p("**Ou laissez Claude Code le faire** (c'est mon choix). Donnez-lui une fois cette règle, valable pour toutes les étapes :")
    D.message(REGLE_FUSION, "Message à copier dans Claude Code")
    D.p("Claude Code applique alors la règle, fusionne, et vous envoie même des captures de l'application.")
    D.h2("La boucle, en 5 temps")
    D.numeros(["Le chef de projet donne la consigne.", "Claude Code construit.", "Vous copiez son compte rendu au chef de projet.",
               "Le chef vérifie et vous dit quoi faire.", "On valide, et on passe à l'étape suivante."])
    D.p("C'est comme ça, étape par étape, jusqu'à la fin du projet.")
    D.encadre("vert", "Bloqué ?", "si le chef vous demande de créer un compte et que vous ne savez pas faire, dites-le-lui simplement, "
              "envoyez une capture d'écran et demandez-lui de vous guider étape par étape. Une réponse vous semble bizarre ? "
              "Discutez avec lui, posez vos questions. Et si vous restez bloqué, je suis là.")
    tests_video(D, "2A")

    # 3
    D.h1("3. Vidéo 2B : le moteur et le cerveau")
    D.h2("Ce qui change à l'étape 2")
    D.p("L'agent commence à travailler pour de vrai. Pour Kekeli, le chef de projet m'a demandé deux comptes : **Anthropic**, le "
        "cerveau de l'agent (payant à l'utilisation), et **E2B**, les ordinateurs virtuels de l'agent (crédit gratuit au départ).")
    D.p("Je n'étais pas d'accord sur un point : Anthropic coûte cher. Alors j'ai proposé **Gemini**, qui a une offre gratuite. "
        "**C'est vous le patron** : quand une proposition ne vous convient pas, dites-le et discutez.")
    D.h2("Les deux parties d'un agent")
    D.puces(["**Le moteur** : le programme qui fait agir l'agent (lire, écrire, travailler sur les fichiers).",
             "**Le cerveau** : le modèle d'IA qui le fait réfléchir (Gemini, Claude ou un autre)."])
    D.p("Le moteur prévu au départ n'acceptait qu'un seul cerveau, Claude, payant : comme une voiture qui ne roule qu'avec une "
        "seule marque de carburant, la plus chère. La recommandation : un **moteur multi-modèle**, une voiture qui accepte "
        "plusieurs carburants. On change de cerveau à tout moment, sans reconstruire la voiture.")
    D.puces(["**Pendant la construction** : on branche Gemini, gratuit.",
             "**Au lancement, avec de vrais clients** : l'offre gratuite ne suffira pas ; on choisira le cerveau qui donne la meilleure qualité."])
    D.p("Claude Code a fait des recherches ; le chef de projet m'a conseillé **OpenCode** : un moteur vraiment multi-modèle, libre, "
        "et utilisable pour un projet commercial.")
    D.encadre("conseil", "Pendant que Claude Code travaille", "continuez à discuter avec votre chef de projet, et **lisez toujours le "
              "prompt avant de l'envoyer**. En lisant, j'ai vu une phrase à préciser : ce que voient les utilisateurs quand les limites "
              "sont épuisées. Ensemble, on a choisi un message clair : « Votre énergie du jour est épuisée. Elle sera de nouveau prête demain. »")
    D.encadre("attention", "Attention", "Gemini, E2B et OpenCode sont les choix de mon projet, Kekeli. Pour votre agent, votre chef "
              "de projet choisira peut-être d'autres outils. La méthode, elle, reste la même.")
    tests_video(D, "2B")

    # 4
    D.h1("4. Vidéo 2C : les clés API")
    D.p("Rappel : une clé API est un **code secret**. Avec elle, un service sait que c'est vous, et c'est vous qui payez. "
        "Vous ne la montrez jamais à personne. Suivez exactement les étapes de votre chef de projet ; si vous n'y arrivez pas, "
        "faites une capture (sans clé visible) et envoyez-la-lui : il vous guidera. Chaque projet aura ses propres étapes.")
    D.h2("Clé 1 : Gemini (Google AI Studio)")
    D.numeros(["Dans Google, tapez **aistudio.google.com** et connectez-vous avec votre compte Google.",
               "La première fois, Google pose quelques questions : lisez, cochez, puis touchez « Continuer ».",
               "Ouvrez « Clés API », puis touchez « Créer une clé ».",
               "Donnez un nom à la clé (facultatif, par exemple le nom de votre projet).",
               "Choisissez « Créer un projet », puis validez.",
               "Votre clé s'affiche : touchez « Copier »."])
    D.h2("Clé 2 : E2B (les ordinateurs virtuels)")
    D.numeros(["Ouvrez **e2b.dev** et touchez « Commencer à construire ».",
               "Inscrivez-vous avec votre compte GitHub, puis autorisez l'accès.",
               "E2B vous envoie un code de vérification par e-mail : copiez-le et collez-le. Ce code aussi est secret.",
               "Dans le tableau de bord, ouvrez « API Keys ».",
               "Touchez « Créer une clé », donnez-lui un nom, puis validez.",
               "Copiez la clé : elle ne sera plus affichée ensuite."])
    D.encadre("attention", "Où ne pas ranger vos clés", "dans la vidéo, j'ai collé mes clés dans mon bloc-notes. Ne faites pas comme "
              "moi : un bloc-notes n'est pas un coffre-fort. Jamais dans WhatsApp, jamais sur une capture d'écran. Collez-les "
              "directement dans Claude Code, ou gardez-les dans un gestionnaire de mots de passe.")
    D.h2("Placer les clés dans Claude Code")
    D.numeros(["Ouvrez Claude Code. Touchez le menu des environnements, choisissez l'environnement de votre projet, puis « Modifier ».",
               "Descendez jusqu'à « Variables d'environnement ».",
               "Écrivez une ligne par clé : le NOM, le signe =, puis la clé, sans espace. Le chef de projet vous donne les noms exacts "
               "(pour moi : GEMINI_API_KEY et E2B_API_KEY).",
               "Touchez « Enregistrer les modifications ».",
               "Touchez « Nouvelle session ». Choisissez votre dépôt et l'environnement où vous avez rangé les clés.",
               "Demandez à Claude Code de vérifier, sans jamais afficher les clés :"])
    D.message(VERIF_CLES, "Message à copier dans Claude Code")
    D.p("Claude Code doit répondre que les clés obligatoires sont présentes, puis il fait un petit essai et lance l'étape.")
    D.encadre("conseil", "Si Claude Code ne voit pas vos clés", "vérifiez trois choses : vous avez touché « Enregistrer » ; vous avez "
              "ouvert une nouvelle session ; vous avez choisi le bon environnement. Moi, j'avais mis mes clés dans l'environnement "
              "« Default » au lieu de celui de mon projet. Pas grave : avec des captures, le chef de projet m'a guidé pas à pas.")
    tests_video(D, "2C")

    # 5
    D.h1("5. Vidéo 2D : suivre la construction jusqu'au bout")
    D.h2("La limite d'utilisation")
    D.p("Dans Claude Code, une barre indique votre limite d'utilisation. Quand elle devient toute rouge, Claude Code s'arrête : "
        "il faut attendre quelques heures, puis recommencer. **Pas de panique** : profitez-en pour vérifier le travail, puis "
        "reprenez là où vous vous êtes arrêté. Cela vous arrivera aussi, c'est normal.")
    D.h2("Valider une étape")
    D.numeros(["Claude Code a fini une étape et vous demande si vous validez. **Ne répondez pas tout de suite.**",
               "Copiez son compte rendu et envoyez-le au chef de projet. Il vérifie que tout fonctionne pour de vrai.",
               "Le chef vous demande de regarder les captures (Claude Code en a fait 13 pour moi) : ouvrez-les et regardez-les toutes.",
               "Une capture ne vous plaît pas ? Envoyez-la au chef de projet pour avoir son avis.",
               "Tout est bon : validez. Claude Code lance l'étape suivante."])
    D.h2("Mon conseil : l'abonnement Claude Code")
    D.p("Pour créer un agent, quel que soit son type : d'abord le bloc-notes, où vous décrivez correctement votre projet (vous "
        "pouvez dicter, et utiliser les prompts modèles du guide de la partie 1) ; ensuite le chef de projet, à qui vous donnez "
        "son rôle avec le prompt du guide ; puis le cahier des charges, que vous envoyez à Claude Code. Donnez tous les détails "
        "et suivez le projet de près : si vous laissez l'IA deviner, vous n'aurez pas de bons résultats.")
    D.p("Je vous recommande Claude Code : les autres modèles sont bien, mais je le trouve meilleur. **L'abonnement Claude Code "
        "est payant : 13 500 F par mois.** Si vous n'avez pas d'argent, écrivez-moi : je vous trouverai une solution.")
    tests_video(D, "2D")

    # 6
    D.h1("6. Les différences à bien comprendre")
    for titre, a, b in [
        ("Claude et Claude Code", "**Claude** est le chef de projet : il discute, explique, organise et vérifie. Il n'écrit pas le code de votre projet.",
         "**Claude Code** est le développeur : il écrit le code dans votre dépôt, le teste et fait un compte rendu."),
        ("Le moteur et le cerveau", "**Le moteur** fait agir l'agent : lire, écrire, travailler sur les fichiers (pour Kekeli : OpenCode).",
         "**Le cerveau** le fait réfléchir : c'est le modèle d'IA (pour Kekeli : Gemini pendant la construction)."),
        ("OpenCode et Gemini", "**OpenCode** est le moteur, le programme qui fait agir l'agent.",
         "**Gemini** est le cerveau qu'on branche dessus. Plus tard, on pourra brancher un autre cerveau."),
        ("Le dépôt et la pull request", "**Le dépôt** (GitHub, en « Privé ») est le coffre-fort de votre projet.",
         "**La pull request** est le travail de Claude Code sur une copie, qu'on vérifie avant de le fusionner dans le dépôt."),
        ("L'environnement et la session", "**L'environnement** est la maison où l'on range les clés (variables d'environnement).",
         "**La session** est une pièce de la maison. Une session ouverte avant d'avoir rangé les clés ne les verra jamais : ouvrez-en une nouvelle."),
        ("Offre gratuite et offre payante", "**L'offre gratuite** (Gemini) suffit pour construire et tester.",
         "**Avec de vrais clients**, elle ne suffit plus : on choisira alors le cerveau qui donne la meilleure qualité."),
        ("La clé API et le code de vérification", "**La clé API** dit au service que c'est vous, et c'est vous qui payez.",
         "**Le code reçu par e-mail ou SMS** confirme votre compte. Les deux sont secrets : on ne les montre jamais."),
    ]:
        D.h2(titre)
        D.puces([a, b])

    # 7
    D.h1("7. Les erreurs à éviter")
    D.puces(["Laisser Claude tout décider à votre place : vous obtiendrez un agent ordinaire.",
             "Faire quelque chose dans Claude Code sans passer par le chef de projet.",
             "Valider une étape sans avoir envoyé le compte rendu au chef de projet ni regardé les captures.",
             "Envoyer un prompt sans l'avoir lu.",
             "Ranger ses clés dans le bloc-notes, WhatsApp ou une capture d'écran.",
             "Garder la même session après avoir ajouté les clés, ou se tromper d'environnement.",
             "Paniquer quand la limite d'utilisation est atteinte : il suffit d'attendre quelques heures.",
             "Rester bloqué sans rien dire : envoyez une capture à votre chef de projet, ou écrivez-moi dans le groupe."])

    # 8
    D.h1("8. Votre devoir avant la partie 3")
    D.numeros(["Lancez la **première étape** de votre propre agent avec Claude Code.",
               "Faites au moins **un tour complet de la boucle** : consigne, construction, compte rendu, vérification.",
               "Si votre projet a besoin de clés API, créez-les et placez-les dans les variables d'environnement de Claude Code.",
               "Envoyez dans le groupe WhatsApp **une capture de votre premier résultat**, sans aucune clé visible.",
               "Faites les 4 tests de ce guide et corrigez-vous avec l'annexe."])
    D.encadre("vert", "Besoin d'aide ?", f"{NOM} · WhatsApp : +228 72 24 02 31 ou +228 79 16 23 90 · lomeiaschool.laravel.cloud. "
              "Bon travail, et la suite arrive très bientôt !")

    # annexe
    D.h1("Annexe : les réponses des tests")
    for k, (theme, qs) in TESTS.items():
        D.h2(f"Vidéo {k} : {theme}")
        for i, (q, choix, rep, expl) in enumerate(qs, 1):
            texte_rep = rep if not choix or len(rep) > 1 else f"{rep}. {choix[LETTRES.index(rep)]}"
            D.p(f"**{i}.** {texte_rep}. {expl}")

    f = OUT / "Partie 2 - Construire son agent IA avec Claude Code.docx"
    D.enregistrer(f, "Partie 2 : construire son agent IA")
    pdf(f)
    print(f)


if __name__ == "__main__":
    main()
