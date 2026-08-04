import { useState, useEffect, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';
import { useUser } from '../context/UserContext';

// selector: null = tarjeta centrada, sin resaltar nada
const STEPS = [
    {
        selector: null,
        title: '¡Hola! Bienvenido a Braillearn',
        body: 'Te voy a mostrar las zonas principales de la plataforma en 5 pasos rápidos. Puedes saltarlo cuando quieras.',
    },
    {
        selector: '[data-tour="nav-cursos"]',
        title: 'Tus cursos',
        body: 'Aquí están tus lecciones de Braille, organizadas paso a paso desde el abecedario hasta ejercicios más avanzados.',
    },
    {
        selector: '[data-tour="nav-simulador"]',
        title: 'Simulador de Braille',
        body: 'Aquí puedes escribir cualquier texto y sentir, con sonido, cómo se arma cada celda Braille.',
    },
    {
        selector: '[data-tour="learning-progress"]',
        title: 'Tu progreso',
        body: 'Aquí ves cuánto llevas avanzado y puedes continuar justo donde te quedaste.',
    },
    {
        selector: '[data-tour="a11y-button"]',
        title: 'Panel de accesibilidad',
        body: 'Aquí ajustas el contraste, el tamaño de letra, la velocidad de voz y más, cuando lo necesites.',
    },
    {
        selector: null,
        title: 'Listo para empezar',
        body: 'Eso es todo. Puedes volver a ver este recorrido desde el panel de accesibilidad cuando quieras.',
    },
];

const useOnboardingTour = () => {
    const { user, hasCompletedOnboarding, completeOnboarding } = useUser();
    const { speak } = useAudio();

    const [stepIndex, setStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState(null);

    const isActive = !!user && !hasCompletedOnboarding;
    const step = STEPS[stepIndex];
    const isLastStep = stepIndex === STEPS.length - 1;

    // Reinicia al paso 1 cada vez que el tour se activa (primera vez, o al reabrirlo
    // desde "Ver el recorrido guiado de nuevo" en el panel de accesibilidad)
    useEffect(() => {
        if (isActive) setStepIndex(0);
    }, [isActive]);

    // Recalcula la posición del elemento a resaltar en cada paso
    const updateRect = useCallback(() => {
        if (!step?.selector) {
            setTargetRect(null);
            return;
        }
        const el = document.querySelector(step.selector);
        const rect = el ? el.getBoundingClientRect() : null;
        // Si el elemento está oculto (p. ej. nav de escritorio en vista móvil), mide 0x0 —
        // lo tratamos como "sin objetivo" para que la tarjeta caiga centrada en vez de mal ubicada.
        setTargetRect(rect && rect.width > 0 && rect.height > 0 ? rect : null);
    }, [step]);

    useEffect(() => {
        if (!isActive) return;
        updateRect();
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, true);
        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, [isActive, updateRect]);

    // Narra cada paso en voz alta al mostrarse (respeta el mute del AudioContext)
    useEffect(() => {
        if (!isActive) return;
        speak(`${step.title}. ${step.body}`, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, stepIndex]);

    const next = () => {
        if (isLastStep) {
            completeOnboarding();
            return;
        }
        setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
    };

    const prev = () => setStepIndex(i => Math.max(i - 1, 0));

    const skip = () => {
        window.speechSynthesis.cancel();
        completeOnboarding();
    };

    // Atajos de teclado: Escape salta el tour, flechas avanzan/retroceden
    useEffect(() => {
        if (!isActive) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') skip();
            if (e.key === 'ArrowRight' || e.key === 'Enter') next();
            if (e.key === 'ArrowLeft') prev();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, stepIndex]);

    return {
        isActive,
        step,
        stepIndex,
        totalSteps: STEPS.length,
        isLastStep,
        targetRect,
        next,
        prev,
        skip,
    };
};

export default useOnboardingTour;
