import SiteShell from '../SiteShell';
import Hero from '../components/Hero';
import ScrollStatement from '../components/home/ScrollStatement';
import DisplaySection from '../components/home/DisplaySection';
import PlatformSection from '../components/home/PlatformSection';
import BentoSection from '../components/home/BentoSection';
import ModularSection from '../components/home/ModularSection';

// Home: solo Braillearn y el producto. La historia y la ingeniería viven en sus páginas.
export default function HomePage() {
    return (
        <SiteShell page="home" darkHero>
            <Hero />
            <ScrollStatement />
            <DisplaySection />
            <PlatformSection />
            <BentoSection />
            <ModularSection />
        </SiteShell>
    );
}
