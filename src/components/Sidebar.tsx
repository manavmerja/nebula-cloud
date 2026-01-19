import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Star,
  Search
} from 'lucide-react';
import { getCloudIconPath } from '@/utils/iconMap'; // <--- Import your helper

/* ---------------- DATA STRUCTURE ---------------- */
// We removed the Lucide imports and 'icon/color' props.
// The icon is now derived dynamically from the label.
const awsServices = [
  {
    category: 'Compute',
    items: ['EC2 Instance', 'Lambda Function'],
  },
  {
    category: 'Containers',
    items: ['ECS Cluster', 'EKS Cluster', 'Fargate'],
  },
  {
    category: 'Storage',
    items: ['S3 Bucket'],
  },
  {
    category: 'Database',
    items: ['RDS Database', 'Aurora', 'DynamoDB'],
  },
  {
    category: 'Networking',
    items: ['VPC', 'Application Load Balancer', 'API Gateway', 'CloudFront'],
  },
  {
    category: 'Messaging & Events',
    items: ['SQS Queue', 'SNS Topic', 'EventBridge'],
  },
  {
    category: 'Security',
    items: ['IAM Role', 'Security Group', 'WAF', 'KMS', 'Secrets Manager'],
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
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const flatList = useRef<HTMLDivElement[]>([]);

  /* ---------- FILTER ---------- */
  const filtered = useMemo(() => {
    return awsServices.map((section) => ({
      ...section,
      items: section.items.filter((label) =>
        label.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter(section => section.items.length > 0); // Hide empty sections
  }, [search]);

  /* ---------- KEYBOARD NAV ---------- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setActiveIndex((i) => Math.min(i + 1, flatList.current.length - 1));
      }
      if (e.key === 'ArrowUp') {
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      // Enter key logic could trigger drag start or selection if needed
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIndex]);

  /* ---------- DRAG HANDLER ---------- */
  const onDragStart = (event: React.DragEvent, label: string) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ type: 'cloudNode', label })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  /* ---------- TOGGLE FAVORITE ---------- */
  const toggleFavorite = (label: string) => {
    setFavorites((f) =>
      f.includes(label) ? f.filter((x) => x !== label) : [...f, label]
    );
  };

  // Reset index counter for flatList ref assignment
  let globalIndex = -1;

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col shadow-2xl z-50">

      {/* Header */}
      <div className="p-5 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Service Catalog</h2>

        {/* Search Input */}
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-black/40 border border-gray-700 rounded-lg text-gray-200 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Scrollable List */}
      <div
        className="
          flex-1
          overflow-y-auto
          overflow-x-hidden
          p-4 space-y-6
          scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent
        "
        onWheel={(e) => e.stopPropagation()}
      >

        {/* ⭐ Favorites Section */}
        {favorites.length > 0 && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <h3 className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Star size={10} fill="currentColor" /> Favorites
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {favorites.map((label) => {
                 const iconPath = getCloudIconPath(label);
                 return (
                  <div
                    key={`fav-${label}`}
                    draggable
                    onDragStart={(e) => onDragStart(e, label)}
                    className="flex items-center gap-3 p-2 bg-gray-800/40 border border-yellow-500/20 hover:border-yellow-500/50 rounded-lg cursor-grab active:cursor-grabbing hover:bg-yellow-500/10 transition-all group"
                  >
                    <img src={iconPath} alt={label} className="w-5 h-5 object-contain" />
                    <span className="text-xs font-medium text-gray-300 group-hover:text-yellow-200">{label}</span>
                  </div>
                );
              })}
            </div>
            <div className="h-px bg-gray-800 my-4" />
          </div>
        )}

        {/* 📂 Categories & Items */}
        {filtered.map((section) => (
          <div key={section.category}>
            {/* Collapse Toggle */}
            <button
              onClick={() =>
                setCollapsed((c) => ({
                  ...c,
                  [section.category]: !c[section.category],
                }))
              }
              className="flex items-center justify-between w-full text-[11px] font-bold text-gray-500 hover:text-gray-300 uppercase tracking-widest mb-2 transition-colors group"
            >
              {section.category}
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 text-gray-600 group-hover:text-cyan-400 ${
                  collapsed[section.category] ? '-rotate-90' : ''
                }`}
              />
            </button>

            {/* List Items */}
            {!collapsed[section.category] && (
              <div className="space-y-1 ml-1 pl-2 border-l border-gray-800">
                {section.items.map((label) => {
                  globalIndex++;
                  const currentIndex = globalIndex; // Capture for closure
                  const iconPath = getCloudIconPath(label); // Get the real AWS Icon

                  return (
                    <div
                      key={label}
                      ref={(el) => { if (el) flatList.current[currentIndex] = el; }}
                      draggable
                      onDragStart={(e) => onDragStart(e, label)}
                      onMouseDown={() => setActiveIndex(currentIndex)}
                      className={`
                        relative group flex items-center gap-3 p-2 rounded-lg cursor-grab active:cursor-grabbing
                        transition-all duration-200 border border-transparent
                        ${activeIndex === currentIndex ? 'bg-gray-800 border-gray-700' : 'hover:bg-gray-800/50 hover:border-gray-700/50'}
                      `}
                    >
                      {/* Icon Container with Glow */}
                      <div className="w-6 h-6 flex items-center justify-center bg-gray-900 rounded p-0.5 border border-gray-700 group-hover:border-gray-500 transition-colors">
                        <img
                            src={iconPath}
                            alt={label}
                            className="w-full h-full object-contain"
                            draggable={false}
                        />
                      </div>

                      {/* Label */}
                      <span className="text-xs text-gray-400 group-hover:text-white transition-colors flex-1">
                        {label}
                      </span>

                      {/* Favorite Button (Hidden until hover) */}
                      <Star
                        size={12}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(label);
                        }}
                        className={`
                          opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-125
                          ${favorites.includes(label) ? 'text-yellow-400 opacity-100' : 'text-gray-600 hover:text-yellow-400'}
                        `}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {filtered.length === 0 && (
            <div className="text-center py-10 opacity-50">
                <p className="text-xs text-gray-500">No services found.</p>
            </div>
        )}

      </div>
    </aside>
  );
}