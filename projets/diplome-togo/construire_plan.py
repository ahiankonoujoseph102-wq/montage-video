"""Plan de montage de « Ton diplôme suffira-t-il pour réussir au Togo ? » (partie 1), écrit à la main.

Usage : python3 projets/diplome-togo/construire_plan.py <dossier du lancement>
Écrit <dossier>/script.json (phrases dites, dans l'ordre de la voix off coupée) et <dossier>/plan.json (une scène par
phrase). Images « photo » : créées par l'IA d'après la clé « image » (réaliste, Togo, jamais de texte sur l'image).
"""
import json
import sys
from pathlib import Path

R = "Photorealistic cinematic vertical photo, Lomé, Togo, West Africa, natural warm light, shallow depth of field, " \
    "emotional, documentary style, no text, no letters, no logos. "

P = []  # (partie, texte, scène)


def ph(partie, dit, **scene):
    P.append((partie, dit, scene))


# --- Accroche
ph("p0", "Ton diplôme suffira-t-il pour réussir au Togo ?",
   type="photo", image=R + "A young Togolese graduate in a black graduation gown and cap, holding a rolled diploma, "
   "standing alone on a busy dusty street in Lomé, looking worried and uncertain into the distance, sunset.",
   texte="", mise="plein", expression="neutre")
# --- Partie 1 : à qui je parle
ph("p1", "Toi qui es actuellement à l'université,",
   type="photo", image=R + "A crowded university lecture hall in Lomé, young African students taking notes, seen from "
   "behind, one student in focus looking thoughtful.", texte="À L'UNIVERSITÉ", mise="plein")
ph("p1", "toi qui suis une filière universitaire,",
   type="photo", image=R + "A young Togolese woman student reading thick textbooks at night under a small lamp in a "
   "simple bedroom, tired but determined.", texte="", mise="partage")
ph("p1", "toi qui prépares une licence ou un master,",
   type="liste", titre="TON PARCOURS", items=[{"texte": "Licence", "a": "licence"}, {"texte": "Master", "a": "master,"}],
   geste="compte", doigts=2)
ph("p1", "ou encore toi qui suis une formation professionnelle,",
   type="photo", image=R + "A young Togolese man in a vocational training workshop, wearing safety glasses, learning "
   "with an instructor, focused face.", texte="FORMATION PRO", mise="plein")
ph("p1", "j'aimerais te poser une question.",
   type="carte", kicker="ÉCOUTE BIEN", texte="UNE\nQUESTION", emoji="1f442", geste="designe", expression="parle",
   mise="double")
ph("p1", "Est-ce que tu es vraiment sûr que le parcours que tu suis actuellement te permettra de devenir la personne "
   "que tu rêves de devenir ?",
   type="question", texte="ES-TU\nVRAIMENT SÛR ?", sous="de devenir qui tu rêves", emoji="1f914",
   geste="explique", expression="surpris")
ph("p1", "Est-ce que tu es certain que ton diplôme, ta licence, ton master ou ta formation professionnelle te "
   "permettront d'atteindre tes ambitions,",
   type="photo", image=R + "Close-up of the hands of a young African graduate holding a diploma with a red ribbon, "
   "blurred city lights behind, melancholic mood.", texte="TON DIPLÔME\nSUFFIRA-T-IL ?", mise="plein")
ph("p1", "de réaliser tes projets et de vivre la vie que tu souhaites ?",
   type="photo", image=R + "A young Togolese man sitting on the Lomé beach at dusk, looking at the ocean horizon, "
   "dreaming, silhouette against an orange sky.", texte="LA VIE QUE\nTU SOUHAITES", mise="partage")
ph("p1", "Réfléchis sérieusement à cette question.",
   type="carte", kicker="PAUSE", texte="RÉFLÉCHIS\nSÉRIEUSEMENT", emoji="1f9d0", geste="bras-croises",
   expression="neutre", mise="double")
# --- Partie 2 : la réalité
ph("p2", "Combien de personnes ont aujourd'hui une licence, un master ou même plusieurs formations professionnelles,",
   type="photo", image=R + "A long queue of young African graduates in formal clothes holding CV folders, waiting "
   "outside an office building in Lomé under the sun, tired faces.", texte="DIPLÔMÉS…", mise="plein")
ph("p2", "mais qui éprouvent énormément de difficultés à trouver un emploi et à joindre les deux bouts ?",
   type="photo", image=R + "A young Togolese man sitting on the edge of his bed in a small room, head in his hands, "
   "papers and job rejection letters on the floor, dim light.", texte="SANS EMPLOI", mise="partage")
ph("p2", "Certaines sont obligées de faire de petits travaux par-ci par-là,",
   type="photo", image=R + "A young African man selling phone credit cards at a busy Lomé street junction, motorbikes "
   "passing, hot day.", texte="PETITS TRAVAUX", mise="plein")
ph("p2", "parfois comme aide-maçon ou manœuvre, simplement pour survivre.",
   type="photo", image=R + "A young educated-looking Togolese man carrying cement blocks on his shoulder on a "
   "construction site, sweat, dust, serious sad expression.", texte="POUR SURVIVRE", mise="plein")
ph("p2", "D'autres finissent par trouver un emploi, mais avec un salaire de 60 000 ou 70 000 francs CFA par mois.",
   type="chiffre", texte="60 000 – 70 000", sous="FCFA PAR MOIS", kicker="LE SALAIRE", emoji="1f630",
   geste="explique", expression="grimace")
# --- Partie 3 : le calcul
ph("p3", "Maintenant, faisons un petit calcul.",
   type="carte", kicker="CALCULONS", texte="UN PETIT\nCALCUL", emoji="1f9e0", geste="designe", mise="double")
ph("p3", "Tu gagnes 60 000 francs CFA par mois. Tu paies 30 000 francs de loyer. Il te reste 30 000 francs.",
   type="calcul", titre="TON MOIS", depart=60000,
   calc=[{"texte": "Salaire", "montant": 60000, "a": "gagnes"}, {"texte": "Loyer", "montant": -30000, "a": "loyer."},
           {"texte": "Il reste", "montant": 0, "a": "reste", "total": True}], mise="plein")
ph("p3", "Et avec ces 30 000 francs, tu dois manger, te déplacer, t'habiller, gérer les imprévus et éventuellement "
   "prendre soin de ta famille.",
   type="calcul", titre="AVEC 30 000 F", depart=30000,
   calc=[{"texte": "Manger", "montant": -12000, "a": "manger,"},
           {"texte": "Transport", "montant": -7000, "a": "déplacer,"},
           {"texte": "Vêtements", "montant": -5000, "a": "t'habiller,"},
           {"texte": "Imprévus", "montant": -4000, "a": "imprévus"},
           {"texte": "Famille", "montant": -2000, "a": "famille."}], mise="plein")
ph("p3", "Imagine que tu aies une copine, que tu sois marié ou que tu aies des enfants.",
   type="photo", image=R + "A young Togolese father holding his small child in a modest home, worried look while "
   "counting a few banknotes on the table.", texte="ET TA FAMILLE ?", mise="plein")
ph("p3", "Comment vas-tu t'en sortir ?",
   type="question", texte="COMMENT\nT'EN SORTIR ?", emoji="1f630", geste="explique", expression="grimace", mise="double")
# --- Partie 4 : les rêves
ph("p4", "Quand est-ce que tu vas acheter ta moto ?",
   type="photo", eteint=True, image=R + "A shiny new motorcycle parked in a Lomé street, seen through a shop window, "
   "a young man looking at it from outside, longing.", texte="TA MOTO ?", mise="plein")
ph("p4", "Quand est-ce que tu vas acheter une voiture de 5, 6 ou 10 millions de francs CFA ?",
   type="photo", eteint=True, image=R + "A beautiful modern car in a car dealership in Lomé, a young African man "
   "standing far from it with empty pockets, dreaming.", texte="UNE VOITURE ?", sous="5 À 10 MILLIONS", mise="plein")
ph("p4", "Quand est-ce que tu vas construire ta maison ?",
   type="photo", eteint=True, image=R + "An unfinished family house in a Togo neighborhood, only walls and iron bars, "
   "construction stopped, grass growing, evening light.", texte="TA MAISON ?", mise="plein")
ph("p4", "Quand est-ce que tu vas réaliser les rêves que tu portes depuis ton enfance ?",
   type="photo", eteint=True, image=R + "A little Togolese boy in a school uniform looking up at the sky with a big "
   "smile, holding a paper airplane, dreamy golden light.", texte="TES RÊVES\nD'ENFANT ?", mise="plein")
ph("p4", "Pose-toi sincèrement ces questions.",
   type="carte", kicker="SINCÈREMENT", texte="POSE-TOI\nCES QUESTIONS", emoji="1f914", geste="bras-croises",
   expression="neutre", mise="double")
# --- Partie 5 : « mon cas sera différent »
ph("p5", "Ou alors, tu te dis que ton cas sera différent ?",
   type="question", texte="TON CAS SERA\nDIFFÉRENT ?", emoji="1f60e", geste="designe", expression="surpris")
ph("p5", "Tu te dis peut-être : « Moi, quand j'aurai ma licence, je vais faire un master.",
   type="chemin", titre="TON PLAN", etapes=[{"texte": "Licence", "a": "licence,"}, {"texte": "Master", "a": "master."}],
   mise="plein")
ph("p5", "Ensuite, je vais faire un stage, compléter mon parcours avec une formation professionnelle",
   type="chemin", titre="TON PLAN", etapes=[{"texte": "Licence", "a": ""}, {"texte": "Master", "a": ""},
                                           {"texte": "Stage", "a": "stage,"},
                                           {"texte": "Formation", "a": "formation"}], mise="plein")
ph("p5", "et, avec un peu de chance, je finirai par décrocher un bon emploi. »",
   type="chemin", titre="TON PLAN", etapes=[{"texte": "Licence", "a": ""}, {"texte": "Master", "a": ""},
                                           {"texte": "Stage", "a": ""}, {"texte": "Formation", "a": ""},
                                           {"texte": "Emploi ?", "a": "chance,", "doute": True}], mise="plein")
ph("p5", "Mais sur quoi repose réellement cette certitude ?",
   type="question", texte="SUR QUOI ?", sous="repose cette certitude", emoji="1f9d0", geste="explique",
   expression="surpris", mise="double")
ph("p5", "Est-ce que tes parents sont financièrement à l'aise ? Est-ce que ta famille dispose de relations "
   "influentes ? Est-ce que tu as déjà un réseau professionnel capable de t'ouvrir certaines portes ?",
   type="liste", titre="AS-TU…", items=[{"texte": "Des parents riches ?", "a": "parents", "ok": False},
                                         {"texte": "Des relations ?", "a": "relations", "ok": False},
                                         {"texte": "Un réseau ?", "a": "réseau", "ok": False}], mise="plein")
ph("p5", "Si tu n'as aucun de ces avantages, tu dois comprendre une chose :",
   type="alerte", texte="COMPRENDS\nUNE CHOSE", emoji="26a0_fe0f", geste="bras-croises", expression="neutre")
ph("p5", "tu ne peux pas te permettre de construire ton avenir uniquement sur l'espoir de décrocher un emploi après "
   "tes études.",
   type="photo", image=R + "A young Togolese graduate standing in front of a closed office door with a sign-less "
   "door, holding his CV folder, waiting alone in an empty corridor.", texte="PAS SUR\nL'ESPOIR SEUL", mise="plein")
# --- Partie 6 : sincérité
ph("p6", "Je te parle sincèrement. Je n'ai aucun intérêt à te mentir.",
   type="carte", kicker="SINCÈREMENT", texte="AUCUN INTÉRÊT\nÀ TE MENTIR", emoji="1f44b", geste="explique",
   expression="neutre", mise="double")
ph("p6", "Ce qui me fait particulièrement mal, c'est de constater que pendant que certaines personnes construisent "
   "leur richesse au Togo,",
   type="photo", image=R + "A confident young Togolese entrepreneur in a modern office in Lomé, smiling, working on "
   "a laptop with a view of the city, success.", texte="CERTAINS\nCONSTRUISENT", mise="plein")
ph("p6", "d'autres s'enfoncent progressivement dans les difficultés financières.",
   type="photo", eteint=True, image=R + "A young Togolese man in a dark small room counting a few coins in his "
   "palm, worried face, rain on the window.", texte="D'AUTRES\nS'ENFONCENT", mise="plein")
ph("p6", "Et le plus inquiétant, c'est que ceux qui parviennent à véritablement sortir du lot restent minoritaires.",
   type="chiffre", texte="UNE MINORITÉ", sous="sort du lot", kicker="LE PLUS INQUIÉTANT", emoji="1f6a8",
   geste="designe", expression="grimace")
ph("p6", "Mais pourquoi ?",
   type="question", texte="POURQUOI ?", emoji="2753", geste="explique", expression="surpris", mise="double")
# --- Partie 7 : le système
ph("p7", "Parce que beaucoup de jeunes continuent de suivre aveuglément un parcours que le système leur a présenté "
   "comme étant la seule voie vers la réussite.",
   type="photo", image=R + "Many young Africans in identical white shirts walking in a straight line on a single "
   "narrow road towards a distant city, seen from above, symbolic.", texte="UNE SEULE\nVOIE ?", mise="plein")
ph("p7", "Faire des études, obtenir un diplôme, chercher un stage,",
   type="chemin", titre="LE SYSTÈME", etapes=[{"texte": "Études", "a": "études,"}, {"texte": "Diplôme", "a": "diplôme,"},
                                             {"texte": "Stage", "a": "stage,"}], mise="plein")
ph("p7", "déposer des dossiers, attendre un recrutement et espérer décrocher un salaire qui permettra de vivre "
   "correctement.",
   type="chemin", titre="LE SYSTÈME", etapes=[{"texte": "Dossiers", "a": "dossiers,"},
                                             {"texte": "Attente", "a": "attendre"},
                                             {"texte": "Salaire ?", "a": "espérer", "doute": True}], mise="plein")
# --- Partie 8 : attention
ph("p8", "Attention ! Je ne suis pas contre les études. Je ne suis pas contre les diplômes. Je ne suis pas non plus "
   "contre les formations professionnelles.",
   type="liste", titre="ATTENTION !", items=[{"texte": "Les études", "a": "études."},
                                             {"texte": "Les diplômes", "a": "diplômes."},
                                             {"texte": "Les formations", "a": "formations"}], mise="plein")
ph("p8", "Au contraire, les connaissances et les compétences sont indispensables.",
   type="carte", kicker="AU CONTRAIRE", texte="COMPÉTENCES\nINDISPENSABLES", emoji="1f4a1", geste="pouce",
   expression="sourire", mise="double")
ph("p8", "Mais le problème, c'est de croire que le diplôme, à lui seul, garantit ton avenir financier.",
   type="deux", gauche={"texte": "Diplôme\nseul", "ok": False}, droite={"texte": "Diplôme +\ncompétences", "ok": True},
   a=["seul,", "financier."], geste="explique", expression="parle")
# --- Partie 9 : le monde change
ph("p9", "Nous sommes en 2026, et 2027 approche à grands pas.",
   type="annee", de=2026, vers=2027, emoji="1f525", mise="plein")
ph("p9", "Le monde du travail évolue. Les entreprises changent leurs méthodes de recrutement.",
   type="photo", image=R + "A young African woman doing a job interview by video call on a laptop in a modern "
   "office in Lomé, recruiter on screen.", texte="LE MONDE\nCHANGE", mise="plein")
ph("p9", "Les nouvelles technologies transforment les métiers.",
   type="photo", image=R + "A young Togolese technician working with a robotic arm and a tablet in a modern "
   "workshop, futuristic blue light.", texte="LES MÉTIERS\nSE TRANSFORMENT", mise="plein")
ph("p9", "Le coût de la vie augmente et le pouvoir d'achat reste une véritable préoccupation pour de nombreuses "
   "familles.",
   type="photo", image=R + "A Togolese mother at a busy Lomé market looking worried at expensive food prices, "
   "holding a nearly empty basket.", texte="LA VIE COÛTE\nPLUS CHER", mise="plein")
ph("p9", "Les réalités d'aujourd'hui ne sont plus celles d'hier.",
   type="deux", gauche={"texte": "Hier", "ok": False}, droite={"texte": "Aujourd'hui", "ok": True},
   a=["d'aujourd'hui", "d'hier."], geste="explique")
ph("p9", "Tu ne peux donc pas continuer à préparer ton avenir avec une mentalité qui ne tient pas compte des "
   "nouvelles réalités économiques.",
   type="alerte", texte="CHANGE DE\nMENTALITÉ", emoji="26a0_fe0f", geste="bras-croises", expression="neutre")
# --- Partie 10 : réfléchir autrement
ph("p10", "Si tu es vraiment ambitieux, si tu as des rêves et si tu veux véritablement changer ta situation "
    "financière, tu dois commencer à réfléchir autrement.",
   type="photo", image=R + "A determined young Togolese woman looking straight ahead with confidence, sunrise "
   "light on her face, city of Lomé waking up behind her, hopeful.", texte="RÉFLÉCHIS\nAUTREMENT", mise="plein")
ph("p10", "Tu dois avoir une vision claire de ce que tu veux devenir.",
   type="liste", titre="CE QU'IL TE FAUT", items=[{"texte": "Une vision claire", "a": "vision"}], mise="plein")
ph("p10", "Tu dois développer des compétences qui ont une réelle valeur sur le marché.",
   type="liste", titre="CE QU'IL TE FAUT", items=[{"texte": "Une vision claire", "a": ""},
                                                 {"texte": "Des compétences", "a": "compétences"}], mise="plein")
ph("p10", "Tu dois apprendre à créer des opportunités, à résoudre des problèmes et à générer des revenus.",
   type="liste", titre="CE QU'IL TE FAUT", items=[{"texte": "Une vision claire", "a": ""},
                                                 {"texte": "Des compétences", "a": ""},
                                                 {"texte": "Des opportunités", "a": "opportunités,"},
                                                 {"texte": "Des solutions", "a": "problèmes"},
                                                 {"texte": "Des revenus", "a": "revenus."}], mise="plein")
ph("p10", "Et surtout, tu dois commencer dès maintenant.",
   type="alerte", texte="COMMENCE\nMAINTENANT", emoji="1f680", geste="designe", expression="parle")
ph("p10", "Parce que si tu passes toutes ces années à étudier sans construire quelque chose à côté, sans développer "
    "une compétence recherchée,",
   type="photo", image=R + "A young Togolese student learning to build a website on a laptop at night after class, "
   "focused, notebook next to him, small room.", texte="CONSTRUIS\nÀ CÔTÉ", mise="plein")
ph("p10", "sans apprendre à vendre tes services et sans préparer ton indépendance financière,",
   type="photo", image=R + "A young Togolese freelancer shaking hands with a small business owner in a shop in "
   "Lomé, closing a deal, both smiling.", texte="VENDS TES\nSERVICES", mise="partage")
ph("p10", "tu risques de terminer tes études avec un diplôme, mais sans véritable stratégie pour construire la vie "
    "que tu souhaites.",
   type="photo", eteint=True, image=R + "A young Togolese graduate in gown sitting alone on stairs after the "
   "ceremony, diploma on his knees, empty courtyard, contemplative.", texte="UN DIPLÔME\nSANS STRATÉGIE", mise="plein")
# --- Partie 11 : émotion
ph("p11", "Mon frère, ma sœur, je ne te dis pas tout cela pour te décourager.",
   type="carte", kicker="MON FRÈRE, MA SŒUR", texte="PAS POUR TE\nDÉCOURAGER", emoji="1f64c", geste="explique",
   expression="sourire", mise="double")
ph("p11", "Je te le dis parce que ton avenir mérite mieux que des promesses et des espérances.",
   type="photo", image=R + "A young Togolese man and woman smiling with hope, looking at the sunrise over Lomé "
   "from a rooftop, warm golden light, inspiring.", texte="TON AVENIR\nMÉRITE MIEUX", mise="plein")
# --- Partie 12 : la promesse de la partie 2
ph("p12", "Mais alors, qu'est-ce qu'un jeune Togolais doit réellement faire aujourd'hui pour réussir financièrement ?",
   type="question", texte="QUE FAIRE ?", sous="pour réussir au Togo", emoji="1f914", geste="explique",
   expression="surpris")
ph("p12", "Quelles compétences doit-il apprendre ? Quels business peut-il lancer ?",
   type="cadenas", cartes=[{"texte": "Compétences ?", "a": "compétences"}, {"texte": "Business ?", "a": "business"}],
   mise="plein")
ph("p12", "Comment peut-il utiliser les nouvelles technologies, notamment l'intelligence artificielle, pour créer des "
    "opportunités et devenir financièrement indépendant ?",
   type="cadenas", cartes=[{"texte": "Compétences ?", "a": ""}, {"texte": "Business ?", "a": ""},
                           {"texte": "L'IA ?", "a": "intelligence"}], mise="plein")
ph("p12", "C'est exactement ce que je vais te dévoiler dans la deuxième partie de cette vidéo.",
   type="partie2", texte="PARTIE 2", sous="Bientôt", emoji="1f525", mise="plein")
ph("p12", "Je vais te parler des véritables opportunités, des compétences à développer et surtout des stratégies que "
    "tu peux commencer à appliquer, même si tu pars de zéro.",
   type="liste", titre="DANS LA PARTIE 2", items=[{"texte": "Les opportunités", "a": "opportunités,"},
                                                 {"texte": "Les compétences", "a": "compétences"},
                                                 {"texte": "Les stratégies", "a": "stratégies"}], mise="plein")
ph("p12", "Je ne suis pas là pour te vendre du rêve. Je veux te montrer des pistes concrètes pour que tu puisses "
    "prendre ton avenir en main.",
   type="deux", gauche={"texte": "Du rêve", "ok": False}, droite={"texte": "Du concret", "ok": True},
   a=["rêve.", "concrètes"], geste="explique", expression="parle")
ph("p12", "Alors, si tu n'as pas encore de projet de voyage à l'étranger et que tu souhaites construire quelque chose "
    "ici, au Togo,",
   type="photo", image=R + "Aerial view of Lomé, Togo at golden hour, the coastline, the city with buildings and "
   "palm trees, beautiful and hopeful.", texte="ICI, AU TOGO", mise="plein")
ph("p12", "cette deuxième partie est particulièrement importante pour toi.",
   type="carte", kicker="POUR TOI", texte="TRÈS\nIMPORTANT", emoji="1f3af", geste="designe", expression="parle",
   mise="double")
# --- Partie 13 : appel à l'action
ph("p13", "Abonne-toi à mon compte TikTok et écris « PARTIE 2 » dans les commentaires.",
   type="commentaire", texte="PARTIE 2", emoji="1f449", mise="plein")
ph("p13", "Je veux voir combien de jeunes sont réellement prêts à ouvrir les yeux, à changer de stratégie et à "
    "prendre leur avenir au sérieux.",
   type="liste", titre="ES-TU PRÊT ?", items=[{"texte": "Ouvrir les yeux", "a": "yeux,"},
                                             {"texte": "Changer de stratégie", "a": "stratégie"},
                                             {"texte": "Agir sérieusement", "a": "sérieux."}], mise="plein")
ph("p13", "Rendez-vous dans la deuxième partie.",
   type="partie2", texte="RENDEZ-VOUS", sous="Partie 2", emoji="1f44b", mise="double")

dossier = Path(sys.argv[1])
dossier.mkdir(parents=True, exist_ok=True)
script = {
    "accroche": {"lignes": ["TON DIPLÔME", "SUFFIRA-T-IL", "AU TOGO ?"], "cle": "DIPLÔME"},
    "titre": "Ton diplôme suffira-t-il pour réussir au Togo ? (Partie 1)",
    "description": "Licence, master, formation… Est-ce vraiment assez pour vivre la vie dont tu rêves ? Fais le calcul "
                   "avec moi 🧮 et prépare-toi pour la partie 2 : compétences, business et IA pour réussir ici, au "
                   "Togo 🇹🇬. Abonne-toi et écris « PARTIE 2 » en commentaire 👇",
    "hashtags": "#Togo #Lomé #Diplôme #Emploi #JeunesseTogolaise #Motivation #IA #LoméIASchool #Partie1",
    "phrases": [{"partie": p, "texte": t} for p, t, _ in P],
}
fonds = ["nuit", "bleu", "violet", "nuit", "orange", "bleu", "violet", "nuit"]
for *_, sc in P:  # mots-clés de secours pour les banques d'images (si l'image IA échoue)
    if sc["type"] == "photo":
        sc.setdefault("recherche", " ".join(sc["image"][len(R):].split()[:7]).strip(",."))
plan = {"scenes": [s for *_, s in P], "fond": [fonds[i % len(fonds)] for i in range(len(P))]}
(dossier / "script.json").write_text(json.dumps(script, ensure_ascii=False, indent=1))
(dossier / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=1))
print(f"{len(P)} phrases ; {sum(s['type'] == 'photo' for s in plan['scenes'])} images IA")
