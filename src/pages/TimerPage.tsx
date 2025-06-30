// src/pages/TimerPage.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Timeline from '../components/Timeline';
import StartSessionModal from '../components/StartSessionModal';
import { formatDurationTimer, formatToHoursAndMinutes } from '../utils/formatters';
import { useAppContext } from '../context/AppContext';
import { useTimelineScroll } from '../hooks/useTimelineScroll';
import toast from 'react-hot-toast';
import ProjectSelector from '../components/ProjectSelector';
import TaskFocusDetail from '../components/TaskFocusDetail';

const TimerPage: React.FC = () => {
    const { sessions, projects, addSession, activeTodoId, setActiveTodoId, todos, addTodo } = useAppContext();
    const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');
    const [timeRemaining, setTimeRemaining] = useState(0); 
    const [targetDuration, setTargetDuration] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
    const [currentTaskName, setCurrentTaskName] = useState("");
    const [currentProject, setCurrentProject] = useState("");
    const [currentNotes, setCurrentNotes] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const timerInterval = useRef<number | null>(null);
    const timelineScrollRef = useRef<HTMLDivElement>(null);
    const startSound = useRef(new Audio('/audio/boxing-bell.mp3'));

    useTimelineScroll(timelineScrollRef, 2);

    const activeTodo = useMemo(() => {
        if (!activeTodoId) return null;
        return todos.find(t => t.id === activeTodoId) || null;
    }, [activeTodoId, todos]);

    const getSessionDescription = () => currentTaskName.trim() || (mode === 'stopwatch' ? 'Stopwatch Session' : 'Unspecified Focus Session');
    
    const resetTimerState = useCallback(() => {
        setIsRunning(false);
        if (timerInterval.current) clearInterval(timerInterval.current);
        setTimeRemaining(0);
        setTargetDuration(0);
        setElapsedTime(0);
        setSessionStartTime(null);
        setCurrentTaskName("");
        setCurrentProject("");
        setCurrentNotes("");
        setActiveTodoId(null);
    }, [setActiveTodoId]);
    
    const completeSession = useCallback(() => {
        if (!sessionStartTime) return;
        const description = getSessionDescription();
        // Use actual elapsed time for stopwatch, target duration for timer
        const actualDuration = mode === 'timer' ? targetDuration : elapsedTime;
        addSession({ description, project: currentProject, startTime: sessionStartTime, durationMs: actualDuration, todoId: activeTodoId ?? undefined });
        const toastMessage = currentTaskName ? `Session for "${currentTaskName}" complete!` : "Session complete!";
        toast.success(toastMessage);
        resetTimerState();
    }, [addSession, getSessionDescription, currentProject, sessionStartTime, targetDuration, elapsedTime, mode, resetTimerState, activeTodoId, currentTaskName]);

    useEffect(() => {
        if (isRunning) {
            timerInterval.current = window.setInterval(() => {
                if (mode === 'timer') {
                    const remaining = (sessionStartTime!.getTime() + targetDuration) - Date.now();
                    if (remaining <= 0) {
                        if(timerInterval.current) clearInterval(timerInterval.current);
                        completeSession();
                    } else {
                        setTimeRemaining(remaining);
                    }
                } else {
                    setElapsedTime(Date.now() - sessionStartTime!.getTime());
                }
            }, 200);
        } else {
            if (timerInterval.current) clearInterval(timerInterval.current);
        }
        return () => {
            if (timerInterval.current) clearInterval(timerInterval.current);
        };
    }, [isRunning, mode, sessionStartTime, targetDuration, completeSession]);

    useEffect(() => {
        if (activeTodoId) {
            const todoToTrack = todos.find(t => t.id === activeTodoId);
            if (todoToTrack) {
                if (!isRunning) {
                    if (timerInterval.current) clearInterval(timerInterval.current);
                    setTimeRemaining(0);
                    setTargetDuration(0);
                    setElapsedTime(0);
                    setSessionStartTime(new Date());
                    setMode('stopwatch');
                    setIsRunning(true);
                    toast(`Stopwatch started for: ${todoToTrack.text}`, { icon: '▶️' });
                }
                setCurrentTaskName(todoToTrack.text);
                setCurrentProject(todoToTrack.projectId);
            }
        }
    }, [activeTodoId, todos, isRunning]);

    const startTimer = (durationMs: number, taskName: string, project: string) => {
        resetTimerState();
        let todoIdForSession: string | null = null;
        const trimmedTaskName = taskName.trim() || 'Unspecified Focus Session';

        if (taskName.trim()) {
            const existingTodo = todos.find(t => t.text.toLowerCase() === taskName.trim().toLowerCase() && !t.completed);
            if(existingTodo) {
                todoIdForSession = existingTodo.id;
            } else {
                todoIdForSession = addTodo({ text: taskName.trim(), projectId: project, notes: '' });
                toast.success(`New task created: "${taskName.trim()}"`);
            }
        }
        
        setMode('timer');
        setIsRunning(true);
        setTargetDuration(durationMs);
        setTimeRemaining(durationMs);
        setSessionStartTime(new Date());
        setCurrentTaskName(trimmedTaskName);
        setCurrentProject(project);
        setActiveTodoId(todoIdForSession);
        startSound.current.play().catch(error => console.error("Audio playback failed:", error));
        toast(`Timer started for: ${trimmedTaskName}`, { icon: '▶️' });
    };

    const handlePlayPause = () => {
        if (mode === 'timer' && timeRemaining <= 0) {
            setIsModalOpen(true);
            return;
        }
        if (!isRunning) { 
            if (mode === 'stopwatch') {
                // When resuming stopwatch, adjust sessionStartTime to preserve elapsed time
                setSessionStartTime(new Date(Date.now() - elapsedTime));
            }
            toast(`Session resumed for: ${currentTaskName || 'Unspecified Focus Session'}`, { icon: '▶️' });
        }
        setIsRunning(!isRunning);
    };

    const handleStop = () => {
        if (!sessionStartTime) return;
        const elapsedMs = mode === 'timer' ? targetDuration - timeRemaining : elapsedTime;
        if (elapsedMs > 1000) {
            let todoIdToSave = activeTodoId;
            const taskName = getSessionDescription();

            if (!todoIdToSave && taskName !== 'Unspecified Focus Session' && taskName !== 'Stopwatch Session') {
                const existingTodo = todos.find(t => t.text.toLowerCase() === taskName.toLowerCase() && !t.completed);
                if (existingTodo) {
                    todoIdToSave = existingTodo.id;
                } else {
                    todoIdToSave = addTodo({ text: taskName, projectId: currentProject, notes: currentNotes });
                    toast.success(`New task created: "${taskName}"`);
                }
            }
            
            addSession({ description: taskName, project: currentProject, startTime: sessionStartTime, durationMs: elapsedMs, todoId: todoIdToSave ?? undefined });
            const toastMessage = currentTaskName ? `Session for "${currentTaskName}" saved!` : "Session saved!";
            toast.success(toastMessage);
        }
        resetTimerState();
    };

    const radius = 140; 
    const circumference = 2 * Math.PI * radius; 
    const progress = targetDuration > 0 ? timeRemaining / targetDuration : 0; 
    const strokeDashoffset = circumference - progress * circumference; 
    const isSessionActive = isRunning || timeRemaining > 0 || elapsedTime > 0;
    const displayTime = mode === 'timer' ? timeRemaining : elapsedTime;
    const today = new Date();
    const todaySessions = sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        return sessionDate.getDate() === today.getDate() &&
               sessionDate.getMonth() === today.getMonth() &&
               sessionDate.getFullYear() === today.getFullYear();
    });

    return (
        <div className="page" style={{ padding: '2rem' }}>
            <div className="home-page-header">
                <h2>Focus Zone</h2>
                <div className="view-switcher">
                    <button className={mode === 'timer' ? 'active' : ''} onClick={() => !isSessionActive && setMode('timer')} disabled={isSessionActive}>Timer</button>
                    <button className={mode === 'stopwatch' ? 'active' : ''} onClick={() => !isSessionActive && setMode('stopwatch')} disabled={isSessionActive}>Stopwatch</button>
                </div>
            </div>

            <div className={`page-timer-layout ${isSessionActive ? 'session-active' : ''}`}>
                 <div className="timer-column">
                    <div className="app-container">
                        <div className="timer-container">
                            <div className="timer-display">
                                <svg className="progress-ring" width="300" height="300" style={{ visibility: mode === 'timer' ? 'visible' : 'hidden' }}>
                                    <circle className="progress-ring-track" cx="150" cy="150" r={radius} />
                                    <circle className="progress-ring-indicator" cx="150" cy="150" r={radius} style={{ strokeDasharray: circumference, strokeDashoffset }}/>
                                </svg>
                                <div className="time-text-container">
                                    <div className="time-text">{formatDurationTimer(displayTime)}</div>
                                    <div className="time-subtext">{mode === 'timer' ? 'Time Remaining' : 'Elapsed Time'}</div>
                                </div>
                                <div className="icon-controls">
                                    <button id="play-pause-btn" className="icon-btn" onClick={handlePlayPause}>
                                        {isRunning ? ( <svg id="pause-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> ) : ( <svg id="play-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> )}
                                    </button>
                                    <button id="stop-icon-btn" className="icon-btn" onClick={handleStop} disabled={!isSessionActive}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="timeline-column">
                    <div className="content-card">
                        <div className="card-header">
                            <p className="content-card-title">{ isSessionActive ? "Current Session Details" : "Today's Timeline" }</p>
                        </div>
                        <div className="timeline-body">
                            {isSessionActive ? (
                                <div id="current-session-view" className="task-details-card">
                                    {activeTodo ? (
                                        <>
                                            <div className="active-todo-indicator" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)'}}>
                                                <p style={{ margin: 0, fontWeight: '600', fontSize: '1.2em' }}>
                                                    {activeTodo.text}
                                                </p>
                                                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted-color)'}}>
                                                    Total time on this task: {formatToHoursAndMinutes(
                                                        sessions.filter(s => s.todoId === activeTodoId).reduce((sum, s) => sum + s.durationMs, 0) + elapsedTime
                                                    )}
                                                </p>
                                            </div>
                                            <TaskFocusDetail todo={activeTodo} sessions={sessions} />
                                        </>
                                    ) : (
                                        <>
                                            <div className="form-group">
                                                <label htmlFor="current-session-goal-edit">Task Name</label>
                                                <input type="text" id="current-session-goal-edit" placeholder="What are you working on?" value={currentTaskName} onChange={e => setCurrentTaskName(e.target.value)} disabled={mode === 'timer'} />
                                            </div>
                                            <div className="form-group">
                                                <label>Project</label>
                                                <ProjectSelector selectedProject={currentProject} onProjectChange={setCurrentProject} />
                                            </div>
                                            <div className="previous-sessions-section">
                                                <h4>Notes</h4>
                                                <div className="form-group">
                                                    <textarea 
                                                        id="current-session-notes"
                                                        className="todo-notes-textarea"
                                                        placeholder="Add notes for this task..."
                                                        value={currentNotes}
                                                        onChange={e => setCurrentNotes(e.target.value)}
                                                    />
                                                    <small>Notes will be saved if a new task is created.</small>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="timeline-scroll-wrapper" ref={timelineScrollRef}>
                                    <Timeline sessions={todaySessions} allProjects={projects.map(p => p.name)} pixelsPerMinute={2} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <StartSessionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onStart={startTimer}
            />
        </div>
    );
};

export default TimerPage;