/**
 * Offline Storage Utility
 * Provides local storage fallback for resume data when offline
 */

import { Resume } from '@/types/resume';

const STORAGE_KEY_PREFIX = 'resume_offline_';
const PENDING_SAVES_KEY = 'resume_pending_saves';

export interface PendingSave {
  resumeId: string;
  timestamp: number;
  data: Resume;
}

/**
 * Save resume to local storage
 */
export function saveToLocalStorage(resume: Resume): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${resume.id}`;
    localStorage.setItem(key, JSON.stringify(resume));
    
    // Add to pending saves queue
    addToPendingSaves(resume);
  } catch (error) {
    console.error('Failed to save to local storage:', error);
  }
}

/**
 * Load resume from local storage
 */
export function loadFromLocalStorage(resumeId: string): Resume | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}${resumeId}`;
    const data = localStorage.getItem(key);
    
    if (!data) return null;
    
    return JSON.parse(data) as Resume;
  } catch (error) {
    console.error('Failed to load from local storage:', error);
    return null;
  }
}

/**
 * Remove resume from local storage
 */
export function removeFromLocalStorage(resumeId: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${resumeId}`;
    localStorage.removeItem(key);
    
    // Remove from pending saves
    removeFromPendingSaves(resumeId);
  } catch (error) {
    console.error('Failed to remove from local storage:', error);
  }
}

/**
 * Add resume to pending saves queue
 */
function addToPendingSaves(resume: Resume): void {
  try {
    const pendingSaves = getPendingSaves();
    
    // Remove existing entry for this resume if any
    const filtered = pendingSaves.filter((save) => save.resumeId !== resume.id);
    
    // Add new entry
    filtered.push({
      resumeId: resume.id,
      timestamp: Date.now(),
      data: resume,
    });
    
    localStorage.setItem(PENDING_SAVES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to add to pending saves:', error);
  }
}

/**
 * Get all pending saves
 */
export function getPendingSaves(): PendingSave[] {
  try {
    const data = localStorage.getItem(PENDING_SAVES_KEY);
    
    if (!data) return [];
    
    return JSON.parse(data) as PendingSave[];
  } catch (error) {
    console.error('Failed to get pending saves:', error);
    return [];
  }
}

/**
 * Remove resume from pending saves
 */
function removeFromPendingSaves(resumeId: string): void {
  try {
    const pendingSaves = getPendingSaves();
    const filtered = pendingSaves.filter((save) => save.resumeId !== resumeId);
    
    localStorage.setItem(PENDING_SAVES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from pending saves:', error);
  }
}

/**
 * Clear all pending saves
 */
export function clearPendingSaves(): void {
  try {
    localStorage.removeItem(PENDING_SAVES_KEY);
  } catch (error) {
    console.error('Failed to clear pending saves:', error);
  }
}

/**
 * Check if there are pending saves
 */
export function hasPendingSaves(): boolean {
  return getPendingSaves().length > 0;
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): {
  used: number;
  available: number;
  percentage: number;
} {
  try {
    let used = 0;
    
    // Calculate used storage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX) || key === PENDING_SAVES_KEY) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }
    
    // Estimate available storage (5MB typical limit)
    const available = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = (used / available) * 100;
    
    return {
      used,
      available,
      percentage: Math.min(percentage, 100),
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return {
      used: 0,
      available: 0,
      percentage: 0,
    };
  }
}

/**
 * Clear old offline data (older than 7 days)
 */
export function clearOldOfflineData(): void {
  try {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const pendingSaves = getPendingSaves();
    
    // Filter out old saves
    const recentSaves = pendingSaves.filter(
      (save) => save.timestamp > sevenDaysAgo
    );
    
    // Remove old resume data from local storage
    pendingSaves.forEach((save) => {
      if (save.timestamp <= sevenDaysAgo) {
        const key = `${STORAGE_KEY_PREFIX}${save.resumeId}`;
        localStorage.removeItem(key);
      }
    });
    
    // Update pending saves
    localStorage.setItem(PENDING_SAVES_KEY, JSON.stringify(recentSaves));
  } catch (error) {
    console.error('Failed to clear old offline data:', error);
  }
}
