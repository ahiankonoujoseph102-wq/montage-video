"""Nettoyage des voix et assemblage : bruit réduit, volume régulier, silences raccourcis, coupes douces.

Chaque source est nettoyée une fois (coupe-bas 80 Hz, réduction de bruit, -16 LUFS), puis les morceaux retenus sont
mis bout à bout. On garde la correspondance temps de la source → temps de la vidéo pour les mots et les images."""
import json
import subprocess
from pathlib import Path

import numpy as np

from textes import PROJET

SR = 48000
CACHE = Path(__file__).resolve().parent / "sorties" / "voix"
CACHE.mkdir(parents=True, exist_ok=True)
PAS = 0.01  # s : pas de l'énergie


class Source:
    def __init__(self, chemin: str):
        self.chemin = chemin
        sortie = CACHE / (Path(chemin).stem + ".f32")
        if not sortie.exists():
            pcm = subprocess.run(
                ["ffmpeg", "-v", "error", "-i", str(PROJET / chemin), "-ac", "1", "-ar", str(SR),
                 "-af", "highpass=f=80,afftdn=nr=12:nf=-42,loudnorm=I=-16:TP=-2:LRA=9", "-f", "f32le", "-"],
                check=True, capture_output=True).stdout
            sortie.write_bytes(pcm)
        self.x = np.frombuffer(sortie.read_bytes(), np.float32)
        n = int(len(self.x) / SR / PAS)
        bloc = int(SR * PAS)
        e = self.x[: n * bloc].reshape(n, bloc)
        self.db = 20 * np.log10(np.sqrt((e ** 2).mean(axis=1)) + 1e-7)
        plancher = np.percentile(self.db, 15)
        self.seuil = max(plancher + 10, -52)
        # parole repérée par le détecteur de voix (Silero, fourni avec faster-whisper) : plus fiable que l'énergie
        vad = CACHE / (Path(chemin).stem + ".vad.json")
        if not vad.exists():
            from faster_whisper.vad import VadOptions, get_speech_timestamps
            x16 = self.x[::3].copy()
            ts = get_speech_timestamps(x16, VadOptions(min_silence_duration_ms=220, speech_pad_ms=0, threshold=0.45))
            vad.write_text(json.dumps([[t["start"] / 16000, t["end"] / 16000] for t in ts]))
        self.parole = json.loads(vad.read_text())

    def parle(self, t: float) -> bool:
        i = int(t / PAS)
        return 0 <= i < len(self.db) and self.db[i] > self.seuil

    def etendre(self, debut: float, fin: float, mini: float, maxi: float) -> tuple[float, float]:
        """Marges courtes autour des mots alignés (la découpe en parole fait le reste)."""
        return max(mini, debut - 0.14), min(maxi, fin + 0.24)

    def etendre_energie(self, debut: float, fin: float, mini: float, maxi: float) -> tuple[float, float]:
        """Élargit [debut, fin] tant que la voix continue (sans dépasser [mini, maxi]), plus une petite marge."""
        t = debut
        while t - PAS > mini and t > debut - 0.5 and (self.parle(t - PAS) or self.parle(t - 2 * PAS) or self.parle(t - 4 * PAS)):
            t -= PAS
        d = max(mini, t - 0.06)
        t = fin
        while t + PAS < maxi and t < fin + 0.3 and (self.parle(t) or self.parle(t + 2 * PAS) or self.parle(t + 4 * PAS)):
            t += PAS
        f = min(maxi, t + 0.10)
        return d, f

    def morceaux(self, debut: float, fin: float, garde: float = 0.12, max_silence: float = 0.3) -> list[tuple[float, float]]:
        """Garde la parole de [debut, fin] : les silences de plus de max_silence s sont ramenés à 2 × garde."""
        zones = [(max(a - garde, debut), min(b + garde, fin)) for a, b in self.parole if b > debut and a < fin]
        out = []
        for a, b in zones:
            if out and a - out[-1][1] < max_silence - 2 * garde:
                out[-1] = (out[-1][0], b)
            elif out and a <= out[-1][1]:
                out[-1] = (out[-1][0], max(b, out[-1][1]))
            else:
                out.append((a, b))
        return [(a, b) for a, b in out if b - a > 0.08]

    def morceaux_energie(self, debut: float, fin: float, garde: float = 0.15, max_silence: float = 0.45) -> list[tuple[float, float]]:
        """Ancienne découpe à l'énergie (gardée pour comparaison)."""
        i0, i1 = int(debut / PAS), int(fin / PAS)
        voix = self.db[i0:i1] > self.seuil
        out, d, k = [], debut, 0
        while k < len(voix):
            if not voix[k]:
                j = k
                while j < len(voix) and not voix[j]:
                    j += 1
                if (j - k) * PAS > max_silence and k > 0 and j < len(voix):
                    a = debut + k * PAS + garde
                    b = debut + j * PAS - garde
                    out.append((d, a))
                    d = b
                k = j
            else:
                k += 1
        out.append((d, fin))
        return [(a, b) for a, b in out if b - a > 0.05]

    def extrait(self, a: float, b: float) -> np.ndarray:
        y = self.x[int(a * SR): int(b * SR)].copy()
        f = min(len(y) // 2, int(0.012 * SR))
        if f:
            rampe = np.linspace(0, 1, f, dtype=np.float32)
            y[:f] *= rampe
            y[-f:] *= rampe[::-1]
        return y


class Assemblage:
    """Voix de la vidéo, construite morceau par morceau."""

    def __init__(self):
        self.bouts: list[np.ndarray] = []
        self.t = 0.0
        self.carte: list[dict] = []  # {src, s0, s1, o0}

    def silence(self, d: float):
        self.bouts.append(np.zeros(int(d * SR), np.float32))
        self.t += d

    def ajouter(self, src: Source, a: float, b: float):
        y = src.extrait(a, b)
        self.carte.append({"src": src.chemin, "s0": a, "s1": b, "o0": self.t})
        self.bouts.append(y)
        self.t += len(y) / SR

    def vers_sortie(self, chemin: str, t: float):
        """Temps de la vidéo d'un instant de la source (None s'il a été coupé)."""
        for m in self.carte:
            if m["src"] == chemin and m["s0"] - 1e-3 <= t <= m["s1"] + 1e-3:
                return m["o0"] + (t - m["s0"])
        return None

    def ecrire(self, chemin: Path):
        y = np.concatenate(self.bouts) if self.bouts else np.zeros(1, np.float32)
        y = np.clip(y * 0.9, -1, 1)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                        "-ac", "2", "-c:a", "pcm_s16le", str(chemin)], input=y.tobytes(), check=True)
