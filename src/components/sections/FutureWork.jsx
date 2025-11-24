import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';

const FutureWorkSection = () => {
  const ref = useRef(null);
  useIsVisible(ref);

  return (
    <section ref={ref} className="full-page-section grid-background px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Trabajo a Futuro</h2>
          <p className="text-lg text-gray-600">Validación con usuarios finales.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1"><h4 className="font-bold text-lg text-blue-600 mb-2">Currículo Estructurado</h4><p className="text-gray-700">Apoyo de educadores profesionales.</p></div>
          <div className="bg-white p-6 rounded-lg shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1"><h4 className="font-bold text-lg text-blue-600 mb-2">Optimización del Hardware</h4><p className="text-gray-700">Reducir costos y mejorar calidad.</p></div>
          <div className="bg-white p-6 rounded-lg shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1"><h4 className="font-bold text-lg text-blue-600 mb-2">Soporte Lingüístico</h4><p className="text-gray-700">Mayor inclusión de lenguas.</p></div>
        </div>
      </div>
    </section>
  );
};
export default FutureWorkSection;