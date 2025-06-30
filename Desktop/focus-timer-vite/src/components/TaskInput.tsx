import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const TaskInput: React.FC = () => {
    const { addTodo } = useAppContext();
    const [newTaskText, setNewTaskText] = useState('');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            addTodo({ text: newTaskText.trim(), projectId: '', notes: '' });
            setNewTaskText('');
        } else {
            toast.error("Task description cannot be empty.");
        }
    };

    return (
        <form className="task-input-form" onSubmit={handleAddTask}>
            <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="+ Add task"
                className="task-input-field"
            />
        </form>
    );
};

export default TaskInput;
