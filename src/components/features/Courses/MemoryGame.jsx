import React, { useState, useEffect } from 'react';
import { braillePatterns } from '../../../constants/braillePatterns';
import BrailleCell from '../../common/BrailleCell';

const MemoryGame = ({ onComplete, playSuccess, playError, speakText }) => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        const items = ['a', 'e', 'i', 'o', 'u'];
        const deck = items.flatMap((char, index) => [
            { id: `card-${index}-char`, val: char, type: 'char' },
            { id: `card-${index}-cell`, val: char, type: 'cell' }
        ]).sort(() => Math.random() - 0.5);
        
        setCards(deck);
        setFlipped([]);
        setMatched([]);
        setIsLocked(false);
    }, []);

    useEffect(() => {
        if (flipped.length === 2) {
            setIsLocked(true);
            
            // El timeout aquí es visual, pero el audio se maneja en la lógica de abajo
            const timer = setTimeout(() => {
                const [idx1, idx2] = flipped;
                const card1 = cards[idx1];
                const card2 = cards[idx2];

                if (card1.val === card2.val) {
                    setMatched(prev => [...prev, idx1, idx2]);
                    setFlipped([]);
                    setIsLocked(false);
                    playSuccess();
                    
                    // IMPORTANTE: interrupt = false para que NO corte la lectura de la carta
                    speakText(`¡Pareja de vocales ${card1.val.toUpperCase()} encontrada! Muy bien.`, false);
                    
                    if (matched.length + 2 === cards.length) {
                        setTimeout(onComplete, 2000);
                    }
                } else {
                    setFlipped([]);
                    setIsLocked(false);
                    playError();
                    // IMPORTANTE: interrupt = false
                    speakText("No son pareja. Intenta de nuevo.", false);
                }
            }, 1500); // Esperamos a que termine de leer visualmente

            return () => clearTimeout(timer);
        }
    }, [flipped, cards]);

    const handleCardClick = (index) => {
        if (isLocked || flipped.includes(index) || matched.includes(index)) return;
        setFlipped(prev => [...prev, index]);
        
        const card = cards[index];
        // Al tocar una carta, SÍ queremos interrumpir cualquier cosa anterior para oír ESTA carta
        if (card.type === 'char') {
            speakText(`Letra ${card.val.toUpperCase()}`, true);
        } else {
            const dots = braillePatterns[card.val];
            const activeDots = dots.map((d, i) => d ? i + 1 : null).filter(Boolean).join(' y ');
            speakText(`Patrón de puntos ${activeDots}`, true);
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick(index);
        }
    };

    return (
        <div className="grid grid-cols-4 gap-3 w-full max-w-md mx-auto mt-6" role="grid" aria-label="Tablero de Memorama">
            {cards.map((card, index) => {
                const isFlipped = flipped.includes(index) || matched.includes(index);
                const ariaLabel = isFlipped 
                    ? (card.type === 'char' ? `Letra ${card.val}` : `Patrón Braille ${card.val}`)
                    : `Carta oculta ${index + 1}`;

                return (
                    <div 
                        key={card.id} 
                        onClick={() => handleCardClick(index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="aspect-square cursor-pointer relative h-24 w-24 focus:outline-none focus:ring-4 focus:ring-yellow-400 rounded-xl"
                        style={{ perspective: '1000px' }}
                        role="button"
                        tabIndex={0}
                        aria-label={ariaLabel}
                        aria-pressed={isFlipped}
                    >
                        <div 
                            style={{ 
                                width: '100%', height: '100%', position: 'relative',
                                transition: 'transform 0.6s', transformStyle: 'preserve-3d',
                                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
                            }}
                        >
                            <div 
                                className="absolute inset-0 bg-blue-600 rounded-xl shadow-md flex items-center justify-center border-2 border-blue-800"
                                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                                aria-hidden="true"
                            >
                                <span className="text-white font-bold text-2xl">?</span>
                            </div>
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
                                        <BrailleCell dots={braillePatterns[card.val]} isInteractive={false} size="normal"/>
                                    </div>
                                ) : (
                                    <span className="text-4xl font-bold text-gray-800 uppercase">{card.val}</span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
export default MemoryGame;