// src/hooks/useTimelineScroll.ts
import { useEffect } from 'react';
import type { RefObject } from 'react';

// The type is now correctly defined to accept a ref that can be null initially.
export const useTimelineScroll = (
    scrollRef: RefObject<HTMLDivElement | null>,
    pixelsPerMinute: number
) => {
    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            // Use a small timeout to allow the layout to render fully,
            // which helps in getting the correct clientHeight.
            const timer = setTimeout(() => {
                const now = new Date();
                const nowInMinutes = now.getHours() * 60 + now.getMinutes();
                const nowPosition = nowInMinutes * pixelsPerMinute;

                const containerHeight = container.clientHeight;
                // Calculate position to scroll to, aiming to center the "now" line.
                const scrollToPosition = nowPosition - (containerHeight / 2);

                // Use smooth scrolling for a better user experience.
                container.scrollTo({
                    top: Math.max(0, scrollToPosition),
                    behavior: 'smooth'
                });
            }, 100); // A 100ms delay is usually sufficient.

            return () => clearTimeout(timer);
        }
    }, [pixelsPerMinute]); // This effect runs when the component mounts.
};