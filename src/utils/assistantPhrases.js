// Frases fijas del asistente "Braulio". Viven aquí para que la app las diga y
// el contexto de audio las tenga PRECARGADAS en memoria: así "Dime" y las
// confirmaciones suenan al instante en vez de esperar a la síntesis de voz.

export const PHRASES = {
    dime: 'Dime',
    ok: 'Listo.',
    adjusted: 'Listo, ajustado.',
    thinking: 'Un momento.',
    noMic: 'Ahora mismo no puedo escucharte con el teclado. Revisa el micrófono.',
    noSpeech: 'No escuché nada, inténtalo de nuevo.',
    panel: 'Aquí tienes el panel de accesibilidad.',
    resumeLesson: 'Retomando tu última lección.',
    noLesson: 'Todavía no tienes ninguna lección guardada. Aquí están tus cursos.',
    openModule: 'Listo, abriendo ese módulo.',
    authError:
        'Ahora no puedo responder preguntas abiertas porque mi conexión con Claude no está lista. Los comandos como ir a cursos sí funcionan.',
    genericError: 'Tuve un problema para responder eso, inténtalo de nuevo.',
};

export const NAV_CONFIRMATIONS = {
    plataforma: 'Listo, aquí tienes el inicio.',
    cursos: 'Listo, aquí tienes tus cursos.',
    mensajes: 'Listo, aquí puedes escribir un mensaje para el display.',
};

// Todo lo que se precarga al abrir la app.
export const PRELOAD_PHRASES = [...Object.values(PHRASES), ...Object.values(NAV_CONFIRMATIONS)];
