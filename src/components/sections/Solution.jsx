import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';

const SolutionSection = () => {
  const ref = useRef(null);
  useIsVisible(ref);

  return (
    <section ref={ref} className="full-page-section bg-blue-600 text-white px-6">
      <div className="container mx-auto">
        <div className="max-w-xl text-center mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Nuestra Solución Integral</h2>
          <p className="text-lg text-blue-100">Un sistema diseñado para romper estas tres barreras simultáneamente.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="bg-white/10 p-8 rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5"><h3 className="text-2xl font-bold mb-3 text-yellow-400">Software: La Plataforma</h3><p className="text-blue-50">Una plataforma de aprendizaje multimodal y un simulador web gratuito.</p></div>
          <div className="bg-white/10 p-8 rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5"><h3 className="text-2xl font-bold mb-3 text-yellow-400">Hardware: El Dispositivo</h3><p className="text-blue-50">Un dispositivo de lectura Braille de bajo costo, modular y reparable.</p></div>
        </div>
      </div>
    </section>
  );
};
export default SolutionSection;