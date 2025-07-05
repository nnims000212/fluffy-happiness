// src/pages/App.tsx
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import TimerPage from './TimerPage';
import HistoryPage from './HistoryPage';
import HomePage from './HomePage';
import TodoPage from './TodoPage'; // <-- 1. Import the new page
import TodayPage from './TodayPage';
import SettingsPage from './SettingsPage';
import DailyResetModal from '../components/DailyResetModal';
import { useAppContext } from '../context/AppContext'; // <-- 2. Import context hook

const App: React.FC = () => {
    // 3. Get page state from context instead of local state
    const { activePage, setActivePage, checkForDailyReset, markAppLaunch } = useAppContext();
    const [isNavExpanded, setIsNavExpanded] = useState(false);
    const [showDailyResetModal, setShowDailyResetModal] = useState(false);

    useEffect(() => {
        const path = window.location.pathname;
        if (path.includes('/todo')) {
            setActivePage('todo');
        } else if (path.includes('/top3')) {
            setActivePage('top3');
        } else if (path.includes('/timer')) {
            setActivePage('timer');
        } else if (path.includes('/history')) {
            setActivePage('history');
        } else if (path.includes('/settings')) {
            setActivePage('settings');
        } else {
            setActivePage('home');
        }
    }, [setActivePage]);

    // Check for daily reset on app launch
    useEffect(() => {
        const shouldReset = checkForDailyReset();
        if (shouldReset) {
            setShowDailyResetModal(true);
        } else {
            markAppLaunch();
        }
    }, [checkForDailyReset, markAppLaunch]);

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
                    <li className={`nav-item ${activePage === 'top3' ? 'active' : ''}`} onClick={() => setActivePage('top3')}>
                        <a>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9 17 14.74 18.18 21.02 12 17.77 5.82 21.02 7 14.74 2 9 8.91 8.26 12 2"></polygon></svg>
                            <span className="nav-text">Top 3</span>
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
                    <li className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => setActivePage('settings')}>
                        <a>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            <span className="nav-text">Settings</span>
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
                <div className="page" style={{ display: activePage === 'top3' ? 'block' : 'none' }}>
                    <TodayPage />
                </div>
                {/* 5. Add the rendering container for the To-do page */}
                <div className="page" style={{ display: activePage === 'todo' ? 'block' : 'none' }}>
                    <TodoPage />
                </div>
                <div className="page" style={{ display: activePage === 'history' ? 'block' : 'none' }}>
                    <HistoryPage />
                </div>
                <div className="page" style={{ display: activePage === 'settings' ? 'block' : 'none' }}>
                    <SettingsPage />
                </div>
            </main>
            
            {showDailyResetModal && (
                <DailyResetModal 
                    isOpen={showDailyResetModal} 
                    onClose={() => {
                        setShowDailyResetModal(false);
                        markAppLaunch();
                    }} 
                />
            )}
        </div>
    );
};

export default App;
