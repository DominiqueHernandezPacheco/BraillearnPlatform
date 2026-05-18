import { useState, useEffect } from 'react';

export const useProgress = () => {
    // 1. Cargamos el progreso guardado o iniciamos uno en blanco
    const [progress, setProgress] = useState(() => {
        const savedProgress = localStorage.getItem('braillearn_progress');
        return savedProgress ? JSON.parse(savedProgress) : {
            completedLessons: [], // Arreglo con los IDs de las lecciones terminadas
            lastLesson: null      // ID de la última lección abierta
        };
    });

    // 2. Cada vez que el progreso cambie, lo guardamos en el navegador
    useEffect(() => {
        localStorage.setItem('braillearn_progress', JSON.stringify(progress));
    }, [progress]);

    // 3. Función para marcar una lección como terminada
    const markLessonComplete = (lessonId) => {
        setProgress(prev => {
            // Si ya la había terminado antes, no hacemos nada
            if (prev.completedLessons.includes(lessonId)) return prev;
            return {
                ...prev,
                completedLessons: [...prev.completedLessons, lessonId]
            };
        });
    };

    // 4. Función para recordar dónde se quedó
    const updateLastLesson = (lessonId) => {
        setProgress(prev => ({ ...prev, lastLesson: lessonId }));
    };

    // 5. Función para calcular el porcentaje
    const getPercentage = (totalLessonsInCourse) => {
        if (!totalLessonsInCourse || totalLessonsInCourse === 0) return 0;
        return Math.round((progress.completedLessons.length / totalLessonsInCourse) * 100);
    };

    return {
        completedLessons: progress.completedLessons,
        lastLesson: progress.lastLesson,
        markLessonComplete,
        updateLastLesson,
        getPercentage
    };
};