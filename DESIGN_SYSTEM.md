# Nebula Cloud - UI/UX Design System

## 📋 Overview

Nebula Cloud is a modern, AI-powered cloud infrastructure design platform that combines the visual intuitiveness of Canva, the functionality of AWS Console, and the intelligence of GitHub Copilot. The UI is designed for Cloud Architects, DevOps Engineers, Developers, and Startup Founders.

## 🎨 Visual Design Principles

### Color Palette

#### Dark Mode (Default)
- **Background**: `#030712` (deep navy)
- **Surface**: `#111827` (dark gray - 900)
- **Surface Secondary**: `#1F2937` (dark gray - 800)
- **Text Primary**: `#F3F4F6` (gray - 100)
- **Text Secondary**: `#9CA3AF` (gray - 500)
- **Border**: `#1F2937` (gray - 800)

#### Light Mode
- **Background**: `#FFFFFF` (white)
- **Surface**: `#F9FAFB` (gray - 50)
- **Surface Secondary**: `#F3F4F6` (gray - 100)
- **Text Primary**: `#111827` (gray - 900)
- **Text Secondary**: `#6B7280` (gray - 600)
- **Border**: `#E5E7EB` (gray - 200)

#### Accent Colors
- **Primary (Blue)**: `#3B82F6` - Main actions, highlights
- **Secondary (Purple)**: `#8B5CF6` - Gradients, emphasis
- **Success (Green)**: `#10B981` - Positive actions, confirmations
- **Warning (Amber)**: `#F59E0B` - Cautions, warnings
- **Danger (Red)**: `#EF4444` - Destructive actions, errors
- **Info (Cyan)**: `#06B6D4` - Informational content

#### Cloud Service Colors
- **Compute** (Orange): `#FB923C`
- **Storage** (Green): `#34D399`
- **Database** (Red): `#F87171`
- **Networking** (Blue): `#60A5FA`
- **Security** (Purple): `#C084FC`
- **Monitoring** (Yellow): `#FBBF24`

### Typography

- **Font Family**: System UI (`-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, sans-serif`)
- **Heading 1**: `32px`, `weight: 700`, `line-height: 1.2`
- **Heading 2**: `24px`, `weight: 700`, `line-height: 1.3`
- **Heading 3**: `18px`, `weight: 600`, `line-height: 1.4`
- **Body**: `16px`, `weight: 400`, `line-height: 1.5`
- **Small**: `14px`, `weight: 500`, `line-height: 1.5`
- **Mono (Code)**: `Menlo, Monaco, Courier New, monospace`

### Spacing & Layout

- **Base Unit**: 4px
- **Gaps**: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`
- **Border Radius**: `4px` (xs), `8px` (sm), `12px` (md), `16px` (lg)
- **Shadows**:
  - `sm`: `0 1px 2px rgba(0,0,0,0.05)`
  - `md`: `0 4px 6px rgba(0,0,0,0.1)`
  - `lg`: `0 10px 15px rgba(0,0,0,0.1)`
  - `xl`: `0 20px 25px rgba(0,0,0,0.1)`
  - `2xl`: `0 25px 50px rgba(0,0,0,0.25)`

## 📐 Layout Architecture

### Main Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         NAVBAR (Fixed)                          │
│ Logo | Project Name | Security Score | Deploy | Settings | etc. │
├──────────────────┬──────────────────────────────────┬────────────┤
│                  │                                  │            │
│  LEFT SIDEBAR    │      CENTER CANVAS               │ PROPERTIES │
│  (Services       │      (Drag & Drop Area)          │ PANEL      │
│   Palette)       │      (React Flow)                │ (Right)    │
│                  │                                  │            │
│  - Compute       │                                  │            │
│  - Storage       │      ┌──────────────────┐       │            │
│  - Database      │      │   Cloud Node     │       │ [Settings] │
│  - Networking    │      │   (EC2, RDS...)  │       │            │
│  - Security      │      │                  │       │ General    │
│  - Monitoring    │      └──────────────────┘       │ Security   │
│                  │                                  │ Performance│
│  Search: ___     │    (Grid-based infinite canvas)  │            │
│                  │                                  │ [Delete]   │
├──────────────────┼──────────────────────────────────┼────────────┤
│                                                                  │
│ BOTTOM PANEL - CODE EDITOR (Collapsible, 50% height)          │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Code Editor | Terraform | CloudFormation | JSON        │   │
│ │ Copy | Download | Format | Apply                       │   │
│ │                                                         │   │
│ │ resource "aws_vpc" "main" { ... }                      │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ AI ASSISTANT PANEL (Left, Sliding) | Floating buttons           │
│ Chat interface, suggested prompts, security recommendations      │
└──────────────────────────────────────────────────────────────────┘
```

## 🧩 Component Library

### 1. **Navbar Component** (`Navbar.tsx`)
- **Purpose**: Top navigation with project management
- **Features**:
  - Logo + Project name
  - Security score badge
  - Deployment status indicator
  - Save button
  - Deploy button (primary action)
  - Share/Download options
  - AI Assistant toggle
  - Dark/Light mode toggle
  - More menu (Settings, Version History, Export)

### 2. **Sidebar Component** (`Sidebar.tsx`)
- **Purpose**: Cloud services palette
- **Features**:
  - Categorized services (Compute, Storage, Database, Networking, Security, Monitoring)
  - Search functionality
  - Expandable categories
  - Drag-and-drop enabled
  - Service descriptions
  - Color-coded icons
  - Smooth animations

### 3. **PropertyPanel Component** (`PropertyPanel.tsx`)
- **Purpose**: Configure selected cloud resource
- **Features**:
  - General settings (name, environment, instance type)
  - Security & access settings
    - Security issues badges
    - Encryption status
    - Security group configuration
  - Performance & monitoring
    - CloudWatch toggle
    - Detailed logging
  - Collapsible sections
  - Duplicate/Delete buttons
  - Real-time validation

### 4. **CodeEditor Component** (`CodeEditor.tsx`)
- **Purpose**: Live IaC code editor
- **Features**:
  - Language tabs (Terraform, CloudFormation, JSON)
  - Syntax highlighting
  - Copy to clipboard
  - Download code
  - Format button
  - Apply button
  - File info (size, language)
  - Collapsible panel
  - Real-time sync with diagram

### 5. **AIAssistant Component** (`AIAssistant.tsx`)
- **Purpose**: AI-powered infrastructure generation
- **Features**:
  - Chat interface
  - Suggested prompts
  - Message history
  - Thinking indicator
  - Quick action buttons
  - Integration with diagram generator
  - Security recommendations

### 6. **DeploymentPanel Component** (`DeploymentPanel.tsx`)
- **Purpose**: Deployment & security status
- **Features**:
  - **Deployment Status Tab**
    - Deployment history
    - Real-time status
    - Error/warning details
  - **Security Tab**
    - Critical/Warning/Info issues
    - Recommendations
    - Resource-specific details
  - **Compliance Tab**
    - Compliance badges (ISO, GDPR, HIPAA, PCI-DSS, SOC 2)
    - Status indicators
    - Compliance score

### 7. **FlowEditor Component** (Enhanced)
- **Purpose**: Main canvas for infrastructure design
- **Features**:
  - Infinite grid-based canvas
  - Drag-and-drop nodes
  - Connection lines with arrows
  - Node selection & configuration
  - Multiple node types:
    - Cloud Service nodes (EC2, RDS, S3, etc.)
    - Prompt nodes (for AI workflow)
    - AI processing nodes
    - Result/output nodes
  - Real-time code synchronization
  - Undo/Redo support
  - Mini-map
  - Controls (zoom, pan, fit)
  - Snap-to-grid

## 🎯 Interaction Patterns

### Drag & Drop Workflow
1. User clicks service in sidebar
2. Service becomes "draggable"
3. User drags to canvas
4. Drop triggers node creation
5. Node appears with default configuration
6. Properties panel auto-opens
7. User configures in right panel
8. Code updates in real-time

### Code Synchronization
1. **Diagram → Code**:
   - User adds/modifies node on canvas
   - FlowEditor detects change
   - Converts to IaC syntax
   - Code editor updates instantly
   - Change highlighted for visibility

2. **Code → Diagram**:
   - User edits code in editor
   - Parser validates syntax
   - Converts back to diagram elements
   - Canvas updates with new nodes
   - Visual feedback on changes

### AI Assistant Workflow
1. User opens AI panel
2. Types natural language prompt (e.g., "Create VPC with 2 public subnets")
3. AI generates infrastructure diagram
4. Nodes appear on canvas automatically
5. Code is generated and shown
6. User can refine or deploy

## 🎨 Design Tokens

### Border Radius
```
xs: 4px
sm: 8px
md: 12px
lg: 16px
full: 9999px
```

### Shadows
```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.1)
lg: 0 10px 15px rgba(0,0,0,0.1)
xl: 0 20px 25px rgba(0,0,0,0.1)
2xl: 0 25px 50px rgba(0,0,0,0.25)
glow: 0 0 20px rgba(59,130,246,0.2)
```

### Transitions
```
duration-150: 150ms
duration-200: 200ms (default)
duration-300: 300ms
duration-500: 500ms
easing: cubic-bezier(0.4, 0, 0.2, 1)
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Layout Adjustments
- **Mobile**: Single column, hidden sidebar, bottom panels
- **Tablet**: 2-column with collapsible sidebar
- **Desktop**: Full 4-panel layout with all features

## ♿ Accessibility

- **Keyboard Navigation**: All buttons accessible via Tab/Enter
- **Color Contrast**: WCAG AA compliant (4.5:1 for text)
- **Focus States**: Visible focus outline on all interactive elements
- **ARIA Labels**: Screen reader friendly
- **Motion**: Reduced motion support
- **Font Sizing**: Scalable relative units

## 🌙 Dark/Light Mode

### Implementation
- Toggle in navbar
- Persists in localStorage
- CSS variables for theming
- Smooth color transitions (200ms)
- System preference detection (prefers-color-scheme)

### Dark Mode Benefits
- Reduces eye strain
- Better for prolonged use
- Modern aesthetic
- Better for code editors

## 🚀 Performance Optimizations

- **Component Code Splitting**: Lazy load panels
- **Memoization**: Prevent unnecessary re-renders
- **Virtual Scrolling**: For long service lists
- **Canvas Optimization**: Efficient ReactFlow rendering
- **Image Optimization**: SVG icons, no raster images
- **CSS-in-JS**: Minimize file size

## 📊 Design System Files

1. **[Navbar.tsx](./Navbar.tsx)** - Top navigation
2. **[Sidebar.tsx](./Sidebar.tsx)** - Services palette
3. **[PropertyPanel.tsx](./PropertyPanel.tsx)** - Resource configuration
4. **[CodeEditor.tsx](./CodeEditor.tsx)** - IaC code editor
5. **[AIAssistant.tsx](./AIAssistant.tsx)** - AI chat interface
6. **[DeploymentPanel.tsx](./DeploymentPanel.tsx)** - Deployment & security
7. **[globals.css](../app/globals.css)** - Global styles
8. **[page.tsx](../app/page.tsx)** - Main layout

## 🎓 Usage Examples

### Basic Setup
```tsx
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import PropertyPanel from '@/components/PropertyPanel';
import CodeEditor from '@/components/CodeEditor';
import AIAssistant from '@/components/AIAssistant';

export default function Page() {
  const [isDark, setIsDark] = useState(true);
  
  return (
    <div>
      <Navbar isDark={isDark} setIsDark={setIsDark} />
      <div className="flex">
        <Sidebar isDark={isDark} />
        {/* Canvas here */}
        <PropertyPanel isDark={isDark} />
      </div>
      <CodeEditor isDark={isDark} />
      <AIAssistant isDark={isDark} />
    </div>
  );
}
```

## 🔄 Future Enhancements

1. **Collaborative Editing**: Real-time multi-user editing
2. **Version Control**: Full git integration in UI
3. **Advanced Analytics**: Resource usage predictions
4. **Custom Nodes**: User-defined component library
5. **Marketplace**: Pre-built infrastructure templates
6. **API Documentation**: Auto-generated docs for generated resources
7. **Cost Estimation**: Real-time AWS cost calculator
8. **Performance Monitoring**: Integration with CloudWatch
9. **Multi-cloud Support**: Azure, GCP templates
10. **CI/CD Integration**: GitHub Actions, GitLab CI setup

## 📝 Notes

- All components use Tailwind CSS for styling
- Dark/Light mode support is built-in
- Components are fully responsive
- TypeScript for type safety
- Lucide React for icons
- ReactFlow for canvas functionality

---

**Last Updated**: January 5, 2026
**Version**: 1.0.0
**Status**: Production Ready
