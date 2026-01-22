import React from 'react';
import { useReactFlow, Panel } from 'reactflow';
import { ZoomIn, ZoomOut, Maximize, RotateCcw, MousePointer2 } from 'lucide-react';
import { Button } from "@/components/ui/Button";

export default function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <Panel position="bottom-center" className="mb-8">
      <div className="flex items-center gap-1 p-1.5 bg-[#151921] border border-gray-800 rounded-xl shadow-2xl shadow-black/50 backdrop-blur-md">

        {/* Navigation Group */}
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => zoomOut()} title="Zoom Out">
              <ZoomOut size={16} />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => fitView()} title="Fit to Screen">
              <Maximize size={16} />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => zoomIn()} title="Zoom In">
              <ZoomIn size={16} />
            </Button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-700 mx-1" />

        {/* Tools Group (Placeholder for logic) */}
        <div className="flex items-center gap-1">
            <Button variant="surface" size="icon" className="text-cyan-400 bg-cyan-900/20 border-cyan-800" title="Select Mode">
               <MousePointer2 size={16} />
            </Button>
            <Button variant="ghost" size="icon" disabled title="Undo (Ctrl+Z)">
               <RotateCcw size={16} />
            </Button>
        </div>

      </div>
    </Panel>
  );
}