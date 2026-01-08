'use client';

import React, { useState } from 'react';
import {
  Menu,
  Moon,
  Sun,
  Share2,
  Download,
  Play,
  MessageCircle,
  MoreVertical,
  Save,
  Zap,
  Check,
  AlertCircle,
} from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  projectName?: string;
  onDeploy?: () => void;
  deploymentStatus?: 'idle' | 'deploying' | 'success' | 'error';
  securityScore?: number;
  isAIAssistantOpen?: boolean;
  setIsAIAssistantOpen?: (open: boolean) => void;
}

export default function Navbar({
  isDark,
  setIsDark,
  projectName = 'My Cloud Infrastructure',
  onDeploy,
  deploymentStatus = 'idle',
  securityScore = 85,
  isAIAssistantOpen = false,
  setIsAIAssistantOpen = () => {},
}: NavbarProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav
      className={`
        flex items-center justify-between px-6 py-4 border-b backdrop-blur-md
        ${isDark
          ? 'bg-gray-900/80 border-gray-800'
          : 'bg-white/80 border-gray-200'
        }
      `}
    >
      {/* Left Section - Logo & Project */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
            N
          </div>
          <h1 className={`
            text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent
          `}>
            Nebula
          </h1>
        </div>

        {/* Project Name */}
        <div className={`
          ml-4 px-3 py-1 rounded-lg
          ${isDark ? 'bg-gray-800' : 'bg-gray-100'}
        `}>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {projectName}
          </p>
        </div>
      </div>

      {/* Center Section - Security Score & Status */}
      <div className="flex items-center gap-6">
        {/* Security Score Badge */}
        <div className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}
        `}>
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
            ${securityScore >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}
          `}>
            {securityScore}
          </div>
          <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Security
          </span>
        </div>

        {/* Deployment Status */}
        <div className="flex items-center gap-2">
          {deploymentStatus === 'deploying' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20">
              <Zap size={16} className="text-blue-400 animate-pulse" />
              <span className="text-xs font-medium text-blue-400">Deploying...</span>
            </div>
          )}
          {deploymentStatus === 'success' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20">
              <Check size={16} className="text-green-400" />
              <span className="text-xs font-medium text-green-400">Live</span>
            </div>
          )}
          {deploymentStatus === 'error' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-xs font-medium text-red-400">Error</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3">
        {/* Save Button */}
        <button className={`
          flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all
          ${isDark
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}>
          <Save size={16} />
          <span className="text-sm hidden sm:inline">Save</span>
        </button>

        {/* Deploy Button */}
        <button
          onClick={onDeploy}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            bg-gradient-to-r from-blue-600 to-purple-600 text-white
            hover:from-blue-700 hover:to-purple-700 active:scale-95
          `}
        >
          <Play size={16} />
          <span className="text-sm hidden sm:inline">Deploy</span>
        </button>

        {/* Share Button */}
        <button className={`
          p-2 rounded-lg transition-all
          ${isDark
            ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
          }
        `}>
          <Share2 size={18} />
        </button>

        {/* Download Button */}
        <button className={`
          p-2 rounded-lg transition-all
          ${isDark
            ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
          }
        `}>
          <Download size={18} />
        </button>

        {/* AI Assistant Button */}
        <button 
          onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
          className={`
            p-2 rounded-lg transition-all
            ${isDark
              ? 'text-gray-400 hover:bg-gray-800 hover:text-blue-400'
              : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
            }
          `}
        >
          <MessageCircle size={18} />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`
            p-2 rounded-lg transition-all
            ${isDark
              ? 'text-yellow-400 bg-gray-800 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`
              p-2 rounded-lg transition-all
              ${isDark
                ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
              }
            `}
          >
            <MoreVertical size={18} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className={`
              absolute right-0 mt-2 w-48 rounded-lg shadow-lg border
              ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
              z-50
            `}>
              <a href="#" className={`
                block px-4 py-2 text-sm font-medium rounded-t-lg transition-all
                ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}
              `}>
                Settings
              </a>
              <a href="#" className={`
                block px-4 py-2 text-sm font-medium transition-all
                ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}
              `}>
                Version History
              </a>
              <a href="#" className={`
                block px-4 py-2 text-sm font-medium transition-all
                ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}
              `}>
                Export as PDF
              </a>
              <a href="#" className={`
                block px-4 py-2 text-sm font-medium rounded-b-lg text-red-400 transition-all
                ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
              `}>
                Duplicate Project
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
