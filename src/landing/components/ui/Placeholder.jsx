import { ImageIcon } from 'lucide-react';
import { useCopy } from '../../i18n/languageContext';

const tones = {
    light: 'border-brand-200 bg-brand-50/60 text-brand-800',
    technical: 'border-slate-300 bg-white text-slate-600',
    dark: 'border-slate-700 bg-slate-900 text-slate-300',
};

// Marcador de posición para foto o diagrama. Sustitúyelo por <img> conservando
// el contenedor con `aspect-*` para no provocar saltos de layout (CLS).
export default function Placeholder({
    label,
    hint,
    tone = 'light',
    rounded = 'rounded-2xl',
    icon = ImageIcon,
    className = 'aspect-4/3',
    bare = false,
}) {
    const t = useCopy();
    const Icon = icon;
    return (
        <figure
            role="img"
            aria-label={`${t.common.placeholderPrefix}: ${label}`}
            className={`relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden p-6 ${bare ? '' : 'border-2 border-dashed'} text-center ${rounded} ${tones[tone]} ${className}`}
        >
            <Icon className="size-8 opacity-70" aria-hidden="true" strokeWidth={1.5} />
            <figcaption className="max-w-xs">
                <span className="block text-sm font-semibold">{label}</span>
                {hint && <span className="mt-1 block text-xs opacity-80">{hint}</span>}
            </figcaption>
        </figure>
    );
}
