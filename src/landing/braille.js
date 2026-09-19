// Alfabeto Braille latino (6 puntos). Numeración estándar: 1-3 columna izquierda de
// arriba abajo, 4-6 columna derecha.
const LETTERS = {
    a: [1], b: [1, 2], c: [1, 4], d: [1, 4, 5], e: [1, 5], f: [1, 2, 4], g: [1, 2, 4, 5],
    h: [1, 2, 5], i: [2, 4], j: [2, 4, 5], k: [1, 3], l: [1, 2, 3], m: [1, 3, 4],
    n: [1, 3, 4, 5], o: [1, 3, 5], p: [1, 2, 3, 4], q: [1, 2, 3, 4, 5], r: [1, 2, 3, 5],
    s: [2, 3, 4], t: [2, 3, 4, 5], u: [1, 3, 6], v: [1, 2, 3, 6], w: [2, 4, 5, 6],
    x: [1, 3, 4, 6], y: [1, 3, 4, 5, 6], z: [1, 3, 5, 6],
};

// Celdas de una palabra: `{ dots: Set, label }` por cada una. Acepta una cadena
// (alfabeto latino) o una lista de celdas explícitas `[puntos, etiqueta]` para
// sistemas no latinos, como el Braille coreano.
export function wordToCells(word) {
    if (typeof word === 'string') {
        return [...word].map((char) => ({ dots: new Set(LETTERS[char.toLowerCase()] ?? []), label: char }));
    }
    return word.map(([dots, label]) => ({ dots: new Set(dots), label }));
}

// Posición de un punto dentro de la celda: columna 0/1 y fila 0-2.
export const dotPosition = (n) => ({ col: n > 3 ? 1 : 0, row: (n - 1) % 3 });
