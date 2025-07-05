// src/components/features/analytics/DataBackupCard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  createFullBackup, 
  importFromFile, 
  ImportStrategy, 
  type ImportResult
} from '../../../utils/dataBackup';

interface DataBackupCardProps {
  onImportComplete?: (result: ImportResult) => void;
}

const DataBackupCard: React.FC<DataBackupCardProps> = ({ onImportComplete }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState<Date | null>(null);
  const [lastRestoreTime, setLastRestoreTime] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load last backup and restore times from localStorage on component mount
  useEffect(() => {
    const savedBackup = localStorage.getItem('focusTimerLastBackup');
    if (savedBackup) {
      try {
        setLastBackupTime(new Date(savedBackup));
      } catch {
        // Invalid date, ignore
      }
    }

    const savedRestore = localStorage.getItem('focusTimerLastRestore');
    if (savedRestore) {
      try {
        setLastRestoreTime(new Date(savedRestore));
      } catch {
        // Invalid date, ignore
      }
    }
  }, []);

  const handleBackup = async () => {
    setIsExporting(true);
    try {
      createFullBackup();
      const now = new Date();
      setLastBackupTime(now);
      localStorage.setItem('focusTimerLastBackup', now.toISOString());
      setTimeout(() => setIsExporting(false), 1000);
    } catch (error) {
      console.error('Backup failed:', error);
      setIsExporting(false);
      alert('Backup failed. Please try again.');
    }
  };

  const handleRestore = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const result = await importFromFile(file, {
        strategy: ImportStrategy.MERGE,
        includeSessions: true,
        includeTodos: true,
        includeProjects: true,
        includeFocusHistory: true,
        includeSettings: true,
      });

      if (result.success) {
        const now = new Date();
        setLastRestoreTime(now);
        localStorage.setItem('focusTimerLastRestore', now.toISOString());
      }

      // Notify parent component
      onImportComplete?.(result);
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="backup-card">
      <div className="backup-status">
        <div className="status-item">
          <span className="backup-label">Last backup:</span>
          <span className="backup-time">{formatTime(lastBackupTime)}</span>
        </div>
        <div className="status-item">
          <span className="backup-label">Last restore:</span>
          <span className="backup-time">{formatTime(lastRestoreTime)}</span>
        </div>
      </div>

      <div className="backup-actions">
        <button 
          onClick={handleBackup}
          disabled={isExporting}
          className="backup-button primary"
        >
          {isExporting ? '⏳ Creating...' : '💾 Backup'}
        </button>
        
        <button 
          onClick={handleRestore}
          disabled={isImporting}
          className="backup-button secondary"
        >
          {isImporting ? '⏳ Restoring...' : '📂 Restore'}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <style jsx>{`
        .backup-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 0;
          margin: 0;
        }

        .backup-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .backup-label {
          color: var(--secondary-text-color);
          font-size: 0.85em;
        }

        .backup-time {
          color: var(--text-color);
          font-size: 0.9em;
          font-weight: 500;
        }

        .backup-actions {
          display: flex;
          gap: 12px;
        }

        .backup-button {
          padding: 10px 20px;
          border-radius: 6px;
          border: none;
          font-size: 0.9em;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
        }

        .backup-button.primary {
          background: var(--accent-color);
          color: white;
        }

        .backup-button.primary:hover:not(:disabled) {
          background: var(--accent-hover-color);
        }

        .backup-button.secondary {
          background: var(--secondary-surface-color);
          color: var(--text-color);
          border: 1px solid var(--border-color);
        }

        .backup-button.secondary:hover:not(:disabled) {
          background: var(--hover-surface-color);
        }

        .backup-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .backup-card {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
          
          .backup-status {
            text-align: center;
          }
          
          .backup-actions {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default DataBackupCard;