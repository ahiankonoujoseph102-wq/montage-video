"""Veille du jour avant d'écrire : ce qui marche le mieux chez les créateurs de contenu IA, puis un sujet à forte valeur.

Usage : GEMINI_API_KEY=… python3 scripts/veille.py <dossier du lancement>
Gemini (clé gratuite) avec la recherche Google intégrée :
1. cherche les vidéos et tutoriels sur l'IA les plus vus, les plus commentés et les plus aimés du moment (YouTube,
   TikTok, Instagram, Facebook ; créateurs francophones et anglophones reconnus), et ce qui les rend efficaces ;
2. choisit UN sujet utile pour le public de Joseph (Afrique francophone), jamais déjà traité, et vérifie la méthode
   exacte auprès de sources d'experts (documentation officielle, tutoriels reconnus).
Écrit <dossier>/veille.json : tendances, sujet choisi, méthode vérifiée, sources (adresses trouvées par la recherche).
Limite : les réseaux sociaux ne donnent pas leurs chiffres à un programme ; les vues viennent de ce que la recherche
Google trouve (pages publiques, articles), elles sont indicatives.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import script_gemini as g  # noqa: E402

dossier = Path(sys.argv[1])
dossier.mkdir(parents=True, exist_ok=True)
cle = __import__("os").environ["GEMINI_API_KEY"].strip()
hist = json.loads((g.ROOT / "projets" / "test-auto" / "historique.json").read_text())
deja = [h["titre"] if isinstance(h, dict) else h for h in hist]

DEMANDE = f"""Tu es responsable éditorial d'une chaîne TikTok de formation à l'intelligence artificielle (Lomé IA School,
public : Afrique francophone : commerçants, entrepreneurs, étudiants, créateurs de contenu).

1. CHERCHE SUR INTERNET (recherche Google) les vidéos et tutoriels sur l'IA les plus performants des dernières semaines :
   ceux qui ont le plus de vues, de commentaires et de partages sur YouTube, TikTok, Instagram et Facebook, chez les
   créateurs IA reconnus (francophones et anglophones). Relève 8 exemples : titre, créateur, plateforme, vues si elles
   sont publiques, adresse, et POURQUOI ça marche (accroche, valeur concrète, démonstration, format).
2. CHOISIS UN SUJET pour notre prochaine vidéo, inspiré de ce qui marche (pas une copie) : un savoir-faire IA précis,
   très utile, de grande valeur (ce que des gens paieraient cher), applicable depuis un téléphone, gratuit ou avec une
   version gratuite. Thèmes possibles : outils IA (ChatGPT, Claude, Gemini, Perplexity…), prompts avancés, créer un site
   ou une application avec l'IA, agents IA, automatisations, création de vidéos, d'images, d'affiches, de contenu pour
   les réseaux, business avec l'IA. Sujets DÉJÀ traités, à ne pas reprendre : {"; ".join(deja) or "aucun"}.
3. VÉRIFIE LA MÉTHODE EXACTE de ce sujet auprès de sources d'experts (documentation officielle de l'outil, tutoriels
   reconnus) : étapes réelles, vrais noms de boutons et de menus, ce qui est gratuit, les erreurs fréquentes, les
   astuces de pro, des prompts complets qui fonctionnent. N'invente rien : si tu n'as pas pu le vérifier, ne l'écris pas.

Réponds UNIQUEMENT avec un objet JSON (sans texte autour) :
{{"tendances": [{{"titre": "", "createur": "", "plateforme": "", "vues": "", "lien": "", "pourquoi": ""}}],
  "sujet": {{"titre": "", "angle": "", "pourquoi_maintenant": "", "inspire_de": [""]}},
  "methode": {{"outil": "", "etapes": [""], "prompts": [""], "erreurs": [""], "astuces": [""], "gratuit": ""}}}}"""


def appeler_recherche(modele, recherche=True):
    import urllib.request
    corps = {"contents": [{"role": "user", "parts": [{"text": DEMANDE if recherche else DEMANDE_SANS}]}],
             "generationConfig": {"temperature": 0.7}}
    if recherche:
        corps["tools"] = [{"google_search": {}}]
    req = urllib.request.Request(f"{g.BASE}/models/{modele}:generateContent", data=json.dumps(corps).encode(),
                                 method="POST", headers={"Content-Type": "application/json", "x-goog-api-key": cle})
    with urllib.request.urlopen(req, timeout=240) as r:
        return json.load(r)


# Plan B (recherche Google refusée par le quota gratuit) : même demande, d'après les connaissances du modèle,
# signalé comme tel dans veille.json (« recherche » : false).
DEMANDE_SANS = DEMANDE.replace("CHERCHE SUR INTERNET (recherche Google)", "D'APRÈS TES CONNAISSANCES (sans recherche)")

import urllib.request  # noqa: E402
liste = json.load(urllib.request.urlopen(urllib.request.Request(f"{g.BASE}/models?pageSize=1000",
                                                                 headers={"x-goog-api-key": cle}), timeout=30))["models"]
tous = [m["name"].split("/")[-1] for m in liste if "generateContent" in m.get("supportedGenerationMethods", [])
        and ("flash" in m["name"] or "gemini-2" in m["name"]) and not any(x in m["name"] for x in ("image", "tts", "live", "audio"))]
# Les modèles qui marchent pour le script (liste et ordre de script_gemini), puis les autres ; 2.x retirés (plus ouverts).
connus = [m for m in g.modeles_disponibles(cle) if "pro" not in m]
tous = connus + [m for m in tous if m not in connus and "2.5" not in m and "preview" not in m and "omni" not in m]
print("Modèles essayés pour la veille :", ", ".join(tous), flush=True)
journal = []
for modele, recherche in [(m, True) for m in tous[:6]] + [(m, False) for m in connus[:3]]:
    try:
        rep = appeler_recherche(modele, recherche)
        c = rep["candidates"][0]
        texte = "".join(p.get("text", "") for p in c["content"]["parts"] if not p.get("thought"))
        m = re.search(r"\{.*\}", texte, re.S)
        d = json.loads(m.group(0))
        sources = [{"titre": ch["web"].get("title", ""), "lien": ch["web"].get("uri", "")}
                   for ch in c.get("groundingMetadata", {}).get("groundingChunks", []) if ch.get("web")]
        d["sources_recherche"] = sources
        d["modele"] = modele
        d["recherche"] = recherche
        if not d.get("sujet", {}).get("titre"):
            raise ValueError("pas de sujet")
        (dossier / "veille.json").write_text(json.dumps(d, ensure_ascii=False, indent=1))
        print(f"Veille ({modele}, {'avec' if recherche else 'SANS'} recherche Google) : {len(d.get('tendances', []))} tendances, {len(sources)} sources ; sujet : "
              f"{d['sujet']['titre']}")
        sys.exit(0)
    except Exception as e:
        msg = e.read().decode()[:700] if hasattr(e, "read") else repr(e)[:300]
        journal.append({"modele": modele, "recherche": recherche, "erreur": msg})
        print(f"{modele} : {msg}", flush=True)
(dossier / "veille_erreurs.json").write_text(json.dumps(journal, ensure_ascii=False, indent=1))
sys.exit("Veille impossible : le script sera écrit sans elle.")
