// src/components/PendingTasksList.tsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import TodoItem from './TodoItem';
import type { Todo } from '../types';

interface PendingTasksListProps {
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onDragEnter: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onDragEnd: () => void;
    dragOverItem: React.MutableRefObject<string | null>;
    dragItem: React.MutableRefObject<string | null>;
}

const PendingTasksList: React.FC<PendingTasksListProps> = ({
    onDragStart,
    onDragEnter,
    onDragEnd,
    dragOverItem,
    dragItem
}) => {
    const { todos, setTodos } = useAppContext();
    const [dragOverPending, setDragOverPending] = useState(false);

    // Get all pending tasks (not completed, not deleted, no focus order)
    const pendingTasks = todos.filter(todo => 
        !todo.completed && 
        !todo.deleted && 
        !todo.focusOrder
    );

    // Group tasks by project
    const tasksByProject = pendingTasks.reduce((acc, todo) => {
        const projectKey = todo.projectId || 'No Project';
        if (!acc[projectKey]) {
            acc[projectKey] = [];
        }
        acc[projectKey].push(todo);
        return acc;
    }, {} as { [key: string]: Todo[] });

    const projectEntries = Object.entries(tasksByProject).sort(([a], [b]) => {
        // Sort with "No Project" last
        if (a === 'No Project') return 1;
        if (b === 'No Project') return -1;
        return a.localeCompare(b);
    });

    return (
        <div 
            className={`pending-tasks-list ${dragOverPending ? 'drag-over' : ''}`}
            onDragOver={(e) => {
                e.preventDefault();
                setDragOverPending(true);
            }}
            onDragLeave={() => setDragOverPending(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragOverPending(false);
                const todoId = dragItem.current;
                if (todoId) {
                    const todo = todos.find(t => t.id === todoId);
                    if (todo && todo.focusOrder) {
                        // Remove from Top 3 Focus
                        setTodos(prev => prev.map(t => 
                            t.id === todoId ? { ...t, focusOrder: undefined } : t
                        ));
                    }
                }
            }}
        >
            <div className="pending-tasks-content">
                {pendingTasks.length === 0 ? (
                    <div className="empty-pending-tasks">
                        <div className="empty-pending-icon">✨</div>
                        <h3>All caught up!</h3>
                        <p>No pending tasks. Add a new task or check your completed items.</p>
                    </div>
                ) : (
                    <div className="pending-tasks-groups">
                        {/* Overall header as first project group */}
                        <div className="pending-project-group pending-overview">
                            <div className="pending-project-header">
                                <h4 className="pending-project-title">
                                    📋 Pending Tasks
                                </h4>
                                <span className="pending-project-count">
                                    {pendingTasks.length}
                                </span>
                            </div>
                        </div>
                        
                        {/* Individual project groups */}
                        {projectEntries.map(([projectName, projectTasks]) => (
                            <div key={projectName} className="pending-project-group">
                                <div className="pending-project-header">
                                    <h4 className="pending-project-title">
                                        {projectName === 'No Project' ? '📥 Inbox' : `📁 ${projectName}`}
                                    </h4>
                                    <span className="pending-project-count">
                                        {projectTasks.length}
                                    </span>
                                </div>
                                
                                <div className="pending-project-tasks">
                                    {projectTasks.map(todo => (
                                        <div key={todo.id} className="pending-task-item">
                                            <TodoItem 
                                                todo={todo}
                                                onDragStart={onDragStart}
                                                onDragEnter={onDragEnter}
                                                onDragEnd={onDragEnd}
                                                isDraggingOver={dragOverItem.current === todo.id}
                                                simplified={true}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
            </div>
        </div>
    );
};

export default PendingTasksList;