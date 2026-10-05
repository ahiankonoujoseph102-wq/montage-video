import React from 'react';
import {fitText} from '@remotion/layout-utils';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {contour, BLANC, JAUNE, ONDE, POLICE, ROUGE, VERT} from '../charte';
import type {Element, Scene} from '../types';
import {FondAnime} from './FondAnime';
import {Icone} from './Icones';

const ENTREE = 10;
const SORTIE = 8;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// Zone de contenu : de sous la barre de progression jusqu'au-dessus de l'onde sonore.
const ZONE = {haut: 150, bas: ONDE.centre - ONDE.hauteurMax / 2 - 40};
const LARGEUR = 960;

// Passage plein écran (passages courts) : remplace le visage. Le contenu est centré
// verticalement dans la zone libre, pour ne pas laisser de grand vide.
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
      <div style={{position: 'absolute', top: ZONE.haut, height: ZONE.bas - ZONE.haut, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 56}}>
        {scene.titre ? <EnTete texte={scene.titre} /> : null}
        {scene.disposition === 'focus' ? <Focus elements={elements} /> : <Liste elements={elements} />}
      </div>
    </AbsoluteFill>
  );
};

const EnTete: React.FC<{texte: string}> = ({texte}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - 3, fps, config: {damping: 16, overshootClamping: true}});
  return (
    <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 78, color: BLANC, textTransform: 'uppercase',
      letterSpacing: 2, borderBottom: `10px solid ${JAUNE}`, paddingBottom: 6, lineHeight: 1.1, opacity: s,
      transform: `translateY(${(1 - s) * -30}px)`}}>
      {texte}
    </div>
  );
};

const Focus: React.FC<{elements: Element[]}> = ({elements}) => {
  const f = useCurrentFrame();
  let i = 0;
  for (let k = 0; k < elements.length; k++) if (elements[k].debut <= f) i = k;
  return <ElementFocus key={i} element={elements[i]} local={f - Math.max(0, elements[i].debut)} />;
};

const ElementFocus: React.FC<{element: Element; local: number}> = ({element, local}) => {
  const {fps} = useVideoConfig();
  const pop = spring({frame: local, fps, config: {damping: 13, stiffness: 160, overshootClamping: true}});
  const trait = interpolate(local, [2, 20], [0, 1], clamp);
  const marque = interpolate(local, [14, 24], [0, 1], clamp);
  const texte = spring({frame: local - 6, fps, config: {damping: 16, overshootClamping: true}});
  const diametre = element.grand ? 440 : 520;
  // Texte ajusté pour remplir la largeur, ligne par ligne (coupure à la virgule ou au « \n »).
  const lignes = (element.texte ?? '').split(/\n|(?<=,)\s+/);
  return (
    <>
      {element.icone ? (
        <div style={{width: diametre, height: diametre, borderRadius: 999, background: 'rgba(255,255,255,0.14)',
          border: '5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', transform: `scale(${0.5 + 0.5 * pop})`, opacity: pop}}>
          <Icone nom={element.icone} taille={diametre * 0.62} progres={trait} epaisseur={5.5} />
          {element.marque ? (
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Icone nom={element.marque} taille={diametre * 0.8} progres={marque}
                couleur={element.marque === 'croix' ? ROUGE : VERT} epaisseur={11} />
            </div>
          ) : null}
        </div>
      ) : null}
      {element.texte ? (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: texte,
          transform: `translateY(${(1 - texte) * 40}px)`}}>
          {lignes.map((l, k) => {
            const {fontSize} = fitText({text: l, withinWidth: LARGEUR, fontFamily: POLICE, fontWeight: 900, validateFontIsLoaded: true});
            return (
              <div key={k} style={{fontFamily: POLICE, fontWeight: 900, fontSize: Math.min(150, fontSize),
                lineHeight: 1.12, whiteSpace: 'nowrap', color: element.grand || k === 0 ? JAUNE : BLANC,
                ...contour, WebkitTextStroke: '0px'}}>
                {l}
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
};

// Liste de textes seuls (ex. noms d'outils, sans logos) : grandes étiquettes qui s'empilent.
const Liste: React.FC<{elements: Element[]}> = ({elements}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 64}}>
      {elements.map((e, i) => {
        const s = spring({frame: f - Math.max(0, e.debut), fps, config: {damping: 14, stiffness: 170, overshootClamping: true}});
        return (
          <div key={i} style={{fontFamily: POLICE, fontWeight: 900, fontSize: 124, lineHeight: 1.1, color: BLANC,
            padding: '18px 64px', borderRadius: 36, background: 'rgba(255,255,255,0.16)',
            border: '4px solid rgba(255,255,255,0.4)', boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            opacity: f >= e.debut ? s : 0, transform: `scale(${0.6 + 0.4 * s})`}}>
            {e.texte}
          </div>
        );
      })}
    </div>
  );
};
