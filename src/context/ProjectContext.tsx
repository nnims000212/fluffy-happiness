// src/context/ProjectContext.tsx
import React, { createContext, useContext, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Project } from '../types/index';
import toast from 'react-hot-toast';

interface ProjectContextType {
    // Project data
    projects: Project[];
    
    // Project operations
    addProject: (projectName: string) => boolean;
    updateProject: (projectId: string, updates: Partial<Omit<Project, 'id'>>, showToast?: boolean) => void;
    deleteProject: (projectId: string, onProjectDeleted?: (projectName: string) => void) => void;
    archiveProject: (projectId: string) => void;
    unarchiveProject: (projectId: string) => void;
    renameProject: (oldName: string, newName: string, onProjectRenamed?: (oldName: string, newName: string) => void) => boolean;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useLocalStorage<Project[]>('focusTimerProjects', []);

    const addProject = useCallback((projectName: string): boolean => {
        if (projects.find(p => p.name === projectName)) {
            toast.error(`Project "${projectName}" already exists.`);
            return false;
        }
        
        const newProject: Project = {
            id: `project_${Date.now()}`,
            name: projectName,
            notes: '',
            archived: false,
            createdAt: new Date()
        };
        
        setProjects(prevProjects => [...prevProjects, newProject].sort((a,b) => a.name.localeCompare(b.name)));
        toast.success(`Project "${projectName}" added!`);
        return true;
    }, [projects, setProjects]);

    const updateProject = useCallback((projectId: string, updates: Partial<Omit<Project, 'id'>>, showToast: boolean = true) => {
        setProjects(prev => prev.map(project => 
            project.id === projectId ? { ...project, ...updates } : project
        ));
        if (showToast && !updates.notes) {
            toast.success("Project updated!");
        } else if (showToast && updates.notes !== undefined) {
            toast.success("Project notes saved!");
        }
    }, [setProjects]);

    const deleteProject = useCallback((projectId: string, onProjectDeleted?: (projectName: string) => void): void => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        // Notify other contexts about the deletion
        if (onProjectDeleted) {
            onProjectDeleted(project.name);
        }
        
        // Remove the project
        setProjects(prev => prev.filter(p => p.id !== projectId));
        toast.success(`Project "${project.name}" deleted!`);
    }, [projects, setProjects]);

    const archiveProject = useCallback((projectId: string): void => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        setProjects(prev => prev.map(p => 
            p.id === projectId ? { ...p, archived: true, archivedAt: new Date() } : p
        ));
        toast.success(`Project "${project.name}" archived!`);
    }, [projects, setProjects]);

    const unarchiveProject = useCallback((projectId: string): void => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        setProjects(prev => prev.map(p => 
            p.id === projectId ? { ...p, archived: false, archivedAt: undefined } : p
        ));
        toast.success(`Project "${project.name}" unarchived!`);
    }, [projects, setProjects]);

    const renameProject = useCallback((oldName: string, newName: string, onProjectRenamed?: (oldName: string, newName: string) => void): boolean => {
        const existingProject = projects.find(p => p.name === newName);
        if (existingProject) {
            toast.error(`Project "${newName}" already exists.`);
            return false;
        }
        
        const projectToRename = projects.find(p => p.name === oldName);
        if (!projectToRename) {
            toast.error(`Project "${oldName}" not found.`);
            return false;
        }
        
        // Notify other contexts about the rename
        if (onProjectRenamed) {
            onProjectRenamed(oldName, newName);
        }
        
        // Update the project name
        setProjects(prev => prev.map(project => 
            project.id === projectToRename.id ? { ...project, name: newName } : project
        ).sort((a,b) => a.name.localeCompare(b.name)));
        
        toast.success(`Project renamed to "${newName}"!`);
        return true;
    }, [projects, setProjects]);

    // Data migration for legacy project formats
    useEffect(() => {
        const rawProjects = localStorage.getItem('focusTimerProjects');
        if (rawProjects) {
            try {
                const parsed = JSON.parse(rawProjects);
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                    // Convert string array to Project array
                    const migratedProjects: Project[] = parsed.map((name: string, index: number) => ({
                        id: `project_${Date.now()}_${index}`,
                        name,
                        notes: '',
                        archived: false,
                        createdAt: new Date()
                    }));
                    setProjects(migratedProjects);
                    console.log('🔄 Migrated projects from string array to Project objects');
                }
            } catch (parseError) {
                console.error('🚨 Failed to parse projects data:', parseError);
                
                // Initialize with default projects
                const defaultProjects: Project[] = [
                    { id: 'project_work', name: 'Work', notes: '', archived: false, createdAt: new Date() },
                    { id: 'project_personal', name: 'Personal', notes: '', archived: false, createdAt: new Date() },
                    { id: 'project_learning', name: 'Learning', notes: '', archived: false, createdAt: new Date() }
                ];
                setProjects(defaultProjects);
                console.log('🔧 Initialized with default projects after migration error');
            }
        }
    }, [setProjects]);

    const value: ProjectContextType = {
        projects,
        addProject,
        updateProject,
        deleteProject,
        archiveProject,
        unarchiveProject,
        renameProject,
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjectContext = () => {
    const context = useContext(ProjectContext);
    if (context === null) {
        throw new Error('useProjectContext must be used within a ProjectProvider');
    }
    return context;
};