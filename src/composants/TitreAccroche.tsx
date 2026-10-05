import React from 'react';
import {fitText, measureText} from '@remotion/layout-utils';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BLANC, CENTRE_X, JAUNE, POLICE, TITRE, ZONE_SURE} from '../charte';
import type {Titre} from '../types';

// Titre géant : au centre, par-dessus le buste (sous le menton, même avec le zoom de 30 % de l'ouverture).
const GEANT = {largeur: 760, haut: 1110, bas: 1490, tailleMax: 150};
const INTERLIGNE = 1.04;
const ESPACE_MOTS = 0.28; // en fraction de la taille du texte
const CLAQUE = 4; // images : le mot apparaît trop gros puis se pose
const CLAQUE_MAX = 1.45; // grossissement de départ, limité pour ne jamais sortir de la zone sûre
const RANGEMENT = 12; // images pour rétrécir et monter dans le bandeau
const ECHELLE_BANDEAU = 0.5;
const MARGE_BOITE = 40;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const normaliser = (m: string) => m.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const contourEpais = (taille: number) => ({
  WebkitTextStroke: `${Math.round(taille * 0.18)}px #000`, // moitié visible (le contour est dessiné sous le texte)
  paintOrder: 'stroke fill',
  textShadow: '0 6px 0 rgba(0,0,0,0.85), 0 10px 30px rgba(0,0,0,0.5)',
});

// Fin du titre géant (en images) : les sous-titres restent masqués jusque-là.
export const finTitreGeant = (titre: Titre, fps: number) => Math.round(titre.geant * fps) + RANGEMENT;

// Ouverture : titre géant dont les mots claquent un par un, puis il rétrécit et monte se ranger
// dans un bandeau en haut (zone sûre), où il reste jusqu'à `duree` secondes.
export const TitreAccroche: React.FC<{titre: Titre}> = ({titre}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fin = Math.round(titre.duree * fps);
  if (frame >= fin) return null;
  const cles = new Set(titre.motsCles.map(normaliser));

  // Mise en page des lignes : chaque ligne ajustée à la largeur, mots placés pour calculer le claquement.
  const lignes = titre.lignes.map((_, l) => {
    const mots = titre.mots.filter((m) => m.ligne === l);
    const texte = mots.map((m) => m.texte.toUpperCase()).join(' ');
    const taille = Math.min(GEANT.tailleMax, fitText({text: texte, withinWidth: GEANT.largeur, fontFamily: POLICE,
      fontWeight: 900, validateFontIsLoaded: true}).fontSize);
    const largeurs = mots.map((m) => measureText({text: m.texte.toUpperCase(), fontFamily: POLICE, fontSize: taille,
      fontWeight: '900'}).width + taille * 0.18); // + contour (moitié de 0,18 de chaque côté)
    const espace = taille * ESPACE_MOTS;
    let x = CENTRE_X - (largeurs.reduce((a, b) => a + b, 0) + espace * (mots.length - 1)) / 2;
    // Un mot qui claque ne doit jamais toucher ses voisins ni sortir de la zone sûre : le premier mot d'une
    // ligne grossit autour de son centre ; les suivants grossissent depuis leur bord gauche, vers la place
    // encore libre à droite (les mots suivants ne sont pas encore apparus).
    const places = mots.map((m, i) => {
      const gauche = x;
      const centre = x + largeurs[i] / 2;
      x += largeurs[i] + espace;
      const demi = largeurs[i] / 2;
      const grossissement = i === 0
        ? Math.min(CLAQUE_MAX, (centre - ZONE_SURE.gauche) / demi, (ZONE_SURE.droite - centre) / demi)
        : Math.min(CLAQUE_MAX, (ZONE_SURE.droite - gauche) / largeurs[i]);
      return {...m, grossissement: Math.max(1, grossissement), origine: i === 0 ? '50% 50%' : '0% 50%'};
    });
    return {taille, espace, mots: places};
  });
  const hauteur = lignes.reduce((h, l) => h + l.taille * INTERLIGNE, 0);

  // Rangement dans le bandeau : rétrécit autour du centre du bloc et monte jusqu'en haut de la zone sûre.
  const debutRangement = Math.round(titre.geant * fps);
  const p = interpolate(frame, [debutRangement, debutRangement + RANGEMENT], [0, 1],
    {...clamp, easing: Easing.inOut(Easing.cubic)});
  const hauteurBoite = hauteur + 2 * MARGE_BOITE;
  const centreBoite = GEANT.haut + hauteur / 2;
  const centreBandeau = TITRE.haut + (ECHELLE_BANDEAU * hauteurBoite) / 2;
  const echelle = 1 + (ECHELLE_BANDEAU - 1) * p;
  const decalage = (centreBandeau - centreBoite) * p;
  const sortie = interpolate(frame, [fin - 8, fin], [1, 0], clamp);
  // Le fond du bandeau n'apparaît qu'en fin de montée, pour ne pas passer sur le visage.
  const fond = interpolate(p, [0.75, 1], [0, 1], clamp);

  return (
    <div style={{position: 'absolute', left: ZONE_SURE.gauche, width: ZONE_SURE.droite - ZONE_SURE.gauche,
      top: centreBoite - hauteurBoite / 2, height: hauteurBoite, display: 'flex', justifyContent: 'center',
      opacity: sortie, transform: `translateY(${decalage}px) scale(${echelle})`, transformOrigin: '50% 50%'}}>
      <div style={{padding: `${MARGE_BOITE}px 50px`, borderRadius: 60, background: `rgba(8,10,30,${0.72 * fond})`,
        borderBottom: `16px solid rgba(255,212,0,${fond})`, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'}}>
        {lignes.map((ligne, l) => (
          <div key={l} style={{display: 'flex', justifyContent: 'center', columnGap: ligne.espace,
            height: ligne.taille * INTERLIGNE, alignItems: 'center'}}>
            {ligne.mots.map((m, i) => {
              const local = frame - m.image;
              const cle = cles.has(normaliser(m.texte));
              const grossit = interpolate(local, [0, CLAQUE], [m.grossissement, 1], {...clamp, easing: Easing.out(Easing.cubic)});
              return (
                <span key={i} style={{fontFamily: POLICE, fontWeight: 900, fontSize: ligne.taille, lineHeight: 1,
                  whiteSpace: 'nowrap', display: 'inline-block', color: cle ? JAUNE : BLANC,
                  visibility: local < 0 ? 'hidden' : 'visible', transform: `scale(${grossit})`, transformOrigin: m.origine,
                  ...contourEpais(ligne.taille)}}>
                  {m.texte.toUpperCase()}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
