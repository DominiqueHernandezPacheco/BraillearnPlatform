import { ArrowRight, Mail } from 'lucide-react';
import Container from './ui/Container';
import Reveal from './ui/Reveal';
import { useCopy } from '../i18n/languageContext';
import { site } from '../content';

// Cierre común a todas las páginas; es el destino del enlace "Contacto".
export default function ContactBanner() {
    const t = useCopy();

    return (
        <section aria-labelledby="contact-title" className="bg-white pb-24 pt-8 sm:pb-32">
            <Container>
                <Reveal
                    id="contacto"
                    className="on-dark flex flex-col items-start gap-8 rounded-[2rem] bg-slate-900 p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between"
                >
                    <div className="max-w-2xl">
                        <h2 id="contact-title" className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                            {t.contact.title}
                        </h2>
                        <p className="mt-3 text-lg leading-relaxed text-slate-300">{t.contact.text}</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                        <a
                            href={site.platformUrl}
                            className="group inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-brand-600 px-7 text-base font-semibold text-white transition-colors duration-200 hover:bg-brand-500"
                        >
                            {t.common.tryPlatform}
                            <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                        </a>
                        {site.contactEmail && (
                            <a
                                href={`mailto:${site.contactEmail}`}
                                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-slate-600 px-7 text-base font-semibold text-white transition-colors duration-200 hover:border-white"
                            >
                                <Mail className="size-5" aria-hidden="true" />
                                {t.contact.mail}
                            </a>
                        )}
                    </div>
                </Reveal>
            </Container>
        </section>
    );
}
