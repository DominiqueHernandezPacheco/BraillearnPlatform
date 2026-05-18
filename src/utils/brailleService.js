const API_BASE_URL = 'https://api.braillearn.app';

export const brailleService = {
  sendText: async (text) => {
    try {
      // ACTUALIZADO: Cambiamos a la ruta correcta que viste en /docs
      const response = await fetch(`${API_BASE_URL}/traducir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text }) 
      });
      
      if (!response.ok) throw new Error('Error en la comunicación con la API');
      return await response.json();
    } catch (error) {
      console.error('Error enviando texto al display:', error);
    }
  }
};