// src/utils/courseGenerator.js

export const generateRandomExercises = () => {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const getRandomVowel = () => vowels[Math.floor(Math.random() * vowels.length)];
    const exercises = [];

    // Ejercicio fijo de Memoria
    exercises.push({ 
        id: 'ex-memo', type: 'memory', 
        title: "Calentamiento: Memorama", 
        question: "Encuentra los pares. Toca una carta para escuchar qué es." 
    });

    const types = ['builder', 'quiz', 'true_false', 'builder']; 
    
    for (let i = 0; i < 4; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const target = getRandomVowel();
        
        if (type === 'builder') {
            exercises.push({ 
                id: `ex-${i}`, type: 'builder', 
                title: `Reto ${i+2}: Constructor`, 
                question: `Activa los puntos para formar la letra ${target.toUpperCase()}.`, 
                targetChar: target 
            });
        } else if (type === 'quiz') {
            const options = vowels.sort(() => 0.5 - Math.random()).slice(0, 3);
            if (!options.includes(target)) options[0] = target;
            exercises.push({ 
                id: `ex-${i}`, type: 'quiz', 
                title: `Reto ${i+2}: Identificación`, 
                question: "¿Qué letra representa este patrón de puntos?", 
                targetChar: target,
                options: options.sort(() => 0.5 - Math.random())
            });
        } else if (type === 'true_false') {
            const isCorrect = Math.random() > 0.5;
            const shownChar = isCorrect ? target : getRandomVowel();
            exercises.push({
                id: `ex-${i}`, type: 'true_false',
                title: `Reto ${i+2}: Verdadero o Falso`,
                question: `¿Este patrón corresponde a la letra ${target.toUpperCase()}?`,
                displayChar: shownChar,
                isCorrect: shownChar === target
            });
        }
    }
    return exercises;
};