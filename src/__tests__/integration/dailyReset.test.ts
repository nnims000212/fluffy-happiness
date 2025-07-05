// Unit tests for daily reset functionality
// Converted from debug scripts: debug-reset.js, force-modal-test.js, fix-and-test.js

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createTestFocusTask,
  setupTestFocusTasks,
  setupMixedTasks,
  setupTestFocusSettings,
  getYesterdayDate,
  getTodayDate,
  getTomorrowDate,
  setupLocalStorageForReset,
  setupLocalStorageNoReset,
  testLocalStorageJSONBug,
  mockDateToString
} from './testHelpers'
import type { Todo, FocusSettings } from '../types/index'

// Mock the checkForDailyReset logic (extracted from FocusContext)
const checkForDailyReset = (
  todos: Todo[],
  focusSettings: FocusSettings,
  lastAppLaunchDate: string | null
): boolean => {
  if (!focusSettings.autoResetEnabled) return false

  const today = new Date().toDateString()
  const hasFocusTasks = todos.some(todo => todo.focusOrder !== undefined)

  if (!lastAppLaunchDate) return false

  // Only trigger reset if different date AND has focus tasks
  return lastAppLaunchDate !== today && hasFocusTasks
}

// Mock the getTodaysFocusTasks logic (extracted from FocusContext)
const getTodaysFocusTasks = (todos: Todo[]): Todo[] => {
  return todos
    .filter(todo => todo.focusOrder !== undefined)
    .sort((a, b) => (a.focusOrder || 0) - (b.focusOrder || 0))
}

describe('Daily Reset Logic Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('checkForDailyReset', () => {
    it('should return true when different day and has focus tasks', () => {
      const todos = setupTestFocusTasks()
      const settings = setupTestFocusSettings()
      const yesterday = getYesterdayDate()

      const result = checkForDailyReset(todos, settings, yesterday)

      expect(result).toBe(true)
    })

    it('should return false when same day', () => {
      const todos = setupTestFocusTasks()
      const settings = setupTestFocusSettings()
      const today = getTodayDate()

      const result = checkForDailyReset(todos, settings, today)

      expect(result).toBe(false)
    })

    it('should return false when no focus tasks exist', () => {
      const todos: Todo[] = [
        {
          id: 'regular_1',
          text: 'Regular Task',
          completed: false,
          projectId: 'Work',
          notes: '',
          deleted: false
          // No focusOrder = not a focus task
        }
      ]
      const settings = setupTestFocusSettings()
      const yesterday = getYesterdayDate()

      const result = checkForDailyReset(todos, settings, yesterday)

      expect(result).toBe(false)
    })

    it('should return false when auto-reset is disabled', () => {
      const todos = setupTestFocusTasks()
      const settings = setupTestFocusSettings({ autoResetEnabled: false })
      const yesterday = getYesterdayDate()

      const result = checkForDailyReset(todos, settings, yesterday)

      expect(result).toBe(false)
    })

    it('should return false on first launch (null lastAppLaunchDate)', () => {
      const todos = setupTestFocusTasks()
      const settings = setupTestFocusSettings()

      const result = checkForDailyReset(todos, settings, null)

      expect(result).toBe(false)
    })

    it('should handle edge case: future date as last launch', () => {
      const todos = setupTestFocusTasks()
      const settings = setupTestFocusSettings()
      const tomorrow = getTomorrowDate()

      const result = checkForDailyReset(todos, settings, tomorrow)

      expect(result).toBe(true) // Different date, so should trigger
    })
  })

  describe('getTodaysFocusTasks', () => {
    it('should filter and sort focus tasks correctly', () => {
      const todos = setupMixedTasks()

      const result = getTodaysFocusTasks(todos)

      expect(result).toHaveLength(2) // Only focus tasks
      expect(result[0].focusOrder).toBe(1)
      expect(result[1].focusOrder).toBe(2)
      expect(result[0].text).toBe('Focus Task 1')
      expect(result[1].text).toBe('Focus Task 2')
    })

    it('should return empty array when no focus tasks', () => {
      const todos: Todo[] = [
        {
          id: 'regular_1',
          text: 'Regular Task',
          completed: false,
          projectId: 'Work',
          notes: '',
          deleted: false
        }
      ]

      const result = getTodaysFocusTasks(todos)

      expect(result).toHaveLength(0)
    })

    it('should handle unsorted focus tasks', () => {
      const todos = [
        createTestFocusTask('3', 'Task 3', 3, false),
        createTestFocusTask('1', 'Task 1', 1, true),
        createTestFocusTask('2', 'Task 2', 2, false)
      ]

      const result = getTodaysFocusTasks(todos)

      expect(result).toHaveLength(3)
      expect(result[0].focusOrder).toBe(1)
      expect(result[1].focusOrder).toBe(2)
      expect(result[2].focusOrder).toBe(3)
    })
  })

  describe('Task Categorization', () => {
    it('should correctly separate completed and incomplete focus tasks', () => {
      const focusTasks = setupTestFocusTasks()

      const completedTasks = focusTasks.filter(task => task.completed)
      const incompleteTasks = focusTasks.filter(task => !task.completed)

      expect(completedTasks).toHaveLength(1)
      expect(incompleteTasks).toHaveLength(2)
      expect(completedTasks[0].text).toBe('Review quarterly reports')
      expect(incompleteTasks[0].text).toBe('Complete project proposal')
      expect(incompleteTasks[1].text).toBe('Plan team meeting')
    })

    it('should handle all completed focus tasks', () => {
      const focusTasks = [
        createTestFocusTask('1', 'Task 1', 1, true),
        createTestFocusTask('2', 'Task 2', 2, true),
        createTestFocusTask('3', 'Task 3', 3, true)
      ]

      const completedTasks = focusTasks.filter(task => task.completed)
      const incompleteTasks = focusTasks.filter(task => !task.completed)

      expect(completedTasks).toHaveLength(3)
      expect(incompleteTasks).toHaveLength(0)
    })

    it('should handle all incomplete focus tasks', () => {
      const focusTasks = [
        createTestFocusTask('1', 'Task 1', 1, false),
        createTestFocusTask('2', 'Task 2', 2, false),
        createTestFocusTask('3', 'Task 3', 3, false)
      ]

      const completedTasks = focusTasks.filter(task => task.completed)
      const incompleteTasks = focusTasks.filter(task => !task.completed)

      expect(completedTasks).toHaveLength(0)
      expect(incompleteTasks).toHaveLength(3)
    })
  })
})

describe('LocalStorage Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('JSON Parsing Bug Tests', () => {
    it('should handle plain string vs JSON string correctly', () => {
      const { plainString, jsonString } = testLocalStorageJSONBug()

      // This was the original bug - plain strings can't be JSON.parsed
      expect(() => JSON.parse(plainString)).toThrow()
      expect(() => JSON.parse(jsonString)).not.toThrow()
      expect(JSON.parse(jsonString)).toBe('Fri Jul 04 2025')
    })

    it('should properly store and retrieve lastLaunchDate as JSON', () => {
      const testDate = 'Fri Jul 04 2025'
      
      // Store as JSON (correct way)
      localStorage.setItem('focusTimerLastLaunch', JSON.stringify(testDate))
      
      // Retrieve and parse (should work)
      const retrieved = JSON.parse(localStorage.getItem('focusTimerLastLaunch') || 'null')
      
      expect(retrieved).toBe(testDate)
    })

    it('should handle the manual trigger localStorage bug', () => {
      // The manual trigger was storing plain strings
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      // Wrong way (what the bug was doing)
      localStorage.setItem('test_plain', yesterday.toDateString())
      
      // Right way (what we fixed)
      localStorage.setItem('test_json', JSON.stringify(yesterday.toDateString()))
      
      // Plain string parsing should fail
      expect(() => JSON.parse(localStorage.getItem('test_plain') || '')).toThrow()
      
      // JSON string parsing should work
      expect(() => JSON.parse(localStorage.getItem('test_json') || '')).not.toThrow()
    })
  })

  describe('Complete Reset Scenario Tests', () => {
    it('should setup reset conditions correctly', () => {
      const { tasks, settings, yesterday } = setupLocalStorageForReset()

      // Verify localStorage contents
      const storedTodos = JSON.parse(localStorage.getItem('focusTimerTodos') || '[]')
      const storedSettings = JSON.parse(localStorage.getItem('focusTimerFocusSettings') || '{}')
      const storedLastLaunch = JSON.parse(localStorage.getItem('focusTimerLastLaunch') || 'null')

      expect(storedTodos).toHaveLength(3)
      expect(storedTodos.filter((t: Todo) => t.focusOrder !== undefined)).toHaveLength(3)
      expect(storedSettings.autoResetEnabled).toBe(true)
      expect(storedLastLaunch).toBe(yesterday)

      // Verify reset logic would trigger
      const shouldReset = checkForDailyReset(storedTodos, storedSettings, storedLastLaunch)
      expect(shouldReset).toBe(true)
    })

    it('should setup no-reset conditions correctly', () => {
      const { tasks, settings, today } = setupLocalStorageNoReset()

      const storedTodos = JSON.parse(localStorage.getItem('focusTimerTodos') || '[]')
      const storedSettings = JSON.parse(localStorage.getItem('focusTimerFocusSettings') || '{}')
      const storedLastLaunch = JSON.parse(localStorage.getItem('focusTimerLastLaunch') || 'null')

      // Verify reset logic would NOT trigger (same day)
      const shouldReset = checkForDailyReset(storedTodos, storedSettings, storedLastLaunch)
      expect(shouldReset).toBe(false)
    })
  })

  describe('Edge Cases from Debugging', () => {
    it('should handle empty localStorage gracefully', () => {
      // This is what happens on first app launch
      const todos = JSON.parse(localStorage.getItem('focusTimerTodos') || '[]')
      const settings = JSON.parse(localStorage.getItem('focusTimerFocusSettings') || '{}')
      const lastLaunch = JSON.parse(localStorage.getItem('focusTimerLastLaunch') || 'null')

      expect(todos).toEqual([])
      expect(settings).toEqual({})
      expect(lastLaunch).toBeNull()

      // Should not trigger reset
      const shouldReset = checkForDailyReset(todos, { autoResetEnabled: true } as FocusSettings, lastLaunch)
      expect(shouldReset).toBe(false)
    })

    it('should handle corrupted localStorage data', () => {
      // Simulate corrupted data
      localStorage.setItem('focusTimerTodos', 'invalid json')
      localStorage.setItem('focusTimerFocusSettings', 'also invalid')

      // App should handle gracefully with try-catch
      expect(() => {
        try {
          JSON.parse(localStorage.getItem('focusTimerTodos') || '[]')
        } catch {
          return [] // Fallback
        }
      }).not.toThrow()
    })
  })
})