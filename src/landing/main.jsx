import React from 'react';
import ReactDOM from 'react-dom/client';
import HomePage from './pages/HomePage';
import HistoriaPage from './pages/HistoriaPage';
import TecnologiaPage from './pages/TecnologiaPage';
import ComunidadPage from './pages/ComunidadPage';
import './landing.css';

// Cada .html declara su página en <div id="root" data-page="…">.
const pages = { home: HomePage, historia: HistoriaPage, tecnologia: TecnologiaPage, comunidad: ComunidadPage };

const root = document.getElementById('root');
const Page = pages[root.dataset.page] ?? HomePage;

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <Page />
    </React.StrictMode>
);
