// Efectos de sonido de los cuentos: grabaciones realistas generadas UNA vez con
// la API de efectos de sonido de ElevenLabs (`npm run sfx:generate`) y guardadas
// como archivos en src/assets/sfx/<nombre>.mp3 — así no se gasta nada al usarlos.
//
//   prompt    descripción para generarlo (en inglés rinde mejor)
//   duration  segundos que dura
//   volume    volumen al reproducirlo (0 a 1), para que no tape a Braulio
//
// Si falta el archivo de un efecto, simplemente no suena. Para regenerar uno:
//   npm run sfx:generate -- --only=risa --force

export const SFX = {
    // — de la historia —
    pajaros: { prompt: 'Several small birds chirping and tweeting in a quiet forest, gentle, daytime', duration: 4, volume: 0.6 },
    golpe: { prompt: 'Three firm knocks on a wooden door, knock knock knock', duration: 2, volume: 0.8 },
    aullido: { prompt: 'A lone wolf howling in the distance at night, long mournful howl', duration: 4, volume: 0.7 },
    viento: { prompt: 'A strong gust of wind, someone huffing and puffing hard blowing air, whooshing', duration: 3, volume: 0.8 },
    lluvia: { prompt: 'Gentle rain falling on leaves and the ground with a distant thunder rumble', duration: 5, volume: 0.6 },
    grillos: { prompt: 'Crickets chirping at night in a quiet field, peaceful ambience', duration: 5, volume: 0.5 },
    amanecer: { prompt: 'Peaceful sunrise morning ambience with soft birdsong and a gentle breeze', duration: 5, volume: 0.5 },
    agua: { prompt: 'A gentle stream of water flowing over small rocks, calm river sounds', duration: 5, volume: 0.55 },
    magia: { prompt: 'Magical sparkle chime, twinkling fairy dust shimmer, short', duration: 2.5, volume: 0.7 },
    campana: { prompt: 'A single clear bell ringing, resonant ding', duration: 3, volume: 0.7 },
    galope: { prompt: 'Fast hurried running footsteps on a dirt path, galloping animal', duration: 3, volume: 0.7 },
    pasos: { prompt: 'Slow steady footsteps walking on a dirt path, four steps', duration: 3, volume: 0.7 },
    aplausos: { prompt: 'A small crowd of people and children clapping and cheering happily', duration: 4, volume: 0.7 },
    reloj: { prompt: 'A pocket watch ticking loudly, tick tock tick tock', duration: 3, volume: 0.6 },
    caida: { prompt: 'A person falling down a long deep hole, descending whoosh with a soft thud at the end', duration: 4, volume: 0.7 },
    puerta: { prompt: 'A slow creaky wooden door opening, long creak', duration: 3, volume: 0.7 },
    risa: { prompt: 'A cheerful child laughing, short happy giggle', duration: 2.5, volume: 0.8 },
    burla: { prompt: 'A group of children laughing and teasing mockingly, cheeky laughter', duration: 3, volume: 0.7 },
    cerditos: { prompt: 'Cute little piglets oinking and squealing happily', duration: 3, volume: 0.7 },
    patos: { prompt: 'A group of ducks quacking on a farm', duration: 3, volume: 0.7 },
    silbato: { prompt: 'A referee whistle blowing a short start signal', duration: 1.5, volume: 0.7 },

    // — de la interfaz del lector —
    linea: { prompt: 'A soft gentle wooden tap, subtle interface click', duration: 0.5, volume: 0.5 },
    parte: { prompt: 'A soft pleasant two note chime, gentle storybook transition', duration: 1.5, volume: 0.5 },
};
