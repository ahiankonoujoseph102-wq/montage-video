"""Fabrique la famille d'effets sonores, accordée sur la tonalité de la musique.

Usage : python3 scripts/sons.py            (lit sons/musique.json, écrit sons/effets/*.wav)

Tous les effets partagent les mêmes ingrédients, pour sonner comme une seule famille :
- un « corps » grave accordé sur la tonique (impact à hauteur descendante),
- des cloches (synthèse additive, partiels inharmoniques) sur les notes de l'accord de tonique,
- des souffles (bruit filtré dont le filtre balaie),
- la même réverbération courte et douce.
"""
import json
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
NOTES = {"Do": 0, "Do#": 1, "Ré": 2, "Ré#": 3, "Mi": 4, "Fa": 5, "Fa#": 6, "Sol": 7, "Sol#": 8, "La": 9, "La#": 10,
         "Si": 11}
rng = np.random.default_rng(7)  # sons reproductibles


def t_(duree):
    return np.arange(int(duree * SR)) / SR


def note(tonique, demi_tons, octave):
    """Fréquence d'une note : `demi_tons` au-dessus de la tonique, octave scientifique (La4 = 440 Hz)."""
    midi = 12 * (octave + 1) + NOTES[tonique] + demi_tons
    return 440 * 2 ** ((midi - 69) / 12)


def enveloppe(t, attaque, chute):
    """Attaque linéaire courte puis chute exponentielle (constante de temps `chute`, en s)."""
    a = np.clip(t / max(attaque, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attaque, 0) / chute)


def filtre(x, bas=None, haut=None, ordre=4):
    if bas and haut:
        sos = butter(ordre, [bas, haut], btype="bandpass", fs=SR, output="sos")
    elif bas:
        sos = butter(ordre, bas, btype="highpass", fs=SR, output="sos")
    else:
        sos = butter(ordre, haut, btype="lowpass", fs=SR, output="sos")
    return sosfilt(sos, x)


def bruit(duree):
    return rng.standard_normal(int(duree * SR))


def balayage(duree, f_debut, f_fin, largeur=0.6):
    """Souffle : bruit passé dans un filtre passe-bande dont la fréquence glisse (par tranches de 10 ms)."""
    n = int(duree * SR)
    x = bruit(duree + 0.05)
    sortie = np.zeros(n)
    pas = int(0.01 * SR)
    for i in range(0, n, pas):
        f = f_debut * (f_fin / f_debut) ** (i / n)
        bloc = filtre(x[i:i + pas + 2048], f * (1 - largeur / 2), min(f * (1 + largeur / 2), SR / 2 - 100), 2)
        sortie[i:i + pas] = bloc[:min(pas, n - i)]
    return sortie


def boum(duree, f_haut, f_bas, chute, chute_hauteur=0.035):
    """Impact grave : sinus dont la hauteur tombe très vite de f_haut à f_bas, légèrement saturé."""
    t = t_(duree)
    f = f_bas + (f_haut - f_bas) * np.exp(-t / chute_hauteur)
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(1.6 * np.sin(phase)) * enveloppe(t, 0.002, chute)


def clic(duree=0.012, bas=2500):
    """Transitoire d'attaque : courte rafale de bruit aigu, pour un impact net."""
    t = t_(duree)
    return filtre(bruit(duree), bas, 12000, 2) * enveloppe(t, 0.0005, duree / 4)


def cloche(duree, f, chute, eclat=1.0):
    """Cloche claire : partiels inharmoniques, les plus aigus s'éteignent plus vite."""
    t = t_(duree)
    sortie = np.zeros_like(t)
    for ratio, amp, vitesse in [(1, 1.0, 1.0), (2.0, 0.45, 1.6), (2.76, 0.3 * eclat, 2.4), (5.4, 0.12 * eclat, 4.0),
                                (8.9, 0.05 * eclat, 6.0)]:
        sortie += amp * np.sin(2 * np.pi * f * ratio * t) * enveloppe(t, 0.001, chute / vitesse)
    return sortie


def reverb(x, mouille, longueur=0.9, clair=5000):
    """Réverbération douce et stéréo : réponse impulsionnelle de bruit à décroissance exponentielle."""
    t = t_(longueur)
    ir = [filtre(bruit(longueur), 200, clair, 2) * np.exp(-t / (longueur / 5)) for _ in range(2)]
    pre_delai = np.zeros(int(0.012 * SR))
    stereo = []
    for canal in ir:
        canal = np.concatenate([pre_delai, canal])
        humide = fftconvolve(x, canal / np.sqrt(np.sum(canal ** 2)))
        sec = np.pad(x, (0, len(humide) - len(x)))
        stereo.append((1 - mouille) * sec + mouille * humide)
    return np.stack(stereo, axis=1)


def place(base, son, debut):
    i = int(debut * SR)
    fin = min(len(base), i + len(son))
    base[i:fin] += son[:fin - i]
    return base


def finir(x, crete_db=-1.0):
    """Normalise la crête, ajoute un micro-fondu de fin, renvoie du stéréo float32."""
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    # Coupe la traîne inaudible (sous −60 dB de la crête).
    niveau = np.abs(x).max(axis=1)
    audible = np.where(niveau > niveau.max() * 1e-3)[0]
    x = x[:audible[-1] + int(0.05 * SR)]
    fondu = int(0.02 * SR)
    x[-fondu:] *= np.linspace(1, 0, fondu)[:, None]
    return (x / np.max(np.abs(x)) * 10 ** (crete_db / 20)).astype(np.float32)


def fabriquer(tonique, mode):
    tierce = 3 if mode == "mineur" else 4
    G1, G2, G3 = note(tonique, 0, 1), note(tonique, 0, 2), note(tonique, 0, 3)
    tonique5, quinte5 = note(tonique, 0, 5), note(tonique, 7, 5)
    quinte4, tierce4 = note(tonique, 7, 4), note(tonique, tierce, 4)
    sons = {}

    # Ouverture (première image) : impact grave et puissant — sub-basse longue qui tombe de deux octaves,
    # deuxième couche à l'octave, claquement médium, clic d'attaque, accord de tonique grave en résonance.
    d = 2.4
    x = np.zeros(int(d * SR))
    place(x, boum(d, G2 * 4, G1, 0.75, 0.05), 0)
    place(x, 0.6 * boum(d, G3 * 2, G2, 0.35), 0)
    place(x, 0.6 * filtre(bruit(0.2), 250, 2200, 2) * enveloppe(t_(0.2), 0.001, 0.045), 0)
    place(x, 0.45 * clic(0.015, 2000), 0)
    for f, a in [(G3, 0.18), (quinte4 / 2, 0.12)]:
        place(x, a * cloche(2.0, f, 0.8, 0.4), 0)
    sons["ouverture"] = finir(reverb(x, 0.26, 1.8))

    # Mot du titre d'accroche : claquement court et sec (clic + médium + petite note de tonique).
    d = 0.3
    x = np.zeros(int(d * SR))
    place(x, 0.7 * filtre(bruit(0.08), 900, 3500, 2) * enveloppe(t_(0.08), 0.0005, 0.018), 0)
    place(x, 0.5 * clic(0.01, 3000), 0)
    place(x, 0.5 * boum(0.12, G3 * 2, G3, 0.03, 0.01), 0)
    sons["mot"] = finir(reverb(x, 0.08, 0.35))

    # Croix rouge : « non » court et sec, un peu grave — deux notes qui tombent (quinte → tonique).
    d = 0.35
    x = np.zeros(int(d * SR))
    for k, (f, debut) in enumerate([(note(tonique, 7, 3), 0.0), (G3, 0.055)]):
        t = t_(0.14)
        onde = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sin(2 * np.pi * f * t)  # timbre carré adouci
        place(x, filtre(onde, haut=1600, ordre=2) * enveloppe(t, 0.002, 0.05), debut)
    place(x, 0.8 * boum(0.2, G2 * 2, G2, 0.06), 0)
    place(x, 0.25 * clic(0.008, 1800), 0)
    sons["croix"] = finir(reverb(x, 0.1, 0.5))

    # Coche verte : « ding » clair et montant — deux cloches (quinte puis tonique, à l'octave supérieure).
    d = 1.0
    x = np.zeros(int(d * SR))
    place(x, 0.8 * cloche(0.8, quinte4, 0.25), 0)  # quinte (Ré5 en Sol mineur)
    place(x, cloche(0.9, tonique5, 0.35), 0.07)    # tonique (Sol5)
    sons["coche"] = finir(reverb(x, 0.25, 1.0, 7000))

    # Panneau : glissement léger — souffle qui monte, avec une pointe tonale très discrète.
    d = 0.5
    x = np.zeros(int(d * SR))
    place(x, balayage(0.4, 700, 3200) * enveloppe(t_(0.4), 0.02, 0.1), 0)
    place(x, 0.08 * cloche(0.4, tierce4 * 2, 0.15, 0.3), 0.03)
    sons["panneau"] = finir(reverb(x, 0.2, 0.7))

    # Entrée d'un plein écran : souffle rapide puis petit impact (quand le cercle s'ouvre).
    d = 1.0
    x = np.zeros(int(d * SR))
    place(x, balayage(0.22, 500, 5000) * enveloppe(t_(0.22), 0.01, 0.08), 0)
    place(x, 0.9 * boum(0.6, G2 * 2.5, G2, 0.18), 0.16)
    place(x, 0.25 * clic(), 0.16)
    sons["plein_ecran"] = finir(reverb(x, 0.2, 1.0))

    # Information à retenir (date, lieu, numéro) : impact marqué + cloche sur l'accord de tonique.
    d = 1.8
    x = np.zeros(int(d * SR))
    place(x, boum(d, G2 * 3, G1, 0.5), 0)
    place(x, 0.45 * filtre(bruit(0.2), 400, 2500, 2) * enveloppe(t_(0.2), 0.001, 0.04), 0)
    place(x, 0.3 * clic(), 0)
    for f, a in [(tonique5 / 2, 0.35), (quinte4, 0.25), (tonique5, 0.2)]:
        place(x, a * cloche(1.6, f, 0.6, 0.6), 0)
    sons["info"] = finir(reverb(x, 0.25, 1.6))

    # Changement de cadrage : souffle très discret, à peine perceptible.
    d = 0.3
    x = balayage(d, 2500, 7000, 0.8) * enveloppe(t_(d), 0.015, 0.06)
    sons["zoom"] = finir(reverb(x, 0.15, 0.4))

    # Carton de fin : montée douce (1,2 s) puis impact final sur l'accord de tonique.
    montee, d = 1.2, 3.4
    x = np.zeros(int(d * SR))
    t = t_(montee)
    gonfle = (t / montee) ** 2
    place(x, 0.6 * balayage(montee, 300, 6000) * gonfle, 0)
    f = G3 * (quinte4 / 2 / G3) ** (t / montee)  # glissando de la tonique vers la quinte
    place(x, 0.25 * np.sin(2 * np.pi * np.cumsum(f) / SR) * gonfle, 0)
    place(x, boum(2.2, G2 * 3, G1, 0.55), montee)
    place(x, 0.3 * clic(), montee)
    for fr, a in [(G3, 0.3), (tierce4, 0.25), (quinte4, 0.25), (tonique5, 0.2)]:
        place(x, a * cloche(2.0, fr, 0.9, 0.5), montee)
    sons["carton"] = finir(reverb(x, 0.28, 2.0))

    # --- Style dynamique (ajoutés en dernier : le grain des sons précédents ne change pas) ---
    # Transition : souffle rapide qui monte puis redescend, avec un petit impact grave au milieu (la coupe).
    d = 0.7
    x = np.zeros(int(d * SR))
    t = t_(0.36)
    souffle = np.concatenate([balayage(0.18, 600, 6000), balayage(0.18, 6000, 900)])
    place(x, souffle * np.concatenate([np.linspace(0.2, 1, len(t) // 2), np.linspace(1, 0, len(t) - len(t) // 2)]), 0)
    place(x, 0.55 * boum(0.4, G2 * 2.5, G2, 0.09), 0.17)
    sons["transition"] = finir(reverb(x, 0.18, 0.6))

    # Autocollant : « pop » bref et rond (bulle sur la quinte) + petit clic, sans grave.
    d = 0.45
    x = np.zeros(int(d * SR))
    t = t_(0.12)
    f = quinte4 * (1.6 - 0.6 * np.exp(-t / 0.02))
    place(x, np.sin(2 * np.pi * np.cumsum(f) / SR) * enveloppe(t, 0.001, 0.035), 0)
    place(x, 0.4 * cloche(0.3, tonique5, 0.08, 0.4), 0.01)
    place(x, 0.2 * clic(0.006, 4000), 0)
    sons["autocollant"] = finir(reverb(x, 0.12, 0.4))
    return sons


def main():
    config = json.loads((ROOT / "sons" / "musique.json").read_text())
    dossier = ROOT / "sons" / "effets"
    dossier.mkdir(parents=True, exist_ok=True)
    for nom, son in fabriquer(config["tonique"], config["mode"]).items():
        wavfile.write(dossier / f"{nom}.wav", SR, (son * 32767).astype(np.int16))
        print(f"{nom:<12} {len(son) / SR:.2f} s")


if __name__ == "__main__":
    main()
