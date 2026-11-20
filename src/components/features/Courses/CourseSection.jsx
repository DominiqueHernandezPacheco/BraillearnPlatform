import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import Braulio from '../../common/Braulio';
import useBrailleSound from '../../../hooks/useBrailleSound';
import { COURSES_DATA, getChapterRanges, chapterIndexOfStep } from '../../../data/courseData';
import { generateRandomExercises } from '../../../utils/courseGenerator';
import { useAudio } from '../../../context/AudioContext';
import { NOTES } from '../../../constants/soundConfig';
import { useProgress } from '../../../hooks/useProgress';
import { setActiveLesson, clearActiveLesson } from '../../../hooks/useActiveLesson';
import { buildBriefNarration, buildNarration } from '../../../utils/lessonNarration';
import { useAccessibility } from '../../../context/AccessibilityContext';
import { track } from '../../../utils/telemetry';
import useWaitUntilNotSpeaking from '../../../hooks/useWaitUntilNotSpeaking';
import GuideNote from '../../common/GuideNote';

import CoursePath from './CoursePath';
import LessonPlayer from './LessonPlayer';
import MemoryGame from './MemoryGame';
import LessonInfo from './lessons/LessonInfo';
import LessonVowel from './lessons/LessonVowel';
import LessonBuilder from './lessons/LessonBuilder';
import LessonQuiz from './lessons/LessonQuiz';
import LessonTrueFalse from './lessons/LessonTrueFalse';
import LessonCheck from './lessons/LessonCheck';
import LessonExplore from './lessons/LessonExplore';

// Pasos que se recorren sin contestar nada
const PASSTHROUGH = new Set(['info', 'vowel_learning', 'explore']);

const CORRECT_HEADLINES = ['¡Correcto!', '¡Muy bien!', '¡Exacto!', '¡Así es!'];

const scoreSentence = ({ correct, questions }) =>
    `Respondiste bien ${correct} de ${questions} ${questions === 1 ? 'pregunta' : 'preguntas'} a la primera.`;

const moduleName = (title) => title.replace(/^Módulo \d+:\s*/, '');

const CourseSection = ({ openModuleRequest, onRequestHandled, onOpenPanel }) => {
    const { playNav, playCorrect, playIncorrect } = useBrailleSound();
    const { isMuted, speak, stop } = useAudio();
    const { briefNarration } = useAccessibility() ?? {};
    const waitUntilNotSpeaking = useWaitUntilNotSpeaking();
    const { completedLessons, stepProgress, markLessonComplete, updateLastLesson, saveStep, clearSteps } = useProgress();

    const [activeModule, setActiveModule] = useState(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [finished, setFinished] = useState(false);
    const [score, setScore] = useState({ correct: 0, questions: 0 });

    const headingRef = useRef(null);
    const answeredRef = useRef(new Set()); // pasos ya contestados (para contar el primer intento)
    const attemptsRef = useRef(new Map()); // intentos por paso (para el registro de uso)
    const stepShownAtRef = useRef(0);
    const skipAttemptRef = useRef(false);
    const skipTimerRef = useRef(null);
    const goNextRef = useRef(() => {});

    const lessons = activeModule?.lessons ?? [];
    const lesson = lessons[stepIndex];
    const total = lessons.length;
    const nextModule = activeModule ? COURSES_DATA.find((m) => m.id === activeModule.id + 1) : undefined;

    const chapters = activeModule ? getChapterRanges(activeModule) : [];
    const chapterIndex = activeModule ? chapterIndexOfStep(activeModule, stepIndex) : -1;
    const chapterTotal = chapters.length;
    const chapterTitle = chapterTotal > 1 ? chapters[chapterIndex]?.title : undefined;
    // Memoizado con deps primitivas: si no, sería un objeto nuevo en cada
    // render y el useEffect de setActiveLesson de abajo correría de más.
    const chapter = useMemo(
        () => (chapterTotal > 1 ? { index: chapterIndex, total: chapterTotal, title: chapterTitle } : null),
        [chapterIndex, chapterTotal, chapterTitle],
    );

    // ── ABRIR / SALIR ────────────────────────────────────────────────────────
    const openModule = (m, startIndex = 0) => {
        const mod = m.random ? { ...m, lessons: generateRandomExercises() } : m;
        const start = m.random ? 0 : Math.min(Math.max(startIndex, 0), mod.lessons.length - 1);

        answeredRef.current = new Set();
        attemptsRef.current = new Map();
        setScore({ correct: 0, questions: 0 });
        setFinished(false);
        setFeedback(null);
        setStepIndex(start);
        setActiveModule(mod);
        updateLastLesson(m.id);
    };

    const exitLesson = () => {
        stop();
        setFinished(false);
        setActiveModule(null);
    };

    // Paso desde el que se retoma un módulo al abrirlo por voz o desde el inicio.
    const resumeIndexOf = (m) => {
        if (m.random || completedLessons.includes(m.id)) return 0;
        const reached = stepProgress[m.id];
        return reached == null ? 0 : Math.min(reached, m.lessons.length - 1);
    };

    // Disparo externo (voz: "llévame a mi última lección", o el botón de Inicio)
    useEffect(() => {
        if (!openModuleRequest?.moduleId) return;
        const mod = COURSES_DATA.find((m) => m.id === openModuleRequest.moduleId);
        if (mod) openModule(mod, resumeIndexOf(mod));
        onRequestHandled?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openModuleRequest]);

    // Al salir de esta sección, calla a Braulio
    useEffect(() => () => stop(), [stop]);

    // Mientras hay una lección abierta se oculta la barra inferior móvil
    // (ver index.css) para dejar sitio a las acciones de la lección.
    useEffect(() => {
        if (!activeModule || finished) return;
        document.body.dataset.lesson = feedback ? 'feedback' : 'on';
        return () => { delete document.body.dataset.lesson; };
    }, [activeModule, finished, feedback]);

    // Si el usuario silencia, cancelar la narración actual
    useEffect(() => {
        if (isMuted) stop();
    }, [isMuted, stop]);

    // Comparte lo que se está mostrando en Cursos ahora mismo (progreso de la
    // lección, o la pantalla de "terminaste el módulo" con la opción de
    // seguir) para que Braulio pueda contestar preguntas de contexto como
    // "¿cuánto me falta?" o resolver "sigue con el siguiente módulo" cuando
    // se lo piden aquí — ver hooks/useActiveLesson.js. Se borra al volver al
    // camino de módulos.
    useEffect(() => {
        if (!activeModule) {
            clearActiveLesson();
            return undefined;
        }
        const moduleIndex = COURSES_DATA.findIndex((m) => m.id === activeModule.id);

        if (finished) {
            setActiveLesson({
                kind: 'finished',
                moduleTitle: moduleName(activeModule.title),
                moduleIndex: moduleIndex >= 0 ? moduleIndex : 0,
                moduleTotal: COURSES_DATA.length,
                nextModuleId: nextModule?.id,
                nextModuleTitle: nextModule ? moduleName(nextModule.title) : undefined,
            });
            return () => clearActiveLesson();
        }

        if (!lesson) {
            clearActiveLesson();
            return undefined;
        }
        setActiveLesson({
            kind: 'lesson',
            moduleTitle: moduleName(activeModule.title),
            moduleIndex: moduleIndex >= 0 ? moduleIndex : 0,
            moduleTotal: COURSES_DATA.length,
            isRandom: !!activeModule.random,
            chapterTitle: chapter?.title,
            chapterIndex: chapter?.index,
            chapterTotal: chapter?.total,
            stepIndex,
            stepTotal: total,
            stepTitle: lesson.title,
            stepType: lesson.type,
        });
        return () => clearActiveLesson();
    }, [activeModule, finished, lesson, stepIndex, total, chapter, nextModule]);

    // ── PROGRESO ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (activeModule && !activeModule.random && !finished) saveStep(activeModule.id, stepIndex);
    }, [activeModule, stepIndex, finished, saveStep]);

    // ── NARRACIÓN + FOCO AL CAMBIAR DE PASO ──────────────────────────────────
    const narrate = () => {
        if (lesson) speak(buildNarration(lesson, stepIndex, total), true);
    };

    useEffect(() => {
        if (!activeModule || finished || !lesson) return;
        stepShownAtRef.current = performance.now();
        window.scrollTo({ top: 0 });
        const focusTimer = setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 100);
        if (isMuted) return () => clearTimeout(focusTimer);
        // Si acabas de acertar/fallar, Braulio todavía puede estar diciendo el
        // resultado ("¡Correcto!...") cuando llegas aquí — sin esto, la
        // narración del paso nuevo lo cortaba a medias en vez de dejarlo terminar.
        // Con "Narración breve" solo dice dónde estás (tocando a Braulio se oye completo).
        const text = briefNarration
            ? buildBriefNarration(lesson, stepIndex, total, moduleName(activeModule.title))
            : buildNarration(lesson, stepIndex, total);
        const speakTimer = setTimeout(() => waitUntilNotSpeaking(() => speak(text, true)), 600);
        return () => {
            clearTimeout(focusTimer);
            clearTimeout(speakTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepIndex, activeModule, finished]);

    // ── AVANZAR / RETROCEDER ─────────────────────────────────────────────────
    const finishModule = () => {
        markLessonComplete(activeModule.id);
        clearSteps(activeModule.id);
        setFeedback(null);
        setFinished(true);
        window.scrollTo({ top: 0 });
        // playNav ya decide solo si suena (ajuste de efectos de sonido, aparte de la voz)
        playNav(NOTES.FINISH_1);
        setTimeout(() => playNav(NOTES.FINISH_2), 150);
        setTimeout(() => playNav(NOTES.FINISH_3), 300);
        track('module_done', { module: activeModule.id, correct: score.correct, questions: score.questions });
        const scoreText = score.questions > 0 ? ` ${scoreSentence(score)}` : '';
        // Mismo caso: si el último ejercicio salió bien, deja que "¡Correcto!"
        // termine antes de anunciar que se terminó el módulo.
        waitUntilNotSpeaking(() => {
            speak(`¡Terminaste el ${activeModule.title.split(':')[0]}! Has hecho un gran trabajo.${scoreText}`, true);
        });
    };

    const goNext = () => {
        skipAttemptRef.current = false;
        setFeedback(null);
        if (stepIndex < total - 1) setStepIndex((i) => i + 1);
        else finishModule();
    };

    const goBack = () => {
        if (stepIndex === 0) return;
        skipAttemptRef.current = false;
        setFeedback(null);
        setStepIndex((i) => i - 1);
    };

    useEffect(() => { goNextRef.current = goNext; });

    // ── NAVEGACIÓN CON TECLADO (flechas) ────────────────────────────────────
    useEffect(() => {
        if (!activeModule || finished) return;

        const onKeyDown = (e) => {
            if (lesson?.type === 'memory') return;

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const isPassthrough = PASSTHROUGH.has(lesson?.type);

                if (isPassthrough || feedback) {
                    goNext();
                } else if (!skipAttemptRef.current) {
                    skipAttemptRef.current = true;
                    speak('Presiona de nuevo para saltar este ejercicio.');
                    clearTimeout(skipTimerRef.current);
                    skipTimerRef.current = setTimeout(() => { skipAttemptRef.current = false; }, 3000);
                } else {
                    speak('Saltando ejercicio.', true);
                    clearTimeout(skipTimerRef.current);
                    goNext();
                }
            }

            if (e.key === 'ArrowLeft' && stepIndex > 0) {
                e.preventDefault();
                goBack();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            clearTimeout(skipTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeModule, finished, feedback, stepIndex, lesson]);

    // ── VERIFICACIÓN DE RESPUESTAS ───────────────────────────────────────────
    const handleVerification = (isCorrect, description, explanation = '') => {
        if (lesson && activeModule) {
            const attempt = (attemptsRef.current.get(lesson.id) ?? 0) + 1;
            attemptsRef.current.set(lesson.id, attempt);
            track('lesson_answer', {
                module: activeModule.id,
                step: stepIndex,
                kind: lesson.type,
                correct: isCorrect,
                attempt,
                ms: Math.round(performance.now() - stepShownAtRef.current),
            });
        }
        if (lesson && !answeredRef.current.has(lesson.id)) {
            answeredRef.current.add(lesson.id);
            setScore((s) => ({ questions: s.questions + 1, correct: s.correct + (isCorrect ? 1 : 0) }));
        }

        const headline = isCorrect
            ? CORRECT_HEADLINES[Math.floor(Math.random() * CORRECT_HEADLINES.length)]
            : 'Casi. Inténtalo otra vez';
        const message = [description, explanation].filter(Boolean).join(' ');

        setFeedback({ status: isCorrect ? 'correct' : 'incorrect', headline, message });
        isCorrect ? playCorrect() : playIncorrect();
        speak(`${headline}${/[.!?]$/.test(headline) ? '' : '.'} ${message}`, true);
    };

    // ── RENDER DE CADA TIPO DE PASO ──────────────────────────────────────────
    const renderLesson = () => {
        switch (lesson.type) {
            case 'info':
                return <LessonInfo {...lesson} />;
            case 'vowel_learning':
                return <LessonVowel {...lesson} />;
            case 'explore':
                return <LessonExplore {...lesson} />;
            case 'check':
                return <LessonCheck lesson={lesson} feedback={feedback} onVerify={handleVerification} />;
            case 'builder':
            case 'mini_drill':
                return <LessonBuilder lesson={lesson} onVerify={handleVerification} />;
            case 'quiz':
                return <LessonQuiz lesson={lesson} onVerify={handleVerification} />;
            case 'true_false':
                return <LessonTrueFalse lesson={lesson} onVerify={handleVerification} />;
            case 'memory':
                return (
                    <MemoryGame
                        onComplete={() => {
                            speak('¡Excelente! Has completado el memorama.', true);
                            const atStep = stepIndex;
                            setTimeout(() => {
                                if (atStep === stepIndex) goNextRef.current();
                            }, 2000);
                        }}
                        playSuccess={() => playCorrect()}
                        playError={() => playIncorrect()}
                        speakText={speak}
                        onExit={exitLesson}
                    />
                );
            default:
                return (
                    <p className="text-oops" role="alert">
                        Error: tipo de paso no reconocido ({lesson.type})
                    </p>
                );
        }
    };

    // ── CAMINO DE MÓDULOS ────────────────────────────────────────────────────
    if (!activeModule) {
        return <CoursePath modules={COURSES_DATA} onStart={openModule} />;
    }

    // ── MÓDULO TERMINADO ─────────────────────────────────────────────────────
    if (finished) {
        return (
            <div className="page flex flex-col items-center gap-8 text-center">
                <div className="pop mt-2" aria-hidden="true">
                    <Braulio mood="celebrate" size={230} />
                </div>

                <div className="flex flex-col gap-3">
                    <h1 tabIndex={-1} ref={headingRef} className="text-4xl md:text-5xl">
                        ¡Terminaste el módulo!
                    </h1>
                    <p className="text-xl text-ink-soft">
                        {moduleName(activeModule.title)} · {activeModule.subtitle}
                    </p>
                </div>

                <GuideNote className="max-w-lg text-left">
                    {score.questions > 0 ? `${scoreSentence(score)} ` : ''}
                    Cada paso que das hace que el Braille se sienta más tuyo.
                </GuideNote>

                <div className="flex w-full max-w-md flex-col gap-3">
                    {nextModule && (
                        <button
                            type="button"
                            className="btn btn-primary btn-lg btn-block"
                            onClick={() => openModule(nextModule, 0)}
                        >
                            Seguir con el {nextModule.title.split(':')[0]}
                            <ArrowRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    )}
                    <button type="button" className="btn btn-secondary btn-lg btn-block" onClick={exitLesson}>
                        Volver al camino
                    </button>
                    <button
                        type="button"
                        className="btn btn-ghost btn-block"
                        onClick={() => openModule(COURSES_DATA.find((m) => m.id === activeModule.id), 0)}
                    >
                        <RotateCcw className="h-5 w-5" aria-hidden="true" />
                        Repetir este módulo
                    </button>
                </div>
            </div>
        );
    }

    // ── LECCIÓN ACTIVA ───────────────────────────────────────────────────────
    return (
        <LessonPlayer
            title={lesson.title}
            headingRef={headingRef}
            chapter={chapter}
            step={{ index: stepIndex, total }}
            feedback={feedback}
            isExercise={!PASSTHROUGH.has(lesson.type)}
            hideActions={lesson.type === 'memory'}
            canGoBack={stepIndex > 0}
            isLast={stepIndex === total - 1}
            onExit={exitLesson}
            onBack={goBack}
            onNext={goNext}
            onSkip={goNext}
            onRetry={() => setFeedback(null)}
            onReplay={narrate}
            onOpenPanel={onOpenPanel}
        >
            {renderLesson()}
        </LessonPlayer>
    );
};

export default CourseSection;
