import {Easing, OffthreadVideo, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {pop, prog} from '../../commun/temps';
import {COULEURS, DOUBLE, POLICE} from '../../theme';
import {BrasDouble2D, Double2D, EtatDouble} from '../../v2d/Double2D';
import {Icone, TypeIcone} from './icones';

// Éléments du montage dynamique de l'épisode 2 : téléphone animé, médaillon du
// personnage, sous-titres mot par mot, barre des 5 étapes.
// Zone sûre TikTok : rien d'important au-dessus de y 192, sous y 1536, ni à
// droite de x 950.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ------------------------------------------------------------------ téléphone

export const TEL = {x: 140, y: 236, l: 780, h: 1190, bord: 18};
const ECRAN = {l: TEL.l - 2 * TEL.bord, h: TEL.h - 2 * TEL.bord};
const LARGEUR_SOURCE = 864;

export type PlanTel = {
  nom: string;
  debut: number;
  fin: number;
  y0: number;
  zoom: [number, number];
  foyer?: [number, number];
  surligne?: [number, number, number, number];
  entree: 'droite' | 'gauche' | 'bas';
  icone?: {kind: TypeIcone; label: string};
};

export const Telephone: React.FC<{p: PlanTel; t: number; dossier?: string}> = ({p, t, dossier = 'episodes/ep02/plans'}) => {
  const {fps} = useVideoConfig();
  const local = t - p.debut;
  const duree = p.fin - p.debut;
  const e = interpolate(local, [0, 0.28], [1, 0], {...clamp, easing: Easing.out(Easing.back(1.4))});
  const dx = p.entree === 'droite' ? 700 * e : p.entree === 'gauche' ? -700 * e : 0;
  const dy = p.entree === 'bas' ? 900 * e : 0;
  const inclinaison = (p.entree === 'gauche' ? -1 : 1) * (3 * e + Math.sin(local * 1.6) * 1.2);
  const s = ECRAN.l / LARGEUR_SOURCE;
  const z = interpolate(local, [0, duree], p.zoom, {...clamp, easing: Easing.inOut(Easing.quad)});
  const [fx, fy] = p.foyer ?? [LARGEUR_SOURCE / 2, p.y0 + ECRAN.h / s / 2];
  const ox = fx * s;
  const oy = (fy - p.y0) * s;
  const sur = p.surligne;
  const apparition = prog(local, 0.35, 0.7);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: TEL.x,
          top: TEL.y,
          width: TEL.l,
          height: TEL.h,
          borderRadius: 78,
          background: 'linear-gradient(150deg, #2b3160, #0d1029 60%)',
          boxShadow: `0 0 0 4px #3a4180, 0 30px 90px #000c, 0 0 80px ${COULEURS.violet}55`,
          transform: `translate(${dx}px, ${dy}px) perspective(1600px) rotateY(${inclinaison * 1.6}deg) rotateZ(${inclinaison}deg)`,
        }}
      >
        <div style={{position: 'absolute', left: TEL.bord, top: TEL.bord, width: ECRAN.l, height: ECRAN.h, borderRadius: 62, overflow: 'hidden', background: '#000'}}>
          <div style={{position: 'absolute', inset: 0, transformOrigin: `${ox}px ${oy}px`, transform: `scale(${z})`}}>
            <Sequence from={Math.round(p.debut * fps)} durationInFrames={Math.round(duree * fps)} layout="none">
              <OffthreadVideo src={staticFile(`${dossier}/${p.nom}.mp4`)} muted style={{width: ECRAN.l, height: ECRAN.h, display: 'block'}} />
            </Sequence>
            {sur ? (
              <div
                style={{
                  position: 'absolute',
                  left: sur[0] * s,
                  top: (sur[1] - p.y0) * s,
                  width: sur[2] * s,
                  height: sur[3] * s,
                  borderRadius: 14,
                  border: `5px solid ${COULEURS.or}`,
                  boxShadow: `0 0 34px ${COULEURS.or}cc, inset 0 0 0 9999px ${COULEURS.or}22`,
                  opacity: apparition,
                  transform: `scale(${1.1 - 0.1 * apparition})`,
                }}
              />
            ) : null}
          </div>
          {/* reflet */}
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, #ffffff14 0%, transparent 35%)', pointerEvents: 'none'}} />
        </div>
        {/* encoche */}
        <div style={{position: 'absolute', left: TEL.l / 2 - 60, top: 30, width: 120, height: 28, borderRadius: 14, background: '#05060f'}} />
      </div>
      {p.icone ? <BadgeIcone kind={p.icone.kind} label={p.icone.label} t={local} /> : null}
    </>
  );
};

// Icône de fonction : surgit en grand au centre, puis se range en pastille en haut à gauche.
export const BadgeIcone: React.FC<{kind: TypeIcone; label: string; t: number}> = ({kind, label, t}) => {
  const apparition = pop(t, 0.12, 0.35);
  const rangement = interpolate(t, [0.95, 1.25], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const x = interpolate(rangement, [0, 1], [540, 300]);
  const y = interpolate(rangement, [0, 1], [760, 300]);
  const echelle = interpolate(rangement, [0, 1], [1, 0.48]) * apparition;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${echelle})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
      <div
        style={{
          width: 300,
          height: 300,
          borderRadius: 80,
          background: `linear-gradient(145deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`,
          boxShadow: `0 20px 60px #000b, 0 0 0 8px ${COULEURS.nuit}`,
          display: 'grid',
          placeItems: 'center',
          transform: `rotate(${Math.sin(t * 5) * 4}deg)`,
        }}
      >
        <Icone kind={kind} taille={200} t={t} />
      </div>
      <div style={{padding: '12px 30px', borderRadius: 999, background: COULEURS.nuit, border: `4px solid ${COULEURS.or}`, color: COULEURS.blanc, fontFamily: POLICE, fontWeight: 800, fontSize: 52, whiteSpace: 'nowrap'}}>
        {label}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ médaillon du personnage

export const MEDAILLON = {x: 22, y: 1095, d: 222};

export const Medaillon: React.FC<{etat: EtatDouble; t: number; entree: number}> = ({etat, t, entree}) => {
  const {x, y, d} = MEDAILLON;
  const s = 0.82;
  const a = pop(t - entree, 0, 0.3);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: d,
        height: d,
        borderRadius: '50%',
        overflow: 'hidden',
        background: `radial-gradient(circle at 50% 35%, #3b2f8a, ${COULEURS.nuit} 75%)`,
        boxShadow: `0 0 0 6px ${COULEURS.or}, 0 16px 40px #000b`,
        transform: `scale(${a})`,
      }}
    >
      <div style={{position: 'absolute', left: d / 2 - 540 * s, top: d * 0.52 - 1110 * s, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        <Double2D etat={etat} />
        <BrasDouble2D etat={etat} />
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ sous-titres mot par mot

export type MotST = {texte: string; debut: number; fin: number; cle: boolean};
export type BlocST = {mots: MotST[]; debut: number; fin: number};

export const SousTitresMot: React.FC<{blocs: BlocST[]; t: number}> = ({blocs, t}) => {
  const i = blocs.findIndex((b, k) => t >= b.debut - 0.05 && t < Math.min(b.fin + 0.5, blocs[k + 1]?.debut ?? Infinity));
  if (i < 0) return null;
  const b = blocs[i];
  return (
    <div
      style={{
        position: 'absolute',
        left: 50,
        right: 140,
        bottom: 1920 - 1500,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-end',
        columnGap: 18,
        rowGap: 4,
        fontFamily: POLICE,
        fontWeight: 800,
        lineHeight: 1.1,
        letterSpacing: -0.5,
      }}
    >
      {b.mots.map((m, k) => {
        const actif = t >= m.debut - 0.03 && t < (b.mots[k + 1] ? b.mots[k + 1].debut - 0.03 : b.fin + 0.5);
        const passe = t >= m.debut - 0.03;
        const p = m.cle && passe ? pop(t, m.debut - 0.03, 0.22) : 1;
        return (
          <span
            key={k}
            style={{
              display: 'inline-block',
              fontSize: m.cle ? 92 : 76,
              color: m.cle ? COULEURS.or : COULEURS.blanc,
              opacity: passe ? 1 : 0.55,
              WebkitTextStroke: `13px ${COULEURS.nuit}`,
              paintOrder: 'stroke fill',
              textShadow: '0 6px 16px #000b',
              padding: '0 10px',
              borderRadius: 16,
              background: actif ? `${COULEURS.violetFonce}` : 'transparent',
              boxShadow: actif ? `0 0 0 4px ${COULEURS.violet}` : undefined,
              transform: `scale(${p * (actif ? 1.06 : 1)}) rotate(${actif && m.cle ? -2 : 0}deg)`,
            }}
          >
            {m.texte}
          </span>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ barre des 5 étapes

export const ETAPES = ['Cahier des charges', 'Dépôt GitHub', 'Claude Code', 'Étape par étape', 'Mise en ligne'];

export const BarreEtapes: React.FC<{t: number; debuts: number[]; apparition: number; disparition: number; noms?: string[]}> = ({t, debuts, apparition, disparition, noms = ETAPES}) => {
  const visible = prog(t, apparition, apparition + 0.35) * (1 - prog(t, disparition - 0.3, disparition));
  if (visible <= 0) return null;
  const courant = debuts.filter((d) => t >= d).length; // 0 … 5
  const x0 = 130;
  const x1 = 920;
  const pas = (x1 - x0) / 4;
  const avance = courant <= 1 ? 0 : interpolate(t, [debuts[courant - 1], debuts[courant - 1] + 0.5], [courant - 2, courant - 1], clamp);
  return (
    <div style={{position: 'absolute', left: 0, top: 200, width: 1080, height: 110, opacity: visible, transform: `translateY(${(1 - visible) * -40}px)`, fontFamily: POLICE}}>
      <div style={{position: 'absolute', left: x0, width: x1 - x0, top: 34, height: 12, borderRadius: 6, background: '#ffffff26'}} />
      <div style={{position: 'absolute', left: x0, width: pas * Math.max(0, avance), top: 34, height: 12, borderRadius: 6, background: COULEURS.or, boxShadow: `0 0 16px ${COULEURS.or}`}} />
      {noms.map((nom, i) => {
        const fait = courant > i + 1;
        const actif = courant === i + 1;
        const p = actif ? pop(t, debuts[i], 0.35) : 1;
        return (
          <div key={i} style={{position: 'absolute', left: x0 + i * pas - 40, top: 0, width: 80, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: 40,
                background: actif ? `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})` : fait ? COULEURS.violet : COULEURS.nuitClaire,
                color: actif || fait ? COULEURS.nuit : COULEURS.grisTexte,
                border: `4px solid ${actif ? COULEURS.blanc : fait ? COULEURS.violet : '#ffffff44'}`,
                transform: `scale(${p * (actif ? 1.12 : 1)})`,
                boxShadow: actif ? `0 0 26px ${COULEURS.or}` : undefined,
              }}
            >
              {fait ? '✓' : i + 1}
            </div>
          </div>
        );
      })}
      {courant >= 1 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 86, textAlign: 'center', color: COULEURS.or, fontWeight: 800, fontSize: 30, letterSpacing: 1, opacity: prog(t, debuts[courant - 1], debuts[courant - 1] + 0.3)}}>
          {`ÉTAPE ${courant} · ${noms[courant - 1].toUpperCase()}`}
        </div>
      ) : null}
    </div>
  );
};

export {DOUBLE};
