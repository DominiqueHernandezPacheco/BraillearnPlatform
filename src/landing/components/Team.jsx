import Container from './ui/Container';
import Reveal from './ui/Reveal';
import StageHeading from './ui/StageHeading';
import TeamPhoto from './TeamPhoto';
import { useCopy } from '../i18n/languageContext';
import { advisor, faculty, university } from '../content';

export default function Team() {
    const t = useCopy().team;

    return (
        <section id="equipo" aria-labelledby="team-title" className="relative py-28 sm:py-36 lg:py-44">
            <Container>
                <StageHeading
                    id="team-title"
                    eyebrow={t.eyebrow}
                    title={t.title}
                    lead={t.lead(faculty, university, advisor)}
                />
                <Reveal className="mt-16 sm:mt-20">
                    <TeamPhoto />
                </Reveal>
            </Container>
        </section>
    );
}
