import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {EtapeExpression, EtapeGeste, etatDouble} from '../commun/animationDouble';
import {Etoile} from '../commun/Ecran';
import {LogoCoin} from '../commun/LogoCoin';
import {Effets, EvenementSonore} from '../commun/sons';
import {blocsSousTitres} from '../commun/SousTitresVoix';
import {pop, prog} from '../commun/temps';
import {COULEURS, Expression, FORMAT, Geste, POLICE} from '../theme';
import {Medaillon} from '../episodes/ep02/elements';
import {Scene2D} from '../v2d/Scene2D';
import bouche from './bouche.json';
import {
  Bulle, Carte, CarteFinale, Clip, CONTOUR, EcranClip, Etiquette, FondAnime, FondFlou, GrandNombre, GrosMot, IconeBarree,
  BandeauWhatsApp, NumeroGeant, POSES, ROUGE, Tampon, Telephone, VERT, clamp, claque,
} from './elements';
import {DEBUT_CARTE, DEBUT_VOIX, DUREE, LIAISONS, MOTS, MOTS_CLES, T, w} from './scenario';
import visemes from './visemes.json';

// Publicité de la formation de Coach Joseph : plans de 0,6 à 1,6 s calés sur la voix.

type Plan = {
  debut: number;
  fin: number;
  type: 'tel' | 'tampon' | 'mosaique' | 'plein' | 'tiktok' | 'trio' | 'joseph' | 'clients' | 'creer' | 'monter' | 'prix' | 'numero' | 'bulle' | 'repete' | 'fini' | 'carte';
  clip?: string;
  pose?: number;
  entree?: 'gauche' | 'droite' | 'bas' | 'zoom';
  icone?: 'camera' | 'acteur';
  etiquette?: string;
  cadre?: 'large' | 'proche' | 'moyen' | 'gros';
  ecran?: 'nom' | 'depuis' | 'formation' | 'etapes' | 'whatsapp' | 'logo' | 'vide';
  geste?: Geste;
  expression?: Expression;
  cartes?: number; // nombre de cartes de la formation visibles
  compteur?: boolean;
  variante?: string;
};

const fin = (t: number) => t - 0.06;
const DUREE_CLIENTS = 0.95 + 0.95 + 1.1;

const PLANS: Plan[] = [
  // 0–3 s : trois plans IA de Joseph, puis le tampon
  {debut: 0, fin: 0.95, type: 'tel', clip: 'j-concert', pose: 0, entree: 'zoom'},
  {debut: 0.95, fin: 1.9, type: 'tel', clip: 'j-scene', pose: 1, entree: 'droite'},
  {debut: 1.9, fin: T.filmee + 0.12, type: 'tel', clip: 'j-foule', pose: 2, entree: 'gauche'},
  {debut: T.filmee + 0.12, fin: fin(T.camera), type: 'tampon'},
  {debut: fin(T.camera), fin: fin(T.acteur), type: 'tel', clip: 'ia-vieux', pose: 3, entree: 'droite', icone: 'camera'},
  {debut: fin(T.acteur), fin: fin(T.juste), type: 'tel', clip: 'ia-moto', pose: 0, entree: 'gauche', icone: 'acteur'},
  {debut: fin(T.juste), fin: fin(T.pendant), type: 'mosaique'},
  // d'autres créent ces vidéos… et se font payer
  {debut: fin(T.pendant), fin: fin(T.autres), type: 'plein', clip: 'px-ecran'},
  {debut: fin(T.autres), fin: T.depuis - 0.1, type: 'plein', clip: 'px-trepied'},
  {debut: T.depuis - 0.1, fin: T.depuis + 0.86, type: 'tiktok', clip: 'tk-beretta-grille', variante: 'beretta'},
  {debut: T.depuis + 0.86, fin: T.payer - 0.1, type: 'tiktok', clip: 'tk-yasso-profil', variante: 'yasso'},
  {debut: T.payer - 0.1, fin: fin(T.boutiques), type: 'plein', clip: 'px-paiement', variante: 'paiement'},
  {debut: fin(T.boutiques), fin: fin(T.salons - 0.16), type: 'plein', clip: 'px-boutique', etiquette: 'BOUTIQUES'},
  {debut: fin(T.salons - 0.16), fin: fin(T.eglises - 0.13), type: 'plein', clip: 'px-salon', etiquette: 'SALONS'},
  {debut: fin(T.eglises - 0.13), fin: fin(T.entreprises - 0.11), type: 'plein', clip: 'px-eglise', etiquette: 'ÉGLISES'},
  {debut: fin(T.entreprises - 0.11), fin: fin(T.tout), type: 'plein', clip: 'px-entreprise', etiquette: 'ENTREPRISES'},
  {debut: fin(T.tout), fin: fin(T.quelquun), type: 'plein', clip: 'px-marche', etiquette: 'TOUT LE MONDE'},
  {debut: fin(T.quelquun), fin: fin(T.moi), type: 'trio'},
  // Moi, c'est Coach Joseph
  {debut: fin(T.moi), fin: T.an2023 - 0.12, type: 'joseph', cadre: 'large', ecran: 'nom', geste: 'explique', expression: 'sourire'},
  {debut: T.an2023 - 0.12, fin: T.mille - 0.25, type: 'joseph', cadre: 'proche', ecran: 'depuis', geste: 'compte', expression: 'parle'},
  {debut: T.mille - 0.25, fin: fin(T.et), type: 'joseph', cadre: 'moyen', ecran: 'vide', geste: 'explique', expression: 'sourire', compteur: true},
  {debut: fin(T.et), fin: fin(T.et) + DUREE_CLIENTS, type: 'clients'},
  // Dans ma formation…
  {debut: fin(T.et) + DUREE_CLIENTS, fin: fin(T.etape), type: 'joseph', cadre: 'large', ecran: 'formation', geste: 'designe', expression: 'parle'},
  {debut: fin(T.etape), fin: fin(T.meme), type: 'joseph', cadre: 'proche', ecran: 'etapes', geste: 'compte', expression: 'sourire'},
  {debut: fin(T.meme), fin: fin(T.sans), type: 'joseph', cadre: 'moyen', ecran: 'vide', geste: 'explique', expression: 'parle', cartes: 1},
  {debut: fin(T.sans), fin: fin(T.creer), type: 'joseph', cadre: 'gros', ecran: 'vide', geste: 'explique', expression: 'sourire', cartes: 2},
  {debut: fin(T.creer), fin: fin(T.monter - 0.1), type: 'creer'},
  {debut: fin(T.monter - 0.1), fin: fin(T.trouver - 0.12), type: 'monter'},
  {debut: fin(T.trouver - 0.12), fin: fin(T.elle), type: 'joseph', cadre: 'moyen', ecran: 'vide', geste: 'pouce', expression: 'sourire', cartes: 3},
  // Prix
  {debut: fin(T.elle), fin: fin(T.ecris), type: 'prix'},
  // WhatsApp
  {debut: fin(T.ecris), fin: T.n1[0] - 0.12, type: 'joseph', cadre: 'large', ecran: 'whatsapp', geste: 'designe', expression: 'parle'},
  {debut: T.n1[0] - 0.12, fin: fin(T.dis), type: 'numero'},
  {debut: fin(T.dis), fin: fin(T.repete), type: 'bulle'},
  {debut: fin(T.repete), fin: fin(T.quand), type: 'repete'},
  {debut: fin(T.quand), fin: DEBUT_CARTE, type: 'fini'},
  {debut: DEBUT_CARTE, fin: DUREE, type: 'carte'},
];

export const DUREE_PUB2 = Math.round(DUREE * FORMAT.fps);
export const FIN_EXTRAIT_PUB2 = 12;
const planA = (t: number) => PLANS.find((p) => t >= p.debut && t < p.fin) ?? PLANS[PLANS.length - 1];
const BOUCHE = bouche as number[];
const VISEMES = visemes as string;

// ------------------------------------------------------------------ double de Joseph

const GESTES: EtapeGeste[] = [{t: -10, geste: 'repos'}];
const EXPRESSIONS: EtapeExpression[] = [{t: -10, expression: 'sourire'}];
for (const p of PLANS) {
  if (p.type !== 'joseph' && p.type !== 'repete') continue;
  const tv = p.debut - DEBUT_VOIX;
  GESTES.push({t: tv - 0.2, geste: p.type === 'repete' ? 'designe' : p.geste ?? 'explique', doigts: p.ecran === 'depuis' ? 1 : p.ecran === 'etapes' ? 3 : undefined});
  EXPRESSIONS.push({t: tv, expression: p.expression ?? 'sourire'});
}
const etatJoseph = (t: number, fps: number) => etatDouble(t - DEBUT_VOIX, GESTES, EXPRESSIONS, BOUCHE, VISEMES, fps);

const CADRES = {
  large: {s: 1, o: '540px 1000px'},
  proche: {s: 1.16, o: '540px 760px'},
  moyen: {s: 1.5, o: '540px 1180px'},
  gros: {s: 2.1, o: '540px 1120px'},
};

// Contenu de l'écran du décor (x 110, y 240, 860 × 600).
const EcranDecor: React.FC<{mode: Plan['ecran']; t: number; p: Plan}> = ({mode, t, p}) => {
  const local = t - p.debut;
  const fondEcran = (
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at ${50 + Math.sin(t) * 20}% 40%, #2d2a8a, ${COULEURS.nuit} 75%)`}}>
      <div style={{position: 'absolute', left: -300, top: -500, width: 1500, height: 1500, transform: `rotate(${t * 20}deg)`, opacity: 0.18, background: `conic-gradient(${COULEURS.violet}, transparent 25%, ${COULEURS.or} 50%, transparent 75%, ${COULEURS.violet})`}} />
    </div>
  );
  let contenu: React.ReactNode = null;
  if (mode === 'nom' || mode === 'logo') {
    const a = mode === 'nom' ? T.coach - 0.05 : p.debut;
    contenu = (
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
        <Img src={staticFile('marque/logo.jpg')} style={{width: 190, height: 190, borderRadius: 40, boxShadow: `0 0 40px ${COULEURS.or}88`, transform: `scale(${pop(t, p.debut + 0.05, 0.35)}) rotate(${Math.sin(t * 2) * 3}deg)`}} />
        {mode === 'nom' ? (
          <div style={{textAlign: 'center', transform: `scale(${t >= a ? claque(t - a, 1.8) : 0})`}}>
            <div style={{fontSize: 92, fontWeight: 800, color: COULEURS.or, lineHeight: 1.0, ...CONTOUR(10)}}>Coach Joseph</div>
            <div style={{marginTop: 8, display: 'inline-block', padding: '4px 22px', borderRadius: 14, background: COULEURS.blanc, color: COULEURS.nuit, fontSize: 46, fontWeight: 800}}>Lomé IA School</div>
          </div>
        ) : null}
      </div>
    );
  }
  if (mode === 'depuis') {
    const an = 2023; // jamais d'autre année à l'image (un compteur afficherait 2020, 2021…)
    contenu = (
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontSize: 64, fontWeight: 800, color: COULEURS.blanc, letterSpacing: 4, transform: `scale(${pop(t, p.debut, 0.3)})`}}>DEPUIS</div>
        <div style={{fontSize: 230, fontWeight: 800, color: COULEURS.or, lineHeight: 0.95, fontVariantNumeric: 'tabular-nums', ...CONTOUR(14), textShadow: `0 0 50px ${COULEURS.or}88`, transform: `scale(${t >= T.an2023 - 0.02 ? claque(t - T.an2023 + 0.02, 2) : 0})`}}>{an}</div>
      </div>
    );
  }
  if (mode === 'formation') {
    contenu = (
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18}}>
        <div style={{fontSize: 46, fontWeight: 800, color: COULEURS.or, letterSpacing: 6, transform: `scale(${pop(t, p.debut, 0.3)})`}}>MA FORMATION</div>
        <div style={{fontSize: 70, fontWeight: 800, color: COULEURS.blanc, textAlign: 'center', lineHeight: 1.05, transform: `scale(${pop(t, p.debut + 0.12, 0.3)})`, padding: '0 30px'}}>
          Vidéos IA <span style={{color: COULEURS.or}}>de A à Z</span>
        </div>
        <div style={{marginTop: 6, padding: '10px 34px', borderRadius: 999, background: COULEURS.or, color: COULEURS.nuit, fontSize: 52, fontWeight: 800, transform: `scale(${t >= T.tout2 ? claque(t - T.tout2, 1.8) : 0})`}}>JE TE MONTRE TOUT</div>
      </div>
    );
  }
  if (mode === 'etapes') {
    const noms = ['Créer', 'Monter', 'Vendre'];
    contenu = (
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}}>
        <div style={{fontSize: 54, fontWeight: 800, color: COULEURS.or, letterSpacing: 3}}>ÉTAPE PAR ÉTAPE</div>
        <div style={{display: 'flex', gap: 22}}>
          {noms.map((n, i) => {
            const a = p.debut + 0.15 + i * 0.28;
            return (
              <div key={n} style={{width: 240, padding: '18px 0', borderRadius: 26, background: t >= a + 0.2 ? VERT : '#ffffff22', textAlign: 'center', transform: `scale(${pop(t, a, 0.3)})`, boxShadow: '0 10px 26px #0009'}}>
                <div style={{fontSize: 80, fontWeight: 800, color: COULEURS.blanc, lineHeight: 1}}>{t >= a + 0.2 ? '✓' : i + 1}</div>
                <div style={{fontSize: 44, fontWeight: 800, color: COULEURS.blanc}}>{n}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (mode === 'whatsapp') {
    const pulse = 1 + 0.05 * Math.sin(t * 8);
    contenu = (
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
        <div style={{width: 190, height: 190, borderRadius: 54, background: VERT, display: 'grid', placeItems: 'center', transform: `scale(${pop(t, p.debut, 0.35) * pulse}) rotate(${Math.sin(t * 7) * 6}deg)`, boxShadow: `0 0 50px ${VERT}`}}>
          <Bulle taille={130} />
        </div>
        <div style={{fontSize: 74, fontWeight: 800, color: COULEURS.blanc, transform: `scale(${t >= T.whatsapp ? claque(t - T.whatsapp, 1.8) : 0})`}}>
          Écris-moi sur <span style={{color: '#4dff8f'}}>WhatsApp</span>
        </div>
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', left: 110, top: 240, width: 860, height: 600, borderRadius: 12, overflow: 'hidden', fontFamily: POLICE, opacity: prog(local, 0, 0.08)}}>
      {fondEcran}
      {contenu}
    </div>
  );
};

const PlanJoseph: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const {fps} = useVideoConfig();
  const etat = etatJoseph(t, fps);
  const c = CADRES[p.cadre ?? 'large'];
  const local = t - p.debut;
  const entree = interpolate(local, [0, 0.14], [1.1, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const s = c.s * entree * (1 + 0.03 * local);
  return (
    <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: c.o}}>
      <Scene2D etat={etat} ecran={<EcranDecor mode={p.ecran} t={t} p={p} />} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ plans

// Téléphone seul : 800 px de large, 1 400 px de haut (≈ 75 % de l'image), centré.
const L_GRAND = 800;
const Y_GRAND = 900;

const TelPlan: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const local = t - p.debut;
  const d = p.fin - p.debut;
  return (
    <>
      <FondFlou nom={p.clip!} debut={p.debut} duree={d} t={t} />
      <Telephone t={local} pose={POSES[p.pose ?? 0]} entree={p.entree} l={L_GRAND} y={Y_GRAND}>
        <EcranClip nom={p.clip!} debut={p.debut} duree={d} l={L_GRAND} t={local} zoom={[1.0, 1.08]} />
      </Telephone>
      {p.icone === 'camera' ? <IconeBarree type="camera" texte="CAMÉRA" t={t - T.camera} /> : null}
      {p.icone === 'acteur' ? <IconeBarree type="acteur" texte="ACTEUR" t={t - T.acteur} /> : null}
    </>
  );
};

const PlanTampon: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const local = t - p.debut;
  const d = p.fin - p.debut;
  const clips = ['j-concert', 'j-studio', 'j-foule'];
  return (
    <AbsoluteFill style={{background: COULEURS.nuit}}>
      <div style={{position: 'absolute', inset: 0, display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', filter: 'brightness(0.45) saturate(0.8)', transform: `scale(${1.05 + 0.04 * local})`}}>
        {clips.map((c, i) => (
          <div key={c} style={{width: 340, height: 604, borderRadius: 30, overflow: 'hidden', transform: `rotate(${(i - 1) * 4}deg) translateY(${(i - 1) * 30}px)`}}>
            <Clip nom={c} debut={p.debut} duree={d} style={{width: 340, height: 604}} />
          </div>
        ))}
      </div>
      <Tampon lignes={['AUCUNE', 'N’A ÉTÉ', 'FILMÉE']} t={local} y={800} taille={150} />
    </AbsoluteFill>
  );
};

const PlanMosaique: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const local = t - p.debut;
  const d = p.fin - p.debut;
  const clips = ['ia-parents', 'ia-vieux', 'ia-livreur', 'pub-sac-produit', 'ia-marchande', 'ia-bureau'];
  return (
    <AbsoluteFill>
      <FondAnime t={t} />
      {clips.map((c, i) => {
        const col = i % 3;
        const lig = Math.floor(i / 3);
        const a = i * 0.09;
        return (
          <div key={c} style={{position: 'absolute', left: 64 + col * 318, top: 250 + lig * 560, width: 300, height: 533, borderRadius: 26, overflow: 'hidden', boxShadow: `0 20px 50px #000c, 0 0 0 4px ${i % 2 ? COULEURS.or : COULEURS.violet}`, transform: `scale(${pop(local, a, 0.3)}) rotate(${(hasardSigne(i) * 3).toFixed(2)}deg)`}}>
            <Clip nom={c} debut={p.debut} duree={d} style={{width: 300, height: 533}} />
          </div>
        );
      })}
      {t >= T.intelligence - 0.05 ? (
        <div style={{position: 'absolute', left: 540, top: 800, transform: `translate(-50%, -50%) scale(${claque(t - T.intelligence + 0.05, 2.6)}) rotate(-6deg)`, fontFamily: POLICE, textAlign: 'center'}}>
          <div style={{padding: '14px 50px', borderRadius: 34, background: COULEURS.or, boxShadow: `0 30px 80px #000d, 0 0 80px ${COULEURS.or}aa, 0 0 0 8px ${COULEURS.nuit}`}}>
            <div style={{fontSize: 190, fontWeight: 800, color: COULEURS.nuit, lineHeight: 0.95}}>100 % IA</div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
const hasardSigne = (i: number) => [-1, 0.6, -0.4, 0.8, -0.7, 0.3][i % 6];

const Notification: React.FC<{t: number}> = ({t}) => {
  const e = interpolate(t, [0, 0.25], [-260, 0], {...clamp, easing: Easing.out(Easing.back(1.6))});
  return (
    <div style={{position: 'absolute', left: 90, width: 830, top: 300 + e, fontFamily: POLICE, opacity: prog(t, 0, 0.06)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 26, padding: '24px 30px', borderRadius: 34, background: '#ffffffee', boxShadow: '0 24px 60px #000c'}}>
        <div style={{width: 112, height: 112, borderRadius: 30, background: VERT, display: 'grid', placeItems: 'center', fontSize: 74, color: COULEURS.blanc, fontWeight: 800, transform: `scale(${pop(t, 0.15, 0.3)})`}}>✓</div>
        <div>
          <div style={{fontSize: 62, fontWeight: 800, color: COULEURS.nuit, lineHeight: 1.05}}>Paiement reçu</div>
          <div style={{fontSize: 38, fontWeight: 700, color: '#4b5070'}}>Commande : vidéo publicitaire</div>
        </div>
      </div>
    </div>
  );
};

const PlanPlein: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const local = t - p.debut;
  const d = p.fin - p.debut;
  const z = interpolate(local, [0, d], [1.14, 1.0], {...clamp, easing: Easing.out(Easing.quad)});
  return (
    <AbsoluteFill style={{background: COULEURS.nuit, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${z})`}}>
        <Clip nom={p.clip!} debut={p.debut} duree={d} style={{width: 1080, height: 1920}} />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #02062988 0%, transparent 28%, transparent 62%, #020629aa 100%)'}} />
      {p.etiquette ? <Etiquette texte={p.etiquette} t={local - 0.04} y={360} taille={p.etiquette.length > 10 ? 96 : 116} angle={p.etiquette.length % 2 ? -4 : 4} /> : null}
      {p.variante === 'paiement' ? <Notification t={t - T.payer + 0.05} /> : null}
    </AbsoluteFill>
  );
};

const K_TK = (L_GRAND - 28) / 720;

// Capture TikTok dans le téléphone : vues ou abonnés en très grand.
const PlanTikTok: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const local = t - p.debut;
  const d = p.fin - p.debut;
  const yasso = p.variante === 'yasso';
  return (
    <AbsoluteFill>
      <FondAnime t={t} teinte="#5a1240" accent="#ff3d7f" />
      <Telephone t={local} pose={yasso ? POSES[1] : POSES[0]} entree={yasso ? 'droite' : 'bas'} l={L_GRAND} x={540} y={Y_GRAND} lueur="#ff3d7f">
        <EcranClip nom={p.clip!} debut={p.debut} duree={d} l={L_GRAND} t={local} ratio={20 / 9} zoom={yasso ? [1.05, 1.25] : [1.0, 1.06]} foyer={yasso ? [0.2, 0.12] : [0.5, 0.2]}>
          {yasso ? (
            // cadre doré autour des statistiques (abonnés, j'aime), en pixels de la capture 720 × 1600
            <div style={{position: 'absolute', left: 6 * K_TK, top: 266 * K_TK, width: 380 * K_TK, height: 74 * K_TK, borderRadius: 12, border: `5px solid ${COULEURS.or}`, boxShadow: `0 0 30px ${COULEURS.or}`, opacity: prog(local, 0.1, 0.25)}} />
          ) : null}
        </EcranClip>
      </Telephone>
      {yasso ? (
        <>
          <GrandNombre valeur="2,5 M" legende="ABONNÉS" t={local - 0.08} x={420} y={380} taille={200} />
          <GrandNombre valeur="16,1 M" legende="J’AIME" t={local - 0.38} x={560} y={1220} taille={150} angle={4} couleur={COULEURS.blanc} />
        </>
      ) : (
        <>
          <GrandNombre valeur="7,1 M" legende="VUES" t={local - 0.12} x={720} y={420} taille={180} angle={5} />
          <GrandNombre valeur="5,8 M" legende="VUES" t={local - 0.45} x={330} y={1180} taille={150} angle={-5} couleur={COULEURS.blanc} />
        </>
      )}
    </AbsoluteFill>
  );
};

// Trois comptes : « tout le monde cherche quelqu'un pour faire ses vidéos ».
const PlanTrio: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const local = t - p.debut;
  const d = p.fin - p.debut;
  const tels = [
    {clip: 'tk-animations-grille', x: 250, rz: -8, a: 0.0},
    {clip: 'tk-yasso-grille', x: 830, rz: 8, a: 0.12},
    {clip: 'tk-issam-profil', x: 540, rz: 0, a: 0.24},
  ];
  return (
    <AbsoluteFill>
      <FondAnime t={t} teinte="#14306e" />
      {tels.map((k) => (
        <Telephone key={k.clip} t={local - k.a} pose={{rx: 3, ry: k.rz * -1.5, rz: k.rz}} entree="bas" l={420} x={k.x} y={k.clip === 'tk-issam-profil' ? 900 : 830}>
          <EcranClip nom={k.clip} debut={p.debut} duree={d} l={420} t={local} ratio={20 / 9} zoom={k.clip === 'tk-issam-profil' ? [1.15, 1.3] : [1.0, 1.04]} foyer={k.clip === 'tk-issam-profil' ? [0.2, 0.1] : [0.5, 0.3]} />
        </Telephone>
      ))}
      <GrandNombre valeur="734 K" legende="ABONNÉS" t={local - 0.4} x={540} y={420} taille={170} angle={-4} />
      <GrandNombre valeur="1,6 M" legende="VUES" t={local - 0.85} x={540} y={1240} taille={140} angle={4} couleur={COULEURS.blanc} />
    </AbsoluteFill>
  );
};

// « ces publicités, je les crée pour mes clients » : trois publicités réalisées pour des clients,
// l'une après l'autre, en grand, chacune avec l'étiquette « Réalisé pour un client ». La publicité
// de compléments n'apparaît que 1,1 s (passage sans aucun texte incrusté, son coupé).
const PUBS = [
  {clip: 'pub-sac-cliente', duree: 0.95, entree: 'gauche' as const, pose: POSES[0]},
  {clip: 'pub-beaute-interieur', duree: 0.95, entree: 'droite' as const, pose: POSES[1]},
  {clip: 'pub-complements', duree: 1.1, entree: 'bas' as const, pose: POSES[2]},
];
const PlanClients: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  let debut = p.debut;
  let k = 0;
  while (k < PUBS.length - 1 && t >= debut + PUBS[k].duree) debut += PUBS[k++].duree;
  const pub = PUBS[k];
  const local = t - debut;
  return (
    <AbsoluteFill>
      <FondFlou nom={pub.clip} debut={debut} duree={pub.duree} t={t} />
      <Telephone t={local} pose={pub.pose} entree={pub.entree} l={L_GRAND} y={Y_GRAND}>
        <EcranClip nom={pub.clip} debut={debut} duree={pub.duree} l={L_GRAND} t={local} />
      </Telephone>
      <Etiquette texte="Réalisé pour un client" t={local - 0.06} x={565} y={320} taille={66} fond={k === 1 ? COULEURS.or : COULEURS.blanc} angle={k % 2 ? 3 : -3} />
    </AbsoluteFill>
  );
};

const PlanCreer: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const local = t - p.debut;
  const d = p.fin - p.debut;
  const pct = Math.round(interpolate(local, [0.05, d * 0.7], [0, 100], clamp));
  return (
    <AbsoluteFill>
      <FondAnime t={t} teinte="#0f4a5a" />
      <Telephone t={local} pose={POSES[2]} entree="droite" l={L_GRAND} y={Y_GRAND}>
        <EcranClip nom="ia-livreur" debut={p.debut} duree={d} l={L_GRAND} t={local} />
        <div style={{position: 'absolute', inset: 0, background: '#020629', opacity: interpolate(local, [0, d * 0.7], [0.75, 0], clamp)}} />
        <div style={{position: 'absolute', left: 60, right: 60, top: 620, fontFamily: POLICE, textAlign: 'center', opacity: interpolate(local, [d * 0.6, d * 0.8], [1, 0], clamp)}}>
          <div style={{fontSize: 48, fontWeight: 800, color: COULEURS.blanc}}>Génération…</div>
          <div style={{marginTop: 10, height: 18, borderRadius: 9, background: '#ffffff33'}}>
            <div style={{width: `${pct}%`, height: '100%', borderRadius: 9, background: COULEURS.or}} />
          </div>
        </div>
      </Telephone>
      <Etiquette texte="1 · CRÉER" t={local - 0.05} y={330} taille={110} />
    </AbsoluteFill>
  );
};

const PlanMonter: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const local = t - p.debut;
  const d = p.fin - p.debut;
  const pistes = [
    ['#a177fd', '#feca26', '#ff6b9a', '#4dd0e1'],
    ['#25d366', '#25d366', '#25d366'],
  ];
  const tete = interpolate(local, [0, d], [80, 860], clamp);
  return (
    <AbsoluteFill>
      <FondAnime t={t} teinte="#4a2a0f" />
      <div style={{position: 'absolute', left: 70, width: 860, top: 440, height: 760, borderRadius: 40, background: '#0d1030f2', boxShadow: '0 30px 80px #000d, 0 0 0 4px #ffffff22', transform: `scale(${pop(local, 0, 0.3) * 1.16}) rotate(-2deg)`, transformOrigin: '50% 0', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 290, top: 30, width: 280, height: 420, borderRadius: 18, overflow: 'hidden', boxShadow: '0 0 0 3px #ffffff33'}}>
          <Clip nom="pub-sac-produit" debut={p.debut} duree={d} style={{width: 280, height: 420, objectFit: 'cover'}} />
        </div>
        {pistes.map((piste, k) => (
          <div key={k} style={{position: 'absolute', left: 30, top: 490 + k * 110, display: 'flex', gap: 10}}>
            {piste.map((c, i) => {
              const a = 0.05 + (k * 4 + i) * 0.06;
              const x = interpolate(local, [a, a + 0.18], [300, 0], {...clamp, easing: Easing.out(Easing.back(1.4))});
              return <div key={i} style={{width: k ? 260 : 190, height: 90, borderRadius: 14, background: c, opacity: prog(local, a, a + 0.08), transform: `translateX(${x}px)`, boxShadow: 'inset 0 -10px 0 #0003'}} />;
            })}
          </div>
        ))}
        <div style={{position: 'absolute', left: tete, top: 470, width: 6, height: 260, background: ROUGE, boxShadow: `0 0 16px ${ROUGE}`}} />
      </div>
      <Etiquette texte="2 · MONTER" t={local - 0.05} y={330} taille={110} />
    </AbsoluteFill>
  );
};

// Cartes de la formation, par-dessus Joseph (haut de l'image).
const CARTES = [
  {texte: 'De zéro', icone: '0', a: () => T.zero},
  {texte: 'Sans ton visage', icone: '🙈', a: () => T.visage},
  {texte: 'Des clients qui paient', icone: 'F', a: () => T.clients},
];
const CartesFormation: React.FC<{n: number; t: number}> = ({n, t}) => (
  <>
    {CARTES.slice(0, n).map((c, i) => {
      const a = c.a();
      const vu = t >= a - 0.05;
      return vu ? <Carte key={c.texte} texte={c.texte} icone={['0', '✓', '✓'][i]} t={t - a + 0.05} y={330 + i * 170} angle={[-4, 3, -2][i]} /> : null;
    })}
  </>
);

// ------------------------------------------------------------------ prix

const Cases: React.FC<{t: number; cochees: number[]; y: number; taille?: number}> = ({t, cochees, y, taille = 118}) => (
  <div style={{position: 'absolute', left: 540, top: y, transform: 'translateX(-50%)', display: 'grid', gridTemplateColumns: `repeat(5, ${taille}px)`, gap: 16}}>
    {Array.from({length: 10}).map((_, i) => {
      const a = cochees[i];
      const coche = a !== undefined && t >= a;
      return (
        <div key={i} style={{width: taille, height: taille, borderRadius: 24, background: coche ? ROUGE : '#ffffff1f', border: `5px solid ${coche ? '#ffb3b9' : '#ffffff66'}`, display: 'grid', placeItems: 'center', color: COULEURS.blanc, fontSize: taille * 0.6, fontWeight: 800, transform: `scale(${coche ? claque(t - a, 1.6) : 1})`}}>
          {coche ? '✓' : ''}
        </div>
      );
    })}
  </div>
);

const PlanPrix: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const barre = interpolate(t, [T.aujourdhui, T.aujourdhui + 0.22], [0, 1], clamp);
  const monte = interpolate(t, [T.p3600 - 0.25, T.p3600], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const y25 = interpolate(monte, [0, 1], [620, 280]);
  const s25 = interpolate(monte, [0, 1], [1, 0.55]);
  const yAuj = interpolate(monte, [0, 1], [880, 405]);
  const cochees = Array.from({length: 7}).map((_, i) => T.pour10 + 0.35 + i * 0.16);
  return (
    <AbsoluteFill style={{fontFamily: POLICE}}>
      <FondAnime t={t} teinte="#3a1f6e" />
      {t < T.p25000 - 0.05 ? <GrosMot texte="ELLE VAUT…" t={t - p.debut} y={560} taille={120} /> : null}
      {t >= T.p25000 - 0.05 ? (
        <div style={{position: 'absolute', left: 540, top: y25, transform: `translate(-50%, -50%) scale(${s25 * claque(t - T.p25000 + 0.05, 2)})`, fontSize: 220, fontWeight: 800, color: COULEURS.blanc, ...CONTOUR(16), whiteSpace: 'nowrap'}}>
          25 000 F
          <div style={{position: 'absolute', left: -20, top: '50%', width: `${barre * 108}%`, height: 30, borderRadius: 15, background: ROUGE, transform: 'rotate(-8deg)', boxShadow: '0 0 0 6px #020629'}} />
        </div>
      ) : null}
      {t >= T.aujourdhui - 0.05 ? (
        <div style={{position: 'absolute', left: 540, top: yAuj, transform: `translate(-50%, -50%) scale(${claque(t - T.aujourdhui + 0.05, 2.2) * (1 + 0.03 * Math.sin(t * 9))}) rotate(-3deg)`, padding: '10px 36px', borderRadius: 22, background: ROUGE, color: COULEURS.blanc, fontSize: 74, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 16px 40px #000c'}}>
          AUJOURD’HUI SEULEMENT
        </div>
      ) : null}
      {t >= T.p3600 - 0.03 ? (
        <>
          <div style={{position: 'absolute', left: 540, top: 590, width: 1300, height: 1300, marginLeft: -650, marginTop: -650, transform: `rotate(${t * 30}deg) scale(${pop(t, T.p3600, 0.4)})`, opacity: 0.35, background: `conic-gradient(${COULEURS.or}, transparent 8%, ${COULEURS.or} 16%, transparent 24%, ${COULEURS.or} 32%, transparent 40%, ${COULEURS.or} 48%, transparent 56%, ${COULEURS.or} 64%, transparent 72%, ${COULEURS.or} 80%, transparent 88%)`, borderRadius: '50%', maskImage: 'radial-gradient(circle, #000 20%, transparent 65%)'}} />
          <div style={{position: 'absolute', left: 540, top: 585, transform: `translate(-50%, -50%) scale(${claque(t - T.p3600 + 0.03, 2.8) * (1 + 0.025 * Math.sin(t * 7))}) rotate(-4deg)`, fontSize: 230, fontWeight: 800, color: COULEURS.or, ...CONTOUR(20), textShadow: `0 0 70px ${COULEURS.or}cc`, whiteSpace: 'nowrap'}}>
            3 600 F
          </div>
        </>
      ) : null}
      {t >= T.pour10 - 0.05 ? (
        <>
          <div style={{position: 'absolute', left: 540, top: 775, transform: `translate(-50%, -50%) scale(${claque(t - T.pour10 + 0.05, 2)})`, fontSize: 62, fontWeight: 800, color: COULEURS.blanc, whiteSpace: 'nowrap', ...CONTOUR(10)}}>
            <span style={{color: COULEURS.or}}>10</span> PLACES SEULEMENT
          </div>
          <Cases t={t} cochees={cochees} y={825} taille={104} />
        </>
      ) : null}
      {t >= T.offre - 0.05 ? (
        <div style={{position: 'absolute', left: 540, top: 1150, transform: `translate(-50%, -50%) scale(${claque(t - T.offre + 0.05, 2)}) rotate(2deg)`, display: 'flex', alignItems: 'center', gap: 20, padding: '10px 34px', borderRadius: 26, background: COULEURS.blanc, color: COULEURS.nuit, fontSize: 70, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 16px 40px #000c'}}>
          <Horloge t={t} /> FIN À <span style={{color: ROUGE}}>{t >= T.h2359 - 0.03 ? '23 H 59' : '…'}</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Horloge: React.FC<{t: number}> = ({t}) => (
  <svg width={80} height={80} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={17} fill="none" stroke={ROUGE} strokeWidth={4} />
    <line x1={20} y1={20} x2={20} y2={8} stroke={COULEURS.nuit} strokeWidth={3.5} strokeLinecap="round" transform={`rotate(${t * 360} 20 20)`} />
    <line x1={20} y1={20} x2={28} y2={20} stroke={COULEURS.nuit} strokeWidth={3.5} strokeLinecap="round" transform={`rotate(${t * 30} 20 20)`} />
  </svg>
);

// ------------------------------------------------------------------ WhatsApp

const PlanNumero: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const {fps} = useVideoConfig();
  const etat = etatJoseph(t, fps);
  const local = t - p.debut;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${1.0 + 0.02 * local})`, transformOrigin: '540px 1000px'}}>
        <Scene2D etat={etat} ecran={<div style={{position: 'absolute', left: 110, top: 240, width: 860, height: 600, borderRadius: 12, background: `radial-gradient(circle at 50% 40%, #0f5a33, ${COULEURS.nuit} 80%)`}} />} />
      </AbsoluteFill>
      <NumeroGeant t={t} groupes={T.n1} y={330} />
    </AbsoluteFill>
  );
};

const PlanBulle: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const local = t - p.debut;
  const texte = 'Coach Joseph, je suis prêt.';
  const n = Math.round(interpolate(t, [T.coach2 - 0.05, T.pret + 0.25], [0, texte.length], clamp));
  const envoye = t >= T.pret + 0.35;
  return (
    <AbsoluteFill style={{fontFamily: POLICE}}>
      <FondAnime t={t} teinte="#0f4a2c" accent="#4dff8f" />
      <Telephone t={local} pose={POSES[3]} entree="bas" l={700} y={830} lueur={VERT}>
        <div style={{position: 'absolute', inset: 0, background: '#e9e3d9'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 170, background: '#0f5132', display: 'flex', alignItems: 'flex-end', gap: 18, padding: '0 30px 22px'}}>
            <Img src={staticFile('marque/logo.jpg')} style={{width: 84, height: 84, borderRadius: 42}} />
            <div style={{color: COULEURS.blanc}}>
              <div style={{fontSize: 40, fontWeight: 800}}>Coach Joseph</div>
              <div style={{fontSize: 26, fontWeight: 600, opacity: 0.85}}>en ligne</div>
            </div>
          </div>
          {n > 0 ? (
            <div style={{position: 'absolute', right: 24, top: 300, maxWidth: 500, padding: '22px 28px', borderRadius: '34px 34px 8px 34px', background: '#d4f8c4', fontSize: 58, lineHeight: 1.12, fontWeight: 800, color: '#10241a', transform: `scale(${pop(t, T.coach2 - 0.05, 0.25)})`, transformOrigin: '100% 100%', boxShadow: '0 8px 18px #0003'}}>
              {texte.slice(0, n)}
              {!envoye && Math.floor(t * 4) % 2 === 0 ? <span style={{color: VERT}}>|</span> : null}
              <div style={{textAlign: 'right', fontSize: 34, color: envoye ? '#3a8fd8' : '#9aa0b0', fontWeight: 800}}>{envoye ? '✓✓' : '✓'}</div>
            </div>
          ) : null}
          <div style={{position: 'absolute', left: 20, right: 20, bottom: 30, display: 'flex', gap: 14, alignItems: 'center'}}>
            <div style={{flex: 1, height: 84, borderRadius: 42, background: COULEURS.blanc, fontSize: 34, fontWeight: 600, color: '#9aa0b0', display: 'flex', alignItems: 'center', paddingLeft: 28}}>Message</div>
            <div style={{width: 84, height: 84, borderRadius: 42, background: VERT, display: 'grid', placeItems: 'center', color: COULEURS.blanc, fontSize: 40, transform: `scale(${t >= T.pret + 0.25 && t < T.pret + 0.45 ? 1.25 : 1})`}}>➤</div>
          </div>
        </div>
      </Telephone>
      <Etiquette texte="DIS SIMPLEMENT :" t={local - 0.05} y={232} taille={62} fond={COULEURS.blanc} angle={-3} />
    </AbsoluteFill>
  );
};

const PlanRepete: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const {fps} = useVideoConfig();
  const local = t - p.debut;
  const etat = etatJoseph(t, fps);
  return (
    <AbsoluteFill>
      <FondAnime t={t} teinte="#0f4a2c" accent="#4dff8f" />
      <Etiquette texte="JE RÉPÈTE" t={local - 0.03} y={300} taille={96} angle={-4} />
      <NumeroGeant t={t} groupes={T.n2} y={500} />
      <Medaillon etat={etat} t={t} entree={p.debut} />
    </AbsoluteFill>
  );
};

const PlanFini: React.FC<{p: Plan; t: number}> = ({p, t}) => {
  const local = t - p.debut;
  const toutes = Array.from({length: 10}).map((_, i) => T.places + i * 0.07);
  return (
    <AbsoluteFill style={{fontFamily: POLICE}}>
      <FondAnime t={t} teinte="#6e1f2a" accent={ROUGE} />
      <GrosMot texte="QUAND LES 10 PLACES" t={local} y={290} taille={96} />
      {t >= w('sont') - 0.05 ? <GrosMot texte="SONT PRISES…" t={t - w('sont') + 0.05} y={420} taille={110} couleur={COULEURS.or} angle={2} /> : null}
      <Cases t={t} cochees={toutes} y={620} taille={130} />
      {t >= T.fini - 0.04 ? <Tampon lignes={['C’EST FINI']} t={t - T.fini + 0.04} y={1110} taille={150} /> : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ sous-titres mot par mot

const BLOCS = blocsSousTitres(MOTS, MOTS_CLES, LIAISONS).map((b) => b);
const MOTS_BLOCS = (() => {
  let i = 0;
  return BLOCS.map((b) => b.mots.map((m) => ({...m, ...MOTS[i++], texteAffiche: m.texte})));
})();

const SousTitres: React.FC<{t: number; bas: number}> = ({t, bas}) => {
  const k = BLOCS.findIndex((b, j) => t >= b.debut - 0.05 && t < Math.min(b.fin + 0.4, BLOCS[j + 1]?.debut ?? Infinity));
  if (k < 0) return null;
  const mots = MOTS_BLOCS[k];
  const b = BLOCS[k];
  return (
    <div style={{position: 'absolute', left: 50, width: 880, bottom: 1920 - bas, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', columnGap: 28, rowGap: 2, fontFamily: POLICE, fontWeight: 800, lineHeight: 1.08, transform: `scale(${interpolate(t, [b.debut - 0.05, b.debut + 0.08], [0.85, 1], clamp)})`, transformOrigin: '50% 100%'}}>
      {mots.map((m, j) => {
        const passe = t >= m.debut - 0.03;
        const actif = passe && t < (mots[j + 1] ? mots[j + 1].debut - 0.03 : b.fin + 0.4);
        const cle = !!m.couleur;
        return (
          <span key={j} style={{display: 'inline-block', fontSize: cle ? 84 : 72, color: cle ? COULEURS.or : COULEURS.blanc, opacity: passe ? 1 : 0.5, ...CONTOUR(14), textShadow: '0 6px 16px #000c', transform: `scale(${(cle && passe ? pop(t, m.debut - 0.03, 0.2) : 1) * (actif ? 1.08 : 1)})`}}>
            {m.texteAffiche}
          </span>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ son

const IMPACTS: number[] = [
  T.filmee + 0.12, T.camera, T.acteur, T.intelligence, T.payer, T.p25000, T.p3600, T.fini,
];

const EVENEMENTS: EvenementSonore[] = (() => {
  const e: EvenementSonore[] = [];
  const s = (t: number, son: EvenementSonore['son'], volume: number) => e.push({t: Math.max(0, t), son, volume});
  s(0, 'boum', 0.32);
  PLANS.forEach((p, i) => {
    if (i > 0 && p.type !== 'carte') s(p.debut - 0.05, 'whoosh', 0.13);
    if (p.etiquette) s(p.debut + 0.02, 'impact', 0.17);
  });
  s(T.filmee + 0.12, 'tampon', 0.38);
  s(T.filmee + 0.12, 'boum', 0.22);
  s(T.camera, 'impact', 0.22);
  s(T.acteur, 'impact', 0.22);
  for (let k = 0; k < 6; k++) s(PLANS[6].debut + k * 0.09, 'pop', 0.1);
  s(T.intelligence - 0.05, 'boum', 0.26);
  s(PLANS[9].debut + 0.12, 'impact', 0.18);
  s(PLANS[9].debut + 0.45, 'pop', 0.16);
  s(PLANS[10].debut + 0.08, 'impact', 0.2);
  s(PLANS[10].debut + 0.38, 'pop', 0.16);
  s(T.payer - 0.05, 'pieces', 0.26);
  s(T.payer + 0.12, 'ding', 0.14);
  s(PLANS[17].debut + 0.4, 'impact', 0.18);
  s(PLANS[17].debut + 0.85, 'pop', 0.15);
  s(T.coach - 0.05, 'impact', 0.18);
  s(T.an2023, 'boum', 0.2);
  s(T.mille - 0.05, 'impact', 0.2);
  for (const a of [0, 0.95, 1.9]) {
    if (a) s(PLANS[21].debut + a - 0.05, 'whoosh', 0.13);
    s(PLANS[21].debut + a + 0.08, 'impact', 0.17);
  }
  s(T.tout2, 'pop', 0.16);
  for (let k = 0; k < 3; k++) s(PLANS[23].debut + 0.15 + k * 0.28 + 0.2, 'ding', 0.1);
  for (const c of CARTES) s(c.a() - 0.05, 'impact', 0.2);
  s(PLANS[26].debut + 0.05, 'impact', 0.16);
  s(PLANS[27].debut + 0.05, 'impact', 0.16);
  s(T.p25000 - 0.05, 'boum', 0.26);
  s(T.aujourdhui, 'impact', 0.2);
  s(T.p3600 - 0.03, 'boum', 0.3);
  s(T.p3600, 'succes', 0.14);
  s(T.pour10 - 0.05, 'impact', 0.18);
  for (let k = 0; k < 7; k++) s(T.pour10 + 0.35 + k * 0.16, 'clic', 0.16);
  s(T.offre - 0.05, 'impact', 0.2);
  s(T.whatsapp, 'pop', 0.18);
  for (const a of [...T.n1, ...T.n2]) s(a - 0.02, 'impact', 0.17);
  for (let k = 0; k < 12; k++) s(T.coach2 + k * 0.12, 'clic', 0.1);
  s(T.pret + 0.35, 'ding', 0.16);
  for (let k = 0; k < 10; k++) s(T.places + k * 0.07, 'clic', 0.12);
  s(T.fini - 0.04, 'tampon', 0.38);
  s(DEBUT_CARTE - 1.6, 'riser', 0.2);
  s(DEBUT_CARTE, 'boum', 0.3);
  s(DEBUT_CARTE + 0.05, 'fin', 0.24);
  for (const a of [0.8, 1.15]) s(DEBUT_CARTE + a, 'ding', 0.15);
  return e.sort((a, b) => a.t - b.t);
})();

// Musique : voix « radio » à -16 LUFS jouée à 0,8 (≈ -17,9 LUFS) ; musique puissante -15,3 LUFS.
// 20 LU sous la voix pendant la parole (0,074), 12 LU dans les pauses (0,186) ; ouverture et carte plus fortes.
const SOUS_PAROLE = 0.074;
const PAUSE = 0.186;
const GAINS_MUSIQUE: number[] = (() => {
  const n = Math.round(DUREE * FORMAT.fps) + 1;
  const debutVoix = Math.round(DEBUT_VOIX * FORMAT.fps);
  const brut = Array.from({length: n}, (_, f) => {
    const i = f - debutVoix;
    let parle = false;
    for (let k = i - 5; k <= i + 5; k++) if (k >= 0 && k < BOUCHE.length && BOUCHE[k] > 0.05) parle = true;
    return parle ? SOUS_PAROLE : PAUSE;
  });
  // lissage (≈ 0,2 s) pour que la musique ne pompe pas
  return brut.map((_, f) => {
    let s = 0, c = 0;
    for (let k = f - 3; k <= f + 3; k++) if (k >= 0 && k < n) { s += brut[k]; c++; }
    return s / c;
  });
})();

// Secousse de caméra sur les impacts.
const secousse = (t: number) => {
  let a = 0;
  for (const i of IMPACTS) {
    const d = t - i;
    if (d >= 0 && d < 0.35) a = Math.max(a, Math.exp(-d * 12));
  }
  return {x: Math.sin(t * 95) * 16 * a, y: Math.cos(t * 83) * 12 * a, r: Math.sin(t * 70) * 0.8 * a};
};

// ------------------------------------------------------------------ composition

// `piste` : rendu d'une seule piste sonore pour les contrôles d'écoute (voix, musique, effets).
export type PropsPub2 = {piste: 'tout' | 'voix' | 'musique' | 'effets'};
export const Pub2: React.FC<PropsPub2> = ({piste = 'tout'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const p = planA(t);
  const local = t - p.debut;
  const sec = secousse(t);
  // transition rapide : léger flou et zoom en entrée de plan
  const flou = interpolate(local, [0, 0.1], [10, 0], clamp);
  const bandeau = t >= T.elle - 0.06 && t < DEBUT_CARTE;
  const sansST = p.type === 'carte' || p.type === 'numero' || p.type === 'repete' || p.type === 'fini' || p.type === 'tampon' || p.type === 'bulle';
  const eclair = (a: number, o: number) => (t >= a ? interpolate(t - a, [0, 0.07], [o, 0], clamp) : 0);
  const flash = Math.max(eclair(T.filmee + 0.12, 0.7), eclair(DEBUT_CARTE, 0.8), eclair(T.p3600, 0.5));
  return (
    <AbsoluteFill style={{background: COULEURS.nuit}}>
      <AbsoluteFill style={{transform: `translate(${sec.x}px, ${sec.y}px) rotate(${sec.r}deg)`, filter: flou > 0.3 ? `blur(${flou}px)` : undefined}}>
        {p.type === 'tel' ? <TelPlan p={p} t={t} /> : null}
        {p.type === 'tampon' ? <PlanTampon p={p} t={t} /> : null}
        {p.type === 'mosaique' ? <PlanMosaique p={p} t={t} /> : null}
        {p.type === 'plein' ? <PlanPlein p={p} t={t} /> : null}
        {p.type === 'tiktok' ? <PlanTikTok p={p} t={t} /> : null}
        {p.type === 'trio' ? <PlanTrio p={p} t={t} /> : null}
        {p.type === 'joseph' ? <PlanJoseph p={p} t={t} /> : null}
        {p.type === 'joseph' && p.compteur ? <Compteur t={t} /> : null}
        {p.type === 'joseph' && p.cartes ? <CartesFormation n={p.cartes} t={t} /> : null}
        {p.type === 'clients' ? <PlanClients p={p} t={t} /> : null}
        {p.type === 'creer' ? <PlanCreer p={p} t={t} /> : null}
        {p.type === 'monter' ? <PlanMonter p={p} t={t} /> : null}
        {p.type === 'prix' ? <PlanPrix p={p} t={t} /> : null}
        {p.type === 'numero' ? <PlanNumero p={p} t={t} /> : null}
        {p.type === 'bulle' ? <PlanBulle p={p} t={t} /> : null}
        {p.type === 'repete' ? <PlanRepete p={p} t={t} /> : null}
        {p.type === 'fini' ? <PlanFini p={p} t={t} /> : null}
        {p.type === 'carte' ? <CarteFinale t={local} /> : null}
      </AbsoluteFill>
      {/* petit logo discret pendant toute la vidéo (zone sûre) ; en grand seulement sur la carte finale */}
      {p.type !== 'carte' ? <LogoCoin position={{x: 30, y: 205, taille: 84}} /> : null}
      {bandeau ? <BandeauWhatsApp t={t - T.elle + 0.06} /> : null}
      {!sansST ? <SousTitres t={t} bas={bandeau ? 1385 : 1505} /> : null}
      {flash > 0 ? <AbsoluteFill style={{background: COULEURS.blanc, opacity: flash}} /> : null}

      <Sequence from={Math.round(DEBUT_VOIX * fps)} layout="none">
        <Audio src={staticFile('pub2/voix-radio.wav')} volume={piste === 'tout' || piste === 'voix' ? 0.8 : 0} />
      </Sequence>
      <Audio
        src={staticFile('serie/musique-puissante.wav')}
        volume={(f) => {
          const tt = f / fps;
          let v = GAINS_MUSIQUE[Math.min(f, GAINS_MUSIQUE.length - 1)];
          if (tt < DEBUT_VOIX) v = interpolate(tt, [0, DEBUT_VOIX - 0.1, DEBUT_VOIX], [0.45, 0.45, SOUS_PAROLE], clamp);
          if (tt >= DEBUT_CARTE - 0.3) v = interpolate(tt, [DEBUT_CARTE - 0.3, DEBUT_CARTE], [v, 0.42], clamp);
          return (piste === 'tout' || piste === 'musique' ? 1 : 0) * v * interpolate(f, [DUREE_PUB2 - 36, DUREE_PUB2 - 1], [1, 0], clamp);
        }}
      />
      {piste === 'tout' || piste === 'effets' ? <Effets evenements={EVENEMENTS} /> : null}
    </AbsoluteFill>
  );
};

// « +1 000 personnes formées » : compteur qui défile, en haut de l'image.
const Compteur: React.FC<{t: number}> = ({t}) => {
  const a = T.mille - 0.05;
  const v = Math.round(interpolate(t, [a, a + 0.7], [0, 1000], {...clamp, easing: Easing.out(Easing.cubic)}));
  return (
    <div style={{position: 'absolute', left: 540, top: 430, transform: `translate(-50%, -50%) scale(${t >= a ? claque(t - a, 2) : 0}) rotate(-4deg)`, fontFamily: POLICE, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{fontSize: 200, fontWeight: 800, color: COULEURS.or, lineHeight: 0.95, ...CONTOUR(18), textShadow: `0 0 60px ${COULEURS.or}aa`, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
        +{v.toLocaleString('fr-FR').replace(/ | /g, ' ')}
      </div>
      <div style={{marginTop: 6, padding: '6px 30px', borderRadius: 18, background: COULEURS.blanc, color: COULEURS.nuit, fontSize: 64, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 12px 30px #000b'}}>
        personnes formées
      </div>
      <div style={{position: 'absolute', left: -60, top: -40}}>
        <Etoile taille={60} couleur={COULEURS.or} />
      </div>
    </div>
  );
};
