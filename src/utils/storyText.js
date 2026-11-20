// Parte el texto de una escena en oraciones, con su posición en el texto, para
// narrar y para iluminar la oración que se está diciendo. Se usa también al
// pregenerar la voz (scripts/tts-pregenerate.mjs), para que lo que se
// pregenera sea exactamente lo que se dice.
export function splitSentences(text) {
    const sentences = [];
    const re = /[^.!?]+[.!?]*/g;
    let match;
    while ((match = re.exec(text)) !== null) {
        const body = match[0].trim();
        if (!body) continue;
        const start = match.index + (match[0].length - match[0].trimStart().length);
        sentences.push({ text: body, start, end: start + body.length });
    }
    return sentences;
}
