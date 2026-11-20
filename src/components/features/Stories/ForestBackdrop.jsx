import React from 'react';

// Fondo de bosque: cielo, colinas, pinos y luciérnagas. Es solo decoración
// (aria-hidden) y se oculta en alto contraste. Los pinos grandes quedan en los
// bordes para dejar el centro libre al texto.

const Pine = ({ x, y, s = 1, fill, delay = 0 }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
        <g className="tree-sway" style={{ '--d': `${delay}s` }}>
            <rect x="-9" y="2" width="18" height="40" fill="#6b4a2f" />
            <polygon points="0,-175 -46,-100 46,-100" fill={fill} />
            <polygon points="0,-138 -64,-52 64,-52" fill={fill} />
            <polygon points="0,-96 -84,6 84,6" fill={fill} />
        </g>
    </g>
);

const FAR_TREES = [60, 170, 290, 420, 560, 690, 810, 930, 1050, 1150];
const NEAR_TREES = [
    { x: 70, y: 780, s: 1.5, d: 0 }, { x: 215, y: 800, s: 1.1, d: 1.2 }, { x: 345, y: 790, s: 0.8, d: 2.1 },
    { x: 1130, y: 780, s: 1.5, d: 0.6 }, { x: 985, y: 800, s: 1.1, d: 1.8 }, { x: 855, y: 790, s: 0.8, d: 0.3 },
];
const FIREFLIES = [
    [190, 330, 0], [300, 480, 1.1], [120, 560, 2.2], [980, 360, 0.7], [1090, 520, 1.9],
    [880, 600, 2.7], [260, 640, 0.4], [1010, 660, 1.4],
];

const ForestBackdrop = ({ className = '' }) => (
    <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMax slice"
        className={`forest-art pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
        <circle cx="990" cy="130" r="120" fill="#fff6bf" opacity="0.5" />
        <circle cx="990" cy="130" r="66" fill="#fff0a0" />
        <g fill="#ffffff" opacity="0.85">
            <ellipse cx="220" cy="120" rx="90" ry="26" />
            <ellipse cx="290" cy="104" rx="60" ry="24" />
            <ellipse cx="640" cy="190" rx="80" ry="22" />
            <ellipse cx="700" cy="176" rx="52" ry="20" />
        </g>

        <path d="M0 520 Q220 430 430 505 T820 485 T1200 505 V800 H0 Z" fill="#b9e3c2" />
        {FAR_TREES.map((x, i) => (
            <Pine key={x} x={x} y={505 + (i % 3) * 8} s={0.34 + (i % 2) * 0.06} fill="#8ccfa0" delay={i * 0.4} />
        ))}
        <path d="M0 610 Q260 540 520 600 T1200 590 V800 H0 Z" fill="#86c996" />
        <path d="M0 700 Q300 650 620 700 T1200 690 V800 H0 Z" fill="#4fa56a" />

        {NEAR_TREES.map((t, i) => (
            <Pine key={t.x} x={t.x} y={t.y} s={t.s} fill={i % 2 ? '#1f6b46' : '#2a7d52'} delay={t.d} />
        ))}

        {FIREFLIES.map(([x, y, d]) => (
            <circle key={`${x}-${y}`} className="firefly" style={{ '--d': `${d}s` }} cx={x} cy={y} r="5" fill="#ffe66d" />
        ))}
    </svg>
);

export default ForestBackdrop;
