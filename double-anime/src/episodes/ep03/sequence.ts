import {Expression, Geste} from '../../theme';
import {CARTES, Carte, FIN_VOIX, MOTS, TEMPS_CARTES, TempsCarte, t as tMot, trouver} from './scenario';

// Montage dynamique de l'épisode 3 : chaque astuce devient une suite de plans
// courts calés sur la voix (aucun plan figé plus de 2,5 s) :
//   NUMERO  gros chiffre qui claque, icône animée du thème, titre ;
//   P       le personnage réagit (plan moyen, geste propre à l'astuce) ;
//   MAUVAIS « Ne dis pas » : bulle tapée, réponse grise, tampon X rouge ;
//   P       « Dis plutôt » : balayage du rouge au vert, il pointe l'écran ;
//   BON     la bonne phrase en morceaux (un morceau en grand à la fois,
//           crochets avec étiquette et carte d'exemple), puis la carte se
//           réduit vers le haut et le résultat illustré apparaît dessous.
// Fichier sans React : la séquence se vérifie avec tsx.

export type Plan = {
  debut: number;
  fin: number;
  type: 'P' | 'I' | 'NUMERO' | 'MAUVAIS' | 'BON' | 'FIN';
  cadre?: 'large' | 'moyen' | 'gros';
  geste?: Geste;
  expression?: Expression;
  doigts?: 1 | 2 | 3 | 4;
  illus?: string;
  carte?: number;
  texte?: string;
  phase?: number;
  partie?: number;
  disPlutot?: boolean; // plan du personnage avec le balayage rouge → vert
  titre?: boolean; // rappel du titre de l'astuce en haut
};

export const b = (phrase: string, apres = 0) => tMot(phrase, apres) - 0.08;
const DUREE_CARTE_FIN = 4.0;

// ------------------------------------------------------------------ morceaux de la bonne phrase

export type MotPiece = {texte: string; debut: number; fin: number};
export type Piece = {
  texte: string; // texte affiché, fidèle à la carte (la suite des pièces redonne la phrase exacte)
  suffixe: string; // ponctuation collée après (« , », « . »)
  debut: number;
  fin: number;
  crochet?: {etiquette: string; exemple: string};
  mots: MotPiece[];
};

const norme = (s: string) => s.toLowerCase().normalize('NFD').replace(/[^\p{L}\p{N}']/gu, '').replace(/’/g, "'");

// Mots d'un morceau, chacun avec son instant : celui du même mot dans la voix
// quand on le retrouve à sa place (±2 mots), sinon au prorata des lettres.
const motsDe = (texte: string, a: number, f: number): MotPiece[] => {
  const mots = texte.split(' ');
  const total = texte.length;
  const i0 = MOTS.findIndex((m) => m.debut >= a - 1e-6);
  let cumul = 0;
  const res = mots.map((m, j) => {
    const d = a + ((f - a) * cumul) / total;
    cumul += m.length + 1;
    let v = d;
    for (const dk of [0, 1, -1, 2, -2]) {
      const k = i0 + j + dk;
      if (k >= i0 && k < MOTS.length && MOTS[k].debut < f && norme(MOTS[k].texte) === norme(m)) {
        v = MOTS[k].debut;
        break;
      }
    }
    return {texte: m, debut: v, fin: f};
  });
  for (let j = 1; j < res.length; j++) res[j].debut = Math.max(res[j].debut, res[j - 1].debut + 0.05); // toujours dans l'ordre
  for (let j = 0; j < res.length; j++) res[j].fin = j + 1 < res.length ? res[j + 1].debut : f;
  return res;
};

// Découpe un long morceau aux virgules, sur les mots de la voix (≥ 0,8 s par pièce).
const decouper = (texte: string, debut: number, fin: number): {texte: string; debut: number}[] => {
  if (fin - debut <= 2.2) return [{texte, debut}];
  const bouts = texte.split(/(?<=,) /);
  const res: {texte: string; debut: number}[] = [{texte: bouts[0], debut}];
  // premier mot de chaque bout cherché autour de sa place attendue dans la voix
  // (même nombre de mots depuis le début du morceau, à ±2 près)
  const i0 = MOTS.findIndex((m) => m.debut >= debut - 1e-6);
  let cumul = bouts[0].split(' ').length;
  for (const bout of bouts.slice(1)) {
    const premier = bout.split(' ')[0];
    let d = NaN;
    for (const dk of [0, 1, -1, 2, -2]) {
      const k = i0 + cumul + dk;
      if (k > i0 && k < MOTS.length && MOTS[k].debut < fin && norme(MOTS[k].texte) === norme(premier)) {
        d = MOTS[k].debut;
        break;
      }
    }
    cumul += bout.split(' ').length;
    const dernier = res[res.length - 1];
    if (Number.isNaN(d) || d - dernier.debut < 0.8) dernier.texte += ` ${bout}`;
    else res.push({texte: bout, debut: d});
  }
  // la dernière pièce doit aussi durer au moins 0,8 s
  if (res.length > 1 && fin - res[res.length - 1].debut < 0.8) {
    const der = res.pop()!;
    res[res.length - 1].texte += ` ${der.texte}`;
  }
  // pièce encore trop longue (pas de virgule) : coupée au mot de la voix le plus proche du milieu
  for (let k = 0; k < res.length; k++) {
    const a = res[k].debut;
    const f = k + 1 < res.length ? res[k + 1].debut : fin;
    if (f - a <= 2.6) continue;
    const mots = res[k].texte.split(' ');
    let meilleur: {j: number; d: number} | null = null;
    for (let j = 2; j < mots.length - 2; j++) {
      const v = MOTS.find((m) => m.debut > a + 0.8 && m.debut < f - 0.8 && norme(m.texte) === norme(mots[j]));
      if (v && (!meilleur || Math.abs(v.debut - (a + f) / 2) < Math.abs(meilleur.d - (a + f) / 2))) meilleur = {j, d: v.debut};
    }
    if (!meilleur) continue;
    res.splice(k, 1, {texte: mots.slice(0, meilleur.j).join(' '), debut: a}, {texte: mots.slice(meilleur.j).join(' '), debut: meilleur.d});
  }
  return res;
};

export const piecesDe = (c: Carte, tc: TempsCarte): Piece[] => {
  const brut: {texte: string; debut: number; crochet?: Piece['crochet']}[] = [];
  c.bon.forEach((m, i) => {
    let texte = m.texte;
    const a = Math.max(tc.morceaux[i], brut.length ? brut[brut.length - 1].debut + 0.25 : 0);
    // ponctuation en tête (« , cet emploi », « . Rédige », « . ») : collée à la pièce précédente
    const tete = texte.match(/^([,.])\s*/);
    if (tete && brut.length) {
      (brut[brut.length - 1] as {suffixe?: string}).suffixe = tete[1];
      texte = texte.slice(tete[0].length);
    }
    if (!texte) return;
    if (/^»$/.test(texte)) {
      (brut[brut.length - 1] as {suffixe?: string}).suffixe = `${(brut[brut.length - 1] as {suffixe?: string}).suffixe ?? ''} »`;
      return;
    }
    const fin = i + 1 < c.bon.length ? Math.max(a + 0.3, tc.morceaux[i + 1]) : tc.fin;
    if (m.crochet) brut.push({texte, debut: a, crochet: m.crochet});
    else for (const p of decouper(texte, a, fin)) brut.push(p);
  });
  return brut.map((p, k) => {
    const fin = k + 1 < brut.length ? brut[k + 1].debut : tc.fin;
    const suffixe = (p as {suffixe?: string}).suffixe ?? '';
    return {
      texte: p.texte,
      suffixe,
      debut: p.debut,
      fin,
      crochet: p.crochet,
      mots: p.crochet ? [{texte: p.texte, debut: p.debut, fin}] : motsDe(p.texte, p.debut, Math.min(fin, tc.dernierMot + 0.3)),
    };
  });
};

export const PIECES = CARTES.map((c, i) => piecesDe(c, TEMPS_CARTES[i]));

// ------------------------------------------------------------------ instants de chaque astuce

export type TempsAstuce = {
  debut: number; // début du plan NUMERO
  chiffre: number; // le chiffre claque (mot « un », « deux »…)
  titre: number; // la voix dit le titre
  neDisPas: number; // plan MAUVAIS
  tape: [number, number]; // la mauvaise phrase s'écrit
  reponse: number; // la réponse grise arrive (flash rouge, erreur)
  tampon: number; // le gros X rouge écrase la phrase
  disPlutot: number; // plan du personnage, balayage vers le vert
  bon: number; // plan BON
  resultat: number; // la carte se réduit, le résultat apparaît
  fin: number; // fin de l'astuce (début de la suivante)
};

const GESTES_ASTUCE: {geste: Geste; doigts?: 1 | 2 | 3 | 4; expression: Expression; cadre: Plan['cadre']}[] = [
  {geste: 'compte', doigts: 1, expression: 'sourire', cadre: 'moyen'},
  {geste: 'compte', doigts: 2, expression: 'sourire', cadre: 'moyen'},
  {geste: 'compte', doigts: 3, expression: 'surpris', cadre: 'moyen'},
  {geste: 'compte', doigts: 4, expression: 'sourire', cadre: 'moyen'},
  {geste: 'explique', expression: 'surpris', cadre: 'moyen'},
  {geste: 'bras-croises', expression: 'sourire', cadre: 'moyen'},
  {geste: 'explique', expression: 'sourire', cadre: 'moyen'},
];
// cadrage du plan « Dis plutôt », varié d'une astuce à l'autre
const CADRES_DIS = ['gros', 'large', 'gros', 'large', 'gros', 'large', 'gros'] as const;

export const TEMPS_ASTUCES: TempsAstuce[] = [];

// ------------------------------------------------------------------ séquence complète

export const PLANS: Plan[] = (() => {
  const p: Plan[] = [];
  const ajoute = (debut: number, fin: number, v: Omit<Plan, 'debut' | 'fin'>) => p.push({debut, fin, ...v});
  const perso = (debut: number, fin: number, v: Omit<Plan, 'debut' | 'fin' | 'type'>[]) => {
    const n = Math.max(v.length, Math.ceil((fin - debut) / 2.5));
    for (let k = 0; k < n; k++) ajoute(debut + ((fin - debut) * k) / n, debut + ((fin - debut) * (k + 1)) / n, {type: 'P', ...v[k % v.length]});
  };

  // accroche
  ajoute(0, 1.85, {type: 'P', cadre: 'gros', geste: 'explique', expression: 'surpris'});
  ajoute(1.85, b('Un mauvais') + 0.4, {type: 'I', illus: 'accroche'});
  ajoute(b('Un mauvais') + 0.4, b('Utilise plutôt'), {type: 'I', illus: 'boulePapier'});
  perso(b('Utilise plutôt'), b('et regarde'), [{cadre: 'moyen', geste: 'designe', expression: 'sourire'}]);
  ajoute(b('et regarde'), b('Numéro un'), {type: 'I', illus: 'magie'});

  CARTES.forEach((c, i) => {
    const tc = TEMPS_CARTES[i];
    const iNum = trouver(c.numero);
    const debut = i === 0 ? b(c.numero) : p[p.length - 1].fin;
    const neDisPas = b('Ne dis pas', iNum);
    const titre = MOTS[iNum + 2].debut;
    // NUMERO, puis le personnage qui réagit s'il reste au moins 0,8 s
    const finNumero = Math.max(titre + 0.6, debut + 1.4);
    const g = GESTES_ASTUCE[i];
    if (neDisPas - finNumero >= 0.8) {
      ajoute(debut, finNumero, {type: 'NUMERO', carte: i});
      ajoute(finNumero, neDisPas, {type: 'P', carte: i, cadre: g.cadre, geste: g.geste, doigts: g.doigts, expression: g.expression, titre: true});
    } else ajoute(debut, neDisPas, {type: 'NUMERO', carte: i});

    const disPlutot = tc.bon + 0.1;
    ajoute(neDisPas, disPlutot, {type: 'MAUVAIS', carte: i});
    const bon = Math.max(tc.morceaux[0] - 0.08, disPlutot + 0.6);
    ajoute(disPlutot, bon, {type: 'P', carte: i, cadre: CADRES_DIS[i], geste: 'designe', expression: 'sourire', disPlutot: true});
    const suivante = i + 1 < CARTES.length ? b(CARTES[i + 1].numero) : b('Tu as remarqué');
    ajoute(bon, suivante, {type: 'BON', carte: i});

    const tape0 = tc.mauvais - 0.05;
    const tape1 = tape0 + Math.max(0.35, (tc.mauvaisFin - tc.mauvais) * 0.6);
    const tampon = Math.min(Math.max(tape1 + 0.35, tc.mauvaisFin - 0.05), disPlutot - 0.3);
    TEMPS_ASTUCES.push({
      debut,
      chiffre: MOTS[iNum + 1].debut,
      titre,
      neDisPas,
      tape: [tape0, tape1],
      reponse: tape1 + 0.05,
      tampon,
      disPlutot,
      bon,
      resultat: Math.min(tc.dernierMot + 0.15, suivante - 1.4),
      fin: suivante,
    });
  });

  perso(p[p.length - 1].fin, b('le contexte'), [{cadre: 'gros', geste: 'explique', expression: 'surpris'}]);
  ajoute(b('le contexte'), b("L'IA ne devine"), {type: 'I', illus: 'trio'});
  ajoute(b("L'IA ne devine"), b('elle exécute'), {type: 'I', illus: 'robot', texte: 'devine'});
  perso(b('elle exécute'), b('Et toi'), [{cadre: 'gros', geste: 'designe'}]);
  perso(b('Et toi'), b('le meilleur prompt'), [{cadre: 'moyen', geste: 'designe'}]);
  ajoute(b('le meilleur prompt'), b("et qui t'a"), {type: 'I', illus: 'trophee'});
  perso(b("et qui t'a"), b('Écris-le'), [{cadre: 'gros', geste: 'explique', expression: 'surpris'}]);
  ajoute(b('Écris-le'), b('Écris-le') + 1.85, {type: 'I', illus: 'commentaire'});
  perso(p[p.length - 1].fin, b('Réserve ta'), [{cadre: 'gros', geste: 'explique', expression: 'sourire'}]);
  const cta = b('Réserve ta');
  const lien = b('Le lien');
  ajoute(cta, (cta + lien) / 2, {type: 'I', illus: 'cta', phase: 1});
  ajoute((cta + lien) / 2, lien, {type: 'I', illus: 'cta', phase: 2});
  ajoute(lien, FIN_VOIX + DUREE_CARTE_FIN, {type: 'FIN'});
  return p;
})();

export const planA = (t: number) => PLANS.find((q) => t >= q.debut && t < q.fin) ?? PLANS[PLANS.length - 1];
// numéro de l'astuce en cours (0 avant la première), pour la barre et les couleurs
export const astuceA = (t: number) => TEMPS_ASTUCES.filter((a) => t >= a.debut - 0.05).length;
