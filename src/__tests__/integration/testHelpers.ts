// Test utilities for daily reset functionality
// Based on our debugging scripts: debug-reset.js, force-modal-test.js, fix-and-test.js

import type { Todo, FocusSettings, FocusHistory } from '../types/index'

export const createTestFocusTask = (
  id: string,
  text: string,
  focusOrder: number,
  completed: boolean = false,
  projectId: string = 'Test Project'
): Todo => ({
  id,
  text,
  completed,
  projectId,
  notes: '',
  deleted: false,
  focusOrder,
  focusSetDate: new Date(),
  ...(completed && {
    completedAt: new Date(),
    focusCompletedDate: new Date()
  })
})

export const setupTestFocusTasks = (): Todo[] => [
  createTestFocusTask('test_1', 'Complete project proposal', 1, false, 'Work'),
  createTestFocusTask('test_2', 'Review quarterly reports', 2, true, 'Work'),
  createTestFocusTask('test_3', 'Plan team meeting', 3, false, 'Work')
]

export const setupMixedTasks = (): Todo[] => [
  // Focus tasks
  createTestFocusTask('focus_1', 'Focus Task 1', 1, false),
  createTestFocusTask('focus_2', 'Focus Task 2', 2, true),
  // Regular tasks (no focusOrder)
  {
    id: 'regular_1',
    text: 'Regular Task 1',
    completed: false,
    projectId: 'Work',
    notes: '',
    deleted: false
  },
  {
    id: 'regular_2', 
    text: 'Regular Task 2',
    completed: true,
    projectId: 'Personal',
    notes: '',
    deleted: false,
    completedAt: new Date()
  }
]

export const setupTestFocusSettings = (overrides: Partial<FocusSettings> = {}): FocusSettings => ({
  autoResetEnabled: true,
  resetTime: '06:00',
  preserveIncomplete: true,
  showCompletionCelebration: true,
  ...overrides
})

export const getYesterdayDate = (): string => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toDateString()
}

export const getTomorrowDate = (): string => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toDateString()
}

export const getTodayDate = (): string => {
  return new Date().toDateString()
}

export const setupLocalStorageForReset = () => {
  const tasks = setupTestFocusTasks()
  const settings = setupTestFocusSettings()
  const yesterday = getYesterdayDate()

  // Store as JSON strings (like the real app does)
  localStorage.setItem('focusTimerTodos', JSON.stringify(tasks))
  localStorage.setItem('focusTimerFocusSettings', JSON.stringify(settings))
  localStorage.setItem('focusTimerLastLaunch', JSON.stringify(yesterday))

  return { tasks, settings, yesterday }
}

export const setupLocalStorageNoReset = () => {
  const tasks = setupTestFocusTasks()
  const settings = setupTestFocusSettings()
  const today = getTodayDate()

  localStorage.setItem('focusTimerTodos', JSON.stringify(tasks))
  localStorage.setItem('focusTimerFocusSettings', JSON.stringify(settings))
  localStorage.setItem('focusTimerLastLaunch', JSON.stringify(today))

  return { tasks, settings, today }
}

// Test the localStorage JSON parsing bug we discovered
export const testLocalStorageJSONBug = () => {
  // This caused the original error
  const plainString = 'Fri Jul 04 2025'
  const jsonString = JSON.stringify('Fri Jul 04 2025')
  
  return { plainString, jsonString }
}

export const mockDateToString = (dateString: string) => {
  const originalToDateString = Date.prototype.toDateString
  Date.prototype.toDateString = vi.fn().mockReturnValue(dateString)
  
  return () => {
    Date.prototype.toDateString = originalToDateString
  }
}