import {AbsoluteFill, Img, staticFile} from 'remotion';
import {CadreEcran} from '../commun/Ecran';
import {LogoCoin} from '../commun/LogoCoin';
import {COULEURS, POLICE, Pose} from '../theme';
import {EtatDouble, Viseme, etatDePose} from '../v2d/Double2D';
import {BrasPatricia2D, ComptoirAccueil2D, DecorAccueil2D, Patricia2D, posesPatricia} from '../v2d/Patricia2D';
import {Scene2D} from '../v2d/Scene2D';

// Aperçus du double de Patricia (épisode 4), à valider avant toute animation.

export const etatPatricia = (pose: Pose): EtatDouble => ({...etatDePose(pose), bras: posesPatricia(pose)});

const EcranAccueil: React.FC = () => (
  <CadreEcran titre="Lomé IA School" droite="Tutoriel">
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, fontFamily: POLICE}}>
      <Img src={staticFile('marque/logo.jpg')} style={{width: 250, height: 250, borderRadius: 44, boxShadow: `0 0 50px ${COULEURS.or}88`}} />
      <div style={{color: COULEURS.blanc, fontWeight: 800, fontSize: 56, lineHeight: 1.1}}>
        Affiche
        <br />
        <span style={{color: COULEURS.or}}>publicitaire</span>
      </div>
    </div>
  </CadreEcran>
);

// Écran sans texte (gros plans : le haut de l'écran sort de l'image).
export const EcranVide: React.FC = () => (
  <CadreEcran titre="" droite="">
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 60%, ${COULEURS.violet}55, transparent 70%)`}} />
  </CadreEcran>
);

export const ScenePatricia: React.FC<{etat: EtatDouble; ecran?: React.ReactNode; enseigne?: boolean; children?: React.ReactNode}> = ({etat, ecran, enseigne = true, children}) => (
  <AbsoluteFill style={{background: COULEURS.nuit}}>
    <DecorAccueil2D enseigne={enseigne} />
    <AbsoluteFill>
      {ecran ?? <EcranAccueil />}
    </AbsoluteFill>
    <Patricia2D etat={etat} />
    <ComptoirAccueil2D logo={!enseigne} />
    <BrasPatricia2D etat={etat} />
    {children}
  </AbsoluteFill>
);

const CADRES = {
  large: {s: 1, o: '540px 1100px'},
  moyen: {s: 1.5, o: '540px 1180px'},
  gros: {s: 2.25, o: '540px 1120px'},
};

export type ApercuPatriciaProps = {pose: Pose; cadre: keyof typeof CADRES};

export const ApercuPatricia: React.FC<ApercuPatriciaProps> = ({pose, cadre}) => {
  const c = CADRES[cadre];
  return (
    <AbsoluteFill style={{background: COULEURS.nuit, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${c.s})`, transformOrigin: c.o}}>
        {/* en gros plan : pas d'enseigne (elle serait coupée) et écran sans texte */}
        <ScenePatricia etat={etatPatricia(pose)} enseigne={cadre !== 'gros'} ecran={cadre === 'gros' ? <EcranVide /> : undefined} />
      </AbsoluteFill>
      {/* l'écran du décor affiche déjà le grand logo : pas de petit logo dans le coin */}
      {cadre === 'gros' ? <LogoCoin /> : null}
    </AbsoluteFill>
  );
};

// Joseph et Patricia côte à côte, en plan large, pour comparer les styles.
export const ComparaisonDoubles: React.FC = () => {
  const etiquette = (texte: string) => (
    <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 70, color: COULEURS.blanc, textShadow: '0 6px 20px #000'}}>{texte}</div>
  );
  return (
    <AbsoluteFill style={{background: COULEURS.nuit, flexDirection: 'row'}}>
      <div style={{position: 'relative', width: 1080, height: 1920, overflow: 'hidden'}}>
        <Scene2D etat={etatDePose({expression: 'sourire', geste: 'explique', bouche: 0})} />
        {etiquette('Joseph')}
      </div>
      <div style={{position: 'relative', width: 1080, height: 1920, overflow: 'hidden'}}>
        <ScenePatricia etat={etatPatricia({expression: 'sourire', geste: 'explique', bouche: 0})} />
        {etiquette('Patricia')}
      </div>
    </AbsoluteFill>
  );
};

// Planche des 9 formes de bouche (Rhubarb) et des gestes.
const VISEMES: Viseme[] = ['X', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const PlanchePatricia: React.FC = () => (
  <AbsoluteFill style={{background: COULEURS.nuit, fontFamily: POLICE}}>
    <div style={{display: 'flex', flexWrap: 'wrap', width: 1080, gap: 0}}>
      {VISEMES.map((v) => (
        <div key={v} style={{position: 'relative', width: 360, height: 300, overflow: 'hidden', borderRight: '2px solid #000', borderBottom: '2px solid #000'}}>
          <div style={{position: 'absolute', left: -540 * 2.6 + 180, top: -1160 * 2.6 + 150, width: 1080, height: 1920, transform: 'scale(2.6)', transformOrigin: '0 0'}}>
            <Patricia2D etat={{...etatPatricia({expression: 'neutre', geste: 'repos', bouche: 0.4}), viseme: v, fermeG: 0.12, fermeD: 0.12}} />
          </div>
          <div style={{position: 'absolute', left: 14, top: 8, color: COULEURS.or, fontSize: 48, fontWeight: 800}}>{v}</div>
        </div>
      ))}
    </div>
    <div style={{display: 'flex', width: 1080, height: 1020}}>
      {(['designe', 'pouce', 'explique'] as const).map((g) => (
        <div key={g} style={{position: 'relative', width: 360, height: 1020, overflow: 'hidden', borderRight: '2px solid #000'}}>
          <div style={{position: 'absolute', left: -360, top: -560, width: 1080, height: 1920, transform: 'scale(0.62)', transformOrigin: '540px 1350px'}}>
            <ScenePatricia etat={etatPatricia({expression: 'sourire', geste: g, bouche: 0})} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 20, textAlign: 'center', color: COULEURS.blanc, fontSize: 40, fontWeight: 800}}>
            {{designe: 'Montrer l’écran', pouce: 'Pouce levé', explique: 'Mains ouvertes'}[g]}
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
