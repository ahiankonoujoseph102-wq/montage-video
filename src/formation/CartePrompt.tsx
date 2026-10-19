import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {POLICE} from '../charte';
import {usePolicesChargees} from '../Montage';
import {couper, FondNuit, FPS, LARGEUR_UTILE, NUIT, OR, pop, prog, Z} from './commun';
import {PROMPT_FLOW_SCENE1, PROMPTS} from './prompts';

// Carte de prompt : texte exact, lisible sur téléphone, surligné ligne par ligne.
// `temps` : seconde de début du surlignage de chaque ligne non vide (à caler sur la voix off en phase 2) ;
// par défaut, les lignes se suivent régulièrement sur toute la durée.
export type PropsCarte = {id: string; duree?: number; temps?: number[]};

export const dureeCarte = (id: string) => {
  const p = PROMPTS.find((x) => x.id === id);
  return p ? 4 + 4 * p.lignes.filter(Boolean).length : 10;
};

const TEXTE = '#F4F6FF';
const CROCHET = '#FFB347';

// Parties entre crochets en orange (à remplacer par l'élève).
const Morceaux: React.FC<{texte: string; actif: boolean}> = ({texte, actif}) => (
  <>
    {texte.split(/(\[[^\]]*\])/).map((m, i) => (m.startsWith('[')
      ? <span key={i} style={{color: actif ? '#8A3B00' : CROCHET}}>{m}</span>
      : <span key={i}>{m}</span>))}
  </>
);

const Corps: React.FC<PropsCarte> = ({id, temps}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const p = PROMPTS.find((x) => x.id === id) ?? PROMPTS[0];
  const pleines = p.lignes.map((l, i) => (l ? i : -1)).filter((i) => i >= 0);
  const debut = 1.2 * FPS;
  const pas = (d - debut - FPS) / pleines.length;
  const departs = pleines.map((_, j) => (temps?.[j] !== undefined ? temps[j] * FPS : debut + j * pas));
  const k = pop(f, 0);
  const apparition = prog(f, 4, 14);
  // Mise en page : titre, puis la boîte du prompt jusqu'à BAS_BOITE. Si le prompt est plus haut que la boîte,
  // il défile doucement pour garder la ligne surlignée au milieu.
  const tailleTitre = p.titre.length > 28 ? 50 : 62;
  const lignesTitre = couper(p.titre, tailleTitre, LARGEUR_UTILE, 900);
  const hautBoite = 215 + 72 + 18 + lignesTitre.length * tailleTitre * 1.1 + 26;
  const BAS_BOITE = 1448;
  const marge = p.taille * 0.75;
  const largeurTexte = LARGEUR_UTILE - 2 * marge - 18;
  const hauteurs = p.lignes.map((l) => (l ? couper(l, p.taille, largeurTexte, 800).length * p.taille * 1.32 + p.taille * 0.35
    : p.taille * 0.55));
  const hauts = hauteurs.map((_, i) => hauteurs.slice(0, i).reduce((x, y) => x + y, 0));
  const total = hauteurs.reduce((x, y) => x + y, 0);
  const visible = BAS_BOITE - hautBoite - 2 * p.taille * 0.6;
  const depasse = Math.max(0, total - visible);
  const cible = (j: number) => Math.min(depasse, Math.max(0, hauts[pleines[j]] + hauteurs[pleines[j]] / 2 - visible / 2));
  let defile = 0;
  departs.forEach((a, j) => {
    if (f >= a) defile = cible(j - 1 >= 0 ? j - 1 : 0) + (cible(j) - cible(j - 1 >= 0 ? j - 1 : 0)) * prog(f, a, 14);
  });
  return (
    <AbsoluteFill>
      <FondNuit />
      <div style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: 215, display: 'flex',
        flexDirection: 'column', alignItems: 'center'}}>
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 46, color: NUIT, background: OR,
          padding: '8px 30px', borderRadius: 40, letterSpacing: 3, transform: `scale(${k})`}}>{p.etiquette}</span>
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: tailleTitre, color: '#fff', textAlign: 'center',
          marginTop: 18, lineHeight: 1.1, opacity: apparition, WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>
          {lignesTitre.map((l) => <div key={l}>{l}</div>)}</div>
      </div>
      {/* Boîte de saisie, comme dans une discussion avec une IA. */}
      <div style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: hautBoite,
        height: Math.min(BAS_BOITE - hautBoite, total + 2 * p.taille * 0.6 + 6), borderRadius: 34,
        background: 'rgba(14,18,44,0.92)', border: '3px solid rgba(155,123,255,0.65)', boxSizing: 'border-box',
        boxShadow: '0 24px 70px rgba(0,0,0,0.55)', overflow: 'hidden', opacity: apparition,
        transform: `translateY(${50 * (1 - apparition)}px)`}}>
        <div style={{position: 'absolute', left: marge, width: largeurTexte + 18, top: p.taille * 0.6 - defile}}>
          {p.lignes.map((l, i) => {
            if (!l) return <div key={i} style={{height: p.taille * 0.55}} />;
            const j = pleines.indexOf(i);
            const a = departs[j];
            const fin = j + 1 < departs.length ? departs[j + 1] : d;
            const actif = f >= a && f < fin;
            const passe = f >= fin;
            const s = prog(f, a, 7);
            return (
              <div key={i} style={{fontFamily: POLICE, fontWeight: 800, fontSize: p.taille, lineHeight: 1.32,
                color: actif ? NUIT : TEXTE, opacity: actif || passe ? 1 : 0.55, marginBottom: p.taille * 0.35}}>
                <span style={{backgroundImage: `linear-gradient(${OR}, ${OR})`, backgroundRepeat: 'no-repeat',
                  backgroundSize: `${actif ? s * 100 : 0}% 100%`, WebkitBoxDecorationBreak: 'clone',
                  boxDecorationBreak: 'clone', padding: '0 6px', borderRadius: 8}}>
                  <Morceaux texte={l} actif={actif} />
                </span>
              </div>
            );
          })}
        </div>
        {depasse > 0 ? (
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, opacity: defile < depasse - 4 ? 1 : 0,
            background: 'linear-gradient(transparent, rgba(14,18,44,0.95))'}} />
        ) : null}
      </div>
      <div style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: BAS_BOITE + 14, fontFamily: POLICE,
        fontWeight: 800, fontSize: 28, color: '#C9C2FF', opacity: apparition, textAlign: 'center'}}>
        Tous les prompts sont dans le document du groupe VIP</div>
    </AbsoluteFill>
  );
};

export const CartePrompt: React.FC<PropsCarte> = (p) => (usePolicesChargees() ? <Corps {...p} /> : null);

// Vrai prompt Google Flow (scène 1) : les mots clés s'allument un à un (vertical 9:16, 8 secondes, réplique exacte,
// synchronisation des lèvres, pas de sous-titres). `temps` : seconde de chaque mot clé.
const CorpsFlow: React.FC<{temps?: number[]}> = ({temps}) => {
  const f = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const n = 5;
  const departs = Array.from({length: n}).map((_, j) => (temps?.[j] !== undefined ? temps[j] * FPS
    : 1.5 * FPS + j * (d - 2.5 * FPS) / n));
  let compte = -1;
  const apparition = prog(f, 2, 14);
  return (
    <AbsoluteFill>
      <FondNuit teinte="vert" />
      <div style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: 215, display: 'flex',
        flexDirection: 'column', alignItems: 'center'}}>
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 42, color: NUIT, background: OR,
          padding: '8px 30px', borderRadius: 40, letterSpacing: 3, transform: `scale(${pop(f, 0)})`}}>UN VRAI PROMPT GOOGLE FLOW</span>
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 50, color: '#fff', marginTop: 16,
          WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', opacity: apparition}}>Scène 1, écrit par ChatGPT</div>
        <div style={{marginTop: 26, width: LARGEUR_UTILE, borderRadius: 30, background: 'rgba(8,20,24,0.9)',
          border: '3px solid rgba(126,232,168,0.6)', padding: '30px 30px', opacity: apparition}}>
          {PROMPT_FLOW_SCENE1.map((para, i) => (
            <div key={i} style={{fontFamily: POLICE, fontWeight: 800, fontSize: 30, lineHeight: 1.35, color: '#C8D3D0',
              marginBottom: 20, whiteSpace: 'pre-line'}}>
              {para.split(/(\[\[[^\]]*\]\])/).map((m, k) => {
                if (!m.startsWith('[[')) return <span key={k}>{m}</span>;
                compte += 1;
                const s = prog(f, departs[compte], 7);
                return (
                  <span key={k} style={{color: s > 0.5 ? NUIT : '#fff', backgroundImage: `linear-gradient(${OR}, ${OR})`,
                    backgroundRepeat: 'no-repeat', backgroundSize: `${s * 100}% 100%`, padding: '0 6px', borderRadius: 8,
                    fontWeight: 900, WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone'}}>{m.slice(2, -2)}</span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
export const PromptFlowReel: React.FC<{temps?: number[]}> = (p) => (usePolicesChargees() ? <CorpsFlow {...p} /> : null);
