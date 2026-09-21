import React, { useEffect, useRef, useState } from 'react';
import { Send, RotateCcw, CircleCheck, TriangleAlert, Loader2, Eraser } from 'lucide-react';
import TactileCell from '../../common/TactileCell';
import Braulio from '../../common/Braulio';
import BrandMark from '../../common/BrandMark';
import { braillePatterns } from '../../../constants/braillePatterns';
import { textToBrailleCells } from '../../../utils/textHelpers';
import { brailleService } from '../../../utils/brailleService';
import { useAudio } from '../../../context/AudioContext';

const DISPLAY_CELLS = 12;
const STORAGE_KEY = 'braillearn_messages';
const MAX_HISTORY = 20;

// Frases cortas que caben en las 12 celdas del display.
const QUICK_PHRASES = [
    'Buen trabajo',
    'Bien hecho',
    'Te quiero',
    'Ya voy',
    'A comer',
    'A estudiar',
];

const STEPS = [
    'Escribe un mensaje corto o elige una frase rápida.',
    'Mira cómo se verá en Braille, celda por celda.',
    'Envíalo al display con un toque.',
];

const loadHistory = () => {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(raw) ? raw.slice(0, MAX_HISTORY) : [];
    } catch {
        return [];
    }
};

const saveHistory = (items) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        /* sin almacenamiento: el historial simplemente no persiste */
    }
};

// El mensaje más reciente va primero; si ya estaba, se mueve arriba en vez de duplicarse.
const withSent = (history, text) => {
    const at = Date.now();
    return [{ id: at, text, at }, ...history.filter((h) => h.text !== text)].slice(0, MAX_HISTORY);
};

const formatWhen = (ts) =>
    new Date(ts).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const BLANK = braillePatterns.blank;

// Burbuja de Braulio (izquierda): con su carita, para las respuestas y avisos.
const BraulioBubble = ({ mood = 'idle', children, tone = 'normal' }) => (
    <div className="flex max-w-[92%] items-end gap-2">
        <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-end justify-center overflow-hidden rounded-full bg-brand-soft"
        >
            <Braulio variant="face" mood={mood} size={36} look={false} />
        </span>
        <div
            className={`rounded-3xl rounded-bl-lg border px-4 py-3 text-lg leading-snug ${
                tone === 'error' ? 'border-oops bg-oops-soft text-ink' : 'border-line bg-surface text-ink'
            }`}
        >
            {children}
        </div>
    </div>
);

const MessagesSection = () => {
    const { speak } = useAudio();
    const [text, setText] = useState('');
    const [status, setStatus] = useState({ state: 'idle', message: '' }); // idle | sending | sent | error
    const [history, setHistory] = useState(loadHistory);
    const [lastAttempt, setLastAttempt] = useState('');
    const inputRef = useRef(null);
    const threadRef = useRef(null);

    const message = text.replace(/\s+/g, ' ').trim();
    const cells = textToBrailleCells(text.replace(/\s+/g, ' ').replace(/^ /, ''));
    const cellCount = cells.length;
    const tooLong = cellCount > DISPLAY_CELLS;
    const canSend = message.length > 0 && !tooLong && status.state !== 'sending';
    const hasDraft = message.length > 0;

    const slots = Array.from({ length: DISPLAY_CELLS }, (_, i) => cells[i] ?? { char: ' ', dots: BLANK });
    const thread = [...history].reverse(); // del más antiguo al más reciente, como en un chat

    // El chat siempre muestra lo último: mensajes nuevos, avisos y el borrador.
    useEffect(() => {
        const el = threadRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [history.length, status.state, hasDraft]);

    // Al escribir de nuevo se limpia el aviso del envío anterior.
    const onChange = (e) => {
        setText(e.target.value);
        if (status.state === 'sent' || status.state === 'error') setStatus({ state: 'idle', message: '' });
    };

    const send = async (value) => {
        const toSend = value.replace(/\s+/g, ' ').trim();
        if (!toSend || status.state === 'sending') return;

        setLastAttempt(toSend);
        setStatus({ state: 'sending', message: 'Enviando al display…' });
        // brailleService devuelve undefined cuando la petición falla
        const result = await brailleService.sendText(toSend);

        if (result === undefined) {
            const errorMessage = 'No se pudo enviar. Revisa la conexión a internet y que el display esté encendido; luego inténtalo de nuevo.';
            setStatus({ state: 'error', message: errorMessage });
            speak(errorMessage, true);
            return;
        }

        const next = withSent(history, toSend);
        setHistory(next);
        saveHistory(next);
        setText('');
        const okMessage = `Listo, mandé “${toSend}” al display.`;
        setStatus({ state: 'sent', message: okMessage });
        speak(okMessage, true);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (canSend) send(text);
    };

    const applyPhrase = (phrase) => {
        setText(phrase);
        setStatus({ state: 'idle', message: '' });
        inputRef.current?.focus();
    };

    return (
        <div className="page">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-center lg:gap-16">
                {/* ── Texto de la página ───────────────────────────────── */}
                <header className="flex max-w-xl flex-col gap-5">
                    <h1 className="text-4xl md:text-5xl">Mensajes para el display</h1>
                    <p className="hidden text-xl leading-relaxed text-ink-soft md:block">
                        Escribe un mensaje corto y aparecerá en Braille en el display, para leerlo con los dedos.
                    </p>
                    <ol className="m-0 hidden list-none flex-col gap-4 p-0 lg:flex">
                        {STEPS.map((step, i) => (
                            <li key={step} className="flex items-center gap-4 text-lg text-ink">
                                <span
                                    aria-hidden="true"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft font-display text-lg font-black text-brand-strong"
                                >
                                    {i + 1}
                                </span>
                                {step}
                            </li>
                        ))}
                    </ol>
                </header>

                {/* ── El "teléfono": conversación con el display ───────── */}
                <div className="mx-auto w-full max-w-[28rem] md:rounded-[2.9rem] md:border-[10px] md:border-ink md:bg-ink md:shadow-[0_32px_70px_-24px_rgba(13,27,54,0.5)]">
                    <div className="relative flex h-[min(44rem,calc(100dvh-11rem))] min-h-[32rem] flex-col overflow-hidden rounded-[2rem] border border-line bg-surface-2 md:border-0">
                        {/* Isla del teléfono (solo decorativa) */}
                        <span
                            aria-hidden="true"
                            className="absolute left-1/2 top-2.5 z-10 hidden h-6 w-24 -translate-x-1/2 rounded-full bg-ink md:block"
                        />

                        {/* Encabezado del chat */}
                        <div className="glass flex items-center gap-3 border-b border-line px-4 pb-3 pt-4 md:pt-11">
                            <BrandMark size={44} />
                            <div className="min-w-0">
                                <h2 className="font-display text-xl font-black leading-tight text-ink">Display Braille</h2>
                                <p className="text-sm text-ink-soft">Tus mensajes aparecen en Braille</p>
                            </div>
                        </div>

                        {/* Conversación */}
                        <div
                            ref={threadRef}
                            role="log"
                            tabIndex={0}
                            aria-label="Conversación con el display"
                            className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-4"
                        >
                            <BraulioBubble>
                                ¡Hola! Escribe abajo lo que quieras mandar. Cabe hasta {DISPLAY_CELLS} celdas, y antes de enviarlo te muestro cómo se verá.
                            </BraulioBubble>

                            {thread.map((item) => (
                                <div key={item.id} className="on-dark ml-auto max-w-[88%] rounded-3xl rounded-br-lg bg-brand px-4 py-3 text-on-brand">
                                    <p className="break-words text-xl font-bold leading-snug">
                                        <span className="sr-only">Mensaje enviado: </span>
                                        {item.text}
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                                        <span className="text-sm">{formatWhen(item.at)}</span>
                                        <button
                                            type="button"
                                            onClick={() => send(item.text)}
                                            aria-label={`Enviar de nuevo: ${item.text}`}
                                            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/20 px-3 text-sm font-bold text-on-brand hover:bg-white/30"
                                        >
                                            <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                            Reenviar
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {status.state === 'sending' && (
                                <BraulioBubble mood="thinking">
                                    <span className="flex items-center gap-2 font-bold">
                                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                                        Enviando al display…
                                    </span>
                                </BraulioBubble>
                            )}
                            {status.state === 'sent' && (
                                <BraulioBubble mood="happy">
                                    <span className="flex items-start gap-2 font-bold text-good">
                                        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                                        {status.message}
                                    </span>
                                    <span className="mt-1 block text-base text-ink-soft">
                                        Yo envío el mensaje, pero no puedo confirmar que se haya leído.
                                    </span>
                                </BraulioBubble>
                            )}
                            {status.state === 'error' && (
                                <BraulioBubble mood="oops" tone="error">
                                    <span className="flex items-start gap-2 font-bold text-oops">
                                        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                                        {status.message}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => send(lastAttempt)}
                                        className="btn btn-secondary btn-sm mt-3"
                                    >
                                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                        Reintentar
                                    </button>
                                </BraulioBubble>
                            )}

                            {/* Borrador: así se verá en el display (como el "escribiendo…" de un chat) */}
                            {hasDraft && (
                                <div className="ml-auto w-full rounded-3xl rounded-br-lg border-2 border-dashed border-brand bg-surface p-3">
                                    <p className="mb-2 px-1 text-sm font-extrabold uppercase tracking-[0.1em] text-brand-strong">
                                        Así se verá en Braille
                                    </p>
                                    <div
                                        role="img"
                                        aria-label={`Vista previa en Braille del mensaje “${message}”, ${cellCount} celdas`}
                                        className="grid grid-cols-6 gap-1.5"
                                    >
                                        {slots.map((cell, i) => (
                                            <div
                                                key={i}
                                                className={`flex flex-col items-center rounded-xl bg-surface-2 pb-1.5 pt-2 ${
                                                    i < cellCount ? '' : 'opacity-45'
                                                }`}
                                            >
                                                <TactileCell
                                                    dots={cell.dots}
                                                    size={74}
                                                    className="h-[74px] w-auto"
                                                    decorative
                                                    strongEmpty
                                                />
                                                <span
                                                    aria-hidden="true"
                                                    className="h-6 font-display text-lg font-black uppercase leading-6 text-ink"
                                                >
                                                    {cell.char.trim()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Barra para escribir */}
                        <form onSubmit={onSubmit} noValidate className="glass border-t border-line px-3 pb-3 pt-3">
                            {/* Sugerencias: solo mientras no hay nada escrito, para dejar sitio al borrador */}
                            {!text && (
                                <>
                                    <h3 className="sr-only">Frases rápidas</h3>
                                    <ul className="mb-3 flex flex-wrap gap-2" aria-label="Frases rápidas">
                                        {QUICK_PHRASES.map((phrase) => (
                                            <li key={phrase}>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => applyPhrase(phrase)}
                                                >
                                                    {phrase}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}

                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <label htmlFor="message-input" className="sr-only">Mensaje</label>
                                    <input
                                        id="message-input"
                                        ref={inputRef}
                                        type="text"
                                        value={text}
                                        onChange={onChange}
                                        autoComplete="off"
                                        autoCapitalize="sentences"
                                        enterKeyHint="send"
                                        placeholder="Escribe un mensaje"
                                        aria-describedby="message-help"
                                        aria-invalid={tooLong}
                                        className="input !min-h-14 !rounded-full !pl-5 !pr-14 text-xl"
                                    />
                                    {text && (
                                        <button
                                            type="button"
                                            className="icon-btn absolute right-2 top-1/2 !h-10 !w-10 -translate-y-1/2"
                                            aria-label="Borrar el mensaje"
                                            onClick={() => {
                                                setText('');
                                                setStatus({ state: 'idle', message: '' });
                                                inputRef.current?.focus();
                                            }}
                                        >
                                            <Eraser className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary !min-h-14 !rounded-full !px-5"
                                    aria-disabled={!canSend}
                                    onClick={(e) => { if (!canSend) e.preventDefault(); }}
                                >
                                    <Send className="h-5 w-5" aria-hidden="true" />
                                    Enviar
                                </button>
                            </div>

                            <p id="message-help" className="mt-2 px-2 text-base text-ink-soft">
                                <span className={tooLong ? 'font-bold text-oops' : ''}>
                                    {cellCount} de {DISPLAY_CELLS} celdas
                                </span>
                                {/\d/.test(text) && ' · Los números usan una celda extra.'}
                            </p>
                            {tooLong && (
                                <p role="alert" className="mt-1 flex items-start gap-2 px-2 text-base font-bold text-oops">
                                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                                    Es demasiado largo para el display. Acórtalo para que quepa en {DISPLAY_CELLS} celdas.
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagesSection;
