import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';
import { CheckCircle, BookOpen, Monitor, Settings } from '../common/Icons';

const LearningHub = () => {
  const ref = useRef(null);
  useIsVisible(ref);
  const progress = 20;

  return (
    <section ref={ref} className="full-page-section bg-white px-6" id="cursos">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¡BIENVENIDO a tu centro de Aprendizaje!</h2>
        <div className="max-w-md mx-auto bg-blue-600 text-white p-6 rounded-2xl shadow-2xl mb-6">
          <h3 className="text-xl font-semibold mb-3">Tu progreso General</h3>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-6 mb-5">
            <div className="relative w-28 h-28" role="img" aria-label={`Progreso del módulo: ${progress}% completado.`}>
              <svg className="w-full h-full" viewBox="0 0 100 100" aria-hidden="true">
                <circle className="text-blue-300" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle className="text-white" strokeWidth="10" strokeDasharray={`${2 * Math.PI * 45 * (progress / 100)}, ${2 * Math.PI * 45 * (1 - (progress / 100))}`} strokeDashoffset={2 * Math.PI * 45 * 0.25} stroke="currentColor" strokeLinecap="round" fill="transparent" r="45" cx="50" cy="50" />
              </svg>
              {progress > 0 && <div className="absolute inset-0 flex items-center justify-center"><CheckCircle className="w-12 h-12 text-yellow-400" /></div>}
            </div>
            <div className="text-left">
              <span className="text-4xl font-bold">{progress}%</span>
              <p className="text-base text-blue-100">del módulo completado</p>
            </div>
          </div>
          <button className="w-full px-6 py-2.5 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Continuar Módulo</button>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 text-left">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Continua Tu Camino</h3>
            <div className="space-y-3 flex flex-col grow">
              <a href="#" className="flex items-center bg-gray-50 p-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 grow"><BookOpen className="w-7 h-7 text-blue-500 mr-3" /><div><h4 className="font-semibold text-base text-gray-800">Módulo 1: Alfabeto Braille</h4><p className="text-xs text-blue-600 font-medium">¡Empieza aquí!</p></div></a>
              <a href="#" className="flex items-center bg-gray-50 p-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 grow"><CheckCircle className="w-7 h-7 text-blue-500 mr-3" /><div><h4 className="font-semibold text-base text-gray-800">Módulo 2: Ejercicios de Práctica</h4><p className="text-xs text-gray-500">Tu mejor puntaje: 85%</p></div></a>
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Acceso Rápido</h3>
            <div className="space-y-3 flex flex-col grow">
              <a href="#" className="flex items-center bg-gray-50 p-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 grow"><Monitor className="w-7 h-7 text-blue-500 mr-3" /><div><h4 className="font-semibold text-base text-gray-800">Simulador de Texto</h4><p className="text-xs text-blue-600 font-medium">Ir al simulador</p></div></a>
              <a href="#" className="flex items-center bg-gray-50 p-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 grow"><Settings className="w-7 h-7 text-blue-500 mr-3" /><div><h4 className="font-semibold text-base text-gray-800">Ajustes y Configuración</h4><p className="text-xs text-blue-600 font-medium">Ver Opciones</p></div></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default LearningHub;