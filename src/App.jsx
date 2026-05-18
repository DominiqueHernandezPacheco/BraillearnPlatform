import React, { useState } from 'react';
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
// Contexto de accesibilidad
import { useAccessibility } from './context/AccessibilityContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState('plataforma');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // highContrast viene del contexto — ya no es estado local.
  // Header y CourseSection lo leen desde aquí para no romper su interfaz actual.
  const { highContrast } = useAccessibility();

  const handleNav = (page, anchor) => {
    window.speechSynthesis.cancel();
    setCurrentPage(page);
    setTimeout(() => {
      const element = document.getElementById(anchor);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

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
              <CourseSection highContrast={highContrast} />
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
    </div>
  );
}
