import { useState } from 'react';
import useBrailleSound from '../../../hooks/useBrailleSound';
import { braillePatterns } from '../../../constants/braillePatterns';
import { textToBrailleCells } from '../../../utils/textHelpers';

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
  
  // Paginación
  const currentCells = brailleCells.slice(currentIndex, currentIndex + DISPLAY_SIZE);
  while (currentCells.length < DISPLAY_SIZE) {
    currentCells.push({ char: ' ', dots: braillePatterns['blank'] });
  }

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
    playNav('C4');
    const newIndex = Math.min(currentIndex + DISPLAY_SIZE, Math.max(0, brailleCells.length - DISPLAY_SIZE));
    setCurrentIndex(newIndex);
    setLiveRegionText(`Mostrando caracteres ${newIndex + 1} a ${Math.min(newIndex + DISPLAY_SIZE, brailleCells.length)}`);
  };

  const goToPrev = () => {
    playNav('G3');
    const newIndex = Math.max(0, currentIndex - DISPLAY_SIZE);
    setCurrentIndex(newIndex);
    setLiveRegionText(`Mostrando caracteres ${newIndex + 1} a ${newIndex + DISPLAY_SIZE}`);
  };

  // Calculamos estados derivados para la UI
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex + DISPLAY_SIZE >= brailleCells.length;
  const paginationLabel = `${Math.min(currentIndex + 1, brailleCells.length)} - ${Math.min(currentIndex + DISPLAY_SIZE, brailleCells.length)} / ${brailleCells.length}`;

  return {
    // Estados
    inputText,
    audioMode,
    playbackSpeed,
    currentCells,
    liveRegionText,
    isPrevDisabled,
    isNextDisabled,
    paginationLabel,
    
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