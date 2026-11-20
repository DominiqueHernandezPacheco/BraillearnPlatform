// Biblioteca de cuentos. Solo obras de DOMINIO PÚBLICO (en México: autor fallecido
// hace más de 100 años) y adaptaciones propias en español: las traducciones
// modernas tienen derechos, por eso los textos están escritos aquí.
//
// Los textos solo usan signos que el Braille del display sabe mostrar:
// letras (con tildes, ñ, ü), números y  . , ? ¿ ! ¡   — nada de comillas,
// rayas, dos puntos ni paréntesis.
//
// Cada escena es un fragmento que se narra de corrido. Puede llevar `cues`:
// efectos que suenan justo al llegar a una oración de la escena:
//   at      número de oración (0 = al empezar la escena)
//   sfx     efecto de sonido (ver src/utils/storySfx.js)
//   haptic  efecto de vibración para el módulo háptico (ver hapticsService.js)
// Al escuchar, el cue suena cuando Braulio llega a esa oración; con los dedos,
// cuando el display llega a ese punto del texto.
//
// cover: { icon, tone } — el icono se resuelve en StoryCover.jsx.
// theme (de cada estante): 'clasico' cambia el bosque por un ambiente más sobrio.

export const SHELVES = [
    { id: 'peques', title: 'Para los más peques', blurb: 'Cuentos cortos, con sonidos y vibraciones.' },
    { id: 'clasicos', title: 'Clásicos', blurb: 'Obras de dominio público, para lectores más grandes.', theme: 'clasico' },
];

export const STORIES = [
    {
        id: 'tres-cerditos',
        shelf: 'peques',
        title: 'Los tres cerditos',
        author: 'Cuento popular',
        source: 'Cuento popular, adaptación propia',
        cover: { icon: 'House', tone: 'sun' },
        scenes: [
            { text: 'Había una vez tres cerditos que vivían con su mamá. Un día, ya grandes, salieron a construir cada uno su casita.', cues: [{ at: 0, sfx: 'cerditos' }] },
            { text: 'El primer cerdito hizo su casa de paja. Fue muy rápido y se fue a jugar.', cues: [{ at: 1, sfx: 'risa' }] },
            { text: 'El segundo cerdito hizo su casa de palos. También terminó pronto y se puso a cantar.' },
            { text: 'El tercer cerdito trabajó con calma y construyó su casa con ladrillos. Le costó mucho, pero quedó muy fuerte.', cues: [{ at: 0, sfx: 'golpe', haptic: 'toctoc' }] },
            { text: 'Una noche llegó el lobo feroz. Toc, toc, toc. Cerdito, cerditito, déjame entrar.', cues: [{ at: 0, sfx: 'aullido' }, { at: 1, sfx: 'golpe', haptic: 'toctoc' }] },
            { text: 'No, no, no, por el pelo de mi barbilla. Entonces soplaré y soplaré, y tu casa derribaré.', cues: [{ at: 1, sfx: 'viento', haptic: 'soplo' }] },
            { text: 'Fuuuu. El lobo sopló y la casa de paja voló por los aires. El primer cerdito corrió a la casa de palos.', cues: [{ at: 0, sfx: 'viento', haptic: 'soplo' }] },
            { text: 'El lobo sopló otra vez, y la casa de palos también cayó. Los dos cerditos corrieron a la casa de ladrillos.', cues: [{ at: 0, sfx: 'viento', haptic: 'soplo' }] },
            { text: 'Esta vez el lobo sopló y sopló, pero la casa de ladrillos no se movió ni un poquito. Estaba muy bien hecha.', cues: [{ at: 0, sfx: 'viento', haptic: 'soplo' }] },
            { text: 'El lobo se cansó y se fue corriendo al bosque, y nunca más volvió. Los tres cerditos vivieron muy felices. Fin.', cues: [{ at: 0, sfx: 'galope', haptic: 'pasos' }, { at: 2, sfx: 'campana', haptic: 'campana' }] },
        ],
    },
    {
        id: 'patito-feo',
        shelf: 'peques',
        title: 'El patito feo',
        author: 'Hans Christian Andersen',
        source: 'Hans Christian Andersen (1805-1875), adaptación propia',
        cover: { icon: 'Bird', tone: 'brand' },
        scenes: [
            { text: 'Una mañana de primavera nació un patito diferente a sus hermanos. Era más grande y de plumas grises.', cues: [{ at: 0, sfx: 'amanecer' }] },
            { text: 'Los demás patos se burlaban de él. Qué patito tan feo, decían. El patito se sentía muy triste.', cues: [{ at: 0, sfx: 'patos' }, { at: 1, sfx: 'burla' }] },
            { text: 'Una noche se escapó del corral y caminó solo por el campo. Llovía y hacía mucho frío.', cues: [{ at: 0, sfx: 'grillos' }, { at: 1, sfx: 'lluvia', haptic: 'lluvia' }] },
            { text: 'Pasó el invierno entre el hielo y la nieve. Por fin llegó la primavera y el sol volvió a brillar.', cues: [{ at: 0, sfx: 'viento', haptic: 'soplo' }, { at: 1, sfx: 'amanecer' }] },
            { text: 'Un día vio unos cisnes blancos y hermosos nadando en el lago. Se acercó con miedo, pensando que se reirían de él.', cues: [{ at: 0, sfx: 'agua' }] },
            { text: 'Pero al mirar el agua vio su reflejo. Ya no era un patito gris. Era un cisne muy bello.', cues: [{ at: 0, sfx: 'agua' }, { at: 2, sfx: 'magia', haptic: 'magia' }] },
            { text: 'Los otros cisnes lo recibieron con cariño. El patito ya no estaba solo, y por fin supo que había sido un cisne desde siempre. Fin.', cues: [{ at: 0, sfx: 'pajaros' }, { at: 2, sfx: 'campana', haptic: 'campana' }] },
        ],
    },
    {
        id: 'liebre-tortuga',
        shelf: 'peques',
        title: 'La liebre y la tortuga',
        author: 'Esopo',
        source: 'Fábula de Esopo (siglo VI a. C.), adaptación propia',
        cover: { icon: 'Turtle', tone: 'good' },
        scenes: [
            { text: 'Una liebre muy veloz se reía de una tortuga. Qué lenta eres, le decía todos los días.', cues: [{ at: 0, sfx: 'risa' }] },
            { text: 'La tortuga no se enojó. Un día le dijo, vamos a hacer una carrera, y yo te ganaré.' },
            { text: 'La liebre se rió muchísimo, pero aceptó. Todos los animales del bosque llegaron a verlos. Uno, dos, tres, ya.', cues: [{ at: 0, sfx: 'risa' }, { at: 2, sfx: 'silbato', haptic: 'campana' }] },
            { text: 'La liebre salió como un rayo y dejó muy atrás a la tortuga. Se sentó bajo un árbol a descansar. Total, pensó, tengo tiempo de sobra.', cues: [{ at: 0, sfx: 'galope', haptic: 'pasos' }] },
            { text: 'La liebre se quedó dormida. Mientras tanto, la tortuga seguía caminando, paso a paso, sin parar.', cues: [{ at: 0, sfx: 'grillos' }, { at: 1, sfx: 'pasos', haptic: 'pasos' }] },
            { text: 'Cuando la liebre despertó, vio a la tortuga cerca de la meta. Corrió con todas sus fuerzas, pero ya era tarde.', cues: [{ at: 1, sfx: 'galope', haptic: 'pasos' }] },
            { text: 'La tortuga cruzó la meta primero. Todos aplaudieron. Despacio y con constancia se llega lejos. Fin.', cues: [{ at: 1, sfx: 'aplausos' }, { at: 3, sfx: 'campana', haptic: 'campana' }] },
        ],
    },
    {
        id: 'quijote',
        shelf: 'clasicos',
        title: 'Don Quijote de la Mancha',
        author: 'Miguel de Cervantes',
        source: 'Miguel de Cervantes (1547-1616), comienzo del capítulo 1, ortografía actualizada',
        cover: { icon: 'Swords', tone: 'wine' },
        scenes: [
            { text: 'En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.', cues: [{ at: 0, sfx: 'viento' }] },
            { text: 'Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lentejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda.' },
            { text: 'Frisaba la edad de nuestro hidalgo con los cincuenta años. Era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza.', cues: [{ at: 0, sfx: 'amanecer' }] },
            { text: 'Es, pues, de saber, que este sobredicho hidalgo, los ratos que estaba ocioso, que eran los más del año, se daba a leer libros de caballerías con tanta afición y gusto, que olvidó casi de todo punto el ejercicio de la caza.' },
            { text: 'En resolución, él se enfrascó tanto en su lectura, que se le pasaban las noches leyendo de claro en claro y los días de turbio en turbio, y así, del poco dormir y del mucho leer, se le secó el cerebro, de manera que vino a perder el juicio.', cues: [{ at: 0, sfx: 'grillos' }] },
        ],
    },
    {
        id: 'alicia',
        shelf: 'clasicos',
        title: 'Alicia en el País de las Maravillas',
        author: 'Lewis Carroll',
        source: 'Lewis Carroll (1832-1898), adaptación propia del comienzo',
        cover: { icon: 'Sparkles', tone: 'night' },
        scenes: [
            { text: 'Alicia estaba sentada junto a su hermana en la orilla del río, muy aburrida. De pronto, un conejo blanco pasó corriendo a su lado.', cues: [{ at: 0, sfx: 'agua' }, { at: 1, sfx: 'galope', haptic: 'pasos' }] },
            { text: 'El conejo llevaba un reloj en el chaleco. Qué tarde se me hace, qué tarde se me hace, decía. Alicia, muy curiosa, lo siguió.', cues: [{ at: 0, sfx: 'reloj' }] },
            { text: 'El conejo se metió en una madriguera y Alicia entró tras él. Cayó, cayó y cayó por un pozo larguísimo, tan despacio que pudo mirar a su alrededor.', cues: [{ at: 1, sfx: 'caida', haptic: 'soplo' }] },
            { text: 'Al final aterrizó sobre un montón de hojas secas. Se encontraba en un lugar muy extraño, lleno de puertas pequeñas. Así comenzó su viaje por el País de las Maravillas.', cues: [{ at: 1, sfx: 'puerta' }, { at: 2, sfx: 'magia', haptic: 'magia' }] },
        ],
    },
];

export const getStory = (id) => STORIES.find((s) => s.id === id);

// 'infantil' (bosque) o 'clasico' (estudio nocturno), según el estante del cuento.
export const themeOf = (story) => SHELVES.find((sh) => sh.id === story.shelf)?.theme ?? 'infantil';
