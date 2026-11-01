"""Moteur de montage de la deuxième partie (2A à 2D) : voix off nettoyée (reprises coupées), sous-titres alignés sur le
texte prévu, extraits des enregistrements (démos), vidéos libres (Mixkit), images fixes, puis montage.json lu par la
composition Remotion `FormationP2` (serie-animee/src/formation/p2/P2.tsx).

Temps des scènes : temps de la voix off d'origine (avant coupes). Coordonnées des zooms et surlignes : image du
téléphone recadrée 1080 × 2160 (sans la barre d'état, `crop=1080:2160:0:140`).
"""
import difflib
import hashlib
import os
import json
import re
import shutil
import subprocess
from pathlib import Path

import numpy as np

ICI = Path(__file__).resolve().parent
P2 = ICI.parent
P1 = P2.parent / "agent-ia-p1"
SERIE = Path("/home/user/montage-videos/serie-animee")
LIBRE = SERIE / "public" / "formation" / "p2" / "libre"
SR, FPS = 48000, 30
DEBUT_VOIX = 0.4
INSERT = 10000.0

VOIX_FORTE = ("highpass=f=90,lowpass=f=15500,equalizer=f=140:t=q:w=1.0:g=3,equalizer=f=380:t=q:w=1.2:g=-3,"
              "equalizer=f=2800:t=q:w=1.0:g=5,equalizer=f=9500:t=h:w=3000:g=3,deesser=i=0.4,"
              "acompressor=threshold=-26dB:ratio=5:attack=3:release=80:makeup=7dB,loudnorm=I=-14:TP=-2:LRA=5,"
              "alimiter=limit=0.89:level=false")

RUSHES = {
    "v1": P2 / "rushes/v1.mp4", "v2": P2 / "rushes/v2.mp4", "v3": P2 / "rushes/v3.mp4", "v4": P2 / "rushes/v4.mp4",
    "v5": P2 / "rushes/v5.mp4", "v6": P2 / "rushes/v6.mp4", "v7": P2 / "rushes/v7.mp4",
    "C": P1 / "rushes/20261027-155554.mp4", "D": P1 / "rushes/20261027-165105.mp4", "E": P1 / "rushes/20261027-165809.mp4",
    "H": P1 / "rushes/20261022-081406.mp4", "R1": P1 / "voix/chef-de-projet.mp4",
}


def norm(m):
    m = m.lower().replace("’", "'")
    return re.sub(r"[^a-z0-9àâçéèêëîïôûùüÿœ]", "", m)


class Montage:
    """Voix = voix off `vo` de a0 à a1, moins les `coupes`, plus des `inserts` (passages d'un rush, voix en direct de
    Joseph) placés à un instant de la voix off. Temps virtuel des scènes : temps de la voix off ; pour un passage inséré,
    INSERT + temps du rush (ex. 10520.5 = 520,5 s du rush)."""

    def __init__(self, nom, vo, a0, a1, coupes, texte_prevu, inserts=()):
        self.nom, self.vo, self.a0, self.a1 = nom, vo, a0, a1
        self.coupes = sorted(coupes)
        self.texte = texte_prevu
        self.inserts = sorted(inserts)  # (t_vo, fichier, a, b, transcription json, décalage des temps du json)
        self.out = SERIE / "public" / "formation" / nom
        self.out.mkdir(parents=True, exist_ok=True)
        self.plans = []
        # morceaux dans l'ordre : (source, a, b, base virtuelle)
        vo_parts, t = [], a0
        for c, d in self.coupes + [(a1, a1)]:
            vo_parts.append((vo, t, c, 0.0))
            t = d
        parts = []
        for pv in vo_parts:
            parts.append(pv)
            for ins in self.inserts:
                if pv[1] <= ins[0] <= pv[2] + 0.5 and abs(ins[0] - pv[2]) < 0.6:
                    parts.append((ins[1], ins[2], ins[3], INSERT))
        self.parts, cum = [], DEBUT_VOIX
        for src, x, y, base in parts:
            self.parts.append((src, x, y, base, cum))
            cum += y - x

    # temps virtuel -> temps de la vidéo
    def m(self, t):
        for src, x, y, base, cum in self.parts:
            if base == INSERT and t >= INSERT and x - 0.01 <= t - INSERT <= y + 0.01:
                return round(cum + t - INSERT - x, 3)
        if t >= INSERT:
            raise ValueError(f"temps inséré hors des passages : {t}")
        prec_fin = None
        for src, x, y, base, cum in self.parts:
            if base == INSERT:
                continue
            if x <= t <= y:
                return round(cum + t - x, 3)
            if t < x:  # dans une coupe : fin du morceau précédent
                return round(prec_fin if prec_fin is not None else cum, 3)
            prec_fin = cum + y - x
        return round(prec_fin, 3)

    def voix(self):
        cache = {}
        f = int(0.012 * SR)
        rampe = np.linspace(0, 1, f, dtype=np.float32)
        out = [np.zeros(int(DEBUT_VOIX * SR), np.float32)]
        for src, x, y, base, cum in self.parts:
            if src not in cache:
                pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(P2 / src), "-vn", "-af", "highpass=f=80,afftdn=nr=14:nf=-44," + VOIX_FORTE,
                                      "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
                cache[src] = np.frombuffer(pcm, np.float32)
            sg = cache[src][int(x * SR):int(y * SR)].copy()
            sg[:f] *= rampe
            sg[-f:] *= rampe[::-1]
            out.append(sg)
        out.append(np.zeros(int(2.0 * SR), np.float32))
        y = np.concatenate(out)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-ac", "2", "-c:a", "pcm_s16le",
                        str(self.out / "voix.wav")], input=y.tobytes(), check=True)
        self.duree = round(len(y) / SR, 3)

    def _mots_bruts(self, json_transcription, base, decal, garde):
        ws = [w for s in json.loads((P2 / json_transcription).read_text()) for w in s["mots"]]
        brut = []
        for w in ws:
            d, f, txt = w["d"] + decal, w["f"] + decal, w["m"].strip()
            ok = [(x, y) for x, y in garde if x - 0.1 <= d < y or (d < x and f > x + 0.12)]
            if not ok:
                continue
            d = max(d, ok[0][0])
            if txt[:1] in "'-" and brut:
                brut[-1]["texte"] += txt
                brut[-1]["fin"] = self.m(base + f)
                continue
            brut.append({"texte": txt, "debut": self.m(base + d), "fin": self.m(base + min(f, ok[0][1]))})
        return brut

    def mots(self, json_transcription):
        brut = self._mots_bruts(json_transcription, 0.0, 0.0, [(x, y) for src, x, y, base, cum in self.parts if base == 0.0])
        for t_vo, fichier, x, y, js, decal in self.inserts:
            brut += self._mots_bruts(js, INSERT, decal, [(x, y)])
        brut.sort(key=lambda w: w["debut"])
        # alignement sur le texte prévu (orthographe juste), temps de la voix
        txt = re.sub(r"\s+([:;!?»])", "\u00a0\\1", self.texte)
        txt = re.sub(r"«\s+", "«\u00a0", txt)
        prevu = [x for x in re.split(r"[ \t\n]+", txt) if x]
        a = [norm(x["texte"]) for x in brut]
        b = [norm(x) for x in prevu]
        sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
        temps = [None] * len(prevu)
        for op, i1, i2, j1, j2 in sm.get_opcodes():
            if op == "equal":
                for k in range(i2 - i1):
                    temps[j1 + k] = (brut[i1 + k]["debut"], brut[i1 + k]["fin"])
            elif op == "replace" and i2 > i1:
                d0, f0 = brut[i1]["debut"], brut[i2 - 1]["fin"]
                n = j2 - j1
                for k in range(n):
                    temps[j1 + k] = (round(d0 + (f0 - d0) * k / n, 3), round(d0 + (f0 - d0) * (k + 1) / n, 3))
        # trous : interpolation entre voisins
        for j in range(len(prevu)):
            if temps[j] is None:
                i = j - 1
                prec = temps[i][1] if i >= 0 and temps[i] else 0.0
                k = j
                while k < len(prevu) and temps[k] is None:
                    k += 1
                suiv = temps[k][0] if k < len(prevu) else prec + 0.4 * (k - j)
                n = k - j
                for q in range(n):
                    temps[j + q] = (round(prec + (suiv - prec) * q / n, 3), round(prec + (suiv - prec) * (q + 1) / n, 3))
        self.mots_ = [{"texte": w, "debut": t[0], "fin": max(t[1], t[0] + 0.05), "phrase": "A"} for w, t in zip(prevu, temps)]
        return self.mots_

    def instant(self, mot, apres, avant=None, apres_video=None):
        """Temps vidéo du premier mot (texte prévu) qui commence par `mot` après `apres` (temps voix off d'origine)."""
        a = max(self.m(apres), apres_video or 0)
        b = self.m(avant) if avant else 1e9
        w = next((w for w in self.mots_ if a - 0.05 <= w["debut"] < b and norm(w["texte"]).startswith(norm(mot))), None)
        if not w:
            raise ValueError(f"mot introuvable : {mot} après {apres}")
        return w["debut"]

    # ------------------------------------------------------------------ extraits
    def _deja(self, sortie, *cle):
        """Vrai si le fichier existe déjà avec les mêmes paramètres (évite de refaire les extraits)."""
        h = hashlib.sha1(repr(cle).encode()).hexdigest()[:12]
        marque = sortie.with_suffix(".cle")
        if sortie.exists() and marque.exists() and marque.read_text() == h:
            return True
        marque.write_text(h)
        return False

    def extrait(self, nom, rush, morceaux, duree):
        """Morceaux du rush (recherche précise -ss par morceau : mêmes instants que les images de repérage), vitesse
        normale, puis dernière image figée jusqu'à la fin du plan."""
        sortie = self.out / f"{nom}.mp4"
        if self._deja(sortie, "ss", rush, morceaux, round(duree, 2)):
            return
        entrees, filtres, parts = [], [], []
        for k, (a, b) in enumerate(morceaux):
            entrees += ["-ss", str(a), "-t", str(round(b - a, 3)), "-i", str(RUSHES[rush])]
            filtres.append(f"[{k}:v]setpts=PTS-STARTPTS,fps={FPS},crop=1080:2160:0:140,setsar=1[p{k}]")
            parts.append(f"[p{k}]")
        filtres.append(f"{''.join(parts)}concat=n={len(parts)}:v=1:a=0,tpad=stop_mode=clone:stop_duration={duree + 1},trim=0:{duree + 0.2},setpts=PTS-STARTPTS[v]")
        subprocess.run(["ffmpeg", "-v", "error", "-y", *entrees, "-filter_complex", ";".join(filtres), "-map", "[v]",
                        "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", str(sortie)], check=True)

    def libre(self, nom, fichier, debut, duree):
        """Vidéo libre (Mixkit) : morceau à vitesse normale, en boucle si trop court, 1920 × 1080 (ou vertical tel quel)."""
        sortie = self.out / f"{nom}.mp4"
        if self._deja(sortie, fichier, debut, round(duree, 2)):
            return
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-stream_loop", "3", "-ss", str(debut), "-i", str(LIBRE / fichier), "-t", str(duree + 0.3),
                        "-an", "-vf", f"fps={FPS},scale=-2:1080", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", str(sortie)], check=True)

    def image(self, nom, rush, t, crop=None):
        sortie = self.out / f"{nom}.png"
        vf = "crop=1080:2160:0:140" + (f",crop={crop}" if crop else "")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", str(RUSHES[rush]), "-frames:v", "1", "-vf", vf, str(sortie)], check=True)

    # ------------------------------------------------------------------ scènes
    def demo(self, de, a, rush, morceaux, bandeau, zooms, surlignes=(), legendes=()):
        k = len(self.plans)
        d, f = self.m(de), self.m(a)
        nom = f"e{k}"
        self.extrait(nom, rush, morceaux, f - d)
        def tv(ts):  # repère en temps du rush (dans un des morceaux) ou en temps de voix off (chaîne 'v123.4')
            if isinstance(ts, str):
                return self.m(float(ts[1:]))
            cum = 0.0
            for a0, b0 in morceaux:
                if a0 - 0.01 <= ts <= b0 + 0.01:
                    return round(d + cum + ts - a0, 3)
                cum += b0 - a0
            raise ValueError(f"repère {ts} hors des morceaux {morceaux}")
        self.plans.append({"type": "demo", "de": de, "a": a, "fichier": nom, "bandeau": bandeau,
                           "zooms": [{"t": tv(t), "x": x, "y": y, "f": z} for t, x, y, z in zooms],
                           "surlignes": [{"t": tv(t), "x0": x0, "y0": y0, "x1": x1, "y1": y1} for t, x0, y0, x1, y1 in surlignes],
                           "legendes": [{"t": tv(t), "texte": tx} for t, tx in legendes]})

    def video(self, de, a, fichier, debut, legende, mot=None, titre=None, vertical=False):
        k = len(self.plans)
        d, f = self.m(de), self.m(a)
        nom = f"l{k}"
        self.libre(nom, fichier, debut, f - d)
        self.plans.append({"type": "libre", "de": de, "a": a, "fichier": nom, "legende": legende, "titre": titre, "vertical": vertical,
                           "tLegende": self.instant(mot, de, a) if mot else None})

    def anim(self, de, a, nom, reperes=None, **kw):
        r = {}
        for k, v in (reperes or {}).items():
            r[k] = self.instant(v[0], v[1], a) if isinstance(v, tuple) else self.m(v)
        self.plans.append({"type": "anim", "de": de, "a": a, "nom": nom, "reperes": r, **kw})

    def carte(self, de, a, titre, emoji, points, icones=None):
        insts = []
        for _, mot in points:
            insts.append(self.instant(mot, de, a, apres_video=insts[-1] + 0.01 if insts else None))
        self.plans.append({"type": "carte", "de": de, "a": a, "titre": titre, "emoji": emoji, "points": [{"texte": t, "mot": m} for t, m in points],
                           "instants": insts, "icones": icones})

    def ecrire(self):
        plans = []
        for k, p in enumerate(self.plans):
            q = dict(p)
            q["debut"] = 0.0 if k == 0 else self.m(p.pop("de") if False else p["de"])
            q["fin"] = self.m(p["a"])
            q.pop("de", None)
            q.pop("a", None)
            plans.append(q)
        for k in range(len(plans) - 1):
            plans[k]["fin"] = plans[k + 1]["debut"]
        plans[-1]["fin"] = self.duree
        (self.out / "montage.json").write_text(json.dumps({"duree": self.duree, "plans": plans, "mots": self.mots_}, ensure_ascii=False, indent=1))
        # contrôle : aucune scène plus longue que 8 s sans changement
        for p in plans:
            n = p["fin"] - p["debut"]
            print(f'{p["debut"]:7.2f} {n:5.2f} {p["type"]:6} {p.get("nom") or p.get("bandeau") or p.get("legende") or p.get("titre") or ""}')
        print("durée", self.duree)


def texte_prevu(fichier, prefixe):
    """Texte prévu (morceaux A-01… du fichier de voix off), sans les indications entre crochets."""
    out = []
    for ligne in (P2 / fichier).read_text().splitlines():
        m = re.match(rf"^{prefixe}-\d+\s*(\[[^\]]*\])?\s*(.*)$", ligne)
        if m:
            out.append(m.group(2))
    return " ".join(out)
