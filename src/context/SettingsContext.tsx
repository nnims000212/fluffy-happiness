// src/context/SettingsContext.tsx
import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

type Page = 'home' | 'top3' | 'timer' | 'history' | 'todo' | 'settings';

interface SettingsContextType {
    // Navigation
    activePage: Page;
    setActivePage: React.Dispatch<React.SetStateAction<Page>>;
    
    // Work goals
    dailyWorkGoalHours: number;
    setDailyWorkGoalHours: (hours: number) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activePage, setActivePage] = React.useState<Page>('home');
    const [dailyWorkGoalHours, setDailyWorkGoalHours] = useLocalStorage<number>('focusTimerDailyGoal', 8);

    const value: SettingsContextType = {
        activePage,
        setActivePage,
        dailyWorkGoalHours,
        setDailyWorkGoalHours,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettingsContext = () => {
    const context = useContext(SettingsContext);
    if (context === null) {
        throw new Error('useSettingsContext must be used within a SettingsProvider');
    }
    return context;
};