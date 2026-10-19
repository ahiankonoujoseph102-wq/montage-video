# Formation « Monter n'importe quelle vidéo avec l'IA » — partie 1 (Claude gratuit)

Analyse des quatre vidéos fournies par Joseph (Google Drive), le 19 octobre 2026. Aucun montage n'a été fait.

| Nom dans ce rapport | Fichier Google Drive | Contenu |
|---|---|---|
| **Vidéo d'origine** | `1gz3tVblvF8Rkhl2Z_8wtiMrHowi8eW4Y` | publicité de 32 s : 4 plans de 8 s générés par Google Flow, collés dans CapCut |
| **Vidéo montée** | `1_b330AI5ronq5a0tpZFpFwJa9paB3lCZ` | la même publicité montée par Claude gratuit |
| **Enregistrement n° 1** | `1JspJ7p0UrNTc-jNePwXj-naN8zrHpRXP` | démonstration : ChatGPT → Google Flow → CapCut → Claude (échec de l'envoi) |
| **Enregistrement n° 2** | `1zpKdGeiEbnR0_LU2331bsb2ge5ktEd0k` | suite : le prompt de montage, les réponses de Claude, le résultat, l'envoi sur WhatsApp et Drive |

Les horodatages des enregistrements d'écran sont ceux du compteur rouge de l'enregistreur, affiché en haut à
gauche (il correspond au temps de la vidéo à la seconde près).

---

## 1. Caractéristiques techniques

| | Vidéo d'origine | Vidéo montée | Enregistrement n° 1 | Enregistrement n° 2 |
|---|---|---|---|---|
| Durée | 32,0 s | 18,5 s | 30 min 13 s | 4 min 03 s |
| Résolution | 720 × 1280 (9:16) | **360 × 640** (9:16) | 1080 × 2400 | 1080 × 2400 |
| Images par seconde | 30 | 30 | variable (environ 43) | variable (environ 40) |
| Poids | **32,5 Mo** | 1,55 Mo | 1,94 Go | 390 Mo |
| Débit vidéo | 8,0 Mbit/s | 0,54 Mbit/s | 8,5 Mbit/s | 12,8 Mbit/s |
| Son | AAC stéréo 44,1 kHz, 160 kbit/s | AAC stéréo 48 kHz, 131 kbit/s | AAC stéréo 44,1 kHz, 64 kbit/s | AAC stéréo 44,1 kHz, 64 kbit/s |
| Volume moyen | −22,4 LUFS | −20,4 LUFS | −26,7 LUFS | −15,7 LUFS |
| Crête vraie | **0,0 dBFS** (limite de saturation) | −0,7 dBFS | −1,0 dBFS | −0,3 dBFS |
| Origine du fichier | export CapCut Android (métadonnées « vicut », région TG) | copie WhatsApp (`VID-20261018-WA0228.mp4`) | enregistreur d'écran Android | enregistreur d'écran Android |

**Qualité du son**

- **Vidéo d'origine** : voix de synthèse de Google Flow, claire et compréhensible, sans musique ni bruit
  (fond à −40 dB entre les phrases). Volume un peu faible pour les réseaux (−22,4 au lieu de −14 LUFS) et crête
  qui touche 0 dBFS (une crête à la limite, pas de saturation audible). Longs blancs au début de chaque plan
  (≈ 11,6 s de silence en tout). Défaut de voix à la fin : « À mercredi ! » est suivi d'un second
  « …mercredi » prononcé bouche fermée (29,5–30,3 s).
- **Vidéo montée** : voix + musique ajoutée par Claude. Plus forte (−20,4 LUFS) ; la musique est assez présente
  (−24 dB dans les respirations, proche du niveau de la voix), mais la voix reste compréhensible. Son
  recompressé deux fois par WhatsApp.
- **Enregistrement n° 1** : voix de Joseph enregistrée par le micro du téléphone, loin et faible (−26,7 LUFS,
  écarts de volume importants), avec bruits de la pièce et de manipulation. Compréhensible à l'écoute mais
  **pas utilisable tel quel dans la formation** : il faudrait réenregistrer le commentaire ou le nettoyer.
  La transcription automatique est très incertaine (voir partie 2). Pendant les dictées à ChatGPT, le son est
  coupé (silence complet) : le micro est pris par ChatGPT.
- **Enregistrement n° 2** : aucune parole de Joseph ; on n'entend que le son des vidéos lues à l'écran
  (publicité et ses versions montées). Volume fort (−15,7 LUFS), propre.

---

## 2. Transcriptions

### 2.1 Vidéo d'origine (voix générée par Google Flow)

| Temps | Texte |
|---|---|
| 0:01,0 – 0:01,9 | Bonne nouvelle ! |
| 0:03,2 – 0:07,4 | Ce mercredi, je vous invite à une formation gratuite. |
| 0:10,4 – 0:15,0 | Apprenez à créer vos propres sites web grâce à l'intelligence artificielle. |
| 0:16,6 – 0:22,5 | La formation est… (pause de 2 s) entièrement gratuite et en direct sur Google Meet. |
| 0:24,2 – 0:26,9 | Écrivez-moi sur WhatsApp pour rejoindre le groupe. |
| 0:27,1 – 0:28,2 | À mercredi ! *(suivi d'un son peu clair, transcrit « quasi »)* |
| 0:29,5 – 0:30,3 | *(…mercredi — répétition parasite, bouche fermée ; à couper)* |

### 2.2 Vidéo montée (pour comparaison)

| Temps | Texte |
|---|---|
| 0:00,0 – 0:04,6 | Bonne nouvelle ! Ce mercredi, je vous invite à une formation gratuite. |
| 0:05,7 – 0:10,2 | Apprenez à créer vos propres sites web grâce à l'intelligence artificielle. |
| 0:10,4 – 0:15,0 | La formation est entièrement gratuite et en direct sur Google Meet. |
| 0:15,1 – 0:17,5 | Écrivez-moi sur WhatsApp pour rejoindre le groupe. |

« À mercredi ! » a été retiré à la demande de Joseph (version 4 de Claude).

### 2.3 Enregistrement n° 1 (commentaire de Joseph)

Transcription automatique (deux passes, voix renforcée), relue et corrigée à la main. Les noms mal entendus
ont été rétablis (Claude pour « clou », Google Flow pour « Google flou », CapCut pour « CapCode / quatre côtés »,
Lomé IA School). Le son est faible et bruité : les passages entre crochets ou suivis de (?) sont incertains.
Avant diffusion, il faudrait réécouter ces passages.

**Important : les dictées vocales ne sont pas enregistrées.** Pendant que Joseph dicte à ChatGPT
(1:30 – 2:22, 5:18 – 5:46, 7:00 – 7:20), la piste son est un silence complet (−113 dB) : le micro est pris par
ChatGPT. Le texte de ces dictées n'existe qu'à l'écran (voir partie 3.3).

| Temps | Joseph dit |
|---|---|
| 0:00 | Alors bien, je vais vous apprendre comment faire n'importe quel montage vidéo avec l'IA (?). Aujourd'hui, avec l'IA on peut tout faire, il n'y a plus de barrière, vous voyez. |
| 0:11 | Donc on aura utilisé des outils : on aura utilisé ChatGPT, Claude, GitHub, voyez-vous. Alors pour Claude, il y a la version gratuite et puis la version payante, vous voyez. |
| 0:27 | Donc je vais créer une petite vidéo devant vous ici. Je peux faire un enregistrement de vidéo (?), mais bon, je vais créer une petite vidéo, parce que je fais une petite démonstration avec Claude gratuit et puis une petite démonstration avec Claude payant. |
| 0:41 | Donc je vais créer une petite vidéo de plus ou moins 20 secondes (?), et puis voilà. OK, bon, je pense que je vais utiliser [ChatGPT] pour le faire, d'accord. Alors ici, par exemple… je me suis déconnecté d'abord ici, pour qu'on continue. |
| 1:00 | Donc je vais choisir un compte ici, par exemple. OK, bien. Alors je vais créer une petite vidéo rapidement, d'accord. |
| 1:12 | Alors je vais déjà… de la formation sur comment créer les vidéos avec l'IA, vous le savez. Ce que je fais là : je pouvais enregistrer une petite vidéo de 20 secondes pour faire la démonstration, mais bon… on n'a plus besoin [de prompteur] (?), on va rapidement, d'accord. Voilà, donc je peux même faire… |
| 1:30 – 2:22 | *(dictée à ChatGPT : silence dans l'enregistrement)* |
| 2:22 | Bon, ça, je fais ça de toute façon, bref, pour que ça puisse aller rapidement, d'accord. |
| 2:27 | Je vous ai déjà appris comment créer les sites web avec l'IA. Donc bon, là, je n'ai pas aimé ça, je vais dire « propose autre version ». Je vais déjà donner l'information sur comment créer les vidéos d'IA : vidéo histoire, vidéo publicitaire, vidéo film, tout ça. |
| 2:44 | Donc voilà, quand on est expert en IA, on n'a plus besoin de… on va de façon plus rapide, et puis ça passe. OK, ici je vois « tu veux créer des sites web sans savoir coder » (?)… d'accord, c'est bien. Ici, OK. |
| 3:00 | OK, d'accord. Je pense que la 4 (?) fonctionne : « Bonne nouvelle »… Je pense que c'est bon. Voilà, je valide ceci, mais je vois que ça dépasse 30 secondes. Ça dépasse 30 secondes, parce qu'on veut une vidéo de plus ou moins 30 secondes, et elle, ça dépasse 30 secondes. |
| 3:30 | Bon, alors, rapidement, voilà : « Bonne nouvelle, formation gratuite ce mercredi. Bonjour à tous, ici c'est Coach Joseph, je vous invite à une formation gratuite en direct en ligne, où je vais vous montrer comment créer des sites web. » D'accord, OK, c'est bien, c'est bien. |
| 3:46 | Donc là je valide ceci, vous voyez. Alors je vais lui dire : « Divise-moi… divise-moi en un script de vidéo de 30 secondes. J'utiliserai Google Flow pour créer la vidéo. » |
| 4:30 | Donc il a répondu. Maintenant, à moi le choix : si je veux, je peux lui demander de créer une image d'un personnage illustratif, vous voyez. Bon, je vais prendre une de mes photos pour le faire. OK, voilà. |
| 5:00 | Je vais prendre une photo pour le faire… Bon, ici, je vais utiliser ma photo. |
| 5:18 – 5:46 | *(dictée à ChatGPT : silence dans l'enregistrement)* |
| 5:50 | OK, ici, voilà : il va me générer (?) l'image. Il a dit ici que nous allons créer une vidéo… « Je te conseille de varier les plans tout en conservant exactement la même personne. » OK, bon, là je garde ceci. |
| 6:30 | Voilà, je dis bon… OK, maintenant les prompts pour chaque scène, d'accord, c'est bien. Donc voilà, voici le prompt. OK, ici, bon, là, il faut que je corrige ça, parce que vous voyez ici : « Use the uploaded original photo ». Quand c'est comme ça, il [Google Flow] n'accepte pas de générer ces genres de vidéos. Donc je vais l'indiquer directement. |
| 7:00 – 7:22 | *(dictée à ChatGPT : silence dans l'enregistrement)* |
| 7:21 | Donc vu que je vous ai déjà donné la formation, du coup bon, moi, je suis un expert, et je sais comment travailler avec l'IA pour aller rapidement, pour obtenir ce que je veux. |
| 7:34 | Si vous souhaitez être beaucoup plus fort en IA, être expert, vous pouvez souscrire à nos formations ou bien rejoindre notre académie Lomé IA School pour bénéficier de nos formations à vie, d'accord. |
| 7:48 | Voilà, ici, donc voilà le premier prompt. OK, voilà, c'est bien. Donc, comme dans la formation je vous ai appris, il y a plusieurs outils de génération de vidéos IA, mais le bon outil, en qualité de voix et de génération, c'est Google Flow. Donc on va utiliser Google Flow pour le faire. |
| 8:07 | Donc on va copier le prompt, et puis on tape dans la barre de recherche ici « Google Flow », et on lance. On clique sur ça. Donc ici, dans Google Flow, on va cliquer sur « Nouveau projet », et commencer. |
| 8:30 | Et voilà. Donc ici : l'image, c'est bon ; on le met sur Veo 3 Fast ; et puis voilà, on importe l'image originale. Voilà. |
| 9:00 | Je le mets et je lance. Attention, vous voyez que j'ai fait une erreur : normalement, je devrais le mettre sur 9:16. Mais bon, j'ai fait erreur, c'est pas grave. Je pense que j'arrête ça directement… C'est déjà lancé ; on refait ça directement. N'oubliez pas : il faut que ce soit du 9:16. Le 16:9, c'est pour le format YouTube, et je ne vais pas faire une vidéo au format YouTube. |
| 9:30 | Je relance. Voilà. Google génère des vidéos de 8 secondes, et quand on génère deux vidéos de 8 secondes, ça fait 16 secondes, et donc c'est la limite atteinte, et c'est après 24 heures que tu pourras continuer à l'utiliser. Donc voilà, on va patienter. |
| 10:00 | Celle pour YouTube est prête, mais bon, on ne va pas la jouer ; on attend celle du vertical. |
| 10:30 – 11:00 | *(attente de la génération)* |
| 11:00 | *(la scène 1 est lue :)* « Bonne nouvelle ! Ce mercredi, je vous invite à une formation gratuite ! » (deux fois) |
| 11:14 | Le téléchargement va commencer maintenant… OK, là, c'est déjà téléchargé, je pense. Voilà, c'est ça qui est téléchargé, vous voyez. |
| 11:40 | OK, c'est bon. Donc on a la limite atteinte ; on va se déconnecter et puis changer de compte. Voilà pourquoi, quand vous êtes businessman, il vous faut plusieurs adresses e-mail. |
| 12:00 | Comme vous pouvez le voir, on offre ici 50 crédits (?) : ça nous permet de générer juste deux vidéos de 8 secondes. Voilà. On a déjà fait le prompt 1 ; donc pour le deuxième, on copie ça, on vient ici, on le met et on lance. |
| 12:51 | On s'assure que c'est bien en 9:16. OK, c'est bon. Alors si on met sur 2… Vous voyez que si on génère deux vidéos, nos crédits vont finir. Donc pour économiser… parce que deux vidéos, ça consomme 40 crédits ; une vidéo consomme 20 crédits, vous voyez. OK, merci. Donc on lance ça rapidement. |
| 13:14 | Donc là, c'est la scène 2. On va directement passer à la scène numéro 3 : on vient ici, on copie le prompt. |
| 13:30 | Mais attention, ça a refusé. Pourquoi ? On relance. Voilà… Mais pourquoi ? Dommage. Bon. Souvent, quand on génère dans Google Flow et qu'on sort de la page (?), ça va refuser, vous voyez. |
| 14:30 | Voilà, la deuxième vidéo est bien. |
| 15:00 | *(la scène 2 est lue :)* « Apprenez à créer vos propres sites web grâce à l'intelligence artificielle ! » |
| 15:10 | Voilà, la deuxième vidéo est bonne. J'ai fait erreur ici : je suis sorti de Google Flow, voilà, j'ai gaspillé mes 20 crédits ici. Alors je vais me déconnecter et me reconnecter à un troisième compte. Voilà. |
| 15:30 | Google Flow : « Nouveau projet ». OK, ici, on ajoute l'image de référence qu'on a créée. Voilà… non, c'est plutôt celle-ci. On patiente. |
| 16:00 | Donc ça va être des vidéos de 8 secondes ; on a déjà 16 secondes ; il reste encore des vidéos à créer. Et voilà, on le met. Donc on vient ici dans ChatGPT, on prend le prompt 3. Voilà, on est sur la scène 3 : on copie ça, on vient, on colle, on vérifie bien tout, et on lance. |
| 16:51 | Donc, la première chose que vous devez savoir, c'est que l'IA fonctionne sur la base d'instructions que vous lui donnez, d'accord. Le prompt, c'est l'instruction que vous donnez à l'IA. Ce sont les premières choses à savoir pour faire un montage vidéo avec l'IA. |
| 17:03 | La première chose à savoir : c'est quoi l'IA ? L'IA, c'est un ensemble de systèmes qui a été entraîné sur des milliards (?) de textes, de conversations, de code, tout ça, ce qui lui permet d'avoir l'autonomie de pouvoir répondre à toutes les questions. |
| 17:11 | Maintenant, cet outil IA, si vous voulez qu'il vous aide à travailler, vous devez vraiment lui fournir les données de ce que vous voulez qu'il fasse : vous devez lui donner un prompt, afin qu'il puisse comprendre votre demande. Alors si votre prompt est professionnel, vous aurez un résultat professionnel, un résultat précis, satisfaisant, vous voyez. Mais quand vous donnez un mauvais prompt, vous aurez un résultat médiocre. |
| 17:33 | C'est la première chose à savoir sur l'IA, comment ça fonctionne. C'est comme un employé intelligent, doué, qui arrive dans une autre entreprise : il ne sait pas comment vous fonctionnez ni ce que vous voulez ; c'est à vous de lui fournir ce que vous voulez, vous voyez. |
| 17:44 | Donc ici, notre objectif est de vous apprendre le montage vidéo. Alors, pour le montage vidéo, la première chose : il faut qu'on lui donne un prompt, pour lui dire le type de montage vidéo qu'on veut qu'il nous fasse, voyez-vous. Et déjà, il faut essayer de donner à l'IA une vidéo dont il va s'inspirer pour le faire. |
| 18:00 | Alors ici, on va utiliser Claude pour faire le montage vidéo. Claude est payant, mais imaginez qu'on n'avait pas d'argent pour le faire : on peut utiliser Claude gratuit, bien sûr limité, mais ça va quand même vous aider à arranger certaines choses, vous voyez. |
| 18:10 | Bon, la troisième scène est finie, comme ça. Alors on clique sur ça. *(la scène 3 est lue :)* « La formation est entièrement gratuite et en direct sur Google Meet ! » |
| 18:30 | Donc c'est téléchargé, la troisième vidéo. Voilà, c'est bon. Alors on passe maintenant à la 4ᵉ scène : on vient, on colle la 4ᵉ scène et on lance. Voilà. Donc quand ceci va être généré, c'est fini, vous voyez. |
| 18:47 | Donc là, je suis en train de faire la démonstration avec vous. Ici, on va utiliser Claude gratuit pour le faire, vous voyez, et puis après on peut même utiliser Claude payant pour le faire. Voilà. Donc avec ça, vous pouvez faire n'importe quel montage vidéo avec l'IA. |
| 19:00 | Et ça, je le fais vite et devant vous. Vous allez voir : j'ai déjà fait la formation sur comment créer les vidéos d'IA, les vidéos publicitaires, les vidéos histoire, les vidéos et films, tout ça. Ce sont des modules que j'ai détaillés, avec tous les documents à l'appui. C'est bien de la suivre, d'accord. Ce que je fais là, c'est encore un bonus pour vous aider. |
| 19:16 | Donc vraiment, voilà : vous voyez, quand tu es expert en IA, tu n'as plus besoin d'étapes, de prompts ; tu sais ce qu'il faut, tu sais comment demander à l'IA et l'obtenir. Tout ça, nous formons les gens dans tous les domaines de l'IA (?), nous rendons tous les services. Donc n'hésitez pas à nous faire confiance, que ce soit pour vous ou vos enfants. Et puis voilà, d'accord, merci. |
| 19:33 | Donc quand on va finir, on va coller ça dans CapCut, et puis on va donner à Claude pour nous faire le montage. Ici, vous allez voir. Et voilà la dernière vidéo. |
| 20:00 | *(la scène 4 est lue :)* « …pour rejoindre le groupe. À mercredi ! …mercredi. » / « Écrivez-moi sur WhatsApp pour rejoindre le groupe. À mercredi ! » |
| 20:10 | OK, c'est bon maintenant. Donc les 4 scènes sont déjà générées. OK, donc on a notre vidéo, ces 4 scènes, n'est-ce pas. Donc ici, là, il dit « pour garder le même personnage »… OK, d'accord, « ajoute le numéro au montage »… d'accord, il a dit d'ajouter le numéro. On peut le faire. |
| 20:33 | Comme c'est une petite démonstration, je le fais ; sinon l'IA va répéter les numéros, vous voyez, l'IA répète les numéros, tout ça. Donc là, bon, on va aller dans CapCut pour coller ça. Quand on vient dans CapCut, on colle ces choses. On va faire le montage, mais actuellement on n'a plus besoin de ça, vous voyez, parce que l'IA va nous faire tout ça. |
| 20:52 | Je vais essayer d'accepter rapidement ici : un, deux, trois, quatre, cinq. Voilà. Je vais le faire comme ça, ici. |
| 21:06 | *(lecture dans CapCut :)* « Bonne nouvelle ! Ce mercredi, je vous invite à une formation gratuite ! Apprenez à créer vos propres sites web grâce à l'intelligence artificielle ! » |
| 21:23 | Je supprime ça, ça, c'est la répétition. *(lecture :)* « La formation est entièrement gratuite et en direct sur Google Meet ! » Je supprime ça. *(lecture :)* « Écrivez-moi sur WhatsApp pour rejoindre le groupe. À mercredi ! …mercredi. » |
| 22:05 | Donc voici, les quatre scènes sont là. *(lecture complète des quatre scènes)* |
| 22:42 | OK, bon, donc là, vous voyez ça. Maintenant, avant, c'est moi-même qui faisais ce montage, du tout au tout. Mais on va donner ça à Claude, il va nous faire tout ça, vous voyez. On va donner à Claude, il va nous le faire rapidement. Donc je vais faire « Exporter ». On patiente. |
| 23:00 | Et voilà, maintenant c'est bon. OK, donc là, on va utiliser Claude gratuit (?). |
| 23:30 | Je peux le faire dans un premier temps, d'accord. Donc là, je suis sur mon Claude payant, ici. Voilà, moi, j'ai quatre comptes en abonnement payant, parce qu'on travaille avec plusieurs clients, sur plusieurs projets, donc on est obligé de prendre l'abonnement. Donc là, je vais utiliser un Claude gratuit, ici, d'accord. Donc je vais utiliser par exemple celui-ci : accepter, continuer… |
| 24:00 | Vraiment, j'ai un problème de connexion, dommage. Ici, je choisis celui-ci, par exemple. |
| 24:30 | Donc voilà, on va présenter : c'est quoi l'IA, comment fonctionne l'IA, quels sont les outils que nous allons utiliser pour faire le montage vidéo. Vous connaissez Claude ? Vous avez une définition de Claude, vous savez ce que c'est ? Bon, là, j'ai un problème de connexion qui m'embête. Attention… |
| 25:00 | OK, je vais venir dans la version web ici… *(silence)* C'est parti. |
| 25:30 | « Continuer avec Google » : on choisit un compte gratuit ici, celui-ci par exemple. OK, Dieu merci, ça a réussi ici, et voilà. OK, c'est bon. |
| 25:42 | Alors, il faut savoir que Claude ne peut pas lire la vidéo, sauf si on la met sur le Drive et qu'on lui autorise l'environnement (?), vous voyez. Donc ce qu'on va faire : quand vous venez ici, vous ajoutez la vidéo que vous avez exportée. N'importe quelle vidéo : ça peut être une vidéo générée par l'IA, ou une vidéo enregistrée par vous, vous voyez. Voilà, vous arrivez ici, vous l'ajoutez comme ça, voilà, et on patiente. |
| 26:30 | C'est le problème de connexion… On peut pour le moment… Donc on va lui envoyer la transcription de notre vidéo. |
| 26:59 | Imaginez que vous avez enregistré une vidéo vous-même : vous aurez certainement la transcription. Si vous ne savez pas comment le faire, il y a des sites qui transcrivent les vidéos facilement : vous transcrivez la vidéo et vous l'envoyez à l'IA, d'accord. |
| 27:09 | Donc ici je vais dire : « OK, faut m'envoyer la transcription complète du script. Je viens de terminer la création des vidéos. C'est Claude qui me fera le montage. Faut me donner la transcription à donner à Claude en plus de la vidéo que je l'enverrai. » *(il dicte en tapant)* |
| 28:30 | Et je lance. Vous voyez, voilà, c'est un exemple. D'accord, c'est bien : il me donne déjà le contenu du montage pour l'autre côté. D'accord, donc là, c'est très bien. |
| 28:47 | OK, ici, ce n'est pas bien chargé : « échec ». Bon, quand c'est comme ça, ce qu'on va faire… mettre la vidéo sur le Drive… non, ça ne peut pas aller non plus. Dommage. Mais pourquoi ces problèmes de connexion ? |
| 29:30 | Problème de connexion… |
| 30:00 | Bon, là, on va reprendre plus tard (?). |

### 2.4 Enregistrement n° 2

Joseph ne parle pas. Le son est celui des vidéos lues :

| Temps | Ce qu'on entend |
|---|---|
| 1:04 – 1:36 | version 1 montée par Claude (32 s), texte identique à la vidéo d'origine |
| 1:52 – 2:12 | version 2 (20 s) |
| 2:58 – 3:41 | la vidéo montée finale, lue dans WhatsApp (18 s), par morceaux |

---

## 3. Déroulé des enregistrements d'écran

### 3.1 Enregistrement n° 1 (30 min 13 s, samedi 17 octobre, 16 h 55 – 17 h 25)

| Temps | Application | Ce que fait Joseph |
|---|---|---|
| 0:00 – 0:46 | Écran d'accueil | Présente la démonstration (« je vais vous apprendre comment faire n'importe quel montage vidéo avec l'IA… ChatGPT, Claude, GitHub… version gratuite et version payante »). |
| 0:47 – 1:10 | **ChatGPT** (application) | Se déconnecte puis se reconnecte en choisissant un compte Google (liste de ses comptes affichée). Ouvre une nouvelle discussion. |
| 1:12 – 2:22 | ChatGPT | **Prompt 1**, dicté à la voix (bouton micro). |
| 2:25 – 2:40 | ChatGPT | ChatGPT répond : « SCRIPT VIDÉO : APPRENDS À CRÉER DES SITES WEB AVEC L'IA, GRATUITEMENT ! » (45 à 60 s). |
| 2:42 | ChatGPT | **Prompt 2** : « Autre versions ». |
| 2:46 – 3:10 | ChatGPT | Quatre versions proposées (« Version 2 — Courte, directe et dynamique », « Version 4 — Style formateur, avec un appel à l'action fort »…). |
| 3:12 | ChatGPT → partage | Copie la version 4 (menu de partage Android ouvert : contacts WhatsApp visibles). |
| 3:18 – 3:28 | ChatGPT | **Prompt 3** : colle la version 4 et ajoute « Je valide Ceci mais ça dépasse 30 secondes ». |
| 3:30 – 3:50 | ChatGPT | Version raccourcie « conçue pour durer environ 35 à 45 secondes ». |
| 3:52 – 4:28 | ChatGPT | **Prompt 4**, tapé au clavier : « Divise moi en un script de vidéo de 30 secondes / J'utiliserai Google flow pour créer la vidéo ». |
| 4:30 – 4:45 | ChatGPT | Réponse : « Script vidéo — 30 secondes », 3 scènes de 10 s avec des images d'exemple. |
| 4:48 – 5:04 | **WhatsApp** (onglet Actus, puis chaîne « Héritage & Livres ») | Cherche une photo de lui ; ouvre une publication de chaîne. |
| 5:06 – 5:16 | ChatGPT → **Google Photos** | Joint sa photo en costume (choisie dans Google Photos). |
| 5:18 – 5:46 | ChatGPT | **Prompt 5**, dicté, avec la photo jointe. |
| 5:48 – 6:30 | ChatGPT | Réponse : vidéo de 32 s en 4 scènes de 8 s ; ChatGPT génère une image de Joseph assis à un bureau (« Mise en scène », « Dernières retouches »), que Joseph ouvre. |
| 6:36 – 6:58 | ChatGPT | Première série de prompts Google Flow (avec « Use the uploaded original photo… »). Joseph explique que Google Flow refuse ce genre de prompt avec une vraie photo. |
| 7:00 – 7:22 | ChatGPT | Lit le conseil final de ChatGPT, dicte le **prompt 6**. |
| 7:24 – 8:08 | ChatGPT | Nouvelle série de 4 prompts avec un « personnage fictif créé par IA ». Joseph fait la publicité de Lomé IA School (7:38 – 7:50). |
| 8:10 – 8:34 | **Chrome** → **Google Flow** | Cherche « Google flow », ouvre flow.google.com, crée un nouveau projet. |
| 8:36 – 8:58 | Google Flow | Importe l'image générée (`1001460048.png`) comme image de départ. |
| 9:00 – 9:30 | Google Flow | Colle le **prompt Google Flow n° 1** ; réglages Vidéo, Veo 3.1 – Fast, x1, « La génération utilisera 20 crédits ». Il lance d'abord en 16:9 par erreur, arrête, relance en 9:16. |
| 9:30 – 10:58 | Google Flow | Génération (0 → 100 %). Explique la limite : 20 crédits par vidéo de 8 s. |
| 11:00 – 11:40 | Google Flow → Téléchargements | Lit la scène 1 (« Man speaking at o… »), la télécharge (1,99 Mo). |
| 11:42 – 12:12 | Google Flow | Crédits épuisés : se connecte avec un **deuxième compte Google** et crée un nouveau projet. |
| 12:18 – 13:12 | ChatGPT → Google Flow | Copie le **prompt n° 2**, réimporte l'image ; essaie x2 (40 crédits) puis repasse à x1. |
| 13:18 – 13:36 | Google Flow | « Échec — Désolé, la génération de cette vidéo a échoué. » Il relance. |
| 13:42 – 15:10 | Google Flow | Génération, puis lecture de la scène 2 (« Man explaining we… »). |
| 15:12 – 15:54 | Google Flow | Écran des crédits (« 10 crédits Google Flow »), passe à un **troisième compte**, nouveau projet, réimporte la photo. |
| 16:24 – 18:20 | ChatGPT → Google Flow | Copie et lance le **prompt n° 3** ; pendant la génération, explique ce qu'est l'IA et un prompt (16:55 – 18:10). Télécharge la scène 3 (« Man explaining trai… »). |
| 18:30 – 20:10 | ChatGPT → Google Flow | Copie et lance le **prompt n° 4** ; scène 4 (« Business coach sp… ») lue puis téléchargée. |
| 20:18 – 20:40 | ChatGPT | Lit les conseils « Pour garder le même personnage dans les quatre vidéos ». |
| 20:48 – 22:54 | **CapCut** | Importe les clips, garde les 4 scènes dans l'ordre, coupe une répétition, lance l'amélioration « UHD par l'IA ». |
| 23:00 | CapCut | « Exportation en résolution 720p en cours… 64,1 % ». |
| 23:12 – 23:24 | **Google Keep** | Ouvre une note contenant le **prompt de montage préparé** (texte recopié plus bas). |
| 23:28 – 24:46 | **Claude** (application) | Montre son compte payant (forfait Pro, « j'ai quatre comptes abonnement payant ») ; essaie de se connecter à un compte gratuit : « L'authentification n'a pas abouti ». |
| 25:06 – 26:00 | Chrome → **claude.ai** | Se connecte à un compte gratuit dans le navigateur (« Vous voilà ! », « Forfait Free »). |
| 26:02 – 26:50 | claude.ai | Joint la vidéo exportée par CapCut, `lv_0_20261017171751.mp4` (**32,49 Mo**) ; l'envoi reste bloqué. |
| 26:54 – 28:48 | ChatGPT | **Prompt 7**, tapé : demande la transcription du script pour Claude ; ChatGPT répond avec le script et un prompt de montage complet. |
| 28:54 – 29:40 | claude.ai | « Impossible d'importer « lv_0_20261017171751.mp4 ». Réessayez. » / « Échec du téléchargement ». Joseph parle d'un problème de connexion et propose de passer par Drive. |
| 29:42 – 30:13 | Claude (application) | Nouvel essai de connexion : nouvel échec. Fin de l'enregistrement. |

> **Cause réelle de l'échec à 28:54** : le fichier pèse 32,49 Mo. La limite d'un fichier joint dans Claude est
> 30 Mo. Ce n'était pas un problème de connexion. La suite (enregistrement n° 2) le confirme : Joseph a envoyé
> à la place la copie WhatsApp de la vidéo (`VID-20261018-WA0174`, 360 × 640, bien plus légère), qui est passée.

### 3.2 Enregistrement n° 2 (4 min 03 s, dimanche 18 octobre, 15 h 11 – 15 h 15)

| Temps | Application | Ce que fait Joseph |
|---|---|---|
| 0:00 – 0:04 | ChatGPT | Ouvre le menu latéral (historique des discussions visible). |
| 0:06 – 0:28 | ChatGPT | Fait défiler la discussion de la veille : prompts Google Flow des scènes 2 à 4, sa demande de transcription, le script complet et le prompt de montage « MISSION ». |
| 0:30 | Écran d'accueil | Ouvre Claude. |
| 0:32 – 0:34 | **Claude** (application) | Paramètres (compte gratuit, « Free ») puis la discussion « Vidéo publicitaire formation IA ». |
| 0:36 – 0:37 | Claude | Bas de la discussion (versions 3 et 4, défilement rapide). |
| 0:38 – 0:52 | Claude | Remonte au premier message : la vidéo `VID-20261018-WA0174` + transcription + prompt « MISSION » (**prompt Claude n° 1**). |
| 0:54 – 1:02 | Claude | Réponse de Claude : « Je commence par inspecter la vidéo fournie et vérifier que ffmpeg est disponible… », fichier « Formation gratuite IA pub 1080x1920 ». |
| 1:02 – 1:36 | Claude (lecteur vidéo) | Lit la **version 1** (32 s, 1080 × 1920) : sous-titres, bandeau final vert avec le numéro. |
| 1:38 – 1:40 | Claude | Résumé de Claude (clips et voix, sous-titres, musique, appel à l'action, limites), puis **prompt Claude n° 2**. |
| 1:42 – 1:50 | Claude | Réponse : version 2 de 21 s (11 s de silences retirés, corrections de langue, illustrations animées). |
| 1:52 – 2:12 | Claude (lecteur vidéo) | Lit la **version 2** (20 s) : illustrations animées dans les coins, confettis. |
| 2:14 – 2:16 | Claude | **Prompt Claude n° 3** avec une capture d'écran ; Claude reconnaît l'erreur (« À mercredi » répété). |
| 2:17 – 2:20 | Claude | Version 4 (19,5 s, sans « À mercredi ») ; **prompt Claude n° 5** ; Claude fait une version allégée `pub_formation_ia.mp4` (6,7 Mo au lieu de 19 Mo). |
| 2:21 – 2:37 | **claude.ai** dans Chrome | Ouvre la même discussion sur le site (« Connexion impossible » puis « Se reconnecter ») ; **prompt Claude n° 6** ; ouvre « Pub formation ia MP4 » (lecteur noir, 0:19) et le télécharge. |
| 2:38 | Volet des notifications | « pub_formation_ia… Téléchargement terminé ». |
| 2:40 – 2:57 | **WhatsApp** | Ouvre sa discussion « Joseph Notes 07 » (notes à soi-même), envoie la vidéo avec la légende « Résultat ». |
| 2:58 – 3:41 | WhatsApp (lecteur) | Lit le résultat (18 s), plusieurs fois, par morceaux. |
| 3:43 – 3:58 | WhatsApp → **Google Drive** | « Enregistrer » ; ouvre Drive, importe `VID-20261018-WA0228.mp4` (1,55 Mo) dans « Mon Drive ». |
| 4:00 – 4:03 | Google Drive | « Importation de 1 élément… ». Fin. |

### 3.3 Texte exact de chaque prompt visible à l'écran

Recopié tel qu'il est affiché, fautes comprises. Quand un texte n'est pas entièrement visible, la partie manquante
est signalée.

#### Prompts envoyés à ChatGPT (enregistrement n° 1)

**Prompt 1 — dicté, envoyé à 2:25** (seule la fin du texte est visible à l'écran, de 2:24 à 2:28) :

> […] ils m'écrivent, alors il faut qu'ils disent bon, coach Joseph bonsoir, alors je veux participer gratuitement
> à votre formation que vous organisez sur mardi, vous voyez. Donc voilà. Donc c'est un peu ça du coup. Bon. Eh bien
> voilà, d'accord. Veuillez alors, voilà un peu ce que je veux. Alors tu as maintenant écouté ce que je veux et je
> voudrais que tu puisses essayer de mieux réécrire ça en bref à un script de plus de trente secondes. Merci

**Prompt 2 — 2:42** :

> Autre versions

**Prompt 3 — 3:18 à 3:28** : Joseph colle la « Version 4 — Style formateur » de ChatGPT, qui se termine par
« Je vous attends nombreux ce mercredi ! / Partagez également cette opportunité avec vos amis qui souhaitent
apprendre l'intelligence artificielle. À très bientôt ! 🚀 », puis tape :

> Je valide Ceci mais ça dépasse 30 secondes

(à 3:27 on lit « Je valide Ceci mais ça dépasse 30 sevo », corrigé ensuite par la suggestion « secondes » du clavier ;
le message envoyé est replié derrière « Afficher plus ».)

**Prompt 4 — tapé de 3:52 à 4:28** :

> Divise moi en un script de vidéo de 30 secondes
> J'utiliserai Google flow pour créer la vidéo

**Prompt 5 — dicté avec la photo jointe, envoyé à 5:47** (début caché sous le haut de l'écran) :

> […] voici ma photo ori[ginale …] Maintenant il faut que je puisse soit assis dans un bureau ok un bureau. Et voilà,
> et bien ensuite je communique professionnellement. Ou bien je sois debout correctement en train de parler avec
> énergie, bien. Merci

**Prompt 6 — dicté, envoyé à 7:24** (début caché) :

> […] Google Flow que c'est une image réelle parce que Google Flow n'accepte pas les images qui sont des images du
> personnage en fait, voilà. Donc il faut que je lui montre que bon c'est un personnage fictif généré. Donc il faut
> que voilà, voilà, voilà. C'est très important. Donc il faut me renvoyer tous les prompts en fait

(le début, visible à 0:07 de l'enregistrement n° 2, commence par « …générée. Faut pas faire savoir à Google Flow
que c'est une image réelle… » ; la première ligne reste coupée.)

**Prompt 7 — tapé de 27:12 à 28:34** :

> OK d'accord
> Faut m'envoyer la transcription complèt du script. Je viens de terminer la création des vidéos. C'est Claude qui me
> fera le montage. Faut me donner la transcription à donner à Claude en plus de la vidéo que je l'enverrai

(le texte affiché dans la bulle envoyée se termine par « que je l'enverrai ».)

#### Prompts Google Flow écrits par ChatGPT

**Première série (6:36 – 6:58), avec la vraie photo — non utilisée dans Google Flow.** Seules les scènes 1 à 3
sont visibles, en partie :

- Scène 1 — « L'accroche » (Ambiance : bureau moderne, sérieux et accueillant ; Position : assis derrière un bureau,
  regard directement vers la caméra) :

  > Use the uploaded original photo as the mandatory identity reference. Preserve the exact same man's face, skin
  > tone, haircut, facial features, and natural body proportions. He wears the same elegant navy blue suit and white
  > shirt.
  >
  > Create an ultra-realistic vertical 9:16 promotional video, 8 seconds long. The man is seated confidently behind a
  > desk in a modern professional office, looking directly into the camera. A laptop displaying a website is on the
  > desk. Natural daylight, cinematic lighting, realistic skin texture, medium shot, subtle natural hand gestures,
  > professional French-speaking African business coach.
  >
  > He speaks in French with accurate lip synchronization, a confident, energetic, welcoming voice:
  > "Bonne nouvelle ! Ce mercredi, je vous invite à une formation gratuite !"
  >
  > One continuous shot, no cuts, no subtitles, no text overlays, no music. Clear voice, natural facial expressions.

- Scène 2 (début coupé) :

  > [Create an ultra-realistic vertical 9:16 video, 8] seconds long, in the same modern o[ffice]. The man is standing
  > upright beside a large monitor showing a beautiful professional website homepage. He looks at the camera and makes
  > a small confident hand gesture while speaking. Professional lighting, realistic movement, medium shot, premium
  > business advertisement.
  >
  > He speaks clearly in French with accurate lip synchronization:
  > "Apprenez à créer vos propres sites web grâce à l'intelligence artificielle !"
  >
  > One continuous shot, natural French pronunciation, energetic and professional delivery. No subtitles, no text
  > overlays, no music, no camera cuts.

- Scène 3 — « Expliquer comment participer » (Ambiance : directe et persuasive ; Position : debout face caméra,
  gestes naturels et sourire léger), fin non visible :

  > Use the uploaded original photo as the mandatory identity reference. Keep the exact same man, face, skin tone,
  > haircut, navy blue suit, and white shirt. Maintain consistent identity and appearance with the previous scenes.
  >
  > Create an ultra-realistic vertical 9:16 promotional video, 8 seconds long. The man stands confidently in his
  > modern office, facing the camera. He speaks with friendly enthusiasm and makes a small inviting gesture with one
  > hand. Medium shot, natural daylight, professional corporate atmosphere, realistic facial expressions.
  >
  > He says in French with clear pronunciation and accurate lip synchronization:
  > "La formation est entièrement gratuite et se […]

**Seconde série (7:44 – 8:08, 12:24, 21:42, 22:01), avec le personnage fictif — celle collée dans Google Flow.**

Scène 1 — 0 à 8 secondes : L'annonce (collée à 9:00) :

> Create an ultra-realistic cinematic video, vertical 9:16, exactly 8 seconds long, featuring a fictional
> AI-generated African male business coach character in his late twenties. He has dark brown skin, short neatly
> shaped black hair with a clean fade, a clean-shaven face, an athletic-average build, and wears an elegant dark navy
> blue suit with a white dress shirt. He is a fictional digital character, not a real person.
>
> The character sits confidently behind a desk in a stylish modern office. A laptop displaying a professional website
> is on the desk. He looks directly at the camera with a friendly, confident expression and speaks naturally in
> French.
>
> Exact dialogue:
> "Bonne nouvelle ! Ce mercredi, je vous invite à une formation gratuite !"
>
> Accurate French lip synchronization, natural facial expressions, subtle hand gestures, realistic skin texture,
> professional daylight, smooth camera, medium shot. One continuous take. No subtitles, no text overlays, no music.
> Preserve the same character design for future scenes.

Scène 2 — 8 à 16 secondes : La formation (collée à 12:42) :

> Create an ultra-realistic vertical 9:16 video, exactly 8 seconds long, featuring the same fictional AI-generated
> African male business coach from the previous scene. He has dark brown skin, short black hair with a clean fade,
> and wears the same dark navy blue suit and white shirt. Maintain identical character design, face, hairstyle, and
> clothing.
>
> He is now standing upright in the same modern office beside a large computer monitor showing a clean, attractive
> website homepage. He faces the camera and explains the opportunity with energetic but natural hand gestures.
>
> Exact French dialogue:
> "Apprenez à créer vos propres sites web grâce à l'intelligence artificielle !"
>
> Professional business advertisement, natural French voice, accurate lip synchronization, realistic gestures,
> cinematic daylight, medium shot, smooth camera. One continuous shot. No subtitles, no text overlays, no music.

Scène 3 — 16 à 24 secondes : La gratuité et Google Meet (collée à 16:48) :

> Create an ultra-realistic vertical 9:16 video, exactly 8 seconds long, featuring the same fictional AI-generated
> African male business coach. Preserve his exact established digital character design: dark brown skin, short black
> fade haircut, clean-shaven face, navy blue suit, and white dress shirt.
>
> He stands confidently in the same elegant office, looking directly into the camera. His expression is warm and
> reassuring. He makes a small open-palm gesture while explaining the training format.
>
> Exact French dialogue:
> "La formation est entièrement gratuite et en direct sur Google Meet !"
>
> Natural French pronunciation, clear voice, accurate lip synchronization, realistic facial movement, professional
> lighting, medium shot, steady camera. One continuous take. No subtitles, no text overlays, no music. Maintain visual
> continuity with the previous scenes.

Scène 4 — 24 à 32 secondes : L'appel à l'action (collée à 18:42) :

> Create an ultra-realistic vertical 9:16 video, exactly 8 seconds long, featuring the same fictional AI-generated
> African male business coach character established in the previous scenes. Preserve his exact face design, dark
> brown skin, short black fade haircut, navy blue suit, and white shirt.
>
> He stands in the same modern office, looking directly into the camera with a confident smile. He makes a welcoming
> gesture toward the viewer. Leave clear empty space in the lower part of the frame for a phone number to be added
> during editing.
>
> Exact French dialogue:
> "Écrivez-moi sur WhatsApp pour rejoindre le groupe. À mercredi !"
>
> Clear, warm, energetic French delivery, accurate lip synchronization, realistic movement, professional commercial
> video, steady medium shot, one continuous take. No subtitles, no generated text, no music. Keep the same character
> and environment as the previous scenes.

Réglages Google Flow visibles : Vidéo · Images (image de départ) · 9:16 · Veo 3.1 – Fast · x1 · 720p · 8 s ·
« La génération utilisera 20 crédits » (40 crédits en x2).

#### Prompt de montage préparé dans Google Keep (enregistrement n° 1, 23:18)

> Voici une vidéo. Fais-en le montage complet et renvoie-moi le fichier MP4 final :
> 1. Format vertical 1080×1920.
> 2. Coupe les silences de plus d'une demi-seconde.
> 3. Ajoute des sous-titres en français, en gros caractères blancs avec contour noir, en bas de l'écran.
> 4. Ajoute un titre au début pendant 3 secondes : « Mon premier montage avec l'IA ».
> Utilise ton environnement de code (par exemple ffmpeg) et donne-moi le fichier téléchargeable.

Ce prompt n'a finalement pas été envoyé : c'est celui de ChatGPT (ci-dessous) qui l'a été.

#### Prompts envoyés à Claude (enregistrement n° 2)

**Prompt Claude n° 1 — visible de 0:38 à 0:52** (vidéo `VID-20261018-WA0174` jointe ; texte écrit par ChatGPT et
collé par Joseph, précédé de « Transcription : ») :

> Transcription :SCRIPT COMPLET — FORMATION GRATUITE SUR LA CRÉATION DE SITES WEB AVEC L'IA
>
> Scène 1 : Accroche
> « Bonne nouvelle ! Ce mercredi, je vous invite à une formation gratuite ! »
>
> Scène 2 : Présentation de la formation
> « Apprenez à créer vos propres sites web grâce à l'intelligence artificielle ! »
>
> Scène 3 : Format de la formation
> « La formation est entièrement gratuite et en direct sur Google Meet ! »
>
> Scène 4 : Appel à l'action
> « Écrivez-moi sur WhatsApp pour rejoindre le groupe. À mercredi ! »
>
> Informations à afficher à l'écran :
> - Formation 100 % gratuite
> - Création de sites web avec l'intelligence artificielle
> - En direct sur Google Meet
> - WhatsApp : +228 72 24 02 31
> - Rendez-vous ce mercredi
>
> MISSION : RÉALISER UNE VIDÉO PUBLICITAIRE PROFESSIONNELLE DE 32 SECONDES
>
> Je vais te fournir quatre clips vidéo générés avec Google Flow. Je souhaite que tu les assembles pour créer une
> publicité professionnelle destinée à promouvoir ma formation gratuite sur la création de sites web avec
> l'intelligence artificielle.
>
> 1. Durée et format
> - Durée cible : 32 secondes.
> - Format vertical 9:16, adapté à TikTok, Facebook Reels, Instagram Reels et aux statuts WhatsApp.
> - Résolution : 1080 × 1920 si les fichiers sources le permettent.
> - Respecter l'ordre des quatre clips, chacun durant environ 8 secondes.
>
> 2. Montage des séquences
> - Clip 1 : accroche et annonce de la formation gratuite.
> - Clip 2 : présentation de la création de sites web avec l'IA.
> - Clip 3 : précision que la formation est gratuite et se déroule en direct sur Google Meet.
> - Clip 4 : invitation à contacter le formateur sur WhatsApp.
>
> Utilise des transitions discrètes et professionnelles. Évite les effets excessifs, les zooms brusques et les
> animations inutiles.
>
> 3. Sous-titres
> Ajoute des sous-titres français parfaitement synchronisés avec les paroles. Utilise une police moderne, claire et
> suffisamment grande pour les écrans de téléphone. Mets en évidence certains mots comme « GRATUITE », « SITES WEB »,
> « INTELLIGENCE ARTIFICIELLE » et « GOOGLE MEET ».
>
> Veille à ce que les sous-titres ne masquent pas le visage du présentateur.
>
> 4. Identité visuelle
> Conserve le même personnage, son apparence, son costume et l'ambiance professionnelle des clips originaux. Ne
> modifie pas son visage et n'ajoute pas de mouvements artificiels inutiles.
>
> Adopte un style publicitaire moderne, élégant, dynamique et crédible.
>
> 5. Musique et voix
> Ajoute une musique instrumentale légère, motivante et professionnelle, à faible volume afin que la voix reste
> parfaitement audible. Si les vidéos contiennent déjà les dialogues, conserve et synchronise leur audio original.
> Ne remplace pas les paroles et ne génère pas de nouvelle voix par-dessus.
>
> 6. Appel à l'action final
> Sur la dernière séquence, affiche clairement :
> FORMATION 100 % GRATUITE
> Création de sites web avec l'IA
> EN DIRECT SUR GOOGLE MEET
> WHATSAPP : +228 72 24 02 31
> RENDEZ-VOUS CE MERCREDI
>
> Fais ressortir le numéro WhatsApp avec une taille suffisamment grande et un contraste élevé. Garde ces informations
> visibles pendant les dernières secondes.
>
> 7. Contrôle qualité
> Avant de terminer, vérifie :
> - La cohérence des quatre séquences.
> - La synchronisation entre les voix et les sous-titres.
> - L'orthographe de tous les textes.
> - La bonne visibilité du numéro WhatsApp.
> - L'absence de coupures brutales de voix.
> - Le respect du format vertical 9:16.
>
> Exporte la vidéo finale en MP4, avec un encodage H.264 et un son AAC si possible.
>
> Si tu ne peux pas effectuer directement le montage vidéo dans ton environnement, indique-moi clairement les étapes
> à suivre ou fournis un script de montage exécutable qui assemble les quatre clips automatiquement. Ne prétends pas
> avoir exporté une vidéo si le fichier n'a pas réellement été créé.

**Prompt Claude n° 2 — 1:40** :

> Coupe les silences de plus d'une demi-seconde.
> Corrigé tous les erreurs de langage et de répétition
> Fait un excellent montage vidéo avec d'excellents illustration

**Prompt Claude n° 3 — 2:15** (avec une capture d'écran de la fin de la vidéo) :

> Il y a erreur et répétition à partir de 20 secondes précisément la partie de «à mercredi….»

**Prompt Claude n° 4 — 0:36**, aperçu seulement pendant un défilement rapide, illisible en entier :
« À partir de 20 secondes "à mercredi quasi" doit… » (il a mené à la version 4 sans « À mercredi »).

**Prompt Claude n° 5 — 2:20** :

> Je n'arrive pas à télécharger

**Prompt Claude n° 6 — 2:26** (sur claude.ai dans Chrome) :

> Le vrai problème que je trouve pas le bouton de téléchargement
> J'utilise Claude Web avec mon phone

---

## 4. Vidéo d'origine contre vidéo montée par Claude gratuit

### Ce que Claude a fait (d'après la vidéo et ses propres comptes rendus, enregistrement n° 2)

| Point | Vidéo d'origine | Vidéo montée |
|---|---|---|
| Durée | 32 s, longs blancs au début de chaque plan | 18,5 s : **≈ 11 s de silences retirés**, respirations de 0,2–0,3 s gardées, raccords adoucis (fondus de 0,14 s) |
| Erreurs de voix | « …mercredi » répété à la fin | « À mercredi ! » et la répétition supprimés (fin sur « pour rejoindre le groupe. ») |
| Sous-titres | aucun | 2 lignes, blanc gras (Poppins Bold) à contour, mots-clés en **jaune** (GRATUITE, SITES WEB, INTELLIGENCE ARTIFICIELLE, GOOGLE MEET, WhatsApp), placés au milieu de l'image, sur le buste ; apparition en fondu |
| Titre d'accroche | aucun | **aucun** (le titre « Mon premier montage avec l'IA » du prompt Keep n'a pas été demandé) |
| Illustrations | aucune | petites cartes animées dans les coins hauts : calendrier « MERCREDI », badge « 100 % GRATUIT », chapeau de diplômé, fenêtre de navigateur qui construit un site, puce « IA », étiquette « 0 FCFA GRATUIT », grille de visioconférence, conversation WhatsApp, icône de groupe ; confettis sur « Bonne nouvelle ! » |
| Cadrage | fixe | légers zooms alternés sur les coupes (« jump cuts ») |
| Appel à l'action | aucun | bandeau vert et doré en bas dès « Écrivez-moi sur WhatsApp » (≈ 3,7 s) : FORMATION 100 % GRATUITE / Création de sites web avec l'IA / EN DIRECT SUR GOOGLE MEET / WHATSAPP **+228 72 24 02 31** / RENDEZ-VOUS CE MERCREDI |
| Musique | aucune | musique instrumentale composée par Claude, qui baisse quand la voix parle ; effets sonores discrets |
| Format livré par Claude | — | MP4 H.264 + AAC, 1080 × 1920, 19,5 s ; 19 Mo, puis version allégée de **6,7 Mo** (`pub_formation_ia.mp4`) |

Claude a produit quatre versions en une discussion : v1 (32 s, sous-titres + bandeau), v2 (21 s, silences coupés,
illustrations), v3 (correction de la fin), v4 (19,5 s, sans « À mercredi »).

### Qualité du résultat

- **Points forts** : rythme bien meilleur (−40 % de durée sans couper de mot), sous-titres justes et bien
  orthographiés, mots-clés mis en valeur, numéro lisible et bien visible, plusieurs corrections faites sur simple
  demande en français. Claude a été honnête sur ses limites (il n'avait pas réécouté la vidéo, décalage possible
  des sous-titres).
- **Points faibles visibles** :
  - **image floue** : Claude a travaillé sur une copie WhatsApp en 360 × 640 ; il l'a agrandie en 1080 × 1920
    (ce qui n'ajoute pas de détail), puis le résultat a de nouveau été compressé par WhatsApp en 360 × 640 ;
  - illustrations petites et pâles, dans les coins, souvent peu lisibles sur un téléphone ;
  - pas de titre d'accroche au début, pas d'ouverture percutante ;
  - musique assez présente par rapport à la voix ;
  - l'erreur « À mercredi » n'a été vue qu'après une remarque de Joseph (Claude ne réécoute pas le son) ;
  - le premier rendu (v1) gardait les 32 s : il a fallu redemander la coupe des silences.

### Limites visibles de Claude gratuit

1. **Taille des fichiers : 30 Mo au plus.** L'export CapCut (32,49 Mo) a été refusé (« Impossible d'importer…
   Réessayez », enregistrement n° 1, 28:54) ; le message parle de connexion, mais c'est la taille. Solution
   utilisée : envoyer une copie compressée (WhatsApp), au prix de la qualité. Meilleure solution à enseigner :
   exporter de CapCut en 720p avec un débit plus bas, ou envoyer les 4 clips de Google Flow séparément
   (≈ 2 Mo chacun, ce que Claude a lui-même proposé : « Avec les clips originaux de Google Flow, le rendu serait plus
   net »).
2. **Durée** : la vidéo de 32 s est passée sans problème ; pour une vidéo longue, la limite de 30 Mo arrive vite
   (≈ 30 s à 8 Mbit/s).
3. **Téléchargement sur téléphone** : le fichier de 19 Mo ne se téléchargeait pas sur la connexion mobile ; Claude
   a fait une version de 6,7 Mo, et Joseph a dû passer par claude.ai dans Chrome pour trouver le bouton
   « Télécharger ».
4. **Connexion au compte gratuit** dans l'application : échecs répétés (« L'authentification n'a pas abouti »),
   contournés par le navigateur.
5. **Quotas** : le forfait gratuit limite le nombre de messages ; ici, 6 messages ont suffi. (Google Flow, lui,
   limite à 20 crédits par vidéo de 8 s : Joseph a utilisé trois comptes Google.)

---

## 5. Meilleurs passages à montrer dans la formation

| Vidéo | Temps | Pourquoi |
|---|---|---|
| Vidéo d'origine puis vidéo montée | en entier (32 s puis 18 s) | l'avant / après, à montrer côte à côte ou l'un après l'autre |
| Enregistrement n° 1 | 3:52 – 4:45 | demander un script de 30 s découpé pour Google Flow |
| Enregistrement n° 1 | 5:48 – 6:30 | ChatGPT crée l'image du présentateur à partir d'une photo |
| Enregistrement n° 1 | 6:46 – 7:30 | pourquoi Google Flow refuse une vraie photo, et comment demander un « personnage fictif » |
| Enregistrement n° 1 | 8:10 – 9:30 | ouvrir Google Flow, importer l'image, coller le prompt, régler 9:16 / Veo 3.1 – Fast / x1 |
| Enregistrement n° 1 | 10:58 – 11:40 | première scène générée, lue et téléchargée (moment fort) |
| Enregistrement n° 1 | 13:00 – 13:36 | le coût en crédits (20 / 40) et l'échec de génération : bon exemple des limites |
| Enregistrement n° 1 | 16:55 – 18:10 | explication orale « qu'est-ce qu'un prompt » (à réenregistrer en meilleur son) |
| Enregistrement n° 1 | 20:48 – 23:00 | assemblage rapide des 4 clips dans CapCut |
| Enregistrement n° 1 | 23:18 – 23:24 | le prompt de montage préparé dans Google Keep (simple, réutilisable) |
| Enregistrement n° 1 | 26:00 – 26:50 puis 28:54 | joindre la vidéo à Claude et l'échec à 32,49 Mo : expliquer la limite de 30 Mo |
| Enregistrement n° 1 | 27:12 – 28:48 | demander à ChatGPT la transcription et le prompt de montage pour Claude |
| Enregistrement n° 2 | 0:38 – 0:52 | le prompt « MISSION » complet envoyé à Claude |
| Enregistrement n° 2 | 0:54 – 1:36 | la réponse de Claude et la version 1 jouée |
| Enregistrement n° 2 | 1:38 – 2:12 | « Coupe les silences… » puis la version 2 avec illustrations |
| Enregistrement n° 2 | 2:14 – 2:20 | corriger une erreur en donnant l'instant en secondes |
| Enregistrement n° 2 | 2:21 – 2:38 | où trouver le bouton « Télécharger » sur téléphone |

À éviter ou à flouter : les passages listés en partie 6 (comptes, contacts, notifications), et les temps morts de
génération (9:30 – 10:58, 13:42 – 14:58, 16:54 – 17:54, 18:48 – 19:58 de l'enregistrement n° 1), à accélérer.

---

## 6. Informations privées visibles

À flouter ou à couper avant toute diffusion.

**Adresses e-mail (sélecteurs de comptes Google)** — enregistrement n° 1 à 1:00 – 1:06, 11:48, 23:48, 24:18,
29:48 ; ChatGPT à 0:53 :

- comptes de Joseph : josephahiankonou627@, josephahiankonou9@, ahiankonoujoseph51@, academyjoseph71@,
  ahiankonoujoseph71@, ahiankonouj@, perfectionj57@, ahiankonoujoseph4@, perfectionjoseph88@,
  ahiankonoujoseph102@, josephahiankonou07@, josephahiankonou2@, josephahiankonou67@, josephahiankonou97@
  (tous @gmail.com) ;
- **une autre personne : « Christian Bruce », christianbruce67@gmail.com** (23:48, 24:18) ;
- Claude : ahiankonoujoseph102@gmail.com, forfait Pro (1 : 23:36), ahiankonouj@gmail.com (1 : 25:24),
  perfectionjoseph88@gmail.com (1 : 25:36) ; josephahiankonou07@gmail.com, Free (2 : 0:32) ;
- Google Flow, écran des crédits : josephahiankonou9@gmail.com (1 : 15:18) ;
- Google Drive : josephahiankonou627@gmail.com (2 : 3:58) ; Gmail dans les notifications :
  ahiankonoujoseph102@g… (2 : 2:38).

**Numéros de téléphone**

- +228 72 24 02 31 : numéro de la formation, voulu public (vidéos, prompts).
- **+228 98 72 59 87** et **+228 79 40 31 96** : contacts dans le menu de partage (1 : 3:12).
- **Captures MTN MoMo « Dépôt 1000F à BERENICE GNIMADI (22901576297…) »** dans Google Photos (1 : 5:12 et
  15:48 – 15:54) : nom et numéro d'une tierce personne et transaction d'argent — **à flouter absolument**.

**Noms, conversations et contacts**

- Menu de partage : Amenyo, Joseph Notes 07, Formation VIP : Mont… (1 : 3:12).
- WhatsApp, Actus : statuts (Mon statut, Johnny…) et chaînes Asad Shahzad, LootAlerts, Gwapura Nyini (message
  vocal), Cooking Recipes, Zimmarriage Teachings (1 : 4:48) ; chaîne « Héritage & Livres » (annonce de villa à
  Lomé, 1 : 4:54 – 5:04).
- Liste des discussions WhatsApp (2 : 2:40) : « Dr BOLDJA Yétigolibe Raphaël Dépôt… » (« Merci infiniment chef »),
  « CRÉEZ VOS AGENTS IA — FORMA… », Joseph Notes 07, Guillaume Service, « CRÉATION SITE WEB AVEC L'IA »,
  « PÂTISSERIE : FORMATION GRATUITE », « TON MÉTIER EST-IL MENACÉ PAR… » ; alerte « L'espace de stockage de
  l'appareil est presque plein ».
- Discussion « Joseph Notes 07 » : message Talkami avec le lien talkami.laravel.cloud (2 : 2:42 – 2:57).
- Google Keep : autres notes visibles dans la liste (prompts photo sur « Merveille et Hermès », 1 : 23:18).

**Historiques**

- ChatGPT, discussions : Contexte complet Talkami, Choisir une extension domaine, Script formation IA, Contexte à
  transférer, Création affiche recrutement bilin…, Connexion GitHub Laravel, Créer un logo Talkami (1 : 0:50) ;
  Créer une image cinématographi…, Photo body edit, Créer une image réaliste, Traduction des outils IA, Correction
  du script IA, Renforcer le CTA (1 : 16:24) ; Réécriture message WhatsApp, Réécriture publication IA, Diviser
  message en trois, Entraîner une voix IA gratuitement, Texte de prospection WhatsApp (2 : 0:00).
- Claude (compte Pro, 1 : 23:30) : épinglées « Mentalité de légende : se libérer du c… », « Ce que tu sais de
  moi » ; récentes « Montage vidéo avec Claude Code », « Plan de projet », « Clé API WhatsApp Business »,
  « Site GESAH Consult », « Publicité », « Ama sur les pages de vente ».
- Chrome, recherches (1 : 8:12) : transcription tiktok vidéo, Google flow, download youtube vidéo, transcription
  vidéo youtube en texte gratuit, github com, Lomé IA, Lomé IA school, notebooklm, Joseph Ahiankonou.
- Téléchargements (1 : 11:24) : « 17 octobre 2026.pdf » (turboscribe.ai), stockage 4,48 Go.
- Fichiers récents (1 : 26:06 ; 2 : 3:52) : noms de vidéos, captures d'écran, `DOC-20261018-WA0016.pdf`.
- Google Drive (2 : 3:46) : « Affiche Pro avec l'IA.mp4 », enregistrements d'écran.
- Adresse de la discussion Claude : claude.ai/chat/250add16… (2 : 2:21 – 2:37).

**Notifications** (volet ouvert : 1 : 12:36, 14:24, 18:24, 29:18 – 29:30 ; 2 : 2:38)

- Nicegram : groupes « SUPER ARMY », « AE Storage : Phone Call UI Kit.rar », « BILLIONAIRE BOSS », « TikTok
  Updates », « Chat GPT », « Web Developers Group ».
- WhatsApp : « FORMATION À INSTITUT POLYTECHN… », « PÂTISSERIE : FORMATION GRATUITE », « YEMASEPH STORE (Marché
  Digital…) », « NEXT LEVEL AI AUTOMATION », « HUYAI TIDANANE / ZW SINGLES », « Vacancy Hub », « INFO D1& D2
  TOGOLAISE », « Kurapwa Kwechirwere Chose », « Zim Marriage Teachings », « Le marché des démarcheurs », « Tete
  Zimbabwe Natural home reme… », « PROVISIONALS ORAL LESSONS AND… » ; Chrome : `6a7a0396-…mp4` téléchargé.
- Enregistrement n° 2 : CapCut, Gmail (« Google : Vous avez partagé certaines don… »), TikTok (perfectionjose…,
  « Precious Golden NadKoko »), Facebook (« Vous connaissez peut-être Jean Agb… », Joseph Ahiankonou), YouTube
  « WORSHIP and PRAISE TIVI ».

**Barre d'état et écran d'accueil** (sur toute la durée) : heure (16 h 55 – 17 h 25 le 17 octobre ; 15 h 11 –
15 h 15 le 18 octobre), réseau LTE, batterie en charge, « Ne pas déranger » activé ; date et météo de l'écran
d'accueil (« Sam. 17 oct. 28 °C », « Dim. 18 oct. 31 °C ») ; liste des applications installées (B25Drama, Chariow,
Better Speak, AndFTP, Nicegram, Talkami…).

**Autres** : photo personnelle de Joseph (1 : 5:12 – 6:30, choisie pour la vidéo) ; remarque orale « j'ai quatre
comptes abonnement payant » (1 : 23:33) ; usage de trois comptes Google pour contourner les crédits de Google
Flow (1 : 11:42 et 15:18) — à ne pas présenter comme une méthode dans la formation.

---

## 7. Images de contrôle

Douze images envoyées à part (non versionnées) :

| N° | Vidéo | Temps | Ce qu'on voit |
|---|---|---|---|
| 01 | vidéo d'origine | 0:00,5 | plan 1 assis, sans texte |
| 02 | vidéo d'origine | 0:12 | plan 2 debout près de l'écran |
| 03 | vidéo d'origine | 0:26 | plan 4, appel à l'action sans bandeau |
| 04 | vidéo montée | 0:01,2 | sous-titre « Ce mercredi, je vous invite », calendrier, confettis |
| 05 | vidéo montée | 0:11,3 | « entièrement GRATUITE », étiquette « 0 FCFA » |
| 06 | vidéo montée | 0:16,5 | bandeau final avec le numéro |
| 07 | enregistrement n° 1 | 2:30 | ChatGPT : premier script généré |
| 08 | enregistrement n° 1 | 9:00 | Google Flow : image de départ importée, zone du prompt |
| 09 | enregistrement n° 1 | 11:06 | Google Flow : scène 1 générée |
| 10 | enregistrement n° 2 | 0:22 | ChatGPT : prompt de montage « MISSION » |
| 11 | enregistrement n° 2 | 1:40 | Claude : compte rendu de la v1 et prompt n° 2 |
| 12 | enregistrement n° 2 | 3:12 | la vidéo montée lue dans WhatsApp |
