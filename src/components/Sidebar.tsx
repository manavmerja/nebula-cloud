import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  ChevronDown, Star, Search, GripVertical,
  Cpu, Globe, HardDrive, Database, Box, MessageSquare, Shield, Eye, GitBranch, LayoutGrid
} from 'lucide-react';
import { getCloudIconPath } from '@/utils/iconMap';
import { motion, AnimatePresence } from 'framer-motion';

/* ---------------- ICONS FOR CATEGORIES ---------------- */
const categoryIcons: Record<string, React.ReactNode> = {
  'Compute': <Cpu size={20} />,
  'Networking': <Globe size={20} />,
  'Storage': <HardDrive size={20} />,
  'Database': <Database size={20} />,
  'Containers': <Box size={20} />,
  'Messaging': <MessageSquare size={20} />,
  'Security': <Shield size={20} />,
  'Observability': <Eye size={20} />,
  'DevOps': <GitBranch size={20} />,
};

/* ---------------- DATA STRUCTURE ---------------- */
const awsServices = [
  {
    category: 'Compute',
    items: ['EC2 Instance', 'Lambda Function', 'Fargate', 'App Runner'],
  },
  {
    category: 'Networking',
    items: [
        'VPC', 'Public Subnet', 'Private Subnet', 'Internet Gateway', 'NAT Gateway',
        'VPC Endpoint', 'Route Table', 'Application Load Balancer', 'API Gateway', 'CloudFront'
    ],
  },
  {
    category: 'Storage',
    items: ['S3 Bucket', 'Glacier Archive', 'EFS File System'],
  },
  {
    category: 'Database',
    items: ['RDS Database', 'Aurora', 'DynamoDB', 'ElastiCache Redis', 'ElastiCache Memcached'],
  },
  {
    category: 'Containers',
    items: ['ECS Cluster', 'EKS Cluster'],
  },
  {
    category: 'Messaging',
    items: ['SQS Queue', 'SNS Topic', 'EventBridge'],
  },
  {
    category: 'Security',
    items: ['IAM Role', 'Security Group', 'Network ACL', 'WAF', 'KMS Key', 'Secrets Manager'],
  },
  {
    category: 'Observability',
    items: ['CloudWatch', 'X-Ray'],
  },
  {
    category: 'DevOps',
    items: ['CodePipeline', 'CodeBuild'],
  },
];

/* ---------------- SIDEBAR COMPONENT ---------------- */
export default function Sidebar() {
  const [search, setSearch] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ 'Compute': true });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatList = useRef<HTMLDivElement[]>([]);

  // Filter Logic
  const filtered = useMemo(() => {
    return awsServices.map((section) => ({
      ...section,
      items: section.items.filter((label) =>
        label.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter(section => section.items.length > 0);
  }, [search]);

  // Drag Logic
  const onDragStart = (event: React.DragEvent, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'cloudNode', label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleFavorite = (label: string) => {
    setFavorites((f) => f.includes(label) ? f.filter((x) => x !== label) : [...f, label]);
  };

  return (
    <motion.aside
      initial={{ width: '4rem' }}
      animate={{ width: isHovered ? '18rem' : '4rem' }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-screen bg-[#0F1117] border-r border-gray-800 flex flex-col shadow-2xl z-50 overflow-hidden relative group"
    >

      {/* --- PROFESSIONAL HEADER --- */}
      <div className="h-16 flex items-center px-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900 via-[#0F1117] to-[#0F1117] backdrop-blur-xl shrink-0 z-20">

        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">

          {/* 1. Logo Container with Ambient Glow */}
          <div className="relative group/logo min-w-[36px] cursor-pointer">
            {/* The Blur Effect */}
            <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />

            {/* The Icon Box */}
            <div className="relative w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 flex items-center justify-center shadow-xl group-hover/logo:border-cyan-500/30 transition-colors">
               <LayoutGrid size={18} className="text-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.5)]" />
            </div>
          </div>

          {/* 2. Brand Text (Animated) */}
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col justify-center"
          >
            {/* Title with Gradient Text */}
            <h2 className="text-sm font-bold text-white tracking-wide leading-tight">
              Nebula<span className="text-cyan-400">.ai</span>
            </h2>

            {/* Subtitle with Status Dot */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                Architect
              </span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* --- SEARCH (Shrink protected) --- */}
      <div className="px-3 py-4 shrink-0">
        <div className={`relative flex items-center ${isHovered ? 'bg-black/40' : 'bg-transparent'} rounded-lg transition-colors border border-transparent ${isHovered ? 'border-gray-700' : ''}`}>
          <Search className={`min-w-[20px] ml-2 ${isHovered ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
          <motion.input
            layout
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className={`
              w-full bg-transparent border-none outline-none text-sm text-gray-200 placeholder:text-gray-600 ml-2 h-9
              ${!isHovered && 'hidden'}
            `}
          />
        </div>
      </div>

      {/* --- SCROLL AREA (The Fix is Here) --- */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 px-2 pb-10 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
        // 🚨 CRITICAL FIX: Stop the canvas from stealing the scroll event
        onWheel={(e) => e.stopPropagation()}
      >

        {/* ⭐ Favorites */}
        {isHovered && favorites.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 px-2">
              <h3 className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Star size={10} fill="currentColor" /> Favorites
              </h3>
              <div className="space-y-1">
                {favorites.map((label) => (
                    <div key={label} draggable onDragStart={(e) => onDragStart(e, label)} className="flex items-center gap-3 p-2 bg-yellow-500/5 rounded-lg border border-yellow-500/20 cursor-grab hover:bg-yellow-500/10">
                         <img src={getCloudIconPath(label)} alt={label} className="w-4 h-4" />
                         <span className="text-xs text-gray-300 truncate">{label}</span>
                    </div>
                ))}
              </div>
              <div className="h-px bg-gray-800 my-4" />
            </motion.div>
        )}

        {/* 📂 Categories */}
        {filtered.map((section) => (
          <div key={section.category} className="mb-1">
            <button
              onClick={() => {
                  if(!isHovered) setIsHovered(true);
                  setOpenCategories((c) => ({ ...c, [section.category]: !c[section.category] }));
              }}
              className={`
                w-full flex items-center gap-3 p-2 rounded-lg transition-all
                ${!isHovered ? 'justify-center hover:bg-gray-800' : 'justify-between hover:bg-gray-800/50'}
              `}
              title={!isHovered ? section.category : ''}
            >
              <div className="flex items-center gap-3">
                 <div className={`text-gray-400 ${openCategories[section.category] ? 'text-cyan-400' : ''}`}>
                    {categoryIcons[section.category] || <Box size={20}/>}
                 </div>
                 {isHovered && (
                     <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap"
                     >
                        {section.category}
                     </motion.span>
                 )}
              </div>
              {isHovered && (
                <motion.div animate={{ rotate: openCategories[section.category] ? -90 : 0 }}>
                  <ChevronDown size={14} className="text-gray-600"/>
                </motion.div>
              )}
            </button>

            {/* Accordion Content */}
            <AnimatePresence>
              {isHovered && openCategories[section.category] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden ml-9 border-l border-gray-800"
                >
                  <div className="space-y-1 py-1 pl-2">
                    {section.items.map((label) => (
                        <motion.div
                          key={label}
                          draggable
                          onDragStart={(e) => onDragStart(e, label)}
                          whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                          className="flex items-center gap-3 p-1.5 rounded-md cursor-grab active:cursor-grabbing group"
                        >
                          <div className="w-5 h-5 min-w-[20px] flex items-center justify-center bg-gray-900 rounded border border-gray-700">
                             <img src={getCloudIconPath(label)} className="w-3.5 h-3.5 object-contain" draggable={false} />
                          </div>
                          <span className="text-xs text-gray-400 group-hover:text-white transition-colors truncate">
                            {label}
                          </span>
                          <Star
                            size={10}
                            className={`ml-auto opacity-0 group-hover:opacity-100 cursor-pointer ${favorites.includes(label) ? 'text-yellow-400 opacity-100' : 'text-gray-600'}`}
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(label); }}
                          />
                        </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}