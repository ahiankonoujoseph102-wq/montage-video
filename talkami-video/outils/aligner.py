"""Aligne le texte prévu sur la transcription horodatée.

Les sous-titres gardent l'orthographe et la ponctuation du texte prévu
(« ChatGPT », « Lomé IA School ») ; la transcription ne fournit que les
horodatages. Les mots mal reconnus reçoivent le temps de leur homologue ; les
mots manqués sont répartis dans l'intervalle, au prorata de leur longueur.

Usage : python outils/aligner.py texte.txt transcription.json debut_voix sortie.json [mots_ajoutes] [corrections.json]
  debut_voix  : instant (s) où commence la voix découpée ; tous les temps en sont décalés.
  mots_ajoutes : mots dits en plus du texte, en fin d'enregistrement (ex. « Merci. »),
                 repris de la transcription.
  corrections.json : {"indice du mot": [debut, fin]} en secondes de voix découpée,
                 pour les passages que Whisper horodate mal (mesurés sur l'énergie).
"""
import difflib
import json
import re
import sys
import unicodedata


def normaliser(m: str) -> str:
    m = unicodedata.normalize("NFD", m.lower())
    return "".join(c for c in m if c.isalnum() and not unicodedata.combining(c))


def mots_du_texte(texte: str) -> list[dict]:
    """Mots du texte, la ponctuation isolée (« : » …) étant rattachée au mot précédent."""
    mots: list[dict] = []
    guillemet_ouvert = False
    for brut in re.findall(r"\S+", texte.replace("’", "'")):
        if brut == "«":
            guillemet_ouvert = True
            continue
        if brut == "»":
            if mots:
                mots[-1]["finCitation"] = True
            continue
        if not normaliser(brut):
            if mots:
                mots[-1]["texte"] += " " + brut
            continue
        mots.append({"texte": brut, "debutCitation": guillemet_ouvert})
        guillemet_ouvert = False
    return mots


def mots_transcrits(transcription: list[dict]) -> list[dict]:
    """Recolle les morceaux que Whisper sépare (« n » + « 'est », « Fais » + « -moi »)."""
    sortie: list[dict] = []
    for m in transcription:
        if sortie and (m["mot"].startswith("'") or m["mot"].startswith("-")):
            sortie[-1]["mot"] += m["mot"]
            sortie[-1]["fin"] = m["fin"]
        else:
            sortie.append(dict(m))
    return sortie


def aligner(prevus: list[dict], transcrits: list[dict]) -> None:
    a = [normaliser(m["texte"]) for m in prevus]
    b = [normaliser(m["mot"]) for m in transcrits]
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal" or (op == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                prevus[i1 + k]["debut"] = transcrits[j1 + k]["debut"]
                prevus[i1 + k]["fin"] = transcrits[j1 + k]["fin"]
        elif op == "replace":
            # bloc de longueurs différentes : on répartit la durée du bloc transcrit
            debut, fin = transcrits[j1]["debut"], transcrits[j2 - 1]["fin"]
            longueurs = [len(a[k]) + 1 for k in range(i1, i2)]
            total, cumul = sum(longueurs), 0
            for k, lg in zip(range(i1, i2), longueurs):
                prevus[k]["debut"] = debut + (fin - debut) * cumul / total
                cumul += lg
                prevus[k]["fin"] = debut + (fin - debut) * cumul / total
    # mots sans horodatage : répartis entre leurs voisins
    i = 0
    while i < len(prevus):
        if "debut" in prevus[i]:
            i += 1
            continue
        j = i
        while j < len(prevus) and "debut" not in prevus[j]:
            j += 1
        avant = prevus[i - 1]["fin"] if i > 0 else 0.0
        apres = prevus[j]["debut"] if j < len(prevus) else avant + 0.4 * (j - i)
        pas = (apres - avant) / (j - i)
        for k in range(i, j):
            prevus[k]["debut"] = avant + pas * (k - i)
            prevus[k]["fin"] = avant + pas * (k - i + 1)
        i = j


def main() -> None:
    texte, transcription, debut_voix, destination = sys.argv[1:5]
    ajoutes = sys.argv[5].split() if len(sys.argv) > 5 else []
    corrections = json.load(open(sys.argv[6], encoding="utf-8")) if len(sys.argv) > 6 else {}
    debut_voix = float(debut_voix)
    prevus = mots_du_texte(open(texte, encoding="utf-8").read())
    transcrits = mots_transcrits(json.load(open(transcription, encoding="utf-8")))
    # les mots ajoutés en fin d'enregistrement sont pris tels que transcrits
    fin_transcrite = [m for m in transcrits if normaliser(m["mot"]) in {normaliser(x) for x in ajoutes}]
    aligner(prevus, transcrits)
    for x in ajoutes:
        t = next((m for m in reversed(fin_transcrite) if normaliser(m["mot"]) == normaliser(x)), None)
        if t:
            prevus.append({"texte": x, "debut": t["debut"], "fin": t["fin"], "debutCitation": False})
    for m in prevus:
        m["debut"] = round(m["debut"] - debut_voix, 3)
        m["fin"] = round(m["fin"] - debut_voix, 3)
    for cle, valeur in corrections.items():
        if cle.isdigit():
            prevus[int(cle)]["debut"], prevus[int(cle)]["fin"] = valeur
    for m in prevus:
        if not m.get("finCitation"):
            m.pop("finCitation", None)
        if not m.get("debutCitation"):
            m.pop("debutCitation", None)
    with open(destination, "w", encoding="utf-8") as f:
        json.dump(prevus, f, ensure_ascii=False, indent=1)
    for i, m in enumerate(prevus):
        print(f"{i:3d} {m['debut']:6.2f} {m['fin']:6.2f} {m['texte']}")


main()
