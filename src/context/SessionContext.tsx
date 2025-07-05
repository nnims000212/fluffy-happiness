// src/context/SessionContext.tsx
import React, { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Session } from '../types/index';
import toast from 'react-hot-toast';

interface SessionContextType {
    // Session data
    sessions: Session[];
    setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
    
    // Session operations
    addSession: (session: Omit<Session, 'id'>) => void;
    updateSession: (sessionId: string, updates: Partial<Omit<Session, 'id'>>) => void;
    getSessionsForTodo: (todoId: string) => Session[];
}

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sessions, setSessions] = useLocalStorage<Session[]>('focusTimerSessions', []);

    const addSession = useCallback((session: Omit<Session, 'id'>) => {
        const newSession: Session = {
            ...session,
            id: `session_${Date.now()}`,
            startTime: new Date(session.startTime),
        };
        setSessions(prevSessions => [...prevSessions, newSession]);
    }, [setSessions]);
    
    const updateSession = useCallback((sessionId: string, updates: Partial<Omit<Session, 'id'>>) => {
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updates } as Session : s));
        toast.success("Session note updated!");
    }, [setSessions]);

    const getSessionsForTodo = useCallback((todoId: string) => {
        return sessions.filter(session => session.todoId === todoId);
    }, [sessions]);

    const value: SessionContextType = {
        sessions,
        setSessions,
        addSession,
        updateSession,
        getSessionsForTodo,
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSessionContext = () => {
    const context = useContext(SessionContext);
    if (context === null) {
        throw new Error('useSessionContext must be used within a SessionProvider');
    }
    return context;
};