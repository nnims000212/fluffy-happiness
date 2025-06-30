import React, { useState, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import TaskInput from '../components/TaskInput';
import TaskDetails from '../components/TaskDetails';
import { formatToHoursAndMinutes } from '../utils/formatters';
import type { Todo, Project } from '../types';

interface TodoItemProps {
    todo: Todo;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onDragEnter: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onDragEnd: () => void;
    isDraggingOver: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onDragStart, onDragEnter, onDragEnd, isDraggingOver }) => {
    const { sessions, updateTodo, deleteTodo, setActivePage, setActiveTodoId, selectedTodoId, setSelectedTodoId, restoreTodo, permanentlyDeleteTodo } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);

    const isSelected = selectedTodoId === todo.id;

    const handleSaveText = () => {
        if (editText.trim()) {
            updateTodo(todo.id, { text: editText.trim(), notes: todo.notes });
            setIsEditing(false);
        }
    };

    const handleTrackTime = () => {
        if (todo.completed) {
            toast.error("Cannot track time on a completed task.");
            return;
        }
        setActiveTodoId(todo.id);
        setActivePage('timer');
    };

    const handleSelectTodo = () => {
        if (!isEditing) {
            setSelectedTodoId(todo.id); // Bug Fix: Only set selected ID, not active ID for timer
        }
    };

    const totalTrackedMs = useMemo(() => {
        return sessions
            .filter(s => s.todoId === todo.id)
            .reduce((sum, s) => sum + s.durationMs, 0);
    }, [sessions, todo.id]);

    return (
        <div 
            className={`todo-item ${todo.completed ? 'completed' : ''} ${isSelected ? 'selected' : ''} ${isDraggingOver ? 'drop-indicator' : ''}`} 
            onClick={handleSelectTodo}
            draggable={!todo.completed}
            onDragStart={(e) => onDragStart(e, todo.id)}
            onDragEnter={(e) => onDragEnter(e, todo.id)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
        >
            <div className="todo-item-main">
                <label className="custom-checkbox-container" title={todo.completed ? "Mark as pending" : "Mark as complete"}>
                    <input 
                        type="checkbox" 
                        checked={todo.completed} 
                        onChange={(e) => {
                            e.stopPropagation();
                            updateTodo(todo.id, { completed: e.target.checked, text: todo.text, notes: todo.notes });
                        }}
                    />
                    <span className="custom-checkbox-checkmark"></span>
                </label>
                {isEditing ? (
                    <input 
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={handleSaveText}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveText()}
                        autoFocus
                        className="todo-edit-input"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span 
                        className="todo-text" 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!todo.completed) {
                                setIsEditing(true);
                            }
                        }}
                    >
                        {todo.text}
                    </span>
                )}
            </div>
            <div className="todo-item-details">
                {todo.projectId && <span className="todo-project-tag">{todo.projectId}</span>}
                {todo.notes && (
                    <span className="notes-indicator" title="Has notes">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </span>
                )}
                {totalTrackedMs > 0 && <span className="todo-tracked-time">{formatToHoursAndMinutes(totalTrackedMs)}</span>}
                <div className="todo-actions">
                    {todo.deleted ? (
                        // Trash actions: Restore and Permanent Delete
                        <>
                            <button className="icon-action-btn restore-btn" onClick={(e) => { e.stopPropagation(); restoreTodo(todo.id); }} title="Restore">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
                            </button>
                            <button className="icon-action-btn permanent-delete-btn" onClick={(e) => { e.stopPropagation(); if(window.confirm('Permanently delete this task? This cannot be undone.')) permanentlyDeleteTodo(todo.id); }} title="Permanently Delete">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </>
                    ) : (
                        // Normal actions: Track Time and Delete
                        <>
                            <button className="icon-action-btn" onClick={(e) => { e.stopPropagation(); handleTrackTime(); }} title="Track Time" disabled={todo.completed}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            </button>
                            <button className="icon-action-btn" onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }} title="Delete">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const TodoPage: React.FC = () => {
    const { todos, setTodos, selectedTodoId, sessions, projects, deleteProject, renameProject, archiveProject, unarchiveProject, updateProject } = useAppContext();
    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);
    
    // Project filtering state - start with inbox view
    const [selectedProject, setSelectedProject] = useState<string | null>('');
    const [selectedView, setSelectedView] = useState<'inbox' | 'project' | 'completed' | 'trash'>('inbox');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [editingProject, setEditingProject] = useState<string | null>(null);
    const [editProjectName, setEditProjectName] = useState('');
    const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
    const [projectsCollapsed, setProjectsCollapsed] = useState(false);
    const [archivedProjectsCollapsed, setArchivedProjectsCollapsed] = useState(false);
    const [projectNotesValue, setProjectNotesValue] = useState('');

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
                    </div>

                    <div className="sidebar-divider"></div>

                    {/* Projects Section */}
                    <div className={`sidebar-section ${projectsCollapsed ? 'collapsed' : ''}`}>
                        <div 
                            className="sidebar-section-header"
                            onClick={() => setProjectsCollapsed(!projectsCollapsed)}
                        >
                            <span className={`collapse-icon ${projectsCollapsed ? 'collapsed' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                            <h3>Projects</h3>
                        </div>
                        {!projectsCollapsed && activeProjects.map(project => {
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
                    </div>

                    {/* Archived Projects Section - Only show if there are archived projects */}
                    {archivedProjects.length > 0 && (
                        <>
                            <div className="sidebar-divider"></div>
                            <div className={`sidebar-section ${archivedProjectsCollapsed ? 'collapsed' : ''}`}>
                                <div 
                                    className="sidebar-section-header"
                                    onClick={() => setArchivedProjectsCollapsed(!archivedProjectsCollapsed)}
                                >
                                    <span className={`collapse-icon ${archivedProjectsCollapsed ? 'collapsed' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </span>
                                    <h3>Archived Projects</h3>
                                </div>
                                {!archivedProjectsCollapsed && archivedProjects.map(project => {
                                    const count = getProjectCount(project.name);
                                    return (
                                        <div 
                                            key={project.id}
                                            className="sidebar-item archived-project"
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
                    <TaskInput currentProjectId={selectedView === 'project' ? selectedProject || '' : ''} />
                )}
                
                <div className="content-card todo-list-card">
                    {displayTodos.length === 0 && (
                        <p className="placeholder-text" style={{padding: '3rem 1rem'}}>
                            {selectedView === 'trash'
                                ? 'No deleted tasks in trash.'
                                : selectedView === 'completed' 
                                    ? 'No completed tasks yet.'
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
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        // Project and Inbox views - show both pending and completed
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
                                            />))}
                                    </div>
                                </div>
                            )}

                            {completedTodos.length > 0 && (
                                <div className="todo-list-section">
                                    <h3 className="todo-list-header">Completed ({completedTodos.length})</h3>
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