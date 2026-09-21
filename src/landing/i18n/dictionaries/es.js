// Español: idioma base. Los demás diccionarios siguen exactamente esta estructura.
//
// `hero.words`: palabras que forman las celdas de bienvenida. Cada palabra es una
// cadena (las letras se convierten con el alfabeto Braille latino) o una lista de
// celdas explícitas `[puntos, etiqueta]` para sistemas que no son latinos.
export default {
    meta: {
        titles: {
            home: 'Braillearn — Aprende Braille a tu ritmo',
            historia: 'Historia — Braillearn',
            tecnologia: 'Tecnología — Braillearn',
            comunidad: 'Comunidad — Braillearn',
        },
        descriptions: {
            home: 'Braillearn: display Braille modular de puntos ampliados y plataforma de aprendizaje en español para personas con sensibilidad táctil reducida.',
            historia: 'Por qué existe Braillearn: la barrera fisiológica y económica del Braille estándar, y el equipo que lo construye.',
            tecnologia: 'La ingeniería detrás de Braillearn: solenoides, ESP8266, enclavamiento pasivo, costo y software.',
            comunidad: 'Instituciones y recursos de apoyo para personas con discapacidad visual y sus familias en Campeche.',
        },
    },

    common: {
        skipToContent: 'Saltar al contenido',
        tryPlatform: 'Prueba la Plataforma',
        placeholderPrefix: 'Espacio reservado',
        mainNav: 'Principal',
        footerNav: 'Pie de página',
        openMenu: 'Abrir menú',
        closeMenu: 'Cerrar menú',
        previous: 'Anterior',
        next: 'Siguiente',
    },

    nav: { producto: 'Producto', tecnologia: 'Tecnología', historia: 'Historia', comunidad: 'Comunidad', contacto: 'Contacto' },

    a11y: {
        label: 'Opciones de accesibilidad',
        textSize: 'Tamaño del texto',
        sizes: { md: 'Normal', lg: 'Grande', xl: 'Muy grande' },
        reduceMotion: 'Reducir animaciones',
    },

    language: { label: 'Idioma' },

    // Frases de voz compartidas por Home y Tecnología.
    voice: {
        utterances: ['Siguiente página', 'Avanzar hoja'],
        result: 'Siguiente página',
        intent: 'misma intención: navegar → siguiente',
    },

    hero: {
        tagline: 'Aprende Braille a tu ritmo, con las manos, la voz y la pantalla.',
        seeProduct: 'Conoce el producto',
        words: ['hola', 'mano', 'toca', 'aula'],
    },

    statement: {
        aria: 'Qué es Braillearn',
        text: 'Braillearn es un display Braille de puntos grandes y una plataforma que te enseña a leer con las manos. En español, a tu ritmo y sin conocimientos técnicos.',
    },

    display: {
        eyebrow: 'El display',
        title: 'Puntos de 8 mm. Hechos para sentirse.',
        lead: 'Cada punto mide más de cinco veces lo que mide en el Braille estándar, para que cualquier yema pueda distinguirlo.',
        highlights: [
            { value: '8 mm', label: 'Puntos ampliados, muy por encima del umbral táctil de 5 mm.' },
            { value: '72 × 48 mm', label: 'Cada celda de seis puntos. Se conectan sin herramientas.' },
            { value: '$3,493 MXN', label: 'El sistema mínimo: la base y una celda. Crece cuando lo necesites.' },
        ],
    },

    platform: {
        eyebrow: 'La plataforma',
        title: 'Aprende a tu ritmo.',
        lead: 'Lecciones en español que se adaptan a ti, sin manuales ni capacitación previa.',
        previewTitle: 'Vista previa de la plataforma de aprendizaje',
        previewNote: 'Es la página principal real de la plataforma. La versión completa incluye cursos, mensajes para el display Braille y más.',
        features: [
            {
                title: 'Del abecedario a las palabras',
                text: 'Un camino que avanza contigo: primero reconoces cada letra, después lees y compones palabras.',
            },
            {
                title: 'En el display y en pantalla',
                text: 'Cada carácter aparece a la vez en los puntos y en la pantalla, así quien te acompaña puede seguirte.',
            },
            {
                title: 'Sonidos que celebran',
                text: 'Retroalimentación sonora y pequeños logros que hacen del aprendizaje algo que da ganas de repetir.',
            },
        ],
    },

    bento: {
        aria: 'Voz y accesibilidad',
        voice: {
            eyebrow: 'Voz',
            title: 'Háblale. Te entiende.',
            text: 'Navega por voz en español. No importa cómo lo digas: Braillearn entiende lo que quieres hacer.',
        },
        access: {
            eyebrow: 'Accesibilidad',
            title: 'Pensada para todas las personas.',
            text: 'Compatible con lectores de pantalla y con un panel para ajustar la plataforma a tu medida.',
            readersLabel: 'Lectores de pantalla compatibles',
            settings: ['Velocidad de la voz', 'Contraste visual', 'Tamaño de letra', 'Respuesta táctil del display'],
        },
    },

    modular: {
        eyebrow: 'Modular',
        title: 'Empieza con una celda. Crece hasta veinte.',
        lead: 'Una familia, una escuela o una clínica pueden empezar con poco y sumar celdas cuando lo necesiten.',
        cellsLabel: 'Número de celdas',
        readout: (cells, dots) => `${cells} ${cells === 1 ? 'celda' : 'celdas'} · ${dots} puntos`,
        minimum: { label: 'Sistema mínimo', detail: 'Base + 1 celda' },
        complete: { label: 'Sistema completo', detail: 'Base + 20 celdas · 120 puntos' },
        techLink: 'Conoce la tecnología',
    },

    contact: {
        title: '¿Quieres llevar Braillearn a tu escuela, clínica o familia?',
        text: 'Explora la plataforma hoy y cuéntanos qué necesitas: construimos el sistema celda por celda.',
        mail: 'Escríbenos',
    },

    footer: { note: 'Prototipo en fase de validación.' },

    problem: {
        eyebrow: 'La barrera',
        title: 'Un estándar pensado para yemas que ya no sienten.',
        lead: 'Aprender Braille no debería depender del dinero ni de la sensibilidad de tus dedos. Hoy depende de las dos.',
        stat: {
            text: 'de los mexicanos con diabetes desarrolla neuropatía periférica.',
            before: 'La neuropatía eleva el umbral de discriminación táctil por encima de los',
            threshold: '5 mm',
            after: '. Para estas personas, leer Braille de 1.5 mm equivale a leer con guantes.',
            source: 'Fuente',
            percentSpoken: ' por ciento',
        },
        photo: {
            label: 'Foto de usuario o comparativa',
            hint: 'Celda estándar de 1.5 mm junto a una celda Braillearn de 8 mm',
        },
        context: [
            { value: '18.3 %', label: 'de los adultos mexicanos vive con diabetes mellitus', source: 'ENSANUT 2022' },
            {
                value: '26.9 %',
                label: 'de las personas con discapacidad visual en México tiene entre 0 y 14 años',
                source: 'INEGI, 2020',
            },
            {
                value: 'USD 899–5,495',
                label: 'cuestan los displays Braille refrescables comerciales',
                source: 'Orbit Research, Humanware y Freedom Scientific, 2024–2025',
            },
        ],
        scale: {
            title: 'La solución empieza por el tamaño del punto.',
            lead: 'Los tres círculos están dibujados a escala real entre sí: 1 mm equivale al mismo largo en los tres.',
            items: [
                {
                    display: '1.5 mm',
                    title: 'Braille estándar',
                    note: 'Norma BANA / ONCE, pensada para sensibilidad táctil normal.',
                    verdict: 'Ilegible con neuropatía',
                },
                {
                    display: '> 5 mm',
                    title: 'Umbral de discriminación',
                    note: 'Por encima de esta distancia la lectura fluida del Braille estándar se vuelve imposible (Nakada & Dellon, 1989).',
                    verdict: 'Umbral con neuropatía',
                },
                {
                    display: '8 mm',
                    title: 'Braillearn',
                    note: 'Puntos ampliados que operan por encima del umbral y son discriminables para niñez en pre-alfabetización.',
                    verdict: 'Por encima del umbral',
                },
            ],
        },
        bridge: {
            eyebrow: 'Nuestra respuesta',
            title: 'Celdas macro de 72 × 48 mm con puntos de 8 mm.',
            text: 'Cada celda opera muy por encima del umbral de 5 mm y es lo bastante grande para que las yemas de una niña o un niño la distingan. Es el puente entre una barrera fisiológica y una solución de hardware que cualquier familia, escuela o clínica puede armar celda por celda.',
        },
        cell: {
            aria: 'Celda Braille interactiva de 6 puntos',
            dot: (n, raised) => `Punto ${n}, ${raised ? 'elevado' : 'retraído'}`,
            caption:
                'Toca los puntos. En el display real, un pulso de 50 ms eleva cada uno y el mecanismo lo mantiene en su lugar.',
        },
    },

    team: {
        eyebrow: 'Equipo',
        title: 'Ingeniería con un propósito claro.',
        lead: (faculty, university, advisor) =>
            `Estudiantes de la ${faculty} de la ${university}, con la asesoría de ${advisor}.`,
        photoAlt: 'Las tres personas del equipo Braillearn posan juntas, de noche, en una calle peatonal.',
        hint: 'Pasa el cursor o toca a cada integrante para ver su nombre y su área.',
        together: 'Cada integrante tiene su especialidad, pero todo el proyecto lo construimos en conjunto.',
        members: [
            {
                role: 'Ingeniería en Sistemas Computacionales',
            },
            {
                role: 'Ingeniería en Tecnologías de Software',
            },
            {
                role: 'Ingeniería en Mecatrónica',
            },
        ],
    },

    architecture: {
        eyebrow: 'Arquitectura',
        title: 'Hardware modular, diseñado para costar poco y consumir menos.',
        lead: 'Cada decisión de diseño responde a una restricción real: puntos que se sientan, celdas que se puedan comprar de una en una y una electrónica que un taller pueda reparar.',
        chainTitle: 'Cadena de señal',
        chain: [
            { tag: 'MCU', name: 'ESP8266 NodeMCU', note: 'Recibe por HTTP el texto ya traducido a puntos.' },
            { tag: 'REGISTROS', name: '74HC595 en daisy-chain', note: 'Extienden los pines para cientos de puntos.' },
            { tag: 'POTENCIA', name: 'MOSFET IRLZ44N', note: 'Con 2N2222A y diodo flyback 1N5408, en lógica inversa.' },
            { tag: 'ACTUADOR', name: 'Solenoide Ø 8 mm', note: 'Pulso de 50 ms y enclavamiento pasivo.' },
        ],
        specs: [
            {
                tag: 'ACTUACIÓN',
                title: 'Solenoides electromagnéticos',
                metric: 'Ø 8 mm',
                text: 'Bobinados a mano en cobre esmaltado de 24 AWG sobre núcleo impreso en PETG. Bajo costo unitario y fuerza suficiente con pulsos cortos.',
            },
            {
                tag: 'CONTROL',
                title: 'ESP8266 y registros de desplazamiento',
                metric: 'HTTP · Wi-Fi',
                text: 'Un solo microcontrolador gobierna toda la cadena de celdas. El firmware ajusta el barrido según cuántas celdas conectes.',
            },
            {
                tag: 'ENERGÍA',
                title: 'Enclavamiento pasivo',
                metric: '50 ms',
                text: 'Un pulso levanta el punto y el mecanismo de pluma retráctil lo mantiene elevado sin consumo continuo.',
            },
            {
                tag: 'COSTO',
                title: 'Manufactura optimizada',
                metric: '$6,315 MXN',
                text: 'Sistema completo de 20 celdas y 120 puntos: 24.1 % del display comercial más económico.',
            },
        ],
        cost: {
            eyebrow: 'Costo de acceso · MXN',
            title: 'El sistema completo cuesta 24.1 % del display comercial más económico.',
            rows: [
                { label: 'Braillearn · sistema mínimo', detail: 'BASE + 1 celda' },
                { label: 'Braillearn · sistema completo', detail: 'BASE + 20 celdas' },
                { label: 'Orbit Reader 40', detail: 'el display comercial más económico' },
                { label: 'Mediana comercial', detail: '15 dispositivos' },
                { label: 'Display comercial más caro', detail: 'de los 15 comparados' },
            ],
            note: 'Braillearn: costo de manufactura a mayoreo (LCSC y Alibaba, mayo 2026). Comerciales: precio de catálogo 2024–2025 de 15 dispositivos.',
        },
        modular: {
            eyebrow: 'Modelo modular',
            text: 'Se compra una BASE una sola vez y se agregan celdas cuando el presupuesto lo permite.',
            base: { label: 'BASE', note: 'Toda la electrónica de control y la estructura. Pago único.' },
            cell: { label: 'CELDA', note: 'Módulo mecánico de 6 puntos. Se agrega cuando se necesite.' },
        },
    },

    software: {
        eyebrow: 'Software',
        title: 'Una plataforma que entiende lo que quieres decir.',
        lead: 'El display es solo la mitad. La otra es un ecosistema web que enseña en español, habla con el hardware en tiempo real y no exige aprender comandos.',
        web: {
            label: 'Ecosistema web',
            title: 'Del navegador al solenoide',
            text: 'Cada carácter se muestra a la vez en el display físico y en pantalla, para que una persona tutora sin discapacidad visual pueda acompañar. Una API propia traduce el texto a puntos y se lo envía por HTTP al ESP8266.',
            techLabel: 'Tecnologías',
        },
        nlu: {
            label: 'Módulo NLU',
            title: 'Intención, no comandos',
            text: 'La clasificación por similitud de coseno no depende de las palabras exactas, sino de hacia dónde apunta el vector semántico.',
            illustrative: 'Ejemplo ilustrativo',
            score: '50/50',
            scoreText: 'intenciones acertadas (100 %) en la prueba controlada.',
        },
        access: {
            label: 'Accesibilidad',
            title: 'Requisito central, no un extra',
            text: 'Etiquetado semántico ARIA completo, compatible con lectores de pantalla, y navegación por voz en español con comandos como “siguiente”, “repetir” y “seleccionar”.',
            readersLabel: 'Lectores de pantalla compatibles',
            panelLabel: 'Panel de accesibilidad',
            settings: ['Velocidad de la voz', 'Contraste visual', 'Tamaño de fuente', 'Configuración táctil del hardware'],
        },
        status: {
            label: 'Estado del proyecto:',
            text: 'prototipo funcional con nivel básico-intermedio.',
            next: 'Siguiente etapa: pruebas con usuarias y usuarios finales.',
        },
    },

    history: {
        hero: {
            eyebrow: 'Nuestra historia',
            title: 'De un problema real a una medalla de oro.',
            lead: 'Braillearn nació para que aprender Braille no dependa del dinero ni de la sensibilidad de tus dedos. Así llegamos hasta aquí.',
            videoAria: 'Video: Braillearn, medalla de oro en Infomatrix México 2026',
            caption: 'Medalla de oro en Infomatrix México 2026, con pase a la final internacional en Tailandia.',
            fallback: 'Tu navegador no puede reproducir este video.',
        },
        labels: ['El problema', 'La barrera', 'Nuestra respuesta', 'Construirlo', 'Probarlo', 'Reconocimiento', 'Lo que sigue'],
        build: {
            title: 'Cada celda, hecha a mano.',
            text: 'Enrollamos 120 solenoides a mano, imprimimos los mecanismos en 3D y ensamblamos 20 celdas. Para el prototipo operamos 13, para demostrar que el sistema funciona igual sin importar cuántas conectes.',
            stats: ['celdas ensambladas', 'solenoides bobinados a mano', 'puntos independientes operativos'],
            galleryLabel: 'Fotos del proceso de construcción',
            photos: [
                'Piezas del mecanismo, impresas en 3D antes del ensamblaje.',
                'Un solenoide bobinado a mano.',
                'Una celda abierta: el solenoide y la pieza que mueve el punto.',
                'Las celdas impresas en 3D, ya con sus cables.',
                'La base modular donde se acomodan las celdas.',
                'Las tarjetas de control y el microcontrolador, cableados a mano.',
                'El taller: tarjetas, bobinas y cálculos en el pizarrón.',
                'Armando y probando un bloque de celdas.',
            ],
        },
        proof: {
            title: 'Probamos que funciona.',
            text: 'La plataforma funciona en nivel básico-intermedio, sin errores de navegación, y el módulo de lenguaje natural acertó las 50 intenciones de la prueba controlada.',
            stats: [
                { value: '50/50', label: 'intenciones acertadas en la prueba controlada' },
                { value: 'ARIA', label: 'compatible con NVDA, JAWS y VoiceOver' },
            ],
        },
        recognition: {
            title: 'Y el jurado lo reconoció.',
            text: 'Plata en Infomatrix 2025 (regional), oro en Infomatrix México 2026 (nacional) y ahora, rumbo a la final internacional.',
            items: [
                { when: '2025', title: 'Infomatrix regional', medal: 'Medalla de plata' },
                { when: '2026', title: 'Infomatrix México (nacional)', medal: 'Medalla de oro' },
                { when: 'Siguiente', title: 'Final internacional', medal: 'Tailandia' },
            ],
        },
        next: {
            title: 'Lo que sigue.',
            text: 'El prototipo sigue en validación. Estos son los próximos pasos.',
            items: [
                'Pruebas clínicas con usuarias y usuarios finales',
                'Currículo avanzado: gramática, oraciones y textos',
                'Conectores plug-and-play entre tarjetas, sin soldar',
                'Servicios independientes para escalar (microservicios)',
            ],
        },
    },

    community: {
        eyebrow: 'Comunidad',
        title: 'Dónde encontrar apoyo en Campeche.',
        lead: 'Instituciones y recursos para personas con discapacidad y sus familias. Si representas a una asociación de personas ciegas o con baja visión, queremos conocerte.',
        labels: { address: 'Dirección', phone: 'Teléfono', email: 'Correo', web: 'Sitio web', hours: 'Horario' },
        checked: (date) => `Información verificada el ${date}. Confírmala antes de acudir.`,
        orgs: {
            cree: {
                kind: 'DIF Campeche',
                description:
                    'Rehabilitación integral sin hospitalización para personas con discapacidad: consulta especializada, terapias física, ocupacional y de lenguaje, y apoyo paramédico.',
                hours: 'Lunes a viernes, de 6:30 a 20:00',
            },
            seinclusion: {
                kind: 'Gobierno del Estado',
                description:
                    'Dependencia estatal que ha impartido cursos del sistema Braille para personas con discapacidad visual, sus familias y docentes.',
            },
        },
        cta: {
            title: '¿Tu asociación no aparece?',
            text: 'Cuéntanos y con gusto la incluimos.',
            button: 'Contáctanos',
        },
    },

    tech: {
        solenoidPhoto: { label: 'Nuestro solenoide bobinado a mano, desarmado: varilla, bobina de cobre y carcasa con resorte.' },
        pulse: {
            aria: 'Gráfica: un pulso de corriente de 50 ms eleva el punto y este permanece elevado sin consumo',
            current: 'Corriente',
            dot: 'Punto',
            raised: 'Elevado',
            held: 'Sin consumo continuo',
        },
    },

    models: {
        display: { alt: 'Modelo 3D interactivo del display Braillearn completo. Arrástralo para girarlo.' },
        cell: { alt: 'Modelo 3D interactivo de una celda Braillearn. Arrástralo para girarlo.' },
        solenoid: { alt: 'Modelo 3D interactivo del solenoide y su mecanismo de enclavamiento. Arrástralo para girarlo.' },
        loading: 'Cargando modelo 3D…',
        error: 'No se pudo cargar el modelo 3D.',
        tabs: { label: 'Vista', model: '3D', photo: 'Foto' },
    },

    backend: {
        title: 'Arquitectura del backend',
        lead: 'Una sola API en FastAPI concentra la seguridad, las cuentas, la traducción a Braille y la comunicación con el display.',
        summary: 'Arquitectura del backend: los clientes de la API y el microcontrolador ESP se comunican con la API de Braillearn (FastAPI y SQLAlchemy). La API incluye middleware de seguridad, gestión de autenticación, comunicación con el dispositivo, traducción a Braille, plataforma de aprendizaje, transcripción, catálogo, emparejamiento de dispositivo, usuarios, gestión de documentos y un WebSocket de comandos. Usa una base de datos PostgreSQL y un servidor de almacenamiento de archivos.',
        client: { title: 'Cliente', text: 'Consumidor de API.' },
        esp: { title: 'ESP', text: 'Microcontrolador.' },
        api: { title: 'Braillearn API', text: 'FastAPI + SQLAlchemy' },
        database: { title: 'Base de datos', text: 'PostgreSQL.' },
        storage: { title: 'Almacenamiento de archivos', text: 'Servidor.' },
        modules: {
            security: { title: 'Middleware de seguridad', text: 'Rate limiter, validación de JWT y filtrado de bots.' },
            auth: { title: 'Gestor de autenticación', text: 'Tokens JWT.' },
            device: { title: 'Comunicación con el dispositivo', text: 'Configuración y navegación.' },
            braille: { title: 'Traducción a Braille', text: 'Traducción y conversión a posiciones.' },
            learning: { title: 'Plataforma de aprendizaje', text: 'Lecciones.' },
            transcription: { title: 'Transcripción', text: '' },
            catalog: { title: 'Catálogo', text: 'Acceso a documentos públicos.' },
            pairing: { title: 'Emparejamiento de dispositivo', text: 'Petición y confirmación.' },
            users: { title: 'Usuarios', text: 'Registro e inicio de sesión.' },
            documents: { title: 'Gestión de documentos', text: '' },
            websocket: { title: 'WebSocket /commands', text: 'Clasificación de intents.' },
        },
    },
};
