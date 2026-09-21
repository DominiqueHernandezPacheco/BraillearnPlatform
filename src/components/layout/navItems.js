import { House, BookOpen, MessageSquareText } from 'lucide-react';

// Secciones principales de la plataforma. Las usan el menú superior (escritorio)
// y la barra inferior (móvil), para que nunca se desincronicen.
export const NAV_ITEMS = [
    { page: 'plataforma', label: 'Inicio', icon: House, hash: '#/inicio' },
    { page: 'cursos', label: 'Cursos', icon: BookOpen, hash: '#/cursos', tour: 'nav-cursos' },
    { page: 'mensajes', label: 'Mensajes', icon: MessageSquareText, hash: '#/mensajes', tour: 'nav-mensajes' },
];
