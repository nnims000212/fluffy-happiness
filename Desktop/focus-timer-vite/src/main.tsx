// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary'; // <-- Import ErrorBoundary
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary> {/* <-- Wrap everything inside the ErrorBoundary */}
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);