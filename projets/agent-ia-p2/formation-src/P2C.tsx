import React from 'react';
import {Donnees, FPS, VideoP2} from './P2';
import data from '../../../public/formation/p2c/montage.json';
import bouche from '../../../public/formation/p2c/bouche.json';
import visemes from '../../../public/formation/p2c/visemes.json';

// Vidéo 2C — Créer vos clés API (projets/agent-ia-p2/montage/p2c.py).
const D = data as unknown as Donnees;
export const dureeP2C = Math.ceil(D.duree * FPS);
export const FormationP2C: React.FC = () => <VideoP2 D={D} bouche={bouche as number[]} visemes={visemes as string} dossier="p2c" />;
