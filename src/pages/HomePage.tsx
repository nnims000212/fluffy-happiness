// src/pages/HomePage.tsx
import React, { useState, useMemo, useRef } from 'react';
import Timeline from '../components/features/analytics/Timeline';
import DatePicker from '../components/ui/modals/DatePicker';
import DailySummaryCard from '../components/features/analytics/DailySummaryCard';
import { useDashboardData } from '../hooks/useDashboardData';
import { useTimelineScroll } from '../hooks/useTimelineScroll'; // Import the new hook
import { formatToHoursAndMinutes } from '../utils/formatters';
import { useAppContext } from '../context/useAppContext';

// This component no longer accepts props for state management.
const HomePage: React.FC = () => {
    // Get global state directly from the context.
    const { sessions, projects, dailyWorkGoalHours } = useAppContext();

    // Internal UI state remains here.
    const [currentView, setCurrentView] = useState<'day' | 'week' | 'month' | 'year'>('day');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    
    const timelineScrollRef = useRef<HTMLDivElement>(null);
    const datePickerToggleRef = useRef<HTMLButtonElement>(null);
    
    // Check if we're viewing today
    const isViewingToday = useMemo(() => {
        const today = new Date();
        return selectedDate.getDate() === today.getDate() && 
               selectedDate.getMonth() === today.getMonth() && 
               selectedDate.getFullYear() === today.getFullYear();
    }, [selectedDate]);
    
    // Use the hook to automatically scroll the timeline only when viewing today in day view
    useTimelineScroll(
        currentView === 'day' && isViewingToday ? timelineScrollRef : { current: null }, 
        2
    );

    // The custom data-processing hook works just as before.
    const {
        sessionsInView,
        totalMsInView,
        projectBreakdown,
        topCategories,
        targetHours,
    } = useDashboardData(sessions, currentView, selectedDate, dailyWorkGoalHours);
    
    // Logic for calculating colors is still needed and remains here.
    const allProjectsForColors = useMemo(() => {
        const allKnownProjects = new Set(projects.map(p => p.name));
        sessions.forEach(session => { if (session && session.project) allKnownProjects.add(session.project) });
        projectBreakdown.forEach(item => allKnownProjects.add(item.name));
        return Array.from(allKnownProjects);
    }, [sessions, projects, projectBreakdown]);

    const summaryTitle = useMemo(() => {
        const today = new Date();
        if (selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear()) {
            return "Daily Summary - Today";
        }
        return "Daily Summary";
    }, [selectedDate]);

    const handleDateChange = (direction: 'prev' | 'next') => {
        setSelectedDate(prevDate => {
            const newDate = new Date(prevDate);
            const d = direction === 'next' ? 1 : -1;
            if (currentView === 'day') newDate.setDate(prevDate.getDate() + d);
            else if (currentView === 'week') newDate.setDate(prevDate.getDate() + (d * 7));
            else if (currentView === 'month') newDate.setMonth(prevDate.getMonth() + d);
            else if (currentView === 'year') newDate.setFullYear(prevDate.getFullYear() + d);
            return newDate;
        });
    };
    
    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setIsDatePickerOpen(false);
    };

    const formattedDate = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="home-page-layout">
            <div className="home-page-header">
                <div className="date-display">
                    <span className="current-date">{formattedDate}</span>
                </div>
                <div className="home-page-controls-group">
                    <div className="view-switcher">
                        <button onClick={() => setCurrentView('day')} className={currentView === 'day' ? 'active' : ''}>Day</button>
                        <button onClick={() => setCurrentView('week')} className={currentView === 'week' ? 'active' : ''}>Week</button>
                        <button onClick={() => setCurrentView('month')} className={currentView === 'month' ? 'active' : ''}>Month</button>
                        <button onClick={() => setCurrentView('year')} className={currentView === 'year' ? 'active' : ''}>Year</button>
                    </div>
                    <div className="date-nav-controls">
                        <button onClick={() => handleDateChange('prev')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button ref={datePickerToggleRef} onClick={() => setIsDatePickerOpen(o => !o)} className="date-picker-toggle">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </button>
                        <button onClick={() => handleDateChange('next')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                        {isDatePickerOpen && <DatePicker selectedDate={selectedDate} onChange={handleDateSelect} onClose={() => setIsDatePickerOpen(false)} />}
                    </div>
                </div>
            </div>

            <div className="home-page-content">
                <div className="left-column-activity">
                     <div className="activity-header">
                        <h3 className="activity-title">Timeline</h3>
                    </div>
                    <div className="timeline-scroll-wrapper" ref={timelineScrollRef}>
                        {currentView === 'day' ? (
                            <Timeline sessions={sessionsInView} allProjects={allProjectsForColors} pixelsPerMinute={2} />
                        ) : (
                            <div className="placeholder-timeline">
                                <p>Timeline view is only available for 'Day' view.</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="right-column-summary">
                    {currentView === 'day' ? (
                        <DailySummaryCard 
                            title={summaryTitle}
                            totalMsInView={totalMsInView}
                            targetHours={targetHours}
                            projectBreakdown={projectBreakdown}
                            topCategories={topCategories}
                            allProjectsForColors={allProjectsForColors}
                        />
                    ) : (
                        <div className="content-card placeholder-summary">
                            <p className="content-card-title">Summary for {currentView}</p>
                            <p>Total time: {formatToHoursAndMinutes(totalMsInView)}</p>
                            <p className="placeholder-text">Detailed summary is available in 'Day' view.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;