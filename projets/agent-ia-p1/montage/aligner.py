"""Retrouve chaque phrase prévue dans la transcription d'une source (dernière bonne prise) et l'horodate mot par mot.

Usage : python3 aligner.py  → sorties/phrases.json et sorties/ecarts.txt (différences texte prévu / dit)."""
import difflib
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from textes import PROJET, normaliser, script_parties, texte_a_lire  # noqa: E402

SORTIES = Path(__file__).resolve().parent / "sorties"
SORTIES.mkdir(exist_ok=True)


REMPLACE = {"tita": "teacher", "tolokami": "talkami", "tolkami": "talkami", "tokami": "talkami", "talkamy": "talkami",
            "qsor": "cursor", "flos": "flooz", "coates": "code", "cote": "code", "coach": "code", "coder": "code",
            "test": "texte", "tests": "textes"}
SUITES = [(["cahier", "des", "charges"], ["cas", "de", "charge"]), (["cahier", "de", "charge"], ["cas", "de", "charge"]),
          (["cas", "de", "charges"], ["cas", "de", "charge"]), (["carte", "de", "charge"], ["cas", "de", "charge"]),
          (["cloudkout"], ["claude"]), (["kami"], ["talkami"])]


def canon(jetons: list[str]) -> list[str]:
    """Même forme pour le texte prévu et la transcription (mots que Whisper déforme souvent)."""
    j = [REMPLACE.get(x, x) for x in jetons]
    for a, b in SUITES:
        i = 0
        while i <= len(j) - len(a):
            if j[i:i + len(a)] == a:
                j[i:i + len(a)] = b
            i += 1
    return j


def mots_source(chemin: Path) -> list[dict]:
    """Mots de la transcription, découpés en jetons normalisés (un mot peut en donner plusieurs)."""
    out = []
    for s in json.loads(chemin.read_text()):
        for w in s["mots"]:
            for j in normaliser(w["mot"]):
                out.append({"j": j, "debut": w["debut"], "fin": w["fin"], "proba": w["proba"]})
    jetons = canon([w["j"] for w in out])
    for w, j in zip(out, jetons):
        w["j"] = j
    return out


def aligner_phrase(phrase: str, src: list[dict], jetons: list[str], apres: float = -1e9, min_debut: float = -1e9):
    cible = canon(normaliser(phrase))
    n = len(cible)
    if n == 0:
        return None
    scores = []
    for i in range(0, max(1, len(jetons) - max(1, n // 2))):
        fen = jetons[i:i + n + max(2, n // 4)]
        if not fen or not set(cible[:3]) & set(fen[:3]):
            continue
        if not (apres - 30 <= src[i]["debut"] <= apres + 150) or src[i]["debut"] < min_debut:
            continue
        sm = difflib.SequenceMatcher(None, cible, fen, autojunk=False)
        scores.append((sm.ratio(), i))
    if not scores:
        return None
    meilleur = max(s for s, _ in scores)
    if meilleur < 0.45:
        return None
    seuil = max(0.45, meilleur - 0.08)
    r, i = max(((s, i) for s, i in scores if s >= seuil), key=lambda x: x[1])  # dernière bonne prise
    fen = jetons[i:i + n + max(2, n // 4)]
    sm = difflib.SequenceMatcher(None, cible, fen, autojunk=False)
    temps: list = [None] * n
    for a, b, k in sm.get_matching_blocks():
        for d in range(k):
            temps[a + d] = (src[i + b + d]["debut"], src[i + b + d]["fin"])
    blocs = [bl for bl in sm.get_matching_blocks() if bl.size]
    if not blocs:
        return None
    fin_fen = blocs[-1].b + blocs[-1].size
    # jetons non retrouvés : interpolés entre leurs voisins
    connus = [k for k, t in enumerate(temps) if t]
    for k in range(n):
        if temps[k] is None:
            av = max([c for c in connus if c < k], default=None)
            ap = min([c for c in connus if c > k], default=None)
            t0 = temps[av][1] if av is not None else temps[ap][0]
            t1 = temps[ap][0] if ap is not None else temps[av][1]
            temps[k] = (t0, max(t0, t1))
    dit = [w["j"] for w in src[i + blocs[0].b: i + fin_fen]]
    return {"ratio": round(r, 3), "debut": temps[0][0], "fin": temps[-1][1], "temps": temps, "dit": " ".join(dit)}


def mots_affiches(phrase: str, temps: list) -> list[dict]:
    """Mots du texte prévu (avec leur ponctuation) et leurs temps."""
    out, k = [], 0
    phrase = re.sub(r"(\d)[ \u202f](\d{3})", "\\1\u00a0\\2", phrase)
    for mot in phrase.split(" "):
        if not mot:
            continue
        nj = len(normaliser(mot))
        if nj == 0:
            if out:
                out[-1]["texte"] += " " + mot
            continue
        a, b = min(k, len(temps) - 1), min(k + nj - 1, len(temps) - 1)
        t0, t1 = temps[a][0], temps[b][1]
        out.append({"texte": mot, "debut": round(t0, 3), "fin": round(t1, 3)})
        k += nj
    return out


# Phrases que la transcription a trop déformées pour être retrouvées : temps relevés à la main (source).
MANUEL = {"P25.5": (695.70, 699.05)}

TRANS = Path(__file__).resolve().parent / "sorties" / "trans_complet"
VOIX = TRANS
TACHES = [
    # (source audio, transcription, identifiant, phrases)
    ("rushes/20261027-153738.mp4", TRANS / "20261027-153738.json", "P", {p: ph for p, ph in script_parties().items() if 1 <= p <= 35}),
    ("rushes/20261027-154022.mp4", TRANS / "20261027-154022.json", "P", {p: ph for p, ph in script_parties().items() if 36 <= p <= 39}),
    ("voix/fin-1a.m4a", VOIX / "fin-1a.json", "E", {1: texte_a_lire()[1], 2: texte_a_lire()[2]}),
    ("voix/audio-1346.m4a", VOIX / "audio-1346.json", "E", {3: texte_a_lire()[3], 4: texte_a_lire()[4]}),
    ("voix/audio-2.m4a", VOIX / "audio-2.json", "E", {5: texte_a_lire()[5]}),
    ("voix/recapitulatif.mp4", VOIX / "recapitulatif.json", "E", {6: texte_a_lire()[6]}),
]

if __name__ == "__main__":
    resultat, ecarts = {}, []
    for source, trans, prefixe, groupes in TACHES:
        src = mots_source(trans)
        jetons = [w["j"] for w in src]
        precedent, fin_prec = -1e9, -1e9
        for g, liste in groupes.items():
            for k, ph in enumerate(liste, 1):
                ident = f"{prefixe}{g}.{k}"
                if ident in MANUEL:
                    d0, d1 = MANUEL[ident]
                    mots = ph.split()
                    pas = (d1 - d0) / len(mots)
                    resultat[ident] = {"source": source, "texte": ph, "debut": d0, "fin": d1, "ratio": 1.0,
                                       "mots": [{"texte": m, "debut": round(d0 + k2 * pas, 3), "fin": round(d0 + (k2 + 1) * pas, 3)} for k2, m in enumerate(mots)]}
                    precedent, fin_prec = d0, d1
                    continue
                a = aligner_phrase(ph, src, jetons, precedent if precedent > -1e9 else 0, fin_prec - 0.3)
                if a is None:
                    a = aligner_phrase(ph, src, jetons, precedent if precedent > -1e9 else 0)
                if a is None and precedent > -1e9:
                    a = aligner_phrase(ph, src, jetons, precedent + 100)
                if not a:
                    ecarts.append(f"{ident} INTROUVABLE : {ph}")
                    continue
                precedent, fin_prec = a["debut"], a["fin"]
                resultat[ident] = {"source": source, "texte": ph, "debut": a["debut"], "fin": a["fin"], "ratio": a["ratio"],
                                   "mots": mots_affiches(ph, a["temps"])}
                if a["ratio"] < 0.97:
                    ecarts.append(f"{ident} {a['ratio']:.2f} [{a['debut']:.1f}] prévu : {' '.join(normaliser(ph))}\n{'':14}dit : {a['dit']}")
        print(source, "ok")
    (SORTIES / "phrases.json").write_text(json.dumps(resultat, ensure_ascii=False, indent=1))
    (SORTIES / "ecarts.txt").write_text("\n".join(ecarts))
    print(len(resultat), "phrases,", len(ecarts), "écarts")
