"""Ajoute au plan les vidéos libres de droits (Pixabay) : en fond assombri des cartes, ou en second plan des images.

Usage : python3 projets/diplome-togo/ajouter_videos.py <dossier du lancement>
Vidéos dans public/test-auto/stock/ (recadrées en 1080 × 1920), sources dans <dossier>/sources_videos.json.
"""
import json
import sys
from pathlib import Path

FOND = {5: "bougie_1", 6: "route_2", 9: "bougie_5", 19: "pluie_2", 24: "nuages_0", 29: "echecs_3", 30: "porte_0",
        33: "bougie_1", 36: "foule_4", 40: "horloge_3", 41: "livres_0", 44: "sablier_1", 49: "echecs_2",
        51: "ampoule_0", 52: "escalier_2", 53: "escalier_2", 54: "course_5", 58: "lever_2", 60: "route_1",
        62: "bougie_0", 64: "nuages_4", 69: "course_2"}
SECOND = {7: "ecrire_1", 10: "foule_3", 11: "pluie_0", 23: "plage_1", 32: "horloge_1", 35: "pluie_5", 45: "nuit_2",
          50: "course_0", 55: "ecrire_3", 57: "route_1", 59: "nuages_3", 66: "lever_3"}
d = Path(sys.argv[1])
plan = json.loads((d / "plan.json").read_text())
for i, n in FOND.items():
    plan["scenes"][i]["fondVideo"] = f"test-auto/stock/{n}.mp4"
for i, n in SECOND.items():
    assert plan["scenes"][i]["type"] == "photo", i
    plan["scenes"][i]["fichier2"] = f"test-auto/stock/{n}.mp4"
(d / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=1))
print(len(FOND), "fonds vidéo,", len(SECOND), "seconds plans")
