import React, { useEffect } from 'react';
import { braillePatterns } from '../../../../constants/braillePatterns';
import BrailleCell from '../../../common/BrailleCell';

const LessonQuiz = ({ lesson, onVerify }) => {

    const handleChoice = (option) => {
        const isCorrect  = option === lesson.targetChar;
        const description = `Elegiste la letra ${option.toUpperCase()}.`;
        onVerify(isCorrect, description);
    };

    // Atajos de teclado: 1, 2 y 3 seleccionan la opción correspondiente
    useEffect(() => {
        const handleKey = (e) => {
            // No interferir con campos de texto
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            const keyMap = { '1': 0, '2': 1, '3': 2 };
            if (keyMap[e.key] !== undefined) {
                const option = lesson.options[keyMap[e.key]];
                if (option !== undefined) handleChoice(option);
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lesson]);

    return (
        <div className="flex flex-col items-center w-full animate-fadeIn">
            <p className="text-2xl font-medium mb-8 text-gray-700">{lesson.question}</p>

            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border-2 border-gray-100">
                <BrailleCell
                    dots={braillePatterns[lesson.targetChar]}
                    size="large"
                    isInteractive={false}
                />
            </div>

            {/* Instrucción de atajo de teclado */}
            <p className="text-sm text-gray-400 mb-4">
                Usa las teclas <kbd className="bg-gray-100 px-2 py-0.5 rounded border text-xs">1</kbd>,{' '}
                <kbd className="bg-gray-100 px-2 py-0.5 rounded border text-xs">2</kbd>,{' '}
                <kbd className="bg-gray-100 px-2 py-0.5 rounded border text-xs">3</kbd> o haz clic
            </p>

            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                {lesson.options.map((opt, index) => (
                    <button
                        key={opt}
                        onClick={() => handleChoice(opt)}
                        aria-label={`Opción ${index + 1}: letra ${opt.toUpperCase()}. Atajo: tecla ${index + 1}.`}
                        className="py-4 bg-white border-2 border-blue-100 text-2xl font-bold text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase shadow-sm transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300 relative"
                    >
                        {opt}
                        {/* Indicador visual del atajo */}
                        <span
                            className="absolute top-1 right-2 text-xs font-normal text-gray-300"
                            aria-hidden="true"
                        >
                            {index + 1}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LessonQuiz;
