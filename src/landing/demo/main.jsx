import { isStorageIsolated } from './isolateStorage'; // debe ir primero: aísla localStorage antes de cargar la app
import React from 'react';
import ReactDOM from 'react-dom/client';
import '../../fonts';
import '../../index.css';
import { AccessibilityProvider } from '../../context/AccessibilityContext';
import { AudioProvider } from '../../context/AudioContext';
import { UserProvider } from '../../context/UserContext';
import PlatformPreview from './PlatformPreview';

// La plataforma real siempre saluda por el nombre que el estudiante escribió al
// empezar. En la vista previa no hay estudiante, así que saluda como Braulio (la
// misma clave que usa UserContext). Se escribe solo en la copia en memoria: si el
// aislamiento falló, no se monta UserProvider para no pisar el usuario real.
const isolated = isStorageIsolated();
if (isolated) {
    localStorage.setItem('braillearn_user', JSON.stringify({ id: 'demo', name: 'Braulio' }));
}

// Sin OnboardingTour, panel de accesibilidad ni asistente de voz: la vista previa
// solo muestra la página principal.
const preview = <PlatformPreview />;

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AccessibilityProvider>
            <AudioProvider>{isolated ? <UserProvider>{preview}</UserProvider> : preview}</AudioProvider>
        </AccessibilityProvider>
    </React.StrictMode>
);
