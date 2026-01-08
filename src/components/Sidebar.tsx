'use client';

import React, { useState } from 'react';
import {
  Server,
  Database,
  HardDrive,
  Globe,
  Box,
  Shield,
  Network,
  Key,
  Zap,
  Mail,
  BarChart3,
  Lock,
  Cable,
  Settings,
  Search,
  ChevronDown,
} from 'lucide-react';

interface SidebarProps {
  isDark: boolean;
}

interface ServiceItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export default function Sidebar({ isDark }: SidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string>('compute');
  const [searchQuery, setSearchQuery] = useState('');

  // Jab user drag start karega, hum data set karenge
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const categories = {
    compute: {
      name: 'Compute',
      icon: Server,
      services: [
        { id: 'ec2', name: 'EC2 Instance', icon: Server, color: 'text-orange-400', description: 'Scalable virtual servers' },
        { id: 'lambda', name: 'Lambda', icon: Zap, color: 'text-orange-400', description: 'Serverless compute' },
        { id: 'ecs', name: 'ECS Container', icon: Box, color: 'text-orange-400', description: 'Container orchestration' },
        { id: 'apprunner', name: 'App Runner', icon: Zap, color: 'text-orange-400', description: 'Container hosting' },
      ],
    },
    storage: {
      name: 'Storage',
      icon: HardDrive,
      services: [
        { id: 's3', name: 'S3 Bucket', icon: HardDrive, color: 'text-green-400', description: 'Object storage' },
        { id: 'ebs', name: 'EBS Volume', icon: Database, color: 'text-green-400', description: 'Block storage' },
        { id: 'efs', name: 'EFS', icon: Cable, color: 'text-green-400', description: 'File storage' },
        { id: 'glacier', name: 'Glacier', icon: HardDrive, color: 'text-green-400', description: 'Archive storage' },
      ],
    },
    database: {
      name: 'Database',
      icon: Database,
      services: [
        { id: 'rds', name: 'RDS', icon: Database, color: 'text-red-400', description: 'Relational database' },
        { id: 'dynamodb', name: 'DynamoDB', icon: Database, color: 'text-red-400', description: 'NoSQL database' },
        { id: 'elasticache', name: 'ElastiCache', icon: Zap, color: 'text-red-400', description: 'In-memory cache' },
        { id: 'documentdb', name: 'DocumentDB', icon: Database, color: 'text-red-400', description: 'MongoDB-compatible' },
      ],
    },
    networking: {
      name: 'Networking',
      icon: Globe,
      services: [
        { id: 'vpc', name: 'VPC', icon: Network, color: 'text-blue-400', description: 'Virtual private cloud' },
        { id: 'elb', name: 'Load Balancer', icon: Globe, color: 'text-blue-400', description: 'Traffic distribution' },
        { id: 'nat', name: 'NAT Gateway', icon: Network, color: 'text-blue-400', description: 'Network translation' },
        { id: 'route53', name: 'Route 53', icon: Globe, color: 'text-blue-400', description: 'DNS & routing' },
        { id: 'cloudfront', name: 'CloudFront', icon: Zap, color: 'text-blue-400', description: 'CDN distribution' },
      ],
    },
    security: {
      name: 'Security & Identity',
      icon: Shield,
      services: [
        { id: 'iam', name: 'IAM', icon: Key, color: 'text-purple-400', description: 'Access management' },
        { id: 'secretsmanager', name: 'Secrets Manager', icon: Lock, color: 'text-purple-400', description: 'Secret storage' },
        { id: 'kms', name: 'KMS', icon: Lock, color: 'text-purple-400', description: 'Key management' },
        { id: 'acm', name: 'ACM', icon: Shield, color: 'text-purple-400', description: 'SSL certificates' },
        { id: 'waf', name: 'WAF', icon: Shield, color: 'text-purple-400', description: 'Web application firewall' },
      ],
    },
    monitoring: {
      name: 'Monitoring & Analytics',
      icon: BarChart3,
      services: [
        { id: 'cloudwatch', name: 'CloudWatch', icon: BarChart3, color: 'text-yellow-400', description: 'Monitoring & logs' },
        { id: 'xray', name: 'X-Ray', icon: BarChart3, color: 'text-yellow-400', description: 'Trace analysis' },
        { id: 'cloudtrail', name: 'CloudTrail', icon: BarChart3, color: 'text-yellow-400', description: 'Audit logging' },
      ],
    },
  };

  const filteredCategories = Object.entries(categories).map(([key, category]) => ({
    key,
    ...category,
    services: category.services.filter((service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  return (
    <aside
      className={`
        w-72 border-r flex flex-col h-full backdrop-blur-md overflow-hidden
        ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}
      `}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2
          className={`
            text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent
          `}
        >
          Service Palette
        </h2>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Drag & drop to add to canvas
        </p>
      </div>

      {/* Search Bar */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg
            ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
          `}
        >
          <Search size={16} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`
              flex-1 bg-transparent outline-none text-sm
              ${isDark ? 'text-gray-200 placeholder-gray-600' : 'text-gray-700 placeholder-gray-400'}
            `}
          />
        </div>
      </div>

      {/* Services List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map((category) => (
          <div key={category.key} className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            {/* Category Header */}
            <button
              onClick={() =>
                setExpandedCategory(
                  expandedCategory === category.key ? '' : category.key
                )
              }
              className={`
                w-full flex items-center justify-between px-4 py-3 font-semibold text-sm transition-all
                ${isDark
                  ? 'text-gray-300 hover:bg-gray-800/50'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {category.icon &&
                  React.createElement(category.icon, {
                    size: 16,
                    className: 'text-blue-400',
                  })}
                <span>{category.name}</span>
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  expandedCategory === category.key ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Services */}
            {expandedCategory === category.key && (
              <div className="px-2 py-2">
                {category.services.length > 0 ? (
                  category.services.map((service) => (
                    <div
                      key={service.id}
                      draggable
                      onDragStart={(event) =>
                        onDragStart(event, 'cloudNode', service.name)
                      }
                      className={`
                        flex items-start gap-3 p-3 mb-2 rounded-lg cursor-grab
                        transition-all active:cursor-grabbing
                        ${isDark
                          ? 'bg-gray-800/50 hover:bg-gray-700 border border-gray-700 hover:border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-blue-400'
                        }
                      `}
                    >
                      {React.createElement(service.icon, {
                        size: 18,
                        className: `${service.color} flex-shrink-0 mt-0.5`,
                      })}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}
                        >
                          {service.name}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            isDark ? 'text-gray-500' : 'text-gray-500'
                          }`}
                        >
                          {service.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p
                    className={`text-xs px-3 py-2 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    No services found
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div
        className={`
          p-3 border-t text-xs
          ${isDark
            ? 'bg-gray-800/50 border-gray-800 text-gray-400'
            : 'bg-gray-50 border-gray-200 text-gray-500'
          }
        `}
      >
        <p>💡 Tip: Drag services to canvas and connect them to create infrastructure.</p>
      </div>
    </aside>
  );
}