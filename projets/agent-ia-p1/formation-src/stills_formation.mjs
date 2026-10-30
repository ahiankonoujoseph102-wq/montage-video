// Images de contrôle d'une composition : node outils/stills_formation.mjs <bundle> <composition> <dossier> <t1,t2,…>
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
const [bundle, id, dossier, liste] = process.argv.slice(2);
fs.mkdirSync(dossier, {recursive: true});
const composition = await selectComposition({serveUrl: bundle, id});
for (const t of liste.split(',').map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * 30));
  await renderStill({composition, serveUrl: bundle, output: `${dossier}/${String(frame).padStart(6, '0')}.jpg`, frame, imageFormat: 'jpeg', jpegQuality: 70, scale: 0.5});
}
