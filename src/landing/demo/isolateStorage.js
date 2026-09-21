// La vista previa NO debe leer ni escribir el progreso, las preferencias o el
// usuario reales de la plataforma (viven en el mismo origen). Este módulo se
// importa primero y reemplaza localStorage por una copia en memoria: la vista
// previa siempre arranca "limpia" y todo lo que haga se pierde al recargar.
const store = new Map();

// Solo es seguro escribir datos de ejemplo si el reemplazo funcionó.
let isolated = false;
export const isStorageIsolated = () => isolated;

const memoryStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => void store.set(String(key), String(value)),
    removeItem: (key) => void store.delete(key),
    clear: () => store.clear(),
    key: (index) => [...store.keys()][index] ?? null,
    get length() {
        return store.size;
    },
};

try {
    Object.defineProperty(window, 'localStorage', { value: memoryStorage, configurable: true });
    isolated = true;
} catch {
    // Si el navegador no permite reemplazarlo, la vista previa sigue funcionando
    // con el almacenamiento real (solo lectura efectiva: no hay controles que escriban).
}
