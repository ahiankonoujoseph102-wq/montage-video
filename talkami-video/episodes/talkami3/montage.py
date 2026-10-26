"""Montage de la vidéo Talkami : séquence de plans calée sur les mots de la voix.

Même principe que l'épisode 2 (episodes/ep02/montage.py) : chaque « temps fort » commence
sur une suite de mots de la voix ; l'intervalle jusqu'au temps fort suivant est partagé à parts
égales entre ses visuels. Écrit :
  - src/talkami3/sequence.json : la séquence lue par Remotion ;
  - src/talkami3/plans.json : les extraits de l'enregistrement d'écran à découper (outils/plans.py).

Types : P personnage, T capture dans le téléphone animé, I illustration, CARTE carte de fin.
Coordonnées des captures : image source ramenée à 864 × 1536 (1080 × 1920 × 0,8).
Temps des captures (`de`, `a`) : secondes dans projets/talkami/ecrans.mp4 (muette).
"""
import json
import re
import unicodedata

MOTS = json.load(open("src/talkami3/mots.json", encoding="utf-8"))
FIN_VOIX = MOTS[-1]["fin"]
DUREE_CARTE = 4.0
ECRAN_TEL = (864, 1340)  # proportions de l'écran du téléphone animé (744 × 1154)
SOURCE = "ecrans"


def norme(s):
    s = unicodedata.normalize("NFD", s.lower().replace("’", "'"))
    return re.sub(r"[^\w']", "", "".join(c for c in s if not unicodedata.combining(c)))


def trouver(phrase, apres=0):
    cherche = [norme(m) for m in phrase.split() if norme(m)]
    for i in range(apres, len(MOTS) - len(cherche) + 1):
        if all(norme(MOTS[i + k]["texte"]) == m for k, m in enumerate(cherche)):
            return i
    raise ValueError(f"introuvable : {phrase}")


def t(cle):
    """Instant (s) : nombre, phrase, ou (phrase, occurrence n° k à partir de 1)."""
    if isinstance(cle, (int, float)):
        return float(cle)
    phrase, k = (cle, 1) if isinstance(cle, str) else cle
    i = -1
    for _ in range(k):
        i = trouver(phrase, i + 1)
    return max(0.0, MOTS[i]["debut"] - 0.08)


def P(cadre, geste="explique", expression="neutre", doigts=None, texte=None, nom=None):
    v = {"type": "P", "cadre": cadre, "geste": geste, "expression": expression}
    if doigts:
        v["doigts"] = doigts
    if texte:
        v["texte"] = texte
    if nom:
        v["bandeau"] = nom
    return v


def T(de, a, y0=0, zoom=(1.0, 1.1), foyer=None, surligne=None, entree="droite", icone=None, flous=(), tap=None):
    v = {"type": "T", "de": de, "a": a, "y0": y0, "zoom": list(zoom), "entree": entree, "flous": [list(f) for f in flous]}
    if foyer:
        v["foyer"] = list(foyer)
    if surligne:
        v["surligne"] = surligne
    if icone:
        v["icone"] = icone
    if tap:
        v["tap"] = tap  # instant source d'un toucher à l'écran (bruit de clic)
    return v


def I(illus, **k):
    return {"type": "I", "illus": illus, **k}


E = lambda kind, label: {"kind": kind, "label": label}

# Repères d'écran (image 864 × 1536)
CHRONO = [40, 1000, 780, 250]
NIVEAU = [40, 196, 790, 190]
PRIX = [60, 700, 620, 100]
CORRECTION = [80, 930, 700, 220]
J_AI_PAYE = [80, 510, 700, 170]
VIDEO = [40, 440, 790, 400]
PUBLIEE = [80, 650, 700, 290]

TEMPS = [
    # --- accroche : le problème en 3 coups
    (0.0, [I("accroche")]),
    ("Je n'avais pas cet argent", [I("pasArgent")]),
    ("Alors j'ai créé", [T(100.0, 102.2, 120, (1.15, 1.3), (432, 520), entree="bas")]),
    ("Avec mon téléphone", [I("telephone")]),
    ("Sans ordinateur", [I("sansOrdinateur")]),
    ("Sans savoir coder", [I("sansCode")]),
    ("Je m'appelle", [P("moyen", "explique", "sourire", nom=True)]),
    # --- l'histoire
    ("Je voulais améliorer", [P("gros", "explique", texte="MON ANGLAIS")]),
    ("Je suis allé voir", [I("carte", phase=1)]),
    ("Il m'a dit", [I("prix", phase=2)]),
    ("Je n'avais pas cette somme", [P("gros", "repos", "grimace")]),
    ("Alors je me suis posé", [P("moyen", "designe", "surpris", texte="UNE QUESTION")]),
    ("l'IA, je la maîtrise", [I("ampoule")]),
    ("Pourquoi ne pas", [P("gros", "explique", texte="POURQUOI PAS ?")]),
    ("créer moi-même", [I("construire")]),
    ("Voici le résultat", [I("revelation")]),
    ("Il s'appelle Talkami", [T(0.3, 2.4, 0, (1.0, 1.12), (432, 600), entree="bas", icone=E("ondes", "Talkami"))]),
    # --- la démo : 5 étapes
    ("Voici Teacher Joe", [T(103.0, 105.8, 60, (1.25, 1.45), (432, 560), icone=E("profil", "Teacher Joe"))]),
    ("Il te parle", [T(150.5, 152.3, 0, (1.0, 1.1), (432, 1300), entree="gauche")]),
    ("il t'écoute", [T(154.0, 155.6, 0, (1.05, 1.15), (432, 1300))]),
    ("il te corrige", [T(428.0, 429.6, 196, (1.0, 1.2), (432, 1040), surligne=CORRECTION, entree="gauche")]),
    ("Tout commence par", [I("etape", n=1, texte="L'évaluation gratuite")]),
    ("orale gratuite", [T(140.2, 147.0, 0, (1.0, 1.08), (432, 700), entree="bas", tap=146.0)]),
    ("de 5 minutes", [T(148.0, 149.0, 0, (1.0, 1.3), (430, 1120), surligne=CHRONO)]),
    ("À la fin, tu connais", [T(186.0, 187.2, 0, (1.0, 1.25), (432, 300), surligne=NIVEAU, entree="gauche", icone=E("diplome", "Ton niveau"))]),
    ("Ensuite, chaque jour", [T(292.0, 294.0, 0, (1.0, 1.1), (432, 500), entree="bas")]),
    ("La leçon au tableau", [T(297.0, 299.0, 0, (1.0, 1.15), (432, 300), icone=E("ecole", "La leçon"))]),
    ("avec une explication", [T(416.5, 418.5, 120, (1.0, 1.2), (432, 760), entree="gauche", icone=E("ondes", "En français"))]),
    ("La pratique", [T(316.0, 318.0, 0, (1.0, 1.12), (432, 300), icone=E("ondes", "La pratique"))]),
    ("tu répètes après lui", [T(326.0, 327.6, 0, (1.0, 1.15), (432, 1100), entree="gauche")]),
    ("La conversation", [T(332.0, 334.0, 0, (1.0, 1.1), (432, 300), icone=E("ondes", "La conversation"))]),
    ("sur une situation", [T(340.0, 341.5, 0, (1.0, 1.2), (432, 600), entree="gauche")]),
    ("au marché", [I("situations")]),
    ("Puis le bilan", [T(358.0, 359.0, 0, (1.0, 1.1), (432, 400), icone=E("diplome", "Le bilan"))]),
    ("Ici, les formules", [T(471.5, 473.0, 0, (1.0, 1.2), (330, 760), surligne=PRIX, icone=E("fcfa", "Prix en FCFA"))]),
    ("et le paiement par", [T(510.5, 513.0, 0, (1.0, 1.1), (432, 700), entree="gauche", icone=E("paiement", "Mobile Money"))]),
    ("avec une simple capture", [T(521.0, 522.8, 0, (1.0, 1.25), (432, 590), surligne=J_AI_PAYE, tap=522.0)]),
    # --- la preuve
    ("Et maintenant, regarde", [P("gros", "designe", "sourire", texte="REGARDE")]),
    ("D'abord, j'apprends", [I("resultat", n=1, texte="J'apprends l'anglais")]),
    ("Chaque jour, avec Teacher Joe", [T(445.0, 446.6, 0, (1.0, 1.15), (432, 600), icone=E("diplome", "Niveau validé"))]),
    ("mon niveau progresse", [I("niveaux")]),
    ("Ensuite, ce qui devait", [I("resultat", n=2, texte="Construit moi-même")]),
    (("350 000", 3), [I("prix", phase=3)]),
    ("Et enfin, le plus beau", [I("resultat", n=3, texte="Le plus beau")]),
    ("pendant que j'apprends", [I("communaute")]),
    ("Et ils paient", [I("ilsPaient")]),
    ("Regarde : voici mes", [I("paiements")]),
    ("Et pendant que je dors", [I("nuit")]),
    ("Chaque jour, l'IA crée", [T(601.5, 603.5, 0, (1.0, 1.15), (432, 640), surligne=VIDEO, icone=E("ondes", "3 vidéos par jour"))]),
    ("3 vidéos de cours", [T(612.5, 614.5, 0, (1.0, 1.12), (432, 700), entree="gauche")]),
    ("Le matin, je vérifie", [T(608.0, 610.5, 0, (1.0, 1.2), (432, 800), surligne=PUBLIEE, entree="gauche")]),
    ("Tu vois ce que", [P("gros", "designe", "surpris", texte="TU VOIS ?")]),
    # --- la leçon
    ("Au départ, j'avais", [I("troisChoses", phase=1)]),
    ("Avec l'IA, j'en ai fait", [I("troisChoses", phase=2)]),
    ("Une solution pour moi", [I("troisChoses", phase=3)]),
    ("C'est ça, le vrai", [P("gros", "explique", "sourire", texte="MAÎTRISER L'IA")]),
    (("Avec l'IA, il n'y a plus", 1), [I("barrieres")]),
    ("Un site web", [I("possibles")]),
    ("Le seul vrai malheur", [P("gros", "explique", "grimace", texte="LE SEUL VRAI MALHEUR")]),
    ("c'est de ne pas apprendre", [P("moyen", "designe")]),
    ("Et si tu sais seulement", [I("iceberg")]),
    ("tu n'as vu que le début", [P("gros", "explique", "surpris", texte="QUE LE DÉBUT")]),
    ("Toi qui as une entreprise", [P("moyen", "explique")]),
    ("une grande partie", [I("entreprise")]),
    ("Moins de temps perdu", [I("gains")]),
    ("Et toi qui doutes", [P("gros", "designe", texte="TU DOUTES ?")]),
    ("de ce que l'IA peut faire", [P("moyen", "explique", "sourire")]),
    ("va visiter Talkami", [T(0.3, 2.0, 0, (1.0, 1.1), (432, 500), entree="bas", icone=E("maison", "talkami.laravel.cloud"))]),
    ("Teste-le", [T(5.4, 6.6, 0, (1.0, 1.3), (300, 560), tap=6.0)]),
    ("de la qualité", [T(107.0, 109.0, 60, (1.2, 1.35), (432, 560), entree="gauche")]),
    # --- l'offre et la fin
    ("C'est exactement ce que", [I("ecole")]),
    ("On te forme", [I("offre")]),
    ("Réserve ta consultation", [I("consultation")]),
    ("ou écris-moi", [I("whatsapp")]),
    ("Tu veux aller", [P("gros", "designe", "sourire", texte="JUSQU'AU BOUT ?")]),
    ("Formation complète", [I("formation")]),
    ("Notre bureau est", [I("carte", phase=2)]),
    ("Maîtrisez l'IA", [P("large", "explique", "sourire")]),
    ("en opportunités", [P("gros", "explique", "sourire", texte="OPPORTUNITÉS")]),
    ("C'était Joseph", [P("gros", "explique", "sourire")]),
    (FIN_VOIX + 0.25, [{"type": "CARTE"}]),
]

sequence, clips = [], []
for k, (debut, visuels) in enumerate(TEMPS):
    a = t(debut)
    b = t(TEMPS[k + 1][0]) if k + 1 < len(TEMPS) else FIN_VOIX + DUREE_CARTE
    if b <= a:
        raise ValueError(f"ordre : {debut} ({a:.2f}) ≥ suivant ({b:.2f})")
    pas = (b - a) / len(visuels)
    for j, v in enumerate(visuels):
        p = {"debut": round(a + j * pas, 3), "fin": round(a + (j + 1) * pas, 3), **v}
        p["nom"] = f"s{len(sequence) + 1:02d}"
        sequence.append(p)
        if v["type"] == "T":
            clips.append({"nom": p["nom"], "debut": p["debut"], "fin": p["fin"], "source": SOURCE, "de": v["de"], "a": v["a"],
                          "cadre": [0, v["y0"], *ECRAN_TEL], "flous": v["flous"]})

sequence[0]["debut"] = 0.0
longs = [(p["nom"], p.get("illus", p["type"]), round(p["fin"] - p["debut"], 2)) for p in sequence if p["type"] != "CARTE" and p["fin"] - p["debut"] > 3.0]
courts = [(p["nom"], round(p["fin"] - p["debut"], 2)) for p in sequence if p["fin"] - p["debut"] < 0.6]
json.dump({"fin_voix": FIN_VOIX, "plans": sequence}, open("src/talkami3/sequence.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump({"_note": "Généré par episodes/talkami3/montage.py — ne pas modifier à la main.",
           "sources": {SOURCE: "public/talkami3/ecrans.mp4"}, "plans": clips},
          open("src/talkami3/plans.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{len(sequence)} plans, {len(clips)} extraits ; durée {sequence[-1]['fin']:.1f} s")
print("plus de 3 s :", longs)
print("moins de 0,6 s :", courts)
