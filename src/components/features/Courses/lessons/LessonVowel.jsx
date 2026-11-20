import React, { useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { braillePatterns } from '../../../../constants/braillePatterns';
import TactileCell from '../../../common/TactileCell';
import useBrailleSound from '../../../../hooks/useBrailleSound';
import useShiftDoubleTap from '../../../../hooks/useShiftDoubleTap';
import { brailleService } from '../../../../utils/brailleService';
import { useAccessibility } from '../../../../context/AccessibilityContext';

const DOT_LEGEND_SEEN_KEY = 'braillearn_dot_legend_seen';

const LessonVowel = ({ char, visualDesc, patternExp }) => {
    const { playPattern, playDotLegend } = useBrailleSound();
    const { briefNarration } = useAccessibility() ?? {};
    const dots = braillePatterns[char];

    // Envía la letra al display físico automáticamente
    useEffect(() => {
        if (char) {
            brailleService.sendText(char).then((respuesta) => {
                console.log(`La API respondió para la letra ${char}:`, respuesta);
            });
        }
    }, [char]);

    // playPattern ya decide solo si suena (ajuste de efectos de sonido)
    const play = () => playPattern(dots, char);

    // La primerísima vez que alguien ve una letra, antes del patrón completo
    // le enseñamos a distinguir los dos sonidos base (punto arriba/abajo) —
    // solo una vez en la vida de la app, para no repetirlo en cada letra. Con
    // "Narración breve" no se dice sola (queda el botón y el doble Shift).
    useEffect(() => {
        if (briefNarration || localStorage.getItem(DOT_LEGEND_SEEN_KEY)) return;
        localStorage.setItem(DOT_LEGEND_SEEN_KEY, '1');
        playDotLegend().then(() => play());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
    }, [char]);

    // Atajo: doble toque rápido a Shift repite la explicación de los sonidos —
    // sin esto alguien que no ve la pantalla no tiene forma de volver a
    // escucharla por su cuenta (y a diferencia de una tecla de símbolo, Shift
    // se encuentra al tacto sin necesitar ver el teclado).
    useShiftDoubleTap(playDotLegend);

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
                    <span className="kbd">Espacio</span> para reproducir · doble toque a{' '}
                    <span className="kbd">Shift</span> cómo suenan los puntos
                </p>
                <button
                    type="button"
                    onClick={playDotLegend}
                    className="text-lg font-semibold text-ink-soft underline underline-offset-2"
                    aria-label="Escuchar cómo suena un punto arriba y uno abajo. Atajo: doble toque rápido a la tecla Shift."
                >
                    ¿Cómo suenan los puntos?
                </button>
            </div>
        </div>
    );
};

export default LessonVowel;
