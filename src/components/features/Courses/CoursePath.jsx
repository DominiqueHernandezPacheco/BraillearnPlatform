import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Play } from 'lucide-react';
import GuideNote from '../../common/GuideNote';
import { getIcon } from '../../../utils/iconMap';
import { getChapterRanges } from '../../../data/courseData';
import { useAudio } from '../../../context/AudioContext';
import { useProgress } from '../../../hooks/useProgress';

// Sombras tipo "repisa" de cada estado de nodo (mismo lenguaje que los botones).
const NODE_STYLE = {
    done: 'bg-good text-surface shadow-[0_5px_0_color-mix(in_srgb,var(--good),black_30%)]',
    current: 'bg-sun text-on-sun shadow-[0_5px_0_var(--sun-strong)] ring-pulse',
    todo: 'bg-surface text-ink-faint border-2 border-line-strong shadow-[0_5px_0_var(--line-strong)]',
};

const STATUS_TEXT = { done: 'Completado', current: 'Siguiente', todo: 'Sin empezar' };

const moduleName = (title) => title.replace(/^Módulo \d+:\s*/, '');

const CoursePath = ({ modules, onStart }) => {
    const { speak } = useAudio();
    const { completedLessons, lastLesson, stepProgress } = useProgress();

    const isDone = (id) => completedLessons.includes(id);
    const recommended =
        (lastLesson != null && !isDone(lastLesson) && modules.find((m) => m.id === lastLesson)) ||
        modules.find((m) => !isDone(m.id)) ||
        null;
    const started = lastLesson != null || completedLessons.length > 0;

    // Solo el módulo que toca va abierto y destacado; los demás se despliegan a demanda.
    const [openIds, setOpenIds] = useState(() => new Set(recommended ? [recommended.id] : []));
    const toggleOpen = (id) =>
        setOpenIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    // Paso desde el que se retoma un módulo (los retos aleatorios siempre empiezan de cero).
    const resumeIndex = (m) => {
        if (m.random || isDone(m.id)) return 0;
        const reached = stepProgress[m.id];
        return reached == null ? 0 : Math.min(reached, m.lessons.length - 1);
    };

    // Anuncia el camino al abrir — importante para quien navega solo con voz o teclado.
    useEffect(() => {
        const timer = setTimeout(() => {
            speak(
                `Tu camino del Braille. Hay ${modules.length} módulos: ` +
                    `${modules.map((m, i) => `${i + 1}, ${moduleName(m.title)}`).join('. ')}. ` +
                    'Usa Tab para recorrerlos y Enter para abrir uno.',
                true,
            );
        }, 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const guide = !started
        ? 'Empieza por el Módulo 1. Son pasos cortitos y yo te los voy leyendo en voz alta.'
        : recommended
            ? `Vas en el ${recommended.title.split(':')[0]}. Toca “Continuar” y seguimos donde te quedaste.`
            : '¡Completaste todo el camino! Puedes repasar el módulo que quieras.';

    // Estado de cada capítulo de un módulo.
    const chapterStates = (m) => {
        const ranges = getChapterRanges(m);
        const reached = stepProgress[m.id];
        const isRecommended = recommended?.id === m.id;
        let currentAssigned = false;

        return ranges.map((chapter) => {
            let status = 'todo';
            if (isDone(m.id) || (!m.random && reached !== undefined && reached > chapter.end)) {
                status = 'done';
            } else if (isRecommended && !currentAssigned) {
                status = 'current';
                currentAssigned = true;
            }
            const inProgress = reached !== undefined && reached >= chapter.start && !m.random;
            return { ...chapter, status, inProgress };
        });
    };

    const renderChapters = (m, chapters) => (
        <ol id={`chapters-${m.id}`} className="m-0 mt-6 flex list-none flex-col p-0">
            {chapters.map((c, i) => {
                const isLast = i === chapters.length - 1;
                const label = `Capítulo ${i + 1} de ${chapters.length}: ${c.title}. ${c.summary} ${
                    STATUS_TEXT[c.status]
                }. Presiona Enter para ${c.status === 'done' ? 'repasarlo' : c.inProgress ? 'continuar' : 'empezar'}.`;

                return (
                    <li key={c.id} className="relative">
                        {!isLast && (
                            <span
                                aria-hidden="true"
                                className="absolute left-10 top-[4.75rem] -bottom-2 w-[3px] -translate-x-1/2"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, var(--line-strong) 1.6px, transparent 2px)',
                                    backgroundSize: '3px 12px',
                                }}
                            />
                        )}
                        <button
                            type="button"
                            aria-label={label}
                            onClick={() => onStart(m, m.random ? 0 : c.start)}
                            className="group flex w-full items-center gap-5 rounded-3xl p-2 pr-4 text-left transition-colors hover:bg-surface md:gap-6"
                        >
                            <span
                                aria-hidden="true"
                                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-2xl font-black transition-transform group-active:translate-y-1 ${NODE_STYLE[c.status]}`}
                            >
                                {c.status === 'done' ? (
                                    <Check className="h-8 w-8" strokeWidth={3.5} />
                                ) : c.status === 'current' ? (
                                    <Play className="h-7 w-7 fill-current" />
                                ) : m.random ? (
                                    getIcon(m.iconType, 'h-7 w-7')
                                ) : (
                                    i + 1
                                )}
                            </span>

                            <span className="min-w-0 flex-1 py-2">
                                <span className="block font-display text-xl font-extrabold leading-tight text-ink md:text-2xl">
                                    {c.title}
                                </span>
                                <span className="mt-1 block text-lg text-ink-soft">{c.summary}</span>
                            </span>
                        </button>
                    </li>
                );
            })}
        </ol>
    );

    return (
        <div className="page">
            <header className="flex max-w-2xl flex-col gap-6">
                <h1 className="text-4xl md:text-5xl">Tu camino del Braille</h1>
                <GuideNote>{guide}</GuideNote>
            </header>

            <div className="mt-14 flex flex-col gap-10">
                {modules.map((m, moduleIndex) => {
                    const chapters = chapterStates(m);
                    const done = isDone(m.id);
                    const isFocus = recommended?.id === m.id;
                    const isOpen = isFocus || openIds.has(m.id);
                    const ctaLabel = done
                        ? 'Repasar'
                        : !m.random && stepProgress[m.id] !== undefined
                            ? 'Continuar'
                            : 'Empezar';

                    return (
                        <section key={m.id} aria-labelledby={`module-${m.id}-title`}>
                            {isFocus ? (
                                /* Módulo destacado */
                                <div className="on-dark flex flex-col gap-6 rounded-3xl bg-brand p-7 md:flex-row md:items-center md:justify-between md:p-9">
                                    <div className="min-w-0">
                                        <h2 id={`module-${m.id}-title`} className="text-3xl text-on-brand md:text-4xl">
                                            <span className="mb-1.5 block font-display text-sm font-extrabold uppercase tracking-[0.14em]">
                                                Módulo {moduleIndex + 1}
                                            </span>
                                            {moduleName(m.title)}
                                        </h2>
                                        <p className="mt-3 max-w-[38ch] text-lg text-on-brand">{m.subtitle}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onStart(m, resumeIndex(m))}
                                        className="btn btn-primary btn-lg shrink-0 self-start md:self-center"
                                    >
                                        {ctaLabel}
                                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            ) : (
                                /* Módulo en tarjeta compacta */
                                <div className="card flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">
                                    <div className="flex min-w-0 items-center gap-5">
                                        <span
                                            aria-hidden="true"
                                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-black ${
                                                done ? 'bg-good-soft text-good' : 'bg-brand-soft text-brand-strong'
                                            }`}
                                        >
                                            {done ? <Check className="h-7 w-7" strokeWidth={3} /> : moduleIndex + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <h2 id={`module-${m.id}-title`} className="text-2xl">
                                                <span className="sr-only">Módulo {moduleIndex + 1}: </span>
                                                {moduleName(m.title)}
                                            </h2>
                                            <p className="mt-1 text-lg text-ink-soft">{m.subtitle}</p>
                                            {done && <p className="mt-1 text-base font-bold text-good">Completado</p>}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleOpen(m.id)}
                                            aria-expanded={isOpen}
                                            aria-controls={`chapters-${m.id}`}
                                            className="btn btn-ghost"
                                        >
                                            {isOpen ? 'Ocultar capítulos' : 'Ver capítulos'}
                                            <ChevronDown
                                                className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                                aria-hidden="true"
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onStart(m, resumeIndex(m))}
                                            className="btn btn-secondary"
                                        >
                                            {ctaLabel}
                                            <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isOpen && renderChapters(m, chapters)}
                        </section>
                    );
                })}
            </div>
        </div>
    );
};

export default CoursePath;
