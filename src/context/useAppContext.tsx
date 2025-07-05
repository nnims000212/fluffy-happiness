// src/context/useAppContext.tsx
import { useSessionContext } from './SessionContext';
import { useProjectContext } from './ProjectContext';
import { useTodoContext } from './TodoContext';
import { useFocusContext } from './FocusContext';
import { useSettingsContext } from './SettingsContext';

// Compatibility layer for the old useAppContext interface
export const useAppContext = () => {
    const sessionContext = useSessionContext();
    const projectContext = useProjectContext();
    const todoContext = useTodoContext();
    const focusContext = useFocusContext();
    const settingsContext = useSettingsContext();

    // Enhanced project operations that notify other contexts
    const deleteProject = (projectId: string) => {
        projectContext.deleteProject(projectId, todoContext.handleProjectDeleted);
    };

    const renameProject = (oldName: string, newName: string) => {
        return projectContext.renameProject(oldName, newName, todoContext.handleProjectRenamed);
    };

    // Enhanced focus operations that work with todos
    const setFocusOrder = (todoId: string, order: number | undefined) => {
        focusContext.setFocusOrder(todoId, order, todoContext.todos, todoContext.setTodos);
    };

    const clearFocusTasks = () => {
        focusContext.clearFocusTasks(todoContext.setTodos);
    };

    const resetDailyFocus = (resetType: Parameters<typeof focusContext.resetDailyFocus>[2]) => {
        focusContext.resetDailyFocus(todoContext.todos, todoContext.setTodos, resetType);
    };

    const getTodaysFocusTasks = () => {
        return focusContext.getTodaysFocusTasks(todoContext.todos);
    };

    // Handle session-todo relationships
    const updateSession = (sessionId: string, updates: Parameters<typeof sessionContext.updateSession>[1]) => {
        // Also update session relationships in todos if needed
        sessionContext.updateSession(sessionId, updates);
    };

    // Return the combined interface that matches the old AppContext
    return {
        // Page Navigation
        activePage: settingsContext.activePage,
        setActivePage: settingsContext.setActivePage,

        // Sessions
        sessions: sessionContext.sessions,
        setSessions: sessionContext.setSessions,
        addSession: sessionContext.addSession,
        updateSession,
        getSessionsForTodo: sessionContext.getSessionsForTodo,
        
        // Projects
        projects: projectContext.projects,
        addProject: projectContext.addProject,
        updateProject: projectContext.updateProject,
        deleteProject,
        archiveProject: projectContext.archiveProject,
        unarchiveProject: projectContext.unarchiveProject,
        renameProject,

        // Todos
        todos: todoContext.todos,
        setTodos: todoContext.setTodos,
        addTodo: todoContext.addTodo,
        updateTodo: todoContext.updateTodo,
        deleteTodo: todoContext.deleteTodo,
        restoreTodo: todoContext.restoreTodo,
        permanentlyDeleteTodo: todoContext.permanentlyDeleteTodo,
        cleanupOldDeletedTodos: todoContext.cleanupOldDeletedTodos,

        // Work Goals
        dailyWorkGoalHours: settingsContext.dailyWorkGoalHours,
        setDailyWorkGoalHours: settingsContext.setDailyWorkGoalHours,

        // Interaction between pages
        activeTodoId: todoContext.activeTodoId,
        setActiveTodoId: todoContext.setActiveTodoId,
        selectedTodoId: todoContext.selectedTodoId,
        setSelectedTodoId: todoContext.setSelectedTodoId,

        // Focus Management
        focusHistory: focusContext.focusHistory,
        focusSettings: focusContext.focusSettings,
        setFocusOrder,
        clearFocusTasks,
        resetDailyFocus,
        updateFocusSettings: focusContext.updateFocusSettings,
        getTodaysFocusTasks,
        getLastFocusDate: focusContext.getLastFocusDate,
        checkForDailyReset: () => focusContext.checkForDailyReset(todoContext.todos),
        markAppLaunch: focusContext.markAppLaunch,
        clearFocusHistory: focusContext.clearFocusHistory,
    };
};