import React, { useEffect } from 'react';
import { Lightbulb } from 'lucide-react';
import { getIcon } from '../../../../utils/iconMap';
import { brailleService } from '../../../../utils/brailleService';

// Paso de teoría: una sola idea, texto grande y un dato para recordar.
// (El título lo pone el marco de la lección, LessonPlayer.)
const LessonInfo = ({ content, highlight, iconType }) => {
    // Sincroniza el texto con el display Braille (ESP32)
    useEffect(() => {
        if (content) {
            brailleService.sendText(content);
        }
    }, [content]);

    return (
        <div className="flex flex-col gap-7">
            <span
                aria-hidden="true"
                className="pop flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-soft text-brand-strong"
            >
                {getIcon(iconType, 'h-10 w-10')}
            </span>

            <p className="text-[1.375rem] leading-relaxed text-ink md:text-2xl md:leading-relaxed">{content}</p>

            {highlight && (
                <div className="flex items-start gap-3 rounded-2xl bg-sun-soft px-5 py-4">
                    <Lightbulb className="mt-0.5 h-6 w-6 shrink-0 text-ink" aria-hidden="true" />
                    <p className="text-lg font-bold leading-snug text-ink md:text-xl">{highlight}</p>
                </div>
            )}
        </div>
    );
};

export default LessonInfo;
