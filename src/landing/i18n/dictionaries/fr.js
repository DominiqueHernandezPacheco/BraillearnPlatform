export default {
    meta: {
        titles: {
            home: 'Braillearn — Apprenez le braille à votre rythme',
            historia: 'Notre histoire — Braillearn',
            tecnologia: 'Technologie — Braillearn',
            comunidad: 'Communauté — Braillearn',
        },
        descriptions: {
            home: 'Braillearn : un afficheur braille modulaire à points agrandis et une plateforme d’apprentissage pour les personnes à sensibilité tactile réduite.',
            historia: 'Pourquoi Braillearn existe : la barrière physiologique et économique du braille standard, et l’équipe qui le construit.',
            tecnologia: 'L’ingénierie derrière Braillearn : solénoïdes, ESP8266, verrouillage passif, coût et logiciel.',
            comunidad: 'Institutions et ressources de soutien pour les personnes en situation de handicap visuel et leurs familles à Campeche.',
        },
    },

    common: {
        skipToContent: 'Aller au contenu',
        tryPlatform: 'Essayer la plateforme',
        placeholderPrefix: 'Emplacement réservé',
        mainNav: 'Principale',
        footerNav: 'Pied de page',
        openMenu: 'Ouvrir le menu',
        closeMenu: 'Fermer le menu',
        previous: 'Précédent',
        next: 'Suivant',
    },

    nav: { producto: 'Produit', tecnologia: 'Technologie', historia: 'Notre histoire', comunidad: 'Communauté', contacto: 'Contact' },

    a11y: {
        label: 'Options d’accessibilité',
        textSize: 'Taille du texte',
        sizes: { md: 'Normale', lg: 'Grande', xl: 'Très grande' },
        reduceMotion: 'Réduire les animations',
    },

    language: { label: 'Langue' },

    voice: {
        utterances: ['Page suivante', 'Tourner la page'],
        result: 'Page suivante',
        intent: 'même intention : naviguer → suivant',
    },

    hero: {
        tagline: 'Apprenez le braille à votre rythme, avec les mains, la voix et l’écran.',
        seeProduct: 'Découvrir le produit',
        words: ['salut', 'mains', 'livre', 'doigt'],
    },

    statement: {
        aria: 'Qu’est-ce que Braillearn',
        text: 'Braillearn est un afficheur braille à gros points et une plateforme qui vous apprend à lire avec les mains. En français, à votre rythme et sans connaissances techniques.',
    },

    display: {
        eyebrow: 'L’afficheur',
        title: 'Des points de 8 mm. Faits pour être ressentis.',
        lead: 'Chaque point mesure plus de cinq fois celui du braille standard, pour que n’importe quel bout de doigt puisse le distinguer.',
        highlights: [
            { value: '8 mm', label: 'Des points agrandis, bien au-dessus du seuil tactile de 5 mm.' },
            { value: '72 × 48 mm', label: 'Chaque cellule de six points. Elles se connectent sans outils.' },
            { value: '3 493 MXN', label: 'Le système minimal : la base et une cellule. Il s’agrandit quand vous en avez besoin.' },
        ],
    },

    platform: {
        eyebrow: 'La plateforme',
        title: 'Apprenez à votre rythme.',
        lead: 'Des leçons en français qui s’adaptent à vous, sans manuels ni formation préalable.',
        previewTitle: 'Aperçu de la plateforme d’apprentissage',
        previewNote: 'Voici la vraie page d’accueil de la plateforme. La version complète comprend des cours, un simulateur et plus encore.',
        features: [
            {
                title: 'De l’alphabet aux mots',
                text: 'Un parcours qui avance avec vous : vous reconnaissez d’abord chaque lettre, puis vous lisez et composez des mots.',
            },
            {
                title: 'Sur l’afficheur et à l’écran',
                text: 'Chaque caractère apparaît en même temps sur les points et à l’écran, pour que la personne qui vous accompagne puisse suivre.',
            },
            {
                title: 'Des sons qui célèbrent',
                text: 'Des retours sonores et de petites réussites qui donnent envie de recommencer.',
            },
        ],
    },

    bento: {
        aria: 'Voix et accessibilité',
        voice: {
            eyebrow: 'Voix',
            title: 'Parlez-lui. Il comprend.',
            text: 'Naviguez à la voix en français. Peu importe comment vous le dites : Braillearn comprend ce que vous voulez faire.',
        },
        access: {
            eyebrow: 'Accessibilité',
            title: 'Pensée pour tout le monde.',
            text: 'Compatible avec les lecteurs d’écran, avec un panneau pour adapter la plateforme à vos besoins.',
            readersLabel: 'Lecteurs d’écran compatibles',
            settings: ['Vitesse de la voix', 'Contraste visuel', 'Taille du texte', 'Réponse tactile de l’afficheur'],
        },
    },

    modular: {
        eyebrow: 'Modulaire',
        title: 'Commencez avec une cellule. Allez jusqu’à vingt.',
        lead: 'Une famille, une école ou une clinique peut commencer petit et ajouter des cellules quand elle en a besoin.',
        cellsLabel: 'Nombre de cellules',
        readout: (cells, dots) => `${cells} ${cells === 1 ? 'cellule' : 'cellules'} · ${dots} points`,
        minimum: { label: 'Système minimal', detail: 'Base + 1 cellule' },
        complete: { label: 'Système complet', detail: 'Base + 20 cellules · 120 points' },
        techLink: 'Découvrir la technologie',
    },

    contact: {
        title: 'Vous voulez apporter Braillearn dans votre école, votre clinique ou votre famille ?',
        text: 'Essayez la plateforme dès aujourd’hui et dites-nous ce dont vous avez besoin : nous construisons le système cellule par cellule.',
        mail: 'Écrivez-nous',
    },

    footer: { note: 'Prototype en phase de validation.' },

    problem: {
        eyebrow: 'La barrière',
        title: 'Un standard pensé pour des doigts qui ne sentent plus.',
        lead: 'Apprendre le braille ne devrait dépendre ni de l’argent ni de la sensibilité de vos doigts. Aujourd’hui, cela dépend des deux.',
        stat: {
            text: 'des Mexicains atteints de diabète développent une neuropathie périphérique.',
            before: 'La neuropathie élève le seuil de discrimination tactile au-dessus de',
            threshold: '5 mm',
            after: '. Pour ces personnes, lire du braille de 1,5 mm revient à lire avec des gants.',
            source: 'Source',
            percentSpoken: ' pour cent',
        },
        photo: {
            label: 'Photo d’utilisateur ou comparatif',
            hint: 'Une cellule standard de 1,5 mm à côté d’une cellule Braillearn de 8 mm',
        },
        context: [
            { value: '18,3 %', label: 'des adultes mexicains vivent avec un diabète sucré', source: 'ENSANUT 2022' },
            {
                value: '26,9 %',
                label: 'des personnes ayant un handicap visuel au Mexique ont entre 0 et 14 ans',
                source: 'INEGI, 2020',
            },
            {
                value: 'USD 899–5 495',
                label: 'c’est ce que coûtent les afficheurs braille dynamiques du commerce',
                source: 'Orbit Research, Humanware et Freedom Scientific, 2024–2025',
            },
        ],
        scale: {
            title: 'La solution commence par la taille du point.',
            lead: 'Les trois cercles sont dessinés à l’échelle réelle les uns par rapport aux autres : 1 mm a la même longueur dans les trois.',
            items: [
                {
                    display: '1,5 mm',
                    title: 'Braille standard',
                    note: 'Norme BANA / ONCE, pensée pour une sensibilité tactile normale.',
                    verdict: 'Illisible avec une neuropathie',
                },
                {
                    display: '> 5 mm',
                    title: 'Seuil de discrimination',
                    note: 'Au-delà de cette distance, la lecture fluide du braille standard devient impossible (Nakada & Dellon, 1989).',
                    verdict: 'Seuil avec neuropathie',
                },
                {
                    display: '8 mm',
                    title: 'Braillearn',
                    note: 'Des points agrandis qui dépassent le seuil et que les enfants en pré-alphabétisation peuvent distinguer.',
                    verdict: 'Au-dessus du seuil',
                },
            ],
        },
        bridge: {
            eyebrow: 'Notre réponse',
            title: 'Des cellules macro de 72 × 48 mm avec des points de 8 mm.',
            text: 'Chaque cellule fonctionne bien au-dessus du seuil de 5 mm et elle est assez grande pour que les doigts d’un enfant la distinguent. C’est le pont entre une barrière physiologique et une solution matérielle que toute famille, école ou clinique peut assembler cellule par cellule.',
        },
        cell: {
            aria: 'Cellule braille interactive à 6 points',
            dot: (n, raised) => `Point ${n}, ${raised ? 'levé' : 'abaissé'}`,
            caption:
                'Touchez les points. Sur l’afficheur réel, une impulsion de 50 ms soulève chaque point et le mécanisme le maintient en place.',
        },
    },

    team: {
        eyebrow: 'Équipe',
        title: 'De l’ingénierie avec un but précis.',
        lead: (faculty, university, advisor) =>
            `Étudiants de la ${faculty} de la ${university}, sous la direction de ${advisor}.`,
        photoAlt: 'Les trois membres de l’équipe Braillearn posent ensemble, de nuit, dans une rue piétonne.',
        hint: 'Survolez ou touchez chaque membre pour voir son nom et son domaine.',
        together: 'Chacun a sa spécialité, mais nous avons construit tout le projet ensemble.',
        members: [
            {
                role: 'Ingénierie en systèmes informatiques',
            },
            {
                role: 'Ingénierie en technologies logicielles',
            },
            {
                role: 'Ingénierie en mécatronique',
            },
        ],
    },

    architecture: {
        eyebrow: 'Architecture',
        title: 'Un matériel modulaire, conçu pour coûter peu et consommer moins.',
        lead: 'Chaque choix de conception répond à une contrainte réelle : des points que l’on sent, des cellules que l’on peut acheter une à une et une électronique qu’un atelier peut réparer.',
        chainTitle: 'Chaîne du signal',
        chain: [
            { tag: 'MCU', name: 'ESP8266 NodeMCU', note: 'Reçoit en HTTP le texte déjà traduit en points.' },
            { tag: 'REGISTRES', name: '74HC595 en daisy-chain', note: 'Étendent les broches pour piloter des centaines de points.' },
            { tag: 'PUISSANCE', name: 'MOSFET IRLZ44N', note: 'Avec un 2N2222A et une diode de roue libre 1N5408, en logique inverse.' },
            { tag: 'ACTIONNEUR', name: 'Solénoïde Ø 8 mm', note: 'Impulsion de 50 ms et verrouillage passif.' },
        ],
        specs: [
            {
                tag: 'ACTIONNEMENT',
                title: 'Solénoïdes électromagnétiques',
                metric: 'Ø 8 mm',
                text: 'Bobinés à la main en cuivre émaillé de 24 AWG sur un noyau imprimé en PETG. Faible coût unitaire et force suffisante avec des impulsions courtes.',
            },
            {
                tag: 'COMMANDE',
                title: 'ESP8266 et registres à décalage',
                metric: 'HTTP · Wi-Fi',
                text: 'Un seul microcontrôleur pilote toute la chaîne de cellules. Le firmware adapte le balayage au nombre de cellules connectées.',
            },
            {
                tag: 'ÉNERGIE',
                title: 'Verrouillage passif',
                metric: '50 ms',
                text: 'Une impulsion soulève le point et le mécanisme de stylo rétractable le maintient levé sans consommation continue.',
            },
            {
                tag: 'COÛT',
                title: 'Fabrication optimisée',
                metric: '6 315 MXN',
                text: 'Système complet de 20 cellules et 120 points : 24,1 % de l’afficheur du commerce le moins cher.',
            },
        ],
        cost: {
            eyebrow: 'Coût d’accès · MXN',
            title: 'Le système complet coûte 24,1 % de l’afficheur du commerce le moins cher.',
            rows: [
                { label: 'Braillearn · système minimal', detail: 'BASE + 1 cellule' },
                { label: 'Braillearn · système complet', detail: 'BASE + 20 cellules' },
                { label: 'Orbit Reader 40', detail: 'l’afficheur du commerce le moins cher' },
                { label: 'Médiane du commerce', detail: '15 appareils' },
                { label: 'Afficheur du commerce le plus cher', detail: 'parmi les 15 comparés' },
            ],
            note: 'Braillearn : coût de fabrication en gros (LCSC et Alibaba, mai 2026). Commerce : prix catalogue 2024–2025 de 15 appareils.',
        },
        modular: {
            eyebrow: 'Modèle modulaire',
            text: 'On achète une BASE une seule fois et on ajoute des cellules quand le budget le permet.',
            base: { label: 'BASE', note: 'Toute l’électronique de commande et la structure. Paiement unique.' },
            cell: { label: 'CELLULE', note: 'Module mécanique de 6 points. À ajouter quand on en a besoin.' },
        },
    },

    software: {
        eyebrow: 'Logiciel',
        title: 'Une plateforme qui comprend ce que vous voulez dire.',
        lead: 'L’afficheur n’est que la moitié. L’autre moitié est un écosystème web qui enseigne en français, dialogue avec le matériel en temps réel et n’exige jamais d’apprendre des commandes.',
        web: {
            label: 'Écosystème web',
            title: 'Du navigateur au solénoïde',
            text: 'Chaque caractère s’affiche en même temps sur l’afficheur physique et à l’écran, afin qu’un tuteur voyant puisse accompagner. Une API maison traduit le texte en points et l’envoie en HTTP à l’ESP8266.',
            techLabel: 'Technologies',
        },
        nlu: {
            label: 'Module NLU',
            title: 'Des intentions, pas des commandes',
            text: 'La classification par similarité cosinus ne dépend pas des mots exacts, mais de la direction du vecteur sémantique.',
            illustrative: 'Exemple illustratif',
            score: '50/50',
            scoreText: 'intentions correctement classées (100 %) lors du test contrôlé.',
        },
        access: {
            label: 'Accessibilité',
            title: 'Une exigence centrale, pas un bonus',
            text: 'Étiquetage sémantique ARIA complet, compatible avec les lecteurs d’écran, et navigation vocale en français avec des commandes comme « suivant », « répéter » et « sélectionner ».',
            readersLabel: 'Lecteurs d’écran compatibles',
            panelLabel: 'Panneau d’accessibilité',
            settings: ['Vitesse de la voix', 'Contraste visuel', 'Taille de police', 'Réglages tactiles du matériel'],
        },
        status: {
            label: 'État du projet :',
            text: 'prototype fonctionnel de niveau basique-intermédiaire.',
            next: 'Prochaine étape : tests avec les utilisateurs finaux.',
        },
    },

    history: {
        hero: {
            eyebrow: 'Notre histoire',
            title: 'D’un vrai problème à une médaille d’or.',
            lead: 'Braillearn est né pour que l’apprentissage du braille ne dépende ni de l’argent ni de la sensibilité de vos doigts. Voici comment nous en sommes arrivés là.',
            videoAria: 'Vidéo : Braillearn, médaille d’or à Infomatrix México 2026',
            caption: 'Médaille d’or à Infomatrix México 2026, qualifiés pour la finale internationale en Thaïlande.',
            fallback: 'Votre navigateur ne peut pas lire cette vidéo.',
        },
        labels: ['Le problème', 'La barrière', 'Notre réponse', 'La construction', 'Les essais', 'La reconnaissance', 'La suite'],
        build: {
            title: 'Chaque cellule, faite à la main.',
            text: 'Nous avons bobiné 120 solénoïdes à la main, imprimé les mécanismes en 3D et assemblé 20 cellules. Pour le prototype, nous en faisons fonctionner 13, afin de montrer que le système marche de la même façon quel que soit le nombre de cellules connectées.',
            stats: ['cellules assemblées', 'solénoïdes bobinés à la main', 'points indépendants opérationnels'],
            galleryLabel: 'Photos du processus de fabrication',
            photos: [
                'Pièces du mécanisme, imprimées en 3D avant l’assemblage.',
                'Un solénoïde bobiné à la main.',
                'Une cellule ouverte : le solénoïde et la pièce qui déplace le point.',
                'Les cellules imprimées en 3D, déjà câblées.',
                'La base modulaire où se placent les cellules.',
                'Les cartes de commande et le microcontrôleur, câblés à la main.',
                'L’atelier : cartes, bobines et calculs sur le tableau.',
                'Assemblage et test d’un bloc de cellules.',
            ],
        },
        proof: {
            title: 'Nous avons prouvé que ça marche.',
            text: 'La plateforme fonctionne à un niveau basique-intermédiaire, sans erreur de navigation, et le module de langage naturel a reconnu correctement les 50 intentions du test contrôlé.',
            stats: [
                { value: '50/50', label: 'intentions correctement classées lors du test contrôlé' },
                { value: 'ARIA', label: 'compatible avec NVDA, JAWS et VoiceOver' },
            ],
        },
        recognition: {
            title: 'Et le jury l’a remarqué.',
            text: 'Argent à Infomatrix 2025 (régional), or à Infomatrix México 2026 (national) et maintenant, cap sur la finale internationale.',
            items: [
                { when: '2025', title: 'Infomatrix régional', medal: 'Médaille d’argent' },
                { when: '2026', title: 'Infomatrix México (national)', medal: 'Médaille d’or' },
                { when: 'Prochaine étape', title: 'Finale internationale', medal: 'Thaïlande' },
            ],
        },
        next: {
            title: 'La suite.',
            text: 'Le prototype est toujours en cours de validation. Voici les prochaines étapes.',
            items: [
                'Essais cliniques avec les utilisateurs finaux',
                'Programme avancé : grammaire, phrases et textes',
                'Connecteurs plug-and-play entre les cartes, sans soudure',
                'Services indépendants pour passer à l’échelle (microservices)',
            ],
        },
    },

    community: {
        eyebrow: 'Communauté',
        title: 'Où trouver du soutien à Campeche.',
        lead: 'Institutions et ressources pour les personnes en situation de handicap et leurs familles. Si vous représentez une association de personnes aveugles ou malvoyantes, nous aimerions vous rencontrer.',
        labels: { address: 'Adresse', phone: 'Téléphone', email: 'E-mail', web: 'Site web', hours: 'Horaires' },
        checked: (date) => `Informations vérifiées le ${date}. Confirmez-les avant de vous déplacer.`,
        orgs: {
            cree: {
                kind: 'DIF Campeche',
                description:
                    'Rééducation complète sans hospitalisation pour les personnes en situation de handicap : consultations spécialisées, thérapies physique, occupationnelle et orthophonique, et soins paramédicaux.',
                hours: 'Du lundi au vendredi, de 6 h 30 à 20 h',
            },
            seinclusion: {
                kind: 'Gouvernement de l’État',
                description:
                    'Organisme de l’État qui a proposé des cours de braille pour les personnes en situation de handicap visuel, leurs familles et les enseignants.',
            },
        },
        cta: {
            title: 'Votre association n’apparaît pas ?',
            text: 'Dites-le-nous, nous l’ajouterons avec plaisir.',
            button: 'Nous contacter',
        },
    },

    tech: {
        solenoidPhoto: { label: 'Notre solénoïde bobiné à la main, démonté : tige, bobine de cuivre et boîtier avec ressort.' },
        pulse: {
            aria: 'Graphique : une impulsion de courant de 50 ms soulève le point, qui reste levé sans consommation',
            current: 'Courant',
            dot: 'Point',
            raised: 'Levé',
            held: 'Aucune consommation continue',
        },
    },

    models: {
        display: { alt: 'Modèle 3D interactif de l’afficheur Braillearn complet. Faites-le glisser pour le faire tourner.' },
        cell: { alt: 'Modèle 3D interactif d’une cellule Braillearn. Faites-la glisser pour la faire tourner.' },
        solenoid: { alt: 'Modèle 3D interactif du solénoïde et de son mécanisme de verrouillage. Faites-le glisser pour le faire tourner.' },
        loading: 'Chargement du modèle 3D…',
        error: 'Impossible de charger le modèle 3D.',
        tabs: { label: 'Vue', model: '3D', photo: 'Photo' },
    },

    backend: {
        title: 'Architecture du backend',
        lead: 'Une seule API FastAPI gère la sécurité, les comptes, la traduction en braille et la communication avec l’afficheur.',
        summary: 'Architecture du backend : les clients de l’API et le microcontrôleur ESP communiquent avec l’API Braillearn (FastAPI et SQLAlchemy). L’API comprend un middleware de sécurité, la gestion de l’authentification, la communication avec l’appareil, la traduction en braille, une plateforme d’apprentissage, la transcription, un catalogue, l’appairage d’appareil, les utilisateurs, la gestion des documents et un WebSocket de commandes. Elle utilise une base de données PostgreSQL et un serveur de stockage de fichiers.',
        client: { title: 'Client', text: 'Consommateur d’API.' },
        esp: { title: 'ESP', text: 'Microcontrôleur.' },
        api: { title: 'Braillearn API', text: 'FastAPI + SQLAlchemy' },
        database: { title: 'Base de données', text: 'PostgreSQL.' },
        storage: { title: 'Stockage de fichiers', text: 'Serveur.' },
        modules: {
            security: { title: 'Middleware de sécurité', text: 'Limitation de débit, validation JWT et filtrage des bots.' },
            auth: { title: 'Gestionnaire d’authentification', text: 'Jetons JWT.' },
            device: { title: 'Communication avec l’appareil', text: 'Configuration et navigation.' },
            braille: { title: 'Traduction en braille', text: 'Traduction et conversion en positions de points.' },
            learning: { title: 'Plateforme d’apprentissage', text: 'Leçons.' },
            transcription: { title: 'Transcription', text: '' },
            catalog: { title: 'Catalogue', text: 'Accès aux documents publics.' },
            pairing: { title: 'Appairage de l’appareil', text: 'Demande et confirmation.' },
            users: { title: 'Utilisateurs', text: 'Inscription et connexion.' },
            documents: { title: 'Gestion des documents', text: '' },
            websocket: { title: 'WebSocket /commands', text: 'Classification des intentions.' },
        },
    },
};
