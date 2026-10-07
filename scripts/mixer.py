"""Mixe la bande son : voix + musique (baissée sous la voix) + effets sonores calés sur l'image.

Usage : python3 scripts/mixer.py <projet>          (après preparer.py)
Entrées : public/<projet>/video.mp4 (voix), public/<projet>/props.json (événements),
          sons/musique.json + musique, sons/effets/*.wav (python3 scripts/sons.py)
Sorties : public/<projet>/mix.wav (utilisé par scripts/rendre.sh)
          projets/<projet>/sons.md (niveaux mesurés et liste des effets avec leur moment exact)
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
FPS = 30
ECH_PAR_IMAGE = SR // FPS  # 1600 : chaque image tombe sur un échantillon exact

VOIX_LUFS = -16.0      # voix normalisée avant mixage
SORTIE_LUFS = -14.0    # niveau final (réseaux sociaux)
CRETE_MAX_DB = -2.0    # limiteur de crête : marge pour l’encodage AAC (crête vraie finale sous −1 dBTP)

# Musique, en LU par rapport à la voix : très basse quand il parle, remonte dans les silences,
# un peu plus haute en plein écran, et sur le carton de fin.
MUSIQUE = {"parle": -16.0, "parle_plein_ecran": -10.0, "silence": -12.0, "carton": -10.0}
FONDU_ENTREE = 0.0  # aucun démarrage en douceur : la musique part franchement à la première image

# Effets : niveau (sonie de l'effet, en LU par rapport à la voix) — toujours sous la voix.
EFFETS = {
    "ouverture": -2.0, "mot": -11.0, "info": -6.0, "carton": -5.0, "plein_ecran": -9.0,
    "croix": -10.0, "coche": -10.0, "panneau": -13.0, "zoom": -22.0,
    "transition": -12.0, "autocollant": -12.0,  # style dynamique
}
# Priorité quand deux effets tomberaient presque ensemble : on ne garde que le plus important.
PRIORITE = {"ouverture": 7, "carton": 6, "mot": 3, "transition": 3, "autocollant": 3, "info": 5, "plein_ecran": 4, "croix": 3, "coche": 3, "panneau": 2, "zoom": 1}
ECART_MIN = 8  # images (≈ 0,27 s) entre deux effets, pour ne jamais les empiler
# Les animations partent de 0 (opacité, ouverture du cercle, zoom) sur leur image de départ :
# l'élément n'est visible qu'à l'image suivante. L'effet tombe sur cette première image visible.
DECALAGE_VISIBLE = 1


def lire_audio(fichier, duree=None):
    cmd = ["ffmpeg", "-loglevel", "error", "-i", str(fichier), "-vn", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    brut = subprocess.run(cmd, capture_output=True, check=True).stdout
    x = np.frombuffer(brut, np.float32).reshape(-1, 2).astype(np.float64)
    if duree is not None:
        n = int(duree * SR)
        x = np.pad(x, ((0, max(0, n - len(x))), (0, 0)))[:n]
    return x


def db(g):
    return 10 ** (g / 20)


def sonie(x, mesure):
    """Sonie intégrée (LUFS). Un son court est complété de silence pour être mesurable."""
    if len(x) < int(0.5 * SR):
        x = np.pad(x, ((0, int(0.5 * SR) - len(x)), (0, 0)))
    return mesure.integrated_loudness(x)


def sonie_attaque(x, mesure):
    """Sonie des 0,4 s les plus fortes de l'effet : ce que l'oreille retient (l'impact, pas la traîne ni
    une montée qui le précède)."""
    fen, pas = int(0.4 * SR), int(0.05 * SR)
    return max(sonie(x[i:i + fen], mesure) for i in range(0, max(1, len(x) - fen + 1), pas))


def boucler(musique, n, fondu=1.5):
    """Répète la musique jusqu'à n échantillons, avec un fondu enchaîné à chaque raccord."""
    f = int(fondu * SR)
    sortie = musique.copy()
    rampe = np.linspace(0, 1, f)[:, None]
    while len(sortie) < n:
        raccord = sortie[-f:] * (1 - rampe) + musique[:f] * rampe
        sortie = np.concatenate([sortie[:-f], raccord, musique[f:]])
    return sortie[:n]


def activite_voix(voix):
    """Masque « il parle » par tranches de 10 ms, avec maintien de 250 ms pour ne pas pomper entre les mots."""
    pas = SR // 100
    m = voix.mean(axis=1)
    rms = np.sqrt(np.array([np.mean(m[i:i + pas] ** 2) for i in range(0, len(m) - pas + 1, pas)]) + 1e-12)
    rms_db = 20 * np.log10(rms)
    seuil = np.percentile(rms_db, 90) - 28
    actif = rms_db > seuil
    maintien = 25
    for i in np.where(actif)[0]:
        actif[i:i + maintien] = True
    return actif


def lisser_db(cible_db, attaque=0.06, relache=0.45):
    """Lissage d'une courbe de gain (en dB, par tranches de 10 ms) : baisse rapide, remontée lente."""
    sortie = np.empty_like(cible_db)
    courant = cible_db[0]
    a, r = np.exp(-0.01 / attaque), np.exp(-0.01 / relache)
    for i, c in enumerate(cible_db):
        k = a if c < courant else r
        courant = k * courant + (1 - k) * c
        sortie[i] = courant
    return sortie


def evenements(props):
    """Liste (image, type, description) de tout ce qui apparaît à l'écran."""
    ev = []
    # Ouverture : impact puissant sur la première image (premier mot du titre), puis un claquement
    # par mot du titre d'accroche.
    if props.get("titre"):
        for k, m in enumerate(props["titre"]["mots"]):
            ev.append((m["image"], "ouverture" if k == 0 else "mot", f"Titre d'accroche : {m['texte']}"))
    for s in props["scenes"]:
        if s["disposition"] == "panneau":
            for k, e in enumerate(s["elements"]):
                image = s["debut"] if k == 0 else e["debut"]
                quoi = e.get("marque") or "panneau"
                ev.append((image, quoi, f"Panneau « {s.get('titre') or s['id']} » : {e.get('texte', '')}"))
        else:
            premier = s["elements"][0] if s["elements"] else None
            info_au_debut = s["disposition"] == "focus" and premier and premier["debut"] - s["debut"] <= 3
            if not info_au_debut:
                ev.append((s["debut"], "plein_ecran", f"Plein écran « {s['id']} »"))
            for k, e in enumerate(s["elements"]):
                image = s["debut"] if (k == 0 and info_au_debut) else e["debut"]
                if s["disposition"] == "focus":
                    ev.append((image, "info", f"Info : {e.get('texte', '').replace(chr(10), ' ')}"))
                elif k > 0:
                    ev.append((image, "panneau", f"Plein écran « {s['id']} » : {e.get('texte', '')}"))
    carton = props.get("carton")
    if carton:
        ev.append((carton["debut"], "carton", "Carton de fin"))
    preuve = props.get("preuve")
    if preuve:  # extrait inséré : souffle + impact quand l'étiquette claque
        ev.append((preuve["debut"], "plein_ecran", f"Preuve : {preuve['etiquette']}"))
    # Style dynamique : un son par transition, par autocollant, par mot doré, carton noir et numéro.
    dyn = props.get("dynamique")
    if dyn:
        for t in dyn["transitions"]:
            # Le souffle culmine 5 images après son départ : il tombe pile sur la coupe.
            ev.append((t["image"] - 5 - DECALAGE_VISIBLE, "transition", f"Transition : {t['type']}"))
        for a in dyn["autocollants"]:
            quoi = a["type"] if a["type"] in ("croix", "coche") else "autocollant"
            ev.append((a["debut"], quoi, f"Autocollant : {a['type']}"))
        for d in dyn["dores"]:
            ev.append((d["debut"], "info", f"Doré : {d['texte'].replace(chr(10), ' ')}"))
        for c in dyn["cartonsNoirs"]:
            ev.append((c["debut"], "plein_ecran", f"Carton noir : {c['texte']}"))
        if dyn.get("numero"):
            ev.append((dyn["numero"]["debut"], "info", f"Numéro : {dyn['numero']['texte']}"))
        # Scène illustrée : souffle + impact à l'entrée, puis un son par étape (croix, coche, pop…) si demandé.
        for sc in dyn.get("illustrations", []):
            ev.append((sc["debut"], "plein_ecran", f"Scène illustrée « {sc['type']} »"))
            for image, quoi in zip(sc["etapes"], sc.get("sons", [])):
                if quoi:
                    ev.append((image, quoi, f"Scène « {sc['type']} » : étape"))
    # Changements de cadrage, seulement quand le visage est à l'écran.
    caches = [(s["debut"], s["fin"]) for s in props["scenes"] if s["disposition"] != "panneau"]
    if preuve:
        caches.append((preuve["debut"], preuve["fin"]))
    if carton:
        caches.append((carton["debut"], carton["fin"]))
    for image in props.get("plans", [])[1:]:
        if not any(a - 4 <= image < b + 4 for a, b in caches):
            ev.append((image, "zoom", "Changement de cadrage"))

    # Un seul effet à la fois : si deux effets sont trop proches, on garde le plus important.
    # Exception : les lignes du titre d'accroche (une toutes les 5 images) ont chacune leur claquement.
    ev.sort(key=lambda e: (e[0], -PRIORITE[e[1]]))
    titre = ("ouverture", "mot")
    garde = []
    for e in ev:
        proches = [g for g in garde if abs(g[0] - e[0]) < ECART_MIN and not (e[1] in titre and g[1] in titre)]
        if not proches:
            garde.append(e)
        elif all(PRIORITE[e[1]] > PRIORITE[g[1]] for g in proches):
            for g in proches:
                garde.remove(g)
            garde.append(e)
    garde.sort()
    ecartes = [e for e in ev if e not in garde]
    # Les mots du titre sont visibles dès leur image (ils claquent en grand, sans fondu) ;
    # tout le reste apparaît une image après son départ.
    visible = [(i if q in ("ouverture", "mot") else i + DECALAGE_VISIBLE, q, t) for i, q, t in garde]
    return visible, ecartes


def temps(image):
    s = image / FPS
    return f"{int(s // 60)}:{s % 60:05.2f}"


def main():
    nom = sys.argv[1]
    public = ROOT / "public" / nom
    props = json.loads((public / "props.json").read_text())
    total = props["dureeImages"] / FPS
    n = props["dureeImages"] * ECH_PAR_IMAGE
    mesure = pyln.Meter(SR)

    # Voix : normalisée, puis fondu sur la dernière demi-seconde avant le carton de fin.
    voix = lire_audio(public / "video.mp4", total)
    voix *= db(VOIX_LUFS - sonie(voix[:props["dureeVideo"] * ECH_PAR_IMAGE], mesure))
    fin_voix = props["dureeVideo"] * ECH_PAR_IMAGE
    voix[fin_voix - 15 * ECH_PAR_IMAGE:fin_voix] *= np.linspace(1, 0, 15 * ECH_PAR_IMAGE)[:, None]
    voix[fin_voix:] = 0

    # Musique : en boucle, ramenée à la voix, puis courbe de gain (baisse sous la voix).
    config = json.loads((ROOT / "sons" / "musique.json").read_text())
    musique = lire_audio(ROOT / "sons" / config["fichier"])
    musique_lufs = sonie(musique, mesure)
    musique = boucler(musique, n) * db(VOIX_LUFS - musique_lufs)

    actif = activite_voix(voix)
    tranches = len(actif)
    cible = np.full(tranches, MUSIQUE["silence"])
    plein_ecran = np.zeros(tranches, bool)
    for s in props["scenes"]:
        if s["disposition"] != "panneau":
            plein_ecran[int(s["debut"] / FPS * 100):int(s["fin"] / FPS * 100)] = True
    cible[actif] = MUSIQUE["parle"]
    cible[actif & plein_ecran] = MUSIQUE["parle_plein_ecran"]
    if props.get("preuve"):  # l'extrait a déjà sa musique : la nôtre s'efface pendant qu'il passe
        pr = props["preuve"]
        cible[int(pr["debut"] / FPS * 100):int(pr["fin"] / FPS * 100)] = -45.0
    carton = props.get("carton")
    if carton:
        # La musique remonte dès que la voix s'éteint (15 images avant le carton).
        cible[int((carton["debut"] - 9) / FPS * 100):] = MUSIQUE["carton"]
    gain_db = lisser_db(cible)
    gain = np.repeat(db(gain_db), SR // 100)
    gain = np.pad(gain, (0, max(0, n - len(gain))), mode="edge")[:n]
    if FONDU_ENTREE:
        gain[:int(FONDU_ENTREE * SR)] *= np.linspace(0, 1, int(FONDU_ENTREE * SR))
    if carton:  # carton : 1 s au niveau « carton », puis fondu de sortie jusqu'à la dernière image
        d = carton["debut"] * ECH_PAR_IMAGE + SR
        gain[d:] *= np.linspace(1, 0, n - d) ** 1.5
    musique *= gain[:, None]

    # Effets : chacun démarre exactement sur l'échantillon de son image.
    garde, ecartes = evenements(props)
    effets = np.zeros((n, 2))
    cache = {}
    for image, quoi, _ in garde:
        if quoi not in cache:
            sr, x = wavfile.read(ROOT / "sons" / "effets" / f"{quoi}.wav")
            x = x.astype(np.float64) / 32767
            cache[quoi] = x * db(VOIX_LUFS + EFFETS[quoi] - sonie_attaque(x, mesure))
        x = cache[quoi]
        i = image * ECH_PAR_IMAGE
        fin = min(n, i + len(x))
        effets[i:fin] += x[:fin - i]

    # Somme, niveau final, puis limiteur de crête (ffmpeg) pour éviter toute saturation.
    mix = voix + musique + effets
    gain_final = db(SORTIE_LUFS - sonie(mix, mesure))
    brut = public / "mix_brut.wav"
    wavfile.write(brut, SR, (mix * gain_final).astype(np.float32))
    sortie = public / "mix.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(brut), "-af",
                    f"alimiter=limit={db(CRETE_MAX_DB - 0.5):.4f}:attack=3:release=60:level=disabled,"
                    f"aresample=192000,alimiter=limit={db(CRETE_MAX_DB - 0.3):.4f}:attack=1:release=30:level=disabled,"
                    f"aresample={SR}", "-c:a", "pcm_s24le", str(sortie)], check=True)
    brut.unlink()

    # Mesures : chaque piste seule (au gain final), et le mix.
    final = lire_audio(sortie, total)
    pistes = {"voix": voix * gain_final, "musique": musique * gain_final, "effets": effets * gain_final}
    parle = np.repeat(actif, SR // 100)
    parle = np.pad(parle, (0, max(0, n - len(parle))))[:n]
    fin_v = fin_voix
    l_voix = sonie(pistes["voix"][:fin_v], mesure)
    l_mus_parle = sonie(pistes["musique"][:fin_v][parle[:fin_v]], mesure)
    l_mus_silence = sonie(pistes["musique"][:fin_v][~parle[:fin_v]], mesure) if (~parle[:fin_v]).sum() > SR else None
    l_mix = sonie(final, mesure)
    pe = np.zeros(n, bool)
    for s_ in props["scenes"]:
        if s_["disposition"] != "panneau":
            pe[s_["debut"] * ECH_PAR_IMAGE:s_["fin"] * ECH_PAR_IMAGE] = True
    l_mus_pe = sonie(pistes["musique"][pe], mesure) if pe.any() else None
    l_mus_carton = sonie(pistes["musique"][carton["debut"] * ECH_PAR_IMAGE:carton["debut"] * ECH_PAR_IMAGE + SR],
                         mesure) if carton else None
    ebur = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(sortie), "-af", "ebur128=peak=true+sample", "-f", "null",
                           "-"], capture_output=True, text=True).stderr
    crete_vraie = float(ebur.split("True peak:")[1].split("Peak:")[1].split("dBFS")[0])
    crete_ech = 20 * np.log10(np.abs(final).max())
    ecretes = int((np.abs(final) >= 0.999).sum())

    # Effets : sonie de chaque effet comparée à celle de la voix au même moment (3 s autour).
    lignes_effets = []
    ecarts = []
    for image, quoi, quoi_txt in garde:
        i = image * ECH_PAR_IMAGE
        x = cache[quoi] * gain_final
        l_effet = sonie_attaque(x, mesure)
        # Voix pendant l'effet (de 0,5 s avant à 1,5 s après) ; s'il y a moins d'1 s de voix
        # (carton de fin), comparaison avec la voix moyenne.
        autour = pistes["voix"][max(0, i - SR // 2):min(fin_v, i + 3 * SR // 2)]
        l_v = sonie(autour, mesure) if len(autour) >= SR else float("-inf")
        locale = np.isfinite(l_v) and l_v > l_voix - 10
        ecart = l_effet - (l_v if locale else l_voix)
        ecarts.append(ecart)
        lignes_effets.append(f"| {temps(image)} | {image} | {quoi} | {quoi_txt} | {ecart:+.1f} LU"
                             f"{'' if locale else ' (voix moyenne)'} |")

    rapport = [
        f"# Son — {nom}", "",
        "## Niveaux mesurés (EBU R128)", "",
        f"- Mix final : **{l_mix:.1f} LUFS** intégrés ; crête vraie **{crete_vraie:.1f} dBTP** ; "
        f"crête échantillon {crete_ech:.1f} dBFS ; échantillons saturés : **{ecretes}**.",
        f"- Voix seule : {l_voix:.1f} LUFS.",
        f"- Musique pendant qu'il parle : {l_mus_parle:.1f} LUFS, soit **{l_mus_parle - l_voix:+.1f} LU** sous la voix.",
    ]
    if l_mus_pe is not None:
        rapport.append(f"- Musique pendant les plein écran : {l_mus_pe:.1f} LUFS ({l_mus_pe - l_voix:+.1f} LU).")
    if l_mus_carton is not None:
        rapport.append(f"- Musique au début du carton de fin (sans voix) : {l_mus_carton:.1f} LUFS "
                       f"({l_mus_carton - l_voix:+.1f} LU), puis fondu jusqu'au silence.")
    if l_mus_silence is not None:
        rapport.append(f"- Musique dans les silences et plein écran : {l_mus_silence:.1f} LUFS "
                       f"({l_mus_silence - l_voix:+.1f} LU par rapport à la voix).")
    rapport += [
        f"- Effets : de **{min(ecarts):+.1f} à {max(ecarts):+.1f} LU** par rapport à la voix au même moment "
        f"(négatif = plus bas que la voix).", "",
        "## Effets sonores (moment exact)", "",
        "Chaque effet démarre sur l'image indiquée (1 image = 1/30 s).", "",
        "| Moment | Image | Effet | Ce qui apparaît | Effet / voix |",
        "|---|---|---|---|---|",
        *lignes_effets,
    ]
    if ecartes:
        rapport += ["", "## Effets écartés (trop proches d'un effet plus important)", ""]
        rapport += [f"- {temps(i)} (image {i}) : {q} — {t}" for i, q, t in ecartes]
    (ROOT / "projets" / nom / "sons.md").write_text("\n".join(rapport) + "\n")
    print("\n".join(rapport[:10]))
    print(f"{len(garde)} effets placés, {len(ecartes)} écartés → projets/{nom}/sons.md")


if __name__ == "__main__":
    main()
