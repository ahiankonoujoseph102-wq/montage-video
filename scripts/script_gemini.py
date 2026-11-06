"""Écrit le script et le plan visuel d'une vidéo Lomé IA School avec Gemini (clé gratuite), puis vérifie les règles.

Usage : GEMINI_API_KEY=… python3 scripts/script_gemini.py <dossier projet> [sujet imposé]
Sorties : <dossier>/script.json et <dossier>/plan.json (même format que projets/test-auto/), <dossier>/gemini.json
          (réponse brute et contrôles). La clé est lue dans l'environnement (secret GitHub), jamais écrite.

Contenu :
- rubrique suivante du calendrier (projets/calendrier.json), sujet jamais repris (projets/test-auto/historique.json) ;
- seuls les faits de projets/faits_verifies.json marqués « verifie: true » sont donnés à Gemini ;
- la fin est fixe et ajoutée ici (abonnement, « Commente PROMPT », consultation gratuite, numéro), jamais par Gemini.

Vitesse (le lancement #3 a attendu 20 min : erreurs 503 en série, délais de 240 s doublés, script trop court) :
- 1er tour : 90 s au plus par modèle, aucune attente sur une surcharge (on passe au modèle suivant) ;
- 2e tour seulement si tous ont échoué : 180 s, après une pause de 15 s ;
- le dernier modèle qui a réussi est essayé en premier (projets/test-auto/gemini_modele.txt).

Règles vérifiées après chaque réponse (jusqu'à 3 essais, avec les erreurs renvoyées à Gemini) :
- 340 à 460 mots au total, fin comprise (2 à 3 min avec la voix clonée), une scène par phrase ;
- aucun nombre en chiffres sauf le contact vérifié et les numéros 1 à 10 ; ni pourcentage, ni promesse, ni peur ;
- types de scènes, emojis valides ; orthographe des noms (glossaire) ; un prompt montré à l'écran.
"""
import datetime
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
PRIORITAIRE = "gemini-3.6-flash"  # meilleure qualité de texte que « lite », réponse en 15 à 60 s
MEMOIRE = ROOT / "projets" / "test-auto" / "gemini_modele.txt"  # dernier modèle qui a réussi
DELAIS = [150, 240]  # s d'attente d'une réponse (script long, réflexion « low ») : 1er tour, 2e tour
EMOJIS = {p.stem for p in (ROOT / "projets" / "test-auto" / "emojis").glob("*.json")}
TYPES = {"reponseIA", "question", "alerte", "carte", "numero", "prompt", "deux", "liste", "telephone", "final",
         "outil", "photo", "demo"}
FONDS = {"bleu", "violet", "orange", "nuit", "vert", "rose"}
GESTES = {"repos", "explique", "designe", "compte", "bras-croises", "pouce"}
EXPRESSIONS = {"neutre", "parle", "grimace", "sourire", "surpris"}
FAITS = json.loads((ROOT / "projets" / "faits_verifies.json").read_text())
CALENDRIER = json.loads((ROOT / "projets" / "calendrier.json").read_text())["rubriques"]
CONTACTS = FAITS["chiffres_autorises"]
NUMERO_DIT = "plus deux cent vingt-huit, soixante-douze, vingt-quatre, zéro deux, trente et un"
MOTS_MIN, MOTS_MAX = 500, 700  # visés (3 à 4 min) ; accepté à partir de MOTS_PLANCHER (environ 3 min)
MOTS_PLANCHER = 450
# Mots et tournures interdits (fausses promesses, chiffres, peur, mépris, domination, religion).
INTERDITS = ["%", "garanti", "garantie", "millionnaire", "devenir riche", "sans effort", "en une nuit", "meilleur au monde",
             "gratuit à vie", "argent facile", "gagner de l'argent", "salaire", "emploi assuré", "dominer", "domine",
             "écraser", "religion", "bible", "coran", "prophète", "intelligence artificielle remplace"]
PEUR = r"\b(te|vous|les) remplacer\b|\bperdre (ton|votre|son) (travail|emploi|boulot)\b|\bchômage\b|\bnuls?\b|\bidiots?\b"

# Fin identique pour chaque vidéo (dans cet ordre, demandé par Joseph).
FIN = [
    ({"partie": "fin", "texte": "Abonne-toi, like et partage."},
     {"type": "alerte", "texte": "ABONNE-TOI\nLIKE ET PARTAGE", "emoji": "1f44d", "geste": "pouce", "expression": "sourire"},
     "rose"),
    ({"partie": "fin", "texte": "Commente PROMPT et je t'envoie le prompt en message privé."},
     {"type": "carte", "kicker": "COMMENTE", "texte": "PROMPT", "sous": "Je t'envoie le prompt en privé", "emoji": "1f4ac",
      "geste": "designe", "expression": "sourire"},
     "violet"),
    ({"partie": "fin", "texte": "Et ta consultation est gratuite : réserve-la avec le lien dans la bio."},
     {"type": "carte", "kicker": "CONSULTATION", "texte": "GRATUITE", "sous": "Lien dans la bio", "emoji": "1f381",
      "geste": "explique", "expression": "sourire"},
     "orange"),
    ({"partie": "fin", "texte": "Ou écris-moi sur WhatsApp au +228 72 24 02 31."},
     {"type": "telephone", "texte": "+228 72 24 02 31", "sous": "WhatsApp", "geste": "pouce", "expression": "sourire"},
     "vert"),
]
MOTS_FIN = sum(len(p["texte"].split()) for p, _, _ in FIN)


def faits_texte():
    """Les seuls faits que Gemini peut citer (ceux marqués « verifie: true »)."""
    e, lignes = FAITS["ecole"], []
    lignes.append(f"- {e['nom']}, centre de formation à l'IA à {e['ville']}, fondé par {e['fondateur']} ; bureau : "
                  f"{e['adresse']} ; WhatsApp {e['whatsapp']} ; « {e['lien']} ». Slogan : « {e['slogan']} »")
    for cle in ("consultation", "services_entreprises"):
        if FAITS[cle].get("verifie"):
            lignes.append("- " + FAITS[cle]["texte"])
    for r in FAITS["realisations"]:
        if r.get("verifie"):
            lignes.append(f"- Réalisation à citer en exemple si utile : {r['texte']}")
    return "\n".join(lignes)


CONSIGNE = """Tu es formateur professionnel en intelligence artificielle chez Lomé IA School (Lomé, Togo). Tu écris le
script d'une MINI-FORMATION vidéo verticale (TikTok) de 3 à 4 minutes, du niveau d'une formation payante : précise,
concrète, exacte, bien expliquée. La vidéo est dite par Joseph (voix clonée) et illustrée par son double en dessin animé,
des logos d'outils, de vraies photos et des écrans.

PUBLIC : des Africains francophones (Togo, Bénin, Côte d'Ivoire, Sénégal, Cameroun…) : commerçants, entrepreneurs,
étudiants, employés, créateurs de contenu. Prends des exemples de LEUR quotidien : boutique ou restaurant à Lomé,
couturière, salon de coiffure, vente sur WhatsApp et Facebook, école, cabinet, ONG, paiement Mobile Money (sans montant).
Tutoiement, phrases claires et naturelles à l'oral, ton direct, chaleureux et motivant.

RUBRIQUE DE CETTE VIDÉO : RUBRIQUE
Choisis dans cette rubrique UN sujet PRÉCIS et PRATIQUE (exemple de bon titre : « Crée le site de ta boutique avec Claude,
étape par étape » ; mauvais titre, trop vague : « Gagne du temps avec l'IA »). Jamais de cours générique ni de conseils
vagues (« sois productif », « organise-toi ») : le spectateur doit pouvoir REFAIRE exactement ce que tu montres.

CONTENU OBLIGATOIRE :
- L'outil exact à utiliser (vrai nom, version gratuite quand elle existe), où aller, ce qu'il faut cliquer ou écrire,
  le prompt complet, le résultat obtenu, comment le vérifier et l'améliorer.
- Chaque mot technique expliqué en une phrase simple (ex. « un agent IA, c'est un assistant qui agit à ta place : il
  répond, il range, il envoie »).
- 3 à 5 étapes numérotées, chacune expliquée en 3 à 6 phrases avec un exemple africain concret.
- Une erreur fréquente à éviter et une astuce de pro.
- Un récapitulatif rapide des étapes, puis le message clé (avec tes mots) : « L'IA change déjà le travail ; ceux qui
  l'apprennent prennent de l'avance. »
- NIVEAU EXPERT : partage des méthodes de professionnel, du niveau de ce que des agences et des formateurs vendent très
  cher : la démarche complète, les bons réglages, les vrais prompts, l'ordre des étapes, comment obtenir un résultat
  propre et utilisable tout de suite. MONTRE ce que l'IA crée (scènes "demo" avec le prompt et la réponse).
- EXACTITUDE : ne dis que des choses vraies et vérifiables sur les outils tels qu'ils existent aujourd'hui. Si tu n'es pas
  certain qu'une fonction, un bouton ou une offre gratuite existe, n'en parle pas. Pas de nom de menu inventé.

RÈGLES ABSOLUES :
- LONGUEUR : MOTS_GEMINI mots au total (compte-les), 34 à 56 phrases de 8 à 18 mots chacune (une phrase = une ligne
  du tableau "phrases").
- Jamais de peur (« l'IA va te remplacer »), jamais de mépris, jamais « dominer les autres », jamais de comparaison avec
  une religion.
- Aucune promesse de revenus, d'argent ou d'emploi, aucun faux témoignage, aucun pourcentage, aucune statistique, aucun
  prix. N'écris aucun nombre en chiffres, sauf les numéros d'étape de 1 à 10.
- Ne cite QUE ces faits vérifiés sur Lomé IA School et Talkami (rien d'autre) :
FAITS
- Outils : cite-les par leur nom exact (ChatGPT, Claude, Gemini, Perplexity, WhatsApp, n8n, Make, Zapier, Google Sheets,
  WordPress, Replit…), sans prétendre à un partenariat.
- Orthographe : « Lomé IA School », « Adidogomé, Lycée Moderne 2 », « ChatGPT », « Claude », « Gemini », « IA ».
- Structure : accroche (2 à 4 phrases : un problème concret du public), présentation « Je suis Joseph, de Lomé IA
  School. », ce que tu vas apprendre (une phrase précise), les étapes, l'erreur à éviter, l'astuce de pro, le
  récapitulatif, le message clé. N'écris PAS l'appel final (abonnement, commentaire, consultation, numéro) : il est
  ajouté automatiquement après ta dernière phrase.
- TITRE D'ACCROCHE (ouverture de la vidéo, en très grand) : 3 lignes très courtes (1 à 3 mots chacune, en majuscules),
  qui donnent envie de regarder, et un mot-clé (un mot d'une des lignes) qui sera surligné en jaune.

PLAN VISUEL : pour CHAQUE phrase, une scène (même ordre, même nombre). Types possibles :
- "reponseIA" {texte, emoji} : écran de discussion avec une réponse de l'IA qui s'écrit ;
- "question" {texte (2 à 3 mots en majuscules), sous?, emoji} ; "alerte" {texte (majuscules, 2 lignes séparées par \\n
  au plus), emoji} ;
- "carte" {kicker (court, majuscules), texte (majuscules, \\n pour couper, 3 mots par ligne au plus), sous?, emoji} ;
- "numero" {n (1 à 10), texte (majuscules, 2 lignes), emoji, geste "compte", doigts (= n, 4 au plus)} ;
- "prompt" {texte (la demande exacte à écrire à l'IA, 80 caractères au plus), geste "designe"} ;
- "deux" {gauche {texte, ok}, droite {texte, ok}, a [mot de la phrase pour la carte gauche, mot pour la droite]} ;
- "liste" {titre, items [{texte (court), a (mot de la phrase)}] (2 à 4 items)} ;
- "outil" {outil: "chatgpt" | "claude" | "gemini" | "perplexity"} : vraie capture de la page publique de l'outil, pour la
  phrase qui présente ou recommande cet outil (2 au plus par vidéo) ;
- "demo" {outil: "chatgpt" | "claude" | "gemini" | "perplexity", prompt (le prompt exact, 140 caractères au plus),
  reponse (un extrait RÉALISTE de la réponse que l'outil donne, 3 à 6 lignes courtes séparées par \\n, 260 caractères au
  plus)} : démonstration à l'écran ; au moins 2 par vidéo, sur les phrases qui expliquent quoi écrire et ce qu'on obtient ;
- "photo" {recherche (3 à 5 mots EN ANGLAIS pour une banque d'images ; ajoute "african" quand on voit des personnes,
  ex. "african woman shop smartphone"), texte (2 à 4 mots en majuscules)} : vraie photo ou vidéo libre de droits de la
  situation concrète dont parle la phrase ; 6 à 10 par vidéo, jamais de célébrité, de marque ni de logo.
Les mots "a" doivent être copiés EXACTEMENT tels qu'ils sont écrits dans la phrase (avec leur ponctuation collée, ex. "mots,").
Champs facultatifs pour le double : "geste" parmi repos, explique, designe, compte, bras-croises, pouce ; "expression"
parmi neutre, parle, grimace, sourire, surpris.
Emojis autorisés (codes) : EMOJIS.
"fond" : une couleur par phrase parmi bleu, violet, orange, nuit, vert, rose (varier).

Réponds UNIQUEMENT en JSON :
{"accroche": {"lignes": ["LIGNE 1", "LIGNE 2", "LIGNE 3"], "cle": "MOT"},
 "titre": "titre TikTok accrocheur, 70 caractères au plus",
 "description": "description TikTok de 1 à 3 phrases, sans hashtag",
 "hashtags": ["#IA", "... 4 à 7 hashtags"],
 "prompt": "UNIQUEMENT le texte du prompt à copier-coller dans ChatGPT, Claude ou Gemini (sans salutation ni introduction), celui montré dans la vidéo, en version complète (400 caractères au plus)",
 "phrases": [{"partie": "accroche|presentation|r1|r2|...|morale", "texte": "..."}], "scenes": [...], "fond": [...]}"""


def erreur_http(e):
    """Message d'erreur de Google (code et texte), sans jamais la clé."""
    try:
        detail = json.loads(e.read().decode()).get("error", {})
        return f"HTTP {e.code} {detail.get('status', '')} : {detail.get('message', '')[:300]}"
    except Exception:
        return f"HTTP {e.code}"


def modeles_disponibles(cle):
    """Modèles Gemini que la clé peut utiliser pour écrire du texte : le dernier qui a réussi, le prioritaire, puis
    les autres « flash » du plus récent au plus ancien (versions stables avant préversions et alias)."""
    req = urllib.request.Request(f"{BASE}/models?pageSize=1000", headers={"x-goog-api-key": cle})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            liste = json.load(r).get("models", [])
    except urllib.error.HTTPError as e:
        sys.exit("Gemini refuse la liste des modèles : " + erreur_http(e))
    noms = [m["name"].split("/")[-1] for m in liste if "generateContent" in m.get("supportedGenerationMethods", [])]
    exclus = ("image", "tts", "live", "audio", "embedding", "learnlm", "gemma", "robotics", "computer-use")
    flash = [n for n in noms if "flash" in n and not any(x in n for x in exclus)]
    dernier = MEMOIRE.read_text().strip() if MEMOIRE.exists() else ""
    version = lambda n: [-int(x) for x in re.findall(r"\d+", n)] or [0]
    rang = lambda n: (n != dernier, n != PRIORITAIRE, "preview" in n or "exp" in n, "latest" in n, version(n), n)
    choix = sorted(flash, key=rang)
    print("Modèles Gemini utilisables avec cette clé :", ", ".join(choix[:6]) or "aucun", flush=True)
    return choix[:6]


def reflexion(modele):
    """Réflexion réduite au minimum : niveau « minimal » (Gemini 3 et plus), budget 0 (Gemini 2.5), rien sinon."""
    v = re.search(r"gemini-(\d+)", modele)
    if v and int(v.group(1)) >= 3:
        return [{"thinkingLevel": "low"}, {"thinkingLevel": "minimal"}, None]
    if "2.5" in modele:
        return [{"thinkingBudget": 0}, None]
    return [None]


LENTS = set()  # modèles qui refusent la réflexion minimale (plus d'une minute par réponse)


class Echec(Exception):
    """Un modèle n'a pas répondu (message lisible, sans la clé)."""


def appeler(modele, cle, tours, delai, reglages=None):
    """Un appel à Gemini, sans nouvelle tentative (un échec fait passer au modèle suivant). Seul un réglage de
    réflexion refusé (erreur 400) est réessayé tout de suite avec le réglage suivant."""
    url = f"{BASE}/models/{modele}:generateContent"
    for reglage in (reglages or reflexion(modele)):
        config = {"responseMimeType": "application/json", "temperature": 0.9}
        if reglage:
            config["thinkingConfig"] = reglage
        corps = {"contents": [{"role": r, "parts": [{"text": x}]} for r, x in tours], "generationConfig": config}
        req = urllib.request.Request(url, data=json.dumps(corps).encode(), method="POST",
                                     headers={"Content-Type": "application/json", "x-goog-api-key": cle})
        try:
            with urllib.request.urlopen(req, timeout=delai) as r:
                rep = json.load(r)
            parts = rep["candidates"][0]["content"]["parts"]
            return "".join(p.get("text", "") for p in parts if not p.get("thought"))
        except urllib.error.HTTPError as e:
            msg = erreur_http(e)
            if e.code == 400 and "think" in msg.lower() and reglage is not None:
                print(f"{modele} : réglage de réflexion {reglage} refusé", flush=True)
                if reglage == {"thinkingLevel": "minimal"} and not reglages:
                    LENTS.add(modele)  # ce modèle réfléchit forcément : lent, gardé pour le second tour
                    raise Echec("réflexion minimale refusée (modèle lent, gardé pour le second tour)")
                continue
            raise Echec(msg)
        except (urllib.error.URLError, TimeoutError, OSError, KeyError, IndexError, ValueError) as e:
            raise Echec(repr(e)[:300])
    raise Echec("aucun réglage de réflexion accepté")


def generer(modeles, cle, tours, journal):
    """Premier modèle qui répond : tour rapide (90 s, sans attente), puis tour patient (180 s) si tous ont échoué."""
    for tour, delai in enumerate(DELAIS):
        if tour:
            print("Tous les modèles ont échoué au premier tour : second tour, plus patient, dans 15 s", flush=True)
            time.sleep(15)
        for modele in modeles:
            if tour == 0 and modele in LENTS:
                continue
            t0 = time.time()
            try:
                reglages = [{"thinkingLevel": "low"}, None] if modele in LENTS else None
                return modele, appeler(modele, cle, tours, delai, reglages), time.time() - t0
            except Echec as e:
                journal.append({"modele": modele, "erreur": str(e), "secondes": round(time.time() - t0, 1)})
                print(f"{modele} : {e} — modèle suivant", flush=True)
    return None, None, 0


def corriger(d):
    """Corrections automatiques : glossaire, fin fixe ajoutée, numéro dit en toutes lettres, « IA » dit « i-a »."""
    gloss = json.loads((ROOT / "glossaire.json").read_text())["termes"]
    d["phrases"] = [p for p in d["phrases"] if p.get("partie") != "fin"]
    n = len(d["phrases"])
    d["scenes"], d["fond"] = d.get("scenes", [])[:n], d.get("fond", [])[:n]
    for p in d["phrases"]:
        t = p["texte"]
        for g in gloss:
            if g["terme"].startswith("+"):  # numéro de téléphone : vérifié à part (sinon « +228 +228 … »)
                continue
            for v in g["variantes"]:
                t = re.sub(rf"(?i)\b{re.escape(v)}\b", g["terme"], t)
        p["texte"] = t
    if len(d["scenes"]) == n and len(d["fond"]) == n:
        for p, s, f in FIN:
            d["phrases"].append(dict(p)), d["scenes"].append(dict(s)), d["fond"].append(f)
    for p in d["phrases"]:
        t = p["texte"]
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
    if not MOTS_PLANCHER <= mots <= MOTS_MAX + 10:
        manque = MOTS_MIN - mots
        err.append(f"Ton script fait {mots - MOTS_FIN} mots, il en faut entre {MOTS_MIN - MOTS_FIN} et {MOTS_MAX - MOTS_FIN}"
                   + (f" : ajoute environ {manque} mots (par exemple {max(2, manque // 13)} phrases de plus dans le contenu,"
                      " avec leurs scènes et leurs fonds) en gardant le reste." if manque > 0 else " : raccourcis."))
    if not 30 + len(FIN) <= len(ph) <= 62 + len(FIN):
        err.append(f"{len(ph) - len(FIN)} phrases : il en faut entre 34 et 56.")
    acc = d.get("accroche") or {}
    if not (isinstance(acc.get("lignes"), list) and 2 <= len(acc["lignes"]) <= 3 and all(len(str(x)) <= 16 for x in acc["lignes"])):
        err.append("« accroche » : 3 lignes très courtes (16 caractères au plus chacune) et un mot-clé « cle ».")
    if len(sc) != len(ph) or len(d.get("fond", [])) != len(ph):
        err.append("Il faut exactement une scène et un fond par phrase.")
    for k in ("titre", "description", "prompt"):
        if not str(d.get(k, "")).strip():
            err.append(f"Le champ « {k} » est vide.")
    if not isinstance(d.get("hashtags"), list) or not 3 <= len(d["hashtags"]) <= 8:
        err.append("Il faut 4 à 7 hashtags dans « hashtags ».")
    if not any(s.get("type") == "prompt" for s in sc):
        err.append("Il faut au moins une scène « prompt » qui montre la demande exacte à écrire à l'IA.")
    textes = [(f"Phrase {i}", p["texte"]) for i, p in enumerate(ph)]
    textes += [("Titre", d.get("titre", "")), ("Description", d.get("description", "")), ("Prompt", d.get("prompt", ""))]
    for ou, t in textes:
        for x in INTERDITS:
            if re.search(r"(?<!\w)" + re.escape(x.lower()) + r"(?!\w)", t.lower()) or (x == "%" and "%" in t):
                err.append(f"{ou} : « {x} » est interdit.")
        peur = re.search(PEUR, t.lower())
        if peur:
            err.append(f"{ou} : pas de peur ni de mépris (« {peur.group(0)} »).")
        if ou.startswith("Phrase"):
            for n in re.findall(r"\d+", t.replace(CONTACTS[0], "")):
                if int(n) > 10:
                    err.append(f"{ou} : nombre « {n} » interdit (aucun chiffre non vérifié).")
    for i, s in enumerate(sc):
        if s.get("type") not in TYPES:  # type rangé sous un autre nom par Gemini
            for k in ("type_scene", "typeScene", "scene", "kind", "genre", "layout"):
                if isinstance(s.get(k), str) and s[k] in TYPES:
                    s["type"] = s.pop(k)
                    break
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
        if s.get("type") == "prompt" and len(s.get("texte", "")) > 90:
            err.append(f"Scène {i} : prompt trop long à l'écran (80 caractères au plus).")
    d["fond"] = [f if f in FONDS else "bleu" for f in d.get("fond", [])]
    titre = d.get("titre", "").lower()
    if any(titre and (titre == h.lower() or titre in h.lower() or h.lower() in titre) for h in deja):
        err.append("Sujet déjà traité : choisis un autre sujet.")
    return err


RELECTURE = """Relis maintenant ce script comme un formateur expert et exigeant, puis renvoie le JSON complet amélioré
(même format, mêmes règles) :
- EXACTITUDE : corrige ou supprime toute affirmation fausse, douteuse ou inventée sur les outils (fonctions, boutons,
  offres gratuites, noms de menus). Dans le doute, retire-la.
- CLARTÉ : chaque étape doit être refaisable par un débutant : quoi ouvrir, quoi écrire, quoi obtenir. Explique chaque
  mot technique. Supprime les phrases vagues ou génériques et remplace-les par du concret.
- PUBLIC : exemples tirés du quotidien africain francophone.
- Garde la longueur (MOTS_GEMINI mots), une scène et un fond par phrase, le titre d'accroche et le prompt."""


def relecture(modeles, cle, tours, brut, deja, journal):
    """Seconde passe de Gemini en relecteur expert ; gardée seulement si elle respecte toutes les règles."""
    t0 = time.time()
    modele, brut2, _ = generer(modeles[:2], cle, tours + [("model", brut), ("user", RELECTURE.replace(
        "MOTS_GEMINI", f"{MOTS_MIN - MOTS_FIN} à {MOTS_MAX - MOTS_FIN}"))], journal)
    if not brut2:
        return None
    try:
        d2 = corriger(json.loads(brut2))
    except Exception as e:
        journal.append({"relecture": modele, "erreur": f"réponse illisible : {e}"})
        return None
    err = verifier(d2, deja)
    journal.append({"relecture": modele, "secondes": round(time.time() - t0, 1), "erreurs": err})
    print(json.dumps(journal[-1], ensure_ascii=False), flush=True)
    return None if err else d2


def rubrique_suivante(historique):
    """Rubrique qui suit celle de la dernière vidéo (rotation du calendrier)."""
    ids = [r["id"] for r in CALENDRIER]
    derniere = next((h["rubrique"] for h in reversed(historique) if isinstance(h, dict) and h.get("rubrique") in ids), None)
    i = (ids.index(derniere) + 1) % len(ids) if derniere else 0
    return CALENDRIER[i]


def main():
    dossier = Path(sys.argv[1])
    sujet = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2].strip() else ""
    cle = os.environ.get("GEMINI_API_KEY", "").strip()  # un retour à la ligne collé avec la clé la rendrait invalide
    if not cle:
        sys.exit("GEMINI_API_KEY manquant ou vide (secret GitHub non transmis).")
    print(f"Clé Gemini lue ({len(cle)} caractères, valeur masquée).", flush=True)
    t_debut = time.time()
    modeles = modeles_disponibles(cle)
    if not modeles:
        sys.exit("Aucun modèle Gemini de texte n'est disponible pour cette clé.")
    hist_f = ROOT / "projets" / "test-auto" / "historique.json"
    historique = json.loads(hist_f.read_text()) if hist_f.exists() else []
    deja = [h["titre"] if isinstance(h, dict) else h for h in historique]
    rub = rubrique_suivante(historique)
    demande = (CONSIGNE.replace("EMOJIS", ", ".join(sorted(EMOJIS))).replace("FAITS", faits_texte())
               .replace("RUBRIQUE", f"{rub['nom']} ({rub['idees']})")
               .replace("MOTS_GEMINI", f"{MOTS_MIN - MOTS_FIN} à {MOTS_MAX - MOTS_FIN}"))
    demande += "\n\nSujets déjà traités (à NE PAS reprendre) : " + "; ".join(deja or ["aucun"])
    if sujet:
        demande += f"\n\nSujet imposé : {sujet}"
    print(f"Rubrique : {rub['nom']}", flush=True)
    journal, d, err, modele = [], {}, ["aucune réponse"], None
    tours = [("user", demande)]
    for essai in range(3):
        modele, brut, duree = generer(modeles, cle, tours, journal)
        if brut is None:
            dossier.mkdir(parents=True, exist_ok=True)
            (dossier / "gemini.json").write_text(json.dumps(journal, ensure_ascii=False, indent=1))
            sys.exit("Aucun modèle Gemini n'a répondu : voir gemini.json.")
        modeles = [modele] + [m for m in modeles if m != modele]  # garder celui qui répond pour les corrections
        try:
            d = corriger(json.loads(brut))
        except (json.JSONDecodeError, KeyError, TypeError, AttributeError) as e:
            journal.append({"essai": essai + 1, "modele": modele, "erreur": f"réponse illisible : {e}"})
            print(journal[-1], flush=True)
            tours += [("model", brut), ("user", "Ta réponse n'est pas un JSON valide au format demandé. Réponds uniquement en JSON.")]
            err = ["JSON"]
            continue
        err = verifier(d, deja)
        journal.append({"essai": essai + 1, "modele": modele, "secondes": round(duree, 1), "erreurs": err})
        print(json.dumps(journal[-1], ensure_ascii=False), flush=True)
        if not err:
            break
        tours += [("model", brut), ("user", "Ta réponse ne respecte pas ces règles. Renvoie le JSON complet corrigé :\n- "
                                       + "\n- ".join(err[:12]))]
    dossier.mkdir(parents=True, exist_ok=True)
    (dossier / "gemini.json").write_text(json.dumps({"journal": journal, "reponse": d, "rubrique": rub["id"],
                                                    "secondes": round(time.time() - t_debut, 1)},
                                                   ensure_ascii=False, indent=1))
    if err:
        sys.exit("Le script ne respecte toujours pas les règles après 3 essais : voir gemini.json.")
    MEMOIRE.write_text(modele + "\n")
    hashtags = " ".join(h if h.startswith("#") else "#" + h for h in d["hashtags"])
    relu = relecture(modeles, cle, tours, brut, deja, journal)
    if relu:
        d = relu
    acc = d.get("accroche") or {}
    script = {"accroche": {"lignes": [str(x).upper() for x in acc.get("lignes", [])][:3], "cle": str(acc.get("cle", "")).upper()},
              "titre": d["titre"], "description": d["description"], "hashtags": hashtags, "prompt": d["prompt"],
              "description_tiktok": f"{d['description']} {hashtags}", "rubrique": rub["id"],
              "date": datetime.date.today().isoformat(), "phrases": d["phrases"]}
    plan = {"scenes": d["scenes"], "fond": d["fond"]}
    (dossier / "script.json").write_text(json.dumps(script, ensure_ascii=False, indent=1))
    (dossier / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=1))
    print(f"Script : {d['titre']} — {sum(len(p['texte'].split()) for p in d['phrases'])} mots, "
          f"{len(d['phrases'])} phrases, {modele}, {time.time() - t_debut:.0f} s")


if __name__ == "__main__":
    main()
