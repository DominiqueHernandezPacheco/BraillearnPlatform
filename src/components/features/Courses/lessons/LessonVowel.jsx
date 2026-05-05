import React, { useEffect } from 'react';
import { braillePatterns } from '../../../../constants/braillePatterns';
import BrailleCell from '../../../common/BrailleCell';
import useBrailleSound from '../../../../hooks/useBrailleSound';
import { useAudio } from '../../../../context/AudioContext';

const LessonVowel = ({ char, visualDesc, patternExp }) => {
    const { playPattern } = useBrailleSound();
    const { isMuted } = useAudio();

    const play = () => {
        if (!isMuted) {
            playPattern(braillePatterns[char], char);
        }
    };

    // Atajo de teclado: Barra Espaciadora
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                // Solo disparamos manual si el foco no está ya en el botón
                // (en ese caso el navegador dispara onClick automáticamente)
                if (document.activeElement.tagName !== 'BUTTON') {
                    play();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [char, isMuted]); // Se actualiza si cambia la letra o el estado de mute

    return (
        <div className="flex flex-col items-center w-full animate-fadeIn">
            <div className="bg-white p-8 rounded-3xl shadow-xl mb-8 transform transition-transform hover:scale-105">
                <BrailleCell dots={braillePatterns[char]} size="huge" isInteractive={false}/>
            </div>

            <div className="bg-white px-8 py-4 rounded-xl shadow-sm border border-gray-200 mb-8 max-w-lg text-center">
                <p className="text-xl font-medium text-gray-800 mb-2">{visualDesc}</p>
                <p className="text-gray-500">{patternExp}</p>
            </div>

            <button
                onClick={play}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-md transition-all flex items-center gap-2 hover:-translate-y-1 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                aria-label={`Escuchar el ritmo de la letra ${char}. Atajo: Barra Espaciadora.`}
            >
                🔊 Escuchar Ritmo
            </button>

            <p className="mt-4 text-sm text-gray-500 flex items-center gap-1">
                <span className="bg-gray-200 px-2 py-1 rounded text-xs font-bold border border-gray-300">Espacio</span>
                <span>para reproducir</span>
            </p>
        </div>
    );
};

export default LessonVowel;
