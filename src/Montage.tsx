import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {VISAGE, ZOOM_SERRE} from './charte';
import {Onde} from './composants/Onde';
import {Panneau} from './composants/Panneau';
import {PassageAnime} from './composants/PassageAnime';
import {Progression} from './composants/Progression';
import {SousTitres} from './composants/SousTitres';
import {TitreAccroche} from './composants/TitreAccroche';
import type {MontageProps, Mot} from './types';

const TRANSITION_ZOOM = 4; // images : changement de cadrage très rapide

// Début (en images) de chaque phrase : là où le cadrage alterne.
const debutsDePhrase = (mots: Mot[]) =>
  mots.filter((m, i) => i === 0 || /[.?!]$/.test(mots[i - 1].mot)).map((m) => m.debut);

// Visage : cadre normal, puis léger zoom avant centré sur le visage, en alternant à chaque phrase.
const Visage: React.FC<{video: string; debuts: number[]}> = ({video, debuts}) => {
  const f = useCurrentFrame();
  let n = 0;
  while (n + 1 < debuts.length && debuts[n + 1] <= f) n++;
  const zoomDe = (k: number) => (k % 2 === 1 ? ZOOM_SERRE : 1);
  const zoom = interpolate(f, [debuts[n] ?? 0, (debuts[n] ?? 0) + TRANSITION_ZOOM], [zoomDe(n - 1), zoomDe(n)], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${VISAGE.x}px ${VISAGE.y}px`}}>
      {/* La vidéo est déjà coupée et recadrée en 1080 × 1920 par scripts/preparer.py. */}
      <OffthreadVideo src={staticFile(video)} style={{width: '100%', height: '100%'}} />
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
const usePolicesChargees = () => {
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

const MontageCharge: React.FC<MontageProps> = (p) => {
  const frame = useCurrentFrame();
  const debuts = useMemo(() => debutsDePhrase(p.mots), [p.mots]);
  const pleinEcran = p.scenes.filter((s) => s.disposition !== 'panneau');
  const panneaux = p.scenes.filter((s) => s.disposition === 'panneau');
  const dansPleinEcran = pleinEcran.some((s) => frame >= s.debut && frame < s.fin);

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <Visage video={p.video} debuts={debuts} />
      <DegradeBas />
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
      {p.titre ? <TitreAccroche titre={p.titre} /> : null}
      {/* L'onde sonore n'apparaît que dans les passages plein écran. */}
      {dansPleinEcran ? <Onde onde={p.onde} /> : null}
      <SousTitres mots={p.mots} groupes={p.groupes} />
      <Progression total={p.dureeImages} />
    </AbsoluteFill>
  );
};
