import React from 'react';
import {loadFont} from '@remotion/fonts';
import {Composition, staticFile} from 'remotion';
import {Montage} from './Montage';
import {PubTalkami, PubProps} from './pub/PubTalkami';
import {PubTalkami2, PubV2Props} from './pub/PubTalkami2';
import {PubTalkami3, PubV3Props} from './pub/PubTalkami3';
import {VideoAuto, AutoProps} from './auto/VideoAuto';
import {Transition, TransitionProps} from './Transition';
import type {MontageProps} from './types';

loadFont({family: 'Montserrat', url: staticFile('polices/montserrat-latin-800-normal.woff2'), weight: '800'});
loadFont({family: 'Montserrat', url: staticFile('polices/montserrat-latin-900-normal.woff2'), weight: '900'});

// Les vraies données arrivent par --props=public/<projet>/props.json (voir scripts/rendre.sh).
const exemple: MontageProps = {video: '', dureeImages: 30, mots: [], groupes: [], plans: [0], masques: [], dureeVideo: 30, scenes: [], onde: []};

const transitionExemple: TransitionProps = {avant: '', apres: '', surtitre: 'ET MAINTENANT…',
  titre: 'REGARDEZ\nLA VIDÉO', bloc: "MONTÉE À 100 % PAR L'IA"};

const pubExemple: PubProps = {duree: 1, sousTitres: [], plans: []};

const pubV2Exemple: PubV2Props = {duree: 1, mots: []};

const pubV3Exemple: PubV3Props = {duree: 1, mots: [], blocs: [], emojis: []};

const autoExemple: AutoProps = {duree: 1, phrases: [], mots: [], motsFrames: [], masques: [], visemes: '', bouche: [],
  scenes: [], fonds: [], emojis: [], decalageDouble: 0};

export const Root: React.FC = () => (
  <>
  <Composition
    id="VideoAuto"
    component={VideoAuto}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={30}
    defaultProps={autoExemple}
    calculateMetadata={({props}) => ({durationInFrames: Math.max(1, Math.round(props.duree * 30))})}
  />
  <Composition
    id="PubTalkami3"
    component={PubTalkami3}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={30}
    defaultProps={pubV3Exemple}
    calculateMetadata={({props}) => ({durationInFrames: Math.max(1, Math.round(props.duree * 30))})}
  />
  <Composition
    id="PubTalkami2"
    component={PubTalkami2}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={30}
    defaultProps={pubV2Exemple}
    calculateMetadata={({props}) => ({durationInFrames: Math.max(1, Math.round(props.duree * 30))})}
  />
  <Composition
    id="PubTalkami"
    component={PubTalkami}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={30}
    defaultProps={pubExemple}
    calculateMetadata={({props}) => ({durationInFrames: Math.max(1, Math.round(props.duree * 30))})}
  />
  <Composition
    id="Transition"
    component={Transition}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={90}
    defaultProps={transitionExemple}
  />
  <Composition
    id="Montage"
    component={Montage}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={30}
    defaultProps={exemple}
    calculateMetadata={({props}) => ({durationInFrames: Math.max(1, props.dureeImages)})}
  />
  </>
);
