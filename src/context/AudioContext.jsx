import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { PRELOAD_PHRASES } from '../utils/assistantPhrases';
import { useAccessibility } from './AccessibilityContext';

const AudioContext = createContext();

// Fase 3: la voz de Braulio ahora es Piper (local, offline) en vez del
// motor del navegador — mucho más natural. Si Piper no está disponible por
// alguna razón (todavía descargando la primera vez, plataforma sin el
// binario, error de red), cae de vuelta a speechSynthesis del navegador
// para que la app nunca se quede muda.
async function requestSpeech(text, voiceId, rate) {
    if (window.electronAPI?.synthesizeSpeech) {
        const result = await window.electronAPI.synthesizeSpeech(text, voiceId, rate);
        if (result?.error) throw new Error(result.error);
        return new Blob([result.audio], { type: result.mime || 'audio/wav' });
    }
    const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId, rate }),
    });
    if (!res.ok) throw new Error(`El servidor de voz respondió ${res.status}`);
    return res.blob();
}

// Frases cortas ya sintetizadas, en memoria: "Dime" y las confirmaciones se
// repiten mucho y así suenan al instante (sin viaje a Electron ni al servidor).
// También guarda las que todavía se están generando (la promesa), para que
// pedir por adelantado la siguiente oración de un cuento no genere dos veces
// lo mismo si justo después se pide hablarla.
const SHORT_PHRASE_MAX = 400;
const PHRASE_CACHE_MAX = 120;
const phraseCache = new Map();

function synthesizeWithPiper(text, voiceId, rate) {
    const cacheable = !voiceId && text.length <= SHORT_PHRASE_MAX;
    const key = `${rate}|${text}`;
    if (cacheable && phraseCache.has(key)) return phraseCache.get(key);

    const pending = requestSpeech(text, voiceId, rate);
    if (cacheable) {
        phraseCache.set(key, pending);
        pending.catch(() => phraseCache.delete(key));
        if (phraseCache.size > PHRASE_CACHE_MAX) phraseCache.delete(phraseCache.keys().next().value);
    }
    return pending;
}

export const AudioProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    // Ajuste APARTE de isMuted: silencia solo los efectos de sonido de la
    // interfaz (aciertos/errores, tap de botones), no la voz de Braulio.
    const { soundEffects } = useAccessibility() ?? {};
    const [isSpeaking, setIsSpeaking] = useState(false); // Braulio está hablando ahora mismo
    // Distinto de isSpeaking: un turno (p.ej. contestar una pregunta con
    // varias oraciones encoladas) sigue "activo" incluso en el hueco entre
    // una oración y la siguiente, mientras se sintetiza la voz de la próxima
    // — ahí isSpeaking ya volvió a false por un instante. Si el motor de voz
    // local dejara de considerarlo "hablando" justo en ese hueco, podría
    // detectar "Braulio" (o escucharse a sí mismo) mientras sigue en plena
    // respuesta. Ver beginAssistantTurn / finalizeEndTurn.
    const [turnActive, setTurnActive] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]);
    const synthRef = useRef(window.speechSynthesis);
    const currentAudioRef = useRef(null); // el <audio> de Piper que esté sonando
    // Sube en cada speak(): si una síntesis vieja resuelve DESPUÉS de que ya
    // se pidió hablar de nuevo, se descarta en vez de reproducirse encima de
    // la nueva — sin esto, dos audios solapados sonaban como eco.
    const speakTokenRef = useRef(0);

    // Una bocina o unos audífonos Bluetooth que llevan rato sin sonar se
    // "duermen" y se tragan el primer segundo de lo que suene después: una
    // frase corta ("Estás en Mensajes.") se perdía entera, mientras que una
    // larga solo perdía el inicio. Si la salida lleva callada más de
    // OUTPUT_IDLE_MS, antes de hablar se emite un instante de señal inaudible
    // (WAKE_LEAD_MS) para despertarla. Corre en paralelo a la síntesis de la
    // voz, así casi no añade espera.
    const OUTPUT_IDLE_MS = 20000;
    const WAKE_LEAD_MS = 600;
    const lastSoundAtRef = useRef(0);
    const wakeCtxRef = useRef(null);
    const wakeOutput = useCallback(() => {
        if (Date.now() - lastSoundAtRef.current < OUTPUT_IDLE_MS) return Promise.resolve();
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return Promise.resolve();
            const ctx = (wakeCtxRef.current ??= new Ctx());
            if (ctx.state === 'suspended') ctx.resume();
            const length = Math.ceil((ctx.sampleRate * WAKE_LEAD_MS) / 1000);
            const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * 0.0008;
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start();
        } catch {
            return Promise.resolve();
        }
        lastSoundAtRef.current = Date.now();
        return new Promise((resolve) => setTimeout(resolve, WAKE_LEAD_MS));
    }, []);

    // ── Nuevas preferencias del panel de accesibilidad (persistidas) ───────────
    const [speechRate, setSpeechRateState] = useState(
        () => parseFloat(localStorage.getItem('braillearn_speechRate')) || 1.0
    );
    const [selectedVoiceURI, setSelectedVoiceURIState] = useState(
        () => localStorage.getItem('braillearn_voiceURI') || ''
    );

    const setSpeechRate = (rate) => {
        setSpeechRateState(rate);
        localStorage.setItem('braillearn_speechRate', String(rate));
    };
    const setSelectedVoiceURI = (uri) => {
        setSelectedVoiceURIState(uri);
        localStorage.setItem('braillearn_voiceURI', uri);
    };
    // ──────────────────────────────────────────────────────────────────────────

    // 1. Cargar las voces del navegador (respaldo si Piper no está disponible)
    useEffect(() => {
        const loadVoices = () => {
            const voices = synthRef.current.getVoices();
            setAvailableVoices(voices);
        };

        loadVoices();
        // Chrome a veces tarda en cargar las voces, por eso escuchamos el evento
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    // 2. Función inteligente para encontrar la mejor voz del navegador.
    //    Prioridad: voz seleccionada manualmente → lista de calidad → primera en español.
    const getBestBrowserVoice = () => {
        if (availableVoices.length === 0) return null;

        if (selectedVoiceURI) {
            const chosen = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
            if (chosen) return chosen;
        }

        const priorityKeywords = [
            'Dalia',
            'Microsoft Dalia',
            'Google español',
            'Google',
            'Microsoft Sabina', // Voz mexicana de Edge
            'Paulina',          // Voz mexicana de Windows
            'Mexico',
            'Spanish'
        ];

        for (let keyword of priorityKeywords) {
            const found = availableVoices.find(v =>
                v.name.includes(keyword) || v.lang.includes(keyword)
            );
            if (found && found.lang.startsWith('es')) return found;
        }

        return availableVoices.find(v => v.lang.startsWith('es')) || null;
    };

    // Solo la síntesis más reciente puede cambiar el estado "hablando": los
    // eventos tardíos de un audio ya descartado no lo pisan.
    const markSpeaking = useCallback((token, value) => {
        if (speakTokenRef.current === token) setIsSpeaking(value);
    }, []);

    // Avisa al motor de voz local (proceso principal) cuando Braulio empieza o
    // termina de hablar por las bocinas — mientras habla, el micrófono solo
    // captaría su propia voz, así que ese rato no tiene caso ni buscar la
    // palabra clave (ver localVoiceService.cjs). Sin efecto fuera de Electron.
    //
    // isSpeaking solo es true mientras hay audio SONANDO en este instante —
    // entre una oración encolada y la siguiente hay un hueco (se está
    // sintetizando la próxima) donde isSpeaking ya volvió a false aunque la
    // respuesta sigue en curso. Si solo se usara isSpeaking, ese hueco dejaba
    // la puerta abierta para detectar "Braulio" en su propia voz a medio
    // contestar. turnActive cubre TODO el turno, de punta a punta.
    useEffect(() => {
        window.electronAPI?.setAssistantSpeaking?.(isSpeaking || turnActive);
    }, [isSpeaking, turnActive]);

    // ── Turno del asistente ────────────────────────────────────────────────────
    // Cuando el usuario dice "Braulio" en plena lección, lo que Braulio estaba
    // diciendo se PAUSA (no se descarta): el asistente escucha, responde o hace
    // lo que se le pidió y, al terminar el turno, la narración continúa justo
    // donde iba. Si el usuario navegó a otra parte, `stop()` la descarta.
    const turnRef = useRef(false);            // hay un turno del asistente en curso
    const turnTimerRef = useRef(null);        // seguro: un turno nunca dura más de 45 s
    const suspendedRef = useRef(null);        // { audio } | { text } — narración pausada
    const heldRef = useRef(null);             // { text } — narración pedida durante el turno
    const inFlightRef = useRef(null);         // texto de una narración que aún se está sintetizando
    const currentTextRef = useRef('');        // última narración normal pedida
    const pendingPriorityRef = useRef(0);     // respuestas del asistente aún en camino (fetch/síntesis)
    const resumeWhenIdleRef = useRef(false);
    const speakRef = useRef(null);
    const maybeResumeRef = useRef(() => {});
    const finalizeEndTurnRef = useRef(() => {});
    const pendingEndRef = useRef(false);      // se pidió terminar el turno, pero la cola aún habla

    // ¿Está el asistente ocupado con el usuario? Hay turno abierto, una respuesta
    // suya en camino o su voz sonando.
    const assistantIsBusy = useCallback(() => {
        if (turnRef.current || pendingPriorityRef.current > 0) return true;
        const audio = currentAudioRef.current;
        return !!audio && audio.dataset.priority === '1' && !audio.paused && !audio.ended;
    }, []);

    const discardSuspended = useCallback(() => {
        const suspended = suspendedRef.current;
        suspendedRef.current = null;
        if (suspended?.audio) {
            try { URL.revokeObjectURL(suspended.audio.src); } catch { /* ya liberado */ }
        }
    }, []);

    // Pausa lo que esté sonando y lo guarda para retomarlo.
    const suspendCurrent = useCallback(() => {
        const audio = currentAudioRef.current;
        if (audio && !audio.paused && !audio.ended) {
            audio.pause();
            currentAudioRef.current = null;
            discardSuspended();
            // Lo que decía el asistente mismo no se retoma, solo las narraciones.
            if (audio.dataset.priority !== '1') suspendedRef.current = { audio };
        } else if (synthRef.current.speaking) {
            // La voz del navegador no se puede pausar de forma fiable: se corta y
            // se vuelve a decir la frase completa al terminar el turno.
            synthRef.current.cancel();
            discardSuspended();
            if (currentTextRef.current) suspendedRef.current = { text: currentTextRef.current };
        }
        setIsSpeaking(false);
    }, [discardSuspended]);

    // ── Cola de la respuesta del asistente ──────────────────────────────────────
    // Cuando la respuesta de Claude llega en streaming, cada oración se encola en
    // cuanto está lista y se dicen EN ORDEN, una tras otra — a diferencia de un
    // speak(..., {priority:true}) suelto, que si se llama de nuevo antes de que
    // termine el anterior lo interrumpe (le serviría de poco encolar si cada
    // oración nueva cortara a la anterior a la mitad).
    const sayQueueRef = useRef([]);
    const sayBusyRef = useRef(false);

    const resetSayQueue = useCallback(() => {
        sayQueueRef.current = [];
        sayBusyRef.current = false;
        pendingEndRef.current = false;
    }, []);

    const runSayQueue = useCallback(() => {
        if (sayBusyRef.current) return;
        const next = sayQueueRef.current.shift();
        if (next === undefined) {
            // La cola quedó vacía: si alguien pidió terminar el turno mientras
            // todavía se hablaba, es hasta ahora que de verdad se puede terminar.
            if (pendingEndRef.current) {
                pendingEndRef.current = false;
                finalizeEndTurnRef.current?.();
            }
            return;
        }
        sayBusyRef.current = true;
        speakRef.current?.(next, true, {
            priority: true,
            onDone: () => {
                sayBusyRef.current = false;
                runSayQueue();
            },
        });
    }, []);

    const queueSay = useCallback((text) => {
        const clean = (text || '').trim();
        if (!clean) return;
        sayQueueRef.current.push(clean);
        runSayQueue();
    }, [runSayQueue]);

    // `force` (lo usa Ctrl/el botón de activar a mano): si Braulio ya está a
    // media respuesta cuando se pide un NUEVO turno, sin esto no pasaba nada
    // — turnRef ya era true, así que este mismo begin salía sin cortarlo ni
    // limpiar la cola, y seguía hablando de lo anterior en vez de callarse
    // para escuchar la pregunta nueva.
    const beginAssistantTurn = useCallback(({ force = false } = {}) => {
        clearTimeout(turnTimerRef.current);
        turnTimerRef.current = setTimeout(() => {
            // Último recurso: si esto se disparó es que algo se quedó atorado de
            // verdad (45s reales) — se fuerza a terminar aunque la cola diga que
            // sigue ocupada, en vez de dejar la app "pensando" para siempre.
            resetSayQueue();
            finalizeEndTurnRef.current?.();
        }, 45000);
        if (turnRef.current && !force) return;
        turnRef.current = true;
        setTurnActive(true);
        resumeWhenIdleRef.current = false;
        resetSayQueue(); // una respuesta anterior a medias no debe seguir sonando
        // Una narración que todavía se estaba generando también espera su turno.
        if (inFlightRef.current) heldRef.current = { text: inFlightRef.current };
        suspendCurrent();
    }, [suspendCurrent, resetSayQueue]);

    // Continúa lo pausado cuando ya no hay turno ni respuesta del asistente sonando.
    const maybeResume = useCallback(() => {
        if (!resumeWhenIdleRef.current || turnRef.current || pendingPriorityRef.current > 0) return;
        const playing = currentAudioRef.current;
        if (playing && !playing.paused && !playing.ended) return; // el asistente aún habla
        if (synthRef.current.speaking) return;
        resumeWhenIdleRef.current = false;

        const held = heldRef.current;
        heldRef.current = null;
        if (held) {
            // Llegó una narración nueva durante el turno (p. ej. otro paso): esa manda.
            discardSuspended();
            setTimeout(() => speakRef.current?.(held.text, true), 250);
            return;
        }

        const suspended = suspendedRef.current;
        suspendedRef.current = null;
        if (!suspended) return;
        setTimeout(() => {
            if (turnRef.current) { suspendedRef.current = suspended; resumeWhenIdleRef.current = true; return; }
            if (suspended.audio) {
                const audio = suspended.audio;
                const token = ++speakTokenRef.current;
                currentAudioRef.current = audio;
                audio.onplay = () => markSpeaking(token, true);
                audio.onpause = () => markSpeaking(token, false);
                audio.onended = () => {
                    try { URL.revokeObjectURL(audio.src); } catch { /* ya liberado */ }
                    markSpeaking(token, false);
                };
                audio.play().catch(() => {});
            } else if (suspended.text) {
                speakRef.current?.(suspended.text, true);
            }
        }, 250);
    }, [discardSuspended, markSpeaking]);

    // Termina el turno DE VERDAD: deja de bloquear la narración pausada.
    const finalizeEndTurn = useCallback(() => {
        clearTimeout(turnTimerRef.current);
        if (!turnRef.current) return;
        turnRef.current = false;
        setTurnActive(false);
        resumeWhenIdleRef.current = true;
        maybeResumeRef.current();
    }, []);

    // Lo que se expone hacia afuera. Si la respuesta del asistente TODAVÍA se
    // está diciendo (la cola de queueSay sigue ocupada), no termina el turno de
    // una vez — si no, la narración pausada podría intentar seguir a la mitad de
    // la respuesta. Se termina de verdad en cuanto runSayQueue() vacíe la cola.
    const endAssistantTurn = useCallback(() => {
        if (sayBusyRef.current || sayQueueRef.current.length > 0) {
            pendingEndRef.current = true;
            return;
        }
        finalizeEndTurn();
    }, [finalizeEndTurn]);

    useEffect(() => {
        maybeResumeRef.current = maybeResume;
        finalizeEndTurnRef.current = finalizeEndTurn;
    }, [maybeResume, finalizeEndTurn]);

    const speakWithBrowser = useCallback((text, onDone) => {
        if (synthRef.current.speaking) synthRef.current.cancel();
        const token = speakTokenRef.current;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => markSpeaking(token, true);
        utterance.onend = () => { markSpeaking(token, false); maybeResumeRef.current(); onDone?.(); };
        utterance.onerror = () => { markSpeaking(token, false); maybeResumeRef.current(); onDone?.(); };
        const bestVoice = getBestBrowserVoice();
        if (bestVoice) utterance.voice = bestVoice;
        utterance.rate = speechRate;
        utterance.pitch = 1;
        utterance.lang = 'es-MX';
        synthRef.current.speak(utterance);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [speechRate, selectedVoiceURI, availableVoices, markSpeaking]);

    // `priority: true` = lo dice el asistente (responde al usuario). Hablarle a
    // Braulio pausa la narración; las narraciones normales que lleguen durante
    // ese turno esperan a que termine. `onDone` (opcional) se llama exactamente
    // una vez, se haya podido hablar o no — lo usa la cola de arriba para saber
    // cuándo puede pasar a la siguiente oración.
    const speak = useCallback((text, forceInterrupt = false, { priority = false, onDone } = {}) => {
        if (isMuted || !text) { onDone?.(); return; }

        // Mientras el asistente le habla al usuario (o está por hacerlo), las
        // narraciones normales esperan: si no, la del paso o pantalla nuevo le
        // pisa la confirmación y no se oye qué respondió Braulio.
        if (!priority && assistantIsBusy()) {
            heldRef.current = { text };
            resumeWhenIdleRef.current = true;
            onDone?.();
            return;
        }

        const isBusy = currentAudioRef.current && !currentAudioRef.current.paused;
        if (!forceInterrupt && isBusy) { onDone?.(); return; }

        if (priority) {
            if (!turnRef.current) beginAssistantTurn();
            pendingPriorityRef.current += 1;
        } else {
            // Narración nueva: la que estaba pausada ya quedó vieja.
            discardSuspended();
            heldRef.current = null;
            currentTextRef.current = text;
            inFlightRef.current = text;
        }

        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current = null;
        }
        if (synthRef.current.speaking) synthRef.current.cancel();

        const myToken = ++speakTokenRef.current;

        // La velocidad se le pide a Piper al sintetizar (--length_scale), no
        // se le aplica al audio ya grabado después — estirar/comprimir un WAV
        // con playbackRate sonaba con eco/artefactos.
        Promise.all([synthesizeWithPiper(text, undefined, speechRate), wakeOutput()])
            .then(([blob]) => {
                if (inFlightRef.current === text) inFlightRef.current = null;
                if (speakTokenRef.current !== myToken) { onDone?.(); return; } // ya se pidió otra cosa, descartamos esta
                // Llegó cuando el usuario ya le estaba hablando a Braulio: espera su turno.
                if (!priority && assistantIsBusy()) {
                    heldRef.current = { text };
                    resumeWhenIdleRef.current = true;
                    onDone?.();
                    return;
                }
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.dataset.priority = priority ? '1' : '';
                currentAudioRef.current = audio;
                audio.onplay = () => markSpeaking(myToken, true);
                audio.onpause = () => markSpeaking(myToken, false);
                audio.onended = () => {
                    lastSoundAtRef.current = Date.now();
                    URL.revokeObjectURL(url);
                    markSpeaking(myToken, false);
                    maybeResumeRef.current();
                    onDone?.();
                };
                audio.play().catch(() => speakWithBrowser(text, onDone));
            })
            .catch((err) => {
                if (inFlightRef.current === text) inFlightRef.current = null;
                if (speakTokenRef.current !== myToken) { onDone?.(); return; }
                console.warn('[Audio] Piper no disponible, uso la voz del navegador:', err.message);
                speakWithBrowser(text, onDone);
            })
            .finally(() => {
                if (priority) {
                    pendingPriorityRef.current = Math.max(0, pendingPriorityRef.current - 1);
                    maybeResumeRef.current();
                }
            });
    }, [isMuted, speechRate, speakWithBrowser, markSpeaking, beginAssistantTurn, discardSuspended, assistantIsBusy, wakeOutput]);

    useEffect(() => { speakRef.current = speak; }, [speak]);

    // Efectos de sonido cortos, generados al momento con Web Audio (no dependen
    // de ninguna voz ni de la red). Respetan el ajuste "Efectos de sonido" del
    // panel de accesibilidad — APARTE de silenciar la voz de Braulio (isMuted):
    // así se puede tener sonido de interfaz sin voz, o voz sin sonido.
    // (Ojo: aquí `AudioContext` es el contexto de React, no el de Web Audio.)
    const cueContextRef = useRef(null);
    const playTone = useCallback((notes, { gain = 0.16, dur = 0.17, gap = 0.09 } = {}) => {
        if (!soundEffects) return;
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            const ctx = (cueContextRef.current ??= new Ctx());
            if (ctx.state === 'suspended') ctx.resume();
            const start = ctx.currentTime;
            notes.forEach((freq, i) => {
                const t = start + i * gap;
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                // Triangular en vez de senoidal: un poco más de cuerpo, menos "tono
                // de prueba" — a juego con el timbre cálido de useBrailleSound.js.
                osc.type = 'triangle';
                osc.frequency.value = freq;
                g.gain.setValueAtTime(0.0001, t);
                g.gain.linearRampToValueAtTime(gain, t + 0.018);
                g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
                osc.connect(g).connect(ctx.destination);
                osc.start(t);
                osc.stop(t + dur + 0.02);
            });
        } catch { /* sin Web Audio: solo se pierde el sonido */ }
    }, [soundEffects]);

    // "Te escuché" / "ya puedes hablar" del asistente de voz: dos notas.
    const playCue = useCallback((kind = 'wake') => {
        playTone(kind === 'wake' ? [659.25, 880] : [880, 659.25]); // mi→la sube, la→mi baja
    }, [playTone]);

    // Tap genérico de botones: una nota sola, corta y discreta — misma familia
    // tonal que el resto (E5), pensado para sonar en cualquier botón de la app
    // sin saturar (ver App.jsx).
    const playClick = useCallback(() => {
        playTone([659.25], { gain: 0.05, dur: 0.05, gap: 0 });
    }, [playTone]);

    // Precarga las frases fijas del asistente (el servidor las guarda en disco, así
    // que después de la primera vez ni cuestan ni tardan). Se hace al abrir la app,
    // sin estorbar, y otra vez si cambia la velocidad de la voz.
    useEffect(() => {
        if (isMuted) return undefined;
        let cancelled = false;
        const preload = async () => {
            for (const phrase of PRELOAD_PHRASES) {
                if (cancelled) return;
                try { await synthesizeWithPiper(phrase, undefined, speechRate); } catch { /* se generará al usarla */ }
            }
        };
        const timer = setTimeout(preload, 1500);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [isMuted, speechRate]);

    // Pide la voz de estas frases por adelantado (sin reproducirlas): cuando
    // llegue su turno ya están listas y suenan sin hueco. Lo usa el lector de
    // cuentos para tener lista la oración que sigue.
    const preloadSpeech = useCallback((texts) => {
        if (isMuted) return;
        texts.forEach((text) => {
            if (text) synthesizeWithPiper(text, undefined, speechRate).catch(() => {});
        });
    }, [isMuted, speechRate]);

    // Corta lo que Braulio esté diciendo (voz de Piper o del navegador), descarta
    // cualquier síntesis que todavía esté en camino y olvida lo que estaba pausado
    // (se llama al cambiar de pantalla: lo pausado ya no aplica).
    const stop = useCallback(() => {
        speakTokenRef.current += 1;
        currentAudioRef.current?.pause();
        currentAudioRef.current = null;
        synthRef.current.cancel();
        discardSuspended();
        heldRef.current = null;
        inFlightRef.current = null;
        resumeWhenIdleRef.current = false;
        resetSayQueue();
        setIsSpeaking(false);
    }, [discardSuspended, resetSayQueue]);

    const toggleMute = () => {
        setIsMuted(prev => {
            const newState = !prev;
            if (newState) {
                synthRef.current.cancel();
                currentAudioRef.current?.pause();
                discardSuspended();
                heldRef.current = null;
                resetSayQueue();
                setIsSpeaking(false);
            }
            return newState;
        });
    };

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            currentAudioRef.current?.pause();
            clearTimeout(turnTimerRef.current);
        };
    }, []);

    return (
        <AudioContext.Provider value={{
            isMuted,
            toggleMute,
            speak,
            preloadSpeech,
            stop,
            beginAssistantTurn,
            endAssistantTurn,
            queueSay,
            resetSayQueue,
            playCue,
            playClick,
            isSpeaking,
            turnActive,
            // Nuevos: expuestos para el panel de accesibilidad
            speechRate,
            setSpeechRate,
            selectedVoiceURI,
            setSelectedVoiceURI,
            availableVoices,
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => useContext(AudioContext);
