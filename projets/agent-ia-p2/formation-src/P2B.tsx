import React from 'react';
import {Donnees, FPS, VideoP2} from './P2';
import data from '../../../public/formation/p2b/montage.json';
import bouche from '../../../public/formation/p2b/bouche.json';
import visemes from '../../../public/formation/p2b/visemes.json';

// Vidéo 2B — Le moteur et le cerveau de votre agent (projets/agent-ia-p2/montage/p2b.py).
const D = data as unknown as Donnees;
export const dureeP2B = Math.ceil(D.duree * FPS);
export const FormationP2B: React.FC = () => <VideoP2 D={D} bouche={bouche as number[]} visemes={visemes as string} dossier="p2b" />;
