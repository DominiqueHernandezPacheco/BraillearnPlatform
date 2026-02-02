import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';
import { DollarSign, BookIcon, GlobeIcon } from '../common/Icons';

const ChallengeSection = () => {
  const ref = useRef(null);
  useIsVisible(ref);

  return (
    <section ref={ref} className="full-page-section bg-white container mx-auto px-6">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">El Desafío Sistémico</h2>
        <p className="text-lg text-gray-600 mx-auto">
          Identificamos tres barreras críticas que perpetúan la dependencia y la exclusión digital:
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Barrera Económica */}
        <div className="bg-gray-50 p-8 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
          <div className="bg-red-100 text-red-600 w-14 h-14 rounded-full flex items-center justify-center mb-5">
            <DollarSign className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3">1. Barrera Económica</h3>
          <p className="text-gray-600">
            Las pantallas braille actuales superan los <strong>$2,000 USD</strong>. Este costo prohibitivo hace que la tecnología sea inaccesible para la mayoría de las familias mexicanas.
          </p>
        </div>

        {/* Brecha Pedagógica */}
        <div className="bg-gray-50 p-8 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
          <div className="bg-blue-100 text-blue-600 w-14 h-14 rounded-full flex items-center justify-center mb-5">
            <BookIcon className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3">2. Brecha Pedagógica</h3>
          <p className="text-gray-600">
            La escasez de <strong>Maestros de Estudiantes con Impedimentos Visuales (TVI)</strong> limita la práctica constante y supervisada que el aprendizaje del Braille requiere.
          </p>
        </div>

        {/* Barrera Cultural */}
        <div className="bg-gray-50 p-8 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
          <div className="bg-yellow-100 text-yellow-600 w-14 h-14 rounded-full flex items-center justify-center mb-5">
            <GlobeIcon className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3">3. Barrera Cultural</h3>
          <p className="text-gray-600">
            Los dispositivos existentes están diseñados para el inglés, ignorando las particularidades del español y excluyendo por completo a nuestras <strong>expresiones comunes regionalmente</strong>.
          </p>
        </div>
      </div>
    </section>
  );
};
export default ChallengeSection;