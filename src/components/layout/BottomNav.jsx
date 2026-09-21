import React from 'react';
import { NAV_ITEMS } from './navItems';

// Barra de navegación inferior (solo móvil): iconos grandes con etiqueta,
// al alcance del pulgar. En escritorio se usa el menú del encabezado.
const BottomNav = ({ currentPage, handleNav }) => (
    <nav
        data-bottom-nav
        aria-label="Navegación inferior"
        className="glass fixed inset-x-0 bottom-0 z-50 border-t border-line pb-[env(safe-area-inset-bottom)] md:hidden"
    >
        <ul className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2 py-1.5">
            {NAV_ITEMS.map(({ page, label, icon: Icon, hash, tour }) => {
                const active = currentPage === page;
                return (
                    <li key={page} className="flex-1">
                        <a
                            href={hash}
                            data-tour={tour}
                            aria-current={active ? 'page' : undefined}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNav(page);
                            }}
                            className={`flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 font-display text-[0.8125rem] font-extrabold transition-colors ${
                                active ? 'text-brand-strong' : 'text-ink-soft'
                            }`}
                        >
                            <span
                                className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                                    active ? 'bg-brand-soft shadow-[inset_0_-3px_0_var(--brand)]' : ''
                                }`}
                            >
                                <Icon className="h-6 w-6" aria-hidden="true" />
                            </span>
                            {label}
                        </a>
                    </li>
                );
            })}
        </ul>
    </nav>
);

export default BottomNav;
