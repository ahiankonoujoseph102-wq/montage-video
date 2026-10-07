import React from 'react';
import {fitText} from '@remotion/layout-utils';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CENTRE_X, POLICE, ZONE_SURE} from '../charte';
import type {Dynamique} from '../types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const LARGEUR = ZONE_SURE.droite - ZONE_SURE.gauche - 40;
const taille = (t: string, max: number, largeur = LARGEUR) =>
  Math.min(max, fitText({text: t, withinWidth: largeur, fontFamily: POLICE, fontWeight: 900, validateFontIsLoaded: true}).fontSize);

// Mots et chiffres forts en doré lumineux, en grand, à la place du sous-titre (masqué pendant ce temps),
// 1,5 s au plus (« \n » pour couper).
const HAUT_SOUS_TITRE = 1330;
const Dore: React.FC<{d: Dynamique['dores'][number]}> = ({d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f - d.debut, fps, config: {damping: 11, stiffness: 200}});
  const sortie = interpolate(f, [d.fin - 5, d.fin], [1, 0], clamp);
  const eclat = interpolate((f - d.debut) % 40, [0, 20, 40], [0, 1, 0]);
  const lignes = d.texte.split('\n');
  const max = lignes.length === 1 ? 160 : 115;
  const tailles = lignes.map((l) => taille(l, max));
  const hauteur = tailles.reduce((h, t) => h + t * 1.05, 0);
  const haut = Math.min(HAUT_SOUS_TITRE, ZONE_SURE.bas - hauteur);
  return (
    <div style={{position: 'absolute', top: haut, left: CENTRE_X - LARGEUR / 2, width: LARGEUR, display: 'flex',
      flexDirection: 'column', alignItems: 'center', opacity: sortie, transform: `scale(${0.4 + 0.6 * pop})`,
      transformOrigin: '50% 50%'}}>
      {lignes.map((l, i) => {
        const t = tailles[i];
        return (
          <div key={i} style={{fontFamily: POLICE, fontWeight: 900, fontSize: t, lineHeight: 1.05, whiteSpace: 'nowrap',
            backgroundImage: 'linear-gradient(180deg, #FFF6C2 0%, #FFD54A 35%, #E6A400 65%, #FFE07A 100%)',
            WebkitBackgroundClip: 'text', color: 'transparent', WebkitTextStroke: `${Math.round(t * 0.05)}px #5A3A00`,
            filter: `drop-shadow(0 0 ${12 + 14 * eclat}px rgba(255,200,40,0.85)) drop-shadow(0 6px 8px rgba(0,0,0,0.6))`}}>
            {l}
          </div>
        );
      })}
    </div>
  );
};

// Carton noir d'annonce de partie : texte blanc centré dans un cadre à crochets, mot par mot.
const CartonNoir: React.FC<{c: Dynamique['cartonsNoirs'][number]}> = ({c}) => {
  const f = useCurrentFrame();
  const local = f - c.debut;
  const mots = c.texte.split(' ');
  const t = taille(c.texte, 110, LARGEUR - 120);
  const cadre = interpolate(local, [0, 6], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const sortie = interpolate(f, [c.fin - 4, c.fin], [1, 0], clamp);
  const coin = (style: React.CSSProperties) => (
    <div style={{position: 'absolute', width: 70, height: 70, borderColor: '#fff', borderStyle: 'solid', borderWidth: 0,
      ...style}} />
  );
  return (
    <AbsoluteFill style={{background: '#000', opacity: sortie}}>
      <div style={{position: 'absolute', top: 760, left: CENTRE_X - LARGEUR / 2, width: LARGEUR, height: 320,
        transform: `scale(${0.85 + 0.15 * cadre})`, opacity: cadre}}>
        {coin({left: 0, top: 0, borderLeftWidth: 10, borderTopWidth: 10})}
        {coin({right: 0, top: 0, borderRightWidth: 10, borderTopWidth: 10})}
        {coin({left: 0, bottom: 0, borderLeftWidth: 10, borderBottomWidth: 10})}
        {coin({right: 0, bottom: 0, borderRightWidth: 10, borderBottomWidth: 10})}
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          columnGap: t * 0.28}}>
          {mots.map((m, i) => (
            <span key={i} style={{fontFamily: POLICE, fontWeight: 900, fontSize: t, color: '#fff', whiteSpace: 'nowrap',
              opacity: local >= 4 + i * 5 ? 1 : 0}}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Numéro de téléphone seul, en grand, à la place du sous-titre : bleu à contour blanc, chiffre par chiffre.
const Numero: React.FC<{n: NonNullable<Dynamique['numero']>}> = ({n}) => {
  const f = useCurrentFrame();
  const visibles = Math.max(0, Math.floor((f - n.debut) / 2));
  const t = taille(n.texte, 140, LARGEUR - 30);
  const sortie = interpolate(f, [n.fin - 6, n.fin], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: HAUT_SOUS_TITRE, left: CENTRE_X - LARGEUR / 2, width: LARGEUR, display: 'flex',
      justifyContent: 'center', opacity: sortie}}>
      <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: t, color: '#1E5BFF', whiteSpace: 'pre',
        WebkitTextStroke: `${Math.round(t * 0.2)}px #fff`, paintOrder: 'stroke fill',
        filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.5))'}}>
        {n.texte.split('').map((c, i) => <span key={i} style={{opacity: i < visibles ? 1 : 0}}>{c}</span>)}
      </span>
    </div>
  );
};

export const Superpositions: React.FC<{dyn: Dynamique}> = ({dyn}) => {
  const f = useCurrentFrame();
  return (
    <>
      {dyn.dores.filter((d) => f >= d.debut && f < d.fin).map((d) => <Dore key={d.debut} d={d} />)}
      {dyn.numero && f >= dyn.numero.debut && f < dyn.numero.fin ? <Numero n={dyn.numero} /> : null}
      {dyn.cartonsNoirs.filter((c) => f >= c.debut && f < c.fin).map((c) => <CartonNoir key={c.debut} c={c} />)}
    </>
  );
};
