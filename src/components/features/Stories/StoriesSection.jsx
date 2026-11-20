import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import Braulio from '../../common/Braulio';
import ForestBackdrop from './ForestBackdrop';
import ClassicBackdrop from './ClassicBackdrop';
import StoryCover from './StoryCover';
import StoryReader from './StoryReader';
import { SHELVES, STORIES, getStory } from '../../../data/storyData';
import { loadStoryProgress } from '../../../utils/storyStorage';
import { useAudio } from '../../../context/AudioContext';
import { useAccessibility } from '../../../context/AccessibilityContext';

// Cada cuento tiene su propia dirección (#/cuentos/tres-cerditos), así que el
// botón "atrás" del navegador vuelve a la biblioteca.
const storyIdFromHash = () => window.location.hash.replace(/^#\/?/, '').split('/')[1] || null;

const INTRO = 'Biblioteca de cuentos. Elige uno para empezar a leer.';
const INTRO_BRIEF = 'Estás en Cuentos.';

const StoriesSection = ({ onOpenPanel }) => {
    const { speak } = useAudio() ?? {};
    const { briefNarration } = useAccessibility() ?? {};
    const [openId, setOpenId] = useState(storyIdFromHash);
    const [progress, setProgress] = useState(loadStoryProgress);
    const announced = useRef(false);

    useEffect(() => {
        const onHash = () => {
            setOpenId(storyIdFromHash());
            setProgress(loadStoryProgress());
        };
        window.addEventListener('hashchange', onHash);
        return () => window.removeEventListener('hashchange', onHash);
    }, []);

    const story = openId ? getStory(openId) : null;

    // Al entrar a la biblioteca, Braulio dice dónde estás (una vez por visita).
    useEffect(() => {
        if (story || announced.current) return;
        announced.current = true;
        speak?.(briefNarration ? INTRO_BRIEF : INTRO, true);
    }, [story, speak, briefNarration]);

    if (story) {
        return (
            <StoryReader
                key={story.id}
                story={story}
                onOpenPanel={onOpenPanel}
                onBack={() => { window.location.hash = '#/cuentos'; }}
            />
        );
    }

    return (
        <div className="page flex flex-col gap-14">
            <header className="forest relative overflow-hidden rounded-[2rem] border-2 border-line">
                <ForestBackdrop />
                <div className="relative z-10 flex items-center justify-between gap-6 p-5 md:p-8">
                    <div className="flex max-w-xl flex-col gap-3 rounded-3xl bg-surface/90 p-5 backdrop-blur md:p-6">
                        <h1 className="text-4xl md:text-5xl">Cuentos</h1>
                        <p className="text-lg leading-relaxed text-ink md:text-xl">
                            Léelos con los dedos en el display, o escúchalos con Braulio, con sonidos y vibraciones que los hacen cobrar vida.
                        </p>
                    </div>
                    <Braulio mood="happy" size={150} look={false} className="hidden shrink-0 md:block" />
                </div>
            </header>

            {SHELVES.map((shelf) => {
                const stories = STORIES.filter((s) => s.shelf === shelf.id);
                return (
                    <section key={shelf.id} aria-labelledby={`shelf-${shelf.id}`} className="flex flex-col gap-6">
                        {shelf.theme === 'clasico' ? (
                            <div className="classic-bg relative overflow-hidden rounded-[2rem] border-2 border-line">
                                <ClassicBackdrop />
                                <div className="relative z-10 p-5 md:p-7">
                                    <div className="classic-card inline-block rounded-3xl px-5 py-3">
                                        <h2 id={`shelf-${shelf.id}`} className="font-serif text-3xl font-semibold md:text-4xl">{shelf.title}</h2>
                                        <p className="mt-1 text-lg">{shelf.blurb}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 id={`shelf-${shelf.id}`} className="text-3xl md:text-4xl">{shelf.title}</h2>
                                <p className="mt-1 text-lg text-ink-soft">{shelf.blurb}</p>
                            </div>
                        )}

                        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
                            {stories.map((s) => {
                                const saved = progress[s.id];
                                const done = !!saved?.done;
                                const started = !done && saved?.scene > 0;
                                const pct = started ? Math.round((saved.scene / s.scenes.length) * 100) : 0;
                                return (
                                    <li key={s.id}>
                                        <a
                                            href={`#/cuentos/${s.id}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.location.hash = `#/cuentos/${s.id}`;
                                            }}
                                            className="card card-lift flex h-full flex-col gap-4 p-4 text-left"
                                        >
                                            <StoryCover story={s} />
                                            <span className="flex flex-1 flex-col gap-1 px-1">
                                                <span className="font-display text-2xl font-extrabold leading-tight text-ink">
                                                    {s.title}
                                                </span>
                                                <span className="text-base text-ink-soft">{s.author}</span>
                                            </span>
                                            <span className="flex flex-wrap items-center gap-2 px-1">
                                                <span className="chip">{s.scenes.length} partes</span>
                                                {done && (
                                                    <span className="chip chip-good">
                                                        <Check className="h-4 w-4" aria-hidden="true" />
                                                        Leído
                                                    </span>
                                                )}
                                                {started && <span className="chip chip-sun">Seguir leyendo</span>}
                                            </span>
                                            {started && (
                                                <span className="meter mx-1 block" aria-hidden="true">
                                                    <span style={{ width: `${pct}%` }} />
                                                </span>
                                            )}
                                            <span className="flex items-center justify-between px-1 font-display text-lg font-extrabold text-brand-strong">
                                                {started ? 'Continuar' : done ? 'Leer otra vez' : 'Leer'}
                                                <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                            </span>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                );
            })}

            <p className="max-w-2xl text-base text-ink-soft">
                Todos los cuentos son de dominio público o adaptaciones propias, así que son libres de leer y compartir.
            </p>
        </div>
    );
};

export default StoriesSection;
