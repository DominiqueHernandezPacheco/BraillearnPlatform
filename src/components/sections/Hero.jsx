import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';
import { braillePatterns } from '../../constants/braillePatterns';
import BrailleCell from '../common/BrailleCell';

// 1. Importa tu imagen (Asegúrate de que el nombre coincida con tu archivo)
import heroImage from '../../assets/images/HomeIlustration.png'; 

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
            ¡Hola! Te damos la bienvenida a tu punto de partida en el mundo Braille. Aquí encontrarás los primeros pasos esenciales: aprende el alfabeto, ponlo en práctica con ejercicios divertidos y explora sin necesidad de experiencia previa. ¡Solo ganas de descubrir!
          </p>
          <a href="#cursos" className="px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Empieza a aprender
          </a>
        </div>
        
        {/* 2. IMAGEN PLANA (SIN RECUADRO NI SOMBRA) */}
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <div className="relative w-full max-w-lg mx-auto mt-8 md:mt-0">
             {/* Eliminadas las clases 'shadow-xl' y 'rounded-xl' para quitar el efecto de caja */}
             <img 
               src={heroImage} 
               alt="Ilustración de bienvenida aprendiendo Braille" 
               className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500"
             />
          </div>
        </div>

      </div>
    </section>
  );
};
export default Hero;