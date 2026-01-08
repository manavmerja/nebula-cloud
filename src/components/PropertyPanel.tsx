'use client';

import React, { useState } from 'react';
import {
  X,
  Settings,
  Copy,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Plus,
  ChevronDown,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface PropertyPanelProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  selectedNode?: {
    id: string;
    label: string;
    type: string;
    properties: Record<string, any>;
  } | null;
  onPropertyChange?: (nodeId: string, property: string, value: any) => void;
  onDuplicate?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

interface SecurityIssue {
  level: 'critical' | 'warning' | 'info';
  message: string;
}

export default function PropertyPanel({
  isDark,
  isOpen,
  onClose,
  selectedNode,
  onPropertyChange,
  onDuplicate,
  onDelete,
}: PropertyPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    network: false,
    security: false,
    performance: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const securityIssues: SecurityIssue[] = selectedNode ? [
    {
      level: 'critical',
      message: 'EC2 instance allows unrestricted SSH access (0.0.0.0/0)',
    },
    {
      level: 'warning',
      message: 'Consider enabling encryption at rest for this resource',
    },
    {
      level: 'info',
      message: 'Using default VPC. Consider creating custom VPC for isolation',
    },
  ] : [];

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed right-0 top-0 h-full w-96 shadow-2xl border-l z-40
        flex flex-col overflow-hidden
        ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
      `}
    >
      {/* Header */}
      <div
        className={`
          flex items-center justify-between p-4 border-b
          ${isDark ? 'border-gray-800' : 'border-gray-200'}
        `}
      >
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-blue-400" />
          <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
            Properties
          </h3>
        </div>
        <button
          onClick={onClose}
          className={`
            p-1 rounded-lg transition-all
            ${isDark
              ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
            }
          `}
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedNode ? (
          <>
            {/* Node Info */}
            <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div
                className={`
                  p-3 rounded-lg
                  ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
                `}
              >
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Resource Type
                </p>
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                  {selectedNode.label}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  ID: {selectedNode.id}
                </p>
              </div>
            </div>

            {/* General Settings */}
            <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <button
                onClick={() => toggleSection('general')}
                className={`
                  w-full flex items-center justify-between p-4 font-medium transition-all
                  ${isDark ? 'text-gray-300 hover:bg-gray-800/50' : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <span>General Settings</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    expandedSections.general ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSections.general && (
                <div className="px-4 pb-4 space-y-4">
                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Name
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedNode.label}
                      onChange={(e) =>
                        onPropertyChange?.(selectedNode.id, 'name', e.target.value)
                      }
                      className={`
                        w-full mt-2 px-3 py-2 rounded-lg outline-none transition-all
                        ${isDark
                          ? 'bg-gray-800 text-gray-200 border border-gray-700 focus:border-blue-500'
                          : 'bg-gray-50 text-gray-900 border border-gray-300 focus:border-blue-500'
                        }
                      `}
                    />
                  </div>

                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Environment
                    </label>
                    <select
                      defaultValue="production"
                      onChange={(e) =>
                        onPropertyChange?.(selectedNode.id, 'environment', e.target.value)
                      }
                      className={`
                        w-full mt-2 px-3 py-2 rounded-lg outline-none transition-all
                        ${isDark
                          ? 'bg-gray-800 text-gray-200 border border-gray-700 focus:border-blue-500'
                          : 'bg-gray-50 text-gray-900 border border-gray-300 focus:border-blue-500'
                        }
                      `}
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>

                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Instance Type / Size
                    </label>
                    <select
                      defaultValue="t3.medium"
                      onChange={(e) =>
                        onPropertyChange?.(selectedNode.id, 'instanceType', e.target.value)
                      }
                      className={`
                        w-full mt-2 px-3 py-2 rounded-lg outline-none transition-all
                        ${isDark
                          ? 'bg-gray-800 text-gray-200 border border-gray-700 focus:border-blue-500'
                          : 'bg-gray-50 text-gray-900 border border-gray-300 focus:border-blue-500'
                        }
                      `}
                    >
                      <option value="t3.micro">t3.micro (0.5 GB)</option>
                      <option value="t3.small">t3.small (1 GB)</option>
                      <option value="t3.medium">t3.medium (2 GB)</option>
                      <option value="t3.large">t3.large (4 GB)</option>
                      <option value="m5.large">m5.large (8 GB)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <input
                      type="checkbox"
                      id="autoScale"
                      defaultChecked
                      className="rounded"
                    />
                    <label
                      htmlFor="autoScale"
                      className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}
                    >
                      Enable Auto-Scaling
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Security Settings */}
            <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <button
                onClick={() => toggleSection('security')}
                className={`
                  w-full flex items-center justify-between p-4 font-medium transition-all
                  ${isDark ? 'text-gray-300 hover:bg-gray-800/50' : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <span>Security & Access</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    expandedSections.security ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSections.security && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Security Issues */}
                  <div className="space-y-2">
                    {securityIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`
                          p-3 rounded-lg flex gap-2
                          ${
                            issue.level === 'critical'
                              ? isDark
                                ? 'bg-red-500/10 border border-red-500/20'
                                : 'bg-red-50 border border-red-200'
                              : issue.level === 'warning'
                              ? isDark
                                ? 'bg-yellow-500/10 border border-yellow-500/20'
                                : 'bg-yellow-50 border border-yellow-200'
                              : isDark
                              ? 'bg-blue-500/10 border border-blue-500/20'
                              : 'bg-blue-50 border border-blue-200'
                          }
                        `}
                      >
                        <AlertCircle
                          size={16}
                          className={`
                            flex-shrink-0 mt-0.5
                            ${
                              issue.level === 'critical'
                                ? 'text-red-400'
                                : issue.level === 'warning'
                                ? 'text-yellow-400'
                                : 'text-blue-400'
                            }
                          `}
                        />
                        <p
                          className={`text-xs ${
                            issue.level === 'critical'
                              ? isDark
                                ? 'text-red-300'
                                : 'text-red-700'
                              : issue.level === 'warning'
                              ? isDark
                                ? 'text-yellow-300'
                                : 'text-yellow-700'
                              : isDark
                              ? 'text-blue-300'
                              : 'text-blue-700'
                          }`}
                        >
                          {issue.message}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle size={16} className="text-green-400" />
                    <p className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      Encryption enabled at rest
                    </p>
                  </div>

                  <div>
                    <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Security Group
                    </label>
                    <input
                      type="text"
                      placeholder="sg-xxx"
                      className={`
                        w-full mt-2 px-3 py-2 rounded-lg outline-none transition-all
                        ${isDark
                          ? 'bg-gray-800 text-gray-200 border border-gray-700 focus:border-blue-500'
                          : 'bg-gray-50 text-gray-900 border border-gray-300 focus:border-blue-500'
                        }
                      `}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Performance */}
            <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <button
                onClick={() => toggleSection('performance')}
                className={`
                  w-full flex items-center justify-between p-4 font-medium transition-all
                  ${isDark ? 'text-gray-300 hover:bg-gray-800/50' : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <span>Performance & Monitoring</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    expandedSections.performance ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSections.performance && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <input type="checkbox" id="monitoring" defaultChecked className="rounded" />
                    <label
                      htmlFor="monitoring"
                      className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}
                    >
                      CloudWatch Monitoring
                    </label>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <input type="checkbox" id="logging" defaultChecked className="rounded" />
                    <label
                      htmlFor="logging"
                      className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}
                    >
                      Enable Detailed Logging
                    </label>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-sm">Select a node to view its properties</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {selectedNode && (
        <div
          className={`
            flex gap-2 p-4 border-t
            ${isDark ? 'border-gray-800' : 'border-gray-200'}
          `}
        >
          <button
            onClick={() => onDuplicate?.(selectedNode.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all
              ${isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <Copy size={16} />
            <span>Duplicate</span>
          </button>
          <button
            onClick={() => onDelete?.(selectedNode.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-red-400
              ${isDark ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-red-50 hover:bg-red-100'}
            `}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
