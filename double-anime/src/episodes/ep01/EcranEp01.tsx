import {Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {CadreEcran, Etoile, LigneFormule, TAILLES, Tuile} from '../../commun/Ecran';
import {MotVoix, texteTape} from '../../commun/mots';
import {pop, prog} from '../../commun/temps';
import {COULEURS, MISE_EN_PAGE, POLICE} from '../../theme';
import MONTAGE from './ecran.json';
import {APPARITION_CASES, LETTRES, MOMENTS, MOTS, PHASES, RAPPEL, RASSEMBLEMENT} from './scenario';

// Le grand écran de l'épisode 1, en cinq temps : la demande banale (filmée dans
// ChatGPT), la formule R, T, C, F écrite au rythme de la voix (dessinée), la
// publicité réussie (filmée), le rappel des quatre lettres, puis l'appel.

const CONTENU = {l: MISE_EN_PAGE.ecran.l, h: MISE_EN_PAGE.ecran.h - TAILLES.barre};
const typo = (s: string) => s.replace(/'/g, '’');
// curseur clignotant
const curseurVisible = (t: number) => Math.floor(t * 2.4) % 2 === 0;

// Texte tapé au rythme de la voix ; le reste est réservé (transparent) pour
// que la mise en page ne saute pas quand une ligne passe à la ligne.
const Tape: React.FC<{mots: MotVoix[]; t: number; curseur: boolean}> = ({mots, t, curseur}) => {
  const complet = typo(mots.map((m) => m.texte).join(' '));
  const visible = typo(texteTape(mots, t));
  return (
    <>
      {visible}
      {curseur ? <span style={{color: COULEURS.or, opacity: curseurVisible(t) || visible.length < complet.length ? 1 : 0}}>▍</span> : null}
      <span style={{color: 'transparent'}}>{complet.slice(visible.length)}</span>
    </>
  );
};

// ------------------------------------------------------------- enregistrement d'écran

// Extrait de l'enregistrement du téléphone (monté par outils/monter_ecran.py),
// cadré et zoomé pour que le texte de ChatGPT reste lisible (≈ 40 px).
type Clip = (typeof MONTAGE.clips)[number];
const ECHELLE = MISE_EN_PAGE.ecran.l / MONTAGE.largeur;

const EcranVideo: React.FC<{clip: Clip; t: number; children?: React.ReactNode}> = ({clip, t, children}) => {
  const {fps} = useVideoConfig();
  const debut = clip.segments[0][0];
  const cad = clip.cadrage;
  const options = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)} as const;
  const y = interpolate(t, cad.map((c) => c[0]), cad.map((c) => c[1]), options);
  const zoom = interpolate(t, cad.map((c) => c[0]), cad.map((c) => c[2] ?? 1), options);
  const {x, y: haut, l, h} = MISE_EN_PAGE.ecran;
  return (
    <div style={{position: 'absolute', left: x, top: haut, width: l, height: h, borderRadius: 14, overflow: 'hidden', background: '#000', boxShadow: `0 0 90px ${COULEURS.violet}40`}}>
      <Sequence from={Math.round(debut * fps)} layout="none">
        <OffthreadVideo
          src={staticFile(`episodes/ep01/ecran-${clip.nom}.mp4`)}
          muted
          style={{position: 'absolute', left: 0, top: 0, width: MONTAGE.largeur, height: 2400, transformOrigin: '0 0', transform: `scale(${ECHELLE * zoom}) translateY(${-y}px)`}}
        />
      </Sequence>
      {children}
    </div>
  );
};

const [CLIP_BANALE, CLIP_COMPLETE] = MONTAGE.clips;

// 1. « Fais-moi une publicité » : la demande, la réponse banale, la croix rouge.
const PhaseBanale: React.FC<{t: number}> = ({t}) => (
  <EcranVideo clip={CLIP_BANALE} t={t}>
    {t >= MOMENTS.croix ? (
      <div style={{position: 'absolute', right: 40, top: 150, textAlign: 'center', transform: `scale(${pop(t, MOMENTS.croix, 0.35)}) rotate(-8deg)`}}>
        <svg width={190} height={190} viewBox="-50 -50 100 100">
          <circle r={46} fill="#ff4d4f" stroke="#fff" strokeWidth={4} />
          <path d="M-20 -20 L20 20 M20 -20 L-20 20" stroke="#fff" strokeWidth={12} strokeLinecap="round" />
        </svg>
        <div style={{marginTop: 8, background: '#ff4d4f', color: '#fff', fontWeight: 800, fontSize: 40, borderRadius: 14, padding: '4px 18px', fontFamily: POLICE}}>Banal</div>
      </div>
    ) : null}
  </EcranVideo>
);

// ------------------------------------------------------------- 2. formule R, T, C, F

// Position de chaque case dans la colonne (mesurée sur le rendu : 1 ligne pour R, 2 pour les autres).
const HAUT_LIGNES = [0, 98, 233, 368];
const GRANDE = 280;

const PhaseFormule: React.FC<{t: number}> = ({t}) => {
  const atterrissage = LETTRES.map((l) => l.citation[0].debut - 0.05);
  const enCours = LETTRES.findIndex((l, k) => t >= l.annonce - 0.05 && t < atterrissage[k]);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 14}}>
        {LETTRES.map((l, k) => {
          const pose = t >= atterrissage[k];
          const suivante = k < 3 && t >= atterrissage[k + 1];
          const etat = t < APPARITION_CASES[k] ? 'cachee' : !pose ? 'vide' : suivante ? 'passee' : 'active';
          const fin = l.citation[l.citation.length - 1].fin;
          return (
            <div key={l.lettre} style={{transform: `scale(${t < APPARITION_CASES[k] + 0.4 ? pop(t, APPARITION_CASES[k], 0.3) : 1})`, transformOrigin: '42px 42px'}}>
              <LigneFormule
                lettre={l.lettre}
                mot={l.mot}
                etat={etat}
                opaciteMot={pose ? 1 : 0}
                texte={pose ? <Tape mots={l.citation} t={t} curseur={!suivante && t < fin + 1.2} /> : null}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 170,
          textAlign: 'center',
          color: COULEURS.blanc,
          fontWeight: 800,
          fontSize: 70,
          opacity: prog(t, MOMENTS.formule - 0.1, MOMENTS.formule + 0.15) * (1 - prog(t, APPARITION_CASES[0] - 0.15, APPARITION_CASES[0])),
        }}
      >
        La formule
        <div style={{color: COULEURS.or, fontSize: 84, letterSpacing: 6}}>R · T · C · F</div>
      </div>
      {/* la lettre annoncée apparaît en grand, puis rejoint sa case */}
      {enCours >= 0 ? <GrandeLettre t={t} k={enCours} arrivee={atterrissage[enCours]} /> : null}
    </div>
  );
};

const GrandeLettre: React.FC<{t: number; k: number; arrivee: number}> = ({t, k, arrivee}) => {
  const l = LETTRES[k];
  const vol = prog(t, arrivee - 0.38, arrivee);
  const taille = interpolate(vol, [0, 1], [GRANDE, TAILLES.tuile]);
  const gauche = interpolate(vol, [0, 1], [(CONTENU.l - GRANDE) / 2, 26]);
  const haut = interpolate(vol, [0, 1], [70, 22 + HAUT_LIGNES[k]]);
  const apparition = pop(t, l.annonce - 0.05, 0.4);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: `${COULEURS.nuit}d9`, opacity: 1 - vol}} />
      <div style={{position: 'absolute', left: gauche, top: haut, transform: `scale(${apparition})`}}>
        <Tuile lettre={l.lettre} etat="active" taille={taille} style={{boxShadow: `0 0 ${60 * (1 - vol)}px ${COULEURS.or}aa`}} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 70 + GRANDE + 24,
          textAlign: 'center',
          color: COULEURS.blanc,
          fontWeight: 800,
          fontSize: 64,
          opacity: prog(t, l.etiquette - 0.05, l.etiquette + 0.15) * (1 - vol),
        }}
      >
        {l.lettre} comme <span style={{color: COULEURS.or}}>{l.mot}</span>
      </div>
    </>
  );
};

// ------------------------------------------------------------- 3. publicité réussie

// La demande complète part, la réponse précise s'écrit, puis la coche verte.
const PhasePub: React.FC<{t: number}> = ({t}) => {
  const coche = pop(t, MOMENTS.pubCoche, 0.4);
  return (
    <EcranVideo clip={CLIP_COMPLETE} t={t}>
      {t >= MOMENTS.pubCoche ? (
        <>
          <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${60 * coche}px ${COULEURS.whatsapp}`}} />
          <div style={{position: 'absolute', right: 30, top: 24, transform: `scale(${coche})`}}>
            <svg width={150} height={150} viewBox="-50 -50 100 100">
              <circle r={46} fill={COULEURS.whatsapp} stroke="#fff" strokeWidth={4} />
              <path d="M-22 2 L-6 18 L24 -16" stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {[[20, 30], [700, 420], [30, 470], [560, 40]].map(([x, y], i) => (
            <div key={i} style={{position: 'absolute', left: x, top: y, transform: `scale(${pop(t, MOMENTS.pubCoche + 0.08 * i, 0.4)}) rotate(${t * 90}deg)`}}>
              <Etoile taille={50} couleur={i % 2 ? COULEURS.or : COULEURS.violet} />
            </div>
          ))}
        </>
      ) : null}
    </EcranVideo>
  );
};

// ------------------------------------------------------------- 4. les quatre lettres

const PhaseLettres: React.FC<{t: number}> = ({t}) => {
  const r = prog(t, RASSEMBLEMENT, RASSEMBLEMENT + 0.8);
  const fini = prog(t, RASSEMBLEMENT + 0.7, RASSEMBLEMENT + 1.0);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 120,
          height: 260,
          background: `radial-gradient(ellipse at 50% 50%, ${COULEURS.or}55 0%, transparent 65%)`,
          opacity: fini,
        }}
      />
      {LETTRES.map((l, k) => {
        const grille = {x: k % 2 ? 620 : 240, y: k < 2 ? 118 : 330, taille: 148};
        const rangee = {x: CONTENU.l / 2 + (k - 1.5) * 180, y: 230, taille: 156};
        const x = interpolate(r, [0, 1], [grille.x, rangee.x]);
        const y = interpolate(r, [0, 1], [grille.y, rangee.y]);
        const taille = interpolate(r, [0, 1], [grille.taille, rangee.taille]);
        const p = pop(t, RAPPEL[k], 0.35);
        return (
          <div key={l.lettre}>
            <div style={{position: 'absolute', left: x - taille / 2, top: y - taille / 2, transform: `scale(${p})`}}>
              <Tuile lettre={l.lettre} etat="active" taille={taille} />
            </div>
            <div
              style={{
                position: 'absolute',
                left: grille.x - 150,
                width: 300,
                top: grille.y + 80,
                textAlign: 'center',
                color: COULEURS.blanc,
                fontWeight: 700,
                fontSize: 38,
                opacity: p * (1 - r),
              }}
            >
              {l.mot}
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 350, textAlign: 'center', fontFamily: POLICE, opacity: fini}}>
        <div style={{color: COULEURS.blanc, fontWeight: 800, fontSize: 50}}>Retiens ces 4 lettres</div>
        <div style={{color: COULEURS.grisTexte, fontWeight: 500, fontSize: 32, marginTop: 8}}>Rôle · Tâche · Contexte · Format</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------- 5. appel à réserver

const PhaseAppel: React.FC<{t: number}> = ({t}) => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24}}>
    <Img src={staticFile('marque/logo.jpg')} style={{width: 150, height: 150, borderRadius: 24, transform: `scale(${pop(t, PHASES.appel + 0.1, 0.4)})`}} />
    <div style={{marginTop: 16, color: COULEURS.blanc, fontWeight: 700, fontSize: 42, opacity: prog(t, MOMENTS.maitriser - 0.1, MOMENTS.maitriser + 0.2)}}>
      Maîtrise l’IA pour ton activité
    </div>
    <div style={{marginTop: 14, color: COULEURS.or, fontWeight: 800, fontSize: 66, transform: `scale(${pop(t, MOMENTS.consultation, 0.35)})`}}>
      Consultation gratuite
    </div>
    <div style={{color: COULEURS.blanc, fontWeight: 600, fontSize: 38, marginTop: 2, opacity: prog(t, MOMENTS.consultation + 0.4, MOMENTS.consultation + 0.7)}}>
      avec Lomé IA School
    </div>
    <div
      style={{
        marginTop: 20,
        padding: '12px 36px',
        borderRadius: 999,
        background: COULEURS.blanc,
        color: COULEURS.nuit,
        fontWeight: 800,
        fontSize: 42,
        transform: `scale(${pop(t, MOMENTS.lien, 0.35)})`,
      }}
    >
      Lien dans la bio <span style={{color: COULEURS.violetFonce, display: 'inline-block', transform: `translateY(${Math.sin(t * 6) * 6}px)`}}>↓</span>
    </div>
  </div>
);

// ------------------------------------------------------------- assemblage

// Phases dessinées : dans le cadre de l'écran (titre à gauche, étiquette à droite).
// Phases filmées : l'enregistrement remplit l'écran.
const dessin = (titre: string, droite: string, Phase: React.FC<{t: number}>): React.FC<{t: number}> => {
  const Cadre: React.FC<{t: number}> = ({t}) => (
    <CadreEcran titre={titre} droite={droite}>
      <Phase t={t} />
    </CadreEcran>
  );
  return Cadre;
};

const SEQUENCE: {debut: number; Phase: React.FC<{t: number}>}[] = [
  {debut: -Infinity, Phase: PhaseBanale},
  {debut: PHASES.formule, Phase: dessin('La formule', 'R · T · C · F', PhaseFormule)},
  {debut: PHASES.pub, Phase: PhasePub},
  {debut: PHASES.lettres, Phase: dessin('À retenir', '', PhaseLettres)},
  {debut: PHASES.appel, Phase: dessin('Lomé IA School', '', PhaseAppel)},
];
const FONDU = 0.3;

export const EcranEp01: React.FC<{t: number}> = ({t}) => {
  const i = SEQUENCE.findLastIndex((s) => t >= s.debut);
  const courante = SEQUENCE[i];
  const entree = i > 0 ? prog(t, courante.debut, courante.debut + FONDU) : 1;
  const precedente = i > 0 && entree < 1 ? SEQUENCE[i - 1] : null;
  return (
    <>
      {precedente ? (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - entree}}>
          <precedente.Phase t={t} />
        </div>
      ) : null}
      <div style={{position: 'absolute', inset: 0, opacity: entree, transform: `translateY(${(1 - entree) * 30}px)`}}>
        <courante.Phase t={t} />
      </div>
    </>
  );
};

export {MOTS};
