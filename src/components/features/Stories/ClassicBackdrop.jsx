import React from 'react';

// Fondo para los cuentos clásicos: un estudio de noche, con estantes de libros
// a los lados y la luz cálida de una lámpara. Sobrio, nada infantil. Es solo
// decoración (aria-hidden) y se oculta en alto contraste. El centro queda
// libre para el texto.

const SPINES = ['#6b2d3a', '#2f4a5a', '#7a5a2e', '#3a3f6b', '#5a3a52', '#2e5a45', '#8a6a3a', '#4a2a2a'];

// Un estante: filas de lomos de libro con alturas y colores que se repiten de
// forma determinista (sin azar, para que no cambie entre renders).
const Shelf = ({ x, width, flip = false }) => {
    const rows = 5;
    const rowH = 150;
    const books = [];
    for (let r = 0; r < rows; r += 1) {
        let cursor = 0;
        let i = r * 7;
        while (cursor < width - 14) {
            const w = 14 + ((i * 7) % 5) * 5;
            const h = 88 + ((i * 11) % 6) * 9;
            if (cursor + w > width - 6) break;
            books.push({
                key: `${r}-${i}`,
                x: x + cursor + 8,
                y: 60 + r * rowH + (rowH - 14 - h),
                w,
                h,
                fill: SPINES[(i * 3 + r + (flip ? 4 : 0)) % SPINES.length],
            });
            cursor += w + 1.5;
            i += 1;
        }
    }
    return (
        <g>
            <rect x={x} y="40" width={width} height={rows * rowH + 30} fill="#241611" />
            {books.map((b) => (
                <rect key={b.key} x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill={b.fill} opacity="0.92" />
            ))}
            {Array.from({ length: rows + 1 }, (_, r) => (
                <rect key={r} x={x} y={40 + r * rowH + (r === 0 ? 0 : 0)} width={width} height="10" fill="#3a2418" />
            ))}
        </g>
    );
};

const MOTES = [
    [250, 300, 0], [330, 520, 1.3], [880, 260, 0.6], [960, 480, 2.1], [420, 180, 2.8], [790, 620, 0.9], [160, 640, 1.7],
];

const ClassicBackdrop = ({ className = '' }) => (
    <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        className={`classic-art pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
        <defs>
            <radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffbf66" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#ff9a3c" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#ff9a3c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
                <stop offset="55%" stopColor="#000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
            </radialGradient>
        </defs>

        <Shelf x={0} width={250} />
        <Shelf x={950} width={250} flip />

        <circle cx="190" cy="470" r="360" fill="url(#lamp-glow)" />
        <circle cx="1010" cy="250" r="300" fill="url(#lamp-glow)" opacity="0.7" />

        {MOTES.map(([x, y, d]) => (
            <circle key={`${x}-${y}`} className="firefly" style={{ '--d': `${d}s` }} cx={x} cy={y} r="2.5" fill="#f3d9a0" />
        ))}

        <rect width="1200" height="800" fill="url(#vignette)" />
    </svg>
);

export default ClassicBackdrop;
