import React, { useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { braillePatterns } from '../../../../constants/braillePatterns';
import TactileCell from '../../../common/TactileCell';
import useBrailleSound from '../../../../hooks/useBrailleSound';
import { useAudio } from '../../../../context/AudioContext';
import { brailleService } from '../../../../utils/brailleService';

const LessonVowel = ({ char, visualDesc, patternExp }) => {
    const { playPattern } = useBrailleSound();
    const { isMuted } = useAudio();
    const dots = braillePatterns[char];

    // Envía la letra al display físico automáticamente
    useEffect(() => {
        if (char) {
            brailleService.sendText(char).then((respuesta) => {
                console.log(`La API respondió para la letra ${char}:`, respuesta);
            });
        }
    }, [char]);

    const play = () => {
        if (!isMuted) {
            playPattern(dots, char);
        }
    };

    // Atajo: barra espaciadora reproduce el ritmo (salvo que el foco esté en un botón/campo)
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== ' ') return;
            const tag = document.activeElement?.tagName;
            if (['BUTTON', 'INPUT', 'TEXTAREA', 'A', 'SELECT'].includes(tag)) return;
            e.preventDefault();
            play();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [char, isMuted]);

    return (
        <div className="flex flex-col gap-6">
            <div className="card dots-grid flex flex-col items-center gap-3 px-6 py-6">
                <TactileCell
                    dots={dots}
                    size={170}
                    showNumbers
                    label={`Letra ${char.toUpperCase()}. ${patternExp}`}
                />
                <p aria-hidden="true" className="font-display text-5xl font-black text-brand-strong">
                    {char.toUpperCase()}
                </p>
            </div>

            <div>
                <p className="text-2xl font-bold leading-snug text-ink">{visualDesc}</p>
                <p className="mt-1 text-xl text-ink-soft">{patternExp}</p>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <button
                    type="button"
                    onClick={play}
                    className="btn btn-blue btn-lg"
                    aria-label={`Escuchar el ritmo de la letra ${char}. Atajo: barra espaciadora.`}
                >
                    <Volume2 className="h-6 w-6" aria-hidden="true" />
                    Escuchar el ritmo
                </button>
                <p className="text-lg text-ink-soft">
                    <span className="kbd">Espacio</span> para reproducir
                </p>
            </div>
        </div>
    );
};

export default LessonVowel;
