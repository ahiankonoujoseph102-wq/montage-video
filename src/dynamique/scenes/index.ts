import type React from 'react';
import type {TypeIllustration} from '../../types';
import {Creations} from './Creations';
import {EnLigne} from './EnLigne';
import {Equipe} from './Equipe';
import {Etudes} from './Etudes';
import {Gratuit} from './Gratuit';
import {Inscription} from './Inscription';
import {Licenciements} from './Licenciements';
import type {PropsScene} from './outils';
import {Remplace} from './Remplace';
import {RendezVous} from './RendezVous';
import {Reponses} from './Reponses';
import {TelephoneQuestion} from './TelephoneQuestion';
import {UnTelephone} from './UnTelephone';

// Bibliothèque des scènes illustrées (voir CLAUDE.md).
export const SCENES_ILLUSTREES: Record<TypeIllustration, React.FC<PropsScene>> = {
  etudes: Etudes,
  equipe: Equipe,
  telephone: TelephoneQuestion,
  reponses: Reponses,
  creations: Creations,
  licenciements: Licenciements,
  remplace: Remplace,
  gratuit: Gratuit,
  rendezvous: RendezVous,
  enligne: EnLigne,
  inscription: Inscription,
  unTelephone: UnTelephone,
};
