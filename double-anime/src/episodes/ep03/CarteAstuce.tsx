import {Easing, interpolate} from 'remotion';
import {pop, prog} from '../../commun/temps';
import {COULEURS, POLICE} from '../../theme';
import {Carte, TempsCarte} from './scenario';

// Carte d'astuce, plein écran, en forme de fenêtre de discussion générique.
// Elle bouge en continu (flottement, zoom doux, saisie, mot surligné, cadres
// jaunes qui pulsent) : elle peut rester plus de 2 s sans paraître figée.
// Zone sûre : x 50–930, y 320–1280 (la barre des astuces est au-dessus, les
// sous-titres en dessous ; pas de médaillon sur les cartes). Tout le texte
// fait au moins 44 px.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ROUGE = '#ff6b6b';
const VERT = '#3ddc84';
const N = COULEURS.nuit;
const O = COULEURS.or;

export const ZONE_CARTE = {x: 50, y: 320, l: 880, h: 960};

// ------------------------------------------------------------------ icônes des thèmes

export const IconeTheme: React.FC<{kind: Carte['icone']; taille: number; t: number}> = ({kind, taille, t}) => {
  const b = Math.sin(t * 5);
  const c = N;
  const formes: Record<Carte['icone'], React.ReactNode> = {
    plume: (
      <g transform={`rotate(${b * 6} 50 50)`}>
        <path d="M78 10 Q40 20 26 70 L22 86 L32 76 Q74 62 78 10 Z" fill={c} />
        <path d="M26 70 L60 30" stroke={O} strokeWidth={4} />
      </g>
    ),
    calendrier: (
      <g>
        <rect x={12} y={18} width={76} height={70} rx={10} fill={c} />
        <rect x={12} y={18} width={76} height={18} rx={8} fill={COULEURS.violetFonce} />
        {[0, 1, 2].map((r) => [0, 1, 2, 3].map((k) => <rect key={`${r}${k}`} x={20 + k * 17} y={42 + r * 14} width={11} height={9} rx={2} fill={O} opacity={(r * 4 + k + Math.floor(t * 3)) % 5 ? 0.5 : 1} />))}
      </g>
    ),
    cv: (
      <g>
        <rect x={20} y={8} width={60} height={84} rx={8} fill={c} />
        <circle cx={38} cy={30} r={9} fill={O} />
        <rect x={52} y={24} width={20} height={6} rx={3} fill={O} />
        <rect x={52} y={34} width={16} height={5} rx={2} fill="#9aa3c0" />
        {[0, 1, 2, 3].map((k) => <rect key={k} x={30} y={50 + k * 9} width={40 - (k % 2) * 12} height={5} rx={2} fill="#9aa3c0" />)}
      </g>
    ),
    livre: (
      <g>
        <path d={`M50 24 Q30 ${14 + b * 3} 10 20 V82 Q30 76 50 86 Z`} fill={c} />
        <path d={`M50 24 Q70 ${14 - b * 3} 90 20 V82 Q70 76 50 86 Z`} fill={COULEURS.violetFonce} />
        <path d="M50 24 V86" stroke={O} strokeWidth={3} />
      </g>
    ),
    megaphone: (
      <g>
        <path d="M14 40 H34 L72 18 V82 L34 60 H14 Z" fill={c} />
        <path d="M30 60 L38 86 H48 L42 60" fill={c} />
        {[0, 1].map((k) => <path key={k} d={`M${80 + k * 8} ${36 - k * 6} Q${88 + k * 8} 50 ${80 + k * 8} ${64 + k * 6}`} stroke={COULEURS.violetFonce} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 6 + k))} />)}
      </g>
    ),
    enveloppe: (
      <g transform={`translate(0 ${b * 3})`}>
        <rect x={10} y={24} width={80} height={56} rx={8} fill={c} />
        <path d="M12 28 L50 58 L88 28" stroke={O} strokeWidth={6} fill="none" strokeLinejoin="round" />
      </g>
    ),
    ampoule: (
      <g>
        <circle cx={50} cy={40} r={26} fill={c} />
        <rect x={38} y={64} width={24} height={18} rx={4} fill={c} />
        <path d="M42 86 H58" stroke={c} strokeWidth={6} strokeLinecap="round" />
        {Array.from({length: 6}, (_, k) => {
          const a = (k / 6) * Math.PI * 2 + t;
          return <path key={k} d={`M${50 + Math.cos(a) * 34} ${40 + Math.sin(a) * 34} L${50 + Math.cos(a) * 44} ${40 + Math.sin(a) * 44}`} stroke={COULEURS.violetFonce} strokeWidth={5} strokeLinecap="round" />;
        })}
        <path d="M42 40 Q50 30 58 40" stroke={O} strokeWidth={4} fill="none" />
      </g>
    ),
  };
  return (
    <svg width={taille} height={taille} viewBox="0 0 100 100">
      {formes[kind]}
    </svg>
  );
};

const Triste: React.FC<{taille: number}> = ({taille}) => (
  <svg width={taille} height={taille} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={18} fill="#6b7088" />
    <circle cx={14} cy={16} r={2.6} fill="#20243d" />
    <circle cx={26} cy={16} r={2.6} fill="#20243d" />
    <path d="M12 29 Q20 22 28 29" stroke="#20243d" strokeWidth={2.6} fill="none" strokeLinecap="round" />
  </svg>
);

const Pastille: React.FC<{ok: boolean; taille: number; s?: number}> = ({ok, taille, s = 1}) => (
  <svg width={taille} height={taille} viewBox="-50 -50 100 100" style={{flex: '0 0 auto', transform: `scale(${s})`}}>
    <circle r={46} fill={ok ? VERT : ROUGE} />
    {ok ? <path d="M-22 2 L-6 18 L24 -16" stroke="#fff" strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M-18 -18 L18 18 M18 -18 L-18 18" stroke="#fff" strokeWidth={13} strokeLinecap="round" />}
  </svg>
);

const Presse: React.FC<{taille: number}> = ({taille}) => (
  <svg width={taille} height={taille} viewBox="0 0 40 40">
    <rect x={8} y={6} width={24} height={30} rx={4} fill="#fff" stroke={N} strokeWidth={2.5} />
    <rect x={14} y={3} width={12} height={7} rx={2} fill={O} stroke={N} strokeWidth={2} />
    <path d="M13 18 H27 M13 23 H27 M13 28 H22" stroke="#9aa3c0" strokeWidth={2.5} strokeLinecap="round" />
  </svg>
);

// ------------------------------------------------------------------ bonne phrase

type Jeton = {texte: string; debut: number; fin: number; crochet?: {etiquette: string; exemple: string}; colle: boolean};

// Découpe la bonne phrase en mots, chacun avec son instant d'apparition :
// les morceaux s'écrivent lettre par lettre entre leur instant et le suivant.
// espaces insécables : « et » ne restent jamais seuls en bout de ligne
export const insecable = (x: string) => x.replace(/« /g, '«\u00a0').replace(/ ([»?:!])/g, '\u00a0$1');

const jetons = (c: Carte, tc: TempsCarte): Jeton[] => {
  const res: Jeton[] = [];
  let precedent = -Infinity;
  c.bon.forEach((m, i) => {
    let a = tc.morceaux[i];
    if (a <= precedent) a = precedent + 0.25; // même mot de la voix que le morceau précédent
    precedent = a;
    const b = i + 1 < c.bon.length ? Math.max(a + 0.2, tc.morceaux[i + 1]) : Math.max(a + 0.3, tc.dernierMot + 0.25);
    if (m.crochet) {
      res.push({texte: m.texte, debut: a, fin: a + 0.15, crochet: m.crochet, colle: false});
      return;
    }
    const texte = insecable(m.texte);
    const mots = texte.split(' ');
    const total = texte.length;
    let cumul = 0;
    mots.forEach((mot, k) => {
      const d = a + ((b - a) * cumul) / total;
      cumul += mot.length + 1;
      const f = a + ((b - a) * Math.min(total, cumul)) / total;
      // la ponctuation qui commence un morceau (« , cet emploi », « . Rédige ») se colle au mot précédent
      res.push({texte: mot, debut: d, fin: f, colle: k === 0 && /^[,.]/.test(mot)});
    });
  });
  return res;
};

const Crochet: React.FC<{j: Jeton; t: number}> = ({j, t}) => {
  const local = t - j.debut;
  const etiquette = prog(t, j.debut, j.debut + 0.2);
  const glisse = interpolate(local, [0.25, 0.75], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const exemple = prog(t, j.debut + 0.7, j.debut + 0.95);
  // l'étiquette apparaît, pulse, puis reste affichée (plus discrète) : la place
  // au-dessus du cadre est réservée pour que la mise en page ne saute pas
  // exemple à côté du crochet s'il tient sur la ligne, sinon dessous (dans le cadre)
  const enLigne = j.texte.length + j.crochet!.exemple.length <= 23;
  const pulse = 1 + 0.06 * Math.sin(t * 9) * (1 - prog(t, j.debut + 1.6, j.debut + 2));
  return (
    <span style={{position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', verticalAlign: 'top', paddingTop: 70}}>
      <span style={{display: 'inline-flex', flexDirection: enLigne ? 'row' : 'column', alignItems: enLigne ? 'center' : 'flex-start', gap: enLigne ? 14 : 0, padding: enLigne ? '0 14px' : '0 14px 6px', borderRadius: 14, border: `4px solid ${O}`, background: `${O}26`, boxShadow: `0 0 ${14 + 10 * Math.sin(t * 7)}px ${O}aa`, transform: `scale(${pop(t, j.debut, 0.3) * (1 + 0.04 * Math.sin(t * 7))})`, transformOrigin: '0 50%'}}>
        <span style={{color: O, fontWeight: 800, whiteSpace: 'nowrap'}}>{j.texte}</span>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 44, fontWeight: 700, color: COULEURS.blanc, opacity: exemple, whiteSpace: 'nowrap'}}>
          <Presse taille={44} />
          {j.crochet!.exemple}
        </span>
      </span>
      {/* le presse-papiers glisse dans le cadre */}
      {local > 0.2 && local < 0.9 ? (
        <span style={{position: 'absolute', left: 40, top: 70, transform: `translate(${glisse * 420}px, ${-glisse * 60}px) rotate(${glisse * 25}deg)`, opacity: 1 - prog(t, j.debut + 0.75, j.debut + 0.9)}}>
          <Presse taille={64} />
        </span>
      ) : null}
      {/* étiquette au-dessus */}
      {etiquette > 0 ? (
        <span style={{position: 'absolute', top: 0, left: 0, transform: `scale(${(0.6 + 0.4 * etiquette) * pulse})`, transformOrigin: '0 100%', opacity: Math.max(etiquette, 0), whiteSpace: 'nowrap', padding: '0 14px', borderRadius: 12, background: O, color: N, fontSize: 44, lineHeight: '60px', fontWeight: 800, boxShadow: '0 6px 16px #000a', zIndex: 2}}>
          {j.crochet!.etiquette} ↓
        </span>
      ) : null}
    </span>
  );
};

// ------------------------------------------------------------------ carte

export const CarteAstuce: React.FC<{c: Carte; tc: TempsCarte; t: number; debut: number}> = ({c, tc, t, debut}) => {
  const local = t - debut;
  const entree = interpolate(local, [0, 0.3], [1, 0], {...clamp, easing: Easing.out(Easing.back(1.3))});
  const flotte = Math.sin(t * 1.8) * 6;
  const zoom = 1 + 0.02 * Math.sin(t * 0.9);
  const js = jetons(c, tc);
  const courant = js.findIndex((j, k) => t >= j.debut && t < (js[k + 1]?.debut ?? tc.dernierMot + 0.6));
  const barre = prog(t, tc.mauvaisFin, tc.mauvaisFin + 0.3, Easing.out(Easing.quad));
  const mauvaisResultat = prog(t, tc.mauvaisFin + 0.25, tc.mauvaisFin + 0.5);
  const resultat = tc.dernierMot + 0.15;
  // carte trop haute : le contenu remonte sous l'en-tête à la fin de la bonne phrase
  // (au plus tôt au dernier crochet), quand la place manque pour le résultat
  const dernierCrochet = c.bon.map((m) => !!m.crochet).lastIndexOf(true);
  const instantDefile = Math.max(tc.morceaux[dernierCrochet], tc.dernierMot - 0.8);
  const defile = (c.defile ?? 0) * prog(t, instantDefile - 0.5, instantDefile, Easing.inOut(Easing.cubic));
  return (
    <div
      style={{
        position: 'absolute',
        left: ZONE_CARTE.x,
        top: ZONE_CARTE.y,
        width: ZONE_CARTE.l,
        height: ZONE_CARTE.h,
        borderRadius: 40,
        background: 'linear-gradient(160deg, #18205a 0%, #0c1238 80%)',
        border: `4px solid ${COULEURS.violet}`,
        boxShadow: `0 30px 80px #000c, 0 0 60px ${COULEURS.violet}44`,
        transform: `translate(${entree * 900}px, ${flotte}px) rotate(${entree * 6}deg) scale(${zoom})`,
        fontFamily: POLICE,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* en-tête : numéro, titre, icône du thème */}
      <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '18px 24px', background: '#ffffff10', borderBottom: '2px solid #ffffff1c'}}>
        <div style={{flex: '0 0 auto', width: 78, height: 78, borderRadius: 39, display: 'grid', placeItems: 'center', background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, color: N, fontSize: 50, fontWeight: 800, transform: `scale(${pop(local, 0.05, 0.35)})`}}>{c.n}</div>
        <div style={{flex: 1, color: COULEURS.blanc, fontSize: 44, fontWeight: 800, lineHeight: 1.08}}>{c.titre}</div>
        <div style={{flex: '0 0 auto', width: 84, height: 84, borderRadius: 22, background: O, display: 'grid', placeItems: 'center', transform: `rotate(${Math.sin(t * 3) * 5}deg) scale(${pop(local, 0.15, 0.35)})`}}>
          <IconeTheme kind={c.icone} taille={64} t={t} />
        </div>
      </div>
      <div style={{flex: 1, overflow: 'hidden', position: 'relative'}}>
      <div style={{padding: '18px 30px', display: 'flex', flexDirection: 'column', gap: 16, transform: `translateY(${-defile}px)`}}>
        {/* mauvaise demande */}
        {t >= tc.mauvais - 0.1 ? (
          <div style={{display: 'flex', gap: 18, alignItems: 'flex-start', transform: `scale(${pop(t, tc.mauvais - 0.1, 0.3)})`, transformOrigin: '0 50%', opacity: (c.defile ?? 0) > 100 ? 1 - prog(defile, 0, 100) : 1}}>
            <Pastille ok={false} taille={58} />
            <div style={{flex: 1}}>
              {c.mauvaisPrefixe ? <div style={{color: ROUGE, fontSize: 44, fontWeight: 700, lineHeight: 1.2}}>{insecable(c.mauvaisPrefixe)}</div> : null}
              <div style={{display: 'flex', flexWrap: 'wrap', columnGap: 12, color: ROUGE, fontSize: 46, fontWeight: 800, lineHeight: 1.2}}>
                {/* barré mot par mot : la barre suit le texte même sur deux lignes */}
                {insecable(c.mauvais).split(' ').map((mot, k, tous) => (
                  <span key={k} style={{position: 'relative', display: 'inline-block'}}>
                    {mot}
                    <span style={{position: 'absolute', left: -8, right: -8, top: '52%', height: 7, borderRadius: 4, background: ROUGE, transformOrigin: '0 50%', transform: `scaleX(${interpolate(barre, [k / tous.length, (k + 1) / tous.length], [0, 1], clamp)}) rotate(-2deg)`}} />
                  </span>
                ))}
              </div>
              {mauvaisResultat > 0 ? (
                <div style={{marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, opacity: mauvaisResultat}}>
                  <Triste taille={52} />
                  <div style={{padding: '4px 18px', borderRadius: 12, background: '#ffffff14', color: '#8a90a8', fontSize: 44, fontWeight: 700, filter: 'blur(0.8px)'}}>
                    Mauvais résultat
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        {/* bonne demande */}
        {t >= tc.bon ? (
          <div style={{display: 'flex', gap: 18, alignItems: 'flex-start', transform: `scale(${pop(t, tc.bon, 0.3)})`, transformOrigin: '0 50%'}}>
            <Pastille ok taille={58} />
            <div style={{flex: 1, color: VERT, fontSize: 44, fontWeight: 700, lineHeight: 1.3}}>
              {c.bonPrefixe ? <div style={{fontSize: 44, fontWeight: 700}}>{insecable(c.bonPrefixe)}</div> : null}
              <div style={{display: 'flex', flexWrap: 'wrap', columnGap: 12, rowGap: 6, alignItems: 'flex-end'}}>
                {js.map((j, k) => {
                  if (t < j.debut) return null;
                  const mot = (jj: Jeton, kk: number) => {
                    if (t < jj.debut) return null;
                    const n = Math.max(1, Math.ceil(interpolate(t, [jj.debut, jj.fin], [0, jj.texte.length], clamp)));
                    const actif = kk === courant;
                    return (
                      <span key={kk} style={{marginLeft: jj.colle ? -12 : 0, padding: '0 4px', borderRadius: 8, background: actif ? COULEURS.violetFonce : 'transparent', color: actif ? COULEURS.blanc : VERT}}>
                        {jj.texte.slice(0, n)}
                      </span>
                    );
                  };
                  if (j.colle && js[k - 1]?.crochet) return null; // affiché avec son crochet
                  // un crochet commence une ligne : son étiquette a toute la largeur au-dessus ;
                  // la ponctuation qui le suit reste sur sa ligne
                  if (j.crochet) {
                    const suite = js[k + 1]?.colle ? mot(js[k + 1], k + 1) : null;
                    return [
                      <span key={`r${k}`} style={{flexBasis: '100%', height: 0}} />,
                      <span key={k} style={{display: 'inline-flex', alignItems: 'flex-end', whiteSpace: 'nowrap'}}>
                        <Crochet j={j} t={t} />
                        {suite}
                      </span>,
                    ];
                  }
                  return mot(j, k);
                })}
              </div>
            </div>
          </div>
        ) : null}
        {/* résultat */}
        {t >= resultat ? (
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', borderRadius: 20, background: `${VERT}22`, border: `3px solid ${VERT}`, transform: `scale(${pop(t, resultat, 0.35)})`, transformOrigin: '0 50%', boxShadow: `0 0 ${24 + 12 * Math.sin(t * 6)}px ${VERT}66`}}>
            <Pastille ok taille={50} />
            <div style={{color: COULEURS.blanc, fontSize: 44, fontWeight: 800}}>Résultat : précis et utile</div>
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
};

export const instantResultat = (tc: TempsCarte) => tc.dernierMot + 0.15;
