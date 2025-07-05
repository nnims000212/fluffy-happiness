// src/components/DatePicker.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';

interface DatePickerProps {
    selectedDate: Date;
    onChange: (date: Date) => void;
    onClose: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange, onClose }) => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate));
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const changeMonth = (amount: number) => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    const changeYear = (amount: number) => setViewDate(prev => new Date(prev.getFullYear() + amount, prev.getMonth(), 1));

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
        const days = [];

        const prevMonthEndDate = new Date(year, month, 0);
        for (let i = startDayOfWeek; i > 0; i--) {
            const day = prevMonthEndDate.getDate() - i + 1;
            days.push({ day, isCurrentMonth: false, date: new Date(prevMonthEndDate.getFullYear(), prevMonthEndDate.getMonth(), day) });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
        }
        
        const remainingSlots = 42 - days.length;
        for (let i = 1; i <= remainingSlots; i++) {
            const nextMonthDate = new Date(year, month + 1, i);
            days.push({ day: i, isCurrentMonth: false, date: nextMonthDate });
        }
        return days;
    }, [viewDate]);

    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    
    return (
        <div className="date-picker-popup" ref={pickerRef}>
            <div className="picker-header">
                <button onClick={() => changeYear(-1)}>«</button>
                <button onClick={() => changeMonth(-1)}>‹</button>
                <span className="picker-month-year">{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => changeMonth(1)}>›</button>
                <button onClick={() => changeYear(1)}>»</button>
            </div>
            <div className="picker-grid">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => <div key={day} className="picker-weekday">{day}</div>)}
                {calendarDays.map(({ day, isCurrentMonth, date }, index) => {
                    const isSelected = isSameDay(date, selectedDate);
                    return (
                        <button key={index} className={`picker-day ${isCurrentMonth ? '' : 'other-month'} ${isSelected ? 'selected' : ''}`} onClick={() => onChange(date)}>
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DatePicker;