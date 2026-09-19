import './isolateStorage'; // debe ir primero: aísla localStorage antes de cargar la app
import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../index.css';
import { AccessibilityProvider } from '../../context/AccessibilityContext';
import { AudioProvider } from '../../context/AudioContext';
import PlatformPreview from './PlatformPreview';

// Sin UserProvider, OnboardingTour, panel de accesibilidad ni asistente de voz:
// la vista previa solo muestra la página principal.
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AccessibilityProvider>
            <AudioProvider>
                <PlatformPreview />
            </AudioProvider>
        </AccessibilityProvider>
    </React.StrictMode>
);
