# 🎨 Nebula Cloud - Visual Design Overview

## Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            NEBULA CLOUD NAVBAR                              │
│  [N] Nebula | Project Name | 📊 Security 85 | [Save] [Deploy] [Share] [≡]  │
├──────────────┬──────────────────────────────────────────┬────────────────────┤
│              │                                          │                    │
│  LEFT        │          CENTER CANVAS                  │  RIGHT PANEL       │
│  SIDEBAR     │      (Drag & Drop Area)                │                    │
│              │                                          │  Properties Panel  │
│ ┌──────────────────┐ │    ┌─────────────────────┐             │  ┌──────────────┐ │
│ │ Service Palette  │ │    │                     │             │  │ [Settings]   │ │
│ │ ──────────────── │ │    │   ┌───────────────┐ │             │  │              │ │
│ │ [Search...]      │ │    │   │   EC2 Node    │ │             │  │ General      │ │
│ │                  │ │    │   │               │ │             │  │ Security     │ │
│ │ ▼ Compute        │ │    │   └─────────────┘ │             │  │ Performance  │ │
│ │  🔧 EC2          │ │    │                     │             │  │              │ │
│ │  ⚡ Lambda        │ │    │    ┌───────────────┐ │             │  │ [Duplicate]  │ │
│ │  📦 ECS          │ │    │    │   RDS Node    │ │             │  │ [Delete]     │ │
│ │ ▼ Storage        │ │    │    │               │ │             │  └──────────────┘ │
│ │  💾 S3           │ │    │    └───────────────┘ │             │                    │
│ │  📀 EBS          │ │    │          ↕           │             │                    │
│ │ ▼ Database       │ │    │    ┌───────────────┐ │             │  AI Assistant      │
│ │  🗄️ RDS          │ │    │    │   Load Bal   │ │             │  ┌──────────────┐ │
│ │  🔑 DynamoDB     │ │    │    │               │ │             │  │ 💬 Chat      │ │
│ │ ▼ Networking     │ │    │    └───────────────┘ │             │  │ "Create VPC" │ │
│ │  🌐 VPC          │ │    │                     │             │  │              │ │
│ └──────────────────┘ │    │   (Grid Canvas)      │             │  └──────────────┘ │
│              │    │                     │             │                    │
└──────────────┴──────────────────────────────────────────┴────────────────────┘
│                                                                              │
│  BOTTOM PANEL - CODE EDITOR (Collapsible, 50vh height)                     │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ [Code] | [Terraform] [CloudFormation] [JSON]    [Copy] [Download]   │  │
│  │                                                                      │  │
│  │ resource "aws_vpc" "main" {                                         │  │
│  │   cidr_block           = "10.0.0.0/16"                             │  │
│  │   enable_dns_hostnames = true                                      │  │
│  │   ...                                                              │  │
│  │ }                                                                  │  │
│  │                                                                      │  │
│  │ main.tf • Terraform • 1.2 KB              [Format] [Apply]        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. NAVBAR - Top Navigation
```
┌────────────────────────────────────────────────────────────────────┐
│ [N] Nebula | My Infrastructure | 📊85 | [Save][Deploy][Share]... │
└────────────────────────────────────────────────────────────────────┘
  ↑          ↑                      ↑        ↑
  Logo       Project                Score    Actions
```

**Features**:
- Branding with gradient logo
- Project name display
- Security score badge (green if > 80)
- Save, Deploy (primary), Share, Download buttons
- Dark/Light mode toggle
- Menu dropdown

---

### 2. CENTER CANVAS - Flow Editor
```
┌──────────────────────────────┐
│  Grid-Based Canvas           │
│                              │
│  ┌─────────┐  Connected  ┌──┐
│  │  EC2    │──────→───────│S3│
│  │Instance │              └──┘
│  └─────────┘
│       ↕ Auto-connects
│  ┌──────────┐
│  │   RDS    │
│  │ Database │
│  └──────────┘
│                              │
│  (Infinite, grid-based)      │
└──────────────────────────────┘
```

**Features**:
- Infinite drag-drop canvas
- Node connections
- Real-time code sync
- Mini-map
- Zoom/Pan controls
- Snap-to-grid

---

### 3. RIGHT PANEL - Properties
```
┌──────────────────────┐
│ Properties           │
├──────────────────────┤
│ ▼ General Settings   │
│   Name: my-ec2       │
│   Env: Production    │
│   Type: t3.medium    │
│                      │
│ ▼ Security & Access  │
│   ⚠️ SSH unrestricted│
│   ✅ Encryption OK   │
│                      │
│ ▼ Performance        │
│   ☑️ CloudWatch      │
│   ☑️ Detailed Logs   │
│                      │
│ [Duplicate] [Delete] │
└──────────────────────┘
```

**Features**:
- Resource configuration
- Security warnings
- Performance toggles
- Collapsible sections
- Action buttons

---

### 4. BOTTOM PANEL - Code Editor
```
┌────────────────────────────────────────────────────┐
│ Infrastructure as Code                             │
│ [Terraform] [CloudFormation] [JSON]               │
│ [Copy] [Download] [Format] [Apply]                │
├────────────────────────────────────────────────────┤
│ resource "aws_vpc" "main" {                       │
│   cidr_block = "10.0.0.0/16"                      │
│   ...                                             │
│ }                                                 │
│                                                  │
│ main.tf • Terraform • 1.2 KB  [Format] [Apply]  │
└────────────────────────────────────────────────────┘
```

**Features**:
- Multi-language support
- Code display
- Copy/Download
- Language tabs
- File info

---

### 5. AI ASSISTANT - Left Sliding Panel (Toggleable)
```
┌──────────────────────┐
│ AI Assistant    [✕]  │
├──────────────────────┤
│                      │
│ 💬 Hi! I'll help    │
│    design your       │
│    infrastructure!   │
│                      │
│ + Create VPC with    │
│   2 public subnets   │
│                      │
│ + Set up load        │
│   balanced web app   │
│                      │
│ ...                  │
│                      │
│ [Type prompt...]     │
│ [Send →]             │
│                      │
└──────────────────────┘
```

**Features**:
- Chat interface
- Message history
- Suggested prompts
- AI generation
- Typing indicator

---

## Color Scheme

### Dark Mode (Default)
```
┌─────────────────────────────────────────┐
│ Background: #030712 (Deep Navy)         │
│ Surface: #111827 (Dark Gray-900)        │
│ Borders: #1F2937 (Gray-800)             │
│ Text: #F3F4F6 (Light Gray)              │
│                                         │
│ Accent Colors:                          │
│ Primary Blue: #3B82F6                   │
│ Success Green: #10B981                  │
│ Warning Amber: #F59E0B                  │
│ Error Red: #EF4444                      │
│ Info Cyan: #06B6D4                      │
│                                         │
│ Service Colors:                         │
│ 🔶 Compute: #FB923C (Orange)           │
│ 🟢 Storage: #34D399 (Green)            │
│ 🔴 Database: #F87171 (Red)             │
│ 🔵 Network: #60A5FA (Blue)             │
│ 🟣 Security: #C084FC (Purple)          │
│ 🟡 Monitor: #FBBF24 (Amber)            │
└─────────────────────────────────────────┘
```

### Light Mode
```
┌─────────────────────────────────────────┐
│ Background: #FFFFFF (White)             │
│ Surface: #F9FAFB (Gray-50)              │
│ Borders: #E5E7EB (Gray-200)             │
│ Text: #111827 (Dark Gray)               │
│                                         │
│ Accent Colors: (Same as dark mode)      │
│ Primary Blue: #3B82F6                   │
│ Success Green: #10B981                  │
│ Warning Amber: #F59E0B                  │
│ Error Red: #EF4444                      │
│ Info Cyan: #06B6D4                      │
└─────────────────────────────────────────┘
```

---

## Interaction Flows

### Adding a Resource
```
1. User clicks EC2 in Sidebar
   ↓
2. User drags to Canvas
   ↓
3. Node appears at cursor
   ↓
4. Properties Panel opens on right
   ↓
5. User configures in Properties
   ↓
6. Code updates automatically
   ↓
7. User connects to other resources
   ↓
8. Code reflects new connections
```

### Using AI Assistant
```
1. User clicks AI Assistant button
   ↓
2. Chat panel slides in
   ↓
3. User types prompt: "Create VPC with 2 subnets"
   ↓
4. AI thinks... (loading spinner)
   ↓
5. Infrastructure appears on canvas
   ↓
6. Code updates in editor
   ↓
7. User can refine or deploy
```

### Deploying Infrastructure
```
1. User clicks Deploy button
   ↓
2. Status changes to "Deploying" (blue spinning)
   ↓
3. Code is sent to backend
   ↓
4. Resources are created in AWS
   ↓
5. Status changes to "Success" (green check)
   ↓
6. Deployment panel shows details
```

---

## Responsive Breakpoints

### Mobile (< 640px)
```
┌─────────────┐
│   NAVBAR    │
├─────────────┤
│   CANVAS    │
│ (full width)│
│             │
├─────────────┤
│  CODE EDITOR│ (collapsible)
│ (bottom)    │
└─────────────┘

Sidebar: Hidden/Drawer
Properties: Hidden/Modal
AI: Hidden/Modal
```

### Tablet (640px - 1024px)
```
┌────────────────────────────┐
│   NAVBAR                   │
├─────────────┬──────────────┤
│ SIDEBAR     │   CANVAS     │
│ (collapsed) │              │
│             ├──────────────┤
│             │ CODE EDITOR  │
└─────────────┴──────────────┘

Properties: Hidden/Modal
AI: Floating/Toggleable
```

### Desktop (> 1024px)
```
┌──────────────────────────────────────────────────┐
│   NAVBAR                                         │
├──────────┬─────────────────────────────┬─────────┤
│ SIDEBAR  │        CANVAS               │ PROPS   │
│          │                             │ PANEL   │
│          ├─────────────────────────────┤─────────┤
│          │      CODE EDITOR            │         │
└──────────┴─────────────────────────────┴─────────┘

AI: Floating/Toggleable
All panels visible
```

---

## Animation & Transitions

### Smooth Transitions
- Panel slide-in/out: 300ms
- Color changes: 200ms
- Hover effects: 200ms
- Icon animations: 500ms
- Loading spinner: continuous

### Hover Effects
```
Button:
Default → Hover (color shift, shadow)
  ↓
Active (scale down 95%)

Card:
Default → Hover (background change)
  ↓
Shadow increase

Icon:
Default → Hover (color shift, slight rotation)
```

---

## Accessibility Features

### Visual Accessibility
- ✅ WCAG AA contrast (4.5:1 for text)
- ✅ Readable font sizes
- ✅ Color + icons for information
- ✅ Focus indicators visible
- ✅ High contrast in dark mode

### Keyboard Navigation
- ✅ Tab through all interactive elements
- ✅ Enter to activate buttons
- ✅ Space for checkboxes
- ✅ Arrow keys for dropdowns
- ✅ Escape to close modals

### Screen Reader
- ✅ ARIA labels
- ✅ Semantic HTML
- ✅ Proper heading hierarchy
- ✅ Alternative text for icons
- ✅ Status announcements

---

## Security Indicators

### Status Badges
```
✅ Success: Green (#10B981)
   "Infrastructure deployed"

🔄 Deploying: Blue (#3B82F6) + spinning
   "Applying changes..."

⚠️ Warning: Amber (#F59E0B)
   "Configuration needs review"

❌ Error: Red (#EF4444)
   "Deployment failed"

ℹ️ Info: Cyan (#06B6D4)
   "Additional information"
```

### Security Badges
```
🔒 Encryption: Green badge
   "Encrypted at rest"

🚨 Critical Issue: Red with icon
   "Unrestricted SSH access"

⚠️ Warning: Amber with icon
   "Missing logging configuration"

ℹ️ Info: Blue with icon
   "Consider enabling feature"
```

---

## Typography Scale

```
H1: 32px Bold     (Page titles)
H2: 24px Bold     (Section titles)
H3: 18px Semibold (Subsection titles)
Body: 16px Regular (Content)
Small: 14px Medium (Labels)
Tiny: 12px Medium  (Metadata)
Mono: 14px Regular (Code)
```

---

## Spacing Scale

```
4px   (xs) - Small gaps, icon spacing
8px   (sm) - Element spacing
12px  (md) - Section spacing
16px  (lg) - Major spacing
24px  (xl) - Large spacing
32px  (2xl) - Huge spacing
48px  (3xl) - Very large spacing
64px  (4xl) - Massive spacing
```

---

## Shadow Scale

```
sm:  0 1px 2px rgba(0,0,0,0.05)
md:  0 4px 6px rgba(0,0,0,0.1)
lg:  0 10px 15px rgba(0,0,0,0.1)
xl:  0 20px 25px rgba(0,0,0,0.1)
2xl: 0 25px 50px rgba(0,0,0,0.25)
glow: 0 0 20px rgba(59,130,246,0.2)
```

---

## Component Library Icons

All icons from **Lucide React** (20+ used):

```
Navigation: Menu, MoreVertical, ChevronDown
Actions: Save, Download, Copy, Trash, Plus
Status: Check, AlertCircle, AlertTriangle, Zap
UI: Sun, Moon, X, Settings, Eye, EyeOff
Features: Share, MessageCircle, Sparkles, Lock, Play, FileText
```

---

**Design System Version**: 1.0.0
**Last Updated**: January 5, 2026
**Status**: Production Ready ✅
