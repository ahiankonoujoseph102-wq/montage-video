import {COULEURS} from '../../theme';

// Icônes génériques animées (aucun logo de marque), dessinées en bleu nuit
// pour être posées sur une pastille dorée. Repère 0–100.
export type TypeIcone = 'maison' | 'diplome' | 'fcfa' | 'paiement' | 'profil' | 'calendrier' | 'immeuble' | 'ecole' | 'affiliation' | 'ondes';

const N = COULEURS.nuit;
const V = COULEURS.violetFonce;

export const Icone: React.FC<{kind: TypeIcone; taille: number; t: number}> = ({kind, taille, t}) => {
  const b = Math.sin(t * 6);
  let dessin: React.ReactNode = null;
  switch (kind) {
    case 'maison':
      dessin = (
        <g>
          <path d="M14 48 L50 18 L86 48" stroke={N} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 44 V82 H76 V44" fill={N} />
          <rect x={43} y={58} width={14} height={24} rx={3} fill={COULEURS.or} />
        </g>
      );
      break;
    case 'diplome':
      dessin = (
        <g transform={`rotate(${b * 6} 50 50)`}>
          <path d="M8 40 L50 22 L92 40 L50 58 Z" fill={N} />
          <path d="M26 48 V66 Q50 80 74 66 V48 L50 58 Z" fill={N} />
          <path d="M86 42 V66" stroke={N} strokeWidth={4} />
          <circle cx={86} cy={68 + b * 2} r={5} fill={V} />
        </g>
      );
      break;
    case 'fcfa':
      dessin = (
        <g transform={`rotate(${-12 + b * 5} 50 50)`}>
          <path d="M14 30 L54 14 L90 50 L50 86 L14 50 Z" fill={N} />
          <circle cx={30} cy={34} r={6} fill={COULEURS.or} />
          <text x={56} y={58} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={22} fill={COULEURS.or}>
            FCFA
          </text>
        </g>
      );
      break;
    case 'paiement':
      dessin = (
        <g>
          <rect x={30} y={10} width={40} height={78} rx={8} fill={N} />
          <rect x={35} y={18} width={30} height={56} rx={3} fill={COULEURS.or} />
          <path d={`M41 46 L48 ${53 + b} L60 38`} stroke={N} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
      break;
    case 'profil':
      dessin = (
        <g>
          <circle cx={50} cy={36} r={18} fill={N} />
          <path d="M16 88 Q16 60 50 60 Q84 60 84 88 Z" fill={N} />
          <circle cx={74} cy={26} r={10 + b * 1.5} fill={V} />
        </g>
      );
      break;
    case 'calendrier': {
      const coche = Math.max(0, Math.min(1, (t - 0.3) / 0.3));
      dessin = (
        <g>
          <rect x={12} y={18} width={76} height={70} rx={10} fill={N} />
          <rect x={12} y={18} width={76} height={18} rx={8} fill={V} />
          <rect x={28} y={8} width={8} height={18} rx={4} fill={N} />
          <rect x={64} y={8} width={8} height={18} rx={4} fill={N} />
          {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={20 + c * 17} y={42 + r * 14} width={11} height={9} rx={2} fill={COULEURS.or} opacity={0.5} />))}
          <path d="M44 68 L52 76 L70 54" stroke={COULEURS.blanc} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={50} strokeDashoffset={50 * (1 - coche)} />
        </g>
      );
      break;
    }
    case 'immeuble':
      dessin = (
        <g>
          <rect x={22} y={14} width={40} height={76} rx={3} fill={N} />
          <rect x={62} y={40} width={22} height={50} rx={3} fill={V} />
          {[0, 1, 2, 3, 4].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={30 + c * 16} y={22 + r * 13} width={9} height={8} fill={COULEURS.or} opacity={(r + c + Math.floor(t * 4)) % 3 ? 1 : 0.35} />))}
        </g>
      );
      break;
    case 'ecole':
      dessin = (
        <g>
          <path d="M10 44 L50 18 L90 44 Z" fill={N} />
          <rect x={18} y={44} width={64} height={42} fill={N} />
          {[26, 42, 58, 74].map((x) => <rect key={x} x={x - 3} y={50} width={6} height={30} fill={COULEURS.or} />)}
          <path d="M50 18 V4" stroke={N} strokeWidth={3} />
          <path d={`M50 4 L${66 + b * 3} 8 L50 12 Z`} fill={V} />
        </g>
      );
      break;
    case 'affiliation':
      dessin = (
        <g>
          <path d="M10 56 L30 40 L46 50 L58 42 L90 58 L70 76 L52 66 L38 76 Z" fill={N} />
          {[0, 1, 2].map((k) => {
            const y = ((t * 60 + k * 30) % 60) - 10;
            return <circle key={k} cx={30 + k * 20} cy={y} r={7} fill={COULEURS.blanc} stroke={N} strokeWidth={3} />;
          })}
          <text x={78} y={34} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={20} fill={V}>
            10 %
          </text>
        </g>
      );
      break;
    case 'ondes':
      dessin = (
        <g>
          <rect x={38} y={12} width={24} height={44} rx={12} fill={N} />
          <path d="M28 46 Q50 70 72 46" stroke={N} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M50 62 V80 M38 84 H62" stroke={N} strokeWidth={6} strokeLinecap="round" />
          {[0, 1, 2].map((k) => {
            const h = 8 + Math.abs(Math.sin(t * 9 + k)) * 18;
            return (
              <g key={k}>
                <rect x={8 + k * 7} y={44 - h / 2} width={4} height={h} rx={2} fill={V} />
                <rect x={88 - k * 7} y={44 - h / 2} width={4} height={h} rx={2} fill={V} />
              </g>
            );
          })}
        </g>
      );
      break;
  }
  return (
    <svg width={taille} height={taille} viewBox="0 0 100 100">
      {dessin}
    </svg>
  );
};
