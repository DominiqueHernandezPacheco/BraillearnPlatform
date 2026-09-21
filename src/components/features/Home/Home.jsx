import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, MessageSquareText } from 'lucide-react';
import TactileCell from '../../common/TactileCell';
import Braulio from '../../common/Braulio';
import { braillePatterns } from '../../../constants/braillePatterns';
import { COURSES_DATA } from '../../../data/courseData';
import { useProgress } from '../../../hooks/useProgress';
import { useUser } from '../../../context/UserContext';
import { useAudio } from '../../../context/AudioContext';

// Datos verificables sobre el Braille: Braulio cuenta uno cada vez que lo tocan.
const FACTS = [
    'Louis Braille tenía solo 15 años cuando creó el sistema de puntos que hoy lleva su nombre.',
    'Cada 4 de enero se celebra el Día Mundial del Braille, el cumpleaños de Louis Braille.',
    'Una celda Braille tiene seis puntos. Con ellos se forman 64 combinaciones distintas.',
    'El Braille no es un idioma: es un código que sirve para escribir en muchos idiomas.',
    'De la letra a a la j solo se usan los cuatro puntos de arriba de la celda.',
];

const describeDots = (dots) => {
    const on = dots.map((d, i) => (d ? i + 1 : null)).filter(Boolean);
    return on.length > 1
        ? `puntos ${on.slice(0, -1).join(', ')} y ${on[on.length - 1]}`
        : `punto ${on[0]}`;
};

const Home = ({ handleNav, onOpenModule }) => {
    const { completedLessons, lastLesson, stepProgress, getPercentage } = useProgress();
    // La vista previa de la landing no monta UserProvider: el nombre es opcional.
    const name = useUser()?.user?.name;
    const { speak, isSpeaking } = useAudio() ?? {};

    // Braulio saluda al llegar, y reacciona cuando lo tocan.
    const [waving, setWaving] = useState(true);
    const [cheer, setCheer] = useState(false);
    const [tip, setTip] = useState(null);
    const cheerTimer = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => setWaving(false), 3200);
        return () => {
            clearTimeout(timer);
            clearTimeout(cheerTimer.current);
        };
    }, []);

    const poke = () => {
        const next = tip === null ? new Date().getDate() % FACTS.length : (tip + 1) % FACTS.length;
        setTip(next);
        setCheer(true);
        clearTimeout(cheerTimer.current);
        cheerTimer.current = setTimeout(() => setCheer(false), 1300);
        speak?.(`Dato curioso. ${FACTS[next]}`, true);
    };

    const mood = isSpeaking ? 'talking' : cheer ? 'happy' : waving ? 'wave' : 'idle';

    const isDone = (id) => completedLessons.includes(id);
    const allDone = COURSES_DATA.every((m) => isDone(m.id));
    const started = lastLesson != null || completedLessons.length > 0;
    const nextModule =
        (lastLesson != null && !isDone(lastLesson) && COURSES_DATA.find((m) => m.id === lastLesson)) ||
        COURSES_DATA.find((m) => !isDone(m.id)) ||
        COURSES_DATA[0];
    const percent = getPercentage(COURSES_DATA.length);

    const lead = allDone
        ? 'Terminaste los tres módulos. Repasa cuando quieras.'
        : started
            ? `Seguimos con el ${nextModule.title.split(':')[0]}.`
            : 'Vamos a empezar por lo básico, con pasos cortos y a tu ritmo.';

    const ctaLabel = allDone ? 'Repasar' : started ? 'Continuar' : 'Empezar';

    const greeting = name ? `¡Hola, ${name}!` : '¡Hola!';
    const hola = 'hola'.split('').map((char) => ({ char, dots: braillePatterns[char] }));

    const statusOf = (m) => {
        if (isDone(m.id)) return 'Completado';
        const reached = stepProgress[m.id];
        if (reached !== undefined && m.lessons.length > 0) {
            return `En curso, ${Math.round(((reached + 1) / m.lessons.length) * 100)} por ciento`;
        }
        return 'Sin empezar';
    };

    return (
        <div className="page flex flex-col gap-20 md:gap-28">
            {/* ── Bienvenida ─────────────────────────────────────────────── */}
            <section aria-labelledby="home-title" className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
                <div className="flex flex-col items-start gap-7">
                    <h1
                        id="home-title"
                        className="rise text-5xl leading-[1.05] text-ink md:text-6xl"
                    >
                        {greeting}
                    </h1>

                    <p className="rise max-w-[30ch] text-xl leading-relaxed text-ink-soft md:text-2xl" style={{ '--d': '80ms' }}>
                        {lead}
                    </p>

                    <button
                        type="button"
                        className="rise btn btn-primary btn-lg"
                        style={{ '--d': '160ms' }}
                        onClick={() => onOpenModule?.(nextModule.id)}
                    >
                        {ctaLabel}
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                {/* Braulio saluda y "dice" hola en Braille; al tocarlo cuenta un dato curioso */}
                <div className="rise relative flex flex-col items-center" style={{ '--d': '120ms' }}>
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[26rem] w-[26rem] max-w-full -translate-x-1/2 rounded-full opacity-70 blur-3xl"
                        style={{ background: 'radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)' }}
                    />

                    <figure className="relative m-0 flex flex-col items-center gap-4 rounded-[2rem] border border-line bg-surface px-6 py-6 shadow-[0_18px_44px_-18px_rgba(13,27,54,0.22)] md:px-8">
                        <div className="flex items-end justify-center gap-3 md:gap-5">
                            {hola.map(({ char, dots }) => (
                                <div key={char} className="flex flex-col items-center gap-1.5">
                                    <TactileCell
                                        dots={dots}
                                        size={96}
                                        className="h-20 w-auto md:h-24"
                                        label={`Letra ${char.toUpperCase()}: ${describeDots(dots)}`}
                                    />
                                    <span aria-hidden="true" className="font-display text-lg font-black text-brand-strong">
                                        {char.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <figcaption className="text-center text-base text-ink-soft">
                            Así se escribe <strong className="font-display font-extrabold text-ink">“hola”</strong> en Braille
                        </figcaption>
                        {/* Colita del globo de diálogo */}
                        <span
                            aria-hidden="true"
                            className="absolute -bottom-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-b border-r border-line bg-surface"
                        />
                    </figure>

                    <button
                        type="button"
                        onClick={poke}
                        aria-label="Toca a Braulio para escuchar un dato curioso sobre el Braille"
                        className="mt-3 rounded-[2rem] transition-transform hover:scale-[1.03] active:scale-95"
                    >
                        <Braulio mood={mood} size={230} />
                    </button>

                    <p role="status" className="mt-2 min-h-[4.5rem] max-w-[32ch] text-center text-lg leading-snug text-ink-soft">
                        {tip === null ? (
                            'Tócame para un dato curioso.'
                        ) : (
                            <>
                                <span className="block font-display text-sm font-extrabold uppercase tracking-[0.12em] text-brand-strong">
                                    Dato curioso
                                </span>
                                {FACTS[tip]}
                            </>
                        )}
                    </p>
                </div>
            </section>

            {/* ── Tu camino ──────────────────────────────────────────────── */}
            <section aria-labelledby="path-title" className="flex flex-col gap-8">
                <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                    <h2 id="path-title" className="text-3xl md:text-4xl">Tu camino</h2>

                    <div data-tour="learning-progress" className="w-full max-w-xs">
                        <div className="mb-2 flex items-baseline justify-between text-base font-bold text-ink-soft">
                            <span id="overall-progress-label">Progreso total</span>
                            <span className="tabular-nums text-ink">{percent} %</span>
                        </div>
                        <div
                            className="meter"
                            role="progressbar"
                            aria-labelledby="overall-progress-label"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={percent}
                        >
                            <span style={{ width: `${percent}%` }} />
                        </div>
                    </div>
                </div>

                <ol className="m-0 flex list-none flex-col gap-4 p-0">
                    {COURSES_DATA.map((m, i) => {
                        const isNext = m.id === nextModule.id && !allDone;
                        const reached = stepProgress[m.id];
                        const pct = !isDone(m.id) && reached !== undefined && m.lessons.length > 0
                            ? Math.round(((reached + 1) / m.lessons.length) * 100)
                            : null;
                        return (
                            <li key={m.id}>
                                <button
                                    type="button"
                                    onClick={() => onOpenModule?.(m.id)}
                                    className={`card card-lift flex w-full items-center gap-5 p-5 text-left md:gap-6 md:p-6 ${
                                        isNext ? 'border-brand' : ''
                                    }`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-black ${
                                            isDone(m.id) ? 'bg-good-soft text-good' : 'bg-brand-soft text-brand-strong'
                                        }`}
                                    >
                                        {isDone(m.id) ? <Check className="h-7 w-7" strokeWidth={3} /> : i + 1}
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="block font-display text-xl font-extrabold leading-tight text-ink md:text-2xl">
                                            {m.title}
                                        </span>
                                        <span className="mt-1 block text-lg text-ink-soft">{m.description}</span>
                                        {pct !== null && (
                                            <span className="meter mt-3 block max-w-xs" aria-hidden="true">
                                                <span style={{ width: `${pct}%` }} />
                                            </span>
                                        )}
                                        <span className="sr-only">{statusOf(m)}</span>
                                    </span>

                                    <ArrowRight aria-hidden="true" className="hidden h-6 w-6 shrink-0 text-ink-faint sm:block" />
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </section>

            {/* ── Mensajes ───────────────────────────────────────────────── */}
            <section aria-labelledby="msg-title" className="card flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between md:p-10">
                <div className="flex items-start gap-5">
                    <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sun-soft text-ink">
                        <MessageSquareText className="h-7 w-7" />
                    </span>
                    <div>
                        <h2 id="msg-title" className="text-2xl md:text-3xl">Mensajes al display</h2>
                        <p className="mt-2 max-w-[38ch] text-lg text-ink-soft">
                            Escribe un mensaje y aparece en Braille en el display.
                        </p>
                    </div>
                </div>
                <button type="button" className="btn btn-secondary btn-lg shrink-0" onClick={() => handleNav?.('mensajes')}>
                    Escribir un mensaje
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
            </section>
        </div>
    );
};

export default Home;
