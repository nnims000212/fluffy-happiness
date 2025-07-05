// src/context/AppProvider.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { SessionProvider } from './SessionContext';
import { ProjectProvider } from './ProjectContext';
import { TodoProvider } from './TodoContext';
import { FocusProvider } from './FocusContext';
import { SettingsProvider } from './SettingsContext';

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    return (
        <SettingsProvider>
            <SessionProvider>
                <ProjectProvider>
                    <TodoProvider>
                        <FocusProvider>
                            {children}
                        </FocusProvider>
                    </TodoProvider>
                </ProjectProvider>
            </SessionProvider>
        </SettingsProvider>
    );
};