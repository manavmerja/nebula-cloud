import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';

// Dagre Graph setup
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Node Size (width x height) - Layout calculation ke liye
const nodeWidth = 180;
const nodeHeight = 100;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  
  // 1. Set Graph Direction (TB = Top to Bottom, LR = Left to Right)
  dagreGraph.setGraph({ 
      rankdir: direction, 
      ranker: 'network-simplex', // Better for trees
      marginx: 50,
      marginy: 50
  });

  // 2. Add Nodes to Dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // 3. Add Edges to Dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 4. Calculate Layout
  dagre.layout(dagreGraph);

  // 5. Apply calculated positions back to React Flow nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Fallback: Agar dagre position na de paye
    if(!nodeWithPosition) return node;

    // React Flow ka anchor point top-left hota hai, Dagre ka center hota hai.
    // Isliye hum width/2 minus karte hain taaki center alignment sahi ho.
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // Shift nodes slightly to match React Flow's coordinate system
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges };
};