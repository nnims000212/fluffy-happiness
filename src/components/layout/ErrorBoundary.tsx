// src/components/ErrorBoundary.tsx
import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  errorDetails: string;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
    errorDetails: '',
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred',
      errorDetails: error.stack || '',
      retryCount: 0,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.group('🚨 Application Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Store error info in state for display
    this.setState({
      errorMessage: error.message || 'An unexpected error occurred',
      errorDetails: `${error.stack}\n\nComponent Stack:${errorInfo.componentStack}`,
    });
  }

  private handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    if (newRetryCount >= 3) {
      // After 3 retries, suggest data reset
      this.handleDataReset();
      return;
    }

    this.setState({ 
      hasError: false, 
      errorMessage: '', 
      errorDetails: '',
      retryCount: newRetryCount 
    });
  };

  private handleDataReset = () => {
    if (window.confirm(
      'Multiple errors detected. This might be due to corrupted data. ' +
      'Would you like to reset the app data? This will clear all tasks, sessions, and settings.'
    )) {
      // Clear all localStorage data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('focusTimer')) {
          localStorage.removeItem(key);
        }
      });
      
      // Reload the page
      window.location.reload();
    }
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleReportError = () => {
    const errorReport = {
      message: this.state.errorMessage,
      details: this.state.errorDetails,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error report copied to clipboard. You can paste this when reporting the issue.');
      })
      .catch(() => {
        // Fallback: show error in a text area for manual copying
        const textarea = document.createElement('textarea');
        textarea.value = JSON.stringify(errorReport, null, 2);
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.width = '100%';
        textarea.style.height = '300px';
        textarea.style.zIndex = '9999';
        textarea.style.background = '#1e1e28';
        textarea.style.color = '#f0f0f0';
        textarea.style.border = '1px solid #4a4a5a';
        textarea.style.padding = '1rem';
        document.body.appendChild(textarea);
        textarea.select();
        
        setTimeout(() => {
          document.body.removeChild(textarea);
        }, 10000);
      });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p className="error-message">
              The Focus Timer app encountered an unexpected error and needs to recover.
            </p>
            
            <div className="error-details">
              <details>
                <summary>Technical Details (for troubleshooting)</summary>
                <div className="error-technical">
                  <strong>Error:</strong> {this.state.errorMessage}
                  <br />
                  <strong>Retry Count:</strong> {this.state.retryCount}
                </div>
              </details>
            </div>

            <div className="error-actions">
              <button 
                className="btn-primary"
                onClick={this.handleRetry}
              >
                {this.state.retryCount === 0 ? 'Try Again' : `Try Again (${this.state.retryCount}/3)`}
              </button>
              
              <button 
                className="btn-secondary"
                onClick={this.handleRefresh}
              >
                Refresh Page
              </button>
              
              {this.state.retryCount >= 2 && (
                <button 
                  className="btn-secondary"
                  onClick={this.handleDataReset}
                >
                  Reset App Data
                </button>
              )}
              
              <button 
                className="btn-text"
                onClick={this.handleReportError}
              >
                Copy Error Report
              </button>
            </div>

            <div className="error-help">
              <p>
                <strong>What happened?</strong> A technical error occurred while using the app.
              </p>
              <p>
                <strong>What can you do?</strong> Try the "Try Again" button first. 
                If the error persists, refresh the page or reset app data as a last resort.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;