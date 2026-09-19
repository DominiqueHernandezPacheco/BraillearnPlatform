import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Geometría de una celda Braille dibujada en la retícula (px).
const PITCH = 26;
const DOT = 12;
const CELL_W = 88;
const CELL_H = 112;
// Una fila de celdas queda cortada por el borde inferior del hero (asoma BLEED px), y las
// filas siguen por debajo, dentro del degradado de salida, hasta desvanecerse.
const BLEED = 32;
const CELL_GROUP_H = 2 * PITCH + DOT; // alto de los tres puntos de una celda

// Línea de tiempo (ms): los puntos aparecen → se sostienen → se retraen hacia abajo.
const RETRACT_AT = 1500;
const REVEAL_AT = RETRACT_AT + 500;
const DONE_AT = RETRACT_AT + 1500;

// PRNG determinista (mulberry32): el patrón es idéntico en cada carga.
function seededRandom(seed) {
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// `height` incluye `extend`: la franja extra bajo el hero por donde el patrón sigue.
function buildLayout(width, height, extend) {
    const rand = seededRandom(2026);
    // Columnas centradas y con sobrante a ambos lados (las de los extremos quedan cortadas).
    const cols = Math.ceil(width / CELL_W) + 2;
    const offsetX = (width - cols * CELL_W) / 2 + (CELL_W - PITCH - DOT) / 2;
    // Filas ancladas al borde inferior del HERO (no al de la capa): una de ellas queda cortada
    // por ese borde, las de arriba pasan el borde superior y las de abajo continúan por la
    // franja del degradado, así el patrón no "termina" donde termina el hero.
    const heroBottomRow = height - extend - BLEED;
    const firstK = -Math.ceil((heroBottomRow + CELL_GROUP_H) / CELL_H);
    const lastK = Math.floor((height - heroBottomRow) / CELL_H);
    const rows = lastK - firstK + 1;
    const offsetY = heroBottomRow + firstK * CELL_H;
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.hypot(cx, cy);

    const dots = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            for (let c = 0; c < 2; c++) {
                for (let r = 0; r < 3; r++) {
                    if (rand() > 0.5) continue; // solo la mitad de los puntos de cada celda se levanta
                    const x = offsetX + col * CELL_W + c * PITCH;
                    const y = offsetY + row * CELL_H + r * PITCH;
                    dots.push({
                        id: `${row}-${col}-${c}-${r}`,
                        x,
                        y,
                        strong: rand() > 0.3,
                        // Aparecen desde el centro hacia afuera…
                        appearDelay: (Math.hypot(x - cx, y - cy) / maxDist) * 0.7 + rand() * 0.2,
                        // …y se retraen en una ola de arriba hacia abajo.
                        retractDelay: (Math.max(y, 0) / height) * 0.75 + rand() * 0.15,
                    });
                }
            }
        }
    }
    return { dots, offsetX, offsetY };
}

// Los seis puntos de cada celda que NO se levantan se dibujan como fondo (una
// sola capa) en lugar de cientos de nodos.
const tileImage = (fill, opacity) => {
    const circles = [0, 1]
        .flatMap((c) => [0, 1, 2].map((r) => `<circle cx='${c * PITCH + DOT / 2}' cy='${r * PITCH + DOT / 2}' r='2.5'/>`))
        .join('');
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${CELL_W}' height='${CELL_H}' fill='${fill}' fill-opacity='${opacity}'>${circles}</svg>`;
    return `url("data:image/svg+xml,${svg.replace(/#/g, '%23')}")`;
};
const TILE_LIGHT = tileImage('#94a3b8', 0.55);
const TILE_DARK = tileImage('#ffffff', 0.22);

const dotVariants = {
    hidden: { opacity: 0, scale: 0, y: 0 },
    appear: (dot) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            delay: dot.appearDelay,
            opacity: { duration: 0.25, delay: dot.appearDelay },
            scale: { type: 'spring', stiffness: 420, damping: 20, delay: dot.appearDelay },
        },
    }),
    retract: (dot) => ({
        opacity: 0,
        scale: 0.15,
        y: 36,
        transition: { duration: 0.55, delay: dot.retractDelay, ease: [0.4, 0, 0.2, 1] },
    }),
};

// `onDark`: puntos claros para un fondo de color (el hero azul).
// `extend`: px que la capa se prolonga por debajo del hero (la altura del degradado de salida).
export default function DotReveal({ onReveal, onDark = false, extend = 0 }) {
    const ref = useRef(null);
    const [layout, setLayout] = useState(null);
    // Los puntos se montan ya en 'appear' (con `initial="hidden"`), una vez medido el hero.
    const [phase, setPhase] = useState('appear');

    useLayoutEffect(() => {
        // Ya terminó la animación (la capa se desmontó): un cambio de `extend` no debe medir nada.
        if (!ref.current) return;
        const { width, height } = ref.current.getBoundingClientRect();
        setLayout(buildLayout(width, height, extend));
    }, [extend]);

    useEffect(() => {
        if (!layout) return;
        const timers = [
            setTimeout(() => setPhase('retract'), RETRACT_AT),
            setTimeout(onReveal, REVEAL_AT),
            setTimeout(() => setPhase('done'), DONE_AT),
        ];
        return () => timers.forEach(clearTimeout);
    }, [layout, onReveal]);

    if (phase === 'done') return null;

    return (
        <div
            ref={ref}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-20 overflow-hidden"
            style={{
                height: `calc(100% + ${extend}px)`,
                // Opaca sobre el hero y se desvanece a lo largo del degradado, a la par que él.
                maskImage: `linear-gradient(to bottom, #000 calc(100% - ${extend}px), transparent 100%)`,
                WebkitMaskImage: `linear-gradient(to bottom, #000 calc(100% - ${extend}px), transparent 100%)`,
            }}
        >
            {layout && (
                <>
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: onDark ? TILE_DARK : TILE_LIGHT,
                            backgroundSize: `${CELL_W}px ${CELL_H}px`,
                            backgroundPosition: `${layout.offsetX}px ${layout.offsetY}px`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: phase === 'retract' ? 0 : 1 }}
                        transition={{ duration: 0.6 }}
                    />
                    {layout.dots.map((dot) => (
                        <motion.span
                            key={dot.id}
                            custom={dot}
                            variants={dotVariants}
                            initial="hidden"
                            animate={phase}
                            className={`absolute rounded-full ${dot.strong ? (onDark ? 'bg-white' : 'bg-brand-600') : onDark ? 'bg-brand-200' : 'bg-brand-300'}`}
                            style={{ left: dot.x, top: dot.y, width: DOT, height: DOT }}
                        />
                    ))}
                </>
            )}
        </div>
    );
}
