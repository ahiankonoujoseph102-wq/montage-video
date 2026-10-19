import React from 'react';
import {AbsoluteFill, Freeze, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {POLICE} from '../charte';
import {usePolicesChargees} from '../Montage';
import {CENTRE, FondNuit, Ligne, NUIT, OR, pop, ROUGE, VERT, Z, texteContour} from './commun';

// Avant / après en écran partagé : à gauche la vidéo d'origine (4 clips bruts, 32 s), à droite la même vidéo
// montée par Claude gratuit (18,5 s, puis figée sur sa dernière image). Muet par défaut (la voix off passe
// dessus) ; `son` : 'avant' ou 'apres' pour garder le son d'une des deux.
export type PropsAvantApres = {son?: 'aucun' | 'avant' | 'apres'};
const FIN_APRES = 553; // dernière image de la vidéo montée (18,47 s)

const Colonne: React.FC<{x: number; titre: string; detail: string; couleur: string; k: number;
  children: React.ReactNode}> = ({x, titre, detail, couleur, k, children}) => (
  <div style={{position: 'absolute', left: x, top: 340, width: 440, display: 'flex', flexDirection: 'column',
    alignItems: 'center', transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
    <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 54, color: couleur === OR ? NUIT : '#fff',
      background: couleur, padding: '6px 30px', borderRadius: 22, border: '5px solid #fff'}}>{titre}</span>
    <div style={{marginTop: 18, width: 440, height: 782, borderRadius: 26, overflow: 'hidden',
      border: `6px solid ${couleur}`, background: '#000', boxShadow: '0 24px 60px rgba(0,0,0,0.55)'}}>{children}</div>
    <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 34, color: '#fff', marginTop: 14, textAlign: 'center',
      lineHeight: 1.2, whiteSpace: 'pre-line', ...texteContour(5)}}>{detail}</div>
  </div>
);

const Corps: React.FC<PropsAvantApres> = ({son = 'aucun'}) => {
  const f = useCurrentFrame();
  const style = {width: '100%', height: '100%', objectFit: 'cover' as const};
  return (
    <AbsoluteFill>
      <FondNuit />
      <Ligne texte="LA MÊME VIDÉO, AVANT ET APRÈS" y={215} taille={58} couleur={OR} contour={7} k={pop(f, 0)} />
      <Colonne x={Z.gauche - 10} titre="AVANT" couleur={ROUGE} k={pop(f, 4)}
        detail={'4 clips bruts, 32 s\nsilences, sans sous-titres'}>
        <OffthreadVideo src={staticFile('formation-montage-partie1/avant.mp4')} muted={son !== 'avant'} style={style} />
      </Colonne>
      <Colonne x={CENTRE + 20} titre="APRÈS" couleur={VERT} k={pop(f, 10)}
        detail={'Montée par Claude gratuit\n18 s, sous-titres, musique'}>
        {f < FIN_APRES ? (
          <OffthreadVideo src={staticFile('formation-montage-partie1/apres.mp4')} muted={son !== 'apres'} style={style} />
        ) : (
          <Freeze frame={FIN_APRES}>
            <OffthreadVideo src={staticFile('formation-montage-partie1/apres.mp4')} muted style={style} />
          </Freeze>
        )}
      </Colonne>
    </AbsoluteFill>
  );
};

export const AvantApres: React.FC<PropsAvantApres> = (p) => (usePolicesChargees() ? <Corps {...p} /> : null);
