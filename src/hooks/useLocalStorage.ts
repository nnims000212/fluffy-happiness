// src/hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

// Function to revive Date objects from ISO strings
function reviveDates(_key: string, value: any): any {
    if (typeof value === 'string') {
        const dateMatch = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.exec(value);
        if (dateMatch) {
            return new Date(value);
        }
    }
    return value;
}

// Check if localStorage is available and working
function isLocalStorageAvailable(): boolean {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, 'test');
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// Enhanced error handling for localStorage operations
function safeLocalStorageGet(key: string): string | null {
    try {
        if (!isLocalStorageAvailable()) {
            console.warn(`📦 localStorage unavailable (private browsing?). Using memory-only storage for ${key}`);
            return null;
        }
        return localStorage.getItem(key);
    } catch (error) {
        console.error(`📦 Error reading localStorage key "${key}":`, error);
        return null;
    }
}

function safeLocalStorageSet(key: string, value: string): boolean {
    try {
        if (!isLocalStorageAvailable()) {
            console.warn(`📦 localStorage unavailable. Cannot save ${key}`);
            return false;
        }
        
        localStorage.setItem(key, value);
        
        // Verify the write was successful
        const saved = localStorage.getItem(key);
        if (saved !== value) {
            console.error(`📦 localStorage write verification failed for ${key}`);
            return false;
        }
        
        return true;
    } catch (error) {
        if (error instanceof DOMException) {
            // Handle specific localStorage errors
            if (error.code === 22) {
                console.error(`📦 localStorage quota exceeded for ${key}. Consider clearing old data.`);
                
                // Try to free up space by removing older data
                const keys = Object.keys(localStorage);
                const focusKeys = keys.filter(k => k.startsWith('focusTimer'));
                
                if (focusKeys.length > 5) {
                    // Remove oldest focus history entries if too many
                    try {
                        const historyKey = 'focusTimerFocusHistory';
                        const history = localStorage.getItem(historyKey);
                        if (history) {
                            const parsed = JSON.parse(history);
                            if (Array.isArray(parsed) && parsed.length > 10) {
                                // Keep only the 10 most recent entries
                                const trimmed = parsed.slice(0, 10);
                                localStorage.setItem(historyKey, JSON.stringify(trimmed));
                                console.log(`📦 Trimmed focus history to free up space`);
                                
                                // Try the original operation again
                                localStorage.setItem(key, value);
                                return true;
                            }
                        }
                    } catch (cleanupError) {
                        console.error(`📦 Cleanup failed:`, cleanupError);
                    }
                }
            } else {
                console.error(`📦 localStorage error for ${key}:`, error);
            }
        } else {
            console.error(`📦 Unexpected localStorage error for ${key}:`, error);
        }
        return false;
    }
}

function getValue<T>(key: string, initialValue: T | (() => T)): T {
    const savedValue = safeLocalStorageGet(key);
    
    if (savedValue !== null) {
        try {
            // Use a reviver function to parse dates correctly
            const parsed = JSON.parse(savedValue, reviveDates);
            
            // Basic validation - ensure parsed value isn't null/undefined unexpectedly
            if (parsed === null || parsed === undefined) {
                console.warn(`📦 localStorage key "${key}" contained null/undefined. Using initial value.`);
                if (initialValue instanceof Function) return initialValue();
                return initialValue;
            }
            
            return parsed;
        } catch (parseError) {
            console.error(`📦 Error parsing localStorage key "${key}":`, parseError);
            console.log(`📦 Corrupted data:`, savedValue.substring(0, 100) + '...');
            
            // Remove corrupted data
            try {
                localStorage.removeItem(key);
                console.log(`📦 Removed corrupted data for ${key}`);
            } catch (removeError) {
                console.error(`📦 Could not remove corrupted data:`, removeError);
            }
        }
    }
    
    if (initialValue instanceof Function) return initialValue();
    return initialValue;
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => getValue(key, initialValue));
    const [hasError, setHasError] = useState(false);

    const safeSetValue = useCallback((newValue: React.SetStateAction<T>) => {
        try {
            setValue(prevValue => {
                const valueToStore = newValue instanceof Function ? newValue(prevValue) : newValue;
                
                // Try to save to localStorage
                const success = safeLocalStorageSet(key, JSON.stringify(valueToStore));
                
                if (!success) {
                    setHasError(true);
                    console.warn(`📦 Could not save ${key} to localStorage. Data will be lost on page refresh.`);
                } else if (hasError) {
                    // Clear error state if save was successful
                    setHasError(false);
                }
                
                return valueToStore;
            });
        } catch (error) {
            console.error(`📦 Error in useLocalStorage setValue for ${key}:`, error);
            setHasError(true);
        }
    }, [key, hasError]);

    // Show a warning to user if localStorage is consistently failing
    useEffect(() => {
        if (hasError) {
            // Only show the warning once per session
            const warningKey = `${key}_warning_shown`;
            if (!sessionStorage.getItem(warningKey)) {
                sessionStorage.setItem(warningKey, 'true');
                console.warn(`⚠️ Data saving issues detected for ${key}. Your changes may not persist.`);
            }
        }
    }, [hasError, key]);

    return [value, safeSetValue];
}