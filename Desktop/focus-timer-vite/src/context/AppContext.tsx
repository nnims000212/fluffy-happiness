// src/context/AppContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Session, Todo } from '../types';
import toast from 'react-hot-toast';

type Page = 'home' | 'timer' | 'history' | 'todo';

interface AppContextType {
    // Page Navigation
    activePage: Page;
    setActivePage: React.Dispatch<React.SetStateAction<Page>>;

    // Sessions
    sessions: Session[];
    setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
    addSession: (session: Omit<Session, 'id'>) => void;
    updateSession: (sessionId: string, updates: Partial<Omit<Session, 'id'>>) => void;
    
    // Projects
    projects: string[];
    addProject: (projectName: string) => boolean;

    // Todos
    todos: Todo[];
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
    // MODIFIED: addTodo now returns the ID of the new todo
    addTodo: (todoData: { text: string; projectId: string; notes?: string }) => string;
    updateTodo: (todoId: string, updates: Partial<Omit<Todo, 'id' | 'notes'>> & { notes?: string }) => void;
    deleteTodo: (todoId: string) => void;

    // Interaction between pages
    activeTodoId: string | null;
    setActiveTodoId: React.Dispatch<React.SetStateAction<string | null>>;
    selectedTodoId: string | null;
    setSelectedTodoId: React.Dispatch<React.SetStateAction<string | null>>;
    getSessionsForTodo: (todoId: string) => Session[];
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- State Management ---
    const [activePage, setActivePage] = useState<Page>('home');
    const [sessions, setSessions] = useLocalStorage<Session[]>('focusTimerSessions', []);
    const [projects, setProjects] = useLocalStorage<string[]>('focusTimerProjects', ['Work', 'Personal', 'Learning']);
    const [todos, setTodos] = useLocalStorage<Todo[]>('focusTimerTodos', []);
    const [activeTodoId, setActiveTodoId] = useState<string | null>(null);
    const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);

    // --- Session Functions ---
    const addSession = (session: Omit<Session, 'id'>) => {
        const newSession: Session = {
            ...session,
            id: `session_${Date.now()}`, // Generate a unique ID for the session
            startTime: new Date(session.startTime),
        };
        setSessions(prevSessions => [...prevSessions, newSession]);
    };
    
    const updateSession = (sessionId: string, updates: Partial<Omit<Session, 'id'>>) => {
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updates } as Session : s));
        toast.success("Session note updated!");
    };
    
    // --- Project Functions ---
    const addProject = (projectName: string): boolean => {
        if (projects.includes(projectName)) {
            toast.error(`Project "${projectName}" already exists.`);
            return false;
        }
        setProjects(prevProjects => [...prevProjects, projectName].sort((a,b) => a.localeCompare(b)));
        toast.success(`Project "${projectName}" added!`);
        return true;
    };

    // --- Todo Functions ---
    const addTodo = (todoData: { text: string; projectId: string; notes?: string }): string => {
        if (!todoData.text.trim()) {
            toast.error("To-do text cannot be empty.");
            return '';
        }
        const newTodo: Todo = {
            id: `todo_${Date.now()}`,
            text: todoData.text.trim(),
            projectId: todoData.projectId,
            completed: false,
            notes: todoData.notes || '', // Initialize notes as empty string if not provided
        };
        setTodos(prev => [...prev, newTodo]);
        return newTodo.id;
    };

    const updateTodo = (todoId: string, updates: Partial<Omit<Todo, 'id' | 'notes'>> & { notes?: string }) => {
        setTodos(prev => prev.map(todo => 
            todo.id === todoId ? { ...todo, ...updates } : todo
        ));
    };

    const deleteTodo = (todoId: string) => {
        setTodos(prev => prev.filter(todo => todo.id !== todoId));
    };
    
    const getSessionsForTodo = useCallback((todoId: string) => {
        return sessions.filter(session => session.todoId === todoId);
    }, [sessions]);

    // --- Context Value ---
    const value = { 
        activePage,
        setActivePage,
        sessions, 
        setSessions,
        addSession,
        updateSession,
        projects, 
        addProject,
        todos,
        setTodos,
        addTodo,
        updateTodo,
        deleteTodo,
        activeTodoId,
        setActiveTodoId,
        selectedTodoId,
        setSelectedTodoId,
        getSessionsForTodo,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === null) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};