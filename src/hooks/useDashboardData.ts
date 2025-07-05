// src/hooks/useDashboardData.ts
import { useMemo } from 'react';
import type { Session } from '../types/index';

type ViewType = 'day' | 'week' | 'month' | 'year' | 'custom';

export const useDashboardData = (sessions: Session[], currentView: ViewType, selectedDate: Date, dailyWorkGoalHours: number = 8) => {
    return useMemo(() => {
        let startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        let endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        if (currentView === 'week') {
            const dayOfWeek = (selectedDate.getDay() + 6) % 7; // Monday is 0
            startDate.setDate(selectedDate.getDate() - dayOfWeek);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        } else if (currentView === 'month') {
            startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (currentView === 'year') {
            startDate = new Date(selectedDate.getFullYear(), 0, 1);
            endDate = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        }

        const sessionsInView = sessions.filter(s => {
            if (!s || !s.startTime) return false;
            const sessionDate = new Date(s.startTime);
            return sessionDate >= startDate && sessionDate <= endDate;
        });

        const totalMsInView = sessionsInView.reduce((sum, s) => sum + s.durationMs, 0);

        const dataByProject = sessionsInView.reduce((acc, session) => {
            const key = session.project || 'Other';
            acc[key] = (acc[key] || 0) + session.durationMs;
            return acc;
        }, {} as { [key: string]: number });

        const projectBreakdown = Object.entries(dataByProject)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const dataByCategory = sessionsInView.reduce((acc, session) => {
            const key = session.description || 'Unspecified';
            acc[key] = (acc[key] || 0) + session.durationMs;
            return acc;
        }, {} as { [key: string]: number });

        const topCategoriesRaw = Object.entries(dataByCategory)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const topCategories = topCategoriesRaw.map(cat => ({
            ...cat,
            displayPercent: totalMsInView > 0 ? Math.round((cat.value / totalMsInView) * 100) : 0,
        }));
        
        const targetHours = 
            currentView === 'week' ? dailyWorkGoalHours * 7 : 
            currentView === 'month' ? dailyWorkGoalHours * 30 : 
            currentView === 'year' ? dailyWorkGoalHours * 365 : dailyWorkGoalHours;

        const focusMs = dataByProject['Focus'] || 0;
        const focusPercent = totalMsInView > 0 ? Math.round((focusMs / totalMsInView) * 100) : 0;

        return {
            sessionsInView,
            totalMsInView,
            projectBreakdown,
            topCategories,
            targetHours,
            focusPercent,
        };
    }, [sessions, currentView, selectedDate, dailyWorkGoalHours]);
};