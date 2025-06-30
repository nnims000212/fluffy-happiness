// src/pages/App.tsx
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import TimerPage from './TimerPage';
import HistoryPage from './HistoryPage';
import HomePage from './HomePage';
import TodoPage from './TodoPage'; // <-- 1. Import the new page
import { useAppContext } from '../context/AppContext'; // <-- 2. Import context hook

const App: React.FC = () => {
    // 3. Get page state from context instead of local state
    const { activePage, setActivePage } = useAppContext();
    const [isNavExpanded, setIsNavExpanded] = useState(false);

    useEffect(() => {
        const path = window.location.pathname;
        if (path.includes('/todo')) {
            setActivePage('todo');
        } else if (path.includes('/timer')) {
            setActivePage('timer');
        } else if (path.includes('/history')) {
            setActivePage('history');
        } else {
            setActivePage('home');
        }
    }, [setActivePage]);

    return (
        <div className={`main-layout ${isNavExpanded ? 'nav-expanded' : ''}`}>
            <Toaster 
                position="bottom-center"
                toastOptions={{
                    style: {
                        background: '#333438',
                        color: '#EAEAEA',
                    },
                }}
            />
            
            <nav 
                className="left-nav"
                onMouseEnter={() => setIsNavExpanded(true)}
                onMouseLeave={() => setIsNavExpanded(false)}
            >
                <ul className="nav-list">
                    <li className={`nav-item ${activePage === 'home' ? 'active' : ''}`} onClick={() => setActivePage('home')}>
                        <a>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            <span className="nav-text">Home</span>
                        </a>
                    </li>
                    <li className={`nav-item ${activePage === 'timer' ? 'active' : ''}`} onClick={() => setActivePage('timer')}>
                        <a>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span className="nav-text">Timer</span>
                        </a>
                    </li>
                    {/* 4. Add the new To-do navigation item */}
                    <li className={`nav-item ${activePage === 'todo' ? 'active' : ''}`} onClick={() => setActivePage('todo')}>
                        <a>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                            <span className="nav-text">To-do</span>
                        </a>
                    </li>
                    <li className={`nav-item ${activePage === 'history' ? 'active' : ''}`} onClick={() => setActivePage('history')}>
                        <a>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                            <span className="nav-text">History</span>
                        </a>
                    </li>
                </ul>
            </nav>
            <main className="content-area">
                <div className="page" style={{ display: activePage === 'home' ? 'block' : 'none' }}>
                    <HomePage />
                </div>
                <div className="page" style={{ display: activePage === 'timer' ? 'block' : 'none' }}>
                    <TimerPage />
                </div>
                {/* 5. Add the rendering container for the To-do page */}
                <div className="page" style={{ display: activePage === 'todo' ? 'block' : 'none' }}>
                    <TodoPage />
                </div>
                <div className="page" style={{ display: activePage === 'history' ? 'block' : 'none' }}>
                    <HistoryPage />
                </div>
            </main>
        </div>
    );
};

export default App;
