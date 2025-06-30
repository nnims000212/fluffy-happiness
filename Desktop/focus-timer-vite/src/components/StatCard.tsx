// src/components/StatCard.tsx
import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => (
    <div className="stat-card">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
    </div>
);

export default StatCard;