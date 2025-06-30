// src/utils/formatters.ts

/**
 * Formats milliseconds into a human-readable string like "1 hr 30 min".
 * This version from your old file is great for display and will be used in the history table.
 */
export const formatToHoursAndMinutes = (ms: number): string => {
    if (ms <= 0) return '0 min';
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const parts = [];
    if (hours > 0) parts.push(`${hours} hr`);
    if (minutes > 0 || hours === 0) parts.push(`${minutes} min`);
    return parts.join(' ');
};

/**
 * Formats a Date object into "YYYY-MM-DD" for an <input type="date">.
 * This version is more robust against timezone issues than using toISOString(), so we'll use it.
 */
export const formatDateToInput = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Formats a Date object into "HH:mm" for an <input type="time">.
 * This implementation is explicit and reliable.
 */
export const formatTimeToInput = (date: Date): string => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};


// --- The following functions from your old file are kept for other parts of the app ---

/**
 * Formats milliseconds into a timer string like "HH:MM:SS" or "MM:SS".
 * Likely used by the main timer display.
 */
export const formatDurationTimer = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Formats milliseconds into a full "HH:MM:SS" string.
 * This can be used as an alternative display format in history tables if you prefer.
 */
export const formatDurationForHistory = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};