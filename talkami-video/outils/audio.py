"""Prépare l'audio d'un épisode et les sons communs à la série.

  python outils/audio.py voix SOURCE DEBUT FIN SORTIE.wav BOUCHE.json
      découpe la narration, filtre les graves parasites, et calcule l'ouverture
      de la bouche image par image (30 i/s) à partir de l'énergie de la voix.
  python outils/audio.py rhubarb RHUBARB.json BOUCHE.json VISEMES.json
      convertit la sortie de Rhubarb Lip Sync (mode phonétique) en une forme de
      bouche par image (chaîne de lettres X, A…H), avec une image d'avance, et
      ferme la bouche dans les silences (BOUCHE.json : énergie par image).
  python outils/audio.py serie public/serie [durée_s=200]
      synthétise la musique douce et les effets sonores (aucun droit d'auteur :
      tout est généré ici, de façon déterministe).
"""
import json
import subprocess
import sys
import wave

import numpy as np

SR = 48000
FPS = 30


def ecrire(chemin: str, signal: np.ndarray) -> None:
    if signal.ndim == 1:
        signal = np.stack([signal, signal], axis=1)
    pic = np.max(np.abs(signal)) or 1.0
    if pic > 0.98:
        signal = signal * (0.98 / pic)
    donnees = (signal * 32767).astype("<i2")
    with wave.open(chemin, "wb") as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(donnees.tobytes())


def lire_mono(chemin: str) -> np.ndarray:
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", chemin, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0


# ------------------------------------------------------------------ voix

def preparer_voix(source: str, debut: float, fin: float, sortie: str, bouche: str) -> None:
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-ss", str(debut), "-to", str(fin), "-i", source,
         "-af", "highpass=f=70,afade=t=in:d=0.04", "-ar", str(SR), "-ac", "2", sortie],
        check=True,
    )
    x = lire_mono(sortie)
    pas = SR // FPS
    n = len(x) // pas + 1
    db = np.full(n, -90.0)
    for i in range(n):
        bloc = x[max(0, i * pas - pas // 2): i * pas + pas]
        if len(bloc):
            db[i] = 20 * np.log10(np.sqrt(np.mean(bloc ** 2)) + 1e-9)
    # seuils calés sur la distribution de la voix (≈ 30e et 97e centiles) :
    # la bouche se referme entre les syllabes au lieu de rester entrouverte
    bas, haut = np.percentile(db, 30), np.percentile(db, 97)
    brut = np.clip((db - bas) / (haut - bas), 0, 1) ** 0.85
    lisse = np.zeros(n)
    for i in range(1, n):
        coef = 0.75 if brut[i] > lisse[i - 1] else 0.5  # ouverture vive, fermeture plus douce
        lisse[i] = lisse[i - 1] + (brut[i] - lisse[i - 1]) * coef
    lisse[lisse < 0.07] = 0
    # la bouche anticipe le son d'une image : c'est ce que l'œil perçoit comme synchrone
    lisse = np.concatenate([lisse[1:], [0.0]])
    with open(bouche, "w") as f:
        json.dump([round(float(v), 3) for v in lisse], f)
    print(f"voix : {len(x) / SR:.2f} s, {n} images")


# ------------------------------------------------------------------ synthèse

def note(nom: str) -> float:
    noms = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}
    return 440.0 * 2 ** ((noms[nom[:-1]] + 12 * (int(nom[-1]) - 4)) / 12)


def t_(duree: float) -> np.ndarray:
    return np.arange(int(duree * SR)) / SR


def passe_bas(x: np.ndarray, fc: float) -> np.ndarray:
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def passe_bas_rapide(x: np.ndarray, fc: float) -> np.ndarray:
    # filtre à un pôle via convolution d'un noyau exponentiel tronqué (rapide en numpy)
    a = np.exp(-2 * np.pi * fc / SR)
    k = (1 - a) * a ** np.arange(int(SR * 6 / (2 * np.pi * fc)) + 1)
    return np.convolve(x, k)[: len(x)]


def cloche(f: float, duree: float, decroissance: float = 3.0) -> np.ndarray:
    t = t_(duree)
    env = np.exp(-decroissance * t) * np.minimum(1, t / 0.004)
    return env * (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-4 * t) + 0.2 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-8 * t))


def pincee(f: float, duree: float) -> np.ndarray:
    t = t_(duree)
    env = np.exp(-5.5 * t) * np.minimum(1, t / 0.006)
    return env * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t))


def placer(piste: np.ndarray, son: np.ndarray, instant: float, gain: float = 1.0) -> None:
    i = int(instant * SR)
    if i >= len(piste):
        return
    j = min(len(piste), i + len(son))
    piste[i:j] += son[: j - i] * gain


def musique(duree: float = 80.0) -> np.ndarray:
    """Nappe douce + arpège léger + basse ronde, 88 battements par minute."""
    bpm = 88
    temps = 60 / bpm
    mesure = 4 * temps
    accords = [
        ["F3", "A3", "C4", "E4"],   # Fa maj7
        ["G3", "B3", "D4", "E4"],   # Sol 6
        ["E3", "G3", "B3", "D4"],   # Mi m7
        ["A3", "C4", "E4", "G4"],   # La m7
    ]
    basses = ["F2", "G2", "E2", "A2"]
    n = int(duree * SR)
    gauche = np.zeros(n)
    droite = np.zeros(n)
    t_mesure = t_(mesure + 1.5)
    nb = int(np.ceil(duree / mesure))
    for k in range(nb):
        debut = k * mesure
        acc = accords[k % 4]
        # nappe : deux oscillateurs légèrement désaccordés par note, attaque lente
        env = np.minimum(1, t_mesure / 0.9) * np.where(t_mesure > mesure, np.exp(-(t_mesure - mesure) * 3), 1)
        for j, nom in enumerate(acc):
            f = note(nom)
            for desaccord, cote in ((0.997, 0), (1.003, 1)):
                s = env * (np.sin(2 * np.pi * f * desaccord * t_mesure) + 0.25 * np.sin(4 * np.pi * f * desaccord * t_mesure)) * 0.06
                placer(gauche if cote == 0 else droite, s, debut)
        # basse
        fb = note(basses[k % 4])
        sb = np.minimum(1, t_mesure / 0.05) * np.exp(-0.6 * t_mesure) * np.sin(2 * np.pi * fb * t_mesure) * 0.22
        placer(gauche, sb, debut)
        placer(droite, sb, debut)
        # arpège en croches, une octave au-dessus
        motif = [0, 1, 2, 3, 2, 1, 2, 3]
        for c, idx in enumerate(motif):
            f = note(acc[idx]) * 2
            s = pincee(f, 1.2) * 0.05
            pan = 0.35 + 0.3 * (c % 2)
            placer(gauche, s * (1 - pan), debut + c * temps / 2)
            placer(droite, s * pan, debut + c * temps / 2)
    signal = np.stack([passe_bas_rapide(gauche, 3500), passe_bas_rapide(droite, 3500)], axis=1)
    # fondus d'entrée et de sortie
    fondu = int(1.5 * SR)
    signal[:fondu] *= np.linspace(0, 1, fondu)[:, None]
    signal[-fondu:] *= np.linspace(1, 0, fondu)[:, None]
    return signal


def bruit(duree: float, graine: int) -> np.ndarray:
    return np.random.default_rng(graine).standard_normal(int(duree * SR))


def effets() -> dict[str, np.ndarray]:
    e: dict[str, np.ndarray] = {}
    # souffle : bruit dont le filtre s'ouvre puis se referme
    t = t_(0.55)
    b = bruit(0.55, 1)
    env = np.sin(np.pi * t / 0.55) ** 2
    lent = passe_bas_rapide(b, 600)
    vif = passe_bas_rapide(b, 3000) - passe_bas_rapide(b, 600)
    e["souffle"] = (lent * 0.5 + vif * np.sin(np.pi * t / 0.55)) * env * 0.9
    # pop : petite bulle qui apparaît
    t = t_(0.14)
    f = 950 * np.exp(-t * 9)
    e["pop"] = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28) * 0.8
    # clic de clavier
    t = t_(0.035)
    e["clic"] = (passe_bas_rapide(bruit(0.035, 2), 4500) - passe_bas_rapide(bruit(0.035, 2), 900)) * np.exp(-t * 160) * 1.6
    # erreur : deux notes graves descendantes, douces
    s = np.zeros(int(0.55 * SR))
    for i, f in enumerate([330, 247]):
        tt = t_(0.24)
        ton = np.sign(np.sin(2 * np.pi * f * tt)) * 0.3 + np.sin(2 * np.pi * f * tt)
        placer(s, passe_bas_rapide(ton, 1800) * np.exp(-tt * 9) * 0.5, i * 0.17)
    e["erreur"] = s
    # succès : deux cloches ascendantes
    s = np.zeros(int(1.3 * SR))
    placer(s, cloche(note("E6"), 1.0), 0.0, 0.45)
    placer(s, cloche(note("B6"), 1.2), 0.11, 0.4)
    e["succes"] = s
    # lettre : coup sourd + carillon
    t = t_(0.7)
    coup = np.sin(2 * np.pi * np.cumsum(120 * np.exp(-t * 12) + 45) / SR) * np.exp(-t * 14)
    e["lettre"] = coup * 0.8 + cloche(note("A5"), 0.7, 5) * 0.3
    # rassemblement : arpège de cloches montant + souffle
    s = np.zeros(int(1.8 * SR))
    for i, nom in enumerate(["C5", "E5", "G5", "C6", "E6"]):
        placer(s, cloche(note(nom), 1.2, 3.5), i * 0.09, 0.28)
    placer(s, e["souffle"] * 0.5, 0.0)
    e["rassemble"] = s
    # ouverture : souffle + accord en cloches
    s = np.zeros(int(2.0 * SR))
    placer(s, e["souffle"], 0.0, 0.8)
    for i, nom in enumerate(["F5", "A5", "C6", "E6"]):
        placer(s, cloche(note(nom), 1.6, 2.2), 0.3 + i * 0.05, 0.22)
    e["ouverture"] = s
    # fin : accord doux
    s = np.zeros(int(2.2 * SR))
    for i, nom in enumerate(["C5", "E5", "G5", "B5"]):
        placer(s, cloche(note(nom), 2.0, 1.8), i * 0.07, 0.22)
    e["fin"] = s
    return e


def musique_energie(duree: float = 160.0) -> np.ndarray:
    """Musique énergique (épisodes à captures) : 118 battements par minute,
    grosse caisse, charleston, claquements, basse syncopée, accords pincés.
    Générée ici, sans droits."""
    bpm = 118
    temps = 60 / bpm
    mesure = 4 * temps
    n = int(duree * SR)
    g = np.zeros(n)
    d = np.zeros(n)
    accords = [["A3", "C4", "E4", "G4"], ["F3", "A3", "C4", "E4"], ["C4", "E4", "G4", "B4"], ["G3", "B3", "D4", "F#4"]]
    basses = ["A1", "F1", "C2", "G1"]
    tk = t_(0.35)
    grosse = np.sin(2 * np.pi * np.cumsum(55 + 110 * np.exp(-tk * 28)) / SR) * np.exp(-tk * 9) * 0.9
    tc = t_(0.06)
    charleston = (passe_bas_rapide(bruit(0.06, 7), 9000) - passe_bas_rapide(bruit(0.06, 7), 5000)) * np.exp(-tc * 70) * 1.2
    tl = t_(0.2)
    claque = (passe_bas_rapide(bruit(0.2, 8), 5000) - passe_bas_rapide(bruit(0.2, 8), 900)) * np.exp(-tl * 22) * 0.9
    for k in range(int(np.ceil(duree / mesure))):
        debut = k * mesure
        acc = accords[k % 4]
        intro = k < 2  # deux mesures plus légères
        for b in range(4):
            if not intro or b in (0, 2):
                placer(g, grosse, debut + b * temps, 0.55)
                placer(d, grosse, debut + b * temps, 0.55)
            if b in (1, 3) and not intro:
                placer(g, claque, debut + b * temps, 0.32)
                placer(d, claque, debut + b * temps, 0.32)
        for c in range(8):
            placer(g if c % 2 else d, charleston, debut + c * temps / 2 + temps / 4, 0.16)
        fb = note(basses[k % 4])
        for c, dec in enumerate([0, 0.75, 1.5, 2.5, 3.0]):
            tb = t_(temps * 0.45)
            sb = np.sin(2 * np.pi * fb * tb) * np.exp(-tb * 5) * 0.32 * (1 if c == 0 else 0.8)
            placer(g, sb, debut + dec * temps)
            placer(d, sb, debut + dec * temps)
        motif = [0, 2, 1, 3, 2, 1, 3, 2]
        for c, idx in enumerate(motif):
            s = pincee(note(acc[idx]) * 2, 0.5) * 0.06
            placer(g if c % 2 else d, s, debut + c * temps / 2)
        tn = t_(mesure + 0.4)
        env = np.minimum(1, tn / 0.08) * np.where(tn > mesure, np.exp(-(tn - mesure) * 6), 1) * 0.022
        for nom in acc:
            placer(g, env * np.sin(2 * np.pi * note(nom) * 0.998 * tn), debut)
            placer(d, env * np.sin(2 * np.pi * note(nom) * 1.002 * tn), debut)
    signal = np.stack([g, d], axis=1)
    fondu = int(1.0 * SR)
    signal[-fondu:] *= np.linspace(1, 0, fondu)[:, None]
    return signal


def effets_energie() -> dict[str, np.ndarray]:
    e: dict[str, np.ndarray] = {}
    # whoosh : bruit filtré dont la brillance monte puis descend, 0,4 s
    t = t_(0.4)
    b = bruit(0.4, 11)
    env = np.sin(np.pi * t / 0.4) ** 1.5
    e["whoosh"] = (passe_bas_rapide(b, 4500) - passe_bas_rapide(b, 500)) * env * 1.4
    # ding : cloche claire
    e["ding"] = cloche(note("A6"), 1.0, 4.5) * 0.6
    # pièces : petits tintements aléatoires
    s = np.zeros(int(0.9 * SR))
    rng = np.random.default_rng(3)
    for i in range(9):
        f = 2400 + rng.random() * 2600
        placer(s, cloche(f, 0.4, 14) * (0.5 - i * 0.03), 0.05 + i * 0.07 + rng.random() * 0.03)
    e["pieces"] = s
    # décollage : grondement grave qui monte et s'éloigne, 2,2 s
    t = t_(2.2)
    gr = passe_bas_rapide(bruit(2.2, 12), 700)
    souffle = passe_bas_rapide(bruit(2.2, 13), 3000) - passe_bas_rapide(bruit(2.2, 13), 800)
    env = np.minimum(1, t / 0.25) * np.exp(-np.maximum(0, t - 0.9) * 2.2)
    ton = np.sin(2 * np.pi * np.cumsum(60 + 140 * t / 2.2) / SR) * 0.4
    e["decollage"] = (gr * 2.0 + souffle * 0.8 * t / 2.2 + ton) * env
    # tampon : coup sec
    t = t_(0.25)
    e["tampon"] = (np.sin(2 * np.pi * np.cumsum(180 * np.exp(-t * 20) + 60) / SR) * np.exp(-t * 18) + passe_bas_rapide(bruit(0.25, 14), 2500) * np.exp(-t * 40) * 1.5) * 0.8
    return e


def preparer_serie(dossier: str, duree: float = 200.0) -> None:
    ecrire(f"{dossier}/musique.wav", musique(duree))
    ecrire(f"{dossier}/musique-energie.wav", musique_energie(160.0))
    for nom, son in {**effets(), **effets_energie()}.items():
        ecrire(f"{dossier}/sfx/{nom}.wav", son)
    print("musique et effets écrits dans", dossier)


def rhubarb_vers_images(source: str, bouche: str, sortie: str) -> None:
    """Une forme de bouche par image, à partir des repères de Rhubarb.

    Mesuré sur l'épisode 1 : les repères de Rhubarb arrivent déjà ≈ 2 images
    avant le son ; on les retarde d'une image pour garder exactement une image
    d'avance (ce que l'œil perçoit comme synchrone). Dans les silences de la
    voix (énergie quasi nulle), Rhubarb laisse souvent la bouche entrouverte :
    on force la forme de repos X.
    """
    reperes = json.load(open(source))["mouthCues"]
    energie = json.load(open(bouche))  # déjà une image en avance sur le son
    nb = len(energie)
    lettres = ["X"] * nb
    for r in reperes:
        a = round(r["start"] * FPS) + 1
        b = max(a + 1, round(r["end"] * FPS) + 1)
        for i in range(a, min(nb, b)):
            lettres[i] = r["value"]
    for i in range(nb):
        voisins = energie[max(0, i - 1): i + 2]
        if max(voisins) < 0.03 and lettres[i] not in "XA":
            lettres[i] = "X"
    with open(sortie, "w") as f:
        json.dump("".join(lettres), f)
    from collections import Counter
    print("formes par image :", dict(Counter(lettres)))


if __name__ == "__main__":
    if sys.argv[1] == "voix":
        preparer_voix(sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5], sys.argv[6])
    elif sys.argv[1] == "rhubarb":
        rhubarb_vers_images(sys.argv[2], sys.argv[3], sys.argv[4])
    elif sys.argv[1] == "serie":
        preparer_serie(sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else 200.0)
