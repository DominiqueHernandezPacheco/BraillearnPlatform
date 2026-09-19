import { useCallback, useEffect, useMemo, useState } from 'react';
import { MotionConfig, useReducedMotion } from 'framer-motion';
import Navbar from './components/Navbar';
import ContactBanner from './components/ContactBanner';
import Footer from './components/Footer';
import { CalmMotionContext } from './calmMotionContext';
import { LanguageContext } from './i18n/languageContext';
import { dictionaries } from './i18n/dictionaries';
import { detectLanguage, localeFor, saveLanguage } from './i18n/languages';

// Marco común de todas las páginas: navbar, contacto, pie y preferencias de
// idioma y accesibilidad. `page` decide qué enlace del navbar se marca como actual.
export default function SiteShell({ page, darkHero = false, children }) {
    const [lang, setLangState] = useState(detectLanguage);
    const [textSize, setTextSize] = useState('md');
    const [calm, setCalm] = useState(false);
    const osReducedMotion = useReducedMotion();
    const reduceMotion = calm || Boolean(osReducedMotion);

    const setLang = useCallback((code) => {
        setLangState(code);
        saveLanguage(code);
    }, []);

    const language = useMemo(
        () => ({ lang, locale: localeFor(lang), setLang, t: dictionaries[lang] }),
        [lang, setLang]
    );
    const { t } = language;

    // El idioma del documento (lectores de pantalla, tipografía, traductores) y
    // el título/descripción de la pestaña siguen al idioma elegido.
    useEffect(() => {
        document.documentElement.lang = lang;
        document.title = t.meta.titles[page];
        document
            .querySelector('meta[name="description"]')
            ?.setAttribute('content', t.meta.descriptions[page]);
    }, [lang, page, t]);

    // El tamaño de texto escala el rem del <html>; se limpia al desmontar para no
    // afectar al resto de la app cuando la landing viva dentro de ella.
    useEffect(() => {
        const root = document.documentElement;
        if (textSize === 'md') delete root.dataset.landingText;
        else root.dataset.landingText = textSize;
        return () => delete root.dataset.landingText;
    }, [textSize]);

    return (
        <LanguageContext.Provider value={language}>
            <CalmMotionContext.Provider value={reduceMotion}>
                <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>
                    <div className="bg-white font-sans text-slate-900 antialiased">
                        <a
                            href="#contenido"
                            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
                        >
                            {t.common.skipToContent}
                        </a>
                        <Navbar
                            page={page}
                            darkHero={darkHero}
                            textSize={textSize}
                            onTextSize={setTextSize}
                            calm={calm}
                            onCalm={setCalm}
                        />
                        <main id="contenido">{children}</main>
                        <ContactBanner />
                        <Footer />
                    </div>
                </MotionConfig>
            </CalmMotionContext.Provider>
        </LanguageContext.Provider>
    );
}
