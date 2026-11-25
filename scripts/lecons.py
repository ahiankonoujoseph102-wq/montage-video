"""Découpe les formations écrites de Joseph en leçons vidéo (une partie = environ 450 à 750 mots de la formation).

Usage : python3 scripts/lecons.py   → projets/formations_joseph/lecons.json
Chaque vidéo automatique enseigne une partie, dans l'ordre ; une leçon longue devient une série (« partie 1 », « partie
2 »…), la vidéo annonce la suite.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
D = ROOT / "projets" / "formations_joseph"
SOURCES = [
    ("contenu_pro_chatgpt_claude.txt", "Créer du contenu pro avec ChatGPT et Claude",
     r"^ *(Introduction —|Module \d+ —|Module complémentaire —)"),
    ("module5_films_ia.txt", "Créer un vrai film avec l'IA", r"^ *(Introduction$|Etape \d —|Exemple complet)"),
]
BRUIT = re.compile(r"(Formation ChatGPT & Claude — Coach Joseph Ahiankonou|Joseph Academy \| .*|Page \d+|^\s*\f)")


def nettoyer(lignes):
    t = "\n".join(l.rstrip() for l in lignes if not BRUIT.search(l))
    return re.sub(r"\n{3,}", "\n\n", t).strip()


lecons = []
for fichier, formation, motif in SOURCES:
    lignes = (D / fichier).read_text().splitlines()
    debuts = [i for i, l in enumerate(lignes) if re.match(motif, l)] + [len(lignes)]
    for a, b in zip(debuts, debuts[1:]):
        titre = lignes[a].strip()
        if "Annexe" in titre:
            continue
        texte = nettoyer(lignes[a:b])
        paras = [p for p in texte.split("\n\n") if p.strip()]
        morceaux, cur = [], []
        for p in paras:
            cur.append(p)
            if sum(len(x.split()) for x in cur) >= 600:
                morceaux.append(cur)
                cur = []
        if cur:
            if morceaux and sum(len(x.split()) for x in cur) < 250:
                morceaux[-1] += cur
            else:
                morceaux.append(cur)
        for k, m in enumerate(morceaux):
            lecons.append({"id": f"{fichier.split('.')[0]}:{len(lecons)}", "formation": formation, "titre": titre,
                           "partie": k + 1, "total": len(morceaux), "texte": "\n\n".join(m)})
(D / "lecons.json").write_text(json.dumps(lecons, ensure_ascii=False, indent=1))
for l in lecons:
    print(l["titre"][:60], f"{l['partie']}/{l['total']}", len(l["texte"].split()), "mots")
