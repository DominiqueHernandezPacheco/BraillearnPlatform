import SiteShell from '../SiteShell';
import TechIntro from '../components/tech/TechIntro';
import Hardware from '../components/tech/Hardware';
import SoftwareSection from '../components/tech/SoftwareSection';

// Misma lógica que el home: una idea por pantalla, mucho aire y fondos que fluyen.
export default function TecnologiaPage() {
    return (
        <SiteShell page="tecnologia">
            <TechIntro />
            <Hardware />
            <SoftwareSection />
        </SiteShell>
    );
}
