import React from 'react';
import {AbsoluteFill, Freeze, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {POLICE} from '../charte';
import {usePolicesChargees} from '../Montage';
import {CENTRE, FondNuit, Ligne, NUIT, OR, pop, ROUGE, VERT, Z, texteContour} from './commun';

// Avant / après en écran partagé : à gauche la vidéo d'origine (4 clips bruts, 32 s), à droite la même vidéo
// montée par Claude gratuit (18,5 s, puis figée sur sa dernière image). Muet par défaut (la voix off passe
// dessus) ; `son` : 'avant' ou 'apres' pour garder le son d'une des deux.
export type PropsAvantApres = {son?: 'aucun' | 'avant' | 'apres'; titre?: string; avant?: string; apres?: string;
  detailAvant?: string; detailApres?: string; finApres?: number};

const Colonne: React.FC<{x: number; titre: string; detail: string; couleur: string; k: number;
  children: React.ReactNode}> = ({x, titre, detail, couleur, k, children}) => (
  <div style={{position: 'absolute', left: x, top: 300, width: 500, display: 'flex', flexDirection: 'column',
    alignItems: 'center', transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
    <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 48, color: couleur === OR ? NUIT : '#fff',
      background: couleur, padding: '6px 30px', borderRadius: 22, border: '5px solid #fff'}}>{titre}</span>
    <div style={{marginTop: 14, width: 500, height: 889, borderRadius: 26, overflow: 'hidden',
      border: `6px solid ${couleur}`, background: '#000', boxShadow: '0 24px 60px rgba(0,0,0,0.55)'}}>{children}</div>
    <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 31, color: '#fff', marginTop: 10, textAlign: 'center',
      lineHeight: 1.2, whiteSpace: 'pre-line', ...texteContour(5)}}>{detail}</div>
  </div>
);

const Corps: React.FC<PropsAvantApres> = ({son = 'aucun', titre = 'LA MÊME VIDÉO, AVANT ET APRÈS',
  avant = 'formation-montage-partie1/avant.mp4', apres = 'formation-montage-partie1/apres.mp4',
  detailAvant = '4 clips bruts, 32 s,\nsans sous-titres', detailApres = 'Montée par Claude gratuit\n18 s, sous-titres, musique',
  finApres = 553}) => {
  const FIN_APRES = finApres;
  const f = useCurrentFrame();
  const style = {width: '100%', height: '100%', objectFit: 'cover' as const};
  return (
    <AbsoluteFill>
      <FondNuit />
      <Ligne texte={titre} y={210} taille={56} couleur={OR} contour={7} k={pop(f, 0)} />
      <Colonne x={20} titre="AVANT" couleur={ROUGE} k={pop(f, 4)}
        detail={detailAvant}>
        <OffthreadVideo src={staticFile(avant)} muted={son !== 'avant'} style={style} />
      </Colonne>
      <Colonne x={560} titre="APRÈS" couleur={VERT} k={pop(f, 10)}
        detail={detailApres}>
        {f < FIN_APRES ? (
          <OffthreadVideo src={staticFile(apres)} muted={son !== 'apres'} style={style} />
        ) : (
          <Freeze frame={FIN_APRES}>
            <OffthreadVideo src={staticFile(apres)} muted style={style} />
          </Freeze>
        )}
      </Colonne>
    </AbsoluteFill>
  );
};

export const AvantApres: React.FC<PropsAvantApres> = (p) => (usePolicesChargees() ? <Corps {...p} /> : null);
