import React, { useState, useEffect, useRef } from 'react';
import { braillePatterns } from '../../../constants/braillePatterns';
import TactileCell from '../../common/TactileCell';
import { Check, Star } from 'lucide-react';
import { shuffleArray } from '../../../utils/arrayHelpers';
// NUEVO: Importamos el servicio de conexión
import { brailleService } from '../../../utils/brailleService'; 

const COLS = 4;

const MemoryGame = ({ onComplete, playSuccess, playError, speakText, onExit }) => {
    const [cards, setCards]     = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [isLocked, setIsLocked] = useState(false);

    // Número de pares totales (se calcula al montar)
    const totalPairs = useRef(0);

    // ─── INICIALIZACIÓN ──────────────────────────────────────────────────────
    useEffect(() => {
        const items = ['a', 'e', 'i', 'o', 'u'];
        totalPairs.current = items.length;

        const deck = shuffleArray(
            items.flatMap((char, index) => [
                { id: `card-${index}-char`, val: char, type: 'char' },
                { id: `card-${index}-cell`, val: char, type: 'cell' }
            ])
        );

        setCards(deck);
        setFlipped([]);
        setMatched([]);
        setIsLocked(false);

        const rows = Math.ceil(deck.length / COLS);
        speakText(
            `Memorama de ${COLS} columnas por ${rows} filas, ${totalPairs.current} pares de vocales. ` +
            `Usa las flechas para moverte, Espacio o Enter para voltear una carta, ` +
            `y Escape para salir. ¡Encuentra todos los pares!`,
            true
        );

        // Enfoca la primera carta
        setTimeout(() => {
            const firstCard = document.querySelector('[data-card-index="0"]');
            if (firstCard) firstCard.focus();
        }, 600);
    }, []);

    // ─── LÓGICA DE PARES ─────────────────────────────────────────────────────
    useEffect(() => {
        if (flipped.length !== 2) return;

        setIsLocked(true);
        const timer = setTimeout(() => {
            const [idx1, idx2] = flipped;
            const card1 = cards[idx1];
            const card2 = cards[idx2];

            if (card1.val === card2.val) {
                const newMatched = [...matched, idx1, idx2];
                setMatched(newMatched);
                setFlipped([]);
                setIsLocked(false);
                playSuccess();

                const foundPairs  = newMatched.length / 2;
                const remaining   = totalPairs.current - foundPairs;

                if (remaining === 0) {
                    speakText('¡Felicitaciones! Encontraste todos los pares. ¡Excelente trabajo!', true);
                    setTimeout(onComplete, 1500);
                } else {
                    speakText(
                        `¡Pareja de la vocal ${card1.val.toUpperCase()} encontrada! ` +
                        `Llevas ${foundPairs} de ${totalPairs.current}. ` +
                        `${remaining} ${remaining === 1 ? 'par restante' : 'pares restantes'}.`,
                        false
                    );
                }
            } else {
                setFlipped([]);
                setIsLocked(false);
                playError();
                speakText('No son pareja. Intenta de nuevo.', false);
            }
        }, 1200);

        return () => clearTimeout(timer);
    }, [flipped, cards]);

   // ─── VOLTEAR CARTA ───────────────────────────────────────────────────────
    const handleCardClick = (index) => {
        if (isLocked || flipped.includes(index) || matched.includes(index)) return;
        if (flipped.length >= 2) return;

        setFlipped(prev => [...prev, index]);

        const card = cards[index];

        // NUEVO: Enviar la letra al hardware y loguear la respuesta de la API
        brailleService.sendText(card.val).then(respuesta => {
            console.log(`🤖 Memorama - Se envió la letra [ ${card.val.toUpperCase()} ] al display. Respuesta:`, respuesta);
        }).catch(error => {
            console.error(`🚨 Error al enviar la letra [ ${card.val.toUpperCase()} ]:`, error);
        });

        if (card.type === 'char') {
            speakText(`Letra ${card.val.toUpperCase()}`, true);
        } else {
            const dots = braillePatterns[card.val];
            const activeDots = dots
                .map((d, i) => d ? i + 1 : null)
                .filter(Boolean)
                .join(' y ');
            speakText(`Patrón Braille: puntos ${activeDots}`, true);
        }
    };

    // ─── NAVEGACIÓN CON TECLADO ──────────────────────────────────────────────
    const focusCard = (idx) => {
        const clampedIdx = Math.max(0, Math.min(idx, cards.length - 1));
        const card = document.querySelector(`[data-card-index="${clampedIdx}"]`);
        if (card) card.focus();
    };

    const handleCardKeyDown = (e, index) => {
        switch (e.key) {
            case ' ':
            case 'Enter':
                e.preventDefault();
                e.stopPropagation();
                handleCardClick(index);
                break;

            case 'ArrowRight':
                e.preventDefault();
                focusCard(index + 1);
                break;

            case 'ArrowLeft':
                e.preventDefault();
                focusCard(index - 1);
                break;

            case 'ArrowDown':
                e.preventDefault();
                focusCard(index + COLS);
                break;

            case 'ArrowUp':
                e.preventDefault();
                focusCard(index - COLS);
                break;

            case 'Escape':
                e.preventDefault();
                if (onExit) {
                    speakText('Saliendo del memorama.', true);
                    onExit();
                }
                break;

            default:
                break;
        }
    };

    // ─── RENDERIZADO ─────────────────────────────────────────────────────────
    const matchedPairs = matched.length / 2;

    return (
        <div className="flex flex-col items-center w-full">
            {/* Contador de progreso — visible y leído por lectores de pantalla */}
            <p
                aria-live="polite"
                aria-atomic="true"
                className="chip chip-quiet mb-5 text-base"
            >
                <Star size={16} aria-hidden="true" />
                {matchedPairs} de {totalPairs.current} pares encontrados
            </p>

            <div
                className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-lg mx-auto px-1"
                role="grid"
                aria-label={`Tablero de Memorama. ${matchedPairs} de ${totalPairs.current} pares encontrados.`}
            >
                {cards.map((card, index) => {
                    const isFlipped  = flipped.includes(index) || matched.includes(index);
                    const isMatched  = matched.includes(index);
                    const ariaLabel  = isFlipped
                        ? (card.type === 'char'
                            ? `Letra ${card.val.toUpperCase()}${isMatched ? ', encontrada' : ''}`
                            : `Patrón Braille de la vocal ${card.val.toUpperCase()}${isMatched ? ', encontrada' : ''}`)
                        : `Carta oculta ${index + 1} de ${cards.length}`;

                    return (
                        <div
                            key={card.id}
                            data-card-index={index}
                            onClick={() => handleCardClick(index)}
                            onKeyDown={(e) => handleCardKeyDown(e, index)}
                            className={`relative aspect-square w-full rounded-2xl mb-1
                                ${isMatched ? 'cursor-default' : 'cursor-pointer'}`}
                            style={{ perspective: '1000px' }}
                            role="button"
                            tabIndex={0}
                            aria-label={ariaLabel}
                            aria-pressed={isFlipped}
                            aria-disabled={isMatched}
                        >
                            <div
                                style={{
                                    width: '100%', height: '100%', position: 'relative',
                                    transition: 'transform 0.5s',
                                    transformStyle: 'preserve-3d',
                                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                }}
                            >
                                {/* Cara oculta: azul de marca con una celda Braille de adorno */}
                                <div
                                    className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-brand-strong bg-brand text-on-brand shadow-[0_4px_0_var(--brand-strong)]"
                                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                                    aria-hidden="true"
                                >
                                    <svg viewBox="0 0 40 60" className="h-[58%] w-auto" focusable="false">
                                        {[0, 1, 2, 3, 4, 5].map((d) => (
                                            <circle
                                                key={d}
                                                cx={d < 3 ? 10 : 30}
                                                cy={10 + (d % 3) * 20}
                                                r="6"
                                                fill="currentColor"
                                                opacity={[0, 4, 5].includes(d) ? 0.85 : 0.3}
                                            />
                                        ))}
                                    </svg>
                                </div>

                                {/* Cara visible */}
                                <div
                                    className={`absolute inset-0 flex items-center justify-center rounded-2xl border-2 ${
                                        isMatched
                                            ? 'border-good bg-good-soft shadow-[0_4px_0_var(--good)]'
                                            : 'border-line-strong bg-surface shadow-[0_4px_0_var(--line-strong)]'
                                    }`}
                                    style={{
                                        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                                        transform: 'rotateY(180deg)'
                                    }}
                                    aria-hidden="true"
                                >
                                    {card.type === 'cell' ? (
                                        <div className="pointer-events-none flex h-full w-full items-center justify-center">
                                            <TactileCell
                                                dots={braillePatterns[card.val]}
                                                decorative
                                                className="h-[62%] w-auto"
                                            />
                                        </div>
                                    ) : (
                                        <span className="font-display text-4xl sm:text-5xl font-black uppercase text-ink">
                                            {card.val}
                                        </span>
                                    )}

                                    {isMatched && (
                                        <span className="pop absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-good text-surface">
                                            <Check size={16} strokeWidth={3.5} aria-hidden="true" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Instrucciones de teclado */}
            <p className="mt-5 text-sm text-ink-soft text-center">
                Flechas para navegar · Espacio/Enter para voltear · Escape para salir
            </p>
        </div>
    );
};

export default MemoryGame;
