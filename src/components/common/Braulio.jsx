import React, { useEffect, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';

// Braulio, la mascota-mentor: un cuerpo redondeado azul con la celda de la "b"
// en la panza (puntos 1 y 2 en amarillo, igual que el logo).
//
// mood:
//   idle       en reposo, respira y parpadea
//   wave       saluda con la mano
//   talking    mueve la boca (cuando está hablando en voz alta)
//   listening  ojos grandes y ondas de sonido
//   thinking   mira hacia arriba, con puntos de "pensando"
//   happy      ojos felices y un saltito (acierto)
//   oops       cejas de ánimo, ladeado (error: "casi")
//   celebrate  brazos arriba, saltos y confeti
//
// variant: "full" (cuerpo entero) | "face" (solo la cara, para avatares)
//
// Es decorativo: los textos y controles a su alrededor llevan el significado
// (aria-hidden), así que no añade ruido para el lector de pantalla.

const INK = '#0d1b36';
const PLATE = '#f3f7ff';
const BLUSH = '#ffb4a8';

const Braulio = ({ mood = 'idle', size = 160, variant = 'full', look = true, className = '' }) => {
    const eyesRef = useRef(null);
    const svgRef = useRef(null);
    const reduceMotion = useAccessibility()?.reduceMotion;
    const face = variant === 'face';
    const canLook = look && !reduceMotion && mood !== 'thinking' && mood !== 'happy' && mood !== 'celebrate';

    // Los ojos siguen el puntero (solo con ratón; con pantalla táctil no tiene sentido).
    useEffect(() => {
        const eyes = eyesRef.current;
        if (!canLook || !eyes || !window.matchMedia?.('(pointer: fine)').matches) {
            if (eyes) eyes.style.transform = '';
            return undefined;
        }
        let frame = 0;
        const onMove = (e) => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const box = svgRef.current?.getBoundingClientRect();
                if (!box) return;
                const dx = e.clientX - (box.left + box.width / 2);
                const dy = e.clientY - (box.top + box.height / 2);
                const k = Math.min(1, Math.hypot(dx, dy) / 280);
                const angle = Math.atan2(dy, dx);
                eyes.style.transform = `translate(${(Math.cos(angle) * k * 6).toFixed(2)}px, ${(Math.sin(angle) * k * 5).toFixed(2)}px)`;
            });
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => {
            window.removeEventListener('pointermove', onMove);
            cancelAnimationFrame(frame);
            eyes.style.transform = '';
        };
    }, [canLook]);

    const happyEyes = mood === 'happy' || mood === 'celebrate';
    const wide = mood === 'listening';
    const armsUp = mood === 'celebrate';
    const armL = armsUp ? 150 : mood === 'happy' ? 60 : 12;
    const armR = armsUp ? -150 : mood === 'wave' ? -138 : mood === 'happy' ? -60 : -12;

    const viewBox = face ? '22 44 156 118' : '0 0 200 216';
    const [, , vw, vh] = viewBox.split(' ').map(Number);

    return (
        <svg
            ref={svgRef}
            viewBox={viewBox}
            width={(size * vw) / vh}
            height={size}
            className={`braulio braulio--${mood} ${className}`}
            aria-hidden="true"
            focusable="false"
        >
            {!face && <ellipse cx="100" cy="206" rx="58" ry="8" fill={INK} opacity="0.1" />}

            {mood === 'listening' && !face && (
                <g fill="none" stroke="var(--sun)" strokeWidth="5" strokeLinecap="round">
                    <path className="braulio-wave braulio-wave--1" d="M14 86 Q6 104 14 122" />
                    <path className="braulio-wave braulio-wave--2" d="M2 76 Q-10 104 2 132" />
                    <path className="braulio-wave braulio-wave--1" d="M186 86 Q194 104 186 122" />
                    <path className="braulio-wave braulio-wave--2" d="M198 76 Q210 104 198 132" />
                </g>
            )}

            <g className="braulio-figure">
                {!face && (
                    <>
                        {/* Brazos: van detrás del cuerpo */}
                        <g className="braulio-arm-l">
                            <rect x="14" y="108" width="22" height="50" rx="11" fill="var(--brand-strong)" transform={`rotate(${armL} 34 114)`} />
                        </g>
                        <g className="braulio-arm-r">
                            <rect x="164" y="108" width="22" height="50" rx="11" fill="var(--brand-strong)" transform={`rotate(${armR} 166 114)`} />
                        </g>
                        {/* Pies */}
                        <rect x="58" y="184" width="36" height="18" rx="9" fill="var(--brand-strong)" />
                        <rect x="106" y="184" width="36" height="18" rx="9" fill="var(--brand-strong)" />
                    </>
                )}

                {/* Cuerpo, con la "repisa" inferior de los botones */}
                <rect x="30" y="47" width="140" height="150" rx="54" fill="var(--brand-strong)" />
                <rect x="30" y="40" width="140" height="150" rx="54" fill="var(--brand)" />
                <ellipse cx="66" cy="62" rx="22" ry="9" fill="#ffffff" opacity="0.22" transform="rotate(-24 66 62)" />

                {/* Cara */}
                <rect x="46" y="66" width="108" height="76" rx="38" fill={PLATE} />
                <ellipse cx="62" cy="118" rx="8" ry="5.5" fill={BLUSH} opacity="0.6" />
                <ellipse cx="138" cy="118" rx="8" ry="5.5" fill={BLUSH} opacity="0.6" />

                {/* Cejas de ánimo */}
                {mood === 'oops' && (
                    <g stroke={INK} strokeWidth="4.5" strokeLinecap="round">
                        <path d="M67 84 L88 77" />
                        <path d="M133 84 L112 77" />
                    </g>
                )}

                {/* Ojos */}
                <g ref={eyesRef} className={`braulio-eyes ${mood === 'thinking' ? 'braulio-eyes--up' : ''}`}>
                    {happyEyes ? (
                        <g fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round">
                            <path d="M68 102 Q78 88 88 102" />
                            <path d="M112 102 Q122 88 132 102" />
                        </g>
                    ) : (
                        <g className="braulio-blink">
                            <ellipse cx="78" cy="98" rx={wide ? 10.5 : 9} ry={wide ? 13 : 11} fill={INK} />
                            <ellipse cx="122" cy="98" rx={wide ? 10.5 : 9} ry={wide ? 13 : 11} fill={INK} />
                            <circle cx="74.5" cy="93.5" r="3.2" fill="#ffffff" />
                            <circle cx="118.5" cy="93.5" r="3.2" fill="#ffffff" />
                        </g>
                    )}
                </g>

                {/* Boca */}
                {mood === 'talking' && (
                    <g className="braulio-mouth-talk">
                        <ellipse cx="100" cy="120" rx="9" ry="8" fill={INK} />
                        <ellipse cx="100" cy="125" rx="5" ry="3" fill="#ff8d9c" />
                    </g>
                )}
                {(mood === 'happy' || mood === 'celebrate') && (
                    <g>
                        <path d="M86 110 Q100 136 114 110 Z" fill={INK} />
                        <ellipse cx="100" cy="123" rx="6" ry="3.4" fill="#ff8d9c" />
                    </g>
                )}
                {mood === 'listening' && <ellipse cx="100" cy="120" rx="5.5" ry="7" fill={INK} />}
                {mood === 'thinking' && (
                    <path d="M90 119 Q95 115 100 119 T110 119" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
                )}
                {mood === 'oops' && (
                    <path d="M90 121 Q100 114 110 121" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
                )}
                {(mood === 'idle' || mood === 'wave') && (
                    <path d="M88 113 Q100 126 112 113" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
                )}

                {/* La "b" de Braulio: puntos 1 y 2 en amarillo */}
                {!face && (
                    <g>
                        <circle cx="91" cy="156" r="4.8" fill="var(--sun)" />
                        <circle cx="91" cy="168" r="4.8" fill="var(--sun)" />
                        <circle cx="91" cy="180" r="4.8" fill="#ffffff" opacity="0.38" />
                        <circle cx="109" cy="156" r="4.8" fill="#ffffff" opacity="0.38" />
                        <circle cx="109" cy="168" r="4.8" fill="#ffffff" opacity="0.38" />
                        <circle cx="109" cy="180" r="4.8" fill="#ffffff" opacity="0.38" />
                    </g>
                )}
            </g>

            {mood === 'thinking' && !face && (
                <g fill="var(--sun)">
                    <circle className="braulio-think braulio-think--1" cx="146" cy="30" r="3.5" />
                    <circle className="braulio-think braulio-think--2" cx="160" cy="20" r="5" />
                    <circle className="braulio-think braulio-think--3" cx="178" cy="8" r="7" />
                </g>
            )}

            {mood === 'celebrate' && !face && (
                <g>
                    <circle className="braulio-confetti" style={{ '--d': '0ms' }} cx="26" cy="34" r="5" fill="var(--sun)" />
                    <rect className="braulio-confetti" style={{ '--d': '120ms' }} x="168" y="26" width="9" height="9" rx="2" fill="var(--good)" />
                    <circle className="braulio-confetti" style={{ '--d': '240ms' }} cx="10" cy="90" r="4" fill="var(--brand)" />
                    <rect className="braulio-confetti" style={{ '--d': '360ms' }} x="182" y="84" width="8" height="8" rx="2" fill="var(--sun)" />
                    <circle className="braulio-confetti" style={{ '--d': '180ms' }} cx="56" cy="12" r="4" fill="var(--good)" />
                    <circle className="braulio-confetti" style={{ '--d': '300ms' }} cx="146" cy="8" r="5" fill="var(--brand)" />
                    <rect className="braulio-confetti" style={{ '--d': '60ms' }} x="96" y="2" width="8" height="8" rx="2" fill="var(--sun)" />
                </g>
            )}
        </svg>
    );
};

export default Braulio;
