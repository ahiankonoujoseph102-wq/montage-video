"""Publicité Talkami : prépare les fichiers du rendu Remotion (composition PubTalkami) et la bande son.

Usage : python3 scripts/pub_talkami.py
  1. copie les images et vidéos du kit dans public/talkami-pub/kit/ et écrit public/talkami-pub/props.json
     (à partir de projets/talkami-pub/plan.json) ;
  2. voix off : coupe le silence du début (decalageVoix), débruitage doux, égaliseur (chaleur + clarté),
     désesseur, compression légère → public/talkami-pub/voix.wav ;
  3. musique originale composée ici (synthèse, Sol mineur comme les effets, 116 BPM) → sons/musique_pub_talkami.wav ;
  4. mixage voix + musique (ducking sous la voix) + effets de sons/effets/, −14 LUFS, crête vraie < −1 dBTP
     → public/talkami-pub/mix.wav, et le relevé des niveaux dans projets/talkami-pub/sons.md.
"""
import json
import shutil
import subprocess
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
from scipy import signal

ROOT = Path(__file__).resolve().parent.parent
PROJET = ROOT / "projets" / "talkami-pub"
PUBLIC = ROOT / "public" / "talkami-pub"
SR = 48000
PLAN = json.loads((PROJET / "plan.json").read_text())
DUREE = PLAN["duree"]
N = int(round(DUREE * SR))
rng = np.random.default_rng(7)


def lire(fichier, debut=0.0):
    cmd = ["ffmpeg", "-loglevel", "error", "-ss", str(debut), "-i", str(fichier), "-vn", "-ac", "2", "-ar", str(SR),
           "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()


def ecrire(fichier, x):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-c:a", "pcm_s24le", str(fichier)], input=x.astype(np.float32).tobytes(), check=True)


def lufs(x):
    return pyln.Meter(SR).integrated_loudness(x)


# --- 1. Fichiers du rendu ---

def preparer_kit():
    (PUBLIC / "kit").mkdir(parents=True, exist_ok=True)
    for f in (PROJET / "pub-kit").rglob("*"):
        if f.suffix in (".mp4", ".png") and "voix-off" not in f.parts:
            shutil.copy2(f, PUBLIC / "kit" / f.name)
    props = {k: PLAN[k] for k in ("duree", "sousTitres", "plans")}
    (PUBLIC / "props.json").write_text(json.dumps(props, ensure_ascii=False))


# --- 2. Voix ---

def preparer_voix():
    filtres = ",".join([
        f"atrim=start={PLAN['decalageVoix']}", "asetpts=PTS-STARTPTS",
        "highpass=f=75:poles=2",
        "afftdn=nr=10:nf=-42:tn=1",             # débruitage doux (suit le bruit de fond)
        "equalizer=f=180:t=q:w=0.9:g=2.5",       # chaleur
        "equalizer=f=380:t=q:w=1.4:g=-2.5",      # moins de son « carton »
        "equalizer=f=3300:t=q:w=1.1:g=3",        # présence, clarté
        "highshelf=f=9000:g=1.5",                # un peu d'air
        "deesser=i=0.35:f=0.5",
        "acompressor=threshold=-22dB:ratio=3:attack=8:release=140:makeup=3dB:knee=4",
    ])
    sortie = PUBLIC / "voix_traitee.wav"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(PROJET / "source.mp4"), "-af", filtres,
                    "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s24le", str(sortie)], check=True)
    v = lire(sortie)[:N]
    v = np.pad(v, ((0, N - len(v)), (0, 0)))
    return v * 10 ** ((-15 - lufs(v)) / 20)


# --- 3. Musique originale (synthèse) ---

BPM = 116
TEMPS = 60 / BPM
DROP = next(p["a"] for p in PLAN["plans"] if p["type"] == "logo")  # s : entrée du groupe complet, avec le logo


def note(demi_tons):
    return 440 * 2 ** ((demi_tons - 9) / 12)  # 0 = Do4


# Sol mineur : Sol m – Mi♭ – Si♭ – Fa (i – VI – III – VII), une mesure chacun.
ACCORDS = [[7, 10, 14], [3, 7, 10], [10, 14, 17], [5, 9, 12]]
BASSES = [7 - 24, 3 - 24, 10 - 24, 5 - 24]


def env(n, attaque, chute):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attaque, 1e-4)) * np.exp(-t / chute)


def scie(f, n, desaccord=0.0):
    t = np.arange(n) / SR
    x = np.zeros(n)
    for d in ([0] if not desaccord else [-desaccord, 0, desaccord]):
        x += 2 * ((t * f * (1 + d)) % 1) - 1
    return x / (1 if not desaccord else 3)


def passe_bas(x, fc, ordre=2):
    b, a = signal.butter(ordre, min(fc, SR / 2 - 100) / (SR / 2), "low")
    return signal.lfilter(b, a, x)


def passe_haut(x, fc, ordre=2):
    b, a = signal.butter(ordre, fc / (SR / 2), "high")
    return signal.lfilter(b, a, x)


def poser(piste, son, t):
    i = int(round(t * SR))
    if i >= len(piste) or i + len(son) <= 0:
        return
    if i < 0:
        son, i = son[-i:], 0
    k = min(len(son), len(piste) - i)
    piste[i:i + k] += son[:k]


def grosse_caisse():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 75 * np.exp(-t / 0.03)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)
    x[:200] += rng.normal(0, 0.3, 200) * np.linspace(1, 0, 200)
    return x


def claquement():
    n = int(0.25 * SR)
    bruit = passe_haut(passe_bas(rng.normal(0, 1, n), 5000), 900)
    t = np.arange(n) / SR
    corps = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04)
    return 0.55 * bruit * np.exp(-t / 0.07) + 0.35 * corps


def charleston(ouvert=False):
    n = int((0.16 if ouvert else 0.05) * SR)
    return passe_haut(rng.normal(0, 1, n), 7000) * env(n, 0.001, 0.05 if ouvert else 0.012)


def musique():
    m = np.zeros(N)
    pad = np.zeros(N)
    basse = np.zeros(N)
    pluck = np.zeros(N)
    batterie = np.zeros(N)
    kick = grosse_caisse()
    clap = claquement()
    # Grille calée sur le drop : la mesure 0 commence à DROP ; l'intro reprend la grille en arrière.
    premier = DROP - 8 * 4 * TEMPS
    for mesure in range(0, 40):
        t0 = premier + mesure * 4 * TEMPS
        if t0 > DUREE:
            break
        k = mesure % 4
        groupe = t0 >= DROP - 1e-6
        accord = ACCORDS[k]
        # Nappe douce, tout du long.
        n = int(4 * TEMPS * SR)
        x = sum(scie(note(d), n, 0.004) for d in accord) / 3
        poser(pad, passe_bas(x, 1400) * env(n, 0.25, 6), t0)
        # Accords piqués sur les contretemps (motif 1-et-2-et…), filtre qui s'ouvre pendant l'intro.
        for c in range(8):
            if c in (0, 3, 6) or (groupe and c in (2, 5)):
                tc = t0 + c * TEMPS / 2
                nn = int(0.3 * SR)
                y = sum(scie(note(d + 12), nn) for d in accord) / 3
                ouverture = 2500 if groupe else 700 + 1800 * max(0, min(1, (tc - 0) / DROP))
                poser(pluck, passe_bas(y, ouverture) * env(nn, 0.003, 0.09), tc)
        if groupe:
            # Basse en croches, qui saute à l'octave.
            for c in range(8):
                tc = t0 + c * TEMPS / 2
                nn = int(TEMPS / 2 * SR * 0.9)
                f = note(BASSES[k] + (12 if c % 4 == 3 else 0))
                y = passe_bas(scie(f, nn), 500) * env(nn, 0.004, 0.18)
                poser(basse, y, tc)
            for b in range(4):
                tb = t0 + b * TEMPS
                poser(batterie, kick * 0.9, tb)
                if b in (1, 3):
                    poser(batterie, clap * 0.55, tb)
                poser(batterie, charleston(False) * 0.25, tb)
                poser(batterie, charleston(True) * 0.22, tb + TEMPS / 2)
        else:
            # Intro : charleston léger seulement.
            for b in range(8):
                poser(batterie, charleston(False) * 0.12, t0 + b * TEMPS / 2)
    # Montée de bruit filtré vers le drop.
    n = int(1.1 * SR)
    t = np.arange(n) / SR
    montee = passe_haut(rng.normal(0, 1, n), 1500) * (t / t[-1]) ** 2 * 0.25
    poser(batterie, montee, DROP - 1.1)
    # « Pompe » sur la grosse caisse : nappe, basse et accords baissent un instant à chaque temps.
    pompe = np.ones(N)
    for b in range(200):
        tb = DROP + b * TEMPS
        if tb > DUREE:
            break
        i = int(tb * SR)
        nn = int(0.22 * SR)
        k = min(nn, N - i)
        pompe[i:i + k] = np.minimum(pompe[i:i + k], 0.45 + 0.55 * (np.arange(k) / nn) ** 0.7)
    m = 0.32 * pad * pompe + 0.55 * basse * pompe + 0.30 * pluck * pompe + 0.75 * batterie
    # Fin : accord final tenu, puis fondu.
    m *= np.interp(np.arange(N) / SR, [0, DUREE - 1.6, DUREE], [1, 1, 0])
    st = np.stack([m, m], 1)
    # Léger élargissement stéréo des accords.
    retard = int(0.012 * SR)
    st[retard:, 1] = 0.85 * st[retard:, 1] + 0.15 * (0.30 * pluck * pompe)[:-retard]
    return st / np.max(np.abs(st)) * 0.8


# --- 4. Effets et mixage ---

def effet(nom):
    return lire(ROOT / "sons" / "effets" / f"{nom}.wav")


def evenements():
    """(temps en s, nom de l'effet, gain dB relatif, description)"""
    ev = [(0.0, "ouverture", -2, "Impact d'ouverture (accroche)"), (0.24, "croix", -6, "Cadenas qui se ferme")]
    for p in PLAN["plans"]:
        a = p["a"]
        if p["type"] == "blocage" and p["etat"] == 1:
            ev.append((a + 0.03, "coche", -6, "COMPRENDRE ✓"))
        elif p["type"] == "blocage" and p["etat"] == 2:
            ev.append((a + 0.03, "croix", -5, "PARLER ✗"))
        elif p["type"] == "logo":
            ev.append((a + 0.1, "ouverture", -4, "Logo Talkami"))
        elif p["type"] == "fin":
            ev.append((a + 0.03, "info", -4, "Image de fin talkami.net"))
        elif p["type"] in ("telephone", "duo", "dialogue", "duoLogo"):
            ev.append((a - 0.12, "transition", -8, f"Passage : {p['type']}"))
        if p.get("etiquette"):
            ev.append((a + 0.1, "autocollant", -8, f"Étiquette {p['etiquette']}"))
        if p.get("badge"):
            ev.append((p["badge"]["a"] + 0.03, "autocollant", -6, "Badge évaluation gratuite"))
        if p.get("puce"):
            ev.append((p["puce"]["a"] + 0.03, "coche" if p["puce"].get("juste") else "autocollant", -6,
                       "Correction I go → I went" if p["puce"].get("juste") else "Puce EN FRANÇAIS"))
    return sorted(ev)


def mixer():
    voix = preparer_voix()
    mus = musique()
    ecrire(ROOT / "sons" / "musique_pub_talkami.wav", mus)
    # Niveau de la musique : 16 LU sous la voix quand il parle, plus présente dans les respirations (logo, fin).
    parole = np.abs(voix[:, 0])
    fen = int(0.25 * SR)
    enveloppe = np.convolve(parole, np.ones(fen) / fen, "same")
    actif = (enveloppe > 10 ** (-38 / 20)).astype(float)
    actif = np.convolve(actif, np.ones(int(0.3 * SR)) / int(0.3 * SR), "same")  # transitions douces
    mus = mus * 10 ** ((lufs(voix) - 16 - lufs(mus)) / 20)
    gain_db = 6 * (1 - actif)  # +6 dB quand la voix se tait
    t = np.arange(N) / SR
    gain_db = np.where(t > PLAN["plans"][-1]["a"] + 1.6, 8, gain_db)  # après « talkami point net »
    mus = mus * (10 ** (gain_db / 20))[:, None]
    fx = np.zeros((N, 2))
    lignes = []
    for tps, nom, g, quoi in evenements():
        e = effet(nom) * 10 ** (g / 20) * 0.5
        i = int(round(tps * SR))
        k = min(len(e), N - i)
        if k > 0:
            fx[i:i + k] += e[:k]
        lignes.append((tps, nom, quoi))
    mix = voix + mus + fx
    mix *= 10 ** ((-14 - lufs(mix)) / 20)
    # Limiteur de crête (le même que scripts/mixer.py) : −2 dBTP, marge pour l'encodage AAC.
    brut = PUBLIC / "mix_brut.wav"
    ecrire(brut, mix)
    lim = lambda d: 10 ** (d / 20)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(brut), "-af",
                    f"alimiter=limit={lim(-2.5):.4f}:attack=3:release=60:level=disabled,"
                    f"aresample=192000,alimiter=limit={lim(-2.3):.4f}:attack=1:release=30:level=disabled,"
                    f"aresample={SR}", "-c:a", "pcm_s24le", str(PUBLIC / "mix.wav")], check=True)
    brut.unlink()
    mix = lire(PUBLIC / "mix.wav")
    return voix, mus, fx, mix, lignes


def mesures(voix, mus, mix, lignes):
    sortie = PUBLIC / "mix.wav"
    r = subprocess.run(["ffmpeg", "-nostdin", "-i", str(sortie), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    vrai = [l for l in r.splitlines() if "Peak:" in l][-1].split()[-2]
    t = np.arange(N) / SR
    parle = np.abs(voix[:, 0]) > 10 ** (-40 / 20)
    txt = ["# Son — publicité Talkami", "",
           f"- Mix final : **{lufs(mix):.1f} LUFS** ; crête vraie **{vrai} dBTP** (avant encodage).",
           f"- Voix seule : {lufs(voix):.1f} LUFS (traitée : débruitage doux, chaleur, clarté, désesseur, compression 3:1).",
           f"- Musique : {lufs(mus):.1f} LUFS sur toute la durée, environ 16 LU sous la voix quand elle parle.", "",
           "| Temps | Effet | Quoi |", "|---|---|---|"]
    txt += [f"| {a:.2f} s | {b} | {c} |" for a, b, c in lignes]
    (PROJET / "sons.md").write_text("\n".join(txt) + "\n")
    print("\n".join(txt[:6]))


if __name__ == "__main__":
    preparer_kit()
    voix, mus, fx, mix, lignes = mixer()
    mesures(voix, mus, mix, lignes)
