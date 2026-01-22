import React from 'react';

export default function CustomConnectionLine({ fromX, fromY, toX, toY }: any) {
  return (
    <g>
      {/* The Glow Effect */}
      <path
        fill="none"
        stroke="#22d3ee"
        strokeWidth={6}
        className="opacity-20"
        d={`M${fromX},${fromY} C ${fromX + (toX - fromX) / 2},${fromY} ${toX - (toX - fromX) / 2},${toY} ${toX},${toY}`}
      />
      {/* The Core Line */}
      <path
        fill="none"
        stroke="#22d3ee"
        strokeWidth={2}
        d={`M${fromX},${fromY} C ${fromX + (toX - fromX) / 2},${fromY} ${toX - (toX - fromX) / 2},${toY} ${toX},${toY}`}
      />
      {/* The Target Dot */}
      <circle cx={toX} cy={toY} r={4} fill="#0F1117" stroke="#22d3ee" strokeWidth={2} />
    </g>
  );
}