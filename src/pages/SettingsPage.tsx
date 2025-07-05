// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { useAppContext } from '../context/useAppContext';
import DataHealthCheck from '../components/layout/DataHealthCheck';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
    const { 
        dailyWorkGoalHours, 
        setDailyWorkGoalHours, 
        focusSettings, 
        updateFocusSettings,
        focusHistory,
        clearFocusTasks,
        clearFocusHistory,
        todos
    } = useAppContext();
    
    const [tempWorkGoal, setTempWorkGoal] = useState(dailyWorkGoalHours.toString());
    const [tempResetTime, setTempResetTime] = useState(focusSettings.resetTime);

    const handleWorkGoalChange = () => {
        const newGoal = parseFloat(tempWorkGoal);
        if (isNaN(newGoal) || newGoal < 0.5 || newGoal > 24) {
            toast.error('Daily work goal must be between 0.5 and 24 hours');
            setTempWorkGoal(dailyWorkGoalHours.toString());
            return;
        }
        setDailyWorkGoalHours(newGoal);
        toast.success('Daily work goal updated!');
    };

    const handleResetTimeChange = () => {
        updateFocusSettings({ resetTime: tempResetTime });
        toast.success('Reset time updated!');
    };

    const handleClearFocusHistory = () => {
        if (window.confirm('Are you sure you want to clear all focus history? This cannot be undone.')) {
            clearFocusHistory();
            toast.success('Focus history cleared!');
        }
    };

    const handleClearCurrentFocus = () => {
        if (window.confirm('Are you sure you want to clear your current Top 3 focus tasks?')) {
            clearFocusTasks();
            toast.success('Current focus tasks cleared!');
        }
    };

    const handleTriggerResetCheck = () => {
        const hasFocusTasks = todos.some(todo => todo.focusOrder !== undefined);
        
        if (!hasFocusTasks) {
            toast('No focus tasks to reset', { icon: 'ℹ️' });
            return;
        }
        
        if (!focusSettings.autoResetEnabled) {
            toast.error('Auto-reset is disabled. Enable it first to use reset functionality.');
            return;
        }
        
        // Reset the last launch date to trigger reset check on page reload
        localStorage.setItem('focusTimerLastLaunch', JSON.stringify(new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()));
        toast.success('Reset check will trigger on next app reload. Reloading now...');
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Customize your focus timer experience</p>
            </div>

            <div className="settings-content">
                {/* Work Goal Settings */}
                <div className="settings-section">
                    <div className="section-header">
                        <h2>Daily Work Goal</h2>
                        <p>Set your target hours for each day</p>
                    </div>
                    <div className="setting-item">
                        <label htmlFor="work-goal-input">Daily Work Goal (hours)</label>
                        <div className="input-with-action">
                            <input 
                                id="work-goal-input"
                                type="number" 
                                min="0.5" 
                                max="24" 
                                step="0.5"
                                value={tempWorkGoal}
                                onChange={(e) => setTempWorkGoal(e.target.value)}
                                onBlur={handleWorkGoalChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleWorkGoalChange()}
                            />
                            <span className="input-hint">{tempWorkGoal} hours per day</span>
                        </div>
                    </div>
                </div>

                {/* Focus Reset Settings */}
                <div className="settings-section">
                    <div className="section-header">
                        <h2>Daily Focus Reset</h2>
                        <p>Configure how your Top 3 focus tasks reset each day</p>
                    </div>
                    
                    <div className="setting-item">
                        <label className="checkbox-setting">
                            <input 
                                type="checkbox" 
                                checked={focusSettings.autoResetEnabled}
                                onChange={(e) => updateFocusSettings({ autoResetEnabled: e.target.checked })}
                            />
                            <span className="checkbox-label">
                                <strong>Enable Daily Reset</strong>
                                <span className="checkbox-description">Automatically prompt for focus reset each day</span>
                            </span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <label htmlFor="reset-time-input">Reset Time</label>
                        <div className="input-with-action">
                            <input 
                                id="reset-time-input"
                                type="time" 
                                value={tempResetTime}
                                onChange={(e) => setTempResetTime(e.target.value)}
                                onBlur={handleResetTimeChange}
                                disabled={!focusSettings.autoResetEnabled}
                            />
                            <span className="input-hint">When to trigger daily reset</span>
                        </div>
                    </div>

                    <div className="setting-item">
                        <label className="checkbox-setting">
                            <input 
                                type="checkbox" 
                                checked={focusSettings.preserveIncomplete}
                                onChange={(e) => updateFocusSettings({ preserveIncomplete: e.target.checked })}
                            />
                            <span className="checkbox-label">
                                <strong>Preserve Incomplete Tasks</strong>
                                <span className="checkbox-description">Keep incomplete focus tasks when resetting (recommended)</span>
                            </span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <label className="checkbox-setting">
                            <input 
                                type="checkbox" 
                                checked={focusSettings.showCompletionCelebration}
                                onChange={(e) => updateFocusSettings({ showCompletionCelebration: e.target.checked })}
                            />
                            <span className="checkbox-label">
                                <strong>Completion Celebrations</strong>
                                <span className="checkbox-description">Show celebration when completing focus tasks</span>
                            </span>
                        </label>
                    </div>
                </div>

                {/* Focus Management */}
                <div className="settings-section">
                    <div className="section-header">
                        <h2>Focus Management</h2>
                        <p>Manage your focus tasks and history</p>
                    </div>
                    
                    <div className="setting-item">
                        <div className="setting-info">
                            <strong>Focus History</strong>
                            <span>{focusHistory.length} daily focus sessions recorded</span>
                        </div>
                        <button 
                            className="btn-secondary"
                            onClick={handleClearFocusHistory}
                            disabled={focusHistory.length === 0}
                        >
                            Clear History
                        </button>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <strong>Current Focus Tasks</strong>
                            <span>Clear your current Top 3 focus priorities</span>
                        </div>
                        <button 
                            className="btn-secondary"
                            onClick={handleClearCurrentFocus}
                        >
                            Clear Current Focus
                        </button>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <strong>Trigger Daily Reset</strong>
                            <span>Manually trigger the daily focus reset modal</span>
                        </div>
                        <button 
                            className="btn-secondary"
                            onClick={handleTriggerResetCheck}
                        >
                            Trigger Reset Check
                        </button>
                    </div>
                </div>

                {/* System Health */}
                <div className="settings-section">
                    <div className="section-header">
                        <h2>System Health</h2>
                        <p>Monitor app performance and data integrity</p>
                    </div>
                    
                    <DataHealthCheck />
                </div>

                {/* Application Info */}
                <div className="settings-section">
                    <div className="section-header">
                        <h2>About</h2>
                        <p>Application information</p>
                    </div>
                    
                    <div className="setting-item">
                        <div className="setting-info">
                            <strong>Focus Timer</strong>
                            <span>Built with React, TypeScript, and Vite</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;