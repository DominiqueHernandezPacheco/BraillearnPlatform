import React, { useEffect, useRef } from 'react';
import { Accessibility, X, Type, Volume2, Eye, LifeBuoy, RotateCcw, Check, CirclePlay } from 'lucide-react';
import { useAccessibility } from '../../../context/AccessibilityContext';
import { useAudio } from '../../../context/AudioContext';
import { useUser } from '../../../context/UserContext';

// ── Subcomponente: encabezado de sección ──────────────────────────────────────
const SectionHeading = ({ id, icon, children }) => (
    <h3 id={id} className="mb-3 flex items-center gap-2 font-display text-base font-extrabold text-ink">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
            {icon}
        </span>
        {children}
    </h3>
);

// ── Subcomponente: fila de botones de opción (segmentados) ────────────────────
const OptionRow = ({ label, options, value, onChange }) => (
    <div>
        <p className="mb-2 text-sm font-bold text-ink-soft">{label}</p>
        <div
            className="flex gap-1 rounded-2xl border-2 border-line bg-surface-2 p-1"
            role="group"
            aria-label={label}
        >
            {options.map(opt => {
                const selected = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        aria-pressed={selected}
                        className={`flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl px-2 font-display text-[0.95rem] font-extrabold transition-colors duration-150
                            ${selected
                                ? 'bg-brand text-on-brand'
                                : 'text-ink-soft hover:bg-brand-soft hover:text-brand-strong'
                            }`}
                    >
                        {selected && <Check className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden="true" />}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    </div>
);

// ── Subcomponente: toggle switch con estado escrito ───────────────────────────
const ToggleRow = ({ label, description, checked, onChange, id }) => (
    <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 pt-1">
            <label htmlFor={id} className="cursor-pointer text-sm font-bold text-ink">{label}</label>
            {description && <p className="mt-0.5 text-sm leading-snug text-ink-soft">{description}</p>}
        </div>
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className="flex min-h-11 min-w-[4.5rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl"
        >
            <span
                className={`relative inline-flex h-7 w-12 items-center rounded-full border-2 transition-colors duration-200
                    ${checked ? 'border-brand bg-brand' : 'border-line-strong bg-surface-2'}`}
                aria-hidden="true"
            >
                <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full transition-transform duration-200
                        ${checked ? 'translate-x-[1.375rem] bg-on-brand text-brand' : 'translate-x-0.5 bg-ink-soft text-surface'}`}
                >
                    {checked
                        ? <Check className="h-3 w-3" strokeWidth={4} aria-hidden="true" />
                        : <X className="h-3 w-3" strokeWidth={4} aria-hidden="true" />}
                </span>
            </span>
            <span className={`text-xs font-extrabold ${checked ? 'text-brand-strong' : 'text-ink-soft'}`}>
                {checked ? 'Activado' : 'Desactivado'}
            </span>
        </button>
    </div>
);

// ── Panel principal ───────────────────────────────────────────────────────────
const AccessibilityPanel = ({ isOpen, onClose }) => {
    const {
        fontScale, setFontScale,
        reduceMotion, setReduceMotion,
        highContrast, setHighContrast,
        resetAll,
    } = useAccessibility();

    const {
        speechRate, setSpeechRate,
        selectedVoiceURI, setSelectedVoiceURI,
        availableVoices,
        isMuted, toggleMute,
    } = useAudio();

    const { resetOnboarding } = useUser();

    // Foco automático al primer elemento cuando se abre
    const closeButtonRef = useRef(null);
    useEffect(() => {
        if (isOpen && closeButtonRef.current) {
            setTimeout(() => closeButtonRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Cierra con Escape
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Voces en español disponibles
    const spanishVoices = availableVoices.filter(v => v.lang.startsWith('es'));

    const fontOptions = [
        { value: 0.875, label: 'A−' },
        { value: 1,     label: 'A'  },
        { value: 1.125, label: 'A+' },
        { value: 1.25,  label: 'A++'},
    ];

    const rateOptions = [
        { value: 0.75, label: 'Lenta'  },
        { value: 1.0,  label: 'Normal' },
        { value: 1.5,  label: 'Rápida' },
    ];

    return (
        <>
            {/* Overlay — cierra al hacer click fuera */}
            <div
                className={`fixed inset-0 z-[55] bg-ink/50 backdrop-blur-sm transition-opacity duration-300
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer lateral */}
            <div
                id="a11y-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="a11y-panel-title"
                onKeyDown={(e) => e.key === 'Escape' && onClose()}
                className={`fixed top-0 right-0 z-[60] flex h-full w-[22rem] max-w-full flex-col border-l-2 border-line bg-surface
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}`}
            >
                {/* Cabecera del panel */}
                <div className="flex items-center justify-between gap-3 border-b-2 border-line px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand text-on-brand">
                            <Accessibility className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <h2 id="a11y-panel-title" className="font-display text-xl font-extrabold text-ink">
                            Accesibilidad
                        </h2>
                    </div>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        aria-label="Cerrar panel de accesibilidad"
                        className="icon-btn shrink-0"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                {/* Contenido desplazable */}
                <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">

                    {/* ── Texto ── */}
                    <section aria-labelledby="a11y-text-heading">
                        <SectionHeading id="a11y-text-heading" icon={<Type className="h-4 w-4" aria-hidden="true" />}>Texto</SectionHeading>
                        <OptionRow
                            label="Tamaño de letra"
                            options={fontOptions}
                            value={fontScale}
                            onChange={setFontScale}
                        />
                    </section>

                    <hr className="border-t-2 border-line" />

                    {/* ── Voz ── */}
                    <section aria-labelledby="a11y-voice-heading">
                        <SectionHeading id="a11y-voice-heading" icon={<Volume2 className="h-4 w-4" aria-hidden="true" />}>Lector de pantalla</SectionHeading>
                        <div className="space-y-4">
                            <ToggleRow
                                id="toggle-voice"
                                label="Voz de Braulio"
                                description="Lee los pasos y los avisos en voz alta"
                                checked={!isMuted}
                                onChange={(on) => { if (on === isMuted) toggleMute(); }}
                            />
                            <OptionRow
                                label="Velocidad de la voz"
                                options={rateOptions}
                                value={speechRate}
                                onChange={setSpeechRate}
                            />

                            {spanishVoices.length > 0 && (
                                <div>
                                    <label htmlFor="voice-select" className="mb-2 block text-sm font-bold text-ink-soft">
                                        Voz en español
                                    </label>
                                    <select
                                        id="voice-select"
                                        value={selectedVoiceURI}
                                        onChange={(e) => setSelectedVoiceURI(e.target.value)}
                                        className="input"
                                    >
                                        <option value="">Voz automática (recomendada)</option>
                                        {spanishVoices.map(v => (
                                            <option key={v.voiceURI} value={v.voiceURI}>
                                                {v.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </section>

                    <hr className="border-t-2 border-line" />

                    {/* ── Visual ── */}
                    <section aria-labelledby="a11y-visual-heading">
                        <SectionHeading id="a11y-visual-heading" icon={<Eye className="h-4 w-4" aria-hidden="true" />}>Visual</SectionHeading>
                        <div className="space-y-4">
                            <ToggleRow
                                id="toggle-contrast"
                                label="Alto contraste"
                                description="Fondo negro con texto amarillo"
                                checked={highContrast}
                                onChange={setHighContrast}
                            />
                            <ToggleRow
                                id="toggle-motion"
                                label="Reducir animaciones"
                                description="Elimina efectos de desvanecimiento"
                                checked={reduceMotion}
                                onChange={setReduceMotion}
                            />
                        </div>
                    </section>

                    <hr className="border-t-2 border-line" />

                    {/* ── Ayuda ── */}
                    <section aria-labelledby="a11y-help-heading">
                        <SectionHeading id="a11y-help-heading" icon={<LifeBuoy className="h-4 w-4" aria-hidden="true" />}>Ayuda</SectionHeading>
                        <p className="mb-3 text-sm leading-snug text-ink-soft">
                            <strong className="font-bold text-ink">Hablar con Braulio:</strong> mantén presionada la
                            tecla <span className="kbd">Ctrl</span> izquierda (la esquina inferior izquierda del
                            teclado), habla y suéltala. También puedes decir “Braulio”, o tocar su carita.
                        </p>
                        <button
                            onClick={() => { resetOnboarding(); onClose(); }}
                            className="btn btn-secondary btn-sm btn-block"
                        >
                            <CirclePlay className="h-5 w-5 shrink-0" aria-hidden="true" />
                            Ver el recorrido guiado de nuevo
                        </button>
                    </section>
                </div>

                {/* Pie: botón de reset */}
                <div className="border-t-2 border-line px-5 py-4">
                    <button
                        onClick={resetAll}
                        className="btn btn-secondary btn-block"
                    >
                        <RotateCcw className="h-5 w-5 shrink-0" aria-hidden="true" />
                        Restablecer valores por defecto
                    </button>
                </div>
            </div>
        </>
    );
};

export default AccessibilityPanel;
