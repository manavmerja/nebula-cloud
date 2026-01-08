"use client";

import { useState } from 'react';
import FlowEditor from '@/components/FlowEditor';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import PropertyPanel from '@/components/PropertyPanel';
import CodeEditor from '@/components/CodeEditor';
import AIAssistant from '@/components/AIAssistant';

const SAMPLE_TERRAFORM = `# AWS VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "nebula-vpc"
  }
}

# Public Subnet 1
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-1"
  }
}

# EC2 Instance
resource "aws_instance" "web" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.medium"
  subnet_id              = aws_subnet.public_1.id
  vpc_security_group_ids = [aws_security_group.web.id]

  tags = {
    Name = "web-server"
  }
}

# Security Group
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}`;

interface SelectedNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
}

export default function Editor() {
  const [isDark, setIsDark] = useState(true);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [currentCode, setCurrentCode] = useState(SAMPLE_TERRAFORM);

  const handleDeploy = () => {
    setDeploymentStatus('deploying');
    setTimeout(() => {
      setDeploymentStatus('success');
      setTimeout(() => {
        setDeploymentStatus('idle');
      }, 3000);
    }, 2000);
  };

  const handleGenerateInfrastructure = async (prompt: string) => {
    console.log('Generating infrastructure based on:', prompt);
  };

  return (
    <div
      className={`
        flex flex-col h-screen overflow-hidden transition-colors duration-200
        ${isDark ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900'}
      `}
    >
      <Navbar
        isDark={isDark}
        setIsDark={setIsDark}
        projectName="Cloud Infrastructure - Demo"
        onDeploy={handleDeploy}
        deploymentStatus={deploymentStatus}
        securityScore={85}
        isAIAssistantOpen={isAIAssistantOpen}
        setIsAIAssistantOpen={setIsAIAssistantOpen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {!isAIAssistantOpen && <Sidebar isDark={isDark} />}

        <div className="flex-1 overflow-hidden relative">
          <div className={`w-full h-full ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
            <FlowEditor isDark={isDark} onCodeUpdate={setCurrentCode} />
          </div>

          {!isCodeEditorOpen && (
            <button
              onClick={() => setIsCodeEditorOpen(true)}
              className={`
                fixed bottom-4 right-4 px-4 py-2 rounded-lg font-medium transition-all
                flex items-center gap-2 z-30 shadow-lg
                ${isDark
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                }
              `}
            >
              💻 Show Code
            </button>
          )}

          {!isAIAssistantOpen && (
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className={`
                fixed bottom-16 right-4 px-4 py-2 rounded-lg font-medium transition-all
                flex items-center gap-2 z-30 shadow-lg
                ${isDark
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700'
                  : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600'
                }
              `}
            >
              ✨ AI Helper
            </button>
          )}
        </div>

        <PropertyPanel
          isDark={isDark}
          isOpen={isPropertyPanelOpen}
          onClose={() => setIsPropertyPanelOpen(false)}
          selectedNode={selectedNode}
          onPropertyChange={(nodeId, property, value) => {
            console.log(`Updated ${nodeId}.${property} = ${value}`);
          }}
          onDuplicate={(nodeId) => {
            console.log(`Duplicated node: ${nodeId}`);
          }}
          onDelete={(nodeId) => {
            console.log(`Deleted node: ${nodeId}`);
          }}
        />
      </div>

      <CodeEditor
        isDark={isDark}
        isOpen={isCodeEditorOpen}
        onClose={() => setIsCodeEditorOpen(false)}
        code={currentCode}
        onCodeChange={setCurrentCode}
        language="terraform"
        fileName="main.tf"
      />

      {isAIAssistantOpen && (
        <AIAssistant
          isDark={isDark}
          isOpen={isAIAssistantOpen}
          onClose={() => setIsAIAssistantOpen(false)}
          onGenerateInfrastructure={handleGenerateInfrastructure}
          isLoading={false}
        />
      )}
    </div>
  );
}
