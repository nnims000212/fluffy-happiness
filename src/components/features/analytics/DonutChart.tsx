// src/components/DonutChart.tsx
import React, { useState, useEffect } from 'react';
import { getProjectColor } from '../../../utils/colors';
import { formatToHoursAndMinutes } from '../../../utils/formatters';

interface DonutChartProps {
    data: { name: string, value: number }[];
    allProjects: string[];
}

const DonutChart: React.FC<DonutChartProps> = ({ data, allProjects }) => {
    const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
    const [animatedData, setAnimatedData] = useState<{ name: string, value: number, animatedValue: number }[]>([]);
    
    const radius = 60;
    const strokeWidth = 18;
    const circumference = 2 * Math.PI * radius;
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    
    // Initialize animated data
    useEffect(() => {
        setAnimatedData(data.map(item => ({ ...item, animatedValue: 0 })));
        
        // Animate in the chart
        const timer = setTimeout(() => {
            setAnimatedData(data.map(item => ({ ...item, animatedValue: item.value })));
        }, 100);
        
        return () => clearTimeout(timer);
    }, [data]);

    // Filter out zero-value items and prepare visible data
    const visibleData = animatedData.filter(item => item.animatedValue > 0);
    const visibleDataLength = visibleData.length;
    const totalGapPercentage = visibleDataLength > 1 ? 0.05 : 0;
    const availableArcPercentage = 1 - totalGapPercentage;
    const gapAngle = visibleDataLength > 1 ? (totalGapPercentage / visibleDataLength) * 360 : 0;

    return (
        <div 
            style={{ position: 'relative', width: '140px', height: '140px' }}
            onMouseLeave={() => setHoveredSegment(null)}
        >
            <svg viewBox="0 0 160 160" className="breakdown-chart">
                {/* Background circle */}
                <circle 
                    cx="80" 
                    cy="80" 
                    r={radius} 
                    fill="transparent" 
                    stroke="var(--secondary-surface-color)" 
                    strokeWidth={strokeWidth}
                    opacity={0.3}
                />
                
                {/* Invisible center circle to clear hover state */}
                <circle 
                    cx="80" 
                    cy="80" 
                    r={radius - strokeWidth / 2} 
                    fill="transparent" 
                    onMouseEnter={() => setHoveredSegment(null)}
                    style={{ cursor: 'default' }}
                />
                
                {/* Data segments */}
                {(() => {
                    let accumulatedAngle = -90;
                    
                    const createArcPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
                        const startAngleRad = (startAngle * Math.PI) / 180;
                        const endAngleRad = (endAngle * Math.PI) / 180;
                        
                        const x1 = 80 + innerRadius * Math.cos(startAngleRad);
                        const y1 = 80 + innerRadius * Math.sin(startAngleRad);
                        const x2 = 80 + outerRadius * Math.cos(startAngleRad);
                        const y2 = 80 + outerRadius * Math.sin(startAngleRad);
                        
                        const x3 = 80 + outerRadius * Math.cos(endAngleRad);
                        const y3 = 80 + outerRadius * Math.sin(endAngleRad);
                        const x4 = 80 + innerRadius * Math.cos(endAngleRad);
                        const y4 = 80 + innerRadius * Math.sin(endAngleRad);
                        
                        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
                        
                        return [
                            "M", x1, y1,
                            "L", x2, y2,
                            "A", outerRadius, outerRadius, 0, largeArcFlag, 1, x3, y3,
                            "L", x4, y4,
                            "A", innerRadius, innerRadius, 0, largeArcFlag, 0, x1, y1,
                            "Z"
                        ].join(" ");
                    };
                    
                    return visibleData.map((item) => {
                        const percentage = item.animatedValue / totalValue;
                        const scaledPercentage = percentage * availableArcPercentage;
                        const segmentAngle = scaledPercentage * 360;
                        const startAngle = accumulatedAngle;
                        const endAngle = accumulatedAngle + segmentAngle;
                        const isHovered = hoveredSegment === item.name;
                        
                        accumulatedAngle += segmentAngle + gapAngle;
                        
                        const strokeDashoffset = circumference * (1 - scaledPercentage);
                        const hitAreaPath = createArcPath(startAngle, endAngle, radius - strokeWidth/2 - 5, radius + strokeWidth/2 + 5);
                        
                        return (
                            <g key={item.name}>
                                {/* Invisible hit area */}
                                <path
                                    d={hitAreaPath}
                                    fill="transparent"
                                    style={{ cursor: 'pointer' }}
                                    onMouseEnter={() => setHoveredSegment(item.name)}
                                />
                                {/* Visible segment */}
                                <circle 
                                    cx="80" 
                                    cy="80" 
                                    r={radius} 
                                    fill="transparent" 
                                    stroke={getProjectColor(item.name, allProjects)} 
                                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                                    strokeDasharray={circumference} 
                                    strokeDashoffset={strokeDashoffset} 
                                    transform={`rotate(${startAngle} 80 80)`}
                                    className="donut-segment"
                                    style={{
                                        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                        filter: isHovered ? 'brightness(1.1)' : 'none',
                                        pointerEvents: 'none'
                                    }}
                                />
                            </g>
                        );
                    });
                })()}
                
                {/* Center content */}
                <g className="donut-center-content">
                    {(() => {
                        const hoveredItem = hoveredSegment ? visibleData.find(item => item.name === hoveredSegment) : null;
                        
                        return hoveredItem ? (
                            <>
                                <text x="80" y="75" textAnchor="middle" className="donut-center-value">
                                    {formatToHoursAndMinutes(hoveredItem.value)}
                                </text>
                                <text x="80" y="90" textAnchor="middle" className="donut-center-label">
                                    {hoveredItem.name}
                                </text>
                            </>
                        ) : (
                            <>
                                <text x="80" y="75" textAnchor="middle" className="donut-center-value">
                                    {formatToHoursAndMinutes(totalValue)}
                                </text>
                                <text x="80" y="90" textAnchor="middle" className="donut-center-label">
                                    Total
                                </text>
                            </>
                        );
                    })()}
                </g>
            </svg>
        </div>
    );
};

export default DonutChart;