import React from 'react';
import { Server, Database, HardDrive, Globe, Box, Shield } from 'lucide-react';

export default function Sidebar() {
  
  // Jab user drag start karega, hum data set karenge
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-gray-900/90 border-r border-gray-800 p-4 flex flex-col gap-6 backdrop-blur-md h-full z-50">
      
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Service Palette
        </h2>
        <p className="text-xs text-gray-400">Drag services to the canvas</p>
      </div>

      {/* Categories */}
      
      {/* 1. COMPUTE */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Compute</h3>
        <div className="flex flex-col gap-2">
            <div 
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-grab hover:bg-gray-700/50 hover:border-blue-500 border border-transparent transition-all"
                onDragStart={(event) => onDragStart(event, 'cloudNode', 'EC2 Instance')}
                draggable
            >
                <Server size={18} className="text-orange-400" />
                <span className="text-sm text-gray-200">EC2 Instance</span>
            </div>
            
            <div 
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-grab hover:bg-gray-700/50 hover:border-blue-500 border border-transparent transition-all"
                onDragStart={(event) => onDragStart(event, 'cloudNode', 'Lambda Function')}
                draggable
            >
                <Box size={18} className="text-orange-400" />
                <span className="text-sm text-gray-200">Lambda</span>
            </div>
        </div>
      </div>

      {/* 2. STORAGE */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Storage</h3>
        <div className="flex flex-col gap-2">
            <div 
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-grab hover:bg-gray-700/50 hover:border-green-500 border border-transparent transition-all"
                onDragStart={(event) => onDragStart(event, 'cloudNode', 'S3 Bucket')}
                draggable
            >
                <HardDrive size={18} className="text-green-400" />
                <span className="text-sm text-gray-200">S3 Bucket</span>
            </div>
        </div>
      </div>

      {/* 3. DATABASE */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Database</h3>
        <div className="flex flex-col gap-2">
            <div 
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-grab hover:bg-gray-700/50 hover:border-blue-500 border border-transparent transition-all"
                onDragStart={(event) => onDragStart(event, 'cloudNode', 'RDS Database')}
                draggable
            >
                <Database size={18} className="text-blue-400" />
                <span className="text-sm text-gray-200">RDS</span>
            </div>
            <div 
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-grab hover:bg-gray-700/50 hover:border-blue-500 border border-transparent transition-all"
                onDragStart={(event) => onDragStart(event, 'cloudNode', 'DynamoDB')}
                draggable
            >
                <Database size={18} className="text-blue-400" />
                <span className="text-sm text-gray-200">DynamoDB</span>
            </div>
        </div>
      </div>

       {/* 4. NETWORK */}
       <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Network & Security</h3>
        <div className="flex flex-col gap-2">
            <div 
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-grab hover:bg-gray-700/50 hover:border-purple-500 border border-transparent transition-all"
                onDragStart={(event) => onDragStart(event, 'cloudNode', 'VPC')}
                draggable
            >
                <Globe size={18} className="text-purple-400" />
                <span className="text-sm text-gray-200">VPC Network</span>
            </div>
             <div 
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg cursor-grab hover:bg-gray-700/50 hover:border-red-500 border border-transparent transition-all"
                onDragStart={(event) => onDragStart(event, 'cloudNode', 'Security Group')}
                draggable
            >
                <Shield size={18} className="text-red-400" />
                <span className="text-sm text-gray-200">Security Group</span>
            </div>
        </div>
      </div>

    </aside>
  );
}