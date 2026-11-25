"""Envoie la vidéo terminée en réponse à l'e-mail de Joseph : ce qui a été fait, titre, description, hashtags, lien.

Usage : GMAIL_APP_PASSWORD=… python3 scripts/courriel_livrer.py <id> <dossier du lancement> <lien pleine qualité> [vidéo légère]
Affiche le Message-ID de l'e-mail envoyé (une réponse à cet e-mail = demande de correction).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import courriel_boite as cb  # noqa: E402

d_id, dossier, lien = sys.argv[1], Path(sys.argv[2]), sys.argv[3]
leger = Path(sys.argv[4]) if len(sys.argv) > 4 and Path(sys.argv[4]).exists() else None
d = cb.lire(d_id)
script = json.loads((dossier / "script.json").read_text())
choix = json.loads((dossier / "choix.json").read_text())
joindre = leger if leger and leger.stat().st_size < 24_000_000 else None
try:  # crédits des photos et vidéos libres de droits (affichés ici, plus jamais sur l'image)
    _src = json.loads((dossier / "sources.json").read_text())
except Exception:
    _src = []
_cc = [x for x in _src if "CC BY" in (x.get("licence") or "")]
credits = ("\n\nCRÉDITS À AJOUTER EN FIN DE DESCRIPTION (licence CC BY) :\n"
           + "\n".join(f"Photo : {x.get('auteur') or 'auteur inconnu'} ({x.get('source', '')}), {x.get('licence', '')}" for x in _cc)) if _cc else ""
version = f"version {choix['version']} — " if choix.get("version", 1) > 1 else ""
corps = f"""Bonjour Joseph,

Ta vidéo est prête 🎬 ({version}{choix['reponse']})

▶️ TÉLÉCHARGER EN PLEINE QUALITÉ (1080 × 1920, pour TikTok, Facebook, WhatsApp) :
{lien}
{"(Une version légère est aussi en pièce jointe pour la regarder tout de suite.)" if joindre else ""}

TITRE :
{script['titre']}

DESCRIPTION À COPIER :
{script['description']}

{script['hashtags']}{credits}

—
Une correction ? Réponds simplement à cet e-mail en disant ce qui ne te plaît pas ou ce que tu veux changer
(ex. « mets une voix de femme », « change la scène sur le numéro », « titre plus court »).
Je corrige et je te renvoie la nouvelle version automatiquement.

Demande : {d_id}"""
mid = cb.envoyer(f"🎬 Ta vidéo est prête [{d.get('origine') or d_id}] : {script['titre']}", corps,
                 repond_a=d["message_id"], references=d.get("references"), piece=joindre)
print(mid)
