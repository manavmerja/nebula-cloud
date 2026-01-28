import { useState, useCallback, useEffect } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

export function useUndoRedo() {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);

  // 📸 SNAPSHOT: Call this BEFORE making a change you want to be undoable
  const takeSnapshot = useCallback(() => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    // Push current state to 'past'
    setPast((prev) => {
      // Limit history to last 50 steps to save memory
      const newPast = [...prev, { nodes: currentNodes, edges: currentEdges }];
      if (newPast.length > 50) return newPast.slice(1);
      return newPast;
    });

    // Clear 'future' because we branched off a new timeline
    setFuture([]);
  }, [getNodes, getEdges]);

  // ⏪ UNDO
  const undo = useCallback(() => {
    if (past.length === 0) return;

    const currentState = { nodes: getNodes(), edges: getEdges() };
    const previousState = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture((prev) => [currentState, ...prev]); // Push current to future so we can Redo

    setNodes(previousState.nodes);
    setEdges(previousState.edges);
  }, [past, getNodes, getEdges, setNodes, setEdges]);

  // ⏩ REDO
  const redo = useCallback(() => {
    if (future.length === 0) return;

    const currentState = { nodes: getNodes(), edges: getEdges() };
    const nextState = future[0];
    const newFuture = future.slice(1);

    setFuture(newFuture);
    setPast((prev) => [...prev, currentState]); // Push current to past so we can Undo again

    setNodes(nextState.nodes);
    setEdges(nextState.edges);
  }, [future, getNodes, getEdges, setNodes, setEdges]);

  // 🎹 KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
      }
      // Ctrl+Y or Cmd+Y (Redo)
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        redo();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    takeSnapshot,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}