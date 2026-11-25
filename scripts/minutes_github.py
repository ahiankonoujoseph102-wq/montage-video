"""Minutes GitHub Actions utilisées ce mois-ci par ce dépôt (estimation : chaque tâche arrondie à la minute
supérieure, comme GitHub le compte), et date où les 2 000 minutes gratuites seront épuisées à ce rythme.

Usage : GH_TOKEN=… GITHUB_REPOSITORY=… python3 scripts/minutes_github.py [minutes en cours à ajouter]
Affiche une ligne JSON. Limite : seuls les lancements de ce dépôt sont vus (pas ceux des autres dépôts privés).
"""
import calendar
import datetime as dt
import json
import math
import os
import sys
import urllib.request

INCLUSES = int(os.environ.get("MINUTES_INCLUSES", "2000"))
repo, jeton = os.environ["GITHUB_REPOSITORY"], os.environ["GH_TOKEN"]
en_cours = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0


def get(url):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {jeton}",
                                               "Accept": "application/vnd.github+json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def date(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00"))


maintenant = dt.datetime.now(dt.timezone.utc)
debut = maintenant.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
total, page = 0, 1
while True:
    runs = get(f"https://api.github.com/repos/{repo}/actions/runs?per_page=100&page={page}"
               f"&created=%3E%3D{debut:%Y-%m-%d}")["workflow_runs"]
    for run in runs:
        for job in get(run["jobs_url"] + "?per_page=100&filter=all")["jobs"]:
            if job.get("started_at") and job.get("completed_at") and job.get("conclusion") != "skipped":
                total += math.ceil(max(0, (date(job["completed_at"]) - date(job["started_at"])).total_seconds()) / 60)
    if len(runs) < 100:
        break
    page += 1
total += math.ceil(en_cours)
jours = (maintenant - debut).total_seconds() / 86400
par_jour = total / max(jours, 0.5)
fin_mois = calendar.monthrange(maintenant.year, maintenant.month)[1]
epuisement = None
if par_jour > 0 and total < INCLUSES:
    j = debut + dt.timedelta(days=INCLUSES / par_jour)
    epuisement = j.date().isoformat() if j.month == maintenant.month else None
print(json.dumps({"mois": f"{maintenant:%Y-%m}", "utilisees": total, "incluses": INCLUSES,
                  "restantes": INCLUSES - total, "par_jour": round(par_jour, 1),
                  "prevision_mois": round(par_jour * fin_mois), "epuisement": epuisement}))
