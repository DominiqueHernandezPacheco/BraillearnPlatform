import { useState } from 'react';
import Container from '../ui/Container';
import Reveal from '../ui/Reveal';
import StageHeading from '../ui/StageHeading';
import { useCopy } from '../../i18n/languageContext';
import { historiaVideo } from '../../content';

// El video se adapta a su formato (horizontal o vertical) en cuanto el navegador
// conoce sus dimensiones, y nunca supera el 75 % del alto de la ventana.
function InfomatrixVideo() {
    const t = useCopy().history.hero;
    const [ratio, setRatio] = useState(16 / 9);

    return (
        <figure className="mx-auto" style={{ maxWidth: `min(100%, calc(75vh * ${ratio}))` }}>
            <div
                className="overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl shadow-slate-900/20"
                style={{ aspectRatio: ratio }}
            >
                <video
                    className="size-full object-contain"
                    src={`${historiaVideo.src}#t=${historiaVideo.startAt || 0.1}`}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={t.videoAria}
                    onLoadedMetadata={(event) => {
                        const { videoWidth, videoHeight } = event.currentTarget;
                        if (videoWidth && videoHeight) setRatio(videoWidth / videoHeight);
                    }}
                >
                    {t.fallback}
                </video>
            </div>
            <figcaption className="mt-5 text-center text-base leading-relaxed text-slate-600">{t.caption}</figcaption>
        </figure>
    );
}

export default function HistoryHero() {
    const t = useCopy().history.hero;

    return (
        <section aria-labelledby="historia-title" className="pb-12 pt-32 sm:pt-40">
            <Container>
                <StageHeading level="h1" id="historia-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
                <Reveal className="mt-14 sm:mt-20">
                    <InfomatrixVideo />
                </Reveal>
            </Container>
        </section>
    );
}
