"""Montage dynamique de l'épisode 2 : séquence de plans calée sur les mots.

Chaque « temps fort » commence sur un mot de la voix (indice dans
src/episodes/ep02/mots.json, voix resserrée) ou à un instant donné ; l'intervalle
jusqu'au temps fort suivant est partagé à parts égales entre ses visuels.
Le script vérifie qu'aucun plan ne dure plus de 2,5 s et écrit :
  - src/episodes/ep02/sequence.json : la séquence lue par Remotion ;
  - src/episodes/ep02/plans.json : les extraits de captures à découper
    (outils/plans.py), au format de l'écran du téléphone animé.

Types de visuels :
  P  personnage (cadre large / moyen / gros, geste, expression, écran)
  T  capture dans le téléphone animé (+ icône de fonction, personnage en médaillon)
  I  illustration animée plein écran (+ personnage en médaillon)
  CTA, CARTE  appel à l'action et carte de fin
"""
import json

MOTS = json.load(open("src/episodes/ep02/mots.json", encoding="utf-8"))
FIN_VOIX = MOTS[-1]["fin"]
DUREE_CARTE = 4.0  # carte prolongée de 4 s après la voix (musique seule)
ECRAN_TEL = (864, 1306)  # proportions de l'écran du téléphone animé (764 × 1154)

SITE, BN = "site", "bn"
flou_email = [170, 960, 460, 64]
flou_admin = [0, 1360, 864, 130]  # lien « Administration »
flou_proprietaire = [140, 362, 250, 60]
flou_avatar_google = [760, 90, 104, 100]
# « Aperçu IA » de Google (cite une autre école) : masqué, seuls la barre de
# recherche et le premier résultat « Lomé IA School » restent visibles.
masque_apercu_ia = [0, 868, 864, 1052, [34, 35, 40]]
flou_liste_bn = {"t_ref": 8.0, "y_ref": 925}


def t(i):
    return MOTS[i]["debut"] - 0.08 if isinstance(i, int) else i


def P(cadre, geste="explique", expression="neutre", ecran=None, doigts=None, texte=None):
    v = {"type": "P", "cadre": cadre, "geste": geste, "expression": expression}
    if ecran:
        v["ecran"] = ecran
    if doigts:
        v["doigts"] = doigts
    if texte:
        v["texte"] = texte
    return v


def T(src, de, a, y0, zoom=(1.0, 1.12), foyer=None, icone=None, flous=(), flou_sous=None, surligne=None, entree="droite", masques=()):
    v = {"type": "T", "src": src, "de": de, "a": a, "y0": y0, "zoom": list(zoom), "entree": entree, "flous": [list(f) for f in flous]}
    if masques:
        v["masques"] = [list(m) for m in masques]
    if foyer:
        v["foyer"] = list(foyer)
    if icone:
        v["icone"] = icone
    if flou_sous:
        v["flou_sous"] = flou_sous
    if surligne:
        v["surligne"] = surligne
    return v


def I(illus, **k):
    return {"type": "I", "illus": illus, **k}


E = lambda kind, label: {"kind": kind, "label": label}  # icône de fonction

TEMPS = [
    (0.0, [P("gros", "explique", "sourire")]),
    (1.0, [I("recherche")]),
    (6, [T(SITE, 342.0, 343.2, 180, (1.0, 1.15), (432, 500), entree="bas")]),
    (10, [P("moyen", "designe", "sourire")]),
    (15, [P("gros", "explique")]),
    (18, [I("sansOrdinateur")]),
    (21, [I("sansCode")]),
    (24, [P("large", "explique")]),
    (29, [T(SITE, 413.0, 414.4, 180, (1.0, 1.1), (432, 600), icone=E("maison", "Accueil"))]),
    (33, [T(SITE, 416.0, 418.5, 300, (1.12, 1.0), entree="gauche")]),
    (42, [P("moyen", "designe", ecran="site")]),
    (49, [T(SITE, 346.0, 346.6, 180, (1.0, 1.15), (432, 420), icone=E("diplome", "Formations"))]),
    (52, [T(SITE, 350.0, 353.0, 300, (1.05, 1.25), (300, 1150), icone=E("fcfa", "Prix en FCFA"), entree="gauche")]),
    (59, [P("moyen", "compte", doigts=1)]),
    (62, [T(SITE, 248.0, 248.0, 400, (1.0, 1.2), (432, 1100), icone=E("paiement", "Paiement"))]),
    (71, [T(SITE, 300.0, 300.0, 300, (1.0, 1.18), (432, 1140), icone=E("profil", "Mon espace"), flous=[flou_email, flou_admin])]),
    (74, [P("gros", "designe")]),
    (80, [T(SITE, 446.0, 446.0, 300, (1.0, 1.12), (432, 650), entree="gauche")]),
    (85, [T(SITE, 230.0, 230.0, 250, (1.0, 1.15), (432, 500), icone=E("calendrier", "Consultation gratuite"))]),
    (89, [T(SITE, 368.0, 370.0, 300, (1.05, 1.2), (432, 900), entree="gauche")]),
    (94, [P("gros", "explique", "sourire")]),
    (99, [T(SITE, 396.0, 397.2, 200, (1.0, 1.12), (432, 450), icone=E("immeuble", "Entreprises"))]),
    (108, [T(SITE, 382.0, 383.0, 250, (1.0, 1.12), (432, 600), icone=E("ecole", "À propos"), entree="gauche")]),
    (113, [T(SITE, 444.0, 444.0, 250, (1.0, 1.15), (432, 500), icone=E("affiliation", "Affiliation 10 %"))]),
    (117, [I("recommande"), P("moyen", "explique")]),
    (126, [I("commission")]),
    (130, [T(SITE, 453.0, 455.0, 300, (1.0, 1.1), (432, 700), icone=E("ondes", "Ama, assistante IA"))]),
    (136, [T(SITE, 455.0, 458.0, 300, (1.1, 1.2), (432, 800), entree="gauche")]),
    (142, [T(SITE, 460.8, 462.2, 300, (1.0, 1.15), (432, 700), icone=E("ondes", "Elle parle"))]),
    (150, [P("gros", "explique", "surpris")]),
    (156, [I("methode")]),
    (165, [I("etape", n=1, texte="Le cahier des charges")]),
    (171, [P("moyen", "compte", doigts=1)]),
    (178, [I("brouillon")]),
    (185, [T(BN, 6.0, 6.0, 150, (1.0, 1.2), (432, 410), surligne=[14, 348, 836, 124], flou_sous=flou_liste_bn, entree="bas")]),
    (195, [I("checklist")]),
    (203, [T(BN, 6.35, 7.6, 150, (1.0, 1.06), flou_sous=flou_liste_bn, entree="gauche")]),
    (210, [P("gros", "compte", doigts=4)]),
    (213, [I("desordre")]),
    (218, [I("organise")]),
    (225, [I("bullePrompt")]),
    (231, [P("moyen", "designe", texte="Presque tout le monde la saute")]),
    (239, [P("gros", "explique", texte="LA PLUS IMPORTANTE")]),
    (245, [I("robot")]),
    (252, [P("gros", "designe")]),
    (259, [I("etape", n=2, texte="Le dépôt GitHub"), T(SITE, 80.0, 84.0, 100, (1.25, 1.45), (430, 420), flous=[flou_proprietaire])]),
    (267, [I("dossier"), T(SITE, 84.0, 89.0, 100, (1.4, 1.6), (430, 700), flous=[flou_proprietaire], entree="gauche")]),
    (280, [I("chrono")]),
    (287, [I("etape", n=3, texte="Claude Code")]),
    (292, [T(SITE, 160.0, 163.0, 250, (1.0, 1.12), (432, 700))]),
    (299, [I("envoi")]),
    (307, [P("moyen", "explique"), T(SITE, 117.0, 118.0, 200, (1.0, 1.1), (432, 500), entree="gauche")]),
    (319, [T(SITE, 118.0, 118.0, 200, (1.0, 1.7), (510, 690), surligne=[200, 594, 620, 176]), P("gros", "designe")]),
    (335, [P("gros", "explique", "sourire"), T(SITE, 144.0, 147.0, 250, (1.0, 1.1), (432, 700))]),
    (341, [I("etape", n=4, texte="Étape par étape"), P("moyen", "compte", doigts=4)]),
    (348, [I("chemin", partie=1)]),
    (355, [I("chemin", partie=2)]),
    (360, [I("chemin", partie=3)]),
    (363, [P("moyen", "designe"), I("oeil")]),
    (371, [T(SITE, 172.3, 172.3, 200, (1.0, 1.15), (432, 600))]),
    (376, [P("gros", "explique", "grimace"), I("correction")]),
    (387, [I("suivante")]),
    (393, [I("fusee")]),
    (399, [I("enLigne")]),
    (405, [T(SITE, 284.0, 285.5, 180, (1.0, 1.12), (432, 520), flous=[flou_avatar_google], masques=[masque_apercu_ia]), T(SITE, 342.0, 343.2, 180, (1.1, 1.0), entree="gauche")]),
    (413, [P("gros", "designe", texte="RETIENS BIEN CECI")]),
    (416, [I("vision", phase=1)]),
    (422, [I("vision", phase=2)]),
    (426, [P("moyen", "compte", doigts=1)]),
    (433, [P("gros", "compte", "sourire", doigts=2)]),
    (438, [P("gros", "explique")]),
    (447, [I("telephone")]),
    (451, [I("cta", phase=1), I("cta", phase=2)]),
    (459, [{"type": "CARTE"}]),
]

sequence, clips = [], []
for k, (debut, visuels) in enumerate(TEMPS):
    a = t(debut)
    b = t(TEMPS[k + 1][0]) if k + 1 < len(TEMPS) else FIN_VOIX + DUREE_CARTE
    pas = (b - a) / len(visuels)
    for j, v in enumerate(visuels):
        p = {"debut": round(a + j * pas, 3), "fin": round(a + (j + 1) * pas, 3), **v}
        p["nom"] = f"s{len(sequence) + 1:02d}"
        sequence.append(p)
        if v["type"] == "T":
            clip = {"nom": p["nom"], "debut": p["debut"], "fin": p["fin"], "mode": "tel", "source": v["src"], "de": v["de"], "a": v["a"],
                    "cadre": [0, v["y0"], *ECRAN_TEL], "flous": v["flous"]}
            if "flou_sous" in v:
                clip["flou_sous"] = v["flou_sous"]
            if "masques" in v:
                clip["masques"] = v["masques"]
            clips.append(clip)

sequence[0]["debut"] = 0.0
trop_longs = [(p["nom"], round(p["fin"] - p["debut"], 2)) for p in sequence if p["type"] != "CARTE" and p["fin"] - p["debut"] > 2.5]
courts = [(p["nom"], round(p["fin"] - p["debut"], 2)) for p in sequence if p["fin"] - p["debut"] < 0.9]
json.dump({"fin_voix": FIN_VOIX, "plans": sequence}, open("src/episodes/ep02/sequence.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(
    {
        "_note": "Généré par episodes/ep02/montage.py — ne pas modifier à la main.",
        "sources": {SITE: "public/episodes/ep02/site.mp4", BN: "public/episodes/ep02/blocnotes.mp4"},
        "suivi_defilement": {BN: [5.9, 9.7]},
        "plans": clips,
    },
    open("src/episodes/ep02/plans.json", "w", encoding="utf-8"),
    ensure_ascii=False,
    indent=1,
)
print(f"{len(sequence)} plans, {len(clips)} extraits ; durée {sequence[-1]['fin']:.1f} s")
print("plus de 2,5 s :", trop_longs)
print("moins de 0,9 s :", courts)
