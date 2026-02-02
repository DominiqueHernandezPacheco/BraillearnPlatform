import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';

const InspirationSection = () => {
  const ref = useRef(null);
  const isVisible = useIsVisible(ref);

  return (
    <section ref={ref} className="full-page-section container mx-auto px-6">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Nuestra Inspiración: Una Crisis Silenciosa</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          En México, <strong>2.69 millones de personas</strong> viven con discapacidad visual (INEGI). Sin embargo, se estima que solo el <strong>12%</strong> sabe leer Braille. Esta brecha genera una profunda "desigualdad de información" que limita la autonomía y el empleo.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24 text-center">
        {/* Gráfica 1: Acceso a Tecnología */}
        <div className={`flex flex-col items-center ${isVisible ? 'chart-10 visible' : ''}`} role="img" aria-label="Gráfica de dona: Solo 10% de acceso a tecnología en países de bajos ingresos.">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100" aria-hidden="true">
              <circle className="donut-chart-bg" strokeWidth="10" fill="transparent" r="45" cx="50" cy="50"/>
              <circle className="donut-chart-fg text-red-600" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"/>
            </svg>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-extrabold text-red-600">10%</span>
          </div>
          <p className="text-xl text-gray-700 font-medium mt-4 max-w-xs">
            Acceso a tecnología asistiva en países de bajos ingresos (ATscale, 2024)
          </p>
        </div>

        {/* Gráfica 2: Desempleo */}
        <div className={`flex flex-col items-center ${isVisible ? 'chart-70 visible' : ''}`} role="img" aria-label="Gráfica de dona: Más del 70% de desempleo vinculado a la falta de alfabetización.">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100" aria-hidden="true">
              <circle className="donut-chart-bg" strokeWidth="10" fill="transparent" r="45" cx="50" cy="50"/>
              <circle className="donut-chart-fg text-red-600" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"/>
            </svg>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-extrabold text-red-600">&gt;70%</span>
          </div>
          <p className="text-xl text-gray-700 font-medium mt-4 max-w-xs">
            Tasa de desempleo vinculada a la falta de alfabetización Braille (NFB)
          </p>
        </div>
      </div>
    </section>
  );
};
export default InspirationSection;