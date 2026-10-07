import React from 'react';
import {fitText} from '@remotion/layout-utils';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BLANC, CENTRE_X, JAUNE, POLICE, ZONE_SURE} from './charte';
import {FondAnime} from './composants/FondAnime';
import {usePolicesChargees} from './Montage';

// Carton de transition entre deux vidéos (3 s = 90 images) :
// balayage d'entrée par-dessus la dernière image de la première vidéo, « ET MAINTENANT… » qui claque,
// texte principal + bloc jaune (avec l'impact sonore, image IMPACT), bouton de lecture qui pulse, puis
// coup de zoom avant dans le bouton qui ouvre sur la première image de la vidéo suivante.
export type TransitionProps = {avant: string; apres: string; surtitre: string; titre: string; bloc: string};

export const IMAGES = {balayage: 7, surtitre: 9, impact: 36, bloc: 42, bouton: 48, zoom: 78, total: 90};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const LARGEUR = ZONE_SURE.droite - ZONE_SURE.gauche - 40;
// Hauteurs fixes : le carton occupe la zone sûre (200–1530 px) de haut en bas, sans chevauchement.
const POS = {surtitre: 380, titre: 520, bloc: 880};
const BOUTON = {y: 1200, diametre: 230};

const claque = (f: number, debut: number, de = 1.5) =>
  interpolate(f, [debut, debut + 4], [de, 1], {...clamp, easing: Easing.out(Easing.cubic)});

export const Transition: React.FC<TransitionProps> = (p) => {
  const pret = usePolicesChargees();
  const f = useCurrentFrame();
  if (!pret) return null;

  // Entrée : bande en biais qui balaie de droite à gauche.
  const balayage = interpolate(f, [0, IMAGES.balayage], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const x = 1080 * (1 - balayage) * 1.4;
  const masqueEntree = `polygon(${x}px 0, ${x + 1600}px 0, ${x + 1600}px 1920px, ${x - 450}px 1920px)`;

  // Sortie : coup de zoom avant centré sur le bouton, puis cercle qui s'ouvre sur la vidéo suivante.
  const zoom = interpolate(f, [IMAGES.zoom, IMAGES.total - 1], [1, 9], {...clamp, easing: Easing.in(Easing.cubic)});
  const ouverture = interpolate(f, [IMAGES.zoom + 3, IMAGES.total - 1], [0, 1300], {...clamp, easing: Easing.in(Easing.quad)});

  const taille = (texte: string, max: number) =>
    Math.min(max, fitText({text: texte, withinWidth: LARGEUR, fontFamily: POLICE, fontWeight: 900, validateFontIsLoaded: true}).fontSize);
  const tSur = taille(p.surtitre, 96);
  const lignesTitre = p.titre.split('\n');
  const tBloc = taille(p.bloc, 76) * 0.92; // marge pour le bloc jaune
  const pulse = 1 + 0.08 * Math.sin(((f - IMAGES.bouton) / 30) * 2 * Math.PI * 1.6);
  const bouton = interpolate(f, [IMAGES.bouton, IMAGES.bouton + 6], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const halo = ((f - IMAGES.bouton) % 20) / 20;

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <Img src={staticFile(p.avant)} style={{width: '100%', height: '100%'}} />
      <AbsoluteFill style={{clipPath: masqueEntree}}>
        <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${CENTRE_X}px ${BOUTON.y}px`}}>
          <FondAnime fond="nuit" />
          <div style={{position: 'absolute', top: POS.surtitre, left: CENTRE_X - LARGEUR / 2, width: LARGEUR,
            display: 'flex', justifyContent: 'center'}}>
            <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: tSur, color: JAUNE, letterSpacing: 3,
              whiteSpace: 'nowrap', lineHeight: 1,
              visibility: f < IMAGES.surtitre ? 'hidden' : 'visible', transform: `scale(${claque(f, IMAGES.surtitre)})`}}>
              {p.surtitre}
            </div>
          </div>
          <div style={{position: 'absolute', top: POS.titre, left: CENTRE_X - LARGEUR / 2, width: LARGEUR,
            display: 'flex', justifyContent: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center',
              visibility: f < IMAGES.impact ? 'hidden' : 'visible', transform: `scale(${claque(f, IMAGES.impact, 1.35)})`}}>
              {lignesTitre.map((l, i) => (
                <div key={i} style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille(l, 150), lineHeight: 1.02,
                  color: BLANC, whiteSpace: 'nowrap', WebkitTextStroke: '14px #000', paintOrder: 'stroke fill',
                  textShadow: '0 8px 30px rgba(0,0,0,0.5)'}}>
                  {l}
                </div>
              ))}
            </div>
          </div>
          <div style={{position: 'absolute', top: POS.bloc, left: CENTRE_X - LARGEUR / 2, width: LARGEUR,
            display: 'flex', justifyContent: 'center'}}>
            <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: tBloc, color: '#000', background: JAUNE,
              padding: '10px 26px', borderRadius: 16, whiteSpace: 'nowrap', lineHeight: 1.1,
              visibility: f < IMAGES.bloc ? 'hidden' : 'visible', transform: `scale(${claque(f, IMAGES.bloc)})`}}>
              {p.bloc}
            </div>
          </div>
          {/* Bouton de lecture qui pulse, avec un halo qui s'élargit. */}
          <div style={{position: 'absolute', left: CENTRE_X - BOUTON.diametre / 2, top: BOUTON.y - BOUTON.diametre / 2,
            width: BOUTON.diametre, height: BOUTON.diametre, transform: `scale(${bouton * pulse})`}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: 999, border: `8px solid ${JAUNE}`,
              opacity: f >= IMAGES.bouton ? 1 - halo : 0, transform: `scale(${1 + halo * 0.6})`}} />
            <div style={{position: 'absolute', inset: 0, borderRadius: 999, background: JAUNE,
              boxShadow: '0 0 60px rgba(255,212,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width={BOUTON.diametre * 0.42} height={BOUTON.diametre * 0.42} viewBox="0 0 100 100"
                style={{marginLeft: BOUTON.diametre * 0.05}}>
                <path d="M18 8 L92 50 L18 92 Z" fill="#0B1026" stroke="#0B1026" strokeWidth={8} strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </AbsoluteFill>
        {/* Ouverture sur la première image de la vidéo suivante, depuis le centre du bouton. */}
        {ouverture > 0 ? (
          <AbsoluteFill style={{clipPath: `circle(${ouverture}px at ${CENTRE_X}px ${BOUTON.y}px)`}}>
            <Img src={staticFile(p.apres)} style={{width: '100%', height: '100%'}} />
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
