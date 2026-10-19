import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {POLICE} from '../charte';
import {usePolicesChargees} from '../Montage';
import {CENTRE, couper, FondNuit, FPS, LARGEUR_UTILE, Ligne, NUIT, OR, pop, prog, VERT, VIOLET, Z, texteContour} from './commun';
import {Tuile} from './Pictos';

// Cartes de choix, cartes de texte et petites animations de la formation (1080 × 1920, zone sûre).
// `etapes` : secondes (depuis le début de l'élément) où chaque bloc apparaît, calées sur la voix off.
const avecPolice = <P extends object>(C: React.FC<P>): React.FC<P> => (p) => (usePolicesChargees() ? <C {...p} /> : null);
const moments = (etapes: number[] | undefined, n: number, d: number, debut = 0.12, fin = 0.7) =>
  Array.from({length: n}).map((_, i) => Math.round(etapes?.[i] !== undefined ? etapes[i] * FPS
    : (debut + (fin - debut) * (n > 1 ? i / (n - 1) : 0)) * d));

const Titre: React.FC<{texte: string; t: number; y?: number; couleur?: string}> = ({texte, t, y = 215, couleur = OR}) => (
  <>
    {couper(texte, 66, LARGEUR_UTILE - 30, 900).map((l, i) => (
      <Ligne key={l} texte={l} y={y + i * 80} taille={66} couleur={couleur} contour={8} k={pop(t, i * 3)} />
    ))}
  </>
);

// --- Carte de choix : 2 ou 3 options côte à côte (ou empilées), l'option `actif` s'illumine à `etapeActif`. ---
export type Option = {titre: string; detail?: string; picto: string; couleur: string};
export type PropsChoix = {titre: string; options: Option[]; etapes?: number[]; actif?: number; etapeActif?: number;
  sousTitre?: string};
const ChoixCorps: React.FC<PropsChoix> = ({titre, options, etapes, actif, etapeActif, sousTitre}) => {
  const t = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const a = moments(etapes, options.length, d, 0.1, 0.45);
  const fa = etapeActif !== undefined ? Math.round(etapeActif * FPS) : 99999;
  const lum = prog(t, fa, 10);
  const n = options.length;
  const h = n === 3 ? 330 : 470;
  return (
    <AbsoluteFill>
      <FondNuit teinte={n === 3 ? 'violet' : 'nuit'} />
      <Titre texte={titre} t={t} />
      {sousTitre ? <Ligne texte={sousTitre} y={385} taille={44} poids={800} k={pop(t, 4)} /> : null}
      {options.map((o, i) => {
        const k = pop(t, a[i]);
        const estActif = actif === i;
        const eteint = actif !== undefined && !estActif ? lum : 0;
        return (
          <div key={o.titre} style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE,
            top: 470 + i * (h + 40), height: h, borderRadius: 40, boxSizing: 'border-box',
            background: `linear-gradient(135deg, ${o.couleur}EE, ${o.couleur}88)`,
            border: `${estActif && lum > 0 ? 10 : 5}px solid ${estActif && lum > 0 ? OR : '#fff'}`,
            boxShadow: estActif && lum > 0 ? `0 0 ${60 * lum}px ${OR}` : '0 20px 50px rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', gap: 34, padding: '0 40px', opacity: (k > 0 ? 1 : 0) * (1 - 0.55 * eteint),
            transform: `scale(${Math.min(1, k) * (estActif ? 1 + 0.04 * lum : 1 - 0.04 * eteint)}) translateX(${(1 - Math.min(1, k)) * (i % 2 ? 120 : -120)}px)`}}>
            <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 64, color: NUIT, background: '#fff', width: 96,
              height: 96, borderRadius: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{i + 1}</div>
            <Tuile nom={o.picto} taille={n === 3 ? 170 : 210} couleur={NUIT} />
            <div>
              <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: n === 3 ? 62 : 58, color: '#fff', lineHeight: 1.05,
                ...texteContour(6)}}>{o.titre}</div>
              {o.detail ? <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 36, color: '#fff', marginTop: 12,
                lineHeight: 1.2}}>{o.detail}</div> : null}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
export const CarteChoix = avecPolice(ChoixCorps);

// --- Carte de texte : un titre (et un badge), puis des lignes avec une coche ou un pictogramme. ---
export type PropsTexte = {badge?: string; titre: string; lignes: {texte: string; picto?: string; couleur?: string}[];
  etapes?: number[]; teinte?: 'nuit' | 'violet' | 'vert' | 'orange'};
const TexteCorps: React.FC<PropsTexte> = ({badge, titre, lignes, etapes, teinte = 'nuit'}) => {
  const t = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const a = moments(etapes, lignes.length, d, 0.12, 0.65);
  const yTitre = badge ? 310 : 215;
  const nTitre = couper(titre, 66, LARGEUR_UTILE - 30, 900).length;
  const y0 = yTitre + nTitre * 80 + 70;
  const pas = Math.min(250, (1490 - y0) / lignes.length);
  return (
    <AbsoluteFill>
      <FondNuit teinte={teinte} />
      {badge ? (
        <div style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: 215, display: 'flex',
          justifyContent: 'center', transform: `scale(${pop(t, 0)})`}}>
          <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 44, color: NUIT, background: OR,
            padding: '8px 30px', borderRadius: 40, letterSpacing: 3, whiteSpace: 'nowrap'}}>{badge}</span>
        </div>
      ) : null}
      <Titre texte={titre} t={t} y={yTitre} couleur="#fff" />
      {lignes.map((l, i) => {
        const k = pop(t, a[i]);
        return (
          <div key={l.texte} style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: y0 + i * pas,
            minHeight: pas - 30, boxSizing: 'border-box', borderRadius: 32, background: 'rgba(14,18,44,0.88)',
            border: `4px solid ${l.couleur ?? VIOLET}`, display: 'flex', alignItems: 'center', gap: 26, padding: '18px 28px',
            opacity: k > 0 ? 1 : 0, transform: `translateX(${-120 * (1 - Math.min(1, k))}px)`}}>
            <Tuile nom={l.picto ?? 'coche'} taille={Math.min(140, pas - 60)} couleur={l.couleur ?? VERT} k={Math.min(1.1, k)} />
            <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 46, color: '#fff', lineHeight: 1.15}}>{l.texte}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
export const CarteTexte = avecPolice(TexteCorps);

// Téléphone avec une discussion Claude (fond clair, en-tête, zone de saisie).
const TelephoneClaude: React.FC<React.PropsWithChildren<{x: number; y: number; l: number; h: number}>> = (
  {x, y, l, h, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: l, height: h, borderRadius: 64, background: '#14141F',
    padding: 18, boxShadow: '0 30px 80px rgba(0,0,0,0.55)'}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 48, background: '#F5F1EA', overflow: 'hidden'}}>
      <div style={{height: 110, display: 'flex', alignItems: 'center', gap: 16, padding: '0 34px', borderBottom: '2px solid #E2DBCF'}}>
        <svg width={50} height={50} viewBox="0 0 50 50">{Array.from({length: 8}).map((_, i) => (
          <rect key={i} x={23} y={4} width={4} height={20} rx={2} fill="#D97757" transform={`rotate(${i * 45} 25 25)`} />))}</svg>
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 40, color: '#3A2E26'}}>Claude</span>
      </div>
      {children}
      <div style={{position: 'absolute', left: 24, right: 24, bottom: 24, height: 96, borderRadius: 30, background: '#fff',
        border: '2px solid #E2DBCF', display: 'flex', alignItems: 'center', padding: '0 26px', fontFamily: POLICE,
        fontWeight: 800, fontSize: 30, color: '#9A8F84'}}>Écrire à Claude…</div>
    </div>
  </div>
);

// --- Animation « vidéo d'inspiration » : une vidéo d'exemple glisse dans la discussion Claude, puis Claude répond
// avec le style qu'il a compris. ---
const InspirationCorps: React.FC<{etapes?: number[]}> = ({etapes}) => {
  const t = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const [eVideo, eReponse] = moments(etapes, 2, d, 0.08, 0.5);
  const glisse = prog(t, eVideo, 22, Easing.inOut(Easing.cubic));
  const kRep = pop(t, eReponse);
  return (
    <AbsoluteFill>
      <FondNuit teinte="violet" />
      <Ligne texte="1. MONTRER UN EXEMPLE" y={215} taille={66} couleur={OR} contour={8} k={pop(t, 0)} />
      <TelephoneClaude x={CENTRE - 300} y={330} l={600} h={1180}>
        {/* Bulle de l'utilisateur avec la vidéo d'exemple. */}
        <div style={{position: 'absolute', right: 30, top: 140, width: 300, borderRadius: 26, background: '#E8E1D6',
          padding: 12, opacity: glisse >= 1 ? 1 : 0}}>
          <div style={{width: '100%', height: 420, borderRadius: 18, overflow: 'hidden', position: 'relative', background: '#000'}}>
            <OffthreadVideo src={staticFile('formation-montage-partie1/apres.mp4')} muted
              style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 24, color: '#3A2E26', marginTop: 8}}>
            Étudie le montage de cette vidéo</div>
        </div>
        <div style={{position: 'absolute', left: 30, top: 650, width: 470, borderRadius: 26, background: '#fff',
          border: '2px solid #E2DBCF', padding: '18px 22px', fontFamily: POLICE, fontWeight: 800, fontSize: 27,
          color: '#3A2E26', lineHeight: 1.35, transform: `scale(${kRep})`, transformOrigin: 'left top', opacity: kRep > 0 ? 1 : 0}}>
          Voici le style que j'ai compris :<br />• sous-titres blancs, mots clés en jaune<br />• petites animations en haut
          <br />• coupes rapides, musique douce<br />• carte de fin avec le numéro
        </div>
      </TelephoneClaude>
      {/* La vidéo qui vole vers la discussion. */}
      {glisse < 1 ? (
        <div style={{position: 'absolute', left: interpolate(glisse, [0, 1], [700, 520]), top: interpolate(glisse, [0, 1], [1500, 482]),
          width: interpolate(glisse, [0, 1], [330, 276]), height: interpolate(glisse, [0, 1], [586, 420]), borderRadius: 22,
          overflow: 'hidden', border: '6px solid #fff', transform: `rotate(${(1 - glisse) * 12}deg)`,
          opacity: t >= eVideo ? 1 : 0, boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}}>
          <OffthreadVideo src={staticFile('formation-montage-partie1/apres.mp4')} muted
            style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
export const SceneInspiration = avecPolice(InspirationCorps);

// --- Animation « logo » : le logo glisse dans la discussion, puis apparaît dans le coin de la vidéo. ---
const LogoCorps: React.FC<{etapes?: number[]}> = ({etapes}) => {
  const t = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const [eLogo, eCoin] = moments(etapes, 2, d, 0.06, 0.45);
  const glisse = prog(t, eLogo, 18, Easing.inOut(Easing.cubic));
  const coin = prog(t, eCoin, 16, Easing.out(Easing.back(1.4)));
  return (
    <AbsoluteFill>
      <FondNuit />
      <Ligne texte="AJOUTER VOTRE LOGO" y={215} taille={66} couleur={OR} contour={8} k={pop(t, 0)} />
      {/* Vidéo (à droite) avec le logo dans le coin en haut à gauche. */}
      <div style={{position: 'absolute', left: 520, top: 360, width: 420, height: 746, borderRadius: 30, overflow: 'hidden',
        border: '6px solid #fff', boxShadow: '0 24px 60px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile('formation-montage-partie1/image_nette.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', left: 18, top: 18, width: 90, height: 90, borderRadius: 18, overflow: 'hidden',
          transform: `scale(${coin})`, opacity: coin > 0 ? 1 : 0, border: '3px solid #fff'}}>
          <Img src={staticFile('marques/lome-ia-school.jpg')} style={{width: '100%', height: '100%'}} />
        </div>
      </div>
      {/* Le fichier du logo qui part de la gauche et entre dans la vidéo. */}
      <div style={{position: 'absolute', left: interpolate(glisse, [0, 1], [90, 540]), top: interpolate(glisse, [0, 1], [700, 380]),
        width: interpolate(glisse, [0, 1], [300, 90]), height: interpolate(glisse, [0, 1], [300, 90]), borderRadius: 30,
        overflow: 'hidden', opacity: coin > 0.2 ? 0 : 1, border: '5px solid #fff', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile('marques/lome-ia-school.jpg')} style={{width: '100%', height: '100%'}} />
      </div>
      <Ligne texte="Coin en haut à gauche, toute la vidéo" y={1180} taille={46} k={pop(t, eCoin + 8)} contour={6} />
    </AbsoluteFill>
  );
};
export const SceneLogo = avecPolice(LogoCorps);
