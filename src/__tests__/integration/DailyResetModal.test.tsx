// Integration tests for DailyResetModal component
// Based on our modal debugging and the getTodaysFocusTasks bug we found

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DailyResetModal from '../components/ui/modals/DailyResetModal'
import { setupTestFocusTasks, createTestFocusTask } from './testHelpers'
import type { Todo } from '../types/index'

// Mock the useAppContext hook
const mockUseAppContext = vi.fn()

vi.mock('../context/useAppContext', () => ({
  useAppContext: () => mockUseAppContext()
}))

describe('DailyResetModal Component', () => {
  const mockOnClose = vi.fn()
  const mockResetDailyFocus = vi.fn()
  const mockMarkAppLaunch = vi.fn()
  const mockUpdateFocusSettings = vi.fn()
  const mockGetTodaysFocusTasks = vi.fn()

  const defaultContextValue = {
    getTodaysFocusTasks: mockGetTodaysFocusTasks,
    resetDailyFocus: mockResetDailyFocus,
    markAppLaunch: mockMarkAppLaunch,
    updateFocusSettings: mockUpdateFocusSettings,
    todos: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAppContext.mockReturnValue(defaultContextValue)
  })

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      mockGetTodaysFocusTasks.mockReturnValue([])
      
      render(<DailyResetModal isOpen={false} onClose={mockOnClose} />)
      
      expect(screen.queryByText('Good Morning! Daily Focus Reset')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      const focusTasks = setupTestFocusTasks()
      mockGetTodaysFocusTasks.mockReturnValue(focusTasks)
      
      render(<DailyResetModal isOpen={true} onClose={mockOnClose} />)
      
      expect(screen.getByText('🌅 Good Morning! Daily Focus Reset')).toBeInTheDocument()
    })
  })

  describe('Focus Tasks Display - Bug Fix Verification', () => {
    it('should show focus tasks when getTodaysFocusTasks receives todos parameter', () => {
      // This tests the bug we fixed where getTodaysFocusTasks was called without todos
      const focusTasks = setupTestFocusTasks()
      const allTodos = [...focusTasks, { id: 'regular', text: 'Regular task', completed: false, projectId: '', notes: '', deleted: false }]
      
      mockUseAppContext.mockReturnValue({
        ...defaultContextValue,
        todos: allTodos,
        getTodaysFocusTasks: (todos: Todo[]) => todos.filter(t => t.focusOrder !== undefined)
      })
      
      render(<DailyResetModal isOpen={true} onClose={mockOnClose} />)
      
      expect(screen.getByText('You have 3 focus tasks from yesterday:')).toBeInTheDocument()
    })

    it('should display incomplete tasks with their names and numbers', () => {
      const focusTasks = [
        createTestFocusTask('1', 'Complete project proposal', 1, false),
        createTestFocusTask('2', 'Review quarterly reports', 2, true),
        createTestFocusTask('3', 'Plan team meeting', 3, false)
      ]
      
      mockUseAppContext.mockReturnValue({
        ...defaultContextValue,
        todos: focusTasks,
        getTodaysFocusTasks: (todos: Todo[]) => todos.filter(t => t.focusOrder !== undefined).sort((a, b) => (a.focusOrder || 0) - (b.focusOrder || 0))
      })
      
      render(<DailyResetModal isOpen={true} onClose={mockOnClose} />)
      
      // Should show incomplete tasks with details
      expect(screen.getByText('2 incomplete:')).toBeInTheDocument()
      expect(screen.getByText('#1: Complete project proposal')).toBeInTheDocument()
      expect(screen.getByText('#3: Plan team meeting')).toBeInTheDocument()
      
      // Should show completed count
      expect(screen.getByText('1 completed')).toBeInTheDocument()
    })

    it('should handle empty focus tasks gracefully', () => {
      mockUseAppContext.mockReturnValue({
        ...defaultContextValue,
        todos: [],
        getTodaysFocusTasks: () => []
      })
      
      render(<DailyResetModal isOpen={true} onClose={mockOnClose} />)
      
      expect(screen.getByText('You have 0 focus tasks from yesterday:')).toBeInTheDocument()
    })

    it('should handle all completed focus tasks', () => {
      const focusTasks = [
        createTestFocusTask('1', 'Task 1', 1, true),
        createTestFocusTask('2', 'Task 2', 2, true)
      ]
      
      mockUseAppContext.mockReturnValue({
        ...defaultContextValue,
        todos: focusTasks,
        getTodaysFocusTasks: () => focusTasks
      })
      
      render(<DailyResetModal isOpen={true} onClose={mockOnClose} />)
      
      expect(screen.getByText('2 completed')).toBeInTheDocument()
      expect(screen.queryByText('incomplete:')).not.toBeInTheDocument()
    })

    it('should handle all incomplete focus tasks', () => {
      const focusTasks = [
        createTestFocusTask('1', 'Task 1', 1, false),
        createTestFocusTask('2', 'Task 2', 2, false)
      ]
      
      mockUseAppContext.mockReturnValue({
        ...defaultContextValue,
        todos: focusTasks,
        getTodaysFocusTasks: () => focusTasks
      })
      
      render(<DailyResetModal isOpen={true} onClose={mockOnClose} />)
      
      expect(screen.getByText('2 incomplete:')).toBeInTheDocument()
      expect(screen.queryByText('completed')).not.toBeInTheDocument()
    })
  })

  describe('Reset Options - No Archive Language', () => {
    beforeEach(() => {
      const focusTasks = setupTestFocusTasks()
      mockUseAppContext.mockReturnValue({
        ...defaultContextValue,
        todos: focusTasks,
        getTodaysFocusTasks: () => focusTasks
      })
    })

    it('should show reset options without "archive" language', () => {
      render(<DailyResetModal isOpen={true} onClose={mockOnClose} />)
      
      // Should not use "archive" language
      expect(screen.queryByText(/archive/i)).not.toBeInTheDocument()
      
      // Should use "remove" language instead
      expect(screen.getByText('Remove completed tasks, keep incomplete ones in your Top 3')).toBeInTheDocument()
      expect(screen.getByText('Remove all tasks and start with an empty Top 3')).toBeInTheDocument()
    })

    it('should have preserve-incomplete as default selection', () => {
      render(<DailyResetModal isOpen={true} onClose={mockOnClose} />)
      
      const preserveOption = screen.getByRole('radio', { name: /keep incomplete tasks/i })
      expect(preserveOption).toBeChecked()
    })

    it('should allow selecting different reset options', async () => {
      const user = userEvent.setup()
      render(<DailyResetModal isOpen={true} onClose={mockOnClose} />)
      
      const freshStartOption = screen.getByRole('radio', { name: /fresh start/i })
      await user.click(freshStartOption)
      
      expect(freshStartOption).toBeChecked()
    })
  })

  describe('Modal Actions', () => {
    beforeEach(() => {
      const focusTasks = setupTestFocusTasks()
      mockUseAppContext.mockReturnValue({
        ...defaultContextValue,
        todos: focusTasks,
        getTodaysFocusTasks: () => focusTasks
      })
    })

    it('should handle reset action', async () => {
      const user = userEvent.setup()
      render(<DailyResetModal isOpen={true} onClose={mockOnClose} />)
      
      const resetButton = screen.getByRole('button', { name: /reset focus/i })
      await user.click(resetButton)
      
      expect(mockResetDailyFocus).toHaveBeenCalledWith('preserve-incomplete')
      expect(mockMarkAppLaunch).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should handle disable auto-reset action', async () => {
      const user = userEvent.setup()
      render(<DailyResetModal isOpen={true} onClose={mockOnClose} />)
      
      const disableButton = screen.getByRole('button', { name: /disable auto-reset/i })
      await user.click(disableButton)
      
      expect(mockUpdateFocusSettings).toHaveBeenCalledWith({ autoResetEnabled: false })
      expect(mockMarkAppLaunch).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close on Escape key', () => {
      render(<DailyResetModal isOpen={true} onClose={mockOnClose} />)
      
      const modal = screen.getByRole('dialog', { hidden: true }) || document.querySelector('.modal-overlay')
      if (modal) {
        fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' })
      }
      
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('CSS Classes for Styling', () => {
    it('should have correct CSS classes for styling', () => {
      const focusTasks = setupTestFocusTasks()
      mockUseAppContext.mockReturnValue({
        ...defaultContextValue,
        todos: focusTasks,
        getTodaysFocusTasks: () => focusTasks
      })
      
      const { container } = render(<DailyResetModal isOpen={true} onClose={mockOnClose} />)
      
      // These classes were added to fix the invisible modal bug
      expect(container.querySelector('.modal-overlay')).toBeInTheDocument()
      expect(container.querySelector('.modal-content.daily-reset-modal')).toBeInTheDocument()
      expect(container.querySelector('.reset-summary')).toBeInTheDocument()
      expect(container.querySelector('.reset-options')).toBeInTheDocument()
    })
  })
})