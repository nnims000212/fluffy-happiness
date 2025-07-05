// src/components/DailyResetModal.tsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { FocusHistory } from '../types';

interface DailyResetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DailyResetModal: React.FC<DailyResetModalProps> = ({ isOpen, onClose }) => {
    const { 
        getTodaysFocusTasks, 
        resetDailyFocus, 
        markAppLaunch,
        updateFocusSettings 
    } = useAppContext();
    
    const [selectedAction, setSelectedAction] = useState<FocusHistory['resetType']>('preserve-incomplete');

    if (!isOpen) return null;

    const focusTasks = getTodaysFocusTasks();
    const completedTasks = focusTasks.filter(task => task.completed);
    const incompleteTasks = focusTasks.filter(task => !task.completed);

    const handleReset = () => {
        resetDailyFocus(selectedAction);
        markAppLaunch();
        onClose();
    };

    const handleDisableAutoReset = () => {
        updateFocusSettings({ autoResetEnabled: false });
        markAppLaunch();
        onClose();
    };

    // Close on Escape key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onKeyDown={handleKeyDown}>
            <div className="modal-content daily-reset-modal">
                <h2>🌅 Good Morning! Daily Focus Reset</h2>
                
                <div className="reset-summary">
                    <p>You have <strong>{focusTasks.length}</strong> focus tasks from yesterday:</p>
                    {completedTasks.length > 0 && (
                        <div className="task-summary completed">
                            <span className="summary-icon">✅</span>
                            <span>{completedTasks.length} completed</span>
                        </div>
                    )}
                    {incompleteTasks.length > 0 && (
                        <div className="task-summary incomplete">
                            <span className="summary-icon">⏳</span>
                            <span>{incompleteTasks.length} incomplete</span>
                        </div>
                    )}
                </div>

                <div className="reset-options">
                    <h3>How would you like to handle your focus tasks?</h3>
                    
                    <label className="reset-option">
                        <input
                            type="radio"
                            name="resetAction"
                            value="preserve-incomplete"
                            checked={selectedAction === 'preserve-incomplete'}
                            onChange={(e) => setSelectedAction(e.target.value as FocusHistory['resetType'])}
                        />
                        <div className="option-content">
                            <strong>Keep Incomplete Tasks</strong>
                            <p>Archive completed tasks, keep incomplete ones in your Top 3</p>
                        </div>
                    </label>

                    <label className="reset-option">
                        <input
                            type="radio"
                            name="resetAction"
                            value="clear"
                            checked={selectedAction === 'clear'}
                            onChange={(e) => setSelectedAction(e.target.value as FocusHistory['resetType'])}
                        />
                        <div className="option-content">
                            <strong>Fresh Start</strong>
                            <p>Archive all tasks and start with an empty Top 3</p>
                        </div>
                    </label>

                    <label className="reset-option">
                        <input
                            type="radio"
                            name="resetAction"
                            value="continued"
                            checked={selectedAction === 'continued'}
                            onChange={(e) => setSelectedAction(e.target.value as FocusHistory['resetType'])}
                        />
                        <div className="option-content">
                            <strong>Continue Previous Day</strong>
                            <p>Keep all tasks exactly as they were</p>
                        </div>
                    </label>
                </div>

                <div className="modal-actions">
                    <div className="left-actions">
                        <button 
                            className="btn-text" 
                            onClick={handleDisableAutoReset}
                            title="Turn off daily reset prompts"
                        >
                            Disable Auto Reset
                        </button>
                    </div>
                    <div className="right-actions">
                        <button className="btn-secondary" onClick={onClose}>
                            Skip for Now
                        </button>
                        <button className="btn-primary" onClick={handleReset}>
                            Apply Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyResetModal;