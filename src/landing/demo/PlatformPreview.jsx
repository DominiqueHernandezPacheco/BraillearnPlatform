import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../../components/layout/Header';
import Hero from '../../components/sections/Hero';
import Quote from '../../components/sections/Quote';
import LearningHub from '../../components/sections/LearningHub';
import { useAccessibility } from '../../context/AccessibilityContext';

// Todo lo que sea clicable (enlaces, botones, interruptores) queda bloqueado y
// solo muestra un aviso: la vista previa es la página principal, sin navegar.
const CLICKABLE = 'a, button, [role="button"], [role="switch"], summary';

// Vista previa de la página principal de la plataforma, la misma que ve quien la abre.
export default function PlatformPreview() {
    const { highContrast } = useAccessibility();
    const [nudge, setNudge] = useState(false);
    const timer = useRef(null);
    const noop = useCallback(() => {}, []);

    useEffect(() => {
        const block = (event) => {
            const target = event.target instanceof Element ? event.target.closest(CLICKABLE) : null;
            if (!target || target.hasAttribute('data-preview-link')) return;
            event.preventDefault();
            event.stopPropagation(); // que la app no llegue a reaccionar
            setNudge(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setNudge(false), 1400);
        };
        // En captura: se ejecuta antes que los manejadores de React.
        document.addEventListener('click', block, true);
        return () => {
            document.removeEventListener('click', block, true);
            clearTimeout(timer.current);
        };
    }, []);

    return (
        <div className={`font-sans bg-gray-50 ${highContrast ? 'high-contrast' : ''}`}>
            <Header handleNav={noop} onOpenPanel={noop} isPanelOpen={false} />

            <main>
                <div className="scroll-container active">
                    <Hero />
                    <Quote />
                    <LearningHub onNavigateToCourses={noop} />
                </div>
            </main>

            <div
                role="status"
                className={`fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-gray-900/90 px-5 py-2.5 text-sm text-white shadow-lg backdrop-blur transition-all duration-300 ${
                    nudge ? 'ring-4 ring-yellow-300' : ''
                }`}
            >
                <span>Vista previa de la página principal</span>
                <a
                    data-preview-link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-yellow-300 underline underline-offset-4 hover:text-yellow-200"
                >
                    Abrir la plataforma
                </a>
            </div>
        </div>
    );
}
