import React from 'react';

// Marca de Braillearn: una celda Braille con los puntos 1 y 2 levantados,
// que en Braille es la letra "b" — la de Braulio, la voz guía de la plataforma.
const BrandMark = ({ size = 36, className = '' }) => {
    const dot = (col, row) => ({ cx: col === 0 ? 12.5 : 23.5, cy: 9 + row * 9 });
    // Orden de los puntos Braille: 1-2-3 columna izquierda, 4-5-6 columna derecha
    const cells = [
        { ...dot(0, 0), on: true },
        { ...dot(0, 1), on: true },
        { ...dot(0, 2), on: false },
        { ...dot(1, 0), on: false },
        { ...dot(1, 1), on: false },
        { ...dot(1, 2), on: false },
    ];

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 36 36"
            aria-hidden="true"
            focusable="false"
            className={className}
        >
            <rect width="36" height="36" rx="11" fill="var(--brand)" />
            {cells.map((c, i) => (
                <circle
                    key={i}
                    cx={c.cx}
                    cy={c.cy}
                    r={c.on ? 3.6 : 1.9}
                    fill={c.on ? 'var(--sun)' : 'var(--on-brand)'}
                    opacity={c.on ? 1 : 0.4}
                />
            ))}
        </svg>
    );
};

export default BrandMark;
