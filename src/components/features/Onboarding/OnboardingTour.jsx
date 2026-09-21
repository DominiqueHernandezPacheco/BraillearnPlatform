import React, { useState } from 'react';
import { useUser } from '../../../context/UserContext';
import useOnboardingTour from '../../../hooks/useOnboardingTour';
import Braulio from '../../common/Braulio';

const CARD_WIDTH = 320;

const OnboardingTour = () => {
    const { user, setUserName } = useUser();
    const [nameInput, setNameInput] = useState('');
    const { isActive, step, stepIndex, totalSteps, isLastStep, targetRect, next, prev, skip } = useOnboardingTour();

    // Paso 0: todavía no hay cuenta local en este dispositivo — la creamos primero
    if (!user) {
        return (
            <div
                className="fixed inset-0 z-[100] bg-ink/70 backdrop-blur-sm flex items-center justify-center px-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="onboarding-welcome-title"
            >
                <form
                    onSubmit={(e) => { e.preventDefault(); setUserName(nameInput); }}
                    className="card p-8 max-w-sm w-full text-center shadow-2xl onboarding-pop-in"
                >
                    <div aria-hidden="true" className="mb-3 flex justify-center">
                        <Braulio mood="wave" size={150} />
                    </div>
                    <h2 id="onboarding-welcome-title" className="font-display text-3xl font-black text-ink mb-2">
                        ¡Hola! Soy Braulio
                    </h2>
                    <p className="text-base text-ink-soft mb-6">
                        Te acompañaré mientras aprendes Braille. ¿Cómo te llamas? Así guardo tu progreso en este dispositivo.
                    </p>
                    <label htmlFor="onboarding-name" className="sr-only">Tu nombre</label>
                    <input
                        id="onboarding-name"
                        autoFocus
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Tu nombre"
                        className="input text-center mb-4"
                    />
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg btn-block"
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
            <div className="absolute inset-0 bg-ink/60 onboarding-fade-in" />

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
                className="card absolute p-5 shadow-2xl onboarding-pop-in"
                style={{ width: CARD_WIDTH, ...cardStyle }}
                aria-live="polite"
            >
                <div className="mb-3 flex items-center gap-3">
                    <span
                        aria-hidden="true"
                        className="flex h-12 w-12 shrink-0 items-end justify-center overflow-hidden rounded-full bg-brand-soft"
                    >
                        <Braulio variant="face" mood="idle" size={42} />
                    </span>
                    <p className="chip">Paso {stepIndex + 1} de {totalSteps}</p>
                </div>
                <h3 className="font-display text-xl font-extrabold text-ink mb-2">{step.title}</h3>
                <p className="text-base leading-snug text-ink-soft mb-5">{step.body}</p>

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <button onClick={skip} className="btn btn-ghost btn-sm shrink-0 px-3">
                        Saltar tour
                    </button>
                    <div className="flex gap-2">
                        {stepIndex > 0 && (
                            <button onClick={prev} className="btn btn-secondary btn-sm px-3">
                                Atrás
                            </button>
                        )}
                        <button onClick={next} className="btn btn-primary btn-sm">
                            {isLastStep ? 'Terminar' : 'Siguiente'}
                        </button>
                    </div>
                </div>

                <div className="flex justify-center items-center gap-1.5 mt-4" aria-hidden="true">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <span
                            key={i}
                            className={`h-2 rounded-full transition-all ${i === stepIndex ? 'w-5 bg-brand' : 'w-2 bg-line-strong'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
