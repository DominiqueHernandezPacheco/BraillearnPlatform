import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';
import { braillePatterns } from '../../constants/braillePatterns';
import BrailleCell from '../common/BrailleCell';

// Importa las fotos de los integrantes (Asegúrate de tenerlas en la carpeta assets)
import christianImg from '../../assets/images/Dominique.jpg';
import valeriaImg from '../../assets/images/Valeria.jpg';
import mariaImg from '../../assets/images/Mafer.jpg';
import joelImg from '../../assets/images/Joel.jpg';

const TeamSection = () => {
  const ref = useRef(null);
  useIsVisible(ref);

  return (
    <section id="acerca" ref={ref} className="full-page-section bg-white px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-16">
        
        {/* Columna Izquierda: Texto enriquecido con info del PDF */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold text-blue-600 mb-6">Hola, somos Braillearn.</h1>
          
          <div className="flex justify-center md:justify-start space-x-2 mb-6" aria-label="Braillearn en Braille">
            {['b','r','a','i','l','l','e','a','r','n'].map((char, i) => (
                <BrailleCell key={i} dots={braillePatterns[char]} char={char} isInteractive={false} className="text-gray-800 p-1 w-10 h-14" />
            ))}
          </div>

          {/* AQUÍ ESTÁ EL CAMBIO DE TEXTO */}
          <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
            <p>
              Somos un equipo multidisciplinario de la <strong>Universidad Autónoma de Campeche</strong>, unidos por una misión: combatir la crisis de alfabetización que excluye al 90% de las personas con discapacidad visual.
            </p>
            <p>
              <strong>Braillearn</strong> no es solo software; es un <strong>sistema integral multicanal</strong> diseñado para la autonomía digital. Combinamos una plataforma de aprendizaje accesible con hardware de bajo costo para romper las barreras económicas y pedagógicas que limitan la educación inclusiva en México.
            </p>
            <p className="text-sm text-gray-500 italic mt-4">
              Proyecto ID: 35548 - Categoría: Desarrollo de Software - Infomatrix 2025.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Grid de Tarjetas con Fotos (Sin cambios) */}
        <div className="grid grid-cols-2 gap-4" role="list" aria-label="Miembros del equipo">
           
           {/* Christian */}
           <div role="listitem" className="bg-white text-center p-4 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
            <div className="w-full h-32 rounded-lg overflow-hidden mb-4 border border-gray-200">
                <img src={christianImg} alt="Foto de Christian D. Hernandez" className="w-full h-full object-cover" />
            </div>
            <h4 className="text-base font-bold text-gray-900">Christian D. Hernandez</h4>
            <p className="text-sm text-blue-600 font-medium">Ing. en Sistemas</p>
          </div>

           {/* Valeria */}
           <div role="listitem" className="bg-white text-center p-4 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
            <div className="w-full h-32 rounded-lg overflow-hidden mb-4 border border-gray-200">
                <img src={valeriaImg} alt="Foto de Valeria A. Lee Almeyda" className="w-full h-full object-cover" />
            </div>
            <h4 className="text-base font-bold text-gray-900">Valeria A. Lee Almeyda</h4>
            <p className="text-sm text-blue-600 font-medium">Ing. en Software</p>
          </div>

           {/* Maria */}
           <div role="listitem" className="bg-white text-center p-4 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
            <div className="w-full h-32 rounded-lg overflow-hidden mb-4 border border-gray-200">
                <img src={mariaImg} alt="Foto de Maria F. Rincon Chan" className="w-full h-full object-cover" />
            </div>
            <h4 className="text-base font-bold text-gray-900">Maria F. Rincon Chan</h4>
            <p className="text-sm text-blue-600 font-medium">Ing. en Mecatrónica</p>
          </div>

           {/* Dr. Joel */}
           <div role="listitem" className="bg-white text-center p-4 rounded-2xl shadow-xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-1.5">
            <div className="w-full h-32 rounded-lg overflow-hidden mb-4 border border-gray-200">
                <img src={joelImg} alt="Foto del Dr. Joel C. Flores E." className="w-full h-full object-cover" />
            </div>
            <h4 className="text-base font-bold text-gray-900">Dr. Joel C. Flores E.</h4>
            <p className="text-sm text-blue-600 font-medium">Asesor del Proyecto</p>
          </div>

        </div>
      </div>
    </section>
  );
};
export default TeamSection;