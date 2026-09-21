import React, { useState } from 'react';
import InteractiveBrailleCell from '../../../common/InteractiveBrailleCell';
import useBrailleKeyboard from '../../../../hooks/useBrailleKeyboard';
import useBrailleSound from '../../../../hooks/useBrailleSound';
import { useAudio } from '../../../../context/AudioContext';
import { NOTES } from '../../../../constants/soundConfig';

// Paso libre para conocer la celda: activa y desactiva puntos, sin nota ni
// verificación. Funciona con toque, con Tab + Espacio, y con el teclado tipo
// Perkins (F D S / J K L).
const LessonExplore = ({ instruction }) => {
    const [dots, setDots] = useState([false, false, false, false, false, false]);
    const { playNav } = useBrailleSound();
    const { isMuted, speak } = useAudio();

    const toggleDot = (idx) => {
        const next = [...dots];
        next[idx] = !next[idx];
        setDots(next);

        if (!isMuted) {
            playNav(NOTES.DOT_TOGGLE);
            speak(`Punto ${idx + 1} ${next[idx] ? 'activado' : 'desactivado'}`, true);
        }
    };

    useBrailleKeyboard(toggleDot, true);

    const active = dots.map((d, i) => (d ? i + 1 : null)).filter(Boolean);
    const summary =
        active.length === 0
            ? 'Todavía no hay puntos activos. Toca uno.'
            : active.length === 1
                ? `Punto activo: ${active[0]}.`
                : `Puntos activos: ${active.slice(0, -1).join(', ')} y ${active[active.length - 1]}.`;

    return (
        <div className="flex flex-col gap-7">
            <p className="text-xl leading-relaxed text-ink-soft md:text-[1.375rem]">{instruction}</p>

            <div className="card dots-grid flex justify-center px-4 py-8">
                <InteractiveBrailleCell dots={dots} onClick={toggleDot} size="huge" />
            </div>

            <p role="status" aria-live="polite" className="font-display text-2xl font-extrabold text-ink">
                {summary}
            </p>

            <p className="text-base text-ink-soft">
                <span className="kbd">F</span> <span className="kbd">D</span> <span className="kbd">S</span> son los puntos
                1, 2 y 3 · <span className="kbd">J</span> <span className="kbd">K</span> <span className="kbd">L</span> son
                el 4, 5 y 6
            </p>
        </div>
    );
};

export default LessonExplore;
