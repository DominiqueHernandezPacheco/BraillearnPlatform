/**
 * Notas musicales usadas en el feedback de audio de la plataforma.
 * Centralizar aquí evita literales dispersos y facilita ajustar el diseño sonoro.
 *
 * Diseño cálido, no "de videojuego retro": notas dentro de un mismo acorde
 * (do mayor), ondas suaves (triangular/senoidal, nunca ruido) y volúmenes e
 * intervalos discretos — ver useBrailleSound.js y context/AudioContext.jsx.
 */
export const NOTES = {
    // Nota base para cada punto Braille (ritmo de celda): un toque suave
    DOT: 'A4',
    // Punto ausente: un tic grave y breve — antes era ruido blanco (sonaba a
    // estática), ahora es solo una nota baja y corta, más cálida. A3 (no A2):
    // A2 es tan grave que muchas bocinas pequeñas casi no lo reproducen y se
    // percibe como silencio, rompiendo el ritmo de la celda.
    NO_DOT: 'A3',

    // Navegación de páginas
    NAV_NEXT: 'E5',
    NAV_PREV: 'C5',

    // Melodía de módulo completado (arpegio ascendente, como un logro)
    FINISH_1: 'C5',
    FINISH_2: 'E5',
    FINISH_3: 'G5',

    // Acierto: dos notas cortas ascendentes ("ding-ding" cálido) — ver playCorrect()
    CORRECT_1: 'E5',
    CORRECT_2: 'G5',
    // Error: una sola nota grave y suave — un aviso, no un "buzzer" — ver playIncorrect()
    INCORRECT: 'D3',

    // Activar/desactivar un punto en el constructor
    DOT_TOGGLE: 'E5',

    // Nota del espacio en el patrón Braille
    SPACE: 'A2',
};
