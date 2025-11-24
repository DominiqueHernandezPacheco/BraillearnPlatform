import { useRef } from 'react';

const useBrailleSound = () => {
  const dotSynth = useRef(null);
  const noDotSynth = useRef(null);
  const spaceSynth = useRef(null);
  const navSynth = useRef(null);

  const initAudio = async () => {
    // Asumiendo que Tone se carga globalmente en App.jsx
    if (typeof window !== 'undefined' && window.Tone) {
        if (window.Tone.context.state !== 'running') {
          await window.Tone.start();
        }
        
        if (!dotSynth.current) {
          dotSynth.current = new window.Tone.MembraneSynth({
            pitchDecay: 0.01,
            octaves: 6,
            envelope: { attack: 0.001, decay: 0.1, sustain: 0 }
          }).toDestination();
        
          noDotSynth.current = new window.Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.1 }
          }).toDestination();
          
          spaceSynth.current = new window.Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 2,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0 }
          }).toDestination();

          navSynth.current = new window.Tone.Synth().toDestination();
        }
    }
  };

  const playPattern = async (dots, char, speed = 400) => {
    await initAudio();
    
    if (char === ' ' && spaceSynth.current) {
         spaceSynth.current.triggerAttackRelease("C2", "8n");
         return;
    }
    
    if (!dotSynth.current) return;

    const sleep = (ms) => new Promise(res => setTimeout(res, ms));
    const dotTime = "8n";
    const noDotTime = "16n";

    // Columna 1
    if(dots[0]) dotSynth.current.triggerAttackRelease("G4", dotTime); else noDotSynth.current.triggerAttackRelease(noDotTime);
    await sleep(speed);
    if(dots[1]) dotSynth.current.triggerAttackRelease("G4", dotTime); else noDotSynth.current.triggerAttackRelease(noDotTime);
    await sleep(speed);
    if(dots[2]) dotSynth.current.triggerAttackRelease("G4", dotTime); else noDotSynth.current.triggerAttackRelease(noDotTime);
    await sleep(speed);
    
    // Pausa entre columnas
    await sleep(speed);
    
    // Columna 2
    if(dots[3]) dotSynth.current.triggerAttackRelease("G4", dotTime); else noDotSynth.current.triggerAttackRelease(noDotTime);
    await sleep(speed);
    if(dots[4]) dotSynth.current.triggerAttackRelease("G4", dotTime); else noDotSynth.current.triggerAttackRelease(noDotTime);
    await sleep(speed);
    if(dots[5]) dotSynth.current.triggerAttackRelease("G4", dotTime); else noDotSynth.current.triggerAttackRelease(noDotTime);
  };

  const speakDescription = (dots, char) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    let textToSpeak = "";
    if (char === ' ') {
      textToSpeak = "Espacio";
    } else if (char === '#') {
      textToSpeak = "Prefijo numérico. Puntos 3, 4, 5, 6";
    } else {
      const activeDots = dots
        .map((isActive, i) => (isActive ? i + 1 : null))
        .filter(Boolean)
        .join(', ');
      
      textToSpeak = activeDots ? `Puntos ${activeDots}` : "Celda vacía";
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'es-ES';
    utterance.rate = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  const playNav = (note = "C4") => {
      initAudio();
      if(navSynth.current) navSynth.current.triggerAttackRelease(note, "8n");
      if (navigator.vibrate) navigator.vibrate(50);
  };

  return { playPattern, speakDescription, playNav };
};

export default useBrailleSound;