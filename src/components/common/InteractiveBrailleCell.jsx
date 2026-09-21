import React, { useId } from 'react';

// Celda Braille interactiva de 6 puntos. Los puntos activos se ven "levantados"
// (degradado de marca + sombra + brillo, como en TactileCell) y los inactivos
// como huecos poco profundos. Cada punto es un role="button" dentro de un
// role="group": LessonBuilder depende de esa estructura.
//
// Área táctil: cada punto ocupa una columna completa de 50 x 30 unidades del
// viewBox (≥ 44 px reales en ambos tamaños).

const DOT_LAYOUT = [0, 1, 2, 3, 4, 5].map((i) => ({
    i,
    n: i + 1,
    cx: i < 3 ? 36 : 64,
    cy: 17 + (i % 3) * 30,
    left: i < 3,
}));

const InteractiveBrailleCell = ({ dots, onClick, size = "huge" }) => {
    const sizeClass = size === 'huge' ? 'w-56 h-52' : 'w-48 h-44';
    const uid = useId().replace(/:/g, '');
    const gradId = `ibc-grad-${uid}`;

    return (
        <div
            className={`relative flex items-center justify-center rounded-3xl border-2 border-line-strong bg-surface ${sizeClass}`}
            role="group"
            aria-label="Celda Braille interactiva. Usa Tab para navegar entre los puntos y Espacio o Enter para activarlos o desactivarlos."
        >
            <svg viewBox="0 0 100 94" className="h-full w-full overflow-visible p-2" focusable="false">
                <defs>
                    <radialGradient id={gradId} cx="35%" cy="30%" r="80%">
                        <stop offset="0%" style={{ stopColor: 'color-mix(in srgb, var(--brand) 62%, white)' }} />
                        <stop offset="100%" style={{ stopColor: 'var(--brand-strong)' }} />
                    </radialGradient>
                </defs>

                {DOT_LAYOUT.map(({ i, n, cx, cy, left }) => {
                    const active = !!dots[i];
                    return (
                        <g
                            key={i}
                            role="button"
                            tabIndex={0}
                            aria-label={`Punto ${n}, ${active ? "activado" : "desactivado"}`}
                            aria-pressed={dots[i]}
                            className="group cursor-pointer outline-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick(i);
                            }}
                            onKeyDown={(e) => {
                                // Espacio Y Enter activan/desactivan el punto
                                if (e.key === ' ' || e.key === 'Enter') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onClick(i);
                                }
                            }}
                        >
                            {/* Área táctil amplia (invisible) */}
                            <rect x={left ? 0 : 50} y={cy - 15} width="50" height="30" fill="transparent" />

                            {/* Aro de foco: siempre visible al navegar con teclado */}
                            <circle
                                cx={cx}
                                cy={cy}
                                r="15"
                                fill="none"
                                stroke="var(--focus)"
                                strokeWidth="2.5"
                                className="opacity-0 group-focus-visible:opacity-100"
                            />

                            {/* Hueco (punto inactivo) */}
                            <circle
                                cx={cx}
                                cy={cy}
                                r="9.5"
                                fill="var(--surface-2)"
                                stroke="var(--line-strong)"
                                strokeWidth="2"
                                className="group-hover:stroke-brand"
                            />
                            <circle cx={cx} cy={cy} r="3.4" fill="var(--line-strong)" />

                            {/* Punto levantado (activo) */}
                            <g className={`transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-0'}`}>
                                <ellipse cx={cx} cy={cy + 3.2} rx="11" ry="10" fill="var(--ink)" opacity="0.16" />
                                <circle cx={cx} cy={cy} r="11" fill={`url(#${gradId})`} />
                                <circle cx={cx - 3.4} cy={cy - 3.6} r="3.2" fill="#ffffff" opacity="0.4" />
                            </g>

                            {/* Número del punto (decorativo: el aria-label ya lo dice) */}
                            <text
                                x={left ? 9 : 91}
                                y={cy + 4}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="800"
                                fontFamily="'Nunito Variable', ui-rounded, sans-serif"
                                fill={active ? 'var(--ink)' : 'var(--ink-faint)'}
                                aria-hidden="true"
                            >
                                {n}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default InteractiveBrailleCell;
