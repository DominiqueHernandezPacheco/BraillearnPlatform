import React, { useRef } from 'react';
import useIsVisible from '../../hooks/useIsVisible';
import { CheckCircle, BookOpen, Monitor, Settings } from '../common/Icons';
// NUEVO: Importamos tu hook de progreso y la base de datos de cursos
import { useProgress } from '../../hooks/useProgress';
import { COURSES_DATA } from '../../data/courseData';

const LearningHub = ({ onNavigateToCourses }) => {
  const ref = useRef(null);
  useIsVisible(ref);

  // NUEVO: Calculamos el progreso real dinámicamente
  const { getPercentage } = useProgress();
  // Le pasamos el total de módulos que existen en tu archivo de datos
  const progress = getPercentage(COURSES_DATA.length);

  // Manejador para navegar sin romper estilos
  const handleNavClick = (e) => {
    e.preventDefault();
    if (onNavigateToCourses) onNavigateToCourses();
  };

  // Manejador para el simulador (buscando el link en el DOM o navegando directo)
  const handleSimClick = (e) => {
    e.preventDefault();
    const simLink = document.querySelector('a[href="#simulador"]');
    if (simLink) simLink.click();
  };

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
              {progress > 0 && <div className="absolute inset-0 flex items-center justify-center"><CheckCircle className="w-12 h-12 text-yellow-400" aria-hidden="true" /></div>}
            </div>
            <div className="text-left">
              <span className="text-4xl font-bold">{progress}%</span>
              <p className="text-base text-blue-100">del curso completado</p>
            </div>
          </div>
          <button onClick={handleNavClick} className="w-full px-6 py-2.5 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Continuar Módulo</button>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 text-left">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Continua Tu Camino</h3>
            <div className="space-y-3 flex flex-col grow">
              {/*
                <button> en lugar de <a href="#">: estas tarjetas NO navegan a otra URL,
                ejecutan una acción interna. Un <a> sin href real confunde al SR
                ("enlace" en lugar de "botón"). aria-label describe el destino completo.
              */}
              <button
                onClick={handleNavClick}
                aria-label="Ir al Módulo 1: Alfabeto Braille — ¡Empieza aquí!"
                className="flex items-center bg-gray-50 p-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 grow w-full text-left"
              >
                <BookOpen className="w-7 h-7 text-blue-500 mr-3 shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-base text-gray-800">Módulo 1: Alfabeto Braille</h4>
                  <p className="text-xs text-blue-600 font-medium">¡Empieza aquí!</p>
                </div>
              </button>
              <button
                onClick={handleNavClick}
                aria-label="Ir al Módulo 2: Ejercicios de Práctica"
                className="flex items-center bg-gray-50 p-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 grow w-full text-left"
              >
                <CheckCircle className="w-7 h-7 text-blue-500 mr-3 shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-base text-gray-800">Módulo 2: Ejercicios de Práctica</h4>
                  <p className="text-xs text-gray-500">Tu mejor puntaje: 85%</p>
                </div>
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Acceso Rápido</h3>
            <div className="space-y-3 flex flex-col grow">
              {/*
                El simulador sí navega a una sección real (#simulador), por eso
                se mantiene como <a>. Los demás se convierten en <button>.
              */}
              <a
                href="#simulador"
                onClick={handleSimClick}
                aria-label="Ir al Simulador de Texto Braille"
                className="flex items-center bg-gray-50 p-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 grow"
              >
                <Monitor className="w-7 h-7 text-blue-500 mr-3 shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-base text-gray-800">Simulador de Texto</h4>
                  <p className="text-xs text-blue-600 font-medium">Ir al simulador</p>
                </div>
              </a>
              <button
                aria-label="Ver Ajustes y Configuración"
                className="flex items-center bg-gray-50 p-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 grow w-full text-left"
              >
                <Settings className="w-7 h-7 text-blue-500 mr-3 shrink-0" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-base text-gray-800">Ajustes y Configuración</h4>
                  <p className="text-xs text-blue-600 font-medium">Ver Opciones</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default LearningHub;
