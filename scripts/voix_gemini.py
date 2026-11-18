"""Voix off automatique avec la synthèse vocale de Google Gemini (clé gratuite GEMINI_API_KEY), voix de radio claire.

Usage : GEMINI_API_KEY=… python3 scripts/voix_gemini.py <script.json> <audio sortie .wav>
- le texte est lu par parties (accroche, étapes…) pour garder une diction nette, puis assemblé ;
- consigne de lecture : animateur radio professionnel, masculin, énergique, chaleureux, très bien articulé ;
- voix choisie dans VOIX_GEMINI (variable d'environnement), « Puck » par défaut (enjouée et claire) ;
- le modèle de synthèse est pris dans la liste de Google (le plus récent « …tts »).
Sortie : WAV 24 kHz mono. Ensuite scripts/decouper_voix.py le coupe en phrases comme les autres voix.
"""
import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
import wave
from pathlib import Path

BASE = "https://generativelanguage.googleapis.com/v1beta"
cle = os.environ["GEMINI_API_KEY"].strip()
VOIX = os.environ.get("VOIX_GEMINI", "Puck")
CONSIGNE = os.environ.get("CONSIGNE_VOIX", "").strip() or ("Lis ce texte en français, mot pour mot, comme un animateur radio professionnel qui donne un cours : voix "
            "masculine, énergique, chaleureuse et souriante, ton enthousiaste, articulation parfaite de chaque mot, "
            "rythme dynamique mais jamais précipité, petites pauses naturelles entre les phrases. Prononce les noms "
            "d'outils à la française courante (ChatGPT, Claude, Gemini, TikTok, Facebook) et « IA » comme « i-a ». "
            "Texte :\n\n")


def appel(url, corps, delai=180):
    req = urllib.request.Request(url, data=json.dumps(corps).encode() if corps else None,
                                 headers={"x-goog-api-key": cle, "Content-Type": "application/json"},
                                 method="POST" if corps else "GET")
    with urllib.request.urlopen(req, timeout=delai) as r:
        return json.load(r)


modeles = [m["name"].split("/")[-1] for m in appel(f"{BASE}/models?pageSize=1000", None).get("models", [])
           if "tts" in m["name"] and "generateContent" in m.get("supportedGenerationMethods", [])]
modeles.sort(key=lambda n: ("flash" not in n, [-int(x) for x in re.findall(r"\d+", n)]))
print("Modèles de voix :", ", ".join(modeles), flush=True)
if not modeles:
    sys.exit("Aucun modèle de synthèse vocale Gemini disponible pour cette clé.")

script = json.loads(Path(sys.argv[1]).read_text())
# Parties de 120 mots environ, coupées entre deux phrases.
parties, cur = [], []
for p in script["phrases"]:
    t = re.sub(r"[«»“”\"]", "", p["texte"]).replace(" :", ",").replace(":", ",")
    cur.append(t)
    if sum(len(x.split()) for x in cur) >= 110:
        parties.append(" ".join(cur))
        cur = []
if cur:
    parties.append(" ".join(cur))

pcm = b""
silence = b"\x00\x00" * int(24000 * 0.35)
for k, texte in enumerate(parties):
    corps = {"contents": [{"parts": [{"text": CONSIGNE + texte}]}],
             "generationConfig": {"responseModalities": ["AUDIO"],
                                  "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOIX}}}}}
    for essai in range(4):
        modele = modeles[min(essai, len(modeles) - 1)]
        try:
            r = appel(f"{BASE}/models/{modele}:generateContent", corps)
            data = r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
            pcm += base64.b64decode(data) + silence
            print(f"Partie {k + 1}/{len(parties)} : {modele}, {len(texte.split())} mots", flush=True)
            break
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, KeyError, IndexError) as e:
            msg = e.read().decode()[:200] if isinstance(e, urllib.error.HTTPError) else repr(e)[:200]
            print(f"Partie {k + 1} : {modele} a échoué ({msg}) — nouvel essai", flush=True)
            time.sleep(10 * (essai + 1))
    else:
        sys.exit("Synthèse vocale Gemini impossible pour une partie du texte.")
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(1), w.setsampwidth(2), w.setframerate(24000)
    w.writeframes(pcm)
print(f"Voix Gemini ({VOIX}) : {len(pcm) / 48000:.1f} s")
