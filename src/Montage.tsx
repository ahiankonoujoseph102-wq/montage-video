import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame,
  useVideoConfig} from 'remotion';
import {OUVERTURE, VISAGE, ZOOM_SERRE, ZOOM_SERRE_PANNEAU} from './charte';
import {CartonFin} from './composants/CartonFin';
import {Onde} from './composants/Onde';
import {Panneau} from './composants/Panneau';
import {PassageAnime} from './composants/PassageAnime';
import {SousTitres} from './composants/SousTitres';
import {finTitreGeant, TitreAccroche} from './composants/TitreAccroche';
import {Preuve} from './composants/Preuve';
import type {Cadre, Dynamique, MontageProps, Preuve as PreuveT, Scene} from './types';
import {Autocollants} from './dynamique/Autocollants';
import {SousTitresMot} from './dynamique/SousTitresMot';
import {Superpositions} from './dynamique/Superpositions';
import {FondImage, styleTransition, transitionEnCours} from './dynamique/Transitions';

const TRANSITION_ZOOM = 4; // images : changement de cadrage très rapide

// Visage : cadre normal, puis léger zoom avant centré sur le visage, en alternant à chaque plan
// (débuts de phrase et virgules, toutes les 3 à 4 s ; calculés par scripts/preparer.py).
// Pendant un panneau, le zoom serré est limité à 6 % pour que le panneau ne touche pas la tête
// (passage progressif sur TRANSITION_ZOOM images autour du panneau).
const Visage: React.FC<{video: string; debuts: number[]; panneaux: Scene[]; fin: number; cadres?: Cadre[];
  preuve?: PreuveT | null; dyn?: Dynamique | null}> = ({video, debuts, panneaux, fin, cadres, preuve, dyn}) => {
  const f = useCurrentFrame();
  // Centre du visage du cadrage en cours (cadre large puis serré pour une prise filmée de loin).
  let visage = {x: VISAGE.x, y: VISAGE.y};
  for (const c of cadres ?? []) if (c.debut <= f) visage = c;
  // Pendant l'extrait de preuve, l'image est une autre vidéo : ni zoom ni tremblement.
  const dansPreuve = !!preuve && f >= preuve.debut && f < preuve.fin;
  let n = 0;
  while (n + 1 < debuts.length && debuts[n + 1] <= f) n++;
  const poidsPanneau = Math.max(0, ...panneaux.map((s) => Math.min(
    interpolate(f, [s.debut - TRANSITION_ZOOM, s.debut], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
    interpolate(f, [s.fin, s.fin + TRANSITION_ZOOM], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  )));
  const serre = ZOOM_SERRE - (ZOOM_SERRE - ZOOM_SERRE_PANNEAU) * poidsPanneau;
  const zoomDe = (k: number) => (k % 2 === 1 ? serre : 1);
  // Sur une coupe (style dynamique), le changement de cadrage est instantané pour masquer le saut d'image.
  const duree = dyn?.raccords?.includes(debuts[n] ?? -1) ? 0.001 : TRANSITION_ZOOM;
  const zoomPlan = interpolate(f, [debuts[n] ?? 0, (debuts[n] ?? 0) + duree], [zoomDe(n - 1), zoomDe(n)], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Ouverture : coup de zoom (visage serré à 30 %, recul jusqu'au cadre normal) et tremblement à l'impact.
  const zoom = dansPreuve ? 1 : f < OUVERTURE.recul
    ? interpolate(f, [0, OUVERTURE.recul], [OUVERTURE.zoom, zoomPlan])
    : zoomPlan;
  const amorti = dansPreuve ? 0 : Math.max(0, 1 - f / OUVERTURE.tremblement) * OUVERTURE.amplitude;
  const dx = amorti * Math.sin(f * 2.7);
  const dy = amorti * 0.7 * Math.cos(f * 3.3);
  // Style dynamique : transition (flou, bascule 3D, coup de zoom, image dans l'image) autour d'une coupe.
  const tr = transitionEnCours(dyn, f);
  const image = (
    <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${zoom})`,
      transformOrigin: `${visage.x}px ${visage.y}px`}}>
      {/* La vidéo est déjà coupée et recadrée en 1080 × 1920 par scripts/preparer.py. */}
      {/* Le son baisse doucement sur la dernière demi-seconde avant le carton de fin. */}
      <OffthreadVideo src={staticFile(video)} style={{width: '100%', height: '100%'}}
        volume={(v) => interpolate(v, [fin - 15, fin], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    </AbsoluteFill>
  );
  if (!tr) return image;
  return (
    <AbsoluteFill>
      {tr.type === 'image' || tr.type === 'bascule' ? (
        <FondImage><OffthreadVideo src={staticFile(video)} muted style={{width: '100%', height: '100%'}} /></FondImage>
      ) : null}
      <AbsoluteFill style={{...styleTransition(tr, f), transformOrigin: `${visage.x}px ${visage.y}px`}}>{image}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// Léger dégradé sombre en bas de l'image, derrière les sous-titres.
const DegradeBas: React.FC = () => (
  <AbsoluteFill
    style={{background: 'linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(0,0,0,0.38) 74%, rgba(0,0,0,0.6) 100%)'}}
  />
);

// Les tailles de texte sont mesurées (fitText) : il faut que Montserrat soit chargée avant,
// sinon chaque onglet de rendu mesure avec une police de secours et la taille saute d'une image à l'autre.
export const usePolicesChargees = () => {
  const [pret, setPret] = useState(false);
  const [attente] = useState(() => delayRender('Chargement de Montserrat'));
  useEffect(() => {
    Promise.all([document.fonts.load('800 100px Montserrat'), document.fonts.load('900 100px Montserrat')]).then(() => {
      setPret(true);
      continueRender(attente);
    });
  }, [attente]);
  return pret;
};

export const Montage: React.FC<MontageProps> = (p) => {
  const pret = usePolicesChargees();
  return pret ? <MontageCharge {...p} /> : null;
};

// Flash blanc très bref (2 images) à l'apparition du premier mot du titre.
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= OUVERTURE.flash) return null;
  // Assez léger pour que le visage reste visible sous le flash (le coup de zoom doit se voir dès l'image 0).
  return <AbsoluteFill style={{background: 'white', opacity: f === 0 ? 0.6 : 0.3}} />;
};

const MontageCharge: React.FC<MontageProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pleinEcran = p.scenes.filter((s) => s.disposition !== 'panneau');
  const panneaux = p.scenes.filter((s) => s.disposition === 'panneau');
  const dansPleinEcran = pleinEcran.some((s) => frame >= s.debut && frame < s.fin);

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <Sequence durationInFrames={p.dureeVideo} layout="none">
        <Visage video={p.video} debuts={p.plans} panneaux={panneaux} fin={p.dureeVideo} cadres={p.cadres}
          preuve={p.preuve} dyn={p.dynamique} />
      </Sequence>
      {/* L'extrait de preuve a déjà son propre dégradé. */}
      {p.preuve && frame >= p.preuve.debut && frame < p.preuve.fin ? null : <DegradeBas />}
      {panneaux.map((s) => (
        <Sequence key={s.id} from={s.debut} durationInFrames={s.fin - s.debut} layout="none">
          <Panneau scene={s} />
        </Sequence>
      ))}
      {pleinEcran.map((s) => (
        <Sequence key={s.id} from={s.debut} durationInFrames={s.fin - s.debut} layout="none">
          <PassageAnime scene={s} />
        </Sequence>
      ))}
      {p.preuve ? (
        <Sequence from={p.preuve.debut} durationInFrames={p.preuve.fin - p.preuve.debut} layout="none">
          <Preuve etiquette={p.preuve.etiquette} />
        </Sequence>
      ) : null}
      {p.titre ? <TitreAccroche titre={p.titre} /> : null}
      {p.titre ? <Flash /> : null}
      {/* L'onde sonore n'apparaît que dans les passages plein écran. */}
      {dansPleinEcran ? <Onde onde={p.onde} /> : null}
      {p.dynamique ? (
        <>
          <Autocollants dyn={p.dynamique} />
          <SousTitresMot mots={p.mots} masques={[
            [0, p.titre ? finTitreGeant(p.titre, fps) : 0],
            ...pleinEcran.map((s) => [s.debut, s.fin] as [number, number]),
            ...p.dynamique.cartonsNoirs.map((c) => [c.debut, c.fin] as [number, number]),
          ]} />
          <Superpositions dyn={p.dynamique} />
        </>
      ) : (
        <SousTitres mots={p.mots} groupes={p.groupes} masques={p.masques}
          masquerAvant={p.titre ? finTitreGeant(p.titre, fps) : 0} />
      )}
      {p.carton ? (
        <Sequence from={p.carton.debut} durationInFrames={p.carton.fin - p.carton.debut} layout="none">
          <CartonFin carton={p.carton} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
