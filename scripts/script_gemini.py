"""Écrit le script et le plan visuel d'une vidéo Lomé IA School avec Gemini (clé gratuite), puis vérifie les règles.

Usage : GEMINI_API_KEY=… python3 scripts/script_gemini.py <dossier projet> [sujet imposé]
Sorties : <dossier>/script.json et <dossier>/plan.json (même format que projets/test-auto/), <dossier>/gemini.json
          (réponse brute et contrôles). La clé est lue dans l'environnement (secret GitHub), jamais écrite.

Règles vérifiées après chaque réponse (jusqu'à 3 essais, avec les erreurs renvoyées à Gemini) :
- 330 à 430 mots (≥ 2 min avec la voix clonée), 22 à 36 phrases, une scène par phrase ;
- aucun chiffre en chiffres sauf les contacts vérifiés et les numéros 1 à 10 ; aucun « % » ni promesse interdite ;
- types de scènes, emojis et mots d'ancrage valides ; orthographe des noms (glossaire) ;
- sujet différent des vidéos déjà faites (projets/test-auto/historique.json).
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://generativelanguage.googleapis.com/v1beta"
PREFERES = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash"]
EMOJIS = {p.stem for p in (ROOT / "projets" / "test-auto" / "emojis").glob("*.json")}
TYPES = {"reponseIA", "question", "alerte", "carte", "numero", "prompt", "deux", "liste", "telephone", "final"}
FONDS = {"bleu", "violet", "orange", "nuit", "vert", "rose"}
GESTES = {"repos", "explique", "designe", "compte", "bras-croises", "pouce"}
EXPRESSIONS = {"neutre", "parle", "grimace", "sourire", "surpris"}
CONTACTS = ["+228 72 24 02 31"]
NUMERO_DIT = "plus deux cent vingt-huit, soixante-douze, vingt-quatre, zéro deux, trente et un"
INTERDITS = ["%", "garanti", "garantie", "millionnaire", "devenir riche", "sans effort", "en une nuit", "100", "meilleur au monde",
             "intelligence artificielle remplace", "gratuit à vie"]

CONSIGNE = """Tu écris le script d'une vidéo TikTok verticale de Lomé IA School (centre de formation à l'IA à Lomé, Togo).
La vidéo est dite par Joseph (voix clonée) et illustrée par son double en dessin animé. Écris en français, au tutoiement,
phrases courtes et naturelles à l'oral, ton chaleureux et énergique, contenu UTILE et CONCRET (démonstration, astuce ou
explication sur l'IA que le spectateur peut appliquer tout de suite).

RÈGLES ABSOLUES :
- 330 à 420 mots au total, 24 à 34 phrases (une phrase = une ligne du tableau "phrases").
- Aucune fausse promesse (pas de « tu vas devenir riche », « garanti », « en une nuit »), aucun pourcentage, aucun chiffre
  inventé, aucune statistique. N'écris aucun nombre en chiffres, sauf le numéro de contact ci-dessous et les numéros
  d'étape de 1 à 10.
- Ne cite que des faits sûrs. Faits vérifiés sur Lomé IA School : bureau à Adidogomé, Lycée Moderne 2 ; consultation
  gratuite ; contact WhatsApp +228 72 24 02 31 ; « Lien dans la bio ». Slogan : « Maîtrisez l'IA et transformez vos
  compétences en opportunités. »
- Orthographe : « Lomé IA School », « Adidogomé, Lycée Moderne 2 », « ChatGPT », « Claude », « Gemini », « IA ».
- Structure : accroche forte (2 à 5 phrases, une question ou un problème), présentation « Je suis Joseph, de Lomé IA
  School. », le contenu (étapes ou réflexes numérotés, avec des exemples concrets et des demandes à écrire à l'IA),
  une morale, puis l'appel : consultation gratuite (lien dans la bio), WhatsApp au +228 72 24 02 31, une question pour
  les commentaires, et la dernière phrase : « Lomé IA School : maîtrisez l'IA, et transformez vos compétences en
  opportunités. »

PLAN VISUEL : pour CHAQUE phrase, une scène (même ordre, même nombre). Types possibles :
- "reponseIA" {texte, emoji} : écran de discussion avec une réponse de l'IA qui s'écrit ;
- "question" {texte (2 à 3 mots en majuscules), sous?, emoji} ; "alerte" {texte (majuscules, 2 lignes séparées par \\n
  au plus), emoji} ;
- "carte" {kicker (court, majuscules), texte (majuscules, \\n pour couper, 3 mots par ligne au plus), sous?, emoji} ;
- "numero" {n (1 à 10), texte (majuscules, 2 lignes), emoji, geste "compte", doigts (= n, 4 au plus)} ;
- "prompt" {texte (la demande exacte à écrire à l'IA, 80 caractères au plus), geste "designe"} ;
- "deux" {gauche {texte, ok}, droite {texte, ok}, a [mot de la phrase pour la carte gauche, mot pour la droite]} ;
- "liste" {titre, items [{texte (court), a (mot de la phrase)}] (2 à 4 items)} ;
- "telephone" {texte "+228 72 24 02 31", sous "WhatsApp"} (seulement pour la phrase du numéro) ;
- "final" {lignes ["Lomé IA School", "Maîtrisez l'IA et transformez", "vos compétences en opportunités"]} (dernière phrase).
Les mots "a" doivent être copiés EXACTEMENT tels qu'ils sont écrits dans la phrase (avec leur ponctuation collée, ex. "mots,").
Champs facultatifs pour le double : "geste" parmi repos, explique, designe, compte, bras-croises, pouce ; "expression"
parmi neutre, parle, grimace, sourire, surpris.
Emojis autorisés (codes) : EMOJIS.
"fond" : une couleur par phrase parmi bleu, violet, orange, nuit, vert, rose (varier).

Réponds UNIQUEMENT en JSON : {"titre": "...", "description_tiktok": "... avec 4 à 7 hashtags", "phrases":
[{"partie": "accroche|r1|r2|...|morale|appel", "texte": "..."}], "scenes": [...], "fond": [...]}"""


def erreur_http(e):
    """Message d'erreur de Google (code et texte), sans jamais la clé."""
    try:
        detail = json.loads(e.read().decode()).get("error", {})
        return f"HTTP {e.code} {detail.get('status', '')} : {detail.get('message', '')[:300]}"
    except Exception:
        return f"HTTP {e.code}"


def modeles_disponibles(cle):
    """Modèles Gemini que la clé peut utiliser pour écrire du texte, les « flash » gratuits d'abord."""
    req = urllib.request.Request(f"{BASE}/models?pageSize=1000", headers={"x-goog-api-key": cle})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            liste = json.load(r).get("models", [])
    except urllib.error.HTTPError as e:
        sys.exit("Gemini refuse la liste des modèles : " + erreur_http(e))
    noms = [m["name"].split("/")[-1] for m in liste if "generateContent" in m.get("supportedGenerationMethods", [])]
    exclus = ("lite", "image", "tts", "live", "audio", "embedding", "exp", "preview", "thinking", "learnlm", "gemma")
    flash = [n for n in noms if "flash" in n and not any(x in n for x in exclus)]
    rang = lambda n: (PREFERES.index(n) if n in PREFERES else len(PREFERES), [-int(x) for x in re.findall(r"\d+", n)])
    choix = sorted(flash, key=rang) or [n for n in noms if "gemini" in n and "pro" not in n][:3]
    print("Modèles Gemini utilisables avec cette clé :", ", ".join(choix[:5]) or "aucun", flush=True)
    return choix[:3]


def appeler(modele, cle, texte):
    url = f"{BASE}/models/{modele}:generateContent"
    corps = {"contents": [{"role": "user", "parts": [{"text": texte}]}],
             "generationConfig": {"responseMimeType": "application/json", "temperature": 0.9}}
    req = urllib.request.Request(url, data=json.dumps(corps).encode(), method="POST",
                                 headers={"Content-Type": "application/json", "x-goog-api-key": cle})
    with urllib.request.urlopen(req, timeout=180) as r:
        rep = json.load(r)
    return rep["candidates"][0]["content"]["parts"][0]["text"]


def corriger(d):
    """Corrections automatiques : glossaire, numéro dit en toutes lettres, « IA » prononcé « i-a »."""
    gloss = json.loads((ROOT / "glossaire.json").read_text())["termes"]
    for p in d["phrases"]:
        t = p["texte"]
        for g in gloss:
            if g["terme"].startswith("+"):  # numéro de téléphone : vérifié à part (sinon « +228 +228 … »)
                continue
            for v in g["variantes"]:
                t = re.sub(rf"(?i)\b{re.escape(v)}\b", g["terme"], t)
        p["texte"] = t
        dit = t.replace(CONTACTS[0], NUMERO_DIT)
        dit = re.sub(r"\bl'IA\b", "l'i-a", dit)
        dit = re.sub(r"\bIA\b", "i-a", dit)
        if dit != t:
            p["dit"] = dit
    return d


def verifier(d, deja):
    err = []
    ph, sc = d.get("phrases", []), d.get("scenes", [])
    mots = sum(len(p["texte"].split()) for p in ph)
    if not 330 <= mots <= 430:
        err.append(f"{mots} mots : il en faut entre 330 et 420.")
    if not 22 <= len(ph) <= 36:
        err.append(f"{len(ph)} phrases : il en faut entre 24 et 34.")
    if len(sc) != len(ph) or len(d.get("fond", [])) != len(ph):
        err.append("Il faut exactement une scène et un fond par phrase.")
    for i, p in enumerate(ph):
        t = p["texte"]
        for x in INTERDITS:
            if re.search(r"(?<!\w)" + re.escape(x.strip().lower()) + r"(?!\w)", t.lower()) or (x == "%" and "%" in t):
                err.append(f"Phrase {i} : « {x.strip()} » est interdit.")
        reste = t.replace(CONTACTS[0], "")
        for n in re.findall(r"\d+", reste):
            if int(n) > 10:
                err.append(f"Phrase {i} : nombre « {n} » interdit (aucun chiffre inventé).")
    if ph and "Lomé IA School" not in ph[-1]["texte"]:
        err.append("La dernière phrase doit être le slogan de Lomé IA School.")
    if not any(CONTACTS[0] in p["texte"] for p in ph):
        err.append("Le numéro WhatsApp +228 72 24 02 31 doit être dit dans l'appel.")
    for i, s in enumerate(sc):
        if s.get("type") not in TYPES:
            err.append(f"Scène {i} : type « {s.get('type')} » inconnu.")
        if s.get("emoji") and s["emoji"] not in EMOJIS:
            s.pop("emoji")
        if s.get("geste") not in GESTES:
            s.pop("geste", None)
        if s.get("expression") not in EXPRESSIONS:
            s.pop("expression", None)
        if s.get("type") == "numero":
            s["doigts"] = min(4, int(s.get("n", 1)))
        if s.get("type") == "deux" and not (s.get("gauche") and s.get("droite")):
            err.append(f"Scène {i} : « deux » sans cartes gauche et droite.")
    d["fond"] = [f if f in FONDS else "bleu" for f in d.get("fond", [])]
    titre = d.get("titre", "").lower()
    if any(titre and (titre == h.lower() or titre in h.lower() or h.lower() in titre) for h in deja):
        err.append("Sujet déjà traité : choisis un autre sujet.")
    return err


def main():
    dossier = Path(sys.argv[1])
    sujet = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2].strip() else ""
    cle = os.environ.get("GEMINI_API_KEY", "").strip()  # un retour à la ligne collé avec la clé la rendrait invalide
    if not cle:
        sys.exit("GEMINI_API_KEY manquant ou vide (secret GitHub non transmis).")
    print(f"Clé Gemini lue ({len(cle)} caractères, valeur masquée).", flush=True)
    MODELES = modeles_disponibles(cle)
    if not MODELES:
        sys.exit("Aucun modèle Gemini de texte n'est disponible pour cette clé.")
    hist_f = ROOT / "projets" / "test-auto" / "historique.json"
    deja = json.loads(hist_f.read_text()) if hist_f.exists() else []
    demande = CONSIGNE.replace("EMOJIS", ", ".join(sorted(EMOJIS)))
    demande += "\n\nSujets déjà traités (à NE PAS reprendre) : " + "; ".join(deja or ["aucun"])
    if sujet:
        demande += f"\n\nSujet imposé : {sujet}"
    journal, d, err = [], {}, ["aucune réponse"]
    for essai in range(3):
        for modele in MODELES:
            t0 = time.time()
            try:
                brut = appeler(modele, cle, demande)
                break
            except urllib.error.HTTPError as e:
                journal.append({"modele": modele, "erreur": erreur_http(e)})
                print(f"{modele} : {journal[-1]['erreur']}", flush=True)
            except (urllib.error.URLError, TimeoutError, KeyError, IndexError) as e:
                journal.append({"modele": modele, "erreur": repr(e)[:300]})
                print(f"{modele} : {journal[-1]['erreur']}", flush=True)
        else:
            dossier.mkdir(parents=True, exist_ok=True)
            (dossier / "gemini.json").write_text(json.dumps(journal, ensure_ascii=False, indent=1))
            sys.exit("Aucun modèle Gemini n'a répondu : voir gemini.json.")
        try:
            d = corriger(json.loads(brut))
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            journal.append({"essai": essai + 1, "modele": modele, "erreur": f"réponse illisible : {e}"})
            print(journal[-1], flush=True)
            demande += "\n\nTa réponse n'était pas un JSON valide au format demandé. Réponds uniquement en JSON."
            err = ["JSON"]
            continue
        err = verifier(d, deja)
        journal.append({"essai": essai + 1, "modele": modele, "secondes": round(time.time() - t0, 1), "erreurs": err})
        print(json.dumps(journal[-1], ensure_ascii=False), flush=True)
        if not err:
            break
        demande += "\n\nTa réponse précédente ne respecte pas ces règles, corrige-les :\n- " + "\n- ".join(err)
    dossier.mkdir(parents=True, exist_ok=True)
    (dossier / "gemini.json").write_text(json.dumps({"journal": journal, "reponse": d}, ensure_ascii=False, indent=1))
    if err:
        sys.exit("Le script ne respecte toujours pas les règles après 3 essais : voir gemini.json.")
    script = {"titre": d["titre"], "description_tiktok": d["description_tiktok"], "phrases": d["phrases"]}
    plan = {"scenes": d["scenes"], "fond": d["fond"]}
    (dossier / "script.json").write_text(json.dumps(script, ensure_ascii=False, indent=1))
    (dossier / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=1))
    print(f"Script : {d['titre']} — {sum(len(p['texte'].split()) for p in d['phrases'])} mots, {len(d['phrases'])} phrases")


if __name__ == "__main__":
    main()
