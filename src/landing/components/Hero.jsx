import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import DotReveal from './DotReveal';
import { useCalmMotion } from '../calmMotionContext';
import { useCopy } from '../i18n/languageContext';
import { dotPosition, wordToCells } from '../braille';
import { heroVideo, site } from '../content';

const STEP = 1.7; // separación entre puntos, medida en diámetros de punto
const WORD_INTERVAL = 3800;
const DOT_NUMBERS = [1, 2, 3, 4, 5, 6];

// Altura del degradado de salida bajo el hero (128 px en móvil, 176 px desde 640 px de ancho).
// La capa de puntos se prolonga esa misma altura para no cortarse en el borde del hero.
const FOG_BASE = 128;
const FOG_WIDE = 176;
const WIDE_QUERY = '(min-width: 640px)';
const subscribeWide = (onChange) => {
    const media = window.matchMedia(WIDE_QUERY);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
};
const useFogHeight = () =>
    useSyncExternalStore(subscribeWide, () => (window.matchMedia(WIDE_QUERY).matches ? FOG_WIDE : FOG_BASE), () => FOG_WIDE);

const item = {
    hide: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// Una celda Braille que se refresca como el display real: cada punto sube o
// baja con un resorte, escalonado de izquierda a derecha.
function Cell({ cell, index, active }) {
    const raised = active ? cell.dots : new Set();

    return (
        <motion.div layout className="flex flex-col items-center">
            <div
                className="relative"
                style={{ width: `calc(var(--d) * ${1 + STEP})`, height: `calc(var(--d) * ${1 + 2 * STEP})` }}
            >
                {DOT_NUMBERS.map((n) => {
                    const { col, row } = dotPosition(n);
                    const on = raised.has(n);
                    return (
                        <motion.span
                            key={n}
                            initial={false}
                            animate={{ scale: on ? 1 : 0.3, opacity: on ? 1 : 0.32 }}
                            transition={{ type: 'spring', stiffness: 240, damping: 17, delay: index * 0.14 + n * 0.035 }}
                            className="absolute rounded-full bg-white shadow-[0_12px_28px_rgb(0_20_90/0.35)]"
                            style={{
                                left: `calc(var(--d) * ${col * STEP})`,
                                top: `calc(var(--d) * ${row * STEP})`,
                                width: 'var(--d)',
                                height: 'var(--d)',
                            }}
                        />
                    );
                })}
            </div>
            <span className="mt-[calc(var(--d)*0.7)] block min-h-5 font-mono text-sm font-medium uppercase tracking-widest text-white/75">
                {active ? cell.label : ' '}
            </span>
        </motion.div>
    );
}

export default function Hero() {
    const t = useCopy();
    const calm = useCalmMotion();
    const [dotsDone, setDotsDone] = useState(false);
    const [wordIndex, setWordIndex] = useState(0);
    const reveal = useCallback(() => setDotsDone(true), []);
    const revealed = calm || dotsDone;
    const hasVideo = Boolean(heroVideo.src);
    const fogPx = useFogHeight();

    const words = useMemo(() => t.hero.words.map(wordToCells), [t]);
    const cells = words[wordIndex % words.length];

    // Red de seguridad: si la animación fallara, el contenido nunca debe quedar oculto.
    useEffect(() => {
        const timer = setTimeout(reveal, 4500);
        return () => clearTimeout(timer);
    }, [reveal]);

    // El display "refresca" la palabra; con movimiento reducido se queda en la primera.
    useEffect(() => {
        if (!revealed || calm) return;
        const timer = setInterval(() => setWordIndex((i) => i + 1), WORD_INTERVAL);
        return () => clearInterval(timer);
    }, [revealed, calm]);

    return (
        <div className="relative">
            {/* Fondo vertical: el borde inferior es de un solo color (brand-800), para que la
                transición hacia lo que sigue no deje costura. */}
            <section
                id="inicio"
                aria-labelledby="hero-title"
                className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_80%_0%,var(--color-brand-500),transparent_55%),linear-gradient(180deg,var(--color-brand-600)_0%,var(--color-brand-700)_55%,var(--color-brand-800)_100%)] text-white"
            >
                {hasVideo && (
                    <>
                        <video
                            className="absolute inset-0 -z-10 size-full object-cover"
                            src={heroVideo.src}
                            poster={heroVideo.poster || undefined}
                            autoPlay={!calm}
                            muted
                            loop
                            playsInline
                            aria-hidden="true"
                        />
                        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-brand-900/60" />
                    </>
                )}

                <motion.div
                    className="relative z-10 flex w-full flex-col items-center px-4 pb-[clamp(0.75rem,1.5dvh,1.5rem)] pt-[clamp(5rem,12dvh,8.5rem)] text-center sm:px-6"
                    initial="hide"
                    animate={revealed ? 'show' : 'hide'}
                    transition={{ staggerChildren: 0.12 }}
                >
                    {!hasVideo && (
                        <div
                            aria-hidden="true"
                            className="flex gap-[calc(var(--d)*1.5)]"
                            style={{ '--d': 'clamp(14px, min(4.4vw, 11.4dvh - 26px, 54px), 54px)' }}
                        >
                            {cells.map((cell, i) => (
                                <Cell key={i} index={i} cell={cell} active={revealed} />
                            ))}
                        </div>
                    )}

                    <motion.h1
                        id="hero-title"
                        variants={item}
                        className={`text-balance text-[clamp(2.75rem,min(15dvh_-_17px,13vw),7rem)] font-extrabold leading-[1.05] tracking-tight ${hasVideo ? '' : 'mt-[clamp(1rem,4dvh,4.5rem)]'}`}
                    >
                        Braillearn
                    </motion.h1>

                    <motion.p
                        variants={item}
                        className="mt-[clamp(0.5rem,2dvh,1.25rem)] max-w-3xl text-pretty text-[clamp(1.05rem,3.1dvh,1.75rem)] leading-snug text-white/90"
                    >
                        {t.hero.tagline}
                    </motion.p>

                    <motion.div
                        variants={item}
                        className="mt-[clamp(1.25rem,4dvh,2.5rem)] flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
                    >
                        <a
                            href={site.platformUrl}
                            className="inline-flex min-h-14 items-center rounded-full bg-white px-7 text-base font-semibold text-brand-700 transition-colors duration-200 hover:bg-brand-50"
                        >
                            {t.common.tryPlatform}
                        </a>
                        <a
                            href="#producto"
                            className="group inline-flex min-h-14 items-center gap-1 text-base font-semibold text-white"
                        >
                            {t.hero.seeProduct}
                            <ChevronRight
                                className="size-5 transition-transform duration-200 group-hover:translate-x-0.5"
                                aria-hidden="true"
                            />
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            {/* Los puntos de la bienvenida siguen por debajo del hero, dentro del degradado. */}
            {!calm && <DotReveal onDark onReveal={reveal} extend={fogPx} />}

            {/* La bienvenida se funde con lo que sigue, pero SOLO al hacer scroll: el degradado vive
                justo debajo del hero (fuera del primer pantallazo), no dentro de él. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-full bg-linear-to-b from-brand-800 via-brand-800/55 to-transparent"
                style={{ height: fogPx }}
            />
        </div>
    );
}
