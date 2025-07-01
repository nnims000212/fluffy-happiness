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
            </div>
            <div className="summary-stats-grid">
                <StatCard 
                    title="Work Hours" 
                    value={formatToHoursAndMinutes(totalMsInView)} 
                />
                <StatCard 
                    title="Percent of Target" 
                    value={`${percentOfTarget}%`} 
                    subtitle={`of ${targetHours} hr 0 min`}
                    progress={Math.min(percentOfTarget, 100)}
                    trend={percentOfTarget >= 100 ? 'up' : percentOfTarget >= 50 ? 'neutral' : 'down'}
                    trendValue={percentOfTarget >= 100 ? 'Goal achieved!' : `${Math.max(100 - percentOfTarget, 0)}% to go`}
                />
            </div>
            <div className="summary-breakdown">
                <p className="breakdown-title">Project Breakdown</p>
                <div className="breakdown-content">
                    <DonutChart data={projectBreakdown} allProjects={allProjectsForColors} />
                    <div className="breakdown-legend">
                        {projectBreakdown.slice(0, 4).map((item, index) => (
                            <div key={`${item.name}-${item.value}-${index}`} className="legend-item">
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
                <p className="top-categories-title">Task Breakdown</p>
                <div className="top-categories-list">
                    {topCategories.length > 0 ? (
                        topCategories.slice(0, 4).map((cat, index) => {
                            const truncatedName = cat.name.length > 25 ? `${cat.name.substring(0, 25)}...` : cat.name;
                            return (
                                <div key={`${cat.name}-${cat.value}-${index}`} className="category-item">
                                    <span className="category-percent">{`${cat.displayPercent}%`}</span>
                                    <div className="category-progress-bar-container">
                                        <div className="category-progress-bar" style={{ width: `${cat.displayPercent}%`, backgroundColor: 'var(--primary-accent-color)' }}></div>
                                    </div>
                                    <span className="category-name" title={cat.name}>{truncatedName}</span>
                                    <span className="category-duration">{formatToHoursAndMinutes(cat.value)}</span>
                                </div>
                            );
                        })
                    ) : (
                        <p className="placeholder-text">No category data for this period.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailySummaryCard;