// src/pages/HistoryPage.tsx
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import EditSessionModal from '../components/EditSessionModal';
import type { Session } from '../types';
import { formatToHoursAndMinutes } from '../utils/formatters';
import toast from 'react-hot-toast';

const HistoryPage: React.FC = () => {
    const { sessions, setSessions, todos, addTodo } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSession, setActiveSession] = useState<Session | null>(null);

    const handleAddClick = () => {
        setActiveSession(null); // Setting session to null signifies "Add" mode
        setIsModalOpen(true);
    };

    const handleEditClick = (session: Session) => {
        setActiveSession(session);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (sessionToDelete: Session) => {
        if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
            setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionToDelete.id));
        }
    };

    const handleSaveSession = (updatedData: Session, originalSession: Session | null) => {
        const taskName = updatedData.description.trim();
        let finalSessionData = { ...updatedData };

        if (taskName && !finalSessionData.todoId) {
            const existingTodo = todos.find(t => t.text.toLowerCase() === taskName.toLowerCase() && !t.completed);
            let todoIdToLink: string;

            if (existingTodo) {
                todoIdToLink = existingTodo.id;
            } else {
                todoIdToLink = addTodo({ text: taskName, projectId: updatedData.project, notes: '' });
                toast.success(`New task created: "${taskName}"`);
            }
            finalSessionData.todoId = todoIdToLink;
        }


        if (originalSession) {
            // EDIT MODE: Find the original session by reference and replace it.
            setSessions(prevSessions =>
                prevSessions.map(s => (s.id === originalSession.id ? finalSessionData : s))
            );
        } else {
            // ADD MODE: Add a unique ID and append the new session to the list.
            const newSessionWithId = { ...finalSessionData, id: `sess_${Date.now()}` };
            setSessions(prevSessions => [...prevSessions, newSessionWithId]);
        }
        setIsModalOpen(false); // Close modal on success
    };

    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }, [sessions]);

    const formatDateTime = (date: Date) => {
        return new Date(date).toLocaleString([], {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return (
        <div className="page">
            <div className="home-page-header">
                <h2>Session History</h2>
                <button className="btn-primary" onClick={handleAddClick}>
                    Add Entry
                </button>
            </div>
            
            <div className="content-card">

                {sortedSessions.length > 0 ? (
                    <table id="entries-table">
                        <thead>
                            <tr>
                                <th>Task Name</th>
                                <th>Project</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Duration</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSessions.map(session => {
                                const startTime = new Date(session.startTime);
                                const endTime = new Date(startTime.getTime() + session.durationMs);

                                return (
                                    <tr key={session.id}>
                                        <td>{session.description}</td>
                                        <td>{session.project || 'N/A'}</td>
                                        <td>{formatDateTime(startTime)}</td>
                                        <td>{formatTime(endTime)}</td>
                                        <td>{formatToHoursAndMinutes(session.durationMs)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn btn-edit" onClick={() => handleEditClick(session)}>Edit</button>
                                                <button className="action-btn btn-delete" onClick={() => handleDeleteClick(session)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted-color)', padding: '2rem 0' }}>
                        No sessions recorded yet. Add a manual entry or start a session on the Timer page.
                    </p>
                )}
            </div>

            <EditSessionModal
                isOpen={isModalOpen}
                session={activeSession}
                onSave={handleSaveSession}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default HistoryPage;