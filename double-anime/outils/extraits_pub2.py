"""Extraits de la publicité « Créer et monter des vidéos avec l'IA » (pub2).

Usage : python outils/extraits_pub2.py dossier_sources dossier_sortie [nom…]

dossier_sources contient :
  v01.mp4 … v10.mp4   vidéos IA de Joseph et de ses clients (copies WhatsApp)
  pexels/<id>.mp4     clips Pexels (crédits : episodes/pub2/CREDITS.md)
  tiktok.mp4          enregistrement d'écran TikTok (1080 × 2400)

Chaque extrait est recadré, flouté si besoin, ramené à 30 i/s, sans son.
- Vidéos IA (360 × 640 à 478 × 850) : jamais étirées en plein écran, sorties
  en 720 × 1280 pour les cadres de téléphone ; les textes incrustés (titres,
  numéros des clients) sont coupés par le recadrage, les enseignes floutées.
- Pexels : plein écran 1080 × 1920, recadrage vertical.
- TikTok : 720 × 1600 pour le cadre de téléphone ; barre d'état (heure,
  compteur d'enregistrement) recouverte de blanc ; noms de comptes, photos de
  profil et biographies floutés. Les nombres de vues et d'abonnés restent nets.
"""
import os
import subprocess
import sys

src, sortie = sys.argv[1], sys.argv[2]
choix = set(sys.argv[3:])
os.makedirs(sortie, exist_ok=True)

TEL = (720, 1280)
PLEIN = (1080, 1920)
TIKTOK = (720, 1600)

# nom : (fichier, début, durée, recadrage (x, y, l, h) dans la source ou None, sortie, vitesse,
#        zones floues [(x0, y0, x1, y1)] et zones blanches, en pixels de la source)
E = {}


def ajoute(nom, fichier, debut, duree, crop, taille, vitesse=1.0, flous=(), blancs=()):
    E[nom] = (fichier, debut, duree, crop, taille, vitesse, list(flous), list(blancs))


# ---------------------------------------------------------------- vidéos IA de Joseph
# v04 : Joseph en concert (476 × 846) ; v02 : avatar en studio, « coach joseph » incrusté en haut (coupé)
ajoute("j-concert", "v04.mp4", 13.6, 1.6, None, TEL)
ajoute("j-studio", "v02.mp4", 0.3, 1.6, (16, 58, 327, 582), TEL)
ajoute("j-foule", "v04.mp4", 63.6, 1.6, None, TEL)
ajoute("j-scene", "v04.mp4", 49.0, 1.6, None, TEL)
# ---------------------------------------------------------------- autres plans IA
# v05 (360 × 640) : « PARTIE 1 » incrusté vers y 125–160 : bande floutée
ajoute("ia-diplome", "v05.mp4", 20.4, 1.4, None, TEL, 1.0, [(0, 112, 360, 170)])
ajoute("ia-parents", "v05.mp4", 42.6, 1.4, None, TEL, 1.0, [(0, 112, 360, 170)])
ajoute("ia-bureau", "v05.mp4", 56.4, 1.4, None, TEL, 1.0, [(0, 112, 360, 170)])
ajoute("ia-marchande", "v05.mp4", 2.0, 1.6, None, TEL, 1.0, [(0, 112, 360, 170)])
# v06 : livreur à moto (logo du blouson trop petit pour se lire)
# blouson : nom de la société de livraison du client flouté
ajoute("ia-moto", "v06.mp4", 27.2, 1.0, None, TEL, 1.0, [(215, 740, 410, 870), (560, 770, 720, 910), (230, 0, 420, 110)])  # + logo du casque
ajoute("ia-livreur", "v06.mp4", 40.5, 1.6, None, TEL)
ajoute("ia-portefeuille", "v06.mp4", 32.0, 1.4, None, TEL)
# v08 : vieil homme, gros plan (aucun texte)
ajoute("ia-vieux", "v08.mp4", 6.0, 1.4, None, TEL)
ajoute("ia-rue", "v08.mp4", 2.4, 1.4, None, TEL)
# v10 (360 × 640) : publicité de sac pour une boutique ; numéro du client incrusté en haut (coupé)
ajoute("pub-sac", "v10.mp4", 8.3, 2.4, (24, 85, 312, 555), TEL)
ajoute("pub-sac-cliente", "v10.mp4", 12.2, 2.0, (24, 85, 312, 555), TEL)
ajoute("pub-sac-produit", "v10.mp4", 34.5, 2.0, (24, 85, 312, 555), TEL, 1.0, [(98, 436, 190, 494)])  # marque du sac floutée

# v01 (360 × 640) : publicité de compléments réalisée pour un client (accord de Joseph), montrée
# brièvement : passage sans sous-titre incrusté (aucune promesse de santé), broderie « Docteur … »
# du blouson floutée
ajoute("pub-complements", "v01.mp4", 10.45, 1.15, None, TEL, 1.0, [(206, 284, 282, 320)])

# ---------------------------------------------------------------- Pexels (plein écran)
ajoute("px-ecran", "pexels/7942761.mp4", 2.0, 1.6, (0, 0, 1440, 2560), PLEIN)
ajoute("px-trepied", "pexels/13929657.mp4", 3.0, 1.2, None, PLEIN)
# numéros de la carte affichée et marque du terminal floutés
ajoute("px-paiement", "pexels/4109600.mp4", 5.0, 1.4, (1350, 0, 1215, 2160), PLEIN, 1.0, [(1460, 460, 2120, 1200), (1040, 0, 1420, 190)])
ajoute("px-argent", "pexels/5704057.mp4", 8.0, 1.6, None, PLEIN)
ajoute("px-boutique", "pexels/8386982.mp4", 11.5, 1.2, (900, 0, 1215, 2160), PLEIN)
ajoute("px-salon", "pexels/7383793.mp4", 4.0, 1.0, None, PLEIN)
ajoute("px-eglise", "pexels/16863297.mp4", 3.0, 1.0, (1080, 0, 608, 1080), PLEIN)
ajoute("px-entreprise", "pexels/9365166.mp4", 15.0, 1.0, (780, 0, 608, 1080), PLEIN)
ajoute("px-marche", "pexels/27165157.mp4", 3.5, 1.2, (1450, 0, 1215, 2160), PLEIN)

# ---------------------------------------------------------------- TikTok (1080 × 2400)
BARRE = [(0, 0, 1080, 128)]  # heure, compteur rouge d'enregistrement, réseau
AVATAR_HAUT = (400, 128, 680, 262)  # petite photo de profil de la barre du haut
NOM = (16, 244, 680, 405)
PHOTO = (690, 236, 1000, 530)
BIO = (16, 660, 1064, 965)
ajoute("tk-beretta-grille", "tiktok.mp4", 203.0, 4.0, None, TIKTOK, 1.0, [AVATAR_HAUT], BARRE)
ajoute("tk-beretta-profil", "tiktok.mp4", 200.4, 1.2, None, TIKTOK, 1.0, [NOM, PHOTO, BIO], BARRE)
ajoute("tk-yasso-profil", "tiktok.mp4", 155.3, 0.6, None, TIKTOK, 1.0, [NOM, PHOTO, BIO], BARRE)
# ralentie : au-delà de 158 s, une vignette montre un numéro de téléphone (jamais à l'image)
ajoute("tk-yasso-grille", "tiktok.mp4", 157.0, 2.0, None, TIKTOK, 0.6, [AVATAR_HAUT], BARRE)
ajoute("tk-issam-profil", "tiktok.mp4", 21.3, 1.0, None, TIKTOK, 1.0, [NOM, PHOTO, BIO], BARRE)
ajoute("tk-animations-grille", "tiktok.mp4", 41.0, 5.0, None, TIKTOK, 1.0, [AVATAR_HAUT], BARRE)


def filtre(crop, taille, vitesse, flous, blancs):
    f = []
    chaine = "[0:v]"
    etapes = []
    for (x0, y0, x1, y1) in blancs:
        etapes.append(f"drawbox=x={x0}:y={y0}:w={x1 - x0}:h={y1 - y0}:color=white:t=fill")
    base = ",".join(etapes) if etapes else "null"
    f.append(f"{chaine}{base}[b0]")
    courant = "b0"
    for k, (x0, y0, x1, y1) in enumerate(flous):
        f.append(f"[{courant}]split[s{k}a][s{k}b]")
        f.append(f"[s{k}b]crop={x1 - x0}:{y1 - y0}:{x0}:{y0},gblur=sigma=22:steps=3[z{k}]")
        f.append(f"[s{k}a][z{k}]overlay={x0}:{y0}[b{k + 1}]")
        courant = f"b{k + 1}"
    l, h = taille
    suite = []
    if crop:
        x, y, w, hh = crop
        suite.append(f"crop={w}:{hh}:{x}:{y}")
    else:
        suite.append(f"crop='min(iw,ih*{l}/{h})':'min(ih,iw*{h}/{l})'")
    suite.append(f"scale={l}:{h}:flags=lanczos,setsar=1")
    if vitesse != 1.0:
        suite.append(f"setpts=PTS/{vitesse}")
    suite.append("fps=30,format=yuv420p")
    f.append(f"[{courant}]{','.join(suite)}[v]")
    return ";".join(f)


for nom, (fichier, debut, duree, crop, taille, vitesse, flous, blancs) in E.items():
    if choix and nom not in choix:
        continue
    cmd = [
        "ffmpeg", "-v", "error", "-y", "-ss", f"{debut}", "-t", f"{duree * vitesse + 0.1}", "-i", os.path.join(src, fichier),
        "-filter_complex", filtre(crop, taille, vitesse, flous, blancs), "-map", "[v]", "-an",
        "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-t", f"{duree}", os.path.join(sortie, f"{nom}.mp4"),
    ]
    subprocess.run(cmd, check=True)
    print(nom)
