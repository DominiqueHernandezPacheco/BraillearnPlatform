import { Circle, Globe, Medal } from 'lucide-react';
import Reveal from '../ui/Reveal';
import PhotoStrip from './PhotoStrip';
import { Chapter, Timeline } from './Timeline';
import { CellBridge, DotScale, ProblemStat } from './ProblemVisuals';
import { useCopy } from '../../i18n/languageContext';
import { buildStats } from '../../content';

// Medalla, color y nombre de la etapa: el texto siempre acompaña al color.
const stageStyle = [
    { icon: Medal, tone: 'text-slate-500 bg-slate-100' },
    { icon: Medal, tone: 'text-amber-600 bg-amber-50' },
    { icon: Globe, tone: 'text-brand-700 bg-brand-50' },
];

function BuildVisual() {
    const t = useCopy().history.build;

    return (
        <div>
            <dl className="grid gap-10 sm:grid-cols-3 sm:gap-8">
                {buildStats.map((value, i) => (
                    <Reveal key={value} delay={i * 0.08}>
                        <dt className="text-6xl font-extrabold tracking-tight text-slate-900 tabular-nums">{value}</dt>
                        <dd className="mt-2 text-base leading-relaxed text-slate-600">{t.stats[i]}</dd>
                    </Reveal>
                ))}
            </dl>
            <Reveal className="mt-14">
                <PhotoStrip />
            </Reveal>
        </div>
    );
}

function ProofVisual() {
    const t = useCopy().history.proof;

    return (
        <dl className="grid gap-10 sm:grid-cols-2 sm:gap-8">
            {t.stats.map((stat, i) => (
                <Reveal key={stat.value} delay={i * 0.1} className="rounded-[2rem] bg-slate-50 p-8 sm:p-10">
                    <dt className="text-6xl font-extrabold tracking-tight text-brand-600">{stat.value}</dt>
                    <dd className="mt-3 text-lg leading-relaxed text-slate-600">{stat.label}</dd>
                </Reveal>
            ))}
        </dl>
    );
}

function RecognitionVisual() {
    const t = useCopy().history.recognition;

    return (
        <ol className="grid gap-6 md:grid-cols-3">
            {t.items.map((item, i) => {
                const { icon: Icon, tone } = stageStyle[i];
                return (
                    <Reveal as="li" key={item.title} delay={i * 0.1} className="rounded-[2rem] border border-slate-200 bg-white p-8">
                        <span className={`flex size-12 items-center justify-center rounded-full ${tone}`}>
                            <Icon className="size-6" aria-hidden="true" strokeWidth={1.75} />
                        </span>
                        <p className="mt-6 text-sm font-semibold text-slate-500">{item.when}</p>
                        <p className="mt-1 text-xl font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-lg text-slate-600">{item.medal}</p>
                    </Reveal>
                );
            })}
        </ol>
    );
}

function NextList() {
    const t = useCopy().history.next;

    return (
        <ul className="space-y-5">
            {t.items.map((item, i) => (
                <Reveal as="li" key={item} delay={i * 0.08} className="flex items-start gap-4 text-xl text-slate-800">
                    <Circle className="mt-1.5 size-4 shrink-0 text-brand-600" aria-hidden="true" strokeWidth={2.5} />
                    {item}
                </Reveal>
            ))}
        </ul>
    );
}

// La historia como una línea progresiva: cada capítulo lleva al siguiente.
export default function HistoryChapters() {
    const t = useCopy();
    const h = t.history;

    return (
        <section aria-label={h.hero.eyebrow} className="pb-32 pt-16 sm:pb-44 sm:pt-24">
            <Timeline>
                <Chapter label={h.labels[0]} title={t.problem.title} text={t.problem.lead}>
                    <ProblemStat />
                </Chapter>
                <Chapter label={h.labels[1]} title={t.problem.scale.title} text={t.problem.scale.lead}>
                    <DotScale />
                </Chapter>
                <Chapter label={h.labels[2]} title={t.problem.bridge.title} text={t.problem.bridge.text}>
                    <CellBridge />
                </Chapter>
                <Chapter label={h.labels[3]} title={h.build.title} text={h.build.text}>
                    <BuildVisual />
                </Chapter>
                <Chapter label={h.labels[4]} title={h.proof.title} text={h.proof.text}>
                    <ProofVisual />
                </Chapter>
                <Chapter label={h.labels[5]} title={h.recognition.title} text={h.recognition.text}>
                    <RecognitionVisual />
                </Chapter>
                <Chapter label={h.labels[6]} title={h.next.title} text={h.next.text}>
                    <NextList />
                </Chapter>
            </Timeline>
        </section>
    );
}
