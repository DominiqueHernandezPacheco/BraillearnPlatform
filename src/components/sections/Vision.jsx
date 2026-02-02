import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';
import { TargetIcon, UsersIcon, GlobeIcon } from '../common/Icons';

const VisionSection = () => {
  const ref = useRef(null);
  useIsVisible(ref);

  return (
    <section ref={ref} className="full-page-section container mx-auto px-6">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Nuestra Visión</h2>
        <p className="text-lg text-gray-600 mx-auto">
          Más allá de la tecnología, buscamos una transformación social. Nuestra meta es reducir los sesgos que limitan la vida diaria de las personas con discapacidad visual.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
          <div className="bg-green-100 text-green-600 w-14 h-14 rounded-full flex items-center justify-center mb-5">
            <TargetIcon className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3">Autonomía Digital</h3>
          <p className="text-gray-600">
            Romper la dependencia de terceros para acceder a la información y la educación.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
          <div className="bg-green-100 text-green-600 w-14 h-14 rounded-full flex items-center justify-center mb-5">
            <UsersIcon className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3">Diseño Centrado en el Humano</h3>
          <p className="text-gray-600">
            Validación continua con usuarios finales para asegurar que la solución sea relevante y digna.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
          <div className="bg-green-100 text-green-600 w-14 h-14 rounded-full flex items-center justify-center mb-5">
            <GlobeIcon className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold mb-3">Inclusión Lingüística</h3>
          <p className="text-gray-600">
            Democratizar el acceso al conocimiento integrando soporte para lenguas indígenas locales.
          </p>
        </div>
      </div>
    </section>
  );
};
export default VisionSection;