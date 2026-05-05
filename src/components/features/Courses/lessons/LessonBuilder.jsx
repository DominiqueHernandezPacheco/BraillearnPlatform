import React, { useState, useEffect } from 'react';
import InteractiveBrailleCell from '../../../common/InteractiveBrailleCell';
import useBrailleKeyboard from '../../../../hooks/useBrailleKeyboard';
import useBrailleSound from '../../../../hooks/useBrailleSound';
import { braillePatterns } from '../../../../constants/braillePatterns';
import { useAudio } from '../../../../context/AudioContext';
import { NOTES } from '../../../../constants/soundConfig';

const LessonBuilder = ({ lesson, onVerify }) => {
    const [dots, setDots] = useState([false, false, false, false, false, false]);
    const { playNav, playPattern } = useBrailleSound();
    const { isMuted, speak } = useAudio();

    // Resetea los puntos si cambia la lección
    useEffect(() => {
        setDots([false, false, false, false, false, false]);
    }, [lesson]);

    const toggleDot = (idx) => {
        const newDots = [...dots];
        newDots[idx] = !newDots[idx];
        setDots(newDots);

        if (!isMuted) {
            playNav(NOTES.DOT_TOGGLE);
            const status = newDots[idx] ? 'activado' : 'desactivado';
            speak(`Punto ${idx + 1} ${status}`, true);
        }
    };

    // Teclado FDS-JKL para activar puntos Braille
    useBrailleKeyboard(toggleDot, true);

    const handleVerify = () => {
        const target    = lesson.char || lesson.targetChar;
        const isCorrect = JSON.stringify(dots) === JSON.stringify(braillePatterns[target]);

        const activeNumbers = dots.map((d, i) => d ? i + 1 : null).filter(Boolean);
        const descriptionText = activeNumbers.length > 0
            ? `Construiste: Puntos ${activeNumbers.join(' y ')}.`
            : 'No seleccionaste ningún punto.';

        onVerify(isCorrect, descriptionText);
    };

    // Enter → verificar
    useEffect(() => {
        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                // Si el foco está en un punto de la celda (SVG circle), Enter ya fue
                // manejado por InteractiveBrailleCell — no verificamos dos veces.
                if (document.activeElement?.getAttribute('role') === 'button' &&
                    document.activeElement?.closest('[role="group"]')) return;

                handleVerify();
            }
        };
        window.addEventListener('keydown', handleEnter);
        return () => window.removeEventListener('keydown', handleEnter);
    }, [dots]);

    // Espacio → escuchar el patrón que el usuario ha construido hasta ahora
    useEffect(() => {
        const handleSpace = (e) => {
            if (e.key !== ' ') return;

            // Si el foco está en un punto de la celda, Espacio ya está manejado ahí
            if (document.activeElement?.getAttribute('role') === 'button' &&
                document.activeElement?.closest('[role="group"]')) return;

            // Si el foco está en el botón Verificar, dejamos que el browser lo active
            if (document.activeElement?.tagName === 'BUTTON') return;

            e.preventDefault();
            if (!isMuted) {
                const target = lesson.char || lesson.targetChar;
                playPattern(dots, target);
            }
        };
        window.addEventListener('keydown', handleSpace);
        return () => window.removeEventListener('keydown', handleSpace);
    }, [dots, isMuted, lesson]);

    return (
        <div className="flex flex-col items-center w-full animate-fadeIn">
            <p className="text-2xl font-medium mb-8 text-gray-700 max-w-xl">{lesson.question}</p>

            <div className="p-8 bg-white rounded-3xl shadow-xl mb-6 border-2 border-blue-50">
                <InteractiveBrailleCell dots={dots} onClick={toggleDot} size="huge" />
            </div>

            {/* Instrucciones de teclado — visibles y legibles por lectores de pantalla */}
            <div className="text-center text-sm text-gray-400 mb-6 space-y-1">
                <p>
                    <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border text-xs">F</kbd> p.1 ·{' '}
                    <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border text-xs">D</kbd> p.2 ·{' '}
                    <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border text-xs">S</kbd> p.3 ·{' '}
                    <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border text-xs">J</kbd> p.4 ·{' '}
                    <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border text-xs">K</kbd> p.5 ·{' '}
                    <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border text-xs">L</kbd> p.6
                </p>
                <p>
                    <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border text-xs">Espacio</kbd> escuchar patrón ·{' '}
                    <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border text-xs">Enter</kbd> verificar
                </p>
            </div>

            <button
                onClick={handleVerify}
                aria-label="Verificar patrón. Atajo: tecla Enter."
                className="px-10 py-4 bg-green-500 text-white font-bold text-xl rounded-xl hover:bg-green-600 shadow-lg transform hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-green-300"
            >
                Verificar
            </button>
        </div>
    );
};

export default LessonBuilder;
