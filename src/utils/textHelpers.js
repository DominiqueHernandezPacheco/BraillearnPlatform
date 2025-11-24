import { braillePatterns } from '../constants/braillePatterns';

/**
 * Convierte una cadena de texto en un array de objetos para celdas Braille.
 * Maneja automáticamente el prefijo numérico.
 * * @param {string} text - El texto a convertir
 * @returns {Array} - Array de objetos { char: string, dots: boolean[] }
 */
export const textToBrailleCells = (text) => {
  const cells = [];
  let isNumber = false;

  for (const char of text) {
    const lowerChar = char.toLowerCase();
    const isCharDigit = lowerChar >= '0' && lowerChar <= '9';

    // 1. Si encontramos un número y no estábamos en modo número, agregamos el prefijo #
    if (isCharDigit && !isNumber) {
      cells.push({ char: '#', dots: braillePatterns['number_prefix'] });
      isNumber = true;
    }

    // 2. Si dejamos de ver números, desactivamos el modo número
    // (Nota: En Braille estricto, el espacio resetea el modo número, aquí lo simplificamos)
    if (!isCharDigit && isNumber && lowerChar !== '.' && lowerChar !== ',') {
      isNumber = false;
    }

    // 3. Buscar el patrón en el diccionario, si no existe, usar 'blank'
    const pattern = braillePatterns[lowerChar] || braillePatterns['blank'];
    
    cells.push({ char: lowerChar, dots: pattern });
  }

  return cells;
};