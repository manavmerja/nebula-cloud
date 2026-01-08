# Nebula Cloud - Component Props Reference

## Component Props Documentation

### 📊 Navbar

**File**: `src/components/Navbar.tsx`

```typescript
interface NavbarProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  projectName?: string;
  onDeploy?: () => void;
  deploymentStatus?: 'idle' | 'deploying' | 'success' | 'error';
  securityScore?: number;
}
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isDark` | `boolean` | - | Enable/disable dark mode |
| `setIsDark` | `(dark: boolean) => void` | - | Callback to toggle dark mode |
| `projectName` | `string` | "My Cloud Infrastructure" | Current project name |
| `onDeploy` | `() => void` | - | Callback when deploy button clicked |
| `deploymentStatus` | `'idle' \| 'deploying' \| 'success' \| 'error'` | 'idle' | Current deployment status |
| `securityScore` | `number` | 85 | Security score (0-100) |

**Features**:
- Logo + Branding
- Project name display
- Security score badge with color coding
- Deployment status indicator with animations
- Save button
- Deploy button (primary action)
- Share & Download buttons
- AI Assistant toggle
- Dark/Light mode toggle
- Menu dropdown with additional options

**Example**:
```tsx
<Navbar
  isDark={isDark}
  setIsDark={setIsDark}
  projectName="VPC with Auto-Scaling"
  onDeploy={() => handleDeploy()}
  deploymentStatus="success"
  securityScore={92}
/>
```

---

### 🎨 Sidebar

**File**: `src/components/Sidebar.tsx`

```typescript
interface SidebarProps {
  isDark: boolean;
}
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isDark` | `boolean` | - | Apply dark mode styling |

**Features**:
- Categorized cloud services (Compute, Storage, Database, Networking, Security, Monitoring)
- Search functionality
- Expandable/collapsible categories
- Drag-and-drop support
- Service descriptions
- Color-coded icons by category
- 20+ AWS services

**Example**:
```tsx
<Sidebar isDark={isDark} />
```

**Service Categories**:
1. **Compute** (Orange)
   - EC2 Instance
   - Lambda
   - ECS Container
   - App Runner

2. **Storage** (Green)
   - S3 Bucket
   - EBS Volume
   - EFS
   - Glacier

3. **Database** (Red)
   - RDS
   - DynamoDB
   - ElastiCache
   - DocumentDB

4. **Networking** (Blue)
   - VPC
   - Load Balancer
   - NAT Gateway
   - Route 53
   - CloudFront

5. **Security & Identity** (Purple)
   - IAM
   - Secrets Manager
   - KMS
   - ACM
   - WAF

6. **Monitoring & Analytics** (Yellow)
   - CloudWatch
   - X-Ray
   - CloudTrail

---

### ⚙️ PropertyPanel

**File**: `src/components/PropertyPanel.tsx`

```typescript
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
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isDark` | `boolean` | - | Apply dark mode styling |
| `isOpen` | `boolean` | - | Show/hide panel |
| `onClose` | `() => void` | - | Callback to close panel |
| `selectedNode` | `SelectedNode \| null` | null | Currently selected node data |
| `onPropertyChange` | `(nodeId, property, value) => void` | - | Callback when property changes |
| `onDuplicate` | `(nodeId) => void` | - | Callback to duplicate node |
| `onDelete` | `(nodeId) => void` | - | Callback to delete node |

**Features**:
- General settings (name, environment, instance type)
- Security & Access configuration
- Performance & Monitoring settings
- Security issues display (critical/warning/info)
- Encryption status
- Duplicate/Delete actions
- Collapsible sections

**Example**:
```tsx
<PropertyPanel
  isDark={isDark}
  isOpen={selectedNode !== null}
  onClose={() => setSelectedNode(null)}
  selectedNode={selectedNode}
  onPropertyChange={(id, prop, val) => updateNode(id, prop, val)}
  onDuplicate={(id) => duplicateNode(id)}
  onDelete={(id) => deleteNode(id)}
/>
```

---

### 💻 CodeEditor

**File**: `src/components/CodeEditor.tsx`

```typescript
interface CodeEditorProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  code: string;
  onCodeChange?: (code: string) => void;
  language?: 'terraform' | 'cloudformation' | 'json';
  fileName?: string;
}
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isDark` | `boolean` | - | Apply dark mode styling |
| `isOpen` | `boolean` | - | Show/hide editor |
| `onClose` | `() => void` | - | Callback to close editor |
| `code` | `string` | - | IaC code content |
| `onCodeChange` | `(code: string) => void` | - | Callback when code changes |
| `language` | `'terraform' \| 'cloudformation' \| 'json'` | 'terraform' | Selected language |
| `fileName` | `string` | 'main.tf' | File name for download |

**Features**:
- Language selection tabs (Terraform, CloudFormation, JSON)
- Copy to clipboard
- Download code
- Code formatting
- Apply/Deploy button
- File info display
- Collapsible interface

**Example**:
```tsx
<CodeEditor
  isDark={isDark}
  isOpen={showCodeEditor}
  onClose={() => setShowCodeEditor(!showCodeEditor)}
  code={terraformCode}
  onCodeChange={(code) => setTerraformCode(code)}
  language="terraform"
  fileName="infrastructure.tf"
/>
```

---

### 🤖 AIAssistant

**File**: `src/components/AIAssistant.tsx`

```typescript
interface AIAssistantProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  onGenerateInfrastructure?: (prompt: string) => Promise<void>;
  isLoading?: boolean;
}
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isDark` | `boolean` | - | Apply dark mode styling |
| `isOpen` | `boolean` | - | Show/hide assistant |
| `onClose` | `() => void` | - | Callback to close assistant |
| `onGenerateInfrastructure` | `(prompt: string) => Promise<void>` | - | Generate infrastructure from prompt |
| `isLoading` | `boolean` | false | Show loading indicator |

**Features**:
- Chat interface
- Message history
- Suggested prompts
- Thinking/loading indicator
- Quick action buttons
- Real-time infrastructure generation
- Security recommendations

**Suggested Prompts**:
- "Create a VPC with 2 public subnets and 2 private subnets"
- "Set up a load-balanced web application with auto-scaling"
- "Create a highly available database with read replicas"
- "Set up a CI/CD pipeline with ECR and ECS"
- "Create a serverless API with Lambda and DynamoDB"

**Example**:
```tsx
<AIAssistant
  isDark={isDark}
  isOpen={showAIAssistant}
  onClose={() => setShowAIAssistant(!showAIAssistant)}
  onGenerateInfrastructure={generateFromPrompt}
  isLoading={isGenerating}
/>
```

---

### 📊 DeploymentPanel

**File**: `src/components/DeploymentPanel.tsx`

```typescript
interface DeploymentPanelProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
}
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isDark` | `boolean` | - | Apply dark mode styling |
| `isOpen` | `boolean` | - | Show/hide panel |
| `onClose` | `() => void` | - | Callback to close panel |

**Features**:
- **Deployment Status Tab**
  - Deployment history
  - Real-time status indicators
  - Timestamp tracking
  - Error/warning details

- **Security Tab**
  - Critical/Warning/Info issues
  - Resource-specific recommendations
  - Encryption status
  - Security group configuration

- **Compliance Tab**
  - ISO 27001
  - GDPR
  - HIPAA
  - PCI-DSS
  - SOC 2
  - Compliance status indicators

**Example**:
```tsx
<DeploymentPanel
  isDark={isDark}
  isOpen={showDeploymentPanel}
  onClose={() => setShowDeploymentPanel(false)}
/>
```

---

## State Management Pattern

### Recommended State Structure

```typescript
// Main page state
const [isDark, setIsDark] = useState(true);
const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false);
const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
const [terraformCode, setTerraformCode] = useState('');
const [nodes, setNodes] = useState([]);
const [edges, setEdges] = useState([]);
```

### Callback Handlers

```typescript
const handlePropertyChange = (nodeId: string, property: string, value: any) => {
  // Update node properties
  // Sync with code editor
  // Show visual feedback
};

const handleNodeSelect = (node: SelectedNode) => {
  setSelectedNode(node);
  setIsPropertyPanelOpen(true);
};

const handleDeploy = async () => {
  setDeploymentStatus('deploying');
  try {
    // Deploy infrastructure
    setDeploymentStatus('success');
  } catch (error) {
    setDeploymentStatus('error');
  }
};

const handleGenerateInfrastructure = async (prompt: string) => {
  // Call AI API
  // Update canvas with new nodes
  // Update code editor with generated code
};
```

---

## Type Definitions

### SelectedNode
```typescript
interface SelectedNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, any>;
}
```

### DeploymentStatus
```typescript
type DeploymentStatus = 'idle' | 'deploying' | 'success' | 'error';
```

### SecurityIssue
```typescript
interface SecurityIssue {
  level: 'critical' | 'warning' | 'info';
  message: string;
}
```

### ComplianceItem
```typescript
interface ComplianceItem {
  name: string;
  status: 'compliant' | 'warning' | 'non-compliant';
  description: string;
}
```

---

## Styling Classes

### Common Tailwind Patterns

```tsx
// Dark/Light Mode Conditional
className={isDark ? 'bg-gray-900' : 'bg-white'}

// Hover Effects
className="hover:bg-gray-800 hover:text-gray-300 transition-all"

// Active States
className="active:scale-95 active:shadow-md"

// Disabled States
className="disabled:opacity-50 disabled:cursor-not-allowed"

// Focus States
className="focus:outline-blue-500 focus:outline-offset-2"
```

---

## Best Practices

1. **Props Validation**: Always define clear TypeScript interfaces
2. **Callback Functions**: Pass callback functions for parent-child communication
3. **State Management**: Keep state as high as needed but as low as possible
4. **Memoization**: Use `React.memo()` for expensive components
5. **Event Handling**: Always include proper event handlers and error handling
6. **Accessibility**: Include ARIA labels and keyboard navigation
7. **Responsive Design**: Test on all breakpoints
8. **Performance**: Lazy load heavy components

---

**Last Updated**: January 5, 2026
**Version**: 1.0.0
