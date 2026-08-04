import React, { useEffect, useRef } from 'react';
import { useAccessibility } from '../../../context/AccessibilityContext';
import { useAudio } from '../../../context/AudioContext';
import { useUser } from '../../../context/UserContext';

// ── Iconos internos ───────────────────────────────────────────────────────────
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

// ── Subcomponente: fila de botones de opción ──────────────────────────────────
const OptionRow = ({ label, options, value, onChange }) => (
    <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
        <div className="flex gap-2 flex-wrap" role="group" aria-label={label}>
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    aria-pressed={value === opt.value}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all duration-150
                        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
                        ${value === opt.value
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

// ── Subcomponente: toggle switch ──────────────────────────────────────────────
const ToggleRow = ({ label, description, checked, onChange, id }) => (
    <div className="flex items-start justify-between gap-3">
        <div>
            <label htmlFor={id} className="text-sm font-semibold text-gray-700 cursor-pointer">{label}</label>
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative shrink-0 inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
                ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
            <span className="sr-only">{checked ? 'Activado' : 'Desactivado'}</span>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
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
                className={`fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm transition-opacity duration-300
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
                className={`fixed top-0 right-0 h-full w-80 max-w-full z-[60] bg-white shadow-2xl
                    flex flex-col transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Cabecera del panel */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-blue-600 text-white">
                    <h2 id="a11y-panel-title" className="text-lg font-bold">
                        Accesibilidad
                    </h2>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        aria-label="Cerrar panel de accesibilidad"
                        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    >
                        <XIcon />
                    </button>
                </div>

                {/* Contenido desplazable */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

                    {/* ── Texto ── */}
                    <section aria-labelledby="a11y-text-heading">
                        <h3 id="a11y-text-heading" className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Texto
                        </h3>
                        <OptionRow
                            label="Tamaño de letra"
                            options={fontOptions}
                            value={fontScale}
                            onChange={setFontScale}
                        />
                    </section>

                    <hr className="border-gray-100" />

                    {/* ── Voz ── */}
                    <section aria-labelledby="a11y-voice-heading">
                        <h3 id="a11y-voice-heading" className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Lector de pantalla
                        </h3>
                        <div className="space-y-4">
                            <OptionRow
                                label="Velocidad de la voz"
                                options={rateOptions}
                                value={speechRate}
                                onChange={setSpeechRate}
                            />

                            {spanishVoices.length > 0 && (
                                <div>
                                    <label htmlFor="voice-select" className="text-sm font-semibold text-gray-700 block mb-2">
                                        Voz en español
                                    </label>
                                    <select
                                        id="voice-select"
                                        value={selectedVoiceURI}
                                        onChange={(e) => setSelectedVoiceURI(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                                            focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
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

                    <hr className="border-gray-100" />

                    {/* ── Visual ── */}
                    <section aria-labelledby="a11y-visual-heading">
                        <h3 id="a11y-visual-heading" className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Visual
                        </h3>
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

                    <hr className="border-gray-100" />

                    {/* ── Ayuda ── */}
                    <section aria-labelledby="a11y-help-heading">
                        <h3 id="a11y-help-heading" className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            Ayuda
                        </h3>
                        <button
                            onClick={() => { resetOnboarding(); onClose(); }}
                            className="w-full px-4 py-2 rounded-lg text-sm font-medium text-blue-600 border border-blue-200
                                hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            Ver el recorrido guiado de nuevo
                        </button>
                    </section>
                </div>

                {/* Pie: botón de reset */}
                <div className="px-5 py-4 border-t border-gray-100">
                    <button
                        onClick={resetAll}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                            text-sm font-medium text-gray-500 border border-gray-200
                            hover:border-red-300 hover:text-red-500 hover:bg-red-50
                            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                        <ResetIcon />
                        Restablecer valores por defecto
                    </button>
                </div>
            </div>
        </>
    );
};

export default AccessibilityPanel;
