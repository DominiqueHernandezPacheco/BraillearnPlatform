import { useState } from 'react';
import { motion } from 'framer-motion';
import { CircleCheck, CircleX, Minus } from 'lucide-react';
import Reveal from '../ui/Reveal';
import CountUp from '../ui/CountUp';
import ModelStage from '../ui/ModelStage';
import { useCopy } from '../../i18n/languageContext';
import { cellSpec, dotScale, neuropathy } from '../../content';

// ── Capítulo "El problema": el dato central y tres cifras de contexto ──────────
export function ProblemStat() {
    const t = useCopy().problem;

    return (
        <div>
            <Reveal className="rounded-[2rem] bg-brand-600 p-8 text-white sm:p-12">
                <p className="text-7xl font-extrabold leading-none tracking-tight sm:text-8xl">
                    <CountUp to={neuropathy.percent} decimals={1} />
                    <span aria-hidden="true">%</span>
                    <span className="sr-only">{t.stat.percentSpoken}</span>
                </p>
                <p className="mt-5 max-w-xl text-balance text-xl font-medium leading-snug sm:text-2xl">{t.stat.text}</p>
                <div className="mt-10 border-t border-white/25 pt-6">
                    <p className="max-w-2xl text-pretty leading-relaxed text-brand-50">
                        {t.stat.before} <strong className="font-semibold text-white">{t.stat.threshold}</strong>
                        {t.stat.after}
                    </p>
                    <p className="mt-3 text-sm text-brand-100">
                        {t.stat.source}: {neuropathy.source}
                    </p>
                </div>
            </Reveal>

            <dl className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
                {t.context.map((stat, i) => (
                    <Reveal key={stat.value} delay={i * 0.08}>
                        <dt className="text-4xl font-extrabold tracking-tight text-slate-900">{stat.value}</dt>
                        <dd className="mt-3 text-base leading-relaxed text-slate-600">{stat.label}</dd>
                        <dd className="mt-2 text-xs text-slate-500">{stat.source}</dd>
                    </Reveal>
                ))}
            </dl>
        </div>
    );
}

// ── Capítulo "La barrera": los puntos a escala real ─────────────────────────────
const verdictIcon = { false: CircleX, null: Minus, true: CircleCheck };
const verdictColor = { false: 'text-slate-500', null: 'text-slate-500', true: 'text-brand-700' };

export function DotScale() {
    const t = useCopy().problem.scale;

    return (
        <ol
            className="grid items-start gap-x-3 gap-y-10 [--mm:11px] sm:gap-x-8 md:[--mm:19px]"
            style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
        >
            {dotScale.map((dot, i) => {
                const copy = t.items[i];
                const Verdict = verdictIcon[String(dot.ok)];
                const isOurs = dot.ok === true;
                return (
                    <li key={dot.mm} className="flex flex-col items-center text-center">
                        {/* Zona de altura fija: los tres círculos comparten la línea base. */}
                        <div aria-hidden="true" className="flex items-end justify-center" style={{ height: 'calc(var(--mm) * 8)' }}>
                            <motion.div
                                initial={{ scale: 0.2, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true, margin: '0px 0px -15% 0px' }}
                                transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 + i * 0.15 }}
                                className={`aspect-square rounded-full ${
                                    isOurs
                                        ? 'bg-brand-600 shadow-[0_10px_30px_rgb(0_95_247/0.35)]'
                                        : dot.ok === null
                                          ? 'border-2 border-dashed border-slate-400'
                                          : 'bg-slate-800'
                                }`}
                                style={{ width: `calc(var(--mm) * ${dot.mm})` }}
                            />
                        </div>
                        <p className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{copy.display}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 sm:text-base">{copy.title}</p>
                        <p className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold sm:text-sm ${verdictColor[String(dot.ok)]}`}>
                            <Verdict className="size-4 shrink-0" aria-hidden="true" />
                            {copy.verdict}
                        </p>
                        <p className="mt-3 hidden max-w-[16rem] text-sm leading-relaxed text-slate-600 md:block">{copy.note}</p>
                    </li>
                );
            })}
        </ol>
    );
}

// ── Capítulo "Nuestra respuesta": la celda de 72 × 48 mm, que se puede tocar ───
const CELL_DOTS = [
    { n: 1, x: 30, y: 20 },
    { n: 2, x: 30, y: 50 },
    { n: 3, x: 30, y: 80 },
    { n: 4, x: 70, y: 20 },
    { n: 5, x: 70, y: 50 },
    { n: 6, x: 70, y: 80 },
];
const DOT_SIZE_PCT = (cellSpec.dotMm / cellSpec.widthMm) * 100;

// Cada punto se puede "levantar", igual que el solenoide real: un pulso lo eleva
// y el enclavamiento lo mantiene.
export function CellBridge() {
    const copy = useCopy();
    const t = copy.problem.cell;
    const [raised, setRaised] = useState(() => new Set([1, 2])); // letra "b"

    const toggle = (n) =>
        setRaised((prev) => {
            const next = new Set(prev);
            next.has(n) ? next.delete(n) : next.add(n);
            return next;
        });

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
                <ModelStage
                    file="ensamblaje1.glb"
                    alt={copy.models.cell.alt}
                    orbit="30deg 75deg auto"
                    className="h-80 md:h-full md:min-h-[26rem]"
                />
            </Reveal>
            <Reveal className="flex flex-col items-center rounded-[2rem] bg-slate-50 px-6 py-14 sm:py-16">
            <div
                role="group"
                aria-label={t.aria}
                className="relative w-40 rounded-2xl border border-slate-200 bg-white shadow-inner sm:w-48"
                style={{ aspectRatio: `${cellSpec.widthMm} / ${cellSpec.heightMm}` }}
            >
                {CELL_DOTS.map(({ n, x, y }) => {
                    const on = raised.has(n);
                    return (
                        <motion.button
                            key={n}
                            type="button"
                            aria-pressed={on}
                            aria-label={t.dot(n, on)}
                            onClick={() => toggle(n)}
                            animate={{ scale: on ? 1 : 0.7 }}
                            whileTap={{ scale: 0.6 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                            className={`absolute aspect-square -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full transition-colors duration-150 ${
                                on
                                    ? 'bg-brand-600 shadow-[0_4px_10px_rgb(0_95_247/0.4),inset_0_-3px_5px_rgb(0_0_0/0.2)]'
                                    : 'bg-slate-200 shadow-[inset_0_2px_4px_rgb(15_23_42/0.25)] hover:bg-slate-300'
                            }`}
                            style={{ left: `${x}%`, top: `${y}%`, width: `${DOT_SIZE_PCT}%` }}
                        />
                    );
                })}
            </div>
            <p className="mt-6 max-w-sm text-center text-sm leading-relaxed text-slate-600">{t.caption}</p>
            </Reveal>
        </div>
    );
}
