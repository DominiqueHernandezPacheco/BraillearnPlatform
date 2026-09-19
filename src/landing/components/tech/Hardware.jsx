import { motion } from 'framer-motion';
import Container from '../ui/Container';
import Reveal from '../ui/Reveal';
import ModelPhotoToggle from './ModelPhotoToggle';
import solenoidPhoto from '../../assets/solenoide.png';
import TechSection from './TechSection';
import PulseChart from './PulseChart';
import { useLanguage } from '../../i18n/languageContext';
import { formatMXN } from '../../i18n/format';
import { costComparison, modularCost } from '../../content';

const MAX_COST = Math.max(...costComparison.map((row) => row.value));

// La cadena de señal, en cuatro pasos con espacio para respirar.
function SignalChain({ title, steps }) {
    return (
        <div className="mt-20">
            <p className="text-center font-mono text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{title}</p>
            <ol className="relative mt-10 grid gap-12 md:grid-cols-4 md:gap-8">
                <span aria-hidden="true" className="absolute left-0 right-0 top-5 hidden h-px bg-slate-300 md:block" />
                {steps.map((step, i) => (
                    <Reveal as="li" key={step.tag} delay={i * 0.1} className="relative">
                        <span
                            aria-hidden="true"
                            className="relative flex size-10 items-center justify-center rounded-full border-2 border-brand-600 bg-white font-mono text-sm font-semibold text-brand-700"
                        >
                            {i + 1}
                        </span>
                        <p className="mt-5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">{step.tag}</p>
                        <p className="mt-1 text-lg font-bold text-slate-900">{step.name}</p>
                        <p className="mt-2 text-base leading-relaxed text-slate-600">{step.note}</p>
                    </Reveal>
                ))}
            </ol>
        </div>
    );
}

function CostBars() {
    const { t: copy, locale } = useLanguage();
    const t = copy.architecture.cost;

    return (
        <div>
            <h3 className="text-balance text-xl font-bold leading-snug text-slate-900">{t.title}</h3>
            <ul className="mt-10 space-y-8">
                {costComparison.map((row, i) => {
                    const text = t.rows[i];
                    return (
                        <li key={text.label}>
                            <p className={`text-base ${row.ours ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                                {text.label}
                                <span className="ml-2 text-sm font-normal text-slate-500">{text.detail}</span>
                            </p>
                            <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-slate-900">
                                {formatMXN(row.value, locale)}
                            </p>
                            <div aria-hidden="true" className="mt-3 h-3 w-full rounded-full bg-slate-100">
                                <motion.div
                                    className={`h-full origin-left rounded-full ${row.ours ? 'bg-brand-600' : 'bg-slate-300'}`}
                                    style={{ width: `${(row.value / MAX_COST) * 100}%` }}
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                                    transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>
            <p className="mt-10 text-sm leading-relaxed text-slate-500">{t.note}</p>
        </div>
    );
}

export default function Hardware() {
    const { t: copy, locale } = useLanguage();
    const t = copy.architecture;
    const [actuation, control, energy, cost] = t.specs;
    const parts = [
        { ...t.modular.base, value: modularCost.base },
        { ...t.modular.cell, value: modularCost.cell },
    ];

    return (
        <>
            <TechSection
                id="actuation-title"
                tag={actuation.tag}
                metric={actuation.metric}
                title={actuation.title}
                text={actuation.text}
            >
                <ModelPhotoToggle
                    file="ensamblaje2.glb"
                    orbit="40deg 70deg auto"
                    modelAlt={copy.models.solenoid.alt}
                    photoSrc={solenoidPhoto}
                    photoAlt={copy.tech.solenoidPhoto.label}
                />
            </TechSection>

            <TechSection
                reverse
                id="energy-title"
                tag={energy.tag}
                metric={energy.metric}
                title={energy.title}
                text={energy.text}
            >
                <PulseChart />
            </TechSection>

            <section
                aria-labelledby="control-title"
                className="bg-linear-to-b from-white via-slate-50 to-white py-24 sm:py-32 lg:py-44"
            >
                <Container>
                    <Reveal className="mx-auto max-w-3xl text-center">
                        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand-700">{control.tag}</p>
                        <h2
                            id="control-title"
                            className="mt-6 text-balance text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl"
                        >
                            {control.title}
                        </h2>
                        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
                            {control.text}
                        </p>
                    </Reveal>
                    <SignalChain title={t.chainTitle} steps={t.chain} />
                </Container>
            </section>

            <TechSection id="cost-title" tag={cost.tag} metric={cost.metric} title={cost.title} text={cost.text}>
                <CostBars />
            </TechSection>

            <section aria-label={t.modular.eyebrow} className="pb-24 sm:pb-32 lg:pb-44">
                <Container>
                    <Reveal className="mx-auto max-w-5xl rounded-[2rem] bg-slate-50 p-8 sm:p-14">
                        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand-700">
                            {t.modular.eyebrow}
                        </p>
                        <p className="mt-4 max-w-xl text-xl leading-relaxed text-slate-700">{t.modular.text}</p>
                        <dl className="mt-12 grid gap-10 sm:grid-cols-2">
                            {parts.map((part) => (
                                <div key={part.label}>
                                    <dt className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                        {part.label}
                                    </dt>
                                    <dd className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                                        {formatMXN(part.value, locale)}
                                    </dd>
                                    <dd className="mt-2 max-w-xs text-base leading-relaxed text-slate-600">{part.note}</dd>
                                </div>
                            ))}
                        </dl>
                    </Reveal>
                </Container>
            </section>
        </>
    );
}
