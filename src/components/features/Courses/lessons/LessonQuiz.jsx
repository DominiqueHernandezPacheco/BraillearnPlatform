import React from 'react';
import { braillePatterns } from '../../../../constants/braillePatterns';
import BrailleCell from '../../../common/BrailleCell';

const LessonQuiz = ({ lesson, onVerify }) => {
    
    const handleChoice = (option) => {
        // Lógica de verificación
        const isCorrect = option === lesson.targetChar;
        const description = `Elegiste la letra ${option.toUpperCase()}.`;
        
        // Enviamos al padre (CourseSection) si ganó o perdió
        onVerify(isCorrect, description);
    };

    return (
        <div className="flex flex-col items-center w-full animate-fadeIn">
            <p className="text-2xl font-medium mb-8 text-gray-700">{lesson.question}</p>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border-2 border-gray-100">
                <BrailleCell dots={braillePatterns[lesson.targetChar]} size="large" isInteractive={false} />
            </div>

            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                {lesson.options.map((opt) => (
                    <button 
                        key={opt} 
                        onClick={() => handleChoice(opt)} 
                        className="py-4 bg-white border-2 border-blue-100 text-2xl font-bold text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all uppercase shadow-sm transform hover:-translate-y-1"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LessonQuiz;