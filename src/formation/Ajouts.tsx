import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {POLICE} from '../charte';
import {Badge, FondNuit, LARGEUR_UTILE, Ligne, NUIT, OR, pop, prog, VERT, Z, texteContour} from './commun';

// Carton « À RETENIR » de fin d'étape (3 s) : 2 ou 3 points courts qui arrivent un à un, coche verte. Pas de fondu de
// sortie : le carton d'étape ou le plan suivant prend la place d'un coup.
export const CartonRetenir: React.FC<{numero: number; points: string[]}> = ({numero, points}) => {
  const t = useCurrentFrame();
  const pas = 210;
  const y0 = 760 - ((points.length - 1) * pas) / 2;
  return (
    <AbsoluteFill>
      <FondNuit teinte="vert" />
      <Badge texte={`FIN DE L'ÉTAPE ${numero}`} y={300} k={pop(t, 0)} />
      <Ligne texte="À RETENIR" y={400} taille={110} couleur={OR} contour={10} k={pop(t, 3)} />
      {points.map((p, i) => {
        const k = pop(t, 12 + i * 10);
        return (
          <div key={p} style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: y0 + i * pas, height: 180,
            boxSizing: 'border-box', borderRadius: 32, background: 'rgba(14,18,44,0.9)', border: `5px solid ${VERT}`,
            display: 'flex', alignItems: 'center', gap: 28, padding: '0 32px', opacity: k > 0 ? 1 : 0,
            transform: `translateX(${-140 * (1 - Math.min(1, k))}px)`}}>
            <svg width={96} height={96} viewBox="0 0 100 100" style={{flexShrink: 0, transform: `scale(${Math.min(1.1, k)})`}}>
              <circle cx="50" cy="50" r="48" fill="#fff" />
              <circle cx="50" cy="50" r="42" fill={VERT} />
              <path d="M28 52 L44 67 L73 36" stroke="#fff" strokeWidth={11} fill="none" strokeLinecap="round"
                strokeLinejoin="round" />
            </svg>
            <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: p.length > 30 ? 46 : 52, color: '#fff',
              lineHeight: 1.12}}>{p}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Illustration libre de droits (photo Pexels) posée sur une scène : grande carte qui couvre la scène (« plein »)
// ou petite carte dans un coin libre (« carte » : x, y, l, h). Léger zoom lent, étiquette jaune, entrée et sortie
// en 8 images. `a` : image de départ dans le plan, `duree` en images.
export type Illustration = {src: string; a: number; duree: number; legende: string; mode: 'plein' | 'carte';
  x?: number; y?: number; l?: number; h?: number; angle?: number};

export const Illustrations: React.FC<{liste?: Illustration[]}> = ({liste}) => {
  const t = useCurrentFrame();
  if (!liste) return null;
  return (
    <>
      {liste.map((il) => {
        const a = Math.round(il.a * 30);
        const fin = a + il.duree;
        if (t < a || t >= fin) return null;
        const k = Math.min(pop(t, a, 260), 1 - prog(t, fin - 8, 8));
        const zoom = 1.04 + 0.08 * ((t - a) / il.duree);
        const plein = il.mode === 'plein';
        const x = plein ? Z.gauche : il.x!;
        const y = plein ? 330 : il.y!;
        const l = plein ? LARGEUR_UTILE : il.l!;
        const h = plein ? 900 : il.h!;
        return (
          <AbsoluteFill key={il.src + il.a}>
            {plein ? <AbsoluteFill style={{background: NUIT, opacity: 0.75 * Math.min(1, k)}} /> : null}
            <div style={{position: 'absolute', left: x, top: y, width: l, height: h, borderRadius: 34, overflow: 'hidden',
              border: '8px solid #fff', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', opacity: k > 0.02 ? 1 : 0,
              transform: `scale(${Math.max(0, k)}) rotate(${il.angle ?? (plein ? -2 : 3)}deg)`}}>
              <Img src={staticFile(il.src)} style={{width: '100%', height: '100%', objectFit: 'cover',
                transform: `scale(${zoom})`}} />
            </div>
            <div style={{position: 'absolute', left: plein ? Z.gauche : x - 40, width: plein ? LARGEUR_UTILE : l + 80,
              top: y + h - (plein ? 40 : 30), display: 'flex', justifyContent: 'center',
              transform: `scale(${Math.max(0, pop(t, a + 5, 260) * (1 - prog(t, fin - 8, 8)))})`}}>
              <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: plein ? (il.legende.length > 20 ? 48 : 58) : 40, color: NUIT, background: OR,
                padding: plein ? '10px 34px' : '6px 22px', borderRadius: 24, border: '5px solid #fff', whiteSpace: 'nowrap',
                ...texteContour(0)}}>{il.legende}</span>
            </div>
          </AbsoluteFill>
        );
      })}
    </>
  );
};

