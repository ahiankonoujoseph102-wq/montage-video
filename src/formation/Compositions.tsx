import React from 'react';
import {Composition} from 'remotion';
import {AvantApres} from './AvantApres';
import {CartePrompt, dureeCarte, PromptFlowReel} from './CartePrompt';
import {ExtraitEcran, type PropsExtrait} from './ExtraitEcran';
import {GeneriqueAdhesion, GeneriqueFin, GeneriqueOuverture, GeneriqueServices, GeneriqueTalkami} from './Generiques';
import {PROMPTS} from './prompts';
import {SceneBarre32, SceneBarriere30, SceneBesoins, SceneEmploye, SceneLimites, ScenePromptVague, SceneRecap,
  SceneReglages, SceneWhatsAppFlou} from './Scenes';

// Éléments de la formation « Monter n'importe quelle vidéo avec l'IA », partie 1 (1080 × 1920, 30 i/s).
// Durée réglable : props `duree` (secondes) ; moments clés : `etapes` (scènes) ou `temps` (cartes de prompts).
const FPS = 30;
const base = {width: 1080, height: 1920, fps: FPS};
const reglable = (defaut: number) => ({
  calculateMetadata: ({props}: {props: {duree?: number}}) => ({durationInFrames: Math.round((props.duree ?? defaut) * FPS)}),
});

const SCENES: [string, React.FC<{duree?: number; etapes?: number[]}>, number][] = [
  ['SceneEmploye', SceneEmploye, 10], ['ScenePromptVague', ScenePromptVague, 12], ['SceneBesoins', SceneBesoins, 12],
  ['SceneBarre32', SceneBarre32, 9], ['SceneReglages', SceneReglages, 12], ['SceneBarriere30', SceneBarriere30, 10],
  ['SceneWhatsAppFlou', SceneWhatsAppFlou, 9], ['SceneLimites', SceneLimites, 12], ['SceneRecap', SceneRecap, 14],
];

const extraitVide: PropsExtrait = {video: '', dureeImages: 30, zooms: [], acceleres: []};

export const CompositionsFormation: React.FC = () => (
  <>
    <Composition id="GeneriqueOuverture" component={GeneriqueOuverture} {...base} durationInFrames={240} />
    <Composition id="GeneriqueServices" component={GeneriqueServices} {...base} durationInFrames={450}
      defaultProps={{duree: 15}} {...reglable(15)} />
    <Composition id="GeneriqueAdhesion" component={GeneriqueAdhesion} {...base} durationInFrames={450}
      defaultProps={{duree: 15}} {...reglable(15)} />
    <Composition id="GeneriqueTalkami" component={GeneriqueTalkami} {...base} durationInFrames={360}
      defaultProps={{duree: 12}} {...reglable(12)} />
    <Composition id="GeneriqueFin" component={GeneriqueFin} {...base} durationInFrames={300} />
    {PROMPTS.map((p) => (
      <Composition key={p.id} id={`Carte${p.id}`} component={CartePrompt} {...base}
        durationInFrames={dureeCarte(p.id) * FPS} defaultProps={{id: p.id, duree: dureeCarte(p.id)}}
        {...reglable(dureeCarte(p.id))} />
    ))}
    <Composition id="CartePromptFlowReel" component={PromptFlowReel} {...base} durationInFrames={450}
      defaultProps={{duree: 15}} {...reglable(15)} />
    {SCENES.map(([id, C, d]) => (
      <Composition key={id} id={id} component={C} {...base} durationInFrames={d * FPS} defaultProps={{duree: d}}
        {...reglable(d)} />
    ))}
    <Composition id="AvantApres" component={AvantApres} {...base} durationInFrames={960} defaultProps={{son: 'aucun'}} />
    <Composition id="ExtraitEcran" component={ExtraitEcran} {...base} durationInFrames={30} defaultProps={extraitVide}
      calculateMetadata={({props}) => ({durationInFrames: Math.max(1, props.dureeImages)})} />
  </>
);
