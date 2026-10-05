import React from 'react';
import {cloneElement, ReactElement} from 'react';

// Icônes au trait, dessinées dans un carré de 100 × 100.
// Chaque forme se « dessine » d'elle-même grâce à pathLength = 1.
const ICONES: Record<string, ReactElement[]> = {
  copier: [
    <rect key="a" x="32" y="30" width="46" height="56" rx="6" />,
    <path key="b" d="M22 70 V22 a6 6 0 0 1 6 -6 H62" />,
  ],
  robot: [
    <rect key="a" x="22" y="34" width="56" height="44" rx="10" />,
    <path key="b" d="M50 34 V22" />,
    <circle key="c" cx="50" cy="17" r="5" />,
    <circle key="d" cx="38" cy="54" r="5" />,
    <circle key="e" cx="62" cy="54" r="5" />,
    <path key="f" d="M40 67 H60 M22 52 H13 M78 52 H87" />,
  ],
  bulle: [
    <path key="a" d="M20 22 H80 a8 8 0 0 1 8 8 V62 a8 8 0 0 1 -8 8 H46 L30 84 V70 H20 a8 8 0 0 1 -8 -8 V30 a8 8 0 0 1 8 -8 Z" />,
    <path key="b" d="M28 38 H72 M28 53 H58" />,
  ],
  haltere: [
    <path key="a" d="M32 50 H68" />,
    <rect key="b" x="20" y="30" width="12" height="40" rx="3" />,
    <rect key="c" x="68" y="30" width="12" height="40" rx="3" />,
    <path key="d" d="M12 40 V60 M88 40 V60" />,
  ],
  loupe: [<circle key="a" cx="42" cy="42" r="25" />, <path key="b" d="M61 61 L85 85" />],
  question: [
    <circle key="a" cx="50" cy="50" r="38" />,
    <path key="b" d="M38 40 a12 12 0 1 1 18 10 c-4 3 -6 5 -6 10" />,
    <circle key="c" cx="50" cy="72" r="2.5" />,
  ],
  chaine: [
    <rect key="a" x="12" y="38" width="44" height="24" rx="12" transform="rotate(-35 34 50)" />,
    <rect key="b" x="44" y="38" width="44" height="24" rx="12" transform="rotate(-35 66 50)" />,
  ],
  croissance: [
    <path key="a" d="M16 16 V84 H88" />,
    <path key="b" d="M26 70 L44 52 L58 62 L82 36" />,
    <path key="c" d="M68 34 H83 V49" />,
  ],
  ampoule: [
    <path key="a" d="M50 12 a25 25 0 0 1 14 45 c-3 3 -4 6 -4 10 H40 c0 -4 -1 -7 -4 -10 A25 25 0 0 1 50 12 Z" />,
    <path key="b" d="M40 77 H60 M43 87 H57" />,
  ],
  calendrier: [
    <rect key="a" x="14" y="22" width="72" height="64" rx="8" />,
    <path key="b" d="M14 40 H86 M32 12 V28 M68 12 V28" />,
    <path key="c" d="M30 56 H38 M46 56 H54 M62 56 H70 M30 70 H38 M46 70 H54" />,
  ],
  epingle: [
    <path key="a" d="M50 90 C50 90 22 60 22 40 a28 28 0 0 1 56 0 C78 60 50 90 50 90 Z" />,
    <circle key="b" cx="50" cy="40" r="10" />,
  ],
  etincelles: [
    <path key="a" d="M44 14 L51 40 L77 47 L51 54 L44 80 L37 54 L11 47 L37 40 Z" />,
    <path key="b" d="M78 12 L81 21 L90 24 L81 27 L78 36 L75 27 L66 24 L75 21 Z" />,
  ],
  groupe: [
    <circle key="a" cx="50" cy="34" r="12" />,
    <path key="b" d="M27 80 a23 23 0 0 1 46 0" />,
    <circle key="c" cx="22" cy="42" r="8" />,
    <circle key="d" cx="78" cy="42" r="8" />,
    <path key="e" d="M8 76 a14 14 0 0 1 18 -14 M92 76 a14 14 0 0 0 -18 -14" />,
  ],
  etudiant: [
    <path key="a" d="M8 40 L50 22 L92 40 L50 58 Z" />,
    <path key="b" d="M26 48 V68 c0 9 48 9 48 0 V48" />,
    <path key="c" d="M86 43 V66" />,
  ],
  mallette: [
    <rect key="a" x="12" y="32" width="76" height="52" rx="8" />,
    <path key="b" d="M38 32 V24 a4 4 0 0 1 4 -4 H58 a4 4 0 0 1 4 4 V32 M12 56 H88" />,
  ],
  camera: [<rect key="a" x="10" y="28" width="58" height="44" rx="8" />, <path key="b" d="M68 44 L90 31 V69 L68 56 Z" />],
  badge: [
    <rect key="a" x="22" y="18" width="56" height="70" rx="8" />,
    <circle key="b" cx="50" cy="44" r="10" />,
    <path key="c" d="M35 72 a15 15 0 0 1 30 0 M42 18 V10 H58 V18" />,
  ],
  telephone: [
    <rect key="a" x="28" y="8" width="44" height="84" rx="9" />,
    <path key="b" d="M43 18 H57" />,
    <circle key="c" cx="50" cy="80" r="3" />,
  ],
  cible: [
    <circle key="a" cx="46" cy="54" r="34" />,
    <circle key="b" cx="46" cy="54" r="20" />,
    <circle key="c" cx="46" cy="54" r="6" />,
    <path key="d" d="M46 54 L84 16 M72 16 H84 V28" />,
  ],
  commentaire: [
    <path key="a" d="M20 20 H80 a8 8 0 0 1 8 8 V62 a8 8 0 0 1 -8 8 H46 L30 84 V70 H20 a8 8 0 0 1 -8 -8 V28 a8 8 0 0 1 8 -8 Z" />,
    <circle key="b" cx="34" cy="45" r="3" />,
    <circle key="c" cx="50" cy="45" r="3" />,
    <circle key="d" cx="66" cy="45" r="3" />,
  ],
  partage: [
    <circle key="a" cx="72" cy="22" r="11" />,
    <circle key="b" cx="26" cy="50" r="11" />,
    <circle key="c" cx="72" cy="78" r="11" />,
    <path key="d" d="M36 44 L62 28 M36 56 L62 72" />,
  ],
  coche: [<path key="a" d="M24 52 L42 70 L78 30" />],
  croix: [<path key="a" d="M26 26 L74 74 M74 26 L26 74" />],
};

export const iconeExiste = (nom: string) => nom in ICONES;

export const Icone: React.FC<{
  nom: string;
  taille: number;
  progres?: number; // 0 → 1 : dessin du trait
  couleur?: string;
  epaisseur?: number;
}> = ({nom, taille, progres = 1, couleur = '#fff', epaisseur = 6}) => {
  const formes = ICONES[nom];
  if (!formes) throw new Error(`Icône inconnue : ${nom}`);
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 100 100"
      fill="none"
      stroke={couleur}
      strokeWidth={epaisseur}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{overflow: 'visible'}}
    >
      {formes.map((f) =>
        cloneElement(f as ReactElement<Record<string, unknown>>, {
          pathLength: 1,
          strokeDasharray: 1,
          strokeDashoffset: 1 - Math.min(1, Math.max(0, progres)),
        }),
      )}
    </svg>
  );
};
