import { useId, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Container from '../ui/Container';
import Reveal from '../ui/Reveal';
import StageHeading from '../ui/StageHeading';
import { useLanguage } from '../../i18n/languageContext';
import { formatMXN } from '../../i18n/format';
import { modular, pages, site } from '../../content';

const DOT_POSITIONS = [
    [4, 4], [12, 4], [4, 12], [12, 12], [4, 20], [12, 20],
];

function MiniCell({ active }) {
    return (
        <svg viewBox="0 0 16 24" className="w-full" aria-hidden="true">
            {DOT_POSITIONS.map(([cx, cy]) => (
                <circle
                    key={`${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    r="2.9"
                    className={`transition-colors duration-300 ${active ? 'fill-brand-600' : 'fill-slate-200'}`}
                />
            ))}
        </svg>
    );
}

export default function ModularSection() {
    const { t: copy, locale } = useLanguage();
    const t = copy.modular;
    const [cells, setCells] = useState(6);
    const sliderId = useId();
    const tiers = [
        { ...t.minimum, value: modular.minimum },
        { ...t.complete, value: modular.complete },
    ];

    return (
        <section aria-labelledby="modular-title" className="relative bg-linear-to-b from-white via-slate-50 to-white py-28 sm:py-36 lg:py-44">
            <Container>
                <StageHeading id="modular-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

                <Reveal className="mx-auto mt-16 max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 sm:mt-20 sm:p-12">
                    <div aria-hidden="true" className="grid grid-cols-10 gap-x-3 gap-y-5 sm:gap-x-4 lg:grid-cols-20">
                        {Array.from({ length: modular.maxCells }, (_, i) => (
                            <MiniCell key={i} active={i < cells} />
                        ))}
                    </div>

                    <div className="mt-10">
                        <div className="flex items-baseline justify-between gap-4">
                            <label htmlFor={sliderId} className="text-base font-semibold text-slate-900">
                                {t.cellsLabel}
                            </label>
                            <output
                                htmlFor={sliderId}
                                aria-live="polite"
                                className="text-right text-lg font-semibold tabular-nums text-slate-900"
                            >
                                {t.readout(cells, cells * modular.dotsPerCell)}
                            </output>
                        </div>
                        <input
                            id={sliderId}
                            type="range"
                            min={1}
                            max={modular.maxCells}
                            value={cells}
                            onChange={(event) => setCells(Number(event.target.value))}
                            className="mt-4 h-11 w-full cursor-pointer accent-brand-600"
                        />
                    </div>

                    <dl className="mt-8 grid gap-6 border-t border-slate-100 pt-8 sm:grid-cols-2">
                        {tiers.map((tier) => (
                            <div key={tier.label}>
                                <dt className="text-base text-slate-600">
                                    {tier.label} <span className="text-slate-500">· {tier.detail}</span>
                                </dt>
                                <dd className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                                    {formatMXN(tier.value, locale)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </Reveal>

                <Reveal className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                    <a
                        href={site.platformUrl}
                        className="inline-flex min-h-12 items-center rounded-full bg-brand-600 px-7 text-base font-semibold text-white transition-colors duration-200 hover:bg-brand-700"
                    >
                        {copy.common.tryPlatform}
                    </a>
                    <a
                        href={pages.tecnologia}
                        className="group inline-flex min-h-12 items-center gap-1 text-base font-semibold text-brand-700"
                    >
                        {t.techLink}
                        <ChevronRight className="size-5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                    </a>
                </Reveal>
            </Container>
        </section>
    );
}
