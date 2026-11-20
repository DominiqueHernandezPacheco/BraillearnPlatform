import React from 'react';
import { House, Bird, Turtle, Swords, Sparkles, BookOpen } from 'lucide-react';

const ICONS = { House, Bird, Turtle, Swords, Sparkles };

// Colores del tema (se adaptan solos al alto contraste).
const TONES = {
    sun: 'bg-sun-soft text-ink',
    brand: 'bg-brand-soft text-brand-strong',
    good: 'bg-good-soft text-good',
    oops: 'bg-oops-soft text-oops',
    // Portadas sobrias para los clásicos (siempre oscuras, con el icono dorado).
    wine: 'bg-[#4a1d2b] text-[#e8c872]',
    night: 'bg-[#1f2a44] text-[#e8c872]',
};

// Portada ilustrada de un cuento: icono grande sobre un fondo de color, con
// una celda Braille de adorno. Es decorativa; el título va siempre en texto.
const StoryCover = ({ story, className = '' }) => {
    const Icon = ICONS[story.cover?.icon] ?? BookOpen;
    const tone = TONES[story.cover?.tone] ?? TONES.brand;

    return (
        <div
            aria-hidden="true"
            className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border-2 border-line ${tone} ${className}`}
        >
            <span className="absolute left-4 top-4 grid grid-cols-2 gap-1.5 opacity-40">
                {[0, 1, 2, 3, 4, 5].map((n) => (
                    <i key={n} className="block h-2.5 w-2.5 rounded-full bg-current" />
                ))}
            </span>
            <Icon className="h-1/2 w-1/2" strokeWidth={1.6} />
        </div>
    );
};

export default StoryCover;
