// src/components/EditSessionModal.tsx
import React, { useState, useEffect } from 'react';
import type { Session } from '../../../types/index';
import { formatDateToInput, formatTimeToInput } from '../../../utils/formatters';
import ProjectSelector from '../../features/projects/ProjectSelector';

interface EditSessionModalProps {
    isOpen: boolean;
    session: Session | null; // The session to edit, or null if adding a new one
    onSave: (updatedSession: Session, originalSession: Session | null) => void;
    onClose: () => void;
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({ isOpen, session, onSave, onClose }) => {
    const isEditing = !!session;
    const [form, setForm] = useState({ description: '', project: '', date: '', time: '', duration: '', notes: '' });

    useEffect(() => {
        if (isOpen) {
            if (isEditing && session) {
                const startTime = new Date(session.startTime);
                setForm({
                    description: session.description || '',
                    project: session.project || '',
                    date: formatDateToInput(startTime),
                    time: formatTimeToInput(startTime),
                    duration: String(Math.round(session.durationMs / 60000)),
                    notes: session.notes || ''
                });
            } else {
                // Reset for "Add" mode with current time as default
                const now = new Date();
                setForm({
                    description: '',
                    project: '',
                    date: formatDateToInput(now),
                    time: formatTimeToInput(now),
                    duration: '30',
                    notes: ''
                });
            }
        }
    }, [isOpen, session, isEditing]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleProjectChange = (projectName: string) => {
        setForm(prev => ({ ...prev, project: projectName }));
    };

    const handleSave = () => {
        const newStartTime = new Date(`${form.date}T${form.time}`);
        const newDurationMinutes = parseInt(form.duration, 10);

        if (isNaN(newStartTime.getTime()) || isNaN(newDurationMinutes) || newDurationMinutes <= 0) {
            alert("Invalid date, time, or duration. Please check the values and try again.");
            return;
        }

        // Construct the new session data.
        // We spread the original session to preserve any properties not in the form (like a potential ID).
        const updatedSessionData = {
            ...(session || {}),
            description: form.description.trim() || "Unspecified Focus Session",
            project: form.project,
            startTime: newStartTime,
            durationMs: newDurationMinutes * 60000,
            notes: form.notes.trim()
        };

        // Call onSave with both the new data and the original session object.
        // The parent component can use the originalSession to find and replace the entry.
        onSave(updatedSessionData as Session, session);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onKeyDown={handleKeyDown}>
            <div className="modal-content">
                <h2>{isEditing ? 'Edit Session' : 'Add Entry'}</h2>
                <div className="modal-form">
                     <div className="form-group">
                        <label htmlFor="edit-description">Task Name</label>
                        <input type="text" id="edit-description" name="description" value={form.description} onChange={handleChange} placeholder="What task did you work on?" />
                    </div>
                    <div className="form-group">
                        <label>Project (Optional)</label>
                        <ProjectSelector selectedProject={form.project} onProjectChange={handleProjectChange} />
                    </div>
                    <div className="form-group-row">
                        <div className="form-group">
                            <label htmlFor="edit-date">Date</label>
                            <input type="date" id="edit-date" name="date" value={form.date} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-time">Start Time</label>
                            <input type="time" id="edit-time" name="time" value={form.time} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-duration">Duration (minutes)</label>
                        <input type="number" id="edit-duration" name="duration" min="1" value={form.duration} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-notes">Session Notes (Optional)</label>
                        <input type="text" id="edit-notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Add notes about this session..." />
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>{isEditing ? 'Save Changes' : 'Add Entry'}</button>
                </div>
            </div>
        </div>
    );
};

export default EditSessionModal;