import { Clock, Globe, Mail, MapPin, Phone } from 'lucide-react';
import Container from './ui/Container';
import Reveal from './ui/Reveal';
import StageHeading from './ui/StageHeading';
import { useLanguage } from '../i18n/languageContext';
import { communityChecked, communityOrgs } from '../content';

const rowClass = 'flex items-start gap-3 text-[15px] leading-relaxed text-slate-700';
const iconClass = 'mt-1 size-4 shrink-0 text-brand-600';
const linkClass = 'underline decoration-slate-300 underline-offset-4 transition-colors hover:text-brand-700 hover:decoration-brand-600';

// Página propia (h1). Directorio de instituciones verificadas. Es un directorio de apoyo, no una lista
// de aliados: no afirma ninguna relación con las organizaciones.
export default function Community() {
    const { t: copy, locale } = useLanguage();
    const t = copy.community;
    const checkedOn = new Date(`${communityChecked}T12:00:00`).toLocaleDateString(locale, { dateStyle: 'long' });

    return (
        <section
            id="comunidad"
            aria-labelledby="community-title"
            className="bg-linear-to-b from-white to-slate-50 pb-28 pt-32 sm:pb-36 sm:pt-40 lg:pb-44"
        >
            <Container>
                <StageHeading level="h1" id="community-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

                <ul className="mx-auto mt-16 grid max-w-5xl gap-6 sm:mt-20 md:grid-cols-2">
                    {communityOrgs.map((org, i) => {
                        const text = t.orgs[org.id];
                        return (
                            <Reveal
                                as="li"
                                key={org.id}
                                delay={i * 0.1}
                                className="flex flex-col rounded-[2rem] border border-slate-200 bg-white p-8 sm:p-10"
                            >
                                <p className="text-sm font-semibold text-brand-700">{text.kind}</p>
                                <h3 className="mt-2 text-balance text-xl font-bold leading-snug text-slate-900">{org.name}</h3>
                                <p className="mt-4 text-base leading-relaxed text-slate-600">{text.description}</p>

                                <dl className="mt-8 space-y-3">
                                    {org.address && (
                                        <div className={rowClass}>
                                            <dt className="sr-only">{t.labels.address}</dt>
                                            <MapPin className={iconClass} aria-hidden="true" />
                                            <dd>{org.address}</dd>
                                        </div>
                                    )}
                                    {org.phones?.map((phone) => (
                                        <div key={phone.tel} className={rowClass}>
                                            <dt className="sr-only">{t.labels.phone}</dt>
                                            <Phone className={iconClass} aria-hidden="true" />
                                            <dd>
                                                <a href={`tel:${phone.tel}`} className={linkClass}>
                                                    {phone.label}
                                                </a>
                                            </dd>
                                        </div>
                                    ))}
                                    {org.email && (
                                        <div className={rowClass}>
                                            <dt className="sr-only">{t.labels.email}</dt>
                                            <Mail className={iconClass} aria-hidden="true" />
                                            <dd>
                                                <a href={`mailto:${org.email}`} className={linkClass}>
                                                    {org.email}
                                                </a>
                                            </dd>
                                        </div>
                                    )}
                                    {text.hours && (
                                        <div className={rowClass}>
                                            <dt className="sr-only">{t.labels.hours}</dt>
                                            <Clock className={iconClass} aria-hidden="true" />
                                            <dd>{text.hours}</dd>
                                        </div>
                                    )}
                                    {org.url && (
                                        <div className={rowClass}>
                                            <dt className="sr-only">{t.labels.web}</dt>
                                            <Globe className={iconClass} aria-hidden="true" />
                                            <dd className="break-all">
                                                <a href={org.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                                                    {new URL(org.url).hostname}
                                                </a>
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </Reveal>
                        );
                    })}
                </ul>

                <p className="mx-auto mt-6 max-w-5xl text-sm text-slate-500">{t.checked(checkedOn)}</p>

                <Reveal className="mx-auto mt-14 flex max-w-5xl flex-col items-start justify-between gap-6 rounded-[2rem] bg-brand-600 p-8 text-white sm:flex-row sm:items-center sm:p-10">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tight">{t.cta.title}</h3>
                        <p className="mt-2 text-lg text-white/90">{t.cta.text}</p>
                    </div>
                    <a
                        href="#contacto"
                        className="inline-flex min-h-12 shrink-0 items-center rounded-full bg-white px-7 text-base font-semibold text-brand-700 transition-colors duration-200 hover:bg-brand-50"
                    >
                        {t.cta.button}
                    </a>
                </Reveal>
            </Container>
        </section>
    );
}
