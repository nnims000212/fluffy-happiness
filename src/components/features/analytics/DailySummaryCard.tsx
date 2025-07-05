// src/components/DailySummaryCard.tsx
import React, { useState, useEffect } from 'react';
import { formatToHoursAndMinutes } from '../../../utils/formatters';
import { getProjectColor } from '../../../utils/colors';
import { useAppContext } from '../../../context/useAppContext';
import StatCard from './StatCard';
import DonutChart from './DonutChart';
import toast from 'react-hot-toast';

interface DailySummaryCardProps {
    title: string;
    totalMsInView: number;
    targetHours: number;
    projectBreakdown: { name: string; value: number }[];
    topCategories: { name: string; value: number; displayPercent: number }[];
    allProjectsForColors: string[];
}

const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ title, totalMsInView, targetHours, projectBreakdown, topCategories, allProjectsForColors }) => {
    const { dailyWorkGoalHours, setDailyWorkGoalHours } = useAppContext();
    const [showGoalEditor, setShowGoalEditor] = useState(false);
    const [tempGoalValue, setTempGoalValue] = useState(dailyWorkGoalHours.toString());
    
    const totalHours = totalMsInView / 3600000;
    const percentOfTarget = targetHours > 0 ? Math.round((totalHours / targetHours) * 100) : 0;

    const handleGoalSave = () => {
        const newGoal = parseFloat(tempGoalValue);
        if (newGoal > 0 && newGoal <= 24) {
            setDailyWorkGoalHours(newGoal);
            setShowGoalEditor(false);
            toast.success(`Daily work goal updated to ${newGoal} hour${newGoal === 1 ? '' : 's'}!`);
        } else {
            toast.error('Please enter a valid goal between 0.5 and 24 hours');
        }
    };

    const handleGoalCancel = () => {
        setTempGoalValue(dailyWorkGoalHours.toString());
        setShowGoalEditor(false);
    };

    // Sync temp value when goal changes
    useEffect(() => {
        setTempGoalValue(dailyWorkGoalHours.toString());
    }, [dailyWorkGoalHours]);
    
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
                    subtitle={`of ${targetHours} hr${targetHours === 1 ? '' : 's'}`}
                    progress={Math.min(percentOfTarget, 100)}
                    onSettingsClick={() => setShowGoalEditor(true)}
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
            
            {/* Goal Editor Modal */}
            {showGoalEditor && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#242529',
                        borderRadius: '12px',
                        padding: '24px',
                        border: '1px solid #333438',
                        minWidth: '300px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#EAEAEA' }}>Daily Work Goal</h3>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '8px', 
                                color: '#888888',
                                fontSize: '0.875rem'
                            }}>
                                Hours per day:
                            </label>
                            <input
                                type="number"
                                min="0.5"
                                max="24"
                                step="0.5"
                                value={tempGoalValue}
                                onChange={(e) => setTempGoalValue(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    backgroundColor: '#333438',
                                    border: '1px solid #444549',
                                    borderRadius: '6px',
                                    color: '#EAEAEA',
                                    fontSize: '1rem',
                                    boxSizing: 'border-box'
                                }}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleGoalSave();
                                    if (e.key === 'Escape') handleGoalCancel();
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleGoalCancel}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #333438',
                                    borderRadius: '6px',
                                    color: '#888888',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGoalSave}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#8A2BE2',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: '#EAEAEA',
                                    cursor: 'pointer'
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailySummaryCard;