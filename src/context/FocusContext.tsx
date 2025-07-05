// src/context/FocusContext.tsx
import React, { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { FocusHistory, FocusSettings, Todo } from '../types/index';

interface FocusContextType {
    // Focus data
    focusHistory: FocusHistory[];
    focusSettings: FocusSettings;
    
    // Focus operations
    setFocusOrder: (todoId: string, order: number | undefined, todos: Todo[], setTodos: React.Dispatch<React.SetStateAction<Todo[]>>) => void;
    clearFocusTasks: (setTodos: React.Dispatch<React.SetStateAction<Todo[]>>) => void;
    resetDailyFocus: (todos: Todo[], setTodos: React.Dispatch<React.SetStateAction<Todo[]>>, resetType: FocusHistory['resetType']) => void;
    updateFocusSettings: (updates: Partial<FocusSettings>) => void;
    getTodaysFocusTasks: (todos: Todo[]) => Todo[];
    getLastFocusDate: () => Date | null;
    clearFocusHistory: () => void;
    
    // Daily reset logic
    checkForDailyReset: (todos: Todo[]) => boolean;
    markAppLaunch: () => void;
}

const FocusContext = createContext<FocusContextType | null>(null);

export const FocusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [focusHistory, setFocusHistory] = useLocalStorage<FocusHistory[]>('focusTimerFocusHistory', []);
    const [focusSettings, setFocusSettings] = useLocalStorage<FocusSettings>('focusTimerFocusSettings', {
        autoResetEnabled: true,
        resetTime: '06:00',
        preserveIncomplete: true,
        showCompletionCelebration: true
    });
    const [lastAppLaunchDate, setLastAppLaunchDate] = useLocalStorage<string | null>('focusTimerLastLaunch', null);

    const setFocusOrder = useCallback((todoId: string, order: number | undefined, _todos: Todo[], setTodos: React.Dispatch<React.SetStateAction<Todo[]>>) => {
        setTodos(prev => prev.map(todo => {
            if (todo.id === todoId) {
                const updatedTodo = { ...todo, focusOrder: order };
                if (order !== undefined) {
                    updatedTodo.focusSetDate = new Date();
                } else {
                    updatedTodo.focusSetDate = undefined;
                    updatedTodo.focusCompletedDate = undefined;
                }
                return updatedTodo;
            }
            return todo;
        }));
    }, []);

    const clearFocusTasks = useCallback((setTodos: React.Dispatch<React.SetStateAction<Todo[]>>) => {
        setTodos(prev => prev.map(todo => ({
            ...todo,
            focusOrder: undefined,
            focusSetDate: undefined,
            focusCompletedDate: undefined
        })));
    }, []);

    const resetDailyFocus = useCallback((todos: Todo[], setTodos: React.Dispatch<React.SetStateAction<Todo[]>>, resetType: FocusHistory['resetType']) => {
        const currentFocusTasks = todos.filter(todo => todo.focusOrder !== undefined);
        
        // Archive current focus tasks to history
        if (currentFocusTasks.length > 0) {
            const historyEntry: FocusHistory = {
                id: `focus_${Date.now()}`,
                date: new Date(),
                focusTasks: currentFocusTasks.map(todo => ({
                    position: todo.focusOrder as 1 | 2 | 3,
                    todoId: todo.id,
                    todoText: todo.text,
                    projectId: todo.projectId,
                    completed: todo.completed,
                    completedAt: todo.completedAt
                })),
                resetType
            };
            setFocusHistory(prev => [historyEntry, ...prev]);
        }

        // Reset focus tasks based on type
        if (resetType === 'clear') {
            clearFocusTasks(setTodos);
        } else if (resetType === 'preserve-incomplete') {
            setTodos(prev => prev.map(todo => {
                if (todo.focusOrder !== undefined && todo.completed) {
                    return {
                        ...todo,
                        focusOrder: undefined,
                        focusSetDate: undefined,
                        focusCompletedDate: undefined
                    };
                }
                return todo;
            }));
        }
    }, [setFocusHistory, clearFocusTasks]);

    const updateFocusSettings = useCallback((updates: Partial<FocusSettings>) => {
        setFocusSettings(prev => ({ ...prev, ...updates }));
    }, [setFocusSettings]);

    const getTodaysFocusTasks = useCallback((todos: Todo[]) => {
        return todos
            .filter(todo => todo.focusOrder !== undefined)
            .sort((a, b) => (a.focusOrder || 0) - (b.focusOrder || 0));
    }, []);

    const getLastFocusDate = useCallback(() => {
        if (focusHistory.length === 0) return null;
        return focusHistory[0].date;
    }, [focusHistory]);

    const clearFocusHistory = useCallback(() => {
        setFocusHistory([]);
    }, [setFocusHistory]);

    const checkForDailyReset = useCallback((todos: Todo[]) => {
        console.log('[Focus Context Debug] Checking for daily reset...');
        console.log('[Focus Context Debug] Auto reset enabled:', focusSettings.autoResetEnabled);
        
        if (!focusSettings.autoResetEnabled) {
            console.log('[Focus Context Debug] Auto reset disabled, returning false');
            return false;
        }
        
        const now = new Date();
        const today = now.toDateString();
        
        // Check if there are any focus tasks to reset
        const hasFocusTasks = todos.some(todo => todo.focusOrder !== undefined);
        
        console.log('[Focus Context Debug] Today:', today);
        console.log('[Focus Context Debug] Last launch date:', lastAppLaunchDate);
        console.log('[Focus Context Debug] Has focus tasks:', hasFocusTasks);
        console.log('[Focus Context Debug] Focus tasks count:', todos.filter(todo => todo.focusOrder !== undefined).length);
        
        // If this is the first launch ever, mark it but don't show reset
        if (!lastAppLaunchDate) {
            console.log('[Focus Context Debug] First launch ever, marking date and returning false');
            setLastAppLaunchDate(today);
            return false;
        }
        
        // Only trigger reset if we launched on a different date AND there are focus tasks
        if (lastAppLaunchDate !== today && hasFocusTasks) {
            console.log('[Focus Context Debug] Different date AND has focus tasks, returning true');
            return true;
        }
        
        console.log('[Focus Context Debug] No reset needed, returning false');
        return false;
    }, [focusSettings.autoResetEnabled, lastAppLaunchDate, setLastAppLaunchDate]);
    
    const markAppLaunch = useCallback(() => {
        const today = new Date().toDateString();
        setLastAppLaunchDate(today);
    }, [setLastAppLaunchDate]);

    const value: FocusContextType = {
        focusHistory,
        focusSettings,
        setFocusOrder,
        clearFocusTasks,
        resetDailyFocus,
        updateFocusSettings,
        getTodaysFocusTasks,
        getLastFocusDate,
        clearFocusHistory,
        checkForDailyReset,
        markAppLaunch,
    };

    return (
        <FocusContext.Provider value={value}>
            {children}
        </FocusContext.Provider>
    );
};

export const useFocusContext = () => {
    const context = useContext(FocusContext);
    if (context === null) {
        throw new Error('useFocusContext must be used within a FocusProvider');
    }
    return context;
};