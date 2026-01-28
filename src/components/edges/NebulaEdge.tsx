import React from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath } from 'reactflow';

export default function NebulaEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  // We use SmoothStep (orthogonal lines) for a cleaner "Circuit Board" look
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* 1. Base Line (Darker Track) */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, strokeWidth: 2, stroke: '#334155' }}
      />

      {/* 2. Glowing "Data Packet" (Animated Circle) */}
      {/* We use a group to apply the glow filter */}
      <g>

        <circle r="3" fill="#22d3ee">
            {/* Native SVG Animation: Follows the path infinitely */}
            <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
        <circle r="3" fill="#22d3ee">
            {/* Native SVG Animation: Follows the path infinitely */}
            <animateMotion dur="2s" begin="1s" repeatCount="indefinite" path={edgePath} />
        </circle>

        {/* Optional: Second trailing packet for dense traffic effect */}
        <circle r="2" fill="#22d3ee" opacity="0.5">
            <animateMotion dur="2s" begin="0.1s" repeatCount="indefinite" path={edgePath} />
        </circle>
      </g>
    </>
  );
}