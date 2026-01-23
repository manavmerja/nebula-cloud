import React, { useState, useMemo, useRef } from 'react';
import {
  Cpu, Database, ShieldCheck, HardDrive, Server, Globe, Box, Shield,
  Network, Layers, Activity, GitBranch, Bell, Star,
  Search, X, Boxes
} from 'lucide-react';

const awsServices = [
  {
    category: 'Compute',
    id: 'compute',
    icon: Cpu,
    color: 'text-orange-500',
    items: [
      { label: 'EC2 Instance', icon: Server, color: 'text-orange-400' },
      { label: 'Lambda Function', icon: Box, color: 'text-orange-400' },
    ],
  },
  {
    category: 'Containers',
    id: 'containers',
    icon: Boxes,
    color: 'text-blue-500',
    items: [
      { label: 'ECS Cluster', icon: Boxes, color: 'text-orange-300' },
      { label: 'EKS Cluster', icon: Boxes, color: 'text-orange-300' },
      { label: 'Fargate', icon: Boxes, color: 'text-orange-300' },
    ],
  },
  {
    category: 'Storage',
    id: 'storage',
    icon: HardDrive,
    color: 'text-green-500',
    items: [{ label: 'S3 Bucket', icon: HardDrive, color: 'text-green-400' }],
  },
  {
    category: 'Database',
    id: 'database',
    icon: Database,
    color: 'text-blue-600',
    items: [
      { label: 'RDS Database', icon: Database, color: 'text-blue-400' },
      { label: 'Aurora', icon: Database, color: 'text-blue-400' },
      { label: 'DynamoDB', icon: Database, color: 'text-indigo-400' },
    ],
  },
  {
    category: 'Networking',
    id: 'networking',
    icon: Network,
    color: 'text-purple-500',
    items: [
      { label: 'VPC', icon: Globe, color: 'text-purple-400' },
      { label: 'Load Balancer', icon: Network, color: 'text-pink-400' },
      { label: 'API Gateway', icon: Activity, color: 'text-cyan-400' },
      { label: 'CloudFront', icon: Layers, color: 'text-sky-400' },
    ],
  },
  {
    category: 'Messaging',
    id: 'messaging',
    icon: Bell,
    color: 'text-yellow-500',
    items: [
      { label: 'SQS Queue', icon: Bell, color: 'text-yellow-400' },
      { label: 'SNS Topic', icon: Bell, color: 'text-yellow-400' },
    ],
  },
  {
    category: 'Security',
    id: 'security',
    icon: ShieldCheck,
    color: 'text-red-500',
    items: [
      { label: 'IAM Role', icon: Shield, color: 'text-red-400' },
      { label: 'WAF', icon: Shield, color: 'text-red-500' },
    ],
  },
  {
    category: 'DevOps',
    id: 'devops',
    icon: GitBranch,
    color: 'text-indigo-500',
    items: [
      { label: 'CodePipeline', icon: GitBranch, color: 'text-indigo-400' },
    ],
  },
];

export default function CanvaSidebar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Timeout ref for smooth closing
  // eslint-disable-next-line no-undef
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- FILTER LOGIC ---
  const activeItems = useMemo(() => {
    if (!activeCategory) return [];
    const category = awsServices.find(c => c.id === activeCategory);
    if (!category) return [];

    if (!search) return category.items;

    return category.items.filter(item =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeCategory, search]);

  // --- DRAG LOGIC ---
  const onDragStart = (event: React.DragEvent, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: 'cloudNode', label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  // --- FAVORITE LOGIC ---
  const toggleFavorite = (label: string) => {
    setFavorites(prev =>
      prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label]
    );
  };

  // --- MOUSE HANDLERS (Delay logic for smoother UX) ---
  const handleMouseEnter = (catId: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveCategory(catId);
    if (activeCategory !== catId) setSearch('');
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 400);
  };

  const keepOpen = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  return (
    <div
      className="fixed left-0 top-14 bottom-0 z-40 flex h-[calc(100vh-3.5rem)]"
      onMouseLeave={handleMouseLeave}
    >

      {/* ---------------- PART 1: ICON RAIL (Left Strip) ---------------- */}
      <nav className="w-[72px] h-full bg-[#0f172a] border-r border-gray-800 flex flex-col items-center py-4 gap-3 z-50 shadow-xl">

        {awsServices.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onMouseEnter={() => handleMouseEnter(cat.id)}
              className={`
                group relative flex flex-col items-center justify-center 
                w-12 h-12 rounded-xl transition-all duration-300
                ${isActive
                  ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.3)] scale-110'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100 hover:scale-105'
                }
              `}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? cat.color : ''} />

              {!isActive && (
                <span className="
                  absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded 
                  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none 
                  whitespace-nowrap z-50 border border-gray-700
                ">
                  {cat.category}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ---------------- PART 2: SLIDING DRAWER (Content) ---------------- */}
      <div
        className={`
          h-full bg-[#0f172a]/95 backdrop-blur-2xl border-r border-gray-700
          transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
          overflow-hidden flex flex-col shadow-2xl relative
          ${activeCategory ? 'w-[280px] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4'}
        `}
        onMouseEnter={keepOpen}
      >

        {/* --- HEADER SECTION --- */}
        <div className="p-4 border-b border-gray-700/50 bg-[#0f172a]/90 shrink-0 sticky top-0 z-10 backdrop-blur-sm">

          <div className="relative group/search mb-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-blue-400 transition-colors"
            />
            <input
              type="text"
              placeholder={`Search ${activeCategory ? awsServices.find(c => c.id === activeCategory)?.category : ''}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                 w-full bg-gray-900/80 text-sm text-gray-200 pl-10 pr-3 py-2.5 
                 rounded-lg outline-none border border-gray-700 
                 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 
                 placeholder:text-gray-500 transition-all
               "
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeCategory && (() => {
                const CatIcon = awsServices.find(c => c.id === activeCategory)?.icon;
                return CatIcon ? <CatIcon size={16} className="text-gray-400" /> : null;
              })()}
              <h3 className="font-bold text-white text-md tracking-wide">
                {activeCategory ? awsServices.find(c => c.id === activeCategory)?.category : 'Components'}
              </h3>
            </div>

            <button onClick={() => setActiveCategory(null)} className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* --- CONTENT LIST --- */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">

          {favorites.length > 0 && !search && (
            <div className="mb-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 px-2 mb-2 text-[10px] font-bold text-yellow-500/80 uppercase tracking-wider">
                Favorites
              </div>
              {favorites.map(fav => (
                <div key={fav} draggable onDragStart={(e) => onDragStart(e, fav)} className="p-2.5 bg-gray-800/40 rounded-lg flex items-center gap-2 cursor-grab mb-1 border border-transparent hover:border-yellow-500/30 hover:bg-gray-800 transition-all">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-gray-300">{fav}</span>
                </div>
              ))}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-3"></div>
            </div>
          )}

          {activeItems.map((item, idx) => {
            const ItemIcon = item.icon;
            const isFav = favorites.includes(item.label);

            return (
              <div
                key={idx}
                draggable
                onDragStart={(e) => onDragStart(e, item.label)}
                className="
                   group flex items-center justify-between p-3 rounded-lg
                   bg-transparent border border-transparent
                   hover:bg-gray-800 hover:border-gray-600/50 
                   active:scale-[0.98]
                   cursor-grab transition-all duration-200
                 "
              >
                <div className="flex items-center gap-3">
                  <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center 
                      bg-gray-800 border border-gray-700 group-hover:border-gray-500
                      transition-colors ${item.color}
                    `}>
                    <ItemIcon size={16} />
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white font-medium transition-colors">{item.label}</span>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(item.label); }}
                  className={`
                     p-1.5 rounded-md hover:bg-gray-700
                     transition-all duration-200
                     ${isFav ? 'opacity-100 text-yellow-400' : 'opacity-0 group-hover:opacity-100 text-gray-500 hover:text-yellow-400'}
                   `}
                >
                  <Star size={14} className={isFav ? "fill-yellow-400" : ""} />
                </button>
              </div>
            )
          })}

          {activeItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Search size={24} className="mb-2 opacity-50" />
              <span className="text-xs">No components found</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}