// src/components/TaskFocusDetail.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../../context/useAppContext';
import ProjectSelector from '../projects/ProjectSelector';
import { format } from 'date-fns';
import { formatToHoursAndMinutes } from '../../../utils/formatters';
import type { Todo, Session } from '../../../types/index';
import toast from 'react-hot-toast';

// This component is shared between TaskDetails and TimerPage
const EditableSessionItem: React.FC<{ session: Session }> = ({ session }) => {
    const { updateSession } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState(session.notes || '');

    const handleSave = () => {
        if (notes !== (session.notes || '')) {
            updateSession(session.id, { notes });
        }
        setIsEditing(false);
    };

    return (
        <li className="session-item-detailed">
            <div className="session-item-header">
                <span>{format(new Date(session.startTime), 'MMM dd, yyyy HH:mm')}</span>
                <span className="session-duration">{formatToHoursAndMinutes(session.durationMs)}</span>
            </div>
            {isEditing ? (
                <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                    autoFocus
                    className="session-note-edit-input"
                />
            ) : (
                <p className="session-item-notes" onClick={() => setIsEditing(true)}>
                    {notes || <span className="placeholder-text-inline">Click to add notes...</span>}
                </p>
            )}
        </li>
    );
};

interface TaskFocusDetailProps {
    todo: Todo;
    sessions: Session[];
}

const TaskFocusDetail: React.FC<TaskFocusDetailProps> = ({ todo, sessions }) => {
    const { updateTodo } = useAppContext();
    const [notesText, setNotesText] = useState(todo.notes || '');
    const [selectedProject, setSelectedProject] = useState(todo.projectId || '');
    const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
    const [relatedSessions, setRelatedSessions] = useState<Session[]>([]);

    useEffect(() => {
        setNotesText(todo.notes || '');
        setSelectedProject(todo.projectId || '');
        setRelatedSessions(sessions.filter(s => s.todoId === todo.id).sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
    }, [todo, sessions]);

    const handleSaveNotes = () => {
        if (todo.notes !== notesText) {
            updateTodo(todo.id, { notes: notesText });
            toast.success("Notes saved.");
        }
    };

    const handleProjectChange = (projectId: string) => {
        if (todo.projectId !== projectId) {
            updateTodo(todo.id, { projectId: projectId });
            setSelectedProject(projectId);
            toast.success("Project updated.");
        }
    };

    return (
        <>
            <div className="form-group">
                <label>Project</label>
                <ProjectSelector selectedProject={selectedProject} onProjectChange={handleProjectChange} />
            </div>
            <div className="form-group">
                <label htmlFor={`task-notes-${todo.id}`}>Notes</label>
                <textarea
                    id={`task-notes-${todo.id}`}
                    ref={notesTextareaRef}
                    className="todo-notes-textarea"
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    onBlur={handleSaveNotes}
                    placeholder="Add notes for this task..."
                />
            </div>
            <div className="previous-sessions-section">
                <h4>Previous Sessions</h4>
                {relatedSessions.length === 0 ? (
                    <p className="placeholder-text">No sessions tracked for this task.</p>
                ) : (
                    <ul className="session-list">
                        {relatedSessions.map(session => (
                            <EditableSessionItem key={session.id} session={session} />
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
};

export default TaskFocusDetail;