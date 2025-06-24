// src/components/DonutChart.tsx
import React from 'react';
import { getProjectColor } from '../utils/colors';

interface DonutChartProps {
    data: { name: string, value: number }[];
    allProjects: string[];
}

const DonutChart: React.FC<DonutChartProps> = ({ data, allProjects }) => {
    const radius = 60;
    const strokeWidth = 18;
    const circumference = 2 * Math.PI * radius;
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    let accumulatedAngle = -90;
    const totalGapPercentage = data.length > 1 ? 0.05 : 0;
    const availableArcPercentage = 1 - totalGapPercentage;
    const gapAngle = (totalGapPercentage / data.length) * 360;

    return (
        <svg viewBox="0 0 160 160" className="breakdown-chart">
        {data.map((item, index) => {
            if (item.value <= 0) return null;
            const percentage = item.value / totalValue;
            const scaledPercentage = percentage * availableArcPercentage;
            const strokeDashoffset = circumference * (1 - scaledPercentage);
            const rotation = accumulatedAngle;
            accumulatedAngle += scaledPercentage * 360 + gapAngle;
            return (
                <circle 
                    key={index} 
                    cx="80" 
                    cy="80" 
                    r={radius} 
                    fill="transparent" 
                    stroke={getProjectColor(item.name, allProjects)} 
                    strokeWidth={strokeWidth} 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset} 
                    transform={`rotate(${rotation} 80 80)`}
                />
            );
        })}
        </svg>
    );
};

export default DonutChart;