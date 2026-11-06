"""Envoie la vidéo du jour par e-mail (Gmail, gratuit), avec le titre, la description, les hashtags et le prompt.

Usage : GMAIL_ADRESSE=… GMAIL_MOT_DE_PASSE_APP=… python3 scripts/envoyer_email.py <video.mp4> <script.json>
Le mot de passe d'application Gmail est un secret GitHub : il n'est jamais affiché ni écrit dans un fichier.
L'e-mail part de l'adresse Gmail vers elle-même (ou vers GMAIL_DESTINATAIRE s'il est donné).
"""
import json
import os
import smtplib
import sys
from email.message import EmailMessage
from pathlib import Path

video, script = Path(sys.argv[1]), json.loads(Path(sys.argv[2]).read_text())
adresse = os.environ.get("GMAIL_ADRESSE", "").strip()
mdp = os.environ.get("GMAIL_MOT_DE_PASSE_APP", "").replace(" ", "").strip()  # Google l'affiche en 4 blocs
if not adresse or not mdp:
    sys.exit("GMAIL_ADRESSE ou GMAIL_MOT_DE_PASSE_APP manquant (secret GitHub non enregistré) : e-mail non envoyé.")
taille = video.stat().st_size
if taille >= 24_000_000:
    sys.exit(f"Vidéo trop lourde pour l'e-mail ({taille / 1e6:.1f} Mo).")

corps = f"""Ta vidéo du jour est prête (pièce jointe, {taille / 1e6:.1f} Mo).

━━━━━━━━ TITRE TIKTOK ━━━━━━━━
{script['titre']}

━━━━━━━━ DESCRIPTION ━━━━━━━━
{script.get('description', script.get('description_tiktok', ''))}

━━━━━━━━ HASHTAGS ━━━━━━━━
{script.get('hashtags', '')}

━━━━━━━━ DESCRIPTION + HASHTAGS (à coller d'un coup) ━━━━━━━━
{script.get('description_tiktok', '')}

━━━━━━━━ PROMPT (à envoyer en privé à ceux qui commentent PROMPT) ━━━━━━━━
{script.get('prompt', '')}

Rubrique : {script.get('rubrique', '?')}
— Montage automatique Lomé IA School
"""
m = EmailMessage()
m["Subject"] = f"🎬 Vidéo TikTok : {script['titre']}"
m["From"] = adresse
m["To"] = os.environ.get("GMAIL_DESTINATAIRE", "").strip() or adresse
m.set_content(corps)
nom = "".join(c if c.isalnum() or c in "-_" else "-" for c in script["titre"].lower())[:60].strip("-") or "video"
m.add_attachment(video.read_bytes(), maintype="video", subtype="mp4", filename=f"{nom}.mp4")
try:
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=120) as s:
        s.login(adresse, mdp)
        s.send_message(m)
except smtplib.SMTPAuthenticationError:
    sys.exit("Gmail refuse la connexion : vérifier le mot de passe d'application (secret GMAIL_MOT_DE_PASSE_APP).")
print(f"E-mail envoyé ({taille / 1e6:.1f} Mo en pièce jointe).")
