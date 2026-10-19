// Mot de la narration, aligné sur la voix (temps en secondes depuis le début de la voix).
export type MotVoix = {texte: string; debut: number; fin: number; debutCitation?: boolean; finCitation?: boolean};

// Texte « tapé » au rythme de la voix : chaque mot apparaît lettre par lettre
// pendant qu'il est prononcé. Renvoie le texte visible à l'instant t.
export const texteTape = (mots: MotVoix[], t: number): string => {
  let sortie = '';
  for (const [i, m] of mots.entries()) {
    const brut = m.texte;
    if (t >= m.fin) {
      sortie += brut;
    } else if (t > m.debut) {
      const n = Math.ceil(((t - m.debut) / Math.max(0.05, m.fin - m.debut)) * brut.length);
      sortie += brut.slice(0, n);
      return sortie;
    } else {
      return sortie;
    }
    if (i < mots.length - 1) sortie += ' ';
  }
  return sortie;
};
