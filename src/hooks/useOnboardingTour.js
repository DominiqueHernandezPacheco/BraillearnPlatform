import { useState, useEffect, useCallback } from 'react';
import { useAudio } from '../context/AudioContext';
import { useUser } from '../context/UserContext';

// selector: null = tarjeta centrada, sin resaltar nada
const STEPS = [
    {
        selector: null,
        title: '¡Hola! Soy Braulio',
        body: 'Te voy a mostrar la plataforma en unos pasos rápidos. Puedes saltarlo cuando quieras.',
    },
    {
        selector: '[data-tour="nav-cursos"]',
        title: 'Tus cursos',
        body: 'Aquí están tus lecciones de Braille, paso a paso: primero cómo funciona, después las letras y al final los retos.',
    },
    {
        selector: '[data-tour="nav-mensajes"]',
        title: 'Mensajes',
        body: 'Aquí un familiar puede escribir un mensaje y enviarlo al display Braille para que lo leas con los dedos.',
    },
    {
        selector: '[data-tour="learning-progress"]',
        title: 'Tu progreso',
        body: 'Aquí ves cuánto llevas y puedes continuar justo donde te quedaste.',
    },
    {
        selector: '[data-tour="a11y-button"]',
        title: 'Accesibilidad',
        body: 'Aquí ajustas el contraste, el tamaño de letra, la velocidad de mi voz y más, cuando lo necesites.',
    },
    {
        selector: null,
        title: 'Listo para empezar',
        body: 'Eso es todo. Y puedes hablarme cuando quieras: di "Braulio" y pídeme lo que necesites. Este recorrido lo puedes repetir desde Accesibilidad.',
    },
];

// Hay elementos con el mismo data-tour en el menú de escritorio y en la barra
// inferior de móvil; solo uno es visible a la vez, así que buscamos el visible.
const findVisible = (selector) =>
    [...document.querySelectorAll(selector)].find((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    }) ?? null;

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
        const el = findVisible(step.selector);
        // Si ninguno está visible, "sin objetivo": la tarjeta cae centrada en vez de mal ubicada.
        setTargetRect(el ? el.getBoundingClientRect() : null);
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
