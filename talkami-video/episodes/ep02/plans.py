"""Plan de montage de l'épisode 2 (temps de la vidéo, en secondes).

Génère src/episodes/ep02/plans.json, lu par outils/plans.py (découpe) et par
la composition Remotion (placement). Modes :
  personnage : le double dans le bureau ; `plan` (capture) ou `panneau` (dessin) sur l'écran
  proche / grand : le double recadré de plus près (sans capture visible pour « grand »)
  plein : capture en plein écran, dans la zone sûre, zoom doux
  carte : carte de fin de la série
Les cadres sont en pixels de la capture ramenée à 864 px de large.
"""
import json

SITE, BN = "site", "bn"
E = (0, 0, 864, 602)  # proportions de l'écran du décor (860 × 600)


def ecran(y, x=0, l=864):
    return [x, y, l, round(l * 600 / 860 / 2) * 2]


P = []


def plan(debut, fin, mode, **k):
    P.append({"nom": f"p{len(P) + 1:02d}", "debut": debut, "fin": fin, "mode": mode, **k})


flou_email = [[170, 960, 460, 64]]
flou_avatar_google = [[760, 90, 104, 100]]  # photo du compte Google
flou_proprietaire = [[140, 362, 250, 60]]
flou_liste = {"t_ref": 8.0, "y_ref": 925}

# ouverture : « Tape Lomé IA School sur Google. »
plan(0.00, 2.95, "personnage", source=SITE, de=284.0, a=285.5, cadre=ecran(100), flous=flou_avatar_google)
# « Tu vois ce site ? C'est moi qui l'ai créé. »
plan(2.95, 5.60, "plein", source=SITE, de=342.0, a=343.2, cadre=[0, 180, 864, 1228], zoom=[1.0, 1.06])
# « Depuis mon téléphone, sans ordinateur et sans être développeur. »
plan(5.60, 7.70, "personnage", source=SITE, de=342.5, a=342.5, cadre=ecran(250))
plan(7.70, 9.80, "proche", source=SITE, de=342.5, a=342.5, cadre=ecran(250))
# « Viens, je te fais visiter. »
plan(9.80, 11.60, "personnage", source=SITE, de=413.0, a=413.0, cadre=ecran(250))
# visite : accueil
plan(11.60, 15.00, "plein", source=SITE, de=413.0, a=414.4, cadre=[0, 180, 864, 1228], zoom=[1.0, 1.08])
plan(15.00, 18.40, "plein", source=SITE, de=416.0, a=418.5, cadre=[0, 180, 864, 1228], zoom=[1.04, 1.0])
# formations et prix
plan(18.40, 21.80, "plein", source=SITE, de=346.0, a=346.6, cadre=[0, 190, 864, 700], zoom=[1.0, 1.08])
plan(21.80, 25.60, "plein", source=SITE, de=350.0, a=356.0, cadre=[0, 250, 864, 1228], zoom=[1.0, 1.05])
# Mon espace (adresse e-mail floutée ; « Administration » hors champ)
plan(25.60, 28.40, "plein", source=SITE, de=300.0, a=300.0, cadre=[0, 740, 864, 590], flous=flou_email, zoom=[1.0, 1.08])
plan(28.40, 30.40, "personnage", source=SITE, de=300.0, a=300.0, cadre=[0, 740, 864, 602], flous=flou_email)
# consultation gratuite
plan(30.40, 33.00, "plein", source=SITE, de=230.0, a=230.0, cadre=[0, 250, 864, 1228], zoom=[1.0, 1.06])
plan(33.00, 36.20, "plein", source=SITE, de=368.0, a=370.0, cadre=[0, 300, 864, 1228], zoom=[1.04, 1.0])
# entreprises, à propos, affiliation
plan(36.20, 38.00, "plein", source=SITE, de=396.0, a=397.2, cadre=[0, 200, 864, 700], zoom=[1.0, 1.06])
plan(38.00, 39.70, "plein", source=SITE, de=382.0, a=383.0, cadre=[0, 250, 864, 760], zoom=[1.0, 1.06])
plan(39.70, 41.60, "plein", source=SITE, de=444.0, a=444.0, cadre=[0, 250, 864, 820], zoom=[1.0, 1.06])
plan(41.60, 44.30, "personnage", source=SITE, de=444.0, a=444.0, cadre=ecran(250))
plan(44.30, 46.80, "plein", source=SITE, de=444.0, a=444.0, cadre=[0, 640, 864, 600], zoom=[1.0, 1.1])
# Ama
plan(46.80, 50.00, "plein", source=SITE, de=453.0, a=458.0, cadre=[0, 250, 864, 1228], zoom=[1.0, 1.05])
plan(50.00, 52.40, "personnage", source=SITE, de=457.0, a=457.0, cadre=ecran(300))
plan(52.40, 54.60, "plein", source=SITE, de=460.8, a=462.2, cadre=[0, 300, 864, 1150], zoom=[1.0, 1.06])
# la méthode
plan(54.60, 57.00, "personnage", panneau={"titre": "Comment j'ai fait ?", "texte": "Ma méthode, étape par étape"})
plan(57.00, 59.90, "personnage", panneau={"liste": ["Le cahier des charges", "Le dépôt GitHub", "Claude Code", "Étape par étape", "La mise en ligne"]})
# étape 1 : le cahier des charges (bloc-notes, 6,0 à 9,6 s seulement)
plan(59.90, 62.40, "personnage", panneau={"etape": 1, "texte": "Le cahier des charges"})
plan(62.40, 66.40, "plein", source=BN, de=6.0, a=6.0, cadre=[0, 150, 864, 1228], zoom=[1.0, 1.15], foyer=[430, 410],
     surligne=[14, 348, 836, 124], flou_sous=flou_liste)
plan(66.40, 70.20, "personnage", source=BN, de=6.35, a=7.6, cadre=ecran(320), flou_sous=flou_liste)
plan(70.20, 74.00, "plein", source=BN, de=7.6, a=9.6, cadre=[0, 150, 864, 1228], zoom=[1.0, 1.04], flou_sous=flou_liste)
plan(74.00, 76.30, "personnage", source=BN, de=6.0, a=6.0, cadre=ecran(170), flou_sous=flou_liste)
plan(76.30, 79.00, "proche", source=BN, de=6.0, a=6.0, cadre=ecran(170), flou_sous=flou_liste)
# « il devient mon premier prompt »
plan(79.00, 83.00, "plein", source=SITE, de=117.0, a=118.0, cadre=[0, 200, 864, 1228], zoom=[1.0, 1.05])
plan(83.00, 87.00, "personnage", panneau={"titre": "L'étape la plus importante", "texte": "Celle que presque tout le monde saute"})
plan(87.00, 89.30, "proche", zoom=1.25, panneau={"titre": "L'étape la plus importante", "texte": "Celle que presque tout le monde saute"})
plan(89.30, 91.60, "proche", zoom=1.45, panneau={"titre": "L'étape la plus importante", "texte": "Celle que presque tout le monde saute"})
# étape 2 : GitHub (nom du compte flouté ; jamais la liste des dépôts)
plan(91.60, 93.60, "personnage", panneau={"etape": 2, "texte": "Créer un dépôt GitHub"})
plan(93.60, 96.60, "plein", source=SITE, de=80.0, a=85.0, cadre=[100, 170, 680, 960], flous=flou_proprietaire, zoom=[1.0, 1.05])
plan(96.60, 98.80, "plein", source=SITE, de=85.0, a=89.0, cadre=[100, 170, 680, 600], flous=flou_proprietaire, zoom=[1.05, 1.12])
plan(98.80, 101.40, "personnage", source=SITE, de=89.0, a=89.0, cadre=ecran(170, 100, 680), flous=flou_proprietaire)
# étape 3 : Claude Code et le premier prompt
plan(101.40, 104.20, "personnage", panneau={"etape": 3, "texte": "Claude Code"})
plan(104.20, 106.60, "plein", source=SITE, de=117.0, a=118.0, cadre=[0, 110, 864, 1100], zoom=[1.0, 1.05])
plan(106.60, 108.80, "personnage", source=SITE, de=118.0, a=118.0, cadre=ecran(330))
plan(108.80, 112.20, "plein", source=SITE, de=118.0, a=118.0, cadre=[0, 330, 864, 900], zoom=[1.0, 1.12], foyer=[480, 680])
plan(112.20, 115.60, "plein", source=SITE, de=118.0, a=118.0, cadre=[120, 540, 700, 300], zoom=[1.0, 1.1], foyer=[500, 680],
     surligne=[200, 594, 620, 176])
plan(115.60, 119.30, "personnage", source=SITE, de=146.0, a=148.0, cadre=ecran(300))
# étape 4 : étapes de travail et aperçus
plan(119.30, 122.30, "personnage", panneau={"etape": 4, "texte": "Avancer étape par étape"})
plan(122.30, 126.20, "plein", source=SITE, de=146.0, a=154.0, cadre=[0, 200, 864, 1228], zoom=[1.0, 1.04])
plan(126.20, 128.60, "personnage", source=SITE, de=154.0, a=162.0, cadre=ecran(300))
plan(128.60, 131.60, "plein", source=SITE, de=172.3, a=172.3, cadre=[0, 200, 864, 1228], zoom=[1.0, 1.05])
plan(131.60, 135.30, "plein", source=SITE, de=172.0, a=174.0, cadre=[0, 200, 864, 1228], zoom=[1.0, 1.06])
plan(135.30, 137.60, "plein", source=SITE, de=176.0, a=178.0, cadre=[0, 200, 864, 1228], zoom=[1.04, 1.0])
# étape 5 : la mise en ligne
plan(137.60, 140.00, "personnage", panneau={"etape": 5, "texte": "La mise en ligne"})
plan(140.00, 142.40, "plein", source=SITE, de=284.0, a=285.5, cadre=[0, 100, 864, 660], flous=flou_avatar_google, zoom=[1.0, 1.08])
plan(142.40, 144.90, "plein", source=SITE, de=342.0, a=343.2, cadre=[0, 180, 864, 1228], zoom=[1.08, 1.0])
# « Retiens bien ceci… » : le personnage en grand, sans capture
plan(144.90, 148.60, "grand", zoom=1.55)
plan(148.60, 151.80, "grand", zoom=1.9)
plan(151.80, 154.40, "grand", zoom=1.55)
# appel à l'action : carte de fin de la série
plan(154.40, 166.20, "carte")

json.dump(
    {
        "_note": "Généré par episodes/ep02/plans.py — ne pas modifier à la main.",
        "sources": {SITE: "public/episodes/ep02/site.mp4", BN: "public/episodes/ep02/blocnotes.mp4"},
        "suivi_defilement": {BN: [5.9, 9.7]},
        "plans": P,
    },
    open("src/episodes/ep02/plans.json", "w", encoding="utf-8"),
    ensure_ascii=False,
    indent=1,
)
print(len(P), "plans ;", "durée max hors carte :", max(p["fin"] - p["debut"] for p in P if p["mode"] != "carte"))
