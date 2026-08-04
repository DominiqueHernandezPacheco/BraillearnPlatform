import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

const USER_KEY = 'braillearn_user';
const ONBOARDING_KEY = 'braillearn_onboarding_completed';

export const UserProvider = ({ children }) => {
    // Cuenta local del dispositivo (sin backend todavía — mismo patrón que useProgress)
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem(USER_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    // Onboarding completado por usuario: { [userId]: true }
    const [completedMap, setCompletedMap] = useState(() => {
        try {
            const saved = localStorage.getItem(ONBOARDING_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    }, [user]);

    useEffect(() => {
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify(completedMap));
    }, [completedMap]);

    // Crea (o renombra) el usuario activo de este dispositivo
    const setUserName = (name) => {
        setUser(prev => ({
            id: prev?.id || `local-${Date.now()}`,
            name: name.trim() || 'Estudiante',
        }));
    };

    const hasCompletedOnboarding = user ? !!completedMap[user.id] : false;

    const completeOnboarding = () => {
        if (!user) return;
        setCompletedMap(prev => ({ ...prev, [user.id]: true }));
    };

    // Para volver a ver el tour desde el panel de accesibilidad
    const resetOnboarding = () => {
        if (!user) return;
        setCompletedMap(prev => {
            const next = { ...prev };
            delete next[user.id];
            return next;
        });
    };

    return (
        <UserContext.Provider value={{
            user,
            setUserName,
            hasCompletedOnboarding,
            completeOnboarding,
            resetOnboarding,
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
