// src/components/ProjectSelector.tsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface ProjectSelectorProps {
    selectedProject: string;
    onProjectChange: (project: string) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ selectedProject, onProjectChange }) => {
    const { projects, addProject } = useAppContext();
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === 'new_project') {
            setIsCreating(true);
        } else {
            onProjectChange(e.target.value);
            setIsCreating(false);
        }
    };

    const handleSaveNewProject = () => {
        if (newProjectName.trim()) {
            if (addProject(newProjectName.trim())) {
                onProjectChange(newProjectName.trim());
            }
            setNewProjectName("");
            setIsCreating(false);
        }
    };

    const handleCancel = () => {
        setNewProjectName("");
        setIsCreating(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission if it's inside a form
            handleSaveNewProject();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    // If we are in "creation mode", render the new form
    if (isCreating) {
        return (
            // Use the new CSS class for the container div
            <div className="inline-creator-form">
                <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="New project name..."
                    autoFocus
                    onKeyDown={handleKeyDown}
                    // No more inline styles! It will inherit from global form styles.
                />
                {/* These buttons will use their base classes + the new container class for sizing */}
                <button type="button" className="btn-primary" onClick={handleSaveNewProject}>
                    Save
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                    Cancel
                </button>
            </div>
        );
    }

    // By default, render the standard dropdown select, now with a custom wrapper
    return (
        <div className="custom-select-wrapper">
            <select value={selectedProject} onChange={handleSelectChange}>
                <option value="">Select Project</option>
                {projects.filter(p => !p.archived).map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                <option value="new_project">-- Create New Project --</option>
            </select>
        </div>
    );
};

export default ProjectSelector;