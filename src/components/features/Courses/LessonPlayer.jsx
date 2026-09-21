import React, { useEffect, useRef } from 'react';
import { Accessibility, ArrowLeft, ArrowRight, Check, CircleCheck, RotateCcw, SkipForward, Volume2, X } from 'lucide-react';
import Braulio from '../../common/Braulio';
import { useAudio } from '../../../context/AudioContext';

// Marco de una lección (estilo Duolingo, sin distracciones):
//   · arriba: salir, progreso y accesos rápidos (escuchar de nuevo, accesibilidad)
//   · centro: el paso actual (`children`)
//   · abajo: acciones. Tras contestar se transforma en una hoja de
//     retroalimentación con el resultado (icono + texto, nunca solo color).
const LessonPlayer = ({
    title,
    headingRef,
    chapter,          // { index, total, title } | null
    step,             // { index, total }
    feedback,         // null | { status: 'correct' | 'incorrect', headline, message }
    isExercise,
    hideActions,
    canGoBack,
    isLast,
    onExit,
    onBack,
    onNext,
    onSkip,
    onRetry,
    onReplay,
    onOpenPanel,
    children,
}) => {
    const continueRef = useRef(null);
    const { isSpeaking } = useAudio() ?? {};
    // La barra cuenta pasos ya superados: llega al 100 % solo al terminar el módulo,
    // (o al acertar el último ejercicio), no nada más entrar al último paso.
    const completed = step.index + (feedback?.status === 'correct' ? 1 : 0);
    const pct = Math.round((completed / step.total) * 100);

    // Tras contestar, el foco pasa a "Continuar": quien usa teclado o lector
    // de pantalla cae justo en la siguiente acción.
    useEffect(() => {
        if (feedback) continueRef.current?.focus();
    }, [feedback]);

    const correct = feedback?.status === 'correct';
    const barTone = !feedback
        ? 'border-line bg-surface'
        : correct
            ? 'border-good bg-good-soft'
            : 'border-oops bg-oops-soft';

    return (
        <div className="min-h-dvh">
            {/* Barra superior (en lección la cabecera general se oculta: ver index.css) */}
            <div className="glass sticky top-0 z-40 border-b border-line">
                <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
                    <button
                        type="button"
                        onClick={onExit}
                        className="icon-btn shrink-0"
                        aria-label="Salir de la lección. Tu avance se guarda."
                        title="Salir"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>

                    <div
                        className="meter flex-1"
                        role="progressbar"
                        aria-label="Progreso de la lección"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={pct}
                        aria-valuetext={`Paso ${step.index + 1} de ${step.total}`}
                    >
                        <span style={{ width: `${Math.max(pct, 4)}%` }} />
                    </div>

                    {/* Braulio: al tocarlo repite el paso; mueve la boca mientras habla */}
                    <button
                        type="button"
                        onClick={onReplay}
                        className="relative flex h-12 w-12 shrink-0 items-end justify-center overflow-hidden rounded-full border-2 border-line-strong bg-brand-soft transition-transform hover:scale-105 active:scale-95"
                        aria-label="Escuchar este paso de nuevo"
                        title="Escuchar de nuevo"
                    >
                        <Braulio variant="face" mood={isSpeaking ? 'talking' : 'idle'} size={42} />
                        <span
                            aria-hidden="true"
                            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-surface bg-sun text-on-sun"
                        >
                            <Volume2 className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={onOpenPanel}
                        className="icon-btn shrink-0"
                        aria-label="Abrir ajustes de accesibilidad"
                        title="Accesibilidad"
                    >
                        <Accessibility className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>

            {/* Contenido del paso */}
            <div className="mx-auto w-full max-w-2xl px-5 pb-48 pt-8 md:pt-12">
                <p className="mb-4 text-base font-bold text-ink-soft">
                    {chapter?.title && <span className="text-brand-strong">{chapter.title} · </span>}
                    <span className="tabular-nums">Paso {step.index + 1} de {step.total}</span>
                </p>

                <h1 ref={headingRef} tabIndex={-1} className="mb-8 text-[2rem] leading-tight md:text-5xl">
                    {title}
                </h1>

                <div key={step.index} className="rise">{children}</div>
            </div>

            {/* Lectura de la retroalimentación para lectores de pantalla */}
            <div className="sr-only" role="status" aria-live="polite">
                {feedback ? `${feedback.headline}${/[.!?]$/.test(feedback.headline) ? '' : '.'} ${feedback.message}` : ''}
            </div>

            {/* Barra inferior de acciones / hoja de retroalimentación */}
            {!hideActions && (
                <div
                    key={feedback ? feedback.status : 'actions'}
                    className={`${feedback ? 'sheet-up' : ''} fixed inset-x-0 bottom-0 z-[55] border-t-4 ${barTone} pb-[env(safe-area-inset-bottom)]`}
                >
                    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        {feedback ? (
                            <>
                                <div className="flex min-w-0 items-start gap-3">
                                    {/* Braulio reacciona (feliz / animando); la insignia repite el resultado con un icono */}
                                    <span aria-hidden="true" className="relative mt-0.5 h-14 w-14 shrink-0">
                                        <span className="flex h-full w-full items-end justify-center overflow-hidden rounded-full bg-surface">
                                            <Braulio variant="face" mood={correct ? 'happy' : 'oops'} size={48} look={false} />
                                        </span>
                                        <span
                                            className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface ${
                                                correct ? 'bg-good text-surface' : 'bg-oops text-surface'
                                            }`}
                                        >
                                            {correct ? <Check className="h-3.5 w-3.5" strokeWidth={4} /> : <RotateCcw className="h-3 w-3" strokeWidth={4} />}
                                        </span>
                                    </span>
                                    <div className="min-w-0">
                                        <p className={`font-display text-2xl font-black leading-tight ${correct ? 'text-good' : 'text-oops'}`}>
                                            {feedback.headline}
                                        </p>
                                        <p className="mt-0.5 text-base leading-snug text-ink">{feedback.message}</p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 gap-3">
                                    {!correct && (
                                        <button type="button" className="btn btn-secondary flex-1 sm:flex-none" onClick={onRetry}>
                                            <RotateCcw className="h-5 w-5" aria-hidden="true" />
                                            Intentar de nuevo
                                        </button>
                                    )}
                                    <button
                                        ref={continueRef}
                                        type="button"
                                        className={`btn btn-lg flex-1 sm:flex-none ${correct ? 'btn-good' : 'btn-primary'}`}
                                        onClick={onNext}
                                    >
                                        {isLast ? 'Terminar' : 'Continuar'}
                                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={onBack}
                                    disabled={!canGoBack}
                                >
                                    <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                                    Anterior
                                </button>

                                {isExercise ? (
                                    <button type="button" className="btn btn-secondary" onClick={onSkip}>
                                        Saltar este ejercicio
                                        <SkipForward className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                ) : (
                                    <button type="button" className="btn btn-primary btn-lg" onClick={onNext}>
                                        {isLast ? 'Terminar' : 'Continuar'}
                                        {isLast ? <CircleCheck className="h-5 w-5" aria-hidden="true" /> : <ArrowRight className="h-5 w-5" aria-hidden="true" />}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonPlayer;
