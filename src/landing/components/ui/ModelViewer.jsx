import { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useCalmMotion } from '../../calmMotionContext';
import { useCopy } from '../../i18n/languageContext';

const BASE = import.meta.env.BASE_URL;

// Los .glb viven en public/models. BASE_URL mantiene la ruta correcta aunque el
// sitio no esté en la raíz del dominio.
const modelUrl = (file) => `${BASE}models/${file}`;

// <model-viewer> pesa bastante (incluye three.js): se descarga solo cuando algún
// visor está por aparecer en pantalla, y una sola vez para toda la página.
let viewerLoaded;
function loadViewer() {
    viewerLoaded ??= import('@google/model-viewer').then(({ ModelViewerElement }) => {
        // Los modelos de SolidWorks usan compresión Draco. Se decodifica con archivos
        // propios (public/draco) en lugar del CDN de Google.
        ModelViewerElement.dracoDecoderLocation = `${BASE}draco/gltf/`;
    });
    return viewerLoaded;
}

// Visor 3D: se gira arrastrando o con el teclado. Sin zoom (disable-zoom) para que
// la rueda del ratón no atrape el scroll de la página.
export default function ModelViewer({ file, alt, orbit = '35deg 70deg auto', className = '' }) {
    const t = useCopy().models;
    const calm = useCalmMotion();
    const boxRef = useRef(null);
    const near = useInView(boxRef, { once: true, margin: '400px' });
    const [status, setStatus] = useState('idle'); // idle → ready | failed

    useEffect(() => {
        if (!near) return;
        let alive = true;
        loadViewer().then(
            () => alive && setStatus('ready'),
            () => alive && setStatus('failed')
        );
        return () => {
            alive = false;
        };
    }, [near]);

    // Aviso "cargando" hasta que el modelo termine de procesarse.
    const [modelReady, setModelReady] = useState(false);
    const attach = useCallback((element) => {
        if (!element) return;
        element.addEventListener('load', () => setModelReady(true), { once: true });
        element.addEventListener('error', () => setStatus('failed'), { once: true });
    }, []);

    return (
        <div ref={boxRef} className={`relative ${className}`}>
            {status === 'ready' && (
                <model-viewer
                    ref={attach}
                    src={modelUrl(file)}
                    alt={alt}
                    camera-controls
                    disable-zoom
                    auto-rotate={!calm}
                    camera-orbit={orbit}
                    shadow-intensity="1"
                    shadow-softness="1"
                    environment-image="neutral"
                    className="size-full bg-transparent"
                />
            )}
            {status !== 'failed' && !modelReady && (
                <p role="status" className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                    {t.loading}
                </p>
            )}
            {status === 'failed' && (
                <p role="alert" className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-slate-500">
                    {t.error}
                </p>
            )}
        </div>
    );
}
