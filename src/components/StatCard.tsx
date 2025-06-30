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
}

const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    subtitle, 
    progress,
    progressColor = '#8A2BE2',
    animated = true,
    trend,
    trendValue
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
                borderRadius: hasEnhancedFeatures ? '12px' : '0',
                padding: hasEnhancedFeatures ? '24px' : '0',
                boxShadow: hasEnhancedFeatures ? '0 1px 2px rgba(0, 0, 0, 0.15)' : 'none'
            }}
        >
            <p style={{ 
                fontSize: '0.875rem', 
                color: '#888888', 
                margin: '0 0 4px 0',
                fontWeight: 500
            }}>
                {title}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <p style={{ 
                    fontSize: '1.875rem', 
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
                <div style={{ marginTop: '16px' }}>
                    <div style={{
                        height: '6px',
                        backgroundColor: '#333438',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        marginBottom: '8px'
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