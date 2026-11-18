"""Boîte e-mail de la vidéo automatique : relève les demandes de Joseph, accuse réception, tient la file d'attente.

Usage (secret GMAIL_APP_PASSWORD, facultatif EXPEDITEURS = adresses autorisées séparées par des virgules) :
  python3 scripts/courriel_boite.py relever          → nouvelles demandes et corrections enregistrées, « Reçu ✅ » envoyé ;
                                                       affiche « A_FAIRE=1 » s'il reste du travail
  python3 scripts/courriel_boite.py prochain         → identifiant de la plus ancienne demande en attente (marquée en cours)
  python3 scripts/courriel_boite.py extraire <id> <dossier>   → texte, consignes et pièces jointes (voix, texte) de la demande
  python3 scripts/courriel_boite.py statut <id> <statut> [clé=valeur …]

Règles :
- boîte de academyjoseph71@gmail.com (GMAIL_ADRESSE pour changer) ; seuls les e-mails des EXPEDITEURS (par défaut cette
  même adresse) sont traités ; nos propres e-mails portent l'en-tête X-Montage-Auto et sont ignorés ;
- une réponse à un e-mail de livraison (ou un objet contenant [LIS-…]) est une **correction** de cette vidéo ;
  tout autre e-mail est une **nouvelle vidéo** ;
- une demande par fichier (projets/courriel/demandes/<id>.json) : jamais de conflit entre deux lancements ; les pièces
  jointes ne sont jamais rangées dans le dépôt (elles sont relues dans Gmail au moment du montage).
"""
import datetime
import email
import imaplib
import json
import os
import re
import smtplib
import sys
from email.header import decode_header, make_header
from email.message import EmailMessage
from email.utils import make_msgid, parseaddr
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEMANDES = ROOT / "projets" / "courriel" / "demandes"
ADRESSE = os.environ.get("GMAIL_ADRESSE", "").strip() or "academyjoseph71@gmail.com"
MDP = os.environ.get("GMAIL_APP_PASSWORD", "").replace(" ", "").strip()
AUTORISES = {a.strip().lower() for a in (os.environ.get("EXPEDITEURS", "") or ADRESSE).split(",") if a.strip()} | {ADRESSE.lower()}
JOURS = 3  # on ne regarde que les e-mails des 3 derniers jours
AUDIO = (".m4a", ".mp3", ".ogg", ".opus", ".oga", ".wav", ".aac", ".amr", ".mp4", ".3gp", ".webm", ".flac", ".mpeg")
TEXTE = (".txt", ".docx", ".md")
EN_TETE = "X-Montage-Auto"


def dec(v):
    return str(make_header(decode_header(v or ""))).strip()


def demandes():
    return sorted((json.loads(f.read_text()) for f in DEMANDES.glob("*.json")), key=lambda d: d["recu"])


def ecrire(d):
    DEMANDES.mkdir(parents=True, exist_ok=True)
    (DEMANDES / f"{d['id']}.json").write_text(json.dumps(d, ensure_ascii=False, indent=1))


def lire(d_id):
    return json.loads((DEMANDES / f"{d_id}.json").read_text())


def connexion():
    if not MDP:
        sys.exit("GMAIL_APP_PASSWORD manquant (secret GitHub non transmis).")
    m = imaplib.IMAP4_SSL("imap.gmail.com")
    m.login(ADRESSE, MDP)
    m.select("INBOX", readonly=True)
    return m


def corps_texte(msg):
    """Texte brut de l'e-mail (sans la partie citée d'une réponse)."""
    texte = ""
    for part in msg.walk():
        if part.get_content_maintype() == "multipart" or part.get_filename():
            continue
        if part.get_content_type() == "text/plain":
            texte = part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", "replace")
            break
        if part.get_content_type() == "text/html" and not texte:
            h = part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", "replace")
            texte = re.sub(r"<br\s*/?>|</p>|</div>", "\n", h, flags=re.I)
            texte = re.sub(r"<[^>]+>", "", texte)
    lignes = []
    for l in texte.replace("\r", "").split("\n"):
        if re.match(r"^\s*>", l) or re.match(r"^\s*(Le|On) .{0,80}\b20\d\d\b.*(<[^>]*@|@|a écrit|a\s*$|wrote)", l) \
                or re.match(r"^\s*-{2,}\s*(Message d'origine|Original Message)", l, re.I):
            break
        if l.strip() in ("--", "-- "):
            break
        lignes.append(l.rstrip())
    return "\n".join(lignes).strip()


def pieces(msg):
    """Pièces jointes : (nom, octets)."""
    res = []
    for part in msg.walk():
        nom = part.get_filename()
        if nom:
            res.append((dec(nom), part.get_payload(decode=True) or b""))
    return res


def envoyer(sujet, corps, repond_a=None, references=None, piece=None):
    """Envoie un e-mail de la boîte à elle-même (Joseph le reçoit), marqué X-Montage-Auto ; renvoie son Message-ID."""
    m = EmailMessage()
    m["Subject"], m["From"], m["To"] = sujet, ADRESSE, os.environ.get("DESTINATAIRE", "").strip() or ADRESSE
    m[EN_TETE] = "1"
    m["Message-ID"] = make_msgid(domain="lome-ia-school.auto")
    if repond_a:
        m["In-Reply-To"] = repond_a
        m["References"] = " ".join(x for x in (references or "", repond_a) if x).strip()
    m.set_content(corps + "\n\n— Montage automatique Lomé IA School\n")
    if piece:
        m.add_attachment(Path(piece).read_bytes(), maintype="video", subtype="mp4", filename=Path(piece).name)
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=180) as s:
        s.login(ADRESSE, MDP)
        s.send_message(m)
    return m["Message-ID"]


def nouvel_id():
    return "LIS-" + datetime.datetime.utcnow().strftime("%Y%m%d-%H%M%S")


def relever():
    connues = {d["message_id"]: d for d in demandes()}
    livraisons = {}
    for d in connues.values():
        for mid in d.get("livraisons", []) + [d.get("accuse", "")]:
            if mid:
                livraisons[mid] = d
    m = connexion()
    depuis = (datetime.date.today() - datetime.timedelta(days=JOURS)).strftime("%d-%b-%Y")
    _, ids = m.search(None, f'(SINCE "{depuis}")')
    nouveaux = 0
    for num in ids[0].split():
        _, data = m.fetch(num, "(BODY.PEEK[])")
        msg = email.message_from_bytes(data[0][1])
        mid = (msg.get("Message-ID") or "").strip()
        if not mid or mid in connues or msg.get(EN_TETE):
            continue
        expediteur = parseaddr(msg.get("From", ""))[1].lower()
        if expediteur not in AUTORISES:
            continue
        sujet = dec(msg.get("Subject"))
        if re.match(r"^(🎬|✅|⚠️|🔧)", sujet):  # nos e-mails envoyés avant l'en-tête X-Montage-Auto
            continue
        texte = corps_texte(msg)
        jointes = [n for n, _ in pieces(msg)]
        refs = f"{msg.get('In-Reply-To', '')} {msg.get('References', '')}"
        parent = next((d for k, d in livraisons.items() if k and k in refs), None)
        etiquette = re.search(r"\[(LIS-[0-9-]+)\]", sujet)
        if not parent and etiquette and (DEMANDES / f"{etiquette.group(1)}.json").exists():
            parent = lire(etiquette.group(1))
        if not texte and not jointes:
            continue
        d = {"id": nouvel_id() + f"-{nouveaux}", "message_id": mid, "references": refs.strip(), "sujet": sujet,
             "recu": datetime.datetime.utcnow().isoformat(timespec="seconds"), "statut": "en_attente",
             "type": "correction" if parent else "video", "parent": parent["id"] if parent else None,
             "texte": texte, "pieces": jointes, "essais": 0, "livraisons": []}
        if parent:  # une correction remonte à la vidéo d'origine (versions successives)
            d["origine"] = parent.get("origine") or parent["id"]
            d["version"] = parent.get("version", 1) + 1
            quoi = "la correction de ta vidéo"
        else:
            d["origine"], d["version"] = d["id"], 1
            voix = "ta voix off" if any(n.lower().endswith(AUDIO) for n in jointes) else "une voix off d'IA (tu n'as pas joint d'audio)"
            quoi = f"ta vidéo, avec {voix}"
        d["accuse"] = envoyer(f"✅ Reçu : je commence {('la version ' + str(d['version'])) if parent else 'ta vidéo'} [{d['origine']}]",
                              f"Bonjour Joseph,\n\nJ'ai bien reçu ta demande et je commence {quoi}.\n"
                              f"Tu la recevras par e-mail dès qu'elle est prête (environ 30 à 60 minutes).\n\n"
                              f"Numéro de la demande : {d['id']}" + (f" (version {d['version']} de {d['origine']})" if parent else ""),
                              repond_a=mid, references=refs.strip())
        ecrire(d)
        connues[mid] = d
        nouveaux += 1
        print(f"Nouvelle demande {d['id']} ({d['type']}) : « {sujet} », pièces {jointes}", flush=True)
    m.logout()
    reste = [d for d in demandes() if d["statut"] in ("en_attente", "en_cours")]
    print(f"{nouveaux} nouvelle(s) demande(s) ; {len(reste)} en attente ou en cours")
    print("A_FAIRE=" + ("1" if any(d["statut"] == "en_attente" for d in reste) else "0"))


def prochain():
    maintenant = datetime.datetime.utcnow()
    for d in demandes():  # un montage coupé net (machine arrêtée) reste « en cours » : il repart après 3 heures
        if d["statut"] == "en_cours" and d.get("debut") and maintenant - datetime.datetime.fromisoformat(d["debut"]) > datetime.timedelta(hours=3):
            d["statut"] = "en_attente" if d.get("essais", 0) < 2 else "echec"
            ecrire(d)
    for d in demandes():
        if d["statut"] == "en_attente":
            d["statut"], d["debut"] = "en_cours", datetime.datetime.utcnow().isoformat(timespec="seconds")
            d["essais"] = d.get("essais", 0) + 1
            ecrire(d)
            print(d["id"])
            return
    print("")


def extraire(d_id, dossier):
    """Écrit demande.json (texte, consignes, type) et les pièces jointes de la demande dans <dossier>."""
    d = lire(d_id)
    out = Path(dossier)
    out.mkdir(parents=True, exist_ok=True)
    m = connexion()
    _, ids = m.search(None, f'(HEADER Message-ID "{d["message_id"]}")')
    voix, textes = None, []
    for num in ids[0].split()[:1]:
        _, data = m.fetch(num, "(BODY.PEEK[])")
        for nom, octets in pieces(email.message_from_bytes(data[0][1])):
            ext = Path(nom).suffix.lower()
            if ext in AUDIO and not voix:
                voix = out / f"voix{ext}"
                voix.write_bytes(octets)
            elif ext in TEXTE:
                f = out / f"texte{len(textes)}{ext}"
                f.write_bytes(octets)
                textes.append(f)
    m.logout()
    lus = []
    for f in textes:
        if f.suffix == ".docx":
            import zipfile
            with zipfile.ZipFile(f) as z:
                xml = z.read("word/document.xml").decode("utf-8", "replace")
            lus.append(re.sub(r"<[^>]+>", "", re.sub(r"</w:p>", "\n", xml)))
        else:
            lus.append(f.read_text(errors="replace"))
    d["fichiers_texte"] = "\n\n".join(x.strip() for x in lus if x.strip())
    d["voix"] = str(voix) if voix else None
    (out / "demande.json").write_text(json.dumps(d, ensure_ascii=False, indent=1))
    print(json.dumps({"id": d_id, "type": d["type"], "voix": bool(voix), "textes_joints": len(textes)}, ensure_ascii=False))


def extraire_voix(message_id, dossier):
    """Voix off jointe à un e-mail précis (correction d'une vidéo faite avec la voix de Joseph)."""
    out = Path(dossier)
    out.mkdir(parents=True, exist_ok=True)
    m = connexion()
    _, ids = m.search(None, f'(HEADER Message-ID "{message_id}")')
    for num in ids[0].split()[:1]:
        _, data = m.fetch(num, "(BODY.PEEK[])")
        for nom, octets in pieces(email.message_from_bytes(data[0][1])):
            if Path(nom).suffix.lower() in AUDIO:
                f = out / f"voix{Path(nom).suffix.lower()}"
                f.write_bytes(octets)
                print(f)
                return
    sys.exit("Voix off d'origine introuvable dans Gmail.")


def statut(d_id, st, *kv):
    d = lire(d_id)
    d["statut"] = st
    for x in kv:
        k, v = x.split("=", 1)
        if k == "livraison":
            d.setdefault("livraisons", []).append(v)
        else:
            d[k] = v
    if st == "en_attente" and d.get("essais", 0) >= 2:
        d["statut"] = "echec"  # deux essais ratés : on arrête (Joseph a reçu l'explication)
    ecrire(d)
    print(d["statut"])


if __name__ == "__main__":
    action = sys.argv[1]
    if action == "relever":
        relever()
    elif action == "prochain":
        prochain()
    elif action == "extraire":
        extraire(sys.argv[2], sys.argv[3])
    elif action == "extraire-voix":
        extraire_voix(sys.argv[2], sys.argv[3])
    elif action == "statut":
        statut(sys.argv[2], sys.argv[3], *sys.argv[4:])
    elif action == "envoyer":  # envoyer <objet> <id-réponse ou -> < corps
        print(envoyer(sys.argv[2], sys.stdin.read(), None if sys.argv[3] == "-" else sys.argv[3]))
