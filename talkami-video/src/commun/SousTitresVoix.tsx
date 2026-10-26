import {interpolate} from 'remotion';
import {COULEURS, MISE_EN_PAGE, POLICE} from '../theme';
import {MotVoix} from './mots';

// Sous-titres synchronisés sur la voix, repris du texte prévu (orthographe juste).
// Règles reprises de la chaîne de montage : blocs de 4 mots / 35 caractères au
// plus, 2,4 s au plus, coupure aux fins de phrase ; zone sûre au-dessus de
// l'interface du téléphone. Mots-clés en couleur.
// Jamais de coupure au milieu d'une expression (liste `liaisons` de l'épisode)
// ni après un petit mot (« prête à » / « publier ») : le bloc s'allonge plutôt.

export type Couleur = 'or' | 'violet' | 'rouge';
const TEINTES: Record<Couleur, string> = {or: COULEURS.or, violet: COULEURS.violet, rouge: '#ff6b6b'};

type Bloc = {mots: {texte: string; couleur?: Couleur}[]; debut: number; fin: number};

const nettoyer = (s: string) => s.replace(/'/g, '’').replace(/[«»]/g, '').trim();

// Petits mots qui ne terminent jamais un sous-titre : ils restent avec le mot
// qui les suit (« prête à » / « publier » est interdit).
const MOTS_OUTILS = new Set([
  'a', 'à', 'au', 'aux', 'de', 'du', 'des', 'la', 'le', 'les', 'un', 'une', 'et', 'ou', 'en', 'ce', 'ces', 'cet', 'cette',
  'ta', 'ton', 'tes', 'ma', 'mon', 'mes', 'sa', 'son', 'ses', 'pour', 'avec', 'sur', 'dans', 'par', 'que', 'qui', 'ne',
  'tu', 'je', 'il', 'elle', 'on', 'nous', 'vous', 'très', 'plus', 'mais', 'sans', 'puis', 'où', 'parce', 'quoi', 'est',
  'sont', 'sera', 'aux', 'nos', 'vos', 'votre', 'notre', 'leur', 'leurs',
]);

const motOutil = (texte: string) => MOTS_OUTILS.has(texte.toLowerCase().replace(/[^\p{L}']/gu, ''));

export const blocsSousTitres = (mots: MotVoix[], cles: Record<number, Couleur>, liaisons: [number, number][] = []): Bloc[] => {
  // lie[i] : interdit de couper juste avant le mot i
  const lie = mots.map((m, i) => {
    if (i === 0) return false;
    const precedent = mots[i - 1].texte;
    if (/[.?!:]$/.test(precedent)) return false;
    return liaisons.some(([a, b]) => a < i && i <= b) || motOutil(precedent);
  });
  const coupures: number[] = [0]; // indice du premier mot de chaque bloc
  let debut = 0;
  for (let i = 1; i < mots.length; i++) {
    const bloc = mots.slice(debut, i + 1);
    const caracteres = bloc.reduce((n, m) => n + nettoyer(m.texte).length + 1, 0);
    const finPhrase = /[.?!:]$/.test(mots[i - 1].texte);
    const pause = mots[i].debut - mots[i - 1].fin > 0.45;
    const trop = bloc.length > 4 || caracteres > 35 || mots[i].fin - mots[debut].debut > 2.4;
    if (!(finPhrase || pause || trop)) continue;
    let coupe = i;
    if (!finPhrase && lie[i]) {
      // reculer jusqu'à une coupure permise ; sinon garder l'expression entière
      let k = i - 1;
      while (k > debut && lie[k]) k--;
      coupe = k > debut ? k : -1;
    }
    if (coupe > debut) {
      coupures.push(coupe);
      debut = coupe;
    }
  }
  // Un bloc affiché moins de 0,6 s est illisible : on le fusionne avec le
  // précédent s'il est de la même phrase et que l'ensemble reste court.
  const fusionnees: number[] = [];
  coupures.forEach((a, n) => {
    const b = n + 1 < coupures.length ? coupures[n + 1] : mots.length;
    const prec = fusionnees[fusionnees.length - 1];
    const affichage = (b < mots.length ? mots[b].debut : mots[b - 1].fin + 0.6) - mots[a].debut;
    const ensemble = prec === undefined ? '' : mots.slice(prec, b).map((m) => nettoyer(m.texte)).join(' ');
    const memePhrase = prec !== undefined && !/[.?!:]$/.test(mots[a - 1].texte);
    if (affichage < 0.6 && memePhrase && ensemble.length <= 40) return;
    fusionnees.push(a);
  });
  return fusionnees.map((a, n) => {
    const b = n + 1 < fusionnees.length ? fusionnees[n + 1] : mots.length;
    return {
      mots: mots.slice(a, b).map((m, k) => ({texte: nettoyer(m.texte), couleur: cles[a + k]})),
      debut: mots[a].debut,
      fin: mots[b - 1].fin,
    };
  });
};

export const SousTitresVoix: React.FC<{blocs: Bloc[]; t: number}> = ({blocs, t}) => {
  const i = blocs.findIndex((b, k) => t >= b.debut - 0.05 && t < Math.min(b.fin + 0.6, blocs[k + 1]?.debut ?? Infinity));
  if (i < 0) return null;
  const b = blocs[i];
  const entree = interpolate(t, [b.debut - 0.05, b.debut + 0.1], [0.9, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const {basMax, taillePolice} = MISE_EN_PAGE.sousTitres;
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        bottom: 1920 - basMax,
        textAlign: 'center',
        fontFamily: POLICE,
        fontWeight: 800,
        fontSize: taillePolice,
        lineHeight: 1.12,
        color: COULEURS.blanc,
        WebkitTextStroke: `14px ${COULEURS.nuit}`,
        paintOrder: 'stroke fill',
        textShadow: '0 6px 18px #000a',
        letterSpacing: -0.5,
        transform: `scale(${entree})`,
        transformOrigin: '50% 100%',
      }}
    >
      {b.mots.map((m, k) => (
        <span key={k} style={{color: m.couleur ? TEINTES[m.couleur] : undefined}}>
          {m.texte}
          {k < b.mots.length - 1 ? ' ' : ''}
        </span>
      ))}
    </div>
  );
};
