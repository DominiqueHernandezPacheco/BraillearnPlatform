import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AudioLines, GraduationCap, MonitorSmartphone } from 'lucide-react';
import Container from '../ui/Container';
import Reveal from '../ui/Reveal';
import StageHeading from '../ui/StageHeading';
import { useCopy } from '../../i18n/languageContext';
import { pages } from '../../content';

// Mismo orden que `platform.features` en los diccionarios.
const featureIcons = [GraduationCap, MonitorSmartphone, AudioLines];

const RATIO = 16 / 10;
// Ancho "virtual" con el que se renderiza la plataforma; luego se escala para
// caber en el marco. En pantallas estrechas se usa uno menor para que se lea.
const WIDE = 1280;
const NARROW = 900;

// La plataforma real (solo su página principal) dentro de un marco, escalada
// como una miniatura viva. Es una página aparte: platform-demo.html.
function PlatformFrame({ title }) {
    const boxRef = useRef(null);
    const [box, setBox] = useState(0);

    // Medida inicial síncrona (no depende de que la pestaña esté visible) y después
    // seguimiento del tamaño del marco.
    useLayoutEffect(() => {
        setBox(boxRef.current.getBoundingClientRect().width);
    }, []);

    useEffect(() => {
        const el = boxRef.current;
        const observer = new ResizeObserver(([entry]) => setBox(entry.contentRect.width));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const width = box && box < 700 ? NARROW : WIDE;
    const height = width / RATIO;
    const scale = box ? box / width : 0;

    return (
        <div ref={boxRef} className="relative w-full overflow-hidden bg-white" style={{ aspectRatio: RATIO }}>
            {scale > 0 && (
                <iframe
                    src={pages.platformDemo}
                    title={title}
                    loading="lazy"
                    className="absolute left-0 top-0 origin-top-left border-0"
                    style={{ width, height, transform: `scale(${scale})` }}
                />
            )}
        </div>
    );
}

export default function PlatformSection() {
    const t = useCopy().platform;

    return (
        <section aria-labelledby="platform-title" className="relative bg-linear-to-b from-white via-slate-50 to-white py-28 sm:py-36 lg:py-44">
            <Container>
                <StageHeading id="platform-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

                <Reveal className="mx-auto mt-16 max-w-5xl sm:mt-20">
                    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                        <div aria-hidden="true" className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
                            <span className="size-3 rounded-full bg-slate-200" />
                            <span className="size-3 rounded-full bg-slate-200" />
                            <span className="size-3 rounded-full bg-slate-200" />
                        </div>
                        <PlatformFrame title={t.previewTitle} />
                    </div>
                    <p className="mt-5 text-center text-base leading-relaxed text-slate-600">{t.previewNote}</p>
                </Reveal>

                <ul className="mx-auto mt-20 grid max-w-5xl gap-12 sm:mt-24 md:grid-cols-3 md:gap-10">
                    {t.features.map((feature, i) => {
                        const Icon = featureIcons[i];
                        return (
                            <Reveal as="li" key={feature.title} delay={i * 0.1}>
                                <Icon className="size-8 text-brand-600" aria-hidden="true" strokeWidth={1.5} />
                                <h3 className="mt-5 text-xl font-bold text-slate-900">{feature.title}</h3>
                                <p className="mt-2 text-lg leading-relaxed text-slate-600">{feature.text}</p>
                            </Reveal>
                        );
                    })}
                </ul>
            </Container>
        </section>
    );
}
