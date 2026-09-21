import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
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
                // Si el foco está en un punto de la celda (SVG), Enter ya fue
                // manejado por InteractiveBrailleCell — no verificamos dos veces.
                if (document.activeElement?.getAttribute('role') === 'button' &&
                    document.activeElement?.closest('[role="group"]')) return;

                handleVerify();
            }
        };
        window.addEventListener('keydown', handleEnter);
        return () => window.removeEventListener('keydown', handleEnter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dots]);

    // Espacio → escuchar el patrón que el usuario ha construido hasta ahora
    useEffect(() => {
        const handleSpace = (e) => {
            if (e.key !== ' ') return;

            // Si el foco está en un punto de la celda, Espacio ya está manejado ahí
            if (document.activeElement?.getAttribute('role') === 'button' &&
                document.activeElement?.closest('[role="group"]')) return;

            // Si el foco está en un botón, dejamos que el navegador lo active
            if (document.activeElement?.tagName === 'BUTTON') return;

            e.preventDefault();
            if (!isMuted) {
                const target = lesson.char || lesson.targetChar;
                playPattern(dots, target);
            }
        };
        window.addEventListener('keydown', handleSpace);
        return () => window.removeEventListener('keydown', handleSpace);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dots, isMuted, lesson]);

    return (
        <div className="flex flex-col gap-7">
            <p className="text-2xl font-bold leading-snug text-ink md:text-[1.75rem]">{lesson.question}</p>

            <div className="card dots-grid flex justify-center px-4 py-8">
                <InteractiveBrailleCell dots={dots} onClick={toggleDot} size="huge" />
            </div>

            {/* Instrucciones de teclado — visibles y legibles por lectores de pantalla */}
            <div className="flex flex-col gap-2 text-base text-ink-soft">
                <p>
                    <span className="kbd">F</span> punto 1 · <span className="kbd">D</span> punto 2 ·{' '}
                    <span className="kbd">S</span> punto 3 · <span className="kbd">J</span> punto 4 ·{' '}
                    <span className="kbd">K</span> punto 5 · <span className="kbd">L</span> punto 6
                </p>
                <p>
                    <span className="kbd">Espacio</span> escuchar tu patrón · <span className="kbd">Enter</span> verificar
                </p>
            </div>

            <button
                type="button"
                onClick={handleVerify}
                aria-label="Verificar patrón. Atajo: tecla Enter."
                className="btn btn-primary btn-lg btn-block"
            >
                <Check className="h-6 w-6" strokeWidth={3.5} aria-hidden="true" />
                Verificar
            </button>
        </div>
    );
};

export default LessonBuilder;
