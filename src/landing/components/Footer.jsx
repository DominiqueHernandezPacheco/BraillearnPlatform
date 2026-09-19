import Container from './ui/Container';
import { useCopy } from '../i18n/languageContext';
import { faculty, navLinks, site, university } from '../content';

export default function Footer() {
    const t = useCopy();

    return (
        <footer className="border-t border-slate-200 bg-white py-10">
            <Container className="flex flex-col gap-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                <div>
                    <p>
                        <span className="font-semibold text-slate-700">Braillearn</span> · {faculty} · {university}
                    </p>
                    <p className="mt-1">
                        © {site.year} Braillearn. {t.footer.note}
                    </p>
                </div>
                <nav aria-label={t.common.footerNav}>
                    <ul className="flex flex-wrap gap-x-6 gap-y-2">
                        {navLinks.map((link) => (
                            <li key={link.id}>
                                <a href={link.href} className="inline-flex min-h-8 items-center hover:text-slate-900">
                                    {t.nav[link.id]}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </Container>
        </footer>
    );
}
