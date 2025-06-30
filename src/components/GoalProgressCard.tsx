// src/components/GoalProgressCard.tsx
import React, { useState, useEffect } from 'react';
import { formatToHoursAndMinutes } from '../utils/formatters';

interface Goal {
    id: string;
    title: string;
    targetHours: number;
    currentHours: number;
    deadline?: Date;
    category: string;
}

interface GoalProgressCardProps {
    goals: Goal[];
}

const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ goals }) => {
    const [animatedGoals, setAnimatedGoals] = useState<(Goal & { animatedProgress: number })[]>([]);

    useEffect(() => {
        // Initialize with 0 progress
        setAnimatedGoals(goals.map(goal => ({ ...goal, animatedProgress: 0 })));
        
        // Animate to actual progress
        const timer = setTimeout(() => {
            setAnimatedGoals(goals.map(goal => ({
                ...goal,
                animatedProgress: Math.min((goal.currentHours / goal.targetHours) * 100, 100)
            })));
        }, 200);

        return () => clearTimeout(timer);
    }, [goals]);

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return '#10b981'; // Green
        if (percentage >= 75) return 'var(--focus-color)'; // Cyan
        if (percentage >= 50) return 'var(--primary-accent-color)'; // Purple
        return '#ef4444'; // Red
    };

    const getStatusIcon = (percentage: number) => {
        if (percentage >= 100) {
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22,4 12,14.01 9,11.01"></polyline>
                </svg>
            );
        }
        if (percentage >= 75) {
            return (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--focus-color)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
            );
        }
        return (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted-color)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
        );
    };

    const getDaysRemaining = (deadline?: Date) => {
        if (!deadline) return null;
        const now = new Date();
        const diffTime = deadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="content-card goal-progress-card">
            <div className="card-header">
                <h3 className="content-card-title">Goal Progress</h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
            </div>
            
            <div className="goals-list">
                {animatedGoals.length === 0 ? (
                    <div className="empty-state">
                        <p className="text-muted">No active goals. Set some goals to track your progress!</p>
                    </div>
                ) : (
                    animatedGoals.map((goal, index) => {
                        const percentage = Math.min((goal.currentHours / goal.targetHours) * 100, 100);
                        const daysRemaining = getDaysRemaining(goal.deadline);
                        
                        return (
                            <div 
                                key={goal.id} 
                                className="goal-item animate-slide-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="goal-header">
                                    <div className="goal-title-section">
                                        {getStatusIcon(percentage)}
                                        <h4 className="goal-title">{goal.title}</h4>
                                        <span className="goal-category">{goal.category}</span>
                                    </div>
                                    <div className="goal-stats">
                                        <span className="goal-percentage">{Math.round(percentage)}%</span>
                                        {daysRemaining !== null && (
                                            <span className={`goal-deadline ${daysRemaining <= 3 ? 'urgent' : ''}`}>
                                                {daysRemaining > 0 ? `${daysRemaining}d left` : 'Overdue'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="goal-progress-section">
                                    <div className="goal-progress-track">
                                        <div 
                                            className="goal-progress-bar"
                                            style={{
                                                width: `${goal.animatedProgress}%`,
                                                backgroundColor: getProgressColor(percentage),
                                                transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: percentage >= 90 ? 
                                                    `0 0 12px ${getProgressColor(percentage)}40` : 'none'
                                            }}
                                        />
                                    </div>
                                    <div className="goal-hours-info">
                                        <span className="current-hours">
                                            {formatToHoursAndMinutes(goal.currentHours * 3600000)}
                                        </span>
                                        <span className="goal-separator"> / </span>
                                        <span className="target-hours">
                                            {formatToHoursAndMinutes(goal.targetHours * 3600000)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default GoalProgressCard;