"""Envoie la vidéo du jour par e-mail (Gmail, gratuit) : titre, description, hashtags, prompt et lien de téléchargement.

Usage : GMAIL_APP_PASSWORD=… python3 scripts/envoyer_email.py <video.mp4> <script.json> <lien direct du .mp4>
- de academyjoseph71@gmail.com vers academyjoseph71@gmail.com (GMAIL_ADRESSE pour changer) ;
- la vidéo n'est jamais recompressée : elle n'est jointe que si elle fait moins de 25 Mo telle quelle, sinon le lien
  (Release GitHub, pleine qualité) suffit ; jamais de .zip ;
- le mot de passe d'application est un secret GitHub : jamais affiché ni écrit dans un fichier.
"""
import json
import os
import smtplib
import sys
from email.message import EmailMessage
from pathlib import Path

LIMITE = 25_000_000  # octets : au-delà, Gmail refuse la pièce jointe

video, script, lien = Path(sys.argv[1]), json.loads(Path(sys.argv[2]).read_text()), sys.argv[3]
adresse = os.environ.get("GMAIL_ADRESSE", "").strip() or "academyjoseph71@gmail.com"
mdp = os.environ.get("GMAIL_APP_PASSWORD", "").replace(" ", "").strip()  # Google l'affiche en 4 blocs
if not mdp:
    sys.exit("GMAIL_APP_PASSWORD manquant (secret GitHub non transmis) : e-mail non envoyé.")
taille = video.stat().st_size
joindre = taille < LIMITE


def message(avec_piece):
    piece = (f"La vidéo est aussi en pièce jointe ({taille / 1e6:.1f} Mo, pleine qualité)." if avec_piece else
             f"Vidéo trop lourde pour être jointe ({taille / 1e6:.0f} Mo) : télécharge-la avec le lien ci-dessus "
             "(pleine qualité, connecté à GitHub).")
    corps = f"""Ta vidéo du jour est prête.

▶ TÉLÉCHARGER LA VIDÉO (.mp4, pleine qualité) :
{lien}

{piece}

━━━━━━━━ TITRE TIKTOK ━━━━━━━━
{script['titre']}

━━━━━━━━ DESCRIPTION ━━━━━━━━
{script.get('description', '')}

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
    m["From"] = m["To"] = adresse
    m.set_content(corps)
    if avec_piece:
        m.add_attachment(video.read_bytes(), maintype="video", subtype="mp4", filename=video.name)
    return m


def envoyer(m):
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=180) as s:
        s.login(adresse, mdp)
        s.send_message(m)


try:
    try:
        envoyer(message(joindre))
    except smtplib.SMTPException as e:
        if not joindre or isinstance(e, smtplib.SMTPAuthenticationError):
            raise
        print(f"Gmail a refusé la pièce jointe ({type(e).__name__}) : envoi avec le lien seul.", flush=True)
        joindre = False
        envoyer(message(False))
except smtplib.SMTPAuthenticationError:
    sys.exit("Gmail refuse la connexion : vérifier le mot de passe d'application (secret GMAIL_APP_PASSWORD).")
print(f"E-mail envoyé à {adresse} : lien {'+ pièce jointe' if joindre else 'seul'} ({taille / 1e6:.1f} Mo).")
