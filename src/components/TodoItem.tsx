// src/components/TodoItem.tsx
import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { formatToHoursAndMinutes } from '../utils/formatters';
import type { Todo } from '../types';

interface TodoItemProps {
    todo: Todo;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onDragEnter: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onDragEnd: () => void;
    isDraggingOver: boolean;
    simplified?: boolean; // For use in pending tasks list
    allowCompletedDrag?: boolean; // Allow completed tasks to be draggable (for focus mode)
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onDragStart, onDragEnter, onDragEnd, isDraggingOver, simplified = false, allowCompletedDrag = false }) => {
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
            draggable={!todo.completed || allowCompletedDrag}
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
                {!simplified && (
                    <>
                        {todo.projectId && <span className="todo-project-tag">{todo.projectId}</span>}
                        {todo.notes && (
                            <span className="notes-indicator" title="Has notes">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </span>
                        )}
                        {totalTrackedMs > 0 && <span className="todo-tracked-time">{formatToHoursAndMinutes(totalTrackedMs)}</span>}
                    </>
                )}
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
                    ) : simplified ? (
                        // Simplified view: Only show notes indicator if present
                        todo.notes ? (
                            <span className="notes-indicator-simple" title="Has notes">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </span>
                        ) : null
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

export default TodoItem;