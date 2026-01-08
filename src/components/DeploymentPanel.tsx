'use client';

import React, { useState } from 'react';
import {
  X,
  Shield,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Zap,
  FileText,
  Clock,
  User,
  Lock,
  Eye,
} from 'lucide-react';

interface DeploymentStatus {
  timestamp: Date;
  status: 'success' | 'pending' | 'error';
  message: string;
  details?: string;
}

interface ComplianceItem {
  name: string;
  status: 'compliant' | 'warning' | 'non-compliant';
  description: string;
}

interface DeploymentPanelProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeploymentPanel({
  isDark,
  isOpen,
  onClose,
}: DeploymentPanelProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'security' | 'compliance'>('status');

  const deploymentHistory: DeploymentStatus[] = [
    {
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'success',
      message: 'Infrastructure deployment completed successfully',
      details: 'All 12 resources deployed. 0 errors, 2 warnings',
    },
    {
      timestamp: new Date(Date.now() - 25 * 60000),
      status: 'pending',
      message: 'Applying Terraform configuration...',
      details: 'Creating VPC, subnets, and security groups',
    },
    {
      timestamp: new Date(Date.now() - 45 * 60000),
      status: 'success',
      message: 'Code review passed',
      details: 'IaC code meets all quality standards',
    },
  ];

  const securityIssues = [
    {
      level: 'critical' as const,
      title: 'Unrestricted SSH Access',
      description: 'Security group allows SSH from 0.0.0.0/0',
      resource: 'sg-web-server',
      recommendation: 'Restrict to specific IP ranges',
    },
    {
      level: 'warning' as const,
      title: 'Encryption Not Enabled',
      description: 'S3 bucket does not have encryption at rest',
      resource: 's3-data-bucket',
      recommendation: 'Enable S3 default encryption',
    },
    {
      level: 'info' as const,
      title: 'MFA Not Required',
      description: 'IAM users do not require MFA for console access',
      resource: 'iam-policy',
      recommendation: 'Enable MFA enforcement policy',
    },
  ];

  const complianceItems: ComplianceItem[] = [
    {
      name: 'ISO 27001',
      status: 'compliant',
      description: 'Information Security Management',
    },
    {
      name: 'GDPR',
      status: 'warning',
      description: 'Data Protection - Requires encryption audit',
    },
    {
      name: 'HIPAA',
      status: 'non-compliant',
      description: 'Healthcare - Missing audit logging',
    },
    {
      name: 'PCI-DSS',
      status: 'compliant',
      description: 'Payment Card Industry Standards',
    },
    {
      name: 'SOC 2',
      status: 'warning',
      description: 'Service Organization Control - Pending review',
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end
      `}
      onClick={onClose}
    >
      <div
        className={`
          w-full max-h-[80vh] rounded-t-2xl shadow-2xl border-t
          flex flex-col overflow-hidden
          ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`
            flex items-center justify-between px-6 py-4 border-b
            ${isDark ? 'border-gray-800' : 'border-gray-200'}
          `}
        >
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-blue-400" />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Deployment & Security
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-all
              ${isDark
                ? 'text-gray-400 hover:bg-gray-800'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`
            flex gap-1 px-6 py-3 border-b
            ${isDark ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}
          `}
        >
          {['status', 'security', 'compliance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all text-sm
                ${activeTab === tab
                  ? isDark
                    ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50'
                    : 'bg-blue-100 text-blue-700 border border-blue-300'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-600 hover:text-gray-700'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Deployment Status Tab */}
          {activeTab === 'status' && (
            <div className="p-6 space-y-4">
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Deployment History
              </h3>
              {deploymentHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`
                    p-4 rounded-lg border
                    ${
                      item.status === 'success'
                        ? isDark
                          ? 'bg-green-500/10 border-green-500/20'
                          : 'bg-green-50 border-green-200'
                        : item.status === 'pending'
                        ? isDark
                          ? 'bg-yellow-500/10 border-yellow-500/20'
                          : 'bg-yellow-50 border-yellow-200'
                        : isDark
                        ? 'bg-red-500/10 border-red-500/20'
                        : 'bg-red-50 border-red-200'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {item.status === 'success' && (
                        <CheckCircle2
                          size={20}
                          className={isDark ? 'text-green-400' : 'text-green-600'}
                        />
                      )}
                      {item.status === 'pending' && (
                        <Zap
                          size={20}
                          className={`${
                            isDark ? 'text-yellow-400' : 'text-yellow-600'
                          } animate-pulse`}
                        />
                      )}
                      {item.status === 'error' && (
                        <AlertTriangle
                          size={20}
                          className={isDark ? 'text-red-400' : 'text-red-600'}
                        />
                      )}
                      <div>
                        <p
                          className={`font-medium ${
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}
                        >
                          {item.message}
                        </p>
                        <p
                          className={`text-xs ${
                            isDark ? 'text-gray-500' : 'text-gray-600'
                          }`}
                        >
                          {item.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  {item.details && (
                    <p
                      className={`text-sm ml-8 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {item.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Security Issues Tab */}
          {activeTab === 'security' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Security Assessment
                </h3>
                <div
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}
                  `}
                >
                  3 Issues
                </div>
              </div>

              {securityIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`
                    p-4 rounded-lg border
                    ${
                      issue.level === 'critical'
                        ? isDark
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-red-50 border-red-200'
                        : issue.level === 'warning'
                        ? isDark
                          ? 'bg-yellow-500/10 border-yellow-500/20'
                          : 'bg-yellow-50 border-yellow-200'
                        : isDark
                        ? 'bg-blue-500/10 border-blue-500/20'
                        : 'bg-blue-50 border-blue-200'
                    }
                  `}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {issue.level === 'critical' && (
                      <AlertTriangle
                        size={18}
                        className={isDark ? 'text-red-400' : 'text-red-600'}
                      />
                    )}
                    {issue.level === 'warning' && (
                      <AlertCircle
                        size={18}
                        className={isDark ? 'text-yellow-400' : 'text-yellow-600'}
                      />
                    )}
                    {issue.level === 'info' && (
                      <AlertCircle
                        size={18}
                        className={isDark ? 'text-blue-400' : 'text-blue-600'}
                      />
                    )}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}
                      >
                        {issue.title}
                      </p>
                      <p
                        className={`text-sm mt-1 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {issue.description}
                      </p>
                      <div
                        className={`mt-2 px-2 py-1 rounded text-xs font-mono ${
                          isDark
                            ? 'bg-gray-800/50 text-gray-400'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {issue.resource}
                      </div>
                      <p
                        className={`text-sm mt-2 font-medium ${
                          isDark ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      >
                        ℹ️ {issue.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="p-6 space-y-4">
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Compliance Status
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div
                  className={`
                    p-3 rounded-lg text-center
                    ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}
                  `}
                >
                  <p className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    3
                  </p>
                  <p className={`text-xs ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                    Compliant
                  </p>
                </div>
                <div
                  className={`
                    p-3 rounded-lg text-center
                    ${isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}
                  `}
                >
                  <p className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    2
                  </p>
                  <p className={`text-xs ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    Warning
                  </p>
                </div>
              </div>

              {complianceItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`
                    p-4 rounded-lg border flex items-center justify-between
                    ${
                      item.status === 'compliant'
                        ? isDark
                          ? 'bg-green-500/10 border-green-500/20'
                          : 'bg-green-50 border-green-200'
                        : item.status === 'warning'
                        ? isDark
                          ? 'bg-yellow-500/10 border-yellow-500/20'
                          : 'bg-yellow-50 border-yellow-200'
                        : isDark
                        ? 'bg-red-500/10 border-red-500/20'
                        : 'bg-red-50 border-red-200'
                    }
                  `}
                >
                  <div>
                    <p
                      className={`font-medium ${
                        isDark ? 'text-gray-200' : 'text-gray-900'
                      }`}
                    >
                      {item.name}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                  <div>
                    {item.status === 'compliant' && (
                      <CheckCircle2
                        size={20}
                        className={isDark ? 'text-green-400' : 'text-green-600'}
                      />
                    )}
                    {item.status === 'warning' && (
                      <AlertCircle
                        size={20}
                        className={isDark ? 'text-yellow-400' : 'text-yellow-600'}
                      />
                    )}
                    {item.status === 'non-compliant' && (
                      <AlertTriangle
                        size={20}
                        className={isDark ? 'text-red-400' : 'text-red-600'}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
