// src/utils/errorHandling.ts
import toast from 'react-hot-toast';

export interface AppError {
    type: 'localStorage' | 'network' | 'validation' | 'component' | 'unknown';
    message: string;
    details?: string;
    recoverable: boolean;
    timestamp: Date;
}

// Central error logging system
class ErrorLogger {
    private errors: AppError[] = [];
    private maxErrors = 50; // Keep last 50 errors

    log(error: AppError): void {
        this.errors.unshift(error);
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }

        // Console logging with emojis for easy identification
        const emoji = this.getEmojiForErrorType(error.type);
        console.group(`${emoji} ${error.type.toUpperCase()} Error`);
        console.error('Message:', error.message);
        if (error.details) {
            console.error('Details:', error.details);
        }
        console.error('Timestamp:', error.timestamp.toISOString());
        console.error('Recoverable:', error.recoverable);
        console.groupEnd();
    }

    private getEmojiForErrorType(type: AppError['type']): string {
        switch (type) {
            case 'localStorage': return '📦';
            case 'network': return '🌐';
            case 'validation': return '🔍';
            case 'component': return '⚛️';
            default: return '❌';
        }
    }

    getRecentErrors(count: number = 10): AppError[] {
        return this.errors.slice(0, count);
    }

    clearErrors(): void {
        this.errors = [];
    }

    getErrorSummary(): string {
        const summary = this.errors.reduce((acc, error) => {
            acc[error.type] = (acc[error.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(summary)
            .map(([type, count]) => `${type}: ${count}`)
            .join(', ');
    }
}

// Global error logger instance
export const errorLogger = new ErrorLogger();

// Error handling utilities
export function handleLocalStorageError(
    operation: 'read' | 'write' | 'remove',
    key: string,
    error: Error,
    showToast: boolean = false
): void {
    const appError: AppError = {
        type: 'localStorage',
        message: `Failed to ${operation} localStorage key "${key}"`,
        details: error.message,
        recoverable: true,
        timestamp: new Date()
    };

    errorLogger.log(appError);

    if (showToast) {
        if (operation === 'write') {
            toast.error('Unable to save data. Your changes might not persist.', {
                duration: 4000,
                id: `storage-error-${key}` // Prevent duplicate toasts
            });
        } else if (operation === 'read') {
            toast.error('Unable to load saved data. Using defaults.', {
                duration: 3000,
                id: `storage-error-${key}`
            });
        }
    }
}

export function handleValidationError(
    context: string,
    data: any,
    expectedType: string,
    showToast: boolean = false
): void {
    const appError: AppError = {
        type: 'validation',
        message: `Data validation failed in ${context}`,
        details: `Expected ${expectedType}, got: ${typeof data}`,
        recoverable: true,
        timestamp: new Date()
    };

    errorLogger.log(appError);

    if (showToast) {
        toast.error('Some data appears corrupted and was reset to defaults.', {
            duration: 3000,
            id: `validation-error-${context}`
        });
    }
}

export function handleComponentError(
    componentName: string,
    error: Error,
    errorInfo?: any
): void {
    const appError: AppError = {
        type: 'component',
        message: `Component error in ${componentName}`,
        details: `${error.message}\n${error.stack}${errorInfo ? `\nComponent Stack: ${errorInfo.componentStack}` : ''}`,
        recoverable: false,
        timestamp: new Date()
    };

    errorLogger.log(appError);
}

export function handleUnknownError(
    context: string,
    error: Error,
    showToast: boolean = false
): void {
    const appError: AppError = {
        type: 'unknown',
        message: `Unexpected error in ${context}`,
        details: `${error.message}\n${error.stack}`,
        recoverable: true,
        timestamp: new Date()
    };

    errorLogger.log(appError);

    if (showToast) {
        toast.error('Something unexpected happened. Please try refreshing the page.', {
            duration: 4000,
            id: `unknown-error-${context}`
        });
    }
}

// Recovery utilities
export function attemptDataRecovery(key: string): boolean {
    try {
        // Try to create a backup before clearing
        const corruptedData = localStorage.getItem(key);
        if (corruptedData) {
            sessionStorage.setItem(`${key}_corrupted_backup`, corruptedData);
        }

        // Clear the corrupted data
        localStorage.removeItem(key);
        
        console.log(`🔧 Cleared corrupted data for ${key}. Backup stored in sessionStorage.`);
        return true;
    } catch (error) {
        console.error(`🚨 Failed to recover from error for ${key}:`, error);
        return false;
    }
}

export function createErrorReport(): string {
    const errors = errorLogger.getRecentErrors(20);
    const report = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        localStorage: {
            available: !!window.localStorage,
            quotaExceeded: false // We'll detect this during errors
        },
        errorSummary: errorLogger.getErrorSummary(),
        recentErrors: errors.map(error => ({
            type: error.type,
            message: error.message,
            timestamp: error.timestamp.toISOString(),
            recoverable: error.recoverable
        }))
    };

    return JSON.stringify(report, null, 2);
}

// Utility to show a generic error recovery dialog
export function showErrorRecoveryDialog(
    title: string = 'Something went wrong',
    message: string = 'The app encountered an error. What would you like to do?'
): Promise<'retry' | 'refresh' | 'reset' | 'ignore'> {
    return new Promise((resolve) => {
        // For now, use simple confirm dialogs
        // In a real app, you'd want a proper modal component
        
        const retry = window.confirm(
            `${title}\n\n${message}\n\nClick OK to try again, or Cancel to see more options.`
        );
        
        if (retry) {
            resolve('retry');
            return;
        }
        
        const refresh = window.confirm(
            'Would you like to refresh the page? This might solve the issue but you may lose unsaved changes.'
        );
        
        if (refresh) {
            resolve('refresh');
            return;
        }
        
        const reset = window.confirm(
            'Would you like to reset the app data? This will clear all your tasks, sessions, and settings.'
        );
        
        if (reset) {
            resolve('reset');
            return;
        }
        
        resolve('ignore');
    });
}

// Safe execution wrapper
export async function safeExecute<T>(
    operation: () => T | Promise<T>,
    context: string,
    fallback?: T,
    showToast: boolean = false
): Promise<T | undefined> {
    try {
        return await operation();
    } catch (error) {
        handleUnknownError(context, error as Error, showToast);
        return fallback;
    }
}

// Browser compatibility checks
export function checkBrowserCompatibility(): {
    compatible: boolean;
    issues: string[];
    warnings: string[];
} {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for essential APIs
    if (!window.localStorage) {
        issues.push('localStorage not available');
    }

    if (!window.sessionStorage) {
        warnings.push('sessionStorage not available');
    }

    if (!window.JSON) {
        issues.push('JSON not available');
    }

    if (!Array.isArray) {
        issues.push('Array.isArray not available');
    }

    // Check for modern JS features
    if (!window.fetch) {
        warnings.push('fetch API not available');
    }

    if (!navigator.clipboard) {
        warnings.push('Clipboard API not available');
    }

    return {
        compatible: issues.length === 0,
        issues,
        warnings
    };
}