import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Container from '../ui/Container';
import Reveal from '../ui/Reveal';
import { useCopy } from '../../i18n/languageContext';
import { readers } from '../../content';

function Bubble({ children, delay }) {
    return (
        <motion.p
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
            className="ml-auto w-fit rounded-2xl rounded-br-md bg-white/15 px-5 py-3 text-lg font-medium text-white"
        >
            “{children}”
        </motion.p>
    );
}

export default function BentoSection() {
    const copy = useCopy();
    const t = copy.bento;

    return (
        <section aria-label={t.aria} className="py-8 sm:py-12">
            <Container className="grid gap-6 md:grid-cols-2">
                <Reveal className="flex min-h-[32rem] flex-col justify-between overflow-hidden rounded-[2rem] bg-brand-600 p-8 text-white sm:p-12">
                    <div>
                        <p className="text-lg font-semibold text-white/85">{t.voice.eyebrow}</p>
                        <h2 className="mt-2 text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                            {t.voice.title}
                        </h2>
                        <p className="mt-4 max-w-md text-lg leading-relaxed text-white/90">{t.voice.text}</p>
                    </div>

                    <div className="mt-10 space-y-3">
                        {copy.voice.utterances.map((text, i) => (
                            <Bubble key={text} delay={0.3 + i * 0.5}>
                                {text}
                            </Bubble>
                        ))}
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
                            className="flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-lg font-semibold text-brand-700"
                        >
                            <ArrowRight className="size-5" aria-hidden="true" />
                            {copy.voice.result}
                        </motion.p>
                    </div>
                </Reveal>

                <Reveal
                    delay={0.1}
                    className="flex min-h-[32rem] flex-col justify-between overflow-hidden rounded-[2rem] bg-slate-100 p-8 sm:p-12"
                >
                    <div>
                        <p className="text-lg font-semibold text-brand-700">{t.access.eyebrow}</p>
                        <h2 className="mt-2 text-balance text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                            {t.access.title}
                        </h2>
                        <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-600">{t.access.text}</p>
                    </div>

                    <div className="mt-10">
                        <ul className="flex flex-wrap gap-2" aria-label={t.access.readersLabel}>
                            {readers.map((reader) => (
                                <li key={reader} className="rounded-full bg-white px-4 py-2 text-base font-semibold text-slate-800">
                                    {reader}
                                </li>
                            ))}
                        </ul>
                        <ul className="mt-6 space-y-2.5">
                            {t.access.settings.map((setting) => (
                                <li key={setting} className="flex items-center gap-3 text-lg text-slate-700">
                                    <Check className="size-5 shrink-0 text-brand-600" aria-hidden="true" strokeWidth={2.5} />
                                    {setting}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Reveal>
            </Container>
        </section>
    );
}
