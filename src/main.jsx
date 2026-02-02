import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AudioProvider } from './context/AudioContext'; // <--- Importar

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AudioProvider> {/* <--- Envolver la App */}
      <App />
    </AudioProvider>
  </React.StrictMode>,
);