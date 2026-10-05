import React from 'react';
import {useCurrentFrame} from 'remotion';
import {JAUNE} from '../charte';

export const Progression: React.FC<{total: number}> = ({total}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: 'rgba(255,255,255,0.25)'}}>
      <div style={{width: `${(frame / Math.max(1, total - 1)) * 100}%`, height: '100%', background: JAUNE}} />
    </div>
  );
};
