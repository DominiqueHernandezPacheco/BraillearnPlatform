// Datos estructurales y cifras de la landing. Todo número sale del Reporte Avanzado
// Científico de Braillearn (ID 35548); si una cifra cambia en el reporte, cámbiala
// aquí. Los TEXTOS viven en src/landing/i18n/dictionaries/ (uno por idioma).

export const site = {
    // Ruta de la plataforma de aprendizaje (la app principal): vive aparte, en /plataforma/.
    platformUrl: 'plataforma/',
    // Déjalo vacío para ocultar el botón de correo hasta tener uno público.
    contactEmail: '',
    year: 2026,
};

// Páginas de la landing (cada una es un .html; ver vite.config.js).
export const pages = {
    home: './',
    tecnologia: 'tecnologia.html',
    historia: 'historia.html',
    comunidad: 'comunidad.html',
    // Vista previa de la plataforma (solo su página principal), para el marco del home.
    platformDemo: 'platform-demo.html',
};

// `id` es también la clave del texto en `t.nav`.
export const navLinks = [
    { id: 'producto', href: `${pages.home}#producto`, page: 'home' },
    { id: 'tecnologia', href: pages.tecnologia, page: 'tecnologia' },
    { id: 'historia', href: pages.historia, page: 'historia' },
    { id: 'comunidad', href: pages.comunidad, page: 'comunidad' },
    { id: 'contacto', href: '#contacto', page: null },
];

// Nombres propios: no se traducen.
export const advisor = 'Joel Cristoper Flores Escalante';
export const faculty = 'Facultad de Ingeniería';
export const university = 'Universidad Autónoma de Campeche';

// ── Home ────────────────────────────────────────────────────────────────────
// Para usar un video de bienvenida a pantalla completa, pon aquí su ruta (mp4/webm
// en /public). Con `src` vacío se muestran las celdas animadas.
export const heroVideo = { src: '', poster: '' };

export const modular = {
    maxCells: 20,
    dotsPerCell: 6,
    minimum: 3493.01,
    complete: 6315.45,
};

// ── Problema ────────────────────────────────────────────────────────────────
export const neuropathy = {
    percent: 68.7,
    source: 'Yovera-Aldana et al., PLOS ONE, 2021',
};

// Diámetros de punto en mm, para dibujarlos a escala real. `ok`: true = por
// encima del umbral, false = por debajo, null = el umbral mismo.
export const dotScale = [
    { mm: 1.5, ok: false },
    { mm: 5, ok: null },
    { mm: 8, ok: true },
];

export const cellSpec = { widthMm: 48, heightMm: 72, dotMm: 8 };

// ── Arquitectura ────────────────────────────────────────────────────────────
export const specIcons = ['magnet', 'cpu', 'timer', 'coins'];

// Precio total de acceso (MXN). Braillearn: mayoreo LCSC/Alibaba, mayo 2026.
// Comerciales: precio de catálogo 2024–2025 (15 dispositivos).
export const costComparison = [
    { value: 3493.01, ours: true },
    { value: 6315.45, ours: true },
    { value: 26232.5, ours: false },
    { value: 50400, ours: false },
    { value: 105000, ours: false },
];

export const modularCost = { base: 3279.82, cell: 213.19 };

// ── Software ────────────────────────────────────────────────────────────────
export const stack = ['React', 'Electron', 'FastAPI', 'PostgreSQL', 'WebSockets', 'API REST', 'Web Speech API'];
export const readers = ['NVDA', 'JAWS', 'VoiceOver'];

// ── Equipo ──────────────────────────────────────────────────────────────────
export const team = [
    { name: 'Christian Dominique Hernández Pacheco', short: 'Christian Dominique', initials: 'CD' },
    { name: 'Valeria de los Ángeles Lee Almeyda', short: 'Valeria Lee', initials: 'VL' },
    { name: 'María Fernanda Rincon Chan', short: 'María Fernanda Rincon', initials: 'MR' },
];

// ── Historia ────────────────────────────────────────────────────────────────
// Video de la medalla de oro en Infomatrix México 2026 (Vite lo empaqueta y le
// pone hash; se reemplaza cambiando el archivo en ./assets).
import infomatrixVideo from './assets/infomatrix-2026.mp4';
// `startAt`: segundo en que arranca. La grabación es de la ceremonia y los primeros
// ~7 s son el anuncio de otro equipo; desde el segundo 8 aparece la diapositiva
// "ORO – PIST Tailandia – 35548 Braillearn". Pon 0 para ver el video completo.
export const historiaVideo = { src: infomatrixVideo, startAt: 8 };

// Cifras de la construcción del prototipo (reporte, sección 4.4).
export const buildStats = [20, 120, 78];

// ── Comunidad ───────────────────────────────────────────────────────────────
// Instituciones verificadas en sus sitios oficiales. Los textos (tipo, descripción,
// horario) viven en los diccionarios, con la misma `id`. Para agregar una asociación
// de personas ciegas: añade un objeto aquí y su entrada en `community.orgs` de cada
// diccionario. VUELVE A VERIFICAR teléfonos y direcciones antes de publicar.
export const communityChecked = '2026-09-19';
export const communityOrgs = [
    {
        id: 'cree',
        name: 'Centro de Rehabilitación y Educación Especial de Campeche “Profra. Elsa María San Román de Sansores”',
        address:
            'Av. Ejército Mexicano, Av. Héroes de Nacozari y Av. Colosio, entre Av. Gobernadores, Barrio de Santa Ana, C.P. 24050, Campeche, Camp.',
        phones: [
            { label: '98181 61310', tel: '+529818161310' },
            { label: '98181 62169', tel: '+529818162169' },
        ],
        email: 'cree@difcampeche.gob.mx',
        url: 'https://difcampeche.gob.mx/centro-rehabilitacion-y-educacion-especial-cree/',
    },
    {
        id: 'seinclusion',
        name: 'Secretaría de Inclusión del Estado de Campeche',
        url: 'https://inclusion.campeche.gob.mx/',
    },
];

// ── Fotos ───────────────────────────────────────────────────────────────────
// Construcción (capítulo "Construirlo"): en el orden en que se cuentan. El texto de
// cada pie está en `history.build.photos`, en el mismo orden. `w` y `h` son las
// medidas reales, para reservar el espacio y evitar saltos al cargar.
import photoPiezas from './assets/photos/build-piezas.webp';
import photoSolenoide from './assets/photos/build-solenoide.webp';
import photoCelda from './assets/photos/build-celda.webp';
import photoCeldas from './assets/photos/build-celdas.webp';
import photoBase from './assets/photos/build-base.webp';
import photoTarjetas from './assets/photos/build-tarjetas.webp';
import photoTaller from './assets/photos/build-taller.webp';
import photoArmado from './assets/photos/build-armado.webp';

export const buildPhotos = [
    { id: 'piezas', src: photoPiezas, w: 1050, h: 1400 },
    { id: 'solenoide', src: photoSolenoide, w: 1050, h: 1400 },
    { id: 'celda', src: photoCelda, w: 1050, h: 1400 },
    { id: 'celdas', src: photoCeldas, w: 788, h: 1400 },
    { id: 'base', src: photoBase, w: 423, h: 317 },
    { id: 'tarjetas', src: photoTarjetas, w: 423, h: 227 },
    { id: 'taller', src: photoTaller, w: 788, h: 1400 },
    { id: 'armado', src: photoArmado, w: 788, h: 1400 },
];

// Equipo: una foto y, sobre cada persona, una zona que se selecciona al acercarse.
// `member` es el índice en `team`; `box` está en % de la foto (de izquierda a derecha).
// Orden en la foto, de izquierda a derecha: Christian, María Fernanda y Valeria.
import teamPhotoSrc from './assets/photos/team.webp';

export const teamPhoto = { src: teamPhotoSrc, w: 1050, h: 1400 };
export const teamHotspots = [
    { member: 0, box: { left: 24.5, top: 41.5, width: 21, height: 37 } },
    { member: 2, box: { left: 44.5, top: 44, width: 12, height: 34 } },
    { member: 1, box: { left: 56.5, top: 41, width: 21, height: 40 } },
];
