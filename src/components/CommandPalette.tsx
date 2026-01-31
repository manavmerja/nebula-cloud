'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useReactFlow } from "reactflow";
import {
  Search, Server, Database, Globe, Cloud, Box,
  Cpu, HardDrive, Shield, Activity, Zap, Layers,
  Container, Lock, Radio, GitBranch, Key, Link as LinkIcon
} from "lucide-react";

// --- 1. FULL SERVICE CONFIGURATION ---
// These labels match what 'getCloudIconPath' expects in your CloudServiceNode
const COMMANDS = [
  // --- Compute ---
  { id: "ec2", label: "EC2 Instance", category: "Compute", type: "cloudNode", data: { label: "EC2 Instance", serviceType: "compute" }, icon: Cpu },
  { id: "lambda", label: "Lambda Function", category: "Compute", type: "cloudNode", data: { label: "Lambda Function", serviceType: "compute" }, icon: Zap },
  { id: "fargate", label: "Fargate", category: "Compute", type: "cloudNode", data: { label: "Fargate", serviceType: "compute" }, icon: Container },
  { id: "app-runner", label: "App Runner", category: "Compute", type: "cloudNode", data: { label: "App Runner", serviceType: "compute" }, icon: Zap },

  // --- Networking ---
  { id: "vpc", label: "VPC", category: "Networking", type: "cloudNode", data: { label: "VPC", serviceType: "network" }, icon: Cloud },
  { id: "subnet-pub", label: "Public Subnet", category: "Networking", type: "cloudNode", data: { label: "Public Subnet", serviceType: "network" }, icon: Globe },
  { id: "subnet-priv", label: "Private Subnet", category: "Networking", type: "cloudNode", data: { label: "Private Subnet", serviceType: "network" }, icon: Lock },
  { id: "igw", label: "Internet Gateway", category: "Networking", type: "cloudNode", data: { label: "Internet Gateway", serviceType: "network" }, icon: Globe },
  { id: "nat", label: "NAT Gateway", category: "Networking", type: "cloudNode", data: { label: "NAT Gateway", serviceType: "network" }, icon: Layers },
  { id: "vpc-endpoint", label: "VPC Endpoint", category: "Networking", type: "cloudNode", data: { label: "VPC Endpoint", serviceType: "network" }, icon: Radio },
  { id: "route-table", label: "Route Table", category: "Networking", type: "cloudNode", data: { label: "Route Table", serviceType: "network" }, icon: GitBranch },
  { id: "alb", label: "Application Load Balancer", category: "Networking", type: "cloudNode", data: { label: "ALB", serviceType: "network" }, icon: Layers },
  { id: "api-gateway", label: "API Gateway", category: "Networking", type: "cloudNode", data: { label: "API Gateway", serviceType: "network" }, icon: Zap },
  { id: "cloudfront", label: "CloudFront", category: "Networking", type: "cloudNode", data: { label: "CloudFront", serviceType: "network" }, icon: Globe },

  // --- Storage ---
  { id: "s3", label: "S3 Bucket", category: "Storage", type: "cloudNode", data: { label: "S3 Bucket", serviceType: "storage" }, icon: HardDrive },
  { id: "glacier", label: "Glacier Archive", category: "Storage", type: "cloudNode", data: { label: "Glacier Archive", serviceType: "storage" }, icon: Box },
  { id: "efs", label: "EFS File System", category: "Storage", type: "cloudNode", data: { label: "EFS", serviceType: "storage" }, icon: HardDrive },

  // --- Database ---
  { id: "rds", label: "RDS Database", category: "Database", type: "cloudNode", data: { label: "RDS Database", serviceType: "database" }, icon: Database },
  { id: "aurora", label: "Aurora", category: "Database", type: "cloudNode", data: { label: "Aurora", serviceType: "database" }, icon: Database },
  { id: "dynamo", label: "DynamoDB", category: "Database", type: "cloudNode", data: { label: "DynamoDB", serviceType: "database" }, icon: Database },
  { id: "redis", label: "ElastiCache Redis", category: "Database", type: "cloudNode", data: { label: "Redis", serviceType: "database" }, icon: Layers },
  { id: "memcached", label: "ElastiCache Memcached", category: "Database", type: "cloudNode", data: { label: "Memcached", serviceType: "database" }, icon: Layers },

  // --- Containers ---
  { id: "ecs", label: "ECS Cluster", category: "Containers", type: "cloudNode", data: { label: "ECS Cluster", serviceType: "compute" }, icon: Container },
  { id: "eks", label: "EKS Cluster", category: "Containers", type: "cloudNode", data: { label: "EKS Cluster", serviceType: "compute" }, icon: Container },

  // --- Messaging ---
  { id: "sqs", label: "SQS Queue", category: "Messaging", type: "cloudNode", data: { label: "SQS Queue", serviceType: "queue" }, icon: Radio },
  { id: "sns", label: "SNS Topic", category: "Messaging", type: "cloudNode", data: { label: "SNS Topic", serviceType: "queue" }, icon: Radio },
  { id: "eventbridge", label: "EventBridge", category: "Messaging", type: "cloudNode", data: { label: "EventBridge", serviceType: "queue" }, icon: Zap },

  // --- Security ---
  { id: "iam", label: "IAM Role", category: "Security", type: "cloudNode", data: { label: "IAM Role", serviceType: "security" }, icon: Shield },
  { id: "sg", label: "Security Group", category: "Security", type: "cloudNode", data: { label: "Security Group", serviceType: "security" }, icon: Lock },
  { id: "nacl", label: "Network ACL", category: "Security", type: "cloudNode", data: { label: "NACL", serviceType: "security" }, icon: Shield },
  { id: "waf", label: "WAF", category: "Security", type: "cloudNode", data: { label: "WAF", serviceType: "security" }, icon: Shield },
  { id: "kms", label: "KMS Key", category: "Security", type: "cloudNode", data: { label: "KMS Key", serviceType: "security" }, icon: Key },
  { id: "secrets", label: "Secrets Manager", category: "Security", type: "cloudNode", data: { label: "Secrets Manager", serviceType: "security" }, icon: Lock },

  // --- Observability ---
  { id: "cloudwatch", label: "CloudWatch", category: "Observability", type: "cloudNode", data: { label: "CloudWatch", serviceType: "other" }, icon: Activity },
  { id: "xray", label: "X-Ray", category: "Observability", type: "cloudNode", data: { label: "X-Ray", serviceType: "other" }, icon: Activity },

  // --- DevOps ---
  { id: "codepipeline", label: "CodePipeline", category: "DevOps", type: "cloudNode", data: { label: "CodePipeline", serviceType: "other" }, icon: GitBranch },
  { id: "codebuild", label: "CodeBuild", category: "DevOps", type: "cloudNode", data: { label: "CodeBuild", serviceType: "other" }, icon: GitBranch },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function CommandPalette({ isOpen, onClose, onToggle }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { addNodes } = useReactFlow();

  // Filter Logic
  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle logic (Ctrl+K or Cmd+K)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onToggle();
        setQuery("");
        setSelectedIndex(0);
      }

      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onToggle, onClose]);

  // Execute Command
  const executeCommand = useCallback((item: typeof COMMANDS[0]) => {
    if (!item) return;

    // Place node near the center (offset slightly to avoid stacking)
    const randomOffset = () => (Math.random() - 0.5) * 100;
    const newNode = {
      id: `${item.id}-${Date.now()}`,
      type: item.type, // 'cloudNode'
      position: {
        x: 250 + randomOffset(),
        y: 250 + randomOffset()
      },
      data: { ...item.data }, // Passes 'label' which getCloudIconPath uses
    };

    addNodes(newNode);
    onClose();
  }, [addNodes, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">

      {/* Overlay click closes palette */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Palette */}
      <div className="relative w-full max-w-xl bg-[#151921] border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

        {/* Search Bar */}
        <div className="flex items-center px-4 py-3 border-b border-gray-800">
          <Search className="text-gray-500 w-5 h-5 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Search resources (e.g. 'S3', 'Database', 'Security')..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm font-medium"
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
            }}
          />
          <div className="flex gap-1">
             <span className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] text-gray-400 font-mono">ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[400px] overflow-y-auto py-2 custom-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No results found for "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={`${cmd.id}-${index}`}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors group
                    ${isSelected ? "bg-cyan-500/10 border-l-2 border-cyan-500" : "border-l-2 border-transparent hover:bg-white/5"}
                  `}
                >
                  <div className={`p-1.5 rounded-md ${isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'}`}>
                    <Icon size={16} />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <span className={`font-medium ${isSelected ? 'text-cyan-100' : 'text-gray-300'}`}>
                        {cmd.label}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                        {cmd.category}
                    </span>
                  </div>

                  {isSelected && <span className="text-[10px] text-cyan-500/70 font-mono">↵ Enter</span>}
                </button>
              );
            })
          )}
        </div>

        {/* Footer with Smart Connect Hint */}
        <div className="px-4 py-2 bg-black/20 border-t border-gray-800 text-[10px] text-gray-500 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="bg-gray-800/50 px-1.5 py-0.5 rounded border border-gray-700 text-gray-400">SHIFT</span>
                <span>+</span>
                <span className="bg-gray-800/50 px-1.5 py-0.5 rounded border border-gray-700 text-gray-400">CLICK</span>
                <span className="text-gray-600">= Connect</span>
            </div>

            <div className="flex gap-3">
                <span>Navigate <b className="text-gray-400">↑↓</b></span>
                <span>Select <b className="text-gray-400">↵</b></span>
            </div>
        </div>
      </div>
    </div>
  );
}