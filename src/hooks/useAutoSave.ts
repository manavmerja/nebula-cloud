import { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from 'reactflow';

// Define the shape of your project data
interface ProjectData {
  nodes: Node[];
  edges: Edge[];
  title: string;
}

export function useAutoSave(data: ProjectData, projectId: string) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<Date>(new Date());

  // The actual API call
  const saveToDatabase = useCallback(async (currentData: ProjectData) => {
    try {
      setSaveStatus('saving');

      // Replace this with your actual API call (Supabase/Firebase/NextAuth)
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData),
      });

      if (!response.ok) throw new Error('Save failed');

      setSaveStatus('saved');
      setLastSavedTime(new Date());
    } catch (error) {
      console.error(error);
      setSaveStatus('error');
    }
  }, [projectId]);

  // The Debounce Logic
  useEffect(() => {
    // 1. Set a timer to save after 2 seconds of inactivity
    const timer = setTimeout(() => {
      saveToDatabase(data);
    }, 2000);

    // 2. If 'data' changes before 2s, React cancels the old timer
    return () => clearTimeout(timer);
  }, [data, saveToDatabase]);

  return { saveStatus, lastSavedTime };
}