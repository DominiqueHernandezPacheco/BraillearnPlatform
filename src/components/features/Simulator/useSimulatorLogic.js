import { useState, useEffect } from 'react'; // AÑADIDO: useEffect
import useBrailleSound from '../../../hooks/useBrailleSound';
import { braillePatterns } from '../../../constants/braillePatterns';
import { textToBrailleCells } from '../../../utils/textHelpers';
import { NOTES } from '../../../constants/soundConfig';
// NUEVO: Importar el servicio de conexión
import { brailleService } from '../../../utils/brailleService';

const useSimulatorLogic = () => {
  const [inputText, setInputText] = useState("Hola");
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
  const pageSlice = brailleCells.slice(currentIndex, currentIndex + DISPLAY_SIZE);
  const currentCells = Array.from(
    { length: DISPLAY_SIZE },
    (_, i) => pageSlice[i] ?? { char: ' ', dots: braillePatterns['blank'] }
  );

  
  // ─── EFECTO ESPEJO CON DEPURACIÓN ──────────────────────────────────────────
  useEffect(() => {
    // 1. Extraemos el texto
    const textoVisible = currentCells.map(cell => cell.char).join('').trimEnd();

    // PUNTO DE CONTROL 1: ¿React se da cuenta de que escribiste?
    console.log("👀 1. Detecté un cambio. Texto visible capturado:", textoVisible === "" ? "[VACÍO]" : textoVisible);

    if (!textoVisible) {
        console.log("🛑 2. El texto está vacío. Cancelando el envío.");
        return;
    }

    const timer = setTimeout(() => {
      // PUNTO DE CONTROL 2: ¿Pasó el medio segundo del Debounce?
      console.log(`⏳ 3. Pasaron los 500ms. Enviando "${textoVisible}" a la API...`);
      
      brailleService.sendText(textoVisible).then(respuesta => {
        // PUNTO DE CONTROL 3: La API respondió
        console.log(`✅ 4. ¡La API respondió para el simulador!`, respuesta);
      }).catch(error => {
        // PUNTO DE CONTROL 4: La petición falló
        console.error(`🚨 4. Error al contactar a la API desde el simulador:`, error);
      });
    },1000);

    return () => clearTimeout(timer);
    
  // Nota: Agregué currentCells a las dependencias por seguridad
  }, [inputText, currentIndex, currentCells]); 
  // ──────────────────────────────────────────────────────────────────────────

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
    const newIndex = currentIndex + DISPLAY_SIZE;
    if (newIndex < brailleCells.length) {
        setCurrentIndex(newIndex);
        setLiveRegionText(`Página siguiente`);
    }
  };

  const goToPrev = () => {
    playNav(NOTES.NAV_PREV);
    const newIndex = Math.max(0, currentIndex - DISPLAY_SIZE);
    setCurrentIndex(newIndex);
    setLiveRegionText(`Página anterior`);
  };

  const totalPages = Math.ceil(brailleCells.length / DISPLAY_SIZE) || 1;
  const currentPage = Math.floor(currentIndex / DISPLAY_SIZE) + 1;
  
  const paginationLabel = `Página ${currentPage} de ${totalPages}`;

  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  return {
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
  };
};

export default useSimulatorLogic;