// src/components/TaskDetails.tsx
import React from 'react'; // Removed unused useEffect and useRef
import { useAppContext } from '../context/AppContext';
import TaskFocusDetail from './TaskFocusDetail';
import type { Todo, Session } from '../types';


interface TaskDetailsProps {
    selectedTodo: Todo | null;
    sessions: Session[];
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ selectedTodo, sessions }) => {
    const { setSelectedTodoId } = useAppContext();

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
                <h3>{selectedTodo.text}</h3>
                <button className="icon-action-btn" onClick={() => setSelectedTodoId(null)} title="Close details">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <TaskFocusDetail todo={selectedTodo} sessions={sessions} />
        </div>
    );
};

export default TaskDetails;