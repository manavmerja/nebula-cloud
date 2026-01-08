import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import {
    Server,       // EC2 ke liye
    Database,     // RDS/DB ke liye
    HardDrive,    // S3/Storage ke liye
    Network,      // Load Balancer/VPC ke liye
    CloudCog,     // Default/Generic ke liye
    X,            // Delete button ke liye
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

function CloudServiceNode({ data, id }: { data: { label: string; isDark?: boolean; onDelete?: (id: string) => void }; id: string }) {
    const icon = getServiceIcon(data.label);
    const isDark = data.isDark ?? true;
    const [showDelete, setShowDelete] = useState(false);

    const handleDelete = () => {
        if (data.onDelete) {
            data.onDelete(id);
        }
    };

    return (
        <div 
            className={`relative flex flex-col items-center justify-center p-2 rounded-lg shadow-xl backdrop-blur-sm min-w-[100px] transition-colors ${
                isDark 
                    ? 'bg-gray-900/90 border border-gray-700 hover:border-blue-500' 
                    : 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 hover:border-blue-400 shadow-blue-100/50'
            }`}
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
        >
            {/* Delete Button */}
            {showDelete && (
                <button
                    onClick={handleDelete}
                    className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                    } text-white z-10`}
                >
                    <X size={12} />
                </button>
            )}

            <Handle type="target" position={Position.Top} className={`w-2 h-2 ${isDark ? '!bg-gray-600' : '!bg-blue-400'}`} />
            <Handle type="target" position={Position.Left} className={`w-2 h-2 ${isDark ? '!bg-gray-600' : '!bg-blue-400'}`} />

            <div className={`mb-2 p-2 rounded-full border ${
                isDark ? 'bg-black/50 border-gray-800' : 'bg-white/80 border-blue-200 shadow-sm'
            }`}>
                {icon}
            </div>

            <span className={`text-[10px] font-medium text-center leading-tight px-1 ${
                isDark ? 'text-gray-300' : 'text-blue-800'
            }`}>
                {data.label}
            </span>

            <Handle type="source" position={Position.Right} className={`w-2 h-2 ${isDark ? '!bg-gray-600' : '!bg-blue-400'}`} />
            <Handle type="source" position={Position.Bottom} className={`w-2 h-2 ${isDark ? '!bg-gray-600' : '!bg-blue-400'}`} />
        </div>
    );
}

export default memo(CloudServiceNode);