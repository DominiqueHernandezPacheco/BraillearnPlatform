import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { displayClient } from '../utils/displayClient';
import { useDisplaySettings } from '../utils/displayStore';
import { linesFor, lineRange } from '../utils/backendBraille';
import { track } from '../utils/telemetry';

// El display como lo ve la plataforma: carga un texto, y el display (real o
// simulado) lo reparte en líneas de N celdas y avanza línea por línea.
//
//   real  -> la API: se manda el texto completo, y la plataforma se entera de
//            en qué línea va consultando /device/status (así sigue también los
//            botones físicos del display).
//   sim   -> la misma lógica en el navegador, con las celdas que se elijan.
//
// En los dos casos las líneas se calculan aquí (backendBraille.js) para poder
// iluminar en el texto lo que hay en el display.

const EMPTY = { text: '', line: 0, total: 0, cells: null, phase: 'idle', error: '', forReal: false };
const POLL_MS = 2000;

const friendly = (error) => error?.message || 'No pude hablar con el display.';

export function useBrailleDisplay() {
    const settings = useDisplaySettings();
    const real = settings.mode === 'real' && !!settings.token;
    const [stored, setSession] = useState(EMPTY);
    const loadId = useRef(0);

    // Lo cargado en un modo no vale en el otro (real <-> simulado).
    const session = stored.forReal === real ? stored : EMPTY;

    // En real manda lo que informa el display; mientras no se sabe, las simuladas.
    const cells = real ? (session.cells ?? settings.simCells) : settings.simCells;
    const lines = useMemo(() => linesFor(session.text, cells), [session.text, cells]);
    const total = real && session.total ? session.total : lines.length;
    const line = Math.min(session.line, Math.max(0, total - 1));

    const load = useCallback(async (text) => {
        const id = ++loadId.current;
        const base = { ...EMPTY, text, forReal: real };
        if (!real) {
            setSession({ ...base, phase: 'ready' });
            return;
        }
        setSession({ ...base, phase: 'loading' });
        const startedAt = performance.now();
        try {
            const status = await displayClient.getStatus();
            if (!status.connected) throw new Error('El display no está conectado. Enciéndelo y revisa su conexión.');
            const n = status.cells || settings.simCells;
            const result = await displayClient.sendText(text, n);
            track('display_op', { op: 'load', ok: true, ms: Math.round(performance.now() - startedAt), cells: n });
            if (id !== loadId.current) return;
            setSession({
                ...base,
                line: result.current_line ?? 0,
                total: result.total_lines ?? 0,
                cells: n,
                phase: 'ready',
            });
        } catch (error) {
            track('display_op', { op: 'load', ok: false, ms: Math.round(performance.now() - startedAt) });
            if (id === loadId.current) setSession({ ...base, error: friendly(error) });
        }
    }, [real, settings.simCells]);

    const move = useCallback(async (direction) => {
        if (!real) {
            setSession((s) => ({ ...s, line: Math.max(0, Math.min(s.line + direction, Math.max(0, lines.length - 1))) }));
            return;
        }
        setSession((s) => ({ ...s, phase: 'moving', error: '' }));
        const startedAt = performance.now();
        try {
            const result = await (direction > 0 ? displayClient.nextLine() : displayClient.prevLine());
            track('display_op', { op: direction > 0 ? 'next' : 'prev', ok: true, ms: Math.round(performance.now() - startedAt) });
            setSession((s) => ({
                ...s,
                line: result.current_line ?? s.line,
                total: result.total_lines ?? s.total,
                phase: 'ready',
            }));
        } catch (error) {
            track('display_op', { op: direction > 0 ? 'next' : 'prev', ok: false, ms: Math.round(performance.now() - startedAt) });
            setSession((s) => ({ ...s, phase: 'ready', error: friendly(error) }));
        }
    }, [real, lines.length]);

    // Con el display real, seguir en qué línea va (también si se usan sus botones).
    useEffect(() => {
        if (!real || session.phase !== 'ready') return undefined;
        const timer = setInterval(async () => {
            try {
                const status = await displayClient.getStatus();
                setSession((s) => (s.phase === 'ready'
                    ? { ...s, line: status.current_line ?? s.line, total: status.total_lines ?? s.total, cells: status.cells || s.cells }
                    : s));
            } catch { /* un fallo suelto de red no tira la sesión */ }
        }, POLL_MS);
        return () => clearInterval(timer);
    }, [real, session.phase]);

    return {
        real,
        text: session.text,
        cells,
        phase: session.phase,
        error: session.error,
        line,
        total,
        lines,
        currentCells: lines[line] ?? [],
        range: lineRange(lines[line]),
        canNext: line < total - 1,
        canPrev: line > 0,
        busy: session.phase === 'loading' || session.phase === 'moving',
        load,
        next: () => move(1),
        prev: () => move(-1),
    };
}
