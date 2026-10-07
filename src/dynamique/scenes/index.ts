import type React from 'react';
import type {TypeIllustration} from '../../types';
import {Creations} from './Creations';
import {Etudes} from './Etudes';
import {Licenciements} from './Licenciements';
import type {PropsScene} from './outils';
import {Reponses} from './Reponses';

// Bibliothèque des scènes illustrées (voir CLAUDE.md). Une scène absente d'ici n'est pas encore dessinée.
export const SCENES_ILLUSTREES: Partial<Record<TypeIllustration, React.FC<PropsScene>>> = {
  etudes: Etudes,
  reponses: Reponses,
  creations: Creations,
  licenciements: Licenciements,
};
