import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import Braulio from '../../common/Braulio';
import { useAudio } from '../../../context/AudioContext';

// Braulio flotante: es el botón del asistente de voz. Recibe todo por props
// -App.jsx es quien llama a useVoiceAssistant()- porque solo puede haber
// UNA sola suscripción a los eventos del proceso principal de Electron;
// si este componente también llamara al hook, cada evento se procesaría
// dos veces.
//
// Para usuarios con discapacidad visual la activación es 100% por voz —
// este componente es sobre todo la cara amable del asistente para quien ve,
// más una región aria-live para que un lector de pantalla también confirme
// el estado.
//
// Si el reconocimiento de voz no está disponible, Braulio NO desaparece: se
// queda a la vista con un letrero y, al tocarlo, explica qué hacer. Que un
// asistente se esfume sin decir nada parece que "dejó de funcionar".
const UNAVAILABLE_HELP = window.electronAPI
    ? 'No pude iniciar el reconocimiento de voz. Revisa que el micrófono esté conectado y reinicia la app.'
    : 'Necesito permiso para usar el micrófono. Actívalo en el candado de la barra de direcciones y recarga la página.';

const VoiceAssistantIndicator = ({ status, lastCommand, mode, triggerManually }) => {
    const { isSpeaking } = useAudio() ?? {};
    const [showHelp, setShowHelp] = useState(false);
    const isUnavailable = mode === 'unavailable';
    const isLoading = mode === 'electron-loading';

    // En reposo solo se ve a Braulio; el texto aparece únicamente mientras
    // escucha o procesa, o cuando no puede escuchar.
    const busyLabel = isUnavailable
        ? 'Sin micrófono'
        : isLoading
            ? 'Cargando…'
            : { listening: 'Te escucho…', processing: 'Un momento…' }[status];

    const mood = isUnavailable
        ? 'oops'
        : status === 'listening'
            ? 'listening'
            : status === 'processing' || isLoading
                ? 'thinking'
                : isSpeaking
                    ? 'talking'
                    : 'idle';

    const onClick = () => {
        if (isUnavailable) setShowHelp((v) => !v);
        else triggerManually();
    };

    return (
        <>
            {/* Anuncio para lectores de pantalla, invisible visualmente */}
            <div className="sr-only" role="status" aria-live="polite">
                {status === 'listening' && 'Braulio te está escuchando'}
                {status === 'processing' && lastCommand && `Comando recibido: ${lastCommand}`}
                {isUnavailable && showHelp && UNAVAILABLE_HELP}
            </div>

            <div
                data-voice-pill
                className="fixed right-4 bottom-24 md:bottom-6 z-40 flex flex-col items-end gap-3"
                title={mode === 'web-fallback' ? 'Modo respaldo del navegador: solo funciona en Chrome/Edge, no en Electron' : undefined}
            >
                {isUnavailable && showHelp && (
                    <p className="max-w-[18rem] rounded-3xl rounded-br-lg border border-line bg-surface px-4 py-3 text-base leading-snug text-ink shadow-lg">
                        {UNAVAILABLE_HELP}
                    </p>
                )}

                <div className="flex items-center gap-3">
                    {busyLabel && (
                        <span
                            className={`rounded-full border bg-surface px-4 py-2 font-display text-base font-extrabold shadow-lg ${
                                isUnavailable ? 'border-line-strong text-ink-soft' : 'border-line text-brand-strong'
                            }`}
                        >
                            {busyLabel}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onClick}
                        disabled={isLoading}
                        aria-expanded={isUnavailable ? showHelp : undefined}
                        aria-label={
                            isUnavailable
                                ? 'Braulio no puede escucharte ahora. Pulsa para saber por qué.'
                                : 'Hablar con Braulio. También puedes mantener presionada la tecla Control izquierda, o decir Braulio.'
                        }
                        title={isUnavailable ? 'Braulio no puede escucharte ahora' : 'Habla con Braulio: mantén Ctrl izquierdo, o di "Braulio"'}
                        className={`relative flex h-16 w-16 shrink-0 items-end justify-center overflow-hidden rounded-full border-2 shadow-lg transition-transform hover:scale-105 active:scale-95
                            ${status === 'listening' ? 'ring-pulse border-sun bg-sun-soft' : 'border-line-strong bg-brand-soft'}
                            disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        <Braulio variant="face" mood={mood} size={56} />
                        <span
                            aria-hidden="true"
                            className={`absolute bottom-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                                isUnavailable ? 'bg-oops text-surface' : 'bg-sun text-on-sun'
                            }`}
                        >
                            {isUnavailable ? <MicOff className="h-3 w-3" strokeWidth={3} /> : <Mic className="h-3 w-3" strokeWidth={3} />}
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default VoiceAssistantIndicator;
