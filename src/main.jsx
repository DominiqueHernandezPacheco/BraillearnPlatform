import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Importamos los estilos globales aquí para asegurar que se carguen en toda la app.
// Asegúrate de que tu archivo index.css esté en la carpeta src (src/index.css)
// Si decidiste guardarlo en assets, cambia la ruta a: './assets/styles/index.css'
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);