import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {POLICE} from '../charte';
import {usePolicesChargees} from '../Montage';
import {Badge, CENTRE, FondNuit, FPS, LARGEUR_UTILE, Ligne, NUIT, OR, pop, prog, ROUGE, VERT, VIOLET, Z,
  couper, texteContour} from './commun';
import {Tuile} from './Pictos';

// Scènes illustrées plein écran de la formation (1080 × 1920, contenu dans la zone sûre).
// `duree` en secondes ; `etapes` : secondes des moments clés (à caler sur la voix off en phase 2).
// Sans `etapes`, les moments clés sont répartis sur la durée (fractions `defaut`).
export type PropsScene = {duree?: number; etapes?: number[]};

const useEtapes = (etapes: number[] | undefined, defaut: number[]) => {
  const {durationInFrames: d} = useVideoConfig();
  return defaut.map((fr, i) => Math.round(etapes?.[i] !== undefined ? etapes[i] * FPS : fr * d));
};

const avecPolice = <P extends object>(C: React.FC<P>): React.FC<P> => (p) => (usePolicesChargees() ? <C {...p} /> : null);

const Titre: React.FC<{texte: string; t: number; couleur?: string}> = ({texte, t, couleur = OR}) => {
  const lignes = couper(texte, 66, LARGEUR_UTILE - 30, 900);
  return (
    <>
      {lignes.map((l, i) => (
        <Ligne key={l} texte={l} y={215 + i * 80} taille={66} couleur={couleur} contour={8} k={pop(t, i * 3)} />
      ))}
    </>
  );
};

const Marque: React.FC<{type: 'croix' | 'coche'; k: number; taille: number; style?: React.CSSProperties}> = (
  {type, k, taille, style}) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100" style={{transform: `scale(${Math.min(1.25, k)}) rotate(${(1 - Math.min(1, k)) * -30}deg)`,
    opacity: k > 0 ? 1 : 0, flexShrink: 0, ...style}}>
    <circle cx="50" cy="50" r="48" fill="#fff" />
    <circle cx="50" cy="50" r="42" fill={type === 'croix' ? '#D92626' : '#16A34A'} />
    {type === 'croix'
      ? <path d="M33 33 L67 67 M67 33 L33 67" stroke="#fff" strokeWidth="11" strokeLinecap="round" />
      : <path d="M28 52 L44 67 L73 35" fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />}
  </svg>
);

// 1. L'employé qui arrive dans l'entreprise : « Que voulez-vous que je fasse ? »
const EmployeCorps: React.FC<PropsScene> = ({etapes}) => {
  const t = useCurrentFrame();
  const [e0, e1, e2] = useEtapes(etapes, [0.3, 0.55, 0.75]);
  const marche = prog(t, 6, 40, Easing.out(Easing.quad));
  const x = interpolate(marche, [0, 1], [-200, 380]);
  const pas = marche < 1 ? Math.sin(t / 3) * 8 : 0;
  const kb = pop(t, e0);
  return (
    <AbsoluteFill>
      <FondNuit teinte="violet" />
      <Titre texte="L'IA, C'EST UN NOUVEL EMPLOYÉ" t={t} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {/* Bureau de l'entreprise : mur, fenêtres, porte. */}
        <rect x={60} y={560} width={880} height={720} rx={30} fill="#1C1A52" stroke="#3B3690" strokeWidth={6} />
        {[0, 1, 2].map((i) => <rect key={i} x={110 + i * 150} y={620} width={110} height={160} rx={12} fill="#2C5BD6" opacity={0.55} />)}
        <rect x={640} y={860} width={220} height={420} rx={14} fill="#7A4A28" />
        <circle cx={830} cy={1080} r={12} fill={OR} />
        <text x={740} y={720} textAnchor="middle" fontFamily={POLICE} fontWeight={900} fontSize={42} fill="#fff">VOTRE</text>
        <text x={740} y={770} textAnchor="middle" fontFamily={POLICE} fontWeight={900} fontSize={42} fill="#fff">ENTREPRISE</text>
        <rect x={60} y={1270} width={880} height={18} fill="#3B3690" />
        {/* L'employé : costume, mallette. */}
        <g transform={`translate(${x} ${1270 + pas * 0.3})`}>
          <rect x={-55} y={-300} width={110} height={190} rx={40} fill="#1F3B8F" />
          <path d="M-18 -300 L0 -250 L18 -300 Z" fill="#fff" />
          <rect x={-45} y={-115} width={36} height={115} rx={14} fill="#16234F" transform={`rotate(${pas} -27 -115)`} />
          <rect x={9} y={-115} width={36} height={115} rx={14} fill="#16234F" transform={`rotate(${-pas} 27 -115)`} />
          <circle cx={0} cy={-345} r={52} fill="#8A5A3C" />
          <path d="M-52 -355 C-48 -405 48 -405 52 -355 C38 -380 -38 -380 -52 -355 Z" fill="#1E1410" />
          <circle cx={-18} cy={-345} r={6} fill="#1E1410" /><circle cx={18} cy={-345} r={6} fill="#1E1410" />
          <path d="M-16 -318 Q0 -306 16 -318" stroke="#1E1410" strokeWidth={5} fill="none" strokeLinecap="round" />
          <rect x={52} y={-170} width={70} height={52} rx={8} fill="#6B3A1E" stroke="#fff" strokeWidth={4} />
        </g>
        {/* Points d'interrogation autour de la tête. */}
        {[[-140, -400, -14], [-70, -470, 8], [100, -450, 16]].map(([dx, dy, r], i) => {
          const k = pop(t, e0 + 8 + i * 4);
          return <text key={i} x={x + dx} y={1270 + dy} fontFamily={POLICE} fontWeight={900} fontSize={90 - i * 10}
            fill="#fff" stroke="#000" strokeWidth={10} style={{paintOrder: 'stroke'}} opacity={k > 0 ? 1 : 0}
            transform={`rotate(${r + 6 * Math.sin((t + i * 9) / 8)} ${x + dx} ${1270 + dy}) scale(1)`}>?</text>;
        })}
      </svg>
      <div style={{position: 'absolute', left: Z.gauche + 40, width: LARGEUR_UTILE - 80, top: 400, transform: `scale(${kb})`,
        opacity: kb > 0 ? 1 : 0, background: '#fff', borderRadius: 40, padding: '26px 30px', textAlign: 'center',
        fontFamily: POLICE, fontWeight: 900, fontSize: 50, color: NUIT, boxShadow: '0 18px 50px rgba(0,0,0,0.45)'}}>
        « Que voulez-vous que je fasse ? »
      </div>
      <Ligne texte="Intelligent, rapide, compétent…" y={1330} taille={54} k={pop(t, e1)} contour={7} />
      <Ligne texte="mais il ne connaît pas votre entreprise" y={1420} taille={50} couleur={OR} k={pop(t, e2)} contour={7} />
    </AbsoluteFill>
  );
};
export const SceneEmploye = avecPolice(EmployeCorps);

// 2. Prompt vague → résultat moyen ; prompt précis → résultat professionnel.
const VagueCorps: React.FC<PropsScene> = ({etapes}) => {
  const t = useCurrentFrame();
  const [e0, e1, e2, e3] = useEtapes(etapes, [0.08, 0.3, 0.5, 0.72]);
  const colonne = (gauche: boolean, kCarte: number, kRes: number) => {
    const x = gauche ? Z.gauche : CENTRE + 10;
    const c = gauche ? ROUGE : VERT;
    return (
      <div style={{position: 'absolute', left: x, width: 440, top: 420, display: 'flex', flexDirection: 'column',
        alignItems: 'center'}}>
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 46, color: c, ...texteContour(6),
          transform: `scale(${kCarte})`, opacity: kCarte > 0 ? 1 : 0}}>{gauche ? 'PROMPT VAGUE' : 'PROMPT PRÉCIS'}</div>
        <div style={{marginTop: 16, width: 420, minHeight: 280, borderRadius: 26, background: 'rgba(14,18,44,0.92)',
          border: `4px solid ${c}`, padding: 22, fontFamily: POLICE, fontWeight: 800, fontSize: 30, color: '#fff',
          lineHeight: 1.3, transform: `scale(${kCarte})`, opacity: kCarte > 0 ? 1 : 0}}>
          {gauche ? '« Fais-moi une vidéo. »' : (
            <>
              {['Rôle : expert en publicité', 'Durée : 30 s maximum', 'Public visé', 'Date, prix, numéro', 'Ton et structure']
                .map((l, i) => <div key={l} style={{opacity: prog(t, e1 + i * 4, 6)}}>✓ {l}</div>)}
            </>
          )}
        </div>
        <svg width={80} height={110} viewBox="0 0 80 110" style={{margin: '10px 0', opacity: kRes > 0 ? 1 : 0}}>
          <path d="M40 6 V80 M16 60 L40 92 L64 60" stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round"
            strokeLinejoin="round" />
        </svg>
        <div style={{position: 'relative', width: 300, height: 400, borderRadius: 24, overflow: 'hidden',
          border: `6px solid ${c}`, transform: `scale(${kRes})`, opacity: kRes > 0 ? 1 : 0}}>
          <Img src={staticFile('formation-montage-partie1/image_nette.jpg')} style={{width: '100%', height: '100%',
            objectFit: 'cover', filter: gauche ? 'blur(14px) grayscale(0.9) brightness(0.7)' : 'none'}} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, opacity: kRes > 0 ? 1 : 0}}>
          <Marque type={gauche ? 'croix' : 'coche'} k={kRes} taille={70} />
          <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 38, color: '#fff', lineHeight: 1.05,
            whiteSpace: 'pre-line', ...texteContour(5)}}>{gauche ? 'RÉSULTAT\nMOYEN' : 'RÉSULTAT\nPRO'}</span>
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <FondNuit />
      <Titre texte="LA RÈGLE DU PROMPT" t={t} />
      <Ligne texte="Un prompt = l'instruction donnée à l'IA" y={310} taille={44} poids={800} k={pop(t, 4)} />
      {colonne(true, pop(t, e0), pop(t, e2))}
      {colonne(false, pop(t, e1), pop(t, e3))}
      <div style={{position: 'absolute', left: CENTRE - 2, top: 430, width: 4, height: 1000,
        background: 'linear-gradient(transparent, rgba(255,255,255,0.5), transparent)'}} />
    </AbsoluteFill>
  );
};
export const ScenePromptVague = avecPolice(VagueCorps);

// Grille de tuiles qui apparaissent une à une (2 colonnes).
const Grille: React.FC<{elements: [string, string, string, string?][]; departs: number[]; t: number; y: number;
  pasY: number; taille: number}> = ({elements, departs, t, y, pasY, taille}) => (
  <>
    {elements.map(([nom, couleur, texte, detail], i) => {
      const k = pop(t, departs[i]);
      const col = i % 2;
      const x = col === 0 ? Z.gauche + 225 : Z.gauche + 675;
      return (
        <div key={texte} style={{position: 'absolute', left: x - 215, width: 430, top: y + Math.floor(i / 2) * pasY,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          transform: `translateY(${5 * Math.sin((t + i * 13) / 15)}px)`}}>
          <Tuile nom={nom} taille={taille} couleur={couleur} k={k} />
          <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 44, color: '#fff', marginTop: 10,
            opacity: k > 0 ? 1 : 0, textAlign: 'center', lineHeight: 1.05, ...texteContour(6)}}>{texte}</div>
          {detail ? <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 30, color: OR, marginTop: 4,
            opacity: k > 0 ? 1 : 0, ...texteContour(4)}}>{detail}</div> : null}
        </div>
      );
    })}
  </>
);

// 3. Ce dont vous avez besoin : téléphone, internet, ChatGPT, Google Flow, Claude, Chrome.
const BesoinsCorps: React.FC<PropsScene> = ({etapes}) => {
  const t = useCurrentFrame();
  const departs = useEtapes(etapes, [0.06, 0.16, 0.27, 0.4, 0.55, 0.7]);
  return (
    <AbsoluteFill>
      <FondNuit teinte="vert" />
      <Titre texte="CE DONT VOUS AVEZ BESOIN" t={t} />
      <Grille t={t} departs={departs} y={360} pasY={385} taille={210} elements={[
        ['telephone', '#1F5BFF', 'Un téléphone'], ['internet', '#0E8F62', 'Internet'],
        ['discussion', '#10A37F', 'ChatGPT', 'compte gratuit'], ['clap', '#F0560F', 'Google Flow', 'compte Google'],
        ['montage', '#D97757', 'Claude', 'compte gratuit'], ['navigateur', '#7B2FF7', 'Chrome', 'pour claude.ai']]} />
    </AbsoluteFill>
  );
};
export const SceneBesoins = avecPolice(BesoinsCorps);

// 4. Une barre de 32 s découpée en 4 blocs de 8 s.
const BarreCorps: React.FC<PropsScene> = ({etapes}) => {
  const t = useCurrentFrame();
  const [e0, e1, e2] = useEtapes(etapes, [0.1, 0.35, 0.7]);
  const remplissage = prog(t, e0, 24, Easing.inOut(Easing.cubic));
  const ecart = prog(t, e1, 16, Easing.out(Easing.back(1.6)));
  const couleurs = ['#1F5BFF', '#7B2FF7', '#E0337E', '#F0560F'];
  const largeurBloc = (LARGEUR_UTILE - 3 * 26 * ecart) / 4;
  return (
    <AbsoluteFill>
      <FondNuit />
      <Titre texte="GOOGLE FLOW : 8 SECONDES MAXIMUM PAR CLIP" t={t} />
      <Ligne texte="VOTRE VIDÉO : 32 SECONDES" y={520} taille={58} k={pop(t, e0)} contour={7} />
      <div style={{position: 'absolute', left: Z.gauche, top: 640, width: LARGEUR_UTILE, height: 220}}>
        {couleurs.map((c, i) => {
          const visible = Math.max(0, Math.min(1, remplissage * 4 - i));
          return (
            <div key={c} style={{position: 'absolute', left: i * (largeurBloc + 26 * ecart), top: 0,
              width: largeurBloc * (ecart > 0 ? 1 : visible), height: 220, background: c,
              borderRadius: ecart > 0.05 ? 28 : i === 0 ? '28px 0 0 28px' : i === 3 ? '0 28px 28px 0' : 0,
              border: '5px solid #fff', boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              transform: `translateY(${ecart > 0 ? -20 * Math.sin(Math.min(1, ecart) * Math.PI) * (i % 2 ? 1 : -1) : 0}px)`}}>
              <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 64, color: '#fff', opacity: ecart}}>8 s</div>
              <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 30, color: '#fff', opacity: ecart}}>Scène {i + 1}</div>
            </div>
          );
        })}
      </div>
      {/* Graduation 0 – 32 s. */}
      {[0, 8, 16, 24, 32].map((s, i) => (
        <div key={s} style={{position: 'absolute', left: Z.gauche + (LARGEUR_UTILE * i) / 4 - 40, width: 80, top: 880,
          textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 32, color: '#C9C2FF',
          opacity: remplissage > i / 4 ? 1 - ecart * 0.6 : 0}}>{s} s</div>
      ))}
      <Ligne texte="4 scènes × 8 s = 32 s" y={1020} taille={78} couleur={OR} k={pop(t, e2)} contour={8} />
      <Ligne texte="Une phrase courte par scène" y={1140} taille={52} k={pop(t, e2 + 10)} contour={6} />
      <Ligne texte="(15 mots maximum)" y={1210} taille={46} poids={800} k={pop(t, e2 + 14)} contour={5} />
    </AbsoluteFill>
  );
};
export const SceneBarre32 = avecPolice(BarreCorps);

// 5. Les 3 réglages de Google Flow : 9:16, Veo 3.1 – Fast, x1.
const ReglagesCorps: React.FC<PropsScene> = ({etapes}) => {
  const t = useCurrentFrame();
  const [e0, e1, e2, e3] = useEtapes(etapes, [0.08, 0.35, 0.6, 0.82]);
  const carte = (n: number, k: number, gauche: React.ReactNode, titre: string, detail: string) => (
    <div key={n} style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: 360 + (n - 1) * 330, height: 290,
      borderRadius: 34, background: 'rgba(14,18,44,0.9)', border: `4px solid ${VIOLET}`, display: 'flex',
      alignItems: 'center', gap: 30, padding: '0 34px', boxSizing: 'border-box',
      transform: `translateX(${-140 * (1 - Math.min(1, k))}px)`, opacity: k > 0 ? Math.min(1, k * 1.4) : 0}}>
      <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 60, color: NUIT, background: OR, width: 90, height: 90,
        borderRadius: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{n}</div>
      <div style={{width: 230, display: 'flex', justifyContent: 'center', flexShrink: 0}}>{gauche}</div>
      <div>
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 56, color: '#fff', lineHeight: 1.05}}>{titre}</div>
        <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 32, color: '#C9C2FF', marginTop: 8, lineHeight: 1.2}}>{detail}</div>
      </div>
    </div>
  );
  const k0 = pop(t, e0);
  return (
    <AbsoluteFill>
      <FondNuit teinte="orange" />
      <Titre texte="3 RÉGLAGES À VÉRIFIER" t={t} />
      {carte(1, k0, (
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 18}}>
          <div style={{width: 100, height: 178, borderRadius: 16, border: '8px solid #fff', background: '#1F5BFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: POLICE, fontWeight: 900,
            fontSize: 30, color: '#fff'}}>9:16</div>
          <div style={{position: 'relative', width: 110, height: 62, borderRadius: 10, border: '6px solid #888',
            fontFamily: POLICE, fontWeight: 900, fontSize: 22, color: '#aaa', display: 'flex', alignItems: 'center',
            justifyContent: 'center'}}>16:9
            <Marque type="croix" k={pop(t, e0 + 12)} taille={56} style={{position: 'absolute', right: -22, top: -26}} />
          </div>
        </div>
      ), '9:16', 'Vertical : TikTok, Reels, statuts. (16:9 = YouTube)')}
      {carte(2, pop(t, e1), (
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 40, color: '#fff', background: '#F0560F',
          borderRadius: 24, padding: '20px 18px', textAlign: 'center', lineHeight: 1.1}}>Veo 3.1<br />Fast</div>
      ), 'Fast', 'Le modèle Veo, version rapide')}
      {carte(3, pop(t, e2), (
        <div style={{display: 'flex', gap: 10}}>
          {['x1', 'x2'].map((x, i) => (
            <div key={x} style={{fontFamily: POLICE, fontWeight: 900, fontSize: 44, color: i ? '#999' : NUIT,
              background: i ? 'transparent' : OR, border: `5px solid ${i ? '#666' : '#fff'}`, borderRadius: 20,
              padding: '14px 16px'}}>{x}</div>
          ))}
        </div>
      ), 'x1', 'Une seule vidéo à la fois')}
      <Badge texte="MON ESSAI : 20 CRÉDITS PAR CLIP" y={1385} k={pop(t, e3)} />
    </AbsoluteFill>
  );
};
export const SceneReglages = avecPolice(ReglagesCorps);

// Icône de fichier vidéo avec son poids.
const Fichier: React.FC<{nom: string; poids: string; l: number; couleur: string}> = ({nom, poids, l, couleur}) => (
  <div style={{width: l, height: l * 1.25, position: 'relative'}}>
    <svg width={l} height={l * 1.25} viewBox="0 0 100 125" style={{position: 'absolute', inset: 0}}>
      <path d="M8 4 H68 L92 28 V121 H8 Z" fill="#fff" stroke={couleur} strokeWidth={6} strokeLinejoin="round" />
      <path d="M68 4 V28 H92" fill="#DCE3F5" />
      <path d="M38 46 L62 60 L38 74 Z" fill={couleur} />
    </svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: l * 0.82, textAlign: 'center', fontFamily: POLICE,
      fontWeight: 900, fontSize: l * 0.2, color: couleur}}>{poids}</div>
    <div style={{position: 'absolute', left: -40, right: -40, top: l * 1.3, textAlign: 'center', fontFamily: POLICE,
      fontWeight: 800, fontSize: Math.max(26, l * 0.14), color: '#fff', ...texteContour(4)}}>{nom}</div>
  </div>
);

// 6. Le fichier de 32,5 Mo rebondit sur la barrière « 30 Mo maximum » ; 4 clips de 2 Mo passent.
const BarriereCorps: React.FC<PropsScene> = ({etapes}) => {
  const t = useCurrentFrame();
  const [e0, e1] = useEtapes(etapes, [0.22, 0.52]);
  const BARRIERE = 640;
  // Gros fichier : avance, heurte la barrière, rebondit en arrière et tremble.
  const avance = interpolate(t, [8, e0], [-100, BARRIERE - 320], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad)});
  const recul = t > e0 ? 160 * Math.sin(Math.min(1, (t - e0) / 14) * Math.PI / 2) : 0;
  const tremble = t > e0 && t < e0 + 18 ? 14 * Math.sin((t - e0) * 2.2) * (1 - (t - e0) / 18) : 0;
  const sortie = prog(t, e1 - 10, 10);
  const choc = pop(t, e0);
  return (
    <AbsoluteFill>
      <FondNuit />
      <Titre texte="CLAUDE : 30 Mo MAXIMUM PAR FICHIER" t={t} />
      {/* Barrière rayée rouge et blanche avec son panneau. */}
      <div style={{position: 'absolute', left: BARRIERE, top: 560, width: 54, height: 820, borderRadius: 14,
        background: 'repeating-linear-gradient(180deg, #E11D2E 0 60px, #fff 60px 120px)', border: '5px solid #fff',
        boxShadow: `0 0 ${30 + 30 * choc}px rgba(255,60,60,${0.4 + 0.4 * Math.min(1, choc)})`}} />
      <div style={{position: 'absolute', left: BARRIERE - 110, top: 450, width: 280, padding: '12px 0', borderRadius: 20,
        background: '#E11D2E', border: '5px solid #fff', textAlign: 'center', fontFamily: POLICE, fontWeight: 900,
        fontSize: 40, color: '#fff', lineHeight: 1.05, transform: `rotate(${tremble * 0.3}deg)`}}>30 Mo<br />MAXIMUM</div>
      <div style={{position: 'absolute', left: 760, top: 640, fontFamily: POLICE, fontWeight: 900, fontSize: 46, color: '#fff',
        ...texteContour(6)}}>CLAUDE</div>
      <div style={{position: 'absolute', left: avance - recul + tremble, top: 760, opacity: 1 - sortie}}>
        <Fichier nom="ma_video.mp4" poids="32,5 Mo" l={260} couleur="#E11D2E" />
        <Marque type="croix" k={choc} taille={110} style={{position: 'absolute', right: -50, top: -50}} />
      </div>
      <Ligne texte="Refusé : trop lourd !" y={1290} taille={56} couleur={ROUGE} contour={7} k={t < e1 - 10 ? choc : 0} />
      {/* Les 4 clips d'origine passent un à un. */}
      {[0, 1, 2, 3].map((i) => {
        const a = e1 + i * 14;
        const x = interpolate(t, [a, a + 26], [-80, 720 + (i % 2) * 125], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          easing: Easing.inOut(Easing.cubic)});
        const y = 760 + Math.floor(i / 2) * 260 + (t >= a + 26 ? 0 : -30 * Math.sin(prog(t, a, 26) * Math.PI));
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, opacity: t >= a ? 1 : 0}}>
            <Fichier nom={`clip ${i + 1}`} poids="≈ 2 Mo" l={105} couleur="#16A34A" />
            <Marque type="coche" k={pop(t, a + 26)} taille={60} style={{position: 'absolute', right: -26, top: -26}} />
          </div>
        );
      })}
      <Ligne texte="Envoyez les 4 clips séparés" y={1340} taille={58} couleur={OR} contour={7} k={pop(t, e1 + 70)} />
      <Ligne texte="C'est Claude qui les assemble" y={1430} taille={50} contour={6} k={pop(t, e1 + 78)} />
    </AbsoluteFill>
  );
};
export const SceneBarriere30 = avecPolice(BarriereCorps);

// 7. La vidéo passée par WhatsApp devient floue (vraies images : vidéo d'origine et copie WhatsApp).
const WhatsAppCorps: React.FC<PropsScene> = ({etapes}) => {
  const t = useCurrentFrame();
  const [e0, e1, e2] = useEtapes(etapes, [0.12, 0.38, 0.7]);
  const passage = prog(t, e1, 20, Easing.inOut(Easing.cubic));
  const image = (src: string, x: number, k: number, titre: string, detail: string, c: string) => (
    <div style={{position: 'absolute', left: x, top: 510, width: 400, display: 'flex', flexDirection: 'column',
      alignItems: 'center', transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
      <div style={{width: 380, height: 676, borderRadius: 26, overflow: 'hidden', border: `7px solid ${c}`,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 40, color: '#fff', marginTop: 14, ...texteContour(5)}}>{titre}</div>
      <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 34, color: c}}>{detail}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <FondNuit teinte="vert" />
      <Titre texte="NE PASSEZ PAS PAR WHATSAPP" t={t} />
      {image('formation-montage-partie1/image_nette.jpg', Z.gauche - 10, pop(t, e0), 'Original', '720 × 1280', VERT)}
      {image('formation-montage-partie1/image_floue.jpg', CENTRE + 60, pop(t, e1 + 18), 'Après WhatsApp', '360 × 640', ROUGE)}
      {/* Tuyau WhatsApp entre les deux images. */}
      <div style={{position: 'absolute', left: 360, top: 390, width: 300, padding: '10px 0', borderRadius: 40,
        background: '#16A34A', border: '5px solid #fff', textAlign: 'center', fontFamily: POLICE, fontWeight: 900,
        fontSize: 40, color: '#fff', transform: `scale(${pop(t, e1)})`}}>WhatsApp</div>
      <div style={{position: 'absolute', left: 300 + 300 * passage, top: 480, width: 90, height: 160, borderRadius: 12,
        border: '4px solid #fff', overflow: 'hidden', opacity: t >= e1 && passage < 1 ? 1 : 0}}>
        <Img src={staticFile('formation-montage-partie1/image_nette.jpg')} style={{width: '100%', height: '100%',
          objectFit: 'cover', filter: `blur(${passage * 4}px)`}} />
      </div>
      <div style={{position: 'absolute', left: CENTRE + 120, top: 760, transform: `rotate(-14deg) scale(${pop(t, e2 - 12)})`,
        fontFamily: POLICE, fontWeight: 900, fontSize: 92, color: '#fff', background: ROUGE, padding: '6px 26px',
        borderRadius: 18, border: '6px solid #fff', opacity: pop(t, e2 - 12) > 0 ? 1 : 0}}>FLOU</div>
      <Ligne texte="Utilisez toujours les fichiers d'origine" y={1420} taille={48} couleur={OR} contour={6} k={pop(t, e2)} />
    </AbsoluteFill>
  );
};
export const SceneWhatsAppFlou = avecPolice(WhatsAppCorps);

// 8. Les 4 limites de Claude gratuit, puis la flèche vers la partie 2 (Claude Code).
const LimitesCorps: React.FC<PropsScene> = ({etapes}) => {
  const t = useCurrentFrame();
  const departs = useEtapes(etapes, [0.08, 0.26, 0.44, 0.6, 0.8]);
  const limites: [string, string, string][] = [
    ['balance', '#E11D2E', '30 Mo maximum par fichier'], ['messages', '#F0560F', 'Nombre de messages limité'],
    ['oreille', '#7B2FF7', 'Ne réécoute pas toujours le son'], ['etoiles', '#1F5BFF', 'Animations assez simples']];
  const kFin = pop(t, departs[4], 150);
  return (
    <AbsoluteFill>
      <FondNuit />
      <Titre texte="LES LIMITES DE CLAUDE GRATUIT" t={t} />
      {limites.map(([nom, c, texte], i) => {
        const k = pop(t, departs[i]);
        return (
          <div key={nom} style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: 380 + i * 200,
            display: 'flex', alignItems: 'center', gap: 28, opacity: k > 0 ? 1 : 0,
            transform: `translateX(${-120 * (1 - Math.min(1, k))}px)`}}>
            <Tuile nom={nom} taille={160} couleur={c} k={k} />
            <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 50, color: '#fff', lineHeight: 1.1,
              ...texteContour(6)}}>{i + 1}. {texte}</span>
          </div>
        );
      })}
      <svg width={120} height={120} viewBox="0 0 100 100" style={{position: 'absolute', left: CENTRE - 60, top: 1180,
        opacity: kFin > 0 ? 1 : 0, transform: `translateY(${8 * Math.sin(t / 5)}px)`}}>
        <path d="M50 8 V76 M22 52 L50 84 L78 52" stroke={OR} strokeWidth={14} fill="none" strokeLinecap="round"
          strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', left: Z.gauche + 30, width: LARGEUR_UTILE - 60, top: 1320, padding: '18px 0',
        borderRadius: 30, background: `linear-gradient(135deg, ${VIOLET}, #E0337E)`, border: '6px solid #fff',
        textAlign: 'center', fontFamily: POLICE, fontWeight: 900, fontSize: 60, color: '#fff', transform: `scale(${kFin})`,
        opacity: kFin > 0 ? 1 : 0, boxShadow: '0 18px 50px rgba(160,60,255,0.5)'}}>PARTIE 2 : CLAUDE CODE</div>
    </AbsoluteFill>
  );
};
export const SceneLimites = avecPolice(LimitesCorps);

// 9. Récapitulatif des 8 étapes, une coche verte sur chacune.
export const ETAPES_RECAP = ['Le script avec ChatGPT', 'Découper en scènes de 8 s', 'Le personnage fictif',
  'Les prompts Google Flow', 'Créer les clips dans Google Flow', 'La règle des 30 Mo', 'Le montage avec Claude',
  'Corriger et télécharger'];
const RecapCorps: React.FC<PropsScene> = ({etapes}) => {
  const t = useCurrentFrame();
  const departs = useEtapes(etapes, ETAPES_RECAP.map((_, i) => 0.06 + i * 0.11));
  return (
    <AbsoluteFill>
      <FondNuit teinte="vert" />
      <Titre texte="RÉCAPITULATIF" t={t} />
      {ETAPES_RECAP.map((e, i) => {
        const k = pop(t, departs[i]);
        const c = pop(t, departs[i] + 6);
        return (
          <div key={e} style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: 340 + i * 146, height: 124,
            borderRadius: 28, background: c > 0 ? 'rgba(22,163,74,0.28)' : 'rgba(14,18,44,0.85)',
            border: `4px solid ${c > 0 ? VERT : 'rgba(255,255,255,0.25)'}`, display: 'flex', alignItems: 'center', gap: 22,
            padding: '0 24px', boxSizing: 'border-box', opacity: k > 0 ? 1 : 0,
            transform: `translateX(${-100 * (1 - Math.min(1, k))}px)`}}>
            <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 40, color: NUIT, background: OR, width: 70,
              height: 70, borderRadius: 35, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{i + 1}</span>
            <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 44, color: '#fff', flex: 1, lineHeight: 1.05}}>{e}</span>
            <Marque type="coche" k={c} taille={84} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
export const SceneRecap = avecPolice(RecapCorps);
