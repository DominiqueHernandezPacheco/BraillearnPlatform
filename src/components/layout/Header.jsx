import React from 'react';
import { Accessibility } from 'lucide-react';
import BrandMark from '../common/BrandMark';
import { NAV_ITEMS } from './navItems';

// Props:
//   currentPage  — sección activa ('plataforma' | 'cursos' | 'mensajes')
//   handleNav    — navegar a una sección
//   onOpenPanel  — abre el panel de accesibilidad
//   isPanelOpen  — estado del panel (para aria-expanded)
//
// Solo lo esencial: marca, secciones y un único botón de accesibilidad con
// texto. La voz y el alto contraste viven dentro de ese panel.
const Header = ({ currentPage, handleNav, onOpenPanel, isPanelOpen }) => {
    const go = (page) => (e) => {
        e.preventDefault();
        handleNav(page);
    };

    return (
        <header data-site-header className="glass sticky top-0 z-50 border-b border-line">
            <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center gap-3 px-4 md:px-8">
                {/* Marca */}
                <a
                    href="#/inicio"
                    onClick={go('plataforma')}
                    aria-label="Braillearn — ir al inicio"
                    className="flex shrink-0 items-center gap-2.5 rounded-xl"
                >
                    <BrandMark size={38} />
                    <span aria-hidden="true" className="font-display text-[1.65rem] font-black leading-none tracking-tight text-ink">
                        Brail<span className="text-brand">learn</span>
                    </span>
                </a>

                {/* Navegación (escritorio). En móvil se usa la barra inferior. */}
                <nav aria-label="Navegación principal" className="ml-6 hidden items-center gap-2 md:flex">
                    {NAV_ITEMS.map(({ page, label, hash, tour }) => {
                        const active = currentPage === page;
                        return (
                            <a
                                key={page}
                                href={hash}
                                onClick={go(page)}
                                data-tour={tour}
                                aria-current={active ? 'page' : undefined}
                                className={`flex min-h-11 items-center rounded-2xl px-5 py-2 font-display text-lg font-extrabold transition-colors ${
                                    active
                                        ? 'bg-brand-soft text-brand-strong shadow-[inset_0_-3px_0_var(--brand)]'
                                        : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
                                }`}
                            >
                                {label}
                            </a>
                        );
                    })}
                </nav>

                <button
                    type="button"
                    data-tour="a11y-button"
                    onClick={onOpenPanel}
                    aria-label="Abrir ajustes de accesibilidad"
                    aria-expanded={isPanelOpen}
                    aria-controls="a11y-panel"
                    className="btn btn-secondary btn-sm ml-auto"
                >
                    <Accessibility className="h-5 w-5" aria-hidden="true" />
                    <span className="hidden sm:inline">Accesibilidad</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
