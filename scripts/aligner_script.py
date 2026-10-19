"""Aligne la voix nettoyée (public/<projet>/voix_carte.json) sur le script (phrases lues), mot à mot.

Usage : python3 scripts/aligner_script.py <projet> <script>
Écrit public/<projet>/phrases.json : pour chaque phrase du script, son enregistrement, son texte, ses mots
(texte du script, avec début et fin dans la voix nettoyée) et la note de ressemblance avec ce qui a été entendu.
"""
import difflib
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
projet, script = sys.argv[1], Path(sys.argv[2])


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)


texte = script.read_text().split("=== PROMPTS")[0]
phrases, enr = [], 0
for ligne in texte.split("\n"):
    if ligne.startswith("=== ENREGISTREMENT"):
        enr = int(ligne.split()[2])
        continue
    if not ligne.strip() or ligne.startswith(("[", "VERSION", "Joseph", "Les lignes", "Générique d")) or enr == 0:
        continue
    for p in re.split(r"(?<=[.?!])\s+(?=[A-ZÀ-Ý«0-9])", ligne.strip()):
        mots = [m for m in re.split(r"\s+", p) if norm(m)]
        phrases.append({"enr": enr, "texte": p, "mots": mots})
sw = [(k, m) for k, p in enumerate(phrases) for m in p["mots"]]
carte = json.loads((ROOT / "public" / projet / "voix_carte.json").read_text())
tw = carte["mots"]
A = [norm(m) for _, m in sw]
B = [norm(m[0]) for m in tw]


def sim(a, b):
    if a == b:
        return 2
    r = difflib.SequenceMatcher(None, a, b).ratio()
    return 1 if r >= 0.6 else -1


# Alignement global (Needleman-Wunsch), trou = -1.
n, m = len(A), len(B)
S = [[0] * (m + 1) for _ in range(n + 1)]
for i in range(1, n + 1):
    S[i][0] = -i
for j in range(1, m + 1):
    S[0][j] = -j
for i in range(1, n + 1):
    Si, Sp, a = S[i], S[i - 1], A[i - 1]
    for j in range(1, m + 1):
        Si[j] = max(Sp[j - 1] + sim(a, B[j - 1]), Sp[j] - 1, Si[j - 1] - 1)
i, j, lien = n, m, {}
supp = []
while i > 0 and j > 0:
    if S[i][j] == S[i - 1][j - 1] + sim(A[i - 1], B[j - 1]):
        if sim(A[i - 1], B[j - 1]) > 0:
            lien[i - 1] = j - 1
        i, j = i - 1, j - 1
    elif S[i][j] == S[i - 1][j] - 1:
        i -= 1
    else:
        supp.append(j - 1)
        j -= 1
# Temps de chaque mot du script : celui du mot entendu, sinon interpolé entre voisins alignés.
temps = [None] * n
for i, j in lien.items():
    temps[i] = [tw[j][1], tw[j][2]]
connus = [i for i in range(n) if temps[i]]
for i in range(n):
    if temps[i] is None:
        av = max([k for k in connus if k < i], default=None)
        ap = min([k for k in connus if k > i], default=None)
        t0 = temps[av][1] if av is not None else 0
        t1 = temps[ap][0] if ap is not None else t0 + 0.4
        na = i - (av if av is not None else -1)
        nb = (ap if ap is not None else n) - (av if av is not None else -1)
        t = t0 + (t1 - t0) * na / nb
        temps[i] = [round(t - 0.05, 3), round(t + 0.05, 3)]
k0 = 0
for k, p in enumerate(phrases):
    idx = [i for i, (kk, _) in enumerate(sw) if kk == k]
    p["mots"] = [[sw[i][1], temps[i][0], temps[i][1], i in lien] for i in idx]
    p["debut"], p["fin"] = temps[idx[0]][0], temps[idx[-1]][1]
    ent = [tw[lien[i]][0] for i in idx if i in lien]
    p["alignes"] = round(len(ent) / len(idx), 2)
    js = [lien[i] for i in idx if i in lien]
    p["entendu"] = " ".join(t[0] for t in tw[min(js):max(js) + 1]) if js else ""
(ROOT / "public" / projet / "phrases.json").write_text(json.dumps(phrases, ensure_ascii=False, indent=0))
for k, p in enumerate(phrases):
    marque = "  " if p["alignes"] >= 0.6 else "??"
    print(f"{marque}{k:3d} E{p['enr']} {p['debut']:7.2f}-{p['fin']:7.2f} {p['alignes']:.2f} {p['texte'][:70]}")
extra = [tw[j] for j in sorted(supp) if j not in lien.values()]
print("Mots entendus hors script :", " ".join(f"{w[0]}@{w[1]:.1f}" for w in extra))
