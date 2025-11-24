import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';
import { braillePatterns } from '../../constants/braillePatterns';
import BrailleCell from '../common/BrailleCell';

const HeroImagePlaceholder = () => (
  <div className="relative w-full max-w-lg h-72 mx-auto mt-8 md:mt-0">
    <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center" role="img" aria-label="Ilustración de bienvenida">
      <p className="text-gray-500">Aqui va una ilustración, cual? idk</p>
    </div>
  </div>
);

const Hero = () => {
  const ref = useRef(null);
  useIsVisible(ref);

  return (
    <section id="inicio" ref={ref} className="full-page-section bg-white px-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center text-center md:text-left">
        <div className="md:w-1/2 mb-10 md:mb-0 pr-0 md:pr-12 flex flex-col items-center md:items-start">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Empieza tu viaje con el Braille
            <div className="flex justify-center md:justify-start space-x-1 mt-2" aria-label="Palabra 'Empieza' en Braille">
              {['e','m','p','i','e','z','a'].map((char, i) => (
                 <BrailleCell key={i} dots={braillePatterns[char]} char={char} isInteractive={false} className="text-gray-800 p-1 w-10 h-14" />
              ))}
            </div>
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-md">
            ¡Hola! Te damos la bienvenida a tu punto de partida en el mundo Braille.
          </p>
          <a href="#cursos" className="px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Empieza a aprender
          </a>
        </div>
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <HeroImagePlaceholder />
        </div>
      </div>
    </section>
  );
};
export default Hero;