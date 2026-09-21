export default {
    meta: {
        titles: {
            home: 'Braillearn — Learn Braille at your own pace',
            historia: 'Our story — Braillearn',
            tecnologia: 'Technology — Braillearn',
            comunidad: 'Community — Braillearn',
        },
        descriptions: {
            home: 'Braillearn: a modular Braille display with enlarged dots and a learning platform for people with reduced tactile sensitivity.',
            historia: 'Why Braillearn exists: the physiological and economic barrier of standard Braille, and the team building it.',
            tecnologia: 'The engineering behind Braillearn: solenoids, ESP8266, passive latching, cost and software.',
            comunidad: 'Institutions and support resources for people with visual disabilities and their families in Campeche.',
        },
    },

    common: {
        skipToContent: 'Skip to content',
        tryPlatform: 'Try the Platform',
        placeholderPrefix: 'Placeholder',
        mainNav: 'Main',
        footerNav: 'Footer',
        openMenu: 'Open menu',
        closeMenu: 'Close menu',
        previous: 'Previous',
        next: 'Next',
    },

    nav: { producto: 'Product', tecnologia: 'Technology', historia: 'Our story', comunidad: 'Community', contacto: 'Contact' },

    a11y: {
        label: 'Accessibility options',
        textSize: 'Text size',
        sizes: { md: 'Normal', lg: 'Large', xl: 'Extra large' },
        reduceMotion: 'Reduce animations',
    },

    language: { label: 'Language' },

    voice: {
        utterances: ['Next page', 'Turn the page'],
        result: 'Next page',
        intent: 'same intent: navigate → next',
    },

    hero: {
        tagline: 'Learn Braille at your own pace, with your hands, your voice and the screen.',
        seeProduct: 'Explore the product',
        words: ['hello', 'touch', 'learn', 'class'],
    },

    statement: {
        aria: 'What is Braillearn',
        text: 'Braillearn is a Braille display with large dots and a platform that teaches you to read with your hands. In English, at your own pace and with no technical knowledge.',
    },

    display: {
        eyebrow: 'The display',
        title: '8 mm dots. Made to be felt.',
        lead: 'Each dot is more than five times the size of standard Braille, so any fingertip can tell them apart.',
        highlights: [
            { value: '8 mm', label: 'Enlarged dots, well above the 5 mm tactile threshold.' },
            { value: '72 × 48 mm', label: 'Each six-dot cell. They connect without tools.' },
            { value: '$3,493 MXN', label: 'The minimum system: the base and one cell. It grows when you need it.' },
        ],
    },

    platform: {
        eyebrow: 'The platform',
        title: 'Learn at your own pace.',
        lead: 'Lessons in English that adapt to you, with no manuals and no prior training.',
        previewTitle: 'Preview of the learning platform',
        previewNote: 'This is the platform’s real home page. The full version includes courses, messages to the Braille display and more.',
        features: [
            {
                title: 'From the alphabet to words',
                text: 'A path that grows with you: first you recognize each letter, then you read and compose words.',
            },
            {
                title: 'On the display and on screen',
                text: 'Each character appears on the dots and on the screen at the same time, so whoever is with you can follow along.',
            },
            {
                title: 'Sounds that celebrate',
                text: 'Audio feedback and small achievements that make learning something you want to come back to.',
            },
        ],
    },

    bento: {
        aria: 'Voice and accessibility',
        voice: {
            eyebrow: 'Voice',
            title: 'Talk to it. It understands.',
            text: 'Navigate by voice in English. It does not matter how you say it: Braillearn understands what you want to do.',
        },
        access: {
            eyebrow: 'Accessibility',
            title: 'Designed for everyone.',
            text: 'Compatible with screen readers, with a panel to adjust the platform to your needs.',
            readersLabel: 'Compatible screen readers',
            settings: ['Speech speed', 'Visual contrast', 'Text size', 'Tactile response of the display'],
        },
    },

    modular: {
        eyebrow: 'Modular',
        title: 'Start with one cell. Grow to twenty.',
        lead: 'A family, a school or a clinic can start small and add cells whenever they need to.',
        cellsLabel: 'Number of cells',
        readout: (cells, dots) => `${cells} ${cells === 1 ? 'cell' : 'cells'} · ${dots} dots`,
        minimum: { label: 'Minimum system', detail: 'Base + 1 cell' },
        complete: { label: 'Full system', detail: 'Base + 20 cells · 120 dots' },
        techLink: 'Explore the technology',
    },

    contact: {
        title: 'Want to bring Braillearn to your school, clinic or family?',
        text: 'Try the platform today and tell us what you need: we build the system cell by cell.',
        mail: 'Write to us',
    },

    footer: { note: 'Prototype in the validation phase.' },

    problem: {
        eyebrow: 'The barrier',
        title: 'A standard designed for fingertips that no longer feel.',
        lead: 'Learning Braille should not depend on money or on how sensitive your fingers are. Today it depends on both.',
        stat: {
            text: 'of Mexicans with diabetes develop peripheral neuropathy.',
            before: 'Neuropathy raises the tactile discrimination threshold above',
            threshold: '5 mm',
            after: '. For these people, reading 1.5 mm Braille is like reading while wearing gloves.',
            source: 'Source',
            percentSpoken: ' percent',
        },
        photo: {
            label: 'User photo or comparison',
            hint: 'A standard 1.5 mm cell next to an 8 mm Braillearn cell',
        },
        context: [
            { value: '18.3 %', label: 'of Mexican adults live with diabetes mellitus', source: 'ENSANUT 2022' },
            {
                value: '26.9 %',
                label: 'of people with visual disabilities in Mexico are between 0 and 14 years old',
                source: 'INEGI, 2020',
            },
            {
                value: 'USD 899–5,495',
                label: 'is what commercial refreshable Braille displays cost',
                source: 'Orbit Research, Humanware and Freedom Scientific, 2024–2025',
            },
        ],
        scale: {
            title: 'The solution starts with the size of the dot.',
            lead: 'The three circles are drawn to true scale relative to each other: 1 mm is the same length in all three.',
            items: [
                {
                    display: '1.5 mm',
                    title: 'Standard Braille',
                    note: 'BANA / ONCE standard, designed for normal tactile sensitivity.',
                    verdict: 'Unreadable with neuropathy',
                },
                {
                    display: '> 5 mm',
                    title: 'Discrimination threshold',
                    note: 'Beyond this distance, fluent reading of standard Braille becomes impossible (Nakada & Dellon, 1989).',
                    verdict: 'Threshold with neuropathy',
                },
                {
                    display: '8 mm',
                    title: 'Braillearn',
                    note: 'Enlarged dots that work above the threshold and can be told apart by children who are pre-literate.',
                    verdict: 'Above the threshold',
                },
            ],
        },
        bridge: {
            eyebrow: 'Our answer',
            title: 'Macro cells of 72 × 48 mm with 8 mm dots.',
            text: 'Each cell works far above the 5 mm threshold and is large enough for a child’s fingertips to tell it apart. It is the bridge between a physiological barrier and a hardware solution that any family, school or clinic can assemble cell by cell.',
        },
        cell: {
            aria: 'Interactive 6-dot Braille cell',
            dot: (n, raised) => `Dot ${n}, ${raised ? 'raised' : 'lowered'}`,
            caption:
                'Touch the dots. On the real display, a 50 ms pulse raises each one and the mechanism holds it in place.',
        },
    },

    team: {
        eyebrow: 'Team',
        title: 'Engineering with a clear purpose.',
        lead: (faculty, university, advisor) =>
            `Students from the ${faculty} of the ${university}, advised by ${advisor}.`,
        photoAlt: 'The three members of the Braillearn team pose together at night on a pedestrian street.',
        hint: 'Hover over or tap each team member to see their name and field.',
        together: 'Each of us has a specialty, but we built the whole project together.',
        members: [
            {
                role: 'Computer Systems Engineering',
            },
            {
                role: 'Software Technologies Engineering',
            },
            {
                role: 'Mechatronics Engineering',
            },
        ],
    },

    architecture: {
        eyebrow: 'Architecture',
        title: 'Modular hardware, designed to cost little and use less.',
        lead: 'Every design decision answers a real constraint: dots you can feel, cells you can buy one at a time, and electronics a workshop can repair.',
        chainTitle: 'Signal chain',
        chain: [
            { tag: 'MCU', name: 'ESP8266 NodeMCU', note: 'Receives the text, already translated to dots, over HTTP.' },
            { tag: 'REGISTERS', name: '74HC595 daisy-chain', note: 'Extend the pins to drive hundreds of dots.' },
            { tag: 'POWER', name: 'MOSFET IRLZ44N', note: 'With a 2N2222A and a 1N5408 flyback diode, in inverse logic.' },
            { tag: 'ACTUATOR', name: 'Solenoid Ø 8 mm', note: '50 ms pulse and passive latching.' },
        ],
        specs: [
            {
                tag: 'ACTUATION',
                title: 'Electromagnetic solenoids',
                metric: 'Ø 8 mm',
                text: 'Hand-wound with 24 AWG enameled copper on a PETG-printed core. Low unit cost and enough force with short pulses.',
            },
            {
                tag: 'CONTROL',
                title: 'ESP8266 and shift registers',
                metric: 'HTTP · Wi-Fi',
                text: 'A single microcontroller drives the whole chain of cells. The firmware adjusts the scan to however many cells you connect.',
            },
            {
                tag: 'ENERGY',
                title: 'Passive latching',
                metric: '50 ms',
                text: 'One pulse raises the dot and the retractable-pen mechanism keeps it up with no continuous power draw.',
            },
            {
                tag: 'COST',
                title: 'Optimized manufacturing',
                metric: '$6,315 MXN',
                text: 'Full system of 20 cells and 120 dots: 24.1 % of the cheapest commercial display.',
            },
        ],
        cost: {
            eyebrow: 'Cost of access · MXN',
            title: 'The full system costs 24.1 % of the cheapest commercial display.',
            rows: [
                { label: 'Braillearn · minimum system', detail: 'BASE + 1 cell' },
                { label: 'Braillearn · full system', detail: 'BASE + 20 cells' },
                { label: 'Orbit Reader 40', detail: 'the cheapest commercial display' },
                { label: 'Commercial median', detail: '15 devices' },
                { label: 'Most expensive commercial display', detail: 'of the 15 compared' },
            ],
            note: 'Braillearn: wholesale manufacturing cost (LCSC and Alibaba, May 2026). Commercial: 2024–2025 list price of 15 devices.',
        },
        modular: {
            eyebrow: 'Modular model',
            text: 'You buy a BASE once and add cells whenever the budget allows.',
            base: { label: 'BASE', note: 'All the control electronics and the structure. One-time payment.' },
            cell: { label: 'CELL', note: 'A 6-dot mechanical module. Add it whenever you need it.' },
        },
    },

    software: {
        eyebrow: 'Software',
        title: 'A platform that understands what you mean.',
        lead: 'The display is only half of it. The other half is a web ecosystem that teaches in English, talks to the hardware in real time and never asks you to learn commands.',
        web: {
            label: 'Web ecosystem',
            title: 'From the browser to the solenoid',
            text: 'Each character is shown on the physical display and on screen at once, so a sighted tutor can follow along. A custom API translates the text into dots and sends it over HTTP to the ESP8266.',
            techLabel: 'Technologies',
        },
        nlu: {
            label: 'NLU module',
            title: 'Intent, not commands',
            text: 'Classification by cosine similarity does not depend on the exact words, but on where the semantic vector points.',
            illustrative: 'Illustrative example',
            score: '50/50',
            scoreText: 'intents classified correctly (100 %) in the controlled test.',
        },
        access: {
            label: 'Accessibility',
            title: 'A core requirement, not an extra',
            text: 'Full semantic ARIA labeling, compatible with screen readers, and voice navigation in English with commands such as “next”, “repeat” and “select”.',
            readersLabel: 'Compatible screen readers',
            panelLabel: 'Accessibility panel',
            settings: ['Speech speed', 'Visual contrast', 'Font size', 'Tactile settings of the hardware'],
        },
        status: {
            label: 'Project status:',
            text: 'working prototype at a basic-to-intermediate level.',
            next: 'Next stage: testing with end users.',
        },
    },

    history: {
        hero: {
            eyebrow: 'Our story',
            title: 'From a real problem to a gold medal.',
            lead: 'Braillearn was born so that learning Braille would not depend on money or on how sensitive your fingers are. This is how we got here.',
            videoAria: 'Video: Braillearn, gold medal at Infomatrix México 2026',
            caption: 'Gold medal at Infomatrix México 2026, advancing to the international final in Thailand.',
            fallback: 'Your browser cannot play this video.',
        },
        labels: ['The problem', 'The barrier', 'Our answer', 'Building it', 'Testing it', 'Recognition', 'What comes next'],
        build: {
            title: 'Every cell, made by hand.',
            text: 'We wound 120 solenoids by hand, 3D-printed the mechanisms and assembled 20 cells. For the prototype we run 13 of them, to show that the system works the same no matter how many you connect.',
            stats: ['cells assembled', 'solenoids wound by hand', 'independent dots working'],
            galleryLabel: 'Photos of the building process',
            photos: [
                'Mechanism parts, 3D-printed before assembly.',
                'A hand-wound solenoid.',
                'An open cell: the solenoid and the part that moves the dot.',
                'The 3D-printed cells, already wired.',
                'The modular base where the cells sit.',
                'The control boards and the microcontroller, wired by hand.',
                'The workshop: boards, coils and calculations on the whiteboard.',
                'Assembling and testing a block of cells.',
            ],
        },
        proof: {
            title: 'We proved it works.',
            text: 'The platform works at a basic-to-intermediate level with no navigation errors, and the natural-language module got all 50 intents right in the controlled test.',
            stats: [
                { value: '50/50', label: 'intents classified correctly in the controlled test' },
                { value: 'ARIA', label: 'compatible with NVDA, JAWS and VoiceOver' },
            ],
        },
        recognition: {
            title: 'And the jury noticed.',
            text: 'Silver at Infomatrix 2025 (regional), gold at Infomatrix México 2026 (national), and now on to the international final.',
            items: [
                { when: '2025', title: 'Infomatrix regional', medal: 'Silver medal' },
                { when: '2026', title: 'Infomatrix México (national)', medal: 'Gold medal' },
                { when: 'Next', title: 'International final', medal: 'Thailand' },
            ],
        },
        next: {
            title: 'What comes next.',
            text: 'The prototype is still being validated. These are the next steps.',
            items: [
                'Clinical testing with end users',
                'Advanced curriculum: grammar, sentences and texts',
                'Plug-and-play connectors between boards, no soldering',
                'Independent services to scale (microservices)',
            ],
        },
    },

    community: {
        eyebrow: 'Community',
        title: 'Where to find support in Campeche.',
        lead: 'Institutions and resources for people with disabilities and their families. If you represent an association of blind or low-vision people, we would like to meet you.',
        labels: { address: 'Address', phone: 'Phone', email: 'Email', web: 'Website', hours: 'Hours' },
        checked: (date) => `Information verified on ${date}. Please confirm before visiting.`,
        orgs: {
            cree: {
                kind: 'DIF Campeche',
                description:
                    'Comprehensive outpatient rehabilitation for people with disabilities: specialist consultations, physical, occupational and speech therapy, and paramedical care.',
                hours: 'Monday to Friday, 6:30 am to 8:00 pm',
            },
            seinclusion: {
                kind: 'State Government',
                description:
                    'State agency that has offered Braille courses for people with visual disabilities, their families and teachers.',
            },
        },
        cta: {
            title: 'Is your association missing?',
            text: 'Tell us and we will gladly include it.',
            button: 'Contact us',
        },
    },

    tech: {
        solenoidPhoto: { label: 'Our hand-wound solenoid, disassembled: rod, copper coil and housing with spring.' },
        pulse: {
            aria: 'Chart: a 50 ms current pulse raises the dot, and it stays raised with no power draw',
            current: 'Current',
            dot: 'Dot',
            raised: 'Raised',
            held: 'No continuous power',
        },
    },

    models: {
        display: { alt: 'Interactive 3D model of the complete Braillearn display. Drag to rotate it.' },
        cell: { alt: 'Interactive 3D model of a Braillearn cell. Drag to rotate it.' },
        solenoid: { alt: 'Interactive 3D model of the solenoid and its latching mechanism. Drag to rotate it.' },
        loading: 'Loading 3D model…',
        error: 'The 3D model could not be loaded.',
        tabs: { label: 'View', model: '3D', photo: 'Photo' },
    },

    backend: {
        title: 'Backend architecture',
        lead: 'One FastAPI service handles security, accounts, Braille translation and communication with the display.',
        summary: 'Backend architecture: API clients and the ESP microcontroller talk to the Braillearn API (FastAPI and SQLAlchemy). The API includes security middleware, authentication management, device communication, Braille translation, a learning platform, transcription, a catalog, device pairing, users, document management and a commands WebSocket. It uses a PostgreSQL database and a file storage server.',
        client: { title: 'Client', text: 'API consumer.' },
        esp: { title: 'ESP', text: 'Microcontroller.' },
        api: { title: 'Braillearn API', text: 'FastAPI + SQLAlchemy' },
        database: { title: 'Database', text: 'PostgreSQL.' },
        storage: { title: 'File storage', text: 'Server.' },
        modules: {
            security: { title: 'Security middleware', text: 'Rate limiting, JWT validation and bot filtering.' },
            auth: { title: 'Authentication manager', text: 'JWT tokens.' },
            device: { title: 'Device communication', text: 'Configuration and navigation.' },
            braille: { title: 'Braille translation', text: 'Translation and conversion to dot positions.' },
            learning: { title: 'Learning platform', text: 'Lessons.' },
            transcription: { title: 'Transcription', text: '' },
            catalog: { title: 'Catalog', text: 'Access to public documents.' },
            pairing: { title: 'Device pairing', text: 'Request and confirmation.' },
            users: { title: 'Users', text: 'Sign-up and sign-in.' },
            documents: { title: 'Document management', text: '' },
            websocket: { title: 'WebSocket /commands', text: 'Intent classification.' },
        },
    },
};
