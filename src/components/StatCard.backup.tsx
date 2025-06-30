// Backup of the current StatCard implementation
// src/components/StatCard.tsx
import React, { useState, useEffect } from 'react';

interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    progress?: number; // Progress value from 0 to 100
    progressColor?: string;
    animated?: boolean;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    subtitle, 
    progress,
    progressColor = 'var(--primary-accent-color)',
    animated = true,
    trend,
    trendValue
}) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    
    useEffect(() => {
        if (progress !== undefined && animated) {
            setAnimatedProgress(0);
            const timer = setTimeout(() => {
                setAnimatedProgress(progress);
            }, 100);
            return () => clearTimeout(timer);
        } else if (progress !== undefined) {
            setAnimatedProgress(progress);
        }
    }, [progress, animated]);

    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                );
            case 'down':
                return (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                        <polyline points="17 18 23 18 23 12"></polyline>
                    </svg>
                );
            default:
                return null;
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'up': return '#10b981';
            case 'down': return '#ef4444';
            default: return 'var(--text-muted-color)';
        }
    };

    const hasEnhancedFeatures = progress !== undefined || trend !== undefined;
    
    return (
        <div className={`stat-card ${hasEnhancedFeatures ? 'enhanced' : ''}`}>
            <div className="stat-card-content">
                <p className="stat-title">{title}</p>
                <div className="stat-value-container">
                    <p className="stat-value">{value}</p>
                    {trend && trendValue && (
                        <div className="stat-trend" style={{ color: getTrendColor() }}>
                            {getTrendIcon()}
                            <span className="trend-value">{trendValue}</span>
                        </div>
                    )}
                </div>
                {subtitle && <p className="stat-subtitle">{subtitle}</p>}
                
                {progress !== undefined && (
                    <div className="stat-progress-container">
                        <div className="stat-progress-track">
                            <div 
                                className="stat-progress-bar"
                                style={{
                                    width: `${animatedProgress}%`,
                                    backgroundColor: progressColor,
                                    transition: animated ? 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
                                }}
                            />
                        </div>
                        <span className="stat-progress-text">{Math.round(animatedProgress)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;