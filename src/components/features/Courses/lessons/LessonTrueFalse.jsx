import React, { useEffect } from 'react';
import { braillePatterns } from '../../../../constants/braillePatterns';
import BrailleCell from '../../../common/BrailleCell';

const LessonTrueFalse = ({ lesson, onVerify }) => {

    const handleChoice = (choice) => {
        const isCorrect   = choice === lesson.isCorrect;
        const description = `Elegiste ${choice ? 'Verdadero' : 'Falso'}.`;
        onVerify(isCorrect, description);
    };

    // Atajos de teclado:
    //   V → Verdadero (verdad)
    //   F → Falso
    //   1 → Verdadero
    //   2 → Falso
    useEffect(() => {
        const handleKey = (e) => {
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            const key = e.key.toLowerCase();
            if (key === 'v' || key === '1') handleChoice(true);
            if (key === 'f' || key === '2') handleChoice(false);
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lesson]);

    return (
        <div className="flex flex-col items-center w-full animate-fadeIn">
            <p className="text-2xl font-medium mb-8 text-gray-700">{lesson.question}</p>

            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border-2 border-gray-100">
                <BrailleCell
                    dots={braillePatterns[lesson.displayChar]}
                    size="large"
                    isInteractive={false}
                />
            </div>

            {/* Instrucción de atajo */}
            <p className="text-sm text-gray-400 mb-4">
                Atajo:{' '}
                <kbd className="bg-gray-100 px-2 py-0.5 rounded border text-xs">V</kbd> Verdadero
                {' · '}
                <kbd className="bg-gray-100 px-2 py-0.5 rounded border text-xs">F</kbd> Falso
            </p>

            <div className="flex gap-6 w-full max-w-md justify-center">
                <button
                    onClick={() => handleChoice(true)}
                    aria-label="Verdadero. Atajo: tecla V o 1."
                    className="flex-1 py-4 bg-green-100 text-green-700 border-2 border-green-200 rounded-xl font-bold text-xl hover:bg-green-500 hover:text-white transition-all focus:outline-none focus:ring-4 focus:ring-green-300 relative"
                >
                    Verdadero
                    <span className="absolute top-1 right-2 text-xs font-normal text-gray-400" aria-hidden="true">V</span>
                </button>
                <button
                    onClick={() => handleChoice(false)}
                    aria-label="Falso. Atajo: tecla F o 2."
                    className="flex-1 py-4 bg-red-100 text-red-700 border-2 border-red-200 rounded-xl font-bold text-xl hover:bg-red-500 hover:text-white transition-all focus:outline-none focus:ring-4 focus:ring-red-300 relative"
                >
                    Falso
                    <span className="absolute top-1 right-2 text-xs font-normal text-gray-400" aria-hidden="true">F</span>
                </button>
            </div>
        </div>
    );
};

export default LessonTrueFalse;
