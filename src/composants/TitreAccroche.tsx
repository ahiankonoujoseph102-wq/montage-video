import React from 'react';
import {measureText} from '@remotion/layout-utils';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BLANC, CENTRE_X, JAUNE, POLICE, TITRE, ZONE_SURE} from '../charte';
import type {Titre} from '../types';

// Titre géant : chaque ligne remplit toute la largeur de la zone sûre ; le bloc est posé sur le buste,
// son bas en bas de la zone sûre, son haut jamais au-dessus de GEANT.hautMini (menton à ~1084 px avec le zoom
// de 35 % de la première image, ~1000 px en cadre normal).
const GEANT = {largeur: ZONE_SURE.droite - ZONE_SURE.gauche - 10, bas: ZONE_SURE.bas - 8, hautMini: 1088};
const INTERLIGNE = 1.02;
const ESPACE_MOTS = 0.26; // en fraction de la taille du texte
const CONTOUR = 0.18; // épaisseur du contour noir (moitié visible, dessinée sous le texte)
const BLOC = {x: 0.12, y: 0.03}; // marges du bloc jaune du mot-clé, en fraction de la taille
const CLAQUE = 4; // images : la ligne apparaît étirée en hauteur puis se pose
const CLAQUE_MAX = 1.25; // étirement vertical de départ (la largeur ne bouge pas : elle remplit déjà la zone)
const RANGEMENT = 12; // images pour rétrécir et monter dans le bandeau
const ECHELLE_BANDEAU = 0.5;
const MARGE_BOITE = 40;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const normaliser = (m: string) => m.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

// Fin du titre géant (en images) : les sous-titres restent masqués jusque-là.
export const finTitreGeant = (titre: Titre, fps: number) => Math.round(titre.geant * fps) + RANGEMENT;

// Ouverture : titre géant dont les lignes claquent une à une (toutes les 5 images), puis il rétrécit et monte
// se ranger dans un bandeau en haut (zone sûre), où il reste jusqu'à `duree` secondes.
export const TitreAccroche: React.FC<{titre: Titre}> = ({titre}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fin = Math.round(titre.duree * fps);
  if (frame >= fin) return null;
  const cles = new Set(titre.motsCles.map(normaliser));

  // Taille de chaque ligne : mesurée à 100 px (mots + espaces + bloc jaune + contour), puis mise à l'échelle
  // pour que la ligne fasse exactement la largeur de la zone sûre.
  const lignes = titre.mots.map((ligne) => {
    const mots = ligne.texte.toUpperCase().split(' ').map((texte) => ({texte, cle: cles.has(normaliser(texte))}));
    const largeur100 = mots.reduce((l, m) => l + measureText({text: m.texte, fontFamily: POLICE, fontSize: 100,
      fontWeight: '900'}).width + (m.cle ? 2 * BLOC.x * 100 : 0), 0)
      + ESPACE_MOTS * 100 * (mots.length - 1) + CONTOUR * 100;
    return {...ligne, mots, taille: (GEANT.largeur / largeur100) * 100};
  });
  let hauteur = lignes.reduce((h, l) => h + l.taille * INTERLIGNE, 0);
  // Filet de sécurité : si le bloc monterait jusqu'au visage, toutes les lignes sont réduites ensemble.
  const reduction = Math.min(1, (GEANT.bas - GEANT.hautMini) / hauteur);
  lignes.forEach((l) => (l.taille *= reduction));
  hauteur *= reduction;
  const haut = GEANT.bas - hauteur;

  // Rangement dans le bandeau : rétrécit autour du centre du bloc et monte jusqu'en haut de la zone sûre.
  const debutRangement = Math.round(titre.geant * fps);
  const p = interpolate(frame, [debutRangement, debutRangement + RANGEMENT], [0, 1],
    {...clamp, easing: Easing.inOut(Easing.cubic)});
  const hauteurBoite = hauteur + 2 * MARGE_BOITE;
  const centreBoite = haut + hauteur / 2;
  const centreBandeau = TITRE.haut + (ECHELLE_BANDEAU * hauteurBoite) / 2;
  const echelle = 1 + (ECHELLE_BANDEAU - 1) * p;
  const decalage = (centreBandeau - centreBoite) * p;
  const sortie = interpolate(frame, [fin - 8, fin], [1, 0], clamp);
  // Le fond du bandeau n'apparaît qu'en fin de montée, pour ne pas passer sur le visage.
  const fond = interpolate(p, [0.75, 1], [0, 1], clamp);

  return (
    <div style={{position: 'absolute', left: CENTRE_X - GEANT.largeur / 2 - MARGE_BOITE, width: GEANT.largeur + 2 * MARGE_BOITE,
      top: haut - MARGE_BOITE, height: hauteurBoite, opacity: sortie, borderRadius: 60,
      background: `rgba(8,10,30,${0.72 * fond})`, borderBottom: `16px solid rgba(255,212,0,${fond})`,
      transform: `translateY(${decalage}px) scale(${echelle})`, transformOrigin: '50% 50%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      {lignes.map((ligne, l) => {
        const local = frame - ligne.image;
        // Étirement vers le bas, limité pour que la ligne ne sorte jamais par le bas de la zone sûre.
        const basLigne = haut + lignes.slice(0, l + 1).reduce((h, x) => h + x.taille * INTERLIGNE, 0);
        const hautLigne = basLigne - ligne.taille * INTERLIGNE;
        const etirementMax = Math.min(CLAQUE_MAX, (ZONE_SURE.bas - hautLigne) / (ligne.taille * INTERLIGNE));
        const etire = interpolate(local, [0, CLAQUE], [Math.max(1, etirementMax), 1],
          {...clamp, easing: Easing.out(Easing.cubic)});
        return (
          <div key={l} style={{display: 'flex', justifyContent: 'center', alignItems: 'center',
            columnGap: ligne.taille * ESPACE_MOTS, height: ligne.taille * INTERLIGNE,
            visibility: local < 0 ? 'hidden' : 'visible', transform: `scaleY(${etire})`, transformOrigin: '50% 0%'}}>
            {ligne.mots.map((m, i) => (
              <span key={i} style={{fontFamily: POLICE, fontWeight: 900, fontSize: ligne.taille, lineHeight: 1,
                whiteSpace: 'nowrap', display: 'inline-block',
                ...(m.cle
                  ? {color: '#000', background: JAUNE, padding: `${BLOC.y * ligne.taille}px ${BLOC.x * ligne.taille}px`,
                    borderRadius: ligne.taille * 0.08, boxShadow: '0 8px 22px rgba(0,0,0,0.45)'}
                  : {color: BLANC, WebkitTextStroke: `${Math.round(ligne.taille * CONTOUR)}px #000`,
                    paintOrder: 'stroke fill', textShadow: '0 6px 0 rgba(0,0,0,0.85), 0 10px 30px rgba(0,0,0,0.5)'})}}>
                {m.texte}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
};
