import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import {COULEURS, POLICE} from '../theme';
import {Etoile} from './Ecran';
import {pop, prog} from './temps';

// Carte de fin avec contacts (épisodes à captures). Tout reste en mouvement
// (logo qui flotte, bouton qui pulse, fond qui tourne, flèche qui rebondit) :
// aucune image figée plus de 2 s. Tout est dans la zone sûre TikTok
// (x ≤ 950, y 200–1536). Les numéros apparaissent un par un (`numeros`).

export const NUMEROS = ['+228 72 24 02 31', '+228 79 16 23 90'];

export const CarteContacts: React.FC<{t: number; numeros: number[]; lien: number}> = ({t, numeros, lien}) => {
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const pulse = 1 + 0.05 * Math.sin(t * 7);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at ${50 + Math.sin(t * 1.3) * 10}% ${32 + Math.cos(t * 1.1) * 6}%, #2a2580 0%, ${COULEURS.nuit} 62%)`, fontFamily: POLICE, overflow: 'hidden'}}>
      {/* rayons lents */}
      <div style={{position: 'absolute', left: 540 - 1000, top: 380 - 1000, width: 2000, height: 2000, transform: `rotate(${t * 14}deg)`, opacity: 0.13, background: `conic-gradient(${COULEURS.violet}, transparent 12%, ${COULEURS.or} 25%, transparent 37%, ${COULEURS.violet} 50%, transparent 62%, ${COULEURS.or} 75%, transparent 87%, ${COULEURS.violet})`}} />
      {[[120, 300, 56], [860, 420, 42], [110, 1000, 40], [900, 1360, 54], [500, 1420, 34]].map(([x, y, s], i) => (
        <div key={i} style={{position: 'absolute', left: x, top: y + Math.sin(t * 2 + i) * 14, transform: `rotate(${t * 50 + i * 40}deg) scale(${pop(t, 0.2 + i * 0.08)})`}}>
          <Etoile taille={s} couleur={i % 2 ? COULEURS.or : COULEURS.violet} />
        </div>
      ))}
      <div style={{position: 'absolute', left: 40, width: 910, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {/* logo animé */}
        <Img
          src={staticFile('marque/logo.jpg')}
          style={{marginTop: 225, width: 290, height: 290, borderRadius: 50, boxShadow: `0 0 ${40 + 20 * Math.sin(t * 3)}px ${COULEURS.or}99`, transform: `translateY(${Math.sin(t * 2.2) * 10}px) rotate(${Math.sin(t * 1.6) * 3}deg) scale(${pop(t, 0, 0.4)})`}}
        />
        {/* slogan */}
        <div style={{marginTop: 34, textAlign: 'center', color: COULEURS.blanc, fontWeight: 800, fontSize: 50, lineHeight: 1.15, opacity: prog(t, 0.15, 0.4), transform: `translateY(${(1 - prog(t, 0.15, 0.4)) * 30}px)`}}>
          Maîtrisez l’IA et transformez vos compétences en <span style={{color: COULEURS.or}}>opportunités</span>
        </div>
        {/* bouton qui pulse */}
        <div style={{marginTop: 44, padding: '26px 58px', borderRadius: 999, whiteSpace: 'nowrap', background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, color: COULEURS.nuit, fontWeight: 800, fontSize: 64, transform: `scale(${pop(t, 0.3, 0.35) * pulse})`, boxShadow: `0 0 ${36 + 22 * Math.sin(t * 7)}px ${COULEURS.or}, 0 16px 40px #000a`}}>
          Consultation gratuite
        </div>
        {/* téléphone et numéros */}
        <div style={{marginTop: 56, display: 'flex', alignItems: 'center', gap: 30}}>
          <div style={{width: 120, height: 120, borderRadius: 34, background: COULEURS.violet, display: 'grid', placeItems: 'center', transform: `rotate(${Math.sin(t * 9) * (t > numeros[0] - 0.2 ? 8 : 0)}deg) scale(${pop(t, 0.45, 0.35)})`}}>
            <svg width={76} height={76} viewBox="0 0 24 24">
              <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill={COULEURS.nuit} />
            </svg>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
            {NUMEROS.map((n, i) => {
              const a = numeros[i];
              return (
                <div
                  key={n}
                  style={{
                    fontSize: 82,
                    fontWeight: 800,
                    color: COULEURS.blanc,
                    letterSpacing: 1,
                    whiteSpace: 'nowrap',
                    fontVariantNumeric: 'tabular-nums',
                    WebkitTextStroke: `10px ${COULEURS.nuit}`,
                    paintOrder: 'stroke fill',
                    opacity: t >= a ? 1 : 0,
                    transform: `scale(${t >= a ? pop(t, a, 0.3) : 0})`,
                    transformOrigin: '0 50%',
                  }}
                >
                  {n}
                </div>
              );
            })}
          </div>
        </div>
        {/* lien dans la bio */}
        <div style={{marginTop: 60, display: 'flex', alignItems: 'center', gap: 18, padding: '20px 48px', borderRadius: 999, background: COULEURS.blanc, color: COULEURS.nuit, fontWeight: 800, fontSize: 56, transform: `scale(${pop(t, lien, 0.35) * (1 + 0.04 * Math.sin(t * 5))})`}}>
          Lien dans la bio
          <span style={{display: 'inline-block', color: COULEURS.violetFonce, transform: `translateY(${interpolate(Math.abs(Math.sin(t * 5)), [0, 1], [-6, 14], clamp)}px)`}}>↓</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
