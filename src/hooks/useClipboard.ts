import { useState, useCallback, useEffect } from 'react';
import { useReactFlow, Node, Edge, getConnectedEdges } from 'reactflow';

export function useClipboard() {
  const { getNodes, setNodes, getEdges, setEdges, addNodes, addEdges } = useReactFlow();
  const [buffer, setBuffer] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);

  // 📋 COPY
  const copy = useCallback(() => {
    const allNodes = getNodes();
    const allEdges = getEdges();

    // 1. Get Selected Nodes
    const selectedNodes = allNodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    // 2. Get Internal Edges (Edges where BOTH source and target are selected)
    // We don't want to copy edges that point to non-copied nodes.
    const selectedEdges = allEdges.filter((edge) => {
        const sourceNode = selectedNodes.find(n => n.id === edge.source);
        const targetNode = selectedNodes.find(n => n.id === edge.target);
        return sourceNode && targetNode;
    });

    // 3. Store in Buffer (Clipboard)
    setBuffer({ nodes: selectedNodes, edges: selectedEdges });
    // console.log("Copied to buffer:", selectedNodes.length, "nodes");
  }, [getNodes, getEdges]);

  // 📋 PASTE
  const paste = useCallback(() => {
    if (!buffer) return;

    // Map old IDs to new IDs so we can reconnect edges correctly
    const idMap: Record<string, string> = {};

    // 1. Create New Nodes
    const newNodes = buffer.nodes.map((node) => {
      const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      idMap[node.id] = newId; // Map Old -> New

      return {
        ...node,
        id: newId,
        selected: true, // Select the new copies
        position: {
          x: node.position.x + 50, // Offset slightly
          y: node.position.y + 50
        },
        data: { ...node.data }, // Deep copy data if needed
      };
    });

    // 2. Create New Edges (Remapped)
    const newEdges = buffer.edges.map((edge) => ({
      ...edge,
      id: `edge-${Date.now()}-${Math.random()}`,
      source: idMap[edge.source], // Point to new ID
      target: idMap[edge.target], // Point to new ID
      selected: true,
    }));

    // 3. Deselect current nodes to focus on the pasted ones
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));

    // 4. Add to Graph
    addNodes(newNodes);
    addEdges(newEdges);

  }, [buffer, addNodes, addEdges, setNodes]);

  // 📋 DUPLICATE (Copy + Paste)
  const duplicate = useCallback(() => {
    const allNodes = getNodes();
    const selectedNodes = allNodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    // Immediate clone logic (bypassing buffer state to be instant)
    const idMap: Record<string, string> = {};

    const newNodes = selectedNodes.map((node) => {
      const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      idMap[node.id] = newId;
      return {
        ...node,
        id: newId,
        selected: true,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        data: { ...node.data },
      };
    });

    // Handle connected edges logic similarly if needed,
    // but often Duplicate just clones the node unless a group is selected.
    setNodes((nds) => [
        ...nds.map((n) => ({ ...n, selected: false })),
        ...newNodes
    ]);

  }, [getNodes, setNodes]);

  // 🎹 SHORTCUTS LISTENER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const cmd = e.metaKey || e.ctrlKey;

      if (cmd && e.key === 'c') {
        e.preventDefault();
        copy();
      }
      if (cmd && e.key === 'v') {
        e.preventDefault();
        paste();
      }
      if (cmd && e.key === 'd') {
        e.preventDefault();
        duplicate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copy, paste, duplicate]);

  return { copy, paste, duplicate };
}