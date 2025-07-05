// Unit tests for daily reset functionality
// Based on the debugging scripts we created

import { createTestFocusTask, setupTestFocusTasks, setupTestFocusSettings, setYesterdayAsLastLaunch } from '../utils/testHelpers';
import type { Todo, FocusSettings } from '../types/index';

// Mock the actual reset logic (you'd import the real functions)
const checkForDailyReset = (
    todos: Todo[], 
    focusSettings: FocusSettings, 
    lastLaunchDate: string | null
): boolean => {
    if (!focusSettings.autoResetEnabled) return false;
    
    const today = new Date().toDateString();
    const hasFocusTasks = todos.some(todo => todo.focusOrder !== undefined);
    
    if (!lastLaunchDate) return false;
    
    return lastLaunchDate !== today && hasFocusTasks;
};

const getTodaysFocusTasks = (todos: Todo[]): Todo[] => {
    return todos
        .filter(todo => todo.focusOrder !== undefined)
        .sort((a, b) => (a.focusOrder || 0) - (b.focusOrder || 0));
};

describe('Daily Reset Logic', () => {
    describe('checkForDailyReset', () => {
        test('returns true when different day and has focus tasks', () => {
            const todos = setupTestFocusTasks();
            const settings = setupTestFocusSettings();
            const yesterday = setYesterdayAsLastLaunch();
            
            const result = checkForDailyReset(todos, settings, yesterday);
            
            expect(result).toBe(true);
        });

        test('returns false when same day', () => {
            const todos = setupTestFocusTasks();
            const settings = setupTestFocusSettings();
            const today = new Date().toDateString();
            
            const result = checkForDailyReset(todos, settings, today);
            
            expect(result).toBe(false);
        });

        test('returns false when no focus tasks', () => {
            const todos: Todo[] = []; // No focus tasks
            const settings = setupTestFocusSettings();
            const yesterday = setYesterdayAsLastLaunch();
            
            const result = checkForDailyReset(todos, settings, yesterday);
            
            expect(result).toBe(false);
        });

        test('returns false when auto-reset disabled', () => {
            const todos = setupTestFocusTasks();
            const settings = { ...setupTestFocusSettings(), autoResetEnabled: false };
            const yesterday = setYesterdayAsLastLaunch();
            
            const result = checkForDailyReset(todos, settings, yesterday);
            
            expect(result).toBe(false);
        });

        test('returns false on first launch (null lastLaunchDate)', () => {
            const todos = setupTestFocusTasks();
            const settings = setupTestFocusSettings();
            
            const result = checkForDailyReset(todos, settings, null);
            
            expect(result).toBe(false);
        });
    });

    describe('getTodaysFocusTasks', () => {
        test('filters and sorts focus tasks correctly', () => {
            const todos = [
                createTestFocusTask('1', 'Task 1', 3, false),
                { id: '2', text: 'Regular task', completed: false, projectId: '', notes: '', deleted: false }, // No focusOrder
                createTestFocusTask('3', 'Task 2', 1, true),
                createTestFocusTask('4', 'Task 3', 2, false)
            ];
            
            const result = getTodaysFocusTasks(todos);
            
            expect(result).toHaveLength(3);
            expect(result[0].focusOrder).toBe(1);
            expect(result[1].focusOrder).toBe(2);
            expect(result[2].focusOrder).toBe(3);
        });

        test('returns empty array when no focus tasks', () => {
            const todos: Todo[] = [
                { id: '1', text: 'Regular task', completed: false, projectId: '', notes: '', deleted: false }
            ];
            
            const result = getTodaysFocusTasks(todos);
            
            expect(result).toHaveLength(0);
        });
    });

    describe('Task Categorization', () => {
        test('correctly separates completed and incomplete focus tasks', () => {
            const focusTasks = setupTestFocusTasks();
            
            const completedTasks = focusTasks.filter(task => task.completed);
            const incompleteTasks = focusTasks.filter(task => !task.completed);
            
            expect(completedTasks).toHaveLength(1);
            expect(incompleteTasks).toHaveLength(2);
            expect(completedTasks[0].text).toBe('Review quarterly reports');
        });
    });
});

describe('LocalStorage JSON Handling', () => {
    test('handles string vs JSON storage correctly', () => {
        // Test the bug we found where plain strings vs JSON strings caused issues
        const plainString = 'Fri Jul 04 2025';
        const jsonString = JSON.stringify('Fri Jul 04 2025');
        
        expect(() => JSON.parse(plainString)).toThrow();
        expect(() => JSON.parse(jsonString)).not.toThrow();
        expect(JSON.parse(jsonString)).toBe('Fri Jul 04 2025');
    });
});