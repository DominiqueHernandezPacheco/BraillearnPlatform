import React, { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import useOnboardingTour from '../../../hooks/useOnboardingTour';

const CARD_WIDTH = 320;

const OnboardingTour = () => {
    const { user, setUserName } = useUser();
    const [nameInput, setNameInput] = useState('');
    const { isActive, step, stepIndex, totalSteps, isLastStep, targetRect, next, prev, skip } = useOnboardingTour();

    // Paso 0: todavía no hay cuenta local en este dispositivo — la creamos primero
    if (!user) {
        return (
            <div
                className="fixed inset-0 z-[100] bg-blue-900/80 backdrop-blur-sm flex items-center justify-center px-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="onboarding-welcome-title"
            >
                <form
                    onSubmit={(e) => { e.preventDefault(); setUserName(nameInput); }}
                    className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center onboarding-pop-in"
                >
                    <h2 id="onboarding-welcome-title" className="text-2xl font-bold text-gray-900 mb-2">
                        ¡Bienvenido a Braillearn!
                    </h2>
                    <p className="text-sm text-gray-600 mb-5">
                        ¿Cómo te llamas? Así guardamos tu progreso en este dispositivo.
                    </p>
                    <label htmlFor="onboarding-name" className="sr-only">Tu nombre</label>
                    <input
                        id="onboarding-name"
                        autoFocus
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Tu nombre"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-4 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="w-full px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Comenzar
                    </button>
                </form>
            </div>
        );
    }

    if (!isActive || !step) return null;

    const isCentered = !step.selector || !targetRect;

    // Posiciona la tarjeta cerca del elemento resaltado, sin salirse de la pantalla
    const cardStyle = isCentered
        ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        : {
            top: Math.min(targetRect.bottom + 16, window.innerHeight - 260),
            left: Math.min(Math.max(targetRect.left, 16), window.innerWidth - CARD_WIDTH - 16),
        };

    return (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Recorrido guiado de la plataforma">
            <div className="absolute inset-0 bg-gray-900/60 onboarding-fade-in" />

            {!isCentered && (
                <div
                    className="absolute rounded-xl onboarding-spotlight pointer-events-none"
                    style={{
                        top: targetRect.top - 8,
                        left: targetRect.left - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                    }}
                />
            )}

            <div
                className="absolute bg-white rounded-2xl shadow-2xl p-6 onboarding-pop-in"
                style={{ width: CARD_WIDTH, ...cardStyle }}
                aria-live="polite"
            >
                <p className="text-xs font-semibold text-blue-600 mb-1">Paso {stepIndex + 1} de {totalSteps}</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 mb-5">{step.body}</p>

                <div className="flex items-center justify-between gap-2">
                    <button onClick={skip} className="text-sm text-gray-500 hover:text-gray-700 underline shrink-0">
                        Saltar tour
                    </button>
                    <div className="flex gap-2">
                        {stepIndex > 0 && (
                            <button
                                onClick={prev}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Atrás
                            </button>
                        )}
                        <button
                            onClick={next}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                        >
                            {isLastStep ? 'Terminar' : 'Siguiente'}
                        </button>
                    </div>
                </div>

                <div className="flex justify-center gap-1.5 mt-4" aria-hidden="true">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === stepIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
