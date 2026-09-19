import { createContext, useContext } from 'react';
import es from './dictionaries/es';

// `t` es el diccionario completo del idioma activo; los componentes leen
// `t.seccion.clave`. Por defecto (fuera del proveedor) se usa español.
export const LanguageContext = createContext({
    lang: 'es',
    locale: 'es-MX',
    setLang: () => {},
    t: es,
});

export const useLanguage = () => useContext(LanguageContext);
export const useCopy = () => useContext(LanguageContext).t;
