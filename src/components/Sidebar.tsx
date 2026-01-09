import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Server,
  Database,
  HardDrive,
  Globe,
  Box,
  Shield,
  Network,
  Layers,
  Activity,
  GitBranch,
  Lock,
  Eye,
  Boxes,
  Bell,
  Star,
  ChevronDown,
} from 'lucide-react';

/* ---------------- AWS SERVICE DATA ---------------- */

const awsServices = [
  {
    category: 'Compute',
    items: [
      { label: 'EC2 Instance', icon: Server, color: 'text-orange-400' },
      { label: 'Lambda Function', icon: Box, color: 'text-orange-400' },
    ],
  },
  {
    category: 'Containers',
    items: [
      { label: 'ECS Cluster', icon: Boxes, color: 'text-orange-300' },
      { label: 'EKS Cluster', icon: Boxes, color: 'text-orange-300' },
      { label: 'Fargate', icon: Boxes, color: 'text-orange-300' },
    ],
  },
  {
    category: 'Storage',
    items: [{ label: 'S3 Bucket', icon: HardDrive, color: 'text-green-400' }],
  },
  {
    category: 'Database',
    items: [
      { label: 'RDS Database', icon: Database, color: 'text-blue-400' },
      { label: 'Aurora', icon: Database, color: 'text-blue-400' },
      { label: 'DynamoDB', icon: Database, color: 'text-indigo-400' },
    ],
  },
  {
    category: 'Networking',
    items: [
      { label: 'VPC', icon: Globe, color: 'text-purple-400' },
      { label: 'Application Load Balancer', icon: Network, color: 'text-pink-400' },
      { label: 'API Gateway', icon: Activity, color: 'text-cyan-400' },
      { label: 'CloudFront', icon: Layers, color: 'text-sky-400' },
    ],
  },
  {
    category: 'Messaging & Events',
    items: [
      { label: 'SQS Queue', icon: Bell, color: 'text-yellow-400' },
      { label: 'SNS Topic', icon: Bell, color: 'text-yellow-400' },
      { label: 'EventBridge', icon: Activity, color: 'text-yellow-300' },
    ],
  },
  {
    category: 'Security',
    items: [
      { label: 'IAM Role', icon: Shield, color: 'text-red-400' },
      { label: 'Security Group', icon: Shield, color: 'text-red-400' },
      { label: 'WAF', icon: Shield, color: 'text-red-500' },
      { label: 'KMS', icon: Lock, color: 'text-red-300' },
      { label: 'Secrets Manager', icon: Lock, color: 'text-red-300' },
    ],
  },
  {
    category: 'Observability',
    items: [
      { label: 'CloudWatch', icon: Eye, color: 'text-emerald-400' },
      { label: 'X-Ray', icon: Eye, color: 'text-emerald-300' },
    ],
  },
  {
    category: 'DevOps',
    items: [
      { label: 'CodePipeline', icon: GitBranch, color: 'text-indigo-400' },
      { label: 'CodeBuild', icon: GitBranch, color: 'text-indigo-400' },
    ],
  },
];

/* ---------------- SIDEBAR ---------------- */

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
      items: section.items.filter((i) =>
        i.label.toLowerCase().includes(search.toLowerCase())
      ),
    }));
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
      if (e.key === 'Enter') {
        flatList.current[activeIndex]?.dispatchEvent(
          new MouseEvent('mousedown', { bubbles: true })
        );
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIndex]);

  /* ---------- DRAG ---------- */
  const onDragStart = (event: React.DragEvent, label: string) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ type: 'cloudNode', label })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  /* ---------- FAVORITES ---------- */
  const toggleFavorite = (label: string) => {
    setFavorites((f) =>
      f.includes(label) ? f.filter((x) => x !== label) : [...f, label]
    );
  };

  let index = -1;

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col">

      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-white">AWS Services</h2>

        {/* 🔍 Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services..."
          className="mt-3 w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-200 outline-none focus:border-blue-500"
        />
      </div>

      {/* Scroll Area */}
      <div
  className="
    flex-1
    overflow-y-auto
    overflow-x-hidden
    overscroll-contain
    px-4 py-4 space-y-6
  "
  onWheel={(e) => e.stopPropagation()}
>


        {/* ⭐ Favorites */}
        {favorites.length > 0 && (
          <div>
            <h3 className="text-xs text-yellow-400 mb-3 uppercase">Favorites</h3>
            {favorites.map((label) => (
              <div
                key={label}
                draggable
                onDragStart={(e) => onDragStart(e, label)}
                className="p-3 bg-gray-800 rounded-lg text-sm text-gray-200 cursor-grab"
              >
                ⭐ {label}
              </div>
            ))}
          </div>
        )}

        {/* Categories */}
        {filtered.map((section) => (
          <div key={section.category}>
            {/* Collapse */}
            <button
              onClick={() =>
                setCollapsed((c) => ({
                  ...c,
                  [section.category]: !c[section.category],
                }))
              }
              className="flex items-center justify-between w-full text-xs text-gray-400 uppercase mb-3"
            >
              {section.category}
              <ChevronDown
                size={14}
                className={`transition ${
                  collapsed[section.category] ? '-rotate-90' : ''
                }`}
              />
            </button>

            {!collapsed[section.category] &&
              section.items.map(({ label, icon: Icon, color }) => {
                index++;
                return (
                  <div
                    key={label}
                    ref={(el) => el && (flatList.current[index] = el)}
                    draggable
                    onDragStart={(e) => onDragStart(e, label)}
                    onMouseDown={() => setActiveIndex(index)}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg cursor-grab
                      bg-gray-800/60 border
                      ${activeIndex === index ? 'border-blue-500' : 'border-transparent'}
                      hover:border-blue-500 transition
                    `}
                  >
                    <Icon size={18} className={color} />
                    <span className="text-sm text-gray-200 flex-1">{label}</span>

                    <Star
                      size={14}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(label);
                      }}
                      className={`cursor-pointer ${
                        favorites.includes(label)
                          ? 'text-yellow-400'
                          : 'text-gray-500'
                      }`}
                    />
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </aside>
  );
}
