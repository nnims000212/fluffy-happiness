// src/context/TodoContext.tsx
import React, { createContext, useContext, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Todo } from '../types/index';
import toast from 'react-hot-toast';

interface TodoContextType {
    // Todo data
    todos: Todo[];
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
    
    // Todo operations
    addTodo: (todoData: { text: string; projectId: string; notes?: string }) => string;
    updateTodo: (todoId: string, updates: Partial<Omit<Todo, 'id' | 'notes'>> & { notes?: string }) => void;
    deleteTodo: (todoId: string) => void;
    restoreTodo: (todoId: string) => void;
    permanentlyDeleteTodo: (todoId: string) => void;
    cleanupOldDeletedTodos: () => void;
    
    // Todo state management
    activeTodoId: string | null;
    setActiveTodoId: React.Dispatch<React.SetStateAction<string | null>>;
    selectedTodoId: string | null;
    setSelectedTodoId: React.Dispatch<React.SetStateAction<string | null>>;
    
    // Project relationship handlers
    handleProjectDeleted: (projectName: string) => void;
    handleProjectRenamed: (oldName: string, newName: string) => void;
}

const TodoContext = createContext<TodoContextType | null>(null);

export const TodoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [todos, setTodos] = useLocalStorage<Todo[]>('focusTimerTodos', []);
    const [activeTodoId, setActiveTodoId] = React.useState<string | null>(null);
    const [selectedTodoId, setSelectedTodoId] = React.useState<string | null>(null);

    const addTodo = useCallback((todoData: { text: string; projectId: string; notes?: string }): string => {
        if (!todoData.text.trim()) {
            toast.error("To-do text cannot be empty.");
            return '';
        }
        const newTodo: Todo = {
            id: `todo_${Date.now()}`,
            text: todoData.text.trim(),
            projectId: todoData.projectId,
            completed: false,
            notes: todoData.notes || '',
            deleted: false,
        };
        setTodos(prev => [...prev, newTodo]);
        return newTodo.id;
    }, [setTodos]);

    const updateTodo = useCallback((todoId: string, updates: Partial<Omit<Todo, 'id' | 'notes'>> & { notes?: string }) => {
        setTodos(prev => prev.map(todo => {
            if (todo.id === todoId) {
                const updatedTodo = { ...todo, ...updates };
                
                // Set completedAt when marking as complete
                if (updates.completed === true && !todo.completed) {
                    updatedTodo.completedAt = new Date();
                    // If this is a focus task, mark focus completed date
                    if (todo.focusOrder !== undefined) {
                        updatedTodo.focusCompletedDate = new Date();
                    }
                }
                // Clear completedAt when marking as incomplete
                else if (updates.completed === false && todo.completed) {
                    updatedTodo.completedAt = undefined;
                    // Clear focus completed date
                    updatedTodo.focusCompletedDate = undefined;
                }
                
                return updatedTodo;
            }
            return todo;
        }));
    }, [setTodos]);

    const deleteTodo = useCallback((todoId: string) => {
        setTodos(prev => prev.map(todo => 
            todo.id === todoId 
                ? { ...todo, deleted: true, deletedAt: new Date() }
                : todo
        ));
        toast.success("Task moved to trash.");
    }, [setTodos]);

    const restoreTodo = useCallback((todoId: string) => {
        setTodos(prev => prev.map(todo => 
            todo.id === todoId 
                ? { ...todo, deleted: false, deletedAt: undefined, completed: false }
                : todo
        ));
        toast.success("Task restored!");
    }, [setTodos]);

    const permanentlyDeleteTodo = useCallback((todoId: string) => {
        setTodos(prev => prev.filter(todo => todo.id !== todoId));
        toast.success("Task permanently deleted.");
    }, [setTodos]);

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

    // Handle project operations that affect todos
    const handleProjectDeleted = useCallback((projectName: string) => {
        setTodos(prev => prev.map(todo => 
            todo.projectId === projectName ? { ...todo, projectId: '' } : todo
        ));
    }, [setTodos]);

    const handleProjectRenamed = useCallback((oldName: string, newName: string) => {
        setTodos(prev => prev.map(todo => 
            todo.projectId === oldName ? { ...todo, projectId: newName } : todo
        ));
    }, [setTodos]);

    // Data migration and cleanup
    useEffect(() => {
        let migrationErrors = 0;
        
        try {
            // Migrate existing todos to include deleted field and validate structure
            setTodos(prev => {
                const migrated = prev.map(todo => ({
                    ...todo,
                    deleted: todo.deleted ?? false,
                    notes: todo.notes ?? '',
                    projectId: todo.projectId ?? ''
                }));
                
                // Filter out any invalid todos
                const valid = migrated.filter(todo => {
                    if (!todo.id || !todo.text || typeof todo.completed !== 'boolean') {
                        console.warn('🔍 Removing invalid todo during migration:', todo);
                        migrationErrors++;
                        return false;
                    }
                    return true;
                });
                
                if (valid.length !== migrated.length) {
                    console.log(`🔧 Cleaned up ${migrated.length - valid.length} invalid todos during migration`);
                }
                
                return valid;
            });

            // Show migration summary if there were issues
            if (migrationErrors > 0) {
                console.warn(`⚠️ Todo migration completed with ${migrationErrors} issues. Some corrupted data was cleaned up.`);
            } else {
                console.log('✅ Todo migration completed successfully');
            }

            // Run cleanup on app start
            cleanupOldDeletedTodos();

            // Set up daily cleanup
            const cleanupInterval = setInterval(() => {
                cleanupOldDeletedTodos();
            }, 24 * 60 * 60 * 1000); // Run every 24 hours

            return () => clearInterval(cleanupInterval);
        } catch (migrationError) {
            console.error('🚨 Critical error during todo migration:', migrationError);
        }
    }, [cleanupOldDeletedTodos, setTodos]);

    const value: TodoContextType = {
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
        handleProjectDeleted,
        handleProjectRenamed,
    };

    return (
        <TodoContext.Provider value={value}>
            {children}
        </TodoContext.Provider>
    );
};

export const useTodoContext = () => {
    const context = useContext(TodoContext);
    if (context === null) {
        throw new Error('useTodoContext must be used within a TodoProvider');
    }
    return context;
};