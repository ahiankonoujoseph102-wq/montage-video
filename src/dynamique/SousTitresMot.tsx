import React, {useMemo} from 'react';
import {measureText} from '@remotion/layout-utils';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {CENTRE_X, POLICE, ZONE_SURE} from '../charte';
import type {Mot} from '../types';

// Style dynamique : un mot à la fois, deux au plus (un mot de 3 lettres ou moins s'affiche avec le suivant :
// « DE FAÇON », « ET C'EST »), en gros, bleu vif à contour blanc épais, sur le bas du buste.
// Taille unique ; réduite seulement pour un mot de plus de 12 lettres, jamais sous 75 % ; jamais resserré en largeur :
// deux mots trop larges passent sur deux lignes. Rebond : le mot arrive à 110 % et se pose en 3 images.
// Pendant une scène illustrée (écran partagé), les sous-titres sont posés entre les deux moitiés.
const BLEU = '#1E5BFF';
const HAUT = 1330;
const BAS_MAX = ZONE_SURE.bas; // rien sous la zone sûre
export const MILIEU_PARTAGE = 960; // limite entre l'illustration et le visage
const LARGEUR = ZONE_SURE.droite - ZONE_SURE.gauche - 20;
const TAILLE = 120;
const TAILLE_MIN = TAILLE * 0.75;
const MAINTIEN = 12; // images : le dernier mot d'une phrase reste un peu affiché
const CONTOUR = 0.2;
const INTERLIGNE = 1.05;
const REBOND = {depart: 1.1, images: 3};

const lettres = (m: string) => m.replace(/[^\p{L}\p{N}]/gu, '').length;
const finPhrase = (m: string) => /[.?!]$/.test(m);
const petit = (m: string) => lettres(m) <= 3 && !/\d \d/.test(m);

type Unite = {mots: string[]; debut: number; fin: number};

// Groupes d'un ou deux mots : un petit mot (≤ 3 lettres) va avec le suivant ; s'il finit la phrase, ou si le mot
// suivant est caché (numéro de téléphone, mot doré), il va avec le précédent quand celui-ci est seul.
// Un nombre écrit en plusieurs morceaux (« 15 » « 000 ») est réuni en un seul mot.
const reunirNombres = (mots: Mot[]) => {
  const res: Mot[] = [];
  for (const m of mots) {
    const p = res[res.length - 1];
    if (p && /^\d{1,3}$/.test(p.mot) && /^\d{3}[.,]?$/.test(m.mot)) res[res.length - 1] = {...p, mot: `${p.mot} ${m.mot}`, fin: m.fin};
    else res.push(m);
  }
  return res;
};

const unites = (tous: Mot[], cache: (m: Mot) => boolean): Unite[] => {
  const res: Unite[] = [];
  const mots = reunirNombres(tous);
  const visibles = mots.map((m, i) => ({m, i})).filter(({m}) => !cache(m));
  for (let k = 0; k < visibles.length; k++) {
    const {m, i} = visibles[k];
    const suivant = visibles[k + 1];
    const suivantColle = suivant && suivant.i === i + 1;
    if (petit(m.mot) && !finPhrase(m.mot) && suivantColle) {
      res.push({mots: [m.mot, suivant.m.mot], debut: m.debut, fin: suivant.m.fin});
      k++;
      continue;
    }
    const prec = res[res.length - 1];
    if (petit(m.mot) && prec && prec.mots.length === 1 && !finPhrase(prec.mots[0])) {
      prec.mots.push(m.mot);
      prec.fin = m.fin;
      continue;
    }
    res.push({mots: [m.mot], debut: m.debut, fin: m.fin});
  }
  return res;
};

const largeur = (t: string, taille: number) =>
  measureText({text: t, fontFamily: POLICE, fontSize: taille, fontWeight: '900'}).width + taille * CONTOUR;

// Lignes et taille : une ligne à 120 px si elle tient, sinon deux lignes (deux mots), sinon taille réduite
// (mot de plus de 12 lettres seulement, jamais sous 90 px).
export const miseEnPage = (mots: string[]) => {
  const texte = mots.join(' ').toUpperCase();
  if (largeur(texte, TAILLE) <= LARGEUR) return {lignes: [texte], taille: TAILLE};
  const lignes = mots.length > 1 ? mots.map((m) => m.toUpperCase().replace(' ', '\u00a0')) : [texte];
  const plusLarge = Math.max(...lignes.map((l) => largeur(l, TAILLE)));
  const reduite = plusLarge <= LARGEUR ? TAILLE : Math.max(TAILLE_MIN, (TAILLE * LARGEUR) / plusLarge);
  return {lignes, taille: reduite};
};

export const SousTitresMot: React.FC<{mots: Mot[]; masques: [number, number][]; partages?: [number, number][]}> = (
  {mots, masques, partages = []}) => {
  const f = useCurrentFrame();
  const caches = masques;
  const liste = useMemo(() => unites(mots, (m) => caches.some(([a, b]) => m.debut >= a && m.debut < b)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mots]);
  if (caches.some(([a, b]) => f >= a && f < b)) return null;
  let i = -1;
  for (let k = 0; k < liste.length; k++) if (liste[k].debut <= f) i = k;
  if (i < 0) return null;
  const u = liste[i];
  const suivant = liste[i + 1];
  if (f > u.fin + MAINTIEN && (!suivant || suivant.debut > f)) return null;
  const {lignes, taille} = miseEnPage(u.mots);
  const hauteur = lignes.length * taille * INTERLIGNE;
  const partage = partages.some(([a, b]) => f >= a && f < b);
  const haut = partage ? MILIEU_PARTAGE - hauteur / 2 : Math.min(HAUT, BAS_MAX - hauteur);
  // Le mot arrive à 110 % et se pose à sa taille en 3 images ; jamais plus petit que sa taille normale.
  const echelle = interpolate(f - u.debut, [0, REBOND.images], [REBOND.depart, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  return (
    <div style={{position: 'absolute', top: haut, left: CENTRE_X - LARGEUR / 2, width: LARGEUR, display: 'flex',
      flexDirection: 'column', alignItems: 'center', transform: `scale(${echelle})`, transformOrigin: '50% 50%'}}>
      {lignes.map((l, k) => (
        <span key={k} style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, lineHeight: INTERLIGNE, color: BLEU,
          whiteSpace: 'nowrap', WebkitTextStroke: `${Math.round(taille * CONTOUR)}px #fff`, paintOrder: 'stroke fill',
          filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))'}}>
          {l}
        </span>
      ))}
    </div>
  );
};
