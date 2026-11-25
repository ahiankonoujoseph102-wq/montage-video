"""Pub Zéro Perte (copie adaptée de scripts/test_auto.py). Vidéo de test automatique (étape 1) : assemble la voix clonée, calcule les temps des mots, la bouche du double,
le son, et écrit les props de la composition Remotion `VideoAuto`.

Usage : python3 scripts/test_auto.py <dossier des phrases générées> [dossier du script et du plan]
Entrées : projets/test-auto/script.json et plan.json ; <dossier>/00.wav, 01.wav… (une phrase chacune, voix clonée) ;
          sons/musique_defaut.m4a (musique de Joseph) et sons/effets/*.wav.
Sorties (non versionnées) : public/test-auto/voix.wav, mix.wav, props.json, emojis/ ; relevé projets/test-auto/mesures.md.
"""
import difflib
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

import numpy as np
import pyloudnorm as pyln

ROOT = Path(__file__).resolve().parents[2]
PROJET = ROOT / "projets" / "test-auto"  # emojis
ZP = ROOT / "projets" / "zero-perte"
PUBLIC = ROOT / "public" / "test-auto"
SR = 48000
FPS = 30
PAUSE_PHRASE = 0.22  # s entre deux phrases d'une même partie
PAUSE_PARTIE = 0.42  # s entre deux parties (accroche, réflexe 1…)
FIN = 2.2            # s gardées après la dernière phrase
CARTON = 4.2         # carton de fin Lomé IA School (logo, abonne-toi, consultation, WhatsApp) après la voix
# Chaîne « radio » choisie par Joseph pour la pub Talkami (scripts/voix_pub3.py), sans accélération.
# Voix naturelle (demande de Joseph) : plus de chaîne « radio » (égaliseur, double compression, désesseur) ; seulement
# un filtre des graves inutiles et une compression très douce pour garder un niveau régulier.
RADIO = ",".join([
    "highpass=f=60:poles=2",
    "acompressor=threshold=-22dB:ratio=1.6:attack=15:release=200:makeup=1dB:knee=8",
])


def lire(f, mono=False):
    r = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(f), "-ac", "1" if mono else "2", "-ar", str(SR),
                        "-f", "f32le", "-"], capture_output=True, check=True)
    x = np.frombuffer(r.stdout, np.float32).copy()
    return x if mono else x.reshape(-1, 2)


def ecrire(f, x, args=()):
    x = x if x.ndim == 2 else np.stack([x, x], 1)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", *args,
                    "-c:a", "pcm_s24le", str(f)], input=x.astype(np.float32).tobytes(), check=True)


def lufs(x):
    return pyln.Meter(SR).integrated_loudness(x)


def masque_silences(x, seuil_db=-40, plus_de=0.6, garde=0.35):
    """Voix de Joseph : un silence de plus de 0,6 s est ramené à 0,35 s (au milieu du silence, jamais dans un mot).
    Renvoie le masque des échantillons gardés."""
    n = int(0.02 * SR)
    e = np.array([np.sqrt(np.mean(x[i:i + n] ** 2)) for i in range(0, len(x) - n + 1, n)]) + 1e-9
    calme = 20 * np.log10(e / (np.percentile(e, 95) + 1e-9)) < seuil_db
    garder = np.ones(len(x), bool)
    k = 0
    while k < len(calme):
        if calme[k]:
            j = k
            while j < len(calme) and calme[j]:
                j += 1
            if (j - k) * 0.02 > plus_de:
                a = k * n + int(garde / 2 * SR)
                b = j * n - int(garde / 2 * SR)
                garder[a:b] = False
            k = j
        else:
            k += 1
    return garder


def rogner(x, seuil_db=-42):
    """Retire le silence au début et à la fin d'une phrase générée (garde 40 ms)."""
    n = int(0.02 * SR)
    e = np.array([np.sqrt(np.mean(x[i:i + n] ** 2)) for i in range(0, len(x) - n, n)]) + 1e-9
    actif = np.where(20 * np.log10(e / e.max()) > seuil_db)[0]
    a = max(0, actif[0] * n - int(0.04 * SR))
    b = min(len(x), (actif[-1] + 1) * n + int(0.04 * SR))
    return x[a:b]


# --- Formes de bouche (visèmes de Rhubarb : X repos, A m/b/p, B consonnes, C e/i, D a, E o, F ou/u, G f/v, H l) ---
REGLES = [("eau", "E"), ("ou", "F"), ("oi", "FD"), ("au", "E"), ("on", "E"), ("om", "E"), ("an", "C"), ("en", "C"),
          ("am", "C"), ("em", "C"), ("in", "C"), ("ain", "C"), ("ein", "C"), ("un", "C"), ("ch", "B"), ("gn", "B"),
          ("qu", "B"), ("ph", "G")]
LETTRES = {**{c: "D" for c in "aàâ"}, **{c: "C" for c in "eéèêëiîïy"}, **{c: "E" for c in "oô"}, **{c: "F" for c in "uûù"},
           **{c: "A" for c in "mbp"}, **{c: "G" for c in "fv"}, "l": "H"}


def visemes_mot(mot):
    m = re.sub(r"[^a-zàâçéèêëîïôûùüÿœ]", "", mot.lower().replace("œ", "oe"))
    if len(m) > 3 and m.endswith(("es", "ent")):
        m = m[:-2] if m.endswith("es") else m[:-3]
    if len(m) > 2 and m[-1] in "estxd":
        m = m[:-1]
    out, i = [], 0
    while i < len(m):
        for g, v in sorted(REGLES, key=lambda r: -len(r[0])):
            if m.startswith(g, i):
                out.extend(v)
                i += len(g)
                break
        else:
            out.append(LETTRES.get(m[i], "B"))
            i += 1
    res = [v for k, v in enumerate(out) if k == 0 or v != out[k - 1]]
    return res or ["B"]


def visemes_images(mots, n_images, energie):
    v = ["X"] * n_images
    for w in mots:
        a, b = int(round(w["debut"] * FPS)) - 1, int(round(w["fin"] * FPS)) - 1  # une image d'avance
        formes = visemes_mot(w["mot"])
        for k in range(max(0, a), min(n_images, max(a + 1, b))):
            v[k] = formes[min(len(formes) - 1, int((k - a) / max(1, b - a) * len(formes)))]
    for k in range(n_images):  # bouche au repos quand la voix se tait vraiment
        if energie[k] < 0.06:
            v[k] = "X"
    return "".join(v)


def main():
    t_debut = time.time()
    dossier = Path(sys.argv[1])
    source = Path(sys.argv[2]) if len(sys.argv) > 2 else PROJET  # script et plan (ceux de Gemini en automatique)
    script = json.loads((source / "script.json").read_text())
    plan = json.loads((source / "plan.json").read_text())
    phrases = script["phrases"]
    PUBLIC.mkdir(parents=True, exist_ok=True)
    # 1. Assemblage : phrases rognées, pauses courtes, puis chaîne « radio ».
    morceaux, bornes, t = [], [], 0.0
    # Voix enregistrée par Joseph (morceaux contigus) : rien n'est rogné ni ajouté, l'enregistrement reste entier.
    continue_ = os.environ.get("VOIX_CONTINUE") == "1"
    if continue_:
        # Toute la voix d'un seul tenant : seuls les silences de plus de 0,6 s sont raccourcis (jamais un mot touché),
        # puis les bornes des phrases sont recalculées sur la voix raccourcie.
        parts = [lire(dossier / f"{i:02d}.wav", mono=True) for i in range(len(phrases))]
        entier = np.concatenate(parts)
        garde = masque_silences(entier)
        cumul = np.concatenate([[0], np.cumsum(garde)])
        pos = 0
        for x in parts:
            bornes.append([round(cumul[pos] / SR, 3), round(cumul[pos + len(x)] / SR, 3)])
            pos += len(x)
        morceaux.append(entier[garde])
        t = len(morceaux[0]) / SR
    for i, p in enumerate(phrases if not continue_ else []):
        x = rogner(lire(dossier / f"{i:02d}.wav", mono=True))
        if i:
            pause = PAUSE_PARTIE if phrases[i - 1]["partie"] != p["partie"] else PAUSE_PHRASE
            morceaux.append(np.zeros(int(pause * SR)))
            t += pause
        bornes.append([round(t, 3), round(t + len(x) / SR, 3)])
        morceaux.append(x)
        t += len(x) / SR
    morceaux.append(np.zeros(int((0.5 + CARTON) * SR)))  # 0,5 s de respiration puis le carton de fin
    brut = np.concatenate(morceaux)
    ecrire(PUBLIC / "voix_brute.wav", brut)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(PUBLIC / "voix_brute.wav"), "-af", RADIO,
                    "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s24le", str(PUBLIC / "voix_t.wav")], check=True)
    voix = lire(PUBLIC / "voix_t.wav")
    voix *= 10 ** ((-15 - lufs(voix)) / 20)
    ecrire(PUBLIC / "voix.wav", voix)
    duree = len(voix) / SR
    # 2. Temps des mots : transcription de la voix clonée, alignée sur le texte exact (affiché) phrase par phrase.
    from faster_whisper import WhisperModel
    t_w = time.time()
    # Le texte est connu : il ne s'agit que de caler les mots. « small » suffit (écart médian 20 ms avec large-v3-turbo)
    # et va 5 à 7 fois plus vite.
    modele = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 2)
    segs, _ = modele.transcribe(str(PUBLIC / "voix.wav"), language="fr", word_timestamps=True, beam_size=1,
                                vad_filter=False, condition_on_previous_text=False)
    reconnus = [{"mot": w.word.strip(), "debut": w.start, "fin": w.end} for s in segs for w in s.words]
    t_w = time.time() - t_w
    (PUBLIC / "reconnus.json").write_text(json.dumps(reconnus, ensure_ascii=False))
    norm = lambda s: re.sub(r"[^a-zàâçéèêëîïôûùüÿœ0-9]", "", s.lower())
    NUM = next(k for k, p in enumerate(phrases) if "72 24 02 31" in p["texte"])
    mots, mots_frames, masques, ecarts = [], [], [], 0
    for i, p in enumerate(phrases):
        a, b = bornes[i]
        dans = [w for w in reconnus if a - 0.15 <= (w["debut"] + w["fin"]) / 2 <= b + 0.15]
        toks = re.findall(r"\S+", p["texte"])
        toks = [x for x in toks if x not in ("?", ":", "!")]
        A, B = [norm(x) for x in toks], [norm(w["mot"]) for w in dans]
        temps = [None] * len(toks)
        for op, a1, a2, b1, b2 in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes():
            if op == "equal":
                for k in range(a2 - a1):
                    temps[a1 + k] = (dans[b1 + k]["debut"], dans[b1 + k]["fin"])
            elif b2 > b1:
                ecarts += 1
                d0, d1 = dans[b1]["debut"], dans[b2 - 1]["fin"]
                for k in range(a2 - a1):
                    temps[a1 + k] = (d0 + (d1 - d0) * k / (a2 - a1), d0 + (d1 - d0) * (k + 1) / (a2 - a1))
        # Mots sans correspondance : répartis entre leurs voisins.
        for k in range(len(toks)):
            if temps[k] is None:
                ecarts += 1
                prec = temps[k - 1][1] if k and temps[k - 1] else a
                suiv = next((temps[j][0] for j in range(k + 1, len(toks)) if temps[j]), b)
                temps[k] = (prec, max(prec + 0.12, min(suiv, prec + 0.4)))
        for tok, (d0, d1) in zip(toks, temps):
            mots.append({"t": tok, "ph": i, "a": round(d0, 3), "b": round(d1, 3)})
            mots_frames.append({"mot": tok, "debut": int(round(d0 * FPS)), "fin": int(round(d1 * FPS)), "cle": False})
            if tok.startswith("+228") or (i == NUM and re.match(r"^\d\d\.?$", tok)):
                masques.append([int(round(d0 * FPS)) - 2, int(round(b * FPS)) + 12])
    # 3. Bouche : énergie par image (mouvements de tête) et visèmes (formes de bouche).
    mono = voix.mean(1)
    n_img = int(np.ceil(duree * FPS))
    e = np.array([np.sqrt(np.mean(mono[int(k * SR / FPS):int((k + 1) * SR / FPS)] ** 2)) for k in range(n_img)])
    energie = np.clip(e / (np.percentile(e, 95) + 1e-9), 0, 1)
    visemes = visemes_images(reconnus, n_img, energie)
    # 4. Son : musique de Joseph sous la voix (16 LU, +6 dB dans les pauses), effets aux changements de scène.
    mus = lire(Path(os.environ.get("MUSIQUE") or ROOT / "sons" / "musique_defaut.m4a"))
    while len(mus) < len(voix):
        mus = np.concatenate([mus, mus])
    mus = mus[:len(voix)] * 10 ** ((lufs(voix) - 16 - lufs(mus[:len(voix)])) / 20)
    env = np.convolve(np.abs(voix[:, 0]), np.ones(int(0.2 * SR)) / int(0.2 * SR), "same")
    actif = np.convolve((env > 10 ** (-38 / 20)).astype(float), np.ones(int(0.3 * SR)) / int(0.3 * SR), "same")
    tt = np.arange(len(voix)) / SR
    gain = 6 * (1 - actif)
    gain = np.where(tt > duree - 1.0, gain - (tt - (duree - 1.0)) * 30, gain)  # fondu de sortie
    mus *= (10 ** (gain / 20))[:, None]
    fx = np.zeros_like(voix)
    effets = [(0.0, "ouverture", -4)]
    if script.get("accroche", {}).get("lignes"):  # claquement de chaque ligne du titre (images 5 et 10)
        effets += [(k * 5 / FPS, "mot", -9) for k in range(1, len(script["accroche"]["lignes"]))]
    for i, s in enumerate(plan["scenes"]):
        a = bornes[i][0] if i else 0
        if i:
            nouvelle = phrases[i]["partie"] != phrases[i - 1]["partie"]
            effets.append((max(0, a - 0.35) if nouvelle else a, "transition" if nouvelle else "zoom", -8 if nouvelle else -12))
        if s["type"] == "telephone":
            effets.append((a + 0.2, "info", -6))
        if s["type"] in ("deux", "liste"):
            ancres = s.get("a") if s["type"] == "deux" else [it["a"] for it in s["items"]]
            marques = [s["gauche"]["ok"], s["droite"]["ok"]] if s["type"] == "deux" else [True] * len(ancres)
            for m, ok in zip(ancres, marques):
                w = next((x for x in mots if x["ph"] == i and x["t"] == m), None)
                if w:
                    effets.append((w["a"] + 2 / FPS, "coche" if ok else "croix", -9))
        if s["type"] == "numero":
            effets.append((a + 0.05, "autocollant", -8))
        quand = lambda m: next((x["a"] for x in mots if x["ph"] == i and x["t"] == m), None)
        if s["type"] == "logo":
            effets.append((a + 0.02, "ouverture", -3))
        if s["type"] in ("chiffre", "contact"):
            effets.append((a + 0.12, "info", -6))
        if s["type"] == "carte":
            effets.append((a + 0.15, "plein_ecran", -8))
        if s["type"] == "app":
            effets.append((a + 0.05, "plein_ecran", -9))
            for b_ in s.get("badges", []):
                t_ = quand(b_["a"])
                if t_ is not None:
                    effets.append((t_ + 1 / FPS, "croix" if b_.get("couleur") == "#EF4444" else "coche", -8))
            for r_ in s.get("reperes", []):
                t_ = quand(r_["a"])
                if t_ is not None:
                    effets.append((t_ + 1 / FPS, "panneau", -12))
        if s["type"] == "appareils":
            for m_ in s["a"]:
                t_ = quand(m_)
                if t_ is not None:
                    effets.append((t_, "autocollant", -9))
    fin_voix = bornes[-1][1]
    effets.append((fin_voix + 0.5, "carton", -4))
    rang = {"ouverture": 0, "carton": 1, "info": 2, "plein_ecran": 3, "croix": 4, "coche": 4, "mot": 4,
            "autocollant": 5, "transition": 5, "panneau": 6, "zoom": 7}
    effets.sort(key=lambda e: (rang.get(e[1], 9), e[0]))
    gardes = []
    for e in effets:
        if all(abs(e[0] - g[0]) >= 8 / FPS for g in gardes):
            gardes.append(e)
    effets = sorted(gardes)
    (ZP / "sons.md").write_text("# Effets sonores\n\n" + "\n".join(f"- {t0:6.2f} s : {nom} ({g} dB)" for t0, nom, g in effets) + "\n")
    for t0, nom, g in effets:
        x = lire(ROOT / "sons" / "effets" / f"{nom}.wav") * 10 ** (g / 20) * 0.5
        i0 = int(t0 * SR)
        k = min(len(x), len(fx) - i0)
        fx[i0:i0 + k] += x[:k]
    mix = voix + mus + fx
    mix *= 10 ** ((-14 - lufs(mix)) / 20)
    ecrire(PUBLIC / "mix_brut.wav", mix)
    lim = lambda d: 10 ** (d / 20)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(PUBLIC / "mix_brut.wav"), "-af",
                    f"alimiter=limit={lim(-2.5):.4f}:attack=3:release=60:level=disabled,aresample=192000,"
                    f"alimiter=limit={lim(-2.3):.4f}:attack=1:release=30:level=disabled,aresample={SR}",
                    "-c:a", "pcm_s24le", str(PUBLIC / "mix.wav")], check=True)
    for f in ("mix_brut.wav", "voix_t.wav"):
        (PUBLIC / f).unlink()
    # 5. Emojis utilisés et props.
    codes = sorted({s["emoji"] for s in plan["scenes"] if s.get("emoji")} | {"2728"})
    (PUBLIC / "emojis").mkdir(exist_ok=True)
    (PUBLIC / "marque").mkdir(exist_ok=True)
    shutil.copy2(ROOT / "projets" / "marque" / "logo.jpg", PUBLIC / "marque" / "logo.jpg")
    for c in codes:
        shutil.copy2(PROJET / "emojis" / f"{c}.json", PUBLIC / "emojis" / f"{c}.json")
    props = {"duree": round(duree, 3), "phrases": [{"a": a, "b": b} for a, b in bornes], "mots": mots,
             "motsFrames": mots_frames, "masques": masques, "visemes": visemes,
             "bouche": [round(float(x), 3) for x in energie], "scenes": plan["scenes"], "fonds": plan["fond"],
             "emojis": codes, "decalageDouble": 110,
             "carton": {"debut": int(round((fin_voix + 0.5) * FPS)), "whatsapp": "+228 72 24 02 31"},
             "marque": "zeroperte",
             "logoDes": int(round(bornes[next(k for k, x in enumerate(plan["scenes"]) if x["type"] == "logo")][1] * FPS))}
    if script.get("accroche", {}).get("lignes"):
        props["titre"] = script["accroche"]
    (PUBLIC / "props.json").write_text(json.dumps(props, ensure_ascii=False))
    print(json.dumps({"duree_video_s": round(duree, 1), "transcription_s": round(t_w, 1), "ecarts_alignement": ecarts,
                      "preparation_totale_s": round(time.time() - t_debut, 1), "lufs_mix": round(lufs(lire(PUBLIC / "mix.wav")), 1)}))


if __name__ == "__main__":
    main()
