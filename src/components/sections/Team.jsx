import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';
import { braillePatterns } from '../../constants/braillePatterns';
import BrailleCell from '../common/BrailleCell';
import { UserIcon } from '../common/Icons';

const TeamSection = () => {
  const ref = useRef(null);
  useIsVisible(ref);

  return (
    <section id="acerca" ref={ref} className="full-page-section bg-white px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-16">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold text-blue-600 mb-6">Hola, somos Braillearn.</h1>
          <div className="flex justify-center md:justify-start space-x-2 mb-6" aria-label="Braillearn en Braille">
            {['b','r','a','i','l','l','e','a','r','n'].map((char, i) => (
                <BrailleCell key={i} dots={braillePatterns[char]} char={char} isInteractive={false} className="text-gray-800 p-1 w-10 h-14" />
            ))}
          </div>
          <p className="text-xl md:text-2xl font-medium text-gray-700 leading-relaxed">Un equipo multidisciplinario de la Facultad de Ingeniería en la Universidad Autónoma de Campeche.</p>
        </div>
        <div className="grid grid-cols-2 gap-4" role="list" aria-label="Miembros del equipo">
           <div role="listitem" className="bg-white text-center p-4 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
            <div className="w-full h-32 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center mb-4" aria-hidden="true"><UserIcon className="w-12 h-12 text-gray-400" /></div>
            <h4 className="text-base font-bold text-gray-900">Christian D. Hernandez</h4>
            <p className="text-sm text-blue-600 font-medium">Ing. en Sistemas</p>
          </div>
           <div role="listitem" className="bg-white text-center p-4 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
            <div className="w-full h-32 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center mb-4" aria-hidden="true"><UserIcon className="w-12 h-12 text-gray-400" /></div>
            <h4 className="text-base font-bold text-gray-900">Valeria A. Lee Almeyda</h4>
            <p className="text-sm text-blue-600 font-medium">Ing. en Software</p>
          </div>
           <div role="listitem" className="bg-white text-center p-4 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
            <div className="w-full h-32 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center mb-4" aria-hidden="true"><UserIcon className="w-12 h-12 text-gray-400" /></div>
            <h4 className="text-base font-bold text-gray-900">Maria F. Rincon Chan</h4>
            <p className="text-sm text-blue-600 font-medium">Ing. en Mecatrónica</p>
          </div>
           <div role="listitem" className="bg-white text-center p-4 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
            <div className="w-full h-32 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center mb-4" aria-hidden="true"><UserIcon className="w-12 h-12 text-gray-400" /></div>
            <h4 className="text-base font-bold text-gray-900">Dr. Joel C. Flores E.</h4>
            <p className="text-sm text-blue-600 font-medium">Asesor del Proyecto</p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default TeamSection;