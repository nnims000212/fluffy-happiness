import React from 'react';
import { useAppContext } from '../context/AppContext';

interface ProjectFilterProps {
    selectedProject: string | null;
    onProjectSelect: (project: string | null) => void;
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({
    selectedProject,
    onProjectSelect
}) => {
    const { projects, todos } = useAppContext();

    // Get total todo count for each project (pending + completed)
    const getProjectTodoCount = (projectId: string | null) => {
        const filteredTodos = projectId === null 
            ? todos 
            : todos.filter(todo => todo.projectId === projectId);
        
        return filteredTodos.length;
    };

    return (
        <div className="project-filter">
            <div className="project-filter-header">
                <h3>Projects</h3>
            </div>
            
            <div className="project-list">
                <div 
                    className={`project-item ${selectedProject === null ? 'active' : ''}`}
                    onClick={() => onProjectSelect(null)}
                >
                    <span className="project-name">All Projects</span>
                    <span className="project-count">{getProjectTodoCount(null)}</span>
                </div>
                
                {projects.map(project => {
                    const count = getProjectTodoCount(project);
                    
                    return (
                        <div 
                            key={project}
                            className={`project-item ${selectedProject === project ? 'active' : ''}`}
                            onClick={() => onProjectSelect(project)}
                        >
                            <span className="project-name">{project}</span>
                            <span className="project-count">{count}</span>
                        </div>
                    );
                })}
                
                {todos.some(todo => todo.projectId === '') && (
                    <div 
                        className={`project-item ${selectedProject === '' ? 'active' : ''}`}
                        onClick={() => onProjectSelect('')}
                    >
                        <span className="project-name">No Project</span>
                        <span className="project-count">{getProjectTodoCount('')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectFilter;