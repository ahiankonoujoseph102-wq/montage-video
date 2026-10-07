import React, {useMemo} from 'react';
import {measureText} from '@remotion/layout-utils';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CENTRE_X, POLICE, ZONE_SURE} from '../charte';
import type {Mot} from '../types';

// Style dynamique : un mot à la fois (les mots de 3 lettres ou moins sont regroupés avec le suivant :
// « DE FAÇON », « ET QUALITATIVE »), en gros, bleu vif à contour blanc épais, sur le bas du buste,
// avec un petit rebond à l'apparition. Taille unique ; réduite seulement pour les mots de plus de 12 lettres,
// jamais sous 75 % ; au-delà, le texte est légèrement resserré en largeur.
const BLEU = '#1E5BFF';
const HAUT = 1330;
const LARGEUR = ZONE_SURE.droite - ZONE_SURE.gauche - 40;
const TAILLE = 120;
const TAILLE_MIN = TAILLE * 0.75;
const MAINTIEN = 12; // images : le dernier mot d'une phrase reste un peu affiché
const CONTOUR = 0.2;

const lettres = (m: string) => m.replace(/[^\p{L}\p{N}]/gu, '').length;
const finPhrase = (m: string) => /[.?!]$/.test(m);

type Unite = {texte: string; debut: number; fin: number};

// Regroupe chaque petit mot (≤ 3 lettres) avec le mot suivant ; un petit mot qui finit une phrase va avec le précédent.
const unites = (mots: Mot[]): Unite[] => {
  const res: Unite[] = [];
  let attente: Mot[] = [];
  for (const m of mots) {
    attente.push(m);
    const petit = lettres(m.mot) <= 3;
    if (petit && !finPhrase(m.mot)) continue;
    if (petit && attente.length === 1 && res.length && !finPhrase(res[res.length - 1].texte)) {
      const p = res[res.length - 1];
      res[res.length - 1] = {texte: `${p.texte} ${m.mot}`, debut: p.debut, fin: m.fin};
    } else {
      res.push({texte: attente.map((x) => x.mot).join(' '), debut: attente[0].debut, fin: m.fin});
    }
    attente = [];
  }
  if (attente.length) res.push({texte: attente.map((x) => x.mot).join(' '), debut: attente[0].debut, fin: attente[attente.length - 1].fin});
  return res;
};

export const SousTitresMot: React.FC<{mots: Mot[]; masques: [number, number][]}> = ({mots, masques}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const liste = useMemo(() => unites(mots), [mots]);
  if (masques.some(([a, b]) => f >= a && f < b)) return null;
  let i = -1;
  for (let k = 0; k < liste.length; k++) if (liste[k].debut <= f) i = k;
  if (i < 0) return null;
  const u = liste[i];
  const suivant = liste[i + 1];
  if (f > u.fin + MAINTIEN && (!suivant || suivant.debut > f)) return null;
  const texte = u.texte.toUpperCase();
  const largeurA = (t: number) => measureText({text: texte, fontFamily: POLICE, fontSize: t, fontWeight: '900'}).width * (1 + CONTOUR * 0.6);
  const longMot = Math.max(...texte.split(' ').map(lettres)) > 12;
  let taille = TAILLE;
  if (longMot && largeurA(TAILLE) > LARGEUR) taille = Math.max(TAILLE_MIN, (TAILLE * LARGEUR) / largeurA(TAILLE));
  const resserre = Math.min(1, LARGEUR / largeurA(taille));
  const rebond = spring({frame: f - u.debut, fps, config: {damping: 9, stiffness: 260, mass: 0.6}});
  const echelle = interpolate(rebond, [0, 1], [0.55, 1]);
  return (
    <div style={{position: 'absolute', top: HAUT, left: CENTRE_X - LARGEUR / 2, width: LARGEUR, display: 'flex',
      justifyContent: 'center'}}>
      <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, lineHeight: 1, color: BLEU,
        whiteSpace: 'nowrap', WebkitTextStroke: `${Math.round(taille * CONTOUR)}px #fff`, paintOrder: 'stroke fill',
        filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))', transform: `scale(${echelle * resserre}, ${echelle})`,
        display: 'inline-block'}}>
        {texte}
      </span>
    </div>
  );
};
