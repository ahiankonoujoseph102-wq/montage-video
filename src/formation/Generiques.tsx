import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {POLICE} from '../charte';
import {usePolicesChargees} from '../Montage';
import {Badge, CENTRE, FondNuit, Ligne, LARGEUR_UTILE, Logo, NUIT, NUMEROS, NumeroWhatsApp, OR, pop, prog,
  VERT, Z, texteContour} from './commun';
import {Tuile} from './Pictos';

// Génériques de la formation. Ceux qui ont une voix off (services, adhésion, Talkami) ont une durée réglable
// (props `duree`, en secondes) : les éléments apparaissent à des fractions de la durée, pour suivre la voix.
export type PropsGenerique = {duree?: number};

const Attente: React.FC<React.PropsWithChildren> = ({children}) => (usePolicesChargees() ? <>{children}</> : null);

// --- Ouverture (8 s, musique seule) : le titre claque d'abord, le logo ne s'allume qu'à 3 s. ---
const OuvertureCorps: React.FC = () => {
  const t = useCurrentFrame();
  const descente = prog(t, 84, 16, Easing.inOut(Easing.cubic));
  const yTitre = interpolate(descente, [0, 1], [700, 930]);
  const echelle = interpolate(descente, [0, 1], [1, 0.82]);
  const lignes: [string, number, string | undefined, string][] = [
    ['MONTER', 6, undefined, '#fff'], ["N'IMPORTE QUELLE VIDÉO", 14, undefined, '#fff'], ["AVEC L'IA", 22, OR, NUIT]];
  return (
    <AbsoluteFill>
      <FondNuit />
      {/* Éclair de lumière horizontal au début. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, height: 6,
        background: `linear-gradient(90deg, transparent, ${OR}, transparent)`,
        transform: `scaleX(${prog(t, 0, 10)})`, opacity: 1 - prog(t, 14, 10)}} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${yTitre - 700}px) scale(${echelle})`,
        transformOrigin: `${CENTRE}px ${yTitre}px`}}>
        {lignes.map(([texte, a, bloc, couleur], i) => {
          const k = pop(t, a, 260);
          const etire = 1 + 0.35 * (1 - prog(t, a, 5));
          return (
            <div key={texte} style={{position: 'absolute', inset: 0, transform: `scaleY(${k > 0 ? etire : 1})`,
              transformOrigin: `${CENTRE}px ${700 + i * 150}px`}}>
              <Ligne texte={texte} y={640 + i * 150} taille={i === 1 ? 104 : 130} k={k} couleur={couleur}
                contour={bloc ? 0 : 10} fondBloc={bloc} />
            </div>
          );
        })}
      </div>
      <Logo taille={430} x={CENTRE} y={560} k={pop(t, 90, 120)} reflet={(t - 100) / 26} halo={prog(t, 95, 20)} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${40 * (1 - prog(t, 150, 12))}px)`}}>
        <Badge texte="PARTIE 1 : AVEC CLAUDE GRATUIT" y={1445} k={pop(t, 150)} />
      </div>
    </AbsoluteFill>
  );
};
export const GeneriqueOuverture: React.FC = () => <Attente><OuvertureCorps /></Attente>;

// Disposition de tuiles avec étiquettes (2 ou 3 par ligne).
const Tuiles: React.FC<{elements: [string, string, string][]; y: number; t: number; a: number; pas: number;
  taille?: number}> = ({elements, y, t, a, pas, taille = 190}) => {
  const parLigne = elements.length > 4 ? 3 : 2;
  return (
    <>
      {elements.map(([nom, couleur, texte], i) => {
        const ligne = Math.floor(i / parLigne);
        const n = Math.min(parLigne, elements.length - ligne * parLigne);
        const col = i % parLigne;
        const x = CENTRE + (col - (n - 1) / 2) * 300;
        const k = pop(t, a + i * pas);
        return (
          <div key={nom} style={{position: 'absolute', left: x - 150, width: 300, top: y + ligne * (taille + 110),
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            transform: `translateY(${6 * Math.sin((t + i * 11) / 14)}px)`}}>
            <Tuile nom={nom} taille={taille} couleur={couleur} k={k} />
            <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 42, color: '#fff', marginTop: 14,
              opacity: k > 0 ? 1 : 0, textAlign: 'center', ...texteContour(6)}}>{texte}</div>
          </div>
        );
      })}
    </>
  );
};

// --- Générique publicitaire 1 : les services (15 s par défaut, voix off). ---
const ServicesCorps: React.FC = () => {
  const t = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  return (
    <AbsoluteFill>
      <FondNuit teinte="violet" />
      <Badge texte="PETITE PAUSE" y={225} k={pop(t, 2)} />
      <Logo taille={190} x={CENTRE} y={420} k={pop(t, 8)} reflet={(t - 20) / 24} halo={0.6} />
      <Ligne texte="RÉALISE VOS PROJETS" y={540} taille={76} k={pop(t, 14)} contour={8} />
      <Tuiles y={650} taille={170} t={t} a={Math.round(d * 0.22)} pas={Math.round(d * 0.045)} elements={[
        ['siteWeb', '#1F5BFF', 'Sites web'], ['appli', '#0E8F62', 'Applications'], ['agentIA', '#7B2FF7', 'Agents IA'],
        ['video', '#E0337E', 'Vidéos'], ['automatisation', '#F0560F', 'Automatisations']]} />
      <Ligne texte="Nous formons et accompagnons" y={1215} taille={52} poids={800} k={pop(t, Math.round(d * 0.55))} />
      <Ligne texte="aussi les entreprises" y={1277} taille={52} poids={800} k={pop(t, Math.round(d * 0.55) + 3)} />
      <NumeroWhatsApp numero={NUMEROS[0]} y={1365} k={pop(t, Math.round(d * 0.75))} taille={70} />
    </AbsoluteFill>
  );
};
export const GeneriqueServices: React.FC<PropsGenerique> = () => <Attente><ServicesCorps /></Attente>;

// Coche verte qui se dessine.
const Coche: React.FC<{k: number; taille: number}> = ({k, taille}) => (
  <svg width={taille} height={taille} viewBox="0 0 100 100" style={{flexShrink: 0, transform: `scale(${Math.min(1.2, k)})`,
    opacity: k > 0 ? 1 : 0}}>
    <circle cx="50" cy="50" r="48" fill="#fff" />
    <circle cx="50" cy="50" r="42" fill={VERT} />
    <path d="M28 52 L44 67 L73 35" fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round"
      strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, k)} />
  </svg>
);

// --- Générique publicitaire 2 : l'adhésion à vie (15 s par défaut, voix off). ---
const AdhesionCorps: React.FC = () => {
  const t = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const avantages = ['Toutes nos formations', 'Toutes les mises à jour', 'Un accompagnement personnel dans vos projets'];
  const kPrix = pop(t, Math.round(d * 0.55), 160);
  return (
    <AbsoluteFill>
      <FondNuit />
      <Badge texte="ADHÉSION À VIE" y={220} k={pop(t, 2)} />
      <Logo taille={150} x={CENTRE} y={385} k={pop(t, 6)} reflet={(t - 16) / 24} halo={0.5} />
      <Ligne texte="Rejoignez Lomé IA School à vie" y={480} taille={64} k={pop(t, 10)} contour={7} />
      {avantages.map((a, i) => {
        const k = pop(t, Math.round(d * (0.14 + i * 0.1)));
        return (
          <div key={a} style={{position: 'absolute', left: Z.gauche + 20, width: LARGEUR_UTILE - 40, top: 590 + i * 112,
            display: 'flex', alignItems: 'center', gap: 22, opacity: k > 0 ? 1 : 0,
            transform: `translateX(${-60 * (1 - Math.min(1, k))}px)`}}>
            <Coche k={k} taille={78} />
            <span style={{fontFamily: POLICE, fontWeight: 800, fontSize: 44, color: '#fff', lineHeight: 1.1}}>{a}</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: Z.gauche + 40, width: LARGEUR_UTILE - 80, top: 940, height: 230,
        borderRadius: 36, background: `linear-gradient(160deg, ${OR}, #FF9F1C)`, border: '6px solid #fff',
        boxShadow: `0 20px 60px ${OR}66`, transform: `scale(${kPrix}) rotate(${(1 - Math.min(1, kPrix)) * -6}deg)`,
        opacity: kPrix > 0 ? 1 : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 100, color: NUIT, lineHeight: 1}}>150 000 F CFA</div>
        <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 40, color: NUIT, marginTop: 14}}>
          payable en plusieurs tranches</div>
      </div>
      {NUMEROS.map((n, i) => {
        const k = pop(t, Math.round(d * 0.78) + i * 6);
        return (
          <div key={n} style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: 1230 + i * 130,
            display: 'flex', justifyContent: 'center', transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
            <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 70, color: '#fff', background: '#16A34A',
              padding: '8px 34px', borderRadius: 28, border: '5px solid #fff'}}>{n}</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: 1195, textAlign: 'center',
        fontFamily: POLICE, fontWeight: 800, fontSize: 30, color: '#BFF5D3', letterSpacing: 4,
        opacity: pop(t, Math.round(d * 0.78)) > 0 ? 1 : 0}}>WHATSAPP</div>
    </AbsoluteFill>
  );
};
export const GeneriqueAdhesion: React.FC<PropsGenerique> = () => <Attente><AdhesionCorps /></Attente>;

// Bulle souriante de Talkami qui parle (la bouche s'ouvre), utilisée comme visage de Teacher Joe.
const Mascotte: React.FC<{taille: number; parle: boolean; t: number}> = ({taille, parle, t}) => {
  const bouche = parle ? 0.5 + 0.5 * Math.abs(Math.sin(t / 2.3)) : 0.25;
  return (
    <svg width={taille} height={taille} viewBox="0 0 100 100" style={{flexShrink: 0}}>
      <path d="M14 18 H86 a12 12 0 0 1 12 12 V62 a12 12 0 0 1 -12 12 H34 L18 90 V74 H14 a12 12 0 0 1 -12 -12 V30 a12 12 0 0 1 12 -12 Z"
        fill="#0B2A6B" />
      <path d={`M30 42 Q50 ${42 + 26 * bouche} 70 42`} stroke="#F7861E" strokeWidth="9" fill="none" strokeLinecap="round" />
    </svg>
  );
};

const Onde: React.FC<{t: number; couleur: string; n?: number}> = ({t, couleur, n = 22}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 6, height: 60}}>
    {Array.from({length: n}).map((_, i) => (
      <div key={i} style={{width: 8, borderRadius: 4, background: couleur,
        height: 12 + 44 * Math.abs(Math.sin(t / 4 + i * 0.9) * Math.cos(i * 0.6))}} />
    ))}
  </div>
);

// --- Générique publicitaire 3 : Talkami (12 s par défaut, voix off). ---
const TalkamiCorps: React.FC = () => {
  const t = useCurrentFrame();
  const {durationInFrames: d} = useVideoConfig();
  const a = [Math.round(d * 0.2), Math.round(d * 0.32), Math.round(d * 0.44)];
  const bulle = (k: number, gauche: boolean, contenu: React.ReactNode, cle: string) => (
    <div key={cle} style={{display: 'flex', justifyContent: gauche ? 'flex-start' : 'flex-end', marginTop: 24,
      transform: `scale(${k})`, transformOrigin: gauche ? 'left center' : 'right center', opacity: k > 0 ? 1 : 0}}>
      {contenu}
    </div>
  );
  const atouts: [string, number][] = [['Il parle avec vous', 0.3], ['Il vous écoute', 0.4], ['Il vous corrige', 0.5]];
  return (
    <AbsoluteFill>
      <FondNuit teinte="orange" />
      <div style={{position: 'absolute', left: CENTRE - 150, top: 215, width: 300, height: 300, borderRadius: 50,
        overflow: 'hidden', background: '#fff', transform: `scale(${pop(t, 2)})`, boxShadow: '0 20px 60px rgba(0,0,0,0.4)'}}>
        <Img src={staticFile('marques/talkami.jpg')} style={{width: '100%', height: '100%'}} />
      </div>
      <Ligne texte="Parlez anglais depuis votre téléphone" y={545} taille={50} k={pop(t, 8)} contour={6} />
      {/* Téléphone avec une conversation vocale avec Teacher Joe. */}
      <div style={{position: 'absolute', left: Z.gauche + 20, top: 640, width: 520, height: 700, borderRadius: 60,
        background: '#14141F', padding: 16, transform: `translateY(${80 * (1 - prog(t, 10, 14))}px)`,
        opacity: prog(t, 10, 8), boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
        <div style={{width: '100%', height: '100%', borderRadius: 46, background: '#F4F6FB', overflow: 'hidden',
          padding: '26px 22px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, borderBottom: '2px solid #DDE3F0', paddingBottom: 14}}>
            <Mascotte taille={74} parle={t > a[0] && t < a[1]} t={t} />
            <div style={{fontFamily: POLICE, fontWeight: 900, fontSize: 34, color: '#0B2A6B'}}>Teacher Joe</div>
          </div>
          {bulle(pop(t, a[0]), true, (
            <div style={{background: '#0B2A6B', color: '#fff', borderRadius: 26, padding: '16px 20px', fontFamily: POLICE,
              fontWeight: 800, fontSize: 30, maxWidth: 380}}>Hello! Tell me about your day.</div>), 'b1')}
          {bulle(pop(t, a[1]), false, (
            <div style={{background: '#F7861E', borderRadius: 26, padding: '10px 18px'}}>
              <Onde t={t} couleur="#fff" n={14} /></div>), 'b2')}
          {bulle(pop(t, a[2]), true, (
            <div style={{background: '#0B2A6B', color: '#fff', borderRadius: 26, padding: '16px 20px', fontFamily: POLICE,
              fontWeight: 800, fontSize: 30, maxWidth: 380}}>Good! Say it again: “I <span style={{color: '#7CF0A6'}}>went</span> to the market.”</div>), 'b3')}
        </div>
      </div>
      {atouts.map(([texte, f], i) => {
        const k = pop(t, Math.round(d * f));
        return (
          <div key={texte} style={{position: 'absolute', left: 600, width: 350, top: 720 + i * 190, transform: `scale(${k})`,
            opacity: k > 0 ? 1 : 0, background: '#fff', borderRadius: 28, padding: '20px 20px', fontFamily: POLICE,
            fontWeight: 900, fontSize: 38, color: '#0B2A6B', boxShadow: '0 14px 30px rgba(0,0,0,0.35)',
            borderLeft: '12px solid #F7861E'}}>{texte}</div>
        );
      })}
      <Ligne texte="ÉVALUATION ORALE GRATUITE" y={1380} taille={58} k={pop(t, Math.round(d * 0.68))} fondBloc="#F7861E"
        couleur="#fff" />
      <Ligne texte="talkami.laravel.cloud" y={1465} taille={56} k={pop(t, Math.round(d * 0.74))} contour={7} />
    </AbsoluteFill>
  );
};
export const GeneriqueTalkami: React.FC<PropsGenerique> = () => <Attente><TalkamiCorps /></Attente>;

// --- Générique de fin (10 s) : logo, slogan, numéros. ---
const FinCorps: React.FC = () => {
  const t = useCurrentFrame();
  const lignes = ["Maîtrisez l'IA et transformez", 'vos compétences en opportunités'];
  return (
    <AbsoluteFill>
      <FondNuit />
      <Logo taille={400} x={CENTRE} y={480} k={pop(t, 4, 120)} reflet={(t - 20) / 26} halo={prog(t, 10, 20)} />
      <Ligne texte="MERCI !" y={720} taille={110} k={pop(t, 30)} couleur={OR} contour={9} />
      {lignes.map((l, i) => (
        <Ligne key={l} texte={l} y={870 + i * 72} taille={58} k={pop(t, 50 + i * 5)} contour={7} />
      ))}
      <div style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: 1085, textAlign: 'center',
        fontFamily: POLICE, fontWeight: 800, fontSize: 34, color: '#BFF5D3', letterSpacing: 4,
        opacity: pop(t, 80) > 0 ? 1 : 0}}>WHATSAPP</div>
      {NUMEROS.map((n, i) => {
        const k = pop(t, 80 + i * 8);
        return (
          <div key={n} style={{position: 'absolute', left: Z.gauche, width: LARGEUR_UTILE, top: 1140 + i * 150,
            display: 'flex', justifyContent: 'center', transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
            <span style={{fontFamily: POLICE, fontWeight: 900, fontSize: 80, color: '#fff', background: '#16A34A',
              padding: '8px 38px', borderRadius: 30, border: '6px solid #fff'}}>{n}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
export const GeneriqueFin: React.FC = () => <Attente><FinCorps /></Attente>;
