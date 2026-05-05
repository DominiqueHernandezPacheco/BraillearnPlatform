/**
 * Notas musicales usadas en el feedback de audio de la plataforma.
 * Centralizar aquí evita literales dispersos y facilita ajustar el diseño sonoro.
 */
export const NOTES = {
    // Nota base para cada punto Braille (ritmo de celda)
    DOT: 'G4',

    // Navegación de páginas en el simulador
    NAV_NEXT: 'C4',
    NAV_PREV: 'G3',

    // Melodía de módulo completado (se toca en secuencia)
    FINISH_1: 'C5',
    FINISH_2: 'E5',
    FINISH_3: 'G5',

    // Feedback de respuesta correcta / incorrecta
    CORRECT:   'G5',
    INCORRECT: 'C3',

    // Activar / desactivar un punto en el constructor
    DOT_TOGGLE: 'C4',

    // Nota del espacio en el patrón Braille
    SPACE: 'C2',
};
