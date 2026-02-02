import React from 'react';

const InteractiveBrailleCell = ({ dots, onClick, size = "huge" }) => {
    const widthClass = size === 'huge' ? 'w-40 h-56' : 'w-32 h-48';
    const dotRadius = 10;

    return (
        <div 
            className={`relative bg-white border-2 border-gray-300 rounded-xl shadow-sm flex items-center justify-center ${widthClass}`}
            role="group"
            aria-label="Celda Braille interactiva. Usa Tab para navegar entre los puntos y Enter para activarlos."
        >
            <svg viewBox="0 0 60 90" className="w-full h-full p-2">
                {[0, 1, 2, 3, 4, 5].map((i) => {
                    const col = i < 3 ? 15 : 45;
                    const row = 15 + (i % 3) * 30;
                    return (
                        <circle 
                            key={i} 
                            cx={col} cy={row} r={dotRadius} 
                            role="button"
                            tabIndex={0}
                            aria-label={`Punto ${i + 1}, ${dots[i] ? "activado" : "desactivado"}`}
                            aria-pressed={dots[i]}
                            className={`transition-all duration-200 cursor-pointer hover:stroke-2 hover:stroke-blue-400 focus:outline-none focus:stroke-2 focus:stroke-blue-600 ${dots[i] ? "fill-gray-900" : "fill-gray-200"}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick(i);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onClick(i);
                                }
                            }}
                        />
                    );
                })}
            </svg>
        </div>
    );
};

export default InteractiveBrailleCell;