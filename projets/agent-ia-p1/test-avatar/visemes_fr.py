"""Formes de bouche (X, A…H, comme Rhubarb) à partir des mots horodatés et de l'énergie de la voix.
Usage : visemes_fr.py MOTS.json DECALAGE BOUCHE.json SORTIE.json"""
import json, re, sys, unicodedata
FPS = 30
mots_src, decalage, bouche_f, sortie = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4]
energie = json.load(open(bouche_f)); n = len(energie)
UNITES = [("eau","E"),("ou","F"),("oi","F"),("au","E"),("on","E"),("om","E"),("an","C"),("am","C"),("en","C"),("em","C"),
          ("ain","B"),("in","B"),("ai","C"),("ei","C"),("ch","B"),("ph","G"),("qu","B"),("gn","B"),
          ("a","D"),("à","D"),("â","D"),("e","C"),("é","C"),("è","C"),("ê","C"),("i","B"),("î","B"),("y","B"),
          ("o","E"),("ô","E"),("u","F"),("û","F"),("m","A"),("b","A"),("p","A"),("f","G"),("v","G"),("l","H")]
VOY = set("DCEF")
def phonemes(mot):
    m = re.sub(r"[^a-zàâçéèêëîïôûùüÿœ]", "", mot.lower()).replace("œ","e")
    m = re.sub(r"(es|e|s|t|x|z|d)$", lambda k: "" if len(m) > 2 else k.group(0), m)
    out, i = [], 0
    while i < len(m):
        for u, v in UNITES:
            if m.startswith(u, i): out.append(v); i += len(u); break
        else: out.append("B"); i += 1   # autres consonnes : dents serrées
    return out or ["B"]
import numpy as np
MOTS = json.load(open(mots_src))
def placer(dec):
  lettres = ["X"] * n
  for w in MOTS:
    a, b = w["debut"] - dec, w["fin"] - dec
    if b <= 0 or a * FPS >= n: continue
    ph = phonemes(w["mot"]); poids = [1.0 if p in VOY else 0.6 for p in ph]; tot = sum(poids); t = a
    for p, q in zip(ph, poids):
        d = (b - a) * q / tot
        i0, i1 = round(t * FPS), max(round(t * FPS) + 1, round((t + d) * FPS))
        for i in range(max(0, i0), min(n, i1)): lettres[i] = p
        t += d
  return lettres
# Whisper place souvent les mots 0,1 à 0,3 s trop tôt : décalage global qui colle le mieux à l'énergie de la voix
voix = np.array(energie) > 0.05
def score(k):
  l = np.array([c != "X" for c in placer(decalage - k / FPS)])
  return (l & voix).sum() - 0.5 * (l & ~voix).sum()
k = max(range(-12, 13), key=score); print("décalage retenu :", k, "images")
lettres = placer(decalage - k / FPS)
# une image d'avance (comme la chaîne Rhubarb) ; bouche au repos dans les silences
lettres = lettres[1:] + ["X"]
for i in range(n):
    if max(energie[max(0, i - 1): i + 2]) < 0.03 and lettres[i] not in "XA": lettres[i] = "X"
    elif energie[i] > 0.6 and lettres[i] == "B": lettres[i] = "C"   # voix forte : bouche ouverte
json.dump("".join(lettres), open(sortie, "w"))
from collections import Counter; print(dict(Counter(lettres)))
