import React, { useState, useEffect, useRef } from 'react';
import { braillePatterns } from '../../../constants/braillePatterns';
import BrailleCell from '../../common/BrailleCell';
import { shuffleArray } from '../../../utils/arrayHelpers';

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
                className="mb-4 text-sm font-semibold text-gray-500"
            >
                {matchedPairs} de {totalPairs.current} pares encontrados
            </p>

            <div
                className="grid grid-cols-4 gap-3 w-full max-w-md mx-auto"
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
                            className={`aspect-square cursor-pointer relative h-24 w-24 rounded-xl
                                focus:outline-none focus:ring-4 focus:ring-yellow-400
                                ${isMatched ? 'opacity-60' : ''}`}
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
                                {/* Cara oculta */}
                                <div
                                    className="absolute inset-0 bg-blue-600 rounded-xl shadow-md flex items-center justify-center border-2 border-blue-800"
                                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                                    aria-hidden="true"
                                >
                                    <span className="text-white font-bold text-2xl">?</span>
                                </div>

                                {/* Cara visible */}
                                <div
                                    className="absolute inset-0 bg-white rounded-xl shadow-md flex items-center justify-center border-2 border-blue-200"
                                    style={{
                                        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                                        transform: 'rotateY(180deg)'
                                    }}
                                    aria-hidden="true"
                                >
                                    {card.type === 'cell' ? (
                                        <div className="transform scale-75 pointer-events-none">
                                            <BrailleCell
                                                dots={braillePatterns[card.val]}
                                                isInteractive={false}
                                                size="normal"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-4xl font-bold text-gray-800 uppercase">
                                            {card.val}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Instrucciones de teclado */}
            <p className="mt-4 text-xs text-gray-400 text-center">
                Flechas para navegar · Espacio/Enter para voltear · Escape para salir
            </p>
        </div>
    );
};

export default MemoryGame;
