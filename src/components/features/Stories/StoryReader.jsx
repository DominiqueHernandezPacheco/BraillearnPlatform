import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Accessibility, ArrowLeft, ChevronLeft, ChevronRight, Hand, Headphones, Loader2, Pause, Play,
    RotateCcw, Settings, SkipBack, SkipForward, TriangleAlert,
} from 'lucide-react';
import TactileCell from '../../common/TactileCell';
import Braulio from '../../common/Braulio';
import ForestBackdrop from './ForestBackdrop';
import ClassicBackdrop from './ClassicBackdrop';
import StorySettings from './StorySettings';
import { themeOf } from '../../../data/storyData';
import { dotsToBools } from '../../../utils/backendBraille';
import { splitSentences } from '../../../utils/storyText';
import { hapticsService } from '../../../utils/hapticsService';
import { displayActions } from '../../../utils/displayStore';
import { playStorySfx, preloadStorySfx, stopStorySfx } from '../../../utils/storySfx';
import { track } from '../../../utils/telemetry';
import { loadStoryPrefs, loadStoryProgress, saveStoryPrefs, saveStoryProgress } from '../../../utils/storyStorage';
import { useBrailleDisplay } from '../../../hooks/useBrailleDisplay';
import { useAudio } from '../../../context/AudioContext';
import { useAccessibility } from '../../../context/AccessibilityContext';

// Lo ya leído se apaga, lo que está ahora (en el display o en la voz de
// Braulio) se ilumina y lo que falta queda normal.
const HighlightedText = ({ text, range }) => {
    if (!range) return text;
    const [start, end] = range;
    return (
        <>
            <span className="text-ink-faint">{text.slice(0, start)}</span>
            <mark className="story-lit">{text.slice(start, end)}</mark>
            <span>{text.slice(end)}</span>
        </>
    );
};

const DisplayStrip = ({ display, text }) => {
    const slots = Array.from({ length: display.cells }, (_, i) => display.currentCells[i] ?? null);
    const lit = display.range ? text.slice(display.range[0], display.range[1]) : '';
    const waiting = display.total === 0;

    return (
        <section aria-label="Vista del display" className="flex flex-col items-center gap-2">
            <div
                role="img"
                aria-label={waiting ? 'El display todavía no tiene texto' : `En el display, línea ${display.line + 1} de ${display.total}: ${lit}`}
                className="flex max-w-full flex-wrap justify-center gap-1.5 rounded-3xl border border-line bg-surface/90 p-2 backdrop-blur"
            >
                {slots.map((cell, i) => (
                    <div key={i} className={`flex flex-col items-center rounded-xl bg-surface-2 px-1 pb-1 pt-1.5 ${cell ? '' : 'opacity-40'}`}>
                        <TactileCell dots={dotsToBools(cell?.dots ?? [])} size={40} className="h-10 w-auto" decorative strongEmpty />
                        <span aria-hidden="true" className="h-5 font-display text-sm font-black uppercase leading-5 text-ink">
                            {cell?.char ?? ''}
                        </span>
                    </div>
                ))}
            </div>
            <p className="inline-flex items-center gap-2 rounded-full bg-surface/90 px-4 py-1.5 text-sm font-bold text-ink-soft backdrop-blur">
                {display.busy ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Formando la línea en el display…
                    </>
                ) : (
                    <>
                        {waiting ? 'Esperando al display' : `Línea ${display.line + 1} de ${display.total}`}
                        {` · ${display.real ? 'Display conectado' : 'Display simulado'} · ${display.cells} celdas`}
                    </>
                )}
            </p>
        </section>
    );
};

const ModeButton = ({ pressed, onClick, icon, children }) => (
    <button
        type="button"
        aria-pressed={pressed}
        onClick={onClick}
        className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 font-display text-base font-extrabold transition-colors sm:px-5 ${
            pressed ? 'on-dark bg-brand text-on-brand' : 'text-ink hover:bg-surface-2'
        }`}
    >
        {icon}
        {children}
    </button>
);

const StoryReader = ({ story, onBack, onOpenPanel }) => {
    const { speak, preloadSpeech, stop, isMuted } = useAudio();
    const { soundEffects } = useAccessibility() ?? {};
    const display = useBrailleDisplay();

    const [prefs, setPrefs] = useState(loadStoryPrefs);
    const [sceneIdx, setSceneIdx] = useState(() => {
        const saved = loadStoryProgress()[story.id];
        return saved && !saved.done ? Math.min(saved.scene ?? 0, story.scenes.length - 1) : 0;
    });
    const [sentenceIdx, setSentenceIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [finished, setFinished] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const titleRef = useRef(null);
    const finishedRef = useRef(null);
    const firedRef = useRef(new Set()); // efectos de la escena actual que ya sonaron
    const cueSceneRef = useRef(-1);

    const scene = story.scenes[sceneIdx];
    const sentences = useMemo(() => splitSentences(scene.text), [scene.text]);
    const mode = prefs.mode;
    const classic = themeOf(story) === 'clasico';
    const Backdrop = classic ? ClassicBackdrop : ForestBackdrop;
    const bgClass = classic ? 'classic-bg' : 'forest';
    const isLastScene = sceneIdx === story.scenes.length - 1;

    const sfxOn = prefs.sfx && soundEffects !== false;
    const uiSound = (name) => { if (sfxOn) playStorySfx(name); };

    const setPref = (key) => setPrefs((p) => {
        const next = { ...p, [key]: !p[key] };
        saveStoryPrefs(next);
        return next;
    });

    const setMode = (next) => {
        if (next === mode) return;
        stop?.();
        stopStorySfx();
        setPlaying(false);
        setPrefs((p) => {
            const updated = { ...p, mode: next };
            saveStoryPrefs(updated);
            return updated;
        });
    };

    const finish = () => {
        track('story_done', { story: story.id, mode });
        stop?.();
        stopStorySfx();
        setPlaying(false);
        setFinished(true);
        saveStoryProgress(story.id, { scene: 0, done: true });
    };

    const goScene = (delta) => {
        const next = sceneIdx + delta;
        if (next < 0) return;
        if (next >= story.scenes.length) {
            finish();
            return;
        }
        stop?.();
        // Una campanita al cambiar de parte, salvo que la nueva abra con su propio efecto.
        if (!story.scenes[next].cues?.some((c) => (c.at ?? 0) === 0 && c.sfx)) uiSound('parte');
        setSceneIdx(next);
        setSentenceIdx(0);
    };

    const restart = () => {
        stop?.();
        firedRef.current = new Set();
        cueSceneRef.current = -1;
        setFinished(false);
        setPlaying(false);
        setSceneIdx(0);
        setSentenceIdx(0);
    };

    // Con los dedos: avanzar es la siguiente línea del display, o la siguiente escena.
    // Cada línea que se forma suena con un toque suave.
    const forwardTouch = () => {
        if (display.canNext) {
            uiSound('linea');
            display.next();
        } else {
            goScene(1);
        }
    };
    const backTouch = () => {
        if (display.canPrev) {
            uiSound('linea');
            display.prev();
        } else {
            goScene(-1);
        }
    };

    const togglePlay = () => {
        if (playing) {
            stop?.();
            stopStorySfx();
            setPlaying(false);
        } else {
            setPlaying(true);
        }
    };

    // Últimas versiones de las acciones para el teclado (que se registra una sola vez).
    const keysRef = useRef({});
    useEffect(() => {
        keysRef.current = {
            forward: mode === 'touch' ? forwardTouch : () => goScene(1),
            back: mode === 'touch' ? backTouch : () => goScene(-1),
            primary: mode === 'touch' ? forwardTouch : togglePlay,
            blocked: finished || display.busy,
        };
    });
    useEffect(() => {
        const onKey = (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const tag = e.target?.tagName;
            if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
            const keys = keysRef.current;
            if (keys.blocked) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); keys.forward(); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); keys.back(); }
            else if ((e.key === ' ' || e.key === 'Enter') && tag !== 'BUTTON' && tag !== 'A') {
                e.preventDefault();
                keys.primary();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Modo inmersivo: se esconde la navegación (igual que en las lecciones).
    useEffect(() => {
        document.body.dataset.lesson = 'on';
        return () => { delete document.body.dataset.lesson; };
    }, []);

    // Al abrir: arriba del todo y foco en el título, para que un lector de pantalla diga dónde estás.
    useEffect(() => {
        window.scrollTo({ top: 0 });
        titleRef.current?.focus({ preventScroll: true });
    }, []);

    // Los efectos del cuento se cargan al abrirlo, para que suenen justo a tiempo.
    useEffect(() => {
        preloadStorySfx([
            'linea',
            'parte',
            ...story.scenes.flatMap((s) => (s.cues ?? []).map((c) => c.sfx).filter(Boolean)),
        ]);
    }, [story]);

    // Efectos de sonido y vibración de la escena, justo en la oración donde
    // ocurren: al escuchar, cuando Braulio llega a ella; con los dedos, cuando
    // el display llega a ese punto del texto (o al abrir la escena si es el inicio).
    const rangeEnd = display.range?.[1];
    useEffect(() => {
        if (finished) return;
        if (cueSceneRef.current !== sceneIdx) {
            cueSceneRef.current = sceneIdx;
            firedRef.current = new Set();
        }
        (scene.cues ?? []).forEach((cue, i) => {
            if (firedRef.current.has(i)) return;
            const at = cue.at ?? 0;
            const reached = mode === 'touch'
                ? at === 0 || (display.text === scene.text && rangeEnd > (sentences[at]?.start ?? Infinity))
                : playing && sentenceIdx >= at;
            if (!reached) return;
            firedRef.current.add(i);
            if (sfxOn && cue.sfx) playStorySfx(cue.sfx);
            if (prefs.haptic && cue.haptic) hapticsService.play(cue.haptic);
        });
    }, [finished, sceneIdx, scene, sentences, mode, playing, sentenceIdx, display.text, rangeEnd, sfxOn, prefs.haptic]);

    // Al escuchar, la voz de la oración que sigue se pide por adelantado: así
    // pasa de una a otra sin huecos (y "Escuchar el cuento" arranca al instante).
    const upcoming = useMemo(() => {
        const texts = [];
        let s = sceneIdx;
        let i = sentenceIdx + 1;
        while (texts.length < 2 && s < story.scenes.length) {
            const list = s === sceneIdx ? sentences : splitSentences(story.scenes[s].text);
            if (i < list.length) {
                texts.push(list[i].text);
                i += 1;
            } else {
                s += 1;
                i = 0;
            }
        }
        return texts;
    }, [story, sceneIdx, sentenceIdx, sentences]);
    useEffect(() => {
        if (mode === 'listen' && !finished) preloadSpeech([sentences[sentenceIdx]?.text, ...upcoming]);
    }, [mode, finished, sentences, sentenceIdx, upcoming, preloadSpeech]);

    // Con los dedos el display siempre recibe la escena; al escuchar, solo si se pidió.
    const displayRef = useRef(display);
    useEffect(() => { displayRef.current = display; });
    useEffect(() => {
        if (finished) return;
        if (mode === 'touch' || prefs.display) displayRef.current.load(scene.text);
    }, [scene.text, mode, prefs.display, finished, display.real]);

    // Registro de uso (solo si la persona lo activó): cuánto se tarda en cada línea
    // del display al leer con los dedos, y por qué parte del cuento se va.
    useEffect(() => {
        if (!finished) track('story_scene', { story: story.id, scene: sceneIdx, mode });
    }, [story.id, sceneIdx, mode, finished]);

    const glyphs = display.currentCells.filter((c) => c.src).length;
    useEffect(() => {
        if (finished || mode !== 'touch' || display.phase !== 'ready' || display.text !== scene.text) return undefined;
        const meta = { story: story.id, scene: sceneIdx, line: display.line, cells: display.cells, glyphs, real: display.real };
        const since = performance.now();
        return () => track('story_line', { ...meta, dwell_ms: Math.round(performance.now() - since) });
    }, [finished, mode, display.phase, display.text, scene.text, display.line, display.cells, display.real, glyphs, story.id, sceneIdx]);

    // Guarda por dónde vas.
    useEffect(() => {
        if (!finished) saveStoryProgress(story.id, { scene: sceneIdx, done: false });
    }, [story.id, sceneIdx, finished]);

    // Escuchar: Braulio dice la escena oración por oración (así el texto se
    // ilumina justo en lo que se está diciendo) y pasa solo a la siguiente.
    const speakRef = useRef(speak);
    const goSceneRef = useRef(goScene);
    useEffect(() => {
        speakRef.current = speak;
        goSceneRef.current = goScene;
    });
    useEffect(() => {
        if (mode !== 'listen' || !playing || finished) return undefined;
        let cancelled = false;
        let timer;
        const sentence = sentences[sentenceIdx];
        const advance = () => {
            if (cancelled) return;
            if (sentenceIdx < sentences.length - 1) setSentenceIdx(sentenceIdx + 1);
            else timer = setTimeout(() => { if (!cancelled) goSceneRef.current(1); }, 450);
        };
        if (isMuted) timer = setTimeout(advance, Math.max(1500, sentence.text.length * 65));
        else speakRef.current?.(sentence.text, true, { onDone: advance });
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [mode, playing, sentenceIdx, sentences, finished, isMuted, sceneIdx]);

    useEffect(() => {
        if (!finished) return;
        finishedRef.current?.focus({ preventScroll: true });
        speak?.('Fin del cuento. ¡Muy bien!', true);
    }, [finished, speak]);

    // Salir del cuento corta la narración en curso.
    useEffect(() => () => { stop?.(); stopStorySfx(); }, [stop]);

    const sentence = sentences[sentenceIdx];
    const range = mode === 'touch'
        ? display.range
        : (playing || sentenceIdx > 0) && sentence ? [sentence.start, sentence.end] : null;
    const showStrip = mode === 'touch' || prefs.display;

    if (finished) {
        return (
            <div className={`${bgClass} relative h-dvh overflow-hidden`}>
                <Backdrop />
                <div className="relative z-10 mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
                    <Braulio mood="celebrate" size={220} look={false} />
                    <h1 ref={finishedRef} tabIndex={-1} className="rounded-3xl bg-surface/90 px-8 py-3 text-5xl outline-none backdrop-blur md:text-6xl">Fin</h1>
                    <p className="max-w-[30ch] rounded-3xl bg-surface/90 px-6 py-3 text-xl text-ink backdrop-blur md:text-2xl">
                        Terminaste “{story.title}”. ¡Qué bien lees!
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button type="button" className="btn btn-primary btn-lg" onClick={onBack}>
                            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                            Volver a la biblioteca
                        </button>
                        <button type="button" className="btn btn-secondary btn-lg" onClick={restart}>
                            <RotateCcw className="h-5 w-5" aria-hidden="true" />
                            Leer otra vez
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${bgClass} relative h-dvh overflow-hidden`}>
            <Backdrop />

            <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col gap-3 px-4 pb-3 pt-3 md:px-8">
                {/* ── Barra de arriba ─────────────────────────────────── */}
                <header className="flex items-center gap-2 md:gap-3">
                    <button type="button" className="btn btn-secondary btn-sm shrink-0" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Biblioteca</span>
                        <span className="sr-only sm:hidden">Volver a la biblioteca</span>
                    </button>
                    <div className="min-w-0 flex-1 rounded-2xl bg-surface/90 px-4 py-1.5 backdrop-blur">
                        <h1 ref={titleRef} tabIndex={-1} className="truncate font-display text-lg font-black leading-tight text-ink outline-none md:text-xl">
                            {story.title}
                        </h1>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-ink-soft">Parte {sceneIdx + 1} de {story.scenes.length}</p>
                            <span aria-hidden="true" className="flex gap-1">
                                {story.scenes.map((_, i) => (
                                    <i key={i} className={`block h-1.5 w-1.5 rounded-full ${i <= sceneIdx ? 'bg-brand' : 'bg-line-strong'}`} />
                                ))}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="icon-btn shrink-0 bg-surface/90"
                        aria-expanded={showSettings}
                        aria-label="Ajustes del cuento"
                        onClick={() => setShowSettings((v) => !v)}
                    >
                        <Settings className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button type="button" className="icon-btn shrink-0 bg-surface/90" aria-label="Accesibilidad" onClick={onOpenPanel}>
                        <Accessibility className="h-5 w-5" aria-hidden="true" />
                    </button>
                </header>

                {/* ── Cómo se lee: un solo interruptor ────────────────── */}
                <div role="group" aria-label="Cómo quieres leer" className="mx-auto flex w-full max-w-md gap-1 rounded-full border-2 border-line bg-surface/90 p-1 backdrop-blur">
                    <ModeButton pressed={mode === 'listen'} onClick={() => setMode('listen')} icon={<Headphones className="h-5 w-5" aria-hidden="true" />}>
                        Escuchar
                    </ModeButton>
                    <ModeButton pressed={mode === 'touch'} onClick={() => setMode('touch')} icon={<Hand className="h-5 w-5" aria-hidden="true" />}>
                        Con los dedos
                    </ModeButton>
                </div>

                {/* Ajustes: flotan encima, para que abrirlos no empuje ni corte la pantalla */}
                {showSettings && (
                    <div className="absolute inset-x-4 top-[4.5rem] z-30 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-3xl md:inset-x-auto md:right-8 md:w-[28rem]">
                        <StorySettings prefs={prefs} onPref={setPref} display={display} onClose={() => setShowSettings(false)} />
                    </div>
                )}

                {/* ── El texto, al centro ─────────────────────────────── */}
                <main className="flex min-h-0 flex-1 items-center py-1">
                    <div className={`card max-h-full w-full overflow-y-auto p-5 backdrop-blur md:p-8 ${classic ? 'classic-card' : 'bg-surface/95'}`}>
                        <p className={`text-[clamp(1.5rem,min(4.2vh,7.2vw),2.5rem)] leading-[1.55] text-ink ${classic ? 'font-serif font-medium' : 'font-display font-bold'}`}>
                            <HighlightedText text={scene.text} range={range} />
                        </p>
                    </div>
                </main>

                {/* ── Lo que hay en el display ────────────────────────── */}
                {showStrip && <DisplayStrip display={display} text={scene.text} />}

                {display.error && (
                    <div role="alert" className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-3xl border-2 border-oops bg-oops-soft p-4 text-center">
                        <p className="flex items-start gap-2 text-base font-bold text-ink">
                            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-oops" aria-hidden="true" />
                            {display.error}
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => display.load(scene.text)}>
                                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                Reintentar
                            </button>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => displayActions.setMode('sim')}>
                                Usar el display simulado
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Controles ───────────────────────────────────────── */}
                {mode === 'touch' ? (
                    <div className="flex items-center justify-between gap-4">
                        <button
                            type="button"
                            className="btn btn-secondary btn-lg"
                            onClick={backTouch}
                            disabled={display.busy || (!display.canPrev && sceneIdx === 0)}
                        >
                            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                            Anterior
                        </button>
                        <button type="button" className="btn btn-primary btn-lg" onClick={forwardTouch} disabled={display.busy}>
                            {!display.canNext && isLastScene ? 'Terminar' : 'Siguiente'}
                            <ChevronRight className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-5">
                        <button type="button" className="btn btn-secondary btn-lg !px-5" onClick={() => goScene(-1)} disabled={sceneIdx === 0} aria-label="Parte anterior">
                            <SkipBack className="h-6 w-6" aria-hidden="true" />
                        </button>
                        <button type="button" className="btn btn-primary btn-lg min-w-48" onClick={togglePlay} aria-pressed={playing}>
                            {playing ? <Pause className="h-6 w-6" aria-hidden="true" /> : <Play className="h-6 w-6" aria-hidden="true" />}
                            {playing ? 'Pausa' : sentenceIdx > 0 || sceneIdx > 0 ? 'Seguir' : 'Escuchar el cuento'}
                        </button>
                        <button type="button" className="btn btn-secondary btn-lg !px-5" onClick={() => goScene(1)} aria-label={isLastScene ? 'Terminar el cuento' : 'Parte siguiente'}>
                            <SkipForward className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                )}

                <p className="hidden text-center text-sm font-bold text-ink-soft md:block [@media(max-height:820px)]:hidden">
                    <span className="rounded-full bg-surface/90 px-4 py-1.5 backdrop-blur">
                        {mode === 'touch' ? 'Espacio o → para avanzar, ← para volver' : 'Espacio para pausar, ← → para cambiar de parte'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default StoryReader;
