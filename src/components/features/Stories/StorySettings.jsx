import React, { useState } from 'react';
import { Grip, LogIn, LogOut, Loader2, Minus, Music, Plus, TriangleAlert, Vibrate, X } from 'lucide-react';
import { MAX_CELLS, MIN_CELLS, displayActions, useDisplaySettings } from '../../../utils/displayStore';
import { displayClient } from '../../../utils/displayClient';

const Toggle = ({ pressed, onClick, icon, children }) => (
    <button
        type="button"
        aria-pressed={pressed}
        onClick={onClick}
        className={`inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-5 font-display text-base font-extrabold transition-colors ${
            pressed ? 'on-dark border-brand bg-brand text-on-brand' : 'border-line bg-surface text-ink hover:bg-surface-2'
        }`}
    >
        {icon}
        {children}
    </button>
);

const Segment = ({ pressed, onClick, children }) => (
    <button
        type="button"
        aria-pressed={pressed}
        onClick={onClick}
        className={`min-h-11 flex-1 rounded-full px-4 font-display text-base font-extrabold transition-colors ${
            pressed ? 'on-dark bg-brand text-on-brand' : 'text-ink hover:bg-surface-2'
        }`}
    >
        {children}
    </button>
);

const StorySettings = ({ prefs, onPref, display, onClose }) => {
    const settings = useDisplaySettings();
    const [tab, setTab] = useState(settings.token && settings.mode === 'real' ? 'real' : 'sim');
    const [form, setForm] = useState({ email: '', password: '' });
    const [login, setLogin] = useState({ busy: false, error: '' });

    const useSim = () => {
        setTab('sim');
        displayActions.setMode('sim');
    };
    const useReal = () => {
        setTab('real');
        if (settings.token) displayActions.setMode('real');
    };

    const submit = async (e) => {
        e.preventDefault();
        setLogin({ busy: true, error: '' });
        try {
            const token = await displayClient.login(form.email.trim(), form.password);
            displayActions.signIn(token, form.email.trim());
            setForm({ email: '', password: '' });
            setLogin({ busy: false, error: '' });
        } catch (error) {
            setLogin({ busy: false, error: error.message });
        }
    };

    return (
        <section
            role="dialog"
            aria-label="Ajustes del cuento"
            className="sheet-up card flex flex-col gap-6 bg-surface p-5 shadow-2xl md:p-6"
        >
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl">Ajustes</h2>
                <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar ajustes">
                    <X className="h-5 w-5" aria-hidden="true" />
                </button>
            </div>

            <div className="flex flex-col gap-3">
                <h3 className="text-base font-extrabold text-ink-soft">Efectos</h3>
                <div className="flex flex-wrap gap-3">
                    <Toggle pressed={prefs.sfx} onClick={() => onPref('sfx')} icon={<Music className="h-5 w-5" aria-hidden="true" />}>Sonidos</Toggle>
                    <Toggle pressed={prefs.haptic} onClick={() => onPref('haptic')} icon={<Vibrate className="h-5 w-5" aria-hidden="true" />}>Vibración</Toggle>
                    <Toggle pressed={prefs.display} onClick={() => onPref('display')} icon={<Grip className="h-5 w-5" aria-hidden="true" />}>Al escuchar, mandar también al display</Toggle>
                </div>
                <p className="text-sm text-ink-soft">
                    La vibración se siente en un celular Android; el módulo háptico del display se conectará después.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <h3 className="text-base font-extrabold text-ink-soft">Display</h3>
                <div role="group" aria-label="Qué display usar" className="flex gap-1 rounded-full border-2 border-line p-1">
                    <Segment pressed={tab === 'sim'} onClick={useSim}>Simulado</Segment>
                    <Segment pressed={tab === 'real'} onClick={useReal}>El de verdad</Segment>
                </div>

                {tab === 'sim' && (
                    <div className="flex flex-wrap items-center gap-4">
                        <span id="cells-label" className="text-base font-bold text-ink">Celdas del display</span>
                        <div role="group" aria-labelledby="cells-label" className="flex items-center gap-2">
                            <button
                                type="button"
                                className="icon-btn"
                                aria-label="Menos celdas"
                                disabled={settings.simCells <= MIN_CELLS}
                                onClick={() => displayActions.setSimCells(settings.simCells - 1)}
                            >
                                <Minus className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <output aria-live="polite" className="min-w-10 text-center font-display text-2xl font-black text-ink">
                                {settings.simCells}
                            </output>
                            <button
                                type="button"
                                className="icon-btn"
                                aria-label="Más celdas"
                                disabled={settings.simCells >= MAX_CELLS}
                                onClick={() => displayActions.setSimCells(settings.simCells + 1)}
                            >
                                <Plus className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                        <p className="basis-full text-sm text-ink-soft">
                            Prueba el cuento con las celdas que tenga tu display. El display de verdad informa las suyas solo.
                        </p>
                    </div>
                )}

                {tab === 'real' && settings.token && (
                    <div className="flex flex-col gap-3">
                        <p className="text-base text-ink">
                            Sesión de <strong className="break-all">{settings.email || 'tu cuenta'}</strong>.
                            {display.real && display.phase === 'ready' && ` Display con ${display.cells} celdas.`}
                        </p>
                        {display.real && display.error && (
                            <p role="alert" className="flex items-start gap-2 text-base font-bold text-oops">
                                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                                {display.error}
                            </p>
                        )}
                        <button type="button" className="btn btn-secondary btn-sm self-start" onClick={() => { displayActions.signOut(); setTab('sim'); }}>
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                            Cerrar sesión
                        </button>
                    </div>
                )}

                {tab === 'real' && !settings.token && (
                    <form onSubmit={submit} className="flex flex-col gap-3">
                        <p className="text-sm text-ink-soft">Entra con la cuenta con la que registraste tu display.</p>
                        <label className="flex flex-col gap-1 text-base font-bold text-ink">
                            Correo
                            <input
                                type="email"
                                required
                                autoComplete="username"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="input"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-base font-bold text-ink">
                            Contraseña
                            <input
                                type="password"
                                required
                                autoComplete="current-password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="input"
                            />
                        </label>
                        {login.error && (
                            <p role="alert" className="flex items-start gap-2 text-base font-bold text-oops">
                                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                                {login.error}
                            </p>
                        )}
                        <button type="submit" className="btn btn-primary btn-sm self-start" disabled={login.busy}>
                            {login.busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
                            Conectar
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
};

export default StorySettings;
