import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

// Pregunta de comprobación de opción múltiple (teoría). Se elige una opción
// (toque, flechas ↑↓ o teclas 1-3) y se confirma con "Comprobar" — así un
// toque accidental no cuenta como respuesta.
//
// `feedback` viene del padre: cuando pasa a null tras una respuesta, es que la
// persona pidió "Intentar de nuevo" y se reinicia la selección.
const LessonCheck = ({ lesson, feedback, onVerify }) => {
    const [selected, setSelected] = useState(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (!feedback && checked) {
            setChecked(false);
            setSelected(null);
        }
    }, [feedback, checked]);

    const verify = () => {
        if (selected === null || checked) return;
        setChecked(true);
        onVerify(selected === lesson.answer, `Elegiste: ${lesson.options[selected]}.`, lesson.explain);
    };

    // Teclas 1-N eligen; ↑/↓ mueven la selección; Enter comprueba
    useEffect(() => {
        const onKey = (e) => {
            if (checked) return;
            const count = lesson.options.length;
            const digit = Number(e.key);
            if (digit >= 1 && digit <= count) {
                setSelected(digit - 1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelected((s) => (s === null ? 0 : Math.min(s + 1, count - 1)));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelected((s) => (s === null ? count - 1 : Math.max(s - 1, 0)));
            } else if (e.key === 'Enter' && selected !== null && document.activeElement?.tagName !== 'BUTTON') {
                verify();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checked, selected, lesson]);

    return (
        <div className="flex flex-col gap-6">
            <p id="check-question" className="text-2xl font-bold leading-snug text-ink md:text-[1.75rem]">
                {lesson.question}
            </p>

            <div role="radiogroup" aria-labelledby="check-question" className="flex flex-col gap-3">
                {lesson.options.map((option, i) => {
                    const isSelected = selected === i;
                    const isAnswer = i === lesson.answer;
                    const wrongPick = checked && isSelected && !isAnswer;
                    const rightOne = checked && isAnswer;

                    let tone = 'border-line-strong bg-surface hover:border-brand hover:bg-brand-soft';
                    if (isSelected && !checked) tone = 'border-brand bg-brand-soft';
                    if (rightOne) tone = 'border-good bg-good-soft';
                    if (wrongPick) tone = 'border-oops bg-oops-soft';
                    if (checked && !rightOne && !wrongPick) tone = 'border-line bg-surface opacity-60';

                    return (
                        <button
                            key={option}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            aria-disabled={checked}
                            tabIndex={isSelected || (selected === null && i === 0) ? 0 : -1}
                            onClick={() => !checked && setSelected(i)}
                            onKeyDown={(e) => {
                                // Enter sobre la opción ya elegida = comprobar
                                if (e.key === 'Enter' && isSelected && !checked) {
                                    e.preventDefault();
                                    verify();
                                }
                            }}
                            className={`flex min-h-16 w-full items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left text-xl font-bold text-ink shadow-[0_4px_0_var(--line-strong)] transition-colors ${tone}`}
                        >
                            <span aria-hidden="true" className="kbd shrink-0">{i + 1}</span>
                            <span className="flex-1">{option}</span>
                            {rightOne && (
                                <>
                                    <Check className="h-6 w-6 shrink-0 text-good" strokeWidth={3.5} aria-hidden="true" />
                                    <span className="sr-only">Respuesta correcta</span>
                                </>
                            )}
                            {wrongPick && (
                                <>
                                    <X className="h-6 w-6 shrink-0 text-oops" strokeWidth={3.5} aria-hidden="true" />
                                    <span className="sr-only">Tu respuesta, no es la correcta</span>
                                </>
                            )}
                        </button>
                    );
                })}
            </div>

            {!checked && (
                <button
                    type="button"
                    className="btn btn-primary btn-lg btn-block"
                    disabled={selected === null}
                    onClick={verify}
                >
                    Comprobar
                </button>
            )}

            <p className="text-base text-ink-soft">
                Elige con las teclas <span className="kbd">1</span> a <span className="kbd">{lesson.options.length}</span> y
                confirma con <span className="kbd">Enter</span>.
            </p>
        </div>
    );
};

export default LessonCheck;
