// src/utils/iconMap.jsx
import React from 'react';
import { BookOpen, UserIcon, TargetIcon, ZapIcon } from '../components/common/Icons';

// Devuelve el icono correcto basado en el string que venga de los datos (o API)
export const getIcon = (type, className = "w-16 h-16") => {
    switch (type) {
        // Iconos de Módulos
        case 'book': return <BookOpen className={className} />;
        case 'star': return <ZapIcon className={className} />;
        case 'target-module': return <TargetIcon className={className} />;
        
        // Iconos de Lecciones
        case 'book-open': return <BookOpen className={`${className} text-blue-500`} />;
        case 'user': return <UserIcon className={`${className} text-purple-500`} />;
        case 'target': return <TargetIcon className={`${className} text-green-500`} />;
        
        default: return <BookOpen className={className} />;
    }
};