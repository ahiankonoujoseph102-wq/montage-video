"""Plan de montage de la pub Zéro Perte, écrit à la main (même moteur que « Diplôme Togo » : src/auto/VideoAuto.tsx).

Usage : python3 projets/zero-perte/construire_plan.py
Écrit projets/zero-perte/run/script.json (phrases de la voix off, dans l'ordre) et run/plan.json (une scène par phrase).
Médias : images IA et vidéos Pixabay dans public/test-auto/zp/, enregistrements de l'appli dans public/test-auto/app/.
Coordonnées des repères et cadres : pixels de l'enregistrement du téléphone (824 × 1830).
"""
import json
from pathlib import Path

P = Path(__file__).resolve().parent
IM = lambda n: f"test-auto/zp/images/{n}.jpg"
VI = lambda n: f"test-auto/zp/videos/{n}.mp4"
AP = lambda n: f"test-auto/app/{n}.mp4"
VERT, ROUGE, WA, OR = "#22C55E", "#EF4444", "#25D366", "#FFC83D"
PH = []  # (partie, texte, fond, scène)


def ph(partie, dit, fond="nuit", **scene):
    PH.append((partie, dit, fond, scene))


# --- Accroche
ph("p0", "Commerçants ! Savez-vous vraiment combien vous gagnez chaque jour ?",
   type="photo", fichier=IM("accroche"), mise="partage", expression="surpris", geste="explique")
# --- Le problème
ph("p1", "Vous vendez toute la journée… mais le soir, la caisse ne tombe pas juste.",
   type="photo", fichier=IM("journee"), fichier2=IM("caisse_soir"), mise="plein")
ph("p1", "Il manque 1 000 francs. Et personne ne sait pourquoi.", "orange",
   type="chiffre", kicker="LE SOIR", texte="– 1 000 F", sous="Pourquoi ?", emoji="1f631",
   mise="double", expression="grimace", geste="explique")
ph("p1", "Un client a pris à crédit… et plus personne ne se souvient du montant.",
   type="photo", fichier=IM("credit_client"), texte="CRÉDIT OUBLIÉ", mise="plein")
ph("p1", "Un carton disparaît du magasin.",
   type="photo", fichier=IM("carton"), texte="CARTON DISPARU", mise="plein")
ph("p1", "Au total, une boutique ordinaire peut perdre 61 000 francs en un seul mois. Sans même le savoir !", "orange",
   type="chiffre", kicker="EN UN SEUL MOIS", texte="61 000 F", sous="PERDUS !", emoji="1f4b8",
   fondVideo=VI("billets"), mise="partage", expression="surpris", geste="explique")
# --- La solution
ph("p2", "Stop ! Voici Zéro Perte.", type="logo", mise="plein")
ph("p2", "L'application qui met votre boutique sous contrôle, même quand vous n'êtes pas là.", "vert",
   type="app", clips=[{"fichier": AP("06_benefice"), "de": 0, "vitesse": 0.4}],
   cadres=[{"y": 915, "e": 0.62}, {"a": "contrôle,", "y": 330, "e": 1.05}],
   reperes=[{"a": "contrôle,", "x": 29, "y": 150, "l": 757, "h": 230}],
   badges=[{"a": "contrôle,", "texte": "SOUS CONTRÔLE"}], mise="partage", geste="designe", expression="sourire")
ph("p3", "Espèces, Flooz, Mixx ou crédit : chaque vente s'enregistre en quelques secondes.",
   type="app", clips=[{"fichier": AP("02_vendre"), "de": 30.5}, {"a": "chaque", "fichier": AP("02_vendre"), "de": 38.6, "vitesse": 2.2}],
   cadres=[{"y": 330, "e": 1.15}, {"a": "chaque", "y": 620, "e": 0.75}, {"a": "quelques", "y": 420, "e": 0.95}],
   reperes=[{"a": "Espèces,", "x": 32, "y": 311, "l": 757, "h": 127, "jusqua": "chaque"}],
   badges=[{"a": "secondes.", "texte": "VENTE ENREGISTRÉE"}], emoji="2705", a="secondes.", mise="plein")
ph("p3", "Et depuis votre téléphone, au marché, au port ou au village, vous suivez vos ventes en temps réel.",
   type="photo", fichier=IM("marche"), fichier2=IM("port"), texte="EN TEMPS RÉEL", mise="plein")
ph("p3", "Vous connaissez enfin votre vrai bénéfice.", "vert",
   type="app", clips=[{"fichier": AP("06_benefice"), "de": 2.6}],
   cadres=[{"y": 620, "e": 0.75}, {"a": "vrai", "y": 860, "e": 1.1}],
   reperes=[{"a": "vrai", "x": 29, "y": 763, "l": 757, "h": 245}],
   badges=[{"a": "bénéfice.", "texte": "BÉNÉFICE : 3 580 F", "couleur": OR}], mise="partage", geste="pouce",
   expression="sourire")
ph("p4", "Le soir, votre vendeur compte la caisse sans connaître le montant attendu.",
   type="photo", fichier=IM("vendeur_soir"), texte="IL COMPTE\nÀ L'AVEUGLE", mise="plein")
ph("p4", "S'il manque de l'argent, Zéro Perte vous le signale immédiatement.",
   type="app", clips=[{"fichier": AP("04_caisse"), "de": 57.8}, {"a": "immédiatement.", "fichier": AP("04_caisse"), "de": 68.6}],
   cadres=[{"y": 420, "e": 1.1}, {"a": "immédiatement.", "x": 560, "y": 300, "e": 1.25}],
   reperes=[{"a": "manque", "x": 29, "y": 225, "l": 754, "h": 337, "couleur": ROUGE, "jusqua": "immédiatement."},
            {"a": "immédiatement.", "x": 541, "y": 164, "l": 245, "h": 210, "couleur": ROUGE}],
   badges=[{"a": "signale", "texte": "IL MANQUE 1 100 F", "couleur": ROUGE}], emoji="1f6a8", a="signale", mise="plein")
ph("p4", "Les crédits ne s'oublient plus : chaque client a sa fiche, et un rappel part sur WhatsApp en un clic.", "bleu",
   type="app", clips=[{"fichier": AP("03_credit"), "de": 30.6}, {"a": "rappel", "fichier": AP("03_credit"), "de": 51.0}],
   cadres=[{"y": 470, "e": 1.0}, {"a": "rappel", "y": 330, "e": 1.1}],
   reperes=[{"a": "fiche,", "x": 29, "y": 446, "l": 757, "h": 309, "jusqua": "rappel"},
            {"a": "WhatsApp", "x": 29, "y": 340, "l": 510, "h": 98, "couleur": WA}],
   badges=[{"a": "clic.", "texte": "RAPPEL EN 1 CLIC", "couleur": WA}], mise="partage", geste="designe")
ph("p5", "Votre stock se calcule tout seul, au détail comme en gros : boîte, carton ou casier.", "violet",
   type="app", clips=[{"fichier": AP("05_gestion"), "de": 13, "vitesse": 1.2}, {"a": "boîte,", "fichier": AP("05_gestion"), "de": 33}],
   cadres=[{"y": 380, "e": 1.1}, {"a": "boîte,", "y": 560, "e": 0.9}],
   reperes=[{"a": "détail", "x": 32, "y": 397, "l": 544, "h": 87, "jusqua": "boîte,"},
            {"a": "boîte,", "x": 29, "y": 541, "l": 757, "h": 150}],
   badges=[{"a": "casier.", "texte": "STOCK CALCULÉ"}], emoji="1f4e6", a="stock", mise="plein")
ph("p5", "Chaque vendeur a son propre code : vous savez qui a vendu quoi.", "bleu",
   type="app", clips=[{"fichier": AP("07_ajouter_vendeur"), "de": 8.5}, {"a": "code", "fichier": AP("08_vendeur"), "de": 6.5}],
   cadres=[{"y": 560, "e": 0.75}, {"a": "code", "y": 700, "e": 0.95}],
   reperes=[{"a": "savez", "x": 40, "y": 576, "l": 735, "h": 351}],
   badges=[{"a": "quoi.", "texte": "CHAQUE VENTE À SON NOM"}], mise="partage", geste="explique")
ph("p5", "Vous vendez même sans Internet, sur Android, tablette et ordinateur.", "nuit",
   type="appareils", a=["sans", "vendez", "Android,", "tablette"], mise="plein")
ph("p6", "Et vous payez une seule fois. Aucun abonnement !", "vert",
   type="carte", kicker="UN SEUL PAIEMENT", texte="PAYEZ\n1 SEULE FOIS", sous="Aucun abonnement", emoji="1f389",
   fondVideo=VI("pieces"), mise="double", geste="pouce", expression="sourire")
ph("p6", "Une seule erreur de caisse, un seul crédit oublié… et c'est votre argent qui s'envole.",
   type="photo", fichier=IM("argent_perdu"), fichier2=VI("billets"), texte="", mise="plein")
# --- Appel à l'action
ph("p7", "Contactez Joseph dès maintenant sur WhatsApp, au 72 24 02 31.", "vert",
   type="contact", numeros=["72 24 02 31", "79 16 23 90"], a="au", mise="plein")
ph("p7", "Installation et prise en main en seulement 10 minutes !", "bleu",
   type="app", clips=[{"fichier": AP("01_installation"), "de": 0, "vitesse": 7}],
   cadres=[{"y": 915, "e": 0.62}],
   badges=[{"a": "minutes", "texte": "PRÊT EN 10 MINUTES", "couleur": OR}], emoji="1f680", a="minutes", mise="partage",
   geste="pouce", expression="sourire")
ph("p7", "Zéro Perte : votre boutique sous contrôle, même quand vous n'êtes pas là.",
   type="photo", fichier=IM("commercante_fin"), texte="SOUS CONTRÔLE", mise="plein")

script = {"titre": "Zéro Perte", "accroche": {"lignes": ["COMBIEN", "VOUS GAGNEZ", "VRAIMENT ?"], "cle": "GAGNEZ"},
          "phrases": [{"partie": p, "texte": t} for p, t, _, _ in PH]}
plan = {"scenes": [s for *_, s in PH], "fond": [f for _, _, f, _ in PH]}
(P / "run").mkdir(exist_ok=True)
(P / "run" / "script.json").write_text(json.dumps(script, ensure_ascii=False, indent=1))
(P / "run" / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=1))
print(len(PH), "phrases")
