"""Série TikTok tirée de la formation partie 1 : une vidéo par partie (accroche + passage de la formation + carton de fin).

Usage : python3 scripts/serie.py <bundle Remotion> <n° de partie>…   (après scripts/serie_voix.py)
Lit projets/serie-formation-partie1/serie.json, la vidéo finale de la formation (out/formation-partie1/
Formation_Partie1_HQ.mp4) et son mixage (public/formation-montage-partie1/formation_mix_radio.wav).
Écrit out/serie-formation-partie1/Partie_<n>.mp4 : 1080 × 1920, 30 i/s, H.264 < 100 Mo, AAC, −14 LUFS, crête vraie
< −1 dBTP.

- Début : accroche dite par le double (composition « SeriePiece », mode accroche : titre de 3 lignes, badge PARTIE n/N),
  musique de la formation prise juste avant le passage (elle continue sans saut dans le passage), impact d'ouverture.
- Passage : images et son de la formation, tels quels.
- Fin : carton « Commentez SUITE » (ou, pour la dernière partie, numéro WhatsApp), musique qui continue puis fondu.
"""
import json
import math
import subprocess
import sys
import tempfile
import unicodedata
import re
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
cfg = json.loads((ROOT / "projets" / "serie-formation-partie1" / "serie.json").read_text())
MOTS = {}  # mots horodatés de chaque fichier de voix : projets/serie-formation-partie1/<fichier>_mots.json
radio = json.loads((ROOT / "projets" / "formation-montage-partie1" / "montage_formation.json").read_text())["radio"]
PUB = ROOT / "public" / "serie-formation-partie1"
FORM = ROOT / "public" / "formation-montage-partie1"
VIDEO = ROOT / "out" / "formation-partie1" / "Formation_Partie1_HQ.mp4"
SORTIE = ROOT / "out" / "serie-formation-partie1"
SR, FPS, TEMPO = 48000, 30, radio["tempo"]
LEAD_A, QUEUE_A, LEAD_F, QUEUE_F = 8, 14, 9, 24  # images avant / après la voix (accroche, fin)
MUSIQUE_SOUS_VOIX = -16.0  # LU
bundle, choix = sys.argv[1], [int(x) for x in sys.argv[2:]]
total = len(cfg["parties"])
SORTIE.mkdir(parents=True, exist_ok=True)
nav = next(Path("/opt/pw-browsers").glob("chromium_headless_shell-*/chrome-linux/headless_shell"))


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def charger(chemin, stereo=True):
    s = subprocess.run(["ffmpeg", "-v", "error", "-i", str(chemin), "-ac", "2" if stereo else "1", "-ar", str(SR),
                        "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(s, dtype=np.float32).astype(np.float64)
    return x.reshape(-1, 2) if stereo else x


mesure = pyln.Meter(SR)
mix = charger(FORM / "formation_mix_radio.wav")
piste = charger(FORM / "formation_voix_radio.wav", stereo=False)
# facteur de normalisation du mixage final (−14 LUFS) : la voix y est k fois la voix calée à −17 LUFS
n = min(len(piste), len(mix))
k = float(np.dot(mix[:n, 0], piste[:n]) / np.dot(piste[:n], piste[:n]))
# musique de la formation, rebouclée exactement comme dans scripts/formation_montage.py
musique = charger(ROOT / "sons" / "musique_defaut.m4a")
L_mus = mesure.integrated_loudness(musique)
fondu = int(1.5 * SR)
boucle = musique.copy()
while len(boucle) < len(mix) + 30 * SR:
    r = np.linspace(0, 1, fondu)[:, None]
    boucle = np.concatenate([boucle[:-fondu], boucle[-fondu:] * (1 - r) + musique[:fondu] * r, musique[fondu:]])
g_mus = k * 10 ** ((-17.0 + MUSIQUE_SOUS_VOIX - L_mus) / 20)


def effet(nom, niveau):
    x = charger(ROOT / "sons" / "effets" / f"{nom}.wav")
    return k * x * 10 ** ((niveau - mesure.integrated_loudness(x)) / 20)


def piece(nom_voix, mode, lead, queue, extra):
    """Props de la composition SeriePiece (bouche, gestes, expressions) et voix."""
    voix = charger(PUB / "voix" / f"{nom_voix}.wav", stereo=False)
    nv = math.ceil(len(voix) / SR * FPS)
    duree = lead + nv + queue
    a, b, *fichier = cfg["voix"][nom_voix]
    fichier = fichier[0] if fichier else "accroches"
    if fichier not in MOTS:
        MOTS[fichier] = json.loads((ROOT / "projets" / "serie-formation-partie1" / f"{fichier}_mots.json").read_text())
    mots = [m for m in MOTS[fichier] if m[2] > a + 0.05 and m[1] < b]  # Whisper place souvent le début en avance
    t0 = lead / FPS
    gestes, expressions = [{"t": -10, "geste": "repos"}], [{"t": -10, "expression": "neutre"},
                                                            {"t": t0 - 0.08, "expression": "parle"},
                                                            {"t": t0 + nv / FPS + 0.1, "expression": "sourire"}]
    for m, g, *reste in cfg["gestes"].get(nom_voix, []):
        w = next((x for x in mots if norm(x[0]) == norm(m)), None) or next(x for x in mots if norm(m) in norm(x[0]))
        debut = t0 + max(0.0, w[1] - a) / TEMPO
        doigts = next((x for x in reste if isinstance(x, int)), None)
        d = next((x for x in reste if not isinstance(x, int)), "mot")
        fin = t0 + (w[2] - a) / TEMPO + 0.3 if d == "mot" else debut + float(d)
        gestes += [{"t": round(debut - 0.15, 3), "geste": g, **({"doigts": doigts} if doigts else {})},
                   {"t": round(fin, 3), "geste": "repos"}]
    gestes.sort(key=lambda g: g["t"])
    props = {"mode": mode, "duree": duree, "debutVoix": lead, **extra,
             "bouche": json.loads((PUB / "voix" / f"{nom_voix}_bouche.json").read_text()),
             "visemes": json.loads((PUB / "voix" / f"{nom_voix}_visemes.json").read_text()),
             "gestes": gestes, "expressions": expressions}
    return props, voix, duree


def rendre(props, sortie):
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(props, f, ensure_ascii=False)
    subprocess.run(["npx", "remotion", "render", bundle, "SeriePiece", str(sortie), f"--props={f.name}", "--muted",
                    f"--browser-executable={nav}", "--concurrency=4", "--crf=16"], check=True, cwd=ROOT,
                   capture_output=True)


for numero in choix:
    p = cfg["parties"][numero - 1]
    derniere = numero == total
    tmp = Path(tempfile.mkdtemp())
    pa, voix_a, Ha = piece(p["accroche"], "accroche", LEAD_A, QUEUE_A,
                           {"titre": p["titre"], "motsCles": p["motsCles"], "partie": numero, "total": total})
    pf, voix_f, Hf = piece("derniere" if derniere else "suite", "derniere" if derniere else "suite", LEAD_F, QUEUE_F, {})
    rendre(pa, tmp / "a.mp4")
    rendre(pf, tmp / "f.mp4")
    i0, i1 = round(p["debut"] * FPS), round(p["fin"] * FPS)
    # images : accroche + passage de la formation + carton de fin, encodées une seule fois
    total_img = Ha + (i1 - i0) + Hf
    # son
    da, df = Ha / FPS, Hf / FPS
    s0, s1 = int(i0 / FPS * SR), int(i1 / FPS * SR)
    son_a = boucle[s0 - int(da * SR):s0] * g_mus
    va = np.zeros(len(son_a))
    va[int(LEAD_A / FPS * SR):int(LEAD_A / FPS * SR) + len(voix_a)] = voix_a[:len(son_a) - int(LEAD_A / FPS * SR)] * k
    son_a = son_a + va[:, None]
    e = effet("ouverture", -19)
    son_a[:min(len(e), len(son_a))] += e[:len(son_a)]
    son_p = mix[s0:s1]
    son_f = boucle[s1:s1 + int(df * SR)] * g_mus
    vf = np.zeros(len(son_f))
    vf[int(LEAD_F / FPS * SR):int(LEAD_F / FPS * SR) + len(voix_f)] = voix_f[:len(son_f) - int(LEAD_F / FPS * SR)] * k
    son_f = son_f + vf[:, None]
    e = effet("carton", -22)
    son_f[:min(len(e), len(son_f))] += e[:len(son_f)]
    fin_f = int(0.8 * SR)
    son_f[-fin_f:] *= np.linspace(1, 0, fin_f)[:, None]
    son = np.concatenate([son_a, son_p, son_f])
    son *= 10 ** ((-14.0 - mesure.integrated_loudness(son)) / 20)
    sf.write(tmp / "son.wav", son.astype(np.float32), SR, subtype="FLOAT")
    sortie = SORTIE / f"Partie_{numero}.mp4"
    duree = total_img / FPS
    debit = min(6000, int((95e6 * 8 / duree - 192e3) / 1000))  # kb/s, pour rester sous 100 Mo
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp / "a.mp4"), "-ss", f"{i0 / FPS:.4f}", "-i", str(VIDEO),
                    "-i", str(tmp / "f.mp4"), "-i", str(tmp / "son.wav"), "-filter_complex",
                    f"[1:v]trim=end_frame={i1 - i0},setpts=PTS-STARTPTS[p];[0:v][p][2:v]concat=n=3:v=1:a=0,fps=30[v];"
                    "[3:a]alimiter=limit=0.79:level=false[s]",
                    "-map", "[v]", "-map", "[s]", "-c:v", "libx264", "-preset", "slow", "-crf", "18",
                    "-maxrate", f"{debit}k", "-bufsize", f"{2 * debit}k", "-pix_fmt", "yuv420p", "-c:a", "aac",
                    "-b:a", "192k", "-ar", str(SR), "-movflags", "+faststart", str(sortie)], check=True)
    taille = sortie.stat().st_size
    out = subprocess.run(["ffmpeg", "-nostats", "-i", str(sortie), "-af", "ebur128=peak=true", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", out)[-1]
    crete = re.findall(r"Peak:\s+(-?[\d.]+)", out)[-1]
    print(f"Partie {numero} : {duree:.1f} s (accroche {da:.1f} s, passage {(i1 - i0) / FPS:.1f} s, fin {df:.1f} s), "
          f"{taille / 1e6:.1f} Mo, {lufs} LUFS, crête vraie {crete} dBTP")
