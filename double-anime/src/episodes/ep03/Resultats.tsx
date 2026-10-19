import {Easing, interpolate} from 'remotion';
import {Etoile} from '../../commun/Ecran';
import {pop, prog} from '../../commun/temps';
import {COULEURS, POLICE} from '../../theme';
import {ACCENTS, ROUGE, VERT} from './Fonds';

// Résultat de la bonne demande, en illustration animée (900 × 505, texte ≥ 48 px).
// Données inventées et génériques, toujours marquées « Exemple ».

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const N = COULEURS.nuit;
const O = COULEURS.or;
const B = COULEURS.blanc;
const GRIS = '#9aa3c0';
const T = 52; // taille du texte

const Cadre: React.FC<{n: number; legende: string; t: number; a: number; children: React.ReactNode}> = ({n, legende, t, a, children}) => (
  <div style={{position: 'absolute', inset: 0, borderRadius: 36, background: '#ffffff', boxShadow: `0 20px 50px #000a, 0 0 0 7px ${ACCENTS[n - 1]}`, overflow: 'hidden', fontFamily: POLICE}}>
    <div style={{position: 'absolute', left: 26, top: 22, right: 26, display: 'flex', alignItems: 'center', gap: 18}}>
      <div style={{padding: '2px 20px', borderRadius: 14, background: ACCENTS[n - 1], color: B, fontSize: 48, fontWeight: 800}}>Exemple</div>
      <div style={{fontSize: T, fontWeight: 800, color: N, opacity: prog(t, a + 0.2, a + 0.4), whiteSpace: 'nowrap'}}>{legende}</div>
    </div>
    <div style={{position: 'absolute', left: 26, right: 26, top: 112, bottom: 22}}>{children}</div>
  </div>
);

const Coche: React.FC<{s: number; taille?: number; couleur?: string}> = ({s, taille = 64, couleur = VERT}) => (
  <svg width={taille} height={taille} viewBox="-25 -25 50 50" style={{transform: `scale(${s})`, flex: '0 0 auto'}}>
    <circle r={23} fill={couleur} />
    <path d="M-11 0 L-3 9 L12 -9" stroke={B} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 1 : un texte flou qui devient net et aéré, avec une étoile.
const R1: React.FC<{t: number; a: number}> = ({t, a}) => {
  const p = prog(t, a + 0.1, a + 0.7);
  return (
    <Cadre n={1} legende="Texte clair et fluide" t={t} a={a}>
      <div style={{filter: `blur(${(1 - p) * 9}px)`, paddingTop: 10}}>
        {[640, 560, 610, 460, 520].map((l, k) => (
          <div key={k} style={{height: 30, width: l * (0.85 + 0.15 * p), borderRadius: 15, background: p > 0.5 ? (k === 0 ? N : '#5b6280') : GRIS, marginTop: k ? 16 + 22 * p : 0}} />
        ))}
      </div>
      <div style={{position: 'absolute', right: 10, top: 40, transform: `scale(${pop(t, a + 0.7, 0.35)}) rotate(${t * 90}deg)`}}>
        <Etoile taille={170} couleur={O} />
      </div>
    </Cadre>
  );
};

// 2 : un planning de la journée, les blocs horaires se remplissent.
const R2: React.FC<{t: number; a: number}> = ({t, a}) => (
  <Cadre n={2} legende="Ta journée planifiée" t={t} a={a}>
    {['8 h', '11 h', '14 h'].map((h, k) => {
      const p = prog(t, a + 0.1 + k * 0.22, a + 0.45 + k * 0.22, Easing.out(Easing.cubic));
      return (
        <div key={k} style={{display: 'flex', alignItems: 'center', gap: 22, height: 120}}>
          <div style={{width: 140, fontSize: 60, fontWeight: 800, color: N}}>{h}</div>
          <div style={{flex: 1, height: 84, borderRadius: 20, background: '#eef0f7'}}>
            <div style={{width: `${p * [92, 70, 84][k]}%`, height: '100%', borderRadius: 20, background: [ACCENTS[1], O, VERT][k]}} />
          </div>
        </div>
      );
    })}
  </Cadre>
);

// 3 : une ligne de CV où les chiffres s'animent.
const R3: React.FC<{t: number; a: number}> = ({t, a}) => {
  const v = Math.round(interpolate(t, [a + 0.1, a + 0.8], [0, 35], {...clamp, easing: Easing.out(Easing.cubic)}));
  return (
    <Cadre n={3} legende="CV mesurable" t={t} a={a}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 40, height: '100%'}}>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 18, height: 340}}>
          {[0.35, 0.5, 0.62, 1].map((h, k) => (
            <div key={k} style={{width: 62, height: 340 * h * prog(t, a + 0.1 + k * 0.1, a + 0.5 + k * 0.1), borderRadius: 14, background: k === 3 ? VERT : ACCENTS[2]}} />
          ))}
        </div>
        <div style={{flex: 1, paddingBottom: 20}}>
          <div style={{fontSize: 60, fontWeight: 800, color: '#5b6280'}}>Ventes</div>
          <div style={{fontSize: 140, fontWeight: 800, color: VERT, lineHeight: 1, whiteSpace: 'nowrap'}}>+{v}&nbsp;%</div>
        </div>
      </div>
    </Cadre>
  );
};

// 4 : un calendrier de 7 jours dont les cases se cochent.
const R4: React.FC<{t: number; a: number}> = ({t, a}) => (
  <Cadre n={4} legende="7 jours, 7 étapes" t={t} a={a}>
    <div style={{display: 'flex', gap: 12, height: '100%', alignItems: 'center'}}>
      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((j, k) => {
        const s = pop(t, a + 0.15 + k * 0.1, 0.25);
        return (
          <div key={k} style={{flex: 1, height: 300, borderRadius: 22, background: '#eef0f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', border: `5px solid ${s > 0.5 ? ACCENTS[3] : '#dfe3f0'}`}}>
            <div style={{fontSize: 64, fontWeight: 800, color: N}}>{j}</div>
            <Coche s={s} taille={76} couleur={ACCENTS[3]} />
          </div>
        );
      })}
    </div>
  </Cadre>
);

// 5 : une légende courte, un chronomètre de 3 secondes qui s'arrête.
const R5: React.FC<{t: number; a: number}> = ({t, a}) => {
  const s = interpolate(t, [a + 0.05, a + 0.85], [0, 3], clamp);
  const fini = t > a + 0.85;
  return (
    <Cadre n={5} legende="Accroche en 3 s" t={t} a={a}>
      <div style={{display: 'flex', alignItems: 'center', gap: 26, height: '100%'}}>
        <div style={{flex: 1, padding: '22px 26px', borderRadius: 26, background: '#fff0f6', border: `5px solid ${ACCENTS[4]}`, fontSize: T, fontWeight: 800, color: N, lineHeight: 1.18, opacity: prog(t, a, a + 0.2)}}>
          J’ai doublé mes ventes en 1 mois 🚀
        </div>
        <svg width={280} height={280} viewBox="-60 -66 120 126" style={{flex: '0 0 auto'}}>
          <circle r={50} fill="#eef0f7" stroke={fini ? VERT : N} strokeWidth={8} />
          <rect x={-8} y={-66} width={16} height={12} rx={3} fill={N} />
          <path d={`M0 0 L${Math.sin((s / 3) * 2 * Math.PI) * 38} ${-Math.cos((s / 3) * 2 * Math.PI) * 38}`} stroke={ROUGE} strokeWidth={7} strokeLinecap="round" />
          <text y={30} textAnchor="middle" fontSize={24} fontWeight={800} fill={N} fontFamily={POLICE}>{s.toFixed(1)} s</text>
        </svg>
      </div>
    </Cadre>
  );
};

// 6 : une réponse e-mail courte et propre qui s'envoie.
const R6: React.FC<{t: number; a: number}> = ({t, a}) => {
  const envoi = prog(t, a + 0.6, a + 0.9, Easing.in(Easing.cubic));
  return (
    <Cadre n={6} legende="Réponse claire" t={t} a={a}>
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
        <div style={{transform: `translate(${envoi * 700}px, ${-envoi * 160}px) rotate(${envoi * 12}deg) scale(${1 - envoi * 0.5})`, opacity: 1 - envoi}}>
          <div style={{fontSize: 60, fontWeight: 800, color: N}}>Bonjour,</div>
          {[620, 540, 380].map((l, k) => <div key={k} style={{height: 26, width: l * prog(t, a + 0.1 + k * 0.12, a + 0.4 + k * 0.12), borderRadius: 13, background: '#5b6280', marginTop: 18}} />)}
        </div>
        {envoi > 0.6 ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, transform: `scale(${pop(t, a + 0.85, 0.3)})`}}>
            <Coche s={1} taille={150} couleur={VERT} />
            <div style={{fontSize: 64, fontWeight: 800, color: N}}>Envoyée</div>
          </div>
        ) : null}
        <div style={{alignSelf: 'flex-end', padding: '12px 34px', borderRadius: 22, background: ACCENTS[5], color: B, fontSize: 56, fontWeight: 800, transform: `scale(${1 - 0.12 * prog(t, a + 0.6, a + 0.7) + 0.12 * prog(t, a + 0.7, a + 0.8)})`}}>
          Envoyer ➤
        </div>
      </div>
    </Cadre>
  );
};

// 7 : quatre cartes de solutions, « + » et « − » qui surgissent.
const R7: React.FC<{t: number; a: number}> = ({t, a}) => (
  <Cadre n={7} legende="4 solutions" t={t} a={a}>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 18, height: '100%'}}>
      {[1, 2, 3, 4].map((k) => (
        <div key={k} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderRadius: 22, background: '#f3ecff', border: `4px solid ${ACCENTS[6]}`, transform: `scale(${pop(t, a + 0.05 + k * 0.1, 0.25)})`}}>
          <div style={{fontSize: 56, fontWeight: 800, color: N}}>Idée {k}</div>
          <div style={{display: 'flex', gap: 10}}>
            {['+', '−'].map((sgn, j) => (
              <div key={j} style={{width: 64, height: 64, borderRadius: 32, background: j ? ROUGE : VERT, color: B, fontSize: 56, fontWeight: 800, display: 'grid', placeItems: 'center', lineHeight: 1, transform: `scale(${pop(t, a + 0.45 + k * 0.1 + j * 0.08, 0.25)})`}}>{sgn}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Cadre>
);

const RESULTATS = [R1, R2, R3, R4, R5, R6, R7];

export const Resultat: React.FC<{n: number; t: number; a: number}> = ({n, t, a}) => {
  const R = RESULTATS[n - 1];
  return <R t={t} a={a} />;
};
