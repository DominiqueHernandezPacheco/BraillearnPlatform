import ModelViewer from './ModelViewer';

// Escenario para un modelo 3D: tarjeta redondeada con un halo suave de marca, para
// que el modelo (sin fondo) se vea limpio sobre cualquier sección.
export default function ModelStage({ file, alt, orbit, className = 'h-96' }) {
    return (
        <div
            className={`overflow-hidden rounded-[2rem] bg-slate-50 bg-[radial-gradient(ellipse_at_50%_38%,var(--color-brand-100),transparent_68%)] ${className}`}
        >
            <ModelViewer file={file} alt={alt} orbit={orbit} className="size-full" />
        </div>
    );
}
