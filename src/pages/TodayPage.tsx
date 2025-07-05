// src/pages/TodayPage.tsx
import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import TaskInput from '../components/TaskInput';
import TaskDetails from '../components/TaskDetails';
import PendingTasksList from '../components/PendingTasksList';
import TodoItem from '../components/TodoItem';

const TodayPage: React.FC = () => {
    const { todos, setTodos, selectedTodoId, setSelectedTodoId, sessions } = useAppContext();
    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);
    
    // Drag feedback state
    const [dragOverFocusSlot, setDragOverFocusSlot] = useState<number | null>(null);

    const selectedTodo = todos.find(todo => todo.id === selectedTodoId) || null;

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
        setDragOverFocusSlot(null);
    };


    return (
        <div className="page today-page-layout">
            <div className="today-page-header">
                <h2>⭐ Top 3</h2>
            </div>

            <div className="today-page-content">
                {/* Left Section - Top 3 Focus */}
                <div className="today-left-section">
                    <div 
                        className="content-card today-focus-card"
                        onClick={(e) => {
                            // Deselect task when clicking on empty space
                            if (e.target === e.currentTarget) {
                                setSelectedTodoId(null);
                            }
                        }}
                    >
                        {/* Top 3 Focus Slots */}
                        <div 
                            className="top-focus-section"
                            onClick={(e) => {
                                // Deselect task when clicking on empty space in Today view
                                if (e.target === e.currentTarget) {
                                    setSelectedTodoId(null);
                                }
                            }}
                        >
                            <p className="focus-subtitle">Drag your most important tasks here to prioritize them for today</p>
                            <div className="top-focus-slots">
                                {[1, 2, 3].map(position => {
                                    const focusTask = todos.find(todo => todo.focusOrder === position && !todo.deleted);
                                    return (
                                        <div 
                                            key={position} 
                                            className={`focus-slot ${focusTask ? 'has-task' : 'empty'} ${focusTask?.completed ? 'completed' : ''} ${dragOverFocusSlot === position ? 'drag-over' : ''}`}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setDragOverFocusSlot(position);
                                            }}
                                            onDragLeave={() => setDragOverFocusSlot(null)}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setDragOverFocusSlot(null);
                                                const todoId = dragItem.current;
                                                if (todoId) {
                                                    const draggedTodo = todos.find(t => t.id === todoId);
                                                    const targetSlotTodo = focusTask; // The task currently in this position
                                                    
                                                    if (draggedTodo) {
                                                        setTodos(prev => prev.map(t => {
                                                            // If dragging a focus task over another focus task, swap positions
                                                            if (draggedTodo.focusOrder && targetSlotTodo) {
                                                                if (t.id === todoId) {
                                                                    return { ...t, focusOrder: position };
                                                                } else if (t.id === targetSlotTodo.id) {
                                                                    return { ...t, focusOrder: draggedTodo.focusOrder };
                                                                }
                                                            }
                                                            // If dragging a focus task to an empty slot, just move it
                                                            else if (draggedTodo.focusOrder && !targetSlotTodo) {
                                                                if (t.id === todoId) {
                                                                    return { ...t, focusOrder: position };
                                                                }
                                                            }
                                                            // If dragging a pending task over a focus task, replace
                                                            else if (!draggedTodo.focusOrder) {
                                                                if (t.id === todoId) {
                                                                    return { ...t, focusOrder: position };
                                                                } else if (t.focusOrder === position) {
                                                                    return { ...t, focusOrder: undefined };
                                                                }
                                                            }
                                                            return t;
                                                        }));
                                                        // Don't auto-select task when dragging - only on click
                                                    }
                                                }
                                            }}
                                        >
                                            {focusTask ? (
                                                <TodoItem 
                                                    key={focusTask.id} 
                                                    todo={focusTask}
                                                    onDragStart={handleDragStart}
                                                    onDragEnter={handleDragEnter}
                                                    onDragEnd={handleDragEnd}
                                                    isDraggingOver={false}
                                                    allowCompletedDrag={true}
                                                    hideProjectBadge={false}
                                                />
                                            ) : (
                                                <div className="empty-focus-slot">
                                                    <span className="focus-number">{position}</span>
                                                    <span className="focus-placeholder">Drag a task here</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Pending Tasks or Task Details */}
                <div className="today-right-section">
                    <TaskInput currentProjectId="" />
                    {selectedTodo ? (
                        <TaskDetails selectedTodo={selectedTodo} sessions={sessions}/>
                    ) : (
                        <PendingTasksList 
                            onDragStart={handleDragStart}
                            onDragEnter={handleDragEnter}
                            onDragEnd={handleDragEnd}
                            dragOverItem={dragOverItem}
                            dragItem={dragItem}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodayPage;