// Rend plusieurs images d'une composition Montage avec un seul navigateur (contrôle rapide des scènes).
// Usage : npx remotion bundle src/index.ts --out-dir <bundle> ; node scripts/images.mjs <bundle> public/<projet>/props.json <dossier> 120,450,900
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const [bundle, propsFile, dossier, liste] = process.argv.slice(2);
const inputProps = JSON.parse(fs.readFileSync(propsFile, 'utf8'));
const exe = fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium_headless_shell'))
  .map((d) => `/opt/pw-browsers/${d}/chrome-linux/headless_shell`)[0];
const browser = await openBrowser('chrome', {browserExecutable: exe});
const composition = await selectComposition({serveUrl: bundle, id: 'Montage', inputProps, puppeteerInstance: browser, browserExecutable: exe});
fs.mkdirSync(dossier, {recursive: true});
for (const f of liste.split(',').map(Number)) {
  await renderStill({composition, serveUrl: bundle, frame: f, inputProps, puppeteerInstance: browser,
    output: path.join(dossier, `${String(f).padStart(5, '0')}.png`), imageFormat: 'png', browserExecutable: exe});
}
await browser.close({silent: true});
