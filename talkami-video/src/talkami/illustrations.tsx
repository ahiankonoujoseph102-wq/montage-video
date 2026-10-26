import {Easing, Img, interpolate, staticFile} from 'remotion';
import {Etoile} from '../commun/Ecran';
import {hasard} from '../commun/hasard';
import {pop, prog} from '../commun/temps';
import {Croix, Etape, Fond, Props, SansOrdinateur, Svg} from '../episodes/ep02/illustrations';
import {COULEURS, POLICE} from '../theme';

// Illustrations animées de la vidéo Talkami, dans le style 2D de la série (aplats, couleurs
// du logo, fond violet à rayons). Dessins génériques uniquement : aucune marque redessinée.
// Le dessin occupe la bande y 230–1060 ; le médaillon du double est en bas à gauche
// (x 22–244, y 1095–1317) et les sous-titres dessous (≈ 1400–1500) : rien d'important n'y va.

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const N = COULEURS.nuit;
const O = COULEURS.or;
const VI = COULEURS.violet;
const VF = COULEURS.violetFonce;
const B = COULEURS.blanc;
const ROUGE = '#ff4d4f';
const VERT = '#2ecc71';

// instant local (s depuis le début du plan) d'un mot nommé de la voix
const ici = (p: Props, cle: string) => p.temps[cle] - (p.tg - p.t);

const Gros: React.FC<{children: React.ReactNode; taille?: number; couleur?: string; contour?: number; style?: React.CSSProperties}> = ({children, taille = 90, couleur = B, contour = 14, style}) => (
  <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: taille, lineHeight: 1.02, color: couleur, WebkitTextStroke: `${contour}px ${N}`, paintOrder: 'stroke fill', textAlign: 'center', ...style}}>{children}</div>
);

const Coche: React.FC<{t: number; a: number; x: number; y: number; r?: number}> = ({t, a, x, y, r = 46}) => {
  const p = prog(t, a, a + 0.25, Easing.out(Easing.quad));
  return (
    <g transform={`translate(${x} ${y}) scale(${pop(t, a, 0.3)})`}>
      <circle r={r} fill={VERT} stroke={B} strokeWidth={6} />
      <path d={`M${-r * 0.45} 0 L${-r * 0.1} ${r * 0.35} L${r * 0.5} ${-r * 0.35}`} stroke={B} strokeWidth={r * 0.22} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={r * 2} strokeDashoffset={r * 2 * (1 - p)} />
    </g>
  );
};

const Billet: React.FC<{x: number; y: number; r: number; s?: number}> = ({x, y, r, s = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-110} y={-55} width={220} height={110} rx={12} fill="#3fae6b" stroke="#1f6e3f" strokeWidth={6} />
    <rect x={-92} y={-38} width={184} height={76} rx={8} fill="none" stroke="#bdf2cf" strokeWidth={4} />
    <circle r={26} fill="#bdf2cf" />
    <text y={10} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={28} fill="#1f6e3f">F</text>
  </g>
);

const Piece: React.FC<{x: number; y: number; s?: number; r?: number}> = ({x, y, s = 1, r = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <circle r={44} fill={O} stroke={COULEURS.orOmbre} strokeWidth={7} />
    <circle r={30} fill="none" stroke={COULEURS.orFonce} strokeWidth={4} />
    <text y={11} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={30} fill={COULEURS.orOmbre}>F</text>
  </g>
);

// Personne anonyme (silhouette ronde, sans visage reconnaissable).
const Silhouette: React.FC<{x: number; y: number; s?: number; c: string}> = ({x, y, s = 1, c}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cy={-60} r={34} fill={c} />
    <path d="M-56 40 Q-56 -16 0 -16 Q56 -16 56 40 Z" fill={c} />
  </g>
);

// ------------------------------------------------------------------ accroche (0 – 3,7 s)

export const Accroche: React.FC<Props> = (p) => {
  const {t} = p;
  const tampon = ici(p, 'apprendre1');
  const choc = interpolate(t, [0, 0.25], [1.06, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const tremble = Math.exp(-t * 6) * Math.sin(t * 70) * 14 + (t > tampon ? Math.exp(-(t - tampon) * 8) * Math.sin((t - tampon) * 80) * 10 : 0);
  const sTampon = interpolate(t, [tampon, tampon + 0.12, tampon + 0.22], [2.4, 0.92, 1], clamp);
  return (
    <Fond t={t} teinte="#4a1a6e">
      {/* billets qui volent */}
      <Svg y={230} h={900}>
        <g opacity={0.55}>
        {Array.from({length: 9}, (_, i) => {
          const v = 0.6 + hasard(i) * 0.8;
          const y = 980 - ((t * 260 * v + hasard(i + 4) * 900) % 1100);
          return <Billet key={i} x={60 + hasard(i + 7) * 700} y={y} r={Math.sin(t * 2 + i) * 30 + i * 25} s={0.55 + hasard(i + 2) * 0.35} />;
        })}
        </g>
      </Svg>
      {/* titre (miniature) */}
      <div style={{position: 'absolute', left: 40, right: 130, top: 236, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
        <div style={{padding: '8px 26px', borderRadius: 999, background: VI, color: N, fontFamily: POLICE, fontWeight: 800, fontSize: 38}}>Mon histoire vraie</div>
        <Gros taille={72}>
          J’ai créé mon prof d’anglais <span style={{color: O}}>avec l’IA</span>
        </Gros>
      </div>
      {/* prix */}
      <div style={{position: 'absolute', left: 0, right: 90, top: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(${tremble}px) scale(${choc})`}}>
        <Gros taille={176} couleur={O} contour={18} style={{letterSpacing: -4, textShadow: `0 0 60px ${O}aa`}}>350 000 F</Gros>
        <Gros taille={70}>CFA · <span style={{color: VI}}>6 mois</span> d’anglais</Gros>
      </div>
      {/* tampon */}
      {t >= tampon - 0.02 ? (
        <div style={{position: 'absolute', left: 150, top: 640, transform: `rotate(-12deg) scale(${sTampon})`, padding: '14px 40px', border: `14px solid ${ROUGE}`, borderRadius: 30, color: ROUGE, fontFamily: POLICE, fontWeight: 800, fontSize: 120, letterSpacing: 4, background: '#ffffff10', textShadow: '0 4px 20px #000a', opacity: interpolate(t, [tampon, tampon + 0.08], [0, 1], clamp)}}>
          TROP CHER !
        </div>
      ) : null}
    </Fond>
  );
};

// ------------------------------------------------------------------ pas d'argent

export const PasArgent: React.FC<Props> = ({t}) => {
  const ouvre = prog(t, 0.1, 0.45, Easing.out(Easing.back(1.6)));
  return (
    <Fond t={t} teinte="#3a1730" libelle={<>Je n’avais <span style={{color: ROUGE}}>pas</span> cet argent</>}>
      <Svg y={260} h={680}>
        <g transform={`translate(410 380) scale(${pop(t, 0, 0.3)}) rotate(${Math.sin(t * 4) * 3})`}>
          {/* portefeuille vide */}
          <rect x={-250} y={-150} width={500} height={300} rx={40} fill="#7a4a2b" stroke={N} strokeWidth={10} />
          <path d={`M-250 -150 L250 -150 L250 ${-150 - 170 * ouvre} L-250 ${-150 - 170 * ouvre} Z`} fill="#8f5934" stroke={N} strokeWidth={10} />
          <rect x={120} y={-40} width={150} height={90} rx={30} fill="#5c371f" stroke={N} strokeWidth={8} />
          <circle cx={190} cy={5} r={16} fill={O} />
          {/* poussière */}
          {[0, 1, 2, 3, 4].map((k) => (
            <circle key={k} cx={-150 + k * 70} cy={-170 - prog(t, 0.3, 1.2) * (90 + k * 30)} r={10 + k * 2} fill="#c9b8a6" opacity={1 - prog(t, 0.6, 1.4)} />
          ))}
        </g>
        {/* papillon de nuit qui s'échappe */}
        <g transform={`translate(${410 + prog(t, 0.35, 1.4) * 260 + Math.sin(t * 9) * 20} ${200 - prog(t, 0.35, 1.4) * 170}) scale(${prog(t, 0.3, 0.4)})`}>
          <ellipse rx={12} ry={30} fill="#d8cfc2" />
          <ellipse cx={-30} cy={-6} rx={30} ry={20} fill="#ece4d8" transform={`rotate(${-20 + Math.sin(t * 40) * 25})`} />
          <ellipse cx={30} cy={-6} rx={30} ry={20} fill="#ece4d8" transform={`rotate(${20 - Math.sin(t * 40) * 25})`} />
        </g>
      </Svg>
    </Fond>
  );
};

// ------------------------------------------------------------------ téléphone, sans ordinateur, sans code

export const Telephone: React.FC<Props> = ({t}) => (
  <Fond t={t} libelle={<>Avec mon <span style={{color: O}}>téléphone</span></>}>
    <Svg y={240} h={720}>
      <g transform={`translate(410 380) scale(${pop(t, 0, 0.3) * 1.15}) rotate(${Math.sin(t * 3) * 6})`}>
        <rect x={-150} y={-290} width={300} height={580} rx={50} fill="#2b3160" stroke={B} strokeWidth={10} />
        <rect x={-122} y={-250} width={244} height={500} rx={24} fill={VF} />
        <rect x={-90} y={-200} width={180} height={40} rx={20} fill={O} />
        <rect x={-90} y={-130} width={180} height={140} rx={16} fill={VI} />
        <circle cx={0} cy={-60} r={40} fill={O} opacity={0.6 + 0.4 * Math.sin(t * 8)} />
        <rect x={-90} y={40} width={140} height={20} rx={10} fill="#ffffff66" />
        <rect x={-90} y={80} width={180} height={20} rx={10} fill="#ffffff66" />
      </g>
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <g key={k} transform={`translate(${410 + Math.cos(k * 1.05 + t * 2) * 320} ${380 + Math.sin(k * 1.05 + t * 2) * 300}) scale(${pop(t, 0.15 + k * 0.05, 0.3)})`}>
          <path d="M0 -26 Q4 -4 26 0 Q4 4 0 26 Q-4 4 -26 0 Q-4 -4 0 -26Z" fill={k % 2 ? O : VI} />
        </g>
      ))}
    </Svg>
  </Fond>
);

export const SansCode: React.FC<Props> = ({t}) => {
  const lignes = [[0, 280, O], [40, 360, VI], [40, 220, B], [80, 300, '#5ad1ff'], [40, 260, VI], [0, 180, O]] as const;
  return (
    <Fond t={t} libelle={<>Sans savoir <span style={{color: O}}>coder</span></>} teinte="#3a1730">
      <Svg>
        <g transform={`translate(410 340) scale(${pop(t, 0, 0.3)})`}>
          <rect x={-310} y={-250} width={620} height={500} rx={30} fill="#0d1029" stroke={VI} strokeWidth={8} />
          {[0, 1, 2].map((k) => <circle key={k} cx={-270 + k * 34} cy={-212} r={10} fill={[ROUGE, O, VERT][k]} />)}
          <text x={180} y={-196} fontFamily="Poppins" fontWeight={800} fontSize={56} fill={O}>{'</>'}</text>
          {lignes.map(([x, l, c], i) => (
            <rect key={i} x={-260 + x} y={-150 + i * 62} width={l * prog(t, 0.05 + i * 0.05, 0.25 + i * 0.05)} height={30} rx={15} fill={c} />
          ))}
        </g>
        <Croix t={t} a={0.35} cx={410} cy={340} r={230} />
      </Svg>
    </Fond>
  );
};

// ------------------------------------------------------------------ carte (Adidogomé)

export const Carte: React.FC<Props> = (p) => {
  const {t, phase = 1} = p;
  const chute = interpolate(t, [0.15, 0.45, 0.55, 0.62], [-420, 0, -40, 0], clamp);
  const lycee = phase === 2 ? ici(p, 'lycee') : 99;
  return (
    <Fond t={t} teinte="#1d3a6e" libelle={phase === 1 ? <>Un formateur à <span style={{color: O}}>Adidogomé</span></> : undefined}>
      <Svg y={250} h={700}>
        <g transform={`translate(410 360) scale(${pop(t, 0, 0.35)}) rotate(-4)`}>
          <rect x={-380} y={-290} width={760} height={560} rx={40} fill="#e9eef7" stroke={B} strokeWidth={10} />
          {/* rues */}
          {[[-380, -120, 380, -60], [-380, 120, 380, 160], [-140, -290, -100, 270], [160, -290, 120, 270], [-380, 260, 380, -260]].map(([a, b, c, d], i) => (
            <path key={i} d={`M${a} ${b} L${c} ${d}`} stroke={i === 4 ? '#ffd27a' : '#c4ccdd'} strokeWidth={i === 4 ? 30 : 24} strokeLinecap="round" />
          ))}
          <rect x={-330} y={-250} width={150} height={100} rx={16} fill="#bfe3c4" />
          <rect x={210} y={180} width={140} height={70} rx={16} fill="#bfe3c4" />
          <circle cx={260} cy={-200} r={50} fill="#a9d4f5" />
          {/* repère */}
          <g transform={`translate(0 ${chute - 40})`}>
            <ellipse cy={120} rx={60 * prog(t, 0.4, 0.6)} ry={16} fill="#0005" />
            <path d="M0 110 C-90 0 -90 -40 -90 -70 A90 90 0 1 1 90 -70 C90 -40 90 0 0 110 Z" fill={ROUGE} stroke={B} strokeWidth={8} />
            <circle cy={-70} r={34} fill={B} />
          </g>
        </g>
      </Svg>
      <div style={{position: 'absolute', left: 0, right: 90, top: phase === 1 ? 300 : 280, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <div style={{transform: `scale(${pop(t, 0.55, 0.3)})`, padding: '10px 34px', borderRadius: 24, background: N, border: `5px solid ${O}`}}>
          <Gros taille={64} couleur={O} contour={0}>ADIDOGOMÉ</Gros>
        </div>
      </div>
      {phase === 2 ? (
        <div style={{position: 'absolute', left: 0, right: 90, top: 860, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, lycee - 0.05, 0.35)})`}}>
          <div style={{padding: '14px 40px', borderRadius: 999, background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`}}>
            <Gros taille={62} couleur={N} contour={0}>Lycée Moderne 2</Gros>
          </div>
        </div>
      ) : null}
    </Fond>
  );
};

// ------------------------------------------------------------------ prix (6 mois, 350 000 F ; puis barré)

export const Prix: React.FC<Props> = (p) => {
  const {t, phase = 2} = p;
  if (phase === 2) {
    const mois = ici(p, 'sixMois');
    const prix = ici(p, 'prix2');
    const pages = Math.min(6, Math.max(0, Math.floor((t - mois) / 0.1) + 1));
    const choc = interpolate(t, [prix, prix + 0.12, prix + 0.25], [1.6, 0.95, 1], clamp);
    return (
      <Fond t={t} teinte="#4a1a6e">
        <Svg y={260} h={420}>
          <g transform={`translate(410 200) scale(${pop(t, 0, 0.3)})`}>
            <rect x={-170} y={-150} width={340} height={300} rx={30} fill={B} stroke={N} strokeWidth={8} />
            <rect x={-170} y={-150} width={340} height={80} rx={30} fill={ROUGE} />
            <rect x={-170} y={-100} width={340} height={30} fill={ROUGE} />
            {[-90, 90].map((x) => <rect key={x} x={x - 10} y={-180} width={20} height={60} rx={10} fill={N} />)}
            <text y={80} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={150} fill={N}>{pages}</text>
          </g>
        </Svg>
        <div style={{position: 'absolute', left: 0, right: 90, top: 680, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
          <Gros taille={88} style={{transform: `scale(${pop(t, mois, 0.3)})`}}>6 MOIS</Gros>
          {t >= prix - 0.02 ? <Gros taille={150} couleur={O} contour={16} style={{transform: `scale(${choc}) rotate(-3deg)`, textShadow: `0 0 60px ${O}aa`}}>350 000 F</Gros> : null}
        </div>
      </Fond>
    );
  }
  // phase 3 : « 350 000 F … je l'ai construit moi-même, pour presque rien »
  const barre = ici(p, 'construit');
  const rien = ici(p, 'presqueRien');
  const l = prog(t, barre, barre + 0.3, Easing.out(Easing.quad));
  return (
    <Fond t={t} teinte="#173a4a">
      <div style={{position: 'absolute', left: 0, right: 90, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{position: 'relative', transform: `scale(${pop(t, 0, 0.3) * (1 - 0.25 * prog(t, rien, rien + 0.3))})`, opacity: 1 - 0.4 * prog(t, rien, rien + 0.3)}}>
          <Gros taille={150} couleur={O} contour={16}>350 000 F</Gros>
          <div style={{position: 'absolute', left: -20, top: 80, width: `${l * 105}%`, height: 26, borderRadius: 13, background: ROUGE, transform: 'rotate(-8deg)', boxShadow: '0 4px 16px #000a'}} />
        </div>
        <div style={{marginTop: 30, transform: `scale(${pop(t, barre + 0.1, 0.3)})`}}>
          <Gros taille={64}>construit <span style={{color: O}}>moi-même</span></Gros>
        </div>
        {t >= rien - 0.02 ? (
          <div style={{marginTop: 40, padding: '20px 50px', borderRadius: 999, background: VERT, transform: `scale(${pop(t, rien, 0.35)}) rotate(-3deg)`, boxShadow: `0 0 50px ${VERT}aa`}}>
            <Gros taille={92} couleur={B} contour={0}>PRESQUE RIEN</Gros>
          </div>
        ) : null}
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ ampoule (l'IA, je la maîtrise)

export const Ampoule: React.FC<Props> = ({t}) => {
  const allume = prog(t, 0.15, 0.35);
  return (
    <Fond t={t} teinte="#3b2f8a" libelle={<>L’IA, je la <span style={{color: O}}>maîtrise</span></>}>
      <Svg y={240} h={700}>
        <g transform={`translate(410 360) scale(${pop(t, 0, 0.3)})`}>
          {Array.from({length: 12}, (_, i) => (
            <path key={i} d="M0 -250 L0 -310" stroke={O} strokeWidth={18} strokeLinecap="round" opacity={allume} transform={`rotate(${i * 30 + t * 20}) scale(${0.9 + 0.1 * Math.sin(t * 10 + i)})`} />
          ))}
          <circle cy={-30} r={190} fill={allume > 0.5 ? O : '#8f96b3'} style={{filter: `drop-shadow(0 0 ${60 * allume}px ${O})`}} />
          <rect x={-90} y={150} width={180} height={50} rx={12} fill="#c4ccdd" />
          <rect x={-80} y={205} width={160} height={40} rx={12} fill="#9aa3c0" />
          <text y={20} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={150} fill={N}>IA</text>
        </g>
      </Svg>
    </Fond>
  );
};

// ------------------------------------------------------------------ construire (créer moi-même)

export const Construire: React.FC<Props> = ({t, d}) => {
  const blocs = [
    {c: O, y: -200, h: 60, w: 200},
    {c: VI, y: -110, h: 170, w: 200},
    {c: '#5ad1ff', y: 90, h: 50, w: 200},
    {c: VERT, y: 165, h: 50, w: 140},
  ];
  return (
    <Fond t={t} teinte="#2a1d6e" libelle={<>Créer <span style={{color: O}}>moi-même</span> ce dont j’ai besoin</>}>
      <Svg y={240} h={700}>
        <g transform={`translate(410 360) scale(${pop(t, 0, 0.3) * 1.1})`}>
          <rect x={-150} y={-290} width={300} height={580} rx={50} fill="#2b3160" stroke={B} strokeWidth={10} />
          <rect x={-122} y={-250} width={244} height={500} rx={24} fill={N} />
          {blocs.map((b, i) => {
            const a = 0.15 + i * (Math.max(0.6, d - 0.6) / 4);
            const k = prog(t, a, a + 0.3, Easing.out(Easing.back(1.5)));
            const dx = (i % 2 ? 1 : -1) * 420 * (1 - k);
            return <rect key={i} x={-100 + dx} y={b.y - 260 * (1 - k)} width={b.w} height={b.h} rx={14} fill={b.c} opacity={k > 0 ? 1 : 0} />;
          })}
        </g>
        {/* clé et marteau qui tournent autour */}
        <g transform={`translate(${410 + Math.cos(t * 3) * 300} ${360 + Math.sin(t * 3) * 260}) rotate(${t * 200})`}>
          <rect x={-14} y={-60} width={28} height={120} rx={10} fill="#c4ccdd" />
          <rect x={-50} y={-70} width={100} height={36} rx={10} fill={O} />
        </g>
      </Svg>
    </Fond>
  );
};

// ------------------------------------------------------------------ révélation

export const Revelation: React.FC<Props> = ({t}) => {
  const rideau = prog(t, 0.05, 0.55, Easing.inOut(Easing.cubic));
  return (
    <Fond t={t} teinte="#4a2a8a">
      <div style={{position: 'absolute', left: 540 - 450, top: 640 - 450, width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${O}66, transparent 65%)`, transform: `scale(${0.6 + 0.6 * rideau})`}} />
      {Array.from({length: 18}, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const r = 120 + prog(t, 0.3, 1.0) * (260 + hasard(i) * 200);
        return (
          <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * r, top: 640 + Math.sin(a) * r, opacity: 1 - prog(t, 0.8, 1.2), transform: `rotate(${t * 200 + i * 20}deg)`}}>
            <Etoile taille={26 + hasard(i + 3) * 30} couleur={i % 2 ? O : VI} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 90, top: 470, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
        <Gros taille={92} style={{transform: `scale(${pop(t, 0.25, 0.35)})`}}>VOICI LE</Gros>
        <Gros taille={150} couleur={O} contour={18} style={{transform: `scale(${pop(t, 0.4, 0.35) * (1 + 0.03 * Math.sin(t * 9))})`, textShadow: `0 0 60px ${O}`}}>RÉSULTAT</Gros>
      </div>
      {/* rideaux */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 540, height: 1920, background: `linear-gradient(90deg, #3a0f4a, #6a1f7a)`, transform: `translateX(${-rideau * 560}px)`}} />
      <div style={{position: 'absolute', left: 540, top: 0, width: 540, height: 1920, background: `linear-gradient(270deg, #3a0f4a, #6a1f7a)`, transform: `translateX(${rideau * 560}px)`}} />
    </Fond>
  );
};

// ------------------------------------------------------------------ situations (marché, travail, voyage)

export const Situations: React.FC<Props> = (p) => {
  const {t} = p;
  const cartes = [
    {img: 'marche', nom: 'Au marché', a: 0, r: -6, x: 60, y: 300},
    {img: 'bureau', nom: 'Au travail', a: ici(p, 'travail'), r: 5, x: 330, y: 470},
    {img: 'voyage', nom: 'En voyage', a: ici(p, 'voyage'), r: -3, x: 560, y: 300},
  ];
  return (
    <Fond t={t} teinte="#1d3a6e">
      {cartes.map((c, i) => {
        const s = pop(t, c.a, 0.35);
        if (s <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: c.x, top: c.y, width: 420, transform: `rotate(${c.r + Math.sin(t * 2 + i) * 1.5}deg) scale(${s})`, padding: 14, background: B, borderRadius: 26, boxShadow: '0 20px 50px #000b'}}>
            <div style={{width: 392, height: 470, borderRadius: 16, overflow: 'hidden'}}>
              <Img src={staticFile(`talkami/images/${c.img}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + 0.05 * (t - c.a)})`}} />
            </div>
            <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 52, color: N, textAlign: 'center', marginTop: 8}}>{c.nom}</div>
          </div>
        );
      })}
    </Fond>
  );
};

// ------------------------------------------------------------------ résultats 1, 2, 3

const RANGS = ['D’ABORD', 'ENSUITE', 'ET ENFIN'];

export const Resultat: React.FC<Props> = ({t, n = 1, texte}) => {
  const tour = interpolate(t, [0, 0.4], [-200, 0], {...clamp, easing: Easing.out(Easing.back(1.4))});
  return (
    <Fond t={t} teinte={['#1d3a6e', '#2a1d6e', '#4a1a6e'][n - 1]}>
      <div style={{position: 'absolute', left: 0, right: 90, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <Gros taille={74} couleur={VI} style={{letterSpacing: 6, opacity: prog(t, 0.05, 0.25)}}>{RANGS[n - 1]}</Gros>
        <div style={{width: 320, height: 320, borderRadius: '50%', background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, display: 'grid', placeItems: 'center', fontFamily: POLICE, fontSize: 230, fontWeight: 800, color: N, transform: `rotate(${tour}deg) scale(${pop(t, 0, 0.35) * (1 + 0.03 * Math.sin(t * 8))})`, boxShadow: `0 0 80px ${O}aa`}}>
          {n}
        </div>
        <Gros taille={76} couleur={B} style={{transform: `scale(${pop(t, 0.3, 0.35)})`}}>{texte}</Gros>
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ niveaux A1 → C2

export const Niveaux: React.FC<Props> = ({t, d}) => {
  const niveaux = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const monte = prog(t, 0.2, Math.max(0.8, d - 0.2), Easing.inOut(Easing.quad));
  return (
    <Fond t={t} teinte="#173a4a" libelle={<>Mon niveau <span style={{color: VERT}}>progresse</span></>}>
      <Svg y={250} h={680}>
        {niveaux.map((nv, i) => {
          const h = 90 + i * 85;
          const actif = monte * 5 >= i - 0.01;
          return (
            <g key={nv} transform={`translate(${50 + i * 125} ${640 - h}) scale(1 ${pop(t, i * 0.05, 0.3)})`} style={{transformOrigin: `0 ${h}px`}}>
              <rect width={100} height={h} rx={16} fill={actif ? (i < 2 ? VERT : O) : '#ffffff22'} stroke={actif ? B : '#ffffff44'} strokeWidth={5} />
              <text x={50} y={h - 22} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={40} fill={actif ? N : '#ffffffaa'}>{nv}</text>
            </g>
          );
        })}
        {/* flèche qui monte */}
        <g transform={`translate(${80 + monte * 625} ${470 - monte * 430})`}>
          <path d="M-60 60 L0 0 L60 60" stroke={B} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </Svg>
    </Fond>
  );
};

// ------------------------------------------------------------------ communauté

export const Communaute: React.FC<Props> = ({t}) => {
  const couleurs = [VI, O, '#5ad1ff', VERT, '#ff9ad5', '#ffb86b', VI, O];
  return (
    <Fond t={t} teinte="#2a1d6e" libelle={<>D’autres apprennent <span style={{color: O}}>avec moi</span></>}>
      <Svg y={240} h={700}>
        {couleurs.map((c, i) => {
          const a = (i / couleurs.length) * Math.PI * 2 + t * 0.4;
          const x = 410 + Math.cos(a) * 300;
          const y = 350 + Math.sin(a) * 250;
          const s = pop(t, 0.15 + i * 0.1, 0.3);
          return (
            <g key={i}>
              <path d={`M410 350 L${x} ${y}`} stroke={c} strokeWidth={6} strokeDasharray="14 12" strokeDashoffset={-t * 60} opacity={s} />
              <Silhouette x={x} y={y + 20} s={s * 0.9} c={c} />
            </g>
          );
        })}
        <g transform={`translate(410 350) scale(${pop(t, 0, 0.3) * (1 + 0.04 * Math.sin(t * 6))})`}>
          <circle r={120} fill={N} stroke={O} strokeWidth={10} />
          <text y={22} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={58} fill={B}>Talk<tspan fill={O}>ami</tspan></text>
        </g>
      </Svg>
    </Fond>
  );
};

// ------------------------------------------------------------------ et ils paient

export const IlsPaient: React.FC<Props> = ({t}) => (
  <Fond t={t} teinte="#4a3a0a">
    <Svg y={200} h={1000}>
      {Array.from({length: 16}, (_, i) => {
        const v = 700 + hasard(i) * 500;
        const y = -100 + ((t + hasard(i + 3) * 0.8) * v) % 1100;
        return <Piece key={i} x={40 + hasard(i + 9) * 740} y={y} s={0.7 + hasard(i + 1) * 0.6} r={t * 200 + i * 30} />;
      })}
    </Svg>
    <div style={{position: 'absolute', left: 0, right: 90, top: 520, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <Gros taille={110} style={{transform: `scale(${pop(t, 0, 0.3)})`}}>ET ILS</Gros>
      <Gros taille={190} couleur={O} contour={20} style={{transform: `scale(${pop(t, 0.12, 0.35) * (1 + 0.04 * Math.sin(t * 10))}) rotate(-4deg)`, textShadow: `0 0 70px ${O}`}}>PAIENT</Gros>
    </div>
  </Fond>
);

// ------------------------------------------------------------------ paiements (capture floutée)

// Capture 1080 × 2400 (projets/talkami/paiements_floutes.png) : seules les trois alertes
// « Nouveau paiement » de Talkami sont nettes. Montants et dates relevés sur la capture, jamais modifiés.
const ALERTES = [
  {montant: '2 000 FCFA', date: '25 oct.', y: 646, x0: 205, x1: 800},
  {montant: '14 000 FCFA', date: '22 oct.', y: 1650, x0: 205, x1: 815},
  {montant: '7 500 FCFA', date: '21 oct.', y: 1901, x0: 205, x1: 760},
];

export const Paiements: React.FC<Props> = (p) => {
  const {t} = p;
  const zooms = [ici(p, 'clients'), ici(p, 'abonnement'), ici(p, 'togo')];
  const retour = ici(p, 'ouest') + 0.1;
  // cadrage : vue d'ensemble (échelle 0,44, toute la capture) puis gros plan sur chaque montant
  const vue = {s: 0.44, cy: 1200};
  const plans = [vue, ...ALERTES.map((a) => ({s: 1.05, cy: a.y})), vue];
  const instants = [0, ...zooms, retour];
  let k = 0;
  while (k + 1 < instants.length && t >= instants[k + 1]) k++;
  const de = plans[k];
  const vers = plans[Math.min(k + 1, plans.length - 1)];
  const q = k + 1 < instants.length ? prog(t, instants[k + 1] - 0.3, instants[k + 1], Easing.inOut(Easing.cubic)) : 0;
  const s = de.s + (vers.s - de.s) * q;
  const cy = de.cy + (vers.cy - de.cy) * q;
  const entree = interpolate(t, [0, 0.4], [1, 0], {...clamp, easing: Easing.out(Easing.back(1.3))});
  const actif = k >= 1 && k <= 3 ? k - 1 : -1;
  const centreY = 760; // centre de la zone visible
  return (
    <Fond t={t} teinte="#1b4a3a">
      <div style={{position: 'absolute', left: 0, right: 0, top: 236, height: 1060, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 540 - 540 * s - 40, top: centreY - 236 - cy * s, width: 1080, height: 2400, transform: `translateY(${entree * 1200}px) scale(${s})`, transformOrigin: '0 0', borderRadius: 40, overflow: 'hidden', boxShadow: '0 30px 80px #000c'}}>
          <Img src={staticFile('talkami/paiements_floutes.png')} style={{width: 1080, height: 2400}} />
          <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={2400}>
            {ALERTES.map((a, i) => {
              const a0 = zooms[i] + 0.05;
              const l = prog(t, a0, a0 + 0.35, Easing.out(Easing.quad));
              const per = 2 * Math.PI * Math.sqrt(((a.x1 - a.x0) / 2 + 40) ** 2 / 2 + 70 ** 2 / 2);
              return (
                <ellipse key={i} cx={(a.x0 + a.x1) / 2} cy={a.y} rx={(a.x1 - a.x0) / 2 + 40} ry={70} fill="none" stroke={O} strokeWidth={12} strokeLinecap="round" strokeDasharray={per} strokeDashoffset={per * (1 - l)} transform={`rotate(-2 ${(a.x0 + a.x1) / 2} ${a.y})`} style={{filter: `drop-shadow(0 0 14px ${O})`}} />
              );
            })}
          </svg>
        </div>
      </div>
      {/* titre */}
      <div style={{position: 'absolute', left: 0, right: 90, top: 240, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, 0.2, 0.3)})`, opacity: 1 - prog(t, zooms[0] - 0.3, zooms[0])}}>
        <div style={{padding: '10px 34px', borderRadius: 24, background: N, border: `5px solid ${O}`}}>
          <Gros taille={60} couleur={O} contour={0}>MES PREMIERS PAIEMENTS</Gros>
        </div>
      </div>
      {/* étiquette du montant en gros plan */}
      {actif >= 0 ? (
        <div style={{position: 'absolute', left: 0, right: 90, top: 940, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, zooms[actif] + 0.15, 0.35)})`}}>
          <div style={{padding: '16px 40px', borderRadius: 999, background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, boxShadow: `0 0 50px ${O}aa`}}>
            <Gros taille={70} couleur={N} contour={0}>+ {ALERTES[actif].montant} · {ALERTES[actif].date}</Gros>
          </div>
        </div>
      ) : null}
    </Fond>
  );
};

// ------------------------------------------------------------------ nuit (pendant que je dors)

export const Nuit: React.FC<Props> = ({t}) => (
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #050a2a 0%, #1a1450 60%, #2a1d6e 100%)', overflow: 'hidden', fontFamily: POLICE}}>
    {Array.from({length: 40}, (_, i) => (
      <div key={i} style={{position: 'absolute', left: hasard(i) * 1000, top: 220 + hasard(i + 50) * 700, width: 6, height: 6, borderRadius: 3, background: B, opacity: 0.3 + 0.7 * Math.abs(Math.sin(t * 2 + i))}} />
    ))}
    {/* lune */}
    <div style={{position: 'absolute', left: 640, top: 270, width: 200, height: 200, borderRadius: '50%', background: '#fff3c4', boxShadow: '0 0 80px #fff3c4aa', transform: `scale(${pop(t, 0, 0.4)})`}}>
      <div style={{position: 'absolute', left: 60, top: -20, width: 200, height: 200, borderRadius: '50%', background: '#0e0f3a'}} />
    </div>
    {/* Zzz */}
    {[0, 1, 2].map((k) => {
      const c = ((t * 0.8 + k / 3) % 1);
      return <div key={k} style={{position: 'absolute', left: 230 + c * 120, top: 520 - c * 220, fontSize: 60 + k * 16, fontWeight: 800, color: VI, opacity: Math.sin(c * Math.PI)}}>Z</div>;
    })}
    {/* téléphone qui travaille */}
    <svg style={{position: 'absolute', left: 300, top: 470}} width={480} height={560} viewBox="0 0 480 560">
      <g transform={`translate(240 280) scale(${pop(t, 0.1, 0.35)})`}>
        <rect x={-130} y={-250} width={260} height={500} rx={44} fill="#2b3160" stroke={B} strokeWidth={8} />
        <rect x={-106} y={-215} width={212} height={430} rx={20} fill={N} />
        {[0, 1, 2].map((k) => {
          const a = 0.4 + k * 0.6;
          return (
            <g key={k} transform={`translate(0 ${-140 + k * 120}) scale(${pop(t, a, 0.3)})`}>
              <rect x={-86} y={-46} width={172} height={92} rx={14} fill={[VI, O, '#5ad1ff'][k]} />
              <path d="M-14 -22 L22 0 L-14 22 Z" fill={N} />
            </g>
          );
        })}
        {/* engrenage */}
        <g transform={`translate(120 -230) rotate(${t * 120})`}>
          {Array.from({length: 8}, (_, i) => <rect key={i} x={-10} y={-56} width={20} height={30} rx={4} fill={O} transform={`rotate(${i * 45})`} />)}
          <circle r={36} fill={O} />
          <circle r={14} fill="#2b3160" />
        </g>
      </g>
    </svg>
    <div style={{position: 'absolute', left: 60, right: 140, top: 1010, textAlign: 'center', transform: `scale(${pop(t, 0.15, 0.35)})`}}>
      <Gros taille={62}>Pendant que je <span style={{color: VI}}>dors</span>…</Gros>
    </div>
  </div>
);

// ------------------------------------------------------------------ 1 problème → 3 choses

export const TroisChoses: React.FC<Props> = (p) => {
  const {t, phase = 1} = p;
  if (phase === 1) {
    const mien = ici(p, 'leMien');
    return (
      <Fond t={t} teinte="#3a1730">
        <div style={{position: 'absolute', left: 0, right: 90, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
          <div style={{width: 300, height: 300, borderRadius: '50%', background: ROUGE, display: 'grid', placeItems: 'center', transform: `scale(${pop(t, 0, 0.35)})`, boxShadow: `0 0 70px ${ROUGE}aa`}}>
            <Gros taille={220} contour={0}>1</Gros>
          </div>
          <Gros taille={84} style={{transform: `scale(${pop(t, 0.2, 0.3)})`}}>SEUL PROBLÈME</Gros>
          {t >= mien - 0.02 ? <Gros taille={100} couleur={O} style={{transform: `scale(${pop(t, mien, 0.3)}) rotate(-4deg)`}}>LE MIEN</Gros> : null}
        </div>
      </Fond>
    );
  }
  if (phase === 2) {
    const trois = ici(p, 'troisChoses');
    const sep = prog(t, trois - 0.1, trois + 0.35, Easing.out(Easing.back(1.5)));
    return (
      <Fond t={t} teinte="#2a1d6e">
        <Svg y={300} h={520}>
          {[-1, 0, 1].map((k) => (
            <g key={k} transform={`translate(${410 + k * 270 * sep} ${240})`}>
              <circle r={120} fill={k === 0 && sep < 0.2 ? ROUGE : [VI, O, VERT][k + 1]} stroke={B} strokeWidth={8} />
              <text y={60} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={170} fill={N}>{sep < 0.2 ? '1' : k + 2}</text>
            </g>
          ))}
          <g transform={`translate(410 240) scale(${pop(t, 0, 0.3)})`} opacity={sep < 0.2 ? 1 : 0}>
            <text y={60} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={170} fill={B}>1</text>
          </g>
        </Svg>
        <div style={{position: 'absolute', left: 0, right: 90, top: 860, transform: `scale(${pop(t, trois, 0.35)})`}}>
          <Gros taille={96} couleur={O}>3 CHOSES</Gros>
        </div>
      </Fond>
    );
  }
  const items = [
    {a: ici(p, 'solution'), titre: 'Une solution', sous: 'pour moi', c: VI},
    {a: ici(p, 'service'), titre: 'Un service', sous: 'que les autres paient', c: O},
    {a: ici(p, 'competence'), titre: 'Une compétence', sous: 'à transmettre', c: VERT},
  ];
  return (
    <Fond t={t} teinte="#1d3a6e">
      <div style={{position: 'absolute', left: 60, right: 140, top: 300, display: 'flex', flexDirection: 'column', gap: 34}}>
        {items.map((it, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, padding: '22px 30px', borderRadius: 34, background: '#0b1440dd', border: `5px solid ${it.c}`, transform: `translateX(${(1 - prog(t, it.a - 0.05, it.a + 0.25, Easing.out(Easing.back(1.4)))) * 900}px)`}}>
            <div style={{width: 110, height: 110, flex: 'none', borderRadius: '50%', background: it.c, display: 'grid', placeItems: 'center', fontFamily: POLICE, fontWeight: 800, fontSize: 70, color: N}}>{i + 1}</div>
            <div style={{flex: 1}}>
              <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 58, color: B, lineHeight: 1.05}}>{it.titre}</div>
              <div style={{fontFamily: POLICE, fontWeight: 700, fontSize: 42, color: it.c, lineHeight: 1.1}}>{it.sous}</div>
            </div>
            <svg width={100} height={100} style={{flex: 'none'}}>
              <Coche t={t} a={it.a + 0.25} x={50} y={50} r={44} />
            </svg>
          </div>
        ))}
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ barrières

const Barriere: React.FC<{t: number; a: number; x: number; y: number}> = ({t, a, x, y}) => {
  const vole = prog(t, a, a + 0.6, Easing.out(Easing.quad));
  return (
    <g transform={`translate(${x + vole * 500} ${y - vole * 380 + vole * vole * 200}) rotate(${vole * 260})`} opacity={1 - prog(t, a + 0.4, a + 0.7)}>
      <rect x={-260} y={-40} width={520} height={80} rx={14} fill={B} stroke={N} strokeWidth={6} />
      {[0, 1, 2, 3].map((k) => <path key={k} d={`M${-220 + k * 130} -40 L${-170 + k * 130} -40 L${-230 + k * 130} 40 L${-280 + k * 130} 40 Z`} fill={ROUGE} />)}
      <rect x={-250} y={40} width={26} height={140} fill="#8f96b3" />
      <rect x={224} y={40} width={26} height={140} fill="#8f96b3" />
    </g>
  );
};

export const Barrieres: React.FC<Props> = (p) => {
  const {t} = p;
  const creer = ici(p, 'creer');
  const innover = ici(p, 'innover');
  return (
    <Fond t={t} teinte="#2a1d6e">
      <Svg y={250} h={760}>
        <path d="M250 760 L380 0 L440 0 L570 760 Z" fill="#ffffff14" />
        <g transform={`scale(${pop(t, 0, 0.3)})`} style={{transformOrigin: '410px 380px'}}>
          <Barriere t={t} a={creer + 0.15} x={410} y={540} />
          <Barriere t={t} a={innover + 0.15} x={410} y={250} />
        </g>
        {[[creer, 540], [innover, 250]].map(([a, y], i) =>
          Array.from({length: 10}, (_, k) => {
            const e = prog(t, a + 0.12, a + 0.6);
            const ang = (k / 10) * Math.PI * 2;
            return e > 0 && e < 1 ? <rect key={`${i}${k}`} x={410 + Math.cos(ang) * e * 300} y={y + Math.sin(ang) * e * 200} width={26} height={26} fill={k % 2 ? ROUGE : O} transform={`rotate(${e * 400} ${410 + Math.cos(ang) * e * 300} ${y + Math.sin(ang) * e * 200})`} /> : null;
          }),
        )}
      </Svg>
      <div style={{position: 'absolute', left: 0, right: 90, top: 790, display: 'flex', justifyContent: 'center', gap: 30}}>
        <div style={{transform: `scale(${pop(t, creer + 0.2, 0.35)})`, padding: '14px 36px', borderRadius: 999, background: VERT}}><Gros taille={64} contour={0}>CRÉER</Gros></div>
        <div style={{transform: `scale(${pop(t, innover + 0.2, 0.35)})`, padding: '14px 36px', borderRadius: 999, background: O}}><Gros taille={64} couleur={N} contour={0}>INNOVER</Gros></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 90, top: 300, transform: `scale(${pop(t, 0.05, 0.3)})`, opacity: 1 - prog(t, innover - 0.2, innover)}}>
        <Gros taille={70}>PLUS DE <span style={{color: ROUGE}}>BARRIÈRE</span></Gros>
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ tout devient possible

const IconePossible: React.FC<{kind: number; t: number}> = ({kind, t}) => {
  if (kind === 0)
    return (
      <g>
        <rect x={-110} y={-80} width={220} height={160} rx={16} fill={B} />
        <rect x={-110} y={-80} width={220} height={34} rx={16} fill={VI} />
        <rect x={-90} y={-30} width={120} height={18} rx={9} fill={O} />
        <rect x={-90} y={0} width={180} height={50} rx={10} fill="#c4ccdd" />
      </g>
    );
  if (kind === 1)
    return (
      <g>
        <rect x={-62} y={-105} width={124} height={210} rx={22} fill={B} />
        {[0, 1, 2, 3].map((k) => <rect key={k} x={-42 + (k % 2) * 46} y={-75 + Math.floor(k / 2) * 52} width={38} height={38} rx={10} fill={[VI, O, VERT, '#5ad1ff'][k]} />)}
      </g>
    );
  if (kind === 2)
    return (
      <g transform={`rotate(${Math.sin(t * 5) * 6})`}>
        <rect x={-90} y={-70} width={180} height={140} rx={40} fill={B} />
        <circle cx={-36} cy={-5} r={18} fill={VI} />
        <circle cx={36} cy={-5} r={18} fill={VI} />
        <rect x={-30} y={34} width={60} height={12} rx={6} fill={N} />
        <path d="M0 -70 V-100" stroke={B} strokeWidth={10} />
        <circle cy={-108} r={14} fill={O} />
      </g>
    );
  return (
    <g>
      {[[-30, -20, 1], [44, 34, -1]].map(([x, y, sens], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${t * 140 * sens})`}>
          {Array.from({length: 8}, (_, k) => <rect key={k} x={-10} y={-62} width={20} height={26} rx={4} fill={i ? O : B} transform={`rotate(${k * 45})`} />)}
          <circle r={44} fill={i ? O : B} />
          <circle r={16} fill={N} />
        </g>
      ))}
    </g>
  );
};

export const Possibles: React.FC<Props> = (p) => {
  const {t} = p;
  const items = [
    {a: ici(p, 'site'), nom: 'Site web'},
    {a: ici(p, 'application'), nom: 'Application'},
    {a: ici(p, 'agent'), nom: 'Agent IA'},
    {a: ici(p, 'automatisation'), nom: 'Automatisation'},
  ];
  const possible = ici(p, 'possible');
  return (
    <Fond t={t} teinte="#2a1d6e">
      <div style={{position: 'absolute', left: 60, right: 140, top: 250, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26}}>
        {items.map((it, i) => (
          <div key={i} style={{height: 330, borderRadius: 34, background: '#0b1440dd', border: `5px solid ${[VI, O, VERT, '#5ad1ff'][i]}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(t, it.a, 0.35)}) rotate(${Math.sin(t * 2 + i) * 2}deg)`}}>
            <svg width={260} height={230} viewBox="-130 -115 260 230"><IconePossible kind={i} t={t} /></svg>
            <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 46, color: B}}>{it.nom}</div>
          </div>
        ))}
      </div>
      {t >= possible - 0.02 ? (
        <div style={{position: 'absolute', left: 0, right: 90, top: 520, display: 'flex', justifyContent: 'center', transform: `scale(${pop(t, possible, 0.35)}) rotate(-4deg)`}}>
          <div style={{padding: '22px 46px', borderRadius: 30, background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, boxShadow: `0 0 70px ${O}, 0 20px 50px #000b`}}>
            <Gros taille={78} couleur={N} contour={0}>TOUT DEVIENT POSSIBLE</Gros>
          </div>
        </div>
      ) : null}
    </Fond>
  );
};

// ------------------------------------------------------------------ iceberg

export const Iceberg: React.FC<Props> = (p) => {
  const {t, d} = p;
  const texte = ici(p, 'texte');
  const image = ici(p, 'image');
  const plonge = prog(t, Math.min(Math.max(image + 0.6, d - 1.4), d - 0.8), d - 0.2, Easing.inOut(Easing.cubic));
  const dy = -plonge * 520;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#bfe6ff', fontFamily: POLICE}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 3000, transform: `translateY(${dy}px)`}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 640, background: 'linear-gradient(180deg, #7ec8ff, #d6f0ff)'}} />
        <div style={{position: 'absolute', left: 0, top: 640, width: 1080, height: 2400, background: 'linear-gradient(180deg, #1a6fb5, #0a2a5a 50%, #050a2a)'}} />
        <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={2000}>
          {/* pointe */}
          <path d="M380 640 L470 470 L520 520 L560 430 L640 560 L700 640 Z" fill="#f4fbff" stroke="#9fd3f5" strokeWidth={6} transform={`translate(0 ${(1 - pop(t, 0, 0.4)) * 200})`} />
          {/* partie immergée */}
          <path d="M380 640 L700 640 L900 900 L960 1250 L800 1550 L540 1650 L260 1520 L120 1200 L200 860 Z" fill="#cfeeff" opacity={0.92} />
          {/* vagues */}
          <path d={`M0 640 ${Array.from({length: 12}, (_, i) => `Q${i * 90 + 45} ${640 + Math.sin(t * 4 + i) * 12} ${(i + 1) * 90} 640`).join(' ')}`} stroke="#ffffff" strokeWidth={8} fill="none" />
        </svg>
        {/* étiquettes de la pointe */}
        {[{a: texte, nom: 'Texte', x: 250, y: 420}, {a: image, nom: 'Image', x: 660, y: 400}].map((e, i) => (
          <div key={i} style={{position: 'absolute', left: e.x, top: e.y, transform: `scale(${pop(t, e.a, 0.3)})`, padding: '8px 26px', borderRadius: 999, background: N, color: B, fontWeight: 800, fontSize: 48}}>{e.nom}</div>
        ))}
        {/* partie cachée */}
        {['Agents IA', 'Automatisations', 'Applications', 'Sites web'].map((nom, i) => (
          <div key={nom} style={{position: 'absolute', left: 300 + (i % 2) * 40, top: 900 + i * 150, padding: '10px 30px', borderRadius: 999, background: O, color: N, fontWeight: 800, fontSize: 52, transform: `scale(${pop(t, d - 1.2 + i * 0.15, 0.3)})`}}>{nom}</div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 60, right: 140, top: 250, transform: `scale(${pop(t, 0.1, 0.3)})`, opacity: 1 - plonge}}>
        <Gros taille={64}>Ce que tu fais <span style={{color: O}}>avec l’IA</span></Gros>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ entreprise (tâches répétitives)

export const Entreprise: React.FC<Props> = (p) => {
  const {t} = p;
  const agents = ici(p, 'agents');
  const autos = ici(p, 'automatisations');
  const taches = ['Factures', 'Messages', 'Relances', 'Rapports', 'Commandes'];
  return (
    <Fond t={t} teinte="#1d3a6e" libelle={<>Tâches répétitives → <span style={{color: O}}>agents IA</span></>}>
      {/* tapis roulant */}
      <div style={{position: 'absolute', left: 40, top: 700, width: 640, height: 40, borderRadius: 20, background: '#5b6185', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(90deg, #8f96b3 0 30px, #5b6185 30px 60px)`, transform: `translateX(${(t * 120) % 60}px)`}} />
      </div>
      {taches.map((nom, i) => {
        const x = ((t * 190 + i * 190) % 950) - 260;
        return (
          <div key={nom} style={{position: 'absolute', left: x, top: 590, width: 230, padding: '18px 0', borderRadius: 18, background: B, color: N, textAlign: 'center', fontWeight: 800, fontSize: 38, boxShadow: '0 10px 24px #0008', opacity: x > 520 ? 1 - (x - 520) / 120 : 1}}>{nom}</div>
        );
      })}
      {/* agent IA */}
      <svg style={{position: 'absolute', left: 600, top: 300}} width={360} height={480} viewBox="-180 -240 360 480">
        <g transform={`scale(${pop(t, agents, 0.4)}) rotate(${Math.sin(t * 5) * 4})`}>
          <rect x={-120} y={-150} width={240} height={190} rx={50} fill={B} stroke={O} strokeWidth={8} />
          <circle cx={-48} cy={-60} r={24} fill={VI} />
          <circle cx={48} cy={-60} r={24} fill={VI} />
          <rect x={-40} y={-10} width={80} height={14} rx={7} fill={N} />
          <path d="M0 -150 V-190" stroke={B} strokeWidth={12} />
          <circle cy={-200} r={18} fill={O} />
          <rect x={-90} y={60} width={180} height={150} rx={30} fill={VI} />
        </g>
        <g transform={`translate(120 160) scale(${pop(t, autos, 0.4)}) rotate(${t * 160})`}>
          {Array.from({length: 8}, (_, k) => <rect key={k} x={-10} y={-60} width={20} height={28} rx={4} fill={O} transform={`rotate(${k * 45})`} />)}
          <circle r={42} fill={O} />
          <circle r={16} fill={N} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 90, top: 300, transform: `scale(${pop(t, 0.05, 0.3)})`}}>
        <Gros taille={64}>Ton <span style={{color: O}}>entreprise</span></Gros>
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ moins de temps perdu, plus de résultats

export const Gains: React.FC<Props> = (p) => {
  const {t} = p;
  const plus = ici(p, 'plus');
  return (
    <Fond t={t} teinte="#173a4a">
      <div style={{position: 'absolute', left: 60, right: 140, top: 300, display: 'flex', flexDirection: 'column', gap: 50}}>
        {[{a: 0, titre: 'MOINS', sous: 'de temps perdu', c: ROUGE, fleche: 'M0 -60 V50 M-45 10 L0 55 L45 10'}, {a: plus, titre: 'PLUS', sous: 'de résultats', c: VERT, fleche: 'M0 60 V-50 M-45 -10 L0 -55 L45 -10'}].map((e, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 30, padding: '26px 34px', borderRadius: 34, background: '#0b1440dd', border: `6px solid ${e.c}`, transform: `scale(${pop(t, e.a, 0.35)})`}}>
            <svg width={150} height={150} viewBox="-75 -75 150 150" style={{flex: 'none'}}>
              <circle r={70} fill={e.c} />
              <path d={e.fleche} stroke={B} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={`translate(0 ${Math.sin(t * 6) * 6})`} />
            </svg>
            <div>
              <Gros taille={96} couleur={e.c} contour={0} style={{textAlign: 'left'}}>{e.titre}</Gros>
              <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: 54, color: B}}>{e.sous}</div>
            </div>
          </div>
        ))}
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ Lomé IA School

export const Ecole: React.FC<Props> = ({t}) => (
  <Fond t={t} teinte="#3b2f8a">
    <div style={{position: 'absolute', left: 0, right: 90, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
      <Img src={staticFile('marque/logo.jpg')} style={{width: 360, height: 360, borderRadius: 70, boxShadow: `0 0 ${60 + 20 * Math.sin(t * 4)}px ${O}aa`, transform: `scale(${pop(t, 0, 0.4)}) rotate(${Math.sin(t * 2) * 3}deg)`}} />
      <Gros taille={70} style={{transform: `scale(${pop(t, 0.3, 0.35)})`}}>C’est exactement ce que</Gros>
      <Gros taille={84} couleur={O} style={{transform: `scale(${pop(t, 0.5, 0.35)})`}}>nous faisons</Gros>
    </div>
  </Fond>
);

// ------------------------------------------------------------------ l'offre

export const Offre: React.FC<Props> = (p) => {
  const {t} = p;
  const cree = ici(p, 'creePourToi');
  const pastilles = [{a: ici(p, 'sites'), nom: 'Sites web'}, {a: ici(p, 'agentsIA'), nom: 'Agents IA'}, {a: ici(p, 'automatisations2'), nom: 'Automatisations'}];
  return (
    <Fond t={t} teinte="#2a1d6e">
      <div style={{position: 'absolute', left: 50, right: 130, top: 260, display: 'flex', gap: 24}}>
        {[{a: 0, titre: 'ON TE FORME', sous: 'tu crées tes solutions', c: VI}, {a: cree, titre: 'ON CRÉE', sous: 'pour toi', c: O}].map((col, i) => (
          <div key={i} style={{flex: 1, height: 420, borderRadius: 34, background: '#0b1440dd', border: `6px solid ${col.c}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, transform: `scale(${pop(t, col.a, 0.35)})`}}>
            <svg width={170} height={150} viewBox="-85 -75 170 150" style={{transform: `rotate(${Math.sin(t * 3 + i) * 8}deg)`}}>
              {i === 0 ? (
                <g>
                  <path d="M-80 -20 L0 -60 L80 -20 L0 20 Z" fill={VI} stroke={B} strokeWidth={6} strokeLinejoin="round" />
                  <path d="M-46 0 V40 Q0 70 46 40 V0" fill={VF} stroke={B} strokeWidth={6} />
                  <path d="M70 -16 V40" stroke={O} strokeWidth={8} />
                  <circle cx={70} cy={46} r={10} fill={O} />
                </g>
              ) : (
                <g>
                  <rect x={-14} y={-70} width={28} height={140} rx={10} fill="#c4ccdd" transform="rotate(40)" />
                  <rect x={-50} y={-80} width={100} height={40} rx={10} fill={O} transform="rotate(40)" />
                  <path d="M-60 -60 L60 60" stroke={B} strokeWidth={22} strokeLinecap="round" />
                  <circle cx={-60} cy={-60} r={26} fill="none" stroke={B} strokeWidth={14} />
                </g>
              )}
            </svg>
            <Gros taille={56} couleur={col.c} contour={0}>{col.titre}</Gros>
            <div style={{fontFamily: POLICE, fontWeight: 700, fontSize: 38, color: B, textAlign: 'center'}}>{col.sous}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 50, right: 130, top: 740, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20}}>
        {pastilles.map((x, i) => (
          <div key={i} style={{padding: '14px 32px', borderRadius: 999, background: [VI, O, VERT][i], transform: `scale(${pop(t, x.a, 0.3)})`}}>
            <Gros taille={52} couleur={N} contour={0}>{x.nom}</Gros>
          </div>
        ))}
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ consultation gratuite

const URL_SITE = 'lomeiaschool.laravel.cloud';

export const Consultation: React.FC<Props> = (p) => {
  const {t} = p;
  const url = ici(p, 'url');
  const n = Math.round(prog(t, url, url + 1.4, Easing.linear) * URL_SITE.length);
  const pulse = 1 + 0.05 * Math.sin(t * 8);
  return (
    <Fond t={t} teinte="#3b2f8a">
      <div style={{position: 'absolute', left: 0, right: 90, top: 330, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 46}}>
        <Gros taille={72} style={{transform: `scale(${pop(t, 0, 0.3)})`}}>Réserve ta</Gros>
        <div style={{padding: '34px 54px', borderRadius: 999, whiteSpace: 'nowrap', background: `linear-gradient(140deg, ${COULEURS.orClair}, ${COULEURS.orFonce})`, color: N, fontFamily: POLICE, fontWeight: 800, fontSize: 68, transform: `scale(${pop(t, 0.1, 0.35) * pulse})`, boxShadow: `0 0 ${50 + 30 * Math.sin(t * 8)}px ${O}, 0 20px 60px #000b`}}>
          Consultation gratuite
        </div>
        <div style={{padding: '18px 34px', borderRadius: 24, background: B, color: N, fontFamily: POLICE, fontWeight: 800, fontSize: 52, minWidth: 760, textAlign: 'center', opacity: prog(t, url - 0.2, url), transform: `translateY(${(1 - prog(t, url - 0.2, url)) * 40}px)`}}>
          {URL_SITE.slice(0, n)}
          <span style={{opacity: Math.sin(t * 12) > 0 ? 1 : 0}}>|</span>
        </div>
      </div>
    </Fond>
  );
};

export const Whatsapp: React.FC<Props> = (p) => {
  const {t} = p;
  const num = ici(p, 'numero');
  const chiffres = '+228 72 24 02 31';
  const n = Math.round(prog(t, num - 0.1, num + 1.6, Easing.linear) * chiffres.length);
  return (
    <Fond t={t} teinte="#173a2a">
      <div style={{position: 'absolute', left: 0, right: 90, top: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '30px 50px', borderRadius: 999, background: COULEURS.whatsapp, transform: `scale(${pop(t, 0, 0.35) * (1 + 0.04 * Math.sin(t * 8))})`, boxShadow: `0 0 50px ${COULEURS.whatsapp}aa`}}>
          <svg width={90} height={90} viewBox="0 0 90 90">
            <path d="M45 8 C24 8 8 23 8 42 C8 50 11 57 15 63 L10 82 L30 76 C35 79 40 80 45 80 C66 80 82 64 82 44 C82 24 66 8 45 8 Z" fill={B} />
          </svg>
          <Gros taille={60} contour={0}>Écris-moi sur WhatsApp</Gros>
        </div>
        <Gros taille={104} style={{fontVariantNumeric: 'tabular-nums', letterSpacing: 1, opacity: t >= num - 0.15 ? 1 : 0}}>
          {chiffres.slice(0, n)}
          <span style={{opacity: 0}}>{chiffres.slice(n)}</span>
        </Gros>
      </div>
    </Fond>
  );
};

// ------------------------------------------------------------------ formation complète

export const Formation: React.FC<Props> = (p) => {
  const {t} = p;
  const lignes = [
    {a: ici(p, 'troisMois'), texte: '3 mois', c: VI},
    {a: ici(p, 'deuxCent'), texte: '200 000 F CFA', c: O},
    {a: ici(p, 'attestation'), texte: 'Attestation de participation', c: VERT},
  ];
  return (
    <Fond t={t} teinte="#2a1d6e">
      <div style={{position: 'absolute', left: 60, right: 140, top: 250, display: 'flex', flexDirection: 'column', gap: 28}}>
        <div style={{transform: `scale(${pop(t, 0, 0.3)})`}}>
          <Gros taille={60}>Formation complète en</Gros>
          <Gros taille={74} couleur={O}>intelligence artificielle</Gros>
        </div>
        {lignes.map((l, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24, padding: '20px 30px', borderRadius: 30, background: '#0b1440dd', border: `5px solid ${l.c}`, transform: `translateX(${(1 - prog(t, l.a - 0.05, l.a + 0.25, Easing.out(Easing.back(1.4)))) * 900}px)`}}>
            <svg width={96} height={96} style={{flex: 'none'}}><Coche t={t} a={l.a + 0.2} x={48} y={48} r={42} /></svg>
            <div style={{fontFamily: POLICE, fontWeight: 800, fontSize: i === 2 ? 50 : 66, color: B, lineHeight: 1.05}}>{l.texte}</div>
          </div>
        ))}
      </div>
    </Fond>
  );
};

export const ILLUSTRATIONS: Record<string, React.FC<Props>> = {
  accroche: Accroche,
  pasArgent: PasArgent,
  telephone: Telephone,
  sansOrdinateur: SansOrdinateur,
  sansCode: SansCode,
  carte: Carte,
  prix: Prix,
  ampoule: Ampoule,
  construire: Construire,
  revelation: Revelation,
  etape: Etape,
  situations: Situations,
  resultat: Resultat,
  niveaux: Niveaux,
  communaute: Communaute,
  ilsPaient: IlsPaient,
  paiements: Paiements,
  nuit: Nuit,
  troisChoses: TroisChoses,
  barrieres: Barrieres,
  possibles: Possibles,
  iceberg: Iceberg,
  entreprise: Entreprise,
  gains: Gains,
  ecole: Ecole,
  offre: Offre,
  consultation: Consultation,
  whatsapp: Whatsapp,
  formation: Formation,
};
