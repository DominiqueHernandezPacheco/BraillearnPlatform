// Módulo háptico (motor de vibración + driver DRV2605L), listo para conectar.
//
// La plataforma solo pide efectos por NOMBRE ("toctoc", "soplo"…); aquí vive
// la traducción a lo que entienda cada destino. Hoy el display todavía no
// expone su API háptica, así que:
//   · si HAPTICS_ENDPOINT es null (ahora) no se manda nada al hardware;
//   · en celulares con vibración (Android/Chrome) se usa navigator.vibrate para
//     poder probar los efectos de los cuentos sin el módulo.
//
// Para integrar el hardware: poner la URL en HAPTICS_ENDPOINT y revisar el
// formato del cuerpo en `sendToHardware`. `waveforms` son IDs de la librería
// de efectos del DRV2605L (hoja de datos, "Waveform Library Effects List").
// El actuador es LRA: el chip se configura en modo LRA (bit N_ERM_LRA del
// registro de control de realimentación), con la librería 6 (las 1 a 5 son para
// motores ERM) y se corre su auto-calibración. Los IDs de efecto son los mismos
// de la lista; confirmar cada uno al integrar. Un efecto puede encadenar varios.

const HAPTICS_ENDPOINT = null;

export const HAPTIC_EFFECTS = {
    toctoc: { label: 'Toc, toc (golpes en la puerta)', waveforms: [10, 10], phone: [90, 110, 90, 110, 90] },
    soplo: { label: 'Soplido del viento', waveforms: [47], phone: [40, 30, 60, 30, 90, 30, 60] },
    lluvia: { label: 'Gotas de lluvia', waveforms: [52], phone: [15, 60, 15, 90, 15, 50, 15, 110, 15] },
    pasos: { label: 'Pasos', waveforms: [7, 7, 7], phone: [70, 220, 70, 220, 70, 220, 70] },
    magia: { label: 'Destello mágico', waveforms: [12], phone: [20, 40, 20, 40, 60] },
    campana: { label: 'Campana', waveforms: [1], phone: [120, 60, 60] },
};

export const hapticsService = {
    // ¿Hay algo que pueda vibrar de verdad (módulo conectado o celular)?
    isAvailable: () => !!HAPTICS_ENDPOINT || (typeof navigator !== 'undefined' && 'vibrate' in navigator),

    // true cuando el efecto salió por el módulo del display (no por el celular).
    isHardwareConnected: () => !!HAPTICS_ENDPOINT,

    play: async (name) => {
        const effect = HAPTIC_EFFECTS[name];
        if (!effect) return;
        if (HAPTICS_ENDPOINT) {
            await sendToHardware(name, effect);
            return;
        }
        try {
            navigator.vibrate?.(effect.phone);
        } catch { /* sin vibración: no pasa nada */ }
    },
};

async function sendToHardware(name, effect) {
    try {
        await fetch(HAPTICS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ effect: name, waveforms: effect.waveforms }),
        });
    } catch (error) {
        console.error('Error enviando el efecto háptico al display:', error);
    }
}
