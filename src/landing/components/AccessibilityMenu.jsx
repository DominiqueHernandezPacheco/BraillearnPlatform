import { useEffect, useId, useRef, useState } from 'react';
import { Accessibility } from 'lucide-react';
import { useCopy } from '../i18n/languageContext';

const textSizes = ['md', 'lg', 'xl'];

const sampleSize = { md: 'text-sm', lg: 'text-base', xl: 'text-xl' };

export default function AccessibilityMenu({ textSize, onTextSize, calm, onCalm, onDark = false }) {
    const t = useCopy();
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const panelRef = useRef(null);
    const panelId = useId();

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

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={t.a11y.label}
                className={`flex size-11 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200 ${
                    onDark
                        ? 'border-white/40 bg-transparent text-white hover:bg-white/15'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700'
                }`}
            >
                <Accessibility className="size-5" aria-hidden="true" />
            </button>

            {open && (
                <div
                    ref={panelRef}
                    id={panelId}
                    role="group"
                    aria-label={t.a11y.label}
                    className="fixed inset-x-4 top-[4.5rem] z-50 rounded-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-80 border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10"
                >
                    <p className="text-sm font-semibold text-slate-900">{t.a11y.textSize}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {textSizes.map((size) => (
                            <button
                                key={size}
                                type="button"
                                aria-pressed={textSize === size}
                                onClick={() => onTextSize(size)}
                                className={`flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-lg border px-2 py-1 transition-colors duration-200 ${
                                    textSize === size
                                        ? 'border-brand-600 bg-brand-600 text-white'
                                        : 'border-slate-200 text-slate-700 hover:border-brand-300'
                                }`}
                            >
                                <span aria-hidden="true" className={`font-bold leading-none ${sampleSize[size]}`}>
                                    A
                                </span>
                                <span className="mt-1 text-[11px] font-medium leading-none">{t.a11y.sizes[size]}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <span id={`${panelId}-calm`} className="text-sm font-semibold text-slate-900">
                            {t.a11y.reduceMotion}
                        </span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={calm}
                            aria-labelledby={`${panelId}-calm`}
                            onClick={() => onCalm(!calm)}
                            className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                                calm ? 'bg-brand-600' : 'bg-slate-300'
                            }`}
                        >
                            <span
                                aria-hidden="true"
                                className={`absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform duration-200 ${
                                    calm ? 'translate-x-5' : ''
                                }`}
                            />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
