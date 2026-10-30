"""Découpe des textes prévus (script, texte à lire) en phrases, et normalisation pour l'alignement."""
import re
import unicodedata
from pathlib import Path

ICI = Path(__file__).resolve().parent
PROJET = ICI.parent

UNITES = "zéro un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize".split()
DIZAINES = {2: "vingt", 3: "trente", 4: "quarante", 5: "cinquante", 6: "soixante", 8: "quatre vingt"}


def nombre(n: int) -> str:
    if n < 17:
        return UNITES[n]
    if n < 20:
        return "dix " + UNITES[n - 10]
    if n < 100:
        d, u = divmod(n, 10)
        if d in (7, 9):
            return DIZAINES[d - 1] + " " + nombre(10 + u)
        return DIZAINES[d] + ("" if u == 0 else (" et un" if u == 1 and d != 8 else " " + UNITES[u]))
    if n < 1000:
        c, r = divmod(n, 100)
        return ("cent" if c == 1 else UNITES[c] + " cent") + ("" if r == 0 else " " + nombre(r))
    m, r = divmod(n, 1000)
    return ("mille" if m == 1 else nombre(m) + " mille") + ("" if r == 0 else " " + nombre(r))


def normaliser(texte: str) -> list[str]:
    t = texte.lower().replace("œ", "oe").replace("’", "'")
    t = re.sub(r"(\d)[\s  ](\d{3})", r"\1\2", t)
    t = re.sub(r"\d+", lambda m: " " + nombre(int(m.group())) + " " if int(m.group()) < 1_000_000 else m.group(), t)
    t = unicodedata.normalize("NFD", t)
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return t.split()


def phrases(paragraphe: str) -> list[str]:
    return [p.strip() for p in re.split(r"(?<=[.?!])\s+(?=[«A-ZÀ-Ý0-9])", paragraphe.strip()) if p.strip()]


def script_parties() -> dict[int, list[str]]:
    """Parties 1 à 88 du script : phrases à dire (sans les cadres « À montrer » ni « DÉMONSTRATION »)."""
    parties: dict[int, list[str]] = {}
    courante, ignorer = None, False
    for l in (PROJET / "script.txt").read_text().splitlines():
        m = re.match(r"^Partie (\d+)", l)
        if m:
            courante, ignorer = int(m.group(1)), False
            parties[courante] = []
            continue
        if courante is None:
            continue
        if l.startswith(("▶", "À montrer", "Message à montrer", "## ")):
            ignorer = True
            continue
        if ignorer or l.startswith("- "):
            continue
        parties[courante] += phrases(l)
    return parties


def texte_a_lire() -> dict[int, list[str]]:
    """Enregistrements 1 à 6 du texte à lire (une liste de phrases par enregistrement)."""
    out: dict[int, list[str]] = {}
    n = None
    for l in (PROJET / "texte_a_lire.md").read_text().splitlines():
        m = re.match(r"^## Enregistrement (\d)", l)
        if m:
            n = int(m.group(1))
            out[n] = []
        elif n and l.strip() and not l.startswith("#"):
            out[n] += phrases(l)
    return out
