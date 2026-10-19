import {AbsoluteFill, Img, staticFile} from 'remotion';
import {COULEURS, POLICE} from '../theme';
import {pop, prog} from './temps';
import {Etoile} from './Ecran';

// Carton de fin commun à la série : logo, « Consultation gratuite », « Lien dans la bio ».
export const DUREE_CARTON_FIN = 3.6;

// `accents` : instants (s, depuis le début du carton) où la voix prononce
// « consultation gratuite » et « lien dans la bio » : l'élément pulse.
const pulsation = (t: number, a?: number) => (a === undefined ? 1 : 1 + 0.08 * Math.exp(-(((t - a - 0.25) / 0.22) ** 2)));

// `anime` : mouvement permanent (logo qui flotte, textes qui respirent, fond
// qui tourne) pour qu'aucune image ne reste figée plus de 2 s.
export const CartonFin: React.FC<{t: number; accents?: {consultation?: number; lien?: number}; anime?: boolean}> = ({t, accents = {}, anime = false}) => {
  const flotte = anime ? Math.sin(t * 2.2) * 18 : 0;
  const respire = anime ? 1 + 0.05 * Math.sin(t * 4.4) : 1;
  // t : secondes depuis le début du carton
  const entree = prog(t, 0, 0.35);
  const fleche = Math.sin(t * 6) * 10;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${50 + (anime ? Math.sin(t * 1.3) * 12 : 0)}% ${40 + (anime ? Math.cos(t * 1.1) * 8 : 0)}%, #1b1f63 0%, ${COULEURS.nuit} 65%)`,
        opacity: entree,
        fontFamily: POLICE,
        alignItems: 'center',
      }}
    >
      {[[180, 330, 70], [880, 420, 50], [150, 1350, 46], [930, 1250, 64]].map(([x, y, s], i) => (
        <div key={i} style={{position: 'absolute', left: x, top: y, transform: `rotate(${t * 40 + i * 30}deg) scale(${pop(t, 0.3 + i * 0.1)})`}}>
          <Etoile taille={s} couleur={i % 2 ? COULEURS.or : COULEURS.violet} />
        </div>
      ))}
      <Img src={staticFile('marque/logo.jpg')} style={{position: 'absolute', top: 360, width: 460, height: 460, borderRadius: 56, transform: `translateY(${flotte}px) rotate(${anime ? Math.sin(t * 1.7) * 3 : 0}deg) scale(${pop(t, 0.1, 0.45)})`}} />
      <div style={{position: 'absolute', top: 900, color: COULEURS.or, fontWeight: 800, fontSize: 104, letterSpacing: -1, transform: `scale(${pop(t, 0.45, 0.4) * pulsation(t, accents.consultation) * respire})`, textAlign: 'center', lineHeight: 1.05}}>
        Consultation
        <br />
        gratuite
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1170,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '20px 44px',
          borderRadius: 999,
          background: COULEURS.blanc,
          color: COULEURS.nuit,
          fontWeight: 800,
          fontSize: 58,
          transform: `scale(${pop(t, 0.8, 0.4) * pulsation(t, accents.lien) * (anime ? 1 + 0.06 * Math.sin(t * 6) : 1)})`,
          boxShadow: anime ? `0 0 ${30 + 20 * Math.sin(t * 6)}px ${COULEURS.or}` : undefined,
        }}
      >
        Lien dans la bio
        <span style={{display: 'inline-block', transform: `translateY(${fleche}px)`, color: COULEURS.violetFonce}}>↓</span>
      </div>
    </AbsoluteFill>
  );
};
