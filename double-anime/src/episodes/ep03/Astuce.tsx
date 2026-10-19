import {Easing, interpolate} from 'remotion';
import {pop, prog} from '../../commun/temps';
import {COULEURS, POLICE} from '../../theme';
import {ACCENTS, FondAstuce, ICONES, IconeAnimee, PluieEtoiles, ROUGE, secousse, VERT} from './Fonds';
import {Resultat} from './Resultats';
import {CARTES} from './scenario';
import {PIECES, Piece, TempsAstuce} from './sequence';

// Plans d'une astuce (épisode 3). Tout le texte fait au moins 44 px et reste
// dans la zone sûre TikTok (x 50–950, y 320–1080 ; médaillon et sous-titres dessous).

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const N = COULEURS.nuit;
const O = COULEURS.or;
const B = COULEURS.blanc;
const ZONE = {x: 60, l: 880};
// résultat illustré : 900 px de large (83 % de l'image), sous la phrase récapitulative
const RESULTAT = {x: 45, y: 575, l: 900, h: 505};

// espaces insécables : « et » ne restent jamais seuls en bout de ligne
const insecable = (x: string) => x.replace(/« /g, '« ').replace(/ ([»?:!])/g, ' $1');

const Pastille: React.FC<{texte: string; couleur: string; t: number; a: number; taille?: number; top?: number}> = ({texte, couleur, t, a, taille = 60, top = 340}) => {
  const s = interpolate(t, [a, a + 0.12, a + 0.22], [2.2, 0.94, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 0, width: 1000, top, display: 'flex', justifyContent: 'center', opacity: prog(t, a, a + 0.06), fontFamily: POLICE}}>
      <div style={{display: 'flex', alignItems: 'center', gap: taille * 0.3, padding: '8px 40px 8px 18px', borderRadius: 999, background: couleur, color: couleur === O ? N : B, fontWeight: 800, fontSize: taille, letterSpacing: 1, transform: `scale(${s}) rotate(${-3 + Math.sin(t * 3) * 1.2}deg)`, boxShadow: `0 10px 30px #000a, 0 0 40px ${couleur}88`, whiteSpace: 'nowrap'}}>
        {/* ❌ / ✅ dessinés (les émojis débordaient de la pastille) */}
        <svg width={taille * 1.1} height={taille * 1.1} viewBox="-25 -25 50 50" style={{flex: '0 0 auto'}}>
          <circle r={23} fill={B} />
          {couleur === ROUGE ? <path d="M-9 -9 L9 9 M9 -9 L-9 9" stroke={ROUGE} strokeWidth={7} strokeLinecap="round" /> : <path d="M-11 0 L-3 9 L12 -9" stroke={VERT} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
        {texte}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ a) « Numéro X »

export const PlanNumero: React.FC<{i: number; ta: TempsAstuce; t: number}> = ({i, ta, t}) => {
  const c = CARTES[i];
  const accent = ACCENTS[i];
  // le chiffre et l'icône surgissent dès le début du plan, sans attendre la voix
  const choc = ta.debut + 0.02;
  const cam = secousse(t, [choc], 26);
  const sChiffre = interpolate(t, [choc - 0.02, choc + 0.12, choc + 0.28], [3.4, 0.9, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const flotte = Math.sin(t * 2.6) * 10;
  const onde = t - choc;
  return (
    <FondAstuce n={c.n} t={t}>
      <div style={{position: 'absolute', inset: 0, transform: cam.transform}}>
        {/* « NUMÉRO » glisse, puis le chiffre claque */}
        <div style={{position: 'absolute', left: 0, width: 1000, top: 360, textAlign: 'center', fontWeight: 800, fontSize: 84, letterSpacing: 8, color: B, textShadow: `0 6px 24px #000c`, transform: `translateX(${interpolate(t, [ta.debut, ta.debut + 0.25], [-900, 0], {...clamp, easing: Easing.out(Easing.cubic)})}px)`}}>
          NUMÉRO
        </div>
        {onde > -0.02 ? (
          <>
            <svg style={{position: 'absolute', left: 0, top: 0}} width={1000} height={1200}>
              {[0, 0.12].map((dec, k) => {
                const r = interpolate(onde - dec, [0, 0.6], [80, 520], clamp);
                return <circle key={k} cx={400} cy={690} r={r} fill="none" stroke={k ? B : accent} strokeWidth={14 - k * 6} opacity={interpolate(onde - dec, [0, 0.6], [0.9, 0], clamp)} />;
              })}
            </svg>
            <div style={{position: 'absolute', left: 140, width: 520, top: 420, height: 540, display: 'grid', placeItems: 'center', transform: `translateY(${flotte}px) scale(${sChiffre}) rotate(${interpolate(onde, [0, 0.3], [-12, -4], clamp)}deg)`}}>
              <div style={{fontSize: 520, fontWeight: 800, lineHeight: 1, color: O, WebkitTextStroke: `18px ${N}`, paintOrder: 'stroke fill', textShadow: `0 20px 0 ${N}, 0 0 80px ${O}aa`}}>{c.n}</div>
            </div>
          </>
        ) : null}
        {/* icône animée du thème */}
        <div style={{position: 'absolute', left: 610, top: 520, transform: `scale(${pop(t, choc + 0.1, 0.35)}) rotate(${Math.sin(t * 3) * 6}deg)`}}>
          <div style={{width: 300, height: 300, borderRadius: 60, background: `${accent}55`, border: `6px solid ${accent}`, display: 'grid', placeItems: 'center', boxShadow: `0 0 60px ${accent}88`}}>
            <IconeAnimee kind={ICONES[i]} t={t} a={choc + 0.15} taille={240} couleur={accent} />
          </div>
        </div>
        {/* titre de l'astuce, quand la voix le dit */}
        <div style={{position: 'absolute', left: 60, width: 880, top: 930, textAlign: 'center', opacity: prog(t, ta.titre - 0.05, ta.titre + 0.1), transform: `translateY(${interpolate(t, [ta.titre - 0.05, ta.titre + 0.2], [60, 0], {...clamp, easing: Easing.out(Easing.back(1.6))})}px)`}}>
          <span style={{display: 'inline', fontSize: 64, fontWeight: 800, lineHeight: 1.18, color: B, background: `linear-gradient(transparent 62%, ${accent}cc 62%)`, padding: '0 8px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone', textShadow: '0 4px 16px #000c'}}>
            {c.titre}
          </span>
        </div>
      </div>
    </FondAstuce>
  );
};

// Rappel du titre sur le plan du personnage qui réagit.
export const TitreAstuce: React.FC<{i: number; t: number; a: number}> = ({i, t, a}) => (
  <div style={{position: 'absolute', left: 50, width: 900, top: 345, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, a, 0.3)})`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '10px 28px', borderRadius: 26, background: `${ACCENTS[i]}ee`, boxShadow: '0 10px 30px #000a', maxWidth: 880}}>
      <div style={{flex: '0 0 auto', width: 70, height: 70, borderRadius: 35, background: O, color: N, fontWeight: 800, fontSize: 48, display: 'grid', placeItems: 'center'}}>{i + 1}</div>
      <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 48, lineHeight: 1.1, color: B}}>{CARTES[i].titre}</div>
    </div>
  </div>
);

// ------------------------------------------------------------------ b) « Ne dis pas »

const Triste: React.FC<{taille: number}> = ({taille}) => (
  <svg width={taille} height={taille} viewBox="0 0 40 40" style={{flex: '0 0 auto'}}>
    <circle cx={20} cy={20} r={18} fill="#8a90a8" />
    <circle cx={14} cy={16} r={2.6} fill="#20243d" />
    <circle cx={26} cy={16} r={2.6} fill="#20243d" />
    <path d="M12 29 Q20 22 28 29" stroke="#20243d" strokeWidth={2.6} fill="none" strokeLinecap="round" />
  </svg>
);

export const TamponX: React.FC<{t: number; a: number; taille: number}> = ({t, a, taille}) => {
  if (t < a - 0.02) return null;
  const s = interpolate(t, [a - 0.02, a + 0.1, a + 0.2], [2.8, 0.9, 1], clamp);
  return (
    <svg width={taille} height={taille} viewBox="-100 -100 200 200" style={{transform: `scale(${s}) rotate(-12deg)`, opacity: prog(t, a - 0.02, a + 0.05), filter: 'drop-shadow(0 14px 20px #000a)'}}>
      <circle r={88} fill="none" stroke={ROUGE} strokeWidth={12} strokeDasharray="30 8" opacity={0.85} />
      <path d="M-50 -50 L50 50 M50 -50 L-50 50" stroke={ROUGE} strokeWidth={30} strokeLinecap="round" />
    </svg>
  );
};

export const PlanMauvais: React.FC<{i: number; ta: TempsAstuce; t: number; debut: number}> = ({i, ta, t, debut}) => {
  const c = CARTES[i];
  const cam = secousse(t, [ta.tampon], 30);
  const texte = insecable(c.mauvais);
  const n = Math.ceil(interpolate(t, ta.tape, [0, texte.length], clamp));
  const flash = interpolate(t - ta.reponse, [0, 0.05, 0.3], [0, 0.55, 0], clamp);
  const reponse = interpolate(t, [ta.reponse, ta.reponse + 0.22], [1, 0], {...clamp, easing: Easing.out(Easing.back(1.5))});
  return (
    <FondAstuce n={c.n} t={t} ton="rouge">
      <div style={{position: 'absolute', inset: 0, transform: cam.transform}}>
        <Pastille texte="NE DIS PAS" couleur={ROUGE} t={t} a={debut + 0.05} />
        {/* la mauvaise demande se tape dans une bulle */}
        <div style={{position: 'absolute', left: ZONE.x, width: ZONE.l, top: 480}}>
          <div style={{color: '#ffd5da', fontSize: 44, fontWeight: 700, textAlign: 'right', marginRight: 10, opacity: prog(t, debut + 0.1, debut + 0.3)}}>Message à ChatGPT</div>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 8}}>
            <div style={{position: 'relative', maxWidth: 820, padding: '22px 36px', borderRadius: '44px 44px 10px 44px', background: '#ffffff', color: N, fontSize: 74, fontWeight: 800, lineHeight: 1.15, boxShadow: '0 16px 40px #0009', transform: `scale(${pop(t, debut + 0.15, 0.3)})`, transformOrigin: '100% 100%'}}>
              <span>{texte.slice(0, n)}</span>
              <span style={{opacity: 0}}>{texte.slice(n)}</span>
              {t < ta.tape[1] + 0.2 ? <span style={{position: 'absolute', marginLeft: 2, color: COULEURS.violetFonce, opacity: Math.floor(t * 5) % 2 ? 1 : 0.2}}>|</span> : null}
              <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
                <TamponX t={t} a={ta.tampon} taille={400} />
              </div>
            </div>
          </div>
          {/* réponse grise et vague */}
          {t >= ta.reponse ? (
            <div style={{display: 'flex', gap: 18, alignItems: 'flex-start', marginTop: 34, transform: `translateY(${reponse * 160}px) scale(${1 - reponse * 0.3})`, opacity: 1 - reponse, transformOrigin: '0 100%'}}>
              <div style={{transform: `rotate(${Math.sin(t * 5) * 8}deg) translateY(${Math.sin(t * 3) * 6}px)`}}><Triste taille={150} /></div>
              <div style={{flex: 1, padding: '20px 30px', borderRadius: '10px 44px 44px 44px', background: '#3a3f55', boxShadow: '0 16px 40px #0009'}}>
                <div style={{color: '#c3c8dc', fontSize: 58, fontWeight: 800}}>Mauvais résultat</div>
                <div style={{filter: 'blur(3px)', marginTop: 10}}>
                  {[500, 420, 470, 360].map((l, k) => <div key={k} style={{height: 28, width: l, borderRadius: 14, background: '#8a90a8', marginTop: k ? 16 : 0}} />)}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: ROUGE, opacity: flash, mixBlendMode: 'screen'}} />
    </FondAstuce>
  );
};

// ------------------------------------------------------------------ c) « Dis plutôt » (sur le personnage)

export const VoletDisPlutot: React.FC<{t: number; debut: number}> = ({t, debut}) => {
  const d = t - debut;
  const x = interpolate(d, [0, 0.32], [-1500, 1500], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const rouge = 1 - prog(d, 0, 0.2);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: ROUGE, opacity: 0.55 * rouge}} />
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 40%, transparent 50%, ${VERT}55 100%)`, opacity: prog(d, 0.1, 0.3)}} />
      <div style={{position: 'absolute', left: x, top: -300, width: 900, height: 2600, transform: 'rotate(18deg)', background: `linear-gradient(90deg, transparent, ${VERT} 30%, #b9ffd6 50%, ${VERT} 70%, transparent)`, opacity: 0.95}} />
      <Pastille texte="DIS PLUTÔT" couleur={VERT} t={t} a={debut + 0.12} taille={64} top={350} />
    </>
  );
};

// ------------------------------------------------------------------ d) et e) la bonne phrase et le résultat

const CarteExemple: React.FC<{texte: string; taille: number}> = ({texte, taille}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '6px 20px', borderRadius: 16, background: B, color: N, fontSize: taille, fontWeight: 800, boxShadow: '0 10px 24px #0008', whiteSpace: 'nowrap'}}>
    <svg width={taille} height={taille} viewBox="0 0 40 40">
      <rect x={8} y={6} width={24} height={30} rx={4} fill="#fff" stroke={N} strokeWidth={2.5} />
      <rect x={14} y={3} width={12} height={7} rx={2} fill={O} stroke={N} strokeWidth={2} />
      <path d="M13 18 H27 M13 23 H27 M13 28 H22" stroke="#9aa3c0" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
    {texte}
  </div>
);

// Pièce « crochet » en grand : cadre jaune qui palpite, étiquette qui claque,
// carte d'exemple qui vole jusque dans le cadre.
const CrochetGrand: React.FC<{p: Piece; t: number}> = ({p, t}) => {
  const d = t - p.debut;
  const etiquette = interpolate(d, [0, 0.12, 0.22], [2.4, 0.92, 1], clamp);
  const vol = interpolate(d, [0.35, 0.7], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const palpite = 1 + 0.05 * Math.sin(t * 10);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
      <div style={{padding: '6px 26px', borderRadius: 16, background: O, color: N, fontSize: 54, fontWeight: 800, transform: `scale(${etiquette}) rotate(-3deg)`, opacity: prog(d, 0, 0.05), boxShadow: '0 10px 30px #000a', whiteSpace: 'nowrap'}}>
        {p.crochet!.etiquette} ↓
      </div>
      <div style={{display: 'flex', alignItems: 'flex-end'}}>
        <div style={{position: 'relative', padding: '14px 34px 20px', borderRadius: 26, border: `8px solid ${O}`, background: `${O}2e`, boxShadow: `0 0 ${30 + 20 * Math.sin(t * 10)}px ${O}`, transform: `scale(${palpite})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
          <div style={{color: O, fontSize: 96, fontWeight: 800, lineHeight: 1.1, whiteSpace: 'nowrap', textShadow: '0 4px 14px #000a'}}>{p.texte}</div>
          <div style={{transform: `translate(${vol * 760}px, ${-vol * 220}px) rotate(${vol * 28}deg)`, opacity: d > 0.35 ? 1 : 0}}>
            <CarteExemple texte={p.crochet!.exemple} taille={54} />
          </div>
        </div>
        {p.suffixe ? <div style={{color: VERT, fontSize: 96, fontWeight: 800, marginLeft: 10}}>{p.suffixe}</div> : null}
      </div>
    </div>
  );
};

// Pièce ordinaire en grand, mot prononcé surligné.
const PieceGrande: React.FC<{p: Piece; t: number}> = ({p, t}) => {
  const texte = insecable(p.texte + p.suffixe).split(' ');
  const actif = p.mots.findIndex((m, k) => t >= m.debut && t < (p.mots[k + 1]?.debut ?? p.fin));
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 20, rowGap: 6, fontSize: 84, fontWeight: 800, lineHeight: 1.18, textAlign: 'center'}}>
      {texte.map((m, k) => (
        <span key={k} style={{padding: '0 8px', borderRadius: 14, color: k === actif ? B : t >= p.mots[k]?.debut ? '#c8ffdf' : '#c8ffdf99', background: k === actif ? COULEURS.violetFonce : 'transparent', transform: `scale(${k === actif ? 1.06 : 1})`, textShadow: k === actif ? 'none' : '0 4px 16px #000c'}}>
          {m}
        </span>
      ))}
    </div>
  );
};

// La phrase entière en petit (≥ 44 px), quand la carte se réduit vers le haut.
const PhraseCompacte: React.FC<{pieces: Piece[]; t: number}> = ({pieces, t}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', columnGap: 9, rowGap: 4, alignItems: 'center', fontSize: 34, fontWeight: 800, lineHeight: 1.22, color: '#c8ffdf'}}>
    {pieces.flatMap((p, k) => {
      if (p.crochet)
        return [
          <span key={k} style={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
            <span style={{padding: '0 10px', borderRadius: 10, border: `3px solid ${O}`, background: `${O}26`, color: O}}>{p.texte}</span>
            {p.suffixe}
          </span>,
        ];
      const mots = insecable(p.texte + p.suffixe).split(' ');
      const actif = t < p.fin ? p.mots.findIndex((m, j) => t >= m.debut && t < (p.mots[j + 1]?.debut ?? p.fin)) : -1;
      return mots.map((m, j) => (
        <span key={`${k}-${j}`} style={{padding: '0 4px', borderRadius: 8, background: j === actif ? COULEURS.violetFonce : 'transparent', color: j === actif ? B : '#c8ffdf'}}>
          {m}
        </span>
      ));
    })}
  </div>
);

export const PlanBon: React.FC<{i: number; ta: TempsAstuce; t: number; debut: number}> = ({i, ta, t, debut}) => {
  const c = CARTES[i];
  const pieces = PIECES[i];
  const k = pieces.filter((p) => t >= p.debut).length - 1;
  const p = k >= 0 ? pieces[k] : null;
  const crochet = pieces.find((q) => q.crochet && t >= q.debut && t < q.debut + 0.9);
  const cam = secousse(t, crochet ? [crochet.debut] : [], 14, 0.3);
  const reduit = prog(t, ta.resultat - 0.05, ta.resultat + 0.3, Easing.inOut(Easing.cubic));
  const entree = p ? interpolate(t, [p.debut, p.debut + 0.22], [1, 0], {...clamp, easing: Easing.out(Easing.back(1.4))}) : 0;
  const zoom = p ? 1 + 0.07 * prog(t, p.debut, p.fin, Easing.linear) : 1;
  const prec = k > 0 ? pieces[k - 1] : null;
  const precTexte = prec ? (prec.crochet ? `${prec.texte}${prec.suffixe}` : insecable(prec.texte + prec.suffixe)) : '';
  return (
    <FondAstuce n={c.n} t={t} ton="vert">
      <div style={{position: 'absolute', inset: 0, transform: cam.transform}}>
        <div style={{opacity: 1 - reduit}}>
          <Pastille texte="DIS PLUTÔT" couleur={VERT} t={t} a={debut - 0.3} taille={48} top={335} />
        </div>
        {/* karaoké : un morceau en grand, le précédent atténué au-dessus */}
        {p && reduit < 1 ? (
          <div style={{position: 'absolute', left: ZONE.x, width: ZONE.l, top: 440, height: 640, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 34, opacity: 1 - reduit, transform: `translateY(${-reduit * 300}px) scale(${1 - reduit * 0.45})`, transformOrigin: '50% 0'}}>
            {prec && precTexte.length <= 48 ? <div style={{fontSize: 46, fontWeight: 800, color: '#c8ffdf', opacity: 0.38, textAlign: 'center', lineHeight: 1.15}}>{precTexte}</div> : null}
            <div style={{transform: `translateY(${entree * 140}px) scale(${(1 + entree * 0.25) * zoom})`, opacity: 1 - entree * 0.8}}>
              {p.crochet ? <CrochetGrand p={p} t={t} /> : <PieceGrande p={p} t={t} />}
            </div>
          </div>
        ) : null}
        {/* résultat : la carte réduite en haut, l'illustration dessous */}
        {reduit > 0 ? (
          <>
            <div style={{position: 'absolute', left: ZONE.x, width: ZONE.l, top: 330, padding: '14px 22px', borderRadius: 26, background: '#0b2a20e6', border: `4px solid ${VERT}`, boxShadow: '0 16px 40px #0009', transform: `translateY(${(1 - reduit) * 200}px) scale(${1.15 - reduit * 0.15})`, transformOrigin: '50% 0', opacity: reduit}}>
              <PhraseCompacte pieces={pieces} t={t} />
            </div>
            <div style={{position: 'absolute', left: RESULTAT.x, width: RESULTAT.l, top: RESULTAT.y, height: RESULTAT.h, transform: `scale(${pop(t, ta.resultat + 0.1, 0.35)})`}}>
              <Resultat n={c.n} t={t} a={ta.resultat + 0.15} />
            </div>
            <PluieEtoiles t={t} a={ta.resultat + 0.2} zone={RESULTAT} />
          </>
        ) : null}
      </div>
    </FondAstuce>
  );
};
