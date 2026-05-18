import React, { useState } from 'react';
import { VolumeUp, VolumeOff } from '../common/Icons';
import { useAudio } from '../../context/AudioContext';
import { useAccessibility } from '../../context/AccessibilityContext';

// Iconos simples para el menú (Hamburguesa y X)
// aria-hidden="true": el botón padre ya tiene aria-label; el SVG es decorativo.
const MenuIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Icono de accesibilidad (persona con círculo) — decorativo
const A11yIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <circle cx="12" cy="5" r="1.5" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6M12 9v4m-3 4l-1 3M12 13l1.5 3M15 13l1 3" />
  </svg>
);

// Props: handleNav (navegación), onOpenPanel (abre el panel A11y), isPanelOpen (estado del panel)
// highContrast y setHighContrast ya NO son props — se leen del AccessibilityContext
const Header = ({ handleNav, onOpenPanel, isPanelOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { isMuted, toggleMute } = useAudio();
  const { highContrast, setHighContrast } = useAccessibility();

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

        {/* MENÚ DE ESCRITORIO */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="#inicio" onClick={(e) => { e.preventDefault(); handleNav('plataforma', 'inicio'); }} className="text-blue-100 hover:text-white font-medium transition-colors">Inicio</a>
          <a href="#cursos" onClick={(e) => { e.preventDefault(); handleNav('cursos', 'cursos-top'); }} className="text-blue-100 hover:text-white font-medium transition-colors">Cursos</a>
          <a href="#acerca" onClick={(e) => { e.preventDefault(); handleNav('proyecto', 'acerca'); }} className="text-blue-100 hover:text-white font-medium transition-colors">Acerca del Proyecto</a>
          <a href="#simulador" onClick={(e) => { e.preventDefault(); handleNav('simulador', 'simulador-top'); }} className="text-blue-100 hover:text-white font-medium transition-colors">Simulador</a>
        </div>

        {/* CONTROLES */}
        <div className="flex items-center gap-3 z-50">

          {/* Botón Mute */}
          <button
            onClick={toggleMute}
            className="p-2 text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
            aria-label={isMuted ? "Activar sonido" : "Silenciar sonido"}
          >
            {/* aria-hidden: el botón ya tiene aria-label; el icono es decorativo */}
            {isMuted ? <VolumeOff className="w-5 h-5" aria-hidden="true" /> : <VolumeUp className="w-5 h-5" aria-hidden="true" />}
          </button>

          {/* Switch de Alto Contraste (acceso rápido — también disponible en el panel) */}
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline text-sm text-blue-100" id="contrast-label">Alto contraste</span>
            <button
              role="switch"
              aria-checked={highContrast}
              aria-labelledby="contrast-label"
              title="Alternar modo alto contraste"
              onClick={() => setHighContrast(!highContrast)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-white/60
                ${highContrast ? 'bg-blue-800 border-2 border-white' : 'bg-blue-400'}`}
            >
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${highContrast ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Botón de Panel de Accesibilidad */}
          <button
            onClick={onOpenPanel}
            aria-label="Abrir panel de accesibilidad"
            aria-expanded={isPanelOpen}
            aria-controls="a11y-panel"
            className="p-2 text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            <A11yIcon className="w-5 h-5" />
          </button>

          {/* BOTÓN HAMBURGUESA (móvil) */}
          <button
            className="md:hidden text-white focus:outline-none p-1 rounded hover:bg-blue-700 transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <XIcon className="w-8 h-8" /> : <MenuIcon className="w-8 h-8" />}
          </button>
        </div>

        {/* MENÚ MÓVIL
            role="navigation" + aria-label: convierte el overlay en un landmark de navegación
            que los SR anuncian al abrirse. aria-hidden oculta el contenido cuando está cerrado
            para que Tab no salte a estos enlaces desde el fondo. */}
        <div
          role="navigation"
          aria-label="Menú de navegación móvil"
          aria-hidden={!isMenuOpen}
          className={`fixed inset-0 bg-blue-900/95 backdrop-blur-sm z-40 transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-center items-center space-y-8 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
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
