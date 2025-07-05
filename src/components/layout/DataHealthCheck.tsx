// src/components/DataHealthCheck.tsx
import React, { useState, useEffect } from 'react';
import { performDataHealthCheck } from '../../utils/dataValidation';
import { checkBrowserCompatibility, createErrorReport, errorLogger } from '../../utils/errorHandling';
import toast from 'react-hot-toast';

interface HealthCheckResult {
    dataHealth: {
        healthy: boolean;
        issues: string[];
        recommendations: string[];
    };
    browserCompatibility: {
        compatible: boolean;
        issues: string[];
        warnings: string[];
    };
    errorSummary: string;
    lastChecked: Date;
}

const DataHealthCheck: React.FC = () => {
    const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const runHealthCheck = async (showToast: boolean = true) => {
        setIsChecking(true);
        
        try {
            // Small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const dataHealth = performDataHealthCheck();
            const browserCompatibility = checkBrowserCompatibility();
            const errorSummary = errorLogger.getErrorSummary();
            
            const result: HealthCheckResult = {
                dataHealth,
                browserCompatibility,
                errorSummary,
                lastChecked: new Date()
            };
            
            setHealthResult(result);
            
            // Show appropriate toast only if requested
            if (showToast) {
                if (dataHealth.healthy && browserCompatibility.compatible && !errorSummary) {
                    toast.success('All systems healthy! 💚');
                } else if (dataHealth.issues.length > 0 || browserCompatibility.issues.length > 0) {
                    toast.error('Issues detected that need attention');
                } else {
                    toast('Health check complete - minor warnings found', { icon: '⚠️' });
                }
            }
        } catch (error) {
            if (showToast) {
                toast.error('Failed to perform health check');
            }
            console.error('Health check error:', error);
        } finally {
            setIsChecking(false);
        }
    };

    const exportErrorReport = () => {
        try {
            const report = createErrorReport();
            navigator.clipboard.writeText(report)
                .then(() => {
                    toast.success('Error report copied to clipboard');
                })
                .catch(() => {
                    // Fallback: show in a textarea
                    const textarea = document.createElement('textarea');
                    textarea.value = report;
                    textarea.style.position = 'fixed';
                    textarea.style.top = '10px';
                    textarea.style.left = '10px';
                    textarea.style.width = 'calc(100% - 20px)';
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
                    
                    toast.success('Error report displayed for copying');
                });
        } catch {
            toast.error('Failed to create error report');
        }
    };

    const clearErrorLog = () => {
        if (window.confirm('Clear the error log? This will remove all recorded errors.')) {
            errorLogger.clearErrors();
            toast.success('Error log cleared');
            runHealthCheck(false); // Refresh the results without showing toast
        }
    };

    // Auto-run health check on component mount (without toast)
    useEffect(() => {
        runHealthCheck(false);
    }, []);

    const getHealthIcon = (healthy: boolean, hasIssues: boolean) => {
        if (healthy && !hasIssues) return '💚';
        if (hasIssues) return '🔴';
        return '🟡';
    };

    const getHealthText = (healthy: boolean, hasIssues: boolean) => {
        if (healthy && !hasIssues) return 'Healthy';
        if (hasIssues) return 'Issues Detected';
        return 'Minor Warnings';
    };

    return (
        <div className="data-health-check">
            <div className="health-check-header">
                <div className="health-check-title">
                    <h3>App Health Check</h3>
                    <p>Monitor data integrity and system health</p>
                </div>
                <button 
                    className="btn-primary"
                    onClick={() => runHealthCheck()}
                    disabled={isChecking}
                >
                    {isChecking ? 'Checking...' : 'Run Check'}
                </button>
            </div>

            {healthResult && (
                <div className="health-results">
                    <div className="health-summary">
                        <div className="health-item">
                            <span className="health-icon">
                                {getHealthIcon(
                                    healthResult.dataHealth.healthy, 
                                    healthResult.dataHealth.issues.length > 0
                                )}
                            </span>
                            <div className="health-info">
                                <strong>Data Health</strong>
                                <span>{getHealthText(
                                    healthResult.dataHealth.healthy, 
                                    healthResult.dataHealth.issues.length > 0
                                )}</span>
                            </div>
                        </div>

                        <div className="health-item">
                            <span className="health-icon">
                                {getHealthIcon(
                                    healthResult.browserCompatibility.compatible,
                                    healthResult.browserCompatibility.issues.length > 0
                                )}
                            </span>
                            <div className="health-info">
                                <strong>Browser Compatibility</strong>
                                <span>{getHealthText(
                                    healthResult.browserCompatibility.compatible,
                                    healthResult.browserCompatibility.issues.length > 0
                                )}</span>
                            </div>
                        </div>

                        <div className="health-item">
                            <span className="health-icon">
                                {healthResult.errorSummary ? '📊' : '✨'}
                            </span>
                            <div className="health-info">
                                <strong>Error Log</strong>
                                <span>{healthResult.errorSummary || 'No errors recorded'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="health-actions">
                        <button 
                            className="btn-secondary"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            {showDetails ? 'Hide Details' : 'Show Details'}
                        </button>
                        
                        {healthResult.errorSummary && (
                            <>
                                <button 
                                    className="btn-secondary"
                                    onClick={exportErrorReport}
                                >
                                    Export Error Report
                                </button>
                                <button 
                                    className="btn-text"
                                    onClick={clearErrorLog}
                                >
                                    Clear Error Log
                                </button>
                            </>
                        )}
                    </div>

                    {showDetails && (
                        <div className="health-details">
                            {healthResult.dataHealth.issues.length > 0 && (
                                <div className="detail-section">
                                    <h4>🔴 Data Issues</h4>
                                    <ul>
                                        {healthResult.dataHealth.issues.map((issue, index) => (
                                            <li key={index}>{issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {healthResult.dataHealth.recommendations.length > 0 && (
                                <div className="detail-section">
                                    <h4>💡 Recommendations</h4>
                                    <ul>
                                        {healthResult.dataHealth.recommendations.map((rec, index) => (
                                            <li key={index}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {healthResult.browserCompatibility.issues.length > 0 && (
                                <div className="detail-section">
                                    <h4>🔴 Browser Issues</h4>
                                    <ul>
                                        {healthResult.browserCompatibility.issues.map((issue, index) => (
                                            <li key={index}>{issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {healthResult.browserCompatibility.warnings.length > 0 && (
                                <div className="detail-section">
                                    <h4>⚠️ Browser Warnings</h4>
                                    <ul>
                                        {healthResult.browserCompatibility.warnings.map((warning, index) => (
                                            <li key={index}>{warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="detail-section">
                                <h4>ℹ️ System Info</h4>
                                <div className="system-info">
                                    <p><strong>Last Checked:</strong> {healthResult.lastChecked.toLocaleString()}</p>
                                    <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                                    <p><strong>Storage Available:</strong> {window.localStorage ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataHealthCheck;