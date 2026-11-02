"""Extraits TikTok (≈ 2 min) des vidéos de formation : format vertical 1080 × 1920, fond flouté de la même vidéo,
vidéo 16:9 au centre, titre en haut et repère « Partie n · épisode » en dessous (zone sûre TikTok).
Usage : python3 decouper.py  (liste EXTRAITS ci-dessous) → out/tiktok/"""
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path("/home/user/montage-video/out/tiktok")
OUT.mkdir(parents=True, exist_ok=True)
F = "/home/user/montage-videos/serie-animee/node_modules/@fontsource/poppins/files/poppins-latin-{}-normal.woff"
OR, BLANC, NUIT = (254, 202, 38), (255, 255, 255), (2, 6, 41)
LOGO = "/home/user/montage-videos/serie-animee/public/marque/logo.jpg"

# (fichier, source, début, fin, titre (2 lignes max), épisode)
EXTRAITS = [  # temps vérifiés sur la transcription de la vidéo finale (1Av2.json)
    ("01-creer-son-agent-ia", "formation-1A-v2.mp4", 0.0, 108.9, "Créez votre agent IA\nmême sans savoir coder", "Épisode 1"),
    ("02-le-projet", "formation-1A-v2.mp4", 108.7, 181.8, "Ce qu'on va construire\nensemble, de A à Z", "Épisode 2"),
    ("03-ia-ou-agent-ia", "formation-1A-v2.mp4", 184.1, 292.9, "IA ou agent IA :\nquelle différence ?", "Épisode 3"),
    ("04-les-6-types", "formation-1A-v2.mp4", 293.9, 364.4, "Les 6 types\nd'agents IA", "Épisode 4"),
    ("05-les-mots-1", "formation-1A-v2.mp4", 366.6, 479.1, "4 mots à connaître\navant de créer un agent", "Épisode 5"),
    ("06-les-mots-2", "formation-1A-v2.mp4", 479.1, 617.3, "GitHub, API, clé API…\nexpliqués simplement", "Épisode 6"),
    ("07-claude-et-github", "formation-1A-v2.mp4", 617.4, 741.0, "Créer vos comptes\nClaude et GitHub", "Épisode 7"),
    ("08-la-methode", "formation-1A-v2.mp4", 741.5, 883.2, "La méthode complète\nen 4 étapes", "Épisode 8"),
]


def police(g, t):
    return ImageFont.truetype(F.format(g), t)


def calque(titre, episode, chemin):
    im = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # bandeau du titre (zone sûre : sous les 10 % du haut)
    d.rounded_rectangle((60, 250, 1020, 600), 40, fill=(2, 6, 41, 225), outline=OR, width=6)
    lignes = titre.split("\n")
    taille = 78
    while max(d.textlength(l, font=police(800, taille)) for l in lignes) > 880:
        taille -= 2
    f = police(800, taille)
    h = taille * 1.25
    y = 425 - h * len(lignes) / 2
    for i, l in enumerate(lignes):
        d.text((540, y + i * h), l, font=f, fill=OR if i == 0 else BLANC, anchor="mt")
    # sous la vidéo
    f2 = police(700, 46)
    d.text((540, 1330), f"Formation agent IA · {episode}", font=f2, fill=BLANC, anchor="mt")
    logo = Image.open(LOGO).convert("RGBA").resize((90, 90))
    m = Image.new("L", (90, 90), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, 89, 89), 20, fill=255)
    im.paste(logo, (330, 1405), m)
    d.text((440, 1450), "Lomé IA School", font=police(800, 50), fill=OR, anchor="lm")
    im.save(chemin)


for nom, src, a, b, titre, ep in EXTRAITS:
    if len(sys.argv) > 1 and not any(nom.startswith(x) for x in sys.argv[1:]):
        continue
    png = OUT / f"{nom}.png"
    calque(titre, ep, png)
    duree = b - a
    filtre = (f"[0:v]split[a][b];[a]scale=-2:1920,crop=1080:1920,boxblur=30:3,eq=brightness=-0.25[fond];"
              f"[b]scale=1080:-2[v];[fond][v]overlay=0:(H-h)/2[c];[c][1:v]overlay=0:0,format=yuv420p[o];"
              f"[0:a]afade=t=in:d=0.15,afade=t=out:st={duree - 0.3:.2f}:d=0.3[s]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(a), "-t", f"{duree:.2f}", "-i", f"/home/user/montage-video/out/{src}",
                    "-i", str(png), "-filter_complex", filtre, "-map", "[o]", "-map", "[s]", "-c:v", "libx264", "-crf", "21",
                    "-preset", "medium", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart",
                    str(OUT / f"{nom}.mp4")], check=True)
    print(nom, round(duree, 1), "s")
