import { useState, useEffect, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';

interface ProjectData {
  nodes: Node[];
  edges: Edge[];
  name: string;
}

export function useAutoSave(
  data: ProjectData,
  projectId: string | null,
  session: any = null, 
  isLoading: boolean = false
) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'unsaved'>('unsaved');
  const [lastSavedTime, setLastSavedTime] = useState<Date>(new Date());
  
  const hasInitialized = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wasLoadingRef = useRef(false);

  const saveToDatabase = useCallback(async (currentData: ProjectData) => {
    if (!projectId || !session?.user?.email) return;

    try {
      setSaveStatus('saving');

      // 👇 FIX: Use the same API as manual save to ensure userId is passed
      const payload = {
          userId: session.user.email, // ✅ Correct Key
          projectId: projectId,       // ✅ Correct ID
          name: currentData.name,
          nodes: currentData.nodes,
          edges: currentData.edges
      };

      // Using the /save route which handles Updates correctly
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://manavmerja-nebula-backend-live.hf.space";
      
      const response = await fetch(`${API_BASE}/api/v1/projects/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Auto-save failed');

      setSaveStatus('saved');
      setLastSavedTime(new Date());
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