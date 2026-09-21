// src/utils/iconMap.jsx
import React from 'react';
import {
    BookOpen, Hand, Languages, User, School, Sparkles, Grip, Layers, Target, Zap, Star,
} from 'lucide-react';

// Devuelve el icono correcto según el texto (`iconType`) que venga de los
// datos (o de una API). Siempre decorativo: quien lo usa pone el texto.
const ICONS = {
    // Módulos
    book: BookOpen,
    star: Zap,
    'target-module': Target,
    // Pasos
    'book-open': BookOpen,
    hand: Hand,
    languages: Languages,
    user: User,
    school: School,
    sparkles: Sparkles,
    grip: Grip,
    layers: Layers,
    target: Target,
    highlight: Star,
};

export const getIcon = (type, className = "h-8 w-8") => {
    const Icon = ICONS[type] ?? BookOpen;
    return <Icon className={className} aria-hidden="true" />;
};
