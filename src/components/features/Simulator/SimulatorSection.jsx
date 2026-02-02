import React, { useRef } from 'react';
import useIsVisible from '../../../hooks/useIsVisible';
import BrailleCell from '../../common/BrailleCell';
import { ChevronLeft, ChevronRight } from '../../common/Icons';
import useSimulatorLogic from './useSimulatorLogic';
import { useAudio } from '../../../context/AudioContext';

const SimulatorSection = () => {
  const ref = useRef(null);
  useIsVisible(ref);

  const {
    inputText,
    audioMode,
    playbackSpeed,
    currentCells,
    liveRegionText,
    isPrevDisabled,
    isNextDisabled,
    paginationLabel,
    setAudioMode,
    setPlaybackSpeed,
    handleInputChange,
    handlePlay,
    goToNext,
    goToPrev
  } = useSimulatorLogic();
  
  // Botones auxiliares con mejor estilo para móvil
  const SpeedButton = ({ speed, label }) => (
    <button onClick={() => setPlaybackSpeed(speed)} aria-pressed={playbackSpeed === speed} className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg font-medium transition-colors ${playbackSpeed === speed ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{label}</button>
  );
  const AudioModeButton = ({ mode, label }) => (
    <button onClick={() => setAudioMode(mode)} aria-pressed={audioMode === mode} className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded-lg font-medium transition-colors ${audioMode === mode ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{label}</button>
  );

  return (
    <section id="simulador-top" ref={ref} className="full-page-section bg-white px-4 md:px-6">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3 md:mb-4">Simulador de Display Braille</h2>
          <p className="text-base md:text-lg text-gray-600">Escribe abajo para traducir en tiempo real.</p>
          <p className="text-sm md:text-base text-blue-600 font-medium mt-2 md:mt-4">
            {audioMode === 'rhythmic' ? "¡Toca una celda para sentir el ritmo!" : "¡Toca para escuchar la descripción!"}
          </p>
        </div>

        {/* Input */}
        <label htmlFor="braille-input" className="sr-only">Escribe tu texto aquí</label>
        <textarea 
          id="braille-input" 
          value={inputText} 
          onChange={handleInputChange} 
          aria-label="Entrada de texto para traducir"
          aria-description="Escribe aquí y el texto se convertirá automáticamente a Braille en el panel de abajo."
          className="w-full h-24 p-4 border border-gray-300 rounded-lg shadow-inner text-base md:text-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
          placeholder="Escribe algo..." 
        />

        {/* Controles (Adaptables a móvil) */}
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:justify-center md:items-center md:gap-6 md:my-6">
          
          {/* Grupo Modo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
            <span className="text-sm font-medium text-gray-700">Modo:</span>
            <div role="group" className="flex w-full sm:w-auto gap-2">
              <AudioModeButton mode="rhythmic" label="Rítmico" />
              <AudioModeButton mode="descriptive" label="Voz" />
            </div>
          </div>

          {/* Grupo Velocidad */}
          {audioMode === 'rhythmic' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
              <span className="text-sm font-medium text-gray-700">Velocidad:</span>
              <div role="group" className="flex w-full sm:w-auto gap-2">
                <SpeedButton speed="slow" label="Lento" />
                <SpeedButton speed="normal" label="Normal" />
                <SpeedButton speed="fast" label="Rápido" />
              </div>
            </div>
          )}
        </div>

        {/* Display Braille (EL CAMBIO IMPORTANTE ESTÁ AQUÍ) */}
        <div className="mb-6 p-4 md:p-6 bg-gray-200 border-b-4 border-gray-400 rounded-lg shadow-lg">
          {/* - flex-wrap: Permite que las celdas bajen de línea si no caben.
             - gap-3: Espacio uniforme horizontal y vertical.
             - justify-center: Las centra.
          */}
          <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Display Braille">
            {currentCells.map((cell, index) => (
              <BrailleCell 
                key={index} 
                dots={cell.dots} 
                char={cell.char} 
                onClick={() => handlePlay(cell.dots, cell.char)} 
                showChar={true} 
                isInteractive={true} 
                className="text-blue-600 w-10 h-14 bg-white shadow-sm" 
              />
            ))}
          </div>
        </div>

        {/* Navegación (Botones apilados en móvil muy pequeño) */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
          <button onClick={goToPrev} disabled={isPrevDisabled} aria-label="Ver caracteres anteriores" title="Anterior" className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center">
            <ChevronLeft className="w-5 h-5 mr-1" aria-hidden="true" /> Anterior
          </button>
          
          <span className="text-sm font-medium text-gray-600 tabular-nums" aria-hidden="true">
            {paginationLabel}
          </span>
          
          <button onClick={goToNext} disabled={isNextDisabled} aria-label="Ver caracteres siguientes" title="Siguiente" className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center">
            Siguiente <ChevronRight className="w-5 h-5 ml-1" aria-hidden="true" />
          </button>
        </div>

        <div className="sr-only" role="status" aria-live="polite">{liveRegionText}</div>
      </div>
    </section>
  );
};

export default SimulatorSection;