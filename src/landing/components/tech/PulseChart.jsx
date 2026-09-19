import { motion } from 'framer-motion';
import { useCalmMotion } from '../../calmMotionContext';
import { useCopy } from '../../i18n/languageContext';

// Un pulso de 50 ms levanta el punto y este se queda arriba sin consumir: la
// corriente vuelve a cero, el punto no baja.
const CURRENT = 'M0 100 H110 V50 H150 V100 H400';
const DOT = 'M0 222 H110 V178 H400';

function Line({ d, className, delay }) {
    const calm = useCalmMotion();
    return (
        <motion.path
            d={d}
            fill="none"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={className}
            initial={calm ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: '0px 0px -15% 0px' }}
            transition={{ duration: 1.4, delay, ease: 'easeInOut' }}
        />
    );
}

export default function PulseChart() {
    const t = useCopy().tech.pulse;

    return (
        <figure className="rounded-[2rem] border border-slate-200 bg-white p-8 sm:p-10">
            <svg viewBox="0 0 400 250" role="img" aria-label={t.aria} className="w-full">
                <g aria-hidden="true">
                    <text x="0" y="22" fontSize="14" className="fill-slate-500">
                        {t.current}
                    </text>
                    <text x="0" y="150" fontSize="14" className="fill-slate-500">
                        {t.dot}
                    </text>
                    <path d="M110 40 V232" stroke="currentColor" strokeWidth="1" strokeDasharray="4 5" className="text-slate-300" />
                    <Line d={CURRENT} className="stroke-brand-600" delay={0} />
                    <Line d={DOT} className="stroke-slate-900" delay={0.5} />
                    <text x="130" y="128" fontSize="15" fontWeight="600" textAnchor="middle" className="fill-brand-700">
                        50 ms
                    </text>
                </g>
            </svg>
            <figcaption className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-slate-600">
                <span className="font-semibold text-slate-900">{t.raised}</span>
                <span aria-hidden="true">·</span>
                <span>{t.held}</span>
            </figcaption>
        </figure>
    );
}
