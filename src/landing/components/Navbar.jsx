import { useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import AccessibilityMenu from './AccessibilityMenu';
import LanguageMenu from './LanguageMenu';
import { useCopy } from '../i18n/languageContext';
import { navLinks, pages, site } from '../content';

const HERO_OFFSET = 96;

function BrailleMark({ onDark }) {
    // Logotipo: la celda de la letra "b" (puntos 1 y 2).
    const dots = [
        [4, 4, true],
        [12, 4, false],
        [4, 12, true],
        [12, 12, false],
        [4, 20, false],
        [12, 20, false],
    ];
    return (
        <svg viewBox="0 0 16 24" className="h-6 w-4" aria-hidden="true">
            {dots.map(([cx, cy, on]) => (
                <circle
                    key={`${cx}-${cy}`}
                    cx={cx}
                    cy={cy}
                    r="2.6"
                    className={on ? (onDark ? 'fill-white' : 'fill-brand-600') : onDark ? 'fill-white/40' : 'fill-slate-300'}
                />
            ))}
        </svg>
    );
}

// `darkHero`: la página abre con un fondo de color a pantalla completa, así que
// la barra empieza transparente y con letras blancas hasta salir de él.
export default function Navbar({ page, darkHero, textSize, onTextSize, calm, onCalm }) {
    const t = useCopy();
    const [menuOpen, setMenuOpen] = useState(false);
    const [pastHero, setPastHero] = useState(() => typeof window !== 'undefined' && window.scrollY > window.innerHeight - HERO_OFFSET);
    const { scrollY, scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

    useMotionValueEvent(scrollY, 'change', (y) => setPastHero(y > window.innerHeight - HERO_OFFSET));

    const onDark = darkHero && !pastHero && !menuOpen;

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
                onDark ? 'border-transparent bg-transparent' : 'border-slate-200/80 bg-white/85 backdrop-blur-md'
            }`}
        >
            <nav aria-label={t.common.mainNav} className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <a href={pages.home} className="flex items-center gap-2.5 rounded-md">
                    <BrailleMark onDark={onDark} />
                    <span className={`text-xl font-extrabold tracking-tight ${onDark ? 'text-white' : 'text-slate-900'}`}>
                        Braillearn
                    </span>
                </a>

                <ul className="hidden items-center gap-1 xl:flex">
                    {navLinks.map((link) => {
                        const current = link.page === page;
                        return (
                            <li key={link.id}>
                                <a
                                    href={link.href}
                                    aria-current={current ? 'page' : undefined}
                                    className={`relative inline-flex min-h-11 items-center px-4 text-[15px] font-medium transition-colors duration-200 ${
                                        onDark
                                            ? current
                                                ? 'text-white'
                                                : 'text-white/80 hover:text-white'
                                            : current
                                              ? 'text-brand-700'
                                              : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {t.nav[link.id]}
                                    {current && (
                                        <span
                                            aria-hidden="true"
                                            className={`absolute inset-x-4 bottom-1.5 h-0.5 rounded-full ${onDark ? 'bg-white' : 'bg-brand-600'}`}
                                        />
                                    )}
                                </a>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex items-center gap-2">
                    <LanguageMenu onDark={onDark} />
                    <AccessibilityMenu textSize={textSize} onTextSize={onTextSize} calm={calm} onCalm={onCalm} onDark={onDark} />
                    <a
                        href={site.platformUrl}
                        className={`hidden min-h-11 items-center rounded-full px-5 text-[15px] font-semibold whitespace-nowrap transition-colors duration-200 sm:inline-flex ${
                            onDark ? 'bg-white text-brand-700 hover:bg-brand-50' : 'bg-brand-600 text-white hover:bg-brand-700'
                        }`}
                    >
                        {t.common.tryPlatform}
                    </a>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((v) => !v)}
                        onKeyDown={(event) => event.key === 'Escape' && setMenuOpen(false)}
                        aria-expanded={menuOpen}
                        aria-controls="landing-mobile-menu"
                        aria-label={menuOpen ? t.common.closeMenu : t.common.openMenu}
                        className={`flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 xl:hidden ${
                            onDark ? 'text-white hover:bg-white/15' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {menuOpen ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        id="landing-mobile-menu"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-200 bg-white px-4 pb-5 pt-2 xl:hidden"
                    >
                        <ul>
                            {navLinks.map((link) => (
                                <li key={link.id}>
                                    <a
                                        href={link.href}
                                        onClick={() => setMenuOpen(false)}
                                        aria-current={link.page === page ? 'page' : undefined}
                                        className={`flex min-h-12 items-center border-b border-slate-100 text-base font-medium ${
                                            link.page === page ? 'text-brand-700' : 'text-slate-700'
                                        }`}
                                    >
                                        {t.nav[link.id]}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <a
                            href={site.platformUrl}
                            className="mt-4 flex min-h-12 items-center justify-center rounded-full bg-brand-600 text-base font-semibold text-white"
                        >
                            {t.common.tryPlatform}
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>

            {!onDark && (
                <motion.div
                    aria-hidden="true"
                    style={{ scaleX: progress }}
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-600"
                />
            )}
        </header>
    );
}
