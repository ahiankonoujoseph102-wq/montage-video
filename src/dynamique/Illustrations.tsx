import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import type {Dynamique, Illustration} from '../types';
import {SCENES_ILLUSTREES} from './scenes';

// Écran partagé : l'illustration animée occupe la moitié haute (sur un dégradé coloré), le visage est recadré
// dans la moitié basse, les sous-titres sont posés sur la limite. Entrée et sortie : le panneau descend du haut
// pendant que l'image du visage glisse vers le bas (ENTREE images).
export const PARTAGE = {hauteur: 960, decalage: 540, entree: 8};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const FONDS_ILLUSTRATION: Record<string, [string, string, string]> = {
  bleu: ['#0B1E6B', '#1F5BFF', '#38C6FF'],
  violet: ['#2A0B5E', '#7B2FF7', '#F062C0'],
  orange: ['#5A1406', '#F0560F', '#FFC23D'],
  nuit: ['#050816', '#1A1446', '#7A1030'],
  vert: ['#032B22', '#0E8F62', '#7EE8A8'],
  rose: ['#4A0636', '#E0337E', '#FFB36B'],
};

export const progresPartage = (dyn: Dynamique | null | undefined, f: number) => {
  let p = 0;
  for (const s of dyn?.illustrations ?? []) {
    if (f < s.debut || f >= s.fin) continue;
    p = Math.max(p, Math.min(
      interpolate(f, [s.debut, s.debut + PARTAGE.entree], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}),
      interpolate(f, [s.fin - PARTAGE.entree, s.fin], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)}),
    ));
  }
  return p;
};

// Fond en dégradé qui bouge lentement, avec des taches de lumière et des particules qui montent.
const Fond: React.FC<{couleurs: [string, string, string]; t: number; graine: number}> = ({couleurs, t, graine}) => {
  const [a, b, c] = couleurs;
  const angle = 160 + 12 * Math.sin(t / 40);
  return (
    <AbsoluteFill style={{background: `linear-gradient(${angle}deg, ${a} 0%, ${b} 55%, ${c} 100%)`}}>
      <svg width={1080} height={PARTAGE.hauteur} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id={`tache${graine}`}>
            <stop offset="0%" stopColor="#fff" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={250 + 90 * Math.sin(t / 33)} cy={330 + 60 * Math.cos(t / 41)} r={360} fill={`url(#tache${graine})`} />
        <circle cx={850 + 70 * Math.cos(t / 29)} cy={720 + 50 * Math.sin(t / 37)} r={300} fill={`url(#tache${graine})`}
          opacity={0.7} />
        {Array.from({length: 26}).map((_, i) => {
          const x = random(`x${graine}${i}`) * 1080;
          const v = 0.6 + random(`v${graine}${i}`) * 1.4;
          const y = ((random(`y${graine}${i}`) * 960 - t * v * 2) % 960 + 960) % 960;
          const r = 2 + random(`r${graine}${i}`) * 5;
          return <circle key={i} cx={x + 10 * Math.sin((t + i * 13) / 15)} cy={y} r={r} fill="#fff"
            opacity={0.12 + 0.25 * random(`o${graine}${i}`)} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const PanneauIllustration: React.FC<{s: Illustration}> = ({s}) => {
  const f = useCurrentFrame();
  const t = f - s.debut;
  const p = progresPartage({illustrations: [s]} as Dynamique, f);
  const Scene = SCENES_ILLUSTREES[s.type];
  const couleurs = FONDS_ILLUSTRATION[s.fond ?? 'bleu'] ?? FONDS_ILLUSTRATION.bleu;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: PARTAGE.hauteur, overflow: 'hidden',
      transform: `translateY(${-PARTAGE.hauteur * (1 - p)}px)`,
      boxShadow: '0 10px 40px rgba(0,0,0,0.55)'}}>
      <Fond couleurs={couleurs} t={t} graine={s.debut} />
      {Scene ? <Scene t={t} etapes={s.etapes.map((e) => e - s.debut)} duree={s.fin - s.debut} /> : null}
      {/* Liseré lumineux sur la limite avec le visage. */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 8,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.2), #fff, rgba(255,255,255,0.2))',
        boxShadow: '0 0 24px rgba(255,255,255,0.8)'}} />
    </div>
  );
};

export const Illustrations: React.FC<{dyn: Dynamique}> = ({dyn}) => {
  const f = useCurrentFrame();
  return (
    <>
      {(dyn.illustrations ?? []).filter((s) => f >= s.debut && f < s.fin).map((s) => (
        <PanneauIllustration key={s.debut} s={s} />
      ))}
    </>
  );
};
