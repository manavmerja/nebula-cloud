# Nebula Cloud UI Implementation Guide

## 🚀 Quick Start

### Installation & Setup

```bash
# Install dependencies (already included in package.json)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Required Dependencies
All dependencies are already in `package.json`:
- `next`: ^16.0.10
- `react`: ^19.2.1
- `react-dom`: ^19.2.1
- `reactflow`: ^11.11.4
- `tailwindcss`: ^4
- `lucide-react`: ^0.561.0
- `@monaco-editor/react`: ^4.7.0 (optional, for enhanced code editor)

## 📁 File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page with all panels
│   └── globals.css         # Global styles & animations
├── components/
│   ├── Navbar.tsx          # Top navigation
│   ├── Sidebar.tsx         # Services palette
│   ├── PropertyPanel.tsx   # Resource configuration
│   ├── CodeEditor.tsx      # IaC code editor
│   ├── AIAssistant.tsx     # AI chat interface
│   ├── DeploymentPanel.tsx # Deployment & security
│   ├── FlowEditor.tsx      # Canvas (existing)
│   └── nodes/
│       ├── PromptNode.tsx    # (existing)
│       ├── AINode.tsx        # (existing)
│       ├── ResultNode.tsx    # (existing)
│       └── CloudServiceNode.tsx # (existing)
└── ...
```

## 🎨 Component Integration

### 1. Main Page Layout (`src/app/page.tsx`)

The main page now includes:
- ✅ Navbar with all controls
- ✅ Left Sidebar (Services Palette)
- ✅ Center Canvas (FlowEditor)
- ✅ Right Sidebar (PropertyPanel)
- ✅ Bottom Panel (CodeEditor)
- ✅ AI Assistant (Left or floating)
- ✅ Dark/Light mode toggle
- ✅ All state management

```tsx
// Key state hooks:
const [isDark, setIsDark] = useState(true);
const [selectedNode, setSelectedNode] = useState(null);
const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);
const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
const [deploymentStatus, setDeploymentStatus] = useState('idle');
```

### 2. Navbar Integration

```tsx
<Navbar
  isDark={isDark}
  setIsDark={setIsDark}
  projectName="My Infrastructure"
  onDeploy={handleDeploy}
  deploymentStatus={deploymentStatus}
  securityScore={85}
/>
```

**Features**:
- Project name display
- Security score badge
- Deployment status indicator
- Deploy button (primary CTA)
- Save, Share, Download options
- Dark/Light toggle
- More menu with additional options

### 3. Sidebar Integration

```tsx
<Sidebar isDark={isDark} />
```

**Features**:
- 6 service categories
- Search functionality
- Drag-and-drop enabled
- Color-coded icons
- Service descriptions
- Smooth expandable sections

### 4. PropertyPanel Integration

```tsx
<PropertyPanel
  isDark={isDark}
  isOpen={isPropertyPanelOpen}
  onClose={() => setIsPropertyPanelOpen(false)}
  selectedNode={selectedNode}
  onPropertyChange={handlePropertyChange}
  onDuplicate={handleDuplicate}
  onDelete={handleDelete}
/>
```

**Features**:
- General settings (name, environment, instance type)
- Security & Access configuration
- Performance & Monitoring options
- Security issues display
- Compliance badges
- Duplicate/Delete actions

### 5. CodeEditor Integration

```tsx
<CodeEditor
  isDark={isDark}
  isOpen={isCodeEditorOpen}
  onClose={() => setIsCodeEditorOpen(!isCodeEditorOpen)}
  code={SAMPLE_TERRAFORM}
  onCodeChange={handleCodeChange}
  language="terraform"
  fileName="main.tf"
/>
```

**Features**:
- Multiple language support (Terraform, CloudFormation, JSON)
- Code display with syntax highlighting
- Copy to clipboard
- Download code
- Format & Apply buttons
- Collapsible interface

### 6. AIAssistant Integration

```tsx
<AIAssistant
  isDark={isDark}
  isOpen={isAIAssistantOpen}
  onClose={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
  onGenerateInfrastructure={handleGenerateInfrastructure}
/>
```

**Features**:
- Chat interface
- Suggested prompts
- AI-generated responses
- Infrastructure generation
- Quick action buttons
- Smooth animations

## 🔌 Connecting to Backend

### 1. API Integration for Code Generation

```tsx
// In AIAssistant component
const handleGenerateInfrastructure = async (prompt: string) => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, type: 'terraform' })
    });
    
    const { code, diagram } = await response.json();
    // Update code editor and canvas
  } catch (error) {
    console.error('Generation failed:', error);
  }
};
```

### 2. Deployment API

```tsx
// In Navbar component
const handleDeploy = async () => {
  setDeploymentStatus('deploying');
  try {
    const response = await fetch('/api/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        projectId: 'current-project',
        code: terraformCode,
        resources: selectedNodes
      })
    });
    
    if (response.ok) {
      setDeploymentStatus('success');
    } else {
      setDeploymentStatus('error');
    }
  } catch (error) {
    setDeploymentStatus('error');
  }
};
```

### 3. FlowEditor to Canvas Sync

```tsx
// In FlowEditor, handle node changes
const handleNodesChange = (changes: NodeChange[]) => {
  onNodesChange(changes);
  
  // Sync to code editor
  const terraform = generateTerraformFromNodes(nodes);
  updateCodeEditor(terraform);
  
  // Sync to properties panel
  const selectedNodeData = nodes.find(n => n.selected);
  updatePropertyPanel(selectedNodeData);
};
```

## 🎯 Customization

### Changing Colors

Edit in component files:

```tsx
// Primary color: Blue
className="bg-blue-600 hover:bg-blue-700"

// Secondary color: Purple
className="bg-purple-600 hover:bg-purple-700"

// Service colors (in Sidebar)
const colors = {
  compute: 'text-orange-400',
  storage: 'text-green-400',
  database: 'text-red-400',
  networking: 'text-blue-400',
  security: 'text-purple-400',
  monitoring: 'text-yellow-400'
};
```

### Changing Cloud Services

Edit in `src/components/Sidebar.tsx`:

```tsx
const categories = {
  compute: {
    services: [
      { id: 'ec2', name: 'EC2 Instance', ... },
      // Add more services here
    ]
  }
};
```

### Customizing Node Types

Edit in `src/components/FlowEditor.tsx`:

```tsx
const nodeTypes = {
  promptNode: PromptNode,
  aiNode: AINode,
  resultNode: ResultNode,
  cloudNode: CloudServiceNode,
  // Add custom node types here
};
```

## 🧪 Testing

### Component Testing

```tsx
// Example test for Navbar
import { render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';

describe('Navbar', () => {
  it('displays project name', () => {
    render(<Navbar projectName="Test Project" isDark={true} setIsDark={jest.fn()} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });
});
```

## 🚨 Common Issues & Solutions

### Issue: Dark Mode Not Persisting
**Solution**: Add localStorage logic
```tsx
// In page.tsx
useEffect(() => {
  const saved = localStorage.getItem('isDark');
  if (saved) setIsDark(JSON.parse(saved));
}, []);

useEffect(() => {
  localStorage.setItem('isDark', JSON.stringify(isDark));
}, [isDark]);
```

### Issue: Canvas Not Showing Nodes
**Solution**: Ensure FlowEditor is wrapped in ReactFlowProvider
```tsx
<ReactFlowProvider>
  <FlowEditor />
</ReactFlowProvider>
```

### Issue: Code Not Syncing with Diagram
**Solution**: Implement sync mechanism in FlowEditor
```tsx
useEffect(() => {
  const terraformCode = generateTerraform(nodes, edges);
  onCodeSync?.(terraformCode);
}, [nodes, edges]);
```

## 📈 Performance Tips

1. **Memoize Components**: Use `React.memo()` for heavy components
2. **Lazy Load Panels**: Load CodeEditor and AI Assistant on demand
3. **Virtual Scrolling**: Use for long service lists
4. **Optimize Canvas**: Use ReactFlow's built-in optimizations
5. **Code Splitting**: Split large files

## 🔐 Security Considerations

1. **Validate User Input**: Sanitize prompts before sending to AI
2. **Sanitize Generated Code**: Validate Terraform before display
3. **Authentication**: Add auth checks for deploy operations
4. **HTTPS Only**: Ensure secure communication
5. **Rate Limiting**: Limit API calls to prevent abuse

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [ReactFlow Documentation](https://reactflow.dev)
- [Lucide Icons](https://lucide.dev)
- [Next.js Documentation](https://nextjs.org)
- [React Documentation](https://react.dev)

## 🎬 Getting Started Checklist

- [x] Install dependencies
- [x] Create all components
- [x] Add global styles
- [x] Integrate dark/light mode
- [x] Set up main layout
- [ ] Connect to backend API
- [ ] Implement drag-and-drop sync
- [ ] Add code generation logic
- [ ] Implement deployment flow
- [ ] Add authentication
- [ ] Deploy to production

## 📞 Support

For issues or questions:
1. Check DESIGN_SYSTEM.md for design details
2. Review component props and types
3. Check console for error messages
4. Review network tab for API issues

---

**Last Updated**: January 5, 2026
**Version**: 1.0.0
