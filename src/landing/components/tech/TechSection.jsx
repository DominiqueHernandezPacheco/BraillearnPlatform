import Container from '../ui/Container';
import Reveal from '../ui/Reveal';

// Una idea por pantalla: texto a un lado, un solo elemento visual al otro, con
// mucho aire alrededor. `metric` es la cifra que ancla la idea.
export default function TechSection({ id, tag, metric, title, text, note, reverse = false, children }) {
    return (
        <section aria-labelledby={id} className="py-24 sm:py-32 lg:py-44">
            <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
                <Reveal className={reverse ? 'lg:order-2' : ''}>
                    {tag && (
                        <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-brand-700">{tag}</p>
                    )}
                    {metric && (
                        <p className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 tabular-nums sm:text-6xl">
                            {metric}
                        </p>
                    )}
                    <h2
                        id={id}
                        className="mt-6 text-balance text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl"
                    >
                        {title}
                    </h2>
                    <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">{text}</p>
                    {note && <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-500">{note}</p>}
                </Reveal>
                <Reveal delay={0.1} className={reverse ? 'lg:order-1' : ''}>
                    {children}
                </Reveal>
            </Container>
        </section>
    );
}
