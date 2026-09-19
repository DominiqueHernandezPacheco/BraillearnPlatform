import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Container from '../ui/Container';
import Reveal from '../ui/Reveal';
import StageHeading from '../ui/StageHeading';
import TechSection from './TechSection';
import ArchitectureDiagram from './ArchitectureDiagram';
import { useCopy } from '../../i18n/languageContext';
import { readers, stack } from '../../content';

export default function SoftwareSection() {
    const copy = useCopy();
    const t = copy.software;

    return (
        <>
            <section
                aria-labelledby="software-title"
                className="bg-linear-to-b from-white via-slate-50 to-white pb-4 pt-28 sm:pt-36 lg:pt-44"
            >
                <Container>
                    <StageHeading id="software-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
                </Container>
            </section>

            {/* Ecosistema web */}
            <TechSection id="web-title" tag={t.web.label} title={t.web.title} text={t.web.text}>
                <ul className="flex flex-wrap gap-3 rounded-[2rem] bg-slate-50 p-8 sm:p-10" aria-label={t.web.techLabel}>
                    {stack.map((tech) => (
                        <li
                            key={tech}
                            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 font-mono text-base font-medium text-slate-800"
                        >
                            {tech}
                        </li>
                    ))}
                </ul>
            </TechSection>

            {/* Arquitectura del backend */}
            <section aria-labelledby="backend-title" className="pb-24 sm:pb-32 lg:pb-44">
                <Container>
                    <Reveal className="mx-auto max-w-3xl text-center">
                        <h2
                            id="backend-title"
                            className="text-balance text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl"
                        >
                            {copy.backend.title}
                        </h2>
                        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
                            {copy.backend.lead}
                        </p>
                    </Reveal>
                    <div className="mt-16 sm:mt-20">
                        <ArchitectureDiagram />
                    </div>
                </Container>
            </section>

            {/* NLU */}
            <TechSection
                reverse
                id="nlu-title"
                tag={t.nlu.label}
                metric={t.nlu.score}
                title={t.nlu.title}
                text={t.nlu.text}
                note={t.nlu.scoreText}
            >
                <div className="on-dark rounded-[2rem] bg-slate-900 p-8 text-white sm:p-10">
                    <ul className="space-y-3">
                        {copy.voice.utterances.map((text, i) => (
                            <motion.li
                                key={text}
                                initial={{ opacity: 0, x: -12 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + i * 0.2, duration: 0.5 }}
                                className="w-fit rounded-2xl rounded-bl-md bg-white/10 px-5 py-3 text-lg"
                            >
                                “{text}”
                            </motion.li>
                        ))}
                    </ul>
                    <p className="mt-8 flex items-center gap-3 border-t border-white/15 pt-6 font-mono text-base text-brand-300">
                        <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
                        {copy.voice.intent}
                    </p>
                    <p className="mt-4 text-sm text-slate-400">{t.nlu.illustrative}</p>
                </div>
            </TechSection>

            {/* Accesibilidad */}
            <TechSection id="access-title" tag={t.access.label} title={t.access.title} text={t.access.text}>
                <div className="rounded-[2rem] bg-slate-50 p-8 sm:p-10">
                    <ul className="flex flex-wrap gap-2" aria-label={t.access.readersLabel}>
                        {readers.map((reader) => (
                            <li key={reader} className="rounded-full bg-white px-4 py-2 text-base font-semibold text-slate-800">
                                {reader}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-10 font-mono text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        {t.access.panelLabel}
                    </p>
                    <ul className="mt-4 space-y-3">
                        {t.access.settings.map((setting) => (
                            <li key={setting} className="flex items-center gap-3 text-lg text-slate-700">
                                <Check className="size-5 shrink-0 text-brand-600" aria-hidden="true" strokeWidth={2.5} />
                                {setting}
                            </li>
                        ))}
                    </ul>
                </div>
            </TechSection>

            <section aria-label={t.status.label} className="pb-28 sm:pb-36">
                <Container>
                    <Reveal className="mx-auto max-w-3xl text-center">
                        <p className="text-lg text-slate-700">
                            <span className="font-semibold text-slate-900">{t.status.label}</span> {t.status.text}
                        </p>
                        <p className="mt-2 text-lg text-slate-500">{t.status.next}</p>
                    </Reveal>
                </Container>
            </section>
        </>
    );
}
