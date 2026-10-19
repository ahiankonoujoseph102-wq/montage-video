import React from 'react';

// Pictogrammes pleins, dessinés dans un carré de 100 × 100 (blanc sur une tuile colorée).
// Aucun logo de marque : les outils sont nommés en texte sous la tuile.
const G: Record<string, React.ReactNode> = {
  siteWeb: (
    <g>
      <rect x="14" y="20" width="72" height="58" rx="8" fill="#fff" />
      <rect x="14" y="20" width="72" height="14" rx="7" fill="#fff" opacity="0.6" />
      <circle cx="23" cy="27" r="3" fill="#FF5A5A" /><circle cx="32" cy="27" r="3" fill="#FFC21A" />
      <rect x="22" y="42" width="34" height="8" rx="3" fill="#1F5BFF" />
      <rect x="22" y="56" width="56" height="5" rx="2" fill="#9AA6C8" /><rect x="22" y="65" width="42" height="5" rx="2" fill="#9AA6C8" />
    </g>
  ),
  appli: (
    <g>
      <rect x="30" y="10" width="40" height="80" rx="9" fill="#fff" />
      {[0, 1, 2].map((r) => [0, 1].map((c) => (
        <rect key={`${r}${c}`} x={37 + c * 15} y={22 + r * 17} width="11" height="11" rx="3"
          fill={['#1F5BFF', '#22C55E', '#F0560F', '#A21CAF', '#FFC21A', '#38C6FF'][r * 2 + c]} />
      )))}
      <rect x="44" y="80" width="12" height="3" rx="1.5" fill="#9AA6C8" />
    </g>
  ),
  agentIA: (
    <g>
      <rect x="20" y="32" width="60" height="46" rx="12" fill="#fff" />
      <rect x="47" y="16" width="6" height="16" fill="#fff" /><circle cx="50" cy="15" r="6" fill="#FFC21A" />
      <circle cx="37" cy="53" r="7" fill="#1F5BFF" /><circle cx="63" cy="53" r="7" fill="#1F5BFF" />
      <rect x="38" y="66" width="24" height="5" rx="2.5" fill="#1F5BFF" />
      <rect x="10" y="46" width="10" height="16" rx="4" fill="#fff" /><rect x="80" y="46" width="10" height="16" rx="4" fill="#fff" />
    </g>
  ),
  video: (
    <g>
      <rect x="10" y="22" width="80" height="56" rx="10" fill="#fff" />
      <path d="M42 36 L64 50 L42 64 Z" fill="#E0337E" />
    </g>
  ),
  automatisation: (
    <g fill="#fff">
      <path d="M44 14 h12 l2 9 a28 28 0 0 1 8 4.5 l8.6 -3 6 10.4 -6.8 6 a28 28 0 0 1 0 9.2 l6.8 6 -6 10.4 -8.6 -3 a28 28 0 0 1 -8 4.5 l-2 9 h-12 l-2 -9 a28 28 0 0 1 -8 -4.5 l-8.6 3 -6 -10.4 6.8 -6 a28 28 0 0 1 0 -9.2 l-6.8 -6 6 -10.4 8.6 3 a28 28 0 0 1 8 -4.5 Z" />
      <circle cx="50" cy="50" r="11" fill="#7B2FF7" />
    </g>
  ),
  telephone: (
    <g>
      <rect x="28" y="8" width="44" height="84" rx="10" fill="#fff" />
      <rect x="33" y="18" width="34" height="62" rx="4" fill="#1F5BFF" opacity="0.85" />
      <circle cx="50" cy="86" r="3" fill="#9AA6C8" />
    </g>
  ),
  internet: (
    <g fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round">
      <path d="M14 42 a52 52 0 0 1 72 0" /><path d="M26 55 a35 35 0 0 1 48 0" /><path d="M38 68 a18 18 0 0 1 24 0" />
      <circle cx="50" cy="80" r="5" fill="#fff" stroke="none" />
    </g>
  ),
  discussion: (
    <g>
      <path d="M16 20 H84 a8 8 0 0 1 8 8 V62 a8 8 0 0 1 -8 8 H46 L28 84 V70 H16 a8 8 0 0 1 -8 -8 V28 a8 8 0 0 1 8 -8 Z" fill="#fff" />
      <circle cx="32" cy="45" r="5" fill="#0E8F62" /><circle cx="50" cy="45" r="5" fill="#0E8F62" /><circle cx="68" cy="45" r="5" fill="#0E8F62" />
    </g>
  ),
  clap: (
    <g>
      <rect x="14" y="40" width="72" height="44" rx="6" fill="#fff" />
      <path d="M14 26 L82 14 L86 30 L18 42 Z" fill="#fff" />
      <path d="M30 23 L38 37 M48 20 L56 34 M66 17 L74 31" stroke="#1F5BFF" strokeWidth="5" />
      <path d="M44 52 L60 62 L44 72 Z" fill="#1F5BFF" />
    </g>
  ),
  montage: (
    <g>
      <rect x="10" y="26" width="80" height="48" rx="8" fill="#fff" />
      <rect x="18" y="36" width="20" height="28" rx="3" fill="#F0560F" /><rect x="40" y="36" width="20" height="28" rx="3" fill="#FFC21A" />
      <rect x="62" y="36" width="20" height="28" rx="3" fill="#1F5BFF" />
      <path d="M50 18 V82" stroke="#E0337E" strokeWidth="5" />
    </g>
  ),
  navigateur: (
    <g>
      <circle cx="50" cy="50" r="38" fill="#fff" />
      <path d="M12 50 H88 M50 12 C30 30 30 70 50 88 M50 12 C70 30 70 70 50 88" stroke="#1F5BFF" strokeWidth="5" fill="none" />
    </g>
  ),
  stylo: (
    <g>
      <rect x="14" y="14" width="56" height="72" rx="8" fill="#fff" />
      <path d="M24 32 H58 M24 46 H58 M24 60 H44" stroke="#9AA6C8" strokeWidth="5" strokeLinecap="round" />
      <path d="M62 78 L86 40 L94 46 L70 84 L60 88 Z" fill="#FFC21A" stroke="#fff" strokeWidth="3" />
    </g>
  ),
  ciseaux: (
    <g>
      <rect x="10" y="40" width="80" height="20" rx="6" fill="#fff" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={13 + i * 19.5} y="43" width="16" height="14" rx="3"
        fill={['#F0560F', '#FFC21A', '#22C55E', '#1F5BFF'][i]} />)}
      <path d="M50 18 V34 M50 66 V82" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeDasharray="4 6" />
    </g>
  ),
  personnage: (
    <g>
      <circle cx="50" cy="34" r="16" fill="#fff" />
      <path d="M20 88 C20 62 34 54 50 54 C66 54 80 62 80 88 Z" fill="#fff" />
      <path d="M44 56 L50 70 L56 56" fill="#1F5BFF" />
    </g>
  ),
  fichier: (
    <g>
      <path d="M24 10 H60 L78 28 V90 H24 Z" fill="#fff" />
      <path d="M60 10 V28 H78" fill="#C9D2EA" />
      <path d="M42 46 L60 58 L42 70 Z" fill="#1F5BFF" />
    </g>
  ),
  loupe: (
    <g>
      <circle cx="42" cy="42" r="26" fill="none" stroke="#fff" strokeWidth="10" />
      <path d="M62 62 L86 86" stroke="#fff" strokeWidth="12" strokeLinecap="round" />
    </g>
  ),
  telecharger: (
    <g>
      <path d="M50 12 V60 M30 42 L50 62 L70 42" stroke="#fff" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="16" y="72" width="68" height="12" rx="6" fill="#fff" />
    </g>
  ),
  balance: (
    <g>
      <rect x="14" y="62" width="72" height="22" rx="6" fill="#fff" />
      <text x="50" y="79" textAnchor="middle" fontFamily="Montserrat" fontWeight="900" fontSize="17" fill="#C81E1E">30 Mo</text>
      <path d="M50 14 V52 M34 38 L50 54 L66 38" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" />
    </g>
  ),
  messages: (
    <g>
      <path d="M12 18 H70 a6 6 0 0 1 6 6 V50 a6 6 0 0 1 -6 6 H36 L22 68 V56 H12 a6 6 0 0 1 -6 -6 V24 a6 6 0 0 1 6 -6 Z" fill="#fff" />
      <path d="M40 46 H88 a6 6 0 0 1 6 6 V74 a6 6 0 0 1 -6 6 H82 V90 L70 80 H40 a6 6 0 0 1 -6 -6 V52 a6 6 0 0 1 6 -6 Z" fill="#fff" opacity="0.75" />
      <text x="41" y="45" textAnchor="middle" fontFamily="Montserrat" fontWeight="900" fontSize="22" fill="#C81E1E">5/5</text>
    </g>
  ),
  oreille: (
    <g>
      <path d="M30 40 C30 18 72 14 74 42 C75 58 60 62 58 74 C56 86 40 90 34 80" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
      <path d="M46 44 C46 34 60 34 60 44" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
      <path d="M12 12 L88 88" stroke="#FF4D4D" strokeWidth="9" strokeLinecap="round" />
    </g>
  ),
  etoiles: (
    <g fill="#fff">
      <path d="M38 14 L45 36 L68 38 L50 52 L56 75 L38 62 L20 75 L26 52 L8 38 L31 36 Z" />
      <path d="M74 52 L78 64 L91 65 L81 73 L84 86 L74 79 L64 86 L67 73 L57 65 L70 64 Z" opacity="0.7" />
    </g>
  ),
};

export const PICTOS = Object.keys(G);

// Tuile colorée (coins arrondis, reflet) avec le pictogramme blanc.
export const Tuile: React.FC<{nom: string; taille: number; couleur: string; k?: number; style?: React.CSSProperties}> = (
  {nom, taille, couleur, k = 1, style}) => (
  <svg width={taille} height={taille} viewBox="0 0 120 120" style={{overflow: 'visible', transform: `scale(${k})`,
    opacity: k > 0 ? 1 : 0, filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.35))', ...style}}>
    <rect x="2" y="2" width="116" height="116" rx="30" fill="#fff" />
    <rect x="8" y="8" width="104" height="104" rx="26" fill={couleur} />
    <rect x="8" y="8" width="104" height="50" rx="26" fill="#fff" opacity="0.16" />
    <g transform="translate(18 18) scale(0.84)">{G[nom]}</g>
  </svg>
);
