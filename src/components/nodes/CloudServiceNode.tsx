import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import {
    Server,       // EC2 ke liye
    Database,     // RDS/DB ke liye
    HardDrive,    // S3/Storage ke liye
    Network,      // Load Balancer/VPC ke liye
    CloudCog,     // Default/Generic ke liye
} from 'lucide-react';

// --- HELPER FUNCTION: Icon Picker ---
// Ye function label padh kar sahi icon return karega
const getServiceIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes('ec2') || lowerLabel.includes('instance') || lowerLabel.includes('server')) {
        return <Server className="w-6 h-6 text-orange-400" />; // AWS EC2 Orange color
    }
    if (lowerLabel.includes('rds') || lowerLabel.includes('database') || lowerLabel.includes('sql')) {
        return <Database className="w-6 h-6 text-blue-400" />; // AWS RDS Blue color
    }
    if (lowerLabel.includes('s3') || lowerLabel.includes('bucket') || lowerLabel.includes('storage')) {
        return <HardDrive className="w-6 h-6 text-green-400" />; // S3 Greenish
    }
    if (lowerLabel.includes('load balancer') || lowerLabel.includes('elb') || lowerLabel.includes('alb')) {
        return <Network className="w-6 h-6 text-purple-400" />; // LB Purple
    }

    // Agar kuch match nahi hua toh default icon
    return <CloudCog className="w-6 h-6 text-gray-400" />;
};

function CloudServiceNode({ data }: { data: { label: string } }) {
    const icon = getServiceIcon(data.label);

    return (
        // Node Container - Professional Diagram Style
        // Chhota size, rounded corners, subtle border
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-900/90 border border-gray-700 shadow-xl backdrop-blur-sm min-w-[100px] hover:border-blue-500 transition-colors">

            {/* Input Handle (Top) - For architecture diagrams, top-down or left-right works. Let's add all 4 for flexibility */}
            <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-600" />
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-600" />

            {/* Icon Section */}
            <div className="mb-2 p-2 bg-black/50 rounded-full border border-gray-800">
                {icon}
            </div>

            {/* Label Section */}
            <span className="text-[10px] font-medium text-gray-300 text-center leading-tight px-1">
                {data.label}
            </span>

            {/* Output Handle (Bottom & Right) */}
            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-gray-600" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-gray-600" />
        </div>
    );
}

export default memo(CloudServiceNode);