// src/components/StatCard.tsx
import React, { useState, useEffect } from 'react';

interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    progress?: number;
    progressColor?: string;
    animated?: boolean;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    onSettingsClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    subtitle, 
    progress,
    progressColor = '#8A2BE2',
    // animated = true,
    trend,
    trendValue,
    onSettingsClick
}) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    
    useEffect(() => {
        if (progress !== undefined) {
            setAnimatedProgress(0);
            const timer = setTimeout(() => {
                setAnimatedProgress(progress);
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [progress, title, trend, trendValue]);

    const hasEnhancedFeatures = progress !== undefined || trend !== undefined;
    
    return (
        <div 
            className={`stat-card ${hasEnhancedFeatures ? 'enhanced' : ''}`}
            style={{
                backgroundColor: hasEnhancedFeatures ? '#242529' : 'transparent',
                border: hasEnhancedFeatures ? '1px solid #333438' : 'none',
                borderRadius: hasEnhancedFeatures ? '8px' : '0',
                padding: hasEnhancedFeatures ? '12px' : '0',
                boxShadow: hasEnhancedFeatures ? '0 1px 2px rgba(0, 0, 0, 0.15)' : 'none'
            }}
        >
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                margin: '0 0 4px 0'
            }}>
                <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#888888', 
                    margin: 0,
                    fontWeight: 500
                }}>
                    {title}
                </p>
                {onSettingsClick && (
                    <button
                        onClick={onSettingsClick}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#888888',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '4px',
                            transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#EAEAEA'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#888888'}
                        title="Adjust daily work goal"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <p style={{ 
                    fontSize: hasEnhancedFeatures ? '1.5rem' : '1.875rem', 
                    fontWeight: 700, 
                    color: '#EAEAEA', 
                    margin: 0,
                    lineHeight: 1.2
                }}>
                    {value}
                </p>
                
                {trend && trendValue && (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontSize: '0.75rem',
                        color: trend === 'up' ? '#10b981' : '#ef4444'
                    }}>
                        <span>{trend === 'up' ? '↗' : '↘'}</span>
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
            
            {subtitle && (
                <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#888888', 
                    margin: '4px 0 0 0' 
                }}>
                    {subtitle}
                </p>
            )}
            
            {progress !== undefined && (
                <div style={{ marginTop: '12px' }}>
                    <div style={{
                        height: '4px',
                        backgroundColor: '#333438',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        marginBottom: '6px'
                    }}>
                        <div 
                            style={{
                                height: '100%',
                                width: `${animatedProgress}%`,
                                backgroundColor: progressColor,
                                borderRadius: '3px',
                                transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        />
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: '#888888'
                    }}>
                        <span>Progress</span>
                        <span>{Math.round(animatedProgress)}%</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatCard;