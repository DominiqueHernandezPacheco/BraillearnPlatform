import React from 'react';
import Braulio from './Braulio';
import { useAudio } from '../../context/AudioContext';

// "Braulio te dice…": la voz guía de la plataforma. Frases cortas, en segunda
// persona y con calidez, para llevar de la mano a quien usa la plataforma.
// (El texto se puede leer con lector de pantalla; el avatar es decorativo.)
// El avatar mueve la boca mientras Braulio está hablando en voz alta.
const GuideNote = ({ children, label = 'Braulio', className = '', compact = false, mood }) => {
    const { isSpeaking } = useAudio() ?? {};
    const avatarSize = compact ? 44 : 56;

    return (
        <div className={`flex items-start gap-3.5 ${className}`}>
            <span
                aria-hidden="true"
                className="mt-0.5 flex shrink-0 items-end justify-center overflow-hidden rounded-full bg-brand-soft"
                style={{ width: avatarSize, height: avatarSize }}
            >
                <Braulio variant="face" mood={mood ?? (isSpeaking ? 'talking' : 'idle')} size={avatarSize * 0.86} />
            </span>
            <div className="min-w-0 rounded-3xl rounded-tl-lg border border-line bg-surface px-5 py-3.5 shadow-[0_10px_28px_-16px_rgba(13,27,54,0.25)]">
                <p className="font-display text-xs font-extrabold uppercase tracking-[0.12em] text-brand-strong">
                    {label}
                </p>
                <div className="mt-0.5 text-[1.0625rem] leading-snug text-ink-soft">{children}</div>
            </div>
        </div>
    );
};

export default GuideNote;
