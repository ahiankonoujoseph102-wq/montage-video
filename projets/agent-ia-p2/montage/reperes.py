"""Images d'un rush (recadrées 1080x2160 sans barre d'état) avec graduations tous les 100 px, côte à côte."""
import subprocess, sys
from PIL import Image, ImageDraw
src, sortie, temps = sys.argv[1], sys.argv[2], [float(x) for x in sys.argv[3].split(',')]
L = 360; ims = []
for t in temps:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", src, "-frames:v", "1", "-vf", "crop=1080:2160:0:140,scale=%d:-1" % L, "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True).stdout
    open("/tmp/_f.png", "wb").write(raw); im = Image.open("/tmp/_f.png").convert("RGB"); d = ImageDraw.Draw(im)
    k = L / 1080
    for y in range(0, 2160, 100):
        d.line([(0, y * k), (12 if y % 500 else 30, y * k)], fill="red", width=2); d.text((14, y * k - 6), str(y), fill="red") if y % 200 == 0 else None
    for x in range(0, 1080, 100):
        d.line([(x * k, 0), (x * k, 10)], fill="cyan", width=2)
    d.text((40, 4), f"t={t}", fill="yellow"); ims.append(im)
c = Image.new("RGB", (L * len(ims), ims[0].height)); [c.paste(im, (i * L, 0)) for i, im in enumerate(ims)]; c.save(sortie, quality=85)
