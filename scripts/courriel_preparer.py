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
        for attente in (60, 120, 240):  # serveurs de Google saturés (503) : on patiente avant d'abandonner
            if brut is not None:
                break
            print(f"Gemini saturé : nouvel essai dans {attente} s", flush=True)
            sg.time.sleep(attente)
            modele, brut, duree = sg.generer(modeles, cle, tours, journal)
        if brut is None:
            sys.exit("Gemini ne répond pas (tous les modèles ont échoué, même après 7 minutes d'attente).")
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
STYLE = ("Montage TikTok professionnel, très mouvementé et captivant de Lomé IA School : accroche forte dès la première "
         "seconde, une scène nouvelle à chaque phrase, des photos concrètes de la vie africaine, des démonstrations quand un "
         "outil est cité, des cartes « numero » pour les étapes, une alerte ou une question pour les moments forts ; quand "
         "Joseph donne son numéro de téléphone, une scène « carte » avec le numéro en grand (appel à l'action clair).")
# Règles permanentes, tirées des remarques de Joseph sur la première vidéo par e-mail (18/11/2026) : elles valent pour
# TOUTES les vidéos, sans qu'il ait à les redemander.
QUALITE = """RÈGLES DE QUALITÉ (obligatoires, toutes les vidéos) :
1. Orthographe parfaite dans chaque texte affiché (« APPELEZ », accents, pluriels) ; relis chaque mot.
2. Aucun texte coupé ni trop long : 3 lignes au plus, 20 caractères au plus par ligne dans carte, alerte, numero,
   question ; un prompt ou une réponse d'IA complets (jamais une phrase qui s'arrête au milieu).
3. Une liste annoncée avec un nombre (« 5 business », « 3 étapes ») montre exactement ce nombre d'éléments, tous
   justes, dans l'ordre où Joseph les dit (5 éléments au plus).
4. Chaque outil ou marque cité dans la phrase (ex. « Claude Code et Codex ») apparaît tous dans la scène (dans
   « outil », un « deux » ou le texte d'une carte).
5. Une photo ou vidéo seulement si elle montre EXACTEMENT ce que dit la phrase (recherche précise en anglais) ; sinon
   une animation (demo, reponseIA, carte, numero, deux, liste…). Jamais d'image sans rapport.
6. Jamais deux scènes de suite avec le même texte ou la même idée : change d'image à chaque idée.
7. Une scène différente et adaptée jusqu'à la DERNIÈRE phrase ; la fin reprend la signature de Joseph et le numéro.
8. Emojis aux moments qui s'y prêtent, et de temps en temps une petite touche d'humour (expression « surpris » ou
   « grimace », emoji drôle), sans jamais être ridicule.
9. Mise en page variée (clé "mise") : "plein" (l'illustration ou la photo occupe tout l'écran), "double" (le double
   animé de Joseph en grand, l'idée en vignette inclinée au-dessus), "partage" (illustration en haut, double en bas).
   Jamais plus de 2 fois de suite la même mise ; le double en grand au moins toutes les 20 secondes ; les photos en
   "plein" ; les démonstrations en "plein" ou "partage".
10. Pédagogie (demande de Joseph) : chaque idée est EXPLIQUÉE, pas seulement illustrée — un exemple concret et
   montré (demo, reponseIA, prompt, deux : avant / après, liste d'étapes), dans l'ordre où il l'explique ; ton doux et
   clair ; faire sentir l'importance et l'urgence d'apprendre (alerte ou question aux moments forts), sans peur ni
   fausse promesse. Le spectateur doit COMPRENDRE à quoi ça sert et comment on fait.
11. En cas de doute sur une photo, choisis une animation explicative : une illustration juste vaut mieux qu'une photo
   approximative."""
MISES = {"plein", "double", "partage"}
OUTILS_NOMS = ["Claude Code", "Codex", "ChatGPT", "Claude", "Gemini", "Perplexity", "Canva", "CapCut", "Midjourney",
               "WhatsApp", "Copilot", "Cursor", "Lovable", "Suno", "Kling", "Veo", "Sora", "n8n", "Make", "Zapier"]


def textes_visibles(sc):
    """Tous les textes affichés d'une scène, mis bout à bout (pour les vérifications)."""
    morceaux = [sc.get(k) or "" for k in ("texte", "kicker", "sous", "titre", "prompt", "reponse", "outil")]
    morceaux += [it.get("texte", "") for it in sc.get("items") or []]
    morceaux += [(sc.get(k) or {}).get("texte", "") for k in ("gauche", "droite") if isinstance(sc.get(k), dict)]
    morceaux += [o.get("nom", "") + " " + o.get("id", "") for o in sc.get("outils") or [] if isinstance(o, dict)]
    return " ".join(m for m in morceaux if isinstance(m, str))


def verifier_plan(phrases, scenes):
    """Défauts constatés automatiquement : {indice: [problèmes]} (vide si tout est bon)."""
    pb = {}
    ajoute = lambda i, m: pb.setdefault(i, []).append(m)
    norm = lambda t: re.sub(r"\W", "", (t or "").lower())
    for i, (p, sc) in enumerate(zip(phrases, scenes)):
        t = sc.get("type")
        if t in ("carte", "alerte", "numero", "question"):
            lignes = (sc.get("texte") or "").split("\n")
            if len(lignes) > 3 or any(len(l) > 22 for l in lignes):
                ajoute(i, "texte trop long (3 lignes de 20 caractères au plus)")
        if t == "liste":
            items = sc.get("items") or []
            n = re.search(r"\b(\d+)\b", sc.get("titre") or "")
            if n and int(n.group(1)) != len(items):
                ajoute(i, f"la liste annonce {n.group(1)} éléments mais en montre {len(items)}")
            if len(items) > 5:
                ajoute(i, "5 éléments au plus dans une liste")
        mots = {norm(m) for m in p["texte"].split()}
        for k in [it.get("a") for it in sc.get("items") or []] + list(sc.get("a") or []):
            if k and norm(k) not in mots:
                ajoute(i, f"le mot d'ancrage « {k} » n'est pas dans la phrase")
        vis = textes_visibles(sc).lower()
        cites = [o for o in OUTILS_NOMS if re.search(r"\b" + re.escape(o.lower()) + r"\b", p["texte"].lower())]
        cites = [o for o in cites if not any(o != x and o in x for x in cites)]  # « Claude » dans « Claude Code »
        manquants = [o for o in cites if o.lower() not in vis and o.lower().replace(" ", "") not in vis.replace(" ", "")]
        if len(cites) >= 2 and manquants:
            ajoute(i, f"outils cités absents de la scène : {', '.join(manquants)}")
        if re.search(r"\d\d[ .]?\d\d[ .]?\d\d[ .]?\d\d", p["texte"]) and not re.search(r"\d\d \d\d \d\d \d\d", textes_visibles(sc)):
            ajoute(i, "la phrase donne le numéro : il doit être affiché en grand (72 24 02 31 / 79 16 23 90)")
        if i and norm(textes_visibles(sc)) and norm(textes_visibles(sc)) == norm(textes_visibles(scenes[i - 1])):
            ajoute(i, "même scène que la précédente : change d'image")
        if sc.get("mise") and sc["mise"] not in MISES:
            ajoute(i, "mise inconnue (plein, double ou partage)")
    for i in range(2, len(scenes)):
        if scenes[i].get("mise") and scenes[i].get("mise") == scenes[i - 1].get("mise") == scenes[i - 2].get("mise"):
            ajoute(i, "3 fois de suite la même mise : varie (plein, double, partage)")
    return pb


def reparer(phrases, scenes, fond, consignes=""):
    """Relecture par Gemini : orthographe de tous les textes, puis correction des défauts constatés (2 tours au plus)."""
    for tour in range(3):
        pb = verifier_plan(phrases, scenes)
        if tour and not pb:
            break
        liste = "\n".join(f"- scène {i} : {'; '.join(m)}" for i, m in sorted(pb.items())) or "- aucun défaut automatique"
        r = gemini_json(QUALITE + "\n\n" + REGLES_VISUEL + f"""

Tu es le relecteur final du montage. Phrases (texte dit, à ne pas changer) et scènes actuelles :
{json.dumps([{"i": i, "phrase": p["texte"], "scene": sc} for i, (p, sc) in enumerate(zip(phrases, scenes))], ensure_ascii=False)}
{f"CONSIGNES DE JOSEPH : {consignes}" if consignes else ""}
Défauts constatés automatiquement :
{liste}
Corrige ces défauts{" et TOUTE faute d'orthographe dans les textes affichés" if tour == 0 else ""}, en respectant les
règles de qualité. Renvoie seulement les scènes modifiées.
Réponds UNIQUEMENT en JSON : {{"scenes": [{{"i": 0, "scene": {{...}}}}]}}""")
        for m in r.get("scenes") or []:
            if isinstance(m, dict) and isinstance(m.get("i"), int) and 0 <= m["i"] < len(scenes) and isinstance(m.get("scene"), dict) and m["scene"].get("type"):
                scenes[m["i"]] = m["scene"]
    restants = verifier_plan(phrases, scenes)
    for i, pbs in restants.items():  # dernier filet, sans Gemini : le défaut est corrigé directement
        texte = phrases[i]["texte"]
        if any("mise" in x for x in pbs):
            scenes[i].pop("mise", None)
        if any("numéro" in x for x in pbs):
            nums = re.findall(r"(?:\d\d[ .]?){3}\d\d", texte)
            scenes[i] = {"type": "carte", "kicker": "APPELEZ-NOUS", "mise": scenes[i].get("mise", "plein"),
                         "texte": "\n".join(" ".join(re.findall(r"\d\d", n)) for n in nums[:2]), "emoji": "1f449"}
        elif any("outils cités" in x for x in pbs):
            cites = [o for o in OUTILS_NOMS if re.search(r"\b" + re.escape(o.lower()) + r"\b", texte.lower())]
            cites = [o for o in cites if not any(o != x and o in x for x in cites)]
            scenes[i] = {"type": "carte", "kicker": "OUTILS", "texte": "\n".join(c.upper() for c in cites[:3]),
                         "emoji": "1f680", "mise": scenes[i].get("mise", "plein")}
        elif any("texte trop long" in x for x in pbs):
            scenes[i]["texte"] = "\n".join((scenes[i].get("texte") or "").split("\n")[:3])
    journal.append({"verification": {str(i): m for i, m in verifier_plan(phrases, scenes).items()}})
    return scenes, fond


def plan_visuel(phrases, consignes, precedent=None):
    """Plan visuel par paquets de 10 phrases (Gemini oublie des scènes au-delà de ~40) : toujours une scène par phrase."""
    scenes, fond = [], []
    PAQUET = 10
    for d0 in range(0, len(phrases), PAQUET):
        paquet = phrases[d0:d0 + PAQUET]
        numerotees = "\n".join(f"{d0 + i}. {p['texte']}" for i, p in enumerate(paquet))
        contexte = "\n".join(f"{i}. {p['texte']}" for i, p in enumerate(phrases))
        demande = (REGLES_VISUEL + "\n" + STYLE + "\n\n" + QUALITE + "\n\nTEXTE COMPLET DE LA VIDÉO (pour le contexte) :\n"
                   + contexte + "\n\n"
                   + (f"SCÈNES DÉJÀ FAITES (ne les répète pas, continue la variété) :\n{json.dumps(scenes[-6:], ensure_ascii=False)}\n\n" if scenes else "")
                   + (f"CONSIGNES DE JOSEPH (à respecter en priorité) : {consignes}\n\n" if consignes else "")
                   + (f"PLAN DE LA VERSION PRÉCÉDENTE pour ces phrases (garde ce qui n'est pas critiqué) :\n"
                      f"{json.dumps(precedent['scenes'][d0:d0 + PAQUET], ensure_ascii=False)}\n\n" if precedent else "")
                   + f"Fais le plan visuel de ces {len(paquet)} phrases EXACTES (phrases {d0} à {d0 + len(paquet) - 1}) :\n"
                   + numerotees + f"\n\nExactement {len(paquet)} scènes et {len(paquet)} fonds, dans l'ordre. "
                   "Réponds UNIQUEMENT en JSON : {\"scenes\": [...], \"fond\": [...]}")
        sc, fo = [], []
        for essai in range(3):
            r = gemini_json(demande)
            sc, fo = r.get("scenes", []), r.get("fond", [])
            if len(sc) == len(paquet):
                break
            demande += f"\n\nATTENTION : il faut exactement {len(paquet)} scènes (tu en as donné {len(sc)})."
        sc = [x for x in sc if isinstance(x, dict) and x.get("type")][:len(paquet)]
        while len(sc) < len(paquet):  # dernier recours : une carte tirée de la phrase elle-même (jamais d'une autre)
            p = paquet[len(sc)]["texte"]
            mots = [w for w in re.findall(r"[\wÀ-ÿ'’-]+", p.upper()) if len(w) > 3][:4]
            sc.append({"type": "carte", "kicker": "LOMÉ IA SCHOOL", "texte": "\n".join([" ".join(mots[:2]), " ".join(mots[2:4])]).strip()})
        scenes += sc
        fond += (fo + ["bleu", "violet", "orange", "nuit", "vert", "rose"])[:len(paquet)]
    return reparer(phrases, scenes, fond, consignes)


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

{QUALITE}

Réponds UNIQUEMENT en JSON : {{"phrases": [{{"partie": "...", "texte": "..."}}], "scenes": [...], "fond": [...],
"titre": "...", "description": "...", "hashtags": ["#..."], "accroche": {{"lignes": [...], "cle": "..."}},
"voix": "homme|femme", "reponse": "ce que tu as changé, en 1 à 4 phrases, en tutoyant Joseph"}}""")
    phrases = r.get("phrases") or phrases_avant
    if avec_voix and not d.get("voix"):
        phrases = phrases_avant
    scenes, fond = r.get("scenes", []), r.get("fond", [])
    if len(scenes) != len(phrases) or len(fond) != len(phrases):
        scenes, fond = plan_visuel(phrases, d.get("texte", ""), {"scenes": scenes or ancien_plan["scenes"], "fond": fond or ancien_plan["fond"]})
    else:
        scenes, fond = reparer(phrases, scenes, fond, d.get("texte", ""))
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
