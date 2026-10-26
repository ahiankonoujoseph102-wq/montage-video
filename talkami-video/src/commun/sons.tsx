import {Audio, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';

// Effets sonores et musique, communs à la série (fichiers générés par
// outils/audio.py : aucun son sous droits). Le niveau final est normalisé après
// le rendu (outils/finaliser.py) : -14 LUFS, pic vrai -1,5 dBTP.

export type Son = 'souffle' | 'pop' | 'clic' | 'erreur' | 'succes' | 'lettre' | 'rassemble' | 'ouverture' | 'fin' | 'whoosh' | 'ding' | 'pieces' | 'decollage' | 'tampon';
export type EvenementSonore = {t: number; son: Son; volume: number};

export const Effets: React.FC<{evenements: EvenementSonore[]}> = ({evenements}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {evenements.map((e, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(e.t * fps))} durationInFrames={Math.round(2.5 * fps)} name={`son ${e.son}`}>
          <Audio src={staticFile(`serie/sfx/${e.son}.wav`)} volume={e.volume} />
        </Sequence>
      ))}
    </>
  );
};

// Musique douce : présente à l'ouverture et au carton de fin, baissée sous la
// voix (≈ -18 dB quand il parle), remontée légèrement dans les pauses.
export const volumeMusique = (f: number, bouche: number[], debutVoix: number, debutFin: number, duree: number) => {
  const i = f - debutVoix;
  let parle = 0;
  for (let k = i - 15; k <= i + 15; k++) if (k >= 0 && k < bouche.length && bouche[k] > 0.05) parle++;
  const sousVoix = interpolate(parle, [0, 6], [0.2, 0.11], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const base = f < debutVoix ? 0.32 : f >= debutFin ? 0.32 : sousVoix;
  const fondu = interpolate(f, [duree - 30, duree - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return base * fondu;
};
