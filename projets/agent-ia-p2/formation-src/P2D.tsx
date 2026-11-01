import React from 'react';
import {Donnees, FPS, VideoP2} from './P2';
import data from '../../../public/formation/p2d/montage.json';
import bouche from '../../../public/formation/p2d/bouche.json';
import visemes from '../../../public/formation/p2d/visemes.json';

// Vidéo 2D — Suivre la construction jusqu au bout (projets/agent-ia-p2/montage/p2d.py).
const D = data as unknown as Donnees;
export const dureeP2D = Math.ceil(D.duree * FPS);
export const FormationP2D: React.FC = () => <VideoP2 D={D} bouche={bouche as number[]} visemes={visemes as string} dossier="p2d" />;
