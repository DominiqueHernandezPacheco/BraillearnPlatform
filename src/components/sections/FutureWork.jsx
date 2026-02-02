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
          <p className="text-lg text-gray-600">
            Nuestro compromiso con la mejora continua y la validación real.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Currículo */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1">
            <h4 className="font-bold text-xl text-blue-600 mb-3">Currículo Estructurado</h4>
            <p className="text-gray-700 leading-relaxed">
              Implementación de un plan de estudios formal con el apoyo de <strong>educadores profesionales</strong> en Braille para garantizar una pedagogía efectiva.
            </p>
          </div>

          {/* Optimización Hardware */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1">
            <h4 className="font-bold text-xl text-blue-600 mb-3">Optimización del Hardware</h4>
            <p className="text-gray-700 leading-relaxed">
              Reducción de costos de manufactura y mejora de la calidad táctil del dispositivo, integrando soporte para <strong>distintos formatos de texto</strong>.
            </p>
          </div>

          {/* Soporte Lingüístico */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1">
            <h4 className="font-bold text-xl text-blue-600 mb-3">Soporte Lingüístico y Pruebas</h4>
            <p className="text-gray-700 leading-relaxed">
              Inclusión activa de <strong>lenguas indígenas</strong> y conducción de pruebas extensivas con usuarios finales para identificar errores y adaptar la plataforma a necesidades reales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default FutureWorkSection;