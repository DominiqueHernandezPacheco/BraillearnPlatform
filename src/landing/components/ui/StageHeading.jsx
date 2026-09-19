import Reveal from './Reveal';

// Encabezado de producto: nombre pequeño, titular grande, mucho aire. `level`
// permite que el titular de cada página sea el único h1 y el resto h2.
export default function StageHeading({ id, eyebrow, title, lead, align = 'center', tone = 'light', level = 'h2' }) {
    const Heading = level;
    const centered = align === 'center';
    const dark = tone === 'dark';
    return (
        <div className={centered ? 'mx-auto max-w-4xl text-center' : 'max-w-3xl'}>
            <Reveal>
                <p className={`text-lg font-semibold ${dark ? 'text-white/85' : 'text-brand-700'}`}>{eyebrow}</p>
            </Reveal>
            <Reveal delay={0.08}>
                <Heading
                    id={id}
                    className={`mt-3 text-balance text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl ${
                        dark ? 'text-white' : 'text-slate-900'
                    }`}
                >
                    {title}
                </Heading>
            </Reveal>
            {lead && (
                <Reveal delay={0.16}>
                    <p
                        className={`mt-6 text-pretty text-xl leading-relaxed sm:text-2xl ${
                            centered ? 'mx-auto max-w-2xl' : 'max-w-2xl'
                        } ${dark ? 'text-white/85' : 'text-slate-600'}`}
                    >
                        {lead}
                    </p>
                </Reveal>
            )}
        </div>
    );
}
