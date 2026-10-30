"""Morceaux de parole (« unités ») d'une source, transcrits un par un, et suppression des reprises.

Une unité = parole continue (pauses de moins de 0,7 s). Une unité dont le texte se retrouve dans une des unités
suivantes (il a recommencé sa phrase) est retirée : on garde la dernière prise."""
import difflib
import json
from pathlib import Path

import numpy as np

from textes import normaliser
from voix import SR, Source

CACHE = Path(__file__).resolve().parent / "sorties" / "unites"
CACHE.mkdir(parents=True, exist_ok=True)
_modele = None
REMPLISSAGE = {"euh", "voila", "donc", "ok", "bon", "alors", "hein", "d", "accord"}


def modele():
    global _modele
    if _modele is None:
        from faster_whisper import WhisperModel
        _modele = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", cpu_threads=4)
    return _modele


def unites(s: Source, debut: float, fin: float, pause: float = 0.7) -> list[tuple[float, float]]:
    zones = [(max(a, debut), min(b, fin)) for a, b in s.parole if b > debut and a < fin]
    out = []
    for a, b in zones:
        if out and a - out[-1][1] < pause:
            out[-1] = (out[-1][0], b)
        else:
            out.append((a, b))
    return [(a, b) for a, b in out if b - a > 0.15]


def transcrire(s: Source, a: float, b: float) -> list[dict]:
    """Mots d'une unité, temps dans la source."""
    cle = CACHE / f"{Path(s.chemin).stem}_{a:.2f}_{b:.2f}.json"
    if cle.exists():
        return json.loads(cle.read_text())
    a0, b0 = max(0, a - 0.15), b + 0.15
    x = s.x[int(a0 * SR): int(b0 * SR)]
    x16 = np.ascontiguousarray(x[::3])
    segs, _ = modele().transcribe(x16, language="fr", word_timestamps=True, vad_filter=False, beam_size=5,
                                  condition_on_previous_text=False, without_timestamps=False)
    mots = [{"mot": w.word.strip(), "debut": round(a0 + w.start, 3), "fin": round(a0 + w.end, 3)} for sg in segs for w in sg.words]
    cle.write_text(json.dumps(mots, ensure_ascii=False))
    return mots


def jetons(mots: list[dict]) -> list[str]:
    return [j for m in mots for j in normaliser(m["mot"])]


def sans_reprises(s: Source, liste: list[tuple[float, float]], minimum: int = 3, portee: int = 4) -> tuple[list, list, list]:
    """Retire les unités recommencées plus loin. Renvoie (gardées, retirées, mots de chaque unité gardée)."""
    mots = [transcrire(s, a, b) for a, b in liste]
    toks = [jetons(m) for m in mots]
    garder = [True] * len(liste)
    for i, ti in enumerate(toks):
        utiles = [t for t in ti if t not in REMPLISSAGE]
        if not utiles:
            garder[i] = len(ti) > 0 and False  # unité faite seulement d'hésitations : retirée
            continue
        if len(ti) < minimum:
            continue
        for j in range(i + 1, min(len(toks), i + 1 + portee)):
            sm = difflib.SequenceMatcher(None, ti, toks[j], autojunk=False)
            commun = sum(bl.size for bl in sm.get_matching_blocks())
            if commun >= 0.75 * len(ti):
                garder[i] = False
                break
    gardees = [u for u, g in zip(liste, garder) if g]
    retirees = [(u, " ".join(t)) for u, t, g in zip(liste, toks, garder) if not g]
    return gardees, retirees, [m for m, g in zip(mots, garder) if g]


def coupes_internes(mots: list[dict], k_min: int = 4, portee: int = 30) -> list[tuple[float, float]]:
    """Phrase recommencée sans pause, dans une même unité : « elle ne répond pas à vos clients, elle ne répond pas à vos
    clients pendant que… ». On coupe du début de la première prise au début de la seconde."""
    toks = []  # (jeton, indice du mot)
    for i, m in enumerate(mots):
        for j in normaliser(m["mot"]):
            toks.append((j, i))
    t = [x[0] for x in toks]
    coupes = []
    i = 0
    while i < len(t):
        trouve = False
        for k in range(10, k_min - 1, -1):
            if i + k > len(t) or sum(1 for x in t[i:i + k] if x not in REMPLISSAGE) < k_min:
                continue
            for j in range(i + k, min(len(t) - k + 1, i + portee)):
                if t[j:j + k] == t[i:i + k]:
                    a = mots[toks[i][1]]["debut"] - 0.05
                    b = mots[toks[j][1]]["debut"] - 0.05
                    coupes.append((a, b))
                    i = j
                    trouve = True
                    break
            if trouve:
                break
        if not trouve:
            i += 1
    return coupes


def coupe_fin_redite(mots_i: list[dict], suivants: list[list[dict]], k_min: int = 4, tete: int = 25):
    """Fin d'une unité redite au début d'une des unités suivantes : renvoie l'instant (source) où couper l'unité."""
    toks = [(j, k) for k, m in enumerate(mots_i) for j in normaliser(m["mot"])]
    t = [x[0] for x in toks]
    for debut in range(0, len(t) - k_min + 1):  # le plus long suffixe d'abord
        suffixe = t[debut:]
        n = len(suffixe)
        if sum(1 for x in suffixe if x not in REMPLISSAGE) < k_min:
            continue
        for m in suivants:
            tj = jetons(m)[:tete + n]
            sm = difflib.SequenceMatcher(None, suffixe, tj, autojunk=False)
            if sum(bl.size for bl in sm.get_matching_blocks()) >= max(k_min, 0.8 * n):
                return mots_i[toks[debut][1]]["debut"] - 0.05
    return None
