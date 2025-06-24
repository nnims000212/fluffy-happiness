// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

// Function to revive Date objects from ISO strings
function reviveDates(key: string, value: any): any {
    if (typeof value === 'string') {
        const dateMatch = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.exec(value);
        if (dateMatch) {
            return new Date(value);
        }
    }
    return value;
}

function getValue<T>(key: string, initialValue: T | (() => T)) {
    const savedValue = localStorage.getItem(key);
    if (savedValue !== null) {
        try {
            // Use a reviver function to parse dates correctly
            return JSON.parse(savedValue, reviveDates);
        } catch (e) {
            console.error(`Error parsing localStorage key "${key}":`, e);
            localStorage.removeItem(key); // Clear corrupted data
        }
    }
    if (initialValue instanceof Function) return initialValue();
    return initialValue;
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => getValue(key, initialValue));

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}
