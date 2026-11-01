"""Génère les documents de la partie 2 (docx + pdf) dans projets/agent-ia-p2/livrable/ et met à jour le guide général.
Usage : python3 generer.py"""
import copy
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from docgen import GUIDE, Doc  # noqa: E402
from contenu import COUV, TESTS, TITRES_VIDEOS, devoir_partie3, guide_partie2  # noqa: E402
from docx.oxml.ns import qn  # noqa: E402

OUT = Path(__file__).resolve().parents[1] / "livrable"
OUT.mkdir(exist_ok=True)
LETTRES = "ABCD"


def pdf(chemin):
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(chemin.parent), str(chemin)],
                   check=True, capture_output=True)


def guide2():
    D = Doc()
    D.couverture(COUV["ecole"], "Construire son agent avec Claude Code",
                 "Le guide de la deuxième partie : la boucle de travail, le moteur et le cerveau, les clés API", COUV["public"], COUV["contact"])
    D.h2("Ce que contient ce guide")
    D.puces(["La boucle de travail, en 5 temps (vidéo 2A).", "La pull request et la règle de fusion (vidéo 2A).",
             "Le moteur et le cerveau de votre agent (vidéo 2B).", "Créer vos clés API et les placer dans Claude Code (vidéo 2C).",
             "Suivre la construction jusqu'au bout (vidéo 2D).", "Votre devoir avant la partie 3."])
    D.h1("1. Construire avec Claude Code")
    guide_partie2(D)
    D.h1("2. Récapitulatif de la méthode")
    D.numeros(["**Le bloc-notes** : vous décrivez votre projet en détail.",
               "**Claude, votre chef de projet**, en fait un cahier des charges.",
               "**Claude Code, votre développeur**, construit étape par étape."])
    D.p("Et vous, **le patron**, faites le lien entre les deux : vous copiez, vous collez, vous vérifiez.")
    D.h1("3. Votre devoir avant la partie 3")
    devoir_partie3(D)
    f = OUT / "Partie 2 - Construire son agent avec Claude Code - guide.docx"
    D.enregistrer(f, "Construire son agent avec Claude Code")
    pdf(f)
    return f


def guide_general():
    D = Doc(vider=False)
    ps = D.d.paragraphs
    # sommaire : deux entrées avant « Les fiches vierges »
    fiches_som = next(p for p in ps if p.text.startswith("Les fiches vierges"))
    D.ancre = fiches_som._p
    D.m["som"] = copy.deepcopy(fiches_som._p)
    for t in ["Partie 2 : construire votre agent avec Claude Code.", "Votre devoir avant la partie 3."]:
        D._texte(D._ajout("som"), t)
    # chapitre 10 : où ranger les clés pendant la construction
    attention = next(p for p in ps if p.text.startswith("Attention : la même règle"))
    D.ancre = attention._p
    D.puces(["**Pendant la construction** : dans les variables d'environnement de Claude Code (partie 2). Jamais dans le bloc-notes, "
             "ni dans WhatsApp, ni sur une capture d'écran."])
    # nouveaux chapitres avant les fiches vierges
    fiches = next(p for p in ps if p.style is not None and p.style.name == "Heading 1" and p.text.startswith("13."))
    D.ancre = fiches._p
    D.h1("13. Partie 2 : construire votre agent avec Claude Code")
    guide_partie2(D)
    D.h1("14. Votre devoir avant la partie 3")
    devoir_partie3(D)
    texte = fiches.text.replace("13.", "15.", 1)
    for r in fiches.runs[1:]:
        r.text = ""
    fiches.runs[0].text = texte
    f = OUT / "Préparer son agent IA - guide (mis à jour, partie 2).docx"
    D.enregistrer(f)
    pdf(f)
    return f


def tests():
    fichiers = []
    R = Doc()
    R.couverture(COUV["ecole"], "Tests de la deuxième partie : les réponses", "Pour le formateur, ou à lire après avoir fait les tests",
                 COUV["public"], COUV["contact"])
    for k, (theme, qs) in TESTS.items():
        T = Doc()
        T.couverture(COUV["ecole"], f"Test de la vidéo {k}", f"{TITRES_VIDEOS[k]}", "Répondez seul, sans revoir la vidéo. Les réponses sont dans un document à part.",
                     COUV["contact"])
        T.h2(f"{len(qs)} questions sur : {theme}")
        T.p("Nom : …………………………………………………      Date : ………………………")
        R.h1(f"Test {k} — {theme}", saut=k != "2A")
        for i, (q, choix, rep, expl) in enumerate(qs, 1):
            T.p(f"**Question {i}.** {q}")
            if choix:
                T.puces([f"{LETTRES[j]}. {c}" for j, c in enumerate(choix)])
            else:
                T.ligne_reponse(2)
            texte_rep = rep if not choix or len(rep) > 1 else f"{rep}. {choix[LETTRES.index(rep)]}"
            R.p(f"**Question {i}.** {q}")
            R.encadre("vert", "Réponse", f"{texte_rep}. {expl}")
        T.encadre("conseil", "Pour corriger", "comparez avec le document des réponses. Une erreur ? Revoyez le passage de la vidéo.")
        f = OUT / f"Test vidéo {k}.docx"
        T.enregistrer(f, f"Test de la vidéo {k}")
        pdf(f)
        fichiers.append(f)
    f = OUT / "Tests partie 2 - réponses.docx"
    R.enregistrer(f, "Tests de la partie 2 : réponses")
    pdf(f)
    fichiers.append(f)
    return fichiers


if __name__ == "__main__":
    print(guide2())
    print(guide_general())
    for f in tests():
        print(f)
