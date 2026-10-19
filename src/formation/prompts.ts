// Texte exact des prompts de la partie 1 (projets/formation-montage-partie1/script_voix_off.txt).
// Une entrée de `lignes` = une ligne du script ; '' = ligne vide (espace, jamais surlignée).
export type Prompt = {id: string; etiquette: string; titre: string; lignes: string[]; taille: number};

export const PROMPTS: Prompt[] = [
  {id: 'Prompt1', etiquette: 'PROMPT 1', titre: 'Écrire le script', taille: 40, lignes: [
    'Tu es un expert en publicité vidéo pour TikTok, Facebook et les statuts WhatsApp.',
    "Écris le script d'une vidéo publicitaire de 30 secondes maximum, en français simple, pour : [ce que j'annonce ou ce que je vends].",
    'Public visé : [à qui je m\'adresse].',
    'Informations obligatoires : [date, lieu ou lien, prix, numéro WhatsApp].',
    'Ton : [dynamique / chaleureux / professionnel].',
    "Structure : une accroche forte dans les 3 premières secondes, le bénéfice principal, les informations utiles, puis un appel à l'action clair.",
    'Propose-moi 3 versions différentes et indique la durée estimée de chacune.',
  ]},
  {id: 'Prompt2', etiquette: 'PROMPT 2', titre: 'Découper en scènes', taille: 42, lignes: [
    'Je choisis la version [numéro]. Je vais créer la vidéo avec Google Flow, qui génère des clips de 8 secondes.',
    'Découpe le script en 4 scènes de 8 secondes exactement.',
    "Pour chaque scène, donne : la phrase exacte prononcée (15 mots maximum, pour qu'elle tienne en 8 secondes), le décor, la position du personnage, ses gestes et le cadrage.",
    'Garde le même personnage, la même tenue et le même décor dans les 4 scènes.',
  ]},
  {id: 'Prompt3', etiquette: 'PROMPT 3', titre: "Créer l'image du personnage", taille: 42, lignes: [
    "Crée l'image d'un personnage fictif, généré par IA, qui présentera ma vidéo publicitaire.",
    'Description : [homme ou femme], environ [âge] ans, [tenue, par exemple : costume bleu marine et chemise blanche], [coiffure].',
    'Décor : [par exemple : bureau moderne et lumineux, avec un ordinateur portable].',
    'Format vertical 9:16, style photo réaliste, lumière naturelle, il regarde la caméra avec un léger sourire.',
    'Ce personnage ne doit ressembler à aucune personne réelle.',
  ]},
  {id: 'Prompt4', etiquette: 'PROMPT 4', titre: 'Prompts Google Flow', taille: 42, lignes: [
    'Écris maintenant, pour chacune des 4 scènes, un prompt en anglais prêt à coller dans Google Flow.',
    'Chaque prompt doit :',
    '- décrire précisément le même personnage fictif (visage, coiffure, tenue) pour garder la continuité ;',
    '- préciser « vertical 9:16, exactly 8 seconds, one continuous shot » ;',
    '- donner la réplique exacte en français entre guillemets, avec « accurate French lip synchronization » ;',
    '- terminer par « No subtitles, no text overlays, no music ».',
    'Numérote les prompts de 1 à 4.',
  ]},
  {id: 'Prompt5', etiquette: 'PROMPT 5', titre: 'Le montage complet (clips créés avec l\'IA)', taille: 31, lignes: [
    "Tu es un monteur vidéo professionnel. Je t'envoie [4] clips vidéo, dans l'ordre : clip 1, clip 2, clip 3, clip 4.",
    'Assemble-les en une seule vidéo publicitaire et renvoie-moi le fichier MP4 final, téléchargeable. Utilise ton environnement de code (par exemple ffmpeg).',
    '',
    'Texte prononcé dans la vidéo (pour les sous-titres) :',
    '[colle ici le script final]',
    '',
    '1. Format vertical 1080×1920, MP4 (H.264 et AAC), moins de 20 Mo.',
    '2. Coupe les silences de plus de 0,3 seconde et les répétitions, sans couper de mot.',
    "3. Titre d'accroche en gros pendant les 2 premières secondes : « [mon titre] ».",
    '4. Sous-titres en français, gros, blancs avec contour noir, mots clés en jaune : [mots importants]. Ils ne doivent jamais cacher le visage.',
    '5. Illustrations : petites animations bien visibles sur téléphone (icônes, étiquettes) quand on parle de [thèmes].',
    '6. Musique douce et énergique, toujours plus faible que la voix.',
    '7. À la fin, pendant 4 secondes, affiche : [informations finales], avec le numéro WhatsApp [numéro] en très grand.',
    "8. Avant de m'envoyer la vidéo, vérifie : aucun mot coupé, aucune répétition, orthographe correcte, numéro exact.",
    "Ne dis jamais que la vidéo est prête si le fichier n'a pas réellement été créé.",
  ]},
  {id: 'Complement', etiquette: 'COMPLÉMENT', titre: "Vidéo d'inspiration", taille: 44, lignes: [
    "Je t'envoie aussi [3] captures d'écran d'une vidéo dont j'aime le style.",
    'Inspire-toi de : [la taille et la couleur des sous-titres / les animations / le rythme / la carte de fin].',
    'Ne copie ni le texte, ni le logo, ni les images de cette vidéo.',
  ]},
  {id: 'Prompt6', etiquette: 'PROMPT 6', titre: 'Monter une vidéo filmée', taille: 34, lignes: [
    "Tu es un monteur vidéo professionnel. Je t'envoie une vidéo que j'ai filmée moi-même, face à la caméra.",
    "Fais-en un montage dynamique et renvoie-moi le fichier MP4 final, téléchargeable.",
    'Voici ce que je dis dans la vidéo : [colle ton texte, ou écris « transcris-le toi-même si tu peux »].',
    '1. Format vertical 1080×1920, moins de 20 Mo.',
    '2. Coupe les silences, les « euh », les hésitations et les phrases répétées, sans couper de mot utile.',
    '3. Ajoute un léger zoom à chaque coupe pour rendre le rythme dynamique.',
    "4. Titre d'accroche pendant 2 secondes : « [mon titre] ».",
    '5. Sous-titres gros, blancs avec contour noir, mots clés en jaune.',
    '6. Musique douce, plus faible que ma voix.',
    '7. Carte de fin de 4 secondes avec : [nom, offre, numéro WhatsApp].',
    "8. Vérifie tout avant de m'envoyer la vidéo.",
  ]},
  {id: 'Prompt7', etiquette: 'PROMPT 7', titre: 'Corriger un détail', taille: 48, lignes: [
    'À [20] secondes, [décris le problème : il y a une répétition / le sous-titre est faux / le numéro est trop petit].',
    "Corrige uniquement ce point, garde tout le reste à l'identique, et renvoie-moi la vidéo.",
  ]},
  {id: 'Prompt8', etiquette: 'PROMPT 8', titre: 'Version légère', taille: 54, lignes: [
    'Le fichier est trop lourd pour ma connexion. Fais-moi une version de moins de 10 Mo, sans changer le montage.',
  ]},
];

// Prompt Google Flow réel de la scène 1 (enregistrement n° 1, 7:44 – 8:08), mots clés surlignés un à un.
export const PROMPT_FLOW_SCENE1 = [
  'Create an ultra-realistic cinematic video, [[vertical 9:16]], [[exactly 8 seconds long]], featuring a fictional AI-generated African male business coach character in his late twenties. He has dark brown skin, short neatly shaped black hair with a clean fade, a clean-shaven face, an athletic-average build, and wears an elegant dark navy blue suit with a white dress shirt. He is a fictional digital character, not a real person.',
  'The character sits confidently behind a desk in a stylish modern office. A laptop displaying a professional website is on the desk. He looks directly at the camera with a friendly, confident expression and speaks naturally in French.',
  '[[Exact dialogue]]:\n"Bonne nouvelle ! Ce mercredi, je vous invite à une formation gratuite !"',
  'Accurate French [[lip synchronization]], natural facial expressions, subtle hand gestures, realistic skin texture, professional daylight, smooth camera, medium shot. One continuous take. [[No subtitles]], no text overlays, no music. Preserve the same character design for future scenes.',
];
