import React from 'react';
import {measureText} from '@remotion/layout-utils';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BLANC, JAUNE, PANNEAU, POLICE, ROUGE, VERT, ZONE_SURE} from '../charte';
import type {Element, Scene} from '../types';
import {Icone} from './Icones';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// Largeur utile du texte : panneau − bordures (2 × 3) − marges internes − pastille − écart, avec 4 % de sécurité.
const PASTILLE = 100;
const LARGEUR_TEXTE = (ZONE_SURE.droite - ZONE_SURE.gauche - 2 * 3 - 2 * 32 - PASTILLE - 28) * 0.96;

// Nombre de lignes après retour à la ligne mot par mot, avec la largeur réelle des mots
// (la police est chargée avant tout rendu, voir Montage.tsx).
const nbLignes = (texte: string, taille: number) => {
  const largeur = (t: string) => measureText({text: t, fontFamily: POLICE, fontSize: taille, fontWeight: '900'}).width;
  let lignes = 1;
  let courant = '';
  for (const mot of texte.split(' ')) {
    const essai = courant ? `${courant} ${mot}` : mot;
    if (courant && largeur(essai) > LARGEUR_TEXTE) {
      lignes++;
      courant = mot;
    } else {
      courant = essai;
    }
  }
  return lignes;
};

// Plus grande taille qui tient en 2 lignes ; sinon 3 lignes en plus petit.
const tailleTexte = (texte: string) => {
  for (const t of [PANNEAU.tailleTexte, 70, 64, 58]) if (nbLignes(texte, t) <= 2) return t;
  return 52;
};

// Panneau sombre semi-transparent dans le tiers supérieur : le visage reste à l'écran.
// Titre, compteur facultatif, puis un élément à la fois au rythme de la voix.
export const Panneau: React.FC<{scene: Scene}> = ({scene}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const duree = scene.fin - scene.debut;
  const elements = scene.elements.map((e) => ({...e, debut: e.debut - scene.debut}));
  const entree = spring({frame: f, fps, config: {damping: 16, overshootClamping: true}});
  const sortie = interpolate(f, [duree - 8, duree], [1, 0], clamp);

  let i = 0;
  for (let k = 0; k < elements.length; k++) if (elements[k].debut <= f) i = k;
  // Même taille de texte pour tous les panneaux. Un texte trop long pour 2 lignes à cette taille
  // est réduit (filet de sécurité) : il faut alors le raccourcir dans montage.json.
  const taille = Math.min(...elements.map((e) => tailleTexte(e.texte ?? '')));

  return (
    <div style={{position: 'absolute', top: PANNEAU.haut, left: ZONE_SURE.gauche, width: ZONE_SURE.droite - ZONE_SURE.gauche,
      height: PANNEAU.hauteur, borderRadius: 40, background: 'rgba(6,8,24,0.74)',
      border: '3px solid rgba(255,255,255,0.14)', boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
      opacity: Math.min(entree, sortie), transform: `translateY(${(1 - entree) * -50}px)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 32px', boxSizing: 'border-box'}}>
      {scene.titre ? (
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 48, color: BLANC, textTransform: 'uppercase',
          letterSpacing: 2, borderBottom: `7px solid ${JAUNE}`, lineHeight: 1.1, paddingBottom: 4}}>
          {scene.titre}
        </div>
      ) : null}
      {scene.compteur ? <Compteur elements={elements} /> : null}
      <div style={{flex: 1, alignSelf: 'stretch', display: 'flex', alignItems: 'center'}}>
        <Ligne key={i} element={elements[i]} local={f - Math.max(0, elements[i].debut)} taille={taille} />
      </div>
    </div>
  );
};

const Compteur: React.FC<{elements: Element[]}> = ({elements}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', gap: 18, marginTop: 12, alignItems: 'center'}}>
      {elements.map((e, i) => {
        const actif = f >= e.debut;
        const courant = actif && (i === elements.length - 1 || f < elements[i + 1].debut);
        return (
          <div key={i} style={{width: courant ? 28 : 20, height: courant ? 28 : 20, borderRadius: 99,
            background: actif ? (e.marque === 'coche' ? VERT : ROUGE) : 'rgba(255,255,255,0.28)',
            boxShadow: courant ? '0 0 0 5px rgba(255,255,255,0.9)' : 'none'}} />
        );
      })}
    </div>
  );
};

const Ligne: React.FC<{element: Element; local: number; taille: number}> = ({element, local, taille}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: local, fps, config: {damping: 15, stiffness: 180, overshootClamping: true}});
  const trait = interpolate(local, [4, 14], [0, 1], clamp);
  const fondMarque = element.marque === 'croix' ? ROUGE : element.marque === 'coche' ? VERT : 'rgba(255,255,255,0.18)';
  const texte = element.texte ?? '';
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 28, width: '100%', opacity: s,
      transform: `translateX(${(1 - s) * -80}px)`}}>
      <div style={{flex: `0 0 ${PASTILLE}px`, height: PASTILLE, borderRadius: 99, background: fondMarque, display: 'flex',
        alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(0,0,0,0.4)',
        transform: `scale(${0.6 + 0.4 * s})`}}>
        <Icone nom={element.marque ?? element.icone ?? 'coche'} taille={element.marque ? 58 : 66} progres={trait}
          epaisseur={element.marque ? 13 : 7} />
      </div>
      <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, lineHeight: 1.1, color: BLANC,
        textShadow: '0 4px 12px rgba(0,0,0,0.5)'}}>
        {texte}
      </div>
    </div>
  );
};
