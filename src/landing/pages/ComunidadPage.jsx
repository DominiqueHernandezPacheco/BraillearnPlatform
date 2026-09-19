import SiteShell from '../SiteShell';
import Community from '../components/Community';

// Directorio de apoyo en Campeche: vive aparte de la historia del proyecto.
export default function ComunidadPage() {
    return (
        <SiteShell page="comunidad">
            <Community />
        </SiteShell>
    );
}
