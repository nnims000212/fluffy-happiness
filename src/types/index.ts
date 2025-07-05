// src/types.ts
export interface Session {
    id: string; // Now required for reliable updates
    startTime: Date;
    durationMs: number;
    description: string; // Task name
    project: string;
    todoId?: string | null; // Optional: Link to a To-do item
    notes?: string; // Session notes
}

export interface Project {
  id: string;
  name: string;
  notes: string;
  archived: boolean;
  archivedAt?: Date;
  createdAt: Date;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  projectId: string; // Can be empty string for no project
  notes: string; // New field for notes
  completedAt?: Date; // When the task was completed
  deleted: boolean; // Soft delete flag
  deletedAt?: Date; // When the task was deleted
  focusOrder?: number; // 1, 2, or 3 for Top 3 Focus, undefined for regular tasks
  focusSetDate?: Date; // When task was added to focus
  focusCompletedDate?: Date; // When focus task was completed
}

// New interface for focus history
export interface FocusHistory {
  id: string;
  date: Date;
  focusTasks: {
    position: 1 | 2 | 3;
    todoId: string;
    todoText: string;
    projectId: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  resetType: 'manual' | 'auto' | 'continued' | 'clear' | 'preserve-incomplete';
}

// New settings interface for focus behavior
export interface FocusSettings {
  autoResetEnabled: boolean;
  resetTime: string; // "00:00" format for daily reset time
  preserveIncomplete: boolean;
  showCompletionCelebration: boolean;
}