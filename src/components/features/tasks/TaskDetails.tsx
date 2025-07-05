// src/components/TaskDetails.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../../context/useAppContext';
import TaskFocusDetail from './TaskFocusDetail';
import type { Todo, Session } from '../../../types/index';


interface TaskDetailsProps {
    selectedTodo: Todo | null;
    sessions: Session[];
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ selectedTodo, sessions }) => {
    const { setSelectedTodoId, updateTodo } = useAppContext();
    const [taskName, setTaskName] = useState(selectedTodo?.text || '');

    // Update local state when selectedTodo changes
    useEffect(() => {
        setTaskName(selectedTodo?.text || '');
    }, [selectedTodo?.text]);

    const handleSaveTaskName = () => {
        if (selectedTodo && taskName.trim() && taskName.trim() !== selectedTodo.text) {
            updateTodo(selectedTodo.id, { text: taskName.trim() });
            toast.success('Task name updated successfully!');
        }
    };

    if (!selectedTodo) {
        return (
            <div className="task-details-placeholder">
                <p>Select a task to view details</p>
            </div>
        );
    }

    return (
        <div className="task-details-card content-card">
            <div className="task-details-header">
                <div className="task-name-container">
                    <input
                        type="text"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        onBlur={handleSaveTaskName}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.currentTarget.blur();
                            }
                        }}
                        className="task-name-input"
                        placeholder="Task name..."
                    />
                </div>
                <button className="icon-action-btn" onClick={() => setSelectedTodoId(null)} title="Close details">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <TaskFocusDetail todo={selectedTodo} sessions={sessions} />
        </div>
    );
};

export default TaskDetails;