import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Container from '../ui/Container';
import { useCalmMotion } from '../../calmMotionContext';
import { useCopy } from '../../i18n/languageContext';

function Word({ children, progress, range }) {
    const opacity = useTransform(progress, range, [0.16, 1]);
    return (
        <motion.span style={{ opacity }} className="inline-block">
            {children}
        </motion.span>
    );
}

// Las palabras se van "encendiendo" al avanzar el scroll, palabra por palabra.
export default function ScrollStatement() {
    const t = useCopy();
    const ref = useRef(null);
    const calm = useCalmMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.55'] });
    const words = t.statement.text.split(' ');

    return (
        <section aria-label={t.statement.aria} className="pb-28 pt-60 sm:pb-36 sm:pt-72 lg:pb-44 lg:pt-80">
            <Container>
                <p
                    ref={ref}
                    className="mx-auto max-w-5xl text-balance text-3xl font-bold leading-[1.25] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
                >
                    {calm
                        ? t.statement.text
                        : words.map((word, i) => (
                              <span key={i}>
                                  <Word progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                                      {word}
                                  </Word>
                                  {i < words.length - 1 ? ' ' : ''}
                              </span>
                          ))}
                </p>
            </Container>
        </section>
    );
}
