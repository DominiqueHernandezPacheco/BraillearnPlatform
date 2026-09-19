import { useId, useState } from 'react';
import ModelStage from '../ui/ModelStage';
import { useCopy } from '../../i18n/languageContext';

// Un mismo marco con dos vistas: el modelo 3D y la foto real. Así conviven sin
// apretar el diseño. Ambas quedan montadas y solo se oculta la inactiva, para no
// recargar el modelo al cambiar de vista.
export default function ModelPhotoToggle({ file, orbit, modelAlt, photoSrc, photoAlt }) {
    const t = useCopy().models.tabs;
    const [view, setView] = useState('model');
    const groupId = useId();
    const height = 'h-80 sm:h-[26rem]';

    const options = [
        { id: 'model', label: t.model },
        { id: 'photo', label: t.photo },
    ];

    return (
        <div>
            <div role="group" aria-labelledby={groupId} className="mb-4 inline-flex rounded-full bg-slate-100 p-1">
                <span id={groupId} className="sr-only">
                    {t.label}
                </span>
                {options.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        aria-pressed={view === option.id}
                        onClick={() => setView(option.id)}
                        className={`min-h-11 min-w-16 cursor-pointer rounded-full px-5 text-sm font-semibold transition-colors duration-200 ${
                            view === option.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <div className={view === 'model' ? '' : 'hidden'}>
                <ModelStage file={file} orbit={orbit} alt={modelAlt} className={height} />
            </div>

            {/* El marco usa el gris de fondo de la foto (#e4e5e6) para que no se note el borde. */}
            <figure
                className={`flex flex-col items-center justify-center gap-6 overflow-hidden rounded-[2rem] bg-[#e4e5e6] px-6 ${height} ${
                    view === 'photo' ? '' : 'hidden'
                }`}
            >
                <img src={photoSrc} alt={photoAlt} loading="lazy" decoding="async" className="w-full" />
                <figcaption className="max-w-xs text-center text-sm leading-relaxed text-slate-600">{photoAlt}</figcaption>
            </figure>
        </div>
    );
}
