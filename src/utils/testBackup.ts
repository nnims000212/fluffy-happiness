// src/utils/testBackup.ts
// Test script for backup functionality - for development testing only

import { 
  createFullBackup, 
  exportData, 
  validateBackup, 
  ImportStrategy 
} from './dataBackup';

/**
 * Test backup functionality with sample data
 */
export function testBackupSystem() {
  console.log('🧪 Testing backup system...');
  
  try {
    // Test 1: Export current data
    console.log('📤 Test 1: Exporting current data...');
    const backup = exportData({
      includeSessions: true,
      includeTodos: true,
      includeProjects: true,
      includeFocusHistory: true,
      includeSettings: true,
    });
    
    console.log('✅ Export successful:', {
      version: backup.version,
      exportDate: backup.exportDate,
      metadata: backup.metadata,
    });
    
    // Test 2: Validate backup structure
    console.log('🔍 Test 2: Validating backup structure...');
    const validation = validateBackup(backup);
    
    if (validation.valid) {
      console.log('✅ Backup validation passed');
    } else {
      console.log('❌ Backup validation failed:', validation.errors);
      return false;
    }
    
    // Test 3: Check data integrity
    console.log('🔧 Test 3: Checking data integrity...');
    const { data } = backup;
    
    const checks = [
      { name: 'Sessions array', test: Array.isArray(data.sessions) },
      { name: 'Todos array', test: Array.isArray(data.todos) },
      { name: 'Projects array', test: Array.isArray(data.projects) },
      { name: 'Focus history array', test: Array.isArray(data.focusHistory) },
      { name: 'Settings object', test: typeof data.settings === 'object' },
      { name: 'Metadata present', test: backup.metadata && typeof backup.metadata === 'object' },
    ];
    
    const failedChecks = checks.filter(check => !check.test);
    
    if (failedChecks.length > 0) {
      console.log('❌ Data integrity checks failed:', failedChecks.map(c => c.name));
      return false;
    }
    
    console.log('✅ All data integrity checks passed');
    
    // Test 4: Test different export options
    console.log('📊 Test 4: Testing selective exports...');
    
    const sessionsOnly = exportData({ 
      includeSessions: true,
      includeTodos: false,
      includeProjects: false,
      includeFocusHistory: false,
      includeSettings: false,
    });
    
    if (sessionsOnly.data.sessions.length === backup.data.sessions.length &&
        sessionsOnly.data.todos.length === 0 &&
        sessionsOnly.data.projects.length === 0) {
      console.log('✅ Sessions-only export works correctly');
    } else {
      console.log('❌ Sessions-only export failed');
      return false;
    }
    
    // Test 5: Test backup with date range
    console.log('📅 Test 5: Testing date range export...');
    
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const rangeBackup = exportData({
      includeSessions: true,
      dateRange: { from: yesterday, to: today }
    });
    
    console.log(`✅ Date range export: ${rangeBackup.data.sessions.length} sessions in range`);
    
    // Test 6: Simulate backup file creation
    console.log('📁 Test 6: Simulating backup file creation...');
    
    try {
      const dataStr = JSON.stringify(backup, null, 2);
      const size = new Blob([dataStr]).size;
      console.log(`✅ Backup file simulation: ${Math.round(size / 1024)}KB`);
    } catch (error) {
      console.log('❌ Backup file simulation failed:', error);
      return false;
    }
    
    console.log('🎉 All backup tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Backup test failed:', error);
    return false;
  }
}

/**
 * Quick test for emergency backup functionality
 */
export function testEmergencyBackup() {
  console.log('🚨 Testing emergency backup...');
  
  try {
    const backup = exportData();
    const totalItems = Object.values(backup.metadata).reduce((sum, val) => {
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);
    
    console.log(`✅ Emergency backup ready: ${totalItems} total items`);
    console.log(`📊 Breakdown:`, backup.metadata);
    
    return backup;
  } catch (error) {
    console.error('❌ Emergency backup failed:', error);
    return null;
  }
}

// For console testing - can be called from browser dev tools
if (typeof window !== 'undefined') {
  (window as any).testBackup = testBackupSystem;
  (window as any).testEmergencyBackup = testEmergencyBackup;
  (window as any).createBackup = createFullBackup;
}