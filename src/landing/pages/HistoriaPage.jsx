import SiteShell from '../SiteShell';
import HistoryHero from '../components/history/HistoryHero';
import HistoryChapters from '../components/history/HistoryChapters';
import Team from '../components/Team';

// Primero el video de la medalla; después la historia como una línea progresiva
// y las personas detrás del proyecto.
export default function HistoriaPage() {
    return (
        <SiteShell page="historia">
            <HistoryHero />
            <HistoryChapters />
            <Team />
        </SiteShell>
    );
}
