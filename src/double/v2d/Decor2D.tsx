// Copié du dépôt montage-videos (serie-animee, branche claude/pub-formation-v2) pour la vidéo de test automatique.
import {COULEURS, MISE_EN_PAGE} from '../theme';
import {hasard} from '../commun/hasard';

// Même décor que la version 3D, dessiné en aplats de couleur (SVG).

const Mur: React.FC = () => {
  // grandes facettes triangulaires, à peine contrastées
  const triangles = [];
  const pas = 180;
  for (let y = 0; y < 1920; y += pas) {
    for (let x = -pas; x < 1080 + pas; x += pas) {
      const d = (y / pas) % 2 ? pas / 2 : 0;
      const k = x * 7 + y;
      const t = 0.012 + hasard(k) * 0.03;
      triangles.push(
        <polygon key={`a${k}`} points={`${x + d},${y} ${x + d + pas},${y} ${x + d + pas / 2},${y + pas}`} fill="#ffffff" opacity={t} />,
        <polygon key={`b${k}`} points={`${x + d + pas / 2},${y + pas} ${x + d + pas},${y} ${x + d + pas * 1.5},${y + pas}`} fill="#000000" opacity={t * 1.4} />
      );
    }
  }
  return (
    <>
      <rect width={1080} height={1920} fill={COULEURS.nuitMur} />
      {triangles}
    </>
  );
};

const Fenetre: React.FC = () => {
  const immeubles = Array.from({length: 9}, (_, i) => ({
    x: 8 + i * 36 + hasard(i) * 8,
    l: 30 + hasard(i + 40) * 38,
    h: 80 + hasard(i + 70) * 250,
  }));
  return (
    <g>
      <defs>
        <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1d6e" />
          <stop offset="0.5" stopColor={COULEURS.violet} />
          <stop offset="1" stopColor="#f39a2b" />
        </linearGradient>
        <clipPath id="vitre">
          <rect x={0} y={920} width={330} height={720} />
        </clipPath>
      </defs>
      <g clipPath="url(#vitre)">
        <rect x={0} y={920} width={330} height={720} fill="url(#ciel)" />
        <circle cx={215} cy={1410} r={62} fill={COULEURS.orClair} />
        {immeubles.map((im, i) => (
          <g key={i}>
            <rect x={im.x} y={1640 - im.h} width={im.l} height={im.h} fill="#120c35" />
            {Array.from({length: Math.floor(im.h / 36)}, (_, k) =>
              hasard(i * 31 + k) > 0.45 ? (
                <rect key={k} x={im.x + 6 + hasard(k + i) * (im.l - 16)} y={1640 - 24 - k * 36} width={7} height={10} fill={COULEURS.or} />
              ) : null
            )}
          </g>
        ))}
      </g>
      <g fill="#070a1e">
        <rect x={-10} y={910} width={350} height={20} />
        <rect x={155} y={920} width={14} height={720} />
        <rect x={0} y={1185} width={330} height={14} />
        <rect x={322} y={910} width={20} height={740} />
      </g>
    </g>
  );
};

const Plante: React.FC = () => (
  <g>
    {Array.from({length: 9}, (_, i) => {
      const a = -0.9 + (i / 8) * 1.8;
      const h = 230 + hasard(i + 3) * 200;
      const bx = 985;
      const by = 1460;
      const tx = bx + Math.sin(a) * h * 0.55;
      const ty = by - Math.cos(a) * h;
      return (
        <path
          key={i}
          d={`M${bx - 14},${by} Q${(bx + tx) / 2 - 20},${(by + ty) / 2} ${tx},${ty} Q${(bx + tx) / 2 + 20},${(by + ty) / 2} ${bx + 14},${by} Z`}
          fill={i % 2 ? '#1f7a5a' : '#2c9a6c'}
        />
      );
    })}
    <path d="M915,1455 L1060,1455 L1040,1610 L935,1610 Z" fill={COULEURS.orFonce} />
    <path d="M988,1455 L1060,1455 L1040,1610 L988,1610 Z" fill={COULEURS.orOmbre} opacity={0.6} />
  </g>
);

const E = MISE_EN_PAGE.ecran;

export const Decor2D: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <Mur />
    <Fenetre />
    {/* cadre du grand écran */}
    <rect x={E.x - 18} y={E.y - 18} width={E.l + 36} height={E.h + 36} rx={22} fill="#04061a" />
    <rect x={E.x + 7} y={E.y + E.h + 32} width={E.l - 14} height={9} rx={4} fill={COULEURS.or} />
    {/* étagère et livres */}
    <rect x={865} y={975} width={240} height={12} fill="#1a2250" />
    {[COULEURS.violet, COULEURS.or, '#e8eaf6', COULEURS.violetFonce].map((c, i) => (
      <rect key={i} x={900 + i * 26} y={900 + (i % 2) * 12} width={20} height={75 - (i % 2) * 12} fill={c} transform={i === 3 ? 'rotate(14 988 975)' : undefined} />
    ))}
    <Plante />
  </svg>
);

export const Bureau2D: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <rect x={0} y={1600} width={1080} height={122} fill="#232b58" />
    <rect x={0} y={1600} width={1080} height={10} fill="#2c3570" />
    <rect x={0} y={1718} width={1080} height={10} fill={COULEURS.or} />
    <rect x={0} y={1728} width={1080} height={192} fill="#121836" />
    {/* mug */}
    <rect x={44} y={1556} width={58} height={78} rx={6} fill={COULEURS.or} />
    <rect x={76} y={1556} width={26} height={78} fill={COULEURS.orFonce} opacity={0.6} />
    <path d="M44,1574 q-26,4 -22,24 q4,18 22,16" stroke={COULEURS.or} strokeWidth={9} fill="none" />
    {/* ordinateur portable vu de dos */}
    <path d="M905,1640 L1080,1660 L1080,1676 L896,1652 Z" fill="#7d84a6" />
    <path d="M948,1475 L1080,1462 L1080,1660 L936,1642 Z" fill="#a3aac6" />
  </svg>
);
