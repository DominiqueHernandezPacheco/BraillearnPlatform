import React from 'react';
import ReactDOM from 'react-dom/client';
import './fonts';
import App from './App';
import './index.css';
import { AudioProvider } from './context/AudioContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { UserProvider } from './context/UserContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    // AccessibilityProvider al exterior: aplica el fontScale en el <html>
    // antes de que AudioProvider o App se monten.
    <AccessibilityProvider>
        <AudioProvider>
            <UserProvider>
                <App />
            </UserProvider>
        </AudioProvider>
    </AccessibilityProvider>
);