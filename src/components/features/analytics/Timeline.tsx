// src/components/Timeline.tsx
import React from 'react';
import type { Session } from '../../../types/index';
import { formatToHoursAndMinutes } from '../../../utils/formatters';
import { getProjectColor } from '../../../utils/colors';

interface TimelineProps {
    sessions: Session[];
    allProjects: string[];
    pixelsPerMinute?: number;
}

const Timeline: React.FC<TimelineProps> = ({ sessions, allProjects, pixelsPerMinute = 2 }) => {
    const now = new Date();
    const nowPosition = (now.getHours() * 60 + now.getMinutes()) * pixelsPerMinute;

    return (
        <div className="timeline-widget-container">
             <ul className="timeline-slots">
                {Array.from({ length: 48 }).map((_, i) => {
                    const hour = Math.floor(i / 2);
                    const minute = (i % 2) * 30;
                    const time = new Date();
                    time.setHours(hour, minute, 0, 0);
                    const timeString = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                    return <li key={i} className="timeline-slot" style={{ height: `${30 * pixelsPerMinute}px` }}><span>{timeString}</span></li>;
                })}
            </ul>
            <div className="timeline-sessions">
                {sessions.map(session => {
                    const startTime = new Date(session.startTime);
                    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
                    const durationMinutes = Math.round(session.durationMs / 60000);
                    const projectKey = session.project || 'Other';
                    
                    return (
                        <div 
                            key={session.id}
                            className="timeline-session-block"
                            style={{ 
                                top: `${startMinutes * pixelsPerMinute}px`, 
                                height: `${Math.max(durationMinutes, 1) * pixelsPerMinute}px`,
                                backgroundColor: getProjectColor(projectKey, allProjects)
                            }}
                            title={`${session.description || 'Session'} (${formatToHoursAndMinutes(session.durationMs)})`}
                        >
                            <span className="timeline-session-block-title">{session.description || session.project || 'Session'}</span>
                             <span className="timeline-session-block-time">{startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                    )
                })}
                <div className="timeline-now-line" style={{ top: `${nowPosition}px` }}></div>
            </div>
        </div>
    );
};

export default Timeline;