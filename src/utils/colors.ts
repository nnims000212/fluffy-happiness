// src/utils/colors.ts

const projectColors = [
    '#00C49F', '#0088FE', '#8A2BE2', '#FFBB28', '#FF8042',
    '#AF19FF', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'
];

/**
 * Gets a consistent color for a project name.
 * @param projectName The name of the project.
 * @param allProjects An array of all known project names to ensure stable color mapping.
 */
export const getProjectColor = (projectName: string, allProjects: string[]): string => {
    const key = projectName || 'Other';
    // Hardcoded colors for special categories
    if (key === 'Focus') return '#00D8FF';
    if (key === 'Meetings') return '#AF19FF';
    if (key === 'Breaks') return '#0088FE';
    if (key === 'Other') return '#888888';

    const index = allProjects.indexOf(key);
    // Fallback for projects not in the list, ensuring a color is always returned
    const colorIndex = index === -1 
        ? (key.length % projectColors.length) 
        : (index % projectColors.length);
        
    return projectColors[colorIndex];
};