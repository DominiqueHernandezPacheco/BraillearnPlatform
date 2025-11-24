import React, { useState, useEffect } from 'react';
import './index.css'; // Asegúrate de que el nombre coincida con el archivo CSS que creaste

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

export default function App() {
  const [currentPage, setCurrentPage] = useState('plataforma');
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js";
    script.async = true;
    script.id = "tone-script";
    if (!document.getElementById('tone-script')) document.body.appendChild(script);
  }, []);

  const handleNav = (page, anchor) => {
    setCurrentPage(page);
    setTimeout(() => {
      const element = document.getElementById(anchor);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  return (
    <div className={`font-sans bg-gray-50 ${highContrast ? 'high-contrast' : ''}`}>
      <Header handleNav={handleNav} highContrast={highContrast} setHighContrast={setHighContrast} />
      <main>
        {currentPage === 'plataforma' && (
          <div className="scroll-container active">
            <Hero />
            <Quote />
            <LearningHub />
            <Footer />
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
            <Footer />
          </div>
        )}
        {currentPage === 'simulador' && (
          <div className="scroll-container active">
            <SimulatorSection />
            <Footer />
          </div>
        )}
      </main>
    </div>
  );
}