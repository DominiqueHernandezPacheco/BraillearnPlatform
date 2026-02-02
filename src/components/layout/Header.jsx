import React, { useState } from 'react';
import { VolumeUp, VolumeOff } from '../common/Icons'; 
import { useAudio } from '../../context/AudioContext'; // <--- Importamos el contexto

// Iconos simples para el menú (Hamburguesa y X)
const MenuIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// 1. ELIMINAMOS isMuted y setIsMuted de los props aquí abajo vvv
const Header = ({ handleNav, highContrast, setHighContrast }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 2. CONECTAMOS AL CONTEXTO (La "Nube" de Audio)
  const { isMuted, toggleMute } = useAudio();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const onMobileNavClick = (e, page, section) => {
    e.preventDefault();
    handleNav(page, section);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-blue-600 shadow-md w-full z-50 sticky top-0 h-[72px]">
      <nav className="container mx-auto px-6 h-full flex justify-between items-center" aria-label="Menú principal">
        
        {/* LOGO */}
        <div className="text-2xl font-bold text-white flex items-center space-x-2 z-50">
          <span>Braillearn</span>
        </div>

        {/* MENU DE ESCRITORIO */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="#inicio" onClick={(e) => { e.preventDefault(); handleNav('plataforma', 'inicio'); }} className="text-blue-100 hover:text-white font-medium transition-colors">Inicio</a>
          <a href="#cursos" onClick={(e) => { e.preventDefault(); handleNav('cursos', 'cursos-top'); }} className="text-blue-100 hover:text-white font-medium transition-colors">Cursos</a>
          <a href="#acerca" onClick={(e) => { e.preventDefault(); handleNav('proyecto', 'acerca'); }} className="text-blue-100 hover:text-white font-medium transition-colors">Acerca del Proyecto</a>
          <a href="#simulador" onClick={(e) => { e.preventDefault(); handleNav('simulador', 'simulador-top'); }} className="text-blue-100 hover:text-white font-medium transition-colors">Simulador</a>
        </div>

        {/* CONTROLES */}
        <div className="flex items-center gap-4 z-50">
          
          {/* Botón Mute - AHORA USA toggleMute DEL CONTEXTO */}
          <button 
            onClick={toggleMute} 
            className="p-2 text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors" 
            title={isMuted ? "Activar sonido" : "Silenciar sonido"}
            aria-label={isMuted ? "Activar sonido" : "Silenciar sonido"}
          >
             {isMuted ? <VolumeOff className="w-5 h-5" /> : <VolumeUp className="w-5 h-5" />}
          </button>

          {/* Switch de Contraste */}
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline text-sm text-blue-100" id="contrast-label">Alto contraste</span>
            <button 
              role="switch" 
              aria-checked={highContrast} 
              aria-labelledby="contrast-label" 
              title="Alternar modo alto contraste"
              onClick={() => setHighContrast(!highContrast)} 
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${highContrast ? 'bg-blue-800 border-2 border-white' : 'bg-blue-400'}`}
            >
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${highContrast ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* BOTÓN HAMBURGUESA */}
          <button 
            className="md:hidden text-white focus:outline-none p-1 rounded hover:bg-blue-700 transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <XIcon className="w-8 h-8" /> : <MenuIcon className="w-8 h-8" />}
          </button>
        </div>

        {/* MENÚ MÓVIL */}
        <div className={`fixed inset-0 bg-blue-900/95 backdrop-blur-sm z-40 transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-center items-center space-y-8 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <a href="#inicio" onClick={(e) => onMobileNavClick(e, 'plataforma', 'inicio')} className="text-2xl text-white font-bold hover:text-yellow-400 transition-colors">Inicio</a>
          <a href="#cursos" onClick={(e) => onMobileNavClick(e, 'cursos', 'cursos-top')} className="text-2xl text-white font-bold hover:text-yellow-400 transition-colors">Cursos</a>
          <a href="#acerca" onClick={(e) => onMobileNavClick(e, 'proyecto', 'acerca')} className="text-2xl text-white font-bold hover:text-yellow-400 transition-colors">Acerca del Proyecto</a>
          <a href="#simulador" onClick={(e) => onMobileNavClick(e, 'simulador', 'simulador-top')} className="text-2xl text-white font-bold hover:text-yellow-400 transition-colors">Simulador</a>
        </div>

      </nav>
    </header>
  );
};

export default Header;