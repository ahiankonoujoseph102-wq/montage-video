import {AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {COULEURS, MISE_EN_PAGE} from '../theme';

// Plans tirés des captures d'écran (découpés par outils/plans.py) :
//   - sur l'écran du décor (derrière le personnage) ;
//   - en plein écran, dans la zone sûre TikTok (ni les 10 % du haut, ni les
//     20 % du bas, ni les 12 % de droite), avec un zoom doux et, au besoin,
//     un cadre doré qui met en évidence ce dont parle la voix.

export type PlanCaptureDef = {
  nom: string;
  debut: number;
  fin: number;
  cadre: [number, number, number, number];
  zoom?: [number, number];
  foyer?: [number, number]; // point fixe du zoom, en pixels de la capture (864 px de large)
  surligne?: [number, number, number, number];
};

// bas de la zone à 1340 px : les sous-titres (bas à 1500 px) passent sous la capture
export const ZONE_PLEIN = {x: 100, y: 200, l: 844, h: 1140};

const Video: React.FC<{plan: PlanCaptureDef; dossier: string; largeur: number}> = ({plan, dossier, largeur}) => {
  const {fps} = useVideoConfig();
  const [, , l, h] = plan.cadre;
  return (
    <Sequence from={Math.round(plan.debut * fps)} durationInFrames={Math.round((plan.fin - plan.debut) * fps)} layout="none">
      <OffthreadVideo src={staticFile(`${dossier}/${plan.nom}.mp4`)} muted style={{width: largeur, height: (h * largeur) / l, display: 'block'}} />
    </Sequence>
  );
};

// Zoom doux autour du foyer + cadre de mise en évidence (dans le repère de la capture).
const Zoome: React.FC<{plan: PlanCaptureDef; t: number; largeur: number; children: React.ReactNode}> = ({plan, t, largeur, children}) => {
  const [cx, cy, l, h] = plan.cadre;
  const s = largeur / l;
  const [z0, z1] = plan.zoom ?? [1, 1];
  const z = interpolate(t, [plan.debut, plan.fin], [z0, z1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
  const [fx, fy] = plan.foyer ?? [cx + l / 2, cy + h / 2];
  const ox = (fx - cx) * s;
  const oy = (fy - cy) * s;
  const surligne = plan.surligne;
  const apparition = interpolate(t, [plan.debut + 0.3, plan.debut + 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'relative', width: largeur, height: h * s, transformOrigin: `${ox}px ${oy}px`, transform: `scale(${z})`}}>
      {children}
      {surligne ? (
        <div
          style={{
            position: 'absolute',
            left: (surligne[0] - cx) * s,
            top: (surligne[1] - cy) * s,
            width: surligne[2] * s,
            height: surligne[3] * s,
            borderRadius: 14,
            border: `5px solid ${COULEURS.or}`,
            boxShadow: `0 0 30px ${COULEURS.or}aa, inset 0 0 0 9999px ${COULEURS.or}1a`,
            opacity: apparition,
            transform: `scale(${1.08 - 0.08 * apparition})`,
          }}
        />
      ) : null}
    </div>
  );
};

export const CaptureEcran: React.FC<{plan: PlanCaptureDef; t: number; dossier: string}> = ({plan, t, dossier}) => {
  const {x, y, l, h} = MISE_EN_PAGE.ecran;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: l, height: h, borderRadius: 14, overflow: 'hidden', background: '#000', boxShadow: `0 0 90px ${COULEURS.violet}40`}}>
      <Zoome plan={plan} t={t} largeur={l}>
        <Video plan={plan} dossier={dossier} largeur={l} />
      </Zoome>
    </div>
  );
};

export const CapturePlein: React.FC<{plan: PlanCaptureDef; t: number; dossier: string}> = ({plan, t, dossier}) => {
  const [, , l, h] = plan.cadre;
  const {x, y, l: L, h: H} = ZONE_PLEIN;
  const largeur = Math.min(L, (H * l) / h);
  const hauteur = (h * largeur) / l;
  const entree = interpolate(t, [plan.debut, plan.debut + 0.18], [0.94, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, #1b1f63 0%, ${COULEURS.nuit} 70%)`}}>
      <div
        style={{
          position: 'absolute',
          left: x + (L - largeur) / 2,
          top: y + (H - hauteur) / 2,
          width: largeur,
          height: hauteur,
          borderRadius: 22,
          overflow: 'hidden',
          background: '#000',
          boxShadow: `0 0 0 3px ${COULEURS.or}88, 0 24px 80px #000c`,
          transform: `scale(${entree})`,
        }}
      >
        <Zoome plan={plan} t={t} largeur={largeur}>
          <Video plan={plan} dossier={dossier} largeur={largeur} />
        </Zoome>
      </div>
    </AbsoluteFill>
  );
};
