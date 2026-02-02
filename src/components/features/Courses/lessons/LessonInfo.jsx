import React from 'react';
import { getIcon } from '../../../../utils/iconMap'; // Ajusta la ruta según donde esté utils

const LessonInfo = ({ title, content, highlight, iconType }) => {
    return (
        <div className="flex flex-col items-center animate-fadeIn w-full">
            <div className="bg-white p-8 rounded-full shadow-lg mb-8 border-4 border-blue-100 transform hover:scale-105 transition-transform">
                {getIcon(iconType)}
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 max-w-2xl text-left w-full mb-6">
                <p className="text-xl text-gray-700 leading-relaxed font-medium">{content}</p>
            </div>
            {highlight && (
                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl max-w-xl w-full flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">💡</span>
                    <p className="text-yellow-900 font-semibold text-lg">{highlight}</p>
                </div>
            )}
        </div>
    );
};

export default LessonInfo;