// src/components/StartSessionModal.tsx
import React, { useState } from 'react';
import ProjectSelector from './ProjectSelector';

interface StartSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStart: (durationMs: number, taskName: string, project: string) => void;
}

const StartSessionModal: React.FC<StartSessionModalProps> = ({ isOpen, onClose, onStart }) => {
    const [duration, setDuration] = useState("45");
    const [taskName, setTaskName] = useState("");
    const [project, setProject] = useState("");

    if (!isOpen) return null;

    const handleStart = () => {
        onStart(parseInt(duration, 10) * 60 * 1000, taskName, project);
        onClose();
        setTaskName("");
        setProject("");
    };

    // Close on Escape key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onKeyDown={handleKeyDown}>
            <div className="modal-content">
                <h2>Start Focus Session</h2>
                <div className="modal-form">
                    <div className="form-group">
                        <label htmlFor="session-duration-select">Duration</label>
                        <select id="session-duration-select" value={duration} onChange={e => setDuration(e.target.value)}>
                            <option value="15">15 min</option>
                            <option value="25">25 min (Pomodoro)</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                            <option value="90">90 min</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="session-goal-input">Task Name (Optional)</label>
                        <input type="text" id="session-goal-input" placeholder="What task are you working on?" value={taskName} onChange={e => setTaskName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Project (Optional)</label>
                        <ProjectSelector selectedProject={project} onProjectChange={setProject} />
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleStart}>Start Focus</button>
                </div>
            </div>
        </div>
    );
};

export default StartSessionModal;