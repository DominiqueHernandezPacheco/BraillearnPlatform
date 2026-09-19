import { useEffect, useId, useRef, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { LANGUAGES } from '../i18n/languages';
import { useLanguage } from '../i18n/languageContext';

export default function LanguageMenu({ onDark = false }) {
    const { lang, setLang, t } = useLanguage();
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const panelRef = useRef(null);
    const panelId = useId();
    const current = LANGUAGES.find((item) => item.code === lang);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event) => {
            if (!panelRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) {
                setOpen(false);
            }
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const choose = (code) => {
        setLang(code);
        setOpen(false);
        buttonRef.current?.focus();
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={`${t.language.label}: ${current.native}`}
                className={`flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-colors duration-200 ${
                    onDark
                        ? 'border-white/40 bg-transparent text-white hover:bg-white/15'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700'
                }`}
            >
                <Globe className="size-5" aria-hidden="true" />
                <span aria-hidden="true" className="hidden sm:inline">
                    {current.short}
                </span>
            </button>

            {open && (
                <div
                    ref={panelRef}
                    id={panelId}
                    role="group"
                    aria-label={t.language.label}
                    className="fixed inset-x-4 top-[4.5rem] z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-56"
                >
                    <ul>
                        {LANGUAGES.map((item) => {
                            const active = item.code === lang;
                            return (
                                <li key={item.code}>
                                    <button
                                        type="button"
                                        lang={item.code}
                                        aria-current={active ? 'true' : undefined}
                                        onClick={() => choose(item.code)}
                                        className={`flex min-h-11 w-full cursor-pointer items-center justify-between rounded-lg px-3 text-left text-base transition-colors duration-150 ${
                                            active
                                                ? 'bg-brand-50 font-semibold text-brand-700'
                                                : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        {item.native}
                                        {active && <Check className="size-4" aria-hidden="true" />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
