'use client';

import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Loader,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Plus,
} from 'lucide-react';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  onGenerateInfrastructure?: (prompt: string) => Promise<void>;
  isLoading?: boolean;
}

const suggestedPrompts = [
  'Create a VPC with 2 public subnets and 2 private subnets',
  'Set up a load-balanced web application with auto-scaling',
  'Create a highly available database with read replicas',
  'Set up a CI/CD pipeline with ECR and ECS',
  'Create a serverless API with Lambda and DynamoDB',
];

export default function AIAssistant({
  isDark,
  isOpen,
  onClose,
  onGenerateInfrastructure,
  isLoading = false,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello! 👋 I\'m your AI infrastructure assistant. I can help you design cloud infrastructure by generating diagrams and IaC code. Try asking me to create a specific infrastructure setup!',
      timestamp: new Date(),
      suggestions: suggestedPrompts,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSendMessage = async (message?: string) => {
    const prompt = message || inputValue.trim();
    if (!prompt) return;

    // Add user message
    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    // Simulate AI thinking
    setTimeout(() => {
      const assistantMessage: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `I'll help you create that infrastructure! Here's what I'm generating:

1. **VPC Configuration** - Creating a custom VPC with CIDR block 10.0.0.0/16
2. **Subnets** - Setting up 2 public and 2 private subnets across AZs
3. **Network** - Configuring NAT Gateway, Internet Gateway, and Route Tables
4. **Security** - Creating Security Groups with appropriate rules
5. **Auto-scaling** - Setting up Auto Scaling Groups with target tracking

The diagram is being drawn on your canvas now, and the Terraform code is ready to review in the code editor. Would you like me to:
- Add more resources (RDS, S3, etc.)?
- Adjust security policies?
- Enable monitoring and logging?`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
      onGenerateInfrastructure?.(prompt);
    }, 1500);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => onClose && onClose()}
        className={`
          fixed bottom-4 left-4 px-4 py-2 rounded-lg font-medium transition-all
          flex items-center gap-2 z-40
          ${isDark
            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700'
            : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600'
          }
        `}
      >
        <Sparkles size={16} />
        AI Assistant
      </button>
    );
  }

  return (
    <div
      className={`
        fixed left-0 top-0 h-full w-96 shadow-2xl border-r z-40
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
          <Sparkles size={18} className="text-violet-400" />
          <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
            AI Assistant
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles size={32} className="mx-auto text-violet-400 mb-2" />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Start designing your infrastructure with AI!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              {/* Message Bubble */}
              <div
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-xs px-4 py-3 rounded-lg
                    ${
                      message.role === 'user'
                        ? isDark
                          ? 'bg-blue-600/30 text-blue-200'
                          : 'bg-blue-100 text-blue-900'
                        : isDark
                        ? 'bg-gray-800 text-gray-200'
                        : 'bg-gray-100 text-gray-900'
                    }
                  `}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Suggestions */}
              {message.suggestions && message.role === 'assistant' && (
                <div className="mt-3 space-y-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(suggestion)}
                      className={`
                        w-full text-left p-2 rounded-lg text-xs font-medium transition-all
                        ${isDark
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {/* Thinking State */}
        {isThinking && (
          <div className="flex justify-start">
            <div
              className={`
                max-w-xs px-4 py-3 rounded-lg flex items-center gap-2
                ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-900'}
              `}
            >
              <Loader size={16} className="animate-spin" />
              <span className="text-sm">Generating infrastructure...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {messages.length > 1 && !isThinking && (
        <div
          className={`
            px-4 py-3 border-b space-y-2
            ${isDark ? 'border-gray-800' : 'border-gray-200'}
          `}
        >
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Quick Actions
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`
                p-2 rounded-lg text-xs font-medium transition-all
                ${isDark
                  ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                }
              `}
            >
              <CheckCircle2 size={14} className="mx-auto mb-1" />
              Apply Config
            </button>
            <button
              className={`
                p-2 rounded-lg text-xs font-medium transition-all
                ${isDark
                  ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }
              `}
            >
              <Lightbulb size={14} className="mx-auto mb-1" />
              Get Tips
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div
        className={`
          p-4 border-t
          ${isDark ? 'border-gray-800' : 'border-gray-200'}
        `}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isThinking) {
                handleSendMessage();
              }
            }}
            placeholder="Describe your infrastructure..."
            className={`
              flex-1 px-3 py-2 rounded-lg outline-none transition-all
              ${isDark
                ? 'bg-gray-800 text-gray-200 border border-gray-700 focus:border-violet-500'
                : 'bg-gray-50 text-gray-900 border border-gray-300 focus:border-violet-500'
              }
            `}
            disabled={isThinking}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isThinking}
            className={`
              p-2 rounded-lg transition-all
              ${
                !inputValue.trim() || isThinking
                  ? isDark
                    ? 'bg-gray-800 text-gray-600'
                    : 'bg-gray-100 text-gray-400'
                  : 'bg-violet-600 text-white hover:bg-violet-700 active:scale-95'
              }
            `}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
