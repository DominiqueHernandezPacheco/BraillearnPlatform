import { useState } from 'react';
import useBrailleSound from '../../../hooks/useBrailleSound';
import { braillePatterns } from '../../../constants/braillePatterns';
import { textToBrailleCells } from '../../../utils/textHelpers';
import { NOTES } from '../../../constants/soundConfig';

const useSimulatorLogic = () => {
  const [inputText, setInputText] = useState("Hola mundo");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioMode, setAudioMode] = useState('rhythmic');
  const [playbackSpeed, setPlaybackSpeed] = useState('normal');
  const [liveRegionText, setLiveRegionText] = useState("");
  
  const { playPattern, speakDescription, playNav } = useBrailleSound();
  
  const DISPLAY_SIZE = 12;
  const speedMap = { 'slow': 800, 'normal': 400, 'fast': 150 };

  // Procesamiento de datos
  const brailleCells = textToBrailleCells(inputText);
  
  // Paginación: obtenemos el bloque actual y rellenamos con espacios vacíos
  // sin mutar el array original (Array.from crea un nuevo array inmutable).
  const pageSlice = brailleCells.slice(currentIndex, currentIndex + DISPLAY_SIZE);
  const currentCells = Array.from(
    { length: DISPLAY_SIZE },
    (_, i) => pageSlice[i] ?? { char: ' ', dots: braillePatterns['blank'] }
  );

  // Acciones
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setCurrentIndex(0);
  };

  const handlePlay = (dots, char) => {
      if (audioMode === 'descriptive') {
          speakDescription(dots, char);
      } else {
          playPattern(dots, char, speedMap[playbackSpeed]);
      }
  };

  const goToNext = () => {
    playNav(NOTES.NAV_NEXT);
    // Avanzamos por bloque exacto de 12
    const newIndex = currentIndex + DISPLAY_SIZE;
    if (newIndex < brailleCells.length) {
        setCurrentIndex(newIndex);
        setLiveRegionText(`Página siguiente`);
    }
  };

  const goToPrev = () => {
    playNav(NOTES.NAV_PREV);
    // Retrocedemos por bloque exacto de 12
    const newIndex = Math.max(0, currentIndex - DISPLAY_SIZE);
    setCurrentIndex(newIndex);
    setLiveRegionText(`Página anterior`);
  };

  // --- AQUÍ ESTÁ EL CAMBIO CLAVE PARA EL PAGINADO ---
  const totalPages = Math.ceil(brailleCells.length / DISPLAY_SIZE) || 1;
  const currentPage = Math.floor(currentIndex / DISPLAY_SIZE) + 1;
  
  // Etiqueta limpia: "Página 1 de 3"
  const paginationLabel = `Página ${currentPage} de ${totalPages}`;

  // Lógica de deshabilitar botones
  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  return {
    // Estados
    inputText,
    audioMode,
    playbackSpeed,
    currentCells,
    liveRegionText,
    isPrevDisabled,
    isNextDisabled,
    paginationLabel, // <--- Ahora devuelve el string bonito
    
    // Setters simples
    setAudioMode,
    setPlaybackSpeed,

    // Handlers complejos
    handleInputChange,
    handlePlay,
    goToNext,
    goToPrev
  };
};

export default useSimulatorLogic;