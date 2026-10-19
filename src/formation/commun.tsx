import React from 'react';
import {measureText} from '@remotion/layout-utils';
import {AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame} from 'remotion';
import {POLICE, ZONE_SURE} from '../charte';

// Éléments communs aux génériques, cartes de prompts et scènes de la formation (1080 × 1920, 30 i/s).
// Tout le contenu reste dans la zone sûre TikTok : x 50–950, y 200–1530.
export const FPS = 30;
export const Z = ZONE_SURE;
export const LARGEUR_UTILE = Z.droite - Z.gauche; // 900 px
export const CENTRE = (Z.gauche + Z.droite) / 2; // 500 px
export const NUIT = '#070A24'; // fond du logo Lomé IA School
export const OR = '#FFC21A';
export const VIOLET = '#9B7BFF';
export const VERT = '#22C55E';
export const ROUGE = '#FF4D4D';
export const NUMEROS = ['+228 72 24 02 31', '+228 79 16 23 90'];
export const SLOGAN = "Maîtrisez l'IA et transformez vos compétences en opportunités";

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const prog = (t: number, a: number, d: number, ease = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, a + d], [0, 1], {...clamp, easing: ease});
export const pop = (t: number, a: number, raide = 200) =>
  t < a ? 0 : spring({frame: t - a, fps: FPS, config: {damping: 11, stiffness: raide, mass: 0.7}});

// Fond bleu nuit (couleur du logo), halos violet et or qui dérivent, particules qui montent.
export const FondNuit: React.FC<{teinte?: 'nuit' | 'violet' | 'vert' | 'orange'}> = ({teinte = 'nuit'}) => {
  const f = useCurrentFrame();
  const halos: Record<string, [string, string]> = {
    nuit: ['#3B2A8C', '#8A6400'], violet: ['#5B1FB8', '#A21CAF'], vert: ['#0E6B4A', '#1F5BFF'],
    orange: ['#B34A00', '#5B1FB8'],
  };
  const [h1, h2] = halos[teinte];
  return (
    <AbsoluteFill style={{background: NUIT, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: [
        `radial-gradient(circle at ${30 + 18 * Math.sin(f / 50)}% ${28 + 10 * Math.cos(f / 60)}%, ${h1}aa 0%, transparent 46%)`,
        `radial-gradient(circle at ${72 + 15 * Math.cos(f / 55)}% ${74 + 10 * Math.sin(f / 45)}%, ${h2}88 0%, transparent 48%)`,
      ].join(',')}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 34}).map((_, i) => {
          const x = random(`px${i}`) * 1080;
          const v = 0.5 + random(`pv${i}`) * 1.3;
          const y = ((random(`py${i}`) * 1920 - f * v * 2) % 1920 + 1920) % 1920;
          return <circle key={i} cx={x + 12 * Math.sin((f + i * 17) / 20)} cy={y} r={2 + random(`pr${i}`) * 4}
            fill={i % 3 === 0 ? OR : '#fff'} opacity={0.12 + 0.3 * random(`po${i}`)} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Logo Lomé IA School (image carrée sur fond bleu nuit), avec un reflet qui balaie (illumination).
export const Logo: React.FC<{taille: number; x: number; y: number; k?: number; reflet?: number; halo?: number}> = (
  {taille, x, y, k = 1, reflet = -1, halo = 0}) => (
  <div style={{position: 'absolute', left: x - taille / 2, top: y - taille / 2, width: taille, height: taille,
    transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
    <div style={{position: 'absolute', inset: -taille * 0.25, borderRadius: '50%',
      background: `radial-gradient(circle, ${OR}${Math.round(halo * 120).toString(16).padStart(2, '0')} 0%, transparent 62%)`}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: taille * 0.12, overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}}>
      <Img src={staticFile('marques/lome-ia-school.jpg')} style={{width: '100%', height: '100%'}} />
      {reflet >= 0 && reflet <= 1 ? (
        <div style={{position: 'absolute', top: 0, bottom: 0, width: '45%', left: `${-50 + reflet * 160}%`,
          background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)',
          transform: 'skewX(-18deg)'}} />
      ) : null}
    </div>
  </div>
);

export const texteContour = (epaisseur: number, couleur = '#000') => ({
  WebkitTextStroke: `${epaisseur}px ${couleur}`, paintOrder: 'stroke fill' as const,
});

// Texte centré dans la zone sûre, ajusté pour ne jamais dépasser la largeur donnée.
export const Ligne: React.FC<{texte: string; y: number; taille: number; couleur?: string; poids?: 800 | 900;
  largeur?: number; k?: number; contour?: number; fondBloc?: string; style?: React.CSSProperties}> = (
  {texte, y, taille, couleur = '#fff', poids = 900, largeur = LARGEUR_UTILE, k = 1, contour = 0, fondBloc, style}) => {
  const l = measureText({text: texte, fontFamily: POLICE, fontSize: taille, fontWeight: String(poids)}).width;
  const marge = fondBloc ? taille * 0.7 : 0;
  const t = Math.min(taille, taille * (largeur - marge) / Math.max(1, l));
  return (
    <div style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: y, display: 'flex',
      justifyContent: 'center', transform: `scale(${k})`, opacity: k > 0 ? Math.min(1, k * 1.5) : 0}}>
      <span style={{fontFamily: POLICE, fontWeight: poids, fontSize: t, lineHeight: 1.15, color: couleur,
        whiteSpace: 'nowrap', ...(contour ? texteContour(contour) : {}),
        ...(fondBloc ? {background: fondBloc, padding: `${t * 0.12}px ${t * 0.35}px`, borderRadius: t * 0.22} : {}),
        ...style}}>{texte}</span>
    </div>
  );
};

// Numéro WhatsApp dans une pastille verte (sans logo de marque).
export const NumeroWhatsApp: React.FC<{numero: string; y: number; k: number; taille?: number}> = (
  {numero, y, k, taille = 84}) => (
  <div style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: y, display: 'flex',
    flexDirection: 'column', alignItems: 'center', transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
    <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: taille * 0.36, color: '#BFF5D3', letterSpacing: 4,
      marginBottom: 8}}>WHATSAPP</div>
    <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: taille, color: '#fff', background: '#16A34A',
      padding: `${taille * 0.12}px ${taille * 0.4}px`, borderRadius: taille * 0.3, border: '6px solid #fff',
      boxShadow: '0 14px 40px rgba(22,163,74,0.55)', whiteSpace: 'nowrap'}}>{numero}</div>
  </div>
);

// Coupe un texte en lignes qui tiennent dans `largeur` à la taille donnée (mesure réelle de Montserrat).
export const couper = (texte: string, taille: number, largeur: number, poids = 800): string[] => {
  const espace = measureText({text: ' ', fontFamily: POLICE, fontSize: taille, fontWeight: String(poids)}).width;
  const lignes: string[] = [];
  let ligne = '';
  let l = 0;
  for (const mot of texte.split(' ')) {
    const w = measureText({text: mot, fontFamily: POLICE, fontSize: taille, fontWeight: String(poids)}).width;
    if (ligne && l + espace + w > largeur) {
      lignes.push(ligne);
      ligne = mot;
      l = w;
    } else {
      ligne = ligne ? `${ligne} ${mot}` : mot;
      l = ligne === mot ? w : l + espace + w;
    }
  }
  if (ligne) lignes.push(ligne);
  return lignes;
};

// Badge de pause publicitaire (génériques avec voix off).
export const Badge: React.FC<{texte: string; y: number; k: number; couleur?: string}> = ({texte, y, k, couleur = OR}) => (
  <div style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: y, display: 'flex',
    justifyContent: 'center', transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
    <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 40, color: NUIT, background: couleur,
      padding: '10px 30px', borderRadius: 40, letterSpacing: 3}}>{texte}</span>
  </div>
);
