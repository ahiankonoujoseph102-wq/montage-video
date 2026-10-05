import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import words from './words.json';

type Word = {word: string; start: number; end: number; keyword: boolean};

const WORDS_PER_LINE = 3;

export const Clip: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  // Index of the last word that has started.
  const list = words as Word[];
  let current = -1;
  for (let i = 0; i < list.length; i++) if (list[i].start <= t) current = i;

  // Show the group the current word belongs to, revealing words as they are spoken.
  const groupStart = current < 0 ? 0 : current - (current % WORDS_PER_LINE);
  const visible = current < 0 ? [] : list.slice(groupStart, current + 1);

  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      <OffthreadVideo src={staticFile('source.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 400}}>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22, padding: '0 60px'}}>
          {visible.map((w, i) => (
            <span
              key={groupStart + i}
              style={{
                fontFamily: 'Arial Black, Arial, sans-serif',
                fontWeight: 900,
                fontSize: 92,
                color: w.keyword ? '#FFD400' : 'white',
                textDecoration: w.keyword ? 'underline' : 'none',
                textDecorationThickness: 10,
                textUnderlineOffset: 14,
                WebkitTextStroke: '3px black',
                textShadow: '0 6px 18px rgba(0,0,0,0.8)',
              }}
            >
              {w.word.toUpperCase()}
            </span>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
