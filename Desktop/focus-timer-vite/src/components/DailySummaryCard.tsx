// src/components/DailySummaryCard.tsx
import React from 'react';
import { formatToHoursAndMinutes } from '../utils/formatters';
import { getProjectColor } from '../utils/colors';
import StatCard from './StatCard';
import DonutChart from './DonutChart';

interface DailySummaryCardProps {
    title: string;
    totalMsInView: number;
    targetHours: number;
    projectBreakdown: { name: string; value: number }[];
    topCategories: { name: string; value: number; displayPercent: number }[];
    allProjectsForColors: string[];
}

const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ title, totalMsInView, targetHours, projectBreakdown, topCategories, allProjectsForColors }) => {
    const totalHours = totalMsInView / 3600000;
    const percentOfTarget = targetHours > 0 ? Math.round((totalHours / targetHours) * 100) : 0;
    
    return (
        <div className="content-card daily-summary-card">
            <div className="card-header">
                <p className="content-card-title">{title}</p>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="settings-icon"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.28a2 2 0 0 0 .73 2.73l.09.09a2 2 0 0 1 0 2.83l-.08.08a2 2 0 0 0-.73 2.73l.78 1.28a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.78-1.28a2 2 0 0 0-.73-2.73l-.09-.09a2 2 0 0 1 0-2.83l.08-.08a2 2 0 0 0 .73-2.73l-.78-1.28a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </div>
            <div className="summary-stats-grid">
                <StatCard title="Work Hours" value={formatToHoursAndMinutes(totalMsInView)} />
                <StatCard title="Percent of Target" value={`${percentOfTarget}%`} subtitle={`of ${targetHours} hr 0 min`} />
            </div>
            <div className="summary-breakdown">
                <p className="breakdown-title">Breakdown</p>
                <div className="breakdown-content">
                    <DonutChart data={projectBreakdown} allProjects={allProjectsForColors} />
                    <div className="breakdown-legend">
                        {projectBreakdown.slice(0, 4).map(item => (
                            <div key={item.name} className="legend-item">
                                <span className="legend-color-dot" style={{ backgroundColor: getProjectColor(item.name, allProjectsForColors) }}></span>
                                <div className="legend-text">
                                    <span className="legend-name">{item.name}</span>
                                    <span className="legend-duration">{formatToHoursAndMinutes(item.value)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="top-categories-section">
                <p className="top-categories-title">Top Categories</p>
                <div className="top-categories-list">
                    {topCategories.length > 0 ? topCategories.slice(0, 3).map(cat => (
                            <div key={cat.name} className="category-item">
                                <span className="category-percent">{`${cat.displayPercent}%`}</span>
                                <div className="category-progress-bar-container">
                                    <div className="category-progress-bar" style={{ width: `${cat.displayPercent}%`, backgroundColor: 'var(--primary-accent-color)' }}></div>
                                </div>
                                <span className="category-name">{cat.name}</span>
                                <span className="category-duration">{formatToHoursAndMinutes(cat.value)}</span>
                            </div>
                        )
                    ) : <p className="placeholder-text">No category data for this period.</p>}
                </div>
            </div>
        </div>
    );
};

export default DailySummaryCard;