// src/context/AppContext.tsx

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Session, Todo, Project } from '../types';
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
    projects: Project[];
    addProject: (projectName: string) => boolean;
    updateProject: (projectId: string, updates: Partial<Omit<Project, 'id'>>, showToast?: boolean) => void;
    deleteProject: (projectId: string) => void;
    archiveProject: (projectId: string) => void;
    unarchiveProject: (projectId: string) => void;
    renameProject: (oldName: string, newName: string) => boolean; // Legacy support

    // Todos
    todos: Todo[];
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
    // MODIFIED: addTodo now returns the ID of the new todo
    addTodo: (todoData: { text: string; projectId: string; notes?: string }) => string;
    updateTodo: (todoId: string, updates: Partial<Omit<Todo, 'id' | 'notes'>> & { notes?: string }) => void;
    deleteTodo: (todoId: string) => void; // Soft delete (move to trash)
    restoreTodo: (todoId: string) => void; // Restore from trash
    permanentlyDeleteTodo: (todoId: string) => void; // Permanent delete
    cleanupOldDeletedTodos: () => void; // Remove items older than 30 days

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
    const [projects, setProjects] = useLocalStorage<Project[]>('focusTimerProjects', []);
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
        if (projects.find(p => p.name === projectName)) {
            toast.error(`Project "${projectName}" already exists.`);
            return false;
        }
        
        const newProject: Project = {
            id: `project_${Date.now()}`,
            name: projectName,
            notes: '',
            archived: false,
            createdAt: new Date()
        };
        
        setProjects(prevProjects => [...prevProjects, newProject].sort((a,b) => a.name.localeCompare(b.name)));
        toast.success(`Project "${projectName}" added!`);
        return true;
    };

    const updateProject = (projectId: string, updates: Partial<Omit<Project, 'id'>>, showToast: boolean = true) => {
        setProjects(prev => prev.map(project => 
            project.id === projectId ? { ...project, ...updates } : project
        ));
        if (showToast && !updates.notes) {
            toast.success("Project updated!");
        } else if (showToast && updates.notes !== undefined) {
            toast.success("Project notes saved!");
        }
    };

    const deleteProject = (projectId: string): void => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        // Update all todos that have this project to have no project
        setTodos(prev => prev.map(todo => 
            todo.projectId === project.name ? { ...todo, projectId: '' } : todo
        ));
        
        // Update all sessions that have this project to have no project  
        setSessions(prev => prev.map(session =>
            session.project === project.name ? { ...session, project: '' } : session
        ));
        
        // Remove the project
        setProjects(prev => prev.filter(p => p.id !== projectId));
        toast.success(`Project "${project.name}" deleted!`);
    };

    const archiveProject = (projectId: string): void => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        setProjects(prev => prev.map(p => 
            p.id === projectId ? { ...p, archived: true, archivedAt: new Date() } : p
        ));
        toast.success(`Project "${project.name}" archived!`);
    };

    const unarchiveProject = (projectId: string): void => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        setProjects(prev => prev.map(p => 
            p.id === projectId ? { ...p, archived: false, archivedAt: undefined } : p
        ));
        toast.success(`Project "${project.name}" unarchived!`);
    };

    // Legacy support for renaming projects by name
    const renameProject = (oldName: string, newName: string): boolean => {
        const existingProject = projects.find(p => p.name === newName);
        if (existingProject) {
            toast.error(`Project "${newName}" already exists.`);
            return false;
        }
        
        const projectToRename = projects.find(p => p.name === oldName);
        if (!projectToRename) {
            toast.error(`Project "${oldName}" not found.`);
            return false;
        }
        
        // Update all todos that have this project
        setTodos(prev => prev.map(todo => 
            todo.projectId === oldName ? { ...todo, projectId: newName } : todo
        ));
        
        // Update all sessions that have this project
        setSessions(prev => prev.map(session =>
            session.project === oldName ? { ...session, project: newName } : session
        ));
        
        // Update the project name
        setProjects(prev => prev.map(project => 
            project.id === projectToRename.id ? { ...project, name: newName } : project
        ).sort((a,b) => a.name.localeCompare(b.name)));
        
        toast.success(`Project renamed to "${newName}"!`);
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
            deleted: false, // New todos are not deleted
        };
        setTodos(prev => [...prev, newTodo]);
        return newTodo.id;
    };

    const updateTodo = (todoId: string, updates: Partial<Omit<Todo, 'id' | 'notes'>> & { notes?: string }) => {
        setTodos(prev => prev.map(todo => {
            if (todo.id === todoId) {
                const updatedTodo = { ...todo, ...updates };
                
                // Set completedAt when marking as complete
                if (updates.completed === true && !todo.completed) {
                    updatedTodo.completedAt = new Date();
                }
                // Clear completedAt when marking as incomplete
                else if (updates.completed === false && todo.completed) {
                    updatedTodo.completedAt = undefined;
                }
                
                return updatedTodo;
            }
            return todo;
        }));
    };

    const deleteTodo = (todoId: string) => {
        setTodos(prev => prev.map(todo => 
            todo.id === todoId 
                ? { ...todo, deleted: true, deletedAt: new Date() }
                : todo
        ));
        toast.success("Task moved to trash.");
    };

    const restoreTodo = (todoId: string) => {
        setTodos(prev => prev.map(todo => 
            todo.id === todoId 
                ? { ...todo, deleted: false, deletedAt: undefined, completed: false }
                : todo
        ));
        toast.success("Task restored!");
    };

    const permanentlyDeleteTodo = (todoId: string) => {
        setTodos(prev => prev.filter(todo => todo.id !== todoId));
        toast.success("Task permanently deleted.");
    };

    const cleanupOldDeletedTodos = useCallback(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        setTodos(prev => {
            const beforeCount = prev.filter(todo => todo.deleted).length;
            const filtered = prev.filter(todo => 
                !todo.deleted || 
                !todo.deletedAt || 
                todo.deletedAt > thirtyDaysAgo
            );
            const afterCount = filtered.filter(todo => todo.deleted).length;
            const deletedCount = beforeCount - afterCount;
            
            if (deletedCount > 0) {
                toast.success(`Cleaned up ${deletedCount} old deleted task${deletedCount === 1 ? '' : 's'}.`);
            }
            
            return filtered;
        });
    }, [setTodos]);
    
    const getSessionsForTodo = useCallback((todoId: string) => {
        return sessions.filter(session => session.todoId === todoId);
    }, [sessions]);

    // --- Data Migration and Cleanup ---
    useEffect(() => {
        // Migrate existing projects from string[] to Project[]
        const rawProjects = localStorage.getItem('focusTimerProjects');
        if (rawProjects) {
            try {
                const parsed = JSON.parse(rawProjects);
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                    // Convert string array to Project array
                    const migratedProjects: Project[] = parsed.map((name: string, index: number) => ({
                        id: `project_${Date.now()}_${index}`,
                        name,
                        notes: '',
                        archived: false,
                        createdAt: new Date()
                    }));
                    setProjects(migratedProjects);
                }
            } catch (e) {
                // If parsing fails, initialize with default projects
                const defaultProjects: Project[] = [
                    { id: 'project_work', name: 'Work', notes: '', archived: false, createdAt: new Date() },
                    { id: 'project_personal', name: 'Personal', notes: '', archived: false, createdAt: new Date() },
                    { id: 'project_learning', name: 'Learning', notes: '', archived: false, createdAt: new Date() }
                ];
                setProjects(defaultProjects);
            }
        }

        // Migrate existing todos to include deleted field
        setTodos(prev => prev.map(todo => ({
            ...todo,
            deleted: todo.deleted ?? false
        })));

        // Run cleanup on app start
        cleanupOldDeletedTodos();

        // Set up daily cleanup
        const cleanupInterval = setInterval(() => {
            cleanupOldDeletedTodos();
        }, 24 * 60 * 60 * 1000); // Run every 24 hours

        return () => clearInterval(cleanupInterval);
    }, [cleanupOldDeletedTodos, setProjects, setTodos]); // Include cleanupOldDeletedTodos in dependencies

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
        updateProject,
        deleteProject,
        archiveProject,
        unarchiveProject,
        renameProject,
        todos,
        setTodos,
        addTodo,
        updateTodo,
        deleteTodo,
        restoreTodo,
        permanentlyDeleteTodo,
        cleanupOldDeletedTodos,
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