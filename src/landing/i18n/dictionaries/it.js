export default {
    meta: {
        titles: {
            home: 'Braillearn — Impara il Braille con i tuoi tempi',
            historia: 'La nostra storia — Braillearn',
            tecnologia: 'Tecnologia — Braillearn',
            comunidad: 'Comunità — Braillearn',
        },
        descriptions: {
            home: 'Braillearn: un display Braille modulare a punti ingranditi e una piattaforma di apprendimento per persone con sensibilità tattile ridotta.',
            historia: 'Perché esiste Braillearn: la barriera fisiologica ed economica del Braille standard e il team che lo costruisce.',
            tecnologia: 'L’ingegneria dietro Braillearn: solenoidi, ESP8266, blocco passivo, costi e software.',
            comunidad: 'Istituzioni e risorse di supporto per le persone con disabilità visiva e le loro famiglie a Campeche.',
        },
    },

    common: {
        skipToContent: 'Vai al contenuto',
        tryPlatform: 'Prova la piattaforma',
        placeholderPrefix: 'Spazio riservato',
        mainNav: 'Principale',
        footerNav: 'Piè di pagina',
        openMenu: 'Apri il menu',
        closeMenu: 'Chiudi il menu',
        previous: 'Precedente',
        next: 'Successivo',
    },

    nav: { producto: 'Prodotto', tecnologia: 'Tecnologia', historia: 'La nostra storia', comunidad: 'Comunità', contacto: 'Contatti' },

    a11y: {
        label: 'Opzioni di accessibilità',
        textSize: 'Dimensione del testo',
        sizes: { md: 'Normale', lg: 'Grande', xl: 'Molto grande' },
        reduceMotion: 'Riduci le animazioni',
    },

    language: { label: 'Lingua' },

    voice: {
        utterances: ['Pagina successiva', 'Gira pagina'],
        result: 'Pagina successiva',
        intent: 'stessa intenzione: navigare → avanti',
    },

    hero: {
        tagline: 'Impara il Braille con i tuoi tempi, con le mani, la voce e lo schermo.',
        seeProduct: 'Scopri il prodotto',
        words: ['salve', 'tatto', 'libro', 'leggi'],
    },

    statement: {
        aria: 'Che cos’è Braillearn',
        text: 'Braillearn è un display Braille a punti grandi e una piattaforma che ti insegna a leggere con le mani. In italiano, con i tuoi tempi e senza conoscenze tecniche.',
    },

    display: {
        eyebrow: 'Il display',
        title: 'Punti da 8 mm. Fatti per essere sentiti.',
        lead: 'Ogni punto è più di cinque volte più grande di quello del Braille standard, così qualsiasi polpastrello può distinguerlo.',
        highlights: [
            { value: '8 mm', label: 'Punti ingranditi, ben oltre la soglia tattile di 5 mm.' },
            { value: '72 × 48 mm', label: 'Ogni cella a sei punti. Si collegano senza attrezzi.' },
            { value: '3.493 MXN', label: 'Il sistema minimo: la base e una cella. Cresce quando ne hai bisogno.' },
        ],
    },

    platform: {
        eyebrow: 'La piattaforma',
        title: 'Impara con i tuoi tempi.',
        lead: 'Lezioni in italiano che si adattano a te, senza manuali e senza formazione preliminare.',
        previewTitle: 'Anteprima della piattaforma di apprendimento',
        previewNote: 'Questa è la vera pagina principale della piattaforma. La versione completa include corsi, messaggi per il display Braille e altro.',
        features: [
            {
                title: 'Dall’alfabeto alle parole',
                text: 'Un percorso che avanza con te: prima riconosci ogni lettera, poi leggi e componi parole.',
            },
            {
                title: 'Sul display e sullo schermo',
                text: 'Ogni carattere compare contemporaneamente sui punti e sullo schermo, così chi ti accompagna può seguirti.',
            },
            {
                title: 'Suoni che festeggiano',
                text: 'Feedback sonoro e piccoli traguardi che fanno venire voglia di ripetere.',
            },
        ],
    },

    bento: {
        aria: 'Voce e accessibilità',
        voice: {
            eyebrow: 'Voce',
            title: 'Parlagli. Ti capisce.',
            text: 'Naviga con la voce in italiano. Non importa come lo dici: Braillearn capisce cosa vuoi fare.',
        },
        access: {
            eyebrow: 'Accessibilità',
            title: 'Pensata per tutte le persone.',
            text: 'Compatibile con gli screen reader e con un pannello per adattare la piattaforma alle tue esigenze.',
            readersLabel: 'Screen reader compatibili',
            settings: ['Velocità della voce', 'Contrasto visivo', 'Dimensione del testo', 'Risposta tattile del display'],
        },
    },

    modular: {
        eyebrow: 'Modulare',
        title: 'Parti da una cella. Arriva fino a venti.',
        lead: 'Una famiglia, una scuola o una clinica possono iniziare con poco e aggiungere celle quando serve.',
        cellsLabel: 'Numero di celle',
        readout: (cells, dots) => `${cells} ${cells === 1 ? 'cella' : 'celle'} · ${dots} punti`,
        minimum: { label: 'Sistema minimo', detail: 'Base + 1 cella' },
        complete: { label: 'Sistema completo', detail: 'Base + 20 celle · 120 punti' },
        techLink: 'Scopri la tecnologia',
    },

    contact: {
        title: 'Vuoi portare Braillearn nella tua scuola, clinica o famiglia?',
        text: 'Esplora la piattaforma oggi e raccontaci di cosa hai bisogno: costruiamo il sistema cella dopo cella.',
        mail: 'Scrivici',
    },

    footer: { note: 'Prototipo in fase di validazione.' },

    problem: {
        eyebrow: 'La barriera',
        title: 'Uno standard pensato per polpastrelli che non sentono più.',
        lead: 'Imparare il Braille non dovrebbe dipendere dal denaro né dalla sensibilità delle tue dita. Oggi dipende da entrambi.',
        stat: {
            text: 'dei messicani con il diabete sviluppa una neuropatia periferica.',
            before: 'La neuropatia alza la soglia di discriminazione tattile oltre i',
            threshold: '5 mm',
            after: '. Per queste persone, leggere il Braille da 1,5 mm equivale a leggere con i guanti.',
            source: 'Fonte',
            percentSpoken: ' per cento',
        },
        photo: {
            label: 'Foto di un utente o confronto',
            hint: 'Una cella standard da 1,5 mm accanto a una cella Braillearn da 8 mm',
        },
        context: [
            { value: '18,3 %', label: 'degli adulti messicani vive con il diabete mellito', source: 'ENSANUT 2022' },
            {
                value: '26,9 %',
                label: 'delle persone con disabilità visiva in Messico ha tra 0 e 14 anni',
                source: 'INEGI, 2020',
            },
            {
                value: 'USD 899–5.495',
                label: 'è quanto costano i display Braille rinfrescabili in commercio',
                source: 'Orbit Research, Humanware e Freedom Scientific, 2024–2025',
            },
        ],
        scale: {
            title: 'La soluzione parte dalla dimensione del punto.',
            lead: 'I tre cerchi sono disegnati nella stessa scala reale: 1 mm ha la stessa lunghezza in tutti e tre.',
            items: [
                {
                    display: '1,5 mm',
                    title: 'Braille standard',
                    note: 'Norma BANA / ONCE, pensata per una sensibilità tattile normale.',
                    verdict: 'Illeggibile con la neuropatia',
                },
                {
                    display: '> 5 mm',
                    title: 'Soglia di discriminazione',
                    note: 'Oltre questa distanza la lettura fluida del Braille standard diventa impossibile (Nakada & Dellon, 1989).',
                    verdict: 'Soglia con la neuropatia',
                },
                {
                    display: '8 mm',
                    title: 'Braillearn',
                    note: 'Punti ingranditi che superano la soglia e sono distinguibili dai bambini in fase di pre-alfabetizzazione.',
                    verdict: 'Oltre la soglia',
                },
            ],
        },
        bridge: {
            eyebrow: 'La nostra risposta',
            title: 'Celle macro da 72 × 48 mm con punti da 8 mm.',
            text: 'Ogni cella lavora ben oltre la soglia dei 5 mm ed è abbastanza grande perché i polpastrelli di un bambino la distinguano. È il ponte tra una barriera fisiologica e una soluzione hardware che qualsiasi famiglia, scuola o clinica può assemblare cella dopo cella.',
        },
        cell: {
            aria: 'Cella Braille interattiva a 6 punti',
            dot: (n, raised) => `Punto ${n}, ${raised ? 'sollevato' : 'abbassato'}`,
            caption:
                'Tocca i punti. Sul display reale un impulso da 50 ms solleva ciascun punto e il meccanismo lo mantiene in posizione.',
        },
    },

    team: {
        eyebrow: 'Team',
        title: 'Ingegneria con uno scopo chiaro.',
        lead: (faculty, university, advisor) =>
            `Studenti della ${faculty} della ${university}, con la supervisione di ${advisor}.`,
        photoAlt: 'Le tre persone del team Braillearn posano insieme, di notte, in una strada pedonale.',
        hint: 'Passa il cursore o tocca ogni membro per vedere nome e ambito.',
        together: 'Ognuno ha la sua specialità, ma abbiamo costruito tutto il progetto insieme.',
        members: [
            {
                role: 'Ingegneria dei sistemi informatici',
            },
            {
                role: 'Ingegneria delle tecnologie software',
            },
            {
                role: 'Ingegneria meccatronica',
            },
        ],
    },

    architecture: {
        eyebrow: 'Architettura',
        title: 'Hardware modulare, progettato per costare poco e consumare meno.',
        lead: 'Ogni scelta di progetto risponde a un vincolo reale: punti che si sentano, celle che si possano comprare una alla volta ed elettronica che un laboratorio possa riparare.',
        chainTitle: 'Catena del segnale',
        chain: [
            { tag: 'MCU', name: 'ESP8266 NodeMCU', note: 'Riceve via HTTP il testo già tradotto in punti.' },
            { tag: 'REGISTRI', name: '74HC595 in daisy-chain', note: 'Estendono i pin per pilotare centinaia di punti.' },
            { tag: 'POTENZA', name: 'MOSFET IRLZ44N', note: 'Con un 2N2222A e un diodo di ricircolo 1N5408, in logica inversa.' },
            { tag: 'ATTUATORE', name: 'Solenoide Ø 8 mm', note: 'Impulso da 50 ms e blocco passivo.' },
        ],
        specs: [
            {
                tag: 'ATTUAZIONE',
                title: 'Solenoidi elettromagnetici',
                metric: 'Ø 8 mm',
                text: 'Avvolti a mano con rame smaltato da 24 AWG su un nucleo stampato in PETG. Basso costo unitario e forza sufficiente con impulsi brevi.',
            },
            {
                tag: 'CONTROLLO',
                title: 'ESP8266 e registri a scorrimento',
                metric: 'HTTP · Wi-Fi',
                text: 'Un solo microcontrollore governa l’intera catena di celle. Il firmware adatta la scansione al numero di celle collegate.',
            },
            {
                tag: 'ENERGIA',
                title: 'Blocco passivo',
                metric: '50 ms',
                text: 'Un impulso solleva il punto e il meccanismo a penna retrattile lo mantiene sollevato senza consumo continuo.',
            },
            {
                tag: 'COSTO',
                title: 'Produzione ottimizzata',
                metric: '6.315 MXN',
                text: 'Sistema completo da 20 celle e 120 punti: il 24,1 % del display commerciale più economico.',
            },
        ],
        cost: {
            eyebrow: 'Costo di accesso · MXN',
            title: 'Il sistema completo costa il 24,1 % del display commerciale più economico.',
            rows: [
                { label: 'Braillearn · sistema minimo', detail: 'BASE + 1 cella' },
                { label: 'Braillearn · sistema completo', detail: 'BASE + 20 celle' },
                { label: 'Orbit Reader 40', detail: 'il display commerciale più economico' },
                { label: 'Mediana commerciale', detail: '15 dispositivi' },
                { label: 'Display commerciale più caro', detail: 'tra i 15 confrontati' },
            ],
            note: 'Braillearn: costo di produzione all’ingrosso (LCSC e Alibaba, maggio 2026). Commerciali: prezzo di listino 2024–2025 di 15 dispositivi.',
        },
        modular: {
            eyebrow: 'Modello modulare',
            text: 'Si acquista una BASE una sola volta e si aggiungono celle quando il budget lo permette.',
            base: { label: 'BASE', note: 'Tutta l’elettronica di controllo e la struttura. Pagamento unico.' },
            cell: { label: 'CELLA', note: 'Modulo meccanico da 6 punti. Si aggiunge quando serve.' },
        },
    },

    software: {
        eyebrow: 'Software',
        title: 'Una piattaforma che capisce cosa intendi.',
        lead: 'Il display è solo metà del lavoro. L’altra metà è un ecosistema web che insegna in italiano, dialoga con l’hardware in tempo reale e non ti chiede mai di imparare comandi.',
        web: {
            label: 'Ecosistema web',
            title: 'Dal browser al solenoide',
            text: 'Ogni carattere viene mostrato contemporaneamente sul display fisico e sullo schermo, così un tutor vedente può accompagnarti. Un’API proprietaria traduce il testo in punti e lo invia via HTTP all’ESP8266.',
            techLabel: 'Tecnologie',
        },
        nlu: {
            label: 'Modulo NLU',
            title: 'Intenzioni, non comandi',
            text: 'La classificazione per similarità del coseno non dipende dalle parole esatte, ma dalla direzione del vettore semantico.',
            illustrative: 'Esempio illustrativo',
            score: '50/50',
            scoreText: 'intenzioni classificate correttamente (100 %) nel test controllato.',
        },
        access: {
            label: 'Accessibilità',
            title: 'Un requisito centrale, non un extra',
            text: 'Etichettatura semantica ARIA completa, compatibile con gli screen reader, e navigazione vocale in italiano con comandi come «avanti», «ripeti» e «seleziona».',
            readersLabel: 'Screen reader compatibili',
            panelLabel: 'Pannello di accessibilità',
            settings: ['Velocità della voce', 'Contrasto visivo', 'Dimensione del carattere', 'Impostazioni tattili dell’hardware'],
        },
        status: {
            label: 'Stato del progetto:',
            text: 'prototipo funzionante di livello base-intermedio.',
            next: 'Prossima fase: test con gli utenti finali.',
        },
    },

    history: {
        hero: {
            eyebrow: 'La nostra storia',
            title: 'Da un problema reale a una medaglia d’oro.',
            lead: 'Braillearn è nato perché imparare il Braille non dipenda dal denaro né dalla sensibilità delle tue dita. Ecco come siamo arrivati fin qui.',
            videoAria: 'Video: Braillearn, medaglia d’oro a Infomatrix México 2026',
            caption: 'Medaglia d’oro a Infomatrix México 2026, con accesso alla finale internazionale in Thailandia.',
            fallback: 'Il tuo browser non riesce a riprodurre questo video.',
        },
        labels: ['Il problema', 'La barriera', 'La nostra risposta', 'Costruirlo', 'Metterlo alla prova', 'Il riconoscimento', 'Cosa verrà dopo'],
        build: {
            title: 'Ogni cella, fatta a mano.',
            text: 'Abbiamo avvolto a mano 120 solenoidi, stampato i meccanismi in 3D e assemblato 20 celle. Per il prototipo ne facciamo funzionare 13, per mostrare che il sistema funziona allo stesso modo a prescindere da quante ne colleghi.',
            stats: ['celle assemblate', 'solenoidi avvolti a mano', 'punti indipendenti operativi'],
            galleryLabel: 'Foto del processo di costruzione',
            photos: [
                'Parti del meccanismo, stampate in 3D prima dell’assemblaggio.',
                'Un solenoide avvolto a mano.',
                'Una cella aperta: il solenoide e il pezzo che muove il punto.',
                'Le celle stampate in 3D, già cablate.',
                'La base modulare dove si sistemano le celle.',
                'Le schede di controllo e il microcontrollore, cablati a mano.',
                'Il laboratorio: schede, bobine e calcoli sulla lavagna.',
                'Assemblaggio e test di un blocco di celle.',
            ],
        },
        proof: {
            title: 'Abbiamo dimostrato che funziona.',
            text: 'La piattaforma funziona a livello base-intermedio, senza errori di navigazione, e il modulo di linguaggio naturale ha classificato correttamente tutte le 50 intenzioni del test controllato.',
            stats: [
                { value: '50/50', label: 'intenzioni classificate correttamente nel test controllato' },
                { value: 'ARIA', label: 'compatibile con NVDA, JAWS e VoiceOver' },
            ],
        },
        recognition: {
            title: 'E la giuria se n’è accorta.',
            text: 'Argento a Infomatrix 2025 (regionale), oro a Infomatrix México 2026 (nazionale) e ora verso la finale internazionale.',
            items: [
                { when: '2025', title: 'Infomatrix regionale', medal: 'Medaglia d’argento' },
                { when: '2026', title: 'Infomatrix México (nazionale)', medal: 'Medaglia d’oro' },
                { when: 'Prossima tappa', title: 'Finale internazionale', medal: 'Thailandia' },
            ],
        },
        next: {
            title: 'Cosa verrà dopo.',
            text: 'Il prototipo è ancora in fase di validazione. Questi sono i prossimi passi.',
            items: [
                'Test clinici con gli utenti finali',
                'Programma avanzato: grammatica, frasi e testi',
                'Connettori plug-and-play tra le schede, senza saldature',
                'Servizi indipendenti per scalare (microservizi)',
            ],
        },
    },

    community: {
        eyebrow: 'Comunità',
        title: 'Dove trovare supporto a Campeche.',
        lead: 'Istituzioni e risorse per le persone con disabilità e le loro famiglie. Se rappresenti un’associazione di persone cieche o ipovedenti, ci piacerebbe conoscerti.',
        labels: { address: 'Indirizzo', phone: 'Telefono', email: 'E-mail', web: 'Sito web', hours: 'Orari' },
        checked: (date) => `Informazioni verificate il ${date}. Confermale prima di recarti sul posto.`,
        orgs: {
            cree: {
                kind: 'DIF Campeche',
                description:
                    'Riabilitazione completa non ospedaliera per persone con disabilità: visite specialistiche, terapia fisica, occupazionale e logopedica, e assistenza paramedica.',
                hours: 'Dal lunedì al venerdì, dalle 6:30 alle 20:00',
            },
            seinclusion: {
                kind: 'Governo dello Stato',
                description:
                    'Ente statale che ha organizzato corsi di Braille per persone con disabilità visiva, le loro famiglie e gli insegnanti.',
            },
        },
        cta: {
            title: 'La tua associazione non c’è?',
            text: 'Scrivici e la includeremo volentieri.',
            button: 'Contattaci',
        },
    },

    tech: {
        solenoidPhoto: { label: 'Il nostro solenoide avvolto a mano, smontato: asta, bobina di rame e alloggiamento con molla.' },
        pulse: {
            aria: 'Grafico: un impulso di corrente da 50 ms solleva il punto, che resta sollevato senza consumo',
            current: 'Corrente',
            dot: 'Punto',
            raised: 'Sollevato',
            held: 'Nessun consumo continuo',
        },
    },

    models: {
        display: { alt: 'Modello 3D interattivo del display Braillearn completo. Trascinalo per ruotarlo.' },
        cell: { alt: 'Modello 3D interattivo di una cella Braillearn. Trascinala per ruotarla.' },
        solenoid: { alt: 'Modello 3D interattivo del solenoide e del suo meccanismo di blocco. Trascinalo per ruotarlo.' },
        loading: 'Caricamento del modello 3D…',
        error: 'Impossibile caricare il modello 3D.',
        tabs: { label: 'Vista', model: '3D', photo: 'Foto' },
    },

    backend: {
        title: 'Architettura del backend',
        lead: 'Una sola API FastAPI gestisce sicurezza, account, traduzione in Braille e comunicazione con il display.',
        summary: 'Architettura del backend: i client dell’API e il microcontrollore ESP comunicano con l’API Braillearn (FastAPI e SQLAlchemy). L’API include middleware di sicurezza, gestione dell’autenticazione, comunicazione con il dispositivo, traduzione in Braille, piattaforma di apprendimento, trascrizione, catalogo, abbinamento del dispositivo, utenti, gestione dei documenti e un WebSocket di comandi. Usa un database PostgreSQL e un server di archiviazione dei file.',
        client: { title: 'Client', text: 'Consumatore di API.' },
        esp: { title: 'ESP', text: 'Microcontrollore.' },
        api: { title: 'Braillearn API', text: 'FastAPI + SQLAlchemy' },
        database: { title: 'Database', text: 'PostgreSQL.' },
        storage: { title: 'Archiviazione dei file', text: 'Server.' },
        modules: {
            security: { title: 'Middleware di sicurezza', text: 'Rate limiting, validazione JWT e filtraggio dei bot.' },
            auth: { title: 'Gestore dell’autenticazione', text: 'Token JWT.' },
            device: { title: 'Comunicazione con il dispositivo', text: 'Configurazione e navigazione.' },
            braille: { title: 'Traduzione in Braille', text: 'Traduzione e conversione in posizioni dei punti.' },
            learning: { title: 'Piattaforma di apprendimento', text: 'Lezioni.' },
            transcription: { title: 'Trascrizione', text: '' },
            catalog: { title: 'Catalogo', text: 'Accesso ai documenti pubblici.' },
            pairing: { title: 'Abbinamento del dispositivo', text: 'Richiesta e conferma.' },
            users: { title: 'Utenti', text: 'Registrazione e accesso.' },
            documents: { title: 'Gestione dei documenti', text: '' },
            websocket: { title: 'WebSocket /commands', text: 'Classificazione delle intenzioni.' },
        },
    },
};
