import React, { useState, useEffect } from 'react';
import InteractiveBrailleCell from '../../../common/InteractiveBrailleCell';
import useBrailleKeyboard from '../../../../hooks/useBrailleKeyboard';
import useBrailleSound from '../../../../hooks/useBrailleSound';
import { braillePatterns } from '../../../../constants/braillePatterns';

const LessonBuilder = ({ lesson, onVerify, isMuted, speak }) => {
    // El estado vive AQUI ahora, no en CourseSection
    const [dots, setDots] = useState([false, false, false, false, false, false]);
    const { playNav } = useBrailleSound();

    // Reseteamos los puntos si cambia la lección
    useEffect(() => {
        setDots([false, false, false, false, false, false]);
    }, [lesson]);

    const toggleDot = (idx) => {
        const newDots = [...dots];
        newDots[idx] = !newDots[idx];
        setDots(newDots);
        
        if(!isMuted) {
            playNav("C4");
            const status = newDots[idx] ? "activado" : "desactivado";
            speak(`Punto ${idx + 1} ${status}`, true);
        }
    };

    // Conectamos el teclado
    useBrailleKeyboard(toggleDot, true);

    const handleVerify = () => {
        const target = lesson.char || lesson.targetChar;
        const isCorrect = JSON.stringify(dots) === JSON.stringify(braillePatterns[target]);
        
        // Preparamos info extra para el feedback
        const activeNumbers = dots.map((d, i) => d ? i + 1 : null).filter(Boolean);
        const descriptionText = activeNumbers.length > 0 
            ? `Construiste: Puntos ${activeNumbers.join(' y ')}.` 
            : "No seleccionaste ningún punto.";

        // Le pasamos el resultado al padre
        onVerify(isCorrect, descriptionText);
    };

    return (
        <div className="flex flex-col items-center w-full animate-fadeIn">
            <p className="text-2xl font-medium mb-8 text-gray-700 max-w-xl">{lesson.question}</p>
            <div className="p-8 bg-white rounded-3xl shadow-xl mb-8 border-2 border-blue-50">
                <InteractiveBrailleCell dots={dots} onClick={toggleDot} size="huge" />
            </div>
            <button 
                onClick={handleVerify} 
                className="px-10 py-4 bg-green-500 text-white font-bold text-xl rounded-xl hover:bg-green-600 shadow-lg transform hover:-translate-y-1 transition-all"
            >
                Verificar
            </button>
        </div>
    );
};

export default LessonBuilder;