import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import { useCalmMotion } from '../../calmMotionContext';
import { useLanguage } from '../../i18n/languageContext';

const format = (value, decimals, locale) =>
    value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

// Contador que sube hasta `to` al entrar en pantalla. El valor final siempre
// está en el DOM para lectores de pantalla; el número animado es decorativo.
export default function CountUp({ to, decimals = 0, duration = 1.6, className }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
    const calm = useCalmMotion();
    const { locale } = useLanguage();
    const [animated, setAnimated] = useState(format(0, decimals, locale));
    // Con movimiento reducido se muestra el valor final directamente.
    const text = calm ? format(to, decimals, locale) : animated;

    useEffect(() => {
        if (!inView || calm) return;
        const controls = animate(0, to, {
            duration,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (v) => setAnimated(format(v, decimals, locale)),
        });
        return () => controls.stop();
    }, [inView, calm, to, decimals, duration, locale]);

    return (
        <span ref={ref} className={`tabular-nums ${className ?? ''}`}>
            <span aria-hidden="true">{text}</span>
            <span className="sr-only">{format(to, decimals, locale)}</span>
        </span>
    );
}
