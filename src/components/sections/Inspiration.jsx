import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';

const InspirationSection = () => {
  const ref = useRef(null);
  const isVisible = useIsVisible(ref);

  return (
    <section ref={ref} className="full-page-section container mx-auto px-6">
      <div className="max-w-xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Nuestra Inspiración: Un Desafío Urgente</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">La alfabetización es autonomía. Pero el acceso a ella enfrenta una crisis que genera exclusión.</p>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-20 text-center">
        <div className={`flex flex-col items-center ${isVisible ? 'chart-10 visible' : ''}`} role="img" aria-label="Gráfica de dona mostrando 10% de alfabetización Braille.">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100" aria-hidden="true"><circle className="donut-chart-bg" strokeWidth="10" fill="transparent" r="45" cx="50" cy="50"/><circle className="donut-chart-fg text-red-600" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"/></svg>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-extrabold text-red-600">10%</span>
          </div>
          <p className="text-xl text-gray-700 font-medium mt-4 max-w-xs">de alfabetización Braille</p>
        </div>
        <div className={`flex flex-col items-center ${isVisible ? 'chart-70 visible' : ''}`} role="img" aria-label="Gráfica de dona mostrando más de 70% de desempleo en la comunidad.">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100" aria-hidden="true"><circle className="donut-chart-bg" strokeWidth="10" fill="transparent" r="45" cx="50" cy="50"/><circle className="donut-chart-fg text-red-600" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"/></svg>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-extrabold text-red-600">&gt;70%</span>
          </div>
          <p className="text-xl text-gray-700 font-medium mt-4 max-w-xs">de desempleo en la comunidad</p>
        </div>
      </div>
    </section>
  );
};
export default InspirationSection;