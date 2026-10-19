"""Cherche des informations sensibles dans les extraits de captures utilisés.

Lit l'analyse de texte de la capture (outils/chercher_texte.py) et, pour chaque
plan de plans.json tiré de cette source, signale les lignes visibles dans le
cadre qui contiennent une adresse e-mail, un numéro de téléphone, un prix ou
« Administration ». Les flous déclarés du plan sont pris en compte.

Usage : python outils/verifier_confidentialite.py plans.json source ocr.json
"""
import json
import re
import sys

plans = json.load(open(sys.argv[1], encoding="utf-8"))["plans"]
source = sys.argv[2]
ocr = json.load(open(sys.argv[3], encoding="utf-8"))
MOTIFS = [
    ("e-mail", re.compile(r"@|gmail", re.I)),
    ("téléphone", re.compile(r"\+?228|\b\d{2}[ .]\d{2}[ .]\d{2}[ .]\d{2}\b")),
    ("prix", re.compile(r"\d[\d  .]*\s?(F\s?CFA|FCFA|Frcfa|Fcfa|francs)|\b\d{1,3}[  ]000\b", re.I)),
    ("administration", re.compile(r"administration", re.I)),
    ("prix (liste)", re.compile(r"prix en FCFA|Formations \(prix", re.I)),
]
alertes = 0
for p in plans:
    if p.get("source") != source:
        continue
    x, y0, l, h = p["cadre"]
    for image in ocr:
        if not (p["de"] - 0.3 <= image["t"] <= p["a"] + 0.3):
            continue
        for haut, bas, texte in image["lignes"]:
            if bas < y0 or haut > y0 + h:
                continue
            if any(fy <= haut and bas <= fy + fh for fx, fy, fw, fh in p.get("flous", [])):
                continue
            for nom, motif in MOTIFS:
                if motif.search(texte):
                    alertes += 1
                    print(f"{p['nom']}  t={image['t']:6.1f}  y={haut:4d}  {nom:<14} « {texte} »")
print(f"{alertes} alerte(s)")
