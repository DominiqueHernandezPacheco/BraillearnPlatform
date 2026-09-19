import Container from '../ui/Container';
import StageHeading from '../ui/StageHeading';
import { useCopy } from '../../i18n/languageContext';

export default function TechIntro() {
    const t = useCopy().architecture;

    return (
        <section aria-labelledby="tech-title" className="pb-8 pt-32 sm:pt-40">
            <Container>
                <StageHeading level="h1" id="tech-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
            </Container>
        </section>
    );
}
