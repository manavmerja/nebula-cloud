import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import {
  Server,
  Database,
  HardDrive,
  Network,
  CloudCog,
  Box,
  Shield,
  Globe,
  Layers,
  Activity,
  Boxes,
  Eye,
  Lock,
  GitBranch,
  Bell,
  Trash2,
} from 'lucide-react';

/* --------------------------------------------------
   AWS SERVICE → ICON + COLOR MAPPER
-------------------------------------------------- */
const getServiceIcon = (label: string) => {
  const l = label.toLowerCase();

  // 🖥 Compute
  if (l.includes('ec2') || l.includes('instance')) {
    return <Server className="w-6 h-6 text-orange-400" />;
  }
  if (l.includes('lambda')) {
    return <Box className="w-6 h-6 text-orange-400" />;
  }

  // 📦 Containers
  if (l.includes('ecs') || l.includes('eks') || l.includes('fargate')) {
    return <Boxes className="w-6 h-6 text-orange-300" />;
  }

  // 💾 Storage
  if (l.includes('s3') || l.includes('bucket')) {
    return <HardDrive className="w-6 h-6 text-green-400" />;
  }

  // 🗄 Databases
  if (l.includes('rds') || l.includes('aurora')) {
    return <Database className="w-6 h-6 text-blue-400" />;
  }
  if (l.includes('dynamo')) {
    return <Database className="w-6 h-6 text-indigo-400" />;
  }

  // 🌐 Networking
  if (l.includes('vpc') || l.includes('subnet')) {
    return <Globe className="w-6 h-6 text-purple-400" />;
  }
  if (l.includes('load balancer') || l.includes('alb') || l.includes('elb')) {
    return <Network className="w-6 h-6 text-pink-400" />;
  }
  if (l.includes('api gateway')) {
    return <Activity className="w-6 h-6 text-cyan-400" />;
  }
  if (l.includes('cloudfront')) {
    return <Layers className="w-6 h-6 text-sky-400" />;
  }

  // 🔄 Messaging & Events
  if (l.includes('sqs') || l.includes('sns') || l.includes('eventbridge')) {
    return <Bell className="w-6 h-6 text-yellow-400" />;
  }

  // 🔐 Security
  if (l.includes('iam') || l.includes('security group') || l.includes('waf')) {
    return <Shield className="w-6 h-6 text-red-400" />;
  }
  if (l.includes('kms') || l.includes('secrets')) {
    return <Lock className="w-6 h-6 text-red-300" />;
  }

  // 🔍 Observability
  if (l.includes('cloudwatch') || l.includes('x-ray')) {
    return <Eye className="w-6 h-6 text-emerald-400" />;
  }

  // 🚀 DevOps
  if (l.includes('codepipeline') || l.includes('codebuild')) {
    return <GitBranch className="w-6 h-6 text-indigo-400" />;
  }

  // ☁ Default
  return <CloudCog className="w-6 h-6 text-gray-400" />;
};

/* --------------------------------------------------
   CLOUD SERVICE NODE
-------------------------------------------------- */
function CloudServiceNode({
  id,
  data,
}: {
  id: string;
  data: { label: string };
}) {
  const { setNodes } = useReactFlow();
  const icon = getServiceIcon(data.label);

  const deleteNode = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
  };

  return (
    <div
      className="
        group relative flex flex-col items-center justify-center
        p-2 rounded-lg min-w-[110px]
        bg-gray-900/90 border border-gray-700
        shadow-xl backdrop-blur-sm
        hover:border-blue-500 transition
      "
    >
      {/* ❌ Delete Button */}
      <button
        onClick={deleteNode}
        className="
          absolute -top-2 -right-2
          bg-red-600 hover:bg-red-700
          p-1 rounded-full shadow-md
          opacity-0 scale-90
          group-hover:opacity-100 group-hover:scale-100
          transition-all
        "
      >
        <Trash2 size={12} className="text-white" />
      </button>

      {/* 🎯 Input Handles */}
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-600" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-600" />

      {/* 🔷 Icon */}
      <div className="mb-2 p-2 bg-black/50 rounded-full border border-gray-800">
        {icon}
      </div>

      {/* 🏷 Label */}
      <span className="text-[10px] font-medium text-gray-300 text-center leading-tight px-1">
        {data.label}
      </span>

      {/* 🚀 Output Handles */}
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-gray-600" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-gray-600" />
    </div>
  );
}

export default memo(CloudServiceNode);
