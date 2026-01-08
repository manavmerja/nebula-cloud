'use client';

import React, { useState } from 'react';
import {
  ChevronUp,
  Copy,
  Download,
  Play,
  Settings,
  FileText,
  Cloud,
  X,
} from 'lucide-react';

interface CodeEditorProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  code: string;
  onCodeChange?: (code: string) => void;
  language?: 'terraform' | 'cloudformation' | 'json';
  fileName?: string;
}

export default function CodeEditor({
  isDark,
  isOpen,
  onClose,
  code,
  onCodeChange,
  language = 'terraform',
  fileName = 'main.tf',
}: CodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isCopied, setIsCopied] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [isCodeUpdated, setIsCodeUpdated] = useState(false);

  // Show update indicator when code changes
  React.useEffect(() => {
    if (code) {
      setIsCodeUpdated(true);
      const timer = setTimeout(() => setIsCodeUpdated(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [code]);

  // Format code function
  const formatCode = () => {
    setIsFormatting(true);
    setTimeout(() => {
      // Simple formatting - add proper indentation
      const formatted = displayCode
        .split('\n')
        .map(line => {
          const trimmed = line.trim();
          if (trimmed.includes('{') || trimmed.includes('=')) {
            return '  ' + trimmed;
          }
          return trimmed;
        })
        .join('\n');
      
      if (onCodeChange) {
        onCodeChange(formatted);
      }
      setIsFormatting(false);
    }, 1000);
  };

  // Apply infrastructure function
  const applyInfrastructure = () => {
    setShowApplyConfirm(true);
  };

  const confirmApply = () => {
    setIsApplying(true);
    setShowApplyConfirm(false);
    setTimeout(() => {
      setIsApplying(false);
      // Show success message
    }, 2000);
  };

  // Convert Terraform to different formats
  const convertCode = (targetLanguage: string) => {
    if (targetLanguage === 'json') {
      // Simple mock conversion to JSON format
      return JSON.stringify({
        "resources": {
          "aws_vpc": {
            "main": {
              "cidr_block": "10.0.0.0/16",
              "enable_dns_hostnames": true,
              "enable_dns_support": true,
              "tags": {
                "Name": "nebula-vpc"
              }
            }
          }
        }
      }, null, 2);
    } else if (targetLanguage === 'cloudformation') {
      // Simple mock conversion to CloudFormation
      return `AWSTemplateFormatVersion: '2010-09-09'
Description: 'Nebula Cloud Infrastructure'
Resources:
  MainVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: nebula-vpc`;
    }
    return code; // Return original Terraform code
  };

  const displayCode = convertCode(selectedLanguage);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([displayCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    const extension = selectedLanguage === 'json' ? '.json' : selectedLanguage === 'cloudformation' ? '.yml' : '.tf';
    element.download = fileName.replace('.tf', extension);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isOpen) {
    return null; // Don't render anything when closed
  }

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 h-[50vh] border-t shadow-2xl z-40
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Cloud size={18} className="text-blue-400" />
            <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Infrastructure as Code
            </h3>
            {isCodeUpdated && (
              <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full animate-pulse">
                Updated!
              </span>
            )}
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2 ml-4">
            {['terraform', 'cloudformation', 'json'].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang as any)}
                className={`
                  px-3 py-1 rounded text-xs font-medium transition-all
                  ${selectedLanguage === lang
                    ? isDark
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                      : 'bg-blue-100 text-blue-700 border border-blue-300'
                    : isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {lang === 'terraform' ? 'Terraform' : lang === 'cloudformation' ? 'CloudFormation' : 'JSON'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className={`
              p-2 rounded-lg transition-all flex items-center gap-1
              ${isDark
                ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
              }
            `}
            title="Copy to clipboard"
          >
            <Copy size={16} />
            {isCopied && <span className="text-xs">Copied!</span>}
          </button>

          <button
            onClick={downloadCode}
            className={`
              p-2 rounded-lg transition-all
              ${isDark
                ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
              }
            `}
            title="Download code"
          >
            <Download size={16} />
          </button>

          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-all
              ${isDark
                ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
              }
            `}
            title="Close editor"
          >
            <ChevronUp size={16} />
          </button>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className={`p-4 font-mono text-sm ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <pre
              className={`
                whitespace-pre-wrap break-words
                ${isDark ? 'text-gray-300' : 'text-gray-700'}
              `}
            >
              {displayCode}
            </pre>
          </div>
        </div>

        {/* Footer with Quick Actions */}
        <div
          className={`
            p-4 border-t flex items-center justify-between
            ${isDark ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}
          `}
        >
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <span>{fileName.replace('.tf', selectedLanguage === 'json' ? '.json' : selectedLanguage === 'cloudformation' ? '.yml' : '.tf')}</span> • <span>{selectedLanguage}</span> • <span>{displayCode.length} bytes</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={formatCode}
              disabled={isFormatting}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all
                ${isFormatting
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              <Settings size={14} className={isFormatting ? 'animate-spin' : ''} />
              <span className="text-xs hidden sm:inline">
                {isFormatting ? 'Formatting...' : 'Format'}
              </span>
            </button>

            <button
              onClick={applyInfrastructure}
              disabled={isApplying}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${isApplying
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 active:scale-95'
                }
              `}
            >
              <Play size={14} className={isApplying ? 'animate-spin' : ''} />
              <span className="text-xs hidden sm:inline">
                {isApplying ? 'Deploying...' : 'Apply'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Apply Confirmation Popup */}
      {showApplyConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl max-w-md ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Deploy Infrastructure?
            </h3>
            <p className={`mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              This will deploy your {selectedLanguage} configuration to AWS. 
              Resources will be created and you may be charged.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmApply}
                disabled={isApplying}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isApplying 
                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isApplying ? 'Deploying...' : 'Deploy'}
              </button>
              <button
                onClick={() => setShowApplyConfirm(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
