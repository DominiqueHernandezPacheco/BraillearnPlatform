import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';
import { TargetIcon, UsersIcon, GlobeIcon } from '../common/Icons';

const VisionSection = () => {
  const ref = useRef(null);
  useIsVisible(ref);

  return (
    <section ref={ref} className="full-page-section container mx-auto px-6">
      <div className="max-w-xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Nuestra Visión</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">No nos detenemos en el prototipo. Nuestra visión es crear un ecosistema de alfabetización abierto.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5"><div className="bg-green-100 text-green-600 w-14 h-14 rounded-full flex items-center justify-center mb-5" aria-hidden="true"><TargetIcon className="w-7 h-7" /></div><h3 className="text-xl font-bold mb-3">Accesibilidad Real</h3><p className="text-gray-600">Hardware a costo accesible.</p></div>
        <div className="bg-white p-8 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5"><div className="bg-green-100 text-green-600 w-14 h-14 rounded-full flex items-center justify-center mb-5" aria-hidden="true"><UsersIcon className="w-7 h-7" /></div><h3 className="text-xl font-bold mb-3">Comunidad Sostenible</h3><p className="text-gray-600">Plataforma abierta para compartir.</p></div>
        <div className="bg-white p-8 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5"><div className="bg-green-100 text-green-600 w-14 h-14 rounded-full flex items-center justify-center mb-5" aria-hidden="true"><GlobeIcon className="w-7 h-7" /></div><h3 className="text-xl font-bold mb-3">Expansión Lingüística</h3><p className="text-gray-600">Soporte a lenguas indígenas.</p></div>
      </div>
    </section>
  );
};
export default VisionSection;