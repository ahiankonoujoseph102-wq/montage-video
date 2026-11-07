"""Cherche dans Gmail la réponse de Joseph avec sa voix enregistrée pour un script en attente.

Usage : GMAIL_APP_PASSWORD=… python3 scripts/recevoir_voix.py <dossier de sortie>
- scripts en attente : projets/voix/attente.json (envoyés, pas encore reçus) ; le plus ancien d'abord ;
- accepte une pièce jointe audio (note vocale, m4a, mp3, ogg, opus, wav, aac, amr, mp4) ou un lien Google Drive ;
- écrit <dossier>/voix.<ext> et affiche « TROUVE <id> » (sinon « RIEN ») ; ne modifie pas attente.json.
"""
import email
import imaplib
import json
import os
import re
import subprocess
import sys
from email.header import decode_header, make_header
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ATTENTE = ROOT / "projets" / "voix" / "attente.json"
EXT = (".m4a", ".mp3", ".ogg", ".opus", ".oga", ".wav", ".aac", ".amr", ".mp4", ".3gp", ".webm", ".flac")
sortie = Path(sys.argv[1])
sortie.mkdir(parents=True, exist_ok=True)
adresse = os.environ.get("GMAIL_ADRESSE", "").strip() or "academyjoseph71@gmail.com"
mdp = os.environ.get("GMAIL_APP_PASSWORD", "").replace(" ", "").strip()
attente = json.loads(ATTENTE.read_text()) if ATTENTE.exists() else {}
en_attente = sorted((k for k, v in attente.items() if not v.get("recu")), key=lambda k: attente[k]["envoye"])
if not en_attente or not mdp:
    print("RIEN (aucun script en attente)" if mdp else "RIEN (GMAIL_APP_PASSWORD manquant)")
    sys.exit(0)

M = imaplib.IMAP4_SSL("imap.gmail.com")
M.login(adresse, mdp)
# Dossier « Tous les messages » (nom traduit selon la langue de Gmail) : drapeau \All.
dossier = "INBOX"
for ligne in M.list()[1]:
    l = ligne.decode(errors="ignore")
    if "\\All" in l:
        dossier = l.split(' "/" ')[-1]
        break
M.select(dossier, readonly=True)


def texte(msg):
    morceaux = []
    for part in msg.walk():
        if part.get_content_type() in ("text/plain", "text/html") and not part.get_filename():
            try:
                morceaux.append(part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", "ignore"))
            except Exception:
                pass
    return "\n".join(morceaux)


for sid in en_attente:
    typ, data = M.search(None, "X-GM-RAW", f'"subject:(VIDEO {sid}) newer_than:14d"')
    ids = data[0].split()[::-1] if typ == "OK" else []
    for num in ids:
        typ, d = M.fetch(num, "(RFC822)")
        msg = email.message_from_bytes(d[0][1])
        sujet = str(make_header(decode_header(msg.get("Subject", ""))))
        if f"[VIDEO {sid}]" not in sujet:
            continue
        # 1) pièce jointe audio
        for part in msg.walk():
            nom = part.get_filename()
            if nom:
                nom = str(make_header(decode_header(nom)))
            ctype = part.get_content_type()
            if (nom and nom.lower().endswith(EXT)) or ctype.startswith("audio/"):
                ext = Path(nom).suffix.lower() if nom and Path(nom).suffix else ".m4a"
                (sortie / f"voix{ext}").write_bytes(part.get_payload(decode=True))
                print(f"TROUVE {sid} pièce jointe {nom or ctype}")
                sys.exit(0)
        # 2) lien Google Drive dans la réponse (pas dans le texte cité de l'e-mail d'origine)
        corps = texte(msg).split("━━━━━━━━ TEXTE À LIRE")[0]
        m = re.search(r"drive\.google\.com/(?:file/d/|open\?id=|uc\?[^ ]*id=)([\w-]{20,})", corps)
        if m:
            dest = sortie / "voix_drive"
            subprocess.run(["curl", "-sSL", "--fail", "-m", "600", "-o", str(dest),
                            f"https://drive.usercontent.google.com/download?id={m.group(1)}&export=download&confirm=t"],
                           check=True)
            print(f"TROUVE {sid} lien Drive")
            sys.exit(0)
print("RIEN (pas encore de réponse avec la voix)")
