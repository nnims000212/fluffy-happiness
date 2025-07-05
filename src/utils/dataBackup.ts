// src/utils/dataBackup.ts
import type { Session, Todo, Project } from '../types';

export interface BackupData {
  version: string;
  exportDate: Date;
  appVersion?: string;
  data: {
    sessions: Session[];
    todos: Todo[];
    projects: Project[];
    focusHistory: any[];
    settings: {
      dailyGoal?: number;
      focusSettings?: any;
      lastLaunch?: Date;
    };
  };
  metadata: {
    totalSessions: number;
    totalTodos: number;
    totalProjects: number;
    dateRange: {
      earliest: Date | null;
      latest: Date | null;
    };
    dataSize: number;
  };
}

export interface ExportOptions {
  includeSessions?: boolean;
  includeTodos?: boolean;
  includeProjects?: boolean;
  includeFocusHistory?: boolean;
  includeSettings?: boolean;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

/**
 * Safely retrieve and parse localStorage data
 */
function getLocalStorageData<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    
    // Use the same date reviver as useLocalStorage
    return JSON.parse(stored, (key, value) => {
      if (typeof value === 'string') {
        const dateMatch = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.exec(value);
        if (dateMatch) {
          return new Date(value);
        }
      }
      return value;
    });
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Calculate metadata for the backup
 */
function calculateMetadata(data: BackupData['data']): BackupData['metadata'] {
  const allDates: Date[] = [];
  
  // Collect dates from sessions
  data.sessions.forEach(session => {
    if (session.startTime instanceof Date) {
      allDates.push(session.startTime);
    }
  });
  
  // Collect dates from todos
  data.todos.forEach(todo => {
    if (todo.completedAt instanceof Date) {
      allDates.push(todo.completedAt);
    }
    if (todo.deletedAt instanceof Date) {
      allDates.push(todo.deletedAt);
    }
  });
  
  // Collect dates from projects
  data.projects.forEach(project => {
    if (project.createdAt instanceof Date) {
      allDates.push(project.createdAt);
    }
    if (project.archivedAt instanceof Date) {
      allDates.push(project.archivedAt);
    }
  });
  
  const validDates = allDates.filter(date => date instanceof Date && !isNaN(date.getTime()));
  validDates.sort((a, b) => a.getTime() - b.getTime());
  
  return {
    totalSessions: data.sessions.length,
    totalTodos: data.todos.length,
    totalProjects: data.projects.length,
    dateRange: {
      earliest: validDates.length > 0 ? validDates[0] : null,
      latest: validDates.length > 0 ? validDates[validDates.length - 1] : null,
    },
    dataSize: JSON.stringify(data).length,
  };
}

/**
 * Filter data based on export options
 */
function filterData(rawData: any, options: ExportOptions): BackupData['data'] {
  const filtered: BackupData['data'] = {
    sessions: [],
    todos: [],
    projects: [],
    focusHistory: [],
    settings: {},
  };
  
  // Filter sessions
  if (options.includeSessions !== false) {
    let sessions = rawData.sessions || [];
    
    if (options.dateRange) {
      sessions = sessions.filter((session: Session) => {
        if (!(session.startTime instanceof Date)) return true;
        
        const sessionDate = session.startTime;
        if (options.dateRange!.from && sessionDate < options.dateRange!.from) return false;
        if (options.dateRange!.to && sessionDate > options.dateRange!.to) return false;
        return true;
      });
    }
    
    filtered.sessions = sessions;
  }
  
  // Filter todos
  if (options.includeTodos !== false) {
    filtered.todos = rawData.todos || [];
  }
  
  // Filter projects
  if (options.includeProjects !== false) {
    filtered.projects = rawData.projects || [];
  }
  
  // Filter focus history
  if (options.includeFocusHistory !== false) {
    filtered.focusHistory = rawData.focusHistory || [];
  }
  
  // Filter settings
  if (options.includeSettings !== false) {
    filtered.settings = rawData.settings || {};
  }
  
  return filtered;
}

/**
 * Export all focus timer data to a downloadable JSON file
 */
export function exportData(options: ExportOptions = {}): BackupData {
  console.log('🔄 Starting data export...');
  
  // Collect all data from localStorage
  const rawData = {
    sessions: getLocalStorageData<Session[]>('focusTimerSessions', []),
    todos: getLocalStorageData<Todo[]>('focusTimerTodos', []),
    projects: getLocalStorageData<Project[]>('focusTimerProjects', []),
    focusHistory: getLocalStorageData('focusTimerFocusHistory', []),
    settings: {
      dailyGoal: getLocalStorageData('focusTimerDailyGoal', null),
      focusSettings: getLocalStorageData('focusTimerFocusSettings', null),
      lastLaunch: getLocalStorageData('focusTimerLastLaunch', null),
    },
  };
  
  // Filter data based on options
  const filteredData = filterData(rawData, options);
  
  // Create backup object
  const backup: BackupData = {
    version: '1.0.0',
    exportDate: new Date(),
    appVersion: '1.0.0', // Could be read from package.json
    data: filteredData,
    metadata: calculateMetadata(filteredData),
  };
  
  console.log('✅ Data export completed:', backup.metadata);
  return backup;
}

/**
 * Download backup data as a JSON file
 */
export function downloadBackup(backup: BackupData, filename?: string): void {
  const defaultFilename = `focus-timer-backup-${backup.exportDate.toISOString().split('T')[0]}.json`;
  const finalFilename = filename || defaultFilename;
  
  try {
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    console.log(`📁 Backup downloaded: ${finalFilename}`);
  } catch (error) {
    console.error('❌ Failed to download backup:', error);
    throw new Error('Failed to download backup file');
  }
}

/**
 * Create and download a full backup
 */
export function createFullBackup(): void {
  try {
    const backup = exportData({
      includeSessions: true,
      includeTodos: true,
      includeProjects: true,
      includeFocusHistory: true,
      includeSettings: true,
    });
    
    downloadBackup(backup);
    
    // Show success message
    console.log(`🎉 Full backup created successfully!`);
    console.log(`📊 Backup contains:`, backup.metadata);
  } catch (error) {
    console.error('❌ Failed to create backup:', error);
    throw error;
  }
}

/**
 * Create and download a sessions-only backup
 */
export function createSessionsBackup(dateRange?: { from?: Date; to?: Date }): void {
  try {
    const backup = exportData({
      includeSessions: true,
      includeTodos: false,
      includeProjects: true, // Include projects for session context
      includeFocusHistory: false,
      includeSettings: false,
      dateRange,
    });
    
    const filename = dateRange 
      ? `focus-timer-sessions-${dateRange.from?.toISOString().split('T')[0] || 'all'}-to-${dateRange.to?.toISOString().split('T')[0] || 'latest'}.json`
      : `focus-timer-sessions-${backup.exportDate.toISOString().split('T')[0]}.json`;
    
    downloadBackup(backup, filename);
    
    console.log(`🎉 Sessions backup created successfully!`);
  } catch (error) {
    console.error('❌ Failed to create sessions backup:', error);
    throw error;
  }
}

/**
 * Validate backup data structure
 */
export function validateBackup(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check basic structure
  if (!data || typeof data !== 'object') {
    errors.push('Backup file is not a valid JSON object');
    return { valid: false, errors };
  }
  
  // Check version
  if (!data.version || typeof data.version !== 'string') {
    errors.push('Missing or invalid version field');
  }
  
  // Check export date
  if (!data.exportDate) {
    errors.push('Missing export date');
  } else if (typeof data.exportDate === 'string') {
    try {
      new Date(data.exportDate);
    } catch {
      errors.push('Invalid export date format');
    }
  }
  
  // Check data structure
  if (!data.data || typeof data.data !== 'object') {
    errors.push('Missing or invalid data structure');
    return { valid: false, errors };
  }
  
  // Validate data arrays
  const { data: backupData } = data;
  
  if (backupData.sessions && !Array.isArray(backupData.sessions)) {
    errors.push('Sessions data is not an array');
  }
  
  if (backupData.todos && !Array.isArray(backupData.todos)) {
    errors.push('Todos data is not an array');
  }
  
  if (backupData.projects && !Array.isArray(backupData.projects)) {
    errors.push('Projects data is not an array');
  }
  
  // Check metadata
  if (!data.metadata || typeof data.metadata !== 'object') {
    errors.push('Missing or invalid metadata');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Import strategies for handling data conflicts
 */
export enum ImportStrategy {
  REPLACE = 'replace',    // Replace all existing data
  MERGE = 'merge',        // Merge with existing data (keep both)
  SKIP = 'skip',          // Skip if data already exists
}

export interface ImportOptions {
  strategy: ImportStrategy;
  includeSessions?: boolean;
  includeTodos?: boolean;
  includeProjects?: boolean;
  includeFocusHistory?: boolean;
  includeSettings?: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: {
    sessions: number;
    todos: number;
    projects: number;
    focusHistory: number;
    settings: number;
  };
  skipped: {
    sessions: number;
    todos: number;
    projects: number;
  };
  errors: string[];
  warnings: string[];
}

/**
 * Merge arrays while avoiding duplicates based on ID
 */
function mergeArrays<T extends { id: string }>(existing: T[], imported: T[], strategy: ImportStrategy): { merged: T[], skipped: number } {
  if (strategy === ImportStrategy.REPLACE) {
    return { merged: imported, skipped: 0 };
  }
  
  const existingIds = new Set(existing.map(item => item.id));
  const result = [...existing];
  let skipped = 0;
  
  for (const item of imported) {
    if (existingIds.has(item.id)) {
      if (strategy === ImportStrategy.MERGE) {
        // Replace existing item with imported one
        const index = result.findIndex(existing => existing.id === item.id);
        if (index >= 0) {
          result[index] = item;
        }
      } else {
        // Skip if exists
        skipped++;
      }
    } else {
      result.push(item);
      existingIds.add(item.id);
    }
  }
  
  return { merged: result, skipped };
}

/**
 * Safely set localStorage data
 */
function setLocalStorageData(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    
    // Verify the write
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      JSON.parse(saved); // Verify it's valid JSON
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
    return false;
  }
}

/**
 * Import data from backup file
 */
export function importData(backup: BackupData, options: ImportOptions): ImportResult {
  console.log('🔄 Starting data import...');
  
  const result: ImportResult = {
    success: false,
    imported: { sessions: 0, todos: 0, projects: 0, focusHistory: 0, settings: 0 },
    skipped: { sessions: 0, todos: 0, projects: 0 },
    errors: [],
    warnings: [],
  };
  
  try {
    // Validate backup first
    const validation = validateBackup(backup);
    if (!validation.valid) {
      result.errors = validation.errors;
      return result;
    }
    
    // Import sessions
    if (options.includeSessions !== false && backup.data.sessions) {
      const existing = getLocalStorageData<Session[]>('focusTimerSessions', []);
      const { merged, skipped } = mergeArrays(existing, backup.data.sessions, options.strategy);
      
      if (setLocalStorageData('focusTimerSessions', merged)) {
        result.imported.sessions = backup.data.sessions.length - skipped;
        result.skipped.sessions = skipped;
      } else {
        result.errors.push('Failed to save sessions to localStorage');
      }
    }
    
    // Import todos
    if (options.includeTodos !== false && backup.data.todos) {
      const existing = getLocalStorageData<Todo[]>('focusTimerTodos', []);
      const { merged, skipped } = mergeArrays(existing, backup.data.todos, options.strategy);
      
      if (setLocalStorageData('focusTimerTodos', merged)) {
        result.imported.todos = backup.data.todos.length - skipped;
        result.skipped.todos = skipped;
      } else {
        result.errors.push('Failed to save todos to localStorage');
      }
    }
    
    // Import projects
    if (options.includeProjects !== false && backup.data.projects) {
      const existing = getLocalStorageData<Project[]>('focusTimerProjects', []);
      const { merged, skipped } = mergeArrays(existing, backup.data.projects, options.strategy);
      
      if (setLocalStorageData('focusTimerProjects', merged)) {
        result.imported.projects = backup.data.projects.length - skipped;
        result.skipped.projects = skipped;
      } else {
        result.errors.push('Failed to save projects to localStorage');
      }
    }
    
    // Import focus history
    if (options.includeFocusHistory !== false && backup.data.focusHistory) {
      if (options.strategy === ImportStrategy.REPLACE) {
        if (setLocalStorageData('focusTimerFocusHistory', backup.data.focusHistory)) {
          result.imported.focusHistory = backup.data.focusHistory.length;
        } else {
          result.errors.push('Failed to save focus history to localStorage');
        }
      } else {
        // For merge/skip, append to existing history
        const existing = getLocalStorageData('focusTimerFocusHistory', []);
        const merged = [...existing, ...backup.data.focusHistory];
        if (setLocalStorageData('focusTimerFocusHistory', merged)) {
          result.imported.focusHistory = backup.data.focusHistory.length;
        } else {
          result.errors.push('Failed to save focus history to localStorage');
        }
      }
    }
    
    // Import settings
    if (options.includeSettings !== false && backup.data.settings) {
      let settingsImported = 0;
      
      if (backup.data.settings.dailyGoal !== undefined) {
        if (setLocalStorageData('focusTimerDailyGoal', backup.data.settings.dailyGoal)) {
          settingsImported++;
        } else {
          result.warnings.push('Failed to import daily goal setting');
        }
      }
      
      if (backup.data.settings.focusSettings !== undefined) {
        if (setLocalStorageData('focusTimerFocusSettings', backup.data.settings.focusSettings)) {
          settingsImported++;
        } else {
          result.warnings.push('Failed to import focus settings');
        }
      }
      
      if (backup.data.settings.lastLaunch !== undefined) {
        if (setLocalStorageData('focusTimerLastLaunch', backup.data.settings.lastLaunch)) {
          settingsImported++;
        } else {
          result.warnings.push('Failed to import last launch date');
        }
      }
      
      result.imported.settings = settingsImported;
    }
    
    result.success = result.errors.length === 0;
    
    if (result.success) {
      console.log('✅ Data import completed successfully:', result.imported);
      if (Object.values(result.skipped).some(count => count > 0)) {
        console.log('ℹ️ Some items were skipped:', result.skipped);
      }
    } else {
      console.error('❌ Data import failed:', result.errors);
    }
    
    return result;
    
  } catch (error) {
    result.errors.push(`Unexpected import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('❌ Import error:', error);
    return result;
  }
}

/**
 * Read and parse backup file from file input
 */
export function readBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      reject(new Error('File must be a JSON file'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content, (key, value) => {
          // Revive dates just like in useLocalStorage
          if (typeof value === 'string') {
            const dateMatch = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.exec(value);
            if (dateMatch) {
              return new Date(value);
            }
          }
          return value;
        });
        
        const validation = validateBackup(parsed);
        if (!validation.valid) {
          reject(new Error(`Invalid backup file: ${validation.errors.join(', ')}`));
          return;
        }
        
        resolve(parsed);
      } catch (error) {
        reject(new Error(`Failed to parse backup file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Complete import workflow from file
 */
export async function importFromFile(file: File, options: ImportOptions): Promise<ImportResult> {
  try {
    const backup = await readBackupFile(file);
    return importData(backup, options);
  } catch (error) {
    return {
      success: false,
      imported: { sessions: 0, todos: 0, projects: 0, focusHistory: 0, settings: 0 },
      skipped: { sessions: 0, todos: 0, projects: 0 },
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      warnings: [],
    };
  }
}