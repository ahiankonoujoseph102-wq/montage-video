"""Construit la voix, les mots (sous-titres), la bouche et le plan des images d'une vidéo.

Usage : python3 construire.py 1A|1B  → serie-animee/public/formation/<v>/ (voix.wav, montage.json)"""
import json
import re
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import importlib  # noqa: E402
import os  # noqa: E402
plan = importlib.import_module(os.environ.get('PLAN', 'plan2'))  # noqa: E402
import difflib  # noqa: E402

from aligner import canon  # noqa: E402
from corrections_live import corriger_mots  # noqa: E402
from unites import coupe_fin_redite, coupes_internes, jetons, sans_reprises, transcrire, unites  # noqa: E402
from textes import PROJET, normaliser  # noqa: E402
from voix import SR, Assemblage, Source  # noqa: E402

SERIE = Path("/home/user/montage-videos/serie-animee")
FPS = 30
PAUSE_PHRASE, PAUSE_BLOC = 0.32, 0.55
PHRASES = json.loads((Path(__file__).resolve().parent / "sorties" / "phrases.json").read_text())
ORDRE = list(PHRASES)
LIVE_MOTS = Path(__file__).resolve().parent / "sorties" / "live"

# Corrections d'affichage des sous-titres de la parole en direct (mots que Whisper déforme).
CORRECTIONS = [
    (r"\bclaude (?:côte|cote|coates|coach|coder)(?: de côte)*\b|\bcloud ?code\b|\bclaude code de côte\b|\bcloudkout\b", "Claude Code"),
    (r"\bclaude côte\b", "Claude Code"), (r"\bcas (?:de|des) charges?\b", "cahier des charges"),
    (r"\bargents?\b(?= (?:ia|de programmation|du|que|qui|que je|,|\.))", "agent"),
    (r"\bk[ée]k[ée]li\b", "Kekeli"), (r"\bafrika ?code\b", "Afrikode"), (r"\bcloudflat\b", "Cloudflare"),
    (r"\bhorsinger\b", "Hostinger"), (r"\b(?:le )?va ?bol\b|\blovabo(?:l|ll)?\b", "Lovable"), (r"\bqui sort\b", "Cursor"),
    (r"\bopen ?eye\b", "OpenAI"), (r"\bweb code ?(?:jean|ine)\b|\bvibe continue\b|\bweb codeine\b", "vibe coding"),
    (r"\bl'?ome ?ia ?school\b|\blomeya school\b", "Lomé IA School"), (r"\bguide ?up\b|\bgit ?hub\b", "GitHub"),
    (r"\bbloc[- ]?notes?\b", "bloc-notes"), (r"\bcoffre fort\b", "coffre-fort"), (r"\bmobile monnaie\b", "Mobile Money"),
    (r"\btalk ?amy\b|\btolokami\b|\btolkami\b", "Talkami"), (r"\bpostgre ?s ?q ?l\b|\bpost ?gré\b", "PostgreSQL"),
]


def corriger(texte: str) -> str:
    for motif, rempl in CORRECTIONS:
        texte = re.sub(motif, rempl, texte, flags=re.I)
    return texte


def ids(premier: str, dernier: str) -> list[str]:
    return ORDRE[ORDRE.index(premier): ORDRE.index(dernier) + 1]


JOURNAL: list[str] = []


def couverture(script_j: list[str], dits: list[str]) -> int:
    sm = difflib.SequenceMatcher(None, script_j, dits, autojunk=False)
    return sum(b.size for b in sm.get_matching_blocks())


def garder_sans_reprises(s, d0: float, f0: float, script, suite: list[str] | None = None) -> tuple[list, list]:
    """Unités de parole de [d0, f0] sans les reprises ; une suppression qui ferait perdre du texte prévu est annulée."""
    us = []
    for u in unites(s, d0, f0):
        morceaux = [u]
        for c in plan.COUPES:
            if c[0] == s.chemin:
                morceaux = [x for a, b in morceaux for x in ([(a, c[1]), (c[2], b)] if a < c[2] and c[1] < b else [(a, b)]) if x[1] - x[0] > 0.15]
        us += morceaux
    gardees, retirees, _ = sans_reprises(s, us)
    script_j = canon([j for t, _ in script for j in normaliser(t)])
    tous = canon([j for u in us for j in jetons(transcrire(s, *u))])
    ref = couverture(script_j, tous)
    for u, texte in retirees:
        essai = sorted(gardees)
        if couverture(script_j, canon([j for x in essai for j in jetons(transcrire(s, *x))])) < ref - 2:
            gardees = sorted(gardees + [u])
            JOURNAL.append(f"{s.chemin} {u[0]:.1f}-{u[1]:.1f} gardé (texte prévu) : {texte}")
        else:
            JOURNAL.append(f"{s.chemin} {u[0]:.1f}-{u[1]:.1f} retiré : {texte}")
    # unités qui n'apportent presque rien au texte prévu (paroles hors texte, phrase redite dans un autre bloc)
    gardees = sorted(gardees)
    for u in list(gardees):
        tu = canon(jetons(transcrire(s, *u)))
        if len(tu) < 3:
            continue
        reste = [x for x in gardees if x != u]
        avec = couverture(script_j, canon([j for x in gardees for j in jetons(transcrire(s, *x))]))
        sans = couverture(script_j, canon([j for x in reste for j in jetons(transcrire(s, *x))]))
        ailleurs = canon([j for x in reste for j in jetons(transcrire(s, *x))])
        double = couverture(tu, ailleurs) >= 0.6 * len(tu) or couverture(tu, canon(suite or [])) >= 0.6 * len(tu)
        if avec - sans < 0.3 * len(tu) and double:
            gardees = reste
            JOURNAL.append(f"{s.chemin} {u[0]:.1f}-{u[1]:.1f} retiré (hors texte) : {' '.join(tu)}")
    return gardees, [transcrire(s, *u) for u in gardees]


def placer(asm, s, gardees, mots_u, script) -> list[dict]:
    """Assemble les unités gardées et donne à chaque mot prévu (sous-titres) son temps dans la vidéo."""
    dits = []
    for k, ((ua, ub), m) in enumerate(zip(gardees, mots_u)):
        if k:
            asm.silence(0.12)
        coupes = coupes_internes(m) + [(c[1], c[2]) for c in plan.COUPES if c[0] == s.chemin and c[1] < ub and c[2] > ua]
        fin_redite = coupe_fin_redite(m, mots_u[k + 1:k + 4])
        if fin_redite is not None:
            coupes.append((fin_redite, ub + 1))
        for c in coupes:
            JOURNAL.append(f"{s.chemin} {c[0]:.1f}-{c[1]:.1f} retiré (reprise dans la phrase)")
        for a, b in s.morceaux(ua, ub):
            pieces = [(a, b)]
            for c0, c1 in coupes:
                pieces = [x for p0, p1 in pieces for x in ([(p0, c0), (c1, p1)] if p0 < c1 and c0 < p1 else [(p0, p1)]) if x[1] - x[0] > 0.05]
            for p0, p1 in pieces:
                asm.ajouter(s, p0, p1)
    for m in mots_u:
        for w in m:
            o = asm.vers_sortie(s.chemin, w["debut"])
            o2 = asm.vers_sortie(s.chemin, w["fin"])
            if o is None and o2 is None:
                continue
            o = o if o is not None else o2 - 0.15
            o2 = o2 if o2 is not None else o + 0.2
            for j in canon(normaliser(w["mot"])):
                dits.append((j, o, o2))
    prevu = []  # (indice du mot prévu, jeton)
    for i, (t, _) in enumerate(script):
        for j in canon(normaliser(t)) or [""]:
            prevu.append((i, j))
    sm = difflib.SequenceMatcher(None, [j for _, j in prevu], [d[0] for d in dits], autojunk=False)
    temps: dict[int, list] = {}
    for bl in sm.get_matching_blocks():
        for k in range(bl.size):
            i = prevu[bl.a + k][0]
            _, o, o2 = dits[bl.b + k]
            temps.setdefault(i, [o, o2])
            temps[i][1] = o2
    n = len(script)
    connus = sorted(temps)
    out = []
    for i, (texte, ident) in enumerate(script):
        if i in temps:
            o, o2 = temps[i]
        else:
            av = max([c for c in connus if c < i], default=None)
            ap = min([c for c in connus if c > i], default=None)
            o = temps[av][1] if av is not None else (temps[ap][0] - 0.3 if ap is not None else asm.t)
            o2 = temps[ap][0] if ap is not None else o + 0.3
            # plusieurs mots manquants d'affilée : on les répartit
            manq = [c for c in range(av + 1 if av is not None else 0, ap if ap is not None else n)]
            if len(manq) > 1:
                pas = (o2 - o) / len(manq)
                o, o2 = o + pas * manq.index(i), o + pas * (manq.index(i) + 1)
        out.append({"texte": texte, "debut": round(o, 3), "fin": round(max(o2, o + 0.05), 3), "phrase": ident})
    return out


def voix_phrases(asm, src, id0: str, id1: str) -> list[dict]:
    """Phrases du script id0 → id1 (meilleure prise, reprises retirées) ; renvoie les mots placés."""
    liste = ids(id0, id1)
    s = src(PHRASES[liste[0]]["source"])
    premier, dernier = PHRASES[liste[0]], PHRASES[liste[-1]]
    pos0, pos1 = ORDRE.index(liste[0]), ORDRE.index(liste[-1])
    avant = [PHRASES[o]["fin"] for o in ORDRE[max(0, pos0 - 3):pos0] if PHRASES[o]["source"] == s.chemin and PHRASES[o]["fin"] <= premier["debut"]]
    apres = [PHRASES[o]["debut"] for o in ORDRE[pos1 + 1:pos1 + 4] if PHRASES[o]["source"] == s.chemin and PHRASES[o]["debut"] >= dernier["fin"]]
    d0 = max(premier["debut"] - 0.14, (max(avant) + 0.02) if avant else 0)
    f0 = min(dernier["fin"] + 0.24, (min(apres) - 0.02) if apres else dernier["fin"] + 0.5)
    if liste[0] in plan.DEBUT_FORCE:
        d0 = plan.DEBUT_FORCE[liste[0]]
    script = [(plan.DIT[ident][1] if ident in plan.DIT and w["texte"] == plan.DIT[ident][0] else w["texte"], ident)
              for ident in liste for w in PHRASES[ident]["mots"]]
    suite = [j for o in ORDRE[pos1 + 1:pos1 + 13] if PHRASES[o]["source"] == s.chemin for j in normaliser(PHRASES[o]["texte"])]
    gardees, mots_u = garder_sans_reprises(s, d0, f0, script, suite)
    return placer(asm, s, gardees, mots_u, script)


# ---------------------------------------------------------------- démonstrations pas à pas (version 2)
VO = "voix/voix-off-demos.m4a"
MOTS_VO = [w for seg in json.loads((PROJET / "voix" / "transcriptions" / "voix-off-demos.json").read_text()) for w in seg["mots"]]
CORRIGE_VO = [(r"^cloud$", "Claude"), (r"^cloud\.$", "Claude."), (r"^[Cc]loud ?code([.,]?)$", r"Claude Code\1"), (r"^K[ée]k[ée]li([.,]?)$", r"Kekeli\1"),
              (r"^Titiadio\.$", "Teacher Joe."), (r"^d'argent\.?$", "d'agent."), (r"^d'argent$", "d'agent"), (r"^confort$", "coffre-fort"),
              (r"^continue$", "Continuer"), (r"^Validez\.$", "« Validé,"), (r"^Lance\.$", "lance. »"), (r"^ces$", "ses"), (r"^un\.$", "an."),
              (r"^cloud\.ai\.$", "claude.ai.")]
RUSH_CADRE = {"talkami-catalogue": (0, 1920, 1080), "talkami-video": (0, 944, 528)}  # haut, hauteur, largeur ; sinon téléphone


def cadre(rush: str):
    haut, h, w = RUSH_CADRE.get(Path(rush).stem, (140, 2160, 1080))
    return haut, h, w


def mots_vo(v0: float, v1: float, decalage: float, ident: str) -> list[dict]:
    out = []
    for w in MOTS_VO:
        if v0 - 0.05 <= w["d"] < v1:
            txt = w["m"].strip()
            if out and txt[:1] in "'." and txt not in (".",):
                out[-1]["texte"] += txt
                out[-1]["fin"] = round(w["f"] + decalage, 3)
                continue
            out.append({"texte": txt, "debut": round(w["d"] + decalage, 3), "fin": round(w["f"] + decalage, 3), "phrase": ident})
    for m in out:
        m["texte"] = m["texte"].replace("cloud code", "Claude Code").replace("Cloudcode", "Claude Code")
        for motif, rempl in CORRIGE_VO:
            m["texte"] = re.sub(motif, rempl, m["texte"])
    # « cloud code » en deux mots
    for i in range(len(out) - 1):
        if out[i]["texte"] in ("Claude", "cloud") and out[i + 1]["texte"].lower().startswith("code"):
            out[i]["texte"] = "Claude"
            out[i + 1]["texte"] = "Code" + out[i + 1]["texte"][4:]
    return out


def touchers_auto(rush: str) -> list:
    f = Path(__file__).resolve().parent / "sorties" / "touchers" / f"{Path(rush).stem}.json"
    return json.loads(f.read_text()) if f.exists() else []


def vers_clip(morceaux, ts):
    o = 0.0
    for a, b, v in morceaux:
        if a - 1e-3 <= ts <= b + 1e-3:
            return o + (ts - a) / v
        o += (b - a) / v
    return None


N_DEMO = [0]


def demo(asm, src, el):
    """("demo", rush, [étapes], visuel) : chaque étape = morceaux du rush (vitesse 1 ou ralentis, jamais accélérés),
    voix (voix off des démos, phrases du script, parole en direct ou son de la vidéo), bandeau, cercles et zooms."""
    _, rush0, etapes, visuel = el
    plans, mots = [], []
    n_num = sum(1 for e in etapes if e.get("b", "").startswith("Étape"))
    for k, e in enumerate(etapes):
        rush = e.get("rush", rush0)
        haut, hclip, wclip = cadre(rush)
        taps = touchers_auto(rush)
        m = e["m"]
        morceaux = [m] if isinstance(m[0], (int, float)) else list(m)
        morceaux = [(x[0], x[1], x[2] if len(x) > 2 else 1) for x in morceaux]
        long_video = sum((b - a) / v for a, b, v in morceaux)
        t0 = asm.t
        voix = e.get("v")
        voix = [voix] if voix and isinstance(voix[0], str) else (voix or [])
        ident = f"demo{N_DEMO[0]}_{k}"
        direct = any(x[0] in ("live", "son") for x in voix)
        for x in voix:
            if x[0] == "vo":
                asm.silence(0.35)
                d = asm.t
                asm.ajouter(src(VO), x[1] - 0.08, x[2] + 0.12)
                mots += mots_vo(x[1], x[2], d - (x[1] - 0.08), ident)
            elif x[0] == "phrases":
                asm.silence(0.25)
                mots += voix_phrases(asm, src, x[1], x[2])
            elif x[0] in ("live", "son"):
                s = src(rush)
                for a, b, v in morceaux:
                    o = asm.t
                    asm.ajouter(s, a, b)
                    if x[0] == "live":
                        for w in corriger_mots(transcrire(s, a, b)):
                            if a <= w["debut"] < b:
                                mots.append({"texte": corriger(w["mot"]), "debut": round(o + w["debut"] - a, 3),
                                             "fin": round(o + max(w["fin"], w["debut"] + 0.08) - a, 3), "phrase": ident})
        duree_voix = asm.t - t0
        duree = long_video if direct else max(long_video, duree_voix + e.get("apres", 0.6), e.get("min", 0))
        asm.silence(max(0.0, duree - (asm.t - t0)))
        duree = asm.t - t0
        cibles = [(ts, x, y) for ts, x, y in e.get("c", [])]
        if e.get("auto", True):
            for ts, x, y in taps:  # les appuis sur le clavier (bas de l'écran) ne sont pas montrés
                if y < e.get("clavier", 1650) and vers_clip(morceaux, ts) is not None and all(abs(ts - c[0]) > 0.6 for c in cibles):
                    cibles.append((ts, x, y))
        cibles.sort()
        cib = [{"t": round(t0 + vers_clip(morceaux, ts), 3), "x": x, "y": y - haut} for ts, x, y in cibles]
        zooms = [{"t": round(t0 + (vers_clip(morceaux, ts) or 0), 3), "x": x, "y": y - haut, "f": f} for ts, x, y, f in e.get("z", [])]
        if not zooms:
            if cib:
                zooms = [{"t": round(c["t"] - 0.9, 3), "x": c["x"], "y": c["y"], "f": e.get("f", 1.6)} for c in cib]
                zooms[0]["t"] = round(t0, 3)
            else:
                zooms = [{"t": round(t0, 3), "x": wclip / 2, "y": e.get("y", hclip * 0.42), "f": e.get("f", 1.2)}]
        plans.append({"debut": round(t0, 3), "fin": round(asm.t, 3), "type": "etape",
                      "visuel": {"mode": "etape", "titre": visuel.get("titre", ""), "bandeau": e.get("b", ""), "rush": rush,
                                 "morceaux": morceaux, "duree": round(duree, 3), "cibles": cib, "zooms": zooms,
                                 "haut": haut, "hclip": hclip, "wclip": wclip, "n": n_num, "son": direct, "note": e.get("note"),
                                 "flous": [{"t0": round(t0 + (vers_clip(morceaux, a) if vers_clip(morceaux, a) is not None else 0), 3),
                                            "t1": round(t0 + (vers_clip(morceaux, b) if vers_clip(morceaux, b) is not None else duree), 3),
                                            "x": x, "y": y - haut, "l": l, "h": h} for a, b, x, y, l, h in e.get("flou", [])],
                                 "fichier": f"{Path(rush).stem}_{'_'.join(f'{a:.2f}-{b:.2f}x{v}' for a, b, v in morceaux)}_d{duree:.2f}"}})
    N_DEMO[0] += 1
    return plans, mots


def construire(nom: str, elements: list) -> dict:
    sources: dict[str, Source] = {}
    src = lambda c: sources.setdefault(c, Source(c))  # noqa: E731
    asm = Assemblage()
    mots, plans = [], []
    asm.silence(0.25)
    for el in elements:
        t_debut = asm.t
        visuel = el[-1]
        morceaux_video = []
        mots_el = []
        if el[0] == "phrases":
            mots_el += voix_phrases(asm, src, el[1], el[2])
        elif el[0] == "demo":
            p_demo, m_demo = demo(asm, src, el)
            plans += p_demo
            mots += m_demo
            asm.silence(0.3)
            continue
        elif el[0] == "PHRASES_ANCIEN":
            liste = ids(el[1], el[2])
            s = src(PHRASES[liste[0]]["source"])
            premier, dernier = PHRASES[liste[0]], PHRASES[liste[-1]]
            pos0, pos1 = ORDRE.index(liste[0]), ORDRE.index(liste[-1])
            avant = [PHRASES[o]["fin"] for o in ORDRE[max(0, pos0 - 3):pos0] if PHRASES[o]["source"] == s.chemin and PHRASES[o]["fin"] <= premier["debut"]]
            apres = [PHRASES[o]["debut"] for o in ORDRE[pos1 + 1:pos1 + 4] if PHRASES[o]["source"] == s.chemin and PHRASES[o]["debut"] >= dernier["fin"]]
            d0 = max(premier["debut"] - 0.14, (max(avant) + 0.02) if avant else 0)
            f0 = min(dernier["fin"] + 0.24, (min(apres) - 0.02) if apres else dernier["fin"] + 0.5)
            if liste[0] in plan.DEBUT_FORCE:
                d0 = plan.DEBUT_FORCE[liste[0]]
            script = [(plan.DIT[ident][1] if ident in plan.DIT and w["texte"] == plan.DIT[ident][0] else w["texte"], ident)
                      for ident in liste for w in PHRASES[ident]["mots"]]
            suite = [j for o in ORDRE[pos1 + 1:pos1 + 13] if PHRASES[o]["source"] == s.chemin for j in normaliser(PHRASES[o]["texte"])]
            gardees, mots_u = garder_sans_reprises(s, d0, f0, script, suite)
            mots_el += placer(asm, s, gardees, mots_u, script)
        elif el[0] == "live":
            _, rush, t0, t1, coupes, _ = el
            s = src(rush)
            gardes = [(t0, t1)]
            for c0, c1 in coupes:
                gardes = [x for g in gardes for x in ([(g[0], c0), (c1, g[1])] if g[0] < c0 < g[1] else [g])]
            us = [u for g0, g1 in gardes for u in unites(s, g0, g1)]
            gardees, retirees, mots_u = sans_reprises(s, us, minimum=4)
            JOURNAL.extend(f"{s.chemin} {a:.1f}-{b:.1f} retiré : {t}" for (a, b), t in retirees)
            for k, (ua, ub) in enumerate(gardees):
                if k:
                    pass
                for a, b in s.morceaux(ua, ub):
                    morceaux_video.append({"o0": round(asm.t, 3), "s0": round(a, 3), "s1": round(b, 3)})
                    asm.ajouter(s, a, b)
            for w in corriger_mots([w for m in mots_u for w in m]):
                o = asm.vers_sortie(s.chemin, w["debut"])
                if o is None:
                    o = asm.vers_sortie(s.chemin, w["fin"])
                if o is not None:
                    mots_el.append({"texte": corriger(w["mot"]), "debut": round(o, 3), "fin": round(o + max(0.08, w["fin"] - w["debut"]), 3), "phrase": "live"})
        elif el[0] == "pause":
            asm.silence(el[1])
        t_fin = asm.t
        mots += mots_el
        p = {"debut": round(t_debut, 3), "fin": round(t_fin, 3), "visuel": visuel, "type": el[0]}
        if morceaux_video:
            p["morceaux"] = morceaux_video
            p["rush"] = el[1]
            p["plage"] = [el[2], el[3]]
        # instants d'apparition des points (sur leur mot)
        if visuel.get("points"):
            n = len(visuel["points"])
            insts = []
            for i, pt in enumerate(visuel["points"]):
                cible = normaliser(pt["mot"])[0] if normaliser(pt["mot"]) else ""
                deja = insts[-1] if insts else t_debut - 1
                t = next((w["debut"] for w in mots_el if w["debut"] > deja and any(j.startswith(cible) for j in normaliser(w["texte"]))), None)
                if t is None:
                    t = t_debut + (t_fin - t_debut) * (i + 0.5) / (n + 0.5)
                insts.append(round(max(t, deja + 0.4), 3))
            p["instants"] = insts
        if visuel.get("mode") == "demo":
            ins = [t_debut]
            for mot, etape in visuel.get("etapes", []):
                t = next((w["debut"] for w in mots_el if any(j.startswith(mot) for j in normaliser(w["texte"]))), None)
                if t:
                    ins.append(t)
            p["instants"] = [round(x, 3) for x in ins]
        plans.append(p)
        asm.silence(PAUSE_BLOC if el[0] != "pause" else 0.15)
    asm.silence(0.4)
    dossier = SERIE / "public" / "formation" / nom
    dossier.mkdir(parents=True, exist_ok=True)
    asm.ecrire(dossier / "voix.wav")
    duree = asm.t
    for m in mots:
        m["texte"] = corriger(m["texte"]) if m["phrase"] == "live" else m["texte"]
    return {"duree": round(duree, 3), "plans": plans, "mots": mots, "carte_voix": asm.carte}


if __name__ == "__main__":
    nom = sys.argv[1]
    data = construire(nom, plan.VIDEO_1A if nom.endswith("A") else plan.VIDEO_1B)
    sortie = SERIE / "public" / "formation" / nom / "montage.json"
    sortie.write_text(json.dumps({k: v for k, v in data.items() if k != "carte_voix"}, ensure_ascii=False))
    (Path(__file__).resolve().parent / "sorties" / f"reprises_{nom}.txt").write_text("\n".join(JOURNAL))
    (Path(__file__).resolve().parent / "sorties" / f"carte_voix_{nom}.json").write_text(json.dumps(data["carte_voix"]))
    print(nom, f"{data['duree'] / 60:.1f} min,", len(data["plans"]), "plans,", len(data["mots"]), "mots")
