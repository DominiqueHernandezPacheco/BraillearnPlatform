import { useRef } from 'react';
import { motion, useInView, useScroll, useSpring } from 'framer-motion';
import Container from '../ui/Container';
import { useCalmMotion } from '../../calmMotionContext';

// Línea progresiva: un riel gris con una línea azul que se llena al avanzar el
// scroll, y un nodo por capítulo que se enciende al llegar a él.
export function Timeline({ children }) {
    const ref = useRef(null);
    const calm = useCalmMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.6', 'end 0.6'] });
    const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
    const rail = 'absolute bottom-0 left-[15px] top-0 w-0.5 sm:left-[19px]';

    return (
        <Container>
            <div ref={ref} className="relative mx-auto max-w-5xl">
                <div aria-hidden="true" className={`${rail} bg-slate-200`} />
                <motion.div
                    aria-hidden="true"
                    style={{ scaleY: calm ? 1 : fill }}
                    className={`${rail} origin-top bg-brand-600`}
                />
                <ol className="relative">{children}</ol>
            </div>
        </Container>
    );
}

export function Chapter({ label, title, text, children }) {
    const ref = useRef(null);
    const calm = useCalmMotion();
    const reached = useInView(ref, { once: true, margin: '0px 0px -55% 0px' });
    const on = calm || reached;

    return (
        <li ref={ref} className="relative pb-28 pl-14 last:pb-0 sm:pb-36 sm:pl-20">
            <span
                aria-hidden="true"
                className={`absolute left-0 top-1 flex size-8 items-center justify-center rounded-full border-2 transition-colors duration-500 sm:size-10 ${
                    on ? 'border-brand-600 bg-brand-600' : 'border-slate-300 bg-white'
                }`}
            >
                <span className={`size-2.5 rounded-full transition-colors duration-500 ${on ? 'bg-white' : 'bg-slate-300'}`} />
            </span>

            <p className="text-lg font-semibold text-brand-700">{label}</p>
            <h2 className="mt-2 max-w-3xl text-balance text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {title}
            </h2>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">{text}</p>
            {children && <div className="mt-12">{children}</div>}
        </li>
    );
}
