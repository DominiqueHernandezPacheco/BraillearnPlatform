import React, { useState, useCallback, useEffect, useRef } from 'react';
import './index.css';
// Estructura
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import { NAV_ITEMS } from './components/layout/navItems';
// Secciones
import Home from './components/features/Home/Home';
import CourseSection from './components/features/Courses/CourseSection';
import MessagesSection from './components/features/Messages/MessagesSection';
import ErrorBoundary from './components/common/ErrorBoundary';
import AccessibilityPanel from './components/features/AccessibilityPanel/AccessibilityPanel';
import OnboardingTour from './components/features/Onboarding/OnboardingTour';
import VoiceAssistantIndicator from './components/features/VoiceAssistant/VoiceAssistantIndicator';
// Contextos y hooks
import { useAccessibility } from './context/AccessibilityContext';
import { useAudio } from './context/AudioContext';
import { useProgress } from './hooks/useProgress';
import useVoiceAssistant from './hooks/useVoiceAssistant';
import { matchLocalIntent } from './utils/voiceIntents';
import { PHRASES, NAV_CONFIRMATIONS } from './utils/assistantPhrases';

const PAGE_TITLES = {
  plataforma: 'Inicio',
  cursos: 'Cursos',
  mensajes: 'Mensajes',
};

// Mismos pasos que usa AccessibilityContext para fontScale
const FONT_SCALES = [0.875, 1, 1.125, 1.25];

// ── Rutas: cada sección tiene su propia URL (#/cursos), así funcionan el
// botón "atrás" del navegador y los enlaces directos. ─────────────────────
const PAGE_BY_SLUG = { inicio: 'plataforma', cursos: 'cursos', mensajes: 'mensajes' };
const HASH_BY_PAGE = Object.fromEntries(NAV_ITEMS.map((item) => [item.page, item.hash]));

const pageFromHash = () => {
  const slug = window.location.hash.replace(/^#\/?/, '').split('/')[0];
  return PAGE_BY_SLUG[slug] || 'plataforma';
};

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
    // El servidor manda el motivo en { error } (p. ej. clave de Claude inválida).
    const detail = await res.json().then((d) => d?.error, () => undefined);
    throw new Error(detail || `El servidor de Braulio respondió ${res.status} — ¿está corriendo "npm run server"?`);
  }
  return res.json();
}

// Si Claude tarda más que esto en contestar, Braulio dice "Un momento".
const THINKING_DELAY_MS = 900;

// Cuando Claude rechaza la clave (401) no tiene caso pedir "inténtalo de nuevo":
// Braulio lo dice claro, y los comandos locales ("ir a cursos") siguen sirviendo.
const isAuthError = (message) => /authentication|invalid x-api-key|api key is invalid|\b401\b/i.test(String(message));

export default function App() {
  const [currentPage, setCurrentPage] = useState(pageFromHash);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [openModuleRequest, setOpenModuleRequest] = useState(null);
  const mainRef = useRef(null);
  const isFirstRender = useRef(true);

  const {
    fontScale, setFontScale, setHighContrast, setReduceMotion,
  } = useAccessibility();
  const { speak, stop, beginAssistantTurn, endAssistantTurn } = useAudio();
  const { lastLesson } = useProgress();

  // El botón "atrás" (o un enlace #/cursos) cambia la sección.
  useEffect(() => {
    const onHashChange = () => setCurrentPage(pageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Al cambiar de sección: título de la pestaña, arriba del todo y foco en el
  // encabezado principal — así un lector de pantalla anuncia dónde estás.
  useEffect(() => {
    document.title = `${PAGE_TITLES[currentPage]} · Braillearn`;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    const heading = mainRef.current?.querySelector('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }, [currentPage]);

  // (page, anchor): el segundo argumento ya no hace falta, se acepta por
  // compatibilidad con el enrutador de voz.
  const handleNav = useCallback((page) => {
    stop();
    setCurrentPage(page);
    const hash = HASH_BY_PAGE[page];
    if (hash && window.location.hash !== hash) window.location.hash = hash;
  }, [stop]);

  const skipToContent = (e) => {
    e.preventDefault();
    mainRef.current?.focus();
    mainRef.current?.scrollIntoView();
  };

  // Traduce el `destination` que puede pedir Claude (ver electron/claude/
  // claudeService.cjs -> NAVIGATE_TOOL) a una navegación real. Comparte
  // destinos con matchLocalIntent para que ambos caminos lleven al mismo lado.
  const applyNavigateTo = useCallback((destination) => {
    const MODULE_BY_DESTINATION = { 'modulo-1': 1, 'modulo-2': 2, 'modulo-3': 3 };

    if (destination === 'ultima-leccion') {
      handleNav('cursos');
      if (lastLesson) setOpenModuleRequest({ moduleId: lastLesson, requestedAt: Date.now() });
      return;
    }
    if (destination in MODULE_BY_DESTINATION) {
      handleNav('cursos');
      setOpenModuleRequest({ moduleId: MODULE_BY_DESTINATION[destination], requestedAt: Date.now() });
      return;
    }
    const PAGE_BY_DESTINATION = { inicio: 'plataforma', cursos: 'cursos', mensajes: 'mensajes' };
    const page = PAGE_BY_DESTINATION[destination];
    if (page) handleNav(page);
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

  // Lo que dice el asistente al responder: prioritario, no lo retiene el turno.
  const say = useCallback((text) => speak(text, true, { priority: true }), [speak]);

  // ── Fase 2: qué hacer con lo que "Braulio" capturó ──────────────────────
  const runVoiceCommand = useCallback(async (transcript) => {
    if (!transcript) {
      say(PHRASES.noSpeech);
      return;
    }

    const intent = matchLocalIntent(transcript);

    if (intent?.type === 'navigate') {
      handleNav(intent.page);
      say(NAV_CONFIRMATIONS[intent.page] || PHRASES.ok);
      return;
    }

    if (intent?.type === 'open-accessibility-panel') {
      setIsPanelOpen(true);
      say(PHRASES.panel);
      return;
    }

    if (intent?.type === 'open-last-lesson') {
      if (!lastLesson) {
        handleNav('cursos');
        say(PHRASES.noLesson);
        return;
      }
      handleNav('cursos');
      setOpenModuleRequest({ moduleId: lastLesson, requestedAt: Date.now() });
      say(PHRASES.resumeLesson);
      return;
    }

    if (intent?.type === 'open-module') {
      handleNav('cursos');
      setOpenModuleRequest({ moduleId: intent.moduleId, requestedAt: Date.now() });
      say(PHRASES.openModule);
      return;
    }

    if (intent?.type === 'set-accessibility') {
      applyAccessibilitySetting(intent.setting);
      say(PHRASES.adjusted);
      return;
    }

    // Fase 2b: nada local matcheó — se manda como pregunta abierta a Claude
    // (en Electron, directo por IPC; en el navegador, vía el servidor local).
    // Claude puede tardar unos segundos: si la respuesta no llega enseguida,
    // Braulio avisa que está pensando en vez de dejar el silencio.
    const thinkingTimer = setTimeout(() => say(PHRASES.thinking), THINKING_DELAY_MS);
    try {
      const result = await askClaude(transcript, { currentPage });
      clearTimeout(thinkingTimer);
      if (result?.error) {
        console.error('[Braulio] Error de Claude:', result.error);
        say(isAuthError(result.error) ? PHRASES.authError : PHRASES.genericError);
        return;
      }
      for (const action of result?.actions || []) {
        if (action.tool === 'navigate_app') applyNavigateTo(action.input?.destination);
        else if (action.tool === 'set_accessibility') applyAccessibilitySetting(action.input?.setting);
      }
      say(result?.text || PHRASES.ok);
    } catch (err) {
      clearTimeout(thinkingTimer);
      console.error('[Braulio] Error llamando a Claude:', err);
      say(isAuthError(err?.message) ? PHRASES.authError : PHRASES.genericError);
    }
  }, [say, handleNav, lastLesson, currentPage, applyNavigateTo, applyAccessibilitySetting]);

  // Hablarle a Braulio pausa la narración en curso; al terminar (respuesta o
  // acción) la lección continúa donde iba.
  const handleVoiceCommand = useCallback(async (transcript) => {
    beginAssistantTurn();
    try {
      await runVoiceCommand(transcript);
    } finally {
      endAssistantTurn();
    }
  }, [runVoiceCommand, beginAssistantTurn, endAssistantTurn]);

const { status, lastCommand, mode, triggerManually } = useVoiceAssistant(handleVoiceCommand);

  // Si te escuchó pero no hubo comando (silencio, o el micrófono se cortó),
  // el turno termina solo y la lección continúa.
  const prevStatus = useRef('idle');
  useEffect(() => {
    if (prevStatus.current === 'listening' && status === 'idle') endAssistantTurn();
    prevStatus.current = status;
  }, [status, endAssistantTurn]);

  return (
    <div className="min-h-dvh bg-page text-ink">
      <a href="#main" className="skip-link" onClick={skipToContent}>
        Saltar al contenido
      </a>

      <Header
        currentPage={currentPage}
        handleNav={handleNav}
        onOpenPanel={() => setIsPanelOpen(true)}
        isPanelOpen={isPanelOpen}
      />

      <main id="main" ref={mainRef} tabIndex={-1} className="outline-none">
        {currentPage === 'plataforma' && (
          <Home
            handleNav={handleNav}
            onOpenModule={(moduleId) => {
              handleNav('cursos');
              setOpenModuleRequest({ moduleId, requestedAt: Date.now() });
            }}
          />
        )}

        {currentPage === 'cursos' && (
          <ErrorBoundary>
            <CourseSection
              openModuleRequest={openModuleRequest}
              onRequestHandled={() => setOpenModuleRequest(null)}
              onOpenPanel={() => setIsPanelOpen(true)}
            />
          </ErrorBoundary>
        )}

        {currentPage === 'mensajes' && (
          <ErrorBoundary>
            <MessagesSection />
          </ErrorBoundary>
        )}
      </main>

      <BottomNav currentPage={currentPage} handleNav={handleNav} />

      {/* Panel de accesibilidad: siempre montado, animado con CSS */}
      <AccessibilityPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />

      {/* Recorrido guiado: se muestra solo si el usuario es nuevo o no lo ha terminado */}
      <OnboardingTour />

      {/* Asistente de voz "Braulio": wake word + comandos */}
      <VoiceAssistantIndicator
        status={status}
        lastCommand={lastCommand}
        mode={mode}
        triggerManually={triggerManually}
      />
    </div>
  );
}
