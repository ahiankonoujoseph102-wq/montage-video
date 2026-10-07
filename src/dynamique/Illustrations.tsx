import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import type {Dynamique, Illustration} from '../types';
import {SCENES_ILLUSTREES} from './scenes';

// Écran partagé : l'illustration animée occupe le haut (900 px, sur un dégradé coloré), puis un bandeau sombre
// semi-transparent (135 px) porte les sous-titres, et le visage est recadré dessous : l'image glisse de 560 px vers
// le bas (haut des cheveux vers 1 063 px avec le zoom de 11 %, jamais sous le bandeau). Entrée et sortie : le
// panneau descend du haut pendant que l'image du visage glisse vers le bas (ENTREE images).
export const PARTAGE = {hauteur: 900, bandeau: 135, decalage: 560, entree: 8};
const HAUT_PANNEAU = PARTAGE.hauteur + PARTAGE.bandeau;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const FONDS_ILLUSTRATION: Record<string, [string, string, string]> = {
  bleu: ['#0B1E6B', '#1F5BFF', '#38C6FF'],
  violet: ['#2A0B5E', '#7B2FF7', '#F062C0'],
  orange: ['#5A1406', '#F0560F', '#FFC23D'],
  nuit: ['#050816', '#1A1446', '#7A1030'],
  vert: ['#032B22', '#0E8F62', '#7EE8A8'],
  rose: ['#4A0636', '#E0337E', '#FFB36B'],
};

// Progression (0 → 1 → 0) d'une scène. Deux scènes enchaînées (la seconde commence pendant la sortie de la
// première, voir scripts/preparer.py) : la première ne remonte pas, la seconde descend par-dessus, et le visage
// reste en bas entre les deux.
const progresScene = (s: Illustration, toutes: Illustration[], f: number, pourVisage: boolean) => {
  if (f < s.debut || f >= s.fin) return 0;
  const suiviePar = toutes.some((o) => o !== s && o.debut >= s.fin - PARTAGE.entree - 1 && o.debut < s.fin);
  const suitUne = toutes.some((o) => o !== s && o.fin > s.debut && o.fin <= s.debut + PARTAGE.entree + 1);
  const entree = pourVisage && suitUne ? 1
    : interpolate(f, [s.debut, s.debut + PARTAGE.entree], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const sortie = suiviePar ? 1
    : interpolate(f, [s.fin - PARTAGE.entree, s.fin], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  return Math.min(entree, sortie);
};

export const progresPartage = (dyn: Dynamique | null | undefined, f: number) => {
  const toutes = dyn?.illustrations ?? [];
  return Math.max(0, ...toutes.map((s) => progresScene(s, toutes, f, true)));
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

const PanneauIllustration: React.FC<{s: Illustration; toutes: Illustration[]}> = ({s, toutes}) => {
  const f = useCurrentFrame();
  const t = f - s.debut;
  const p = progresScene(s, toutes, f, false);
  const Scene = SCENES_ILLUSTREES[s.type];
  const couleurs = FONDS_ILLUSTRATION[s.fond ?? 'bleu'] ?? FONDS_ILLUSTRATION.bleu;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: HAUT_PANNEAU,
      transform: `translateY(${-HAUT_PANNEAU * (1 - p)}px)`}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: PARTAGE.hauteur, overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.55)'}}>
        <Fond couleurs={couleurs} t={t} graine={s.debut} />
        {Scene ? <Scene t={t} etapes={s.etapes.map((e) => e - s.debut)} duree={s.fin - s.debut} /> : null}
      </div>
      {/* Bandeau sombre des sous-titres, entre l'illustration et le visage. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: PARTAGE.hauteur, height: PARTAGE.bandeau,
        background: 'linear-gradient(180deg, rgba(6,8,22,0.82), rgba(6,8,22,0.66))'}} />
      {/* Liserés lumineux : limite avec l'illustration, et fin trait sous le bandeau. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: PARTAGE.hauteur - 4, height: 8,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.2), #fff, rgba(255,255,255,0.2))',
        boxShadow: '0 0 24px rgba(255,255,255,0.8)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: HAUT_PANNEAU - 3, height: 3,
        background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.6), rgba(255,255,255,0))'}} />
    </div>
  );
};

export const Illustrations: React.FC<{dyn: Dynamique}> = ({dyn}) => {
  const f = useCurrentFrame();
  return (
    <>
      {(dyn.illustrations ?? []).filter((s) => f >= s.debut && f < s.fin).map((s) => (
        <PanneauIllustration key={s.debut} s={s} toutes={dyn.illustrations ?? []} />
      ))}
    </>
  );
};
