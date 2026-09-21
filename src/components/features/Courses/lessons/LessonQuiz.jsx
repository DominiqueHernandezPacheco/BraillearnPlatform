import React, { useEffect } from 'react';
import { braillePatterns } from '../../../../constants/braillePatterns';
import TactileCell from '../../../common/TactileCell';
import { brailleService } from '../../../../utils/brailleService';

const LessonQuiz = ({ lesson, onVerify }) => {

    // Enviar el patrón objetivo al hardware cuando carga la pregunta
    useEffect(() => {
        if (lesson && lesson.targetChar) {
            brailleService.sendText(lesson.targetChar).then(respuesta => {
                console.log(`Quiz - Reto enviado [ ${lesson.targetChar.toUpperCase()} ]. Respuesta:`, respuesta);
            }).catch(error => {
                console.error(`Error al enviar el reto [ ${lesson.targetChar.toUpperCase()} ]:`, error);
            });
        }
    }, [lesson]);

    const handleChoice = (option) => {
        const isCorrect  = option === lesson.targetChar;
        const description = `Elegiste la letra ${option.toUpperCase()}.`;

        // Retroalimentación física en el display (SI/NO)
        const feedbackFisico = isCorrect ? "SI" : "NO";
        brailleService.sendText(feedbackFisico).then(respuesta => {
            console.log(`Quiz - Feedback enviado [ ${feedbackFisico} ]. Respuesta:`, respuesta);
        }).catch(error => {
            console.error(`Error al enviar feedback [ ${feedbackFisico} ]:`, error);
        });

        onVerify(isCorrect, description);
    };

    // Atajos de teclado: 1, 2 y 3 seleccionan la opción correspondiente
    useEffect(() => {
        const handleKey = (e) => {
            // No interferir con campos de texto
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            const keyMap = { '1': 0, '2': 1, '3': 2 };
            if (keyMap[e.key] !== undefined) {
                const option = lesson.options[keyMap[e.key]];
                if (option !== undefined) handleChoice(option);
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lesson]);

    return (
        <div className="flex flex-col gap-8">
            <p className="text-2xl font-bold leading-snug text-ink md:text-[1.75rem]">{lesson.question}</p>

            <div className="card dots-grid flex justify-center px-6 py-8">
                <TactileCell dots={braillePatterns[lesson.targetChar]} size={190} showNumbers />
            </div>

            <div role="group" aria-label="Opciones" className="grid grid-cols-3 gap-3">
                {lesson.options.map((opt, index) => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => handleChoice(opt)}
                        aria-label={`Opción ${index + 1}: letra ${opt.toUpperCase()}. Atajo: tecla ${index + 1}.`}
                        className="btn btn-secondary relative min-h-[5rem] flex-col !gap-0 text-4xl uppercase"
                    >
                        {opt}
                        <span aria-hidden="true" className="kbd absolute right-2 top-2 !min-w-6 !border-b-2 !px-1.5 text-xs">
                            {index + 1}
                        </span>
                    </button>
                ))}
            </div>

            <p className="text-base text-ink-soft">
                Elige con las teclas <span className="kbd">1</span>, <span className="kbd">2</span> o <span className="kbd">3</span>, o toca una letra.
            </p>
        </div>
    );
};

export default LessonQuiz;
