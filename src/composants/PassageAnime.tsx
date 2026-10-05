import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {contour, BLANC, JAUNE, POLICE, ROUGE, VERT} from '../charte';
import type {Element, Scene} from '../types';
import {FondAnime} from './FondAnime';
import {Icone} from './Icones';

const ENTREE = 10;
const SORTIE = 8;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Passage plein écran : remplace le visage. Les temps des éléments sont relatifs au début du passage.
export const PassageAnime: React.FC<{scene: Scene}> = ({scene}) => {
  const f = useCurrentFrame();
  const duree = scene.fin - scene.debut;
  const ouverture = Math.min(
    interpolate(f, [0, ENTREE], [0, 1], clamp),
    interpolate(f, [duree - SORTIE, duree], [1, 0], clamp),
  );
  const elements = scene.elements.map((e) => ({...e, debut: e.debut - scene.debut}));

  return (
    <AbsoluteFill style={{clipPath: `circle(${ouverture * 120}% at 50% 40%)`}}>
      <FondAnime fond={scene.fond} />
      {scene.titre ? <EnTete texte={scene.titre} haut={scene.disposition === 'liste' ? 470 : 200} /> : null}
      {scene.compteur ? <Compteur elements={elements} /> : null}
      {scene.disposition === 'focus' ? <Focus elements={elements} /> : <Liste scene={scene} elements={elements} />}
    </AbsoluteFill>
  );
};

const EnTete: React.FC<{texte: string; haut: number}> = ({texte, haut}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - 4, fps, config: {damping: 16}});
  return (
    <div style={{position: 'absolute', top: haut, left: 60, right: 60, textAlign: 'center', opacity: s,
      transform: `translateY(${(1 - s) * -30}px)`}}>
      <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 64, color: BLANC, textTransform: 'uppercase',
        letterSpacing: 2, borderBottom: `8px solid ${JAUNE}`, paddingBottom: 6}}>
        {texte}
      </span>
    </div>
  );
};

// Une pastille par élément : rouge barrée une fois l'erreur passée.
const Compteur: React.FC<{elements: Element[]}> = ({elements}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 320, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18}}>
      {elements.map((e, i) => {
        const actif = f >= e.debut;
        const courant = actif && (i === elements.length - 1 || f < elements[i + 1].debut);
        return (
          <div key={i} style={{width: courant ? 30 : 22, height: courant ? 30 : 22, borderRadius: 99, alignSelf: 'center',
            background: actif ? (e.marque === 'croix' ? ROUGE : VERT) : 'rgba(255,255,255,0.3)',
            boxShadow: courant ? '0 0 0 5px rgba(255,255,255,0.85)' : 'none'}} />
        );
      })}
    </div>
  );
};

const Focus: React.FC<{elements: Element[]}> = ({elements}) => {
  const f = useCurrentFrame();
  let i = 0;
  for (let k = 0; k < elements.length; k++) if (elements[k].debut <= f) i = k;
  const e = elements[i];
  // Le premier élément démarre avec le passage ; les suivants entrent à leur mot.
  const depart = i === 0 ? Math.min(0, e.debut) : e.debut;
  return <ElementFocus key={i} element={e} local={f - depart} />;
};

const ElementFocus: React.FC<{element: Element; local: number}> = ({element, local}) => {
  const {fps} = useVideoConfig();
  const pop = spring({frame: local, fps, config: {damping: 12, stiffness: 160}});
  const trait = interpolate(local, [2, 20], [0, 1], clamp);
  const marque = interpolate(local, [14, 24], [0, 1], clamp);
  const texte = spring({frame: local - 8, fps, config: {damping: 16}});
  const taille = element.grand ? 300 : 380;
  const centre = element.texte ? 640 : 720;
  return (
    <>
      {element.icone ? (
        <div style={{position: 'absolute', top: centre - 230, left: 540 - 230, width: 460, height: 460, borderRadius: 999,
          background: 'rgba(255,255,255,0.12)', border: '4px solid rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop})`}}>
          <Icone nom={element.icone} taille={taille} progres={trait} epaisseur={5.5} />
          {element.marque ? (
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))'}}>
              <Icone nom={element.marque} taille={420} progres={marque}
                couleur={element.marque === 'croix' ? ROUGE : VERT} epaisseur={11} />
            </div>
          ) : null}
        </div>
      ) : null}
      {element.texte ? (
        <div style={{position: 'absolute', top: centre + 270, left: 60, right: 60, textAlign: 'center',
          fontFamily: POLICE, fontWeight: 900, fontSize: element.grand ? 88 : 70, lineHeight: 1.15,
          color: element.grand ? JAUNE : BLANC, whiteSpace: element.grand ? 'nowrap' : 'normal',
          opacity: texte, transform: `translateY(${(1 - texte) * 40}px)`, ...contour, WebkitTextStroke: '0px'}}>
          {element.texte}
        </div>
      ) : null}
    </>
  );
};

const Liste: React.FC<{scene: Scene; elements: Element[]}> = ({scene, elements}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f, fps, config: {damping: 12, stiffness: 160}});
  const textesSeuls = elements.every((e) => !e.icone && !e.marque);
  return (
    <>
      {scene.icone ? (
        <div style={{position: 'absolute', top: 210, left: 0, right: 0, display: 'flex', justifyContent: 'center',
          transform: `scale(${pop})`}}>
          <Icone nom={scene.icone} taille={220} progres={interpolate(f, [0, 20], [0, 1], clamp)} epaisseur={5} />
        </div>
      ) : null}
      <div style={{position: 'absolute', top: 600, left: 80, right: 80, display: 'flex', flexDirection: 'column',
        gap: textesSeuls ? 34 : 26, alignItems: textesSeuls ? 'center' : 'stretch'}}>
        {elements.map((e, i) => {
          const s = spring({frame: f - e.debut, fps, config: {damping: 14, stiffness: 170}});
          if (f < e.debut) return <div key={i} style={{height: textesSeuls ? 120 : 92}} />;
          const coche = interpolate(f - e.debut, [6, 16], [0, 1], clamp);
          return textesSeuls ? (
            <div key={i} style={{fontFamily: POLICE, fontWeight: 900, fontSize: 84, color: BLANC, padding: '8px 48px',
              borderRadius: 26, background: 'rgba(255,255,255,0.16)', border: '3px solid rgba(255,255,255,0.35)',
              opacity: s, transform: `scale(${0.6 + 0.4 * s})`}}>
              {e.texte}
            </div>
          ) : (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 28, opacity: s,
              transform: `translateX(${(1 - s) * -120}px)`}}>
              <div style={{flex: '0 0 92px', height: 92, borderRadius: 99, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: e.marque === 'coche' ? VERT : e.marque === 'croix' ? ROUGE : 'rgba(255,255,255,0.18)',
                boxShadow: '0 6px 14px rgba(0,0,0,0.3)'}}>
                <Icone nom={e.marque ?? e.icone ?? 'coche'} taille={e.marque ? 56 : 64} progres={coche} epaisseur={e.marque ? 12 : 7} />
              </div>
              <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 62, lineHeight: 1.15, color: BLANC,
                textShadow: '0 3px 10px rgba(0,0,0,0.35)'}}>
                {e.texte}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
