import { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from 'reactflow';

// Define the shape of your project data
interface ProjectData {
  nodes: Node[];
  edges: Edge[];
  name: string;
}

export function useAutoSave(data: ProjectData, projectId: string | null) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'unsaved'>('unsaved');
  const [lastSavedTime, setLastSavedTime] = useState<Date>(new Date());

  // 1. The actual API call (Debounced)
  const saveToDatabase = useCallback(async (currentData: ProjectData) => {
    if (!projectId) return; // Don't save if no project ID

    try {
      setSaveStatus('saving');

      // 🟢 REPLACE this with your actual API endpoint
      // Example: await supabase.from('projects').update({ content: currentData }).eq('id', projectId)
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData),
      });

      if (!response.ok) throw new Error('Auto-save failed');

      setSaveStatus('saved');
      setLastSavedTime(new Date());
    } catch (error) {
      console.error("Auto-save error:", error);
      setSaveStatus('error');
    }
  }, [projectId]);

  // 2. The Watcher (Effect)
  useEffect(() => {
    if (!projectId) return;

    // Reset status to 'saving' (or 'unsaved') immediately when data changes
    setSaveStatus('saving');

    // Wait 2 seconds before actually sending the request
    const timer = setTimeout(() => {
      saveToDatabase(data);
    }, 2000);

    // If data changes again within 2s, cancel the previous timer
    return () => clearTimeout(timer);
  }, [data, saveToDatabase, projectId]);

  return { saveStatus, lastSavedTime };
}