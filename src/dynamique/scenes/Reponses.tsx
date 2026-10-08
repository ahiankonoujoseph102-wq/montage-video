import React from 'react';
import {Easing} from 'remotion';
import {Defs, Gros, lin, Marque, POLICE_SVG, pop, prog, Telephone, type PropsScene} from './outils';

// d. « Questions vagues, réponses vagues » : un grand téléphone. « Aide-moi » → réponse grise floue, croix rouge
// (étape 0). L'écran se vide (étape 1) : « Écris 3 idées de posts pour ma boutique » → réponse nette en trois
// lignes, coche verte (étape 2). Étiquettes en très gros à droite.
const ID = 'rep';
const TEL = {x: 56, y: 204, l: 404, h: 676};
const EL = TEL.l - 36; // largeur de l'écran

const Bulle: React.FC<React.PropsWithChildren<{x: number; y: number; l: number; h: number; moi: boolean; k: number;
  fond?: string}>> = ({x, y, l, h, moi, k, fond, children}) => {
  const c = fond ?? (moi ? '#1D7CF2' : '#E3E3EE');
  return (
    <g transform={`translate(${x + (moi ? l : 0)} ${y + h}) scale(${k}) translate(${moi ? -l : 0} ${-h})`}
      opacity={k > 0 ? 1 : 0}>
      <rect width={l} height={h} rx={26} fill={c} />
      <path d={moi ? `M ${l - 18} ${h - 6} L ${l + 10} ${h + 10} L ${l - 40} ${h - 2} Z`
        : `M 18 ${h - 6} L -10 ${h + 10} L 40 ${h - 2} Z`} fill={c} />
      {children}
    </g>
  );
};

const Lignes: React.FC<{lignes: string[]; n: number; couleur: string; taille: number; x: number; y: number;
  pas?: number}> = ({lignes, n, couleur, taille, x, y, pas = taille * 1.22}) => {
  let reste = n;
  return (
    <g>
      {lignes.map((l, i) => {
        const vis = l.slice(0, Math.max(0, reste));
        reste -= l.length;
        return <text key={i} x={x} y={y + i * pas} fontFamily={POLICE_SVG} fontWeight={900} fontSize={taille}
          fill={couleur}>{vis}</text>;
      })}
    </g>
  );
};

const Points: React.FC<{t: number; x: number; y: number}> = ({t, x, y}) => (
  <g>{[0, 1, 2].map((i) => <circle key={i} cx={x + i * 30} cy={y - 8 * Math.max(0, Math.sin((t - i * 4) / 3))} r={10}
    fill="#9A9AB0" />)}</g>
);

// Étiquette en deux lignes, 76 px (presque deux fois la taille d'avant), qui claque.
const Etiquette: React.FC<{y: number; lignes: string[]; couleur: string; k: number}> = ({y, lignes, couleur, k}) => (
  <g transform={`translate(708 ${y}) scale(${k})`} opacity={k > 0 ? 1 : 0} letterSpacing={-2}>
    {lignes.map((l, i) => <Gros key={i} x={0} y={i * 78} taille={76} couleur={couleur} contour="#fff">{l}</Gros>)}
  </g>
);

export const Reponses: React.FC<PropsScene> = ({t, etapes}) => {
  const [e0 = 45, e1 = 95, e2 = 150] = etapes;
  const vide = prog(t, e1, 8, Easing.in(Easing.cubic)); // l'écran se vide pour la version précise
  const secoue = t >= e0 && t < e0 + 12 ? Math.sin((t - e0) * 2.4) * 12 * (1 - (t - e0) / 12) : 0;
  // Version floue
  const kq1 = pop(t, 3);
  const n1 = Math.floor(lin(t, 4, 12, 0, 8));
  const repFloue = t >= 16;
  const lignesFloues = Math.floor(lin(t, 26, Math.max(30, e0 - 2), 0, 5));
  const kCroix = pop(t, e0, 260);
  // Version précise
  const q2 = ['Écris 3 idées', 'de posts pour', 'ma boutique'];
  const kq2 = pop(t, e1 + 6);
  const n2 = Math.floor(lin(t, e1 + 7, e1 + 20, 0, 40));
  const debutRep2 = Math.max(e1 + 22, e2 - 10);
  const points2 = t >= e1 + 22 && t < debutRep2;
  const krep2 = pop(t, debutRep2);
  const r2 = ['1. Nouveautés', '2. Conseils', '3. Avis clients'];
  const n3 = Math.floor(lin(t, debutRep2 + 1, debutRep2 + 10, 0, 45));
  const kCoche = pop(t, Math.max(e2, debutRep2 + 6), 260);
  const flotte = (i: number) => Math.sin((t + i * 20) / 12) * 14;
  return (
    <svg width={1080} height={960} style={{position: 'absolute', inset: 0}}>
      <Defs id={ID} />
      {/* Points d'interrogation flous qui flottent derrière la version vague. */}
      <g opacity={(1 - vide) * lin(t, 6, 16, 0, 0.6)} filter={`url(#flou${ID})`}>
        {[[520, 300, 90], [600, 860, 110], [900, 250, 80], [920, 690, 100]].map(([x, y, s], i) => (
          <text key={i} x={x} y={y + flotte(i)} fontFamily={POLICE_SVG} fontWeight={900} fontSize={s} fill="#fff">?</text>
        ))}
      </g>
      <g transform={`translate(${secoue} ${(1 - pop(t, 0, 180)) * 700}) rotate(${-1.5 + 1.5 * Math.sin(t / 30)} 258 542)`}
        filter={`url(#ombre${ID})`}>
        <Telephone {...TEL}>
          {/* En-tête de l'application de discussion */}
          <rect width={EL} height={96} fill="#fff" />
          <line x1={0} x2={EL} y1={96} y2={96} stroke="#E2E2EA" strokeWidth={3} />
          <circle cx={56} cy={58} r={28} fill="#7B2FF7" />
          <path d="M 56 40 L 61 53 L 74 58 L 61 63 L 56 76 L 51 63 L 38 58 L 51 53 Z" fill="#fff" />
          <text x={98} y={56} fontFamily={POLICE_SVG} fontWeight={900} fontSize={30} fill="#1B1B2F">Assistant IA</text>
          <circle cx={104} cy={76} r={6} fill="#22C55E" />
          <text x={116} y={83} fontFamily={POLICE_SVG} fontWeight={800} fontSize={19} fill="#22A05A">en ligne</text>
          {/* Version floue */}
          <g opacity={1 - vide} transform={`translate(0 ${-260 * vide})`}>
            <Bulle x={EL - 316} y={128} l={296} h={92} moi k={kq1}>
              <Lignes lignes={['Aide-moi']} n={n1} couleur="#fff" taille={48} x={24} y={63} />
            </Bulle>
            {repFloue ? (
              <Bulle x={14} y={262} l={300} h={t < 26 ? 70 : 250} moi={false} k={pop(t, 16)}>
                {t < 26 ? <Points t={t} x={36} y={40} /> : (
                  <g filter={`url(#flou${ID})`}>
                    {Array.from({length: lignesFloues}).map((_, i) => (
                      <rect key={i} x={24} y={30 + i * 42} width={[250, 210, 260, 160, 220][i]} height={22} rx={11}
                        fill="#A2A2B8" />
                    ))}
                  </g>
                )}
              </Bulle>
            ) : null}
          </g>
          {/* Version précise */}
          {t >= e1 ? (
            <g>
              <Bulle x={22} y={122} l={EL - 40} h={176} moi k={kq2}>
                <Lignes lignes={q2} n={n2} couleur="#fff" taille={38} x={22} y={52} pas={48} />
              </Bulle>
              {points2 ? <Bulle x={14} y={336} l={140} h={70} moi={false} k={1}><Points t={t} x={36} y={40} /></Bulle> : null}
              {t >= debutRep2 ? (
                <Bulle x={14} y={336} l={EL - 34} h={196} moi={false} k={krep2} fond="#E3FAEC">
                  <rect x={0} y={16} width={8} height={164} rx={4} fill="#22C55E" />
                  <Lignes lignes={r2} n={n3} couleur="#14532D" taille={38} x={26} y={60} pas={56} />
                </Bulle>
              ) : null}
            </g>
          ) : null}
          {/* Champ de saisie */}
          <rect x={16} y={572} width={262} height={52} rx={26} fill="#fff" stroke="#DADAE6" strokeWidth={3} />
          <text x={38} y={606} fontFamily={POLICE_SVG} fontWeight={800} fontSize={21} fill="#A0A0B4">Écris ici…</text>
          <circle cx={318} cy={598} r={30} fill="#1D7CF2" />
          <path d="M 305 586 L 334 598 L 305 610 L 310 598 Z" fill="#fff" />
        </Telephone>
      </g>
      {/* Verdicts, colonne de droite : étiquette de la question, pastille, étiquette de la réponse. */}
      <g opacity={1 - vide}>
        <Etiquette y={300} lignes={['QUESTION', 'FLOUE']} couleur="#6B6B80" k={pop(t, 6)} />
        <Marque x={710} y={540} r={84} type="croix" k={kCroix} id={ID} />
        <Etiquette y={745} lignes={['RÉPONSE', 'VAGUE']} couleur="#D92B2B" k={pop(t, e0 + 4)} />
      </g>
      <Etiquette y={300} lignes={['QUESTION', 'PRÉCISE']} couleur="#1D5BFF" k={pop(t, e1 + 6)} />
      <Marque x={710} y={540} r={84} type="coche" k={kCoche} id={ID} />
      <Etiquette y={745} lignes={['RÉPONSE', 'NETTE']} couleur="#12A150" k={pop(t, Math.max(e2, debutRep2 + 6) + 4)} />
    </svg>
  );
};
