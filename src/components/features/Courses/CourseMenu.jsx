import React from 'react';
import { getIcon } from '../../../utils/iconMap';

const CourseMenu = ({ modules, onSelect, highContrast }) => {
    // Definimos los estilos aquí mismo para que el componente sea independiente
    const bgClass = highContrast ? 'bg-black' : 'bg-white';
    const textClass = highContrast ? 'text-yellow-300' : 'text-gray-900';
    const textSubClass = highContrast ? 'text-white' : 'text-gray-600';
    const cardBgClass = highContrast ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-transparent';
    const cardHoverClass = highContrast ? 'hover:border-yellow-400' : 'hover:border-blue-400 hover:shadow-2xl';

    return (
        <section id="cursos-top" className={`min-h-screen ${bgClass} px-6 pt-24 pb-12 animate-fadeIn transition-colors duration-300`}>
            <div className="container mx-auto max-w-6xl">
                <h2 className={`text-4xl font-bold text-center mb-4 ${textClass}`}>Camino del Braille</h2>
                <p className={`text-center mb-12 text-lg ${textSubClass}`}>Selecciona un módulo para comenzar tu aventura.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {modules.map(mod => (
                        <button 
                            key={mod.id} 
                            onClick={() => onSelect(mod)} 
                            className={`${cardBgClass} p-8 rounded-3xl shadow-lg hover:-translate-y-2 transition-all duration-300 text-left border-2 ${cardHoverClass} group w-full`}
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300 ${mod.id === 3 ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {/* Usamos el helper para el icono */}
                                {getIcon(mod.iconType, "w-8 h-8")}
                            </div>
                            <h3 className={`text-2xl font-bold mb-2 ${highContrast ? 'text-white' : 'text-gray-900'}`}>{mod.title}</h3>
                            <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">{mod.subtitle}</p>
                            <p className={highContrast ? 'text-gray-300' : 'text-gray-600'}>{mod.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CourseMenu;