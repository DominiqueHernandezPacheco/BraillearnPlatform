// Réplica en el navegador de cómo el backend (braille_translate) convierte un
// texto a celdas y las reparte en líneas de N celdas. Sirve para dos cosas:
//   · el display SIMULADO muestra exactamente lo que haría el real;
//   · con el display real, saber qué parte del texto hay en cada línea para
//     iluminarla (el backend solo informa el número de línea).
//
// Reglas del backend que se respetan:
//   · cada mayúscula lleva una celda de prefijo antes de la letra;
//   · los números llevan un prefijo al empezar la secuencia de dígitos;
//   · cada "palabra" (la puntuación cuenta como palabra aparte) va seguida de
//     una celda vacía;
//   · ¿ ¡ ( ) ocupan dos celdas;
//   · las líneas se cortan cada N celdas exactas, aunque sea a media palabra.
// Diferencia a propósito: el backend no conoce la ñ (la descarta); aquí sí se
// traduce, que es lo correcto.

const L = {
    a: [1], b: [1, 2], c: [1, 4], d: [1, 4, 5], e: [1, 5], f: [1, 2, 4], g: [1, 2, 4, 5], h: [1, 2, 5],
    i: [2, 4], j: [2, 4, 5], k: [1, 3], l: [1, 2, 3], m: [1, 3, 4], n: [1, 3, 4, 5], o: [1, 3, 5],
    p: [1, 2, 3, 4], q: [1, 2, 3, 4, 5], r: [1, 2, 3, 5], s: [2, 3, 4], t: [2, 3, 4, 5], u: [1, 3, 6],
    v: [1, 2, 3, 6], w: [2, 4, 5, 6], x: [1, 3, 4, 6], y: [1, 3, 4, 5, 6], z: [1, 3, 5, 6],
    á: [1, 2, 3, 5, 6], é: [2, 3, 4, 6], í: [3, 4], ó: [2, 4, 6], ú: [2, 3, 4, 5, 6], ü: [1, 2, 5, 6],
    ñ: [1, 2, 4, 5, 6],
    ',': [2], ';': [2, 3], ':': [2, 5], '.': [2, 5, 6], '?': [2, 3, 6], '!': [2, 3, 5],
    "'": [3], '"': [2, 3, 5, 6], '–': [3, 6],
};

const DIGITS = { 1: [1], 2: [1, 2], 3: [1, 4], 4: [1, 4, 5], 5: [1, 5], 6: [1, 2, 4], 7: [1, 2, 4, 5], 8: [1, 2, 5], 9: [2, 4], 0: [2, 4, 5] };

const CAPITAL = [6];
const NUMBER = [3, 4, 5, 6];

const TWO_CELLS = {
    '¿': [[5, 6], [2, 6]],
    '¡': [[5, 6], [1, 2, 6]],
    '(': [[5, 6], [1, 2, 6]],
    ')': [[5, 6], [3, 4, 5]],
};

const cell = (dots, index, char) => ({ dots, src: [index, index + 1], char });

// Celdas de un carácter. `inNumber` indica si venimos de una secuencia de dígitos.
function translateChar(ch, index, inNumber) {
    if (/[0-9]/.test(ch)) {
        const cells = inNumber ? [cell(DIGITS[ch], index, ch)] : [cell(NUMBER, index, '#'), cell(DIGITS[ch], index, ch)];
        return { cells, inNumber: true };
    }
    const lower = ch.toLowerCase();
    if (ch !== lower) {
        const base = translateChar(lower, index, false).cells;
        return { cells: [cell(CAPITAL, index, ''), ...base], inNumber: false };
    }
    if (TWO_CELLS[ch]) {
        return { cells: TWO_CELLS[ch].map((dots, i) => cell(dots, index, i === 1 ? ch : '')), inNumber: false };
    }
    if (L[ch]) return { cells: [cell(L[ch], index, ch)], inNumber: false };
    return { cells: [], inNumber: false }; // el backend descarta lo que no conoce
}

// Palabras con su posición en el texto, separando la puntuación como lo hace
// el tokenizador del backend (nltk): los signos pegados a una palabra pasan a
// ser "palabras" aparte; ¿ y ¡ se quedan pegados a la palabra que abren.
function tokenize(text) {
    const tokens = [];
    const re = /\S+/g;
    let match;
    while ((match = re.exec(text)) !== null) {
        let start = match.index;
        let end = start + match[0].length;
        while (end > start && /[("'[{«“]/.test(text[start])) {
            tokens.push([start, start + 1]);
            start += 1;
        }
        const trailing = [];
        while (end > start && /[,.;:?!)"'\]}»”]/.test(text[end - 1])) {
            let from = end - 1;
            if (text[from] === '.') while (from > start && text[from - 1] === '.') from -= 1;
            trailing.unshift([from, end]);
            end = from;
        }
        if (end > start) tokens.push([start, end]);
        tokens.push(...trailing);
    }
    return tokens;
}

// Texto -> celdas, cada una con el rango de texto (`src`) del que viene.
// Las celdas vacías (separadores) no tienen `src`.
export function translateToCells(text) {
    const cells = [];
    for (const [start, end] of tokenize(text)) {
        let inNumber = false;
        for (let i = start; i < end; i += 1) {
            const result = translateChar(text[i], i, inNumber);
            inNumber = result.inNumber;
            cells.push(...result.cells);
        }
        cells.push({ dots: [], src: null, char: '' });
    }
    cells.pop();
    return cells;
}

export function chunkCells(cells, perLine) {
    const n = Math.max(1, perLine | 0);
    const lines = [];
    for (let i = 0; i < cells.length; i += n) lines.push(cells.slice(i, i + n));
    return lines;
}

// Rango [inicio, fin) del texto original que cubre una línea (o null si es vacía).
export function lineRange(line) {
    if (!line) return null;
    let start = Infinity;
    let end = -1;
    for (const c of line) {
        if (!c.src) continue;
        start = Math.min(start, c.src[0]);
        end = Math.max(end, c.src[1]);
    }
    return end < 0 ? null : [start, end];
}

export const dotsToBools = (dots) => [1, 2, 3, 4, 5, 6].map((n) => dots.includes(n));

export const linesFor = (text, perLine) => chunkCells(translateToCells(text), perLine);
