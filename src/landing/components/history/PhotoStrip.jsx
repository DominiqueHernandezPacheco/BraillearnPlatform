import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalmMotion } from '../../calmMotionContext';
import { useCopy } from '../../i18n/languageContext';
import { buildPhotos } from '../../content';

// Tira de fotos deslizable (scroll-snap). Cada foto conserva su proporción real,
// sin recortes, con su pie debajo. Se recorre con el dedo, la rueda, las flechas
// del teclado (la región es enfocable) o los botones.
export default function PhotoStrip() {
    const copy = useCopy();
    const t = copy.history.build;
    const calm = useCalmMotion();
    const stripRef = useRef(null);

    const slide = (direction) => {
        const strip = stripRef.current;
        strip?.scrollBy({ left: direction * strip.clientWidth * 0.8, behavior: calm ? 'auto' : 'smooth' });
    };

    return (
        <div>
            <div
                ref={stripRef}
                role="region"
                aria-label={t.galleryLabel}
                tabIndex={0}
                className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-2 [--h:18rem] [scrollbar-width:none] sm:-mx-6 sm:px-6 sm:[--h:21rem] [&::-webkit-scrollbar]:hidden"
            >
                {buildPhotos.map((photo, i) => (
                    <figure key={photo.id} className="w-fit shrink-0 snap-start">
                        <img
                            src={photo.src}
                            alt=""
                            width={photo.w}
                            height={photo.h}
                            loading="lazy"
                            decoding="async"
                            className="h-(--h) w-auto rounded-2xl bg-slate-100"
                        />
                        <figcaption className="mt-3 max-w-56 text-sm leading-relaxed text-slate-600">{t.photos[i]}</figcaption>
                    </figure>
                ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
                {[
                    { direction: -1, label: copy.common.previous, Icon: ChevronLeft },
                    { direction: 1, label: copy.common.next, Icon: ChevronRight },
                ].map((control) => {
                    const Icon = control.Icon;
                    return (
                        <button
                            key={control.direction}
                            type="button"
                            onClick={() => slide(control.direction)}
                            aria-label={control.label}
                            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors duration-200 hover:border-brand-300 hover:text-brand-700"
                        >
                            <Icon className="size-5" aria-hidden="true" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
