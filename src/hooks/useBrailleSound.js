import { useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { NOTES } from '../constants/soundConfig';
import { useAudio } from '../context/AudioContext';

const useBrailleSound = () => {
  const dotSynth    = useRef(null);
  const noDotSynth  = useRef(null);
  const spaceSynth  = useRef(null);
  const navSynth    = useRef(null);
  const isInitialized = useRef(false);

  // Obtenemos isMuted del contexto global para que speakDescription lo respete
  const { isMuted } = useAudio();

  // Cleanup de synths al desmontar — evita que los AudioNode se acumulen en memoria
  useEffect(() => {
    return () => {
      [dotSynth, noDotSynth, spaceSynth, navSynth].forEach((ref) => {
        if (ref.current) {
          ref.current.dispose();
          ref.current = null;
        }
      });
      isInitialized.current = false;
    };
  }, []);

  const initAudio = async () => {
    if (isInitialized.current) return;

    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    dotSynth.current = new Tone.MembraneSynth({
      pitchDecay: 0.01,
      octaves: 6,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
    }).toDestination();

    noDotSynth.current = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.1 }
    }).toDestination();

    spaceSynth.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0 }
    }).toDestination();

    navSynth.current = new Tone.Synth().toDestination();

    isInitialized.current = true;
  };

  const playPattern = async (dots, char, speed = 400) => {
    await initAudio();

    if (char === ' ' && spaceSynth.current) {
      spaceSynth.current.triggerAttackRelease(NOTES.SPACE, '8n');
      return;
    }

    if (!dotSynth.current) return;

    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const dotTime   = '8n';
    const noDotTime = '16n';

    // Columna izquierda (puntos 1-3)
    if (dots[0]) dotSynth.current.triggerAttackRelease(NOTES.DOT, dotTime); else noDotSynth.current.triggerAttackRelease(noDotTime);
    await sleep(speed);
    if (dots[1]) dotSynth.current.triggerAttackRelease(NOTES.DOT, dotTime); else noDotSynth.current.triggerAttackRelease(noDotTime);
    await sleep(speed);
    if (dots[2]) dotSynth.current.triggerAttackRelease(NOTES.DOT, dotTime); else noDotSynth.current.triggerAttackRelease(noDotTime);
    await sleep(speed);

    // Pausa entre columnas
    await sleep(speed);

    // Columna derecha (puntos 4-6)
    if (dots[3]) dotSynth.current.triggerAttackRelease(NOTES.DOT, dotTime); else noDotSynth.current.triggerAttackRelease(noDotTime);
    await sleep(speed);
    if (dots[4]) dotSynth.current.triggerAttackRelease(NOTES.DOT, dotTime); else noDotSynth.current.triggerAttackRelease(noDotTime);
    await sleep(speed);
    if (dots[5]) dotSynth.current.triggerAttackRelease(NOTES.DOT, dotTime); else noDotSynth.current.triggerAttackRelease(noDotTime);
  };

  /**
   * Descripción hablada de un patrón Braille (modo descriptivo del simulador).
   * Ahora respeta el estado de silencio global (isMuted).
   */
  const speakDescription = (dots, char) => {
    if (isMuted || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    let textToSpeak = '';
    if (char === ' ') {
      textToSpeak = 'Espacio';
    } else if (char === '#') {
      textToSpeak = 'Prefijo numérico. Puntos 3, 4, 5, 6';
    } else {
      const activeDots = dots
        .map((isActive, i) => (isActive ? i + 1 : null))
        .filter(Boolean)
        .join(', ');
      textToSpeak = activeDots ? `Puntos ${activeDots}` : 'Celda vacía';
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang  = 'es-ES';
    utterance.rate  = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  /**
   * Nota de navegación + vibración háptica.
   * Ahora es async y espera initAudio() para evitar la race condition.
   */
  const playNav = async (note = NOTES.NAV_NEXT) => {
    await initAudio();
    if (navSynth.current) navSynth.current.triggerAttackRelease(note, '8n');
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return { playPattern, speakDescription, playNav };
};

export default useBrailleSound;
