import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {POLICE} from '../charte';
import {usePolicesChargees} from '../Montage';
import {AvantApres} from './AvantApres';
import {CarteChoix, CarteTexte, SceneInspiration, SceneLogo, ScenePiecesJointes} from './Cartes';
import {CartePrompt, PromptFlowReel} from './CartePrompt';
import {FondNuit, NUIT, OR, pop, prog, VERT} from './commun';
import {CartonRetenir, type Illustration, Illustrations, type Note, Notes} from './Ajouts';
import {DoubleFormation, Partage, type PropsDouble, StudioDecor} from './DoubleFormation';
import {ExtraitEcran} from './ExtraitEcran';
import {GeneriqueAdhesion, GeneriqueFin, GeneriqueOuverture, GeneriqueServices, GeneriqueTalkami} from './Generiques';
import {SceneBarre32, SceneBarriere30, SceneBesoins, SceneEmploye, SceneLimites, ScenePromptVague, SceneRecap,
  SceneReglages, SceneWhatsAppFlou} from './Scenes';

// Montage final de la formation (props : public/<projet>/formation_props.json, scripts/formation_montage.py).
// Plans successifs, cartons d'étape, badge « ÉTAPE n / 7 », sous-titres dans une bande sous l'image.
type Plan = {debut: number; fin: number; type: string; props: Record<string, unknown>; generique: boolean};
type Carton = {debut: number; fin: number; numero: number; titre: string};
type Retenir = {debut: number; fin: number; numero: number; points: string[]};
type SousTitre = {debut: number; fin: number; mots: {t: string; cle: boolean}[]};
export type FormationProps = {duree: number; ouverture: number; plans: Plan[]; cartons: Carton[]; retenirs?: Retenir[];
  badges: Carton[];
  sousTitres: SousTitre[]; hauteurVue: number; double?: PropsDouble};

const ELEMENTS: Record<string, React.FC<any>> = {
  AvantApres, CarteChoix, CarteTexte, SceneInspiration, SceneLogo, ScenePiecesJointes, Carte: CartePrompt, CarteFlow: PromptFlowReel,
  Extrait: ExtraitEcran, GeneriqueServices, GeneriqueAdhesion, GeneriqueTalkami, GeneriqueFin, SceneBarre32,
  SceneBarriere30, SceneBesoins, SceneEmploye, SceneLimites, ScenePromptVague, SceneRecap, SceneReglages, SceneWhatsAppFlou,
};
const TOTAL_ETAPES = 7;

// Carton d'étape : grand numéro, titre, sept pastilles de progression.
const CartonEtape: React.FC<{numero: number; titre: string}> = ({numero, titre}) => {
  const t = useCurrentFrame();
  const k = pop(t, 0, 180);
  const {durationInFrames: d} = useVideoConfig();
  const sortie = prog(t, d - 12, 10);
  return (
    <AbsoluteFill style={{opacity: 1 - sortie}}>
      <FondNuit teinte="violet" />
      <div style={{position: 'absolute', left: 50, width: 900, top: 520, display: 'flex', flexDirection: 'column',
        alignItems: 'center', transform: `scale(${k})`}}>
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 70, color: NUIT, background: OR, padding: '6px 40px',
          borderRadius: 30, letterSpacing: 6}}>ÉTAPE</div>
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 330, color: '#fff', lineHeight: 1,
          WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', marginTop: 10}}>{numero}</div>
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: titre.length > 22 ? 66 : 80, color: '#fff',
          textAlign: 'center', lineHeight: 1.1, marginTop: 20, WebkitTextStroke: '7px #000', paintOrder: 'stroke fill'}}>{titre}</div>
        <div style={{display: 'flex', gap: 22, marginTop: 60}}>
          {Array.from({length: TOTAL_ETAPES}).map((_, i) => (
            <div key={i} style={{width: 56, height: 56, borderRadius: 28, border: '5px solid #fff',
              background: i + 1 < numero ? VERT : i + 1 === numero ? OR : 'transparent',
              transform: `scale(${i + 1 === numero ? 1 + 0.15 * Math.abs(Math.sin(t / 6)) : 1})`}} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Badge permanent en haut : où en est l'élève.
const Badge: React.FC<{numero: number; titre: string}> = ({numero, titre}) => {
  const t = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 36, display: 'flex', justifyContent: 'center',
      opacity: prog(t, 0, 10)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(7,10,36,0.9)', border: `3px solid ${OR}`,
        borderRadius: 40, padding: '8px 26px 8px 10px'}}>
        <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 32, color: NUIT, background: OR, borderRadius: 26,
          padding: '2px 16px'}}>ÉTAPE {numero}/{TOTAL_ETAPES}</span>
        <span style={{fontFamily: POLICE, fontWeight: 800, fontSize: 30, color: '#fff'}}>{titre}</span>
      </div>
    </div>
  );
};

// Sous-titres : bande sombre sous l'image (jamais sur l'écran filmé ni sur les cartes), mots clés en jaune.
const BANDE = {haut: 1548, hauteur: 250};
const SousTitres: React.FC<{st: SousTitre[]}> = ({st}) => {
  const f = useCurrentFrame();
  const g = st.find((s) => f >= s.debut && f < s.fin);
  if (!g) return null;
  const k = prog(f, g.debut, 4);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: BANDE.haut, height: BANDE.hauteur, display: 'flex',
      alignItems: 'center', justifyContent: 'center'}}>
      <div style={{maxWidth: 1000, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 60, lineHeight: 1.25,
        color: '#fff', background: 'rgba(5,7,24,0.82)', borderRadius: 26, padding: '14px 30px',
        transform: `translateY(${(1 - k) * 12}px)`, opacity: 0.4 + 0.6 * k}}>
        {g.mots.map((m, i) => (
          <span key={i} style={{color: m.cle ? '#FFD400' : '#fff'}}>{m.t}{i < g.mots.length - 1 ? ' ' : ''}</span>
        ))}
      </div>
    </div>
  );
};

const Corps: React.FC<FormationProps> = ({ouverture, plans, cartons, retenirs = [], badges, sousTitres, double}) => (
  <AbsoluteFill style={{background: NUIT}}>
    <Sequence durationInFrames={ouverture} name="Générique d'ouverture">
      <GeneriqueOuverture />
    </Sequence>
    <StudioDecor d={double} />
    <Partage d={double}>
      {plans.map((p, i) => {
        const C = ELEMENTS[p.type];
        return (
          <Sequence key={i} from={p.debut} durationInFrames={Math.max(1, p.fin - p.debut)} name={`${p.type} ${i}`}>
            <C {...p.props} />
            <Illustrations liste={p.props.illustrations as Illustration[] | undefined} />
            <Notes liste={p.props.notes as Note[] | undefined} />
          </Sequence>
        );
      })}
      {cartons.map((c) => (
        <Sequence key={`c${c.numero}`} from={c.debut} durationInFrames={c.fin - c.debut} name={`Carton étape ${c.numero}`}>
          <CartonEtape numero={c.numero} titre={c.titre} />
        </Sequence>
      ))}
      {retenirs.map((c) => (
        <Sequence key={`r${c.numero}`} from={c.debut} durationInFrames={c.fin - c.debut} name={`À retenir ${c.numero}`}>
          <CartonRetenir numero={c.numero} points={c.points} />
        </Sequence>
      ))}
    </Partage>
    <DoubleFormation d={double} />
    {badges.map((b) => (
      <Sequence key={`b${b.numero}`} from={b.debut} durationInFrames={b.fin - b.debut} name={`Badge étape ${b.numero}`}>
        <Badge numero={b.numero} titre={b.titre} />
      </Sequence>
    ))}
    <SousTitres st={sousTitres} />
  </AbsoluteFill>
);

export const Formation: React.FC<FormationProps> = (p) => (usePolicesChargees() ? <Corps {...p} /> : null);
