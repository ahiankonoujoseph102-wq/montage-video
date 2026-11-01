"""Extrait d'essai de la deuxième partie (≈ 1 min, vidéo 2A, A-22 à A-28 : la pull request).

Sortie : serie-animee/public/formation/essai2/ (voix.wav, montage.json, extraits e*.mp4) ; puis bouche.py essai2.
Voix : voix off vo1 de Joseph, réduction de bruit puis traitement « radio fort » (VOIX_FORTE).
Scènes : démos pas à pas (extraits des rushes, vitesse 1, image figée tant que la voix parle), animations plein écran
(pull request, règle de fusion, l'application), carte avec Coach Joseph.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

ICI = Path(__file__).resolve().parent
P2 = ICI.parent
SERIE = Path("/home/user/montage-videos/serie-animee")
OUT = SERIE / "public" / "formation" / "essai2"
SR, FPS = 48000, 30
VO = P2 / "voix" / "vo1.m4a"
A0, A1 = 218.55, 281.40  # passage de la voix off utilisé (A-22 → A-28)

# Voix radio forte et énergique (demande de Joseph) : présence, chaleur, compression marquée, puis -14 LUFS au mixage final.
VOIX_FORTE = ("highpass=f=90,lowpass=f=15500,equalizer=f=140:t=q:w=1.0:g=3,equalizer=f=380:t=q:w=1.2:g=-3,"
              "equalizer=f=2800:t=q:w=1.0:g=5,equalizer=f=9500:t=h:w=3000:g=3,deesser=i=0.4,"
              "acompressor=threshold=-26dB:ratio=5:attack=3:release=80:makeup=7dB,loudnorm=I=-14:TP=-2:LRA=5,"
              "alimiter=limit=0.89:level=false")

# Mots déformés par la transcription → ce que Joseph dit (sous-titres).
REMPLACE = [(["poule", "riqueur"], ["pull", "request"]), (["poule", "riqueur,"], ["pull", "request,"]),
            (["corps", "fort."], ["coffre-fort."]), (["pour", "riqueur"], ["pull", "request"]),
            (["confirme", "Merge."], ["Confirm", "merge."]), (["Voilà", "pour"], ["valable", "pour"]),
            (["code"], ["Code"]), (["règle."], ["règle,"]), (["l'a", "fusionné"], ["a", "fusionné"]), (["dites-le", "lui"], ["dites-le-lui"])]

# Scènes (temps de la voix off d'origine). demo : rush, morceaux, bandeau, zooms (t, x, y, f), surlignes (t, x0, y0, x1, y1).
SCENES = [
    dict(type="demo", de=218.55, a=221.95, rush="rushes/v2.mp4", m=[(115.0, 119.0)],
         b="Le chef de projet : « Étape suivante : fusionner la pull request »",
         z=[(115.0, 540, 830, 1.2)], s=[(115.3, 15, 790, 1065, 845)]),
    dict(type="anim", nom="pullrequest", de=221.95, a=234.80,
         reperes={"copie": 225.78, "verifie": 227.76, "fusionne": 228.56, "depot": 229.82, "coffre": 230.38, "ranger": 232.48}),
    dict(type="demo", de=234.80, a=244.30, rush="rushes/v2.mp4", m=[(119.0, 128.0)],
         b="Fusionner vous-même sur GitHub : 3 gestes",
         z=[(119.0, 540, 1000, 1.2), (239.6, 540, 1300, 1.2)],
         s=[(237.8, 15, 880, 1065, 1150), (239.6, 15, 1230, 1065, 1285), (241.2, 15, 1310, 1065, 1415)]),
    dict(type="demo", de=244.30, a=248.30, rush="rushes/v3.mp4", m=[(112.0, 118.0)],
         b="Ma règle, envoyée à Claude Code",
         z=[(112.0, 600, 650, 1.55)], s=[(244.6, 230, 450, 1000, 760)]),
    dict(type="anim", nom="regle", de=248.30, a=257.05, reperes={"vertes": 250.16, "fusionne": 252.76, "rouges": 253.80, "vert": 256.50}),
    dict(type="demo", de=257.05, a=263.10, rush="rushes/v2.mp4", m=[(380.0, 386.5)],
         b="Claude Code applique la règle… et m'envoie des captures",
         z=[(380.0, 540, 500, 1.35), (384.2, 540, 1000, 1.25)]),
    dict(type="anim", nom="appli", de=263.10, a=269.40, reperes={"resultat": 263.94, "projets": 268.32}),
    dict(type="carte", de=269.40, a=281.40, titre="Bloqué ? Demandez au chef de projet", emoji="🧭",
         points=[("Dites-le simplement", "dites"), ("Envoyez une capture d'écran", "capture"), ("« Guide-moi étape par étape »", "guider")]),
]


def lire(src, filtre):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", str(src), "-af", filtre, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                                        capture_output=True, check=True).stdout, np.float32)


def extrait(nom, rush, morceaux, duree):
    sortie = OUT / f"{nom}.mp4"
    parts, filtres = [], []
    for k, (a, b) in enumerate(morceaux):
        filtres.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS,fps={FPS},crop=1080:2160:0:140[p{k}]")
        parts.append(f"[p{k}]")
    filtres.append(f"{''.join(parts)}concat=n={len(parts)}:v=1:a=0,tpad=stop_mode=clone:stop_duration={duree + 1},trim=0:{duree + 0.2},setpts=PTS-STARTPTS[v]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(P2 / rush), "-filter_complex", ";".join(filtres), "-map", "[v]",
                    "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", str(sortie)], check=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    debut_voix = 0.4  # petite respiration avant la première phrase
    x = lire(VO, "highpass=f=80,afftdn=nr=14:nf=-44," + VOIX_FORTE)[int(A0 * SR):int(A1 * SR)]
    y = np.concatenate([np.zeros(int(debut_voix * SR), np.float32), x, np.zeros(int(0.8 * SR), np.float32)])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-ac", "2", "-c:a", "pcm_s16le",
                    str(OUT / "voix.wav")], input=y.tobytes(), check=True)
    dec = debut_voix - A0  # temps vidéo = temps voix off + dec
    mots = [{"texte": w["m"].strip(), "debut": round(w["d"] + dec, 3), "fin": round(w["f"] + dec, 3), "phrase": "A"}
            for s in json.loads((P2 / "transcriptions" / "vo1.json").read_text()) for w in s["mots"] if A0 <= w["d"] < A1 - 0.1]
    # mots coupés par la transcription (« c » + « 'est ») et corrections
    fus = []
    for m in mots:
        if fus and m["texte"][:1] in "'-" and m["texte"] not in ("-",):
            fus[-1]["texte"] += m["texte"]
            fus[-1]["fin"] = m["fin"]
        else:
            fus.append(m)
    textes = [m["texte"] for m in fus]
    for av, ap in REMPLACE:
        i = 0
        while i <= len(textes) - len(av):
            if textes[i:i + len(av)] == av:
                for k, t in enumerate(ap):
                    textes[i + k] = t
                if len(ap) < len(av):
                    fus[i + len(ap) - 1]["fin"] = fus[i + len(av) - 1]["fin"]
                    del fus[i + len(ap):i + len(av)]
                    del textes[i + len(ap):i + len(av)]
            i += 1
    for m, t in zip(fus, textes):
        m["texte"] = t
    plans = []
    for k, sc in enumerate(SCENES):
        de, a = sc["de"] + dec, sc["a"] + dec
        if k == 0:
            de = 0.0
        p = {"type": sc["type"], "debut": round(de, 3), "fin": round(a, 3)}
        if sc["type"] == "demo":
            nom = f"e{k}"
            m0 = sc["m"]
            extrait(nom, sc["rush"], m0, a - de)
            def t_out(ts):
                # repère donné en temps de rush (début du morceau) ou en temps de voix off (≥ 200 s)
                return round(de + (ts - m0[0][0]), 3) if ts < 200 else round(ts + dec, 3)
            p.update(fichier=nom, bandeau=sc["b"],
                     zooms=[{"t": t_out(t), "x": x_, "y": y_ - 140, "f": f} for t, x_, y_, f in sc["z"]],
                     surlignes=[{"t": t_out(t), "x0": x0, "y0": y0 - 140, "x1": x1, "y1": y1 - 140} for t, x0, y0, x1, y1 in sc.get("s", [])])
        elif sc["type"] == "anim":
            p.update(nom=sc["nom"], reperes={k2: round(v + dec, 3) for k2, v in sc["reperes"].items()})
        else:
            p.update(titre=sc["titre"], emoji=sc["emoji"], points=[{"texte": t, "mot": m_} for t, m_ in sc["points"]])
            insts = []
            for t, m_ in sc["points"]:
                w = next((w for w in fus if w["debut"] >= de and w["texte"].lower().startswith(m_) and (not insts or w["debut"] > insts[-1])), None)
                insts.append(round(w["debut"] if w else de + 1, 3))
            p["instants"] = insts
        plans.append(p)
    duree = round(len(y) / SR, 3)
    (OUT / "montage.json").write_text(json.dumps({"duree": duree, "plans": plans, "mots": fus}, ensure_ascii=False, indent=1))
    print("durée", duree)
    for p in plans:
        print(p["type"], p["debut"], p["fin"], p.get("nom", p.get("bandeau", p.get("titre", ""))))


if __name__ == "__main__":
    main()
