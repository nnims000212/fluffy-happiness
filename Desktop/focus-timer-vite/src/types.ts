// src/types.ts
export interface Session {
    id: string; // Now required for reliable updates
    startTime: Date;
    durationMs: number;
    description: string;
    project: string;
    todoId?: string | null; // Optional: Link to a To-do item
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  projectId: string; // Can be empty string for no project
  notes: string; // New field for notes
}