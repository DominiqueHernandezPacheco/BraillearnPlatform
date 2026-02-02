import React from 'react';
import { braillePatterns } from '../../../../constants/braillePatterns';
import BrailleCell from '../../../common/BrailleCell';

const LessonTrueFalse = ({ lesson, onVerify }) => {

    const handleChoice = (choice) => {
        // Lógica de verificación (choice es true o false)
        const isCorrect = choice === lesson.isCorrect;
        const description = `Elegiste ${choice ? "Verdadero" : "Falso"}.`;
        
        onVerify(isCorrect, description);
    };

    return (
        <div className="flex flex-col items-center w-full animate-fadeIn">
            <p className="text-2xl font-medium mb-8 text-gray-700">{lesson.question}</p>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border-2 border-gray-100">
                <BrailleCell dots={braillePatterns[lesson.displayChar]} size="large" isInteractive={false} />
            </div>

            <div className="flex gap-6 w-full max-w-md justify-center">
                <button 
                    onClick={() => handleChoice(true)} 
                    className="flex-1 py-4 bg-green-100 text-green-700 border-2 border-green-200 rounded-xl font-bold text-xl hover:bg-green-500 hover:text-white transition-all"
                >
                    Verdadero
                </button>
                <button 
                    onClick={() => handleChoice(false)} 
                    className="flex-1 py-4 bg-red-100 text-red-700 border-2 border-red-200 rounded-xl font-bold text-xl hover:bg-red-500 hover:text-white transition-all"
                >
                    Falso
                </button>
            </div>
        </div>
    );
};

export default LessonTrueFalse;