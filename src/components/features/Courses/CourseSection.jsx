import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from '../../common/Icons';
import useBrailleSound from '../../../hooks/useBrailleSound';
import { COURSES_DATA } from '../../../data/courseData';
import { generateRandomExercises } from '../../../utils/courseGenerator';
import { useAudio } from '../../../context/AudioContext';
import { braillePatterns } from '../../../constants/braillePatterns';
import { NOTES } from '../../../constants/soundConfig';

import CourseMenu from './CourseMenu';
import MemoryGame from './MemoryGame';
import LessonInfo from './lessons/LessonInfo';
import LessonVowel from './lessons/LessonVowel';
import LessonBuilder from './lessons/LessonBuilder';
import LessonQuiz from './lessons/LessonQuiz';
import LessonTrueFalse from './lessons/LessonTrueFalse';

const CourseSection = ({ highContrast }) => {
    const { playNav } = useBrailleSound();
    const [activeModule, setActiveModule]           = useState(null);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [feedback, setFeedback]                   = useState(null);
    const { isMuted, speak }                        = useAudio();
    const lessonContainerRef = useRef(null);
    const skipAttemptRef     = useRef(false);
    const skipTimerRef       = useRef(null);

    const bgClass     = highContrast ? 'bg-black'   : 'bg-white';
    const cardBgClass = highContrast ? 'bg-white'   : 'bg-gray-50';

    // Cancelar speech al desmontar
    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);

    // Si el usuario silencia, cancelar la narración actual
    useEffect(() => {
        if (isMuted) window.speechSynthesis.cancel();
    }, [isMuted]);

    // Foco al título al cambiar de lección (ayuda a los lectores de pantalla)
    useEffect(() => {
        if (activeModule) {
            setTimeout(() => {
                if (lessonContainerRef.current) lessonContainerRef.current.focus();
            }, 100);
        }
    }, [currentLessonIndex, activeModule]);

    // ── ABRIR / CERRAR MÓDULO ────────────────────────────────────────────────
    const openModule = (m) => {
        let mod = m;
        if (m.id === 3) {
            mod = { ...m, lessons: generateRandomExercises() };
        }
        setActiveModule(mod);
        setCurrentLessonIndex(0);
        setFeedback(null);
    };

    const handleFinishModule = () => {
        setActiveModule(null);
        if (!isMuted) {
            playNav(NOTES.FINISH_1);
            setTimeout(() => playNav(NOTES.FINISH_2), 150);
            setTimeout(() => playNav(NOTES.FINISH_3), 300);
            speak('¡Módulo finalizado! Has hecho un gran trabajo.', true);
        }
    };

    // Salida desde el MemoryGame con tecla Escape
    const handleMemoryExit = () => {
        setActiveModule(null);
        window.speechSynthesis.cancel();
    };

    // ── LECTURA AUTOMÁTICA AL CAMBIAR DE LECCIÓN ─────────────────────────────
    useEffect(() => {
        if (!activeModule || isMuted) return;

        const lesson      = activeModule.lessons[currentLessonIndex];
        const lessonNum   = `Lección ${currentLessonIndex + 1} de ${activeModule.lessons.length}. `;
        let text          = '';

        if (lesson.type === 'info') {
            text = `${lessonNum}${lesson.title}. ${lesson.content}. ${lesson.highlight || ''}`;

        } else if (lesson.type === 'vowel_learning') {
            text = `${lessonNum}${lesson.title}. ${lesson.audioDesc}. ` +
                   `Pulsa el botón o la tecla Espacio para escuchar el ritmo Braille.`;

        } else if (lesson.type === 'quiz') {
            const dots       = braillePatterns[lesson.targetChar];
            const activeDots = dots
                ? dots.map((d, i) => d ? (i + 1) : null).filter(Boolean).join(' y ')
                : 'ninguno';
            text = `${lessonNum}Pregunta: ${lesson.question}. ` +
                   `El patrón mostrado tiene los puntos: ${activeDots}. ` +
                   `Opciones: ${lesson.options.map((o, i) => `${i + 1}: ${o.toUpperCase()}`).join(', ')}. ` +
                   `Usa las teclas 1, 2 o 3 para responder.`;

        } else if (lesson.type === 'true_false') {
            const dots       = braillePatterns[lesson.displayChar];
            const activeDots = dots
                ? dots.map((d, i) => d ? (i + 1) : null).filter(Boolean).join(' y ')
                : 'ninguno';
            text = `${lessonNum}Verdadero o Falso: ${lesson.question}. ` +
                   `El patrón en pantalla tiene los puntos: ${activeDots}. ` +
                   `Pulsa V para Verdadero o F para Falso.`;

        } else if (lesson.type === 'builder' || lesson.type === 'mini_drill') {
            text = `${lessonNum}${lesson.title}. ${lesson.question}. ` +
                   `Usa el teclado Braille: F es punto 1, D es punto 2, S es punto 3, ` +
                   `J es punto 4, K es punto 5, L es punto 6. ` +
                   `Espacio para escuchar el patrón que construiste. Enter para verificar.`;

        } else if (lesson.type === 'memory') {
            text = `${lessonNum}${lesson.title}. ${lesson.question}`;
        }

        const timer = setTimeout(() => speak(text, true), 600);
        return () => clearTimeout(timer);
    }, [currentLessonIndex, activeModule]);

    // ── NAVEGACIÓN CON TECLADO (flechas) ────────────────────────────────────
    useEffect(() => {
        const handleNavigationKeys = (e) => {
            // Cuando el MemoryGame está activo, las flechas son suyas — no interferir
            const currentType = activeModule?.lessons[currentLessonIndex]?.type;
            if (currentType === 'memory') return;

            if (e.key === 'ArrowRight') {
                e.preventDefault();

                const isPassthrough = currentType === 'info' || currentType === 'vowel_learning';

                if (isPassthrough || feedback) {
                    if (currentLessonIndex < activeModule.lessons.length - 1) {
                        setCurrentLessonIndex(c => c + 1);
                        setFeedback(null);
                        skipAttemptRef.current = false;
                    } else {
                        handleFinishModule();
                    }
                } else {
                    if (!skipAttemptRef.current) {
                        skipAttemptRef.current = true;
                        speak('Presiona de nuevo para saltar este ejercicio.');
                        clearTimeout(skipTimerRef.current);
                        skipTimerRef.current = setTimeout(() => {
                            skipAttemptRef.current = false;
                        }, 3000);
                    } else {
                        speak('Saltando ejercicio.', true);
                        clearTimeout(skipTimerRef.current);
                        skipAttemptRef.current = false;
                        if (currentLessonIndex < activeModule.lessons.length - 1) {
                            setCurrentLessonIndex(c => c + 1);
                            setFeedback(null);
                        } else {
                            handleFinishModule();
                        }
                    }
                }
            }

            if (e.key === 'ArrowLeft') {
                if (currentLessonIndex > 0) {
                    e.preventDefault();
                    setCurrentLessonIndex(c => c - 1);
                    setFeedback(null);
                    skipAttemptRef.current = false;
                }
            }
        };

        window.addEventListener('keydown', handleNavigationKeys);
        return () => {
            window.removeEventListener('keydown', handleNavigationKeys);
            clearTimeout(skipTimerRef.current);
        };
    }, [feedback, currentLessonIndex, activeModule]);

    // ── VERIFICACIÓN DE RESPUESTAS ────────────────────────────────────────────
    const handleVerification = (isCorrect, descriptionText) => {
        const resultText = isCorrect ? '¡Es Correcto!' : 'Es Incorrecto.';
        const finalText  = `${descriptionText} ${resultText}`;

        if (isCorrect) {
            setFeedback('correct');
            if (!isMuted) playNav(NOTES.CORRECT);
        } else {
            setFeedback('incorrect');
            if (!isMuted) playNav(NOTES.INCORRECT);
        }

        speak(finalText, true);
    };

    // ── RENDERIZADO DE LA LECCIÓN ACTIVA ─────────────────────────────────────
    const renderLessonContent = () => {
        const lesson = activeModule.lessons[currentLessonIndex];

        switch (lesson.type) {
            case 'info':
                return <LessonInfo {...lesson} />;

            case 'vowel_learning':
                return <LessonVowel {...lesson} />;

            case 'builder':
            case 'mini_drill':
                return (
                    <LessonBuilder
                        lesson={lesson}
                        onVerify={handleVerification}
                    />
                );

            case 'quiz':
                return <LessonQuiz lesson={lesson} onVerify={handleVerification} />;

            case 'true_false':
                return <LessonTrueFalse lesson={lesson} onVerify={handleVerification} />;

            case 'memory':
                return (
                    <MemoryGame
                        onComplete={() => {
                            speak('¡Excelente! Has completado el memorama.', true);
                            // Avanzar automáticamente a la siguiente lección
                            setTimeout(() => {
                                if (currentLessonIndex < activeModule.lessons.length - 1) {
                                    setCurrentLessonIndex(c => c + 1);
                                    setFeedback(null);
                                } else {
                                    handleFinishModule();
                                }
                            }, 2000);
                        }}
                        playSuccess={() => !isMuted && playNav(NOTES.CORRECT)}
                        playError={() => !isMuted && playNav(NOTES.INCORRECT)}
                        speakText={speak}
                        onExit={handleMemoryExit}
                    />
                );

            default:
                return (
                    <p className="text-red-500" role="alert">
                        Error: Tipo de lección no reconocido ({lesson.type})
                    </p>
                );
        }
    };

    // ── MENÚ DE MÓDULOS ───────────────────────────────────────────────────────
    if (!activeModule) {
        return (
            <CourseMenu
                modules={COURSES_DATA}
                onSelect={openModule}
                highContrast={highContrast}
            />
        );
    }

    // ── LECCIÓN ACTIVA ────────────────────────────────────────────────────────
    return (
        <section
            className={`min-h-screen ${bgClass} pt-24 px-6 flex flex-col items-center animate-fadeIn transition-colors duration-300`}
        >
            <div className="w-full max-w-4xl">

                {/* Barra superior: botón "Mapa" y contador */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => { setActiveModule(null); window.speechSynthesis.cancel(); }}
                        aria-label="Volver al mapa de módulos"
                        className={`flex items-center font-bold transition-colors text-lg focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg px-2 py-1 ${highContrast ? 'text-yellow-300 hover:text-white' : 'text-gray-500 hover:text-blue-600'}`}
                    >
                        <ChevronLeft className="w-6 h-6 mr-1" aria-hidden="true" /> Mapa
                    </button>

                    <div
                        className={`px-4 py-1 rounded-full ${highContrast ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                        aria-label={`Lección ${currentLessonIndex + 1} de ${activeModule.lessons.length}`}
                    >
                        <span className="font-bold font-mono">
                            {currentLessonIndex + 1} / {activeModule.lessons.length}
                        </span>
                    </div>
                </div>

                {/* Tarjeta de contenido */}
                <div
                    className={`${cardBgClass} rounded-3xl p-8 md:p-12 shadow-inner text-center min-h-[550px] flex flex-col items-center justify-center relative transition-all`}
                >
                    <h2
                        ref={lessonContainerRef}
                        tabIndex="-1"
                        className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 outline-none"
                    >
                        {activeModule.lessons[currentLessonIndex].title}
                    </h2>

                    {renderLessonContent()}

                    {/* Feedback — role="alert" garantiza que el lector de pantalla lo anuncie */}
                    {feedback && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className={`mt-8 px-8 py-4 rounded-xl text-xl font-bold animate-bounce shadow-md ${
                                feedback === 'correct'
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-red-100 text-red-700 border border-red-200'
                            }`}
                        >
                            {feedback === 'correct'
                                ? '🎉 ¡Correcto! Muy bien.'
                                : '❌ No es correcto. Intenta de nuevo.'}
                        </div>
                    )}
                </div>

                {/* Footer: navegación anterior / siguiente */}
                <div className="flex justify-between mt-8 mb-12">
                    <button
                        disabled={currentLessonIndex === 0}
                        onClick={() => { setCurrentLessonIndex(c => c - 1); setFeedback(null); }}
                        aria-label="Lección anterior"
                        className="px-6 py-3 bg-gray-200 text-gray-600 rounded-xl font-bold disabled:opacity-50 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300"
                    >
                        Anterior
                    </button>

                    {currentLessonIndex < activeModule.lessons.length - 1 ? (
                        <button
                            onClick={() => { setCurrentLessonIndex(c => c + 1); setFeedback(null); }}
                            aria-label="Siguiente lección"
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-colors flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                            Siguiente <ChevronRight className="w-5 h-5" aria-hidden="true" />
                        </button>
                    ) : (
                        <button
                            onClick={handleFinishModule}
                            aria-label="Finalizar módulo"
                            className="px-8 py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold hover:bg-yellow-500 shadow-lg transition-colors flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-yellow-300"
                        >
                            Finalizar Módulo <CheckCircle className="w-5 h-5" aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CourseSection;
