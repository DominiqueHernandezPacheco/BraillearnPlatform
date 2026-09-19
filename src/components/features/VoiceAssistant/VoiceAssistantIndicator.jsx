import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

// Indicador flotante del asistente de voz "Braulio". Recibe todo por props
// -App.jsx es quien llama a useVoiceAssistant()- porque solo puede haber
// UNA sola suscripción a los eventos del proceso principal de Electron;
// si este componente también llamara al hook, cada evento se procesaría
// dos veces.
//
// Para usuarios con discapacidad visual la activación es 100% por voz —
// este componente es sobre todo para verificar en desarrollo que el
// pipeline funciona, más una región aria-live para que un lector de
// pantalla también confirme el estado.
const VoiceAssistantIndicator = ({ status, lastCommand, mode, triggerManually }) => {
    const isUnavailable = mode === 'unavailable';
    const isLoading = mode === 'electron-loading';

    const statusLabel = isLoading
        ? 'Cargando el asistente de voz…'
        : {
            idle: mode === 'electron' ? 'Di "Braulio" para activarme' : 'Escuchando en modo respaldo (navegador)',
            listening: 'Te escucho…',
            processing: 'Procesando…',
        }[status];

    return (
        <>
            {/* Anuncio para lectores de pantalla, invisible visualmente */}
            <div className="sr-only" role="status" aria-live="polite">
                {status === 'listening' && 'Braulio te está escuchando'}
                {status === 'processing' && lastCommand && `Comando recibido: ${lastCommand}`}
            </div>

            <div
                className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full
                    bg-white shadow-lg border border-gray-200 pl-3 pr-4 py-2 text-sm text-gray-700"
                title={mode === 'web-fallback' ? 'Modo respaldo del navegador: solo funciona en Chrome/Edge, no en Electron' : undefined}
            >
                <button
                    onClick={triggerManually}
                    disabled={isUnavailable || isLoading}
                    aria-label="Activar a Braulio manualmente"
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                        ${status === 'listening' ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'}
                        disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                    {isUnavailable ? <MicOff className="w-4 h-4" /> :
                        isLoading || status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                            <Mic className="w-4 h-4" />}
                </button>
                <span className="font-medium">{isUnavailable ? 'Reconocimiento de voz no disponible' : statusLabel}</span>
            </div>
        </>
    );
};

export default VoiceAssistantIndicator;
