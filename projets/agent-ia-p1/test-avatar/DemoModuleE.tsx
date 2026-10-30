import {AbsoluteFill} from 'remotion';
import {COULEURS, POLICE} from '../theme';
import {etatDePose} from '../v2d/Double2D';
import {Logo, Medaillon} from './TestAvatar';

// Démonstration animée du module E (partie 57 du script), dessinée : aucune capture réelle, aucun logo d'application.
// Quatre étapes : la page du guide, la fiche copiée, la discussion avec le chef de projet, le module complété.
// Images fixes d'abord (à valider par Joseph), animation ensuite.

export type EtapeDemo = 1 | 2 | 3 | 4;

const VERT = '#22c55e';
const PAPIER = '#f6f4ee';
const ENCRE = '#1b2142';

const RUBRIQUES = [
  {titre: 'La tâche à remplacer', exemple: 'Faire chaque soir le point des ventes de la journée.'},
  {titre: 'Ce qui la déclenche', exemple: 'Tous les jours à 20 h.'},
  {titre: 'Les étapes, dans l’ordre', exemple: 'Lire les commandes, additionner, comparer à la veille, écrire un résumé.'},
  {titre: 'Les outils à relier', exemple: 'Le fichier des commandes, mon e-mail.'},
  {titre: 'Ce que vous recevez', exemple: 'Un e-mail court avec le total et les 3 meilleurs produits.'},
  {titre: 'En cas d’erreur', exemple: 'Un e-mail d’alerte qui explique le problème.'},
];
const FICHE = ['Tâche à remplacer :', 'Ce qui la déclenche :', 'Étapes dans l’ordre :', 'Outils à relier :', 'Ce que je reçois :', 'En cas d’erreur :'];
// Module E rempli pour Kekeli, d'après les décisions du cas pratique (cahier des charges et 3 corrections).
const KEKELI = [
  ['Tâche à remplacer', 'Écrire le code d’un site web à la place de l’utilisateur.'],
  ['Ce qui la déclenche', 'L’utilisateur décrit son site en français.'],
  ['Étapes dans l’ordre', 'Comprendre la demande, présenter un plan, construire, tester, mettre en ligne.'],
  ['Outils à relier', 'Un ordinateur virtuel isolé, le dépôt GitHub, l’hébergement des sites.'],
  ['Ce que je reçois', 'Le lien du site en ligne et un compte rendu simple.'],
  ['En cas d’erreur', 'L’agent corrige seul ; sinon, il prévient l’utilisateur.'],
];

const TEL = {x: 330, y: 120, l: 430, h: 840};

const Telephone: React.FC<{children: React.ReactNode; fond?: string}> = ({children, fond = PAPIER}) => (
  <div style={{position: 'absolute', left: TEL.x, top: TEL.y, width: TEL.l, height: TEL.h, borderRadius: 52, background: '#0d0f1a', padding: 14,
    boxShadow: '0 0 0 3px #2b3152, 0 30px 60px #000c'}}>
    <div style={{width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden', background: fond, position: 'relative', fontFamily: POLICE}}>
      <div style={{position: 'absolute', top: 12, left: '50%', marginLeft: -40, width: 80, height: 22, borderRadius: 11, background: '#0d0f1a'}} />
      <div style={{position: 'absolute', inset: '48px 0 0 0'}}>{children}</div>
    </div>
  </div>
);

const Panneau: React.FC<{titre: string; children: React.ReactNode; haut?: number}> = ({titre, children, haut = 210}) => (
  <>
    <div style={{position: 'absolute', left: 900, top: haut - 64, fontFamily: POLICE, fontWeight: 800, fontSize: 34, color: COULEURS.or}}>{titre}</div>
    <div style={{position: 'absolute', left: 900, top: haut, width: 940, borderRadius: 24, background: PAPIER, color: ENCRE, fontFamily: POLICE,
      boxShadow: `0 0 0 5px ${COULEURS.or}, 0 30px 70px #000d`, padding: '30px 38px'}}>
      {children}
    </div>
  </>
);

const Fleche: React.FC<{de: [number, number]; a: [number, number]}> = ({de, a}) => (
  <svg style={{position: 'absolute', left: 0, top: 0}} width={1920} height={1080}>
    <defs>
      <marker id="pointe" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
        <path d="M0,0 L10,5 L0,10 Z" fill={COULEURS.or} />
      </marker>
    </defs>
    <path d={`M ${de[0]} ${de[1]} C ${de[0] + 90} ${de[1]}, ${a[0] - 90} ${a[1]}, ${a[0]} ${a[1]}`} fill="none" stroke={COULEURS.or} strokeWidth={6}
      strokeLinecap="round" markerEnd="url(#pointe)" />
  </svg>
);

const Cadre: React.FC<{y: number; h: number}> = ({y, h}) => (
  <div style={{position: 'absolute', left: 10, right: 10, top: y, height: h, border: `4px solid ${COULEURS.or}`, borderRadius: 12, boxShadow: `0 0 18px ${COULEURS.or}88`}} />
);

const Bulle: React.FC<{moi?: boolean; children: React.ReactNode; accent?: boolean}> = ({moi, children, accent}) => (
  <div style={{alignSelf: moi ? 'flex-end' : 'flex-start', maxWidth: '86%', background: moi ? '#2b3a8f' : '#ffffff', color: moi ? '#fff' : ENCRE,
    borderRadius: 18, padding: '10px 14px', fontSize: 15, lineHeight: 1.35, boxShadow: accent ? `0 0 0 3px ${COULEURS.or}` : '0 2px 6px #0002'}}>
    {children}
  </div>
);

// Étape 1 : la page « Module E » du guide.
const PageGuide: React.FC = () => (
  <>
    <Telephone>
      <div style={{padding: '18px 22px', color: ENCRE}}>
        <div style={{fontSize: 13, fontWeight: 700, color: '#8a7a3a', letterSpacing: 2}}>GUIDE · PRÉPARER SON AGENT IA</div>
        <div style={{fontSize: 22, fontWeight: 800, marginTop: 8, lineHeight: 1.15}}>Module E : agent d’automatisation</div>
        <div style={{fontSize: 13, marginTop: 6, color: '#555'}}>Pour remplacer une tâche répétitive que vous faites vous-même.</div>
        {RUBRIQUES.map((r) => (
          <div key={r.titre} style={{marginTop: 14}}>
            <div style={{fontSize: 15, fontWeight: 800}}>{r.titre}</div>
            <div style={{fontSize: 12.5, color: '#555', marginTop: 2}}>Exemple : {r.exemple}</div>
          </div>
        ))}
      </div>
      <Cadre y={8} h={98} />
    </Telephone>
    <Fleche de={[TEL.x + TEL.l + 10, TEL.y + 140]} a={[890, 300]} />
    <Panneau titre="📘 Le module E, dans votre guide">
      <div style={{fontSize: 46, fontWeight: 800, lineHeight: 1.1}}>Agent d’automatisation</div>
      <div style={{fontSize: 28, marginTop: 10, color: '#444'}}>Il fait à votre place une tâche répétitive.</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 26px', marginTop: 24}}>
        {RUBRIQUES.map((r, i) => (
          <div key={r.titre} style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 27, fontWeight: 700}}>
            <span style={{flex: 'none', width: 40, height: 40, borderRadius: 20, background: COULEURS.or, color: COULEURS.nuit, display: 'grid', placeItems: 'center', fontWeight: 800}}>{i + 1}</span>
            {r.titre}
          </div>
        ))}
      </div>
    </Panneau>
  </>
);

// Étape 2 : la fiche vierge, sélectionnée et copiée.
const FicheCopiee: React.FC = () => (
  <>
    <Telephone>
      <div style={{padding: '18px 22px', color: ENCRE}}>
        <div style={{fontSize: 13, fontWeight: 700, color: '#8a7a3a', letterSpacing: 2}}>LES FICHES VIERGES À COPIER</div>
        <div style={{marginTop: 14, background: '#cfe0ff', borderRadius: 8, padding: '10px 12px', fontSize: 15, lineHeight: 1.7}}>
          <div style={{fontWeight: 800}}>MODULE E : AUTOMATISATION</div>
          {FICHE.map((l) => <div key={l}>{l}</div>)}
        </div>
        <div style={{display: 'flex', gap: 8, marginTop: 10}}>
          {['Copier', 'Tout sélectionner', 'Partager'].map((b, i) => (
            <div key={b} style={{background: i === 0 ? ENCRE : '#e4e2da', color: i === 0 ? '#fff' : ENCRE, borderRadius: 10, padding: '8px 12px', fontSize: 14, fontWeight: 700,
              boxShadow: i === 0 ? `0 0 0 3px ${COULEURS.or}` : 'none'}}>{b}</div>
          ))}
        </div>
        <div style={{marginTop: 26, fontSize: 15, fontWeight: 800, color: '#999'}}>MODULE F : VOCAL</div>
        <div style={{fontSize: 14, color: '#aaa', lineHeight: 1.7}}>Voix :<br />Langues :<br />Durée :</div>
      </div>
    </Telephone>
    <Fleche de={[TEL.x + TEL.l + 10, TEL.y + 160]} a={[890, 330]} />
    <Panneau titre="📋 Copiez la fiche vierge du module E">
      <div style={{fontSize: 34, fontWeight: 800}}>MODULE E : AUTOMATISATION</div>
      {FICHE.map((l) => <div key={l} style={{fontSize: 31, lineHeight: 1.6, borderBottom: '2px dashed #cfcab8'}}>{l}</div>)}
      <div style={{marginTop: 18, display: 'inline-block', background: VERT, color: '#fff', fontWeight: 800, fontSize: 28, borderRadius: 14, padding: '8px 20px'}}>✓ Copié</div>
    </Panneau>
  </>
);

// Étape 3 : la discussion avec le chef de projet (« je ne sais pas » mis en valeur).
const Discussion: React.FC = () => (
  <>
    <Telephone fond="#eef0f6">
      <div style={{padding: '8px 14px 0', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #d6d9e6', paddingBottom: 10}}>
        <div style={{width: 34, height: 34, borderRadius: 17, background: COULEURS.violet, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800}}>C</div>
        <div><div style={{fontSize: 15, fontWeight: 800, color: ENCRE}}>Claude · chef de projet</div><div style={{fontSize: 11, color: '#777'}}>Projet Kekeli</div></div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: 14}}>
        <Bulle moi>Complète mon cahier des charges avec ce module.<br /><span style={{opacity: 0.8, fontSize: 13}}>MODULE E : AUTOMATISATION · Tâche à remplacer : … · Ce qui la déclenche : …</span></Bulle>
        <Bulle>Très bien. Question 1 sur 3 : quelle tâche Kekeli doit-il faire à la place de l’utilisateur ?</Bulle>
        <Bulle moi>Écrire le code d’un site web, à partir de sa description en français.</Bulle>
        <Bulle>Question 2 sur 3 : quels outils faut-il relier ? A. un ordinateur virtuel isolé · B. le dépôt GitHub · C. les deux</Bulle>
        <Bulle moi accent>Je ne sais pas, propose-moi la meilleure option.</Bulle>
        <Bulle>Je recommande C : un ordinateur virtuel isolé pour la sécurité, et le dépôt GitHub pour garder le code.</Bulle>
      </div>
    </Telephone>
    <Fleche de={[TEL.x + TEL.l + 10, TEL.y + 600]} a={[890, 420]} />
    <Panneau titre="💬 Vous ne savez pas ? Dites-le !" haut={260}>
      <div style={{fontSize: 30, color: '#555'}}>Le chef de projet pose ses questions, une par une.</div>
      <div style={{marginTop: 20, background: '#2b3a8f', color: '#fff', borderRadius: 22, padding: '20px 26px', fontSize: 38, fontWeight: 700, lineHeight: 1.25,
        boxShadow: `0 0 0 5px ${COULEURS.or}`}}>« Je ne sais pas, propose-moi la meilleure option. »</div>
      <div style={{marginTop: 20, fontSize: 30, fontWeight: 700}}>➜ Il propose la solution la plus simple et la moins chère.</div>
    </Panneau>
  </>
);

// Étape 4 : le module E complété pour Kekeli.
const Resultat: React.FC = () => (
  <>
    <Telephone fond="#eef0f6">
      <div style={{display: 'flex', flexDirection: 'column', gap: 10, padding: 14}}>
        <Bulle>Voici votre cahier des charges, complété avec le module E :</Bulle>
        <div style={{background: '#fff', borderRadius: 14, padding: '12px 14px', color: ENCRE, fontSize: 13, lineHeight: 1.45, boxShadow: `0 0 0 3px ${COULEURS.or}`}}>
          <div style={{fontWeight: 800, fontSize: 15}}>MODULE E : AUTOMATISATION</div>
          {KEKELI.map(([k, v]) => <div key={k} style={{marginTop: 5}}><b>{k} :</b> {v}</div>)}
        </div>
      </div>
    </Telephone>
    <Fleche de={[TEL.x + TEL.l + 10, TEL.y + 260]} a={[890, 300]} />
    <Panneau titre="✅ Le module E de Kekeli est complété" haut={190}>
      {KEKELI.map(([k, v]) => (
        <div key={k} style={{display: 'flex', gap: 14, alignItems: 'baseline', marginTop: 8}}>
          <span style={{color: VERT, fontSize: 30, fontWeight: 800}}>✓</span>
          <div style={{fontSize: 25, lineHeight: 1.3}}><b>{k} :</b> {v}</div>
        </div>
      ))}
    </Panneau>
  </>
);

export const DemoModuleE: React.FC<{etape: EtapeDemo}> = ({etape}) => {
  const etat = etatDePose({expression: 'neutre', geste: 'repos', bouche: 0});
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 60% 30%, ${COULEURS.nuitClaire}, ${COULEURS.nuit} 70%)`}}>
      {etape === 1 ? <PageGuide /> : etape === 2 ? <FicheCopiee /> : etape === 3 ? <Discussion /> : <Resultat />}
      <div style={{position: 'absolute', left: 60, top: 40, display: 'flex', alignItems: 'center', gap: 16, fontFamily: POLICE}}>
        <Logo x={0} y={0} taille={64} />
        <div style={{marginLeft: 80, background: COULEURS.or, color: COULEURS.nuit, fontWeight: 800, fontSize: 30, borderRadius: 12, padding: '6px 16px'}}>Chapitre 9</div>
        <div style={{color: COULEURS.blanc, fontWeight: 700, fontSize: 30}}>Les modules A à F</div>
      </div>
      <div style={{position: 'absolute', right: 50, top: 46, fontFamily: POLICE, fontSize: 22, fontWeight: 700, color: '#c9cfe6', border: '2px solid #4a5280', borderRadius: 20, padding: '4px 14px'}}>
        Démonstration animée
      </div>
      <Medaillon etat={etat} t={10} entree={0} x={60} y={760} d={230} />
    </AbsoluteFill>
  );
};
