"""Corrige la transcription avec le glossaire puis, s'il existe, le script.

Usage : python3 scripts/corriger.py <projet>
Entrées : projets/<projet>/transcription_brute.json, glossaire.json,
          projets/<projet>/script.txt (facultatif)
Sorties : projets/<projet>/mots.json (mots corrigés et horodatés)
          projets/<projet>/rapport_transcription.md (texte à relire, écarts signalés)

Règles :
- glossaire : les variantes connues sont remplacées par l'orthographe officielle ;
- script : un mot douteux (probabilité faible ou mot proche de celui du script) est
  remplacé par le mot du script ; ce que la personne dit et qui n'est pas dans le
  script est gardé tel quel et signalé.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROBA_DOUTEUSE = 0.6
SIMILARITE_HOMOPHONE = 0.8  # « maîtriser » / « maîtrisez », « prompteurs » / « prompts »
PONCTUATION_FIN = ".,?!:;…"
ESPACE_FINE = "\u202f"  # espace insécable fine avant ? ! : ;


def normaliser(mot: str) -> str:
    mot = mot.lower().replace("’", "'")
    return re.sub(r"[^\w'+\-éèêëàâäîïôöùûüç]", "", mot).strip("-")


def recoller(mots):
    """Whisper coupe « l'IA » en « l » + « 'IA » et « est-ce » en « est » + « -ce »."""
    sortie = []
    for m in mots:
        if sortie and m["mot"] and (m["mot"][0] in "'’-" or all(c in PONCTUATION_FIN for c in m["mot"])):
            sortie[-1]["mot"] += m["mot"]
            sortie[-1]["fin"] = m["fin"]
            sortie[-1]["proba"] = min(sortie[-1]["proba"], m["proba"])
        else:
            sortie.append(dict(m))
    return sortie


def decouper_terme(terme: str):
    # Un numéro de téléphone reste un seul bloc à l'écran.
    if re.fullmatch(r"\+?[\d ]+", terme):
        return [terme]
    return terme.split()


def repartir(debut, fin, textes, **extra):
    """Répartit l'intervalle [debut, fin] entre plusieurs mots, au prorata de leur longueur."""
    total = sum(len(t) for t in textes) or 1
    sortie, t = [], debut
    for texte in textes:
        d = (fin - debut) * len(texte) / total
        sortie.append({"mot": texte, "debut": round(t, 3), "fin": round(t + d, 3), **extra})
        t += d
    return sortie


def appliquer_glossaire(mots, glossaire, journal):
    variantes = []
    for entree in glossaire["termes"]:
        for v in entree["variantes"] + [entree["terme"]]:
            jetons = [normaliser(x) for x in v.split()]
            variantes.append((jetons, entree["terme"]))
    variantes.sort(key=lambda x: -len(x[0]))  # les variantes les plus longues d'abord

    sortie, i = [], 0
    while i < len(mots):
        for jetons, terme in variantes:
            n = len(jetons)
            if [normaliser(m["mot"]) for m in mots[i:i + n]] == jetons:
                bloc = mots[i:i + n]
                fin_ponct = re.search(rf"[{re.escape(PONCTUATION_FIN)}]+$", bloc[-1]["mot"])
                textes = decouper_terme(terme)
                if fin_ponct:
                    textes[-1] += fin_ponct.group()
                avant = " ".join(m["mot"] for m in bloc)
                if normaliser(avant) != normaliser(" ".join(textes)) or avant.replace(" ", "") != "".join(textes):
                    journal.append(f"Glossaire : « {avant} » → « {' '.join(textes)} » ({bloc[0]['debut']:.1f} s)")
                proba = 1.0 if normaliser(avant) == normaliser(terme) else 0.99
                sortie += repartir(bloc[0]["debut"], bloc[-1]["fin"], textes, proba=proba, glossaire=True)
                i += n
                break
        else:
            sortie.append(mots[i])
            i += 1
    return sortie


def jetons_script(texte, glossaire):
    """Découpe le script en mots ; renvoie (mot, est_debut_de_phrase)."""
    jetons = []
    for brut in texte.split():
        if jetons and all(c in PONCTUATION_FIN for c in brut):
            jetons[-1] += ESPACE_FINE + brut  # « valeur ? » reste un seul mot à l'écran
        else:
            jetons.append(brut)
    # Le script passe aussi par le glossaire (ex. « 72 24 02 31 » → « +228 72 24 02 31 »).
    faux = [{"mot": j, "debut": 0.0, "fin": 0.0, "proba": 1.0} for j in jetons]
    mots = [m["mot"] for m in appliquer_glossaire(faux, glossaire, [])]
    return [(m, i == 0 or mots[i - 1][-1] in ".?!") for i, m in enumerate(mots)]


def accorder_majuscule(mot, debut_script, precedent, nom_propre):
    """Majuscule selon la phrase réellement dite, pas selon le découpage du script."""
    debut_oral = precedent is None or precedent[-1] in ".?!"
    if debut_oral:
        return mot[:1].upper() + mot[1:]
    if debut_script and not nom_propre and not mot[1:2].isupper():  # garde « IA », « ChatGPT »
        return mot[:1].lower() + mot[1:]
    return mot


def ponctuation_francaise(mot):
    return re.sub(r"(?<=\w)\s?([?!:;])", ESPACE_FINE + r"\1", mot)


def aligner(mots, script_jetons, journal):
    script = [j for j, _ in script_jetons]
    debuts = [d for _, d in script_jetons]
    a = [normaliser(m["mot"]) for m in mots]
    b = [normaliser(s) for s in script]
    sortie = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        oral = mots[i1:i2]
        ecrit = script[j1:j2]
        if op == "equal":
            for k, (m, s) in enumerate(zip(oral, ecrit)):
                precedent = sortie[-1]["mot"] if sortie else None
                sortie.append({**m, "mot": accorder_majuscule(s, debuts[j1 + k], precedent, m.get("glossaire")), "statut": "ok"})
        elif op == "replace":
            texte_oral = " ".join(m["mot"] for m in oral)
            texte_ecrit = " ".join(ecrit)
            similarite = difflib.SequenceMatcher(None, normaliser(texte_oral), normaliser(texte_ecrit)).ratio()
            douteux = min(m["proba"] for m in oral) < PROBA_DOUTEUSE or any(m.get("glossaire") for m in oral)
            homophone = len(oral) == len(ecrit) and similarite >= SIMILARITE_HOMOPHONE
            if douteux or homophone:
                sortie += repartir(oral[0]["debut"], oral[-1]["fin"], ecrit, statut="corrigé", proba=1.0)
                journal.append(("corrigé", oral[0]["debut"], texte_oral, texte_ecrit))
            else:
                sortie += [{**m, "statut": "écart"} for m in oral]
                journal.append(("écart", oral[0]["debut"], texte_oral, texte_ecrit))
        elif op == "delete":
            sortie += [{**m, "statut": "hors script"} for m in oral]
            journal.append(("hors script", oral[0]["debut"], " ".join(m["mot"] for m in oral), ""))
        elif op == "insert":
            t = mots[i1]["debut"] if i1 < len(mots) else mots[-1]["fin"]
            journal.append(("non dit", t, "", " ".join(ecrit)))
    return sortie


def rapport(mots, journal_glossaire, journal_script, a_script, journal_manuel):
    lignes = ["# Transcription corrigée", ""]
    lignes.append("Légende : **gras** = corrigé d'après le script ou le glossaire · "
                  "__souligné__ = dit à l'oral mais absent du script (gardé) · "
                  "⚠️ = mot encore douteux.")
    lignes.append("")
    phrase, debut = [], None
    for m in mots:
        if debut is None:
            debut = m["debut"]
        t = m["mot"]
        if m.get("statut") == "corrigé" or m.get("glossaire"):
            t = f"**{t}**"
        elif m.get("statut") in ("écart", "hors script"):
            t = f"__{t}__"
        if m.get("manuel"):
            t = f"**{t}**"
        if m["proba"] < PROBA_DOUTEUSE and m.get("statut") != "corrigé" and not m.get("glossaire"):
            t = f"⚠️{t}"
        phrase.append(t)
        if m["mot"][-1] in ".?!":
            lignes.append(f"- `{debut:6.1f} s` " + " ".join(phrase))
            phrase, debut = [], None
    if phrase:
        lignes.append(f"- `{debut:6.1f} s` " + " ".join(phrase))
    if journal_manuel:
        lignes += ["", "## Corrections manuelles (corrections.json)", ""]
        lignes += [f"- {j}" for j in journal_manuel]
    if journal_glossaire:
        lignes += ["", "## Glossaire appliqué", ""] + [f"- {j}" for j in journal_glossaire]
    if a_script:
        titres = {
            "corrigé": "Mots douteux corrigés d'après le script",
            "écart": "Dit à l'oral autrement que dans le script (gardé tel quel)",
            "hors script": "Dit à l'oral mais absent du script (gardé)",
            "non dit": "Dans le script mais pas dit à l'oral (non affiché)",
        }
        for cle, titre in titres.items():
            items = [j for j in journal_script if j[0] == cle]
            if not items:
                continue
            lignes += ["", f"## {titre}", ""]
            for _, t, oral, ecrit in items:
                if cle in ("corrigé", "écart"):
                    lignes.append(f"- `{t:6.1f} s` oral « {oral} » / script « {ecrit} »")
                elif cle == "hors script":
                    lignes.append(f"- `{t:6.1f} s` « {oral} »")
                else:
                    lignes.append(f"- `{t:6.1f} s` « {ecrit} »")
    return "\n".join(lignes) + "\n"


def main():
    projet = ROOT / "projets" / sys.argv[1]
    glossaire = json.loads((ROOT / "glossaire.json").read_text())
    mots = recoller(json.loads((projet / "transcription_brute.json").read_text()))

    journal_glossaire = []
    mots = appliquer_glossaire(mots, glossaire, journal_glossaire)

    journal_script = []
    script_txt = projet / "script.txt"
    if script_txt.exists():
        mots = aligner(mots, jetons_script(script_txt.read_text(), glossaire), journal_script)

    # Corrections manuelles : [{"vers": 90.0, "oral": "étudier", "affiche": "utiliser"}]
    # « affiche » vide → le mot est supprimé ; plusieurs mots → ils se partagent la durée du mot.
    corrections = projet / "corrections.json"
    journal_manuel = []
    if corrections.exists():
        for c in json.loads(corrections.read_text()):
            m = min((m for m in mots if normaliser(m["mot"]) == normaliser(c["oral"])),
                    key=lambda m: abs(m["debut"] - c["vers"]), default=None)
            if m is None or abs(m["debut"] - c["vers"]) > 3:
                print(f"Correction introuvable : {c}")
                continue
            i = mots.index(m)
            nouveaux = repartir(m["debut"], m["fin"], c["affiche"].split(), proba=1.0, statut=m.get("statut", "ok"),
                                manuel=m["mot"]) if c["affiche"] else []
            journal_manuel.append(f"`{m['debut']:6.1f} s` « {m['mot']} » → « {c['affiche'] or '(supprimé)'} »")
            mots[i:i + 1] = nouveaux

    for m in mots:
        m["mot"] = ponctuation_francaise(m["mot"])
    (projet / "mots.json").write_text(json.dumps(mots, ensure_ascii=False, indent=1))
    (projet / "rapport_transcription.md").write_text(
        rapport(mots, journal_glossaire, journal_script, script_txt.exists(), journal_manuel))
    print(f"{len(mots)} mots → {projet / 'rapport_transcription.md'}")


if __name__ == "__main__":
    main()
