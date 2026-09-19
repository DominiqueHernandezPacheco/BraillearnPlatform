import React, { useState, useCallback } from 'react';
import './index.css';
// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
// Secciones
import Hero from './components/sections/Hero';
import Quote from './components/sections/Quote';
import LearningHub from './components/sections/LearningHub';
import TeamSection from './components/sections/Team';
import InspirationSection from './components/sections/Inspiration';
import ChallengeSection from './components/sections/Challenge';
import SolutionSection from './components/sections/Solution';
import VisionSection from './components/sections/Vision';
import FutureWorkSection from './components/sections/FutureWork';
import TechnicalDetailsSection from './components/sections/TechnicalDetails';
// Features
import SimulatorSection from './components/features/Simulator/SimulatorSection';
import CourseSection from './components/features/Courses/CourseSection';
import ErrorBoundary from './components/common/ErrorBoundary';
import AccessibilityPanel from './components/features/AccessibilityPanel/AccessibilityPanel';
import OnboardingTour from './components/features/Onboarding/OnboardingTour';
import VoiceAssistantIndicator from './components/features/VoiceAssistant/VoiceAssistantIndicator';
// Contexto de accesibilidad
import { useAccessibility } from './context/AccessibilityContext';
import { useAudio } from './context/AudioContext';
import { useProgress } from './hooks/useProgress';
import useVoiceAssistant from './hooks/useVoiceAssistant';
import { matchLocalIntent } from './utils/voiceIntents';

const NAV_CONFIRMATIONS = {
  plataforma: 'Listo, aquí tienes el inicio.',
  cursos: 'Listo, aquí tienes tus cursos.',
  simulador: 'Listo, aquí tienes el simulador.',
  proyecto: 'Listo, aquí tienes información del proyecto.',
};

// Mismos pasos que usa AccessibilityContext para fontScale
const FONT_SCALES = [0.875, 1, 1.125, 1.25];

// Fase 2b: pregunta abierta -> Claude. Dentro de Electron le habla directo
// al proceso principal por IPC (la API key vive ahí). En el navegador
// (Chrome, para pruebas) le pega al servidor local (server/index.cjs) vía
// el proxy de Vite — la key tampoco llega nunca al navegador en ese caso.
async function askClaude(text, context) {
  if (window.electronAPI?.askClaude) {
    return window.electronAPI.askClaude(text, context);
  }
  const res = await fetch('/api/ask-claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, context }),
  });
  if (!res.ok) {
    throw new Error(`El servidor de Braulio respondió ${res.status} — ¿está corriendo "npm run server"?`);
  }
  return res.json();
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('plataforma');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [openModuleRequest, setOpenModuleRequest] = useState(null);

  // highContrast viene del contexto — ya no es estado local.
  // Header y CourseSection lo leen desde aquí para no romper su interfaz actual.
  const {
    highContrast, fontScale, setFontScale, setHighContrast, setReduceMotion,
  } = useAccessibility();
  const { speak } = useAudio();
  const { lastLesson } = useProgress();

  const handleNav = useCallback((page, anchor) => {
    window.speechSynthesis.cancel();
    setCurrentPage(page);
    setTimeout(() => {
      const element = document.getElementById(anchor);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, []);

  // Traduce el `destination` que puede pedir Claude (ver electron/claude/
  // claudeService.cjs -> NAVIGATE_TOOL) a una navegación real. Comparte
  // destinos con matchLocalIntent para que ambos caminos lleven al mismo lado.
  const applyNavigateTo = useCallback((destination) => {
    const MODULE_BY_DESTINATION = { 'modulo-1': 1, 'modulo-2': 2, 'modulo-3': 3 };

    if (destination === 'ultima-leccion') {
      handleNav('cursos', 'cursos-top');
      if (lastLesson) setOpenModuleRequest({ moduleId: lastLesson, requestedAt: Date.now() });
      return;
    }
    if (destination in MODULE_BY_DESTINATION) {
      handleNav('cursos', 'cursos-top');
      setOpenModuleRequest({ moduleId: MODULE_BY_DESTINATION[destination], requestedAt: Date.now() });
      return;
    }
    const PAGE_BY_DESTINATION = {
      inicio: ['plataforma', 'inicio'],
      cursos: ['cursos', 'cursos-top'],
      simulador: ['simulador', 'simulador-top'],
      proyecto: ['proyecto', 'acerca'],
    };
    const target = PAGE_BY_DESTINATION[destination];
    if (target) handleNav(target[0], target[1]);
  }, [handleNav, lastLesson]);

  // Igual que applyNavigateTo, pero para ajustes de accesibilidad — usado
  // tanto por el enrutador local (voiceIntents.js) como por la herramienta
  // set_accessibility de Claude. (setFontScale solo acepta un valor directo,
  // no una función actualizadora — por eso leemos `fontScale` del contexto.)
  const applyAccessibilitySetting = useCallback((setting) => {
    const i = FONT_SCALES.indexOf(fontScale);
    switch (setting) {
      case 'font-bigger':
        setFontScale(FONT_SCALES[Math.min(i === -1 ? 1 : i + 1, FONT_SCALES.length - 1)]);
        break;
      case 'font-smaller':
        setFontScale(FONT_SCALES[Math.max(i === -1 ? 1 : i - 1, 0)]);
        break;
      case 'font-reset':
        setFontScale(1);
        break;
      case 'high-contrast-on':
        setHighContrast(true);
        break;
      case 'high-contrast-off':
        setHighContrast(false);
        break;
      case 'reduce-motion-on':
        setReduceMotion(true);
        break;
      case 'reduce-motion-off':
        setReduceMotion(false);
        break;
      default:
        break;
    }
  }, [fontScale, setFontScale, setHighContrast, setReduceMotion]);

  // ── Fase 2: qué hacer con lo que "Braulio" capturó ──────────────────────
  const handleVoiceCommand = useCallback(async (transcript) => {
    if (!transcript) {
      speak('No escuché nada, inténtalo de nuevo.', true);
      return;
    }

    const intent = matchLocalIntent(transcript);

    if (intent?.type === 'navigate') {
      handleNav(intent.page, intent.anchor);
      speak(NAV_CONFIRMATIONS[intent.page] || 'Listo.', true);
      return;
    }

    if (intent?.type === 'open-accessibility-panel') {
      setIsPanelOpen(true);
      speak('Aquí tienes el panel de accesibilidad.', true);
      return;
    }

    if (intent?.type === 'open-last-lesson') {
      if (!lastLesson) {
        handleNav('cursos', 'cursos-top');
        speak('Todavía no tienes ninguna lección guardada. Aquí están tus cursos.', true);
        return;
      }
      handleNav('cursos', 'cursos-top');
      setOpenModuleRequest({ moduleId: lastLesson, requestedAt: Date.now() });
      speak('Retomando tu última lección.', true);
      return;
    }

    if (intent?.type === 'open-module') {
      handleNav('cursos', 'cursos-top');
      setOpenModuleRequest({ moduleId: intent.moduleId, requestedAt: Date.now() });
      speak('Listo, abriendo ese módulo.', true);
      return;
    }

    if (intent?.type === 'set-accessibility') {
      applyAccessibilitySetting(intent.setting);
      speak('Listo, ajustado.', true);
      return;
    }

    // Fase 2b: nada local matcheó — se manda como pregunta abierta a Claude
    // (en Electron, directo por IPC; en el navegador, vía el servidor local).
    try {
      const result = await askClaude(transcript, { currentPage });
      if (result?.error) {
        console.error('[Braulio] Error de Claude:', result.error);
        speak('Tuve un problema para responder eso, inténtalo de nuevo.', true);
        return;
      }
      for (const action of result?.actions || []) {
        if (action.tool === 'navigate_app') applyNavigateTo(action.input?.destination);
        else if (action.tool === 'set_accessibility') applyAccessibilitySetting(action.input?.setting);
      }
      speak(result?.text || 'Listo.', true);
    } catch (err) {
      console.error('[Braulio] Error llamando a Claude:', err);
      speak('Tuve un problema para responder eso, inténtalo de nuevo.', true);
    }
  }, [speak, handleNav, lastLesson, currentPage, applyNavigateTo, applyAccessibilitySetting]);

  const { status, lastCommand, mode, triggerManually } = useVoiceAssistant(handleVoiceCommand);

  return (
    <div className={`font-sans bg-gray-50 ${highContrast ? 'high-contrast' : ''}`}>
      <Header
        handleNav={handleNav}
        onOpenPanel={() => setIsPanelOpen(true)}
        isPanelOpen={isPanelOpen}
      />

      <main>
        {currentPage === 'plataforma' && (
          <div className="scroll-container active">
            <Hero />
            <Quote />
            <LearningHub onNavigateToCourses={() => handleNav('cursos', 'cursos-top')} />
          </div>
        )}

        {currentPage === 'cursos' && (
          <div className="scroll-container active">
            <ErrorBoundary>
              <CourseSection highContrast={highContrast} openModuleRequest={openModuleRequest} />
            </ErrorBoundary>
          </div>
        )}

        {currentPage === 'proyecto' && (
          <div className="scroll-container active">
            <TeamSection />
            <InspirationSection />
            <ChallengeSection />
            <SolutionSection />
            <VisionSection />
            <FutureWorkSection />
            <TechnicalDetailsSection />
          </div>
        )}

        {currentPage === 'simulador' && (
          <div className="scroll-container active">
            <SimulatorSection />
          </div>
        )}
      </main>

      {/* Panel de accesibilidad: siempre montado, animado con CSS */}
      <AccessibilityPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />

      {/* Recorrido guiado: se muestra solo si el usuario es nuevo o no lo ha terminado */}
      <OnboardingTour />

      {/* Asistente de voz "Braulio": wake word + comandos de navegación */}
      <VoiceAssistantIndicator
        status={status}
        lastCommand={lastCommand}
        mode={mode}
        triggerManually={triggerManually}
      />
    </div>
  );
}
