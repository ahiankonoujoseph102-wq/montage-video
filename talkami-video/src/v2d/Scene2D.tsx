import {AbsoluteFill} from 'remotion';
import {Ecran} from '../commun/Ecran';
import {COULEURS} from '../theme';
import {Bureau2D, Decor2D} from './Decor2D';
import {BrasDouble2D, Double2D, EtatDouble} from './Double2D';

// Couches : décor, écran (HTML), corps du double, bureau, bras du double.
export const Scene2D: React.FC<{etat: EtatDouble; ecran?: React.ReactNode; children?: React.ReactNode}> = ({
  etat,
  ecran = <Ecran />,
  children,
}) => (
  <AbsoluteFill style={{background: COULEURS.nuit}}>
    <Decor2D />
    <AbsoluteFill>{ecran}</AbsoluteFill>
    <Double2D etat={etat} />
    <Bureau2D />
    <BrasDouble2D etat={etat} />
    {children}
  </AbsoluteFill>
);
