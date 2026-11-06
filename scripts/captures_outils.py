"""Captures réelles des pages publiques des outils cités dans les vidéos (ChatGPT, Claude, Gemini, Perplexity).

Usage (sur GitHub, accès Internet libre) : python3 scripts/captures_outils.py
- navigateur sans compte, en français, fenêtre 1280 × 860 ; capture enregistrée dans projets/outils/candidats/ ;
- copiée dans projets/outils/<outil>.png (celle que les vidéos utilisent) seulement si la page n'est pas une
  vérification anti-robot ou une erreur ; la capture déjà validée est gardée sinon ;
- projets/outils/SOURCES.md : adresse, date, usage (identification de l'outil, aucune affiliation).
"""
import datetime
import re
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
DOSSIER = ROOT / "projets" / "outils"
PAGES = {"chatgpt": "https://chatgpt.com/", "claude": "https://claude.ai/", "gemini": "https://gemini.google.com/",
         "perplexity": "https://www.perplexity.ai/"}
BLOQUE = re.compile(r"verify you are human|just a moment|checking your browser|unusual (activity|traffic)|captcha|"
                    r"access denied|attention required|are you a robot|enable javascript and cookies", re.I)

(DOSSIER / "candidats").mkdir(parents=True, exist_ok=True)
lignes, jour = [], datetime.date.today().isoformat()
with sync_playwright() as p:
    try:
        nav = p.chromium.launch(channel="chrome")  # Chrome déjà installé sur les machines GitHub
    except Exception:
        nav = p.chromium.launch()
    for k, url in PAGES.items():
        ctx = nav.new_context(viewport={"width": 1280, "height": 860}, device_scale_factor=1.5, locale="fr-FR",
                              user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like "
                                         "Gecko) Chrome/141.0.0.0 Safari/537.36")
        page = ctx.new_page()
        etat = "?"
        try:
            rep = page.goto(url, wait_until="domcontentloaded", timeout=45000)
            try:
                page.wait_for_load_state("networkidle", timeout=15000)
            except Exception:
                pass
            page.wait_for_timeout(4000)
            for bouton in ("Tout accepter", "Accepter", "Accept all", "Rejeter", "Reject all", "J'ai compris"):
                try:
                    page.get_by_role("button", name=bouton).first.click(timeout=1500)
                    page.wait_for_timeout(1000)
                    break
                except Exception:
                    pass
            texte = page.inner_text("body")[:5000]
            cand = DOSSIER / "candidats" / f"{k}.png"
            page.screenshot(path=str(cand))
            code = rep.status if rep else 0
            if code >= 400 or BLOQUE.search(texte) or len(texte.strip()) < 20:
                etat = f"refusée (HTTP {code}, page de vérification ou vide)"
            else:
                shutil.copy2(cand, DOSSIER / f"{k}.png")
                etat = f"validée automatiquement (HTTP {code}, titre « {page.title()[:60]} »)"
        except Exception as e:
            etat = f"échec : {type(e).__name__} {str(e)[:100]}"
        print(k, etat, flush=True)
        lignes.append(f"| {k} | {url} | {jour} | {etat} |")
        ctx.close()
    nav.close()

(DOSSIER / "SOURCES.md").write_text(
    "# Captures des outils cités dans les vidéos\n\n"
    "Captures d'écran des pages publiques, prises sans compte par `scripts/captures_outils.py` (lancement GitHub\n"
    "« Captures des outils »). Usage : montrer à quoi ressemble l'outil quand la vidéo le cite (citation, identification) ;\n"
    "le nom est écrit en texte, aucun partenariat ni affiliation n'est suggéré. Une capture n'est utilisée que si\n"
    "`projets/outils/<outil>.png` existe (vérifiée).\n\n| Outil | Page | Date | État |\n|---|---|---|---|\n"
    + "\n".join(lignes) + "\n")

# Logo de ChatGPT (absent de Simple Icons à la demande d'OpenAI) : fichier de Wikimedia Commons, montré seulement pour
# identifier l'outil. Gardé seulement si c'est bien un fichier SVG.
import json
import urllib.request
LOGOS = ROOT / "projets" / "logos"
for nom in ("ChatGPT_logo.svg", "ChatGPT-Logo.svg", "OpenAI_Logo.svg"):
    try:
        req = urllib.request.Request(f"https://commons.wikimedia.org/wiki/Special:FilePath/{nom}",
                                     headers={"User-Agent": "LomeIASchool-montage/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            svg = r.read()
        if b"<svg" in svg[:3000] and len(svg) < 500_000:
            (LOGOS / "chatgpt.svg").write_bytes(svg)
            meta = json.loads((LOGOS / "logos.json").read_text())
            meta["chatgpt"] = {"nom": "ChatGPT", "couleur": "#10A37F", "source": f"Wikimedia Commons, {nom}"}
            (LOGOS / "logos.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
            print("Logo ChatGPT :", nom, flush=True)
            break
    except Exception as e:
        print("Logo ChatGPT", nom, ":", type(e).__name__, flush=True)
