"""Images réelles d'une vidéo automatique : captures des outils cités et photos ou vidéos libres de droits.

Usage : python3 scripts/medias.py <dossier du lancement (plan.json, script.json)>
        python3 scripts/medias.py --essai <dossier de sortie> "<recherche>" ["<recherche>"…]   (test des banques d'images)

- Scène « outil » {outil: chatgpt|claude|gemini|perplexity} : vraie capture de la page publique de l'outil, prise par
  le lancement « Captures des outils » et vérifiée (projets/outils/<outil>.png, sources dans projets/outils/SOURCES.md).
  Le nom de l'outil est écrit en texte ; aucune affiliation n'est suggérée.
  Si Gemini n'en a pas prévu, la première phrase qui cite un outil (scène simple) en reçoit une (2 au plus).
- Scène « photo » {recherche: mots anglais} : vidéo puis photo Pexels si le secret PEXELS_API_KEY existe (licence Pexels :
  usage commercial gratuit, sans attribution obligatoire), sinon photo du domaine public ou CC0 via Openverse (aucune clé,
  usage commercial libre). Source, auteur et licence notés dans <dossier>/sources.json et dans l'e-mail.
- Rien ne peut casser la vidéo : une image introuvable redevient une carte de texte.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public" / "test-auto"
OUTILS = {"chatgpt": ("ChatGPT", "chatgpt.com"), "claude": ("Claude", "claude.ai"),
          "gemini": ("Gemini", "gemini.google.com"), "perplexity": ("Perplexity", "perplexity.ai")}
AGENT = "LomeIASchool-montage/1.0 (montage video automatique)"
SIMPLES = {"question", "alerte", "carte", "reponseIA"}  # scènes qu'on peut remplacer par une capture d'outil
MAX_PHOTOS = 8


def get_json(url, entetes=None):
    req = urllib.request.Request(url, headers={"User-Agent": AGENT, **(entetes or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def telecharger(url, dest, max_octets=60_000_000):
    req = urllib.request.Request(url, headers={"User-Agent": AGENT})
    with urllib.request.urlopen(req, timeout=25) as r, open(dest, "wb") as f:
        n = 0
        while bloc := r.read(1 << 16):
            n += len(bloc)
            if n > max_octets:
                raise ValueError("fichier trop lourd")
            f.write(bloc)


def preparer_photo(brut, dest):
    """Vérifie que c'est une vraie image assez grande, la ramène à 1600 px de large au plus (JPEG)."""
    from PIL import Image
    with Image.open(brut) as im:
        im = im.convert("RGB")
        if im.width < 800 or im.height < 500:
            raise ValueError(f"image trop petite ({im.width}×{im.height})")
        if im.width > 1600:
            im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
        im = flouter_textes(im)
        im.save(dest, "JPEG", quality=90)


def flouter_textes(im):
    """Floute tout texte incrusté dans la photo (nom du photographe, filigrane, signature) : demande de Joseph, ce
    n'est pas professionnel. Texte repéré par Tesseract (OCR) ; sans Tesseract, les bandes du bas et des coins où
    se trouvent presque toujours les filigranes sont floutées par précaution."""
    import shutil
    import subprocess
    import tempfile
    from PIL import ImageFilter
    zones = []
    if shutil.which("tesseract"):
        from PIL import ImageOps
        gris = ImageOps.grayscale(im)
        # Texte clair ou foncé : on lit l'image et son négatif, contraste renforcé.
        for variante in (ImageOps.autocontrast(gris), ImageOps.invert(ImageOps.autocontrast(gris))):
            with tempfile.NamedTemporaryFile(suffix=".png") as t:
                variante.save(t.name)
                r = subprocess.run(["tesseract", t.name, "stdout", "--psm", "11", "tsv"], capture_output=True, text=True)
            for ligne in r.stdout.splitlines()[1:]:
                c = ligne.split("\t")
                if len(c) == 12 and len(c[11].strip()) >= 1 and float(c[10]) > 30:
                    x, y, w, h = map(int, c[6:10])
                    bord = y + h / 2 < im.height * 0.15 or y + h / 2 > im.height * 0.85
                    # Bords (où sont les filigranes) : on floute au moindre doute ; ailleurs, seulement le texte sûr.
                    if 6 < h < im.height * 0.12 and w < im.width * 0.9 and (bord or (float(c[10]) > 70 and len(c[11].strip()) >= 3)):
                        zones.append([x, y, w, h])
        # Mots d'une même ligne réunis (un filigrane entier, pas des morceaux), élargis d'une hauteur de chaque côté.
        zones.sort(key=lambda z: (z[1], z[0]))
        lignes = []
        for z in zones:
            for L in lignes:
                if abs((L[1] + L[3] / 2) - (z[1] + z[3] / 2)) < max(L[3], z[3]) * 0.6 and z[0] - (L[0] + L[2]) < 3 * max(L[3], z[3]) \
                        and L[0] - (z[0] + z[2]) < 3 * max(L[3], z[3]):
                    x0, y0 = min(L[0], z[0]), min(L[1], z[1])
                    x1, y1 = max(L[0] + L[2], z[0] + z[2]), max(L[1] + L[3], z[1] + z[3])
                    L[:] = [x0, y0, x1 - x0, y1 - y0]
                    break
            else:
                lignes.append(list(z))
        # Une ligne de texte près d'un bord (crédit, site web, filigrane) : toute la largeur de la bande est floutée.
        zones = [(0, y, im.width, h) if (y + h / 2 < im.height * 0.15 or y + h / 2 > im.height * 0.85)
                 else (x - h, y, w + 2 * h, h) for x, y, w, h in lignes]
    else:
        zones = [(0, int(im.height * 0.9), im.width, int(im.height * 0.1))]
    for x, y, w, h in zones:
        m = max(8, h // 2)
        boite = (max(0, x - m), max(0, y - m), min(im.width, x + w + m), min(im.height, y + h + m))
        large = (max(0, boite[0] - 3 * m), max(0, boite[1] - 3 * m), min(im.width, boite[2] + 3 * m), min(im.height, boite[3] + 3 * m))
        flou = im.crop(large).filter(ImageFilter.GaussianBlur(max(6, h * 0.45))).filter(ImageFilter.GaussianBlur(max(4, h * 0.3)))
        im.paste(flou.crop((boite[0] - large[0], boite[1] - large[1], boite[2] - large[0], boite[3] - large[1])), boite[:2])
    if zones:
        print(f"  {len(zones)} texte(s) incrusté(s) flouté(s)", flush=True)
    return im


def pexels_video(recherche, cle, dest):
    d = get_json("https://api.pexels.com/videos/search?" + urllib.parse.urlencode(
        {"query": recherche, "orientation": "landscape", "per_page": 8}), {"Authorization": cle})
    for v in d.get("videos", []):
        if v.get("duration", 0) < 4:
            continue
        fichiers = sorted((x for x in v.get("video_files", []) if x.get("file_type") == "video/mp4"
                           and 960 <= (x.get("width") or 0) <= 1920), key=lambda x: x["width"])
        if not fichiers:
            continue
        brut = dest.with_suffix(".brut.mp4")
        telecharger(fichiers[0]["link"], brut)
        # 8 s au plus, sans son, 1280 px de large : léger à rendre.
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(brut), "-t", "8", "-an", "-vf",
                        "scale=1280:-2,fps=30", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", str(dest)],
                       check=True)
        brut.unlink()
        return {"source": "Pexels (vidéo)", "auteur": v.get("user", {}).get("name", ""), "page": v.get("url", ""),
                "licence": "Licence Pexels (usage commercial gratuit, attribution non obligatoire)"}
    return None


def pexels_photo(recherche, cle, dest):
    d = get_json("https://api.pexels.com/v1/search?" + urllib.parse.urlencode(
        {"query": recherche, "orientation": "landscape", "per_page": 8}), {"Authorization": cle})
    for p in d.get("photos", []):
        brut = dest.with_suffix(".brut")
        try:
            telecharger(p["src"]["large2x"], brut)
            preparer_photo(brut, dest)
        except Exception:
            continue
        finally:
            brut.unlink(missing_ok=True)
        return {"source": "Pexels (photo)", "auteur": p.get("photographer", ""), "page": p.get("url", ""),
                "licence": "Licence Pexels (usage commercial gratuit, attribution non obligatoire)"}
    return None


def pixabay_video(recherche, cle, dest):
    """Vidéo Pixabay (licence Pixabay : usage commercial gratuit, sans attribution, sans filigrane)."""
    d = get_json("https://pixabay.com/api/videos/?" + urllib.parse.urlencode(
        {"key": cle, "q": recherche[:100], "per_page": 10, "safesearch": "true", "lang": "en"}))
    for v in d.get("hits", []):
        if v.get("duration", 0) < 4:
            continue
        f = next((v["videos"][k] for k in ("medium", "large", "small") if (v.get("videos", {}).get(k) or {}).get("url")
                  and 960 <= v["videos"][k].get("width", 0) <= 1920), None)
        if not f:
            continue
        brut = dest.with_suffix(".brut.mp4")
        telecharger(f["url"], brut)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(brut), "-t", "8", "-an", "-vf",
                        "scale=1280:-2,fps=30", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", str(dest)],
                       check=True)
        brut.unlink()
        return {"source": "Pixabay (vidéo)", "auteur": v.get("user", ""), "page": v.get("pageURL", ""),
                "licence": "Licence Pixabay (usage commercial gratuit, attribution non obligatoire)"}
    return None


def pixabay_photo(recherche, cle, dest):
    d = get_json("https://pixabay.com/api/?" + urllib.parse.urlencode(
        {"key": cle, "q": recherche[:100], "image_type": "photo", "per_page": 10, "safesearch": "true", "lang": "en"}))
    for p in d.get("hits", []):
        brut = dest.with_suffix(".brut")
        try:
            telecharger(p["largeImageURL"], brut)
            preparer_photo(brut, dest)
        except Exception:
            continue
        finally:
            brut.unlink(missing_ok=True)
        return {"source": "Pixabay (photo)", "auteur": p.get("user", ""), "page": p.get("pageURL", ""),
                "licence": "Licence Pixabay (usage commercial gratuit, attribution non obligatoire)"}
    return None


def openverse_photo(recherche, dest):
    """Photo du domaine public, CC0 ou CC BY (usage commercial libre ; pour CC BY, l'auteur est crédité sur l'image et
    dans les sources). Si la recherche ne donne rien, elle est simplifiée (sans « african », puis 2 mots)."""
    mots = recherche.split()
    variantes = list(dict.fromkeys([recherche, " ".join(m for m in mots if m.lower() != "african"),
                                    " ".join([m for m in mots if m.lower() != "african"][-2:])]))
    vus, debut, essais = set(), time.time(), 0
    for q in [v for v in variantes if v.strip()]:
        for extra in ({"source": "stocksnap,rawpixel,wikimedia,flickr"}, {}):
            params = {"q": q, "license": "cc0,pdm,by", "license_type": "commercial", "page_size": 20,
                      "mature": "false", **extra}
            try:
                d = get_json("https://api.openverse.org/v1/images/?" + urllib.parse.urlencode(params))
            except Exception:
                continue
            for r in d.get("results", []):
                if r["id"] in vus or (r.get("width") or 0) < 900 or (r.get("height") or 1) > (r.get("width") or 0) * 1.1:
                    continue
                vus.add(r["id"])
                essais += 1
                if essais > 10 or time.time() - debut > 75:  # 75 s au plus par recherche
                    return None
                brut = dest.with_suffix(".brut")
                try:
                    telecharger(r["url"], brut, 25_000_000)
                    preparer_photo(brut, dest)
                except Exception:
                    continue
                finally:
                    brut.unlink(missing_ok=True)
                lic = (r.get("license") or "").lower()
                licence = {"pdm": "Domaine public (PDM)", "cc0": f"CC0 {r.get('license_version', '')}".strip()}.get(
                    lic, f"CC BY {r.get('license_version', '')} (attribution : {r.get('creator') or 'auteur inconnu'})")
                return {"source": f"Openverse / {r.get('source', '')}", "auteur": r.get("creator") or "inconnu",
                        "page": r.get("foreign_landing_url", ""), "licence": licence, "recherche_utilisee": q}
    return None


def chercher(recherche, dest_base, video_ok=True):
    """Essaie Pexels puis Pixabay (vidéo puis photo) si leurs clés existent, Openverse en dernier recours. Retourne (fichier, crédit) ou None."""
    cle = os.environ.get("PEXELS_API_KEY", "").strip()
    essais = []
    if cle:
        if video_ok:
            essais.append((".mp4", lambda d: pexels_video(recherche, cle, d)))
        essais.append((".jpg", lambda d: pexels_photo(recherche, cle, d)))
    essais.append((".jpg", lambda d: openverse_photo(recherche, d)))
    cle_px = os.environ.get("PIXABAY_API_KEY", "").strip()
    if cle_px:  # avant Openverse (photos Flickr souvent approximatives ou signées)
        pos = len(essais)
        if video_ok:
            essais.insert(pos, (".mp4", lambda d: pixabay_video(recherche, cle_px, d)))
        essais.insert(pos + (1 if video_ok else 0), (".jpg", lambda d: pixabay_photo(recherche, cle_px, d)))
        essais.sort(key=lambda e: e[1].__code__.co_names.count("openverse_photo"))  # Openverse en dernier
    for ext, f in essais:
        dest = dest_base.with_suffix(ext)
        try:
            credit = f(dest)
        except Exception as e:
            print(f"  « {recherche} » : {type(e).__name__} {str(e)[:120]}", flush=True)
            credit = None
        if credit and dest.exists():
            return dest, credit
    return None


def repli(s, phrase=""):
    """Une scène dont l'image manque redevient une carte de texte (rien ne casse)."""
    mots = [m.strip(".,;:!?«»\"") for m in phrase.split() if len(m.strip(".,;:!?«»\"")) > 3][:3]
    titre = s.get("texte") or OUTILS.get(s.get("outil", ""), ("",))[0] or " ".join(mots) or "L'IA"
    s.clear()
    s.update({"type": "carte", "texte": titre.upper()[:40]})


def main(dossier):
    plan_f = dossier / "plan.json"
    plan = json.loads(plan_f.read_text())
    phrases = json.loads((dossier / "script.json").read_text())["phrases"]
    sources = []
    caps = {k: ROOT / "projets" / "outils" / f"{k}.png" for k in OUTILS}
    # 1. Outils cités : logo (identification seulement) + nom ; capture réelle de la page publique à la 1re mention.
    logos = json.loads((ROOT / "projets" / "logos" / "logos.json").read_text())
    noms = {**{k: v["nom"] for k, v in logos.items()}, "chatgpt": "ChatGPT", "gemini": "Gemini",
            "googlesheets": "Google Sheets"}
    motifs = {k: re.compile(r"(?<![\w-])" + re.escape(n) + r"(?![\w-])", re.I if len(n) > 4 else 0)
              for k, n in noms.items() if k != "anthropic"}
    motifs["make"] = re.compile(r"(?<![\w-])Make(?![\w-])")  # « make » seulement avec sa majuscule (nom de l'outil)
    a_logo = lambda k: (ROOT / "projets" / "logos" / f"{k}.svg").exists()
    deja_capture, utilises, n_outils, precedent = set(), set(), 0, None
    for i, s in enumerate(plan["scenes"]):
        texte = phrases[i]["texte"] if i < len(phrases) else ""
        if phrases[i:i + 1] and phrases[i].get("partie") == "fin":
            continue
        prevus = s.get("outils") or ([s["outil"]] if s.get("outil") else [])
        prevus = [str(x.get("id", x) if isinstance(x, dict) else x).lower().replace(" ", "") for x in prevus]
        cites = [k for k in motifs if motifs[k].search(texte)]
        ids = [k for k in dict.fromkeys(prevus + cites) if k in noms and (a_logo(k) or caps.get(k, Path("/")).exists())][:4]
        if s.get("type") == "outil" and not ids:
            repli(s, texte)
            continue
        if not ids or (s.get("type") != "outil" and s.get("type") not in SIMPLES) or ids == precedent:
            precedent = None if s.get("type") != "outil" else precedent
            continue
        emoji, texte_scene = s.get("emoji"), s.get("texte") if s.get("type") == "outil" else None
        s.clear()
        liste = []
        for k in ids:
            capture = len(ids) == 1 and k in caps and caps[k].exists() and k not in deja_capture
            if capture:
                deja_capture.add(k)
            liste.append({"id": k, "nom": noms[k], "site": OUTILS.get(k, ("", ""))[1], "logo": a_logo(k), "capture": capture})
            utilises.add(k)
        s.update({"type": "outil", "outils": liste, "geste": "designe"})
        if texte_scene:
            s["texte"] = texte_scene
        if emoji and len(ids) > 1:
            s["emoji"] = emoji
        precedent = ids
        n_outils += 1
    (PUBLIC / "outils").mkdir(parents=True, exist_ok=True)
    (PUBLIC / "logos").mkdir(parents=True, exist_ok=True)
    for k in utilises:
        if a_logo(k):
            shutil.copy2(ROOT / "projets" / "logos" / f"{k}.svg", PUBLIC / "logos" / f"{k}.svg")
        if k in deja_capture:
            shutil.copy2(caps[k], PUBLIC / "outils" / f"{k}.png")
        sources.append({"type": "logo" + (" + capture" if k in deja_capture else ""), "outil": noms[k],
                        "source": "Simple Icons (CC0)" if k != "chatgpt" else "Wikimedia Commons",
                        "licence": "Logo montré seulement pour identifier l'outil (marque de son propriétaire), "
                                   "aucune affiliation" + (" ; capture de la page publique" if k in deja_capture else "")})
    cites = utilises
    # Démonstrations : logo et nom de l'outil dans l'en-tête de la fenêtre de discussion.
    for s in plan["scenes"]:
        if s.get("type") == "demo":
            k = str(s.get("outil", "")).lower().replace(" ", "")
            s["outil"], s["nom"], s["logo"] = k, noms.get(k, "Assistant IA"), a_logo(k)
            if a_logo(k):
                shutil.copy2(ROOT / "projets" / "logos" / f"{k}.svg", PUBLIC / "logos" / f"{k}.svg")
                utilises.add(k)
            if not s.get("prompt"):
                repli(s, s.get("reponse", ""))
    # 2. Photos et vidéos libres de droits.
    (PUBLIC / "photos").mkdir(parents=True, exist_ok=True)
    n_photos, n_videos = 0, 0
    for i, s in enumerate(plan["scenes"]):
        if s.get("type") != "photo":
            continue
        trouve = None
        if n_photos < MAX_PHOTOS and str(s.get("recherche", "")).strip():
            trouve = chercher(s["recherche"], PUBLIC / "photos" / f"{i:02d}", video_ok=n_videos < 2)
        if not trouve:
            repli(s, phrases[i]["texte"] if i < len(phrases) else "")
            continue
        fichier, credit = trouve
        s["fichier"] = f"test-auto/photos/{fichier.name}"
        s["credit"] = (f"Photo : {credit['auteur']} · {credit['licence'].split(' (')[0]}" if "CC BY" in credit["licence"]
                       else credit["source"].split(" ")[0] + (f" · {credit['auteur']}" if credit["auteur"] else ""))
        n_photos += 1
        n_videos += fichier.suffix == ".mp4"
        sources.append({"type": "vidéo" if fichier.suffix == ".mp4" else "photo", "recherche": s["recherche"], **credit})
    plan_f.write_text(json.dumps(plan, ensure_ascii=False, indent=1))
    (dossier / "sources.json").write_text(json.dumps(sources, ensure_ascii=False, indent=1))
    print(f"Médias : {n_outils} scène(s) d'outils ({len(deja_capture)} capture(s)), logos : {', '.join(sorted(cites)) or 'aucun'}, {n_photos} photo(s)/vidéo(s) libres "
          f"({'Pexels + ' if os.environ.get('PEXELS_API_KEY', '').strip() else ''}Openverse)")


if __name__ == "__main__":
    if sys.argv[1] == "--essai":
        sortie = Path(sys.argv[2])
        sortie.mkdir(parents=True, exist_ok=True)
        rapport = []
        for j, q in enumerate(sys.argv[3:]):
            t = chercher(q, sortie / f"essai{j}", video_ok=True)
            rapport.append({"recherche": q, "fichier": t[0].name if t else None, **(t[1] if t else {})})
            print(rapport[-1], flush=True)
        (sortie / "essai_medias.json").write_text(json.dumps(rapport, ensure_ascii=False, indent=1))
    else:
        d = Path(sys.argv[1])
        try:
            main(d)
        except Exception as e:  # en dernier recours : plus aucune scène photo/outil, la vidéo se fait quand même
            print(f"Médias abandonnés ({type(e).__name__}: {e}) : cartes de texte à la place", flush=True)
            plan_f = d / "plan.json"
            plan = json.loads(plan_f.read_text())
            for s in plan["scenes"]:
                ok = (s.get("type") == "photo" and s.get("fichier") and (ROOT / "public" / s["fichier"]).exists()) or \
                     (s.get("type") == "outil" and all((PUBLIC / "logos" / f"{o['id']}.svg").exists() or not o.get("logo") for o in s.get("outils", [])) and all((PUBLIC / "outils" / f"{o['id']}.png").exists() for o in s.get("outils", []) if o.get("capture")) and s.get("outils"))
                if s.get("type") in ("photo", "outil") and not ok:
                    repli(s)
            plan_f.write_text(json.dumps(plan, ensure_ascii=False, indent=1))
