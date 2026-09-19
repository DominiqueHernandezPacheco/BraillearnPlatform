import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Container from '../ui/Container';
import Reveal from '../ui/Reveal';
import ModelStage from '../ui/ModelStage';
import StageHeading from '../ui/StageHeading';
import { useCalmMotion } from '../../calmMotionContext';
import { useCopy } from '../../i18n/languageContext';

export default function DisplaySection() {
    const copy = useCopy();
    const t = copy.display;
    const models = copy.models;
    const stageRef = useRef(null);
    const calm = useCalmMotion();
    const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'center center'] });
    const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);

    return (
        <section id="producto" aria-labelledby="display-title" className="relative pb-28 pt-8 sm:pb-36 lg:pb-44">
            <Container>
                <StageHeading id="display-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

                <motion.div ref={stageRef} style={calm ? undefined : { scale }} className="mt-16 sm:mt-20">
                    <ModelStage
                        file="ensamblaje3.glb"
                        alt={models.display.alt}
                        orbit="-35deg 68deg auto"
                        className="h-96 sm:h-[30rem] lg:h-[36rem]"
                    />
                </motion.div>

                <dl className="mt-20 grid gap-12 sm:mt-24 md:grid-cols-3 md:gap-8">
                    {t.highlights.map((item, i) => (
                        <Reveal key={item.value} delay={i * 0.1} className="text-center md:text-left">
                            <dt className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{item.value}</dt>
                            <dd className="mt-3 max-w-xs text-lg leading-relaxed text-slate-600 max-md:mx-auto">{item.label}</dd>
                        </Reveal>
                    ))}
                </dl>
            </Container>
        </section>
    );
}
