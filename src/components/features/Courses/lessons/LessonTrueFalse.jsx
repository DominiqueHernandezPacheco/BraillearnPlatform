import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { braillePatterns } from '../../../../constants/braillePatterns';
import TactileCell from '../../../common/TactileCell';
import { brailleService } from '../../../../utils/brailleService';

const LessonTrueFalse = ({ lesson, onVerify }) => {

    // Enviar el patrón al hardware en cuanto cargue la pregunta
    useEffect(() => {
        if (lesson && lesson.displayChar) {
            brailleService.sendText(lesson.displayChar).then(respuesta => {
                console.log(`True/False - Reto enviado [ ${lesson.displayChar.toUpperCase()} ]. Respuesta:`, respuesta);
            }).catch(error => {
                console.error(`Error al enviar el reto [ ${lesson.displayChar.toUpperCase()} ]:`, error);
            });
        }
    }, [lesson]);

    const handleChoice = (choice) => {
        const isCorrect   = choice === lesson.isCorrect;
        const description = `Elegiste ${choice ? 'Verdadero' : 'Falso'}.`;

        // Retroalimentación física en el display (SI/NO)
        const feedbackFisico = isCorrect ? "SI" : "NO";
        brailleService.sendText(feedbackFisico).then(respuesta => {
            console.log(`True/False - Feedback enviado [ ${feedbackFisico} ]. Respuesta:`, respuesta);
        }).catch(error => {
            console.error(`Error al enviar feedback [ ${feedbackFisico} ]:`, error);
        });

        onVerify(isCorrect, description);
    };

    // Atajos de teclado:  V o 1 → Verdadero · F o 2 → Falso
    useEffect(() => {
        const handleKey = (e) => {
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            const key = e.key.toLowerCase();
            if (key === 'v' || key === '1') handleChoice(true);
            if (key === 'f' || key === '2') handleChoice(false);
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lesson]);

    return (
        <div className="flex flex-col gap-8">
            <p className="text-2xl font-bold leading-snug text-ink md:text-[1.75rem]">{lesson.question}</p>

            <div className="card dots-grid flex justify-center px-6 py-8">
                <TactileCell dots={braillePatterns[lesson.displayChar]} size={190} showNumbers />
            </div>

            <div role="group" aria-label="Elige una respuesta" className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => handleChoice(true)}
                    aria-label="Verdadero. Atajo: tecla V o 1."
                    className="btn btn-secondary btn-lg relative min-h-[4.5rem]"
                >
                    <Check className="h-6 w-6" strokeWidth={3.5} aria-hidden="true" />
                    Verdadero
                </button>
                <button
                    type="button"
                    onClick={() => handleChoice(false)}
                    aria-label="Falso. Atajo: tecla F o 2."
                    className="btn btn-secondary btn-lg relative min-h-[4.5rem]"
                >
                    <X className="h-6 w-6" strokeWidth={3.5} aria-hidden="true" />
                    Falso
                </button>
            </div>

            <p className="text-base text-ink-soft">
                Atajos: <span className="kbd">V</span> verdadero · <span className="kbd">F</span> falso
            </p>
        </div>
    );
};

export default LessonTrueFalse;
