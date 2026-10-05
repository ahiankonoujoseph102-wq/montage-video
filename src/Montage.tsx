import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {Onde} from './composants/Onde';
import {PassageAnime} from './composants/PassageAnime';
import {Progression} from './composants/Progression';
import {SousTitres} from './composants/SousTitres';
import {TitreAccroche} from './composants/TitreAccroche';
import type {MontageProps} from './types';

export const Montage: React.FC<MontageProps> = (p) => (
  <AbsoluteFill style={{backgroundColor: 'black'}}>
    {/* La vidéo est déjà coupée et recadrée en 1080 × 1920 par scripts/preparer.py. */}
    <OffthreadVideo src={staticFile(p.video)} style={{width: '100%', height: '100%'}} />
    {p.scenes.map((s) => (
      <Sequence key={s.id} from={s.debut} durationInFrames={s.fin - s.debut} layout="none">
        <PassageAnime scene={s} />
      </Sequence>
    ))}
    {p.titre ? <TitreAccroche titre={p.titre} /> : null}
    <Onde onde={p.onde} />
    <SousTitres mots={p.mots} groupes={p.groupes} />
    <Progression total={p.dureeImages} />
  </AbsoluteFill>
);
