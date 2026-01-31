import { useState, useEffect, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';

// Define the shape of your project data
interface ProjectData {
  nodes: Node[];
  edges: Edge[];
  name: string;
}

export function useAutoSave(
  data: ProjectData,
  projectId: string | null,
  session: any = null, // Add session parameter for authentication check
  isLoading: boolean = false // Add loading flag to prevent save during load
) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'unsaved'>('unsaved');
  const [lastSavedTime, setLastSavedTime] = useState<Date>(new Date());

  // Track if this is the initial mount to prevent auto-save on load
  const hasInitialized = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wasLoadingRef = useRef(false); // Track loading state changes

  // 1. The actual API call (Debounced)
  const saveToDatabase = useCallback(async (currentData: ProjectData) => {
    if (!projectId) {
      console.log('[Auto-Save] Skipped: No project ID');
      return;
    }

    // Check if user is authenticated
    if (!session) {
      console.log('[Auto-Save] Skipped: User not authenticated');
      setSaveStatus('unsaved');
      return;
    }

    try {
      console.log('[Auto-Save] Saving project...', projectId);
      setSaveStatus('saving');

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Auto-save failed');
      }

      setSaveStatus('saved');
      setLastSavedTime(new Date());
      console.log('[Auto-Save] ✅ Project saved successfully');
    } catch (error) {
      console.error('[Auto-Save] ❌ Error:', error);
      setSaveStatus('error');
    }
  }, [projectId, session]);

  // 2. The Watcher (Effect)
  useEffect(() => {
    // Don't auto-save if no project ID
    if (!projectId) return;

    // Skip auto-save while loading (project is being loaded from server)
    if (isLoading) {
      console.log('[Auto-Save] Skipped: Project is loading...');
      wasLoadingRef.current = true;
      // Clear any pending save timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    // If we just finished loading, reset initialization to skip this update
    if (wasLoadingRef.current) {
      wasLoadingRef.current = false;
      hasInitialized.current = false;
      console.log('[Auto-Save] Project load complete - resetting initialization');
    }

    // Skip auto-save on initial mount/load
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log('[Auto-Save] Initialized - skipping first save');
      return;
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set status to 'saving' to show user that changes are pending
    setSaveStatus('saving');
    console.log('[Auto-Save] Changes detected, will save in 2 seconds...');

    // Wait 2 seconds before actually sending the request
    timerRef.current = setTimeout(() => {
      saveToDatabase(data);
    }, 2000);

    // Cleanup: If data changes again within 2s, cancel the previous timer
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, projectId, isLoading, saveToDatabase]);

  // Reset initialization flag when project changes
  useEffect(() => {
    hasInitialized.current = false;
    wasLoadingRef.current = false;
  }, [projectId]);

  return { saveStatus, lastSavedTime };
}