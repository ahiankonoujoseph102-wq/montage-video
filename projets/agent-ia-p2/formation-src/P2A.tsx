import React from 'react';
import {Donnees, FPS, VideoP2} from './P2';
import data from '../../../public/formation/p2a/montage.json';
import bouche from '../../../public/formation/p2a/bouche.json';
import visemes from '../../../public/formation/p2a/visemes.json';

// Vidéo 2A — La boucle de travail (projets/agent-ia-p2/montage/p2a.py).
const D = data as unknown as Donnees;
export const dureeP2A = Math.ceil(D.duree * FPS);
export const FormationP2A: React.FC = () => <VideoP2 D={D} bouche={bouche as number[]} visemes={visemes as string} dossier="p2a" />;
