"""Prépare tout ce dont Remotion a besoin pour monter une vidéo.

Usage : python3 scripts/preparer.py <projet>
Entrées : projets/<projet>/source.mp4, mots.json (sortie de corriger.py), montage.json
Sorties : public/<projet>/video.mp4 (silences coupés, 1080 × 1920, 30 i/s)
          public/<projet>/props.json (mots recalés, groupes, passages animés, onde sonore)
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
LARGEUR, HAUTEUR = 1080, 1920
SILENCE_MIN = 0.6     # un silence plus long que ça est coupé
SEUIL_SILENCE_DB = -30
MARGE = 0.15          # on garde un peu de silence de chaque côté de la coupe
MOTS_PAR_GROUPE = 4
BANDES_ONDE = 12


def normaliser(mot):
    mot = mot.lower().replace("’", "'")
    return re.sub(r"[^\w'+éèêëàâäîïôöùûüç]", "", mot)


def sans_elision(mot):
    return re.sub(r"^(l|d|qu|j|c|n|s)'", "", normaliser(mot))


def duree(fichier):
    sortie = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                             "-of", "csv=p=0", str(fichier)], capture_output=True, text=True, check=True)
    return float(sortie.stdout)


def detecter_silences(source):
    sortie = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(source), "-af",
         f"silencedetect=noise={SEUIL_SILENCE_DB}dB:d={SILENCE_MIN}", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    debuts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", sortie)]
    fins = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", sortie)]
    return list(zip(debuts, fins))


def segments_gardes(silences, total):
    """Intervalles de la vidéo source conservés après la coupe des silences."""
    gardes, t = [], 0.0
    for debut, fin in silences:
        coupe_debut = debut + MARGE if debut > 0 else 0.0
        coupe_fin = fin - MARGE if fin < total else total
        if coupe_fin - coupe_debut <= 0:
            continue
        if coupe_debut > t:
            gardes.append((t, coupe_debut))
        t = coupe_fin
    if t < total:
        gardes.append((t, total))
    return gardes


def remapper(gardes):
    """Renvoie une fonction : temps source → temps dans la vidéo coupée."""
    def f(t):
        decale = 0.0
        for debut, fin in gardes:
            if t < debut:  # dans une coupe : on colle au début du segment suivant
                return decale
            if t <= fin:
                return decale + t - debut
            decale += fin - debut
        return decale
    return f


def couper_video(source, gardes, sortie):
    filtres, entrees = [], ""
    for i, (d, f) in enumerate(gardes):
        filtres.append(f"[0:v]trim={d}:{f},setpts=PTS-STARTPTS[v{i}]")
        fondu = min(0.02, (f - d) / 4)
        filtres.append(f"[0:a]atrim={d}:{f},asetpts=PTS-STARTPTS,"
                       f"afade=t=in:d={fondu},afade=t=out:st={f - d - fondu}:d={fondu}[a{i}]")
        entrees += f"[v{i}][a{i}]"
    filtres.append(f"{entrees}concat=n={len(gardes)}:v=1:a=1[v][a]")
    # Agrandit et recadre au format vertical en remplissant tout l'écran.
    filtres.append(f"[v]fps={FPS},scale={LARGEUR}:{HAUTEUR}:force_original_aspect_ratio=increase:flags=lanczos,"
                   f"crop={LARGEUR}:{HAUTEUR},unsharp=5:5:0.6[vf]")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(source),
                    "-filter_complex", ";".join(filtres), "-map", "[vf]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k", str(sortie)], check=True)


def calculer_onde(video, nb_images):
    """Amplitude de la voix par image et par bande de fréquence (0 à 100)."""
    taux = 16000
    brut = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(video), "-ac", "1", "-ar", str(taux),
                           "-f", "s16le", "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(brut, dtype=np.int16).astype(np.float32) / 32768
    fenetre = 1024
    limites = np.geomspace(90, 4000, BANDES_ONDE + 1)
    freqs = np.fft.rfftfreq(fenetre, 1 / taux)
    hann = np.hanning(fenetre)
    onde = []
    for i in range(nb_images):
        centre = int(i / FPS * taux)
        morceau = audio[max(0, centre - fenetre // 2): centre + fenetre // 2]
        morceau = np.pad(morceau, (0, fenetre - len(morceau)))
        spectre = np.abs(np.fft.rfft(morceau * hann))
        bandes = [spectre[(freqs >= a) & (freqs < b)].mean() for a, b in zip(limites[:-1], limites[1:])]
        db = 20 * np.log10(np.array(bandes) + 1e-6)
        onde.append(np.clip((db + 25) / 45, 0, 1))
    onde = np.array(onde)
    # Lissage dans le temps pour éviter le scintillement.
    for i in range(1, len(onde)):
        onde[i] = np.maximum(onde[i], onde[i - 1] * 0.75)
    return [[int(v * 100) for v in ligne] for ligne in onde]


def trouver(mots, phrase, a_partir=0):
    try:
        return chercher(mots, [normaliser(x) for x in phrase.split()], a_partir)
    except LookupError:
        pass
    try:  # un bloc affiché d'un seul tenant, comme un numéro de téléphone
        return chercher(mots, [normaliser(phrase)], a_partir)
    except LookupError:
        raise SystemExit(f"Ancre introuvable : « {phrase} » (après le mot n° {a_partir})")


def chercher(mots, jetons, a_partir):
    for i in range(a_partir, len(mots) - len(jetons) + 1):
        if all(normaliser(mots[i + k]["mot"]).startswith(j) if k == len(jetons) - 1
               else normaliser(mots[i + k]["mot"]) == j for k, j in enumerate(jetons)):
            return i, i + len(jetons) - 1
    raise LookupError


def resoudre_scenes(mots, config):
    scenes, curseur = [], 0
    for sc in config.get("scenes", []):
        i_debut, _ = trouver(mots, sc["debut"], curseur)
        _, i_fin = trouver(mots, sc["fin"], i_debut)
        curseur = i_fin + 1
        elements, c = [], i_debut
        for el in sc.get("elements", []):
            i, _ = trouver(mots, el["a"], c)
            if i > i_fin:
                raise SystemExit(f"« {el['a']} » est après la fin du passage « {sc['id']} »")
            c = i
            elements.append({**el, "debut": mots[i]["debut"]})
        scenes.append({**sc, "debut": mots[i_debut]["debut"],
                       "fin": mots[i_fin]["fin"] + sc.get("prolonger", 0.3),
                       "elements": elements, "i_debut": i_debut, "i_fin": i_fin})
    return scenes


def grouper(mots, coupures):
    """Groupes de 3 ou 4 mots, équilibrés, coupés en fin de phrase et aux bords des passages animés."""
    phrases, courant = [], []
    for i, m in enumerate(mots):
        courant.append(i)
        if m["mot"][-1] in ".?!" or (i + 1) in coupures:
            phrases.append(courant)
            courant = []
    if courant:
        phrases.append(courant)

    groupes = []
    for phrase in phrases:
        n = len(phrase)
        k = -(-n // MOTS_PAR_GROUPE)  # nombre de groupes
        bornes = [round(j * n / k) for j in range(k + 1)]
        # Déplace une coupure d'un mot si ça permet de couper juste après une virgule.
        for j in range(1, k):
            for d in (0, -1, 1):
                b = bornes[j] + d
                taille_ok = b - bornes[j - 1] <= MOTS_PAR_GROUPE and bornes[j + 1] - b <= MOTS_PAR_GROUPE
                if taille_ok and bornes[j - 1] + 2 <= b <= bornes[j + 1] - 2 and mots[phrase[b - 1]]["mot"][-1] in ",:;":
                    bornes[j] = b
                    break
        groupes += [phrase[bornes[j]:bornes[j + 1]] for j in range(k)]
    return groupes


def main():
    nom = sys.argv[1]
    projet = ROOT / "projets" / nom
    sortie = ROOT / "public" / nom
    sortie.mkdir(parents=True, exist_ok=True)
    config = json.loads((projet / "montage.json").read_text())
    mots = json.loads((projet / "mots.json").read_text())
    source = projet / "source.mp4"

    total = duree(source)
    silences = [s for s in detecter_silences(source)]
    gardes = segments_gardes(silences, total)
    temps = remapper(gardes)
    coupe = total - sum(f - d for d, f in gardes)
    print(f"{len(silences)} silences coupés ({coupe:.1f} s retirées), {len(gardes)} segments gardés")

    scenes = resoudre_scenes(mots, config)

    video = sortie / "video.mp4"
    couper_video(source, gardes, video)
    nb_images = int(duree(video) * FPS)

    cles = {sans_elision(k) for k in config.get("motsCles", [])}
    mots_sortie = []
    for m in mots:
        debut = temps(m["debut"])
        mots_sortie.append({"mot": m["mot"], "debut": round(debut * FPS),
                            "fin": round(max(temps(m["fin"]), debut + 0.05) * FPS),
                            "cle": sans_elision(m["mot"]) in cles})
    # Les mots-clés de plusieurs mots (« IA School ») : on marque chaque mot.
    for k in config.get("motsCles", []):
        parties = k.split()
        if len(parties) > 1:
            for i in range(len(mots) - len(parties) + 1):
                if [sans_elision(mots[i + j]["mot"]) for j in range(len(parties))] == [sans_elision(p) for p in parties]:
                    for j in range(len(parties)):
                        mots_sortie[i + j]["cle"] = True

    coupures = {s["i_debut"] for s in scenes} | {s["i_fin"] + 1 for s in scenes}
    groupes = grouper(mots, coupures)

    scenes_sortie = []
    for s in scenes:
        scenes_sortie.append({
            **{k: v for k, v in s.items() if k not in ("i_debut", "i_fin", "a")},
            "debut": round(temps(s["debut"]) * FPS),
            "fin": round(temps(s["fin"]) * FPS),
            "elements": [{**{k: v for k, v in e.items() if k != "a"}, "debut": round(temps(e["debut"]) * FPS)}
                         for e in s["elements"]],
        })

    props = {
        "video": f"{nom}/video.mp4",
        "dureeImages": nb_images,
        "titre": config.get("titre"),
        "mots": mots_sortie,
        "groupes": groupes,
        "scenes": scenes_sortie,
        "onde": calculer_onde(video, nb_images),
    }
    (sortie / "props.json").write_text(json.dumps(props, ensure_ascii=False, separators=(",", ":")))
    print(f"Vidéo coupée : {nb_images / FPS:.1f} s, {len(groupes)} groupes de sous-titres, {len(scenes)} passages animés")
    for s in scenes_sortie:
        print(f"  {s['id']:<10} {s['debut'] / FPS:6.1f} s → {s['fin'] / FPS:6.1f} s")


if __name__ == "__main__":
    main()
