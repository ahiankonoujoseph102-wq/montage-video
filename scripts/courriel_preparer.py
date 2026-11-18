"""Prépare script.json et plan.json d'une demande reçue par e-mail (nouvelle vidéo ou correction), avec Gemini.

Usage : GEMINI_API_KEY=… python3 scripts/courriel_preparer.py <dossier du lancement>   (lit <dossier>/demande.json)
Sorties dans <dossier> : script.json, plan.json, choix.json (voix, réponse à Joseph), gemini.json.

- Nouvelle vidéo : Gemini sépare le TEXTE À DIRE (gardé mot pour mot : c'est celui de Joseph) des CONSIGNES
  (« crée-moi la vidéo comme d'habitude », « voix de femme »…), propose titre, description, hashtags et titre
  d'accroche, puis fait le plan visuel (une scène par phrase, mêmes règles que la vidéo quotidienne).
- Correction : Gemini reçoit la vidéo précédente (texte, plan, titre…) et la demande de Joseph, et renvoie la version
  corrigée. Avec la vraie voix de Joseph, le texte dit ne change pas (sinon il ne correspondrait plus à l'audio).
- La fin fixe de la vidéo quotidienne (« Abonne-toi… Commente PROMPT… ») n'est jamais ajoutée : le texte est celui de
  Joseph. Jamais de voix clonée : sans audio, voix de synthèse Gemini (homme ou femme).
"""
import datetime
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import script_gemini as sg  # noqa: E402

sg.FIN, sg.FIN_SERIE = [], []  # aucune fin ajoutée : le texte est celui de Joseph
ROOT = sg.ROOT
dossier = Path(sys.argv[1])
d = json.loads((dossier / "demande.json").read_text())
# Les lignes qui donnent le lien de la voix off (« Ma voix off : https://drive… ») ne font pas partie du texte.
d["texte"] = "\n".join(l for l in (d.get("texte") or "").splitlines()
                        if not re.search(r"https?://(drive|docs)\.google\.com/", l)).strip()
cle = sg.os.environ.get("GEMINI_API_KEY", "").strip()
if not cle:
    sys.exit("GEMINI_API_KEY manquant ou vide (secret GitHub non transmis).")
modeles = sg.modeles_disponibles(cle)
journal = []
VOIX = {"homme": "Puck", "femme": "Kore"}


def gemini_json(demande, essais=3):
    tours = [("user", demande)]
    for _ in range(essais):
        modele, brut, duree = sg.generer(modeles, cle, tours, journal)
        if brut is None:
            sys.exit("Gemini ne répond pas (tous les modèles ont échoué).")
        try:
            r = json.loads(brut)
            journal.append({"modele": modele, "secondes": round(duree, 1)})
            sg.MEMOIRE.write_text(modele + "\n")
            return r
        except Exception as e:
            tours += [("model", brut), ("user", f"Réponse illisible ({e}). Réponds uniquement en JSON valide.")]
    sys.exit("Réponse de Gemini illisible après 3 essais.")


def phrases_de(texte):
    """Phrases du texte (mot pour mot), une partie par paragraphe ; phrases trop longues coupées aux virgules."""
    res = []
    for k, para in enumerate(p for p in re.split(r"\n\s*\n|\n(?=[A-ZÀ-Ý«\"-])", texte) if p.strip()):
        morceaux = re.split(r"(?<=[.!?…])\s+(?=[^\s])", " ".join(para.split()))
        for m in morceaux:
            m = m.strip()
            while len(m.split()) > 26 and "," in m:
                mots = m.split()
                coupe = max((i for i, w in enumerate(mots[:24]) if w.endswith(",")), default=None)
                if coupe is None or coupe < 5:
                    break
                res.append({"partie": f"p{k}", "texte": " ".join(mots[:coupe + 1])})
                m = " ".join(mots[coupe + 1:])
            if m:
                res.append({"partie": f"p{k}", "texte": m})
    return res


REGLES_VISUEL = sg.CONSIGNE[sg.CONSIGNE.index("PLAN VISUEL"):sg.CONSIGNE.index("Réponds UNIQUEMENT en JSON")].replace(
    "EMOJIS", ", ".join(sorted(sg.EMOJIS)))
STYLE = ("Montage TikTok professionnel et captivant de Lomé IA School : accroche forte dès la première seconde, une scène "
         "nouvelle à chaque phrase, des photos concrètes de la vie africaine, des démonstrations quand un outil est cité, "
         "des cartes « numero » pour les étapes, une alerte ou une question pour les moments forts ; quand Joseph donne son "
         "numéro de téléphone, une scène « carte » avec le numéro en grand (appel à l'action clair).")


def plan_visuel(phrases, consignes, precedent=None):
    numerotees = "\n".join(f"{i}. {p['texte']}" for i, p in enumerate(phrases))
    demande = (REGLES_VISUEL + "\n" + STYLE + "\n\nVoici les " + str(len(phrases)) + " phrases EXACTES de la vidéo (ne les "
               "modifie pas) :\n" + numerotees + "\n\n"
               + (f"CONSIGNES DE JOSEPH (à respecter en priorité) : {consignes}\n\n" if consignes else "")
               + (f"PLAN DE LA VERSION PRÉCÉDENTE (garde ce qui n'est pas critiqué) :\n{json.dumps(precedent, ensure_ascii=False)}\n\n" if precedent else "")
               + "Fais le plan visuel : exactement une scène et un fond par phrase, dans l'ordre. "
               "Réponds UNIQUEMENT en JSON : {\"scenes\": [...], \"fond\": [...]}")
    for essai in range(3):
        r = gemini_json(demande)
        scenes, fond = r.get("scenes", []), r.get("fond", [])
        if len(scenes) == len(phrases) and len(fond) == len(phrases):
            return scenes, fond
        demande += f"\n\nATTENTION : il faut exactement {len(phrases)} scènes et {len(phrases)} fonds (tu en as donné {len(scenes)})."
    # dernier recours : on complète avec des cartes simples
    scenes = (scenes + [{"type": "carte", "kicker": "", "texte": p["texte"].upper()[:30]} for p in phrases])[:len(phrases)]
    fond = (fond + ["bleu", "violet", "orange", "nuit", "vert", "rose"] * len(phrases))[:len(phrases)]
    return scenes, fond


avec_voix = bool(d.get("voix"))
if d["type"] == "video":
    brut = (d.get("fichiers_texte") or "").strip() + "\n\n" + (d.get("texte") or "").strip()
    r = gemini_json(f"""Joseph (Lomé IA School) a envoyé cet e-mail pour faire monter une vidéo TikTok.
{"Il a joint sa voix off : le TEXTE À DIRE est ce qu'il lit dans l'audio." if avec_voix else "Il n'a pas joint de voix off : une voix d'IA lira le TEXTE À DIRE."}
Sépare le TEXTE À DIRE (recopié mot pour mot, sans rien changer, sans le corriger ni le raccourcir) des CONSIGNES
(demandes de montage, de style, de voix, de musique ; « comme d'habitude » = style habituel). Si l'e-mail ne contient
qu'un texte, tout est TEXTE À DIRE. Propose aussi, pour la publication : un titre TikTok accrocheur (70 caractères au
plus), une description professionnelle de 2 à 4 phrases avec emojis et appel à l'action (sans hashtag), 5 à 8 hashtags,
et un titre d'accroche pour l'ouverture : 3 lignes très courtes en majuscules (1 à 3 mots) et un mot-clé d'une des lignes.
Voix souhaitée : "homme", "femme" ou null si rien n'est demandé.

E-MAIL (objet « {d.get('sujet', '')} ») :
{brut}

Réponds UNIQUEMENT en JSON : {{"texte": "...", "consignes": "... ou chaîne vide", "voix": "homme|femme|null",
"titre": "...", "description": "...", "hashtags": ["#..."], "accroche": {{"lignes": ["...", "...", "..."], "cle": "..."}}}}""")
    texte = (r.get("texte") or "").strip()
    if len(texte.split()) < 8:
        sys.exit("Je n'ai pas trouvé de texte à dire dans ton e-mail (il faut au moins une ou deux phrases).")
    consignes = (r.get("consignes") or "").strip()
    phrases = phrases_de(texte)
    meta = {k: r.get(k) for k in ("titre", "description", "hashtags", "accroche")}
    voix = r.get("voix") if r.get("voix") in VOIX else "homme"
    scenes, fond = plan_visuel(phrases, consignes)
    reponse = "Vidéo montée avec ton texte" + (" et ta voix." if avec_voix else f" et une voix d'IA ({voix}).")
    if consignes:
        reponse += f" Consignes suivies : {consignes}"
else:
    parent = ROOT / "projets" / "courriel" / d["parent"]
    ancien_script = json.loads((parent / "script.json").read_text())
    ancien_plan = json.loads((parent / "plan.json").read_text())
    ancien_choix = json.loads((parent / "choix.json").read_text()) if (parent / "choix.json").exists() else {}
    avec_voix = bool(ancien_choix.get("voix_joseph"))
    if avec_voix and not d.get("voix"):  # la voix de Joseph est relue dans l'e-mail d'origine
        d["voix_origine"] = ancien_choix.get("voix_message")
    phrases_avant = ancien_script["phrases"]
    r = gemini_json(f"""Tu es le monteur vidéo de Joseph (Lomé IA School). Il a regardé la vidéo et demande des corrections.
Applique EXACTEMENT ce qu'il demande, et garde tout le reste identique.
{"La voix off est SA voix enregistrée : tu ne peux PAS changer le texte dit (il doit correspondre à l'audio). Si il demande de changer le texte, explique-lui gentiment dans « reponse » qu'il doit renvoyer un nouvel audio." if avec_voix and not d.get('voix') else "La voix off est une voix d'IA : tu peux modifier le texte si il le demande (sinon recopie-le à l'identique)."}
Tu peux changer : les scènes (plan visuel, mêmes types et règles qu'avant), les fonds, le titre d'accroche, le titre,
la description, les hashtags, la voix ("homme" ou "femme"). Si une demande est impossible (musique précise, logo d'une
marque, vraie vidéo de lui…), dis-le dans « reponse » et propose une solution.

DEMANDE DE JOSEPH : {d.get('texte', '')}

VERSION PRÉCÉDENTE :
{json.dumps({"phrases": phrases_avant, "scenes": ancien_plan["scenes"], "fond": ancien_plan["fond"],
             "titre": ancien_script.get("titre"), "description": ancien_script.get("description"),
             "hashtags": ancien_script.get("hashtags"), "accroche": ancien_script.get("accroche"),
             "voix": ancien_choix.get("voix_ia", "homme")}, ensure_ascii=False)}

Règles des scènes :
{REGLES_VISUEL}

Réponds UNIQUEMENT en JSON : {{"phrases": [{{"partie": "...", "texte": "..."}}], "scenes": [...], "fond": [...],
"titre": "...", "description": "...", "hashtags": ["#..."], "accroche": {{"lignes": [...], "cle": "..."}},
"voix": "homme|femme", "reponse": "ce que tu as changé, en 1 à 4 phrases, en tutoyant Joseph"}}""")
    phrases = r.get("phrases") or phrases_avant
    if avec_voix and not d.get("voix"):
        phrases = phrases_avant
    scenes, fond = r.get("scenes", []), r.get("fond", [])
    if len(scenes) != len(phrases) or len(fond) != len(phrases):
        scenes, fond = plan_visuel(phrases, d.get("texte", ""), {"scenes": scenes or ancien_plan["scenes"], "fond": fond or ancien_plan["fond"]})
    meta = {k: r.get(k) or ancien_script.get(k) for k in ("titre", "description", "hashtags", "accroche")}
    if isinstance(meta["hashtags"], str):
        meta["hashtags"] = meta["hashtags"].split()
    voix = r.get("voix") if r.get("voix") in VOIX else ancien_choix.get("voix_ia", "homme")
    reponse = r.get("reponse") or "Correction appliquée."
    consignes = d.get("texte", "")

# Corrections automatiques (glossaire, prononciation, « IA » dit « i-a »), sans fin ajoutée.
x = sg.corriger({"phrases": phrases, "scenes": scenes, "fond": fond})
sg.reponses_reelles(x, modeles, cle, journal)
for s in x["scenes"]:  # emojis inconnus retirés plutôt que de faire échouer le rendu
    if s.get("emoji") and s["emoji"] not in sg.EMOJIS:
        s.pop("emoji")
    if s.get("type") not in sg.TYPES:
        s.update({"type": "carte", "kicker": s.get("kicker", ""), "texte": (s.get("texte") or "").upper()[:40]})
hashtags = " ".join(h if h.startswith("#") else "#" + h for h in (meta.get("hashtags") or []))
accroche = meta.get("accroche") or {}
if not (isinstance(accroche, dict) and len(accroche.get("lignes", [])) == 3):
    accroche = {"lignes": ["REGARDE", "CETTE", "VIDÉO"], "cle": "VIDÉO"}
script = {"accroche": accroche, "titre": meta.get("titre") or "Vidéo Lomé IA School",
          "description": meta.get("description") or "", "hashtags": hashtags, "prompt": "",
          "description_tiktok": f"{meta.get('description') or ''} {hashtags}".strip(), "rubrique": "courriel",
          "date": datetime.date.today().isoformat(), "phrases": x["phrases"]}
choix = {"voix_joseph": avec_voix, "voix_ia": voix, "voix_gemini": VOIX[voix], "reponse": reponse,
         "consignes": consignes, "type": d["type"], "version": d.get("version", 1), "origine": d.get("origine"),
         "voix_message": d.get("voix_origine") or (d["message_id"] if d.get("voix") else None)}
(dossier / "script.json").write_text(json.dumps(script, ensure_ascii=False, indent=1))
(dossier / "plan.json").write_text(json.dumps({"scenes": x["scenes"], "fond": x["fond"]}, ensure_ascii=False, indent=1))
(dossier / "choix.json").write_text(json.dumps(choix, ensure_ascii=False, indent=1))
(dossier / "gemini.json").write_text(json.dumps({"journal": journal}, ensure_ascii=False, indent=1))
print(f"{d['type']} : {len(x['phrases'])} phrases, {sum(len(p['texte'].split()) for p in x['phrases'])} mots, "
      f"voix {'de Joseph' if avec_voix else 'IA ' + voix} — {reponse[:120]}")
