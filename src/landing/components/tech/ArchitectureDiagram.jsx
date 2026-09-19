import { motion } from 'framer-motion';
import { MoveDown, MoveVertical } from 'lucide-react';
import { useCopy } from '../../i18n/languageContext';

// Diagrama de la arquitectura del backend, hecho con HTML y Tailwind (sin imagen):
// se puede traducir, escala a cualquier pantalla y lo leen los lectores de pantalla.
//
// Estructura (misma jerarquía que el diagrama original):
//   Cliente · ESP  ⇅  ┌ Braillearn API (FastAPI + SQLAlchemy) ┐  ↓  PostgreSQL
//                     │ módulos internos                      │  ↓  Almacenamiento
//                     └───────────────────────────────────────┘

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function Node({ title, text, className = '', accent = false }) {
    return (
        <motion.div
            variants={item}
            className={`rounded-xl border bg-white p-4 text-center shadow-sm transition-colors duration-200 hover:border-brand-300 ${
                accent ? 'border-brand-300' : 'border-slate-200'
            } ${className}`}
        >
            <p className="text-sm font-semibold leading-snug text-slate-800 sm:text-base">{title}</p>
            {text && <p className="mt-1 text-sm leading-relaxed text-slate-500">{text}</p>}
        </motion.div>
    );
}

// Flecha entre bloques. `both`: la comunicación va y vuelve (petición y respuesta).
function Arrow({ both = false, className = '' }) {
    const Icon = both ? MoveVertical : MoveDown;
    return (
        <div aria-hidden="true" className={`flex h-14 items-center justify-center text-slate-400 ${className}`}>
            <Icon className="size-8" strokeWidth={1.5} />
        </div>
    );
}

export default function ArchitectureDiagram() {
    const t = useCopy().backend;
    const m = t.modules;

    return (
        <figure aria-labelledby="backend-summary" className="mx-auto w-full max-w-4xl">
            <figcaption id="backend-summary" className="sr-only">
                {t.summary}
            </figcaption>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            >
                {/* Quienes consumen la API */}
                <div className="grid md:grid-cols-6 md:gap-3 md:px-6">
                    {[
                        { ...t.client, place: 'md:col-span-2 md:col-start-3' },
                        { ...t.esp, place: 'md:col-span-2 md:col-start-5' },
                    ].map((consumer) => (
                        <div key={consumer.title} className={`flex flex-col items-center ${consumer.place}`}>
                            <Node title={consumer.title} text={consumer.text} className="w-full max-w-xs" />
                            <Arrow both />
                        </div>
                    ))}
                </div>

                {/* La API: envuelve a sus módulos internos */}
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-6 md:pt-14">
                    <motion.div
                        variants={item}
                        className="mb-4 inline-block rounded-xl border border-slate-200 bg-white px-4 py-2 text-left shadow-sm md:absolute md:-top-5 md:left-6 md:mb-0"
                    >
                        <span className="text-sm font-bold text-slate-800 sm:text-base">{t.api.title}</span>
                        <span className="text-sm text-slate-500 sm:text-base">: {t.api.text}</span>
                    </motion.div>

                    <div className="grid gap-3 md:grid-cols-6">
                        <Node title={m.security.title} text={m.security.text} className="md:col-span-6" />
                        <Node title={m.auth.title} text={m.auth.text} className="md:col-span-6" />

                        <Node title={m.device.title} text={m.device.text} className="md:col-span-3" />
                        <Node title={m.braille.title} text={m.braille.text} className="md:col-span-3" />

                        <Node title={m.learning.title} text={m.learning.text} className="md:col-span-2" />
                        <Node title={m.transcription.title} text={m.transcription.text} className="md:col-span-2" />
                        <Node title={m.catalog.title} text={m.catalog.text} className="md:col-span-2" />

                        <Node title={m.pairing.title} text={m.pairing.text} className="md:col-span-2" />
                        <Node title={m.users.title} text={m.users.text} className="md:col-span-2" />
                        <Node title={m.documents.title} text={m.documents.text} className="md:col-span-2" accent />

                        <Node title={m.websocket.title} text={m.websocket.text} className="md:col-span-2 md:col-start-3" />

                        {/* Celda vacía bajo "Gestión de documentos": por aquí baja la línea hasta el
                            almacenamiento de archivos, atravesando el borde de la API. */}
                        <div aria-hidden="true" className="relative hidden md:col-span-2 md:col-start-5 md:block">
                            <span
                                className="absolute left-1/2 top-[-0.75rem] w-px -translate-x-1/2 bg-brand-400"
                                style={{ bottom: 'calc(-1.5rem - 3.5rem)' }}
                            />
                            <MoveDown
                                className="absolute left-1/2 size-5 -translate-x-1/2 text-brand-500"
                                style={{ bottom: 'calc(-1.5rem - 3.5rem - 0.35rem)' }}
                                strokeWidth={2.5}
                            />
                        </div>
                    </div>
                </div>

                {/* Lo que la API usa: base de datos y archivos */}
                <div className="grid md:grid-cols-6 md:gap-3 md:px-6">
                    <div className="flex flex-col items-center md:col-span-2">
                        <Arrow />
                        <Node title={t.database.title} text={t.database.text} className="w-full" />
                    </div>
                    <div className="flex flex-col items-center md:col-span-2 md:col-start-5">
                        <Arrow className="md:invisible" />
                        <Node title={t.storage.title} text={t.storage.text} className="w-full" />
                    </div>
                </div>
            </motion.div>
        </figure>
    );
}
