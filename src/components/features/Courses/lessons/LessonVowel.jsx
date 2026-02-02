import React from 'react';
import { braillePatterns } from '../../../../constants/braillePatterns';
import BrailleCell from '../../../common/BrailleCell';
import useBrailleSound from '../../../../hooks/useBrailleSound';

const LessonVowel = ({ char, visualDesc, patternExp, isMuted }) => {
    const { playPattern } = useBrailleSound();

    return (
        <div className="flex flex-col items-center w-full animate-fadeIn">
            <div className="bg-white p-8 rounded-3xl shadow-xl mb-8 transform transition-transform hover:scale-105">
                <BrailleCell dots={braillePatterns[char]} size="huge" isInteractive={false}/>
            </div>
            <div className="bg-white px-8 py-4 rounded-xl shadow-sm border border-gray-200 mb-8 max-w-lg">
                <p className="text-xl font-medium text-gray-800 mb-2">{visualDesc}</p>
                <p className="text-gray-500">{patternExp}</p>
            </div>
            <button 
                onClick={() => !isMuted && playPattern(braillePatterns[char], char)} 
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-md transition-all flex items-center gap-2 hover:-translate-y-1"
            >
                🔊 Escuchar Ritmo
            </button>
        </div>
    );
};

export default LessonVowel;