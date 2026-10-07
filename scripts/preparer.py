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
MARGE_DEBUT = 0.03    # au tout début : la première parole doit arriver dans les 0,2 premières secondes
# Ouverture : cadrage qui change toutes les ~1,5 s pendant les 5 premières secondes.
OUVERTURE = 5 * FPS
PAS_LIGNES_TITRE = 5  # images entre deux lignes du titre d'accroche (titre complet lisible en < 0,5 s)
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


def segments_gardes(silences, total, coupes=()):
    """Intervalles de la vidéo source conservés après la coupe des silences (avec marges) et des
    coupes exactes (`coupes` : mots retirés, passages coupés à la main)."""
    retraits = []
    for debut, fin in silences:
        coupe_debut = debut + MARGE if debut > 0 else 0.0
        coupe_fin = fin - (MARGE_DEBUT if debut == 0 else MARGE) if fin < total else total
        if coupe_fin > coupe_debut:
            retraits.append((coupe_debut, coupe_fin))
    retraits = sorted(retraits + [tuple(c) for c in coupes])
    gardes, t = [], 0.0
    for debut, fin in retraits:
        if debut > t + 0.02:
            gardes.append((t, debut))
        t = max(t, fin)
    if t < total:
        gardes.append((t, total))
    return gardes


def enveloppe_db(source):
    """Niveau sonore de la source par tranches de 10 ms (dB)."""
    brut = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(source), "-ac", "1", "-ar", "16000",
                           "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(brut, np.float32)
    pas = 160
    n = len(x) // pas
    return 20 * np.log10(np.sqrt((x[:n * pas].reshape(n, pas) ** 2).mean(axis=1)) + 1e-9)


def point_calme(env, a, b):
    """Instant le plus silencieux entre a et b (secondes) et son niveau."""
    i, j = int(a * 100), max(int(a * 100) + 1, int(b * 100))
    k = i + int(np.argmin(env[i:j]))
    return k / 100, float(env[k])


def couper_mots(mots, demandes, env):
    """Retire des mots (« ok ? », « donc » répétés…) : coupe image et son au point le plus silencieux
    autour de chaque mot, puis réajuste la ponctuation. Renvoie (mots restants, coupes, journal)."""
    a_retirer, coupes, journal = set(), [], []
    for d in demandes:
        candidats = [i for i, m in enumerate(mots) if normaliser(m["mot"]).startswith(normaliser(d["mot"]))
                     and abs(m["debut"] - d["vers"]) < 1.0]
        if not candidats:
            raise SystemExit(f"Mot à couper introuvable : {d}")
        i = min(candidats, key=lambda i: abs(mots[i]["debut"] - d["vers"]))
        j = i + d.get("nombre", 1) - 1
        avant = mots[i - 1]["fin"] if i > 0 else 0.0
        apres = mots[j + 1]["debut"] if j + 1 < len(mots) else mots[j]["fin"] + 0.3
        # Point de coupe cherché entre la fin du mot gardé et le début du mot retiré (et inversement) :
        # jamais dans un mot gardé.
        t1, n1 = point_calme(env, avant, max(avant + 0.02, mots[i]["debut"] + 0.08))
        t2, n2 = point_calme(env, min(mots[j]["fin"] - 0.08, apres - 0.02), apres)
        if "coupe" in d:  # points de coupe vérifiés à la main (Whisper peut se tromper de 0,2 s)
            (t1, t2) = d["coupe"]
            n1, n2 = point_calme(env, t1, t1 + 0.01)[1], point_calme(env, t2, t2 + 0.01)[1]
        coupes.append((t1, t2))
        a_retirer.update(range(i, j + 1))
        texte = " ".join(m["mot"] for m in mots[i:j + 1])
        journal.append(f"{mots[i]['debut']:6.2f} s « {texte} » : coupe {t1:.2f}–{t2:.2f} s, "
                       f"niveau aux points de coupe {n1:.0f} / {n2:.0f} dB")
    restants = []
    for i, m in enumerate(mots):
        if i in a_retirer:
            # Ponctuation : un mot retiré qui finissait la phrase la reporte sur le mot précédent.
            if fin_phrase(m["mot"]) and restants and restants[-1]["mot"][-1] in ",;:":
                restants[-1] = {**restants[-1], "mot": restants[-1]["mot"][:-1] + "."}
            continue
        # Après une coupe, un mot qui ouvre la phrase prend la majuscule.
        if i - 1 in a_retirer and (not restants or fin_phrase(restants[-1]["mot"])):
            m = {**m, "mot": m["mot"][:1].upper() + m["mot"][1:]}
        restants.append(m)
    return restants, coupes, journal


def remapper(gardes, insertion=None):
    """Renvoie une fonction : temps source → temps dans la vidéo coupée. `insertion` = (instant source,
    durée) : un extrait d'une autre vidéo est inséré à cet instant (il doit tomber à la fin d'un segment gardé)."""
    def f(t):
        decale = 0.0
        for debut, fin in gardes:
            if insertion and debut >= insertion[0] - 1e-6:
                decale_ins = insertion[1]
            else:
                decale_ins = 0.0
            if t < debut:  # dans une coupe : on colle au début du segment suivant
                return decale + decale_ins
            if t <= fin:
                return decale + decale_ins + t - debut
            decale += fin - debut
        return decale + (insertion[1] if insertion else 0.0)
    return f


def gain_segment(d, f, gains):
    """Gain (dB) d'un segment : celui de la zone `gains` qui le contient, sinon 0."""
    for a, b, g in gains:
        if d >= a - 1e-6 and f <= b + 1e-6:
            return g
    return 0.0


def couper_video(source, gardes, sortie, insertion=None, cadrage=None, gains=()):
    """Assemble les segments gardés (et l'extrait inséré), au format 1080 × 1920.
    `cadrage` : à partir de `apres` (s, source), cadre serré : agrandi de `echelle`, recadré à partir de `x`,
    descendu de `decalage` px ; la bande libérée en haut est remplie par l'image floutée."""
    filtres, entrees, n = [], "", 0
    norme = (f"fps={FPS},scale={LARGEUR}:{HAUTEUR}:force_original_aspect_ratio=increase:flags=lanczos,"
             f"crop={LARGEUR}:{HAUTEUR},setsar=1")

    def ajouter(entree, d, f, gain_db, serre):
        nonlocal entrees, n
        v = f"[{entree}:v]trim={d}:{f},setpts=PTS-STARTPTS,{norme}"
        if serre:
            e, dy = cadrage["echelle"], cadrage["decalage"]
            l, h = round(LARGEUR * e / 2) * 2, round(HAUTEUR * e / 2) * 2
            filtres.append(f"{v},split[fond{n}][avant{n}]")
            filtres.append(f"[fond{n}]boxblur=40:4,eq=brightness=-0.04[flou{n}]")
            filtres.append(f"[avant{n}]scale={l}:{h}:flags=lanczos,crop={LARGEUR}:{HAUTEUR - dy}:{cadrage['x']}:0[net{n}]")
            filtres.append(f"[flou{n}][net{n}]overlay=0:{dy}[v{n}]")
        else:
            filtres.append(f"{v}[v{n}]")
        fondu = min(0.02, (f - d) / 4)
        filtres.append(f"[{entree}:a]atrim={d}:{f},asetpts=PTS-STARTPTS,aresample=48000,volume={gain_db}dB,"
                       f"afade=t=in:d={fondu},afade=t=out:st={f - d - fondu}:d={fondu}[a{n}]")
        entrees += f"[v{n}][a{n}]"
        n += 1

    for d, f in gardes:
        if insertion and abs(d - insertion["apres"]) < 1e-6 and not insertion.get("_fait"):
            ajouter(1, insertion["debut"], insertion["debut"] + insertion["duree"], insertion.get("gainDb", 0), False)
            insertion["_fait"] = True
        serre = bool(cadrage) and d >= cadrage["apres"] - 1e-6
        ajouter(0, d, f, gain_segment(d, f, gains), serre)
    filtres.append(f"{entrees}concat=n={n}:v=1:a=1[v][a]")
    filtres.append("[v]unsharp=5:5:0.4[vf]")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(source)]
    if insertion:
        cmd += ["-i", str(insertion["chemin"])]
    subprocess.run(cmd + ["-filter_complex", ";".join(filtres), "-map", "[vf]", "-map", "[a]",
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


def isole(mot):
    """Un numéro de téléphone s'affiche seul sur sa ligne."""
    return re.fullmatch(r"\+?[\d ]{8,}[.,!?]?", mot) is not None


def fin_phrase(mot):
    return mot[-1] in ".?!"


def grouper(mots, coupures):
    """Groupes de 3 ou 4 mots, équilibrés, coupés en fin de phrase et aux bords des passages animés."""
    phrases, courant = [], []
    for i, m in enumerate(mots):
        if isole(m["mot"]) and courant:
            phrases.append(courant)
            courant = []
        courant.append(i)
        if fin_phrase(m["mot"]) or (i + 1) in coupures or isole(m["mot"]) or (i + 1 < len(mots) and isole(mots[i + 1]["mot"])):
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

    # Pas de groupe d'un seul mot, sauf une phrase d'un mot ou un numéro : on le rattache au voisin.
    def seul_autorise(i):
        phrase_entiere = (i == 0 or fin_phrase(mots[i - 1]["mot"])) and fin_phrase(mots[i]["mot"])
        return phrase_entiere or isole(mots[i]["mot"])

    k = 0
    while k < len(groupes):
        g = groupes[k]
        if len(g) == 1 and not seul_autorise(g[0]):
            i = g[0]
            avant = (k > 0 and i not in coupures and not fin_phrase(mots[i - 1]["mot"])
                     and not isole(mots[i - 1]["mot"]))
            apres = (k + 1 < len(groupes) and (i + 1) not in coupures and not fin_phrase(mots[i]["mot"])
                     and not isole(mots[i + 1]["mot"]))
            if avant and (not apres or len(groupes[k - 1]) <= len(groupes[k + 1])):
                groupes[k - 1] += g
                del groupes[k]
                continue
            if apres:
                groupes[k + 1] = g + groupes[k + 1]
                del groupes[k]
                continue
        k += 1
    return groupes


def plans_zoom(mots, images, reprise=None):
    """Images où le cadrage alterne : débuts de phrase et mots après une virgule, en visant un
    changement toutes les 3 à 4 s, jamais plus de 5 s sans changement. Pendant l'ouverture (5 premières
    secondes), un changement toutes les ~1,5 s. `reprise` = (début, fin) d'un extrait inséré : le cadre
    redevient normal pendant l'extrait et l'alternance reprend 3 à 5 s après son retour."""
    candidats = [images[i] for i in range(1, len(mots)) if mots[i - 1]["mot"][-1] in ".?!,;:"]
    tous = sorted(set(images))
    plans, dernier, ouverture = [0], 0, OUVERTURE
    if reprise:
        d, f = reprise
        plans = [0, d, d + 1]  # 2 changements invisibles pendant l'extrait : retour en cadre normal
        dernier, ouverture = f, 0
        candidats = [c for c in candidats if c >= f]
        tous = [t for t in tous if t >= f]
    while True:
        if dernier < ouverture:
            mini, cible, maxi = 1.2 * FPS, 1.5 * FPS, 1.8 * FPS
        else:
            mini, cible, maxi = 3 * FPS, 3.5 * FPS, 5 * FPS
        possibles = [c for c in candidats if dernier + mini <= c <= dernier + maxi]
        if possibles:
            choix = min(possibles, key=lambda c: abs(c - dernier - cible))
        else:
            # Pas de ponctuation au bon moment : on change au début d'un mot, au plus près de la cible
            # (4 s en rythme normal).
            vise = cible if dernier < ouverture else 4 * FPS
            mots_possibles = [t for t in tous if dernier + mini <= t <= dernier + maxi]
            suivants = [t for t in tous if t >= dernier + mini]
            if not suivants:
                break
            choix = min(mots_possibles, key=lambda t: abs(t - dernier - vise)) if mots_possibles else suivants[0]
        plans.append(choix)
        dernier = choix
    return plans


def mots_titre(titre):
    """Lignes du titre d'accroche avec l'image où chacune claque (une toutes les 5 images).
    Une ponctuation isolée (« ? ») reste collée au mot précédent (espace insécable)."""
    lignes = []
    for l, ligne in enumerate(titre["lignes"]):
        texte = re.sub(r"\s+([?!:;])", "\u00a0\\1", ligne.strip())
        lignes.append({"texte": texte, "ligne": l, "image": l * PAS_LIGNES_TITRE})
    return lignes


def jetons_significatifs(texte):
    """Mots qui comptent pour repérer un doublon (on ignore « à », « de », « la »… mais pas les chiffres)."""
    jetons = [sans_elision(t).strip("+'") for t in texte.replace("\n", " ").split()]
    return [t for t in jetons if t and (len(t) > 2 or t.isdigit())]


def groupes_masques(mots, groupes, scenes):
    """Groupes de sous-titres qui répètent mot pour mot le texte affiché en grand dans un plein écran."""
    masques = []
    for k, g in enumerate(groupes):
        debut = mots[g[0]]["debut"]
        for s in scenes:
            if s["disposition"] == "panneau" or not (s["debut"] <= debut < s["fin"]):
                continue
            affiche = " ".join([s.get("titre", "")] + [e.get("texte", "") for e in s["elements"]])
            jetons = jetons_significatifs(" ".join(mots[i]["mot"] for i in g))
            if jetons and set(jetons) <= set(jetons_significatifs(affiche)):
                masques.append(k)
    return masques


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

    # Mots retirés image et son (« ok ? », « donc » répétés), passages coupés à la main,
    # et passages gardés à l'image mais sans sous-titres (ex. le son d'une tablette).
    coupes = [tuple(c) for c in config.get("coupes", [])]
    if config.get("couperMots"):
        mots, coupes_mots, journal = couper_mots(mots, config["couperMots"], enveloppe_db(source))
        coupes += coupes_mots
        print("Mots coupés :\n  " + "\n  ".join(journal))
    hors = [tuple(c) for c in config.get("sansSousTitres", []) + config.get("coupes", [])]
    mots = [m for m in mots if not any(a <= m["debut"] < b for a, b in hors)]

    gardes = segments_gardes(silences, total, coupes)
    insertion = None
    if config.get("preuve"):
        insertion = {**config["preuve"], "chemin": projet / config["preuve"]["fichier"]}
        if not any(abs(d - insertion["apres"]) < 1e-6 for d, _ in gardes):
            raise SystemExit("La preuve doit être insérée au début d'un segment gardé (ajouter une coupe qui finit là)")
    temps = remapper(gardes, (insertion["apres"], insertion["duree"]) if insertion else None)
    coupe = total - sum(f - d for d, f in gardes)
    print(f"{len(silences)} silences et {len(coupes)} coupes ({coupe:.1f} s retirées), {len(gardes)} segments gardés")

    scenes = resoudre_scenes(mots, config)

    # La coupe prend quelques minutes : on la saute si la source et les coupes n'ont pas changé.
    video = sortie / "video.mp4"
    empreinte = {"source": source.stat().st_mtime, "taille": source.stat().st_size, "gardes": gardes,
                 "preuve": config.get("preuve"), "cadrage": config.get("cadrage"), "gains": config.get("gains")}
    cache = sortie / "coupes.json"
    if video.exists() and cache.exists() and json.loads(cache.read_text()) == json.loads(json.dumps(empreinte)):
        print("Vidéo coupée déjà à jour, coupe sautée")
    else:
        couper_video(source, gardes, video, insertion, config.get("cadrage"), config.get("gains", []))
        cache.write_text(json.dumps(empreinte))
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

    # Carton de fin : il démarre 6 images avant la fin de la vidéo (le son baisse pendant la transition).
    carton = None
    if config.get("carton"):
        c = config["carton"]
        debut = nb_images - 6
        carton = {"debut": debut, "fin": debut + round(c.get("duree", 3) * FPS), "fond": c.get("fond", "nuit"),
                  "titre": c["titre"], "lignes": c["lignes"]}

    # Preuve (extrait inséré) et position du visage pour chaque cadrage (centre du zoom).
    preuve = None
    if insertion:
        d = round((temps(insertion["apres"]) - insertion["duree"]) * FPS)  # l'extrait précède l'instant « apres »
        preuve = {"debut": d, "fin": d + round(insertion["duree"] * FPS), "etiquette": insertion["etiquette"]}
    cadres = [{"debut": 0, **config.get("visage", {"x": 540, "y": 760})}]
    if config.get("cadrage"):
        cadres.append({"debut": round(temps(config["cadrage"]["apres"]) * FPS), **config["cadrage"]["visage"]})

    props = {
        "video": f"{nom}/video.mp4",
        "dureeImages": carton["fin"] if carton else nb_images,
        "carton": carton,
        "titre": {**config["titre"], "mots": mots_titre(config["titre"])} if config.get("titre") else None,
        "mots": mots_sortie,
        "groupes": groupes,
        "plans": plans_zoom(mots, [m["debut"] for m in mots_sortie], (preuve["debut"], preuve["fin"]) if preuve else None),
        "preuve": preuve,
        "cadres": cadres,
        "masques": groupes_masques(mots_sortie, groupes, scenes_sortie),
        "dureeVideo": nb_images,
        "scenes": scenes_sortie,
        "onde": calculer_onde(video, nb_images),
    }
    (sortie / "props.json").write_text(json.dumps(props, ensure_ascii=False, separators=(",", ":")))
    print(f"Vidéo coupée : {nb_images / FPS:.1f} s, {len(groupes)} groupes de sous-titres, {len(scenes)} passages animés")
    for s in scenes_sortie:
        print(f"  {s['id']:<10} {s['debut'] / FPS:6.1f} s → {s['fin'] / FPS:6.1f} s")


if __name__ == "__main__":
    main()
