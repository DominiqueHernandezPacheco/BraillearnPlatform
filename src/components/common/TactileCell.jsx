import React, { useId } from 'react';

// Celda Braille "táctil" para mostrar e ilustrar: los puntos levantados se ven
// en relieve (degradado + sombra) y los que faltan como huecos poco profundos.
// Es de solo lectura — para celdas que se tocan ver InteractiveBrailleCell.
//
// dots: arreglo de 6 booleanos en el orden Braille (1-2-3 izquierda, 4-5-6 derecha).

const describe = (dots) => {
    const on = dots.map((d, i) => (d ? i + 1 : null)).filter(Boolean);
    if (on.length === 0) return 'Celda Braille vacía';
    if (on.length === 1) return `Celda Braille con el punto ${on[0]}`;
    return `Celda Braille con los puntos ${on.slice(0, -1).join(', ')} y ${on[on.length - 1]}`;
};

const TactileCell = ({
    dots,
    size = 96,
    showNumbers = false,
    label,
    decorative = false,
    strongEmpty = false, // puntos vacíos más grandes y oscuros: para leer celda por celda
    className = '',
}) => {
    const uid = useId().replace(/:/g, '');
    const gradId = `tc-grad-${uid}`;

    const width = showNumbers ? 92 : 60;
    const xLeft = showNumbers ? 34 : 18;
    const xRight = showNumbers ? 58 : 42;
    const ys = [15, 45, 75];

    const points = dots.map((on, i) => ({
        on,
        n: i + 1,
        cx: i < 3 ? xLeft : xRight,
        cy: ys[i % 3],
    }));

    const a11y = decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': label ?? describe(dots) };

    return (
        <svg
            viewBox={`0 0 ${width} 90`}
            width={(size * width) / 90}
            height={size}
            className={className}
            focusable="false"
            {...a11y}
        >
            <defs>
                <radialGradient id={gradId} cx="35%" cy="30%" r="80%">
                    <stop offset="0%" style={{ stopColor: 'color-mix(in srgb, var(--brand) 62%, white)' }} />
                    <stop offset="100%" style={{ stopColor: 'var(--brand-strong)' }} />
                </radialGradient>
            </defs>

            {points.map((p) =>
                p.on ? (
                    <g key={p.n}>
                        <ellipse cx={p.cx} cy={p.cy + 3.2} rx="11" ry="10" fill="var(--ink)" opacity="0.16" />
                        <circle cx={p.cx} cy={p.cy} r="11" fill={`url(#${gradId})`} />
                        <circle cx={p.cx - 3.4} cy={p.cy - 3.6} r="3.2" fill="#ffffff" opacity="0.4" />
                    </g>
                ) : (
                    <circle
                        key={p.n}
                        cx={p.cx}
                        cy={p.cy}
                        r={strongEmpty ? 4.6 : 3.8}
                        fill={strongEmpty ? 'color-mix(in srgb, var(--ink-faint) 55%, white)' : 'var(--line-strong)'}
                    />
                ),
            )}

            {showNumbers &&
                points.map((p) => (
                    <text
                        key={`n${p.n}`}
                        x={p.cx < width / 2 ? 9 : width - 9}
                        y={p.cy + 3.6}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="800"
                        fontFamily="'Nunito Variable', ui-rounded, sans-serif"
                        fill="var(--ink-faint)"
                        aria-hidden="true"
                    >
                        {p.n}
                    </text>
                ))}
        </svg>
    );
};

export default TactileCell;
