// src/utils/dataValidation.ts
import type { Session, Todo, Project, FocusHistory, FocusSettings } from '../types/index';

// Type guards for runtime validation
export function isValidSession(obj: any): obj is Session {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        obj.id.length > 0 &&
        obj.startTime instanceof Date &&
        typeof obj.durationMs === 'number' &&
        obj.durationMs >= 0 &&
        typeof obj.description === 'string' &&
        typeof obj.project === 'string' &&
        (obj.todoId === null || obj.todoId === undefined || typeof obj.todoId === 'string') &&
        (obj.notes === undefined || typeof obj.notes === 'string')
    );
}

export function isValidTodo(obj: any): obj is Todo {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        obj.id.length > 0 &&
        typeof obj.text === 'string' &&
        obj.text.trim().length > 0 &&
        typeof obj.completed === 'boolean' &&
        typeof obj.projectId === 'string' &&
        typeof obj.notes === 'string' &&
        typeof obj.deleted === 'boolean' &&
        (obj.completedAt === undefined || obj.completedAt instanceof Date) &&
        (obj.deletedAt === undefined || obj.deletedAt instanceof Date) &&
        (obj.focusOrder === undefined || (typeof obj.focusOrder === 'number' && obj.focusOrder >= 1 && obj.focusOrder <= 3)) &&
        (obj.focusSetDate === undefined || obj.focusSetDate instanceof Date) &&
        (obj.focusCompletedDate === undefined || obj.focusCompletedDate instanceof Date)
    );
}

export function isValidProject(obj: any): obj is Project {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        obj.id.length > 0 &&
        typeof obj.name === 'string' &&
        obj.name.trim().length > 0 &&
        typeof obj.notes === 'string' &&
        typeof obj.archived === 'boolean' &&
        obj.createdAt instanceof Date &&
        (obj.archivedAt === undefined || obj.archivedAt instanceof Date)
    );
}

export function isValidFocusHistory(obj: any): obj is FocusHistory {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        obj.id.length > 0 &&
        obj.date instanceof Date &&
        Array.isArray(obj.focusTasks) &&
        obj.focusTasks.every((task: any) => 
            task &&
            typeof task === 'object' &&
            typeof task.position === 'number' &&
            task.position >= 1 &&
            task.position <= 3 &&
            typeof task.todoId === 'string' &&
            typeof task.todoText === 'string' &&
            typeof task.projectId === 'string' &&
            typeof task.completed === 'boolean' &&
            (task.completedAt === undefined || task.completedAt instanceof Date)
        ) &&
        typeof obj.resetType === 'string' &&
        ['manual', 'auto', 'continued', 'clear', 'preserve-incomplete'].includes(obj.resetType)
    );
}

export function isValidFocusSettings(obj: any): obj is FocusSettings {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.autoResetEnabled === 'boolean' &&
        typeof obj.resetTime === 'string' &&
        /^\d{2}:\d{2}$/.test(obj.resetTime) &&
        typeof obj.preserveIncomplete === 'boolean' &&
        typeof obj.showCompletionCelebration === 'boolean'
    );
}

// Array validators
export function validateSessionArray(data: any): Session[] {
    if (!Array.isArray(data)) {
        console.warn('🔍 Sessions data is not an array, returning empty array');
        return [];
    }

    const validSessions = data.filter((session, index) => {
        const isValid = isValidSession(session);
        if (!isValid) {
            console.warn(`🔍 Invalid session at index ${index}:`, session);
        }
        return isValid;
    });

    if (validSessions.length !== data.length) {
        console.warn(`🔍 Filtered out ${data.length - validSessions.length} invalid sessions`);
    }

    return validSessions;
}

export function validateTodoArray(data: any): Todo[] {
    if (!Array.isArray(data)) {
        console.warn('🔍 Todos data is not an array, returning empty array');
        return [];
    }

    const validTodos = data.filter((todo, index) => {
        const isValid = isValidTodo(todo);
        if (!isValid) {
            console.warn(`🔍 Invalid todo at index ${index}:`, todo);
        }
        return isValid;
    });

    if (validTodos.length !== data.length) {
        console.warn(`🔍 Filtered out ${data.length - validTodos.length} invalid todos`);
    }

    return validTodos;
}

export function validateProjectArray(data: any): Project[] {
    if (!Array.isArray(data)) {
        console.warn('🔍 Projects data is not an array, returning empty array');
        return [];
    }

    const validProjects = data.filter((project, index) => {
        const isValid = isValidProject(project);
        if (!isValid) {
            console.warn(`🔍 Invalid project at index ${index}:`, project);
        }
        return isValid;
    });

    if (validProjects.length !== data.length) {
        console.warn(`🔍 Filtered out ${data.length - validProjects.length} invalid projects`);
    }

    return validProjects;
}

export function validateFocusHistoryArray(data: any): FocusHistory[] {
    if (!Array.isArray(data)) {
        console.warn('🔍 Focus history data is not an array, returning empty array');
        return [];
    }

    const validHistory = data.filter((entry, index) => {
        const isValid = isValidFocusHistory(entry);
        if (!isValid) {
            console.warn(`🔍 Invalid focus history at index ${index}:`, entry);
        }
        return isValid;
    });

    if (validHistory.length !== data.length) {
        console.warn(`🔍 Filtered out ${data.length - validHistory.length} invalid focus history entries`);
    }

    return validHistory;
}

// Data sanitization functions
export function sanitizeSession(session: Partial<Session>): Session | null {
    try {
        if (!session.id || !session.startTime || session.durationMs === undefined || !session.description) {
            return null;
        }

        return {
            id: String(session.id),
            startTime: new Date(session.startTime),
            durationMs: Math.max(0, Number(session.durationMs)),
            description: String(session.description).trim(),
            project: String(session.project || ''),
            todoId: session.todoId ? String(session.todoId) : null,
            notes: session.notes ? String(session.notes) : undefined
        };
    } catch (error) {
        console.error('🔍 Error sanitizing session:', error);
        return null;
    }
}

export function sanitizeTodo(todo: Partial<Todo>): Todo | null {
    try {
        if (!todo.id || !todo.text || todo.completed === undefined || todo.deleted === undefined) {
            return null;
        }

        return {
            id: String(todo.id),
            text: String(todo.text).trim(),
            completed: Boolean(todo.completed),
            projectId: String(todo.projectId || ''),
            notes: String(todo.notes || ''),
            deleted: Boolean(todo.deleted),
            completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
            deletedAt: todo.deletedAt ? new Date(todo.deletedAt) : undefined,
            focusOrder: todo.focusOrder ? Math.max(1, Math.min(3, Number(todo.focusOrder))) : undefined,
            focusSetDate: todo.focusSetDate ? new Date(todo.focusSetDate) : undefined,
            focusCompletedDate: todo.focusCompletedDate ? new Date(todo.focusCompletedDate) : undefined
        };
    } catch (error) {
        console.error('🔍 Error sanitizing todo:', error);
        return null;
    }
}

export function sanitizeProject(project: Partial<Project>): Project | null {
    try {
        if (!project.id || !project.name || project.archived === undefined || !project.createdAt) {
            return null;
        }

        return {
            id: String(project.id),
            name: String(project.name).trim(),
            notes: String(project.notes || ''),
            archived: Boolean(project.archived),
            createdAt: new Date(project.createdAt),
            archivedAt: project.archivedAt ? new Date(project.archivedAt) : undefined
        };
    } catch (error) {
        console.error('🔍 Error sanitizing project:', error);
        return null;
    }
}

// Comprehensive data health check
export function performDataHealthCheck(): {
    healthy: boolean;
    issues: string[];
    recommendations: string[];
} {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
        // Check localStorage availability
        if (!localStorage) {
            issues.push('localStorage is not available');
            recommendations.push('Check if private browsing is enabled');
        }

        // Check data integrity for each key
        const keys = ['focusTimerSessions', 'focusTimerTodos', 'focusTimerProjects', 'focusTimerFocusHistory', 'focusTimerFocusSettings'];
        
        for (const key of keys) {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    JSON.parse(data);
                }
            } catch (parseError) {
                issues.push(`Corrupted data detected in ${key}`);
                recommendations.push(`Consider clearing ${key} or restoring from backup`);
            }
        }

        // Check storage usage
        const usage = new Blob(Object.values(localStorage)).size;
        if (usage > 4 * 1024 * 1024) { // 4MB threshold
            issues.push('localStorage usage is high');
            recommendations.push('Consider clearing old focus history entries');
        }

        return {
            healthy: issues.length === 0,
            issues,
            recommendations
        };
    } catch (error) {
        return {
            healthy: false,
            issues: ['Failed to perform data health check'],
            recommendations: ['Check browser console for detailed errors']
        };
    }
}