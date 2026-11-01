"""Recherche Mixkit (licence Mixkit Stock Video Free : usage commercial, sans attribution). Planche par requête."""
import json, re, sys, os, urllib.request, concurrent.futures as cf
from PIL import Image, ImageDraw
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36'}
def get(u, t=60):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t).read()
os.makedirs("/tmp/p2/mk", exist_ok=True); os.chdir("/tmp/p2/mk")
meta = json.load(open("meta.json")) if os.path.exists("meta.json") else {}
for cle, q in json.loads(sys.argv[1]).items():
    html = get(f"https://mixkit.co/free-stock-video/discover/{q.replace(' ', '-')}/").decode()
    pages = list(dict.fromkeys(re.findall(r'href="/free-stock-video/([a-z0-9-]+-(\d+))/"', html)))[:12]
    items = []
    for slug, vid in pages:
        th = re.search(rf'https://assets\.mixkit\.co/active_storage/video_items/{vid}/(\d+)/{vid}-video-thumb-360-0\.jpg', html)
        base = (f"https://assets.mixkit.co/active_storage/video_items/{vid}/{th.group(1)}/{vid}-video" if th
                else f"https://assets.mixkit.co/videos/{vid}/{vid}" if int(vid) < 100000 else None)
        if not base: continue
        items.append((slug, vid, base))
    def dl(it):
        f = f"{cle}_{it[1]}.jpg"
        try:
            if not os.path.exists(f): open(f, "wb").write(get(it[2] + "-thumb-360-0.jpg"))
            return f
        except Exception: return None
    with cf.ThreadPoolExecutor(8) as ex: fs = list(ex.map(dl, items))
    items = [it for f, it in zip(fs, items) if f]; fs = [f for f in fs if f]
    W = 240; im = Image.new("RGB", (W * 6, 170 * 2), "black"); d = ImageDraw.Draw(im)
    for i, (f, it) in enumerate(zip(fs, items)):
        t = Image.open(f).convert("RGB"); t.thumbnail((W - 4, 135)); x, y = (i % 6) * W, (i // 6) * 170
        im.paste(t, (x, y)); d.text((x + 2, y + 138), f"{it[1]} {it[0][:30]}", fill="yellow")
        meta[it[1]] = {"slug": it[0], "base": it[2], "page": f"https://mixkit.co/free-stock-video/{it[0]}/", "licence": "Mixkit Stock Video Free License"}
    im.save(f"planche_{cle}.jpg", quality=80); print(cle, len(items))
json.dump(meta, open("meta.json", "w"), indent=1)
