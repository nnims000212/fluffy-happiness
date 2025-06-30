import React, { useState, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import ProjectSelector from '../components/ProjectSelector';
import TaskInput from '../components/TaskInput';
import TaskDetails from '../components/TaskDetails';
import { formatToHoursAndMinutes } from '../utils/formatters';
import type { Todo } from '../types';

interface TodoItemProps {
    todo: Todo;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onDragEnter: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    onDragEnd: () => void;
    isDraggingOver: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onDragStart, onDragEnter, onDragEnd, isDraggingOver }) => {
    const { sessions, updateTodo, deleteTodo, setActivePage, setActiveTodoId, selectedTodoId, setSelectedTodoId } = useAppContext();
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
                            !todo.completed && setIsEditing(true);
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
                    <button className="icon-action-btn" onClick={(e) => { e.stopPropagation(); handleTrackTime(); }} title="Track Time" disabled={todo.completed}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </button>
                    <button className="icon-action-btn" onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }} title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const TodoPage: React.FC = () => {
    const { todos, setTodos, selectedTodoId, sessions } = useAppContext();
    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);

    const pendingTodos = todos.filter(t => !t.completed);
    const completedTodos = todos.filter(t => t.completed);
    const selectedTodo = todos.find(todo => todo.id === selectedTodoId) || null;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        dragItem.current = id;
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, id: string) => {
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
        <div className="page todo-page-layout">
            <div className="todo-list-column">
                <div className="home-page-header">
                    <h2>To-Do List</h2>
                </div>
                <TaskInput />
                <div className="content-card todo-list-card">
                    {pendingTodos.length === 0 && completedTodos.length === 0 && (
                        <p className="placeholder-text" style={{padding: '3rem 1rem'}}>Your to-do list is empty. Add a task above!</p>
                    )}

                    {pendingTodos.length > 0 && (
                        <div className="todo-list-section">
                            <h3 className="todo-list-header">Pending ({pendingTodos.length})</h3>
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
                </div>
            </div>
            <div className="task-details-column">
                <TaskDetails selectedTodo={selectedTodo} sessions={sessions}/>
            </div>
        </div>
    );
};

export default TodoPage;