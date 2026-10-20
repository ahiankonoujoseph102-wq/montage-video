import React from 'react';
import {measureText} from '@remotion/layout-utils';
import {AbsoluteFill, Composition, useCurrentFrame} from 'remotion';
import type {EtapeExpression, EtapeGeste} from '../../double-anime/src/commun/animationDouble';
import {POLICE} from '../charte';
import {usePolicesChargees} from '../Montage';
import {NUIT, OR, texteContour} from '../formation/commun';
import {DoubleFormation, ECRAN, type PropsDouble, StudioDecor} from '../formation/DoubleFormation';
import {Reduction} from '../formation/Reduction';

// Série TikTok tirée de la formation partie 1 (scripts/serie.py) : début de chaque vidéo (accroche dite par le double,
// titre géant de 3 lignes, badge « PARTIE n/N ») et carton de fin (« Commentez SUITE » ou, pour la dernière, le numéro
// WhatsApp). Le double est dans le studio de la série ; le texte est dans l'écran du décor. La première image est
// complète (couverture TikTok) : rien n'y apparaît en fondu.
export type PropsPiece = {mode: 'accroche' | 'suite' | 'derniere'; titre?: string[]; motsCles?: string[]; partie?: number;
  total?: number; duree: number; debutVoix: number; bouche: number[]; visemes: string; gestes: EtapeGeste[];
  expressions: EtapeExpression[]};

const MARGE = 34;
const LARGEUR = ECRAN.l - 2 * MARGE;
const centre = {position: 'absolute' as const, left: ECRAN.x, width: ECRAN.l, display: 'flex', justifyContent: 'center'};

const largeur = (t: string, taille: number) =>
  measureText({text: t, fontFamily: POLICE, fontSize: taille, fontWeight: '900'}).width;

// Ligne du titre : remplit la largeur de l'écran ; les mots clés en noir sur un bloc jaune.
const LigneTitre: React.FC<{texte: string; cles: string[]; y: number; taille: number; k: number}> = (
  {texte, cles, y, taille, k}) => {
  const mots = texte.split(' ');
  return (
    <div style={{...centre, top: y, transform: `scale(${k})`}}>
      <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, lineHeight: 1.08, whiteSpace: 'nowrap'}}>
        {mots.map((m, i) => {
          const cle = cles.some((c) => m.replace(/[^\p{L}\p{N}']/gu, '').toUpperCase() === c.toUpperCase());
          return (
            <span key={i} style={cle ? {background: OR, color: NUIT, padding: `0 ${taille * 0.14}px`,
              borderRadius: taille * 0.16} : {color: '#fff', ...texteContour(taille * 0.09)}}>
              {m}{i < mots.length - 1 ? ' ' : ''}</span>
          );
        })}
      </span>
    </div>
  );
};

const tailleLigne = (t: string, max: number) => Math.min(max, max * LARGEUR / Math.max(1, largeur(t, max) + 0.3 * max));

const Badge: React.FC<{texte: string; y: number}> = ({texte, y}) => (
  <div style={{...centre, top: y}}>
    <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 40, color: NUIT, background: OR, padding: '6px 28px',
      borderRadius: 30, letterSpacing: 3, border: '4px solid #fff'}}>{texte}</span>
  </div>
);

// Icônes dessinées (sans logo) : cœur, et personne + « + » pour l'abonnement.
const Coeur: React.FC<{taille: number; battement: number}> = ({taille, battement}) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100" style={{transform: `scale(${battement})`}}>
    <path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C39 8 46 13 50 20 C54 13 61 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88 Z"
      fill="#FF3B5C" stroke="#fff" strokeWidth={6} />
  </svg>
);
const Abonnement: React.FC<{taille: number}> = ({taille}) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="#fff" />
    <circle cx="42" cy="38" r="15" fill={NUIT} />
    <path d="M14 78 C16 60 28 54 42 54 C56 54 68 60 70 78 Z" fill={NUIT} />
    <circle cx="74" cy="70" r="17" fill="#FF3B5C" stroke="#fff" strokeWidth={4} />
    <path d="M74 61 V79 M65 70 H83" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
  </svg>
);

const Accroche: React.FC<{p: PropsPiece; f: number}> = ({p, f}) => {
  const lignes = p.titre ?? [];
  const tailles = lignes.map((l) => tailleLigne(l, 150));
  const haut = tailles.reduce((s, t) => s + t * 1.12, 0);
  let y = ECRAN.y + 110 + (ECRAN.h - 110 - haut) / 2;
  return (
    <>
      <Badge texte={`PARTIE ${p.partie}/${p.total}`} y={ECRAN.y + 26} />
      {lignes.map((l, i) => {
        const yl = y;
        y += tailles[i] * 1.12;
        // léger battement après l'image 0 (l'image 0 reste nette : couverture)
        const k = 1 + 0.025 * Math.max(0, Math.sin((f - 6 - i * 4) / 9)) * (f > 6 ? 1 : 0);
        return <LigneTitre key={i} texte={l} cles={p.motsCles ?? []} y={yl} taille={tailles[i]} k={k} />;
      })}
    </>
  );
};

const Suite: React.FC<{f: number}> = ({f}) => {
  const pulse = 1 + 0.06 * Math.abs(Math.sin(f / 7));
  return (
    <>
      <div style={{...centre, top: ECRAN.y + 26}}>
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 46, color: '#fff', ...texteContour(5)}}>
          La suite arrive très vite !</span>
      </div>
      <div style={{...centre, top: ECRAN.y + 92}}>
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 74, color: '#fff', ...texteContour(7)}}>COMMENTEZ</span>
      </div>
      <div style={{...centre, top: ECRAN.y + 180, transform: `scale(${pulse})`}}>
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 168, lineHeight: 1, color: NUIT, background: OR,
          padding: '8px 40px', borderRadius: 34, border: '7px solid #fff'}}>SUITE</span>
      </div>
      <div style={{...centre, top: ECRAN.y + 405, gap: 60, alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <Coeur taille={86} battement={1 + 0.12 * Math.abs(Math.sin(f / 5))} />
          <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 44, color: '#fff', ...texteContour(5)}}>Likez</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <Abonnement taille={86} />
          <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 44, color: '#fff', ...texteContour(5)}}>Abonnez-vous</span>
        </div>
      </div>
    </>
  );
};

const Derniere: React.FC<{f: number}> = ({f}) => (
  <>
    <div style={{...centre, top: ECRAN.y + 26}}>
      <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 50, color: OR, ...texteContour(6)}}>
        C'était la dernière partie !</span>
    </div>
    <div style={{...centre, top: ECRAN.y + 108}}>
      <span style={{fontFamily: POLICE, fontWeight: 800, fontSize: 38, color: '#BFF5D3', letterSpacing: 5}}>WHATSAPP</span>
    </div>
    <div style={{...centre, top: ECRAN.y + 160, transform: `scale(${1 + 0.03 * Math.abs(Math.sin(f / 8))})`}}>
      <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 86, color: '#fff', background: '#16A34A',
        padding: '10px 30px', borderRadius: 28, border: '6px solid #fff', whiteSpace: 'nowrap'}}>+228 72 24 02 31</span>
    </div>
    <div style={{...centre, top: ECRAN.y + 305}}>
      <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 48, color: '#fff', ...texteContour(6)}}>
        Rejoignez Lomé IA School</span>
    </div>
    <div style={{...centre, top: ECRAN.y + 395, gap: 50, alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <Coeur taille={74} battement={1 + 0.12 * Math.abs(Math.sin(f / 5))} />
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 40, color: '#fff', ...texteContour(5)}}>Likez</span>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <Abonnement taille={74} />
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 40, color: '#fff', ...texteContour(5)}}>Abonnez-vous</span>
      </div>
    </div>
  </>
);

const Corps: React.FC<PropsPiece> = (p) => {
  const f = useCurrentFrame();
  const lead = Array(p.debutVoix).fill(0);
  const double: PropsDouble = {presences: [[-100, 1e9]], cadres: [], gestes: p.gestes, expressions: p.expressions,
    bouche: [...lead, ...p.bouche], visemes: 'X'.repeat(p.debutVoix) + p.visemes};
  return (
    <AbsoluteFill style={{background: NUIT}}>
      <Reduction>
      <StudioDecor d={double} />
      <AbsoluteFill style={{clipPath: `inset(${ECRAN.y}px ${1080 - ECRAN.x - ECRAN.l}px ${1920 - ECRAN.y - ECRAN.h}px ${ECRAN.x}px round 14px)`}}>
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 35%, #2a1d6e 0%, ${NUIT} 70%)`}} />
        {p.mode === 'accroche' ? <Accroche p={p} f={f} /> : p.mode === 'suite' ? <Suite f={f} /> : <Derniere f={f} />}
      </AbsoluteFill>
      <DoubleFormation d={double} />
      </Reduction>
    </AbsoluteFill>
  );
};

const SeriePiece: React.FC<PropsPiece> = (p) => (usePolicesChargees() ? <Corps {...p} /> : null);

const vide: PropsPiece = {mode: 'accroche', titre: ['MONTEZ N\'IMPORTE', 'QUELLE VIDÉO', 'AVEC L\'IA'], motsCles: ['L\'IA'],
  partie: 1, total: 9, duree: 180, debutVoix: 8, bouche: [], visemes: '', gestes: [{t: -10, geste: 'repos'}],
  expressions: [{t: -10, expression: 'neutre'}]};

export const CompositionsSerie: React.FC = () => (
  <Composition id="SeriePiece" component={SeriePiece} width={1080} height={1920} fps={30} durationInFrames={180}
    defaultProps={vide} calculateMetadata={({props}) => ({durationInFrames: Math.max(1, props.duree)})} />
);
