import { useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { NOTES } from '../constants/soundConfig';
import { useAudio } from '../context/AudioContext';
import { useAccessibility } from '../context/AccessibilityContext';

const useBrailleSound = () => {
  // dotSynth/noDotSynth: el ritmo de la celda Braille (un tono por punto
  // presente/ausente). navSynth: todo lo demás (aciertos, errores, avanzar,
  // terminar un módulo). Diseño cálido a propósito — nada de ruido blanco ni
  // ondas cuadradas "de videojuego": triangular/senoidal, envolventes suaves.
  const dotSynth    = useRef(null);
  const noDotSynth  = useRef(null);
  const spaceSynth  = useRef(null);
  const navSynth    = useRef(null);
  const isInitialized = useRef(false);

  // Obtenemos isMuted del contexto global para que speakDescription lo respete
  const { isMuted, speak } = useAudio();
  // Los efectos de sonido (aciertos/errores, notas de la celda) son un ajuste
  // APARTE de silenciar la voz de Braulio — quien los llama ya no necesita
  // comprobarlo, las funciones de aquí abajo deciden solas si suenan o no.
  const { soundEffects } = useAccessibility();

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

    // Punto presente: un toque suave tipo campana/xilófono. "triangle8" (8
    // armónicos) para que suene brillante y nítido — se distingue del punto
    // ausente por timbre, no solo por volumen/altura.
    dotSynth.current = new Tone.Synth({
      oscillator: { type: 'triangle8' },
      envelope: { attack: 0.004, decay: 0.16, sustain: 0, release: 0.12 },
      volume: -5,
    }).toDestination();

    // Punto ausente: una octava abajo, más corto y con menos armónicos —
    // deliberadamente "apagado" frente al brillo del punto presente, pero con
    // suficiente color (triangle3, no senoidal puro) para que se siga oyendo
    // en bocinas pequeñas y no se confunda con el silencio real entre notas.
    noDotSynth.current = new Tone.Synth({
      oscillator: { type: 'triangle3' },
      envelope: { attack: 0.004, decay: 0.11, sustain: 0, release: 0.08 },
      volume: -10,
    }).toDestination();

    spaceSynth.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.22, sustain: 0, release: 0.2 },
      volume: -8,
    }).toDestination();

    // Aciertos, errores, navegación, fin de módulo: un tono redondo tipo
    // marimba (triangular con un pelín de sustain), más cálido que un beep.
    navSynth.current = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.006, decay: 0.2, sustain: 0.05, release: 0.3 },
      volume: -4,
    }).toDestination();

    isInitialized.current = true;
  };

  const playPattern = async (dots, char, speed = 400) => {
    if (!soundEffects) return;
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
    if (dots[0]) dotSynth.current.triggerAttackRelease(NOTES.DOT, dotTime); else noDotSynth.current.triggerAttackRelease(NOTES.NO_DOT, noDotTime);
    await sleep(speed);
    if (dots[1]) dotSynth.current.triggerAttackRelease(NOTES.DOT, dotTime); else noDotSynth.current.triggerAttackRelease(NOTES.NO_DOT, noDotTime);
    await sleep(speed);
    if (dots[2]) dotSynth.current.triggerAttackRelease(NOTES.DOT, dotTime); else noDotSynth.current.triggerAttackRelease(NOTES.NO_DOT, noDotTime);
    await sleep(speed);

    // Pausa entre columnas
    await sleep(speed);

    // Columna derecha (puntos 4-6)
    if (dots[3]) dotSynth.current.triggerAttackRelease(NOTES.DOT, dotTime); else noDotSynth.current.triggerAttackRelease(NOTES.NO_DOT, noDotTime);
    await sleep(speed);
    if (dots[4]) dotSynth.current.triggerAttackRelease(NOTES.DOT, dotTime); else noDotSynth.current.triggerAttackRelease(NOTES.NO_DOT, noDotTime);
    await sleep(speed);
    if (dots[5]) dotSynth.current.triggerAttackRelease(NOTES.DOT, dotTime); else noDotSynth.current.triggerAttackRelease(NOTES.NO_DOT, noDotTime);
  };

  /**
   * Preámbulo hablado: enseña a distinguir los dos sonidos base (punto
   * arriba/activo vs. punto abajo/ausente) antes de tocar un patrón completo.
   * Pensado para sonar una sola vez, la primera vez que alguien ve una letra
   * (lo dispara quien llama a este hook, ej. LessonVowel, con un flag en
   * localStorage) — luego queda disponible como botón de repaso bajo demanda.
   */
  const playDotLegend = async () => {
    if (!soundEffects) return;
    await initAudio();

    const say = (text) => new Promise((resolve) => speak(text, true, { onDone: resolve }));
    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    await say('Así suena un punto arriba, cuando está activo.');
    dotSynth.current?.triggerAttackRelease(NOTES.DOT, '4n');
    await wait(650);

    await say('Y así suena cuando no hay punto, va abajo.');
    noDotSynth.current?.triggerAttackRelease(NOTES.NO_DOT, '4n');
    await wait(650);

    // Sin esto, alguien que no ve la pantalla no tiene forma de saber que
    // puede repetir esta explicación cuando quiera.
    await say('Para volver a escuchar esto, toca dos veces rápido la tecla Shift.');
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
    if (!soundEffects) return;
    await initAudio();
    if (navSynth.current) navSynth.current.triggerAttackRelease(note, '8n');
    if (navigator.vibrate) navigator.vibrate(50);
  };

  // Acierto: dos notas cortas ascendentes, como un "ding-ding" cálido — mucho
  // más amable que un solo beep. Úsalo en vez de playNav(NOTES.CORRECT).
  const playCorrect = async () => {
    if (!soundEffects) return;
    await initAudio();
    if (!navSynth.current) return;
    navSynth.current.triggerAttackRelease(NOTES.CORRECT_1, '16n');
    setTimeout(() => navSynth.current?.triggerAttackRelease(NOTES.CORRECT_2, '8n'), 90);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  // Error: una sola nota grave y suave — un aviso, no un "buzzer" — con un
  // patrón de vibración distinto al del acierto para distinguirlos al tacto.
  const playIncorrect = async () => {
    if (!soundEffects) return;
    await initAudio();
    if (navSynth.current) navSynth.current.triggerAttackRelease(NOTES.INCORRECT, '8n');
    if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
  };

  return { playPattern, playDotLegend, speakDescription, playNav, playCorrect, playIncorrect };
};

export default useBrailleSound;
