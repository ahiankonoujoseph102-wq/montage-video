"""E-mail d'alerte court (Gmail, secret GMAIL_APP_PASSWORD), de academyjoseph71@gmail.com vers lui-même.

Usage : python3 scripts/alerte_email.py "<objet>" < corps.txt
"""
import os
import smtplib
import sys
from email.message import EmailMessage

adresse = os.environ.get("GMAIL_ADRESSE", "").strip() or "academyjoseph71@gmail.com"
mdp = os.environ.get("GMAIL_APP_PASSWORD", "").replace(" ", "").strip()
if not mdp:
    sys.exit("GMAIL_APP_PASSWORD manquant : alerte non envoyée.")
m = EmailMessage()
m["Subject"], m["From"], m["To"] = sys.argv[1], adresse, adresse
m.set_content(sys.stdin.read() + "\n— Montage automatique Lomé IA School\n")
with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=120) as s:
    s.login(adresse, mdp)
    s.send_message(m)
print("Alerte envoyée :", sys.argv[1])
