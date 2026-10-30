"""Corrections des mots mal entendus dans la parole en direct (relues à la main)."""
import re

# (suite de mots telle que transcrite, sans ponctuation ni majuscules) → texte affiché
SUITES = [
    ("argent de programmation", "agent de programmation"), ("votre argent", "votre agent"),
    ("je perds", "je paie"), ("perds", "paie"), ("comme cloudflare", "comme Claude Code"), ("cloudflare va", "Claude va"),
    ("codes", "Codex"), ("qui sort", "Cursor"), ("claude code a dit", "Claude a dit"), ("l autre code", "Claude"),
    ("espère", "expert"), ("du soir mais sa subversion", "de choisir la version"), ("sa subversion", "la version"),
    ("subversion", "version"), ("aurez assez", "aurez accès"), ("avoir assez", "avoir accès"), ("voir assez", "avoir accès"),
    ("crochez", "cochez"), ("le contenu avec google", "« Continuer avec Google »"), ("continuer avec google", "« Continuer avec Google »"),
    ("compriez", "compreniez"), ("adresse simile", "adresse e-mail"), ("une adresse similaire", "une adresse e-mail"), ("j ai créé un", "je crée un"), ("tête des projets", "taille des projets"),
    ("un chat commercial", "un chat commercial"), ("cliquez sur on ici", "cochez ici"),
]


def nettoyer(m: str) -> str:
    return re.sub(r"[^\wàâäçéèêëîïôöùûüÿœ' -]", "", m.lower()).replace("'", " ").strip()


def corriger_mots(mots: list[dict]) -> list[dict]:
    """Remplace les suites de mots mal entendues ; un remplacement prend les temps de toute la suite."""
    cles = [nettoyer(m["mot"]) for m in mots]
    out, i = [], 0
    while i < len(mots):
        for avant, apres in SUITES:
            n_av = avant.split()
            # un mot transcrit peut contenir une apostrophe (« l'autre » → « l autre ») : on compare jeton par jeton
            seq, j = [], i
            while j < len(mots) and len(seq) < len(n_av):
                seq += cles[j].split()
                j += 1
            if seq == n_av:
                fin_ponct = re.search(r"[,.;:!?]+$", mots[j - 1]["mot"])
                out.append({"mot": apres + (fin_ponct.group() if fin_ponct else ""), "debut": mots[i]["debut"], "fin": mots[j - 1]["fin"]})
                i = j
                break
        else:
            out.append(mots[i])
            i += 1
    return out
