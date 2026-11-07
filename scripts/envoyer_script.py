"""Envoie à Joseph, par e-mail, les prochains scripts à enregistrer avec sa vraie voix.

Usage : GMAIL_APP_PASSWORD=… python3 scripts/envoyer_script.py [nombre de scripts, 2 par défaut]
- prend les prochains scripts de projets/scripts_valides/ ni produits ni déjà envoyés (projets/voix/attente.json) ;
- un e-mail par script, objet « 🎙️ À enregistrer [VIDEO <id>] <titre> » : Joseph répond à CET e-mail avec sa note
  vocale en pièce jointe, ou avec un lien Google Drive ouvert à tous ;
- le texte à lire contient la fin fixe (abonnement, PROMPT, consultation, numéro).
"""
import datetime
import json
import os
import smtplib
import sys
from email.message import EmailMessage
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ATTENTE = ROOT / "projets" / "voix" / "attente.json"
FIN = ["Abonne-toi, like et partage.", "Commente PROMPT et je t'envoie le prompt en message privé.",
       "Et ta consultation est gratuite : réserve-la avec le lien dans la bio.",
       "Ou écris-moi sur WhatsApp au +228 72 24 02 31."]

adresse = os.environ.get("GMAIL_ADRESSE", "").strip() or "academyjoseph71@gmail.com"
mdp = os.environ.get("GMAIL_APP_PASSWORD", "").replace(" ", "").strip()
n = int(sys.argv[1]) if len(sys.argv) > 1 else 2
attente = json.loads(ATTENTE.read_text()) if ATTENTE.exists() else {}
hist = json.loads((ROOT / "projets" / "test-auto" / "historique.json").read_text())
faits = {h.get("script") for h in hist if isinstance(h, dict)}
choix = []
for f in sorted((ROOT / "projets" / "scripts_valides").glob("*.json")):
    s = json.loads(f.read_text())
    if s["id"] not in faits and s["id"] not in attente:
        choix.append(s)
    if len(choix) >= n:
        break
if not choix:
    print("Plus aucun script validé à envoyer : il faut en écrire de nouveaux.")
for s in choix:
    paragraphes, cur, partie = [], [], None
    for p in s["phrases"]:
        if p["partie"] != partie and cur:
            paragraphes.append(" ".join(cur))
            cur = []
        partie = p["partie"]
        cur.append(p["texte"])
    paragraphes += [" ".join(cur), " ".join(FIN)]
    corps = (f"Voici le texte de la prochaine vidéo : « {s['titre']} ».\n\n"
             "COMMENT FAIRE (3 minutes) :\n"
             "1. Lis le texte à voix haute en enregistrant une note vocale (endroit calme, téléphone à 20 cm).\n"
             "2. Parle naturellement, avec ton énergie de formateur ; tu peux reprendre une phrase ratée.\n"
             "3. RÉPONDS À CET E-MAIL (sans changer l'objet) en joignant l'enregistrement,\n"
             "   ou en collant un lien Google Drive ouvert à « tous les utilisateurs disposant du lien ».\n"
             "La vidéo montée t'arrive ensuite par e-mail.\n\n"
             "━━━━━━━━ TEXTE À LIRE ━━━━━━━━\n\n" + "\n\n".join(paragraphes) + "\n")
    m = EmailMessage()
    m["Subject"] = f"🎙️ À enregistrer [VIDEO {s['id']}] {s['titre']}"
    m["From"] = m["To"] = adresse
    m.set_content(corps)
    if mdp:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=120) as c:
            c.login(adresse, mdp)
            c.send_message(m)
    attente[s["id"]] = {"envoye": datetime.datetime.utcnow().isoformat(timespec="minutes"), "titre": s["titre"]}
    print(("Envoyé : " if mdp else "(sans mot de passe, non envoyé) ") + m["Subject"])
ATTENTE.write_text(json.dumps(attente, ensure_ascii=False, indent=1))
