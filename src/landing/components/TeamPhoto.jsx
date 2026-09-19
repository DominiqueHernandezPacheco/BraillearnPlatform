import { useState } from 'react';
import { useCalmMotion } from '../calmMotionContext';
import { useCopy } from '../i18n/languageContext';
import { team, teamHotspots, teamPhoto } from '../content';

// Foto del equipo con una zona sobre cada persona. Al acercarse (o al enfocarla con
// el teclado, o al tocarla) la zona se marca, el resto de la foto se atenúa y aparece
// un cuadro con el nombre y el área. Cada zona es un <button> con el nombre como
// etiqueta accesible, así que también funciona con lector de pantalla.
export default function TeamPhoto() {
    const t = useCopy().team;
    const calm = useCalmMotion();
    const [active, setActive] = useState(null);

    return (
        <figure className="mx-auto w-full max-w-md">
            <div
                className="relative aspect-3/4 overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-slate-900/15"
                onPointerOver={(event) => {
                    // Con ratón, salir de una persona deselecciona; con el dedo la selección se queda.
                    if (event.pointerType === 'mouse' && !event.target.closest('button')) setActive(null);
                }}
                onPointerLeave={(event) => event.pointerType === 'mouse' && setActive(null)}
                onClick={(event) => event.target.tagName === 'IMG' && setActive(null)}
            >
                <img
                    src={teamPhoto.src}
                    alt={t.photoAlt}
                    width={teamPhoto.w}
                    height={teamPhoto.h}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover"
                />

                {teamHotspots.map((spot, i) => {
                    const member = team[spot.member];
                    const role = t.members[spot.member].role;
                    const on = active === i;
                    const { left, top, width, height } = spot.box;

                    return (
                        <div
                            key={member.name}
                            className="absolute"
                            style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
                        >
                            <button
                                type="button"
                                aria-label={`${member.name}. ${role}`}
                                onPointerEnter={(event) => event.pointerType === 'mouse' && setActive(i)}
                                onFocus={() => setActive(i)}
                                onBlur={() => setActive((current) => (current === i ? null : current))}
                                onClick={() => setActive(i)}
                                className="absolute inset-0 z-20 cursor-pointer rounded-2xl"
                            />

                            {/* Marco de selección: atenúa todo lo demás al activarse */}
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${
                                    on
                                        ? 'border-white opacity-100 shadow-[0_0_0_200vmax_rgb(15_23_42/0.5)]'
                                        : 'border-transparent opacity-0'
                                }`}
                            />

                            {/* Punto de invitación, sobre el pecho */}
                            {!on && (
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-1/2 top-[38%] size-3.5 -translate-x-1/2 rounded-full bg-white shadow-md ring-4 ring-white/40"
                                >
                                    {!calm && (
                                        <span className="absolute inset-0 animate-ping rounded-full bg-white/70 motion-reduce:animate-none" />
                                    )}
                                </span>
                            )}

                            {/* Cuadro con nombre y área */}
                            <div
                                aria-hidden="true"
                                className={`pointer-events-none absolute left-1/2 top-full z-30 mt-3 w-52 -translate-x-1/2 sm:w-60 rounded-xl bg-white p-3 text-center shadow-xl transition-all duration-200 ${
                                    on ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
                                }`}
                            >
                                <p className="text-sm font-bold leading-snug text-slate-900">{member.name}</p>
                                <p className="mt-0.5 text-sm font-semibold text-brand-700">{role}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <figcaption className="mt-5 text-center">
                <span className="block text-base leading-relaxed text-slate-700">{t.together}</span>
                <span className="mt-1 block text-sm text-slate-500">{t.hint}</span>
            </figcaption>
        </figure>
    );
}
