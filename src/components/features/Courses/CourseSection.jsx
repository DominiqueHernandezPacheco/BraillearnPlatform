import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from '../../common/Icons';
import useBrailleSound from '../../../hooks/useBrailleSound';
import { COURSES_DATA } from '../../../data/courseData';
import { generateRandomExercises } from '../../../utils/courseGenerator';

//Componentes de lecciones
import CourseMenu from './CourseMenu';
import MemoryGame from './MemoryGame';
import LessonInfo from './lessons/LessonInfo';
import LessonVowel from './lessons/LessonVowel';
import LessonBuilder from './lessons/LessonBuilder';
import LessonQuiz from './lessons/LessonQuiz';         // Nuevo
import LessonTrueFalse from './lessons/LessonTrueFalse'; // Nuevo

const CourseSection = ({ isMuted, highContrast }) => {
    const { playNav } = useBrailleSound(); 
    const [activeModule, setActiveModule] = useState(null);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [feedback, setFeedback] = useState(null);

    const bgClass = highContrast ? 'bg-black' : 'bg-white';
    const cardBgClass = highContrast ? 'bg-white' : 'bg-gray-50';

    // --- MANEJO DE AUDIO ---
    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);

    // Cada que cambiamos mute, cancelamos el audio actual
    useEffect(() => {
        if(isMuted) window.speechSynthesis.cancel();
    }, [isMuted]);

    const speak = (text, shouldInterrupt = true) => {
        if(isMuted) return;
        if (shouldInterrupt) window.speechSynthesis.cancel();
        
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'es-ES';
        window.speechSynthesis.speak(u);
    };

    // --- MANEJO DEL MÓDULO ---
    const openModule = (m) => {
        let mod = m;
        // Si es el módulo de retos (ID 3), generamos ejercicios al azar
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
            playNav("C5");
            setTimeout(() => playNav("E5"), 150);
            setTimeout(() => playNav("G5"), 300);
            speak("¡Módulo finalizado! Has hecho un gran trabajo.", true);
        }
    };

    // --- MANEJO DE LECCIONES ---
    
    // Lectura automática al cambiar de slide
    useEffect(() => {
        if (activeModule && !isMuted) {
            const lesson = activeModule.lessons[currentLessonIndex];
            let text = "";

            // Generamos el texto a leer según el tipo de lección
            if (lesson.type === 'info') {
                text = `${lesson.title}. ${lesson.content}. ${lesson.highlight || ""}`;
            } else if (lesson.type === 'vowel_learning') {
                text = `${lesson.title}. ${lesson.audioDesc}. Pulsa el botón para escuchar el ritmo.`;
            } else if (lesson.type === 'quiz') {
                text = `Pregunta: ${lesson.question}. Opciones disponibles: ${lesson.options.join(', ')}.`;
            } else if (lesson.type === 'true_false') {
                text = `Pregunta de verdadero o falso: ${lesson.question}.`;
            } else if (lesson.type === 'builder' || lesson.type === 'mini_drill') {
                text = `${lesson.title}. ${lesson.question}. Usa el teclado FDS JKL o toca los puntos.`;
            } else if (lesson.type === 'memory') {
                text = `${lesson.title}. ${lesson.question}`;
            }
            
            // Leemos con un pequeño retraso
            const timer = setTimeout(() => speak(text, true), 600);
            return () => clearTimeout(timer);
        }
    }, [currentLessonIndex, activeModule]);


    // Función central para verificar respuestas
    const handleVerification = (isCorrect, descriptionText) => {
        const resultText = isCorrect ? "¡Es Correcto!" : "Es Incorrecto.";
        const finalText = `${descriptionText} ${resultText}`;

        if (isCorrect) {
            setFeedback("correct");
            if(!isMuted) playNav("G5");
        } else {
            setFeedback("incorrect");
            if(!isMuted) playNav("C3");
        }
        
        speak(finalText, true);
    };

    // --- RENDERIZADO DEL CONTENIDO ---
    const renderLessonContent = () => {
        const lesson = activeModule.lessons[currentLessonIndex];

        switch (lesson.type) {
            case 'info':
                return <LessonInfo {...lesson} />;
            
            case 'vowel_learning':
                return <LessonVowel {...lesson} isMuted={isMuted} />;
            
            case 'builder':
            case 'mini_drill':
                return (
                    <LessonBuilder 
                        lesson={lesson} 
                        onVerify={handleVerification} 
                        isMuted={isMuted} 
                        speak={speak} 
                    />
                );

            case 'quiz':
                return <LessonQuiz lesson={lesson} onVerify={handleVerification} />;

            case 'true_false':
                return <LessonTrueFalse lesson={lesson} onVerify={handleVerification} />;

            case 'memory':
                return (
                    <MemoryGame 
                        onComplete={() => speak("¡Excelente! Has completado el memorama.", true)} 
                        playSuccess={() => !isMuted && playNav("G5")} 
                        playError={() => !isMuted && playNav("C3")} 
                        speakText={speak} 
                    />
                );

            default:
                return <p className="text-red-500">Error: Tipo de lección no reconocido ({lesson.type})</p>;
        }
    };

    // --- VISTA PRINCIPAL (Si no hay módulo activo, mostrar menú) ---
    if (!activeModule) {
        return <CourseMenu modules={COURSES_DATA} onSelect={openModule} highContrast={highContrast} />;
    }

    // --- VISTA DE LECCIÓN ACTIVA ---
    return (
        <section className={`min-h-screen ${bgClass} pt-24 px-6 flex flex-col items-center animate-fadeIn transition-colors duration-300`}>
            <div className="w-full max-w-4xl">
                
                {/* Header: Botón "Mapa" y Contador de páginas */}
                <div className="flex justify-between items-center mb-8">
                    <button onClick={() => { setActiveModule(null); window.speechSynthesis.cancel(); }} className={`flex items-center font-bold transition-colors text-lg ${highContrast ? 'text-yellow-300 hover:text-white' : 'text-gray-500 hover:text-blue-600'}`}>
                        <ChevronLeft className="w-6 h-6 mr-1"/> Mapa
                    </button>
                    <div className={`px-4 py-1 rounded-full ${highContrast ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <span className="font-bold font-mono">{currentLessonIndex + 1} / {activeModule.lessons.length}</span>
                    </div>
                </div>

                {/* Tarjeta de Contenido */}
                <div className={`${cardBgClass} rounded-3xl p-8 md:p-12 shadow-inner text-center min-h-[550px] flex flex-col items-center justify-center relative transition-all`}>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">{activeModule.lessons[currentLessonIndex].title}</h2>

                    {/* ¡AQUÍ SE RENDERIZA LA MAGIA! */}
                    {renderLessonContent()}

                    {/* Mensaje de Feedback (Correcto/Incorrecto) */}
                    {feedback && (
                        <div className={`mt-8 px-8 py-4 rounded-xl text-xl font-bold animate-bounce shadow-md ${feedback === 'correct' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                            {feedback === 'correct' ? '🎉 ¡Correcto! Muy bien.' : '❌ No es correcto. Intenta de nuevo.'}
                        </div>
                    )}
                </div>

                {/* Footer: Navegación Anterior / Siguiente */}
                <div className="flex justify-between mt-8 mb-12">
                    <button 
                        disabled={currentLessonIndex === 0} 
                        onClick={() => {setCurrentLessonIndex(c => c-1); setFeedback(null);}} 
                        className="px-6 py-3 bg-gray-200 text-gray-600 rounded-xl font-bold disabled:opacity-50 hover:bg-gray-300 transition-colors"
                    >
                        Anterior
                    </button>
                    
                    {currentLessonIndex < activeModule.lessons.length - 1 ? 
                        <button 
                            onClick={() => {setCurrentLessonIndex(c => c+1); setFeedback(null);}} 
                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-colors flex items-center gap-2"
                        >
                            Siguiente <ChevronRight className="w-5 h-5"/>
                        </button> 
                        :
                        <button 
                            onClick={handleFinishModule} 
                            className="px-8 py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold hover:bg-yellow-500 shadow-lg transition-colors flex items-center gap-2"
                        >
                            Finalizar Módulo <CheckCircle className="w-5 h-5"/>
                        </button>
                    }
                </div>
            </div>
        </section>
    );
};

export default CourseSection;