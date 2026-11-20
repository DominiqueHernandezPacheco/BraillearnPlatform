import { displayClient } from './displayClient';
import { getDisplaySettings } from './displayStore';

// Envío de un mensaje corto al display (lo usa la sección Mensajes). Devuelve
// undefined si no se pudo enviar. La conexión en sí vive en displayClient.js.
export const brailleService = {
  sendText: async (text) => {
    try {
      return await displayClient.sendText(text, getDisplaySettings().simCells);
    } catch (error) {
      console.error('Error enviando texto al display:', error);
    }
  },
};
