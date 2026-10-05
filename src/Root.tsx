import React from 'react';
import {loadFont} from '@remotion/fonts';
import {Composition, staticFile} from 'remotion';
import {Montage} from './Montage';
import type {MontageProps} from './types';

loadFont({family: 'Montserrat', url: staticFile('polices/montserrat-latin-800-normal.woff2'), weight: '800'});
loadFont({family: 'Montserrat', url: staticFile('polices/montserrat-latin-900-normal.woff2'), weight: '900'});

// Les vraies données arrivent par --props=public/<projet>/props.json (voir scripts/rendre.sh).
const exemple: MontageProps = {video: '', dureeImages: 30, mots: [], groupes: [], plans: [0], scenes: [], onde: []};

export const Root: React.FC = () => (
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
);
