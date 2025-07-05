import React, { useState, useRef, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import TaskInput from '../components/TaskInput';
import TaskDetails from '../components/TaskDetails';
import TodoItem from '../components/TodoItem';
import type { Todo } from '../types';

const TodoPage: React.FC = () => {
    const { todos, setTodos, selectedTodoId, setSelectedTodoId, sessions, projects, addProject, deleteProject, renameProject, archiveProject, unarchiveProject, updateProject } = useAppContext();
    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);
    
    // Project filtering state - start with inbox view
    const [selectedProject, setSelectedProject] = useState<string | null>('');
    const [selectedView, setSelectedView] = useState<'inbox' | 'project' | 'completed' | 'trash' | 'complete'>('inbox');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [editingProject, setEditingProject] = useState<string | null>(null);
    const [editProjectName, setEditProjectName] = useState('');
    const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
    const [projectsCollapsed, setProjectsCollapsed] = useState(false);
    const [archivedProjectsCollapsed, setArchivedProjectsCollapsed] = useState(false);
    const [projectNotesValue, setProjectNotesValue] = useState('');
    const [showAddProject, setShowAddProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    
    // Collapsed state for completed sections
    const [inboxCompletedCollapsed, setInboxCompletedCollapsed] = useState(false);
    const [projectCompletedCollapsed, setProjectCompletedCollapsed] = useState<{[key: string]: boolean}>({});
    

    // Sync project notes value when selected project changes
    React.useEffect(() => {
        if (selectedProject) {
            const project = projects.find(p => p.name === selectedProject);
            setProjectNotesValue(project?.notes || '');
        } else {
            setProjectNotesValue('');
        }
    }, [selectedProject, projects]);

    // Get todos based on current view
    const displayTodos = useMemo(() => {
        if (selectedView === 'trash') {
            return todos.filter(todo => todo.deleted);
        } else if (selectedView === 'completed') {
            return todos.filter(todo => todo.completed && !todo.deleted);
        } else if (selectedView === 'complete') {
            // Complete view - show all pending tasks from all projects
            return todos.filter(todo => !todo.completed && !todo.deleted);
        } else if (selectedView === 'project' && selectedProject !== null) {
            return todos.filter(todo => todo.projectId === selectedProject && !todo.deleted);
        } else {
            // 'inbox' view - show tasks with no project
            return todos.filter(todo => todo.projectId === '' && !todo.deleted);
        }
    }, [todos, selectedView, selectedProject]);

    // Separate pending and completed from display todos
    const pendingTodos = displayTodos.filter(t => !t.completed);
    const completedTodos = displayTodos.filter(t => t.completed);

    const selectedTodo = todos.find(todo => todo.id === selectedTodoId) || null;

    // Get project todo counts (pending only)
    const getProjectCount = (projectName: string) => {
        return todos.filter(todo => todo.projectId === projectName && !todo.completed && !todo.deleted).length;
    };

    const getInboxCount = () => {
        return todos.filter(todo => todo.projectId === '' && !todo.completed && !todo.deleted).length;
    };


    const getCompletedCount = () => {
        return todos.filter(todo => todo.completed && !todo.deleted).length;
    };

    const getTrashCount = () => {
        return todos.filter(todo => todo.deleted).length;
    };

    // Group completed tasks by date
    const groupedCompletedTodos = useMemo(() => {
        const completed = todos.filter(todo => todo.completed);
        const groups: { [key: string]: Todo[] } = {};
        
        completed.forEach(todo => {
            const completedDate = todo.completedAt || new Date();
            const dateKey = completedDate.toDateString();
            
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(todo);
        });
        
        // Sort groups by date (most recent first)
        const sortedEntries = Object.entries(groups).sort(([a], [b]) => 
            new Date(b).getTime() - new Date(a).getTime()
        );
        
        return sortedEntries;
    }, [todos]);

    // Format date for display
    const formatDateLabel = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            const options: Intl.DateTimeFormatOptions = { 
                month: 'short', 
                day: 'numeric',
                weekday: 'short'
            };
            return date.toLocaleDateString('en-US', options);
        }
    };

    // Toggle date group collapse
    const toggleDateCollapse = (dateKey: string) => {
        const newCollapsed = new Set(collapsedDates);
        if (newCollapsed.has(dateKey)) {
            newCollapsed.delete(dateKey);
        } else {
            newCollapsed.add(dateKey);
        }
        setCollapsedDates(newCollapsed);
    };

    // Get active and archived projects
    const activeProjects = projects.filter(p => !p.archived);
    const archivedProjects = projects.filter(p => p.archived);

    // Project editing functions
    const handleProjectEdit = (projectName: string) => {
        setEditingProject(projectName);
        setEditProjectName(projectName);
    };

    const handleProjectSave = () => {
        if (editingProject && editProjectName.trim() && editProjectName !== editingProject) {
            const success = renameProject(editingProject, editProjectName.trim());
            if (success && selectedProject === editingProject) {
                setSelectedProject(editProjectName.trim());
            }
        }
        setEditingProject(null);
        setEditProjectName('');
    };

    const handleProjectCancel = () => {
        setEditingProject(null);
        setEditProjectName('');
    };

    const handleProjectDelete = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        if (window.confirm(`Are you sure you want to delete the project "${project.name}"? All tasks will be moved to "Inbox".`)) {
            deleteProject(projectId);
            if (selectedProject === project.name) {
                setSelectedView('inbox');
                setSelectedProject('');
            }
        }
    };

    const handleProjectArchive = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        archiveProject(projectId);
        if (selectedProject === project.name) {
            setSelectedView('inbox');
            setSelectedProject('');
        }
    };

    const handleProjectUnarchive = (projectId: string) => {
        unarchiveProject(projectId);
    };

    const handleAddProject = () => {
        if (newProjectName.trim()) {
            const success = addProject(newProjectName.trim());
            if (success) {
                setNewProjectName('');
                setShowAddProject(false);
            }
        }
    };

    const handleCancelAddProject = () => {
        setNewProjectName('');
        setShowAddProject(false);
    };

    const handleDragStart = (_e: React.DragEvent<HTMLDivElement>, id: string) => {
        dragItem.current = id;
    };

    const handleDragEnter = (_e: React.DragEvent<HTMLDivElement>, id: string) => {
        dragOverItem.current = id;
    };

    const handleDragEnd = () => {
        const draggedItemId = dragItem.current;
        const targetItemId = dragOverItem.current;

        if (draggedItemId && targetItemId && draggedItemId !== targetItemId) {
            const newTodos = [...todos];
            const dragIndex = todos.findIndex(t => t.id === draggedItemId);
            const targetIndex = todos.findIndex(t => t.id === targetItemId);
            
            if (todos[dragIndex].completed || todos[targetIndex].completed) return;

            const [draggedItem] = newTodos.splice(dragIndex, 1);
            newTodos.splice(targetIndex, 0, draggedItem);
            setTodos(newTodos);
        }
        
        // Clear all drag states
        dragItem.current = null;
        dragOverItem.current = null;
    };

    return (
        <div className={`page todo-page-three-panel ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Left Sidebar */}
            {!sidebarCollapsed && (
                <div className="todo-sidebar">
                    {/* Inbox Section */}
                    <div className="sidebar-section">
                        <div 
                            className={`sidebar-item ${selectedView === 'inbox' ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedView('inbox');
                                setSelectedProject('');
                            }}
                        >
                            <span>📥 Inbox</span>
                            <span className="sidebar-count">{getInboxCount()}</span>
                        </div>
                        <div 
                            className={`sidebar-item ${selectedView === 'complete' ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedView('complete');
                                setSelectedProject('');
                            }}
                        >
                            <span>📋 Complete View</span>
                            <span className="sidebar-count">{todos.filter(todo => !todo.completed && !todo.deleted).length}</span>
                        </div>
                    </div>

                    <div className="sidebar-divider"></div>

                    {/* Projects Section */}
                    <div className={`sidebar-section ${projectsCollapsed ? 'collapsed' : ''}`}>
                        <div className="sidebar-section-header">
                            <div 
                                className="sidebar-section-title"
                                onClick={() => setProjectsCollapsed(!projectsCollapsed)}
                            >
                                <span className={`collapse-icon ${projectsCollapsed ? 'collapsed' : ''}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </span>
                                <h3>Projects</h3>
                            </div>
                            <button 
                                className="add-project-btn"
                                onClick={(e) => { e.stopPropagation(); setShowAddProject(true); }}
                                title="Add new project"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                        {!projectsCollapsed && (
                            <>
                                {showAddProject && (
                                    <div className="sidebar-item add-project-form">
                                        <input
                                            type="text"
                                            value={newProjectName}
                                            onChange={(e) => setNewProjectName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddProject();
                                                if (e.key === 'Escape') handleCancelAddProject();
                                            }}
                                            onBlur={(e) => {
                                                // Only cancel if clicking outside the form
                                                if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                                                    handleCancelAddProject();
                                                }
                                            }}
                                            placeholder="Project name..."
                                            className="add-project-input"
                                            autoFocus
                                        />
                                        <div className="add-project-actions">
                                            <button 
                                                className="add-project-save-btn"
                                                onClick={handleAddProject}
                                                title="Save project"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </button>
                                            <button 
                                                className="add-project-cancel-btn"
                                                onClick={handleCancelAddProject}
                                                title="Cancel"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {activeProjects.map(project => {
                                    const count = getProjectCount(project.name);
                                    return (
                                        <div 
                                            key={project.id}
                                            className={`sidebar-item ${selectedView === 'project' && selectedProject === project.name ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedView('project');
                                                setSelectedProject(project.name);
                                            }}
                                        >
                                            <span>{project.name}</span>
                                            <span className="sidebar-count">{count}</span>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>

                    {/* Archived Projects Section - Only show if there are archived projects */}
                    {archivedProjects.length > 0 && (
                        <>
                            <div className="sidebar-divider"></div>
                            <div className={`sidebar-section ${archivedProjectsCollapsed ? 'collapsed' : ''}`}>
                                <div className="sidebar-section-header">
                                    <div 
                                        className="sidebar-section-title"
                                        onClick={() => setArchivedProjectsCollapsed(!archivedProjectsCollapsed)}
                                    >
                                        <span className={`collapse-icon ${archivedProjectsCollapsed ? 'collapsed' : ''}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </span>
                                        <h3>Archived Projects</h3>
                                    </div>
                                </div>
                                {!archivedProjectsCollapsed && archivedProjects.map(project => {
                                    const count = getProjectCount(project.name);
                                    const isCurrentProject = selectedView === 'project' && selectedProject === project.name;
                                    return (
                                        <div 
                                            key={project.id}
                                            className={`sidebar-item archived-project ${isCurrentProject ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedView('project');
                                                setSelectedProject(project.name);
                                            }}
                                        >
                                            <span>{project.name}</span>
                                            {!isCurrentProject && <span className="sidebar-count">{count}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <div className="sidebar-divider"></div>

                    {/* Completed Section */}
                    <div className="sidebar-section">
                        <div 
                            className={`sidebar-item ${selectedView === 'completed' ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedView('completed');
                                setSelectedProject(null);
                            }}
                        >
                            <span>✅ Completed</span>
                            <span className="sidebar-count">{getCompletedCount()}</span>
                        </div>
                        <div 
                            className={`sidebar-item ${selectedView === 'trash' ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedView('trash');
                                setSelectedProject(null);
                            }}
                        >
                            <span>🗑️ Trash</span>
                            <span className="sidebar-count">{getTrashCount()}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Middle Content */}
            <div className="todo-content">
                <div className="content-header">
                    <div className="header-left">
                        <button 
                            className="sidebar-toggle-btn"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                        
                        {selectedView === 'project' && selectedProject ? (
                            editingProject === selectedProject ? (
                                <div className="project-title-edit">
                                    <input
                                        type="text"
                                        value={editProjectName}
                                        onChange={(e) => setEditProjectName(e.target.value)}
                                        onBlur={handleProjectSave}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleProjectSave();
                                            if (e.key === 'Escape') handleProjectCancel();
                                        }}
                                        autoFocus
                                        className="project-title-input"
                                    />
                                </div>
                            ) : (
                                <div className="project-title-display">
                                    <h2 
                                        onClick={() => handleProjectEdit(selectedProject)}
                                        className="project-title-editable"
                                        title="Click to edit project name"
                                    >
                                        {selectedProject || 'No Project'}
                                    </h2>
                                    {selectedProject && (
                                        <div className="project-actions">
                                            {(() => {
                                                const project = projects.find(p => p.name === selectedProject);
                                                if (!project) return null;
                                                
                                                if (project.archived) {
                                                    return (
                                                        <>
                                                            <button 
                                                                className="project-action-btn"
                                                                onClick={() => handleProjectUnarchive(project.id)}
                                                                title="Unarchive project"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="23 4 23 10 17 10"></polyline>
                                                                    <polyline points="1 20 1 14 7 14"></polyline>
                                                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                className="project-action-btn project-delete-btn"
                                                                onClick={() => handleProjectDelete(project.id)}
                                                                title="Delete project"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                                </svg>
                                                            </button>
                                                        </>
                                                    );
                                                } else {
                                                    return (
                                                        <>
                                                            <button 
                                                                className="project-action-btn"
                                                                onClick={() => handleProjectArchive(project.id)}
                                                                title="Archive project"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="21 8 21 21 3 21 3 8"></polyline>
                                                                    <rect x="1" y="3" width="22" height="5"></rect>
                                                                    <line x1="10" y1="12" x2="14" y2="12"></line>
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                className="project-action-btn project-delete-btn"
                                                                onClick={() => handleProjectDelete(project.id)}
                                                                title="Delete project"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                                                </svg>
                                                            </button>
                                                        </>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            <h2>
                                {selectedView === 'inbox' && '📥 Inbox'}
                                {selectedView === 'complete' && '📋 Complete View'}
                                {selectedView === 'completed' && '✅ Completed'}
                                {selectedView === 'trash' && '🗑️ Trash'}
                            </h2>
                        )}
                    </div>
                </div>
                
                {/* Project Notes Section */}
                {selectedView === 'project' && selectedProject && (
                    <div className="project-notes-section">
                        <textarea
                            className="project-notes-textarea"
                            placeholder="Add project notes..."
                            value={projectNotesValue}
                            onChange={(e) => setProjectNotesValue(e.target.value)}
                            onBlur={() => {
                                const project = projects.find(p => p.name === selectedProject);
                                if (project && projectNotesValue !== project.notes) {
                                    updateProject(project.id, { notes: projectNotesValue });
                                }
                            }}
                        />
                    </div>
                )}
                
                {selectedView !== 'completed' && selectedView !== 'trash' && (
                    <TaskInput currentProjectId={selectedView === 'project' ? selectedProject || '' : selectedView === 'complete' ? '' : ''} />
                )}
                
                <div 
                    className="content-card todo-list-card"
                    onClick={(e) => {
                        // Deselect task when clicking on empty space
                        if (e.target === e.currentTarget) {
                            setSelectedTodoId(null);
                        }
                    }}
                >
                    {displayTodos.length === 0 && (
                        <p className="placeholder-text" style={{padding: '3rem 1rem'}}>
                            {selectedView === 'trash'
                                ? 'No deleted tasks in trash.'
                                : selectedView === 'completed' 
                                    ? 'No completed tasks yet.'
                                    : selectedView === 'complete'
                                        ? 'No pending tasks. Add a task above!'
                                        : selectedView === 'project' 
                                            ? `No tasks for ${selectedProject || 'Inbox'}. Add a task above!`
                                            : 'No tasks in inbox yet. Add a task above!'
                            }
                        </p>
                    )}

                    {selectedView === 'trash' ? (
                        // Trash view - show all deleted tasks
                        displayTodos.length > 0 && (
                            <div className="trash-list-container">
                                {displayTodos.map(todo => (
                                    <TodoItem
                                        key={todo.id}
                                        todo={todo}
                                        onDragStart={() => {}}
                                        onDragEnter={() => {}}
                                        onDragEnd={() => {}}
                                        isDraggingOver={false}
                                        hideProjectBadge={false}
                                    />
                                ))}
                            </div>
                        )
                    ) : selectedView === 'completed' ? (
                        // Completed view - show grouped by date with collapse
                        groupedCompletedTodos.length > 0 && (
                            <div className="completed-groups">
                                {groupedCompletedTodos.map(([dateKey, dateTodos]) => {
                                    const isCollapsed = collapsedDates.has(dateKey);
                                    const dateLabel = formatDateLabel(dateKey);
                                    
                                    return (
                                        <div key={dateKey} className="completed-date-group">
                                            <div 
                                                className="completed-date-header"
                                                onClick={() => toggleDateCollapse(dateKey)}
                                            >
                                                <div className="date-header-content">
                                                    <span className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="6 9 12 15 18 9"></polyline>
                                                        </svg>
                                                    </span>
                                                    <span className="date-label">{dateLabel}</span>
                                                    <span className="date-count">{dateTodos.length}</span>
                                                </div>
                                            </div>
                                            
                                            {!isCollapsed && (
                                                <div className="completed-date-tasks">
                                                    {dateTodos.map(todo => (
                                                        <TodoItem
                                                            key={todo.id}
                                                            todo={todo}
                                                            onDragStart={() => {}}
                                                            onDragEnter={() => {}}
                                                            onDragEnd={() => {}}
                                                            isDraggingOver={false}
                                                            hideProjectBadge={false}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : selectedView === 'complete' ? (
                        // Complete view - show all pending tasks with project badges
                        <>
                            {pendingTodos.length > 0 && (
                                <div className="todo-list-section">
                                    <div className="todo-list-container">
                                        {pendingTodos.map(todo => (
                                            <TodoItem 
                                                key={todo.id} 
                                                todo={todo}
                                                onDragStart={handleDragStart}
                                                onDragEnter={handleDragEnter}
                                                onDragEnd={handleDragEnd}
                                                isDraggingOver={dragOverItem.current === todo.id}
                                                hideProjectBadge={false}
                                            />))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // Project and Inbox views - show both pending and completed with collapsible completed
                        <>
                            {pendingTodos.length > 0 && (
                                <div className="todo-list-section">
                                    <div className="todo-list-container">
                                        {pendingTodos.map(todo => (
                                            <TodoItem 
                                                key={todo.id} 
                                                todo={todo}
                                                onDragStart={handleDragStart}
                                                onDragEnter={handleDragEnter}
                                                onDragEnd={handleDragEnd}
                                                isDraggingOver={dragOverItem.current === todo.id}
                                                hideProjectBadge={selectedView === 'project'}
                                            />))}
                                    </div>
                                </div>
                            )}

                            {completedTodos.length > 0 && (
                                <div className="todo-list-section">
                                    <div 
                                        className="todo-list-header-collapsible"
                                        onClick={() => {
                                            if (selectedView === 'inbox') {
                                                setInboxCompletedCollapsed(!inboxCompletedCollapsed);
                                            } else if (selectedView === 'project' && selectedProject) {
                                                setProjectCompletedCollapsed(prev => ({
                                                    ...prev,
                                                    [selectedProject]: !prev[selectedProject]
                                                }));
                                            }
                                        }}
                                    >
                                        <span className={`collapse-icon ${
                                            selectedView === 'inbox' 
                                                ? (inboxCompletedCollapsed ? 'collapsed' : '') 
                                                : (projectCompletedCollapsed[selectedProject || ''] ? 'collapsed' : '')
                                        }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </span>
                                        <h3 className="todo-list-header">Completed ({completedTodos.length})</h3>
                                    </div>
                                    {!(selectedView === 'inbox' ? inboxCompletedCollapsed : projectCompletedCollapsed[selectedProject || '']) && (
                                        <div className="todo-list-container">
                                            {completedTodos.map(todo => (
                                                <TodoItem
                                                    key={todo.id}
                                                    todo={todo}
                                                    onDragStart={() => {}}
                                                    onDragEnter={() => {}}
                                                    onDragEnd={() => {}}
                                                    isDraggingOver={false}
                                                />))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Right Details Panel */}
            <div className="todo-details">
                <TaskDetails selectedTodo={selectedTodo} sessions={sessions}/>
            </div>
        </div>
    );
};

export default TodoPage;